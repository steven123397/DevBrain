import Link from "next/link";

export default function NoteNotFound() {
  return (
    <main className="relative flex-1 overflow-hidden bg-[linear-gradient(180deg,#f7f6ef_0%,#f1ede2_42%,#ece3d2_100%)] text-slate-950">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(187,134,72,0.22),_transparent_58%)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 py-10 text-center sm:px-10 lg:px-12">
        <p className="text-xs uppercase tracking-[0.34em] text-slate-500">
          note missing
        </p>
        <h1 className="text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
          这条记录已不存在
        </h1>
        <p className="max-w-2xl text-base leading-8 text-slate-700">
          它可能已经被删除，或者你打开的是一个过期链接。回到列表页继续筛选，或者直接新建一条新的 Inbox 记录。
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/notes"
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-slate-800"
          >
            返回列表
          </Link>
          <Link
            href="/notes/new"
            className="rounded-full border border-slate-900/10 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-900/25 hover:text-slate-950"
          >
            快速新建
          </Link>
        </div>
      </div>
    </main>
  );
}
