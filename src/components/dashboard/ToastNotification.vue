<script setup lang="ts">
import { computed } from "vue";
import { useToastStore, type Toast } from "@/stores/toastStore";

const toastStore = useToastStore();

const toasts = computed(() => toastStore.toasts);

function dismiss(id: string) {
  toastStore.dismiss(id);
}

function getIcon(type: Toast["type"]) {
  return type;
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="[toast.type]"
          role="alert"
          aria-live="polite"
        >
          <div class="toast-icon">
            <!-- Success -->
            <svg
              v-if="toast.type === 'success'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <!-- Error -->
            <svg
              v-else-if="toast.type === 'error'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <!-- Warning -->
            <svg
              v-else-if="toast.type === 'warning'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <!-- Info -->
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>

          <span class="toast-message">{{ toast.message }}</span>

          <button
            class="toast-close"
            @click="dismiss(toast.id)"
            aria-label="Close notification"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div
            class="toast-progress"
            :style="{ animationDuration: `${toast.duration}ms` }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 100px;
  right: 24px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--hs-surface-0);
  border-radius: var(--hs-radius-md);
  box-shadow:
    0 10px 15px rgba(17, 17, 27, 0.2),
    0 20px 40px rgba(17, 17, 27, 0.25);
  min-width: 280px;
  max-width: 400px;
  position: relative;
  overflow: hidden;
  pointer-events: auto;
}

.toast.success {
  border-left: 3px solid var(--hs-success);
}
.toast.error {
  border-left: 3px solid var(--hs-danger);
}
.toast.warning {
  border-left: 3px solid var(--hs-warning);
}
.toast.info {
  border-left: 3px solid var(--hs-accent);
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-icon svg {
  width: 100%;
  height: 100%;
}

.toast.success .toast-icon {
  color: var(--hs-success);
}
.toast.error .toast-icon {
  color: var(--hs-danger);
}
.toast.warning .toast-icon {
  color: var(--hs-warning);
}
.toast.info .toast-icon {
  color: var(--hs-accent);
}

.toast-message {
  flex: 1;
  font-size: 14px;
  color: var(--hs-text);
  line-height: 1.4;
}

.toast-close {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--hs-muted);
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;
  transition: all var(--motion-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  color: var(--hs-text);
  background: var(--hs-surface-1);
}

.toast-close svg {
  width: 14px;
  height: 14px;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  animation: progress linear forwards;
}

.toast.success .toast-progress {
  background: var(--hs-success);
}
.toast.error .toast-progress {
  background: var(--hs-danger);
}
.toast.warning .toast-progress {
  background: var(--hs-warning);
}
.toast.info .toast-progress {
  background: var(--hs-accent);
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0;
  }
}

/* Transitions */
.toast-enter-active {
  animation: toast-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  animation: toast-out 0.25s var(--ease-out) forwards;
}

.toast-move {
  transition: transform 0.3s var(--ease-out);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .toast-container {
    left: 16px;
    right: 16px;
    bottom: 80px;
  }

  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>
