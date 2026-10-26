# Gohar Group of Companies: website

The website for Gohar Group of Companies:

- ten project pages and a searchable project directory;
- Gohar Stories (articles migrated from the official site);
- site visit requests, enquiries and careers applications;
- a secure admin dashboard.

Built with Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict), Tailwind CSS 4, Zod 4 and Drizzle ORM. Data is stored in SQLite locally, or in libSQL/Turso in production.

**Design system ("monumental modern").**
- **Colour:** obsidian (`ink` #0a0a0b) and bone (`ivory` #f3f2ef) with neutral greys. The `brass*` token names are kept for compatibility but are now greys. Gohar red, taken from the official logo (`gohar` #e72e34), is an accent only: dots, hairlines, the active nav indicator, progress bars and the hover fill of buttons.
- **Buttons:** `primary` (black, for light surfaces) and `solid-light` (white, for dark surfaces). Both sweep to red on hover.
- **Headlines:** two-tone. Accent words are a lighter tone, not italic.
- **Surfaces:** `.surface-red` (dark feature panel with a red glow), `.spotlight` (light that follows the pointer), `.corner-accent` (corner brackets on hover) and `.press` (pressed state on touch screens), all in `app/globals.css`.
- **Images:** `lib/image-plan.ts` picks each homepage and About image so the same photograph does not repeat in nearby sections. `npm run images:plan` writes the record to `docs/IMAGE-USAGE.md`.
- **Typography:** Archivo (variable, with a width axis) for headlines, set heavy and slightly extended. Inter for text and interface. Both are self-hosted at build time with `next/font`.
- **Tokens and type scale:** defined in `app/globals.css`.

**Motion** lives in `components/ui/motion.tsx`, one small client component:
- smooth scrolling ([Lenis](https://github.com/darkroomengineering/lenis), about 4 KB, desktop pointers only);
- scroll reveals on `data-reveal`: masked words, image clip-reveals, staggers and hairlines;
- parallax on `data-parallax`;
- a cursor label on `data-cursor`;
- magnetic buttons on `data-magnetic`.

Content is never hidden by CSS, so pages stay readable without JavaScript. Everything switches off for visitors who prefer reduced motion. Hero entrances are CSS-only (`hero-words`, `hero-fade`, `hero-clip`) and finish within about a second, so calls to action are visible straight away.

---

## 1. Requirements

- **Node.js 24 or newer** (24 LTS recommended). Check with `node -v`.
  The project uses Node's built-in SQLite, so there are **no native add-ons to compile** and you don't need the Visual C++ runtime or build tools.
- npm 10+ (comes with Node).

## 2. Quick start (Windows, macOS or Linux)

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

`npm run dev` creates the local database automatically (`.data/gohar-dev.db`) and applies migrations. You don't need a `.env` file, an email account or any paid service to run the site locally.

**Dev mode is slower than the real site.** In `npm run dev`, each page is compiled the first time you open it, so the first click on a page can take a few seconds. It takes much longer if the PC is low on memory, for example with two dev servers running.

The production build serves every public page as a pre-built static page: Home, About, Projects, Gohar Stories and its articles, Schedule a Site Visit, Contact, Careers and all ten project pages. Measured page-to-page clicks take about 0.1–0.5 s; the first visit to a new page type can take up to about 2 s on a busy PC.

**To show the site to a client, run the production build:**

```bash
npm run preview      # = npm run build, then npm start
```

Only run one copy of the site at a time. An older copy extracted elsewhere (for example from a ZIP into Downloads) runs old code.

Opening the dev server from a phone or another computer on your network (e.g. `http://192.168.x.x:3000`) is supported: `next.config.ts` allows this machine's LAN addresses, so pages stay interactive.

## 3. Environment variables

Copy the example file and edit it:

```bash
copy .env.example .env      # Windows
cp .env.example .env        # macOS / Linux
```

| Variable | Needed for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | production | Public URL, e.g. `https://gohargoc.com`. Used for canonical URLs, sitemap and social cards. |
| `DATABASE_URL` | production | `file:./.data/gohar.db` (one server with a persistent disk) or `libsql://…` (Turso / serverless). **Required in production**; the site won't pretend to save enquiries without it. |
| `DATABASE_AUTH_TOKEN` | libSQL | Token for a Turso database. |
| `EMAIL_PROVIDER` | optional | `none` (default), `smtp` or `resend`. |
| `EMAIL_FROM`, `ENQUIRY_NOTIFY_TO` | email | Sender, and comma-separated staff recipients. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | smtp | E.g. Google Workspace: `smtp.gmail.com`, `465`, `true`, `info@gohargoc.com`, an App Password. |
| `RESEND_API_KEY` | resend | The sender domain must be verified in Resend. |
| `IP_HASH_SALT` | recommended | Random secret used to hash visitor IPs for rate limiting. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `ENQUIRY_RETENTION_DAYS` | optional | Default 730. Used by `npm run enquiries:purge`. |
| `CAREER_RETENTION_DAYS` | optional | Default 365. Careers applications and CVs older than this are purged. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | optional | Defaults to the client-supplied number **+92 337 3723420** (`https://wa.me/923373723420`). Set another number (international format, digits only) to override it, or `none` to hide WhatsApp. It is used by the floating button, the project-page WhatsApp actions, the mobile action bar and the Contact card, with a pre-filled message (project-specific on project pages). Rebuild after changing it. |

Secrets stay on the server. Never commit `.env`.

## 4. Database

- **Local:** `npm run dev` runs `npm run db:migrate` first. To migrate manually: `npm run db:migrate`.
- **Sample data (development only):** `npm run db:seed` adds 5 enquiries clearly marked "(development data)". Remove them with `npm run db:seed -- --clear`. The seed script refuses to run in production.
- **Schema changes:** edit `lib/db/schema.ts`, then run `npm run db:generate` to create a migration in `drizzle/`, then `npm run db:migrate`.

**Production limits.** A SQLite *file* is durable only on a server with a persistent disk (a VPS, or a Windows/Linux server). On serverless hosts (Vercel, Netlify, AWS Lambda) the file system is temporary and not shared, so the app **refuses** a `file:` database there. Use a managed libSQL database (Turso): same schema, no code changes. Set `DATABASE_URL=libsql://…` and `DATABASE_AUTH_TOKEN`, then run `npm run db:migrate` once with those variables set.

To move to PostgreSQL instead, switch the Drizzle dialect (`sqliteTable` → `pgTable`, driver in `lib/db/index.ts`) and regenerate migrations. The queries themselves are dialect-neutral Drizzle.

## 5. Email notifications

New enquiries are **always saved first**. A staff notification is then sent in the background, and the result is recorded truthfully on each enquiry:

- `sent`: the provider accepted the message
- `skipped`: `EMAIL_PROVIDER=none`
- `failed`: misconfiguration or a provider error (the enquiry is kept; admins can press "Send notification again")

Visitors are told their enquiry was *received* (with a reference number). They are never told an email was sent.

Site visit requests and careers applications use the same email settings and record their outcome in the same way. Each site visit notification is clearly marked as a request to confirm, not a booking.

## 5a. Site visit requests (`/site-visit`)

There is no calendar or scheduling integration, so the site never claims a slot is available or booked.

- **Visitor.** Chooses a project, a preferred date and a time window, then gives their details and consent.
  - Projects come from `data/projects.ts`.
  - Dates are Monday to Saturday, within the next 60 days, in Pakistan time.
  - Time windows are 11–1, 1–3, 3–5 and 5–7. Windows that have already started today are disabled.
- **Request saved.** It is stored in the `site_visits` table with status **Pending**. The visitor sees "Request received · awaiting confirmation" and a `GSV-…` reference.
- **Staff confirm.** Staff call the visitor, then set the status in **Admin → Site visits**. The statuses are Confirmed, Rescheduled, Cancelled and Completed. Confirmed and Rescheduled require the agreed date and time.
- **Links into the form.**
  - From a project page, the project is preselected.
  - From an article, the projects it mentions are listed first.
  - Booking links: the header button, project heroes and cards, the mobile action bar, articles, the homepage, the Contact page, the footer and the floating "Book a visit" button.
- **Protection.** The same as enquiries: server-side validation, a honeypot field, a minimum fill time, a same-origin check, 5 requests per 10 minutes per IP (stored as a salted hash), and duplicate-click protection.
- **Data retention.** `npm run enquiries:purge` also deletes site visit requests older than `ENQUIRY_RETENTION_DAYS`.

If a real calendar is added later (for example Google Calendar or Calendly), only `lib/site-visits/service.ts` needs to change. The API already returns the stored status, and the confirmation screen shows "Visit confirmed" only when the status really is `confirmed`.

## 6. Admin dashboard (`/admin`)

There is no public sign-up and no default password. Create the first administrator from the terminal:

```bash
npm run admin:create -- --email you@gohargoc.com --name "Your Name" --role admin
```

You'll be asked for a password (12+ characters, typed hidden). Run the same command again to reset a password; this also signs out that user's sessions. Use `--role editor` for staff who manage enquiries and project text but not site settings.

| Area | Admin | Editor |
| --- | --- | --- |
| View, search and filter enquiries; update status and notes; retry notifications | ✓ | ✓ |
| View site visit requests; confirm, reschedule, cancel or complete them; add notes; retry notifications | ✓ | ✓ |
| Delete site visit requests | ✓ | |
| View careers applications, download CVs, update status and notes | ✓ | ✓ |
| Delete careers applications and their CVs | ✓ | |
| Delete enquiries (spam / erasure requests) | ✓ | |
| Edit project summary, overview, SEO text and lead image (from verified images only) | ✓ | ✓ |
| Edit public contact details | ✓ | |

Security: passwords are hashed with scrypt; sessions are random tokens stored hashed with an 8-hour expiry in HttpOnly cookies; every admin page and server action re-checks the session on the server; login is rate-limited by account and IP; admin pages send `noindex` and `no-store`; all changes are written to an audit log.

## 7. Build, test and run in production

```bash
npm run check        # typecheck + lint + tests
npm run build        # production build
npm start            # serve the build (needs DATABASE_URL in .env)
```

Other scripts:

| Script | Purpose |
| --- | --- |
| `npm test` | 140 unit and integration tests. They cover validation, data integrity, filters, Gohar Stories data, and the site-visit date rules. They run the site visit, enquiry and careers services against a real in-memory SQLite database. They also cover CV file-signature checks, email outcomes, rate limiting, password hashing and WhatsApp links. |
| `npm run assets:import` | Re-downloads the extra official images (media library and event photos) and re-cuts the floor plans from the official brochure PDFs |
| `npm run enquiries:purge` | Deletes enquiries past the retention period and spam older than 30 days. Run daily via cron / Task Scheduler. Add `-- --dry-run` to preview. |
| `npm run assets:manifest` | Regenerates `docs/ASSET-MANIFEST.md` from the project data and checks that every image file exists |
| `npm run images:optimize` | Resizes oversized source images (no cropping or upscaling) |
| `npm run icons:generate` | Rebuilds the favicon from the official logo |
| `npm run assets:fetch` | Re-downloads official images and brochures from gohargoc.com (Windows PowerShell) |

### Deploying

- **Vercel (recommended):** import the project, set the environment variables (with a Turso `DATABASE_URL`), and run `npm run db:migrate` once locally against the production database. Then create the first admin the same way.
- **Own server:** `npm ci && npm run build && npm run db:migrate && npm start`, behind HTTPS (nginx / IIS / Caddy) that sets `X-Forwarded-For`. Keep `.data/` on persistent storage and back it up.

Rate limits use the first `X-Forwarded-For` address. Deploy behind a proxy that sets this header (Vercel and standard reverse proxies do), so visitors can't spoof it.

## 8. Content: how to change things

- **Projects:** everything lives in `data/projects.ts` (one typed object per project). To add a project, add an object, put images in `public/images/projects/<slug>/`, then run `npm test` (it checks slugs, image files, related links and SEO lengths) and `npm run assets:manifest`.
- **Payment plans:** `payment` on each project.
  - Prices are shown exactly as published on gohargoc.com, with the date they were read and a "confirm current prices with our sales team" note. Nowhere else in the project data may contain a price (a test enforces this).
  - When prices change, update the figures and `retrievedOn`, or remove `payment` to show "On request".
- **Floor plans and masterplans:** `floorPlans` on each project. They appear in their own section with a lightbox.
- **Gohar Stories:** `data/stories.ts`, one object per article. Body text is a list of blocks: paragraphs, headings, lists, numbered tips, images and contact boxes. Inline `**bold**` and `[link](/path)` are supported, and raw HTML is never rendered.
  - Add an article: add an object, put images in `public/images/stories/`, then run `npm test`. The test checks images, links and project references.
  - Old WordPress post URLs (`/<post-slug>/`) redirect to `/gohar-stories/<post-slug>` automatically.
- **Company details and values:** `data/company.ts`. Contact details can also be changed in `/admin/settings`.
- **Vacancies:** `data/careers.ts` (currently empty, so the page shows "no open positions" and a general expression-of-interest form). Add a vacancy object and it appears as a job card and as an option in the application form.
- **Careers applications and CVs:** submitted to `/api/careers`. CVs must be PDF, DOC or DOCX, at most 4 MB, and are checked by their file signature (not just the name). They are stored in the database (works locally and on Turso; nothing is written to disk) and can be downloaded only by signed-in staff from `/admin/applications`. Notifications carry no attachment.
- **FAQs:** `data/faqs.ts`. Answers are built from the project data and contact settings, so they stay accurate.
- **Social links:** `socialLinks` in `data/company.ts` (none confirmed yet, so none are shown).
- **Old-site redirects:** `data/redirects.ts`.

Rule for all content: only publish what the company has confirmed. Optional fields can be left out, and the page hides that section.

## 9. Replacing the existing website

The new site keeps the official project slugs where possible. Permanent (308) redirects are configured for the old WordPress URLs:

| Old URL | New URL |
| --- | --- |
| `/about-us/` | `/about` |
| `/contact-2/` | `/contact` |
| `/career/` | `/careers` |
| `/projects/gohar-complex/` | `/projects/gohar-complex-shopping-mall` |
| `/projects/gohar-residencia/` | `/projects/gohar-residencia-shopping-mall` |
| `/projects/gohar-towers-6/` | `/projects/gohar-towers` |
| `/<article-slug>/` (the four WordPress posts) | `/gohar-stories/<article-slug>` |
| `/blog`, `/blogs`, `/blogs/…`, `/news_events`, `/category/…` | `/gohar-stories` (with the matching category) |

Unchanged URLs: `/`, `/projects/`, `/contact/`, `/gohar-stories/`, and the other seven project URLs. After switching domains, submit the new `sitemap.xml` in Google Search Console.

## 10. Project structure

```
app/(site)/            public pages: home, about, projects, projects/[slug], gohar-stories, gohar-stories/[slug],
                       site-visit, contact, careers, privacy
app/admin/             login, dashboard, enquiries, site visits, applications, projects, settings (+ server actions)
app/api/enquiries/     enquiry endpoint (validation, rate limit, storage, notification)
app/api/site-visits/   site visit request endpoint (same protections; always stores "pending")
app/api/careers/       careers endpoint (multipart, CV signature check, storage, notification)
components/            layout, projects, stories, site-visit, forms, home, admin, ui
data/                  projects, stories, company, careers, redirects (content)
lib/                   db, auth, email, security, validation, content, filters
drizzle/               SQL migrations
proxy.ts               404 for unknown project slugs; fast admin redirect
public/images/         brand + per-project images (official, see docs/ASSET-MANIFEST.md)
public/documents/      official brochures
scripts/               migrate, seed, create-admin, purge, assets, icons
tests/                 Vitest suites
docs/                  asset manifest, outstanding items
```

See **docs/OUTSTANDING-ITEMS.md** for what still needs client input before launch.
