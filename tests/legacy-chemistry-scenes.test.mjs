import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/components/labs/simulation/UnifiedLegacySimulation.tsx", import.meta.url),
  "utf8",
);

test("legacy chemistry labs use dedicated accessible experiment scenes", () => {
  const scenes = [
    "acid-base-titration-apparatus",
    "boyle-law-apparatus",
    "charles-law-apparatus",
  ];

  for (const scene of scenes) {
    assert.match(source, new RegExp(`data-testid="${scene}"`), scene);
  }

  assert.match(source, /aria-labelledby=\{`\$\{sceneId\}-title \$\{sceneId\}-description`\}/);
  assert.match(source, /<title id=\{`\$\{sceneId\}-title`\}>/);
  assert.match(source, /<desc id=\{`\$\{sceneId\}-description`\}>/);
});

test("redesigned chemistry scenes stay connected to live experiment values", () => {
  assert.match(source, /ph=\{result\.primary\}/);
  assert.match(source, /baseVolume=\{getValue\(values, "baseVolume"\)\}/);
  assert.match(source, /pressure=\{result\.primary\}/);
  assert.match(source, /temperature=\{getValue\(values, "temperature"\)\}/);
  assert.match(source, /volume=\{result\.primary\}/);
});
