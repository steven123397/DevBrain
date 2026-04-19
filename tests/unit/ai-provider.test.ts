import { describe, expect, it, vi } from "vitest";

import { createAIProvider } from "@/features/ai/ai.provider";
import type { AIProvider, FieldCandidates, TagSuggestions } from "@/features/ai/ai.types";

function createFieldCandidates(): FieldCandidates {
  return {
    summary: { value: "Keep a short summary.", confidence: "high" },
    problem: { value: "The installs drifted.", confidence: "medium" },
    solution: { value: "Pin shared versions.", confidence: "high" },
    why: { value: "That keeps the workspace deterministic.", confidence: "medium" },
  };
}

function createTagSuggestions(): TagSuggestions {
  return {
    suggestedTags: ["pnpm", "monorepo"],
    suggestedStack: "Tooling",
  };
}

function createMockProvider(): AIProvider {
  return {
    name: "dashscope",
    extractStructuredFields: vi.fn().mockResolvedValue(createFieldCandidates()),
    suggestTags: vi.fn().mockResolvedValue(createTagSuggestions()),
    compressSummaries: vi.fn().mockResolvedValue({
      "note-1": "Pinned workspace versions with overrides.",
    }),
  };
}

describe("ai provider factory", () => {
  it("creates a configured provider from the registry", () => {
    const provider = createMockProvider();
    const registry = {
      dashscope: vi.fn(() => provider),
    };

    const created = createAIProvider(
      {
        provider: "dashscope",
        apiKey: "test-key",
        requested: true,
        enabled: true,
        baseUrl: "https://dashscope.aliyuncs.com/apps/anthropic",
        model: "qwen3.6-plus",
        extractMaxTokens: 700,
        suggestMaxTokens: 300,
        compressMaxTokens: 480,
        compressBatchSize: 6,
      },
      registry,
    );

    expect(created).toBe(provider);
    expect(registry.dashscope).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "dashscope",
        apiKey: "test-key",
        enabled: true,
        baseUrl: "https://dashscope.aliyuncs.com/apps/anthropic",
        model: "qwen3.6-plus",
        extractMaxTokens: 700,
        suggestMaxTokens: 300,
        compressMaxTokens: 480,
        compressBatchSize: 6,
      }),
    );
  });

  it("returns null when the resolved config is disabled", () => {
    const registry = {
      dashscope: vi.fn(() => createMockProvider()),
    };

    const created = createAIProvider(
      {
        provider: "dashscope",
        apiKey: null,
        requested: true,
        enabled: false,
        baseUrl: "https://dashscope.aliyuncs.com/apps/anthropic",
        model: "qwen3.6-plus",
        extractMaxTokens: 700,
        suggestMaxTokens: 300,
        compressMaxTokens: 480,
        compressBatchSize: 6,
      },
      registry,
    );

    expect(created).toBeNull();
    expect(registry.dashscope).not.toHaveBeenCalled();
  });
});
