import { afterEach, describe, expect, it, vi } from "vitest";

import type { AIConfig } from "@/features/ai/ai.config";
import { createDashScopeProvider } from "@/features/ai/providers/dashscope";
import { buildExtractFieldsPrompt } from "@/features/ai/prompts/extract-fields";

const enabledConfig: AIConfig = {
  provider: "dashscope",
  apiKey: "test-key",
  requested: true,
  enabled: true,
  baseUrl: "https://dashscope.aliyuncs.com/apps/anthropic",
  model: "qwen3.6-plus",
  extractMaxTokens: 640,
  suggestMaxTokens: 300,
  compressMaxTokens: 480,
  compressBatchSize: 6,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ai extract fields", () => {
  it("builds a prompt with raw input and existing note context", () => {
    const prompt = buildExtractFieldsPrompt({
      rawInput: "pnpm overrides fixed the workspace drift.",
      existingNote: {
        title: "pnpm overrides fix",
        tags: ["pnpm", "monorepo"],
        stack: "Tooling",
      },
    });

    expect(prompt.systemPrompt).toContain("JSON");
    expect(prompt.systemPrompt).toContain("summary");
    expect(prompt.userPrompt).toContain("pnpm overrides fixed the workspace drift.");
    expect(prompt.userPrompt).toContain("pnpm overrides fix");
    expect(prompt.userPrompt).toContain("monorepo");
  });

  it("extracts structured candidates from DashScope Anthropic-compatible output", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            type: "text",
            text: [
              "```json",
              JSON.stringify({
                summary: {
                  value: "Use pnpm overrides to keep workspace installs aligned.",
                  confidence: "high",
                },
                problem: {
                  value: "Peer dependency ranges drifted between packages.",
                  confidence: "medium",
                },
                solution: {
                  value: "Pin shared versions with overrides in the workspace root.",
                  confidence: "high",
                },
                why: {
                  value: "That keeps the lockfile and install output deterministic.",
                  confidence: "medium",
                },
              }),
              "```",
            ].join("\n"),
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = createDashScopeProvider(enabledConfig);
    const result = await provider.extractStructuredFields({
      rawInput: "pnpm overrides fixed the workspace drift.",
      existingNote: {
        title: "pnpm overrides fix",
        tags: ["pnpm"],
        stack: "Tooling",
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://dashscope.aliyuncs.com/apps/anthropic/v1/messages",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      headers: expect.objectContaining({
        "x-api-key": "test-key",
        "anthropic-version": "2023-06-01",
      }),
      body: expect.stringContaining("\"max_tokens\":640"),
    });
    expect(result).toEqual({
      summary: {
        value: "Use pnpm overrides to keep workspace installs aligned.",
        confidence: "high",
      },
      problem: {
        value: "Peer dependency ranges drifted between packages.",
        confidence: "medium",
      },
      solution: {
        value: "Pin shared versions with overrides in the workspace root.",
        confidence: "high",
      },
      why: {
        value: "That keeps the lockfile and install output deterministic.",
        confidence: "medium",
      },
    });
  });

  it("returns empty candidates for blank raw input without calling Anthropic", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const provider = createDashScopeProvider(enabledConfig);
    const result = await provider.extractStructuredFields({
      rawInput: "   ",
    });

    expect(result).toEqual({
      summary: null,
      problem: null,
      solution: null,
      why: null,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });


  it("degrades malformed DashScope payloads to empty candidates", async () => {
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
    const result = await provider.extractStructuredFields({
      rawInput: "pnpm overrides fixed the workspace drift.",
    });

    expect(result).toEqual({
      summary: null,
      problem: null,
      solution: null,
      why: null,
    });
  });

  it("throws a readable error when DashScope returns an error payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            message: "invalid x-api-key",
          },
        }),
      }),
    );

    const provider = createDashScopeProvider(enabledConfig);

    await expect(
      provider.extractStructuredFields({
        rawInput: "pnpm overrides fixed the workspace drift.",
      }),
    ).rejects.toThrow(/invalid x-api-key/i);
  });
});
