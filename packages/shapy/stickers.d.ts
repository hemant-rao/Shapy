export interface Sticker {
  key: string;
  label: string;
  emoji?: string;
  image?: string;
  size?: number;
}

export interface StickerRegistryGroup {
  label: string;
  items: Sticker[];
}

export const STICKER_CATALOG: Sticker[];
export const STICKER_REGISTRY: { stickers: StickerRegistryGroup };

export function getRegistryData(): string;
export function registerStickers(target?: object): { stickers: StickerRegistryGroup };
