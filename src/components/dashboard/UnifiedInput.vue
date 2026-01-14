<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useAppStore } from "@/stores/appStore";

// Props & Emits
const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "submit"): void;
}>();

// Store & State
const appStore = useAppStore();
const inputEl = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);

// Computed Mode Logic
const activeMode = computed(() => {
  if (appStore.mode === "search") return "search";
  // Visual command mode detection
  if (props.modelValue.startsWith("/")) return "command";
  return "default";
});

// Placeholder Logic
const computedPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder;

  switch (activeMode.value) {
    case "search":
      return `Search with ${appStore.searchEngine}...`;
    case "command":
      return "Enter command...";
    default:
      return "Type to search or / for commands...";
  }
});

// Event Handlers
const onInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  emit("update:modelValue", value);
};

const onSubmit = () => {
  emit("submit");
};

// Expose focus method if needed by parent
defineExpose({
  focus: () => inputEl.value?.focus(),
});
</script>

<template>
  <div
    class="unified-input-container"
    :class="[activeMode, { 'is-focused': isFocused }]"
  >
    <div class="input-wrapper">
      <!-- Mode Indicator (Left) -->
      <div class="mode-indicator">
        <transition name="slide-fade" mode="out-in">
          <div
            v-if="activeMode === 'command'"
            key="command"
            class="indicator-icon command"
          >
            <span class="symbol">/</span>
          </div>
          <div
            v-else-if="activeMode === 'search'"
            key="search"
            class="indicator-icon search"
          >
            <svg
              class="search-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <div v-else key="default" class="indicator-icon default">
            <span class="symbol">&gt;</span>
          </div>
        </transition>
      </div>

      <!-- Main Input -->
      <input
        ref="inputEl"
        :value="modelValue"
        @input="onInput"
        @keydown.enter="onSubmit"
        @focus="isFocused = true"
        @blur="isFocused = false"
        :placeholder="computedPlaceholder"
        type="text"
        class="main-input"
        spellcheck="false"
        autocomplete="off"
      />

      <!-- Search Engine Badge (Right) -->
      <div class="right-actions">
        <transition name="fade">
          <div v-if="activeMode === 'search'" class="engine-badge">
            <span class="engine-name">{{ appStore.searchEngine }}</span>
          </div>
        </transition>
      </div>
    </div>

    <!-- Focus Border/Glow Effect -->
    <div class="glow-border"></div>
  </div>
</template>

<style scoped>
/* Theme Variables & Reset */
.unified-input-container {
  /* Colors */
  --color-bg: #1e1e2e;
  --color-bg-hover: #252535;
  --color-text: #cdd6f4;
  --color-text-dim: #6c7086;
  --color-primary: #89b4fa;
  --color-accent-command: #a6e3a1; /* Green */
  --color-accent-search: #f9e2af; /* Yellow */
  --color-border: rgba(255, 255, 255, 0.08);

  /* Dimensions */
  --input-height: 48px;
  --radius: 12px;

  /* Layout */
  position: relative;
  width: 100%;
  max-width: 640px; /* Sensible max-width */
  margin: 0 auto;
  font-family: "JetBrains Mono", "Fira Code", monospace; /* Tech feel */
}

/* Wrapper */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: var(--input-height);
  background: var(--color-bg);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  z-index: 2;
}

/* Hover State */
.unified-input-container:hover .input-wrapper {
  background: var(--color-bg-hover);
  border-color: rgba(255, 255, 255, 0.15);
}

/* Focus State */
.unified-input-container.is-focused .input-wrapper {
  border-color: var(--color-primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

/* Mode Specific Coloring on Focus */
.unified-input-container.command.is-focused .input-wrapper {
  border-color: var(--color-accent-command);
}
.unified-input-container.search.is-focused .input-wrapper {
  border-color: var(--color-accent-search);
}

/* Left Indicator */
.mode-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px; /* Square aspect */
  height: 100%;
  color: var(--color-text-dim);
  border-right: 1px solid transparent;
  transition: all 0.3s ease;
}

.unified-input-container.is-focused .mode-indicator {
  color: var(--color-primary);
  border-right-color: rgba(255, 255, 255, 0.05);
}

.unified-input-container.command .mode-indicator {
  color: var(--color-accent-command);
}
.unified-input-container.search .mode-indicator {
  color: var(--color-accent-search);
}

.indicator-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.search-svg {
  width: 18px;
  height: 18px;
}

.symbol {
  font-size: 1.25rem;
  line-height: 1;
}

/* Main Input */
.main-input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: 1rem;
  padding: 0 12px;
  font-family: inherit;
  outline: none;
}

.main-input::placeholder {
  color: var(--color-text-dim);
  opacity: 0.6;
  font-size: 0.9rem;
}

/* Right Badge */
.right-actions {
  display: flex;
  align-items: center;
  padding-right: 8px;
}

.engine-badge {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  background: rgba(249, 226, 175, 0.15); /* Search accent low opacity */
  color: var(--color-accent-search);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid rgba(249, 226, 175, 0.2);
}

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
