<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useTodoStore } from "@/stores/todoStore";
import { useAppStore } from "@/stores/appStore";
import { useFocusStore } from "@/stores/focusStore";
import { useCommandStore } from "@/stores/commandStore";
import { useToastStore } from "@/stores/toastStore";
import { useInputParser } from "@/composables/useInputParser";
import { useTodoActions } from "@/composables/useTodoActions";
import { useSearch } from "@/composables/useSearch";
import { registerAllCommands } from "@/commands/registry";
import UnifiedInput from "./UnifiedInput.vue";
import TodoList from "./TodoList.vue";

const todoStore = useTodoStore();
const appStore = useAppStore();
const focusStore = useFocusStore();
const commandStore = useCommandStore();
const toastStore = useToastStore();
const { parseInput } = useInputParser();
const todoActions = useTodoActions();
const { performSearch } = useSearch();

const inputValue = ref("");
const listContainerRef = ref<HTMLElement | null>(null);
const unifiedInputRef = ref<InstanceType<typeof UnifiedInput> | null>(null);

// 初始化命令注册
onMounted(() => {
  registerAllCommands();
});

// 监听焦点输入请求
watch(
  () => appStore.shouldFocusInput,
  (shouldFocus) => {
    if (shouldFocus) {
      nextTick(() => {
        unifiedInputRef.value?.focus();
        appStore.clearFocusRequest();
      });
    }
  }
);

// 监听清除输入请求
watch(
  () => appStore.shouldClearInput,
  (shouldClear) => {
    if (shouldClear) {
      inputValue.value = "";
      appStore.clearInputRequest();
    }
  }
);

// 监听输入值变化，当输入 / 时打开命令面板
watch(inputValue, (newValue) => {
  if (newValue === "/") {
    commandStore.open();
    inputValue.value = "";
  }
});

const visibleTodos = computed(() => todoStore.visibleTodos);

// 使用新的 focusStore 获取选中状态
const selectedTodoId = computed(() => focusStore.focusedTodoId);
const selectedNoteId = computed(() => focusStore.focusedNoteId);

const editingTodoId = computed(() => {
  if (focusStore.focus.type === "input" && focusStore.focus.target === "todo") {
    return focusStore.focus.todoId || null;
  }
  // 兼容旧的 appStore
  if (appStore.editingTarget.type === "todo") {
    return appStore.editingTarget.todoId;
  }
  return null;
});

const editingNoteId = computed(() => {
  if (focusStore.focus.type === "input" && focusStore.focus.target === "note") {
    return focusStore.focus.noteId || null;
  }
  // 兼容旧的 appStore
  if (appStore.editingTarget.type === "note") {
    return appStore.editingTarget.noteId;
  }
  return null;
});

// 输入框占位符
const inputPlaceholder = computed(() => {
  if (focusStore.focus.type === "todo") {
    const todo = focusStore.focusedTodo;
    if (todo && todo.status !== "DONE") {
      const content = todo.content.length > 20 ? todo.content.substring(0, 20) + "..." : todo.content;
      return `为 "${content}" 添加便签...`;
    }
  }
  return undefined;
});

function handleClickOutside(e: MouseEvent) {
  if (appStore.isEditing || focusStore.isEditing) return;

  const target = e.target as HTMLElement;

  if (
    target.closest(".todo-list-container") ||
    target.closest(".unified-input-container") ||
    target.closest(".terminal-drawer-root") ||
    target.closest(".output-popup") ||
    target.closest(".command-palette") ||
    target.closest(".more-menu") ||
    target.closest(".quick-bar")
  ) {
    return;
  }

  if (focusStore.hasFocus) {
    focusStore.clearFocus();
  }
  if (appStore.selection.type !== "none") {
    appStore.clearSelection();
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", handleClickOutside);
});

const handleSubmit = () => {
  const content = inputValue.value.trim();

  // 输入 / 时打开命令面板
  if (content === "/") {
    commandStore.open();
    inputValue.value = "";
    return;
  }

  // 输入框为空时，如果有选中项且不是 DONE 状态，进入编辑模式
  if (!content) {
    if (focusStore.focus.type === "note") {
      const todo = focusStore.focusedTodo;
      if (todo && todo.status !== "DONE") {
        focusStore.startEdit("note", focusStore.focus.todoId, focusStore.focus.noteId);
      }
      return;
    }
    if (focusStore.focus.type === "todo") {
      const todo = focusStore.focusedTodo;
      if (todo && todo.status !== "DONE") {
        focusStore.startEdit("todo", focusStore.focus.todoId);
      }
      return;
    }
    return;
  }

  // 兼容旧的解析逻辑
  const selection = appStore.selection.type !== "none" ? appStore.selection :
    (focusStore.focus.type === "todo" ? { type: "todo" as const, todoId: focusStore.focus.todoId } :
     focusStore.focus.type === "note" ? { type: "note" as const, todoId: focusStore.focus.todoId, noteId: focusStore.focus.noteId } :
     { type: "none" as const });

  const parseResult = parseInput(content, appStore.mode, selection);

  switch (parseResult.type) {
    case "todo": {
      const { content: todoContent, priority, tags } = parseResult.payload;
      todoActions.addTodo(todoContent, priority, tags);
      break;
    }
    case "search": {
      const { query } = parseResult.payload;
      performSearch(query);
      appStore.exitToDefaultMode();
      break;
    }
    case "select": {
      const { index } = parseResult.payload;
      focusStore.jumpToTodo(index - 1);
      break;
    }
    case "note_select": {
      const { index } = parseResult.payload;
      const todo = focusStore.focusedTodo;
      if (todo && todo.notes[index - 1]) {
        focusStore.focusNote(todo.id, todo.notes[index - 1].id);
      }
      break;
    }
    case "text": {
      const { content: noteContent } = parseResult.payload;
      const todoId = focusStore.focusedTodoId;
      const todo = focusStore.focusedTodo;
      if (todoId && todo && todo.status !== "DONE") {
        todoActions.addNote(todoId, noteContent);
      }
      break;
    }
    case "command": {
      const { text } = parseResult.payload;
      handleCommand(text);
      break;
    }
  }

  inputValue.value = "";
};

const handleCommand = (commandText: string) => {
  const parts = commandText.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  const todoId = focusStore.focusedTodoId;

  switch (cmd) {
    case "s":
    case "start":
    case "now":
      if (todoId) {
        todoActions.startTodo(todoId);
      }
      break;
    case "d":
    case "done":
    case "x":
      if (todoId) {
        todoActions.completeTodo(todoId);
      }
      break;
    case "r":
    case "reset":
      if (todoId) {
        todoActions.resetTodo(todoId);
      }
      break;
    case "rm":
    case "delete":
      if (focusStore.focus.type === "note") {
        const noteId = focusStore.focusedNoteId;
        if (todoId && noteId) {
          todoActions.deleteNote(todoId, noteId);
          focusStore.focusTodo(todoId);
        }
      } else if (todoId) {
        todoActions.deleteTodo(todoId);
      }
      break;
    case "p":
    case "!":
    case "priority":
      if (todoId) {
        const todo = todoStore.todos.find((t) => t.id === todoId);
        if (todo && todo.status !== "DONE") {
          todoStore.togglePriority(todoId);
        }
      }
      break;
    case "e":
    case "edit":
      if (focusStore.focus.type === "note") {
        const noteId = focusStore.focusedNoteId;
        if (todoId && noteId) {
          const todo = todoStore.todos.find((t) => t.id === todoId);
          if (todo && todo.status !== "DONE") {
            focusStore.startEdit("note", todoId, noteId);
          }
        }
      } else if (todoId) {
        const todo = todoStore.todos.find((t) => t.id === todoId);
        if (todo && todo.status !== "DONE") {
          focusStore.startEdit("todo", todoId);
        }
      }
      break;
    case "n":
    case "note":
      if (todoId) {
        const todo = todoStore.todos.find((t) => t.id === todoId);
        if (todo && todo.status !== "DONE") {
          const noteContent = args.join(" ");
          if (noteContent) {
            todoStore.addNote(todoId, noteContent);
          } else {
            const noteId = todoStore.addNote(todoId, "");
            if (noteId) {
              focusStore.startEdit("note", todoId, noteId);
            }
          }
        }
      }
      break;
    case "mv":
    case "move":
      if (todoId && args[0]) {
        const toIndex = parseInt(args[0]) - 1;
        if (!isNaN(toIndex) && toIndex >= 0) {
          todoStore.moveTodo(todoId, toIndex);
        }
      }
      break;
    case "clear":
      if (args[0] === "done") {
        todoActions.clearDone();
      }
      break;
    case "ls":
    case "list":
      appStore.showPopup({
        type: "text",
        text: `总任务: ${todoStore.todos.length}\n待办: ${todoStore.todosByStatus.TODO.length}\n进行中: ${todoStore.todosByStatus.DOING.length}\n已完成: ${todoStore.todosByStatus.DONE.length}`,
      });
      break;
    case "help":
      appStore.showPopup({
        type: "text",
        text: `命令列表:
/N - 选中第N个任务
//N - 选中第N条便签
/s - 开始任务
/d - 完成任务
/r - 重置为待办
/rm - 删除
/p 或 /! - 切换重要标记
/e - 编辑
/n [内容] - 添加便签
/mv N - 移动到第N位
/clear done - 清除已完成
/ls - 显示统计

提示: 按 Ctrl+K 打开命令面板`,
      });
      break;
    default:
      toastStore.warning(`未知命令: ${cmd}`);
  }
};

function handleSelectTodo(todoId: string) {
  if (selectedTodoId.value === todoId) {
    focusStore.clearFocus();
  } else {
    focusStore.focusTodo(todoId);
  }
}

function handleToggleTodoStatus(todoId: string) {
  todoStore.cycleStatus(todoId);
  focusStore.focusTodo(todoId);
}

function handleToggleTodoPriority(todoId: string) {
  const todo = todoStore.todos.find((t) => t.id === todoId);
  if (todo && todo.status !== "DONE") {
    todoStore.togglePriority(todoId);
  }
}

function handleStartEditTodo(todoId: string) {
  const todo = todoStore.todos.find((t) => t.id === todoId);
  if (todo && todo.status !== "DONE") {
    focusStore.startEdit("todo", todoId);
    appStore.startEditTodo(todoId); // 兼容旧系统
  }
}

function handleCommitEditTodo(todoId: string, content: string) {
  todoStore.updateTodoContent(todoId, content);
  focusStore.commitEdit();
  appStore.stopEditing();
}

function handleCancelEditTodo() {
  focusStore.goBack();
  appStore.stopEditing();
}

function handleDeleteTodo(todoId: string) {
  const todo = todoStore.todos.find((t) => t.id === todoId);
  if (!todo) return;

  const truncatedContent =
    todo.content.length > 30 ? todo.content.substring(0, 30) + "..." : todo.content;

  appStore.showConfirmDialog({
    title: "删除任务",
    message: `确定要删除任务 "${truncatedContent}" 吗？此操作无法撤销。`,
    confirmText: "删除",
    cancelText: "取消",
    type: "danger",
    onConfirm: () => {
      todoStore.deleteTodo(todoId);
      focusStore.clearFocus();
      toastStore.success("任务已删除");
    },
  });
}

function handleMoveToTop(todoId: string) {
  todoStore.moveTodo(todoId, 0);
  toastStore.success("已移到顶部");
}

function handleMoveToBottom(todoId: string) {
  todoStore.moveTodo(todoId, todoStore.todos.length - 1);
  toastStore.success("已移到底部");
}

function handleReorderTodos(fromIndex: number, toIndex: number) {
  todoStore.reorderTodos(fromIndex, toIndex);
}

function handleAddNote(todoId: string) {
  const todo = todoStore.todos.find((t) => t.id === todoId);
  if (todo && todo.status !== "DONE") {
    const noteId = todoStore.addNote(todoId, "");
    if (noteId) {
      focusStore.startEdit("note", todoId, noteId);
      appStore.startEditNote(todoId, noteId);
    }
  }
}

function handleSelectNote(todoId: string, noteId: string) {
  focusStore.focusNote(todoId, noteId);
}

function handleStartEditNote(todoId: string, noteId: string) {
  const todo = todoStore.todos.find((t) => t.id === todoId);
  if (todo && todo.status !== "DONE") {
    focusStore.startEdit("note", todoId, noteId);
    appStore.startEditNote(todoId, noteId);
  }
}

function handleCommitEditNote(todoId: string, noteId: string, content: string) {
  todoStore.updateNote(todoId, noteId, content);
  focusStore.commitEdit();
  focusStore.focusTodo(todoId);
  appStore.stopEditing();
}

function handleCancelEditNote() {
  focusStore.goBack();
  appStore.stopEditing();
}

function handleDeleteNote(todoId: string, noteId: string) {
  const todo = todoStore.todos.find((t) => t.id === todoId);
  if (!todo) return;

  const note = todo.notes.find((n) => n.id === noteId);
  if (!note) return;

  const truncatedContent =
    note.content.length > 30 ? note.content.substring(0, 30) + "..." : note.content;

  appStore.showConfirmDialog({
    title: "删除便签",
    message: `确定要删除便签 "${truncatedContent}" 吗？`,
    confirmText: "删除",
    cancelText: "取消",
    type: "warning",
    onConfirm: () => {
      todoStore.deleteNote(todoId, noteId);
      focusStore.focusTodo(todoId);
      toastStore.success("便签已删除");
    },
  });
}

function handleReorderNotes(todoId: string, fromIndex: number, toIndex: number) {
  todoStore.reorderNotes(todoId, fromIndex, toIndex);
}
</script>

<template>
  <div class="dashboard-view">
    <main class="content-area">
      <div class="list-container" ref="listContainerRef">
        <div class="dashboard-header">
          <h1 class="title">My Tasks</h1>
          <p class="subtitle">
            {{ visibleTodos.length }} 个任务
            <span v-if="todoStore.doingTodo" class="doing-badge">专注模式</span>
          </p>
        </div>

        <TodoList
          :todos="visibleTodos"
          :selected-todo-id="selectedTodoId"
          :selected-note-id="selectedNoteId"
          :editing-todo-id="editingTodoId"
          :editing-note-id="editingNoteId"
          @select-todo="handleSelectTodo"
          @toggle-todo-status="handleToggleTodoStatus"
          @toggle-todo-priority="handleToggleTodoPriority"
          @start-edit-todo="handleStartEditTodo"
          @commit-edit-todo="handleCommitEditTodo"
          @cancel-edit-todo="handleCancelEditTodo"
          @delete-todo="handleDeleteTodo"
          @add-note="handleAddNote"
          @move-to-top="handleMoveToTop"
          @move-to-bottom="handleMoveToBottom"
          @reorder-todos="handleReorderTodos"
          @select-note="handleSelectNote"
          @start-edit-note="handleStartEditNote"
          @commit-edit-note="handleCommitEditNote"
          @cancel-edit-note="handleCancelEditNote"
          @delete-note="handleDeleteNote"
          @reorder-notes="handleReorderNotes"
        />

        <div class="spacer"></div>
      </div>
    </main>

    <footer class="input-area">
      <div class="input-container-wrapper">
        <UnifiedInput
          ref="unifiedInputRef"
          v-model="inputValue"
          :placeholder="inputPlaceholder"
          @submit="handleSubmit"
        />
      </div>
    </footer>
  </div>
</template>

<style scoped>
.dashboard-view {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--hs-bg-base);
  color: var(--hs-text);
  overflow: hidden;
  position: relative;
}

.dashboard-view::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
      circle at 15% 50%,
      rgba(137, 180, 250, 0.03),
      transparent 25%
    ),
    radial-gradient(
      circle at 85% 30%,
      rgba(166, 227, 161, 0.03),
      transparent 25%
    );
  pointer-events: none;
  z-index: 0;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  /* 增加底部 padding 为 QuickBar 留空间 */
  padding-bottom: 48px;
}

.content-area::-webkit-scrollbar {
  width: 6px;
}

.content-area::-webkit-scrollbar-track {
  background: transparent;
}

.content-area::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.list-container {
  width: 100%;
  max-width: 720px;
  padding: 40px 0 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-header {
  padding: 0 48px;
  margin-bottom: 8px;
  animation: slideDown 0.6s var(--ease-out);
}

.title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  background: linear-gradient(
    135deg,
    var(--hs-text) 0%,
    var(--hs-subtext) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 0.9rem;
  color: var(--hs-muted);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.doing-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(249, 226, 175, 0.15);
  color: var(--hs-warning);
  border-radius: 10px;
  font-weight: 500;
}

.spacer {
  height: 140px;
}

.input-area {
  position: fixed;
  bottom: 48px; /* QuickBar 高度 */
  left: 0;
  width: 100%;
  padding: 24px 20px 32px;
  display: flex;
  justify-content: center;
  z-index: 10;
  background: linear-gradient(
    to top,
    var(--hs-bg-base) 0%,
    var(--hs-bg-base) 40%,
    rgba(30, 30, 46, 0.8) 70%,
    transparent 100%
  );
}

.input-container-wrapper {
  width: 100%;
  max-width: 640px;
  animation: slideUp 0.6s var(--ease-out) 0.1s backwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
