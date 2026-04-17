# ✨ Kirakirastar Personal Dashboard

> **极致美学与生产力的统一。**  
> 这是一个基于 Vue 3 + Supabase 构建的沉浸式个人知识库与生活追踪系统，旨在提供最顶级的文本编辑体验与视觉享受。

![Dashboard Preview](https://raw.githubusercontent.com/kirakirastar/kirakirastar.github.io/main/frontend/public/og-image.png)

---

## 🎨 核心特性：美学第一 (Aesthetics First)

- **🖼️ 实时背景引擎 (Live Background Engine)**：根据当前设置或背景图片，实时提取主色调并动态适配全站 UI 色彩，营造极致沉浸感。
- **🌑 玻璃拟态与深色模式**：完美适配深色/浅色主题，采用现代玻璃拟态（Glassmorphism）设计，细节处见真章。
- **🎇 动效反馈**：内置 Confetti 成功效、平滑页面过渡及微交互动画。

---

## 🚀 功能模块

### 📓 卓越的 Markdown 笔记系统
- **Tiptap 核心**：深度定制的富文本/Markdown 双模编辑器，支持所见即所得。
- **扩展支持**：原生支持 **KaTeX** 数学公式、**Mermaid** 流程图、**Admonitions** 提示框、任务列表。
- **多媒体处理**：支持图片拖拽/粘贴自动上传至 Supabase Storage，支持 BBCode 高级样式扩展。

### 📅 生活记录与追踪
- **个人日志 (Journals)**：支持私密设置，记录点滴情感与灵感，内置字数/阅读时间估算。
- **爱好追踪 (Hobbies)**：系统化管理你的动漫、游戏、书籍评分与短评，带有状态流转管理（想看/在看/已完成）。
- **任务管理 (To-Do)**：支持**循环任务**逻辑，自动处理过期任务并生成下一周期，与 Dashboard 深度集成。

### 📊 数字化看板
- **生产力热力图**：通过 Activity Heatmap 直观展示你过去一年的所有动态。
- **极简打卡**：支持快速 Check-in，追踪每日心境。
- **聚合展示**：Dashboard 汇总展示最新动态、任务统计与公告。

---

## 🛠️ 技术栈

| 领域 | 技术方案 |
| :--- | :--- |
| **前端框架** | Vue 3 (Composition API) + Vite |
| **状态管理** | Pinia + Persistence |
| **样式方案** | Tailwind CSS + Vanilla CSS Variables |
| **后端/数据库** | Supabase (PostgreSQL / Auth / Storage) |
| **编辑器** | Tiptap (ProseMirror) + Markdown-it |
| **工具库** | VueUse, Day.js, Mermaid, KaTeX, DOMPurify |

---

## 📦 项目结构

```text
myapp/
├── supabase/                # 后端定义
│   └── migrations/          # 数据库迁移脚本 (PostgreSQL)
├── frontend/                # Vue 3 前端工程
│   ├── src/
│   │   ├── api/             # Supabase 服务层
│   │   ├── components/      # 复用 UI 与挂件
│   │   ├── hooks/           # 核心逻辑组合式函数 (如 useMarkdownEditor)
│   │   ├── stores/          # Pinia 状态管理
│   │   └── utils/           # 渲染器与工具类
│   └── tailwind.config.js
└── README.md
```

---

## 🏗️ 快速开始

### 1. 环境变量配置
在 `frontend/` 目录下创建 `.env` 文件：
```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名Key
```

### 2. 初始化数据库
将 `supabase/migrations/` 下的 SQL 脚本导入你的 Supabase SQL Editor 或通过 CLI 同步。

### 3. 本地开发
```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 安全与优化

- **代码安全**：集成 DOMPurify 进行 HTML 全量清洗，防止 XSS。
- **性能优化**：编辑器同步支持 Debounce 闭包处理，图片支持自动懒加载。
- **部署**：支持 GitHub Actions 自动部署至 GitHub Pages（需配置 Hash 路由）。

---

## 🤝 致谢与技术支持 (Technical Support & Contributors)

本项目采用 **Vibe Coding** 模式开发，由以下成员共同协作完成：

- **Kirakirastar** (Owner) — 产品设计、核心架构与审美把控。
- **Antigravity** (Google DeepMind) — 提供 Agentic Coding 高级编码环境与 IDE 平台支持。
- **Gemini** (Google) — 核心逻辑优化、全站重构与 AI 驱动开发。
- **Claude** (Anthropic) — 模块化功能实现、复杂逻辑调试。

---

## 📄 License

MIT © [Kirakirastar](https://github.com/kirakirastar)
