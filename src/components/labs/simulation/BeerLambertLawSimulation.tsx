"use client";

import React, { useState, useEffect, useRef, useMemo, useId } from "react";
import {
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
import CompactRangeControl from "@/components/labs/simulation/CompactRangeControl";
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

function SpectrophotometerScene({
  solute,
  wavelength,
  concentration,
  width,
  measuredAbsorbance,
  scanProgress,
  isRunning,
}: {
  solute: SoluteInfo;
  wavelength: number;
  concentration: number;
  width: number;
  measuredAbsorbance: number;
  scanProgress: number;
  isRunning: boolean;
}) {
  const spectrumGradientId = useId();
  const sampleGradientId = useId();
  const beamColor = wavelengthToRgb(wavelength);
  const solutionAlpha = Math.min(0.9, 0.05 + concentration * 1.7);
  const solutionColor = solute.baseColor.replace("rgb", "rgba").replace(")", `, ${solutionAlpha})`);
  const transmittance = Math.pow(10, -measuredAbsorbance);
  const beamOpacity = isRunning || scanProgress >= 1 ? 0.92 : 0.18;
  const detectorOpacity = Math.max(0.06, transmittance * beamOpacity);
  const scanX = 60 + scanProgress * 424;
  
  return (
    <div
      className="relative flex h-full min-h-[258px] items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f4fbff_0%,#e8f8ff_100%)]"
      data-testid="spectrophotometry-scene"
    >
      <svg
        className="h-full min-h-[258px] w-full"
        viewBox="0 0 560 270"
        role="img"
        aria-labelledby="spectrophotometry-scene-title spectrophotometry-scene-desc"
      >
        <title id="spectrophotometry-scene-title">เครื่องสเปกโทรโฟโตมิเตอร์วัดความเข้มข้น</title>
        <desc id="spectrophotometry-scene-desc">
          แสงจากหลอดกำเนิดผ่านช่องแคบ ตัวแยกความยาวคลื่น คิวเวตต์สารละลาย และตัวตรวจจับเพื่อคำนวณค่าดูดกลืนแสง
        </desc>
        <defs>
          <linearGradient id={spectrumGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6d28d9" />
            <stop offset="22%" stopColor="#2563eb" />
            <stop offset="42%" stopColor="#06b6d4" />
            <stop offset="58%" stopColor="#22c55e" />
            <stop offset="74%" stopColor="#facc15" />
            <stop offset="88%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id={sampleGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".42" />
            <stop offset="100%" stopColor={solutionColor} />
          </linearGradient>
        </defs>

        <rect x="36" y="48" width="488" height="172" rx="28" fill="#fff" stroke="#bae6fd" strokeWidth="3" />
        <path d="M56 190H504" stroke="#cbd5e1" strokeWidth="3" />

        <g transform="translate(54 92)">
          <rect width="76" height="78" rx="18" fill="#1e293b" />
          <circle cx="38" cy="30" r="17" fill="#fef08a" stroke="#f59e0b" strokeWidth="4" />
          <path d="M22 30H54M38 14V46M27 19L49 41M49 19L27 41" stroke="#fff7ed" strokeWidth="3" />
          <text x="38" y="63" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="900">หลอดกำเนิดแสง</text>
        </g>

        <rect x="145" y="98" width="10" height="66" rx="5" fill="#475569" />
        <rect x="148" y="111" width="4" height="40" rx="2" fill={beamColor} opacity={beamOpacity} />

        <g transform="translate(174 85)">
          <rect width="92" height="92" rx="18" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
          <path d="M31 66L46 21L62 66Z" fill={`url(#${spectrumGradientId})`} stroke="#64748b" strokeWidth="2" />
          <text x="46" y="82" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="900">MONOCHROMATOR</text>
        </g>

        <path d="M130 131H145M155 131H174M266 131H307" stroke={beamColor} strokeWidth="9" strokeLinecap="round" opacity={beamOpacity} />

        <g transform="translate(307 68)">
          <rect width="90" height="126" rx="10" fill="#fff" fillOpacity=".72" stroke="#0891b2" strokeWidth="3" />
          <rect x="8" y="18" width="74" height="100" rx="6" fill={`url(#${sampleGradientId})`} />
          <path d="M18 22V112" stroke="#fff" strokeWidth="3" strokeOpacity=".65" />
          <circle cx="58" cy="70" r="4" fill="#fff" fillOpacity=".55" />
          <circle cx="38" cy="96" r="3" fill="#fff" fillOpacity=".5" />
          <text x="45" y="145" textAnchor="middle" fill="#0e7490" fontSize="10" fontWeight="900">คิวเวตต์ {width.toFixed(1)} cm</text>
        </g>

        <path d="M397 131H434" stroke={beamColor} strokeWidth="9" strokeLinecap="round" opacity={detectorOpacity} />

        <g transform="translate(434 83)">
          <rect width="72" height="96" rx="18" fill="#0f172a" stroke="#334155" strokeWidth="3" />
          <rect x="10" y="14" width="52" height="48" rx="9" fill="#052e16" />
          <text x="36" y="33" textAnchor="middle" fill="#86efac" fontSize="8" fontWeight="900">ABSORBANCE</text>
          <text x="36" y="51" textAnchor="middle" fill="#dcfce7" fontSize="15" fontWeight="900">{measuredAbsorbance.toFixed(3)}</text>
          <text x="36" y="80" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontWeight="800">โฟโตไดโอด</text>
        </g>

        <rect x="120" y="24" width="320" height="10" rx="5" fill={`url(#${spectrumGradientId})`} />
        <line x1={120 + ((wavelength - 380) / 400) * 320} y1="18" x2={120 + ((wavelength - 380) / 400) * 320} y2="40" stroke="#0f172a" strokeWidth="3" />
        <text x="280" y="15" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="900">เลือกความยาวคลื่น {wavelength} nm</text>

        {isRunning && <circle cx={scanX} cy="131" r="7" fill={beamColor} stroke="#fff" strokeWidth="3" />}
        <g transform="translate(44 232)">
          <rect width="472" height="24" rx="12" fill="#e0f2fe" />
          <rect width={472 * scanProgress} height="24" rx="12" fill="#38bdf8" />
          <text x="236" y="16" textAnchor="middle" fill="#0c4a6e" fontSize="10" fontWeight="900">
            {isRunning ? `กำลังสแกน ${Math.round(scanProgress * 100)}%` : scanProgress >= 1 ? "วัดค่าดูดกลืนแสงเสร็จแล้ว" : "พร้อมเริ่มสแกนตัวอย่าง"}
          </text>
        </g>
      </svg>
    </div>
  );
}

export default function BeerLambertLawSimulation() {

  // Inputs
  const [selectedSoluteId, setSelectedSoluteId] = useState("potassium-permanganate");
  const [wavelength, setWavelength] = useState(525);      // 380 nm - 780 nm
  const [concentration, setConcentration] = useState(0.1); // 0.005 M - 0.50 M
  const [cuvetteWidth, setCuvetteWidth] = useState(1.0);   // 1.0 cm - 2.0 cm

  // Simulation running loop
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<BeerLambertDataPoint[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [measuredAbsorbance, setMeasuredAbsorbance] = useState(0);

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
  const elapsedRef = useRef(elapsedSeconds);
  const scanProgressRef = useRef(0);
  const scanSnapshotRef = useRef<BeerLambertDataPoint | null>(null);

  useEffect(() => { elapsedRef.current = elapsedSeconds; }, [elapsedSeconds]);

  // Wavelength auto calibration peak button click handler
  const handleAutoCalibrate = () => {
    setWavelength(solute.peakWavelength);
    setIsRunning(false);
    setScanProgress(0);
    setMeasuredAbsorbance(0);
    scanProgressRef.current = 0;
  };

  // Main tick loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        const snapshot = scanSnapshotRef.current;
        if (!snapshot) return;

        const nextProgress = Math.min(1, scanProgressRef.current + 0.04);
        const easedProgress = 1 - (1 - nextProgress) ** 3;
        const nextTime = nextProgress * 5;
        scanProgressRef.current = nextProgress;
        elapsedRef.current = nextTime;
        setScanProgress(nextProgress);
        setElapsedSeconds(nextTime);
        setMeasuredAbsorbance(snapshot.absorbance * easedProgress);

        if (nextProgress >= 1) {
          setDataPoints((previous) => [
            ...previous,
            { ...snapshot, index: previous.length + 1 },
          ]);
          const reachedTarget = snapshot.soluteId === "copper-sulfate"
            && snapshot.absorbance >= 0.8
            && snapshot.absorbance <= 1.2;
          setQuestProgress(reachedTarget ? 12 : 0);
          setQuestSuccess(reachedTarget);
          setIsRunning(false);
        }
      }, 100);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isRunning]);

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    scanSnapshotRef.current = {
      index: 0,
      soluteId: solute.id,
      soluteName: solute.formula,
      wavelength,
      concentration,
      width: cuvetteWidth,
      absorbance,
    };
    scanProgressRef.current = 0;
    elapsedRef.current = 0;
    setScanProgress(0);
    setMeasuredAbsorbance(0);
    setElapsedSeconds(0);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setSelectedSoluteId("potassium-permanganate");
    setWavelength(525);
    setConcentration(0.1);
    setCuvetteWidth(1.0);
    setQuestProgress(0);
    setQuestSuccess(false);
    setDataPoints([]);
    setScanProgress(0);
    setMeasuredAbsorbance(0);
    scanProgressRef.current = 0;
    scanSnapshotRef.current = null;
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
  };

  const controls = (
    <div className="space-y-3 text-left">
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
                setIsRunning(false);
                setScanProgress(0);
                setMeasuredAbsorbance(0);
                scanProgressRef.current = 0;
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

      <button type="button" onClick={handleAutoCalibrate} className="w-full rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2.5 text-xs font-black text-cyan-700 transition hover:bg-cyan-100">
        ปรับไปยังจุดดูดกลืนสูงสุด ({solute.peakWavelength} nm)
      </button>
    </div>
  );

  const compactControls = (
    <>
      <CompactRangeControl label="ความยาวคลื่น" symbol="λ" value={wavelength} min={380} max={780} step={5} precision={0} unit="nm" tone="cyan" onChange={(value) => { setWavelength(value); setIsRunning(false); setScanProgress(0); setMeasuredAbsorbance(0); scanProgressRef.current = 0; }} />
      <CompactRangeControl label="ความเข้มข้น" symbol="c" value={concentration} min={0.01} max={0.5} step={0.01} precision={3} unit="M" tone="violet" onChange={(value) => { setConcentration(value); setIsRunning(false); setScanProgress(0); setMeasuredAbsorbance(0); scanProgressRef.current = 0; }} />
      <CompactRangeControl label="ความกว้างคิวเวตต์" symbol="b" value={cuvetteWidth} min={1} max={2} step={0.1} precision={1} unit="cm" tone="amber" onChange={(value) => { setCuvetteWidth(value); setIsRunning(false); setScanProgress(0); setMeasuredAbsorbance(0); scanProgressRef.current = 0; }} />
    </>
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
        <SpectrophotometerScene
          solute={solute}
          wavelength={wavelength}
          concentration={concentration}
          width={cuvetteWidth}
          measuredAbsorbance={measuredAbsorbance}
          scanProgress={scanProgress}
          isRunning={isRunning}
        />
      }
      controlsTitle="แผงควบคุมสเปกโทรโฟโตมิเตอร์"
      controls={controls}
      compactControls={compactControls}
      metrics={[
        { label: "ค่าดูดกลืนแสง A", value: `${measuredAbsorbance.toFixed(3)} A`, tone: "rose" },
        { label: "ความเข้มข้น c", value: `${concentration.toFixed(3)} M`, tone: "cyan" },
        { label: "ความกว้าง cuvette b", value: `${cuvetteWidth.toFixed(1)} cm`, tone: "emerald" },
        { label: "ความยาวคลื่น λ", value: `${wavelength} nm`, tone: "orange" },
      ]}
      graph={
        <BeerLambertGraph
          dataPoints={dataPoints}
          currentConc={concentration}
          currentAbs={measuredAbsorbance}
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

