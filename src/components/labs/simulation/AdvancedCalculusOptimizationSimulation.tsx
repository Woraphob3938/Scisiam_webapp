"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedOptimizationRun {
  index: number;
  mode: "derivative" | "integral";
  probeX: number;
  derivativeValue: number;
  integralBounds: string;
  integralValue: number;
}

export default function AdvancedCalculusOptimizationSimulation() {
  const labId = "advanced-calculus-optimization";

  // Tab mode state: "derivative" or "integral"
  const [activeTab, setActiveTab] = useState<"derivative" | "integral">("derivative");

  // Derivative probe state
  const [probeX, setProbeX] = useState<number>(0.0);

  // Integration bounds state
  const [limitA, setLimitA] = useState<number>(0.0);
  const [limitB, setLimitB] = useState<number>(3.0);

  // History state
  const [loggedRuns, setLoggedRuns] = useState<LoggedOptimizationRun[]>([]);

  // Function: f(x) = (x^3)/3 - 2x^2 + 3x + 2
  const f = (x: number): number => {
    return (x * x * x) / 3.0 - 2.0 * x * x + 3.0 * x + 2.0;
  };

  // Derivative: f'(x) = x^2 - 4x + 3
  const df = (x: number): number => {
    return x * x - 4.0 * x + 3.0;
  };

  // Integral primitive: F(x) = (x^4)/12 - (2x^3)/3 + (3x^2)/2 + 2x
  const F = (x: number): number => {
    return (x * x * x * x) / 12.0 - (2.0 * x * x * x) / 3.0 + (3.0 * x * x) / 2.0 + 2.0 * x;
  };

  // Calculate coordinates and values
  const yVal = useMemo(() => f(probeX), [probeX]);
  const slope = useMemo(() => df(probeX), [probeX]);

  const definiteIntegral = useMemo(() => {
    return F(limitB) - F(limitA);
  }, [limitA, limitB]);

  // Coordinate mapping for SVG grid: viewbox is 0 to 480 (width), 0 to 320 (height)
  // X range: [-1, 5] -> maps to [50, 430] (width = 380, scaling = 380 / 6 = 63.33 per unit)
  // Y range: [-1, 5] -> maps to [270, 30] (height = 240, scaling = 240 / 6 = 40 per unit)
  const xToSvg = (x: number) => 50 + (x - (-1.0)) * 63.33;
  const yToSvg = (y: number) => 270 - (y - (-1.0)) * 40;

  // Build points path for curve
  const curvePointsStr = useMemo(() => {
    const steps = 100;
    const points: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = -1.0 + (i / steps) * 6.0; // from -1 to 5
      points.push(`${xToSvg(x)},${yToSvg(f(x))}`);
    }
    return points.join(" ");
  }, []);

  // Build shaded polygon points path for definite integral region
  const integralShadingPath = useMemo(() => {
    if (activeTab !== "integral") return "";
    const steps = 50;
    const pathPoints: string[] = [];

    // Bottom-left corner
    pathPoints.push(`${xToSvg(limitA)},${yToSvg(0)}`);

    // Top boundary following the curve
    for (let i = 0; i <= steps; i++) {
      const x = limitA + (i / steps) * (limitB - limitA);
      pathPoints.push(`${xToSvg(x)},${yToSvg(f(x))}`);
    }

    // Bottom-right corner
    pathPoints.push(`${xToSvg(limitB)},${yToSvg(0)}`);

    return pathPoints.join(" ");
  }, [limitA, limitB, activeTab]);

  // Handle snapping probe to critical point
  const handleSnapToCritical = (x: number) => {
    setProbeX(x);
  };

  const handleAddLog = () => {
    const newLog: LoggedOptimizationRun = {
      index: loggedRuns.length + 1,
      mode: activeTab,
      probeX: activeTab === "derivative" ? probeX : 0,
      derivativeValue: activeTab === "derivative" ? slope : 0,
      integralBounds: activeTab === "integral" ? `[${limitA.toFixed(1)}, ${limitB.toFixed(1)}]` : "-",
      integralValue: activeTab === "integral" ? definiteIntegral : 0,
    };
    setLoggedRuns((prev) => [...prev, newLog]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const questProgress = useMemo(() => {
    let progress = 0;

    // Check critical point snap condition (f'(x) near 0 at x = 1.0 or x = 3.0)
    const isAtCriticalMax = Math.abs(probeX - 1.0) < 0.05;
    const isAtCriticalMin = Math.abs(probeX - 3.0) < 0.05;
    if (activeTab === "derivative" && (isAtCriticalMax || isAtCriticalMin)) {
      progress += 50;
    } else if (loggedRuns.some((r) => r.mode === "derivative" && Math.abs(r.derivativeValue) < 0.05)) {
      progress += 50;
    }

    // Check specific integration range condition (e.g. limit A = 0.0, limit B = 3.0)
    const isTargetIntegral = Math.abs(limitA - 0.0) < 0.05 && Math.abs(limitB - 3.0) < 0.05;
    if (activeTab === "integral" && isTargetIntegral) {
      progress += 50;
    } else if (loggedRuns.some((r) => r.mode === "integral" && r.integralBounds === "[0.0, 3.0]")) {
      progress += 50;
    }

    return progress;
  }, [probeX, limitA, limitB, activeTab, loggedRuns]);

  // Clipboard copies
  const handleCopyData = () => {
    const rows = loggedRuns.map(
      (r) =>
        `${r.index}\t${r.mode === "derivative" ? "อนุพันธ์" : "อินทิกรัล"}\t${
          r.mode === "derivative" ? r.probeX.toFixed(2) : "-"
        }\t${r.mode === "derivative" ? r.derivativeValue.toFixed(4) : "-"}\t${r.integralBounds}\t${r.integralValue.toFixed(4)}`
    );
    const header = "ชุดที่\tโหมด\tพิกัด x (Probe)\tความชันสัมผัส (f')\tช่วงอินทิกรัล\tพื้นที่ใต้กราฟ\n";
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = loggedRuns.map(
      (r) =>
        `${r.index},${r.mode === "derivative" ? "Derivative" : "Integral"},${r.probeX.toFixed(4)},${
          r.derivativeValue.toFixed(4)
        },${r.integralBounds},${r.integralValue.toFixed(4)}`
    );
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Index,Mode,ProbeX,Slope,Bounds,Area", ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "advanced_calculus_optimization_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sync to database
  const handleSaveResults = async () => {
    if (loggedRuns.length === 0) {
      alert("กรุณากดบันทึกผลการจำลองอย่างน้อย 1 ครั้งก่อนบันทึกรายงานการทดลอง");
      return;
    }

    const experimentPayload = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      probeX,
      limitA,
      limitB,
      loggedRuns,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_advanced_calculus_experiment",
      localPayload: experimentPayload,
      labId,
      title: "Advanced Calculus & Optimization",
      variables: { probeX, limitA, limitB },
      liveValues: { slope, definiteIntegral, questProgress },
      graphPoints: loggedRuns.map((r) => ({
        index: r.index,
        x: r.probeX,
        y: r.mode === "derivative" ? r.derivativeValue : r.integralValue,
      })),
      tableRows: loggedRuns,
      summary: {
        runsCount: loggedRuns.length,
        hasReachedOptima: loggedRuns.some((r) => r.mode === "derivative" && Math.abs(r.derivativeValue) < 0.05),
      },
      score: Math.min(100, Math.max(40, 40 + questProgress * 0.6)),
      durationSeconds: null,
    });

    alert("บันทึกผลการทดลองวิเคราะห์แคลคูลัสขั้นสูงสำเร็จ");
  };

  return (
    <SharedSimulationShell
      accent="violet"
      labId={labId}
      category="Mathematics"
      title="Advanced Calculus & Optimization"
      subtitle="สำรวจแนวคิดอนุพันธ์ในการหาจุดวิกฤตของฟังก์ชัน และอินทิกรัลจำกัดเขตในการหาพื้นที่สะสม"
      statusLabel={
        activeTab === "derivative"
          ? `ความชันสโลป f'(x) = ${slope.toFixed(2)}`
          : `พื้นที่สะสมด้านล่าง = ${definiteIntegral.toFixed(3)}`
      }
      icon={LineChart}
      sceneTitle="วิชวลแสดงผลกราฟจำลองแคลคูลัสแบบโต้ตอบ"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-violet-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eefcff_48%,#fff7fb_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

          {/* Mode tab switch */}
          <div className="relative z-10 mb-4 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans">
            <button
              onClick={() => setActiveTab("derivative")}
              className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                activeTab === "derivative" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              อนุพันธ์และจุดวิกฤต (Derivative)
            </button>
            <button
              onClick={() => setActiveTab("integral")}
              className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                activeTab === "integral" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              อินทิกรัลจำกัดเขต (Integral)
            </button>
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            <svg viewBox="0 0 480 320" className="w-full max-w-[480px] h-auto overflow-visible">
              {/* Horizontal & Vertical grid axes lines */}
              <line x1="50" y1="270" x2="430" y2="270" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="50" y1="270" x2="50" y2="30" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
              <line x1={xToSvg(0)} y1="30" x2={xToSvg(0)} y2="270" stroke="#94a3b8" strokeWidth="1.2" />
              <line x1="50" y1={yToSvg(0)} x2="430" y2={yToSvg(0)} stroke="#94a3b8" strokeWidth="1.2" />

              {/* Shaded Area for Definite Integral */}
              {activeTab === "integral" && limitA < limitB && (
                <polygon
                  points={integralShadingPath}
                  fill="url(#integralGrad)"
                  stroke="#8b5cf6"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                  opacity="0.65"
                />
              )}

              {/* Curve path representation */}
              <polyline
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2.5"
                points={curvePointsStr}
              />

              {/* Local Max and Min highlights */}
              <circle cx={xToSvg(1.0)} cy={yToSvg(f(1.0))} r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              <text x={xToSvg(1.0)} y={yToSvg(f(1.0)) - 10} fill="#d97706" fontSize="9" fontWeight="bold" textAnchor="middle">
                Max (1, 3.33)
              </text>

              <circle cx={xToSvg(3.0)} cy={yToSvg(f(3.0))} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <text x={xToSvg(3.0)} y={yToSvg(f(3.0)) + 18} fill="#059669" fontSize="9" fontWeight="bold" textAnchor="middle">
                Min (3, 2.00)
              </text>

              {/* Interactive elements depending on active Tab */}
              {activeTab === "derivative" ? (
                <>
                  {/* Tangent line at probeX */}
                  {/* Tangent equation: Y_tan = f'(probeX) * (X - probeX) + f(probeX) */}
                  <line
                    x1={xToSvg(probeX - 1.2)}
                    y1={yToSvg(slope * -1.2 + yVal)}
                    x2={xToSvg(probeX + 1.2)}
                    y2={yToSvg(slope * 1.2 + yVal)}
                    stroke="#ec4899"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />
                  {/* Probe point on curve */}
                  <circle
                    cx={xToSvg(probeX)}
                    cy={yToSvg(yVal)}
                    r="6.5"
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="shadow-sm"
                  />
                  <line x1={xToSvg(probeX)} y1="270" x2={xToSvg(probeX)} y2={yToSvg(yVal)} stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="50" y1={yToSvg(yVal)} x2={xToSvg(probeX)} y2={yToSvg(yVal)} stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
                </>
              ) : (
                <>
                  {/* Integration limit bars */}
                  <line x1={xToSvg(limitA)} y1="270" x2={xToSvg(limitA)} y2={yToSvg(f(limitA))} stroke="#4f46e5" strokeWidth="1.5" />
                  <circle cx={xToSvg(limitA)} cy={yToSvg(f(limitA))} r="4" fill="#4f46e5" />
                  <text x={xToSvg(limitA)} y="285" fill="#4f46e5" fontSize="8.5" fontWeight="black" textAnchor="middle">
                    a={limitA.toFixed(1)}
                  </text>

                  <line x1={xToSvg(limitB)} y1="270" x2={xToSvg(limitB)} y2={yToSvg(f(limitB))} stroke="#ec4899" strokeWidth="1.5" />
                  <circle cx={xToSvg(limitB)} cy={yToSvg(f(limitB))} r="4" fill="#ec4899" />
                  <text x={xToSvg(limitB)} y="285" fill="#ec4899" fontSize="8.5" fontWeight="black" textAnchor="middle">
                    b={limitB.toFixed(1)}
                  </text>
                </>
              )}

              {/* Axis scale ticks */}
              {Array.from({ length: 7 }).map((_, idx) => {
                const val = -1.0 + idx;
                return (
                  <g key={val}>
                    <text x={xToSvg(val)} y="295" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
                      {val}
                    </text>
                    <text x="42" y={yToSvg(val) + 3} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Variable labels */}
              <text x="425" y="258" fill="#64748b" fontSize="9" fontWeight="bold">
                x
              </text>
              <text x="56" y="44" fill="#64748b" fontSize="9" fontWeight="bold">
                y = f(x)
              </text>

              {/* Definitions definitions for gradients */}
              <defs>
                <linearGradient id="integralGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.15" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      }
      controlsTitle="ปรับแต่งช่วงและพารามิเตอร์"
      controls={
        <div className="flex flex-col gap-6 font-sans">
          {activeTab === "derivative" ? (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Sliders className="h-4.5 w-4.5 text-violet-500" />
                จุดทดสอบตัวแปร (x probe)
              </h3>
              <div className="flex flex-col gap-3">
                <ManualNumberInput
                  label="พิกัดตำแหน่งทดลอง x"
                  ariaLabel="พิกัดตำแหน่งทดลอง x"
                  value={probeX}
                  min={-1.0}
                  max={5.0}
                  step={0.05}
                  onChange={setProbeX}
                  tone="violet"
                />

                {/* Critical points list snapping */}
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs font-bold text-slate-500">ทางลัดจุดวิกฤต (f&apos;(x) = 0):</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSnapToCritical(1.0)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2 transition-all cursor-pointer ${
                        Math.abs(probeX - 1.0) < 0.05
                          ? "border-violet-300 bg-violet-50 text-violet-700 font-bold"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span className="text-[10px] text-amber-600 font-bold">Local Max</span>
                      <span className="text-xs font-mono">x = 1.0</span>
                    </button>
                    <button
                      onClick={() => handleSnapToCritical(3.0)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2 transition-all cursor-pointer ${
                        Math.abs(probeX - 3.0) < 0.05
                          ? "border-violet-300 bg-violet-50 text-violet-700 font-bold"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span className="text-[10px] text-emerald-600 font-bold">Local Min</span>
                      <span className="text-xs font-mono">x = 3.0</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Sliders className="h-4.5 w-4.5 text-violet-500" />
                กำหนดขอบเขตการอินทิเกรต [a, b]
              </h3>
              <div className="flex flex-col gap-4">
                <ManualNumberInput
                  label="ขอบเขตล่าง (a)"
                  ariaLabel="ขอบเขตล่าง (a)"
                  value={limitA}
                  min={-1.0}
                  max={limitB}
                  step={0.1}
                  onChange={setLimitA}
                  tone="pink"
                />
                <ManualNumberInput
                  label="ขอบเขตบน (b)"
                  ariaLabel="ขอบเขตบน (b)"
                  value={limitB}
                  min={limitA}
                  max={5.0}
                  step={0.1}
                  onChange={setLimitB}
                  tone="blue"
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => {
                      setLimitA(0.0);
                      setLimitB(3.0);
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    ตั้งค่าช่วง [0.0, 3.0]
                  </button>
                  <button
                    onClick={() => {
                      setLimitA(1.0);
                      setLimitB(4.0);
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    ตั้งค่าช่วง [1.0, 4.0]
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Record buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-97 cursor-pointer"
            >
              <ClipboardList className="h-3.5 w-3.5 text-violet-500" />
              บันทึกจุดวัด
            </button>
            <button
              onClick={() => {
                setProbeX(0);
                setLimitA(0);
                setLimitB(3);
                setLoggedRuns([]);
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2.5 text-xs font-bold text-rose-700 shadow-sm transition-all hover:bg-rose-50 active:scale-97 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              รีเซ็ตทั้งหมด
            </button>
          </div>
        </div>
      }
      metrics={[
        {
          label: "ค่าฟังก์ชัน f(x)",
          value: yVal.toFixed(3),
          tone: "violet",
        },
        {
          label: "ความชันสัมผัส f'(x)",
          value: slope.toFixed(3),
          tone: "rose",
        },
        {
          label: "ขอบเขตช่วงอินทิกรัล",
          value: `[${limitA.toFixed(1)}, ${limitB.toFixed(1)}]`,
          tone: "cyan",
        },
        {
          label: "พื้นที่อินทิกรัลใต้กราฟ",
          value: definiteIntegral.toFixed(3),
          tone: "emerald",
        },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-violet-600" />
              สรุปทฤษฎีบทการหาค่าเหมาะที่สุด (Calculus Theorem)
            </h3>
          </div>
          <div className="flex-grow flex flex-col justify-center gap-3 text-xs leading-relaxed text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3 flex flex-col gap-2 border border-slate-150">
              <div>
                <span className="font-bold text-slate-700">จุดวิกฤตของฟังก์ชัน (Critical Points):</span>
                <p className="mt-0.5 text-slate-500 font-bold">
                  คือ จุดที่อนุพันธ์อันดับหนึ่ง $f&apos;(x) = 0$ ซึ่งในแล็บนี้พบที่ $x = 1.0$ (ค่าสูงสุดสัมพัทธ์) และ $x = 3.0$ (ค่าต่ำสุดสัมพัทธ์)
                </p>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-700">ทฤษฎีบทหลักมูลของแคลคูลัส (Fundamental Theorem):</span>
                <p className="mt-0.5 text-slate-500 font-bold">
                  ช่วยคำนวณหาพื้นที่สะสมใต้กราฟตั้งแต่ $a$ ถึง $b$ ผ่านฟังก์ชันปฏิยานุพันธ์ $\int_a^b f(x)dx = F(b) - F(a)$
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              * สังเกตความแตกต่างเมื่อสับเปลี่ยนระหว่างโหมดหาอนุพันธ์ (Tangent) และโหมดหาอินทิกรัล (Area)
            </p>
          </div>
        </section>
      }
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">แคลคูลัสขั้นสูงและการหาค่าที่เหมาะสมที่สุด (Advanced Calculus & Optimization)</p>
          <p className="mb-3">
            การศึกษาแคลคูลัสและกระบวนการ Optimization ประกอบด้วยสองเสาหลักหลัก:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>อนุพันธ์และการหาจุดสุดขีด (Derivatives & Extrema):</strong>
              การวิเคราะห์พฤติกรรมฟังก์ชันโดยดูอัตราการเปลี่ยนแปลงเฉพาะจุด $f&apos;(x)$ ที่จุดสูงสุดหรือต่ำสุดสัมพัทธ์ เส้นสัมผัสกราฟจะขนานกับแกนนอนพอดี ทำให้ค่าความชัน $f&apos;(x) = 0$ ซึ่งเรียกว่าจุดวิกฤต (Critical Points)
            </li>
            <li>
              <strong>อินทิกรัลและพื้นที่ใต้กราฟ (Integrals & Area):</strong>
              การอินทิเกรตจำกัดเขตเป็นการสะสมค่าของฟังก์ชันในช่วงที่กำหนด ช่วยระบุพื้นที่สะสมใต้เส้นโค้งจำลองตามทฤษฎีหลักมูลของแคลคูลัส
            </li>
          </ul>
        </div>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                <ClipboardList className="h-4.5 w-4.5 text-violet-500" />
                ตารางบันทึกรายงานผลการทดลอง (Experiment Log)
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
                ยังไม่มีการบันทึกข้อมูลการทดลอง กดปุ่ม &quot;บันทึกจุดวัด&quot; ด้านซ้าย
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-2.5 text-center">ชุดที่</th>
                      <th className="p-2.5">โหมดทดลอง</th>
                      <th className="p-2.5">ค่า x (Probe)</th>
                      <th className="p-2.5">ความชันสัมผัส (f&apos;)</th>
                      <th className="p-2.5">ช่วงอินทิกรัล</th>
                      <th className="p-2.5 text-right">พื้นที่ใต้กราฟ</th>
                      <th className="p-2.5 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                    {loggedRuns.map((run) => (
                      <tr key={run.index} className="hover:bg-violet-50/20 transition-colors">
                        <td className="p-2 text-center font-bold">{run.index}</td>
                        <td className="p-2 font-sans text-slate-800">
                          {run.mode === "derivative" ? (
                            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                              Derivative
                            </span>
                          ) : (
                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                              Integral
                            </span>
                          )}
                        </td>
                        <td className="p-2">{run.mode === "derivative" ? run.probeX.toFixed(2) : "-"}</td>
                        <td className="p-2">{run.mode === "derivative" ? run.derivativeValue.toFixed(4) : "-"}</td>
                        <td className="p-2">{run.integralBounds}</td>
                        <td className="p-2 text-right font-bold text-slate-800">
                          {run.mode === "integral" ? run.integralValue.toFixed(4) : "-"}
                        </td>
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
        "เรียนรู้ความสัมพันธ์ของอนุพันธ์อันดับหนึ่งในการระบุและค้นหาค่าสูงสุด/ต่ำสุดสัมพัทธ์ของกราฟโค้ง",
        "ทำความเข้าใจวิธีหาค่าจุดวิกฤต (Critical Points) ของฟังก์ชันตามทฤษฎีบทบทวิเคราะห์แคลคูลัส",
        "ศึกษาแนวคิดอินทิเกรตจำกัดเขต (Definite Integration) ในการวิเคราะห์พื้นที่ใต้เส้นกราฟ",
        "ประยุกต์ทฤษฎีแคลคูลัสเพื่อแก้โจทย์ปัญหาหาค่าที่เหมาะสมที่สุด (Optimization) ในวิทยาศาสตร์",
      ]}
      steps={[
        { label: "เลือกสลับระหว่างแท็บอนุพันธ์และแท็บอินทิกรัลจำกัดเขต", icon: Layers },
        { label: "ลากสไลด์ปรับค่า x เพื่อขยับจุด P และสังเกตเส้นสัมผัสความชัน", icon: Sliders },
        { label: "กดสปริงนำร่องเพื่อดูการค้นหาและเข้าจับพิกัดจุดสูงสุด/ต่ำสุด", icon: Target },
        { label: "ในแท็บอินทิกรัล ปรับสไลด์ขอบเขต a และ b เพื่อคำนวณพื้นที่", icon: Sliders },
      ]}
      progressLabel="ความคืบหน้าการทดลองแคลคูลัสขั้นสูง"
      progressValue={
        questProgress === 100
          ? "บรรลุภารกิจวิเคราะห์แคลคูลัสสัมบูรณ์แล้ว"
          : questProgress === 50
          ? "ผ่านเงื่อนไขไปแล้ว 1 ใน 2 ข้อ"
          : "ยังไม่ผ่านเงื่อนไขกิจกรรม"
      }
      progressPercent={questProgress}
      tips={[
        "สูตรคำนวณความชันหาจากอนุพันธ์ f'(x) = x² - 4x + 3 ซึ่งที่จุดวิกฤต f'(x) จะต้องเป็น 0 เสมอ",
        "คำนวณหาค่าวิกฤตจากสมการ x² - 4x + 3 = 0 จะได้แยกตัวประกอบเป็น (x - 1)(x - 3) = 0 จึงได้คำตอบ x = 1, 3",
        "ในโหมดอินทิเกรต ลองปรับขอบเขตล่างเป็น a = 0.0 และขอบเขตบนเป็น b = 3.0 เพื่อสังเกตพื้นที่แรเงาของกราฟ",
        "จำง่ายๆ: พื้นที่ใต้กราฟสามารถหาได้จากปฏิยานุพันธ์ F(b) - F(a) ซึ่งเป็นผลรวมของพื้นที่แร่ธาตุย่อยๆ",
      ]}
      onSave={handleSaveResults}
    />
  );
}
