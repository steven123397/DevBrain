import { describe, expect, it } from "vitest";

import {
  createNoteSchema,
  noteFiltersSchema,
  updateNoteSchema,
} from "@/features/notes/note.schemas";

describe("createNoteSchema", () => {
  it("requires a non-empty title", () => {
    const result = createNoteSchema.safeParse({
      title: "   ",
      rawInput: "kept the repro steps here",
      status: "inbox",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a minimal inbox payload", () => {
    const result = createNoteSchema.safeParse({
      title: "pnpm peer dep fix",
      rawInput: "used overrides",
      status: "inbox",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data).toMatchObject({
      title: "pnpm peer dep fix",
      rawInput: "used overrides",
      status: "inbox",
      confidence: "draft",
      sourceType: "manual",
      tags: [],
    });
  });

  it("allows a partial digested payload with a valid status", () => {
    const result = createNoteSchema.safeParse({
      title: "hydration mismatch",
      status: "digested",
      solution: "move browser-only logic into useEffect",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.status).toBe("digested");
    expect(result.data.solution).toBe("move browser-only logic into useEffect");
  });

  it("rejects an invalid source url when present", () => {
    const result = createNoteSchema.safeParse({
      title: "bad url",
      sourceUrl: "not-a-url",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateNoteSchema", () => {
  it("accepts partial updates and normalizes tags", () => {
    const result = updateNoteSchema.safeParse({
      summary: "  Keep the final fix concise.  ",
      tags: ["PnPm", " monorepo ", "pnpm"],
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data).toMatchObject({
      summary: "Keep the final fix concise.",
      tags: ["pnpm", "monorepo"],
    });
  });
});

describe("noteFiltersSchema", () => {
  it("normalizes list filters and fills defaults", () => {
    const result = noteFiltersSchema.parse({
      query: " hydration ",
      status: "inbox",
      tag: " PnPm ",
      stack: " Next.js ",
    });

    expect(result).toMatchObject({
      query: "hydration",
      status: "inbox",
      tag: "pnpm",
      stack: "Next.js",
      sort: "updatedAtDesc",
      limit: 50,
    });
  });
});
