"use client";

import React, { useState, useEffect, useRef, useId } from "react";
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
  Layers,
  Sparkles,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

// --- TYPES ---
export interface MichelsonDataPoint {
  time: number;
  wavelength: number;
  mirrorOffset: number; // in um
  refractiveIndex: number;
  intensity: number;    // 0.0 to 1.0
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

  // Intensity falloff near vision limits
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
  wavelength: number;
  mirrorOffset: number;
  refractiveIndex: number;
  intensity: number;
  isRunning: boolean;
}

function MichelsonViewport({
  wavelength,
  mirrorOffset,
  refractiveIndex,
  intensity,
  isRunning,
}: ViewportProps) {
  const laserColor = wavelengthToRGB(wavelength);
  const filterId = useId();

  // Animation time for lasers
  const [, setTime] = useState(0);
  const timeRef = useRef(0);

  useEffect(() => {
    let frameId: number;
    const tick = () => {
      if (isRunning) {
        timeRef.current += 0.03;
        setTime(timeRef.current);
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning]);

  // Phase computation for concentric fringe shifts
  const opdNm = 2 * (mirrorOffset * 1000) + 2 * 1e6 * (refractiveIndex - 1.0);
  const phase = (2 * Math.PI * opdNm) / wavelength;
  const phaseOffset = (phase % (2 * Math.PI)) / (2 * Math.PI); // fractional part [0, 1]

  // Movable mirror translation: map mirrorOffset [0, 5.0] um to delta visual pixels [-4, 4]
  const mirrorXOffset = ((mirrorOffset - 2.5) / 2.5) * 5;

  return (
    <div className="relative flex h-full min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-red-100 bg-[linear-gradient(135deg,#fffbfb_0%,#fff5f5_48%,#fffbf8_100%)] p-4">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#fecaca_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />

      {/* Ambient glows based on state */}
      <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-red-500/5 blur-[80px]" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-orange-500/5 blur-[80px]" />

      {/* Top Left Overlay */}
      <div className="absolute top-4 left-4 bg-white/85 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 text-left text-xs sm:text-sm text-slate-700 font-bold space-y-1 shadow-sm z-10 select-none">
        <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-0.5">
          Michelson Bench
        </span>
        <div className="flex items-center gap-2 text-slate-700">
          <Layers className="w-4 h-4 text-red-500" />
          <span>ดัชนีหักเหตัวกลาง: {refractiveIndex.toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>สีเลเซอร์: {wavelength} nm</span>
        </div>
      </div>

      {/* Bottom Left Intensity Panel */}
      <div className="absolute bottom-4 left-4 bg-white/85 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm z-10 select-none">
        <div className="text-right">
          <span className="text-[9px] font-black text-slate-400 block -mb-0.5 tracking-wider">INTENSITY I</span>
          <span className="text-base sm:text-lg font-extrabold text-red-600 font-mono">{(intensity * 100).toFixed(1)}%</span>
        </div>
        <div
          className="w-5 h-5 rounded-full border border-slate-300 shadow-inner"
          style={{ backgroundColor: laserColor, opacity: 0.2 + intensity * 0.8 }}
        />
      </div>

      {/* Bench Setup SVG */}
      <svg className="relative z-10 w-full h-full max-w-[300px] sm:max-w-[620px] select-none" viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#f43f5e" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* --- OPTICAL BEAMS (LASERS) --- */}
        {/* Laser Source to Beamsplitter */}
        <line x1="30" y1="130" x2="110" y2="130" stroke={laserColor} strokeWidth="3" strokeOpacity="0.75" />

        {/* Beamsplitter Split path 1: to Mirror 1 (M1, Right) */}
        <line x1="110" y1="130" x2="200" y2="130" stroke={laserColor} strokeWidth="2.5" strokeOpacity="0.6" />
        {/* M1 Reflected path: back to Beamsplitter */}
        <line x1="200" y1="130" x2="110" y2="130" stroke={laserColor} strokeWidth="1.5" strokeDasharray="3 2" strokeOpacity="0.8" />

        {/* Beamsplitter Split path 2: to Mirror 2 (M2, Top) */}
        <line x1="110" y1="130" x2="110" y2="50" stroke={laserColor} strokeWidth="2.5" strokeOpacity="0.6" />
        {/* M2 Reflected path: back to Beamsplitter */}
        <line x1="110" y1="50" x2="110" y2="130" stroke={laserColor} strokeWidth="1.5" strokeDasharray="3 2" strokeOpacity="0.8" />

        {/* Combined paths from Beamsplitter to Screen (Bottom) */}
        <line x1="110" y1="130" x2="110" y2="185" stroke={laserColor} strokeWidth="3.2" strokeOpacity={0.2 + intensity * 0.8} />

        {/* --- MECHANICAL ELEMENTS --- */}
        {/* Laser Box */}
        <g transform="translate(10, 115)">
          <rect x="0" y="0" width="25" height="30" rx="3" fill="#334155" stroke="#1e293b" />
          <rect x="25" y="10" width="5" height="10" fill="#64748b" />
          <circle cx="27" cy="15" r="2" fill={laserColor} />
        </g>

        {/* Beamsplitter (Prism block at 45 degrees) */}
        <g transform="translate(100, 120)">
          <rect x="0" y="0" width="20" height="20" rx="1" fill="rgba(255,255,255,0.25)" stroke="#94a3b8" strokeWidth="1" />
          <line x1="0" y1="20" x2="20" y2="0" stroke="#f43f5e" strokeWidth="1" strokeOpacity="0.6" />
          <text x="10" y="12" fill="#475569" fontSize="4.5" fontWeight="bold" textAnchor="middle">BS</text>
        </g>

        {/* Mirror 2 (M2, Top fixed / piezo microcontrol) */}
        <g transform={`translate(${100 + mirrorXOffset}, 40)`}>
          <rect x="-2" y="0" width="24" height="6" fill="#64748b" stroke="#334155" />
          <line x1="-2" y1="6" x2="22" y2="6" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x="10" y="-3" fill="#475569" fontSize="6.5" fontWeight="extrabold" textAnchor="middle">M2</text>
        </g>

        {/* Mirror 1 (M1, Right fixed) */}
        <g transform="translate(200, 120)">
          <rect x="0" y="-2" width="6" height="24" fill="#64748b" stroke="#334155" />
          <line x1="0" y1="-2" x2="0" y2="22" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x="14" y="13" fill="#475569" fontSize="6.5" fontWeight="extrabold" textAnchor="middle">M1</text>
        </g>

        {/* Viewing Screen (Bottom) */}
        <g transform="translate(85, 185)" filter={`url(#${filterId})`}>
          <rect x="0" y="0" width="50" height="30" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />

          {/* Interference concentric rings */}
          <mask id="screenMask">
            <rect x="2" y="2" width="46" height="26" rx="2" fill="#fff" />
          </mask>
          <g mask="url(#screenMask)">
            <circle cx="25" cy="15" r="22" fill="#020617" />
            {/* Draw 4 nested fringe rings */}
            {[0, 1, 2, 3, 4].map((i) => {
              const radius = Math.sqrt(Math.max(0, i + phaseOffset)) * 10;
              const ringOpacity = 0.15 + 0.85 * intensity;
              return (
                <circle
                  key={i}
                  cx="25"
                  cy="15"
                  r={radius}
                  fill="none"
                  stroke={laserColor}
                  strokeWidth="3.5"
                  strokeOpacity={ringOpacity}
                />
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}

// --- LOCAL DARK GRAPH COMPONENT ---
interface GraphProps {
  wavelength: number;
  mirrorOffset: number;
  refractiveIndex: number;
}

function MichelsonGraph({ wavelength, mirrorOffset, refractiveIndex }: GraphProps) {
  // Plots intensity vs mirrorOffset over the range [mirrorOffset - 1.0, mirrorOffset + 1.0] um
  const calcIntensityAtOffset = (offset: number) => {
    const opd = 2 * (offset * 1000) + 2 * 1e6 * (refractiveIndex - 1.0);
    const phase = (2 * Math.PI * opd) / wavelength;
    return Math.pow(Math.cos(phase / 2), 2);
  };

  const startOffset = Math.max(0, mirrorOffset - 0.5);
  const endOffset = mirrorOffset + 0.5;

  const xToSvgX = (offset: number) => 30 + ((offset - startOffset) / (endOffset - startOffset)) * 150;
  const yToSvgY = (I: number) => 105 - I * 85;

  const points = [];
  const step = (endOffset - startOffset) / 80;
  for (let d = startOffset; d <= endOffset; d += step) {
    points.push({ x: xToSvgX(d), y: yToSvgY(calcIntensityAtOffset(d)) });
  }

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const currentX = xToSvgX(mirrorOffset);
  const currentY = yToSvgY(calcIntensityAtOffset(mirrorOffset));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm shadow-slate-200/40 flex flex-col h-full select-none">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
          <LineChart className="w-4 h-4 text-red-600" />
          กราฟความเข้มแสงกับการเลื่อนกระจก
        </h3>
        <span className="text-[10px] font-bold text-red-600">I vs Mirror Position</span>
      </div>

      <div className="flex-grow rounded-xl bg-slate-950 p-3 flex flex-col justify-between min-h-[174px]">
        <svg className="w-full h-full min-h-[140px]" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid lines */}
          <line x1="30" y1="105" x2="180" y2="105" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="30" y1="62.5" x2="180" y2="62.5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="20" x2="180" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Y Axis Labels */}
          <text x="27" y="22.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">1.0</text>
          <text x="27" y="65" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.5</text>
          <text x="27" y="107" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.0</text>

          {/* X Axis Labels */}
          <text x="30" y="115" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">{startOffset.toFixed(3)}</text>
          <text x="105" y="115" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">{mirrorOffset.toFixed(3)}</text>
          <text x="180" y="115" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">{endOffset.toFixed(3)}</text>

          <text x="32" y="12" fill="#64748b" fontSize="5.5" fontWeight="extrabold">Intensity I</text>
          <text x="180" y="115" fill="#64748b" fontSize="5.5" fontWeight="extrabold" textAnchor="end">Position d (µm)</text>

          {/* Path */}
          <path d={pathD} fill="none" stroke="#f43f5e" strokeWidth="1.8" />

          {/* Active node */}
          <circle cx={currentX} cy={currentY} r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.2" />
        </svg>
      </div>
    </div>
  );
}

// --- THEORY AND FORMULA BLOCK ---
function MichelsonTheory() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm shadow-slate-200/40 flex flex-col h-full select-none">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-xs sm:text-sm font-black text-slate-800">
        <Info className="h-4.5 w-4.5 text-red-600" />
        ทฤษฎีและสูตรการคำนวณ
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 flex items-center justify-center">
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-slate-800 inline-flex items-center gap-1.5">
            <span>I = I₀ cos²(</span>
            <div className="flex flex-col items-center leading-none text-xs sm:text-sm">
              <span>π · OPD</span>
              <span className="border-t border-slate-800 w-full my-0.5" />
              <span>λ</span>
            </div>
            <span>)</span>
          </div>
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500 leading-[1.6]">
          เมื่อกระจกเงา M2 เลื่อนไปเป็นระยะทาง d คลื่นสะท้อนจะเดินทางเป็นระยะทางเพิ่มขึ้น 2d ซึ่งทำให้เกิดความแตกต่างวิถีเชิงแสง (OPD) ส่งผลให้เกิดการเลื่อนริ้วรอยมืด/สว่างบนฉากรับ ริ้วรอยเปลี่ยนผ่าน 1 รอบสอดคล้องกับระยะเลื่อน d = λ/2
        </p>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">λ: ความยาวคลื่นแสง</span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">OPD: ความแตกต่างวิถีแสง</span>
        </div>
      </div>
    </div>
  );
}

// --- MAIN EXPORTED COMPONENT ---
const MAX_DATA_POINTS = 500;

export default function MichelsonInterferometerSimulation() {
  const labId = "michelson-interferometer";

  // Simulator configurations
  const [wavelength, setWavelength] = useState(632.8); // nm
  const [mirrorOffset, setMirrorOffset] = useState(1.0); // um
  const [refractiveIndex, setRefractiveIndex] = useState(1.0000);

  const logInterval = 10; // auto log interval
  const simulationSpeed = 1;

  // Simulation running loop states
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<MichelsonDataPoint[]>([]);
  const [lastLoggedTime, setLastLoggedTime] = useState(0);

  // Quest States
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  // References
  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const lastLoggedTimeRef = useRef(lastLoggedTime);

  const wavelengthRef = useRef(wavelength);
  const mirrorOffsetRef = useRef(mirrorOffset);
  const refractiveIndexRef = useRef(refractiveIndex);
  const logIntervalRef = useRef(logInterval);
  const simulationSpeedRef = useRef(simulationSpeed);

  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { lastLoggedTimeRef.current = lastLoggedTime; }, [lastLoggedTime]);

  useEffect(() => { wavelengthRef.current = wavelength; }, [wavelength]);
  useEffect(() => { mirrorOffsetRef.current = mirrorOffset; }, [mirrorOffset]);
  useEffect(() => { refractiveIndexRef.current = refractiveIndex; }, [refractiveIndex]);

  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Compute intensity analytically
  const calcIntensity = (wl: number, offset: number, index: number) => {
    const opd = 2 * (offset * 1000) + 2 * 1e6 * (index - 1.0);
    const phase = (2 * Math.PI * opd) / wl;
    return Math.pow(Math.cos(phase / 2), 2);
  };

  const intensity = calcIntensity(wavelength, mirrorOffset, refractiveIndex);

  // Main ticking loop effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning) {
      timer = setInterval(() => {
        const deltaSeconds = 0.1 * simulationSpeedRef.current;
        const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
        setElapsedSeconds(nextSeconds);
        elapsedSecondsRef.current = nextSeconds;

        const currentWavelength = wavelengthRef.current;
        const currentOffset = mirrorOffsetRef.current;
        const currentIndex = refractiveIndexRef.current;
        const currentI = calcIntensity(currentWavelength, currentOffset, currentIndex);

        // Auto logging check
        if (nextSeconds - lastLoggedTimeRef.current >= logIntervalRef.current) {
          setDataPoints((prev) =>
            [
              ...prev,
              {
                time: nextSeconds,
                wavelength: currentWavelength,
                mirrorOffset: currentOffset,
                refractiveIndex: currentIndex,
                intensity: currentI,
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

  // Quest Evaluation on table change:
  // Quest is to log at least 5 points that cover maximum bright (> 0.90) and minimum dark (< 0.10) fringes.
  useEffect(() => {
    const brightPoints = dataPoints.filter(p => p.intensity >= 0.90).length;
    const darkPoints = dataPoints.filter(p => p.intensity <= 0.10).length;
    const totalGoal = Math.min(5, brightPoints + darkPoints);

    // Defer state updates to avoid React's synchronous render warning
    const timeoutId = setTimeout(() => {
      setQuestProgress(totalGoal * 2); // mapping 5 points to 10 max questProgress

      if (brightPoints >= 2 && darkPoints >= 2 && (brightPoints + darkPoints) >= 5 && !questSuccess) {
        setQuestSuccess(true);
        alert("🎉 ยินดีด้วย! คุณเก็บบันทึกข้อมูลยอดแสงสว่างสุดและยอดมืดสุดได้อย่างครอบคลุม (อย่างน้อยฝั่งละ 2 จุด รวมกันครบ 5 จุด) บันทึกรายงานผลเพื่อเคลียร์ภารกิจนี้");
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [dataPoints, questSuccess]);

  // Start / Pause
  const handleStartStop = () => {
    const nextIsRunning = !isRunning;
    setIsRunning(nextIsRunning);
    isRunningRef.current = nextIsRunning;

    if (nextIsRunning && elapsedSeconds === 0) {
      setDataPoints([
        {
          time: 0,
          wavelength,
          mirrorOffset,
          refractiveIndex,
          intensity,
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

  // Add Manual log point
  const handleAddPoint = () => {
    setDataPoints((prev) =>
      [
        ...prev,
        {
          time: elapsedSeconds,
          wavelength,
          mirrorOffset,
          refractiveIndex,
          intensity,
        },
      ].slice(-MAX_DATA_POINTS),
    );
  };

  // Clear single point from table
  const handleClearPoint = (index: number) => {
    setDataPoints((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Export CSV
  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    const headers = "เวลา (วินาที),ความยาวคลื่น (nm),ระยะเลื่อนกระจก d (um),ดัชนีหักเหตัวกลาง n,ความเข้มแสง I (Ratio)\n";
    const rows = dataPoints.map(p => `${p.time.toFixed(1)},${p.wavelength.toFixed(1)},${p.mirrorOffset.toFixed(4)},${p.refractiveIndex.toFixed(4)},${p.intensity.toFixed(4)}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scisiam_michelson_${labId}.csv`);
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
      .map(p => `เวลา: ${p.time.toFixed(1)} วินาที | λ: ${p.wavelength.toFixed(1)} nm | d: ${p.mirrorOffset.toFixed(3)} µm | n: ${p.refractiveIndex.toFixed(4)} | I: ${(p.intensity * 100).toFixed(1)}%`)
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
      wavelength,
      mirrorOffset,
      refractiveIndex,
      dataPoints,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_michelson_experiment",
      localPayload: experimentData,
      labId,
      title: "Michelson Interferometer",
      variables: {
        wavelength,
        mirrorOffset,
        refractiveIndex,
        logInterval,
        simulationSpeed,
      },
      liveValues: {
        intensity,
        elapsedSeconds,
        questProgress,
        questSuccess,
      },
      graphPoints: dataPoints.map(p => ({ x: p.mirrorOffset, y: p.intensity })),
      tableRows: dataPoints,
      summary: {
        finalIntensity: intensity,
        dataPointCount: dataPoints.length,
        questSuccess,
      },
    });

    alert("บันทึกข้อมูลการทดลอง (ความเข้มแสงเชิงแสงและตารางบันทึกผล) สำเร็จ! 🎉");
  };

  const simControls = (
    <div className="space-y-5">
      {/* Slider: Wavelength */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-600">ความยาวคลื่นเลเซอร์ (λ)</span>
          <span className="text-red-650 font-mono">{wavelength.toFixed(1)} nm</span>
        </div>
        <input
          type="range"
          min="400"
          max="700"
          step="1"
          value={wavelength}
          onChange={(e) => setWavelength(parseInt(e.target.value))}
          className="w-full accent-red-650"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>400 nm (ม่วง)</span>
          <span>700 nm (แดง)</span>
        </div>
      </div>

      {/* Slider: Mirror Offset */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-600">การเลื่อนกระจก M2 (Piezo)</span>
          <span className="text-red-650 font-mono">{mirrorOffset.toFixed(4)} µm</span>
        </div>
        <input
          type="range"
          min="0.0"
          max="5.0"
          step="0.01"
          value={mirrorOffset}
          onChange={(e) => setMirrorOffset(parseFloat(e.target.value))}
          className="w-full accent-red-650"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>0.00 µm</span>
          <span>5.00 µm</span>
        </div>
      </div>

      {/* Slider: Medium Refractive Index */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-600">ดัชนีหักเหแก๊สในเซลล์ (n)</span>
          <span className="text-red-650 font-mono">{refractiveIndex.toFixed(4)}</span>
        </div>
        <input
          type="range"
          min="1.0000"
          max="1.0050"
          step="0.0001"
          value={refractiveIndex}
          onChange={(e) => setRefractiveIndex(parseFloat(e.target.value))}
          className="w-full accent-red-650"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>1.0000 (สุญญากาศ)</span>
          <span>1.0050</span>
        </div>
      </div>

      {/* Button Controls */}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={handleStartStop}
          className={`flex-grow flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition-all active:scale-95 ${
            isRunning
              ? "bg-slate-700 shadow-lg shadow-slate-500/10"
              : "bg-red-650 shadow-lg shadow-red-500/20 hover:bg-red-700"
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
          <ClipboardList className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </div>
  );

  const dataTable = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">บันทึกผลริ้วแทรกสอด</span>
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
                <th className="px-3 py-2">λ (nm)</th>
                <th className="px-3 py-2">d (µm)</th>
                <th className="px-3 py-2">n</th>
                <th className="px-3 py-2">I (%)</th>
                <th className="px-2 py-2 text-center">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataPoints.map((point, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono">{point.time.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono">{point.wavelength.toFixed(0)}</td>
                  <td className="px-3 py-2 font-mono">{point.mirrorOffset.toFixed(3)}</td>
                  <td className="px-3 py-2 font-mono">{point.refractiveIndex.toFixed(4)}</td>
                  <td className="px-3 py-2 font-mono">{(point.intensity * 100).toFixed(1)}%</td>
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
      accent="rose"
      labId={labId}
      category="Physics"
      title="Michelson Interferometer (อินเตอร์เฟอโรมิเตอร์ไมเคิลสัน)"
      subtitle="จำลองชุดอินเตอร์เฟอโรมิเตอร์แทรกสอดคลื่นแสงเลเซอร์ สังเกตริ้วแทรกสอดสว่างมืดบนฉากรับขณะเลื่อนกระจกแกนปรับละเอียด"
      statusLabel={isRunning ? "กำลังเหนี่ยวนำลำแสง" : "พร้อมทดลอง"}
      icon={Layers}
      sceneTitle="แท่นทดลองแสงและหน้าจอฉากรับริ้วแทรกสอด"
      scene={
        <MichelsonViewport
          wavelength={wavelength}
          mirrorOffset={mirrorOffset}
          refractiveIndex={refractiveIndex}
          intensity={intensity}
          isRunning={isRunning}
        />
      }
      controlsTitle="แผงพารามิเตอร์ระบบทัศนศาสตร์"
      controls={simControls}
      metrics={[
        { label: "ความเข้มแสง I", value: `${(intensity * 100).toFixed(1)}%`, tone: "rose" },
        { label: "ความยาวคลื่น λ", value: `${wavelength.toFixed(0)} nm`, tone: "orange" },
        { label: "ตำแหน่งเลื่อน d", value: `${mirrorOffset.toFixed(3)} µm`, tone: "violet" },
        { label: "ดัชนีหักเห n", value: refractiveIndex.toFixed(4), tone: "blue" },
      ]}
      graph={
        <MichelsonGraph
          wavelength={wavelength}
          mirrorOffset={mirrorOffset}
          refractiveIndex={refractiveIndex}
        />
      }
      table={dataTable}
      theory={<MichelsonTheory />}
      steps={[
        { label: "ปรับเลือก λ เลเซอร์ต้นกำเนิด", icon: Sliders },
        { label: "เลื่อนตำแหน่งกระจก M2 แกนปรับละเอียด", icon: Target },
        { label: "สังเกตการเคลื่อนวนรอบของริ้วแสง", icon: Play },
        { label: "บันทึกและพล็อตกราฟความสัมพันธ์", icon: ClipboardList },
      ]}
      learningGoals={[
        "อธิบายความสัมพันธ์ของการเปลี่ยนเฟสเชิงแสงกับการแทรกสอด",
        "คำนวณความยาวคลื่นแสงจากการนับริ้วแทรกสอดที่เลื่อนผ่าน",
        "วิเคราะห์ผลกระทบของดัชนีหักเหตัวกลาง n ที่มีต่อเฟสคลื่น",
      ]}
      progressLabel="ระดับการบันทึกครอบคลุมเป้าหมายภารกิจ"
      progressValue={`${(questProgress * 10).toFixed(0)}%`}
      progressPercent={(questProgress / 10) * 100}
      tips={[
        "การเปลี่ยนผ่านของริ้วมืด-สว่าง ครบ 1 วนรอบ (Cycle) สอดคล้องกับระยะเลื่อนกระจก d = λ/2 เสมอ",
        "การเพิ่มค่าดัชนีหักเหตัวกลาง n จะเหนี่ยวนำให้เกิดเฟสเลื่อนแบบค่อยเป็นค่อยไปเช่นเดียวกับการเลื่อนตำแหน่งกระจก",
        "ภารกิจ: บันทึกข้อมูลความเข้มแสงสูงสุด (≥ 90%) และต่ำสุด (≤ 10%) รวมกันให้ครบอย่างน้อย 5 จุดบนตาราง",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
