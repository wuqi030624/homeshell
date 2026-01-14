<template>
  <Teleport to="body">
    <div class="terminal-drawer-root">
      <!-- Backdrop -->
      <transition name="drawer-fade">
        <div
          v-if="isOpen"
          class="drawer-backdrop"
          @click="$emit('close')"
        ></div>
      </transition>

      <!-- Drawer Panel -->
      <transition name="drawer-slide">
        <div v-if="isOpen" class="drawer-panel">
          <div class="drawer-header">
            <button
              class="close-btn"
              @click="$emit('close')"
              title="Close Terminal (Esc)"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="terminal-container">
            <Terminal height="100%" :full-screen="false" />
          </div>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import Terminal from "@/components/terminal/Terminal.vue";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.isOpen) return;

  // Close on Escape or Ctrl+`
  if (e.key === "Escape" || (e.ctrlKey && e.key === "`")) {
    // Prevent default to avoid typing ` in other inputs if any
    if (e.ctrlKey && e.key === "`") {
      e.preventDefault();
    }
    emit("close");
  }
};

// Clean up Terminal's global listener when drawer closes
onUnmounted(() => {
  document.onkeydown = null;
  window.removeEventListener("keydown", handleKeydown);
});

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

// Watch isOpen to manage cleanup if component stays mounted but v-if toggles inside (though v-if is on root here)
// Actually, since v-if is used by parent to toggle THIS component?
// The prompt says "v-if to completely unmount Terminal when closed".
// If the parent uses v-if on TerminalDrawer, then onUnmounted runs when closed.
// If the parent uses v-show or keeps it, and WE use v-if inside (as I did above),
// then we need to watch isOpen to clean up Terminal's mess when it unmounts internally.
watch(
  () => props.isOpen,
  (val) => {
    if (!val) {
      // When drawer closes (internal v-if false), clean up the legacy onkeydown
      document.onkeydown = null;
    }
  }
);
</script>

<style scoped>
.terminal-drawer-root {
  position: relative;
  z-index: 2000;
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 2001;
}

.drawer-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40vh;
  background: rgba(0, 0, 0, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 2002;
  /* Design Details */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.drawer-header {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: scale(1.1);
}

.terminal-container {
  flex: 1;
  overflow: hidden;
  padding-top: 10px; /* Space for close button */
}

/* Animations */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease-in-out, backdrop-filter 0.3s ease-in-out;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0);
}

/* Spring animation for drawer */
.drawer-slide-enter-active {
  transition: transform 0.4s var(--ease-spring);
}

.drawer-slide-leave-active {
  transition: transform 0.25s var(--ease-out);
}

.drawer-slide-enter-from {
  transform: translateY(100%);
}

.drawer-slide-leave-to {
  transform: translateY(105%);
}

/* Additional spring bounce for panel content */
.drawer-slide-enter-active .drawer-panel {
  animation: drawer-spring-in 0.5s var(--ease-spring) forwards;
}

@keyframes drawer-spring-in {
  0% {
    transform: translateY(100%) scale(0.98);
    opacity: 0;
  }
  60% {
    transform: translateY(-3%) scale(1.01);
    opacity: 1;
  }
  80% {
    transform: translateY(1%);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}
</style>
