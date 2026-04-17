import type Database from "better-sqlite3";

import { runSqliteMigrations } from "./migrate.shared";

export function clearKnowledgeData(sqlite: Database.Database) {
  runSqliteMigrations(sqlite);
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
      id, title, raw_input, summary, problem, solution, why, commands, \`references\`, stack, status, confidence, source_type, created_at, updated_at
    ) values
      (
        'note-1',
        'hydration mismatch',
        'SSR warning after reading window',
        'Move browser-only logic into useEffect.',
        'Server and client rendered different markup during hydration.',
        'Delay browser-only reads until the client has mounted.',
        null,
        null,
        null,
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
        null,
        null,
        null,
        null,
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
        'Browser globals changed the initial render output.',
        'Guard browser-only branches until hydration finishes.',
        null,
        null,
        null,
        'Next.js',
        'digested',
        'tested',
        'manual',
        1712914200000,
        1712920200000
      ),
      (
        'note-4',
        'validation db target safety',
        'Avoid seed or migrate falling back to 默认主库.',
        'Database review should always stay on validation db.',
        'The demo db and 默认主库 are easy to confuse during review.',
        'Set DEVBRAIN_DB_FILE before seed or migration commands.',
        'This keeps local database operations on the validation db until review is done.',
        'DEVBRAIN_DB_FILE=data/validation.sqlite pnpm seed',
        'validation db / demo db / 默认主库',
        'SQLite',
        'digested',
        'trusted',
        'manual',
        1712919600000,
        1712920800000
      ),
      (
        'note-5',
        'db:migrate target validation db',
        'Run db:migrate against validation db before touching real data.',
        'Migrations should first land on validation db.',
        'db:migrate can point at the wrong database file.',
        'Export DEVBRAIN_DB_FILE before db:migrate.',
        'The same validation db path should guard both seed and migrate flows.',
        'DEVBRAIN_DB_FILE=data/validation.sqlite pnpm db:migrate',
        'validation db / migration review',
        'SQLite',
        'digested',
        'tested',
        'manual',
        1712921400000,
        1712922600000
      );

    insert into tags (id, name, created_at, updated_at) values
      ('tag-1', 'nextjs', 1712916000000, 1712916000000),
      ('tag-2', 'react', 1712916000000, 1712916000000),
      ('tag-3', 'pnpm', 1712912400000, 1712912400000),
      ('tag-4', 'hydration', 1712914200000, 1712914200000),
      ('tag-5', 'database', 1712919600000, 1712919600000),
      ('tag-6', 'sqlite', 1712919600000, 1712919600000);

    insert into note_tags (note_id, tag_id, created_at, updated_at) values
      ('note-1', 'tag-1', 1712916000000, 1712916000000),
      ('note-1', 'tag-2', 1712916000000, 1712916000000),
      ('note-2', 'tag-3', 1712912400000, 1712912400000),
      ('note-3', 'tag-1', 1712914200000, 1712914200000),
      ('note-3', 'tag-2', 1712914200000, 1712914200000),
      ('note-3', 'tag-4', 1712914200000, 1712914200000),
      ('note-4', 'tag-5', 1712919600000, 1712919600000),
      ('note-4', 'tag-6', 1712919600000, 1712919600000),
      ('note-5', 'tag-5', 1712921400000, 1712921400000),
      ('note-5', 'tag-6', 1712921400000, 1712921400000);
  `);
}
