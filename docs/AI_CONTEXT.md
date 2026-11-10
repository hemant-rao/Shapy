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
- A standalone advanced reference demo at `examples/standalone.html`, generated
  from the package renderer source.
- A small copy-paste example at `examples/minimal.html`.

The repository is a two-workspace monorepo: `packages/shapy` (the npm package)
and `apps/demo` (private Vue 3 demo). The Vue demo consumes the package through
its public exports, including the `shapy/stickers` subpath; there are no Vite
source aliases.

The package is pre-publish. The npm name `shapy` is available as of the last
check. The public repository is `https://github.com/hemant-rao/Shapy`. The
version is `1.0.0`; do not bump it until the owner explicitly publishes or asks
for a version change.

## Project identity and support

- **Author and maintainer:** Hemant Rao
  (<https://github.com/hemant-rao>).
- **Repository:** <https://github.com/hemant-rao/Shapy>.
- **Sponsor:** Odio Book (<https://odiobook.com>).
- **Funding:** GitHub Sponsors
  (<https://github.com/sponsors/hemant-rao>).
- **License:** MIT, copyright Hemant Rao.
- **Package:** `shapy`, version `1.0.0`, zero runtime dependencies.

Keep the author, sponsor, and funding text consistent across `README.md`,
`packages/shapy/README.md`, `packages/shapy/package.json`, `package.json`,
`LICENSE`, `packages/shapy/LICENSE`, `.github/FUNDING.yml`, `CONTRIBUTING.md`,
`SECURITY.md`, and `CODE_OF_CONDUCT.md`.

## Repository map

| Path | Purpose |
| --- | --- |
| `packages/shapy/src/shapy-bg.js` | Custom element, open shadow root, CSS scoping, document/window shims, lifecycle, theming, text overlay, public methods/events. |
| `packages/shapy/src/shapy-index.html` | Full renderer template source: composition, theming, text overlay CSS, registry and color sanitization. |
| `packages/shapy/src/shapy-template.js` | Generated `SHAPY_HTML` string. Never edit by hand. |
| `packages/shapy/src/catalog.js` | Core shape groups, emoji pool, key helpers. |
| `packages/shapy/src/index.js` | `createShapy()`, `createSeed()`, `SHAPY_ENGINE_VERSION`, and catalog re-exports. |
| `packages/shapy/src/seed.js` | `createSeed()`: 32-character hex seed generator used by the element and the public API. |
| `packages/shapy/index.d.ts`, `catalog.d.ts`, `stickers.d.ts` | Public TypeScript types. |
| `packages/shapy/scripts/build-template.mjs` | Generates `shapy-template.js` from `shapy-index.html`. |
| `scripts/sync-standalone.mjs` | Copies the renderer source to `examples/standalone.html`. |
| `scripts/check-repo.mjs` | Checks docs links, package exports, generated files, stale paths, author/sponsor metadata, and required community files. |
| `tests/package.test.mjs` | Core package tests for seed generation, catalog counts, sticker serialization, package exports, metadata, and documentation attribution. |
| `tests/render.test.mjs` | Fast `shapy-render` tests for input rejection, CLI behavior, and format inference. |
| `tests/render.e2e.test.mjs` | Opt-in Playwright/ffmpeg test for loop closure (including high-speed loops and compositor seeks), WebM, MP4, alpha PNG, alpha WebM, and poster output. |
| `packages/shapy/src/stickers.js` | `STICKER_CATALOG`, `STICKER_REGISTRY`, `getRegistryData()`, `registerStickers(element)`; exposed as `shapy/stickers`. |
| `CONTRIBUTING.md` | Contribution workflow, local setup, code rules, testing, and release checklist. |
| `SECURITY.md` | Private vulnerability reporting, supported versions, and the security model. |
| `CODE_OF_CONDUCT.md` | Contributor Covenant 2.1 community standards. |
| `.github/FUNDING.yml` | GitHub Sponsors metadata. |
| `.github/CODEOWNERS` | Maintainer review ownership. |
| `.github/ISSUE_TEMPLATE/` | Bug report, feature request, and contact-link forms. |
| `.github/PULL_REQUEST_TEMPLATE.md` | Pull request checklist. |
| `apps/demo/src/pages/Home.vue` | Background-only demo. |
| `apps/demo/src/pages/Config.vue` | Full control panel + shape picker. |
| `apps/demo/src/App.vue` | Floating navigation shell. |
| `apps/demo/vite.config.js` | Vue custom-element config; also serves repository examples before Vue Router's SPA fallback. |
| `index.html` | Root placeholder for Vite dev server; ensures correct project root for static serving of `examples/`. |
| `examples/minimal.html` | Small copy-paste example served by both dev commands. |
| `examples/standalone.html` | Generated standalone demo. Built from `shapy-index.html` by `npm run build:template`; do not edit by hand. |
| `docs/GETTING_STARTED.md` | Step-by-step beginner guide with recipes and troubleshooting. |
| `docs/UNIQUENESS.md` | Full seed and settings combination math. |
| `docs/SEED_STABILITY.md` | Engine-version contract for stable seeds and seek frames. |
| `packages/shapy-render/` | Optional Playwright-based export package for MP4, WebM, and PNG output. `src/index.js` captures frames, `src/ffmpeg.js` discovers and drives ffmpeg, `src/options.js` validates input and infers formats, and `bin/shapy-render.js` is the CLI. |
| `README.md` | Public repository documentation and documentation map. |
| `AGENTS.md` | Strict rules for AI-assisted changes. |
| `CHANGELOG.md` | Change history. |

## Rendering pipeline

1. `shapy-bg.js` observes these attributes:

   `seed`, `palette`, `shape-set`, `layout`, `align`, `motion`, `direction`,
   `density`, `scale`, `size-mode`, `speed`, `move`, `custom-colors`,
   `safe-area`, `safe-zones`, `live`, `time`, `loop`, `aspect`, `paused`,
   `shapes`, `registry-data`, `registry`, `background`, `text-color`,
   `muted-color`, `accent-color`, `glow-color`, `scrim-color`, `scrim`,
   `headline`, `text`, `text-accent`, `subtext`, `description`, `eyebrow`,
   `text-position`, `text-align`, `text-scale`, `font-family`, `font-weight`.

2. `_readState()` builds a plain state object:

   ```js
   {
     seed, palette, shapeSet, layout, align, motion, direction,
     density, scale, sizeMode, speed, move, customColors,
     safeArea, safeZones, live, time, loop, aspect, paused, shapes, registry,
     background, textColor, mutedColor, accentColor, glowColor, scrimColor, scrim,
     text, textAccent, subtext, eyebrow, textPosition, textAlign,
     textScale, fontFamily, fontWeight
   }
   ```

   Numeric attributes are finite-number checked and clamped to the documented
   ranges: `density` 20–100, `scale` 60–140, `speed` 50–200, `move` 30–200,
   `text-scale` 50–200, `font-weight` 100–900. `time` is 0–86400 seconds and
   `loop` is 0–600 seconds. `live` is true unless the attribute is `off`,
   `false`, `0`, or `no`. Invalid values fall back to the attribute default
   instead of producing `NaN`. The renderer applies the same normalization when
   it receives state. `safe-zones` is parsed by `parseSafeZones()` into at most
   12 validated percentage rectangles. Color attributes, `custom-colors`, and
   registry item colors are validated with a CSS color allowlist plus
   `CSS.supports('color', value)` in browsers; unsafe or invalid values are
   dropped. `customColors` is normalized to a comma-joined string and parsed back
   with `splitColorList()` so `rgb(255, 0, 0)` stays one color.

3. `_init()` parses `SHAPY_HTML` with `DOMParser`, copies the template's
   `<style>` text into an open shadow root (rewriting `:root`, `html, body`, and
   `body` selectors), clones the body markup, and executes the renderer script
   in a scoped IIFE. `registry-data` is parsed with `JSON.parse`; `shapes`
   accepts a comma list or JSON array. After the renderer boots, the package
   removes the template's demo-only chrome (`.topbar`, `.panel`, `.footer`,
   `.toast`, `.hero .actions`, `.hero .seedline`) so renderer control references
   remain valid. It then appends the optional `.shapy-text` overlay inside
   `#app` so palette variables and host CSS custom properties inherit into it.

4. The renderer runs in the component's open shadow root. Host-page CSS cannot
   match renderer elements. A `document` shim maps renderer queries to the shadow
   root. A `window` shim maps `innerWidth`/`innerHeight` to the host size,
   forwards non-resize listeners to `globalThis`, and exposes
   `__SHAPY_STATE__`, `__SHAPY_APPLY__`, `__SHAPY_DESTROY__`, and
   `__SHAPY_SEEK__`. The renderer
   never reads `globalThis.ShapyRegistry`; custom groups arrive only through the
   `registry-data` attribute. There is no `eval` or `new Function`; the renderer
   script text is static and generated from `shapy-index.html`.

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
   - starts live updates that periodically tweak animations, unless
     `live="off"`, `time`, `loop`, or `prefers-reduced-motion: reduce` applies.

`time` sets `frozenTime`, adds `.is-frozen`, and calls `freezeAt()` during render.
`loop` only quantizes animation durations and disables live updates; it does not
pause animations. `seek(t)` freezes through the same `freezeAt()` path without
rewriting the `time` attribute, so frame capture does not trigger a full
re-render. The frozen class pauses shape animations; `freezeAt()` additionally
uses the Web Animations API to pause every shape animation and set `currentTime`
in milliseconds. `seek(null)` and removing `time` call `resumeTimeline()`, which
plays animations again and restarts live updates only when `live` is on and
`time` is unset.

Lifecycle: the first `connectedCallback` calls `_init()`. Later attribute changes
are debounced by 80 ms and call `_apply(state)`. `setOptions()` writes
attributes and applies immediately; `getOptions()` returns a normalized snapshot;
`refresh()` forces `_apply()`. `seek(seconds)` freezes the renderer at an exact
timeline position and resolves after two animation frames; `seek(null)` resumes
the timeline. `disconnectedCallback` calls `_destroy()`, which
clears renderer timers/listeners and empties the shadow root; reconnecting
reinitializes the renderer. A `ResizeObserver` on the host and a global `resize`
listener trigger re-renders. The host exposes `role="img"` and
`aria-label="Shapy generative background"` by default. When text is visible, the
managed role becomes `group` and the managed label comes from the headline; a
host-set `role` or `aria-label` is detected and never overwritten. `shapy:ready`
fires after the first render; `shapy:change` fires after subsequent applies.

Color precedence inside the renderer is explicit attribute, then host
`--shapy-*` custom property, then palette. The public host variables are
`--shapy-bg`, `--shapy-ink`, `--shapy-muted`, `--shapy-accent`, `--shapy-glow`,
and `--shapy-scrim`. The text overlay exposes `::part(text)`, `::part(eyebrow)`,
`::part(headline)`, and `::part(body)`.

`aspect` is opt-in. Without it, the host keeps its normal `width: 100%; height:
100%` sizing. `aspect="9:16"`, `"16:9"`, `"1:1"`, or `"4:5"` sets `aspect-ratio`
and `height: auto` on the host, so the parent must allow automatic height.

## Seed and combination space

The renderer hashes the full seed string into four 32-bit lanes and seeds
`sfc32` with a 128-bit state. A 32-character hex seed uses the full 2^128 seed
space. Including the sticker registry there are 79 selectable shape keys. The
`docs/UNIQUENESS.md` documents the full combination calculation: approximately
`1.912345 × 10^76` seed × full-visual-settings combinations, or
`3.824690 × 10^76` when paused is included. Custom colors and custom media
registries add further user-defined combinations on top of that; colors are
capped at 64 tokens, registries at 20 groups, and groups at 200 items.

## Shape pool resolution

`getPool()` order:

1. `shapeSet === 'custom'`:
   - build `getAllEntries()` (core shapes + emoji + injected registry groups),
   - keep entries whose key is in `state.shapes`,
   - if the selection is empty or invalid, fall back to all entries.
2. Injected registry group for `state.shapeSet` (`state.registry[groupId]`).
3. `emoji` → `EMOJI_POOL` entries.
4. `all` → `getAllEntries()`.
5. Core group (`geometry`, `lines`, `organic`) filtered from `SHAPE_DEFS`.
6. If a group is missing, fall back to all entries.

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
      { "key": "sticker-0", "label": "Party popper", "emoji": "🎉", "size": 1.15 },
      { "key": "logo", "label": "Logo", "image": "/logo.svg", "color": "#fbbf24" },
      {
        "key": "heart",
        "label": "Heart",
        "icon": {
          "path": "M12 21s-7-4.35-9.33-8.02C.8 9.9 2.2 6 5.5 6c2 0 3.2 1.2 3.5 1.6C9.3 7.2 10.5 6 12.5 6c3.3 0 4.7 3.9 2.83 6.98C19 16.65 12 21 12 21z",
          "viewBox": "0 0 24 24",
          "fill": "#ff3366"
        }
      }
    ]
  }
}
```

A group can be `{ label, items }` or a plain array of items. Items need at least
one of `emoji`, `image`, or `icon`; items without renderable media are dropped.
If several are supplied, rendering precedence is `emoji`, then `icon`, then
`image`. `emoji` renders text; `image` renders an `<img>` with
`object-fit: contain`; `icon` renders an SVG built only from path data. `color`
tints emoji/icons that use `currentColor`. `registry-data` is untrusted:
non-object groups/items are dropped, groups are capped at 20 and items at 200,
`size` is clamped to `0.05–5`, `weight` to `0.01–100`, and each `ratio` value to
`0.05–10`. Image URLs are checked by `sanitizeImageUrl()`: `http(s)`,
protocol-relative, relative, and safe `data:image/*` URLs are allowed; every
other scheme and backslashes are dropped. Icons are checked by `sanitizeIcon()`:
path data must match the SVG path allowlist, `viewBox` must contain four numbers,
and `fill`/`stroke` must pass color validation. Raw SVG markup is never accepted.
`getOptions().registry` returns the parsed registry as supplied; rendering
sanitizes it.

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

Safe area prefers the visible `#shapyText` overlay's bounding rect. When no text
is visible it falls back to the hidden `.hero__copy` rect. The `.hero` stays in
the layout with `visibility: hidden` so the rect remains measurable; if the rect
has zero width or height, the renderer falls back to a proportional safe
rectangle.

`safe-zones` is independent of `safe-area` and produces additional rectangles.
`parseSafeZones()` accepts a comma list of presets (`tiktok`, `reels`, `shorts`,
`story`), a JSON array of preset names and/or `{top,right,bottom,left}` objects,
or an array through `setOptions()`. Values are percentages of the host box from
0 to 100; invalid and inverted rectangles are dropped, and the total is capped at
12. The renderer converts each rectangle to pixels and dims shapes in any zone to
35% opacity with a 36 px margin.

## Motion

`motionFor(rand, index)` maps the selected motion mode to CSS variables:
`--anim`, `--dur`, `--delay`, `--dx`, `--dy`, `--spin`, `--sc`, `--ease`,
`--adir`, `--iterations`. The template's CSS keyframes consume these variables.
`state.paused` pauses the animations via injected CSS and the template state.
When `loop` is active, `loopDuration()` recomputes every adjusted duration so the
loop period is an exact multiple of the duration. Alternate animations use an even
number of cycles, so the direction at the loop boundary matches the start.
`formatSeconds()` keeps full precision in loop mode: rounding a quantized
duration (for example `10/6` at `loop=10`, `speed=200`) to two decimals would
leave 5.99 cycles instead of 6 and reopen the seam. Frozen timelines also set
`will-change: auto` on `.shape__inner`, because a promoted compositor layer can
keep the pre-seek raster after `seek()` pauses and repositions the animation.

## Deterministic timeline

The timeline contract is:

- `live="off"` stops periodic composition mutations. CSS animations keep running
  unless `paused` or `time` also applies.
- `time="t"` freezes the timeline at `t` seconds and disables live mutations.
  `seek(t)` is the imperative equivalent without rewriting the attribute.
- `loop="p"` quantizes animation durations to divide `p` exactly and disables
  live mutations. Bare `loop` reads as 10 seconds. `seek()` wraps into `[0, p)`.
  Quantized durations keep full precision, and `seek()` drops compositor layer
  promotion while frozen, so the frame at `p` matches the frame at `0`.
- `seek(null)` clears the frozen state. If `time` is unset and `live` is on, live
  updates resume.
- `paused` alone pauses animations but does not disable live mutations.

The engine version exported as `SHAPY_ENGINE_VERSION` (currently `1`) scopes the
seed-stability contract. Any renderer change that alters composition or seek
frames must bump the engine version and the package major version. The full
policy lives in `docs/SEED_STABILITY.md`.

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
The demo does not yet expose the package's color attributes, text overlay, or
element methods in its control panel; those are documented in the package
README.

## Build

After editing `packages/shapy/src/shapy-index.html`:

```bash
npm run build:template
```

This writes `packages/shapy/src/shapy-template.js` and syncs
`examples/standalone.html`. Both files are generated; edit only the package
renderer source. `npm run verify` regenerates both, runs repository checks, runs
the Node test suite, builds the Vue demo, and runs `npm pack --dry-run` for both
packages.

## Testing

Run the fast Node test suite:

```bash
npm test
```

This runs `tests/package.test.mjs` and `tests/render.test.mjs`. The core suite
covers seed generation, catalog counts, sticker serialization, package exports,
package metadata, and documentation attribution. The render suite covers invalid
option rejection, CLI help/version/error handling, and output-format inference
without launching a browser. `tests/render.e2e.test.mjs` is not part of
`npm test`.

Run the opt-in export E2E test when Playwright Chromium and an ffmpeg with
`libvpx-vp9` are available:

```bash
SHAPY_RENDER_E2E=1 npm run test:e2e
```

On PowerShell:

```powershell
$env:SHAPY_RENDER_E2E='1'; npm run test:e2e
```

The E2E test renders a 320×568 loop, byte-compares the t=0 and t=loop frames,
encodes a WebM, verifies alpha PNG color type 6, and writes a poster. It is not
part of `npm run verify`; CI exposes it as a manual `workflow_dispatch` job.

The demo runs with Vite at the URL it prints (usually
`http://localhost:5173`) while developing. Both `npm run dev` and
`npm run dev:example` serve `/examples/minimal.html`; the demo server serves it
before Vue Router's SPA fallback.

Playwright scripts used during development live in a local temp folder outside
the repository. Point the scripts at any Chromium/Chrome executable available on
your machine. Run the browser matrix at least twice before a release.

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
- text overlay: visible/hidden, headline/accent/body/eyebrow, nine positions,
  inferred and explicit alignment, text scale/weight/font, newlines, plain-text
  handling, and `safe-area` using the overlay bounds
- theming: explicit color attributes, host `--shapy-*` variables, palette
  fallback, invalid color rejection, scrim, and color precedence
- registry media: emoji, image (http, relative, and safe data URLs), inline icon
  paths, unsafe image schemes, malformed icons, empty items, and registry limits
- element API: `setOptions()` aliases/removals, `getOptions()` normalization,
  `refresh()`, `shapy:ready`, and `shapy:change`
- deterministic timeline: default `live`/`time`/`loop`/`aspect`/`safeZones`,
  frozen class and animation play state, repeated `seek(t)` frame equality,
  `seek(null)` resume, and loop boundary frame equality
- loop quantization: every shape duration divides the loop period, alternate
  directions use even cycle counts
- safe zones: `tiktok`/`reels`/`shorts`/`story` preset counts, custom rectangle
  parsing and clamping, dimming inside zones, no dimming when removed
- `aspect="9:16"` produces a 9:16 host box when the parent allows auto height
- `SHAPY_ENGINE_VERSION` is exported from the package root and documented
- `shapy-render` rejects invalid input before launching a browser, infers formats
  from output extensions, emits JPEG frames when ffmpeg lacks PNG decoding, and
  reports `engineVersion` in the result
- opt-in render E2E: loop-boundary frame equality, non-empty WebM, RGBA alpha
  PNG (color type 6), and poster generation
- `::part(text/eyebrow/headline/body)` styling and host variable inheritance
- two components on one page remain independent; hostile light-DOM CSS does not
  change renderer shapes
- same seed + same settings match across re-renders and page reloads; different
  seeds differ; two no-seed elements get distinct 32-char hex seeds
- host resize, attribute updates, disconnect/reconnect, and zero leaked
  `__shapy_scope_*` globals
- standalone `examples/standalone.html` still renders and responds to its scale
  slider

## Known limitations / technical debt

1. **Shadow DOM is required.** The renderer needs Custom Elements and
   `attachShadow`; there is no light-DOM fallback. If Shadow DOM is unavailable,
   the component renders nothing.
2. **Browser behavior is not fully covered by committed tests.** The fast Node
   suite covers the package surface and render validation. `tests/render.e2e.test.mjs`
   covers export capture when explicitly enabled, but the full interactive
   renderer, theming, text, and registry matrix still lives outside the
   repository.
3. **Publish pending approval.** Version `1.0.0` is packaged and verified but
   has not been pushed to npm. Publish only after explicit approval and a
   successful `npm login`.
4. **Renderer globals are shimmed, not fully isolated.** `window` and `document`
   inside the renderer are shims, but non-resize listeners are forwarded to the
   real `globalThis`. Custom shape groups are supplied only through
   `registry-data`; there is no global registry.
5. **Video export is a separate package.** Core `shapy` stays zero-dependency
   and does not bundle an encoder. `packages/shapy-render` uses Playwright for
   frame capture and can emit MP4, WebM, and PNG sequences. The render result
   includes the `SHAPY_ENGINE_VERSION` used for the capture. MP4 alpha is not
   supported; use WebM VP9 or a PNG sequence when transparency is required.
   MP4 output needs a system `ffmpeg` with an H.264 encoder. Non-alpha WebM VP9
   uses Playwright's bundled ffmpeg when available; PNG sequences need no ffmpeg.
   Playwright's ffmpeg build lacks a PNG decoder, so non-alpha WebM captures fall
   back to JPEG frames and alpha WebM requires a full ffmpeg or a PNG sequence.
6. **Seek frames are not pixel-identical across environments.** Composition and
   timeline geometry are stable, but browser rasterization, emoji artwork, and
   font availability can differ. Pin the viewport, device pixel ratio, fonts, and
   engine version for reproducible captures.

## Next recommended work

1. Run `npm run verify` after each change and inspect the dry-run file lists.
2. Add the Playwright browser matrix to the repository and CI if CI runtime
   allows it.
3. Consider exposing the new theming and text controls in the Vue config demo;
   the package API already supports them.
4. Add audio track support to `shapy-render` if users ask for narrated clips.
