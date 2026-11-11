import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { SHAPY_ENGINE_VERSION } from '../packages/shapy-bg/src/index.js';
import { ffmpegSupportsDecoder, findFfmpeg } from '../packages/shapy-render/src/ffmpeg.js';
import { render } from '../packages/shapy-render/src/index.js';

const enabled = process.env.SHAPY_RENDER_E2E === '1';
const skip = enabled ? false : 'set SHAPY_RENDER_E2E=1 to run the render E2E test';

function framePath(directory, index) {
  return join(directory, `frame-${String(index).padStart(6, '0')}.png`);
}

async function captureFrames(directory, name, { loop, fps, duration, options }) {
  const output = join(directory, name);
  const result = await render({
    output,
    format: 'png',
    width: 320,
    height: 568,
    fps,
    duration,
    loop,
    options
  });
  const files = await readdir(output);
  assert.equal(files.length, result.frames, `${name}: written frames must match result.frames`);
  return { output, frames: result.frames };
}

async function assertSeam({ output, frames }, seamFrame, label) {
  assert.ok(seamFrame <= frames, `${label}: seam frame ${seamFrame} was not captured`);
  const first = await readFile(framePath(output, 1));
  const boundary = await readFile(framePath(output, seamFrame));
  assert.deepEqual(boundary, first, `${label}: the frame at the loop period must match the loop start`);
}

function usableFfmpeg(format, decoder = '') {
  try {
    const ffmpeg = findFfmpeg({ format });
    if (decoder && !ffmpegSupportsDecoder(ffmpeg, decoder)) return '';
    return ffmpeg;
  } catch {
    return '';
  }
}

test(
  'render captures a seamless loop, WebM, alpha PNG, and poster',
  { skip },
  async () => {
    const directory = await mkdtemp(join(tmpdir(), 'shapy-render-e2e-'));

    try {
      const framesDir = join(directory, 'frames');
      const framesResult = await render({
        output: framesDir,
        format: 'png',
        width: 320,
        height: 568,
        duration: 2,
        fps: 6,
        loop: 1,
        options: { seed: 'render-e2e', palette: 'ocean' }
      });

      assert.equal(framesResult.format, 'png');
      assert.equal(framesResult.engineVersion, SHAPY_ENGINE_VERSION);
      assert.equal(framesResult.frames, 12);
      assert.equal((await readdir(framesDir)).length, 12);

      const first = await readFile(join(framesDir, 'frame-000001.png'));
      const boundary = await readFile(join(framesDir, 'frame-000007.png'));
      assert.deepEqual(boundary, first, 'frame at t=1s must match the loop start');

      const video = join(directory, 'clip.webm');
      const videoResult = await render({
        output: video,
        format: 'webm',
        width: 320,
        height: 568,
        duration: 0.5,
        fps: 6,
        options: { seed: 'render-e2e', palette: 'ocean' }
      });

      assert.equal(videoResult.format, 'webm');
      assert.equal(videoResult.engineVersion, SHAPY_ENGINE_VERSION);
      assert.ok((await stat(video)).size > 0, 'WebM output must not be empty');

      const alphaDir = join(directory, 'alpha-frames');
      const poster = join(directory, 'poster.png');
      const alphaResult = await render({
        output: alphaDir,
        format: 'png',
        width: 64,
        height: 64,
        duration: 0.2,
        fps: 5,
        alpha: true,
        poster,
        posterTime: 0.1,
        options: { seed: 'render-e2e-alpha', palette: 'plum' }
      });

      assert.equal(alphaResult.poster, poster);
      const png = await readFile(join(alphaDir, 'frame-000001.png'));
      assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      assert.equal(png[25], 6, 'alpha captures must be RGBA PNG');

      const posterPng = await readFile(poster);
      assert.equal(posterPng.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      assert.ok((await stat(poster)).size > 0, 'poster must not be empty');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
);

test(
  'loop mode closes exactly at high speed and after compositor seeks',
  { skip },
  async () => {
    const directory = await mkdtemp(join(tmpdir(), 'shapy-loop-e2e-'));

    try {
      // loop=10 at speed=200 quantizes to 10/6 = 1.666...s. Rounding that
      // duration to two decimals leaves 5.99 cycles across the period.
      const fast = await captureFrames(directory, 'loop-speed', {
        loop: 10,
        fps: 5,
        duration: 10.2,
        options: { seed: 'verify-01', palette: 'ocean', speed: 200 }
      });
      await assertSeam(fast, 51, 'loop=10 speed=200');

      // Seeds that leave a shape at the viewport edge used to expose a stale
      // compositor layer when seek() paused the animation.
      const edge = await captureFrames(directory, 'loop-compositor', {
        loop: 1,
        fps: 5,
        duration: 1.2,
        options: { seed: 'verify-01', palette: 'ocean' }
      });
      await assertSeam(edge, 6, 'loop=1 compositor');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
);

test(
  'render writes an MP4 when ffmpeg provides libx264',
  { skip },
  async (t) => {
    const ffmpeg = usableFfmpeg('mp4');
    if (!ffmpeg) {
      t.skip('no ffmpeg with libx264 is available');
      return;
    }

    const directory = await mkdtemp(join(tmpdir(), 'shapy-mp4-e2e-'));

    try {
      const output = join(directory, 'clip.mp4');
      const result = await render({
        output,
        width: 64,
        height: 64,
        fps: 5,
        duration: 0.4,
        ffmpeg,
        options: { seed: 'render-e2e-mp4', palette: 'forest' }
      });

      assert.equal(result.format, 'mp4');
      assert.equal(result.engineVersion, SHAPY_ENGINE_VERSION);
      const bytes = await readFile(output);
      assert.ok(bytes.length > 0, 'MP4 output must not be empty');
      assert.equal(bytes.subarray(4, 8).toString('ascii'), 'ftyp', 'MP4 output must contain an ftyp box');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
);

test(
  'render writes an alpha WebM when ffmpeg provides libvpx-vp9 and PNG input',
  { skip },
  async (t) => {
    const ffmpeg = usableFfmpeg('webm', 'png');
    if (!ffmpeg) {
      t.skip('no ffmpeg with libvpx-vp9 and PNG decoding is available');
      return;
    }

    const directory = await mkdtemp(join(tmpdir(), 'shapy-alpha-e2e-'));

    try {
      const output = join(directory, 'alpha.webm');
      const result = await render({
        output,
        width: 64,
        height: 64,
        fps: 5,
        duration: 0.2,
        alpha: true,
        ffmpeg,
        options: { seed: 'render-e2e-alpha-webm', palette: 'plum' }
      });

      assert.equal(result.format, 'webm');
      assert.equal(result.engineVersion, SHAPY_ENGINE_VERSION);
      const bytes = await readFile(output);
      assert.ok(bytes.length > 0, 'alpha WebM output must not be empty');
      assert.equal(bytes.subarray(0, 4).toString('hex'), '1a45dfa3', 'WebM output must start with an EBML header');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
);
