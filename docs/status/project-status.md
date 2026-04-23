# DevBrain 项目状态

文档状态：active
最后更新：2026-04-23
当前阶段：v0.2 AI Assist Layer
当前分支：`main`
关联计划：`docs/plan/v0.2-ai-assist-layer.md`（历史归档见 `docs/plan/history.md`）
关联规则：`docs/index.md`、`AGENTS.md`

## 当前焦点

v0.1 MVP 主线与搜索 / 相关推荐质量升级已完成并经真实数据验证；当前进入 v0.2 AI Assist Layer 阶段，计划详见 `docs/plan/v0.2-ai-assist-layer.md`。

## 已完成

- 已完成 Phase A / A1：仓库已将稳定基线 `4681a77` 发布到 `origin/main`，并创建 / 推送 `origin/feat/v0.2-ai-assist`；该分支已完成 v0.2 启动阶段的阶段性职责，当前仓库分支状态以上方「当前分支」字段为准。
- 已完成 v0.2 文档口径对齐：`README.md`、`docs/index.md`、`docs/plan/history.md`、`docs/plan/v0.2-ai-assist-layer.md`、`docs/status/project-status.md` 现已统一把 v0.2 视为正式启动阶段。
- 已完成一轮 design 文档治理：`docs/design/` 已移除已完成但继续独立存在的 v0.1 验证文档与过远的未来实验文档；v0.1 现统一收敛到 `docs/design/v0.1-mvp-foundation.md`，阶段蓝图改为 `docs/design/v0.2-v0.4-product-blueprint.md`，主 PRD 与未来数据模型也已按当前主线重写。
- 已完成 Phase A / A2：新增 `src/features/ai/ai.types.ts`、`src/features/ai/ai.provider.ts`、`src/features/ai/providers/dashscope.ts`，建立 AI provider 抽象层与默认百炼 Anthropic 兼容 provider。
- 已完成 Phase A / A3：新增 `src/features/ai/ai.config.ts`、`src/features/ai/ai.client.ts`，补齐 `DEVBRAIN_AI_API_KEY` / `DEVBRAIN_AI_PROVIDER` / `DEVBRAIN_AI_ENABLED` / `DEVBRAIN_AI_BASE_URL` / `DEVBRAIN_AI_MODEL` 配置解析与无 key 自动降级。
- 已完成 Phase A / A4：新增 `src/app/actions/ai-extract.ts`、`src/app/actions/ai-suggest-tags.ts` 及 shared helper，AI 候选结果现以临时 action state 返回，不写入主数据。
- 已补齐 v0.2 基础设施首轮单元测试：新增 `tests/unit/ai-provider.test.ts`、`tests/unit/ai-config.test.ts`、`tests/unit/ai-extract-action.test.ts`，覆盖 provider 工厂、配置降级、singleton client 与候选态 action 骨架。
- 已完成 Phase B / B1：新增 `src/features/ai/prompts/extract-fields.ts`，并在 `src/features/ai/providers/dashscope.ts` 中打通结构字段提取、JSON 解析与 confidence 归一化。
- 已完成 Phase B / B2：新增 `src/features/ai/prompts/suggest-tags.ts`，并在 `src/features/ai/providers/dashscope.ts` 中打通标签 / 技术栈建议及 canonicalization 对齐。
- 已完成 Phase B / B3：`src/components/note-editor-form.tsx` 已接入 `AI 辅助提取` 按钮、候选面板与逐字段 `采纳 / 修改 / 忽略` 交互；AI 候选仍只回填本地表单，不自动持久化。
- 已完成 Phase B / B3 测试收口：新增 `tests/unit/note-editor-form-ai.test.tsx` 覆盖按钮显隐、候选展示与回填交互；新增 `tests/e2e/ai-extract.spec.ts` 覆盖编辑页 `提取 -> 采纳 -> 提交` 闭环；`playwright.config.ts` 与 `src/app/api/mock-ai/v1/messages/route.ts` 现提供受环境变量保护的测试用 mock AI 路由，确保浏览器回归可稳定复验。
- 已完成 Phase B / B4：`src/components/note-editor-form.tsx` 已在标签 / 技术栈区域接入 `AI 建议` 按钮、建议 chip 与技术栈一键应用交互；标签建议会按当前输入去重后再回填，不自动覆盖已有值。
- 已完成 Phase B / B4 测试收口：`tests/unit/note-editor-form-ai.test.tsx` 现扩展覆盖标签建议请求、去重采纳与技术栈应用；新增 `tests/e2e/ai-suggest-tags.spec.ts` 覆盖编辑页 `建议 -> 采纳 -> 保存` 浏览器闭环。
- 已完成 Phase C / C1：新增 `src/app/actions/ai-compress.shared.ts`、`src/app/actions/ai-compress.ts` 与 `src/features/ai/prompts/compress-summaries.ts`，`src/features/ai/providers/dashscope.ts` 现已支持批量压缩搜索结果摘要，避免列表页逐条请求百炼接口。
- 已完成 Phase C / C1 列表页接入：`src/components/note-list.tsx` 现保持首屏 excerpt 先渲染，再在 Hydration 后按批量请求补充 `AI 快速提示`；`src/app/notes/page.tsx` 会按运行时 `aiEnabled` 仅在 `/notes` 页面开启该能力，不影响首页最近更新列表；在首轮 provider tuning 收口后，当前默认批量窗口已收敛为 `6`。
- 已完成 Phase C / C1 测试收口：新增 `tests/unit/ai-compress-action.test.ts`、`tests/unit/ai-compress-summaries.test.ts`、`tests/unit/note-list-ai.test.tsx` 与 `tests/e2e/ai-compress.spec.ts`，覆盖批量 action、DashScope 解析、列表懒加载渲染与浏览器闭环。
- 已完成 Phase C / C2：新增 `src/features/ai/ai.test-control.ts` 与 `src/app/api/mock-ai/control/route.ts`，为 Playwright 提供仅测试态可用的 AI 故障注入开关，可稳定模拟“AI 不可用 / provider error / malformed payload / empty payload”场景。
- 已完成 Phase C / C2 降级收口：`src/features/ai/ai.config.ts`、`src/features/ai/ai.client.ts`、`src/app/notes/page.tsx`、`src/app/notes/[id]/edit/page.tsx` 现统一按运行时可用性控制 AI 入口显隐；`src/features/ai/providers/dashscope.ts` 已把空响应与异常 JSON 降级为“空候选 / 空摘要”，避免直接炸穿编辑或列表主流程。
- 已完成 Phase C / C2 测试收口：`tests/unit/ai-extract-fields.test.ts`、`tests/unit/ai-suggest-tags.test.ts`、`tests/unit/ai-compress-summaries.test.ts` 已扩展覆盖 malformed payload 降级；`tests/unit/note-editor-form-ai.test.tsx`、`tests/unit/note-list-ai.test.tsx` 已覆盖错误提示与空候选 UI；新增 `tests/e2e/ai-degradation.spec.ts` 验证 AI 不可用显隐、provider error 友好提示与 malformed payload 空候选路径。
- 已完成 Phase C / C3：新增 `tests/e2e/ai-happy-path.spec.ts`，把 `创建 Inbox 条目 -> 进入编辑 -> AI 提取 -> 采纳并保存为 Digested -> 搜索找到 -> 查看 AI 快速提示` 串成独立浏览器主流程，补齐 v0.2 AI Assist Layer 的端到端主路径验证。
- 已完成 Phase C / C3 测试收口：`src/app/api/mock-ai/v1/messages/route.ts` 现保留 seeded 固定摘要断言，并为新建条目补齐基于压缩 prompt 内容的通用 fallback，确保列表页压缩提示在真实创建数据上也能稳定生成。
- 已完成一轮真实百炼 C3 人工联调：基于隔离 SQLite 库跑通 `创建 -> 编辑 -> AI 提取 -> 采纳 -> 保存 -> 搜索 -> 查看 AI 快速提示` 主路径，真实输出可直接落回表单与详情页；其中编辑页 AI 提取候选约 38.4 s，搜索结果首屏约 0.18 s 可见，列表页 `AI 快速提示` 约 15.8 s 后补齐，说明 C1 的惰性加载已保护首屏，但真实 AI 等待成本仍偏高。
- 已完成列表页压缩提示会话级缓存：`src/components/note-list.tsx` 现会按 `note.id + updatedAt` 在当前会话内缓存已生成的 `AI 快速提示`；同一条目在列表页反复打开、切换筛选或返回搜索结果时可直接复用，只有条目更新时间变化后才重新请求百炼。
- 已完成编辑页 AI 提取等待反馈优化：`src/components/note-editor-form.tsx` 现会在 `AI 辅助提取` 进行中展示明确的长等待提示，直接告知“真实百炼调用通常需要 20~40 秒”，并提示用户可以继续编辑表单其他字段，不必原地等待。
- 已完成编辑页 AI 建议等待反馈优化：`src/components/note-editor-form.tsx` 现会在 `AI 建议` 进行中展示与提取一致的长等待提示，明确说明“真实百炼调用通常需要 20~40 秒”，并提示用户可以继续完善原始输入或手动编辑标签。
- 已完成第二轮真实百炼等待提示人工联调：使用隔离 SQLite 库与真实百炼配置，针对编辑页 `AI 辅助提取` / `AI 建议` 重新验证长等待提示。实测等待提示会在点击后约 31~43 ms 内出现，提取候选约 13.9 s 返回、建议候选约 26.0 s 返回，结果到达后提示会自动消失；当前判断是等待反馈文案在真实慢响应下清晰可见，但真实模型时延仍需继续观察。
- 已完成首轮 provider tuning：`src/features/ai/ai.config.ts`、`src/features/ai/providers/dashscope.ts`、`src/features/ai/prompts/compress-summaries.ts`、`src/app/actions/ai-compress.shared.ts`、`src/components/note-list.tsx` 现已补齐任务级 `max_tokens` 与列表批量窗口配置，并把压缩 prompt 收紧为“结构字段优先、`rawInput` 兜底”的更轻载荷。当前默认值为：提取 `700`、建议 `300`、压缩 `480`、批量窗口 `6`。
- 已完成 v0.2 review follow-up 收口：`src/app/actions/ai-extract.shared.ts` 现会把编辑页当前尚未保存的 `title / tags / stack` 一并传给提取链路，避免 AI 候选仍基于数据库旧上下文生成；`src/features/ai/ai.client.ts` 现已把 `baseUrl` / `model` 纳入 singleton cache key，切换真实百炼入口或模型时会正确重建 client。
- 已补齐 v0.2 review follow-up 回归测试：`tests/unit/ai-extract-action.test.ts` 已新增“当前表单上下文优先”用例，`tests/unit/ai-config.test.ts` 已新增“runtime model 变化时重建 client”用例；并已再次通过 AI 相关单测、关键 E2E、`pnpm lint` 与 `pnpm build` 验证。
- 已补齐 Phase B 首轮单元测试：新增 `tests/unit/ai-extract-fields.test.ts`、`tests/unit/ai-suggest-tags.test.ts`，覆盖 prompt 构建、百炼成功响应、空输入短路与错误处理。
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
- 已完成 handoff 留痕：MVP 主线与搜索质量升级的阶段性计划都已归档到 `docs/plan/history.md`，当前活跃计划已切换为 `docs/plan/v0.2-ai-assist-layer.md`。
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

- v0.2 AI Assist Layer 已正式启动；当前活跃计划为 `docs/plan/v0.2-ai-assist-layer.md`。
- Phase A（基础设施）、Phase B（B1-B4）与 Phase C（C1-C3）已完成；当前进入真实联调后的观察与收口阶段，等待反馈文案已完成真实复核，provider tuning 首轮实现也已落地，下一步重点转向重新验证调优后的真实时延分布。
- 搜索演进路线仍以规则层增强优先；若 Phase B 验证后语义召回缺口明显，可在 Phase D 评估 embedding。

## 风险 / 阻塞

- 当前本地环境的 `pnpm` 会对原生依赖启用 build script 审批；新装依赖后需确认 `better-sqlite3` 绑定已经构建完成。
- 当前 AI 默认依赖阿里云百炼 Anthropic 兼容接口；若本地网络环境、地域入口或模型配额受限，需要通过 `DEVBRAIN_AI_BASE_URL` / `DEVBRAIN_AI_MODEL` 调整配置后再验证。2026-04-19 的真实 C3 联调已在隔离库上跑通：编辑页 AI 提取候选约 38.4 s，搜索结果首屏约 0.18 s 可见，`AI 快速提示` 约 15.8 s 后补齐；当前判断是列表页 lazy load 策略有效，但编辑页提取与压缩提示的真实等待成本仍需继续评估。
- 当前新增的会话级缓存只能优化“重复进入列表”的等待，不会缩短首次请求真实百炼时的延迟；本轮虽已把压缩提示默认批量窗口从固定大窗口收紧为 `6` 且压缩 prompt 更轻，但是否足以改善首访体感仍要靠下一轮真实联调确认。
- 2026-04-19 的第二轮真实等待提示联调已确认：编辑页等待提示会在点击后数十毫秒内出现，并在提取候选约 13.9 s、建议候选约 26.0 s 返回后自动消失；但这仍只是在体验层缓解真实百炼等待，不会降低模型时延，若更多样本持续落在 15~30 s 以上，仍需要继续评估 provider 参数、缓存或异步化交互。
- 当前搜索虽已补齐显式相关性排序，但仍未引入 SQLite FTS；如果数据规模明显增长，需要优先评估索引与检索性能升级。
- 本轮大样本评估里，`DEVBRAIN_DB_FILE` 查询尾部仍会沾到 `file` 类泛词噪声，`pnpm` 这类泛查询也还会混入部分数据库 / 工具链条目；这更像规则权重与 stopword 细化问题，不是当前必须引入 FTS 的证据。
- 当前相关推荐采用固定权重规则，尚未纳入“最近访问关系加权”或更细的质量反馈；如果后续出现误召回，需要再评估权重和排序信号。
- `pnpm seed` 现已拒绝直接覆盖隐式默认主库；若后续确需重置主库，必须显式设置 `DEVBRAIN_ALLOW_DEFAULT_DB_RESET=true`，否则命令会中止。
- 本地 fresh setup 仍需要显式执行 `pnpm db:migrate` 或 `pnpm seed` 才会创建表结构，运行前置步骤不能省略。
- 旧兼容入口文档与历史活跃计划文件已被清理；如果外部书签、脚本或历史链接仍指向旧路径，需要同步更新到 `docs/index.md`、`docs/status/project-status.md`、`docs/plan/history.md` 或新的 `docs/plan/*.md`。

## 下一步

- 基于已落地的首轮 provider tuning，重新跑一轮真实百炼验证，重点观察提取 / 建议 / 压缩提示的实际时延是否明显下降。
- 如果调优后的真实结果仍然显示列表首访压缩提示偏慢，再继续评估服务端持久化缓存或更激进的预取方案，而不是立刻进入重型异步任务架构。
- 继续观察真实百炼接口在列表页批量压缩场景下的时延与配额表现，必要时再调小批量窗口或补缓存策略。
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
- 2026-04-19：v0.2 正式启动后的首轮基础设施骨架已按红绿循环完成；先通过 `pnpm test -- tests/unit/ai-provider.test.ts tests/unit/ai-config.test.ts tests/unit/ai-extract-action.test.ts` 固化 provider / config / action 契约，再通过 `pnpm lint`、`pnpm test`、`pnpm build` 完成当前基线验证。
- 2026-04-19：Phase B / B1-B2 已按红绿循环完成；先通过 `pnpm test -- tests/unit/ai-extract-fields.test.ts tests/unit/ai-suggest-tags.test.ts` 固化 prompt 与百炼 provider 契约，再通过 `pnpm lint`、`pnpm test`、`pnpm build` 验证提取 / 建议能力未破坏现有主路径。
- 2026-04-19：已使用本地 `.env.local` 的真实百炼 API key 完成一轮人工联调 smoke test；`extractStructuredFields` 与 `suggestTags` 在默认配置 `dashscope + qwen3.6-plus` 下均返回可用候选，串行两次请求总耗时约 60.7s，当前判断 provider / prompt 主路径可用，但 B3/B4 需要把加载反馈与降级提示做完整。
- 2026-04-19：Phase B / B3 已按红绿循环完成；先通过 `pnpm test -- tests/unit/note-editor-form-ai.test.tsx` 固化编辑页按钮显隐、候选展示与回填交互，再通过 `pnpm test:e2e -- tests/e2e/ai-extract.spec.ts` 验证 `提取 -> 采纳 -> 提交` 浏览器闭环，最后通过 `pnpm lint && pnpm test && pnpm build && pnpm test:e2e` 完成阶段基线验证。
- 2026-04-19：Phase B / B4 已按红绿循环完成；先通过 `pnpm test -- tests/unit/note-editor-form-ai.test.tsx` 固化标签建议请求、去重采纳与技术栈应用交互，再通过 `pnpm test:e2e -- tests/e2e/ai-suggest-tags.spec.ts` 验证 `建议 -> 采纳 -> 保存` 浏览器闭环，最后通过 `pnpm lint && pnpm test && pnpm build && pnpm test:e2e` 完成阶段基线验证。
- 2026-04-19：Phase C / C1 已按红绿循环完成；先通过 `pnpm test -- tests/unit/ai-compress-action.test.ts tests/unit/ai-compress-summaries.test.ts tests/unit/note-list-ai.test.tsx` 固化批量压缩 action、DashScope 解析与列表懒加载渲染，再通过 `pnpm test:e2e -- tests/e2e/ai-compress.spec.ts` 验证搜索结果 `首屏展示 -> AI 快速提示异步补充` 浏览器闭环，最后通过 `pnpm lint && pnpm test && pnpm build && pnpm test:e2e` 完成阶段基线验证。
- 2026-04-19：Phase C / C2 已按红绿循环完成；先通过 `pnpm test -- tests/unit/ai-extract-fields.test.ts tests/unit/ai-suggest-tags.test.ts tests/unit/ai-compress-summaries.test.ts tests/unit/note-editor-form-ai.test.tsx tests/unit/note-list-ai.test.tsx` 固化 malformed payload 降级、空候选 UI 与列表失败态，再通过 `pnpm test:e2e -- tests/e2e/ai-degradation.spec.ts` 验证 AI 不可用隐藏入口、provider error 友好提示与 malformed payload 浏览器降级路径，最后通过 `pnpm lint && pnpm test && pnpm build && pnpm test:e2e` 完成阶段基线验证。
- 2026-04-19：Phase C / C3 已按红绿循环完成；先通过 `pnpm test:e2e -- tests/e2e/ai-happy-path.spec.ts` 锁定“新建条目缺少 AI 压缩提示”红灯，再扩展 `src/app/api/mock-ai/v1/messages/route.ts` 为非 seeded 条目补齐通用压缩摘要 fallback，最后通过 `pnpm lint`、`pnpm test`、`pnpm build`、`pnpm test:e2e` 完成 Phase C 最终基线验证。
- 2026-04-19：已完成一轮真实百炼 C3 人工联调；使用隔离数据库 `DEVBRAIN_DB_FILE=/tmp/devbrain-real-c3-20260419.sqlite` 与本地 `.env.local` 中的真实百炼配置，跑通 `创建 -> 编辑 -> AI 提取 -> 采纳 -> 保存 -> 搜索 -> 查看 AI 快速提示` 主流程。实测编辑页 AI 提取候选约 38.4 s，搜索结果首屏约 0.18 s 可见，列表页 `AI 快速提示` 约 15.8 s 后补齐，当前判断是输出质量可用、首屏惰性加载策略有效，但真实等待成本仍偏高。
- 2026-04-19：已完成列表页压缩提示会话级缓存；先通过 `tests/unit/note-list-ai.test.tsx` 新增“同会话复用缓存、`updatedAt` 变化后失效”红灯用例，再在 `src/components/note-list.tsx` 增加基于 `note.id + updatedAt` 的会话内缓存，最后通过 `pnpm test -- tests/unit/note-list-ai.test.tsx` 转绿。
- 2026-04-19：已完成编辑页 AI 提取等待反馈优化；先通过 `tests/unit/note-editor-form-ai.test.tsx` 新增“提取进行中展示 20~40 s 长等待提示且允许继续编辑”红灯用例，再在 `src/components/note-editor-form.tsx` 增加加载提示卡片，最后通过 `pnpm test -- tests/unit/note-editor-form-ai.test.tsx` 转绿。
- 2026-04-19：已完成编辑页 AI 建议等待反馈优化；先通过 `tests/unit/note-editor-form-ai.test.tsx` 新增“建议进行中展示 20~40 s 长等待提示且允许继续手动编辑”红灯用例，再在 `src/components/note-editor-form.tsx` 增加加载提示卡片，最后通过 `pnpm test -- tests/unit/note-editor-form-ai.test.tsx` 转绿。
- 2026-04-19：已完成第二轮真实百炼等待提示人工联调；使用隔离库 `DEVBRAIN_DB_FILE=/tmp/devbrain-real-wait-20260419.sqlite` 启动本地服务后，通过 `pnpm exec playwright test -c /tmp/devbrain-real-wait-run/playwright.config.js` 验证编辑页等待提示链路。实测提取提示约 43 ms 出现、13.9 s 返回候选，建议提示约 31 ms 出现、26.0 s 返回候选，且结果到达后等待提示自动消失，说明新增文案在真实慢响应下可见且不阻塞后续结果展示。
- 2026-04-19：已完成首轮 provider tuning 收口；先通过 `pnpm test -- tests/unit/ai-config.test.ts tests/unit/ai-provider.test.ts tests/unit/ai-extract-fields.test.ts tests/unit/ai-suggest-tags.test.ts tests/unit/ai-compress-summaries.test.ts tests/unit/ai-compress-action.test.ts tests/unit/note-list-ai.test.tsx` 固化任务级 `max_tokens`、压缩 prompt 瘦身与批量窗口配置，再通过 `pnpm lint`、`pnpm test`、`pnpm build` 完成当前基线验证。
- 2026-04-19：已完成 v0.2 review follow-up 收口；先通过 `pnpm test -- tests/unit/ai-extract-action.test.ts tests/unit/ai-config.test.ts` 固化“提取链路优先使用当前表单 `title / tags / stack`”与“切换 runtime model 时重建 AI client”两条红灯，再通过 `pnpm lint`、`pnpm test -- tests/unit/ai-provider.test.ts tests/unit/ai-config.test.ts tests/unit/ai-extract-action.test.ts tests/unit/ai-extract-fields.test.ts tests/unit/ai-suggest-tags.test.ts tests/unit/ai-compress-action.test.ts tests/unit/ai-compress-summaries.test.ts tests/unit/note-editor-form-ai.test.tsx tests/unit/note-list-ai.test.tsx`、`pnpm build`、`pnpm test:e2e -- tests/e2e/ai-happy-path.spec.ts tests/e2e/ai-degradation.spec.ts` 完成复核。
