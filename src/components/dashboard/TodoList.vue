<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import TodoItem from "./TodoItem.vue";
import NoteList from "./NoteList.vue";

const props = defineProps<{
  todos: HomeShell.Todo[];
  selectedTodoId?: string | null;
  selectedNoteId?: string | null;
  editingTodoId?: string | null;
  editingNoteId?: string | null;
}>();

const emit = defineEmits<{
  (e: "selectTodo", todoId: string): void;
  (e: "toggleTodoStatus", todoId: string): void;
  (e: "toggleTodoPriority", todoId: string): void;
  (e: "startEditTodo", todoId: string): void;
  (e: "commitEditTodo", todoId: string, content: string): void;
  (e: "cancelEditTodo"): void;
  (e: "deleteTodo", todoId: string): void;
  (e: "addNote", todoId: string): void;
  (e: "moveToTop", todoId: string): void;
  (e: "moveToBottom", todoId: string): void;
  (e: "reorderTodos", fromIndex: number, toIndex: number): void;
  (e: "selectNote", todoId: string, noteId: string): void;
  (e: "startEditNote", todoId: string, noteId: string): void;
  (e: "commitEditNote", todoId: string, noteId: string, content: string): void;
  (e: "cancelEditNote"): void;
  (e: "deleteNote", todoId: string, noteId: string): void;
  (e: "reorderNotes", todoId: string, fromIndex: number, toIndex: number): void;
}>();

const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
const ghostElement = ref<HTMLElement | null>(null);

function handleTodoClick(todo: HomeShell.Todo) {
  emit("selectTodo", todo.id);
}

function cleanupGhost() {
  if (ghostElement.value && ghostElement.value.parentNode) {
    ghostElement.value.parentNode.removeChild(ghostElement.value);
  }
  ghostElement.value = null;
}

function handleDragStart(todoId: string, index: number, e: DragEvent) {
  draggedIndex.value = index;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", todoId);

    // Create custom drag ghost
    const target = (e.target as HTMLElement).closest(".todo-wrapper");
    if (target) {
      const ghost = target.cloneNode(true) as HTMLElement;
      ghost.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: ${target.clientWidth}px;
        opacity: 0.8;
        transform: rotate(-2deg);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        pointer-events: none;
        z-index: -1;
      `;
      document.body.appendChild(ghost);
      ghostElement.value = ghost;
      e.dataTransfer.setDragImage(ghost, target.clientWidth / 2, 25);

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
    emit("reorderTodos", draggedIndex.value, toIndex);
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

function enter(el: Element) {
  const element = el as HTMLElement;
  element.style.height = "0";
  element.offsetHeight;
  element.style.height = `${element.scrollHeight}px`;
}

function afterEnter(el: Element) {
  const element = el as HTMLElement;
  element.style.height = "auto";
}

function leave(el: Element) {
  const element = el as HTMLElement;
  element.style.height = `${element.scrollHeight}px`;
  element.offsetHeight;
  element.style.height = "0";
}
</script>

<template>
  <div class="todo-list-container">
    <div class="todo-list">
      <TransitionGroup name="todo-list">
        <div
          v-for="(todo, index) in todos"
          :key="todo.id"
          class="todo-wrapper"
          :data-todo-id="todo.id"
          :class="{
            'is-selected': selectedTodoId === todo.id,
            'is-dragging': draggedIndex === index,
            'drag-over': dragOverIndex === index && draggedIndex !== index,
          }"
          @dragover="handleDragOver(index, $event)"
          @dragleave="handleDragLeave"
          @drop="handleDrop(index, $event)"
          @dragend="handleDragEnd"
        >
          <TodoItem
            :todo="todo"
            :index="index"
            :is-selected="selectedTodoId === todo.id"
            :is-editing="editingTodoId === todo.id"
            @click="handleTodoClick"
            @toggle-status="emit('toggleTodoStatus', $event)"
            @toggle-priority="emit('toggleTodoPriority', $event)"
            @start-edit="emit('startEditTodo', $event)"
            @commit-edit="
              (todoId, content) => emit('commitEditTodo', todoId, content)
            "
            @cancel-edit="emit('cancelEditTodo')"
            @delete="emit('deleteTodo', $event)"
            @add-note="emit('addNote', $event)"
            @move-to-top="emit('moveToTop', $event)"
            @move-to-bottom="emit('moveToBottom', $event)"
            @drag-start="
              (todoId, event) => handleDragStart(todoId, index, event)
            "
          />

          <!-- Notes Section -->
          <transition
            name="expand"
            @enter="enter"
            @after-enter="afterEnter"
            @leave="leave"
          >
            <div v-show="selectedTodoId === todo.id" class="notes-section">
              <NoteList
                :todo-id="todo.id"
                :notes="todo.notes"
                :selected-note-id="selectedNoteId"
                :editing-note-id="editingNoteId"
                :is-readonly="todo.status === 'DONE'"
                @select-note="emit('selectNote', todo.id, $event)"
                @start-edit-note="emit('startEditNote', todo.id, $event)"
                @commit-edit-note="
                  (noteId, content) =>
                    emit('commitEditNote', todo.id, noteId, content)
                "
                @cancel-edit-note="emit('cancelEditNote')"
                @delete-note="emit('deleteNote', todo.id, $event)"
                @reorder-notes="
                  (from, to) => emit('reorderNotes', todo.id, from, to)
                "
              />
            </div>
          </transition>
        </div>
      </TransitionGroup>

      <!-- Empty State with Animation -->
      <div v-if="todos.length === 0" class="empty-state">
        <div class="empty-illustration">
          <svg class="empty-svg" viewBox="0 0 200 200">
            <defs>
              <linearGradient
                id="emptyGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style="stop-color: var(--hs-accent); stop-opacity: 0.3"
                />
                <stop
                  offset="100%"
                  style="stop-color: var(--hs-accent-2); stop-opacity: 0.1"
                />
              </linearGradient>
            </defs>

            <!-- Background circle -->
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="url(#emptyGradient)"
              class="bg-circle"
            />

            <!-- Clipboard icon -->
            <g class="clipboard-icon" transform="translate(60, 50)">
              <rect
                x="10"
                y="0"
                width="60"
                height="100"
                rx="8"
                fill="none"
                stroke="var(--hs-muted)"
                stroke-width="3"
              />
              <rect
                x="25"
                y="-8"
                width="30"
                height="16"
                rx="4"
                fill="var(--hs-surface-1)"
                stroke="var(--hs-muted)"
                stroke-width="2"
              />
              <line
                x1="25"
                y1="35"
                x2="55"
                y2="35"
                stroke="var(--hs-overlay-0)"
                stroke-width="2"
                stroke-linecap="round"
                class="line-1"
              />
              <line
                x1="25"
                y1="55"
                x2="50"
                y2="55"
                stroke="var(--hs-overlay-0)"
                stroke-width="2"
                stroke-linecap="round"
                class="line-2"
              />
              <line
                x1="25"
                y1="75"
                x2="45"
                y2="75"
                stroke="var(--hs-overlay-0)"
                stroke-width="2"
                stroke-linecap="round"
                class="line-3"
              />
            </g>

            <!-- Decorative dots -->
            <circle cx="40" cy="60" r="4" fill="var(--hs-accent)" class="dot-1" />
            <circle
              cx="160"
              cy="140"
              r="6"
              fill="var(--hs-accent-2)"
              class="dot-2"
            />
            <circle cx="150" cy="50" r="3" fill="var(--hs-success)" class="dot-3" />
          </svg>
        </div>

        <h3 class="empty-title">开始你的第一个任务</h3>
        <p class="empty-description">在下方输入框中输入任务内容，按 Enter 创建</p>

        <div class="empty-shortcuts">
          <span class="shortcut-item">
            <kbd>/</kbd>
            <span>命令模式</span>
          </span>
          <span class="shortcut-item">
            <kbd>Tab</kbd>
            <span>切换搜索</span>
          </span>
          <span class="shortcut-item">
            <kbd>Ctrl+`</kbd>
            <span>终端</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todo-list-container {
  width: 100%;
  padding: 0 20px;
}

.todo-list {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 28px;
}

.todo-wrapper {
  position: relative;
  border-radius: var(--hs-radius-md);
  overflow: hidden;
  transition: all var(--motion-base) var(--ease-out);
  background: var(--hs-surface-0);
}

.todo-wrapper:hover {
  box-shadow: var(--hs-shadow-sm);
}

.todo-wrapper.is-selected {
  box-shadow: var(--hs-shadow-md);
  z-index: 1;
}

.todo-wrapper.is-dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

.todo-wrapper.drag-over {
  transform: translateY(6px);
  transition: transform var(--motion-fast) var(--ease-out);
}

.todo-wrapper.drag-over::before {
  content: "";
  position: absolute;
  top: -5px;
  left: 8px;
  right: 8px;
  height: 4px;
  background: var(--hs-accent);
  border-radius: 2px;
  box-shadow: 0 0 8px var(--hs-accent);
  animation: pulse 0.8s ease-in-out infinite;
  z-index: 10;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
  50% {
    opacity: 0.7;
    transform: scaleY(1.2);
  }
}

.notes-section {
  overflow: hidden;
  transition: height var(--motion-base) var(--ease-out);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  animation: fadeIn 0.5s var(--ease-out);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-illustration {
  margin-bottom: 24px;
}

.empty-svg {
  width: 160px;
  height: 160px;
}

/* Animated elements */
.bg-circle {
  animation: pulse-slow 4s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.clipboard-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translate(60px, 50px);
  }
  50% {
    transform: translate(60px, 45px);
  }
}

.line-1,
.line-2,
.line-3 {
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: draw-line 1.5s ease-out forwards;
}

.line-2 {
  animation-delay: 0.2s;
}
.line-3 {
  animation-delay: 0.4s;
}

@keyframes draw-line {
  to {
    stroke-dashoffset: 0;
  }
}

.dot-1,
.dot-2,
.dot-3 {
  animation: twinkle 2s ease-in-out infinite;
}

.dot-2 {
  animation-delay: 0.5s;
}
.dot-3 {
  animation-delay: 1s;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--hs-text);
  margin: 0 0 8px;
}

.empty-description {
  font-size: 0.9rem;
  color: var(--hs-muted);
  margin: 0 0 24px;
  max-width: 300px;
}

.empty-shortcuts {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.shortcut-item {
  font-size: 0.8rem;
  color: var(--hs-overlay-0);
  display: flex;
  align-items: center;
  gap: 6px;
}

.shortcut-item kbd {
  padding: 3px 8px;
  background: var(--hs-surface-0);
  border: 1px solid var(--hs-surface-1);
  border-radius: 4px;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.75rem;
  color: var(--hs-subtext);
}

/* Todo List Transitions */
.todo-list-move,
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all var(--motion-base) var(--ease-out);
}

.todo-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.todo-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.todo-list-leave-active {
  position: absolute;
}

/* Expand animation */
.expand-enter-active,
.expand-leave-active {
  transition: height var(--motion-base) var(--ease-out),
    opacity var(--motion-base) var(--ease-out);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  height: 0;
  opacity: 0;
}

/* Swipe gestures (mobile) */
.todo-wrapper.swipe-left {
  animation: swipeLeft 0.2s var(--ease-out) forwards;
}

.todo-wrapper.swipe-right {
  animation: swipeRight 0.2s var(--ease-out) forwards;
}

@keyframes swipeLeft {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes swipeRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Touch feedback */
@media (hover: none) and (pointer: coarse) {
  .todo-wrapper:active {
    transform: scale(0.98);
    transition: transform 0.1s var(--ease-out);
  }
}
</style>
