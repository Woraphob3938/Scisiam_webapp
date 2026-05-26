"use client";

import React from "react";
import { ListOrdered, Sliders, Play, TrendingDown, ClipboardList, Target, ChevronRight } from "lucide-react";

export default function ExperimentSteps() {
  const steps = [
    {
      num: 1,
      title: "ตั้งค่าเริ่มต้น",
      desc: "กำหนดค่า T₀, Ts, k, ช่วงเวลา และความเร็วจำลอง",
      icon: Sliders,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "เริ่มจำลอง",
      desc: "กดปุ่ม 'เริ่ม' เพื่อให้การทดลองเริ่มทำงาน",
      icon: Play,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      num: 3,
      title: "สังเกตความเย็น",
      desc: "ติดตามอุณหภูมิแบบเรียลไทม์และกราฟพล็อต",
      icon: TrendingDown,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "บันทึกข้อมูล",
      desc: "บันทึกผลตามช่วงเวลาลงในตารางข้อมูล",
      icon: ClipboardList,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      num: 5,
      title: "วิเคราะห์และสรุป",
      desc: "ตีความหมายกราฟ หาค่า k และสรุปผลทดลอง",
      icon: Target,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7.5 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all duration-300 select-none">
      
      {/* Header */}
      <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight mb-6 border-b border-slate-50 pb-3 flex items-center gap-2">
        <ListOrdered className="w-5.5 h-5.5 text-indigo-500" />
        ขั้นตอนการปฏิบัติการทดลอง
      </h3>

      {/* 1. Desktop Layout (Horizontal Timeline) */}
      <div className="hidden lg:flex items-start justify-between relative gap-1 py-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.num}>
              {/* Step circle card */}
              <div className="flex-1 flex flex-col items-center text-center group">
                <div className="relative mb-3">
                  <div className="absolute -top-1.5 -right-1.5 z-10 w-5.5 h-5.5 bg-purple-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {step.num}
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${step.bg} ${step.color} flex items-center justify-center shadow-xs border border-white transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h4 className="text-[11px] font-bold text-slate-700 mb-0.5">{step.title}</h4>
                <p className="text-[10px] text-slate-400 font-semibold max-w-[130px] leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Arrow spacer */}
              {idx < steps.length - 1 && (
                <div className="flex items-center justify-center pt-4 text-slate-300">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 2. Mobile & Tablet Layout (Vertical Timeline) */}
      <div className="flex lg:hidden flex-col gap-5 relative pl-4 border-l border-slate-100">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="flex gap-3.5 relative text-left">
              {/* Timeline circle badge */}
              <div className="absolute -left-[24px] top-1.5 w-4.5 h-4.5 bg-purple-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-4 ring-slate-50 z-10">
                {step.num}
              </div>

              {/* Icon */}
              <div className={`w-9 h-9 rounded-lg ${step.bg} ${step.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-4.5 h-4.5" />
              </div>

              {/* Text metadata */}
              <div className="flex flex-col justify-center">
                <h4 className="text-xs font-bold text-slate-700">{step.title}</h4>
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold leading-relaxed mt-0.5">
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
