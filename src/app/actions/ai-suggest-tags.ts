"use server";

import { getAIClient } from "@/features/ai/ai.client";

import {
  runAISuggestTagsAction,
  type AISuggestTagsActionState,
} from "./ai-suggest-tags.shared";

export async function aiSuggestTagsAction(
  previousState: AISuggestTagsActionState,
  formData: FormData,
) {
  return runAISuggestTagsAction(previousState, formData, {
    getAIClient,
  });
}
