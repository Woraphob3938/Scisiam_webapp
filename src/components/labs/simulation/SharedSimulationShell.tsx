"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  CheckCircle2,
  ChevronRight,
  Home,
  LucideIcon,
  Save,
  Sparkles,
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
  onSave: () => void;
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
  onSave,
}: SharedSimulationShellProps) {
  const tone = accentClasses[accent];

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8fafc] pb-12">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-12 md:px-20">
        <div className="flex flex-col gap-5">
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <section className="space-y-5 lg:col-span-9">
              <div className={`relative flex min-h-[164px] items-center overflow-hidden rounded-2xl border ${tone.border} bg-white px-5 py-6 shadow-sm shadow-slate-200/50 sm:px-7`}>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${tone.icon}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${tone.soft}`}>{category}</span>
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">{statusLabel}</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-normal text-slate-900">{title} Simulator</h1>
                  <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
                    {subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-7">
                  <div className={`min-h-[460px] rounded-2xl border ${tone.border} bg-white p-4 shadow-sm shadow-slate-200/50`}>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-sm font-black text-slate-800">
                        <Icon className={`h-4.5 w-4.5 ${tone.text}`} />
                        {sceneTitle}
                      </h2>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">{statusLabel}</span>
                    </div>
                    {scene}
                  </div>
                </div>

                <div className="xl:col-span-5">
                  <section className="flex min-h-[460px] flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/50">
                    <h2 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
                      <Target className={`h-4.5 w-4.5 ${tone.text}`} />
                      {controlsTitle}
                    </h2>
                    <div className="flex-1">
                      {controls}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                      {metrics.map((metric) => (
                        <span key={metric.label} className={`rounded-lg px-2 py-1.5 ${metricToneClasses[metric.tone ?? accent]}`}>
                          {metric.label}: <b>{metric.value}</b>
                        </span>
                      ))}
                    </div>

                    <button onClick={onSave} className={`mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${tone.button}`}>
                      <Save className="h-4 w-4" />
                      บันทึกผลการทดลอง
                    </button>
                  </section>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-4">{graph}</div>
                <div className="xl:col-span-4">{table}</div>
                <div className="xl:col-span-4">{theory}</div>
              </div>

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
            </section>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-3">
              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <Target className="h-4.5 w-4.5 text-blue-600" />
                  เป้าหมายการเรียนรู้
                </h2>
                <ul className="space-y-2.5 text-xs font-semibold leading-relaxed text-slate-500">
                  {learningGoals.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  ความคืบหน้า
                </h2>
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full text-sm font-black text-slate-800" style={{ background: `conic-gradient(${tone.ring} ${Math.min(100, Math.max(0, progressPercent))}%, #e2e8f0 0)` }}>
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-white">{progressPercent.toFixed(0)}%</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500">{progressLabel}</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{progressValue}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                  คะแนนเมื่อสำเร็จ
                </h2>
                <p className="text-2xl font-black text-emerald-600">{scoreLabel}</p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-400">บันทึกผลพร้อมกราฟและตารางข้อมูลครบถ้วน</p>
              </section>

              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  คำแนะนำในการทดลอง
                </h2>
                <ul className="space-y-2 text-xs font-semibold leading-relaxed text-slate-500">
                  {tips.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
