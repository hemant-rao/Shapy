# AGENTS.md — Rules for AI-assisted work on Shapy

This file is the contract for every future AI-assisted change in this repository.
Read it before touching code.

## Start here

1. Read `docs/AI_CONTEXT.md`.
2. Read only the files relevant to the task. Do not scan the whole repository
   unless the task genuinely requires it.
3. Read `docs/CHANGELOG.md` before changing public behavior.
4. If a requirement is ambiguous, stop and ask. Never assume.

## Non-negotiable rules

1. **Update documentation after every change.**
   - Update `docs/AI_CONTEXT.md` whenever architecture, files, behavior, or
     known limitations change.
   - Add an entry to `docs/CHANGELOG.md` for every user-visible change.
   - Update `README.md` and the package README when the public API changes.
2. **Only make necessary changes.** No drive-by refactors, no speculative
   features, no "while I'm here" rewrites.
3. **Never delete without a real need.** If deletion is required, confirm the
   file is generated, unused, or explicitly approved. Do not remove user work.
4. **Never assume.** Inspect the implementation and test the behavior.
5. **No extra code.** Prefer the smallest change that satisfies the requirement.
6. **Never edit `shapy/src/shapy-template.js` by hand.** It is generated from
   `shapy/src/shapy-index.html`.
7. **Keep the two renderer sources in sync.**
   - `shapy/src/shapy-index.html` is the package template source.
   - `index.html` is the standalone advanced reference demo.
   - Apply renderer changes to both, then regenerate the template.
8. **Regenerate after renderer edits:**
   ```bash
   node shapy/scripts/build-template.mjs
   ```
9. **Test multiple times after each task.** Fix failures, re-test, then save.
   Do not report a task as complete after a single successful run.
10. **Keep public API changes backward-compatible** unless the user explicitly
    approves a breaking change.
11. **Security:** treat attribute data as untrusted. Parse `registry-data` with
    `JSON.parse` and never inject unsanitized JSON or HTML into the renderer. Do
    not add `eval`, `new Function`, or unsanitized HTML injection.
12. **Accessibility:** preserve the custom element's accessible title and
    keyboard-operable controls in the demo.

## Source of truth

| Concern | File |
| --- | --- |
| Custom element + attributes | `shapy/src/shapy-bg.js` |
| Public JS API | `shapy/src/index.js` |
| Public types | `shapy/index.d.ts`, `catalog.d.ts` |
| Renderer source | `shapy/src/shapy-index.html` |
| Generated renderer | `shapy/src/shapy-template.js` |
| Shape + emoji catalog | `shapy/src/catalog.js` |
| Optional stickers | `shapy/src/stickers.js` (exposed as `shapy/stickers`) |
| Demo config UI | `vue-demo/src/pages/Config.vue` |
| Demo background page | `vue-demo/src/pages/Home.vue` |
| Docs | `README.md`, `docs/` |

## Change workflow

1. Inspect the relevant code and current behavior.
2. Write the smallest possible change.
3. If the renderer changed, mirror it to `index.html` and regenerate the template.
4. Run the demo and verify visually and programmatically:
   - Desktop `1350x800`
   - Mobile `390x844`
   - Wide `1920x1080`
5. Run the manual checks below.
6. Update `docs/AI_CONTEXT.md` and `docs/CHANGELOG.md`.
7. Re-run the checks after the documentation change.
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

- [ ] Version bumped in `shapy/package.json`.
- [ ] `docs/CHANGELOG.md` updated.
- [ ] `npm run build:template` run after the last renderer edit.
- [ ] `npm run verify` succeeds.
- [ ] `npm run pack:check` output reviewed.
- [ ] `npm run publish:shapy` run only after explicit user approval and a
      successful `npm login`.
