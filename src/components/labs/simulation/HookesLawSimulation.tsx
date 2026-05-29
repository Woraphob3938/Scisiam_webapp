"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/labs/Breadcrumb";
import DecorativeBackground from "@/components/labs/DecorativeBackground";
import { Sparkles, Play, Pause, RefreshCw, Sliders, Plus, Trash, Download, Clipboard, Weight } from "lucide-react";

export interface HookesDataPoint {
  index: number;
  mass: number;      // grams
  force: number;     // N (mass * g / 1000)
  extension: number; // m
}

export default function HookesLawSimulation() {
  const router = useRouter();

  // Spring constant k (N/m)
  const [springConstant, setSpringConstant] = useState(50.0); // 10–200 N/m
  // Hanging mass (grams)
  const [hangingMass, setHangingMass] = useState(100); // 0–500 g

  // Derived
  const gravity = 9.81;
  const force = (hangingMass / 1000) * gravity; // N
  const extension = force / springConstant;       // m

  // Simulation loop
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<HookesDataPoint[]>([]);

  // Quest tracker: achieve extension between 0.02m and 0.04m for 15 seconds
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  // Refs
  const isRunningRef = useRef(isRunning);
  const elapsedRef = useRef(elapsedSeconds);
  const extensionRef = useRef(extension);
  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { extensionRef.current = extension; }, [extension]);
  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Main tick loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        const delta = 0.1;
        const nextTime = elapsedRef.current + delta;
        setElapsedSeconds(nextTime);
        elapsedRef.current = nextTime;

        // Quest: maintain extension between 0.02m and 0.04m for 15s
        const ext = extensionRef.current;
        if (ext >= 0.02 && ext <= 0.04) {
          const nextProg = Math.min(15, questProgressRef.current + delta);
          setQuestProgress(nextProg);
          questProgressRef.current = nextProg;

          if (nextProg >= 15 && !questSuccessRef.current) {
            setQuestSuccess(true);
            questSuccessRef.current = true;
            const pts = Number(localStorage.getItem("scisiam_points") || "120");
            localStorage.setItem("scisiam_points", String(pts + 25));
            window.dispatchEvent(new Event("points-updated"));
            alert("🎉 ยินดีด้วย! คุณรักษาระยะยืดสปริงให้อยู่ระหว่าง 0.02 m – 0.04 m ต่อเนื่อง 15 วินาทีสำเร็จ! รับ +25 แต้ม 💎");
          }
        } else {
          setQuestProgress(0);
          questProgressRef.current = 0;
        }
      }, 100);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isRunning]);

  const handleStartStop = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setHangingMass(100);
    setSpringConstant(50);
    setQuestProgress(0);
    setDataPoints([]);
  };

  const handleAddPoint = () => {
    setDataPoints((prev) => [
      ...prev,
      { index: prev.length + 1, mass: hangingMass, force: parseFloat(force.toFixed(3)), extension: parseFloat(extension.toFixed(4)) },
    ]);
  };

  const handleClearPoint = (idx: number) => {
    setDataPoints((prev) => prev.filter((p) => p.index !== idx).map((p, i) => ({ ...p, index: i + 1 })));
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) { alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!"); return; }
    const headers = "จุดวัด,มวล (g),แรง (N),ระยะยืด (m)\n";
    const rows = dataPoints.map((p) => `${p.index},${p.mass},${p.force.toFixed(3)},${p.extension.toFixed(4)}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scisiam_hookes_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyData = () => {
    if (dataPoints.length === 0) { alert("ไม่มีข้อมูลบันทึกสำหรับการคัดลอก!"); return; }
    const content = dataPoints
      .map((p) => `จุดที่ ${p.index} | มวล: ${p.mass}g | แรง: ${p.force.toFixed(3)}N | ระยะยืด: ${p.extension.toFixed(4)}m`)
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"));
  };

  const handleSaveResults = () => {
    if (dataPoints.length === 0) { alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล!"); return; }
    const experimentData = {
      labId: "hookes-law",
      timestamp: new Date().toLocaleString("th-TH"),
      springConstant,
      dataPoints,
    };
    localStorage.setItem("scisiam_saved_hookes_experiment", JSON.stringify(experimentData));
    const pts = Number(localStorage.getItem("scisiam_points") || "120");
    localStorage.setItem("scisiam_points", String(pts + 25));
    window.dispatchEvent(new Event("points-updated"));
    alert("บันทึกข้อมูลการทดลอง (กราฟแรง-ระยะยืดและตารางผล) สำเร็จ! 🎉");
    router.push("/labs/hookes-law");
  };

  // SVG Spring drawing helpers
  const springRestLength = 60;
  const springPixelsPerMeter = 800; // how many px per 1m extension
  const springExtPx = Math.min(extension * springPixelsPerMeter, 120);
  const totalSpringLength = springRestLength + springExtPx;

  // Generate spring coil path
  const springPath = useMemo(() => {
    const coils = 8;
    const amplitude = 12;
    const segLen = totalSpringLength / coils;
    let d = `M 150 20`;
    for (let i = 0; i < coils; i++) {
      const y1 = 20 + i * segLen + segLen * 0.25;
      const y2 = 20 + i * segLen + segLen * 0.75;
      const yEnd = 20 + (i + 1) * segLen;
      d += ` L ${150 - amplitude} ${y1} L ${150 + amplitude} ${y2} L 150 ${yEnd}`;
    }
    return d;
  }, [totalSpringLength]);

  const massBlockY = 20 + totalSpringLength;

  // Chart coord helpers: Force (Y 0–10N) vs Extension (X 0–0.2m)
  const xCoord = (ext: number) => 30 + (ext / 0.2) * 150;
  const yCoord = (f: number) => 100 - (f / 10) * 85;

  const linePath = useMemo(() => {
    if (dataPoints.length === 0) return "";
    const sorted = [...dataPoints].sort((a, b) => a.extension - b.extension);
    return sorted.map((p, idx) => `${idx === 0 ? "M" : "L"}${xCoord(p.extension)},${yCoord(p.force)}`).join(" ");
  }, [dataPoints]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-16 overflow-hidden">
      <DecorativeBackground />
      <Navbar />

      {/* Breadcrumb */}
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 md:px-20 pt-6 pb-2 select-none">
        <Breadcrumb category="Physics" title="Hooke's Law of Elasticity / ห้องทดลองจำลอง" />
      </div>

      {/* Hero Header */}
      <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-12 md:px-20 pt-3 select-none relative z-10">
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase bg-violet-50 text-violet-600 px-2.5 py-1 rounded-md border border-violet-100/50">
                PHYSICS SIMULATOR
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="text-xs font-bold text-slate-400">ACTIVE ROOM</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-wide mt-2">
              ห้องปฏิบัติการจำลองสปริงและความยืดหยุ่น (Hooke&apos;s Law)
            </h1>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 shrink-0 self-start md:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-600 leading-normal">
              สถานะ: ระบบจำลองแบบ Interactive พร้อมทำงาน
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-12 md:px-20 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Area (75%) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Viewport and controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Spring Viewport */}
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-5 flex flex-col justify-between relative overflow-hidden min-h-[300px] shadow-lg shadow-slate-950/20 select-none">
                <div className="flex justify-between items-center z-10">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                    <span className={`w-2 h-2 rounded-full ${hangingMass > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                    <span className="text-[10px] font-extrabold text-slate-300 uppercase">
                      {hangingMass > 0 ? "Spring Loaded" : "No Load"}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 tracking-wider">HUD CONSOLE v1.0</span>
                </div>

                <div className="flex-1 flex items-center justify-center py-4">
                  <svg className="w-full max-w-[280px] h-56" viewBox="0 0 300 220">
                    {/* Retort stand */}
                    <rect x="140" y="5" width="20" height="15" rx="3" fill="#64748b" />
                    <line x1="100" y1="20" x2="200" y2="20" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                    <rect x="146" y="20" width="8" height="195" rx="2" fill="#475569" />
                    <rect x="120" y="210" width="60" height="8" rx="3" fill="#64748b" />

                    {/* Spring coil path */}
                    <path d={springPath} stroke="#a78bfa" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Mass block */}
                    <rect x="130" y={massBlockY} width="40" height="28" rx="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                    <text x="150" y={massBlockY + 18} fill="#92400e" fontSize="10" fontWeight="900" textAnchor="middle">{hangingMass}g</text>

                    {/* Extension measurement arrow */}
                    <line x1="200" y1={20 + springRestLength} x2="200" y2={massBlockY} stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" />
                    <text x="220" y={(20 + springRestLength + massBlockY) / 2 + 3} fill="#22d3ee" fontSize="8" fontWeight="bold">x = {(extension * 100).toFixed(2)} cm</text>

                    {/* Force arrow */}
                    {hangingMass > 0 && (
                      <>
                        <line x1="110" y1={massBlockY + 28} x2="110" y2={massBlockY + 28 + Math.min(force * 8, 40)} stroke="#f43f5e" strokeWidth="2" />
                        <polygon points={`105,${massBlockY + 28 + Math.min(force * 8, 40)} 115,${massBlockY + 28 + Math.min(force * 8, 40)} 110,${massBlockY + 33 + Math.min(force * 8, 40)}`} fill="#f43f5e" />
                        <text x="90" y={massBlockY + 38 + Math.min(force * 8, 40)} fill="#f43f5e" fontSize="8" fontWeight="bold" textAnchor="middle">F = {force.toFixed(2)}N</text>
                      </>
                    )}

                    {/* Ruler marks along the side */}
                    {[0, 2, 4, 6, 8, 10].map((cm) => (
                      <g key={cm}>
                        <line x1="235" y1={20 + springRestLength + cm * 8} x2="245" y2={20 + springRestLength + cm * 8} stroke="#475569" strokeWidth="1" />
                        <text x="250" y={20 + springRestLength + cm * 8 + 3} fill="#64748b" fontSize="6" fontWeight="bold">{cm}cm</text>
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold border-t border-slate-900 pt-3">
                  <span>RUN TIME: {elapsedSeconds.toFixed(1)}s</span>
                  <span className="text-violet-400">EXT: {(extension * 100).toFixed(2)} cm | F: {force.toFixed(2)} N</span>
                </div>
              </div>

              {/* Control Panel */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-5 flex flex-col justify-between gap-5 shadow-xs">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 select-none">
                    <Sliders className="w-5 h-5 text-violet-500" />
                    แผงควบคุมสปริงจำลอง (Spring Controls)
                  </h3>

                  <div className="space-y-4 mt-4">
                    {/* Spring Constant */}
                    <div className="group bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-violet-500" />
                          ค่าคงที่สปริง (k)
                        </span>
                        <span className="text-violet-600 font-extrabold text-xs bg-violet-50 px-2.5 py-0.5 rounded border border-violet-100">
                          {springConstant.toFixed(0)} N/m
                        </span>
                      </div>
                      <input
                        type="range" min="10" max="200" step="5" value={springConstant}
                        onChange={(e) => setSpringConstant(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                      <div className="flex items-center gap-1.5 mt-2">
                        {[-20, -5, 5, 20].map((val) => (
                          <button key={val} onClick={() => setSpringConstant((prev) => Math.max(10, Math.min(200, prev + val)))}
                            className="flex-1 py-1 text-[10px] font-black text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition active:scale-95">
                            {val > 0 ? `+${val}` : `${val}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hanging Mass */}
                    <div className="group bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <Weight className="w-4 h-4 text-amber-500" />
                          มวลที่แขวน (Mass)
                        </span>
                        <span className="text-amber-600 font-extrabold text-xs bg-amber-50 px-2.5 py-0.5 rounded border border-amber-100">
                          {hangingMass} g
                        </span>
                      </div>
                      <input
                        type="range" min="0" max="500" step="10" value={hangingMass}
                        onChange={(e) => setHangingMass(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="flex items-center gap-1.5 mt-2">
                        {[-50, -10, 10, 50].map((val) => (
                          <button key={val} onClick={() => setHangingMass((prev) => Math.max(0, Math.min(500, prev + val)))}
                            className="flex-1 py-1 text-[10px] font-black text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition active:scale-95">
                            {val > 0 ? `+${val}g` : `${val}g`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Readout */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 grid grid-cols-2 gap-3 select-none">
                      <div className="text-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">แรง (F)</span>
                        <span className="text-sm font-black text-rose-600">{force.toFixed(3)} N</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">ระยะยืด (x)</span>
                        <span className="text-sm font-black text-emerald-600">{(extension * 100).toFixed(2)} cm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-3">
                    <button onClick={handleStartStop}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs ${
                        isRunning 
                          ? "bg-amber-500 text-white border border-amber-600 shadow-amber-500/10" 
                          : "bg-violet-600 text-white border border-violet-700 shadow-violet-500/10"
                      }`}>
                      {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isRunning ? "พักการจำลอง (Pause)" : "เริ่มการจำลอง (Start)"}</span>
                    </button>
                    <button onClick={handleAddPoint}
                      className="py-2.5 px-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold hover:bg-emerald-100 transition cursor-pointer active:scale-95 flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      <span>บันทึกจุดวัด</span>
                    </button>
                  </div>
                  <button onClick={handleReset}
                    className="w-full py-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>รีเซ็ตค่าเครื่องมือ (Reset)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Table & Live Graph & Formula */}
            <div className="flex flex-col gap-6">
              
              {/* Log Data Table */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 select-none">
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-800">ตารางบันทึกผลการทดลอง</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      จุดวัดพารามิเตอร์มวล แรง และระยะยืด เพื่อใช้พล็อตกราฟหาค่าคงที่สปริง
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCopyData} className="p-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer active:scale-95" title="คัดลอกตาราง">
                      <Clipboard className="w-4 h-4" />
                    </button>
                    <button onClick={handleExportCSV} className="p-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer active:scale-95" title="ส่งออก CSV">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto select-text">
                  <table className="w-full text-left border-collapse min-w-[400px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold text-[10px] sm:text-xs">
                        <th className="py-2.5 px-4 w-16">จุดวัด</th>
                        <th className="py-2.5 px-4">มวล (Mass, g)</th>
                        <th className="py-2.5 px-4">แรง (Force, N)</th>
                        <th className="py-2.5 px-4">ระยะยืด (Extension, m)</th>
                        <th className="py-2.5 px-4 w-12 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] sm:text-xs font-bold text-slate-600">
                      {dataPoints.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 select-none">
                            ไม่มีข้อมูลผลการทดลองที่บันทึกไว้ในตาราง
                          </td>
                        </tr>
                      ) : (
                        dataPoints.map((p) => (
                          <tr key={p.index} className="hover:bg-slate-50/50 transition">
                            <td className="py-2 px-4 font-mono">#{p.index}</td>
                            <td className="py-2 px-4 font-mono text-amber-600">{p.mass} g</td>
                            <td className="py-2 px-4 font-mono text-rose-600">{p.force.toFixed(3)} N</td>
                            <td className="py-2 px-4 font-mono text-emerald-600">{p.extension.toFixed(4)} m</td>
                            <td className="py-2 px-4 text-center">
                              <button onClick={() => handleClearPoint(p.index)}
                                className="text-red-500 hover:text-red-700 cursor-pointer p-1 rounded hover:bg-red-50">
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Scatter Graph F vs x */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs">
                <div className="border-b border-slate-100 pb-3 mb-4 select-none">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800">
                    กราฟผลการทดลองตามกฎของฮุค (F-x Curve)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    กราฟแสดงแรง (F) ในหน่วยนิวตัน บนแกน Y เทียบกับระยะยืด (x) บนแกน X
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl select-none relative overflow-hidden">
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold border-b border-slate-900 pb-1.5 mb-2">
                    <span>LIVE RELATION SCATTER GRAPH</span>
                    <span className="text-violet-400">กฎของฮุค: F = kx</span>
                  </div>
                  <svg className="w-full h-48" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Grid */}
                    <line x1="30" y1="15" x2="180" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="30" y1="36.25" x2="180" y2="36.25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="30" y1="57.5" x2="180" y2="57.5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="30" y1="78.75" x2="180" y2="78.75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                    {/* Y-axis */}
                    <text x="27" y="17.5" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">10 N</text>
                    <text x="27" y="38.75" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">7.5 N</text>
                    <text x="27" y="60" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">5 N</text>
                    <text x="27" y="81.25" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">2.5 N</text>

                    {/* Data line */}
                    {linePath && (
                      <path d={linePath} stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    )}

                    {/* Data point circles */}
                    {dataPoints.map((p) => (
                      <circle key={p.index} cx={xCoord(p.extension)} cy={yCoord(p.force)} r="2.5" fill="#a78bfa" stroke="#ffffff" strokeWidth="0.75" />
                    ))}

                    {/* Live operating indicator */}
                    {hangingMass > 0 && (
                      <circle cx={xCoord(extension)} cy={yCoord(force)} r="3.5" fill="#ef4444" className="animate-ping" />
                    )}

                    {/* Axes */}
                    <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    <text x="30" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0</text>
                    <text x="67.5" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.05</text>
                    <text x="105" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.10</text>
                    <text x="142.5" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.15</text>
                    <text x="180" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.20</text>
                    <text x="195" y="108" fill="#94a3b8" fontSize="6" fontWeight="bold">ระยะยืด (m)</text>
                  </svg>
                </div>
              </div>

              {/* Formula Card */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs select-none text-left">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                  สูตรความสัมพันธ์ทางฟิสิกส์ (Physical Formula)
                </h3>
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">สมการตามกฎของฮุค</span>
                    <div className="text-2xl font-mono font-bold text-slate-800">F = kx</div>
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-semibold space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-indigo-600">F</span>
                      <span>= แรงที่กระทำต่อสปริง (N)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-rose-600">k</span>
                      <span>= ค่าคงที่สปริง (N/m)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-emerald-600">x</span>
                      <span>= ระยะยืดจากตำแหน่งสมดุล (m)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar (25%) */}
          <div className="lg:col-span-3 select-none">
            <div className="bg-white rounded-3xl border border-slate-200/60 p-5 space-y-5">
              
              {/* Quest Section */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-12 h-12 bg-violet-500/5 rounded-bl-full" />
                <h3 className="text-xs sm:text-sm font-extrabold text-violet-950 flex items-center gap-2 border-b border-violet-100/60 pb-2 mb-3">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  ภารกิจจำลอง
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed text-left" style={{ lineHeight: 1.5 }}>
                  ปรับค่ามวลและค่าคงที่สปริงเพื่อให้ระยะยืดอยู่ระหว่าง <strong>2 cm ถึง 4 cm</strong> ต่อเนื่องเป็นเวลา 15 วินาที
                </p>
                <div className="space-y-2 mt-4">
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${(questProgress / 15) * 100}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400">PROGRESS</span>
                    <span className="text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
                      {questProgress.toFixed(1)} / 15.0 วินาที
                    </span>
                  </div>
                </div>
                {questSuccess && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-bold p-2.5 rounded-xl text-center">
                    🎉 ภารกิจสำเร็จแล้ว! คุณได้รับ +25 คะแนน
                  </div>
                )}
              </div>

              {/* Lab tips */}
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 mb-3 text-left">คำแนะนำข้อเสนอแนะ</h3>
                <ul className="space-y-2.5 text-left text-[11px] sm:text-xs text-slate-400 font-semibold leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0 mt-1.5" />
                    <span>ค่อย ๆ เพิ่มมวลทีละขั้นเพื่อดูกราฟเส้นตรงที่ชัดเจน</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0 mt-1.5" />
                    <span>ทดลองเปลี่ยนค่า k เพื่อศึกษาผลกระทบต่อความชัน (Slope) ของเส้นกราฟ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0 mt-1.5" />
                    <span>ระวังอย่าใส่มวลมากเกินจนเกิดขีดจำกัดสภาพยืดหยุ่น</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
