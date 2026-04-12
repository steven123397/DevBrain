# DevBrain 给 Codex 的开工摘要

最后更新：2026-04-11
适用阶段：MVP / v0.1
角色定位：这是给 Codex 的实现启动说明，不是完整 PRD 的替代品；详细边界以 `docs/product-requirements.md` 和 `docs/implementation-plan.md` 为准。

## 1. 一句话说明这个项目

DevBrain 是一个面向程序员的本地优先知识库，用来把日常开发中的碎片知识（报错、踩坑、配置技巧、调试结论、命令片段、设计判断）沉淀为可检索、可关联、可复用的知识资产。

它的核心不是“做一个笔记应用”，而是先跑通：
收集 -> 整理 -> 搜索 -> 复用

## 2. 这一阶段最重要的产品判断

请优先做“底层知识库能力”，不要过早做上层建筑。

当前阶段明确优先级：
1. 数据模型
2. 本地存储
3. 结构化编辑
4. 搜索与筛选
5. 相关条目推荐（规则版）
6. 再考虑 AI / embedding / 知识图谱

一句话：
先把知识卡片系统做扎实，再谈图谱、智能和自动化采集。

## 3. 当前明确要做什么

MVP 必须至少支持：

### A. 快速录入
用户能快速新建一条知识记录，哪怕只填最少字段也能保存。

最少字段建议：
- title
- raw_input
- status（默认 inbox）
- tags（可选）
- stack（可选）
- source（可选）

### B. 结构化整理
用户之后可以把 Inbox 条目补充整理成正式知识卡片。

核心结构化字段：
- summary
- problem
- solution
- why
- commands
- references
- confidence

### C. 搜索与筛选
用户应能通过以下方式找回知识：
- 标题搜索
- 原始输入搜索
- problem / solution / why 全文搜索
- 标签筛选
- 技术栈筛选
- inbox / digested 状态筛选

### D. 详情与复用
用户打开某条知识时，应能看到：
- 条目完整内容
- 元信息
- 相关条目推荐

### E. Inbox -> Digested 工作流
系统必须明确支持：
- 先粗略记录
- 后结构化消化

这个工作流是产品灵魂，不要做成只有一坨富文本。

## 4. 当前明确不要做什么

这一阶段请不要把精力放到这些方向：
- 知识图谱可视化
- embedding 语义检索
- AI 自动总结主流程
- 浏览器插件 / 自动剪藏
- 团队协作
- 云同步
- agent 编排
- 花哨但不影响主闭环的炫技功能

不是永远不做，而是现在不该先做。

### 长期方向（但不是当前交付范围）
未来可以沿着这些方向继续长：
- 从 Note 扩展到 Knowledge Network
- 从手动搜索扩展到 Contextual Recall
- 从相关条目扩展到 Decision Trails
- 从手工记录扩展到 Project / Repo / File context binding
- 从知识卡片扩展到能力地图与成长提示

但 v0.1 不需要直接实现这些能力；当前实现只需要在数据层和服务层为这些方向留好扩展缝。

## 5. 推荐技术路线

推荐采用：
- Next.js（App Router）
- TypeScript
- SQLite
- Drizzle ORM
- Zod
- Tailwind
- Vitest + Playwright

原因：
- 本地优先
- 工程成本低
- MVP 能快速成型
- 数据模型清晰
- 后续扩 embedding 和图谱也不需要推倒重来

补充约束：
- 当前采用 Web App 是为了快速验证主闭环，不等于长期一定停留在纯 Web 形态
- 实现时不要把核心业务规则耦合在页面层
- Note 的创建、整理、搜索、相关条目逻辑应尽量沉到 feature / service 层

## 6. 数据模型方向

请把 Note 作为核心实体设计稳，不要一开始引入复杂关系系统。

建议核心字段：
- id
- title
- raw_input
- summary
- problem
- solution
- why
- commands
- references
- status: inbox / digested / archived
- confidence: draft / tested / trusted
- stack
- source_type
- source_url
- created_at
- updated_at

另建：
- tags
- note_tags

注意：
v0.1 的 related notes 可以动态计算，不必先持久化图谱边。

## 7. 产品上最容易跑偏的地方

### 风险 1：把“知识库”做成“AI 玩具”
如果没有扎实的数据结构、状态流转和搜索能力，再强的 AI 也只是表面聪明。

### 风险 2：把“第二大脑”做成“复杂录入表单”
快速录入必须轻，不能让用户一开始就填满所有字段。

### 风险 3：把“条目关联”做成“过早图谱工程”
第一版只需要可解释的规则推荐，不需要图数据库。

### 风险 4：把“可用产品”做成“技术演示”
如果无法稳定地创建、整理、搜索和召回条目，MVP 就还没成立。

## 8. 你现在最该交付的第一批成果

如果按顺序实现，第一批最值得尽快交付的是：

1. 项目骨架可跑起来
2. SQLite schema 定下来
3. Note CRUD 跑通
4. Inbox / Digested 状态流转跑通
5. 列表页 + 详情页
6. 搜索与筛选
7. 规则版 related notes

只要这 7 件事成立，DevBrain 的产品内核就已经站住了。

## 9. 产品验收口径（Hermes 视角）

Hermes 后续会重点看这几个问题：

1. 这个实现是否仍然服务于“收集 -> 整理 -> 搜索 -> 复用”？
2. 有没有把录入流程做得过重？
3. 有没有把 AI / 图谱做得早于底层？
4. 搜索是不是足够好，真的能把知识找回来？
5. 条目结构是否清晰，能否沉淀为长期知识资产？

如果某一轮实现虽然很酷，但回答不了这 5 个问题，它大概率就不是当前优先级。

## 10. 最简开工建议

Codex 可以直接按下面顺序开工：

### Phase 1：底座
- 初始化项目
- 建 SQLite + Drizzle schema
- 建 note / tag / note_tag 模型
- 跑通最小 CRUD

### Phase 2：核心闭环
- 新建知识条目页
- 条目列表页
- 条目详情页
- 条目编辑页
- Inbox -> Digested 流转

### Phase 3：召回能力
- 全文搜索
- 标签/技术栈/状态筛选
- 规则版 related notes

### Phase 4：打磨
- 空状态
- 删除
- demo seed
- 基本测试

## 11. 开工时的工作准则

- 先保守，后扩展
- 先让主闭环成立，再补增强项
- 先保证可解释的数据结构，再谈智能化
- 先把单人本地使用体验做实，再谈多人/同步/外部导入
- UI 层不要直接编码复杂业务规则
- note creation / digestion / search / related 逻辑尽量沉到 feature / service 层
- 未来 repo / context / graph 能力应以新增模块接入，而不是重写现有流程

## 12. 相关文档

完整需求：
- `docs/product-requirements.md`

完整实现计划：
- `docs/implementation-plan.md`

未来数据模型草案：
- `docs/future-data-model.md`

如果 Codex 在实现中遇到取舍冲突，默认遵循：
“先做底层，后做图谱；先做可用产品，后做聪明系统。”
