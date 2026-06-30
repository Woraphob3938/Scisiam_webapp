import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const migrations = path.join(root, "supabase", "migrations");

function classroomMigration() {
  const files = fs.readdirSync(migrations).filter((name) => name.endsWith("_classroom_system.sql"));
  assert.equal(files.length, 1, "expected exactly one classroom_system migration");
  return fs.readFileSync(path.join(migrations, files[0]), "utf8");
}

function classroomRpcFixMigration() {
  const files = fs.readdirSync(migrations).filter((name) => name.endsWith("_fix_classroom_rpc_coalesce.sql"));
  assert.equal(files.length, 1, "expected exactly one classroom RPC fix migration");
  return fs.readFileSync(path.join(migrations, files[0]), "utf8");
}

test("classroom migration keeps codes private and removes direct joining", () => {
  const sql = classroomMigration();
  assert.match(sql, /private\.classroom_join_codes/i);
  assert.match(sql, /drop column\s+code/i);
  assert.match(sql, /drop policy if exists "Users can join or teachers can add members" on public\.classroom_members;/i);
  assert.match(sql, /revoke\s+insert[\s\S]+classroom_members[\s\S]+authenticated/i);
});

test("classroom RPCs are authenticated and validate the caller", () => {
  const sql = classroomMigration();
  for (const name of ["create_classroom", "join_classroom", "get_classroom_join_code", "get_classroom_members"]) {
    assert.match(sql, new RegExp(`function public\\.${name}`, "i"));
  }
  assert.match(sql, /auth\.uid\(\)/i);
  assert.match(sql, /set search_path\s*=\s*''/i);
  assert.match(sql, /revoke execute[\s\S]+from public, anon/i);
  assert.match(sql, /grant execute[\s\S]+to authenticated/i);
});

test("classroom labs are ordered and membership-protected", () => {
  const sql = classroomMigration();
  assert.match(sql, /create table public\.classroom_labs/i);
  assert.match(sql, /primary key\s*\(classroom_id,\s*lab_id\)/i);
  assert.match(sql, /private\.is_class_member\(classroom_id\)/i);
});

test("classroom migration preserves legacy nullable grade levels", () => {
  const sql = classroomMigration();
  assert.doesNotMatch(sql, /alter table public\.classrooms alter column grade_level set not null;/i);
});

test("classroom RPC fix uses SQL coalesce expressions without schema qualification", () => {
  const sql = classroomRpcFixMigration();
  assert.match(sql, /coalesce\(p_name,\s*''\)/i);
  assert.match(sql, /nullif\([\s\S]+coalesce\(p_description,\s*''\)/i);
  assert.doesNotMatch(sql, /pg_catalog\.(?:coalesce|nullif)/i);
});

test("classroom client uses RPC writes and the SciSiam lab catalog", () => {
  const source = fs.readFileSync(
    path.join(root, "src", "lib", "supabase", "classrooms.ts"),
    "utf8"
  );

  for (const name of [
    "listMyClassrooms",
    "getClassroom",
    "createClassroom",
    "joinClassroom",
    "getClassroomJoinCode",
    "getClassroomMembers",
  ]) {
    assert.match(source, new RegExp(`export\\s+(?:async\\s+)?function\\s+${name}`));
  }

  assert.match(source, /labsById/);
  assert.match(source, /rpc\("create_classroom"/);
  assert.match(source, /rpc\("join_classroom"/);
  assert.match(source, /rpc\("get_classroom_join_code"/);
  assert.match(source, /rpc\("get_classroom_members"/);
  assert.doesNotMatch(
    source,
    /\.from\("classroom_(?:members|labs)"\)[\s\S]*?\.insert\(/,
  );
});

test("classroom client strips non-alphanumeric characters from join codes before RPC", () => {
  const source = fs.readFileSync(
    path.join(root, "src", "lib", "supabase", "classrooms.ts"),
    "utf8"
  );

  assert.match(
    source,
    /function normalizeClassroomCode\(code: string\)\s*\{\s*return code\.replace\(\/\[\^A-Z0-9\]\+\/gi,\s*""\)\.toUpperCase\(\);?\s*\}/
  );
});

test("classroom client rejects malformed classroom ids before hitting Supabase", () => {
  const source = fs.readFileSync(
    path.join(root, "src", "lib", "supabase", "classrooms.ts"),
    "utf8"
  );

  assert.match(source, /const CLASSROOM_ACCESS_ERROR = "ไม่พบห้องเรียนหรือคุณไม่มีสิทธิ์เข้าถึง";/);
  assert.match(
    source,
    /function validateClassroomId\(id: string\)\s*\{\s*const normalizedId = id\.trim\(\);\s*if \(!\/\^\[0-9a-f\]\{8\}-\[0-9a-f\]\{4\}-\[1-5\]\[0-9a-f\]\{3\}-\[89ab\]\[0-9a-f\]\{3\}-\[0-9a-f\]\{12\}\$\/i\.test\(normalizedId\)\) \{\s*throw new Error\(CLASSROOM_ACCESS_ERROR\);/s
  );

  const validationCalls = source.match(/validateClassroomId\(id\)/g) ?? [];
  assert.ok(
    validationCalls.length >= 3,
    "expected malformed-id validation in getClassroom, getClassroomJoinCode, and getClassroomMembers"
  );
});

test("classroom action dialog covers create and join flows", () => {
  const source = fs.readFileSync(
    path.join(root, "src", "components", "classrooms", "ClassroomActions.tsx"),
    "utf8"
  );

  for (const label of [
    "เข้าร่วมห้อง",
    "สร้างห้อง",
    "ชื่อห้อง",
    "ชั้นปี",
    "เลือกแล็บ",
    "รายละเอียดเพิ่มเติม",
    "คัดลอกรหัส",
    "แชร์รหัส",
  ]) {
    assert.match(source, new RegExp(label));
  }

  for (const grade of ["ประถม", "มัธยมต้น", "มัธยมปลาย", "อุดมศึกษา"]) {
    assert.match(source, new RegExp(grade));
  }

  assert.match(source, /labsData/);
  assert.match(source, /type ClassroomActionMode = "menu" \| "create" \| "join" \| "created"/);
  assert.match(source, /placement: "desktop" \| "mobile"/);
  assert.match(source, /getClassroomJoinCode/);
  assert.match(source, /navigator\.clipboard\.writeText/);
  assert.match(source, /navigator\.share/);
});

test("classroom action dialog keeps one accessible controlled dialog", () => {
  const source = fs.readFileSync(
    path.join(root, "src", "components", "classrooms", "ClassroomActions.tsx"),
    "utf8"
  );

  assert.match(source, /<Dialog\s+open=\{open\}\s+onOpenChange=\{handleOpenChange\}>/);
  assert.equal((source.match(/<Dialog\b/g) ?? []).length, 1);
  assert.match(source, /<DialogTitle/);
  assert.match(source, /<fieldset/);
  assert.match(source, /aria-invalid=/);
  assert.match(source, /aria-describedby=/);
  assert.match(source, /autoCapitalize="characters"/);
  assert.match(source, /autoComplete="off"/);
  assert.match(source, /spellCheck=\{false\}/);
  assert.match(source, /router\.(?:push|replace)\("\/login"\)/);
});

test("desktop and sidebar navigation expose classroom actions", () => {
  const navbar = fs.readFileSync(path.join(root, "src", "components", "Navbar.tsx"), "utf8");
  const sidebar = fs.readFileSync(path.join(root, "src", "components", "Sidebar.tsx"), "utf8");

  assert.match(navbar, /import \{ ClassroomActions \} from "@\/components\/classrooms\/ClassroomActions"/);
  assert.match(navbar, /<ClassroomActions placement="desktop" \/>/);
  assert.ok(
    navbar.indexOf('<ClassroomActions placement="desktop" />') < navbar.indexOf("{/* Notification Bell */}"),
    "desktop classroom action should appear immediately before notifications"
  );

  assert.match(sidebar, /UsersRound/);
  assert.match(sidebar, /name: "ชั้นเรียน"[\s\S]+href: "\/classrooms"/);
});

test("mobile navigation uses a centered classroom action in five columns", () => {
  const source = fs.readFileSync(path.join(root, "src", "components", "MobileTabBar.tsx"), "utf8");

  assert.match(source, /grid-cols-5/);
  assert.match(source, /<ClassroomActions placement="mobile" \/>/);
  assert.match(source, /href: "\/classrooms"/);
  assert.match(source, /pathname\.startsWith\("\/classrooms"\)/);
  assert.ok(
    source.indexOf('<ClassroomActions placement="mobile" />') < source.indexOf('href: "/classrooms"'),
    "mobile classroom action should occupy the center before the classroom link"
  );
});

test("classroom list route authenticates and loads the current user's rooms", () => {
  const source = fs.readFileSync(path.join(root, "src", "app", "classrooms", "page.tsx"), "utf8");

  assert.match(source, /listMyClassrooms/);
  assert.match(source, /auth\.getUser\(\)/);
  assert.match(source, /AUTH_CHECK_TIMEOUT_MS\s*=\s*6_000/);
  assert.match(source, /router\.replace\("\/login\?next=\/classrooms"\)/);
  assert.match(source, /<Sidebar activeMenu="ชั้นเรียน" \/>/);
  assert.match(source, /เปิดห้อง/);
  assert.match(source, /ลองใหม่/);
  assert.match(source, /<ClassroomActions placement="desktop" \/>/);
});
