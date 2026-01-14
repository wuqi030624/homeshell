declare namespace HomeShell {
  type TodoStatus = "TODO" | "DOING" | "DONE";
  type Priority = "default" | "important";

  interface Note {
    id: string;
    content: string;
    createdAt: number;
    updatedAt: number;
  }

  interface Todo {
    id: string;
    content: string;
    status: TodoStatus;
    priority: Priority;
    tags: string[];
    notes: Note[];
    createdAt: number;
    updatedAt: number;
  }
}
