# Form & Roar — UK & Europe product discovery prototype

A football-first affiliate catalogue foundation, centred on shirts, retro, fanwear, collectibles and gifts. There is no article or journal section in the current build. All six initial items are original **design previews**, not real products, prices or seller offers. No affiliate programme is connected.

## Run

Node.js 22.12+ (validated on Node 24):

```sh
cd /workspace/FootBall
npm ci --cache /tmp/foot-ball-npm-cache
npm run dev
```

Use the existing checkout. Cloud tasks are already isolated; do not create a Git worktree unless explicitly requested. The public home is `/`, the catalogue is `/catalog`, the local catalogue workspace is `/manage.html`, and the visual layout studio is `/editor.html`.

## Browse and interact

- Category, search, name/order and delivery-destination controls filter the catalogue. The destination preference is kept in session storage when available.
- Active configured listings are filtered by their delivery-country data. Previews remain visible with clear availability disclaimers and no purchase links.
- Quick view opens an accessible modal. Seller links, when configured, open the retailer with `rel="sponsored noopener noreferrer"`.
- Prices use the supplied seller currency and check date, without conversion or invented stock data.
- The whole hero card tilts by up to 5°/6° with pointer or touch position. A moving light highlight follows the pointer. The outer card also floats gently.
- Vertical touch scrolling is preserved. Touch cancellation, pointer exit, window blur, Pause motion and reduced-motion preferences reset or disable tilt. Animations use CSS and requestAnimationFrame, without WebGL or remote scripts.

## Manage catalogue items

The local `/manage.html` workspace supports adding, editing, reordering and removing items, country selection, validation, and JSON import/export. **Save** stores only a draft in the same browser and origin. **Preview saved draft** opens `/?catalog=draft`. Normal visitors continue to see the source catalogue. There is no authenticated server-side CMS, shared storage or automatic publication.

For an active item, provide a real seller name, approved HTTPS seller / affiliate URL, permitted imagery and actual supported delivery countries. A price also requires a check date. The workspace validates configuration; it does not authenticate the seller, grant programme approval or verify stock.

To apply an exported draft to the source catalogue:

```sh
npm run catalog:import -- /path/to/form-and-roar-catalog.json
npm run build
npm test
```

The canonical source is `src/products.json`. Review changes, commit/push and deploy through the chosen host. An exported JSON file or a browser save does not perform those steps.

The separate visual studio still saves page-layout drafts only in this browser. Its Export HTML control exports the selected page with styles and local illustrations. It does not publish or provide a shared CMS.

## Build, test and download

```sh
npm run build
npm test
npm run export:html
```

The test runner uses Chromium at `/usr/bin/chromium`, overrideable with `CHROMIUM_PATH`. Tests cover the catalogue, unsafe seller configurations, local management / preview / JSON export, mobile and tablet layouts, pointer and touch tilt, actual touch scrolling, motion preferences, the visual editor and offline HTML navigation.

`npm run build` pre-renders all 13 public routes. The development-only manager and visual editor are separate entries. The hosting provider must support clean paths mapping to the corresponding `.html` files. The larger GrapesJS editor bundle is not loaded by the public catalogue.

`npm run export:html` produces `downloads/form-and-roar-football.html` and `downloads/form-and-roar.html`, embedding all public pages, illustrations, catalogue logic and tilt. The manager is a separate development tool. The original first design remains in `downloads/form-and-roar-v1.html` for reference. The ZIP distributed with this change contains the current standalone HTML as `index.html`.

## Remaining launch work

1. Verify and obtain acceptance into actual affiliate programmes. See [the research status](docs/affiliate-research.md): access was blocked, so no programme conditions are confirmed.
2. Add genuine products and authorised images, seller links and reliable delivery information. Never turn an illustration into a purported real offer.
3. Choose and connect an authenticated CMS / publishing service for cross-device management. The browser workspace is a functional prototype, not that service.
4. Configure a real publisher, monitored contact address, hosting and domain. Review privacy / affiliate disclosures for the actual operation and any tracking or consent requirements.
5. Complete independent accessibility and deployed performance checks, canonical URLs, a sitemap and real host-level 404 responses. Remove the deliberate prototype `noindex` / robots disallow only when ready for public indexing.

GitHub stores the code and downloads. Uploading to GitHub does not itself publish a live storefront. No accounts, payments, tracking service, seller application or hosting deployment were created by this change.

## Affiliate application preparation

The [application kit](docs/affiliate-application-kit.md) contains an honest pre-launch introduction in English, the actual missing publisher/site details, and retailer verification questions. The [comparison worksheet](docs/affiliate-comparison.csv) leaves unverified commercial terms blank. These are internal preparation materials, not website articles or submitted applications.
