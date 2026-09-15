// src/db.ts
import { Database } from "bun:sqlite";

const db = new Database("app.db", { create: true });
db.run("PRAGMA journal_mode = WAL;");

export default db;
