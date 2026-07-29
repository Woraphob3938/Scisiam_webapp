import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const shellSource = fs.readFileSync(
  new URL("../src/components/labs/simulation/SharedSimulationShell.tsx", import.meta.url),
  "utf8",
);
const navbarSource = fs.readFileSync(
  new URL("../src/components/Navbar.tsx", import.meta.url),
  "utf8",
);

test("simulation fullscreen supports iOS fallback sizing and WebKit fullscreen", () => {
  assert.match(shellSource, /webkitRequestFullscreen/);
  assert.match(shellSource, /webkitExitFullscreen/);
  assert.match(shellSource, /webkitfullscreenchange/);
  assert.match(shellSource, /h-\[100dvh\]/);
  assert.match(shellSource, /w-\[100dvw\]/);
  assert.match(shellSource, /document\.body\.style\.overflow = "hidden"/);
});

test("the global top navigation stays hidden on simulation routes", () => {
  assert.match(navbarSource, /usePathname\(\)/);
  assert.match(navbarSource, /\/simulation\\\/\?\$/);
  assert.match(navbarSource, /return null/);
});
