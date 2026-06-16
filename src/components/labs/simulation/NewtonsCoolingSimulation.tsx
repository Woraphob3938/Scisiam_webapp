"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Thermometer,
  Sliders,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  TrendingDown,
  ClipboardList,
  Target,
  Download,
  Copy,
  Trash2,
  LineChart,
  HelpCircle,
  Info,
  Snowflake,
  Wind,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

// --- TYPES ---
export interface CoolingDataPoint {
  time: number;     // in minutes
  temp: number;     // in °C
  ambient: number;  // in °C
}

// --- LOCAL VIEWPORT ---
interface ViewportProps {
  currentTemp: number;
  ambientTemp: number;
  coolingConstant: number;
  isHeaterOn: boolean;
}

function CoolingViewport({
  currentTemp,
  ambientTemp,
  coolingConstant,
  isHeaterOn,
}: ViewportProps) {
  // Dynamic Liquid Color
  const getLiquidColor = (temp: number) => {
    if (temp >= 75) {
      const ratio = (temp - 75) / 25;
      const r = Math.round(239 + ratio * 16);
      const g = Math.round(68 - ratio * 18);
      const b = Math.round(68 - ratio * 18);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (temp >= 40) {
      const ratio = (temp - 40) / 35;
      const r = Math.round(251 - ratio * 12);
      const g = Math.round(191 - ratio * 123);
      const b = Math.round(36 + ratio * 32);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const ratio = Math.max(0, (temp - ambientTemp) / (40 - ambientTemp));
      const r = Math.round(96 + ratio * 155);
      const g = Math.round(165 + ratio * 26);
      const b = Math.round(250 - ratio * 214);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const getMercuryHeight = (temp: number) => {
    const minTemp = 0;
    const maxTemp = 100;
    const minHeight = 8;
    const maxHeight = 78;
    const percentage = (temp - minTemp) / (maxTemp - minTemp);
    return minHeight + percentage * (maxHeight - minHeight);
  };

  const liquidColor = getLiquidColor(currentTemp);
  const mercuryHeight = getMercuryHeight(currentTemp);
  const environmentLabel =
    ambientTemp <= 8 ? "อ่างน้ำแข็ง" : ambientTemp <= 18 ? "ห้องเย็น" : ambientTemp >= 32 ? "ห้องอุ่น" : "ห้องทดลอง";
  const airflowLabel =
    coolingConstant >= 0.22 ? "ถ่ายเทเร็วมาก" : coolingConstant >= 0.16 ? "มีลมพัด" : "อากาศนิ่ง";

  return (
    <div className="bg-slate-50 border border-slate-200/50 rounded-2xl relative h-full min-h-0 overflow-hidden flex items-center justify-center">
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

      {/* Environmental Info Panel (Left Overlay) */}
      <div className="absolute top-3.5 left-3.5 bg-white/80 backdrop-blur-md p-3 rounded-xl border border-slate-200/50 text-left text-[10px] sm:text-xs text-slate-500 font-semibold space-y-1.5 shadow-xs z-10">
        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide block mb-1">
          สภาพแวดล้อม
        </span>
        <div className="flex items-center gap-1.5">
          <Snowflake className="w-3.5 h-3.5 text-blue-400" />
          <span>{environmentLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-slate-400" />
          <span>{airflowLabel}</span>
        </div>
      </div>

      {/* Ice / Ambient Cooler Display (Bottom Left Overlay) */}
      <div className="absolute bottom-3.5 left-3.5 bg-white/85 backdrop-blur-md p-2 rounded-xl border border-slate-200/50 flex items-center gap-2 shadow-xs z-10">
        <div className="text-right select-none">
          <span className="text-[8px] font-bold text-slate-400 block -mb-0.5">AMBIENT</span>
          <span className="text-xs sm:text-sm font-extrabold text-blue-600">{ambientTemp.toFixed(1)}°C</span>
        </div>
        <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12,2 L3,6 L12,10 L21,6 Z" fill="#bae6fd" />
          <path d="M3,6 L12,10 L12,20 L3,16 Z" fill="#93c5fd" opacity="0.8" />
          <path d="M12,10 L21,6 L21,16 L12,20 Z" fill="#60a5fa" opacity="0.9" />
        </svg>
      </div>

      {/* Active Science Visual SVGs */}
      <svg className="w-full h-full max-w-[300px] sm:max-w-[620px]" viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="coolingLiquid" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={liquidColor} stopOpacity="0.92" />
            <stop offset="58%" stopColor={liquidColor} stopOpacity="0.78" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.38" />
          </linearGradient>
          <linearGradient id="glassSurface" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.18" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id="steel" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <filter id="labShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.18" />
          </filter>
        </defs>

        <rect x="18" y="170" width="224" height="14" rx="7" fill="#dbeafe" opacity="0.55" />
        <ellipse cx="130" cy="183" rx="98" ry="15" fill="#94a3b8" opacity="0.16" />

        <g opacity="0.4">
          <path d="M36 70 C55 55 74 55 92 69" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
          <path d="M175 74 C191 59 207 61 222 75" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
        </g>

        {currentTemp > ambientTemp + 8 && (
          <g className="animate-pulse" opacity="0.72">
            <path d="M54 92 C37 88 35 74 48 66" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="4 5" />
            <path d="M204 102 C226 99 226 80 212 72" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="4 5" />
            <path d="M84 38 C74 27 83 16 96 22" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 5" />
          </g>
        )}

        <g filter="url(#labShadow)">
          <rect x="70" y="158" width="120" height="16" rx="4" fill="url(#steel)" />
          <rect x="82" y="152" width="96" height="7" rx="2" fill={isHeaterOn ? "#fb7185" : "#475569"} className="transition-all duration-300" />
          <rect x="97" y="163" width="8" height="2" rx="1" fill="#94a3b8" />
          <rect x="156" y="163" width="8" height="2" rx="1" fill="#94a3b8" />
        </g>

        {/* Heating plate / stand Base */}
        {isHeaterOn && (
          <g className="animate-pulse" filter="url(#labShadow)">
            <path d="M100,152 C96,143 104,135 110,142 C115,135 124,143 120,152 Z" fill="#f97316" />
            <path d="M123,152 C118,140 128,128 136,139 C143,130 153,141 148,152 Z" fill="#ef4444" />
            <path d="M132,152 C129,145 135,138 139,143 C143,139 149,145 146,152 Z" fill="#facc15" />
          </g>
        )}
        
        {/* Beaker Container */}
        <path d="M82,55 L82,144 C82,150 87,154 93,154 L166,154 C172,154 177,150 177,144 L177,55" fill="url(#glassSurface)" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        {/* Beaker scale marks */}
        <line x1="163" y1="78" x2="170" y2="78" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="156" y1="98" x2="170" y2="98" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="163" y1="118" x2="170" y2="118" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="156" y1="138" x2="170" y2="138" stroke="#94a3b8" strokeWidth="1.5" />
        
        {/* Beaker Top Flange */}
        <path d="M78,55 C78,55 88,52 96,52 C104,52 154,52 164,52 C172,52 181,55 181,55" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

        {/* Liquid */}
        <path d="M85,90 L85,143 C85,147 89,151 94,151 L165,151 C170,151 174,147 174,143 L174,90 Z" fill="url(#coolingLiquid)" className="transition-all duration-500" />
        <path d="M86,90 C104,86 152,86 173,90" stroke="#fecaca" strokeWidth="2" opacity="0.75" />
        {[99, 116, 139, 158].map((x, index) => (
          <circle key={x} cx={x} cy={122 + (index % 2) * 15} r="1.8" fill="#fee2e2" opacity="0.75" />
        ))}
        <path d="M97 98 C111 107 111 136 96 144" stroke="#ffffff" strokeWidth="2.2" opacity="0.28" strokeLinecap="round" />
        
        {/* Steam effects for hot temps */}
        {currentTemp > 50 && (
          <g className="animate-pulse">
            <path d="M106,42 Q111,31 106,20" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" opacity="0.62" />
            <path d="M130,40 Q137,27 130,16" stroke="#cbd5e1" strokeWidth="2.2" strokeLinecap="round" opacity="0.58" />
            <path d="M154,42 Q150,31 156,21" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" opacity="0.62" />
          </g>
        )}

        {/* Thermometer Stand Clamp holding the thermometer */}
        <line x1="187" y1="40" x2="187" y2="155" stroke="#64748b" strokeWidth="2.5" />
        <path d="M187,50 L144,50" stroke="#334155" strokeWidth="3.5" />
        <path d="M150 28 C184 24 199 31 207 49" stroke="#64748b" strokeWidth="2" strokeLinecap="round" fill="none" />
        <rect x="188" y="27" width="54" height="34" rx="8" fill="#0f172a" />
        <rect x="193" y="32" width="44" height="24" rx="5" fill="#dcfce7" />
        <text x="215" y="45" textAnchor="middle" fontSize="9" fontWeight="800" fill="#065f46">{currentTemp.toFixed(1)}°C</text>
        <text x="215" y="54" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="#047857">k {coolingConstant.toFixed(3)}</text>

        {/* Thermometer */}
        <g transform="translate(120, 22)">
          {/* Glass Tube */}
          <rect x="5" y="0" width="8" height="110" rx="4" fill="rgba(255, 255, 255, 0.85)" stroke="#64748b" strokeWidth="1.5" />
          {/* Bulb */}
          <circle cx="9" cy="115" r="9" fill="#ef4444" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="9" cy="115" r="7" fill="#ef4444" />
          {/* Dynamic mercury level */}
          <rect x="8" y={105 - mercuryHeight} width="2" height={mercuryHeight} fill="#ef4444" className="transition-all duration-500" />
        </g>
      </svg>
    </div>
  );
}

// --- LOCAL DARK GRAPH COMPONENT ---
interface GraphProps {
  dataPoints: CoolingDataPoint[];
}

function CoolingGraph({ dataPoints }: GraphProps) {
  const timeToSvgX = React.useCallback((t: number) => 30 + (t / 60) * 150, []);
  const tempToSvgY = React.useCallback((temp: number) => 100 - (temp / 100) * 85, []);

  // Build the SVG path for the Object Temperature curve
  const tempPath = React.useMemo(() => {
    if (dataPoints.length === 0) return "";
    return dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${timeToSvgX(p.time)},${tempToSvgY(p.temp)}`)
      .join(" ");
  }, [dataPoints, timeToSvgX, tempToSvgY]);

  // Build the SVG path for the Ambient Temperature baseline
  const ambientPath = React.useMemo(() => {
    if (dataPoints.length === 0) return "";
    return dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${timeToSvgX(p.time)},${tempToSvgY(p.ambient)}`)
      .join(" ");
  }, [dataPoints, timeToSvgX, tempToSvgY]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm shadow-slate-200/40 flex flex-col h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
          <LineChart className="w-4 h-4 text-blue-600" />
          กราฟอุณหภูมิกับเวลา
        </h3>
        <span className="text-[10px] font-bold text-blue-600">T - t Decay</span>
      </div>

      {/* Dark Graph Canvas */}
      <div className="flex-grow rounded-xl bg-slate-950 p-3 flex flex-col justify-between min-h-[174px]">
        {dataPoints.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-1 py-8">
            <HelpCircle className="w-8 h-8 text-slate-600 animate-pulse" />
            <p className="text-[10px] font-bold">กดปุ่มเริ่มเพื่อพล็อตกราฟเรียลไทม์</p>
          </div>
        ) : (
          <svg className="w-full h-full min-h-[140px]" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Grid subdivisions lines (horizontal) */}
            <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="30" y1="78.75" x2="180" y2="78.75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="30" y1="57.5" x2="180" y2="57.5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="30" y1="36.25" x2="180" y2="36.25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="30" y1="15" x2="180" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

            {/* Y-Axis Label metrics (Temperature) */}
            <text x="27" y="17.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">100</text>
            <text x="27" y="38.75" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">75</text>
            <text x="27" y="60" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">50</text>
            <text x="27" y="81.25" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">25</text>
            <text x="27" y="102" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0</text>

            <text x="32" y="10" fill="#64748b" fontSize="5.5" fontWeight="extrabold">Temp (°C)</text>

            {/* X-Axis Label metrics (Time mins) */}
            <text x="30" y="108" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
            <text x="67.5" y="108" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">15</text>
            <text x="105" y="108" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">30</text>
            <text x="142.5" y="108" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">45</text>
            <text x="180" y="108" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">60</text>

            <text x="190" y="108" fill="#94a3b8" fontSize="5.5" fontWeight="extrabold" textAnchor="start">t (min)</text>

            {/* Baseline Ambient Temp (Ts) (Dashed green line) */}
            {ambientPath && (
              <path d={ambientPath} stroke="#10b981" strokeWidth="1" strokeDasharray="2 1.5" fill="none" opacity="0.8" />
            )}

            {/* Decay Temperature Curve (T) (Solid blue line) */}
            {tempPath && (
              <path d={tempPath} stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            )}

            {/* SVG Data points circles overlay */}
            {dataPoints.map((p, idx) => (
              <circle
                key={idx}
                cx={timeToSvgX(p.time)}
                cy={tempToSvgY(p.temp)}
                r="2"
                fill="#ffffff"
                stroke="#3b82f6"
                strokeWidth="1.2"
              />
            ))}
          </svg>
        )}
      </div>

      {/* Legend layout */}
      {dataPoints.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-2 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
            <span>อุณหภูมิวัตถุ (T)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t border-dashed border-emerald-500" />
            <span>อุณหภูมิแวดล้อม (Tₛ)</span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- LOCAL DATA TABLE COMPONENT WITH DELETE ACTION ---
interface TableProps {
  dataPoints: CoolingDataPoint[];
  onClearPoint: (index: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}

function CoolingDataTable({
  dataPoints,
  onClearPoint,
  onCopyData,
  onExportCSV,
}: TableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm shadow-slate-200/40 flex flex-col h-full select-none">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-blue-600" />
          ตารางบันทึกผล
        </h3>
        <div className="flex gap-1.5">
          <button onClick={onCopyData} className="p-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer active:scale-95" title="คัดลอกข้อมูล">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={onExportCSV} className="p-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer active:scale-95" title="Export CSV">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table grid */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
        {dataPoints.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-1 py-12 min-h-[174px]">
            <HelpCircle className="w-6 h-6 text-slate-300 animate-pulse" />
            <p className="text-[10px] font-bold text-center px-4">ยังไม่มีข้อมูลบันทึก กดปุ่มเริ่มหรือเพิ่มข้อมูล</p>
          </div>
        ) : (
          <table className="w-full text-left text-[11px] font-bold">
            <thead className="bg-blue-50/70 text-[10px] font-black text-blue-800 sticky top-0">
              <tr>
                <th className="px-2.5 py-1.5">เวลา (นาที)</th>
                <th className="px-2.5 py-1.5">วัตถุ (T)</th>
                <th className="px-2.5 py-1.5">แวดล้อม (Tₛ)</th>
                <th className="px-2.5 py-1.5 text-center">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
              {dataPoints.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="px-2.5 py-1.5 font-mono">{p.time.toFixed(2)}</td>
                  <td className="px-2.5 py-1.5 font-mono text-rose-600">{p.temp.toFixed(1)}°C</td>
                  <td className="px-2.5 py-1.5 font-mono text-blue-600">{p.ambient.toFixed(1)}°C</td>
                  <td className="px-2.5 py-1.5 text-center">
                    <button
                      onClick={() => onClearPoint(idx)}
                      className="p-1 text-slate-300 hover:text-red-500 rounded-md transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// --- LOCAL FORMULA CARD COMPONENT ---
function CoolingFormulaCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm shadow-slate-200/40 flex flex-col h-full select-none">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-xs sm:text-sm font-black text-slate-800">
        <Info className="h-4.5 w-4.5 text-blue-600" />
        ทฤษฎีและสูตรการคำนวณ
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex items-center justify-center">
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-slate-800 inline-flex items-center gap-1.5">
            <div className="flex flex-col items-center leading-none text-sm sm:text-base">
              <span>dT</span>
              <span className="border-t border-slate-800 w-full my-0.5" />
              <span>dt</span>
            </div>
            <span>= -k(T - T<sub>s</sub>)</span>
          </div>
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500 leading-[1.6]">
          อัตราการเปลี่ยนแปลงอุณหภูมิของวัตถุจะแปรผันตรงกับผลต่างระหว่างอุณหภูมิของตัววัตถุ (T) และอุณหภูมิสภาพแวดล้อม (Tₛ) ค่าอัตราดังกล่าวจะมีค่าเป็นลบเสมอยามที่ระบบกำลังสูญเสียความร้อนสู่ภายนอก
        </p>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">T: อุณหภูมิวัตถุ</span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">Tₛ: แวดล้อม</span>
        </div>
      </div>
    </div>
  );
}

// --- MAIN EXPORTED COMPONENT ---
const MAX_COOLING_DATA_POINTS = 500;

export default function NewtonsCoolingSimulation() {
  const router = useRouter();
  const labId = "newtons-cooling";

  // Simulator configurations
  const [initialTemp, setInitialTemp] = useState(90); // T0
  const [ambientTemp, setAmbientTemp] = useState(25); // Ts
  const [coolingConstant, setCoolingConstant] = useState(0.12); // k

  const [logInterval, setLogInterval] = useState(30); // auto log interval (10s, 30s, 60s)
  const [simulationSpeed, setSimulationSpeed] = useState(1); // sim speed (0.5x, 1x, 2x, 5x)

  // Simulation running loop states
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTemp, setCurrentTemp] = useState(90);
  const [dataPoints, setDataPoints] = useState<CoolingDataPoint[]>([]);
  const [lastLoggedTime, setLastLoggedTime] = useState(0);

  // Heater & Quest States
  const [isHeaterOn, setIsHeaterOn] = useState(false);
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  // References for keeping track of fast state changes inside the interval
  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const currentTempRef = useRef(currentTemp);
  const lastLoggedTimeRef = useRef(lastLoggedTime);

  const initialTempRef = useRef(initialTemp);
  const ambientTempRef = useRef(ambientTemp);
  const coolingConstantRef = useRef(coolingConstant);
  const logIntervalRef = useRef(logInterval);
  const simulationSpeedRef = useRef(simulationSpeed);

  const isHeaterOnRef = useRef(isHeaterOn);
  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { currentTempRef.current = currentTemp; }, [currentTemp]);
  useEffect(() => { lastLoggedTimeRef.current = lastLoggedTime; }, [lastLoggedTime]);

  useEffect(() => { initialTempRef.current = initialTemp; }, [initialTemp]);
  useEffect(() => { ambientTempRef.current = ambientTemp; }, [ambientTemp]);
  useEffect(() => { coolingConstantRef.current = coolingConstant; }, [coolingConstant]);
  useEffect(() => { logIntervalRef.current = logInterval; }, [logInterval]);
  useEffect(() => { simulationSpeedRef.current = simulationSpeed; }, [simulationSpeed]);

  useEffect(() => { isHeaterOnRef.current = isHeaterOn; }, [isHeaterOn]);
  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Handle setting active currentTemp base on initialTemp before start
  useEffect(() => {
    if (!isRunning && elapsedSeconds === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentTemp(initialTemp);
    }
  }, [initialTemp, isRunning, elapsedSeconds]);

  // Main Ticking Loop effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning) {
      // Tick every 100ms for smoothness
      timer = setInterval(() => {
        const deltaSeconds = 0.1 * simulationSpeedRef.current;
        const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
        setElapsedSeconds(nextSeconds);
        elapsedSecondsRef.current = nextSeconds;

        // Calculate Temperature based on decay or heating equation
        let nextTemp = currentTempRef.current;
        if (isHeaterOnRef.current) {
          const heatingRate = 18; // 18°C per min
          nextTemp = Math.min(100, currentTempRef.current + (heatingRate * deltaSeconds) / 60);
        } else {
          // Newton's law: dT = -k(T - Ts)*dt
          const coolingAmount = coolingConstantRef.current * (currentTempRef.current - ambientTempRef.current) * (deltaSeconds / 60);
          nextTemp = Math.max(ambientTempRef.current, currentTempRef.current - coolingAmount);
        }
        
        setCurrentTemp(nextTemp);
        currentTempRef.current = nextTemp;

        // Quest tracking: Maintain 50-60°C for 20 seconds continuously
        if (nextTemp >= 50 && nextTemp <= 60) {
          const nextQuestProg = Math.min(20, questProgressRef.current + deltaSeconds);
          setQuestProgress(nextQuestProg);
          questProgressRef.current = nextQuestProg;
          
          if (nextQuestProg >= 20 && !questSuccessRef.current) {
            setQuestSuccess(true);
            questSuccessRef.current = true;
            alert("🎉 ยินดีด้วย! คุณควบคุมอุณหภูมิน้ำให้อยู่ในช่วง 50°C - 60°C ต่อเนื่องเป็นเวลา 20 วินาทีสำเร็จ บันทึกผลเพื่อเก็บความคืบหน้า");
          }
        } else {
          setQuestProgress(0);
          questProgressRef.current = 0;
        }

        // Check if log interval threshold is crossed to auto log a data point
        const mins = nextSeconds / 60;
        if (nextSeconds - lastLoggedTimeRef.current >= logIntervalRef.current) {
          setDataPoints((prev) =>
            [
              ...prev,
              { time: mins, temp: nextTemp, ambient: ambientTempRef.current },
            ].slice(-MAX_COOLING_DATA_POINTS),
          );
          setLastLoggedTime(nextSeconds);
          lastLoggedTimeRef.current = nextSeconds;
        }
      }, 100);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  // Start / Pause toggle
  const handleStartStop = () => {
    const nextIsRunning = !isRunning;
    setIsRunning(nextIsRunning);
    isRunningRef.current = nextIsRunning;

    // If starting from absolute zero, add initial log point
    if (nextIsRunning && elapsedSeconds === 0) {
      setDataPoints([
        { time: 0, temp: initialTemp, ambient: ambientTemp }
      ]);
      setLastLoggedTime(0);
      lastLoggedTimeRef.current = 0;
    }
  };

  // Toggle Heater power
  const handleToggleHeater = () => {
    if (!isRunning) return;
    const nextHeater = !isHeaterOn;
    setIsHeaterOn(nextHeater);
    isHeaterOnRef.current = nextHeater;
  };

  // Reset simulator
  const handleReset = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    
    setIsHeaterOn(false);
    isHeaterOnRef.current = false;
    
    setQuestProgress(0);
    questProgressRef.current = 0;
    
    setElapsedSeconds(0);
    elapsedSecondsRef.current = 0;
    
    setCurrentTemp(initialTemp);
    currentTempRef.current = initialTemp;
    
    setDataPoints([]);
    
    setLastLoggedTime(0);
    lastLoggedTimeRef.current = 0;
  };

  // Add Manual log point
  const handleAddPoint = () => {
    const mins = elapsedSeconds / 60;
    if (dataPoints.some(p => p.time === mins)) return;

    setDataPoints((prev) =>
      [
        ...prev,
        { time: mins, temp: currentTemp, ambient: ambientTemp },
      ].slice(-MAX_COOLING_DATA_POINTS),
    );
  };

  // Clear single point from table
  const handleClearPoint = (index: number) => {
    setDataPoints((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Export data as simulated CSV
  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    const headers = "เวลา (นาที),อุณหภูมิของวัตถุ (C),อุณหภูมิสิ่งแวดล้อม (C)\n";
    const rows = dataPoints.map(p => `${p.time.toFixed(2)},${p.temp.toFixed(2)},${p.ambient.toFixed(2)}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scisiam_cooling_log_${labId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Data to clipboard
  const handleCopyData = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการคัดลอก!");
      return;
    }
    const content = dataPoints
      .map(p => `เวลา: ${p.time.toFixed(1)} นาที | อุณหภูมิ: ${p.temp.toFixed(1)}°C | อุณหภูมิแวดล้อม: ${p.ambient.toFixed(1)}°C`)
      .join("\n");
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content)
          .then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"))
          .catch(() => {
            fallbackCopy(content);
          });
      } else {
        fallbackCopy(content);
      }
    } catch {
      fallbackCopy(content);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!");
    } catch {
      alert("ไม่สามารถคัดลอกข้อมูลโดยอัตโนมัติได้ กรุณาคัดลอกด้วยตนเอง");
    }
    document.body.removeChild(textArea);
  };

  // Save results and redirect
  const handleSaveResults = async () => {
    if (dataPoints.length === 0) {
      alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล! กรุณากดเริ่มทดลองและเก็บบันทึกข้อมูลก่อน");
      return;
    }
    
    const experimentData = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      initialTemp,
      ambientTemp,
      coolingConstant,
      dataPoints,
    };
    
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_cooling_experiment",
      localPayload: experimentData,
      labId,
      title: "Newton's law of cooling",
      variables: {
        initialTemp,
        ambientTemp,
        coolingConstant,
        logInterval,
        simulationSpeed,
      },
      liveValues: {
        currentTemp,
        elapsedSeconds,
        questProgress,
        questSuccess,
      },
      graphPoints: dataPoints,
      tableRows: dataPoints,
      summary: {
        finalTemp: currentTemp,
        dataPointCount: dataPoints.length,
        questSuccess,
      },
      score: questSuccess ? 100 : Math.min(100, Math.max(0, questProgress * 5)),
      durationSeconds: Math.round(elapsedSeconds),
    });

    alert("บันทึกข้อมูลการทดลอง (กราฟอุณหภูมิและตารางบันทึกผล) สำเร็จ! 🎉");
    router.push(`/labs/${labId}`);
  };

  const timeLabel = `${Math.floor(elapsedSeconds / 60).toString().padStart(2, "0")}:${Math.floor(elapsedSeconds % 60).toString().padStart(2, "0")}`;
  const environmentPresets = [
    { label: "ห้องปกติ", helper: "25°C / k 0.120", ambient: 25, k: 0.12, icon: Wind },
    { label: "ลมพัด", helper: "20°C / k 0.180", ambient: 20, k: 0.18, icon: Wind },
    { label: "อ่างน้ำแข็ง", helper: "5°C / k 0.260", ambient: 5, k: 0.26, icon: Snowflake },
  ];

  const controls = (
    <div className="space-y-4">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-black text-slate-800">สภาพแวดล้อมทดลอง</p>
            <p className="text-[11px] font-bold text-slate-500">เปลี่ยนห้องทดลองเพื่อดูอัตราการเย็นตัวต่างกัน</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {environmentPresets.map((preset) => {
            const PresetIcon = preset.icon;
            const isActive = Math.abs(ambientTemp - preset.ambient) < 0.1 && Math.abs(coolingConstant - preset.k) < 0.001;

            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setAmbientTemp(preset.ambient);
                  setCoolingConstant(preset.k);
                }}
                className={`rounded-xl border px-3 py-2 text-left transition active:scale-[0.98] ${
                  isActive
                    ? "border-blue-500 bg-white text-blue-700 shadow-sm"
                    : "border-blue-100 bg-white/70 text-slate-600 hover:bg-white"
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-black">
                  <PresetIcon className="h-3.5 w-3.5" />
                  {preset.label}
                </span>
                <span className="mt-1 block text-[10px] font-bold text-slate-400">{preset.helper}</span>
              </button>
            );
          })}
        </div>
      </div>

      {[
        { label: "อุณหภูมิเริ่มต้น (T₀)", value: initialTemp, set: setInitialTemp, min: 20, max: 100, step: 1, suffix: "°C", color: "accent-rose-500", icon: Thermometer },
        { label: "อุณหภูมิสิ่งแวดล้อม (Tₛ)", value: ambientTemp, set: setAmbientTemp, min: 0, max: 40, step: 1, suffix: "°C", color: "accent-blue-500", icon: Thermometer },
        { label: "ค่าคงที่การเย็นตัว (k)", value: coolingConstant, set: setCoolingConstant, min: 0.001, max: 1.000, step: 0.005, suffix: "/นาที", color: "accent-purple-500", icon: Sliders },
      ].map((control) => {
        const ControlIcon = control.icon;

        return (
          <label key={control.label} className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <ControlIcon className="h-3.5 w-3.5 text-blue-600" />
                {control.label}
              </span>
              <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">
                {control.label.includes("k") ? control.value.toFixed(3) : control.value.toFixed(0)} {control.suffix}
              </span>
            </div>
            <input
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={control.value}
              disabled={isRunning}
              onChange={(event) => control.set(Number(event.target.value))}
              className={`h-1.5 w-full rounded-full bg-slate-100 ${control.color} disabled:opacity-45`}
            />
          </label>
        );
      })}

      <div className="grid grid-cols-2 gap-3 pt-1">
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold text-slate-400">ช่วงบันทึกข้อมูล</span>
          <div className="relative">
            <select
              value={logInterval}
              disabled={isRunning}
              onChange={(e) => setLogInterval(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value={10}>10 วินาที</option>
              <option value={30}>30 วินาที</option>
              <option value={60}>1 นาที</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-bold text-slate-400">ความเร็วการจำลอง</span>
          <div className="relative">
            <select
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value={0.5}>0.5x ช้า</option>
              <option value={1}>1x (ปกติ)</option>
              <option value={2}>2x เร็ว</option>
              <option value={5}>5x เร็วมาก</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </label>
      </div>

      <div className="pt-1">
        <button
          onClick={handleToggleHeater}
          disabled={!isRunning}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all duration-300 active:scale-95 cursor-pointer ${
            !isRunning
              ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-50"
              : isHeaterOn
              ? "bg-rose-500 border-rose-600 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isHeaterOn ? "bg-white animate-ping" : "bg-slate-400"}`} />
          <span>{isHeaterOn ? "🔥 เปิดฮีตเตอร์อยู่ (ทำความร้อน)" : "♨️ ปิดฮีตเตอร์ (เย็นตัวปกติ)"}</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-1">
        <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm transition active:scale-95 cursor-pointer ${isRunning ? "bg-slate-700 hover:bg-slate-800" : "bg-blue-600 hover:bg-blue-700"}`}>
          {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
          {isRunning ? "หยุดชั่วคราว" : "เริ่มจำลอง"}
        </button>
        <button onClick={handleAddPoint} className="inline-flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xs font-black text-blue-700 hover:bg-blue-100 transition active:scale-95 cursor-pointer">บันทึกจุด</button>
        <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition active:scale-95 cursor-pointer" aria-label="รีเซ็ต">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="blue"
      labId={labId}
      category="Physics"
      title="Newton's Law of Cooling"
      subtitle="ทดลองศึกษาความร้อนและการเย็นตัวของของเหลวตามกฎการเย็นตัวของนิวตัน ควบคุมฮีตเตอร์สั่งการอุณหภูมิ และอ่านค่าเซ็นเซอร์อุณหภูมิแบบ Real-time"
      statusLabel={isRunning ? "กำลังวัดอุณหภูมิ" : "พร้อมทดลอง"}
      icon={Thermometer}
      sceneTitle="ห้องปฏิบัติการจำลองความร้อน"
      scene={
        <CoolingViewport
          currentTemp={currentTemp}
          ambientTemp={ambientTemp}
          coolingConstant={coolingConstant}
          isHeaterOn={isHeaterOn}
        />
      }
      controlsTitle="แผงควบคุมอุณหภูมิ"
      controls={controls}
      metrics={[
        { label: "อุณหภูมิน้ำ", value: `${currentTemp.toFixed(1)}°C`, tone: "rose" },
        { label: "สิ่งแวดล้อม", value: `${ambientTemp.toFixed(1)}°C`, tone: "blue" },
        { label: "เวลา", value: timeLabel, tone: "cyan" },
        { label: "สถานะฮีตเตอร์", value: isHeaterOn ? "🔥 เปิดทำความร้อน" : "❄️ ปิด/เย็นลง", tone: isHeaterOn ? "orange" : "blue" },
      ]}
      graph={<CoolingGraph dataPoints={dataPoints} />}
      table={
        <CoolingDataTable
          dataPoints={dataPoints}
          onClearPoint={handleClearPoint}
          onExportCSV={handleExportCSV}
          onCopyData={handleCopyData}
        />
      }
      theory={<CoolingFormulaCard />}
      steps={[
        { label: "ตั้งค่าเริ่มต้น", icon: Sliders },
        { label: "เริ่มจำลอง", icon: Play },
        { label: "สังเกตความเย็น", icon: TrendingDown },
        { label: "บันทึกข้อมูล", icon: ClipboardList },
        { label: "วิเคราะห์และสรุป", icon: Target },
      ]}
      learningGoals={[
        "เข้าใจกฎการเย็นตัวของของเหลวตามทฤษฎีนิวตัน",
        "ศึกษาผลกระทบของอุณหภูมิสิ่งแวดล้อมต่ออัตราการเย็นตัว",
        "วิเคราะห์กราฟความสัมพันธ์ระหว่างอุณหภูมิกับเวลา",
        "ฝึกคำนวณและประเมินค่าคงที่การระบายความร้อน (k)",
      ]}
      progressLabel="ระยะเวลาที่อุณหภูมิอยู่ในช่วงภารกิจ"
      progressValue={`${questProgress.toFixed(1)} / 20 วินาที`}
      progressPercent={(questProgress / 20) * 100}
      tips={[
        "ค่อย ๆ เพิ่มหรือลดอุณหภูมิแวดล้อมเพื่อสังเกตแนวโน้มอัตราการระบายความร้อน",
        "ค่าคงที่ k ที่สูงขึ้นหมายความว่าของเหลวจะคายความร้อนเร็วขึ้น",
        "ภารกิจควบคุมอุณหภูมิน้ำให้อยู่ในช่วง 50°C - 60°C ต่อเนื่องเป็นเวลา 20 วินาทีสำเร็จคุณจะได้รับคะแนนพิเศษ",
        "พยายามสลับเปิด-ปิดฮีตเตอร์เพื่อรักษาระดับอุณหภูมิในช่วงเป้าหมายของภารกิจ",
      ]}
      onSave={handleSaveResults}
    />
  );
}
