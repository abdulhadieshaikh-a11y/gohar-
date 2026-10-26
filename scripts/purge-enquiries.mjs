// Retention clean-up (see the Privacy Policy):
//  - deletes enquiries and site visit requests older than ENQUIRY_RETENTION_DAYS (default 730 days)
//  - deletes enquiries marked "spam" after 30 days
//  - removes expired admin sessions and old rate-limit rows
// Run on a schedule (for example daily via cron / Task Scheduler):
//   npm run enquiries:purge            (use --dry-run to preview)
import { loadEnv, openDatabase } from "./lib/db.mjs";

loadEnv();
const dry = process.argv.includes("--dry-run");
const days = Number(process.env.ENQUIRY_RETENTION_DAYS ?? 730) || 730;
const now = Date.now();
const cutoff = now - days * 864e5;
const spamCutoff = now - 30 * 864e5;

const db = openDatabase();
try {
  const [{ n: old }] = await db.query("SELECT COUNT(*) AS n FROM enquiries WHERE updated_at < ?", [cutoff]);
  const [{ n: spam }] = await db.query("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'spam' AND updated_at < ?", [spamCutoff]);
  console.log(`${old} enquiries older than ${days} days; ${spam} spam enquiries older than 30 days.`);
  if (!dry) {
    await db.run("DELETE FROM enquiries WHERE updated_at < ?", [cutoff]);
    await db.run("DELETE FROM enquiries WHERE status = 'spam' AND updated_at < ?", [spamCutoff]);
    // Careers applications (and their CVs) are kept for CAREER_RETENTION_DAYS (default 365).
    const careerDays = Number(process.env.CAREER_RETENTION_DAYS ?? 365) || 365;
    const careerCutoff = now - careerDays * 864e5;
    await db.run("DELETE FROM career_cvs WHERE application_id IN (SELECT id FROM career_applications WHERE updated_at < ?)", [careerCutoff]);
    await db.run("DELETE FROM career_applications WHERE updated_at < ?", [careerCutoff]);
    // Site visit requests follow the enquiry retention period.
    await db.run("DELETE FROM site_visits WHERE updated_at < ?", [cutoff]);
    await db.run("DELETE FROM admin_sessions WHERE expires_at < ?", [now]);
    await db.run("DELETE FROM rate_limits WHERE window_start < ?", [now - 864e5]);
    console.log("Purge complete.");
  } else {
    console.log("Dry run: nothing deleted.");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  db.close();
}
