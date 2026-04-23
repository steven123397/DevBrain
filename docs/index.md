# DevBrain 文档索引

文档状态：active
最后更新：2026-04-23
适用范围：仓库级文档导航、治理映射与执行工作流

## 1. 推荐阅读顺序

### 新进入仓库时

1. `README.md`：了解项目目标、技术栈和本地命令。
2. `AGENTS.md`：确认治理规则、验证基线和回写约定。
3. `docs/design/product-requirements.md`：确认产品边界、目标和验收口径。
4. `docs/status/project-status.md`：确认真实进度、风险和下一步。
5. `docs/plan/history.md`：回看已完成阶段的归档记录与 handoff checkpoint。

### 按任务类型读取

- 改产品边界：`docs/design/product-requirements.md` -> `docs/design/future-data-model.md` -> `docs/status/project-status.md`
- 回看已完成 v0.1 基线：`docs/design/v0.1-mvp-foundation.md`
- 做下一阶段设计：`docs/design/search-and-recall-evolution.md`、`docs/design/v0.2-v0.4-product-blueprint.md`、`docs/design/future-data-model.md`
- 推进实现任务：`docs/status/project-status.md` -> 如存在对应 `docs/plan/*.md` 则继续读取 -> 对应功能代码
- 做文档治理：`AGENTS.md` -> 本页 -> 对应 design / plan / status 文档
- 做代码审查：`docs/status/code-review-status.md` -> `docs/status/project-status.md`

## 2. 文档角色映射

| 逻辑角色 | 权威路径 | 说明 |
| --- | --- | --- |
| 项目总览 | `README.md` | 面向人类读者的项目简介、命令和入口导航 |
| 根规则 | `AGENTS.md` | 仓库默认治理规则、验证基线、回写原则 |
| 设计 | `docs/design/product-requirements.md`、`docs/design/v0.1-mvp-foundation.md`、`docs/design/search-and-recall-evolution.md`、`docs/design/v0.2-v0.4-product-blueprint.md`、`docs/design/future-data-model.md` | 长期边界、已完成 v0.1 基线、搜索演进、未来建模与后续阶段蓝图 |
| 执行计划 | `docs/plan/*.md` | 活跃阶段的任务拆分、完成定义、验证与回写要求 |
| 计划归档 | `docs/plan/history.md` | 已完成或废弃计划的历史记录 |
| 当前状态 | `docs/status/project-status.md` | 当前阶段、已完成事项、风险、下一步 |
| Review findings | `docs/status/code-review-status.md` | 审查发现、结论与跟进状态 |
| 构想存储库 | `docs/imagine/` | 尚未进入正式设计 / 计划 / 状态流的远期想象、概念笔记与讨论摘录 |
| 模板 | `docs/design/template.md`、`docs/plan/template.md`、`docs/status/template.md` | 新文档起草模板 |

说明：如本地存在 `.codex/project-governance.yaml`，它只作为本地工具读取的辅助配置，不属于仓库的版本化事实来源。

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
- `.codex/`、`.claude/`、`.cursor/`、`.gemini/`、`.windsurf/`、`.aider/`、`.roo/` 等本地工具目录统一通过 `.gitignore` 忽略，不作为仓库事实来源。
- 代码任务默认验证基线：`pnpm lint`、`pnpm test`、`pnpm build`。
- 文档治理任务至少要验证文档入口、路径引用和工作流说明保持一致。

## 4. 当前活跃文档

- 活跃计划：`docs/plan/v0.2-ai-assist-layer.md`
- 计划归档：`docs/plan/history.md`
- 当前状态：`docs/status/project-status.md`
- Review 跟踪：`docs/status/code-review-status.md`

## 5. 新文档落位规则

- 新的产品 / 架构边界文档：优先放在 `docs/design/`，并在相关主文档中建立链接。
- 新的远期想象 / 未收敛概念笔记：可放在 `docs/imagine/`，成熟后再提炼到 `docs/design/`。
- 新的阶段性执行计划：放在 `docs/plan/`，完成后在 `docs/plan/history.md` 留痕。
- 新的状态页：仅在确有独立主题时放在 `docs/status/`，避免随意拆出多个并行状态源。
