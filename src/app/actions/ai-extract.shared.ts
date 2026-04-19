import type { AIProvider, FieldCandidates } from "@/features/ai/ai.types";
import type { KnowledgeNote } from "@/features/notes/note.types";

export interface AIExtractFormValues {
  noteId: string;
  rawInput: string;
  title?: string;
  tags?: string;
  stack?: string;
}

export interface AIExtractActionState {
  status: "idle" | "success" | "disabled" | "error";
  message?: string;
  values: AIExtractFormValues;
  candidates: FieldCandidates | null;
}

export interface AIExtractActionDependencies {
  getAIClient: () => AIProvider | null;
  getNoteById: (noteId: string) => Promise<KnowledgeNote | null>;
}

export const initialAIExtractActionState: AIExtractActionState = {
  status: "idle",
  values: {
    noteId: "",
    rawInput: "",
  },
  candidates: null,
};

function readTextField(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalTextField(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value.trim() : undefined;
}

function parseTags(value: string) {
  return value
    .split(/[\n,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildValues(formData: FormData): AIExtractFormValues {
  return {
    noteId: readTextField(formData, "noteId"),
    rawInput: readTextField(formData, "rawInput"),
    title: readOptionalTextField(formData, "title"),
    tags: readOptionalTextField(formData, "tags"),
    stack: readOptionalTextField(formData, "stack"),
  };
}

function buildExistingNoteContext(
  values: AIExtractFormValues,
  note?: KnowledgeNote | null,
): Partial<KnowledgeNote> | undefined {
  const hasFormContext =
    values.title !== undefined || values.tags !== undefined || values.stack !== undefined;

  if (!note && !hasFormContext) {
    return undefined;
  }

  return {
    ...(note ?? {}),
    ...(values.title !== undefined ? { title: values.title } : {}),
    ...(values.tags !== undefined ? { tags: parseTags(values.tags) } : {}),
    ...(values.stack !== undefined ? { stack: values.stack || null } : {}),
  };
}

export async function runAIExtractAction(
  _previousState: AIExtractActionState,
  formData: FormData,
  dependencies: AIExtractActionDependencies,
): Promise<AIExtractActionState> {
  const values = buildValues(formData);
  let rawInput = values.rawInput;
  let existingNote: Partial<KnowledgeNote> | undefined;

  if (values.noteId) {
    const note = await dependencies.getNoteById(values.noteId);
    if (note) {
      existingNote = buildExistingNoteContext(values, note);
      rawInput = rawInput || note.rawInput;
    } else if (!rawInput) {
      return {
        status: "error",
        message: "找不到要提取的条目。",
        values,
        candidates: null,
      };
    }
  }

  if (!existingNote) {
    existingNote = buildExistingNoteContext(values);
  }

  if (!rawInput) {
    return {
      status: "error",
      message: "请先提供原始输入后再请求 AI 提取。",
      values,
      candidates: null,
    };
  }

  const client = dependencies.getAIClient();
  if (!client) {
    return {
      status: "disabled",
      message: "AI 辅助当前不可用，请先配置 API key。",
      values: {
        ...values,
        rawInput,
      },
      candidates: null,
    };
  }

  try {
    const candidates = await client.extractStructuredFields({
      rawInput,
      existingNote,
    });

    return {
      status: "success",
      values: {
        ...values,
        rawInput,
      },
      candidates,
    };
  } catch {
    return {
      status: "error",
      message: "AI 提取失败，请稍后重试。",
      values: {
        ...values,
        rawInput,
      },
      candidates: null,
    };
  }
}
