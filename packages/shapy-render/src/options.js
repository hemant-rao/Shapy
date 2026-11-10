import { extname } from 'node:path';

export const RENDER_FORMATS = new Set(['mp4', 'webm', 'png']);

export function positiveInteger(value, fallback, name, min, max) {
  const number = value === undefined || value === null || value === '' ? fallback : Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error(`${name} must be an integer from ${min} to ${max}`);
  }
  return number;
}

export function positiveNumber(value, fallback, name, min, max) {
  const number = value === undefined || value === null || value === '' ? fallback : Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`${name} must be a number from ${min} to ${max}`);
  }
  return number;
}

export function resolveFormat(format, output) {
  if (format) {
    const token = String(format).toLowerCase();
    if (!RENDER_FORMATS.has(token)) throw new Error('format must be mp4, webm, or png');
    return token;
  }
  const extension = extname(output).slice(1).toLowerCase();
  return RENDER_FORMATS.has(extension) ? extension : 'mp4';
}

export function posterType(poster) {
  const extension = extname(poster).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') return 'jpeg';
  if (extension === '.png') return 'png';
  throw new Error('poster must end in .png, .jpg, or .jpeg');
}
