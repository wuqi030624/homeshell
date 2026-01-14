import { ref, onMounted, onUnmounted } from "vue";

interface GestureOptions {
  swipeThreshold?: number;
  longPressDelay?: number;
  onSwipeLeft?: (element: HTMLElement, data: TouchData) => void;
  onSwipeRight?: (element: HTMLElement, data: TouchData) => void;
  onSwipeUp?: (element: HTMLElement, data: TouchData) => void;
  onSwipeDown?: (element: HTMLElement, data: TouchData) => void;
  onLongPress?: (element: HTMLElement, data: TouchData) => void;
  onTap?: (element: HTMLElement, data: TouchData) => void;
}

interface TouchData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  duration: number;
  target: HTMLElement;
}

interface GestureState {
  startX: number;
  startY: number;
  startTime: number;
  longPressTimer: number | null;
  isLongPress: boolean;
  target: HTMLElement | null;
}

export function useGestures(
  containerRef: { value: HTMLElement | null },
  selector: string,
  options: GestureOptions = {}
) {
  const {
    swipeThreshold = 50,
    longPressDelay = 500,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    onTap,
  } = options;

  const state = ref<GestureState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    longPressTimer: null,
    isLongPress: false,
    target: null,
  });

  const isActive = ref(false);

  function findMatchingElement(target: EventTarget | null): HTMLElement | null {
    if (!target || !(target instanceof HTMLElement)) return null;
    return target.closest(selector) as HTMLElement | null;
  }

  function handleTouchStart(e: TouchEvent) {
    const element = findMatchingElement(e.target);
    if (!element) return;

    const touch = e.touches[0];
    state.value = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      longPressTimer: null,
      isLongPress: false,
      target: element,
    };

    isActive.value = true;

    // 设置长按检测
    if (onLongPress) {
      state.value.longPressTimer = window.setTimeout(() => {
        state.value.isLongPress = true;
        if (state.value.target) {
          onLongPress(state.value.target, createTouchData(touch.clientX, touch.clientY));
          // 触发长按反馈
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }
      }, longPressDelay);
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isActive.value || !state.value.target) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - state.value.startX;
    const deltaY = touch.clientY - state.value.startY;

    // 如果移动距离超过阈值，取消长按
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      cancelLongPress();
    }

    // 阻止页面滚动（如果有滑动操作）
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (!isActive.value || !state.value.target) return;

    cancelLongPress();
    isActive.value = false;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - state.value.startX;
    const deltaY = touch.clientY - state.value.startY;
    const duration = Date.now() - state.value.startTime;

    const touchData = createTouchData(touch.clientX, touch.clientY);
    const element = state.value.target;

    // 如果是长按，不处理其他手势
    if (state.value.isLongPress) {
      state.value.target = null;
      return;
    }

    // 检测滑动方向
    if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft(element, touchData);
      } else if (deltaX > 0 && onSwipeRight) {
        onSwipeRight(element, touchData);
      }
    } else if (Math.abs(deltaY) > swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY < 0 && onSwipeUp) {
        onSwipeUp(element, touchData);
      } else if (deltaY > 0 && onSwipeDown) {
        onSwipeDown(element, touchData);
      }
    } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && duration < 300) {
      // 点击
      if (onTap) {
        onTap(element, touchData);
      }
    }

    state.value.target = null;
  }

  function handleTouchCancel() {
    cancelLongPress();
    isActive.value = false;
    state.value.target = null;
  }

  function cancelLongPress() {
    if (state.value.longPressTimer) {
      clearTimeout(state.value.longPressTimer);
      state.value.longPressTimer = null;
    }
  }

  function createTouchData(endX: number, endY: number): TouchData {
    return {
      startX: state.value.startX,
      startY: state.value.startY,
      endX,
      endY,
      deltaX: endX - state.value.startX,
      deltaY: endY - state.value.startY,
      duration: Date.now() - state.value.startTime,
      target: state.value.target!,
    };
  }

  function register() {
    const container = containerRef.value;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchCancel, { passive: true });
  }

  function unregister() {
    const container = containerRef.value;
    if (!container) return;

    container.removeEventListener("touchstart", handleTouchStart);
    container.removeEventListener("touchmove", handleTouchMove);
    container.removeEventListener("touchend", handleTouchEnd);
    container.removeEventListener("touchcancel", handleTouchCancel);
  }

  onMounted(register);
  onUnmounted(unregister);

  return {
    isActive,
    register,
    unregister,
  };
}

// ===== 专用手势钩子：任务列表 =====

export function useTodoGestures(
  containerRef: { value: HTMLElement | null },
  handlers: {
    onDelete: (todoId: string) => void;
    onComplete: (todoId: string) => void;
    onDragStart: (todoId: string, element: HTMLElement) => void;
  }
) {
  return useGestures(containerRef, ".todo-wrapper", {
    swipeThreshold: 80,
    longPressDelay: 400,

    onSwipeLeft: (element) => {
      const todoId = element.dataset.todoId;
      if (todoId) {
        // 添加滑动动画类
        element.classList.add("swipe-left");
        // 触发删除
        setTimeout(() => {
          handlers.onDelete(todoId);
        }, 200);
      }
    },

    onSwipeRight: (element) => {
      const todoId = element.dataset.todoId;
      if (todoId) {
        // 添加滑动动画类
        element.classList.add("swipe-right");
        // 触发完成
        setTimeout(() => {
          handlers.onComplete(todoId);
        }, 200);
      }
    },

    onLongPress: (element) => {
      const todoId = element.dataset.todoId;
      if (todoId) {
        // 添加拖拽样式
        element.classList.add("is-dragging");
        handlers.onDragStart(todoId, element);
      }
    },
  });
}

// ===== 专用手势钩子：便签列表 =====

export function useNoteGestures(
  containerRef: { value: HTMLElement | null },
  handlers: {
    onDelete: (noteId: string) => void;
    onEdit: (noteId: string) => void;
  }
) {
  return useGestures(containerRef, ".note-wrapper", {
    swipeThreshold: 60,

    onSwipeLeft: (element) => {
      const noteId = element.dataset.noteId;
      if (noteId) {
        element.classList.add("swipe-left");
        setTimeout(() => {
          handlers.onDelete(noteId);
        }, 200);
      }
    },

    onTap: (element) => {
      const noteId = element.dataset.noteId;
      if (noteId) {
        handlers.onEdit(noteId);
      }
    },
  });
}
