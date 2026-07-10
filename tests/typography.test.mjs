import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const globalsCss = fs.readFileSync(
  path.join(process.cwd(), "src", "app", "globals.css"),
  "utf8",
);

test("uses Noto Sans Thai as the global Thai UI font", () => {
  assert.match(globalsCss, /--font-sans:\s*'Noto Sans Thai', sans-serif;/);
  assert.match(globalsCss, /--font-heading:\s*'Noto Sans Thai', sans-serif;/);
  assert.match(globalsCss, /--font-looped:\s*'Noto Sans Thai', sans-serif;/);
  assert.match(globalsCss, /--font-mono:\s*'Noto Sans Thai', sans-serif;/);
  assert.match(globalsCss, /body\s*\{[^}]*font-family:\s*var\(--font-sans\)/s);
});
