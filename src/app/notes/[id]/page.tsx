import Link from "next/link";
import { notFound } from "next/navigation";

import { NoteDetail } from "@/components/note-detail";
import { noteService } from "@/features/notes/note.service";

export const dynamic = "force-dynamic";

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
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-700">
              先保留原始上下文，再逐步把它消化成结构化的知识卡片。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/notes/${note.id}/edit`}
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-slate-800"
            >
              继续整理
            </Link>
            <Link
              href="/notes/new"
              className="rounded-full border border-slate-900/10 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-900/25 hover:text-slate-950"
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

        <NoteDetail note={note} />
      </div>
    </main>
  );
}
