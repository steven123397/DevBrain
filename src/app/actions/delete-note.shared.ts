export interface DeleteNoteActionDependencies {
  deleteNote: (noteId: string) => Promise<boolean>;
  redirect: (location: string) => never;
}

function readTextField(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value : "";
}

export async function runDeleteNoteAction(
  formData: FormData,
  dependencies: DeleteNoteActionDependencies,
) {
  const noteId = readTextField(formData, "noteId").trim();

  if (!noteId) {
    dependencies.redirect("/notes");
  }

  const deleted = await dependencies.deleteNote(noteId);
  dependencies.redirect(deleted ? "/notes?deleted=1" : "/notes");
}
