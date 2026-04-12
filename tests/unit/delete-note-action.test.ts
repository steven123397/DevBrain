import { describe, expect, it, vi } from "vitest";

import { runDeleteNoteAction } from "@/app/actions/delete-note.shared";

class RedirectSignal extends Error {
  constructor(readonly location: string) {
    super(`Redirected to ${location}`);
  }
}

function createFormData(noteId: string) {
  const formData = new FormData();
  formData.set("noteId", noteId);
  return formData;
}

describe("delete note action", () => {
  it("deletes a note then redirects back to the list", async () => {
    const deleteNote = vi.fn().mockResolvedValue(true);
    const redirect = vi.fn((location: string) => {
      throw new RedirectSignal(location);
    });

    await expect(
      runDeleteNoteAction(createFormData("note-2"), {
        deleteNote,
        redirect,
      }),
    ).rejects.toMatchObject({
      location: "/notes?deleted=1",
    });

    expect(deleteNote).toHaveBeenCalledWith("note-2");
  });

  it("falls back to the note list when the note is already missing", async () => {
    const deleteNote = vi.fn().mockResolvedValue(false);
    const redirect = vi.fn((location: string) => {
      throw new RedirectSignal(location);
    });

    await expect(
      runDeleteNoteAction(createFormData("missing-note"), {
        deleteNote,
        redirect,
      }),
    ).rejects.toMatchObject({
      location: "/notes",
    });
  });
});
