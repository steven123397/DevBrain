import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import { seedDemoKnowledgeData } from "../../src/db/demo-seed";

const databaseFilePath = path.resolve(
  process.cwd(),
  process.env.DEVBRAIN_DB_FILE ?? path.join("data", "devbrain.sqlite"),
);

fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });
if (fs.existsSync(databaseFilePath)) {
  fs.unlinkSync(databaseFilePath);
}

const sqlite = new Database(databaseFilePath);
sqlite.pragma("foreign_keys = ON");

seedDemoKnowledgeData(sqlite);
sqlite.close();
