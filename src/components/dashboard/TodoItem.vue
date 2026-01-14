<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import MoreMenu from "./MoreMenu.vue";

const props = defineProps<{
  todo: HomeShell.Todo;
  isSelected?: boolean;
  isEditing?: boolean;
  index: number;
}>();

const emit = defineEmits<{
  (e: "click", todo: HomeShell.Todo): void;
  (e: "toggleStatus", todoId: string): void;
  (e: "togglePriority", todoId: string): void;
  (e: "startEdit", todoId: string): void;
  (e: "commitEdit", todoId: string, content: string): void;
  (e: "cancelEdit"): void;
  (e: "delete", todoId: string): void;
  (e: "addNote", todoId: string): void;
  (e: "moveToTop", todoId: string): void;
  (e: "moveToBottom", todoId: string): void;
  (e: "dragStart", todoId: string, event: DragEvent): void;
}>();

// 状态计算
const isTodo = computed(() => props.todo.status === "TODO");
const isDoing = computed(() => props.todo.status === "DOING");
const isDone = computed(() => props.todo.status === "DONE");
const isImportant = computed(() => props.todo.priority === "important");
const isEditable = computed(() => !isDone.value);

// 动画状态
const statusAnimating = ref(false);
const wasJustSelected = ref(false);

// 更多菜单状态
const showMoreMenu = ref(false);
const menuPosition = ref({ x: 0, y: 0 });

// 编辑状态
const editInputRef = ref<HTMLInputElement | null>(null);
const editValue = ref("");

// 监听状态变化动画
watch(
  () => props.todo.status,
  (newStatus, oldStatus) => {
    if (oldStatus && newStatus !== oldStatus) {
      statusAnimating.value = true;
      setTimeout(() => {
        statusAnimating.value = false;
      }, 300);
    }
  }
);

// 监听选中状态动画
watch(
  () => props.isSelected,
  (selected, wasSelected) => {
    if (selected && !wasSelected) {
      wasJustSelected.value = true;
      setTimeout(() => {
        wasJustSelected.value = false;
      }, 400);
    }
  }
);

// 监听编辑状态
watch(
  () => props.isEditing,
  (editing) => {
    if (editing) {
      editValue.value = props.todo.content;
      nextTick(() => {
        editInputRef.value?.focus();
        editInputRef.value?.select();
      });
    }
  }
);

// 状态按钮提示
const statusTooltip = computed(() => {
  if (isDone.value) return "重置为待办";
  if (isDoing.value) return "标记为完成";
  return "开始执行";
});

// 更多菜单项
const menuItems = computed(() => {
  const items = [];

  if (isEditable.value) {
    items.push({ id: "edit", label: "编辑" });
    items.push({ id: "add-note", label: "添加便签" });
    items.push({ id: "divider-1", label: "", divider: true });
  }

  items.push({ id: "move-top", label: "移到顶部" });
  items.push({ id: "move-bottom", label: "移到底部" });
  items.push({ id: "divider-2", label: "", divider: true });
  items.push({ id: "delete", label: "删除", danger: true });

  return items;
});

// 事件处理
function handleRowClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  // 排除特定元素的点击
  if (
    target.closest(".status-button") ||
    target.closest(".priority-button") ||
    target.closest(".more-button") ||
    target.closest(".content-text") ||
    target.closest(".edit-input")
  ) {
    return;
  }
  emit("click", props.todo);
}

function handleStatusClick(e: MouseEvent) {
  e.stopPropagation();
  emit("toggleStatus", props.todo.id);
}

function handlePriorityClick(e: MouseEvent) {
  e.stopPropagation();
  if (isDone.value) return;
  emit("togglePriority", props.todo.id);
}

function handleContentClick(e: MouseEvent) {
  e.stopPropagation();
  if (isDone.value) return;
  // 点击文字直接进入编辑
  emit("startEdit", props.todo.id);
}

function handleMoreClick(e: MouseEvent) {
  e.stopPropagation();
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  menuPosition.value = { x: rect.right - 160, y: rect.bottom + 8 };
  showMoreMenu.value = true;
}

function handleMenuSelect(id: string) {
  switch (id) {
    case "edit":
      emit("startEdit", props.todo.id);
      break;
    case "add-note":
      emit("addNote", props.todo.id);
      break;
    case "move-top":
      emit("moveToTop", props.todo.id);
      break;
    case "move-bottom":
      emit("moveToBottom", props.todo.id);
      break;
    case "delete":
      emit("delete", props.todo.id);
      break;
  }
}

function handleEditKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    commitEdit();
  } else if (e.key === "Escape") {
    e.preventDefault();
    emit("cancelEdit");
  }
}

function handleEditBlur() {
  commitEdit();
}

function commitEdit() {
  const trimmed = editValue.value.trim();
  if (trimmed && trimmed !== props.todo.content) {
    emit("commitEdit", props.todo.id, trimmed);
  } else {
    emit("cancelEdit");
  }
}

function handleDragStart(e: DragEvent) {
  if (isDone.value) {
    e.preventDefault();
    return;
  }
  emit("dragStart", props.todo.id, e);
}
</script>

<template>
  <div
    class="todo-item"
    :class="{
      'is-selected': isSelected,
      'is-doing': isDoing,
      'is-done': isDone,
      'is-editing': isEditing,
      'just-selected': wasJustSelected,
    }"
    :draggable="isEditable && !isEditing"
    @click="handleRowClick"
    @dragstart="handleDragStart"
    role="button"
    tabindex="0"
  >
    <!-- 索引号 -->
    <div class="index-number">{{ index + 1 }}</div>

    <!-- 状态按钮 - 始终可见 -->
    <button
      class="status-button"
      :class="{
        'is-doing': isDoing,
        'is-done': isDone,
        'animate-status': statusAnimating,
      }"
      @click="handleStatusClick"
      :title="statusTooltip"
    >
      <svg
        v-if="isDone"
        class="checkmark-svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path class="check-path" d="M5 12l5 5L19 7" />
      </svg>
      <span v-else-if="isDoing" class="doing-dot"></span>
    </button>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 编辑模式 -->
      <input
        v-if="isEditing"
        ref="editInputRef"
        v-model="editValue"
        class="edit-input"
        type="text"
        @keydown="handleEditKeydown"
        @blur="handleEditBlur"
        @click.stop
      />
      <!-- 显示模式 - 点击可编辑 -->
      <span
        v-else
        class="content-text"
        :class="{ 'is-done': isDone, 'is-editable': isEditable }"
        @click="handleContentClick"
      >
        {{ todo.content }}
      </span>
    </div>

    <!-- 标签 -->
    <div v-if="todo.tags && todo.tags.length" class="tags">
      <span v-for="tag in todo.tags" :key="tag" class="tag-pill">
        {{ tag }}
      </span>
    </div>

    <!-- 便签数量徽章 -->
    <div v-if="todo.notes && todo.notes.length" class="notes-badge">
      {{ todo.notes.length }}
    </div>

    <!-- 优先级按钮 - 始终可见 -->
    <button
      v-if="isEditable"
      class="priority-button"
      :class="{ 'is-important': isImportant }"
      @click="handlePriorityClick"
      :title="isImportant ? '取消重要标记' : '标记为重要'"
    >
      !
    </button>
    <span v-else-if="isDone && isImportant" class="priority-badge-readonly">!</span>

    <!-- 更多按钮 - 始终可见 -->
    <button class="more-button" @click="handleMoreClick" title="更多操作">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
      </svg>
    </button>

    <!-- 更多菜单 -->
    <MoreMenu
      :is-open="showMoreMenu"
      :position="menuPosition"
      :items="menuItems"
      @close="showMoreMenu = false"
      @select="handleMenuSelect"
    />
  </div>
</template>

<style scoped>
.todo-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  padding-left: 40px;
  gap: 12px;
  background: var(--hs-surface-0);
  border-radius: var(--hs-radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--motion-base) var(--ease-out);
  min-height: 52px;
}

.todo-item:hover {
  background: var(--hs-surface-1);
  transform: translateY(-1px);
  box-shadow: var(--hs-shadow-sm);
}

.todo-item.is-selected {
  background: var(--hs-selected-bg);
  border-color: var(--hs-accent);
  box-shadow: var(--hs-shadow-md);
}

.todo-item.just-selected {
  animation: selection-glow 0.4s var(--ease-out);
}

@keyframes selection-glow {
  0% {
    box-shadow: 0 0 0 0 rgba(137, 180, 250, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(137, 180, 250, 0);
  }
  100% {
    box-shadow: var(--hs-shadow-md);
  }
}

.todo-item.is-doing {
  background: rgba(249, 226, 175, 0.08);
  border-color: var(--hs-warning);
}

.todo-item.is-done {
  opacity: 0.5;
  background: var(--hs-surface-0);
}

.todo-item.is-done:hover {
  opacity: 0.7;
}

/* Index Number */
.index-number {
  position: absolute;
  left: 12px;
  font-size: 11px;
  color: var(--hs-overlay-0);
  font-family: "JetBrains Mono", monospace;
  opacity: 0.6;
}

/* Status Button - Always Visible */
.status-button {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--hs-overlay-1);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--motion-fast) var(--ease-out);
  padding: 0;
}

.status-button:hover {
  border-color: var(--hs-accent);
  transform: scale(1.1);
}

.status-button.is-doing {
  border-color: var(--hs-warning);
  background: var(--hs-warning);
}

.status-button.is-done {
  border-color: var(--hs-success);
  background: var(--hs-success);
  color: var(--hs-bg-base);
}

.status-button.animate-status {
  animation: status-pulse 0.3s var(--ease-out);
}

@keyframes status-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); }
}

.checkmark-svg {
  width: 14px;
  height: 14px;
}

.check-path {
  stroke-dasharray: 24;
  stroke-dashoffset: 0;
}

.doing-dot {
  width: 8px;
  height: 8px;
  background: var(--hs-bg-base);
  border-radius: 50%;
}

/* Content */
.content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.content-text {
  font-size: 14px;
  color: var(--hs-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--motion-fast) var(--ease-out);
}

.content-text.is-editable {
  cursor: text;
}

.content-text.is-editable:hover {
  color: var(--hs-accent);
}

.content-text.is-done {
  text-decoration: line-through;
  color: var(--hs-muted);
  cursor: default;
}

.edit-input {
  flex: 1;
  background: var(--hs-bg-base);
  border: 1px solid var(--hs-accent);
  border-radius: var(--hs-radius-sm);
  padding: 6px 10px;
  font-size: 14px;
  color: var(--hs-text);
  outline: none;
  font-family: inherit;
}

/* Tags */
.tags {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.tag-pill {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--hs-surface-1);
  color: var(--hs-subtext);
  white-space: nowrap;
}

/* Notes Badge */
.notes-badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--hs-accent);
  color: var(--hs-bg-base);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Priority Button - Always Visible */
.priority-button {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--hs-overlay-0);
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  border-radius: 4px;
  transition: all var(--motion-fast) var(--ease-out);
  flex-shrink: 0;
  opacity: 0.4;
}

.priority-button:hover {
  opacity: 1;
  color: var(--hs-danger);
  background: rgba(243, 139, 168, 0.1);
}

.priority-button.is-important {
  color: var(--hs-danger);
  opacity: 1;
  text-shadow: 0 0 8px rgba(243, 139, 168, 0.5);
}

.priority-badge-readonly {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hs-muted);
  font-size: 16px;
  font-weight: 900;
  flex-shrink: 0;
  opacity: 0.5;
}

/* More Button - Always Visible */
.more-button {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--hs-overlay-0);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--motion-fast) var(--ease-out);
  padding: 4px;
  opacity: 0.5;
}

.more-button:hover {
  opacity: 1;
  background: var(--hs-surface-1);
  color: var(--hs-text);
}

.more-button svg {
  width: 16px;
  height: 16px;
}

/* Focus state */
.todo-item:focus-visible {
  outline: 2px solid var(--hs-focus-ring);
  outline-offset: 2px;
}

/* Drag state */
.todo-item[draggable="true"] {
  cursor: grab;
}

.todo-item[draggable="true"]:active {
  cursor: grabbing;
}
</style>
