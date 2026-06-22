"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/labs/Breadcrumb";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { loadSupabaseLearningSnapshot, readLocalLearningSnapshot } from "@/lib/supabase/learning-snapshot";
import { claimMissionReward, loadClaimedMissionIds } from "@/lib/supabase/missions";
import {
  ArrowRight,
  Gift,
  Star,
} from "lucide-react";

interface Mission {
  id: string;
  title: string;
  desc: string;
  rewardPoints: number;
  type: "daily" | "achievement";
  category: "Physics" | "Chemistry" | "Biology" | "General";
  progress: number;
  total: number;
  isCompleted: boolean;
}

export default function MissionsPage() {
  const { isCollapsed } = useSidebar();
  const [points, setPoints] = useState(120);
  const [completedCount, setCompletedCount] = useState(0);
  const [claimedMissions, setClaimedMissions] = useState<Record<string, boolean>>({});
  const [claimingMissionId, setClaimingMissionId] = useState<string | null>(null);
  const [activeMissionType, setActiveMissionType] = useState<"daily" | "achievement">("daily");

  const [hasOhms, setHasOhms] = useState(false);
  const [hasCooling, setHasCooling] = useState(false);
  const [hasEquilibrium, setHasEquilibrium] = useState(false);
  const [hasHess, setHasHess] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const applyLearningSnapshot = (snapshot: ReturnType<typeof readLocalLearningSnapshot>) => {
      const completedLabIds = new Set(snapshot.completedLabIds);
      setPoints(snapshot.points);
      setCompletedCount(snapshot.completedCount);
      setHasOhms(completedLabIds.has("ohms-law"));
      setHasCooling(completedLabIds.has("newtons-cooling"));
      setHasEquilibrium(completedLabIds.has("le-chateliers-principle"));
      setHasHess(completedLabIds.has("hesss-law"));
    };

    const loadData = () => {
      applyLearningSnapshot(readLocalLearningSnapshot());

      void loadSupabaseLearningSnapshot()
        .then(async (snapshot) => {
          if (snapshot) {
            applyLearningSnapshot(snapshot);
          }

          const claimedIds = await loadClaimedMissionIds();
          setClaimedMissions(
            Object.fromEntries(claimedIds.map((id) => [id, true]))
          );
        })
        .catch((error) => {
          console.error("Failed to load Supabase mission progress", error);
        });
    };

    const timer = setTimeout(loadData, 0);
    return () => clearTimeout(timer);
  }, []);

  const currentLevel = useMemo(() => Math.floor(points / 200) + 1, [points]);
  const currentXP = useMemo(() => points % 200, [points]);
  const xpPercentage = useMemo(() => (currentXP / 200) * 100, [currentXP]);

  const missionsList = useMemo<Mission[]>(() => {
    return [
      {
        id: "daily-login",
        title: "เข้าศึกษาประจําวัน (Daily Log-in)",
        desc: "เข้าสู่ระบบการเรียนรู้และสำรวจห้องปฏิบัติการจำลองของ SciSiam",
        rewardPoints: 10,
        type: "daily",
        category: "General",
        progress: 1,
        total: 1,
        isCompleted: true,
      },
      {
        id: "daily-science-1",
        title: "ผู้ใฝ่รู้ห้องปฏิบัติการ (Science Explorer)",
        desc: "ทำการจำลองแล็บสำเร็จและบันทึกผลอย่างน้อย 1 ห้อง",
        rewardPoints: 25,
        type: "daily",
        category: "General",
        progress: Math.min(1, completedCount),
        total: 1,
        isCompleted: completedCount >= 1,
      },
      {
        id: "daily-science-3",
        title: "ยอดนักวิจัยขั้นสูง (Expert Inquirer)",
        desc: "ทำวิจัยเชิงปฏิบัติการและบันทึกผลสำเร็จครบ 3 ห้อง",
        rewardPoints: 50,
        type: "daily",
        category: "General",
        progress: Math.min(3, completedCount),
        total: 3,
        isCompleted: completedCount >= 3,
      },
      {
        id: "quest-ohms",
        title: "เควสต์: วิศวกรไฟฟ้ากระแสตรง",
        desc: "ทำจำลองห้องปฏิบัติการวงจรกระแสตรงกฎของโอห์ม (Ohm's Law) สำเร็จ",
        rewardPoints: 30,
        type: "achievement",
        category: "Physics",
        progress: hasOhms ? 1 : 0,
        total: 1,
        isCompleted: hasOhms,
      },
      {
        id: "quest-cooling",
        title: "เควสต์: ผู้ควบคุมความร้อนนิวตัน",
        desc: "ทำจำลองห้องปฏิบัติการกฎการเย็นตัวของนิวตัน (Newton's Cooling) สำเร็จ",
        rewardPoints: 30,
        type: "achievement",
        category: "Physics",
        progress: hasCooling ? 1 : 0,
        total: 1,
        isCompleted: hasCooling,
      },
      {
        id: "quest-equilibrium",
        title: "เควสต์: ปรมาจารย์สมดุลเคมี",
        desc: "ทำจำลองห้องปฏิบัติการการรบกวนสมดุลเคมี (Chemical Equilibrium Shift) สำเร็จ",
        rewardPoints: 30,
        type: "achievement",
        category: "Chemistry",
        progress: hasEquilibrium ? 1 : 0,
        total: 1,
        isCompleted: hasEquilibrium,
      },
      {
        id: "quest-hesss",
        title: "เควสต์: ยอดนักคำนวณแคลอรี",
        desc: "ทำจำลองห้องปฏิบัติการ Hess's Law & Calorimetry สำเร็จ",
        rewardPoints: 30,
        type: "achievement",
        category: "Chemistry",
        progress: hasHess ? 1 : 0,
        total: 1,
        isCompleted: hasHess,
      },
      {
        id: "ach-first-lab",
        title: "จุดเริ่มต้นของนักวิทยาศาสตร์",
        desc: "ปลดล็อกจากการทำห้องปฏิบัติการใดๆ ในระบบสำเร็จเป็นครั้งแรก",
        rewardPoints: 20,
        type: "achievement",
        category: "General",
        progress: Math.min(1, completedCount),
        total: 1,
        isCompleted: completedCount >= 1,
      },
      {
        id: "ach-five-labs",
        title: "ผู้เชี่ยวชาญการวิจัยเสมือนจริง",
        desc: "ฝึกฝนทักษะการทดลองในห้องปฏิบัติการจำลองครบ 5 การทดลอง",
        rewardPoints: 50,
        type: "achievement",
        category: "General",
        progress: Math.min(5, completedCount),
        total: 5,
        isCompleted: completedCount >= 5,
      },
      {
        id: "ach-point-collector",
        title: "ยอดนักสะสมรางวัลเหรียญตรา",
        desc: "เก็บสะสมคะแนนวิจัยรวมให้ถึง 300 คะแนน",
        rewardPoints: 40,
        type: "achievement",
        category: "General",
        progress: Math.min(300, points),
        total: 300,
        isCompleted: points >= 300,
      },
    ];
  }, [completedCount, hasOhms, hasCooling, hasEquilibrium, hasHess, points]);

  const dailyMissions = useMemo(() => missionsList.filter((mission) => mission.type === "daily"), [missionsList]);
  const achievements = useMemo(() => missionsList.filter((mission) => mission.type === "achievement"), [missionsList]);
  const visibleMissions = activeMissionType === "daily" ? dailyMissions : achievements;

  const handleClaimReward = async (id: string, title: string) => {
    const mission = missionsList.find((item) => item.id === id);
    if (claimingMissionId || claimedMissions[id] || !mission?.isCompleted) return;

    setClaimingMissionId(id);

    try {
      const result = await claimMissionReward({
        missionId: id,
      });

      if (result.ok) {
        setPoints(result.totalPoints);
        setClaimedMissions((current) => ({ ...current, [id]: true }));
        const message = result.alreadyClaimed
          ? `ภารกิจ "${title}" รับรางวัลไปแล้ว`
          : `รับรางวัลสำเร็จ! +${result.pointsAwarded} XP จากภารกิจ "${title}"`;
        showToast(message, "success");
        return;
      }

      if (result.reason === "signed_out" || result.reason === "not_configured") {
        showToast("เข้าสู่ระบบก่อนรับรางวัล เพื่อบันทึกคะแนนจริงลงบัญชี SciSiam", "info");
        return;
      }

      if (result.reason === "not_completed") {
        showToast("ภารกิจนี้ยังไม่ครบเงื่อนไข ลองทำแล็บและบันทึกผลเพิ่มอีกนิดครับ", "info");
        return;
      }

      showToast(result.message || "รับรางวัลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setClaimingMissionId(null);
    }
  };

  const claimedCount = Object.values(claimedMissions).filter(Boolean).length;
  const completedMissionCount = missionsList.filter((mission) => mission.isCompleted).length;
  const availableRewardPoints = missionsList
    .filter((mission) => mission.isCompleted && !claimedMissions[mission.id])
    .reduce((total, mission) => total + mission.rewardPoints, 0);

  const renderMissionCard = (mission: Mission, variant: "daily" | "achievement") => {
    const isClaimed = claimedMissions[mission.id];
    const percent = Math.min(100, (mission.progress / mission.total) * 100);
    const isDaily = variant === "daily";
    const accent = isDaily
      ? {
          chip: "border-slate-200 bg-slate-50 text-slate-600",
          bar: mission.isCompleted ? "bg-emerald-500" : "bg-blue-500",
          button: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-100",
        }
      : {
          chip: "border-blue-100 bg-blue-50 text-blue-700",
          bar: mission.isCompleted ? "bg-emerald-500" : "bg-blue-500",
          button: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-100",
        };

    return (
      <article
        key={mission.id}
        className={`group rounded-2xl border bg-white p-4 shadow-sm shadow-slate-200/40 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5 ${
          isClaimed ? "border-slate-100 opacity-75" : "border-slate-200/80"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold leading-[1.4] ${accent.chip}`}>
                {isDaily ? "รายวัน" : "ความสำเร็จ"}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-extrabold leading-[1.4] text-slate-500">
                {mission.category}
              </span>
            </div>
            <h3 className="text-base font-extrabold leading-[1.45] tracking-normal text-slate-900">
              {mission.title}
            </h3>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
              {mission.desc}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
            <span className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-700">
              +{mission.rewardPoints} XP
            </span>
            {isClaimed ? (
              <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                รับแล้ว
              </span>
            ) : mission.isCompleted ? (
              <button
                type="button"
                disabled={claimingMissionId === mission.id}
                onClick={() => handleClaimReward(mission.id, mission.title)}
                className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 focus:outline-none focus-visible:ring-3 ${accent.button}`}
              >
                <Gift className="h-3.5 w-3.5" />
                <span>{claimingMissionId === mission.id ? "กำลังบันทึก..." : "รับรางวัล"}</span>
              </button>
            ) : (
              <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-400">
                ยังไม่ครบ
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full transition-[width] duration-500 ${accent.bar}`} style={{ width: `${percent}%` }} />
          </div>
          <span className="w-14 text-right text-[11px] font-extrabold leading-[1.45] text-slate-500">
            {mission.progress} / {mission.total}
          </span>
        </div>
      </article>
    );
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 pb-24 font-sans text-slate-900">
      <Navbar />

      <div className="hidden lg:block">
        <Sidebar activeMenu="ภารกิจนักวิทย์" />
      </div>

      <div className={`relative z-10 min-w-0 transition-[padding-left] duration-300 ${isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"}`}>
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-2 pt-6 sm:px-8 lg:px-8">
          <Breadcrumb category="Dashboard" title="ภารกิจนักวิทย์ / Missions" />
        </div>

        <main className="mx-auto grid w-full max-w-[1440px] gap-5 px-4 py-2 sm:px-8 lg:px-8 lg:py-5">
          <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 shadow-sm sm:h-24 sm:w-24">
                  <Image src="/student_avatar_3d.png" alt="SciSiam student avatar" fill sizes="96px" className="object-cover" priority />
                </div>

                <div className="min-w-0">
                  <h1 className="max-w-2xl text-2xl font-extrabold leading-[1.25] tracking-normal text-slate-950 sm:text-3xl">
                    ภารกิจนักวิทย์ของคุณ
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500 sm:text-base">
                    ทำแล็บ บันทึกผล และรับ XP เพื่อปลดล็อกความสำเร็จใน SciSiam
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[300px]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-[10px] font-extrabold uppercase leading-[1.45] text-slate-400">คะแนนสะสม</span>
                  <strong className="mt-1 block text-2xl font-extrabold leading-none text-slate-950">{points}</strong>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <span className="text-[10px] font-extrabold uppercase leading-[1.45] text-emerald-600">เคลียร์แล้ว</span>
                  <strong className="mt-1 block text-2xl font-extrabold leading-none text-emerald-700">{claimedCount}/{missionsList.length}</strong>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold leading-[1.45] text-slate-600">
                <span>เลเวล {currentLevel}</span>
                <span>{currentXP} / 200 XP</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-blue-600 transition-[width] duration-500"
                  style={{ width: `${xpPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={xpPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="ความคืบหน้า XP"
                />
              </div>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-5">
              <section className="rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/50 sm:p-5">
                <header className="mb-4 grid gap-4 border-b border-slate-100 pb-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-lg font-extrabold leading-[1.35] tracking-normal text-slate-950">
                        ภารกิจ
                      </h2>
                      <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                        เลือกหมวดภารกิจที่ต้องการติดตามและรับรางวัล
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => setActiveMissionType("daily")}
                        className={`min-h-11 rounded-xl px-3 text-sm font-extrabold leading-[1.45] transition-colors ${
                          activeMissionType === "daily"
                            ? "bg-white text-blue-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        ภารกิจรายวัน
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMissionType("achievement")}
                        className={`min-h-11 rounded-xl px-3 text-sm font-extrabold leading-[1.45] transition-colors ${
                          activeMissionType === "achievement"
                            ? "bg-white text-blue-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        ความสำเร็จระยะยาว
                      </button>
                    </div>
                  </div>
                </header>

                <div className="grid gap-3">
                  {visibleMissions.map((mission) => renderMissionCard(mission, activeMissionType))}
                </div>
              </section>
            </div>

            <aside className="grid content-start gap-5 xl:sticky xl:top-24">
              <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
                <div className="mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base font-extrabold leading-[1.35] tracking-normal text-slate-950">ภาพรวมภารกิจ</h2>
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-700">
                    <span>ภารกิจที่ครบเงื่อนไข</span>
                    <span>{completedMissionCount}/{missionsList.length}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-700">
                    <span>แล็บที่บันทึกผลแล้ว</span>
                    <span>{completedCount}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700">
                    <span>XP ที่รอรับ</span>
                    <span>+{availableRewardPoints}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-blue-100 bg-blue-50/70 p-5">
                <h2 className="text-base font-extrabold leading-[1.35] tracking-normal text-blue-800">วิธีปลดล็อกเร็วขึ้น</h2>
                <ul className="mt-3 space-y-2.5 text-sm font-semibold leading-relaxed text-slate-600">
                  <li>บันทึกผลหลังจบแล็บทุกครั้ง เพื่อให้ระบบนับความคืบหน้า</li>
                  <li>เริ่มจาก Newton, Ohm และ Chemical Equilibrium เพราะมีเควสต์เฉพาะ</li>
                  <li>กลับมารับรางวัลในหน้านี้เมื่อภารกิจขึ้นสถานะครบเงื่อนไข</li>
                </ul>
              </section>

              <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 text-slate-950 shadow-sm shadow-slate-200/50">
                <h2 className="text-base font-extrabold leading-[1.35] tracking-normal">พร้อมทำภารกิจต่อไหม?</h2>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                  เลือกแล็บที่พร้อมทดลอง แล้วบันทึกผลเพื่อเก็บ XP ต่อได้ทันที
                </p>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/labs";
                  }}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold leading-[1.45] text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
                >
                  <span>ไปหน้าห้องแล็บ</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </section>
            </aside>
          </div>
        </main>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-extrabold text-white shadow-2xl sm:right-6 ${
            toast.type === "error" ? "bg-rose-600" : toast.type === "info" ? "bg-blue-700" : "bg-slate-950"
          }`}
        >
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-white/80" />
          <span className="leading-relaxed">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
