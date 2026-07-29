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
const layoutSource = fs.readFileSync(
  new URL("../src/app/layout.tsx", import.meta.url),
  "utf8",
);

test("simulation fullscreen supports iOS fallback sizing and WebKit fullscreen", () => {
  assert.match(shellSource, /webkitRequestFullscreen/);
  assert.match(shellSource, /webkitExitFullscreen/);
  assert.match(shellSource, /webkitfullscreenchange/);
  assert.match(shellSource, /position:\s*"fixed"/);
  assert.match(shellSource, /height:\s*"100dvh"/);
  assert.match(shellSource, /width:\s*"100dvw"/);
  assert.match(shellSource, /nativeFullscreenStarted/);
  assert.match(
    shellSource,
    /if\s*\(!nativeFullscreenStarted\s*&&\s*fullscreenStage\?\.webkitRequestFullscreen\)/,
  );
  assert.match(shellSource, /document\.body\.style\.overflow = "hidden"/);
  assert.match(layoutSource, /viewportFit:\s*"cover"/);
});

test("the global top navigation stays hidden on simulation routes", () => {
  assert.match(navbarSource, /usePathname\(\)/);
  assert.match(navbarSource, /\/simulation\\\/\?\$/);
  assert.match(navbarSource, /return null/);
});
