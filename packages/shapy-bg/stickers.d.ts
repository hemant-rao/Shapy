import type { ShapyRegistryItem } from './index.js';

export interface Sticker extends ShapyRegistryItem {
  key: string;
  label: string;
}

export interface StickerRegistryGroup {
  label: string;
  items: Sticker[];
}

export const STICKER_CATALOG: Sticker[];
export const STICKER_REGISTRY: { stickers: StickerRegistryGroup };

export function getRegistryData(): string;
/**
 * Applies the sticker registry to a `shapy-background` element by setting its
 * `registry-data` attribute. Returns the registry for reuse. Does not write to
 * `globalThis`.
 */
export function registerStickers(element?: Element): { stickers: StickerRegistryGroup };
