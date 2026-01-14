# 开发指南

本篇文档记录本地开发环境配置、启动方式以及常见问题处理。

## 环境要求

- Node.js >= 18.0.0（当前使用 v24.12.0）
- pnpm >= 8.0.0（项目指定 pnpm@9.15.4）

## 快速启动

### 1. 安装依赖

```bash
# 清理旧依赖（迁移后首次推荐）
rm -rf node_modules .vite

# 安装依赖
pnpm install
```

### 2. 启动开发服务器

```bash
# 固定端口 3000，监听所有网卡（便于 Windows/Cursor 访问）
pnpm dev --host 0.0.0.0 --port 3000
```

服务启动后访问：

- WSL 内：`http://localhost:3000/`
- Windows/Cursor Browser：`http://localhost:3000/` 或 `http://<WSL-IP>:3000/`

**WSL IP 查询**：

```bash
hostname -I | awk '{print $1}'
```

### 3. 常用 tmux 操作（后台运行）

```bash
# 启动新会话
tmux new-session -d -s homeshell-dev "cd /home/wuqi/dev/learning/homeshell && pnpm dev --host 0.0.0.0 --port 3000"

# 查看会话输出
tmux capture-pane -t homeshell-dev -p

# 杀掉会话
tmux kill-session -t homeshell-dev

# 列出所有会话
tmux list-sessions
```

## 后端依赖说明

本项目为前后端分离架构，前端默认请求后端 `http://localhost:7345/api`。

**当前配置**：

- 前端开发环境 baseURL：`http://localhost:7345/api`（见 `src/plugins/myAxios.ts`）
- 本地开发**不强制要求启动后端**，所有 `/api/*` 请求会报网络错误，但不影响前端页面渲染

**受影响功能（无后端时会报错但可忽略）**：

- 用户登录/注册/获取当前用户（`/user/*`）
- 翻译（`/fanyi/*`）
- 音乐热榜（`/music/*`）
- 随机壁纸（`/background/*`）

如需完整功能，请参考 `server/` 目录启动后端服务（需 MySQL + Redis）。

## 常见问题

### 1. 端口占用

**错误**：`EADDRINUSE: address already in use :::3000`

**处理**：

```bash
# 查找占用进程
lsof -i :3000

# 或使用 ss
ss -lntp | grep 3000

# 杀掉占用进程（确认后可执行）
kill <PID>
```

### 2. localhost 不可访问（WSL 侧正常，Windows 侧不通）

**可能原因**：

- WSL2 localhost 转发未启用
- Windows 防火墙拦截
- 代理软件占用端口

**处理**：

1. 确认 Vite 已用 `--host 0.0.0.0` 启动（绑定所有网卡）
2. 尝试用 WSL IP 访问：`http://$(hostname -I | awk '{print $1}'):3000`
3. 检查 Windows 防火墙设置
4. 重启 WSL（Windows PowerShell）：
   ```powershell
   wsl --shutdown
   # 然后重新打开 WSL 终端
   ```

### 3. 热更新（HMR）不生效

**可能原因**：

- WSL inotify 监听限制
- 项目在 Windows 挂载路径（如 `/mnt/c/`）

**处理**：

1. 确保项目在 WSL 文件系统内（如 `~/projects/`）
2. 启用 polling（增加 CPU 开销）：
   ```bash
   CHOKIDAR_USEPOLLING=1 pnpm dev --host 0.0.0.0 --port 3000
   ```
3. 或在 `vite.config.ts` 配置：
   ```ts
   export default defineConfig({
     server: {
       watch: {
         usePolling: true,
       },
     },
   });
   ```

### 4. 依赖安装失败（二进制/原生模块）

**处理**：

```bash
# 清理后重新安装
rm -rf node_modules .vite pnpm-lock.yaml
pnpm install
```

如仍有问题，检查 Node.js 版本是否与项目要求匹配。

### 5. `vite.config.ts` 报错找不到 `build/chromeExtension`

**状态**：已确认 `build/chromeExtension.ts` 存在于项目中，普通开发不受影响。

## 目录结构

```
homeshell/
├── src/                 # 前端源码
├── server/              # 后端源码（可选启动）
├── doc/                 # 文档
│   ├── commands.md     # 命令列表
│   └── dev.md          # 本开发指南
├── dist/               # 构建产物
├── node_modules/       # 依赖
├── vite.config.ts      # Vite 配置
├── package.json        # 项目配置
└── pnpm-lock.yaml      # pnpm 锁文件
```

## 构建生产版本

```bash
pnpm build
```

产物位于 `dist/` 目录。
