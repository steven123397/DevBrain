import path from "node:path";

import type Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";

export function runSqliteMigrations(sqlite: Database.Database) {
  const database = drizzle(sqlite, { schema });

  migrate(database, {
    migrationsFolder: path.join(process.cwd(), "src/db/migrations"),
  });
}
