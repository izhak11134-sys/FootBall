# Site completion scope

This change concentrates on the website, not audience growth or affiliate recruitment.

Prepared:
- Firebase Web configuration for the owner-confirmed project `formandroar-ae8f9`.
- Email/password owner UI, remembered/session-only sign-in, sign-out and account-password controls.
- Firestore catalogue drafts, publish/unpublish, deletion, position ordering, export and stale-revision protection.
- Realtime public reads of published records; failed cloud loads show an error rather than pretending the demo is a live catalogue.
- Firestore owner-membership and product-write rules, with an emulator test suite.
- Firebase Hosting configuration, a real 404, optional canonical/social/sitemap metadata and default noindex.
- Keyboard/motion checks and automated accessibility scanning. A low-contrast owner-help note was corrected.
- The owner's YouTube/TikTok links and public contact address in the footer.

External activation still required:
- Enable Email/Password and create the owner account in Firebase Authentication.
- Create Firestore, publish the supplied rules, and deploy the owner UID binding in the supplied rules.
- Authorise and complete Hosting deployment using the owner's Firebase account.
- Verify actual sign-in, publication, cross-device visibility and public draft isolation on that deployed project.

No Service Account, password, billing setup or hosting publication was performed in this chat. The public Web key is not an admin credential. The six source items remain clearly marked illustrative concepts. Marketing/programme research remains separate.

Validation update:
- 13 browser checks passed using the isolated, cloud-disabled test build, including automated accessibility scanning.
- Production dependencies: zero advisories in `npm audit --omit=dev` after a patched grpc transport override.
- Development Firebase CLI dependencies: 14 moderate advisories remain after compatible fixes; no forced downgrade was applied.
- Seven Firestore permission tests remain unexecuted because the official emulator download is blocked.
- The Firebase project and its public Web fields were supplied and bound in configuration. No privileged Firebase account or deploy authorisation is present, so a live release and authenticated write test are not claimed.

- The official Firebase Hosting emulator test passed for clean URLs, a genuine HTTP 404, and owner no-store / frame-ancestor / noindex headers. This was a local static-host test, not a cloud deployment or a Firestore permission test.

- Primary owner UID supplied by the user is now pinned in rules and client UI. It is an identifier, not a credential. No extra bootstrap role document is required for that account; the rules still need deployment.

Owner-only visibility update: the public sign-in link was removed. An authenticated owner-only shortcut is inserted after sign-in; guest and other-account states were checked in browser tests. The server rule now accepts only the pinned owner UID, regardless of legacy manager documents. This last rule change still requires deployment and emulator verification remains blocked. Fourteen browser tests passed for the updated site.
