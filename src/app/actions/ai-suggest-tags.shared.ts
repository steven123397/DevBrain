import type { AIProvider, TagSuggestions } from "@/features/ai/ai.types";

export interface AISuggestTagsFormValues {
  rawInput: string;
  tags: string;
  stack: string;
}

export interface AISuggestTagsActionState {
  status: "idle" | "success" | "disabled" | "error";
  message?: string;
  values: AISuggestTagsFormValues;
  suggestions: TagSuggestions | null;
}

export interface AISuggestTagsActionDependencies {
  getAIClient: () => AIProvider | null;
}

export const initialAISuggestTagsActionState: AISuggestTagsActionState = {
  status: "idle",
  values: {
    rawInput: "",
    tags: "",
    stack: "",
  },
  suggestions: null,
};

function readTextField(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value.trim() : "";
}

function parseTags(value: string) {
  return value
    .split(/[\n,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildValues(formData: FormData): AISuggestTagsFormValues {
  return {
    rawInput: readTextField(formData, "rawInput"),
    tags: readTextField(formData, "tags"),
    stack: readTextField(formData, "stack"),
  };
}

export async function runAISuggestTagsAction(
  _previousState: AISuggestTagsActionState,
  formData: FormData,
  dependencies: AISuggestTagsActionDependencies,
): Promise<AISuggestTagsActionState> {
  const values = buildValues(formData);

  if (!values.rawInput) {
    return {
      status: "error",
      message: "请先提供原始输入后再请求 AI 建议。",
      values,
      suggestions: null,
    };
  }

  const client = dependencies.getAIClient();
  if (!client) {
    return {
      status: "disabled",
      message: "AI 辅助当前不可用，请先配置 API key。",
      values,
      suggestions: null,
    };
  }

  try {
    const suggestions = await client.suggestTags({
      rawInput: values.rawInput,
      existingTags: parseTags(values.tags),
      existingStack: values.stack || undefined,
    });

    return {
      status: "success",
      values,
      suggestions,
    };
  } catch {
    return {
      status: "error",
      message: "AI 标签建议失败，请稍后重试。",
      values,
      suggestions: null,
    };
  }
}

