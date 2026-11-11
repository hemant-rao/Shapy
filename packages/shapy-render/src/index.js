import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodeFrames, ffmpegSupportsDecoder, findFfmpeg } from './ffmpeg.js';
import { posterType, positiveInteger, positiveNumber, resolveFormat } from './options.js';

const require = createRequire(import.meta.url);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function resolveShapyDir() {
  try {
    return dirname(require.resolve('shapy-bg/package.json'));
  } catch {
    const fallback = fileURLToPath(new URL('../../shapy-bg', import.meta.url));
    if (existsSync(join(fallback, 'package.json'))) return fallback;
    throw new Error('shapy-render needs the shapy-bg package installed in the same project.');
  }
}

function pageHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
  shapy-background { position: fixed; inset: 0; display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
<shapy-background aria-hidden="true"></shapy-background>
<script type="module">
  import { SHAPY_ENGINE_VERSION } from '/shapy-bg/src/index.js';
  window.__SHAPY_ENGINE_VERSION__ = SHAPY_ENGINE_VERSION;
  window.__SHAPY_RENDER_READY__ = false;
  (async () => {
    await customElements.whenDefined('shapy-background');
    const element = document.querySelector('shapy-background');
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    window.__SHAPY_RENDER_ELEMENT__ = element;
    window.__SHAPY_RENDER_READY__ = true;
  })();
</script>
</body>
</html>`;
}

function createStaticServer(shapyDir, html) {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://127.0.0.1');
      if (url.pathname === '/' || url.pathname === '/index.html') {
        response.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' });
        response.end(html);
        return;
      }
      if (!url.pathname.startsWith('/shapy-bg/')) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }
      const relative = decodeURIComponent(url.pathname.slice('/shapy-bg/'.length));
      const target = resolve(shapyDir, relative);
      if (target !== shapyDir && !target.startsWith(`${shapyDir}${sep}`)) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
      }
      const data = await readFile(target);
      response.writeHead(200, {
        'content-type': MIME[extname(target).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-store'
      });
      response.end(data);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
}

function listen(server) {
  return new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
}

function closeServer(server) {
  return new Promise((resolveClose) => {
    if (!server) {
      resolveClose();
      return;
    }
    server.close(() => resolveClose());
  });
}

async function applyOptions(page, options, alpha) {
  return page.evaluate(async ({ next, transparent }) => {
    const element = window.__SHAPY_RENDER_ELEMENT__;
    element.setOptions({
      ...next,
      live: false,
      paused: false,
      time: null,
      aspect: 'auto',
      ...(transparent ? { background: 'transparent' } : {})
    });

    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    if (transparent && !element.shadowRoot.querySelector('#shapy-render-alpha')) {
      const style = document.createElement('style');
      style.id = 'shapy-render-alpha';
      style.textContent = '.app { background: transparent !important; } .bg, .scrim, .grain { display: none !important; }';
      element.shadowRoot.appendChild(style);
    }

    const images = [...element.shadowRoot.querySelectorAll('img')];
    await Promise.all(images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        const done = () => resolve();
        image.addEventListener('load', done, { once: true });
        image.addEventListener('error', done, { once: true });
        setTimeout(done, 5000);
      });
    }));

    await element.seek(0);
    const snapshot = element.getOptions();
    return {
      seed: snapshot.seed,
      options: snapshot,
      engineVersion: window.__SHAPY_ENGINE_VERSION__
    };
  }, { next: options, transparent: alpha });
}

async function capture(page, alpha, frameExt) {
  const jpeg = frameExt === 'jpg';
  return page.screenshot({
    type: jpeg ? 'jpeg' : 'png',
    ...(jpeg ? { quality: 95 } : {}),
    omitBackground: alpha,
    animations: 'allow',
    caret: 'hide'
  });
}

async function seek(page, seconds) {
  await page.evaluate(async (time) => {
    await window.__SHAPY_RENDER_ELEMENT__.seek(time);
  }, seconds);
}

/**
 * Render a Shapy background to MP4, WebM, or a PNG sequence.
 */
export async function render(input = {}) {
  const {
    output,
    format: requestedFormat,
    width: requestedWidth = 1080,
    height: requestedHeight = 1920,
    fps: requestedFps = 30,
    duration: requestedDuration = 8,
    dpr: requestedDpr = 1,
    alpha = false,
    options = {},
    poster = '',
    posterTime = 0,
    crf = 20,
    loop,
    ffmpeg: requestedFfmpeg = '',
    keepFrames = false,
    onProgress
  } = input;

  if (!output || typeof output !== 'string') {
    throw new Error('output is required');
  }

  const format = resolveFormat(requestedFormat, output);
  const width = positiveInteger(requestedWidth, 1080, 'width', 16, 8192);
  const height = positiveInteger(requestedHeight, 1920, 'height', 16, 8192);
  const fps = positiveNumber(requestedFps, 30, 'fps', 1, 120);
  const duration = positiveNumber(requestedDuration, 8, 'duration', 0.01, 3600);
  const dpr = positiveNumber(requestedDpr, 1, 'dpr', 0.5, 4);
  const quality = positiveNumber(crf, 20, 'crf', 0, 51);
  const posterAt = positiveNumber(posterTime, 0, 'posterTime', 0, 86400);
  const posterFormat = poster ? posterType(poster) : '';
  const frameCount = Math.max(1, Math.round(duration * fps));

  if (alpha && format === 'mp4') {
    throw new Error('MP4 does not support alpha. Use --format webm or --format png.');
  }
  if (poster && alpha && posterFormat === 'jpeg') {
    throw new Error('Alpha posters must be PNG.');
  }
  if (loop !== undefined && loop !== null) {
    const loopValue = Number(loop);
    if (!Number.isFinite(loopValue) || loopValue <= 0) {
      throw new Error('loop must be a positive number of seconds');
    }
  }

  let server;
  let browser;
  let framesDir = '';
  let removeFrames = false;

  try {
    let chromium;
    try {
      ({ chromium } = await import('playwright'));
    } catch {
      throw new Error('shapy-render needs playwright. Install it with: npm install playwright');
    }

    const ffmpeg = format === 'mp4' || format === 'webm'
      ? findFfmpeg({
          ffmpeg: requestedFfmpeg,
          executablePath: chromium.executablePath(),
          format
        })
      : '';

    let frameExt = 'png';
    if (ffmpeg) {
      if (alpha && !ffmpegSupportsDecoder(ffmpeg, 'png')) {
        throw new Error(
          'Alpha WebM needs ffmpeg with PNG decoding. Install a full ffmpeg or use --format png.'
        );
      }
      if (!alpha && !ffmpegSupportsDecoder(ffmpeg, 'png')) {
        if (!ffmpegSupportsDecoder(ffmpeg, 'mjpeg')) {
          throw new Error('ffmpeg cannot decode PNG or JPEG input frames.');
        }
        frameExt = 'jpg';
      }
    }

    const shapyDir = resolveShapyDir();
    server = createStaticServer(shapyDir, pageHtml());
    await listen(server);
    const address = server.address();
    const port = address && typeof address === 'object' ? address.port : 0;

    try {
      browser = await chromium.launch({
        headless: true,
        args: [
          '--force-color-profile=srgb',
          '--disable-lcd-text',
          '--font-render-hinting=none',
          '--hide-scrollbars'
        ]
      });
    } catch (error) {
      throw new Error(
        `Could not launch Chromium. Run "npx playwright install chromium" and try again.\n${error.message}`
      );
    }

    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: dpr,
      colorScheme: 'dark',
      reducedMotion: 'no-preference'
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') pageErrors.push(message.text());
    });

    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
    try {
      await page.waitForFunction(() => window.__SHAPY_RENDER_READY__ === true, undefined, { timeout: 20000 });
    } catch {
      throw new Error(
        `Shapy did not initialize in the browser.${pageErrors.length ? `\n${pageErrors.join('\n')}` : ''}`
      );
    }

    const applied = await applyOptions(
      page,
      loop === undefined || loop === null ? options : { ...options, loop },
      alpha
    );
    const actualWidth = Math.round(width * dpr);
    const actualHeight = Math.round(height * dpr);

    if (format === 'png') {
      framesDir = resolve(output);
      await mkdir(framesDir, { recursive: true });
    } else {
      framesDir = await mkdtemp(join(tmpdir(), 'shapy-render-'));
      removeFrames = true;
    }

    for (let index = 0; index < frameCount; index += 1) {
      const time = index / fps;
      await seek(page, time);
      const buffer = await capture(page, alpha, frameExt);
      const file = join(framesDir, `frame-${String(index + 1).padStart(6, '0')}.${frameExt}`);
      await writeFile(file, buffer);
      if (onProgress) {
        onProgress({ phase: 'frames', frame: index + 1, total: frameCount, time });
      }
    }

    if (poster) {
      await seek(page, posterAt);
      await mkdir(dirname(resolve(poster)), { recursive: true });
      const buffer = await page.screenshot({
        type: posterFormat,
        omitBackground: alpha,
        animations: 'allow',
        caret: 'hide',
        ...(posterFormat === 'jpeg' ? { quality: 92 } : {})
      });
      await writeFile(resolve(poster), buffer);
      if (onProgress) onProgress({ phase: 'poster', message: poster });
    }

    if (format !== 'png') {
      await mkdir(dirname(resolve(output)), { recursive: true });
      if (onProgress) onProgress({ phase: 'encode', message: format });
      await encodeFrames({
        ffmpeg,
        format,
        framesDir,
        frameExt,
        frames: frameCount,
        output: resolve(output),
        fps,
        width: actualWidth,
        height: actualHeight,
        alpha,
        crf: quality
      });
    }

    return {
      output: resolve(output),
      format,
      seed: applied.seed,
      engineVersion: applied.engineVersion,
      width: actualWidth,
      height: actualHeight,
      fps,
      duration: frameCount / fps,
      frames: frameCount,
      poster: poster ? resolve(poster) : undefined,
      ffmpeg: ffmpeg || undefined,
      framesDir: keepFrames ? framesDir : undefined
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
    await closeServer(server);
    if (removeFrames && framesDir && !keepFrames) {
      await rm(framesDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
