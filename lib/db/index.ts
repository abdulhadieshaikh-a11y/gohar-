import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createClient } from "@libsql/client/web";
import { drizzle, type SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import { getDatabaseConfig } from "@/lib/env";
import * as schema from "./schema";

/**
 * Database access without native add-ons, so the project runs on any machine
 * with Node.js 24 (no Visual C++ runtime or compiler needed):
 *
 *  - `file:` URLs → Node's built-in SQLite (`node:sqlite`). Local development
 *    and single-server deployments with a persistent disk.
 *  - `libsql://` / `https://` URLs → libSQL over HTTP (e.g. Turso). Managed,
 *    persistent, works on serverless platforms.
 *
 * Both go through Drizzle's sqlite-proxy driver, so queries are identical.
 */

export type Database = SqliteRemoteDatabase<typeof schema>;
type Method = "run" | "all" | "values" | "get";
// Rows are positional value arrays, as Drizzle's proxy driver expects.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rows = any[];
type Executor = (sql: string, params: unknown[], method: Method) => Promise<{ rows: Rows }>;

export class DatabaseNotConfiguredError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "DatabaseNotConfiguredError";
  }
}

type SqlValue = string | number | bigint | null | Uint8Array;
function toSqlParams(params: unknown[]): SqlValue[] {
  return params.map((p) => {
    if (p === undefined || p === null) return null;
    if (typeof p === "boolean") return p ? 1 : 0;
    if (p instanceof Date) return p.getTime();
    return p as SqlValue;
  });
}

export function createNodeSqliteExecutor(filename: string): Executor {
  if (filename !== ":memory:") mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });
  const sqlite = new DatabaseSync(filename);
  sqlite.exec("PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;");
  if (filename !== ":memory:") sqlite.exec("PRAGMA journal_mode = WAL;");

  return async (sql, params, method) => {
    const stmt = sqlite.prepare(sql);
    const args = toSqlParams(params);
    if (method === "run") {
      stmt.run(...args);
      return { rows: [] };
    }
    stmt.setReturnArrays(true);
    if (method === "get") return { rows: stmt.get(...args) as unknown as Rows };
    return { rows: stmt.all(...args) as unknown as Rows };
  };
}

function createLibsqlHttpExecutor(url: string, authToken?: string): Executor {
  const client = createClient({ url, authToken });
  return async (sql, params, method) => {
    const result = await client.execute({ sql, args: toSqlParams(params) as never });
    const rows = result.rows.map((row) => result.columns.map((_, i) => row[i]));
    return { rows: (method === "get" ? rows[0] : rows) as Rows };
  };
}

export function createDatabase(executor: Executor): Database {
  return drizzle(executor, { schema });
}

const globalForDb = globalThis as unknown as { __goharDb?: { db: Database; url: string } };

/**
 * Returns the database, connecting on first use. Throws
 * DatabaseNotConfiguredError when no database is configured, so callers can
 * respond honestly ("not saved") instead of pretending.
 */
export function getDb(): Database {
  const config = getDatabaseConfig();
  if (!config.ok) throw new DatabaseNotConfiguredError(config.reason);

  const cached = globalForDb.__goharDb;
  if (cached && cached.url === config.url) return cached.db;

  const executor = config.url.startsWith("file:")
    ? createNodeSqliteExecutor(config.url.slice("file:".length))
    : createLibsqlHttpExecutor(config.url, config.authToken);

  const db = createDatabase(executor);
  globalForDb.__goharDb = { db, url: config.url };
  return db;
}

/** True when the error means the tables don't exist yet (migrations not run). */
export function isMissingTableError(error: unknown): boolean {
  const text = error instanceof Error ? `${error.message} ${String(error.cause ?? "")}` : String(error);
  return /no such table/i.test(text);
}

export { schema };
