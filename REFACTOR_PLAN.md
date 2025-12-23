# Homeshell 项目改造计划

## 项目概述

**原项目**: YuIndex by 程序员鱼皮
**新项目**: Homeshell（基于 YuIndex 二次开发）
**核心创新**: 图形化浏览器起始页 + 可唤出/隐藏的终端

## ⚠️ 关键法律和道德问题

### 开源协议遵守（必须！）

原项目使用 MIT License，你必须：

1. ✅ **保留** LICENSE 文件（原样不动）
2. ✅ **保留** 代码中的版权声明
3. ✅ **添加** "Based on YuIndex" 说明
4. ✅ **记录** 你的修改和贡献

### 正确的版权声明

```markdown
# Homeshell

基于 [YuIndex](https://github.com/liyupi/yuindex) by 程序员鱼皮 进行二次开发

## 原创改进
- 新增图形化浏览器起始页
- 重构终端唤出/隐藏交互
- 优化依赖管理（切换到 pnpm）
- [其他你的改进...]

## 致谢
感谢 [程序员鱼皮](https://github.com/liyupi) 提供的优秀开源项目。
```

## 📝 完整改造清单

### Phase 1: Git 环境配置

```bash
# 1. 配置 Git 用户信息（替换成你的）
git config --global user.name "你的名字"
git config --global user.email "your-email@example.com"

# 2. 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your-email@example.com"
# 按回车使用默认路径，可以设置密码（推荐）

# 3. 添加 SSH 密钥到 GitHub
cat ~/.ssh/id_ed25519.pub
# 复制输出，在 GitHub Settings > SSH Keys 中添加

# 4. 测试连接
ssh -T git@github.com
```

### Phase 2: 项目重命名

需要修改的文件：

#### 1. package.json
```json
{
  "name": "homeshell",
  "description": "智能浏览器起始页 - 图形化界面与终端完美结合",
  "version": "1.0.0",
  "author": "你的名字",
  ...
}
```

#### 2. index.html
```html
<title>Homeshell - 你的智能浏览器起始页</title>
```

#### 3. public/manifest.json
```json
{
  "name": "Homeshell",
  "short_name": "Homeshell",
  "description": "智能浏览器起始页",
  ...
}
```

#### 4. README.md（完全重写）
- 项目介绍
- 核心特性（强调你的创新）
- 技术栈
- 快速开始
- 开发计划
- 致谢原项目

#### 5. 代码中的欢迎信息
- `src/core/commands/terminal/config/welcomeCommand.ts`
- 修改欢迎词、介绍等

#### 6. favicon 和 logo
- 设计新的 logo
- 替换 `public/favicon.ico`

### Phase 3: 代码清理

#### 需要移除的内容：
1. ❌ 移除后端代码（server 目录）- 你说只用前端
2. ❌ 移除原作者的推广信息（如星球推广）
3. ❌ 移除不需要的命令（如 ikun 等娱乐命令）

#### 需要保留的内容：
1. ✅ LICENSE 文件
2. ✅ 代码注释中的作者信息
3. ✅ 核心架构和逻辑

#### 需要添加的内容：
1. ✅ 你的联系方式
2. ✅ 开发计划
3. ✅ 改进记录

### Phase 4: Git 初始化

```bash
# 1. 进入项目目录
cd ~/dev/frontend/learning-project/HomeShell

# 2. 初始化 Git（如果已有 .git，先删除原来的）
rm -rf .git
git init

# 3. 创建 .gitignore（检查是否完善）
# 确保包含：node_modules、dist、.env、*.log 等

# 4. 首次提交
git add .
git commit -m "chore: initialize Homeshell project based on YuIndex"
```

### Phase 5: GitHub 仓库创建

```bash
# 1. 在 GitHub 网页创建新仓库
# 仓库名：homeshell
# 描述：Smart browser homepage with integrated terminal
# 公开/私有：建议公开（简历更有说服力）
# 不要初始化 README、.gitignore、LICENSE（本地已有）

# 2. 连接远程仓库
git remote add origin git@github.com:你的用户名/homeshell.git
git branch -M main
git push -u origin main
```

### Phase 6: Vercel 部署

#### 方式一：通过 Vercel 网页（推荐）
1. 访问 https://vercel.com
2. 用 GitHub 账号登录
3. Import Project
4. 选择 homeshell 仓库
5. 配置：
   - Framework Preset: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
   - Node.js Version: 24.x

#### 方式二：通过 Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Phase 7: 持续开发工作流

```bash
# 1. 创建功能分支
git checkout -b feature/graphical-homepage

# 2. 开发...

# 3. 提交（使用规范的 commit message）
git add .
git commit -m "feat: add graphical homepage with terminal toggle"

# 4. 推送
git push origin feature/graphical-homepage

# 5. GitHub 创建 PR

# 6. 合并到 main 后，Vercel 自动部署
```

## 🎯 Commit Message 规范

使用 Conventional Commits：

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具链
```

示例：
```bash
git commit -m "feat: add graphical homepage with terminal toggle button"
git commit -m "refactor: migrate from yarn to pnpm"
git commit -m "docs: update README with new project info"
```

## 📊 简历上的正确表述

### ❌ 错误示例
- "独立开发了 Homeshell 浏览器主页项目"
- "从零实现了 Web 终端"

### ✅ 正确示例

**项目经历：Homeshell - 智能浏览器起始页**

**项目描述**：
基于开源项目 YuIndex 进行深度二次开发，新增图形化起始页功能，实现终端与图形界面的无缝切换，优化用户体验。

**技术栈**：
Vue 3、TypeScript、Vite、Pinia、Ant Design Vue、pnpm

**核心贡献**：
1. **架构改进**：将包管理从 Yarn 迁移到 pnpm，优化依赖管理，减少 70% 磁盘占用
2. **功能创新**：设计并实现图形化起始页，支持终端快速唤出/隐藏，提升交互体验
3. **工程化**：配置 Vercel 自动化部署，实现 git push 即上线的 CI/CD 流程
4. **性能优化**：[你实际做的优化...]
5. **代码重构**：[你实际重构的部分...]

**项目成果**：
- 项目部署在 Vercel，访问地址：https://homeshell.vercel.app
- GitHub 仓库：https://github.com/你的用户名/homeshell
- [可选] Star 数、访问量等数据

## 🚨 需要避免的坑

### 1. 不要提交敏感信息
检查 .gitignore 包含：
```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.vscode/
.idea/
```

### 2. 不要提交大文件
- node_modules（已在 .gitignore）
- 构建产物 dist（已在 .gitignore）
- 大图片（压缩后再提交）

### 3. 不要删除原作者版权
- 保留 LICENSE
- 保留代码注释
- 在 README 中致谢

### 4. Vercel 部署问题
- 确保 package.json 的 build 脚本正确
- 检查 Node.js 版本兼容性
- 环境变量在 Vercel 项目设置中配置

### 5. 域名问题
- Vercel 提供免费 .vercel.app 域名
- 可以绑定自定义域名（需要 DNS 配置）
- 简历上建议先用 Vercel 域名

## 📅 开发里程碑

### Milestone 1: 基础重构（1-2天）
- [x] 项目重命名
- [x] Git 初始化
- [x] GitHub 仓库创建
- [x] Vercel 首次部署
- [x] README 重写

### Milestone 2: 图形化起始页（1周）
- [ ] 设计 UI/UX
- [ ] 实现布局组件
- [ ] 添加常用网站卡片
- [ ] 实现终端唤出/隐藏动画
- [ ] 响应式适配

### Milestone 3: 功能增强（持续）
- [ ] 添加搜索聚合
- [ ] 天气 API 集成
- [ ] 待办事项同步
- [ ] 自定义主题系统
- [ ] 快捷键系统增强

## 🔗 有用的资源

- Vercel 文档：https://vercel.com/docs
- Git 最佳实践：https://www.conventionalcommits.org/
- Vue 3 文档：https://vuejs.org/
- TypeScript 手册：https://www.typescriptlang.org/docs/

---

**创建时间**: 2025-12-23
**预计完成时间**: 根据实际开发进度
