import { getTableColumns, getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { describe, expect, it } from "vitest";

import {
  noteConfidenceValues,
  noteStatusValues,
  sourceTypeValues,
} from "@/features/notes/note.types";
import { noteTags, notes, tags } from "@/db/schema";

describe("note enums", () => {
  it("supports the planned status and confidence lifecycles", () => {
    expect(noteStatusValues).toEqual(["inbox", "digested", "archived"]);
    expect(noteConfidenceValues).toEqual(["draft", "tested", "trusted"]);
    expect(sourceTypeValues).toEqual([
      "manual",
      "article",
      "chat",
      "terminal",
      "doc",
      "other",
    ]);
  });
});

describe("database schema", () => {
  it("defines the notes table with searchable indexes", () => {
    expect(getTableName(notes)).toBe("notes");
    expect(Object.keys(getTableColumns(notes))).toEqual([
      "id",
      "title",
      "rawInput",
      "summary",
      "problem",
      "solution",
      "why",
      "commands",
      "references",
      "stack",
      "status",
      "confidence",
      "sourceType",
      "sourceUrl",
      "createdAt",
      "updatedAt",
    ]);

    const notesConfig = getTableConfig(notes);
    expect(notesConfig.indexes.map((index) => index.config.name)).toEqual(
      expect.arrayContaining([
        "notes_status_idx",
        "notes_stack_idx",
        "notes_updated_at_idx",
      ]),
    );
  });

  it("keeps tags unique and note-tag links normalized", () => {
    expect(getTableName(tags)).toBe("tags");
    expect(getTableName(noteTags)).toBe("note_tags");

    const tagsConfig = getTableConfig(tags);
    expect(tagsConfig.indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          config: expect.objectContaining({
            name: "tags_name_idx",
            unique: true,
          }),
        }),
      ]),
    );

    const noteTagsConfig = getTableConfig(noteTags);
    expect(noteTagsConfig.foreignKeys).toHaveLength(2);
    expect(noteTagsConfig.primaryKeys).toHaveLength(1);
    expect(noteTagsConfig.primaryKeys[0]?.columns.map((column) => column.name)).toEqual([
      "note_id",
      "tag_id",
    ]);
  });
});
