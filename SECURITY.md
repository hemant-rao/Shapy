# Security Policy

Shapy is a browser-only, zero-dependency Web Component. It treats every
attribute, registry value, color, image URL, and text value as untrusted input.

## Supported versions

| Version | Supported |
| --- | --- |
| `1.0.x` | Yes |
| `< 1.0` | No |

Security fixes are released as patch versions on the current major line.

## Reporting a vulnerability

**Do not open a public issue for a security problem.**

Use GitHub's private vulnerability reporting:

<https://github.com/hemant-rao/Shapy/security/advisories/new>

Include:

- the affected version or commit,
- a minimal reproduction,
- the browser and operating system,
- the impact you believe the issue has,
- any suggested fix or mitigation.

You will receive an acknowledgement as soon as possible, usually within a few
days. Please give the maintainer time to investigate and release a fix before
disclosing the issue publicly.

## Security model

- **No runtime dependencies.** The published package has no third-party runtime
  code.
- **No `eval` or `new Function`.** Renderer script text is static and generated
  from `packages/shapy/src/shapy-index.html`.
- **Shadow DOM isolation.** The renderer lives in an open shadow root. Host CSS
  cannot style its internals; use the documented `::part()` hooks and
  `--shapy-*` variables.
- **Registry data is per-instance.** Custom groups arrive through the
  `registry-data` attribute and are never stored on `globalThis`.
- **Image URLs are validated.** Only `http(s)`, protocol-relative, relative, and
  safe `data:image/*` URLs are accepted. `javascript:`, `data:text/html`,
  `blob:`, `ftp:`, other schemes, and URLs containing backslashes are dropped.
- **Icons are path data.** Raw SVG markup is rejected; path data is validated
  against an allowlist of SVG path commands and numbers.
- **Colors are validated.** Color attributes and `custom-colors` are checked
  against a CSS color allowlist and the browser's color parser.
- **Text is plain text.** The overlay creates text nodes. HTML in `text`,
  `text-accent`, `subtext`, or `eyebrow` is displayed, never executed.
- **Remote images are not fetched by Shapy.** The browser loads allowed image
  URLs directly; Shapy does not proxy or inspect remote content.

## Scope

In scope:

- the `shapy` package source and published tarball,
- the custom element, renderer, sanitization, and public API,
- the repository demo when the issue is caused by package code.

Out of scope:

- vulnerabilities in the demo's development dependencies,
- browser bugs or missing browser features,
- social engineering,
- issues that require an already-compromised page or extension.

## Safe harbor

Good-faith security research is welcome. Do not access, modify, or exfiltrate
data that does not belong to you, and do not run denial-of-service tests against
public infrastructure.

## Support

Shapy is maintained by [Hemant Rao](https://github.com/hemant-rao) and sponsored
by [Odio Book](https://odiobook.com). If you want to support the maintenance,
use [GitHub Sponsors](https://github.com/sponsors/hemant-rao).
