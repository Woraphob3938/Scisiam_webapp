"use client";

import React from "react";
import { LineChart, Search, Download, HelpCircle } from "lucide-react";

export interface DataPoint {
  time: number;  // in minutes
  temp: number;  // in °C
  ambient: number; // in °C
}

interface LiveGraphProps {
  dataPoints: DataPoint[];
}

export default function LiveGraph({ dataPoints }: LiveGraphProps) {
  // SVG Viewbox dimensions: 320 width x 160 height
  // Margin bounds: X-padding: 30 to 290. Y-padding: 20 to 130.
  // Math scales: time range 0 to 60. Temp range 0 to 100.
  const timeToSvgX = (t: number) => 30 + (t / 60) * 260;
  const tempToSvgY = (temp: number) => 135 - (temp / 100) * 110;

  // Build the SVG path for the Object Temperature curve
  const getTempPath = () => {
    if (dataPoints.length === 0) return "";
    return dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${timeToSvgX(p.time)},${tempToSvgY(p.temp)}`)
      .join(" ");
  };

  // Build the SVG path for the Ambient Temperature baseline
  const getAmbientPath = () => {
    if (dataPoints.length === 0) return "";
    return dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${timeToSvgX(p.time)},${tempToSvgY(p.ambient)}`)
      .join(" ");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <LineChart className="w-5.5 h-5.5 text-indigo-500" />
          กราฟอุณหภูมิกับเวลา
        </h3>
        
        {/* Helper Action Buttons */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => alert("ซูมข้อมูลกราฟ (Mock Zoom)")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
            aria-label="ซูม"
          >
            <Search className="w-4 h-4" />
          </button>
          <button 
            onClick={() => alert("ดาวน์โหลดรูปภาพกราฟ (Mock Download)")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
            aria-label="ดาวน์โหลด"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex-1 flex flex-col items-center justify-center relative min-h-[220px]">
        {dataPoints.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-1.5 py-8">
            <HelpCircle className="w-8 h-8 text-slate-300 animate-pulse" />
            <p className="text-xs font-semibold">กดปุ่ม "เริ่ม" เพื่อพล็อตกราฟเรียลไทม์</p>
          </div>
        ) : (
          <svg className="w-full h-full min-h-[176px]" viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Grid subdivisions lines (horizontal) */}
            <line x1="30" y1="135" x2="290" y2="135" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="30" y1="108" x2="290" y2="108" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="30" y1="80" x2="290" y2="80" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="30" y1="53" x2="290" y2="53" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="30" y1="25" x2="290" y2="25" stroke="#f1f5f9" strokeWidth="1" />

            {/* Grid subdivisions lines (vertical) */}
            <line x1="30" y1="25" x2="30" y2="135" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="95" y1="25" x2="95" y2="135" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="160" y1="25" x2="160" y2="135" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="225" y1="25" x2="225" y2="135" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="290" y1="25" x2="290" y2="135" stroke="#cbd5e1" strokeWidth="1" />

            {/* Y-Axis Label metrics (Temperature) */}
            <text x="25" y="28" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">100</text>
            <text x="25" y="56" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">75</text>
            <text x="25" y="83" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">50</text>
            <text x="25" y="111" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">25</text>
            <text x="25" y="138" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">0</text>

            <text x="12" y="15" fill="#94a3b8" fontSize="6.5" fontWeight="extrabold">อุณหภูมิ (°C)</text>

            {/* X-Axis Label metrics (Time mins) */}
            <text x="30" y="148" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
            <text x="95" y="148" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">15</text>
            <text x="160" y="148" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">30</text>
            <text x="225" y="148" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">45</text>
            <text x="290" y="148" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">60</text>

            <text x="302" y="148" fill="#94a3b8" fontSize="6.5" fontWeight="extrabold" textAnchor="start">เวลา (นาที)</text>

            {/* Baseline Ambient Temp (Ts) (Dashed green line) */}
            <path d={getAmbientPath()} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" fill="none" className="transition-all duration-300" />

            {/* Decay Temperature Curve (T) (Solid blue line) */}
            <path d={getTempPath()} stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none" className="transition-all duration-300" />

            {/* SVG Data points circles overlay */}
            {dataPoints.map((p, idx) => (
              <g key={idx} className="transition-all duration-300">
                <circle
                  cx={timeToSvgX(p.time)}
                  cy={tempToSvgY(p.temp)}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />
              </g>
            ))}
          </svg>
        )}
      </div>

      {/* Legend layout */}
      {dataPoints.length > 0 && (
        <div className="flex items-center justify-center gap-6 mt-4 text-[10px] sm:text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-blue-500 rounded-full" />
            <span className="text-slate-600">อุณหภูมิของวัตถุ (T)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 border-t-2 border-dashed border-emerald-500" />
            <span className="text-slate-600">อุณหภูมิสิ่งแวดล้อม (Ts)</span>
          </div>
        </div>
      )}

    </div>
  );
}
