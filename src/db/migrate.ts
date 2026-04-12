import { databaseFilePath, sqlite } from "./client";
import { runSqliteMigrations } from "./migrate.shared";

runSqliteMigrations(sqlite);

console.log(`Applied migrations to ${databaseFilePath}`);

sqlite.close();
