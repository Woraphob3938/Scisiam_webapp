"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Gift, LockKeyhole, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { loadSupabaseLearningSnapshot, readLocalLearningSnapshot } from "@/lib/supabase/learning-snapshot";
import { claimMissionReward, loadClaimedMissionIds } from "@/lib/supabase/missions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface Mission {
  id: string;
  title: string;
  desc: string;
  type: "daily" | "achievement";
  category: "Physics" | "Chemistry" | "General";
  progress: number;
  total: number;
  isCompleted: boolean;
}

export default function MissionsPage() {
  const { isCollapsed } = useSidebar();
  const [completedCount, setCompletedCount] = useState(0);
  const [completedLabIds, setCompletedLabIds] = useState<string[]>([]);
  const [claimedMissions, setClaimedMissions] = useState<Record<string, boolean>>({});
  const [claimingMissionId, setClaimingMissionId] = useState<string | null>(null);
  const [activeMissionType, setActiveMissionType] = useState<"daily" | "achievement">("daily");
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  const [loadingMissions, setLoadingMissions] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const applySnapshot = (snapshot: ReturnType<typeof readLocalLearningSnapshot>) => {
      if (cancelled) return;
      setCompletedCount(snapshot.completedCount);
      setCompletedLabIds(snapshot.completedLabIds);
    };

    const loadData = async () => {
      try {
        if (isSupabaseConfigured()) {
          const {
            data: { user },
          } = await createClient().auth.getUser();

          if (user) {
            const [snapshot, claimedIds] = await Promise.all([
              loadSupabaseLearningSnapshot(),
              loadClaimedMissionIds(),
            ]);
            if (snapshot) applySnapshot(snapshot);
            if (!cancelled) {
              setClaimedMissions(Object.fromEntries(claimedIds.map((id) => [id, true])));
            }
            return;
          }
        }

        applySnapshot(readLocalLearningSnapshot());
        const [snapshot, claimedIds] = await Promise.all([
          loadSupabaseLearningSnapshot(),
          loadClaimedMissionIds(),
        ]);
        if (snapshot) applySnapshot(snapshot);
        if (!cancelled) {
          setClaimedMissions(Object.fromEntries(claimedIds.map((id) => [id, true])));
        }
      } catch (error) {
        console.error("Failed to load mission progress", error);
        applySnapshot(readLocalLearningSnapshot());
      } finally {
        if (!cancelled) setLoadingMissions(false);
      }
    };

    const timer = window.setTimeout(() => void loadData(), 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const completedSet = useMemo(() => new Set(completedLabIds), [completedLabIds]);
  const missionsList = useMemo<Mission[]>(
    () => [
      {
        id: "daily-login",
        title: "เข้าศึกษาประจำวัน",
        desc: "เข้าสู่ระบบและสำรวจห้องปฏิบัติการจำลองของ SciSiam",
        type: "daily",
        category: "General",
        progress: 1,
        total: 1,
        isCompleted: true,
      },
      {
        id: "daily-science-1",
        title: "ผู้ใฝ่รู้ห้องปฏิบัติการ",
        desc: "ทำการจำลองแล็บและบันทึกผลอย่างน้อย 1 ห้อง",
        type: "daily",
        category: "General",
        progress: Math.min(1, completedCount),
        total: 1,
        isCompleted: completedCount >= 1,
      },
      {
        id: "daily-science-3",
        title: "ยอดนักวิจัยขั้นสูง",
        desc: "ทำการทดลองและบันทึกผลสำเร็จครบ 3 ห้อง",
        type: "daily",
        category: "General",
        progress: Math.min(3, completedCount),
        total: 3,
        isCompleted: completedCount >= 3,
      },
      {
        id: "quest-ohms",
        title: "วิศวกรไฟฟ้ากระแสตรง",
        desc: "ทำห้องปฏิบัติการวงจรกระแสตรงกฎของโอห์มสำเร็จ",
        type: "achievement",
        category: "Physics",
        progress: completedSet.has("ohms-law") ? 1 : 0,
        total: 1,
        isCompleted: completedSet.has("ohms-law"),
      },
      {
        id: "quest-cooling",
        title: "ผู้ควบคุมความร้อนนิวตัน",
        desc: "ทำห้องปฏิบัติการกฎการเย็นตัวของนิวตันสำเร็จ",
        type: "achievement",
        category: "Physics",
        progress: completedSet.has("newtons-cooling") ? 1 : 0,
        total: 1,
        isCompleted: completedSet.has("newtons-cooling"),
      },
      {
        id: "quest-equilibrium",
        title: "ปรมาจารย์สมดุลเคมี",
        desc: "ทำห้องปฏิบัติการการรบกวนสมดุลเคมีสำเร็จ",
        type: "achievement",
        category: "Chemistry",
        progress: completedSet.has("le-chateliers-principle") ? 1 : 0,
        total: 1,
        isCompleted: completedSet.has("le-chateliers-principle"),
      },
      {
        id: "quest-hesss",
        title: "ยอดนักคำนวณแคลอรี",
        desc: "ทำห้องปฏิบัติการกฎของเฮสส์สำเร็จ",
        type: "achievement",
        category: "Chemistry",
        progress: completedSet.has("hesss-law") ? 1 : 0,
        total: 1,
        isCompleted: completedSet.has("hesss-law"),
      },
      {
        id: "ach-five-labs",
        title: "ผู้เชี่ยวชาญการวิจัยเสมือนจริง",
        desc: "ฝึกทักษะการทดลองในห้องปฏิบัติการจำลองครบ 5 ห้อง",
        type: "achievement",
        category: "General",
        progress: Math.min(5, completedCount),
        total: 5,
        isCompleted: completedCount >= 5,
      },
    ],
    [completedCount, completedSet],
  );

  const visibleMissions = missionsList.filter((mission) => mission.type === activeMissionType);
  const completedMissionCount = missionsList.filter((mission) => mission.isCompleted).length;
  const claimedCount = Object.values(claimedMissions).filter(Boolean).length;

  const showToast = (message: string, type: "success" | "info" | "error") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  const handleClaimReward = async (mission: Mission) => {
    if (claimingMissionId || claimedMissions[mission.id] || !mission.isCompleted) return;
    setClaimingMissionId(mission.id);

    try {
      const result = await claimMissionReward({ missionId: mission.id });
      if (result.ok) {
        setClaimedMissions((current) => ({ ...current, [mission.id]: true }));
        showToast(
          result.alreadyClaimed
            ? `ภารกิจ "${mission.title}" รับรางวัลไปแล้ว`
            : "บันทึกภารกิจสำเร็จและปลดล็อกรางวัลแล้ว",
          "success",
        );
      } else if (result.reason === "signed_out" || result.reason === "not_configured") {
        showToast("เข้าสู่ระบบก่อนรับรางวัล เพื่อบันทึกความสำเร็จลงบัญชี SciSiam", "info");
      } else if (result.reason === "not_completed") {
        showToast("ภารกิจนี้ยังไม่ครบเงื่อนไข ลองทำแล็บและบันทึกผลเพิ่ม", "info");
      } else {
        showToast(result.message || "รับรางวัลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", "error");
      }
    } finally {
      setClaimingMissionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900 lg:pb-10">
      <Navbar />
      <div className="hidden lg:block"><Sidebar activeMenu="ภารกิจ" /></div>

      <main className={`min-w-0 transition-[padding-left] duration-300 ${isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"}`}>
        <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-extrabold text-blue-600">MISSIONS</p>
              <h1 className="mt-2 text-3xl font-extrabold leading-[1.3] text-slate-950">ภารกิจนักวิทย์</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">ทำแล็บ บันทึกผล และปลดล็อกรางวัลจากความสำเร็จในการเรียนรู้</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatusBlock label="ครบเงื่อนไข" value={`${completedMissionCount}/${missionsList.length}`} icon={CheckCircle2} tone="emerald" />
              <StatusBlock label="รับรางวัลแล้ว" value={`${claimedCount}/${missionsList.length}`} icon={Gift} tone="amber" />
            </div>
          </div>
        </section>

        {loadingMissions ? (
          <div className="mx-auto grid min-h-[42vh] max-w-7xl place-items-center px-4 py-10 sm:px-8 lg:px-10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" aria-label="กำลังโหลดภารกิจ" />
          </div>
        ) : (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-10">
          <div>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1" role="tablist" aria-label="ประเภทภารกิจ">
              <button type="button" role="tab" aria-selected={activeMissionType === "daily"} onClick={() => setActiveMissionType("daily")} className={`min-h-10 rounded-md px-4 text-sm font-extrabold ${activeMissionType === "daily" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>ภารกิจรายวัน</button>
              <button type="button" role="tab" aria-selected={activeMissionType === "achievement"} onClick={() => setActiveMissionType("achievement")} className={`min-h-10 rounded-md px-4 text-sm font-extrabold ${activeMissionType === "achievement" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>ความสำเร็จ</button>
            </div>

            <div className="mt-5 grid gap-3">
              {visibleMissions.map((mission) => {
                const claimed = Boolean(claimedMissions[mission.id]);
                const percent = Math.min(100, (mission.progress / mission.total) * 100);
                return (
                  <article key={mission.id} className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2 text-[10px] font-extrabold">
                          <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-blue-700">{mission.type === "daily" ? "รายวัน" : "ความสำเร็จ"}</span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-500">{mission.category}</span>
                        </div>
                        <h2 className="mt-3 text-base font-extrabold leading-[1.45] text-slate-900">{mission.title}</h2>
                        <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">{mission.desc}</p>
                      </div>
                      {claimed ? (
                        <span className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 text-xs font-extrabold text-emerald-700"><CheckCircle2 className="h-4 w-4" />รับแล้ว</span>
                      ) : mission.isCompleted ? (
                        <button type="button" disabled={claimingMissionId === mission.id} onClick={() => void handleClaimReward(mission)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-extrabold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"><Gift className="h-4 w-4" />{claimingMissionId === mission.id ? "กำลังบันทึก" : "รับรางวัล"}</button>
                      ) : (
                        <span className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-extrabold text-slate-400"><LockKeyhole className="h-4 w-4" />ยังไม่ครบ</span>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${mission.isCompleted ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${percent}%` }} /></div>
                      <span className="w-12 text-right text-xs font-extrabold text-slate-500">{mission.progress}/{mission.total}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="self-start border-l-4 border-blue-500 bg-white p-5 shadow-sm">
            <Target className="h-6 w-6 text-blue-600" />
            <h2 className="mt-4 text-lg font-extrabold text-slate-950">ทำภารกิจต่อ</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">บันทึกผลหลังจบแล็บทุกครั้ง ระบบจะอัปเดตความคืบหน้าและรางวัลที่ปลดล็อกให้อัตโนมัติ</p>
            <Link href="/labs" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white hover:bg-blue-700">ไปหน้าห้องแล็บ<ArrowRight className="h-4 w-4" /></Link>
          </aside>
        </section>
        )}
      </main>

      {toast ? (
        <div className={`fixed bottom-24 right-4 z-50 max-w-[calc(100vw-2rem)] rounded-lg px-4 py-3 text-sm font-extrabold text-white shadow-xl lg:bottom-6 ${toast.type === "error" ? "bg-rose-600" : toast.type === "info" ? "bg-blue-700" : "bg-slate-950"}`}>{toast.message}</div>
      ) : null}
    </div>
  );
}

function StatusBlock({ label, value, icon: Icon, tone }: { label: string; value: string; icon: React.ElementType; tone: "emerald" | "amber" }) {
  const color = tone === "emerald" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-amber-100 bg-amber-50 text-amber-800";
  return <div className={`min-w-32 border p-3 ${color}`}><Icon className="h-4 w-4" /><p className="mt-2 text-[10px] font-extrabold">{label}</p><p className="mt-1 text-xl font-extrabold">{value}</p></div>;
}
