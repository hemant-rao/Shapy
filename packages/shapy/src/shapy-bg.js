import { SHAPY_HTML } from './shapy-template.js';

const ATTRS = [
  'seed', 'palette', 'shape-set', 'layout', 'align', 'motion', 'direction',
  'density', 'scale', 'size-mode', 'speed', 'move', 'custom-colors', 'safe-area', 'paused',
  'shapes', 'registry-data'
];

const OVERRIDES = `
  :host {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    contain: layout style paint;
    background: var(--bg, #0A0F1E);
  }
  .app {
    position: absolute !important;
    inset: 0 !important;
    min-height: 100% !important;
    height: 100% !important;
  }
  .bg, .ambient, .shapes, .scrim, .grain { position: absolute !important; }
  .topbar, .panel, .footer, .toast { display: none !important; }
  .hero {
    min-height: 100% !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
  .shapes { filter: saturate(1.35) brightness(1.22); }
  .scrim { display: none !important; }
  .grain { opacity: .02 !important; }
`;

let scopeId = 0;

function parseRegistry(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function parseShapes(raw) {
  if (!raw) return [];
  const value = raw.trim();
  if (!value) return [];
  if (value.startsWith('[')) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return value.split(',').map((key) => key.trim()).filter(Boolean);
}

function makeSeed() {
  const bytes = new Uint8Array(16);
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function scopeRendererCss(css) {
  return css
    .replace(/:root\b/g, ':host')
    .replace(/html,\s*body\s*\{/g, ':host {')
    .replace(/(^|\n)\s*body\s*\{/g, '$1  .app {');
}

class ShapyBackground extends (typeof HTMLElement !== 'undefined' ? HTMLElement : class {}) {
  static get observedAttributes() { return ATTRS; }

  constructor() {
    super();
    if (this.attachShadow) this.attachShadow({ mode: 'open' });
    this._initialized = false;
    this._scopeKey = `__shapy_scope_${++scopeId}`;
    this._defaultSeed = makeSeed();
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'img');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Shapy generative background');
    if (this._initialized) this._apply();
    else this._init();
  }

  disconnectedCallback() {
    clearTimeout(this._renderTimer);
    this._destroy();
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    clearTimeout(this._renderTimer);
    this._renderTimer = setTimeout(() => {
      if (this._initialized) this._apply();
      else this._init();
    }, 80);
  }

  _readState() {
    return {
      seed: this.getAttribute('seed') || this._defaultSeed,
      palette: this.getAttribute('palette') || 'midnight',
      shapeSet: this.getAttribute('shape-set') || 'all',
      layout: this.getAttribute('layout') || 'auto',
      align: this.getAttribute('align') || 'random',
      motion: this.getAttribute('motion') || 'mixed',
      direction: this.getAttribute('direction') || 'random',
      density: Number(this.getAttribute('density') || 72),
      scale: Number(this.getAttribute('scale') || 110),
      sizeMode: this.getAttribute('size-mode') || 'mixed',
      speed: Number(this.getAttribute('speed') || 100),
      move: Number(this.getAttribute('move') || 100),
      customColors: this.getAttribute('custom-colors') || '',
      safeArea: this.hasAttribute('safe-area'),
      paused: this.hasAttribute('paused'),
      shapes: parseShapes(this.getAttribute('shapes')),
      registry: parseRegistry(this.getAttribute('registry-data')) || {}
    };
  }

  _init() {
    if (!this.shadowRoot || typeof DOMParser === 'undefined') return;
    this._destroy();

    const state = this._readState();
    const parsed = new DOMParser().parseFromString(SHAPY_HTML, 'text/html');
    const styleText = [...parsed.querySelectorAll('style')].map((el) => el.textContent).join('\n');
    const scripts = [...parsed.body.querySelectorAll('script')];
    const scriptText = scripts.map((el) => el.textContent).join('\n');
    scripts.forEach((el) => el.remove());

    const style = document.createElement('style');
    style.textContent = `${scopeRendererCss(styleText)}\n${OVERRIDES}`;
    this.shadowRoot.appendChild(style);

    const template = document.createElement('template');
    template.innerHTML = parsed.body.innerHTML;
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    const resizeHandlers = new Set();
    const onResize = () => {
      for (const handler of resizeHandlers) handler();
    };
    globalThis.addEventListener('resize', onResize);

    const host = this;
    const documentShim = {
      querySelector: (selector) => host.shadowRoot.querySelector(selector),
      querySelectorAll: (selector) => host.shadowRoot.querySelectorAll(selector),
      getElementById: (id) => host.shadowRoot.getElementById(id),
      createElement: (tag) => document.createElement(tag),
      createDocumentFragment: () => document.createDocumentFragment(),
      body: host.shadowRoot,
      execCommand: (...args) => document.execCommand?.(...args),
      addEventListener: (...args) => host.shadowRoot.addEventListener(...args),
      removeEventListener: (...args) => host.shadowRoot.removeEventListener(...args)
    };

    const windowShim = {
      __SHAPY_STATE__: state,
      get innerWidth() { return host.clientWidth || globalThis.innerWidth; },
      get innerHeight() { return host.clientHeight || globalThis.innerHeight; },
      addEventListener(type, handler) {
        if (type === 'resize') resizeHandlers.add(handler);
        else globalThis.addEventListener(type, handler);
      },
      removeEventListener(type, handler) {
        if (type === 'resize') resizeHandlers.delete(handler);
        else globalThis.removeEventListener(type, handler);
      }
    };

    Object.defineProperty(windowShim, 'ShapyRegistry', {
      get: () => globalThis.ShapyRegistry,
      set: (value) => { globalThis.ShapyRegistry = value; },
      configurable: true
    });

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(this);
    }

    const scope = { document: documentShim, window: windowShim };
    globalThis[this._scopeKey] = scope;
    const script = document.createElement('script');
    script.textContent = `(() => {
const document = globalThis[${JSON.stringify(this._scopeKey)}].document;
const window = globalThis[${JSON.stringify(this._scopeKey)}].window;
${scriptText}
})();`;
    try {
      this.shadowRoot.appendChild(script);
    } finally {
      delete globalThis[this._scopeKey];
    }
    script.remove();

    this._applyFn = windowShim.__SHAPY_APPLY__;
    this._destroyFn = windowShim.__SHAPY_DESTROY__;
    this._cleanup = () => {
      if (resizeObserver) resizeObserver.disconnect();
      globalThis.removeEventListener('resize', onResize);
    };
    this._initialized = true;
  }

  _apply() {
    if (!this._initialized || !this._applyFn) return;
    this._applyFn(this._readState());
  }

  _destroy() {
    clearTimeout(this._renderTimer);
    if (this._destroyFn) {
      try { this._destroyFn(); } catch {}
      this._destroyFn = null;
    }
    if (this._cleanup) {
      this._cleanup();
      this._cleanup = null;
    }
    this._applyFn = null;
    this._initialized = false;
    if (this.shadowRoot) this.shadowRoot.replaceChildren();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('shapy-background')) {
  customElements.define('shapy-background', ShapyBackground);
}
