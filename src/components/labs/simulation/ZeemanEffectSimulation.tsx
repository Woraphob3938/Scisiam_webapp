"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { useRouter } from "next/navigation";
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  LineChart,
  ClipboardList,
  Target,
  Download,
  Copy,
  Trash2,
  Info,
  Activity,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

// --- TYPES ---
export interface ZeemanDataPoint {
  time: number;
  magneticField: number;  // B (Tesla)
  sourceWavelength: number; // lambda0 (nm)
  mode: "normal" | "anomalous";
  splittingNm: number;    // Delta lambda (nm)
}

// --- COLOR CONVERTER HELPER ---
function wavelengthToRGB(wavelengthNm: number) {
  let r = 0, g = 0, b = 0;
  if (wavelengthNm >= 380 && wavelengthNm < 440) {
    r = -(wavelengthNm - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelengthNm >= 440 && wavelengthNm < 490) {
    r = 0.0;
    g = (wavelengthNm - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelengthNm >= 490 && wavelengthNm < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelengthNm - 510) / (510 - 490);
  } else if (wavelengthNm >= 510 && wavelengthNm < 580) {
    r = (wavelengthNm - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelengthNm >= 580 && wavelengthNm < 645) {
    r = 1.0;
    g = -(wavelengthNm - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelengthNm >= 645 && wavelengthNm <= 780) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  } else {
    r = 0.5;
    g = 0.5;
    b = 0.5;
  }

  let factor = 0.0;
  if (wavelengthNm >= 380 && wavelengthNm < 420) {
    factor = 0.3 + 0.7 * (wavelengthNm - 380) / (420 - 380);
  } else if (wavelengthNm >= 420 && wavelengthNm < 701) {
    factor = 1.0;
  } else if (wavelengthNm >= 701 && wavelengthNm <= 780) {
    factor = 0.3 + 0.7 * (780 - wavelengthNm) / (780 - 701);
  }

  return `rgb(${Math.round(r * factor * 255)}, ${Math.round(g * factor * 255)}, ${Math.round(b * factor * 255)})`;
}

// --- LOCAL VIEWPORT ---
interface ViewportProps {
  magneticField: number;
  sourceWavelength: number;
  mode: "normal" | "anomalous";
  splittingNm: number;
  isRunning: boolean;
}

function ZeemanViewport({
  magneticField,
  sourceWavelength,
  mode,
  splittingNm,
  isRunning,
}: ViewportProps) {
  const filterId = useId();
  const baseColor = wavelengthToRGB(sourceWavelength);

  // Animation ticks for coil fields
  const [time, setTime] = useState(0);
  const timeRef = useRef(0);

  useEffect(() => {
    let frameId: number;
    const tick = () => {
      if (isRunning) {
        timeRef.current += 0.05;
        setTime(timeRef.current);
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning]);

  // Compute split wavelengths
  // For visual clarity, we scale splitting in pixel offset
  const scale = 350; // pixels per nm
  const visualSplit = splittingNm * scale;

  const lines = mode === "normal"
    ? [
        { offset: -visualSplit, wl: sourceWavelength - splittingNm, label: "σ-" },
        { offset: 0, wl: sourceWavelength, label: "π" },
        { offset: visualSplit, wl: sourceWavelength + splittingNm, label: "σ+" },
      ]
    : [
        { offset: -1.67 * visualSplit, wl: sourceWavelength - 1.67 * splittingNm, label: "σ-" },
        { offset: -1.0 * visualSplit, wl: sourceWavelength - 1.0 * splittingNm, label: "σ-" },
        { offset: -0.33 * visualSplit, wl: sourceWavelength - 0.33 * splittingNm, label: "σ-" },
        { offset: 0.33 * visualSplit, wl: sourceWavelength + 0.33 * splittingNm, label: "σ+" },
        { offset: 1.0 * visualSplit, wl: sourceWavelength + 1.0 * splittingNm, label: "σ+" },
        { offset: 1.67 * visualSplit, wl: sourceWavelength + 1.67 * splittingNm, label: "σ+" },
      ];

  return (
    <div className="relative flex h-full min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#fcfcff_0%,#f0f7ff_48%,#fbf8ff_100%)] p-4">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#bfdbfe_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />

      {/* Ambient glows */}
      <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-blue-500/5 blur-[80px]" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/5 blur-[80px]" />

      {/* Top Left Overlay */}
      <div className="absolute top-4 left-4 bg-white/85 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 text-left text-xs sm:text-sm text-slate-700 font-bold space-y-1 shadow-sm z-10 select-none">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-0.5">
          Spectrograph
        </span>
        <div className="flex items-center gap-2 text-slate-700">
          <Activity className="w-4 h-4 text-blue-500" />
          <span>โมด: {mode === "normal" ? "Normal Zeeman" : "Anomalous Zeeman"}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <div className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: baseColor }} />
          <span>เส้นอ้างอิง: {sourceWavelength.toFixed(1)} nm</span>
        </div>
      </div>

      {/* Bottom Left Readout */}
      <div className="absolute bottom-4 left-4 bg-white/85 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm z-10 select-none">
        <div className="text-right">
          <span className="text-[9px] font-black text-slate-400 block -mb-0.5 tracking-wider">SPLITTING Δλ</span>
          <span className="text-base sm:text-lg font-extrabold text-blue-600 font-mono">{splittingNm.toFixed(4)} nm</span>
        </div>
      </div>

      {/* Primary SVG */}
      <svg className="relative z-10 w-full h-full max-w-[300px] sm:max-w-[620px] select-none" viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* --- ELECTROMAGNET & BULB --- */}
        {/* Magnet left pole */}
        <rect x="30" y="80" width="30" height="40" rx="2" fill="#475569" stroke="#1e293b" />
        <rect x="60" y="90" width="10" height="20" fill="#94a3b8" />

        {/* Magnet right pole */}
        <rect x="110" y="80" width="30" height="40" rx="2" fill="#475569" stroke="#1e293b" />
        <rect x="100" y="90" width="10" height="20" fill="#94a3b8" />

        {/* Electromagnet connection base */}
        <path d="M45,120 L45,145 L125,145 L125,120" stroke="#334155" strokeWidth="6" fill="none" strokeLinecap="round" />

        {/* Coil winding lines */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} opacity="0.8">
            <line x1={36 + i * 5} y1="80" x2={36 + i * 5} y2="120" stroke="#b45309" strokeWidth="1.8" />
            <line x1={116 + i * 5} y1="80" x2={116 + i * 5} y2="120" stroke="#b45309" strokeWidth="1.8" />
          </g>
        ))}

        {/* Magnetic field line arrows (animated when B > 0) */}
        {magneticField > 0 && (
          <g opacity="0.6" className="animate-pulse">
            <path
              d="M72,100 L98,100"
              stroke="#60a5fa"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeDashoffset={time * 5}
            />
            <path d="M93,97 L98,100 L93,103" fill="none" stroke="#60a5fa" strokeWidth="2" />
          </g>
        )}

        {/* Spectrum Discharge Bulb (glowing in center) */}
        <ellipse cx="85" cy="100" rx="8" ry="12" fill={baseColor} opacity="0.75" className="animate-pulse" filter="url(#labShadow)" />
        <rect x="83" y="112" width="4" height="15" fill="#475569" />
        <line x1="85" y1="100" x2="85" y2="125" stroke="#94a3b8" strokeWidth="1" />

        {/* Optical path line to spectrograph */}
        <line x1="85" y1="100" x2="190" y2="100" stroke={baseColor} strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="3 3" />

        {/* Spectrograph Camera Screen Display (Right) */}
        <g transform="translate(165, 60)" filter={`url(#${filterId})`}>
          {/* Housing */}
          <rect x="0" y="0" width="80" height="80" rx="5" fill="#020617" stroke="#1e293b" strokeWidth="1.5" />
          {/* Grid lines on camera screen */}
          <line x1="40" y1="5" x2="40" y2="75" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2 2" />

          {/* Render split lines */}
          {lines.map((line, idx) => {
            const lineX = 40 + line.offset;
            const lineColor = wavelengthToRGB(line.wl);
            if (lineX < 5 || lineX > 75) return null; // clamp within screen
            return (
              <g key={idx}>
                <line
                  x1={lineX}
                  y1="10"
                  x2={lineX}
                  y2="70"
                  stroke={lineColor}
                  strokeWidth={mode === "normal" ? "3" : "2"}
                  strokeOpacity={magneticField === 0 && line.offset !== 0 ? 0.0 : 0.9}
                  className="transition-all duration-300"
                />
                {magneticField > 0.05 && (
                  <text
                    x={lineX}
                    y="76"
                    fill="#64748b"
                    fontSize="4.5"
                    fontWeight="black"
                    textAnchor="middle"
                  >
                    {line.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

// --- LOCAL DARK GRAPH COMPONENT ---
interface GraphProps {
  magneticField: number;
  sourceWavelength: number;
  mode: "normal" | "anomalous";
  splittingNm: number;
}

function ZeemanGraph({
  magneticField,
  sourceWavelength,
  mode,
  splittingNm,
}: GraphProps) {
  // Plots a mock spectrum intensity distribution
  // X axis represents Delta lambda from -0.12 nm to +0.12 nm
  const deltaMin = -0.10;
  const deltaMax = 0.10;

  const xToSvgX = (delta: number) => 30 + ((delta - deltaMin) / (deltaMax - deltaMin)) * 150;
  const yToSvgY = (val: number) => 105 - val * 85;

  // Gaussians representation of spectral peaks
  const peaks = mode === "normal"
    ? [
        { offset: -splittingNm, amp: magneticField === 0 ? 0.0 : 0.8 },
        { offset: 0, amp: magneticField === 0 ? 1.0 : 0.8 },
        { offset: splittingNm, amp: magneticField === 0 ? 0.0 : 0.8 },
      ]
    : [
        { offset: -1.67 * splittingNm, amp: magneticField === 0 ? 0.0 : 0.5 },
        { offset: -1.0 * splittingNm, amp: magneticField === 0 ? 0.0 : 0.5 },
        { offset: -0.33 * splittingNm, amp: magneticField === 0 ? 0.0 : 0.5 },
        { offset: 0.33 * splittingNm, amp: magneticField === 0 ? 0.0 : 0.5 },
        { offset: 1.0 * splittingNm, amp: magneticField === 0 ? 0.0 : 0.5 },
        { offset: 1.67 * splittingNm, amp: magneticField === 0 ? 0.0 : 0.5 },
      ];

  const sigma = 0.007; // peak width in nm

  const getIntensityAtDelta = (delta: number) => {
    let sum = 0;
    peaks.forEach((peak) => {
      const diff = delta - peak.offset;
      sum += peak.amp * Math.exp(-(diff * diff) / (2 * sigma * sigma));
    });
    return Math.min(1.0, sum);
  };

  const points = [];
  const step = (deltaMax - deltaMin) / 100;
  for (let d = deltaMin; d <= deltaMax; d += step) {
    points.push({ x: xToSvgX(d), y: yToSvgY(getIntensityAtDelta(d)) });
  }

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  const graphColor = wavelengthToRGB(sourceWavelength);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm shadow-slate-200/40 flex flex-col h-full select-none">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
          <LineChart className="w-4 h-4 text-blue-600" />
          กราฟแถบสเปกตรัม (Intensity)
        </h3>
        <span className="text-[10px] font-bold text-blue-600">Intensity vs Δλ</span>
      </div>

      <div className="flex-grow rounded-xl bg-slate-950 p-3 flex flex-col justify-between min-h-[174px]">
        <svg className="w-full h-full min-h-[140px]" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid lines */}
          <line x1="30" y1="105" x2="180" y2="105" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="30" y1="62.5" x2="180" y2="62.5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="20" x2="180" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Y Labels */}
          <text x="27" y="22.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">1.0</text>
          <text x="27" y="65" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.5</text>
          <text x="27" y="107" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.0</text>

          {/* X Labels */}
          <text x="30" y="115" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">-0.1</text>
          <text x="105" y="115" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.0</text>
          <text x="180" y="115" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">+0.1</text>

          <text x="32" y="12" fill="#64748b" fontSize="5.5" fontWeight="extrabold">Relative Intensity</text>
          <text x="180" y="115" fill="#64748b" fontSize="5.5" fontWeight="extrabold" textAnchor="end">Δλ (nm)</text>

          {/* Curve */}
          <path d={pathD} fill="none" stroke={graphColor} strokeWidth="1.8" />
        </svg>
      </div>
    </div>
  );
}

// --- THEORY AND FORMULA BLOCK ---
function ZeemanTheory() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm shadow-slate-200/40 flex flex-col h-full select-none">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-xs sm:text-sm font-black text-slate-800">
        <Info className="h-4.5 w-4.5 text-blue-600" />
        ทฤษฎีและสูตรการคำนวณ
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex items-center justify-center">
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-slate-800 inline-flex items-center gap-1.5">
            <span>Δλ = </span>
            <div className="flex flex-col items-center leading-none text-xs sm:text-sm">
              <span>λ₀² · g · μ<sub>B</sub>B</span>
              <span className="border-t border-slate-800 w-full my-0.5" />
              <span>hc</span>
            </div>
          </div>
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500 leading-[1.6]">
          เมื่ออะตอมอยู่ภายใต้สนามแม่เหล็กภายนอก อันตรกิริยา Zeeman จะสลายความเสื่อม (Degeneracy) ของระดับพลังงานอะตอมย่อย ทำให้เส้นสเปกตรัมที่เคยรวมเป็นหนึ่งแยกตัวออกเป็น Lorentz Triplet (Normal Zeeman) หรือมากกว่า (Anomalous Zeeman)
        </p>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">μ_B: Bohr Magneton</span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">g: Landé g-factor</span>
        </div>
      </div>
    </div>
  );
}

// --- MAIN EXPORTED COMPONENT ---
const MAX_DATA_POINTS = 500;

export default function ZeemanEffectSimulation() {
  const router = useRouter();
  const labId = "zeeman-effect";

  // Simulator configurations
  const [magneticField, setMagneticField] = useState(1.0); // B (Tesla)
  const [sourceWavelength, setSourceWavelength] = useState(500.0); // lambda0 (nm)
  const [zeemanMode, setZeemanMode] = useState<"normal" | "anomalous">("normal");

  const logInterval = 10;
  const simulationSpeed = 1;

  // Simulation running states
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<ZeemanDataPoint[]>([]);
  const [lastLoggedTime, setLastLoggedTime] = useState(0);

  // Quest states
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  // References
  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const lastLoggedTimeRef = useRef(lastLoggedTime);

  const magneticFieldRef = useRef(magneticField);
  const sourceWavelengthRef = useRef(sourceWavelength);
  const zeemanModeRef = useRef(zeemanMode);
  const logIntervalRef = useRef(logInterval);
  const simulationSpeedRef = useRef(simulationSpeed);

  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { lastLoggedTimeRef.current = lastLoggedTime; }, [lastLoggedTime]);

  useEffect(() => { magneticFieldRef.current = magneticField; }, [magneticField]);
  useEffect(() => { sourceWavelengthRef.current = sourceWavelength; }, [sourceWavelength]);
  useEffect(() => { zeemanModeRef.current = zeemanMode; }, [zeemanMode]);

  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Analytical splitting calculation
  // Delta lambda = lambda0^2 * g * mu_B * B / hc
  // mu_B / hc = 5.788e-5 eV/T / 1240 eV*nm = 4.6677e-8 Tesla^-1 nm^-1
  const calcSplitting = (wl: number, B: number) => {
    const C = (wl * wl) * 4.6677e-8;
    return C * B;
  };

  const splittingNm = calcSplitting(sourceWavelength, magneticField);

  // Main ticking loop effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning) {
      timer = setInterval(() => {
        const deltaSeconds = 0.1 * simulationSpeedRef.current;
        const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
        setElapsedSeconds(nextSeconds);
        elapsedSecondsRef.current = nextSeconds;

        const currentB = magneticFieldRef.current;
        const currentWl = sourceWavelengthRef.current;
        const currentMode = zeemanModeRef.current;
        const currentSplit = calcSplitting(currentWl, currentB);

        // Quest tracking: Splitting Δλ between 0.05 nm and 0.06 nm in Normal mode
        if (currentMode === "normal" && currentSplit >= 0.05 && currentSplit <= 0.06) {
          const nextQuestProg = Math.min(5, questProgressRef.current + deltaSeconds);
          setQuestProgress(nextQuestProg);
          questProgressRef.current = nextQuestProg;

          if (nextQuestProg >= 5 && !questSuccessRef.current) {
            setQuestSuccess(true);
            questSuccessRef.current = true;
            alert("🎉 ยินดีด้วย! คุณปรับระดับสนามแม่เหล็กเพื่อเหนี่ยวนำให้เกิดระยะแยกสเปกตรัมอยู่ในช่วง 0.05 nm - 0.06 nm ได้ต่อเนื่องเป็นเวลา 5 วินาทีสำเร็จ บันทึกรายงานเพื่อบันทึกผลการทดลอง");
          }
        } else {
          setQuestProgress(0);
          questProgressRef.current = 0;
        }

        // Auto logging
        if (nextSeconds - lastLoggedTimeRef.current >= logIntervalRef.current) {
          setDataPoints((prev) =>
            [
              ...prev,
              {
                time: nextSeconds,
                magneticField: currentB,
                sourceWavelength: currentWl,
                mode: currentMode,
                splittingNm: currentSplit,
              },
            ].slice(-MAX_DATA_POINTS),
          );
          setLastLoggedTime(nextSeconds);
          lastLoggedTimeRef.current = nextSeconds;
        }
      }, 100);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  // Start / Pause
  const handleStartStop = () => {
    const nextIsRunning = !isRunning;
    setIsRunning(nextIsRunning);
    isRunningRef.current = nextIsRunning;

    if (nextIsRunning && elapsedSeconds === 0) {
      setDataPoints([
        {
          time: 0,
          magneticField,
          sourceWavelength,
          mode: zeemanMode,
          splittingNm,
        }
      ]);
      setLastLoggedTime(0);
      lastLoggedTimeRef.current = 0;
    }
  };

  // Reset
  const handleReset = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setElapsedSeconds(0);
    elapsedSecondsRef.current = 0;
    setDataPoints([]);
    setLastLoggedTime(0);
    lastLoggedTimeRef.current = 0;
    setQuestProgress(0);
    setQuestSuccess(false);
  };

  // Manual Log
  const handleAddPoint = () => {
    setDataPoints((prev) =>
      [
        ...prev,
        {
          time: elapsedSeconds,
          magneticField,
          sourceWavelength,
          mode: zeemanMode,
          splittingNm,
        },
      ].slice(-MAX_DATA_POINTS),
    );
  };

  // Clear point
  const handleClearPoint = (index: number) => {
    setDataPoints((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Export CSV
  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    const headers = "เวลาจำลอง (วินาที),สนามแม่เหล็ก B (Tesla),ความยาวคลื่นหลัก (nm),รูปแบบ,ระยะแยกสเปกตรัม (nm)\n";
    const rows = dataPoints.map(p => `${p.time.toFixed(1)},${p.magneticField.toFixed(2)},${p.sourceWavelength.toFixed(1)},${p.mode},${p.splittingNm.toFixed(4)}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scisiam_zeeman_${labId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Clipboard
  const handleCopyData = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการคัดลอก!");
      return;
    }
    const content = dataPoints
      .map(p => `เวลา: ${p.time.toFixed(1)} วินาที | B: ${p.magneticField.toFixed(2)} T | λ0: ${p.sourceWavelength.toFixed(1)} nm | โหมด: ${p.mode} | Δλ: ${p.splittingNm.toFixed(4)} nm`)
      .join("\n");

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content)
          .then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"))
          .catch(() => fallbackCopy(content));
      } else {
        fallbackCopy(content);
      }
    } catch {
      fallbackCopy(content);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!");
    } catch {
      alert("ไม่สามารถคัดลอกข้อมูลโดยอัตโนมัติได้ กรุณาคัดลอกด้วยตนเอง");
    }
    document.body.removeChild(textArea);
  };

  // Save report
  const handleSaveResults = async () => {
    if (dataPoints.length === 0) {
      alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล! กรุณากดบันทึกค่าอย่างน้อยหนึ่งจุดก่อนส่ง");
      return;
    }

    const experimentData = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      magneticField,
      sourceWavelength,
      zeemanMode,
      dataPoints,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_zeeman_experiment",
      localPayload: experimentData,
      labId,
      title: "Zeeman Effect",
      variables: {
        magneticField,
        sourceWavelength,
        zeemanMode,
        logInterval,
        simulationSpeed,
      },
      liveValues: {
        splittingNm,
        elapsedSeconds,
        questProgress,
        questSuccess,
      },
      graphPoints: dataPoints.map(p => ({ x: p.magneticField, y: p.splittingNm })),
      tableRows: dataPoints,
      summary: {
        finalSplittingNm: splittingNm,
        dataPointCount: dataPoints.length,
        questSuccess,
      },
    });

    alert("บันทึกข้อมูลการทดลอง (การแยกเส้นสเปกตรัมและตารางบันทึกผล) สำเร็จ! 🎉");
    router.push(`/labs/${labId}`);
  };

  const simControls = (
    <div className="space-y-5">
      {/* Slider: Magnetic Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-600 font-bold">สนามแม่เหล็กไฟฟ้า (B)</span>
          <span className="text-blue-650 font-mono">{magneticField.toFixed(2)} Tesla</span>
        </div>
        <input
          type="range"
          min="0.0"
          max="3.0"
          step="0.05"
          value={magneticField}
          onChange={(e) => setMagneticField(parseFloat(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>0.0 T (ปิดแม่เหล็ก)</span>
          <span>3.0 T (สูงสุด)</span>
        </div>
      </div>

      {/* Slider: Base Wavelength */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-600 font-bold">ความยาวคลื่นเป้าหมาย (λ₀)</span>
          <span className="text-blue-650 font-mono">{sourceWavelength.toFixed(1)} nm</span>
        </div>
        <input
          type="range"
          min="450"
          max="680"
          step="1"
          value={sourceWavelength}
          onChange={(e) => setSourceWavelength(parseInt(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>450 nm</span>
          <span>680 nm</span>
        </div>
      </div>

      {/* Mode Toggle: Normal vs Anomalous */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold border-t border-slate-100 pt-3">
        <span className="text-slate-600 font-bold">เลือกผลแยกรูปแบบอะตอม</span>
        <button
          onClick={() => setZeemanMode(prev => prev === "normal" ? "anomalous" : "normal")}
          className="flex items-center gap-1 text-blue-600 font-extrabold transition-all active:scale-95"
        >
          {zeemanMode === "normal" ? (
            <>
              <ToggleLeft className="w-6 h-6 text-slate-400" />
              <span>Normal Triplet</span>
            </>
          ) : (
            <>
              <ToggleRight className="w-6 h-6 text-blue-600" />
              <span>Anomalous Zeeman</span>
            </>
          )}
        </button>
      </div>

      {/* Button Controls */}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={handleStartStop}
          className={`flex-grow flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition-all active:scale-95 ${
            isRunning
              ? "bg-slate-700 shadow-lg shadow-slate-500/10"
              : "bg-blue-600 shadow-lg shadow-blue-500/20 hover:bg-blue-700"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" />
              <span>หยุดจำลอง</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>เริ่มจำลอง</span>
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
          title="รีเซ็ต"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={handleAddPoint}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
          title="บันทึกจุดนี้"
        >
          <ClipboardList className="h-4 w-4 text-blue-500" />
        </button>
      </div>
    </div>
  );

  const dataTable = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">บันทึกสเปกตรัม Zeeman</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyData}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-slate-500 hover:text-slate-800"
            title="คัดลอก"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportCSV}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-slate-500 hover:text-slate-800"
            title="ส่งออก CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto rounded-xl border border-slate-100 min-h-[140px]">
        {dataPoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 py-12">
            <ClipboardList className="w-8 h-8 text-slate-300" />
            <p className="text-[10px] font-bold">ยังไม่ได้บันทึกข้อมูลผลการทดลอง</p>
          </div>
        ) : (
          <table className="w-full text-[10px] sm:text-xs text-left text-slate-600 font-medium">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-extrabold sticky top-0">
              <tr>
                <th className="px-3 py-2">เวลา (s)</th>
                <th className="px-3 py-2">B (T)</th>
                <th className="px-3 py-2">λ₀ (nm)</th>
                <th className="px-3 py-2">โหมด</th>
                <th className="px-3 py-2">Δλ (nm)</th>
                <th className="px-2 py-2 text-center">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataPoints.map((point, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono">{point.time.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono">{point.magneticField.toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono">{point.sourceWavelength.toFixed(0)}</td>
                  <td className="px-3 py-2 font-mono uppercase">{point.mode}</td>
                  <td className="px-3 py-2 font-mono">{point.splittingNm.toFixed(4)}</td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => handleClearPoint(index)}
                      className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="blue"
      labId={labId}
      category="Physics"
      title="Zeeman Effect (ปรากฏการณ์ซีแมน)"
      subtitle="จำลองการแยกออกของระดับพลังงานและเส้นสเปกตรัมของอะตอมภายใต้สนามแม่เหล็กภายนอก B (Normal Zeeman / Anomalous Zeeman)"
      statusLabel={isRunning ? "กำลังเร่งสนามแม่เหล็ก" : "พร้อมทดลอง"}
      icon={Activity}
      sceneTitle="ภาพจำลองแถบสเปกตรัมที่แยกออกจริง (Zeeman Spectrometer)"
      scene={
        <ZeemanViewport
          magneticField={magneticField}
          sourceWavelength={sourceWavelength}
          mode={zeemanMode}
          splittingNm={splittingNm}
          isRunning={isRunning}
        />
      }
      controlsTitle="แผงพารามิเตอร์สนามแม่เหล็กและสเปกตรัม"
      controls={simControls}
      metrics={[
        { label: "ความยาวคลื่นหลัก λ₀", value: `${sourceWavelength.toFixed(0)} nm`, tone: "blue" },
        { label: "สนามแม่เหล็ก B", value: `${magneticField.toFixed(2)} T`, tone: "cyan" },
        { label: "การแยกสเปกตรัม Δλ", value: `${splittingNm.toFixed(4)} nm`, tone: "violet" },
        { label: "โหมดสเปกตรัม", value: zeemanMode === "normal" ? "Normal" : "Anomalous", tone: "pink" },
      ]}
      graph={
        <ZeemanGraph
          magneticField={magneticField}
          sourceWavelength={sourceWavelength}
          mode={zeemanMode}
          splittingNm={splittingNm}
        />
      }
      table={dataTable}
      theory={<ZeemanTheory />}
      steps={[
        { label: "ปรับเลือก λ₀ อ้างอิงสเปกตรัม", icon: Sliders },
        { label: "สลับโหมด Normal / Anomalous", icon: Target },
        { label: "เพิ่มความแรงสนามแม่เหล็ก B", icon: Play },
        { label: "บันทึกและพล็อตกราฟแยกแถบแสง", icon: ClipboardList },
      ]}
      learningGoals={[
        "อธิบายความต่างของปรากฏการณ์ Zeeman แบบปกติและไม่ปกติ",
        "ศึกษาแนวโน้มความสัมพันธ์ระหว่าง B กับระยะห่างสเปกตรัม Δλ",
        "วิเคราะห์รูปแบบสเปกตรัมสปิน-ออร์บิทัลตามทฤษฎีควอนตัม",
      ]}
      progressLabel="ระยะเวลาที่สอดคล้องเป้าหมายภารกิจ"
      progressValue={`${questProgress.toFixed(1)} / 5 วินาที`}
      progressPercent={(questProgress / 5) * 100}
      tips={[
        "ระยะแยกสเปกตรัม Δλ จะเพิ่มขึ้นเป็นสัดส่วนตรงกับระดับความเข้มของสนามแม่เหล็ก B เสมอ",
        "ในโหมด Anomalous แถบแสงจะแยกย่อยเป็น 6 เส้นอย่างสมมาตร จากการรวมโมเมนตัมเชิงมุมของสปินและออร์บิทัล",
        "ภารกิจ: สลับโหมดเป็น Normal Zeeman แล้วจูนพารามิเตอร์เพื่อให้ระยะแยกสเปกตรัม Δλ อยู่ระหว่าง 0.05 nm - 0.06 nm ต่อเนื่องกันเป็นเวลา 5 วินาที",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
