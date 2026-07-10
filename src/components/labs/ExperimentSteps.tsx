"use client";

import React from "react";
import {
  ListOrdered,
  Thermometer,
  Timer,
  ClipboardList,
  LineChart,
  ChevronRight,
  Zap,
  Sliders,
  Ruler,
  FlaskConical,
  Droplets,
  Gauge,
  Flame,
  Leaf,
  Sun,
  Wind,
  Dna,
  Microscope,
  Shuffle,
  Activity,
  BookOpen,
  Target,
  LucideIcon
} from "lucide-react";
import type { StepItemData } from "@/data/labDetails";

// Map string keys to Lucide icons dynamically
const iconMap: Record<string, LucideIcon> = {
  Thermometer,
  Timer,
  ClipboardList,
  LineChart,
  Zap,
  Sliders,
  Ruler,
  FlaskConical,
  Droplets,
  Gauge,
  Flame,
  Leaf,
  Sun,
  Wind,
  Dna,
  Microscope,
  Shuffle,
  Activity,
  BookOpen,
  Target,
  ListOrdered,
};

interface ExperimentStepsProps {
  steps: StepItemData[];
}

export default function ExperimentSteps({ steps }: ExperimentStepsProps) {

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6">
      <h2 className="text-base font-bold text-slate-900 mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
        <ListOrdered className="w-5 h-5 text-indigo-500" />
        ขั้นตอนการทดลอง
      </h2>

      {/* 1. Desktop Layout (Horizontal Timeline) */}
      <div className="hidden md:flex items-start justify-between relative gap-2 py-3">
        {steps.map((step, idx) => {
          const Icon = iconMap[step.iconKey] || ClipboardList;
          return (
            <React.Fragment key={step.num}>
              {/* Step Card */}
              <div className="flex-1 flex flex-col items-center text-center group" aria-label={`ขั้นตอนที่ ${step.num}: ${step.title}`}>
                {/* Step Circle with Icon */}
                <div className="relative mb-3.5">
                  <div className="absolute -top-1.5 -right-1.5 z-10 w-6 h-6 bg-indigo-600 text-white font-extrabold text-xs rounded-full flex items-center justify-center border-2 border-white shadow-xs" aria-hidden="true">
                    {step.num}
                  </div>
                  <div className={`w-12 h-12 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center border border-white`} aria-hidden="true">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Step Description */}
                <h3 className="text-xs font-bold text-slate-700 mb-1 max-w-[120px]">{step.title}</h3>
                <p className="text-[11px] text-slate-600 font-semibold max-w-[150px] leading-[1.55]">
                  {step.desc}
                </p>
              </div>

              {/* Connecting Chevron (skip after final item) */}
              {idx < steps.length - 1 && (
                <div className="flex items-center justify-center pt-5 text-slate-300" aria-hidden="true">
                  <ChevronRight className="w-5 h-5 animate-pulse" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 2. Mobile & Tablet Layout (Vertical Timeline) */}
      <div className="flex md:hidden flex-col gap-5 relative pl-4 border-l border-slate-100">
        {steps.map((step) => {
          const Icon = iconMap[step.iconKey] || ClipboardList;
          return (
            <div key={step.num} className="flex gap-4 relative group" aria-label={`ขั้นตอนที่ ${step.num}: ${step.title}`}>
              {/* Vertical Connector Line Indicator */}
              <div className="absolute -left-[25px] top-1.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-4 ring-slate-50 z-10" aria-hidden="true">
                {step.num}
              </div>

              {/* Small Icon Badge */}
              <div className={`w-10 h-10 rounded-xl ${step.bg} ${step.color} flex items-center justify-center shadow-xs shrink-0`} aria-hidden="true">
                <Icon className="w-5 h-5" />
              </div>

              {/* Text Info */}
              <div className="flex flex-col text-left justify-center">
                <h3 className="text-xs font-bold text-slate-700">{step.title}</h3>
                <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-[1.55] mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
