import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

function resolveDatabaseFilePath() {
  const configuredPath = process.env.DEVBRAIN_DB_FILE?.trim();
  if (configuredPath) {
    return path.resolve(process.cwd(), configuredPath);
  }

  return path.join(process.cwd(), "data", "devbrain.sqlite");
}

export const databaseFilePath = resolveDatabaseFilePath();

fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });

export const sqlite = new Database(databaseFilePath);
sqlite.pragma("foreign_keys = ON");
export const db = drizzle(sqlite, { schema });
