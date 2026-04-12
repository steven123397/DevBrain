# DevBrain

DevBrain 是一个面向程序员的本地优先知识库，用来把开发中的碎片知识沉淀为可检索、可关联、可复用的知识资产。

当前仓库处于 MVP / v0.1 启动阶段，优先跑通 4 个动作：收集、整理、搜索、复用。

## 技术栈

- Next.js 15（App Router）
- TypeScript
- Tailwind CSS
- SQLite
- Drizzle ORM
- Zod
- Vitest
- Playwright

## 本地开发

```bash
pnpm install
pnpm dev
pnpm seed
pnpm lint
pnpm test
pnpm build
```

## SQLite 本地依赖说明

- 项目当前使用 `better-sqlite3` 作为本地 SQLite 驱动。
- 如果本地 `pnpm` 开启了 build script 审批，首次安装后需要确认该依赖的原生绑定已经构建成功。
- 若运行时报出 `Could not locate the bindings file`，说明本地原生模块还没有完成构建。

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
