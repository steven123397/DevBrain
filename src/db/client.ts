import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";
import { resolveDatabaseFilePath } from "./database-path";

export const databaseFilePath = resolveDatabaseFilePath().databaseFilePath;

fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });

export const sqlite = new Database(databaseFilePath);
sqlite.pragma("foreign_keys = ON");
export const db = drizzle(sqlite, { schema });
