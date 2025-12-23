# 🚀 HomeShell 部署前检查清单

## ✅ 已完成的准备工作

### 1. 项目重命名
- [x] package.json 改为 homeশell
- [x] index.html 标题更新
- [x] manifest.json 浏览器扩展配置
- [x] 项目目录重命名为 HomeShell
- [x] README.md 完全重写
- [x] 所有文档路径更新

### 2. Git 和部署配置
- [x] .gitignore 完善（排除敏感文件）
- [x] .vercelignore 创建（排除server目录）
- [x] pnpm 包管理器配置
- [x] Git 配置文档准备（GIT_SETUP.md）

### 3. 版权和许可
- [x] MIT License 保留
- [x] README 中添加致谢原作者
- [x] 明确标注基于 YuIndex 二次开发

### 4. 文档完善
- [x] REFACTOR_PLAN.md - 项目改造计划
- [x] MONOREPO_STRATEGY.md - Server 处理策略
- [x] GIT_SETUP.md - Git 配置指南
- [x] DEPLOYMENT_CHECKLIST.md - 本文档

## 📋 在另一个 Session 执行的部署步骤

### Step 1: Git 初始化和配置

```bash
# 1. 配置 Git（如果还没配置）
git config --global user.name "你的名字"
git config --global user.email "your-email@example.com"

# 2. 生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub
# 复制公钥到 GitHub Settings > SSH Keys

# 3. 测试 GitHub 连接
ssh -T git@github.com
```

### Step 2: 本地 Git 仓库设置

```bash
cd ~/dev/frontend/learning-project/HomeShell

# 删除原来的 .git（如果有）
rm -rf .git

# 初始化新的 Git 仓库
git init

# 查看状态（确保没有敏感文件）
git status

# 添加所有文件
git add .

# 首次提交
git commit -m "chore: initialize HomeShell project

- Rename project from YuIndex to HomeShell
- Migrate package manager from yarn to pnpm
- Add Vercel deployment configuration
- Update README with project information
- Configure for frontend-only deployment

Based on YuIndex by liyupi (https://github.com/liyupi/yuindex)"
```

### Step 3: 创建 GitHub 仓库

**在 GitHub 网页操作：**

1. 访问 https://github.com/new
2. 配置：
   - Repository name: `homeshell`
   - Description: `智能浏览器起始页 - 图形化界面与终端完美结合`
   - 公开/私有: **Public**（简历展示建议公开）
   - ❌ 不要勾选 "Initialize with README"
   - ❌ 不要选择 .gitignore
   - ❌ 不要选择 License
3. 点击 "Create repository"

### Step 4: 推送代码到 GitHub

```bash
cd ~/dev/frontend/learning-project/HomeShell

# 添加远程仓库（替换你的用户名）
git remote add origin git@github.com:你的用户名/homeshell.git

# 设置主分支为 main
git branch -M main

# 推送代码
git push -u origin main

# 验证推送成功
git remote -v
git log --oneline
```

### Step 5: Vercel 部署

#### 方式一：网页部署（推荐）

1. 访问 https://vercel.com
2. 点击 "Import Project"
3. 选择 GitHub，授权访问
4. 选择 `homeshell` 仓库
5. 配置项目：
   ```
   Project Name: homeshell
   Framework Preset: Vite
   Root Directory: ./
   Build Command: pnpm build
   Output Directory: dist
   Install Command: pnpm install
   Node.js Version: 24.x
   ```
6. 点击 "Deploy"
7. 等待部署完成（约2-3分钟）
8. 获取部署 URL：`https://homeshell.vercel.app`

#### 方式二：CLI 部署（可选）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
cd ~/dev/frontend/learning-project/HomeShell
vercel --prod

# 按照提示操作
```

### Step 6: 配置自动部署

Vercel 会自动为你配置：
- ✅ Push 到 main 分支自动部署
- ✅ PR 预览部署
- ✅ HTTPS 自动配置
- ✅ CDN 全球加速

## 🔍 部署前最终检查

### 文件检查

```bash
cd ~/dev/frontend/learning-project/HomeShell

# 检查是否有 node_modules（不应该有）
ls -la | grep node_modules

# 检查是否有 dist（不应该有）
ls -la | grep dist

# 检查 .gitignore
cat .gitignore

# 检查 .vercelignore
cat .vercelignore

# 检查 package.json
cat package.json | grep "name\|version\|description"

# 检查敏感文件（不应该被提交）
find . -name ".env*" -o -name "*secret*" -o -name "*password*" 2>/dev/null
```

### 构建测试

```bash
cd ~/dev/frontend/learning-project/HomeShell

# 清理
rm -rf dist

# 安装依赖
pnpm install

# 本地构建测试
pnpm build

# 检查构建产物
ls -la dist/

# 本地预览
pnpm preview
# 访问 http://localhost:4173 测试
```

### 代码审查

需要手动确认：
- [ ] 没有硬编码的 API 密钥
- [ ] 没有个人敏感信息
- [ ] 所有 "yourusername" 替换为实际用户名
- [ ] 所有 "Your Name" 替换为实际姓名
- [ ] 所有 "your-email@example.com" 替换为实际邮箱
- [ ] manifest.json 中的 homepage_url 正确
- [ ] README 中的链接全部有效

## 📝 部署后操作

### 1. 更新 README

将 Vercel URL 添加到 README：

```markdown
## 🌐 在线演示

访问：https://homeshell.vercel.app
```

### 2. 添加项目截图

```bash
# 访问部署的网站，截图
# 保存到 docs/screenshots/
# 更新 README 中的截图部分
```

### 3. 更新 manifest.json

```json
{
  "homepage_url": "https://homeshell.vercel.app"
}
```

### 4. 配置自定义域名（可选）

在 Vercel 项目设置中：
- Settings → Domains
- 添加你的域名
- 配置 DNS CNAME 记录

### 5. 提交更新

```bash
git add README.md public/manifest.json
git commit -m "docs: add deployment URL and screenshots"
git push
```

## 📊 简历展示建议

### 项目描述

```
HomeShell - 智能浏览器起始页

【项目简介】
基于开源项目 YuIndex 进行深度二次开发，新增图形化起始页功能，
实现图形界面与终端的无缝切换，优化用户体验。

【技术栈】
前端：Vue 3, TypeScript, Vite, Pinia, Ant Design Vue
工具：pnpm, Git, Vercel CI/CD

【核心贡献】
1. 架构优化：迁移到 pnpm，减少 70% 磁盘占用，提升构建速度
2. 功能创新：设计并实现图形化起始页（开发中）
3. 工程化：配置 Vercel 自动化部署，实现 git push 即上线
4. 代码重构：优化依赖管理，完善项目文档

【项目成果】
- 在线地址：https://homeshell.vercel.app
- GitHub：https://github.com/yourusername/homeshell
- 开源协议：MIT
```

### 面试要点

**技术深度：**
- Vue 3 Composition API 的应用
- TypeScript 类型系统设计
- Vite 构建优化
- Pinia 状态管理
- 命令行参数解析实现

**工程能力：**
- Monorepo 项目结构设计
- CI/CD 自动化部署
- 依赖管理优化
- Git 工作流规范

**创新点：**
- 图形化 + 终端双模式交互
- 终端唤出/隐藏动画
- 插件化命令系统

**不要说：**
- "从零开发"
- "完全原创"
- "独立完成所有功能"

**要说：**
- "基于开源项目二次开发"
- "重点贡献在于..."
- "优化和扩展了..."

## 🐛 常见问题

### Q: Vercel 部署失败

**检查：**
1. package.json 的 build 脚本
2. Node.js 版本是否指定
3. pnpm-lock.yaml 是否提交
4. Vercel 日志错误信息

### Q: 构建成功但页面空白

**检查：**
1. 浏览器控制台错误
2. Vite 的 base 配置
3. 静态资源路径

### Q: Git 推送失败

**检查：**
1. SSH 密钥是否配置
2. 远程仓库地址是否正确
3. 分支名是否正确（main vs master）

### Q: 想要撤销某次提交

```bash
# 撤销最后一次 commit（保留更改）
git reset --soft HEAD~1

# 撤销最后一次 commit（删除更改，危险！）
git reset --hard HEAD~1
```

## ✅ 最终确认

部署前请确认：

- [ ] 已阅读 GIT_SETUP.md 并配置 Git
- [ ] 已阅读 MONOREPO_STRATEGY.md 了解 server 处理
- [ ] 本地 `pnpm build` 成功
- [ ] 本地 `pnpm preview` 可以访问
- [ ] 所有个人信息已替换
- [ ] README 内容准确无误
- [ ] 了解版权和许可要求
- [ ] 准备好在另一个 session 执行部署

## 🎯 下一步

1. **立即执行：** 在新 session 按照本文档部署
2. **部署后：** 更新 README 添加在线地址
3. **优化：** 添加项目截图和详细文档
4. **开发：** 开始实现图形化起始页功能
5. **推广：** 在简历和作品集中展示

---

**准备时间：** 2025-12-23
**预计部署时间：** 20-30 分钟
**祝部署顺利！** 🚀
