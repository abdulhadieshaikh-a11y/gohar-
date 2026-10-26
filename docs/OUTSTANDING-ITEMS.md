# Outstanding items before launch

Status as of 22 Oct 2026. Nothing below was invented to fill gaps. Each item is either left out of the site or clearly labelled.

## Urgent: security of the current website

- **gohargoc.com appears to be compromised.** The published WordPress post "Making Home Ownership Accessible: Gohar Group Partners with Meezan Bank" contains two injected `<script>` tags. They load JavaScript from an unknown third-party domain into visitors' browsers.
  - Not migrated: the new site never renders HTML from the old site, and it doesn't link to the old article pages.
  - To fix: whoever manages the WordPress site (the post author account is a web agency address) should remove the scripts, update WordPress and its plugins, change all admin passwords and scan the site.

## Needs client confirmation

1. **WhatsApp:** +92 337 3723420, confirmed by the client as the number the Gohar team uses.
2. **Image usage rights.** All images, the logo and the brochures come from gohargoc.com (pages, media library and presentation PDFs). Confirm in writing that they may be reused (see `docs/ASSET-MANIFEST.md`).
3. **Images flagged `needs-confirmation`** (10, listed in the manifest):
   - Gohar Towers: a real photo? Supply a higher-resolution original.
   - KN Gohar Green City: are the three aerial images photographs? Does the gate image belong to this project?
   - Gohar Complex: the only image looks like a render, although the project is complete.
   - Gohar Villas: two renders and three phase masterplans come from the official media library, in the same render series as the Villas page, but they are not shown on the Villas page itself.
4. **Published prices.** Payment plans for Gohar Complex, Gateway, Residencia, Towers and Villas are shown exactly as published on gohargoc.com (read 22 Oct 2026), with a "confirm with sales" note. Confirm they are current, or remove them. Inconsistencies in the published figures:
   - Gohar Complex: the 3-room Type B1 total (PKR 13,386,000) is higher than the 4-room Type B total (PKR 13,080,000).
   - Gohar Gateway: called a "3 Year Payment Plan", but the schedule lists 48 monthly instalments.
5. **Gohar Gateway:**
   - Hotel brand: the official page title mentions "Hilton Garden Inn & Residences". The July 2026 REIT article mentions only "a multinational hotel brand". No brand is named on the new site.
   - Unit types: the June 2026 article says 3, 4 and 5 bedrooms of up to 2,900 sq ft; the project page says 2, 3 and 4 rooms. The project page is used.
   - Address: "Main Hyderabad Bypass Road" (article wording) is used instead of "Pass Road" (project page).
6. **KN Gohar Green City:**
   - Home types (Platinum, Gold and Silver plots; Type A–D flats) and facilities (pool, mini golf, play area, basketball court, security control) come from an undated, photographed presentation. Confirm they are current.
   - The Meezan Bank article names "Gohar Green City"; confirm it means KN Gohar Green City.
   - The category ("Residential & Commercial Community") comes from the brief.
7. **Gohar Green Corner:** the project page says "Ground + 5"; the presentation book has basement, lower ground, upper ground and 1st–5th floor plans. Both are shown, labelled by source.
8. **Favicon:** made by cropping the red "A" from the official logo. Approve it or supply an official icon.
9. **Founding year and statistics:** the official site gives conflicting years (1988, 1998, "25+" and "40+ years") and unverified counters. None are shown.
10. **Project status and completion dates** for Golf Vista, Green Corner, Residencia, Villas, Gateway, Rabi Center and KN Green City: not published.

## Gohar Stories: content not migrated

- "Gohar Group teams up with Hilton Garden Inn for Gohar Gateway Hyderabad" (`www.gohargoc.com/blogs/read/…`): the URL returns 404 and no archived copy could be reached. If the client has the text, add it to `data/stories.ts` with its original date.
- The legacy `/blogs/` and `/news_events` listings close the connection, so any other legacy articles could not be discovered. The four articles on the current site were all migrated.
- No author names are published: the WordPress author is a web-agency login. Articles are credited to Gohar Group of Companies.

## Missing content (sections hidden until supplied)

- Images: Gohar Complex, Gohar Rabi Center and Gohar Towers still have **one image each**. No further official images could be found for them.
- Real photographs for every project except Gohar Towers and KN Gohar Green City (KN Green City now has 4 camera photos).
- Floor plans:
  - Now shown: 141 Broadway Heights (basement, residential floor and roof) and Green Corner (5 plans), from the official books.
  - Masterplans: Villas phases and KN Green City.
  - Still needed: everyone else, and Broadway's floor names, which aren't printed on its plans.
- Brochures for Gohar Complex, Gateway, Rabi Center, Residencia, Towers and Villas.
- Verified social-media profile URLs.
- Leadership, history and milestones for the About page.
- Vacancies (the Careers page shows an expression-of-interest form).
- Group-company and partner logos from the old site: the relationships aren't confirmed.

## Needs accounts or credentials

- **Production database:** Turso recommended for Vercel, or a server with a persistent disk.
- **Email delivery:** an SMTP App Password for info@gohargoc.com, or a Resend account with a verified domain.
  - Without it, enquiries, site visit requests and applications are still saved and shown in `/admin`, but staff aren't emailed.
  - Set `ENQUIRY_NOTIFY_TO` to the team that confirms site visits.
- **Calendar integration (optional):** site visits are confirmed by phone. Online booking with real availability would need a calendar service; see README §5a.
- Hosting account and DNS access for the gohargoc.com cutover.
- Legal review of `/privacy` (marked as a draft on the page).

## Known limitations

- Testimonials are not used: the current site's testimonials appear to be placeholders.
- Lighthouse performance after the red-branding update (production build, this PC, 23 Oct 2026):

  | Page | Desktop | Mobile |
  | --- | --- | --- |
  | Home | 80 | 71 |
  | Careers | 98 | 74 |
  | About | 99 | 68 |

  - Other programs were using about half the CPU during these runs. Earlier runs of Home on a quieter machine scored 93–95 on desktop, so the scores above are likely low. Re-measure on the hosting server.
  - Mobile is simulated: throttled "slow 4G" plus a 4× slower CPU.
  - Accessibility, best practices and SEO all scored 100; layout shift is about 0.
  - Mobile performance is limited mainly by downloading the large full-screen hero images on the throttled connection.
- Measured click-to-page times on the production build: 0.1–0.5 s for repeat navigations. The first visit to a new page type took up to about 2 s while two servers and Chrome were running on this PC.
