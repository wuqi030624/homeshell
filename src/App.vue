<template>
  <router-view />
</template>

<script setup lang="ts"></script>

<style>
:root {
  /* Catppuccin Mocha-inspired foundations */
  --hs-bg-crust: #11111b;
  --hs-bg-mantle: #181825;
  --hs-bg-base: #1e1e2e;

  --hs-surface-0: #313244;
  --hs-surface-1: #45475a;
  --hs-surface-2: #585b70;

  --hs-text: #cdd6f4;
  --hs-subtext: #bac2de;
  --hs-muted: #a6adc8;
  --hs-overlay-0: #6c7086;
  --hs-overlay-1: #7f849c;

  --hs-accent: #89b4fa;
  --hs-accent-2: #b4befe;

  --hs-success: #a6e3a1;
  --hs-warning: #f9e2af;
  --hs-danger: #f38ba8;

  /* Interaction layers */
  --hs-hover-bg: rgba(205, 214, 244, 0.04);
  --hs-selected-bg: rgba(137, 180, 250, 0.1);
  --hs-focus-ring: rgba(137, 180, 250, 0.55);

  /* Todo status colors */
  --hs-todo-todo: var(--hs-overlay-1);
  --hs-todo-doing: var(--hs-warning);
  --hs-todo-done: var(--hs-overlay-0);

  /* Radii / spacing */
  --hs-radius-sm: 8px;
  --hs-radius-md: 12px;
  --hs-radius-lg: 16px;

  /* Shadows - Multi-layer depth system */
  --hs-shadow-xs: 0 1px 2px rgba(17, 17, 27, 0.2);
  --hs-shadow-sm: 0 1px 2px rgba(17, 17, 27, 0.15),
    0 2px 4px rgba(17, 17, 27, 0.1);
  --hs-shadow-md: 0 4px 6px rgba(17, 17, 27, 0.15),
    0 8px 15px rgba(17, 17, 27, 0.15);
  --hs-shadow-lg: 0 10px 15px rgba(17, 17, 27, 0.2),
    0 20px 40px rgba(17, 17, 27, 0.25);
  --hs-shadow-xl: 0 20px 25px rgba(17, 17, 27, 0.25),
    0 40px 60px rgba(17, 17, 27, 0.3);

  /* Inset shadow for depth */
  --hs-shadow-inset: inset 0 2px 4px rgba(17, 17, 27, 0.3);

  /* Glow shadows */
  --hs-glow-accent: 0 0 20px rgba(137, 180, 250, 0.15);
  --hs-glow-warning: 0 0 20px rgba(249, 226, 175, 0.15);
  --hs-glow-success: 0 0 20px rgba(166, 227, 161, 0.15);
  --hs-glow-danger: 0 0 20px rgba(243, 139, 168, 0.15);

  /* Motion */
  --motion-fast: 160ms;
  --motion-base: 220ms;
  --motion-slow: 280ms;
  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring-gentle: cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-fast: 0ms;
    --motion-base: 0ms;
    --motion-slow: 0ms;
  }
}

body {
  margin: 0;
  background: var(--hs-bg-base);
  color: var(--hs-text);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
}

* {
  box-sizing: border-box;
}
</style>
