"use server";

import { redirect } from "next/navigation";

import { noteService } from "@/features/notes/note.service";

import {
  runUpdateNoteAction,
  type UpdateNoteFormState,
} from "./update-note.shared";

export async function updateNoteAction(
  previousState: UpdateNoteFormState,
  formData: FormData,
) {
  return runUpdateNoteAction(previousState, formData, {
    updateNote: (noteId, input) => noteService.updateNote(noteId, input),
    redirect,
  });
}
