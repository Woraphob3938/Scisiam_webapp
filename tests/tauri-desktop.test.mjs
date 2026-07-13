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

test("Tauri library exports the minimal Task 1 run entrypoint", () => {
  assert.equal(existsSync(new URL("../src-tauri/src/lib.rs", import.meta.url)), true);
  const library = read("src-tauri/src/lib.rs");

  assert.match(library, /pub\s+fn\s+run\s*\(\s*\)\s*\{\s*\}/);
});
