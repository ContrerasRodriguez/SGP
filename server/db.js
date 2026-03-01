import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "sgp.db");
const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

export const db = new Database(DB_PATH);

export function initDb() {
  // 1) asegura tabla migrations
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `);

  // 2) lista archivos .sql ordenados
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  // 3) aplica solo los no aplicados
  const applied = new Set(
    db.prepare("SELECT filename FROM migrations").all().map((r) => r.filename)
  );

  for (const file of files) {
    if (applied.has(file)) continue;

    const fullPath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(fullPath, "utf-8");

    const tx = db.transaction(() => {
      db.exec(sql);
      db.prepare(
        "INSERT INTO migrations (filename, applied_at) VALUES (?, ?)"
      ).run(file, new Date().toISOString());
    });

    tx();
    console.log(`✅ Migración aplicada: ${file}`);
  }
}
