// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  aiCompressAction: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => <a href={href} {...props}>{children}</a>,
}));

vi.mock("@/app/actions/ai-compress", () => ({
  aiCompressAction: mocks.aiCompressAction,
}));

import {
  NoteList,
  resetCompressedSummarySessionCacheForTests,
} from "@/components/note-list";
import type { KnowledgeNote } from "@/features/notes/note.types";

function createNote(overrides: Partial<KnowledgeNote> = {}): KnowledgeNote {
  return {
    id: "note-1",
    title: "hydration mismatch",
    rawInput: "SSR warning after reading window",
    summary: "Move browser-only logic into useEffect.",
    problem: "Server and client rendered different markup during hydration.",
    solution: "Delay browser-only reads until the client has mounted.",
    why: null,
    commands: null,
    references: null,
    tags: ["nextjs", "react"],
    stack: "Next.js",
    status: "digested",
    confidence: "tested",
    sourceType: "manual",
    sourceUrl: null,
    createdAt: "2026-04-19T10:00:00.000Z",
    updatedAt: "2026-04-19T10:00:00.000Z",
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  resetCompressedSummarySessionCacheForTests();
});

describe("note list ai compression", () => {
  it("does not request AI compressed summaries when the feature is disabled", () => {
    render(
      <NoteList
        notes={[createNote()]}
        emptyTitle="empty"
        emptyDescription="empty"
        aiEnabled={false}
        enableCompressedSummaries
      />,
    );

    expect(mocks.aiCompressAction).not.toHaveBeenCalled();
    expect(screen.queryByText("AI 快速提示")).not.toBeInTheDocument();
  });


  it("keeps the list usable when AI compression fails or returns nothing", async () => {
    mocks.aiCompressAction
      .mockResolvedValueOnce({
        status: "error",
        message: "AI 压缩提示失败，请稍后重试。",
        noteIds: ["note-1"],
        summaries: {},
      })
      .mockResolvedValueOnce({
        status: "success",
        noteIds: ["note-1"],
        summaries: {},
      });

    const { rerender } = render(
      <NoteList
        notes={[createNote()]}
        emptyTitle="empty"
        emptyDescription="empty"
        aiEnabled
        enableCompressedSummaries
      />,
    );

    expect(await screen.findByText("AI 压缩提示失败，请稍后重试。")).toBeInTheDocument();
    expect(screen.getByText("hydration mismatch")).toBeInTheDocument();

    rerender(
      <NoteList
        notes={[createNote({ updatedAt: "2026-04-19T10:01:00.000Z" })]}
        emptyTitle="empty"
        emptyDescription="empty"
        aiEnabled
        enableCompressedSummaries
      />,
    );

    await waitFor(() => {
      expect(mocks.aiCompressAction).toHaveBeenCalledTimes(2);
    });
    expect(screen.queryByText("AI 压缩提示失败，请稍后重试。")).not.toBeInTheDocument();
    expect(screen.queryByText("AI 快速提示")).not.toBeInTheDocument();
    expect(screen.getByText("Move browser-only logic into useEffect.")).toBeInTheDocument();
  });

  it("lazily requests compressed summaries and renders them under matching notes", async () => {
    mocks.aiCompressAction.mockResolvedValue({
      status: "success",
      noteIds: ["note-1", "note-2"],
      summaries: {
        "note-1": "Hydration errors usually come from browser-only branches in the first render.",
        "note-2": "Workspace drift is usually fixed by pinning shared versions with overrides.",
      },
    });

    render(
      <NoteList
        notes={[
          createNote(),
          createNote({
            id: "note-2",
            title: "pnpm peer dep fix",
            rawInput: "used overrides for workspace alignment",
            summary: null,
            problem: null,
            solution: null,
            tags: ["pnpm"],
            stack: "Tooling",
            status: "inbox",
            confidence: "draft",
          }),
        ]}
        emptyTitle="empty"
        emptyDescription="empty"
        aiEnabled
        enableCompressedSummaries
      />,
    );

    expect(screen.getByText("Move browser-only logic into useEffect.")).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.aiCompressAction).toHaveBeenCalledTimes(1);
    });

    const [, formData] = mocks.aiCompressAction.mock.calls[0] as [unknown, FormData];
    expect(formData.get("noteIds")).toBe("note-1,note-2");

    expect(await screen.findAllByText("AI 快速提示")).toHaveLength(2);
    expect(
      screen.getByText(
        "Hydration errors usually come from browser-only branches in the first render.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Workspace drift is usually fixed by pinning shared versions with overrides.",
      ),
    ).toBeInTheDocument();
  });

  it("only requests the configured compression window on first paint", async () => {
    mocks.aiCompressAction.mockResolvedValue({
      status: "success",
      noteIds: ["note-1"],
      summaries: {
        "note-1": "Hydration errors usually come from browser-only branches in the first render.",
      },
    });

    render(
      <NoteList
        notes={[
          createNote(),
          createNote({
            id: "note-2",
            title: "pnpm peer dep fix",
          }),
        ]}
        emptyTitle="empty"
        emptyDescription="empty"
        aiEnabled
        enableCompressedSummaries
        compressBatchSize={1}
      />,
    );

    await waitFor(() => {
      expect(mocks.aiCompressAction).toHaveBeenCalledTimes(1);
    });

    const [, formData] = mocks.aiCompressAction.mock.calls[0] as [unknown, FormData];
    expect(formData.get("noteIds")).toBe("note-1");
  });

  it("reuses session-cached summaries for unchanged notes and refetches after updates", async () => {
    mocks.aiCompressAction
      .mockResolvedValueOnce({
        status: "success",
        noteIds: ["note-3"],
        summaries: {
          "note-3": "Cached AI summary for the first visit.",
        },
      })
      .mockResolvedValueOnce({
        status: "success",
        noteIds: ["note-3"],
        summaries: {
          "note-3": "Fresh AI summary after the note changed.",
        },
      });

    const originalNote = createNote({
      id: "note-3",
      title: "session cache candidate",
      summary: null,
      problem: null,
      solution: null,
      tags: ["pnpm"],
      stack: "Tooling",
      updatedAt: "2026-04-19T10:02:00.000Z",
    });
    const { unmount } = render(
      <NoteList
        notes={[originalNote]}
        emptyTitle="empty"
        emptyDescription="empty"
        aiEnabled
        enableCompressedSummaries
      />,
    );

    expect(await screen.findByText("Cached AI summary for the first visit.")).toBeInTheDocument();
    expect(mocks.aiCompressAction).toHaveBeenCalledTimes(1);

    unmount();

    render(
      <NoteList
        notes={[originalNote]}
        emptyTitle="empty"
        emptyDescription="empty"
        aiEnabled
        enableCompressedSummaries
      />,
    );

    expect(await screen.findByText("Cached AI summary for the first visit.")).toBeInTheDocument();
    expect(mocks.aiCompressAction).toHaveBeenCalledTimes(1);

    cleanup();

    render(
      <NoteList
        notes={[
          createNote({
            ...originalNote,
            updatedAt: "2026-04-19T10:03:00.000Z",
          }),
        ]}
        emptyTitle="empty"
        emptyDescription="empty"
        aiEnabled
        enableCompressedSummaries
      />,
    );

    expect(
      await screen.findByText("Fresh AI summary after the note changed."),
    ).toBeInTheDocument();
    expect(mocks.aiCompressAction).toHaveBeenCalledTimes(2);
  });
});
