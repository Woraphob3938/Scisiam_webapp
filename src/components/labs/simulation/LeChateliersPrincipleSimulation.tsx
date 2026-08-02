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

function EquilibriumScene({
  controlColor,
  mixtureColor,
  tempC,
  reactionProgress,
  isRunning,
  feAdded,
  scnAdded,
  nafAdded,
}: {
  controlColor: string;
  mixtureColor: string;
  tempC: number;
  reactionProgress: number;
  isRunning: boolean;
  feAdded: number;
  scnAdded: number;
  nafAdded: number;
}) {
  const fillHeight = 58 + reactionProgress * 18;
  const mixtureY = 196 - fillHeight;
  const statusText = isRunning
    ? "กำลังปรับเข้าสู่สมดุล"
    : reactionProgress >= 1
      ? "สมดุลใหม่คงที่แล้ว"
      : "พร้อมรบกวนสมดุล";

  return (
    <div
      className="relative flex h-full min-h-[258px] items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fff9fb_0%,#fff1f5_100%)]"
      data-testid="chemical-equilibrium-scene"
    >
      <svg
        className="h-full min-h-[258px] w-full"
        viewBox="0 0 560 270"
        role="img"
        aria-labelledby="equilibrium-scene-title equilibrium-scene-desc"
      >
        <title id="equilibrium-scene-title">ระบบสมดุลเหล็กไทโอไซยาเนต</title>
        <desc id="equilibrium-scene-desc">
          สารละลายเหล็กสามบวกและไทโอไซยาเนตถูกเติมลงในบีกเกอร์ สีแดงเข้มขึ้นตามการเกิดสารประกอบเชิงซ้อนและปรับตามอุณหภูมิหรือโซเดียมฟลูออไรด์
        </desc>

        <path d="M40 224H520" stroke="#cbd5e1" strokeWidth="3" />
        <path d="M48 228H512V246H48Z" fill="#e2e8f0" />

        <g transform="translate(58 42)">
          <rect width="98" height="126" rx="20" fill="#fff" stroke="#f59e0b" strokeWidth="3" />
          <rect x="12" y="16" width="74" height="48" rx="12" fill="#fef3c7" />
          <text x="49" y="36" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="900">FeCl₃</text>
          <text x="49" y="53" textAnchor="middle" fill="#b45309" fontSize="10" fontWeight="800">{feAdded.toFixed(3)} M</text>
          <path d="M49 68V96" stroke="#d97706" strokeWidth="5" strokeLinecap="round" />
          <path d="M40 97H58L54 113H44Z" fill="#f59e0b" opacity=".72" />
          <text x="49" y="143" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="800">เหล็ก(III)</text>
        </g>

        <g transform="translate(404 42)">
          <rect width="98" height="126" rx="20" fill="#fff" stroke="#7c3aed" strokeWidth="3" />
          <rect x="12" y="16" width="74" height="48" rx="12" fill="#ede9fe" />
          <text x="49" y="36" textAnchor="middle" fill="#5b21b6" fontSize="12" fontWeight="900">KSCN</text>
          <text x="49" y="53" textAnchor="middle" fill="#6d28d9" fontSize="10" fontWeight="800">{scnAdded.toFixed(3)} M</text>
          <path d="M49 68V96" stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" />
          <path d="M40 97H58L54 113H44Z" fill="#8b5cf6" opacity=".72" />
          <text x="49" y="143" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="800">ไทโอไซยาเนต</text>
        </g>

        <path d="M156 112C190 112 190 137 220 137" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
        <path d="M404 112C370 112 370 137 340 137" fill="none" stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" />
        {isRunning && (
          <>
            <circle cx={174 + reactionProgress * 40} cy={114 + reactionProgress * 19} r="6" fill="#f59e0b" />
            <circle cx={386 - reactionProgress * 40} cy={114 + reactionProgress * 19} r="6" fill="#7c3aed" />
          </>
        )}

        <g>
          <path d="M220 78H340L329 207C328 218 320 224 309 224H251C240 224 232 218 231 207Z" fill="#fff" fillOpacity=".68" stroke="#475569" strokeWidth="4" />
          <path d={`M232 ${mixtureY}H328L322 207C321 213 316 216 309 216H251C244 216 239 213 238 207Z`} fill={mixtureColor} />
          <path d="M232 196C252 187 268 205 288 196C307 188 315 198 326 194" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="3" />
          <path d="M280 59V203" stroke="#64748b" strokeWidth="3" />
          <circle cx="280" cy="203" r="9" fill="#e11d48" stroke="#881337" strokeWidth="2" />
          <path d="M244 82H258M244 101H255M244 120H258M302 82H316M305 101H316M302 120H316" stroke="#94a3b8" strokeWidth="2" />
          <text x="280" y="101" textAnchor="middle" fill="#881337" fontSize="16" fontWeight="900">Fe³⁺ + SCN⁻</text>
          <text x="280" y="124" textAnchor="middle" fill="#be123c" fontSize="19" fontWeight="900">⇌</text>
          <text x="280" y="147" textAnchor="middle" fill="#881337" fontSize="16" fontWeight="900">[FeSCN]²⁺</text>
        </g>

        <g transform="translate(178 10)">
          <rect width="204" height="38" rx="19" fill="#fff" stroke="#fb7185" strokeWidth="2" />
          <circle cx="20" cy="19" r="7" fill={isRunning ? "#f43f5e" : reactionProgress >= 1 ? "#10b981" : "#94a3b8"} />
          <text x="36" y="16" fill="#334155" fontSize="11" fontWeight="900">{statusText}</text>
          <text x="36" y="30" fill="#64748b" fontSize="9" fontWeight="700">ความคืบหน้า {Math.round(reactionProgress * 100)}%</text>
        </g>

        <g transform="translate(374 184)">
          <rect width="138" height="44" rx="14" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
          <text x="13" y="18" fill="#64748b" fontSize="9" fontWeight="800">ตัวรบกวนระบบ</text>
          <text x="13" y="34" fill="#0f172a" fontSize="11" fontWeight="900">NaF {nafAdded.toFixed(3)} M · {tempC}°C</text>
        </g>

        <g transform="translate(52 184)">
          <rect width="128" height="44" rx="14" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="22" cy="22" r="12" fill={controlColor} />
          <text x="42" y="18" fill="#64748b" fontSize="9" fontWeight="800">หลอดควบคุม</text>
          <text x="42" y="34" fill="#0f172a" fontSize="11" fontWeight="900">25°C · 0.020 M</text>
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
  const [reactionProgress, setReactionProgress] = useState(0);
  const [measuredConc, setMeasuredConc] = useState(() => solveEquilibrium(0.02, 0.02, 25));

  // Quest tracker: maintain complex concentration in Tube 2 between 0.015 M and 0.025 M for 12 seconds
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  // Refs
  const elapsedRef = useRef(elapsedSeconds);
  const reactionProgressRef = useRef(0);
  const reactionTargetRef = useRef<EquilibriumDataPoint | null>(null);

  useEffect(() => { elapsedRef.current = elapsedSeconds; }, [elapsedSeconds]);

  // Derived equilibrium values
  // Tube 1: Control (0.02M Fe3+, 0.02M SCN-, 25°C)
  const controlConc = useMemo(() => solveEquilibrium(0.02, 0.02, 25.0), []);
  const controlColor = useMemo(() => getTubeColor(0.02, 0.02, controlConc), [controlConc]);

  // NaF binds part of Fe3+, while temperature changes Kc for this exothermic equilibrium.
  const activeFe = Math.max(0.001, feAdded - nafAdded / 6.0);
  const perturbedConc = useMemo(
    () => solveEquilibrium(activeFe, scnAdded, tempC),
    [activeFe, scnAdded, tempC],
  );
  const perturbedColor = useMemo(
    () => getTubeColor(activeFe, scnAdded, perturbedConc),
    [activeFe, scnAdded, perturbedConc],
  );

  // Live charting values move toward the selected equilibrium during a run.
  const liveConc = measuredConc;
  const mixtureColor = useMemo(
    () => getTubeColor(feAdded, scnAdded, measuredConc),
    [feAdded, scnAdded, measuredConc],
  );

  // Main tick loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        const target = reactionTargetRef.current;
        if (!target) return;

        const nextProgress = Math.min(1, reactionProgressRef.current + 0.04);
        const easedProgress = 1 - (1 - nextProgress) ** 3;
        const nextTime = nextProgress * 5;
        const nextConcentration = controlConc + (target.concentration - controlConc) * easedProgress;

        reactionProgressRef.current = nextProgress;
        elapsedRef.current = nextTime;
        setReactionProgress(nextProgress);
        setElapsedSeconds(nextTime);
        setMeasuredConc(nextConcentration);

        if (nextProgress >= 1) {
          setDataPoints((previous) => [
            ...previous,
            { ...target, index: previous.length + 1, time: parseFloat(nextTime.toFixed(1)) },
          ]);
          const reachedTarget = target.concentration >= 0.015 && target.concentration <= 0.022;
          setQuestProgress(reachedTarget ? 12 : 0);
          setQuestSuccess(reachedTarget);
          setIsRunning(false);
        }
      }, 100);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [controlConc, isRunning]);

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    reactionTargetRef.current = {
      index: 0,
      time: 5,
      fe3: parseFloat(feAdded.toFixed(4)),
      scn: parseFloat(scnAdded.toFixed(4)),
      naf: parseFloat(nafAdded.toFixed(4)),
      temp: parseFloat(tempC.toFixed(0)),
      concentration: parseFloat(perturbedConc.toFixed(4)),
      colorStr: perturbedColor,
    };
    reactionProgressRef.current = 0;
    elapsedRef.current = 0;
    setReactionProgress(0);
    setElapsedSeconds(0);
    setMeasuredConc(controlConc);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setFeAdded(0.02);
    setScnAdded(0.02);
    setNafAdded(0.0);
    setTempC(25.0);
    setQuestProgress(0);
    setQuestSuccess(false);
    setDataPoints([]);
    setReactionProgress(0);
    setMeasuredConc(controlConc);
    reactionProgressRef.current = 0;
    reactionTargetRef.current = null;
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
      <CompactRangeControl label="Fe³⁺ เริ่มต้น" symbol="Fe" value={feAdded} min={0.005} max={0.05} step={0.002} precision={4} unit="M" tone="pink" onChange={(value) => { setFeAdded(value); setReactionProgress(0); setMeasuredConc(controlConc); }} />
      <CompactRangeControl label="SCN⁻ เริ่มต้น" symbol="SCN" value={scnAdded} min={0.005} max={0.05} step={0.002} precision={4} unit="M" tone="violet" onChange={(value) => { setScnAdded(value); setReactionProgress(0); setMeasuredConc(controlConc); }} />
      <CompactRangeControl label="ปริมาณ NaF" symbol="NaF" value={nafAdded} min={0} max={0.1} step={0.005} precision={3} unit="M" tone="blue" onChange={(value) => { setNafAdded(value); setReactionProgress(0); setMeasuredConc(controlConc); }} />
      <CompactRangeControl label="อุณหภูมิอ่าง" symbol="T" value={tempC} min={10} max={80} step={1} precision={0} unit="°C" tone="orange" onChange={(value) => { setTempC(value); setReactionProgress(0); setMeasuredConc(controlConc); }} />
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
        <EquilibriumScene
          controlColor={controlColor}
          mixtureColor={mixtureColor}
          tempC={tempC}
          reactionProgress={reactionProgress}
          isRunning={isRunning}
          feAdded={feAdded}
          scnAdded={scnAdded}
          nafAdded={nafAdded}
        />
      }
      controlsTitle="แผงควบคุมการรบกวนสมดุล"
      compactControls={compactControls}
      metrics={[
        { label: "[Fe(SCN)]²⁺ หลอด 2", value: `${liveConc.toFixed(4)} M`, tone: "rose" },
        { label: "อุณหภูมิหลอด 4", value: `${tempC.toFixed(0)} °C`, tone: "orange" },
        { label: "ความเข้มข้น Fe³⁺ อิสระ", value: `${Math.max(0, activeFe - liveConc).toFixed(4)} M`, tone: "orange" },
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

