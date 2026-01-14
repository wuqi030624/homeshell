declare namespace HomeShell {
  type AppMode = "default" | "search" | "terminal";

  // ===== 新焦点系统类型 =====
  type FocusType = "none" | "todo" | "note" | "input";

  type FocusState =
    | { type: "none" }
    | { type: "todo"; todoId: string }
    | { type: "note"; todoId: string; noteId: string }
    | { type: "input"; target: "todo" | "note"; todoId?: string; noteId?: string };

  // ===== 命令系统类型 =====
  interface Command {
    id: string;
    name: string;
    description: string;
    shortcut?: string;
    icon?: string;
    when?: (focus: FocusState) => boolean;
    action: () => void;
  }

  interface CommandGroup {
    id: string;
    name: string;
    commands: Command[];
  }

  // ===== 撤销系统类型 =====
  type UndoActionType =
    | "todo:create"
    | "todo:delete"
    | "todo:update"
    | "todo:status"
    | "note:create"
    | "note:delete"
    | "note:update"
    | "reorder";

  interface UndoAction {
    id: string;
    type: UndoActionType;
    timestamp: number;
    description: string;
    undo: () => void;
    redo: () => void;
  }

  // ===== 旧系统类型（保持兼容） =====
  type SelectionTarget =
    | { type: "none" }
    | { type: "todo"; todoId: string }
    | { type: "note"; todoId: string; noteId: string };

  type EditingTarget =
    | { type: "none" }
    | { type: "todo"; todoId: string }
    | { type: "note"; todoId: string; noteId: string };

  interface ConfirmDialogState {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: "danger" | "warning" | "info";
    onConfirm: (() => void) | null;
    onCancel: (() => void) | null;
  }

  interface AppState {
    mode: AppMode;
    selection: SelectionTarget;
    editingTarget: EditingTarget;
    searchEngine: string;
    isEditing: boolean;
    isTerminalOpen: boolean;
    isPopupOpen: boolean;
    popupContent: any;
    shouldFocusInput: boolean;
    shouldClearInput: boolean;
    confirmDialog: ConfirmDialogState;
  }
}
