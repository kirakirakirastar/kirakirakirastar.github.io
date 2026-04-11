# 个人博客系统

一个可直接部署到 GitHub Pages 的纯前端个人博客系统，包含代码笔记、个人日志、爱好追踪三大模块。

数据保存在浏览器 `localStorage`，无需后端服务：
- 上传图片会转成 Data URL 保存在浏览器本地
- 路由使用 Hash 模式，适合 GitHub Pages

## 功能特性

- **代码笔记**：Markdown 编写与渲染，代码高亮，按日期/标签归档
- **个人日志**：富文本编辑，支持本地图片插入，按日期归档，支持搜索
- **爱好追踪**：动漫 / 书籍 / 游戏追踪，状态管理，评分与短评
- **Dashboard**：汇总展示最新动态与基础统计
- **主题切换**：支持深色 / 浅色主题
- **移动端适配**：响应式布局，支持手机访问

## 技术栈

- **前端**：Vue 3 + Vite + TailwindCSS
- **数据存储**：Browser `localStorage`
- **图片存储**：Browser Data URL
- **部署**：GitHub Pages + GitHub Actions

## 项目结构

```text
myapp/
├── .github/workflows/       # GitHub Pages 自动部署工作流
├── frontend/                # Vue 3 前端
└── README.md
```

## 本地开发

### 环境要求

- Node.js 18+

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

默认访问：`http://localhost:5173`

## GitHub Pages 部署

仓库已配置为直接发布到 GitHub Pages，push 后自动构建。

### 启用步骤

1. 将仓库推送到 GitHub（`kirakirastar/kirakirastar.github.io`）。
2. 打开仓库 **Settings > Pages**。
3. 在 **Source** 中选择 **GitHub Actions**。
4. 推送到 `main` 分支后会自动构建并发布站点。

### 部署地址

```text
https://kirakirastar.github.io/
```

由于使用 Hash 路由，页面地址类似：

```text
https://kirakirastar.github.io/#/notes
https://kirakirastar.github.io/#/journals
https://kirakirastar.github.io/#/hobbies
```

### 发布后建议验证

1. 首页可以正常打开。
2. 刷新 `#/notes`、`#/journals`、`#/hobbies` 不会 404。
3. 能创建、编辑、删除笔记。
4. 能创建、编辑、删除日志。
5. 能创建、编辑、删除爱好条目。
6. 能上传图片并正常回显。

## 数据说明

- 所有内容都保存在当前浏览器的 `localStorage` 中。
- 清除浏览器站点数据后，内容会被删除。
- 不同浏览器、不同设备之间不会自动同步。
- 图片以 Data URL 形式存储；如果上传大量大图，浏览器存储空间会更快被占满。
