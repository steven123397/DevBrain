import Link from "next/link";
import { notFound } from "next/navigation";

import { noteService } from "@/features/notes/note.service";

export const dynamic = "force-dynamic";

const statusLabelMap = {
  inbox: "Inbox",
  digested: "Digested",
  archived: "Archived",
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

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await noteService.getNoteById(id);

  if (!note) {
    notFound();
  }

  return (
    <main className="relative flex-1 overflow-hidden bg-[linear-gradient(180deg,#f7f6ef_0%,#f1ede2_42%,#ece3d2_100%)] text-slate-950">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(187,134,72,0.22),_transparent_58%)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-4 border-b border-slate-900/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
              note detail
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
              {note.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              创建于 {formatTimestamp(note.createdAt)}，最近更新于{" "}
              {formatTimestamp(note.updatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/notes/new"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-slate-800"
            >
              再记一条
            </Link>
            <Link
              href="/notes"
              className="rounded-full border border-slate-900/10 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-900/25 hover:text-slate-950"
            >
              返回列表
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[2rem] border border-slate-900/10 bg-white/82 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-900">
                {statusLabelMap[note.status]}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700">
                {confidenceLabelMap[note.confidence]}
              </span>
            </div>

            <section className="mt-7">
              <h2 className="text-sm uppercase tracking-[0.28em] text-slate-500">
                原始输入
              </h2>
              <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-700">
                {note.rawInput || "这条记录还没有补充原始输入。"}
              </p>
            </section>

            {note.summary ? (
              <section className="mt-7">
                <h2 className="text-sm uppercase tracking-[0.28em] text-slate-500">
                  摘要
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-700">
                  {note.summary}
                </p>
              </section>
            ) : null}
          </article>

          <aside className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-7 text-stone-100 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
              metadata
            </p>

            <div className="mt-6 space-y-6">
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
      </div>
    </main>
  );
}
