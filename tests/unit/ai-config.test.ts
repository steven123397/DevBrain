import { afterEach, describe, expect, it, vi } from "vitest";

import { getAIClient, resetAIClientForTests } from "@/features/ai/ai.client";
import { readAIConfig } from "@/features/ai/ai.config";
import type { AIProvider } from "@/features/ai/ai.types";

function createMockProvider(): AIProvider {
  return {
    name: "dashscope",
    extractStructuredFields: vi.fn(),
    suggestTags: vi.fn(),
    compressSummaries: vi.fn(),
  };
}

afterEach(() => {
  resetAIClientForTests();
  delete process.env.DEVBRAIN_AI_API_KEY;
  delete process.env.DEVBRAIN_AI_BASE_URL;
  delete process.env.DEVBRAIN_AI_MODEL;
  delete process.env.DEVBRAIN_AI_PROVIDER;
  delete process.env.DEVBRAIN_AI_ENABLED;
  delete process.env.DEVBRAIN_AI_EXTRACT_MAX_TOKENS;
  delete process.env.DEVBRAIN_AI_SUGGEST_MAX_TOKENS;
  delete process.env.DEVBRAIN_AI_COMPRESS_MAX_TOKENS;
  delete process.env.DEVBRAIN_AI_COMPRESS_BATCH_SIZE;
});

describe("ai config", () => {
  it("defaults to DashScope when api key is present", () => {
    const config = readAIConfig({
      DEVBRAIN_AI_API_KEY: "  test-key  ",
    });

    expect(config).toEqual({
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
    });
  });

  it("auto-downgrades to disabled when the api key is missing", () => {
    const config = readAIConfig({
      DEVBRAIN_AI_ENABLED: "true",
    });

    expect(config).toEqual({
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
    });
  });

  it("allows overriding the DashScope base url, model, and tuning knobs", () => {
    const config = readAIConfig({
      DEVBRAIN_AI_API_KEY: "test-key",
      DEVBRAIN_AI_BASE_URL: "https://dashscope-intl.aliyuncs.com/apps/anthropic",
      DEVBRAIN_AI_MODEL: "qwen3-coder-next",
      DEVBRAIN_AI_EXTRACT_MAX_TOKENS: "640",
      DEVBRAIN_AI_SUGGEST_MAX_TOKENS: "280",
      DEVBRAIN_AI_COMPRESS_MAX_TOKENS: "360",
      DEVBRAIN_AI_COMPRESS_BATCH_SIZE: "4",
    });

    expect(config).toEqual({
      provider: "dashscope",
      apiKey: "test-key",
      requested: true,
      enabled: true,
      baseUrl: "https://dashscope-intl.aliyuncs.com/apps/anthropic",
      model: "qwen3-coder-next",
      extractMaxTokens: 640,
      suggestMaxTokens: 280,
      compressMaxTokens: 360,
      compressBatchSize: 4,
    });
  });

  it("returns null when ai is explicitly disabled", () => {
    const registry = {
      dashscope: vi.fn(() => createMockProvider()),
    };

    const client = getAIClient({
      env: {
        DEVBRAIN_AI_API_KEY: "test-key",
        DEVBRAIN_AI_ENABLED: "false",
      },
      registry,
    });

    expect(client).toBeNull();
    expect(registry.dashscope).not.toHaveBeenCalled();
  });

  it("reuses the singleton instance for the same runtime config", () => {
    process.env.DEVBRAIN_AI_API_KEY = "test-key";

    const registry = {
      dashscope: vi.fn(() => createMockProvider()),
    };

    const first = getAIClient({ registry });
    const second = getAIClient({ registry });

    expect(first).toBe(second);
    expect(registry.dashscope).toHaveBeenCalledTimes(1);
  });

  it("recreates the singleton when the runtime model changes", () => {
    process.env.DEVBRAIN_AI_API_KEY = "test-key";
    process.env.DEVBRAIN_AI_MODEL = "model-a";

    const registry = {
      dashscope: vi.fn((config) => ({
        ...createMockProvider(),
        model: config.model,
      })),
    };

    const first = getAIClient({ registry });

    process.env.DEVBRAIN_AI_MODEL = "model-b";
    const second = getAIClient({ registry });

    expect(first).not.toBe(second);
    expect(first).toMatchObject({ model: "model-a" });
    expect(second).toMatchObject({ model: "model-b" });
    expect(registry.dashscope).toHaveBeenCalledTimes(2);
  });
});
