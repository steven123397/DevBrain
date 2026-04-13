import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import { resolveDatabaseFilePath } from "./database-path";
import { seedDemoKnowledgeData } from "./demo-seed";
import { assertSafeSeedTarget } from "./seed.shared";

function isTruthyFlag(value: string | undefined) {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes"].includes(value.trim().toLowerCase());
}

const databaseTarget = resolveDatabaseFilePath();

assertSafeSeedTarget({
  databaseFilePath: databaseTarget.databaseFilePath,
  usesDefaultPath: databaseTarget.usesDefaultPath,
  allowDefaultReset: isTruthyFlag(process.env.DEVBRAIN_ALLOW_DEFAULT_DB_RESET),
});

const databaseFilePath = databaseTarget.databaseFilePath;

fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });
if (fs.existsSync(databaseFilePath)) {
  fs.unlinkSync(databaseFilePath);
}

const sqlite = new Database(databaseFilePath);
sqlite.pragma("foreign_keys = ON");

seedDemoKnowledgeData(sqlite);

console.log(`Seeded demo notes into ${databaseFilePath}`);

sqlite.close();
