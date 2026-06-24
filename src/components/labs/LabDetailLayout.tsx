"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Beaker,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Database,
  Info,
  ListChecks,
  LucideIcon,
  Target,
  Trash2,
} from "lucide-react";

import type { LabData } from "@/components/LabCard";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/labs/Breadcrumb";
import EquipmentList from "@/components/labs/EquipmentList";
import ExperimentSteps from "@/components/labs/ExperimentSteps";
import LabHero from "@/components/labs/LabHero";
import LabSidebar from "@/components/labs/LabSidebar";
import TheoryCard from "@/components/labs/TheoryCard";
import type { LabDetailData } from "@/data/labDetails";
import { getSavedExperimentKey } from "@/data/labSavedExperiments";

type SavedExperimentRecord = {
  labId?: string;
  timestamp?: string;
  dataPoints?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

type LabDetailLayoutProps = {
  labId: string;
  lab: LabData;
  details: LabDetailData;
};

type SavedMetric = {
  label: string;
  value: string;
};

type SubjectTheme = {
  accentBg: string;
  accentBorder: string;
  accentText: string;
  dot: string;
  subtleSurface: string;
};

type DetailTab = "overview" | "equipment" | "theory" | "steps" | "saved" | "info";

const SUBJECT_THEMES: Record<string, SubjectTheme> = {
  Physics: {
    accentBg: "bg-blue-50",
    accentBorder: "border-blue-100",
    accentText: "text-blue-700",
    dot: "bg-blue-500",
    subtleSurface: "bg-blue-50/45",
  },
  Chemistry: {
    accentBg: "bg-violet-50",
    accentBorder: "border-violet-100",
    accentText: "text-violet-700",
    dot: "bg-violet-500",
    subtleSurface: "bg-violet-50/45",
  },
  Biology: {
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-100",
    accentText: "text-emerald-700",
    dot: "bg-emerald-500",
    subtleSurface: "bg-emerald-50/45",
  },
  Mathematics: {
    accentBg: "bg-violet-50",
    accentBorder: "border-violet-100",
    accentText: "text-violet-700",
    dot: "bg-violet-500",
    subtleSurface: "bg-violet-50/45",
  },
};

function getSubjectTheme(category: string) {
  return SUBJECT_THEMES[category] ?? SUBJECT_THEMES.Physics;
}

const EXCLUDED_SAVED_FIELDS = new Set([
  "labId",
  "timestamp",
  "dataPoints",
  "graphPoints",
  "tableRows",
  "summary",
  "score",
  "localStorageKey",
]);

const SAVED_FIELD_LABELS: Record<string, string> = {
  absorbance: "Absorbance",
  ambientTemp: "T_s",
  carbonDioxide: "CO2",
  cellCount: "Cells",
  cellVoltage: "Ecell",
  charge: "Charge",
  concentration: "Concentration",
  coolingConstant: "k",
  current: "Current",
  deltaT: "Delta T",
  dnaIntegrity: "DNA integrity",
  gasMoles: "n",
  initialReactant: "Reactant",
  initialTemp: "T0",
  ionProduct: "Ion product",
  ksp: "Ksp",
  lightIntensity: "Light",
  molality: "Molality",
  molarVolume: "Molar volume",
  moles: "Moles",
  parentA: "Parent A",
  parentB: "Parent B",
  pathLength: "Path length",
  platedMass: "Plated mass",
  pressure: "Pressure",
  reactionRate: "Reaction rate",
  reactionType: "Reaction",
  resistance: "Resistance",
  saturationIndex: "Qsp/Ksp",
  spindleHealth: "Checkpoint",
  temperature: "Temperature",
  voltage: "Voltage",
  waterLevel: "Water",
  wavelength: "Wavelength",
};

function isSavedExperimentRecord(value: unknown): value is SavedExperimentRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatSavedValue(value: unknown) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return Math.abs(value) >= 100 ? value.toFixed(0) : Number(value.toFixed(3)).toString();
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return null;
}

function collectSavedMetrics(savedData: SavedExperimentRecord): SavedMetric[] {
  const topLevelMetrics = Object.entries(savedData)
    .filter(([key]) => !EXCLUDED_SAVED_FIELDS.has(key))
    .map(([key, value]) => {
      const formatted = formatSavedValue(value);
      if (!formatted) return null;

      return {
        label: SAVED_FIELD_LABELS[key] ?? key,
        value: formatted,
      };
    })
    .filter((metric): metric is SavedMetric => Boolean(metric));

  if (topLevelMetrics.length >= 4) {
    return topLevelMetrics.slice(0, 4);
  }

  const latestPoint = savedData.dataPoints?.at(-1);
  if (!latestPoint) {
    return topLevelMetrics;
  }

  const pointMetrics = Object.entries(latestPoint)
    .filter(([key]) => !EXCLUDED_SAVED_FIELDS.has(key))
    .map(([key, value]) => {
      const formatted = formatSavedValue(value);
      if (!formatted) return null;

      return {
        label: SAVED_FIELD_LABELS[key] ?? key,
        value: formatted,
      };
    })
    .filter((metric): metric is SavedMetric => Boolean(metric));

  return [...topLevelMetrics, ...pointMetrics].slice(0, 4);
}

function LearningOverviewPanel({
  details,
  theme,
}: {
  details: LabDetailData;
  theme: SubjectTheme;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-left">
          <p className={`mb-1 inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${theme.accentBorder} ${theme.accentBg} ${theme.accentText}`}>
            เตรียมความเข้าใจก่อนทดลอง
          </p>
          <h2 className="text-lg font-extrabold leading-snug text-slate-900">
            ภาพรวมและเป้าหมายการเรียนรู้
          </h2>
        </div>
        <div className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.accentBorder} ${theme.accentBg} ${theme.accentText} sm:flex`}>
          <Target className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <ClipboardList className={`h-4.5 w-4.5 ${theme.accentText}`} />
            ภาพรวมการทดลอง
          </div>
          <ul className="space-y-2.5">
            {details.overviewBullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${theme.dot}`} aria-hidden="true" />
                <span className="break-words text-sm font-medium leading-[1.65] text-slate-600">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`min-w-0 rounded-2xl border ${theme.accentBorder} ${theme.subtleSurface} p-4`}>
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <BookOpen className={`h-4.5 w-4.5 ${theme.accentText}`} />
            วัตถุประสงค์การเรียนรู้
          </div>
          <ul className="space-y-2.5">
            {details.learningObjectives.map((objective) => (
              <li key={objective} className="flex items-start gap-3">
                <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${theme.accentText}`} />
                <span className="break-words text-sm font-semibold leading-[1.65] text-slate-700">
                  {objective}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SavedExperimentPanel({
  labId,
  savedData,
  onClear,
}: {
  labId: string;
  savedData: SavedExperimentRecord;
  onClear: () => void;
}) {
  const metrics = useMemo(() => collectSavedMetrics(savedData), [savedData]);
  const dataPointCount = savedData.dataPoints?.length ?? 0;
  const timestamp = savedData.timestamp || "ไม่พบเวลาในข้อมูลบันทึก";

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              ผลการทดลองล่าสุดที่บันทึกไว้
            </h2>
            <p className="mt-0.5 text-[11px] font-semibold leading-relaxed text-slate-500">
              {timestamp}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
        >
          <Trash2 className="h-3.5 w-3.5" />
          ลบข้อมูลที่บันทึก
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold text-slate-500">
            <Database className="h-4 w-4 text-emerald-500" />
            จำนวนข้อมูล
          </div>
          <p className="text-xl font-black text-slate-900">
            {dataPointCount} จุด
          </p>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">
            บันทึกจากห้องทดลองจำลองของ <span className="font-mono">{labId}</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold text-slate-500">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            ค่าที่อ่านได้ล่าสุด
          </div>
          {metrics.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {metrics.map((metric) => (
                <div key={`${metric.label}-${metric.value}`} className="rounded-lg bg-white px-2.5 py-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-0.5 break-words text-xs font-black text-slate-800">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-semibold leading-relaxed text-slate-500">
              ข้อมูลบันทึกนี้ไม่มีตัวเลขสรุป แต่ยังใช้ยืนยันความคืบหน้าของแล็บได้
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function LabDetailLayout({ labId, lab, details }: LabDetailLayoutProps) {
  const router = useRouter();
  const [savedData, setSavedData] = useState<SavedExperimentRecord | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const theme = useMemo(() => getSubjectTheme(lab.category), [lab.category]);

  const loadSavedData = useCallback(() => {
    const key = getSavedExperimentKey(labId);
    if (!key) {
      setSavedData(null);
      return;
    }

    const raw = localStorage.getItem(key);
    if (!raw) {
      setSavedData(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (isSavedExperimentRecord(parsed) && parsed.labId === labId) {
        setSavedData(parsed);
        return;
      }
    } catch (error) {
      console.error("Failed to parse saved lab experiment", error);
    }

    setSavedData(null);
  }, [labId]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        loadSavedData();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadSavedData]);

  const handleStartExperiment = () => {
    router.push(`/labs/${labId}/simulation`);
  };

  const handleClearSavedData = () => {
    const key = getSavedExperimentKey(labId);
    if (!key) return;

    const confirmed = window.confirm("คุณต้องการลบประวัติผลการทดลองที่บันทึกไว้ล่าสุดหรือไม่?");
    if (!confirmed) return;

    localStorage.removeItem(key);
    setSavedData(null);
  };

  const tabs: Array<{ key: DetailTab; label: string; icon: LucideIcon }> = [
    { key: "overview", label: "ภาพรวม", icon: Info },
    { key: "steps", label: "ขั้นตอน", icon: ListChecks },
    { key: "theory", label: "ทฤษฎี", icon: BookOpen },
    { key: "equipment", label: "อุปกรณ์", icon: Beaker },
    { key: "saved", label: "ผลบันทึก", icon: BarChart3 },
    { key: "info", label: "ข้อมูลแล็บ", icon: ClipboardList },
  ];

  const tabContent = {
    overview: <LearningOverviewPanel details={details} theme={theme} />,
    equipment: <EquipmentList labId={labId} />,
    theory: <TheoryCard labId={labId} />,
    steps: <ExperimentSteps labId={labId} />,
    saved: savedData ? (
      <SavedExperimentPanel
        labId={labId}
        savedData={savedData}
        onClear={handleClearSavedData}
      />
    ) : (
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 text-left shadow-sm shadow-slate-200/40">
        <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
          <BarChart3 className={`h-5 w-5 ${theme.accentText}`} />
          ยังไม่มีผลการทดลองที่บันทึกไว้
        </h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
          เริ่มทดลองและกดบันทึกผลในห้องแล็บจำลอง แล้วข้อมูลล่าสุดจะแสดงในหมวดนี้
        </p>
      </section>
    ),
    info: <LabSidebar labId={labId} hasSavedResult={Boolean(savedData)} />,
  } satisfies Record<DetailTab, React.ReactNode>;

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8fafc] pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-12">
      <Navbar />

      <div className="hidden w-full max-w-[1440px] select-none px-6 pb-2 pt-6 sm:mx-auto sm:block sm:px-12 md:px-20">
        <Breadcrumb category={lab.category} title={lab.title} />
      </div>

      <LabHero
        labId={labId}
        title={lab.title}
        category={lab.category}
        description={lab.description}
        onStartExperiment={handleStartExperiment}
      />

      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-12 md:px-20">
        <section className="space-y-4">
          <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-200/40">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const selected = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition ${
                    selected
                      ? `${theme.accentBg} ${theme.accentText} ring-1 ring-inset ${theme.accentBorder}`
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {tabContent[activeTab]}
        </section>
      </main>
    </div>
  );
}
