<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import NoteItem from "./NoteItem.vue";

const props = defineProps<{
  todoId: string;
  notes: HomeShell.Note[];
  selectedNoteId?: string | null;
  editingNoteId?: string | null;
  isReadonly?: boolean;
}>();

const emit = defineEmits<{
  (e: "selectNote", noteId: string): void;
  (e: "startEditNote", noteId: string): void;
  (e: "commitEditNote", noteId: string, content: string): void;
  (e: "cancelEditNote"): void;
  (e: "deleteNote", noteId: string): void;
  (e: "reorderNotes", fromIndex: number, toIndex: number): void;
}>();

const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
const ghostElement = ref<HTMLElement | null>(null);

function cleanupGhost() {
  if (ghostElement.value && ghostElement.value.parentNode) {
    ghostElement.value.parentNode.removeChild(ghostElement.value);
  }
  ghostElement.value = null;
}

function handleDragStart(index: number, e: DragEvent) {
  draggedIndex.value = index;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());

    // Create custom drag ghost for note
    const target = (e.target as HTMLElement).closest(".note-wrapper");
    if (target) {
      const ghost = target.cloneNode(true) as HTMLElement;
      ghost.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: ${target.clientWidth}px;
        opacity: 0.85;
        transform: rotate(-1deg);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        pointer-events: none;
        z-index: -1;
      `;
      document.body.appendChild(ghost);
      ghostElement.value = ghost;
      e.dataTransfer.setDragImage(ghost, target.clientWidth / 2, 20);

      // Safely remove ghost after drag image is captured
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          cleanupGhost();
        });
      });
    }
  }
}

function handleDragOver(index: number, e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "move";
  }
  dragOverIndex.value = index;
}

function handleDragLeave() {
  dragOverIndex.value = null;
}

function handleDrop(toIndex: number, e: DragEvent) {
  e.preventDefault();
  if (draggedIndex.value !== null && draggedIndex.value !== toIndex) {
    emit("reorderNotes", draggedIndex.value, toIndex);
  }
  draggedIndex.value = null;
  dragOverIndex.value = null;
}

function handleDragEnd() {
  draggedIndex.value = null;
  dragOverIndex.value = null;
  cleanupGhost();
}

// Cleanup on unmount
onUnmounted(() => {
  cleanupGhost();
});
</script>

<template>
  <div class="note-list" v-if="notes.length > 0">
    <TransitionGroup name="note-list">
      <div
        v-for="(note, index) in notes"
        :key="note.id"
        class="note-wrapper"
        :class="{
          'is-dragging': draggedIndex === index,
          'drag-over': dragOverIndex === index && draggedIndex !== index,
        }"
        @dragover="handleDragOver(index, $event)"
        @dragleave="handleDragLeave"
        @drop="handleDrop(index, $event)"
        @dragend="handleDragEnd"
      >
        <NoteItem
          :note="note"
          :index="index"
          :is-selected="selectedNoteId === note.id"
          :is-editing="editingNoteId === note.id"
          :is-readonly="isReadonly"
          @click="emit('selectNote', note.id)"
          @start-edit="emit('startEditNote', note.id)"
          @commit-edit="emit('commitEditNote', note.id, $event)"
          @cancel-edit="emit('cancelEditNote')"
          @delete="emit('deleteNote', note.id)"
          @drag-start="handleDragStart(index, $event)"
        />
      </div>
    </TransitionGroup>
  </div>
  <div v-else class="empty-notes">
    <span v-if="isReadonly">无便签记录</span>
    <span v-else>选中任务后输入内容添加便签</span>
  </div>
</template>

<style scoped>
.note-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
  background: var(--hs-bg-mantle);
  border-top: 1px solid var(--hs-surface-0);
}

.note-wrapper {
  position: relative;
  transition: all var(--motion-base) var(--ease-out);
}

.note-wrapper.is-dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

.note-wrapper.drag-over {
  transform: translateY(5px);
  transition: transform var(--motion-fast) var(--ease-out);
}

.note-wrapper.drag-over::before {
  content: "";
  position: absolute;
  top: -4px;
  left: 4px;
  right: 4px;
  height: 3px;
  background: var(--hs-accent);
  border-radius: 1.5px;
  box-shadow: 0 0 6px var(--hs-accent);
  animation: pulse-note 0.8s ease-in-out infinite;
}

@keyframes pulse-note {
  0%,
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
  50% {
    opacity: 0.6;
    transform: scaleY(1.3);
  }
}

.empty-notes {
  padding: 16px;
  text-align: center;
  color: var(--hs-overlay-0);
  font-size: 13px;
  background: var(--hs-bg-mantle);
  border-top: 1px solid var(--hs-surface-0);
}

/* Transition animations */
.note-list-move,
.note-list-enter-active,
.note-list-leave-active {
  transition: all var(--motion-base) var(--ease-out);
}

.note-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.note-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.note-list-leave-active {
  position: absolute;
}
</style>
