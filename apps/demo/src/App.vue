<template>
  <div id="app">
    <nav class="nav">
      <router-link to="/">Background</router-link>
      <router-link to="/config">Config Play</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import 'shapy-bg';
</script>

<style>
html, body, #app { height: 100%; margin: 0; }
body { background: #0A0F1E; }
.nav {
  position: fixed;
  z-index: 1000;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  padding: 5px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, .18);
  background: rgba(10, 15, 30, .62);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
.nav a {
  padding: 8px 14px;
  border-radius: 999px;
  color: #94A3B8;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.nav a.router-link-active {
  color: #06121F;
  background: #7DD3FC;
}
</style>
