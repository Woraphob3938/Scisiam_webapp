"use client";

import React from "react";
import { Maximize2, Thermometer, Sun, Timer, TrendingDown, Snowflake, Wind, Activity } from "lucide-react";

interface ExperimentViewportProps {
  currentTemp: number;
  initialTemp: number;
  ambientTemp: number;
  elapsedSeconds: number;
  coolingConstant: number;
}

export default function ExperimentViewport({
  currentTemp,
  initialTemp,
  ambientTemp,
  elapsedSeconds,
  coolingConstant,
}: ExperimentViewportProps) {
  // Format elapsed time (Seconds -> MM:SS)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")} นาที`;
  };

  // Calculate instant cooling rate: dT/dt = -k(T - Ts)
  const coolingRate = -coolingConstant * (currentTemp - ambientTemp);

  // Dynamic Beaker Liquid Color based on temperature
  // Hot (> 75C) -> Orange-Red
  // Warm (40C - 75C) -> Yellow-Orange
  // Ambient/Cool (< 40C) -> Teal-Blue
  const getLiquidColor = (temp: number) => {
    if (temp >= 75) {
      // Fade from Orange to Red
      const ratio = (temp - 75) / 25; // 0 to 1
      const r = Math.round(239 + ratio * 16); // 239 to 255
      const g = Math.round(68 - ratio * 18);  // 68 to 50
      const b = Math.round(68 - ratio * 18);  // 68 to 50
      return `rgb(${r}, ${g}, ${b})`;
    } else if (temp >= 40) {
      // Fade from Yellow to Orange
      const ratio = (temp - 40) / 35; // 0 to 1
      const r = Math.round(251 - ratio * 12); // 251 to 239
      const g = Math.round(191 - ratio * 123); // 191 to 68
      const b = Math.round(36 + ratio * 32);   // 36 to 68
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Fade from Teal-Blue to Yellow
      const ratio = Math.max(0, (temp - ambientTemp) / (40 - ambientTemp)); // 0 to 1
      const r = Math.round(96 + ratio * 155);  // 96 to 251
      const g = Math.round(165 + ratio * 26);  // 165 to 191
      const b = Math.round(250 - ratio * 214); // 250 to 36
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Thermometer mercury height: 100C is Y=20, ambientTemp (e.g. 20C) is Y=90
  // Formula mapping: temp=100 -> height=75px, temp=0 -> height=5px
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

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between h-full group select-none">
      
      {/* Viewport Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
            ห้องทดลองจำลอง
          </h3>
          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            กำลังทำงาน
          </span>
        </div>
        
        {/* Fullscreen Button */}
        <button 
          onClick={() => alert("เข้าสู่โหมดเต็มจอเสมือน (Mock Fullscreen)")}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          aria-label="เต็มหน้าจอ"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid Viewport (Scene vs Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Side: 2D Beaker Science Scene (8 Columns) */}
        <div className="md:col-span-8 bg-slate-50 border border-slate-200/40 rounded-2xl relative h-60 md:h-72 overflow-hidden flex items-center justify-center">
          
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

          {/* Environmental Info Panel (Left Overlay) */}
          <div className="absolute top-3.5 left-3.5 bg-white/80 backdrop-blur-md p-3 rounded-xl border border-slate-200/50 text-left text-[10px] sm:text-xs text-slate-500 font-semibold space-y-1.5 shadow-xs z-10">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide block mb-1">
              สภาพแวดล้อม
            </span>
            <div className="flex items-center gap-1.5">
              <Snowflake className="w-3.5 h-3.5 text-blue-400" />
              <span>ห้อง (Air)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-slate-400" />
              <span>อากาศนิ่ง</span>
            </div>
          </div>

          {/* Ice / Ambient Cooler Display (Bottom Left Overlay) */}
          <div className="absolute bottom-3.5 left-3.5 bg-white/85 backdrop-blur-md p-2 rounded-xl border border-slate-200/50 flex items-center gap-2 shadow-xs z-10">
            {/* Ambient thermometer */}
            <div className="text-right select-none">
              <span className="text-[8px] font-bold text-slate-400 block -mb-0.5">AMBIENT</span>
              <span className="text-xs sm:text-sm font-extrabold text-blue-600">{ambientTemp.toFixed(1)}°C</span>
            </div>
            {/* Ice cube SVG block */}
            <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12,2 L3,6 L12,10 L21,6 Z" fill="#bae6fd" />
              <path d="M3,6 L12,10 L12,20 L3,16 Z" fill="#93c5fd" opacity="0.8" />
              <path d="M12,10 L21,6 L21,16 L12,20 Z" fill="#60a5fa" opacity="0.9" />
            </svg>
          </div>

          {/* Active Science Visual SVGs */}
          <svg className="w-full h-full max-w-[200px]" viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Heating plate / stand Base */}
            <rect x="25" y="160" width="110" height="15" rx="3" fill="#334155" />
            <rect x="35" y="155" width="90" height="5" rx="1" fill="#475569" />
            
            {/* Beaker Container */}
            <path d="M40,55 L40,145 C40,149 43,152 47,152 L113,152 C117,152 120,149 120,145 L120,55" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            {/* Beaker scale marks */}
            <line x1="110" y1="75" x2="115" y2="75" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="105" y1="95" x2="115" y2="95" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="110" y1="115" x2="115" y2="115" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="105" y1="135" x2="115" y2="135" stroke="#cbd5e1" strokeWidth="1.5" />
            
            {/* Beaker Top Flange */}
            <path d="M37,55 C37,55 45,53 50,53 C55,53 105,53 110,53 C115,53 123,55 123,55" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />

            {/* Liquid (Fading color representing temperature) */}
            <path d="M42.5,85 L42.5,143 C42.5,146 45.5,149.5 49,149.5 L111,149.5 C114.5,149.5 117.5,146 117.5,143 L117.5,85 Z" fill={liquidColor} opacity="0.75" className="transition-all duration-500" />
            
            {/* Steam/Condensation effects for hot temps */}
            {currentTemp > 50 && (
              <g className="animate-pulse">
                <path d="M60,40 Q63,30 60,20" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                <path d="M80,38 Q83,28 80,18" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                <path d="M100,42 Q97,32 100,22" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              </g>
            )}

            {/* Thermometer Stand Clamp holding the thermometer */}
            <line x1="130" y1="40" x2="130" y2="155" stroke="#94a3b8" strokeWidth="2.5" />
            <path d="M130,50 L87,50" stroke="#475569" strokeWidth="3.5" />

            {/* Thermometer */}
            <g transform="translate(75, 20)">
              {/* Glass Tube */}
              <rect x="5" y="0" width="8" height="110" rx="4" fill="rgba(255, 255, 255, 0.85)" stroke="#64748b" strokeWidth="1.5" />
              {/* Bulb */}
              <circle cx="9" cy="115" r="9" fill="#ef4444" stroke="#64748b" strokeWidth="1.5" />
              <circle cx="9" cy="115" r="7" fill="#ef4444" />
              {/* Dynamic Red mercury level */}
              <rect x="8" y={105 - mercuryHeight} width="2" height={mercuryHeight} fill="#ef4444" className="transition-all duration-500" />
            </g>
          </svg>
        </div>

        {/* Right Side: Active Stat Readings HUD (4 Columns) */}
        <div className="md:col-span-4 flex flex-col justify-between gap-3">
          
          {/* STAT 1: อุณหภูมิของวัตถุ (T) */}
          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Thermometer className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block leading-none">
                  อุณหภูมิวัตถุ (T)
                </span>
                <span className="text-sm font-bold text-slate-700 mt-1 block leading-none">
                  Object Temp
                </span>
              </div>
            </div>
            <span className="text-base sm:text-lg font-extrabold text-rose-600">
              {currentTemp.toFixed(1)}°C
            </span>
          </div>

          {/* STAT 2: อุณหภูมิสิ่งแวดล้อม (Ts) */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Sun className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block leading-none">
                  อุณหภูมิสิ่งแวดล้อม (Ts)
                </span>
                <span className="text-sm font-bold text-slate-700 mt-1 block leading-none">
                  Ambient Temp
                </span>
              </div>
            </div>
            <span className="text-base sm:text-lg font-extrabold text-blue-600">
              {ambientTemp.toFixed(1)}°C
            </span>
          </div>

          {/* STAT 3: เวลาจับเวลา */}
          <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Timer className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block leading-none">
                  เวลาการทดลอง
                </span>
                <span className="text-sm font-bold text-slate-700 mt-1 block leading-none">
                  Elapsed Time
                </span>
              </div>
            </div>
            <span className="text-base sm:text-lg font-extrabold text-slate-700">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          {/* STAT 4: อัตราการเปลี่ยนแปลง dT/dt */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block leading-none">
                  อัตราเปลี่ยนอุณหภูมิ
                </span>
                <span className="text-sm font-bold text-slate-700 mt-1 block leading-none">
                  Rate (dT/dt)
                </span>
              </div>
            </div>
            <span className="text-base sm:text-lg font-extrabold text-emerald-600">
              {coolingRate.toFixed(2)} °C/นาที
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
