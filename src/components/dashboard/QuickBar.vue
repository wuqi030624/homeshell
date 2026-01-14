<script setup lang="ts">
import { computed } from "vue";
import { useFocusStore } from "@/stores/focusStore";
import { useCommandStore } from "@/stores/commandStore";
import { useAppStore } from "@/stores/appStore";

const focusStore = useFocusStore();
const commandStore = useCommandStore();
const appStore = useAppStore();

const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");
const mod = isMac ? "⌘" : "Ctrl";

// 当前焦点的面包屑
const breadcrumb = computed(() => {
  const focus = focusStore.focus;

  if (focus.type === "none") {
    return null;
  }

  if (focus.type === "todo") {
    const todo = focusStore.focusedTodo;
    if (todo) {
      const content =
        todo.content.length > 25 ? todo.content.substring(0, 25) + "..." : todo.content;
      return `#${focusStore.focusedTodoIndex + 1} ${content}`;
    }
  }

  if (focus.type === "note") {
    const todo = focusStore.focusedTodo;
    const note = focusStore.focusedNote;
    if (todo && note) {
      return `#${focusStore.focusedTodoIndex + 1} / 便签 #${focusStore.focusedNoteIndex + 1}`;
    }
  }

  if (focus.type === "input") {
    return "编辑中...";
  }

  return null;
});

// 根据焦点类型显示的操作按钮
const actions = computed(() => {
  const focus = focusStore.focus;

  if (focus.type === "input") {
    return [
      { id: "save", label: "保存", shortcut: "Enter", primary: true },
      { id: "cancel", label: "取消", shortcut: "Esc" },
    ];
  }

  if (focus.type === "note") {
    const todo = focusStore.focusedTodo;
    const canEdit = todo && todo.status !== "DONE";

    return [
      ...(canEdit ? [{ id: "edit", label: "编辑", shortcut: "E" }] : []),
      { id: "delete", label: "删除", shortcut: "Del", danger: true },
      { id: "back", label: "返回", shortcut: "H" },
    ];
  }

  if (focus.type === "todo") {
    const todo = focusStore.focusedTodo;
    if (!todo) return [];

    const canEdit = todo.status !== "DONE";
    const result = [];

    if (todo.status === "TODO") {
      result.push({ id: "start", label: "开始", shortcut: "S" });
    }
    if (todo.status === "DOING") {
      result.push({ id: "done", label: "完成", shortcut: "D", primary: true });
    }
    if (todo.status === "DONE") {
      result.push({ id: "reset", label: "重置", shortcut: "R" });
    }

    if (canEdit) {
      result.push({ id: "edit", label: "编辑", shortcut: "E" });
      result.push({ id: "note", label: "便签", shortcut: "N" });
    }

    result.push({ id: "delete", label: "删除", shortcut: "Del", danger: true });

    return result;
  }

  // 无焦点时
  return [];
});

// 处理操作按钮点击
function handleAction(id: string) {
  commandStore.executeById(`todo:${id}`) ||
    commandStore.executeById(`note:${id}`) ||
    commandStore.executeById(`global:${id}`);
}

// 打开命令面板
function openCommandPalette() {
  commandStore.open();
}
</script>

<template>
  <div class="quick-bar" :class="{ 'has-focus': focusStore.hasFocus }">
    <div class="bar-content">
      <!-- 焦点面包屑 -->
      <div v-if="breadcrumb" class="breadcrumb">
        <span class="breadcrumb-text">{{ breadcrumb }}</span>
      </div>

      <!-- 操作按钮 -->
      <div v-if="actions.length > 0" class="actions">
        <button
          v-for="action in actions"
          :key="action.id"
          class="action-btn"
          :class="{
            'is-primary': action.primary,
            'is-danger': action.danger,
          }"
          @click="handleAction(action.id)"
        >
          <span class="action-label">{{ action.label }}</span>
          <kbd class="action-shortcut">{{ action.shortcut }}</kbd>
        </button>
      </div>

      <!-- 分隔符 -->
      <div class="spacer"></div>

      <!-- 全局快捷键提示 -->
      <div class="hints">
        <span class="hint" v-if="!focusStore.hasFocus">
          <kbd>Tab</kbd>
          <span>搜索</span>
        </span>
        <button class="hint command-hint" @click="openCommandPalette">
          <kbd>{{ mod }}K</kbd>
          <span>命令</span>
        </button>
        <span class="hint">
          <kbd>?</kbd>
          <span>帮助</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quick-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: var(--hs-bg-crust);
  border-top: 1px solid var(--hs-surface-0);
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 16px;
  transition: transform var(--motion-base) var(--ease-out);
}

.bar-content {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: var(--hs-surface-0);
  border-radius: var(--hs-radius-sm);
}

.breadcrumb-text {
  font-size: 0.85rem;
  color: var(--hs-subtext);
  font-family: "JetBrains Mono", monospace;
}

/* Actions */
.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--hs-surface-0);
  border: 1px solid var(--hs-surface-1);
  border-radius: var(--hs-radius-sm);
  cursor: pointer;
  transition: all var(--motion-fast) var(--ease-out);
  color: var(--hs-text);
  font-size: 0.85rem;
}

.action-btn:hover {
  background: var(--hs-surface-1);
  border-color: var(--hs-surface-2);
}

.action-btn.is-primary {
  background: var(--hs-accent);
  border-color: var(--hs-accent);
  color: var(--hs-bg-base);
}

.action-btn.is-primary:hover {
  filter: brightness(1.1);
}

.action-btn.is-danger {
  color: var(--hs-danger);
}

.action-btn.is-danger:hover {
  background: rgba(243, 139, 168, 0.1);
  border-color: var(--hs-danger);
}

.action-label {
  font-weight: 500;
}

.action-shortcut {
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  font-size: 11px;
  font-family: "JetBrains Mono", monospace;
}

.action-btn.is-primary .action-shortcut {
  background: rgba(0, 0, 0, 0.3);
}

/* Spacer */
.spacer {
  flex: 1;
}

/* Hints */
.hints {
  display: flex;
  gap: 12px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--hs-overlay-0);
  background: none;
  border: none;
  cursor: default;
  padding: 0;
}

.hint.command-hint {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--hs-radius-sm);
  transition: background var(--motion-fast) var(--ease-out);
}

.hint.command-hint:hover {
  background: var(--hs-surface-0);
  color: var(--hs-subtext);
}

.hint kbd {
  padding: 3px 6px;
  background: var(--hs-surface-0);
  border-radius: 4px;
  font-size: 11px;
  font-family: "JetBrains Mono", monospace;
  color: var(--hs-subtext);
}

/* Responsive */
@media (max-width: 640px) {
  .hints {
    display: none;
  }

  .breadcrumb-text {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
