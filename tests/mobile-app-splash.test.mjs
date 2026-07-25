import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const readProjectFile = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

test("mobile app splash is lightweight, accessible, and mounted globally", () => {
  const splash = readProjectFile("src/components/MobileAppSplash.tsx");
  const layout = readProjectFile("src/app/layout.tsx");
  const videoPath = path.join(
    root,
    "public/media/scisiam-mobile-splash.mp4",
  );

  assert.match(layout, /<MobileAppSplash \/>/);
  assert.match(splash, /max-width: 767px/);
  assert.match(splash, /prefers-reduced-motion: reduce/);
  assert.match(splash, /sessionStorage/);
  assert.match(splash, /autoPlay/);
  assert.match(splash, /muted/);
  assert.match(splash, /playsInline/);
  assert.match(splash, /onEnded=\{closeSplash\}/);
  assert.match(splash, /onError=\{closeSplash\}/);
  assert.match(splash, /\/media\/scisiam-mobile-splash\.mp4/);
  assert.ok(fs.statSync(videoPath).size > 0);
});
