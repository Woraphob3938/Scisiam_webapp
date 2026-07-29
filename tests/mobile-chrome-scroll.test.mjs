import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("mobile app chrome hides on downward scroll and returns on upward scroll", () => {
  const controller = read("src/components/MobileChromeController.tsx");
  const overlays = read("src/components/GlobalClientOverlays.tsx");
  const navbar = read("src/components/Navbar.tsx");
  const tabBar = read("src/components/MobileTabBar.tsx");

  assert.match(controller, /HIDE_AFTER_PX/);
  assert.match(controller, /SHOW_AFTER_PX/);
  assert.match(controller, /requestAnimationFrame/);
  assert.match(controller, /addEventListener\("scroll", handleScroll, \{ passive: true \}\)/);
  assert.match(controller, /data-mobile-chrome="hidden"/);
  assert.doesNotMatch(controller, /prefers-reduced-motion/);
  assert.match(overlays, /MobileChromeController/);
  assert.match(navbar, /mobile-chrome-top/);
  assert.match(tabBar, /mobile-chrome-bottom/);
});
