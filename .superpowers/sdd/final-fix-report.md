# Final Fix Report

## Scope

Implemented the final-review hardening patch without adding remote Tauri capabilities, JavaScript-facing native IPC, signing credentials, or new dependencies.

## Implemented Findings

- Added a deterministic Rust `CallbackCoordinator` that validates callbacks before retaining one pre-ready code, marks the main window ready explicitly, and de-duplicates delivered callbacks. The `on_open_url` listener is registered before `get_current` is drained.
- Tightened callback parsing to exactly one `code` pair. Unknown parameters, OAuth error/state parameters, implicit credentials, fragments, duplicate codes, and malformed authorities are rejected.
- Routed both top-level and new-window external navigation through the same Rust-only opener helper. Failure to open the exact configured Supabase authorize URL navigates the existing main WebView to the fixed same-origin `/login?desktop-oauth-error=browser-open-failed` state without copying request data.
- Added the fixed Thai retry message decoder and AuthForm handling that clears OAuth loading. Same-origin `target=_blank` navigation now reuses the main window and still denies a second WebView.
- Validated `SCISIAM_SUPABASE_ORIGIN` as a credential-free HTTPS root origin and, when `NEXT_PUBLIC_SUPABASE_URL` is supplied to the Rust build, requires exact string equality.
- Added supported `publisher` and neutral application-description metadata. README labels local NSIS output as an unsigned development installer and documents Authenticode SHA-256 signing, RFC 3161 timestamping, verification, and post-signing SHA-256 publication as manual release gates. No certificate or production-signing claim was added.

## TDD Evidence

RED was recorded before implementation:

- Focused Node tests failed on missing publisher/development labeling, listener ordering, same-origin window reuse, the fixed Thai OAuth failure state, and release documentation.
- Focused Rust tests failed with the new callback coordinator, strict Supabase origin matching, strict callback parsing, and fixed opener-failure target not yet implemented.

GREEN evidence available when work was stopped:

- `cargo test --manifest-path src-tauri/Cargo.toml --locked`: PASS, 10/10.
- Focused Node command: 15/18 passed. The three remaining failures are stale source-shape assertions that still expect `parse_oauth_callback` directly in `lib.rs`, the old same-origin helper spelling, and the old `build_web_callback(&app_origin(), &code)` call shape. The runtime parser now lives behind `CallbackCoordinator::receive`, same-origin reuse calls `navigate_new_window_in_main`, and `forward_callback_code` already receives `&str`.

## Residual Gates

The user stopped further checks and fixes. Therefore this report does not claim a fully green handoff or production readiness.

- Update the three stale Node source assertions and rerun the focused Node tests.
- Run `npm test`, `npm run lint`, and `npm run build`.
- Run locked Rust format check, Clippy with warnings denied, tests, and check.
- Because `tauri.conf.json` changed, build a fresh NSIS artifact and confirm it is unsigned/development-only before any manual signing gate.
- Run the required secret scan and `graphify update .`.
- Complete installed-app warm/cold OAuth, opener-failure, protocol registration, internal/external link, and uninstall/reinstall QA.
- Confirm Supabase Dashboard keeps the canonical HTTPS Site URL and exact `scisiam://auth/callback` additional redirect.
- Production publication still requires an externally supplied Authenticode certificate, RFC 3161 timestamp, successful signature verification, and publication of the signed installer's exact SHA-256 digest.

No push was performed.
