import { defineConfig } from "drizzle-kit";

// Used by `npm run db:generate` to create SQL migrations from lib/db/schema.ts.
export default defineConfig({
  dialect: "sqlite",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "file:./.data/gohar-dev.db" },
});
