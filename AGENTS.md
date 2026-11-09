# AGENTS.md — Rules for AI-assisted work on Shapy

This file is the contract for every future AI-assisted change in this repository.
Read it before touching code.

## Start here

1. Read `docs/AI_CONTEXT.md`.
2. Read only the files relevant to the task. Do not scan the whole repository
   unless the task genuinely requires it.
3. Read `CHANGELOG.md` before changing public behavior.
4. If a requirement is ambiguous, stop and ask. Never assume.

## Non-negotiable rules

1. **Update documentation after every change.**
   - Update `docs/AI_CONTEXT.md` whenever architecture, files, behavior, or
     known limitations change.
   - Add an entry to `CHANGELOG.md` for every user-visible change.
   - Update `README.md` and the package README when the public API changes.
   - Update `docs/GETTING_STARTED.md` when installation, setup, or usage changes.
   - Keep `docs/UNIQUENESS.md` in sync with shape, emoji, sticker, or setting
     counts.
2. **Only make necessary changes.** No drive-by refactors, no speculative
   features, no "while I'm here" rewrites.
3. **Never delete without a real need.** If deletion is required, confirm the
   file is generated, unused, or explicitly approved. Do not remove user work.
4. **Never assume.** Inspect the implementation and test the behavior.
5. **No extra code.** Prefer the smallest change that satisfies the requirement.
6. **Never edit generated files by hand.**
   - `packages/shapy/src/shapy-template.js` is generated from
     `packages/shapy/src/shapy-index.html`.
   - `examples/standalone.html` is generated from the same source.
7. **Edit the renderer in one place:**
   `packages/shapy/src/shapy-index.html`.
8. **Regenerate after renderer edits:**
   ```bash
   npm run build:template
   ```
   This rebuilds the package template and syncs the standalone example.
9. **Test multiple times after each task.** Fix failures, re-test, then save.
   Do not report a task as complete after a single successful run.
10. **Keep public API changes backward-compatible** unless the user explicitly
    approves a breaking change.
11. **Security:** treat attribute data as untrusted. Parse `registry-data` with
    `JSON.parse` and never inject unsanitized JSON or HTML into the renderer. Do
    not add `eval`, `new Function`, or unsanitized HTML injection.
    - Validate `custom-colors` against a CSS color allowlist; drop unsafe tokens.
    - Validate `registry-data` image URLs: only `http(s)` and safe `data:image/*`;
      drop `javascript:`, `data:text/html`, and other schemes.
    - Keep `ShapyRegistry` per-instance; never expose on `globalThis`.
    - Never set `img.src` or any attribute from user data without sanitization.
12. **Accessibility:** preserve the custom element's accessible title and
    keyboard-operable controls in the demo.

## Source of truth

| Concern | File |
| --- | --- |
| Custom element + attributes | `packages/shapy/src/shapy-bg.js` |
| Public JS API | `packages/shapy/src/index.js` |
| Public types | `packages/shapy/index.d.ts`, `catalog.d.ts` |
| Renderer source | `packages/shapy/src/shapy-index.html` |
| Generated renderer | `packages/shapy/src/shapy-template.js` |
| Generated standalone demo | `examples/standalone.html` |
| Shape + emoji catalog | `packages/shapy/src/catalog.js` |
| Optional stickers | `packages/shapy/src/stickers.js` (exposed as `shapy/stickers`) |
| Demo config UI | `apps/demo/src/pages/Config.vue` |
| Demo background page | `apps/demo/src/pages/Home.vue` |
| Beginner guide | `docs/GETTING_STARTED.md` |
| Composition math | `docs/UNIQUENESS.md` |
| Docs | `README.md`, `docs/`, `CHANGELOG.md` |

## Change workflow

1. Inspect the relevant code and current behavior.
2. Write the smallest possible change.
3. Run `npm run verify` to regenerate generated files, check docs and package
   consistency, build the demo, and dry-run the package.
4. Run the demo and verify visually and programmatically:
   - Desktop `1350x800`
   - Mobile `390x844`
   - Wide `1920x1080`
5. Run the manual checks below.
6. Update `docs/AI_CONTEXT.md`, `docs/GETTING_STARTED.md` when usage changed,
   and `CHANGELOG.md`.
7. Re-run `npm run verify` after the documentation change.
8. Only then report completion.

## Manual test checklist

- [ ] Home page renders the advanced background with no console errors.
- [ ] Default "All shapes" includes emoji and, when the registry is provided,
      stickers.
- [ ] Custom single shape: both `#shapes` and `#ambient` contain only that shape.
- [ ] Custom 2/3/4/5+ shape sets render exactly the selected keys.
- [ ] Emoji-only and sticker-only selections render only the selected emoji/stickers.
- [ ] Layout modes: auto, scatter, grid, rows, columns, center, edges.
- [ ] Alignment modes: random, left, center, right, top, middle, bottom.
- [ ] Size modes: mixed, same, subtle, dramatic, small, medium, large.
- [ ] Pause, reset, new seed, copy seed, custom colors, safe area.
- [ ] Mobile shapes are small and the config panel remains scrollable.
- [ ] Wide-screen shapes stay under the caps.
- [ ] `npm pack --dry-run` includes the expected files.

## Publishing checklist

- [ ] Version bumped in `packages/shapy/package.json`.
- [ ] `CHANGELOG.md` updated.
- [ ] `npm run verify` succeeds.
- [ ] Tarball contents reviewed.
- [ ] `npm run publish:shapy` run only after explicit user approval and a
      successful `npm login`.
