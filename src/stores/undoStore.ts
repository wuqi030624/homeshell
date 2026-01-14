import { defineStore } from "pinia";

interface UndoStoreState {
  history: HomeShell.UndoAction[];
  redoStack: HomeShell.UndoAction[];
  maxHistory: number;
}

export const useUndoStore = defineStore("undo", {
  state: (): UndoStoreState => ({
    history: [],
    redoStack: [],
    maxHistory: 50,
  }),

  getters: {
    // 是否可以撤销
    canUndo: (state): boolean => state.history.length > 0,

    // 是否可以重做
    canRedo: (state): boolean => state.redoStack.length > 0,

    // 最近的可撤销操作
    lastAction: (state): HomeShell.UndoAction | null => {
      return state.history[state.history.length - 1] || null;
    },

    // 最近的可重做操作
    lastRedoAction: (state): HomeShell.UndoAction | null => {
      return state.redoStack[state.redoStack.length - 1] || null;
    },
  },

  actions: {
    // 记录一个可撤销的操作
    record(action: Omit<HomeShell.UndoAction, "id" | "timestamp">) {
      const fullAction: HomeShell.UndoAction = {
        ...action,
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        timestamp: Date.now(),
      };

      this.history.push(fullAction);

      // 限制历史记录数量
      while (this.history.length > this.maxHistory) {
        this.history.shift();
      }

      // 新操作会清除重做栈
      this.redoStack = [];

      return fullAction.id;
    },

    // 撤销最近的操作
    undo(): boolean {
      const action = this.history.pop();
      if (!action) return false;

      try {
        action.undo();
        this.redoStack.push(action);
        return true;
      } catch (error) {
        console.error("Undo failed:", error);
        // 如果撤销失败，将操作放回历史
        this.history.push(action);
        return false;
      }
    },

    // 重做最近撤销的操作
    redo(): boolean {
      const action = this.redoStack.pop();
      if (!action) return false;

      try {
        action.redo();
        this.history.push(action);
        return true;
      } catch (error) {
        console.error("Redo failed:", error);
        // 如果重做失败，将操作放回重做栈
        this.redoStack.push(action);
        return false;
      }
    },

    // 清除所有历史
    clear() {
      this.history = [];
      this.redoStack = [];
    },

    // 移除指定的操作（通常用于操作过期时）
    remove(id: string) {
      const historyIndex = this.history.findIndex((a) => a.id === id);
      if (historyIndex !== -1) {
        this.history.splice(historyIndex, 1);
      }

      const redoIndex = this.redoStack.findIndex((a) => a.id === id);
      if (redoIndex !== -1) {
        this.redoStack.splice(redoIndex, 1);
      }
    },
  },
});

// ===== 辅助函数：创建可撤销操作 =====

import { useTodoStore } from "./todoStore";

export function createTodoUndoAction(
  type: HomeShell.UndoActionType,
  description: string,
  todoData: HomeShell.Todo
): Omit<HomeShell.UndoAction, "id" | "timestamp"> {
  const snapshot = JSON.parse(JSON.stringify(todoData));

  return {
    type,
    description,
    undo: () => {
      const todoStore = useTodoStore();
      switch (type) {
        case "todo:create":
          // 撤销创建 = 删除
          todoStore.deleteTodo(snapshot.id);
          break;
        case "todo:delete":
          // 撤销删除 = 恢复
          todoStore.todos.push(snapshot);
          break;
        case "todo:update":
        case "todo:status":
          // 撤销更新 = 恢复原值
          const todo = todoStore.todos.find((t) => t.id === snapshot.id);
          if (todo) {
            Object.assign(todo, snapshot);
          }
          break;
      }
    },
    redo: () => {
      // Redo 逻辑需要根据具体操作类型实现
      // 这里简化处理
    },
  };
}

export function createNoteUndoAction(
  type: HomeShell.UndoActionType,
  description: string,
  todoId: string,
  noteData: HomeShell.Note
): Omit<HomeShell.UndoAction, "id" | "timestamp"> {
  const snapshot = JSON.parse(JSON.stringify(noteData));

  return {
    type,
    description,
    undo: () => {
      const todoStore = useTodoStore();
      const todo = todoStore.todos.find((t) => t.id === todoId);
      if (!todo) return;

      switch (type) {
        case "note:create":
          // 撤销创建 = 删除
          todo.notes = todo.notes.filter((n) => n.id !== snapshot.id);
          break;
        case "note:delete":
          // 撤销删除 = 恢复
          todo.notes.push(snapshot);
          break;
        case "note:update":
          // 撤销更新 = 恢复原值
          const note = todo.notes.find((n) => n.id === snapshot.id);
          if (note) {
            Object.assign(note, snapshot);
          }
          break;
      }
    },
    redo: () => {
      // Redo 逻辑
    },
  };
}
