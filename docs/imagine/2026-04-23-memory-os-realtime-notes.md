# 记忆系统远期构想实时笔记

文档状态：imagination note
最后更新：2026-04-23
讨论主题：DevBrain 如何从知识卡片系统演化为记忆外骨骼与 Personal Memory OS
适用范围：远期产品想象、概念探索、记忆系统设计讨论

> 本文是实时讨论笔录，不是正式产品设计、执行计划或当前阶段验收标准。若后续形成稳定方案，再提炼到 `docs/design/`。

## 1. 讨论背景

本轮讨论暂时跳出当前 v0.1 / v0.2 路线，不考虑具体能力和落地场景，集中探讨 DevBrain 对「记忆」的生成、管理、演化和复用方式。

用户提出的远期方向包括：

- DevBrain 是否可以从知识库演化为「模拟大脑外骨骼」。
- 在局部低风险场景下，是否可以表现出少量「认知分身」能力。
- 数据来源不再局限于手动输入，而是来自 AI 对话、代码行为、终端、项目上下文、甚至使用电脑的习惯。
- 系统不应只对标现有记忆产品，而应吸收 Hermes agent、OpenViking、Hindsight Local、Honcho 等方向的优点，并做更大的创新型革新。

## 2. 当前临时共识

### 2.1 终局定位

更稳妥的终局不是「复制一个大脑」，而是：

> 以记忆外骨骼为主，附带少量有证据边界的局部认知分身能力。

这个定位的含义是：

- 主轴是增强记忆、复盘、判断和召回，不是替用户全面行动。
- 局部认知分身只能作为记忆积累后的受限投影，而不是独立目标。
- 系统需要知道用户做过什么、为什么这么做、在哪些问题上形成稳定偏好，然后才可能在少量场景里「像用户一样」给出建议或草稿。

### 2.2 记忆不等于向量

当前倾向于把向量视为索引，而不是记忆本体。

一条真正有价值的记忆，至少应包含：

- 内容
- 来源证据
- 适用情境
- 置信度
- 反例
- 激活条件
- 使用反馈
- 生命周期

因此，DevBrain 不应只是把事件转成 embedding 后塞进向量库，而应管理记忆的生成、巩固、冲突、衰减、召回和再利用。

### 2.3 图谱重要，但不应成为唯一底座

知识图谱适合表达关系，但不适合作为整个记忆系统的唯一基础。

当前更倾向的结构是：

- 事件日志：保存真实发生过的原始证据。
- 记忆对象：从事件中提炼出的事实、经验、流程、偏好、决策和坑点。
- 关系层：用图谱表达问题、方案、概念、决策、上下文之间的关系。
- 索引层：用关键词、向量、时间、实体、项目、因果等多路索引支持召回。
- 策略层：决定什么值得进入上下文、什么应该被遗忘、什么应该被提醒。

一句话概括：

> 图谱是关系投影，向量是检索索引，LLM 是记忆编译器之一，真正的底座是有生命周期的记忆对象。

## 3. 记忆生成方式

当前不建议把「一次 LLM 总结」直接写入长期记忆。

更合理的生成链路是：

```text
原始事件 -> 情节片段 -> 候选记忆 -> 巩固观察 -> 稳定记忆 -> 技能 / 判断模式
```

各层含义：

- 原始事件：AI 对话、代码 diff、终端命令、报错、文档浏览、任务切换等。
- 情节片段：一次排障、一次实现、一次失败尝试、一次技术选择。
- 候选记忆：系统从片段中提出可能值得记住的事实、经验、坑点或偏好。
- 巩固观察：多次证据支持后形成更稳定的观察。
- 稳定记忆：未来可被搜索、召回、解释和复用的长期记忆。
- 技能 / 判断模式：从多条稳定记忆中抽象出的工作流、偏好或决策方式。

这里可以把记忆生成理解为「编译」而不是「摘录」。

## 4. 记忆管理方式

当前认为，管理记忆至少需要以下机制：

- `evidence ledger`：每条稳定记忆都应能追溯到证据账本。
- `memory rent`：记忆需要证明自己仍有价值，长期无用则降级到冷存储。
- `contradiction first`：冲突不是异常，而是记忆演化的一等事件。
- `decay / refresh`：记忆会自然衰减，被复用、验证或修正后再增强。
- `merge / split`：相似记忆可以合并，过宽或含混的记忆可以拆分。

这意味着 DevBrain 未来管理的不是静态知识条目，而是一组持续变化的认知资产。

## 5. 记忆演化方式

传统系统通常是追加式记忆，但人的记忆更像持续重组：

- 重复出现的东西被强化。
- 旧理解会被新证据修正。
- 错误经验会被标记为过时。
- 具体事件会抽象成模式。
- 模式会在新事件中被重新检验。

因此，可以考虑引入周期性的 `memory consolidation`：

- 回放最近的事件链。
- 找出重复问题、重复偏好、重复失败。
- 把低层事件压缩成高层观察。
- 给旧记忆增加证据或反例。
- 把高频流程升级成 procedure / skill。
- 把不再成立的经验标记为 deprecated。

这类机制可以被产品化为「夜间巩固」「周期回放」或更具想象力的「dreaming」，但本质是异步记忆重组。

## 6. 记忆复用方式

复用不应只是返回几条相似内容，而应回答：

- 当前用户处于什么情境？
- 哪些记忆此刻有用？
- 为什么它们有用？
- 应该怎样呈现才不打扰用户？

未来召回应是多路召回，而不是单一路径的 top-k 向量搜索：

- 精确关键词：技术名词、错误码、文件名、命令。
- 语义相似：模糊表达、近义问题、相似经验。
- 时间关联：最近发生、上次进入某项目、某阶段上下文。
- 图关系：问题、方案、概念、决策链。
- 程序记忆：过去通常如何排查或实现。
- 用户模型：用户通常如何判断和取舍。
- 反例记忆：过去踩过什么坑，哪些做法应避免。

每次召回之后，也应该记录使用结果：

- 被召回但无用的记忆应降权。
- 真正帮助解决问题的记忆应增强。
- 被用户修正的记忆应进入演化链路。

## 7. LLM 的位置

当前倾向于把 LLM 放在协处理器位置，而不是记忆内核。

LLM 适合做：

- 提取候选记忆。
- 压缩事件。
- 解释关系。
- 生成摘要。
- 辅助判断冲突。
- 模拟某种视角。

系统内核应自己掌握：

- 记忆 schema。
- 证据链。
- 权限与本地可信存储。
- 生命周期。
- 索引。
- 召回策略。
- 删除、修正、合并和过期。

否则系统会变成「把个人记忆外包给黑盒模型」。

## 8. 可能形成的原创原则

当前值得继续打磨的原则：

- 向量是索引，不是记忆。
- 图谱是投影，不是底座。
- LLM 是编译器，不是数据库。
- 召回必须有理由。
- 记忆必须有生命周期。
- 冲突和遗忘是一等能力。
- 复用结果会反过来训练记忆系统。

可以尝试浓缩为一句产品哲学：

> 记忆不是被保存的内容，而是可被证据支持、可随时间演化、可在合适情境中重新激活的认知资产。

## 9. 待继续讨论的问题

下一步可以继续讨论「记忆本体」：

- 事件本体：一切从真实发生过的事件开始，记忆是事件的抽象。
- 知识本体：一切围绕概念、问题、方案和关系组织。
- 情境本体：一切围绕用户在什么场景下需要什么组织。

当前暂时更推荐的组合是：

> 事件本体 + 情境驱动 + 知识投影。

也就是先忠实记录发生了什么，再按情境召回，最后把稳定部分投影成知识网络。

## 10. 后续实时记录区

后续讨论可以继续追加到本节，或者在 `docs/imagine/` 中按主题拆出新的想象笔记。

### 10.1 记忆本体的阶段性修正

进一步讨论后，对「事件本体 + 情境驱动 + 知识投影」做了面向程序员群体的修正。

当前认为，对 DevBrain 的程序员阶段来说，知识更适合作为主本体。原因是程序员复用的主要对象不是「还原那天发生了什么」，而是问题、方案、排查流程、技术取舍、命令片段、坑点和可迁移模式。

修正后的表述是：

```text
知识对象是主资产
事件记录是证据账本
情境信号是召回触发器
图谱是关系投影
向量是检索索引
LLM 是记忆编译器
```

也可以进一步浓缩为：

> DevBrain 的记忆系统应以知识对象为主本体，以事件作为证据来源，以情境作为召回触发条件。系统的目标不是保存所有发生过的事情，而是把程序员真实经历过的事件，持续编译成可验证、可演化、可复用的知识资产。

这不是对事件和情境的否定，而是三者分工不同：

- 知识回答：我到底记住了什么？
- 事件回答：我凭什么相信它？
- 情境回答：什么时候应该把它拿出来？

长期扩展到其他客户群体时，不应把底层 schema 写死成只能知识优先。更稳的方向是：

> 底层多轴，前台按人群选择主投影。

也就是说，程序员阶段可以知识优先；研究者、创作者、管理者或生活助手场景，未来可以切换到 claim / evidence、素材 / 主题、决策 / 项目或事件 / 习惯等不同主投影，而不推翻底层记忆系统。

### 10.2 记忆内核：算法与实现初稿

进一步讨论后，暂时把 DevBrain 远期的核心实现方向称为「本地优先的记忆内核」。它不应只是另一个 memory layer、RAG 层或向量库，而应由系统自己掌握记忆 schema、证据链、权限、生命周期、索引、召回策略、删除修正和本地可信存储。

#### 10.2.1 记忆 schema

第一原则：不要从 chunk / embedding 开始，而是从 `MemoryObject` 开始。

一条长期记忆可以被建模为：

```ts
type MemoryObject = {
  id: string;
  type:
    | "problem"
    | "solution"
    | "procedure"
    | "pitfall"
    | "decision"
    | "preference"
    | "concept";
  title: string;
  content: string;
  context: {
    project?: string;
    repo?: string;
    stack?: string[];
    taskKind?: string;
  };
  confidence: "draft" | "observed" | "tested" | "trusted" | "deprecated";
  lifecycle: "candidate" | "active" | "stale" | "archived" | "deleted";
  evidenceIds: string[];
  contradictionIds: string[];
  validFrom?: string;
  validUntil?: string;
  lastUsedAt?: string;
  useCount: number;
  usefulnessScore: number;
  createdAt: string;
  updatedAt: string;
};
```

字段细节后续可以变化，但核心方向是：记忆不是一段文本，而是有类型、有证据、有状态、有生命周期的对象。

#### 10.2.2 证据链

证据层应当更接近不可变事件日志：

```text
EventLog -> Evidence -> MemoryObject -> MemoryRevision
```

一次 AI 对话、一次 commit、一次终端报错、一次测试通过、一次文档修改、一次手动确认，都可以成为证据事件。`MemoryObject` 不是凭空生成，而是由这些事件编译出来。

值得重点研究的创新点是 `evidence ledger`：每条长期记忆都能展开证据账本。

示例：

```text
记忆：
Next.js hydration mismatch 的常见原因之一是服务端和客户端渲染输出不一致。

证据：
- 某次排障记录。
- 对应 commit diff。
- 修复后测试通过。
- 后续另一个项目中再次验证。

反例：
- 某次 mismatch 实际来自第三方组件。
```

这会让 DevBrain 区别于普通 AI memory：不是「模型说它记得」，而是「系统能证明为什么这样记」。

#### 10.2.3 权限

权限应在检索前处理，而不是等 LLM 拿到上下文之后再靠 prompt 约束。

可以先分为 4 层：

- `private`：只给本人看，不进入 agent 自动上下文。
- `project`：只在对应 repo / 项目上下文中可召回。
- `agent-readable`：可以给 AI 读取，但不能用于自动行动。
- `actionable`：可以参与建议、草稿或自动化流程。

还需要给事件源打信任等级：

- `trusted`：用户手写、git commit、测试结果、用户明确确认。
- `semi-trusted`：AI 对话、网页摘录、issue、PR 评论。
- `untrusted`：外部网页、日志、用户粘贴的未知来源文本、可能含 prompt injection 的内容。

外部内容进入 LLM 上下文前，应始终被视为数据，而不是指令。这个方向可以参考 OWASP 对 LLM 应用风险和 prompt injection 的分类。

#### 10.2.4 生命周期

记忆生命周期应是状态机，而不是简单的更新时间排序：

```text
candidate -> active -> reinforced -> stale -> deprecated -> archived
```

后台可以运行周期性的 `memory consolidation` job：

```text
每日 / 每周：
1. 找出新事件中的候选记忆。
2. 合并重复记忆。
3. 给旧记忆增加证据或反例。
4. 降权长期无用记忆。
5. 标记可能过时的记忆。
6. 把高频经验升级为 procedure / skill。
```

可以引入 `memory rent` 分数：

```text
memory_score =
  confidence * evidence_strength
  + reuse_count * usefulness
  + recency
  + context_match
  - contradiction_penalty
  - stale_penalty
```

低分记忆不一定物理删除，但应从热记忆降级到冷存储，减少主动召回和上下文污染。

#### 10.2.5 索引

索引应多路并存：

- SQLite 主表：事实源和本地可信存储。
- SQLite FTS5：关键词、命令、错误码、文件名检索。
- vector index：语义相似召回。
- graph edges：问题、方案、概念、决策、项目之间的关系。
- temporal index：时间、版本、发生顺序。
- context index：repo、stack、任务类型、文件路径。

当前更稳的底座不是复杂图数据库，而是：

```text
SQLite + FTS5 + 关系表 + 可选向量索引
```

图谱可以先用普通关系表表达，等语义稳定后再考虑更专门的图库或图算法层。

#### 10.2.6 召回策略

召回不应只是 `topK(embedding)`，而应是一个 planner：

```text
输入当前情境
-> 判断召回意图
-> 多路检索
-> 权限过滤
-> 证据过滤
-> 排序融合
-> 生成带理由的上下文卡片
```

排序可以用 RRF（Reciprocal Rank Fusion）融合多路结果，再叠加上下文与可信度信号：

```text
final_score =
  rrf(keyword, vector, graph, time)
  * context_fit
  * confidence
  * permission_allowance
  * usefulness
```

召回结果最好不是直接塞给 LLM，而是生成 `RecallCard`：

```text
为什么召回它？
- 同 repo。
- 同错误类型。
- 曾在类似任务中被采纳。
- 置信度 trusted。
- 有 3 条证据支持。
```

这会形成一个「召回调试器」：用户和系统都能看见某条记忆为什么出现、来自哪里、可信度如何。

#### 10.2.7 删除与修正

删除和修正不能只做简单物理删除。更稳的机制包括：

- `tombstone`：标记删除，用于审计和同步。
- `revision`：保留记忆版本，支持回滚和对比。
- `derived dependency`：记录哪些记忆由哪些事件生成。
- `cascade invalidation`：源证据被删，派生记忆要降权或失效。
- `reindex queue`：删除 / 修正后重建 FTS、向量和图关系索引。

示例：

```text
用户删除一段 AI 对话
-> 由它派生的候选记忆失去证据
-> 如果没有其他证据，记忆降为 stale 或 archived
-> 相关向量、FTS、图边进入重建队列
```

这也是本地可信存储和用户控制权的关键。

#### 10.2.8 本地可信存储

第一阶段仍应坚持单机本地：

```text
SQLite 作为 source of truth
FTS5 做关键词索引
关系表做轻图谱
向量扩展或嵌入式向量库做语义检索
后台 job 做 consolidation
```

同步、云端、多端都应后置。记忆系统一旦开始采集用户行为，信任比功能更重要。

#### 10.2.9 值得研究和创新的方向

如果 DevBrain 要形成自己的技术特色，不应只卷「向量召回更准」，而应研究：

- `Evidence-first memory`：每条知识都有证据账本。
- `Memory lifecycle GC`：记忆有热 / 冷 / 过期 / 废弃状态。
- `Contradiction-aware consolidation`：冲突不是 bug，而是记忆更新的入口。
- `Context-triggered recall`：不是用户搜才召回，而是进入情境时轻量激活。
- `Programmer-specific validation`：程序员记忆可以用测试、commit、运行结果增强置信度。
- `Recall debugger`：每次召回都能解释为什么出现、来自哪里、可信度如何。
- `Local single-file memory kernel`：用 SQLite 做一个可迁移、可审计、可备份的个人记忆内核。

当前最有 DevBrain 味道的研究命题：

> 面向程序员的 evidence-backed memory kernel：把真实开发事件编译成可验证、可演化、可召回的知识对象。

#### 10.2.10 参考资料

以下资料可作为后续深入研究入口。它们不是 DevBrain 的对标终点，而是可吸收的局部启发。

- [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560)：重点看 OS-style memory tiering，把上下文窗口类比为内存、长期存储类比为磁盘。
- [Letta Memory Blocks](https://docs.letta.com/guides/core-concepts/memory/memory-blocks)：重点看可持久化、可编辑、可共享的结构化 memory blocks。
- [Cognitive Architectures for Language Agents (CoALA)](https://arxiv.org/abs/2309.02427)：重点看 working / episodic / semantic / procedural memory 的认知架构划分。
- [Generative Agents: Interactive Simulacra of Human Behavior](https://research.google/pubs/generative-agents-interactive-simulacra-of-human-behavior/)：重点看 observation、reflection、planning 的链路。
- [Hindsight FAQ](https://hindsight.vectorize.io/faq)：重点看 retain / recall / reflect 的产品划分，以及「living memory」而非简单向量搜索的定位。
- [Hindsight Retain](https://hindsight.vectorize.io/developer/retain)：重点看对话和文档如何转化为结构化、可搜索的记忆。
- [Hindsight Reflect](https://hindsight.vectorize.io/developer/api/reflect)：重点看 recall 之外的综合推理与反思流程。
- [OpenViking](https://github.com/volcengine/OpenViking)：重点看 context database、文件系统范式、memory / resource / skill 统一管理、分层上下文加载。
- [Microsoft GraphRAG Overview](https://microsoft.github.io/graphrag/index/overview/)：重点看图谱抽取、local / global query 和图增强检索，但不要把它当成个人记忆系统的全部答案。
- [Zep: A Temporal Knowledge Graph Architecture for Agent Memory](https://arxiv.org/abs/2501.13956)：重点看 temporal knowledge graph 和记忆随时间变化的建模。
- [HippoRAG](https://arxiv.org/abs/2405.14831)：重点看受海马体启发的长期记忆检索框架，以及语义和图结构结合的思路。
- [Mem0](https://arxiv.org/abs/2504.19413)：重点看生产化长期记忆层、benchmark 和可扩展记忆机制。
- [SQLite FTS5](https://www.sqlite.org/fts5.html)：本地关键词检索、BM25 排序和多字段全文搜索的基础。
- [SQLite Vec1](https://sqlite.org/vec1)：SQLite 官方向量扩展方向，可关注其本地 ANN 能力。
- [LanceDB](https://docs.lancedb.com/)：嵌入式向量数据库，可作为可选向量索引方案参考。
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)：重点看 prompt injection、数据泄露和外部内容进入 LLM 上下文的安全边界。
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)：可作为长期治理、风险、可信 AI 和隐私安全框架参考。
- [Local-first software](https://www.inkandswitch.com/local-first/)：本地优先产品哲学参考，尤其是用户拥有数据、离线可用和云只作为可选同步层的原则。
