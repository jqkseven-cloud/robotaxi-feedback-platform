# Robotaxi 乘客反馈平台

面向 Robotaxi 运营和产品团队的内部工具，用于管理乘客反馈、分析问题趋势、调用 AI 辅助洞察，并通过工单系统形成可执行闭环。

---

## 1. 功能总览

### 数据仪表盘
- KPI 指标：总反馈数、平均评分、好评/差评占比
- 反馈趋势：按日/周/月查看变化
- 分布分析：城市、路线、反馈类型、情感、评分分布
- 类型明细：不同反馈类型的情感和评分表现

### 反馈列表
- 多维筛选：评分、时间、城市、路线、类型、情感、关键词
- 分页和排序：支持按时间/评分排序
- 详情抽屉：查看单条反馈的完整上下文
- 低分处理入口：在低分反馈详情中可一键创建工单

### AI 智能分析（通义千问）
- 自动分类：对选中的反馈进行分类建议并给出置信度
- 摘要生成：对批量反馈提炼核心问题和代表性用户说法
- 产品建议：自动生成可执行的优化建议

### 工单管理（新增）
- 从低分反馈创建工单（评分 <= 2）
- 工单状态流转：待处理 / 处理中 / 已解决
- 处理备注与负责人维护
- 按状态、类型、城市筛选工单
- 顶部统计：待处理、处理中、已解决数量

---

## 2. 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + TypeScript + Vite |
| 样式 | Tailwind CSS |
| 图表 | Recharts |
| 数据请求 | TanStack Query + Axios |
| 路由 | React Router |
| 后端 | Node.js + Express + TypeScript |
| 校验 | Zod |
| AI | DashScope（OpenAI 兼容模式，qwen-plus） |
| 存储 | JSON 文件（mock-data + tickets） |

---

## 3. 项目结构

```text
Robotaxi_Feedback_Platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── types/
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── data/
│   │   │   ├── mock-data.json
│   │   │   └── tickets.json
│   │   ├── schemas/
│   │   ├── middleware/
│   │   └── types/
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 4. 环境要求

- Node.js >= 18
- npm >= 9
- macOS / Linux / Windows 均可

---

## 5. 本地启动（推荐）

### 第 1 步：启动后端（端口 3001）

```bash
cd /Users/zhaojiaqi/Desktop/Robotaxi_Feedback_Platform/backend

# 首次运行安装依赖
npm install

# 复制环境变量模板（若 .env 已存在可跳过）
cp .env.example .env

# 启动
npm run dev
```

启动成功后可访问：
- 健康检查：`http://localhost:3001/api/health`

### 第 2 步：启动前端（端口 5173）

```bash
cd /Users/zhaojiaqi/Desktop/Robotaxi_Feedback_Platform/frontend

# 首次运行安装依赖
npm install

# 启动
npm run dev
```

启动成功后访问：
- 前端：`http://localhost:5173`
- 工单页面：`http://localhost:5173/tickets`

---

## 6. 环境变量说明

### 后端 `backend/.env`

可参考 `backend/.env.example`：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 后端端口 | `3001` |
| `DASHSCOPE_API_KEY` | 通义千问 API Key（AI 功能必需） | 无 |
| `DASHSCOPE_BASE_URL` | DashScope OpenAI 兼容地址 | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `QWEN_MODEL` | 使用模型 | `qwen-plus` |
| `INTERNAL_API_KEY` | AI 接口鉴权（可选） | 空 |
| `ALLOWED_ORIGINS` | CORS 白名单 | `http://localhost:5173,http://127.0.0.1:5173` |

### 前端 `frontend/.env`

可参考 `frontend/.env.example`：

| 变量 | 说明 |
|------|------|
| `VITE_BACKEND_URL` | Vite 开发代理目标地址（默认 `http://localhost:3001`） |
| `VITE_API_BASE_URL` | 生产环境 API 基础地址（可选） |

---

## 7. 使用说明

### 7.1 仪表盘
1. 进入首页查看 KPI 和趋势
2. 调整时间聚合维度（天/周/月）
3. 通过分布图定位高风险路线和城市

### 7.2 反馈列表
1. 使用筛选器缩小范围（如：差评 + 特定城市）
2. 点击行打开反馈详情
3. 对低分反馈（<=2 分）执行工单创建

### 7.3 工单管理
1. 打开左侧「工单管理」或直接访问 `/tickets`
2. 按状态/类型/城市筛选
3. 点击工单查看详情并更新：
   - 状态
   - 负责人
   - 处理备注
4. 保存后会同步更新统计和列表

### 7.4 AI 智能分析
1. 自动分类：选择最多 20 条反馈后点击开始分类
2. 摘要生成：选择时间范围和类型后生成摘要
3. 产品建议：按最近 N 天生成建议

> 注意：AI 功能依赖有效的 `DASHSCOPE_API_KEY`。

---

## 8. API 接口清单

### 通用
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |

### 反馈
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/feedback` | 列表（支持筛选/分页/排序） |
| GET | `/api/feedback/meta` | 筛选元数据（城市/路线/类型） |
| GET | `/api/feedback/:id` | 单条详情 |

### 分析
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/analytics/overview` | KPI 汇总 |
| GET | `/api/analytics/trends` | 趋势数据 |
| GET | `/api/analytics/distribution` | 分布数据 |

### AI
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ai/classify` | 自动分类 |
| POST | `/api/ai/summarize` | 摘要生成 |
| POST | `/api/ai/suggestions` | 产品建议 |

### 工单
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tickets` | 工单列表（支持 status/feedbackType/city 筛选） |
| POST | `/api/tickets` | 根据 `feedbackId` 创建工单 |
| PATCH | `/api/tickets/:id` | 更新状态/负责人/备注 |

---

## 9. 常见问题（FAQ）

### Q1：前端能打开，但没有数据？
- 检查后端是否启动（`http://localhost:3001/api/health`）
- 前端终端是否有 proxy 报错（ECONNREFUSED）

### Q2：工单页面没有数据？
- 工单默认是空的（`tickets.json` 初始为 `[]`）
- 先在反馈详情中对低分反馈点击「创建工单」

### Q3：AI 报 500 或 401？
- 确认 `.env` 的 `DASHSCOPE_API_KEY` 有效
- 更新 `.env` 后必须重启后端
- 可用 curl 单独验证 Key 是否可调用

### Q4：为什么重启后才生效？
- `nodemon` 默认监听的是 `src/**/*.ts`，`.env` 变化不会自动触发重启

---

## 10. 推送到 GitHub（首次）

如果当前目录还不是 Git 仓库：

```bash
cd /Users/zhaojiaqi/Desktop/Robotaxi_Feedback_Platform
git init
git add .
git commit -m "feat: robotaxi feedback platform with ticket system"
```

绑定远程并推送：

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

---

## 11. 安全提醒

- 不要把真实 API Key 提交到 GitHub
- `.env` 应保持在 `.gitignore` 中
- 如果 Key 泄露，立即在控制台删除并重建
