export function createSeed() {
  const bytes = new Uint8Array(16);

  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
