import { describe, expect, it, vi } from "vitest";

import {
  initialAIExtractActionState,
  runAIExtractAction,
} from "@/app/actions/ai-extract.shared";
import {
  initialAISuggestTagsActionState,
  runAISuggestTagsAction,
} from "@/app/actions/ai-suggest-tags.shared";
import type { AIProvider, FieldCandidates } from "@/features/ai/ai.types";
import type { KnowledgeNote } from "@/features/notes/note.types";

function createFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

function createCandidates(): FieldCandidates {
  return {
    summary: { value: "Keep a short summary.", confidence: "high" },
    problem: { value: "Peer dependency ranges drifted.", confidence: "medium" },
    solution: { value: "Pin versions with overrides.", confidence: "high" },
    why: { value: "That stabilizes installs across packages.", confidence: "medium" },
  };
}

function createProvider(): AIProvider {
  return {
    name: "dashscope",
    extractStructuredFields: vi.fn().mockResolvedValue(createCandidates()),
    suggestTags: vi.fn().mockResolvedValue({
      suggestedTags: ["pnpm", "monorepo"],
      suggestedStack: "Tooling",
    }),
    compressSummaries: vi.fn(),
  };
}

function createNote(overrides: Partial<KnowledgeNote> = {}): KnowledgeNote {
  return {
    id: "note-1",
    title: "pnpm overrides fix",
    rawInput: "Pinned versions with overrides to stop workspace drift.",
    summary: null,
    problem: null,
    solution: null,
    why: null,
    commands: null,
    references: null,
    tags: ["pnpm"],
    stack: "Tooling",
    status: "inbox",
    confidence: "draft",
    sourceType: "manual",
    sourceUrl: null,
    createdAt: "2026-04-19T10:00:00.000Z",
    updatedAt: "2026-04-19T10:00:00.000Z",
    ...overrides,
  };
}

describe("ai candidate actions", () => {
  it("extracts structured candidates from raw input", async () => {
    const provider = createProvider();
    const getNoteById = vi.fn();

    const result = await runAIExtractAction(
      initialAIExtractActionState,
      createFormData({
        rawInput: "Peer dependency ranges drifted between packages.",
      }),
      {
        getAIClient: () => provider,
        getNoteById,
      },
    );

    expect(result).toMatchObject({
      status: "success",
      candidates: createCandidates(),
      values: {
        noteId: "",
        rawInput: "Peer dependency ranges drifted between packages.",
      },
    });
    expect(provider.extractStructuredFields).toHaveBeenCalledWith({
      rawInput: "Peer dependency ranges drifted between packages.",
      existingNote: undefined,
    });
    expect(getNoteById).not.toHaveBeenCalled();
  });

  it("hydrates raw input from an existing note when only note id is submitted", async () => {
    const provider = createProvider();
    const note = createNote();
    const getNoteById = vi.fn().mockResolvedValue(note);

    const result = await runAIExtractAction(
      initialAIExtractActionState,
      createFormData({
        noteId: note.id,
      }),
      {
        getAIClient: () => provider,
        getNoteById,
      },
    );

    expect(result.status).toBe("success");
    expect(provider.extractStructuredFields).toHaveBeenCalledWith(
      expect.objectContaining({
        rawInput: note.rawInput,
        existingNote: expect.objectContaining({
          id: note.id,
          title: note.title,
          tags: note.tags,
        }),
      }),
    );
  });

  it("prefers the current form title, tags, and stack when building extract context", async () => {
    const provider = createProvider();
    const note = createNote({
      title: "old title",
      tags: ["legacy"],
      stack: "Tooling",
    });
    const getNoteById = vi.fn().mockResolvedValue(note);

    const result = await runAIExtractAction(
      initialAIExtractActionState,
      createFormData({
        noteId: note.id,
        rawInput: "new raw input",
        title: "new title",
        tags: "react, nextjs",
        stack: "Next.js",
      }),
      {
        getAIClient: () => provider,
        getNoteById,
      },
    );

    expect(result.status).toBe("success");
    expect(provider.extractStructuredFields).toHaveBeenCalledWith(
      expect.objectContaining({
        rawInput: "new raw input",
        existingNote: expect.objectContaining({
          title: "new title",
          tags: ["react", "nextjs"],
          stack: "Next.js",
        }),
      }),
    );
  });

  it("returns a disabled state when ai is unavailable", async () => {
    const result = await runAIExtractAction(
      initialAIExtractActionState,
      createFormData({
        rawInput: "Keep the repro steps.",
      }),
      {
        getAIClient: () => null,
        getNoteById: vi.fn(),
      },
    );

    expect(result).toMatchObject({
      status: "disabled",
      message: expect.stringMatching(/API key/i),
      candidates: null,
    });
  });

  it("returns tag suggestions from raw input and existing fields", async () => {
    const provider = createProvider();

    const result = await runAISuggestTagsAction(
      initialAISuggestTagsActionState,
      createFormData({
        rawInput: "Used pnpm overrides to align workspace packages.",
        tags: "pnpm",
        stack: "Tooling",
      }),
      {
        getAIClient: () => provider,
      },
    );

    expect(result).toMatchObject({
      status: "success",
      suggestions: {
        suggestedTags: ["pnpm", "monorepo"],
        suggestedStack: "Tooling",
      },
    });
    expect(provider.suggestTags).toHaveBeenCalledWith({
      rawInput: "Used pnpm overrides to align workspace packages.",
      existingTags: ["pnpm"],
      existingStack: "Tooling",
    });
  });
});
