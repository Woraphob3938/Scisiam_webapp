"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/labs/Breadcrumb";
import DecorativeBackground from "@/components/labs/DecorativeBackground";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { loadSupabaseLearningSnapshot, readLocalLearningSnapshot } from "@/lib/supabase/learning-snapshot";
import { claimMissionReward, loadClaimedMissionIds } from "@/lib/supabase/missions";
import { 
  Star,
  ArrowRight,
  Gift,
  Compass,
  Trophy
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
  
  // Labs status checked dynamically
  const [hasOhms, setHasOhms] = useState(false);
  const [hasCooling, setHasCooling] = useState(false);
  const [hasEquilibrium, setHasEquilibrium] = useState(false);
  const [hasHess, setHasHess] = useState(false);

  // Toast feedback state
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

    // Timeout to prevent Next.js hydration issues
    const timer = setTimeout(loadData, 0);
    return () => clearTimeout(timer);
  }, []);

  // Level progression formulas
  const currentLevel = useMemo(() => Math.floor(points / 200) + 1, [points]);
  const currentXP = useMemo(() => points % 200, [points]);
  const xpPercentage = useMemo(() => (currentXP / 200) * 100, [currentXP]);

  // List of missions dynamically mapped from state
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
        isCompleted: true
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
        isCompleted: completedCount >= 1
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
        isCompleted: completedCount >= 3
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
        isCompleted: hasOhms
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
        isCompleted: hasCooling
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
        isCompleted: hasEquilibrium
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
        isCompleted: hasHess
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
        isCompleted: completedCount >= 1
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
        isCompleted: completedCount >= 5
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
        isCompleted: points >= 300
      }
    ];
  }, [completedCount, hasOhms, hasCooling, hasEquilibrium, hasHess, points]);

  // Separate daily and achievements
  const dailyMissions = useMemo(() => missionsList.filter(m => m.type === "daily"), [missionsList]);
  const achievements = useMemo(() => missionsList.filter(m => m.type === "achievement"), [missionsList]);

  // Claim handler
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-16 overflow-hidden">
      {/* Absolute Background decoration */}
      <DecorativeBackground />

      {/* Navbar */}
      <Navbar />

      {/* Persistent desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeMenu="ภารกิจนักวิทย์" />
      </div>

      <div className={`relative z-10 min-w-0 transition-[padding-left] duration-300 ${isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"}`}>
        
        {/* Breadcrumb Navigation */}
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 pt-6 pb-2 select-none">
          <Breadcrumb category="Dashboard" title="ภารกิจนักวิทย์ / Missions" />
        </div>

        {/* Main Content */}
        <main className="w-full px-4 py-2 lg:px-8 max-w-[1440px] mx-auto space-y-8">
          
          {/* LEVEL XP PROGRESS BANNER CONTAINER */}
          <section className="bg-gradient-to-br from-[#f0f7ff]/95 via-[#f8fbff]/90 to-[#e0f2fe]/40 backdrop-blur-xl border border-blue-100/40 rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="absolute top-4 sm:top-6 right-4 sm:right-8 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100/60 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold text-emerald-600 select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>อัปเดตเรียลไทม์</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-100/60 border-4 border-white shadow-md flex items-center justify-center relative overflow-hidden select-none shrink-0">
                <Image src="/student_avatar_3d.png" alt="Mascot Avatar" fill sizes="96px" className="object-cover" />
              </div>

              <div className="flex flex-col text-center sm:text-left min-w-0 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-normal" style={{ lineHeight: '1.5' }}>
                    ภารกิจและการผจญภัยทางวิทยาศาสตร์
                  </h1>
                </div>
                <p className="text-xs text-slate-400 font-bold mt-1 select-none">
                  เคลียร์เควสต์แล็บจำลองและรับคะแนน XP เพื่ออัปเกรดระดับพลังงานนักวิทย์ของคุณ
                </p>

                {/* Level and XP progress bar */}
                <div className="mt-4 w-full sm:w-80">
                  <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold mb-1.5 select-none">
                    <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100/50">
                      เลเวล {currentLevel}
                    </span>
                    <span className="text-slate-500">
                      {currentXP} / 200 XP
                    </span>
                  </div>
                  <div className="w-full bg-slate-100/80 h-3.5 rounded-full overflow-hidden relative border border-slate-200/20">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500 relative"
                      style={{ width: `${xpPercentage}%` }}
                      role="progressbar"
                      aria-valuenow={xpPercentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] -translate-x-full animate-[pulse_2s_infinite]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Claimed Summary stats widget */}
            <div className="bg-white/80 border border-blue-100/40 rounded-2xl p-4 flex gap-6 shadow-xs select-none">
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">คะแนนสะสม</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">{points}</span>
              </div>
              <div className="w-[1px] bg-slate-200" />
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">ภารกิจที่เคลียร์</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {Object.values(claimedMissions).filter(Boolean).length} / {missionsList.length}
                </span>
              </div>
            </div>
          </section>

          {/* MAIN PAGE GRID GRID-COL-12 */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: DAILY MISSIONS (8-COLS ON DESKTOP) */}
            <div className="xl:col-span-7 space-y-6">
              
              <div className="bg-white border border-slate-200/60 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100 select-none">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                    <Compass className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-800">ภารกิจรายวัน (Daily Quests)</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">รีเซ็ตคะแนนและสถานะภารกิจใหม่ทุก 24 ชั่วโมง</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {dailyMissions.map((mission) => {
                    const isClaimed = claimedMissions[mission.id];
                    const percent = (mission.progress / mission.total) * 100;
                    
                    return (
                      <div 
                        key={mission.id}
                        className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-center sm:justify-between gap-4 ${
                          isClaimed
                            ? "bg-slate-50/40 border-slate-100 opacity-75"
                            : mission.isCompleted
                              ? "bg-white border-blue-200/80 shadow-xs hover:border-blue-300"
                              : "bg-white border-slate-200/60"
                        }`}
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg select-none">
                              รายวัน
                            </span>
                            <h4 className="text-sm font-black text-slate-800">{mission.title}</h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mission.desc}</p>
                          
                          {/* Progress bar info */}
                          <div className="flex items-center gap-3 mt-3 w-full sm:max-w-xs">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden relative">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  mission.isCompleted ? "bg-emerald-500" : "bg-blue-500"
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-400 shrink-0 w-8 text-right select-none">
                              {mission.progress} / {mission.total}
                            </span>
                          </div>
                        </div>

                        {/* Claim action button wrapper */}
                        <div className="shrink-0">
                          {isClaimed ? (
                            <span className="px-4 py-2.5 inline-block text-xs font-black text-slate-400 bg-slate-100 rounded-xl select-none cursor-default">
                              รับแล้ว ✓
                            </span>
                              ) : mission.isCompleted ? (
                                <button
                                  type="button"
                                  disabled={claimingMissionId === mission.id}
                                  onClick={() => handleClaimReward(mission.id, mission.title)}
                                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/10 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer flex items-center gap-1.5 disabled:cursor-wait disabled:opacity-70"
                                >
                                  <Gift className="w-3.5 h-3.5" />
                                  <span>{claimingMissionId === mission.id ? "กำลังบันทึก..." : `รับรางวัล +${mission.rewardPoints} XP`}</span>
                                </button>
                          ) : (
                            <span className="px-4 py-2.5 inline-block text-xs font-bold text-slate-400 bg-slate-100/60 rounded-xl select-none cursor-default">
                              กำลังทำ...
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACHIEVEMENTS BLOCK */}
              <div className="bg-white border border-slate-200/60 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100 select-none">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                    <Trophy className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-800">เกียรติยศถาวร (Milestone Achievements)</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">รางวัลสำหรับความก้าวหน้าและการทดลองเสมือนจริงตลอดการใช้งาน</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {achievements.map((mission) => {
                    const isClaimed = claimedMissions[mission.id];
                    const percent = (mission.progress / mission.total) * 100;
                    
                    return (
                      <div 
                        key={mission.id}
                        className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-center sm:justify-between gap-4 ${
                          isClaimed
                            ? "bg-slate-50/40 border-slate-100 opacity-75"
                            : mission.isCompleted
                              ? "bg-white border-blue-200/80 shadow-xs hover:border-blue-300"
                              : "bg-white border-slate-200/60"
                        }`}
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-lg select-none">
                              ความสำเร็จ
                            </span>
                            <h4 className="text-sm font-black text-slate-800">{mission.title}</h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mission.desc}</p>
                          
                          {/* Progress bar info */}
                          <div className="flex items-center gap-3 mt-3 w-full sm:max-w-xs">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden relative">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  mission.isCompleted ? "bg-emerald-500" : "bg-indigo-500"
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-400 shrink-0 w-12 text-right select-none">
                              {mission.progress} / {mission.total}
                            </span>
                          </div>
                        </div>

                        {/* Claim action button wrapper */}
                        <div className="shrink-0">
                          {isClaimed ? (
                            <span className="px-4 py-2.5 inline-block text-xs font-black text-slate-400 bg-slate-100 rounded-xl select-none cursor-default">
                              รับแล้ว ✓
                            </span>
                              ) : mission.isCompleted ? (
                                <button
                                  type="button"
                                  disabled={claimingMissionId === mission.id}
                                  onClick={() => handleClaimReward(mission.id, mission.title)}
                                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-blue-600/10 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer flex items-center gap-1.5 disabled:cursor-wait disabled:opacity-70"
                                >
                                  <Gift className="w-3.5 h-3.5" />
                                  <span>{claimingMissionId === mission.id ? "กำลังบันทึก..." : `รับรางวัล +${mission.rewardPoints} XP`}</span>
                                </button>
                          ) : (
                            <span className="px-4 py-2.5 inline-block text-xs font-bold text-slate-400 bg-slate-100/60 rounded-xl select-none cursor-default">
                              กำลังทำ...
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: QUEST CATEGORIES INFO & TIPS (4-COLS ON DESKTOP) */}
            <div className="xl:col-span-5 space-y-6">
              
              {/* Leaderboard or Tips card */}
              <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border border-blue-100/50 rounded-[32px] p-6 shadow-sm text-left">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-indigo-500 animate-pulse" />
                  <h4 className="text-sm font-black text-indigo-700 bg-indigo-100/60 px-2.5 py-1 rounded-lg inline-block select-none">
                    เคล็ดลับนักวิทยาศาสตร์
                  </h4>
                </div>
                <h3 className="text-base font-black text-slate-800 mt-4 leading-normal">
                  ทําแล็บจำลองและสอบถาม AI ไออุ่นอย่างสม่ำเสมอ
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  ทุกๆ การทดลองจำลองที่บันทึกผลการประเมินลงในคลาวด์จะนำมาคิดระดับความก้าวหน้า +25 XP โดยอัตโนมัติ และคุณสามารถปลดล็อกเหรียญตราเกียรติยศต่างๆ ในหน้าโปรไฟล์เพื่อแสดงประวัติการทดลองอันน่าภาคภูมิใจ
                </p>

                <div className="border-t border-indigo-100/60 pt-4 mt-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-indigo-100 text-indigo-500 shadow-xs shrink-0 select-none">
                      🧪
                    </div>
                    <div className="text-left min-w-0">
                      <h5 className="text-[11px] font-black text-slate-800 truncate">บันทึกแล็บวงจรโอห์ม</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-none">เคลียร์เควสต์ฟิสิกส์: +30 XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-indigo-100 text-indigo-500 shadow-xs shrink-0 select-none">
                      🌡️
                    </div>
                    <div className="text-left min-w-0">
                      <h5 className="text-[11px] font-black text-slate-800 truncate">บันทึกแล็บการเย็นตัว</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-none">เคลียร์เควสต์ฟิสิกส์: +30 XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-indigo-100 text-indigo-500 shadow-xs shrink-0 select-none">
                      ⚖️
                    </div>
                    <div className="text-left min-w-0">
                      <h5 className="text-[11px] font-black text-slate-800 truncate">บันทึกสมดุลเคมีเลอชาเตอลิเย</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-none">เคลียร์เควสต์เคมี: +30 XP</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Callout button to return to simulations */}
              <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 p-[1.2px] shadow-sm select-none">
                <div className="bg-white/95 rounded-[23px] p-5.5 flex flex-col gap-4 text-center sm:text-left relative overflow-hidden">
                  <div className="flex flex-col text-left">
                    <h4 className="text-sm font-extrabold text-slate-800 leading-normal">
                      พร้อมออกสํารวจแล็บจำลองหรือยัง?
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      เข้าไปที่หน้าแรกและเลือกแล็บฟิสิกส์ เคมี หรือชีววิทยา เพื่อสะสม XP และรางวัลเกียรติยศต่างๆ กันเถอะ! 🚀
                    </p>
                  </div>
                  
                  <button
                    onClick={() => window.location.href = "/"}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-black text-indigo-500 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 px-4 py-2.5 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                    <span>สำรวจห้องแล็บทดลอง</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* FLOAT TOAST FEEDBACK NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 text-white text-xs font-bold shadow-2xl animate-in slide-in-from-bottom-6 duration-300 select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
