<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useCommandStore } from "@/stores/commandStore";
import { useFocusStore } from "@/stores/focusStore";

const commandStore = useCommandStore();
const focusStore = useFocusStore();

const inputRef = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLDivElement | null>(null);

// 计算当前焦点的描述文字
const focusDescription = computed(() => {
  const focus = focusStore.focus;
  if (focus.type === "todo") {
    const todo = focusStore.focusedTodo;
    if (todo) {
      const content =
        todo.content.length > 30 ? todo.content.substring(0, 30) + "..." : todo.content;
      return `当前任务: "${content}"`;
    }
  }
  if (focus.type === "note") {
    const note = focusStore.focusedNote;
    if (note) {
      const content =
        note.content.length > 30 ? note.content.substring(0, 30) + "..." : note.content;
      return `当前便签: "${content}"`;
    }
  }
  return null;
});

// 处理键盘事件
function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    e.preventDefault();
    commandStore.close();
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    commandStore.selectNext();
    scrollToSelected();
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    commandStore.selectPrev();
    scrollToSelected();
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    commandStore.executeSelected();
    return;
  }

  // 检查单字母快捷键（当搜索框为空时）
  if (commandStore.searchQuery === "" && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
    const executed = commandStore.executeByShortcut(e.key);
    if (executed) {
      e.preventDefault();
      return;
    }
  }
}

// 滚动到选中项
function scrollToSelected() {
  nextTick(() => {
    if (listRef.value) {
      const selected = listRef.value.querySelector(".command-item.is-selected");
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }
  });
}

// 处理输入
function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  commandStore.setSearchQuery(value);
}

// 处理点击命令
function handleCommandClick(command: HomeShell.Command) {
  commandStore.execute(command);
}

// 处理背景点击
function handleBackdropClick() {
  commandStore.close();
}

// 打开时聚焦输入框
watch(
  () => commandStore.isOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        inputRef.value?.focus();
      });
    }
  }
);

// 全局 Ctrl+K 快捷键已在 useKeyboard.ts 中统一处理

// 获取快捷键显示文本
function formatShortcut(shortcut: string | undefined): string {
  if (!shortcut) return "";
  return shortcut
    .replace("Ctrl+", "^")
    .replace("Shift+", "Shift+")
    .replace("Delete", "Del");
}
</script>

<template>
  <Teleport to="body">
    <Transition name="palette">
      <div v-if="commandStore.isOpen" class="command-palette-overlay" @click="handleBackdropClick">
        <div class="command-palette" @click.stop @keydown="handleKeydown">
          <!-- 搜索框 -->
          <div class="palette-header">
            <div class="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              ref="inputRef"
              type="text"
              class="search-input"
              :value="commandStore.searchQuery"
              @input="handleInput"
              placeholder="搜索命令..."
            />
            <kbd class="escape-hint">ESC</kbd>
          </div>

          <!-- 焦点描述 -->
          <div v-if="focusDescription" class="focus-description">
            {{ focusDescription }}
          </div>

          <!-- 命令列表 -->
          <div ref="listRef" class="command-list">
            <div
              v-for="(command, index) in commandStore.filteredCommands"
              :key="command.id"
              class="command-item"
              :class="{ 'is-selected': index === commandStore.selectedIndex }"
              @click="handleCommandClick(command)"
              @mouseenter="commandStore.selectedIndex = index"
            >
              <div class="command-info">
                <span class="command-name">{{ command.name }}</span>
                <span class="command-desc">{{ command.description }}</span>
              </div>
              <kbd v-if="command.shortcut" class="command-shortcut">
                {{ formatShortcut(command.shortcut) }}
              </kbd>
            </div>

            <!-- 空状态 -->
            <div v-if="commandStore.filteredCommands.length === 0" class="empty-state">
              <span>没有找到匹配的命令</span>
            </div>
          </div>

          <!-- 底部提示 -->
          <div class="palette-footer">
            <span class="hint">
              <kbd>↑↓</kbd> 选择
            </span>
            <span class="hint">
              <kbd>Enter</kbd> 执行
            </span>
            <span class="hint">
              <kbd>ESC</kbd> 关闭
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.command-palette-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 9999;
}

.command-palette {
  width: 100%;
  max-width: 560px;
  background: var(--hs-bg-mantle);
  border: 1px solid var(--hs-surface-1);
  border-radius: var(--hs-radius-lg);
  box-shadow: var(--hs-shadow-xl);
  overflow: hidden;
}

/* Header */
.palette-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--hs-surface-0);
  gap: 12px;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--hs-muted);
  flex-shrink: 0;
}

.search-icon svg {
  width: 100%;
  height: 100%;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  color: var(--hs-text);
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--hs-muted);
}

.escape-hint {
  padding: 4px 8px;
  background: var(--hs-surface-0);
  border: 1px solid var(--hs-surface-1);
  border-radius: 4px;
  font-size: 11px;
  color: var(--hs-muted);
  font-family: inherit;
}

/* Focus Description */
.focus-description {
  padding: 8px 16px;
  background: var(--hs-surface-0);
  border-bottom: 1px solid var(--hs-surface-0);
  font-size: 0.85rem;
  color: var(--hs-subtext);
}

/* Command List */
.command-list {
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
}

.command-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: var(--hs-radius-sm);
  cursor: pointer;
  transition: background var(--motion-fast) var(--ease-out);
}

.command-item:hover,
.command-item.is-selected {
  background: var(--hs-surface-0);
}

.command-item.is-selected {
  background: var(--hs-selected-bg);
}

.command-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.command-name {
  font-size: 0.95rem;
  color: var(--hs-text);
  font-weight: 500;
}

.command-desc {
  font-size: 0.8rem;
  color: var(--hs-muted);
}

.command-shortcut {
  padding: 4px 8px;
  background: var(--hs-surface-1);
  border-radius: 4px;
  font-size: 12px;
  color: var(--hs-subtext);
  font-family: "JetBrains Mono", monospace;
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  padding: 24px;
  text-align: center;
  color: var(--hs-muted);
  font-size: 0.9rem;
}

/* Footer */
.palette-footer {
  display: flex;
  gap: 16px;
  padding: 10px 16px;
  border-top: 1px solid var(--hs-surface-0);
  background: var(--hs-bg-crust);
}

.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--hs-overlay-0);
}

.hint kbd {
  padding: 2px 6px;
  background: var(--hs-surface-0);
  border-radius: 3px;
  font-size: 11px;
}

/* Animations */
.palette-enter-active {
  transition: opacity 0.2s ease, transform 0.2s var(--ease-out);
}

.palette-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.palette-enter-from {
  opacity: 0;
}

.palette-enter-from .command-palette {
  transform: translateY(-20px) scale(0.95);
}

.palette-leave-to {
  opacity: 0;
}

.palette-leave-to .command-palette {
  transform: translateY(-10px) scale(0.98);
}

/* Scrollbar */
.command-list::-webkit-scrollbar {
  width: 6px;
}

.command-list::-webkit-scrollbar-track {
  background: transparent;
}

.command-list::-webkit-scrollbar-thumb {
  background: var(--hs-surface-1);
  border-radius: 3px;
}
</style>
