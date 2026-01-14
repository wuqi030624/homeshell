import { useTodoStore } from "@/stores/todoStore";
import { useAppStore } from "@/stores/appStore";

export function useTodoActions() {
  const todoStore = useTodoStore();
  const appStore = useAppStore();

  function addTodo(
    content: string,
    priority?: HomeShell.Priority,
    tags?: string[]
  ) {
    return todoStore.addTodo(content, priority, tags);
  }

  function startTodo(todoId: string) {
    todoStore.startTodo(todoId);
    appStore.selectTodo(todoId);
  }

  function completeTodo(todoId: string) {
    todoStore.completeTodo(todoId);
  }

  function resetTodo(todoId: string) {
    todoStore.resetTodo(todoId);
    appStore.selectTodo(todoId);
  }

  function deleteTodo(todoId: string) {
    todoStore.deleteTodo(todoId);
    appStore.clearSelection();
  }

  function togglePriority(todoId: string) {
    todoStore.togglePriority(todoId);
  }

  function addNote(todoId: string, content: string) {
    return todoStore.addNote(todoId, content);
  }

  function updateNote(todoId: string, noteId: string, content: string) {
    todoStore.updateNote(todoId, noteId, content);
  }

  function deleteNote(todoId: string, noteId: string) {
    todoStore.deleteNote(todoId, noteId);
    appStore.selectTodo(todoId);
  }

  function selectTodoByIndex(index: number) {
    const todos = todoStore.visibleTodos;
    if (index >= 0 && index < todos.length) {
      const todo = todos[index];
      appStore.selectTodo(todo.id);
      return todo;
    }
    return null;
  }

  function clearDone() {
    todoStore.clearDone();
  }

  return {
    addTodo,
    startTodo,
    completeTodo,
    resetTodo,
    deleteTodo,
    togglePriority,
    addNote,
    updateNote,
    deleteNote,
    selectTodoByIndex,
    clearDone,
  };
}
