import type { KnowledgeNote } from "@/features/notes/note.types";

const statusLabelMap = {
  inbox: "Inbox",
  digested: "Digested",
  archived: "Archived",
} as const;

const statusToneMap = {
  inbox: "bg-amber-100 text-amber-900",
  digested: "bg-emerald-100 text-emerald-900",
  archived: "bg-slate-200 text-slate-700",
} as const;

const confidenceLabelMap = {
  draft: "Draft",
  tested: "Tested",
  trusted: "Trusted",
} as const;

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function DetailSection({
  title,
  content,
  emptyText,
  monospace = false,
}: {
  title: string;
  content: string | null;
  emptyText: string;
  monospace?: boolean;
}) {
  return (
    <section className="mt-7">
      <h2 className="text-sm uppercase tracking-[0.28em] text-slate-500">
        {title}
      </h2>
      <p
        className={`mt-4 whitespace-pre-wrap leading-8 ${
          monospace ? "font-mono text-sm" : "text-base"
        } text-slate-700`}
      >
        {content || emptyText}
      </p>
    </section>
  );
}

export function NoteDetail({ note }: { note: KnowledgeNote }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-[2rem] border border-slate-900/10 bg-white/82 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${statusToneMap[note.status]}`}
          >
            {statusLabelMap[note.status]}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700">
            {confidenceLabelMap[note.confidence]}
          </span>
        </div>

        <DetailSection
          title="摘要"
          content={note.summary}
          emptyText="还没有提炼摘要，先保留原始上下文。"
        />
        <DetailSection
          title="问题"
          content={note.problem}
          emptyText="还没有明确记录问题定义。"
        />
        <DetailSection
          title="方案"
          content={note.solution}
          emptyText="还没有沉淀最终方案。"
        />
        <DetailSection
          title="为什么"
          content={note.why}
          emptyText="还没有补充判断依据。"
        />
        <DetailSection
          title="原始输入"
          content={note.rawInput}
          emptyText="这条记录还没有补充原始输入。"
        />
        <DetailSection
          title="命令"
          content={note.commands}
          emptyText="还没有记录命令。"
          monospace
        />
        <DetailSection
          title="参考"
          content={note.references}
          emptyText="还没有补充参考资料。"
        />
      </article>

      <aside className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-7 text-stone-100 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
          metadata
        </p>

        <div className="mt-6 space-y-6">
          <section>
            <h2 className="text-sm uppercase tracking-[0.28em] text-stone-400">
              时间
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-100">
              创建于 {formatTimestamp(note.createdAt)}
            </p>
            <p className="mt-1 text-sm leading-7 text-stone-300">
              最近更新于 {formatTimestamp(note.updatedAt)}
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-[0.28em] text-stone-400">
              标签
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {note.tags.length > 0 ? (
                note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-100"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-stone-300">还没有标签。</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-[0.28em] text-stone-400">
              技术栈
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-100">
              {note.stack ?? "暂未记录"}
            </p>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-[0.28em] text-stone-400">
              来源
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-100">
              类型：{note.sourceType}
            </p>
            {note.sourceUrl ? (
              <a
                href={note.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-sm text-amber-200 transition hover:text-amber-100"
              >
                打开来源链接
              </a>
            ) : (
              <p className="mt-2 text-sm text-stone-300">未附带来源链接。</p>
            )}
          </section>
        </div>
      </aside>
    </section>
  );
}
