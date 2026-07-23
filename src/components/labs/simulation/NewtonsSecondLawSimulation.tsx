"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Play,
  RotateCcw,
  Ruler,
  Save,
  Sliders,
  Target,
  Zap,
} from "lucide-react";

interface MotionPoint {
  mass: number;
  force: number;
  acceleration: number;
  t1: number;
  t2: number;
}

function MotionTrackScene({
  mass,
  acceleration,
  elapsedTime,
}: {
  mass: number;
  acceleration: number;
  elapsedTime: number;
}) {
  // Physical parameters
  const trackLength = 2.0; // meters
  
  // Calculate physical position x = 0.5 * a * t^2
  const physicalX = Math.min(trackLength, 0.5 * acceleration * elapsedTime * elapsedTime);
  
  // Map physicalX (0 to 2.0m) to SVG X (60 to 420px)
  const cartX = 60 + (physicalX / trackLength) * 360;

  // Photogates X positions (Gate A at 0.5m = 150px, Gate B at 1.5m = 330px)
  const gateAX = 60 + (0.5 / trackLength) * 360;
  const gateBX = 60 + (1.5 / trackLength) * 360;

  // Check if cart passed photogates
  const passedGateA = physicalX >= 0.5;
  const passedGateB = physicalX >= 1.5;

  return (
    <div className="relative flex h-full min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-violet-100 bg-[linear-gradient(135deg,#fcfaff_0%,#f5f3ff_48%,#f8fafc_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-left shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-violet-600">dynamics system</p>
        <p className="mt-0.5 text-xs font-bold text-slate-600">F = ma acceleration</p>
      </div>

      <svg className="relative z-10 h-full max-h-[360px] w-full max-w-[560px]" viewBox="0 0 560 360" fill="none" aria-hidden="true">
        {/* Track / Rail (Horizontal wood rail) */}
        <rect x="40" y="220" width="440" height="20" rx="2" fill="#d97706" stroke="#b45309" strokeWidth="2.5" />
        {/* Ruler ticks on track */}
        {Array.from({ length: 21 }).map((_, i) => (
          <line
            key={i}
            x1={60 + i * 18}
            y1="220"
            x2={60 + i * 18}
            y2={i % 5 === 0 ? "232" : "226"}
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        ))}

        {/* Pulley wheel at right edge (480, 220) */}
        <circle cx="480" cy="220" r="14" fill="#64748b" stroke="#334155" strokeWidth="2" />
        <circle cx="480" cy="220" r="4" fill="#ffffff" />

        {/* String from Cart to hanging mass */}
        {/* String horizontal part */}
        <line x1={cartX + 60} y1="195" x2="480" y2="206" stroke="#334155" strokeWidth="1.5" />
        {/* String vertical part */}
        <line x1="494" y1="220" x2="494" y2="270" stroke="#334155" strokeWidth="1.5" />

        {/* Hanging mass */}
        <rect x="484" y="270" width="20" height="24" rx="2" fill="#475569" stroke="#334155" strokeWidth="1.5" />
        <text x="494" y="286" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">F</text>

        {/* Photogate A (Gate 1) bracket */}
        <g transform={`translate(${gateAX - 8}, 160)`}>
          <rect x="0" y="0" width="16" height="60" rx="3" fill="#334155" opacity="0.85" />
          <circle cx="8" cy="12" r="5" fill={passedGateA ? "#22c55e" : "#ef4444"} />
          <text x="8" y="44" fill="#ffffff" fontSize="8" fontWeight="950" textAnchor="middle">A</text>
        </g>

        {/* Photogate B (Gate 2) bracket */}
        <g transform={`translate(${gateBX - 8}, 160)`}>
          <rect x="0" y="0" width="16" height="60" rx="3" fill="#334155" opacity="0.85" />
          <circle cx="8" cy="12" r="5" fill={passedGateB ? "#22c55e" : "#ef4444"} />
          <text x="8" y="44" fill="#ffffff" fontSize="8" fontWeight="950" textAnchor="middle">B</text>
        </g>

        {/* Cart on wheels */}
        <g transform={`translate(${cartX}, 175)`}>
          {/* Cart body */}
          <rect x="0" y="0" width="60" height="25" rx="4" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2.5" />
          {/* Load on cart (mass visual block) */}
          <rect x="12" y="-12" width="36" height="12" rx="2" fill="#c084fc" stroke="#6d28d9" strokeWidth="1.5" />
          <text x="30" y="-2" fill="#3f3f46" fontSize="8" fontWeight="900" textAnchor="middle">{mass.toFixed(2)} kg</text>
          
          {/* Wheels */}
          <circle cx="14" cy="30" r="7" fill="#334155" stroke="#1e293b" strokeWidth="2" />
          <circle cx="14" cy="30" r="2.5" fill="#ffffff" />
          <circle cx="46" cy="30" r="7" fill="#334155" stroke="#1e293b" strokeWidth="2" />
          <circle cx="46" cy="30" r="2.5" fill="#ffffff" />
        </g>

        {/* Position indicators */}
        <g transform="translate(60, 68)">
          <rect x="0" y="0" width="105" height="52" rx="18" fill="#ffffff" stroke="#ddd6fe" strokeWidth="3" />
          <text x="52" y="21" fill="#64748b" fontSize="9" fontWeight="900" textAnchor="middle">POSITION</text>
          <text x="52" y="40" fill="#7c3aed" fontSize="17" fontWeight="900" textAnchor="middle">{physicalX.toFixed(2)} m</text>
        </g>

        {/* Speed / Acc indicator */}
        <g transform="translate(395, 68)">
          <rect x="0" y="0" width="105" height="52" rx="18" fill="#ffffff" stroke="#ddd6fe" strokeWidth="3" />
          <text x="52" y="21" fill="#64748b" fontSize="9" fontWeight="900" textAnchor="middle">ACCELERATION</text>
          <text x="52" y="40" fill="#10b981" fontSize="17" fontWeight="900" textAnchor="middle">{acceleration.toFixed(2)} m/s²</text>
        </g>
      </svg>
    </div>
  );
}

function MotionGraph({ points }: { points: MotionPoint[] }) {
  // X: Force (0 to 10 N) -> 32 to 284 px
  // Y: Acceleration (0 to 10 m/s²) -> 138 to 26 px
  const x = React.useCallback((f: number) => 32 + (f / 10) * 252, []);
  const y = React.useCallback((a: number) => 138 - (a / 10) * 112, []);

  const path = useMemo(() => {
    if (points.length === 0) return "";
    const sorted = [...points].sort((a, b) => a.force - b.force);
    return sorted.map((p, idx) => `${idx === 0 ? "M" : "L"}${x(p.force)},${y(p.acceleration)}`).join(" ");
  }, [points, x, y]);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <BarChart3 className="h-4.5 w-4.5 text-violet-600" />
          กราฟความสัมพันธ์ a - F
        </h3>
        <span className="text-[10px] font-bold text-violet-600">a-F Slope</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-50/70 p-2">
        <svg className="h-full min-h-[174px] w-full" viewBox="0 0 320 170" fill="none" aria-hidden="true">
          <line x1="32" y1="138" x2="284" y2="138" stroke="#cbd5e1" strokeWidth="1.4" />
          <line x1="32" y1="110" x2="284" y2="110" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="82" x2="284" y2="82" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="54" x2="284" y2="54" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="26" x2="284" y2="26" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="22" x2="32" y2="138" stroke="#cbd5e1" strokeWidth="1.4" />

          <text x="26" y="29" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">10.0</text>
          <text x="26" y="85" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">5.0</text>
          <text x="26" y="141" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">0.0</text>

          {path && <path d={path} stroke="#8b5cf6" strokeWidth="2.6" strokeLinecap="round" fill="none" />}

          {points.map((point, index) => (
            <circle
              key={`${point.force}-${index}`}
              cx={x(point.force)}
              cy={y(point.acceleration)}
              r="4.5"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}

          <text x="32" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">0.0N</text>
          <text x="158" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">5.0N</text>
          <text x="284" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">10.0N</text>
          <text x="284" y="130" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">Force (N)</text>
          <text x="35" y="20" fill="#94a3b8" fontSize="7" fontWeight="800">a (m/s²)</text>
        </svg>
      </div>
    </section>
  );
}

export default function NewtonsSecondLawSimulation() {
  const [mass, setMass] = useState(1.0); // 0.5 to 3.0 kg
  const [force, setForce] = useState(2.0); // 1.0 to 10.0 N
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<MotionPoint[]>([]);
  const [questSuccess, setQuestSuccess] = useState(false);

  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const massRef = useRef(mass);
  const forceRef = useRef(force);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { massRef.current = mass; }, [mass]);
  useEffect(() => { forceRef.current = force; }, [force]);

  const acceleration = useMemo(() => force / mass, [force, mass]);

  // Times to cross photogates (Gate A at 0.5m, Gate B at 1.5m)
  const tA = useMemo(() => Math.sqrt((2 * 0.5) / acceleration), [acceleration]);
  const tB = useMemo(() => Math.sqrt((2 * 1.5) / acceleration), [acceleration]);

  // Track ticking loop
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      const deltaSeconds = 0.05;
      const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
      
      setElapsedSeconds(nextSeconds);
      elapsedSecondsRef.current = nextSeconds;

      // Stop cart when it completes the 2.0-meter track
      // x = 0.5 * a * t^2 -> 2.0 = 0.5 * a * t^2 -> t = sqrt(4.0 / a)
      const stopTime = Math.sqrt(4.0 / acceleration);
      if (nextSeconds >= stopTime) {
        setIsRunning(false);
        isRunningRef.current = false;
        
        // Auto-log point on completion
        const point = {
          mass: massRef.current,
          force: forceRef.current,
          acceleration: forceRef.current / massRef.current,
          t1: Math.sqrt((2 * 0.5) / (forceRef.current / massRef.current)),
          t2: Math.sqrt((2 * 1.5) / (forceRef.current / massRef.current)),
        };
        
        setDataPoints((prev) => {
          if (prev.some((p) => p.mass === point.mass && p.force === point.force)) return prev;
          return [...prev, point];
        });
      }
    }, 50);

    return () => clearInterval(timer);
  }, [isRunning, acceleration]);

  const handleStartStop = () => {
    if (elapsedSeconds > 0 && !isRunning) {
      // Re-run from zero
      setElapsedSeconds(0);
      elapsedSecondsRef.current = 0;
    }
    setIsRunning(true);
  };

  const handleLogPoint = () => {
    const point = {
      mass,
      force,
      acceleration,
      t1: tA,
      t2: tB,
    };
    if (dataPoints.some((p) => p.mass === mass && p.force === force)) return;
    setDataPoints((prev) => [...prev, point]);

    // Quest Check: Check if logged point has acceleration equal to 4.0 m/s²
    if (Math.abs(acceleration - 4.0) < 0.05 && !questSuccess) {
      setQuestSuccess(true);
      alert("🎉 ยินดีด้วย! คุณตั้งค่าให้มีความเร่ง a = 4.0 m/s² สำเร็จ บันทึกผลเพื่อเก็บความคืบหน้า");
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setMass(1.0);
    setForce(2.0);
    setDataPoints([]);
  };

  const handleSave = async () => {
    if (dataPoints.length === 0) {
      alert("ยังไม่มีข้อมูลการทดลองกฎข้อสองของนิวตันสำหรับบันทึก กรุณากดบันทึกจุดวัดก่อน");
      return;
    }

    const experimentData = {
      labId: "newtons-second-law",
      timestamp: new Date().toLocaleString("th-TH"),
      mass,
      force,
      acceleration,
      dataPoints: dataPoints.map((p) => ({
        mass: p.mass,
        force: p.force,
        acceleration: p.acceleration,
        time: p.t2, // total time through Gate B
      })),
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_newtons_second_experiment",
      localPayload: experimentData,
      labId: "newtons-second-law",
      title: "Newton's Second Law of Motion",
      graphPoints: experimentData.dataPoints,
      tableRows: experimentData.dataPoints,
      summary: { dataPointCount: experimentData.dataPoints.length },
      score: Math.min(100, experimentData.dataPoints.length * 20),
    });
    alert("บันทึกผลการทดลองกฎข้อสองของนิวตันสำเร็จ! 🎉");
  };

  const visibleRows = dataPoints.slice(-7);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8fafc] pb-12">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-12 md:px-20">
        <div className="flex flex-col gap-5">
          {/* Banner Details */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <section className="space-y-5 lg:col-span-9">
              <div className="relative flex min-h-[164px] items-center overflow-hidden rounded-2xl border border-violet-100 bg-white px-5 py-6 shadow-sm shadow-slate-200/50 sm:px-7">
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white">
                      <Ruler className="h-4.5 w-4.5" />
                    </div>
                    <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[11px] font-black text-violet-700">Physics</span>
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">พร้อมทดลองพลศาสตร์</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-normal text-slate-900">Newton&apos;s Second Law of Motion Simulator</h1>
                  <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
                    ศึกษาความเร่งของรถเข็นที่ปรับมวลและแรงขับเคลื่อน ดักวัดเวลาด้วยโฟโตเกต A และ B และทดสอบกฎ F = ma
                  </p>
                </div>
              </div>

              {/* Main Workspace Layout */}
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                {/* Apparatus Canvas */}
                <div className="xl:col-span-7">
                  <div className="min-h-[460px] rounded-2xl border border-violet-100 bg-white p-4 shadow-sm shadow-slate-200/50">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-sm font-black text-slate-800">
                        <Ruler className="h-4.5 w-4.5 text-violet-600" />
                        รางไม้วัดความเร่งพลศาสตร์
                      </h2>
                      <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-black text-violet-700">
                        a = {acceleration.toFixed(2)} m/s²
                      </span>
                    </div>
                    <MotionTrackScene
                      mass={mass}
                      acceleration={acceleration}
                      elapsedTime={elapsedSeconds}
                    />
                  </div>
                </div>

                {/* Control Panel */}
                <div className="xl:col-span-5">
                  <section className="flex min-h-[460px] flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/50">
                    <h2 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
                      <Sliders className="h-4.5 w-4.5 text-violet-600" />
                      แผงควบคุมมวลและแรงขับ
                    </h2>
                    <div className="flex-1 space-y-4">
                      {/* Mass Slider */}
                      <label className="block">
                        <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                          <span>มวลรถเข็น (m)</span>
                          <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">
                            {mass.toFixed(2)} kg
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.50"
                          max="3.00"
                          step="0.10"
                          value={mass}
                          disabled={isRunning}
                          onChange={(e) => setMass(Number(e.target.value))}
                          className="h-1.5 w-full rounded-full bg-slate-100 accent-violet-600 disabled:opacity-45"
                        />
                      </label>

                      {/* Force Slider */}
                      <label className="block">
                        <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                          <span>แรงลากจูง (F)</span>
                          <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">
                            {force.toFixed(1)} N
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="10.0"
                          step="0.5"
                          value={force}
                          disabled={isRunning}
                          onChange={(e) => setForce(Number(e.target.value))}
                          className="h-1.5 w-full rounded-full bg-slate-100 accent-rose-500 disabled:opacity-45"
                        />
                      </label>

                      {/* Photogate Readings */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                          <span className="block text-[10px] text-slate-400">เวลา Gate A (0.5m)</span>
                          <strong className="text-sm font-black text-slate-800">
                            {tA.toFixed(3)} วินาที
                          </strong>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                          <span className="block text-[10px] text-slate-400">เวลา Gate B (1.5m)</span>
                          <strong className="text-sm font-black text-slate-800">
                            {tB.toFixed(3)} วินาที
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      <button onClick={handleStartStop} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-xs font-black text-white hover:bg-violet-750 shadow-sm">
                        <Play className="h-4 w-4 fill-white stroke-none" />
                        ปล่อยรถวิ่ง
                      </button>
                      <button onClick={handleLogPoint} className="inline-flex items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-xs font-black text-violet-700 hover:bg-violet-100">บันทึกจุด</button>
                      <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="รีเซ็ต">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button onClick={handleSave} className="col-span-4 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-xs font-black text-white hover:bg-green-700">
                        <Save className="h-4 w-4" />
                        บันทึกผลการทดลองกฎข้อนิวตัน
                      </button>
                    </div>
                  </section>
                </div>
              </div>

              {/* Data Table, Graph & Theory */}
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <MotionGraph points={dataPoints} />
                </div>

                <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 xl:col-span-4">
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                      <ClipboardList className="h-4.5 w-4.5 text-violet-600" />
                      ตารางบันทึกผลรางไม้
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">{dataPoints.length} จุด</span>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-violet-50/60 text-[11px] font-black text-violet-800">
                        <tr>
                          <th className="px-3 py-2">F (N)</th>
                          <th className="px-3 py-2">m (kg)</th>
                          <th className="px-3 py-2">a (m/s²)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                        {visibleRows.map((point, index) => (
                          <tr key={`${point.force}-${index}`}>
                            <td className="px-3 py-2 font-mono">{point.force.toFixed(1)} N</td>
                            <td className="px-3 py-2 font-mono text-violet-750">{point.mass.toFixed(2)} kg</td>
                            <td className="px-3 py-2 font-mono text-emerald-700">{point.acceleration.toFixed(2)} m/s²</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 xl:col-span-4">
                  <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
                    <Zap className="h-4.5 w-4.5 text-violet-600" />
                    ทฤษฎีความเร่งนิวตัน
                  </h3>
                  <div className="flex flex-1 flex-col justify-between gap-3">
                    <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4 text-center font-mono text-2xl font-black text-slate-800">
                      F = ma
                    </div>
                    <p className="text-xs font-semibold leading-relaxed text-slate-500 leading-relaxed leading-[1.6]">
                      เมื่อมีแรงลัพธ์ที่ไม่เป็นศูนย์มากระทำต่อวัตถุ วัตถุจะเกิดความเร่ง โดยความเร่งจะแปรผันตรงกับขนาดของแรงลัพธ์ และแปรผกผันกับมวลของวัตถุนั้น
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">F: <b className="text-rose-700">{force.toFixed(1)} N</b></span>
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">m: <b className="text-violet-750">{mass.toFixed(2)} kg</b></span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Steps */}
              <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["กำหนดมวลรถเข็น m", Sliders],
                  ["เลือกแรงขับลากดึง F", Sliders],
                  ["ปล่อยรถให้เริ่มวิ่ง", Play],
                  ["ดักความเร็วด้วยเซนเซอร์ A, B", Ruler],
                  ["วิเคราะห์สัดส่วน F = ma", Target],
                ].map(([label, Icon], index) => {
                  const StepIcon = Icon as typeof Sliders;
                  return (
                    <div key={label as string} className="flex items-center gap-3 rounded-xl bg-slate-50/70 px-3 py-2">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <StepIcon className="h-5 w-5" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">{index + 1}</span>
                      </div>
                      <span className="text-xs font-black leading-relaxed text-slate-700">{label as string}</span>
                    </div>
                  );
                })}
              </section>
            </section>

            {/* Sidebar Column */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-3">
              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <Target className="h-4.5 w-4.5 text-blue-600" />
                  เป้าหมายการเรียนรู้
                </h2>
                <ul className="space-y-2.5 text-xs font-semibold leading-relaxed text-slate-500 leading-[1.6]">
                  {["พิสูจน์สัดส่วนตรงระหว่างแรงและความเร่ง", "ศึกษาผลของการเพิ่มมวลต่ออัตราความเร่ง", "ฝึกคำนวณความเร่งและเวลาตามหลักการเคลื่อนที่แนวดิ่ง", "ตีความค่าความชันจากกราฟแสดงผล a-F"].map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Quest section */}
              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                  <Zap className="h-4.5 w-4.5 text-orange-500" />
                  ภารกิจความเร่งลอยตัว
                </h2>
                <p className="text-xs font-semibold text-slate-500 leading-[1.6]">
                  ตั้งค่าตัวแปรมวล (m) และแรงลาก (F) เพื่อให้รถมีความเร่งลัพธ์เท่ากับ 4.00 m/s² พอดิบพอดี (เช่น แรง 4.0 N มวล 1.0 kg) จากนั้นกดปุ่ม &quot;บันทึกจุด&quot; เพื่อทำภารกิจให้สำเร็จ
                </p>
                {questSuccess ? (
                  <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-100 p-2 text-center text-xs font-bold text-emerald-700">
                    สำเร็จภารกิจความเร่งแล้ว
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 p-2 text-center text-xs font-bold text-amber-700">
                    ความเร่งปัจจุบัน: {acceleration.toFixed(2)} m/s²
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  คำแนะนำในการทดลอง
                </h2>
                <ul className="space-y-2 text-xs font-semibold leading-relaxed text-slate-500 leading-[1.6]">
                  {["การเพิ่มมวลทำให้รถวิ่งช้าลงเมื่อได้รับแรงเท่ากัน", "เมื่อปล่อยรถเคลื่อนที่ เวลา Gate B จะมีค่าเป็น sqrt(3) เท่าของ Gate A เสมอ", "ลองพล็อตความสัมพันธ์ระหว่างแรงและความเร่งเพื่อคำนวณหามวลกลับ"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
