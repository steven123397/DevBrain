import { describe, expect, it, vi } from "vitest";

import {
  initialAICompressActionState,
  runAICompressAction,
} from "@/app/actions/ai-compress.shared";
import type { AIProvider } from "@/features/ai/ai.types";
import type { KnowledgeNote } from "@/features/notes/note.types";

function createFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

function createProvider(): AIProvider {
  return {
    name: "dashscope",
    extractStructuredFields: vi.fn(),
    suggestTags: vi.fn(),
    compressSummaries: vi.fn().mockResolvedValue({
      "note-1": "Hydration errors usually come from browser-only branches in the first render.",
      "note-2": "Workspace drift is usually fixed by pinning shared versions with overrides.",
    }),
  };
}

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

describe("ai compress action", () => {
  it("loads notes by id and returns compressed summaries in batch", async () => {
    const provider = createProvider();
    const noteOne = createNote();
    const noteTwo = createNote({
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
    });
    const listNotesByIds = vi.fn().mockResolvedValue([noteOne, noteTwo]);

    const result = await runAICompressAction(
      initialAICompressActionState,
      createFormData({
        noteIds: "note-1, note-2, note-1",
      }),
      {
        getAIClient: () => provider,
        listNotesByIds,
        compressBatchSize: 6,
      },
    );

    expect(listNotesByIds).toHaveBeenCalledWith(["note-1", "note-2"]);
    expect(provider.compressSummaries).toHaveBeenCalledWith({
      notes: [noteOne, noteTwo],
    });
    expect(result).toEqual({
      status: "success",
      noteIds: ["note-1", "note-2"],
      summaries: {
        "note-1": "Hydration errors usually come from browser-only branches in the first render.",
        "note-2": "Workspace drift is usually fixed by pinning shared versions with overrides.",
      },
    });
  });

  it("returns a disabled state when AI is unavailable", async () => {
    const result = await runAICompressAction(
      initialAICompressActionState,
      createFormData({
        noteIds: "note-1,note-2",
      }),
      {
        getAIClient: () => null,
        listNotesByIds: vi.fn(),
        compressBatchSize: 6,
      },
    );

    expect(result).toEqual({
      status: "disabled",
      message: "AI 压缩提示当前不可用，请先配置 API key。",
      noteIds: ["note-1", "note-2"],
      summaries: {},
    });
  });

  it("limits the batch size with the configured compression window", async () => {
    const provider = createProvider();
    const listNotesByIds = vi.fn().mockResolvedValue([createNote(), createNote({ id: "note-2" })]);

    const result = await runAICompressAction(
      initialAICompressActionState,
      createFormData({
        noteIds: "note-1,note-2,note-3",
      }),
      {
        getAIClient: () => provider,
        listNotesByIds,
        compressBatchSize: 2,
      },
    );

    expect(listNotesByIds).toHaveBeenCalledWith(["note-1", "note-2"]);
    expect(result.noteIds).toEqual(["note-1", "note-2"]);
  });
});
