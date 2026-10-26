// Adds a few clearly labelled SAMPLE enquiries so the admin dashboard can be
// explored locally. Refuses to run in production. Re-running is safe.
//   npm run db:seed          add samples
//   npm run db:seed -- --clear   remove samples
import { randomUUID } from "node:crypto";
import { loadEnv, openDatabase } from "./lib/db.mjs";

loadEnv();
if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed sample data in production.");
  process.exit(1);
}

const db = openDatabase();
const clear = process.argv.includes("--clear");

try {
  await db.run("DELETE FROM enquiries WHERE submission_id LIKE 'dev-sample-%'");
  if (clear) {
    console.log("Removed sample enquiries.");
  } else {
    const samples = [
      ["sales", "gohar-golf-vista", "new", "Karachi", "I'd like the payment plan for a 4-bedroom apartment."],
      ["site-visit", "gohar-residencia-shopping-mall", "contacted", "Karachi", "Can we visit the site this Saturday afternoon?"],
      ["general", null, "in_progress", "Overseas", "I live abroad. How can I book a unit remotely?"],
      ["sales", "gohar-green-corner-shopping-center", "closed", "Hyderabad", "Looking for a ground-floor shop."],
      ["other", null, "spam", null, "This is a sample spam message for testing filters."],
    ];
    const now = Date.now();
    for (const [i, [type, project, status, city, message]] of samples.entries()) {
      const t = now - i * 36e5 * 7;
      await db.run(
        `INSERT INTO enquiries (id, reference, submission_id, enquiry_type, name, email, phone, city, project_slug, message,
          source_path, consent_at, status, email_status, email_error, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'skipped', 'Sample data', ?, ?)`,
        [
          randomUUID(),
          `GGC-SAMPL${i + 1}`,
          `dev-sample-${i + 1}`,
          type,
          `Sample Customer ${i + 1} (development data)`,
          `sample${i + 1}@example.com`,
          `+92300000000${i}`,
          city,
          project,
          `[SAMPLE] ${message}`,
          "/contact",
          t,
          status,
          t,
          t,
        ],
      );
    }
    console.log(`Inserted ${samples.length} sample enquiries (names end with "(development data)").`);
  }
} catch (error) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(/no such table/i.test(msg) ? "Tables missing: run `npm run db:migrate` first." : msg);
  process.exitCode = 1;
} finally {
  db.close();
}
