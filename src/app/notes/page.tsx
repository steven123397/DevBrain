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

function takeNonEmptyValue(value: SearchParamValue) {
  const resolved = takeFirstValue(value);

  if (!resolved) {
    return undefined;
  }

  return resolved;
}

function resolveSearchText(
  resolvedSearchParams: Record<string, SearchParamValue>,
) {
  return takeNonEmptyValue(resolvedSearchParams.q) ?? takeNonEmptyValue(resolvedSearchParams.query);
}

function resolveEmptyState(filters: {
  query?: string;
  status?: string;
  tag?: string;
  stack?: string;
}) {
  const hasSearchTerms = Boolean(filters.query || filters.tag || filters.stack);

  if (!hasSearchTerms && filters.status === "inbox") {
    return {
      title: "Inbox 现在是空的",
      description: "先新建一条记录，或者稍后再回来继续整理新的碎片条目。",
    };
  }

  if (!hasSearchTerms && filters.status === "digested") {
    return {
      title: "还没有 Digested 条目",
      description: "先把 Inbox 里的记录整理成结构化知识卡片，这里才会开始出现结果。",
    };
  }

  if (!hasSearchTerms && filters.status === "archived") {
    return {
      title: "还没有 Archived 条目",
      description: "当前还没有进入归档阶段的记录，先继续积累和整理即可。",
    };
  }

  if (hasSearchTerms || filters.status) {
    return {
      title: "还没有匹配到条目",
      description: "试试放宽筛选条件，或者先去新建一条 Inbox 记录。",
    };
  }

  return {
    title: "还没有任何条目",
    description: "先去新建第一条 Inbox 记录，列表页就会开始出现你的知识卡片。",
  };
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  const resolvedSearchParams = (searchParams ? await searchParams : {}) ?? {};
  const filters = noteFiltersSchema.parse({
    query: resolveSearchText(resolvedSearchParams),
    status: takeNonEmptyValue(resolvedSearchParams.status),
    tag: takeNonEmptyValue(resolvedSearchParams.tag),
    stack: takeNonEmptyValue(resolvedSearchParams.stack),
    sort: takeNonEmptyValue(resolvedSearchParams.sort),
  });
  const showDeletedNotice = takeFirstValue(resolvedSearchParams.deleted) === "1";
  const emptyState = resolveEmptyState(filters);

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

        {showDeletedNotice ? (
          <section className="rounded-[1.5rem] border border-emerald-700/15 bg-emerald-50 px-5 py-4 text-sm leading-7 text-emerald-900">
            条目已删除，你可以继续筛选其他记录，或者马上新建一条新的 Inbox 知识。
          </section>
        ) : null}

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
          emptyTitle={emptyState.title}
          emptyDescription={emptyState.description}
        />
      </div>
    </main>
  );
}
