import { onMounted, onUnmounted } from "vue";
import { useAppStore } from "@/stores/appStore";
import { useFocusStore } from "@/stores/focusStore";
import { useCommandStore } from "@/stores/commandStore";
import { useTodoStore } from "@/stores/todoStore";

export function useKeyboard() {
  const appStore = useAppStore();
  const focusStore = useFocusStore();
  const commandStore = useCommandStore();
  const todoStore = useTodoStore();

  function handleKeyDown(e: KeyboardEvent) {
    // 如果命令面板打开，让它处理键盘事件
    if (commandStore.isOpen) {
      return;
    }

    // 如果确认对话框打开，处理 Escape
    if (appStore.confirmDialog.isOpen) {
      if (e.key === "Escape") {
        e.preventDefault();
        appStore.cancelDialogAction();
      }
      return;
    }

    // 如果终端打开，让终端处理
    if (appStore.isTerminalOpen) {
      // 只处理 Ctrl+` 和 Escape 来关闭终端
      // 使用 code 来检测反引号，因为不同键盘布局下 key 可能不同
      const isBackquote = e.code === "Backquote" || e.key === "`";
      if (e.key === "Escape" || (e.ctrlKey && isBackquote)) {
        e.preventDefault();
        appStore.toggleTerminal();
      }
      return;
    }

    // 检查是否在输入框中
    const target = e.target as HTMLElement;
    const isInInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

    // 全局快捷键（在任何地方都生效）
    if (handleGlobalShortcuts(e)) {
      return;
    }

    // 如果在输入框中，处理输入相关快捷键
    if (isInInput) {
      handleInputShortcuts(e);
      return;
    }

    // 如果正在编辑（focus 类型是 input），不处理其他快捷键
    if (focusStore.focus.type === "input") {
      return;
    }

    // 导航快捷键
    if (handleNavigationShortcuts(e)) {
      return;
    }

    // 操作快捷键
    if (handleActionShortcuts(e)) {
      return;
    }
  }

  // 全局快捷键
  function handleGlobalShortcuts(e: KeyboardEvent): boolean {
    // Cmd/Ctrl + K: 命令面板
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      commandStore.toggle();
      return true;
    }

    // Cmd/Ctrl + `: 终端
    // 使用 code 来检测反引号，因为不同键盘布局下 key 可能不同
    const isBackquote = e.code === "Backquote" || e.key === "`";
    if (e.ctrlKey && isBackquote) {
      e.preventDefault();
      appStore.toggleTerminal();
      return true;
    }

    // Cmd/Ctrl + Z: 撤销
    if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      commandStore.executeById("global:undo");
      return true;
    }

    // Cmd/Ctrl + Shift + Z: 重做
    if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
      e.preventDefault();
      commandStore.executeById("global:redo");
      return true;
    }

    // Cmd/Ctrl + N: 新建任务
    if ((e.metaKey || e.ctrlKey) && e.key === "n") {
      e.preventDefault();
      commandStore.executeById("global:new-todo");
      return true;
    }

    return false;
  }

  // 输入框快捷键
  function handleInputShortcuts(e: KeyboardEvent): boolean {
    // Escape: 取消编辑/退出搜索模式
    if (e.key === "Escape") {
      e.preventDefault();
      if (appStore.mode === "search") {
        appStore.exitToDefaultMode();
      } else if (focusStore.focus.type === "input") {
        focusStore.goBack();
      }
      return true;
    }

    // Tab: 进入搜索模式 / 切换搜索引擎
    if (e.key === "Tab" && !e.shiftKey) {
      if (appStore.mode === "default") {
        e.preventDefault();
        appStore.enterSearchMode();
        return true;
      } else if (appStore.mode === "search") {
        e.preventDefault();
        appStore.cycleSearchEngine();
        return true;
      }
    }

    return false;
  }

  // 导航快捷键
  function handleNavigationShortcuts(e: KeyboardEvent): boolean {
    const key = e.key.toLowerCase();

    // Escape: 取消/返回
    if (e.key === "Escape") {
      e.preventDefault();
      if (appStore.mode === "search") {
        appStore.exitToDefaultMode();
      } else if (focusStore.hasFocus) {
        focusStore.goBack();
      }
      return true;
    }

    // Tab: 进入搜索模式
    if (e.key === "Tab" && !e.shiftKey && appStore.mode === "default") {
      e.preventDefault();
      appStore.enterSearchMode();
      return true;
    }

    // j / 下箭头: 下一项
    if (key === "j" || e.key === "ArrowDown") {
      e.preventDefault();
      if (focusStore.focus.type === "note") {
        focusStore.moveToNextNote();
      } else {
        focusStore.moveToNextTodo();
      }
      return true;
    }

    // k / 上箭头: 上一项
    if (key === "k" || e.key === "ArrowUp") {
      e.preventDefault();
      if (focusStore.focus.type === "note") {
        focusStore.moveToPrevNote();
      } else {
        focusStore.moveToPrevTodo();
      }
      return true;
    }

    // l / 右箭头 / Enter: 进入
    if (key === "l" || e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      focusStore.enter();
      return true;
    }

    // h / 左箭头: 返回
    if (key === "h" || e.key === "ArrowLeft") {
      e.preventDefault();
      focusStore.goBack();
      return true;
    }

    // g: 第一项
    if (key === "g" && !e.shiftKey) {
      e.preventDefault();
      focusStore.jumpToFirst();
      return true;
    }

    // G (Shift+g): 最后一项
    if (key === "g" && e.shiftKey) {
      e.preventDefault();
      focusStore.jumpToLast();
      return true;
    }

    // 1-9: 跳转到指定任务
    if (/^[1-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const index = parseInt(e.key) - 1;
      focusStore.jumpToTodo(index);
      return true;
    }

    return false;
  }

  // 操作快捷键
  function handleActionShortcuts(e: KeyboardEvent): boolean {
    const key = e.key.toLowerCase();

    // 必须有焦点才能执行操作
    if (!focusStore.hasFocus) {
      return false;
    }

    // s: 开始任务
    if (key === "s") {
      e.preventDefault();
      commandStore.executeById("todo:start");
      return true;
    }

    // d: 完成任务
    if (key === "d") {
      e.preventDefault();
      commandStore.executeById("todo:complete");
      return true;
    }

    // r: 重置任务
    if (key === "r") {
      e.preventDefault();
      commandStore.executeById("todo:reset");
      return true;
    }

    // e: 编辑
    if (key === "e") {
      e.preventDefault();
      if (focusStore.focus.type === "note") {
        commandStore.executeById("note:edit");
      } else {
        commandStore.executeById("todo:edit");
      }
      return true;
    }

    // n: 添加便签
    if (key === "n") {
      e.preventDefault();
      commandStore.executeById("todo:add-note");
      return true;
    }

    // p 或 !: 切换优先级
    if (key === "p" || e.key === "!") {
      e.preventDefault();
      commandStore.executeById("todo:toggle-priority");
      return true;
    }

    // x 或 Delete: 删除
    if (key === "x" || e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      if (focusStore.focus.type === "note") {
        commandStore.executeById("note:delete");
      } else {
        commandStore.executeById("todo:delete");
      }
      return true;
    }

    return false;
  }

  function registerKeyboard() {
    document.addEventListener("keydown", handleKeyDown);
  }

  function unregisterKeyboard() {
    document.removeEventListener("keydown", handleKeyDown);
  }

  onMounted(() => {
    registerKeyboard();
  });

  onUnmounted(() => {
    unregisterKeyboard();
  });

  return {
    registerKeyboard,
    unregisterKeyboard,
  };
}
