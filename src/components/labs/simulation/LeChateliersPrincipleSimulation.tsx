"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sliders,
  Trash,
  Download,
  Clipboard,
  FlaskConical,
  TrendingDown,
  ClipboardList,
  Target,
  Thermometer,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import CompactRangeControl from "@/components/labs/simulation/CompactRangeControl";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

export interface EquilibriumDataPoint {
  index: number;
  time: number;          // seconds
  fe3: number;          // M
  scn: number;          // M
  naf: number;          // M
  temp: number;         // °C
  concentration: number; // M ([Fe(SCN)]2+)
  colorStr: string;
}

const GAS_CONSTANT = 8.314;
const TEMP_REF = 298.15; // 25°C in Kelvin
const KC_REF = 150.0;    // Equilibrium constant at 25°C
const DELTA_H = -25000.0; // Exothermic reaction (J/mol)

// Solve quadratic equation: x^2 - (C_fe + C_scn + 1/Kc)x + C_fe * C_scn = 0
const solveEquilibrium = (cFe: number, cScn: number, tempC: number) => {
  const tempK = tempC + 273.15;
  // Kc = Kc_ref * exp( (-DeltaH/R) * (1/T - 1/T_ref) )
  const kc = KC_REF * Math.exp((-DELTA_H / GAS_CONSTANT) * (1 / tempK - 1 / TEMP_REF));
  
  const b = -(cFe + cScn + 1 / kc);
  const c = cFe * cScn;
  
  // Quadratic solution
  const disc = b * b - 4 * c;
  if (disc < 0) return 0;
  
  // x = (-b - sqrt(disc)) / 2
  const x = (-b - Math.sqrt(disc)) / 2;
  return Math.max(0, Math.min(x, Math.min(cFe, cScn)));
};

const getTubeColor = (feConc: number, scnConc: number, productConc: number) => {
  const redWeight = Math.min(1.0, productConc / 0.025);

  const r = Math.round(245 * (1 - redWeight) + 153 * redWeight);
  const g = Math.round(158 * (1 - redWeight) * (1 - redWeight) + 27 * redWeight);
  const b = Math.round(11 * (1 - redWeight) + 27 * redWeight);

  const alpha = Math.min(0.95, 0.25 + (feConc + scnConc + productConc) * 15);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function EquilibriumGraph({
  dataPoints,
  currentTime,
  currentConc,
}: {
  dataPoints: EquilibriumDataPoint[];
  currentTime: number;
  currentConc: number;
}) {
  const xCoord = (t: number) => 30 + (t / 100) * 150;
  const yCoord = (c: number) => 100 - (c / 0.05) * 85;

  const linePath = useMemo(() => {
    if (dataPoints.length === 0) return "";
    const sorted = [...dataPoints].sort((a, b) => a.time - b.time);
    return sorted.map((p, idx) => `${idx === 0 ? "M" : "L"}${xCoord(p.time)},${yCoord(p.concentration)}`).join(" ");
  }, [dataPoints]);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <TrendingDown className="h-4.5 w-4.5 text-rose-600" />
          กราฟความเข้มข้น [Fe(SCN)]²⁺
        </h3>
        <span className="text-[10px] font-bold text-rose-600">Conc vs Time</span>
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
          <text x="27" y="17.5" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">0.05 M</text>
          <text x="27" y="57.5" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">0.025 M</text>
          <text x="27" y="100" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">0 M</text>

          {/* Line path */}
          {linePath && (
            <path d={linePath} stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          )}

          {/* Logged points circles */}
          {dataPoints.map((p) => (
            <circle
              key={p.index}
              cx={xCoord(p.time)}
              cy={yCoord(p.concentration)}
              r="2.5"
              fill="#f43f5e"
              stroke="#ffffff"
              strokeWidth="0.75"
            />
          ))}

          {/* Live operating indicator circle */}
          <circle
            cx={xCoord(currentTime)}
            cy={yCoord(currentConc)}
            r="3.5"
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth="0.75"
          />

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
  dataPoints,
  onClearPoint,
  onCopyData,
  onExportCSV,
}: {
  dataPoints: EquilibriumDataPoint[];
  onClearPoint: (idx: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-rose-600" />
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
          <thead className="bg-rose-50/70 text-[11px] font-black text-rose-800">
            <tr>
              <th className="px-2.5 py-2">จุดวัด</th>
              <th className="px-2.5 py-2">เวลา (s)</th>
              <th className="px-2.5 py-2">Fe³⁺ (M)</th>
              <th className="px-2.5 py-2">SCN⁻ (M)</th>
              <th className="px-2.5 py-2">T (°C)</th>
              <th className="px-2.5 py-2">[Complex]</th>
              <th className="px-2.5 py-2 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {dataPoints.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">ไม่มีข้อมูลบันทึก</td>
              </tr>
            ) : (
              dataPoints.map((point) => (
                <tr key={point.index} className="hover:bg-slate-50/50">
                  <td className="px-2.5 py-2 font-mono">#{point.index}</td>
                  <td className="px-2.5 py-2 font-mono">{point.time.toFixed(1)}s</td>
                  <td className="px-2.5 py-2 font-mono text-amber-600">{point.fe3.toFixed(4)}</td>
                  <td className="px-2.5 py-2 font-mono text-slate-600">{point.scn.toFixed(4)}</td>
                  <td className="px-2.5 py-2 font-mono text-orange-600">{point.temp.toFixed(0)}°C</td>
                  <td className="px-2.5 py-2 font-mono text-rose-600">{point.concentration.toFixed(4)} M</td>
                  <td className="px-2.5 py-2 text-center">
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
  feConc,
  scnConc,
  productConc,
  tempC,
}: {
  feConc: number;
  scnConc: number;
  productConc: number;
  tempC: number;
}) {
  const tempK = tempC + 273.15;
  const currentKc = KC_REF * Math.exp((-DELTA_H / GAS_CONSTANT) * (1 / tempK - 1 / TEMP_REF));

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Sliders className="h-4.5 w-4.5 text-rose-600" />
        ทฤษฎีและค่าคงที่สมดุล
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3 text-left">
        <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-center text-sm font-black text-slate-800 font-mono">
          Kc = [[Fe(SCN)]²⁺] / [Fe³⁺][SCN⁻]
        </div>
        <p className="text-[11px] font-semibold leading-relaxed text-slate-500">
          เมื่อรบกวนสมดุลด้วยการเปลี่ยนแปลงความเข้มข้นหรืออุณหภูมิ ระบบจะปรับตัวในทิศทางที่จะต่อต้านการเปลี่ยนแปลงนั้น
        </p>
        <div className="grid grid-cols-1 gap-1.5 text-[11px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1">ค่าคงที่ Kc ที่ {tempC}°C: <b className="text-rose-700">{currentKc.toFixed(1)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">ความเข้มข้น Fe³⁺: <b className="text-amber-700">{(feConc - productConc).toFixed(4)} M</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">ความเข้มข้น SCN⁻: <b className="text-slate-700">{(scnConc - productConc).toFixed(4)} M</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">ความเข้มข้น [Complex]²⁺: <b className="text-rose-700">{productConc.toFixed(4)} M</b></span>
        </div>
      </div>
    </section>
  );
}

function TubeScene({
  controlColor,
  perturbedColor,
  perturbedNafColor,
  tempColor,
  tempC,
}: {
  controlColor: string;
  perturbedColor: string;
  perturbedNafColor: string;
  tempColor: string;
  tempC: number;
}) {
  return (
    <div className="relative flex h-full min-h-[258px] items-center justify-center overflow-hidden rounded-2xl border border-rose-100 bg-[linear-gradient(135deg,#fff8fb_0%,#fff2f6_48%,#fffafc_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/75 px-3 py-1.5 text-left shadow-sm backdrop-blur">
        <p className="text-[9px] font-black uppercase text-rose-600">equilibrium state tubes</p>
        <p className="mt-0.5 text-xs font-black text-slate-700">หลอดเปรียบเทียบ 4 สภาวะ</p>
      </div>

      <svg className="relative z-10 w-full max-w-[420px] h-60" viewBox="0 0 400 240">
        {/* Support Rack */}
        <rect x="40" y="150" width="320" height="12" rx="4" fill="#475569" />
        <rect x="76" y="162" width="10" height="60" fill="#64748b" />
        <rect x="314" y="162" width="10" height="60" fill="#64748b" />
        <rect x="25" y="218" width="350" height="15" rx="5" fill="#334155" />

        {/* Tube 1: Control */}
        <g transform="translate(60, 40)">
          <rect x="0" y="0" width="24" height="120" rx="12" fill="rgba(255,255,255,0.75)" stroke="#94a3b8" strokeWidth="2.5" />
          <rect x="2.5" y="50" width="19" height="66" rx="9" fill={controlColor} />
          {/* Liquid bubbles */}
          <circle cx="8" cy="80" r="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="16" cy="98" r="1" fill="#ffffff" opacity="0.5" />
          <text x="12" y="138" fill="#475569" fontSize="8.5" fontWeight="900" textAnchor="middle">1. ควบคุม</text>
        </g>

        {/* Tube 2: Perturbed Concentration */}
        <g transform="translate(140, 40)">
          <rect x="0" y="0" width="24" height="120" rx="12" fill="rgba(255,255,255,0.75)" stroke="#94a3b8" strokeWidth="2.5" />
          <rect x="2.5" y="50" width="19" height="66" rx="9" fill={perturbedColor} />
          <circle cx="8" cy="75" r="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="16" cy="92" r="1" fill="#ffffff" opacity="0.5" />
          <text x="12" y="138" fill="#475569" fontSize="8.5" fontWeight="900" textAnchor="middle">2. ความเข้มข้น</text>
        </g>

        {/* Tube 3: Perturbed NaF */}
        <g transform="translate(220, 40)">
          <rect x="0" y="0" width="24" height="120" rx="12" fill="rgba(255,255,255,0.75)" stroke="#94a3b8" strokeWidth="2.5" />
          <rect x="2.5" y="50" width="19" height="66" rx="9" fill={perturbedNafColor} />
          <circle cx="10" cy="85" r="1.5" fill="#ffffff" opacity="0.5" />
          <text x="12" y="138" fill="#475569" fontSize="8.5" fontWeight="900" textAnchor="middle">3. เติม NaF</text>
        </g>

        {/* Tube 4: Temp chamber */}
        <g transform="translate(300, 40)">
          {/* Beaker representing Water Bath chamber around this tube */}
          <rect x="-10" y="42" width="44" height="80" rx="6" fill="#7dd3fc" opacity="0.28" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Waves indicating heat/cold */}
          {tempC > 40 ? (
            <g stroke="#f97316" strokeWidth="1.5" opacity="0.75" strokeLinecap="round">
              <path d="M-6 95 C-8 100 -4 103 -6 108" />
              <path d="M38 95 C36 100 40 103 38 108" />
            </g>
          ) : tempC < 15 ? (
            <g stroke="#06b6d4" strokeWidth="1.5" opacity="0.7" strokeLinecap="round">
              <path d="M-6 95 L-2 101 L-6 107" />
              <path d="M38 95 L34 101 L38 107" />
            </g>
          ) : null}
          <rect x="0" y="0" width="24" height="120" rx="12" fill="rgba(255,255,255,0.75)" stroke="#94a3b8" strokeWidth="2.5" />
          <rect x="2.5" y="50" width="19" height="66" rx="9" fill={tempColor} />
          <circle cx="8" cy="80" r="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="16" cy="98" r="1" fill="#ffffff" opacity="0.5" />
          <text x="12" y="138" fill="#475569" fontSize="8.5" fontWeight="900" textAnchor="middle">4. อุณหภูมิ</text>
          <text x="12" y="148" fill="#f97316" fontSize="7.5" fontWeight="bold" textAnchor="middle">({tempC}°C)</text>
        </g>
      </svg>
    </div>
  );
}

export default function LeChateliersPrincipleSimulation() {

  // Concentration state of Tube 2 (Perturbed concentration)
  const [feAdded, setFeAdded] = useState(0.02);  // FeCl3 drops added (analytical concentration Fe3+)
  const [scnAdded, setScnAdded] = useState(0.02); // KSCN drops added (analytical concentration SCN-)
  
  // Concentration state of Tube 3 (Perturbed NaF)
  const [nafAdded, setNafAdded] = useState(0.0);   // NaF drops added

  // Temperature state of Tube 4 (Temp chamber)
  const [tempC, setTempC] = useState(25.0); // 10°C - 80°C

  // Simulation variables
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<EquilibriumDataPoint[]>([]);

  // Quest tracker: maintain complex concentration in Tube 2 between 0.015 M and 0.025 M for 12 seconds
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  // Refs
  const isRunningRef = useRef(isRunning);
  const elapsedRef = useRef(elapsedSeconds);
  const feRef = useRef(feAdded);
  const scnRef = useRef(scnAdded);
  const nafRef = useRef(nafAdded);
  const tempRef = useRef(tempC);
  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { feRef.current = feAdded; }, [feAdded]);
  useEffect(() => { scnRef.current = scnAdded; }, [scnAdded]);
  useEffect(() => { nafRef.current = nafAdded; }, [nafAdded]);
  useEffect(() => { tempRef.current = tempC; }, [tempC]);
  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Derived equilibrium values
  // Tube 1: Control (0.02M Fe3+, 0.02M SCN-, 25°C)
  const controlConc = useMemo(() => solveEquilibrium(0.02, 0.02, 25.0), []);
  const controlColor = useMemo(() => getTubeColor(0.02, 0.02, controlConc), [controlConc]);

  // Tube 2: Perturbed Conc (feAdded, scnAdded, 25°C)
  const perturbedConc = useMemo(() => solveEquilibrium(feAdded, scnAdded, 25.0), [feAdded, scnAdded]);
  const perturbedColor = useMemo(() => getTubeColor(feAdded, scnAdded, perturbedConc), [feAdded, scnAdded, perturbedConc]);

  // Tube 3: NaF perturbation. NaF consumes Fe3+ to form colorless complex [FeF6]3-.
  // Let's assume 1 mole of NaF consumes 1/6 mole of Fe3+.
  const activeFeForNaf = Math.max(0.001, 0.02 - nafAdded / 6.0);
  const perturbedNafConc = useMemo(() => solveEquilibrium(activeFeForNaf, 0.02, 25.0), [activeFeForNaf]);
  const perturbedNafColor = useMemo(() => getTubeColor(activeFeForNaf, 0.02, perturbedNafConc), [activeFeForNaf, perturbedNafConc]);

  // Tube 4: Temp perturbation (0.02M Fe3+, 0.02M SCN-, tempC)
  const tempConc = useMemo(() => solveEquilibrium(0.02, 0.02, tempC), [tempC]);
  const tempColor = useMemo(() => getTubeColor(0.02, 0.02, tempConc), [tempConc]);

  // Live charting values: maps to Tube 2 (perturbed concentration)
  const liveConc = perturbedConc;

  // Main tick loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        const delta = 0.5;
        const nextTime = elapsedRef.current + delta;
        
        // Loop time 0-100s
        if (nextTime <= 100) {
          setElapsedSeconds(nextTime);
          elapsedRef.current = nextTime;
        } else {
          setIsRunning(false);
          isRunningRef.current = false;
        }

        // Quest checking: [Complex] concentration between 0.015 and 0.022 M
        const c = solveEquilibrium(feRef.current, scnRef.current, 25.0);
        if (c >= 0.015 && c <= 0.022) {
          const nextProg = Math.min(12, questProgressRef.current + delta);
          setQuestProgress(nextProg);
          questProgressRef.current = nextProg;

          if (nextProg >= 12 && !questSuccessRef.current) {
            setQuestSuccess(true);
            questSuccessRef.current = true;
            alert("🎉 เก่งมาก! คุณปรับจูนจนความเข้มข้นสารประกอบเชิงซ้อนสีแดงอยู่ในช่วงเป้าหมาย 12 วินาทีต่อเนื่องสำเร็จ บันทึกผลเพื่อเก็บความคืบหน้า");
          }
        } else {
          setQuestProgress(0);
          questProgressRef.current = 0;
        }
      }, 500);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isRunning]);

  const handleStartStop = () => {
    if (!isRunning) {
      setDataPoints((previous) => [
        ...previous,
        {
          index: previous.length + 1,
          time: parseFloat(elapsedSeconds.toFixed(1)),
          fe3: parseFloat(feAdded.toFixed(4)),
          scn: parseFloat(scnAdded.toFixed(4)),
          naf: parseFloat(nafAdded.toFixed(4)),
          temp: parseFloat(tempC.toFixed(0)),
          concentration: parseFloat(liveConc.toFixed(4)),
          colorStr: perturbedColor,
        },
      ]);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setFeAdded(0.02);
    setScnAdded(0.02);
    setNafAdded(0.0);
    setTempC(25.0);
    setQuestProgress(0);
    setDataPoints([]);
  };

  const handleClearPoint = (idx: number) => {
    setDataPoints((prev) => prev.filter((p) => p.index !== idx).map((p, i) => ({ ...p, index: i + 1 })));
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) { alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!"); return; }
    const headers = "จุดวัด,เวลา (s),Fe3+ (M),SCN- (M),NaF (M),อุณหภูมิ (C),ความเข้มข้น Complex (M)\n";
    const rows = dataPoints.map((p) => `${p.index},${p.time},${p.fe3.toFixed(4)},${p.scn.toFixed(4)},${p.naf.toFixed(4)},${p.temp.toFixed(0)},${p.concentration.toFixed(4)}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scisiam_equilibrium_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyData = () => {
    if (dataPoints.length === 0) { alert("ไม่มีข้อมูลบันทึกสำหรับการคัดลอก!"); return; }
    const content = dataPoints
      .map((p) => `จุดที่ ${p.index} | เวลา: ${p.time}s | Fe3+: ${p.fe3.toFixed(4)}M | SCN-: ${p.scn.toFixed(4)}M | T: ${p.temp}°C | [Complex]: ${p.concentration.toFixed(4)}M`)
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"));
  };

  const handleSaveResults = async () => {
    if (dataPoints.length === 0) { alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล!"); return; }
    const experimentData = {
      labId: "le-chateliers-principle",
      timestamp: new Date().toLocaleString("th-TH"),
      dataPoints: dataPoints.map((p) => ({
        time: p.time,
        concentration: p.concentration,
      })),
    };
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_le_chateliers_experiment",
      localPayload: experimentData,
      labId: "le-chateliers-principle",
      title: "Chemical Equilibrium Shift",
      graphPoints: experimentData.dataPoints,
      tableRows: experimentData.dataPoints,
      summary: { dataPointCount: experimentData.dataPoints.length },
      score: Math.min(100, experimentData.dataPoints.length * 20),
    });
  };

  const compactControls = (
    <>
      <CompactRangeControl label="Fe³⁺ เริ่มต้น" symbol="Fe" value={feAdded} min={0.005} max={0.05} step={0.002} precision={4} unit="M" tone="pink" onChange={setFeAdded} />
      <CompactRangeControl label="SCN⁻ เริ่มต้น" symbol="SCN" value={scnAdded} min={0.005} max={0.05} step={0.002} precision={4} unit="M" tone="violet" onChange={setScnAdded} />
      <CompactRangeControl label="ปริมาณ NaF" symbol="NaF" value={nafAdded} min={0} max={0.1} step={0.005} precision={3} unit="M" tone="blue" onChange={setNafAdded} />
      <CompactRangeControl label="อุณหภูมิอ่าง" symbol="T" value={tempC} min={10} max={80} step={1} precision={0} unit="°C" tone="orange" onChange={setTempC} />
    </>
  );

  return (
    <SharedSimulationShell
      accent="rose"
      labId="le-chateliers-principle"
      category="Chemistry"
      title="Chemical Equilibrium Shift"
      subtitle="ศึกษาปฏิกิริยาสมดุลของสารประกอบเชิงซ้อนเหล็กไทโอไซยาเนตเมื่อถูกรบกวนโดยการเปลี่ยนความเข้มข้นและอุณหภูมิ"
      statusLabel={isRunning ? "กำลังติดตามผลเวลาจริง" : "พร้อมรบกวนระบบ"}
      icon={FlaskConical}
      sceneTitle="หลอดแก้วทดลองสมดุลเคมีจำลอง"
      scene={
        <TubeScene
          controlColor={controlColor}
          perturbedColor={perturbedColor}
          perturbedNafColor={perturbedNafColor}
          tempColor={tempColor}
          tempC={tempC}
        />
      }
      controlsTitle="แผงควบคุมการรบกวนสมดุล"
      compactControls={compactControls}
      metrics={[
        { label: "[Fe(SCN)]²⁺ หลอด 2", value: `${liveConc.toFixed(4)} M`, tone: "rose" },
        { label: "อุณหภูมิหลอด 4", value: `${tempC.toFixed(0)} °C`, tone: "orange" },
        { label: "ความเข้มข้น Fe³⁺ หลอด 2", value: `${(feAdded - liveConc).toFixed(4)} M`, tone: "orange" },
        { label: "ค่า Kc ที่สภาวะ 4", value: `${(KC_REF * Math.exp((-DELTA_H / GAS_CONSTANT) * (1 / (tempC + 273.15) - 1 / TEMP_REF))).toFixed(1)}`, tone: "violet" },
      ]}
      graph={
        <EquilibriumGraph
          dataPoints={dataPoints}
          currentTime={elapsedSeconds}
          currentConc={liveConc}
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
          feConc={feAdded}
          scnConc={scnAdded}
          productConc={liveConc}
          tempC={tempC}
        />
      }
      steps={[
        { label: "ตั้งต้น Fe³⁺+SCN⁻", icon: FlaskConical },
        { label: "เติมสารรบกวนความเข้มข้น", icon: Sliders },
        { label: "ปรับแช่อ่างอุณหภูมิ", icon: Thermometer },
        { label: "จดบันทึกสีสารเปลี่ยน", icon: ClipboardList },
        { label: "วิเคราะห์ Kc เลื่อน", icon: Target },
      ]}
      learningGoals={[
        "อธิบายหลักการเลื่อนสมดุลตามหลักของเลอชาเตอลิเยได้",
        "วิเคราะห์ทิศการเลื่อนตัวเมื่อเพิ่ม/ลดความเข้มข้นสารได้",
        "ระบุประเภทดูด/คายความร้อนของปฏิกิริยาจากการสังเกตสีเมื่อเปลี่ยนอุณหภูมิได้",
        "คำนวณและเข้าใจความสัมพันธ์ของค่าคงที่ Kc ที่เปลี่ยนไปตามอุณหภูมิ",
      ]}
      progressLabel="ระยะเวลาที่ [Complex] อยู่ในช่วงเป้าหมาย"
      progressValue={`${questProgress.toFixed(1)} / 12 วินาที`}
      progressPercent={(questProgress / 12) * 100}
      tips={[
        "ปฏิกิริยานี้คายความร้อน การเพิ่มอุณหภูมิจะส่งผลให้สมดุลเลื่อนไปทางซ้าย (สีจางลง)",
        "การหยด NaF จะดึง Fe³⁺ ออกจากระบบ ทำให้สมดุลเลื่อนไปทางซ้ายเพื่อชดเชย",
        "เพิ่ม Fe³⁺ หรือ SCN⁻ เพื่อเร่งการเกิดสีแดงเข้มขึ้น (เลื่อนไปทางขวา)",
        "ความเข้มข้นสูงสุดของ [Fe(SCN)]²⁺ ไม่สามารถเกินสารตั้งต้นตัวที่น้อยที่สุดได้",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}

