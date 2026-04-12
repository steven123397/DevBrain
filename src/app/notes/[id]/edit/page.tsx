import Link from "next/link";
import { notFound } from "next/navigation";

import {
  createUpdateNoteFormValues,
} from "@/app/actions/update-note.shared";
import { NoteEditorForm } from "@/components/note-editor-form";
import { noteService } from "@/features/notes/note.service";

export const dynamic = "force-dynamic";

export default async function EditNotePage({
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
        className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(187,134,72,0.24),_transparent_60%)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-4 border-b border-slate-900/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
              digest workflow
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
              整理条目
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-700">
              把刚收进 Inbox 的碎片上下文补全成结构化知识卡片，后续搜索和复用都会更稳定。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/notes/${note.id}`}
              className="rounded-full border border-slate-900/10 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-900/25 hover:text-slate-950"
            >
              返回详情
            </Link>
            <Link
              href="/notes"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-slate-800"
            >
              返回列表
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <NoteEditorForm initialValues={createUpdateNoteFormValues(note)} />

          <aside className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-7 text-stone-100 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
              digest prompts
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
              这次记录为什么值得留下来
            </h2>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-stone-300">
              <li>摘要先写成“未来自己 10 秒能看懂”的结论句。</li>
              <li>问题描述聚焦触发条件，不要只抄报错文本。</li>
              <li>方案尽量写到可执行动作，必要时补上命令和参考。</li>
              <li>如果已经验证过，记得把状态切到 Digested、可信度切高。</li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
