"use client";

import React, { useState, useEffect, useId, useRef } from "react";
import {
  Thermometer,
  Sliders,
  Play,
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
import { BoundedNumberInput } from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";
import { TUTORIAL_IDS } from "@/lib/tutorials/catalog";
import { reportTutorialAction } from "@/lib/tutorials/events";

// --- TYPES ---
export interface CoolingDataPoint {
  time: number;     // in minutes
  temp: number;     // in °C
  ambient: number;  // in °C
}

const MIN_TEMPERATURE_C = -50;
const MAX_TEMPERATURE_C = 100;

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// --- LOCAL VIEWPORT ---
interface ViewportProps {
  currentTemp: number;
  ambientTemp: number;
  coolingConstant: number;
  isHeaterOn: boolean;
  isRunning: boolean;
}

function CoolingViewport({
  currentTemp,
  ambientTemp,
  coolingConstant,
  isHeaterOn,
  isRunning,
}: ViewportProps) {
  const svgId = useId();
  const liquidGradientId = `${svgId}-liquid`;
  const glassGradientId = `${svgId}-glass`;
  const metalGradientId = `${svgId}-metal`;
  const sensorGradientId = `${svgId}-sensor`;
  const coolingRateGradientId = `${svgId}-cooling-rate`;
  const shadowId = `${svgId}-shadow`;

  const temperatureDelta = currentTemp - ambientTemp;
  const equilibriumTolerance = 0.5;
  const thermalDirection =
    Math.abs(temperatureDelta) <= equilibriumTolerance
      ? "equilibrium"
      : temperatureDelta > 0
        ? "outward"
        : "inward";
  const flowMagnitude = Math.min(
    1,
    (Math.abs(temperatureDelta) / 60) * (0.5 + coolingConstant * 2),
  );
  const thermalStatus =
    thermalDirection === "outward"
      ? "กำลังเย็นลง"
      : thermalDirection === "inward"
        ? "กำลังอุ่นขึ้น"
        : "ใกล้สมดุล";
  const thermalSummary =
    thermalDirection === "outward"
      ? "ความร้อนถ่ายเทออกจากตัวอย่างสู่สิ่งแวดล้อม"
      : thermalDirection === "inward"
        ? "ความร้อนถ่ายเทจากสิ่งแวดล้อมเข้าสู่ตัวอย่าง"
        : "อุณหภูมิตัวอย่างและสิ่งแวดล้อมใกล้เคียงกัน";
  const flowColor =
    thermalDirection === "outward"
      ? "#c2410c"
      : thermalDirection === "inward"
        ? "#2563eb"
        : "#64748b";
  const liquidColor =
    currentTemp >= 65 ? "#ef4444" : currentTemp >= 30 ? "#f59e0b" : currentTemp >= 0 ? "#38bdf8" : "#2563eb";
  const mercuryHeight = 18 + ((currentTemp - MIN_TEMPERATURE_C) / (MAX_TEMPERATURE_C - MIN_TEMPERATURE_C)) * 112;
  const thermometerTop = 207 - mercuryHeight;
  const environmentLabel =
    ambientTemp <= 8 ? "อ่างน้ำแข็ง" : ambientTemp <= 18 ? "ห้องเย็น" : ambientTemp >= 32 ? "ห้องอุ่น" : "ห้องทดลอง";
  const airflowLabel = coolingConstant >= 0.22 ? "พัดลมแรง" : coolingConstant >= 0.16 ? "ลมหมุนเวียน" : "อากาศนิ่ง";
  const coolingRatePercent = Math.round(clampNumber((coolingConstant - 0.05) / 0.25, 0, 1) * 100);
  const coolingRateMarkerX = 4 + coolingRatePercent * 1.24;

  return (
    <div className="relative min-h-[180px] overflow-hidden bg-slate-100 sm:h-full sm:min-h-[300px]">
      <svg
        role="img"
        aria-labelledby={`${svgId}-title ${svgId}-description`}
        data-thermal-direction={thermalDirection}
        data-flow-magnitude={flowMagnitude.toFixed(2)}
        className="h-auto min-h-[160px] w-full select-none sm:h-full sm:min-h-[280px]"
        viewBox="0 0 600 320"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{`
          @keyframes newton-fan-spin { to { transform: rotate(360deg); } }
          @keyframes newton-surface-shimmer { 50% { opacity: 0.98; } }
          .newton-chamber-fan { transform-box: fill-box; transform-origin: center; animation: newton-fan-spin 1.3s linear infinite; }
          .newton-sample-surface { animation: newton-surface-shimmer 1.8s ease-in-out infinite; }
          [data-running="false"].newton-chamber-fan,
          [data-running="false"] .newton-sample-surface { animation-play-state: paused; }
        `}</style>
        <title id={`${svgId}-title`}>ชุดทดลองกฎการเย็นตัวของนิวตัน</title>
        <desc id={`${svgId}-description`}>
          ชุดทดลองพร้อมตัวอย่าง เทอร์โมมิเตอร์ และพัดลมควบคุมสภาพแวดล้อม อุณหภูมิตัวอย่าง {currentTemp.toFixed(1)} องศาเซลเซียส สิ่งแวดล้อม {ambientTemp.toFixed(1)} องศาเซลเซียส สถานะ {thermalStatus} {thermalSummary} ฮีตเตอร์{isHeaterOn ? "เปิด" : "ปิด"}
        </desc>
        <defs>
          <linearGradient id={liquidGradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={liquidColor} stopOpacity="0.82" />
            <stop offset="100%" stopColor={liquidColor} stopOpacity="0.46" />
          </linearGradient>
          <linearGradient id={glassGradientId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.64" />
            <stop offset="36%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id={metalGradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="46%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id={sensorGradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id={coolingRateGradientId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id={shadowId} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.18" />
          </filter>
        </defs>

        <path d="M14 245 H586 V290 H14 Z" fill="#e2e8f0" />
        <path d="M14 245 H586" stroke="#94a3b8" strokeWidth="2" />
        <path d="M32 55 H568" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 8" />

        <g aria-hidden="true">
          <rect x="34" y="72" width="144" height="70" rx="10" fill="#ffffff" stroke="#cbd5e1" />
          <text x="50" y="96" fill="#475569" fontSize="12" fontWeight="700">สภาพแวดล้อม</text>
          <text x="50" y="119" fill="#0f172a" fontSize="18" fontWeight="800">Tₛ {ambientTemp.toFixed(1)}°C</text>
          <text x="50" y="132" fill="#64748b" fontSize="10" fontWeight="600">{environmentLabel} • {airflowLabel}</text>
        </g>

        <g aria-hidden="true" data-running={isRunning}>
          <circle cx="92" cy="206" r="36" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="2" />
          <g className="newton-chamber-fan" data-running={isRunning}>
            {[0, 90, 180, 270].map((rotation) => (
              <path key={rotation} d="M92 206 C105 180 127 187 115 205 C106 216 101 218 92 206 Z" fill="#38bdf8" opacity="0.8" transform={`rotate(${rotation} 92 206)`} />
            ))}
          </g>
          <circle cx="92" cy="206" r="7" fill="#0f172a" />
        </g>

        <g filter={`url(#${shadowId})`}>
          <rect x="245" y="225" width="110" height="22" rx="7" fill={`url(#${metalGradientId})`} stroke="#334155" strokeWidth="1.5" />
          <rect x="254" y="219" width="92" height="8" rx="4" fill={isHeaterOn ? "#dc2626" : "#334155"} />
          <ellipse cx="300" cy="219" rx="39" ry="4" fill={isHeaterOn ? "#fb923c" : "#0f172a"} opacity={isHeaterOn ? 0.9 : 0.55} />
          <circle cx="264" cy="237" r="3" fill={isHeaterOn ? "#ef4444" : "#64748b"} />
          <circle cx="276" cy="237" r="3" fill={isRunning ? "#22c55e" : "#94a3b8"} />
        </g>

        {isHeaterOn && (
          <g aria-hidden="true" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" opacity="0.85">
            <path d="M278 214 Q272 202 280 192" />
            <path d="M300 214 Q306 199 300 188" />
            <path d="M322 214 Q328 202 320 192" />
          </g>
        )}

        <g filter={`url(#${shadowId})`}>
          <path d="M242 94 V208 C242 217 249 223 258 223 H342 C351 223 358 217 358 208 V94" fill={`url(#${glassGradientId})`} stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M235 94 C251 89 270 90 300 90 C330 90 349 89 365 94" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
          <path d="M247 145 V207 C247 214 252 218 259 218 H341 C348 218 353 214 353 207 V145 Z" fill={`url(#${liquidGradientId})`} />
          <ellipse className="newton-sample-surface" data-running={isRunning} cx="300" cy="145" rx="53" ry="5.5" fill={liquidColor} opacity="0.82" stroke="#ffffff" strokeWidth="1" />
          <path d="M262 156 C276 170 276 194 265 207" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          {[165, 185, 205].map((y) => <line key={y} x1="347" y1={y} x2="355" y2={y} stroke="#475569" strokeWidth="1.4" />)}
        </g>

        <g>
          <line x1="382" y1="72" x2="382" y2="222" stroke={`url(#${metalGradientId})`} strokeWidth="5" />
          <path d="M382 94 H322" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <rect x="317" y="89" width="10" height="10" rx="2" fill="#0f172a" />
          <rect x="296" y="70" width="10" height="141" rx="5" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
          {Array.from({ length: 6 }).map((_, index) => (
            <line key={index} x1="296" y1={88 + index * 18} x2="301" y2={88 + index * 18} stroke="#64748b" strokeWidth="1" />
          ))}
          <rect x="299" y={thermometerTop} width="4" height={mercuryHeight} rx="2" fill={liquidColor} />
          <circle cx="301" cy="214" r="11" fill={liquidColor} stroke="#475569" strokeWidth="1.5" />
          <circle cx="297" cy="210" r="3" fill="#ffffff" opacity="0.72" />
        </g>

        <g data-testid="temperature-sensor" transform="translate(438 86)" filter={`url(#${shadowId})`}>
          <rect width="104" height="64" rx="9" fill={`url(#${sensorGradientId})`} stroke="#334155" strokeWidth="2" />
          <rect x="9" y="10" width="86" height="28" rx="5" fill="#052e16" />
          <text x="52" y="21" fill="#86efac" fontSize="7" fontWeight="700" textAnchor="middle">TEMPERATURE SENSOR</text>
          <text x="52" y="34" fill="#dcfce7" fontSize="15" fontWeight="800" fontFamily="monospace" textAnchor="middle">{currentTemp.toFixed(1)}°C</text>
          <circle cx="15" cy="50" r="3.5" fill={isRunning ? "#22c55e" : "#64748b"} />
          <text x="25" y="54" fill="#cbd5e1" fontSize="8" fontWeight="700">{thermalStatus}</text>
        </g>

        <g data-testid="cooling-coefficient-readout" transform="translate(18 248)">
          <text x="0" y="10" fill="#475569" fontSize="10" fontWeight="700">ค่า k ควบคุมความเร็วการเย็น</text>
          <g data-testid="cooling-rate-scale" aria-hidden="true">
            <path d="M4 23 H128" stroke="#dbeafe" strokeWidth="8" strokeLinecap="round" />
            <path d="M4 23 H128" stroke={`url(#${coolingRateGradientId})`} strokeWidth="4" strokeLinecap="round" />
            {[4, 66, 128].map((x) => <circle key={x} cx={x} cy="23" r="2.5" fill="#ffffff" stroke="#60a5fa" strokeWidth="1" />)}
            <circle cx={coolingRateMarkerX} cy="23" r="6" fill="#7c3aed" stroke="#ffffff" strokeWidth="2" />
          </g>
          <text x="0" y="39" fill="#64748b" fontSize="8" fontWeight="700">เย็นช้า</text>
          <text x="128" y="39" fill="#64748b" fontSize="8" fontWeight="700" textAnchor="end">เย็นเร็ว</text>
          <text x="0" y="56" fill="#0f172a" fontSize="14" fontWeight="800">k = {coolingConstant.toFixed(3)} / นาที</text>
          <text x="128" y="56" fill="#7c3aed" fontSize="9" fontWeight="800" textAnchor="end">{airflowLabel}</text>
        </g>

        <g>
          <rect x="210" y="34" width="180" height="38" rx="19" fill="#ffffff" stroke={flowColor} strokeWidth="1.5" />
          <circle cx="232" cy="53" r="7" fill={flowColor} />
          <text x="246" y="50" fill="#334155" fontSize="11" fontWeight="700">การถ่ายเทความร้อน</text>
          <text x="246" y="63" fill={flowColor} fontSize="12" fontWeight="800">{thermalStatus}</text>
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
  const graphScale = React.useMemo(() => {
    const temperatures = dataPoints.flatMap((point) => [point.temp, point.ambient]);
    const rawMin = Math.min(0, ...temperatures);
    const rawMax = Math.max(0, ...temperatures);
    const span = Math.max(10, rawMax - rawMin);
    const padding = span * 0.1;
    const min = Math.floor((rawMin - padding) / 10) * 10;
    const max = Math.ceil((rawMax + padding) / 10) * 10;
    const maxTime = Math.max(1, ...dataPoints.map((point) => point.time));
    const ticks = Array.from({ length: 5 }, (_, index) => max - ((max - min) * index) / 4);

    return { min, max, maxTime, ticks };
  }, [dataPoints]);
  const timeToSvgX = React.useCallback(
    (time: number) => 30 + (time / graphScale.maxTime) * 150,
    [graphScale.maxTime],
  );
  const tempToSvgY = React.useCallback(
    (temperature: number) => 15 + ((graphScale.max - temperature) / (graphScale.max - graphScale.min)) * 85,
    [graphScale.max, graphScale.min],
  );
  const zeroAxisY = tempToSvgY(0);

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
            {graphScale.ticks.map((tick) => {
              const y = tempToSvgY(tick);
              return (
                <g key={tick}>
                  <line x1="30" y1={y} x2="180" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <text x="27" y={y + 2.5} fill="#64748b" fontSize="6.5" fontWeight="bold" textAnchor="end">
                    {tick.toFixed(0)}
                  </text>
                </g>
              );
            })}
            {zeroAxisY >= 15 && zeroAxisY <= 100 && (
              <line
                data-testid="temperature-zero-axis"
                x1="30"
                y1={zeroAxisY}
                x2="180"
                y2={zeroAxisY}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.2"
              />
            )}

            <text x="32" y="10" fill="#64748b" fontSize="5.5" fontWeight="extrabold">Temp (°C)</text>

            {/* X-Axis Label metrics (Time mins) */}
            {Array.from({ length: 5 }, (_, index) => {
              const time = (graphScale.maxTime * index) / 4;
              return (
                <text key={time} x={30 + index * 37.5} y="108" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">
                  {time.toFixed(time < 10 ? 1 : 0)}
                </text>
              );
            })}

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
          อัตราการเปลี่ยนแปลงอุณหภูมิของวัตถุแปรผันกับผลต่างระหว่างอุณหภูมิวัตถุ (T) และสิ่งแวดล้อม (Tₛ) หากวัตถุร้อนกว่า อุณหภูมิจะลดลง แต่หากวัตถุเย็นกว่า อุณหภูมิจะเพิ่มขึ้นและค่อย ๆ เข้าใกล้ Tₛ
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
  const labId = "newtons-cooling";

  // Simulator configurations
  const [initialTemp, setInitialTemp] = useState(90); // T0
  const [ambientTemp, setAmbientTemp] = useState(25); // Ts
  const [coolingConstant, setCoolingConstant] = useState(0.12); // k

  const logInterval = 30;
  const simulationSpeed = 1;

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

  useEffect(() => { ambientTempRef.current = ambientTemp; }, [ambientTemp]);
  useEffect(() => { coolingConstantRef.current = coolingConstant; }, [coolingConstant]);
  useEffect(() => { isHeaterOnRef.current = isHeaterOn; }, [isHeaterOn]);
  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  const handleInitialTemperatureChange = (value: number) => {
    const next = clampNumber(value, MIN_TEMPERATURE_C, MAX_TEMPERATURE_C);
    if (next === initialTemp) return;

    setInitialTemp(next);
    reportTutorialAction({
      tutorialId: TUTORIAL_IDS.newtonsCooling,
      actionId: "newton.initial-temperature.changed",
      labId,
    });
  };

  const handleAmbientTemperatureChange = (value: number) => {
    const next = clampNumber(value, MIN_TEMPERATURE_C, 50);
    if (next === ambientTemp) return;

    setAmbientTemp(next);
    reportTutorialAction({
      tutorialId: TUTORIAL_IDS.newtonsCooling,
      actionId: "newton.ambient-temperature.changed",
      labId,
    });
  };

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
          nextTemp = Math.min(MAX_TEMPERATURE_C, currentTempRef.current + (heatingRate * deltaSeconds) / 60);
        } else {
          // Newton's law: dT = -k(T - Ts)*dt
          const coolingAmount = coolingConstantRef.current * (currentTempRef.current - ambientTempRef.current) * (deltaSeconds / 60);
          nextTemp = clampNumber(
            currentTempRef.current - coolingAmount,
            MIN_TEMPERATURE_C,
            MAX_TEMPERATURE_C,
          );
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
    reportTutorialAction({
      tutorialId: TUTORIAL_IDS.newtonsCooling,
      actionId: nextIsRunning ? "simulation.started" : "simulation.paused",
      labId,
    });

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

  };

  const timeLabel = `${Math.floor(elapsedSeconds / 60).toString().padStart(2, "0")}:${Math.floor(elapsedSeconds % 60).toString().padStart(2, "0")}`;
  const commitCurrentTemp = (raw: string) => {
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    const next = clampNumber(value, MIN_TEMPERATURE_C, MAX_TEMPERATURE_C);
    setCurrentTemp(next);
    currentTempRef.current = next;
    if (!isRunning) {
      handleInitialTemperatureChange(next);
    }
  };
  const environmentPresets = [
    { label: "ห้องปกติ", helper: "25°C / k 0.120", ambient: 25, k: 0.12, icon: Wind },
    { label: "ลมพัด", helper: "20°C / k 0.180", ambient: 20, k: 0.18, icon: Wind },
    { label: "อ่างน้ำแข็ง", helper: "5°C / k 0.260", ambient: 5, k: 0.26, icon: Snowflake },
  ];
  const coolingControls = [
    { label: "อุณหภูมิเริ่มต้น (T₀)", shortLabel: "T₀", value: initialTemp, set: handleInitialTemperatureChange, tutorialTarget: "newtons-cooling-initial-temperature", min: MIN_TEMPERATURE_C, max: MAX_TEMPERATURE_C, step: 1, suffix: "°C", color: "accent-rose-500", icon: Thermometer },
    { label: "อุณหภูมิสิ่งแวดล้อม (Tₛ)", shortLabel: "Tₛ", value: ambientTemp, set: handleAmbientTemperatureChange, tutorialTarget: "newtons-cooling-ambient-temperature", min: MIN_TEMPERATURE_C, max: 50, step: 1, suffix: "°C", color: "accent-blue-500", icon: Thermometer },
    { label: "ค่าคงที่การเย็นตัว (k)", shortLabel: "k", value: coolingConstant, set: setCoolingConstant, tutorialTarget: undefined, min: 0.001, max: 1.000, step: 0.005, suffix: "/นาที", color: "accent-purple-500", icon: Sliders },
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
                  handleAmbientTemperatureChange(preset.ambient);
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

    </div>
  );

  const compactControls = (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        {coolingControls.map((control) => {
          const ControlIcon = control.icon;
          const disabled = isRunning && control.shortLabel === "T₀";

          return (
            <label
              key={control.label}
              data-tutorial={control.tutorialTarget}
              className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-black text-slate-700">
                  <ControlIcon className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <span className="truncate">{control.shortLabel}</span>
                </span>
                <BoundedNumberInput
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  precision={control.shortLabel === "k" ? 3 : 0}
                  value={control.value}
                  disabled={disabled}
                  onChange={control.set}
                  className="h-8 w-[72px] rounded-lg border border-slate-200 bg-white px-2 text-right text-xs font-black text-slate-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400 sm:w-24"
                  ariaLabel={`กรอก${control.label}`}
                />
              </div>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={control.value}
                disabled={disabled}
                onChange={(event) => control.set(Number(event.target.value))}
                className={`h-1.5 w-full rounded-full bg-slate-100 ${control.color} disabled:opacity-45`}
                aria-label={`เลื่อน${control.label}`}
              />
            </label>
          );
        })}
    </div>
  );

  const drawerSummary = (
    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
      <label className="rounded-xl bg-rose-50 px-3 py-2 text-rose-700">
        <span className="block opacity-75">อุณหภูมิตัวอย่าง</span>
        <BoundedNumberInput
          min={MIN_TEMPERATURE_C}
          max={MAX_TEMPERATURE_C}
          step={0.5}
          precision={1}
          value={currentTemp}
          onChange={(value) => commitCurrentTemp(String(value))}
          className="mt-1 h-8 w-full rounded-lg border border-rose-100 bg-white/80 px-2 text-right text-sm font-black text-rose-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          ariaLabel="กรอกอุณหภูมิตัวอย่าง"
        />
      </label>
      <label className="rounded-xl bg-blue-50 px-3 py-2 text-blue-700">
        <span className="block opacity-75">สิ่งแวดล้อม</span>
        <BoundedNumberInput
          min={MIN_TEMPERATURE_C}
          max={50}
          step={1}
          value={ambientTemp}
          onChange={handleAmbientTemperatureChange}
          className="mt-1 h-8 w-full rounded-lg border border-blue-100 bg-white/80 px-2 text-right text-sm font-black text-blue-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          ariaLabel="กรอกอุณหภูมิสิ่งแวดล้อม"
        />
      </label>
      <div className="rounded-xl bg-cyan-50 px-3 py-2 text-cyan-700">
        <span className="block opacity-75">เวลา</span>
        <span className="mt-1 block h-8 rounded-lg bg-white/60 px-2 py-1.5 text-right text-sm font-black">{timeLabel}</span>
      </div>
      <label className="rounded-xl bg-violet-50 px-3 py-2 text-violet-700">
        <span className="block opacity-75">ค่า k</span>
        <BoundedNumberInput
          min={0.001}
          max={1}
          step={0.005}
          precision={3}
          value={coolingConstant}
          onChange={setCoolingConstant}
          className="mt-1 h-8 w-full rounded-lg border border-violet-100 bg-white/80 px-2 text-right text-sm font-black text-violet-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
          ariaLabel="กรอกค่าคงที่การเย็นตัว"
        />
      </label>
      <div className="col-span-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
        สถานะฮีตเตอร์: <b>{isHeaterOn ? "เปิดทำความร้อน" : "ปิด/เย็นลง"}</b>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="blue"
      labId={labId}
      tutorialId={TUTORIAL_IDS.newtonsCooling}
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
          isRunning={isRunning}
        />
      }
      controlsTitle="แผงควบคุมอุณหภูมิ"
      controls={controls}
      compactControls={compactControls}
      persistentControls
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดชั่วคราว" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      drawerSummary={drawerSummary}
      metrics={[
        { label: "อุณหภูมิตัวอย่าง", value: `${currentTemp.toFixed(1)}°C`, tone: "rose" },
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
        "ภารกิจควบคุมอุณหภูมิน้ำให้อยู่ในช่วง 50°C - 60°C ต่อเนื่องเป็นเวลา 20 วินาที",
        "พยายามสลับเปิด-ปิดฮีตเตอร์เพื่อรักษาระดับอุณหภูมิในช่วงเป้าหมายของภารกิจ",
      ]}
      onSave={handleSaveResults}
    />
  );
}

