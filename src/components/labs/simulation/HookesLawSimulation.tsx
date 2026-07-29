"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
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
  // Slotted weights stacking logic
  const renderWeights = () => {
    if (hangingMass <= 0) return null;
    const weightsCount = Math.floor(hangingMass / 100);
    const remainder = hangingMass % 100;
    const list = [];

    // Bottom of the spring hook is massBlockY. The hanger vertical rod extends from massBlockY.
    // Flange is at massBlockY + 42. Weights stack upwards from y = massBlockY + 42.
    let currentY = massBlockY + 42;

    for (let i = 0; i < weightsCount; i++) {
      currentY -= 6.5; // height of block (6px) + spacing (0.5px)
      list.push(
        <g key={`w-${i}`} filter="url(#dropShadow)">
          {/* Slotted weight disc */}
          <rect x="157" y={currentY} width="36" height="6" rx="1.5" fill="url(#massGrad)" stroke="#78350f" strokeWidth="1" />
          {/* Center slot indicator */}
          <rect x="173" y={currentY} width="4" height="6" fill="#1e293b" opacity="0.35" />
          {/* Label */}
          <text x="175" y={currentY + 5} fill="#78350f" fontSize="4.5" fontWeight="950" textAnchor="middle">100g</text>
        </g>
      );
    }

    if (remainder > 0) {
      const remHeight = Math.max(2, (remainder / 100) * 6);
      currentY -= (remHeight + 0.5);
      list.push(
        <g key="w-rem" filter="url(#dropShadow)">
          <rect x="160" y={currentY} width="30" height={remHeight} rx="1" fill="url(#massGrad)" stroke="#78350f" strokeWidth="0.75" />
          <rect x="174" y={currentY} width="2" height={remHeight} fill="#1e293b" opacity="0.35" />
          <text x="175" y={currentY + remHeight - 1.5} fill="#78350f" fontSize="4" fontWeight="950" textAnchor="middle">{remainder}g</text>
        </g>
      );
    }
    return list;
  };

  return (
    <div className="relative flex h-full min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eefcff_48%,#fff7fb_100%)] p-4">
      {/* Tech grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      {/* Ambient glows */}
      <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-violet-500/5 blur-[80px]" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-500/5 blur-[80px]" />

      <div className="absolute left-5 top-5 rounded-xl border border-slate-200 bg-white/75 px-3 py-1.5 text-left shadow-sm backdrop-blur-md">
        <p className="text-[9px] font-black uppercase tracking-wider text-violet-600">spring elastic stage</p>
        <p className="mt-0.5 text-xs font-black text-slate-700">
          {hangingMass > 0 ? "สปริงมีภาระน้ำหนัก" : "สปริงสมดุล (ไร้แรงถ่วง)"}
        </p>
      </div>

      <svg className="relative z-10 w-full max-w-[280px] h-56 select-none" viewBox="0 0 300 220">
        <defs>
          {/* Metallic stand gradients */}
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="25%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="85%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="standBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Spring gradient (Metallic Purple) */}
          <linearGradient id="springGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="35%" stopColor="#c084fc" />
            <stop offset="70%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>

          {/* Laboratory Brass Weight disc gradient */}
          <linearGradient id="massGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="75%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Professional shadow */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1.5" dy="4" stdDeviation="2.5" floodColor="#020617" floodOpacity="0.4" />
          </filter>
          <filter id="laserGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Retort stand base & bars */}
        {/* Vertical steel rod (moved to left x = 100) */}
        <rect x="96" y="20" width="8" height="185" rx="1.5" fill="url(#metalGrad)" />
        {/* Horizontal steel arm extending to spring holder (y = 25) */}
        <line x1="90" y1="25" x2="185" y2="25" stroke="url(#metalGrad)" strokeWidth="4.5" strokeLinecap="round" />
        {/* Joint clamp holding horizontal arm to vertical rod */}
        <rect x="93" y="20" width="14" height="10" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        {/* Bottom heavy stand base */}
        <rect x="70" y="202" width="60" height="10" rx="3" fill="url(#standBaseGrad)" filter="url(#dropShadow)" />

        {/* Hook connecting spring to horizontals rod */}
        <path d="M 175 25 L 175 35" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Spring coil path (centered at x = 175) */}
        <path d={springPath} stroke="url(#springGrad)" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Slotted Weight Hanger Hook */}
        <g stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round">
          {/* Top Hook loop */}
          <path d={`M 175 ${massBlockY} L 175 ${massBlockY + 12}`} />
          {/* Center rod */}
          <line x1="175" y1={massBlockY + 12} x2="175" y2={massBlockY + 42} />
          {/* Bottom support plate flange */}
          <rect x="160" y={massBlockY + 41} width="30" height="2.5" fill="#334155" stroke="none" rx="0.5" />
        </g>

        {/* Slotted weights stack */}
        {renderWeights()}

        {/* Ruler Base (wood/metal style on right) */}
        <rect x="220" y="70" width="22" height="142" fill="url(#metalGrad)" stroke="#475569" strokeWidth="1" filter="url(#dropShadow)" />
        <rect x="222" y="72" width="18" height="138" fill="#f8fafc" rx="1" />
        <text x="231" y="80" fill="#94a3b8" fontSize="4.5" fontWeight="black" textAnchor="middle">cm</text>
        {/* Ruler Ticks every cm (0 to 15cm) */}
        {Array.from({ length: 16 }).map((_, cm) => (
          <g key={cm}>
            <line
              x1="222"
              y1={86 + cm * 8}
              x2={cm % 5 === 0 ? 232 : cm % 2 === 0 ? 228 : 226}
              y2={86 + cm * 8}
              stroke="#334155"
              strokeWidth={cm % 5 === 0 ? 1 : 0.5}
            />
            {cm % 5 === 0 && (
              <text x="235" y={86 + cm * 8 + 2} fill="#334155" fontSize="5.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{cm}</text>
            )}
          </g>
        ))}

        {/* Slide pointer needle attached to spring bottom */}
        <line x1="175" y1={massBlockY} x2="220" y2={massBlockY} stroke="#0891b2" strokeWidth="1.2" strokeDasharray="2 1.5" opacity="0.9" />
        <polygon points={`220,${massBlockY} 215,${massBlockY - 3.5} 215,${massBlockY + 3.5}`} fill="#0891b2" filter="url(#laserGlow)" />

        {/* Extension digital overlay text */}
        <rect x="188" y={massBlockY - 14} width="28" height="10" rx="3" fill="#ffffff" stroke="#0891b2" strokeWidth="0.8" opacity="0.9" />
        <text x="202" y={massBlockY - 6.5} fill="#0891b2" fontSize="5.5" fontWeight="black" fontFamily="monospace" textAnchor="middle">
          {(extension * 100).toFixed(2)}
        </text>

        {/* Force Gravity Vector Arrow (Red) pulling down */}
        {hangingMass > 0 && (
          <g className="transition-opacity duration-300">
            <line
              x1="175"
              y1={massBlockY + 44}
              x2="175"
              y2={massBlockY + 44 + Math.min(force * 7, 30)}
              stroke="#f43f5e"
              strokeWidth="2.2"
              strokeLinecap="round"
              filter="url(#laserGlow)"
            />
            <polygon
              points={`171,${massBlockY + 44 + Math.min(force * 7, 30)} 179,${massBlockY + 44 + Math.min(force * 7, 30)} 175,${massBlockY + 49 + Math.min(force * 7, 30)}`}
              fill="#f43f5e"
              filter="url(#laserGlow)"
            />
            <text
              x="175"
              y={massBlockY + 59 + Math.min(force * 7, 30)}
              fill="#e11d48"
              fontSize="7.5"
              fontWeight="black"
              fontFamily="monospace"
              textAnchor="middle"
            >
              F_g={force.toFixed(2)}N
            </text>
          </g>
        )}

        {/* Spring Restoring Force Vector Arrow (Purple) pulling up */}
        {hangingMass > 0 && (
          <g className="transition-opacity duration-300">
            <line
              x1="175"
              y1={massBlockY}
              x2="175"
              y2={massBlockY - Math.min(force * 7, 30)}
              stroke="#a855f7"
              strokeWidth="2.2"
              strokeLinecap="round"
              filter="url(#laserGlow)"
            />
            <polygon
              points={`171,${massBlockY - Math.min(force * 7, 30)} 179,${massBlockY - Math.min(force * 7, 30)} 175,${massBlockY - 5 - Math.min(force * 7, 30)}`}
              fill="#a855f7"
              filter="url(#laserGlow)"
            />
            <text
              x="175"
              y={massBlockY - 10 - Math.min(force * 7, 30)}
              fill="#7c3aed"
              fontSize="7.5"
              fontWeight="black"
              fontFamily="monospace"
              textAnchor="middle"
            >
              F_s=-kx
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function HookesLawSimulation() {

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
    const currentPoint: HookesDataPoint = {
      index: dataPoints.length + 1,
      mass: hangingMass,
      force: parseFloat(force.toFixed(3)),
      extension: parseFloat(extension.toFixed(4)),
    };
    const pointsToSave = [...dataPoints, currentPoint].slice(-20);
    setDataPoints(pointsToSave);
    const experimentData = {
      labId: "hookes-law",
      timestamp: new Date().toLocaleString("th-TH"),
      springConstant,
      dataPoints: pointsToSave,
    };
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_hookes_experiment",
      localPayload: experimentData,
      labId: "hookes-law",
      title: "Hooke's Law of Elasticity",
      variables: { springConstant, hangingMass },
      liveValues: { force, extension, elapsedSeconds, questProgress, questSuccess },
      graphPoints: pointsToSave,
      tableRows: pointsToSave,
      summary: {
        springConstant,
        dataPointCount: pointsToSave.length,
        finalExtension: extension,
      },
      score: questSuccess ? 100 : Math.min(100, pointsToSave.length * 20),
      durationSeconds: Math.round(elapsedSeconds),
    });
  };

  // SVG Spring drawing helpers
  const springRestLength = 60;
  const springPixelsPerMeter = 800; // how many px per 1m extension
  const springExtPx = Math.min(animatedExtension * springPixelsPerMeter, 120);
  const totalSpringLength = springRestLength + springExtPx;

  // Define massBlockY first because springPath depends on it to connect directly.
  // massBlockY is 26 + totalSpringLength. At rest (totalSpringLength = 60), it is 86, aligning perfectly with tick 0 on ruler.
  const massBlockY = 26 + totalSpringLength;

  // Generate smooth 3D-looking bezier spring coil path ending directly at massBlockY (hanger top)
  const springPath = useMemo(() => {
    const coils = 12;
    const amplitude = 12;
    const startY = 35;
    const endY = massBlockY - 10;
    const segLen = (endY - startY) / coils;
    let d = `M 175 25 L 175 ${startY}`;
    for (let i = 0; i < coils; i++) {
      const yStart = startY + i * segLen;
      const yMid = yStart + segLen / 2;
      const yEnd = yStart + segLen;
      d += ` C ${175 - amplitude} ${yStart} ${175 - amplitude} ${yMid} 175 ${yMid}`;
      d += ` C ${175 + amplitude} ${yMid} ${175 + amplitude} ${yEnd} 175 ${yEnd}`;
    }
    d += ` L 175 ${massBlockY}`; // straight hook directly to massBlockY
    return d;
  }, [massBlockY]);

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
      compactControls={
        <div className="grid grid-cols-2 gap-2">
          <label className="rounded-xl bg-slate-50 p-2 text-xs font-black text-slate-700">
            <span className="mb-1 flex justify-between"><span>ค่าคงที่สปริง</span><span>{springConstant.toFixed(0)} N/m</span></span>
            <input aria-label="ค่าคงที่สปริง" type="range" min="10" max="200" step="5" value={springConstant} onChange={(event) => setSpringConstant(Number(event.target.value))} className="w-full accent-violet-500" />
          </label>
          <label className="rounded-xl bg-slate-50 p-2 text-xs font-black text-slate-700">
            <span className="mb-1 flex justify-between"><span>มวลแขวน</span><span>{hangingMass} g</span></span>
            <input aria-label="มวลแขวน" type="range" min="0" max="500" step="10" value={hangingMass} onChange={(event) => setHangingMass(Number(event.target.value))} className="w-full accent-amber-500" />
          </label>
        </div>
      }
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
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดชั่วคราว" : "ทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}

