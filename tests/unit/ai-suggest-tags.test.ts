import { afterEach, describe, expect, it, vi } from "vitest";

import type { AIConfig } from "@/features/ai/ai.config";
import { createDashScopeProvider } from "@/features/ai/providers/dashscope";
import { buildSuggestTagsPrompt } from "@/features/ai/prompts/suggest-tags";

const enabledConfig: AIConfig = {
  provider: "dashscope",
  apiKey: "test-key",
  requested: true,
  enabled: true,
  baseUrl: "https://dashscope.aliyuncs.com/apps/anthropic",
  model: "qwen3.6-plus",
  extractMaxTokens: 700,
  suggestMaxTokens: 280,
  compressMaxTokens: 480,
  compressBatchSize: 6,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ai suggest tags", () => {
  it("builds a prompt with current raw input, tags, and stack", () => {
    const prompt = buildSuggestTagsPrompt({
      rawInput: "Next.js hydration mismatch after moving a client component.",
      existingTags: ["nextjs"],
      existingStack: "React",
    });

    expect(prompt.systemPrompt).toContain("suggestedTags");
    expect(prompt.userPrompt).toContain("hydration mismatch");
    expect(prompt.userPrompt).toContain("nextjs");
    expect(prompt.userPrompt).toContain("React");
  });

  it("normalizes DashScope tag and stack suggestions", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              suggestedTags: ["Next.js", "react.js", "nextjs"],
              suggestedStack: "next js",
            }),
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = createDashScopeProvider(enabledConfig);
    const result = await provider.suggestTags({
      rawInput: "Next.js hydration mismatch after moving a client component.",
      existingTags: ["nextjs"],
      existingStack: "React",
    });

    expect(result).toEqual({
      suggestedTags: ["nextjs", "react"],
      suggestedStack: "Next.js",
    });
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      body: expect.stringContaining("\"max_tokens\":280"),
    });
  });


  it("degrades malformed DashScope payloads to empty suggestions", async () => {
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
    const result = await provider.suggestTags({
      rawInput: "Next.js hydration mismatch after moving a client component.",
      existingTags: ["nextjs"],
      existingStack: "React",
    });

    expect(result).toEqual({
      suggestedTags: [],
      suggestedStack: null,
    });
  });

  it("returns empty suggestions for blank raw input without calling Anthropic", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const provider = createDashScopeProvider(enabledConfig);
    const result = await provider.suggestTags({
      rawInput: "   ",
      existingTags: [],
    });

    expect(result).toEqual({
      suggestedTags: [],
      suggestedStack: null,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
