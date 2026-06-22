"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  Home,
  Info,
  ListChecks,
  LucideIcon,
  Maximize2,
  Minimize2,
  Save,
  Target,
} from "lucide-react";

export interface SimulationMetric {
  label: string;
  value: string;
  tone?: "blue" | "cyan" | "emerald" | "orange" | "rose" | "violet";
}

export interface SimulationStep {
  label: string;
  icon: LucideIcon;
}

interface SharedSimulationShellProps {
  accent: "blue" | "cyan" | "emerald" | "orange" | "rose" | "violet";
  labId: string;
  category: string;
  title: string;
  subtitle: string;
  statusLabel: string;
  icon: LucideIcon;
  sceneTitle: string;
  scene: React.ReactNode;
  controlsTitle: string;
  controls: React.ReactNode;
  metrics: SimulationMetric[];
  graph: React.ReactNode;
  table: React.ReactNode;
  theory: React.ReactNode;
  steps: SimulationStep[];
  learningGoals: string[];
  progressLabel: string;
  progressValue: string;
  progressPercent: number;
  tips: string[];
  scoreLabel?: string;
  showLiveMetrics?: boolean;
  showInfoTabs?: boolean;
  showSaveButton?: boolean;
  onSave?: () => void;
}

const accentClasses = {
  blue: {
    icon: "bg-blue-600 text-white",
    border: "border-blue-100",
    soft: "bg-blue-50 text-blue-700 border-blue-100",
    text: "text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700",
    ring: "#2563eb",
  },
  cyan: {
    icon: "bg-cyan-600 text-white",
    border: "border-cyan-100",
    soft: "bg-cyan-50 text-cyan-700 border-cyan-100",
    text: "text-cyan-600",
    button: "bg-cyan-600 hover:bg-cyan-700",
    ring: "#0891b2",
  },
  emerald: {
    icon: "bg-emerald-600 text-white",
    border: "border-emerald-100",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-100",
    text: "text-emerald-600",
    button: "bg-emerald-600 hover:bg-emerald-700",
    ring: "#10b981",
  },
  orange: {
    icon: "bg-orange-500 text-white",
    border: "border-orange-100",
    soft: "bg-orange-50 text-orange-700 border-orange-100",
    text: "text-orange-600",
    button: "bg-orange-500 hover:bg-orange-600",
    ring: "#f97316",
  },
  rose: {
    icon: "bg-rose-600 text-white",
    border: "border-rose-100",
    soft: "bg-rose-50 text-rose-700 border-rose-100",
    text: "text-rose-600",
    button: "bg-rose-600 hover:bg-rose-700",
    ring: "#e11d48",
  },
  violet: {
    icon: "bg-violet-600 text-white",
    border: "border-violet-100",
    soft: "bg-violet-50 text-violet-700 border-violet-100",
    text: "text-violet-600",
    button: "bg-violet-600 hover:bg-violet-700",
    ring: "#7c3aed",
  },
};

const metricToneClasses: Record<NonNullable<SimulationMetric["tone"]>, string> = {
  blue: "bg-blue-50 text-blue-700",
  cyan: "bg-cyan-50 text-cyan-700",
  emerald: "bg-emerald-50 text-emerald-700",
  orange: "bg-orange-50 text-orange-700",
  rose: "bg-rose-50 text-rose-700",
  violet: "bg-violet-50 text-violet-700",
};

type InfoTab = "about" | "goals" | "results" | "theory" | "steps" | "tips";

export default function SharedSimulationShell({
  accent,
  labId,
  category,
  title,
  subtitle,
  statusLabel,
  icon: Icon,
  sceneTitle,
  scene,
  controlsTitle,
  controls,
  metrics,
  graph,
  table,
  theory,
  steps,
  learningGoals,
  progressLabel,
  progressValue,
  progressPercent,
  tips,
  scoreLabel = "+25 คะแนน",
  showLiveMetrics = true,
  showInfoTabs = true,
  showSaveButton = true,
  onSave,
}: SharedSimulationShellProps) {
  const tone = accentClasses[accent];
  const stageShellRef = useRef<HTMLElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<InfoTab>("about");
  const boundedProgress = Math.min(100, Math.max(0, progressPercent));
  const hasDrawerSummary = showLiveMetrics || (showSaveButton && onSave);

  useEffect(() => {
    const syncFullscreen = () => setIsExpanded(document.fullscreenElement === stageShellRef.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsExpanded(false);
      return;
    }

    const stage = stageShellRef.current;
    if (stage?.requestFullscreen) {
      await stage.requestFullscreen();
      setIsExpanded(true);
      return;
    }

    setIsExpanded((value) => !value);
  };

  const tabs: Array<{ key: InfoTab; label: string; icon: LucideIcon }> = [
    { key: "about", label: "ภาพรวม", icon: Info },
    { key: "goals", label: "เป้าหมาย", icon: Target },
    { key: "results", label: "ผลการทดลอง", icon: BarChart3 },
    { key: "theory", label: "ทฤษฎี", icon: BookOpen },
    { key: "steps", label: "ขั้นตอน", icon: ListChecks },
    { key: "tips", label: "คำแนะนำ", icon: CheckCircle2 },
  ];

  const liveMetricsCard = (
    <section className="w-full max-w-[360px] rounded-2xl border border-white/70 bg-white/92 p-3 shadow-lg shadow-slate-900/10 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xs font-black text-slate-900">
          <BarChart3 className={`h-4 w-4 ${tone.text}`} />
          ค่าทดลอง Real-time
        </h2>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">{scoreLabel}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {metrics.slice(0, 4).map((metric) => (
          <div key={metric.label} className={`rounded-xl px-2.5 py-2 text-[11px] font-black ${metricToneClasses[metric.tone ?? accent]}`}>
            <p className="truncate text-[10px] opacity-75">{metric.label}</p>
            <p className="truncate text-sm">{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-2">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[11px] font-black text-slate-900"
          style={{ background: `conic-gradient(${tone.ring} ${boundedProgress}%, #e2e8f0 0)` }}
        >
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white">{boundedProgress.toFixed(0)}%</div>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold text-slate-500">{progressLabel}</p>
          <p className="truncate text-sm font-black text-slate-900">{progressValue}</p>
        </div>
      </div>
    </section>
  );

  const controlsDrawer = (
    <section className={`rounded-2xl border border-white/70 bg-white/95 shadow-xl shadow-slate-900/10 backdrop-blur-md ${controlsOpen ? "max-h-[32vh] overflow-y-auto" : ""}`}>
      <button
        type="button"
        onClick={() => setControlsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={controlsOpen}
      >
        <span className="flex items-center gap-2 text-sm font-black text-slate-900">
          <Target className={`h-4.5 w-4.5 ${tone.text}`} />
          {controlsTitle}
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black ${tone.soft}`}>
          {controlsOpen ? "ย่อแผง" : "เปิดแผง"}
          {controlsOpen ? <ChevronsDown className="h-3.5 w-3.5" /> : <ChevronsUp className="h-3.5 w-3.5" />}
        </span>
      </button>

      {controlsOpen && (
        <div className={`grid gap-4 border-t border-slate-100 p-4 ${hasDrawerSummary ? "lg:grid-cols-[minmax(0,1fr)_320px]" : ""}`}>
          <div>{controls}</div>
          {hasDrawerSummary && (
            <div className="flex flex-col gap-3">
              {showLiveMetrics && (
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                  {metrics.map((metric) => (
                    <span key={metric.label} className={`rounded-xl px-3 py-2 ${metricToneClasses[metric.tone ?? accent]}`}>
                      {metric.label}: <b>{metric.value}</b>
                    </span>
                  ))}
                </div>
              )}
              {showSaveButton && onSave && (
                <button
                  onClick={onSave}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${tone.button}`}
                >
                  <Save className="h-4 w-4" />
                  บันทึกผลการทดลอง
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );

  const simulationStage = (
    <section
      ref={stageShellRef}
      className={`relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-900 shadow-2xl shadow-slate-300/60 ${
        isExpanded
          ? "h-screen min-h-screen rounded-none border-0 shadow-none"
          : "h-[72vh] min-h-[620px] max-h-[840px]"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.14),transparent_28%)]" />
      <div className="absolute inset-1.5 rounded-[20px] bg-slate-100" />

      <div className="absolute left-5 right-5 top-5 z-20 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-[calc(100%-64px)] rounded-2xl border border-white/70 bg-white/92 px-4 py-3 shadow-lg shadow-slate-900/10 backdrop-blur-md sm:max-w-none">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Link href={`/labs/${labId}`} className="inline-flex items-center gap-1 text-[11px] font-black text-slate-500 hover:text-slate-900">
              <ArrowLeft className="h-3.5 w-3.5" />
              รายละเอียดแล็บ
            </Link>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${tone.soft}`}>{category}</span>
            <span className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 sm:inline-flex">{statusLabel}</span>
          </div>
          <h1 className="max-w-[720px] text-lg font-black leading-relaxed text-slate-950 sm:text-2xl">{title}</h1>
        </div>

        <div className="flex items-start gap-3">
          {showLiveMetrics && <div className="hidden sm:block">{liveMetricsCard}</div>}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/70 bg-white/92 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md transition hover:text-slate-950"
            aria-label={isExpanded ? "ออกจากโหมดเต็มจอ" : "ขยายห้องทดลอง"}
          >
            {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {showLiveMetrics && <div className="absolute right-5 top-[148px] z-20 sm:hidden">
        <div className="inline-flex max-w-[180px] items-center gap-2 rounded-2xl border border-white/70 bg-white/92 px-3 py-2 text-[11px] font-black text-slate-900 shadow-lg shadow-slate-900/10 backdrop-blur-md">
          <BarChart3 className={`h-3.5 w-3.5 ${tone.text}`} />
          <span className="truncate">{metrics[0]?.label}: {metrics[0]?.value}</span>
        </div>
      </div>}

      <div className={`absolute inset-x-4 top-[122px] z-10 transition-all duration-300 sm:inset-x-5 ${controlsOpen ? "bottom-[calc(32vh+48px)]" : "bottom-[96px] sm:bottom-[104px]"}`}>
        <div className="h-full overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-inner shadow-slate-200/70">
          {scene}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-30 sm:bottom-5 sm:left-5 sm:right-5">{controlsDrawer}</div>
    </section>
  );

  const activeTabContent = {
    about: (
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
        <h2 className="mb-2 flex items-center gap-2 text-base font-black text-slate-900">
          <Icon className={`h-5 w-5 ${tone.text}`} />
          {sceneTitle}
        </h2>
        <p className="max-w-4xl text-sm font-semibold leading-relaxed text-slate-500">{subtitle}</p>
      </section>
    ),
    goals: (
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
        <h2 className="mb-3 flex items-center gap-2 text-base font-black text-slate-900">
          <Target className={`h-5 w-5 ${tone.text}`} />
          เป้าหมายการเรียนรู้
        </h2>
        <ul className="grid gap-2 text-sm font-semibold leading-relaxed text-slate-500 md:grid-cols-2">
          {learningGoals.map((item) => (
            <li key={item} className="flex gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone.icon}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    ),
    results: (
      <div className="grid gap-5 xl:grid-cols-2">
        {graph}
        {table}
      </div>
    ),
    theory,
    steps: (
      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 sm:grid-cols-2 xl:grid-cols-5">
        {steps.map((step, index) => {
          const StepIcon = step.icon;

          return (
            <div key={step.label} className="flex items-center gap-3 rounded-xl bg-slate-50/70 px-3 py-2">
              <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.soft}`}>
                <StepIcon className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">{index + 1}</span>
              </div>
              <span className="text-xs font-black leading-relaxed text-slate-700">{step.label}</span>
            </div>
          );
        })}
      </section>
    ),
    tips: (
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
        <h2 className="mb-3 flex items-center gap-2 text-base font-black text-slate-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          คำแนะนำในการทดลอง
        </h2>
        <ul className="grid gap-2 text-sm font-semibold leading-relaxed text-slate-500 md:grid-cols-2">
          {tips.map((item) => (
            <li key={item} className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    ),
  } satisfies Record<InfoTab, React.ReactNode>;

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8fafc] pb-12">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-12 md:px-20">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
            <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-600">
              <Home className="h-3.5 w-3.5" />
              หน้าแรก
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <Link href={`/?category=${category}`} className={`${tone.text} hover:opacity-80`}>{category}</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <Link href={`/labs/${labId}`} className="text-slate-700 hover:text-slate-900">{title}</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-slate-800">Simulator</span>
          </div>

          {simulationStage}

          {showInfoTabs && <section className="space-y-4">
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
                      selected ? `${tone.icon} shadow-sm` : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTabContent[activeTab]}
          </section>}
        </div>
      </main>
    </div>
  );
}
