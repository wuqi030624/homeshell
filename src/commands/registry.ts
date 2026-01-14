import { useFocusStore } from "@/stores/focusStore";
import { useTodoStore } from "@/stores/todoStore";
import { useAppStore } from "@/stores/appStore";
import { useCommandStore } from "@/stores/commandStore";
import { useToastStore } from "@/stores/toastStore";
import { useUndoStore, createTodoUndoAction, createNoteUndoAction } from "@/stores/undoStore";

// ===== 命令条件函数 =====

const hasTodoFocus = (focus: HomeShell.FocusState) =>
  focus.type === "todo" || focus.type === "note";

const hasNoteFocus = (focus: HomeShell.FocusState) => focus.type === "note";

const isNotEditing = (focus: HomeShell.FocusState) => focus.type !== "input";

const canEdit = (focus: HomeShell.FocusState): boolean => {
  if (focus.type !== "todo" && focus.type !== "note") return false;
  const todoStore = useTodoStore();
  const todo = todoStore.todos.find((t) => t.id === focus.todoId);
  return !!(todo && todo.status !== "DONE");
};

// ===== 任务操作命令 =====

const todoCommands: HomeShell.Command[] = [
  {
    id: "todo:start",
    name: "开始执行",
    description: "将任务状态改为进行中",
    shortcut: "S",
    icon: "play",
    when: (focus) => hasTodoFocus(focus) && isNotEditing(focus),
    action: () => {
      const focusStore = useFocusStore();
      const todoStore = useTodoStore();
      const toastStore = useToastStore();
      const todoId = focusStore.focusedTodoId;
      if (todoId) {
        todoStore.startTodo(todoId);
        toastStore.success("任务已开始");
      }
    },
  },
  {
    id: "todo:complete",
    name: "标记完成",
    description: "将任务状态改为已完成",
    shortcut: "D",
    icon: "check",
    when: (focus) => hasTodoFocus(focus) && isNotEditing(focus),
    action: () => {
      const focusStore = useFocusStore();
      const todoStore = useTodoStore();
      const toastStore = useToastStore();
      const todoId = focusStore.focusedTodoId;
      if (todoId) {
        todoStore.completeTodo(todoId);
        toastStore.success("任务已完成");
      }
    },
  },
  {
    id: "todo:reset",
    name: "重置任务",
    description: "将任务状态改为待办",
    shortcut: "R",
    icon: "refresh",
    when: (focus) => hasTodoFocus(focus) && isNotEditing(focus),
    action: () => {
      const focusStore = useFocusStore();
      const todoStore = useTodoStore();
      const toastStore = useToastStore();
      const todoId = focusStore.focusedTodoId;
      if (todoId) {
        todoStore.resetTodo(todoId);
        toastStore.success("任务已重置");
      }
    },
  },
  {
    id: "todo:edit",
    name: "编辑内容",
    description: "修改任务文字",
    shortcut: "E",
    icon: "edit",
    when: canEdit,
    action: () => {
      const focusStore = useFocusStore();
      const todoId = focusStore.focusedTodoId;
      if (todoId) {
        focusStore.startEdit("todo", todoId);
      }
    },
  },
  {
    id: "todo:add-note",
    name: "添加便签",
    description: "为任务添加备注",
    shortcut: "N",
    icon: "note",
    when: canEdit,
    action: () => {
      const focusStore = useFocusStore();
      const todoStore = useTodoStore();
      const todoId = focusStore.focusedTodoId;
      if (todoId) {
        const noteId = todoStore.addNote(todoId, "");
        if (noteId) {
          focusStore.startEdit("note", todoId, noteId);
        }
      }
    },
  },
  {
    id: "todo:toggle-priority",
    name: "切换优先级",
    description: "标记/取消重要",
    shortcut: "P",
    icon: "flag",
    when: canEdit,
    action: () => {
      const focusStore = useFocusStore();
      const todoStore = useTodoStore();
      const todoId = focusStore.focusedTodoId;
      if (todoId) {
        todoStore.togglePriority(todoId);
      }
    },
  },
  {
    id: "todo:delete",
    name: "删除任务",
    description: "永久删除此任务",
    shortcut: "Delete",
    icon: "trash",
    when: (focus) => hasTodoFocus(focus) && isNotEditing(focus),
    action: () => {
      const focusStore = useFocusStore();
      const todoStore = useTodoStore();
      const appStore = useAppStore();
      const toastStore = useToastStore();
      const undoStore = useUndoStore();

      const todoId = focusStore.focusedTodoId;
      const todo = focusStore.focusedTodo;

      if (!todoId || !todo) return;

      const truncatedContent =
        todo.content.length > 30 ? todo.content.substring(0, 30) + "..." : todo.content;

      appStore.showConfirmDialog({
        title: "删除任务",
        message: `确定要删除任务 "${truncatedContent}" 吗？`,
        confirmText: "删除",
        cancelText: "取消",
        type: "danger",
        onConfirm: () => {
          // 记录撤销操作
          undoStore.record(createTodoUndoAction("todo:delete", `删除任务 "${truncatedContent}"`, todo));

          todoStore.deleteTodo(todoId);
          focusStore.clearFocus();
          toastStore.success("任务已删除");
        },
      });
    },
  },
  {
    id: "todo:move-top",
    name: "移到顶部",
    description: "移动到列表第一位",
    icon: "arrow-up",
    when: (focus) => hasTodoFocus(focus) && isNotEditing(focus),
    action: () => {
      const focusStore = useFocusStore();
      const todoStore = useTodoStore();
      const todoId = focusStore.focusedTodoId;
      if (todoId) {
        todoStore.moveTodo(todoId, 0);
      }
    },
  },
  {
    id: "todo:move-bottom",
    name: "移到底部",
    description: "移动到列表最后",
    icon: "arrow-down",
    when: (focus) => hasTodoFocus(focus) && isNotEditing(focus),
    action: () => {
      const focusStore = useFocusStore();
      const todoStore = useTodoStore();
      const todoId = focusStore.focusedTodoId;
      if (todoId) {
        todoStore.moveTodo(todoId, todoStore.todos.length - 1);
      }
    },
  },
];

// ===== 便签操作命令 =====

const noteCommands: HomeShell.Command[] = [
  {
    id: "note:edit",
    name: "编辑便签",
    description: "修改便签内容",
    shortcut: "E",
    icon: "edit",
    when: (focus) => hasNoteFocus(focus) && canEdit(focus),
    action: () => {
      const focusStore = useFocusStore();
      if (focusStore.focus.type === "note") {
        focusStore.startEdit("note", focusStore.focus.todoId, focusStore.focus.noteId);
      }
    },
  },
  {
    id: "note:delete",
    name: "删除便签",
    description: "删除此便签",
    shortcut: "Delete",
    icon: "trash",
    when: hasNoteFocus,
    action: () => {
      const focusStore = useFocusStore();
      const todoStore = useTodoStore();
      const appStore = useAppStore();
      const toastStore = useToastStore();

      if (focusStore.focus.type !== "note") return;

      const { todoId, noteId } = focusStore.focus;
      const note = focusStore.focusedNote;

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
    },
  },
  {
    id: "note:back-to-todo",
    name: "返回任务",
    description: "焦点回到父任务",
    shortcut: "H",
    icon: "arrow-left",
    when: hasNoteFocus,
    action: () => {
      const focusStore = useFocusStore();
      focusStore.goBack();
    },
  },
];

// ===== 全局命令 =====

const globalCommands: HomeShell.Command[] = [
  {
    id: "global:new-todo",
    name: "新建任务",
    description: "创建一个新任务",
    shortcut: "Ctrl+N",
    icon: "plus",
    action: () => {
      const focusStore = useFocusStore();
      const appStore = useAppStore();
      focusStore.clearFocus();
      appStore.requestFocusInput();
    },
  },
  {
    id: "global:search",
    name: "搜索",
    description: "打开搜索引擎",
    shortcut: "Tab",
    icon: "search",
    when: isNotEditing,
    action: () => {
      const appStore = useAppStore();
      appStore.enterSearchMode();
    },
  },
  {
    id: "global:terminal",
    name: "打开终端",
    description: "打开命令行终端",
    shortcut: "Ctrl+`",
    icon: "terminal",
    action: () => {
      const appStore = useAppStore();
      appStore.toggleTerminal();
    },
  },
  {
    id: "global:undo",
    name: "撤销",
    description: "撤销上一步操作",
    shortcut: "Ctrl+Z",
    icon: "undo",
    action: () => {
      const undoStore = useUndoStore();
      const toastStore = useToastStore();
      if (undoStore.undo()) {
        toastStore.success("已撤销");
      } else {
        toastStore.warning("没有可撤销的操作");
      }
    },
  },
  {
    id: "global:redo",
    name: "重做",
    description: "重做上一步操作",
    shortcut: "Ctrl+Shift+Z",
    icon: "redo",
    action: () => {
      const undoStore = useUndoStore();
      const toastStore = useToastStore();
      if (undoStore.redo()) {
        toastStore.success("已重做");
      } else {
        toastStore.warning("没有可重做的操作");
      }
    },
  },
  {
    id: "global:clear-done",
    name: "清除已完成",
    description: "删除所有已完成任务",
    icon: "trash",
    action: () => {
      const todoStore = useTodoStore();
      const appStore = useAppStore();
      const toastStore = useToastStore();

      const doneCount = todoStore.todosByStatus.DONE.length;
      if (doneCount === 0) {
        toastStore.info("没有已完成的任务");
        return;
      }

      appStore.showConfirmDialog({
        title: "清除已完成",
        message: `确定要删除 ${doneCount} 个已完成的任务吗？`,
        confirmText: "清除",
        cancelText: "取消",
        type: "warning",
        onConfirm: () => {
          todoStore.clearDone();
          toastStore.success(`已清除 ${doneCount} 个任务`);
        },
      });
    },
  },
  {
    id: "global:stats",
    name: "显示统计",
    description: "查看任务统计",
    icon: "chart",
    action: () => {
      const todoStore = useTodoStore();
      const appStore = useAppStore();
      appStore.showPopup({
        type: "text",
        text: `总任务: ${todoStore.todos.length}\n待办: ${todoStore.todosByStatus.TODO.length}\n进行中: ${todoStore.todosByStatus.DOING.length}\n已完成: ${todoStore.todosByStatus.DONE.length}`,
      });
    },
  },
  {
    id: "global:help",
    name: "快捷键帮助",
    description: "显示所有快捷键",
    shortcut: "?",
    icon: "help",
    action: () => {
      // 由 KeyboardHelp 组件处理
      const event = new CustomEvent("show-keyboard-help");
      window.dispatchEvent(event);
    },
  },
];

// ===== 导航命令 =====

const navigationCommands: HomeShell.Command[] = [
  {
    id: "nav:next",
    name: "下一项",
    description: "移动到下一个任务/便签",
    shortcut: "J",
    when: isNotEditing,
    action: () => {
      const focusStore = useFocusStore();
      if (focusStore.focus.type === "note") {
        if (!focusStore.moveToNextNote()) {
          // 如果已经是最后一个便签，返回到任务层级
          focusStore.goBack();
        }
      } else {
        focusStore.moveToNextTodo();
      }
    },
  },
  {
    id: "nav:prev",
    name: "上一项",
    description: "移动到上一个任务/便签",
    shortcut: "K",
    when: isNotEditing,
    action: () => {
      const focusStore = useFocusStore();
      if (focusStore.focus.type === "note") {
        focusStore.moveToPrevNote();
      } else {
        focusStore.moveToPrevTodo();
      }
    },
  },
  {
    id: "nav:enter",
    name: "进入",
    description: "展开便签/开始编辑",
    shortcut: "L",
    when: isNotEditing,
    action: () => {
      const focusStore = useFocusStore();
      focusStore.enter();
    },
  },
  {
    id: "nav:back",
    name: "返回",
    description: "收起便签/取消编辑",
    shortcut: "H",
    when: isNotEditing,
    action: () => {
      const focusStore = useFocusStore();
      focusStore.goBack();
    },
  },
  {
    id: "nav:first",
    name: "第一项",
    description: "跳转到第一个任务",
    shortcut: "G",
    when: isNotEditing,
    action: () => {
      const focusStore = useFocusStore();
      focusStore.jumpToFirst();
    },
  },
  {
    id: "nav:last",
    name: "最后一项",
    description: "跳转到最后一个任务",
    shortcut: "Shift+G",
    when: isNotEditing,
    action: () => {
      const focusStore = useFocusStore();
      focusStore.jumpToLast();
    },
  },
];

// ===== 初始化命令注册 =====

export function registerAllCommands() {
  const commandStore = useCommandStore();
  commandStore.registerCommands([
    ...todoCommands,
    ...noteCommands,
    ...globalCommands,
    ...navigationCommands,
  ]);
}

// ===== 导出 =====

export {
  todoCommands,
  noteCommands,
  globalCommands,
  navigationCommands,
};
