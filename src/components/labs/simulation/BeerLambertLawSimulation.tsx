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
  Sun,
  TrendingDown,
  ClipboardList,
  Target,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

export interface BeerLambertDataPoint {
  index: number;
  soluteId: string;
  soluteName: string;
  wavelength: number;    // nm
  concentration: number; // M
  width: number;         // cm
  absorbance: number;    // A
}

interface SoluteInfo {
  id: string;
  name: string;
  formula: string;
  peakWavelength: number;
  maxEpsilon: number;    // L/(mol cm)
  stdDev: number;        // nm
  baseColor: string;     // rgb color string
  textColor: string;
}

const SOLUTES: SoluteInfo[] = [
  {
    id: "potassium-permanganate",
    name: "ด่างทับทิม",
    formula: "KMnO₄",
    peakWavelength: 525,
    maxEpsilon: 2.8,
    stdDev: 35,
    baseColor: "rgb(162, 28, 175)",
    textColor: "text-purple-600",
  },
  {
    id: "copper-sulfate",
    name: "จุนสี / คอปเปอร์(II) ซัลเฟต",
    formula: "CuSO₄",
    peakWavelength: 630,
    maxEpsilon: 1.6,
    stdDev: 50,
    baseColor: "rgb(37, 99, 235)",
    textColor: "text-blue-600",
  },
  {
    id: "cobalt-chloride",
    name: "โคบอลต์(II) คลอไรด์",
    formula: "CoCl₂",
    peakWavelength: 510,
    maxEpsilon: 1.0,
    stdDev: 40,
    baseColor: "rgb(219, 39, 119)",
    textColor: "text-pink-600",
  },
  {
    id: "nickel-chloride",
    name: "นิกเกิล(II) คลอไรด์",
    formula: "NiCl₂",
    peakWavelength: 400,
    maxEpsilon: 2.0,
    stdDev: 30,
    baseColor: "rgb(16, 185, 129)",
    textColor: "text-emerald-600",
  },
];

const wavelengthToRgb = (wl: number) => {
  let r = 0, g = 0, b = 0;
  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wl >= 440 && wl < 490) {
    r = 0.0;
    g = (wl - 440) / (490 - 440);
    b = 1.0;
  } else if (wl >= 490 && wl < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wl - 510) / (510 - 490);
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wl >= 580 && wl < 645) {
    r = 1.0;
    g = -(wl - 645) / (645 - 580);
    b = 0.0;
  } else if (wl >= 645 && wl <= 780) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  }
  
  let factor = 0;
  if (wl >= 380 && wl < 420) {
    factor = 0.3 + 0.7 * (wl - 380) / (420 - 380);
  } else if (wl >= 420 && wl < 701) {
    factor = 1.0;
  } else if (wl >= 701 && wl <= 780) {
    factor = 0.3 + 0.7 * (780 - wl) / (780 - 701);
  }
  
  return `rgb(${Math.round(r * factor * 255)}, ${Math.round(g * factor * 255)}, ${Math.round(b * factor * 255)})`;
};

const getEpsilon = (solute: SoluteInfo, wl: number) => {
  return solute.maxEpsilon * Math.exp(-Math.pow(wl - solute.peakWavelength, 2) / (2 * Math.pow(solute.stdDev, 2)));
};

function BeerLambertGraph({
  dataPoints,
  currentConc,
  currentAbs,
  maxAbs = 2.0,
}: {
  dataPoints: BeerLambertDataPoint[];
  currentConc: number;
  currentAbs: number;
  maxAbs?: number;
}) {
  const xCoord = (c: number) => 30 + (c / 0.5) * 150;
  const yCoord = (a: number) => 100 - (a / maxAbs) * 85;

  const currentLinePath = useMemo(() => {
    if (dataPoints.length === 0) return "";
    const sorted = [...dataPoints].sort((a, b) => a.concentration - b.concentration);
    const getX = (c: number) => 30 + (c / 0.5) * 150;
    const getY = (a: number) => 100 - (a / maxAbs) * 85;
    return sorted.map((p, idx) => `${idx === 0 ? "M" : "L"}${getX(p.concentration)},${getY(p.absorbance)}`).join(" ");
  }, [dataPoints, maxAbs]);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <TrendingDown className="h-4.5 w-4.5 text-cyan-600" />
          กราฟกฎของเบียร์-ลัมเบิร์ต
        </h3>
        <span className="text-[10px] font-bold text-cyan-600">A = ε·c·b</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-950 p-3 flex flex-col justify-between">
        <svg className="w-full h-full min-h-[174px]" viewBox="0 0 200 120" fill="none">
          {/* Grid lines */}
          <line x1="30" y1="15" x2="180" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="57.5" x2="180" y2="57.5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Y-axis metrics */}
          <text x="27" y="17.5" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">{maxAbs.toFixed(1)} A</text>
          <text x="27" y="57.5" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">{(maxAbs / 2).toFixed(1)} A</text>
          <text x="27" y="100" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">0 A</text>

          {/* Line path */}
          {currentLinePath && (
            <path d={currentLinePath} stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          )}

          {/* Logged points circles */}
          {dataPoints.map((p) => (
            <circle
              key={p.index}
              cx={xCoord(p.concentration)}
              cy={yCoord(p.absorbance)}
              r="2.5"
              fill="#22d3ee"
              stroke="#ffffff"
              strokeWidth="0.75"
            />
          ))}

          {/* Live operating indicator circle */}
          <circle
            cx={xCoord(currentConc)}
            cy={yCoord(currentAbs)}
            r="3.5"
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth="0.75"
          />

          {/* Axes lines */}
          <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

          {/* X-axis metrics */}
          <text x="30" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0</text>
          <text x="67.5" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.125</text>
          <text x="105" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.25</text>
          <text x="142.5" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.375</text>
          <text x="180" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.50 M</text>
          <text x="195" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold">c</text>
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
  dataPoints: BeerLambertDataPoint[];
  onClearPoint: (idx: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-cyan-600" />
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
          <thead className="bg-cyan-50/70 text-[11px] font-black text-cyan-800">
            <tr>
              <th className="px-2.5 py-2">จุดวัด</th>
              <th className="px-2.5 py-2">สารละลาย</th>
              <th className="px-2.5 py-2">คลื่น (nm)</th>
              <th className="px-2.5 py-2">ความเข้มข้น</th>
              <th className="px-2.5 py-2">คิวเวตต์</th>
              <th className="px-2.5 py-2"> Abs (A)</th>
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
                  <td className="px-2.5 py-2">{point.soluteName}</td>
                  <td className="px-2.5 py-2 font-mono">{point.wavelength} nm</td>
                  <td className="px-2.5 py-2 font-mono text-cyan-600">{point.concentration.toFixed(3)} M</td>
                  <td className="px-2.5 py-2 font-mono text-amber-600">{point.width.toFixed(1)} cm</td>
                  <td className="px-2.5 py-2 font-mono text-rose-600">{point.absorbance.toFixed(3)}</td>
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
  solute,
  wavelength,
  concentration,
  width,
  absorbance,
}: {
  solute: SoluteInfo;
  wavelength: number;
  concentration: number;
  width: number;
  absorbance: number;
}) {
  const currentEpsilon = getEpsilon(solute, wavelength);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Sliders className="h-4.5 w-4.5 text-cyan-600" />
        ทฤษฎีและตัวแปรคำนวณ
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3 text-left">
        <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3 text-center text-sm font-black text-slate-800 font-mono">
          A = &epsilon; &times; c &times; b
        </div>
        <p className="text-[11px] font-semibold leading-relaxed text-slate-500">
          ความดูดกลืนแสง A สัมพันธ์เป็นเส้นตรงกับความเข้มข้น c ของตัวละลาย และความกว้างคิวเวตต์ b โดยมี ε เป็นค่าสัมประสิทธิ์การดูดกลืนแสงจำเพาะช่วงคลื่น
        </p>
        <div className="grid grid-cols-1 gap-1.5 text-[11px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1">สัมประสิทธิ์ &epsilon;: <b className="text-cyan-700">{currentEpsilon.toFixed(3)} L/(mol cm)</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">ความเข้มข้น c: <b className="text-indigo-700">{concentration.toFixed(3)} M</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">ความกว้างคิวเวตต์ b: <b className="text-amber-700">{width.toFixed(2)} cm</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">ค่าดูดกลืนแสง Absorbance (A): <b className="text-rose-700">{absorbance.toFixed(3)} A</b></span>
        </div>
      </div>
    </section>
  );
}

function CuvetteScene({
  solute,
  wavelength,
  concentration,
  width,
  absorbance,
}: {
  solute: SoluteInfo;
  wavelength: number;
  concentration: number;
  width: number;
  absorbance: number;
}) {
  const beamColor = wavelengthToRgb(wavelength);
  
  // Solution alpha reflects concentration
  const solutionAlpha = Math.min(0.9, 0.05 + concentration * 1.7);
  const solutionColor = solute.baseColor.replace("rgb", "rgba").replace(")", `, ${solutionAlpha})`);
  
  // Cuvette geometry based on width (1.0cm to 2.0cm, maps to 90px to 180px wide)
  const cuvetteWidthPx = 80 + (width - 1.0) * 100;
  const cuvetteXPx = 200 - cuvetteWidthPx / 2;

  // Transmittance T = 10^-A
  const transmittance = Math.pow(10, -absorbance);
  
  return (
    <div className="relative flex h-full min-h-[258px] items-center justify-center overflow-hidden rounded-2xl border border-cyan-100 bg-[linear-gradient(135deg,#f8fdff_0%,#f0fbff_48%,#fafdfc_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/75 px-3 py-1.5 text-left shadow-sm backdrop-blur">
        <p className="text-[9px] font-black uppercase text-cyan-600">spectrophotometry path</p>
        <p className="mt-0.5 text-xs font-black text-slate-700">จำลองการเคลื่อนที่ช่วงแสง</p>
      </div>

      <svg className="relative z-10 w-full max-w-[440px] h-60" viewBox="0 0 400 240">
        {/* Light Source Box (Left) */}
        <g transform="translate(15, 95)">
          <rect x="0" y="0" width="55" height="50" rx="8" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
          <circle cx="55" cy="25" r="8" fill="#facc15" />
          <text x="27.5" y="30" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">SOURCE</text>
        </g>

        {/* Detector Box (Right) */}
        <g transform="translate(325, 95)">
          <rect x="0" y="0" width="60" height="50" rx="8" fill="#475569" stroke="#334155" strokeWidth="2.5" />
          <rect x="8" y="10" width="44" height="30" rx="4" fill="#0f172a" />
          <text x="30" y="29" fill="#22c55e" fontSize="13" fontWeight="900" textAnchor="middle" className="font-mono">
            {absorbance.toFixed(3)}
          </text>
          <text x="30" y="8" fill="#cbd5e1" fontSize="7" fontWeight="bold" textAnchor="middle">Absorbance</text>
        </g>

        {/* Light Beam - Left (Source to Cuvette) */}
        <line x1="78" y1="120" x2={cuvetteXPx} y2="120" stroke={beamColor} strokeWidth="15" strokeLinecap="round" opacity="0.95" />
        
        {/* Cuvette filled with chemical solute */}
        <g transform={`translate(${cuvetteXPx}, 65)`}>
          <rect x="0" y="0" width={cuvetteWidthPx} height="110" rx="4" fill="rgba(255,255,255,0.7)" stroke="#0891b2" strokeWidth="3" />
          {/* Solution layer */}
          <rect x="3" y="10" width={cuvetteWidthPx - 6} height="97" rx="2" fill={solutionColor} />
          {/* Reflections */}
          <line x1="8" y1="5" x2="8" y2="105" stroke="#ffffff" strokeWidth="1.5" opacity="0.3" />
          <text x={cuvetteWidthPx / 2} y="118" fill="#0891b2" fontSize="9.5" fontWeight="900" textAnchor="middle">
            b = {width.toFixed(1)} cm
          </text>
        </g>

        {/* Light Beam - Right (Cuvette to Detector) - Dimmed based on Transmittance */}
        <line
          x1={cuvetteXPx + cuvetteWidthPx}
          y1="120"
          x2="322"
          y2="120"
          stroke={beamColor}
          strokeWidth="15"
          strokeLinecap="round"
          opacity={Math.max(0.04, transmittance * 0.95)}
        />
        
        {/* Molecular particle floatings */}
        {concentration > 0 && (
          <g className="animate-pulse" opacity="0.8">
            <circle cx={cuvetteXPx + cuvetteWidthPx * 0.25} cy="90" r="3" fill="#ffffff" />
            <circle cx={cuvetteXPx + cuvetteWidthPx * 0.65} cy="140" r="2.5" fill="#ffffff" />
            <circle cx={cuvetteXPx + cuvetteWidthPx * 0.45} cy="115" r="2" fill="#ffffff" />
          </g>
        )}

        {/* Spectrum line reference at bottom */}
        <g transform="translate(100, 20)">
          <text x="100" y="-8" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">ช่วงความยาวคลื่นวิเคราะห์</text>
          <rect x="0" y="0" width="200" height="8" rx="4" fill="url(#spectrumGrad)" />
          {/* Indicator slider line */}
          <line x1={(wavelength - 380) / 400 * 200} y1="-3" x2={(wavelength - 380) / 400 * 200} y2="11" stroke="#334155" strokeWidth="2.5" />
          <defs>
            <linearGradient id="spectrumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={wavelengthToRgb(380)} />
              <stop offset="15%" stopColor={wavelengthToRgb(440)} />
              <stop offset="30%" stopColor={wavelengthToRgb(490)} />
              <stop offset="45%" stopColor={wavelengthToRgb(510)} />
              <stop offset="70%" stopColor={wavelengthToRgb(580)} />
              <stop offset="85%" stopColor={wavelengthToRgb(645)} />
              <stop offset="100%" stopColor={wavelengthToRgb(780)} />
            </linearGradient>
          </defs>
        </g>
      </svg>
    </div>
  );
}

export default function BeerLambertLawSimulation() {
  const router = useRouter();

  // Inputs
  const [selectedSoluteId, setSelectedSoluteId] = useState("potassium-permanganate");
  const [wavelength, setWavelength] = useState(525);      // 380 nm - 780 nm
  const [concentration, setConcentration] = useState(0.1); // 0.005 M - 0.50 M
  const [cuvetteWidth, setCuvetteWidth] = useState(1.0);   // 1.0 cm - 2.0 cm

  // Simulation running loop
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<BeerLambertDataPoint[]>([]);

  // Quest tracker: reach Absorbance value of 0.80 - 1.20 with copper-sulfate solute
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  // Derived values
  const solute = useMemo(() => SOLUTES.find((s) => s.id === selectedSoluteId) || SOLUTES[0], [selectedSoluteId]);
  
  const epsilon = useMemo(() => getEpsilon(solute, wavelength), [solute, wavelength]);
  const absorbance = useMemo(() => {
    const raw = epsilon * concentration * cuvetteWidth;
    return parseFloat(raw.toFixed(4));
  }, [epsilon, concentration, cuvetteWidth]);

  // Sync refs
  const isRunningRef = useRef(isRunning);
  const elapsedRef = useRef(elapsedSeconds);
  const soluteIdRef = useRef(selectedSoluteId);
  const absRef = useRef(absorbance);
  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { soluteIdRef.current = selectedSoluteId; }, [selectedSoluteId]);
  useEffect(() => { absRef.current = absorbance; }, [absorbance]);
  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Wavelength auto calibration peak button click handler
  const handleAutoCalibrate = () => {
    setWavelength(solute.peakWavelength);
  };

  // Main tick loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        const delta = 0.5;
        const nextTime = elapsedRef.current + delta;
        if (nextTime <= 100) {
          setElapsedSeconds(nextTime);
          elapsedRef.current = nextTime;
        } else {
          setIsRunning(false);
          isRunningRef.current = false;
        }

        // Quest check: copper-sulfate and Absorbance in [0.80, 1.20] for 12 seconds
        if (soluteIdRef.current === "copper-sulfate" && absRef.current >= 0.8 && absRef.current <= 1.2) {
          const nextProg = Math.min(12, questProgressRef.current + delta);
          setQuestProgress(nextProg);
          questProgressRef.current = nextProg;

          if (nextProg >= 12 && !questSuccessRef.current) {
            setQuestSuccess(true);
            questSuccessRef.current = true;
            alert("🎉 ยินดีด้วย! คุณปรับแต่งสเปกโทรจนได้ค่าการดูดกลืนแสงจุนสี 0.8 - 1.2 เป็นเวลา 12 วินาทีต่อเนื่องสำเร็จ บันทึกผลเพื่อเก็บความคืบหน้า");
          }
        } else {
          setQuestProgress(0);
          questProgressRef.current = 0;
        }
      }, 500);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isRunning]);

  const handleStartStop = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setSelectedSoluteId("potassium-permanganate");
    setWavelength(525);
    setConcentration(0.1);
    setCuvetteWidth(1.0);
    setQuestProgress(0);
    setDataPoints([]);
  };

  const handleAddPoint = () => {
    setDataPoints((prev) => [
      ...prev,
      {
        index: prev.length + 1,
        soluteId: solute.id,
        soluteName: solute.formula,
        wavelength,
        concentration,
        width: cuvetteWidth,
        absorbance,
      },
    ]);
  };

  const handleClearPoint = (idx: number) => {
    setDataPoints((prev) => prev.filter((p) => p.index !== idx).map((p, i) => ({ ...p, index: i + 1 })));
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) { alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!"); return; }
    const headers = "จุดวัด,ตัวละลาย,คลื่น (nm),ความเข้มข้น (M),คิวเวตต์ (cm), Absorbance (A)\n";
    const rows = dataPoints.map((p) => `${p.index},${p.soluteName},${p.wavelength},${p.concentration.toFixed(3)},${p.width.toFixed(1)},${p.absorbance.toFixed(3)}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scisiam_beerlambert_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyData = () => {
    if (dataPoints.length === 0) { alert("ไม่มีข้อมูลบันทึกสำหรับการคัดลอก!"); return; }
    const content = dataPoints
      .map((p) => `จุดที่ ${p.index} | สาร: ${p.soluteName} | คลื่น: ${p.wavelength}nm | c: ${p.concentration.toFixed(3)}M | b: ${p.width.toFixed(1)}cm | Abs: ${p.absorbance.toFixed(3)}`)
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"));
  };

  const handleSaveResults = async () => {
    if (dataPoints.length === 0) { alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล!"); return; }
    const experimentData = {
      labId: "beer-lambert-law",
      timestamp: new Date().toLocaleString("th-TH"),
      dataPoints: dataPoints.map((p) => ({
        concentration: p.concentration,
        absorbance: p.absorbance,
      })),
    };
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_beer_lambert_experiment",
      localPayload: experimentData,
      labId: "beer-lambert-law",
      title: "Spectrophotometry & Concentration",
      graphPoints: experimentData.dataPoints,
      tableRows: experimentData.dataPoints,
      summary: { dataPointCount: experimentData.dataPoints.length },
      score: Math.min(100, experimentData.dataPoints.length * 20),
    });
    alert("บันทึกข้อมูลการทดลอง (กราฟ Absorbance-Concentration และตารางผลล่าสุด) สำเร็จ! 🎉");
    router.push("/labs/beer-lambert-law");
  };

  const controls = (
    <div className="space-y-4 text-left">
      {/* Solute Selector */}
      <div className="group bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <label className="block text-xs font-bold text-slate-600 mb-1.5">เลือกสารละลายตัวอย่าง</label>
        <div className="grid grid-cols-2 gap-2">
          {SOLUTES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSoluteId(s.id);
                // Auto set to peak wavelength to assist user
                setWavelength(s.peakWavelength);
              }}
              className={`py-2 px-2.5 rounded-xl border text-[11px] font-black cursor-pointer text-center leading-[1.3] active:scale-95 transition-all ${
                selectedSoluteId === s.id
                  ? "bg-cyan-600 border-cyan-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div>{s.name}</div>
              <div className="text-[9px] opacity-75">{s.formula}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Wavelength Slider */}
      <div className="group bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
          <span className="text-slate-600">ความยาวคลื่นวิเคราะห์ (&lambda;)</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAutoCalibrate}
              className="text-[9px] font-black bg-cyan-100 text-cyan-700 border border-cyan-200 px-1.5 py-0.5 rounded hover:bg-cyan-200"
            >
              Peak ({solute.peakWavelength} nm)
            </button>
            <span className="text-cyan-600 font-extrabold text-[10px] bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100">
              {wavelength} nm
            </span>
          </div>
        </div>
        <input
          type="range" min="380" max="780" step="5" value={wavelength}
          onChange={(e) => setWavelength(Number(e.target.value))}
          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      {/* Concentration Slider */}
      <div className="group bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
          <span className="text-slate-600">ความเข้มข้นสารละลาย (c)</span>
          <span className="text-indigo-600 font-extrabold text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
            {concentration.toFixed(3)} M
          </span>
        </div>
        <input
          type="range" min="0.01" max="0.5" step="0.01" value={concentration}
          onChange={(e) => setConcentration(Number(e.target.value))}
          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex items-center gap-1.5 mt-2">
          {[-0.10, -0.01, 0.01, 0.10].map((val) => (
            <button key={val} onClick={() => setConcentration((prev) => Math.max(0.01, Math.min(0.5, prev + val)))}
              className="flex-1 py-1 text-[10px] font-black text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition active:scale-95">
              {val > 0 ? `+${val.toFixed(2)}` : `${val.toFixed(2)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Cuvette Width Slider */}
      <div className="group bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
          <span className="text-slate-600">ความกว้างคิวเวตต์ช่องแสงผ่าน (b)</span>
          <span className="text-amber-600 font-extrabold text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
            {cuvetteWidth.toFixed(1)} cm
          </span>
        </div>
        <input
          type="range" min="1.0" max="2.0" step="0.1" value={cuvetteWidth}
          onChange={(e) => setCuvetteWidth(Number(e.target.value))}
          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${isRunning ? "bg-slate-700" : "bg-blue-600 hover:bg-blue-700"}`}>
          {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
          {isRunning ? `${elapsedSeconds.toFixed(0)}s หยุด` : "เริ่มจำลอง"}
        </button>
        <button onClick={handleAddPoint} className="inline-flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[11px] font-black text-blue-700 hover:bg-blue-100">บันทึกจุด</button>
        <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="รีเซ็ต">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="cyan"
      labId="beer-lambert-law"
      category="Chemistry"
      title="Spectrophotometry & Concentration"
      subtitle="ตรวจวัดและสร้างกราฟความสัมพันธ์ค่าดูดกลืนแสงเชิงพิกัดความเข้มข้นของสารละลายสีตามกฎเบียร์-ลัมเบิร์ต"
      statusLabel={isRunning ? "กำลังสแกนแสงเหนี่ยวนำ" : "ระบบสเปกโทรส่องผ่านปกติ"}
      icon={Sun}
      sceneTitle="เครื่องสเปกโทรโฟโตมิเตอร์จำลอง"
      scene={
        <CuvetteScene
          solute={solute}
          wavelength={wavelength}
          concentration={concentration}
          width={cuvetteWidth}
          absorbance={absorbance}
        />
      }
      controlsTitle="แผงควบคุมสเปกโทรโฟโตมิเตอร์"
      controls={controls}
      metrics={[
        { label: "ค่าดูดกลืนแสง A", value: `${absorbance.toFixed(3)} A`, tone: "rose" },
        { label: "ความเข้มข้น c", value: `${concentration.toFixed(3)} M`, tone: "cyan" },
        { label: "ความกว้าง cuvette b", value: `${cuvetteWidth.toFixed(1)} cm`, tone: "emerald" },
        { label: "ความยาวคลื่น λ", value: `${wavelength} nm`, tone: "orange" },
      ]}
      graph={
        <BeerLambertGraph
          dataPoints={dataPoints}
          currentConc={concentration}
          currentAbs={absorbance}
          maxAbs={2.0}
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
          solute={solute}
          wavelength={wavelength}
          concentration={concentration}
          width={cuvetteWidth}
          absorbance={absorbance}
        />
      }
      steps={[
        { label: "เลือกตัวละลายสี", icon: Sliders },
        { label: "ปรับช่วงแสงสูงสุด", icon: Sun },
        { label: "ปรับแต่งความเข้มข้น", icon: Sliders },
        { label: "บันทึกกราฟเชิงเส้น", icon: ClipboardList },
        { label: "คำนวณกฎผลรวมแสง", icon: Target },
      ]}
      learningGoals={[
        "อธิบายความสัมพันธ์ตามกฎของเบียร์-ลัมเบิร์ต A = ε·c·b ได้ถูกต้อง",
        "สร้างและใช้กราฟมาตรฐาน (Calibration Curve) เพื่อคาดคะเนความเข้มข้นได้",
        "วิเคราะห์บทบาทของความยาวคลื่นและการเลือกความยาวคลื่นดูดกลืนแสงสูงสุด (λ max)",
        "ประยุกต์ความรู้สเปกโทรโฟโตเมทรีในงานวิเคราะห์วิจัยเชิงปริมาณ",
      ]}
      progressLabel="ระยะเวลาที่ Absorbance จุนสีอยู่ในช่วงภารกิจ"
      progressValue={`${questProgress.toFixed(1)} / 12 วินาที`}
      progressPercent={(questProgress / 12) * 100}
      tips={[
        "ในการทดลองจริง ควรเลือกความยาวคลื่นดูดกลืนแสงสูงสุด (Peak) เพื่อให้ผลวัดไวและแม่นยำที่สุด",
        "ค่าการดูดกลืนแสง (Absorbance) แปรผันตรงกับความเข้มข้น แต่ถ้าสารเข้มข้นเกินไป ค่าอาจเบี่ยงเบนจากแนวตรงได้",
        "น้ำกลั่นบริสุทธิ์ (Blank) มีค่าการดูดกลืนแสงเป็น 0 เสมอเนื่องจากไม่มีตัวดูดกลืนแสงสี",
        "การเพิ่มความกว้างของคิวเวตต์ส่งผลตรงให้อัตราความเข้มแสงตกกระทบลดลง (ค่าดูดกลืนแสงเพิ่มขึ้น)",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
