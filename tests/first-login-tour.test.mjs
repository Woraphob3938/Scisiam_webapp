import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("first-login tour is gated by the persisted onboarding state", () => {
  const source = read("src/components/FirstLoginTour.tsx");

  assert.match(source, /onboarding_completed/);
  assert.match(source, /update\(\{ onboarding_completed: true \}\)/);
  assert.match(source, /data-tour=\"lab-search\"/);
  assert.match(source, /motion-reduce:animate-none/);
  assert.match(source, /ข้ามคู่มือ/);
});

test("tour targets are present in the lab and teacher entry points", () => {
  assert.match(read("src/components/HeroSection.tsx"), /data-tour="lab-search"/);
  assert.match(read("src/components/LabCard.tsx"), /data-tour="lab-enter"/);
  assert.match(read("src/components/profile/TeacherDashboard.tsx"), /data-tour="teacher-dashboard"/);
  assert.match(read("src/components/GlobalClientOverlays.tsx"), /FirstLoginTour/);
});

test("existing profiles are excluded from the first-login guide by migration", () => {
  const migration = read("supabase/migrations/20260712103406_mark_existing_profiles_onboarded.sql");
  assert.match(migration, /update public\.profiles/i);
  assert.match(migration, /set onboarding_completed = true/i);
});
