<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from "vue";

const props = defineProps<{
  isOpen: boolean;
  position?: { x: number; y: number };
  items: Array<{
    id: string;
    label: string;
    icon?: string;
    danger?: boolean;
    divider?: boolean;
  }>;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select", id: string): void;
}>();

const menuRef = ref<HTMLDivElement | null>(null);
const menuStyle = ref<{ top?: string; left?: string; right?: string }>({});

// 计算菜单位置，确保不超出视口
function calculatePosition() {
  if (!props.position || !menuRef.value) return;

  const menu = menuRef.value;
  const rect = menu.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = props.position.y;
  let left = props.position.x;

  // 检查右边界
  if (left + rect.width > viewportWidth - 16) {
    left = viewportWidth - rect.width - 16;
  }

  // 检查下边界
  if (top + rect.height > viewportHeight - 16) {
    top = viewportHeight - rect.height - 16;
  }

  menuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
}

// 点击外部关闭（使用 pointerdown 避免和触发点击冲突）
function handleClickOutside(e: PointerEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit("close");
  }
}

// ESC 关闭
function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    emit("close");
  }
}

function handleItemClick(id: string) {
  emit("select", id);
  emit("close");
}

// 监听 isOpen 变化，只在打开时添加监听器
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      // 在下一帧添加监听器，避免和触发点击事件冲突
      nextTick(() => {
        calculatePosition();
        // 使用 setTimeout 确保在当前点击事件处理完毕后才添加监听器
        setTimeout(() => {
          document.addEventListener("pointerdown", handleClickOutside);
          document.addEventListener("keydown", handleKeydown);
        }, 0);
      });
    } else {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleKeydown);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  document.removeEventListener("pointerdown", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="menu-fade">
      <div v-if="isOpen" ref="menuRef" class="more-menu" :style="menuStyle">
        <template v-for="item in items" :key="item.id">
          <div v-if="item.divider" class="menu-divider" />
          <button
            v-else
            class="menu-item"
            :class="{ 'is-danger': item.danger }"
            @click.stop="handleItemClick(item.id)"
          >
            <span class="item-label">{{ item.label }}</span>
          </button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.more-menu {
  position: fixed;
  min-width: 160px;
  background: var(--hs-bg-mantle);
  border: 1px solid var(--hs-surface-1);
  border-radius: var(--hs-radius-md);
  box-shadow: var(--hs-shadow-lg);
  padding: 6px;
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: var(--hs-radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--hs-text);
  text-align: left;
  transition: background var(--motion-fast) var(--ease-out);
}

.menu-item:hover {
  background: var(--hs-surface-0);
}

.menu-item.is-danger {
  color: var(--hs-danger);
}

.menu-item.is-danger:hover {
  background: rgba(243, 139, 168, 0.1);
}

.item-label {
  flex: 1;
}

.menu-divider {
  height: 1px;
  background: var(--hs-surface-0);
  margin: 6px 0;
}

/* Animation */
.menu-fade-enter-active {
  transition: opacity 0.15s ease, transform 0.15s var(--ease-out);
}

.menu-fade-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>
