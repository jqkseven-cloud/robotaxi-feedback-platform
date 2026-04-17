# 构建复盘文档
## Robotaxi 乘客反馈管理平台

**作者**：赵嘉琦  
**完成时间**：48小时内  
**线上地址**：https://robotaxi-feedback-platform.onrender.com  
**GitHub**：https://github.com/jqkseven-cloud/robotaxi-feedback-platform

---

## 一、需求拆解思路

### 1.1 如何理解这个需求

拿到题目后，我没有急着开始写代码，而是先问自己一个问题：**这个平台的核心用户是谁，他们每天的工作流是什么？**

答案是：Robotaxi 运营团队。他们的日常工作流大致是：

```
每天早上打开平台 → 看昨日/本周整体数据（仪表盘）
→ 扫一眼有没有差评激增 → 钻进差评列表查看细节
→ 发现严重问题 → 创建工单交给对应团队跟进
→ 周期性用 AI 生成摘要和建议 → 整理成产品报告
```

这个工作流帮我明确了功能优先级，也定义了各模块之间的数据流向。

### 1.2 功能拆解与边界划定

我将需求分成**必须做（MVP）**和**增强项**两类：

**MVP（题目明确要求，不做就不合格）**

| 模块 | 核心子功能 |
|------|-----------|
| 反馈列表 | 分页展示、多维筛选（评分/时间/城市/类型）、详情查看 |
| 数据仪表盘 | KPI 卡片、时间趋势图、分布分析 |
| AI 智能分析 | 自动分类、摘要生成、产品建议 |

**自主增加（超出题目要求，基于业务判断）**

| 增加功能 | 增加理由 |
|---------|---------|
| 差评工单系统 | 反馈发现问题后，运营团队需要有"消化"机制。没有工单，反馈只是看看，不会被跟进处理。这是内部工具的核心闭环 |
| 情感分类标签 | 纯评分不够用。3分的反馈可能是"总体还行但路线绕了"（可优化），也可能是"还好没出事"（安全隐患），情感标签能辅助区分 |
| 关键词搜索 | 运营人员经常会搜"空调"、"绕路"等关键词排查某类问题，是高频需求 |
| AI 分类置信度可视化 | AI 给出的分类结果需要人工审核，用进度条 + 颜色直观展示置信度，帮助运营快速判断哪些分类可信、哪些需要复核 |

### 1.3 主动舍弃的功能

以下功能我明确判断**在 48 小时内不做**：

- **用户权限管理**：内部工具早期阶段，不值得花时间在 RBAC 上
- **实时推送/消息通知**：需要 WebSocket，复杂度高，早期用轮询或手动刷新即可
- **导出 Excel/PDF**：运营需求，但不是首要痛点
- **真实数据库**：题目没有要求，JSON 文件 + 内存查询对于 demo 规模完全够用，还省去了云数据库的配置和费用

### 1.4 模拟数据的设计思路

模拟数据不是随机填充，而是刻意设计了几个维度来体现对业务的理解：

- **城市分布**：武汉、上海、广州、深圳——覆盖不同成熟度的运营市场
- **路线设计**：每个城市设置了 3-4 条真实感路线（如"武汉大学→光谷广场"），而非"路线A/路线B"
- **反馈类型分布**：5种类型（驾驶体验、车内环境、接驾体验、路线规划、安全感受）按不均匀比例分布，符合真实情况（安全问题反馈相对较少）
- **情感分布**：约 40% 好评、30% 中性、30% 差评，接近真实用户反馈中的比例
- **时间分布**：集中在 2026 年 1-4 月，包含工作日/周末、早高峰/晚高峰的时间特征
- **天气字段**：加入了晴/雨/阴/雾等天气数据，为日后分析"天气对服务质量的影响"留下数据基础
- **tags 字段**：每条反馈都有 2-4 个具体标签（如"接驾准时"、"路线绕行"、"急刹车"），方便 AI 提取高频问题

---

## 二、技术选型理由

### 2.1 整体架构：前后端分离

选择**前后端分离**而非 Next.js 全栈，主要考虑：
- 前后端各自的构建、部署可以独立进行
- 后端逻辑（AI 调用、数据查询）和前端 UI 关注点分离，更清晰
- Render 部署时，最终采用了让后端同时托管前端静态文件的策略，兼顾了同域部署的简单性

### 2.2 前端技术栈

| 技术 | 版本 | 选型理由 |
|------|------|---------|
| React | 19 | 主流，生态成熟，AI 代码生成质量最高 |
| Vite | 8 | 构建速度快，开发体验好，已成为新项目标配 |
| TypeScript | 6 | 类型安全，AI 生成的代码有类型约束，错误更少 |
| Tailwind CSS | 3 | 无需维护 CSS 文件，UI 样式直接内联，配合 AI 生成效率高 |
| TanStack React Query | 5 | 服务端状态管理最佳实践，内置缓存/loading/error 状态，省去大量 boilerplate |
| Recharts | 3 | React 生态中文档最完善的图表库，AI 对其了解程度高 |
| Radix UI | - | 无样式基础组件（Dialog、Select 等），无障碍性好，配合 Tailwind 灵活定制 |
| React Router | 7 | SPA 路由，成熟稳定 |

**备选方案考虑过：**
- Next.js：全栈一体，但对本项目过重；SSR 对后台管理工具没有 SEO 价值
- Ant Design / MUI：组件库丰富，但样式固化，定制成本高；AI 生成的代码往往会混合多套样式系统导致冲突

### 2.3 后端技术栈

| 技术 | 版本 | 选型理由 |
|------|------|---------|
| Node.js + Express | 5 | 轻量，与前端同语言，全栈 TypeScript，AI 代码生成质量高 |
| TypeScript | 6 | 与前端保持一致，接口类型可对齐 |
| Zod | 4 | 运行时请求参数验证，类型自动推导，比 Joi 更现代 |
| dotenv | - | 环境变量管理标配 |

**数据存储：JSON 文件**
- 题目没要求真实数据库
- 避免引入 PostgreSQL/MongoDB 的云配置成本和复杂度
- Repository 模式做了良好的接口抽象（`IFeedbackRepository`），未来迁移到真实数据库只需替换实现类

**AI 接入：阿里云 DashScope（通义千问）**
- 选用阿里云而非 OpenAI，主要因为国内网络访问稳定
- DashScope 提供 OpenAI 兼容模式（`/compatible-mode/v1`），可直接使用 `openai` SDK，无需额外适配
- 使用 `qwen-plus` 模型，在速度/效果/成本间取得平衡

### 2.4 部署方案

最终采用**单 Render 服务**同时托管前后端：

```
Render Web Service
└── build: cd frontend && npm run build && cd ../backend && npm run build  
└── start: cd backend && node dist/index.js
└── Express 静态托管 frontend/dist/
```

**为何没用 Vercel + Render 分离部署？**
- 分离部署需要处理跨域（CORS），增加了环境变量配置的复杂度
- 前端 Vite 的环境变量是构建时烧入的，忘记在 Vercel 设置 `VITE_API_BASE_URL` 就会导致上线后无数据（这个坑确实踩了）
- 同源部署后，前端默认走相对路径 `/api`，CORS、环境变量配置全部消除，更简洁可靠

---

## 三、AI 协作过程

### 3.1 总体协作策略

我把 Claude Code 定位为"**能独立执行、但需要精确引导的高级工程师**"。它不需要我告诉它每一行代码怎么写，但它需要我告诉它：

1. **做什么**：明确的功能边界
2. **用什么**：指定技术栈和约束
3. **怎么判断对了**：验收标准

### 3.2 关键提示词设计

**项目初始化阶段**

初始 Prompt 的关键要素：
```
技术栈：React 19 + Vite + TypeScript + Tailwind CSS + Express 5 + TypeScript
架构：前后端分离，backend/ 和 frontend/ 各自有 package.json
数据：JSON 文件存储，用 Repository 模式封装
功能模块：[列举所有模块和子功能]
模拟数据：不少于 100 条，覆盖[具体字段说明]
```

**效果**：一次性生成了完整的项目骨架，包括目录结构、类型定义、API 接口设计，整体质量很高。

**AI 分析模块**

提示词中明确了：
- Prompt 要用中文（面向中国业务）
- 返回 JSON 格式（方便前端解析）
- 分类类别要固定（5 个类别，防止模型自由发挥出奇怪分类）
- temperature 参数（分类用 0.3 求稳定，建议生成用 0.6 允许创意）

**效果好的点**：
- AI 自动想到了对 AI 返回的 JSON 做 `parseJsonFromContent` 的健壮解析，处理了模型可能在 JSON 外面加说明文字的情况
- Prompt 设计了数据预处理逻辑（如 `typeStats`、`tagCounts` 汇总后再传给模型），避免把大量原始文本直接丢给模型

**工单系统**

这个模块是我主动提出的增强功能。给 AI 的指令是：
```
实现差评工单系统，数据存 backend/src/data/tickets.json
- 从反馈详情页创建工单（feedbackId 关联）
- 自动根据 feedbackType 分配 assignedTo 团队
- 工单状态：open / in_progress / resolved
- 前端：工单列表（统计栏 + 筛选 + 表格 + 详情抽屉）
```

**效果**：一次生成了完整的 Repository、Service、Router，以及完整的前端 TicketPage，包含状态机逻辑和 useQuery/useMutation。实际运行基本符合预期，只需要小幅调整。

### 3.3 需要人工干预和调整的地方

**调整一：Express 5 的 `req.query` 只读问题**

AI 生成的 validate 中间件试图给 `req.query` 赋值，但 Express 5 中 `req.query` 是只读的 getter，导致所有带查询参数的接口返回 500。

- **AI 的问题**：训练数据里 Express 4 用法更多，Express 5 的 breaking change 没有学到
- **如何发现**：反馈列表接口返回 500，查后端日志看到 `Cannot set property query`
- **解决方式**：将验证结果存到 `res.locals.validatedQuery`，路由里从这里读取

**调整二：AI 分析前端日期范围硬编码**

AI 生成的 `SummaryPanel.tsx` 默认日期范围是 `2024-01-01` 到 `2024-03-31`，而模拟数据的时间范围是 2026 年。导致摘要接口始终返回 400（没有数据匹配）。

- **AI 的问题**：生成示例代码时，日期取了一个"合理的历史区间"，没有和数据保持一致
- **如何发现**：AI 分析页面点击生成摘要报 400，检查请求参数发现日期对不上
- **解决方式**：将默认日期改为 `2026-01-01` 到 `2026-04-30`

**调整三：AI 分类置信度 UI**

AI 初始生成的分类结果展示是纯文字列表，信息密度低，不利于快速扫描。

- **主动优化**：加入了置信度进度条（绿/黄/红色阈值）、不一致分类的对比视图（原分类划线 → AI 建议分类），整体可读性大幅提升
- **这部分由我主导**：告诉 AI"帮我重新设计这个展示组件的 UI，要有视觉层次"，AI 按要求重写，一次到位

**调整四：AI 的 API Key 加载时机**

最棘手的 Bug。AI 最初将 API Key 在模块初始化时读取，但 `nodemon` 重启后新的 `.env` 内容不一定在模块 import 之前加载完毕，导致每次重启都用了旧的（无效的）Key。

- **解决思路**：将 `getClient()` 改为函数，每次 AI 调用时动态读取 `process.env`，彻底绕开加载顺序问题

### 3.4 如何判断 AI 输出的质量

我的判断标准：

1. **能跑起来是最低要求**，跑起来不代表对
2. **检查关键路径**：特别是错误处理（空数组、undefined、API 失败时的降级）
3. **检查类型一致性**：前后端的 TypeScript 类型是否匹配，字段名是否对齐
4. **关注 AI 不擅长的地方**：版本相关的 API 差异（Express 4 vs 5）、运行时的时序问题（env var 加载顺序）
5. **测接口而非看代码**：curl 直接打后端接口，比读代码更快发现问题

---

## 四、问题与解决

### 问题一：后端启动后立即退出（端口冲突）

**现象**：`npm run dev` 后 nodemon 显示 `clean exit`，进程退出

**排查过程**：
1. 看 nodemon 日志，发现是 `clean exit` 而非报错退出，说明不是代码 bug
2. 怀疑端口占用，检查 3001 端口 → 发现之前的进程没有完全退出

**解决**：`kill` 旧进程后重启，正常运行

**类型**：环境问题（非代码 bug）

---

### 问题二：反馈列表接口 500，`req.query` 只读

**现象**：`/api/feedback` 返回 500，前端列表空白

**排查过程**：
1. curl 直接打接口，看到 500 响应
2. 检查后端控制台，看到 `Cannot set property query of #<IncomingMessage>`
3. 定位到 `validate.ts` 的 `validateQuery` 中间件

**解决**：
```typescript
// 修改前（Express 5 中报错）
req.query = result.data as typeof req.query;

// 修改后
res.locals.validatedQuery = result.data;
// 路由中读取
const query = res.locals.validatedQuery;
```

**类型**：AI 生成代码的版本兼容性问题，由我发现并指导 AI 修复

---

### 问题三：AI 摘要生成返回 400

**现象**：点击"生成摘要"按钮，后端日志显示 `No feedbacks match the given filters`

**排查过程**：
1. 在浏览器 Network 面板查看请求 payload，发现 `dateFrom: "2024-01-01"`
2. 查看模拟数据，时间范围是 2026 年
3. 锁定问题在 `SummaryPanel.tsx` 的默认日期

**解决**：将 `SummaryPanel.tsx` 中的默认日期改为 2026 年范围

**类型**：AI 生成代码时的上下文不一致，由我通过 Network 调试发现

---

### 问题四：AI 功能 401（API Key 不生效）

**现象**：本地后端日志显示 `401 Incorrect API key provided`，即使 `.env` 已经设置了正确的 Key

**排查过程**：
1. 确认 `.env` 文件内容正确
2. 手动重启后端（不用 nodemon 的 reload）→ 401 依然存在
3. 怀疑 Key 在模块加载时就已经被读取并缓存

**根本原因**：
```typescript
// 原始代码 - Key 在模块 import 时固化
const client = new OpenAI({ apiKey: process.env.DASHSCOPE_API_KEY });

// 修复后 - 每次调用时动态读取
function getClient() {
  return new OpenAI({ apiKey: process.env.DASHSCOPE_API_KEY?.trim() });
}
```

**类型**：Node.js 模块加载时序问题，由我分析，AI 执行修复

---

### 问题五：线上部署后无数据（Render + Vercel 环境变量问题）

**现象**：Vercel 部署了前端，Render 部署了后端，线上页面空白无数据

**根本原因分析**：
1. **Vite 环境变量是构建时烧入的**：`VITE_API_BASE_URL` 必须在 `npm run build` 之前设置好，否则前端代码里写死的是空字符串或 `localhost:3001`
2. **CORS 问题**：Render 后端的 `ALLOWED_ORIGINS` 没有包含 Vercel 前端域名

**最终解决方案**：放弃 Vercel + Render 分离部署，改用 Express 同时托管前端静态文件，消除了所有跨域和环境变量问题：
```typescript
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}
```

**类型**：部署架构决策问题，由我主导分析和方案设计

---

### 问题六：Express 5 通配路由写法变化

**现象**：部署后访问前端路由（如 `/tickets`）返回 `Cannot GET /tickets`

**原因**：Express 5 中 `app.get('*', handler)` 不再工作，需改用 `app.use(handler)` 作为最终兜底

**解决**：
```typescript
// Express 4 写法（无效）
app.get('*', (_req, res) => res.sendFile(indexPath));

// Express 5 写法
app.use((_req, res) => res.sendFile(indexPath));
```

**类型**：框架版本 breaking change，由我识别，一行代码解决

---

## 五、反思与改进

### 5.1 如果重新做一次，我会调整什么

**技术层面：**

1. **先确认所有依赖版本的兼容性**。Express 5、React 19、Vite 8 都是相对新的版本，AI 的训练数据对这些版本的 breaking change 掌握有限。下次会先列出版本清单，让 AI 重点检查已知的兼容性风险点。

2. **部署方案在设计阶段就确定**，而不是开发完了再想。同源部署（Express 托管前端）是最简单的方案，应该一开始就选。

3. **模拟数据的时间范围和代码中的默认值要同步约定**。这次因为 AI 生成了 2024 年的默认日期，而数据是 2026 年，导致了一个隐蔽的 Bug。应该在项目初始化时统一约定"当前时间"是哪一年。

**AI 协作层面：**

1. **分步而非全量生成**。一次让 AI 生成太多模块，产出物的整体质量反而不稳定。更好的节奏是：先生成骨架（跑通），再逐模块完善。

2. **给 AI 提供更多上下文**。让 AI 修复 Bug 时，给它看日志（而不是只描述现象）效率更高。"后端日志报了这个错误：xxx，帮我分析原因并修复" 比"AI 功能不能用"要准确 10 倍。

3. **UI 迭代交给 AI，逻辑验证留给自己**。AI 生成 UI 的效率极高（Tailwind + React 组件），但业务逻辑（如 API 调用时机、状态管理、错误处理）需要仔细 review。

### 5.2 对 AI Coding 工作流的新理解

经过这次实践，我对"用 AI 工具把模糊需求变成可用产品"有了几点具体体会：

**AI 是执行力极强的"工程师"，但产品判断必须由人来做**

AI 能非常快速地把"创建工单系统"变成可运行的代码，但它不会主动判断"差评工单系统对这个业务有价值"——这个判断是我基于对运营工作流的理解做出的。换句话说，AI 放大了执行力，但不能替代产品思维。

**调试能力是 AI 协作的核心竞争力**

AI 生成代码的速度很快，问题大多不在生成环节，而在调试环节。能快速定位"是哪一层出了问题"（网络层/后端逻辑层/前端渲染层）并给 AI 提供精准的上下文，是决定效率差距的关键。这需要扎实的全栈基础知识。

**AI 的"盲区"是可以预测的**

经过这次实践，总结出几类 AI 容易出错的模式：
- 新版本框架的 breaking change（Express 5 的 `req.query` 只读、通配路由写法）
- 运行时时序问题（env var 加载顺序）
- 构建时 vs 运行时的变量注入差异（Vite 的 `VITE_` 变量）
- 前后端字段名不一致（AI 分别生成时可能用不同命名）

这些"盲区"一旦建立认知，就能在 review AI 代码时有针对性地重点检查，大幅降低线上 Bug 率。

**越早建立全局视图，越能少走弯路**

这次在部署阶段花了较多时间，根本原因是前期没有明确"前后端最终如何同域部署"。如果在项目一开始就画出系统架构图（包括部署拓扑），很多中后期的环境变量配置问题可以提前规避。

---

## 附录：项目文件结构

```
Robotaxi_Feedback_Platform/
├── package.json                    # 根级别构建脚本（Render 使用）
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx   # 数据仪表盘
│   │   │   ├── FeedbackPage.tsx    # 反馈列表
│   │   │   ├── AIAnalysisPage.tsx  # AI 智能分析
│   │   │   └── TicketPage.tsx      # 工单管理
│   │   ├── components/
│   │   │   ├── dashboard/          # KPI卡片、趋势图、分布图
│   │   │   ├── feedback/           # 列表、筛选、详情、评分、情感标签
│   │   │   ├── ai/                 # 分类面板、摘要面板、建议面板
│   │   │   └── layout/             # 侧边栏、布局
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios 封装 + 所有 API 调用
│   │   │   └── utils.ts            # 通用工具函数
│   │   └── types/index.ts          # 前端 TypeScript 类型定义
│   └── package.json
└── backend/
    ├── src/
    │   ├── data/
    │   │   ├── mock-data.json       # 150 条模拟反馈数据
    │   │   ├── tickets.json         # 工单数据（运行时写入）
    │   │   └── generate.ts          # 数据生成脚本
    │   ├── repositories/
    │   │   ├── IFeedbackRepository.ts      # 接口定义
    │   │   ├── JsonFeedbackRepository.ts   # JSON 文件实现
    │   │   └── JsonTicketRepository.ts     # 工单 JSON 实现
    │   ├── services/
    │   │   ├── feedbackService.ts   # 反馈业务逻辑
    │   │   ├── analyticsService.ts  # 数据统计逻辑
    │   │   ├── ticketService.ts     # 工单业务逻辑
    │   │   └── qwen.ts              # AI 调用（分类/摘要/建议）
    │   ├── routes/
    │   │   ├── feedback.ts          # GET /api/feedback
    │   │   ├── analytics.ts         # GET /api/analytics
    │   │   ├── ai.ts                # POST /api/ai/*
    │   │   └── tickets.ts           # GET/POST/PATCH /api/tickets
    │   ├── middleware/
    │   │   ├── validate.ts          # Zod 请求验证
    │   │   ├── logger.ts            # 结构化日志
    │   │   ├── errorHandler.ts      # 全局错误处理
    │   │   └── auth.ts              # API Key 鉴权
    │   ├── schemas/index.ts         # Zod Schema 定义
    │   ├── types/index.ts           # 后端类型定义
    │   ├── config/constants.ts      # 常量配置
    │   └── index.ts                 # Express 入口（含静态文件托管）
    └── package.json
```
