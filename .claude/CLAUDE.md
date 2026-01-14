# HomeShell - Claude Code 项目配置

## 项目概述

HomeShell 是浏览器起始页，结合 Todo 管理与终端功能。技术栈：Vue 3 + TypeScript, Vite, Pinia, Ant Design Vue。包管理器：pnpm。

---

## 开发文档同步要求

**完成一个开发阶段后，必须执行以下操作：**

1. **更新 `doc/architecture.md`**：
   - 新增的系统或模块
   - 现有系统设计的变更
   - 新的数据结构或类型定义
   - 新的组件层次结构
   - 新的数据流模式

2. **如果做了重大设计决策，添加设计决策记录**：
   - 格式：`### DR-XXX: 标题`
   - 内容：背景、决策、影响/好处

3. **如果完成了计划项，更新"后续计划"部分**

**文档记录原则**：
- 记录系统设计，而非实现细节
- 描述"如何设计的"而非"如何使用"
- 记录关键组件关系和数据流
- 记录架构模式和约定

---

## 文档创建规则

**不要随意创建文档文件**，包括：
- 设置指南、教程、操作文档
- 对比文档或分析报告
- TODO 列表或规划文档
- 状态报告或总结文件

**仅在以下情况创建文档**：
1. 用户明确要求："创建一个关于 X 的文档"
2. 用户在你提议后授权

---

## 构建命令

```bash
pnpm install      # 安装依赖
pnpm dev          # 开发服务器 (localhost:3000)
pnpm tsc          # 类型检查（不构建）
pnpm build:check  # 带类型检查的构建
pnpm build        # 生产构建
pnpm preview      # 预览生产构建
```

---

## 代码规范

### TypeScript/Vue 配置

- **严格模式** (`tsconfig.json`)
- **ESNext target** + DOM lib
- **路径别名**：`@/*` 映射到 `src/*`

### 导入顺序

```typescript
// 1. 外部库
// 2. 内部绝对导入 (@/...)
// 3. 相对导入
```

### 命名约定

- 组件：`PascalCase.vue`
- Composables/Commands/Stores：`camelCase.ts`
- 接口/类型：`PascalCase`
- 常量：`UPPER_SNAKE_CASE`
- 函数：`camelCase`
- Vue 组合函数：`use*` 前缀
- Pinia stores：`use*Store`

### 类型定义

全局类型在 `src/types/*.d.ts`，使用 `HomeShell` 命名空间，无需导入即可访问。

### 错误处理

前端：`terminal.writeTextErrorResult()` / `terminal.writeTextSuccessResult()`

### CSS 规范

- CSS 变量带回退值：`var(--color-text-primary, #e0e0e0)`
- 组件使用 `scoped` 样式
- 属性分组：布局、尺寸、视觉效果、过渡动画

---

## 关键架构

详见 `doc/architecture.md`

**核心模式**：
1. **状态管理**：Pinia stores + localStorage 持久化
2. **输入解析**：`useInputParser` 判断类型（todo/command/search/select）
3. **命令系统**：注册到 map，通过 `doCommandExecute()` 执行
4. **应用模式**：default, search, terminal
5. **焦点系统**：判别联合类型 `{ type: "todo" | "note" | "none" | "input"; ... }`

---

## 重要注意事项

- **语言**：中文注释，编辑时保留
- **路径别名**：始终使用 `@/` 导入 src 内容
- **类型检查**：提交前运行 `pnpm tsc`
