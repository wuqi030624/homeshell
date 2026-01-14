import { defineStore } from "pinia";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration: number;
}

interface ToastState {
  toasts: Toast[];
}

export const useToastStore = defineStore("toast", {
  state: (): ToastState => ({
    toasts: [],
  }),
  actions: {
    show(
      type: Toast["type"],
      message: string,
      duration = 3000
    ): string {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      this.toasts.push({ id, type, message, duration });

      if (duration > 0) {
        setTimeout(() => this.dismiss(id), duration);
      }

      return id;
    },

    success(message: string, duration = 3000): string {
      return this.show("success", message, duration);
    },

    error(message: string, duration = 5000): string {
      return this.show("error", message, duration);
    },

    warning(message: string, duration = 4000): string {
      return this.show("warning", message, duration);
    },

    info(message: string, duration = 3000): string {
      return this.show("info", message, duration);
    },

    dismiss(id: string): void {
      const index = this.toasts.findIndex((t) => t.id === id);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    },

    clear(): void {
      this.toasts = [];
    },
  },
});
