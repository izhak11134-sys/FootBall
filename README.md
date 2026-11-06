# Form & Roar — football catalogue with Firebase management

An English-language product-discovery site for the UK and Europe, centred on shirts, retro, fanwear, collectibles and gifts. The six source entries remain clearly marked original design previews. No seller programme or purchasable product has been invented.

## Current configuration

The owner confirmed Firebase project **formandroar-ae8f9** and supplied its public Web configuration in `src/firebase-public-config.json`. The configuration is intended for browsers; it is not an admin credential. No password, Service Account or private key is stored. Analytics is not imported or enabled by the site.

**Firebase account activation and deployment are still required.** See the step-by-step [Firebase setup guide in Hebrew](docs/firebase-setup.md). Authentication, real Firestore writes and cross-device publication have not yet been verified against the owner's project. Project settings alone do not deploy the security rules.

## Run and build

Node.js 22.12+ / Node 24 recommended:

```sh
npm ci --cache /tmp/foot-ball-npm-cache
npm run dev
npm run build
```

Use the existing checkout in cloud tasks; do not create a Git worktree unless explicitly requested. The configured build is written to `dist`. The separate test build is written to `dist-test` with cloud access disabled.

- Public site: `/` and `/catalog`; five shopping categories, search, ordering, delivery-country selection and keyboard-accessible product quick view.
- Connected owner area: `/admin.html` (Firebase Hosting also supports the clean `/admin` URL).
- Local catalogue drafts: `/manage.html`; local visual layout studio: `/editor.html`. These remain browser-only tools and do not write to Firestore.

## Connected management

The owner area uses Firebase Authentication email/password sign-in and Firestore. Accounts must be created in Firebase Console; there is no public sign-up UI. The primary owner UID supplied by the user is pinned in `firestore.rules` and `src/owner-config.json`; deploying those rules grants that authenticated account access. Additional managers require a trusted project owner to create `catalogAdmins/{AUTH_UID}` with `enabled: true` in the Console. Only a verified Firebase sign-in token grants access; knowing a UID or Web API key is insufficient.

Owners can save private drafts, publish or unpublish configured seller items, delete items, set display positions, export a product-data backup, sign out and change their website password. Concurrent item changes are checked using Firestore transactions and revisions. Clients cannot create or edit admin membership through the website.

The connected public site subscribes only to records with `published: true`; rules restrict public reads accordingly. Unpublished records are not included in the public query. Network or configuration failures show an explicit loading/error state instead of presenting the demo catalogue as live data.

Publishing a listing requires an identifiable seller, permitted image, HTTPS link, delivery destinations and an active listing configuration. Prices are in the supplied seller currency with a check date. There is no invented inventory, automatic currency conversion or payment checkout. Purchases and returns belong with the retailer.

## Deployment

Firebase Hosting settings, rules and the owner-confirmed project target are checked into this repository. From the project owner's machine/account:

```sh
npx firebase login
npm run firebase:deploy
```

This deploys Hosting and Firestore rules, not Functions. Confirm the correct project and site before approving deployment. No authenticated deployment was performed from this chat. The intended Firebase Hosting origin in `site-publishing.json` is not a claim that the website is live.

The built site includes a real 404. Canonical URLs, social metadata and a sitemap use the intended hosting origin, overrideable with `SITE_URL`. Indexing is deliberately off while the catalogue is a prototype; enable `SITE_INDEXABLE=true` only when ready. All four Web configuration fields can be overridden using the `VITE_FIREBASE_*` variables listed in `.env.example`. Never put a private credential in a VITE variable.

The public reader loads Firebase client code only when cloud configuration is enabled. The visual editor has its own larger GrapesJS bundle.

## Validation

```sh
npm test
npm run test:rules
npm run test:hosting
npm audit --omit=dev
```

`npm test` builds isolated `dist-test` output with Firebase disabled and runs browser tests without connecting to the real project or sending emails. Tests use Chromium at `/usr/bin/chromium` (`CHROMIUM_PATH` can override it). Checks include catalogue filtering, local data management, mobile/tablet layouts, actual touch scrolling, 3D tilt and motion preferences, real 404s, offline export, owner setup state and automated accessibility scanning.

The Firestore test suite uses the official emulator with demo project `demo-form-and-roar`. It covers public/draft isolation, owner writes, denied privilege escalation, invalid publication and stale revisions. Its first run was blocked because the environment could not download the official emulator JAR. Those tests are prepared but **not yet executed**; they must not be described as passing. The separate official Hosting emulator check passed for clean paths, HTTP 404 and owner-area headers. Live account sign-in and cloud publication remain unverified.

The browser-production dependency audit passed after a targeted `@grpc/grpc-js` override to a patched 1.x release. The installed Firebase CLI's development-only dependency tree still reports moderate advisories; no forced major downgrade or signature/TLS bypass was used.

## Downloads and local drafts

`npm run export:html` creates a self-contained static reader with all 13 public pages, illustrations, filtering and tilt. It does not connect to Firestore or include owner login; the connected website is separate. The ZIP contains this reader as `index.html`, a catalogue template and instructions. The initial design remains in `downloads/form-and-roar-v1.html`.

Local workspace drafts can be imported into the source using:

```sh
npm run catalog:import -- /path/to/form-and-roar-catalog.json
```

That command does not publish to Firestore. A cloud JSON backup contains product data, not publication flags or credentials. Use the connected owner area for cloud publication.

## Remaining activation

1. Enable Firebase Email/Password and create the owner account.
2. Create Firestore in production mode, deploy the supplied rules containing the owner-confirmed UID.
3. Authorise Hosting deployment and verify real sign-in, draft isolation and cross-device publication.
4. Replace design previews with genuine permitted seller listings before commercial launch; complete publisher/legal details as appropriate.

Marketing and affiliate-programme research remain separate from this website work. Preparation materials are retained under `docs/affiliate-*`.
