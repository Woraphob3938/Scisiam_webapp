"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FlaskConical,
  History,
  LayoutGrid,
  Play,
  Search,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { LAB_SAVED_EXPERIMENT_KEYS } from "@/data/labSavedExperiments";
import { getLabReadiness, readyLabCount } from "@/data/labReadiness";
import { labsById, labsData } from "@/data/labs";
import {
  loadSupabaseLearningSnapshot,
  readLocalLearningSnapshot,
  type LearningRunSnapshot,
  type LearningSnapshot,
} from "@/lib/supabase/learning-snapshot";
import { SCISIAM_AUTH_EVENT } from "@/lib/supabase/auth-cache";

type CategoryFilter = "All" | "Physics" | "Chemistry" | "Biology" | "Mathematics" | "Foundation";

type HistorySource = "cloud" | "local";

type HistoryRecord = {
  id: string;
  labId: string;
  title: string;
  description: string;
  category: Exclude<CategoryFilter, "All">;
  createdAt: string;
  createdAtLabel: string;
  createdAtMs: number;
  dataPointCount: number | null;
  source: HistorySource;
  isReady: boolean;
};

const emptySnapshot: LearningSnapshot = {
  completedCount: 0,
  completedLabIds: [],
  recentRuns: [],
};

const categoryFilters: Array<{
  id: CategoryFilter;
  label: string;
  shortLabel: string;
  tone: string;
}> = [
  {
    id: "All",
    label: "ทั้งหมด",
    shortLabel: "ทั้งหมด",
    tone: "border-blue-200 bg-blue-600 text-white shadow-blue-500/15",
  },
  {
    id: "Physics",
    label: "Physics",
    shortLabel: "ฟิสิกส์",
    tone: "border-blue-100 bg-blue-50 text-blue-700",
  },
  {
    id: "Chemistry",
    label: "Chemistry",
    shortLabel: "เคมี",
    tone: "border-purple-100 bg-purple-50 text-purple-700",
  },
  {
    id: "Biology",
    label: "Biology",
    shortLabel: "ชีววิทยา",
    tone: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  {
    id: "Mathematics",
    label: "Mathematics",
    shortLabel: "คณิตศาสตร์",
    tone: "border-violet-100 bg-violet-50 text-violet-700",
  },
  {
    id: "Foundation",
    label: "Foundation",
    shortLabel: "ความรู้พื้นฐาน",
    tone: "border-sky-100 bg-sky-50 text-sky-700",
  },
];

const categoryLabels: Record<Exclude<CategoryFilter, "All">, string> = {
  Physics: "ฟิสิกส์",
  Chemistry: "เคมี",
  Biology: "ชีววิทยา",
  Mathematics: "คณิตศาสตร์",
  Foundation: "ความรู้พื้นฐาน",
};

const categoryBarTone: Record<Exclude<CategoryFilter, "All">, string> = {
  Physics: "bg-blue-500",
  Chemistry: "bg-purple-500",
  Biology: "bg-emerald-500",
  Mathematics: "bg-rose-500",
  Foundation: "bg-sky-500",
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return value || "เมื่อไม่นานมานี้";
}

function toTimestampMs(value: string | undefined) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function countDataPoints(savedData: unknown) {
  if (!savedData || typeof savedData !== "object") return null;
  const record = savedData as { dataPoints?: unknown; graphPoints?: unknown; points?: unknown };
  const points = record.dataPoints || record.graphPoints || record.points;
  return Array.isArray(points) ? points.length : null;
}

function readLocalHistoryRecords(): HistoryRecord[] {
  if (typeof window === "undefined") return [];

  return labsData.flatMap((lab) => {
    const storageKey = LAB_SAVED_EXPERIMENT_KEYS[lab.id];
    if (!storageKey) return [];

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];

    let parsed: unknown = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    const timestamp =
      parsed && typeof parsed === "object" && "timestamp" in parsed
        ? String((parsed as { timestamp?: unknown }).timestamp || "")
        : "";
    const createdAtMs = toTimestampMs(timestamp);

    return [
      {
        id: `local-${lab.id}`,
        labId: lab.id,
        title: lab.title,
        description: lab.description,
        category: lab.category,
        createdAt: timestamp || "เมื่อไม่นานมานี้",
        createdAtLabel: timestamp ? formatDateTime(timestamp) : "เมื่อไม่นานมานี้",
        createdAtMs,
        dataPointCount: countDataPoints(parsed),
        source: "local" as const,
        isReady: getLabReadiness(lab.id).isReady,
      },
    ];
  });
}

function mapRunToRecord(run: LearningRunSnapshot): HistoryRecord | null {
  const lab = labsById[run.labId];
  if (!lab) return null;

  return {
    id: `cloud-${run.id}`,
    labId: run.labId,
    title: lab.title,
    description: lab.description,
    category: lab.category,
    createdAt: run.createdAt,
    createdAtLabel: formatDateTime(run.createdAt),
    createdAtMs: toTimestampMs(run.createdAt),
    dataPointCount: null,
    source: "cloud",
    isReady: getLabReadiness(run.labId).isReady,
  };
}

function sortHistoryRecords(records: HistoryRecord[]) {
  return [...records].sort(
    (a, b) => b.createdAtMs - a.createdAtMs || a.title.localeCompare(b.title),
  );
}

function mapCloudHistoryRecords(cloudRuns: LearningRunSnapshot[]) {
  return sortHistoryRecords(
    cloudRuns.map(mapRunToRecord).filter(Boolean) as HistoryRecord[],
  );
}

function sourceText(source: HistorySource) {
  return source === "cloud" ? "บันทึกบนบัญชี" : "บันทึกในเครื่องนี้";
}

type LearningHistoryPageProps = { embedded?: boolean };

export default function LearningHistoryPage({ embedded = false }: LearningHistoryPageProps) {
  const { isCollapsed } = useSidebar();
  const [snapshot, setSnapshot] = useState<LearningSnapshot>(emptySnapshot);
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<HistorySource>("local");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setLoading(true);
      const localSnapshot = readLocalLearningSnapshot();
      const localRecords = readLocalHistoryRecords();
      let nextSnapshot = localSnapshot;
      let nextSource: HistorySource = "local";

      try {
        const cloudSnapshot = await loadSupabaseLearningSnapshot();
        if (cloudSnapshot) {
          nextSnapshot = cloudSnapshot;
          nextSource = "cloud";
        }
      } catch (error) {
        console.error("Failed to load learning history", error);
      }

      if (cancelled) return;

      setSnapshot(nextSnapshot);
      setRecords(
        nextSource === "cloud"
          ? mapCloudHistoryRecords(nextSnapshot.recentRuns)
          : sortHistoryRecords(localRecords),
      );
      setSource(nextSource);
      setLoading(false);
    };

    void loadHistory();
    window.addEventListener("storage", loadHistory);
    window.addEventListener(SCISIAM_AUTH_EVENT, loadHistory);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", loadHistory);
      window.removeEventListener(SCISIAM_AUTH_EVENT, loadHistory);
    };
  }, []);

  const completedLabIds = useMemo(() => {
    const ids = new Set(snapshot.completedLabIds);
    if (source === "local") {
      records.forEach((record) => ids.add(record.labId));
    }
    return ids;
  }, [records, snapshot.completedLabIds, source]);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return records.filter((record) => {
      const matchesCategory = category === "All" || record.category === category;
      const matchesSearch =
        !query ||
        record.title.toLowerCase().includes(query) ||
        record.description.toLowerCase().includes(query) ||
        record.category.toLowerCase().includes(query) ||
        categoryLabels[record.category].toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [category, records, searchQuery]);

  const categoryProgress = useMemo(
    () =>
      (["Physics", "Chemistry", "Biology", "Mathematics"] as const).map((item) => {
        const total = labsData.filter((lab) => lab.category === item).length;
        const completed = labsData.filter(
          (lab) => lab.category === item && completedLabIds.has(lab.id)
        ).length;

        return {
          id: item,
          label: categoryLabels[item],
          total,
          completed,
          percent: Math.round((completed / Math.max(total, 1)) * 100),
        };
      }),
    [completedLabIds]
  );

  const nextLabs = useMemo(
    () =>
      labsData
        .filter((lab) => getLabReadiness(lab.id).isReady && !completedLabIds.has(lab.id))
        .slice(0, 3),
    [completedLabIds]
  );

  const latestRecord = records[0];
  const completedCount = Math.max(snapshot.completedCount, completedLabIds.size);
  const progressPercent = Math.round((completedCount / Math.max(readyLabCount, 1)) * 100);

  return (
    <div className={embedded ? "font-sans antialiased" : "flex min-h-screen flex-col bg-slate-50 font-sans antialiased selection:bg-blue-600 selection:text-white"}>
      {embedded ? null : <Navbar />}

      <div className={embedded ? "hidden" : "hidden lg:block"}>
        <Sidebar activeMenu="ประวัติการเรียนรู้" />
      </div>

      <div
        className={`relative z-10 min-w-0 pb-28 transition-[padding-left] duration-300 lg:pb-12 ${
          embedded ? "" : isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"
        }`}
      >
        <section className="border-b border-slate-200/70 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_68%,#f8fafc_100%)] px-4 py-5 sm:px-8 lg:px-10 lg:py-7">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 text-xs font-extrabold leading-[1.45] text-blue-700">
                  <History className="h-4 w-4" />
                  ประวัติการเรียนรู้
                </div>
                <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-[1.25] tracking-normal text-slate-950 sm:text-4xl lg:text-[42px]">
                  ดูเส้นทางการทดลองของคุณใน Scisiam
                </h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500 sm:text-base">
                  รวมแล็บที่บันทึกผลแล้วและห้องที่ควรทดลองต่อ โดยใช้ข้อมูลจากบัญชีหรือข้อมูลในเครื่องนี้ตามสถานะการใช้งาน
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:shrink-0">
                <Link
                  href="/labs"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold leading-[1.45] text-white shadow-md shadow-blue-500/15 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                >
                  <LayoutGrid className="h-4 w-4" />
                  ห้องแล็บ
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <SummaryCard
                icon={FlaskConical}
                label="แล็บที่บันทึกแล้ว"
                value={`${completedCount}`}
                detail={`จากแล็บพร้อมทดลอง ${readyLabCount} ห้อง`}
                tone="blue"
              />
              <SummaryCard
                icon={BarChart3}
                label="ความคืบหน้า"
                value={`${Math.min(100, progressPercent)}%`}
                detail="คิดจากแล็บที่พร้อมทดลอง"
                tone="emerald"
              />
              <SummaryCard
                icon={Clock3}
                label="ล่าสุด"
                value={latestRecord ? latestRecord.title : "ยังไม่มี"}
                detail={latestRecord ? latestRecord.createdAtLabel : "เริ่มบันทึกผลการทดลองแรก"}
                tone="slate"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-10 lg:py-7">
          <div className="grid gap-5 self-start">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-extrabold leading-[1.45] text-blue-600">
                    รายการกิจกรรม
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold leading-[1.35] tracking-normal text-slate-950">
                    ประวัติแล็บที่บันทึกผลแล้ว
                  </h2>
                </div>

                <div className="relative w-full lg:max-w-sm">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="ค้นหาแล็บ เช่น Newton, Titration..."
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold leading-[1.45] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-200 focus:bg-white focus:ring-3 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {categoryFilters.map((item) => {
                  const isActive = category === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id)}
                      aria-pressed={isActive}
                      className={`inline-flex min-h-10 items-center justify-center rounded-xl border px-3 py-2 text-xs font-extrabold leading-[1.45] transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${
                        isActive
                          ? item.tone
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      <span className="sm:hidden">{item.shortLabel}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="min-h-[132px] animate-pulse rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40"
                  >
                    <div className="h-4 w-28 rounded-full bg-slate-100" />
                    <div className="mt-5 h-6 w-2/3 rounded-full bg-slate-100" />
                    <div className="mt-3 h-4 w-full rounded-full bg-slate-100" />
                    <div className="mt-2 h-4 w-3/4 rounded-full bg-slate-100" />
                  </div>
                ))
              ) : filteredRecords.length === 0 ? (
                <EmptyHistoryState hasAnyRecords={records.length > 0} />
              ) : (
                filteredRecords.map((record) => <HistoryItem key={record.id} record={record} />)
              )}
            </div>
          </div>

          <aside className="grid gap-5 self-start">
            <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold leading-[1.45] text-slate-400">
                    Learning Progress
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold leading-[1.35] tracking-normal text-slate-950">
                    ภาพรวมรายหมวด
                  </h2>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                {categoryProgress.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-extrabold leading-[1.45] text-slate-700">
                        {item.label}
                      </span>
                      <span className="font-bold leading-[1.45] text-slate-400">
                        {item.completed}/{item.total}
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${categoryBarTone[item.id]} transition-[width] duration-500`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold leading-[1.45] text-blue-600">
                    แนะนำต่อ
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold leading-[1.35] tracking-normal text-slate-950">
                    ห้องที่ยังไม่ได้บันทึก
                  </h2>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                {nextLabs.length === 0 ? (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-4 text-sm font-bold leading-relaxed text-emerald-700">
                    เยี่ยมมาก คุณบันทึกแล็บที่พร้อมทดลองครบแล้ว
                  </div>
                ) : (
                  nextLabs.map((lab) => (
                    <Link
                      key={lab.id}
                      href={`/labs/${lab.id}`}
                      className="group rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 transition-colors hover:border-blue-200 hover:bg-blue-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold leading-[1.4] text-slate-800 group-hover:text-blue-700">
                            {lab.title}
                          </p>
                          <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
                            {categoryLabels[lab.category]}
                          </p>
                        </div>
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-600" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "emerald" | "amber" | "slate";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="flex items-start gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold leading-[1.45] text-slate-400">{label}</p>
          <p className="mt-1 line-clamp-2 text-xl font-extrabold leading-[1.3] tracking-normal text-slate-950 sm:text-2xl">
            {value}
          </p>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function HistoryItem({ record }: { record: HistoryRecord }) {
  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 transition-colors hover:border-blue-200 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-7 items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 text-xs font-extrabold leading-[1.45] text-slate-600">
              {categoryLabels[record.category]}
            </span>
            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 text-xs font-extrabold leading-[1.45] text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              บันทึกแล้ว
            </span>
            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs font-bold leading-[1.45] text-slate-500">
              <CalendarClock className="h-3.5 w-3.5" />
              {record.createdAtLabel}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-extrabold leading-[1.35] tracking-normal text-slate-950 sm:text-xl">
            {record.title}
          </h3>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
            {record.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold leading-[1.45] text-slate-500">
            <span className="rounded-lg bg-slate-50 px-2.5 py-1.5">
              {sourceText(record.source)}
            </span>
            {record.dataPointCount !== null ? (
              <span className="rounded-lg bg-purple-50 px-2.5 py-1.5 text-purple-700">
                ข้อมูล {record.dataPointCount} จุด
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex lg:shrink-0">
          <Link
            href={record.isReady ? `/labs/${record.labId}/simulation` : `/labs/${record.labId}`}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-extrabold leading-[1.45] text-white shadow-md shadow-blue-500/15 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 sm:w-auto"
          >
            <Play className="h-4 w-4" />
            ทดลองต่อ
          </Link>
        </div>
      </div>
    </article>
  );
}

function EmptyHistoryState({ hasAnyRecords }: { hasAnyRecords: boolean }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center shadow-sm shadow-slate-200/40">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
        <History className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-extrabold leading-[1.35] tracking-normal text-slate-950">
        {hasAnyRecords ? "ไม่พบประวัติในตัวกรองนี้" : "ยังไม่มีประวัติการเรียนรู้"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-slate-500">
        {hasAnyRecords
          ? "ลองเปลี่ยนหมวดวิชาหรือคำค้นหาเพื่อดูรายการที่บันทึกไว้"
          : "เมื่อคุณเข้าห้องแล็บและกดบันทึกผล ระบบจะแสดงกิจกรรมจริงของคุณในหน้านี้"}
      </p>
      <Link
        href="/labs"
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold leading-[1.45] text-white shadow-md shadow-blue-500/15 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
      >
        ไปเลือกห้องแล็บ
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
