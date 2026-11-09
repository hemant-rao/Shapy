# shapy

Seedable generative shape backgrounds as a zero-dependency Web Component.

> **New to Shapy?** Read the
> [step-by-step guide](https://github.com/hemant-rao/Shapy/blob/main/docs/GETTING_STARTED.md).
> It covers installation, your first background, common recipes, and
> troubleshooting.

## Install

```bash
npm install shapy
```

> **Pre-release note:** `shapy` is not on npm yet. Until the first public
> release, use the repository example.

## Quick start

### 1. Import the package once

```js
import 'shapy';
```

### 2. Add the element

```html
<shapy-background
  seed="4D5E465BCA"
  palette="midnight"
  density="72"
  scale="110"
  style="position: fixed; inset: 0; display: block;"
></shapy-background>
```

### 3. Give it a size

The element fills its parent. The inline style above makes it fill the viewport.
You can also use CSS:

```css
shapy-background {
  position: fixed;
  inset: 0;
  display: block;
}
```

## Features

- 40 CSS shapes, 29 emoji, and an optional sticker registry at `shapy/stickers`.
- Seedable compositions: same seed + same settings = same result.
- Pick one shape, a custom set, a group, or all shapes.
- Layouts: auto, random scatter, aligned grid, horizontal rows, vertical columns,
  center cluster, edge frame.
- Alignment: random, left, center, right, top, middle, bottom.
- Size modes: mixed, same, subtle, dramatic, small, medium, large.
- Motion, direction, density, scale, speed, move intensity, custom colors,
  safe area, and pause controls.
- Responsive sizing with mobile and wide-screen caps. The `scale` slider also
  scales the caps, so reducing it shrinks large shapes too.
- Open Shadow DOM renderer: no iframe, and host-page CSS cannot style the
  composition's internals.

## How many unique compositions?

A 128-bit seed plus the renderer settings produces an astronomically large
combination space. Including the sticker registry there are 79 selectable keys
(40 shapes + 29 emoji + 10 stickers), giving `2^79 + 4` distinct shape pools.
Combining that with 8 palettes, 7 layouts, 7 alignments, 7 size modes, 81
density values, 81 scale values, 2 safe-area states, 10 motion modes, 10
directions, 151 speed values, and 171 move values gives:

- `≈ 5.619877 × 10^37` visual settings per seed
- `≈ 1.912345 × 10^76` seed + settings combinations
- `≈ 3.824690 × 10^76` when paused is included

Custom colors and custom image registries add unbounded combinations. The same
seed and settings always reproduce the same composition; different seeds
overwhelmingly produce different compositions. The repository README contains
the full calculation.

## Attributes

| Attribute | Default | Description |
| --- | --- | --- |
| `seed` | fresh 128-bit seed | Deterministic seed. If omitted, each element instance gets a fresh 128-bit seed. |
| `palette` | `midnight` | `midnight`, `sandstone`, `bauhaus`, `forest`, `plum`, `ocean`, `clay`, `mono`. |
| `shape-set` | `all` | `all`, `geometry`, `lines`, `organic`, `emoji`, `stickers`, `custom`. |
| `shapes` | empty | Comma list or JSON array of shape keys for `custom`. |
| `registry-data` | empty | JSON string with custom shape groups. |
| `layout` | `auto` | `auto`, `scatter`, `grid`, `rows`, `columns`, `center`, `edges`. |
| `align` | `random` | `random`, `left`, `center`, `right`, `top`, `middle`, `bottom`. |
| `motion` | `mixed` | `mixed`, `chaos`, `flow`, `bounce`, `drift`, `spin`, `pulse`, `wobble`, `orbit`, `calm`. |
| `direction` | `random` | `random`, `lr`, `rl`, `tb`, `bt`, `dr`, `dl`, `ur`, `ul`, `alternate`. |
| `density` | `72` | 20–100. |
| `scale` | `110` | 60–140. Scales the main and ambient layers, including responsive caps. |
| `size-mode` | `mixed` | `mixed`, `same`, `subtle`, `dramatic`, `small`, `medium`, `large`. `same` uses one base size for every shape. |
| `speed` | `100` | 50–200. |
| `move` | `100` | 30–200. |
| `custom-colors` | empty | Comma-separated colors. |
| `safe-area` | off | Boolean attribute. |
| `paused` | off | Boolean attribute. |

## One shape or a custom mix

```html
<shapy-background shape-set="custom" shapes="circle"></shapy-background>
```

```html
<shapy-background
  shape-set="custom"
  shapes="triangleUp,hexagon,blob,emoji-0"
></shapy-background>
```

Shape keys come from `shapy/catalog`:

```js
import { SHAPE_GROUPS, EMOJI_GROUP } from 'shapy/catalog';

const geometry = SHAPE_GROUPS.find((group) => group.id === 'geometry');
const keys = geometry.shapes.map((shape) => shape.key);
const emojiKeys = EMOJI_GROUP.shapes.map((shape) => shape.key);
```

Emoji keys are `emoji-0` through `emoji-28`.

## Optional stickers

```js
import 'shapy';
import { STICKER_REGISTRY } from 'shapy/stickers';

const element = document.querySelector('shapy-background');
element.setAttribute('registry-data', JSON.stringify(STICKER_REGISTRY));
element.setAttribute('shape-set', 'stickers');
```

Stickers are part of the `shapy` package and load only when you import the
`shapy/stickers` subpath.

Custom image shapes use the same registry format:

```js
const registry = {
  brand: {
    label: 'Brand',
    items: [{ key: 'logo', label: 'Logo', image: '/logo.svg', size: 1.1 }]
  }
};

element.setAttribute('registry-data', JSON.stringify(registry));
element.setAttribute('shape-set', 'custom');
element.setAttribute('shapes', 'logo');
```

## JavaScript API

```js
import { createShapy } from 'shapy';

const element = createShapy().mount(document.querySelector('#background'), {
  seed: '4D5E465BCA',
  palette: 'ocean',
  shapeSet: 'custom',
  shapes: ['circle', 'emoji-0'],
  layout: 'rows',
  align: 'center',
  sizeMode: 'same'
});
```

`mount()` accepts camelCase or kebab-case keys, takes an element as the
container, and returns the created element. Use `document.querySelector()` if
you only have a selector string. It replaces the container's existing content.

To create a new pattern:

```js
import { createSeed } from 'shapy';

element.setAttribute('seed', createSeed());
```

## Troubleshooting

### Nothing appears

1. Did you import `shapy`?
2. Does `shapy-background` have a size? Try
   `shapy-background { position: fixed; inset: 0; display: block; }`.
3. Check the browser console for errors.

### Vue says "Failed to resolve component: shapy-background"

Add the `isCustomElement` option shown in the
[step-by-step guide](https://github.com/hemant-rao/Shapy/blob/main/docs/GETTING_STARTED.md#use-with-vue-3).

### The pattern changes every time I reload

Pass a fixed `seed`; without one, each element gets a fresh 128-bit seed.

### Stickers do not appear

Import from `shapy/stickers`, set `registry-data` to
`JSON.stringify(STICKER_REGISTRY)`, and set `shape-set="stickers"`.

## Documentation

- [Step-by-step guide](https://github.com/hemant-rao/Shapy/blob/main/docs/GETTING_STARTED.md)
- [Attributes](#attributes)
- [JavaScript API](#javascript-api)
- [Optional stickers](#optional-stickers)
- [Full repository documentation](https://github.com/hemant-rao/Shapy#readme)

## License

MIT
