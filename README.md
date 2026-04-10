# 个人博客系统

一个可本地运行、也可部署到 Render 的个人博客系统，包含代码笔记、个人日志、爱好追踪三大模块。

## 功能特性

- **代码笔记**：Markdown 编写与渲染，代码高亮，按日期/标签归档
- **个人日志**：富文本编辑，图片上传，按日期归档，支持搜索
- **爱好追踪**：动漫 / 书籍 / 游戏追踪，状态管理，评分与短评
- **Dashboard**：汇总展示最新动态与基础统计

## 技术栈

- **前端**：Vue 3 + Vite + TailwindCSS
- **后端**：Python FastAPI + Uvicorn
- **数据库**：SQLite
- **图片存储**：本地 `uploads/` 目录，或 Render Persistent Disk

## 项目结构

```text
myapp/
├── backend/                # FastAPI 后端
├── frontend/               # Vue3 前端
├── uploads/                # 本地图片存储
├── render.yaml             # Render Blueprint
├── start.bat               # Windows 一键启动
└── README.md
```

## 本地启动

### 1. 环境要求

- Python 3.12+
- Node.js 18+

### 2. 后端启动

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python run.py
```

后端默认运行在 `http://localhost:8000`。

如需自定义环境变量，可参考 `backend/.env.example` 创建 `backend/.env`。

### 3. 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`。

如需自定义 API 地址，可参考 `frontend/.env.example` 创建 `frontend/.env`。

### 4. 一键启动（Windows）

双击运行 `start.bat`，将同时启动前后端服务。

## Render 部署

当前仓库已包含 `render.yaml`，可以按 **后端 Web Service + 前端 Static Site** 的方式部署到 Render。

### 部署拓扑

- **backend**：Render Web Service
- **frontend**：Render Static Site
- **数据盘**：后端挂载 Persistent Disk 到 `/var/data`
- **SQLite**：`/var/data/app.db`
- **上传目录**：`/var/data/uploads`

### 方式一：使用仓库内的 `render.yaml`

1. 将仓库推送到 GitHub。
2. 在 Render 中选择 **New + > Blueprint**。
3. 选择本仓库，导入根目录下的 `render.yaml`。
4. 创建服务时补齐两个环境变量：
   - `CORS_ORIGINS`：填写前端站点地址，例如 `https://your-frontend-site.onrender.com`
   - `VITE_API_BASE_URL`：填写后端 API 地址，例如 `https://your-backend-service.onrender.com/api/v1`
5. 给后端服务挂载 Persistent Disk，挂载路径保持 `/var/data`。
6. 首次创建完成后，如果前后端域名还没确定，先完成创建，再回到 Render 控制台更新环境变量并重新部署一次。

### 方式二：手动创建两个服务

#### 后端（Web Service）

- **Root Directory**：`backend`
- **Build Command**：`pip install -r requirements.txt`
- **Start Command**：`uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**：`/health`
- **Persistent Disk Mount Path**：`/var/data`

后端环境变量：

```env
DATABASE_URL=sqlite:////var/data/app.db
UPLOAD_DIR=/var/data/uploads
CORS_ORIGINS=["https://your-frontend-site.onrender.com"]
```

#### 前端（Static Site）

- **Root Directory**：`frontend`
- **Build Command**：`npm install && npm run build`
- **Publish Directory**：`dist`

前端环境变量：

```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com/api/v1
```

Static Site 需要增加 SPA rewrite，把所有前端路由回退到 `index.html`：

```text
source: /*
destination: /index.html
```

### Render 上线后建议验证

1. 打开后端 `https://<backend>/health`，确认返回 200。
2. 前端首页可正常拉取 Dashboard 数据。
3. 新建一条笔记、日志、爱好，确认读写正常。
4. 上传一张图片，确认 `/uploads/...` 可访问。
5. 直接刷新 `/notes/1`、`/journals/1` 等二级路由，确认不会 404。
6. 重新部署后端后再次检查数据和图片仍然存在。

### 部署限制

- 当前方案仍然使用 **SQLite + 本地上传**，适合单实例、低流量、个人使用场景。
- 后端必须使用支持 **Persistent Disk** 的 Render 方案，否则数据库和上传文件无法持久化。
- 如果未来需要多实例、共享存储或更高并发，再考虑迁移到 Postgres + 对象存储。

## API 接口

所有 API 使用 `/api/v1/` 前缀，支持 CORS 跨域。

### 代码笔记
- `GET /api/v1/notes` - 获取笔记列表
- `POST /api/v1/notes` - 创建笔记
- `GET /api/v1/notes/{id}` - 获取笔记详情
- `PUT /api/v1/notes/{id}` - 更新笔记
- `DELETE /api/v1/notes/{id}` - 删除笔记

### 个人日志
- `GET /api/v1/journals` - 获取日志列表（支持关键字搜索与年月筛选）
- `POST /api/v1/journals` - 创建日志
- `GET /api/v1/journals/{id}` - 获取日志详情
- `PUT /api/v1/journals/{id}` - 更新日志
- `DELETE /api/v1/journals/{id}` - 删除日志
- `GET /api/v1/journals/archives` - 获取日志归档

### 爱好追踪
- `GET /api/v1/hobbies` - 获取条目列表（支持类型 / 状态筛选）
- `POST /api/v1/hobbies` - 创建条目
- `GET /api/v1/hobbies/{id}` - 获取条目详情
- `PUT /api/v1/hobbies/{id}` - 更新条目
- `DELETE /api/v1/hobbies/{id}` - 删除条目
- `GET /api/v1/hobbies/stats` - 获取爱好统计

### Dashboard
- `GET /api/v1/dashboard` - 获取统计数据

### 文件上传
- `POST /api/v1/upload` - 上传图片

## 配置说明

### 后端配置

参考 `backend/.env.example`：

- `DATABASE_URL`：SQLite 数据库路径
- `UPLOAD_DIR`：图片上传目录
- `CORS_ORIGINS`：允许的跨域来源
- `APP_NAME`：应用名称
- `API_V1_PREFIX`：API 前缀

### 前端配置

参考 `frontend/.env.example`：

- `VITE_API_BASE_URL`：后端 API 地址

## 主题切换

支持深色 / 浅色主题切换，点击右上角主题按钮即可切换。

## 移动端适配

全站响应式设计，支持移动端访问。

## 数据备份

- 本地开发：备份 `backend/blog.db` 与 `uploads/`
- Render 部署：备份 `/var/data/app.db` 与 `/var/data/uploads`

## 预留接口

- `/api/v1/sync` - 数据同步接口（预留位置）
- WebDAV 挂载支持（预留位置）
