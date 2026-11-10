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
  | 'custom'
  | (string & {});

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

export type ShapyTextPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type ShapyTextAlign = 'left' | 'center' | 'right';

/**
 * A safe, serializable inline SVG icon. `path` and `paths` contain SVG path
 * data only; raw SVG markup and event handlers are never accepted.
 */
export interface ShapyIcon {
  path?: string;
  paths?: string[];
  viewBox?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface ShapyRegistryItem {
  /** Unique key used by `shapes`; generated when omitted. */
  key?: string;
  label?: string;
  /** Render a text emoji. */
  emoji?: string;
  /** Image URL. http(s), relative paths, and safe data:image/* are allowed. */
  image?: string;
  /** Render a safe inline SVG icon built from path data. */
  icon?: ShapyIcon;
  /** Tint for emoji/icon items that use currentColor. */
  color?: string;
  /** Relative size multiplier, clamped to 0.05–5. */
  size?: number;
  /** Selection weight, clamped to 0.01–100. */
  weight?: number;
  /** Width/height ratio, each value clamped to 0.05–10. */
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
  /** Comma-separated CSS colors or an array of colors. Unsafe tokens are dropped. */
  customColors?: string | string[];
  'custom-colors'?: string | string[];
  /** Alias for customColors. */
  colors?: string | string[];
  safeArea?: boolean;
  'safe-area'?: boolean;
  paused?: boolean;
  registryData?: ShapyRegistry | string;
  'registry-data'?: ShapyRegistry | string;
  /** Alias for registryData. */
  registry?: ShapyRegistry | string;

  /** Background base color. Falls back to the palette. */
  background?: string;
  /** Alias for background. */
  backgroundColor?: string;
  /** Alias for background. */
  bg?: string;
  /** Primary text color. Also themes the text overlay. */
  textColor?: string;
  'text-color'?: string;
  /** Alias for textColor. */
  foreground?: string;
  /** Secondary text color. */
  mutedColor?: string;
  'muted-color'?: string;
  /** Accent color for highlighted text. */
  accentColor?: string;
  'accent-color'?: string;
  /** Radial glow color behind the composition. */
  glowColor?: string;
  'glow-color'?: string;
  /** Scrim color; only visible when `scrim` is enabled. */
  scrimColor?: string;
  'scrim-color'?: string;
  /** Show the readability scrim layer. */
  scrim?: boolean;

  /** Main heading. Use `\n` for line breaks. */
  text?: string;
  /** Alias for text. */
  headline?: string;
  /** Accent line rendered in the accent color. */
  textAccent?: string;
  'text-accent'?: string;
  /** Supporting paragraph. */
  subtext?: string;
  /** Alias for subtext. */
  description?: string;
  /** Small uppercase label above the heading. */
  eyebrow?: string;
  textPosition?: ShapyTextPosition;
  'text-position'?: ShapyTextPosition;
  textAlign?: ShapyTextAlign;
  'text-align'?: ShapyTextAlign;
  /** Text scale percentage, 50–200. */
  textScale?: number;
  'text-scale'?: number;
  /** Safe CSS font-family stack. */
  fontFamily?: string;
  'font-family'?: string;
  /** Heading weight, 100–900. */
  fontWeight?: number;
  'font-weight'?: number;
}

export interface ShapyOptionsSnapshot {
  seed: string;
  palette: ShapyPalette | string;
  shapeSet: string;
  shapes: string[];
  registry: ShapyRegistry | null;
  layout: ShapyLayout | string;
  align: ShapyAlign | string;
  motion: ShapyMotion | string;
  direction: ShapyDirection | string;
  density: number;
  scale: number;
  sizeMode: ShapySizeMode | string;
  speed: number;
  move: number;
  customColors: string[];
  safeArea: boolean;
  paused: boolean;
  background: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  glowColor: string;
  scrimColor: string;
  scrim: boolean;
  text: string;
  textAccent: string;
  subtext: string;
  eyebrow: string;
  textPosition: ShapyTextPosition;
  textAlign: ShapyTextAlign | '';
  textScale: number;
  fontFamily: string;
  fontWeight: number;
}

export interface ShapyInstance {
  mount(container: Element, options?: ShapyOptions): ShapyBackgroundElement | null;
}

export function createShapy(): ShapyInstance;

/** Returns a new 32-character hex seed. */
export function createSeed(): string;

export interface ShapyReadyEventDetail {
  element: ShapyBackgroundElement;
  seed: string;
  options: ShapyOptionsSnapshot;
}

export interface ShapyChangeEventDetail {
  element: ShapyBackgroundElement;
  options: ShapyOptionsSnapshot;
}

export interface ShapyBackgroundElement extends HTMLElement {
  /** Update any subset of options. `null`, `undefined`, and `false` remove an option. */
  setOptions(options?: ShapyOptions): this;
  /** Read the current normalized options. */
  getOptions(): ShapyOptionsSnapshot;
  /** Force a re-render with the current attributes. */
  refresh(): this;
}

declare global {
  interface HTMLElementTagNameMap {
    'shapy-background': ShapyBackgroundElement;
  }

  interface HTMLElementEventMap {
    'shapy:ready': CustomEvent<ShapyReadyEventDetail>;
    'shapy:change': CustomEvent<ShapyChangeEventDetail>;
  }
}
