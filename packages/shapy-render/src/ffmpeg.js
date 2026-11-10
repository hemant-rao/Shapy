import { spawn, spawnSync } from 'node:child_process';
import { createReadStream, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const encoderCache = new Map();

function binaryIn(directory, depth = 2) {
  if (!existsSync(directory)) return '';
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isFile()) {
      const name = entry.name.toLowerCase();
      if (name.startsWith('ffmpeg') && !name.endsWith('.dll') && !name.endsWith('.so')) {
        return full;
      }
    } else if (entry.isDirectory() && depth > 0) {
      const found = binaryIn(full, depth - 1);
      if (found) return found;
    }
  }
  return '';
}

function bundledCandidates(executablePath) {
  if (!executablePath) return [];
  // Playwright stores browsers as <browsers>/<browser-version>/<platform>/...
  const root = dirname(dirname(dirname(executablePath)));
  if (!existsSync(root)) return [];
  const found = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('ffmpeg-')) continue;
    const binary = binaryIn(join(root, entry.name));
    if (binary) found.push(binary);
  }
  return found;
}

function systemFfmpeg() {
  const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore', windowsHide: true });
  return !probe.error && probe.status === 0 ? 'ffmpeg' : '';
}

export function ffmpegSupports(executable, encoder) {
  let text = encoderCache.get(executable);
  if (text === undefined) {
    const probe = spawnSync(executable, ['-hide_banner', '-encoders'], {
      encoding: 'utf8',
      windowsHide: true
    });
    text = probe.status === 0 ? `${probe.stdout || ''}\n${probe.stderr || ''}` : '';
    encoderCache.set(executable, text);
  }
  return new RegExp(`\\b${encoder}\\b`).test(text);
}

export function ffmpegSupportsDecoder(executable, decoder) {
  const key = `decoders:${executable}`;
  let text = encoderCache.get(key);
  if (text === undefined) {
    const probe = spawnSync(executable, ['-hide_banner', '-decoders'], {
      encoding: 'utf8',
      windowsHide: true
    });
    text = probe.status === 0 ? `${probe.stdout || ''}\n${probe.stderr || ''}` : '';
    encoderCache.set(key, text);
  }
  return new RegExp(`\\b${decoder}\\b`).test(text);
}

/**
 * Find an ffmpeg binary. MP4 requires libx264; WebM requires libvpx-vp9.
 * An explicit path or SHAPY_FFMPEG wins over discovery.
 */
export function findFfmpeg({ ffmpeg, executablePath, format }) {
  const encoder = format === 'mp4' ? 'libx264' : 'libvpx-vp9';
  const explicit = ffmpeg || process.env.SHAPY_FFMPEG || '';
  if (explicit) {
    if (!ffmpegSupports(explicit, encoder)) {
      throw new Error(
        `${explicit} does not provide ${encoder}. ` +
          (format === 'mp4'
            ? 'Install ffmpeg with libx264 or use --format webm.'
            : 'Install ffmpeg with libvpx-vp9 or use --format png.')
      );
    }
    return explicit;
  }

  const candidates = [];
  const add = (path, source) => {
    if (path && !candidates.some((item) => item.path === path)) {
      candidates.push({ path, source });
    }
  };

  add(systemFfmpeg(), 'system PATH');
  for (const path of bundledCandidates(executablePath)) add(path, 'Playwright');

  for (const candidate of candidates) {
    if (ffmpegSupports(candidate.path, encoder)) return candidate.path;
  }

  const detail = candidates.length
    ? candidates.map((item) => `${item.path} (${item.source})`).join(', ')
    : 'none found';
  throw new Error(
    `No ffmpeg with ${encoder} found. Checked: ${detail}. ` +
      (format === 'mp4'
        ? 'Install ffmpeg with libx264, or use --format webm or --format png.'
        : 'Install ffmpeg with libvpx-vp9, or use --format png.')
  );
}

function oddDimensionFilter(width, height) {
  if (width % 2 === 0 && height % 2 === 0) return [];
  return ['-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2'];
}

function writeChunk(stream, chunk) {
  return new Promise((resolveWrite, rejectWrite) => {
    stream.write(chunk, (error) => (error ? rejectWrite(error) : resolveWrite()));
  });
}

export async function encodeFrames({
  ffmpeg,
  format,
  framesDir,
  frameExt = 'png',
  frames = 0,
  output,
  fps,
  width,
  height,
  alpha = false,
  crf = 20
}) {
  const args = [
    '-y',
    '-hide_banner',
    '-loglevel', 'error',
    '-f', 'image2pipe',
    '-vcodec', frameExt === 'jpg' ? 'mjpeg' : 'png',
    '-framerate', String(fps),
    '-i', 'pipe:0'
  ];

  if (format === 'mp4') {
    args.push(
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', String(Math.min(51, Math.max(0, crf))),
      ...oddDimensionFilter(width, height),
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      output
    );
  } else if (format === 'webm') {
    const vp9Crf = Math.round(Math.min(63, Math.max(0, (crf / 51) * 63)));
    args.push(
      '-c:v', 'libvpx-vp9',
      '-b:v', '0',
      '-crf', String(vp9Crf),
      '-row-mt', '1',
      ...(alpha ? ['-auto-alt-ref', '0'] : []),
      ...oddDimensionFilter(width, height),
      '-pix_fmt', alpha ? 'yuva420p' : 'yuv420p',
      output
    );
  } else {
    throw new Error(`encodeFrames does not encode ${format}`);
  }

  const child = spawn(ffmpeg, args, {
    windowsHide: true,
    stdio: ['pipe', 'ignore', 'pipe']
  });
  let stderr = '';
  let stdinError = null;
  child.stdin.on('error', (error) => {
    stdinError = error;
  });
  child.stderr.on('data', (chunk) => {
    stderr = `${stderr}${chunk}`.slice(-4000);
  });

  const closed = new Promise((resolveClose, rejectClose) => {
    child.on('error', rejectClose);
    child.on('close', (code) => {
      if (code === 0) resolveClose();
      else rejectClose(new Error(`ffmpeg exited with code ${code}\n${stderr.trim()}`));
    });
  });
  closed.catch(() => {});

  try {
    for (let index = 1; index <= frames; index += 1) {
      const file = join(framesDir, `frame-${String(index).padStart(6, '0')}.${frameExt}`);
      for await (const chunk of createReadStream(file)) {
        await writeChunk(child.stdin, chunk);
      }
    }
    child.stdin.end();
  } catch (error) {
    child.kill();
    const detail = await closed.catch((reason) => reason);
    throw new Error(
      `Failed to send frames to ffmpeg: ${error.message}` +
        (detail && detail.message ? `\n${detail.message}` : '')
    );
  }

  await closed;
}
