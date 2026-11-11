# shapy-bg

Seedable generative shape backgrounds as a zero-dependency Web Component.

Shapy turns a short seed into a one-of-one composition of shapes, lines, organic
forms, emoji, images, or inline icons. It can also render an optional text
overlay, so a single element can be a complete hero background.

> **New to Shapy?** Read the
> [step-by-step guide](https://github.com/hemant-rao/shapy-bg/blob/main/docs/GETTING_STARTED.md).
> It covers installation, your first background, common recipes, and
> troubleshooting.

> **Sponsored by [Odio Book](https://odiobook.com)** — the all-in-one AI video &
> audio studio: AI video editing, auto subtitles, scene detection, voice
> generation and text-to-speech, all in the browser. Odio Book funds the time
> that goes into this package. **[Try it free →](https://odiobook.com)**

---

## Contents

| | |
| --- | --- |
| [Install](#install) · [Quick start](#quick-start) | Get running in 2 minutes |
| [What you can control](#what-you-can-control) · [Attributes](#attributes) | Every option and default |
| [Deterministic frames and video](#deterministic-frames-and-video) · [Text overlay](#text-overlay) · [Theming](#theming) | Capture, text, colors |
| [Custom shapes, images, and icons](#custom-shapes-images-and-icons) · [Optional stickers](#optional-stickers) | Your own media |
| [JavaScript API](#javascript-api) · [TypeScript](#typescript) | Programmatic control |
| [Troubleshooting](#troubleshooting) | Fixes |
| [Support this project](#support-this-project) · [Sponsor: Odio Book](#sponsor-odio-book) | Sponsor the maintenance |

---

## Install

```bash
npm install shapy-bg
```

Shapy is a browser-only Web Component. It needs Custom Elements and Shadow DOM,
which are available in current Chrome, Edge, Firefox, and Safari.

## Quick start

### 1. Import the package once

```js
import 'shapy-bg';
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

## What you can control

- **The composition:** seed, shape pool, layout, alignment, size mode, density,
  scale, motion, direction, speed, and movement.
- **The colors:** palette, background, text, muted text, accent, glow, and scrim,
  with per-element attributes, host CSS variables, or both.
- **The text:** an eyebrow, headline, accent line, and body paragraph, positioned
  in any of nine spots. Text is plain text, never HTML.
- **The media:** built-in shapes and emoji, the optional sticker registry, your
  own image URLs, and safe inline SVG icons built from path data.
- **The API:** `setOptions()`, `getOptions()`, `seek()`, `refresh()`,
  `shapy:ready`, and `shapy:change`.
- **Video and stills:** `live="off"`, `time`, seamless `loop`, 9:16 safe zones,
  and exact frame capture with `seek()`.
- **The hooks:** `::part(text)`, `::part(eyebrow)`, `::part(headline)`,
  `::part(body)`, and the `--shapy-*` host variables.

## Attributes

### Pattern and motion

| Attribute | Default | Description |
| --- | --- | --- |
| `seed` | fresh 128-bit seed | Deterministic seed. If omitted, each element instance gets a fresh 128-bit seed. |
| `palette` | `midnight` | `midnight`, `sandstone`, `bauhaus`, `forest`, `plum`, `ocean`, `clay`, `mono`. |
| `shape-set` | `all` | `all`, `geometry`, `lines`, `organic`, `emoji`, `stickers`, `custom`, or a registry group id. |
| `shapes` | empty | Comma list or JSON array of shape keys for `shape-set="custom"`. |
| `registry-data` | empty | JSON string with custom shape groups. `registry` is an alias. |
| `layout` | `auto` | `auto`, `scatter`, `grid`, `rows`, `columns`, `center`, `edges`. |
| `align` | `random` | `random`, `left`, `center`, `right`, `top`, `middle`, `bottom`. |
| `motion` | `mixed` | `mixed`, `chaos`, `flow`, `bounce`, `drift`, `spin`, `pulse`, `wobble`, `orbit`, `calm`. |
| `direction` | `random` | `random`, `lr`, `rl`, `tb`, `bt`, `dr`, `dl`, `ur`, `ul`, `alternate`. |
| `density` | `72` | 20–100. How many shapes are drawn. |
| `scale` | `110` | 60–140. Overall shape size multiplier, including responsive caps. |
| `size-mode` | `mixed` | `mixed`, `same`, `subtle`, `dramatic`, `small`, `medium`, `large`. |
| `speed` | `100` | 50–200. Animation speed multiplier. |
| `move` | `100` | 30–200. Movement distance multiplier. |
| `custom-colors` | empty | Comma-separated CSS colors. Unsafe or invalid tokens are dropped. |
| `safe-area` | off | Boolean attribute. Dims shapes behind the visible text overlay. |
| `safe-zones` | empty | Dims shapes inside platform UI bands. Presets: `tiktok`, `reels`, `shorts`, `story`; or a JSON array of `{top,right,bottom,left}` percentages. |
| `live` | on | `off` disables the periodic live mutations. Animations keep running unless `paused` or `time` is set. |
| `time` | unset | Freezes the timeline at an exact second. Implies deterministic mode. |
| `loop` | off | Seamless loop period in seconds. Bare `loop` uses 10 seconds. Loop mode disables live mutations. |
| `aspect` | `auto` | `auto`, `9:16`, `16:9`, `1:1`, or `4:5`. Sets the host aspect ratio when the parent allows automatic height. |
| `paused` | off | Boolean attribute. Pauses all animations. |

### Colors

All color attributes accept a normal CSS color: hex, `rgb()`, `hsl()`, named
colors, `transparent`, and so on. Invalid values are ignored. See
[Theming](#theming) for precedence.

| Attribute | Default | Description |
| --- | --- | --- |
| `background` | palette background | Page/background base color. Aliases: `backgroundColor`, `bg`. |
| `text-color` | palette ink | Headline and primary text. Aliases: `textColor`, `foreground`. |
| `muted-color` | palette muted | Eyebrow and body text. |
| `accent-color` | palette accent | Accent text and highlighted words. |
| `glow-color` | palette glow | Radial glow behind the composition. |
| `scrim-color` | palette scrim | Readability scrim color. Visible only with `scrim`. |
| `scrim` | off | Boolean attribute. Shows the readability scrim. |

### Text

Text is optional. Leave every text attribute empty to render only the
background.

| Attribute | Default | Description |
| --- | --- | --- |
| `text` | empty | Headline. Use a real newline (or `&#10;` in HTML) for line breaks. `headline` is an alias. |
| `text-accent` | empty | Accent line appended after the headline in the accent color. |
| `subtext` | empty | Supporting paragraph. `description` is an alias. |
| `eyebrow` | empty | Small uppercase label above the headline. |
| `text-position` | `middle-left` | `top-left`, `top-center`, `top-right`, `middle-left`, `middle-center`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right`. |
| `text-align` | inferred | `left`, `center`, or `right`. Defaults to the alignment implied by `text-position`. |
| `text-scale` | `100` | 50–200. Scales the headline and body text. |
| `font-family` | package display font | A safe CSS font stack, for example `Georgia, serif`. |
| `font-weight` | `400` | 100–900. Headline weight. |

Boolean attributes are enabled by presence:

```html
<shapy-background safe-area paused scrim></shapy-background>
```

## Deterministic frames and video

Shapy can be the visual source for a video pipeline. Use `live="off"` to stop the
periodic composition mutations, and `seek()` to freeze an exact frame:

```html
<shapy-background
  seed="reel-01"
  palette="ocean"
  live="off"
  loop="8"
  safe-zones="tiktok"
  aspect="9:16"
  style="width: 100%; display: block;"
></shapy-background>
```

```js
const element = document.querySelector('shapy-background');

await element.seek(2.5);   // freeze at 2.5 seconds
// capture the element with your screenshot or recording tool

await element.seek(null);  // resume the live timeline
```

- `live="off"` keeps the seeded composition fixed. Only the CSS animations move.
- `time="4"` is the declarative equivalent of `seek(4)`.
- `loop="8"` makes every animation duration divide 8 seconds exactly, so the
  frame at `8s` matches `0s`. `seek()` wraps around the loop.
- `safe-zones` accepts a comma list of presets or a JSON array of custom
  rectangles. Custom values are percentages of the host box:

  ```html
  <shapy-background
    safe-zones='[{"top":0,"right":100,"bottom":15,"left":0}]'
  ></shapy-background>
  ```

- `aspect="9:16"` sets an aspect ratio on the host. For a full-bleed video, size
  a wrapper to 1080×1920 instead and let the element fill it.
- `paused` freezes animations but does not disable live mutations. Use
  `live="off"` or `time` for reproducible output.

### Seed stability

A seed is stable within an engine version. The same seed, options, viewport,
device pixel ratio, and `SHAPY_ENGINE_VERSION` produce the same static
composition and the same `seek()` frames. Package patches and minors keep the
engine version; any change that alters generated output bumps the engine version
and the package major version. Live mutations are intentionally non-deterministic
and are outside this contract. See
[Seed stability](https://github.com/hemant-rao/shapy-bg/blob/main/docs/SEED_STABILITY.md).

## Video export

The core package has no encoder and stays zero-dependency. Use the separate
`shapy-render` package for MP4, WebM, or PNG sequences:

```bash
npm install shapy-bg shapy-render
npx playwright install chromium
npx shapy-render --seed reel-01 --duration 8 --output reel.mp4
```

- MP4 needs a system `ffmpeg` with `libx264`.
- Non-alpha WebM VP9 works with Playwright's bundled ffmpeg. Alpha WebM needs a
  full ffmpeg with PNG decoding.
- Alpha is supported in WebM and PNG, not MP4.
- Keep `--duration` a multiple of `--loop` for a clean repeat.
- `shapy-render` captures with `live="off"` and `seek()` for deterministic frames.

See the [shapy-render README](https://github.com/hemant-rao/shapy-bg/tree/main/packages/shapy-render#readme)
for the CLI and library API.

## Text overlay

```html
<shapy-background
  seed="hero"
  palette="ocean"
  background="#06121f"
  text-color="#f8fafc"
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

- `text` and `text-accent` are rendered as text nodes. HTML is not interpreted.
- `text-accent` is appended on its own line and uses the accent color.
- The overlay is `pointer-events: none`; it never blocks clicks on your page.
- When text is visible, the default host role becomes `group` and the default
  label comes from the headline. When no text is set, the role returns to `img`
  and the label returns to `Shapy generative background`.
- A host-supplied `role` or `aria-label` is never overwritten.
- `safe-area` uses the visible text overlay's bounds, so shapes behind the text
  are dimmed.

## Theming

Color precedence, from strongest to weakest:

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

`custom-colors` is separate: it overrides the colors used by the generated
shapes, while the color attributes and host variables theme the page, scrim, and
text.

### CSS parts

The text overlay exposes stable parts:

```css
shapy-background::part(text) {
  max-width: 52rem;
}

shapy-background::part(headline) {
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

shapy-background::part(eyebrow) {
  letter-spacing: 0.24em;
}

shapy-background::part(body) {
  max-width: 36ch;
}
```

## Custom shapes, images, and icons

Custom media lives in a registry. The registry is passed as JSON through
`registry-data`; it is never stored globally.

```js
const registry = {
  brand: {
    label: 'Brand marks',
    items: [
      { key: 'logo', label: 'Logo', image: '/logo.svg', size: 1.1 },
      { key: 'spark', label: 'Spark', emoji: '✨', color: '#fbbf24' },
      {
        key: 'heart',
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
element.setAttribute('shape-set', 'brand');
```

Or select individual registry items:

```js
element.setAttribute('shape-set', 'custom');
element.setAttribute('shapes', 'logo,spark,heart');
```

### Registry item format

```js
{
  key: 'unique-key',        // string; auto-generated if omitted
  label: 'Readable name',   // optional; used as image alt text
  emoji: '✨',              // optional media
  image: '/logo.svg',       // optional media
  icon: { ... },            // optional media
  color: '#fbbf24',         // optional tint for emoji/icons
  size: 1,                  // 0.05–5, default 1
  weight: 1,                // 0.01–100, default 1
  ratio: [1, 1]             // [width, height], each 0.05–10
}
```

An item must provide at least one of `emoji`, `image`, or `icon`; items without
renderable media are dropped. If more than one is provided, `emoji` wins, then
`icon`, then `image`.

A group can be an object with `label` and `items`, or just an array of items:

```js
const registry = {
  simple: [
    { key: 'star', emoji: '⭐' },
    { key: 'dot', image: '/dot.png' }
  ]
};
```

### Image formats

Allowed:

- `https://example.com/logo.png`
- `//cdn.example.com/logo.png`
- `/assets/logo.svg`, `./logo.svg`, `../logo.svg` (resolved by the browser
  against your page)
- `data:image/png;base64,...`
- `data:image/jpeg;...`, `data:image/gif;...`, `data:image/webp;...`,
  `data:image/avif;...`, `data:image/svg+xml;...`

Rejected:

- `javascript:...`
- `data:text/html,...`
- `blob:...`, `ftp:...`, and every other scheme
- URLs containing backslashes

Images render with `object-fit: contain`. Shapy validates the URL format but
does not fetch, proxy, or inspect remote image content.

### Icon format

Icons are path data, not raw SVG markup. Raw `<svg>` strings are rejected.

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

Defaults:

- `viewBox` is `0 0 24 24` when omitted or invalid.
- With no `fill` and no `stroke`, paths use `currentColor`.
- With `stroke` and no `strokeWidth`, the width is `2`.
- Path data is limited to SVG path commands and numbers.

### Limits and sanitization

- 20 registry groups per element.
- 200 items per group.
- 64 custom colors.
- 256 shape keys.
- Labels are truncated to 120 characters; emoji to 32 characters.
- Numeric values are clamped to the ranges above.
- Every value is treated as untrusted; unsafe colors, images, and icons are
  dropped instead of being rendered.

## Optional stickers

```js
import 'shapy-bg';
import { STICKER_REGISTRY } from 'shapy-bg/stickers';

const element = document.querySelector('shapy-background');
element.setAttribute('registry-data', JSON.stringify(STICKER_REGISTRY));
element.setAttribute('shape-set', 'stickers');
```

`shapy-bg/stickers` exports:

- `STICKER_CATALOG` — serializable sticker items.
- `STICKER_REGISTRY` — a ready-to-serialize registry group.
- `getRegistryData()` — returns the JSON string for `registry-data`.
- `registerStickers(element)` — sets `registry-data` on an element and returns
  the registry. It never writes to `globalThis`.

```js
import { registerStickers } from 'shapy-bg/stickers';

const element = document.querySelector('shapy-background');
registerStickers(element);
element.setAttribute('shape-set', 'stickers');
```

Stickers are part of the `shapy-bg` package and load only when you import the
`shapy-bg/stickers` subpath.

## JavaScript API

```js
import { createShapy, createSeed } from 'shapy-bg';

const element = createShapy().mount(document.querySelector('#background'), {
  seed: '4D5E465BCA',
  palette: 'ocean',
  shapeSet: 'custom',
  shapes: ['circle', 'emoji-0'],
  layout: 'rows',
  align: 'center',
  sizeMode: 'same',
  background: '#08111f',
  accentColor: '#fbbf24',
  text: 'Shape your',
  textAccent: 'story.',
  textPosition: 'middle-center',
  subtext: 'A complete hero from one element.'
});

element.setOptions({ palette: 'plum', text: 'Updated live' });
element.refresh();
console.log(element.getOptions());
```

`mount()` accepts camelCase or kebab-case keys, takes an element as the
container, and returns the created element. Use `document.querySelector()` if
you only have a selector string. It replaces the container's existing content.

### `setOptions(options)`

Updates any subset of options and returns the element. camelCase and kebab-case
keys both work. `null`, `undefined`, and `false` remove an option; `true` adds a
boolean attribute.

```js
element.setOptions({
  density: 48,
  paused: true,
  text: null,
  background: null
});
```

### `getOptions()`

Returns the current normalized options, including the generated or explicit
seed, parsed registry, color values, and text settings. `customColors` is an
array of colors.

```js
const options = element.getOptions();
console.log(options.seed, options.density, options.customColors);
```

### `refresh()`

Forces a re-render with the current attributes and returns the element.

```js
element.refresh();
```

### `seek(seconds)`

Freezes the renderer at an exact timeline position. The promise resolves after
the frame has been painted. Pass `null` to resume the live timeline.

```js
await element.seek(3.5);
await element.seek(null);
```

`seek()` does not rewrite the `time` attribute, so repeated frame captures do not
trigger a full re-render. It does disable live mutations while frozen.

### Events

```js
element.addEventListener('shapy:ready', (event) => {
  console.log('first render', event.detail.seed, event.detail.options);
});

element.addEventListener('shapy:change', (event) => {
  console.log('updated options', event.detail.options);
});
```

- `shapy:ready` fires once after the first render.
- `shapy:change` fires after `setOptions()`, `refresh()`, and debounced attribute
  updates.
- Both events expose `detail.element`; `shapy:ready` also exposes
  `detail.seed`. Both include `detail.options` from `getOptions()`.

### New seed

```js
element.setAttribute('seed', createSeed());
```

## TypeScript

Type definitions ship with the package. The element, options, registry items,
icons, events, and methods are all typed:

```ts
import { createShapy, type ShapyOptions, type ShapyRegistry } from 'shapy-bg';

const registry: ShapyRegistry = {
  brand: {
    label: 'Brand',
    items: [{ key: 'logo', image: '/logo.svg', size: 1.1 }]
  }
};

const options: ShapyOptions = {
  seed: '4D5E465BCA',
  palette: 'ocean',
  text: 'Hello',
  textPosition: 'middle-center',
  registryData: registry
};

const container = document.querySelector('#background');
if (container) createShapy().mount(container, options);
```

## Troubleshooting

### Nothing appears

1. Did you import `shapy-bg`?
2. Does `shapy-background` have a size? Try
   `shapy-background { position: fixed; inset: 0; display: block; }`.
3. Check the browser console for errors.

### The text does not appear

Check that at least one of `text`, `text-accent`, `subtext`, or `eyebrow` is set.
An empty `text` attribute alone is not enough.

### A custom item is missing

An item needs `emoji`, `image`, or `icon`. Check that the key is selected through
`shape-set` or `shapes`, and that the image URL uses an allowed format.

### Stickers do not appear

Import from `shapy-bg/stickers`, set `registry-data` to
`JSON.stringify(STICKER_REGISTRY)`, and set `shape-set="stickers"` or use
`shape-set="custom"` with sticker keys.

### Vue says "Failed to resolve component: shapy-background"

Add the `isCustomElement` option shown in the
[step-by-step guide](https://github.com/hemant-rao/shapy-bg/blob/main/docs/GETTING_STARTED.md#use-with-vue-3).

### The pattern changes every time I reload

Pass a fixed `seed`; without one, each element gets a fresh 128-bit seed.

## Package exports

| Import | What you get |
| --- | --- |
| `shapy-bg` | Registers `<shapy-background>`, and exports `createShapy()`, `createSeed()`, `SHAPY_ENGINE_VERSION`, and the catalog helpers. |
| `shapy-bg/element` | Registers `<shapy-background>` only. |
| `shapy-bg/catalog` | Shape and emoji catalog data without registering the element. |
| `shapy-bg/stickers` | Sticker catalog, serializable registry, and helpers. |

## Documentation

- [Step-by-step guide](https://github.com/hemant-rao/shapy-bg/blob/main/docs/GETTING_STARTED.md)
- [Attributes](#attributes)
- [Text overlay](#text-overlay)
- [Theming](#theming)
- [Custom shapes, images, and icons](#custom-shapes-images-and-icons)
- [JavaScript API](#javascript-api)
- [Full repository documentation](https://github.com/hemant-rao/shapy-bg#readme)
- [Contributing](https://github.com/hemant-rao/shapy-bg/blob/main/CONTRIBUTING.md)
- [Security policy](https://github.com/hemant-rao/shapy-bg/blob/main/SECURITY.md)
- [Code of conduct](https://github.com/hemant-rao/shapy-bg/blob/main/CODE_OF_CONDUCT.md)

## Support this project

`shapy-bg` is free and MIT-licensed, built and maintained by
[Hemant Rao](https://github.com/hemant-rao) in his own time. If it saved you a
day of work — or your company ships it in production — you can back its
maintenance:

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-%E2%9D%A4-db61a2?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/hemant-rao)
&nbsp;
[![Star on GitHub](https://img.shields.io/github/stars/hemant-rao/shapy-bg?style=for-the-badge&logo=github&color=444)](https://github.com/hemant-rao/shapy-bg)

**[Become a sponsor](https://github.com/sponsors/hemant-rao)** — one-time or
monthly, any amount.

Sponsorship funds bug fixes, browser testing, and keeping the docs honest.
Starring the repo and reporting issues helps just as much.

## Sponsor: Odio Book

Maintenance of this package is sponsored by **[Odio Book](https://odiobook.com)**,
built by the same developer.

**Odio Book is an all-in-one AI video & audio studio that runs in your browser** —
describe the edit in plain English and it happens. No install, no watermarks,
and your files never leave the tab.

| | |
| --- | --- |
| **[AI Video Editor](https://odiobook.com)** | Plain-English editing instead of a timeline |
| **[AI Subtitles](https://odiobook.com)** | Auto-generate and burn in subtitles |
| **[AI Scene Detection](https://odiobook.com)** | Find cuts, export clips, chapters or a cut list |
| **[AI Voice Generator](https://odiobook.com)** | Natural speech in 7 languages, plus text-to-speech |
| **[Voice Studio](https://odiobook.com)** | Multi-character scripts into finished audio |
| **Manual toolkit** | Trim, merge, convert, resize, compress, stabilize, add music |

**[Start free at odiobook.com](https://odiobook.com)**

If this package saved you time, the best thank-you is giving Odio Book a spin —
it is what keeps this library maintained.

More packages by the same author:
[universal-toast-message](https://www.npmjs.com/package/universal-toast-message).

## License

MIT © [Hemant Rao](https://github.com/hemant-rao). See [LICENSE](./LICENSE).
