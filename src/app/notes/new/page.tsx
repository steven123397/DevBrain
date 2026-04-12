import Link from "next/link";

import { NoteForm } from "@/components/note-form";

export const dynamic = "force-dynamic";

export default function NewNotePage() {
  return (
    <main className="relative flex-1 overflow-hidden bg-[linear-gradient(180deg,#f7f6ef_0%,#f1ede2_42%,#ece3d2_100%)] text-slate-950">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(187,134,72,0.24),_transparent_60%)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-4 border-b border-slate-900/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
              Fast capture
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
              快速新建条目
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-700">
              先把碎片信息快速送进 Inbox，保证收集动作足够轻，再把整理动作留给后续消化流程。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/notes"
              className="rounded-full border border-slate-900/10 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-900/25 hover:text-slate-950"
            >
              返回条目列表
            </Link>
            <Link
              href="/"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-slate-800"
            >
              返回仪表盘
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <NoteForm />

          <aside className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-7 text-stone-100 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
              capture tips
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
              30 秒内先记住上下文
            </h2>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-stone-300">
              <li>标题尽量写成“下次搜索时会输入的词”。</li>
              <li>原始输入保留报错、命令、环境和临时判断，先别追求整洁。</li>
              <li>标签只放检索价值高的关键词，技术栈保持粗粒度即可。</li>
              <li>如果来源可追溯，顺手贴上链接，后续回查成本会低很多。</li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
