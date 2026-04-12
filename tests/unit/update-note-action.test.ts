import { describe, expect, it, vi } from "vitest";

import {
  createInitialUpdateNoteFormState,
  runUpdateNoteAction,
  type UpdateNoteFormValues,
} from "@/app/actions/update-note.shared";

class RedirectSignal extends Error {
  constructor(readonly location: string) {
    super(`Redirected to ${location}`);
  }
}

function createValues(
  values: Partial<UpdateNoteFormValues> = {},
): UpdateNoteFormValues {
  return {
    noteId: "note-2",
    title: "pnpm peer dep fix",
    rawInput: "used overrides",
    summary: "",
    problem: "",
    solution: "",
    why: "",
    commands: "",
    references: "",
    tags: "pnpm",
    stack: "Tooling",
    status: "inbox",
    confidence: "draft",
    sourceType: "manual",
    sourceUrl: "",
    ...values,
  };
}

function createFormData(values: Partial<UpdateNoteFormValues> = {}) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(createValues(values))) {
    formData.set(key, value);
  }

  return formData;
}

describe("update note action", () => {
  it("submits digest fields, status, and confidence then redirects back to detail", async () => {
    const updateNote = vi.fn().mockResolvedValue({
      id: "note-2",
    });
    const redirect = vi.fn((location: string) => {
      throw new RedirectSignal(location);
    });

    await expect(
      runUpdateNoteAction(
        createInitialUpdateNoteFormState(createValues()),
        createFormData({
          summary: "Workspace overrides must stay aligned.",
          problem: "Peer dependency ranges drifted across packages.",
          solution: "Pin shared versions with pnpm overrides.",
          why: "This keeps install output deterministic for the whole repo.",
          status: "digested",
          confidence: "tested",
          tags: "pnpm, monorepo",
        }),
        {
          updateNote,
          redirect,
        },
      ),
    ).rejects.toMatchObject({
      location: "/notes/note-2",
    });

    expect(updateNote).toHaveBeenCalledWith(
      "note-2",
      expect.objectContaining({
        title: "pnpm peer dep fix",
        summary: "Workspace overrides must stay aligned.",
        problem: "Peer dependency ranges drifted across packages.",
        solution: "Pin shared versions with pnpm overrides.",
        why: "This keeps install output deterministic for the whole repo.",
        status: "digested",
        confidence: "tested",
        tags: ["pnpm", "monorepo"],
      }),
    );
  });

  it("returns validation errors when a provided title is blank", async () => {
    const updateNote = vi.fn();
    const redirect = vi.fn();

    const result = await runUpdateNoteAction(
      createInitialUpdateNoteFormState(createValues()),
      createFormData({
        title: "   ",
      }),
      {
        updateNote,
        redirect,
      },
    );

    expect(result).toMatchObject({
      status: "error",
      message: "请先修正表单后再保存。",
      fieldErrors: {
        title: ["title is required"],
      },
    });
    expect(updateNote).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
