# Changelog

All notable changes to Shapy are documented here.

## [1.0.0] - 2026-11-12

The first production-ready release. Published on npm as `shapy-bg@1.0.0` and
`shapy-render@1.0.0`.

### Added

- Sponsorship and support sections across the repository README, package
  README, contributing guide, and security policy.
- Odio Book sponsor attribution and a GitHub Sponsors funding link.
- Author, funding, homepage, bugs, and Node engine metadata in the package and
  workspace manifests.
- Community health files: `CONTRIBUTING.md`, `SECURITY.md`,
  `CODE_OF_CONDUCT.md`, `.github/FUNDING.yml`, `.github/CODEOWNERS`, issue
  templates, and a pull request template.
- Security policy coverage for `shapy-render`, including its loopback-only
  capture server, Playwright/Chromium boundary, and external ffmpeg execution.
- A Dependabot configuration and an `npm audit --audit-level=high` CI step, so
  dependency advisories are tracked continuously.
- A zero-dependency Node test suite in `tests/package.test.mjs` covering seed
  generation, catalog counts, sticker serialization, package exports, metadata,
  and documentation attribution.
- Fast `shapy-render` tests in `tests/render.test.mjs` covering invalid option
  rejection, CLI help/version/unknown-flag behavior, and output-format inference.
- An opt-in export E2E suite in `tests/render.e2e.test.mjs` covering loop-boundary
  frame equality (including `loop=10` at `speed=200`), WebM, MP4 when ffmpeg
  provides `libx264`, RGBA alpha PNG, alpha WebM when PNG decoding is available,
  and poster generation.
- `engineVersion` in the `shapy-render` result, so captured output records the
  core `SHAPY_ENGINE_VERSION` that produced it.
- A manual `workflow_dispatch` CI job for the render E2E suite with Chromium and
  a system ffmpeg.
- A `./package.json` export so tools can read package metadata.
- Contents tables and package-export documentation in the repository, core, and
  render READMEs.
- Deterministic timeline controls: `live`, `time`, `loop`, `aspect`, and the
  `seek(seconds)` element method. `live="off"` stops live composition mutations;
  `time` freezes an exact second; `loop` quantizes animation durations to a
  seamless period; `seek(null)` resumes.
- `safe-zones` with `tiktok`, `reels`, `shorts`, and `story` presets plus custom
  percentage rectangles, alongside the existing `safe-area` text protection.
- `SHAPY_ENGINE_VERSION` and `docs/SEED_STABILITY.md`, which scope seed and
  seek-frame stability to an engine major version.
- `packages/shapy-render`, an optional Playwright-based package for MP4, WebM,
  and PNG export, with poster frames and alpha support through WebM VP9 or PNG.
- Export documentation covering deterministic capture, 9:16 recipes, alpha
  limits (including the alpha WebM PNG-decoder requirement), and the external
  `libx264` requirement for MP4.

### Changed

- The repository, core, and render READMEs now follow the same structure and
  voice as the `universal-toast-message` documentation: sponsor banner, contents
  table, support section, sponsor section, and author footer.
- The license copyright holder is now Hemant Rao.
- `npm run verify` runs the Node test suite before building and packing.
- CI runs `npm test` as part of verification.
- Security policy supported versions now track the `1.0.x` line.
- Live updates no longer run when `time`, `loop`, or `live="off"` is active, so
  deterministic captures stay stable.
- `npm test` now runs the core and fast render unit tests. `npm run test:e2e`
  runs the opt-in export suite.
- `npm run verify` and `npm run pack:check` cover both the core and render
  packages. `shapy-render` captures with `live="off"` and `seek()`.

### Fixed

- Removed an unused import from the safe custom image example in the getting
  started guide.
- Corrected the version and documentation metadata so the package, lockfile,
  changelog, and security policy agree.
- `shapy-render` now forwards the top-level `loop` option/`--loop` flag to the
  element, so rendered clips actually use the requested loop period.
- Loop mode keeps full precision when formatting quantized durations. A
  `loop=10`, `speed=200` clip now closes at exactly 10 seconds instead of
  cycling at `1.67s` (5.99 periods) because `toFixed(2)` used to round
  `10/6`.
- Frozen captures disable `will-change: transform` on shape layers, so `seek()`
  paints the requested frame instead of a stale compositor layer. This closes
  the loop seam for seeds that place a shape at the viewport edge.
- Alpha captures hide the solid background, scrim, and grain layers instead of
  compositing them into the transparent PNG.
- `shapy-render` validates the poster extension before capture, so invalid
  poster paths fail before rendering frames.
- WebM export falls back to JPEG frames when the available ffmpeg lacks a PNG
  decoder, keeping Playwright's bundled ffmpeg usable.

## [0.2.0] - 2026-11-10

### Added

- Dynamic theming attributes: `background`, `text-color`, `muted-color`,
  `accent-color`, `glow-color`, `scrim-color`, and the `scrim` boolean.
- Host CSS variables `--shapy-bg`, `--shapy-ink`, `--shapy-muted`,
  `--shapy-accent`, `--shapy-glow`, and `--shapy-scrim`. Explicit attributes win
  over variables, which win over the palette.
- Optional text overlay with `text`/`headline`, `text-accent`,
  `subtext`/`description`, `eyebrow`, `text-position`, `text-align`,
  `text-scale`, `font-family`, and `font-weight`.
- `::part(text)`, `::part(eyebrow)`, `::part(headline)`, and `::part(body)`
  styling hooks for the text overlay.
- Registry items can render safe inline SVG icons from path data (`icon.path` or
  `icon.paths`, plus `viewBox`, `fill`, `stroke`, and `strokeWidth`) and accept a
  `color` tint.
- Relative and protocol-relative image URLs, plus AVIF data URLs, in addition to
  http(s) and the existing safe `data:image/*` formats.
- Element methods `setOptions()`, `getOptions()`, and `refresh()`.
- `shapy:ready` and `shapy:change` lifecycle events with the current options.
- Automatic accessible role/label handling for the text overlay: `group` with a
  headline-derived label when text is visible, `img` with the standard label
  when it is not, and host overrides preserved.
- Custom shape picker in the Vue config page with 79 chips across geometry,
  lines, organic shapes, emoji, and stickers.
- Single-shape and arbitrary 2/3/4/5+ shape selections via `shape-set="custom"`
  and `shapes`.
- Group-only presets and `All` / `Clear` actions in the picker.
- Optional sticker registry exposed as the `shapy-bg/stickers` subpath, with
  `STICKER_CATALOG`, `STICKER_REGISTRY`, `getRegistryData()`, and
  `registerStickers()`.
- Serializable `registry-data` support for stickers and custom image shapes.
- Emoji mixed into the default "All shapes" pool.
- Layout modes: `rows` (horizontal alignment), `columns` (vertical alignment),
  `center` cluster, and `edges` frame.
- Alignment control: `random`, `left`, `center`, `right`, `top`, `middle`,
  `bottom`.
- Size modes: `mixed`, `same`, `subtle`, `dramatic`, `small`, `medium`, `large`.
- `size-mode` and `align` attributes in the Web Component.
- The custom element exposes `role="img"` and
  `aria-label="Shapy generative background"` by default; either can be
  overridden by the host.
- `createSeed()` helper, exported from `shapy-bg`, that returns a fresh
  32-character hex seed.
- Security hardening: custom image URLs in `registry-data` are validated
  (`http(s)`, protocol-relative, relative, and safe `data:image/*` allowed);
  `custom-colors` values are validated against a CSS color allowlist and the
  browser's color parser; `ShapyRegistry` is no longer exposed on `globalThis`
  (per-instance isolation only).
- TypeScript declarations for the package API, catalog, and sticker registry.
- Public repository README, package README, `AGENTS.md`, `docs/AI_CONTEXT.md`,
  and this changelog.
- Root workspace `package.json`, `.gitignore`, and MIT license.
- "How many unique compositions?" section in the repository README with the
  128-bit seed + renderer-settings calculation.
- Repository metadata (`repository`, `homepage`, `bugs`) for
  `https://github.com/hemant-rao/shapy-bg` in the package manifest.
- GitHub Actions CI workflow for install, template regeneration, demo build, and
  package dry-run.
- Root scripts `verify`, `check:repo`, `pack:check`, and `publish:shapy-bg`.
- Beginner-friendly step-by-step guide in `docs/GETTING_STARTED.md`, a
  copy-paste `examples/minimal.html`, and the `npm run dev:example` command.
- Documentation map, quick start, recipes, and troubleshooting sections in the
  repository and package READMEs.
- `docs/UNIQUENESS.md` with the full composition-count calculation.

### Changed

- `createShapy().mount()` now delegates option application to the element's
  `setOptions()` method.
- `getOptions()` returns a normalized snapshot, including an array of parsed
  `customColors`, a parsed registry, and all color/text options.
- Registry items without `emoji`, `image`, or `icon` are dropped instead of
  becoming invisible shapes. If an item supplies several media fields, `emoji`
  wins, then `icon`, then `image`.
- `safe-area` now uses the visible text overlay's bounds when text is present.
- Package version bumped to `0.2.0`.
- The renderer now runs in an open Shadow DOM instead of an internal iframe.
  Renderer CSS is scoped to the shadow root, host `document`/`window` access is
  shimmed, and the renderer exposes `__SHAPY_APPLY__` / `__SHAPY_DESTROY__` on
  its scoped window shim for updates and cleanup. No `eval` or `new Function` is
  used.
- The `scale` slider now scales the responsive `maxShape` cap by `scale / 110`
  for main shapes and derives the ambient cap from it. At the default
  `scale="110"` the previous caps are unchanged; lower values now shrink large
  and capped shapes too.
- Ambient shapes now use only the selected shape pool. A single-shape custom
  selection no longer shows unrelated ambient shapes.
- Responsive shape caps at the default `scale="110"`: mobile main shapes max
  56 px, ambient max 64 px; desktop main shapes max 110 px, ambient max 120 px.
- Shape sizes are smaller on phones and capped on wide screens.
- Default "All shapes" includes emoji (and stickers when registry data is
  supplied).
- Component attribute changes are debounced by 80 ms before re-rendering.
- `createShapy().mount()` accepts camelCase or kebab-case options, serializes
  objects/arrays, handles booleans correctly, and returns the created element.
- The custom element registration is guarded for non-browser environments.
- Renderer state is passed through the scoped window shim instead of being
  serialized into the template, removing the state-JSON injection surface.
- `registerStickers(element)` now applies the sticker registry directly to an
  element through `registry-data`. It no longer reads or writes a global
  registry.
- Package metadata is publish-ready with `exports`, `types`, `files`,
  `sideEffects`, and `prepack` template generation.
- Repository organized as a two-workspace monorepo: `packages/shapy-bg` (the
  published package) and `apps/demo` (private Vue 3 demo). The standalone demo
  lives at `examples/standalone.html`, and the changelog is at the repository
  root. The Vue demo consumes the package through its public exports, including
  the `shapy-bg/stickers` subpath, instead of Vite source aliases.
- The standalone `examples/standalone.html` is now generated from
  `packages/shapy-bg/src/shapy-index.html` by `npm run build:template`, removing
  the manual two-file sync. `npm run verify` now also runs repository checks for
  docs links, package exports, generated files, and stale paths.
- The optional sticker registry is now part of the core `shapy-bg` package as the
  `shapy-bg/stickers` subpath. One npm package ships the component, catalog, and
  sticker registry; `shapy-stickers` is no longer a separate package.
- The renderer now hashes the full seed string into a 128-bit `sfc32` state;
  URL seeds are accepted up to 64 characters.
- The Web Component now generates a fresh 128-bit seed per element instance
  when no `seed` attribute is supplied. Explicit seeds remain deterministic.
- Vue demo initial and "New pattern" seeds now use the full 32 hex characters
  (128 bits).
- README, package README, `AGENTS.md`, and `docs/AI_CONTEXT.md` now use the
  monorepo paths and new publishing commands.
- Vue demo dev tooling upgraded to Vite 8 and `@vitejs/plugin-vue` 6, clearing
  the previous dev-server `npm audit` advisories. The published package remains
  zero-dependency.

### Fixed

- Color validation now asks the browser with `CSS.supports('color', value)`, so
  values that merely look like colors (for example `not-a-color`) are rejected.
- `getOptions().customColors` no longer splits functional colors such as
  `rgb(255, 0, 0)` into separate entries.
- `setOptions()` clears the alternate attribute when setting an alias
  (`text`/`headline`, `subtext`/`description`, `registry-data`/`registry`) so a
  stale value cannot win the read order.
- Host `--shapy-bg` is no longer removed when the element syncs its own
  background attribute; the explicit attribute uses a separate internal
  variable.
- The text overlay resets to the default role and label when all text is
  removed, and host-supplied `role`/`aria-label` values are preserved.
- Renderer validation constants are declared before first use, fixing a
  disconnect/reconnect `before initialization` error.
- README JavaScript API examples now pass an element to `mount()` instead of a
  selector string, matching the implementation and TypeScript types.
- README documents the Node.js 20.19+ requirement for local development.
- Selecting one shape in Custom selection now keeps both the main and ambient
  layers on that shape.
- `same` size mode now ignores per-shape size multipliers, so every shape shares
  one base size. Non-square shapes still keep their aspect ratios.
- Reducing `scale` no longer leaves oversized shapes at the responsive cap.
  Measured at `1350x800`: main/ambient maximum widths are `40.5/54.7` at scale
  `60`, `74.3/100.2` at scale `110`, and `94.5/120` at scale `140`.
- Multiple `shapy-background` elements on one page now render independently;
  host resizing, attribute updates, disconnect, and reconnect work without
  leaking scoped globals.
- Host-page CSS selectors cannot style shadow renderer elements, including
  aggressive `!important` rules.
- The `examples/standalone.html` demo and the Vue demo now use an inline
  favicon, removing the `/favicon.ico` 404 from the browser console.
- Sticker groups fall back gracefully when no sticker registry is provided.
- `shapy-bg` package no longer references missing `src/index.mjs`,
  `src/index.d.ts`, or build scripts that were not installed.
- Root demo and package renderer sources are back in sync.
- Vue demo package imports no longer depend on local `packages/` source aliases;
  they resolve through the workspace package exports.
- Both `npm run dev` and `npm run dev:example` now serve
  `/examples/minimal.html` directly. The Vue demo dev server intercepts the
  example paths before Vue Router's SPA fallback, and the root `index.html`
  placeholder keeps `npm run dev:example` rooted at the repository. The example
  background renders with no Vue Router warning.
- The generated `examples/standalone.html` demo now renders its background when
  no sticker registry is supplied; `getPool()` no longer dereferences a null
  registry.
- Invalid numeric attributes no longer produce `NaN` or blank the background.
  `density` (20–100), `scale` (60–140), `speed` (50–200), and `move` (30–200)
  are finite-number checked and clamped; invalid values use their defaults.
  This also prevents extreme values from generating unbounded shape counts.
- `registry-data` is sanitized before rendering: non-object groups/items are
  dropped, groups are capped at 20 and items at 200, and item `size`, `weight`,
  and `ratio` values are finite-number checked and clamped. Malformed registry
  data can no longer crash or blank the renderer.
- The package element now removes the standalone demo's hidden topbar, control
  panel, footer, and toast from its shadow root. Background-only consumers no
  longer carry unused demo controls or duplicate element IDs.
- URL seeds are no longer decoded twice. A seed containing a literal `%` (for
  example `?seed=100%`) no longer throws or breaks the standalone renderer.
- `safe-area` now compares the text region against the host's position, so the
  dimmed area is correct when `<shapy-background>` is used in a smaller
  container instead of a full-page background.
- Live color updates now respect `prefers-reduced-motion: reduce`, matching the
  existing CSS animation opt-out.
- Demo controls now expose selection state: the pause button and shape chips use
  `aria-pressed`, group-only buttons have accessible labels, and toasts are
  announced with `role="status"`.

## [0.1.0] — 2026-11-09

### Added

- Seedable generative background Web Component with 40 CSS shapes.
- Eight palettes: midnight, sandstone, bauhaus, forest, plum, ocean, clay, mono.
- Motion modes: mixed, chaos, flow, bounce, drift, spin, pulse, wobble, orbit,
  calm.
- Direction control, density, scale, speed, move intensity, custom colors,
  safe area, pause, seed copy, and reset.
- Vue demo with background-only and config-play pages.
- Standalone advanced reference demo at `examples/standalone.html`.
