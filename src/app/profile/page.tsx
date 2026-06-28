"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  FlaskConical,
  History,
  LockKeyhole,
  Pencil,
  Save,
  Target,
  UserCircle,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import LearningHistoryPage from "@/components/history/LearningHistoryPage";
import TeacherDashboardSection from "@/components/profile/TeacherDashboardSection";
import { useSidebar } from "@/context/SidebarContext";
import {
  loadSupabaseLearningSnapshot,
  readLocalLearningSnapshot,
  type LearningRunSnapshot,
} from "@/lib/supabase/learning-snapshot";
import { SCISIAM_AUTH_EVENT } from "@/lib/supabase/auth-cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type ProfileTab = "overview" | "history" | "rewards";

const AUTH_CHECK_TIMEOUT_MS = 6_000;
const isDemoModeEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true";

async function hasAuthenticatedSupabaseUser() {
  const supabase = createClient();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<false>((resolve) => {
    timeoutId = setTimeout(() => resolve(false), AUTH_CHECK_TIMEOUT_MS);
  });
  const authCheck = Promise.resolve(supabase.auth.getUser())
    .then(({ data }) => Boolean(data.user))
    .catch(() => false);

  try {
    return await Promise.race([authCheck, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export default function ProfilePage() {
  const { isCollapsed } = useSidebar();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("นักเรียน");
  const [draftName, setDraftName] = useState("นักเรียน");
  const [isEditingName, setIsEditingName] = useState(false);
  const [activeStudentTab, setActiveStudentTab] = useState<"overview" | "history" | "rewards">(() => {
    if (typeof window === "undefined") return "overview";
    const queryTab = new URLSearchParams(window.location.search).get("tab");
    return queryTab === "history" || queryTab === "rewards" ? queryTab : "overview";
  });
  const [completedCount, setCompletedCount] = useState(0);
  const [completedLabIds, setCompletedLabIds] = useState<string[]>([]);
  const [recentRuns, setRecentRuns] = useState<LearningRunSnapshot[]>([]);

  useEffect(() => {
    let cancelled = false;

    const applySnapshot = (snapshot: ReturnType<typeof readLocalLearningSnapshot>) => {
      if (cancelled) return;
      setCompletedCount(snapshot.completedCount);
      setCompletedLabIds(snapshot.completedLabIds);
      setRecentRuns(snapshot.recentRuns);
      if (snapshot.profile) {
        setRole(snapshot.profile.role);
        setUsername(snapshot.profile.displayName);
        setDraftName(snapshot.profile.displayName);
      }
    };

    const loadProfile = async () => {
      const isDemo = isDemoModeEnabled && localStorage.getItem("scisiam_demo_mode") === "true";
      const trustLocalIdentity = isDemo || !isSupabaseConfigured();
      const storedRole = localStorage.getItem("scisiam_user_role") || "student";
      const storedName = localStorage.getItem("scisiam_user_name") || "นักเรียน";
      let loggedIn = false;

      if (isDemo) {
        loggedIn = true;
      } else if (isSupabaseConfigured()) {
        loggedIn = await hasAuthenticatedSupabaseUser();
      } else {
        loggedIn = localStorage.getItem("scisiam_logged_in") === "true";
      }

      if (cancelled) return;
      setIsLoggedIn(loggedIn);

      if (!loggedIn) {
        setCompletedCount(0);
        setCompletedLabIds([]);
        setRecentRuns([]);
        setCheckingAuth(false);
        return;
      }

      if (trustLocalIdentity) {
        setRole(storedRole);
        setUsername(storedName);
        setDraftName(storedName);
      }
      applySnapshot(readLocalLearningSnapshot());

      if (!isDemo) {
        try {
          const cloudSnapshot = await loadSupabaseLearningSnapshot();
          if (cloudSnapshot) applySnapshot(cloudSnapshot);
        } catch (error) {
          console.error("Failed to load Supabase profile progress", error);
        }
      }

      if (!cancelled) setCheckingAuth(false);
    };

    void loadProfile();
    window.addEventListener(SCISIAM_AUTH_EVENT, loadProfile);
    window.addEventListener("storage", loadProfile);

    return () => {
      cancelled = true;
      window.removeEventListener(SCISIAM_AUTH_EVENT, loadProfile);
      window.removeEventListener("storage", loadProfile);
    };
  }, []);

  const selectTab = (tab: ProfileTab) => {
    setActiveStudentTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url);
  };

  const saveName = () => {
    const nextName = draftName.trim();
    if (!nextName) return;
    setUsername(nextName);
    localStorage.setItem("scisiam_user_name", nextName);
    window.dispatchEvent(new Event(SCISIAM_AUTH_EVENT));
    setIsEditingName(false);
  };

  const completedSet = useMemo(() => new Set(completedLabIds), [completedLabIds]);
  const rewards = useMemo(
    () => [
      {
        id: "first-lab",
        title: "ก้าวแรกของนักทดลอง",
        description: "บันทึกผลการทดลองอย่างน้อย 1 แล็บ",
        unlocked: completedCount >= 1,
      },
      {
        id: "five-labs",
        title: "นักสำรวจห้องแล็บ",
        description: "บันทึกผลการทดลองครบ 5 แล็บ",
        unlocked: completedCount >= 5,
      },
      {
        id: "newton",
        title: "ผู้สังเกตการเปลี่ยนแปลง",
        description: "ทำแล็บการเย็นตัวของนิวตันสำเร็จ",
        unlocked: completedSet.has("newtons-cooling"),
      },
      {
        id: "ohm",
        title: "นักสำรวจวงจรไฟฟ้า",
        description: "ทำแล็บกฎของโอห์มสำเร็จ",
        unlocked: completedSet.has("ohms-law"),
      },
    ],
    [completedCount, completedSet],
  );
  const unlockedRewardCount = rewards.filter((reward) => reward.unlocked).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans lg:pb-10">
      <Navbar />
      <div className="hidden lg:block">
        <Sidebar activeMenu="โปรไฟล์" />
      </div>

      <main
        className={`min-w-0 transition-[padding-left] duration-300 ${
          isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"
        }`}
      >
        {checkingAuth ? (
          <div className="mx-auto grid min-h-[60vh] max-w-6xl place-items-center px-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" aria-label="กำลังโหลดโปรไฟล์" />
          </div>
        ) : !isLoggedIn ? (
          <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
              <UserCircle className="h-8 w-8" />
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-[1.35] text-slate-950">เข้าสู่ระบบเพื่อดูโปรไฟล์การเรียนรู้</h1>
            <p className="mt-3 max-w-xl text-sm font-semibold leading-relaxed text-slate-500">
              ประวัติการทดลองและรางวัลของคุณจะถูกรวมไว้ในพื้นที่เดียว
            </p>
            <Link href="/login" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-blue-500/15 hover:bg-blue-700">
              เข้าสู่ระบบ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        ) : role === "teacher" ? (
          <TeacherDashboardSection />
        ) : (
          <>
            <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-8 lg:px-10">
              <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-blue-50 shadow-md shadow-slate-200">
                    <Image src="/student_avatar_3d.png" alt="รูปโปรไฟล์นักเรียน" fill sizes="80px" className="object-cover" priority />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-blue-600">STUDENT PROFILE</p>
                    {isEditingName ? (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <input value={draftName} onChange={(event) => setDraftName(event.target.value)} className="min-h-10 min-w-0 rounded-xl border border-blue-200 bg-white px-3 text-lg font-extrabold text-slate-900 outline-none focus:ring-3 focus:ring-blue-100" aria-label="ชื่อที่แสดง" />
                        <button type="button" onClick={saveName} className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white hover:bg-blue-700" title="บันทึกชื่อ"><Save className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setIsEditingName(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50" title="ยกเลิก"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <h1 className="truncate text-2xl font-extrabold leading-[1.35] text-slate-950 sm:text-3xl">{username}</h1>
                        <button type="button" onClick={() => setIsEditingName(true)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-blue-600" title="แก้ไขชื่อ"><Pencil className="h-4 w-4" /></button>
                      </div>
                    )}
                    <p className="mt-1 text-sm font-semibold text-slate-500">ติดตามการทดลองและรางวัลที่ปลดล็อกแล้ว</p>
                  </div>
                </div>
                <Link href="/labs" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-md shadow-blue-500/15 hover:bg-blue-700">
                  <FlaskConical className="h-4 w-4" />
                  ไปห้องแล็บ
                </Link>
              </div>
            </section>

            <div className="sticky top-[64px] z-30 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8 lg:px-10">
              <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto py-2" role="tablist" aria-label="ส่วนต่าง ๆ ของโปรไฟล์">
                {([
                  { id: "overview", label: "ภาพรวมความก้าวหน้า", icon: Target },
                  { id: "history", label: "ประวัติการเรียนรู้", icon: History },
                  { id: "rewards", label: "รางวัล", icon: Award },
                ] as const).map((tab) => {
                  const Icon = tab.icon;
                  const active = activeStudentTab === tab.id;
                  return (
                    <button key={tab.id} type="button" role="tab" aria-selected={active} onClick={() => selectTab(tab.id)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold transition-colors ${active ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}>
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeStudentTab === "overview" ? (
              <section className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-10">
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard icon={FlaskConical} label="แล็บที่บันทึกแล้ว" value={String(completedCount)} tone="blue" />
                  <StatCard icon={Clock3} label="กิจกรรมล่าสุด" value={String(recentRuns.length)} tone="emerald" />
                  <StatCard icon={Award} label="รางวัลที่ปลดล็อก" value={`${unlockedRewardCount}/${rewards.length}`} tone="amber" />
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <section>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold text-blue-600">RECENT ACTIVITY</p>
                        <h2 className="mt-1 text-xl font-extrabold text-slate-950">กิจกรรมการทดลองล่าสุด</h2>
                      </div>
                      <button type="button" onClick={() => selectTab("history")} className="text-sm font-extrabold text-blue-600 hover:text-blue-700">ดูทั้งหมด</button>
                    </div>
                    <div className="mt-4 divide-y divide-slate-100 border-y border-slate-200 bg-white">
                      {recentRuns.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm font-semibold text-slate-500">ยังไม่มีประวัติการทดลอง</div>
                      ) : recentRuns.slice(0, 5).map((run) => (
                        <div key={run.id} className="flex items-center gap-3 px-4 py-4">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><FlaskConical className="h-4 w-4" /></span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-extrabold text-slate-800">{run.title}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-400">{run.createdAt.includes("T") ? new Date(run.createdAt).toLocaleString("th-TH") : run.createdAt}</p>
                          </div>
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                        </div>
                      ))}
                    </div>
                  </section>

                  <aside>
                    <p className="text-xs font-extrabold text-emerald-600">NEXT MILESTONE</p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-950">เป้าหมายถัดไป</h2>
                    <div className="mt-4 border-l-4 border-blue-500 bg-white px-5 py-5 shadow-sm">
                      <Target className="h-6 w-6 text-blue-600" />
                      <p className="mt-4 text-lg font-extrabold text-slate-900">บันทึกผลครบ 5 แล็บ</p>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">ทำแล้ว {Math.min(completedCount, 5)} จาก 5 แล็บ</p>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, (completedCount / 5) * 100)}%` }} /></div>
                    </div>
                  </aside>
                </div>
              </section>
            ) : activeStudentTab === "history" ? (
              <LearningHistoryPage embedded />
            ) : (
              <section className="mx-auto max-w-7xl px-4 py-7 sm:px-8 lg:px-10">
                <div>
                  <p className="text-xs font-extrabold text-amber-600">ACHIEVEMENTS</p>
                  <h2 className="mt-1 text-2xl font-extrabold text-slate-950">รางวัลจากการเรียนรู้</h2>
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">รางวัลจะปลดล็อกตามกิจกรรมที่ทำสำเร็จ ไม่มีการใช้แต้มสะสม</p>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {rewards.map((reward) => (
                    <article key={reward.id} className={`border p-5 ${reward.unlocked ? "border-amber-200 bg-amber-50/60" : "border-slate-200 bg-white"}`}>
                      <span className={`grid h-12 w-12 place-items-center rounded-xl ${reward.unlocked ? "bg-amber-200 text-amber-900" : "bg-slate-100 text-slate-400"}`}>
                        {reward.unlocked ? <Award className="h-6 w-6" /> : <LockKeyhole className="h-5 w-5" />}
                      </span>
                      <h3 className="mt-4 text-base font-extrabold leading-[1.45] text-slate-900">{reward.title}</h3>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">{reward.description}</p>
                      <p className={`mt-4 text-xs font-extrabold ${reward.unlocked ? "text-amber-800" : "text-slate-400"}`}>{reward.unlocked ? "ปลดล็อกแล้ว" : "ยังไม่ปลดล็อก"}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: "blue" | "emerald" | "amber" }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  }[tone];

  return (
    <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${toneClass}`}><Icon className="h-5 w-5" /></span>
      <div><p className="text-xs font-extrabold text-slate-400">{label}</p><p className="mt-1 text-2xl font-extrabold text-slate-950">{value}</p></div>
    </div>
  );
}
