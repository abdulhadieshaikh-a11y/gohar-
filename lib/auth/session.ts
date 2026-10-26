import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getDb } from "@/lib/db";
import { adminSessions, adminUsers, type AdminRole } from "@/lib/db/schema";
import { isProduction } from "@/lib/env";

/**
 * Admin sessions: a random 256-bit token in an HttpOnly cookie; only its
 * SHA-256 hash is stored in the database, so a database leak does not leak
 * usable sessions. Sessions expire after SESSION_TTL and can be revoked by
 * deleting the row (logout, disabling a user).
 */

export const SESSION_COOKIE = "gohar_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_TTL_MS);
  const db = getDb();
  await db.insert(adminSessions).values({ id: hashToken(token), userId, expiresAt, createdAt: new Date(now) });
  // Opportunistic cleanup of expired sessions.
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date(now)));

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await getDb().delete(adminSessions).where(eq(adminSessions.id, hashToken(token)));
    } catch {
      // Cookie is removed below regardless.
    }
  }
  store.delete(SESSION_COOKIE);
}

/** Returns the signed-in admin, or null. Never trusts anything but the database. */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  await connection(); // always evaluated per request, never prerendered
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  try {
    const row = await getDb()
      .select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name, role: adminUsers.role })
      .from(adminSessions)
      .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
      .where(
        and(
          eq(adminSessions.id, hashToken(token)),
          gt(adminSessions.expiresAt, new Date()),
          eq(adminUsers.disabled, false),
        ),
      )
      .get();
    return row ?? null;
  } catch {
    return null;
  }
}

/**
 * Guard for every admin page and server action. Redirects to the login page
 * when there is no valid session, and to the dashboard when the role is
 * insufficient.
 */
export async function requireAdmin(role?: AdminRole): Promise<AdminUser> {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  if (role === "admin" && user.role !== "admin") redirect("/admin?denied=1");
  return user;
}
