# DevBrain

DevBrain 是一个面向程序员的本地优先知识库，用来把开发中的碎片知识沉淀为可检索、可关联、可复用的知识资产。

当前仓库处于 MVP / v0.1 启动阶段，优先跑通 4 个动作：收集、整理、搜索、复用。

## MVP 范围

- 单人、本地优先的程序员知识库
- Inbox -> Digested 的结构化整理工作流
- SQLite 持久化、搜索、筛选、详情页与规则化相关推荐
- 演示数据种子、空状态、删除流程与本地 review 路径

## 明确非目标

- AI 主流程、embedding 检索、知识图谱可视化
- 多端同步、团队协作、插件系统
- 浏览器扩展、自动抓取、自动导入流水线
- 云端服务依赖或 agent-first 交互模式

## 技术栈

- Next.js 15（App Router）
- TypeScript
- Tailwind CSS
- SQLite
- Drizzle ORM
- Zod
- Vitest
- Playwright

## 本地开发与评审

默认数据库路径是 `data/devbrain.sqlite`，可通过环境变量 `DEVBRAIN_DB_FILE` 覆盖。

首次拉起本地评审环境，推荐执行：

```bash
pnpm install
pnpm db:migrate
pnpm seed
pnpm dev
```

- `pnpm db:migrate`：把 `src/db/migrations/` 中的 migration 应用到当前 SQLite 文件
- `pnpm seed`：重置目标数据库并写入 demo 数据，方便直接 review
- `pnpm dev`：启动本地开发服务器

如果只想体验空库首启路径，可跳过 `pnpm seed`。

## 数据库与迁移命令

```bash
pnpm db:generate
pnpm db:migrate
pnpm seed
```

- `pnpm db:generate`：根据 `src/db/schema.ts` 生成新的 Drizzle migration
- `pnpm db:migrate`：执行已有 migration，适合初始化或升级本地库
- `pnpm seed`：写入 demo 数据；注意它会重置目标 SQLite 文件

## 测试与验证命令

```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

建议在交付或 review 前至少执行一次完整基线：`pnpm lint && pnpm test && pnpm build && pnpm test:e2e`

## SQLite 本地依赖说明

- 项目当前使用 `better-sqlite3` 作为本地 SQLite 驱动。
- 如果本地 `pnpm` 开启了 build script 审批，首次安装后需要确认该依赖的原生绑定已经构建成功。
- 若运行时报出 `Could not locate the bindings file`，说明本地原生模块还没有完成构建。

## 本地 review 路径

1. `pnpm db:migrate`
2. `pnpm seed`
3. `pnpm dev`
4. 打开 `/` 查看仪表盘与最近更新
5. 打开 `/notes` 验证搜索、筛选和空状态
6. 新建一条 Inbox 记录并进入详情页
7. 将其整理为 Digested，确认相关推荐可跳转复用

## 文档入口

- 文档总索引：`docs/index.md`
- 项目规则：`AGENTS.md`
- 快速背景：`docs/codex-kickoff-brief.md`
- 产品边界：`docs/design/product-requirements.md`
- 当前执行计划：`docs/plan/implementation-plan.md`
- 当前状态：`docs/status/project-status.md`

## 工作流约定

1. 先从 `docs/index.md` 判断本轮任务对应的 design / plan / status 文档。
2. 产品边界变化写入 `docs/design/product-requirements.md` 或 `docs/design/future-data-model.md`。
3. 可执行拆解写入 `docs/plan/implementation-plan.md` 或 `docs/plan/*.md`。
4. 实时进度、风险和下一步只写入 `docs/status/*.md`，不要重复写进计划文档。
5. 提交（commit）不是默认动作，只有用户明确要求时才执行。
