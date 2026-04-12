"use server";

import { redirect } from "next/navigation";

import { noteService } from "@/features/notes/note.service";

import { runDeleteNoteAction } from "./delete-note.shared";

export async function deleteNoteAction(formData: FormData) {
  return runDeleteNoteAction(formData, {
    deleteNote: (noteId) => noteService.deleteNote(noteId),
    redirect,
  });
}
