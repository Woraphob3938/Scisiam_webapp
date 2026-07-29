"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  Sliders,
  RotateCcw,
  Clipboard,
  ClipboardList,
  Download,
  Trash,
  Sparkles,
  LineChart,
  Layers,
  Play,
  Pause,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedComplexRun {
  index: number;
  mode: "phasor" | "operation";
  r: number;
  theta: number;
  real: number;
  imag: number;
  operationResult?: string;
}

export default function ComplexPhasorsSimulation() {
  const labId = "complex-numbers-phasors";

  // Tab mode: "phasor" (rotating phasor and wave) or "operation" (multiplying two complex numbers)
  const [activeTab, setActiveTab] = useState<"phasor" | "operation">("phasor");

  // Core parameters for single phasor / Z1
  const [radius, setRadius] = useState<number>(3.0); // Magnitude r
  const [thetaDeg, setThetaDeg] = useState<number>(45.0); // Angle in degrees
  const [omega, setOmega] = useState<number>(1.0); // Angular velocity (rad/s)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0.0);

  // Z2 parameters for multiplication operation tab
  const [radius2, setRadius2] = useState<number>(2.0);
  const [thetaDeg2, setThetaDeg2] = useState<number>(60.0);

  const [loggedRuns, setLoggedRuns] = useState<LoggedComplexRun[]>([]);

  // Time progression ticks
  useEffect(() => {
    if (!isPlaying || activeTab !== "phasor") return;
    let animId: number;
    const tick = () => {
      setTime((prev) => (prev + 0.04) % (2 * Math.PI));
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, activeTab]);

  // Derive coordinates for Z1 (phasor mode)
  const currentAngleRad = useMemo(() => {
    if (activeTab === "phasor") {
      return (thetaDeg * Math.PI) / 180.0 + omega * time;
    }
    return (thetaDeg * Math.PI) / 180.0;
  }, [thetaDeg, omega, time, activeTab]);

  const realZ1 = useMemo(() => radius * Math.cos(currentAngleRad), [radius, currentAngleRad]);
  const imagZ1 = useMemo(() => radius * Math.sin(currentAngleRad), [radius, currentAngleRad]);

  // Derive coordinates for operation mode (Z1 * Z2)
  // Z1 = r1 e^(i theta1)
  // Z2 = r2 e^(i theta2)
  // Z3 = Z1 * Z2 = (r1*r2) e^(i (theta1+theta2))
  const thetaRad2 = useMemo(() => (thetaDeg2 * Math.PI) / 180.0, [thetaDeg2]);
  const realZ2 = useMemo(() => radius2 * Math.cos(thetaRad2), [radius2, thetaRad2]);
  const imagZ2 = useMemo(() => radius2 * Math.sin(thetaRad2), [radius2, thetaRad2]);

  const multRadius = useMemo(() => radius * radius2, [radius, radius2]);
  const multThetaDeg = useMemo(() => (thetaDeg + thetaDeg2) % 360, [thetaDeg, thetaDeg2]);
  const multThetaRad = useMemo(() => (multThetaDeg * Math.PI) / 180.0, [multThetaDeg]);
  const realZMult = useMemo(() => multRadius * Math.cos(multThetaRad), [multRadius, multThetaRad]);
  const imagZMult = useMemo(() => multRadius * Math.sin(multThetaRad), [multRadius, multThetaRad]);

  // SVG parameters

  // Grid coordinates mapping
  // Center of complex plane is at (140, 150)
  const originX = 140;
  const originY = 150;
  // Scale factor: 1 unit = 26 pixels (max magnitude ~5 units)
  const scale = 26;

  const complexToSvgX = useCallback((real: number) => originX + real * scale, [originX, scale]);
  const complexToSvgY = useCallback((imag: number) => originY - imag * scale, [originY, scale]);

  // Wave history for phasor projection wave
  const [waveHistory, setWaveHistory] = useState<number[]>([]);

  useEffect(() => {
    if (activeTab !== "phasor") return;
    const timer = window.setTimeout(() => {
      setWaveHistory((prev) => [imagZ1, ...prev].slice(0, 80));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [time, imagZ1, activeTab]);

  const wavePointsStr = useMemo(() => {
    const pts = waveHistory.map((val, idx) => {
      // Draw horizontally from x=260 moving rightwards
      const x = 270 + idx * 2.2;
      const y = originY - val * scale;
      return `${x},${y}`;
    });
    return pts.join(" ");
  }, [waveHistory, originY, scale]);

  // Quest progress
  const questProgress = useMemo(() => {
    let p = 0;
    if (loggedRuns.length >= 1) p += 30;
    // Condition 1: Perform Z1 * Z2 operation in operation mode
    if (loggedRuns.some((r) => r.mode === "operation")) p += 40;
    // Condition 2: Experiment with rotating angular velocity
    if (activeTab === "phasor" && omega > 1.5) p += 30;
    return Math.min(100, p);
  }, [loggedRuns, omega, activeTab]);

  const handleAddLog = () => {
    const run: LoggedComplexRun = {
      index: loggedRuns.length + 1,
      mode: activeTab,
      r: radius,
      theta: thetaDeg,
      real: realZ1,
      imag: imagZ1,
      operationResult: activeTab === "operation"
        ? `Z1*Z2 = ${multRadius.toFixed(2)}∠${multThetaDeg.toFixed(0)}°`
        : undefined,
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setRadius(3.0);
    setThetaDeg(45.0);
    setOmega(1.0);
    setRadius2(2.0);
    setThetaDeg2(60.0);
    setLoggedRuns([]);
    setWaveHistory([]);
  };

  const handleCopyData = () => {
    const header = "ชุด\tMode\tMagnitude r\tAngle θ (°)\tReal Part\tImaginary Part\tผลลัพธ์คำนวณ\n";
    const rows = loggedRuns.map(
      (r) => `${r.index}\t${r.mode}\t${r.r.toFixed(2)}\t${r.theta.toFixed(1)}\t${r.real.toFixed(4)}\t${r.imag.toFixed(4)}\t${r.operationResult ?? "-"}`
    );
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map(
      (r) => `${r.index},${r.mode},${r.r},${r.theta},${r.real},${r.imag},${r.operationResult ?? ""}`
    );
    const csv = "data:text/csv;charset=utf-8," + ["Index,Mode,Radius,Theta,Real,Imaginary,Result", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "complex_phasors_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    if (loggedRuns.length === 0) {
      alert("กรุณากดบันทึกผลการจำลองอย่างน้อย 1 ครั้งก่อนบันทึกรายงาน");
      return;
    }
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_complex_numbers_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "Complex Numbers & Phasors",
      variables: { radius, thetaDeg, omega, radius2, thetaDeg2 },
      liveValues: { realZ1, imagZ1, multRadius, multThetaDeg },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.r, y: r.theta })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, modeUsed: activeTab },
      score: Math.min(100, Math.max(40, 40 + questProgress * 0.6)),
      durationSeconds: null,
    });
  };

  return (
    <SharedSimulationShell
      accent="rose"
      labId={labId}
      category="Mathematics"
      title="Complex Numbers & Phasors"
      subtitle="ทำความเข้าใจระนาบจำนวนเชิงซ้อน สังเกต phasor เวกเตอร์หมุน และผลบวกผลคูณเชิงมุมในโดเมนเวลา"
      statusLabel={
        activeTab === "phasor"
          ? `Z = ${realZ1.toFixed(2)} + ${imagZ1.toFixed(2)}i | ${radius.toFixed(1)}∠${((currentAngleRad * 180) / Math.PI % 360).toFixed(0)}°`
          : `Z1*Z2 = ${realZMult.toFixed(2)} + ${imagZMult.toFixed(2)}i`
      }
      icon={LineChart}
      sceneTitle="Complex Plane & Phasor Wave Projection"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-rose-100 bg-[linear-gradient(135deg,#fff8f8_0%,#fff1f2_48%,#fff7f6_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          {/* Mode tab switch */}
          <div className="relative z-10 mb-3 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans">
            <button
              onClick={() => setActiveTab("phasor")}
              className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                activeTab === "phasor" ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Phasor & คลื่นไซน์ (Phasor & Wave)
            </button>
            <button
              onClick={() => setActiveTab("operation")}
              className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                activeTab === "operation" ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              ผลคูณเชิงซ้อน (Z1 × Z2)
            </button>
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            {activeTab === "phasor" ? (
              <svg viewBox="0 0 480 300" className="w-full max-w-[480px] h-auto overflow-visible">
                <defs>
                  <marker id="arrowhead-z" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                    <path d="M0,0 L6,2 L0,4 Z" fill="#e11d48" />
                  </marker>
                </defs>

                {/* Complex Plane Axes */}
                <line x1={originX - 100} y1={originY} x2={originX + 100} y2={originY} stroke="#94a3b8" strokeWidth="1.2" />
                <line x1={originX} y1={originY - 100} x2={originX} y2={originY + 100} stroke="#94a3b8" strokeWidth="1.2" />
                <text x={originX + 106} y={originY + 3} fill="#64748b" fontSize="8" fontWeight="bold">Re</text>
                <text x={originX - 3} y={originY - 104} fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="end">Im</text>

                {/* Concentric helper circles for magnitude */}
                {[1, 2, 3, 4].map((u) => (
                  <circle
                    key={u}
                    cx={originX}
                    cy={originY}
                    r={u * scale}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="0.8"
                    strokeDasharray="2,2"
                  />
                ))}

                {/* Rotating Phasor arrow */}
                <line
                  x1={originX}
                  y1={originY}
                  x2={complexToSvgX(realZ1)}
                  y2={complexToSvgY(imagZ1)}
                  stroke="#e11d48"
                  strokeWidth="2.5"
                  markerEnd="url(#arrowhead-z)"
                />

                {/* Projections dashed lines */}
                <line
                  x1={complexToSvgX(realZ1)}
                  y1={complexToSvgY(imagZ1)}
                  x2={originX}
                  y2={complexToSvgY(imagZ1)}
                  stroke="#fb7185"
                  strokeWidth="1.2"
                  strokeDasharray="3,3"
                />

                {/* Imaginary value marker label */}
                <circle cx={originX} cy={complexToSvgY(imagZ1)} r="3" fill="#e11d48" />

                {/* Projection sine wave axis */}
                <line x1="270" y1={originY} x2="450" y2={originY} stroke="#cbd5e1" strokeWidth="1" />
                <line x1="270" y1={originY - 80} x2="270" y2={originY + 80} stroke="#cbd5e1" strokeWidth="1" />

                {/* Sine wave points */}
                {wavePointsStr && (
                  <polyline
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    points={wavePointsStr}
                  />
                )}

                {/* Link line from complex plane to wave projection */}
                <line
                  x1={originX}
                  y1={complexToSvgY(imagZ1)}
                  x2="270"
                  y2={complexToSvgY(imagZ1)}
                  stroke="#f43f5e"
                  strokeWidth="1"
                  strokeDasharray="4,2"
                  opacity="0.8"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 480 300" className="w-full max-w-[480px] h-auto overflow-visible">
                <defs>
                  <marker id="arrow-z1" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                    <path d="M0,0 L6,2 L0,4 Z" fill="#2563eb" />
                  </marker>
                  <marker id="arrow-z2" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                    <path d="M0,0 L6,2 L0,4 Z" fill="#eab308" />
                  </marker>
                  <marker id="arrow-zmult" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                    <path d="M0,0 L6,2 L0,4 Z" fill="#16a34a" />
                  </marker>
                </defs>

                {/* Complex Plane Axes */}
                <line x1={originX - 100} y1={originY} x2={originX + 200} y2={originY} stroke="#94a3b8" strokeWidth="1.2" />
                <line x1={originX} y1={originY - 120} x2={originX} y2={originY + 120} stroke="#94a3b8" strokeWidth="1.2" />
                <text x={originX + 206} y={originY + 3} fill="#64748b" fontSize="8" fontWeight="bold">Re</text>
                <text x={originX - 3} y={originY - 124} fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="end">Im</text>

                {/* Z1 Vector (Blue) */}
                <line
                  x1={originX}
                  y1={originY}
                  x2={complexToSvgX(realZ1)}
                  y2={complexToSvgY(imagZ1)}
                  stroke="#2563eb"
                  strokeWidth="2"
                  markerEnd="url(#arrow-z1)"
                />
                <text x={complexToSvgX(realZ1)} y={complexToSvgY(imagZ1) - 8} fill="#2563eb" fontSize="8.5" fontWeight="black" textAnchor="middle">
                  Z1
                </text>

                {/* Z2 Vector (Yellow) */}
                <line
                  x1={originX}
                  y1={originY}
                  x2={complexToSvgX(realZ2)}
                  y2={complexToSvgY(imagZ2)}
                  stroke="#eab308"
                  strokeWidth="2"
                  markerEnd="url(#arrow-z2)"
                />
                <text x={complexToSvgX(realZ2)} y={complexToSvgY(imagZ2) - 8} fill="#ca8a04" fontSize="8.5" fontWeight="black" textAnchor="middle">
                  Z2
                </text>

                {/* Multiplication Output Vector (Green) */}
                <line
                  x1={originX}
                  y1={originY}
                  x2={complexToSvgX(realZMult)}
                  y2={complexToSvgY(imagZMult)}
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-zmult)"
                />
                <text x={complexToSvgX(realZMult)} y={complexToSvgY(imagZMult) - 10} fill="#15803d" fontSize="9" fontWeight="black" textAnchor="middle">
                  Z1 × Z2
                </text>

                {/* Calculation breakdown card */}
                <g transform="translate(340, 20)">
                  <rect x="0" y="0" width="130" height="110" rx="8" fill="white" fillOpacity="0.85" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="12" y="20" fill="#2563eb" fontSize="8" fontWeight="black">Z1 = {radius.toFixed(1)} ∠{thetaDeg.toFixed(0)}°</text>
                  <text x="12" y="38" fill="#ca8a04" fontSize="8" fontWeight="black">Z2 = {radius2.toFixed(1)} ∠{thetaDeg2.toFixed(0)}°</text>
                  <line x1="10" y1="50" x2="120" y2="50" stroke="#f1f5f9" />

                  <text x="12" y="66" fill="#16a34a" fontSize="8" fontWeight="black">Z1 × Z2 (ผลลัพธ์):</text>
                  <text x="12" y="82" fill="#15803d" fontSize="9" fontWeight="black">r = {(radius * radius2).toFixed(1)} ({radius.toFixed(1)}×{radius2.toFixed(1)})</text>
                  <text x="12" y="98" fill="#15803d" fontSize="9" fontWeight="black">θ = {multThetaDeg.toFixed(0)}° ({thetaDeg.toFixed(0)}°+{thetaDeg2.toFixed(0)}°)</text>
                </g>
              </svg>
            )}
          </div>
        </div>
      }
      controlsTitle="ควบคุมค่าเวกเตอร์จำนวนเชิงซ้อน"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-rose-500" />
              เวกเตอร์ Z1 (หรือหลัก)
            </h3>
            <ManualNumberInput
              label="ความยาวเวกเตอร์ Z1 (Magnitude r)"
              ariaLabel="ความยาว Z1"
              value={radius}
              min={1.0}
              max={5.0}
              step={0.1}
              onChange={setRadius}
              tone="pink"
            />
            <ManualNumberInput
              label="มุมเฟส Z1 (Phase θ₁ - องศา)"
              ariaLabel="มุมเฟส Z1"
              value={thetaDeg}
              min={0}
              max={360}
              step={5}
              onChange={setThetaDeg}
              tone="pink"
            />
            {activeTab === "phasor" && (
              <ManualNumberInput
                label="ความถี่การหมุนเชิงมุม (Angular frequency ω)"
                ariaLabel="ความถี่เชิงมุม"
                value={omega}
                min={0.0}
                max={3.0}
                step={0.1}
                onChange={setOmega}
                tone="orange"
              />
            )}
          </section>

          {activeTab === "operation" && (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Sliders className="h-4.5 w-4.5 text-orange-500" />
                เวกเตอร์ Z2 (สำหรับคูณ)
              </h3>
              <ManualNumberInput
                label="ความยาวเวกเตอร์ Z2 (Magnitude r₂)"
                ariaLabel="ความยาว Z2"
                value={radius2}
                min={1.0}
                max={3.0}
                step={0.1}
                onChange={setRadius2}
                tone="orange"
              />
              <ManualNumberInput
                label="มุมเฟส Z2 (Phase θ₂ - องศา)"
                ariaLabel="มุมเฟส Z2"
                value={thetaDeg2}
                min={0}
                max={360}
                step={5}
                onChange={setThetaDeg2}
                tone="amber"
              />
            </section>
          )}

          {/* Action buttons */}
          {activeTab === "phasor" && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold shadow-sm transition-all active:scale-97 cursor-pointer ${
                  isPlaying ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {isPlaying ? "หยุดหมุนเวกเตอร์" : "เริ่มหมุนเวกเตอร์"}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2.5 text-xs font-bold text-rose-700 shadow-sm transition-all hover:bg-rose-50 active:scale-97 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                รีเซ็ต
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-97 cursor-pointer"
            >
              <ClipboardList className="h-3.5 w-3.5 text-rose-500" />
              บันทึกจุดเฟสเซอร์
            </button>
            <button
              onClick={handleSaveResults}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/10 transition-all hover:from-rose-700 hover:to-red-700 active:scale-97 cursor-pointer"
            >
              ส่งออกรายงาน
            </button>
          </div>
        </div>
      }
      compactControls={
        <div className="flex items-center gap-2 font-sans flex-wrap">
          <ManualNumberInput label="r" ariaLabel="ขนาด Z1" value={radius} min={1.0} max={5.0} step={0.2} onChange={setRadius} tone="pink" />
          <ManualNumberInput label="θ" ariaLabel="มุม Z1" value={thetaDeg} min={0} max={360} step={10} onChange={setThetaDeg} tone="pink" />
        </div>
      }
      metrics={[
        { label: "ส่วนจริง Real (x)", value: realZ1.toFixed(3), tone: "rose" },
        { label: "ส่วนจินตภาพ Imag (y)", value: `${imagZ1.toFixed(3)}i`, tone: "rose" },
        { label: "ขนาดเวกเตอร์ r", value: radius.toFixed(2), tone: "orange" },
        { label: "มุมเฟสปัจจุบัน θ", value: `${((currentAngleRad * 180) / Math.PI % 360).toFixed(1)}°`, tone: undefined },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-rose-600" />
              ทฤษฎีเวกเตอร์เชิงซ้อน (Euler&apos;s Theorem)
            </h3>
          </div>
          <div className="flex-grow flex flex-col justify-center gap-3 text-xs leading-relaxed text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3 flex flex-col gap-2 border border-slate-150">
              <div>
                <span className="font-bold text-slate-700">Euler&apos;s Formula:</span>
                <p className="mt-0.5 text-slate-500 font-bold">
                  {"$e^i\\theta = \\cos \\theta + i \\sin \\theta$ แสดงความสัมพันธ์ระหว่างเวกเตอร์มุมหมุนและคลื่นตรีโกณมิติ"}
                </p>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-700">Complex Operations:</span>
                <p className="mt-0.5 text-slate-500 font-bold">
                  {"การคูณจำนวนเชิงซ้อนในรูปขั้ว (Polar Form) ได้โดย: $z_1 \\cdot z_2 = (r_1 r_2) e^{i(\\theta_1 + \\theta_2)}$"}
                </p>
              </div>
            </div>
          </div>
        </section>
      }
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">จำนวนเชิงซ้อนและเฟสเซอร์ (Complex Numbers & Phasors)</p>
          <p className="mb-3">
            การแสดงค่าขนาดและเฟส (มุม) ไปพร้อมๆ กัน บนระนาบแบบ 2 มิติ (แกนจริงและแกนจินตภาพ) ถูกนำมาใช้กันมากในเชิงวิศวกรรมไฟฟ้าและฟิสิกส์คลื่น:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>Phasor:</strong> คือเวกเตอร์หมุนที่แทนสัญญาณไซน์ที่มีแอมพลิจูดและเฟสคงที่ การหมุนช่วยลดความซับซ้อนในแคลคูลัสสัญญาณ
            </li>
            <li>
              <strong>Complex Plane:</strong> {"พิกัดฉาก $x + iy$ แปลงเป็นพิกัดขั้ว $r\\angle\\theta$ ได้โดย $r = \\sqrt{x^2+y^2}$ และ $\\theta = \\arctan(y/x)$"}
            </li>
          </ul>
        </div>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                <ClipboardList className="h-4.5 w-4.5 text-rose-500" />
                ตารางรายงานผลการคำนวณจำนวนเชิงซ้อน
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
                ยังไม่มีการบันทึกข้อมูล กดปุ่ม &quot;บันทึกจุดเฟสเซอร์&quot;
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-2.5 text-center">ชุดที่</th>
                      <th className="p-2.5">โหมดการจำลอง</th>
                      <th className="p-2.5">ขนาด Z1 (r)</th>
                      <th className="p-2.5">มุม Z1 (θ)</th>
                      <th className="p-2.5">พิกัดจริง (Real)</th>
                      <th className="p-2.5">พิกัดจินตภาพ</th>
                      <th className="p-2.5 text-right">ผลลัพธ์คำนวณ</th>
                      <th className="p-2.5 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                    {loggedRuns.map((run) => (
                      <tr key={run.index} className="hover:bg-rose-50/20 transition-colors">
                        <td className="p-2 text-center font-bold">{run.index}</td>
                        <td className="p-2 font-sans">{run.mode === "phasor" ? "Phasor & Wave" : "Multiplication"}</td>
                        <td className="p-2">{run.r.toFixed(2)}</td>
                        <td className="p-2">{run.theta.toFixed(1)}°</td>
                        <td className="p-2">{run.real.toFixed(4)}</td>
                        <td className="p-2">{run.imag.toFixed(4)}i</td>
                        <td className="p-2 text-right font-bold text-slate-800">{run.operationResult ?? "-"}</td>
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
        "เข้าใจความเชื่อมโยงระนาบจำนวนเชิงซ้อนระหว่างพิกัดฉาก x+iy และพิกัดขั้ว r∠θ",
        "ศึกษาความสัมพันธ์ของ Phasor เวกเตอร์หมุนที่ทำให้เกิดคลื่นไซน์ในโดเมนเวลา",
        "สังเกตพฤติกรรมผลลัพธ์ของการคูณจำนวนเชิงซ้อนว่าเกิดจากการคูณขนาดและการบวกเฟสของมุม",
      ]}
      steps={[
        { label: "เลือกสลับระหว่างแท็บจำลองคลื่นหมุน และแท็บวิเคราะห์ผลคูณ", icon: Layers },
        { label: "ปรับสไลเดอร์เพื่อยืดขนาดและขยับทิศทางมุมเวกเตอร์", icon: Sliders },
        { label: "กดเล่นต่อเนื่องเพื่อดูการวาดและส่งผ่านพิกัดขึ้นรูปคลื่นไซน์", icon: Play },
        { label: "บันทึกผลการประมาณและเปรียบเทียบในรายงานตารางการทดลอง", icon: ClipboardList },
      ]}
      progressLabel="ความคืบหน้าเรื่อง Phasor"
      progressValue={
        questProgress === 100
          ? "วิเคราะห์จำนวนเชิงซ้อนเชิงลึกสำเร็จแล้ว"
          : questProgress >= 50
          ? "ผ่านเกณฑ์กิจกรรม..."
          : "ยังไม่ผ่านเงื่อนไขกิจกรรม"
      }
      progressPercent={questProgress}
      tips={[
        "ในโหมดคูณ (Operation) ลองสังเกตเวกเตอร์ Z1 และ Z2 คู่อื่นๆ จะพบว่าเวกเตอร์ผลลัพธ์ Z1×Z2 จะทำมุมเท่ากับผลบวกของ Z1 และ Z2 เสมอ",
        "ในทางวิศวกรรมไฟฟ้ากระแสสลับ เวกเตอร์ Phasor ที่หมุนด้วยความเร็วเชิงมุม ω ช่วยให้คำนวณแรงดันและกระแสได้โดยการบวกลบเวกเตอร์ฉากแทนการแก้สมการอนุพันธ์ไซน์ซับซ้อน",
      ]}
      onRun={() => setIsPlaying((current) => !current)}
      runLabel={isPlaying ? "หยุดทดลอง" : "ทดลอง"}
      runActive={isPlaying}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}

