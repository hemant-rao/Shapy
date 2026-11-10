export const STICKER_CATALOG = [
  { key: 'sticker-0', label: 'Party popper', emoji: '🎉', size: 1.15 },
  { key: 'sticker-1', label: 'Confetti ball', emoji: '🎊', size: 1.15 },
  { key: 'sticker-2', label: 'Rocket', emoji: '🚀', size: 1.15 },
  { key: 'sticker-3', label: 'Glowing star', emoji: '🌟', size: 1.1 },
  { key: 'sticker-4', label: 'Gem stone', emoji: '💎', size: 1.1 },
  { key: 'sticker-5', label: 'Gift', emoji: '🎁', size: 1.1 },
  { key: 'sticker-6', label: 'Bullseye', emoji: '🎯', size: 1.1 },
  { key: 'sticker-7', label: 'Teddy bear', emoji: '🧸', size: 1.15 },
  { key: 'sticker-8', label: 'Lollipop', emoji: '🍭', size: 1.1 },
  { key: 'sticker-9', label: 'Chocolate', emoji: '🍫', size: 1.1 }
];

export const STICKER_REGISTRY = {
  stickers: {
    label: 'Stickers',
    items: STICKER_CATALOG
  }
};

export function getRegistryData() {
  return JSON.stringify(STICKER_REGISTRY);
}

export function registerStickers(element) {
  if (element && typeof element.setAttribute === 'function') {
    element.setAttribute('registry-data', getRegistryData());
  }
  return STICKER_REGISTRY;
}
