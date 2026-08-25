# iyadnekka.github.io

Personal research site — Iyad Assaad Nekka, PhD candidate, LCSI Laboratory, ESI Algiers.

## Deploy on GitHub Pages

1. Create a repo named `<your-username>.github.io` (for a user site, this exact
   name is required — e.g. `inekka-esi.github.io`).
2. Copy `index.html`, `style.css`, `script.js` and the `assets/` folder into it.
3. Push to the `main` branch.
4. Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
5. Live at `https://<your-username>.github.io` within a minute or two.

## Before you publish — replace these

| Where | What |
|---|---|
| `index.html` — Google Scholar link | `user=REPLACE_ME` → your real Scholar profile URL |
| `index.html` — ResearchGate link | `profile/REPLACE-ME` → your real RG profile URL |
| `index.html` — LinkedIn link | `in/REPLACE-ME` → your real LinkedIn URL |
| `index.html` — `<link rel="canonical">`, `og:url`, `og:image`, JSON-LD `url` | your final domain |
| `index.html` — paper statuses | update as papers are accepted |

The email is set to `i_nekka@esi.dz` (from your papers). Change it if you'd
prefer a different contact address.

## Custom domain (recommended)

Buy a domain, add a file named `CNAME` at the repo root containing only the
domain (e.g. `iyadnekka.com`), then point a CNAME DNS record at
`<your-username>.github.io`. A domain you own outranks any profile page you
don't.

## Notes

- The `<script type="application/ld+json">` block is Schema.org Person markup.
  It is what tells Google that this name, this affiliation and these profiles
  are one entity — keep it accurate and keep `sameAs` in sync with your real
  profile URLs as you create them.
- The background canvas respects `prefers-reduced-motion`: it renders a single
  static frame for visitors who ask for reduced motion.
- No build step, no dependencies. Fonts load from Google Fonts.
