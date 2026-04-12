import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import { seedDemoKnowledgeData } from "./demo-seed";

function resolveDatabaseFilePath() {
  const configuredPath = process.env.DEVBRAIN_DB_FILE?.trim();
  if (configuredPath) {
    return path.resolve(process.cwd(), configuredPath);
  }

  return path.join(process.cwd(), "data", "devbrain.sqlite");
}

const databaseFilePath = resolveDatabaseFilePath();

fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });
if (fs.existsSync(databaseFilePath)) {
  fs.unlinkSync(databaseFilePath);
}

const sqlite = new Database(databaseFilePath);
sqlite.pragma("foreign_keys = ON");

seedDemoKnowledgeData(sqlite);

console.log(`Seeded demo notes into ${databaseFilePath}`);

sqlite.close();
