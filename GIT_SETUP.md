# Git 配置指南

## 第一步：配置 Git 用户信息

打开终端，执行以下命令（替换成你的信息）：

```bash
# 设置用户名（会显示在 commit 中）
git config --global user.name "你的名字"

# 设置邮箱（建议使用 GitHub 注册邮箱）
git config --global user.email "your-email@example.com"

# 验证配置
git config --global --list
```

## 第二步：生成 SSH 密钥

### 为什么要用 SSH？
- 更安全（不需要每次输入密码）
- 更方便（自动认证）
- 行业标准

### 生成密钥

```bash
# 生成 ED25519 密钥（推荐，更安全）
ssh-keygen -t ed25519 -C "your-email@example.com"

# 如果系统不支持 ED25519，使用 RSA
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

**交互过程：**
1. 询问保存位置 → 按回车使用默认 `~/.ssh/id_ed25519`
2. 询问密码 → 可以设置（推荐）或直接回车（不设密码）
3. 确认密码 → 再输入一次

### 查看公钥

```bash
# 查看并复制公钥
cat ~/.ssh/id_ed25519.pub

# 或者直接复制到剪贴板（如果有 xclip）
cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard
```

输出类似：
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... your-email@example.com
```

## 第三步：添加 SSH 密钥到 GitHub

### 网页操作：

1. 登录 GitHub
2. 点击右上角头像 → **Settings**
3. 左侧菜单点击 **SSH and GPG keys**
4. 点击 **New SSH key**
5. 填写：
   - Title: `WSL Ubuntu`（或任何帮助你识别的名字）
   - Key: 粘贴刚才复制的公钥（完整的，从 ssh-ed25519 开始）
6. 点击 **Add SSH key**

### 测试连接

```bash
# 测试 GitHub SSH 连接
ssh -T git@github.com
```

**成功的输出：**
```
Hi 你的用户名! You've successfully authenticated, but GitHub does not provide shell access.
```

**如果失败：**
```bash
# 检查 SSH agent 是否运行
eval "$(ssh-agent -s)"

# 添加密钥到 agent
ssh-add ~/.ssh/id_ed25519

# 再次测试
ssh -T git@github.com
```

## 第四步：Git 基础配置（可选但推荐）

```bash
# 设置默认分支名为 main
git config --global init.defaultBranch main

# 设置默认编辑器（vim 或 nano）
git config --global core.editor "vim"

# 彩色输出
git config --global color.ui auto

# 设置换行符处理（Windows/Linux 兼容）
git config --global core.autocrlf input

# 设置默认推送方式
git config --global push.default current
```

## 常见问题

### Q1: Permission denied (publickey)
**原因：** SSH 密钥未正确添加到 GitHub

**解决：**
1. 检查公钥是否正确复制（不要有换行或空格）
2. 确认已添加到 GitHub
3. 检查 SSH agent: `ssh-add -l`

### Q2: ssh-keygen: command not found
**原因：** OpenSSH 未安装

**解决（Ubuntu/WSL）：**
```bash
sudo apt update
sudo apt install openssh-client
```

### Q3: 每次都要输入密码
**原因：** SSH 密钥有密码但未添加到 agent

**解决：**
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

**永久解决（添加到 .bashrc）：**
```bash
echo 'eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519 2>/dev/null' >> ~/.bashrc
```

### Q4: 我想使用 HTTPS 而不是 SSH
**可以，但需要每次输入密码或使用 Personal Access Token**

GitHub 设置：Settings → Developer settings → Personal access tokens → Generate new token

克隆时使用 HTTPS URL：
```bash
git clone https://github.com/username/repo.git
```

## 验证清单

在继续之前，请确认：

- [ ] `git config --global user.name` 显示正确的用户名
- [ ] `git config --global user.email` 显示正确的邮箱
- [ ] `ssh -T git@github.com` 显示认证成功
- [ ] `ls ~/.ssh/` 可以看到 `id_ed25519` 和 `id_ed25519.pub`

全部完成后，你就可以在另一个 session 中进行 GitHub 和 Vercel 部署了。

---

**需要帮助？** 把错误信息发给我，我会帮你排查。
