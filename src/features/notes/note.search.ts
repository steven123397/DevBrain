import { sql } from "drizzle-orm";

import { notes } from "@/db/schema";

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
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
