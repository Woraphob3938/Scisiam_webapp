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

interface LoggedBayesianRun {
  index: number;
  prior: number;
  sensitivity: number;
  falsePositive: number;
  marginal: number;
  posterior: number;
}

export default function BayesianReasoningSimulation() {
  const labId = "bayesian-reasoning-lab";

  // Tab mode: "grid" (100-cell grid visualization) or "tree" (probability tree)
  const [activeTab, setActiveTab] = useState<"grid" | "tree">("grid");

  // Core Bayesian parameters
  const [prior, setPrior] = useState<number>(0.15); // P(H) - Prior probability of hypothesis (e.g. disease rate)
  const [sensitivity, setSensitivity] = useState<number>(0.85); // P(E|H) - True Positive Rate (Sensitivity)
  const [falsePositive, setFalsePositive] = useState<number>(0.10); // P(E|~H) - False Positive Rate

  const [loggedRuns, setLoggedRuns] = useState<LoggedBayesianRun[]>([]);

  // Bayes Calculations
  // P(H) = prior
  // P(~H) = 1 - prior
  // P(E|H) = sensitivity
  // P(~E|H) = 1 - sensitivity (False Negative Rate)
  // P(E|~H) = falsePositive
  // P(~E|~H) = 1 - falsePositive (Specificity)
  // Marginal Probability P(E) = P(E|H)P(H) + P(E|~H)P(~H)
  const marginal = useMemo(() => {
    return sensitivity * prior + falsePositive * (1.0 - prior);
  }, [prior, sensitivity, falsePositive]);

  // Posterior Probability P(H|E) = P(E|H)P(H) / P(E)
  const posterior = useMemo(() => {
    if (marginal === 0) return 0;
    return (sensitivity * prior) / marginal;
  }, [prior, sensitivity, marginal]);

  // SVG parameters
  const svgW = 480, svgH = 300;

  // Grid coordinates generation
  const gridCells = useMemo(() => {
    const cells = [];
    const total = 100;

    // Sort so true/false hypotheses and true/false positives are grouped
    // True Hypotheses count (Prior * 100)
    const trueHCount = Math.round(prior * total);

    // Within true hypotheses, true positives count (Sensitivity * trueHCount)
    const truePosCount = Math.round(sensitivity * trueHCount);

    // False Hypotheses count (100 - trueHCount)
    const falseHCount = total - trueHCount;
    // Within false hypotheses, false positives count (falsePositive * falseHCount)
    const falsePosCount = Math.round(falsePositive * falseHCount);

    for (let index = 0; index < total; index++) {
      // Coordinate layout
      const row = Math.floor(index / 10);
      const col = index % 10;
      const cx = 60 + col * 36;
      const cy = 40 + row * 24;

      // Group classification for dot coloring
      let type: "TP" | "FN" | "FP" | "TN" = "TN";
      if (index < truePosCount) {
        type = "TP"; // True Positive (Has Disease & Tests Positive)
      } else if (index < trueHCount) {
        type = "FN"; // False Negative (Has Disease & Tests Negative)
      } else if (index < trueHCount + falsePosCount) {
        type = "FP"; // False Positive (Healthy & Tests Positive)
      } else {
        type = "TN"; // True Negative (Healthy & Tests Negative)
      }

      cells.push({ index, cx, cy, type });
    }
    return cells;
  }, [prior, sensitivity, falsePositive]);

  // Quest Evaluation
  const questProgress = useMemo(() => {
    let p = 0;
    if (loggedRuns.length >= 1) p += 30;
    // Condition 1: Low prior disease, high sensitivity but significant false positive rate -> show that P(H|E) is surprisingly low
    const lowPriorHighFP = prior < 0.10 && falsePositive >= 0.10 && sensitivity >= 0.80;
    if (lowPriorHighFP) p += 40;
    // Condition 2: High specificity / low false positive rate increases posterior confidence
    const lowFP = falsePositive <= 0.02;
    if (lowFP) p += 30;
    return Math.min(100, p);
  }, [prior, falsePositive, sensitivity, loggedRuns]);

  const handleAddLog = () => {
    const run: LoggedBayesianRun = {
      index: loggedRuns.length + 1,
      prior,
      sensitivity,
      falsePositive,
      marginal,
      posterior,
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setPrior(0.15);
    setSensitivity(0.85);
    setFalsePositive(0.10);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุด\tPrior P(H)\tSensitivity P(E|H)\tFalse Positive P(E|~H)\tMarginal P(E)\tPosterior P(H|E)\n";
    const rows = loggedRuns.map(
      (r) => `${r.index}\t${r.prior.toFixed(4)}\t${r.sensitivity.toFixed(4)}\t${r.falsePositive.toFixed(4)}\t${r.marginal.toFixed(4)}\t${r.posterior.toFixed(4)}`
    );
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map(
      (r) => `${r.index},${r.prior},${r.sensitivity},${r.falsePositive},${r.marginal},${r.posterior}`
    );
    const csv = "data:text/csv;charset=utf-8," + ["Index,Prior,Sensitivity,FalsePositive,Marginal,Posterior", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "bayesian_reasoning_log.csv");
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
      localStorageKey: "scisiam_saved_bayesian_reasoning_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "Bayesian Reasoning Lab",
      variables: { prior, sensitivity, falsePositive },
      liveValues: { marginal, posterior, falseNegative: 1 - sensitivity, specificity: 1 - falsePositive },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.prior, y: r.posterior })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, maxPosterior: Math.max(...loggedRuns.map((r) => r.posterior)) },
      score: Math.min(100, Math.max(40, 40 + questProgress * 0.6)),
      durationSeconds: null,
    });
    alert("บันทึกผลการทดลองวิเคราะห์เบย์สำเร็จ");
  };

  return (
    <SharedSimulationShell
      accent="rose"
      labId={labId}
      category="Mathematics"
      title="Bayesian Reasoning Lab"
      subtitle="ทำความเข้าใจ Bayes' Theorem ผ่านวิชวลตารางประชากร ปลดล็อกความเข้าใจเรื่องการปรับปรุงโอกาสความเชื่อถือตามข้อมูลแวดล้อมใหม่"
      statusLabel={`Prior P(H) = ${(prior * 100).toFixed(0)}% | Posterior P(H|E) = ${(posterior * 100).toFixed(1)}%`}
      icon={LineChart}
      sceneTitle="Bayesian Probability Mapping"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-rose-100 bg-[linear-gradient(135deg,#fff8f8_0%,#fff1f2_48%,#fff7f6_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          {/* Mode tab switch */}
          <div className="relative z-10 mb-3 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans">
            <button
              onClick={() => setActiveTab("grid")}
              className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                activeTab === "grid" ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              ตารางตัวอย่าง (Grid View)
            </button>
            <button
              onClick={() => setActiveTab("tree")}
              className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                activeTab === "tree" ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              แผนภาพต้นไม้ (Tree View)
            </button>
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            {activeTab === "grid" ? (
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[480px] h-auto overflow-visible">
                {/* 10x10 Grid View */}
                {gridCells.map((cell) => {
                  let color = "#cbd5e1"; // TN: Light gray
                  let border = "transparent";

                  if (cell.type === "TP") {
                    color = "#f43f5e"; // TP: Rose (True Positive)
                    border = "#be123c";
                  } else if (cell.type === "FN") {
                    color = "#fbcfe8"; // FN: Pink (False Negative)
                    border = "#db2777";
                  } else if (cell.type === "FP") {
                    color = "#fda4af"; // FP: Light rose (False Positive)
                    border = "#e11d48";
                  }

                  return (
                    <g key={cell.index}>
                      <circle
                        cx={cell.cx}
                        cy={cell.cy}
                        r="9"
                        fill={color}
                        stroke={border}
                        strokeWidth="1"
                      />
                      <text
                        x={cell.cx}
                        y={cell.cy + 2.5}
                        fill={cell.type === "TN" ? "#64748b" : "#fff"}
                        fontSize="6"
                        fontWeight="black"
                        textAnchor="middle"
                      >
                        {cell.type}
                      </text>
                    </g>
                  );
                })}

                {/* Legend */}
                <g transform="translate(40, 275)">
                  <circle cx="10" cy="0" r="6" fill="#f43f5e" />
                  <text x="22" y="3" fill="#64748b" fontSize="8" fontWeight="bold">True Pos (TP)</text>

                  <circle cx="115" cy="0" r="6" fill="#fda4af" />
                  <text x="127" y="3" fill="#64748b" fontSize="8" fontWeight="bold">False Pos (FP)</text>

                  <circle cx="220" cy="0" r="6" fill="#fbcfe8" />
                  <text x="232" y="3" fill="#64748b" fontSize="8" fontWeight="bold">False Neg (FN)</text>

                  <circle cx="325" cy="0" r="6" fill="#cbd5e1" />
                  <text x="337" y="3" fill="#64748b" fontSize="8" fontWeight="bold">True Neg (TN)</text>
                </g>

                {/* Side box summing it up */}
                <g transform="translate(425, 40)">
                  <rect x="0" y="0" width="50" height="200" rx="6" fill="#fff" fillOpacity="0.8" stroke="#fda4af" strokeWidth="1" />
                  <text x="25" y="20" fill="#f43f5e" fontSize="8" fontWeight="black" textAnchor="middle">Positives</text>
                  <text x="25" y="32" fill="#be123c" fontSize="12" fontWeight="black" textAnchor="middle">
                    {gridCells.filter((c) => c.type === "TP" || c.type === "FP").length}
                  </text>
                  <line x1="10" y1="45" x2="40" y2="45" stroke="#fee2e2" />

                  <text x="25" y="65" fill="#db2777" fontSize="8" fontWeight="black" textAnchor="middle">Negatives</text>
                  <text x="25" y="77" fill="#9d174d" fontSize="12" fontWeight="black" textAnchor="middle">
                    {gridCells.filter((c) => c.type === "TN" || c.type === "FN").length}
                  </text>
                </g>
              </svg>
            ) : (
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[480px] h-auto overflow-visible">
                {/* Decision Tree Diagram */}
                <defs>
                  <marker id="arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                    <path d="M0,0 L6,2 L0,4 Z" fill="#94a3b8" />
                  </marker>
                </defs>

                {/* Root node */}
                <rect x="20" y="130" width="60" height="30" rx="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                <text x="50" y="148" fill="#475569" fontSize="9" fontWeight="black" textAnchor="middle">ประชากร</text>

                {/* Branches 1: Hypothesis vs ~Hypothesis */}
                <line x1="80" y1="135" x2="160" y2="75" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <text x="115" y="94" fill="#be123c" fontSize="8" fontWeight="black">P(H)={prior.toFixed(2)}</text>

                <line x1="80" y1="155" x2="160" y2="215" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <text x="110" y="200" fill="#64748b" fontSize="8" fontWeight="black">P(~H)={(1 - prior).toFixed(2)}</text>

                {/* Nodes level 1 */}
                <rect x="160" y="55" width="80" height="30" rx="6" fill="#ffe4e6" stroke="#fca5a5" strokeWidth="1" />
                <text x="200" y="73" fill="#be123c" fontSize="8" fontWeight="black" textAnchor="middle">Hypothesis (H)</text>

                <rect x="160" y="205" width="80" height="30" rx="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                <text x="200" y="223" fill="#475569" fontSize="8" fontWeight="black" textAnchor="middle">~Hypothesis (~H)</text>

                {/* Branches level 2 (from H) */}
                <line x1="240" y1="65" x2="310" y2="35" stroke="#f43f5e" strokeWidth="1.2" markerEnd="url(#arrow)" />
                <text x="250" y="44" fill="#b91c1c" fontSize="7" fontWeight="bold">P(E|H)={sensitivity.toFixed(2)}</text>

                <line x1="240" y1="75" x2="310" y2="105" stroke="#db2777" strokeWidth="1.2" markerEnd="url(#arrow)" />
                <text x="250" y="102" fill="#9d174d" fontSize="7" fontWeight="bold">P(~E|H)={(1 - sensitivity).toFixed(2)}</text>

                {/* Branches level 2 (from ~H) */}
                <line x1="240" y1="215" x2="310" y2="185" stroke="#f43f5e" strokeWidth="1.2" markerEnd="url(#arrow)" />
                <text x="250" y="195" fill="#b91c1c" fontSize="7" fontWeight="bold">P(E|~H)={falsePositive.toFixed(2)}</text>

                <line x1="240" y1="225" x2="310" y2="255" stroke="#64748b" strokeWidth="1.2" markerEnd="url(#arrow)" />
                <text x="250" y="250" fill="#475569" fontSize="7" fontWeight="bold">P(~E|~H)={(1 - falsePositive).toFixed(2)}</text>

                {/* Leaf nodes */}
                {/* 1. H and E */}
                <rect x="310" y="15" width="130" height="32" rx="4" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
                <text x="375" y="27" fill="#fff" fontSize="7" fontWeight="black" textAnchor="middle">
                  TP: P(H ∩ E) = {(prior * sensitivity).toFixed(4)}
                </text>
                <text x="375" y="39" fill="#ffe4e6" fontSize="6.5" textAnchor="middle">True Positive</text>

                {/* 2. H and ~E */}
                <rect x="310" y="85" width="130" height="32" rx="4" fill="#fbcfe8" stroke="#fff" strokeWidth="1" />
                <text x="375" y="97" fill="#9d174d" fontSize="7" fontWeight="black" textAnchor="middle">
                  FN: P(H ∩ ~E) = {(prior * (1 - sensitivity)).toFixed(4)}
                </text>
                <text x="375" y="109" fill="#db2777" fontSize="6.5" textAnchor="middle">False Negative</text>

                {/* 3. ~H and E */}
                <rect x="310" y="165" width="130" height="32" rx="4" fill="#fda4af" stroke="#fff" strokeWidth="1" />
                <text x="375" y="177" fill="#9f1239" fontSize="7" fontWeight="black" textAnchor="middle">
                  FP: P(~H ∩ E) = {((1 - prior) * falsePositive).toFixed(4)}
                </text>
                <text x="375" y="189" fill="#b91c1c" fontSize="6.5" textAnchor="middle">False Positive</text>

                {/* 4. ~H and ~E */}
                <rect x="310" y="235" width="130" height="32" rx="4" fill="#cbd5e1" stroke="#fff" strokeWidth="1" />
                <text x="375" y="247" fill="#475569" fontSize="7" fontWeight="black" textAnchor="middle">
                  TN: P(~H ∩ ~E) = {((1 - prior) * (1 - falsePositive)).toFixed(4)}
                </text>
                <text x="375" y="259" fill="#64748b" fontSize="6.5" textAnchor="middle">True Negative</text>
              </svg>
            )}
          </div>
        </div>
      }
      controlsTitle="ปรับเปลี่ยนความน่าจะเป็นเริ่มต้น"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-rose-500" />
              ปัจจัยความน่าจะเป็น (Bayesian Parameters)
            </h3>
            <ManualNumberInput
              label="ความน่าจะเป็นก่อนหน้า P(H) (Prior)"
              ariaLabel="ความน่าจะเป็นก่อนหน้า P(H)"
              value={prior}
              min={0.01}
              max={0.99}
              step={0.01}
              onChange={setPrior}
              tone="pink"
            />
            <ManualNumberInput
              label="ความไวของการทดสอบ P(E|H) (Sensitivity)"
              ariaLabel="ความไว P(E|H)"
              value={sensitivity}
              min={0.05}
              max={1.00}
              step={0.01}
              onChange={setSensitivity}
              tone="pink"
            />
            <ManualNumberInput
              label="อัตราผลบวกลวง P(E|~H) (False Positive Rate)"
              ariaLabel="อัตราผลบวกลวง P(E|~H)"
              value={falsePositive}
              min={0.00}
              max={0.95}
              step={0.01}
              onChange={setFalsePositive}
              tone="orange"
            />
          </section>

          {/* Action shortcuts */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => { setPrior(0.01); setSensitivity(0.99); setFalsePositive(0.05); }}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              โรคหายาก (Medical Paradox)
            </button>
            <button
              onClick={() => { setPrior(0.50); setSensitivity(0.90); setFalsePositive(0.10); }}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              ความน่าจะเป็นกึ่งหนึ่ง (50/50)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-97 cursor-pointer"
            >
              <ClipboardList className="h-3.5 w-3.5 text-rose-500" />
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
        <div className="flex items-center gap-2 font-sans flex-wrap">
          <ManualNumberInput label="P(H)" ariaLabel="Prior" value={prior} min={0.01} max={0.99} step={0.05} onChange={setPrior} tone="pink" />
          <ManualNumberInput label="P(E|H)" ariaLabel="Sensitivity" value={sensitivity} min={0.5} max={1} step={0.05} onChange={setSensitivity} tone="pink" />
        </div>
      }
      metrics={[
        { label: "ความน่าจะเป็นก่อนหน้า P(H)", value: prior.toFixed(4), tone: "rose" },
        { label: "การทดสอบเป็นบวก P(E)", value: marginal.toFixed(4), tone: "orange" },
        { label: "โอกาสเกิดจริงหลังพบหลักฐาน P(H|E)", value: posterior.toFixed(4), tone: "rose" },
        { label: "โอกาสไม่เกิดจริงหลังพบหลักฐาน P(~H|E)", value: (1 - posterior).toFixed(4), tone: undefined },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-rose-600" />
              Bayesian Ratio (ความสัมพันธ์ Prior vs Posterior)
            </h3>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <svg viewBox="0 0 400 200" className="w-full max-w-[400px] h-auto">
              {/* Simple chart drawing prior vs posterior */}
              <line x1="40" y1="160" x2="360" y2="160" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="40" y1="30" x2="40" y2="160" stroke="#cbd5e1" strokeWidth="1" />

              <text x="200" y="185" fill="#64748b" fontSize="8.5" fontWeight="bold" textAnchor="middle">Prior Probability P(H)</text>
              <text x="14" y="95" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle" transform="rotate(-90,14,95)">Posterior P(H|E)</text>

              {/* Draw theoretical curve of posterior = (sensitivity * x) / (sensitivity * x + falsePositive * (1-x)) */}
              {(() => {
                const points = [];
                for (let i = 0; i <= 20; i++) {
                  const xVal = i * 0.05;
                  const marg = sensitivity * xVal + falsePositive * (1.0 - xVal);
                  const post = marg === 0 ? 0 : (sensitivity * xVal) / marg;
                  const cx = 40 + xVal * 320;
                  const cy = 160 - post * 130;
                  points.push(`${cx},${cy}`);
                }
                return <polyline fill="none" stroke="#f43f5e" strokeWidth="2.2" points={points.join(" ")} />;
              })()}

              {/* Highlight current point */}
              <circle cx={40 + prior * 320} cy={160 - posterior * 130} r="6.5" fill="#e11d48" stroke="#fff" strokeWidth="2" />
              <text x={40 + prior * 320} y={160 - posterior * 130 - 10} fill="#be123c" fontSize="7" fontWeight="bold" textAnchor="middle">
                ({prior.toFixed(2)}, {posterior.toFixed(2)})
              </text>
            </svg>
          </div>
        </section>
      }
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">ทฤษฎีบทของเบย์ (Bayes&apos; Theorem)</p>
          <p className="mb-3">
            ช่วยหาความน่าจะเป็นที่มีเงื่อนไข (Conditional Probability) โดยอัปเดตความเชื่อใหม่เมื่อได้รับข้อมูลหรือหลักฐานเพิ่มเติม:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>สูตร:</strong> {"$P(H|E) = \\frac{P(E|H) \\cdot P(H)}{P(E)}$"}
            </li>
            <li>
              <strong>Prior $P(H)$:</strong> ความน่าจะเป็นเริ่มต้นที่จะเกิดสมมติฐานก่อนจะได้รับหลักฐาน
            </li>
            <li>
              <strong>Likelihood $P(E|H)$:</strong> โอกาสเกิดหลักฐาน $E$ เมื่อสมมติฐาน $H$ เป็นจริง
            </li>
            <li>
              <strong>Posterior $P(H|E)$:</strong> ความน่าจะเป็นที่อัปเดตแล้วหลังจากได้รับหลักฐาน $E$
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
                ตารางบันทึกรายงานผลการวิเคราะห์เบย์
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
                ยังไม่มีการบันทึกข้อมูล กดปุ่ม &quot;บันทึกจุดวัด&quot; ด้านซ้าย
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-2.5 text-center">ชุดที่</th>
                      <th className="p-2.5">Prior P(H)</th>
                      <th className="p-2.5">Sensitivity P(E|H)</th>
                      <th className="p-2.5">False Positive P(E|~H)</th>
                      <th className="p-2.5">Marginal P(E)</th>
                      <th className="p-2.5 text-right">Posterior P(H|E)</th>
                      <th className="p-2.5 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                    {loggedRuns.map((run) => (
                      <tr key={run.index} className="hover:bg-rose-50/20 transition-colors">
                        <td className="p-2 text-center font-bold">{run.index}</td>
                        <td className="p-2">{run.prior.toFixed(4)}</td>
                        <td className="p-2">{run.sensitivity.toFixed(4)}</td>
                        <td className="p-2">{run.falsePositive.toFixed(4)}</td>
                        <td className="p-2">{run.marginal.toFixed(4)}</td>
                        <td className="p-2 text-right font-bold text-slate-800">{run.posterior.toFixed(4)}</td>
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
        "เรียนรู้ความหมายของ Prior, Likelihood, Marginal และ Posterior ใน Bayes' theorem",
        "ทำความเข้าใจผลกระทบของคุณลักษณะเครื่องมือทดสอบ (Sensitivity / False Positive Rate) ต่อโอกาสความจริงใจ",
        "อธิบายปรากฏการณ์สมมติฐานลวงของการตรวจโรคหายาก (False Positive Paradox)",
      ]}
      steps={[
        { label: "เลือกสลับระหว่างมุมมองตารางประชากรกับแผนผังต้นไม้ความน่าจะเป็น", icon: Layers },
        { label: "ปรับสไลด์เพื่อเปลี่ยนอัตราการเกิดโรคเบื้องต้น (Prior)", icon: Sliders },
        { label: "ปรับอัตราการทดสอบที่ผิดพลาดและตรวจพบได้ตรงประเด็น", icon: Target },
        { label: "บันทึกผลการจำลองลงตารางรายงานผลการทดลอง", icon: ClipboardList },
      ]}
      progressLabel="ความคืบหน้าการศึกษาแบบเบย์"
      progressValue={
        questProgress === 100
          ? "บรรลุการวิเคราะห์ทฤษฎีบทเบย์โดยสมบูรณ์"
          : questProgress >= 50
          ? "ทดลองได้ถูกเงื่อนไขบางส่วน"
          : "ยังไม่บรรลุภารกิจกิจกรรม"
      }
      progressPercent={questProgress}
      tips={[
        "สังเกตว่าโรคบางชนิดที่หายากมากๆ (เช่น 1%) แม้ผลตรวจแม่นยำสูง (95%) แต่ผลตรวจบวกยังมีโอกาสเป็นโรคจริงไม่ถึง 20% เนื่องจากมีจำนวน False Positive สูงกว่าผู้ที่เป็นโรคจริง",
        "ลองลด False Positive Rate ให้ใกล้ศูนย์ และสังเกตการลู่ขึ้นอย่างมีนัยสำคัญของผลลัพธ์ Posterior P(H|E)",
        "ความหมายทางกายภาพ: ข้อมูลหลักฐานใหม่ช่วยล้างความคลุมเครือที่มีอยู่เดิมให้เห็นความเด่นชัด",
      ]}
      onRun={handleAddLog}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
