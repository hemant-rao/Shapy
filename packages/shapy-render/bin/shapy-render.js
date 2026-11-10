#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { render } from '../src/index.js';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const HELP = `shapy-render ${packageJson.version}

Export a Shapy background to MP4, WebM, or a PNG sequence.

Usage:
  shapy-render --output reel.mp4 [options]
  shapy-render --format png --output frames [options]

Output:
  --output <path>       File for video, directory for PNG frames.
  --format <format>     mp4, webm, or png. Inferred from --output.
  --width <px>          Capture width. Default: 1080.
  --height <px>         Capture height. Default: 1920.
  --fps <number>        Frames per second. Default: 30.
  --duration <seconds>  Clip length. Default: 8.
  --dpr <number>        Device pixel ratio. Default: 1.
  --alpha               Transparent background. WebM/PNG only.
  --poster <path>       Also write a still (.png, .jpg, .jpeg).
  --poster-time <sec>   Poster timeline position. Default: 0.
  --crf <number>        Quality (0-51, lower is better). Default: 20.
  --loop <seconds>      Seamless loop period passed to Shapy.
  --ffmpeg <path>       Use a specific ffmpeg executable.
  --keep-frames         Keep captured image frames after encoding.

Shapy:
  --seed <string>       Seed. A fresh seed is generated when omitted.
  --palette <name>      midnight, sandstone, bauhaus, forest, plum,
                        ocean, clay, or mono.
  --shape-set <name>    all, geometry, lines, organic, emoji, stickers,
                        or custom.
  --shapes <list>       Comma-separated keys for shape-set="custom".
  --layout <name>       auto, scatter, grid, rows, columns, center, edges.
  --align <name>        random, left, center, right, top, middle, bottom.
  --size-mode <name>    mixed, same, subtle, dramatic, small, medium, large.
  --motion <name>       mixed, chaos, flow, bounce, drift, spin, pulse,
                        wobble, orbit, calm.
  --direction <name>    random, lr, rl, tb, bt, dr, dl, ur, ul, alternate.
  --density <number>    20-100.
  --scale <number>      60-140.
  --speed <number>      50-200.
  --move <number>       30-200.
  --background <color>  Background color.
  --custom-colors <list> Comma-separated palette overrides.
  --safe-zones <list>   tiktok, reels, shorts, story, or a JSON array.
  --safe-area           Keep shapes behind the text overlay clear.
  --option key=value    Any other Shapy option. Repeatable.
  --options <json>      JSON object of Shapy options. Merged last.
  --help                Show this help.
  --version             Print the version.
`;

function fail(message) {
  console.error(`shapy-render: ${message}`);
  console.error('Run shapy-render --help for usage.');
  process.exit(1);
}

function parseValue(value) {
  const text = String(value).trim();
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

const VALUE_FLAGS = new Set([
  'output', 'format', 'width', 'height', 'fps', 'duration', 'dpr',
  'poster', 'poster-time', 'crf', 'loop', 'ffmpeg',
  'seed', 'palette', 'shape-set', 'shapes', 'layout', 'align', 'size-mode',
  'motion', 'direction', 'density', 'scale', 'speed', 'move', 'background',
  'custom-colors', 'safe-zones', 'option', 'options'
]);

const BOOLEAN_FLAGS = new Set(['alpha', 'keep-frames', 'safe-area', 'help', 'version']);

const args = process.argv.slice(2);
const flags = {};
const extraOptions = {};

for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (!argument.startsWith('--')) fail(`unexpected argument: ${argument}`);

  const equals = argument.indexOf('=');
  const name = argument.slice(2, equals === -1 ? undefined : equals);
  let value = equals === -1 ? undefined : argument.slice(equals + 1);

  if (BOOLEAN_FLAGS.has(name)) {
    if (value !== undefined) fail(`--${name} does not take a value`);
    flags[name] = true;
    continue;
  }
  if (!VALUE_FLAGS.has(name)) fail(`unknown option: --${name}`);

  if (value === undefined) {
    index += 1;
    value = args[index];
    if (value === undefined) fail(`--${name} needs a value`);
  }

  if (name === 'option') {
    const split = value.indexOf('=');
    if (split < 1) fail('--option expects key=value');
    extraOptions[value.slice(0, split)] = parseValue(value.slice(split + 1));
  } else if (name === 'options') {
    let parsed;
    try {
      parsed = JSON.parse(value);
    } catch {
      fail('--options expects a JSON object');
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      fail('--options expects a JSON object');
    }
    Object.assign(extraOptions, parsed);
  } else {
    flags[name] = value;
  }
}

if (flags.help) {
  console.log(HELP);
  process.exit(0);
}
if (flags.version) {
  console.log(packageJson.version);
  process.exit(0);
}

const format = flags.format ? String(flags.format).toLowerCase() : '';
let output = flags.output;
if (!output) {
  output = format === 'png' ? 'shapy-render-frames' : `shapy-render.${format || 'mp4'}`;
}

const options = { ...extraOptions };
for (const key of [
  'seed', 'palette', 'shape-set', 'shapes', 'layout', 'align', 'size-mode',
  'motion', 'direction', 'density', 'scale', 'speed', 'move', 'background',
  'custom-colors', 'safe-zones'
]) {
  if (flags[key] !== undefined) options[key] = parseValue(flags[key]);
}
if (flags['safe-area']) options.safeArea = true;

let lastProgress = -1;
const onProgress = (progress) => {
  if (progress.phase === 'frames' && progress.total) {
    const percent = Math.floor((progress.frame / progress.total) * 10) * 10;
    if (percent !== lastProgress) {
      lastProgress = percent;
      process.stderr.write(`Captured ${progress.frame}/${progress.total} frames (${percent}%)\n`);
    }
  } else if (progress.phase === 'encode') {
    process.stderr.write(`Encoding ${progress.message}...\n`);
  } else if (progress.phase === 'poster') {
    process.stderr.write('Writing poster...\n');
  }
};

try {
  const result = await render({
    output,
    format: format || undefined,
    width: flags.width,
    height: flags.height,
    fps: flags.fps,
    duration: flags.duration,
    dpr: flags.dpr,
    alpha: Boolean(flags.alpha),
    poster: flags.poster,
    posterTime: flags['poster-time'],
    crf: flags.crf,
    loop: flags.loop,
    ffmpeg: flags.ffmpeg,
    keepFrames: Boolean(flags['keep-frames']),
    options,
    onProgress
  });

  console.log(`Rendered ${result.frames} frames at ${result.width}x${result.height}, ${result.fps} fps (${result.duration.toFixed(2)}s)`);
  console.log(`Seed: ${result.seed}`);
  console.log(`Wrote ${result.output}`);
  if (result.poster) console.log(`Poster: ${result.poster}`);
  if (result.framesDir) console.log(`Frames: ${result.framesDir}`);
  if (result.ffmpeg) console.log(`ffmpeg: ${result.ffmpeg}`);
} catch (error) {
  fail(error.message);
}
