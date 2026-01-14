<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const isOpen = ref(false);

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
    // 检查是否在输入框中
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      return;
    }
    e.preventDefault();
    isOpen.value = !isOpen.value;
  }

  if (e.key === "Escape" && isOpen.value) {
    e.preventDefault();
    isOpen.value = false;
  }
}

function handleShowHelp() {
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("show-keyboard-help", handleShowHelp);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("show-keyboard-help", handleShowHelp);
});

const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");
const mod = isMac ? "⌘" : "Ctrl";
</script>

<template>
  <Teleport to="body">
    <Transition name="help-fade">
      <div v-if="isOpen" class="keyboard-help-overlay" @click="close">
        <div class="keyboard-help" @click.stop>
          <div class="help-header">
            <h2 class="help-title">快捷键速查</h2>
            <button class="close-btn" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="help-content">
            <div class="help-section">
              <h3 class="section-title">导航</h3>
              <div class="shortcut-list">
                <div class="shortcut-item">
                  <kbd>J</kbd> / <kbd>↓</kbd>
                  <span>下一项</span>
                </div>
                <div class="shortcut-item">
                  <kbd>K</kbd> / <kbd>↑</kbd>
                  <span>上一项</span>
                </div>
                <div class="shortcut-item">
                  <kbd>L</kbd> / <kbd>→</kbd>
                  <span>进入/展开</span>
                </div>
                <div class="shortcut-item">
                  <kbd>H</kbd> / <kbd>←</kbd>
                  <span>返回</span>
                </div>
                <div class="shortcut-item">
                  <kbd>1</kbd>-<kbd>9</kbd>
                  <span>跳转到第N项</span>
                </div>
                <div class="shortcut-item">
                  <kbd>G</kbd>
                  <span>第一项</span>
                </div>
                <div class="shortcut-item">
                  <kbd>Shift</kbd>+<kbd>G</kbd>
                  <span>最后一项</span>
                </div>
              </div>
            </div>

            <div class="help-section">
              <h3 class="section-title">任务操作</h3>
              <div class="shortcut-list">
                <div class="shortcut-item">
                  <kbd>S</kbd>
                  <span>开始任务</span>
                </div>
                <div class="shortcut-item">
                  <kbd>D</kbd>
                  <span>完成任务</span>
                </div>
                <div class="shortcut-item">
                  <kbd>R</kbd>
                  <span>重置任务</span>
                </div>
                <div class="shortcut-item">
                  <kbd>E</kbd>
                  <span>编辑</span>
                </div>
                <div class="shortcut-item">
                  <kbd>N</kbd>
                  <span>添加便签</span>
                </div>
                <div class="shortcut-item">
                  <kbd>P</kbd>
                  <span>切换优先级</span>
                </div>
                <div class="shortcut-item">
                  <kbd>Delete</kbd>
                  <span>删除</span>
                </div>
              </div>
            </div>

            <div class="help-section">
              <h3 class="section-title">全局</h3>
              <div class="shortcut-list">
                <div class="shortcut-item">
                  <kbd>{{ mod }}</kbd>+<kbd>K</kbd>
                  <span>命令面板</span>
                </div>
                <div class="shortcut-item">
                  <kbd>{{ mod }}</kbd>+<kbd>N</kbd>
                  <span>新建任务</span>
                </div>
                <div class="shortcut-item">
                  <kbd>{{ mod }}</kbd>+<kbd>Z</kbd>
                  <span>撤销</span>
                </div>
                <div class="shortcut-item">
                  <kbd>Tab</kbd>
                  <span>搜索模式</span>
                </div>
                <div class="shortcut-item">
                  <kbd>{{ mod }}</kbd>+<kbd>`</kbd>
                  <span>终端</span>
                </div>
                <div class="shortcut-item">
                  <kbd>Esc</kbd>
                  <span>取消/返回</span>
                </div>
                <div class="shortcut-item">
                  <kbd>?</kbd>
                  <span>此帮助</span>
                </div>
              </div>
            </div>

            <div class="help-section">
              <h3 class="section-title">编辑</h3>
              <div class="shortcut-list">
                <div class="shortcut-item">
                  <kbd>Enter</kbd>
                  <span>保存</span>
                </div>
                <div class="shortcut-item">
                  <kbd>Esc</kbd>
                  <span>取消</span>
                </div>
                <div class="shortcut-item">
                  <kbd>{{ mod }}</kbd>+<kbd>Enter</kbd>
                  <span>保存并继续</span>
                </div>
              </div>
            </div>
          </div>

          <div class="help-footer">
            <span>按任意键关闭</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.keyboard-help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.keyboard-help {
  width: 100%;
  max-width: 720px;
  max-height: 80vh;
  background: var(--hs-bg-mantle);
  border: 1px solid var(--hs-surface-1);
  border-radius: var(--hs-radius-lg);
  box-shadow: var(--hs-shadow-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--hs-surface-0);
}

.help-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--hs-text);
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: var(--hs-muted);
  cursor: pointer;
  border-radius: var(--hs-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--motion-fast) var(--ease-out);
}

.close-btn:hover {
  background: var(--hs-surface-0);
  color: var(--hs-text);
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

/* Content */
.help-content {
  padding: 20px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.help-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--hs-accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--hs-subtext);
}

.shortcut-item kbd {
  padding: 4px 8px;
  background: var(--hs-surface-0);
  border: 1px solid var(--hs-surface-1);
  border-radius: 4px;
  font-size: 12px;
  font-family: "JetBrains Mono", monospace;
  color: var(--hs-text);
  min-width: 24px;
  text-align: center;
}

.shortcut-item span {
  color: var(--hs-muted);
}

/* Footer */
.help-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--hs-surface-0);
  text-align: center;
  color: var(--hs-overlay-0);
  font-size: 0.8rem;
}

/* Animation */
.help-fade-enter-active {
  transition: opacity 0.2s ease;
}

.help-fade-leave-active {
  transition: opacity 0.15s ease;
}

.help-fade-enter-from,
.help-fade-leave-to {
  opacity: 0;
}

.help-fade-enter-from .keyboard-help,
.help-fade-leave-to .keyboard-help {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 640px) {
  .help-content {
    grid-template-columns: 1fr;
  }
}
</style>
