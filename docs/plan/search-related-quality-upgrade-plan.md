# 搜索与相关推荐质量升级计划（Codex 实施版）

文档状态：draft
最后更新：2026-04-16
负责人：Hermes（起草） / Codex（实施）
关联设计：`docs/design/search-and-recall-evolution.md`
关联状态：`docs/status/project-status.md`

## 1. 目标与完成定义

- 目标：在不引入 SQLite FTS、embedding 或新 schema 的前提下，沿现有 `note.search.ts` / `note.related.ts` / `note.normalization.ts` seam，补齐中文模糊检索、术语 canonicalization、排序权重和相关推荐去噪，让 R1~R3 训练暴露的问题转成可回归、可实施的代码改进。
- 完成定义：
  - 搜索层能更稳定处理中英混合、术语分叉与数据库命令/路径类查询，不再只依赖 ASCII token。
  - `drizzle orm / drizzle-orm / drizzle-kit / db:migrate / migrate`、`DEVBRAIN_DB_FILE / demo db / validation db / 默认主库` 等表达分叉能更稳地落到同一问题簇。
  - 数据库主题查询的排序更看重 `commands / references / why / path-like token`，而不是只被泛技术词或旧问题簇压制。
  - related 在保持可解释性的前提下，减少泛词噪声；对数据库操作链（seed -> migrate -> bindings）保持可用。
  - 至少补齐一组直接覆盖 R2/R3 的单元 / E2E 回归验证，并通过 `lint + test + build`。

## 2. 范围

- In scope：
  - 修改 `src/features/notes/note.normalization.ts`
  - 修改 `src/features/notes/note.search.ts`
  - 修改 `src/features/notes/note.related.ts`
  - 必要时小幅修改 `src/features/notes/note.service.ts`，但仅限接线与排序整合
  - 新增或扩展相关单元测试：
    - `tests/unit/note-normalization.test.ts`（若不存在则新建）
    - `tests/unit/note-search.test.ts`
    - `tests/unit/note-related.test.ts`
    - `tests/unit/note-service.test.ts`
  - 如需浏览器级回归，可修改：
    - `src/db/demo-seed.ts`
    - `tests/e2e/search-notes.spec.ts`
    - `tests/e2e/related-notes.spec.ts`
  - 实施完成后回写：
    - `docs/status/project-status.md`
    - 如边界有变化，再回写 `docs/design/search-and-recall-evolution.md`
- Out of scope：
  - 新增 SQLite FTS migration
  - 引入 embedding / 向量检索 / 外部搜索服务
  - 修改数据库 schema
  - 重写搜索页面 UI / 路由结构
  - 重做 Digested gate 或改变 note 生命周期
  - 做与本轮无关的文档整理、仓库治理或部署动作

## 3. 任务拆分

- [ ] 任务 1：固化 R1~R3 的搜索 / related 回归样本
  - 目标：先把训练中已经暴露的问题写成测试，避免后面只能靠“感觉更好”判断。
  - 主要文件：
    - 新建 `tests/unit/note-normalization.test.ts`
    - 修改 `tests/unit/note-search.test.ts`
    - 修改 `tests/unit/note-related.test.ts`
    - 修改 `tests/unit/note-service.test.ts`
  - 必须覆盖的回归点：
    - 中文模糊现象：`输入框改了列表没变`
    - 数据库边界词：`默认主库`、`validation 库`
    - 表达分叉：`drizzle orm` / `drizzle-orm`
    - 命令与路径类词：`db:migrate`、`DEVBRAIN_DB_FILE`
    - related 链路：seed 记录应优先带出 migrate 记录；migrate 记录应能反向带出 seed 记录
  - 约束：
    - 测试数据不要依赖这台云服务器当前 validation DB 的现场内容。
    - 使用内存库或 demo seed 构造稳定回归样本。

- [ ] 任务 2：扩展 canonicalization 共享层
  - 目标：把当前仅覆盖标签 / 技术栈少量 alias 的规范化层，扩成搜索和 related 可共用的术语归一入口。
  - 主要文件：
    - 修改 `src/features/notes/note.normalization.ts`
    - 新增或扩展 `tests/unit/note-normalization.test.ts`
  - 最低要求：
    - 保持现有标签 / 技术栈 canonicalization 不回退。
    - 新增查询层归一能力，至少覆盖：
      - `drizzle orm`、`drizzle-orm`、`drizzle kit`、`drizzle-kit`
      - `db migrate`、`db:migrate`、`migrate`
      - `better sqlite3`、`better-sqlite3`
      - `demo db`、`validation db`、`默认主库`
      - `server action`、`server component`、`hydration mismatch`（不要破坏 R2 已有词）
    - 设计成可复用 helper，避免在 search / related 各自写一份 alias 表。
  - 明确不要做的事：
    - 不要引入复杂 NLP 库。
    - 不要为未来假想场景过度抽象。

- [ ] 任务 3：升级 `note.search.ts` 的 query tokenization 与匹配逻辑
  - 目标：让搜索对中文片段、中英混合词、命令/路径 token 更友好，同时保持现有 SQL prefilter 简单可解释。
  - 主要文件：
    - 修改 `src/features/notes/note.search.ts`
    - 修改 `tests/unit/note-search.test.ts`
  - 最低要求：
    - 保留当前多字段搜索入口：`title / rawInput / summary / problem / solution / why / commands / references`
    - 在 tokenization 层补：
      - 中文连续片段或可用短语 token
      - path-like / command-like token（如 `db:migrate`、`DEVBRAIN_DB_FILE`）
      - canonicalized token
    - `buildNoteSearchCondition()` 仍保持 MVP 级简单，不引入 FTS；如果需要，可以在 SQL prefilter 和内存重排之间分工，但不要把逻辑散回 service 层。
  - 验收重点：
    - `默认主库` 能命中对应记录
    - `DEVBRAIN_DB_FILE` 能稳定命中新问题簇
    - `drizzle orm` 不应完全丢失 `drizzle-orm` 相关结果
    - 不要破坏现有 `hydration`、`useEffect`、`pnpm` 等英文查询行为

- [ ] 任务 4：重调搜索排序权重，让数据库操作语境更靠前
  - 目标：修正“能搜到，但排序不够懂当前上下文”的问题。
  - 主要文件：
    - 修改 `src/features/notes/note.search.ts`
    - 必要时修改 `src/features/notes/note.service.ts`
    - 修改 `tests/unit/note-service.test.ts`
  - 排序原则：
    - 数据库主题里，`commands / references / why / path-like token` 的信号应强于泛技术词。
    - Digested 可继续有质量加成，但不能让 status 成为唯一主导。
    - 同分时继续保持稳定且可解释的次级排序。
  - 必须新增的验证：
    - `db:migrate` 查询时，目标库 / migrate 记录要比泛 `better-sqlite3` 工具链记录更懂当前语境。
    - `validation 库` 查询时，数据库目标路径相关记录应稳定排前。

- [ ] 任务 5：升级 `note.related.ts`，优先做去噪与 canonical 信号整合
  - 目标：保留 related 的可解释性和已验证价值，同时减少被 `server`、`file` 这类泛词误召回的概率。
  - 主要文件：
    - 修改 `src/features/notes/note.related.ts`
    - 必要时复用 `src/features/notes/note.normalization.ts`
    - 修改 `tests/unit/note-related.test.ts`
    - 修改 `tests/unit/note-service.test.ts`
  - 最低要求：
    - related 评分继续可解释，输出理由不要变成黑盒分数。
    - 标题词重叠不应只看原始 ASCII token；至少要让 canonical term 或更稳健的 token 能参与。
    - 共享标签、同技术栈、命令词重叠继续保留，但权重要更有助于真实问题簇。
    - 对过于泛化的 token 做降权或停用词扩展，至少覆盖训练里已经暴露的噪声词。
  - 验收重点：
    - 数据库 seed / migrate 两条记录能稳定互相推荐。
    - 前端主题里不要因为 `server` 这类泛词把无关条目抬得过高。

- [ ] 任务 6：补最小浏览器级回归（如确有必要）
  - 目标：让 Codex 不只在 unit 层看见改进，而能在真实 `/notes` 和 detail 页确认关键路径。
  - 首选方案：
    - 修改 `src/db/demo-seed.ts`，增加少量 R2/R3 风格回归样本，但不要把 demo 数据膨胀成训练数据库镜像。
    - 更新 `tests/e2e/search-notes.spec.ts` 与 / 或 `tests/e2e/related-notes.spec.ts`
  - 浏览器级最低覆盖：
    - 至少 1 个中文或中英混合查询能命中目标条目
    - 至少 1 条数据库卡片 detail 页能把相邻数据库卡片带出来
  - 注意：
    - 修改 demo seed 后，检查现有 E2E 的结果数断言是否需要同步收紧或放宽。

- [ ] 任务 7：文档回写与计划收口
  - 目标：实现完成后，把事实回到正确文档，不让临时计划长期滞留。
  - 主要文件：
    - 修改 `docs/status/project-status.md`
    - 如边界变化明显，再修改 `docs/design/search-and-recall-evolution.md`
    - 完成后修改 `docs/plan/history.md`
    - 删除当前文档 `docs/plan/search-related-quality-upgrade-plan.md`
  - 写回规则：
    - `project-status.md` 只写已完成事项、风险变化、下一步，不贴任务流水账。
    - `search-and-recall-evolution.md` 只在设计边界变化时更新，不把实现细节塞进去。
    - `history.md` 只留概要：文档路径、阶段/主题、完成日期、结果摘要。

## 4. 验证基线

- 需要运行的验证命令：
  - 聚焦单测：
    - `cd /srv/apps/devbrain/app && corepack pnpm test -- tests/unit/note-normalization.test.ts tests/unit/note-search.test.ts tests/unit/note-related.test.ts tests/unit/note-service.test.ts`
  - 浏览器回归（若任务 6 落地）：
    - `cd /srv/apps/devbrain/app && corepack pnpm test:e2e -- tests/e2e/search-notes.spec.ts tests/e2e/related-notes.spec.ts`
  - 最终基线：
    - `cd /srv/apps/devbrain/app && corepack pnpm lint`
    - `cd /srv/apps/devbrain/app && corepack pnpm test`
    - `cd /srv/apps/devbrain/app && corepack pnpm build`
- 需要人工确认的行为：
  - `/notes?q=默认主库` 能出现数据库安全边界卡片，而不是完全 miss。
  - `/notes?q=DEVBRAIN_DB_FILE` 与 `/notes?q=db:migrate` 的前排结果更接近数据库路径 / 迁移语境，而不是被旧工具链记录完全压住。
  - 目标数据库卡片的 detail 页，第一相关推荐应优先是同簇数据库卡片。
  - 已有英文路径（如 `hydration`、`pnpm`）不应明显回退。

## 5. 回写规则

- 状态回写到：`docs/status/project-status.md`
- 设计回写到：`docs/design/search-and-recall-evolution.md`（仅在边界或升级判据有变化时）
- 完成后是否归档：是。实现验收通过后，在 `docs/plan/history.md` 留一条概要记录，然后删除本文件 `docs/plan/search-related-quality-upgrade-plan.md`。
- 版本管理约定：
  - 这份文档虽然是临时计划，但应作为仓库内的短期版本化文件存在，方便 Codex 与本地 repo 读取。
  - 不要把“实时进度”写回本文件；实时进度只写 `docs/status/project-status.md`。
  - 删除本文件应通过正常 git 删除完成，而不是只在服务器上手工删。

## 6. 风险与依赖

- 风险 1：中文 tokenization 如果做得过粗，可能把噪声也一起放大，导致召回变多但排序更乱。
- 风险 2：canonicalization 表如果写散在多个文件，会出现搜索与 related 口径不一致。
- 风险 3：修改 demo seed 可能影响现有 E2E 的结果数量断言，需要同步收紧测试表达。
- 风险 4：数据库主题排序如果过度偏向命令/路径，可能压低现有前端/工具链卡片的合理命中。
- 依赖 1：实现必须沿当前 seam 推进：`note.normalization.ts`、`note.search.ts`、`note.related.ts`；不要绕开这些模块把逻辑重新塞回页面层。
- 依赖 2：当前环境仍依赖 `better-sqlite3`；若本地 fresh install 再次出现 bindings 问题，先按 `README.md` 与 `docs/status/project-status.md` 的已知口径恢复环境，再做实现。
- 依赖 3：本计划默认不触发新的 schema / migration；如果实施过程中发现必须改 schema，需先回到设计评估，不要直接扩写本计划。