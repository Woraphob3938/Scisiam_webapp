import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const source = fs.readFileSync(
  path.join(process.cwd(), "src", "app", "classrooms", "[id]", "page.tsx"),
  "utf8",
);
const classroomsIndexSource = fs.readFileSync(
  path.join(process.cwd(), "src", "app", "classrooms", "page.tsx"),
  "utf8",
);

test("classroom workspace presents a compact room overview with useful counts", () => {
  assert.match(source, /aria-labelledby="classroom-overview-heading"/);
  assert.match(source, /id="classroom-overview-heading"/);
  assert.match(source, /<JoinCodePanel/);
  assert.match(source, /roomLabs\.length/);
  assert.match(source, /room\.memberCount/);
});

test("classroom owner can manage the room, members, and classwork", () => {
  for (const label of ["เปลี่ยนชื่อห้อง", "ยุบห้องเรียน", "เพิ่มงาน", "นำออก"]) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /room\.isCreator/);
  assert.match(source, /removeClassroomMember/);
  assert.match(source, /createClassroomAssignment/);
});

test("classroom uses a subject-aware cover and an overview for the next action", () => {
  assert.match(source, /getClassroomPresentation/);
  assert.match(source, /<TabsTrigger value="overview"/);
  assert.match(source, />ภาพรวม<\/TabsTrigger>/);
  assert.match(source, /function OverviewPanel/);
  assert.match(source, /งานของฉัน/);
  assert.match(source, /<details/);
  assert.match(classroomsIndexSource, /getClassroomPresentation/);
  assert.match(classroomsIndexSource, /เปิดชั้นเรียน/);
});

test("classroom classwork supports assignment files, links, and student submissions", () => {
  for (const label of [
    "ลิงก์ประกอบงาน",
    "ไฟล์ประกอบงาน",
    "ลบงาน",
    "การแจ้งเตือน",
    "อ่านแล้ว",
    "ไฟล์ที่เลือก",
    "ล้างไฟล์",
    "เลือกไฟล์",
    "ส่งงานของคุณ",
    "ลิงก์ส่งงาน",
    "ไฟล์ส่งงาน",
    "งานที่นักเรียนส่ง",
  ]) {
    assert.match(source, new RegExp(label));
  }

  assert.match(source, /getClassroomAssignmentSubmissions/);
  assert.match(source, /getClassroomNotifications/);
  assert.match(source, /submitClassroomAssignment/);
  assert.match(source, /deleteClassroomAssignment/);
  assert.match(source, /markClassroomNotificationsRead/);
  assert.match(source, /role="status"/);
  assert.match(source, /multiple/);
  assert.match(source, /FilePickerField/);
  assert.match(source, /SelectedFilesList/);
  assert.match(source, /mergeSelectedFiles/);
  assert.match(source, /onRemove=\{/);
  assert.match(source, /aria-label=\{`เอาไฟล์ \$\{file\.name\} ออก`\}/);
  assert.match(source, /overflow-x-hidden/);
  assert.match(source, /md:grid-cols-\[minmax\(0,1fr\)_minmax\(0,320px\)\]/);
  assert.doesNotMatch(source, /accept="image\/png,image\/jpeg/);
  assert.doesNotMatch(source, /file:mr-3/);
});

test("classroom tabs are prominent, count-free, and keep the active line inside", () => {
  assert.match(source, /ภาพรวม<\/TabsTrigger>/);
  assert.match(source, /ห้องแล็บ<\/TabsTrigger>/);
  assert.match(source, /งานของชั้นเรียน<\/TabsTrigger>/);
  assert.match(source, /สมาชิก<\/TabsTrigger>/);
  assert.match(source, /useSearchParams/);
  assert.match(source, /requestedTab === "classwork"/);
  assert.match(source, /Tabs value=\{activeTab\}/);
  assert.doesNotMatch(source, /ห้องแล็บ \{roomLabs\.length\}/);
  assert.doesNotMatch(source, /บุคคล \{orderedMembers\.length\}/);
  assert.match(source, /after:bottom-0/);
  assert.match(source, /data-active:text-blue-700/);
  assert.doesNotMatch(source, /data-active:bg-blue-50/);
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
