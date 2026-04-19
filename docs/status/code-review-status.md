# Code Review 状态

## 文档定位

本文档用于集中记录 DevBrain 代码审查 / 复查中仍需继续跟踪的问题、当前处理状态和下一步。

它不记录完整修复过程；具体执行动作应进入对应 `plan` 文档，已确认收口的问题不继续留在本文件堆积描述。

## 关联文档

- 相关状态：
  - [project-status.md](project-status.md)
- 当前计划：
  - [../plan/v0.2-ai-assist-layer.md](../plan/v0.2-ai-assist-layer.md)
- 已完成计划归档：
  - [../plan/history.md](../plan/history.md)

## 当前状态

- `2026-04-19` 已完成一轮 v0.2 review follow-up 收口：此前关于编辑页 `AI 辅助提取` 仍读取旧 `title / tags / stack` 上下文，以及 `getAIClient()` 在仅切换 `DEVBRAIN_AI_BASE_URL` / `DEVBRAIN_AI_MODEL` 时不会失效重建的问题，都已修复并通过回归测试验证，已从活跃问题列表移除。
- `2026-04-15` 已对本轮 review finding 重新复核；此前关于搜索相关性排序、`Inbox -> Digested` 最小结构门槛、标签 / 技术栈 canonicalization、`pnpm seed` 默认主库保护的问题都已确认收口，已从本文件移除。
- `2026-04-15` 当前保留 1 条活跃问题：
  - **[建议修改]** [../../src/features/notes/note.related.ts](../../src/features/notes/note.related.ts) 、 [../../src/features/notes/note.service.ts](../../src/features/notes/note.service.ts) 和 [../../src/components/note-detail.tsx](../../src/components/note-detail.tsx)
    相关推荐当前仍主要依赖共享标签、同技术栈、标题词和命令词重叠来生成候选与排序。它已经具备可解释闭环和基础回归覆盖，但是否真的提升知识复用效率，仍需要结合真实数据和下一轮产品评审继续验证。建议后续围绕误召回 / 漏召回样本补充评估，再决定是否追加候选集收窄、访问关系或新的排序信号。当前状态：待验证。
- `2026-04-15` 本轮复核已覆盖对应回归：`tests/unit/note-related.test.ts`、`tests/unit/note-service.test.ts`、`tests/e2e/related-notes.spec.ts` 已通过。
- `2026-04-19` 本轮 follow-up 已覆盖对应回归：`tests/unit/ai-extract-action.test.ts`、`tests/unit/ai-config.test.ts`、`tests/unit/ai-provider.test.ts`、`tests/unit/ai-extract-fields.test.ts`、`tests/unit/ai-suggest-tags.test.ts`、`tests/unit/ai-compress-action.test.ts`、`tests/unit/ai-compress-summaries.test.ts`、`tests/unit/note-editor-form-ai.test.tsx`、`tests/unit/note-list-ai.test.tsx`、`tests/e2e/ai-happy-path.spec.ts`、`tests/e2e/ai-degradation.spec.ts` 已通过。

## 记录规则

1. 问题按严重级别和影响面排序。
2. 每条问题至少写清影响范围、风险、建议动作和当前状态。
3. 如果问题进入修复，应补充对应 `plan` 或相关验证记录。
4. 问题关闭后不在本文件继续保留完整问题描述，只保留当前仍需跟踪的活跃事项。
