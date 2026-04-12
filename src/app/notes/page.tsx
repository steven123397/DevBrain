import Link from "next/link";

import { FilterBar } from "@/components/filter-bar";
import { NoteList } from "@/components/note-list";
import { noteFiltersSchema } from "@/features/notes/note.schemas";
import { noteService } from "@/features/notes/note.service";

export const dynamic = "force-dynamic";

type SearchParamValue = string | string[] | undefined;

function takeFirstValue(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function resolveSearchText(
  resolvedSearchParams: Record<string, SearchParamValue>,
) {
  return takeFirstValue(resolvedSearchParams.q) ?? takeFirstValue(resolvedSearchParams.query);
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  const resolvedSearchParams = (searchParams ? await searchParams : {}) ?? {};
  const filters = noteFiltersSchema.parse({
    query: resolveSearchText(resolvedSearchParams),
    status: takeFirstValue(resolvedSearchParams.status),
    tag: takeFirstValue(resolvedSearchParams.tag),
    stack: takeFirstValue(resolvedSearchParams.stack),
    sort: takeFirstValue(resolvedSearchParams.sort),
  });

  const [filterOptions, notes] = await Promise.all([
    noteService.listFilterOptions(),
    noteService.listNotes(filters),
  ]);

  return (
    <main className="relative flex-1 overflow-hidden bg-[linear-gradient(180deg,#f7f6ef_0%,#f1ede2_42%,#ece3d2_100%)] text-slate-950">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(187,134,72,0.24),_transparent_58%)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-4 border-b border-slate-900/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
              Searchable notebook
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
              搜索条目
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-700">
              先把真实踩坑和可复用解法放在一个地方，再通过筛选和搜索把它们重新叫回来。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-slate-900/10 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-900/25 hover:text-slate-950"
            >
              返回仪表盘
            </Link>
            <Link
              href="/notes/new"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-slate-800"
            >
              快速新建
            </Link>
          </div>
        </header>

        <FilterBar options={filterOptions} values={filters} />

        <section className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            {notes.length} 条结果
          </p>
          <p className="text-sm text-slate-600">
            当前排序：{filters.sort === "updatedAtDesc" ? "最近更新" : "最近创建"}
          </p>
        </section>

        <NoteList
          notes={notes}
          emptyTitle="还没有匹配到条目"
          emptyDescription="试试放宽筛选条件，或者先去新建一条 Inbox 记录。"
        />
      </div>
    </main>
  );
}
