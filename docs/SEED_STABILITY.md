# Seed stability

Shapy promises that a seed keeps producing the same visual result inside a
documented compatibility window. This page defines that window, what it covers,
and what falls outside it.

## The contract

For the same **engine version**, the same **seed**, the same **options**, and the
same **viewport and device pixel ratio**, Shapy produces the same static
composition:

- the same shape keys, count, and ambient shapes,
- the same positions, sizes, rotations, colors, and opacities,
- the same initial animation state at `time="0"`,
- the same `seek(t)` frame for any `t` on the same engine version, and
- the same frame at the end of a `loop` period as at its start.

`SHAPY_ENGINE_VERSION` identifies the engine. It is exported from the package root:

```js
import { SHAPY_ENGINE_VERSION } from 'shapy';

console.log(SHAPY_ENGINE_VERSION); // 1
```

## Compatibility window

| Change | Seed output stays stable? |
| --- | --- |
| Patch release (`1.0.0` → `1.0.1`) | Yes, while `SHAPY_ENGINE_VERSION` is unchanged. |
| Minor release (`1.0.0` → `1.1.0`) | Yes, while `SHAPY_ENGINE_VERSION` is unchanged. |
| Any renderer change that alters the composition or timeline | No. Bump `SHAPY_ENGINE_VERSION` and the package major version. |
| A different viewport, aspect ratio, or device pixel ratio | No. These change layout math by design. |
| Live mutations (`live="on"`, the default) | No. Live updates are intentionally non-deterministic. |
| Different fonts or font versions in the text overlay | Text metrics can change; the shape composition is unaffected. |

The engine version is the practical pin. Two `1.x` releases with engine version
`1` are expected to produce the same static composition and the same seek frames.
A release with engine version `2` may not.

## Deterministic capture recipe

```html
<shapy-background
  seed="reel-01"
  palette="ocean"
  live="off"
  time="0"
  loop="8"
  safe-zones="tiktok"
  aspect="9:16"
  style="width: 100%; display: block;"
></shapy-background>
```

```js
const element = document.querySelector('shapy-background');
await document.fonts.ready;

await element.seek(2.5);  // exact frame
// capture the element
await element.seek(null); // resume
```

For repeatable output:

1. Use `live="off"` so the composition never mutates between frames.
2. Fix the viewport, the host size, and the device pixel ratio.
3. Wait for `document.fonts.ready` before capturing text.
4. Use `seek(t)` for every frame instead of relying on wall-clock time.
5. Use `loop` when the clip must close seamlessly; `seek()` wraps at the period.
   Loop durations keep full precision after quantization, and frozen captures
   disable compositor layer promotion, so the frame at the period end matches the
   frame at the start.

`time` and `loop` also disable live mutations. `paused` alone does not, so prefer
`live="off"` or `time` for capture work.

## What is not guaranteed

- **Live composition updates.** With `live="on"`, the renderer periodically
  changes colors, opacity, and play state. That behaviour is intentionally
  random and outside the stability contract.
- **Pixel-identical rasterization across browsers and operating systems.**
  Antialiasing, subpixel rounding, and emoji artwork are platform-dependent.
  Composition geometry is stable; the last pixel of rasterization may not be.
- **Font fallback.** The text overlay uses the available font stack. Different
  machines can render text with different metrics.
- **Indefinite backward compatibility.** Engine version `1` is stable for the
  `1.x` line. A future engine major may change composition output.

## Changing the engine

When a change alters generated output:

1. Increment `SHAPY_ENGINE_VERSION` in `packages/shapy/src/index.js`.
2. Update the public types and tests.
3. Note the change in `CHANGELOG.md`.
4. Update this page with the new contract window.

Changes that only affect documentation, types, packaging, or non-visual internals
do not need an engine bump.

---

Shapy is maintained by [Hemant Rao](https://github.com/hemant-rao) and sponsored
by [Odio Book](https://odiobook.com). If this page helped, consider
[sponsoring the project](https://github.com/sponsors/hemant-rao).
