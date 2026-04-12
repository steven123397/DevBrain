"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createNoteAction } from "@/app/actions/create-note";
import { initialCreateNoteFormState } from "@/app/actions/create-note.shared";

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
      {pending ? "正在保存..." : "保存到 Inbox"}
    </button>
  );
}

export function NoteForm() {
  const [state, formAction] = useActionState(
    createNoteAction,
    initialCreateNoteFormState,
  );

  return (
    <form
      action={formAction}
      className="rounded-[2rem] border border-slate-900/10 bg-white/82 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-amber-900">
          默认状态 Inbox
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-700">
          默认可信度 Draft
        </span>
      </div>

      <div className="mt-6 grid gap-5">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          标题
          <input
            aria-label="标题"
            name="title"
            required
            defaultValue={state.values.title}
            placeholder="例如：pnpm peer dep fix"
            className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
          />
          <FieldError message={state.fieldErrors?.title?.[0]} />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          原始输入
          <textarea
            aria-label="原始输入"
            name="rawInput"
            rows={7}
            defaultValue={state.values.rawInput}
            placeholder="把刚遇到的报错、命令、上下文和临时判断先扔进来。"
            className="rounded-3xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base leading-7 text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
          />
        </label>

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            标签
            <input
              aria-label="标签"
              name="tags"
              defaultValue={state.values.tags}
              placeholder="react, nextjs, pnpm"
              className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            技术栈
            <input
              aria-label="技术栈"
              name="stack"
              defaultValue={state.values.stack}
              placeholder="Next.js / Node.js / Tooling"
              className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
          </label>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
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
            <FieldError message={state.fieldErrors?.sourceType?.[0]} />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            来源链接
            <input
              aria-label="来源链接"
              name="sourceUrl"
              type="url"
              defaultValue={state.values.sourceUrl}
              placeholder="https://example.com/reference"
              className="rounded-2xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
            <FieldError message={state.fieldErrors?.sourceUrl?.[0]} />
          </label>
        </div>
      </div>

      {state.status === "error" ? (
        <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {state.message}
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          先快速把入口信息存进 Inbox，后面再在条目详情里继续补全结构化字段。
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
