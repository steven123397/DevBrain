import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import { notes } from "@/db/schema";
import { buildNoteSearchCondition } from "@/features/notes/note.search";

const migrationSql = fs.readFileSync(
  path.join(process.cwd(), "src/db/migrations/0000_dapper_franklin_storm.sql"),
  "utf8",
);

function createDatabase() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(migrationSql);

  const database = drizzle(sqlite, { schema });

  const baseTime = new Date("2026-04-12T00:00:00.000Z");
  database
    .insert(notes)
    .values([
      {
        id: "note-1",
        title: "hydration mismatch",
        rawInput: "SSR warning after touching window",
        problem: "server and client rendered different markup",
        solution: "move browser-only logic into useEffect",
        status: "digested",
        confidence: "tested",
        sourceType: "manual",
        createdAt: baseTime,
        updatedAt: baseTime,
      },
      {
        id: "note-2",
        title: "pnpm peer dep fix",
        rawInput: "used overrides for workspace alignment",
        problem: "peer ranges drifted across packages",
        solution: "pin versions with pnpm overrides",
        status: "inbox",
        confidence: "draft",
        sourceType: "manual",
        createdAt: baseTime,
        updatedAt: baseTime,
      },
    ])
    .run();

  return { sqlite, database };
}

describe("note search", () => {
  it("matches note titles", () => {
    const context = createDatabase();

    try {
      const rows = context.database
        .select({ title: notes.title })
        .from(notes)
        .where(buildNoteSearchCondition("hydration"))
        .all();

      expect(rows.map((row) => row.title)).toEqual(["hydration mismatch"]);
    } finally {
      context.sqlite.close();
    }
  });

  it("matches raw input content", () => {
    const context = createDatabase();

    try {
      const rows = context.database
        .select({ title: notes.title })
        .from(notes)
        .where(buildNoteSearchCondition("workspace alignment"))
        .all();

      expect(rows.map((row) => row.title)).toEqual(["pnpm peer dep fix"]);
    } finally {
      context.sqlite.close();
    }
  });

  it("matches problem and solution fields", () => {
    const context = createDatabase();

    try {
      const problemRows = context.database
        .select({ title: notes.title })
        .from(notes)
        .where(buildNoteSearchCondition("different markup"))
        .all();
      const solutionRows = context.database
        .select({ title: notes.title })
        .from(notes)
        .where(buildNoteSearchCondition("useEffect"))
        .all();

      expect(problemRows.map((row) => row.title)).toEqual([
        "hydration mismatch",
      ]);
      expect(solutionRows.map((row) => row.title)).toEqual([
        "hydration mismatch",
      ]);
    } finally {
      context.sqlite.close();
    }
  });

  it("composes with status filters", () => {
    const context = createDatabase();

    try {
      const rows = context.database
        .select({ title: notes.title })
        .from(notes)
        .where(
          and(
            buildNoteSearchCondition("overrides"),
            eq(notes.status, "digested"),
          ),
        )
        .all();

      expect(rows).toEqual([]);
    } finally {
      context.sqlite.close();
    }
  });
});
