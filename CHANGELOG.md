# Changelog

All notable changes to Shapy are documented here.

## [Unreleased]

### Added

- Custom shape picker in the Vue config page with 79 chips across geometry,
  lines, organic shapes, emoji, and stickers.
- Single-shape and arbitrary 2/3/4/5+ shape selections via `shape-set="custom"`
  and `shapes`.
- Group-only presets and `All` / `Clear` actions in the picker.
- Optional sticker registry exposed as the `shapy/stickers` subpath, with
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
- TypeScript declarations for the package API, catalog, and sticker registry.
- Public repository README, package README, `AGENTS.md`, `docs/AI_CONTEXT.md`,
  and this changelog.
- Root workspace `package.json`, `.gitignore`, and MIT license.
- "How many unique compositions?" section in the repository README with the
  128-bit seed + renderer-settings calculation.
- Repository metadata (`repository`, `homepage`, `bugs`) for
  `https://github.com/hemant-rao/Shapy` in the package manifest.
- GitHub Actions CI workflow for install, template regeneration, demo build, and
  package dry-run.
- Root scripts `verify`, `pack:check`, and `publish:shapy`.

### Changed

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
- `registerStickers()` now works with the shadow renderer because
  `window.ShapyRegistry` proxies to `globalThis.ShapyRegistry`.
- Package metadata is publish-ready with `exports`, `types`, `files`,
  `sideEffects`, and `prepack` template generation.
- Repository organized as a two-workspace monorepo: `packages/shapy` (the
  published package) and `apps/demo` (private Vue 3 demo). The standalone demo
  lives at `examples/standalone.html`, and the changelog is at the repository
  root. The Vue demo consumes the package through its public exports, including
  the `shapy/stickers` subpath, instead of Vite source aliases.
- The standalone `examples/standalone.html` is now generated from
  `packages/shapy/src/shapy-index.html` by `npm run build:template`, removing
  the manual two-file sync. `npm run verify` now also runs repository checks for
  docs links, package exports, generated files, and stale paths.
- The optional sticker registry is now part of the core `shapy` package as the
  `shapy/stickers` subpath. One npm package ships the component, catalog, and
  sticker registry; `shapy-stickers` is no longer a separate package.
- The renderer now hashes the full seed string into a 128-bit `sfc32` state;
  URL seeds are accepted up to 64 characters.
- The Web Component now generates a fresh 128-bit seed per element instance
  when no `seed` attribute is supplied. Explicit seeds remain deterministic.
- Vue demo "New pattern" seeds now use the full 32 hex characters (128 bits).
- README, package README, `AGENTS.md`, and `docs/AI_CONTEXT.md` now use the
  monorepo paths and new publishing commands.
- Vue demo dev tooling upgraded to Vite 8 and `@vitejs/plugin-vue` 6, clearing
  the previous dev-server `npm audit` advisories. The published package remains
  zero-dependency.

### Fixed

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
- `shapy` package no longer references missing `src/index.mjs`,
  `src/index.d.ts`, or build scripts that were not installed.
- Root demo and package renderer sources are back in sync.
- Vue demo package imports no longer depend on local `packages/` source aliases;
  they resolve through the workspace package exports.

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
