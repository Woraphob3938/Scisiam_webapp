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
const simulationRouteSource = fs.readFileSync(
  path.join(process.cwd(), "src", "app", "labs", "[id]", "simulation", "page.tsx"),
  "utf8",
);
const simulationSubmissionSource = fs.readFileSync(
  path.join(process.cwd(), "src", "components", "classrooms", "SimulationClassroomSubmission.tsx"),
  "utf8",
);
const labSubmissionDialogSource = fs.readFileSync(
  path.join(process.cwd(), "src", "components", "classrooms", "ClassroomLabSubmissionDialog.tsx"),
  "utf8",
);
const sharedSimulationShellSource = fs.readFileSync(
  path.join(process.cwd(), "src", "components", "labs", "simulation", "SharedSimulationShell.tsx"),
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
  assert.match(source, /items-start/);
  assert.match(source, /content-start/);
  assert.match(source, /rows=\{4\}/);
  assert.match(source, /min-h-28/);
  assert.doesNotMatch(source, /accept="image\/png,image\/jpeg/);
  assert.doesNotMatch(source, /file:mr-3/);
});

test("classroom tabs are prominent, count-free, centered, and animate the active indicator", () => {
  assert.match(source, /ภาพรวม<\/TabsTrigger>/);
  assert.match(source, /ห้องแล็บ<\/TabsTrigger>/);
  assert.match(source, /งานของชั้นเรียน<\/TabsTrigger>/);
  assert.match(source, /สมาชิก<\/TabsTrigger>/);
  assert.match(source, /useSearchParams/);
  assert.match(source, /requestedTab === "classwork"/);
  assert.match(source, /Tabs value=\{activeTab\}/);
  assert.doesNotMatch(source, /ห้องแล็บ \{roomLabs\.length\}/);
  assert.doesNotMatch(source, /บุคคล \{orderedMembers\.length\}/);
  assert.match(source, /overflow-hidden/);
  assert.match(source, /classroomTabIndicator/);
  assert.match(source, /motion-reduce:transition-none/);
  assert.match(source, /data-active:text-blue-700/);
  assert.doesNotMatch(source, /after:bottom-0/);
  assert.match(source, /grid-cols-2/);
  assert.match(source, /sm:grid-cols-4/);
  assert.doesNotMatch(source, /-mx-4 overflow-x-auto/);
  assert.doesNotMatch(source, /min-w-max justify-start/);
});

test("lab assignments require a selected lab, max score, saved run, and conclusion", () => {
  const assignmentUiSource = `${source}\n${labSubmissionDialogSource}`;
  for (const label of [
    "มอบหมายห้องแล็บ",
    "ห้องแล็บที่มอบหมาย",
    "คะแนนเต็ม",
    "ส่งผลการทดลอง",
    "ผลการทดลองที่บันทึกไว้",
    "สรุปผลการทดลอง",
    "ตรวจและให้คะแนน",
    "ตรวจแล้ว",
  ]) {
    assert.match(assignmentUiSource, new RegExp(label));
  }

  assert.match(labSubmissionDialogSource, /listMyExperimentRunsForLab/);
  assert.match(source, /gradeClassroomAssignmentSubmission/);
  assert.match(labSubmissionDialogSource, /experimentRunId:/);
  assert.match(labSubmissionDialogSource, /existingSubmission\?\.gradedAt/);
  assert.match(labSubmissionDialogSource, /minLength=\{5\}/);
  assert.match(labSubmissionDialogSource, /maxLength=\{1000\}/);
  assert.match(labSubmissionDialogSource, /5-1,000 ตัวอักษร/);
  assert.match(labSubmissionDialogSource, /max-w-6xl/);
  assert.match(labSubmissionDialogSource, /snapshotUrl/);
  assert.match(labSubmissionDialogSource, /ภาพหน้าการทดลอง/);
  assert.match(labSubmissionDialogSource, /lg:grid-cols/);
  assert.match(source, /max-w-6xl/);
});

test("classroom lab cards keep one clear entry action without redundant readiness badges", () => {
  assert.doesNotMatch(source, /readiness\.label/);
  assert.match(source, /lab\.description/);
  assert.match(source, /เข้าห้อง/);
  assert.match(source, /`\/labs\/\$\{lab\.id\}\/simulation/);
  assert.match(source, /classroom=\$\{encodeURIComponent\(classroomId\)\}/);
  assert.match(source, /assignment=\$\{encodeURIComponent\(labAssignment\.id\)\}/);
});

test("classroom lab simulation exposes the saved-run submission flow", () => {
  assert.match(simulationRouteSource, /<SimulationClassroomSubmission labId=\{labId\}/);
  assert.match(simulationSubmissionSource, /useSearchParams/);
  assert.match(simulationSubmissionSource, /getClassroomAssignments/);
  assert.match(simulationSubmissionSource, /getClassroomAssignmentSubmissions/);
  assert.match(simulationSubmissionSource, /submitClassroomAssignment/);
  assert.match(simulationSubmissionSource, /<ClassroomLabSubmissionDialog/);
  assert.match(labSubmissionDialogSource, /ผลการทดลองที่บันทึกไว้/);
  assert.match(labSubmissionDialogSource, /สรุปผลการทดลอง/);
  assert.match(labSubmissionDialogSource, /ส่งงาน/);
  assert.match(labSubmissionDialogSource, /minLength=\{5\}/);
  assert.match(simulationSubmissionSource, /createPortal/);
  assert.match(simulationSubmissionSource, /simulation-classroom-submission-slot/);
  assert.match(sharedSimulationShellSource, /simulation-classroom-submission-slot/);
  assert.match(labSubmissionDialogSource, /variant === "inline"/);
  assert.match(labSubmissionDialogSource, /บันทึกผลใหม่เพื่อสร้างภาพ/);
});

test("classroom people view separates teachers and students", () => {
  assert.match(source, /teacherMembers/);
  assert.match(source, /studentMembers/);
  assert.match(source, /คุณครูและผู้ดูแล/);
  assert.match(source, /นักเรียน/);
});
