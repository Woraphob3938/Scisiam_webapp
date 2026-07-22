"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sliders,
  RotateCcw,
  ClipboardList,
  Activity,
  Play,
  Pause,
  Clipboard,
  Download,
  Trash,
  Target,
  Sparkles,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedModelRun {
  index: number;
  modelType: string;
  paramA: number; // e.g. beta (infection rate) or prey birth rate
  paramB: number; // e.g. gamma (recovery rate) or predator death rate
  timeElapsed: number;
  finalPreyVal: number;
  finalPredatorVal: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: "S" | "I" | "R" | "Prey" | "Predator"; // S=susceptible, I=infected, R=recovered
  recoveryTimer?: number;
}

const MODEL_PRESETS = [
  { id: "sir", label: "การแพร่ระบาด (SIR Epidemic)", desc: "แบบจำลอง S (กลุ่มเสี่ยง) -> I (กลุ่มติดเชื้อ) -> R (กลุ่มหายดี)" },
  { id: "predator_prey", label: "ผู้ล่าและเหยื่อ (Lotka-Volterra)", desc: "วัฏจักรการเติบโตและการล่าระหว่างเหยื่อ (กระต่าย) และผู้ล่า (สุนัขป่า)" },
  { id: "logistic", label: "เติบโตจำกัดขอบเขต (Logistic Growth)", desc: "ประชากรเพิ่มขึ้นแบบเอ็กซ์โพเนนเชียลแล้วชะลอตัวเมื่อถึงขีดจำกัดแครี่อิ้ง (Carrying Capacity)" },
] as const;

const CONTAINER_WIDTH = 200;
const CONTAINER_HEIGHT = 160;

function createInitialParticles(modelType: string): Particle[] {
  const particles: Particle[] = [];
  const count = modelType === "predator_prey" ? 30 : modelType === "logistic" ? 6 : 40;

  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * (CONTAINER_WIDTH - 10) + 5,
      y: Math.random() * (CONTAINER_HEIGHT - 10) + 5,
      vx: (Math.random() - 0.5) * (modelType === "predator_prey" ? 1.5 : 2),
      vy: (Math.random() - 0.5) * (modelType === "predator_prey" ? 1.5 : 2),
      state:
        modelType === "sir"
          ? i === 0 ? "I" : "S"
          : modelType === "predator_prey"
            ? i < 20 ? "Prey" : "Predator"
            : "Prey",
      recoveryTimer: modelType === "sir" && i === 0 ? 150 : undefined,
    });
  }

  return particles;
}

export default function MathematicalModelingSimulation() {
  const router = useRouter();
  const labId = "mathematical-modeling-lab";

  const [modelType, setModelType] = useState<string>("sir");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // SIR Parameters
  const [infectionRate, setInfectionRate] = useState<number>(0.6); // beta
  const [recoveryRate, setRecoveryRate] = useState<number>(0.2);  // gamma

  // Predator Prey parameters
  const [preyBirthRate, setPreyBirthRate] = useState<number>(0.5);
  const [predatorDeathRate, setPredatorDeathRate] = useState<number>(0.3);

  // Logistic parameters
  const [carryingCapacity, setCarryingCapacity] = useState<number>(80);

  const [loggedRuns, setLoggedRuns] = useState<LoggedModelRun[]>([]);

  // Simulation clock/state
  const [time, setTime] = useState<number>(0);
  const [particles, setParticles] = useState<Particle[]>(() => createInitialParticles("sir"));
  const [history, setHistory] = useState<{ t: number; y1: number; y2: number; y3?: number }[]>([]);

  const containerWidth = CONTAINER_WIDTH;
  const containerHeight = CONTAINER_HEIGHT;

  // Initialize particles based on modelType
  const initSimulation = (nextModelType = modelType) => {
    setTime(0);
    setHistory([]);
    setParticles(createInitialParticles(nextModelType));
  };

  // Main tick loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTime((t) => t + 1);

      setParticles((prevParticles) => {
        const next = prevParticles.map((p) => {
          // Move particles
          let nx = p.x + p.vx;
          let ny = p.y + p.vy;

          // Wall bounce
          let nvx = p.vx;
          let nvy = p.vy;
          if (nx <= 4 || nx >= containerWidth - 4) {
            nvx = -nvx;
            nx = nx <= 4 ? 4 : containerWidth - 4;
          }
          if (ny <= 4 || ny >= containerHeight - 4) {
            nvy = -nvy;
            ny = ny <= 4 ? 4 : containerHeight - 4;
          }

          // Recovery timers countdown
          let nextState = p.state;
          let rTimer = p.recoveryTimer;
          if (p.state === "I" && rTimer !== undefined) {
            rTimer -= 1;
            if (rTimer <= 0) {
              nextState = "R";
              rTimer = undefined;
            }
          }

          return { ...p, x: nx, y: ny, vx: nvx, vy: nvy, state: nextState, recoveryTimer: rTimer };
        });

        // 1. Collision Infections for SIR model
        if (modelType === "sir") {
          for (let i = 0; i < next.length; i++) {
            if (next[i].state !== "I") continue;
            for (let j = 0; j < next.length; j++) {
              if (next[j].state !== "S") continue;
              
              // Distance check
              const dx = next[i].x - next[j].x;
              const dy = next[i].y - next[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 8) {
                // Infect with probability of infectionRate
                if (Math.random() < infectionRate) {
                  next[j].state = "I";
                  // recoveryTimer takes around 100 - 200 ticks based on recoveryRate
                  next[j].recoveryTimer = Math.round((1 / (recoveryRate + 0.05)) * 25 + Math.random() * 20);
                }
              }
            }
          }
        }

        // 2. Predator-Prey Interaction simulation
        else if (modelType === "predator_prey") {
          const activePreys = next.filter((p) => p.state === "Prey");
          // Prey births: reproduction rate increases chance of new prey appearing randomly near preys
          if (activePreys.length > 0 && activePreys.length < 75 && Math.random() < preyBirthRate * 0.15) {
            const parent = activePreys[Math.floor(Math.random() * activePreys.length)];
            next.push({
              id: Date.now() + Math.random(),
              x: Math.min(containerWidth - 5, Math.max(5, parent.x + (Math.random() - 0.5) * 10)),
              y: Math.min(containerHeight - 5, Math.max(5, parent.y + (Math.random() - 0.5) * 10)),
              vx: (Math.random() - 0.5) * 1.5,
              vy: (Math.random() - 0.5) * 1.5,
              state: "Prey",
              recoveryTimer: undefined,
            });
          }

          // Predator starves/dies
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].state === "Predator" && Math.random() < predatorDeathRate * 0.025) {
              next.splice(i, 1);
            }
          }

          // Predator eats prey: when they get close, prey dies, predator reproduces
          for (let i = 0; i < next.length; i++) {
            if (next[i].state !== "Predator") continue;
            for (let j = 0; j < next.length; j++) {
              if (next[j].state !== "Prey") continue;

              const dx = next[i].x - next[j].x;
              const dy = next[i].y - next[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist < 8) {
                // Predator eats prey
                next.splice(j, 1); // remove prey
                
                // Breed new predator with 30% chance
                if (Math.random() < 0.3) {
                  next.push({
                    id: Date.now() + Math.random(),
                    x: next[i].x,
                    y: next[i].y,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5,
                    state: "Predator",
                    recoveryTimer: undefined,
                  });
                }
                break;
              }
            }
          }
        }

        // 3. Logistic Growth: multiply up to Carrying Capacity (carryingCapacity)
        else if (modelType === "logistic") {
          const currentCount = next.length;
          if (currentCount > 0 && currentCount < carryingCapacity) {
            // Growth rate relative to unused capacity: r * N * (1 - N/K)
            const growthProb = 0.12 * (1 - currentCount / carryingCapacity);
            if (Math.random() < growthProb) {
              const parent = next[Math.floor(Math.random() * next.length)];
              next.push({
                id: Date.now() + Math.random(),
                x: Math.min(containerWidth - 5, Math.max(5, parent.x + (Math.random() - 0.5) * 8)),
                y: Math.min(containerHeight - 5, Math.max(5, parent.y + (Math.random() - 0.5) * 8)),
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                state: "Prey",
                recoveryTimer: undefined,
              });
            }
          }
          // Natural deaths at overcrowded rates
          if (currentCount > carryingCapacity) {
            next.pop();
          }
        }

        return next;
      });

      // Update time-series history
      setHistory((prev) => {
        const stats = { s: 0, i: 0, r: 0 };
        particles.forEach((p) => {
          if (p.state === "S") stats.s++;
          else if (p.state === "I") stats.i++;
          else if (p.state === "R") stats.r++;
          else if (p.state === "Prey") stats.s++; // Map Prey to s
          else if (p.state === "Predator") stats.i++; // Map Predator to i
        });

        const newPoint = {
          t: prev.length,
          y1: stats.s,
          y2: stats.i,
          y3: stats.r,
        };

        const updated = [...prev, newPoint];
        return updated.slice(-100); // keep last 100 points
      });

    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, particles, modelType, infectionRate, recoveryRate, preyBirthRate, predatorDeathRate, carryingCapacity, containerHeight, containerWidth]);

  // Derived current metrics counts
  const currentCounts = useMemo(() => {
    let y1 = 0;
    let y2 = 0;
    let y3 = 0;
    particles.forEach((p) => {
      if (p.state === "S") y1++;
      else if (p.state === "I") y2++;
      else if (p.state === "R") y3++;
      else if (p.state === "Prey") y1++;
      else if (p.state === "Predator") y2++;
    });
    return { y1, y2, y3 };
  }, [particles]);

  const handleAddLog = () => {
    const run: LoggedModelRun = {
      index: loggedRuns.length + 1,
      modelType: MODEL_PRESETS.find((p) => p.id === modelType)?.label || modelType,
      paramA: modelType === "sir" ? infectionRate : modelType === "predator_prey" ? preyBirthRate : 1.0,
      paramB: modelType === "sir" ? recoveryRate : modelType === "predator_prey" ? predatorDeathRate : carryingCapacity,
      timeElapsed: time,
      finalPreyVal: currentCounts.y1,
      finalPredatorVal: currentCounts.y2,
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    initSimulation();
  };

  const handleCopyData = () => {
    const header = "ชุด\tโมเดลจำลอง\tพารามิเตอร์ A\tพารามิเตอร์ B\tเวลาจำลอง\tประชากรหลัก\tประชากรรอง\n";
    const rows = loggedRuns.map(
      (r) => `${r.index}\t${r.modelType}\t${r.paramA.toFixed(2)}\t${r.paramB.toFixed(2)}\t${r.timeElapsed}\t${r.finalPreyVal}\t${r.finalPredatorVal}`
    );
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map(
      (r) => `${r.index},${r.modelType},${r.paramA},${r.paramB},${r.timeElapsed},${r.finalPreyVal},${r.finalPredatorVal}`
    );
    const csv = "data:text/csv;charset=utf-8," + ["Index,ModelType,ParamA,ParamB,TimeElapsed,Population1,Population2", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "math_modeling_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    if (loggedRuns.length === 0) {
      alert("กรุณากดบันทึกค่าพารามิเตอร์จำลองอย่างน้อย 1 ครั้งก่อนส่งออกรายงาน");
      return;
    }
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_math_modeling_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "Mathematical Modeling Lab",
      variables: { modelType, infectionRate, recoveryRate, carryingCapacity },
      liveValues: { time, currentSusceptible: currentCounts.y1, currentInfected: currentCounts.y2 },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.timeElapsed, y: r.finalPreyVal })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, maxTime: Math.max(...loggedRuns.map((r) => r.timeElapsed)) },
      score: Math.min(100, Math.max(40, 40 + loggedRuns.length * 15)),
      durationSeconds: null,
    });
    alert("บันทึกรายงานแบบจำลองคณิตศาสตร์สำเร็จ");
    router.push(`/labs/${labId}`);
  };

  // Compile graph SVG points path
  const graphPaths = useMemo(() => {
    if (history.length < 2) return { p1: "", p2: "", p3: "" };

    const getX = (t: number) => 10 + (t / 100) * 120;
    // Map populations scale: [0, 80] -> [130, 10]
    const getY = (v: number) => 130 - (v / 85) * 120;

    let p1 = `M ${getX(history[0].t)} ${getY(history[0].y1)}`;
    let p2 = `M ${getX(history[0].t)} ${getY(history[0].y2)}`;
    let p3 = history[0].y3 !== undefined ? `M ${getX(history[0].t)} ${getY(history[0].y3!)}` : "";

    for (let i = 1; i < history.length; i++) {
      p1 += ` L ${getX(history[i].t)} ${getY(history[i].y1)}`;
      p2 += ` L ${getX(history[i].t)} ${getY(history[i].y2)}`;
      if (history[i].y3 !== undefined) {
        p3 += ` L ${xlGetX(history[i].t)} ${getY(history[i].y3!)}`;
      }
    }

    // Helper function for X coordinate inside loop
    function xlGetX(indexT: number) {
      return 10 + (indexT / 100) * 120;
    }

    return { p1, p2, p3 };
  }, [history]);

  const questProgress = Math.min(100, Math.round((loggedRuns.length / 3) * 100));

  return (
    <SharedSimulationShell
      accent="rose"
      labId={labId}
      category="Mathematics"
      title="Mathematical Modeling Lab"
      subtitle="จำลองระบบนิเวศและกลไกประชากรพลวัตด้วยแบบจำลองคณิตศาสตร์เชิงคำนวณและอนุภาคพฤติกรรม"
      statusLabel={`${MODEL_PRESETS.find((p) => p.id === modelType)?.label} | t = ${time}`}
      icon={Activity}
      sceneTitle="วิชวลจำลองและกราฟเปรียบเทียบ (Visual Simulation & Graph)"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-rose-100 bg-[linear-gradient(135deg,#fff8f8_0%,#fff1f2_48%,#fff7f6_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          {/* Model Type Selector Tabs */}
          <div className="relative z-10 mb-3 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans overflow-x-auto max-w-full">
            {MODEL_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setModelType(p.id);
                  initSimulation(p.id);
                }}
                className={`rounded-lg px-2.5 py-1.5 text-[10.5px] font-black transition-all ${
                  modelType === p.id ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {p.id === "sir" ? "SIR Epidemic" : p.id === "predator_prey" ? "Predator-Prey" : "Logistic Growth"}
              </button>
            ))}
          </div>

          <div className="relative flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center">
            {/* Visual Agent box stage */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 mb-1">กล่องสภาวะประชากร (Agent Stage)</span>
              <svg viewBox="0 0 200 160" className="w-full max-w-[200px] h-[160px] rounded-xl border border-rose-200/70 bg-white/95 shadow-inner">
                {/* Boundary wall */}
                <rect x="0" y="0" width="200" height="160" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                
                {/* Render Particles */}
                {particles.map((p) => {
                  let color = "#64748b"; // S / Susceptible (slate)
                  if (p.state === "I") color = "#f43f5e"; // I / Infected (rose)
                  else if (p.state === "R") color = "#10b981"; // R / Recovered (emerald)
                  else if (p.state === "Prey") color = "#3b82f6"; // Prey (blue)
                  else if (p.state === "Predator") color = "#8b5cf6"; // Predator (violet)

                  return (
                    <circle
                      key={p.id}
                      cx={p.x}
                      cy={p.y}
                      r={p.state === "Predator" ? "4.5" : "3.5"}
                      fill={color}
                      stroke="white"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Time-series plot SVG */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 mb-1">แผนภูมิการสะสม (Time-series Graph)</span>
              <svg viewBox="0 0 140 140" className="w-full max-w-[140px] h-[140px] rounded-xl border border-rose-200/70 bg-white/95 p-1 shadow-inner">
                {/* Axes */}
                <line x1="10" y1="10" x2="10" y2="130" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="10" y1="130" x2="130" y2="130" stroke="#cbd5e1" strokeWidth="1" />

                {/* Logistic carrying capacity line */}
                {modelType === "logistic" && (
                  <line
                    x1="10"
                    y1={130 - (carryingCapacity / 85) * 120}
                    x2="130"
                    y2={130 - (carryingCapacity / 85) * 120}
                    stroke="#f43f5e"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                )}

                {/* Plots */}
                {history.length >= 2 && (
                  <>
                    <path d={graphPaths.p1} fill="none" stroke={modelType === "sir" ? "#64748b" : modelType === "predator_prey" ? "#3b82f6" : "#475569"} strokeWidth="1.8" />
                    <path d={graphPaths.p2} fill="none" stroke={modelType === "sir" ? "#f43f5e" : "#8b5cf6"} strokeWidth="1.8" />
                    {modelType === "sir" && graphPaths.p3 && (
                      <path d={graphPaths.p3} fill="none" stroke="#10b981" strokeWidth="1.8" />
                    )}
                  </>
                )}
              </svg>
            </div>
          </div>
        </div>
      }
      controlsTitle="ควบคุมแบบจำลองประชากร"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          {modelType === "sir" && (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Sliders className="h-4.5 w-4.5 text-rose-500" />
                พารามิเตอร์จำลองโรคระบาด (SIR)
              </h3>
              
              <ManualNumberInput
                label="อัตราการแพร่เชื้อ (Infection Rate β)"
                ariaLabel="ความเร็วการกระจายโรค"
                value={infectionRate}
                min={0.1}
                max={1.0}
                step={0.1}
                onChange={setInfectionRate}
                tone="pink"
              />
              <ManualNumberInput
                label="อัตราการรักษาหาย (Recovery Rate γ)"
                ariaLabel="ระยะเวลาที่ใช้ในการรักษา"
                value={recoveryRate}
                min={0.05}
                max={0.5}
                step={0.05}
                onChange={setRecoveryRate}
                tone="emerald"
              />
            </section>
          )}

          {modelType === "predator_prey" && (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Sliders className="h-4.5 w-4.5 text-rose-500" />
                พารามิเตอร์เหยื่อและผู้ล่า (Lotka-Volterra)
              </h3>
              
              <ManualNumberInput
                label="อัตราการเกิดของเหยื่อ (Prey Birth)"
                ariaLabel="อัตราแพร่พันธุ์เหยื่อ"
                value={preyBirthRate}
                min={0.1}
                max={1.0}
                step={0.1}
                onChange={setPreyBirthRate}
                tone="blue"
              />
              <ManualNumberInput
                label="อัตราการตายของผู้ล่า (Predator Death)"
                ariaLabel="อัตราการหิวตายผู้ล่า"
                value={predatorDeathRate}
                min={0.1}
                max={0.8}
                step={0.05}
                onChange={setPredatorDeathRate}
                tone="violet"
              />
            </section>
          )}

          {modelType === "logistic" && (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Sliders className="h-4.5 w-4.5 text-rose-500" />
                ความจุแครี่อิ้ง (Logistic Capacity)
              </h3>
              
              <ManualNumberInput
                label="ขีดจำกัดแครี่อิ้งประชากร (Carrying Capacity K)"
                ariaLabel="พิกัดสูงสุดระบบ"
                value={carryingCapacity}
                min={20}
                max={90}
                step={5}
                onChange={setCarryingCapacity}
                tone="pink"
              />
            </section>
          )}

          {/* Controls toggle */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-97 cursor-pointer"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 text-rose-500" /> : <Play className="h-3.5 w-3.5 text-emerald-500" />}
              {isPlaying ? "หยุดชั่วคราว" : "เล่นต่อ"}
            </button>
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-97 cursor-pointer"
            >
              <ClipboardList className="h-3.5 w-3.5 text-rose-500" />
              บันทึกจุดเวลา
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50/50 py-2 text-xs font-bold text-rose-700 shadow-sm transition-all hover:bg-rose-50 active:scale-97 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              รีเซ็ตจำลอง
            </button>
          </div>
        </div>
      }
      compactControls={
        <div className="flex items-center gap-2 font-sans flex-wrap">
          <button onClick={() => setIsPlaying(!isPlaying)} className="px-2 py-1 text-xs font-bold rounded bg-slate-100">{isPlaying ? "Pause" : "Play"}</button>
          <button onClick={handleReset} className="rounded bg-pink-200 px-2 py-1 text-xs font-bold text-pink-900 hover:bg-pink-300">Reset</button>
        </div>
      }
      metrics={[
        { label: modelType === "sir" ? "เสี่ยงติดเชื้อ (Susceptible)" : "จำนวนเหยื่อ (Prey)", value: `${currentCounts.y1} หน่วย`, tone: modelType === "sir" ? "rose" : "blue" },
        { label: modelType === "sir" ? "กำลังติดเชื้อ (Infected)" : "จำนวนผู้ล่า (Predator)", value: `${currentCounts.y2} หน่วย`, tone: modelType === "sir" ? "orange" : "violet" },
        { label: modelType === "sir" ? "หายดีแล้ว (Recovered)" : "เวลาจำลองสะสม (Time)", value: modelType === "sir" ? `${currentCounts.y3} หน่วย` : `${time} วินาที`, tone: modelType === "sir" ? "emerald" : "orange" },
        { label: "ประชากรรวมที่จำลอง", value: `${particles.length} หน่วย`, tone: undefined },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-rose-600" />
              แผนภูมิยอดเวลาจำลองสะสม (Simulation Time Plot)
            </h3>
          </div>
          <div className="flex-grow flex items-center justify-center">
            {loggedRuns.length === 0 ? (
              <div className="text-xs text-slate-400">บันทึกสถิติเพื่อดูแผนภูมิสะสมเวลาจำลอง</div>
            ) : (
              <svg viewBox="0 0 200 120" className="w-full max-w-[240px] h-auto">
                <line x1="15" y1="100" x2="185" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="15" y1="10" x2="15" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                {loggedRuns.map((r, i) => {
                  const bw = 12;
                  const bx = 25 + i * 22;
                  const bh = Math.min(80, (r.timeElapsed / 300) * 80);
                  return (
                    <g key={i}>
                      <rect x={bx} y={100 - bh} width={bw} height={bh} fill="#e11d48" rx="2" />
                      <text x={bx + bw / 2} y={110} textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="bold">#{r.index}</text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <ClipboardList className="h-4.5 w-4.5 text-rose-500" />
              ตารางสรุปผลลัพธ์โมเดล
            </h3>
            {loggedRuns.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={handleCopyData} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                  <Clipboard className="h-3 w-3" /> คัดลอก
                </button>
                <button onClick={handleExportCSV} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                  <Download className="h-3 w-3" /> CSV
                </button>
              </div>
            )}
          </div>
          {loggedRuns.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-xs text-slate-400 py-10">ยังไม่มีการบันทึกประวัติแบบจำลอง</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center">ชุด</th>
                    <th className="p-2">แบบจำลอง</th>
                    <th className="p-2">พารามิเตอร์ A / B</th>
                    <th className="p-2">เวลาวิจัย t</th>
                    <th className="p-2">ประชากรหลัก</th>
                    <th className="p-2">ประชากรรอง</th>
                    <th className="p-2 text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  {loggedRuns.map((r) => (
                    <tr key={r.index} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-bold">{r.index}</td>
                      <td className="p-2 font-sans">{r.modelType.split(" ")[0]}</td>
                      <td className="p-2">A: {r.paramA.toFixed(2)} / B: {r.paramB.toFixed(2)}</td>
                      <td className="p-2">{r.timeElapsed} วินาที</td>
                      <td className="p-2 font-bold">{r.finalPreyVal}</td>
                      <td className="p-2">{r.finalPredatorVal}</td>
                      <td className="p-2 text-center">
                        <button onClick={() => handleClearLog(r.index)} className="text-rose-500 hover:bg-rose-50 p-1 rounded">
                          <Trash className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      }
      learningGoals={[
        "เรียนรู้วิธีการกำหนดและวิจัยพารามิเตอร์ในแบบจำลองโรคระบาดและระบบนิเวศประชากร",
        "สังเกตการณ์เปลี่ยนแปลงและอัตราจำลองสมดุลเหยื่อ-ผู้ล่า (Lotka-Volterra) แบบแกว่งกวัด",
        "เข้าใจกฎความจุ Carrying Capacity ในโมเดล Logistic Growth ผ่านการจำลองระดับอนุภาค",
      ]}
      steps={[
        { label: "เลือกสไตล์ของแบบจำลองคณิตศาสตร์พลวัตที่ต้องการประเมิน", icon: Activity },
        { label: "ปรับตั้งค่าพารามิเตอร์เริ่มต้นเช่น อัตราติดเชื้อ หรือขีดจำกัดแครี่อิ้ง", icon: Sliders },
        { label: "กดเล่น (Play) เพื่อจำลองการเด้งชนของประชากรและวาดกราฟสะสม", icon: Target },
        { label: "กดบันทึกจุดเวลาเพื่อเก็บสถิติตัวแปรประชากรเปรียบเทียบในรายงาน", icon: ClipboardList },
      ]}
      progressLabel="ความคืบหน้าของแบบจำลอง"
      progressValue={
        questProgress === 100
          ? "วิเคราะห์และจำลองสมดุลคณิตศาสตร์สำเร็จ"
          : `บันทึกข้อมูลแล้ว ${loggedRuns.length}/3 ช่วงเวลา`
      }
      progressPercent={questProgress}
      tips={[
        "ในการจำลองโรคระบาด (SIR) หากอัตราการรักษาหาย (gamma) สูงกว่า อัตราแพร่เชื้อ (beta) โรคจะไม่ระบาด",
        "การจำลอง Lotka-Volterra มีสมดุลที่อ่อนไหว หากผู้ล่าหิวโซตายหมด เหยื่อจะขยายตัวทวีคูณไม่มีสิ้นสุด",
        "คุณสามารถกดหยุดชั่วคราว (Pause) เพื่อจดบันทึกตัวแปรจำนวนประชากรที่เวลาจำเพาะได้อย่างแม่นยำ",
      ]}
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">การสร้างแบบจำลองคณิตศาสตร์ (Mathematical Modeling)</p>
          <p className="mb-3">
            การจำลองทางคณิตศาสตร์ช่วยแปลงระบบธรรมชาติที่ซับซ้อนให้อยู่ในรูปสมการผลต่างหรือสมการเชิงอนุพันธ์เพื่อทำนายผลลัพธ์:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>SIR Model:</strong> นิยามโดยสมการเชิงอนุพันธ์ย่อยสามส่วน {"\\frac{dS}{dt} = -\\beta SI"}, {"\\frac{dI}{dt} = \\beta SI - \\gamma I"}, {"\\frac{dR}{dt} = \\gamma I"} ใช้จำลองการระบาดของไวรัสในวงกว้าง
            </li>
            <li>
              <strong>Lotka-Volterra Equations:</strong> จำลองปฏิสัมพันธ์ทางชีวภาพของระบบนิเวศ โดยเหยื่อโตขึ้นแบบทวีคูณเมื่อไร้ผู้ล่า แต่เมื่อผู้ล่ามีมากจะถูกล่าจนจำนวนหดตัวสลับเป็นวัฏจักร
            </li>
            <li>
              <strong>Logistic Growth:</strong> การเติบโตที่มีขีดจำกัดสูงสุดอันเนื่องมาจากพื้นที่หรืออาหาร {"\\frac{dN}{dt} = rN(1 - \\frac{N}{K})"} ซึ่งจำกัดให้ประชากรหยุดเติบโตที่ค่าคงที่ $K$
            </li>
          </ul>
        </div>
      }
      onRun={() => setIsPlaying((current) => !current)}
      runLabel={isPlaying ? "หยุดทดลอง" : "ทดลอง"}
      runActive={isPlaying}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
