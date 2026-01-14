import { defineStore } from "pinia";

const SEARCH_ENGINES = ["google", "baidu", "bing", "github", "bilibili"];

export const useAppStore = defineStore("app", {
  state: (): HomeShell.AppState => ({
    mode: "default",
    selection: { type: "none" },
    editingTarget: { type: "none" },
    searchEngine: "google",
    isEditing: false,
    isTerminalOpen: false,
    isPopupOpen: false,
    popupContent: null,
    shouldFocusInput: false,
    shouldClearInput: false,
    confirmDialog: {
      isOpen: false,
      title: "",
      message: "",
      confirmText: "确认",
      cancelText: "取消",
      type: "danger",
      onConfirm: null,
      onCancel: null,
    },
  }),
  actions: {
    setMode(mode: HomeShell.AppMode) {
      this.mode = mode;
    },

    enterSearchMode() {
      this.mode = "search";
      this.shouldFocusInput = true;
    },

    cycleSearchEngine() {
      const currentIndex = SEARCH_ENGINES.indexOf(this.searchEngine);
      const nextIndex = (currentIndex + 1) % SEARCH_ENGINES.length;
      this.searchEngine = SEARCH_ENGINES[nextIndex];
    },

    exitToDefaultMode() {
      this.mode = "default";
      this.selection = { type: "none" };
      this.editingTarget = { type: "none" };
      this.isEditing = false;
      this.shouldFocusInput = true;
      this.shouldClearInput = true;
    },

    toggleTerminal() {
      this.isTerminalOpen = !this.isTerminalOpen;
    },

    selectTodo(todoId: string) {
      this.selection = { type: "todo", todoId };
    },

    selectNote(todoId: string, noteId: string) {
      this.selection = { type: "note", todoId, noteId };
    },

    clearSelection() {
      this.selection = { type: "none" };
      this.editingTarget = { type: "none" };
      this.isEditing = false;
      this.shouldFocusInput = true;
    },

    startEditTodo(todoId: string) {
      this.selection = { type: "todo", todoId };
      this.editingTarget = { type: "todo", todoId };
      this.isEditing = true;
    },

    startEditNote(todoId: string, noteId: string) {
      this.selection = { type: "note", todoId, noteId };
      this.editingTarget = { type: "note", todoId, noteId };
      this.isEditing = true;
    },

    stopEditing() {
      this.editingTarget = { type: "none" };
      this.isEditing = false;
      this.shouldFocusInput = true;
    },

    enterEditMode() {
      this.isEditing = true;
    },

    exitEditMode() {
      this.editingTarget = { type: "none" };
      this.isEditing = false;
    },

    showPopup(content: any) {
      this.isPopupOpen = true;
      this.popupContent = content;
    },

    hidePopup() {
      this.isPopupOpen = false;
      this.popupContent = null;
    },

    requestFocusInput() {
      this.shouldFocusInput = true;
    },

    clearFocusRequest() {
      this.shouldFocusInput = false;
    },

    requestClearInput() {
      this.shouldClearInput = true;
    },

    clearInputRequest() {
      this.shouldClearInput = false;
    },

    showConfirmDialog(
      options: Partial<HomeShell.ConfirmDialogState> & {
        onConfirm: () => void;
      }
    ) {
      this.confirmDialog = {
        isOpen: true,
        title: options.title || "确认",
        message: options.message || "",
        confirmText: options.confirmText || "确认",
        cancelText: options.cancelText || "取消",
        type: options.type || "danger",
        onConfirm: options.onConfirm,
        onCancel: options.onCancel || null,
      };
    },

    hideConfirmDialog() {
      this.confirmDialog.isOpen = false;
      this.confirmDialog.onConfirm = null;
      this.confirmDialog.onCancel = null;
    },

    confirmDialogAction() {
      if (this.confirmDialog.onConfirm) {
        this.confirmDialog.onConfirm();
      }
      this.hideConfirmDialog();
    },

    cancelDialogAction() {
      if (this.confirmDialog.onCancel) {
        this.confirmDialog.onCancel();
      }
      this.hideConfirmDialog();
    },
  },
  persist: {
    key: "homeshell-app",
    storage: localStorage,
    paths: ["searchEngine"],
  },
});
