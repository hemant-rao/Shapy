export interface ShapyShape {
  key: string;
  label: string;
  emoji?: string;
}

export interface ShapyShapeGroup {
  id: string;
  label: string;
  shapes: ShapyShape[];
}

export const EMOJI_POOL: string[];
export const SHAPE_GROUPS: ShapyShapeGroup[];
export const EMOJI_GROUP: ShapyShapeGroup;
export const CORE_SHAPE_KEYS: string[];
export const ALL_CORE_SHAPE_KEYS: string[];
export function getShapeLabel(key: string): string;
