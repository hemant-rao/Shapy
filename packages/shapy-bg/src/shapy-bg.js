import { SHAPY_HTML } from './shapy-template.js';
import { createSeed } from './seed.js';

const ATTRS = [
  'seed', 'palette', 'shape-set', 'layout', 'align', 'motion', 'direction',
  'density', 'scale', 'size-mode', 'speed', 'move', 'custom-colors', 'safe-area', 'safe-zones',
  'live', 'time', 'loop', 'aspect', 'paused',
  'shapes', 'registry-data', 'registry', 'background', 'text-color', 'muted-color',
  'accent-color', 'glow-color', 'scrim-color', 'scrim', 'headline', 'text',
  'text-accent', 'subtext', 'description', 'eyebrow', 'text-position', 'text-align',
  'text-scale', 'font-family', 'font-weight'
];

const DEFAULT_LABEL = 'Shapy generative background';

const TEXT_POSITIONS = new Set([
  'top-left', 'top-center', 'top-right',
  'middle-left', 'middle-center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right'
]);

const OPTION_ALIASES = {
  registry: 'registry-data',
  registryData: 'registry-data',
  colors: 'custom-colors',
  customColors: 'custom-colors',
  backgroundColor: 'background',
  bg: 'background',
  foreground: 'text-color',
  textColor: 'text-color',
  mutedColor: 'muted-color',
  accentColor: 'accent-color',
  glowColor: 'glow-color',
  scrimColor: 'scrim-color',
  textAccent: 'text-accent',
  textPosition: 'text-position',
  textAlign: 'text-align',
  textScale: 'text-scale',
  fontFamily: 'font-family',
  fontWeight: 'font-weight',
  shapeSet: 'shape-set',
  sizeMode: 'size-mode',
  safeArea: 'safe-area',
  safeZones: 'safe-zones'
};

// These aliases use different attributes. Setting one clears the other so a
// partial setOptions() call cannot leave a stale value winning the read order.
const ATTRIBUTE_ALIASES = {
  text: ['headline'],
  headline: ['text'],
  subtext: ['description'],
  description: ['subtext'],
  'registry-data': ['registry'],
  registry: ['registry-data']
};

// Approximate platform UI bands for 9:16 video. Values are percentages of the
// host box. They are deliberately conservative: keeping shapes out of these
// areas prevents captions, buttons, and navigation from fighting the art.
export const SAFE_ZONE_PRESETS = {
  tiktok: [
    { top: 0, right: 100, bottom: 10, left: 0 },
    { top: 78, right: 100, bottom: 100, left: 0 },
    { top: 30, right: 100, bottom: 82, left: 86 }
  ],
  reels: [
    { top: 0, right: 100, bottom: 12, left: 0 },
    { top: 80, right: 100, bottom: 100, left: 0 },
    { top: 30, right: 100, bottom: 84, left: 86 }
  ],
  shorts: [
    { top: 0, right: 100, bottom: 10, left: 0 },
    { top: 80, right: 100, bottom: 100, left: 0 },
    { top: 30, right: 100, bottom: 84, left: 88 }
  ],
  story: [
    { top: 0, right: 100, bottom: 12, left: 0 },
    { top: 82, right: 100, bottom: 100, left: 0 }
  ]
};

const ASPECTS = new Set(['9:16', '16:9', '1:1', '4:5']);

function readOptionalNumber(value, min, max) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(max, Math.max(min, number));
}

function readLive(value) {
  if (value === null || value === undefined) return true;
  const token = String(value).trim().toLowerCase();
  return !(token === 'off' || token === 'false' || token === '0' || token === 'no');
}

function readLoop(value) {
  if (value === null || value === undefined) return 0;
  if (String(value).trim() === '') return 10;
  return readNumber(value, 0, 0, 600);
}

function normalizeAspect(value) {
  const token = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return ASPECTS.has(token) ? token : '';
}

function addSafeZone(zones, rect) {
  if (!rect || typeof rect !== 'object' || Array.isArray(rect)) return;
  const top = readNumber(rect.top, 0, 0, 100);
  const right = readNumber(rect.right, 100, 0, 100);
  const bottom = readNumber(rect.bottom, 100, 0, 100);
  const left = readNumber(rect.left, 0, 0, 100);
  if (right <= left || bottom <= top) return;
  zones.push({ top, right, bottom, left });
}

/**
 * Parse the `safe-zones` attribute. Accepts a comma list of preset names
 * (`tiktok,reels`), a JSON array of names/objects, or an array supplied through
 * `setOptions()`. Custom objects use percentages from 0 to 100.
 */
export function parseSafeZones(raw) {
  if (!raw) return [];
  let entries = raw;
  if (typeof raw === 'string') {
    const value = raw.trim();
    if (!value) return [];
    if (value.startsWith('[')) {
      try { entries = JSON.parse(value); } catch { return []; }
    } else {
      entries = value.split(',').map((entry) => entry.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(entries)) return [];
  const zones = [];
  for (const entry of entries) {
    if (zones.length >= 12) break;
    if (typeof entry === 'string') {
      const preset = SAFE_ZONE_PRESETS[entry.trim().toLowerCase()];
      if (preset) {
        for (const rect of preset) {
          if (zones.length >= 12) break;
          addSafeZone(zones, rect);
        }
      }
    } else {
      addSafeZone(zones, entry);
    }
  }
  return zones;
}

const OVERRIDES = `
  :host {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    contain: layout style paint;
    background: var(--shapy-bg-attr, var(--shapy-bg, #0A0F1E));
  }
  /* Opt-in aspect ratios. Leave the host alone by default; consumers that set a
     fixed parent size keep it. */
  :host([aspect="9:16"]) { aspect-ratio: 9 / 16; height: auto; }
  :host([aspect="16:9"]) { aspect-ratio: 16 / 9; height: auto; }
  :host([aspect="1:1"]) { aspect-ratio: 1 / 1; height: auto; }
  :host([aspect="4:5"]) { aspect-ratio: 4 / 5; height: auto; }
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
  .has-scrim .scrim { display: block !important; }
  .grain { opacity: .02 !important; }

  /* Optional text overlay. It lives inside .app so palette variables and host
     CSS custom properties inherit into it. */
  .shapy-text {
    position: absolute;
    z-index: 6;
    display: flex;
    flex-direction: column;
    gap: .55em;
    max-width: min(760px, calc(100% - 2 * clamp(20px, 6vw, 72px)));
    pointer-events: none;
    overflow-wrap: anywhere;
    text-wrap: balance;
  }
  .shapy-text[hidden],
  .shapy-text [hidden] { display: none !important; }
  .shapy-text__eyebrow {
    margin: 0;
    font-family: var(--font-sans);
    font-size: clamp(10px, .9vw, 12px);
    font-weight: 600;
    letter-spacing: .18em;
    line-height: 1.4;
    text-transform: uppercase;
    color: var(--muted);
  }
  .shapy-text__headline {
    margin: 0;
    font-family: var(--shapy-font, var(--font-display));
    font-weight: var(--shapy-weight, 500);
    font-size: calc(clamp(40px, 7vw, 112px) * var(--shapy-text-scale, 1));
    line-height: .92;
    letter-spacing: -.04em;
    color: var(--ink);
  }
  .shapy-text__headline em {
    font-style: italic;
    color: var(--accent);
  }
  .shapy-text__body {
    margin: 0;
    max-width: 46ch;
    font-family: var(--font-sans);
    font-size: calc(clamp(14px, 1.2vw, 17px) * var(--shapy-text-scale, 1));
    line-height: 1.6;
    color: var(--muted);
  }

  .shapy-text[data-position="top-left"] { top: clamp(20px, 7vh, 72px); left: clamp(20px, 6vw, 72px); }
  .shapy-text[data-position="top-center"] { top: clamp(20px, 7vh, 72px); left: 50%; transform: translateX(-50%); align-items: center; text-align: center; }
  .shapy-text[data-position="top-right"] { top: clamp(20px, 7vh, 72px); right: clamp(20px, 6vw, 72px); align-items: flex-end; text-align: right; }
  .shapy-text[data-position="middle-left"] { top: 50%; left: clamp(20px, 6vw, 72px); transform: translateY(-50%); }
  .shapy-text[data-position="middle-center"] { top: 50%; left: 50%; transform: translate(-50%, -50%); align-items: center; text-align: center; }
  .shapy-text[data-position="middle-right"] { top: 50%; right: clamp(20px, 6vw, 72px); transform: translateY(-50%); align-items: flex-end; text-align: right; }
  .shapy-text[data-position="bottom-left"] { bottom: clamp(20px, 7vh, 72px); left: clamp(20px, 6vw, 72px); }
  .shapy-text[data-position="bottom-center"] { bottom: clamp(20px, 7vh, 72px); left: 50%; transform: translateX(-50%); align-items: center; text-align: center; }
  .shapy-text[data-position="bottom-right"] { bottom: clamp(20px, 7vh, 72px); right: clamp(20px, 6vw, 72px); align-items: flex-end; text-align: right; }

  .shapy-text[data-align="left"] { align-items: flex-start; text-align: left; }
  .shapy-text[data-align="center"] { align-items: center; text-align: center; }
  .shapy-text[data-align="right"] { align-items: flex-end; text-align: right; }

  @media (max-width: 700px) {
    .shapy-text { max-width: calc(100% - 40px); }
    .shapy-text__headline { font-size: calc(clamp(32px, 11vw, 64px) * var(--shapy-text-scale, 1)); }
    .shapy-text__body { font-size: calc(14px * var(--shapy-text-scale, 1)); }
  }
`;

let scopeId = 0;

// CSS color sanity: only allow safe color tokens. Reject anything that could
// inject url(), javascript:, expression(), or break out of a declaration.
const CSS_COLOR_RE = /^(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(rgb|rgba|hsl|hsla|hwb|lab|lch|color)\([^)]*\)|[a-z]+(-[a-z]+)*|transparent|currentcolor|inherit|initial|unset|revert)$/;

function sanitizeColor(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const token = value.trim();
  if (!CSS_COLOR_RE.test(token)) return null;
  // Block any attempt to inject url() or javascript through color values.
  if (/url\s*\(|javascript\s*:|expression\s*\(|behaviour\s*:|behavior\s*:/i.test(token)) return null;
  // The regex only proves the shape looks like a color. Let the browser confirm
  // the value is real (for example, reject `not-a-color`).
  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && !CSS.supports('color', token)) return null;
  return token;
}

function splitColorList(raw) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < raw.length; index++) {
    const char = raw[index];
    if (char === '(') depth++;
    else if (char === ')') depth = Math.max(0, depth - 1);
    else if (char === ',' && depth === 0) {
      parts.push(raw.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(raw.slice(start));
  return parts;
}

function sanitizeColors(raw) {
  if (!raw || !raw.trim()) return [];
  return splitColorList(raw)
    .map((s) => sanitizeColor(s))
    .filter(Boolean)
    .slice(0, 64);
}

function sanitizeFontFamily(value) {
  if (typeof value !== 'string') return '';
  const token = value.trim();
  if (!token || token.length > 200) return '';
  if (!/^[a-zA-Z0-9\s,'"_-]+$/.test(token)) return '';
  if (/url\s*\(|javascript\s*:|expression\s*\(/i.test(token)) return '';
  return token;
}

function readNumber(value, fallback, min, max) {
  if (value === null || value === undefined || String(value).trim() === '') return fallback;
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function parseRegistry(raw) {
  if (!raw || raw.length > 2000000) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function parseShapes(raw) {
  if (!raw) return [];
  const value = raw.trim();
  if (!value) return [];
  if (value.startsWith('[')) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String).slice(0, 256) : [];
    } catch {
      return [];
    }
  }
  return value.split(',').map((key) => key.trim()).filter(Boolean).slice(0, 256);
}

function normalizeTextPosition(value) {
  const token = typeof value === 'string' ? value.trim() : '';
  return TEXT_POSITIONS.has(token) ? token : 'middle-left';
}

function normalizeTextAlign(value) {
  const token = typeof value === 'string' ? value.trim() : '';
  return token === 'left' || token === 'center' || token === 'right' ? token : '';
}

function toAttributeName(name) {
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function toAttributeValue(attribute, value) {
  if (attribute === 'custom-colors') {
    return Array.isArray(value) ? value.map(String).join(',') : String(value);
  }
  if (attribute === 'shapes') {
    return Array.isArray(value) ? value.join(',') : String(value);
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
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
    this._defaultSeed = createSeed();
    this._defaultsApplied = false;
    this._roleDefault = false;
    this._labelDefault = false;
    this._lastRole = '';
    this._lastLabel = '';
    this._textEl = null;
    this._seekTime = null;
    this._seekFn = null;
  }

  connectedCallback() {
    if (!this._defaultsApplied) {
      this._roleDefault = !this.hasAttribute('role');
      if (this._roleDefault) {
        this.setAttribute('role', 'img');
        this._lastRole = 'img';
      }
      this._labelDefault = !this.hasAttribute('aria-label');
      if (this._labelDefault) {
        this.setAttribute('aria-label', DEFAULT_LABEL);
        this._lastLabel = DEFAULT_LABEL;
      }
      this._defaultsApplied = true;
    }
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
    const text = this.getAttribute('headline') || this.getAttribute('text') || '';
    return {
      seed: this.getAttribute('seed') || this._defaultSeed,
      palette: this.getAttribute('palette') || 'midnight',
      shapeSet: this.getAttribute('shape-set') || 'all',
      layout: this.getAttribute('layout') || 'auto',
      align: this.getAttribute('align') || 'random',
      motion: this.getAttribute('motion') || 'mixed',
      direction: this.getAttribute('direction') || 'random',
      density: readNumber(this.getAttribute('density'), 72, 20, 100),
      scale: readNumber(this.getAttribute('scale'), 110, 60, 140),
      sizeMode: this.getAttribute('size-mode') || 'mixed',
      speed: readNumber(this.getAttribute('speed'), 100, 50, 200),
      move: readNumber(this.getAttribute('move'), 100, 30, 200),
      customColors: sanitizeColors(this.getAttribute('custom-colors') || '').join(','),
      safeArea: this.hasAttribute('safe-area'),
      safeZones: parseSafeZones(this.getAttribute('safe-zones')),
      live: readLive(this.getAttribute('live')),
      time: readOptionalNumber(this.getAttribute('time'), 0, 86400),
      loop: readLoop(this.getAttribute('loop')),
      aspect: normalizeAspect(this.getAttribute('aspect')) || 'auto',
      paused: this.hasAttribute('paused'),
      shapes: parseShapes(this.getAttribute('shapes')),
      registry: parseRegistry(this.getAttribute('registry-data') || this.getAttribute('registry')) || {},
      background: sanitizeColor(this.getAttribute('background')) || '',
      textColor: sanitizeColor(this.getAttribute('text-color')) || '',
      mutedColor: sanitizeColor(this.getAttribute('muted-color')) || '',
      accentColor: sanitizeColor(this.getAttribute('accent-color')) || '',
      glowColor: sanitizeColor(this.getAttribute('glow-color')) || '',
      scrimColor: sanitizeColor(this.getAttribute('scrim-color')) || '',
      scrim: this.hasAttribute('scrim'),
      text: text.slice(0, 500),
      textAccent: (this.getAttribute('text-accent') || '').slice(0, 200),
      subtext: (this.getAttribute('subtext') || this.getAttribute('description') || '').slice(0, 1000),
      eyebrow: (this.getAttribute('eyebrow') || '').slice(0, 200),
      textPosition: normalizeTextPosition(this.getAttribute('text-position')),
      textAlign: normalizeTextAlign(this.getAttribute('text-align')),
      textScale: readNumber(this.getAttribute('text-scale'), 100, 50, 200),
      fontFamily: sanitizeFontFamily(this.getAttribute('font-family')),
      fontWeight: readNumber(this.getAttribute('font-weight'), 400, 100, 900)
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

    const appEl = this.shadowRoot.querySelector('#app');
    const overlay = document.createElement('div');
    overlay.id = 'shapyText';
    overlay.className = 'shapy-text';
    overlay.hidden = true;
    overlay.setAttribute('part', 'text');
    overlay.innerHTML = '<p class="shapy-text__eyebrow" part="eyebrow"></p><div class="shapy-text__headline" part="headline"></div><p class="shapy-text__body" part="body"></p>';
    appEl.appendChild(overlay);
    this._textEl = overlay;
    this._renderText(state);
    this._syncHostBackground(state);

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
      createElementNS: (namespace, tag) => document.createElementNS(namespace, tag),
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
      matchMedia: (query) => globalThis.matchMedia?.(query),
      addEventListener(type, handler) {
        if (type === 'resize') resizeHandlers.add(handler);
        else globalThis.addEventListener(type, handler);
      },
      removeEventListener(type, handler) {
        if (type === 'resize') resizeHandlers.delete(handler);
        else globalThis.removeEventListener(type, handler);
      }
    };

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

    // The shared template also powers the standalone demo. A package element
    // only needs the background layers, so drop the demo-only chrome after the
    // renderer has booted (its control references are safe to keep detached).
    this.shadowRoot.querySelectorAll('.topbar, .panel, .footer, .toast, .hero .actions, .hero .seedline').forEach((node) => node.remove());

    this._applyFn = windowShim.__SHAPY_APPLY__;
    this._destroyFn = windowShim.__SHAPY_DESTROY__;
    this._seekFn = windowShim.__SHAPY_SEEK__;
    this._cleanup = () => {
      if (resizeObserver) resizeObserver.disconnect();
      globalThis.removeEventListener('resize', onResize);
    };
    this._initialized = true;
    this._syncHostBackground(state);

    if (this._seekTime !== null && this._seekFn) this._seekFn(this._seekTime);

    queueMicrotask(() => {
      if (!this.isConnected) return;
      this.dispatchEvent(new CustomEvent('shapy:ready', {
        detail: { element: this, seed: state.seed, options: this.getOptions() }
      }));
    });
  }

  _apply() {
    if (!this._initialized || !this._applyFn) return;
    const state = this._readState();
    this._syncHostBackground(state);
    this._renderText(state);
    this._applyFn(state);
    if (this._seekTime !== null && this._seekFn) this._seekFn(this._seekTime);
    this.dispatchEvent(new CustomEvent('shapy:change', {
      detail: { element: this, options: this.getOptions() }
    }));
  }

  _syncHostBackground(state) {
    if (state.background) this.style.setProperty('--shapy-bg-attr', state.background);
    else this.style.removeProperty('--shapy-bg-attr');
  }

  _renderText(state) {
    if (!this._textEl) return;
    const visible = Boolean(state.text || state.textAccent || state.subtext || state.eyebrow);
    this._textEl.hidden = !visible;

    if (this._roleDefault) {
      if (this.getAttribute('role') === this._lastRole) {
        const role = visible ? 'group' : 'img';
        this.setAttribute('role', role);
        this._lastRole = role;
      } else {
        // The host changed role explicitly; stop managing it.
        this._roleDefault = false;
      }
    }
    if (this._labelDefault) {
      if (this.getAttribute('aria-label') === this._lastLabel) {
        const label = visible
          ? (state.text ? state.text.replace(/\s+/g, ' ').trim().slice(0, 120) : 'Shapy generative background with text')
          : DEFAULT_LABEL;
        const nextLabel = label || 'Shapy generative background with text';
        this.setAttribute('aria-label', nextLabel);
        this._lastLabel = nextLabel;
      } else {
        // The host changed the label explicitly; stop managing it.
        this._labelDefault = false;
      }
    }

    if (!visible) {
      this._textEl.querySelectorAll('.shapy-text__eyebrow, .shapy-text__headline, .shapy-text__body')
        .forEach((node) => node.replaceChildren());
      return;
    }

    const position = state.textPosition;
    const align = state.textAlign
      || (position.endsWith('-center') ? 'center' : position.endsWith('-right') ? 'right' : 'left');
    this._textEl.dataset.position = position;
    this._textEl.dataset.align = align;
    this._textEl.style.setProperty('--shapy-text-scale', (state.textScale / 100).toFixed(2));
    this._textEl.style.setProperty('--shapy-weight', String(state.fontWeight));
    if (state.fontFamily) this._textEl.style.setProperty('--shapy-font', state.fontFamily);
    else this._textEl.style.removeProperty('--shapy-font');

    const eyebrow = this._textEl.querySelector('.shapy-text__eyebrow');
    eyebrow.textContent = state.eyebrow;
    eyebrow.hidden = !state.eyebrow;

    const headline = this._textEl.querySelector('.shapy-text__headline');
    headline.replaceChildren();
    state.text.split(/\r?\n/).slice(0, 8).forEach((line, index) => {
      if (index) headline.appendChild(document.createElement('br'));
      headline.appendChild(document.createTextNode(line));
    });
    if (state.textAccent) {
      if (state.text) headline.appendChild(document.createElement('br'));
      const accent = document.createElement('em');
      accent.textContent = state.textAccent;
      headline.appendChild(accent);
    }
    headline.hidden = !state.text && !state.textAccent;

    const body = this._textEl.querySelector('.shapy-text__body');
    body.textContent = state.subtext;
    body.hidden = !state.subtext;
  }

  getOptions() {
    const state = this._readState();
    return {
      seed: state.seed,
      palette: state.palette,
      shapeSet: state.shapeSet,
      shapes: state.shapes,
      registry: Object.keys(state.registry).length ? state.registry : null,
      layout: state.layout,
      align: state.align,
      motion: state.motion,
      direction: state.direction,
      density: state.density,
      scale: state.scale,
      sizeMode: state.sizeMode,
      speed: state.speed,
      move: state.move,
      customColors: state.customColors ? splitColorList(state.customColors) : [],
      safeArea: state.safeArea,
      safeZones: state.safeZones,
      live: state.live,
      time: this._seekTime !== null ? this._seekTime : state.time,
      loop: state.loop,
      aspect: state.aspect,
      paused: state.paused,
      background: state.background,
      textColor: state.textColor,
      mutedColor: state.mutedColor,
      accentColor: state.accentColor,
      glowColor: state.glowColor,
      scrimColor: state.scrimColor,
      scrim: state.scrim,
      text: state.text,
      textAccent: state.textAccent,
      subtext: state.subtext,
      eyebrow: state.eyebrow,
      textPosition: state.textPosition,
      textAlign: state.textAlign,
      textScale: state.textScale,
      fontFamily: state.fontFamily,
      fontWeight: state.fontWeight
    };
  }

  setOptions(options = {}) {
    if (Object.prototype.hasOwnProperty.call(options, 'time')) this._seekTime = null;
    for (const [key, value] of Object.entries(options)) {
      const attribute = OPTION_ALIASES[key] || toAttributeName(key);
      for (const alias of ATTRIBUTE_ALIASES[attribute] || []) this.removeAttribute(alias);
      // `live: false` is a natural way to ask for deterministic mode even
      // though false normally removes an option.
      if (attribute === 'live' && value === false) {
        this.setAttribute('live', 'off');
        continue;
      }
      if (value === undefined || value === null || value === false) {
        this.removeAttribute(attribute);
        continue;
      }
      if (value === true) {
        this.setAttribute(attribute, '');
        continue;
      }
      this.setAttribute(attribute, toAttributeValue(attribute, value));
    }

    if (this.isConnected) {
      clearTimeout(this._renderTimer);
      if (this._initialized) this._apply();
      else this._init();
    }
    return this;
  }

  refresh() {
    if (this._initialized) this._apply();
    else if (this.isConnected) this._init();
    return this;
  }

  /**
   * Freeze the renderer at an exact timeline position, in seconds. Returns a
   * promise that resolves after the frame has been painted. Pass `null` to
   * resume the normal animation timeline.
   */
  async seek(seconds) {
    if (seconds === null || seconds === undefined || seconds === '') {
      this._seekTime = null;
      if (this._initialized && this._seekFn) await this._seekFn(null);
      return this;
    }
    const value = Number(seconds);
    if (!Number.isFinite(value)) {
      throw new TypeError('seek(seconds) expects a finite number or null');
    }
    const loop = readLoop(this.getAttribute('loop'));
    this._seekTime = loop > 0 ? ((value % loop) + loop) % loop : Math.max(0, value);
    if (!this._initialized && this.isConnected) this._init();
    if (this._initialized && this._seekFn) await this._seekFn(this._seekTime);
    return this;
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
    this._seekFn = null;
    this._initialized = false;
    this._textEl = null;
    this.style.removeProperty('--shapy-bg-attr');
    if (this.shadowRoot) this.shadowRoot.replaceChildren();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('shapy-background')) {
  customElements.define('shapy-background', ShapyBackground);
}
