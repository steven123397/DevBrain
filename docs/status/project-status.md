# DevBrain 项目状态

文档状态：active
最后更新：2026-04-12
当前阶段：MVP / v0.1
当前分支：`feat/bootstrap-app-shell`
关联计划：`docs/plan/implementation-plan.md`
关联规则：`docs/index.md`、`AGENTS.md`

## 当前焦点

Task 9 已完成，当前焦点切换到 Task 10（最终打磨与交付整理）。

## 已完成

- 已完成 Task 1：项目骨架、首页 Shell、测试与基础脚本已经就绪。
- 已完成仓库治理基线：`docs/index.md`、`.codex/project-governance.yaml`、design / plan / status 模板已经落地。
- 已完成文档归位：产品与未来建模文档已迁移到 `docs/design/`，当前活跃计划已迁移到 `docs/plan/`，根目录同名文件仅保留兼容入口。
- 已完成 Task 2：补齐 `src/features/notes/note.types.ts`、`src/db/schema.ts`、`src/db/client.ts`、`drizzle.config.ts`。
- 已生成首个 SQLite migration：`src/db/migrations/0000_dapper_franklin_storm.sql`。
- 已补充 Task 2 的单元测试：`tests/unit/db-schema.test.ts`。
- 已完成 Task 3：补齐 `src/features/notes/note.schemas.ts`、`src/features/notes/note.service.ts` 以及对应单元测试。
- 已在 service 层打通 note 创建、读取、更新、删除、最近列表与按状态 / 标签 / 技术栈筛选。
- 已完成 Task 4：补齐首页仪表盘、`/notes` 列表页、筛选栏与条目列表组件。
- 已为 Task 4 扩展 note service：支持 dashboard 聚合数据、列表搜索与可选筛选项读取。
- 已补充 Task 4 单元测试与 E2E：`tests/unit/list-notes.test.ts`、`tests/e2e/dashboard.spec.ts`。
- 已为 E2E 建立独立 SQLite 种子链路：`playwright.config.ts` 使用 `DEVBRAIN_DB_FILE` 指向隔离测试库，避免污染日常数据文件。
- 已完成 Task 5：`/notes/new` 已从占位页升级为真正的 Inbox 快速录入表单。
- 已补齐 Task 5 的服务端提交流程：新增 `src/app/actions/create-note.ts`，统一处理表单解析、校验与创建后跳转。
- 已补齐 Task 5 的 UI：新增 `src/components/note-form.tsx`，支持标题、原始输入、标签、技术栈、来源类型、来源链接的快速录入。
- 已补齐创建后落点：新增基础版 `src/app/notes/[id]/page.tsx` 承接创建成功后的详情跳转，完整详情 / 编辑能力仍留给 Task 6。
- 已补充 Task 5 单元测试与 E2E：`tests/unit/create-note-action.test.ts` 覆盖 action 校验，`tests/e2e/dashboard.spec.ts` 覆盖快速录入闭环。
- 已完成 Task 6：补齐 `src/app/actions/update-note.ts`、`src/app/notes/[id]/edit/page.tsx`、`src/components/note-detail.tsx`，打通条目详情 / 编辑 / digest 工作流。
- 已补齐 Task 6 的编辑表单状态管理：新增 `src/app/actions/update-note.shared.ts` 与 `src/components/note-editor-form.tsx`，支持轻量修正与完整消化。
- 已将 `src/app/notes/[id]/page.tsx` 从基础落地页升级为完整详情页，展示摘要、问题、方案、为什么、原始输入、命令、参考与来源元数据。
- 已补充 Task 6 单元测试与 E2E：`tests/unit/update-note-action.test.ts` 覆盖更新 action，`tests/e2e/digest-note.spec.ts` 覆盖 Inbox -> Digested 的浏览器闭环。
- 已完成 Task 7：新增 `src/features/notes/note.search.ts`，把多字段搜索条件从 service 层抽为独立模块。
- 已完成 Task 7 的 URL 持久化：`/notes` 列表页已切换到计划要求的 `q` / `status` / `tag` / `stack` / `sort` 查询参数。
- 已为 Task 7 保留兼容读法：列表页会优先读取 `q`，同时兼容旧的 `query` 参数，避免已有链接立刻失效。
- 当前 Task 7 采用 MVP 方案：仍使用集中封装的多字段 `LIKE` 搜索，尚未引入新的 SQLite FTS migration。
- 已补充 Task 7 单元测试与 E2E：`tests/unit/note-search.test.ts` 覆盖标题 / 原始输入 / 问题 / 方案检索与组合筛选，`tests/e2e/search-notes.spec.ts` 覆盖 URL 持久化搜索流。
- 已完成 Task 8：新增 `src/features/notes/note.related.ts`，把规则化相关推荐评分抽为独立模块。
- 已在 service 层补齐相关推荐查询：`src/features/notes/note.service.ts` 新增 `listRelatedNotes`，基于共享标签、同技术栈、标题词与命令词生成可解释结果。
- 已在详情页补齐相关推荐面板：`src/app/notes/[id]/page.tsx` 与 `src/components/note-detail.tsx` 现会展示匹配分、命中原因和跳转入口。
- 已补充 Task 8 单元测试与 E2E：`tests/unit/note-related.test.ts` 覆盖评分权重与排序，`tests/e2e/related-notes.spec.ts` 覆盖详情页推荐展示与跳转闭环。
- 已完成 Task 9：新增 `src/app/actions/delete-note.ts` 与 `src/app/actions/delete-note.shared.ts`，详情页支持删除条目后返回列表。
- 已补齐删除后的承接页：新增 `src/app/notes/[id]/not-found.tsx`，已删除或失效的条目链接会展示明确文案和回退入口。
- 已补齐首页与列表页空状态：`src/app/page.tsx` 会提示 Inbox 清空，`src/app/notes/page.tsx` 会区分“无任何条目”“Inbox 为空”“筛选无结果”三类状态。
- 已补齐 demo seed 能力：新增 `src/db/demo-seed.ts`、`src/db/seed.ts`，并在 `package.json` / `README.md` 中暴露 `pnpm seed` 本地命令。
- 已增强 reviewability：`src/components/note-list.tsx` 现支持从首页 / 列表页打开条目详情，`/notes` 页同时补齐删除成功提示与空查询参数归一化，避免空筛选值触发解析错误。
- 已补充 Task 9 单元测试与 E2E：新增 `tests/unit/delete-note-action.test.ts`、`tests/e2e/empty-states.spec.ts`、`tests/e2e/delete-note.spec.ts`，并让 E2E 在每条用例前重置 SQLite 数据以稳定验证删除与空态场景。

## 进行中

- 下一阶段的主任务是 `docs/plan/implementation-plan.md` 中的 Task 10。
- 当前搜索与筛选主闭环已可用，后续若要进一步提升检索性能或召回质量，可在 `src/features/notes/note.search.ts` 的 seam 上升级到 SQLite FTS。
- 当前相关推荐已具备可解释规则闭环，后续若要引入混合召回或 embeddings，可沿 `src/features/notes/note.related.ts` 的 seam 扩展而不重写详情页展示。
- 后续新增阶段性计划或评审结论时，将分别落到 `docs/plan/*.md` 与 `docs/status/code-review-status.md`。

## 风险 / 阻塞

- 当前本地环境的 `pnpm` 会对原生依赖启用 build script 审批；新装依赖后需确认 `better-sqlite3` 绑定已经构建完成。
- 仓库还未为 Task 3 创建 checkpoint commit；如需提交当前进度，需要用户再次显式下达提交指令。
- 当前 Task 7 还没有使用 SQLite FTS；如果后续数据规模明显增长，需要重新评估检索性能与索引策略。
- 当前 Task 8 采用固定权重规则，尚未纳入“最近访问关系加权”；如果后续出现误召回，需要再评估权重和排序信号。
- `pnpm seed` 会重置目标 SQLite 文件并写入 demo 数据；如果后续要作用于真实本地库，需要先确认目标路径或备份现有数据。

## 下一步

- 开始 Task 10：做最终打磨与交付整理，收口 MVP 文档、演示路径与交付说明。
- 在进入新的 `standard` / `heavy` 任务时，先检查是否需要新增 `docs/plan/*.md` 或 `docs/design/*.md`。
- 如果发生评审，统一把 findings 写入 `docs/status/code-review-status.md`。

## 验证记录

- 2026-04-12：Task 2 红灯验证通过，`tests/unit/db-schema.test.ts` 在实现前因缺少模块而失败。
- 2026-04-12：已执行 `pnpm drizzle-kit generate`，生成 `src/db/migrations/0000_dapper_franklin_storm.sql`。
- 2026-04-12：已通过 `pnpm lint`、`pnpm test`、`pnpm build`。
- 2026-04-12：已通过 `better-sqlite3` 运行时烟雾验证（`:memory:` 查询返回 1）。
- 2026-04-12：Task 3 红灯验证通过，`tests/unit/note-schemas.test.ts` 与 `tests/unit/note-service.test.ts` 在实现前因缺少模块而失败。
- 2026-04-12：Task 3 边界验证通过，补充「部分更新不清空未传字段」测试后已转绿。
- 2026-04-12：Task 3 已通过 `pnpm test`、`pnpm lint`、`pnpm build`。
- 2026-04-12：Task 4 红灯验证通过，`tests/unit/list-notes.test.ts` 在 `/notes` 页面未实现前失败。
- 2026-04-12：Task 4 已通过 `pnpm test`、`pnpm lint`、`pnpm build`、`pnpm test:e2e`。
- 2026-04-12：Task 5 红灯验证通过，`tests/unit/create-note-action.test.ts` 在 `create-note` action 缺失时失败，`tests/e2e/dashboard.spec.ts` 在 `/notes/new` 尚未接入表单时失败。
- 2026-04-12：Task 5 已通过 `pnpm test`、`pnpm lint`、`pnpm build`、`pnpm test:e2e`。
- 2026-04-12：Task 6 红灯验证通过，`tests/unit/update-note-action.test.ts` 在 `update-note` action 缺失时失败，`tests/e2e/digest-note.spec.ts` 在详情页缺少“继续整理”入口时失败。
- 2026-04-12：Task 6 已通过 `pnpm test`、`pnpm lint`、`pnpm build`、`pnpm test:e2e`。
- 2026-04-12：Task 7 红灯验证通过，`tests/unit/note-search.test.ts` 在 `note.search.ts` 缺失时失败，`tests/unit/list-notes.test.ts` 与 `tests/e2e/search-notes.spec.ts` 在列表页仍使用 `query` 参数时失败。
- 2026-04-12：Task 7 已通过 `pnpm test`、`pnpm lint`、`pnpm build`、`pnpm test:e2e`。
- 2026-04-12：Task 8 红灯验证通过，`tests/unit/note-related.test.ts` 在 `note.related.ts` 缺失时失败，`tests/unit/note-service.test.ts` 在 `listRelatedNotes` 缺失时失败，`tests/e2e/related-notes.spec.ts` 在详情页尚未展示相关推荐时失败。
- 2026-04-12：Task 8 已通过 `pnpm test`、`pnpm lint`、`pnpm build`、`pnpm test:e2e`。
- 2026-04-12：Task 9 红灯验证通过，`tests/unit/delete-note-action.test.ts` 在 `delete-note.shared.ts` 缺失时失败，`tests/e2e/empty-states.spec.ts` 与 `tests/e2e/delete-note.spec.ts` 在空状态、删除入口和删除后 not-found 能力缺失时失败。
- 2026-04-12：Task 9 已通过 `pnpm lint`、`pnpm test`、`pnpm build`、`pnpm test:e2e`；并通过 `DEVBRAIN_DB_FILE=/tmp/devbrain-seed-verification.sqlite pnpm seed` 验证 demo seed 可用。
