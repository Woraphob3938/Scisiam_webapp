"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ClipboardList,
  Trash,
  Download,
  Clipboard,
  Target,
  Globe,
  Star,
  Activity
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

// Types
export interface KeplerDataPoint {
  index: number;
  semiMajorAxis: number; // a (AU)
  eccentricity: number; // e
  orbitalPeriod: number; // T (years)
  aCubed: number; // a^3
  tSquared: number; // T^2
  ratio: number; // T^2/a^3
}

// Solve Kepler's Equation: M = E - e * sin(E)
const solveKeplerEquation = (m: number, e: number): number => {
  let eccentricAnomaly = m;
  // Use Newton's method for root finding
  for (let i = 0; i < 6; i++) {
    eccentricAnomaly = eccentricAnomaly - (eccentricAnomaly - e * Math.sin(eccentricAnomaly) - m) / (1 - e * Math.cos(eccentricAnomaly));
  }
  return eccentricAnomaly;
};

// Generates high-res coordinates for the orbit ellipse to draw paths
const generateOrbitPath = (a: number, e: number, pointsCount = 100): string => {
  const points: string[] = [];
  const scale = 22; // 1 AU = 22 pixels
  const aPx = a * scale;
  const bPx = a * Math.sqrt(1 - e * e) * scale;
  const cPx = a * e * scale; // focus distance

  // Focus is at (150, 80). Center of ellipse is shifted by -cPx along X
  const centerX = 150 - cPx;
  const centerY = 80;

  for (let i = 0; i <= pointsCount; i++) {
    const E = (i * 2 * Math.PI) / pointsCount;
    const x = centerX + aPx * Math.cos(E);
    const y = centerY + bPx * Math.sin(E);
    points.push(`${i === 0 ? "M" : "L"}${x},${y}`);
  }
  return points.join(" ") + " Z";
};

// Generates a wedge polygon path representing a sector swept in a given time slice (mean anomaly interval)
const generateSectorPath = (a: number, e: number, mStart: number, mEnd: number): string => {
  const scale = 22;
  const aPx = a * scale;
  const bPx = a * Math.sqrt(1 - e * e) * scale;
  const cPx = a * e * scale;
  const centerX = 150 - cPx;
  const centerY = 80;

  const points: string[] = ["150,80"]; // Start at Sun (Focus 1)

  // Use 15 subdivisions for a smooth boundary curve
  const steps = 15;
  for (let i = 0; i <= steps; i++) {
    const M = mStart + (i / steps) * (mEnd - mStart);
    const E = solveKeplerEquation(M, e);
    const x = centerX + aPx * Math.cos(E);
    const y = centerY + bPx * Math.sin(E);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return `M ${points.join(" L ")} Z`;
};

function OrbitViewport({
  semiMajorAxis,
  eccentricity,
  speedMultiplier,
  isRunning,
  meanAnomaly,
  setMeanAnomaly,
  showSectors
}: {
  semiMajorAxis: number;
  eccentricity: number;
  speedMultiplier: number;
  isRunning: boolean;
  meanAnomaly: number;
  setMeanAnomaly: React.Dispatch<React.SetStateAction<number>>;
  showSectors: boolean;
}) {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Period T = a^(1.5)
  const period = Math.pow(semiMajorAxis, 1.5);

  // Loop simulation tick
  useEffect(() => {
    const tick = (time: number) => {
      if (previousTimeRef.current !== null && isRunning) {
        const deltaTime = (time - previousTimeRef.current) / 1000; // in seconds
        
        // Let's define the base orbital speed: at a = 1.0 AU and speedMultiplier = 1.0x,
        // one orbit takes 10 seconds of wall time.
        // Therefore, mean anomaly rate (rad/s) is 2pi / (10 * period)
        const dM = (2 * Math.PI * speedMultiplier * deltaTime) / (10 * period);
        setMeanAnomaly(prev => (prev + dM) % (2 * Math.PI));
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, speedMultiplier, period, setMeanAnomaly]);

  // Calculate coordinates of the planet
  const eccentricAnomaly = useMemo(() => {
    return solveKeplerEquation(meanAnomaly, eccentricity);
  }, [meanAnomaly, eccentricity]);

  const scale = 22; // 1 AU = 22 pixels
  const aPx = semiMajorAxis * scale;
  const bPx = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity) * scale;
  const cPx = semiMajorAxis * eccentricity * scale;
  
  const centerX = 150 - cPx;
  const centerY = 80;

  const planetX = centerX + aPx * Math.cos(eccentricAnomaly);
  const planetY = centerY + bPx * Math.sin(eccentricAnomaly);

  // Calculate instantaneous distance from the Sun
  const distance = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));
  // Vis-viva equation: v^2 = G*M*(2/r - 1/a). Relative velocity factor:
  const relativeVelocity = Math.sqrt(2 / distance - 1 / semiMajorAxis);

  // Static pre-calculated equal time sectors sweeps
  // We place them at different orbital phases: Perihelion sweep (near x max) and Aphelion sweep (near x min)
  const sectors = useMemo(() => {
    const sweepSize = Math.PI / 4; // 45 degrees of mean anomaly (equal time duration)
    return [
      { id: "peri", start: -sweepSize / 2, end: sweepSize / 2, color: "rgba(16, 185, 129, 0.22)" }, // Near Perihelion
      { id: "mid", start: Math.PI / 2 - sweepSize / 2, end: Math.PI / 2 + sweepSize / 2, color: "rgba(59, 130, 246, 0.18)" },
      { id: "aphe", start: Math.PI - sweepSize / 2, end: Math.PI + sweepSize / 2, color: "rgba(239, 68, 68, 0.22)" }, // Near Aphelion
    ];
  }, []);

  const orbitPath = useMemo(() => {
    return generateOrbitPath(semiMajorAxis, eccentricity);
  }, [semiMajorAxis, eccentricity]);

  return (
    <div className="relative flex h-full min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#030712_0%,#0f172a_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />
      
      <div className="absolute left-5 top-5 flex flex-col gap-1 rounded-xl border border-white/5 bg-black/50 px-3 py-1.5 text-left shadow-md backdrop-blur-md">
        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Simulation View</span>
        <span className="text-[10px] font-bold text-slate-300">Equal areas in equal times</span>
      </div>

      <svg className="relative z-10 w-full max-w-[340px] h-48" viewBox="0 0 300 160">
        {/* Draw swept sectors if enabled */}
        {showSectors && sectors.map(sec => (
          <path
            key={sec.id}
            d={generateSectorPath(semiMajorAxis, eccentricity, sec.start, sec.end)}
            fill={sec.color}
            stroke="none"
          />
        ))}

        {/* Orbit Path Ellipse */}
        <path d={orbitPath} fill="none" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1.5" strokeDasharray="3,3" />

        {/* Major & Minor Axis lines */}
        <line x1={centerX - aPx} y1={centerY} x2={centerX + aPx} y2={centerY} stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
        <line x1={centerX} y1={centerY - bPx} x2={centerX} y2={centerY + bPx} stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />

        {/* The Sun (at Focus 1) */}
        <circle cx="150" cy="80" r="10" fill="#f59e0b" className="animate-pulse" />
        <circle cx="150" cy="80" r="16" fill="url(#sunGlow)" opacity="0.4" />
        <text x="150" y="65" fill="#f59e0b" fontSize="6.5" fontWeight="black" textAnchor="middle">SUN</text>

        {/* Second Focus (Empty) */}
        <circle cx={centerX - cPx} cy={80} r="2.5" fill="rgba(255, 255, 255, 0.25)" />
        <text x={centerX - cPx} y="92" fill="rgba(255,255,255,0.3)" fontSize="5.5" textAnchor="middle">Focus 2</text>

        {/* Velocity Vector Arrow */}
        {isRunning && (
          <line
            x1={planetX}
            y1={planetY}
            x2={planetX - (relativeVelocity * 10 * (planetY - centerY)) / distance}
            y2={planetY + (relativeVelocity * 10 * (planetX - centerX + cPx)) / distance}
            stroke="#ef4444"
            strokeWidth="1.5"
            markerEnd="url(#arrow)"
          />
        )}

        {/* The Orbiting Planet */}
        <circle cx={planetX} cy={planetY} r="5" fill="#10b981" />
        <circle cx={planetX} cy={planetY} r="9" fill="url(#planetGlow)" opacity="0.35" />
        <text x={planetX} y={planetY - 11} fill="#10b981" fontSize="7" fontWeight="bold" textAnchor="middle">
          v: {relativeVelocity.toFixed(2)}
        </text>

        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="planetGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </radialGradient>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function KeplerGraph({ dataPoints }: { dataPoints: KeplerDataPoint[] }) {
  // Map x: a^3 (0..220) to SVG x: 30..180
  const xCoord = (a3: number) => 30 + (a3 / 220) * 150;
  // Map y: T^2 (0..220) to SVG y: 100..20
  const yCoord = (t2: number) => 100 - (t2 / 220) * 80;

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <Activity className="h-4.5 w-4.5 text-blue-600" />
          กราฟ T² กับ a³ (Linear Ratio)
        </h3>
        <span className="text-[10px] font-bold text-blue-600">T² / a³ = 1.0</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-950 p-3 flex flex-col justify-between">
        <svg className="w-full h-full min-h-[174px]" viewBox="0 0 200 120" fill="none">
          {/* Grid lines */}
          <line x1="30" y1="20" x2="180" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="40" x2="180" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="60" x2="180" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="80" x2="180" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Theoretical line y = x */}
          <line x1={xCoord(0)} y1={yCoord(0)} x2={xCoord(220)} y2={yCoord(220)} stroke="#2563eb" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />

          {/* Y Axis labels */}
          <text x="27" y="22" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">220</text>
          <text x="27" y="62" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">110</text>
          <text x="27" y="102" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0</text>

          {/* Logged points */}
          {dataPoints.map((p, idx) => (
            <circle
              key={idx}
              cx={xCoord(p.aCubed)}
              cy={yCoord(p.tSquared)}
              r="2.5"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="0.5"
            />
          ))}

          {/* Axes */}
          <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <line x1="30" y1="20" x2="30" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

          {/* X Axis labels */}
          <text x="30" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0</text>
          <text x="105" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">110</text>
          <text x="180" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">220</text>
          <text x="192" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="black">a³</text>
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
  dataPoints: KeplerDataPoint[];
  onClearPoint: (idx: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-bold">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-blue-600" />
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
          <thead className="bg-blue-50/70 text-[11px] font-black text-blue-800">
            <tr>
              <th className="px-2 py-2">กึ่งแกนเอก a (AU)</th>
              <th className="px-2 py-2">ความรี e</th>
              <th className="px-2 py-2">คาบ T (ปี)</th>
              <th className="px-2 py-2">T²/a³</th>
              <th className="px-2 py-2 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
            {dataPoints.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">ไม่มีข้อมูลบันทึก</td>
              </tr>
            ) : (
              dataPoints.map((point) => (
                <tr key={point.index} className="hover:bg-slate-50/50">
                  <td className="px-2 py-2 text-blue-600">{point.semiMajorAxis.toFixed(2)} AU</td>
                  <td className="px-2 py-2 text-amber-600">{point.eccentricity.toFixed(2)}</td>
                  <td className="px-2 py-2 text-indigo-600">{point.orbitalPeriod.toFixed(2)} Years</td>
                  <td className="px-2 py-2 text-emerald-600">{point.ratio.toFixed(4)}</td>
                  <td className="px-2 py-2 text-center">
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
  a,
  e,
  t,
  a3,
  t2
}: {
  a: number;
  e: number;
  t: number;
  a3: number;
  t2: number;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Sliders className="h-4.5 w-4.5 text-blue-600" />
        ทฤษฎีและสมการ
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-center text-xl font-black text-slate-800 font-mono">
          T² / a³ = Constant (= 1.0)
        </div>
        <p className="text-[11px] font-semibold leading-relaxed text-slate-500">
          กฎข้อที่สามของเคปเลอร์: คาบการโคจรกำลังสอง (T²) จะแปรผันตรงกับกึ่งแกนเอกกำลังสาม (a³) เสมอ ทำให้อัตราส่วนนี้ในระบบสุริยะมีค่าประมาณ 1.0 เมื่อคาบคิดเป็นปีและกึ่งแกนเอกคิดเป็น AU
        </p>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1">แกนเอก (a): <b className="text-blue-700">{a.toFixed(2)} AU</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">ความรี (e): <b className="text-amber-700">{e.toFixed(2)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">คาบ (T): <b className="text-indigo-700">{t.toFixed(2)} Years</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">อัตราส่วน T²/a³: <b className="text-emerald-700">{(t2 / a3).toFixed(4)}</b></span>
        </div>
      </div>
    </section>
  );
}

export default function KeplersLawsSimulation() {
  const router = useRouter();

  // Primary controls
  const [semiMajorAxis, setSemiMajorAxis] = useState(1.0); // a (0.5 to 6.0 AU)
  const [eccentricity, setEccentricity] = useState(0.1); // e (0.0 to 0.7)
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0); // 0.1 to 5.0
  const [showSectors, setShowSectors] = useState(true);

  // Simulation parameters
  const [isRunning, setIsRunning] = useState(true);
  const [meanAnomaly, setMeanAnomaly] = useState(0.0);

  // Data history
  const [dataPoints, setDataPoints] = useState<KeplerDataPoint[]>([]);

  // Quest status
  const [questSuccess, setQuestSuccess] = useState(false);

  // Compute values
  const orbitalPeriod = useMemo(() => {
    return Math.pow(semiMajorAxis, 1.5);
  }, [semiMajorAxis]);

  const aCubed = useMemo(() => Math.pow(semiMajorAxis, 3), [semiMajorAxis]);
  const tSquared = useMemo(() => Math.pow(orbitalPeriod, 2), [orbitalPeriod]);
  const ratio = useMemo(() => tSquared / aCubed, [tSquared, aCubed]);

  // Check Quest Goal
  // Quest: Set semi-major axis a = 4.0 AU and verify T^2/a^3 = 1.0 (yielding orbital period T = 8.00 Years).
  useEffect(() => {
    if (Math.abs(semiMajorAxis - 4.0) < 0.01 && !questSuccess) {
      const timer = setTimeout(() => {
        setQuestSuccess(true);

        // Award points (+25)
        const currentPoints = Number(localStorage.getItem("scisiam_points") || "120");
        localStorage.setItem("scisiam_points", String(currentPoints + 25));
        window.dispatchEvent(new Event("points-updated"));
        alert("🎉 ภารกิจสำเร็จ! คุณตั้งระยะกึ่งแกนเอกเป็น 4.00 AU ทำให้คาบการโคจรเท่ากับ 8.00 ปีพอดิบพอดี ซึ่งยืนยันความถูกต้องของกฎข้อที่ 3 ของเคปเลอร์ (T²/a³ = 1.0) รับ +25 คะแนน 💎");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [semiMajorAxis, questSuccess]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(true);
    setSemiMajorAxis(1.0);
    setEccentricity(0.1);
    setSpeedMultiplier(1.0);
    setMeanAnomaly(0.0);
    setDataPoints([]);
  };

  const handleAddPoint = () => {
    const newPoint: KeplerDataPoint = {
      index: dataPoints.length + 1,
      semiMajorAxis,
      eccentricity,
      orbitalPeriod,
      aCubed,
      tSquared,
      ratio
    };
    setDataPoints(prev => [...prev, newPoint]);
  };

  const handleClearPoint = (idx: number) => {
    setDataPoints(prev => prev.filter(p => p.index !== idx).map((p, i) => ({ ...p, index: i + 1 })));
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    const headers = "จุดวัด,กึ่งแกนเอก a (AU),ความรี e,คาบการโคจร T (ปี),a^3,T^2,T^2/a^3\n";
    const rows = dataPoints
      .map(p => `${p.index},${p.semiMajorAxis.toFixed(2)},${p.eccentricity.toFixed(2)},${p.orbitalPeriod.toFixed(2)},${p.aCubed.toFixed(2)},${p.tSquared.toFixed(2)},${p.ratio.toFixed(4)}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scisiam_keplers_log.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyData = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการคัดลอก!");
      return;
    }
    const content = dataPoints
      .map(p => `แกนเอก: ${p.semiMajorAxis.toFixed(2)}AU | ความรี: ${p.eccentricity.toFixed(2)} | คาบ: ${p.orbitalPeriod.toFixed(2)}ปี | T²/a³: ${p.ratio.toFixed(4)}`)
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"));
  };

  const handleSaveResults = async () => {
    if (dataPoints.length === 0) {
      alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล! กรุณากดเริ่มทดลองและเก็บบันทึกข้อมูลก่อน");
      return;
    }

    const experimentData = {
      labId: "keplers-laws",
      timestamp: new Date().toLocaleString("th-TH"),
      dataPoints
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_kepler_experiment",
      localPayload: experimentData,
      labId: "keplers-laws",
      title: "Kepler's Third Law of Planetary Motion",
      graphPoints: experimentData.dataPoints,
      tableRows: experimentData.dataPoints,
      summary: { dataPointCount: experimentData.dataPoints.length },
      score: Math.min(100, experimentData.dataPoints.length * 20),
    });

    alert("บันทึกผลการทดลองกฎเคปเลอร์สำเร็จ! 🎉");
    router.push(`/labs/keplers-laws`);
  };

  const controls = (
    <div className="space-y-4">
      {/* Semi-major Axis control */}
      <div className="group bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <div className="flex justify-between items-center text-xs font-bold mb-1">
          <span className="text-slate-600 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            กึ่งแกนเอกกึ่งกลาง (Semi-major Axis a)
          </span>
          <span className="text-blue-600 font-extrabold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            {semiMajorAxis.toFixed(2)} AU
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="6.0"
          step="0.05"
          value={semiMajorAxis}
          onChange={(e) => setSemiMajorAxis(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-1">
          <span>0.5 AU</span>
          <span>Earth (1.0 AU)</span>
          <span>6.0 AU</span>
        </div>
      </div>

      {/* Eccentricity control */}
      <div className="group bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <div className="flex justify-between items-center text-xs font-bold mb-1">
          <span className="text-slate-600 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            ความรีทางโคจร (Eccentricity e)
          </span>
          <span className="text-amber-600 font-extrabold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
            {eccentricity.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.0"
          max="0.7"
          step="0.01"
          value={eccentricity}
          onChange={(e) => setEccentricity(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-1">
          <span>กลมสมบูรณ์ (e=0.0)</span>
          <span>วงรีปานกลาง</span>
          <span>รีสูงมาก (e=0.7)</span>
        </div>
      </div>

      {/* Speed multiplier & Sector toggle */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold text-slate-500">ความเร็วจำลอง</span>
          <select
            value={speedMultiplier}
            onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
          >
            <option value={0.2}>0.2x ช้ามาก</option>
            <option value={0.5}>0.5x ช้า</option>
            <option value={1.0}>1.0x (ปกติ)</option>
            <option value={2.0}>2.0x เร็ว</option>
            <option value={4.0}>4.0x เร็วมาก</option>
          </select>
        </label>
        
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold text-slate-500">แสดงเซกเตอร์กวาดพื้นที่</span>
          <button
            onClick={() => setShowSectors(!showSectors)}
            className={`w-full py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              showSectors 
                ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            {showSectors ? "เปิดกวาดพื้นที่" : "ปิดกวาดพื้นที่"}
          </button>
        </label>
      </div>

      {/* Control buttons */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm transition active:scale-95 cursor-pointer ${isRunning ? "bg-slate-700" : "bg-blue-600 hover:bg-blue-700"}`}>
          {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
          {isRunning ? "หยุดโครจร" : "เริ่มโคจร"}
        </button>
        <button onClick={handleAddPoint} className="inline-flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xs font-black text-blue-700 hover:bg-blue-100 cursor-pointer active:scale-95 transition">บันทึกจุด</button>
        <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95 transition" aria-label="รีเซ็ต">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="emerald"
      labId="keplers-laws"
      category="Physics"
      title="Kepler's Third Law of Planetary Motion"
      subtitle="ศึกษาและพิสูจน์การกวาดพื้นที่ของดาวเคราะห์ที่โคจรรอบดวงอาทิตย์ตามกฎข้อที่ 2 และ 3 ของโยฮันเนส เคปเลอร์"
      statusLabel={isRunning ? "กำลังเคลื่อนที่" : "หยุดจำลอง"}
      icon={Star}
      sceneTitle="วิถีวงโคจรในแนวราบจำลอง"
      scene={
        <OrbitViewport
          semiMajorAxis={semiMajorAxis}
          eccentricity={eccentricity}
          speedMultiplier={speedMultiplier}
          isRunning={isRunning}
          meanAnomaly={meanAnomaly}
          setMeanAnomaly={setMeanAnomaly}
          showSectors={showSectors}
        />
      }
      controlsTitle="แผงกำหนดมิติทางโคจร"
      controls={controls}
      metrics={[
        { label: "คาบโคจร T", value: `${orbitalPeriod.toFixed(2)} ปี`, tone: "emerald" },
        { label: "กำลังสาม a³", value: `${aCubed.toFixed(2)}`, tone: "blue" },
        { label: "กำลังสอง T²", value: `${tSquared.toFixed(2)}`, tone: "violet" },
        { label: "อัตราส่วน T²/a³", value: `${ratio.toFixed(4)}`, tone: "orange" },
      ]}
      graph={<KeplerGraph dataPoints={dataPoints} />}
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
          a={semiMajorAxis}
          e={eccentricity}
          t={orbitalPeriod}
          a3={aCubed}
          t2={tSquared}
        />
      }
      steps={[
        { label: "ระบุความยาวแกนเอก", icon: Sliders },
        { label: "ปรับค่าความรี e", icon: Star },
        { label: "วิเคราะห์คาบ T", icon: Activity },
        { label: "กวาดพื้นที่เซกเตอร์", icon: Target },
        { label: "ตรวจสอบอัตราส่วน", icon: ClipboardList },
      ]}
      learningGoals={[
        "เข้าใจกฎความสัมพันธ์ของคาบและระยะทางทางโคจรของดาวเคราะห์",
        "สังเกตพฤติกรรมการเปลี่ยนความเร็วของดาวที่ใกล้จุดใกล้ที่สุด (Perihelion) และไกลที่สุด (Aphelion)",
        "ศึกษาแนวคิดพื้นที่กวาดในช่วงเวลาเท่ากัน (กฎข้อที่สอง)",
        "ทดลองและวิเคราะห์ความเป็นค่าคงที่ T²/a³ = 1.0",
      ]}
      progressLabel="เป้าหมายภารกิจโคจร 4.0 AU"
      progressValue={questSuccess ? "สำเร็จแล้ว (100%)" : "ตั้งค่ากึ่งแกนเอกเป็น 4.00 AU (0%)"}
      progressPercent={questSuccess ? 100 : 0}
      tips={[
        "ดาวเคราะห์จะกวาดพื้นที่เร็วที่สุดที่จุดใกล้ดวงอาทิตย์มากที่สุด และช้าที่สุดที่จุดไกลที่สุด",
        "ตามกฎข้อ 3 ค่า T²/a³ จะยังคงเป็น 1.0 เสมอ สำหรับดาวเคราะห์ดวงใด ๆ",
        "ภารกิจ: ตั้งค่ากึ่งแกนเอก (Semi-major Axis a) ให้มีค่าเป็น 4.00 AU พอดิบพอดี เพื่อยืนยันว่าได้คาบการโคจร T = 8.00 ปี"
      ]}
      onSave={handleSaveResults}
    />
  );
}
