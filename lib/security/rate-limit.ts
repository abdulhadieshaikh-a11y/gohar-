import "server-only";
import { sql } from "drizzle-orm";
import type { Database } from "@/lib/db";

/**
 * Fixed-window rate limiter stored in the database, so limits hold across
 * server instances (an in-memory counter would reset per serverless instance).
 * The increment is a single atomic UPSERT.
 */
export async function consumeRateLimit(
  db: Database,
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const cutoff = now - windowMs;
  const rows = await db.all<{ count: number; window_start: number }>(sql`
    INSERT INTO rate_limits (key, count, window_start) VALUES (${key}, 1, ${now})
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start <= ${cutoff} THEN 1 ELSE rate_limits.count + 1 END,
      window_start = CASE WHEN rate_limits.window_start <= ${cutoff} THEN ${now} ELSE rate_limits.window_start END
    RETURNING count, window_start
  `);
  const row = normalizeRow(rows[0]);
  const count = row?.count ?? 1;
  const windowStart = row?.window_start ?? now;
  const allowed = count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000)),
  };
}

/** Clears a key, e.g. after a successful login. */
export async function resetRateLimit(db: Database, key: string): Promise<void> {
  await db.run(sql`DELETE FROM rate_limits WHERE key = ${key}`);
}

// sqlite-proxy returns raw rows as arrays for db.all(); accept both shapes.
function normalizeRow(row: unknown): { count: number; window_start: number } | undefined {
  if (!row) return undefined;
  if (Array.isArray(row)) return { count: Number(row[0]), window_start: Number(row[1]) };
  const r = row as { count: unknown; window_start: unknown };
  return { count: Number(r.count), window_start: Number(r.window_start) };
}
