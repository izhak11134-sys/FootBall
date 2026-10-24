# Form & Roar — editorial design prototype

An English-language, football-first magazine concept led by **Shirts & Style**, **Football Culture** and **Journal**. **Train** is a smaller supporting section about recreational football. The provisional identity combines warm off-white, forest green, rust accents and editorial serif typography. All SVG illustrations are original local assets. No external fonts, images, analytics, account services or product integrations are needed.

## Run

Requires Node.js 22.12+ (validated on Node 24).

```sh
cd /workspace/FootBall
npm ci --cache /tmp/foot-ball-npm-cache
npm run dev
```

The development server prints its address. The public home is `/`; the visual workspace is `/editor.html`. Existing cloud tasks are isolated; use this checkout without creating a Git worktree.

## Edit visually

The local studio uses GrapesJS. Choose a page, double-click text, use Layers to reorder sections, Style Manager to adjust styling, and Blocks to add sections. Desktop and Mobile controls change the canvas viewport. Save draft, then Preview to inspect the result.

- Drafts are stored **only in the same browser and origin**, independently for each page. Clearing browser storage removes drafts. There is no server save, user authentication, cross-device sync or publication workflow.
- Normal visitor pages always show the checked-in original. Only `?draft=1` loads the local saved draft.
- Export HTML downloads **one edited page**, with its styles and local images embedded. Links to other site pages still require those pages to be hosted. An export does not update the source code, other pages or deployment.
- Shared header/footer changes are per page in this prototype. Reset page removes that page’s browser draft after confirmation.
- Treat `/editor.html` as a development tool. A production visual publishing system needs managed permissions, shared storage and a publish workflow. Webflow remains the recommended managed platform for independent layout editing; this local editor is not a Webflow or Sites integration.

## Build and validate

```sh
npm run build
npm test
npm audit --cache /tmp/foot-ball-npm-cache
```

Tests use installed Chromium at `/usr/bin/chromium`; set `CHROMIUM_PATH` to another executable if needed. The four-test suite checks all 15 public pages, internal links and images, mobile overflow and navigation, rich-text editing, draft persistence, preview and export. It also exercises every page and embedded illustration in the standalone HTML without network access. The test runner starts and stops its own production preview server.

`scripts/generate-pages.js` pre-renders HTML from `src/site.js` and `src/content.js`. Generated HTML is ignored by Git. `npm run dev` and `npm run build` regenerate it automatically. The public reader does not load GrapesJS; its larger editor bundle is exclusive to `/editor.html`.

For hosting, serve the built `dist` directory with **clean URLs** so `/train` resolves to `train.html` and `/journal/ritual-before-the-roar` resolves to its matching HTML file. A generic SPA fallback is not an equivalent substitute. Vite preview supports these routes for local validation. Configure a genuine host-level 404 page before launch.

## Before public launch

This is a working prototype, not a published business or production CMS. No Sites tool was available in this chat. No hosting service, domain, CMS project or email account was created.

1. Confirm the provisional brand name, domain availability and trademark suitability.
2. Choose Webflow or another managed visual publishing system, then implement/import the approved design. This project does not automatically import into Webflow.
3. Set a real publisher identity and monitored contact address. Contact currently explains that these are pending; it does not pretend to submit a form.
4. Review the five original concept essays. Replace editorial placeholders with accountable writer profiles and real publication/revision dates where appropriate. Reading times are estimates.
5. Tailor privacy/legal information to the actual business, audience and hosting. Complete accessibility testing, including screen readers, and measure performance after deployment.
6. Set the final canonical domain, sitemap, social preview images and a real 404 page. Remove the deliberate prototype `noindex` metadata and `robots.txt` disallow only when approved for indexing.
7. Add commerce, tracking or affiliate disclosures only when those activities are actually introduced.

The artwork is intentionally illustrative. It does not depict an actual venue, endorse equipment or imply partnerships with clubs. No registered trademark status is claimed.

## Standalone HTML download

Run `npm run export:html` to generate the complete reader as `downloads/form-and-roar-football.html` (also saved to `downloads/form-and-roar.html`). All 15 pages, illustrations and styles are embedded; hash links allow navigation without a server or internet connection. The visual studio remains a separate development tool. The earlier design is preserved in `downloads/form-and-roar-v1.html`.
