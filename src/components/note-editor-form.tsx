"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateNoteAction } from "@/app/actions/update-note";
import {
  createInitialUpdateNoteFormState,
  type UpdateNoteFormValues,
} from "@/app/actions/update-note.shared";

const statusOptions = [
  { value: "inbox", label: "Inbox" },
  { value: "digested", label: "Digested" },
  { value: "archived", label: "Archived" },
] as const;

const confidenceOptions = [
  { value: "draft", label: "Draft" },
  { value: "tested", label: "Tested" },
  { value: "trusted", label: "Trusted" },
] as const;

const sourceTypeOptions = [
  { value: "manual", label: "手动记录" },
  { value: "article", label: "文章" },
  { value: "chat", label: "对话" },
  { value: "terminal", label: "终端" },
  { value: "doc", label: "文档" },
  { value: "other", label: "其他" },
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-rose-700">{message}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {pending ? "正在保存..." : "保存并返回详情"}
    </button>
  );
}

export function NoteEditorForm({
  initialValues,
}: {
  initialValues: UpdateNoteFormValues;
}) {
  const [state, formAction] = useActionState(
    updateNoteAction,
    createInitialUpdateNoteFormState(initialValues),
  );

  return (
    <form
      action={formAction}
      className="rounded-[2rem] border border-slate-900/10 bg-white/82 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8"
    >
      <input type="hidden" name="noteId" value={state.values.noteId} />

      <div className="grid gap-5">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          标题
          <input
            aria-label="标题"
            name="title"
            required
            defaultValue={state.values.title}
            className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
          />
          <FieldError message={state.fieldErrors?.title?.[0]} />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          原始输入
          <textarea
            aria-label="原始输入"
            name="rawInput"
            rows={6}
            defaultValue={state.values.rawInput}
            className="rounded-3xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base leading-7 text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
          />
        </label>

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            摘要
            <textarea
              aria-label="摘要"
              name="summary"
              rows={4}
              defaultValue={state.values.summary}
              className="rounded-3xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base leading-7 text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            问题
            <textarea
              aria-label="问题"
              name="problem"
              rows={4}
              defaultValue={state.values.problem}
              className="rounded-3xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base leading-7 text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
          </label>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            方案
            <textarea
              aria-label="方案"
              name="solution"
              rows={4}
              defaultValue={state.values.solution}
              className="rounded-3xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base leading-7 text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            为什么
            <textarea
              aria-label="为什么"
              name="why"
              rows={4}
              defaultValue={state.values.why}
              className="rounded-3xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base leading-7 text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
          </label>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            命令
            <textarea
              aria-label="命令"
              name="commands"
              rows={3}
              defaultValue={state.values.commands}
              className="rounded-3xl border border-slate-900/10 bg-stone-50 px-4 py-3 font-mono text-sm leading-7 text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            参考
            <textarea
              aria-label="参考"
              name="references"
              rows={3}
              defaultValue={state.values.references}
              className="rounded-3xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base leading-7 text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
          </label>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            标签
            <input
              aria-label="标签"
              name="tags"
              defaultValue={state.values.tags}
              className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            技术栈
            <input
              aria-label="技术栈"
              name="stack"
              defaultValue={state.values.stack}
              className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
          </label>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            状态
            <select
              aria-label="状态"
              name="status"
              defaultValue={state.values.status}
              className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            可信度
            <select
              aria-label="可信度"
              name="confidence"
              defaultValue={state.values.confidence}
              className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            >
              {confidenceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            来源类型
            <select
              aria-label="来源类型"
              name="sourceType"
              defaultValue={state.values.sourceType}
              className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            >
              {sourceTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          来源链接
          <input
            aria-label="来源链接"
            name="sourceUrl"
            type="url"
            defaultValue={state.values.sourceUrl}
            className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
          />
          <FieldError message={state.fieldErrors?.sourceUrl?.[0]} />
        </label>
      </div>

      {state.status === "error" ? (
        <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {state.message}
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          这里既可以做轻量修正，也可以把 Inbox 碎片补成结构化的可复用知识卡片。
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
