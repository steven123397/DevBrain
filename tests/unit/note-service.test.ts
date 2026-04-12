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
        status: "digested",
        confidence: "tested",
        tags: ["nextjs", "ssr"],
      });

      expect(updated).toMatchObject({
        id: created.id,
        summary: "Browser-only logic belongs in useEffect.",
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
        tags: ["react"],
      });
      const third = await context.service.createNote({
        title: "third digested note",
        status: "digested",
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

  it("returns explainable related notes ordered by score", async () => {
    const context = createTestContext();

    try {
      const base = await context.service.createNote({
        title: "pnpm workspace alignment",
        tags: ["pnpm", "workspace"],
        stack: "Tooling",
        commands: "pnpm install --recursive",
        status: "digested",
      });
      await context.service.createNote({
        title: "docker cache cleanup",
        tags: ["docker"],
        stack: "Docker",
        commands: "docker builder prune",
        status: "digested",
      });
      const stronger = await context.service.createNote({
        title: "pnpm workspace install guide",
        tags: ["pnpm", "workspace"],
        stack: "Tooling",
        commands: "pnpm install",
        status: "digested",
      });
      const weaker = await context.service.createNote({
        title: "workspace peer dependency checklist",
        tags: ["workspace"],
        commands: "pnpm list",
        status: "digested",
      });

      const related = await context.service.listRelatedNotes(base.id);

      expect(related.map((item) => item.note.id)).toEqual([stronger.id, weaker.id]);
      expect(related[0]?.reasons).toEqual(
        expect.arrayContaining([
          "共享标签：#pnpm、#workspace",
          "同技术栈：Tooling",
        ]),
      );
    } finally {
      context.sqlite.close();
    }
  });
});
