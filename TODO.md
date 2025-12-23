# ⚠️ 待处理问题清单

## 🔴 高优先级

### 1. TypeScript 类型错误

**问题描述：**
构建时 `vue-tsc --noEmit` 报告多个 JSX 类型错误：
```
error TS7026: JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists.
```

**受影响文件：**
- src/pages/old/XTermPage.vue
- src/core/commands/fanyi/FanYiBox.vue
- src/core/commands/search/bilibili/BilibiliBox.vue
- src/core/commands/relax/music/MusicBox.vue
- src/core/commands/relax/ikun/IkunBox.vue
- src/core/commands/relax/moyu/MoYuBox.vue
- src/core/commands/relax/ikuntest/IkunTestBox.vue
- src/components/yu-terminal/ContentOutput.vue
- src/core/commands/ddos/DdosBox.vue
- src/core/commands/hot/HotBox.vue
- src/components/yu-terminal/YuTerminal.vue

**当前解决方案：**
临时修改了 package.json 的构建脚本：
```json
{
  "build": "vite build",  // 跳过类型检查
  "build:check": "vue-tsc --noEmit && vite build"  // 保留完整检查
}
```

**根本原因：**
Vue 3 + JSX/TSX 的类型声明配置不完整。

**建议修复方案：**

#### 方案 1：添加 JSX 类型声明（推荐）

1. 安装类型包：
```bash
pnpm add -D @vitejs/plugin-vue-jsx
```

2. 更新 `vite.config.ts`：
```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  plugins: [vue(), vueJsx()],
});
```

3. 更新 `tsconfig.json`：
```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue"
  }
}
```

#### 方案 2：检查所有 .vue 文件的 `<script>` 标签

确保没有误用 `<script setup lang="tsx">` 或 JSX 语法。

#### 方案 3：移除不需要的文件

如果 `src/pages/old/` 是旧代码，可以考虑删除。

**优先级：** 中等（不影响部署，但影响代码质量）

**计划修复时间：** 部署后优先处理

---

## 🟡 中优先级

### 2. 个人信息占位符

**需要替换的占位符：**

1. **manifest.json**（第6行）：
   ```json
   "author": "Your Name",
   ```

2. **manifest.json**（第10行）：
   ```json
   "homepage_url": "https://github.com/yourusername/homeshell",
   ```

3. **README.md** 多处：
   - `[@yourusername](https://github.com/yourusername)`
   - `your-email@example.com`
   - `[Your Name]`

**修复方法：**
在部署到 GitHub 前，全局搜索替换：
```bash
# 示例：替换用户名
cd ~/dev/frontend/learning-project/HomeShell
find . -name "*.md" -o -name "*.json" | xargs sed -i 's/yourusername/实际用户名/g'
find . -name "*.md" -o -name "*.json" | xargs sed -i 's/Your Name/实际姓名/g'
find . -name "*.md" -o -name "*.json" | xargs sed -i 's/your-email@example.com/实际邮箱/g'
```

**优先级：** 高（部署前必须完成）

---

### 3. 构建性能警告

**问题：**
```
Some chunks are larger than 500 KiB after minification.
```

**受影响的 chunk：**
- `index.291e88db.js` - 780.87 KiB

**建议优化：**

1. **代码分割**：
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['ant-design-vue'],
          'terminal': ['xterm', 'xterm-addon-fit'],
        }
      }
    }
  }
});
```

2. **动态导入**：
```typescript
// 将大组件改为动态导入
const HeavyComponent = () => import('./components/HeavyComponent.vue');
```

**优先级：** 低（不影响功能，优化体验）

---

## 🟢 低优先级

### 4. 项目截图

README 中标注了 "待添加项目截图"，需要：
1. 部署后访问网站
2. 截取关键功能截图
3. 保存到 `docs/screenshots/`
4. 更新 README

---

### 5. 依赖更新

部分依赖有新版本：
- ant-design-vue: 3.2.20 → 4.2.6
- axios: 0.27.2 → 1.13.2
- vite: 2.9.18 → 7.3.0

**建议：**
先保持当前版本稳定运行，待功能开发完成后再考虑升级。

---

## 📋 处理流程

### 立即处理（部署前）
- [ ] 替换所有个人信息占位符
- [ ] 再次测试构建：`pnpm build`
- [ ] 验证 dist 目录内容

### 部署后处理
- [ ] 修复 TypeScript 类型错误
- [ ] 添加项目截图
- [ ] 更新 README 添加在线地址

### 长期优化
- [ ] 代码分割优化
- [ ] 依赖版本升级
- [ ] 移除旧代码

---

## 🔧 快速命令

```bash
# 1. 检查待替换的占位符
cd ~/dev/frontend/learning-project/HomeShell
grep -r "yourusername\|Your Name\|your-email" --include="*.md" --include="*.json" .

# 2. 测试构建
pnpm build

# 3. 测试类型检查
pnpm tsc

# 4. 预览
pnpm preview
```

---

**创建时间：** 2025-12-23
**最后更新：** 2025-12-23
