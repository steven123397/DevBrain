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
  it("scores shared tags, stack, canonical terms, and command terms transparently", () => {
    const base = makeNote({
      id: "note-1",
      title: "validation db seed flow",
      tags: ["sqlite", "database"],
      stack: "SQLite",
      why: "Use DEVBRAIN_DB_FILE so seed never writes into 默认主库.",
      commands: "DEVBRAIN_DB_FILE=data/validation.sqlite pnpm seed",
    });
    const candidate = makeNote({
      id: "note-2",
      title: "db:migrate target validation db",
      tags: ["database"],
      stack: "SQLite",
      why: "db:migrate should keep using validation db before touching the demo db.",
      commands: "DEVBRAIN_DB_FILE=data/validation.sqlite pnpm db:migrate",
    });

    const result = scoreRelated(base, candidate);

    expect(result.score).toBeGreaterThan(0);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        "共享标签：#database",
        "同技术栈：SQLite",
        "共享术语：数据库目标",
        "命令词重叠：devbrain_db_file",
      ]),
    );
  });

  it("drops generic title noise like server and file when there is no stronger signal", () => {
    const base = makeNote({
      id: "note-1",
      title: "server action validation db flow",
    });
    const genericCandidate = makeNote({
      id: "note-2",
      title: "server file wiring guide",
    });

    const result = scoreRelated(base, genericCandidate);

    expect(result).toEqual({
      score: 0,
      reasons: [],
    });
  });

  it("filters self matches and sorts higher scoring notes first", () => {
    const base = makeNote({
      id: "note-1",
      title: "validation db seed flow",
      tags: ["sqlite", "database"],
      stack: "SQLite",
      why: "Use DEVBRAIN_DB_FILE to protect the validation db path.",
      commands: "DEVBRAIN_DB_FILE=data/validation.sqlite pnpm seed",
      updatedAt: "2026-04-12T10:00:00.000Z",
    });
    const strongest = makeNote({
      id: "note-2",
      title: "db:migrate target validation db",
      tags: ["database", "sqlite"],
      stack: "SQLite",
      why: "Set DEVBRAIN_DB_FILE before db:migrate so it never hits 默认主库.",
      commands: "DEVBRAIN_DB_FILE=data/validation.sqlite pnpm db:migrate",
      updatedAt: "2026-04-12T09:00:00.000Z",
    });
    const weaker = makeNote({
      id: "note-3",
      title: "better-sqlite3 bindings rebuild",
      tags: ["sqlite"],
      stack: "SQLite",
      why: "Rebuild bindings after reinstalling dependencies.",
      commands: "pnpm rebuild better-sqlite3",
      updatedAt: "2026-04-12T11:00:00.000Z",
    });
    const unrelated = makeNote({
      id: "note-4",
      title: "server file wiring guide",
      tags: ["frontend"],
      stack: "Next.js",
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
