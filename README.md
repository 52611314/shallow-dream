# 🌊 Shallow Dream — 浅梦写作助手

AI 驱动的智能写作助手，基于 LangGraph Agent 编排，集成 RAG 知识库、多工具调用与对话记忆，助你轻松完成各类文本创作任务。

## ✨ 特性

- **🤖 AI 智能对话** — 基于 DeepSeek V4 大语言模型，支持多轮对话与上下文记忆
- **🔧 丰富的写作工具** — 大纲生成、文本续写、润色优化、语法检查、字数统计、人物提取
- **📚 RAG 知识库** — 上传文档（.txt / .md）构建私有知识库，基于向量检索增强回答
- **🌐 联网搜索** — 集成 Tavily Search API，获取实时信息与素材
- **💡 灵感保存** — 随时保存闪现的创意灵感到数据库
- **📱 现代化界面** — Next.js + NextUI 构建的响应式前端，支持亮色/暗色主题
- **🖥️ 桌面应用** — 支持 Electron 打包为桌面客户端

## 🏗️ 技术栈

### 前端

| 技术 | 说明 |
|------|------|
| Next.js 16 | React 框架 |
| React 19 | UI 库 |
| NextUI | 组件库 |
| Tailwind CSS 4 | 样式框架 |
| Zustand | 状态管理 |
| Framer Motion | 动画库 |
| react-hook-form + Zod | 表单与校验 |
| Electron | 桌面应用打包 |

### 后端

| 技术 | 说明 |
|------|------|
| FastAPI | Web 框架 |
| LangGraph | Agent 编排 |
| LangChain | LLM 工具链 |
| DeepSeek V4 | 大语言模型 |
| PostgreSQL + pgvector | 数据库 & 向量检索 |
| sentence-transformers | 文本向量化（all-MiniLM-L6-v2） |
| Tavily Search API | 联网搜索 |

## 📁 项目结构

```
shallow-dream/
├── backend/                  # 后端服务
│   ├── app/
│   │   ├── agent/            # Agent 编排（LangGraph）
│   │   │   ├── graph.py      # 状态图定义
│   │   │   ├── nodes.py      # 决策/检索/回答节点
│   │   │   ├── tools.py      # 工具函数实现
│   │   │   └── state.py      # Agent 状态定义
│   │   ├── api/              # API 路由
│   │   │   ├── chat.py       # 对话接口
│   │   │   └── documents.py  # 文档管理接口
│   │   ├── core/             # 核心配置
│   │   │   ├── config.py     # 环境变量加载
│   │   │   └── database.py   # 数据库连接与操作
│   │   ├── models/           # 数据模型
│   │   ├── prompts/          # 提示词模板
│   │   └── main.py           # 应用入口
│   ├── model/                # 本地 Embedding 模型
│   └── requirements.txt      # Python 依赖
├── frontend/                 # 前端应用
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx          # 首页（着陆页）
│   │   ├── layout.tsx        # 根布局
│   │   ├── workspace/        # 工作区页面
│   │   └── api/chat/         # 前端 API 代理
│   ├── components/           # 组件
│   │   ├── chat/             # 聊天组件
│   │   ├── sidebar/          # 侧边栏组件
│   │   ├── layouts/          # 布局组件
│   │   └── ui/               # 通用 UI 组件
│   └── package.json
├── docs/                     # 文档
│   └── 开发日志.md            # 开发日志
├── .env                      # 环境变量
└── LICENSE                   # MIT 许可证
```

## 🚀 快速开始

### 前置要求

- Python 3.10+
- Node.js 18+
- PostgreSQL（需安装 pgvector 扩展）

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd shallow-dream
```

### 2. 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 下载 Embedding 模型（如尚未下载）
# 模型将存放在 backend/model/all-MiniLM-L6-v2/

# 配置环境变量（编辑 .env 文件）
# DEEPSEEK_API_KEY=your_key
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname
# TAVILY_API_KEY=your_key

# 启动数据库（确保 PostgreSQL 已运行且 pgvector 扩展已启用）

# 启动后端服务
uvicorn app.main:app --reload
```

后端服务运行在 `http://localhost:8000`

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用运行在 `http://localhost:3000`

### 4. 打开浏览器

访问 `http://localhost:3000` 开始使用。

## 🔌 API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 根路径 |
| GET | `/health` | 健康检查 |
| POST | `/chat` | 发送对话消息 |
| POST | `/documents/upload` | 上传文档到知识库 |
| GET | `/documents/list` | 列出已导入文档 |
| DELETE | `/documents/clear` | 清空知识库 |

## 🛠️ 可用工具

Agent 内置了以下写作工具，LLM 会根据用户意图自动决策调用：

| 工具 | 功能 | 说明 |
|------|------|------|
| `generate_outline` | 生成大纲 | 支持自定义章节数、子要点数 |
| `continue_writing` | 文本续写 | 支持指定方向、长度、风格 |
| `polish_text` | 文本润色 | 优化表达流畅度与专业性 |
| `check_grammar` | 语法检查 | 检查语法和拼写问题 |
| `get_word_count` | 字数统计 | 统计字数、中文字符数、段落数 |
| `extract_characters` | 人物提取 | 从文本中提取人物设定 |
| `search_materials` | 联网搜索 | 通过 Tavily API 搜索素材 |
| `save_idea` | 保存灵感 | 将灵感存入数据库 |

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

<p align="center">Made with ❤️ and lots of ☕</p>
