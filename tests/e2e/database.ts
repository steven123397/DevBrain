import path from "node:path";

import Database from "better-sqlite3";

import {
  clearKnowledgeData,
  seedDemoKnowledgeData,
} from "../../src/db/demo-seed";

function resolveDatabaseFilePath() {
  const configuredPath = process.env.DEVBRAIN_DB_FILE?.trim();
  if (configuredPath) {
    return path.resolve(process.cwd(), configuredPath);
  }

  return path.join(process.cwd(), "data", "e2e-dashboard.sqlite");
}

function openDatabase() {
  const sqlite = new Database(resolveDatabaseFilePath());
  sqlite.pragma("foreign_keys = ON");
  return sqlite;
}

function clearDatabase(sqlite: Database.Database) {
  clearKnowledgeData(sqlite);
}

export function resetEmptyDatabase() {
  const sqlite = openDatabase();

  try {
    clearDatabase(sqlite);
  } finally {
    sqlite.close();
  }
}

export function resetSeededDatabase() {
  const sqlite = openDatabase();

  try {
    seedDemoKnowledgeData(sqlite);
  } finally {
    sqlite.close();
  }
}
