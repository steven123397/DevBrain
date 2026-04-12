import { databaseFilePath, sqlite } from "./client";
import { seedDemoKnowledgeData } from "./demo-seed";

seedDemoKnowledgeData(sqlite);

console.log(`Seeded demo notes into ${databaseFilePath}`);

sqlite.close();
