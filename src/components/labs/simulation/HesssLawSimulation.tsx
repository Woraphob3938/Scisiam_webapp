"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
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
import CompactRangeControl from "@/components/labs/simulation/CompactRangeControl";
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

function computeTempAtTime(t: number, rxId: 1 | 2 | 3, mass: number, vol: number) {
  const moles = mass / MOLAR_MASS_NAOH;
  const qJ = moles * (-DH_REF[rxId]) * 1000;
  const dTMax = qJ / (vol * SPECIFIC_HEAT);
  const tRise = rxId === 2 ? 14 : 8;
  const scale = (1 - Math.exp(-t / tRise)) * Math.exp(-t / 500);

  return Number((25 + Math.max(0, dTMax * scale)).toFixed(2));
}

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
  naohMass,
  solutionVol,
}: {
  reactionId: 1 | 2 | 3;
  tempC: number;
  elapsed: number;
  isRunning: boolean;
  naohMass: number;
  solutionVol: number;
}) {
  const thermometerHeight = Math.min(78, Math.max(12, ((tempC - 20) / 45) * 68));
  const reactionProgress = Math.min(1, elapsed / 100);
  const stirOffset = isRunning ? Math.sin(elapsed * 2.4) * 4 : 0;
  const pelletY = 56 + Math.min(1, elapsed / 12) * 70;
  const heatOpacity = Math.min(0.85, Math.max(0.08, (tempC - 25) / 28));
  const equation = reactionId === 1
    ? "NaOH(s) + HCl(aq) → NaCl(aq) + H₂O(l)"
    : reactionId === 2
      ? "NaOH(s) → Na⁺(aq) + OH⁻(aq)"
      : "NaOH(aq) + HCl(aq) → NaCl(aq) + H₂O(l)";
  const reactionLabel = reactionId === 1
    ? "ปฏิกิริยารวม"
    : reactionId === 2
      ? "การละลาย NaOH"
      : "การสะเทินกรด-เบส";

  return (
    <div
      className="relative flex h-full min-h-[258px] items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fffaf5_0%,#fff4e8_100%)]"
      data-testid="hess-calorimeter-scene"
    >
      <svg
        className="h-full min-h-[258px] w-full"
        viewBox="0 0 560 270"
        role="img"
        aria-labelledby="hess-calorimeter-scene-title hess-calorimeter-scene-desc"
      >
        <title id="hess-calorimeter-scene-title">การวัดความร้อนเพื่อพิสูจน์กฎของเฮสส์</title>
        <desc id="hess-calorimeter-scene-desc">
          ถ้วยแคลอริมิเตอร์สองชั้นบรรจุสารละลาย มีการเติมโซเดียมไฮดรอกไซด์ กวนสาร และวัดอุณหภูมิที่เปลี่ยนไปเพื่อนำไปคำนวณเอนทัลปี
        </desc>

        <path d="M38 230H522" stroke="#cbd5e1" strokeWidth="3" />
        <path d="M46 233H514V250H46Z" fill="#e2e8f0" />

        <g transform="translate(38 34)">
          <rect width="176" height="84" rx="20" fill="#fff" stroke="#fed7aa" strokeWidth="2" />
          <text x="16" y="23" fill="#c2410c" fontSize="11" fontWeight="900">ขั้นที่ {reactionId} · {reactionLabel}</text>
          <text x="16" y="45" fill="#334155" fontSize="10" fontWeight="800">{equation}</text>
          <text x="16" y="68" fill="#64748b" fontSize="9" fontWeight="800">
            {naohMass.toFixed(1)} g NaOH · {solutionVol.toFixed(0)} mL
          </text>
        </g>

        <g transform="translate(55 146)">
          <rect width="122" height="60" rx="18" fill="#fff" stroke="#fdba74" strokeWidth="2" />
          <text x="16" y="23" fill="#9a3412" fontSize="10" fontWeight="900">สมการแคลอริมิเตอร์</text>
          <text x="16" y="43" fill="#0f172a" fontSize="16" fontWeight="900">q = mcΔT</text>
          <path d="M93 17C105 24 106 37 95 45" fill="none" stroke="#fb923c" strokeWidth="4" strokeLinecap="round" opacity={heatOpacity} />
        </g>

        <g transform="translate(238 35)">
          <rect x="16" y="48" width="134" height="142" rx="24" fill="#e2e8f0" stroke="#64748b" strokeWidth="4" />
          <rect x="27" y="58" width="112" height="121" rx="18" fill="#fff" stroke="#cbd5e1" strokeWidth="3" />
          <path d="M30 108H136V167C136 175 130 180 122 180H44C36 180 30 175 30 167Z" fill="#fb923c" opacity=".34" />
          <path d="M30 108C57 101 109 101 136 108" fill="none" stroke="#f97316" strokeWidth="3" />
          <rect x="6" y="38" width="154" height="20" rx="8" fill="#475569" />
          <rect x="48" y="29" width="70" height="10" rx="4" fill="#64748b" />

          <g transform={`translate(${stirOffset} 0)`}>
            <path d="M55 12V145H72" fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="55" cy="12" r="7" fill="#94a3b8" />
          </g>

          <g transform="translate(100 8)">
            <rect x="7" width="14" height="119" rx="7" fill="#fff" stroke="#94a3b8" strokeWidth="2.5" />
            <rect x="12" y={111 - thermometerHeight} width="4" height={thermometerHeight} rx="2" fill="#ef4444" />
            <circle cx="14" cy="119" r="13" fill="#ef4444" stroke="#94a3b8" strokeWidth="2.5" />
            <path d="M22 24H29M22 43H27M22 62H29M22 81H27" stroke="#94a3b8" strokeWidth="2" />
          </g>

          {isRunning && elapsed < 12 && (
            <g transform={`translate(74 ${pelletY})`}>
              <rect width="13" height="8" rx="3" fill="#fff" stroke="#94a3b8" />
              <rect x="8" y="5" width="11" height="7" rx="3" fill="#e2e8f0" stroke="#94a3b8" />
            </g>
          )}

          {isRunning && reactionProgress > 0.08 && (
            <g fill="#fff" opacity={0.45 + reactionProgress * 0.4}>
              <circle cx="52" cy={156 - (elapsed * 2) % 40} r="3" />
              <circle cx="78" cy={151 - (elapsed * 1.7) % 34} r="2.5" />
              <circle cx="113" cy={159 - (elapsed * 2.3) % 44} r="3.5" />
            </g>
          )}
        </g>

        <g transform="translate(411 57)">
          <rect width="112" height="90" rx="20" fill="#172033" stroke="#475569" strokeWidth="3" />
          <text x="56" y="24" textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="900">TEMPERATURE</text>
          <rect x="15" y="33" width="82" height="32" rx="9" fill="#052e16" />
          <text x="56" y="55" textAnchor="middle" fill="#86efac" fontSize="18" fontWeight="900">{tempC.toFixed(1)}°C</text>
          <circle cx="22" cy="76" r="4" fill={isRunning ? "#22c55e" : "#94a3b8"} />
          <text x="33" y="80" fill="#cbd5e1" fontSize="9" fontWeight="800">
            {isRunning ? "กำลังบันทึก" : elapsed >= 100 ? "วัดเสร็จแล้ว" : "พร้อมวัด"}
          </text>
        </g>

        <g opacity={heatOpacity}>
          <path d="M407 169C419 158 419 145 407 134" fill="none" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
          <path d="M426 178C442 162 442 142 428 127" fill="none" stroke="#fb923c" strokeWidth="4" strokeLinecap="round" />
          <path d="M445 184C464 164 463 138 448 119" fill="none" stroke="#fdba74" strokeWidth="3" strokeLinecap="round" />
        </g>

        <text x="280" y="220" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="900">
          {isRunning
            ? `กำลังเก็บกราฟอุณหภูมิ ${Math.round(reactionProgress * 100)}%`
            : elapsed >= 100
              ? "วัดอุณหภูมิสูงสุดและคำนวณ ΔH แล้ว"
              : "เลือกขั้นปฏิกิริยาแล้วเริ่มทดลอง"}
        </text>
      </svg>
    </div>
  );
}

export default function HesssLawSimulation() {

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
  const elapsedRef = useRef(elapsedSeconds);
  const rxIdRef = useRef(reactionId);
  const massRef = useRef(naohMass);
  const volRef = useRef(solutionVol);
  const runsRef = useRef(completedRuns);
  const livePointsRef = useRef<CalorimetryDataPoint[]>([]);
  const questSuccessRef = useRef(questSuccess);

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

  // Main tick loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        const delta = 1.0;
        const nextTime = elapsedRef.current + delta;
        const rxId = rxIdRef.current;
        const mass = massRef.current;
        const vol = volRef.current;
        const currentT = computeTempAtTime(nextTime, rxId, mass, vol);
        const nextPoint = { time: nextTime, temperature: currentT };
        const nextPoints = [...livePointsRef.current, nextPoint].slice(-101);

        elapsedRef.current = nextTime;
        livePointsRef.current = nextPoints;
        setElapsedSeconds(nextTime);
        setTempC(currentT);
        setLivePoints(nextPoints);

        if (nextTime < 100) return;

        setIsRunning(false);
        const maxT = Math.max(...nextPoints.map((point) => point.temperature));
        const dT = maxT - 25;
        const moles = mass / MOLAR_MASS_NAOH;
        const qJ = vol * SPECIFIC_HEAT * dT;
        const dhRun = -(qJ / 1000) / moles;
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
          tempInitial: 25,
          tempFinal: maxT,
          deltaTemp: dT,
          enthalpyKJ: dhRun,
        };
        const nextRuns = [
          ...runsRef.current.filter((run) => run.reactionId !== rxId),
          newRun,
        ].sort((a, b) => a.reactionId - b.reactionId);

        runsRef.current = nextRuns;
        setCompletedRuns(nextRuns);

        const run1 = nextRuns.find((run) => run.reactionId === 1);
        const run2 = nextRuns.find((run) => run.reactionId === 2);
        const run3 = nextRuns.find((run) => run.reactionId === 3);
        if (run1 && run2 && run3 && !questSuccessRef.current) {
          const sum = run2.enthalpyKJ + run3.enthalpyKJ;
          const error = Math.abs((run1.enthalpyKJ - sum) / run1.enthalpyKJ) * 100;
          if (error < 5) {
            questSuccessRef.current = true;
            setQuestSuccess(true);
          }
        }
      }, 100);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isRunning]);

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      setIsRunning(true);
      setElapsedSeconds(0);
      setTempC(25.0);
      const initialPoints = [{ time: 0, temperature: 25 }];
      elapsedRef.current = 0;
      livePointsRef.current = initialPoints;
      setLivePoints(initialPoints);
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
    elapsedRef.current = 0;
    livePointsRef.current = [];
  };

  const handleClearRun = (rId: 1 | 2 | 3) => {
    setCompletedRuns((prev) => prev.filter((r) => r.reactionId !== rId));
  };

  const resetCurrentMeasurement = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setTempC(25);
    setLivePoints([]);
    elapsedRef.current = 0;
    livePointsRef.current = [];
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
  };

  const controls = (
    <div className="space-y-3 text-left">
      {/* Reaction select */}
      <div className="group bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <label className="block text-xs font-bold text-slate-600 mb-1.5">เลือกขั้นตอนปฏิกิริยา</label>
        <div className="flex flex-col gap-1.5">
          {([1, 2, 3] as const).map((rId) => (
            <button
              key={rId}
              onClick={() => {
                setReactionId(rId);
                resetCurrentMeasurement();
              }}
              disabled={isRunning}
              className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-black cursor-pointer text-left leading-[1.3] active:scale-95 transition-all ${
                reactionId === rId
                  ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              } disabled:cursor-not-allowed disabled:opacity-60`}
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

    </div>
  );

  const compactControls = (
    <>
      <CompactRangeControl
        label="มวล NaOH"
        symbol="m"
        value={naohMass}
        min={1}
        max={4}
        step={0.5}
        precision={1}
        unit="g"
        tone="orange"
        onChange={(value) => {
          setNaohMass(value);
          resetCurrentMeasurement();
        }}
      />
      <CompactRangeControl
        label="ปริมาตรสารละลาย"
        symbol="V"
        value={solutionVol}
        min={50}
        max={150}
        step={10}
        precision={0}
        unit="mL"
        tone="violet"
        onChange={(value) => {
          setSolutionVol(value);
          resetCurrentMeasurement();
        }}
      />
    </>
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
          naohMass={naohMass}
          solutionVol={solutionVol}
        />
      }
      controlsTitle="แผงควบคุมแคลอริมิเตอร์"
      controls={controls}
      compactControls={compactControls}
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
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}

