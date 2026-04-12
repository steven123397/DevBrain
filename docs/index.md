# DevBrain 文档索引

文档状态：active
最后更新：2026-04-12
适用范围：仓库级文档导航、治理映射与执行工作流

## 1. 推荐阅读顺序

### 新进入仓库时

1. `README.md`：了解项目目标、技术栈和本地命令。
2. `AGENTS.md`：确认治理规则、验证基线和回写约定。
3. `docs/codex-kickoff-brief.md`：快速理解当前 MVP 的产品抓手。
4. `docs/product-requirements.md`：确认产品边界、目标和验收口径。
5. `docs/implementation-plan.md`：确认当前实现顺序与任务拆分。
6. `docs/status/project-status.md`：确认真实进度、风险和下一步。

### 按任务类型读取

- 改产品边界：`docs/product-requirements.md` -> `docs/future-data-model.md` -> `docs/status/project-status.md`
- 推进实现任务：`docs/implementation-plan.md` -> `docs/status/project-status.md` -> 对应功能代码
- 做文档治理：`.codex/project-governance.yaml` -> `AGENTS.md` -> 本页
- 做代码审查：`docs/status/code-review-status.md` -> `docs/status/project-status.md`

## 2. 文档角色映射

| 逻辑角色 | 权威路径 | 说明 |
| --- | --- | --- |
| 项目总览 | `README.md` | 面向人类读者的项目简介、命令和入口导航 |
| 根规则 | `AGENTS.md` | 仓库默认治理规则、验证基线、回写原则 |
| 治理配置 | `.codex/project-governance.yaml` | 文档角色到物理路径的稳定映射 |
| 背景 | `docs/codex-kickoff-brief.md` | 给实现会话的快速背景，不替代 PRD |
| 设计 | `docs/product-requirements.md`、`docs/future-data-model.md` | 长期边界、取舍和未来扩展缝 |
| 执行计划 | `docs/implementation-plan.md`、`docs/plan/*.md` | 任务拆分、完成定义、验证与回写要求 |
| 计划归档 | `docs/plan/history.md` | 已完成或废弃计划的历史记录 |
| 当前状态 | `docs/status/project-status.md` | 当前阶段、已完成事项、风险、下一步 |
| Review findings | `docs/status/code-review-status.md` | 审查发现、结论与跟进状态 |
| 模板 | `docs/design/template.md`、`docs/plan/template.md`、`docs/status/template.md` | 新文档起草模板 |

## 3. 工作流约定

### 任务分级

- `light`：小修、小范围文档修正、窄合同补洞。默认不新建计划文档。
- `standard`：跨多个文件或需要同步多份文档。必要时同步设计与状态。
- `heavy`：新模块、新治理框架、大范围边界变化。先补设计 / 计划，再执行。

### 回写规则

- 设计文档只写长期边界、目标、非目标和关键取舍。
- 计划文档只写任务拆分、完成定义、验证方式和回写要求。
- 状态文档只写实时进度、已完成事项、风险、阻塞和下一步。
- 不要在多个文档里重复维护同一份进度或同一份待办。

### 提交与验证

- 提交（commit）不是默认动作，只有用户明确要求时才执行。
- 代码任务默认验证基线：`pnpm lint`、`pnpm test`、`pnpm build`。
- 文档治理任务至少要验证文档入口、路径引用和工作流说明保持一致。

## 4. 当前活跃文档

- 活跃计划：`docs/implementation-plan.md`
- 当前状态：`docs/status/project-status.md`
- Review 跟踪：`docs/status/code-review-status.md`

## 5. 新文档落位规则

- 新的产品 / 架构边界文档：优先放在 `docs/design/`，并在相关主文档中建立链接。
- 新的阶段性执行计划：放在 `docs/plan/`，完成后在 `docs/plan/history.md` 留痕。
- 新的状态页：仅在确有独立主题时放在 `docs/status/`，避免随意拆出多个并行状态源。
