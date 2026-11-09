<template>
  <div class="home">
    <shapy-background
      :seed="seed"
      palette="midnight"
      density="72"
      scale="110"
      class="bg"
    ></shapy-background>

    <main class="hero">
      <div class="brand">
        <span class="mark"><i></i><b></b><s></s></span>
        <span>shapy<sup>®</sup></span>
      </div>

      <p class="eyebrow"><span class="dot"></span> Infinite · seeded · CSS</p>
      <h1>Shape your<br><em>story.</em></h1>
      <p class="lede">
        A generative background system for websites, videos, and everything in between.
        Every seed creates a one-of-one composition.
      </p>

      <div class="actions">
        <button class="btn btn--primary" @click="newSeed">
          New pattern
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M13.5 2.5v4h-4"></path>
            <path d="M13.5 6.5A6 6 0 1 0 14 9"></path>
          </svg>
        </button>
        <button class="btn btn--ghost" @click="copySeed">Copy seed</button>
      </div>

      <div class="seedline">
        <span class="seedline__label">seed</span>
        <code>{{ seed.slice(0, 10).toUpperCase() }}</code>
        <span class="seedline__badge">one-of-one</span>
      </div>
    </main>

    <div class="toast" :class="{ 'is-visible': toast }">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { createSeed } from 'shapy';

const seed = ref('4D5E465BCA');
const toast = ref('');

function newSeed() {
  seed.value = createSeed();
}

async function copySeed() {
  try {
    await navigator.clipboard.writeText(seed.value);
  } catch {
    const area = document.createElement('textarea');
    area.value = seed.value;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  toast.value = 'Full seed copied';
  setTimeout(() => { toast.value = ''; }, 1800);
}
</script>

<style scoped>
.home {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #0A0F1E;
  color: #F8FAFC;
  font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
}
.bg { position: absolute; inset: 0; }
.hero {
  position: relative;
  z-index: 2;
  max-width: 760px;
  padding: clamp(110px, 14vh, 160px) clamp(24px, 5vw, 72px) 120px;
  pointer-events: none;
}
.hero > * { pointer-events: auto; }
.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 40px;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 22px;
  letter-spacing: -.02em;
}
.brand sup { font-family: 'DM Sans', sans-serif; font-size: 8px; opacity: .45; margin-left: 2px; }
.mark { display: flex; align-items: flex-end; gap: 3px; height: 18px; }
.mark i { width: 7px; height: 7px; border-radius: 50%; background: #7DD3FC; }
.mark b { width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 8px solid #F8FAFC; }
.mark s { width: 7px; height: 7px; background: #F8FAFC; }
.eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 22px;
  font-size: 11px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: #94A3B8;
}
.eyebrow .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7DD3FC;
  box-shadow: 0 0 0 4px rgba(125, 211, 252, .16);
}
h1 {
  margin: 0;
  font-family: 'Instrument Serif', 'Iowan Old Style', Georgia, serif;
  font-weight: 400;
  font-size: clamp(58px, 8.6vw, 128px);
  line-height: .86;
  letter-spacing: -.045em;
}
h1 em { font-style: italic; color: #7DD3FC; }
.lede {
  max-width: 48ch;
  margin: 28px 0 0;
  font-size: clamp(15px, 1.2vw, 17px);
  line-height: 1.6;
  color: #94A3B8;
}
.actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 34px; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid transparent;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform .25s cubic-bezier(.22,1,.36,1), background .25s, box-shadow .25s;
}
.btn:hover { transform: translateY(-2px); }
.btn--primary { background: #7DD3FC; color: #06121F; box-shadow: 0 10px 30px rgba(125, 211, 252, .22); }
.btn--ghost { background: rgba(10, 15, 30, .6); border-color: rgba(148, 163, 184, .18); color: #F8FAFC; backdrop-filter: blur(12px); }
.btn svg { width: 15px; height: 15px; }
.seedline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 26px;
  font-size: 11px;
  color: #94A3B8;
}
.seedline__label { text-transform: uppercase; letter-spacing: .16em; font-size: 9px; }
.seedline code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  color: #F8FAFC;
  background: rgba(248, 250, 252, .06);
  border: 1px solid rgba(148, 163, 184, .18);
  padding: 4px 7px;
  border-radius: 5px;
}
.seedline__badge {
  font-size: 9px;
  letter-spacing: .12em;
  text-transform: uppercase;
  padding: 3px 7px;
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, .3);
  color: #7DD3FC;
  background: rgba(125, 211, 252, .08);
}
.toast {
  position: fixed;
  z-index: 50;
  left: 50%;
  bottom: 34px;
  transform: translate(-50%, 12px);
  opacity: 0;
  pointer-events: none;
  padding: 10px 14px;
  border-radius: 999px;
  background: #F8FAFC;
  color: #0A0F1E;
  font-size: 12px;
  font-weight: 600;
  transition: opacity .25s, transform .25s;
}
.toast.is-visible { opacity: 1; transform: translate(-50%, 0); }
@media (max-width: 980px) {
  .hero { padding-top: 110px; padding-bottom: 80px; }
}
</style>
