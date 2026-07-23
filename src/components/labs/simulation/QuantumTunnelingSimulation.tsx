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
  Waves,
  Zap,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

// --- TYPES ---
export interface TunnelingDataPoint {
  time: number;         // simulated running time
  energy: number;       // particle energy E (eV)
  barrierHeight: number;// barrier height V0 (eV)
  barrierWidth: number; // barrier width W (nm)
  transmission: number; // transmission coefficient T
}

// --- LOCAL VIEWPORT ---
interface ViewportProps {
  energy: number;
  barrierHeight: number;
  barrierWidth: number;
  transmission: number;
  isRunning: boolean;
}

function TunnelingViewport({
  energy,
  barrierHeight,
  barrierWidth,
  transmission,
  isRunning,
}: ViewportProps) {
  const gradientId1 = useId();
  const gradientId2 = useId();
  const filterId = useId();

  // Animation time ref
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

  // Barrier visual geometry
  // Width: W is in [0.1, 0.8] nm. We map W to visual width in pixels.
  // Center is x = 130. Visual width = W * 120 pixels (from 12px to 96px).
  const visualWidth = barrierWidth * 120;
  const xStart = 130 - visualWidth / 2;
  const xEnd = 130 + visualWidth / 2;

  // Potential Barrier height scale: V0 is in [3.0, 12.0] eV.
  // Visual height in pixels (max 100px corresponding to 12 eV).
  const V0_pixels = (barrierHeight / 12.0) * 100;
  const E_pixels = (energy / 12.0) * 100;
  const yGround = 160;
  const yBarrierTop = yGround - V0_pixels;
  const yEnergyLine = yGround - E_pixels;

  // Wave function path generation
  // We compute the path across x from 20 to 240
  const getWavePath = () => {
    let path = "";
    const k = Math.sqrt(26.246 * energy) * 2; // spatial frequency scaling for visual appeal
    const ampIncident = 20;
    const ampTransmitted = ampIncident * Math.sqrt(transmission);

    for (let x = 20; x <= 240; x++) {
      let y = yEnergyLine;
      if (x < xStart) {
        // Incident + Reflected wave approximation
        // Interfering wave: sum of incident wave and reflected wave (reflected amplitude is sqrt(1-T))
        const R_amp = Math.sqrt(Math.max(0, 1 - transmission));
        const waveVal = Math.sin(k * (x - xStart) - time * 3) + R_amp * Math.sin(-k * (x - xStart) - time * 3);
        y += waveVal * (ampIncident / 2);
      } else if (x >= xStart && x <= xEnd) {
        // Under-barrier decay visual approximation
        const fraction = (x - xStart) / (xEnd - xStart);
        const waveVal = Math.sin(time * 3);
        // Exponential decay envelope
        const decayEnvelope = Math.exp(-3 * barrierWidth * fraction);
        y += waveVal * ampIncident * 0.5 * decayEnvelope;
      } else {
        // Transmitted wave (smaller amplitude, propagating right)
        const waveVal = Math.sin(k * (x - xEnd) - time * 3);
        y += waveVal * (ampTransmitted / 2);
      }

      if (x === 20) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    return path;
  };

  return (
    <div className="relative flex h-full min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-purple-100 bg-[linear-gradient(135deg,#fbf8ff_0%,#f5f0ff_48%,#fff8fa_100%)] p-4">
      {/* Dynamic tech grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#d8b4fe_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

      {/* Ambient glows based on state */}
      <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-purple-500/5 blur-[80px]" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-pink-500/5 blur-[80px]" />
      {energy >= barrierHeight && (
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-amber-500/5 blur-[80px]" />
      )}

      {/* Control Panel Overlay (Left) */}
      <div className="absolute top-4 left-4 bg-white/85 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 text-left text-xs sm:text-sm text-slate-700 font-bold space-y-1 shadow-sm z-10 select-none">
        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block mb-0.5">
          quantum barrier control
        </span>
        <div className="flex items-center gap-2 text-slate-700">
          <Zap className="w-4 h-4 text-purple-500" />
          <span>สถานะ: {energy >= barrierHeight ? "Classical Transmission" : "Quantum Tunneling"}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <Waves className="w-4 h-4 text-pink-500" />
          <span>อัตราสะท้อน (R): {((1 - transmission) * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Coefficient Overlay (Bottom Left) */}
      <div className="absolute bottom-4 left-4 bg-white/85 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm z-10 select-none">
        <div className="text-right">
          <span className="text-[9px] font-black text-slate-400 block -mb-0.5 tracking-wider">TRANSMISSION T</span>
          <span className="text-base sm:text-lg font-extrabold text-purple-600 font-mono">{(transmission * 100).toFixed(2)}%</span>
        </div>
        <svg className="w-8 h-8 text-purple-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M2 12h20M12 2v20" strokeDasharray="3 3" opacity="0.3"/>
          <path d="M4 12c4-8 12-8 16 0" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Primary Science Stage SVG */}
      <svg className="relative z-10 w-full h-full max-w-[300px] sm:max-w-[620px] select-none" viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId1} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id={gradientId2} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0.05" />
          </linearGradient>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#7c3aed" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Base line */}
        <line x1="10" y1={yGround} x2="250" y2={yGround} stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

        {/* Energy horizontal axis helper */}
        <line x1="20" y1={yEnergyLine} x2="240" y2={yEnergyLine} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 3" />
        <text x="245" y={yEnergyLine + 2} fill="#64748b" fontSize="6" fontWeight="bold">E</text>

        {/* Potential Barrier Rectangle */}
        <rect
          x={xStart}
          y={yBarrierTop}
          width={visualWidth}
          height={V0_pixels}
          fill={`url(#${gradientId1})`}
          stroke="#7c3aed"
          strokeWidth="2"
          rx="2"
          filter={`url(#${filterId})`}
        />
        {/* Label for V0 */}
        <text x={130} y={yBarrierTop - 6} fill="#7c3aed" fontSize="7" fontWeight="extrabold" textAnchor="middle">
          V₀ = {barrierHeight.toFixed(1)} eV
        </text>
        <text x={130} y={yGround - 5} fill="#6b21a8" fontSize="6.5" fontWeight="bold" textAnchor="middle">
          W = {barrierWidth.toFixed(2)} nm
        </text>

        {/* Wave function path */}
        <path
          d={getWavePath()}
          fill="none"
          stroke="#db2777"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Emitters / Detectors visual decorations */}
        {/* Emitter (Left) */}
        <g transform="translate(10, 140)">
          <rect x="0" y="10" width="8" height="20" rx="1" fill="#475569" />
          <circle cx="4" cy="20" r="2.5" fill="#f43f5e" />
          <path d="M8 20 L15 15 M8 20 L15 20 M8 20 L15 25" stroke="#ef4444" strokeWidth="1" />
        </g>

        {/* Detector (Right) */}
        <g transform="translate(242, 140)">
          <rect x="0" y="10" width="8" height="20" rx="1" fill="#475569" />
          <circle cx="4" cy="20" r="3" fill="#10b981" />
          <path d="M0 15 L-6 20 L0 25" stroke="#10b981" strokeWidth="1.2" fill="none" />
        </g>
      </svg>
    </div>
  );
}

// --- LOCAL DARK GRAPH COMPONENT ---
interface GraphProps {
  energy: number;
  barrierHeight: number;
  barrierWidth: number;
}

function TunnelingGraph({ energy, barrierHeight, barrierWidth }: GraphProps) {
  // Plots T vs E for fixed V0 and W
  // E ranges from 1.0 to 12.0
  const calcT = (E_val: number) => {
    if (E_val === barrierHeight) {
      return 1 / (1 + 0.25 * 26.246 * barrierHeight * barrierWidth * barrierWidth);
    }
    if (E_val < barrierHeight) {
      const kappa = Math.sqrt(26.246 * (barrierHeight - E_val));
      const kw = kappa * barrierWidth;
      const sinh_kw = (Math.exp(kw) - Math.exp(-kw)) / 2;
      const factor = 1 + (barrierHeight * barrierHeight * sinh_kw * sinh_kw) / (4 * E_val * (barrierHeight - E_val));
      return 1 / factor;
    } else {
      const k_prime = Math.sqrt(26.246 * (E_val - barrierHeight));
      const sin_kw = Math.sin(k_prime * barrierWidth);
      const factor = 1 + (barrierHeight * barrierHeight * sin_kw * sin_kw) / (4 * E_val * (E_val - barrierHeight));
      return 1 / factor;
    }
  };

  const xToSvgX = (E_val: number) => 30 + ((E_val - 1) / 11) * 150;
  const yToSvgY = (T_val: number) => 105 - T_val * 85;

  const points = [];
  for (let e = 1.0; e <= 12.0; e += 0.2) {
    points.push({ x: xToSvgX(e), y: yToSvgY(calcT(e)) });
  }

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  // Current operational point coordinates
  const currentX = xToSvgX(energy);
  const currentY = yToSvgY(calcT(energy));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm shadow-slate-200/40 flex flex-col h-full select-none">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
          <LineChart className="w-4 h-4 text-purple-600" />
          กราฟค่าสัมประสิทธิ์การทะลุผ่าน (T)
        </h3>
        <span className="text-[10px] font-bold text-purple-600">T vs Energy E</span>
      </div>

      <div className="flex-grow rounded-xl bg-slate-950 p-3 flex flex-col justify-between min-h-[174px]">
        <svg className="w-full h-full min-h-[140px]" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid lines */}
          <line x1="30" y1="105" x2="180" y2="105" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="30" y1="83.75" x2="180" y2="83.75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="62.5" x2="180" y2="62.5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="41.25" x2="180" y2="41.25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="20" x2="180" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Y Axis labels */}
          <text x="27" y="22.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">1.0</text>
          <text x="27" y="65" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.5</text>
          <text x="27" y="107" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.0</text>

          {/* X Axis labels */}
          <text x="30" y="115" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">1.0</text>
          <text x="105" y="115" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">6.5</text>
          <text x="180" y="115" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">12.0</text>

          <text x="32" y="12" fill="#64748b" fontSize="5.5" fontWeight="extrabold">T (Ratio)</text>
          <text x="180" y="115" fill="#64748b" fontSize="5.5" fontWeight="extrabold" textAnchor="end">Energy E (eV)</text>

          {/* Triplet/Singlet Curve Path */}
          <path d={pathD} fill="none" stroke="#a855f7" strokeWidth="2" />

          {/* Active node */}
          <circle cx={currentX} cy={currentY} r="4.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1.2" />
        </svg>
      </div>
    </div>
  );
}

// --- THEORY AND FORMULA BLOCK ---
function TunnelingTheory() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm shadow-slate-200/40 flex flex-col h-full select-none">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-xs sm:text-sm font-black text-slate-800">
        <Info className="h-4.5 w-4.5 text-purple-600" />
        ทฤษฎีและสูตรการคำนวณ
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 flex items-center justify-center">
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-slate-800 inline-flex items-center gap-1.5">
            <span>T = [1 + </span>
            <div className="flex flex-col items-center leading-none text-xs sm:text-sm">
              <span>V₀² sinh²(κW)</span>
              <span className="border-t border-slate-800 w-full my-0.5" />
              <span>4E(V₀ - E)</span>
            </div>
            <span>]⁻¹</span>
          </div>
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500 leading-[1.6]">
          กลศาสตร์ควอนตัมอนุญาตให้อนุภาควิ่งผ่านด่านศักย์ศักดิ์สิทธิ์ (Potential Barrier) ที่มีความสูงพลังงานสูงกว่าพลังงานจลน์ของอนุภาคได้ โดยความน่าจะเป็นของสัมประสิทธิ์การทะลุผ่าน (T) จะลดลงแบบเอกซ์โพเนนเชียลตามความกว้าง (W) และมวลของสิ่งกีดขวาง
        </p>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">E: พลังงานอนุภาค</span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">V₀: พลังงานสิ่งกีดขวาง</span>
        </div>
      </div>
    </div>
  );
}

// --- MAIN EXPORTED COMPONENT ---
const MAX_DATA_POINTS = 500;

export default function QuantumTunnelingSimulation() {
  const labId = "quantum-tunneling";

  // Simulator configurations
  const [particleEnergy, setParticleEnergy] = useState(4.0); // E (eV)
  const [barrierHeight, setBarrierHeight] = useState(6.0); // V0 (eV)
  const [barrierWidth, setBarrierWidth] = useState(0.3); // W (nm)

  const logInterval = 10; // auto log interval (10s)
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Simulation running loop states
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<TunnelingDataPoint[]>([]);
  const [lastLoggedTime, setLastLoggedTime] = useState(0);

  // Quest States
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  // References for keeping track of fast state changes inside the interval
  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const lastLoggedTimeRef = useRef(lastLoggedTime);

  const particleEnergyRef = useRef(particleEnergy);
  const barrierHeightRef = useRef(barrierHeight);
  const barrierWidthRef = useRef(barrierWidth);
  const logIntervalRef = useRef(logInterval);
  const simulationSpeedRef = useRef(simulationSpeed);

  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { lastLoggedTimeRef.current = lastLoggedTime; }, [lastLoggedTime]);

  useEffect(() => { particleEnergyRef.current = particleEnergy; }, [particleEnergy]);
  useEffect(() => { barrierHeightRef.current = barrierHeight; }, [barrierHeight]);
  useEffect(() => { barrierWidthRef.current = barrierWidth; }, [barrierWidth]);
  useEffect(() => { simulationSpeedRef.current = simulationSpeed; }, [simulationSpeed]);

  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Compute transmission coefficient T analytically
  const calcTransmission = (E: number, V0: number, W: number) => {
    if (E === V0) {
      const factor = 1 + 0.25 * 26.246 * V0 * W * W;
      return 1 / factor;
    }
    if (E < V0) {
      const kappa = Math.sqrt(26.246 * (V0 - E));
      const kw = kappa * W;
      const sinh_kw = (Math.exp(kw) - Math.exp(-kw)) / 2;
      const factor = 1 + (V0 * V0 * sinh_kw * sinh_kw) / (4 * E * (V0 - E));
      return 1 / factor;
    } else {
      const k_prime = Math.sqrt(26.246 * (E - V0));
      const sin_kw = Math.sin(k_prime * W);
      const factor = 1 + (V0 * V0 * sin_kw * sin_kw) / (4 * E * (E - V0));
      return 1 / factor;
    }
  };

  const transmission = calcTransmission(particleEnergy, barrierHeight, barrierWidth);

  // Main Ticking Loop effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning) {
      timer = setInterval(() => {
        const deltaSeconds = 0.1 * simulationSpeedRef.current;
        const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
        setElapsedSeconds(nextSeconds);
        elapsedSecondsRef.current = nextSeconds;

        const currentE = particleEnergyRef.current;
        const currentV0 = barrierHeightRef.current;
        const currentW = barrierWidthRef.current;
        const currentT = calcTransmission(currentE, currentV0, currentW);

        // Quest tracking: Achieve T between 0.40 and 0.60 and maintain it for 10 seconds continuously
        if (currentT >= 0.40 && currentT <= 0.60) {
          const nextQuestProg = Math.min(10, questProgressRef.current + deltaSeconds);
          setQuestProgress(nextQuestProg);
          questProgressRef.current = nextQuestProg;

          if (nextQuestProg >= 10 && !questSuccessRef.current) {
            setQuestSuccess(true);
            questSuccessRef.current = true;
            alert("🎉 ยินดีด้วย! คุณควบคุมสัมประสิทธิ์การทะลุผ่านให้อยู่ในช่วง 40% - 60% ต่อเนื่องเป็นเวลา 10 วินาทีสำเร็จ บันทึกผลการทดลองเพื่อเก็บความคืบหน้า");
          }
        } else {
          setQuestProgress(0);
          questProgressRef.current = 0;
        }

        // Check if log interval threshold is crossed to auto log a data point
        if (nextSeconds - lastLoggedTimeRef.current >= logIntervalRef.current) {
          setDataPoints((prev) =>
            [
              ...prev,
              {
                time: nextSeconds,
                energy: currentE,
                barrierHeight: currentV0,
                barrierWidth: currentW,
                transmission: currentT,
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

  // Start / Pause toggle
  const handleStartStop = () => {
    const nextIsRunning = !isRunning;
    setIsRunning(nextIsRunning);
    isRunningRef.current = nextIsRunning;

    if (nextIsRunning && elapsedSeconds === 0) {
      setDataPoints([
        {
          time: 0,
          energy: particleEnergy,
          barrierHeight: barrierHeight,
          barrierWidth: barrierWidth,
          transmission: transmission,
        }
      ]);
      setLastLoggedTime(0);
      lastLoggedTimeRef.current = 0;
    }
  };

  // Reset simulator
  const handleReset = () => {
    setIsRunning(false);
    isRunningRef.current = false;

    setQuestProgress(0);
    questProgressRef.current = 0;

    setElapsedSeconds(0);
    elapsedSecondsRef.current = 0;

    setDataPoints([]);

    setLastLoggedTime(0);
    lastLoggedTimeRef.current = 0;
  };

  // Add Manual log point
  const handleAddPoint = () => {
    setDataPoints((prev) =>
      [
        ...prev,
        {
          time: elapsedSeconds,
          energy: particleEnergy,
          barrierHeight: barrierHeight,
          barrierWidth: barrierWidth,
          transmission: transmission,
        },
      ].slice(-MAX_DATA_POINTS),
    );
  };

  // Clear single point from table
  const handleClearPoint = (index: number) => {
    setDataPoints((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Export data as simulated CSV
  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    const headers = "เวลาจำลอง (วินาที),พลังงานอนุภาค E (eV),ความสูงสิ่งกีดขวาง V0 (eV),ความกว้างสิ่งกีดขวาง W (nm),อัตราการทะลุผ่าน T (Ratio)\n";
    const rows = dataPoints.map(p => `${p.time.toFixed(1)},${p.energy.toFixed(2)},${p.barrierHeight.toFixed(2)},${p.barrierWidth.toFixed(2)},${p.transmission.toFixed(4)}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scisiam_quantum_tunneling_${labId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Data to clipboard
  const handleCopyData = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการคัดลอก!");
      return;
    }
    const content = dataPoints
      .map(p => `เวลา: ${p.time.toFixed(1)} วินาที | E: ${p.energy.toFixed(1)} eV | V0: ${p.barrierHeight.toFixed(1)} eV | W: ${p.barrierWidth.toFixed(2)} nm | T: ${(p.transmission * 100).toFixed(2)}%`)
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

  // Save results and redirect
  const handleSaveResults = async () => {
    if (dataPoints.length === 0) {
      alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล! กรุณากดเริ่มทดลองและเก็บันทึกข้อมูลก่อน");
      return;
    }

    const experimentData = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      particleEnergy,
      barrierHeight,
      barrierWidth,
      dataPoints,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_quantum_tunneling_experiment",
      localPayload: experimentData,
      labId,
      title: "Quantum Tunneling",
      variables: {
        particleEnergy,
        barrierHeight,
        barrierWidth,
        logInterval,
        simulationSpeed,
      },
      liveValues: {
        transmission,
        elapsedSeconds,
        questProgress,
        questSuccess,
      },
      graphPoints: dataPoints.map(p => ({ x: p.energy, y: p.transmission })),
      tableRows: dataPoints,
      summary: {
        finalTransmission: transmission,
        dataPointCount: dataPoints.length,
        questSuccess,
      },
    });

    alert("บันทึกข้อมูลการทดลอง (สัมประสิทธิ์การทะลุผ่านและตารางบันทึกผล) สำเร็จ! 🎉");
  };

  const simControls = (
    <div className="space-y-5">
      {/* Slider: Particle Energy */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-600">พลังงานของอนุภาค (E)</span>
          <span className="text-purple-650 font-mono">{particleEnergy.toFixed(2)} eV</span>
        </div>
        <input
          type="range"
          min="1.0"
          max="10.0"
          step="0.1"
          value={particleEnergy}
          onChange={(e) => setParticleEnergy(parseFloat(e.target.value))}
          className="w-full accent-purple-650"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>1.0 eV</span>
          <span>10.0 eV</span>
        </div>
      </div>

      {/* Slider: Barrier Height */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-600">ความสูงด่านศักย์ (V₀)</span>
          <span className="text-purple-655 font-mono">{barrierHeight.toFixed(2)} eV</span>
        </div>
        <input
          type="range"
          min="3.0"
          max="12.0"
          step="0.1"
          value={barrierHeight}
          onChange={(e) => setBarrierHeight(parseFloat(e.target.value))}
          className="w-full accent-purple-655"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>3.0 eV</span>
          <span>12.0 eV</span>
        </div>
      </div>

      {/* Slider: Barrier Width */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-600">ความกว้างสิ่งกีดขวาง (W)</span>
          <span className="text-purple-655 font-mono">{barrierWidth.toFixed(2)} nm</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="0.8"
          step="0.01"
          value={barrierWidth}
          onChange={(e) => setBarrierWidth(parseFloat(e.target.value))}
          className="w-full accent-purple-655"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>0.10 nm</span>
          <span>0.80 nm</span>
        </div>
      </div>

      {/* Simulation speed selection */}
      <div className="space-y-2">
        <span className="block text-xs sm:text-sm font-bold text-slate-600 font-bold">ความเร็วจำลอง</span>
        <div className="grid grid-cols-4 gap-1.5">
          {[0.5, 1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => setSimulationSpeed(speed)}
              className={`rounded-lg py-1.5 text-xs font-black transition-all ${
                simulationSpeed === speed
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100"
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Ticking Controls */}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={handleStartStop}
          className={`flex-grow flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition-all active:scale-95 ${
            isRunning
              ? "bg-slate-700 shadow-lg shadow-slate-500/10"
              : "bg-purple-600 shadow-lg shadow-purple-500/20 hover:bg-purple-700"
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
          <ClipboardList className="h-4 w-4 text-purple-500" />
        </button>
      </div>
    </div>
  );

  const dataTable = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">บันทึกประวัติการทดลอง</span>
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
                <th className="px-3 py-2">E (eV)</th>
                <th className="px-3 py-2">V₀ (eV)</th>
                <th className="px-3 py-2">W (nm)</th>
                <th className="px-3 py-2">T (%)</th>
                <th className="px-2 py-2 text-center">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataPoints.map((point, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono">{point.time.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono">{point.energy.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono">{point.barrierHeight.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono">{point.barrierWidth.toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono">{(point.transmission * 100).toFixed(1)}%</td>
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
      accent="violet"
      labId={labId}
      category="Physics"
      title="Quantum Tunneling (การทะลุผ่านเชิงควอนตัม)"
      subtitle="จำลองฟังก์ชันคลื่นแพ็กเกจอนุภาคที่วิ่งเข้าชนสิ่งกีดขวางศักย์ V₀ ศึกษาความน่าจะเป็นของการทะลุผ่านที่คลาสสิกไม่อนุญาต"
      statusLabel={isRunning ? "กำลังจำลองระบบคลื่น" : "พร้อมทดลอง"}
      icon={Waves}
      sceneTitle="ภาพจำลองศักย์และฟังก์ชันคลื่นควอนตัม"
      scene={
        <TunnelingViewport
          energy={particleEnergy}
          barrierHeight={barrierHeight}
          barrierWidth={barrierWidth}
          transmission={transmission}
          isRunning={isRunning}
        />
      }
      controlsTitle="แผงพารามิเตอร์ด่านศักย์"
      controls={simControls}
      metrics={[
        { label: "สัมประสิทธิ์ T (ทะลุผ่าน)", value: `${(transmission * 100).toFixed(1)}%`, tone: "violet" },
        { label: "สัมประสิทธิ์ R (สะท้อน)", value: `${((1 - transmission) * 100).toFixed(1)}%`, tone: "pink" },
        { label: "พลังงานอนุภาค E", value: `${particleEnergy.toFixed(1)} eV`, tone: "blue" },
        { label: "ความสูงศักย์ V₀", value: `${barrierHeight.toFixed(1)} eV`, tone: "rose" },
      ]}
      graph={
        <TunnelingGraph
          energy={particleEnergy}
          barrierHeight={barrierHeight}
          barrierWidth={barrierWidth}
        />
      }
      table={dataTable}
      theory={<TunnelingTheory />}
      steps={[
        { label: "กำหนดระดับ E และศักย์ V₀", icon: Sliders },
        { label: "ตั้งค่าความกว้างด่านศักย์ W", icon: Target },
        { label: "เปิดรันการจำลองความน่าจะเป็น", icon: Play },
        { label: "บันทึกและพล็อตสัมประสิทธิ์ T", icon: ClipboardList },
      ]}
      learningGoals={[
        "อธิบายความต่างของการทะลุผ่านควอนตัมกับกลศาสตร์คลาสสิก",
        "วิเคราะห์แนวโน้มการลดลงแบบเอกซ์โพเนนเชียลภายใต้ด่านศักย์",
        "ศึกษาผลกระทบของระดับพลังงาน E และความกว้าง W ต่ออัตราผ่าน",
      ]}
      progressLabel="ระยะเวลาที่อัตราผ่านอยู่ในช่วงเป้าหมาย"
      progressValue={`${questProgress.toFixed(1)} / 10 วินาที`}
      progressPercent={(questProgress / 10) * 100}
      tips={[
        "อัตราผ่าน T จะค่อนข้างมีนัยสำคัญเมื่อระดับ E มีค่าขยับเข้าใกล้ V₀ มากขึ้น",
        "หากความกว้างด่านศักย์ W มีขนาดสั้นมาก โอกาสทะลุผ่านจะเพิ่มขึ้นมหาศาลแบบก้าวกระโดด",
        "ภารกิจ: รักษาค่าสัมประสิทธิ์การทะลุผ่าน (T) ให้อยู่ในช่วง 40% - 60% ต่อเนื่องเป็นเวลา 10 วินาที",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
