# Getting started with Shapy

A step-by-step guide for first-time users. You do not need any Web Component
experience.

## What is Shapy?

Shapy is a zero-dependency Web Component that draws an animated, seeded shape
background.

You add one HTML tag:

```html
<shapy-background seed="4D5E465BCA" palette="midnight"></shapy-background>
```

and import the package once:

```js
import 'shapy';
```

That is the whole idea. Shapy fills the element with shapes, lines, emoji, or
stickers.

A **seed** is a short text that decides the pattern. The same seed and the same
settings always produce the same composition. Change the seed and you get a new
composition. Seeds are easy to share.

## What you need

- Node.js **20.19 or newer**
- npm
- A code editor
- A terminal

Check your versions:

```bash
node --version
npm --version
```

If Node.js is older than 20.19, install the current LTS version from
[nodejs.org](https://nodejs.org/).

## Try it in 2 minutes

The repository includes a minimal example that works without creating a new
project.

### 1. Clone the repository

```bash
git clone https://github.com/hemant-rao/Shapy.git
cd Shapy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the minimal example

```bash
npm run dev:example
```

Vite opens `http://localhost:5174/examples/minimal.html`. Click **New pattern**
to generate a fresh seed.

What the example demonstrates:

- `<shapy-background>` is the background.
- CSS gives the element a size:
  `position: fixed; inset: 0; display: block;`
- `import 'shapy'` registers the custom element.
- `setAttribute('seed', ...)` updates the composition.

Prefer the full demo? Run:

```bash
npm run dev
```

Then open `/` for the background-only page and `/config` for the full control
panel.

## Use Shapy in your own project

This section uses Vite because it is the smallest setup for a beginner. Shapy
also works with Vue, React, Svelte, Astro, or any tool that can render HTML.

### Step 1: Create a Vite project

```bash
npm create vite@latest my-shapy-app -- --template vanilla
cd my-shapy-app
npm install
```

### Step 2: Install Shapy

```bash
npm install shapy
```

> **Pre-release note:** `shapy` is not on npm yet. Until the first public
> release, use the repository example above or install the package from the
> repository workspace. The rest of this guide shows the final npm workflow.

### Step 3: Import Shapy once

Replace the contents of `src/main.js` with:

```js
import 'shapy';
import './style.css';
```

### Step 4: Add the element

Replace the `<body>` of `index.html` with:

```html
<body>
  <shapy-background
    seed="4D5E465BCA"
    palette="midnight"
    density="72"
    scale="110"
  ></shapy-background>

  <main>
    <h1>Hello, Shapy!</h1>
    <p>This text sits above the generated background.</p>
  </main>

  <script type="module" src="/src/main.js"></script>
</body>
```

### Step 5: Give it a size and put your content above it

Replace `src/style.css` with:

```css
html,
body {
  min-height: 100%;
  margin: 0;
}

body {
  background: #0a0f1e;
  color: #f8fafc;
  font-family: system-ui, sans-serif;
}

shapy-background {
  position: fixed;
  inset: 0;
  display: block;
}

main {
  position: relative;
  z-index: 1;
  max-width: 720px;
  padding: 15vh 24px 80px;
  margin: 0 auto;
}
```

### Step 6: Run it

```bash
npm run dev
```

Open the URL that Vite prints. You now have a working Shapy background.

## The four settings to learn first

| What you want | Attribute | Example |
| --- | --- | --- |
| A specific pattern | `seed` | `seed="4D5E465BCA"` |
| A different color mood | `palette` | `palette="ocean"` |
| Specific shapes | `shape-set` + `shapes` | `shape-set="custom" shapes="circle,emoji-0"` |
| A calmer or busier feel | `density`, `scale`, `speed`, `motion` | `density="50" scale="90" motion="calm"` |

The full list is in the [attributes reference](../README.md#attributes).

## Common recipes

### Create a new pattern button

```js
import { createSeed } from 'shapy';

const background = document.querySelector('shapy-background');

document.querySelector('#new-pattern').addEventListener('click', () => {
  background.setAttribute('seed', createSeed());
});
```

### Keep the same pattern on every page load

Pass a fixed seed:

```html
<shapy-background seed="4D5E465BCA"></shapy-background>
```

If you omit `seed`, every element instance gets a fresh 128-bit seed. That is
why the pattern changes on reload when no seed is set.

### Pick one shape

```html
<shapy-background shape-set="custom" shapes="circle"></shapy-background>
```

### Pick a custom mix

```html
<shapy-background
  shape-set="custom"
  shapes="triangleUp,hexagon,blob,emoji-0"
></shapy-background>
```

`shapes` accepts a comma-separated list or a JSON array. Use
`shape-set="custom"` with `shapes`; without `custom`, the `shapes` value is
ignored.

### Use a palette

```html
<shapy-background palette="ocean"></shapy-background>
```

Available palettes: `midnight`, `sandstone`, `bauhaus`, `forest`, `plum`,
`ocean`, `clay`, `mono`.

### Use your own colors

```html
<shapy-background custom-colors="#ff3b30,#30d158,#0a84ff"></shapy-background>
```

`custom-colors` overrides the palette colors. Pass a comma-separated list of
valid CSS colors.

### Pause and resume

```html
<shapy-background paused></shapy-background>
```

Or from JavaScript:

```js
background.toggleAttribute('paused', true);  // pause
background.toggleAttribute('paused', false); // resume
```

### Add stickers

Stickers are optional and ship inside the same package.

```js
import 'shapy';
import { STICKER_REGISTRY } from 'shapy/stickers';

const background = document.querySelector('shapy-background');
background.setAttribute('registry-data', JSON.stringify(STICKER_REGISTRY));
background.setAttribute('shape-set', 'stickers');
```

Use only a few stickers:

```js
background.setAttribute('shape-set', 'custom');
background.setAttribute('shapes', 'sticker-0,sticker-2,sticker-7');
```

### Use your own images as shapes

```js
const registry = {
  brand: {
    label: 'Brand marks',
    items: [
      { key: 'brand-logo', label: 'Logo', image: '/logo.svg', size: 1.1 },
      { key: 'brand-star', label: 'Star', image: '/star.svg', size: 0.9 }
    ]
  }
};

background.setAttribute('registry-data', JSON.stringify(registry));
background.setAttribute('shape-set', 'custom');
background.setAttribute('shapes', 'brand-logo,brand-star');
```

Only pass image URLs you trust. Shapy renders the image but does not fetch or
sanitize remote content for you.

### Share a seed in the URL

```js
const seed = new URLSearchParams(location.search).get('seed');
if (seed) {
  document.querySelector('shapy-background').setAttribute('seed', seed);
}
```

Then share a link such as `?seed=4D5E465BCA`.

### Use more than one background

Each `<shapy-background>` has its own shadow root, seed, and settings:

```html
<shapy-background seed="hero" palette="midnight"></shapy-background>
<shapy-background seed="card" palette="ocean"></shapy-background>
```

## Use with Vue 3

Tell the Vue compiler that `shapy-*` tags are custom elements:

```js
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('shapy-')
        }
      }
    })
  ]
});
```

Then use the element in a component:

```vue
<script setup>
import 'shapy';
</script>

<template>
  <shapy-background
    seed="4D5E465BCA"
    palette="midnight"
    shape-set="custom"
    shapes="circle,emoji-0"
    style="position: fixed; inset: 0; display: block;"
  />
</template>
```

The full Vue demo is in [`apps/demo`](../apps/demo).

## Use with React or Svelte

Shapy is a custom element, so it works anywhere HTML works.

React 19 renders custom elements directly. For React 18, set attributes with a
ref if your JSX setup drops unknown attributes:

```jsx
import { useEffect, useRef } from 'react';
import 'shapy';

export default function Background() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.setAttribute('seed', '4D5E465BCA');
    element.setAttribute('palette', 'midnight');
  }, []);

  return (
    <shapy-background
      ref={ref}
      style={{ position: 'fixed', inset: 0, display: 'block' }}
    />
  );
}
```

In Svelte, use it directly:

```svelte
<script>
  import 'shapy';
</script>

<shapy-background seed="4D5E465BCA" palette="midnight" />
```

## TypeScript

Type definitions ship with the package:

```ts
import { createShapy, type ShapyOptions } from 'shapy';

const options: ShapyOptions = {
  seed: '4D5E465BCA',
  palette: 'ocean',
  shapeSet: 'custom',
  shapes: ['circle', 'emoji-0']
};

const container = document.querySelector('#background');
if (container) {
  createShapy().mount(container, options);
}
```

`mount()` accepts camelCase or kebab-case option names, replaces the
container's existing content, and returns the created `<shapy-background>`
element.

## Troubleshooting

### Nothing appears

Check these in order:

1. Did you import `shapy`?
2. Does `shapy-background` have a size? Try
   `shapy-background { position: fixed; inset: 0; display: block; }`.
3. Is the element inside the `<body>`?
4. Check the browser console for errors.

### Vue says "Failed to resolve component: shapy-background"

Add the `isCustomElement` option shown in the Vue section above.

### The pattern changes every time I reload

You did not pass a `seed`. Shapy generates a fresh seed for each element when
`seed` is missing. Pass a fixed seed to keep the pattern.

### Stickers do not appear

Make sure you:

1. Import from `shapy/stickers`.
2. Set `registry-data` to `JSON.stringify(STICKER_REGISTRY)`.
3. Set `shape-set="stickers"` or use `shape-set="custom"` with sticker keys.

### I changed the seed but the pattern did not change

Attribute changes are debounced by 80 ms. Wait a moment, and make sure you are
setting the attribute on the `<shapy-background>` element, not on its parent.

### It does not work with server-side rendering

Shapy needs the browser. In Next.js, Nuxt, or another SSR framework, import it
only on the client (for example inside `useEffect` or `onMounted`).

### I only want the custom element, not the catalog helpers

```js
import 'shapy/element';
```

This registers `<shapy-background>` without importing the catalog exports.

## Cheat sheet

```html
<!-- Full-page background -->
<shapy-background
  seed="4D5E465BCA"
  palette="midnight"
  density="72"
  scale="110"
  style="position: fixed; inset: 0; display: block;"
></shapy-background>

<!-- One shape -->
<shapy-background
  shape-set="custom"
  shapes="circle"
  palette="ocean"
></shapy-background>

<!-- Calm, centered composition -->
<shapy-background
  layout="center"
  align="center"
  size-mode="same"
  motion="calm"
  speed="80"
></shapy-background>

<!-- Paused background -->
<shapy-background paused></shapy-background>
```

## Next steps

- [Attributes reference](../README.md#attributes)
- [JavaScript API](../README.md#javascript-api)
- [Optional stickers](../README.md#optional-stickers)
- [How unique is a seed?](./UNIQUENESS.md)
- [Full Vue demo](../apps/demo)
- [Minimal example](../examples/minimal.html)

If something is unclear, open an issue:
<https://github.com/hemant-rao/Shapy/issues>.
