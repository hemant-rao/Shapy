# Shapy

**Seedable generative shape backgrounds for the web.**

Shapy turns a short seed into a one-of-one composition of shapes, lines, organic
forms, emoji, and optional stickers. It ships as a zero-dependency Web Component
that works in plain HTML, Vue, React, Svelte, or any framework that can render a
custom element.

- Same seed + same settings = the same composition.
- Every new seed creates a new composition.
- Responsive sizing: smaller shapes on phones, capped sizes on wide screens.
- Open Shadow DOM renderer: no iframe, and host-page CSS cannot style the
  composition's internals.
- Pick one shape, a custom mix, a whole group, or all shapes.
- Motion, direction, density, scale, speed, move intensity, alignment, and size
  variation are all controllable.
- Optional sticker registry at `shapy/stickers`, plus support for custom image
  stickers.

## Package

| Package | Description |
| --- | --- |
| [`shapy`](./shapy) | Core Web Component, renderer, shape catalog, and optional sticker registry |

## Install

```bash
npm install shapy
```

Stickers ship inside the same package. Import them from the `shapy/stickers`
subpath when you need them; the core renderer does not depend on them.

## Quick start

```html
<script type="module">
  import 'shapy';
</script>

<shapy-background
  seed="4D5E465BCA"
  palette="midnight"
  density="72"
  scale="110"
  style="position: fixed; inset: 0; display: block;"
></shapy-background>
```

The element fills its parent. Give it a size with CSS, for example
`position: fixed; inset: 0;` for a full-page background.

## Attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `seed` | string | fresh 128-bit seed | Deterministic seed. If omitted, each element instance generates a fresh 128-bit seed. |
| `palette` | `midnight` `sandstone` `bauhaus` `forest` `plum` `ocean` `clay` `mono` | `midnight` | Curated color palette. |
| `shape-set` | `all` `geometry` `lines` `organic` `emoji` `stickers` `custom` | `all` | Which shape group to draw. `custom` uses the `shapes` attribute. |
| `shapes` | comma list or JSON array | empty | Shape keys used when `shape-set="custom"`. |
| `registry-data` | JSON string | empty | Serializable custom shape groups, including stickers or image shapes. |
| `layout` | `auto` `scatter` `grid` `rows` `columns` `center` `edges` | `auto` | Position pattern. `rows` aligns shapes horizontally; `columns` aligns them vertically. |
| `align` | `random` `left` `center` `right` `top` `middle` `bottom` | `random` | Biases the composition toward one side or the middle. |
| `motion` | `mixed` `chaos` `flow` `bounce` `drift` `spin` `pulse` `wobble` `orbit` `calm` | `mixed` | Animation style. |
| `direction` | `random` `lr` `rl` `tb` `bt` `dr` `dl` `ur` `ul` `alternate` | `random` | Movement direction. |
| `density` | 20–100 | `72` | How many shapes are drawn. |
| `scale` | 60–140 | `110` | Overall shape size multiplier. Scales both the main and ambient layers, including responsive size caps. |
| `size-mode` | `mixed` `same` `subtle` `dramatic` `small` `medium` `large` | `mixed` | Size variation. `same` gives every shape one base size (aspect ratios still differ); `dramatic` creates strong small-to-large contrast. |
| `speed` | 50–200 | `100` | Animation speed multiplier. |
| `move` | 30–200 | `100` | Movement distance multiplier. |
| `custom-colors` | comma-separated colors | empty | Override palette colors, e.g. `#ff3b30, #30d158`. |
| `safe-area` | boolean attribute | off | Dims shapes behind the text area. |
| `paused` | boolean attribute | off | Pauses all animations. |

Boolean attributes are enabled by presence:

```html
<shapy-background safe-area paused></shapy-background>
```

## Choosing shapes

### One shape

```html
<shapy-background
  shape-set="custom"
  shapes="circle"
></shapy-background>
```

### Any custom set

```html
<shapy-background
  shape-set="custom"
  shapes="triangleUp,hexagon,blob,emoji-0"
></shapy-background>
```

`shapes` accepts a comma-separated list or a JSON array:

```js
element.setAttribute('shape-set', 'custom');
element.setAttribute('shapes', JSON.stringify(['circle', 'ring', 'emoji-0']));
```

Core shape keys are exported from the catalog:

```js
import { SHAPE_GROUPS, EMOJI_GROUP } from 'shapy/catalog';

const geometryKeys = SHAPE_GROUPS.find((group) => group.id === 'geometry').shapes.map((shape) => shape.key);
const emojiKeys = EMOJI_GROUP.shapes.map((shape) => shape.key);
```

Emoji keys are `emoji-0` through `emoji-28`. If `shape-set="custom"` is empty or
contains no valid keys, Shapy falls back to the full shape set.

### Position and size examples

```html
<!-- Horizontal rows, all shapes the same size, composition pushed left -->
<shapy-background
  layout="rows"
  align="left"
  size-mode="same"
></shapy-background>

<!-- Vertical columns, dramatic size contrast, centered cluster -->
<shapy-background
  layout="columns"
  align="center"
  size-mode="dramatic"
></shapy-background>

<!-- Edge frame with small shapes -->
<shapy-background
  layout="edges"
  size-mode="small"
></shapy-background>
```

## Optional stickers

```js
import 'shapy';
import { STICKER_REGISTRY } from 'shapy/stickers';

const element = document.querySelector('shapy-background');
element.setAttribute('registry-data', JSON.stringify(STICKER_REGISTRY));
element.setAttribute('shape-set', 'stickers');
```

Use only a few stickers:

```js
element.setAttribute('registry-data', JSON.stringify(STICKER_REGISTRY));
element.setAttribute('shape-set', 'custom');
element.setAttribute('shapes', 'sticker-0,sticker-2,sticker-7');
```

`shapy/stickers` exports:

- `STICKER_CATALOG` — serializable sticker items.
- `STICKER_REGISTRY` — a ready-to-serialize registry group.
- `getRegistryData()` — returns the JSON string for the `registry-data` attribute.
- `registerStickers()` — registers the sticker group on `window.ShapyRegistry`
  for script-based registration.

### Custom image stickers

Any registry item can use an `image` URL instead of an `emoji`:

```js
const registry = {
  brand: {
    label: 'Brand marks',
    items: [
      { key: 'brand-logo', label: 'Logo', image: '/logo.svg', size: 1.1 },
      { key: 'brand-star', label: 'Star', image: '/star.svg', size: 0.9 }
    ]
  }
};

const element = document.querySelector('shapy-background');
element.setAttribute('registry-data', JSON.stringify(registry));
element.setAttribute('shape-set', 'custom');
element.setAttribute('shapes', 'brand-logo,brand-star');
```

Image shapes are rendered with `object-fit: contain`. Only pass image URLs you
trust; Shapy does not fetch or sanitize remote content for you.

## JavaScript API

```js
import { createShapy } from 'shapy';

const background = createShapy();

const element = background.mount(document.querySelector('#background'), {
  seed: '4D5E465BCA',
  palette: 'ocean',
  shapeSet: 'custom',
  shapes: ['circle', 'ring', 'emoji-0'],
  layout: 'rows',
  align: 'center',
  sizeMode: 'same',
  density: 72,
  scale: 110,
  motion: 'mixed',
  paused: false
});
```

`mount()` accepts camelCase or kebab-case option names, converts booleans to
attributes correctly, and returns the created `<shapy-background>` element.
Objects such as `shapes` and `registryData` are serialized automatically. Pass an
element as the container; use `document.querySelector()` if you only have a
selector string.

You can also update the element directly:

```js
element.setAttribute('palette', 'plum');
element.setAttribute('size-mode', 'dramatic');
element.setAttribute('paused', '');
```

## Vue 3

Register the custom element with the Vue compiler:

```js
// vite.config.js
import vue from '@vitejs/plugin-vue';

export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('shapy-')
        }
      }
    })
  ]
};
```

```vue
<script setup>
import 'shapy';
</script>

<template>
  <shapy-background
    seed="4D5E465BCA"
    palette="midnight"
    shape-set="custom"
    shapes="circle,emoji-0"
    layout="rows"
    align="center"
    size-mode="same"
    style="position: fixed; inset: 0; display: block;"
  />
</template>
```

The demo app in [`vue-demo`](./vue-demo) contains a full control panel
with palette, shape picker, layout, alignment, size mode, motion, direction,
density, scale, speed, move intensity, custom colors, safe area, pause, seed
actions, and sticker selection.

## Seed model

Shapy uses a seeded PRNG. The same seed and the same settings produce the same
composition. Changing the seed creates a new composition. Changing placement or
size controls changes the arrangement without needing a new seed.

The renderer hashes the full seed string into a 128-bit PRNG state, so a
32-character hex seed uses the full 128-bit seed space. If you do not pass a
`seed` attribute, each `<shapy-background>` instance generates a fresh 128-bit
seed internally. The Vue demo starts from a fixed seed so the initial view is
reproducible; use **New pattern** for a fresh seed.

For shareable links, keep the seed in the URL and read it on load:

```js
const seed = new URLSearchParams(location.search).get('seed');
if (seed) element.setAttribute('seed', seed);
```

## How many unique compositions?

A composition is the result of a seed plus the renderer settings. The counts below
are conservative: custom colors and custom image registries add unbounded
combinations on top.

### 1. Seed space

Shapy uses a 128-bit seed. The seed can be any string; a 32-character hex seed
uses the full space:

```text
2^128 = 340,282,366,920,938,463,463,374,607,431,768,211,456
      ≈ 3.402823 × 10^38
```

### 2. Shape pools

Including the sticker registry there are 79 selectable shape keys:

- 40 CSS shapes
- 29 emoji
- 10 stickers

Any non-empty custom subset is valid:

```text
2^79 - 1 = 604,462,909,807,314,587,353,087
```

There are also six preset pools: `all`, `geometry`, `lines`, `organic`, `emoji`,
and `stickers`. The `all` preset is the full set, which is already one of the
custom subsets, so add the five other presets:

```text
2^79 - 1 + 5 = 2^79 + 4
             = 604,462,909,807,314,587,353,092
             ≈ 6.044629 × 10^23
```

Without the sticker registry there are 69 keys (40 shapes + 29 emoji):

```text
2^69 + 4 = 590,295,810,358,705,651,716
         ≈ 5.902958 × 10^20
```

### 3. Renderer settings

| Setting | Values |
| --- | ---: |
| Palette | 8 |
| Layout | 7 |
| Alignment | 7 |
| Size mode | 7 |
| Density | 81 (`20`–`100`) |
| Scale | 81 (`60`–`140`) |
| Safe area | 2 |
| Motion | 10 |
| Direction | 10 |
| Speed | 151 (`50`–`200`) |
| Move | 171 (`30`–`200`) |

The static visual settings (everything except motion, direction, speed, and move)
give:

```text
8 × (2^79 + 4) × 7 × 7 × 7 × 81 × 81 × 2
= 21,764,755,758,036,901,049,838,517,726,656
≈ 2.176475 × 10^31
```

Adding motion, direction, speed, and move gives:

```text
2.176475 × 10^31 × 10 × 10 × 151 × 171
≈ 5.619877 × 10^37
```

### 4. Seed × settings

Multiplying the seed space by the full visual settings gives:

```text
2^128 × 5.619877 × 10^37
≈ 1.912345 × 10^76
```

That is:

```text
19,123,452,461,856,457,933,376,428,517,312,612,551,350,612,939,048,154,491,048,265,182,342,650,265,600
```

Pausing animations doubles the runtime states:

```text
≈ 3.824690 × 10^76
```

Custom colors and custom image registries are unbounded, so the real number is
larger. Even this conservative count is so large that two random 128-bit seeds
producing the same composition is practically impossible. Same seed + same
settings always reproduces the same result.

## Local development

Development requires Node.js 20.19 or newer (Vite 8).

```bash
npm install
npm run dev
```

The demo runs with Vite. The template is generated from
`shapy/src/shapy-index.html`:

```bash
npm run build:template
```

Never edit `shapy/src/shapy-template.js` by hand. Edit the source HTML and
regenerate.

Useful commands:

```bash
npm run dev            # start the Vue demo with Vite
npm run build          # build the Vue demo
npm run verify         # regenerate template, build demo, dry-run the package
npm run pack:shapy     # npm pack the core package
npm run pack:check     # dry-run the package tarball
```

## Project structure

```
shapy/
├─ shapy/                    Core npm package
│  ├─ src/shapy-bg.js        Custom element + attribute mapping
│  ├─ src/shapy-index.html   Advanced renderer template source
│  ├─ src/shapy-template.js  Generated HTML string (do not edit)
│  ├─ src/catalog.js         Core shape + emoji catalog
│  ├─ src/stickers.js        Optional sticker registry
│  ├─ src/index.js           Public createShapy() API
│  └─ scripts/               Template build script
├─ vue-demo/                 Vue 3 background-only + full config demo
├─ index.html                Standalone advanced reference demo
├─ docs/                     AI context and changelog
└─ AGENTS.md                 Rules for AI-assisted changes
```

## Publishing

```bash
npm run pack:check
npm run publish:shapy
```

Before publishing, bump versions, update `docs/CHANGELOG.md`, run the demo and
the manual checks in [`AGENTS.md`](./AGENTS.md), and review the dry-run output.
Run `npm publish` only after explicit approval and a successful `npm login`.

## Browser support

Modern browsers with Custom Elements (including Shadow DOM), CSS custom
properties, CSS `clip-path`, and CSS animations. The renderer lives in an open
shadow root, so host-page CSS cannot style its internal elements. The custom
element exposes `role="img"` and an overridable `aria-label` for accessibility.

## License

MIT. See [LICENSE](./LICENSE).
