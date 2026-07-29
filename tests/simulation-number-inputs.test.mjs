import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const manualNumberInputSource = fs.readFileSync(
  new URL("../src/components/labs/simulation/ManualNumberInput.tsx", import.meta.url),
  "utf8",
);
const unifiedLegacySource = fs.readFileSync(
  new URL("../src/components/labs/simulation/UnifiedLegacySimulation.tsx", import.meta.url),
  "utf8",
);
const ratioSource = fs.readFileSync(
  new URL("../src/components/labs/simulation/RatioProportionSimulation.tsx", import.meta.url),
  "utf8",
);

test("shared number input supports clear, negative, decimal, and comma drafts", () => {
  assert.match(manualNumberInputSource, /type="text"/);
  assert.match(manualNumberInputSource, /inputMode="decimal"/);
  assert.match(manualNumberInputSource, /rawValue\.replace\(",", "\."\)/);
  assert.match(manualNumberInputSource, /isEditableNumberDraft/);
  assert.match(manualNumberInputSource, /onBlur=\{commitDraft\}/);
  assert.match(manualNumberInputSource, /event\.key === "Enter"/);
});

test("legacy and ratio simulations reuse the mobile-safe number input", () => {
  assert.match(unifiedLegacySource, /BoundedNumberInput/);
  assert.match(ratioSource, /BoundedNumberInput/);
});
