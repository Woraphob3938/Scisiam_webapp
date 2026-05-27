"use client";

import React from "react";
import { ListOrdered, Thermometer, Timer, ClipboardList, LineChart, ChevronRight, ChevronDown } from "lucide-react";

export default function ExperimentSteps() {
  const steps = [
    {
      num: 1,
      title: "เตรียมสารละลายร้อน",
      desc: "เตรียมน้ำร้อนในบีกเกอร์ และวัดอุณหภูมิเริ่มต้น (T₀)",
      icon: Thermometer,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "วางในสิ่งแวดล้อมควบคุม",
      desc: "วางบีกเกอร์ในสภาพแวดล้อมที่อุณหภูมิคงที่ และเริ่มจับเวลา",
      icon: Timer,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      num: 3,
      title: "บันทึกอุณหภูมิสม่ำเสมอ",
      desc: "บันทึกค่าอุณหภูมิทุกช่วงเวลาอย่างสม่ำเสมอ",
      icon: ClipboardList,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "วิเคราะห์สมการนิวตัน",
      desc: "สร้างกราฟและวิเคราะห์ข้อมูลเปรียบเทียบกับสมการ",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/40 p-6 sm:p-7.5 shadow-xl shadow-slate-100/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-6 border-b border-slate-50 pb-3 flex items-center gap-2">
        <ListOrdered className="w-5.5 h-5.5 text-indigo-500" />
        ขั้นตอนการทดลอง
      </h2>

      {/* 1. Desktop Layout (Horizontal Timeline) */}
      <div className="hidden md:flex items-start justify-between relative gap-2 py-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.num}>
              {/* Step Card */}
              <div className="flex-1 flex flex-col items-center text-center group" aria-label={`ขั้นตอนที่ ${step.num}: ${step.title}`}>
                {/* Step Circle with Icon */}
                <div className="relative mb-3.5">
                  <div className="absolute -top-1.5 -right-1.5 z-10 w-6 h-6 bg-indigo-600 text-white font-extrabold text-xs rounded-full flex items-center justify-center border-2 border-white shadow-xs" aria-hidden="true">
                    {step.num}
                  </div>
                  <div className={`w-14 h-14 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center shadow-xs border border-white transition-transform duration-300 group-hover:scale-110`} aria-hidden="true">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Step Description */}
                <h3 className="text-xs font-bold text-slate-700 mb-1 max-w-[120px]">{step.title}</h3>
                <p className="text-[11px] text-slate-400 font-semibold max-w-[150px] leading-relaxed">
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
        {steps.map((step, idx) => {
          const Icon = step.icon;
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
                <p className="text-[11px] sm:text-xs text-slate-400 font-semibold leading-relaxed mt-0.5">
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
