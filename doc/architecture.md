# HomeShell 架构设计文档

> 本文档记录 HomeShell 的系统架构、设计理念和核心模块实现。

## 目录

1. [项目概述](#项目概述)
2. [技术架构](#技术架构)
3. [核心系统设计](#核心系统设计)
   - [状态管理系统](#1-状态管理系统-pinia-stores)
   - [焦点导航系统](#2-焦点导航系统)
   - [统一输入框系统](#3-统一输入框系统)
   - [命令系统](#4-命令系统)
   - [快捷键系统](#5-快捷键系统)
   - [Todo 数据模型](#6-todo-数据模型)
   - [终端系统](#7-终端系统)
4. [组件层次结构](#组件层次结构)
5. [数据流向](#数据流向)
6. [设计决策记录](#设计决策记录)

---

## 项目概述

HomeShell 是一个现代化的浏览器起始页，融合了 **Todo 管理**、**命令行终端** 和 **搜索引擎聚合** 三大功能。

**核心理念**：
- **统一输入范式**：一个输入框完成 Todo 创建、搜索、命令执行
- **键盘优先**：所有操作可通过快捷键完成，支持 Vim 风格导航
- **专注模式**：任务进行中自动隐藏其他任务，保持专注
- **纯前端**：无后端依赖，数据本地持久化

---

## 技术架构

### 技术栈

| 层次 | 技术 | 说明 |
|------|------|------|
| **框架** | Vue 3 + Composition API | 响应式 UI 框架 |
| **语言** | TypeScript | 类型安全 |
| **构建** | Vite | 快速开发构建 |
| **状态** | Pinia | 轻量级状态管理 |
| **路由** | Vue Router 4 | SPA 路由 |
| **UI** | Ant Design Vue | UI 组件库 |
| **存储** | localStorage | 数据持久化 |

### 目录结构

```
src/
├── commands/           # 新命令注册中心
│   └── registry.ts     # 统一命令注册
├── components/         # Vue 组件
│   ├── dashboard/      # Dashboard 相关组件
│   └── terminal/       # 终端相关组件
├── composables/        # 组合式函数 (hooks)
├── configs/            # 配置文件
├── core/               # 旧命令系统 (遗留)
│   └── commands/       # 各类命令实现
├── pages/              # 页面组件
├── stores/             # Pinia 状态存储
├── types/              # TypeScript 类型定义
└── utils/              # 工具函数
```

---

## 核心系统设计

### 1. 状态管理系统 (Pinia Stores)

项目采用 Pinia 进行状态管理，按职责分为多个 Store：

#### 1.1 appStore - 应用全局状态

**职责**：管理应用级别的 UI 状态和模式切换

**关键状态**：
```typescript
interface AppState {
  mode: "default" | "search" | "terminal";  // 当前应用模式
  selection: SelectionTarget;                // 选中目标（兼容旧系统）
  editingTarget: EditingTarget;              // 编辑目标（兼容旧系统）
  searchEngine: string;                      // 当前搜索引擎
  isEditing: boolean;                        // 是否在编辑
  isTerminalOpen: boolean;                   // 终端是否打开
  isPopupOpen: boolean;                      // 弹窗是否打开
  confirmDialog: ConfirmDialogState;         // 确认对话框状态
  shouldFocusInput: boolean;                 // 焦点请求标志
  shouldClearInput: boolean;                 // 清除输入请求标志
}
```

**设计要点**：
- 使用 `shouldFocusInput` / `shouldClearInput` 标志实现跨组件的焦点和输入控制
- 支持 5 种搜索引擎循环切换：google, baidu, bing, github, bilibili
- 确认对话框支持 danger/warning/info 三种类型

#### 1.2 todoStore - Todo 数据管理

**职责**：管理 Todo 数据的 CRUD 操作

**关键 Getters**：
```typescript
// 按状态分组
todosByStatus: { TODO: Todo[], DOING: Todo[], DONE: Todo[] }

// 当前进行中的任务
doingTodo: Todo | undefined

// 可见任务（焦点模式下只显示 DOING 任务）
visibleTodos: Todo[]

// 是否处于焦点模式
isFocusMode: boolean
```

**焦点模式设计**：当存在 DOING 状态的任务时，`visibleTodos` 只返回该任务，实现专注效果。

#### 1.3 focusStore - 焦点管理

**职责**：管理当前焦点位置和导航操作

**焦点类型（判别联合类型）**：
```typescript
type FocusState =
  | { type: "none" }                                           // 无焦点
  | { type: "todo"; todoId: string }                           // 聚焦任务
  | { type: "note"; todoId: string; noteId: string }           // 聚焦便签
  | { type: "input"; target: "todo" | "note"; ... }            // 编辑模式
```

**核心功能**：
- **焦点设置**：`focusTodo()`, `focusNote()`, `startEdit()`, `clearFocus()`
- **导航操作**：`moveToNextTodo()`, `moveToPrevTodo()`, `moveToNextNote()`, `moveToPrevNote()`
- **层级导航**：`enter()` (进入下一层), `goBack()` (返回上一层)
- **跳转操作**：`jumpToFirst()`, `jumpToLast()`, `jumpToTodo(index)`
- **导航历史**：维护最近 10 个焦点状态，支持返回

#### 1.4 commandStore - 命令管理

**职责**：管理命令注册、搜索和执行

**关键功能**：
```typescript
// 命令过滤
availableCommands: Command[]    // 根据当前焦点过滤可用命令
filteredCommands: Command[]     // 根据搜索词进一步过滤

// 命令执行
execute(command)                // 执行命令
executeById(id)                 // 通过 ID 执行
executeByShortcut(shortcut)     // 通过快捷键执行

// 命令面板
open() / close() / toggle()     // 面板开关
selectPrev() / selectNext()     // 选择导航
```

**搜索特性**：
- 支持命令名称、描述、ID 的模糊搜索
- 支持拼音首字母匹配（简化版）
- 最近使用的命令优先显示

#### 1.5 undoStore - 撤销重做

**职责**：记录操作历史，支持撤销重做

**操作类型**：
```typescript
type UndoActionType =
  | "todo:create" | "todo:delete" | "todo:update" | "todo:status"
  | "note:create" | "note:delete" | "note:update"
  | "reorder"
```

#### 1.6 toastStore - 通知系统

**职责**：管理吐司通知的显示

**通知类型**：`success`, `warning`, `error`, `info`

---

### 2. 焦点导航系统

焦点系统是 HomeShell 的核心交互机制，实现了类 Vim 的导航体验。

#### 2.1 层级结构

```
无焦点 (none)
    ↓ J/K 或点击
任务层 (todo)
    ↓ L/Enter（如果有便签）
便签层 (note)
    ↓ L/Enter 或 E
编辑模式 (input)
```

#### 2.2 导航快捷键

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| J / ↓ | 下一项 | 在当前层级移动 |
| K / ↑ | 上一项 | 在当前层级移动 |
| L / → / Enter | 进入 | 进入便签层或编辑模式 |
| H / ← | 返回 | 返回上一层 |
| G | 第一项 | 跳转到列表开头 |
| Shift+G | 最后一项 | 跳转到列表末尾 |
| 1-9 | 快速跳转 | 跳转到指定索引的任务 |

#### 2.3 状态流转图

```
         clearFocus()
              ↓
         ┌────────┐
         │  none  │ ←────────────────────┐
         └────┬───┘                      │
              │ focusTodo()              │ clearFocus()
              ↓                          │
         ┌────────┐                      │
    ┌────│  todo  │←───┐                 │
    │    └────┬───┘    │                 │
    │         │        │ goBack()        │
    │ focusNote()      │                 │
    │         ↓        │                 │
    │    ┌────────┐    │                 │
    │    │  note  │────┘                 │
    │    └────┬───┘                      │
    │         │ startEdit()              │
    │         ↓                          │
    │    ┌────────┐                      │
    └────│ input  │──────────────────────┘
         └────────┘   commitEdit() / goBack()
```

---

### 3. 统一输入框系统

统一输入框是 HomeShell 的核心交互入口，通过模式切换实现多种功能。

#### 3.1 工作模式

| 模式 | 触发方式 | 功能 | 视觉指示 |
|------|----------|------|----------|
| **default** | 默认 | 创建 Todo | `>` 符号 |
| **search** | Tab 键 | 搜索引擎搜索 | 🔍 图标 + 引擎标签 |
| **command** | `/` 前缀 | 执行命令 | `/` 符号（绿色） |

#### 3.2 输入解析流程

```typescript
// useInputParser.ts
function parseInput(content, mode, selection): ParseResult {
  // 1. 搜索模式
  if (mode === "search") return { type: "search", payload: { query } }

  // 2. 命令模式（/ 前缀）
  if (content.startsWith("/")) {
    // /N → 选择第 N 个任务
    // //N → 选择第 N 个便签
    // /cmd → 执行命令
    return { type: "select" | "note_select" | "command", ... }
  }

  // 3. 默认模式
  // 解析优先级标记 (!)、标签 (#tag)
  return { type: "todo", payload: { content, priority, tags } }
}
```

#### 3.3 Todo 创建语法

```
任务内容 !          → 重要任务
任务内容 #tag1 #tag2 → 带标签任务
任务内容 ! #work    → 重要且带标签
```

#### 3.4 命令语法

```
/1, /2, ...         → 选中第 N 个任务
//1, //2, ...       → 选中第 N 个便签
/s, /start          → 开始任务
/d, /done           → 完成任务
/r, /reset          → 重置任务
/rm, /delete        → 删除
/p, /!, /priority   → 切换优先级
/e, /edit           → 编辑
/n [内容]           → 添加便签
/mv N               → 移动到第 N 位
/clear done         → 清除已完成
/ls                 → 显示统计
/help               → 帮助
```

---

### 4. 命令系统

HomeShell 有两套命令系统：新的命令面板系统和旧的终端命令系统。

#### 4.1 新命令系统 (commands/registry.ts)

**命令结构**：
```typescript
interface Command {
  id: string;              // 唯一标识，如 "todo:start"
  name: string;            // 显示名称
  description: string;     // 描述
  shortcut?: string;       // 快捷键
  icon?: string;           // 图标
  when?: (focus) => bool;  // 可用条件
  action: () => void;      // 执行函数
}
```

**命令分类**：
- **todoCommands**：任务操作（开始、完成、重置、编辑、删除等）
- **noteCommands**：便签操作（编辑、删除、返回）
- **globalCommands**：全局操作（新建、搜索、终端、撤销、重做等）
- **navigationCommands**：导航操作（上下移动、进入返回、跳转）

**条件函数**：
```typescript
const hasTodoFocus = (focus) => focus.type === "todo" || focus.type === "note"
const hasNoteFocus = (focus) => focus.type === "note"
const isNotEditing = (focus) => focus.type !== "input"
const canEdit = (focus) => {
  // 有焦点 && 不是 DONE 状态
  ...
}
```

#### 4.2 旧命令系统 (core/commands/)

遗留的终端命令系统，用于终端界面的命令执行。包含：
- 搜索命令（20+ 搜索引擎）
- 导航命令（goto）
- 娱乐命令（music, moyu, ikun）
- 工具命令（timing, ping, date）
- 配置命令（background, hint, reset）

---

### 5. 快捷键系统

#### 5.1 架构

快捷键由 `useKeyboard.ts` 组合函数统一管理，按优先级分层处理：

```typescript
function handleKeyDown(e: KeyboardEvent) {
  // 1. 命令面板打开时，让面板处理
  if (commandStore.isOpen) return

  // 2. 确认对话框打开时，只处理 Escape
  if (appStore.confirmDialog.isOpen) { ... }

  // 3. 终端打开时，只处理关闭快捷键
  if (appStore.isTerminalOpen) { ... }

  // 4. 全局快捷键（任何时候生效）
  if (handleGlobalShortcuts(e)) return

  // 5. 输入框中的快捷键
  if (isInInput) {
    handleInputShortcuts(e)
    return
  }

  // 6. 编辑模式下不处理其他快捷键
  if (focusStore.focus.type === "input") return

  // 7. 导航快捷键
  if (handleNavigationShortcuts(e)) return

  // 8. 操作快捷键
  if (handleActionShortcuts(e)) return
}
```

#### 5.2 快捷键清单

**全局快捷键**：
| 快捷键 | 功能 |
|--------|------|
| Ctrl+K | 命令面板 |
| Ctrl+` | 终端 |
| Ctrl+Z | 撤销 |
| Ctrl+Shift+Z | 重做 |
| Ctrl+N | 新建任务 |

**导航快捷键**：
| 快捷键 | 功能 |
|--------|------|
| J / ↓ | 下一项 |
| K / ↑ | 上一项 |
| L / → / Enter | 进入 |
| H / ← | 返回 |
| G | 第一项 |
| Shift+G | 最后一项 |
| 1-9 | 跳转到第 N 项 |
| Tab | 进入搜索模式 |
| Escape | 取消/返回 |

**操作快捷键**（需要有焦点）：
| 快捷键 | 功能 |
|--------|------|
| S | 开始任务 |
| D | 完成任务 |
| R | 重置任务 |
| E | 编辑 |
| N | 添加便签 |
| P / ! | 切换优先级 |
| X / Delete | 删除 |

---

### 6. Todo 数据模型

#### 6.1 核心类型

```typescript
// types/todo.d.ts
interface Todo {
  id: string;           // 唯一标识（时间戳）
  content: string;      // 任务内容
  status: TodoStatus;   // "TODO" | "DOING" | "DONE"
  priority: Priority;   // "default" | "important"
  tags: string[];       // 标签列表
  notes: Note[];        // 便签列表
  createdAt: number;    // 创建时间
  updatedAt: number;    // 更新时间
}

interface Note {
  id: string;           // 唯一标识
  content: string;      // 便签内容
  createdAt: number;
  updatedAt: number;
}
```

#### 6.2 状态流转

```
  ┌─────────────────────────────────────┐
  │                                     │
  │  ┌─────┐   start   ┌───────┐       │
  │  │ TODO│──────────→│ DOING │       │
  │  └─────┘           └───────┘       │
  │     ↑                  │           │
  │     │   reset          │ complete  │
  │     │                  ↓           │
  │     │              ┌───────┐       │
  │     └──────────────│ DONE  │       │
  │                    └───────┘       │
  │                        │ reset     │
  └────────────────────────┘
```

**单任务进行规则**：同一时间只能有一个任务处于 DOING 状态。开始新任务时，当前 DOING 任务自动重置为 TODO。

#### 6.3 持久化

使用 Pinia 插件持久化到 localStorage：
```typescript
persist: {
  key: "homeshell-todos",
  storage: localStorage,
}
```

---

### 7. 终端系统

#### 7.1 设计理念

终端系统是完全自主设计实现的，使用 Vue 组件 + Ant Design Vue 构建，而非基于 xterm.js 等第三方终端模拟器。这样设计的优势：
- 与项目 UI 风格统一
- 更灵活的输出渲染（支持 Vue 组件、HTML 富文本）
- 可折叠的命令输出
- 与 Pinia 状态管理无缝集成

#### 7.2 组件结构

```
TerminalDrawer.vue        # 抽屉容器（侧边滑出）
└── Terminal.vue          # 终端主组件
    ├── a-collapse        # Ant Design 折叠面板（命令输出）
    ├── a-input           # Ant Design 输入框（命令输入）
    └── ContentOutput.vue # 输出内容渲染组件
```

#### 7.3 核心实现

**输出类型系统**：
```typescript
type OutputType = CommandOutputType | TextOutputType | ComponentOutputType

interface CommandOutputType {
  type: "command"
  text: string           // 命令文本
  resultList: OutputType[] // 命令结果列表
  collapsible?: boolean  // 是否可折叠
}

interface TextOutputType {
  type: "text"
  text: string
  status?: "success" | "error" | "info"  // 状态着色
}
```

**Terminal API**：
```typescript
interface TerminalType {
  writeTextResult(text, status?)     // 写入当前命令结果
  writeTextErrorResult(text)         // 写入错误结果
  writeTextSuccessResult(text)       // 写入成功结果
  writeResult(output)                // 写入复杂输出
  writeTextOutput(text, status?)     // 立即输出文本
  writeOutput(output)                // 立即输出
  clear()                            // 清屏
  focusInput()                       // 聚焦输入框
  setCommandCollapsible(bool)        // 设置当前命令可折叠
  showPrevCommand() / showNextCommand() // 历史导航
  listCommandHistory()               // 列出历史
}
```

#### 7.4 辅助模块

- **history.ts**：命令历史管理，支持上下键导航
- **hint.ts**：输入提示，根据输入内容提供命令建议
- **shortcuts.ts**：终端快捷键注册

#### 7.5 开关方式

- 快捷键：`Ctrl + ``
- 命令：`global:terminal`

---

## 组件层次结构

```
App.vue
└── IndexPage.vue
    ├── DashboardView.vue
    │   ├── UnifiedInput.vue         # 统一输入框
    │   ├── TodoList.vue             # 任务列表
    │   │   └── TodoItem.vue         # 单个任务
    │   │       └── NoteList.vue     # 便签列表
    │   │           └── NoteItem.vue # 单个便签
    │   └── (useKeyboard)            # 键盘事件处理
    │
    ├── CommandPalette.vue           # 命令面板
    ├── QuickBar.vue                 # 快速操作栏
    ├── TerminalDrawer.vue           # 终端抽屉
    │   └── Terminal.vue
    ├── OutputPopup.vue              # 输出弹窗
    ├── ConfirmDialog.vue            # 确认对话框
    ├── ToastNotification.vue        # 吐司通知
    └── KeyboardHelp.vue             # 快捷键帮助
```

---

## 数据流向

### 创建 Todo

```
用户输入 "任务内容 ! #tag"
    ↓
UnifiedInput.vue @submit
    ↓
DashboardView.handleSubmit()
    ↓
useInputParser.parseInput()
  → { type: "todo", payload: { content, priority: "important", tags: ["tag"] } }
    ↓
useTodoActions.addTodo()
    ↓
todoStore.addTodo()
    ↓
localStorage 持久化
    ↓
visibleTodos 更新 → 列表重新渲染
```

### 快捷键操作

```
用户按下 "S" 键
    ↓
useKeyboard.handleKeyDown()
    ↓
handleActionShortcuts() → 匹配到 "s"
    ↓
commandStore.executeById("todo:start")
    ↓
registry.ts → todoCommands["todo:start"].action()
    ↓
todoStore.startTodo(todoId)
    ↓
toastStore.success("任务已开始")
```

### 命令面板

```
用户按下 Ctrl+K
    ↓
handleGlobalShortcuts() → commandStore.toggle()
    ↓
CommandPalette.vue 显示
    ↓
用户输入搜索词
    ↓
commandStore.setSearchQuery()
    ↓
filteredCommands getter 过滤命令列表
    ↓
用户按 Enter 或点击
    ↓
commandStore.executeSelected()
    ↓
command.action() 执行
```

---

## 设计决策记录

### DR-001: 双焦点系统

**背景**：项目经历了从 appStore 管理选中状态到 focusStore 的迁移。

**决策**：保留 appStore 的 `selection` 和 `editingTarget` 以保持兼容，新代码使用 focusStore。

**影响**：
- 组件中需要同时更新两个 store
- 类型定义保留两套（`SelectionTarget` 和 `FocusState`）
- 后续可逐步移除 appStore 中的选中相关代码

### DR-002: 命令条件函数

**背景**：不同命令在不同焦点状态下可用性不同。

**决策**：命令使用 `when` 函数声明可用条件，由 commandStore 在过滤时调用。

**好处**：
- 命令面板只显示当前可用的命令
- 快捷键只在合适的上下文中生效
- 条件逻辑集中管理

### DR-003: 输入框模式指示

**背景**：用户需要知道当前输入框处于什么模式。

**决策**：通过左侧图标和颜色变化指示模式：
- 默认：`>` 符号，蓝色
- 搜索：🔍 图标，黄色
- 命令：`/` 符号，绿色

### DR-004: 焦点模式

**背景**：用户在处理任务时容易被其他任务分散注意力。

**决策**：当任务状态为 DOING 时，自动隐藏其他任务。

**实现**：`todoStore.visibleTodos` getter 检测是否有 DOING 任务，有则只返回该任务。

---

## 后续计划

- [ ] 移除 appStore 中的选中状态，完全迁移到 focusStore
- [ ] 统一旧命令系统和新命令系统
- [ ] 添加更多撤销/重做支持
- [ ] 实现拖拽排序
- [ ] 添加任务分组/项目功能
- [ ] 支持数据导出/导入
- [ ] 云同步功能

---

*最后更新：2026-01-14*
