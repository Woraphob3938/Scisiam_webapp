import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("first-login tour is gated by the persisted onboarding state", () => {
  const source = read("src/components/FirstLoginTour.tsx");

  assert.match(source, /onboarding_completed/);
  assert.match(source, /update\(\{ onboarding_completed: true \}\)/);
  assert.match(source, /data-tour=\"lab-search\"/);
  assert.match(source, /querySelectorAll/);
  assert.match(source, /scrollIntoView/);
  assert.match(source, /getTourPanelPosition/);
  assert.match(source, /spaceAbove/);
  assert.match(source, /spaceBelow/);
  assert.match(source, /ResizeObserver/);
  assert.match(source, /scisiamTourOpen/);
  assert.match(source, /motion-reduce:animate-none/);
  assert.match(source, /ข้ามคู่มือ/);
  assert.match(source, /ย้อนกลับ/);
  assert.match(source, /aria-live="polite"/);
});

test("tour targets are present in the lab and teacher entry points", () => {
  assert.match(read("src/components/HeroSection.tsx"), /data-tour="lab-search"/);
  assert.match(read("src/components/CategoryFilter.tsx"), /data-tour="lab-filters"/);
  assert.match(read("src/components/LabCard.tsx"), /data-tour="lab-enter"/);
  const teacherDashboard = read("src/components/profile/TeacherDashboard.tsx");
  assert.match(teacherDashboard, /data-tour="teacher-dashboard"/);
  assert.match(teacherDashboard, /data-tour="teacher-classrooms"/);
  assert.match(read("src/components/Sidebar.tsx"), /data-tour=/);
  assert.match(read("src/components/MobileTabBar.tsx"), /data-tour=/);
  assert.match(read("src/components/Navbar.tsx"), /data-tour="notifications"/);
  assert.match(read("src/components/Navbar.tsx"), /data-tour="profile-menu"/);
  assert.match(read("src/components/AIChatButton.tsx"), /data-tour="ai-tutor"/);
  assert.match(read("src/components/GlobalClientOverlays.tsx"), /FirstLoginTour/);
});

test("settings can replay the role-aware interactive tutorial", () => {
  const settings = read("src/components/SettingsModal.tsx");
  const replay = read("src/lib/onboarding-tour.ts");
  const tour = read("src/components/FirstLoginTour.tsx");

  assert.match(settings, /เริ่ม Tutorial แบบโต้ตอบอีกครั้ง/);
  assert.match(settings, /requestTutorialReplay/);
  assert.match(replay, /scisiam-tutorial-replay/);
  assert.match(replay, /role === "teacher" \? "\/dashboard" : "\/labs"/);
  assert.match(tour, /consumeTutorialReplay/);
});

test("existing profiles are excluded from the first-login guide by migration", () => {
  const migration = read("supabase/migrations/20260712103406_mark_existing_profiles_onboarded.sql");
  assert.match(migration, /update public\.profiles/i);
  assert.match(migration, /set onboarding_completed = true/i);
});
