import { describe, expect, it } from "vitest";

import { buildRelatedRecommendations, scoreRelated } from "@/features/notes/note.related";
import type { KnowledgeNote } from "@/features/notes/note.types";

function makeNote(overrides: Partial<KnowledgeNote> = {}): KnowledgeNote {
  return {
    id: "note-base",
    title: "base note",
    rawInput: "",
    summary: null,
    problem: null,
    solution: null,
    why: null,
    commands: null,
    references: null,
    tags: [],
    stack: null,
    status: "digested",
    confidence: "tested",
    sourceType: "manual",
    sourceUrl: null,
    createdAt: "2026-04-12T00:00:00.000Z",
    updatedAt: "2026-04-12T00:00:00.000Z",
    ...overrides,
  };
}

describe("note related scoring", () => {
  it("scores shared tags, stack, title terms, and command terms transparently", () => {
    const base = makeNote({
      id: "note-1",
      title: "next hydration mismatch",
      tags: ["nextjs", "react"],
      stack: "Next.js",
      commands: "pnpm install --frozen-lockfile",
    });
    const candidate = makeNote({
      id: "note-2",
      title: "hydration mismatch guide",
      tags: ["react"],
      stack: "Next.js",
      commands: "pnpm install",
    });

    const result = scoreRelated(base, candidate);

    expect(result.score).toBe(9);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        "共享标签：#react",
        "同技术栈：Next.js",
        "标题词重叠：hydration、mismatch",
        "命令词重叠：install、pnpm",
      ]),
    );
  });

  it("filters self matches and sorts higher scoring notes first", () => {
    const base = makeNote({
      id: "note-1",
      title: "pnpm workspace alignment",
      tags: ["pnpm", "workspace"],
      stack: "Tooling",
      commands: "pnpm install --recursive",
      updatedAt: "2026-04-12T10:00:00.000Z",
    });
    const strongest = makeNote({
      id: "note-2",
      title: "pnpm workspace install guide",
      tags: ["pnpm", "workspace"],
      stack: "Tooling",
      commands: "pnpm install",
      updatedAt: "2026-04-12T09:00:00.000Z",
    });
    const weaker = makeNote({
      id: "note-3",
      title: "workspace peer dependency checklist",
      tags: ["workspace"],
      stack: null,
      commands: null,
      updatedAt: "2026-04-12T11:00:00.000Z",
    });
    const unrelated = makeNote({
      id: "note-4",
      title: "docker cache cleanup",
      tags: ["docker"],
      stack: "Docker",
    });

    const recommendations = buildRelatedRecommendations(
      base,
      [unrelated, base, weaker, strongest],
      3,
    );

    expect(recommendations.map((item) => item.note.id)).toEqual([
      "note-2",
      "note-3",
    ]);
    expect(recommendations[0].score).toBeGreaterThan(recommendations[1].score);
    expect(recommendations.every((item) => item.note.id !== base.id)).toBe(true);
  });
});
