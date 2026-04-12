# DevBrain 未来数据模型草案

文档状态：future draft
最后更新：2026-04-12
适用范围：v0.3+ 以后对 Knowledge Network / Decision Trails / Contextual Recall / Second Brain Layer 的建模讨论

## 1. 这份文档解决什么问题

`product-requirements.md` 解决的是产品边界，`implementation-plan.md` 解决的是 MVP 落地顺序。

这份文档单独回答一个更长期的问题：

当 DevBrain 从“知识卡片系统”继续生长为“知识网 / 决策路径 / 情境召回系统”时，底层数据模型应该如何演进，才能：
- 不推翻 v0.1 的 Note 主模型
- 保持 local-first
- 逐步支持实体、关系、上下文、决策和召回事件
- 为未来 repo integration 和 capability map 留出空间

注意：这不是当前 MVP 的交付要求，而是未来建模蓝图。

## 2. 设计原则

### 2.1 Note-first, graph-later
先有稳定的知识卡片，再长出显式知识对象和关系网络。

### 2.2 Structured memory before smart inference
先把“记录了什么、验证了什么、在什么情境下有效”存清楚，再谈更高级的推断。

### 2.3 Context is first-class
未来的第二大脑不只存知识内容，还要存知识出现、验证、复用的上下文。

### 2.4 Decision trace matters
程序员真正想复用的，不只是 solution，还包括当时为什么这样选、没选什么、适用边界是什么。

### 2.5 Source of truth stays local
在单人阶段，本地数据库仍是 canonical source of truth。未来增加图、召回、repo 绑定时，也应优先扩展本地模型，而不是替换主存储。

## 3. 建模分层

长期看，DevBrain 的数据可分成 5 层。

### Layer A：Memory Layer
最原始的记录层。

目标：保留用户真实经历过的碎片和整理结果。

核心对象：
- Note
- Tag
- NoteTag

### Layer B：Knowledge Object Layer
把 Note 中反复出现的知识对象逐步显式化。

核心对象：
- Concept
- Problem
- Solution
- Procedure
- Pitfall
- Reference

### Layer C：Decision Layer
把“如何判断”沉淀成可复用对象。

核心对象：
- Decision
- DecisionFactor
- DecisionOption
- Evidence

### Layer D：Context Layer
把知识和真实工作情境绑定起来。

核心对象：
- Project
- Repo
- File
- Context
- ArtifactLink

### Layer E：Recall & Capability Layer
记录知识何时被召回、是否有帮助、哪些区域更熟/更空白。

核心对象：
- RecallEvent
- ReviewEvent
- CapabilitySignal

## 4. 核心实体草案

以下不是要求一次实现，而是长期统一语义。

### 4.1 Note
说明：知识系统的基础记录单位，保留原始输入与结构化整理结果。

建议字段：
- id
- title
- raw_input
- summary
- problem_text
- solution_text
- why_text
- commands_text
- references_text
- status
- confidence
- stack
- source_type
- source_url
- created_at
- updated_at

备注：
- v0.1 继续以 Note 为核心完全正确
- 后续显式对象可以从 Note 中抽取，但 Note 仍保留原始语义上下文

### 4.2 Tag
说明：轻量分类维度，用于筛选与召回增强。

建议字段：
- id
- name
- kind 可选，未来可区分 topic / stack / status-like tag / personal label
- created_at

### 4.3 Project
说明：用户的一个工作单元，可以是一个产品、仓库集合、课程项目或长期主题。

建议字段：
- id
- name
- slug
- description
- status
- created_at
- updated_at

### 4.4 Repo
说明：代码仓库对象，用来把知识和真实代码空间绑定。

建议字段：
- id
- project_id 可空
- name
- root_path
- vcs_type 例如 git
- default_branch
- last_indexed_at
- created_at
- updated_at

### 4.5 File
说明：仓库中的文件或逻辑对象锚点。

建议字段：
- id
- repo_id
- path
- file_type
- symbol_summary 可空
- last_seen_commit 可空
- created_at
- updated_at

备注：
- 后续也可以扩展到 Symbol 表，但不必一开始就上

### 4.6 Context
说明：表示一段知识产生、验证或复用时的情境。

建议字段：
- id
- project_id 可空
- repo_id 可空
- file_id 可空
- task_label 可空
- environment_label 可空
- error_signature 可空
- stage 例如 coding / debugging / deploy / refactor / study
- created_at
- updated_at

关键点：
Context 不只是“元数据”，它是未来情境召回的锚点。

### 4.7 Concept
说明：可被重复提及的概念节点，例如 peer dependency、hydration、event loop。

建议字段：
- id
- name
- normalized_name
- description
- created_at
- updated_at

### 4.8 Problem
说明：被反复遇到、可以归一化的问题类型。

建议字段：
- id
- title
- normalized_signature 可空
- description
- created_at
- updated_at

示例：
- pnpm monorepo peer dependency 冲突
- Next.js hydration mismatch
- Docker 容器内 DNS 解析失败

### 4.9 Solution
说明：可被多个 Note 或 Problem 复用的解决方案对象。

建议字段：
- id
- title
- description
- reliability_level draft / tested / trusted
- created_at
- updated_at

### 4.10 Procedure
说明：可执行步骤集合，适合排查流程、操作法、迁移步骤。

建议字段：
- id
- title
- steps_markdown
- prerequisites_text 可空
- expected_outcome 可空
- created_at
- updated_at

### 4.11 Pitfall
说明：高频误区、限制条件、不要这么做的提醒。

建议字段：
- id
- title
- description
- severity 可空
- created_at
- updated_at

### 4.12 Decision
说明：把“当时如何判断”的结果显式化。

建议字段：
- id
- title
- summary
- decision_status proposed / accepted / rejected / superseded
- chosen_option_text
- scope_text 适用边界
- created_at
- updated_at

示例：
- MVP 先不用 embedding
- 先用 SQLite，不引入图数据库
- 首版不做云同步

### 4.13 DecisionFactor
说明：影响决策的因素。

建议字段：
- id
- decision_id
- factor_type 例如 cost / complexity / speed / privacy / scale
- description
- weight 可空
- created_at

### 4.14 DecisionOption
说明：某次决策中被比较过的备选项。

建议字段：
- id
- decision_id
- option_label
- pros_text
- cons_text
- chosen boolean
- created_at

### 4.15 Evidence
说明：支撑某条知识、关系或决策的证据。

建议字段：
- id
- source_kind note / repo / file / commit / external / recall
- source_ref_id
- snippet_text 可空
- confidence
- created_at

### 4.16 Relation
说明：知识网的通用边表，用来连接不同类型节点。

建议字段：
- id
- from_type
- from_id
- to_type
- to_id
- relation_type
- weight 可空
- evidence_id 可空
- created_at
- updated_at

推荐 relation_type 示例：
- mentions
- solves
- depends_on
- similar_to
- used_in
- avoid_when
- derived_from
- verified_by
- superseded_by
- useful_when

设计建议：
- 前期使用通用 Relation 表足够灵活
- 真正出现性能或约束问题后，再考虑拆专用关系表

### 4.17 RecallEvent
说明：记录某次知识被召回的经过与效果。

建议字段：
- id
- note_id 或 target_type + target_id
- context_id 可空
- trigger_kind search / related / proactive / repo-context
- query_text 可空
- used boolean
- usefulness_rating 可空
- created_at

### 4.18 ReviewEvent
说明：记录某条知识被复习、重构、确认或升级可信度的事件。

建议字段：
- id
- note_id
- review_type revisit / verify / refine / merge / archive
- outcome_text
- created_at

### 4.19 CapabilitySignal
说明：不是直接给用户展示的“你懂不懂”，而是系统推断知识密度和稳定度的原始信号。

建议字段：
- id
- subject_type concept / problem / stack / repo
- subject_id
- signal_type repeated_success / repeated_failure / frequent_lookup / sparse_coverage / recent_growth
- value
- created_at

## 5. 关系视角：这张网是怎么长出来的

未来的知识网，不是直接“把所有 Note 连起来”，而是逐步从 Note 中长出显式对象。

### 5.1 最早期
- Note -> Tag
- Note -> Note（规则推荐，未持久化或弱持久化）

### 5.2 中期
- Note -> Concept
- Note -> Problem
- Note -> Solution
- Note -> Procedure
- Problem -> Solution
- Solution -> Pitfall
- Procedure -> Problem

### 5.3 更长期
- Decision -> DecisionFactor
- Decision -> DecisionOption
- Decision -> Evidence
- Note -> Context
- Context -> Repo / File / Project
- RecallEvent -> Note / Concept / Decision

这样知识网络就会从“条目之间相关”升级成“对象之间有语义关系”。

## 6. 阶段化落地建议

### v0.1 已有
只实现：
- notes
- tags
- note_tags

允许：
- related notes 动态计算
- 不引入复杂图结构

### v0.2 可考虑
增加轻量增强，但仍不大改主库：
- AI 抽字段
- search ranking 增强
- recall summary
- 继续保持 Note-first

### v0.3 推荐开始显式化
优先新增：
- concepts
- relations
- evidence

这一步的目标是：
让图谱开始有“语义节点”和“语义边”，而不是纯相似推荐。

### v0.4 推荐加入上下文层
优先新增：
- projects
- repos
- files
- contexts
- recall_events

这一步的目标是：
让系统能回答“这条知识在哪些项目/文件/错误场景下出现过”。

### v0.5+ 推荐加入决策与能力层
优先新增：
- decisions
- decision_factors
- decision_options
- capability_signals
- review_events

这一步的目标是：
让系统逐步具备“决策路径复用”和“能力地图”能力。

## 7. ID 与引用建议

为了未来方便扩展，建议尽早统一以下约定：

### 7.1 ID
- 所有实体统一使用字符串主键
- 可用 cuid2 / ulid / uuid 之一
- 不要不同表混用多种风格

### 7.2 时间字段
- 所有实体统一保留 created_at / updated_at
- 事件类对象至少保留 created_at

### 7.3 type-safe 引用
如果做通用 Relation 表，建议：
- 应用层用 Zod / TypeScript enum 限定 entity type 和 relation type
- 不要把所有字符串散落在 UI 里

## 8. 一个完整例子

用户在 DevBrain 中新增一条 Note：
- title: pnpm peer dependency fix
- raw_input: monorepo 里装包报 peer dependency 冲突，最后用 overrides 顶过去
- stack: nodejs
- tags: pnpm, monorepo

MVP 阶段，只需要存为：
- notes 一条
- tags 两条或复用已有标签
- note_tags 两条关系

后续知识网层可以进一步长出：
- Concept: peer dependency
- Concept: monorepo
- Problem: pnpm monorepo peer dependency conflict
- Solution: use overrides to align package versions
- Pitfall: overrides may hide underlying dependency design issues

再往后，接入上下文后可以补：
- Repo: devbrain
- File: package.json
- Context: debugging / dependency install / monorepo workspace

如果未来形成决策沉淀，还可以有：
- Decision: short-term use overrides before refactoring dependency layout
- Evidence: installation logs + package.json diff + successful rebuild

这样一条最初很碎的记录，最终就可能成为知识网中的一串节点和边。

## 9. 对当前实现的约束结论

这份未来数据模型对当前 MVP 的直接要求，只有这些：

1. 保持 Note 主模型稳定，不要过早拆太多表
2. UI 不要直接绑定数据库细节，尽量走 service 层
3. 相关条目逻辑保持模块化，方便以后升级为混合召回
4. ID、枚举、时间字段风格尽量统一
5. 为 project / repo / context / relation 等未来对象留命名空间，不要把概念堵死

## 10. 一句话总结

DevBrain 的未来数据模型，不是从一开始就做成大而全图数据库，
而是以 Note 为记忆入口，逐步长出 Knowledge Objects、Decision Traces、Context Anchors 和 Recall Events，最终形成一个可生长、可召回、可辅助判断的个人知识网络。
