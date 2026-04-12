import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

const databaseFilePath = path.resolve(
  process.cwd(),
  process.env.DEVBRAIN_DB_FILE ?? path.join("data", "devbrain.sqlite"),
);
const migrationFilePath = path.join(
  process.cwd(),
  "src",
  "db",
  "migrations",
  "0000_dapper_franklin_storm.sql",
);

fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });
if (fs.existsSync(databaseFilePath)) {
  fs.unlinkSync(databaseFilePath);
}

const sqlite = new Database(databaseFilePath);
const migrationSql = fs.readFileSync(migrationFilePath, "utf8");

sqlite.pragma("foreign_keys = ON");
sqlite.exec(migrationSql);

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
    );

  insert into tags (id, name, created_at, updated_at) values
    ('tag-1', 'nextjs', 1712916000000, 1712916000000),
    ('tag-2', 'react', 1712916000000, 1712916000000),
    ('tag-3', 'pnpm', 1712912400000, 1712912400000);

  insert into note_tags (note_id, tag_id, created_at, updated_at) values
    ('note-1', 'tag-1', 1712916000000, 1712916000000),
    ('note-1', 'tag-2', 1712916000000, 1712916000000),
    ('note-2', 'tag-3', 1712912400000, 1712912400000);
`);

sqlite.close();
