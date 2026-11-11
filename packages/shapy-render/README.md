# shapy-render

Export [Shapy](https://github.com/hemant-rao/shapy-bg) generative backgrounds to
MP4, WebM, or a PNG sequence. Rendering is deterministic: Shapy captures each
frame with `seek()` at a fixed timeline position, so the same seed and options
produce the same clip.

> **Sponsored by [Odio Book](https://odiobook.com)** — the all-in-one AI video &
> audio studio: AI video editing, auto subtitles, scene detection, voice
> generation and text-to-speech, all in the browser. Odio Book funds the time
> that goes into this project. **[Try it free →](https://odiobook.com)**

## Install

```bash
npm install shapy-bg shapy-render
npx playwright install chromium
```

`shapy-render` uses Playwright for frame capture. MP4 output also needs a
system `ffmpeg` with `libx264`. Non-alpha WebM works with the ffmpeg that
Playwright installs; PNG sequences need no ffmpeg. Alpha WebM needs a full
ffmpeg with PNG decoding; the Playwright build does not include a PNG decoder.

## CLI

```bash
npx shapy-render --seed reel-01 --duration 8 --output reel.mp4
```

A 9:16 clip with platform safe zones and a poster:

```bash
npx shapy-render \
  --seed reel-01 \
  --palette ocean \
  --width 1080 --height 1920 \
  --duration 8 --fps 30 \
  --loop 8 \
  --safe-zones tiktok \
  --output reel.mp4 \
  --poster reel-poster.png
```

Common options:

| Option | Default | Description |
| --- | --- | --- |
| `--output` | `shapy-render.mp4` | Output file, or directory for PNG frames. |
| `--format` | inferred | `mp4`, `webm`, or `png`. |
| `--width` / `--height` | `1080` / `1920` | Capture size in CSS pixels. |
| `--fps` | `30` | Frames per second. |
| `--duration` | `8` | Clip length in seconds. |
| `--dpr` | `1` | Device pixel ratio. |
| `--alpha` | off | Transparent background. WebM/PNG only. |
| `--poster` | none | Also write a `.png`, `.jpg`, or `.jpeg` still. |
| `--poster-time` | `0` | Timeline position for the poster. |
| `--crf` | `20` | Quality, 0–51. Lower is better. |
| `--loop` | none | Seamless loop period passed to Shapy. |
| `--ffmpeg` | auto | Use a specific ffmpeg executable. |
| `--keep-frames` | off | Keep captured image frames. |

For a clean loop, keep `--duration` an exact multiple of `--loop` (for example
`--loop 8 --duration 8`). `seek()` wraps at the loop period, so a duration that
is not a multiple can jump mid-clip.

Shapy options are passed straight through:

```bash
npx shapy-render \
  --seed deck-01 \
  --palette plum \
  --shape-set custom \
  --shapes circle,ring,emoji-4 \
  --layout rows \
  --align center \
  --motion calm \
  --safe-zones reels \
  --output deck.webm
```

Use `--option key=value` for anything not listed, or `--options` with a JSON
object:

```bash
npx shapy-render \
  --options '{"seed":"json-seed","palette":"forest","text":"Shape your story."}' \
  --output hero.mp4
```

Run `npx shapy-render --help` for the complete flag list.

## Library

```js
import { render } from 'shapy-render';

const result = await render({
  output: 'reel.webm',
  width: 1080,
  height: 1920,
  duration: 8,
  fps: 30,
  loop: 8,
  options: {
    seed: 'reel-01',
    palette: 'ocean',
    safeZones: 'tiktok'
  },
  onProgress({ frame, total }) {
    console.log(`${frame}/${total}`);
  }
});

console.log(result.seed, result.output);
```

`render()` returns:

```js
{
  output,      // absolute output path
  format,      // 'mp4' | 'webm' | 'png'
  seed,        // the seed used, including an auto-generated one
  engineVersion, // SHAPY_ENGINE_VERSION used for the capture
  width,       // output pixels (width × dpr)
  height,      // output pixels (height × dpr)
  fps,
  duration,    // actual duration in seconds
  frames,      // captured frame count
  poster,
  ffmpeg,
  framesDir    // when keepFrames is true
}
```

## Alpha

- **WebM VP9** supports alpha with `--alpha`. Alpha encoding needs a full ffmpeg
  with a PNG decoder; Playwright's bundled ffmpeg does not include one.
- **PNG sequences** support alpha with `--alpha` and `--format png`.
- **MP4 does not support alpha.** `shapy-render` rejects the combination instead
  of silently producing black frames.

When `--alpha` is set, the background is forced to `transparent`. Poster images
must be PNG in alpha mode.

## PNG sequences

`--format png` treats `--output` as a directory:

```bash
npx shapy-render --format png --output frames --duration 4
```

Frames are written as `frames/frame-000001.png`, `frame-000002.png`, and so on.
Encode them separately if you need a different codec or container.

## MP4 and ffmpeg

MP4 encoding requires an ffmpeg binary with `libx264`:

```bash
ffmpeg -version
ffmpeg -hide_banner -encoders | grep libx264
```

If ffmpeg is not on `PATH`, pass `--ffmpeg C:\path\to\ffmpeg.exe` or set
`SHAPY_FFMPEG`. WebM needs `libvpx-vp9`; the ffmpeg bundled with Playwright
includes it, so non-alpha WebM usually works without a system install. Alpha
WebM additionally needs PNG decoding, which the bundled build does not provide.

## Determinism

The renderer:

1. loads Shapy with `live="off"`,
2. fixes the viewport, device pixel ratio, and color profile,
3. waits for fonts and images,
4. calls `seek(t)` for each frame, and
5. captures a screenshot after the frame has painted (PNG, or JPEG when the
   available ffmpeg build has no PNG decoder).

Use a fixed seed, viewport, DPR, and engine version for reproducible output.
Rasterization, emoji artwork, and font availability can still differ between
operating systems. See
[Seed stability](https://github.com/hemant-rao/shapy-bg/blob/main/docs/SEED_STABILITY.md).

## Requirements

- Node.js 20.19 or newer
- `shapy-bg` 1.0 or newer
- Playwright Chromium
- ffmpeg with `libx264` for MP4

## Security

Report vulnerabilities privately through the
[security policy](https://github.com/hemant-rao/shapy-bg/blob/main/SECURITY.md).
Do not open a public issue for a security problem.

## License

MIT © [Hemant Rao](https://github.com/hemant-rao). Sponsored by
[Odio Book](https://odiobook.com). Support the project through
[GitHub Sponsors](https://github.com/sponsors/hemant-rao).
