export const EMOJI_POOL = [
  '⭐', '✨', '❄️', '🔥', '💧', '🌙', '☀️', '⚡', '🌈', '🎈',
  '🎨', '🎯', '🌀', '💫', '🔮', '🧩', '🎲', '🍀', '🌸', '🍄',
  '🪐', '🌪️', '❤️', '💙', '💚', '💛', '💜', '🖤', '🤍'
];

export const SHAPE_GROUPS = [
  {
    id: 'geometry',
    label: 'Geometry',
    shapes: [
      ['circle', 'Circle'], ['ring', 'Ring'], ['dot', 'Dot'], ['square', 'Square'],
      ['squircle', 'Squircle'], ['rectH', 'Rectangle H'], ['rectV', 'Rectangle V'],
      ['triangleUp', 'Triangle Up'], ['triangleDown', 'Triangle Down'],
      ['triangleLeft', 'Triangle Left'], ['triangleRight', 'Triangle Right'],
      ['diamond', 'Diamond'], ['pentagon', 'Pentagon'], ['hexagon', 'Hexagon'],
      ['heptagon', 'Heptagon'], ['octagon', 'Octagon'], ['nonagon', 'Nonagon'],
      ['decagon', 'Decagon'], ['star4', 'Star 4'], ['star5', 'Star 5'],
      ['star6', 'Star 6'], ['star8', 'Star 8'], ['cross', 'Cross'],
      ['trapezoid', 'Trapezoid'], ['parallelogram', 'Parallelogram'], ['kite', 'Kite'],
      ['semicircle', 'Semicircle'], ['quarter', 'Quarter'], ['pill', 'Pill'],
      ['arch', 'Arch'], ['chevron', 'Chevron'], ['arrow', 'Arrow']
    ].map(([key, label]) => ({ key, label }))
  },
  {
    id: 'lines',
    label: 'Lines',
    shapes: [
      ['lineV', 'Vertical line'], ['lineH', 'Horizontal line'], ['lineD', 'Diagonal line']
    ].map(([key, label]) => ({ key, label }))
  },
  {
    id: 'organic',
    label: 'Organic',
    shapes: [
      ['blob', 'Blob'], ['crescent', 'Crescent'], ['petal', 'Petal'],
      ['leaf', 'Leaf'], ['drop', 'Drop']
    ].map(([key, label]) => ({ key, label }))
  }
];

export const EMOJI_GROUP = {
  id: 'emoji',
  label: 'Emoji',
  shapes: EMOJI_POOL.map((emoji, index) => ({ key: `emoji-${index}`, label: emoji, emoji }))
};

export const CORE_SHAPE_KEYS = SHAPE_GROUPS.flatMap((group) => group.shapes.map((shape) => shape.key));
export const ALL_CORE_SHAPE_KEYS = [...CORE_SHAPE_KEYS, ...EMOJI_GROUP.shapes.map((shape) => shape.key)];

export function getShapeLabel(key) {
  for (const group of [...SHAPE_GROUPS, EMOJI_GROUP]) {
    const match = group.shapes.find((shape) => shape.key === key);
    if (match) return match.label;
  }
  return key;
}
