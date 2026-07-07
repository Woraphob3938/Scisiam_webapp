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
  assert.match(source, /HeaderStat icon=\{FlaskConical\}/);
  assert.match(source, /HeaderStat icon=\{UsersRound\}/);
});

test("classroom owner can manage the room, members, and classwork", () => {
  for (const label of ["เปลี่ยนชื่อห้อง", "ยุบห้องเรียน", "เพิ่มงาน", "นำออก"]) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /room\.isCreator/);
  assert.match(source, /removeClassroomMember/);
  assert.match(source, /createClassroomAssignment/);
});

test("classroom tabs are prominent, count-free, and keep the active line inside", () => {
  assert.match(source, /ห้องแล็บ<\/TabsTrigger>/);
  assert.match(source, /งานของชั้นเรียน<\/TabsTrigger>/);
  assert.match(source, /สมาชิก<\/TabsTrigger>/);
  assert.doesNotMatch(source, /ห้องแล็บ \{roomLabs\.length\}/);
  assert.doesNotMatch(source, /บุคคล \{orderedMembers\.length\}/);
  assert.match(source, /after:bottom-0/);
  assert.match(source, /data-active:bg-blue-50/);
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
