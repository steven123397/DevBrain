import { randomUUID } from "node:crypto";

import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  sql,
} from "drizzle-orm";

import { db } from "@/db/client";
import { noteTags, notes, tags } from "@/db/schema";

import {
  createNoteSchema,
  noteFiltersSchema,
  type CreateNoteInput,
  type NoteFiltersInput,
  type NoteFiltersValues,
  updateNoteSchema,
  type UpdateNoteInput,
  type UpdateNoteValues,
} from "./note.schemas";
import type {
  KnowledgeNote,
  NoteDashboardOverview,
  NoteFilterOptions,
} from "./note.types";

function toIsoString(value: Date | number): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function mapNoteRecord(
  record: typeof notes.$inferSelect,
  noteTagMap: Map<string, string[]>,
): KnowledgeNote {
  return {
    id: record.id,
    title: record.title,
    rawInput: record.rawInput,
    summary: record.summary,
    problem: record.problem,
    solution: record.solution,
    why: record.why,
    commands: record.commands,
    references: record.references,
    tags: noteTagMap.get(record.id) ?? [],
    stack: record.stack,
    status: record.status,
    confidence: record.confidence,
    sourceType: record.sourceType,
    sourceUrl: record.sourceUrl,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt),
  };
}

function noteOrderBy(filters: NoteFiltersValues) {
  if (filters.sort === "createdAtDesc") {
    return [desc(notes.createdAt), desc(notes.updatedAt)] as const;
  }

  return [desc(notes.updatedAt), desc(notes.createdAt)] as const;
}

function buildQueryCondition(query: string) {
  const pattern = `%${query.toLowerCase()}%`;

  return sql`(
    lower(${notes.title}) like ${pattern}
    or lower(${notes.rawInput}) like ${pattern}
    or lower(coalesce(${notes.summary}, '')) like ${pattern}
    or lower(coalesce(${notes.problem}, '')) like ${pattern}
    or lower(coalesce(${notes.solution}, '')) like ${pattern}
    or lower(coalesce(${notes.why}, '')) like ${pattern}
    or lower(coalesce(${notes.commands}, '')) like ${pattern}
    or lower(coalesce(${notes.references}, '')) like ${pattern}
  )`;
}

export function createNoteService(database: typeof db = db) {
  async function getNoteTags(noteIds: string[]) {
    if (noteIds.length === 0) {
      return new Map<string, string[]>();
    }

    const rows = database
      .select({
        noteId: noteTags.noteId,
        tagName: tags.name,
      })
      .from(noteTags)
      .innerJoin(tags, eq(noteTags.tagId, tags.id))
      .where(inArray(noteTags.noteId, noteIds))
      .orderBy(tags.name)
      .all();

    const grouped = new Map<string, string[]>();

    for (const row of rows) {
      const bucket = grouped.get(row.noteId) ?? [];
      bucket.push(row.tagName);
      grouped.set(row.noteId, bucket);
    }

    return grouped;
  }

  async function syncTags(noteId: string, nextTags: string[]) {
    const now = new Date();

    database.delete(noteTags).where(eq(noteTags.noteId, noteId)).run();
    if (nextTags.length === 0) {
      return;
    }

    const existingTags = database
      .select({ id: tags.id, name: tags.name })
      .from(tags)
      .where(inArray(tags.name, nextTags))
      .all();

    const existingNames = new Set(existingTags.map((tagRecord) => tagRecord.name));
    const missingNames = nextTags.filter((tagName) => !existingNames.has(tagName));

    if (missingNames.length > 0) {
      database
        .insert(tags)
        .values(
          missingNames.map((tagName) => ({
            id: randomUUID(),
            name: tagName,
            createdAt: now,
            updatedAt: now,
          })),
        )
        .run();
    }

    const tagRecords = database
      .select({ id: tags.id, name: tags.name })
      .from(tags)
      .where(inArray(tags.name, nextTags))
      .all();

    database
      .insert(noteTags)
      .values(
        tagRecords.map((tagRecord) => ({
          noteId,
          tagId: tagRecord.id,
          createdAt: now,
          updatedAt: now,
        })),
      )
      .run();
  }

  async function createNote(input: CreateNoteInput) {
    const parsed = createNoteSchema.parse(input);
    const noteId = randomUUID();
    const now = new Date();

    database
      .insert(notes)
      .values({
        id: noteId,
        title: parsed.title,
        rawInput: parsed.rawInput,
        summary: parsed.summary,
        problem: parsed.problem,
        solution: parsed.solution,
        why: parsed.why,
        commands: parsed.commands,
        references: parsed.references,
        stack: parsed.stack,
        status: parsed.status,
        confidence: parsed.confidence,
        sourceType: parsed.sourceType,
        sourceUrl: parsed.sourceUrl,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    await syncTags(noteId, parsed.tags);

    const created = await getNoteById(noteId);
    if (!created) {
      throw new Error("Failed to load note after creation");
    }

    return created;
  }

  async function getNoteById(id: string) {
    const record = database.select().from(notes).where(eq(notes.id, id)).get();
    if (!record) {
      return null;
    }

    const noteTagMap = await getNoteTags([id]);
    return mapNoteRecord(record, noteTagMap);
  }

  async function listNotes(input: NoteFiltersInput = {}) {
    const filters = noteFiltersSchema.parse(input);
    const conditions = [];

    if (filters.query) {
      conditions.push(buildQueryCondition(filters.query));
    }

    if (filters.status) {
      conditions.push(eq(notes.status, filters.status));
    }

    if (filters.stack) {
      conditions.push(eq(notes.stack, filters.stack));
    }

    if (filters.tag) {
      const matchingNoteIds = database
        .select({ noteId: noteTags.noteId })
        .from(noteTags)
        .innerJoin(tags, eq(noteTags.tagId, tags.id))
        .where(eq(tags.name, filters.tag))
        .all()
        .map((row) => row.noteId);

      if (matchingNoteIds.length === 0) {
        return [];
      }

      conditions.push(inArray(notes.id, matchingNoteIds));
    }

    const [primaryOrder, secondaryOrder] = noteOrderBy(filters);
    const records = database
      .select()
      .from(notes)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(primaryOrder, secondaryOrder)
      .limit(filters.limit)
      .all();

    const noteTagMap = await getNoteTags(records.map((record) => record.id));
    return records.map((record) => mapNoteRecord(record, noteTagMap));
  }

  async function listFilterOptions(): Promise<NoteFilterOptions> {
    const [tagRows, stackRows] = await Promise.all([
      database.select({ name: tags.name }).from(tags).orderBy(asc(tags.name)).all(),
      database
        .selectDistinct({ stack: notes.stack })
        .from(notes)
        .where(isNotNull(notes.stack))
        .orderBy(asc(notes.stack))
        .all(),
    ]);

    return {
      tags: tagRows.map((row) => row.name),
      stacks: stackRows.flatMap((row) => (row.stack ? [row.stack] : [])),
    };
  }

  async function getDashboardOverview(limit = 5): Promise<NoteDashboardOverview> {
    const [totalRow, inboxRow, digestedRow, recentNotes] = await Promise.all([
      database.select({ value: count() }).from(notes).get(),
      database
        .select({ value: count() })
        .from(notes)
        .where(eq(notes.status, "inbox"))
        .get(),
      database
        .select({ value: count() })
        .from(notes)
        .where(eq(notes.status, "digested"))
        .get(),
      listRecentNotes(limit),
    ]);

    return {
      totalNotes: totalRow?.value ?? 0,
      inboxCount: inboxRow?.value ?? 0,
      digestedCount: digestedRow?.value ?? 0,
      recentNotes,
    };
  }

  async function updateNote(id: string, input: UpdateNoteInput) {
    const existing = database.select().from(notes).where(eq(notes.id, id)).get();
    if (!existing) {
      return null;
    }

    const parsed = updateNoteSchema.parse(input);
    const notePatch: Partial<typeof notes.$inferInsert> = {};

    const assignIfPresent = <K extends keyof UpdateNoteValues>(key: K, targetKey: keyof typeof notes.$inferInsert) => {
      const value = parsed[key];
      if (value !== undefined) {
        notePatch[targetKey] = value as never;
      }
    };

    assignIfPresent("title", "title");
    assignIfPresent("rawInput", "rawInput");
    assignIfPresent("summary", "summary");
    assignIfPresent("problem", "problem");
    assignIfPresent("solution", "solution");
    assignIfPresent("why", "why");
    assignIfPresent("commands", "commands");
    assignIfPresent("references", "references");
    assignIfPresent("stack", "stack");
    assignIfPresent("status", "status");
    assignIfPresent("confidence", "confidence");
    assignIfPresent("sourceType", "sourceType");
    assignIfPresent("sourceUrl", "sourceUrl");

    const shouldUpdateRow = Object.keys(notePatch).length > 0 || parsed.tags !== undefined;
    if (!shouldUpdateRow) {
      return getNoteById(id);
    }

    notePatch.updatedAt = new Date();
    database.update(notes).set(notePatch).where(eq(notes.id, id)).run();

    if (parsed.tags !== undefined) {
      await syncTags(id, parsed.tags);
    }

    return getNoteById(id);
  }

  async function deleteNote(id: string) {
    const result = database.delete(notes).where(eq(notes.id, id)).run();
    return result.changes > 0;
  }

  async function listRecentNotes(limit = 5) {
    return listNotes({ limit, sort: "updatedAtDesc" });
  }

  return {
    createNote,
    getNoteById,
    listNotes,
    listFilterOptions,
    updateNote,
    deleteNote,
    listRecentNotes,
    getDashboardOverview,
  };
}

export const noteService = createNoteService();
