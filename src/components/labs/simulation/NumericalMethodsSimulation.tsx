"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sliders,
  RotateCcw,
  Clipboard,
  ClipboardList,
  Download,
  Trash,
  Target,
  Sparkles,
  LineChart,
  Layers,
  Play,
  SkipForward,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

// Available test functions
const FUNCTIONS = [
  {
    label: "x³ − 2x − 5",
    f: (x: number) => x * x * x - 2 * x - 5,
    df: (x: number) => 3 * x * x - 2,
    root: 2.0946,
    xRange: [-1, 4] as [number, number],
    yRange: [-10, 20] as [number, number],
    defaultX0: 3.5,
  },
  {
    label: "x² − 2",
    f: (x: number) => x * x - 2,
    df: (x: number) => 2 * x,
    root: 1.4142,
    xRange: [-1, 3] as [number, number],
    yRange: [-4, 8] as [number, number],
    defaultX0: 2.5,
  },
  {
    label: "cos(x) − x",
    f: (x: number) => Math.cos(x) - x,
    df: (x: number) => -Math.sin(x) - 1,
    root: 0.7391,
    xRange: [-1, 3] as [number, number],
    yRange: [-4, 3] as [number, number],
    defaultX0: 2.0,
  },
] as const;

interface IterationStep {
  n: number;
  xn: number;
  fxn: number;
  dfxn: number;
  xnext: number;
  error: number;
}

interface LoggedRun {
  index: number;
  funcLabel: string;
  x0: number;
  iterations: number;
  finalX: number;
  finalError: number;
  converged: boolean;
}

export default function NumericalMethodsSimulation() {
  const labId = "numerical-methods-lab";

  const [funcIdx, setFuncIdx] = useState(0);
  const [x0, setX0] = useState<number>(FUNCTIONS[0].defaultX0);
  const [steps, setSteps] = useState<IterationStep[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [loggedRuns, setLoggedRuns] = useState<LoggedRun[]>([]);

  const func = FUNCTIONS[funcIdx];
  const maxIter = 15;

  // SVG coordinate mapping
  const svgW = 480, svgH = 320;
  const pad = { l: 55, r: 25, t: 25, b: 40 };
  const plotW = svgW - pad.l - pad.r;
  const plotH = svgH - pad.t - pad.b;
  const [xMin, xMax] = func.xRange;
  const [yMin, yMax] = func.yRange;
  const xToSvg = useCallback((x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * plotW, [pad.l, xMin, xMax, plotW]);
  const yToSvg = useCallback((y: number) => pad.t + ((yMax - y) / (yMax - yMin)) * plotH, [pad.t, yMin, yMax, plotH]);

  // Build curve path
  const curvePath = useMemo(() => {
    const pts: string[] = [];
    const n = 200;
    for (let i = 0; i <= n; i++) {
      const x = xMin + (i / n) * (xMax - xMin);
      const y = func.f(x);
      const cy = Math.max(pad.t - 20, Math.min(svgH + 20, yToSvg(y)));
      pts.push(`${xToSvg(x).toFixed(1)},${cy.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [xToSvg, yToSvg, xMin, xMax, pad.t, func]);

  // Current state
  const currentX = steps.length > 0 ? steps[steps.length - 1].xnext : x0;
  const currentError = steps.length > 0 ? steps[steps.length - 1].error : Math.abs(currentX - func.root);
  const converged = currentError < 1e-6;

  // Single Newton-Raphson step
  const doOneStep = useCallback(() => {
    if (steps.length >= maxIter || converged) return;
    const xn = steps.length === 0 ? x0 : steps[steps.length - 1].xnext;
    const fxn = func.f(xn);
    const dfxn = func.df(xn);
    if (Math.abs(dfxn) < 1e-12) return; // derivative too small
    const xnext = xn - fxn / dfxn;
    const error = Math.abs(xnext - func.root);
    setSteps((prev) => [...prev, {
      n: prev.length + 1,
      xn,
      fxn,
      dfxn,
      xnext,
      error,
    }]);
  }, [steps, x0, func, converged]);

  // Auto-run effect
  useEffect(() => {
    if (!isAutoRunning) return;
    if (steps.length >= maxIter || converged) {
      const timer = window.setTimeout(() => setIsAutoRunning(false), 0);
      return () => window.clearTimeout(timer);
    }
    const timer = setTimeout(doOneStep, 600);
    return () => clearTimeout(timer);
  }, [isAutoRunning, steps, doOneStep, converged]);

  const handleFunctionChange = (nextIndex: number) => {
    setFuncIdx(nextIndex);
    setX0(FUNCTIONS[nextIndex].defaultX0);
    setSteps([]);
    setIsAutoRunning(false);
  };

  // Quest progress
  const questProgress = useMemo(() => {
    let p = 0;
    if (steps.length >= 3) p += 30;
    if (converged) p += 40;
    if (loggedRuns.length >= 1) p += 30;
    return Math.min(100, p);
  }, [steps, converged, loggedRuns]);

  // Handlers
  const handleReset = () => {
    setSteps([]);
    setIsAutoRunning(false);
    setX0(func.defaultX0);
  };

  const handleAddLog = () => {
    const run: LoggedRun = {
      index: loggedRuns.length + 1,
      funcLabel: func.label,
      x0,
      iterations: steps.length,
      finalX: currentX,
      finalError: currentError,
      converged,
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleCopyData = () => {
    const header = "ชุดที่\tฟังก์ชัน\tx₀\tรอบ\tค่าประมาณราก\tError\tลู่เข้า\n";
    const rows = loggedRuns.map(
      (r) => `${r.index}\t${r.funcLabel}\t${r.x0.toFixed(4)}\t${r.iterations}\t${r.finalX.toFixed(8)}\t${r.finalError.toExponential(2)}\t${r.converged ? "ใช่" : "ไม่"}`
    );
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map(
      (r) => `${r.index},${r.funcLabel},${r.x0},${r.iterations},${r.finalX},${r.finalError},${r.converged}`
    );
    const csv = "data:text/csv;charset=utf-8," + ["Index,Function,x0,Iterations,FinalX,Error,Converged", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "numerical_methods_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    if (loggedRuns.length === 0) {
      alert("กรุณากดบันทึกผลอย่างน้อย 1 ครั้งก่อนบันทึกรายงาน");
      return;
    }
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_numerical_methods_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "Numerical Methods Lab",
      variables: { funcIdx, x0 },
      liveValues: { currentX, currentError, converged, iterationCount: steps.length },
      graphPoints: steps.map((s) => ({ index: s.n, x: s.xn, y: s.fxn })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, anyConverged: loggedRuns.some((r) => r.converged) },
      score: Math.min(100, Math.max(40, 40 + questProgress * 0.6)),
      durationSeconds: null,
    });
    alert("บันทึกผลการทดลอง Numerical Methods สำเร็จ");
  };

  // Iteration tangent lines for SVG
  const iterationVisuals = useMemo(() => {
    return steps.map((step, i) => {
      const opacity = 0.3 + 0.7 * ((i + 1) / steps.length);
      const cx = xToSvg(step.xn);
      const cy = yToSvg(step.fxn);
      const cnx = xToSvg(step.xnext);
      const cny = yToSvg(0);
      // Tangent line endpoints for visual
      const tangentX1 = step.xn - 0.8;
      const tangentY1 = step.fxn + step.dfxn * (-0.8);
      const tangentX2 = step.xnext + 0.3;
      const tangentY2 = step.fxn + step.dfxn * (step.xnext - step.xn + 0.3);
      return { step, i, opacity, cx, cy, cnx, cny, tangentX1, tangentY1, tangentX2, tangentY2 };
    });
  }, [steps, xToSvg, yToSvg]);

  // Iteration color palette
  const iterColor = (i: number) => {
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6"];
    return colors[i % colors.length];
  };

  return (
    <SharedSimulationShell
      accent="orange"
      labId={labId}
      category="Mathematics"
      title="Numerical Methods Lab"
      subtitle="สำรวจ Newton-Raphson method ในการหารากสมการ ดู iteration ลู่เข้าหาคำตอบ และวิเคราะห์ error ของแต่ละรอบ"
      statusLabel={
        converged
          ? `ลู่เข้าแล้ว! root ≈ ${currentX.toFixed(6)}`
          : `รอบที่ ${steps.length} | x ≈ ${currentX.toFixed(4)}`
      }
      icon={LineChart}
      sceneTitle="Newton-Raphson Root Finding Visualization"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-orange-100 bg-[linear-gradient(135deg,#fffbf5_0%,#fff7ed_48%,#fefce8_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />

          {/* Function selector tabs */}
          <div className="relative z-10 mb-3 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans">
            {FUNCTIONS.map((fn, idx) => (
              <button
                key={fn.label}
                onClick={() => handleFunctionChange(idx)}
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                  funcIdx === idx ? "bg-white text-orange-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                f(x) = {fn.label}
              </button>
            ))}
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[480px] h-auto overflow-visible">
              <defs>
                <linearGradient id="nmCurveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#c2410c" />
                </linearGradient>
                <filter id="nmGlow">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                </filter>
              </defs>

              {/* Grid lines */}
              {Array.from({ length: 6 }).map((_, i) => {
                const gx = xMin + ((i + 1) / 6) * (xMax - xMin);
                return <line key={`gx${i}`} x1={xToSvg(gx)} y1={pad.t} x2={xToSvg(gx)} y2={svgH - pad.b} stroke="#f1f5f9" strokeWidth="1" />;
              })}
              {Array.from({ length: 5 }).map((_, i) => {
                const gy = yMin + ((i + 1) / 5) * (yMax - yMin);
                return <line key={`gy${i}`} x1={pad.l} y1={yToSvg(gy)} x2={svgW - pad.r} y2={yToSvg(gy)} stroke="#f1f5f9" strokeWidth="1" />;
              })}

              {/* Axes */}
              {yMin <= 0 && yMax >= 0 && (
                <line x1={pad.l} y1={yToSvg(0)} x2={svgW - pad.r} y2={yToSvg(0)} stroke="#94a3b8" strokeWidth="1.2" />
              )}
              {xMin <= 0 && xMax >= 0 && (
                <line x1={xToSvg(0)} y1={pad.t} x2={xToSvg(0)} y2={svgH - pad.b} stroke="#94a3b8" strokeWidth="1.2" />
              )}

              {/* Axis labels */}
              {Array.from({ length: 6 }).map((_, i) => {
                const val = xMin + (i / 5) * (xMax - xMin);
                return (
                  <text key={`xl${i}`} x={xToSvg(val)} y={svgH - pad.b + 16} fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {val.toFixed(1)}
                  </text>
                );
              })}
              {Array.from({ length: 5 }).map((_, i) => {
                const val = yMin + ((i + 1) / 5) * (yMax - yMin);
                return (
                  <text key={`yl${i}`} x={pad.l - 6} y={yToSvg(val) + 3} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">
                    {val.toFixed(0)}
                  </text>
                );
              })}

              {/* Function curve */}
              <polyline fill="none" stroke="url(#nmCurveGrad)" strokeWidth="2.5" strokeLinecap="round" points={curvePath} />

              {/* True root marker */}
              <line x1={xToSvg(func.root)} y1={yToSvg(0) - 8} x2={xToSvg(func.root)} y2={yToSvg(0) + 8} stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
              <text x={xToSvg(func.root)} y={yToSvg(0) + 22} fill="#16a34a" fontSize="8" fontWeight="bold" textAnchor="middle">
                root ≈ {func.root.toFixed(4)}
              </text>

              {/* Iteration tangent lines and points */}
              {iterationVisuals.map(({ step, i, opacity, cx, cy, cnx }) => {
                const color = iterColor(i);
                return (
                  <g key={i} opacity={opacity}>
                    {/* Tangent line from (xn, f(xn)) to (xnext, 0) */}
                    <line
                      x1={cx}
                      y1={cy}
                      x2={cnx}
                      y2={yToSvg(0)}
                      stroke={color}
                      strokeWidth="1.5"
                      strokeDasharray="4,2"
                    />
                    {/* Vertical drop from (xn, 0) to (xn, f(xn)) */}
                    <line
                      x1={cx}
                      y1={yToSvg(0)}
                      x2={cx}
                      y2={cy}
                      stroke={color}
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      opacity="0.5"
                    />
                    {/* Point on curve */}
                    <circle cx={cx} cy={cy} r="4" fill={color} stroke="#fff" strokeWidth="1.5" />
                    {/* Iteration number label */}
                    <text x={cx} y={cy - 8} fill={color} fontSize="8" fontWeight="bold" textAnchor="middle">
                      x{step.n}
                    </text>
                  </g>
                );
              })}

              {/* Current probe position (x0 or latest xnext) */}
              <circle
                cx={xToSvg(currentX)}
                cy={yToSvg(0)}
                r="6"
                fill={converged ? "#16a34a" : "#3b82f6"}
                stroke="#fff"
                strokeWidth="2"
              >
                {!converged && (
                  <animate attributeName="r" values="5;7;5" dur="1.5s" repeatCount="indefinite" />
                )}
              </circle>

              {/* Error bar visualization */}
              {steps.length > 0 && !converged && (
                <g>
                  <line
                    x1={xToSvg(currentX)}
                    y1={yToSvg(0) + 26}
                    x2={xToSvg(func.root)}
                    y2={yToSvg(0) + 26}
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <text
                    x={(xToSvg(currentX) + xToSvg(func.root)) / 2}
                    y={yToSvg(0) + 38}
                    fill="#ef4444"
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    error = {currentError.toExponential(2)}
                  </text>
                </g>
              )}

              {/* Convergence celebration */}
              {converged && (
                <g>
                  <circle cx={xToSvg(func.root)} cy={yToSvg(0)} r="12" fill="none" stroke="#16a34a" strokeWidth="2" opacity="0.4">
                    <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x={xToSvg(func.root)} y={yToSvg(0) - 16} fill="#16a34a" fontSize="10" fontWeight="900" textAnchor="middle">
                    ✓ Converged
                  </text>
                </g>
              )}

              {/* Axis titles */}
              <text x={svgW / 2} y={svgH - 4} fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">x</text>
              <text x={14} y={svgH / 2} fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle" transform={`rotate(-90,14,${svgH / 2})`}>f(x)</text>
            </svg>
          </div>

          {/* Iteration steps mini-display */}
          {steps.length > 0 && (
            <div className="relative z-10 mt-2 flex gap-1.5 overflow-x-auto pb-1">
              {steps.slice(-6).map((step) => (
                <div
                  key={step.n}
                  className="shrink-0 rounded-lg border border-slate-200/80 bg-white/80 backdrop-blur-sm px-2 py-1 text-[9px] font-bold text-slate-600"
                >
                  <span style={{ color: iterColor(step.n - 1) }}>n={step.n}</span>{" "}
                  x={step.xnext.toFixed(4)}
                </div>
              ))}
            </div>
          )}
        </div>
      }
      controlsTitle="ปรับแต่งพารามิเตอร์ Newton-Raphson"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-orange-500" />
              ตั้งค่าเริ่มต้น
            </h3>
            <ManualNumberInput
              label="ค่าเริ่มต้น x₀"
              ariaLabel="ค่าเริ่มต้น x₀"
              value={x0}
              min={func.xRange[0]}
              max={func.xRange[1]}
              step={0.1}
              onChange={(v) => { setX0(v); setSteps([]); setIsAutoRunning(false); }}
              tone="orange"
            />
          </section>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={doOneStep}
              disabled={converged || steps.length >= maxIter}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-97 cursor-pointer disabled:opacity-40"
            >
              <SkipForward className="h-3.5 w-3.5 text-orange-500" />
              Step ถัดไป
            </button>
            <button
              onClick={() => setIsAutoRunning(!isAutoRunning)}
              disabled={converged || steps.length >= maxIter}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold shadow-sm transition-all active:scale-97 cursor-pointer disabled:opacity-40 ${
                isAutoRunning ? "border-rose-200 bg-rose-50 text-rose-700" : "border-orange-200 bg-orange-50 text-orange-700"
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              {isAutoRunning ? "หยุด" : "Auto-iterate"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-97 cursor-pointer"
            >
              <ClipboardList className="h-3.5 w-3.5 text-orange-500" />
              บันทึกจุดวัด
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2.5 text-xs font-bold text-rose-700 shadow-sm transition-all hover:bg-rose-50 active:scale-97 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              รีเซ็ตทั้งหมด
            </button>
          </div>
        </div>
      }
      compactControls={
        <div className="flex items-center gap-2 font-sans">
          <button
            onClick={doOneStep}
            disabled={converged || steps.length >= maxIter}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40"
          >
            <SkipForward className="h-3.5 w-3.5 text-orange-500" />
            Step
          </button>
          <button
            onClick={() => setIsAutoRunning(!isAutoRunning)}
            disabled={converged || steps.length >= maxIter}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold shadow-sm disabled:opacity-40 ${
              isAutoRunning ? "border-rose-200 bg-rose-50 text-rose-700" : "border-orange-200 bg-orange-50 text-orange-700"
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            {isAutoRunning ? "หยุด" : "Auto"}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            รีเซ็ต
          </button>
        </div>
      }
      metrics={[
        { label: "ค่าประมาณราก xₙ", value: currentX.toFixed(6), tone: "orange" },
        { label: "ค่า f(xₙ)", value: func.f(currentX).toExponential(2), tone: "rose" },
        { label: "จำนวนรอบ", value: `${steps.length} / ${maxIter}`, tone: "cyan" },
        { label: "Error", value: currentError < 1e-10 ? "≈ 0" : currentError.toExponential(2), tone: "emerald" },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-orange-600" />
              กราฟ Error Convergence
            </h3>
          </div>
          <div className="flex-grow flex items-center justify-center">
            {steps.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold">กดปุ่ม Step หรือ Auto เพื่อเริ่ม iteration</p>
            ) : (
              <svg viewBox="0 0 400 200" className="w-full max-w-[400px] h-auto">
                {/* Error convergence chart */}
                <line x1="40" y1="170" x2="380" y2="170" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="40" y1="20" x2="40" y2="170" stroke="#e2e8f0" strokeWidth="1" />
                <text x="210" y="195" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">รอบ Iteration (n)</text>
                <text x="12" y="95" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle" transform="rotate(-90,12,95)">log₁₀(error)</text>
                {steps.map((s, i) => {
                  const barW = Math.min(30, 320 / steps.length);
                  const logErr = Math.log10(Math.max(s.error, 1e-16));
                  const maxLog = Math.log10(Math.max(steps[0].error, 1));
                  const minLog = -12;
                  const barH = Math.max(2, ((logErr - minLog) / (maxLog - minLog)) * 140);
                  const bx = 50 + i * (barW + 4);
                  return (
                    <g key={i}>
                      <rect
                        x={bx}
                        y={170 - barH}
                        width={barW}
                        height={barH}
                        rx="3"
                        fill={iterColor(i)}
                        opacity="0.8"
                      />
                      <text x={bx + barW / 2} y={183} fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">
                        {s.n}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </section>
      }
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">วิธี Newton-Raphson (Newton&apos;s Method)</p>
          <p className="mb-3">
            เป็นวิธีเชิงตัวเลขสำหรับหาค่ารากสมการ f(x) = 0 โดยเริ่มจากค่าประมาณเริ่มต้น x₀
            แล้วปรับค่าให้เข้าใกล้รากมากขึ้นในแต่ละรอบ
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>สูตรวนซ้ำ:</strong> x_{'{n+1}'} = xₙ − f(xₙ) / f&apos;(xₙ) คือเส้นสัมผัส (tangent line) ที่จุด xₙ ตัดแกน x ที่จุด x_{'{n+1}'}
            </li>
            <li>
              <strong>อัตราลู่เข้า:</strong> โดยปกติวิธีนี้ลู่เข้าแบบ quadratic หมายถึง error จะลดลงเป็นกำลังสองของรอบก่อนหน้า
            </li>
            <li>
              <strong>ข้อจำกัด:</strong> หาก f&apos;(xₙ) ≈ 0 หรือค่าเริ่มต้นไกลจากรากมาก วิธีอาจไม่ลู่เข้า
            </li>
          </ul>
        </div>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                <ClipboardList className="h-4.5 w-4.5 text-orange-500" />
                ตารางบันทึกผลการทดลอง
              </h3>
              {loggedRuns.length > 0 && (
                <div className="flex items-center gap-2">
                  <button onClick={handleCopyData} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-slate-50">
                    <Clipboard className="h-3 w-3" /> คัดลอก
                  </button>
                  <button onClick={handleExportCSV} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-slate-50">
                    <Download className="h-3 w-3" /> CSV
                  </button>
                </div>
              )}
            </div>
            {loggedRuns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-slate-400">
                <Clipboard className="h-8 w-8 stroke-1 text-slate-300 mb-2" />
                ยังไม่มีการบันทึก กดปุ่ม &quot;บันทึกจุดวัด&quot;
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-2.5 text-center">ชุด</th>
                      <th className="p-2.5">ฟังก์ชัน</th>
                      <th className="p-2.5">x₀</th>
                      <th className="p-2.5">รอบ</th>
                      <th className="p-2.5">ค่าประมาณราก</th>
                      <th className="p-2.5">Error</th>
                      <th className="p-2.5 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                    {loggedRuns.map((run) => (
                      <tr key={run.index} className="hover:bg-orange-50/20 transition-colors">
                        <td className="p-2 text-center font-bold">{run.index}</td>
                        <td className="p-2 font-sans">{run.funcLabel}</td>
                        <td className="p-2">{run.x0.toFixed(2)}</td>
                        <td className="p-2">{run.iterations}</td>
                        <td className="p-2 font-bold text-slate-800">{run.finalX.toFixed(8)}</td>
                        <td className="p-2">{run.finalError.toExponential(2)}</td>
                        <td className="p-2 text-center">
                          <button onClick={() => handleClearLog(run.index)} className="rounded p-1 text-rose-500 hover:bg-rose-50 transition-colors">
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
        "เข้าใจหลักการทำงานของ Newton-Raphson method ในการหารากสมการ",
        "สังเกตอัตราการลู่เข้า (convergence rate) แบบ quadratic ของวิธีเชิงตัวเลข",
        "ทดลองเปลี่ยนค่าเริ่มต้นเพื่อเรียนรู้ว่า initial guess มีผลต่อ convergence",
        "วิเคราะห์ error ของแต่ละ iteration เพื่อเข้าใจเงื่อนไขการหยุดคำนวณ",
      ]}
      steps={[
        { label: "เลือกฟังก์ชันที่ต้องการหาราก", icon: Layers },
        { label: "ปรับค่าเริ่มต้น x₀ ให้อยู่ใกล้รากที่ต้องการ", icon: Sliders },
        { label: "กด Step เพื่อดูแต่ละรอบ หรือ Auto เพื่อรันต่อเนื่อง", icon: Play },
        { label: "สังเกตเส้น tangent ที่วาดจากจุดบนกราฟลงตัดแกน x", icon: Target },
      ]}
      progressLabel="ความคืบหน้า Numerical Methods"
      progressValue={
        questProgress === 100
          ? "บรรลุภารกิจ Newton-Raphson แล้ว"
          : questProgress >= 50
          ? "กำลังดำเนินการ..."
          : "ยังไม่เริ่มภารกิจ"
      }
      progressPercent={questProgress}
      tips={[
        "ลองเปลี่ยนฟังก์ชันระหว่าง x³−2x−5, x²−2 และ cos(x)−x เพื่อเปรียบเทียบจำนวนรอบที่ต้องใช้",
        "สังเกตว่า error ลดลงเร็วมากเมื่อ iteration เข้าใกล้ราก (quadratic convergence)",
        "หากตั้ง x₀ ใกล้จุดที่ f'(x) = 0 (inflection) วิธีอาจไม่ลู่เข้า",
        "เส้นสัมผัส tangent line จะชันมากเมื่อ f'(x) มีค่ามาก ทำให้กระโดดเยอะ",
      ]}
      onSave={handleSaveResults}
    />
  );
}
