<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted } from "vue";
import { useAppStore } from "@/stores/appStore";

const appStore = useAppStore();

const isOpen = computed(() => appStore.confirmDialog.isOpen);
const title = computed(() => appStore.confirmDialog.title);
const message = computed(() => appStore.confirmDialog.message);
const confirmText = computed(() => appStore.confirmDialog.confirmText);
const cancelText = computed(() => appStore.confirmDialog.cancelText);
const dialogType = computed(() => appStore.confirmDialog.type);

const dialogRef = ref<HTMLDivElement | null>(null);

function handleConfirm() {
  appStore.confirmDialogAction();
}

function handleCancel() {
  appStore.cancelDialogAction();
}

function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return;

  if (e.key === "Escape") {
    e.preventDefault();
    handleCancel();
  } else if (e.key === "Enter") {
    e.preventDefault();
    handleConfirm();
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});

// Focus trap
watch(isOpen, (open) => {
  if (open) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div v-if="isOpen" class="confirm-overlay" @click="handleCancel">
        <div
          ref="dialogRef"
          class="confirm-dialog"
          :class="[dialogType]"
          @click.stop
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="title"
        >
          <div class="dialog-header">
            <div class="dialog-icon">
              <!-- Danger Icon -->
              <svg
                v-if="dialogType === 'danger'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <!-- Warning Icon -->
              <svg
                v-else-if="dialogType === 'warning'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <!-- Info Icon -->
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h3 class="dialog-title">{{ title }}</h3>
          </div>

          <p class="dialog-message">{{ message }}</p>

          <div class="dialog-actions">
            <button class="btn btn-cancel" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button
              class="btn btn-confirm"
              :class="[dialogType]"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.confirm-dialog {
  background: var(--hs-bg-mantle);
  border-radius: var(--hs-radius-lg);
  padding: 24px;
  width: 100%;
  max-width: 400px;
  margin: 0 16px;
  box-shadow:
    0 20px 25px rgba(17, 17, 27, 0.25),
    0 40px 60px rgba(17, 17, 27, 0.3);
  border: 1px solid var(--hs-surface-0);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.dialog-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.dialog-icon svg {
  width: 100%;
  height: 100%;
}

.confirm-dialog.danger .dialog-icon {
  color: var(--hs-danger);
}
.confirm-dialog.warning .dialog-icon {
  color: var(--hs-warning);
}
.confirm-dialog.info .dialog-icon {
  color: var(--hs-accent);
}

.dialog-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--hs-text);
  margin: 0;
}

.dialog-message {
  font-size: 0.9rem;
  color: var(--hs-subtext);
  margin: 0 0 24px;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: var(--hs-radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--motion-fast) var(--ease-out);
  font-family: inherit;
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--hs-surface-1);
  color: var(--hs-subtext);
}

.btn-cancel:hover {
  background: var(--hs-surface-0);
  color: var(--hs-text);
}

.btn-confirm {
  border: none;
}

.btn-confirm.danger {
  background: var(--hs-danger);
  color: var(--hs-bg-base);
}

.btn-confirm.danger:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
}

.btn-confirm.warning {
  background: var(--hs-warning);
  color: var(--hs-bg-base);
}

.btn-confirm.warning:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
}

.btn-confirm.info {
  background: var(--hs-accent);
  color: var(--hs-bg-base);
}

.btn-confirm.info:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
}

/* Transition */
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

.confirm-fade-enter-active .confirm-dialog {
  animation: dialog-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-fade-leave-active .confirm-dialog {
  animation: dialog-out 0.15s ease-out forwards;
}

@keyframes dialog-pop {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes dialog-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>
