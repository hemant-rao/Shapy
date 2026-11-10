import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { render } from '../packages/shapy-render/src/index.js';
import { resolveFormat } from '../packages/shapy-render/src/options.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(root, 'packages/shapy-render/bin/shapy-render.js');
const packageJson = JSON.parse(readFileSync(join(root, 'packages/shapy-render/package.json'), 'utf8'));

test('render format is inferred from the output extension', () => {
  assert.equal(resolveFormat(undefined, 'reel.mp4'), 'mp4');
  assert.equal(resolveFormat(undefined, 'reel.webm'), 'webm');
  assert.equal(resolveFormat(undefined, 'frames.png'), 'png');
  assert.equal(resolveFormat(undefined, 'FRAMES.WEBM'), 'webm');
  assert.equal(resolveFormat(undefined, 'frames'), 'mp4');
  assert.equal(resolveFormat('PNG', 'reel.mp4'), 'png');
  assert.throws(() => resolveFormat('gif', 'reel.gif'), /format must be mp4, webm, or png/);
});

test('invalid render options are rejected before a browser launches', async () => {
  const base = {
    output: 'frames',
    format: 'png',
    width: 64,
    height: 64,
    fps: 10,
    duration: 0.1
  };

  await assert.rejects(render({ ...base, output: undefined }), /output is required/);
  await assert.rejects(render({ ...base, format: 'gif' }), /format must be mp4, webm, or png/);
  await assert.rejects(render({ ...base, format: 'mp4', alpha: true }), /MP4 does not support alpha/);
  await assert.rejects(
    render({ ...base, alpha: true, poster: 'poster.jpg' }),
    /Alpha posters must be PNG/
  );
  await assert.rejects(render({ ...base, poster: 'poster.gif' }), /poster must end in \.png/);
  await assert.rejects(render({ ...base, width: 0 }), /width must be an integer from 16 to 8192/);
  await assert.rejects(render({ ...base, height: 8193 }), /height must be an integer from 16 to 8192/);
  await assert.rejects(render({ ...base, fps: 0 }), /fps must be a number from 1 to 120/);
  await assert.rejects(render({ ...base, fps: 121 }), /fps must be a number from 1 to 120/);
  await assert.rejects(render({ ...base, duration: 0 }), /duration must be a number/);
  await assert.rejects(render({ ...base, loop: 0 }), /loop must be a positive number of seconds/);
  await assert.rejects(render({ ...base, loop: -2 }), /loop must be a positive number of seconds/);
});

test('CLI prints help and version', () => {
  const help = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Usage:\n  shapy-render/);
  assert.match(help.stdout, /--poster/);

  const version = spawnSync(process.execPath, [cli, '--version'], { encoding: 'utf8' });
  assert.equal(version.status, 0);
  assert.equal(version.stdout.trim(), packageJson.version);
});

test('CLI rejects an unknown flag', () => {
  const result = spawnSync(process.execPath, [cli, '--not-a-flag'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unknown option: --not-a-flag/);
});

test('CLI rejects malformed values before rendering', () => {
  const cases = [
    [['--output'], /--output needs a value/],
    [['--options', 'not-json'], /--options expects a JSON object/],
    [['--option', 'seed'], /--option expects key=value/],
    [['--format', 'gif', '--output', 'clip.gif'], /format must be mp4, webm, or png/],
    [['--alpha', '--output', 'clip.mp4'], /MP4 does not support alpha/],
    [['--poster', 'poster.gif', '--output', 'clip.mp4'], /poster must end in \.png/]
  ];

  for (const [args, message] of cases) {
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
    assert.equal(result.status, 1, args.join(' '));
    assert.match(result.stderr, message, args.join(' '));
  }
});
