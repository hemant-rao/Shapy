import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { render } from '../packages/shapy-render/src/index.js';

const enabled = process.env.SHAPY_RENDER_E2E === '1';

test(
  'render captures a seamless loop, WebM, alpha PNG, and poster',
  { skip: enabled ? false : 'set SHAPY_RENDER_E2E=1 to run the render E2E test' },
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
      assert.equal(framesResult.engineVersion, 1);
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
      assert.equal(videoResult.engineVersion, 1);
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
