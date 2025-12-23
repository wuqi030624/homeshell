# YuIndex 快速开始

## 一键启动

```bash
cd ~/dev/frontend/learning-project/HomeShell
pnpm dev
```

访问 http://localhost:3000/

## 常用命令

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm preview          # 预览生产构建

# 代码质量
pnpm tsc              # TypeScript 类型检查

# 浏览器扩展
pnpm build:crx        # 构建浏览器扩展
pnpm dev:crx          # 开发模式（监听）
```

## 体验 Web 终端

在浏览器中打开项目后，尝试输入以下命令：

```bash
# 搜索相关
baidu 程序员鱼皮        # 百度搜索
github yuindex         # GitHub 搜索
goto yupi.icu          # 跳转到网站

# 工具命令
todo                   # 待办事项
date                   # 显示日期
fanyi hello            # 翻译
ping baidu.com         # 网络检测

# 娱乐命令
music 坤坤             # 听音乐
moyu                   # 摸鱼小游戏
ikun                   # 坤坤彩蛋

# 系统命令
help                   # 查看帮助
history                # 命令历史
background             # 更换背景
clear                  # 清屏

# 快捷键
Ctrl + L               # 清屏
Ctrl + O               # 折叠/展开输出
Tab                    # 命令补全
↑ ↓                    # 历史命令
```

## 目录结构速览

```
yuindex/
├── src/
│   ├── core/commands/      # 🔥 在这里添加新命令
│   ├── components/         # Vue 组件
│   └── pages/             # 页面
├── package.json           # 项目配置
├── vite.config.ts        # Vite 配置
└── DEPLOYMENT.md         # 详细部署文档
```

## 二次开发快速入门

### 添加新命令（3步）

1. **创建命令文件**
   ```bash
   mkdir -p src/core/commands/mycommand
   touch src/core/commands/mycommand/myCommand.ts
   ```

2. **编写命令逻辑**
   ```typescript
   import { CommandType } from '@/core/command';

   const myCommand: CommandType = {
     func: 'my',
     name: '我的命令',
     desc: '命令描述',
     action(options, terminal) {
       terminal.writeTextSuccessResult('Hello World!');
     },
   };

   export default myCommand;
   ```

3. **注册命令**
   在 `src/core/commandRegister.ts` 中导入并注册：
   ```typescript
   import myCommand from './commands/mycommand/myCommand';

   const commandList = [
     // ... 其他命令
     myCommand,
   ];
   ```

### 修改终端样式

编辑 `src/components/yu-terminal/YuTerminal.vue`

### 更换背景图片

编辑 `src/configs/background.ts`

## 技术栈

- Vue 3 + TypeScript + Vite 2
- Ant Design Vue 3
- Pinia 2 状态管理
- xterm.js 终端组件

## 获取帮助

- 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解详细信息
- 访问 [原项目仓库](https://github.com/liyupi/yuindex)
- 在终端中输入 `help` 查看所有命令

---

开始探索和定制你的 Web 终端吧！
