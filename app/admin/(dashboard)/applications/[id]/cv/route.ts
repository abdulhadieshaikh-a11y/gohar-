import { eq } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { careerApplications, careerCvs } from "@/lib/db/schema";

/**
 * GET /admin/applications/:id/cv: downloads a CV. Signed-in staff only.
 * Always served as an attachment with a fixed, verified content type.
 */
export async function GET(_request: Request, { params }: RouteContext<"/admin/applications/[id]/cv">) {
  const user = await getCurrentAdmin();
  if (!user) return new Response("Not signed in", { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  const db = getDb();
  const app = await db
    .select({ filename: careerApplications.cvFilename, mime: careerApplications.cvMime })
    .from(careerApplications)
    .where(eq(careerApplications.id, id))
    .get();
  const file = await db.select().from(careerCvs).where(eq(careerCvs.applicationId, id)).get();
  if (!app || !file) return new Response("Not found", { status: 404 });

  const bytes = Buffer.from(file.dataBase64, "base64");
  return new Response(bytes, {
    headers: {
      "Content-Type": app.mime,
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `attachment; filename="${app.filename.replace(/"/g, "")}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
