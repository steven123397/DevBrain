import { describe, expect, it, vi } from "vitest";

import {
  initialCreateNoteFormState,
  runCreateNoteAction,
} from "@/app/actions/create-note.shared";

class RedirectSignal extends Error {
  constructor(readonly location: string) {
    super(`Redirected to ${location}`);
  }
}

function createFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("create note action", () => {
  it("accepts a minimal inbox payload and redirects to the detail page", async () => {
    const createNote = vi.fn().mockResolvedValue({
      id: "note-123",
    });
    const redirect = vi.fn((location: string) => {
      throw new RedirectSignal(location);
    });

    await expect(
      runCreateNoteAction(
        initialCreateNoteFormState,
        createFormData({
          title: "  pnpm peer dep fix  ",
          rawInput: "used overrides",
        }),
        {
          createNote,
          redirect,
        },
      ),
    ).rejects.toMatchObject({
      location: "/notes/note-123",
    });

    expect(createNote).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "pnpm peer dep fix",
        rawInput: "used overrides",
        status: "inbox",
        confidence: "draft",
        sourceType: "manual",
        tags: [],
      }),
    );
  });

  it("returns validation errors when title is invalid", async () => {
    const createNote = vi.fn();
    const redirect = vi.fn();

    const result = await runCreateNoteAction(
      initialCreateNoteFormState,
      createFormData({
        title: "   ",
        rawInput: "keep the repro steps",
      }),
      {
        createNote,
        redirect,
      },
    );

    expect(result).toMatchObject({
      status: "error",
      message: "请先修正表单后再提交。",
      fieldErrors: {
        title: ["title is required"],
      },
    });
    expect(createNote).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("passes through a valid source url when present", async () => {
    const createNote = vi.fn().mockResolvedValue({
      id: "note-456",
    });
    const redirect = vi.fn((location: string) => {
      throw new RedirectSignal(location);
    });

    await expect(
      runCreateNoteAction(
        initialCreateNoteFormState,
        createFormData({
          title: "Next.js docs reference",
          rawInput: "keep the official explanation handy",
          tags: "nextjs, docs",
          stack: "Next.js",
          sourceType: "article",
          sourceUrl: "https://nextjs.org/docs/app",
        }),
        {
          createNote,
          redirect,
        },
      ),
    ).rejects.toMatchObject({
      location: "/notes/note-456",
    });

    expect(createNote).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceType: "article",
        sourceUrl: "https://nextjs.org/docs/app",
        tags: ["nextjs", "docs"],
      }),
    );
  });
});
