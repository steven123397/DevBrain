// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AIExtractActionState } from "@/app/actions/ai-extract.shared";
import type { AISuggestTagsActionState } from "@/app/actions/ai-suggest-tags.shared";
import type { UpdateNoteFormValues } from "@/app/actions/update-note.shared";

const mocks = vi.hoisted(() => ({
  aiExtractAction: vi.fn(),
  aiSuggestTagsAction: vi.fn(),
  updateNoteAction: vi.fn(),
}));

vi.mock("@/app/actions/ai-extract", () => ({
  aiExtractAction: mocks.aiExtractAction,
}));

vi.mock("@/app/actions/ai-suggest-tags", () => ({
  aiSuggestTagsAction: mocks.aiSuggestTagsAction,
}));

vi.mock("@/app/actions/update-note", () => ({
  updateNoteAction: mocks.updateNoteAction,
}));

import { NoteEditorForm } from "@/components/note-editor-form";

function createValues(overrides: Partial<UpdateNoteFormValues> = {}): UpdateNoteFormValues {
  return {
    noteId: "note-2",
    title: "pnpm overrides 修复 workspace 版本漂移",
    rawInput: "pnpm monorepo 里出现 peer dependency drift。",
    summary: "",
    problem: "",
    solution: "",
    why: "",
    commands: "",
    references: "",
    tags: "pnpm, monorepo",
    stack: "Tooling",
    status: "inbox",
    confidence: "draft",
    sourceType: "manual",
    sourceUrl: "",
    ...overrides,
  };
}

function createExtractState(
  overrides: Partial<AIExtractActionState> = {},
): AIExtractActionState {
  return {
    status: "success",
    values: {
      noteId: "note-2",
      rawInput: "pnpm monorepo 里出现 peer dependency drift。",
    },
    candidates: {
      summary: { value: "Keep a short summary.", confidence: "high" },
      problem: { value: "Peer dependency ranges drifted.", confidence: "medium" },
      solution: { value: "Pin versions with overrides.", confidence: "high" },
      why: { value: "That stabilizes installs across packages.", confidence: "medium" },
    },
    ...overrides,
  };
}

function createSuggestState(
  overrides: Partial<AISuggestTagsActionState> = {},
): AISuggestTagsActionState {
  return {
    status: "success",
    values: {
      rawInput: "pnpm monorepo 里出现 peer dependency drift。",
      tags: "pnpm, monorepo",
      stack: "Tooling",
    },
    suggestions: {
      suggestedTags: ["pnpm", "peer-dependencies", "overrides"],
      suggestedStack: "React",
    },
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("note editor ai assist", () => {
  it("hides AI entries when AI is disabled", () => {
    render(<NoteEditorForm initialValues={createValues()} aiEnabled={false} />);

    expect(screen.queryByRole("button", { name: "AI 辅助提取" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "AI 建议" })).not.toBeInTheDocument();
    expect(screen.queryByText("AI 候选只会填回表单，不会自动保存。"))
      .not.toBeInTheDocument();
  });

  it("requests extraction and applies an accepted candidate back into the form", async () => {
    mocks.aiExtractAction.mockResolvedValue(createExtractState());

    render(<NoteEditorForm initialValues={createValues()} aiEnabled />);

    fireEvent.change(screen.getByLabelText("原始输入"), {
      target: {
        value: "pnpm monorepo 里出现 peer dependency drift，最后通过 overrides 固定版本解决。",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "AI 辅助提取" }));

    await screen.findByText("Keep a short summary.");

    expect(mocks.aiExtractAction).toHaveBeenCalledTimes(1);
    const [, formData] = mocks.aiExtractAction.mock.calls[0] as [AIExtractActionState, FormData];
    expect(formData.get("noteId")).toBe("note-2");
    expect(formData.get("rawInput")).toBe(
      "pnpm monorepo 里出现 peer dependency drift，最后通过 overrides 固定版本解决。",
    );

    fireEvent.click(screen.getByRole("button", { name: "采纳摘要候选" }));

    expect(screen.getByLabelText("摘要")).toHaveValue("Keep a short summary.");
  });

  it("shows a clear long-wait hint while extraction is still running", async () => {
    let resolveExtract: ((value: AIExtractActionState) => void) | null = null;
    mocks.aiExtractAction.mockImplementation(
      () =>
        new Promise<AIExtractActionState>((resolve) => {
          resolveExtract = resolve;
        }),
    );

    render(<NoteEditorForm initialValues={createValues()} aiEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "AI 辅助提取" }));

    expect(screen.getByRole("button", { name: "正在提取..." })).toBeDisabled();
    expect(
      screen.getByText("AI 正在整理这条原始输入，真实百炼调用通常需要 20~40 秒。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("你可以继续编辑下面的字段，候选返回后再决定是否采纳。"),
    ).toBeInTheDocument();

    resolveExtract?.(createExtractState());

    await screen.findByText("Keep a short summary.");
    expect(
      screen.queryByText("AI 正在整理这条原始输入，真实百炼调用通常需要 20~40 秒。"),
    ).not.toBeInTheDocument();
  });

  it("supports edit-and-focus plus ignore actions for extracted candidates", async () => {
    mocks.aiExtractAction.mockResolvedValue(createExtractState());

    render(<NoteEditorForm initialValues={createValues()} aiEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "AI 辅助提取" }));
    await screen.findByText("Peer dependency ranges drifted.");

    fireEvent.click(screen.getByRole("button", { name: "修改问题候选" }));

    const problemField = screen.getByLabelText("问题");
    expect(problemField).toHaveValue("Peer dependency ranges drifted.");
    await waitFor(() => {
      expect(problemField).toHaveFocus();
    });

    fireEvent.click(screen.getByRole("button", { name: "忽略为什么候选" }));

    await waitFor(() => {
      expect(screen.queryByText("That stabilizes installs across packages."))
        .not.toBeInTheDocument();
    });
  });


  it("shows friendly fallback messages for AI errors and empty candidates", async () => {
    mocks.aiExtractAction
      .mockResolvedValueOnce(
        createExtractState({
          status: "error",
          message: "AI 提取失败，请稍后重试。",
          candidates: null,
        }),
      )
      .mockResolvedValueOnce(
        createExtractState({
          candidates: {
            summary: null,
            problem: null,
            solution: null,
            why: null,
          },
        }),
      );
    mocks.aiSuggestTagsAction.mockResolvedValue(
      createSuggestState({
        suggestions: {
          suggestedTags: [],
          suggestedStack: null,
        },
      }),
    );

    render(<NoteEditorForm initialValues={createValues()} aiEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "AI 辅助提取" }));
    await screen.findByText("AI 提取失败，请稍后重试。");

    fireEvent.click(screen.getByRole("button", { name: "AI 辅助提取" }));
    await screen.findByText("这次没有提取到足够明确的结构化候选，可以补充更多上下文后再试一次。");

    fireEvent.click(screen.getByRole("button", { name: "AI 建议" }));
    await screen.findByText("这次没有生成足够明确的标签或技术栈建议，可以先补充原始输入再试一次。");
  });

  it("shows a clear long-wait hint while tag suggestions are still running", async () => {
    let resolveSuggest: ((value: AISuggestTagsActionState) => void) | null = null;
    mocks.aiSuggestTagsAction.mockImplementation(
      () =>
        new Promise<AISuggestTagsActionState>((resolve) => {
          resolveSuggest = resolve;
        }),
    );

    render(<NoteEditorForm initialValues={createValues()} aiEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "AI 建议" }));

    expect(screen.getByRole("button", { name: "正在建议..." })).toBeDisabled();
    expect(
      screen.getByText("AI 正在分析标签和技术栈，真实百炼调用通常需要 20~40 秒。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("你可以继续完善原始输入或手动编辑标签，候选返回后再决定是否采纳。"),
    ).toBeInTheDocument();

    resolveSuggest?.(createSuggestState());

    await screen.findByRole("button", { name: "添加标签建议 peer-dependencies" });
    expect(
      screen.queryByText("AI 正在分析标签和技术栈，真实百炼调用通常需要 20~40 秒。"),
    ).not.toBeInTheDocument();
  });

  it("requests tag suggestions and applies deduplicated tags plus suggested stack", async () => {
    mocks.aiSuggestTagsAction.mockResolvedValue(createSuggestState());

    render(<NoteEditorForm initialValues={createValues()} aiEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "AI 建议" }));

    await screen.findByRole("button", { name: "添加标签建议 peer-dependencies" });

    expect(mocks.aiSuggestTagsAction).toHaveBeenCalledTimes(1);
    const [, formData] = mocks.aiSuggestTagsAction.mock.calls[0] as [
      AISuggestTagsActionState,
      FormData,
    ];
    expect(formData.get("rawInput")).toBe("pnpm monorepo 里出现 peer dependency drift。");
    expect(formData.get("tags")).toBe("pnpm, monorepo");
    expect(formData.get("stack")).toBe("Tooling");

    fireEvent.click(screen.getByRole("button", { name: "添加标签建议 peer-dependencies" }));
    fireEvent.click(screen.getByRole("button", { name: "添加标签建议 overrides" }));
    fireEvent.click(screen.getByRole("button", { name: "应用技术栈建议 React" }));

    expect(screen.getByLabelText("标签")).toHaveValue(
      "pnpm, monorepo, peer-dependencies, overrides",
    );
    expect(screen.getByLabelText("技术栈")).toHaveValue("React");
  });
});
