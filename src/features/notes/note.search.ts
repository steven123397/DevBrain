import { sql } from "drizzle-orm";

import { notes } from "@/db/schema";

import { normalizeSearchText, normalizeStackName } from "./note.normalization";
import type { KnowledgeNote } from "./note.types";

function normalizeQuery(query: string) {
  return normalizeSearchText(query);
}

function tokenizeQuery(query: string) {
  return Array.from(
    new Set(normalizeQuery(query).match(/[a-z0-9][a-z0-9.+#/-]*/g) ?? []),
  );
}

function scoreTextMatch(
  value: string | null,
  query: string,
  phraseWeight: number,
  tokenWeight: number,
) {
  if (!value) {
    return 0;
  }

  const normalizedValue = normalizeSearchText(value);
  let score = 0;

  if (normalizedValue.includes(query)) {
    score += phraseWeight;
  }

  for (const token of tokenizeQuery(query)) {
    if (token.length > 1 && normalizedValue.includes(token)) {
      score += tokenWeight;
    }
  }

  return score;
}

export function buildNoteSearchCondition(query: string) {
  const normalized = normalizeQuery(query);
  const pattern = `%${normalized}%`;

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

export function scoreNoteSearch(note: KnowledgeNote, rawQuery: string) {
  const query = normalizeQuery(rawQuery);
  if (!query) {
    return 0;
  }

  let score = 0;

  score += scoreTextMatch(note.title, query, 140, 30);
  score += scoreTextMatch(note.summary, query, 90, 20);
  score += scoreTextMatch(note.problem, query, 85, 18);
  score += scoreTextMatch(note.solution, query, 85, 18);
  score += scoreTextMatch(note.why, query, 70, 14);
  score += scoreTextMatch(note.rawInput, query, 55, 12);
  score += scoreTextMatch(note.commands, query, 45, 10);
  score += scoreTextMatch(note.references, query, 35, 8);

  for (const tag of note.tags) {
    if (normalizeSearchText(tag).includes(query)) {
      score += 28;
    }
  }

  if (note.stack && normalizeSearchText(normalizeStackName(note.stack)).includes(query)) {
    score += 24;
  }

  return score;
}
