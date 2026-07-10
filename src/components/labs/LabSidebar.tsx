"use client";

import React from "react";
import {
  Award,
  BookOpen,
  CheckSquare,
  ClipboardList,
  Info,
  LineChart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { LabData } from "@/components/LabCard";
import type { LabDetailData } from "@/data/labDetails";

interface LabSidebarProps {
  lab: LabData;
  details: LabDetailData;
  readiness: {
    isReady: boolean;
    label: string;
    description: string;
  };
  hasSavedResult?: boolean;
}

type InfoRow = {
  label: string;
  value: string;
  helper: string;
  icon: typeof BookOpen;
  iconClass: string;
};

function buildAdviceList(details: LabDetailData) {
  const primaryEquipment = details?.equipments[0];
  const firstStep = details?.steps[0];
  const finalStep = details?.steps.at(-1);

  if (!details || !primaryEquipment || !firstStep || !finalStep) {
    return [
      "อ่านวัตถุประสงค์และทฤษฎีของแล็บนี้ก่อนเริ่มทดลอง",
      "ปรับตัวแปรทีละค่าเพื่อให้เห็นผลลัพธ์ที่ชัดเจน",
      "บันทึกผลหลังทดลองเพื่อเก็บความคืบหน้าของห้องแล็บนี้",
    ];
  }

  return [
    `ตรวจ ${primaryEquipment.name} ให้พร้อม: ${primaryEquipment.note}`,
    `เริ่มจาก "${firstStep.title}" แล้วทำตามลำดับขั้นตอนของแล็บนี้`,
    `เมื่อถึง "${finalStep.title}" ให้บันทึกผลและเทียบกับทฤษฎีที่แสดงไว้`,
  ];
}

export default function LabSidebar({
  lab,
  details,
  readiness,
  hasSavedResult = false,
}: LabSidebarProps) {
  const labProgress = hasSavedResult ? 100 : 0;
  const labProgressLabel = hasSavedResult
    ? "บันทึกผลทดลองล่าสุดแล้ว"
    : "ยังไม่ได้บันทึกผลทดลอง";
  const missionProgressLabel = hasSavedResult ? "สำเร็จแล้ว" : "รอการบันทึก";
  const stepCount = details?.steps.length ?? 0;
  const firstStep = details?.steps[0];
  const finalStep = details?.steps.at(-1);
  const primaryEquation = details?.equationLabels[0];
  const adviceList = buildAdviceList(details);

  const labInfoRows: InfoRow[] = [
    {
      label: "ทฤษฎีหลัก",
      value: primaryEquation?.label ?? details?.graph.title ?? "แนวคิดสำคัญ",
      helper: primaryEquation?.desc ?? "อ่านสมการและคำอธิบายก่อนเริ่มปรับตัวแปร",
      icon: BookOpen,
      iconClass: "text-blue-500",
    },
    {
      label: "ลำดับงาน",
      value: `${stepCount} ขั้นตอน`,
      helper: firstStep && finalStep ? `${firstStep.title} → ${finalStep.title}` : "ทำตามขั้นตอนจากบนลงล่าง",
      icon: ClipboardList,
      iconClass: "text-emerald-500",
    },
    {
      label: "ผลที่ต้องดู",
      value: details?.graph.yTitle ?? "ผลการทดลอง",
      helper: details?.graph.title ?? "เทียบผลที่บันทึกกับกราฟหรือสมการ",
      icon: LineChart,
      iconClass: "text-violet-500",
    },
  ];

  return (
    <aside className="flex w-full select-none flex-col gap-4 self-start lg:sticky lg:top-24">
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5">
        <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base">
              <Info className="h-4.5 w-4.5 text-blue-500" />
              โฟกัสก่อนทดลอง
            </h3>
            <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-relaxed text-slate-500">
              {lab.title}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              readiness.isReady
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-amber-100 bg-amber-50 text-amber-700"
            }`}
          >
            {readiness.label}
          </span>
        </div>

        <div className="space-y-3">
          {labInfoRows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-left">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${row.iconClass}`} />
                  <span className="text-[11px] font-bold text-slate-500">{row.label}</span>
                </div>
                <p className="mt-1 break-words text-sm font-extrabold leading-snug text-slate-900">
                  {row.value}
                </p>
                <p className="mt-1 break-words text-[11px] font-semibold leading-relaxed text-slate-500">
                  {row.helper}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/70 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base">
            <CheckSquare className="h-4.5 w-4.5 text-emerald-500" />
            ความคืบหน้า
          </h3>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-600">
            {labProgress}%
          </span>
        </div>

        <div className="space-y-2">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={labProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="ความคืบหน้าการทำแล็บ"
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${labProgress}%` }}
            />
          </div>
          <p className="text-left text-[11px] font-semibold leading-relaxed text-slate-500">
            {labProgressLabel}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/70 bg-white p-5">
        <h3 className="mb-3.5 flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base">
          <ShieldCheck className="h-4.5 w-4.5 text-amber-500" />
          คำแนะนำก่อนเริ่ม
        </h3>
        <ul className="space-y-2.5 text-left">
          {adviceList.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
              <p className="text-[11px] font-semibold leading-[1.6] text-slate-600 sm:text-xs">
                {bullet}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200/70 bg-white p-5">
        <div className="mb-3 flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Award className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-800 sm:text-sm">ภารกิจนักวิทย์</h3>
            <p className="truncate text-[10px] font-semibold text-slate-500">ทำแล็บนี้ให้ครบและบันทึกผล</p>
          </div>
        </div>

        <div className="space-y-2">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={labProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="ความคืบหน้าภารกิจแล็บนี้"
          >
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-500"
              style={{ width: `${labProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1 text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              สถานะ
            </span>
            <span className="rounded-md bg-violet-50 px-2 py-0.5 text-violet-600">
              {missionProgressLabel}
            </span>
          </div>
        </div>
      </section>
    </aside>
  );
}
