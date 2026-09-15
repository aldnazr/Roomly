// src/db.ts
import { Database } from "bun:sqlite";
import { mkdirSync } from "fs";

mkdirSync("data", { recursive: true });
const db = new Database("data/database.db", { create: true });
db.run("PRAGMA journal_mode = WAL;");

export default db;
