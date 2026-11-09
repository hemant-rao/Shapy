export * from './catalog.js';

export type ShapyPalette =
  | 'midnight'
  | 'sandstone'
  | 'bauhaus'
  | 'forest'
  | 'plum'
  | 'ocean'
  | 'clay'
  | 'mono';

export type ShapyShapeSet =
  | 'all'
  | 'geometry'
  | 'lines'
  | 'organic'
  | 'emoji'
  | 'stickers'
  | 'custom';

export type ShapyLayout = 'auto' | 'scatter' | 'grid' | 'rows' | 'columns' | 'center' | 'edges';

export type ShapyAlign = 'random' | 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

export type ShapySizeMode = 'mixed' | 'same' | 'subtle' | 'dramatic' | 'small' | 'medium' | 'large';

export type ShapyMotion =
  | 'mixed'
  | 'chaos'
  | 'flow'
  | 'bounce'
  | 'drift'
  | 'spin'
  | 'pulse'
  | 'wobble'
  | 'orbit'
  | 'calm';

export type ShapyDirection =
  | 'random'
  | 'lr'
  | 'rl'
  | 'tb'
  | 'bt'
  | 'dr'
  | 'dl'
  | 'ur'
  | 'ul'
  | 'alternate';

export interface ShapyRegistryItem {
  key: string;
  label?: string;
  emoji?: string;
  /** Image URL. Only http(s) and safe data:image/* are allowed; others are dropped. */
  image?: string;
  size?: number;
  weight?: number;
  ratio?: [number, number];
}

export interface ShapyRegistryGroup {
  label?: string;
  items: ShapyRegistryItem[];
}

export type ShapyRegistry = Record<string, ShapyRegistryGroup | ShapyRegistryItem[]>;

export interface ShapyOptions {
  seed?: string;
  palette?: ShapyPalette;
  shapeSet?: ShapyShapeSet;
  'shape-set'?: ShapyShapeSet;
  shapes?: string | string[];
  layout?: ShapyLayout;
  align?: ShapyAlign;
  motion?: ShapyMotion;
  direction?: ShapyDirection;
  density?: number;
  scale?: number;
  sizeMode?: ShapySizeMode;
  'size-mode'?: ShapySizeMode;
  speed?: number;
  move?: number;
  /** Comma-separated CSS color strings. Unsafe tokens are dropped. */
  customColors?: string;
  'custom-colors'?: string;
  safeArea?: boolean;
  'safe-area'?: boolean;
  paused?: boolean;
  registryData?: ShapyRegistry | string;
  'registry-data'?: ShapyRegistry | string;
}

export interface ShapyInstance {
  mount(container: Element, options?: ShapyOptions): HTMLElement | null;
}

export function createShapy(): ShapyInstance;

/** Returns a new 32-character hex seed. */
export function createSeed(): string;

export interface ShapyBackgroundElement extends HTMLElement {}

declare global {
  interface HTMLElementTagNameMap {
    'shapy-background': ShapyBackgroundElement;
  }
}
