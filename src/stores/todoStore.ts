import { defineStore } from "pinia";

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [] as HomeShell.Todo[],
  }),
  getters: {
    todosByStatus: (state) => {
      return {
        TODO: state.todos.filter((t) => t.status === "TODO"),
        DOING: state.todos.filter((t) => t.status === "DOING"),
        DONE: state.todos.filter((t) => t.status === "DONE"),
      };
    },
    doingTodo: (state) => {
      return state.todos.find((t) => t.status === "DOING");
    },
    visibleTodos: (state) => {
      const doing = state.todos.find((t) => t.status === "DOING");
      if (doing) {
        return [doing];
      }
      return state.todos;
    },
    isFocusMode: (state) => {
      return state.todos.some((t) => t.status === "DOING");
    },
    getTodoByIndex: (state) => (index: number) => {
      return state.todos[index];
    },
  },
  actions: {
    addTodo(
      content: string,
      priority: HomeShell.Priority = "default",
      tags: string[] = []
    ) {
      const todo: HomeShell.Todo = {
        id: Date.now().toString(),
        content,
        status: "TODO",
        priority,
        tags,
        notes: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.todos.push(todo);
      return todo.id;
    },

    updateTodo(id: string, updates: Partial<HomeShell.Todo>) {
      const todo = this.todos.find((t) => t.id === id);
      if (todo) {
        Object.assign(todo, updates, { updatedAt: Date.now() });
      }
    },

    deleteTodo(id: string) {
      const index = this.todos.findIndex((t) => t.id === id);
      if (index !== -1) {
        this.todos.splice(index, 1);
      }
    },

    startTodo(id: string) {
      const currentDoing = this.todos.find((t) => t.status === "DOING");
      if (currentDoing) {
        currentDoing.status = "TODO";
        currentDoing.updatedAt = Date.now();
      }
      const todo = this.todos.find((t) => t.id === id);
      if (todo) {
        todo.status = "DOING";
        todo.updatedAt = Date.now();
      }
    },

    completeTodo(id: string) {
      const todo = this.todos.find((t) => t.id === id);
      if (todo) {
        todo.status = "DONE";
        todo.updatedAt = Date.now();
      }
    },

    resetTodo(id: string) {
      const todo = this.todos.find((t) => t.id === id);
      if (todo) {
        todo.status = "TODO";
        todo.updatedAt = Date.now();
      }
    },

    togglePriority(id: string) {
      const todo = this.todos.find((t) => t.id === id);
      if (todo) {
        todo.priority = todo.priority === "important" ? "default" : "important";
        todo.updatedAt = Date.now();
      }
    },

    addTag(id: string, tag: string) {
      const todo = this.todos.find((t) => t.id === id);
      if (todo && !todo.tags.includes(tag)) {
        todo.tags.push(tag);
        todo.updatedAt = Date.now();
      }
    },

    removeTag(id: string, tag: string) {
      const todo = this.todos.find((t) => t.id === id);
      if (todo) {
        todo.tags = todo.tags.filter((t) => t !== tag);
        todo.updatedAt = Date.now();
      }
    },

    addNote(todoId: string, content: string) {
      const todo = this.todos.find((t) => t.id === todoId);
      if (todo) {
        const note: HomeShell.Note = {
          id: Date.now().toString(),
          content,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        todo.notes.push(note);
        todo.updatedAt = Date.now();
        return note.id;
      }
    },

    updateNote(todoId: string, noteId: string, content: string) {
      const todo = this.todos.find((t) => t.id === todoId);
      if (todo) {
        const note = todo.notes.find((n) => n.id === noteId);
        if (note) {
          note.content = content;
          note.updatedAt = Date.now();
          todo.updatedAt = Date.now();
        }
      }
    },

    deleteNote(todoId: string, noteId: string) {
      const todo = this.todos.find((t) => t.id === todoId);
      if (todo) {
        todo.notes = todo.notes.filter((n) => n.id !== noteId);
        todo.updatedAt = Date.now();
      }
    },

    clearDone() {
      this.todos = this.todos.filter((t) => t.status !== "DONE");
    },

    // 设置 todo 状态
    setTodoStatus(id: string, status: HomeShell.TodoStatus) {
      // 如果设置为 DOING，先将当前 DOING 的重置为 TODO
      if (status === "DOING") {
        const currentDoing = this.todos.find((t) => t.status === "DOING");
        if (currentDoing && currentDoing.id !== id) {
          currentDoing.status = "TODO";
          currentDoing.updatedAt = Date.now();
        }
      }
      const todo = this.todos.find((t) => t.id === id);
      if (todo) {
        todo.status = status;
        todo.updatedAt = Date.now();
      }
    },

    // 循环切换状态: TODO -> DOING -> DONE -> TODO
    cycleStatus(id: string) {
      const todo = this.todos.find((t) => t.id === id);
      if (!todo) return;

      const statusCycle: HomeShell.TodoStatus[] = ["TODO", "DOING", "DONE"];
      const currentIndex = statusCycle.indexOf(todo.status);
      const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
      this.setTodoStatus(id, nextStatus);
    },

    // 更新 todo 内容
    updateTodoContent(id: string, content: string) {
      const todo = this.todos.find((t) => t.id === id);
      if (todo) {
        todo.content = content;
        todo.updatedAt = Date.now();
      }
    },

    // 重新排序 todos
    reorderTodos(fromIndex: number, toIndex: number) {
      if (fromIndex === toIndex) return;
      if (fromIndex < 0 || fromIndex >= this.todos.length) return;
      if (toIndex < 0 || toIndex >= this.todos.length) return;

      const [moved] = this.todos.splice(fromIndex, 1);
      this.todos.splice(toIndex, 0, moved);
    },

    // 移动 todo 到指定位置
    moveTodo(todoId: string, toIndex: number) {
      const fromIndex = this.todos.findIndex((t) => t.id === todoId);
      if (fromIndex === -1) return;
      this.reorderTodos(fromIndex, toIndex);
    },

    // 重新排序 notes
    reorderNotes(todoId: string, fromIndex: number, toIndex: number) {
      const todo = this.todos.find((t) => t.id === todoId);
      if (!todo) return;
      if (fromIndex === toIndex) return;
      if (fromIndex < 0 || fromIndex >= todo.notes.length) return;
      if (toIndex < 0 || toIndex >= todo.notes.length) return;

      const [moved] = todo.notes.splice(fromIndex, 1);
      todo.notes.splice(toIndex, 0, moved);
      todo.updatedAt = Date.now();
    },

    // 移动 note 到指定位置
    moveNote(todoId: string, noteId: string, toIndex: number) {
      const todo = this.todos.find((t) => t.id === todoId);
      if (!todo) return;
      const fromIndex = todo.notes.findIndex((n) => n.id === noteId);
      if (fromIndex === -1) return;
      this.reorderNotes(todoId, fromIndex, toIndex);
    },
  },
  persist: {
    key: "homeshell-todos",
    storage: localStorage,
  },
});
