# Code Review 状态

文档状态：active
最后更新：2026-04-13
适用范围：记录代码审查发现、处置结论与回写状态

## 当前结论

已完成一轮基于当前仓库实现的对抗性审查。
当前实现已经跑通 MVP 的「收集 -> 整理 -> 搜索 -> 复用」主闭环，但主要结论是：它更接近演示质量较高的单人原型，尚未证明自己已经跨过“原型可用”到“知识系统可信”的门槛。

2026-04-13 已完成本轮 review follow-up 的第一批收口，当前状态更新为：

- 已为搜索补齐显式相关性排序，并把标签 / 技术栈纳入辅助召回。
- 已为 `Inbox -> Digested` 增加最小结构质量门槛，并在编辑表单展示阻断提示。
- 已为标签与技术栈增加最小 canonicalization，降低输入分叉对筛选与相关推荐的侵蚀。
- 已为 `pnpm seed` 增加默认主库保护，避免未显式指定目标时误覆盖真实本地知识库。
- 相关推荐本身的候选质量与排序信号仍待下一轮产品评审验证。

当前审查重点集中在 5 类风险：

- 搜索虽已加入显式相关性排序，但召回价值仍需用真实数据验证。
- `Inbox -> Digested` 已有门槛，但后续仍要观察这条门槛是否过松或过紧。
- 相关推荐依赖标签 / 技术栈 / 标题词的一致性，规则可解释但不一定稳定有用。
- 标签与技术栈已有最小治理，但尚未扩展到更完整的同义词或受控词表。
- `pnpm seed` 默认主库保护已补齐，但 demo / review 路径仍需继续打磨易用性。

## Findings

- finding：搜索更像多字段 contains 过滤，而不是可依赖的知识召回；当前结果排序也没有显式相关性模型。
  severity：high
  location：`src/features/notes/note.search.ts`、`src/features/notes/note.service.ts`、`src/app/notes/page.tsx`
  status：resolved
  owner：Codex
  follow-up：2026-04-13 已补齐字段加权排序、标签 / 技术栈辅助召回与排序文案；后续仍需在真实数据下评估是否继续升级到 SQLite FTS。

- finding：`Digested` 状态没有最小结构质量门槛，用户可以几乎不补全关键字段就把条目标为已整理。
  severity：high
  location：`src/features/notes/note.schemas.ts`、`src/app/actions/update-note.shared.ts`、`src/components/note-editor-form.tsx`
  status：resolved
  owner：Codex
  follow-up：2026-04-13 已落地最小完成标准：`summary + problem + solution`，且至少存在一个 `tag` 或 `stack`；后续评审再决定是否继续提高门槛。

- finding：相关推荐当前依赖共享标签、同技术栈、标题词和命令词重叠，规则可解释，但对输入一致性和小数据集假设依赖较强。
  severity：medium
  location：`src/features/notes/note.related.ts`、`src/features/notes/note.service.ts`、`src/components/note-detail.tsx`
  status：in_progress
  owner：Codex
  follow-up：2026-04-13 已先补最小输入 canonicalization，降低输入分叉导致的误召回；下一轮重点仍是验证推荐是否真的帮助复用，再决定是否追加候选集缩窄和新排序信号。

- finding：标签与技术栈仍是自由输入，缺少 canonicalization 或同义词治理，后续会直接削弱筛选、搜索和相关推荐的稳定性。
  severity：medium
  location：`src/features/notes/note.schemas.ts`、`src/features/notes/note.normalization.ts`、`src/components/note-editor-form.tsx`
  status：resolved
  owner：Codex
  follow-up：2026-04-13 已补齐常见标签 / 技术栈别名 canonicalization，并在编辑表单提示自动归一化；后续若真实数据继续分叉，再考虑更强的受控词表或别名治理。

- finding：`pnpm seed` 会删除目标 SQLite 文件并重写 demo 数据；在默认数据库路径下，这对真实本地知识库是破坏性操作。
  severity：high
  location：`src/db/seed.ts`、`src/db/seed.shared.ts`、`README.md`
  status：resolved
  owner：Codex
  follow-up：2026-04-13 已要求显式指定 `DEVBRAIN_DB_FILE` 或显式设置 `DEVBRAIN_ALLOW_DEFAULT_DB_RESET=true` 才能覆盖默认主库；README 已同步推荐使用独立 demo 数据库进行 review。

## 使用方式

当出现新的审查意见时，请按下面格式追加：

- finding：一句话说明问题
- severity：high / medium / low
- location：文件路径与行号
- status：open / in_progress / resolved / declined
- owner：负责人
- follow-up：后续动作或关联文档
