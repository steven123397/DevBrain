"use server";

import { noteService } from "@/features/notes/note.service";
import { getAIClient } from "@/features/ai/ai.client";

import {
  runAIExtractAction,
  type AIExtractActionState,
} from "./ai-extract.shared";

export async function aiExtractAction(
  previousState: AIExtractActionState,
  formData: FormData,
) {
  return runAIExtractAction(previousState, formData, {
    getAIClient,
    getNoteById: (noteId) => noteService.getNoteById(noteId),
  });
}

