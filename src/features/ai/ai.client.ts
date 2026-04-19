import { readRuntimeAIConfig } from "./ai.config";
import { createAIProvider, type AIProviderRegistry } from "./ai.provider";
import type { AIProvider } from "./ai.types";

interface GetAIClientOptions {
  env?: NodeJS.ProcessEnv;
  registry?: AIProviderRegistry;
}

let cachedConfigKey: string | null = null;
let cachedClient: AIProvider | null = null;

function createCacheKey(config: ReturnType<typeof readRuntimeAIConfig>) {
  return JSON.stringify({
    provider: config.provider,
    apiKey: config.apiKey,
    requested: config.requested,
    enabled: config.enabled,
    baseUrl: config.baseUrl,
    model: config.model,
    extractMaxTokens: config.extractMaxTokens,
    suggestMaxTokens: config.suggestMaxTokens,
    compressMaxTokens: config.compressMaxTokens,
    compressBatchSize: config.compressBatchSize,
  });
}

export function getAIClient(options: GetAIClientOptions = {}) {
  const config = readRuntimeAIConfig(options.env);

  if (options.env) {
    return createAIProvider(config, options.registry);
  }

  const cacheKey = createCacheKey(config);
  if (cacheKey !== cachedConfigKey) {
    cachedClient = createAIProvider(config, options.registry);
    cachedConfigKey = cacheKey;
  }

  return cachedClient;
}

export function resetAIClientForTests() {
  cachedConfigKey = null;
  cachedClient = null;
}
