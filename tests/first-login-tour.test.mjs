import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("first-login tour is action-aware without blocking the highlighted control", () => {
  const source = read("src/components/FirstLoginTour.tsx");

  assert.match(source, /getAutoTutorialId/);
  assert.match(source, /loadTutorialStatus/);
  assert.match(source, /persistTutorialStatus/);
  assert.match(source, /flushPendingTutorialProgress/);
  assert.match(source, /createPortal/);
  assert.doesNotMatch(source, /@\/components\/ui\/dialog/);
  assert.match(source, /TUTORIAL_ACTION_EVENT/);
  assert.match(source, /matchesTutorialAction/);
  assert.match(source, /step\.kind === "action"/);
  assert.match(source, /completedStepIds/);
  assert.match(source, /querySelectorAll/);
  assert.match(source, /scrollIntoView/);
  assert.match(source, /getTourPanelPosition/);
  assert.match(source, /spaceAbove/);
  assert.match(source, /spaceBelow/);
  assert.match(source, /ResizeObserver/);
  assert.match(source, /scisiamTourOpen/);
  assert.match(source, /pointer-events-none/);
  assert.match(source, /pointer-events-auto/);
  assert.match(source, /data-tutorial-scrim/);
  assert.match(source, /TARGET_LOOKUP_TIMEOUT_MS = 1_600/);
  assert.match(source, /ลองค้นหาอีกครั้ง/);
  assert.match(source, /ข้ามขั้นตอนนี้/);
  assert.match(source, /event\.key === "Tab"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /aria-modal="false"/);
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

test("settings can replay the role guide or Newton tutorial", () => {
  const settings = read("src/components/SettingsModal.tsx");
  const replay = read("src/lib/onboarding-tour.ts");
  const tour = read("src/components/FirstLoginTour.tsx");

  assert.match(settings, /handleReplayTutorial\(tutorialId: TutorialId\)/);
  assert.match(settings, /getGeneralTutorialId\(role\)/);
  assert.match(settings, /TUTORIAL_IDS\.newtonsCooling/);
  assert.match(settings, /คู่มือเริ่มต้น/);
  assert.match(settings, /คู่มือแล็บ Newton/);
  assert.match(settings, /requestTutorialReplay\(tutorialId\)/);
  assert.match(settings, /getTutorialStartPath\(tutorialId\)/);
  assert.match(replay, /scisiam-tutorial-replay/);
  assert.match(tour, /consumeTutorialReplay/);
});

test("existing profiles are excluded from the first-login guide by migration", () => {
  const migration = read("supabase/migrations/20260712103406_mark_existing_profiles_onboarded.sql");
  assert.match(migration, /update public\.profiles/i);
  assert.match(migration, /set onboarding_completed = true/i);
});
