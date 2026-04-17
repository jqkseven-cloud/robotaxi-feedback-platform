# Robotaxi 乘客反馈管理平台

滴滴自动驾驶 Robotaxi 服务的内部运营工具，用于高效管理和分析乘客反馈数据，以数据驱动产品体验持续优化。

## 功能模块

### 模块一：数据仪表盘
- KPI 核心指标卡片（总反馈数、平均评分、好评率、差评率）
- 反馈趋势折线图（支持按日/周/月聚合切换）
- 热门路线 Top 8 柱状图
- 反馈类型饼图 & 情感分布饼图
- 评分分布柱状图
- 各类型反馈详情对比表

### 模块二：反馈列表
- 多维度筛选（评分、时间范围、城市、反馈类型、情感倾向）
- 关键词全文搜索
- 按时间/评分排序
- 分页浏览（每页 20 条）
- 点击任意行查看反馈详情抽屉

### 模块三：AI 智能分析（通义千问）
- **自动分类**：对反馈文本进行自动类型识别，与现有分类对比，显示置信度和分类理由
- **摘要生成**：提炼批量反馈的核心问题、典型用户说词和整体情感判断
- **产品建议**：基于反馈数据生成优先级排序的产品优化建议报告，支持一键复制

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite |
| 样式 | Tailwind CSS |
| 图表 | Recharts |
| 数据请求 | React Query + Axios |
| 路由 | React Router v6 |
| 后端 | Node.js + Express + TypeScript |
| AI | 通义千问 API（DashScope OpenAI 兼容模式） |

## 数据说明

150 条模拟数据，覆盖：
- **城市**：上海、广州、武汉、重庆
- **路线**：16 条真实场景路线
- **反馈类型**：驾驶体验、车内环境、接驾体验、路线规划、安全感受
- **情感分布**：好评约 50%、差评约 20%、中性约 30%
- **时间范围**：2024-01-01 至 2024-03-31

## 快速启动

### 前置要求
- Node.js >= 18
- npm >= 9

### 1. 启动后端

```bash
cd backend

# 复制环境变量配置文件
cp .env.example .env

# 编辑 .env，填入通义千问 API Key（可选，不填则 AI 功能返回提示信息）
# DASHSCOPE_API_KEY=your_api_key_here

# 安装依赖
npm install

# 启动开发服务器（端口 3001）
npm run dev
```

### 2. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器（端口 5173）
npm run dev
```

### 3. 访问应用

打开浏览器访问：http://localhost:5173

## 环境变量配置

后端 `backend/.env` 文件：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 后端服务端口 | `3001` |
| `DASHSCOPE_API_KEY` | 通义千问 API Key | — |

### 获取通义千问 API Key

1. 访问 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/)
2. 注册/登录阿里云账号
3. 在「API-KEY管理」中创建 API Key
4. 将 API Key 填入 `backend/.env` 文件

> 注意：不配置 API Key 时，AI 分析功能会返回友好的提示信息，其他功能不受影响。

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/feedback` | 反馈列表（支持分页/排序/筛选） |
| GET | `/api/feedback/meta` | 城市、路线、类型元数据 |
| GET | `/api/feedback/:id` | 单条反馈详情 |
| GET | `/api/analytics/overview` | KPI 汇总指标 |
| GET | `/api/analytics/trends` | 时间趋势数据 |
| GET | `/api/analytics/distribution` | 各维度分布数据 |
| POST | `/api/ai/classify` | 自动分类（最多 20 条） |
| POST | `/api/ai/summarize` | 批量摘要生成 |
| POST | `/api/ai/suggestions` | 产品优化建议 |

## 项目结构

```
Robotaxi_Feedback_Platform/
├── frontend/                  # React 前端
│   └── src/
│       ├── components/        # 组件
│       │   ├── layout/        # 布局（侧边栏）
│       │   ├── dashboard/     # 仪表盘图表组件
│       │   ├── feedback/      # 反馈列表相关组件
│       │   └── ai/            # AI 分析面板组件
│       ├── pages/             # 页面组件
│       ├── lib/               # API 客户端 & 工具函数
│       └── types/             # TypeScript 类型定义
├── backend/                   # Node.js 后端
│   └── src/
│       ├── routes/            # Express 路由
│       ├── services/          # 通义千问服务
│       └── data/              # 模拟数据
└── README.md
```
