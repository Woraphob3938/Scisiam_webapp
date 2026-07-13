import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const rootDirectory = fileURLToPath(new URL("../", import.meta.url));
const desktopIconPaths = [
  "icons/32x32.png",
  "icons/128x128.png",
  "icons/128x128@2x.png",
  "icons/icon.ico",
];
const git = (...args) => spawnSync("git", args, { cwd: rootDirectory, encoding: "utf8" });
const assertIgnoredByRepo = (path, expectedPattern) => {
  const result = spawnSync("git", ["check-ignore", "--stdin", "-z", "-v"], {
    cwd: rootDirectory,
    encoding: "utf8",
    input: `${path}\0`,
  });
  assert.equal(result.status, 0, result.stderr);
  const [source, line, pattern, matchedPath, trailing] = result.stdout.split("\0");

  assert.equal(source, ".gitignore");
  assert.match(line, /^[1-9]\d*$/);
  assert.equal(pattern, expectedPattern);
  assert.equal(matchedPath, path);
  assert.equal(trailing, "");
};

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

test("desktop binary commits its configured icons and dependency lockfile", () => {
  const config = JSON.parse(read("src-tauri/tauri.conf.json"));

  assert.deepEqual(config.bundle.icon, desktopIconPaths);
  assert.equal(existsSync(new URL("../src-tauri/Cargo.lock", import.meta.url)), true);
  for (const icon of desktopIconPaths) {
    assert.equal(
      existsSync(new URL(`../src-tauri/${icon}`, import.meta.url)),
      true,
      `${icon} must be committed`,
    );
  }
});

test("desktop branding uses valid committed assets and ignores only build output", () => {
  const config = JSON.parse(read("src-tauri/tauri.conf.json"));

  assert.deepEqual(config.bundle.icon, desktopIconPaths);
  assert.equal(existsSync(new URL("../public/icon.png", import.meta.url)), true);
  for (const icon of desktopIconPaths) {
    const asset = new URL(`../src-tauri/${icon}`, import.meta.url);
    const contents = readFileSync(asset);

    assert.equal(existsSync(asset), true, `${icon} must be committed`);
    assert.ok(statSync(asset).size > 0, `${icon} must not be empty`);
    if (icon.endsWith(".png")) {
      assert.deepEqual([...contents.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    } else {
      assert.deepEqual([...contents.subarray(0, 4)], [0, 0, 1, 0]);
    }
  }

  const sourceAssets = [
    "public/icon.png",
    "src-tauri/Cargo.lock",
    ...desktopIconPaths.map((icon) => `src-tauri/${icon}`),
  ];
  assert.equal(git("ls-files", "--error-unmatch", ...sourceAssets).status, 0);
  assertIgnoredByRepo("src-tauri/target/test-output", "src-tauri/target/");
  assertIgnoredByRepo("src-tauri/gen/test-output", "src-tauri/gen/");
  for (const sourceAsset of sourceAssets) {
    assert.equal(git("check-ignore", "--no-index", "-q", sourceAsset).status, 1, sourceAsset);
  }
});

test("desktop lint ignores only generated Tauri build output", async () => {
  const eslint = new ESLint({ cwd: rootDirectory });

  assert.equal(await eslint.isPathIgnored("src-tauri/target/test-output.js"), true);
  assert.equal(await eslint.isPathIgnored("src-tauri/gen/test-output.js"), true);
  assert.equal(await eslint.isPathIgnored("src/app/page.tsx"), false);
});

test("remote content receives no broad Tauri permissions", () => {
  const capability = JSON.parse(read("src-tauri/capabilities/default.json"));
  assert.deepEqual(capability.windows, ["main"]);
  assert.deepEqual(capability.permissions, []);
  assert.doesNotMatch(JSON.stringify(capability), /fs:|shell:|process:|opener:|deep-link:/);
});

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

test("desktop runtime denies secondary WebViews and handles native failures safely", () => {
  const runtime = read("src-tauri/src/lib.rs");

  assert.match(runtime, /\.on_new_window/);
  assert.match(runtime, /NewWindowResponse::Deny/);
  assert.match(runtime, /classify_navigation/);
  assert.match(runtime, /open_external_url/);
  assert.doesNotMatch(runtime, /NewWindowResponse::(?:Allow|Create)/);
  assert.match(runtime, /failed to open external URL in system browser/);
  assert.match(runtime, /failed to forward desktop OAuth callback/);
});

test("launcher bounds connection attempts and restores recovery actions", () => {
  const launcher = read("src-tauri/launcher/launcher.js");

  assert.match(launcher, /new AbortController\(\)/);
  assert.match(launcher, /setTimeout\([^]*\.abort\(\)/);
  assert.match(launcher, /signal:\s*controller\.signal/);
  assert.match(launcher, /finally\s*\{[^]*clearTimeout\(/);
  assert.match(launcher, /catch\s*\{[^]*actions\.hidden\s*=\s*false/);
});

test("README documents the required desktop redirect and commands", () => {
  const readme = read("README.md");

  assert.match(readme, /scisiam:\/\/auth\/callback/);
  assert.match(readme, /https:\/\/scisiam-app\.vercel\.app/);
  assert.match(readme, /npm run desktop:dev/);
  assert.match(readme, /npm run desktop:build/);
  assert.match(readme, /Additional Redirect URLs/);
  assert.match(readme, /Google OAuth/);
});
