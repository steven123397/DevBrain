import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, expect, it } from "vitest";

import * as schema from "@/db/schema";
import { notes } from "@/db/schema";
import { createNoteService } from "@/features/notes/note.service";

const migrationSql = fs.readFileSync(
  path.join(process.cwd(), "src/db/migrations/0000_dapper_franklin_storm.sql"),
  "utf8",
);

function createTestContext() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(migrationSql);

  const database = drizzle(sqlite, { schema });
  const service = createNoteService(database);

  return { sqlite, database, service };
}

describe("note service", () => {
  it("creates a note with normalized tags and loads it back", async () => {
    const context = createTestContext();

    try {
      const created = await context.service.createNote({
        title: "  pnpm peer dep fix  ",
        rawInput: "used overrides",
        tags: ["PnPm", " monorepo ", "pnpm"],
        stack: "Next.js",
        sourceUrl: "https://example.com/fix",
      });

      expect(created).toMatchObject({
        title: "pnpm peer dep fix",
        rawInput: "used overrides",
        status: "inbox",
        confidence: "draft",
        sourceType: "manual",
        stack: "Next.js",
        sourceUrl: "https://example.com/fix",
        tags: ["monorepo", "pnpm"],
      });

      const loaded = await context.service.getNoteById(created.id);
      expect(loaded).toEqual(created);
    } finally {
      context.sqlite.close();
    }
  });

  it("lists notes by updatedAt desc and applies status and tag filters", async () => {
    const context = createTestContext();

    try {
      const older = await context.service.createNote({
        title: "older inbox note",
        status: "inbox",
        tags: ["pnpm"],
      });
      const middle = await context.service.createNote({
        title: "middle digested note",
        status: "digested",
        summary: "Structured summary for the middle digested note.",
        problem: "A reusable digested note needs the required fields.",
        solution: "Fill summary, problem, and solution before marking digested.",
        tags: ["react"],
      });
      const newer = await context.service.createNote({
        title: "newer inbox note",
        status: "inbox",
        tags: ["react"],
      });

      await context.database
        .update(notes)
        .set({ updatedAt: new Date("2026-01-01T00:00:00.000Z") })
        .where(eq(notes.id, older.id));
      await context.database
        .update(notes)
        .set({ updatedAt: new Date("2026-01-02T00:00:00.000Z") })
        .where(eq(notes.id, middle.id));
      await context.database
        .update(notes)
        .set({ updatedAt: new Date("2026-01-03T00:00:00.000Z") })
        .where(eq(notes.id, newer.id));

      const listed = await context.service.listNotes();
      expect(listed.map((note) => note.title)).toEqual([
        "newer inbox note",
        "middle digested note",
        "older inbox note",
      ]);

      const inboxOnly = await context.service.listNotes({ status: "inbox" });
      expect(inboxOnly.map((note) => note.title)).toEqual([
        "newer inbox note",
        "older inbox note",
      ]);

      const reactOnly = await context.service.listNotes({ tag: "React" });
      expect(reactOnly.map((note) => note.title)).toEqual([
        "newer inbox note",
        "middle digested note",
      ]);
    } finally {
      context.sqlite.close();
    }
  });

  it("updates structured fields and replaces tag links", async () => {
    const context = createTestContext();

    try {
      const created = await context.service.createNote({
        title: "hydration mismatch",
        tags: ["nextjs", "react"],
      });

      const updated = await context.service.updateNote(created.id, {
        summary: "Browser-only logic belongs in useEffect.",
        problem: "Server and client rendered different markup.",
        solution: "Move browser-only logic into useEffect.",
        status: "digested",
        confidence: "tested",
        tags: ["nextjs", "ssr"],
      });

      expect(updated).toMatchObject({
        id: created.id,
        summary: "Browser-only logic belongs in useEffect.",
        problem: "Server and client rendered different markup.",
        solution: "Move browser-only logic into useEffect.",
        status: "digested",
        confidence: "tested",
        tags: ["nextjs", "ssr"],
      });

      const loaded = await context.service.getNoteById(created.id);
      expect(loaded?.tags).toEqual(["nextjs", "ssr"]);
    } finally {
      context.sqlite.close();
    }
  });

  it("rejects a digested transition when the merged note still misses required fields", async () => {
    const context = createTestContext();

    try {
      const created = await context.service.createNote({
        title: "hydration mismatch",
        tags: ["nextjs"],
      });

      await expect(
        context.service.updateNote(created.id, {
          status: "digested",
        }),
      ).rejects.toThrow(/digested/i);
    } finally {
      context.sqlite.close();
    }
  });

  it("preserves existing fields when an update omits them", async () => {
    const context = createTestContext();

    try {
      const created = await context.service.createNote({
        title: "keep prior details",
        summary: "Existing summary",
        solution: "Existing solution",
        tags: ["before"],
      });

      const updated = await context.service.updateNote(created.id, {
        tags: ["after"],
      });

      expect(updated).toMatchObject({
        id: created.id,
        summary: "Existing summary",
        solution: "Existing solution",
        tags: ["after"],
      });
    } finally {
      context.sqlite.close();
    }
  });

  it("deletes notes and reports whether anything changed", async () => {
    const context = createTestContext();

    try {
      const created = await context.service.createNote({
        title: "obsolete note",
        tags: ["cleanup"],
      });

      await expect(context.service.deleteNote(created.id)).resolves.toBe(true);
      await expect(context.service.getNoteById(created.id)).resolves.toBeNull();
      await expect(context.service.deleteNote(created.id)).resolves.toBe(false);
    } finally {
      context.sqlite.close();
    }
  });

  it("returns a limited recent note list", async () => {
    const context = createTestContext();

    try {
      const first = await context.service.createNote({ title: "first note" });
      const second = await context.service.createNote({ title: "second note" });
      const third = await context.service.createNote({ title: "third note" });

      await context.database
        .update(notes)
        .set({ updatedAt: new Date("2026-02-01T00:00:00.000Z") })
        .where(eq(notes.id, first.id));
      await context.database
        .update(notes)
        .set({ updatedAt: new Date("2026-02-02T00:00:00.000Z") })
        .where(eq(notes.id, second.id));
      await context.database
        .update(notes)
        .set({ updatedAt: new Date("2026-02-03T00:00:00.000Z") })
        .where(eq(notes.id, third.id));

      const recent = await context.service.listRecentNotes(2);
      expect(recent.map((note) => note.title)).toEqual(["third note", "second note"]);
    } finally {
      context.sqlite.close();
    }
  });

  it("summarizes dashboard counts and recent updates", async () => {
    const context = createTestContext();

    try {
      const first = await context.service.createNote({
        title: "first inbox note",
        status: "inbox",
        tags: ["pnpm"],
      });
      const second = await context.service.createNote({
        title: "second digested note",
        status: "digested",
        summary: "Structured summary for the second digested note.",
        problem: "Dashboard counts should include compliant digested notes.",
        solution: "Create digested fixtures with the minimum required structure.",
        tags: ["react"],
      });
      const third = await context.service.createNote({
        title: "third digested note",
        status: "digested",
        summary: "Structured summary for the third digested note.",
        problem: "Recent digested notes should remain valid fixtures.",
        solution: "Provide summary, problem, and solution alongside the status.",
        tags: ["nextjs"],
      });

      await context.database
        .update(notes)
        .set({ updatedAt: new Date("2026-03-01T00:00:00.000Z") })
        .where(eq(notes.id, first.id));
      await context.database
        .update(notes)
        .set({ updatedAt: new Date("2026-03-02T00:00:00.000Z") })
        .where(eq(notes.id, second.id));
      await context.database
        .update(notes)
        .set({ updatedAt: new Date("2026-03-03T00:00:00.000Z") })
        .where(eq(notes.id, third.id));

      const overview = await context.service.getDashboardOverview(2);

      expect(overview).toMatchObject({
        totalNotes: 3,
        inboxCount: 1,
        digestedCount: 2,
      });
      expect(overview.recentNotes.map((note) => note.title)).toEqual([
        "third digested note",
        "second digested note",
      ]);
    } finally {
      context.sqlite.close();
    }
  });

  it("supports free-text query and exposes unique filter options", async () => {
    const context = createTestContext();

    try {
      await context.service.createNote({
        title: "hydration mismatch",
        rawInput: "warning from server render",
        solution: "move browser-only logic into useEffect",
        stack: "Next.js",
        tags: ["react", "nextjs"],
      });
      await context.service.createNote({
        title: "pnpm peer dep fix",
        rawInput: "used overrides",
        stack: "Tooling",
        tags: ["pnpm"],
      });

      const searchResults = await context.service.listNotes({ query: "useEffect" });
      expect(searchResults.map((note) => note.title)).toEqual(["hydration mismatch"]);

      const filterOptions = await context.service.listFilterOptions();
      expect(filterOptions).toEqual({
        tags: ["nextjs", "pnpm", "react"],
        stacks: ["Next.js", "Tooling"],
      });
    } finally {
      context.sqlite.close();
    }
  });

  it("ranks search results by structured relevance and includes tag matches", async () => {
    const context = createTestContext();

    try {
      const titleMatch = await context.service.createNote({
        title: "pnpm workspace overrides",
        rawInput: "Root fix for workspace installs",
        tags: ["tooling"],
      });
      const rawInputMatch = await context.service.createNote({
        title: "workspace install guide",
        rawInput: "Run pnpm install after changing overrides",
        tags: ["workspace"],
      });
      const tagMatch = await context.service.createNote({
        title: "lockfile drift checklist",
        rawInput: "Use this when dependency trees drift",
        tags: ["pnpm"],
      });

      await context.database
        .update(notes)
        .set({ updatedAt: new Date("2026-03-01T00:00:00.000Z") })
        .where(eq(notes.id, titleMatch.id));
      await context.database
        .update(notes)
        .set({ updatedAt: new Date("2026-03-03T00:00:00.000Z") })
        .where(eq(notes.id, rawInputMatch.id));
      await context.database
        .update(notes)
        .set({ updatedAt: new Date("2026-03-02T00:00:00.000Z") })
        .where(eq(notes.id, tagMatch.id));

      const searchResults = await context.service.listNotes({ query: "pnpm" });

      expect(searchResults.map((note) => note.title)).toEqual([
        "pnpm workspace overrides",
        "workspace install guide",
        "lockfile drift checklist",
      ]);
    } finally {
      context.sqlite.close();
    }
  });

  it("supports Chinese fuzzy recall and canonical alias expansion in search", async () => {
    const context = createTestContext();

    try {
      await context.service.createNote({
        title: "输入框改了但列表没变",
        rawInput: "中文查询更新后，列表结果还是旧的",
        summary: "列表筛选依赖的 query 没同步更新。",
        problem: "输入框改了，但真正参与过滤的状态没有更新。",
        solution: "统一 query 状态来源，让列表和输入框读写同一个值。",
        status: "digested",
        tags: ["search"],
      });
      await context.service.createNote({
        title: "drizzle-orm migration checklist",
        rawInput: "Keep drizzle orm and drizzle-kit scripts aligned.",
        summary: "Align drizzle-orm package usage with local scripts.",
        problem: "drizzle orm docs and local commands diverged.",
        solution: "Use drizzle-kit generate before db:migrate.",
        status: "digested",
        tags: ["database"],
        stack: "Drizzle ORM",
      });
      await context.service.createNote({
        title: "validation db target safety",
        rawInput: "避免 seed 或迁移落到默认主库。",
        summary: "数据库操作必须显式指向 validation db。",
        problem: "默认主库和 validation 库容易混淆。",
        solution: "统一通过 DEVBRAIN_DB_FILE 指向 validation db。",
        why: "这样 seed 和 db:migrate 都不会误写到 demo db 或默认主库。",
        commands: "DEVBRAIN_DB_FILE=data/validation.sqlite pnpm db:migrate",
        references: "validation db / demo db / 默认主库",
        status: "digested",
        confidence: "trusted",
        tags: ["database", "sqlite"],
        stack: "SQLite",
      });

      await expect(
        context.service.listNotes({ query: "输入框改了列表没变" }),
      ).resolves.toHaveLength(1);
      await expect(context.service.listNotes({ query: "drizzle orm" })).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: "drizzle-orm migration checklist",
          }),
        ]),
      );
      await expect(context.service.listNotes({ query: "默认主库" })).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: "validation db target safety",
          }),
        ]),
      );
    } finally {
      context.sqlite.close();
    }
  });

  it("ranks database target notes ahead of generic tooling matches", async () => {
    const context = createTestContext();

    try {
      await context.service.createNote({
        title: "validation db target safety",
        rawInput: "Keep seed and migrate on the validation db.",
        summary: "Database operations should never fall back to the 默认主库.",
        problem: "db:migrate and seed can accidentally point at the wrong database.",
        solution: "Always export DEVBRAIN_DB_FILE before db:migrate.",
        why: "The validation 库 path is the real guardrail for review flows.",
        commands: "DEVBRAIN_DB_FILE=data/validation.sqlite pnpm db:migrate",
        references: "validation db / demo db / 默认主库",
        status: "digested",
        confidence: "trusted",
        tags: ["database", "sqlite"],
        stack: "SQLite",
      });
      await context.service.createNote({
        title: "better-sqlite3 bindings rebuild",
        rawInput: "Rebuild native bindings after reinstall.",
        summary: "Native bindings can break after a fresh install.",
        problem: "The better-sqlite3 module fails to load.",
        solution: "Rebuild the package and re-run install scripts.",
        why: "This is a local toolchain fix, not a database target decision.",
        commands: "pnpm rebuild better-sqlite3",
        references: "better-sqlite3 bindings",
        status: "digested",
        confidence: "tested",
        tags: ["sqlite"],
        stack: "SQLite",
      });

      const migrateResults = await context.service.listNotes({ query: "db:migrate" });
      const validationResults = await context.service.listNotes({ query: "validation 库" });

      expect(migrateResults[0]?.title).toBe("validation db target safety");
      expect(validationResults[0]?.title).toBe("validation db target safety");
    } finally {
      context.sqlite.close();
    }
  });

  it("does not let plain file notes leak into DEVBRAIN_DB_FILE results", async () => {
    const context = createTestContext();

    try {
      await context.service.createNote({
        title: "validation db target safety",
        rawInput: "Keep seed and migrate on the validation db.",
        summary: "Database operations should never fall back to the 默认主库.",
        problem: "DEVBRAIN_DB_FILE must point at the right SQLite file.",
        solution: "Export DEVBRAIN_DB_FILE before seed or db:migrate.",
        why: "The env var is the real guardrail for review flows.",
        commands: "DEVBRAIN_DB_FILE=data/validation.sqlite pnpm db:migrate",
        references: "validation db / demo db / 默认主库",
        status: "digested",
        confidence: "trusted",
        tags: ["database", "sqlite"],
        stack: "SQLite",
      });
      await context.service.createNote({
        title: "server file wiring guide",
        rawInput: "Keep the file layout readable on the server side.",
        summary: "A generic file organization note.",
        problem: "Server files were hard to scan.",
        solution: "Rename and regroup files by feature.",
        status: "digested",
        confidence: "tested",
        tags: ["frontend"],
        stack: "Next.js",
      });

      const results = await context.service.listNotes({ query: "DEVBRAIN_DB_FILE" });

      expect(results.map((note) => note.title)).toEqual([
        "validation db target safety",
      ]);
    } finally {
      context.sqlite.close();
    }
  });

  it("keeps broad pnpm queries focused on pnpm-centric notes before command-only matches", async () => {
    const context = createTestContext();

    try {
      await context.service.createNote({
        title: "pnpm workspace overrides checklist",
        rawInput: "Remember the workspace override smoke test.",
        summary: "Use pnpm overrides to keep workspace installs aligned.",
        problem: "Workspace packages drift to incompatible peer ranges.",
        solution: "Pin shared versions with pnpm overrides and reinstall.",
        commands: "pnpm install",
        status: "digested",
        confidence: "tested",
        tags: ["pnpm", "workspace"],
        stack: "Tooling",
      });
      await context.service.createNote({
        title: "pnpm peer dep fix",
        rawInput: "Used overrides for workspace alignment.",
        status: "inbox",
        tags: ["pnpm"],
        stack: "Tooling",
      });
      await context.service.createNote({
        title: "better-sqlite3 bindings rebuild",
        rawInput: "Native bindings can fail after a fresh install.",
        summary: "Rebuild the better-sqlite3 package after reinstalling dependencies.",
        problem: "The module fails to load because the native binding is stale.",
        solution: "Run pnpm rebuild better-sqlite3 and reinstall if needed.",
        commands: "pnpm rebuild better-sqlite3",
        why: "This is a toolchain fix, not a pnpm note.",
        status: "digested",
        confidence: "tested",
        tags: ["sqlite", "tooling"],
        stack: "SQLite",
      });
      await context.service.createNote({
        title: "validation db target safety",
        rawInput: "Avoid seed or migrate falling back to 默认主库.",
        summary: "Database review should always stay on validation db.",
        problem: "The demo db and 默认主库 are easy to confuse during review.",
        solution: "Set DEVBRAIN_DB_FILE before seed or migration commands.",
        why: "This keeps local database operations on the validation db until review is done.",
        commands: "DEVBRAIN_DB_FILE=data/validation.sqlite pnpm seed",
        status: "digested",
        confidence: "trusted",
        tags: ["database", "sqlite"],
        stack: "SQLite",
      });

      const results = await context.service.listNotes({ query: "pnpm" });

      expect(results.slice(0, 2).map((note) => note.title)).toEqual([
        "pnpm workspace overrides checklist",
        "pnpm peer dep fix",
      ]);
    } finally {
      context.sqlite.close();
    }
  });

  it("returns explainable related notes ordered by score", async () => {
    const context = createTestContext();

    try {
      const base = await context.service.createNote({
        title: "validation db seed flow",
        summary: "Seed should stay on the validation db.",
        problem: "pnpm seed can accidentally touch the 默认主库.",
        solution: "Point seed at the validation db before reviewing data changes.",
        why: "DEVBRAIN_DB_FILE keeps local review data isolated.",
        tags: ["database", "sqlite"],
        stack: "SQLite",
        commands: "DEVBRAIN_DB_FILE=data/validation.sqlite pnpm seed",
        status: "digested",
      });
      await context.service.createNote({
        title: "server file wiring guide",
        summary: "Keep generic server-side file wiring tidy.",
        problem: "Loose server files become hard to follow.",
        solution: "Refactor file boundaries and naming.",
        tags: ["frontend"],
        stack: "Next.js",
        commands: "pnpm lint",
        status: "digested",
      });
      const stronger = await context.service.createNote({
        title: "db:migrate target validation db",
        summary: "Keep migrations on the validation db before touching real data.",
        problem: "db:migrate can point at the wrong database file.",
        solution: "Export DEVBRAIN_DB_FILE before db:migrate.",
        why: "The validation db should absorb migrate checks first.",
        tags: ["database", "sqlite"],
        stack: "SQLite",
        commands: "DEVBRAIN_DB_FILE=data/validation.sqlite pnpm db:migrate",
        status: "digested",
      });
      const weaker = await context.service.createNote({
        title: "better-sqlite3 bindings rebuild",
        summary: "Rebuild better-sqlite3 after reinstalling dependencies.",
        problem: "Fresh installs can break the native bindings.",
        solution: "Rebuild the package before retrying the app.",
        tags: ["sqlite"],
        stack: "SQLite",
        commands: "pnpm rebuild better-sqlite3",
        status: "digested",
      });

      const related = await context.service.listRelatedNotes(base.id);

      expect(related.map((item) => item.note.id)).toEqual([stronger.id, weaker.id]);
      expect(related[0]?.reasons).toEqual(
        expect.arrayContaining([
          "共享标签：#database、#sqlite",
          "同技术栈：SQLite",
        ]),
      );
    } finally {
      context.sqlite.close();
    }
  });
});
