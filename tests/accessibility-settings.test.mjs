import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("display preferences are applied before hydration and synchronized globally", () => {
  const layout = read("src/app/layout.tsx");
  const overlays = read("src/components/GlobalClientOverlays.tsx");
  const preferences = read("src/lib/display-preferences.ts");

  assert.match(layout, /DISPLAY_PREFERENCES_BOOTSTRAP_SCRIPT/);
  assert.match(layout, /suppressHydrationWarning/);
  assert.match(layout, /dangerouslySetInnerHTML/);
  assert.match(preferences, /scisiam_display_reduce_motion/);
  assert.match(preferences, /scisiam_display_color_blind/);
  assert.match(preferences, /root\.dataset\.scisiamReduceMotion/);
  assert.match(preferences, /root\.dataset\.scisiamColorblind/);
  assert.match(overlays, /applyDisplayPreferences\(\)/);
  assert.match(overlays, /addEventListener\("storage"/);
});

test("accessibility settings cover reduced motion and color-independent cues", () => {
  const settings = read("src/components/SettingsModal.tsx");
  const globals = read("src/app/globals.css");

  assert.match(settings, /การเข้าถึงและการแสดงผล/);
  assert.match(settings, /มีผลกับทุกหน้าของ Scisiam/);
  assert.match(settings, /role="switch"/);
  assert.match(settings, /label="ลดแอนิเมชัน"/);
  assert.match(settings, /label="เปิดโหมดช่วยสำหรับผู้ตาบอดสี"/);
  assert.match(globals, /prefers-reduced-motion: reduce/);
  assert.match(globals, /data-scisiam-reduce-motion="true"/);
  assert.match(globals, /data-scisiam-colorblind="true"/);
  assert.match(globals, /--scisiam-cb-orange/);
  assert.match(globals, /\.bg-emerald-50/);
  assert.match(globals, /\.bg-red-50/);
  assert.match(globals, /\.bg-violet-50/);
  assert.match(globals, /\.bg-amber-50/);
  assert.match(globals, /repeating-linear-gradient/);
  assert.match(globals, /radial-gradient/);
});
