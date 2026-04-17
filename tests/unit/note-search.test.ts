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
      {
        id: "note-3",
        title: "输入框改了但列表没变",
        rawInput: "中文筛选词更新后，结果列表没有跟着刷新",
        problem: "查询状态变了，但是列表还是旧结果",
        solution: "把输入状态同步到真正触发过滤的 query。",
        status: "digested",
        confidence: "tested",
        sourceType: "manual",
        createdAt: baseTime,
        updatedAt: baseTime,
      },
      {
        id: "note-4",
        title: "validation db target safety",
        rawInput: "Avoid writing demo seed into the 默认主库.",
        why: "Use DEVBRAIN_DB_FILE to point seed and db:migrate at validation db.",
        commands: "DEVBRAIN_DB_FILE=data/validation.sqlite pnpm db:migrate",
        references: "validation db boundary, demo db, 默认主库",
        status: "digested",
        confidence: "trusted",
        sourceType: "manual",
        createdAt: baseTime,
        updatedAt: baseTime,
      },
      {
        id: "note-5",
        title: "drizzle-orm migrate guide",
        rawInput: "Keep drizzle-kit and drizzle-orm commands aligned.",
        problem: "drizzle orm docs and local scripts drifted apart",
        solution: "Run drizzle-kit generate before db:migrate.",
        status: "digested",
        confidence: "tested",
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

  it("matches Chinese fuzzy phrases through reusable tokenization", () => {
    const context = createDatabase();

    try {
      const rows = context.database
        .select({ title: notes.title })
        .from(notes)
        .where(buildNoteSearchCondition("输入框改了列表没变"))
        .all();

      expect(rows.map((row) => row.title)).toEqual(["输入框改了但列表没变"]);
    } finally {
      context.sqlite.close();
    }
  });

  it("matches canonicalized database and drizzle aliases", () => {
    const context = createDatabase();

    try {
      const defaultDbRows = context.database
        .select({ title: notes.title })
        .from(notes)
        .where(buildNoteSearchCondition("默认主库"))
        .all();
      const envRows = context.database
        .select({ title: notes.title })
        .from(notes)
        .where(buildNoteSearchCondition("DEVBRAIN_DB_FILE"))
        .all();
      const drizzleRows = context.database
        .select({ title: notes.title })
        .from(notes)
        .where(buildNoteSearchCondition("drizzle orm"))
        .all();

      expect(defaultDbRows.map((row) => row.title)).toEqual([
        "validation db target safety",
      ]);
      expect(envRows.map((row) => row.title)).toEqual([
        "validation db target safety",
      ]);
      expect(drizzleRows.map((row) => row.title)).toEqual([
        "drizzle-orm migrate guide",
      ]);
    } finally {
      context.sqlite.close();
    }
  });
});
