<script setup lang="ts">
import { computed } from "vue";
import EditableText from "./EditableText.vue";

const props = defineProps<{
  note: HomeShell.Note;
  isSelected?: boolean;
  isEditing?: boolean;
  isReadonly?: boolean;
  index: number;
}>();

const emit = defineEmits<{
  (e: "click"): void;
  (e: "startEdit"): void;
  (e: "commitEdit", content: string): void;
  (e: "cancelEdit"): void;
  (e: "delete"): void;
  (e: "dragStart", event: DragEvent): void;
}>();

const isEditable = computed(() => !props.isReadonly);

const formattedDate = computed(() => {
  const date = new Date(props.note.updatedAt);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
});

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (
    target.closest(".delete-btn") ||
    target.closest(".drag-handle") ||
    target.closest(".edit-input")
  ) {
    return;
  }
  emit("click");
}

function handleDelete(e: MouseEvent) {
  e.stopPropagation();
  emit("delete");
}

function handleDragStart(e: DragEvent) {
  if (props.isReadonly) {
    e.preventDefault();
    return;
  }
  emit("dragStart", e);
}

function handleStartEdit() {
  if (props.isReadonly) return;
  emit("startEdit");
}
</script>

<template>
  <div
    class="note-item"
    :class="{ 'is-selected': isSelected, 'is-editing': isEditing }"
    @click="handleClick"
  >
    <!-- Drag Handle (only for editable) -->
    <div
      v-if="isEditable"
      class="drag-handle"
      draggable="true"
      @dragstart="handleDragStart"
      title="拖动排序"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="8" r="1.5" />
        <circle cx="15" cy="8" r="1.5" />
        <circle cx="9" cy="16" r="1.5" />
        <circle cx="15" cy="16" r="1.5" />
      </svg>
    </div>
    <div v-else class="drag-handle-placeholder"></div>

    <!-- Index -->
    <div class="note-index">//{{ index + 1 }}</div>

    <!-- Content -->
    <div class="note-content">
      <EditableText
        v-if="isEditable"
        :model-value="note.content"
        :is-editing="isEditing || false"
        :multiline="true"
        placeholder="输入便签内容..."
        @start-edit="handleStartEdit"
        @commit="emit('commitEdit', $event)"
        @cancel="emit('cancelEdit')"
      >
        <span class="content-text">{{ note.content }}</span>
      </EditableText>
      <span v-else class="content-text readonly">{{ note.content }}</span>
    </div>

    <!-- Meta -->
    <div class="note-meta">{{ formattedDate }}</div>

    <!-- Delete Button (only for editable) -->
    <button
      v-if="isEditable"
      class="delete-btn"
      @click="handleDelete"
      title="删除便签"
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
  </div>
</template>

<style scoped>
.note-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: var(--hs-bg-mantle);
  border-radius: var(--hs-radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--motion-base) var(--ease-out);
}

.note-item:hover {
  background: var(--hs-surface-0);
  border-color: var(--hs-surface-1);
}

.note-item.is-selected {
  background: rgba(137, 180, 250, 0.08);
  border-color: var(--hs-accent);
}

/* Drag Handle */
.drag-handle {
  width: 14px;
  height: 20px;
  cursor: grab;
  color: var(--hs-overlay-0);
  opacity: 0;
  transition: opacity var(--motion-fast) var(--ease-out);
  flex-shrink: 0;
  margin-top: 2px;
}

.drag-handle-placeholder {
  width: 14px;
  flex-shrink: 0;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle svg {
  width: 100%;
  height: 100%;
}

.note-item:hover .drag-handle,
.note-item.is-selected .drag-handle {
  opacity: 1;
}

/* Index */
.note-index {
  font-size: 11px;
  font-family: monospace;
  color: var(--hs-overlay-0);
  flex-shrink: 0;
  min-width: 24px;
  opacity: 0;
  transition: opacity var(--motion-fast) var(--ease-out);
}

.note-item:hover .note-index,
.note-item.is-selected .note-index {
  opacity: 1;
}

/* Content */
.note-content {
  flex: 1;
  min-width: 0;
}

.content-text {
  font-size: 13px;
  color: var(--hs-text);
  line-height: 1.5;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.content-text.readonly {
  color: var(--hs-subtext);
}

/* Meta */
.note-meta {
  font-size: 11px;
  color: var(--hs-overlay-0);
  flex-shrink: 0;
  white-space: nowrap;
}

/* Delete Button */
.delete-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--hs-overlay-0);
  cursor: pointer;
  border-radius: 4px;
  padding: 2px;
  opacity: 0;
  transition: all var(--motion-fast) var(--ease-out);
  flex-shrink: 0;
}

.note-item:hover .delete-btn,
.note-item.is-selected .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--hs-danger);
  background: rgba(243, 139, 168, 0.1);
}

.delete-btn svg {
  width: 100%;
  height: 100%;
}

/* Focus state */
.note-item:focus-visible {
  outline: 2px solid var(--hs-focus-ring);
  outline-offset: 2px;
}
</style>
