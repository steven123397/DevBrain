"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { aiExtractAction } from "@/app/actions/ai-extract";
import {
  initialAIExtractActionState,
  type AIExtractActionState,
} from "@/app/actions/ai-extract.shared";
import { aiSuggestTagsAction } from "@/app/actions/ai-suggest-tags";
import {
  initialAISuggestTagsActionState,
  type AISuggestTagsActionState,
} from "@/app/actions/ai-suggest-tags.shared";
import { updateNoteAction } from "@/app/actions/update-note";
import {
  createInitialUpdateNoteFormState,
  type UpdateNoteFormValues,
} from "@/app/actions/update-note.shared";
import type { FieldCandidateConfidence } from "@/features/ai/ai.types";

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

const extractFieldDefinitions = [
  { name: "summary", label: "摘要" },
  { name: "problem", label: "问题" },
  { name: "solution", label: "方案" },
  { name: "why", label: "为什么" },
] as const;

type ExtractFieldName = (typeof extractFieldDefinitions)[number]["name"];
type CandidateDecision = "accepted" | "editing" | "ignored";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-rose-700">{message}</p>;
}

function formatConfidence(confidence: FieldCandidateConfidence) {
  switch (confidence) {
    case "high":
      return "高置信";
    case "medium":
      return "中置信";
    case "low":
      return "低置信";
    default:
      return "候选";
  }
}

function confidenceBadgeClass(confidence: FieldCandidateConfidence) {
  switch (confidence) {
    case "high":
      return "bg-emerald-100 text-emerald-800";
    case "medium":
      return "bg-amber-100 text-amber-800";
    case "low":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-200 text-slate-700";
  }
}

function parseTagInput(value: string) {
  return value
    .split(/[\n,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeTagKey(value: string) {
  return value.trim().toLowerCase();
}

function joinTags(tags: string[]) {
  return tags.join(", ");
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

function buildAIExtractErrorState(
  previousState: AIExtractActionState,
): AIExtractActionState {
  return {
    status: "error",
    message: "AI 提取失败，请稍后重试。",
    values: previousState.values,
    candidates: null,
  };
}

function buildAISuggestTagsErrorState(
  previousState: AISuggestTagsActionState,
): AISuggestTagsActionState {
  return {
    status: "error",
    message: "AI 标签建议失败，请稍后重试。",
    values: previousState.values,
    suggestions: null,
  };
}

export function NoteEditorForm({
  initialValues,
  aiEnabled = false,
}: {
  initialValues: UpdateNoteFormValues;
  aiEnabled?: boolean;
}) {
  const [state, formAction] = useActionState(
    updateNoteAction,
    createInitialUpdateNoteFormState(initialValues),
  );
  const [extractState, setExtractState] = useState(initialAIExtractActionState);
  const [suggestState, setSuggestState] = useState(initialAISuggestTagsActionState);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [candidateDecisions, setCandidateDecisions] = useState<
    Partial<Record<ExtractFieldName, CandidateDecision>>
  >({});
  const [tagInputValue, setTagInputValue] = useState(initialValues.tags);
  const [stackInputValue, setStackInputValue] = useState(initialValues.stack);
  const titleRef = useRef<HTMLInputElement>(null);
  const rawInputRef = useRef<HTMLTextAreaElement>(null);
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const problemRef = useRef<HTMLTextAreaElement>(null);
  const solutionRef = useRef<HTMLTextAreaElement>(null);
  const whyRef = useRef<HTMLTextAreaElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const stackRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTagInputValue(state.values.tags);
  }, [state.values.tags]);

  useEffect(() => {
    setStackInputValue(state.values.stack);
  }, [state.values.stack]);

  const candidateFields = extractFieldDefinitions.filter(
    (field) => extractState.candidates?.[field.name],
  );
  const currentTags = parseTagInput(tagInputValue);
  const currentTagKeys = new Set(currentTags.map(normalizeTagKey));
  const suggestedTags = suggestState.suggestions?.suggestedTags ?? [];
  const suggestedStack = suggestState.suggestions?.suggestedStack ?? null;
  const hasSuggestedTags = suggestedTags.length > 0;
  const hasSuggestedStack = Boolean(suggestedStack);

  function getTargetRef(fieldName: ExtractFieldName) {
    switch (fieldName) {
      case "summary":
        return summaryRef;
      case "problem":
        return problemRef;
      case "solution":
        return solutionRef;
      case "why":
        return whyRef;
      default:
        return summaryRef;
    }
  }

  async function handleAIExtract() {
    const previousState = extractState;
    const formData = new FormData();
    formData.set("noteId", state.values.noteId);
    formData.set("rawInput", rawInputRef.current?.value ?? "");
    formData.set("title", titleRef.current?.value ?? "");
    formData.set("tags", tagInputValue);
    formData.set("stack", stackInputValue);

    setIsExtracting(true);
    try {
      const nextState = await aiExtractAction(previousState, formData);
      setExtractState(nextState);
      setCandidateDecisions({});
    } catch {
      setExtractState(buildAIExtractErrorState(previousState));
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleAISuggestTags() {
    const previousState = suggestState;
    const formData = new FormData();
    formData.set("rawInput", rawInputRef.current?.value ?? "");
    formData.set("tags", tagInputValue);
    formData.set("stack", stackInputValue);

    setIsSuggesting(true);
    try {
      const nextState = await aiSuggestTagsAction(previousState, formData);
      setSuggestState(nextState);
    } catch {
      setSuggestState(buildAISuggestTagsErrorState(previousState));
    } finally {
      setIsSuggesting(false);
    }
  }

  function applyCandidate(fieldName: ExtractFieldName, shouldFocus: boolean) {
    const candidate = extractState.candidates?.[fieldName];
    const target = getTargetRef(fieldName).current;

    if (!candidate || !target) {
      return;
    }

    target.value = candidate.value;
    if (shouldFocus) {
      target.focus();
    }

    setCandidateDecisions((current) => ({
      ...current,
      [fieldName]: shouldFocus ? "editing" : "accepted",
    }));
  }

  function ignoreCandidate(fieldName: ExtractFieldName) {
    setCandidateDecisions((current) => ({
      ...current,
      [fieldName]: "ignored",
    }));
  }

  function addSuggestedTag(tag: string) {
    const normalized = normalizeTagKey(tag);
    if (!normalized || currentTagKeys.has(normalized)) {
      return;
    }

    const nextTags = [...currentTags, tag];
    setTagInputValue(joinTags(nextTags));
    tagsRef.current?.focus();
  }

  function applySuggestedStack(nextStack: string) {
    setStackInputValue(nextStack);
    stackRef.current?.focus();
  }

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
            ref={titleRef}
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
            ref={rawInputRef}
            defaultValue={state.values.rawInput}
            className="rounded-3xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base leading-7 text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
          />
        </label>

        {aiEnabled ? (
          <section className="rounded-[1.75rem] border border-slate-900/10 bg-[linear-gradient(135deg,rgba(255,248,238,0.9),rgba(245,240,232,0.95))] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-amber-800">
                  ai assist
                </p>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                    AI 辅助提取
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-slate-700">
                    从原始输入生成摘要、问题、方案、为什么候选。先审阅，再决定采纳、修改或忽略。
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  void handleAIExtract();
                }}
                disabled={isExtracting}
                className="rounded-full border border-slate-900/10 bg-slate-950 px-5 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isExtracting ? "正在提取..." : "AI 辅助提取"}
              </button>
            </div>

            <p className="mt-4 text-xs leading-6 text-slate-500">
              AI 候选只会填回表单，不会自动保存。
            </p>

            {isExtracting ? (
              <div
                role="status"
                className="mt-4 rounded-3xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950"
              >
                <p className="font-medium">
                  AI 正在整理这条原始输入，真实百炼调用通常需要 20~40 秒。
                </p>
                <p className="mt-2 leading-7 text-sky-900">
                  你可以继续编辑下面的字段，候选返回后再决定是否采纳。
                </p>
              </div>
            ) : null}

            {extractState.status === "error" || extractState.status === "disabled" ? (
              <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {extractState.message}
              </div>
            ) : null}

            {extractState.status === "success" && candidateFields.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-sm text-slate-600">
                这次没有提取到足够明确的结构化候选，可以补充更多上下文后再试一次。
              </div>
            ) : null}

            {extractState.status === "success" && candidateFields.length > 0 ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {candidateFields.map((field) => {
                  const candidate = extractState.candidates?.[field.name];
                  const decision = candidateDecisions[field.name];

                  if (!candidate || decision === "ignored") {
                    return null;
                  }

                  return (
                    <article
                      key={field.name}
                      className="rounded-[1.5rem] border border-slate-900/10 bg-white/90 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {field.label}
                          </h3>
                          <p className="text-xs leading-6 text-slate-500">
                            {decision === "accepted"
                              ? "已采纳到表单，可继续微调。"
                              : decision === "editing"
                                ? "已填入表单并聚焦，可直接修改。"
                                : "先审阅候选，再决定是否采纳。"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${confidenceBadgeClass(candidate.confidence)}`}
                        >
                          {formatConfidence(candidate.confidence)}
                        </span>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                        {candidate.value}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => applyCandidate(field.name, false)}
                          className="rounded-full bg-slate-950 px-4 py-2 text-xs font-medium text-stone-50 transition hover:bg-slate-800"
                        >
                          {`采纳${field.label}候选`}
                        </button>
                        <button
                          type="button"
                          onClick={() => applyCandidate(field.name, true)}
                          className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-900/25 hover:text-slate-950"
                        >
                          {`修改${field.label}候选`}
                        </button>
                        <button
                          type="button"
                          onClick={() => ignoreCandidate(field.name)}
                          className="rounded-full border border-slate-900/10 bg-stone-100 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-900/25 hover:text-slate-900"
                        >
                          {`忽略${field.label}候选`}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            摘要
            <textarea
              aria-label="摘要"
              name="summary"
              rows={4}
              ref={summaryRef}
              defaultValue={state.values.summary}
              className="rounded-3xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base leading-7 text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
            <FieldError message={state.fieldErrors?.summary?.[0]} />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            问题
            <textarea
              aria-label="问题"
              name="problem"
              rows={4}
              ref={problemRef}
              defaultValue={state.values.problem}
              className="rounded-3xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base leading-7 text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
            <FieldError message={state.fieldErrors?.problem?.[0]} />
          </label>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            方案
            <textarea
              aria-label="方案"
              name="solution"
              rows={4}
              ref={solutionRef}
              defaultValue={state.values.solution}
              className="rounded-3xl border border-slate-900/10 bg-stone-50 px-4 py-3 text-base leading-7 text-slate-950 outline-none transition focus:border-amber-700/40 focus:bg-white"
            />
            <FieldError message={state.fieldErrors?.solution?.[0]} />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            为什么
            <textarea
              aria-label="为什么"
              name="why"
              rows={4}
              ref={whyRef}
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

        <div className="rounded-[1.5rem] border border-slate-900/10 bg-stone-50/75 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                标签与技术栈
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                标签先保证未来检索好找；技术栈尽量收敛到一个稳定主类目，方便筛选与相关推荐。
              </p>
            </div>

            {aiEnabled ? (
              <button
                type="button"
                onClick={() => {
                  void handleAISuggestTags();
                }}
                disabled={isSuggesting}
                className="rounded-full border border-slate-900/10 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-900/25 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {isSuggesting ? "正在建议..." : "AI 建议"}
              </button>
            ) : null}
          </div>

          {aiEnabled ? (
            <p className="mt-4 text-xs leading-6 text-slate-500">
              建议标签会保留为可点击候选；点击后只回填当前表单，不会自动覆盖已有输入。
            </p>
          ) : null}

          {isSuggesting ? (
            <div
              role="status"
              className="mt-4 rounded-3xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950"
            >
              <p className="font-medium">
                AI 正在分析标签和技术栈，真实百炼调用通常需要 20~40 秒。
              </p>
              <p className="mt-2 leading-7 text-sky-900">
                你可以继续完善原始输入或手动编辑标签，候选返回后再决定是否采纳。
              </p>
            </div>
          ) : null}

          {suggestState.status === "error" || suggestState.status === "disabled" ? (
            <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {suggestState.message}
            </div>
          ) : null}

          {suggestState.status === "success" && !hasSuggestedTags && !hasSuggestedStack ? (
            <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-sm text-slate-600">
              这次没有生成足够明确的标签或技术栈建议，可以先补充原始输入再试一次。
            </div>
          ) : null}

          {suggestState.status === "success" && (hasSuggestedTags || hasSuggestedStack) ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[1.25rem] border border-slate-900/10 bg-white/90 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  suggested tags
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => {
                    const alreadyAdded = currentTagKeys.has(normalizeTagKey(tag));

                    return (
                      <button
                        key={tag}
                        type="button"
                        aria-label={`添加标签建议 ${tag}`}
                        disabled={alreadyAdded}
                        onClick={() => addSuggestedTag(tag)}
                        className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                          alreadyAdded
                            ? "cursor-not-allowed border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border border-slate-900/10 bg-white text-slate-700 hover:border-slate-900/25 hover:text-slate-950"
                        }`}
                      >
                        {alreadyAdded ? `已添加 #${tag}` : `#${tag}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-slate-900/10 bg-white/90 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  suggested stack
                </p>
                {suggestedStack ? (
                  <button
                    type="button"
                    aria-label={`应用技术栈建议 ${suggestedStack}`}
                    disabled={stackInputValue.trim().toLowerCase() === suggestedStack.trim().toLowerCase()}
                    onClick={() => applySuggestedStack(suggestedStack)}
                    className={`mt-3 rounded-full px-4 py-2 text-sm font-medium transition ${
                      stackInputValue.trim().toLowerCase() === suggestedStack.trim().toLowerCase()
                        ? "cursor-not-allowed border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-slate-900/10 bg-white text-slate-700 hover:border-slate-900/25 hover:text-slate-950"
                    }`}
                  >
                    {stackInputValue.trim().toLowerCase() === suggestedStack.trim().toLowerCase()
                      ? `${suggestedStack}（已应用）`
                      : suggestedStack}
                  </button>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">这次没有推荐明确的技术栈。</p>
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              标签
              <input
                aria-label="标签"
                name="tags"
                ref={tagsRef}
                value={tagInputValue}
                onChange={(event) => setTagInputValue(event.target.value)}
                className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-700/40"
              />
              <p className="text-xs leading-6 text-slate-500">
                会自动统一常见写法；输入时不用手动处理大小写或 `#` 前缀。
              </p>
              <FieldError message={state.fieldErrors?.tags?.[0]} />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              技术栈
              <input
                aria-label="技术栈"
                name="stack"
                ref={stackRef}
                value={stackInputValue}
                onChange={(event) => setStackInputValue(event.target.value)}
                className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-amber-700/40"
              />
              <p className="text-xs leading-6 text-slate-500">
                常见技术栈会自动 canonicalize，便于后续筛选和相关推荐稳定命中。
              </p>
              <FieldError message={state.fieldErrors?.stack?.[0]} />
            </label>
          </div>
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
          这里既可以做轻量修正，也可以把 Inbox 碎片补成结构化的可复用知识卡片。若要标记为
          Digested，至少补齐摘要、问题、方案，并填写标签或技术栈其中之一。
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
