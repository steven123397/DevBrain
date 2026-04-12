import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";

function ensureKnowledgeSchema(sqlite: Database.Database) {
  const notesTable = sqlite
    .prepare(
      "select name from sqlite_master where type = 'table' and name = 'notes'",
    )
    .get();

  if (notesTable) {
    return;
  }

  const migrationSql = fs.readFileSync(
    path.join(process.cwd(), "src/db/migrations/0000_dapper_franklin_storm.sql"),
    "utf8",
  );

  sqlite.exec(migrationSql);
}

export function clearKnowledgeData(sqlite: Database.Database) {
  ensureKnowledgeSchema(sqlite);
  sqlite.exec(`
    delete from note_tags;
    delete from tags;
    delete from notes;
  `);
}

export function seedDemoKnowledgeData(sqlite: Database.Database) {
  clearKnowledgeData(sqlite);

  sqlite.exec(`
    insert into notes (
      id, title, raw_input, summary, stack, status, confidence, source_type, created_at, updated_at
    ) values
      (
        'note-1',
        'hydration mismatch',
        'SSR warning after reading window',
        'Move browser-only logic into useEffect.',
        'Next.js',
        'digested',
        'tested',
        'manual',
        1712916000000,
        1712919600000
      ),
      (
        'note-2',
        'pnpm peer dep fix',
        'used overrides for workspace alignment',
        null,
        'Tooling',
        'inbox',
        'draft',
        'manual',
        1712912400000,
        1712917800000
      ),
      (
        'note-3',
        'next.js hydration guard',
        'client mismatch after reading browser globals',
        'Wrap browser-only access in useEffect and a mounted guard.',
        'Next.js',
        'digested',
        'tested',
        'manual',
        1712914200000,
        1712920200000
      );

    insert into tags (id, name, created_at, updated_at) values
      ('tag-1', 'nextjs', 1712916000000, 1712916000000),
      ('tag-2', 'react', 1712916000000, 1712916000000),
      ('tag-3', 'pnpm', 1712912400000, 1712912400000),
      ('tag-4', 'hydration', 1712914200000, 1712914200000);

    insert into note_tags (note_id, tag_id, created_at, updated_at) values
      ('note-1', 'tag-1', 1712916000000, 1712916000000),
      ('note-1', 'tag-2', 1712916000000, 1712916000000),
      ('note-2', 'tag-3', 1712912400000, 1712912400000),
      ('note-3', 'tag-1', 1712914200000, 1712914200000),
      ('note-3', 'tag-2', 1712914200000, 1712914200000),
      ('note-3', 'tag-4', 1712914200000, 1712914200000);
  `);
}
