# Website Audit - Gohar Group of Companies - 2026-10-25

**Scope:** whole project (public site, forms, admin, API, DB, config, SEO, performance, security).
**Method:**
- Code review by 5 specialist reviewers (design, code, SEO/performance, security, QA).
- `npm run typecheck`, `lint`, `test` and `build`.
- Browser QA on the local dev server at 375, 768 and 1280px.
- HTTP checks of every route, link and asset.
- Harmless security probes against localhost.

**Not checked:**
- The live site or production host. The site is not deployed yet.
- Lighthouse on a production build.
- An admin login (no test account).
- A careers form submission (a CV is required).
- The 1440px viewport.
- Real email delivery (`EMAIL_PROVIDER=none`).
- Pixel-level visuals: the browser pane was hidden, so animation screenshots were unreliable.

## 1. Overall assessment

This is a well-built, honest, production-minded site. Engineering quality is well above average:
- Strict TypeScript and 140 passing tests.
- Server-side validation, rate limiting and a honeypot on every form.
- A solid admin auth model and 0 dependency vulnerabilities.
- Real 404s and complete SEO basics on every page.

Nothing critical was found. The main risks are launch-readiness issues:
- The PDFs are too big to deploy and download comfortably.
- There's no Git history.
- A few production settings fail silently instead of loudly.

The biggest user-facing opportunity is the **homepage**. A buyer waits 2.5–4 seconds before seeing the buttons, all 5 hero images download at once, and the heavy motion slows down people trying to research a purchase.

| Area | Rating |
|---|---|
| Functionality | **Good**: all core flows work |
| Code quality | **Good**: some duplication across the 3 form flows |
| Security | **Good**: medium hardening items only |
| SEO | **Good**: titles too long, share image needs work |
| Performance | **Needs work**: hero images, PDFs, intro curtain |
| Design/UX | **Good look, needs work on conversion and accessibility details** |
| Launch readiness | **Needs work**: deploy size, Git, env guards, purge job |

### Checks run
| Check | Result |
|---|---|
| `npm run typecheck` | ✅ pass |
| `npm run lint` | ✅ pass, 0 warnings |
| `npm test` | ✅ 140/140 pass (12 files) |
| `npm run build` | ✅ pass. All public pages prerendered static |
| `npm audit --omit=dev` | ✅ 0 vulnerabilities |
| Internal links (60) / assets (111) | ✅ all 200 |
| Forms: enquiry and site visit | ✅ submit → 201 with a reference. Validation works |
| Admin without a session | ✅ redirects to login. Bogus cookie rejected. Cross-origin actions rejected |

---

## Confirmed problems

### 2. Design & UI/UX

#### [HIGH] Homepage hides its buttons behind animation, and WhatsApp is hard to reach on mobile · UX-1
- **Status:** Confirmed in code
- **Where:**
  - `components/home/hero-showcase.tsx:113`
  - `app/globals.css:352,383-389`
  - `components/home/intro-curtain.tsx`
  - `components/layout/whatsapp-button.tsx:28`
- **Problem:**
  - The hero buttons fade in after 1.1s and take another 1.4s to finish, so they're fully visible at ~2.5s.
  - On a first desktop visit the intro curtain adds ~1.7s on top.
  - The WhatsApp button only appears after 560px of scrolling.
  - The mobile header has no WhatsApp or call button.
- **Why it matters:** buyers in Pakistan convert through WhatsApp and phone. Every second before they see "talk to us" loses leads.
- **Fix:**
  - Show the button row immediately.
  - Remove or shorten the intro curtain (~0.8s, and don't delay the hero).
  - Show WhatsApp from the start on mobile, or add an icon next to the menu button.
- **Effort:** S

#### [HIGH] The mobile hero slideshow can't be paused · UX-2
- **Status:** Confirmed in code
- **Where:** `hero-showcase.tsx:186`. The pause button is `hidden sm:grid`.
- **Problem:** below 640px the slideshow auto-advances every 7.5s with no pause control. This fails WCAG 2.2.2, which the component's own comment cites.
- **Fix:** show the pause button on mobile, or turn off autoplay on small screens.
- **Effort:** S

#### [MEDIUM] The keyboard focus ring is invisible on red panels · UX-4
- **Status:** Confirmed in code (contrast computed)
- **Where:** `globals.css:95`. The red ring on `.surface-red` and wine backgrounds has 2.45:1 contrast.
- **Fix:** add `.surface-red :focus-visible { outline-color: var(--color-ivory) }`.
- **Effort:** XS

#### [MEDIUM] Form field borders are too faint · UX-5
- **Status:** Confirmed in code
- **Where:** `globals.css:278`. The stone border on paper has 1.53:1 contrast. WCAG requires at least 3:1.
- **Fix:** use the taupe `#8a7f71` border (3.67:1).
- **Effort:** XS

#### [MEDIUM] Text is too small in buttons and labels · UX-6
- **Status:** Confirmed in code
- **Where:** 27 places use 0.6–0.69rem uppercase text, including buttons (`button.tsx:28`) and the mobile action bar (`mobile-action-bar.tsx:7`, ~9.9px).
- **Why:** older buyers and investors will struggle to read it.
- **Fix:** set a 0.75rem minimum for UI text and 0.78rem for buttons, and reduce letter-spacing.
- **Effort:** S

#### [MEDIUM] Some tap targets are too small · UX-7
- **Status:** Confirmed in code
- **Where:**
  - The project card's "Book a visit" link (~27px tall, `project-card.tsx:78`).
  - The "Edit" links on the site-visit review step (~20px).
- **Fix:** add `min-h-11` and padding.
- **Effort:** XS

#### [MEDIUM] One action has 5 labels, and "Book" breaks your business rule · UX-8
- **Status:** Confirmed in code
- **Problem:** the same action is called "Schedule a site visit", "Request a site visit", "Book a visit", "Site visit" and "Visit". The README rule is that visitors are never told a visit is booked.
- **Fix:** use "Request a site visit" everywhere, or "Request a visit" where space is short.
- **Effort:** S

#### [MEDIUM] Overseas buyers aren't catered for in the forms · UX-10
- **Status:** Confirmed in code
- **Problem:**
  - Phone examples show only `0300…`.
  - The enquiry form requires email.
  - The City field has no "Outside Pakistan" option. Not fully verified: we didn't read the contents of `CITY_OPTIONS`.
- **Fix:**
  - Use an international phone example.
  - Make email optional, or offer WhatsApp as the contact method.
  - Add an overseas option.
- **Effort:** S

### 3. Functionality & navigation

#### [LOW] React hydration mismatch on every project page · QA-1
- **Status:** Verified (console error on 3 project pages)
- **Where:** the `ProjectHero` parallax div `[data-parallax]`.
- **Problem:** the parallax script writes `transform` before React hydrates.
- **Fix:** apply the transform only after mount, or add `suppressHydrationWarning` to that element.
- **Effort:** S

#### [LOW] A legacy redirect takes two hops · QA-4
- **Status:** Verified
- **Where:** `/about-us/` → 308 → `/about-us` → 308 → `/about`
- **Fix:** list the trailing-slash rule first in `next.config.ts`, or match both forms in one rule.
- **Effort:** XS

#### [LOW] A duplicate site-visit submit shows a confusing message · CODE-10
- **Status:** Confirmed in code
- **Where:** `site-visit-form.tsx:276-282`. "Visit confirmed" appears directly above "not confirmed yet".
- **Effort:** XS

### 4. Technical & code

#### [HIGH] There's no Git repository and Git isn't installed · CODE-2
- **Status:** Verified
- **Why:** there's no history, no rollback, no Vercel Git deploys, and no way to checkpoint before changes.
- **Fix:** install Git for Windows, run `git init`, and commit. The `.gitignore` is already correct. Add a `.vercelignore` that excludes `.env*`, `.data` and `.next`.
- **Effort:** S

#### [MEDIUM] A failed database read can be cached for hours · CODE-5
- **Status:** Confirmed in code
- **Where:** `lib/content.ts:22-29, 79-89`. `getProjects` and `getContactSettings` use `"use cache"` with `cacheLife("hours")`, and they catch errors and return the default values.
- **Why:** after a brief Turso error, admin edits to contact details and project text silently disappear for hours.
- **Fix:** rethrow inside the cached function and fall back to the defaults outside it.
- **Effort:** S

#### [MEDIUM] Notification functions can throw inside `after()` · CODE-7
- **Status:** Confirmed in code
- **Where:** all three `deliver*Notification` functions. The first select and the last update aren't inside a try block.
- **Why:** on a database error, the email status stays "pending" forever and the rejection goes unhandled.
- **Fix:** wrap each function body in try/catch.
- **Effort:** XS

#### [MEDIUM] Data-retention purge isn't scheduled and uses the wrong date · CODE-8
- **Status:** Confirmed in code
- **Where:** `scripts/purge-enquiries.mjs`
- **Problem:**
  - Nothing runs the purge on Vercel: there's no cron.
  - It deletes by `updated_at`, so every status edit restarts the clock.
  - The steps aren't run in a transaction.
- **Why:** the privacy policy promises retention limits that won't actually happen.
- **Fix:**
  - Delete by `created_at`.
  - Add a secret-protected cron route plus a `vercel.json` cron, or a Task Scheduler job.
  - Extend `--dry-run` to all tables.
- **Effort:** S–M

#### [MEDIUM] The three form flows are duplicated and the careers flow has drifted · CODE-6
- **Status:** Confirmed in code
- **Problem:** careers has no reference-collision retry and doesn't handle the double-submit race (it returns 503 even though the row was saved). The application and CV inserts also aren't atomic.
- **Fix:**
  - Extract shared `handleLeadPost()` and `insertIdempotent()` helpers and a client hook.
  - Use a transaction or `db.batch` for application + CV.
- **Effort:** M

#### [LOW] Smaller code items
- **CODE-9:** `scripts/create-admin.mjs` breaks on a pasted password, because the CR arrives in the same chunk.
- **CODE-11:** the nav, footer and WhatsApp button use the static project data, so admin edits don't show there. Confirm this is intended.
- **CODE-12:** login database errors show the error page instead of a friendly message.
- **QA-2:** images request qualities 60, 65 and 70, which aren't in `images.qualities`.

### 5. SEO

#### [HIGH] Canonical URLs and the sitemap fall back to `localhost` if the domain setting is missing · SEO-1
- **Status:** Confirmed in code
- **Where:** `lib/site.ts:3`
- **Why:** if `NEXT_PUBLIC_SITE_URL` is missing on the host, Google is told the site lives at localhost.
- **Fix:**
  - Fail the production build when the setting is unset or not https.
  - Set it to the real domain at launch.
- **Effort:** XS

#### [MEDIUM] Titles are too long and get cut off in Google · SEO-2
- **Status:** Verified
- **Where:** Home is 75 characters, project pages ~81 and articles ~87. The target is about 60.
- **Fix:** shorten `seo.title` values and use the brand suffix "Gohar Group".
- **Effort:** S

#### [MEDIUM] The share image is the wrong size and format for WhatsApp · SEO-3
- **Status:** Verified (tags). The preview behaviour itself is only suspected.
- **Where:** `lib/metadata.ts`. The default image is a 2500×1406 WebP of 365 KB.
- **Why:** WhatsApp is the main share channel, and it often fails on WebP or on images over ~300 KB.
- **Fix:** add a 1200×630 JPG under 300 KB, or per-route `opengraph-image` files.
- **Effort:** S

#### [LOW] SEO polish
- Some og:titles have no brand ("Careers").
- Structured data could link articles to the Organization `@id` and add `postalCode` and `geo`.
- Two meta descriptions are slightly short.

### 6. Performance

#### [HIGH] The homepage downloads all 5 full-screen hero images at once · PERF-1
- **Status:** Confirmed in code by two separate reviewers. Not yet measured.
- **Where:** `hero-showcase.tsx:69-88`. The slides are stacked `inset-0` and hidden with clip-path, so `loading="lazy"` doesn't help.
- **Why:** this is the most likely cause of the mobile Lighthouse score of 68–74 noted in OUTSTANDING-ITEMS. It also costs visitors mobile data.
- **Fix:** render only the active slide and the next one.
- **Effort:** S

#### [HIGH] The brochure PDFs total 111 MB, which risks deploys and is heavy for visitors · CODE-1 / PERF-3
- **Status:** Verified (file sizes)
- **Where:** `public/documents/`. Golf Vista payment plan 48.8 MB, Green Corner 36.1 MB, Broadway 14.0 MB, KN Green City 12.5 MB. `public/` totals ~132 MB.
- **Why:**
  - Vercel CLI deploys cap source uploads at about 100 MB on Hobby (1 GB on Pro). This is from Vercel's limits docs and should be double-checked for your plan.
  - A 48 MB payment plan on Pakistani mobile data is a poor experience.
  - The `download` attribute stops phones from previewing the PDF.
- **Fix:**
  - Recompress the PDFs (e.g. Ghostscript `/ebook`; the likely result is a few MB each, not measured).
  - Or host them on Vercel Blob or Cloudflare R2.
  - Drop `download` so the PDF opens in the viewer.
- **Effort:** S–M

#### [MEDIUM] The intro curtain delays the main image by about 2.5s on desktop · PERF-2
- **Status:** Confirmed in code
- **Why:** this probably explains why Home scores 80 on desktop while the other pages score 98–99.
- **Fix:** see UX-1.

#### [LOW] Performance polish
- Two header logos are both preloaded.
- `preload` is combined with `loading` on the hero, which the Next 16 docs advise against.
- Lenis loads on mobile even though it's unused there. Use a dynamic import instead.
- The `public/images` folder holds 19.6 MB of source JPGs. `next/image` serves optimized versions, so visitors mostly don't download these.

### 7. Security & reliability
No critical issues. Admin auth, role checks, CV download protection and CSRF defences all held up in live probes.

#### [MEDIUM] Rate limits can be bypassed with a spoofed IP header when self-hosting · SEC-1
- **Status:** Confirmed in code
- **Where:** `lib/security/request.ts:6-10` uses the first `X-Forwarded-For` value. This is safe on Vercel. Behind a default nginx it isn't, and README line 175 is wrong about that.
- **Fix:** use `x-vercel-forwarded-for` or `x-real-ip` from a trusted proxy, or a configured trusted-hop count. Correct the README.
- **Effort:** S

#### [MEDIUM] An attacker can keep an admin account locked out · SEC-2
- **Status:** Confirmed in code
- **Where:** `app/admin/actions.ts:68-72`. The account limit counts attempts from anyone.
- **Fix:** key the limit by account + IP, and add a much higher global ceiling.
- **Effort:** S

#### [MEDIUM] `IP_HASH_SALT` isn't enforced in production · SEC-3 / CODE-3
- **Status:** Confirmed in code
- **Where:** `lib/env.ts:47-49`. It silently falls back to a constant that's in the source code. It's empty in the local `.env`.
- **Why:** if the database leaks, the stored visitor-IP hashes can be reversed (personal data).
- **Fix:**
  - Throw in production if the salt is missing or under 32 characters.
  - **You:** set a random salt in the hosting environment.
- **Effort:** XS

#### [LOW] Security hardening
- **SEC-4:** the CSP has no `script-src`/`default-src`. Add a nonce-based CSP via `proxy.ts`, starting in report-only mode.
- **SEC-5:** the session cookie could use the `__Host-` prefix, an idle timeout, and a "sign out everywhere" option.
- **SEC-6:** the same-origin check allows requests with a missing Origin. Compare against `NEXT_PUBLIC_SITE_URL` instead.
- **SEC-7:** rich-text links don't block `javascript:` or `//` URLs. This is safe today, but fix it before stories become editable.

### 8. Mobile responsiveness
- **Verified:** no horizontal overflow on Home (375, 768, 1280) or on 3 project pages, /site-visit, /contact and /careers (375, 1280). The mobile menu works with correct focus handling. The project-page sticky action bar works.
- **Issues:** UX-1 (no WhatsApp in the mobile header), UX-2 (no pause on mobile), UX-6 (tiny action-bar text), UX-7 (tap targets).
- **Not checked:** About, Stories and Privacy at 375px. The 1440px viewport.

---

## Unverified / needs access
- Mobile and desktop Lighthouse on a production build (`npm run preview`). Re-measure after fixing PERF-1 and PERF-2.
- Real email delivery: needs SMTP or Resend credentials.
- Admin login flow: run `npm run admin:create` locally to create a test admin, then re-test.
- Careers form submission with a CV.
- The exact upload limit on your Vercel plan.
- **Known from your own docs, not re-checked:** the **old gohargoc.com WordPress site appears compromised** (injected scripts). That's urgent for whoever manages it. See `docs/OUTSTANDING-ITEMS.md`.

## 9. Missing features & opportunities
Ask the client for real data. Don't invent any of it.
- A starting price or price range and unit sizes in each project's details strip.
- Possession or handover dates and dated construction photos.
- Approval references (SBCA/HDA NOCs) and title status. These are strong trust signals in Pakistan.
- Delivered projects with handover years.
- Brochures for the 6 projects that have none.
- A "How overseas Pakistanis buy" page.
- Verified social links, and genuine testimonials with permission.
- Consider tightening the motion system: drop the magnetic buttons, the intro curtain and possibly Lenis, and keep reveals at 700ms or less (UX-9). The look stays premium and research becomes faster.

## 10. Roadmap

| # | ID | Fix | Severity | Effort | Risk | Needs approval? |
|---|----|-----|----------|--------|------|-----------------|
| 1 | CODE-2 | Install Git, `git init`, first commit | High | S | none | You install Git |
| 2 | PERF-1 | Hero: load only the active and next slide | High | S | low | No |
| 3 | UX-1 / PERF-2 | Show hero buttons immediately, shorten or remove the intro curtain, WhatsApp on mobile | High | S | low (design change) | Curtain removal: your call |
| 4 | UX-2 | Pause button on mobile | High | XS | none | No |
| 5 | SEO-1, SEC-3 | Production guards for `NEXT_PUBLIC_SITE_URL` and `IP_HASH_SALT` | High/Med | XS | low | No (you set the values at deploy) |
| 6 | CODE-1 | Compress PDFs or move them to Blob storage, drop `download` | High | S–M | low | Yes: replaces files |
| 7 | UX-4, UX-5, UX-6, UX-7 | Accessibility: focus ring, borders, text size, tap targets | Med | S | low | No |
| 8 | UX-8 | One label: "Request a site visit" | Med | S | none | No |
| 9 | CODE-5, CODE-7 | Don't cache DB failures. Make notifications never throw | Med | S | low | No |
| 10 | CODE-8 | Fix purge (created_at) and schedule it | Med | S–M | medium (deletes data) | Yes |
| 11 | SEC-1, SEC-2 | Trusted IP source, per-IP account lockout | Med | S | low | No |
| 12 | SEO-2, SEO-3 | Shorter titles, 1200×630 JPG share image | Med | S | none | No |
| 13 | UX-10 | Overseas-friendly forms | Med | S | low | Making email optional: your call |
| 14 | CODE-6 | Unify the form flows, atomic careers insert | Med | M | medium | Plan first |
| 15 | Low items | QA-1, QA-2, QA-4, SEC-4…7, CODE-9…12, SEO-4/5, PERF-4/5 | Low | S each | low | No |

- **Now (this session):** 1–5, 7, 8, 9
- **Next:** 6, 10, 11, 12, 13
- **Later:** 14, 15, the motion simplification, and content from the client

**Deployment:** nothing deployed. This audit changed no site code. It added only `docs/website-profile.md`, `docs/audits/`, `CLAUDE.md` and `.claude/launch.json`.

---

### Roman Urdu khulasa
Aap ki website technically bohat mazboot hai. Saare tests pass hain, build theek hai, forms kaam kar rahe hain, aur koi critical security masla nahi mila. Asal kaam launch se pehle ka hai:
- PDF brochures bohat bhaari hain (111 MB).
- Git nahi hai.
- Kuch production settings check nahi hotin.

Homepage par buttons aur WhatsApp der se nazar aate hain, aur paanchon hero images ek saath load hoti hain. Inhein theek karne se leads aur speed dono behtar honge.
