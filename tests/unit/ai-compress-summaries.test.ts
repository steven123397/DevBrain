import { afterEach, describe, expect, it, vi } from "vitest";

import type { AIConfig } from "@/features/ai/ai.config";
import { createDashScopeProvider } from "@/features/ai/providers/dashscope";
import { buildCompressSummariesPrompt } from "@/features/ai/prompts/compress-summaries";
import type { KnowledgeNote } from "@/features/notes/note.types";

const enabledConfig: AIConfig = {
  provider: "dashscope",
  apiKey: "test-key",
  requested: true,
  enabled: true,
  baseUrl: "https://dashscope.aliyuncs.com/apps/anthropic",
  model: "qwen3.6-plus",
  extractMaxTokens: 700,
  suggestMaxTokens: 300,
  compressMaxTokens: 360,
  compressBatchSize: 6,
};

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
  vi.unstubAllGlobals();
});

describe("ai compress summaries", () => {
  it("builds a slimmer prompt with note ids and only the highest-value note context", () => {
    const prompt = buildCompressSummariesPrompt({
      notes: [
        createNote(),
        createNote({
          id: "note-2",
          title: "validation db target safety",
          stack: "SQLite",
          tags: ["database", "sqlite"],
        }),
      ],
    });

    expect(prompt.systemPrompt).toContain("summaries");
    expect(prompt.userPrompt).toContain("note-1");
    expect(prompt.userPrompt).toContain("hydration mismatch");
    expect(prompt.userPrompt).toContain("validation db target safety");
    expect(prompt.userPrompt).toContain("database");
    expect(prompt.userPrompt).not.toContain("\"commands\"");
    expect(prompt.userPrompt).not.toContain("\"references\"");
    expect(prompt.userPrompt).not.toContain("\"rawInput\"");
  });

  it("keeps raw input as a fallback when a note lacks structured fields", () => {
    const prompt = buildCompressSummariesPrompt({
      notes: [
        createNote({
          summary: null,
          problem: null,
          solution: null,
          why: null,
          rawInput: "pnpm overrides fixed the workspace drift after peer dependency conflicts.",
        }),
      ],
    });

    expect(prompt.userPrompt).toContain("\"rawInput\"");
    expect(prompt.userPrompt).toContain("pnpm overrides fixed the workspace drift");
  });

  it("extracts compressed summaries from DashScope Anthropic-compatible output", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              summaries: [
                {
                  noteId: "note-1",
                  summary: "Hydration errors usually come from browser-only branches in the first render.",
                },
                {
                  noteId: "note-2",
                  summary: "Keep seed and migrate commands pinned to the validation db before touching real data.",
                },
              ],
            }),
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = createDashScopeProvider(enabledConfig);
    const result = await provider.compressSummaries({
      notes: [
        createNote(),
        createNote({
          id: "note-2",
          title: "validation db target safety",
          rawInput: "Avoid seed or migrate falling back to 默认主库.",
          summary: "Database review should always stay on validation db.",
          problem: "The demo db and 默认主库 are easy to confuse during review.",
          solution: "Set DEVBRAIN_DB_FILE before seed or migration commands.",
          why: "This keeps local database operations on the validation db until review is done.",
          commands: "DEVBRAIN_DB_FILE=data/validation.sqlite pnpm seed",
          references: "validation db / demo db / 默认主库",
          tags: ["database", "sqlite"],
          stack: "SQLite",
        }),
      ],
    });

    expect(result).toEqual({
      "note-1": "Hydration errors usually come from browser-only branches in the first render.",
      "note-2": "Keep seed and migrate commands pinned to the validation db before touching real data.",
    });
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      body: expect.stringContaining("\"max_tokens\":360"),
    });
  });


  it("degrades malformed DashScope payloads to an empty summary map", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [
            {
              type: "text",
              text: "not valid json",
            },
          ],
        }),
      }),
    );

    const provider = createDashScopeProvider(enabledConfig);
    const result = await provider.compressSummaries({
      notes: [createNote()],
    });

    expect(result).toEqual({});
  });

  it("returns an empty map for blank note batches without calling Anthropic", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const provider = createDashScopeProvider(enabledConfig);
    const result = await provider.compressSummaries({
      notes: [],
    });

    expect(result).toEqual({});
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
