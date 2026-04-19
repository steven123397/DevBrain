"use server";

import { noteService } from "@/features/notes/note.service";
import { readRuntimeAIConfig } from "@/features/ai/ai.config";
import { getAIClient } from "@/features/ai/ai.client";

import {
  runAICompressAction,
  type AICompressActionState,
} from "./ai-compress.shared";

export async function aiCompressAction(
  previousState: AICompressActionState,
  formData: FormData,
) {
  const aiConfig = readRuntimeAIConfig();

  return runAICompressAction(previousState, formData, {
    getAIClient,
    listNotesByIds: (noteIds) => noteService.listNotesByIds(noteIds),
    compressBatchSize: aiConfig.compressBatchSize,
  });
}
