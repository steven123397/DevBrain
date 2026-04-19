import type { AIConfig } from "./ai.config";
import { createDashScopeProvider } from "./providers/dashscope";
import type { AIProvider, AIProviderName } from "./ai.types";

export type AIProviderFactory = (config: AIConfig) => AIProvider;
export type AIProviderRegistry = Record<AIProviderName, AIProviderFactory>;

const defaultRegistry: AIProviderRegistry = {
  dashscope: createDashScopeProvider,
};

export function createAIProvider(
  config: AIConfig,
  registry: AIProviderRegistry = defaultRegistry,
): AIProvider | null {
  if (!config.enabled || !config.apiKey) {
    return null;
  }

  const factory = registry[config.provider];
  if (!factory) {
    throw new Error(`Unsupported AI provider: ${config.provider}`);
  }

  return factory(config);
}
