<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <button class="close-btn" @click="handleClose" aria-label="Close">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <div class="content-scroll-area">
            <!-- Handle different content types -->
            <component v-if="isComponent(content)" :is="content" />
            <div
              v-else-if="displayText"
              class="text-content"
            >{{ displayText }}</div>
            <pre v-else class="json-content">{{
              JSON.stringify(content, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from "vue";

const props = defineProps<{
  isOpen: boolean;
  content: any;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const handleClose = () => {
  emit("close");
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.isOpen) {
    handleClose();
  }
};

const isComponent = (val: any) => {
  return (
    typeof val === "object" &&
    val !== null &&
    ("render" in val || "setup" in val || "__name" in val)
  );
};

// 检查是否是带有 type: "text" 的文本内容对象
const isTextContent = (val: any) => {
  return (
    typeof val === "object" &&
    val !== null &&
    val.type === "text" &&
    typeof val.text === "string"
  );
};

// 获取要显示的文本内容
const displayText = computed(() => {
  if (isTextContent(props.content)) {
    return props.content.text;
  }
  if (typeof props.content === "string") {
    return props.content;
  }
  return null;
});

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
/* Design System Variables */
:root {
  --modal-bg: #1e1e1e;
  --modal-border: rgba(255, 255, 255, 0.1);
  --modal-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75);
  --text-primary: #e5e5e5;
  --text-secondary: #a3a3a3;
  --accent-color: #ffffff;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background-color: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 80vw;
  max-height: 50vh;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: center;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: #a3a3a3;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transform: rotate(90deg);
}

.content-scroll-area {
  padding: 40px;
  overflow-y: auto;
  height: 100%;
  color: #e5e5e5;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 14px;
  line-height: 1.6;
}

/* Scrollbar Styling */
.content-scroll-area::-webkit-scrollbar {
  width: 8px;
}

.content-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll-area::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.content-scroll-area::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.json-content {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 200ms ease-out;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: modal-slide-up 200ms ease-out;
}

.modal-fade-leave-active .modal-container {
  animation: modal-slide-up 200ms ease-out reverse;
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
