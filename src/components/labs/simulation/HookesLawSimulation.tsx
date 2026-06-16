"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Trash,
  Download,
  Clipboard,
  Weight,
  TrendingDown,
  ClipboardList,
  Target,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

export interface HookesDataPoint {
  index: number;
  mass: number;      // grams
  force: number;     // N (mass * g / 1000)
  extension: number; // m
}

function HookesGraph({
  dataPoints,
  extension,
  force,
  hangingMass,
}: {
  dataPoints: HookesDataPoint[];
  extension: number;
  force: number;
  hangingMass: number;
}) {
  const xCoord = (ext: number) => 30 + (ext / 0.2) * 150;
  const yCoord = (f: number) => 100 - (f / 10) * 85;

  const currentLinePath = useMemo(() => {
    if (dataPoints.length === 0) return "";
    const sorted = [...dataPoints].sort((a, b) => a.extension - b.extension);
    return sorted.map((p, idx) => `${idx === 0 ? "M" : "L"}${xCoord(p.extension)},${yCoord(p.force)}`).join(" ");
  }, [dataPoints]);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <TrendingDown className="h-4.5 w-4.5 text-violet-600" />
          กราฟแรงกับระยะยืด (F-x Curve)
        </h3>
        <span className="text-[10px] font-bold text-violet-600">F = kx</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-950 p-3 flex flex-col justify-between">
        <svg className="w-full h-full min-h-[174px]" viewBox="0 0 200 120" fill="none">
          {/* Grid lines */}
          <line x1="30" y1="15" x2="180" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="36.25" x2="180" y2="36.25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="57.5" x2="180" y2="57.5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="78.75" x2="180" y2="78.75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Y-axis metrics */}
          <text x="27" y="17.5" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">10 N</text>
          <text x="27" y="38.75" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">7.5 N</text>
          <text x="27" y="60" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">5 N</text>
          <text x="27" y="81.25" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">2.5 N</text>

          {/* Line path */}
          {currentLinePath && (
            <path d={currentLinePath} stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          )}

          {/* Logged points circles */}
          {dataPoints.map((p) => (
            <circle
              key={p.index}
              cx={xCoord(p.extension)}
              cy={yCoord(p.force)}
              r="2.5"
              fill="#c084fc"
              stroke="#ffffff"
              strokeWidth="0.75"
            />
          ))}

          {/* Live operating indicator circle */}
          {hangingMass > 0 && (
            <circle
              cx={xCoord(extension)}
              cy={yCoord(force)}
              r="3.5"
              fill="#ef4444"
            />
          )}

          {/* Axes lines */}
          <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          
          {/* X-axis metrics */}
          <text x="30" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0</text>
          <text x="67.5" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.05</text>
          <text x="105" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.10</text>
          <text x="142.5" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.15</text>
          <text x="180" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.20</text>
          <text x="195" y="108" fill="#94a3b8" fontSize="6" fontWeight="bold">m</text>
        </svg>
      </div>
    </section>
  );
}

function ResultsTable({
  dataPoints,
  onClearPoint,
  onCopyData,
  onExportCSV,
}: {
  dataPoints: HookesDataPoint[];
  onClearPoint: (idx: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-violet-600" />
          ตารางบันทึกผล
        </h3>
        <div className="flex gap-2">
          <button onClick={onCopyData} className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <Clipboard className="w-3.5 h-3.5" />
          </button>
          <button onClick={onExportCSV} className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-violet-50/70 text-[11px] font-black text-violet-800">
            <tr>
              <th className="px-3 py-2">จุดวัด</th>
              <th className="px-3 py-2">มวล (g)</th>
              <th className="px-3 py-2">แรง (N)</th>
              <th className="px-3 py-2">ระยะยืด (m)</th>
              <th className="px-3 py-2 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {dataPoints.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">ไม่มีข้อมูลบันทึก</td>
              </tr>
            ) : (
              dataPoints.map((point) => (
                <tr key={point.index} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2 font-mono">#{point.index}</td>
                  <td className="px-3 py-2 font-mono text-amber-600">{point.mass} g</td>
                  <td className="px-3 py-2 font-mono text-rose-600">{point.force.toFixed(3)} N</td>
                  <td className="px-3 py-2 font-mono text-violet-600">{point.extension.toFixed(4)} m</td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => onClearPoint(point.index)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TheoryPanel({
  springConstant,
  force,
  extension,
}: {
  springConstant: number;
  force: number;
  extension: number;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Sliders className="h-4.5 w-4.5 text-violet-600" />
        ทฤษฎีและสมการ
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-center text-xl font-black text-slate-800 font-mono">
          F = kx
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500">
          ระยะยืด (x) ของสปริงจะเป็นสัดส่วนโดยตรงกับแรงดึง (F) ที่กระทำต่อสปริง โดยมี k เป็นค่าคงตัวของสปริง
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">แรง F: <b className="text-rose-700">{force.toFixed(3)} N</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">ระยะยืด x: <b className="text-emerald-700">{(extension * 100).toFixed(2)} cm</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">ค่าคงที่ k: <b className="text-violet-700">{springConstant.toFixed(0)} N/m</b></span>
        </div>
      </div>
    </section>
  );
}

function SpringScene({
  springPath,
  hangingMass,
  massBlockY,
  extension,
  force,
}: {
  springPath: string;
  hangingMass: number;
  massBlockY: number;
  extension: number;
  force: number;
}) {
  return (
    <div className="relative flex h-full min-h-[258px] items-center justify-center overflow-hidden rounded-2xl border border-violet-100 bg-[linear-gradient(135deg,#fcfaff_0%,#f5f0ff_48%,#fdfcff_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/75 px-3 py-2 text-left shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-violet-600">spring load status</p>
        <p className="mt-0.5 text-xs font-bold text-slate-600">
          {hangingMass > 0 ? "Spring Loaded" : "No Load"}
        </p>
      </div>

      <svg className="relative z-10 w-full max-w-[280px] h-56" viewBox="0 0 300 220">
        <defs>
          {/* Metallic stand gradients */}
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="30%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="standBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          
          {/* Spring gradient (3D effect) */}
          <linearGradient id="springGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>
          
          {/* Mass block gradient */}
          <linearGradient id="massGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Professional shadow */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1.5" dy="3" stdDeviation="2.5" floodColor="#1e1b4b" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Retort stand base & bars */}
        <rect x="140" y="5" width="20" height="15" rx="3" fill="url(#standBaseGrad)" />
        <line x1="100" y1="20" x2="200" y2="20" stroke="url(#metalGrad)" strokeWidth="3" strokeLinecap="round" />
        <rect x="146" y="20" width="8" height="195" rx="2" fill="url(#metalGrad)" />
        <rect x="120" y="210" width="60" height="8" rx="3" fill="url(#standBaseGrad)" />

        {/* Spring coil path */}
        <path d={springPath} stroke="url(#springGrad)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Mass block with drop shadow */}
        {hangingMass > 0 && (
          <g filter="url(#dropShadow)" className="transition-opacity duration-300">
            <rect x="130" y={massBlockY} width="40" height="28" rx="5" fill="url(#massGrad)" stroke="#78350f" strokeWidth="1" />
            <text x="150" y={massBlockY + 18} fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">{hangingMass}g</text>
          </g>
        )}

        {/* Extension measurement arrow (Cyan indicators) */}
        <line x1="200" y1={20 + 60} x2="200" y2={massBlockY} stroke="#0891b2" strokeWidth="1" strokeDasharray="3 2" />
        <text x="215" y={(20 + 60 + massBlockY) / 2 + 3} fill="#0891b2" fontSize="7.5" fontWeight="900">x = {(extension * 100).toFixed(2)} cm</text>

        {/* Force arrow (Red indicators) */}
        {hangingMass > 0 && (
          <g className="transition-opacity duration-300">
            <line x1="110" y1={massBlockY + 28} x2="110" y2={massBlockY + 28 + Math.min(force * 8, 40)} stroke="#e11d48" strokeWidth="2.2" strokeLinecap="round" />
            <polygon points={`106,${massBlockY + 28 + Math.min(force * 8, 40)} 114,${massBlockY + 28 + Math.min(force * 8, 40)} 110,${massBlockY + 34 + Math.min(force * 8, 40)}`} fill="#e11d48" />
            <text x="92" y={massBlockY + 36 + Math.min(force * 8, 40)} fill="#e11d48" fontSize="7.5" fontWeight="900" textAnchor="middle">F = {force.toFixed(2)}N</text>
          </g>
        )}

        {/* Ruler marks along the side */}
        {[0, 2, 4, 6, 8, 10].map((cm) => (
          <g key={cm}>
            <line x1="235" y1={20 + 60 + cm * 8} x2="242" y2={20 + 60 + cm * 8} stroke="#475569" strokeWidth="1" />
            <text x="248" y={20 + 60 + cm * 8 + 2.5} fill="#64748b" fontSize="6.5" fontWeight="900">{cm}cm</text>
          </g>
        ))}
      </svg>
    </div>
  );
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

  // State to hold animated extension (Damped Harmonic Oscillation)
  const [animatedExtension, setAnimatedExtension] = useState(extension);

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
  
  // Physics Refs
  const velocityRef = useRef(0);
  const animatedExtensionRef = useRef(extension);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { extensionRef.current = extension; }, [extension]);
  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Spring Damped Harmonic Oscillation loop
  useEffect(() => {
    let animationFrameId: number;
    
    const updateSpringPhysics = () => {
      const targetExtension = extension;
      const k = springConstant;
      const m = Math.max(0.05, hangingMass / 1000); // mass in kg (min 50g to avoid infinite frequency)
      const g = 9.81;

      // Force calculations
      const fGravity = (hangingMass === 0) ? 0 : m * g;
      const fSpring = -k * animatedExtensionRef.current;
      
      // Underdamped calculation (zeta = 0.15 is pleasant bounce)
      const criticalDamping = 2 * Math.sqrt(k * m);
      const dampingCoefficient = criticalDamping * 0.15;
      const fDamping = -dampingCoefficient * velocityRef.current;

      const fNet = fGravity + fSpring + fDamping;
      const acceleration = fNet / m;

      // Euler integration step (16ms = ~60fps)
      const dt = 0.016;
      velocityRef.current += acceleration * dt;
      animatedExtensionRef.current += velocityRef.current * dt;

      setAnimatedExtension(animatedExtensionRef.current);

      // Continue animating if not fully settled
      const distance = Math.abs(animatedExtensionRef.current - targetExtension);
      const speed = Math.abs(velocityRef.current);
      if (distance > 0.0001 || speed > 0.001) {
        animationFrameId = requestAnimationFrame(updateSpringPhysics);
      } else {
        animatedExtensionRef.current = targetExtension;
        velocityRef.current = 0;
        setAnimatedExtension(targetExtension);
      }
    };

    animationFrameId = requestAnimationFrame(updateSpringPhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, [extension, springConstant, hangingMass]);

  // Main tick loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        const delta = 0.1;
        const nextTime = elapsedRef.current + delta;
        setElapsedSeconds(nextTime);
        elapsedRef.current = nextTime;

        const ext = extensionRef.current;
        if (ext >= 0.02 && ext <= 0.04) {
          const nextProg = Math.min(15, questProgressRef.current + delta);
          setQuestProgress(nextProg);
          questProgressRef.current = nextProg;

          if (nextProg >= 15 && !questSuccessRef.current) {
            setQuestSuccess(true);
            questSuccessRef.current = true;
            alert("🎉 ยินดีด้วย! คุณรักษาระยะยืดสปริงให้อยู่ระหว่าง 0.02 m – 0.04 m ต่อเนื่อง 15 วินาทีสำเร็จ บันทึกผลเพื่อเก็บความคืบหน้า");
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

  const handleSaveResults = async () => {
    if (dataPoints.length === 0) { alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล!"); return; }
    const experimentData = {
      labId: "hookes-law",
      timestamp: new Date().toLocaleString("th-TH"),
      springConstant,
      dataPoints,
    };
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_hookes_experiment",
      localPayload: experimentData,
      labId: "hookes-law",
      title: "Hooke's Law of Elasticity",
      variables: { springConstant, hangingMass },
      liveValues: { force, extension, elapsedSeconds, questProgress, questSuccess },
      graphPoints: dataPoints,
      tableRows: dataPoints,
      summary: {
        springConstant,
        dataPointCount: dataPoints.length,
        finalExtension: extension,
      },
      score: questSuccess ? 100 : Math.min(100, dataPoints.length * 20),
      durationSeconds: Math.round(elapsedSeconds),
    });
    alert("บันทึกข้อมูลการทดลอง (กราฟแรง-ระยะยืดและตารางผล) สำเร็จ! 🎉");
    router.push("/labs/hookes-law");
  };

  // SVG Spring drawing helpers
  const springRestLength = 60;
  const springPixelsPerMeter = 800; // how many px per 1m extension
  const springExtPx = Math.min(animatedExtension * springPixelsPerMeter, 120);
  const totalSpringLength = springRestLength + springExtPx;

  // Generate smooth 3D-looking bezier spring coil path
  const springPath = useMemo(() => {
    const coils = 12;
    const amplitude = 14;
    const segLen = (totalSpringLength - 15) / coils;
    let d = `M 150 20 L 150 30`; // top straight wire hook
    for (let i = 0; i < coils; i++) {
      const yStart = 30 + i * segLen;
      const yMid = yStart + segLen / 2;
      const yEnd = yStart + segLen;
      // Beautiful rounded bezier loops
      d += ` C ${150 - amplitude} ${yStart} ${150 - amplitude} ${yMid} 150 ${yMid}`;
      d += ` C ${150 + amplitude} ${yMid} ${150 + amplitude} ${yEnd} 150 ${yEnd}`;
    }
    d += ` L 150 ${totalSpringLength}`; // bottom straight wire hook
    return d;
  }, [totalSpringLength]);

  const massBlockY = 20 + totalSpringLength;

  const controls = (
    <div className="space-y-4">
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

      {/* Actions */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${isRunning ? "bg-slate-700" : "bg-blue-600 hover:bg-blue-700"}`}>
          {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
          {isRunning ? "หยุดชั่วคราว" : "เริ่มจำลอง"}
        </button>
        <button onClick={handleAddPoint} className="inline-flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xs font-black text-blue-700 hover:bg-blue-100">บันทึกจุด</button>
        <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="รีเซ็ต">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="blue"
      labId="hookes-law"
      category="Physics"
      title="Hooke's Law of Elasticity"
      subtitle="ศึกษาความสัมพันธ์ระหว่างแรงที่กระทำและระยะยืดหยุ่นของสปริงตามกฎของฮุค หาค่าคงที่สปริงเชิงเส้น"
      statusLabel={hangingMass > 0 ? "สปริงมีภาระโหลด" : "พร้อมถ่วงน้ำหนัก"}
      icon={Weight}
      sceneTitle="ห้องควบคุมระบบยืดหยุ่นจำลอง"
      scene={
        <SpringScene
          springPath={springPath}
          hangingMass={hangingMass}
          massBlockY={massBlockY}
          extension={extension}
          force={force}
        />
      }
      controlsTitle="แผงควบคุมสปริง"
      controls={controls}
      metrics={[
        { label: "แรงดึง (F)", value: `${force.toFixed(2)} N`, tone: "rose" },
        { label: "ระยะยืด (x)", value: `${(extension * 100).toFixed(2)} cm`, tone: "emerald" },
        { label: "ค่าคงที่สปริง (k)", value: `${springConstant.toFixed(0)} N/m`, tone: "violet" },
        { label: "มวลแขวน", value: `${hangingMass} g`, tone: "orange" },
      ]}
      graph={
        <HookesGraph
          dataPoints={dataPoints}
          extension={extension}
          force={force}
          hangingMass={hangingMass}
        />
      }
      table={
        <ResultsTable
          dataPoints={dataPoints}
          onClearPoint={handleClearPoint}
          onCopyData={handleCopyData}
          onExportCSV={handleExportCSV}
        />
      }
      theory={
        <TheoryPanel
          springConstant={springConstant}
          force={force}
          extension={extension}
        />
      }
      steps={[
        { label: "ตั้งค่าสปริง", icon: Sliders },
        { label: "เพิ่มน้ำหนัก", icon: Weight },
        { label: "เริ่มวัดค่า", icon: Play },
        { label: "จดบันทึก", icon: ClipboardList },
        { label: "หาค่า k", icon: Target },
      ]}
      learningGoals={[
        "ศึกษาความสัมพันธ์ของแรงกับระยะยืดของสปริง",
        "หาค่าคงที่สปริง (k) จากความชันของกราฟ",
        "เข้าใจคุณสมบัติความยืดหยุ่นและจุดเสียรูปของวัสดุ",
        "ทดลองบันทึกและวิเคราะห์ค่าพารามิเตอร์ตามหลักการทางวิทยาศาสตร์",
      ]}
      progressLabel="ระยะเวลาที่ระยะยืดอยู่ในช่วงภารกิจ"
      progressValue={`${questProgress.toFixed(1)} / 15 วินาที`}
      progressPercent={(questProgress / 15) * 100}
      tips={[
        "ค่อย ๆ เพิ่มมวลทีละขั้นเพื่อดูความยืดหยุ่นเชิงเส้นของสปริง",
        "เปลี่ยนค่าคงที่สปริง (k) เพื่อดูการเปลี่ยนแปลงความแข็งแรงของสปริง",
        "ความชันของกราฟแรงกับระยะยืด (F-x) จะมีค่าเท่ากับค่า k เสมอ",
        "ระวังอย่าแขวนมวลน้ำหนักเกินขีดจำกัดยืดหยุ่นของสปริง",
      ]}
      onSave={handleSaveResults}
    />
  );
}
