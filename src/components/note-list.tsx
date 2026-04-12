import clsx from "clsx";
import Link from "next/link";

import type { KnowledgeNote } from "@/features/notes/note.types";

const statusLabelMap = {
  inbox: "Inbox",
  digested: "Digested",
  archived: "Archived",
} as const;

const statusToneMap = {
  inbox: "border-amber-700/20 bg-amber-100 text-amber-900",
  digested: "border-emerald-700/20 bg-emerald-100 text-emerald-900",
  archived: "border-slate-700/15 bg-slate-200 text-slate-700",
} as const;

function formatNoteDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function createExcerpt(note: KnowledgeNote) {
  const excerpt = note.summary ?? note.problem ?? note.solution ?? note.rawInput;

  if (!excerpt) {
    return "还没有补充摘要，先保持原始记录。";
  }

  return excerpt;
}

interface NoteListProps {
  notes: KnowledgeNote[];
  emptyTitle: string;
  emptyDescription: string;
  compact?: boolean;
}

export function NoteList({
  notes,
  emptyTitle,
  emptyDescription,
  compact = false,
}: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-slate-900/20 bg-white/65 p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
        <p className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
          {emptyTitle}
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-600">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ul className={clsx("grid gap-4", compact ? "xl:grid-cols-1" : "xl:grid-cols-2")}>
      {notes.map((note) => (
        <li
          key={note.id}
          className={clsx(
            "rounded-[1.75rem] border border-slate-900/10 bg-white/82 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur",
            compact ? "p-5" : "p-6",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                最近更新 {formatNoteDate(note.updatedAt)}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                <Link
                  href={`/notes/${note.id}`}
                  aria-label={`打开 ${note.title}`}
                  className="transition hover:text-amber-800"
                >
                  {note.title}
                </Link>
              </h3>
            </div>
            <span
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]",
                statusToneMap[note.status],
              )}
            >
              {statusLabelMap[note.status]}
            </span>
          </div>

          {!compact ? (
            <p className="mt-4 text-sm leading-7 text-slate-650 text-slate-700">
              {createExcerpt(note)}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
            {note.stack ? (
              <span className="rounded-full border border-slate-900/10 bg-stone-100 px-3 py-1">
                {note.stack}
              </span>
            ) : null}
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-900/10 bg-white px-3 py-1 lowercase"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-5">
            <Link
              href={`/notes/${note.id}`}
              className="text-sm font-medium text-amber-800 transition hover:text-amber-950"
            >
              查看详情
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
