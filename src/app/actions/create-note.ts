"use server";

import { redirect } from "next/navigation";

import { noteService } from "@/features/notes/note.service";

import {
  runCreateNoteAction,
  type CreateNoteFormState,
} from "./create-note.shared";

export async function createNoteAction(
  previousState: CreateNoteFormState,
  formData: FormData,
) {
  return runCreateNoteAction(previousState, formData, {
    createNote: (input) => noteService.createNote(input),
    redirect,
  });
}
