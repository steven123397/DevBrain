import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import {
  noteConfidenceValues,
  noteStatusValues,
  sourceTypeValues,
} from "../features/notes/note.types";

export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    rawInput: text("raw_input").notNull().default(""),
    summary: text("summary"),
    problem: text("problem"),
    solution: text("solution"),
    why: text("why"),
    commands: text("commands"),
    references: text("references"),
    stack: text("stack"),
    status: text("status", { enum: noteStatusValues }).notNull().default("inbox"),
    confidence: text("confidence", { enum: noteConfidenceValues })
      .notNull()
      .default("draft"),
    sourceType: text("source_type", { enum: sourceTypeValues }).notNull().default("manual"),
    sourceUrl: text("source_url"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("notes_status_idx").on(table.status),
    index("notes_stack_idx").on(table.stack),
    index("notes_updated_at_idx").on(table.updatedAt),
  ],
);

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [uniqueIndex("tags_name_idx").on(table.name)],
);

export const noteTags = sqliteTable(
  "note_tags",
  {
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    primaryKey({ columns: [table.noteId, table.tagId] }),
    index("note_tags_note_id_idx").on(table.noteId),
    index("note_tags_tag_id_idx").on(table.tagId),
  ],
);
