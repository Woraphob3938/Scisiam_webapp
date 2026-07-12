import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("Login is the site entry and legacy History redirects into Profile", () => {
  assert.match(read("src/app/page.tsx"), /redirect\("\/login"\)/);
  assert.match(read("src/app/history/page.tsx"), /redirect\("\/profile\?tab=history"\)/);

  for (const path of ["src/components/Sidebar.tsx", "src/components/MobileTabBar.tsx"]) {
    const source = read(path);
    assert.match(source, /ห้องแล็บ/);
    assert.match(source, /โปรไฟล์/);
    assert.doesNotMatch(source, /ภารกิจ|หน้าหลัก|คะแนนและรางวัล|ประวัติการเรียนรู้|href:\s*"\/history"/);
  }
});

test("Profile owns overview and history without rewards", () => {
  const profile = read("src/app/profile/page.tsx");
  assert.match(profile, /"overview" \| "history"/);
  assert.match(profile, /<LearningHistoryPage embedded/);
  assert.match(profile, /ภาพรวมความก้าวหน้า/);
  assert.match(profile, /ประวัติการเรียนรู้/);
  assert.doesNotMatch(profile, /รางวัล|rewards/);
  assert.doesNotMatch(profile, /TeacherDashboardSection/);
});

test("Teacher dashboard is a separate Supabase-backed route", () => {
  const dashboardPage = read("src/app/dashboard/page.tsx");
  const dashboardSection = read("src/components/profile/TeacherDashboardSection.tsx");
  const dashboard = read("src/components/profile/TeacherDashboard.tsx");
  const dashboardMetrics = read("src/lib/teacher-dashboard-metrics.ts");
  const proxy = read("src/lib/supabase/proxy.ts");
  const classroomsPage = read("src/app/classrooms/page.tsx");

  assert.match(dashboardPage, /<Sidebar activeMenu="แดชบอร์ด"/);
  assert.match(dashboardPage, /role !== "teacher"/);
  assert.match(proxy, /"\/dashboard"/);
  assert.match(dashboardSection, /auth\.getUser\(\)/);
  assert.match(dashboardSection, /userError/);
  assert.match(dashboardSection, /throw new Error\(userError\.message\)/);
  assert.match(dashboardSection, /เซสชันหมดอายุ/);
  assert.match(dashboardSection, /clearScisiamAuthCache\(\{ emit: false \}\)/);
  assert.match(classroomsPage, /clearScisiamAuthCache\(\)/);
  assert.match(dashboardSection, /listMyClassrooms/);
  assert.match(dashboardSection, /getClassroomAssignments/);
  assert.match(dashboardSection, /getClassroomAssignmentSubmissions/);
  assert.match(dashboardSection, /submission=\$\{submission\.id\}/);
  assert.match(dashboardSection, /getClassroomMembers/);
  assert.match(dashboardSection, /calculateTeacherSubmissionMetrics/);
  assert.match(dashboardMetrics, /submissionCount:/);
  assert.match(dashboardMetrics, /expectedSubmissionCount:/);
  assert.match(dashboardMetrics, /pendingSubmissionCount:/);
  assert.match(dashboardSection, /lastUpdatedAt/);
  assert.doesNotMatch(dashboardSection, /Demo|โหมดสาธิต|Hooke's Law of Elasticity/);
  assert.match(dashboard, /ภาพรวมการส่งงาน/);
  assert.match(dashboard, /รอตรวจ/);
  assert.match(dashboard, /function ClassroomComparison/);
  assert.match(dashboard, /<table/);
  assert.match(dashboard, /<caption/);
  assert.match(dashboard, /scope="col"/);
  assert.match(dashboard, /ส่งแล้ว/);
  assert.match(dashboard, /ควรส่ง/);
  assert.match(dashboard, /ค้างส่ง/);
  assert.match(dashboard, /function FollowUpPanel/);
  assert.match(dashboard, /ควรติดตาม/);
  assert.match(dashboard, /งานส่งล่าสุด/);
  assert.doesNotMatch(dashboard, /TEACHER DASHBOARD/);
  assert.doesNotMatch(dashboard, /TeacherTab/);
});

test("Lab cards are Thai-first and expose only Enter Lab", () => {
  const data = read("src/data/labs.ts");
  const cards = read("src/components/LabCard.tsx");
  const listing = read("src/app/labs/page.tsx");
  assert.equal((data.match(/\bid:\s*"/g) ?? []).length, 112);
  assert.equal((data.match(/\bthaiTitle:\s*"/g) ?? []).length, 112);
  assert.match(cards, /thaiTitle: string/);
  assert.match(cards, /\{lab\.thaiTitle\}[\s\S]*?\{lab\.title\}/);
  assert.doesNotMatch(cards, /รายละเอียด|onViewDetails|<Eye/);
  assert.doesNotMatch(listing, /handleViewDetails|onViewDetails/);
  assert.match(cards, /w-full[\s\S]*?เข้าห้อง/);
});

test("Active application flows contain no scoring system", () => {
  const paths = [
    "src/components/Navbar.tsx",
    "src/app/profile/page.tsx",
    "src/components/history/LearningHistoryPage.tsx",
    "src/app/missions/page.tsx",
    "src/lib/supabase/auth-cache.ts",
    "src/lib/supabase/experiment-sync.ts",
    "src/lib/supabase/missions.ts",
    "src/components/profile/TeacherDashboard.tsx",
    "src/components/profile/TeacherDashboardSection.tsx",
  ];

  for (const path of paths) {
    const source = read(path);
    assert.doesNotMatch(
      source,
      /scisiam_points|pointsAwarded|totalPoints|currentLevel/,
      `${path} still exposes point state`,
    );
  }

  assert.match(read("src/lib/supabase/experiment-sync.ts"), /p_score:\s*null/);
  assert.doesNotMatch(
    read("src/components/profile/TeacherDashboard.tsx"),
    /score\??:|ให้คะแนน|ตารางคะแนน/,
  );
  assert.doesNotMatch(
    read("src/components/profile/TeacherDashboardSection.tsx"),
    /gradeScore|บันทึกคะแนน|ได้คะแนน/,
  );
});

test("Supabase keeps historical scoring columns dormant", () => {
  const migration = read("supabase/migrations/20260628232320_disable_scoring.sql");
  assert.match(migration, /coalesce\(p_summary,[\s\S]*?null,\s*0,\s*p_duration_seconds/i);
  assert.match(migration, /best_score,[\s\S]*?last_score,[\s\S]*?points_awarded[\s\S]*?null,\s*null,\s*0/i);
  assert.match(migration, /update\s+public\.mission_definitions[\s\S]*?points_reward\s*=\s*0/i);
  assert.doesNotMatch(migration, /total_points\s*=\s*total_points\s*\+/i);
});
