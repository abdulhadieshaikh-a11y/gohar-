// Creates an admin account, or resets an existing account's password.
// There is no public sign-up and no default password anywhere in the code.
//
//   npm run admin:create -- --email you@gohargoc.com --name "Your Name" [--role admin|editor]
//
// The password is typed in hidden. For non-interactive use (CI), set
// ADMIN_PASSWORD in the environment for the single command instead.
import { randomBytes, randomUUID, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { loadEnv, openDatabase, redact } from "./lib/db.mjs";

const scrypt = promisify(scryptCb);
const N = 2 ** 15, R = 8, P = 1, KEYLEN = 64;

async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, KEYLEN, { N, r: R, p: P, maxmem: 128 * N * R * 2 });
  return ["scrypt", N, R, P, salt.toString("base64url"), hash.toString("base64url")].join("$");
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) return reject(new Error("No terminal available. Set ADMIN_PASSWORD instead."));
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    let value = "";
    const onData = (ch) => {
      if (ch === "\r" || ch === "\n" || ch === "\u0004") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.off("data", onData);
        process.stdout.write("\n");
        resolve(value);
      } else if (ch === "\u0003") {
        process.stdout.write("\n");
        process.exit(130);
      } else if (ch === "\u007f" || ch === "\b") {
        value = value.slice(0, -1);
      } else {
        value += ch;
      }
    };
    process.stdin.on("data", onData);
  });
}

function passwordProblem(p) {
  if (p.length < 12) return "Password must be at least 12 characters.";
  if (p.length > 200) return "Password must be 200 characters or fewer.";
  if (/^(.)\1+$/.test(p)) return "Password must not be a single repeated character.";
  return null;
}

loadEnv();

const email = arg("email")?.trim().toLowerCase();
const name = arg("name")?.trim();
const role = (arg("role") ?? "admin").trim();

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || !["admin", "editor"].includes(role)) {
  console.error('Usage: npm run admin:create -- --email you@example.com --name "Full Name" [--role admin|editor]');
  process.exit(1);
}

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  password = await readHidden("Password (min 12 characters): ");
  const again = await readHidden("Repeat password: ");
  if (password !== again) {
    console.error("Passwords do not match.");
    process.exit(1);
  }
}
const problem = passwordProblem(password);
if (problem) {
  console.error(problem);
  process.exit(1);
}

const db = openDatabase();
try {
  const existing = await db.query("SELECT id FROM admin_users WHERE email = ?", [email]);
  const hash = await hashPassword(password);
  if (existing.length) {
    await db.run("UPDATE admin_users SET password_hash = ?, name = ?, role = ?, disabled = 0 WHERE email = ?", [hash, name, role, email]);
    await db.run("DELETE FROM admin_sessions WHERE user_id = ?", [existing[0].id]);
    console.log(`Updated ${email} (${role}); existing sessions signed out.`);
  } else {
    await db.run(
      "INSERT INTO admin_users (id, email, name, role, password_hash, disabled, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)",
      [randomUUID(), email, name, role, hash, Date.now()],
    );
    console.log(`Created ${role} account for ${email} in ${redact(db.url)}.`);
  }
  console.log("Sign in at /admin/login");
} catch (error) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(/no such table/i.test(msg) ? "Tables missing: run `npm run db:migrate` first." : msg);
  process.exitCode = 1;
} finally {
  db.close();
}
