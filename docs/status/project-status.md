# DevBrain 项目状态

文档状态：active
最后更新：2026-04-17
当前阶段：MVP / v0.1 handoff
当前分支：`feat/bootstrap-app-shell`
关联计划：无（历史归档见 `docs/plan/history.md`）
关联规则：`docs/index.md`、`AGENTS.md`

## 当前焦点

主线 MVP 与本轮搜索 / 相关推荐质量升级已完成；基于更大样本的本地评估，当前仍以层 1 规则增强为主，暂不进入 SQLite FTS。

## 已完成

- 已完成 Task 1：项目骨架、首页 Shell、测试与基础脚本已经就绪。
- 已完成仓库治理基线：`AGENTS.md`、`docs/index.md`、design / plan / status 模板已经落地。
- 已完成本地工具目录治理调整：`.codex/`、`.claude/`、`.cursor/`、`.gemini/`、`.windsurf/`、`.aider/`、`.roo/` 已统一交给 `.gitignore` 管理，避免进入版本管理。
- 已收口治理配置策略：`.codex/project-governance.yaml` 回归本地辅助配置，不再作为仓库提交内容；版本化治理入口仍以 `AGENTS.md` 与 `docs/index.md` 为准。
- 已完成文档归位：产品与未来建模文档已迁移到 `docs/design/`，阶段性计划统一落在 `docs/plan/` 并在完成后归档到 `docs/plan/history.md`，旧兼容入口文档已完成清理。
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
- 已完成 Task 10：新增 `tests/e2e/happy-path.spec.ts`，把“创建 -> 搜索 -> 打开 -> 整理 -> 打开相关条目”串成单条可复验的浏览器主流程。
- 已补齐交付文档：`README.md` 现明确记录本地 setup、数据库路径、迁移命令、测试命令、MVP 范围与非目标。
- 已补齐迁移入口：新增 `src/db/migrate.ts` 与 `src/db/migrate.shared.ts`，并在 `package.json` 中补充 `pnpm db:generate`、`pnpm db:migrate`。
- 已完成 handoff 留痕：MVP 主线与搜索质量升级的阶段性计划都已归档到 `docs/plan/history.md`，当前不再保留活跃计划文件。
- 已校准治理口径：`AGENTS.md` 与 `docs/index.md` 已移除对已删除兼容入口文档的旧描述，避免 handoff 后继续误导。
- 已完成首轮 code review 风险收口：`src/features/notes/note.search.ts` 与 `src/features/notes/note.service.ts` 已加入显式相关性排序，并把标签 / 技术栈纳入搜索辅助召回。
- 已完成 `Digested` 质量门槛：`src/features/notes/note.schemas.ts`、`src/app/actions/update-note.shared.ts`、`src/components/note-editor-form.tsx` 现会阻止缺少 `summary + problem + solution` 且没有 `tag/stack` 的低质量 digest。
- 已完成最小输入治理：新增 `src/features/notes/note.normalization.ts`，对常见标签 / 技术栈别名做 canonicalization，降低筛选、搜索和相关推荐的输入分叉。
- 已完成 seed 安全收口：新增 `src/db/database-path.ts`、`src/db/seed.shared.ts`，`pnpm seed` 默认不再直接覆盖隐式主库；`README.md` 已同步改为显式 demo DB review 流程。
- 已同步更新 demo 数据与 happy-path 断言，使 seeded Digested 条目符合新门槛，并让浏览器主流程适配更宽的搜索召回。
- 已完成搜索与相关推荐质量升级：`src/features/notes/note.normalization.ts` 已扩成搜索与 related 共用的 canonicalization / search signal 共享层，覆盖 `drizzle-orm`、`drizzle-kit`、`db:migrate`、`better-sqlite3`、`DEVBRAIN_DB_FILE`、`validation db`、`默认主库` 等术语分叉。
- 已完成搜索召回增强：`src/features/notes/note.search.ts` 已补中文连续片段 token、结构化命令 / 路径 token 与 canonical phrase expansion，并重新调高数据库语境下 `commands / references / why` 的排序权重。
- 已完成搜索规则层小修：`src/features/notes/note.search.ts` 现会在评分阶段过滤 `db` / `file` 这类泛 token，并对 `pnpm` 等宽泛包管理器查询压低 `solution / why / commands / references` 的命令型权重，减少 `DEVBRAIN_DB_FILE` 尾部噪声与 `pnpm` 跨簇误上浮。
- 已完成相关推荐去噪：`src/features/notes/note.related.ts` 已整合 canonical signal、结构化命令 token 与标题泛词降权，数据库 seed / migrate / bindings 链路更稳定，`server` / `file` 类噪声不再轻易抬高无关条目。
- 已补齐 R1~R3 回归验证：新增 `tests/unit/note-normalization.test.ts`，并扩展 `tests/unit/note-search.test.ts`、`tests/unit/note-related.test.ts`、`tests/unit/note-service.test.ts` 覆盖中文模糊查询、数据库边界词、alias 归一、数据库排序权重与相关推荐链路。
- 已补最小浏览器级回归：`src/db/demo-seed.ts` 新增数据库安全边界样本，`tests/e2e/search-notes.spec.ts` 与 `tests/e2e/related-notes.spec.ts` 现覆盖 `/notes?q=默认主库` 命中目标卡片，以及数据库详情页优先带出 `db:migrate` 相邻条目。
- 已完成测试基线收口：`tests/unit/smoke.test.tsx` 现通过 mock `noteService.getDashboardOverview` 渲染首页知识闭环，不再依赖真实 SQLite schema；`playwright.config.ts` 的 `webServer.command` 已切到 `corepack pnpm`，服务器侧可直接跑 E2E。
- 已完成更大样本的本地搜索 / related 评估：基于内存 SQLite 构造 28 条混合样本复核 `默认主库`、`validation 库`、`DEVBRAIN_DB_FILE`、`db:migrate`、`drizzle orm`、`输入框改了列表没变`、`hydration`、`pnpm` 等查询后，当前结论是搜索主路径仍可解释且可用，暂不需要引入 SQLite FTS。

## 进行中

- 当前无进行中的实现任务；若继续收口搜索质量，优先补规则层的小修，而不是直接进入 SQLite FTS。
- 若数据规模继续增长，可沿 `src/features/notes/note.search.ts` 的 seam 评估是否升级到 SQLite FTS。
- 若相关推荐在真实使用下出现误召回或价值不足，可沿 `src/features/notes/note.related.ts` 的 seam 继续补候选集或排序信号。
- 后续新增阶段性计划或评审结论时，分别落到 `docs/plan/*.md` 与 `docs/status/code-review-status.md`。

## 风险 / 阻塞

- 当前本地环境的 `pnpm` 会对原生依赖启用 build script 审批；新装依赖后需确认 `better-sqlite3` 绑定已经构建完成。
- 当前搜索虽已补齐显式相关性排序，但仍未引入 SQLite FTS；如果数据规模明显增长，需要优先评估索引与检索性能升级。
- 本轮大样本评估里，`DEVBRAIN_DB_FILE` 查询尾部仍会沾到 `file` 类泛词噪声，`pnpm` 这类泛查询也还会混入部分数据库 / 工具链条目；这更像规则权重与 stopword 细化问题，不是当前必须引入 FTS 的证据。
- 当前相关推荐采用固定权重规则，尚未纳入“最近访问关系加权”或更细的质量反馈；如果后续出现误召回，需要再评估权重和排序信号。
- `pnpm seed` 现已拒绝直接覆盖隐式默认主库；若后续确需重置主库，必须显式设置 `DEVBRAIN_ALLOW_DEFAULT_DB_RESET=true`，否则命令会中止。
- 本地 fresh setup 仍需要显式执行 `pnpm db:migrate` 或 `pnpm seed` 才会创建表结构，运行前置步骤不能省略。
- 旧兼容入口文档与历史活跃计划文件已被清理；如果外部书签、脚本或历史链接仍指向旧路径，需要同步更新到 `docs/index.md`、`docs/status/project-status.md`、`docs/plan/history.md` 或新的 `docs/plan/*.md`。

## 下一步

- 按更新后的 `README.md` review flow 用独立 demo / validation DB 继续复走主路径，重点验证中文模糊检索与数据库相关推荐是否稳定帮助复用。
- 在继续评估 SQLite FTS 之前，优先用真实使用样本继续观察这两处规则层小修是否足够稳定：`DEVBRAIN_DB_FILE` 查询尾部噪声，以及 `pnpm` 泛查询里的跨簇误上浮。
- 只有当 Top 5 命中率、首屏可用性或查询复杂度继续明显退化时，再进入 SQLite FTS 计划设计。
- 如果发生新的评审，统一把 findings 写入 `docs/status/code-review-status.md`；若进入下一阶段，先新增对应 `docs/plan/*.md`。

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
- 2026-04-12：Task 10 红灯验证通过，`tests/e2e/happy-path.spec.ts` 初版因使用过宽的 `Digested` 文本断言失败，暴露出 happy-path 断言需要按最终详情页结构收紧。
- 2026-04-12：Task 10 已通过 `pnpm lint`、`pnpm test`、`pnpm build`、`pnpm test:e2e`；并通过 `DEVBRAIN_DB_FILE=/tmp/devbrain-migrate-verification.sqlite pnpm db:migrate` 与 `DEVBRAIN_DB_FILE=/tmp/devbrain-seed-verification.sqlite pnpm seed` 验证本地 handoff 命令可用。
- 2026-04-13：code review follow-up 已通过 `pnpm test`、`pnpm lint`、`pnpm build`、`pnpm test:e2e`。
- 2026-04-15：已验证 `.gitignore`、`AGENTS.md`、`docs/index.md` 的路径与治理口径一致，并确认 `.codex/` 等本地目录不再作为仓库提交对象，`.codex/project-governance.yaml` 仅保留为本地辅助配置。
- 2026-04-17：搜索 / 相关推荐质量升级已按红绿循环完成，先通过 `pnpm test -- tests/unit/note-normalization.test.ts tests/unit/note-search.test.ts tests/unit/note-related.test.ts tests/unit/note-service.test.ts` 固化并转绿 R1~R3 回归，再通过 `pnpm lint`、`pnpm test`、`pnpm build` 完成最终验证。
- 2026-04-17：最小浏览器级回归已补齐；先通过 `pnpm test:e2e -- tests/e2e/search-notes.spec.ts tests/e2e/related-notes.spec.ts` 完成红绿循环，再通过 `pnpm lint` 与 `pnpm test:e2e` 验证扩展后的 demo seed 未破坏现有 seeded 浏览器用例。
- 2026-04-17：已通过一次性本地评估脚本在内存 SQLite 上构造 28 条混合样本，复核搜索与相关推荐在更大样本下的命中与排序；查询 `默认主库`、`validation 库`、`DEVBRAIN_DB_FILE`、`db:migrate`、`drizzle orm`、`输入框改了列表没变`、`hydration`、`pnpm` 后，当前判断仍以规则层增强优先，暂不进入 SQLite FTS。
- 2026-04-17：已完成一轮搜索规则层小修；先通过 `pnpm test -- tests/unit/note-search.test.ts tests/unit/note-service.test.ts` 固化 `DEVBRAIN_DB_FILE` 尾部噪声与 `pnpm` 排序回归，再通过 `pnpm test:e2e -- tests/e2e/search-notes.spec.ts` 与 `pnpm lint` 验证搜索主路径未回退。
- 2026-04-17：已完成测试基线修复；`tests/unit/smoke.test.tsx` 现通过 mock dashboard service 脱离真实 SQLite schema，`playwright.config.ts` 的 webServer 已切到 `corepack pnpm`，并已在服务器上通过 `corepack pnpm lint`、`corepack pnpm test`、`corepack pnpm build`、`corepack pnpm test:e2e`。
