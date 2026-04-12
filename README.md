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
pnpm lint
pnpm test
pnpm build
```

## 文档入口

- 文档总索引：`docs/index.md`
- 项目规则：`AGENTS.md`
- 快速背景：`docs/codex-kickoff-brief.md`
- 产品边界：`docs/product-requirements.md`
- 当前执行计划：`docs/implementation-plan.md`
- 当前状态：`docs/status/project-status.md`

## 工作流约定

1. 先从 `docs/index.md` 判断本轮任务对应的 design / plan / status 文档。
2. 产品边界变化写入 `docs/product-requirements.md` 或 `docs/future-data-model.md`。
3. 可执行拆解写入 `docs/implementation-plan.md` 或 `docs/plan/*.md`。
4. 实时进度、风险和下一步只写入 `docs/status/*.md`，不要重复写进计划文档。
5. 提交（commit）不是默认动作，只有用户明确要求时才执行。
