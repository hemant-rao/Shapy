# Shapy

[![CI](https://github.com/hemant-rao/Shapy/actions/workflows/ci.yml/badge.svg)](https://github.com/hemant-rao/Shapy/actions/workflows/ci.yml)

**Seedable generative shape backgrounds for the web.**

Shapy turns a short seed into a one-of-one composition of shapes, lines, organic
forms, emoji, custom images, and optional stickers. It can also render a
themed text overlay, so one element can be a complete hero background. It is a
zero-dependency Web Component, so it works in plain HTML, Vue, React, Svelte, or
any framework that can render a custom element.

> **New here?** Start with the [step-by-step guide](./docs/GETTING_STARTED.md).
> It takes you from an empty folder to a working background in a few minutes.

## Why Shapy?

- **One tag, no runtime dependencies.** Add `<shapy-background>` and import the
  package once.
- **Deterministic.** Same seed + same settings = the same composition.
- **Shareable.** A seed is a short text you can put in a URL or save in a
  database.
- **Flexible.** Pick one shape, a custom mix, a group, or all shapes. Add
  stickers, your own images, or safe inline SVG icons.
- **Themeable.** Control the background, text, accent, muted, glow, and scrim
  colors with attributes or host CSS variables.
- **Complete heroes.** Add an eyebrow, headline, accent line, and body text in
  any of nine positions, with no extra markup.
- **Responsive.** Shapes shrink on phones and stay capped on wide screens.
- **Accessible by default.** `role="img"`, an overridable label, and
  reduced-motion support.
- **Framework-friendly.** Works with plain HTML, Vue, React, Svelte, and more.

## Try it in 2 minutes

The repository includes a minimal example that runs without creating a new
project.

```bash
git clone https://github.com/hemant-rao/Shapy.git
cd Shapy
npm install
npm run dev:example
```

Open the URL Vite prints, ending in `/examples/minimal.html`. Click **New
pattern** to try a new seed.

Want the full demo?

```bash
npm run dev
```

Then open `/` for the background-only page and `/config` for the full control
panel. The demo server also serves `/examples/minimal.html` directly.

## Use it in your project

### 1. Install

```bash
npm install shapy
```

Shapy is a browser-only Web Component. It needs Custom Elements and Shadow DOM,
which are available in current Chrome, Edge, Firefox, and Safari.

### 2. Import it once

```js
import 'shapy';
```

### 3. Add the element and give it a size

```html
<shapy-background
  seed="4D5E465BCA"
  palette="midnight"
  density="72"
  scale="110"
  style="position: fixed; inset: 0; display: block;"
></shapy-background>
```

That is a complete full-page background. The element fills its parent; the
inline style makes it fill the viewport.

## Documentation

- [Step-by-step guide](./docs/GETTING_STARTED.md) — start here if you are new.
- [Attributes](#attributes) — every option, default, and allowed value.
- [Choosing shapes](#choosing-shapes) — one shape, a custom mix, or a group.
- [Custom media](#custom-media) — images, emoji, and inline SVG icons.
- [Text overlay](#text-overlay) — headline, accent, body, and positioning.
- [Theming and CSS hooks](#theming-and-css-hooks) — colors, variables, and parts.
- [JavaScript API](#javascript-api) — `createShapy()`, methods, and events.
- [Vue 3](#vue-3) — compiler setup and a component example.
- [Optional stickers](#optional-stickers) — sticker registry and custom media.
- [Seed model](#seed-model) — how deterministic patterns work.
- [Troubleshooting](#troubleshooting) — common problems and fixes.
- [How unique is a seed?](./docs/UNIQUENESS.md) — the full math.
- [Local development](#local-development) — run, test, and build this repo.

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

### Colors

Every color attribute accepts a normal CSS color. Invalid values are ignored.
Explicit attributes win over host CSS variables, which win over the palette.

| Attribute | Default | Description |
| --- | --- | --- |
| `background` | palette background | Background base color. Aliases: `backgroundColor`, `bg`. |
| `text-color` | palette ink | Headline and primary text. Aliases: `textColor`, `foreground`. |
| `muted-color` | palette muted | Eyebrow and body text. |
| `accent-color` | palette accent | Accent text and highlighted words. |
| `glow-color` | palette glow | Radial glow behind the composition. |
| `scrim-color` | palette scrim | Scrim color. Visible only with `scrim`. |
| `scrim` | off | Boolean attribute. Shows the readability scrim. |

### Text

| Attribute | Default | Description |
| --- | --- | --- |
| `text` | empty | Headline. Use a real newline (or `&#10;` in HTML) for line breaks. `headline` is an alias. |
| `text-accent` | empty | Accent line appended after the headline. |
| `subtext` | empty | Supporting paragraph. `description` is an alias. |
| `eyebrow` | empty | Small uppercase label above the headline. |
| `text-position` | `middle-left` | `top-left`, `top-center`, `top-right`, `middle-left`, `middle-center`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right`. |
| `text-align` | inferred | `left`, `center`, or `right`. Defaults to the alignment implied by `text-position`. |
| `text-scale` | `100` | 50–200. Scales the headline and body. |
| `font-family` | package display font | A safe CSS font stack, for example `Georgia, serif`. |
| `font-weight` | `400` | 100–900. Headline weight. |

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
- `registerStickers(element)` — sets `registry-data` on an element to the sticker
  registry. It returns the registry and never writes to `globalThis`.

```js
import { registerStickers } from 'shapy/stickers';

const element = document.querySelector('shapy-background');
registerStickers(element);
element.setAttribute('shape-set', 'stickers');
```

## Custom media

Any registry item can render an emoji, an image, or an inline SVG icon:

```js
const registry = {
  brand: {
    label: 'Brand marks',
    items: [
      { key: 'brand-logo', label: 'Logo', image: '/logo.svg', size: 1.1 },
      { key: 'brand-spark', label: 'Spark', emoji: '✨', color: '#fbbf24' },
      {
        key: 'brand-heart',
        label: 'Heart',
        icon: {
          path: 'M12 21s-7-4.35-9.33-8.02C.8 9.9 2.2 6 5.5 6c2 0 3.2 1.2 3.5 1.6C9.3 7.2 10.5 6 12.5 6c3.3 0 4.7 3.9 2.83 6.98C19 16.65 12 21 12 21z',
          viewBox: '0 0 24 24',
          fill: '#ff3366'
        },
        size: 1.2
      }
    ]
  }
};

const element = document.querySelector('shapy-background');
element.setAttribute('registry-data', JSON.stringify(registry));
element.setAttribute('shape-set', 'custom');
element.setAttribute('shapes', 'brand-logo,brand-spark,brand-heart');
```

Item fields:

| Field | Description |
| --- | --- |
| `key` | Unique key used by `shapes`. Auto-generated when omitted. |
| `label` | Readable name; used as image alt text. |
| `emoji` | Text emoji. |
| `image` | Image URL. |
| `icon` | Safe SVG path data object. |
| `color` | Tint for emoji and icons that use `currentColor`. |
| `size` | 0.05–5, default `1`. |
| `weight` | 0.01–100, default `1`. |
| `ratio` | `[width, height]`, each 0.05–10, default `[1, 1]`. |

An item must provide at least one of `emoji`, `image`, or `icon`; items without
renderable media are dropped. If several are supplied, `emoji` wins, then
`icon`, then `image`. A group can be `{ label, items }` or a plain array of
items. Registries are capped at 20 groups and 200 items per group.

### Image formats

Allowed image values:

- `https://example.com/logo.png`
- `//cdn.example.com/logo.png`
- `/assets/logo.svg`, `./logo.svg`, `../logo.svg` (resolved by the browser
  against your page)
- `data:image/png;base64,...`, plus JPEG, GIF, WebP, AVIF, and SVG data URLs

`javascript:`, `data:text/html`, `blob:`, `ftp:`, other schemes, and URLs with
backslashes are rejected. Images render with `object-fit: contain`. Shapy
validates the URL format but does not fetch, proxy, or inspect remote content.

### Icon format

Icons are path data, not raw SVG markup:

```js
{
  path: 'M12 2 2 22h20L12 2z',   // one path
  paths: ['M...', 'M...'],        // or several paths
  viewBox: '0 0 24 24',           // optional, four numbers
  fill: 'currentColor',           // optional CSS color
  stroke: '#ffffff',              // optional CSS color
  strokeWidth: 2                  // optional, 0–50
}
```

`viewBox` defaults to `0 0 24 24`. With no `fill` and no `stroke`, paths use
`currentColor`. With `stroke` and no `strokeWidth`, the width is `2`. Raw
`<svg>` strings are rejected.

## Text overlay

```html
<shapy-background
  seed="hero"
  palette="ocean"
  background="#06121f"
  accent-color="#fbbf24"
  eyebrow="Shapy package"
  text="Build something&#10;memorable"
  text-accent="today."
  subtext="A complete hero background from one custom element."
  text-position="middle-center"
  text-scale="110"
  font-family="Georgia, serif"
  font-weight="600"
  scrim
  safe-area
  style="position: fixed; inset: 0; display: block;"
></shapy-background>
```

Text is plain text, never HTML. `text-accent` is appended on its own line in the
accent color. The overlay ignores pointer events, so links and buttons underneath
still work. When text is visible, the default host role becomes `group` and the
default label comes from the headline; without text it returns to `role="img"`.
A host-supplied `role` or `aria-label` is never overwritten. `safe-area` uses the
visible overlay's bounds.

## Theming and CSS hooks

Color precedence, strongest first:

1. An explicit color attribute on the element.
2. A host CSS custom property on the element or an ancestor.
3. The selected palette.

| Host variable | Controls |
| --- | --- |
| `--shapy-bg` | Background base color |
| `--shapy-ink` | Primary text color |
| `--shapy-muted` | Muted text color |
| `--shapy-accent` | Accent text color |
| `--shapy-glow` | Radial glow color |
| `--shapy-scrim` | Scrim color |

```css
.hero-background {
  --shapy-bg: #08111f;
  --shapy-ink: #f8fafc;
  --shapy-muted: #a5b4c8;
  --shapy-accent: #fbbf24;
  --shapy-glow: rgb(251 191 36 / 0.18);
  --shapy-scrim: rgb(8 17 31 / 0.72);
}
```

```html
<shapy-background class="hero-background" palette="ocean" scrim></shapy-background>
```

`custom-colors` controls the generated shapes; the color attributes and host
variables theme the background, scrim, and text.

The text overlay exposes `::part(text)`, `::part(eyebrow)`, `::part(headline)`,
and `::part(body)`:

```css
shapy-background::part(headline) {
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

shapy-background::part(body) {
  max-width: 36ch;
}
```

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
  paused: false,
  background: '#08111f',
  accentColor: '#fbbf24',
  text: 'Shape your',
  textAccent: 'story.',
  textPosition: 'middle-center',
  subtext: 'A complete hero from one element.'
});
```

`mount()` accepts camelCase or kebab-case option names, converts booleans to
attributes correctly, and returns the created `<shapy-background>` element.
Objects such as `shapes` and `registryData` are serialized automatically. Pass an
element as the container; use `document.querySelector()` if you only have a
selector string.

Update the element at any time:

```js
element.setOptions({ palette: 'plum', density: 48, paused: true });
element.setOptions({ text: null, background: null }); // remove options
element.refresh();                                    // force a re-render
const options = element.getOptions();                 // normalized snapshot
```

`setOptions()` removes an option when its value is `null`, `undefined`, or
`false`; `true` adds a boolean attribute. `getOptions()` returns the generated or
explicit seed, parsed registry, color values, text settings, and
`customColors` as an array. `refresh()` re-renders with the current attributes.

Listen for lifecycle updates:

```js
element.addEventListener('shapy:ready', (event) => {
  console.log('first render', event.detail.seed, event.detail.options);
});

element.addEventListener('shapy:change', (event) => {
  console.log('updated', event.detail.options);
});
```

`shapy:ready` fires once after the first render. `shapy:change` fires after
`setOptions()`, `refresh()`, and debounced attribute updates. Both expose
`detail.element` and `detail.options`; `shapy:ready` also exposes `detail.seed`.

To create a new pattern, import `createSeed()` and set the `seed` attribute:

```js
import { createSeed } from 'shapy';

element.setAttribute('seed', createSeed());
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

The demo app in [`apps/demo`](./apps/demo) contains a full control panel
with palette, shape picker, layout, alignment, size mode, motion, direction,
density, scale, speed, move intensity, custom colors, safe area, pause, seed
actions, and sticker selection. The package API also supports background and
text colors, a text overlay, custom image/icon registries, element methods, and
lifecycle events.

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

## How unique is a seed?

A 128-bit seed plus the renderer settings gives an astronomically large
combination space:

- `2^128` possible seeds.
- 79 selectable shape keys with the sticker registry (40 shapes + 29 emoji + 10
  stickers).
- 8 palettes, 7 layouts, 7 alignments, 7 size modes, 81 density values, 81 scale
  values, 10 motion modes, 10 directions, 151 speed values, and 171 move values.
- Custom colors, custom image/icon registries, and text content add
  user-defined combinations on top of the counts above. Theming and text are
  presentation controls; they do not change the composition math.

That is roughly `1.9 × 10^76` seed + settings combinations, before paused state
and custom content. The full calculation is in
[How unique is a Shapy composition?](./docs/UNIQUENESS.md).

The practical takeaway: two random seeds producing the same composition is
practically impossible, and the same seed + same settings always reproduces the
same result.

## Local development

Development requires Node.js 20.19 or newer (Vite 8).

```bash
npm install
npm run dev
```

The renderer source is `packages/shapy/src/shapy-index.html`. One command
regenerates the package template and the standalone example:

```bash
npm run build:template
```

Never edit `packages/shapy/src/shapy-template.js` or
`examples/standalone.html` by hand. Edit the source HTML and regenerate.

Useful commands:

```bash
npm run dev            # start the Vue demo with Vite
npm run dev:example    # start the minimal HTML example
npm run build          # build the Vue demo
npm run check:repo     # check docs, exports, and generated files
npm run verify         # regenerate, check, build, and dry-run the package
npm run pack:shapy     # npm pack the core package
npm run pack:check     # dry-run the package tarball
```

## Project structure

```
Shapy-code/
├─ packages/
│  └─ shapy/                   Published npm package
│     ├─ src/shapy-bg.js       Custom element + attribute mapping
│     ├─ src/shapy-index.html  Renderer source (edit this)
│     ├─ src/shapy-template.js Generated package template (do not edit)
│     ├─ src/catalog.js        Core shape + emoji catalog
│     ├─ src/stickers.js       Optional sticker registry
│     ├─ src/index.js          Public createShapy() API
│     └─ scripts/              Package template build script
├─ apps/
│  └─ demo/                    Vue 3 background-only + config demo
├─ examples/
│  ├─ minimal.html             Small copy-paste example
│  └─ standalone.html          Generated standalone demo (do not edit)
├─ scripts/
│  ├─ sync-standalone.mjs      Copy renderer source to examples/
│  └─ check-repo.mjs           Docs, package, and generated-file checks
├─ docs/
│  ├─ GETTING_STARTED.md       Step-by-step beginner guide
│  ├─ UNIQUENESS.md            Full composition-count math
│  └─ AI_CONTEXT.md            Architecture notes for future work
├─ .github/workflows/ci.yml    CI
├─ CHANGELOG.md                Change history
├─ AGENTS.md                   Rules for AI-assisted changes
├─ README.md                   Public documentation
├─ package.json                Workspace root and scripts
└─ package-lock.json           Lockfile (commit this)
```

## Publishing

```bash
npm run verify
npm run publish:shapy
```

Before publishing, bump versions, update `CHANGELOG.md`, run the demo and
the manual checks in [`AGENTS.md`](./AGENTS.md), and review the dry-run output.
Run `npm publish` only after explicit approval and a successful `npm login`.

## Troubleshooting

### Nothing appears

Check these in order:

1. Did you import `shapy`?
2. Does `shapy-background` have a size? Try
   `shapy-background { position: fixed; inset: 0; display: block; }`.
3. Is the element inside the `<body>`?
4. Check the browser console for errors.

### Vue says "Failed to resolve component: shapy-background"

Add the `isCustomElement` option shown in [Vue 3](#vue-3).

### The pattern changes every time I reload

You did not pass a `seed`. Shapy generates a fresh seed for each element when
`seed` is missing. Pass a fixed seed to keep the pattern.

### Stickers do not appear

Make sure you import from `shapy/stickers`, set `registry-data` to
`JSON.stringify(STICKER_REGISTRY)`, and set `shape-set="stickers"` or use
`shape-set="custom"` with sticker keys.

### I changed the seed but the pattern did not change

Attribute changes are debounced by 80 ms. Wait a moment, and make sure you are
setting the attribute on the `<shapy-background>` element, not on its parent.

### It does not work with server-side rendering

Shapy needs the browser. In Next.js, Nuxt, or another SSR framework, import it
only on the client (for example inside `useEffect` or `onMounted`).

More fixes are in the [step-by-step guide](./docs/GETTING_STARTED.md#troubleshooting).

## Browser support

Modern browsers with Custom Elements (including Shadow DOM), CSS custom
properties, CSS `clip-path`, CSS parts, and CSS animations. The renderer lives in
an open shadow root, so host-page CSS cannot style its internals; use the
documented `::part()` hooks and `--shapy-*` variables instead. The custom element
exposes `role="img"` and an overridable `aria-label` for accessibility, switches
to `role="group"` when text is visible, and respects
`prefers-reduced-motion: reduce` by disabling shape animations.

## License

MIT. See [LICENSE](./LICENSE).
