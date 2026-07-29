"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Sliders,
  RotateCcw,
  Clipboard,
  ClipboardList,
  Download,
  Trash,
  Target,
  Sparkles,
  Layers,
  BarChart3,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

// Standard normal PDF and CDF (Abramowitz & Stegun)
function stdNormalPDF(z: number): number {
  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
}

function stdNormalCDF(z: number): number {
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804;
  const poly = ((((1.330274429 * t - 1.821255978) * t + 1.781477937) * t - 0.356563782) * t + 0.319381530) * t;
  const prob = 1.0 - d * Math.exp(-z * z / 2.0) * poly;
  return z >= 0 ? prob : 1.0 - prob;
}

// Critical z-values for common confidence levels
function zCritical(confidence: number): number {
  // Inverse normal approximation for common levels
  if (confidence >= 0.995) return 2.807;
  if (confidence >= 0.99) return 2.576;
  if (confidence >= 0.975) return 2.241;
  if (confidence >= 0.95) return 1.96;
  if (confidence >= 0.90) return 1.645;
  if (confidence >= 0.85) return 1.44;
  if (confidence >= 0.80) return 1.282;
  return 1.0;
}

interface LoggedInferenceRun {
  index: number;
  mode: "ci" | "hypothesis";
  sampleMean: number;
  sampleSize: number;
  sigma: number;
  confidence: number;
  ciLower: number;
  ciUpper: number;
  h0Mean: number;
  zStat: number;
  pValue: number;
  rejectH0: boolean;
}

export default function StatisticalInferenceSimulation() {
  const labId = "statistical-inference";

  const [activeTab, setActiveTab] = useState<"ci" | "hypothesis">("ci");

  // Parameters
  const [sampleMean, setSampleMean] = useState(52.0);
  const [sampleSize, setSampleSize] = useState(30);
  const [sigma, setSigma] = useState(10.0);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [h0Mean, setH0Mean] = useState(50.0);
  const [alpha, setAlpha] = useState(0.05);

  const [loggedRuns, setLoggedRuns] = useState<LoggedInferenceRun[]>([]);

  // Computed statistics
  const standardError = useMemo(() => sigma / Math.sqrt(sampleSize), [sigma, sampleSize]);
  const zCrit = useMemo(() => zCritical(confidenceLevel), [confidenceLevel]);
  const marginOfError = useMemo(() => zCrit * standardError, [zCrit, standardError]);
  const ciLower = useMemo(() => sampleMean - marginOfError, [sampleMean, marginOfError]);
  const ciUpper = useMemo(() => sampleMean + marginOfError, [sampleMean, marginOfError]);

  // Hypothesis test
  const zStat = useMemo(() => (sampleMean - h0Mean) / standardError, [sampleMean, h0Mean, standardError]);
  const pValue = useMemo(() => 2 * (1 - stdNormalCDF(Math.abs(zStat))), [zStat]);
  const rejectH0 = pValue < alpha;
  const zAlpha = useMemo(() => zCritical(1 - alpha / 2), [alpha]);

  // SVG dimensions
  const svgW = 480, svgH = 300;
  const pad = { l: 40, r: 40, t: 30, b: 40 };
  const plotW = svgW - pad.l - pad.r;
  const plotH = svgH - pad.t - pad.b;

  // For CI mode: display around sample mean
  // For hypothesis mode: display centered on h0Mean
  const displayCenter = activeTab === "ci" ? sampleMean : h0Mean;
  const displayRange = 4.5 * standardError;
  const displayMin = displayCenter - displayRange;
  const displayMax = displayCenter + displayRange;

  const xToSvg = useCallback(
    (x: number) => pad.l + ((x - displayMin) / (displayMax - displayMin)) * plotW,
    [pad.l, displayMin, displayMax, plotW]
  );

  // Normal PDF scaled for display
  const pdfMax = stdNormalPDF(0) / standardError;

  const yToSvg = useCallback(
    (y: number) => pad.t + plotH - (y / pdfMax) * plotH * 0.9,
    [pad.t, pdfMax, plotH]
  );

  // Build bell curve path
  const bellCurvePath = useMemo(() => {
    const pts: string[] = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const x = displayMin + (i / steps) * (displayMax - displayMin);
      const z = (x - displayCenter) / standardError;
      const y = stdNormalPDF(z) / standardError;
      pts.push(`${xToSvg(x).toFixed(1)},${yToSvg(y).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [displayMin, displayMax, displayCenter, standardError, xToSvg, yToSvg]);

  // Build CI shaded area
  const ciShadedPath = useMemo(() => {
    if (activeTab !== "ci") return "";
    const pts: string[] = [];
    const steps = 80;
    const lo = Math.max(displayMin, ciLower);
    const hi = Math.min(displayMax, ciUpper);
    pts.push(`${xToSvg(lo).toFixed(1)},${yToSvg(0).toFixed(1)}`);
    for (let i = 0; i <= steps; i++) {
      const x = lo + (i / steps) * (hi - lo);
      const z = (x - sampleMean) / standardError;
      const y = stdNormalPDF(z) / standardError;
      pts.push(`${xToSvg(x).toFixed(1)},${yToSvg(y).toFixed(1)}`);
    }
    pts.push(`${xToSvg(hi).toFixed(1)},${yToSvg(0).toFixed(1)}`);
    return pts.join(" ");
  }, [activeTab, ciLower, ciUpper, displayMin, displayMax, sampleMean, standardError, xToSvg, yToSvg]);

  // Build rejection region shaded areas for hypothesis test
  const rejectionPaths = useMemo(() => {
    if (activeTab !== "hypothesis") return { left: "", right: "" };
    const steps = 40;

    // Left tail
    const leftPts: string[] = [];
    const leftEnd = h0Mean - zAlpha * standardError;
    const leftStart = Math.max(displayMin, h0Mean - 4.5 * standardError);
    leftPts.push(`${xToSvg(leftStart).toFixed(1)},${yToSvg(0).toFixed(1)}`);
    for (let i = 0; i <= steps; i++) {
      const x = leftStart + (i / steps) * (leftEnd - leftStart);
      const z = (x - h0Mean) / standardError;
      const y = stdNormalPDF(z) / standardError;
      leftPts.push(`${xToSvg(x).toFixed(1)},${yToSvg(y).toFixed(1)}`);
    }
    leftPts.push(`${xToSvg(leftEnd).toFixed(1)},${yToSvg(0).toFixed(1)}`);

    // Right tail
    const rightPts: string[] = [];
    const rightStart = h0Mean + zAlpha * standardError;
    const rightEnd = Math.min(displayMax, h0Mean + 4.5 * standardError);
    rightPts.push(`${xToSvg(rightStart).toFixed(1)},${yToSvg(0).toFixed(1)}`);
    for (let i = 0; i <= steps; i++) {
      const x = rightStart + (i / steps) * (rightEnd - rightStart);
      const z = (x - h0Mean) / standardError;
      const y = stdNormalPDF(z) / standardError;
      rightPts.push(`${xToSvg(x).toFixed(1)},${yToSvg(y).toFixed(1)}`);
    }
    rightPts.push(`${xToSvg(rightEnd).toFixed(1)},${yToSvg(0).toFixed(1)}`);

    return { left: leftPts.join(" "), right: rightPts.join(" ") };
  }, [activeTab, h0Mean, zAlpha, standardError, displayMin, displayMax, xToSvg, yToSvg]);

  // Quest progress
  const questProgress = useMemo(() => {
    let p = 0;
    if (loggedRuns.length >= 1) p += 25;
    if (loggedRuns.some((r) => r.mode === "ci")) p += 25;
    if (loggedRuns.some((r) => r.mode === "hypothesis")) p += 25;
    if (loggedRuns.some((r) => r.rejectH0)) p += 25;
    return Math.min(100, p);
  }, [loggedRuns]);

  // Handlers
  const handleAddLog = () => {
    const run: LoggedInferenceRun = {
      index: loggedRuns.length + 1,
      mode: activeTab,
      sampleMean,
      sampleSize,
      sigma,
      confidence: confidenceLevel,
      ciLower,
      ciUpper,
      h0Mean,
      zStat,
      pValue,
      rejectH0,
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setSampleMean(52.0);
    setSampleSize(30);
    setSigma(10.0);
    setConfidenceLevel(0.95);
    setH0Mean(50.0);
    setAlpha(0.05);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุด\tMode\tx̄\tn\tσ\tCI Lower\tCI Upper\tH₀\tz\tp-value\tReject\n";
    const rows = loggedRuns.map(
      (r) => `${r.index}\t${r.mode}\t${r.sampleMean.toFixed(2)}\t${r.sampleSize}\t${r.sigma.toFixed(1)}\t${r.ciLower.toFixed(3)}\t${r.ciUpper.toFixed(3)}\t${r.h0Mean.toFixed(1)}\t${r.zStat.toFixed(4)}\t${r.pValue.toFixed(6)}\t${r.rejectH0 ? "ปฏิเสธ" : "ไม่ปฏิเสธ"}`
    );
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map(
      (r) => `${r.index},${r.mode},${r.sampleMean},${r.sampleSize},${r.sigma},${r.ciLower},${r.ciUpper},${r.h0Mean},${r.zStat},${r.pValue},${r.rejectH0}`
    );
    const csv = "data:text/csv;charset=utf-8," + ["Index,Mode,Mean,N,Sigma,CI_Lower,CI_Upper,H0,Z,P,Reject", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "statistical_inference_log.csv");
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
      localStorageKey: "scisiam_saved_statistical_inference_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "Statistical Inference",
      variables: { sampleMean, sampleSize, sigma, confidenceLevel, h0Mean, alpha },
      liveValues: { standardError, ciLower, ciUpper, zStat, pValue, rejectH0 },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.sampleMean, y: r.pValue })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, anyRejected: loggedRuns.some((r) => r.rejectH0) },
      score: Math.min(100, Math.max(40, 40 + questProgress * 0.6)),
      durationSeconds: null,
    });
  };

  return (
    <SharedSimulationShell
      accent="blue"
      labId={labId}
      category="Mathematics"
      title="Statistical Inference"
      subtitle="เรียนรู้การสร้างช่วงความเชื่อมั่น (Confidence Interval) และการทดสอบสมมติฐาน (Hypothesis Testing)"
      statusLabel={
        activeTab === "ci"
          ? `CI: [${ciLower.toFixed(2)}, ${ciUpper.toFixed(2)}]`
          : `z = ${zStat.toFixed(3)} | p = ${pValue.toFixed(4)}`
      }
      icon={BarChart3}
      sceneTitle="Sampling Distribution & Inference Visualization"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#f0f9ff_48%,#f5f3ff_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          {/* Mode tabs */}
          <div className="relative z-10 mb-3 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans">
            <button
              onClick={() => setActiveTab("ci")}
              className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                activeTab === "ci" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              ช่วงความเชื่อมั่น (CI)
            </button>
            <button
              onClick={() => setActiveTab("hypothesis")}
              className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                activeTab === "hypothesis" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              ทดสอบสมมติฐาน (H-Test)
            </button>
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[480px] h-auto overflow-visible">
              <defs>
                <linearGradient id="siCIGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="siRejectGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.08" />
                </linearGradient>
              </defs>

              {/* Baseline axis */}
              <line x1={pad.l} y1={yToSvg(0)} x2={svgW - pad.r} y2={yToSvg(0)} stroke="#94a3b8" strokeWidth="1.2" />

              {/* Grid ticks */}
              {Array.from({ length: 9 }).map((_, i) => {
                const x = displayMin + ((i + 0.5) / 9) * (displayMax - displayMin);
                return (
                  <g key={i}>
                    <line x1={xToSvg(x)} y1={yToSvg(0) - 3} x2={xToSvg(x)} y2={yToSvg(0) + 3} stroke="#cbd5e1" strokeWidth="1" />
                    <text x={xToSvg(x)} y={yToSvg(0) + 16} fill="#94a3b8" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                      {x.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* CI mode: shaded confidence interval area */}
              {activeTab === "ci" && ciShadedPath && (
                <polygon points={ciShadedPath} fill="url(#siCIGrad)" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" opacity="0.8" />
              )}

              {/* Hypothesis mode: rejection regions */}
              {activeTab === "hypothesis" && (
                <>
                  {rejectionPaths.left && (
                    <polygon points={rejectionPaths.left} fill="url(#siRejectGrad)" stroke="#ef4444" strokeWidth="0.8" opacity="0.7" />
                  )}
                  {rejectionPaths.right && (
                    <polygon points={rejectionPaths.right} fill="url(#siRejectGrad)" stroke="#ef4444" strokeWidth="0.8" opacity="0.7" />
                  )}
                </>
              )}

              {/* Bell curve */}
              <polyline fill="none" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" points={bellCurvePath} />

              {/* CI mode annotations */}
              {activeTab === "ci" && (
                <>
                  {/* CI bounds lines */}
                  <line x1={xToSvg(ciLower)} y1={pad.t} x2={xToSvg(ciLower)} y2={yToSvg(0)} stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4,2" />
                  <line x1={xToSvg(ciUpper)} y1={pad.t} x2={xToSvg(ciUpper)} y2={yToSvg(0)} stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4,2" />

                  {/* CI bound labels */}
                  <text x={xToSvg(ciLower)} y={yToSvg(0) + 28} fill="#2563eb" fontSize="8" fontWeight="900" textAnchor="middle">
                    {ciLower.toFixed(2)}
                  </text>
                  <text x={xToSvg(ciUpper)} y={yToSvg(0) + 28} fill="#2563eb" fontSize="8" fontWeight="900" textAnchor="middle">
                    {ciUpper.toFixed(2)}
                  </text>

                  {/* Sample mean marker */}
                  <circle cx={xToSvg(sampleMean)} cy={yToSvg(0)} r="6" fill="#2563eb" stroke="#fff" strokeWidth="2" />
                  <text x={xToSvg(sampleMean)} y={yToSvg(0) - 10} fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">
                    x̄ = {sampleMean.toFixed(1)}
                  </text>

                  {/* CI bracket */}
                  <line
                    x1={xToSvg(ciLower)}
                    y1={yToSvg(0) + 38}
                    x2={xToSvg(ciUpper)}
                    y2={yToSvg(0) + 38}
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <text
                    x={(xToSvg(ciLower) + xToSvg(ciUpper)) / 2}
                    y={yToSvg(0) + 52}
                    fill="#3b82f6"
                    fontSize="8"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    {(confidenceLevel * 100).toFixed(0)}% CI (±{marginOfError.toFixed(2)})
                  </text>
                </>
              )}

              {/* Hypothesis test annotations */}
              {activeTab === "hypothesis" && (
                <>
                  {/* H0 mean line */}
                  <line x1={xToSvg(h0Mean)} y1={pad.t} x2={xToSvg(h0Mean)} y2={yToSvg(0)} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,3" />
                  <text x={xToSvg(h0Mean)} y={pad.t - 6} fill="#64748b" fontSize="8" fontWeight="900" textAnchor="middle">
                    H₀: μ = {h0Mean.toFixed(1)}
                  </text>

                  {/* Critical z-value lines */}
                  <line
                    x1={xToSvg(h0Mean - zAlpha * standardError)}
                    y1={pad.t + 20}
                    x2={xToSvg(h0Mean - zAlpha * standardError)}
                    y2={yToSvg(0)}
                    stroke="#ef4444"
                    strokeWidth="1"
                    strokeDasharray="3,2"
                  />
                  <line
                    x1={xToSvg(h0Mean + zAlpha * standardError)}
                    y1={pad.t + 20}
                    x2={xToSvg(h0Mean + zAlpha * standardError)}
                    y2={yToSvg(0)}
                    stroke="#ef4444"
                    strokeWidth="1"
                    strokeDasharray="3,2"
                  />

                  {/* Rejection region labels */}
                  <text x={xToSvg(h0Mean - zAlpha * standardError)} y={pad.t + 16} fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="middle">
                    −z_α/2
                  </text>
                  <text x={xToSvg(h0Mean + zAlpha * standardError)} y={pad.t + 16} fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="middle">
                    +z_α/2
                  </text>

                  {/* Sample mean marker */}
                  <circle cx={xToSvg(sampleMean)} cy={yToSvg(0)} r="6" fill={rejectH0 ? "#ef4444" : "#22c55e"} stroke="#fff" strokeWidth="2">
                    {rejectH0 && <animate attributeName="r" values="5;8;5" dur="1.5s" repeatCount="indefinite" />}
                  </circle>
                  <text x={xToSvg(sampleMean)} y={yToSvg(0) - 12} fill={rejectH0 ? "#dc2626" : "#16a34a"} fontSize="9" fontWeight="900" textAnchor="middle">
                    x̄ = {sampleMean.toFixed(1)}
                  </text>

                  {/* Result badge */}
                  <g>
                    <rect
                      x={svgW - pad.r - 140}
                      y={pad.t + 30}
                      width="136"
                      height="44"
                      rx="10"
                      fill={rejectH0 ? "#fef2f2" : "#f0fdf4"}
                      stroke={rejectH0 ? "#fca5a5" : "#86efac"}
                      strokeWidth="1.5"
                    />
                    <text x={svgW - pad.r - 72} y={pad.t + 50} fill={rejectH0 ? "#dc2626" : "#16a34a"} fontSize="9" fontWeight="900" textAnchor="middle">
                      {rejectH0 ? "ปฏิเสธ H₀" : "ไม่ปฏิเสธ H₀"}
                    </text>
                    <text x={svgW - pad.r - 72} y={pad.t + 64} fill="#64748b" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                      p = {pValue.toFixed(4)} | α = {alpha.toFixed(2)}
                    </text>
                  </g>
                </>
              )}

              {/* Axis title */}
              <text x={svgW / 2} y={svgH - 4} fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">
                {activeTab === "ci" ? "ค่า Sampling Distribution" : "ค่า Test Statistic Distribution"}
              </text>
            </svg>
          </div>
        </div>
      }
      controlsTitle="ปรับแต่งพารามิเตอร์ทางสถิติ"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          {/* Common parameters */}
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-blue-500" />
              พารามิเตอร์ตัวอย่าง
            </h3>
            <ManualNumberInput
              label="ค่าเฉลี่ยตัวอย่าง (x̄)"
              ariaLabel="ค่าเฉลี่ยตัวอย่าง"
              value={sampleMean}
              min={30}
              max={70}
              step={0.5}
              onChange={setSampleMean}
              tone="blue"
            />
            <ManualNumberInput
              label="ขนาดตัวอย่าง (n)"
              ariaLabel="ขนาดตัวอย่าง"
              value={sampleSize}
              min={5}
              max={200}
              step={5}
              onChange={(v) => setSampleSize(Math.round(v))}
              tone="cyan"
            />
            <ManualNumberInput
              label="ส่วนเบี่ยงเบนมาตรฐาน (σ)"
              ariaLabel="ส่วนเบี่ยงเบนมาตรฐาน"
              value={sigma}
              min={1}
              max={30}
              step={0.5}
              onChange={setSigma}
              tone="violet"
            />
          </section>

          {/* Tab-specific controls */}
          {activeTab === "ci" ? (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Target className="h-4.5 w-4.5 text-blue-500" />
                ระดับความเชื่อมั่น
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[0.90, 0.95, 0.99, 0.999].map((cl) => (
                  <button
                    key={cl}
                    onClick={() => setConfidenceLevel(cl)}
                    className={`rounded-xl border p-2 text-center text-xs font-bold transition-all cursor-pointer ${
                      Math.abs(confidenceLevel - cl) < 0.001
                        ? "border-blue-300 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {(cl * 100).toFixed(cl === 0.999 ? 1 : 0)}%
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Target className="h-4.5 w-4.5 text-blue-500" />
                สมมติฐานว่าง (H₀)
              </h3>
              <ManualNumberInput
                label="ค่าเฉลี่ยประชากร ภายใต้ H₀ (μ₀)"
                ariaLabel="ค่า H₀"
                value={h0Mean}
                min={30}
                max={70}
                step={0.5}
                onChange={setH0Mean}
                tone="orange"
              />
              <div className="grid grid-cols-3 gap-2">
                {[0.01, 0.05, 0.10].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAlpha(a)}
                    className={`rounded-xl border p-2 text-center text-xs font-bold transition-all cursor-pointer ${
                      Math.abs(alpha - a) < 0.001
                        ? "border-rose-300 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    α = {a.toFixed(2)}
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-97 cursor-pointer"
            >
              <ClipboardList className="h-3.5 w-3.5 text-blue-500" />
              บันทึกผลทดสอบ
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
        <div className="flex items-center gap-2 font-sans flex-wrap">
          <ManualNumberInput label="x̄" ariaLabel="ค่าเฉลี่ย" value={sampleMean} min={30} max={70} step={1} onChange={setSampleMean} tone="blue" />
          <ManualNumberInput label="n" ariaLabel="ขนาดตัวอย่าง" value={sampleSize} min={5} max={200} step={5} onChange={(v) => setSampleSize(Math.round(v))} tone="cyan" />
        </div>
      }
      metrics={[
        { label: "Standard Error (SE)", value: standardError.toFixed(4), tone: "blue" },
        { label: activeTab === "ci" ? `${(confidenceLevel * 100).toFixed(0)}% CI` : "z-statistic", value: activeTab === "ci" ? `[${ciLower.toFixed(2)}, ${ciUpper.toFixed(2)}]` : zStat.toFixed(4), tone: "cyan" },
        { label: activeTab === "ci" ? "Margin of Error" : "p-value", value: activeTab === "ci" ? `±${marginOfError.toFixed(3)}` : pValue.toFixed(6), tone: "rose" },
        { label: activeTab === "ci" ? "CI Width" : "ผลการทดสอบ", value: activeTab === "ci" ? (ciUpper - ciLower).toFixed(3) : (rejectH0 ? "ปฏิเสธ H₀" : "ไม่ปฏิเสธ"), tone: "emerald" },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-blue-600" />
              สรุปทฤษฎีสถิติอนุมาน
            </h3>
          </div>
          <div className="flex-grow flex flex-col justify-center gap-3 text-xs leading-relaxed text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3 flex flex-col gap-2 border border-slate-150">
              <div>
                <span className="font-bold text-slate-700">Confidence Interval:</span>
                <p className="mt-0.5 text-slate-500 font-bold">
                  x̄ ± z* × SE โดย SE = σ/√n ช่วงนี้ครอบ μ จริงด้วยความมั่นใจตามระดับที่กำหนด
                </p>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-700">Hypothesis Testing:</span>
                <p className="mt-0.5 text-slate-500 font-bold">
                  z = (x̄ − μ₀) / SE ถ้า p-value &lt; α จะปฏิเสธ H₀ ว่า μ = μ₀
                </p>
              </div>
            </div>
          </div>
        </section>
      }
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">สถิติอนุมาน (Statistical Inference)</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>Confidence Interval:</strong> ช่วงค่าที่คาดว่าจะครอบค่าเฉลี่ยประชากร μ จริง ยิ่งระดับ confidence สูง ช่วงยิ่งกว้าง
            </li>
            <li>
              <strong>Hypothesis Testing:</strong> กระบวนการตัดสินใจว่าข้อมูลขัดแย้งกับสมมติฐานว่าง (H₀) หรือไม่ โดยดูจาก p-value
            </li>
            <li>
              <strong>p-value:</strong> ความน่าจะเป็นที่จะได้ผลลัพธ์รุนแรงเท่านี้หรือมากกว่า ภายใต้ H₀ ถ้า p &lt; α จะปฏิเสธ H₀
            </li>
            <li>
              <strong>Standard Error:</strong> SE = σ/√n ยิ่ง n มาก SE ยิ่งเล็ก ทำให้ CI แคบลง
            </li>
          </ul>
        </div>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                <ClipboardList className="h-4.5 w-4.5 text-blue-500" />
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
                ยังไม่มีการบันทึก กดปุ่ม &quot;บันทึกผลทดสอบ&quot;
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-2.5 text-center">ชุด</th>
                      <th className="p-2.5">Mode</th>
                      <th className="p-2.5">x̄</th>
                      <th className="p-2.5">n</th>
                      <th className="p-2.5">CI</th>
                      <th className="p-2.5">z</th>
                      <th className="p-2.5">p-value</th>
                      <th className="p-2.5">ผลลัพธ์</th>
                      <th className="p-2.5 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                    {loggedRuns.map((run) => (
                      <tr key={run.index} className="hover:bg-blue-50/20 transition-colors">
                        <td className="p-2 text-center font-bold">{run.index}</td>
                        <td className="p-2 font-sans">
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${run.mode === "ci" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                            {run.mode === "ci" ? "CI" : "H-Test"}
                          </span>
                        </td>
                        <td className="p-2">{run.sampleMean.toFixed(1)}</td>
                        <td className="p-2">{run.sampleSize}</td>
                        <td className="p-2">[{run.ciLower.toFixed(2)}, {run.ciUpper.toFixed(2)}]</td>
                        <td className="p-2">{run.zStat.toFixed(3)}</td>
                        <td className="p-2">{run.pValue.toFixed(4)}</td>
                        <td className="p-2 font-sans">
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${run.rejectH0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                            {run.rejectH0 ? "ปฏิเสธ H₀" : "ไม่ปฏิเสธ"}
                          </span>
                        </td>
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
        "เข้าใจความหมายของ Confidence Interval และ Margin of Error",
        "ทดลองเปลี่ยนขนาดตัวอย่าง n เพื่อดูผลต่อ Standard Error",
        "เรียนรู้ว่า p-value บอกอะไรในการทดสอบสมมติฐาน",
        "สังเกตว่า α (significance level) มีผลต่อ rejection region อย่างไร",
      ]}
      steps={[
        { label: "เลือกโหมดระหว่าง CI และ Hypothesis Testing", icon: Layers },
        { label: "ปรับค่าเฉลี่ยตัวอย่าง ขนาด n และ σ", icon: Sliders },
        { label: "สังเกตช่วงความเชื่อมั่นหรือ rejection region บนกราฟ", icon: Target },
        { label: "บันทึกผลทดสอบเพื่อเปรียบเทียบในตาราง", icon: ClipboardList },
      ]}
      progressLabel="ความคืบหน้า Statistical Inference"
      progressValue={
        questProgress === 100
          ? "บรรลุภารกิจสถิติอนุมานแล้ว"
          : questProgress >= 50
          ? "กำลังดำเนินการ..."
          : "ยังไม่เริ่มภารกิจ"
      }
      progressPercent={questProgress}
      tips={[
        "ลองเพิ่ม n จาก 30 เป็น 100 แล้วดูว่า CI แคบลงอย่างมากเพราะ SE = σ/√n ลดลง",
        "ในโหมด H-Test ลองเลื่อน x̄ ห่างจาก μ₀ เพื่อดู p-value ลดลงจนปฏิเสธ H₀",
        "α = 0.05 คือค่ามาตรฐาน ถ้าเปลี่ยนเป็น 0.01 จะต้องมีหลักฐานแข็งกว่าจึงจะปฏิเสธ H₀",
        "สังเกตว่า 95% CI กว้างกว่า 90% CI เพราะต้องมั่นใจมากขึ้นจึงต้องครอบค่ามากขึ้น",
      ]}
      onRun={handleAddLog}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}

