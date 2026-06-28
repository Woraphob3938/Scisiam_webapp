import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("Labs replaces Home and legacy History redirects into Profile", () => {
  assert.match(read("src/app/page.tsx"), /redirect\("\/labs"\)/);
  assert.match(read("src/app/history/page.tsx"), /redirect\("\/profile\?tab=history"\)/);

  for (const path of ["src/components/Sidebar.tsx", "src/components/MobileTabBar.tsx"]) {
    const source = read(path);
    assert.match(source, /ห้องแล็บ/);
    assert.match(source, /ภารกิจ/);
    assert.match(source, /โปรไฟล์/);
    assert.doesNotMatch(source, /หน้าหลัก|คะแนนและรางวัล|ประวัติการเรียนรู้|href:\s*"\/history"/);
  }
});

test("Profile owns overview, history, and rewards", () => {
  const profile = read("src/app/profile/page.tsx");
  assert.match(profile, /"overview" \| "history" \| "rewards"/);
  assert.match(profile, /<LearningHistoryPage embedded/);
  assert.match(profile, /ภาพรวมความก้าวหน้า/);
  assert.match(profile, /ประวัติการเรียนรู้/);
  assert.match(profile, /รางวัล/);
});

test("Lab cards are Thai-first and expose only Enter Lab", () => {
  const data = read("src/data/labs.ts");
  const cards = read("src/components/LabCard.tsx");
  const listing = read("src/app/labs/page.tsx");
  assert.equal((data.match(/\bid:\s*"/g) ?? []).length, 103);
  assert.equal((data.match(/\bthaiTitle:\s*"/g) ?? []).length, 103);
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
