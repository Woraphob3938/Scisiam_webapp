"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  GraduationCap,
  LayoutGrid,
  Play,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import LabCard from "@/components/LabCard";
import { useSidebar } from "@/context/SidebarContext";
import { labsById, labsData } from "@/data/labs";
import { readyLabCount } from "@/data/labReadiness";
import { SCISIAM_AUTH_EVENT, SCISIAM_POINTS_EVENT } from "@/lib/supabase/auth-cache";

type HomeSnapshot = {
  completedLabs: number;
  isLoggedIn: boolean;
  points: number;
  role: "student" | "teacher";
  userName: string;
};

const initialSnapshot: HomeSnapshot = {
  completedLabs: 0,
  isLoggedIn: false,
  points: 0,
  role: "student",
  userName: "นักเรียน",
};

const recommendedLabIds = [
  "newtons-cooling",
  "acid-base-titration",
  "photosynthesis-rate",
];

const categoryMeta = [
  {
    id: "Physics",
    label: "Physics",
    thai: "ฟิสิกส์",
    tone: "border-blue-100 bg-blue-50 text-blue-700",
  },
  {
    id: "Chemistry",
    label: "Chemistry",
    thai: "เคมี",
    tone: "border-purple-100 bg-purple-50 text-purple-700",
  },
  {
    id: "Biology",
    label: "Biology",
    thai: "ชีววิทยา",
    tone: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
] as const;

function readHomeSnapshot(): HomeSnapshot {
  if (typeof window === "undefined") return initialSnapshot;

  let completedLabs = 0;
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith("scisiam_saved_")) {
      completedLabs += 1;
    }
  }

  const role = localStorage.getItem("scisiam_user_role") === "teacher" ? "teacher" : "student";

  return {
    completedLabs,
    isLoggedIn: localStorage.getItem("scisiam_logged_in") === "true",
    points: Number(localStorage.getItem("scisiam_points") || "0"),
    role,
    userName: localStorage.getItem("scisiam_user_name") || (role === "teacher" ? "คุณครู" : "นักเรียน"),
  };
}

export default function Home() {
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const [snapshot, setSnapshot] = useState<HomeSnapshot>(initialSnapshot);

  useEffect(() => {
    const syncSnapshot = () => setSnapshot(readHomeSnapshot());

    syncSnapshot();
    window.addEventListener("storage", syncSnapshot);
    window.addEventListener(SCISIAM_AUTH_EVENT, syncSnapshot);
    window.addEventListener(SCISIAM_POINTS_EVENT, syncSnapshot);

    return () => {
      window.removeEventListener("storage", syncSnapshot);
      window.removeEventListener(SCISIAM_AUTH_EVENT, syncSnapshot);
      window.removeEventListener(SCISIAM_POINTS_EVENT, syncSnapshot);
    };
  }, []);

  const recommendedLabs = useMemo(
    () => recommendedLabIds.map((id) => labsById[id]).filter(Boolean),
    []
  );

  const categoryCounts = useMemo(
    () =>
      categoryMeta.map((category) => ({
        ...category,
        count: labsData.filter((lab) => lab.category === category.id).length,
      })),
    []
  );

  const progressPercent = Math.min(
    100,
    Math.round((snapshot.completedLabs / Math.max(readyLabCount, 1)) * 100)
  );
  const greetingName =
    snapshot.role === "teacher" ? "คุณครู" : snapshot.userName || "นักเรียน";

  const openAiAioon = () => {
    if (!snapshot.isLoggedIn) {
      router.push("/login");
      return;
    }

    window.dispatchEvent(new Event("scisiam-ai-open"));
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />

      <div className="hidden lg:block">
        <Sidebar activeMenu="หน้าหลัก" />
      </div>

      <main
        className={`relative z-10 min-w-0 pb-28 transition-[padding-left] duration-300 lg:pb-12 ${
          isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"
        }`}
      >
        <section className="border-b border-slate-200/70 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_64%,#f8fafc_100%)] px-4 py-5 sm:px-8 lg:px-10 lg:py-7">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
            <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 text-xs font-extrabold leading-[1.45] text-blue-700">
                    <Sparkles className="h-4 w-4" />
                    หน้าหลัก SciSiam
                  </div>
                  <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-[1.25] tracking-normal text-slate-950 sm:text-4xl lg:text-[42px]">
                    สวัสดี, {greetingName} วันนี้อยากทดลองอะไรดี?
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500 sm:text-base">
                    เริ่มจากแล็บที่แนะนำ ดูความคืบหน้า หรือเปิด AI ไออุ่นเพื่อช่วยทบทวนแนวคิดก่อนทดลอง
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => router.push("/labs")}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold leading-[1.45] text-white shadow-md shadow-blue-500/15 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    ห้องแล็บ
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/labs/newtons-cooling/simulation")}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold leading-[1.45] text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                  >
                    <Play className="h-4 w-4" />
                    เริ่มเร็ว
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard icon={FlaskConical} label="แล็บพร้อมทดลอง" value={`${readyLabCount}`} tone="blue" />
                <MetricCard icon={BookOpen} label="แล็บทั้งหมด" value={`${labsData.length}`} tone="slate" />
                <MetricCard icon={CheckCircle2} label="บันทึกแล้ว" value={`${snapshot.completedLabs}`} tone="emerald" />
                <MetricCard icon={Award} label="คะแนนสะสม" value={`${snapshot.points}`} tone="amber" />
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold leading-[1.45] text-slate-400">
                    ความคืบหน้า
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold leading-[1.35] tracking-normal text-slate-950">
                    {progressPercent}% ของแล็บพร้อมทดลอง
                  </h2>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <BarChart3 className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500">
                {snapshot.completedLabs > 0
                  ? `มีบันทึกการทดลอง ${snapshot.completedLabs} รายการในเครื่องนี้`
                  : "เริ่มบันทึกผลการทดลองแรกเพื่อเห็นความคืบหน้าที่นี่"}
              </p>

              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  onClick={() => router.push(snapshot.role === "teacher" ? "/profile" : "/missions")}
                  className="inline-flex min-h-10 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-extrabold leading-[1.45] text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                >
                  <span>{snapshot.role === "teacher" ? "ดูแดชบอร์ดครู" : "ดูภารกิจวันนี้"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={openAiAioon}
                  className="inline-flex min-h-10 items-center justify-between gap-2 rounded-xl border border-purple-100 bg-purple-50 px-3.5 py-2 text-sm font-extrabold leading-[1.45] text-purple-700 transition-colors hover:border-purple-200 hover:bg-purple-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-100"
                >
                  <span>{snapshot.isLoggedIn ? "คุยกับ AI ไออุ่น" : "เข้าสู่ระบบเพื่อใช้ AI ไออุ่น"}</span>
                  <Bot className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-10 lg:py-7">
          <div className="grid gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold leading-[1.45] text-blue-600">
                  เริ่มจากชุดแล็บแนะนำ
                </p>
                <h2 className="mt-1 text-2xl font-extrabold leading-[1.35] tracking-normal text-slate-950">
                  ทดลองได้ทันที
                </h2>
              </div>
              <button
                type="button"
                onClick={() => router.push("/labs")}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold leading-[1.45] text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
              >
                ดูทั้งหมด
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {recommendedLabs.map((lab) => (
                <LabCard
                  key={lab.id}
                  lab={lab}
                  onViewDetails={(id) => router.push(`/labs/${id}`)}
                  onEnterRoom={(id) => router.push(`/labs/${id}/simulation`)}
                />
              ))}
            </div>
          </div>

          <aside className="grid gap-5">
            <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold leading-[1.45] text-slate-400">
                    หมวดวิชา
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold leading-[1.35] tracking-normal text-slate-950">
                    เลือกเส้นทางการทดลอง
                  </h2>
                </div>
                <GraduationCap className="h-5 w-5 text-slate-400" />
              </div>

              <div className="mt-4 grid gap-2">
                {categoryCounts.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => router.push(`/labs?category=${category.id}`)}
                    className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${category.tone}`}
                  >
                    <span>
                      <span className="block text-sm font-extrabold leading-[1.45]">
                        {category.thai}
                      </span>
                      <span className="block text-xs font-semibold leading-relaxed opacity-75">
                        {category.label}
                      </span>
                    </span>
                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-extrabold">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                  <ClipboardCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold leading-[1.35] tracking-normal text-slate-950">
                    ภารกิจแนะนำ
                  </h2>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                    ทดลอง 1 แล็บ บันทึกผล แล้วให้ AI ไออุ่นช่วยทบทวนสิ่งที่สังเกตได้
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/missions")}
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold leading-[1.45] text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-3 focus-visible:ring-slate-200"
              >
                เปิดภารกิจ
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: "amber" | "blue" | "emerald" | "slate";
  value: string;
}) {
  const toneClass = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3">
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${toneClass}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="mt-3 text-2xl font-extrabold leading-none tracking-normal text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs font-bold leading-[1.45] text-slate-500">
        {label}
      </p>
    </div>
  );
}
