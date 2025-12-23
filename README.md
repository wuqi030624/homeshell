# 🏠 HomeShell

> 智能浏览器起始页 - 图形化界面与终端完美结合

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Vue 3](https://img.shields.io/badge/vue-3.x-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-4.x-blue.svg)](https://www.typescriptlang.org/)

## ✨ 项目简介

HomeShell 是一个现代化的浏览器起始页项目，结合了图形化界面和命令行终端的优势，为用户提供高效、美观的上网入口。

### 核心特性

- 🎨 **双模式交互** - 图形化界面与终端自由切换
- ⌨️ **命令系统** - 支持自定义命令、参数解析、子命令
- 🚀 **高性能** - 基于 Vue 3 + Vite，秒级启动
- 🎯 **可扩展** - 插件化架构，轻松添加新功能
- 📱 **响应式** - 完美适配各种屏幕尺寸
- 🌈 **主题系统** - 支持自定义背景、颜色主题

### 项目创新

- ✅ **图形化起始页** - 新增常用网站卡片、快捷入口等
- ✅ **终端唤出/隐藏** - 优雅的动画效果，无缝切换
- ✅ **搜索聚合** - 多平台搜索一键直达
- ✅ **工程化优化** - 使用 pnpm 管理依赖，提升开发效率

## 📸 项目截图

_（待添加项目截图）_

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
cd ~/dev/frontend/learning-project/HomeShell
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000/

### 构建生产版本

```bash
pnpm build
```

构建产物在 `dist/` 目录

## 📦 技术栈

### 前端核心

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue 的直观状态管理库

### UI 与组件

- **Ant Design Vue** - 企业级 UI 组件库
- **xterm.js** - 功能强大的终端模拟器

### 工具库

- **axios** - Promise 基础的 HTTP 客户端
- **dayjs** - 轻量级日期处理库
- **lodash** - JavaScript 实用工具库
- **getopts** - 命令行参数解析

## 🎯 已支持命令

### 搜索类

```bash
baidu <关键词>     # 百度搜索
github <关键词>    # GitHub 搜索
google <关键词>    # Google 搜索
bing <关键词>      # Bing 搜索
```

### 工具类

```bash
todo               # 待办事项管理
date               # 显示当前日期时间
fanyi <文本>       # 中英文翻译
ping <网址>        # 网络连接测试
timing             # 定时器
```

### 导航类

```bash
goto <网址>        # 快速跳转到指定网站
space              # 管理常用网站（类似收藏夹）
```

### 娱乐类

```bash
music <歌名>       # 在线音乐播放
moyu               # 摸鱼小游戏
```

### 系统类

```bash
help               # 查看所有命令
history            # 命令历史
background         # 更换背景
clear / Ctrl+L     # 清屏
reset              # 重置配置
```

## 🛠️ 二次开发

### 添加新命令

1. **创建命令文件**

```bash
mkdir -p src/core/commands/mycommand
touch src/core/commands/mycommand/myCommand.ts
```

2. **编写命令定义**

```typescript
import { CommandType } from '@/core/command';

const myCommand: CommandType = {
  func: 'my',
  name: '我的命令',
  desc: '这是一个自定义命令',
  options: [
    {
      key: 'example',
      desc: '示例选项',
      alias: ['e'],
      type: 'string',
      required: false,
    }
  ],
  action(options, terminal) {
    const { example } = options;
    terminal.writeTextSuccessResult(`执行成功！参数：${example}`);
  },
};

export default myCommand;
```

3. **注册命令**

在 `src/core/commandRegister.ts` 中导入并注册：

```typescript
import myCommand from './commands/mycommand/myCommand';

const commandList: CommandType[] = [
  // ... 其他命令
  myCommand,
];
```

### 自定义主题

编辑 `src/configs/themeConfig.ts` 或在终端中使用 `background` 命令。

### 修改欢迎信息

编辑 `src/core/commands/terminal/config/welcomeCommand.ts`

## 📂 项目结构

```
homeshell/
├── src/
│   ├── assets/              # 静态资源
│   ├── components/          # Vue 组件
│   │   └── yu-terminal/    # 终端组件
│   ├── configs/             # 配置文件
│   ├── core/                # 核心功能
│   │   ├── commands/       # 命令集
│   │   ├── commandRegister.ts  # 命令注册
│   │   └── commandExecutor.ts  # 命令执行器
│   ├── pages/               # 页面组件
│   ├── plugins/             # 插件
│   ├── utils/               # 工具函数
│   └── main.ts             # 入口文件
├── public/                  # 公共静态资源
├── server/                  # 后端代码（预留）
├── package.json            # 项目配置
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
└── README.md               # 项目文档
```

## 🚢 部署

### Vercel 部署（推荐）

1. Fork 本仓库到你的 GitHub
2. 在 [Vercel](https://vercel.com) 注册并导入项目
3. 配置构建设置：
   - Framework Preset: `Vite`
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
4. 点击 Deploy

### 其他平台

项目支持部署到任何静态网站托管平台：

- Netlify
- GitHub Pages
- Cloudflare Pages
- 自己的服务器

## 🗺️ 开发路线图

### v1.0 (当前)

- [x] 基础终端功能
- [x] 命令系统
- [x] 项目重命名和品牌化
- [ ] 图形化起始页 UI
- [ ] 终端唤出/隐藏动画

### v1.1 (计划中)

- [ ] 常用网站卡片管理
- [ ] 搜索聚合功能
- [ ] 自定义主题系统
- [ ] 快捷键增强

### v2.0 (未来)

- [ ] 用户系统和数据同步
- [ ] 浏览器扩展版本
- [ ] AI 助手集成
- [ ] 移动端适配
- [ ] 多语言支持

## 🤝 致谢

本项目基于 [YuIndex](https://github.com/liyupi/yuindex) 进行二次开发，感谢 [程序员鱼皮](https://github.com/liyupi) 提供的优秀开源项目。

### 主要改进

- 项目重命名和品牌化
- 包管理器从 Yarn 迁移到 pnpm
- 优化依赖管理和构建配置
- 新增图形化起始页功能（开发中）
- 改进项目结构和工程化配置

## 📄 开源协议

本项目遵循 MIT 协议开源，详见 [LICENSE](./LICENSE) 文件。

原项目 YuIndex 同样使用 MIT 协议。

## 📮 联系方式

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your-email@example.com
- 项目主页: https://github.com/yourusername/homeshell

## ⭐ Star History

如果这个项目对你有帮助，欢迎 Star ⭐

---

**Built with ❤️ by [Your Name]**
