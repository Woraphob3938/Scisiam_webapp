"use client";

import React from "react";
import { BookOpen } from "lucide-react";

export default function TheoryCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7.5 shadow-md shadow-slate-100/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      {/* Card Header */}
      <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight mb-5 border-b border-slate-50 pb-3 flex items-center gap-2">
        <BookOpen className="w-5.5 h-5.5 text-indigo-500" />
        ทฤษฎีที่เกี่ยวข้อง
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Side: Formula & Variables */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            กฎการเย็นตัวของนิวตัน (Newton's law of cooling) กล่าวว่า อัตราการเปลี่ยนแปลงของอุณหภูมิของวัตถุจะแปรผันตรงกับความแตกต่างของอุณหภูมิระหว่างตัววัตถุกับสภาพแวดล้อมโดยรอบ
          </p>

          {/* Mathematical Formula Box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                สมการความสัมพันธ์
              </span>
              <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                <div className="flex flex-col items-center leading-none text-base sm:text-lg">
                  <span>dT</span>
                  <span className="border-t border-slate-800 w-full my-0.5" />
                  <span>dt</span>
                </div>
                <span>= -k(T - T<sub>s</sub>)</span>
              </div>
            </div>

            {/* Variable Descriptions */}
            <div className="text-[11px] sm:text-xs text-slate-500 font-semibold space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-indigo-600">T</span>
                <span>= อุณหภูมิของวัตถุ (°C)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-600">T<sub>s</sub></span>
                <span>= อุณหภูมิสิ่งแวดล้อม (°C)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-rose-600">k</span>
                <span>= ค่าคงที่การเย็นตัว (s<sup>-1</sup>)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: High-Fidelity Mini Graph Vector Drawing */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 self-start lg:self-center">
            กราฟตัวอย่างการลดอุณหภูมิ
          </span>

          <div className="w-full bg-slate-50/50 rounded-2xl border border-slate-100/50 p-3 select-none flex items-center justify-center">
            <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Grid lines (horizontal) */}
              <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />

              {/* Y-Axis Labels (Temperature) */}
              <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">100</text>
              <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">75</text>
              <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">50</text>
              <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">25</text>

              {/* Ambient limit line Ts (Dashed) */}
              <line x1="20" y1="95" x2="180" y2="95" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="185" y="97" fill="#10b981" fontSize="8" fontWeight="bold">Ts</text>

              {/* Decay Curve (Newton's cooling law) */}
              {/* Curve starts at Y=20 (100C) and decays exponentially to Y=95 (25C) */}
              <path d="M20,20 C50,60 90,90 180,95" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* X-Axis (Time) */}
              <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
              
              {/* X-Axis Labels (Time min) */}
              <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
              <text x="60" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">10</text>
              <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">20</text>
              <text x="140" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">30</text>
              <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">40</text>
              
              <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">เวลา (นาที)</text>
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
