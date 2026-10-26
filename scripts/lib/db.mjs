// Shared helpers for the Node maintenance scripts (plain ESM, no build step).
// Uses the same native-free drivers as lib/db/index.ts.
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createClient } from "@libsql/client/web";

export const ROOT = path.resolve(import.meta.dirname, "..", "..");

/** Loads .env.local then .env (values already set win), like Next.js does. */
export function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const full = path.join(ROOT, file);
    if (existsSync(full)) process.loadEnvFile(full);
  }
}

/** Mirrors lib/env.ts: the local dev file is only used outside production. */
export function resolveDatabase() {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return { url, authToken: process.env.DATABASE_AUTH_TOKEN?.trim() || undefined };
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is not set. Refusing to guess a production database.");
  }
  return { url: "file:./.data/gohar-dev.db", authToken: undefined };
}

/**
 * Opens the configured database and returns a tiny async API:
 *   exec(sql)           – run one or more statements without parameters
 *   query(sql, args)    – returns rows as plain objects
 *   run(sql, args)      – runs one statement with parameters
 */
export function openDatabase() {
  process.chdir(ROOT);
  const { url, authToken } = resolveDatabase();

  if (url.startsWith("file:")) {
    const file = url.slice(5);
    mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
    const db = new DatabaseSync(file);
    db.exec("PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
    return {
      url,
      exec: async (sql) => db.exec(sql),
      query: async (sql, args = []) => db.prepare(sql).all(...args),
      run: async (sql, args = []) => db.prepare(sql).run(...args),
      close: () => db.close(),
    };
  }

  const client = createClient({ url, authToken });
  return {
    url,
    exec: async (sql) => client.executeMultiple(sql),
    query: async (sql, args = []) => {
      const rs = await client.execute({ sql, args });
      return rs.rows.map((r) => Object.fromEntries(rs.columns.map((c, i) => [c, r[i]])));
    },
    run: async (sql, args = []) => client.execute({ sql, args }),
    close: () => client.close(),
  };
}

export function redact(url) {
  return url.replace(/\/\/[^@]*@/, "//***@").replace(/authToken=[^&]+/, "authToken=***");
}
