import Link from "next/link";

import type { NoteSort } from "@/features/notes/note.schemas";
import type { NoteFilterOptions, NoteStatus } from "@/features/notes/note.types";

const statusOptions: Array<{ value: NoteStatus | ""; label: string }> = [
  { value: "", label: "全部状态" },
  { value: "inbox", label: "只看 Inbox" },
  { value: "digested", label: "只看 Digested" },
  { value: "archived", label: "只看 Archived" },
];

const sortOptions: Array<{ value: NoteSort; label: string }> = [
  { value: "updatedAtDesc", label: "最近更新" },
  { value: "createdAtDesc", label: "最近创建" },
];

interface FilterBarProps {
  options: NoteFilterOptions;
  values: {
    query?: string;
    status?: NoteStatus;
    tag?: string;
    stack?: string;
    sort: NoteSort;
  };
}

export function FilterBar({ options, values }: FilterBarProps) {
  return (
    <form
      action="/notes"
      className="rounded-[1.75rem] border border-slate-900/10 bg-white/78 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur"
    >
      <div className="grid gap-4 lg:grid-cols-[1.25fr_repeat(4,minmax(0,1fr))]">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
          搜索条目
          <input
            aria-label="搜索条目"
            name="q"
            type="search"
            defaultValue={values.query ?? ""}
            placeholder="标题、原始输入、问题或方案"
            className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-sm normal-case tracking-normal text-slate-900 outline-none transition focus:border-amber-700/40 focus:bg-white"
          />
        </label>

        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
          状态
          <select
            name="status"
            defaultValue={values.status ?? ""}
            className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-sm normal-case tracking-normal text-slate-900 outline-none transition focus:border-amber-700/40 focus:bg-white"
          >
            {statusOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
          标签
          <select
            name="tag"
            defaultValue={values.tag ?? ""}
            className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-sm normal-case tracking-normal text-slate-900 outline-none transition focus:border-amber-700/40 focus:bg-white"
          >
            <option value="">全部标签</option>
            {options.tags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
          技术栈
          <select
            name="stack"
            defaultValue={values.stack ?? ""}
            className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-sm normal-case tracking-normal text-slate-900 outline-none transition focus:border-amber-700/40 focus:bg-white"
          >
            <option value="">全部技术栈</option>
            {options.stacks.map((stack) => (
              <option key={stack} value={stack}>
                {stack}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
          排序
          <select
            name="sort"
            defaultValue={values.sort}
            className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-sm normal-case tracking-normal text-slate-900 outline-none transition focus:border-amber-700/40 focus:bg-white"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-slate-800"
        >
          应用筛选
        </button>
        <Link
          href="/notes"
          className="rounded-full border border-slate-900/10 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-900/25 hover:text-slate-950"
        >
          清空筛选
        </Link>
      </div>
    </form>
  );
}
