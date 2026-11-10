# Contributing to Shapy

Thanks for helping improve Shapy. It is a small, zero-dependency Web Component,
and the best contributions are focused, tested, and documented.

By participating, you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Contents

- [Ways to contribute](#ways-to-contribute)
- [Development setup](#development-setup)
- [Project layout](#project-layout)
- [Rules for code changes](#rules-for-code-changes)
- [Testing](#testing)
- [Documentation](#documentation)
- [Commit and pull request style](#commit-and-pull-request-style)
- [Release process](#release-process)
- [Support the project](#support-the-project)

## Ways to contribute

- **Report a bug.** Use the [bug report form](https://github.com/hemant-rao/Shapy/issues/new?template=bug_report.yml).
  Include the version, browser, a minimal reproduction, and console output.
- **Request a feature.** Use the [feature request form](https://github.com/hemant-rao/Shapy/issues/new?template=feature_request.yml).
  Describe the problem before the proposed API.
- **Improve the docs.** Typo fixes, clearer examples, and new recipes are
  welcome. Documentation is part of the product.
- **Send a pull request.** Keep it small and link the issue it solves.
- **Sponsor the maintenance.** See [Support the project](#support-the-project).

Security issues must not be reported in a public issue. Follow
[SECURITY.md](./SECURITY.md).

## Development setup

Shapy requires Node.js 20.19 or newer for local development. The published
package is browser-only and has no runtime dependencies.

```bash
git clone https://github.com/hemant-rao/Shapy.git
cd Shapy
npm install
```

Start the full Vue demo:

```bash
npm run dev
```

Start the minimal example:

```bash
npm run dev:example
```

Open the URL Vite prints, ending in `/examples/minimal.html`.

## Project layout

| Path | Purpose |
| --- | --- |
| `packages/shapy/src/shapy-index.html` | Renderer source. Edit this file for composition, theming, text, and sanitization changes. |
| `packages/shapy/src/shapy-bg.js` | Custom element, attribute mapping, lifecycle, methods, and events. |
| `packages/shapy/src/index.js` | Public `createShapy()` and package exports. |
| `packages/shapy/src/catalog.js` | Core shape and emoji catalog. |
| `packages/shapy/src/stickers.js` | Optional sticker registry (`shapy/stickers`). |
| `packages/shapy/index.d.ts` | Public TypeScript declarations. |
| `apps/demo` | Private Vue 3 demo and control panel. |
| `docs` | Getting started, architecture, and uniqueness documentation. |
| `tests` | Node test suite for the package surface. |

`packages/shapy/src/shapy-template.js` and `examples/standalone.html` are
generated. Never edit them by hand. After changing the renderer source, run:

```bash
npm run build:template
```

## Rules for code changes

1. **Keep the package zero-dependency.** Do not add a runtime dependency.
2. **Keep the public API backward-compatible.** A breaking change needs a clear
   reason and a changelog entry.
3. **Treat all attribute data as untrusted.**
   - Parse `registry-data` with `JSON.parse` inside `try/catch`.
   - Validate image URLs: `http(s)`, protocol-relative, relative, and safe
     `data:image/*` only.
   - Validate icon path data; never accept raw SVG markup.
   - Validate colors before writing them to CSS.
   - Render text as text nodes, never as HTML.
   - Never add `eval`, `new Function`, or unsanitized HTML injection.
4. **Preserve accessibility.** Keep `role="img"`/`role="group"`, the overridable
   `aria-label`, keyboard-operable demo controls, and reduced-motion behavior.
5. **Keep the renderer in one place.** Edit `shapy-index.html`, then regenerate.
6. **Do not commit scratch files, screenshots, logs, or local paths.**

## Testing

Run the Node test suite:

```bash
npm test
```

Run the complete repository verification:

```bash
npm run verify
```

`verify` regenerates the template, checks documentation and package metadata,
runs the tests, builds the Vue demo, and dry-runs the npm package.

For rendering changes, also check the demo at:

- desktop `1350x800`
- mobile `390x844`
- wide `1920x1080`

The manual checklist in [AGENTS.md](./AGENTS.md) lists the browser behaviors
that matter.

## Documentation

Every user-visible change needs documentation:

- `CHANGELOG.md` for the change itself.
- `README.md` for repository-level usage.
- `packages/shapy/README.md` for the npm package page.
- `docs/GETTING_STARTED.md` for setup and recipes.
- `docs/AI_CONTEXT.md` for architecture, file layout, and known limitations.
- `docs/UNIQUENESS.md` when shape, emoji, sticker, or setting counts change.

Keep the author, sponsor, and funding sections consistent across the READMEs,
`package.json`, `LICENSE`, and `.github/FUNDING.yml`.

## Commit and pull request style

- Use a short imperative subject, for example `Fix: keep ambient shapes in the
  selected pool`.
- Explain the problem and the smallest fix in the body.
- Link the issue with `Closes #123` when applicable.
- Include the commands you ran and the browsers you checked.
- Keep unrelated refactors out of the pull request.

The pull request template contains the full checklist.

## Release process

Maintainers only:

1. Bump the version in `packages/shapy/package.json`.
2. Update `CHANGELOG.md`.
3. Run `npm run verify`.
4. Review `npm pack --workspace shapy --dry-run`.
5. Publish only after explicit approval and a successful `npm login`:

```bash
npm run publish:shapy
```

Do not publish from a dirty working tree.

## Support the project

Shapy is free and MIT-licensed, built and maintained by
[Hemant Rao](https://github.com/hemant-rao). If it saves you time, you can
[sponsor its maintenance](https://github.com/sponsors/hemant-rao) or try
[Odio Book](https://odiobook.com), the project's sponsor.

More packages by the same author:
[universal-toast-message](https://www.npmjs.com/package/universal-toast-message).
