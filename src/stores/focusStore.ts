import { defineStore } from "pinia";
import { computed } from "vue";
import { useTodoStore } from "./todoStore";

interface FocusStoreState {
  focus: HomeShell.FocusState;
  // 导航历史，用于返回操作
  navigationHistory: HomeShell.FocusState[];
}

export const useFocusStore = defineStore("focus", {
  state: (): FocusStoreState => ({
    focus: { type: "none" },
    navigationHistory: [],
  }),

  getters: {
    // 当前焦点类型
    focusType: (state): HomeShell.FocusType => state.focus.type,

    // 是否有焦点
    hasFocus: (state): boolean => state.focus.type !== "none",

    // 当前焦点的 todoId
    focusedTodoId: (state): string | null => {
      if (state.focus.type === "todo" || state.focus.type === "note") {
        return state.focus.todoId;
      }
      if (state.focus.type === "input" && state.focus.todoId) {
        return state.focus.todoId;
      }
      return null;
    },

    // 当前焦点的 noteId
    focusedNoteId: (state): string | null => {
      if (state.focus.type === "note") {
        return state.focus.noteId;
      }
      if (state.focus.type === "input" && state.focus.noteId) {
        return state.focus.noteId;
      }
      return null;
    },

    // 是否在编辑模式
    isEditing: (state): boolean => state.focus.type === "input",

    // 获取当前焦点的 todo 对象
    focusedTodo(): HomeShell.Todo | null {
      const todoStore = useTodoStore();
      const state = this.focus;
      let todoId: string | null = null;
      if (state.type === "todo" || state.type === "note") {
        todoId = state.todoId;
      } else if (state.type === "input" && state.todoId) {
        todoId = state.todoId;
      }
      if (!todoId) return null;
      return todoStore.todos.find((t) => t.id === todoId) || null;
    },

    // 获取当前焦点的 note 对象
    focusedNote(): HomeShell.Note | null {
      const todo = this.focusedTodo;
      const state = this.focus;
      let noteId: string | null = null;
      if (state.type === "note") {
        noteId = state.noteId;
      } else if (state.type === "input" && state.noteId) {
        noteId = state.noteId;
      }
      if (!todo || !noteId) return null;
      return todo.notes.find((n: HomeShell.Note) => n.id === noteId) || null;
    },

    // 当前焦点的索引（在列表中的位置）
    focusedTodoIndex(): number {
      const todoStore = useTodoStore();
      const state = this.focus;
      let todoId: string | null = null;
      if (state.type === "todo" || state.type === "note") {
        todoId = state.todoId;
      } else if (state.type === "input" && state.todoId) {
        todoId = state.todoId;
      }
      if (!todoId) return -1;
      return todoStore.visibleTodos.findIndex((t) => t.id === todoId);
    },

    // 当前焦点便签的索引
    focusedNoteIndex(): number {
      const todo = this.focusedTodo;
      const state = this.focus;
      let noteId: string | null = null;
      if (state.type === "note") {
        noteId = state.noteId;
      } else if (state.type === "input" && state.noteId) {
        noteId = state.noteId;
      }
      if (!todo || !noteId) return -1;
      return todo.notes.findIndex((n: HomeShell.Note) => n.id === noteId);
    },
  },

  actions: {
    // ===== 焦点设置 =====

    // 设置焦点到任务
    focusTodo(todoId: string) {
      this._pushHistory();
      this.focus = { type: "todo", todoId };
    },

    // 设置焦点到便签
    focusNote(todoId: string, noteId: string) {
      this._pushHistory();
      this.focus = { type: "note", todoId, noteId };
    },

    // 进入编辑模式
    startEdit(target: "todo" | "note", todoId?: string, noteId?: string) {
      this._pushHistory();
      this.focus = { type: "input", target, todoId, noteId };
    },

    // 清除焦点
    clearFocus() {
      this._pushHistory();
      this.focus = { type: "none" };
      this.navigationHistory = [];
    },

    // 返回上一个焦点状态
    goBack() {
      if (this.navigationHistory.length > 0) {
        const previous = this.navigationHistory.pop()!;
        this.focus = previous;
        return true;
      }
      // 如果没有历史，根据当前状态决定返回行为
      if (this.focus.type === "input") {
        // 从编辑模式返回
        if (this.focus.target === "note" && this.focus.todoId && this.focus.noteId) {
          this.focus = { type: "note", todoId: this.focus.todoId, noteId: this.focus.noteId };
        } else if (this.focus.todoId) {
          this.focus = { type: "todo", todoId: this.focus.todoId };
        } else {
          this.focus = { type: "none" };
        }
        return true;
      }
      if (this.focus.type === "note") {
        // 从便签返回到任务
        this.focus = { type: "todo", todoId: this.focus.todoId };
        return true;
      }
      if (this.focus.type === "todo") {
        // 从任务返回到无焦点
        this.focus = { type: "none" };
        return true;
      }
      return false;
    },

    // ===== 导航操作 =====

    // 移动到下一个任务
    moveToNextTodo() {
      const todoStore = useTodoStore();
      const todos = todoStore.visibleTodos;
      if (todos.length === 0) return false;

      const currentIndex = this.focusedTodoIndex;
      if (currentIndex === -1) {
        // 无焦点时，移动到第一个
        this.focusTodo(todos[0].id);
        return true;
      }
      if (currentIndex < todos.length - 1) {
        this.focusTodo(todos[currentIndex + 1].id);
        return true;
      }
      return false; // 已经是最后一个
    },

    // 移动到上一个任务
    moveToPrevTodo() {
      const todoStore = useTodoStore();
      const todos = todoStore.visibleTodos;
      if (todos.length === 0) return false;

      const currentIndex = this.focusedTodoIndex;
      if (currentIndex === -1) {
        // 无焦点时，移动到最后一个
        this.focusTodo(todos[todos.length - 1].id);
        return true;
      }
      if (currentIndex > 0) {
        this.focusTodo(todos[currentIndex - 1].id);
        return true;
      }
      return false; // 已经是第一个
    },

    // 移动到下一个便签
    moveToNextNote() {
      const todo = this.focusedTodo;
      if (!todo || todo.notes.length === 0) return false;

      const currentIndex = this.focusedNoteIndex;
      if (currentIndex === -1) {
        // 未选中便签，移动到第一个
        this.focusNote(todo.id, todo.notes[0].id);
        return true;
      }
      if (currentIndex < todo.notes.length - 1) {
        this.focusNote(todo.id, todo.notes[currentIndex + 1].id);
        return true;
      }
      return false;
    },

    // 移动到上一个便签
    moveToPrevNote() {
      const todo = this.focusedTodo;
      if (!todo || todo.notes.length === 0) return false;

      const currentIndex = this.focusedNoteIndex;
      if (currentIndex === -1) {
        // 未选中便签，移动到最后一个
        this.focusNote(todo.id, todo.notes[todo.notes.length - 1].id);
        return true;
      }
      if (currentIndex > 0) {
        this.focusNote(todo.id, todo.notes[currentIndex - 1].id);
        return true;
      }
      return false;
    },

    // 跳转到指定索引的任务
    jumpToTodo(index: number) {
      const todoStore = useTodoStore();
      const todos = todoStore.visibleTodos;
      if (index >= 0 && index < todos.length) {
        this.focusTodo(todos[index].id);
        return true;
      }
      return false;
    },

    // 跳转到第一个任务
    jumpToFirst() {
      return this.jumpToTodo(0);
    },

    // 跳转到最后一个任务
    jumpToLast() {
      const todoStore = useTodoStore();
      return this.jumpToTodo(todoStore.visibleTodos.length - 1);
    },

    // 进入下一层（任务 -> 便签，便签 -> 编辑）
    enter() {
      if (this.focus.type === "todo") {
        const todo = this.focusedTodo;
        if (todo && todo.notes.length > 0) {
          this.focusNote(todo.id, todo.notes[0].id);
          return true;
        }
        // 如果没有便签，直接进入编辑模式
        if (todo && todo.status !== "DONE") {
          this.startEdit("todo", todo.id);
          return true;
        }
      }
      if (this.focus.type === "note") {
        const todo = this.focusedTodo;
        if (todo && todo.status !== "DONE") {
          this.startEdit("note", this.focus.todoId, this.focus.noteId);
          return true;
        }
      }
      return false;
    },

    // 确认编辑完成
    commitEdit() {
      if (this.focus.type === "input") {
        const { target, todoId, noteId } = this.focus;
        if (target === "note" && todoId && noteId) {
          this.focus = { type: "note", todoId, noteId };
        } else if (todoId) {
          this.focus = { type: "todo", todoId };
        } else {
          this.focus = { type: "none" };
        }
        return true;
      }
      return false;
    },

    // ===== 私有方法 =====

    _pushHistory() {
      // 只保留最近 10 个历史记录
      if (this.focus.type !== "none") {
        this.navigationHistory.push({ ...this.focus } as HomeShell.FocusState);
        if (this.navigationHistory.length > 10) {
          this.navigationHistory.shift();
        }
      }
    },
  },
});
