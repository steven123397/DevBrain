import {
  normalizeStackName,
  normalizeTagName,
} from "@/features/notes/note.normalization";

import type { AIConfig } from "../ai.config";
import { buildCompressSummariesPrompt } from "../prompts/compress-summaries";
import { buildExtractFieldsPrompt } from "../prompts/extract-fields";
import { buildSuggestTagsPrompt } from "../prompts/suggest-tags";
import {
  emptyFieldCandidates,
  fieldCandidateConfidenceValues,
  type AIProvider,
  type CompressSummariesInput,
  type CompressedSummaryMap,
  type ExtractStructuredFieldsInput,
  type FieldCandidate,
  type FieldCandidateConfidence,
  type FieldCandidates,
  type SuggestTagsInput,
  type TagSuggestions,
} from "../ai.types";

const ANTHROPIC_COMPAT_API_VERSION = "2023-06-01";

interface DashScopeTextBlock {
  type?: string;
  text?: string;
}

interface DashScopeResponsePayload {
  content?: DashScopeTextBlock[];
  error?: {
    message?: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stripMarkdownCodeFence(value: string) {
  if (!value.startsWith("```")) {
    return value;
  }

  const lines = value.split("\n");
  if (lines.length >= 2 && lines.at(-1)?.startsWith("```")) {
    return lines.slice(1, -1).join("\n").trim();
  }

  return value;
}

function parseJsonObject(value: string) {
  const trimmed = value.trim();
  const variants = [trimmed, stripMarkdownCodeFence(trimmed)];
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    variants.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of variants) {
    try {
      const parsed = JSON.parse(candidate);
      if (isRecord(parsed)) {
        return parsed;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function normalizeConfidence(value: unknown): FieldCandidateConfidence {
  if (
    typeof value === "string" &&
    fieldCandidateConfidenceValues.includes(value as FieldCandidateConfidence)
  ) {
    return value as FieldCandidateConfidence;
  }

  return "medium";
}

function normalizeFieldCandidate(value: unknown): FieldCandidate | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? { value: trimmed, confidence: "medium" } : null;
  }

  if (!isRecord(value) || typeof value.value !== "string") {
    return null;
  }

  const trimmed = value.value.trim();
  if (!trimmed) {
    return null;
  }

  return {
    value: trimmed,
    confidence: normalizeConfidence(value.confidence),
  };
}

function normalizeFieldCandidates(payload: unknown): FieldCandidates {
  if (!isRecord(payload)) {
    return emptyFieldCandidates;
  }

  return {
    summary: normalizeFieldCandidate(payload.summary),
    problem: normalizeFieldCandidate(payload.problem),
    solution: normalizeFieldCandidate(payload.solution),
    why: normalizeFieldCandidate(payload.why),
  };
}

function normalizeTagSuggestions(payload: unknown): TagSuggestions {
  if (!isRecord(payload)) {
    return {
      suggestedTags: [],
      suggestedStack: null,
    };
  }

  const suggestedTags = Array.isArray(payload.suggestedTags)
    ? Array.from(
        new Set(
          payload.suggestedTags
            .filter((item): item is string => typeof item === "string")
            .map((item) => normalizeTagName(item))
            .filter(Boolean),
        ),
      )
    : [];

  const suggestedStack =
    typeof payload.suggestedStack === "string" && payload.suggestedStack.trim()
      ? normalizeStackName(payload.suggestedStack)
      : null;

  return {
    suggestedTags,
    suggestedStack,
  };
}

function normalizeCompressedSummaries(
  payload: unknown,
  requestedNoteIds: Set<string>,
): CompressedSummaryMap {
  if (!isRecord(payload) || !Array.isArray(payload.summaries)) {
    return {};
  }

  const summaries: CompressedSummaryMap = {};

  for (const item of payload.summaries) {
    if (!isRecord(item) || typeof item.noteId !== "string") {
      continue;
    }

    const noteId = item.noteId.trim();
    if (!noteId || !requestedNoteIds.has(noteId) || typeof item.summary !== "string") {
      continue;
    }

    const summary = item.summary.trim();
    if (!summary) {
      continue;
    }

    summaries[noteId] = summary;
  }

  return summaries;
}

async function readDashScopeError(response: Response) {
  try {
    const payload = (await response.json()) as DashScopeResponsePayload;
    if (typeof payload.error?.message === "string" && payload.error.message.trim()) {
      return payload.error.message.trim();
    }
  } catch {
    // Ignore malformed payloads and fall back to the status code.
  }

  return `DashScope request failed with status ${response.status}.`;
}

async function requestDashScopeJson(
  config: AIConfig,
  prompt: {
    systemPrompt: string;
    userPrompt: string;
  },
  options: {
    maxTokens: number;
  },
) {
  const response = await fetch(`${config.baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "anthropic-version": ANTHROPIC_COMPAT_API_VERSION,
      "x-api-key": config.apiKey ?? "",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: options.maxTokens,
      system: prompt.systemPrompt,
      messages: [
        {
          role: "user",
          content: prompt.userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(await readDashScopeError(response));
  }

  const payload = (await response.json()) as DashScopeResponsePayload;
  const text = (payload.content ?? [])
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n");

  if (!text) {
    return null;
  }

  return parseJsonObject(text);
}

export function createDashScopeProvider(config: AIConfig): AIProvider {
  return {
    name: "dashscope",
    async extractStructuredFields(
      input: ExtractStructuredFieldsInput,
    ): Promise<FieldCandidates> {
      if (!input.rawInput.trim()) {
        return emptyFieldCandidates;
      }

      const payload = await requestDashScopeJson(
        config,
        buildExtractFieldsPrompt(input),
        {
          maxTokens: config.extractMaxTokens,
        },
      );

      return normalizeFieldCandidates(payload);
    },
    async suggestTags(input: SuggestTagsInput): Promise<TagSuggestions> {
      if (!input.rawInput.trim()) {
        return {
          suggestedTags: [],
          suggestedStack: null,
        };
      }

      const payload = await requestDashScopeJson(
        config,
        buildSuggestTagsPrompt(input),
        {
          maxTokens: config.suggestMaxTokens,
        },
      );

      return normalizeTagSuggestions(payload);
    },
    async compressSummaries(input: CompressSummariesInput): Promise<CompressedSummaryMap> {
      if (input.notes.length === 0) {
        return {};
      }

      const payload = await requestDashScopeJson(
        config,
        buildCompressSummariesPrompt(input),
        {
          maxTokens: config.compressMaxTokens,
        },
      );

      return normalizeCompressedSummaries(
        payload,
        new Set(input.notes.map((note) => note.id)),
      );
    },
  };
}
