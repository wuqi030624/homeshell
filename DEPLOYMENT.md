# YuIndex 本地部署文档

## 环境要求

- Node.js: v24.12.0（或更高版本）
- pnpm: v10.26.1（包管理器）

## 快速开始

### 1. 安装依赖

```bash
cd ~/dev/frontend/learning-project/HomeShell
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:3000/` 启动

### 3. 其他命令

```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# TypeScript 类型检查
pnpm tsc

# 构建浏览器扩展
pnpm build:crx

# 开发浏览器扩展（监听模式）
pnpm dev:crx
```

## 技术栈

### 前端框架
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite 2** - 下一代前端构建工具
- **TypeScript** - 类型安全的 JavaScript
- **Vue Router 4** - Vue.js 官方路由

### UI 组件
- **Ant Design Vue 3** - 企业级 UI 组件库
- **xterm.js** - Web 终端组件库

### 状态管理
- **Pinia 2** - Vue 的直观状态管理
- **pinia-plugin-persistedstate** - 状态持久化插件

### 工具库
- **axios** - HTTP 客户端
- **dayjs** - 轻量级时间处理库
- **lodash** - JavaScript 实用工具库
- **getopts** - 命令行参数解析

### 代码质量
- **ESLint** - JavaScript 代码检查工具
- **Prettier** - 代码格式化工具

## 项目结构

```
yuindex/
├── src/                      # 源代码目录
│   ├── assets/              # 静态资源
│   ├── components/          # Vue 组件
│   │   └── yu-terminal/    # 终端组件
│   ├── configs/             # 配置文件
│   │   └── routes/         # 路由配置
│   ├── core/                # 核心功能
│   │   ├── commands/       # 命令集
│   │   ├── commandRegister/ # 命令注册器
│   │   └── commandExecutor/ # 命令执行器
│   ├── pages/               # 页面组件
│   ├── plugins/             # 第三方插件
│   ├── utils/               # 工具函数
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── public/                  # 公共静态资源
├── build/                   # 构建相关
├── .npmrc                   # pnpm 配置
├── package.json            # 项目配置
├── vite.config.ts          # Vite 配置
└── tsconfig.json           # TypeScript 配置
```

## 为什么选择 pnpm？

1. **性能优异** - 安装速度比 npm/yarn 快 3 倍
2. **节省磁盘空间** - 硬链接机制，节省 70% 存储空间
3. **严格的依赖管理** - 避免幽灵依赖问题
4. **完美兼容** - 支持 Node.js 最新版本
5. **现代化** - 前端开发的最佳实践

## 二次开发指南

### 开发新命令

1. 在 `src/core/commands/` 下创建新目录（命令英文名）
2. 编写命令定义文件 `xxxCommand.ts`
3. 如有子命令，放在 `subCommands/` 目录
4. 在 `commandRegister` 中注册新命令
5. 测试验证

### 示例命令结构

```typescript
// src/core/commands/mycommand/myCommand.ts
import { CommandType } from '@/core/command';

const myCommand: CommandType = {
  func: 'my',
  name: '我的命令',
  desc: '这是一个示例命令',
  options: [
    {
      key: 'option',
      desc: '选项说明',
      alias: ['o'],
      type: 'string',
      required: false,
    }
  ],
  action(options, terminal) {
    // 命令逻辑
    terminal.writeTextSuccessResult('执行成功！');
  },
};

export default myCommand;
```

### 自定义终端组件

终端组件位于 `src/components/yu-terminal/`，你可以：
- 修改终端样式（YuTerminal.vue）
- 添加新的快捷键
- 自定义输出格式
- 扩展终端功能

### 修改主题和样式

1. 背景图片：修改 `src/configs/` 中的配置
2. 终端样式：编辑 `src/components/yu-terminal/` 组件
3. 全局样式：修改 `src/App.vue` 中的样式

## 常见问题

### 依赖安装失败

```bash
# 清理缓存后重试
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 端口被占用

修改 `vite.config.ts` 中的 `server.port` 配置

### 构建错误

```bash
# 检查 TypeScript 类型
pnpm tsc

# 查看详细错误
pnpm build --debug
```

## 部署生产环境

```bash
# 1. 构建生产版本
pnpm build

# 2. 生成的文件在 dist/ 目录
# 3. 将 dist/ 目录部署到你的 Web 服务器
```

## 相关资源

- [官方项目地址](https://github.com/liyupi/yuindex)
- [在线演示](http://yuindex.yupi.icu)
- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Ant Design Vue 文档](https://antdv.com/)
- [pnpm 文档](https://pnpm.io/)

## 许可证

MIT License

---

**部署完成时间**: 2025-12-23
**项目路径**: ~/dev/frontend/learning-project/HomeShell
**Node.js 版本**: v24.12.0
**pnpm 版本**: v10.26.1
