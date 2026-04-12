import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

export const databaseFilePath = path.join(process.cwd(), "data", "devbrain.sqlite");

fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });

export const sqlite = new Database(databaseFilePath);
export const db = drizzle(sqlite, { schema });
