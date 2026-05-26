"use client";

import React from "react";
import { Info, HelpCircle } from "lucide-react";

export default function FormulaCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full select-none">
      
      {/* Header */}
      <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight mb-4 border-b border-slate-50 pb-2.5 flex items-center gap-2">
        <Info className="w-5.5 h-5.5 text-indigo-500" />
        สมการของกฎการเย็นตัวของนิวตัน
      </h3>

      <div className="space-y-4 text-left">
        
        {/* Large Equation box */}
        <div className="bg-gradient-to-tr from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100/50 p-5 flex items-center justify-center">
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-800 inline-flex items-center gap-2">
            <div className="flex flex-col items-center leading-none text-lg sm:text-xl">
              <span>dT</span>
              <span className="border-t-2 border-slate-800 w-full my-0.5" />
              <span>dt</span>
            </div>
            <span>= -k(T - T<sub>s</sub>)</span>
          </div>
        </div>

        {/* Variables definitions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs sm:text-sm border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl">
            <span className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 font-extrabold flex items-center justify-center shrink-0">T</span>
            <span className="text-slate-500 font-bold">อุณหภูมิวัตถุ (°C)</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl">
            <span className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 text-blue-500 font-extrabold flex items-center justify-center shrink-0">T<sub>s</sub></span>
            <span className="text-slate-500 font-bold">อุณหภูมิสิ่งแวดล้อม (°C)</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl">
            <span className="w-6 h-6 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 font-extrabold flex items-center justify-center shrink-0">k</span>
            <span className="text-slate-500 font-bold">ค่าคงที่การเย็นตัว (/นาที)</span>
          </div>
        </div>

        {/* Descriptive Helper note */}
        <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-3.5 flex items-start gap-2.5">
          <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-slate-400 font-semibold leading-relaxed">
            อัตราการเปลี่ยนแปลงอุณหภูมิของวัตถุจะแปรผันตรงกับผลต่างระหว่างอุณหภูมิของตัววัตถุ ($T$) และอุณหภูมิสภาพแวดล้อม ($T_s$) ในการทดลองนี้ค่าอัตราดังกล่าวจะติดลบเสมอเนื่องจากระบบคายความร้อนออก
          </p>
        </div>

      </div>

    </div>
  );
}
