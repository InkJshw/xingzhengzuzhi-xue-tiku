# 行政组织学 · 在线题库

基于 React + Tailwind CSS 构建的在线刷题应用，支持桌面端和移动端。

## 功能

- 📝 **四大练习模式**：单选题、多选题、判断题、综合练习
- 🎲 **随机出题**：每次练习题目顺序随机打乱
- ✅ **即时反馈**：提交答案后立即显示对错和正确答案
- 📊 **错题整理**：自动收集错题，支持重做
- 📱 **响应式设计**：电脑、平板、手机均可使用
- 🌙 **暗色主题**：GitHub Dark 风格，护眼舒适

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

## 部署

### GitHub Pages

```bash
# 构建
npm run build

# 推送到 gh-pages 分支
npx gh-pages -d dist
```

### Vercel / Netlify

1. 将项目推送到 GitHub
2. 在 Vercel/Netlify 中导入项目
3. 构建命令：`npm run build`
4. 输出目录：`dist`

### 本地使用

构建后的 `dist` 文件夹可直接用任意静态服务器打开：

```bash
npx serve dist
```

## 技术栈

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 3
- React Router v7
- Lucide React 图标

## 题库信息

- 科目：行政组织学
- 总题量：50 道客观题
- 单选题 20 道 · 多选题 10 道 · 判断题 20 道
