"use client";

import React from "react";
import { Thermometer, Beaker, Timer, Coffee, Box } from "lucide-react";

export default function EquipmentList() {
  const equipments = [
    { name: "เทอร์โมมิเตอร์", icon: Thermometer, color: "text-rose-500", bg: "bg-rose-50/50" },
    { name: "บีกเกอร์", icon: Beaker, color: "text-blue-500", bg: "bg-blue-50/50" },
    { name: "นาฬิกาจับเวลา", icon: Timer, color: "text-amber-500", bg: "bg-amber-50/50" },
    { name: "น้ำร้อน", icon: Coffee, color: "text-orange-500", bg: "bg-orange-50/50" }, // Coffee acts as hot liquid / steam mug
    { name: "น้ำแข็ง", icon: Box, color: "text-cyan-500", bg: "bg-cyan-50/50" }, // Box/cube represents ice
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/40 p-6 sm:p-7.5 shadow-xl shadow-slate-100/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-5 border-b border-slate-50 pb-3 flex items-center gap-2">
        <Beaker className="w-5.5 h-5.5 text-indigo-500" />
        อุปกรณ์ในห้องแล็บ
      </h2>

      {/* Equipment Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {equipments.map((eq, idx) => {
          const Icon = eq.icon;
          return (
            <div
              key={idx}
              aria-label={`อุปกรณ์: ${eq.name}`}
              className={`
                flex flex-col sm:flex-row items-center gap-2 px-3.5 py-3 rounded-2xl border border-slate-200/50 ${eq.bg}
                transition-all duration-300 transform hover:scale-[1.03] hover:shadow-sm cursor-default select-none
              `}
            >
              <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-xs shrink-0 ${eq.color}`} aria-hidden="true">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-700 text-center sm:text-left truncate">
                {eq.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
