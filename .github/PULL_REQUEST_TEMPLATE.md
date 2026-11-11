## What changed

<!-- Describe the problem and the smallest change that fixes it. -->

## Related issue

<!-- Closes #123, or "none". -->

## Checklist

- [ ] `npm run verify` passes.
- [ ] `npm test` passes.
- [ ] Documentation is updated: `README.md`, `packages/shapy-bg/README.md`,
      `CHANGELOG.md`, and the relevant files in `docs/`.
- [ ] Generated files were rebuilt with `npm run build:template`; I did not edit
      `packages/shapy-bg/src/shapy-template.js` or `examples/standalone.html` by hand.
- [ ] Public API changes are backward-compatible, or the breaking change is
      explained above.
- [ ] Browser checks were run at desktop (`1350x800`), mobile (`390x844`), and
      wide (`1920x1080`) sizes when rendering changed.
- [ ] New custom media, colors, or text handling follows the security rules in
      `AGENTS.md`.
