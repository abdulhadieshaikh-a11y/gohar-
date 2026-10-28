# Website Profile - Gohar Group of Companies

_Last updated: 2026-10-25 by Website Manager. No secrets in this file. Detailed docs: `README.md`, `docs/OUTSTANDING-ITEMS.md`._

## Purpose
- Business: real-estate developer in Karachi & Hyderabad (residential, commercial, mixed-use projects)
- Audience: home buyers, investors, overseas Pakistanis, job seekers
- Goals: leads (enquiries, site-visit requests, WhatsApp), project discovery, brand trust; replaces the old WordPress site gohargoc.com
- Primary CTAs: "Book a site visit" (`/site-visit`), WhatsApp (+92 337 3723420), enquiry form

## Stack
- Next.js 16.4 (App Router, `cacheComponents`, Turbopack), React 19.3, TypeScript strict
- Tailwind CSS 4 (tokens in `app/globals.css`), lucide-react icons, Lenis smooth scroll, custom motion in `components/ui/motion.tsx`
- Zod 4 validation, Drizzle ORM. SQLite locally (`.data/gohar-dev.db`), libSQL/Turso in production
- Nodemailer / Resend email (optional, `EMAIL_PROVIDER`)
- Vitest tests (`tests/`, ~140 tests)
- Deploy target: Vercel + Turso (recommended) or own server. **Not yet deployed / not yet cut over** (see OUTSTANDING-ITEMS)
- Note `AGENTS.md`: this Next.js version has breaking changes, so read `node_modules/next/dist/docs/` before writing Next-specific code. The `proxy.ts` file replaces `middleware.ts`.

## Commands
- Dev: `npm run dev` (port 3000; runs DB migrations first) · Preview prod: `npm run preview`
- `npm run check` = typecheck + lint + test · `npm run build`
- DB: `db:generate`, `db:migrate`, `db:seed` · Admin: `npm run admin:create -- --email ... --role admin|editor`

## Routes
| Route | Purpose |
|---|---|
| `/` | Home (hero showcase, collections, approach, intro curtain) |
| `/about`, `/careers`, `/contact`, `/privacy` (draft) | Company pages |
| `/projects`, `/projects/[slug]` (10 projects) | Project directory + detail (gallery, floor plans, payment plans, FAQs) |
| `/gohar-stories`, `/gohar-stories/[slug]` | Articles |
| `/site-visit` | Site-visit request form |
| `/admin/*` | Login, dashboard, enquiries, site visits, applications (CV download), projects, settings |
| `POST /api/enquiries`, `/api/site-visits`, `/api/careers` | Lead endpoints (validation, honeypot, rate limit, same-origin) |
| `sitemap.ts`, `robots.ts`, `manifest.ts`, `not-found.tsx` | SEO / PWA |

## Design system ("monumental modern", redesigned 2026-10-25)
- **Type:** Archivo (variable, `wdth` axis) for display, set heavy (750–800) and slightly extended (`wdth` 108–112) with tight tracking. Inter for body/UI. Loaded in `app/layout.tsx`; scale `.display-2xl … .display-sm` in `app/globals.css`. Any `h1–h4` or `font-display` element is heavy by default; use `font-medium` for paragraph-length statements
- **Colour:** obsidian `ink #0a0a0b` + bone `ivory #f3f2ef`, neutral greys. The legacy `brass*` token names are now greys (`brass-light` = two-tone headline accent on dark, `brass-deep` = labels on light). **Gohar red** `#e72e34` is an accent only: dots, hairlines, active nav, progress bars, and the hover fill of buttons. There are no red panels or red buttons at rest
- **Headlines are two-tone:** accent words (`<em>` / `SplitWords em`) are not italic. They use a lighter tone (`text-ivory/45` on dark, `text-brass-deep` on light)
- **Buttons** (`components/ui/button.tsx`): sentence case, 48/56px tall. `primary` = black on light surfaces. `solid-light` = white on dark surfaces. Both sweep to red on hover
- **Selected states** (filters, form choices, steps): solid ink. Field borders use taupe (3:1+)
- `.surface-red` is now a dark feature surface with a red glow in one corner
- **CTA label:** always "Request a site visit" / "Request a visit" (never "Book")
- **Motion:** `data-reveal`, `data-parallax` (with `suppressHydrationWarning`), CSS hero entrances that finish within ~1 s. The intro curtain was removed. Respects reduced motion
- **Shared UI:** `components/ui/*` (button, page-hero, section-intro, breadcrumbs, faq-accordion)
- **Backup** of the pre-redesign code: `.website-manager/backup/2026-10-25-before-redesign.zip`

## Backend & data
- Content: `data/*.ts` (projects, stories, company, careers, faqs, redirects)
- DB schema `lib/db/schema.ts`, migrations `drizzle/`. Services in `lib/{enquiries,site-visits,careers}/service.ts`
- Auth: custom sessions (`lib/auth/session.ts`), scrypt passwords, HttpOnly cookies, 8h expiry, roles admin/editor, audit log
- Security helpers: `lib/security/*` (rate limit, file signature, request origin)
- Env var NAMES: `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `EMAIL_PROVIDER`, `EMAIL_FROM`, `ENQUIRY_NOTIFY_TO`, `SMTP_*`, `RESEND_API_KEY`, `IP_HASH_SALT`, `ENQUIRY_RETENTION_DAYS`, `CAREER_RETENTION_DAYS`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
  - Local `.env`: `IP_HASH_SALT` is empty

## Key business rules
- Only publish company-confirmed content. No invented stats, testimonials or prices (a test enforces the price rule)
- Leads are always saved before email. The email outcome is recorded truthfully. Visitors are told "received", never "booked"
- Site visits are requests (Pending) that staff confirm by phone

## Known issues / open tasks
- See `docs/OUTSTANDING-ITEMS.md` (client confirmations, missing content, accounts needed, old site compromised)
- Full audit 2026-10-25: `docs/audits/2026-10-25-full-audit.md`. 0 critical, 7 high, ~20 medium
| ID | Severity | Issue | Status |
|---|---|---|---|
| CODE-2 | High | No Git repo / Git not installed | Open |
| PERF-1 | High | Hero loads all 5 slide images at once | Open |
| UX-1 | High | Hero CTAs delayed 2.5–4 s; no WhatsApp in mobile header | Open |
| UX-2 | High | Mobile carousel has no pause | Open |
| SEO-1 | High | Site URL falls back to localhost with no prod guard | Open |
| CODE-1 | High | PDFs 111 MB (deploy limit, mobile data) | Open |
| SEC-3 | Med | IP_HASH_SALT not enforced in prod | Open |

## Change log
- 2026-10-29 - **Light theme (client request):**
  - Page background is now pure white (`--color-ivory: #ffffff`).
  - Content sections that were black are now white or light grey with dark text, via a `.theme-light` class in `app/globals.css` that swaps the dark/light tokens inside a section. `.theme-dark` keeps photo cards inside those sections dark.
  - Converted: homepage band, purpose card, signature intro, values and site-visit CTA; About "What we stand for"; Careers openings; Contact channels; Privacy header; project Layouts, Payment plans and framed hero; site-visit CTA card; featured story card.
  - The header is always a solid black bar with white links and the official white-and-red logo (`gohar-logo-light-trim.png`) on every page; the black-letter logo swap was removed.
  - Headline accent words over photos are now white, and grey labels on dark are lighter (`--color-brass-light: #d9d6d0`).
  - Kept dark on purpose: photo heroes, full-screen project photo panels, city photo cards, the footer and the 404 page.
- 2026-10-25 - Website Manager onboarding: profile, CLAUDE.md, `.claude/launch.json` added. No site code changed
- 2026-10-27 - **Images:**
  - Client-supplied Gohar Towers picture added (`towers-sky.jpg`, now the Towers hero) via `scripts/prepare-towers-photo.mjs`.
  - 11 low-res images upscaled and sharpened with `scripts/enhance-images.mjs` (originals in `.website-manager/originals/`).
  - Next/Image quality raised to 85 site-wide; the homepage index preview uses a non-hero image.
  - The test now accepts sources marked "Supplied by the client".
  - Photo needs: `docs/PHOTO-REQUEST.md`. The drop folder is `incoming-photos/<slug>/`.
- 2026-10-25 - **About redesign:**
  - **Homepage About section:** two-tone heading, figure tiles, an interactive "What we build" explorer (`components/about/portfolio-explorer.tsx` + `lib/portfolio.ts`) and a purpose panel.
  - **About page rebuilt:** full-bleed hero with figures, "Who we are" plus an "At a glance" card, a tagline marquee band, chapters with tilt and parallax, sticky purpose/mission/promise cards, expanding values panels (`components/about/values-panels.tsx`), city cards, a journey timeline and a mosaic.
  - **Red removed** from page-hero glows and feature surfaces (`.ambient-glow` and `.surface-red` are now neutral), and from careers/contact accents. Red is now only for thin lines, dots and the active state.
- 2026-10-25 - **Interactive layer:** a scroll-velocity running marquee (`scroll-marquee.tsx`) plus a running band under the hero; an interactive project index with a cursor-following preview (`project-index.tsx`); a desktop cursor ring; 3D tilt + glare on cards (`data-tilt`, `.tilt-glare`); drifting ambient light (`.ambient-glow`) on dark sections; a hero pointer light, mouse parallax and touch swipe; magnetic CTAs; button press feedback. Speed: show the client the production build (`start-website.cmd`). In-browser clicks measured at about 60 ms on the production build. Dev mode compiles pages on first visit (5–35 s), so use `start-dev.cmd` only for editing. On this PC PowerShell blocks `npm`, so use `npm.cmd`
- 2026-10-25 - **Full visual redesign ("monumental modern")**, requested by the client: new fonts (Archivo heavy + Inter), monochrome palette with a red accent, new homepage hero, new buttons, header and footer. The redesign also fixed audit items UX-1, UX-2, UX-4, UX-5, UX-6 (partly), UX-7, UX-8, PERF-1, PERF-2, PERF-4 (logo preload), QA-1
- 2026-10-25 - Full audit. typecheck/lint/140 tests/build all pass, npm audit 0. Two QA test records ("QA TEST - delete me") were added to the local dev DB
