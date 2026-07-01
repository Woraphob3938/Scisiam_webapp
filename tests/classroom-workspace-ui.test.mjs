import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const source = fs.readFileSync(
  path.join(process.cwd(), "src", "app", "classrooms", "[id]", "page.tsx"),
  "utf8",
);

test("classroom workspace presents a compact room overview with useful counts", () => {
  assert.match(source, /aria-labelledby="classroom-overview-heading"/);
  assert.match(source, /id="classroom-overview-heading"/);
  assert.match(source, /<JoinCodePanel/);
  assert.match(source, /ห้องแล็บ \{roomLabs\.length\}/);
  assert.match(source, /บุคคล \{orderedMembers\.length\}/);
});

test("classroom lab cards expose readiness and keep one clear entry action", () => {
  assert.match(source, /getLabReadiness/);
  assert.match(source, /readiness\.label/);
  assert.match(source, /lab\.description/);
  assert.match(source, /เข้าห้อง/);
});

test("classroom people view separates teachers and students", () => {
  assert.match(source, /teacherMembers/);
  assert.match(source, /studentMembers/);
  assert.match(source, /คุณครูและผู้ดูแล/);
  assert.match(source, /นักเรียน/);
});
