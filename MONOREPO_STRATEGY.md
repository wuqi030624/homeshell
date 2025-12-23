# Server 目录处理策略

## 问题分析

你有一个前端项目，但包含了后端代码（server/），短期不会用但想保留。

## 专业解决方案（3种）

### 方案 1：Monorepo 结构 + Vercel 配置（推荐⭐⭐⭐⭐⭐）

**结构：**
```
homeshell/
├── frontend/          # 前端代码（原 src/、public/ 等）
├── server/           # 后端代码（保留）
├── package.json      # 根目录配置
└── vercel.json       # Vercel 配置
```

**优点：**
- ✅ 前后端代码在同一仓库
- ✅ Vercel 只构建和部署前端
- ✅ 未来可以轻松部署后端（Vercel Functions）
- ✅ 统一的版本控制
- ✅ 专业的项目结构

**缺点：**
- ⚠️ 需要重构目录结构（但值得）

**实施步骤：**
```bash
# 1. 创建新目录结构
mkdir frontend
mv src public index.html vite.config.ts tsconfig.json frontend/

# 2. 调整 package.json 中的路径
# 3. 创建 vercel.json
```

**vercel.json 配置：**
```json
{
  "version": 2,
  "buildCommand": "cd frontend && pnpm install && pnpm build",
  "outputDirectory": "frontend/dist",
  "installCommand": "pnpm install",
  "framework": null
}
```

---

### 方案 2：保持现有结构 + .vercelignore（推荐⭐⭐⭐⭐）

**结构：**
```
homeshell/
├── src/              # 前端代码
├── server/           # 后端代码
├── .vercelignore     # 告诉 Vercel 忽略 server
└── package.json
```

**优点：**
- ✅ 不需要重构目录
- ✅ Server 保留但不影响部署
- ✅ 最简单直接

**缺点：**
- ⚠️ Server 代码仍会被 git 追踪（但不部署）
- ⚠️ 增加仓库大小

**实施步骤：**

创建 `.vercelignore`：
```bash
# .vercelignore
server/
*.md
doc/
```

Vercel 会自动识别 Vite 项目并正确构建前端。

---

### 方案 3：分离仓库（推荐⭐⭐⭐）

**结构：**
```
homeshell/            # 前端仓库
homeshell-server/     # 后端仓库（未来使用）
```

**优点：**
- ✅ 前后端完全分离
- ✅ 前端仓库更轻量
- ✅ 符合微服务架构理念

**缺点：**
- ⚠️ 需要管理两个仓库
- ⚠️ 协同开发略复杂

**实施步骤：**
```bash
# 1. 复制 server 到新目录
cp -r server ../homeshell-server

# 2. 删除原项目的 server
rm -rf server

# 3. 创建 homeshell-server 仓库
cd ../homeshell-server
git init
git add .
git commit -m "chore: initialize backend project"
```

---

## 我的推荐：方案 2（.vercelignore）

### 为什么？

1. **最小改动**：不需要重构目录
2. **保留灵活性**：Server 代码还在，随时可以用
3. **部署简单**：Vercel 自动识别 Vite 项目
4. **未来扩展**：可以轻松迁移到方案 1 或 3

### 具体实施

#### 1. 创建 .vercelignore

```bash
# .vercelignore
# 部署时忽略这些文件

# 后端代码
server/

# 文档
doc/
*.md
!README.md

# 开发文件
.vscode/
.idea/
*.drawio

# 临时文件
.git/
```

#### 2. Git 仍然追踪 server

```bash
# .gitignore 中不要加 server/
# 因为你想保留这些代码
```

#### 3. Vercel 配置（可选）

通常 Vercel 会自动识别，但如果需要明确配置：

**创建 `vercel.json`：**
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev",
  "framework": "vite"
}
```

#### 4. package.json 确认

确保有正确的构建脚本：
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview"
  }
}
```

---

## Git 提交策略

### 关于 server/ 的提交

**选项 A：提交但不活跃开发**
```bash
# 提交 server 代码
git add server/
git commit -m "chore: add backend code for future development"

# 之后不再频繁修改
```

**选项 B：使用 Git Submodule（高级）**
```bash
# 将 server 作为子模块
git submodule add git@github.com:username/homeshell-server.git server
```

### 推荐：选项 A

简单直接，server 代码在仓库中但不影响前端部署。

---

## 面试/简历说明

**正确的描述：**

> **HomeShell** - 智能浏览器起始页
>
> - 前后端分离架构，前端使用 Vue 3 + Vite 部署在 Vercel
> - 后端预留 Node.js + Express 接口，使用 Monorepo 管理
> - 通过 .vercelignore 实现前端独立部署
> - 技术栈：Vue 3, TypeScript, Vite, pnpm

这体现了你对**工程化**和**架构设计**的理解。

---

## 实际执行（基于方案 2）

### Step 1: 创建 .vercelignore

```bash
cd ~/dev/frontend/learning-project/HomeShell
cat > .vercelignore << 'EOF'
# 后端代码（保留但不部署）
server/

# 文档
doc/
*.md
!README.md

# 开发工具配置
.vscode/
.idea/
*.drawio

# Git
.git/

# 日志
*.log

# 临时文件
.temp/
EOF
```

### Step 2: 确认 Vite 配置

检查 `vite.config.ts` 是否正确：
```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist'  // 确保输出到 dist
  }
});
```

### Step 3: 测试本地构建

```bash
# 清理之前的构建
rm -rf dist

# 构建
pnpm build

# 检查 dist 目录
ls -la dist/

# 本地预览
pnpm preview
```

### Step 4: Git 提交

```bash
# server 保留在仓库中
git add .
git commit -m "chore: prepare project for deployment with Vercel

- Add .vercelignore to exclude server from deployment
- Keep server code in repo for future development
- Configure for frontend-only Vercel deployment"
```

---

## 未来扩展路径

### 当你准备开发后端时

#### 选项 1：Vercel Functions
将 server 改造为 Serverless Functions：
```
api/
├── user.ts
├── todo.ts
└── search.ts
```

#### 选项 2：单独部署后端
- 部署到 Heroku、Railway、或自己的服务器
- 前端通过 API 调用

#### 选项 3：全栈 Vercel
Vercel 支持前后端一起部署：
```
homeshell/
├── app/          # 前端
├── api/          # 后端 API (Vercel Functions)
└── vercel.json
```

---

## 总结

**立即执行：使用方案 2（.vercelignore）**

1. ✅ 保留 server 目录（不删除）
2. ✅ 创建 .vercelignore
3. ✅ Git 正常提交所有代码
4. ✅ Vercel 只部署前端

**优势：**
- 代码完整性
- 部署灵活性
- 未来扩展性
- 简历展示专业性

**关键点：**
- Git 追踪所有代码
- Vercel 只部署前端
- 架构清晰专业

---

需要我帮你执行这些步骤吗？
