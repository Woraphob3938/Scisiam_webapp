import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const toastSource = fs.readFileSync(
  new URL("../src/lib/experiment-save-toast.ts", import.meta.url),
  "utf8",
);
const syncSource = fs.readFileSync(
  new URL("../src/lib/supabase/experiment-sync.ts", import.meta.url),
  "utf8",
);
const simulationDirectory = new URL("../src/components/labs/simulation/", import.meta.url);

test("experiment saves show the compact light-blue success notice for two seconds", () => {
  assert.match(toastSource, /บันทึกสำเร็จ ให้ดูที่ผลการทดลอง/);
  assert.match(toastSource, /duration: 2000/);
  assert.match(toastSource, /position: "top-center"/);
  assert.match(toastSource, /background: "#eff8ff"/);
  assert.match(syncSource, /showExperimentSaveToast\(\)/);
});

test("simulations do not open a second blocking save-success alert", () => {
  const duplicateAlerts = fs
    .readdirSync(simulationDirectory)
    .filter((file) => file.endsWith(".tsx"))
    .flatMap((file) => {
      const source = fs.readFileSync(new URL(file, simulationDirectory), "utf8");
      const lines = source.split(/\r?\n/);
      return lines.flatMap((line, index) => {
        if (!line.includes("await saveExperimentAndSync({")) return [];

        const nearbySource = lines.slice(index, index + 24).join("\n");
        const blockingSuccessAlert =
          /(?:window\.)?alert\([^)]*(?:บันทึกสำเร็จ|บันทึกเรียบร้อย|Saved successfully)[^)]*\)/i.exec(
            nearbySource,
          );

        return blockingSuccessAlert
          ? [`${path.basename(file)}: ${blockingSuccessAlert[0]}`]
          : [];
      });
    });

  assert.deepEqual(duplicateAlerts, []);
});
