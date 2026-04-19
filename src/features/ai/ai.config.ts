import { isTestAIDisabled } from "./ai.test-control";
import { aiProviderValues, type AIProviderName } from "./ai.types";

export interface AIConfig {
  provider: AIProviderName;
  apiKey: string | null;
  requested: boolean;
  enabled: boolean;
  baseUrl: string;
  model: string;
  extractMaxTokens: number;
  suggestMaxTokens: number;
  compressMaxTokens: number;
  compressBatchSize: number;
}

const disabledValues = new Set(["0", "false", "no", "off"]);
const defaultDashScopeBaseUrl = "https://dashscope.aliyuncs.com/apps/anthropic";
const defaultDashScopeModel = "qwen3.6-plus";
const defaultExtractMaxTokens = 700;
const defaultSuggestMaxTokens = 300;
const defaultCompressMaxTokens = 480;
const defaultCompressBatchSize = 6;

function normalizeProvider(value: string | undefined): AIProviderName {
  const normalized = value?.trim().toLowerCase();

  if (normalized && aiProviderValues.includes(normalized as AIProviderName)) {
    return normalized as AIProviderName;
  }

  return "dashscope";
}

function normalizeRequested(value: string | undefined) {
  if (!value) {
    return true;
  }

  return !disabledValues.has(value.trim().toLowerCase());
}

function normalizeApiKey(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeBaseUrl(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized.replace(/\/+$/, "") : defaultDashScopeBaseUrl;
}

function normalizeModel(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : defaultDashScopeModel;
}

function normalizePositiveInteger(
  value: string | undefined,
  fallback: number,
  options: {
    min: number;
    max: number;
  },
) {
  const normalized = value?.trim();
  if (!normalized) {
    return fallback;
  }

  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(options.max, Math.max(options.min, parsed));
}

export function readAIConfig(env: NodeJS.ProcessEnv = process.env): AIConfig {
  const provider = normalizeProvider(env.DEVBRAIN_AI_PROVIDER);
  const apiKey = normalizeApiKey(env.DEVBRAIN_AI_API_KEY);
  const requested = normalizeRequested(env.DEVBRAIN_AI_ENABLED);
  const baseUrl = normalizeBaseUrl(env.DEVBRAIN_AI_BASE_URL);
  const model = normalizeModel(env.DEVBRAIN_AI_MODEL);
  const extractMaxTokens = normalizePositiveInteger(
    env.DEVBRAIN_AI_EXTRACT_MAX_TOKENS,
    defaultExtractMaxTokens,
    { min: 200, max: 2000 },
  );
  const suggestMaxTokens = normalizePositiveInteger(
    env.DEVBRAIN_AI_SUGGEST_MAX_TOKENS,
    defaultSuggestMaxTokens,
    { min: 120, max: 1000 },
  );
  const compressMaxTokens = normalizePositiveInteger(
    env.DEVBRAIN_AI_COMPRESS_MAX_TOKENS,
    defaultCompressMaxTokens,
    { min: 160, max: 1600 },
  );
  const compressBatchSize = normalizePositiveInteger(
    env.DEVBRAIN_AI_COMPRESS_BATCH_SIZE,
    defaultCompressBatchSize,
    { min: 1, max: 12 },
  );

  return {
    provider,
    apiKey,
    requested,
    enabled: requested && Boolean(apiKey),
    baseUrl,
    model,
    extractMaxTokens,
    suggestMaxTokens,
    compressMaxTokens,
    compressBatchSize,
  };
}

export function readRuntimeAIConfig(env: NodeJS.ProcessEnv = process.env): AIConfig {
  const config = readAIConfig(env);

  return {
    ...config,
    enabled: config.enabled && !isTestAIDisabled(),
  };
}
