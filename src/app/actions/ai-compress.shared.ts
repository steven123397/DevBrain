import type { AIProvider, CompressedSummaryMap } from "@/features/ai/ai.types";
import type { KnowledgeNote } from "@/features/notes/note.types";

export const defaultAICompressBatchSize = 6;

export interface AICompressActionState {
  status: "idle" | "success" | "disabled" | "error";
  message?: string;
  noteIds: string[];
  summaries: CompressedSummaryMap;
}

export interface AICompressActionDependencies {
  getAIClient: () => AIProvider | null;
  listNotesByIds: (noteIds: string[]) => Promise<KnowledgeNote[]>;
  compressBatchSize?: number;
}

export const initialAICompressActionState: AICompressActionState = {
  status: "idle",
  noteIds: [],
  summaries: {},
};

function readTextField(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value.trim() : "";
}

function parseNoteIds(value: string, maxBatchSize: number) {
  return Array.from(
    new Set(
      value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, maxBatchSize);
}

export async function runAICompressAction(
  _previousState: AICompressActionState,
  formData: FormData,
  dependencies: AICompressActionDependencies,
): Promise<AICompressActionState> {
  const noteIds = parseNoteIds(
    readTextField(formData, "noteIds"),
    dependencies.compressBatchSize ?? defaultAICompressBatchSize,
  );

  if (noteIds.length === 0) {
    return {
      status: "success",
      noteIds: [],
      summaries: {},
    };
  }

  const client = dependencies.getAIClient();
  if (!client) {
    return {
      status: "disabled",
      message: "AI 压缩提示当前不可用，请先配置 API key。",
      noteIds,
      summaries: {},
    };
  }

  try {
    const notes = await dependencies.listNotesByIds(noteIds);
    if (notes.length === 0) {
      return {
        status: "success",
        noteIds,
        summaries: {},
      };
    }

    const summaries = await client.compressSummaries({ notes });

    return {
      status: "success",
      noteIds,
      summaries,
    };
  } catch {
    return {
      status: "error",
      message: "AI 压缩提示失败，请稍后重试。",
      noteIds,
      summaries: {},
    };
  }
}
