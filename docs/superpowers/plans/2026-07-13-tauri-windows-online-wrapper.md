# Tauri Windows Online Wrapper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a Windows 10/11 Tauri 2 desktop installer for SciSiam that loads the deployed application, uses system-browser Google OAuth with a validated `scisiam://auth/callback` PKCE return, and exposes no application secrets or broad native permissions to remote content.

**Architecture:** Tauri starts a minimal local connection page, then loads the canonical SciSiam Vercel origin in WebView2. Rust owns top-level navigation, system-browser opening, single-instance behavior, and deep-link validation; the existing Next.js app changes only its Google OAuth redirect behavior when an injected desktop marker is present.

**Tech Stack:** Next.js 16.2.6, React 19.2.4, TypeScript, Supabase SSR/Auth PKCE, Tauri CLI 2.11.4, Rust stable MSVC 1.77.2 or newer, Tauri 2 plugins for deep-link, single-instance, and opener, Windows WebView2, NSIS.

## Global Constraints

- Target Windows 10/11 x64 first.
- Production origin is exactly `https://scisiam-app.vercel.app`.
- OAuth deep link is exactly `scisiam://auth/callback`.
- Supabase project origin defaults to `https://ekcsbxirzsbdlemtfanf.supabase.co` and may be replaced only through the public compile-time `SCISIAM_SUPABASE_ORIGIN` environment variable.
- Vercel remains the backend for middleware, route handlers, auth callbacks, and `/api/ai-tutor`.
- Do not bundle `.env`, `.env.local`, `GEMINI_API_KEY`, database passwords, Supabase service-role keys, access tokens, or refresh tokens.
- Remote SciSiam content receives no filesystem, shell, process, clipboard, unrestricted opener, or JavaScript-facing deep-link capability.
- The first installer target is NSIS `.exe`; MSI, auto-update, offline labs, and non-Windows targets remain out of scope.
- Preserve existing browser behavior and all web commands: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, and `npm test`.

---

## File Map

- `src-tauri/Cargo.toml`: Rust crate and plugin dependencies.
- `src-tauri/build.rs`: Tauri build entry.
- `src-tauri/tauri.conf.json`: Windows identity, local launcher, NSIS target, and deep-link scheme.
- `src-tauri/capabilities/default.json`: empty remote permission boundary for the main window.
- `src-tauri/src/navigation.rs`: pure URL and callback validation functions.
- `src-tauri/src/lib.rs`: Tauri plugins, window creation, navigation interception, and callback forwarding.
- `src-tauri/src/main.rs`: Windows entry point.
- `src-tauri/launcher/index.html`: local loading/offline page.
- `src-tauri/launcher/launcher.css`: local page styling.
- `src-tauri/launcher/launcher.js`: connection retry and production navigation.
- `src-tauri/icons/*`: generated Tauri/Windows icon assets.
- `src/lib/desktop-runtime.ts`: browser-safe Tauri detection and OAuth option selection.
- `src/components/auth/AuthForm.tsx`: desktop Google OAuth initiation.
- `package.json` and `package-lock.json`: Tauri CLI and desktop scripts.
- `README.md`: prerequisites, development, Supabase redirect, and installer instructions.
- `tests/tauri-desktop.test.mjs`: configuration/security regression tests.
- `tests/tauri-oauth.test.mjs`: browser/Tauri OAuth behavior tests.

---

### Task 1: Install Windows Prerequisites And Add The Tauri Scaffold

**Files:**
- Create: `tests/tauri-desktop.test.mjs`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/build.rs`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/capabilities/default.json`
- Create: `src-tauri/src/main.rs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: existing npm workspace and `public/icon.png`.
- Produces: `npm run desktop:dev`, `npm run desktop:check`, `npm run desktop:build`, and a compilable `scisiam-desktop` Rust crate.

- [ ] **Step 1: Verify and install Windows prerequisites**

Run each command separately in PowerShell:

```powershell
Get-Command rustc -ErrorAction SilentlyContinue
Get-Command cargo -ErrorAction SilentlyContinue
Get-Command cl -ErrorAction SilentlyContinue
```

Expected before installation on the current machine: `rustc` and `cargo` are absent. Install Rust stable MSVC:

```powershell
winget install --id Rustlang.Rustup --exact
rustup default stable-msvc
rustc --version
cargo --version
```

Expected: `rustc` is at least `1.77.2` and both commands exit 0. If the MSVC linker is absent, install Build Tools:

```powershell
winget install --id Microsoft.VisualStudio.2022.BuildTools --exact --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

Restart the terminal, then confirm `cargo --version` exits 0. Windows 10/11 should already contain WebView2; verify Microsoft Edge WebView2 Runtime appears in Installed Apps before installer QA.

- [ ] **Step 2: Write the failing scaffold test**

Create `tests/tauri-desktop.test.mjs`:

```javascript
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Tauri Windows scaffold uses a local launcher and a fixed deep-link scheme", () => {
  assert.equal(existsSync(new URL("../src-tauri/Cargo.toml", import.meta.url)), true);
  const config = JSON.parse(read("src-tauri/tauri.conf.json"));

  assert.equal(config.productName, "Scisiam");
  assert.equal(config.identifier, "com.scisiam.desktop");
  assert.equal(config.build.frontendDist, "launcher");
  assert.deepEqual(config.bundle.targets, ["nsis"]);
  assert.deepEqual(config.plugins["deep-link"].desktop.schemes, ["scisiam"]);
  assert.deepEqual(config.app.windows, []);
});

test("remote content receives no broad Tauri permissions", () => {
  const capability = JSON.parse(read("src-tauri/capabilities/default.json"));
  assert.deepEqual(capability.windows, ["main"]);
  assert.deepEqual(capability.permissions, []);
  assert.doesNotMatch(JSON.stringify(capability), /fs:|shell:|process:|opener:|deep-link:/);
});
```

- [ ] **Step 3: Run the scaffold test and verify RED**

Run:

```powershell
node --test tests/tauri-desktop.test.mjs
```

Expected: FAIL because `src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json` do not exist.

- [ ] **Step 4: Install the Tauri CLI and add desktop scripts**

Run:

```powershell
npm install --save-dev @tauri-apps/cli@2.11.4
```

Add these scripts to `package.json` without changing existing scripts:

```json
"desktop:dev": "tauri dev",
"desktop:check": "cargo check --manifest-path src-tauri/Cargo.toml",
"desktop:build": "tauri build --bundles nsis"
```

- [ ] **Step 5: Create the minimal Rust crate**

Create `src-tauri/Cargo.toml`:

```toml
[package]
name = "scisiam-desktop"
version = "0.1.0"
description = "SciSiam Virtual Lab for Windows"
authors = ["SciSiam"]
edition = "2021"
rust-version = "1.77.2"

[lib]
name = "scisiam_desktop_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-deep-link = "2"
tauri-plugin-opener = "2"
url = "2.5"

[target.'cfg(any(target_os = "macos", windows, target_os = "linux"))'.dependencies]
tauri-plugin-single-instance = { version = "2", features = ["deep-link"] }
```

Create `src-tauri/build.rs`:

```rust
fn main() {
    tauri_build::build();
}
```

Create `src-tauri/src/main.rs`:

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    scisiam_desktop_lib::run();
}
```

- [ ] **Step 6: Add Tauri configuration and the empty capability boundary**

Create `src-tauri/tauri.conf.json`:

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Scisiam",
  "version": "0.1.0",
  "identifier": "com.scisiam.desktop",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:3000",
    "frontendDist": "launcher"
  },
  "app": {
    "windows": [],
    "security": {
      "csp": "default-src 'self'; connect-src https://scisiam-app.vercel.app; img-src 'self' data:; style-src 'self'; script-src 'self'"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["nsis"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.ico"
    ]
  },
  "plugins": {
    "deep-link": {
      "desktop": {
        "schemes": ["scisiam"]
      }
    }
  }
}
```

Create `src-tauri/capabilities/default.json`:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "main-no-remote-ipc",
  "description": "The remote SciSiam web application has no native IPC permissions.",
  "windows": ["main"],
  "permissions": []
}
```

- [ ] **Step 7: Run the scaffold test and verify GREEN**

Run:

```powershell
node --test tests/tauri-desktop.test.mjs
```

Expected: 2 tests pass.

- [ ] **Step 8: Commit the scaffold**

```powershell
git add package.json package-lock.json tests/tauri-desktop.test.mjs src-tauri/Cargo.toml src-tauri/build.rs src-tauri/tauri.conf.json src-tauri/capabilities/default.json src-tauri/src/main.rs
git commit -m "build: scaffold Tauri Windows app"
```

---

### Task 2: Implement And Test The Rust URL Security Policy

**Files:**
- Create: `src-tauri/src/navigation.rs`
- Modify: `src-tauri/src/lib.rs`

**Interfaces:**
- Consumes: `url::Url`, production/development origins, and the `scisiam://auth/callback` URL.
- Produces: `NavigationDecision`, `classify_navigation`, `parse_oauth_callback`, and `build_web_callback` for Task 3.

- [ ] **Step 1: Write failing Rust unit tests in `src-tauri/src/navigation.rs`**

Start the file with these tests while the functions remain absent:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    fn app_origin() -> Url {
        Url::parse("https://scisiam-app.vercel.app").unwrap()
    }

    fn supabase_origin() -> Url {
        Url::parse("https://ekcsbxirzsbdlemtfanf.supabase.co").unwrap()
    }

    #[test]
    fn keeps_only_scisiam_navigation_inside_the_webview() {
        let app = app_origin();
        let supabase = supabase_origin();
        assert_eq!(
            classify_navigation(&Url::parse("https://scisiam-app.vercel.app/labs").unwrap(), &app, &supabase),
            NavigationDecision::AllowInApp,
        );
        assert_eq!(
            classify_navigation(&Url::parse("https://example.com/help").unwrap(), &app, &supabase),
            NavigationDecision::OpenExternal,
        );
        assert_eq!(
            classify_navigation(&Url::parse("javascript:alert(1)").unwrap(), &app, &supabase),
            NavigationDecision::Block,
        );
    }

    #[test]
    fn opens_only_the_expected_supabase_authorize_path_externally() {
        let app = app_origin();
        let supabase = supabase_origin();
        let authorize = Url::parse("https://ekcsbxirzsbdlemtfanf.supabase.co/auth/v1/authorize?provider=google").unwrap();
        assert_eq!(classify_navigation(&authorize, &app, &supabase), NavigationDecision::OpenExternal);

        let wrong_path = Url::parse("https://ekcsbxirzsbdlemtfanf.supabase.co/storage/v1/object/private").unwrap();
        assert_eq!(classify_navigation(&wrong_path, &app, &supabase), NavigationDecision::Block);
    }

    #[test]
    fn validates_and_forwards_one_pkce_code() {
        let deep_link = Url::parse("scisiam://auth/callback?code=abc-123_XYZ").unwrap();
        let code = parse_oauth_callback(&deep_link).unwrap();
        assert_eq!(code, "abc-123_XYZ");

        let callback = build_web_callback(&app_origin(), &code);
        assert_eq!(
            callback.as_str(),
            "https://scisiam-app.vercel.app/auth/oauth-callback?code=abc-123_XYZ&next=%2Fprofile",
        );
    }

    #[test]
    fn rejects_forged_or_ambiguous_callbacks() {
        for value in [
            "https://auth/callback?code=abc",
            "scisiam://evil/callback?code=abc",
            "scisiam://auth/wrong?code=abc",
            "scisiam://auth/callback",
            "scisiam://auth/callback?code=one&code=two",
            "scisiam://auth/callback?code=abc#access_token=secret",
        ] {
            assert!(parse_oauth_callback(&Url::parse(value).unwrap()).is_err(), "{value}");
        }

        let oversized = format!("scisiam://auth/callback?code={}", "a".repeat(2049));
        assert!(parse_oauth_callback(&Url::parse(&oversized).unwrap()).is_err());
    }
}
```

- [ ] **Step 2: Expose the module and verify RED**

Create `src-tauri/src/lib.rs` with:

```rust
mod navigation;

pub fn run() {}
```

Run:

```powershell
cargo test --manifest-path src-tauri/Cargo.toml
```

Expected: FAIL because `NavigationDecision`, `classify_navigation`, `parse_oauth_callback`, and `build_web_callback` are undefined.

- [ ] **Step 3: Implement the minimal URL policy above the tests**

Add to `src-tauri/src/navigation.rs`:

```rust
use url::Url;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NavigationDecision {
    AllowInApp,
    OpenExternal,
    Block,
}

fn same_origin(left: &Url, right: &Url) -> bool {
    left.scheme() == right.scheme()
        && left.host_str() == right.host_str()
        && left.port_or_known_default() == right.port_or_known_default()
}

pub fn classify_navigation(url: &Url, app_origin: &Url, supabase_origin: &Url) -> NavigationDecision {
    if same_origin(url, app_origin) {
        if url.query_pairs().any(|(key, value)| key == "desktop-browser" && value == "1") {
            return NavigationDecision::OpenExternal;
        }
        return NavigationDecision::AllowInApp;
    }

    if same_origin(url, supabase_origin) {
        return if url.path() == "/auth/v1/authorize" {
            NavigationDecision::OpenExternal
        } else {
            NavigationDecision::Block
        };
    }

    if url.scheme() == "https" {
        NavigationDecision::OpenExternal
    } else {
        NavigationDecision::Block
    }
}

pub fn parse_oauth_callback(url: &Url) -> Result<String, &'static str> {
    if url.scheme() != "scisiam" || url.host_str() != Some("auth") || url.path() != "/callback" {
        return Err("invalid callback destination");
    }
    if url.fragment().is_some() {
        return Err("callback fragments are forbidden");
    }

    let codes: Vec<String> = url
        .query_pairs()
        .filter(|(key, _)| key == "code")
        .map(|(_, value)| value.into_owned())
        .collect();
    if codes.len() != 1 || codes[0].is_empty() || codes[0].len() > 2048 {
        return Err("callback must contain one bounded code");
    }
    Ok(codes[0].clone())
}

pub fn build_web_callback(app_origin: &Url, code: &str) -> Url {
    let mut callback = app_origin.join("/auth/oauth-callback").expect("valid app origin");
    callback
        .query_pairs_mut()
        .append_pair("code", code)
        .append_pair("next", "/profile");
    callback
}
```

- [ ] **Step 4: Verify the URL policy GREEN**

Run:

```powershell
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
```

Expected: formatting check exits 0 and 4 Rust tests pass.

- [ ] **Step 5: Commit the policy**

```powershell
git add src-tauri/src/navigation.rs src-tauri/src/lib.rs
git commit -m "test: define secure desktop navigation policy"
```

---

### Task 3: Build The Tauri Window, Deep-Link Runtime, And Offline Launcher

**Files:**
- Modify: `src-tauri/src/lib.rs`
- Create: `src-tauri/launcher/index.html`
- Create: `src-tauri/launcher/launcher.css`
- Create: `src-tauri/launcher/launcher.js`
- Modify: `tests/tauri-desktop.test.mjs`

**Interfaces:**
- Consumes: Task 2 URL-policy functions and Tauri plugins.
- Produces: main WebView2 window, system-browser navigation, warm/cold deep-link handling, and local connection recovery UI.

- [ ] **Step 1: Add failing runtime assertions to `tests/tauri-desktop.test.mjs`**

Append:

```javascript
test("desktop runtime keeps OAuth and deep links in Rust", () => {
  const runtime = read("src-tauri/src/lib.rs");
  const launcher = read("src-tauri/launcher/launcher.js");

  assert.match(runtime, /tauri_plugin_single_instance::init/);
  assert.match(runtime, /tauri_plugin_deep_link::init/);
  assert.match(runtime, /on_open_url/);
  assert.match(runtime, /parse_oauth_callback/);
  assert.match(runtime, /classify_navigation/);
  assert.match(runtime, /__SCISIAM_DESKTOP__/);
  assert.match(launcher, /mode:\s*"no-cors"/);
  assert.match(launcher, /desktop-browser=1/);
});
```

- [ ] **Step 2: Run the runtime test and verify RED**

Run:

```powershell
node --test tests/tauri-desktop.test.mjs
```

Expected: FAIL because `lib.rs` does not initialize plugins and launcher files do not exist.

- [ ] **Step 3: Implement the Rust runtime in `src-tauri/src/lib.rs`**

Replace the file with:

```rust
mod navigation;

use navigation::{build_web_callback, classify_navigation, parse_oauth_callback, NavigationDecision};
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_opener::OpenerExt;
use url::Url;

const PRODUCTION_ORIGIN: &str = "https://scisiam-app.vercel.app";
const DEVELOPMENT_ORIGIN: &str = "http://localhost:3000";
const DEFAULT_SUPABASE_ORIGIN: &str = "https://ekcsbxirzsbdlemtfanf.supabase.co";

fn app_origin() -> Url {
    let value = if cfg!(debug_assertions) {
        DEVELOPMENT_ORIGIN
    } else {
        PRODUCTION_ORIGIN
    };
    Url::parse(value).expect("valid SciSiam origin")
}

fn supabase_origin() -> Url {
    let value = option_env!("SCISIAM_SUPABASE_ORIGIN").unwrap_or(DEFAULT_SUPABASE_ORIGIN);
    Url::parse(value).expect("valid Supabase origin")
}

fn focus_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn forward_deep_link(app: &AppHandle, url: &Url) {
    let Ok(code) = parse_oauth_callback(url) else {
        focus_main(app);
        return;
    };
    let callback = build_web_callback(&app_origin(), &code);
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.navigate(callback);
    }
    focus_main(app);
}

fn create_main_window(app: &tauri::App) -> tauri::Result<()> {
    let start_url = if cfg!(debug_assertions) {
        WebviewUrl::External(app_origin())
    } else {
        WebviewUrl::App("index.html".into())
    };
    let navigation_app = app.handle().clone();
    let allowed_app_origin = app_origin();
    let allowed_supabase_origin = supabase_origin();

    WebviewWindowBuilder::new(app, "main", start_url)
        .title("Scisiam")
        .inner_size(1440.0, 900.0)
        .min_inner_size(1024.0, 700.0)
        .center()
        .initialization_script(
            "Object.defineProperty(window, '__SCISIAM_DESKTOP__', { value: true, configurable: false, writable: false });",
        )
        .on_navigation(move |url| {
            match classify_navigation(url, &allowed_app_origin, &allowed_supabase_origin) {
                NavigationDecision::AllowInApp => true,
                NavigationDecision::OpenExternal => {
                    let _ = navigation_app.opener().open_url(url.as_str(), None::<&str>);
                    false
                }
                NavigationDecision::Block => false,
            }
        })
        .build()?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            focus_main(app);
        }));
    }

    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            create_main_window(app)?;

            #[cfg(all(debug_assertions, windows))]
            app.deep_link().register_all()?;

            if let Some(urls) = app.deep_link().get_current()? {
                for url in urls {
                    forward_deep_link(app.handle(), &url);
                }
            }

            let handle = app.handle().clone();
            app.deep_link().on_open_url(move |event| {
                for url in event.urls() {
                    forward_deep_link(&handle, url);
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run SciSiam desktop");
}
```

- [ ] **Step 4: Create the local connection page**

Create `src-tauri/launcher/index.html`:

```html
<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Scisiam</title>
    <link rel="stylesheet" href="launcher.css" />
  </head>
  <body>
    <main class="card" aria-live="polite">
      <img src="app-icon.png" width="88" height="88" alt="น้องไออุ่น มาสคอต Scisiam" />
      <h1>Scisiam</h1>
      <p id="status">กำลังเชื่อมต่อห้องแล็บ...</p>
      <div id="actions" hidden>
        <button id="retry" type="button">ลองใหม่</button>
        <a href="https://scisiam-app.vercel.app/?desktop-browser=1">เปิดในเบราว์เซอร์</a>
      </div>
    </main>
    <script src="launcher.js"></script>
  </body>
</html>
```

Copy `public/ai-oon-logo.png` to `src-tauri/launcher/app-icon.png` using `Copy-Item`, then create `src-tauri/launcher/launcher.js`:

```javascript
const APP_ORIGIN = "https://scisiam-app.vercel.app";
const status = document.querySelector("#status");
const actions = document.querySelector("#actions");
const retry = document.querySelector("#retry");

async function connect() {
  status.textContent = "กำลังเชื่อมต่อห้องแล็บ...";
  actions.hidden = true;
  try {
    await fetch(`${APP_ORIGIN}/favicon.png?desktop-check=${Date.now()}`, {
      mode: "no-cors",
      cache: "no-store",
    });
    window.location.replace(APP_ORIGIN);
  } catch {
    status.textContent = "เชื่อมต่อ Scisiam ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต";
    actions.hidden = false;
  }
}

retry.addEventListener("click", connect);
void connect();
```

Create `src-tauri/launcher/launcher.css`:

```css
:root { font-family: "Noto Sans Thai", "Segoe UI", sans-serif; color: #0f172a; background: #eff6ff; }
* { box-sizing: border-box; }
body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 24px; }
.card { width: min(440px, 100%); padding: 40px; border: 1px solid #dbeafe; border-radius: 28px; background: white; text-align: center; box-shadow: 0 24px 60px rgb(15 23 42 / 12%); }
img { border-radius: 22px; }
h1 { margin: 16px 0 4px; color: #1d4ed8; font-size: 32px; }
p { margin: 0; line-height: 1.7; color: #64748b; font-weight: 600; }
#actions { margin-top: 24px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
#actions[hidden] { display: none; }
button, a { min-height: 44px; border-radius: 12px; padding: 11px 18px; font: inherit; font-weight: 800; text-decoration: none; cursor: pointer; }
button { border: 0; background: #2563eb; color: white; }
a { border: 1px solid #bfdbfe; color: #1d4ed8; background: #eff6ff; }
button:focus-visible, a:focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
```

- [ ] **Step 5: Verify runtime tests and Rust compilation**

Run:

```powershell
node --test tests/tauri-desktop.test.mjs
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
```

Expected: Node tests pass; Rust formatting, tests, and compilation exit 0.

- [ ] **Step 6: Commit the runtime**

```powershell
git add tests/tauri-desktop.test.mjs src-tauri/src/lib.rs src-tauri/launcher
git commit -m "feat: add secure Tauri desktop runtime"
```

---

### Task 4: Adapt Google OAuth For System-Browser PKCE

**Files:**
- Create: `src/lib/desktop-runtime.ts`
- Modify: `src/components/auth/AuthForm.tsx`
- Create: `tests/tauri-oauth.test.mjs`
- Modify: `tests/google-oauth.test.mjs`

**Interfaces:**
- Consumes: injected `window.__SCISIAM_DESKTOP__`, current web origin, and existing Supabase browser client.
- Produces: `isScisiamDesktop()` and `getGoogleOAuthOptions(origin, desktop)`; browser OAuth remains HTTPS while desktop OAuth uses the custom callback.

- [ ] **Step 1: Write the failing OAuth behavior test**

Create `tests/tauri-oauth.test.mjs`:

```javascript
import assert from "node:assert/strict";
import test from "node:test";
import { getGoogleOAuthOptions } from "../src/lib/desktop-runtime.ts";

test("desktop Google OAuth uses system-browser PKCE callback", () => {
  assert.deepEqual(getGoogleOAuthOptions("https://scisiam-app.vercel.app", true), {
    redirectTo: "scisiam://auth/callback",
    skipBrowserRedirect: true,
    queryParams: { prompt: "select_account" },
  });
});

test("browser Google OAuth keeps the existing HTTPS callback", () => {
  assert.deepEqual(getGoogleOAuthOptions("https://scisiam-app.vercel.app", false), {
    redirectTo: "https://scisiam-app.vercel.app/auth/oauth-callback?next=/profile",
    skipBrowserRedirect: false,
    queryParams: { prompt: "select_account" },
  });
});
```

- [ ] **Step 2: Run the OAuth test and verify RED**

Run:

```powershell
node --test tests/tauri-oauth.test.mjs
```

Expected: FAIL because `src/lib/desktop-runtime.ts` does not exist.

- [ ] **Step 3: Implement the browser-safe desktop helper**

Create `src/lib/desktop-runtime.ts`:

```typescript
declare global {
  interface Window {
    __SCISIAM_DESKTOP__?: boolean;
  }
}

export function isScisiamDesktop() {
  return typeof window !== "undefined" && window.__SCISIAM_DESKTOP__ === true;
}

export function getGoogleOAuthOptions(origin: string, desktop: boolean) {
  return {
    redirectTo: desktop
      ? "scisiam://auth/callback"
      : `${origin}/auth/oauth-callback?next=/profile`,
    skipBrowserRedirect: desktop,
    queryParams: { prompt: "select_account" },
  };
}
```

- [ ] **Step 4: Update `AuthForm.tsx` without changing browser login**

Import the helper:

```typescript
import { getGoogleOAuthOptions, isScisiamDesktop } from "@/lib/desktop-runtime";
```

Replace the OAuth options block in `handleGoogleAuth` with:

```typescript
const desktop = isScisiamDesktop();
const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: getGoogleOAuthOptions(window.location.origin, desktop),
});

if (oauthError) {
  setError("เชื่อมต่อบัญชี Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
  setOauthLoading(false);
  return;
}

if (desktop) {
  if (!data.url) {
    setError("ไม่พบลิงก์เข้าสู่ระบบ Google กรุณาลองใหม่อีกครั้ง");
  } else {
    window.location.assign(data.url);
  }
  setOauthLoading(false);
}
```

The Rust navigation handler cancels the WebView navigation and opens `data.url` externally after validating the Supabase origin/path.

- [ ] **Step 5: Update the existing static regression assertions**

In the first test in `tests/google-oauth.test.mjs`, add:

```javascript
const desktopRuntime = readProjectFile("src/lib/desktop-runtime.ts");
```

Replace the literal `redirectTo` assertion with:

```javascript
assert.match(authForm, /getGoogleOAuthOptions\(window\.location\.origin, desktop\)/);
assert.match(desktopRuntime, /auth\/oauth-callback\?next=\/profile/);
assert.match(desktopRuntime, /scisiam:\/\/auth\/callback/);
```

Replace the body of `Google OAuth always asks the user to select an account` with:

```javascript
const desktopRuntime = readProjectFile("src/lib/desktop-runtime.ts");
assert.match(
  desktopRuntime,
  /queryParams:\s*\{\s*prompt:\s*["']select_account["']\s*\}/,
);
```

- [ ] **Step 6: Verify OAuth GREEN**

Run:

```powershell
node --test tests/tauri-oauth.test.mjs tests/google-oauth.test.mjs
npm run lint
npm run build
```

Expected: all OAuth tests pass, ESLint exits 0, and Next.js production build exits 0.

- [ ] **Step 7: Commit OAuth support**

```powershell
git add src/lib/desktop-runtime.ts src/components/auth/AuthForm.tsx tests/tauri-oauth.test.mjs tests/google-oauth.test.mjs
git commit -m "feat: support desktop Google OAuth callback"
```

---

### Task 5: Generate Branding And Build The NSIS Installer

**Files:**
- Create: `src-tauri/icons/32x32.png`
- Create: `src-tauri/icons/128x128.png`
- Create: `src-tauri/icons/128x128@2x.png`
- Create: `src-tauri/icons/icon.ico`
- Modify: `.gitignore`
- Modify: `tests/tauri-desktop.test.mjs`

**Interfaces:**
- Consumes: `public/icon.png`, Tauri CLI, and Task 1 bundle configuration.
- Produces: branded Windows executable resources and an ignored installer output directory.

- [ ] **Step 1: Add failing icon and output assertions**

Append to `tests/tauri-desktop.test.mjs`:

```javascript
test("desktop branding exists and generated bundles stay untracked", () => {
  for (const path of [
    "src-tauri/icons/32x32.png",
    "src-tauri/icons/128x128.png",
    "src-tauri/icons/128x128@2x.png",
    "src-tauri/icons/icon.ico",
  ]) {
    assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true, path);
  }
  assert.match(read(".gitignore"), /src-tauri\/target/);
});
```

- [ ] **Step 2: Verify icon test RED**

Run:

```powershell
node --test tests/tauri-desktop.test.mjs
```

Expected: FAIL because generated icons do not exist.

- [ ] **Step 3: Generate Tauri icons from the existing brand asset**

Run:

```powershell
npx tauri icon public/icon.png
```

Expected: Tauri writes Windows and cross-platform icon sizes under `src-tauri/icons/`. Keep the four files referenced by `tauri.conf.json`; generated extra icon sizes may remain if produced by the official command.

- [ ] **Step 4: Ignore Rust and installer build output**

Append to `.gitignore`:

```gitignore
# Tauri / Rust build output
src-tauri/target/
```

- [ ] **Step 5: Verify branding and produce the installer**

Run:

```powershell
node --test tests/tauri-desktop.test.mjs
npm run desktop:build
```

Expected: tests pass and an NSIS installer is created under `src-tauri/target/release/bundle/nsis/`. Do not stage that generated directory.

- [ ] **Step 6: Commit branding configuration**

```powershell
git add .gitignore src-tauri/icons tests/tauri-desktop.test.mjs
git commit -m "build: add Scisiam Windows installer branding"
```

---

### Task 6: Document Supabase Redirect And Desktop Operations

**Files:**
- Modify: `README.md`
- Modify: `tests/tauri-desktop.test.mjs`

**Interfaces:**
- Consumes: completed desktop scripts and fixed OAuth redirect.
- Produces: exact operator instructions for Supabase, development, installer generation, and release security.

- [ ] **Step 1: Add failing documentation assertions**

Append to `tests/tauri-desktop.test.mjs`:

```javascript
test("README documents the required desktop redirect and commands", () => {
  const readme = read("README.md");
  assert.match(readme, /scisiam:\/\/auth\/callback/);
  assert.match(readme, /npm run desktop:dev/);
  assert.match(readme, /npm run desktop:build/);
  assert.match(readme, /Additional Redirect URLs/);
  assert.match(readme, /Google OAuth/);
});
```

- [ ] **Step 2: Verify documentation test RED**

Run:

```powershell
node --test tests/tauri-desktop.test.mjs
```

Expected: FAIL because README does not contain the desktop setup section.

- [ ] **Step 3: Add the exact Windows desktop section to README**

Document:

```markdown
## Windows Desktop (Tauri)

Prerequisites: Windows 10/11, Edge WebView2 Runtime, Rust stable MSVC 1.77.2+, and Visual Studio Build Tools with Desktop development with C++.

In Supabase Dashboard → Authentication → URL Configuration, keep the HTTPS Site URL and add this exact Additional Redirect URL:

`scisiam://auth/callback`

Commands:

- `npm run desktop:dev` starts Next.js and the Tauri development window.
- `npm run desktop:check` checks the Rust desktop crate.
- `npm run desktop:build` creates the NSIS installer.

Google OAuth opens in the system browser and returns through the registered `scisiam://` protocol. Never place `GEMINI_API_KEY`, Supabase service-role credentials, database passwords, or signing credentials in Tauri source/configuration.
```

- [ ] **Step 4: Configure the hosted Supabase redirect**

In Supabase Dashboard, open Authentication → URL Configuration and add exactly:

```text
scisiam://auth/callback
```

Keep the existing Site URL as `https://scisiam-app.vercel.app`. Save, then confirm the redirect appears in Additional Redirect URLs. No wildcard custom scheme is required.

- [ ] **Step 5: Verify and commit documentation**

Run:

```powershell
node --test tests/tauri-desktop.test.mjs
```

Expected: all desktop tests pass.

```powershell
git add README.md tests/tauri-desktop.test.mjs
git commit -m "docs: add Tauri Windows setup"
```

---

### Task 7: Complete Security, Regression, And Installed-App Verification

**Files:**
- Modify only if verification exposes a defect: files owned by Tasks 1-6 and their matching tests.

**Interfaces:**
- Consumes: completed Tauri wrapper, web OAuth adaptation, NSIS output, and Supabase redirect configuration.
- Produces: release evidence for the Windows desktop package.

- [ ] **Step 1: Run the complete automated web verification**

Run:

```powershell
npm test
npm run lint
npm run build
```

Expected: all Node regression tests pass, ESLint exits 0, and Next.js production build exits 0.

- [ ] **Step 2: Run the complete Rust verification**

Run:

```powershell
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets --all-features -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
```

Expected: all commands exit 0 and the URL-policy unit tests pass.

- [ ] **Step 3: Run the required secret scan**

Run:

```powershell
rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!src-tauri/target' -g '!.git' "AIza[0-9A-Za-z_-]{20,}|sk-proj-[0-9A-Za-z_-]{20,}|SUPABASE_SERVICE_ROLE|DATABASE_URL\s*=|GEMINI_API_KEY\s*="
```

Expected: only documented example variable names or security-check patterns appear; no credential value appears in source, configuration, launcher assets, or Rust files.

- [ ] **Step 4: Build and install the NSIS package**

Run:

```powershell
npm run desktop:build
Get-ChildItem src-tauri/target/release/bundle/nsis/*.exe
```

Expected: one versioned Scisiam installer. Install it and verify Windows registers `scisiam://` to the installed executable.

- [ ] **Step 5: Complete manual Windows QA**

Verify each behavior and record pass/fail in the implementation handoff:

1. Offline cold start shows the Thai local connection page.
2. Retry opens SciSiam after connectivity returns.
3. Email login reaches the correct student/teacher destination.
4. Google login opens the system browser, returns to the already-running app, exchanges the PKCE code, and reaches `/profile`.
5. Google login also works from a cold app launch triggered by `scisiam://auth/callback`.
6. Canceling Google login leaves the button usable.
7. A forged callback such as `scisiam://evil/callback?code=x` is ignored.
8. External HTTPS links open in the system browser; internal Scisiam links stay in-app.
9. File upload, experiment save/snapshot, classroom submission, teacher review, and AI ไออุ่น work in WebView2.
10. Uninstall removes the registered protocol, and reinstall restores it.

- [ ] **Step 6: Update Graphify and inspect Git state**

Run:

```powershell
graphify update .
git diff --check
git status --short
```

Expected: graph update succeeds, diff check is clean, installer output is ignored, and only intended source/docs changes remain.

- [ ] **Step 7: Commit any verification-only corrections**

If verification required source corrections, rerun the failing command and then commit only those verified corrections:

```powershell
git add src-tauri src/lib/desktop-runtime.ts src/components/auth/AuthForm.tsx tests package.json package-lock.json README.md .gitignore
git commit -m "fix: complete Tauri Windows release checks"
```

If no correction was needed, do not create an empty commit.
