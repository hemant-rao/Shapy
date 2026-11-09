<template>
  <div class="config">
    <shapy-background
      :seed="state.seed"
      :palette="state.palette"
      :shape-set="state.shapeSet"
      :layout="state.layout"
      :align="state.align"
      :motion="state.motion"
      :direction="state.direction"
      :density="state.density"
      :scale="state.scale"
      :size-mode="state.sizeMode"
      :speed="state.speed"
      :move="state.move"
      :custom-colors="state.customColors"
      :safe-area="state.safeArea ? '' : null"
      :paused="state.paused ? '' : null"
      :shapes="state.shapes.join(',')"
      :registry-data="registryData"
      class="bg"
    ></shapy-background>

    <aside class="panel" aria-label="Pattern controls">
      <div class="panel__head">
        <h2>Controls</h2>
        <button class="iconbtn" type="button" :aria-label="state.paused ? 'Play animations' : 'Pause animations'" @click="state.paused = !state.paused">
          <svg v-if="!state.paused" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <rect x="2" y="1" width="3" height="10" rx="1"></rect>
            <rect x="7" y="1" width="3" height="10" rx="1"></rect>
          </svg>
          <svg v-else viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M3 1.5v9l7-4.5-7-4.5z"></path>
          </svg>
        </button>
      </div>

      <div class="field">
        <label for="seed">Seed</label>
        <input id="seed" v-model="state.seed" type="text" spellcheck="false" />
      </div>

      <div class="field">
        <label for="palette">Palette</label>
        <div class="select-wrap">
          <select id="palette" v-model="state.palette">
            <option value="midnight">Midnight</option>
            <option value="sandstone">Sandstone</option>
            <option value="bauhaus">Bauhaus</option>
            <option value="forest">Forest</option>
            <option value="plum">Plum</option>
            <option value="ocean">Ocean</option>
            <option value="clay">Clay</option>
            <option value="mono">Mono</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="shapeSet">Shape set</label>
        <div class="select-wrap">
          <select id="shapeSet" v-model="state.shapeSet">
            <option value="all">All shapes</option>
            <option value="geometry">Geometry</option>
            <option value="lines">Lines</option>
            <option value="organic">Organic</option>
            <option value="emoji">Emoji</option>
            <option value="stickers">Stickers</option>
            <option value="custom">Custom selection</option>
          </select>
        </div>
      </div>

      <div class="field">
        <div class="field__row">
          <label>Pick shapes</label>
          <output>{{ selectedCount }} selected</output>
        </div>
        <div class="picker__actions">
          <button class="mini" type="button" @click="selectAll">All</button>
          <button class="mini" type="button" @click="clearShapes">Clear</button>
          <span class="picker__hint">Click any chip to mix</span>
        </div>
        <div class="picker">
          <div v-for="group in shapeGroups" :key="group.id" class="picker__group">
            <div class="picker__head">
              <span class="picker__title">{{ group.label }}</span>
              <button class="mini mini--ghost" type="button" :title="`Select only ${group.label}`" @click="selectGroup(group)">only</button>
            </div>
            <div class="picker__chips">
              <button
                v-for="shape in group.shapes"
                :key="shape.key"
                class="chip"
                :class="{ 'is-on': selectedKeys.has(shape.key), 'chip--emoji': shape.emoji }"
                type="button"
                :title="shape.label"
                @click="toggleShape(shape.key)"
              >{{ shape.emoji || shape.label }}</button>
            </div>
          </div>
        </div>
        <small v-if="state.shapeSet === 'custom' && !state.shapes.length">Nothing selected — showing all shapes until you pick one.</small>
      </div>

      <div class="field">
        <label for="layout">Layout</label>
        <div class="select-wrap">
          <select id="layout" v-model="state.layout">
            <option value="auto">Auto / even</option>
            <option value="scatter">Random scatter</option>
            <option value="grid">Aligned grid</option>
            <option value="rows">Horizontal rows</option>
            <option value="columns">Vertical columns</option>
            <option value="center">Center cluster</option>
            <option value="edges">Edge frame</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="align">Alignment</label>
        <div class="select-wrap">
          <select id="align" v-model="state.align">
            <option value="random">Random / mixed</option>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="motion">Motion</label>
        <div class="select-wrap">
          <select id="motion" v-model="state.motion">
            <option value="mixed">Mixed</option>
            <option value="chaos">Chaos / total random</option>
            <option value="flow">Flow (exit + respawn)</option>
            <option value="bounce">Bounce (hit + return)</option>
            <option value="drift">Drift</option>
            <option value="spin">Spin</option>
            <option value="pulse">Pulse</option>
            <option value="wobble">Wobble</option>
            <option value="orbit">Orbit</option>
            <option value="calm">Calm</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="direction">Direction</label>
        <div class="select-wrap">
          <select id="direction" v-model="state.direction">
            <option value="random">Random</option>
            <option value="lr">Left → right</option>
            <option value="rl">Right → left</option>
            <option value="tb">Top → bottom</option>
            <option value="bt">Bottom → top</option>
            <option value="dr">Diagonal ↘</option>
            <option value="dl">Diagonal ↙</option>
            <option value="ur">Diagonal ↗</option>
            <option value="ul">Diagonal ↖</option>
            <option value="alternate">Alternate</option>
          </select>
        </div>
      </div>

      <div class="field">
        <div class="field__row">
          <label for="density">Density</label>
          <output>{{ state.density }}%</output>
        </div>
        <input id="density" v-model.number="state.density" type="range" min="20" max="100" />
      </div>

      <div class="field">
        <div class="field__row">
          <label for="scale">Scale</label>
          <output>{{ (state.scale / 100).toFixed(1) }}×</output>
        </div>
        <input id="scale" v-model.number="state.scale" type="range" min="60" max="140" />
      </div>

      <div class="field">
        <label for="sizeMode">Size mode</label>
        <div class="select-wrap">
          <select id="sizeMode" v-model="state.sizeMode">
            <option value="mixed">Mixed sizes</option>
            <option value="same">Same size</option>
            <option value="subtle">Subtle variation</option>
            <option value="dramatic">Dramatic variation</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      <div class="field">
        <div class="field__row">
          <label for="speed">Motion speed</label>
          <output>{{ (state.speed / 100).toFixed(1) }}×</output>
        </div>
        <input id="speed" v-model.number="state.speed" type="range" min="50" max="200" />
      </div>

      <div class="field">
        <div class="field__row">
          <label for="move">Move intensity</label>
          <output>{{ (state.move / 100).toFixed(1) }}×</output>
        </div>
        <input id="move" v-model.number="state.move" type="range" min="30" max="200" />
      </div>

      <div class="field">
        <label for="customColors">Custom colors (comma hex)</label>
        <textarea id="customColors" v-model="state.customColors" rows="2" placeholder="#ff3b30, #30d158, #0a84ff"></textarea>
        <small>Leave empty for palette.</small>
      </div>

      <label class="toggle">
        <input v-model="state.safeArea" type="checkbox" />
        <span class="toggle__ui"></span>
        <span>Text safe area</span>
      </label>

      <div class="panel__foot">
        <span>Seeded randomness · 40 shapes</span>
        <button class="textbtn" type="button" @click="reset">Reset</button>
      </div>

      <div class="actions">
        <button class="btn btn--primary" type="button" @click="newSeed">New pattern</button>
        <button class="btn btn--ghost" type="button" @click="copySeed">Copy seed</button>
      </div>
    </aside>

    <div class="toast" :class="{ 'is-visible': toast }">{{ toast }}</div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import 'shapy';
import { SHAPE_GROUPS, EMOJI_GROUP } from 'shapy/catalog';
import { STICKER_CATALOG, getRegistryData } from 'shapy/stickers';

const STICKER_GROUP = {
  id: 'stickers',
  label: 'Stickers',
  shapes: STICKER_CATALOG.map((sticker) => ({
    key: sticker.key,
    label: sticker.label,
    emoji: sticker.emoji
  }))
};

const shapeGroups = [...SHAPE_GROUPS, EMOJI_GROUP, STICKER_GROUP];
const allShapeKeys = shapeGroups.flatMap((group) => group.shapes.map((shape) => shape.key));
const registryData = getRegistryData();

const defaults = {
  seed: '4D5E465BCA',
  palette: 'midnight',
  shapeSet: 'all',
  layout: 'auto',
  align: 'random',
  motion: 'mixed',
  direction: 'random',
  density: 72,
  scale: 110,
  sizeMode: 'mixed',
  speed: 100,
  move: 100,
  customColors: '',
  safeArea: false,
  paused: false,
  shapes: []
};

const state = reactive({ ...defaults, shapes: [] });
const toast = ref('');

const selectedKeys = computed(() => {
  if (state.shapeSet === 'all') return new Set(allShapeKeys);
  if (state.shapeSet === 'custom') return new Set(state.shapes);
  const group = shapeGroups.find((item) => item.id === state.shapeSet);
  return new Set(group ? group.shapes.map((shape) => shape.key) : []);
});

const selectedCount = computed(() => selectedKeys.value.size);

function toggleShape(key) {
  const next = new Set(selectedKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  state.shapes = [...next];
  state.shapeSet = 'custom';
}

function selectGroup(group) {
  state.shapes = group.shapes.map((shape) => shape.key);
  state.shapeSet = 'custom';
}

function selectAll() {
  state.shapes = [];
  state.shapeSet = 'all';
}

function clearShapes() {
  state.shapes = [];
  state.shapeSet = 'custom';
}

function newSeed() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  state.seed = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

async function copySeed() {
  try {
    await navigator.clipboard.writeText(state.seed);
  } catch {
    const area = document.createElement('textarea');
    area.value = state.seed;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  toast.value = 'Full seed copied';
  setTimeout(() => { toast.value = ''; }, 1800);
}

function reset() {
  Object.assign(state, defaults, { seed: '4D5E465BCA' });
}
</script>

<style scoped>
.config {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #0A0F1E;
  color: #F8FAFC;
  font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
}
.bg { position: absolute; inset: 0; }
.panel {
  position: fixed;
  z-index: 25;
  top: 50%;
  right: clamp(16px, 3vw, 40px);
  transform: translateY(-50%);
  width: min(320px, calc(100vw - 32px));
  max-height: calc(100vh - 100px);
  overflow: auto;
  padding: 20px;
  background: rgba(10, 15, 30, .62);
  border: 1px solid rgba(148, 163, 184, .18);
  border-radius: 20px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, .28);
  backdrop-filter: blur(26px) saturate(1.25);
  -webkit-backdrop-filter: blur(26px) saturate(1.25);
  scrollbar-width: thin;
}
.panel__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.panel__head h2 { margin: 0; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; font-weight: 600; color: #94A3B8; }
.iconbtn {
  width: 32px; height: 32px; display: grid; place-items: center; border-radius: 50%;
  border: 1px solid rgba(148, 163, 184, .18); background: rgba(248, 250, 252, .05); color: #F8FAFC; cursor: pointer;
}
.iconbtn svg { width: 12px; height: 12px; }
.field { margin-bottom: 14px; }
.field label, .field__row label {
  display: block; margin-bottom: 7px; font-size: 10px; letter-spacing: .13em;
  text-transform: uppercase; color: #94A3B8;
}
.field__row { display: flex; align-items: center; justify-content: space-between; }
.field__row output { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; color: #F8FAFC; }
input[type="text"], textarea {
  width: 100%; padding: 10px 11px; border-radius: 9px;
  border: 1px solid rgba(148, 163, 184, .18);
  background: rgba(248, 250, 252, .05); color: #F8FAFC; font: inherit; font-size: 12px; outline: none;
  resize: vertical;
}
.select-wrap { position: relative; }
.select-wrap::after {
  content: ""; position: absolute; right: 12px; top: 50%; width: 0; height: 0;
  border-left: 4px solid transparent; border-right: 4px solid transparent;
  border-top: 5px solid #94A3B8; transform: translateY(-30%); pointer-events: none;
}
select {
  width: 100%; appearance: none; padding: 10px 30px 10px 11px; border-radius: 9px;
  border: 1px solid rgba(148, 163, 184, .18);
  background: rgba(248, 250, 252, .05); color: #F8FAFC; font: inherit; font-size: 12px; outline: none;
}
select option { background: #0A0F1E; color: #F8FAFC; }
input[type="range"] { width: 100%; height: 4px; accent-color: #7DD3FC; cursor: pointer; }
.field small { display: block; margin-top: 6px; font-size: 10px; color: #94A3B8; }
.picker__actions { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.mini {
  height: 22px; padding: 0 8px; border-radius: 999px; border: 1px solid rgba(148, 163, 184, .18);
  background: rgba(248, 250, 252, .05); color: #94A3B8; font: inherit; font-size: 9px;
  letter-spacing: .06em; text-transform: uppercase; cursor: pointer;
}
.mini:hover { color: #F8FAFC; border-color: rgba(125, 211, 252, .4); }
.mini--ghost { height: 18px; padding: 0 4px; border-color: transparent; background: transparent; color: #64748B; }
.picker__hint { margin-left: auto; font-size: 9px; color: #64748B; }
.picker {
  max-height: 190px; overflow: auto; padding: 8px; border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, .18); background: rgba(2, 6, 23, .35);
  scrollbar-width: thin;
}
.picker__group + .picker__group { margin-top: 10px; }
.picker__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
.picker__title { font-size: 9px; letter-spacing: .13em; text-transform: uppercase; color: #94A3B8; }
.picker__chips { display: flex; flex-wrap: wrap; gap: 4px; }
.chip {
  min-width: 26px; height: 25px; padding: 0 6px; border-radius: 7px;
  border: 1px solid rgba(148, 163, 184, .16); background: rgba(248, 250, 252, .04);
  color: #CBD5E1; font: inherit; font-size: 9px; cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;
}
.chip:hover { border-color: rgba(125, 211, 252, .4); }
.chip.is-on { background: rgba(125, 211, 252, .18); border-color: rgba(125, 211, 252, .55); color: #E0F2FE; }
.chip--emoji { font-size: 13px; padding: 0 4px; }
.toggle { display: flex; align-items: center; gap: 10px; margin: 18px 0 4px; font-size: 12px; cursor: pointer; user-select: none; }
.toggle input { position: absolute; opacity: 0; pointer-events: none; }
.toggle__ui {
  width: 34px; height: 20px; flex: none; position: relative; border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, .18); background: rgba(248, 250, 252, .12);
  transition: background .2s, border-color .2s;
}
.toggle__ui::after {
  content: ""; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px;
  border-radius: 50%; background: #94A3B8; transition: transform .2s, background .2s;
}
.toggle input:checked + .toggle__ui { background: rgba(125, 211, 252, .35); border-color: rgba(125, 211, 252, .55); }
.toggle input:checked + .toggle__ui::after { transform: translateX(14px); background: #7DD3FC; }
.panel__foot {
  display: flex; align-items: center; justify-content: space-between; margin-top: 16px;
  padding-top: 14px; border-top: 1px solid rgba(148, 163, 184, .18);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9px; color: #94A3B8;
}
.textbtn { border: 0; background: none; padding: 0; font: inherit; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: #94A3B8; cursor: pointer; }
.actions { display: flex; gap: 8px; margin-top: 14px; }
.btn {
  flex: 1; min-height: 38px; border-radius: 999px; border: 1px solid transparent;
  font: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
}
.btn--primary { background: #7DD3FC; color: #06121F; }
.btn--ghost { background: rgba(248, 250, 252, .06); border-color: rgba(148, 163, 184, .18); color: #F8FAFC; }
.toast {
  position: fixed; z-index: 50; left: 50%; bottom: 34px; transform: translate(-50%, 12px);
  opacity: 0; pointer-events: none; padding: 10px 14px; border-radius: 999px;
  background: #F8FAFC; color: #0A0F1E; font-size: 12px; font-weight: 600;
  transition: opacity .25s, transform .25s;
}
.toast.is-visible { opacity: 1; transform: translate(-50%, 0); }
@media (max-width: 760px) {
  .panel { top: auto; bottom: 16px; right: 16px; left: 16px; width: auto; max-height: 42vh; transform: none; }
}
</style>
