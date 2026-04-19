"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { aiCompressAction } from "@/app/actions/ai-compress";
import {
  defaultAICompressBatchSize,
  initialAICompressActionState,
  type AICompressActionState,
} from "@/app/actions/ai-compress.shared";
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

const compressedSummarySessionCache = new Map<string, string | null>();

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

function createCompressedSummaryCacheKey(note: Pick<KnowledgeNote, "id" | "updatedAt">) {
  return `${note.id}:${note.updatedAt}`;
}

function readCachedCompressedSummaries(notes: KnowledgeNote[]) {
  const summaries: AICompressActionState["summaries"] = {};

  for (const note of notes) {
    const cachedSummary = compressedSummarySessionCache.get(
      createCompressedSummaryCacheKey(note),
    );

    if (typeof cachedSummary === "string" && cachedSummary) {
      summaries[note.id] = cachedSummary;
    }
  }

  return summaries;
}

function cacheCompressedSummaries(
  notes: KnowledgeNote[],
  summaries: AICompressActionState["summaries"],
) {
  for (const note of notes) {
    compressedSummarySessionCache.set(
      createCompressedSummaryCacheKey(note),
      summaries[note.id] ?? null,
    );
  }
}

export function resetCompressedSummarySessionCacheForTests() {
  compressedSummarySessionCache.clear();
}

function buildAICompressErrorState(noteIds: string[]): AICompressActionState {
  return {
    status: "error",
    message: "AI 压缩提示失败，请稍后重试。",
    noteIds,
    summaries: {},
  };
}

interface NoteListProps {
  notes: KnowledgeNote[];
  emptyTitle: string;
  emptyDescription: string;
  compact?: boolean;
  aiEnabled?: boolean;
  enableCompressedSummaries?: boolean;
  compressBatchSize?: number;
}

export function NoteList({
  notes,
  emptyTitle,
  emptyDescription,
  compact = false,
  aiEnabled = false,
  enableCompressedSummaries = false,
  compressBatchSize = defaultAICompressBatchSize,
}: NoteListProps) {
  const [compressState, setCompressState] = useState(initialAICompressActionState);
  const [isCompressing, setIsCompressing] = useState(false);

  const visibleNotes = useMemo(() => {
    if (!aiEnabled || !enableCompressedSummaries || compact) {
      return [];
    }

    return notes.slice(0, compressBatchSize);
  }, [aiEnabled, compact, compressBatchSize, enableCompressedSummaries, notes]);
  const cachedSummaries = useMemo(
    () => readCachedCompressedSummaries(visibleNotes),
    [visibleNotes],
  );
  const compressionCandidates = useMemo(() => {
    const nextNotes = visibleNotes.filter(
      (note) => !compressedSummarySessionCache.has(createCompressedSummaryCacheKey(note)),
    );
    const nextNoteIds = nextNotes.map((note) => note.id);

    return {
      notes: nextNotes,
      noteIds: nextNoteIds,
      key: nextNoteIds.join(","),
    };
  }, [visibleNotes]);
  const requestedNoteIdsKey = compressionCandidates.key;
  const requestedNoteIdSet = useMemo(
    () => new Set(compressionCandidates.noteIds),
    [compressionCandidates.noteIds],
  );
  const resolvedSummaries = useMemo(
    () => ({
      ...cachedSummaries,
      ...compressState.summaries,
    }),
    [cachedSummaries, compressState.summaries],
  );

  useEffect(() => {
    if (!requestedNoteIdsKey) {
      setCompressState(initialAICompressActionState);
      setIsCompressing(false);
      return;
    }

    let cancelled = false;
    const formData = new FormData();
    formData.set("noteIds", requestedNoteIdsKey);

    setIsCompressing(true);
    setCompressState(initialAICompressActionState);

    async function runCompression() {
      try {
        const nextState = await aiCompressAction(initialAICompressActionState, formData);
        if (!cancelled) {
          if (nextState.status === "success") {
            cacheCompressedSummaries(compressionCandidates.notes, nextState.summaries);
          }
          setCompressState(nextState);
        }
      } catch {
        if (!cancelled) {
          setCompressState(buildAICompressErrorState(compressionCandidates.noteIds));
        }
      } finally {
        if (!cancelled) {
          setIsCompressing(false);
        }
      }
    }

    void runCompression();

    return () => {
      cancelled = true;
    };
  }, [compressionCandidates, requestedNoteIdsKey]);

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
    <>
      {compressState.status === "error" && enableCompressedSummaries && aiEnabled && !compact ? (
        <div className="rounded-[1.5rem] border border-amber-700/15 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
          {compressState.message}
        </div>
      ) : null}

      <ul className={clsx("grid gap-4", compact ? "xl:grid-cols-1" : "xl:grid-cols-2")}>
        {notes.map((note) => {
          const compressedSummary = resolvedSummaries[note.id];
          const showLoadingHint =
            !compact &&
            enableCompressedSummaries &&
            aiEnabled &&
            requestedNoteIdSet.has(note.id) &&
            isCompressing &&
            !compressedSummary;

          return (
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

              {compressedSummary ? (
                <div className="mt-4 rounded-[1.25rem] border border-amber-700/15 bg-amber-50/80 px-4 py-3 text-amber-950">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-800">
                    AI 快速提示
                  </p>
                  <p className="mt-2 text-sm leading-7 text-amber-950">{compressedSummary}</p>
                </div>
              ) : null}

              {showLoadingHint ? (
                <div className="mt-4 rounded-[1.25rem] border border-dashed border-slate-900/15 bg-stone-50 px-4 py-3 text-slate-700">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    AI 快速提示
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    正在压缩这条结果的关键信息...
                  </p>
                </div>
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
          );
        })}
      </ul>
    </>
  );
}
