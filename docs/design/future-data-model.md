# DevBrain 未来数据模型

文档状态：future draft
最后更新：2026-04-23
适用范围：v0.3+ 以后对知识对象、事件证据、情境召回与长期记忆演化的建模讨论

## 1. 这份文档解决什么问题

当 DevBrain 从知识卡片系统继续演化时，最容易犯的错误是把“向量”“图谱”“上下文绑定”“长期记忆”混成同一层。

这份文档的作用是把长期数据模型重新讲清楚：

- 程序员阶段的主资产到底是什么
- 事件、知识、关系、情境、召回反馈分别处在什么层
- v0.3 与 v0.4 应先把哪些实体变成一等对象

注意：这不是当前迭代的实现任务，而是未来主线的建模约束。

## 2. 总体建模立场

### 2.1 知识对象是主资产

对 DevBrain 当前面向的程序员用户来说，真正要被长期管理和复用的，不是“发生过的所有事件”，而是：

- Problem（问题）
- Solution（方案）
- Procedure（流程）
- Pitfall（坑点）
- Decision（决策）
- Concept（概念）

### 2.2 事件是证据来源

事件不应成为前台主对象，但它们是知识可信度的重要来源。AI 对话、终端报错、commit、测试通过、手动确认等，都可以成为知识对象背后的证据。

### 2.3 情境是召回触发器

Project、Repo、File、Task、Error Signature、Stage 等信息的价值，不在于单独展示，而在于帮助系统判断“什么知识应该在此刻被拿出来”。

### 2.4 Note-first, object-later

在当前阶段，Note 仍然是最现实、最稳定的承载单位。未来模型应从 Note 中长出对象和关系，而不是推翻 Note 主模型重来。

### 2.5 local-first

未来无论引入多少 AI、图关系、召回逻辑或上下文绑定，本地数据库都应继续作为 canonical source of truth。

## 3. 建模分层

### Layer A：Note Layer

当前稳定底座。

职责：

- 保存原始输入
- 保存整理后的结构化卡片
- 承接编辑、搜索、筛选与详情主流程

核心对象：

- Note
- Tag
- NoteTag

### Layer B：Knowledge Object Layer

从 Note 中逐步显式化的知识对象层。

职责：

- 让“问题 / 方案 / 流程 / 坑点 / 决策 / 概念”成为可复用资产

核心对象：

- Problem
- Solution
- Procedure
- Pitfall
- Decision
- Concept

### Layer C：Evidence & Relation Layer

让知识对象可追溯、可连接。

职责：

- 记录知识来自哪些证据
- 记录对象之间的显式关系

核心对象：

- EvidenceEvent
- EvidenceLink
- Relation

### Layer D：Context Layer

让知识与真实工作情境建立锚点。

职责：

- 为情境召回提供触发条件
- 让知识逐步和项目、仓库、文件、任务阶段等建立映射

核心对象：

- Project
- Repo
- File
- Context

### Layer E：Recall & Feedback Layer

让系统知道“什么被召回过、是否有帮助、哪些地方正在生长或过时”。

核心对象：

- RecallEvent
- ReviewEvent
- CapabilitySignal

## 4. 关键设计原则

### 原则 A：前台主对象与后台证据层分离

用户主要浏览和维护的应是知识对象与 Note，而不是原始事件流。

### 原则 B：关系先于图

真正重要的是关系语义本身，不是图数据库或图可视化技术栈。

### 原则 C：召回先于自动行动

在 v0.4 之前，情境层的首要目标是提升召回，而不是变成自动执行代理。

### 原则 D：证据和反例都是一等公民

知识对象不应只有“支持证据”，也应能记录反例、失效条件和被 supersede 的关系。

## 5. 核心实体方向

### 5.1 Note

说明：

- 当前知识系统的基础记录单位
- 保留原始输入与结构化整理结果

说明要点：

- v0.1 / v0.2 继续以 Note 为核心完全正确
- 后续对象从 Note 中抽取，但 Note 不消失

### 5.2 Knowledge Object

这里不要求立即做成复杂多表继承体系，但长期语义要尽量清晰。

建议对象：

- `Problem`
  - 可被归一化、反复遇到的问题类型
- `Solution`
  - 可被多个问题或 Note 复用的解决方案
- `Procedure`
  - 一组可执行步骤
- `Pitfall`
  - 高概率误区、限制条件、反模式
- `Decision`
  - 方案选择、取舍与适用边界
- `Concept`
  - 会被反复提及的稳定概念

### 5.3 EvidenceEvent

说明：

- 不是前台主资产，而是知识对象背后的证据源

可能来源：

- Note 编辑
- AI 对话
- terminal 命令与报错
- commit / diff
- 测试结果
- 用户手动确认

### 5.4 EvidenceLink

说明：

- 连接 Knowledge Object 与 EvidenceEvent
- 用来回答“这条知识凭什么成立”

建议最少表达：

- support
- verification
- contradiction
- superseded_by

### 5.5 Relation

说明：

- 表达对象之间的语义关系

建议 relation type：

- solves
- caused_by
- depends_on
- similar_to
- applies_in
- avoid_when
- derived_from
- verified_by
- superseded_by

### 5.6 Context

说明：

- 表示知识产生、验证或复用时的情境

当前最值得保留的情境维度：

- project
- repo
- file
- task kind
- error signature
- stage（coding / debugging / deploy / refactor / study）

### 5.7 RecallEvent

说明：

- 记录某条知识在何种情境下被召回、是否被采用、是否有帮助

它是后续排序优化、生命周期管理和能力判断的重要反馈源。

## 6. 阶段化落地建议

### v0.3 优先显式化

建议优先让这些东西进入正式模型：

- Problem
- Solution
- Procedure
- Decision
- Relation
- 最小证据链接

这一阶段的目标是：

- 证明对象化与关系化确实有复用价值
- 不要求一次落完整事件 / 情境 / 反馈闭环

### v0.4 再引入情境与反馈

建议逐步增加：

- Project / Repo / File / Context
- RecallEvent
- 更完整的 EvidenceEvent

这一阶段的目标是：

- 让知识在情境中被更自然地激活
- 让召回结果反过来影响系统的判断与排序

## 7. 当前非目标

在当前未来模型里，暂时不建议：

- 一开始就做复杂图数据库
- 一开始就做全量行为采集
- 一开始就做全自动“长期记忆代理”
- 让 embedding 成为主数据模型

当前更稳的顺序仍然是：

> 先有知识对象，再有关系，再有情境召回，最后才考虑更高阶的记忆演化。
