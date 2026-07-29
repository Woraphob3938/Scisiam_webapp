"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sliders,
  RotateCcw,
  Clipboard,
  ClipboardList,
  Download,
  Trash,
  Target,
  Sparkles,
  Play,
  Pause,
  Activity,
  Layers,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

type DampingState = "underdamped" | "critically-damped" | "overdamped";

interface LoggedDerivRun {
  index: number;
  mass: number;
  stiffness: number;
  damping: number;
  dampingType: string;
  settleTime: string;
}

export default function DifferentialEquationsSimulation() {
  const labId = "differential-equations-lab";

  // Simulation variables states
  const [mass, setMass] = useState<number>(1.5); // m (kg)
  const [stiffness, setStiffness] = useState<number>(15.0); // k (N/m)
  const [damping, setDamping] = useState<number>(2.0); // c (Ns/m)

  // Simulation play state
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Live simulation coordinates
  const [time, setTime] = useState<number>(0.0);
  const [xPos, setXPos] = useState<number>(4.0); // displacement x (starts at 4.0)
  const [velocity, setVelocity] = useState<number>(0.0); // velocity dx/dt

  // Plot history points for scrolling graph: { t: number, x: number }[]
  const [history, setHistory] = useState<Array<{ t: number; x: number }>>([]);

  // Log runs
  const [loggedRuns, setLoggedRuns] = useState<LoggedDerivRun[]>([]);

  // References for tick loops
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Analytical/numerical properties
  const criticalDampingValue = useMemo(() => {
    return Math.sqrt(4.0 * mass * stiffness);
  }, [mass, stiffness]);

  const dampingCategory = useMemo<DampingState>(() => {
    const diff = damping - criticalDampingValue;
    if (Math.abs(diff) < 0.2) return "critically-damped";
    return damping < criticalDampingValue ? "underdamped" : "overdamped";
  }, [damping, criticalDampingValue]);

  const dampingCategoryText = useMemo(() => {
    switch (dampingCategory) {
      case "critically-damped":
        return "หน่วงวิกฤต (Critical)";
      case "overdamped":
        return "หน่วงเกิน (Overdamped)";
      case "underdamped":
        return "หน่วงน้อย (Underdamped)";
      default:
        return "";
    }
  }, [dampingCategory]);

  // Numerical solver ahead to find exact settling time (where |x| < 0.08 for remainder of 12 seconds)
  const calculatedSettleTime = useMemo(() => {
    // Run numerical integration (Euler or RK4) ahead from t=0, x=4, v=0
    let simX = 4.0;
    let simV = 0.0;
    const dt = 0.01;
    let t = 0.0;
    let settleT = -1;

    // Simulate for 12 seconds
    while (t < 12.0) {
      // Derivatives: dx/dt = v, dv/dt = -c/m * v - k/m * x
      const dx = simV;
      const dv = -(damping / mass) * simV - (stiffness / mass) * simX;

      simX += dx * dt;
      simV += dv * dt;
      t += dt;

      if (Math.abs(simX) > 0.08) {
        settleT = t;
      }
    }

    if (settleT >= 11.9) return "ไม่คืนตัวในช่วงวัด";
    return `${settleT.toFixed(2)} วินาที`;
  }, [mass, stiffness, damping]);

  // Handle Preset switches
  const handleApplyPreset = (type: DampingState) => {
    setIsRunning(false);
    setTime(0.0);
    setXPos(4.0);
    setVelocity(0.0);
    setHistory([]);

    switch (type) {
      case "underdamped":
        setDamping(1.0);
        break;
      case "critically-damped":
        // c = sqrt(4*m*k) = sqrt(4 * 1.5 * 15.0) = sqrt(90) = 9.48
        setDamping(Math.round(Math.sqrt(4.0 * mass * stiffness) * 10) / 10);
        break;
      case "overdamped":
        setDamping(14.5);
        break;
    }
  };

  // Simulation step frame using Euler-Cromer integration (more stable for oscillatory systems)
  const animateStep = (timestamp: number) => {
    if (lastTimeRef.current !== null) {
      const elapsed = (timestamp - lastTimeRef.current) / 1000.0; // delta seconds
      // Cap delta time to prevent massive jumps when switching tabs
      const dt = Math.min(0.05, elapsed);

      // Solve differential equations numerically:
      // dx/dt = v
      // dv/dt = -c/m * v - k/m * x
      // Using Euler-Cromer:
      const accel = -(damping / mass) * velocity - (stiffness / mass) * xPos;
      const nextV = velocity + accel * dt;
      const nextX = xPos + nextV * dt;
      const nextTime = time + dt;

      setTime(nextTime);
      setXPos(nextX);
      setVelocity(nextV);

      // Save history, scrolling past 150 points
      setHistory((prev) => {
        const nextHist = [...prev, { t: nextTime, x: nextX }];
        if (nextHist.length > 150) nextHist.shift();
        return nextHist;
      });
    }

    lastTimeRef.current = timestamp;
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animateStep);
    }
  };

  // Trigger ticker on running switch
  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = null;
      requestRef.current = requestAnimationFrame(animateStep);
    } else {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- RAF loop intentionally uses the current simulation step closure.
  }, [isRunning, xPos, velocity, time, damping, mass, stiffness]);

  const handleAddLog = () => {
    const newLog: LoggedDerivRun = {
      index: loggedRuns.length + 1,
      mass,
      stiffness,
      damping,
      dampingType: dampingCategoryText,
      settleTime: calculatedSettleTime,
    };
    setLoggedRuns((prev) => [...prev, newLog]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const questProgress = useMemo(() => {
    let progress = 0;

    // Condition 1: Achieve a Critically Damped or Overdamped state and run the simulation past 4s to settle
    const isDampedOverLimit = dampingCategory === "critically-damped" || dampingCategory === "overdamped";
    const hasSettlePassed = time >= 4.0 && isDampedOverLimit && Math.abs(xPos) < 0.15;
    if (hasSettlePassed) {
      progress += 50;
    } else if (loggedRuns.some((r) => r.dampingType.includes("Critical") || r.dampingType.includes("Overdamped"))) {
      progress += 50;
    }

    // Condition 2: Log at least 3 distinct states
    if (loggedRuns.length >= 3) {
      progress += 50;
    }

    return progress;
  }, [dampingCategory, time, xPos, loggedRuns]);

  // Copy data logs
  const handleCopyData = () => {
    const rows = loggedRuns.map(
      (r) =>
        `${r.index}\t${r.mass} kg\t${r.stiffness} N/m\t${r.damping} Ns/m\t${r.dampingType}\t${r.settleTime}`
    );
    const header = "ชุดที่\tมวล (m)\tค่าคงตัวสปริง (k)\tสัมประสิทธิ์หน่วง (c)\tสภาพการหน่วง\tเวลาคืนตัวสู่สมดุล\n";
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = loggedRuns.map(
      (r) =>
        `${r.index},${r.mass},${r.stiffness},${r.damping},"${r.dampingType}","${r.settleTime}"`
    );
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Index,Mass,Stiffness,Damping,DampingType,SettleTime", ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "differential_equations_spring_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save/Sync results
  const handleSaveResults = async () => {
    if (loggedRuns.length === 0) {
      alert("กรุณากดบันทึกผลการจำลองอย่างน้อย 1 ครั้งก่อนบันทึกรายงานการทดลอง");
      return;
    }

    const payload = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      mass,
      stiffness,
      damping,
      loggedRuns,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_differential_equations_experiment",
      localPayload: payload,
      labId,
      title: "Differential Equations Lab",
      variables: { mass, stiffness, damping },
      liveValues: { dampingCategory, calculatedSettleTime, questProgress },
      graphPoints: loggedRuns.map((r) => ({
        index: r.index,
        x: r.damping,
        y: parseFloat(r.settleTime) || 0,
      })),
      tableRows: loggedRuns,
      summary: {
        runsCount: loggedRuns.length,
        dampingStatesFound: Array.from(new Set(loggedRuns.map((r) => r.dampingType))).length,
      },
      score: Math.min(100, Math.max(40, 40 + questProgress * 0.6)),
      durationSeconds: null,
    });

  };

  // Build spring coiled path zig-zag
  // Anchored wall at X=35. Mass block starts at X=160.
  // The mass moves by xPos * 15. Real base position is: 160 + xPos * 15.
  // Let's divide space from X=35 to X = 150 + xPos * 15 into zig-zags.
  const springPathPoints = useMemo(() => {
    const startX = 35;
    const endX = 150 + xPos * 14;
    const yCenter = 130;
    const numCoils = 15;
    const dX = (endX - startX) / (numCoils + 1);

    const pts: string[] = [`M ${startX} ${yCenter}`];
    for (let i = 1; i <= numCoils; i++) {
      const x = startX + i * dX;
      // Alternate zig-zag amplitude
      const y = yCenter + (i % 2 === 0 ? 12 : -12);
      pts.push(`L ${x} ${y}`);
    }
    pts.push(`L ${endX} ${yCenter}`);
    return pts.join(" ");
  }, [xPos]);

  // Damper cylinder and piston positions
  const massLeftX = useMemo(() => 150 + xPos * 14, [xPos]);

  // Build graph line path from time history
  // Graph area is: x_min = 280, x_max = 440 (width = 160)
  // y_min = 220 (displacement +4), y_max = 60 (displacement -4). Center y = 140
  const graphLinePoints = useMemo(() => {
    if (history.length === 0) return "";
    // Display last 150 points. Scale: t is mapped relatively to the width
    const minT = history[0].t;
    const maxT = history[history.length - 1].t;
    const diffT = maxT - minT || 1.0;

    return history
      .map((pt) => {
        const svgX = 280 + ((pt.t - minT) / diffT) * 160;
        // displacement x is in [-4, 4], maps to [60, 220] (center 140)
        const svgY = 140 - pt.x * 20;
        return `${svgX},${svgY}`;
      })
      .join(" ");
  }, [history]);

  return (
    <SharedSimulationShell
      accent="cyan"
      labId={labId}
      category="Mathematics"
      title="Differential Equations Lab"
      subtitle="จำลองระบบสมการเชิงอนุพันธ์อันดับสองของมวล-สปริง-ตัวหน่วง (Mass-Spring-Damper) ปรับระดับความต้านทานเพื่อศึกษาอัตราการคืนสมดุล"
      statusLabel={
        isRunning
          ? `กำลังทดลอง (เวลา: ${time.toFixed(1)} วินาที)`
          : `พร้อมเริ่มจำลอง (${dampingCategoryText})`
      }
      icon={Activity}
      sceneTitle="วิชวลแสดงชุดสปริงและกราฟวิเคราะห์คลื่นการคืนสมดุล"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-cyan-150 bg-[linear-gradient(135deg,#f8fbff_0%,#eefcff_48%,#fff7fb_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

          {/* Damping presets switches */}
          <div className="relative z-10 mb-4 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans">
            <button
              onClick={() => handleApplyPreset("underdamped")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                dampingCategory === "underdamped" ? "bg-white text-cyan-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              หน่วงน้อย (Underdamped)
            </button>
            <button
              onClick={() => handleApplyPreset("critically-damped")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                dampingCategory === "critically-damped" ? "bg-white text-cyan-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              หน่วงวิกฤต (Critical)
            </button>
            <button
              onClick={() => handleApplyPreset("overdamped")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                dampingCategory === "overdamped" ? "bg-white text-cyan-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              หน่วงเกิน (Overdamped)
            </button>
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            <svg viewBox="0 0 480 320" className="w-full max-w-[480px] h-auto overflow-visible">
              {/* Ground level line */}
              <line x1="20" y1="165" x2="260" y2="165" stroke="#94a3b8" strokeWidth="2.5" />
              {/* Left anchored wall */}
              <line x1="30" y1="50" x2="30" y2="165" stroke="#64748b" strokeWidth="6" />

              {/* Damper cylinder housing (Top layout parallel to spring) */}
              {/* Cylinder casing */}
              <rect x="30" y="70" width="80" height="12" fill="#94a3b8" rx="2" stroke="#475569" strokeWidth="1" />
              {/* Piston rod going to mass block */}
              <line x1="90" y1="76" x2={massLeftX} y2="76" stroke="#475569" strokeWidth="3" />
              {/* Piston head sliding inside */}
              <rect x={30 + Math.min(72, (massLeftX - 110) * 0.7)} y="71" width="8" height="10" fill="#ec4899" />

              {/* Dynamic spring coiling path */}
              <path d={springPathPoints} fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              {/* Sliding Mass Block (Rounded steel-like look) */}
              <g transform={`translate(${massLeftX}, 90)`}>
                <rect x="0" y="0" width="60" height="60" fill="url(#metalGrad)" rx="6" stroke="#334155" strokeWidth="2" />
                {/* Wheel details */}
                <circle cx="15" cy="65" r="5" fill="#334155" />
                <circle cx="15" cy="65" r="2.5" fill="#94a3b8" />
                <circle cx="45" cy="65" r="5" fill="#334155" />
                <circle cx="45" cy="65" r="2.5" fill="#94a3b8" />
                {/* Weight mass label */}
                <text x="30" y="35" fill="#1e293b" fontSize="10" fontWeight="black" textAnchor="middle">
                  {mass} kg
                </text>
              </g>

              {/* Equilibrium center line label (At xPos = 0, which corresponds to massLeftX = 150) */}
              <line x1="150" y1="50" x2="150" y2="175" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3,3" />
              <text x="150" y="44" fill="#d97706" fontSize="8" fontWeight="bold" textAnchor="middle">
                Equilibrium (x=0)
              </text>

              {/* Real-time Graph Box on the Right side */}
              <rect x="270" y="45" width="180" height="190" fill="#ffffff" rx="10" stroke="#e2e8f0" strokeWidth="1.5" />
              {/* Graph axis coordinates */}
              <line x1="280" y1="140" x2="440" y2="140" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="280" y1="60" x2="280" y2="220" stroke="#cbd5e1" strokeWidth="1" />

              {/* Real-time wave tracking line */}
              {history.length > 1 && (
                <polyline fill="none" stroke="#0891b2" strokeWidth="2" points={graphLinePoints} />
              )}

              {/* Displacement dot at graph tip */}
              {history.length > 0 && (
                <circle
                  cx={280 + 160}
                  cy={140 - xPos * 20}
                  r="4"
                  fill="#06b6d4"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}

              {/* Graph labels */}
              <text x="360" y="248" fill="#64748b" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                เวลา t (วินาที)
              </text>
              <text x="264" y="55" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="end">
                +4
              </text>
              <text x="264" y="225" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="end">
                -4
              </text>
              <text x="260" y="143" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="end">
                x(t)
              </text>

              {/* Definitions definitions for metal box visual gradient */}
              <defs>
                <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      }
      controlsTitle="พารามิเตอร์การหน่วงเชิงสปริง"
      controls={
        <div className="flex flex-col gap-6 font-sans">
          {/* Spring constants variables sliders */}
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-cyan-600" />
              กำหนดตัวแปรสมการเชิงอนุพันธ์
            </h3>
            <div className="flex flex-col gap-4">
              <ManualNumberInput
                label="น้ำหนักมวลวัตถุ m (กิโลกรัม)"
                ariaLabel="น้ำหนักมวลวัตถุ m"
                value={mass}
                min={0.5}
                max={3.0}
                step={0.1}
                onChange={(val) => {
                  setIsRunning(false);
                  setTime(0.0);
                  setXPos(4.0);
                  setVelocity(0.0);
                  setHistory([]);
                  setMass(val);
                }}
                tone="orange"
              />
              <ManualNumberInput
                label="ค่าความแข็งสปริง k (นิวตัน/เมตร)"
                ariaLabel="ค่าความแข็งสปริง k"
                value={stiffness}
                min={5.0}
                max={40.0}
                step={1.0}
                onChange={(val) => {
                  setIsRunning(false);
                  setTime(0.0);
                  setXPos(4.0);
                  setVelocity(0.0);
                  setHistory([]);
                  setStiffness(val);
                }}
                tone="blue"
              />
              <ManualNumberInput
                label="สัมประสิทธิ์การหน่วง c (นิวตัน-วินาที/เมตร)"
                ariaLabel="สัมประสิทธิ์การหน่วง c"
                value={damping}
                min={0.0}
                max={15.0}
                step={0.1}
                onChange={(val) => {
                  setIsRunning(false);
                  setTime(0.0);
                  setXPos(4.0);
                  setVelocity(0.0);
                  setHistory([]);
                  setDamping(val);
                }}
                tone="violet"
              />
            </div>
          </section>

          {/* Settle Time analysis display */}
          <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm text-xs">
            <h4 className="font-black text-slate-800 border-b border-slate-100 pb-1.5">
              การวิเคราะห์เงื่อนไขการหน่วงทางทฤษฎี:
            </h4>
            <div className="space-y-1 text-slate-500 font-semibold">
              <div className="flex justify-between">
                <span>ค่าความหน่วงวิกฤตคํานวณ:</span>
                <span className="font-mono text-cyan-600 font-bold">
                  {criticalDampingValue.toFixed(2)} Ns/m
                </span>
              </div>
              <div className="flex justify-between">
                <span>ประเภทการเคลื่อนที่:</span>
                <span className="font-bold text-slate-700">{dampingCategoryText}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1">
                <span>เวลาคืนตัวสมบูรณ์ทางสถิติ:</span>
                <span className="font-mono font-bold text-emerald-600">{calculatedSettleTime}</span>
              </div>
            </div>
          </section>

          {/* Action trigger triggers buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-white shadow-md transition-all active:scale-98 cursor-pointer ${
                isRunning ? "bg-amber-600 hover:bg-amber-700" : "bg-cyan-600 hover:bg-cyan-700"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" /> Pause การจำลอง
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> เริ่มการทดลองจำลอง
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddLog}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-97 cursor-pointer"
              >
                <ClipboardList className="h-3.5 w-3.5 text-cyan-500" />
                บันทึกจุดวัด
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setTime(0.0);
                  setXPos(4.0);
                  setVelocity(0.0);
                  setHistory([]);
                  setMass(1.5);
                  setStiffness(15.0);
                  setDamping(2.0);
                  setLoggedRuns([]);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2 text-xs font-bold text-rose-700 shadow-sm transition-all hover:bg-rose-50 active:scale-97 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                รีเซ็ตทั้งหมด
              </button>
            </div>
          </div>
        </div>
      }
      metrics={[
        {
          label: "การกระจัด x(t)",
          value: `${xPos.toFixed(3)} m`,
          tone: "blue",
        },
        {
          label: "ความเร็ว dx/dt",
          value: `${velocity.toFixed(3)} m/s`,
          tone: "rose",
        },
        {
          label: "อัตราหน่วง c",
          value: `${damping.toFixed(1)} Ns/m`,
          tone: "violet",
        },
        {
          label: "เวลาหน่วงคืนสมดุล",
          value: calculatedSettleTime,
          tone: "emerald",
        },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-cyan-600" />
              สมการเชิงอนุพันธ์อันดับสอง (2nd Order ODE)
            </h3>
          </div>
          <div className="flex-grow flex flex-col justify-center gap-3 text-xs leading-relaxed text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3 flex flex-col gap-2 border border-slate-150">
              <div>
                <span className="font-bold text-slate-700">สมการการเคลื่อนที่มวล-สปริง:</span>
                <div className="text-center font-mono font-black text-sm text-cyan-600 my-1">
                  m d²x/dt² + c dx/dt + kx = 0
                </div>
                <p className="mt-0.5 text-slate-500">
                  สมการนี้แปลงเป็นระบบสมการเชิงอนุพันธ์อันดับหนึ่งสองสมการเพื่อหาคำตอบเชิงตัวเลข:
                </p>
                <div className="text-center font-mono text-[10px] text-slate-600 my-1 bg-white p-1.5 rounded border border-slate-100">
                  dx/dt = v <br />
                  dv/dt = -(c/m)v - (k/m)x
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              * การหน่วงวิกฤต (Critical damping) เป็นจุดเปลี่ยนผ่านที่ช่วยดูดซับแรงและกลับคืนสู่แนวสมดุลได้ไวสุดโดยไม่เกิดการแกว่งเลย
            </p>
          </div>
        </section>
      }
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">สมการเชิงอนุพันธ์และระบบมวล-สปริง (Differential Equations & Mass-Spring-Damper)</p>
          <p className="mb-3">
            ระบบทางกายภาพที่มีแรงสะสมและแรงต้านทาน มักอธิบายได้ด้วยสมการเชิงอนุพันธ์อันดับสอง:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>การแกว่งแบบมีการหน่วง (Damped Oscillations):</strong>
              การเคลื่อนที่ถูกดึงกลับด้วยแรงสปริง kx และหน่วงการสั่นสะสมด้วยแรงต้านทานตัวหน่วง c (dx/dt)
            </li>
            <li>
              <strong>สภาวะการหน่วงหลักสามรูปแบบ:</strong>
              <ul className="list-decimal pl-5 mt-1 space-y-1 text-slate-500">
                <li><strong>Underdamped (c² &lt; 4mk):</strong> ระบบแกว่งกวัดข้ามจุดสมดุลสลับไปมาก่อนหยุด</li>
                <li><strong>Critically Damped (c² = 4mk):</strong> คืนตัวกลับสู่สมดุลเร็วที่สุดโดยไม่เกิดการแกว่งสลับขั้ว</li>
                <li><strong>Overdamped (c² &gt; 4mk):</strong> คืนตัวช้าๆ เนื่องจากตัวต้านมีความหนืดหนาแน่นมากเกินไป</li>
              </ul>
            </li>
          </ul>
        </div>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                <ClipboardList className="h-4.5 w-4.5 text-cyan-500" />
                ตารางวิเคราะห์ความเร็วคืนตัวสมดุล (Log)
              </h3>
              {loggedRuns.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyData}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Clipboard className="h-3 w-3" />
                    คัดลอกข้อมูล
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Download className="h-3 w-3" />
                    ส่งออก CSV
                  </button>
                </div>
              )}
            </div>

            {loggedRuns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-slate-400">
                <Clipboard className="h-8 w-8 stroke-1 text-slate-300 mb-2" />
                ยังไม่มีข้อมูลที่บันทึกไว้ ปรับค่าการหน่วงและกดปุ่ม &quot;บันทึกจุดวัด&quot; ด้านซ้าย
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-2.5 text-center">ชุดที่</th>
                      <th className="p-2.5">มวล m (kg)</th>
                      <th className="p-2.5">สปริง k (N/m)</th>
                      <th className="p-2.5">หน่วง c (Ns/m)</th>
                      <th className="p-2.5">สภาพการหน่วง</th>
                      <th className="p-2.5 text-right">เวลาคืนสู่สมดุล</th>
                      <th className="p-2.5 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                    {loggedRuns.map((run) => (
                      <tr key={run.index} className="hover:bg-cyan-50/20 transition-colors">
                        <td className="p-2 text-center font-bold">{run.index}</td>
                        <td className="p-2">{run.mass.toFixed(1)}</td>
                        <td className="p-2">{run.stiffness.toFixed(1)}</td>
                        <td className="p-2 font-bold text-cyan-600">{run.damping.toFixed(2)}</td>
                        <td className="p-2 font-sans">{run.dampingType}</td>
                        <td className="p-2 text-right font-bold text-slate-800">{run.settleTime}</td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleClearLog(run.index)}
                            className="rounded p-1 text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      }
      learningGoals={[
        "ทำความเข้าใจสมการเชิงอนุพันธ์สามัญอันดับสอง (2nd Order ODE) ที่ควบคุมระบบพลวัตมวล-สปริง",
        "ศึกษาความแตกต่างระหว่างสภาวะหน่วงน้อย (Underdamped), หน่วงวิกฤต (Critical), และหน่วงเกิน (Overdamped)",
        "วิเคราะห์เวลาคืนสมดุล (Settling Time) ของการเคลื่อนที่เข้าใกล้พิกัดสมดุล (x = 0) ในแต่ละโหมดการหน่วง",
        "ศึกษาและประยุกต์ใช้วิธีคำนวณเชิงตัวเลข (Numerical Methods) ในการถอดสมการอัตราการเปลี่ยนระดับต่อเนื่อง",
      ]}
      steps={[
        { label: "กำหนดค่าคงที่ของระบบ เช่น มวล และค่าสปริง ซึ่งมีผลกับความถี่ธรรมชาติ", icon: Sliders },
        { label: "เลือกสลับรูปแบบ Preset การหน่วงประเภทต่างๆ หรือกำหนดค่า c ด้วยตนเอง", icon: Layers },
        { label: "กดปุ่มเล่น (Play) เพื่อเริ่มการจำลองการคืนสมดุลและวิเคราะห์วิถีกราฟ", icon: Target },
        { label: "บันทึกรายงานสถิติของเวลาคืนตัวเข้าสู่ตารางประวัติสะสมสถิติแล็บ", icon: Clipboard },
      ]}
      progressLabel="ความคืบหน้าการจำลองสปริงหน่วง"
      progressValue={
        questProgress === 100
          ? "บรรลุภารกิจสืบสวนสมการเชิงอนุพันธ์เรียบร้อยแล้ว"
          : questProgress === 50
          ? "วิเคราะห์และเล่นสภาวะวิกฤตหรือหน่วงเกินสำเร็จแล้ว! บันทึกรายงานให้ครบ 3 ครั้ง"
          : "โปรดนำพาการสั่นเข้าหา Critically Damped/Overdamped และเล่นให้สงบตัวสำเร็จ"
      }
      progressPercent={questProgress}
      tips={[
        " สภาวะหน่วงวิกฤต (Critically Damped) จะเกิดขึ้นเมื่อ c = sqrt(4mk) ซึ่งจะหน่วงการสั่นได้ไวที่สุดโดยไม่มีการแกว่ง",
        " ในระบบที่มีการหน่วงน้อย (Underdamped) ระบบจะเคลื่อนที่แกว่งข้ามจุดสมดุลสลับบวกและลบก่อนจะสงบตัว",
        " เมื่อ c หน่วงมากเกินไป (Overdamped) มวลจะลื่นต้วกลับเข้าหา equilibrium ช้ามากๆ เนื่องจากแรงต้านภายในหนาแน่น",
        " ระบบสปริงประเภทนี้ใช้กันอย่างกว้างขวางในโครงสร้างกันสะเทือนของรถยนต์ (Shock Absorbers) เพื่อลดแรงกระแทก",
      ]}
      onSave={handleSaveResults}
    />
  );
}

