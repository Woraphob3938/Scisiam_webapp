"use client";

import React from "react";
import { Sliders, Play, Pause, RotateCcw, FileText, ChevronDown } from "lucide-react";

interface ControlPanelProps {
  initialTemp: number;
  setInitialTemp: (val: number) => void;
  ambientTemp: number;
  setAmbientTemp: (val: number) => void;
  coolingConstant: number;
  setCoolingConstant: (val: number) => void;
  logInterval: number; // in seconds
  setLogInterval: (val: number) => void;
  simulationSpeed: number; // multiplier e.g. 1, 2, 5
  setSimulationSpeed: (val: number) => void;
  isRunning: boolean;
  onStartStop: () => void;
  onReset: () => void;
  onSave: () => void;
}

export default function ControlPanel({
  initialTemp,
  setInitialTemp,
  ambientTemp,
  setAmbientTemp,
  coolingConstant,
  setCoolingConstant,
  logInterval,
  setLogInterval,
  simulationSpeed,
  setSimulationSpeed,
  isRunning,
  onStartStop,
  onReset,
  onSave,
}: ControlPanelProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full select-none">
      
      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight mb-5 border-b border-slate-50 pb-2.5 flex items-center gap-2">
        <Sliders className="w-5.5 h-5.5 text-indigo-500" />
        แผงควบคุมการทดลอง
      </h3>

      {/* Inputs / Sliders Grid */}
      <div className="space-y-4">
        
        {/* Slider 1: T0 Initial Temp */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-600">อุณหภูมิเริ่มต้น (T₀)</span>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                {initialTemp} °C
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-bold">20</span>
            <input
              type="range"
              min="20"
              max="100"
              value={initialTemp}
              disabled={isRunning}
              onChange={(e) => setInitialTemp(Number(e.target.value))}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-rose-500 bg-slate-100 ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            <span className="text-[10px] text-slate-400 font-bold">100</span>
          </div>
        </div>

        {/* Slider 2: Ts Ambient Temp */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-600">อุณหภูมิสิ่งแวดล้อม (T<sub>s</sub>)</span>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {ambientTemp} °C
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-bold">0</span>
            <input
              type="range"
              min="0"
              max="40"
              value={ambientTemp}
              disabled={isRunning}
              onChange={(e) => setAmbientTemp(Number(e.target.value))}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500 bg-slate-100 ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            <span className="text-[10px] text-slate-400 font-bold">40</span>
          </div>
        </div>

        {/* Slider 3: k Cooling Constant */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-600">ค่าคงที่การเย็นตัว (k)</span>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                {coolingConstant.toFixed(3)} /นาที
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-bold">0.001</span>
            <input
              type="range"
              min="0.001"
              max="1.000"
              step="0.005"
              value={coolingConstant}
              disabled={isRunning}
              onChange={(e) => setCoolingConstant(Number(e.target.value))}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-purple-600 bg-slate-100 ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            <span className="text-[10px] text-slate-400 font-bold">1.000</span>
          </div>
        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-2 gap-3.5 pt-2">
          
          {/* Dropdown 1: Log Interval */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide text-left block">
              ช่วงบันทึกข้อมูล
            </label>
            <div className="relative">
              <select
                value={logInterval}
                disabled={isRunning}
                onChange={(e) => setLogInterval(Number(e.target.value))}
                className="w-full pl-3 pr-8 py-2 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value={10}>10 วินาที</option>
                <option value={30}>30 วินาที</option>
                <option value={60}>1 นาที</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Dropdown 2: Sim Speed */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide text-left block">
              ความเร็วการจำลอง
            </label>
            <div className="relative">
              <select
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="w-full pl-3 pr-8 py-2 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={0.5}>0.5x ช้า</option>
                <option value={1}>1x (ปกติ)</option>
                <option value={2}>2x เร็ว</option>
                <option value={5}>5x เร็วมาก</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

        </div>

      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-3.5 mt-6">
        
        {/* Toggle Play / Pause */}
        <button
          onClick={onStartStop}
          className={`
            col-span-2 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2
            transition-all duration-300 transform hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md
            ${
              isRunning
                ? "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200/50 shadow-none"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/10"
            }
          `}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-slate-700 stroke-none" />
              <span>หยุดชั่วคราว</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white stroke-none" />
              <span>เริ่ม</span>
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>รีเซ็ต</span>
        </button>

        {/* Save/Submit Button */}
        <button
          onClick={onSave}
          className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 transform hover:scale-[1.01] shadow-md shadow-emerald-500/10 active:scale-95 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>บันทึกผล</span>
        </button>

      </div>

    </div>
  );
}
