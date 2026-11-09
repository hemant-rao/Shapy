# Shapy — AI Context

Last updated: 2026-11-10

This document is the fast path for future AI agents. Read it before opening the
source. Update it after every architectural or behavioral change.

## What this project is

`shapy` is a zero-dependency Web Component that renders a seedable, animated,
generative shape background. It also ships:

- `shapy/stickers`: an optional serializable sticker registry, shipped inside
  the core package as a subpath.
- A Vue demo with two pages: `/` (background only) and `/config` (full control
  panel).
- A standalone advanced reference demo at the repository root (`index.html`).

The repository uses two root-level workspaces: `shapy/` (the npm package) and
`vue-demo/` (private Vue 3 demo). The Vue demo consumes the package through its
public exports, including the `shapy/stickers` subpath; there are no Vite source
aliases.

The package is pre-publish. The npm name `shapy` is available as of the last
check. The public repository is `https://github.com/hemant-rao/Shapy`.

## Repository map

| Path | Purpose |
| --- | --- |
| `shapy/src/shapy-bg.js` | Custom element, open shadow root, CSS scoping, document/window shims, lifecycle. |
| `shapy/src/shapy-index.html` | Full renderer template source. The advanced composition lives here. |
| `shapy/src/shapy-template.js` | Generated `SHAPY_HTML` string. Never edit by hand. |
| `shapy/src/catalog.js` | Core shape groups, emoji pool, key helpers. |
| `shapy/src/index.js` | `createShapy()` API and catalog re-exports. |
| `shapy/index.d.ts`, `catalog.d.ts`, `stickers.d.ts` | Public TypeScript types. |
| `shapy/scripts/build-template.mjs` | Generates `shapy-template.js` from `shapy-index.html`. |
| `shapy/src/stickers.js` | `STICKER_CATALOG`, `STICKER_REGISTRY`, `getRegistryData()`, `registerStickers()`; exposed as `shapy/stickers`. |
| `vue-demo/src/pages/Home.vue` | Background-only demo. |
| `vue-demo/src/pages/Config.vue` | Full control panel + shape picker. |
| `vue-demo/src/App.vue` | Floating navigation shell. |
| `vue-demo/vite.config.js` | Vue custom-element config; the workspace package resolves through its public exports. |
| `index.html` | Standalone advanced reference demo. Keep the renderer source byte-identical to `shapy-index.html`. |
| `README.md` | Public repository documentation, including the unique-composition calculation. |
| `AGENTS.md` | Strict rules for AI-assisted changes. |
| `docs/CHANGELOG.md` | Change history. |

## Rendering pipeline

1. `shapy-bg.js` observes these attributes:

   `seed`, `palette`, `shape-set`, `layout`, `align`, `motion`, `direction`,
   `density`, `scale`, `size-mode`, `speed`, `move`, `custom-colors`,
   `safe-area`, `paused`, `shapes`, `registry-data`.

2. `_readState()` builds a plain state object:

   ```js
   {
     seed, palette, shapeSet, layout, align, motion, direction,
     density, scale, sizeMode, speed, move, customColors,
     safeArea, paused, shapes, registry
   }
   ```

3. `_init()` parses `SHAPY_HTML` with `DOMParser`, copies the template's
   `<style>` text into an open shadow root (rewriting `:root`, `html, body`, and
   `body` selectors), clones the body markup, and executes the renderer script
   in a scoped IIFE. `registry-data` is parsed with `JSON.parse`; `shapes`
   accepts a comma list or JSON array.

4. The renderer runs in the component's open shadow root. Host-page CSS cannot
   match renderer elements. A `document` shim maps renderer queries to the shadow
   root. A `window` shim maps `innerWidth`/`innerHeight` to the host size,
   forwards non-resize listeners to `globalThis`, and exposes
   `__SHAPY_STATE__`, `__SHAPY_APPLY__`, and `__SHAPY_DESTROY__`.
   `window.ShapyRegistry` proxies to `globalThis.ShapyRegistry`. There is no
   `eval` or `new Function`; the renderer script text is static and generated
   from `shapy-index.html`.

5. Inside the template, `state` merges `defaults`, the shim's
   `window.__SHAPY_STATE__`, and the seed. `makeRng()` hashes the full seed
   string into four 32-bit lanes and seeds `sfc32` with a 128-bit state.
   `readSeed()` accepts URL seeds up to 64 characters. If the host omits the
   `seed` attribute, `shapy-bg.js` supplies a fresh 128-bit seed per element
   instance. The renderer then:

   - resolves a shape pool with `getPool()`,
   - computes count/grid with `getCount()` and `getGrid()`,
   - builds positions with `buildPositions()` and `applyAlign()`,
   - creates ambient shapes from the selected pool,
   - creates main shapes with `createShape()`,
   - assigns motion CSS variables with `motionFor()`,
   - starts live updates that periodically tweak animations.

Lifecycle: the first `connectedCallback` calls `_init()`. Later attribute changes
are debounced by 80 ms and call `_apply(state)`. `disconnectedCallback` calls
`_destroy()`, which clears renderer timers/listeners and empties the shadow root;
reconnecting reinitializes the renderer. A `ResizeObserver` on the host and a
global `resize` listener trigger re-renders. The host exposes `role="img"` and
`aria-label="Shapy generative background"` by default.

## Seed and combination space

The renderer hashes the full seed string into four 32-bit lanes and seeds
`sfc32` with a 128-bit state. A 32-character hex seed uses the full 2^128 seed
space. Including the sticker registry there are 79 selectable shape keys. The
repository README documents the full combination calculation: approximately
`1.912345 × 10^76` seed × full-visual-settings combinations, or
`3.824690 × 10^76` when paused is included. Custom colors and custom image
registries are unbounded on top of that.

## Shape pool resolution

`getPool()` order:

1. `shapeSet === 'custom'`:
   - build `getAllEntries()` (core shapes + emoji + injected registry groups),
   - keep entries whose key is in `state.shapes`,
   - if the selection is empty or invalid, fall back to all entries.
2. Injected registry group for `state.shapeSet` (`state.registry[groupId]`).
3. `window.ShapyRegistry[state.shapeSet].getPool()` for script-based registration.
4. `emoji` → `EMOJI_POOL` entries.
5. `all` → `getAllEntries()`.
6. Core group (`geometry`, `lines`, `organic`) filtered from `SHAPE_DEFS`.
7. If a group is missing, fall back to all entries.

`getAllEntries()` includes:
- 40 core shapes from `SHAPE_DEFS` (`geometry` 32, `lines` 3, `organic` 5),
- 29 emoji from `EMOJI_POOL` (`emoji-0` … `emoji-28`),
- every group in `state.registry`.

Registry group format:

```json
{
  "stickers": {
    "label": "Stickers",
    "items": [
      { "key": "sticker-0", "label": "Party popper", "emoji": "🎉", "size": 1.15 }
    ]
  }
}
```

Items may use `emoji` or `image`. `image` renders an `<img>` with
`object-fit: contain`; `emoji` renders text.

## Placement and size logic

### Layout (`state.layout`)

- `auto` — chooses `scatter` or `grid` from a separate layout RNG.
- `scatter` — full cell jitter (0.42).
- `grid` — aligned grid with small jitter (0.12).
- `rows` — horizontal bands: `y` is the exact row center, `x` jitters.
- `columns` — vertical bands: `x` is the exact column center, `y` jitters.
- `center` — compresses both axes toward 50%.
- `edges` — pushes positions outward from 50%, clamped to 3–97%.

### Alignment (`state.align`)

Applied after layout positions:

- `left` — compresses x into roughly 4–76%.
- `right` — compresses x into roughly 28–96%.
- `center` — compresses x into roughly 19–81%.
- `top` / `bottom` — same idea vertically.
- `middle` — compresses y into roughly 19–81%.
- `random` — no bias.

### Size (`state.size-mode`)

`size = cell * sizeFactor * (scale / 100) * shapeScale`, then capped by
`maxShape / ratioMax`. `shapeScale` is `def.size || 1` except in `same` mode,
where it is forced to `1` so every shape shares one base size. Aspect ratios
still produce different widths and heights for non-square shapes.

`maxShape` is multiplied by `scale / 110`, so the `scale` slider shrinks or grows
capped shapes too, not only the uncapped ones. The default `scale="110"` keeps the
previous caps unchanged.

| Mode | Size factor |
| --- | --- |
| `mixed` | `0.12 + rand()^2 * 0.92`, with a 3% chance of a larger outlier |
| `same` | `0.5` for every shape, with `shapeScale = 1` |
| `subtle` | `0.34 + rand() * 0.32` |
| `dramatic` | `0.1 + rand()^0.7 * 1.0` |
| `small` | `0.1 + rand() * 0.2` |
| `medium` | `0.3 + rand() * 0.28` |
| `large` | `0.55 + rand() * 0.38` |

### Responsive caps

`maxShape` (before the `scale / 110` multiplier):

- mobile (`vw < 700`): `min(cell * 0.72, vw * 0.09, vh * 0.06, 56)`
- desktop: `min(cell * 1.0, vw * 0.055, vh * 0.1, 110)`

`ambientMax`:

- mobile: `min(maxShape * 1.35, min(vw, vh) * 0.16, 64)`
- desktop: `min(maxShape * 1.35, min(vw, vh) * 0.18, 120)`

Ambient size is
`min(min(vw, vh) * (0.08 + rand() * 0.14) * (scale / 100), ambientMax / ratioMax)`.
Because `ambientMax` derives from the scaled `maxShape`, the ambient layer also
shrinks with the slider; the fixed 64/120 px safety cap still applies at the top
end.

Ambient shapes use only the selected pool. This is important: a single-shape
selection must not show other ambient shape kinds.

Safe area uses the hidden `.hero__copy` bounding rect. The `.hero` stays in the
layout with `visibility: hidden` so the rect remains measurable; if the rect has
zero width or height, the renderer falls back to a proportional safe rectangle.

## Motion

`motionFor(rand, index)` maps the selected motion mode to CSS variables:
`--anim`, `--dur`, `--delay`, `--dx`, `--dy`, `--spin`, `--sc`, `--ease`,
`--adir`, `--iterations`. The template's CSS keyframes consume these variables.
`state.paused` pauses the animations via injected CSS and the template state.

## Demo state (Vue)

`Config.vue` mirrors every renderer control:

- seed, palette, shape set
- custom shape picker (79 chips: 40 core + 29 emoji + 10 stickers)
- layout, alignment, size mode
- motion, direction, density, scale, speed, move
- custom colors, safe area, pause
- new pattern, copy seed, reset

Shape picker behavior:

- `selectedKeys` is derived from `shapeSet`:
  - `all` → every key
  - `custom` → `state.shapes`
  - group → that group's keys
- Clicking a chip toggles it and switches to `custom`.
- `All` sets `shapeSet = 'all'`.
- `Clear` sets `shapeSet = 'custom'` with an empty list; the renderer falls back
  to all shapes and the UI shows a hint.
- Each group has an `only` button that selects just that group.

`registry-data` is bound from `getRegistryData()` in `shapy/stickers`.

## Build

After editing `shapy/src/shapy-index.html`:

```bash
node shapy/scripts/build-template.mjs
```

or:

```bash
npm run build:template
```

This writes `shapy/src/shapy-template.js`. The root `index.html` is a separate
copy of the renderer logic and must be updated in parallel when the renderer
changes. `npm run verify` regenerates the template, builds the Vue demo, and
runs `npm pack --dry-run` for the package.

## Testing

The demo runs with Vite at the URL it prints (usually
`http://localhost:5173`) while developing.

Playwright scripts used during development live in a local temp folder outside
the repository. Point the scripts at any Chromium/Chrome executable available on
your machine.

Checks that matter:

- `#shapes .shape__inner` vs `#ambient .shape__inner` inside
  `document.querySelector('shapy-background').shadowRoot`
- host attributes as the source of truth for current state
- custom selection 1, 2, 3, 4, 5+ keys
- emoji and sticker-only pools
- layout/alignment/size mode geometry
- mobile `390x844`, desktop `1350x800`, wide `1920x1080`
- scale `60`, `110`, and `140` for both main and ambient layers
- pause (`animation-play-state`), reset, custom colors, safe area
- two components on one page remain independent; hostile light-DOM CSS does not
  change renderer shapes
- same seed + same settings match across re-renders and page reloads; different
  seeds differ; two no-seed elements get distinct 32-char hex seeds
- host resize, attribute updates, disconnect/reconnect, and zero leaked
  `__shapy_scope_*` globals
- standalone `index.html` still renders and responds to its scale slider

## Known limitations / technical debt

1. **Shadow DOM is required.** The renderer needs Custom Elements and
   `attachShadow`; there is no light-DOM fallback. If Shadow DOM is unavailable,
   the component renders nothing.
2. **Duplicated renderer source.** `index.html` and `shapy-index.html` must be
   kept byte-identical manually.
3. **No automated test suite.** Verification is currently manual/Playwright.
4. **Not published.** Version `0.1.0` is ready for a dry run but has not been
   pushed to npm. The GitHub repository is configured in the package manifest.
5. **Renderer globals are shimmed, not fully isolated.** `window` and `document`
   inside the renderer are shims, but non-resize listeners are forwarded to the
   real `globalThis`. `window.ShapyRegistry` intentionally proxies to
   `globalThis.ShapyRegistry`; `registry-data` remains the declarative path.

## Next recommended work

1. Run `npm run verify` after each change and inspect the dry-run file lists.
2. Add a small automated Playwright test suite if the project grows.
3. Consider exposing documented `::part()` hooks or CSS custom properties for
   advanced host styling.
