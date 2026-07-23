import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("settings links to the permanent Scisiam usage guide", () => {
  const settings = read("src/components/SettingsModal.tsx");

  assert.match(settings, /href="\/guide"/);
  assert.match(settings, /คู่มือการใช้งาน/);
  assert.match(settings, /onClick=\{onClose\}/);
});

test("guide covers student and teacher workflows with real destinations", () => {
  const guide = read("src/app/guide/page.tsx");

  assert.match(guide, /aria-label="สารบัญคู่มือการใช้งาน"/);
  assert.match(guide, /สำหรับนักเรียน/);
  assert.match(guide, /สำหรับคุณครู/);
  assert.match(guide, /href="\/labs"/);
  assert.match(guide, /href="\/classrooms"/);
  assert.match(guide, /href: "\/profile"/);
  assert.match(guide, /<h1/);
  assert.match(guide, /<ol/);
});
