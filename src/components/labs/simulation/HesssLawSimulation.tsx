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
  Flame,
  TrendingDown,
  ClipboardList,
  Target,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

export interface CalorimetryDataPoint {
  time: number;        // seconds
  temperature: number; // °C
}

export interface HessReactionRun {
  reactionId: 1 | 2 | 3;
  reactionName: string;
  naohMass: number;      // g
  naohMoles: number;     // mol
  solutionVol: number;   // mL
  tempInitial: number;   // °C
  tempFinal: number;     // °C
  deltaTemp: number;     // °C
  enthalpyKJ: number;    // kJ/mol
}

const SPECIFIC_HEAT = 4.184; // J/(g °C)
const MOLAR_MASS_NAOH = 40.0; // g/mol

// Standard literature enthalpies
const DH_REF = {
  1: -101.0, // NaOH(s) + HCl(aq) -> NaCl(aq) + H2O(l) (kJ/mol)
  2: -43.0,  // NaOH(s) + H2O -> NaOH(aq) (kJ/mol)
  3: -58.0,  // NaOH(aq) + HCl(aq) -> NaCl(aq) + H2O(l) (kJ/mol)
};

function EnthalpyGraph({
  livePoints,
  currentTemp,
  currentTime,
}: {
  livePoints: CalorimetryDataPoint[];
  currentTemp: number;
  currentTime: number;
}) {
  const xCoord = (t: number) => 30 + (t / 100) * 150;
  const yCoord = (t: number) => 100 - ((t - 20) / 40) * 85;

  const currentLinePath = useMemo(() => {
    if (livePoints.length === 0) return "";
    return livePoints.map((p, idx) => `${idx === 0 ? "M" : "L"}${xCoord(p.time)},${yCoord(p.temperature)}`).join(" ");
  }, [livePoints]);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <TrendingDown className="h-4.5 w-4.5 text-orange-600" />
          กราฟอุณหภูมิกับเวลา (T-t Curve)
        </h3>
        <span className="text-[10px] font-bold text-orange-600">Calorimetry</span>
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
          <text x="27" y="17.5" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">60 °C</text>
          <text x="27" y="57.5" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">40 °C</text>
          <text x="27" y="100" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">20 °C</text>

          {/* Line path */}
          {currentLinePath && (
            <path d={currentLinePath} stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          )}

          {/* Live operating indicator circle */}
          {currentTime > 0 && (
            <circle
              cx={xCoord(currentTime)}
              cy={yCoord(currentTemp)}
              r="3.5"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="0.75"
            />
          )}

          {/* Axes lines */}
          <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

          {/* X-axis metrics */}
          <text x="30" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0s</text>
          <text x="67.5" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">25s</text>
          <text x="105" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">50s</text>
          <text x="142.5" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">75s</text>
          <text x="180" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">100s</text>
          <text x="195" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold">t</text>
        </svg>
      </div>
    </section>
  );
}

function ResultsTable({
  runs,
  onClearRun,
  onCopyData,
  onExportCSV,
}: {
  runs: HessReactionRun[];
  onClearRun: (reactionId: 1 | 2 | 3) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-orange-600" />
          สรุปปฏิกิริยาของเฮสส์
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
          <thead className="bg-orange-50/70 text-[11px] font-black text-orange-800">
            <tr>
              <th className="px-2.5 py-2">ขั้น</th>
              <th className="px-2.5 py-2">มวล NaOH</th>
              <th className="px-2.5 py-2">Ti (°C)</th>
              <th className="px-2.5 py-2">Tmax (°C)</th>
              <th className="px-2.5 py-2">ΔT (°C)</th>
              <th className="px-2.5 py-2">ΔH (kJ/mol)</th>
              <th className="px-2.5 py-2 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {[1, 2, 3].map((rId) => {
              const run = runs.find((r) => r.reactionId === rId);
              if (!run) {
                return (
                  <tr key={rId} className="opacity-55 bg-slate-50/20">
                    <td className="px-2.5 py-3 font-black text-slate-400">ปฏิกิริยา {rId}</td>
                    <td colSpan={5} className="px-2.5 py-3 text-left text-[11px] font-bold text-slate-400 italic">ยังไม่ทำการทดลองขั้นนี้</td>
                    <td></td>
                  </tr>
                );
              }
              return (
                <tr key={rId} className="hover:bg-slate-50/50">
                  <td className="px-2.5 py-2 font-black text-slate-800">ขั้นที่ {run.reactionId}</td>
                  <td className="px-2.5 py-2 font-mono text-amber-600">{run.naohMass.toFixed(1)} g</td>
                  <td className="px-2.5 py-2 font-mono">{run.tempInitial.toFixed(1)}</td>
                  <td className="px-2.5 py-2 font-mono text-rose-600">{run.tempFinal.toFixed(1)}</td>
                  <td className="px-2.5 py-2 font-mono text-orange-600">+{run.deltaTemp.toFixed(1)}</td>
                  <td className="px-2.5 py-2 font-mono font-black text-rose-600">{run.enthalpyKJ.toFixed(1)}</td>
                  <td className="px-2.5 py-2 text-center">
                    <button onClick={() => onClearRun(run.reactionId)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TheoryPanel({ runs }: { runs: HessReactionRun[] }) {
  const run1 = runs.find((r) => r.reactionId === 1);
  const run2 = runs.find((r) => r.reactionId === 2);
  const run3 = runs.find((r) => r.reactionId === 3);

  const validation = useMemo(() => {
    if (!run1 || !run2 || !run3) return null;
    const direct = run1.enthalpyKJ;
    const indirect = run2.enthalpyKJ + run3.enthalpyKJ;
    const errorPct = Math.abs((direct - indirect) / direct) * 100;
    return {
      direct,
      indirect,
      errorPct,
      valid: errorPct < 7.5,
    };
  }, [run1, run2, run3]);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Sliders className="h-4.5 w-4.5 text-orange-600" />
        พิสูจน์กฎของเฮสส์
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3 text-left">
        <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-2 text-center text-xs font-black text-slate-800 font-mono">
          ΔH1 ≈ ΔH2 + ΔH3
        </div>

        {validation ? (
          <div className="space-y-2 text-[11px] font-bold text-slate-600 bg-emerald-50/40 border border-emerald-100 rounded-xl p-2.5">
            <div className="flex justify-between">
              <span>ΔH₁ (เส้นทางตรง):</span>
              <span className="text-rose-600">{validation.direct.toFixed(1)} kJ/mol</span>
            </div>
            <div className="flex justify-between">
              <span>ΔH₂ + ΔH₃ (เส้นทางอ้อม):</span>
              <span className="text-orange-600">{validation.indirect.toFixed(1)} kJ/mol</span>
            </div>
            <div className="border-t border-emerald-100/60 my-1"></div>
            <div className="flex justify-between">
              <span>ความคลาดเคลื่อนสะสม:</span>
              <span className={validation.valid ? "text-emerald-600" : "text-amber-600"}>
                {validation.errorPct.toFixed(1)}%
              </span>
            </div>
            <p className="text-[10px] font-black text-emerald-700 leading-normal mt-1">
              {validation.valid 
                ? "✓ ผลรวมเอนทัลปียืนยันกฎของเฮสส์ได้อย่างสมบูรณ์ (ความคลาดเคลื่อนต่ำ)"
                : "⚠️ มีการสูญเสียความร้อนสู่สิ่งแวดล้อมมากกว่าปกติ ตรวจสอบฝาปิดของแคลอริมิเตอร์"}
            </p>
          </div>
        ) : (
          <div className="text-[10px] text-slate-400 font-semibold p-4 border border-dashed rounded-xl text-center italic bg-slate-50/50">
            ทำการทดลองให้ครบทั้ง 3 ขั้นตอนเพื่อพิสูจน์วัฏจักรพลังงานกฎของเฮสส์
          </div>
        )}

        <div className="text-[10px] text-slate-400 font-semibold leading-[1.4] border-t border-slate-100 pt-1">
          ขั้น 1: NaOH(s) + HCl(aq)<br />
          ขั้น 2: NaOH(s) + H₂O<br />
          ขั้น 3: NaOH(aq) + HCl(aq)
        </div>
      </div>
    </section>
  );
}

function CalorimeterScene({
  reactionId,
  tempC,
  elapsed,
  isRunning,
}: {
  reactionId: 1 | 2 | 3;
  tempC: number;
  elapsed: number;
  isRunning: boolean;
}) {
  // Animating stirrer loop angle
  const stirrerAngle = isRunning ? (elapsed * 300) % 360 : 0;
  
  // Height of thermometer red liquid (maps 20-60°C to 10-90px)
  const thermoHeight = Math.min(80, Math.max(10, ((tempC - 20) / 40) * 70));

  // NaOH fall anim
  const pelletVisible = isRunning && elapsed < 8.0;
  const pelletY = pelletVisible ? Math.min(105, 30 + elapsed * 20) : 0;

  return (
    <div className="relative flex h-full min-h-[258px] items-center justify-center overflow-hidden rounded-2xl border border-orange-100 bg-[linear-gradient(135deg,#fffbf8_0%,#fff7f0_48%,#fffcfc_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/75 px-3 py-1.5 text-left shadow-sm backdrop-blur">
        <p className="text-[9px] font-black uppercase text-orange-600">adiabatic calorimeter scene</p>
        <p className="mt-0.5 text-xs font-black text-slate-700">จำลองถ้วยแคลอริมิเตอร์</p>
      </div>

      <svg className="relative z-10 w-full max-w-[280px] h-56" viewBox="0 0 300 220">
        {/* Outer Styrofoam Cup Calorimeter */}
        <path d="M100 80 L115 180 C117 190 125 190 130 190 H170 C175 190 183 190 185 180 L200 80 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="3" />
        {/* Lid */}
        <rect x="92" y="70" width="116" height="12" rx="4" fill="#64748b" />
        <rect x="120" y="62" width="60" height="8" rx="2" fill="#475569" />

        {/* Liquid level */}
        <path d="M105 105 L112 165 C113 172 121 172 123 172 H177 C179 172 187 172 188 165 L195 105 Z" fill="#38bdf8" opacity="0.45" />

        {/* Stirrer (moving handle rod) */}
        <g transform={`translate(${isRunning ? Math.sin(stirrerAngle * Math.PI / 180) * 3 : 0}, 0)`}>
          <path d="M125 35 V140 H140" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Thermometer scale */}
        <g transform="translate(165, 20)">
          <rect x="5" y="0" width="12" height="110" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2.5" />
          <circle cx="11" cy="115" r="14" fill="#ef4444" stroke="#cbd5e1" strokeWidth="2.5" />
          {/* Active temperature level */}
          <rect x="9" y={110 - thermoHeight} width="4" height={thermoHeight} rx="2" fill="#ef4444" />
          <circle cx="11" cy="115" r="10" fill="#ef4444" />
          {/* T-indicator */}
          <text x="32" y="118" fill="#ef4444" fontSize="9.5" fontWeight="900">{tempC.toFixed(1)}°C</text>
        </g>

        {/* Dropping reactant pellet */}
        {pelletVisible && reactionId <= 2 && (
          <g transform={`translate(112, ${pelletY})`}>
            <rect x="0" y="0" width="10" height="7" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="4" width="9" height="6" rx="2" fill="#e2e8f0" />
          </g>
        )}

        {/* Bubbles in liquid indicating reaction */}
        {isRunning && elapsed > 5.0 && elapsed < 40.0 && (
          <g className="animate-pulse" opacity="0.8">
            <circle cx="120" cy="130" r="2" fill="#ffffff" />
            <circle cx="140" cy="145" r="1.5" fill="#ffffff" />
            <circle cx="112" cy="150" r="2.5" fill="#ffffff" />
            <circle cx="150" cy="120" r="1.5" fill="#ffffff" />
          </g>
        )}

        <text x="150" y="212" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">
          {isRunning ? "กำลังวัดปฏิกิริยา..." : "พร้อมเริ่มกดบันทึก"}
        </text>
      </svg>
    </div>
  );
}

export default function HesssLawSimulation() {
  const router = useRouter();

  // Inputs
  const [reactionId, setReactionId] = useState<1 | 2 | 3>(1);
  const [naohMass, setNaohMass] = useState(2.0);        // g (for rx 1 & 2)
  const [solutionVol, setSolutionVol] = useState(100.0); // mL

  // State
  const [tempC, setTempC] = useState(25.0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // List of recorded reaction runs (Hess validation)
  const [completedRuns, setCompletedRuns] = useState<HessReactionRun[]>([]);

  // Real-time points for plotting current curve
  const [livePoints, setLivePoints] = useState<CalorimetryDataPoint[]>([]);

  const [questSuccess, setQuestSuccess] = useState(false);

  // Refs
  const isRunningRef = useRef(isRunning);
  const elapsedRef = useRef(elapsedSeconds);
  const rxIdRef = useRef(reactionId);
  const massRef = useRef(naohMass);
  const volRef = useRef(solutionVol);
  const runsRef = useRef(completedRuns);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { rxIdRef.current = reactionId; }, [reactionId]);
  useEffect(() => { massRef.current = naohMass; }, [naohMass]);
  useEffect(() => { volRef.current = solutionVol; }, [solutionVol]);
  useEffect(() => { runsRef.current = completedRuns; }, [completedRuns]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Load completed runs from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem("scisiam_saved_hesss_experiment");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.completedRuns)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCompletedRuns(parsed.completedRuns);
        }
      } catch (e) {
        console.error("Failed to parse saved runs", e);
      }
    }
  }, []);

  // Compute temperature rising profile
  // T(t) = T0 + dT * (1 - exp(-t / trise)) * exp(-t / tfall)
  const computeTempAtTime = (t: number, rxId: 1 | 2 | 3, mass: number, vol: number) => {
    const moles = mass / MOLAR_MASS_NAOH;
    const dh = DH_REF[rxId];
    const qJ = moles * (-dh) * 1000; // reaction heat in J
    
    // dT max = q / (mass_water * c_water)
    const massWater = vol; // density approx 1g/mL
    const dTMax = qJ / (massWater * SPECIFIC_HEAT);
    
    const tRise = rxId === 2 ? 14.0 : 8.0; // Solid dissolution takes longer than neutralization
    const tFall = 500.0;
    
    const scale = (1 - Math.exp(-t / tRise)) * Math.exp(-t / tFall);
    const riseVal = dTMax * scale;
    
    return parseFloat((25.0 + Math.max(0, riseVal)).toFixed(2));
  };

  // Main tick loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        const delta = 1.0;
        const nextTime = elapsedRef.current + delta;
        
        if (nextTime <= 100) {
          setElapsedSeconds(nextTime);
          elapsedRef.current = nextTime;
          
          const currentT = computeTempAtTime(nextTime, rxIdRef.current, massRef.current, volRef.current);
          setTempC(currentT);
          setLivePoints((prev) => [...prev, { time: nextTime, temperature: currentT }]);
        } else {
          // Simulation ended
          setIsRunning(false);
          isRunningRef.current = false;
          
          // Calculate final enthalpy of the run
          const rxId = rxIdRef.current;
          const mass = massRef.current;
          const vol = volRef.current;
          
          const finalT = computeTempAtTime(100, rxId, mass, vol);
          const maxT = Math.max(...livePoints.map((p) => p.temperature), finalT);
          const dT = maxT - 25.0;
          
          const moles = mass / MOLAR_MASS_NAOH;
          const qJ = vol * SPECIFIC_HEAT * dT;
          const dhRun = -(qJ / 1000) / moles; // kJ/mol

          const newRun: HessReactionRun = {
            reactionId: rxId,
            reactionName: rxId === 1 
              ? "NaOH(s) + HCl(aq) -> NaCl(aq) + H2O(l)" 
              : rxId === 2 
              ? "NaOH(s) + H2O -> NaOH(aq)" 
              : "NaOH(aq) + HCl(aq) -> NaCl(aq) + H2O(l)",
            naohMass: mass,
            naohMoles: moles,
            solutionVol: vol,
            tempInitial: 25.0,
            tempFinal: maxT,
            deltaTemp: dT,
            enthalpyKJ: dhRun,
          };

          const currentRuns = runsRef.current;
          const nextRuns = [...currentRuns.filter((r) => r.reactionId !== rxId), newRun].sort((a, b) => a.reactionId - b.reactionId);

          setCompletedRuns(nextRuns);
          
          alert(`การทดลองขั้นที่ ${rxId} เสร็จสมบูรณ์!\nอุณหภูมิขึ้นสูงสุด: ${maxT.toFixed(1)}°C (ΔT = +${dT.toFixed(1)}°C)\nคำนวณ Enthalpy ได้: ${dhRun.toFixed(1)} kJ/mol`);

          // Check Hess's law validation quest
          const run1 = nextRuns.find((r) => r.reactionId === 1);
          const run2 = nextRuns.find((r) => r.reactionId === 2);
          const run3 = nextRuns.find((r) => r.reactionId === 3);

          if (run1 && run2 && run3 && !questSuccessRef.current) {
            const sum = run2.enthalpyKJ + run3.enthalpyKJ;
            const error = Math.abs((run1.enthalpyKJ - sum) / run1.enthalpyKJ) * 100;
            if (error < 5.0) {
              setQuestSuccess(true);
              questSuccessRef.current = true;
              setTimeout(() => {
                alert("🎉 สุดยอดมาก! คุณพิสูจน์กฎของเฮสส์ได้ถูกต้องโดยมีความคลาดเคลื่อนสะสมไม่ถึง 5.0% บันทึกผลเพื่อเก็บความคืบหน้า");
              }, 150);
            }
          }
        }
      }, 100);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isRunning, livePoints]);

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      setIsRunning(true);
      setElapsedSeconds(0);
      setTempC(25.0);
      setLivePoints([{ time: 0, temperature: 25.0 }]);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setTempC(25.0);
    setReactionId(1);
    setNaohMass(2.0);
    setSolutionVol(100.0);
    setLivePoints([]);
  };

  const handleClearRun = (rId: 1 | 2 | 3) => {
    setCompletedRuns((prev) => prev.filter((r) => r.reactionId !== rId));
  };

  const handleExportCSV = () => {
    if (completedRuns.length === 0) { alert("ไม่มีข้อมูลสำหรับการส่งออก!"); return; }
    const headers = "ขั้นที่,ชื่อปฏิกิริยา,มวล NaOH (g),ปริมาตร (mL),T0 (C),Tmax (C),ΔT (C),ΔH (kJ/mol)\n";
    const rows = completedRuns.map((r) => `${r.reactionId},"${r.reactionName}",${r.naohMass},${r.solutionVol},${r.tempInitial},${r.tempFinal},${r.deltaTemp.toFixed(2)},${r.enthalpyKJ.toFixed(2)}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scisiam_hesss_law_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyData = () => {
    if (completedRuns.length === 0) { alert("ไม่มีข้อมูลคัดลอก!"); return; }
    const content = completedRuns
      .map((r) => `ขั้นที่ ${r.reactionId} | มวล: ${r.naohMass}g | ΔT: +${r.deltaTemp.toFixed(1)}°C | ΔH: ${r.enthalpyKJ.toFixed(1)} kJ/mol`)
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกสรุปผลลงคลิปบอร์ดแล้ว!"));
  };

  const handleSaveResults = async () => {
    if (completedRuns.length === 0) { alert("กรุณาทำการทดลองบันทึกอย่างน้อย 1 ขั้นก่อนกดบันทึกผล!"); return; }
    
    // Structure coordinates of the latest live points graph for detail preview chart
    const targetPoints = livePoints.length > 0 
      ? livePoints 
      : Array.from({ length: 20 }, (_, idx) => ({
          time: idx * 5,
          temperature: computeTempAtTime(idx * 5, reactionId, naohMass, solutionVol),
        }));

    const experimentData = {
      labId: "hesss-law",
      timestamp: new Date().toLocaleString("th-TH"),
      completedRuns,
      dataPoints: targetPoints,
    };
    
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_hesss_experiment",
      localPayload: experimentData,
      labId: "hesss-law",
      title: "Hess's Law & Calorimetry",
      graphPoints: experimentData.dataPoints,
      tableRows: experimentData.completedRuns,
      summary: {
        completedRuns: experimentData.completedRuns.length,
        dataPointCount: experimentData.dataPoints.length,
      },
      score: Math.min(100, experimentData.completedRuns.length * 34),
    });
    alert("บันทึกประวัติการแคลอริมิเตอร์กฎของเฮสส์เรียบร้อย! 🎉");
    router.push("/labs/hesss-law");
  };

  const controls = (
    <div className="space-y-4 text-left">
      {/* Reaction select */}
      <div className="group bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <label className="block text-xs font-bold text-slate-600 mb-1.5">เลือกขั้นตอนปฏิกิริยา</label>
        <div className="flex flex-col gap-1.5">
          {([1, 2, 3] as const).map((rId) => (
            <button
              key={rId}
              onClick={() => setReactionId(rId)}
              className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-black cursor-pointer text-left leading-[1.3] active:scale-95 transition-all ${
                reactionId === rId
                  ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div>ขั้นที่ {rId} {rId === 1 ? "(โดยตรง)" : rId === 2 ? "(ละลาย)" : "(สะเทิน)"}</div>
              <div className="text-[9px] opacity-75">
                {rId === 1 
                  ? "NaOH(s) + HCl(aq)" 
                  : rId === 2 
                  ? "NaOH(s) + H₂O" 
                  : "NaOH(aq) + HCl(aq)"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* NaOH mass solid (only for rx 1 & 2) */}
      <div className="group bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
          <span className="text-slate-600">มวลของตัวละลาย NaOH</span>
          <span className="text-orange-600 font-extrabold text-[10px] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
            {naohMass.toFixed(1)} g
          </span>
        </div>
        <input
          type="range" min="1.0" max="4.0" step="0.5" value={naohMass}
          onChange={(e) => setNaohMass(Number(e.target.value))}
          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-[8.5px] text-slate-400 font-semibold mt-1">
          <span>น้อย (1.0g)</span>
          <span>มาก (4.0g)</span>
        </div>
      </div>

      {/* Solution volume */}
      <div className="group bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
          <span className="text-slate-600">ปริมาตรสารละลายในถ้วย</span>
          <span className="text-indigo-600 font-extrabold text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
            {solutionVol.toFixed(0)} mL
          </span>
        </div>
        <input
          type="range" min="50" max="150" step="10" value={solutionVol}
          onChange={(e) => setSolutionVol(Number(e.target.value))}
          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${isRunning ? "bg-slate-700 hover:bg-slate-800" : "bg-orange-500 hover:bg-orange-600"}`}>
          {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
          {isRunning ? `${elapsedSeconds.toFixed(0)}s หยุด` : "บันทึกความร้อน"}
        </button>
        <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="รีเซ็ต">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="orange"
      labId="hesss-law"
      category="Chemistry"
      title="Hess's Law & Calorimetry"
      subtitle="ตรวจวัดปริมาณความร้อนของสารละลายกรด-เบสในถ้วยแคลอริมิเตอร์เพื่อเปรียบเทียบผลรวมเอนทัลปีย่อยตามกฎของเฮสส์"
      statusLabel={isRunning ? "กำลังวัดปฏิกิริยาเคมี" : "ระบบแคลอริมิเตอร์พร้อมวัด"}
      icon={Flame}
      sceneTitle="ถ้วยแคลอริมิเตอร์ความร้อนจำลอง"
      scene={
        <CalorimeterScene
          reactionId={reactionId}
          tempC={tempC}
          elapsed={elapsedSeconds}
          isRunning={isRunning}
        />
      }
      controlsTitle="แผงควบคุมแคลอริมิเตอร์"
      controls={controls}
      metrics={[
        { label: "อุณหภูมิปัจจุบัน", value: `${tempC.toFixed(1)} °C`, tone: "rose" },
        { label: "ขั้นที่ใช้งาน", value: `ปฏิกิริยาที่ ${reactionId}`, tone: "orange" },
        { label: "มวล NaOH", value: `${naohMass.toFixed(1)} g`, tone: "orange" },
        { label: "เวลาทดลอง", value: `${elapsedSeconds.toFixed(0)}s`, tone: "violet" },
      ]}
      graph={
        <EnthalpyGraph
          livePoints={livePoints}
          currentTemp={tempC}
          currentTime={elapsedSeconds}
        />
      }
      table={
        <ResultsTable
          runs={completedRuns}
          onClearRun={handleClearRun}
          onCopyData={handleCopyData}
          onExportCSV={handleExportCSV}
        />
      }
      theory={
        <TheoryPanel runs={completedRuns} />
      }
      steps={[
        { label: "เลือกขั้นปฏิกิริยา", icon: Sliders },
        { label: "ตวง NaOH + กรด", icon: Sliders },
        { label: "หยดสารและกวนสาร", icon: Play },
        { label: "บันทึกกราฟความร้อน", icon: ClipboardList },
        { label: "ยืนยันผลรวมวัฏจักร", icon: Target },
      ]}
      learningGoals={[
        "อธิบายความหมายและพิสูจน์ความคงตัวของฟังก์ชันสภาวะของกฎของเฮสส์ได้",
        "ใช้สมการ q = mcΔT คำนวณความร้อนและเอนทัลปีเคมี (ΔH) ของปฏิกิริยาได้ถูกต้อง",
        "ระบุการแยกกันของปฏิกิริยาละลาย และสะเทินที่เป็นปฏิกิริยาย่อยของปฏิกิริยาโดยตรง",
        "ระมัดระวังความคลาดเคลื่อนจากการแลกเปลี่ยนความร้อนกับสิ่งแวดล้อม",
      ]}
      progressLabel="กฎของเฮสส์ได้รับการยืนยัน"
      progressValue={questSuccess ? "สำเร็จลุล่วง 💎" : "รอผลทั้ง 3 ขั้นตอน"}
      progressPercent={questSuccess ? 100 : (completedRuns.length / 3) * 100}
      tips={[
        "ในการหาอุณหภูมิสูงสุดสูงสุดให้สังเกตจุดพีคของกราฟความร้อนก่อนอุณหภูมิเริ่มลดลง",
        "เนื่องจากเป็นระบบคายความร้อน (Exothermic) ค่า ΔH ที่คำนวณได้จะมีเครื่องหมายเป็นลบเสมอ",
        "ตรวจสอบให้แน่ใจว่าได้ทำการทดลองครบทั้ง 3 ขั้นตอนเพื่อหาผลรวมเปรียบเทียบในแผงทฤษฎี",
        "ความหนาแน่นและความจุความร้อนจำเพาะของสารละลายกรดและเบสในสภาวะเจือจางอนุโลมให้เท่ากับน้ำบริสุทธิ์ได้",
      ]}
      onSave={handleSaveResults}
    />
  );
}
