# DevBrain 仓库规则

## 进入仓库先读什么

1. 先读 `docs/index.md`，确认本轮任务的文档入口和单一事实来源。
2. 再按任务读取对应权威文档：
   - 产品边界与验收：`docs/design/product-requirements.md`
   - 实施顺序与任务拆解：`docs/plan/implementation-plan.md`
   - 当前进度与风险：`docs/status/project-status.md`
3. 只更新本轮实际触达的文档职责，不要把 design、plan、status 混写到一个文件里。

## 治理基线

- 仓库级治理规则以 `AGENTS.md` 与 `docs/index.md` 为准。
- `.codex/`、`.claude/` 等本地工具目录只作本地使用，统一通过 `.gitignore` 忽略，不纳入版本管理。
- `README.md` 只负责项目总览、本地命令和入口导航，不记录实时执行状态。
- `docs/codex-kickoff-brief.md` 是实现会话的快速背景，不替代 PRD。
- `docs/design/product-requirements.md`、`docs/design/future-data-model.md`、`docs/design/v0.1-validation-lab.md`、`docs/design/search-and-recall-evolution.md`、`docs/design/v0.2-v0.3-product-blueprint.md` 负责长期边界、验证设计、取舍与后续扩展方向。
- `docs/plan/implementation-plan.md` 与未来的 `docs/plan/*.md` 负责可执行任务拆分、完成定义与验证要求。
- `docs/status/project-status.md` 是当前进度、风险、阻塞和下一步的唯一权威状态页。
- `docs/status/code-review-status.md` 负责沉淀 code review findings 与跟进状态。

## 任务分级

- `light`：小修、小范围文档更新、窄合同补洞；读取最少必要上下文，只有状态变化时才同步状态页。
- `standard`：跨多个文件或需要同步多份文档；收尾前同步受影响的 plan / design 与状态。
- `heavy`：新模块、新工作流或大范围边界变化；先把设计与计划对齐，再进入实现，并持续回写状态。

## 实现约束

- 严格围绕 MVP 主闭环：`收集 -> 整理 -> 搜索 -> 复用`。
- 未经用户明确改 scope，不要扩展到 AI 主流程、embedding、图谱可视化、同步、插件或协作能力。
- 页面层尽量保持轻，核心业务规则优先下沉到 feature / service 层。
- 遇到 Next.js 版本相关 API 时，先核对当前安装版本，再查本地包文档或实际类型定义，不要套旧经验。

## 验证与汇报

- 代码变更的默认验证基线是 `pnpm lint`、`pnpm test`、`pnpm build`；如果任务更窄，可以说明并执行更小验证集。
- 文档 / 治理变更至少要验证入口、路径引用和工作流说明仍然一致。
- 最终汇报要明确区分：已完成、验证情况、剩余风险、建议下一步。

## 提交策略

- 不自动创建 commit。
- 只有用户明确要求提交时，才执行 `git add` / `git commit`。
- 计划文档中出现的 commit 步骤一律视为“可选 checkpoint 示例”，不是默认动作。
