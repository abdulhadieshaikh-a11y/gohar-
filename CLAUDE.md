@AGENTS.md

## Website Manager

This project is managed with the `website-manager` skill (installed at user level).

- Project profile (stack, routes, design rules, known issues, change log): `docs/website-profile.md`. Read it before any website task and keep it updated. Full docs: `README.md`, `docs/OUTSTANDING-ITEMS.md`.
- Audit reports: `docs/audits/`
- Dev: `npm run dev` (port 3000) · Checks: `npm run check` (typecheck + lint + test) · Build: `npm run build`
- Brand in one line: "monumental modern". Heavy extended Archivo headlines plus Inter, an obsidian/bone monochrome palette, Gohar red `#e72e34` as a small accent only, and two-tone headlines (details in the profile).
- Content rule: publish only what the company has confirmed. No invented stats, prices, testimonials or dates.
- Never deploy, push, run migrations against production, or change production settings without explicit approval. Never write secret values in docs.
