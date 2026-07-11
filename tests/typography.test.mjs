import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const globalsCss = fs.readFileSync(
  path.join(process.cwd(), "src", "app", "globals.css"),
  "utf8",
);
const rootLayout = fs.readFileSync(
  path.join(process.cwd(), "src", "app", "layout.tsx"),
  "utf8",
);

test("uses Noto Sans Thai for UI text and Kanit for the Scisiam wordmark", () => {
  assert.match(rootLayout, /import \{ Kanit, Noto_Sans_Thai \} from "next\/font\/google"/);
  assert.match(rootLayout, /variable:\s*"--font-noto-sans-thai"/);
  assert.match(rootLayout, /variable:\s*"--font-kanit"/);
  assert.match(rootLayout, /\$\{notoSansThai\.variable\} \$\{kanit\.variable\} h-full antialiased/);
  assert.doesNotMatch(globalsCss, /fonts\.googleapis\.com/);
  assert.match(globalsCss, /--font-sans:\s*var\(--font-noto-sans-thai\), sans-serif;/);
  assert.match(globalsCss, /--font-heading:\s*var\(--font-noto-sans-thai\), sans-serif;/);
  assert.match(globalsCss, /--font-looped:\s*var\(--font-noto-sans-thai\), sans-serif;/);
  assert.match(globalsCss, /--font-mono:\s*var\(--font-noto-sans-thai\), sans-serif;/);
  assert.match(globalsCss, /body\s*\{[^}]*font-family:\s*var\(--font-sans\)/s);
  assert.match(globalsCss, /\.scisiam-wordmark\s*\{[^}]*font-family:\s*var\(--font-kanit\)/s);
});
