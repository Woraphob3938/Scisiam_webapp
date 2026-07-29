"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  RotateCcw,
  Sliders,
  Download,
  Clipboard,
  ClipboardList,
  Target,
  Trash,
  Sparkles,
  Layers,
  LineChart,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

// Numerical approximation of the cumulative distribution function (CDF) for standard normal
function stdNormalCDF(z: number): number {
  // Abramowitz & Stegun approximation
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804; // 1 / sqrt(2pi)
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;

  const poly = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
  const prob = 1.0 - d * Math.exp(-z * z / 2.0) * poly;
  return z >= 0 ? prob : 1.0 - prob;
}

function normalCDF(x: number, mean: number, sd: number): number {
  return stdNormalCDF((x - mean) / sd);
}

// Probability Density Function (PDF)
function normalPDF(x: number, mean: number, sd: number): number {
  const diff = x - mean;
  const exponent = - (diff * diff) / (2 * sd * sd);
  return (1.0 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

interface LoggedNormDist {
  index: number;
  mean: number;
  sd: number;
  x1: number;
  x2: number;
  probability: number;
  mode: "curve" | "galton";
  totalBalls?: number;
}

interface GaltonBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  row: number; // current row of pegs
  currentCol: number; // column index (how many right turns)
  state: "falling" | "stacked";
  settledBin?: number;
  path: number[]; // sequence of choices: 0 (left), 1 (right)
}

export default function NormalDistributionSimulation() {
  const labId = "normal-distribution";

  // Mode Selection: "curve" (Normal Curve & Probability Area) vs "galton" (Galton Board)
  const [activeTab, setActiveTab] = useState<"curve" | "galton">("curve");

  // Core Normal Distribution Parameters
  const [mean, setMean] = useState<number>(0.0);
  const [sd, setSd] = useState<number>(1.5);

  // Interval bounds for shading probability
  const [x1, setX1] = useState<number>(-1.5);
  const [x2, setX2] = useState<number>(1.5);

  // Galton Board states
  const [ballsCount, setBallsCount] = useState<number>(200);
  const [droppedBalls, setDroppedBalls] = useState<number>(0);
  const [binCounts, setBinCounts] = useState<number[]>(new Array(11).fill(0));
  const [activeBalls, setActiveBalls] = useState<GaltonBall[]>([]);
  const [isSimulatingGalton, setIsSimulatingGalton] = useState<boolean>(false);

  // Logging & Quest
  const [loggedRuns, setLoggedRuns] = useState<LoggedNormDist[]>([]);

  // Calculate area under curve between x1 and x2
  const probability = useMemo(() => {
    if (x1 > x2) return 0;
    return normalCDF(x2, mean, sd) - normalCDF(x1, mean, sd);
  }, [mean, sd, x1, x2]);

  const handleX1Change = (value: number) => {
    setX1(value);
    setX2((current) => Math.max(current, value));
  };

  const handleX2Change = (value: number) => {
    setX2(value);
    setX1((current) => Math.min(current, value));
  };

  // Handle Quest calculation
  // Quest 1: Match standard Empirical Rule (Mean 0, SD 1.5, x1 = -1.5, x2 = 1.5 -> which is exactly 1-sigma, or +/- 1 SD)
  // Let's set the quest challenge: Verify the Empirical Rule (68% within 1 SD, 95% within 2 SD, or 99.7% within 3 SD)
  const questProgress = useMemo(() => {
    let progress = 0;
    // Check if bounds represent approximately [mean - sd, mean + sd]
    const dev1 = Math.abs(x1 - (mean - sd));
    const dev2 = Math.abs(x2 - (mean + sd));
    if (dev1 < 0.1 && dev2 < 0.1) {
      // Correctly selected the 68% (1 SD) region!
      progress += 50;
    }
    // Check if they ran the Galton Board with at least 300 total balls dropped
    if (droppedBalls >= 300) {
      progress += 50;
    }
    return progress;
  }, [mean, sd, x1, x2, droppedBalls]);

  // Generate path points for SVG Normal Distribution Curve
  const svgCurvePoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    const minX = -10;
    const maxX = 10;
    const step = 0.2;

    for (let x = minX; x <= maxX; x += step) {
      const y = normalPDF(x, mean, sd);
      points.push({ x, y });
    }
    return points;
  }, [mean, sd]);

  // Mapping coordinate system to SVG viewBox (480x320)
  // X: -10 -> 10 maps to 40 -> 440 (width = 400)
  // Y: 0 -> 1.2 maps to 280 -> 20 (height = 260)
  const xToSvg = (x: number) => 40 + ((x - (-10)) / 20) * 400;
  const yToSvg = (y: number) => 280 - (y / 1.0) * 250; // max expected PDF height is 1.0

  // Shaded area path
  const shadedAreaPath = useMemo(() => {
    if (x1 >= x2) return "";
    const minX = Math.max(-10, x1);
    const maxX = Math.min(10, x2);
    const step = 0.1;
    let path = `M ${xToSvg(minX)} ${yToSvg(0)}`;

    for (let x = minX; x <= maxX; x += step) {
      const y = normalPDF(x, mean, sd);
      path += ` L ${xToSvg(x)} ${yToSvg(y)}`;
    }
    path += ` L ${xToSvg(maxX)} ${yToSvg(0)} Z`;
    return path;
  }, [mean, sd, x1, x2]);

  // Galton Board setup constants
  const ROWS = 9; // Rows of pegs
  const BINS_COUNT = 11; // Accumulating bins
  const PEG_SPACING_X = 26;
  const PEG_SPACING_Y = 20;
  const START_X = 240;
  const START_Y = 40;

  // Compute positions of pins
  const pegPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      const rowY = START_Y + r * PEG_SPACING_Y;
      const count = r + 1;
      const startX = START_X - ((count - 1) * PEG_SPACING_X) / 2;
      for (let c = 0; c < count; c++) {
        positions.push({
          x: startX + c * PEG_SPACING_X,
          y: rowY,
        });
      }
    }
    return positions;
  }, []);

  // Dropping simulation ticker using requestAnimationFrame
  const animationFrameId = useRef<number | null>(null);
  const activeBallsRef = useRef<GaltonBall[]>([]);

  useEffect(() => {
    activeBallsRef.current = activeBalls;
  }, [activeBalls]);

  // Function to drop a batch of balls
  const handleDropBalls = (count: number) => {
    if (isSimulatingGalton) return;
    setIsSimulatingGalton(true);
    setDroppedBalls((prev) => prev + count);

    const newBinCounts = [...binCounts];
    const delayBetweenBalls = 40; // ms
    let ballsRemaining = count;
    let ballIdCounter = 0;

    const interval = setInterval(() => {
      if (ballsRemaining <= 0) {
        clearInterval(interval);
        return;
      }

      // Generate a ball path beforehand to make it stable
      // At each row, the ball goes left (0) or right (1) with 50-50 probability
      const path: number[] = [];
      let finalCol = 0;
      for (let r = 0; r < ROWS; r++) {
        // Skew choices slightly based on mean to show distribution shifts!
        // Standard normal: 0.5 probability. Positive mean: shifts right. Negative: shifts left.
        const rightProb = 0.5 + (mean / 10.0);
        const choice = Math.random() < rightProb ? 1 : 0;
        path.push(choice);
        if (choice === 1) finalCol++;
      }

      const newBall: GaltonBall = {
        id: Date.now() + ballIdCounter++,
        x: START_X + (Math.random() - 0.5) * 4,
        y: START_Y - 15,
        vx: 0,
        vy: 2,
        row: -1,
        currentCol: 0,
        state: "falling",
        settledBin: finalCol,
        path,
      };

      setActiveBalls((prev) => [...prev, newBall]);
      ballsRemaining--;
    }, delayBetweenBalls);

    // Physics update loop
    let lastTime = performance.now();
    const updatePhysics = (time: number) => {
      const delta = (time - lastTime) / 16;
      lastTime = time;

      let hasActive = false;
      const currentActive = [...activeBallsRef.current];

      const updated = currentActive.map((ball) => {
        if (ball.state === "stacked") return ball;

        hasActive = true;
        // Basic falling math physics with bounciness
        const nextY = ball.y + ball.vy * delta;
        const nextX = ball.x + ball.vx * delta;
        let nextVy = ball.vy + 0.3 * delta; // gravity
        let nextVx = ball.vx * 0.98; // friction

        // Peg collision check
        let nextRow = ball.row;
        let nextCol = ball.currentCol;

        // Check if passed a peg row level
        const rowThreshold = ball.row + 1;
        if (rowThreshold < ROWS) {
          const rowY = START_Y + rowThreshold * PEG_SPACING_Y;
          if (ball.y < rowY && nextY >= rowY) {
            // Reached this row level, snap X directions based on path choice
            nextRow = rowThreshold;
            const choice = ball.path[nextRow];
            nextCol = ball.currentCol + choice;

            // Apply horizontal bounce velocity
            nextVx = (choice === 1 ? 1.5 : -1.5) + (Math.random() - 0.5) * 0.4;
            nextVy = 1.2; // dampen vertical velocity on bounce
          }
        } else {
          // Bottom bins logic
          const binsY = START_Y + ROWS * PEG_SPACING_Y + 15;
          if (nextY >= binsY) {
            ball.state = "stacked";
            const targetBin = Math.max(0, Math.min(BINS_COUNT - 1, ball.settledBin || 0));
            newBinCounts[targetBin] = newBinCounts[targetBin] + 1;
            setBinCounts([...newBinCounts]);
            return {
              ...ball,
              x: 110 + targetBin * 26 + 13,
              y: 280 - 6,
              state: "stacked" as const,
            };
          }
        }

        return {
          ...ball,
          x: nextX,
          y: nextY,
          vx: nextVx,
          vy: nextVy,
          row: nextRow,
          currentCol: nextCol,
        };
      });

      // Filter out settled balls from animation to prevent rendering overload
      const stillFalling = updated.filter((b) => b.state === "falling");
      setActiveBalls(stillFalling);

      if (hasActive || ballsRemaining > 0) {
        animationFrameId.current = requestAnimationFrame(updatePhysics);
      } else {
        setIsSimulatingGalton(false);
      }
    };

    animationFrameId.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const handleAddLog = () => {
    const newLog: LoggedNormDist = {
      index: loggedRuns.length + 1,
      mean,
      sd,
      x1,
      x2,
      probability,
      mode: activeTab,
      totalBalls: activeTab === "galton" ? droppedBalls : undefined,
    };
    setLoggedRuns((prev) => [...prev, newLog]);
  };

  const handleClearLog = (index: number) => {
    setLoggedRuns((prev) => prev.filter((item) => item.index !== index));
  };

  const handleReset = () => {
    setMean(0.0);
    setSd(1.5);
    setX1(-1.5);
    setX2(1.5);
    setBinCounts(new Array(11).fill(0));
    setDroppedBalls(0);
    setActiveBalls([]);
    setLoggedRuns([]);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsSimulatingGalton(false);
  };

  const handleCopyData = () => {
    if (loggedRuns.length === 0) {
      alert("ยังไม่มีข้อมูลบันทึก");
      return;
    }
    const content = loggedRuns
      .map(
        (r) =>
          `Run #${r.index}: Mean=${r.mean}, SD=${r.sd}, Range=[${r.x1}, ${r.x2}], Probability=${(
            r.probability * 100
          ).toFixed(2)}% (${r.mode === "galton" ? `Galton, dropped ${r.totalBalls} balls` : "Curve Analysis"})`
      )
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกข้อมูลแล้ว"));
  };

  const handleExportCSV = () => {
    if (loggedRuns.length === 0) {
      alert("ยังไม่มีข้อมูลบันทึก");
      return;
    }
    const headers = "index,mean,sd,x1,x2,probability,mode,total_balls\n";
    const rows = loggedRuns
      .map(
        (r) =>
          `${r.index},${r.mean},${r.sd},${r.x1},${r.x2},${r.probability},${r.mode},${r.totalBalls || ""}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "normal_distribution_experiments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveResults = async () => {
    if (loggedRuns.length === 0) {
      alert("กรุณากดบันทึกผลการจำลองอย่างน้อย 1 ครั้งก่อนบันทึกรายงานการทดลอง");
      return;
    }

    const experimentData = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      mean,
      sd,
      x1,
      x2,
      probability,
      binCounts,
      droppedBalls,
      loggedRuns,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_normal_distribution_experiment",
      localPayload: experimentData,
      labId,
      title: "Normal Distribution Lab",
      variables: { mean, sd, x1, x2 },
      liveValues: { probability, droppedBalls, questProgress },
      graphPoints: loggedRuns.map((r) => ({
        index: r.index,
        x: r.mean,
        y: r.probability,
        sd: r.sd,
      })),
      tableRows: loggedRuns,
      summary: {
        runsCount: loggedRuns.length,
        maxProb: Math.max(...loggedRuns.map((r) => r.probability)),
        totalDropped: droppedBalls,
      },
      score: Math.min(100, Math.max(40, 40 + questProgress * 0.6)),
      durationSeconds: null,
    });

  };

  // Bin bar rendering parameters
  const maxBinCount = Math.max(1, ...binCounts);

  return (
    <SharedSimulationShell
      accent="violet"
      labId={labId}
      category="Mathematics"
      title="Normal Distribution Lab"
      subtitle="สำรวจสมบัติของการแจกแจงปกติ (โค้งระฆังคว่ำ) ปรับค่าเฉลี่ยและส่วนเบี่ยงเบนมาตรฐาน ค้นหาความสัมพันธ์ผ่านกระดานกัลตันจำลอง"
      statusLabel={`ความน่าจะเป็นในขอบเขต: ${(probability * 100).toFixed(2)}%`}
      icon={LineChart}
      sceneTitle="วิชวลจำลองสถิติและการกระจายตัว"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-[linear-gradient(135deg,#fcfdff_0%,#f5f8ff_50%,#faf5ff_100%)] p-4 select-none">
          {/* Background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-60" />

          {/* Mode Tabs */}
          <div className="relative z-20 mb-4 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans">
            <button
              onClick={() => setActiveTab("curve")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "curve"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LineChart className="h-3.5 w-3.5" />
              โค้งระฆังคว่ำ (PDF Curve)
            </button>
            <button
              onClick={() => setActiveTab("galton")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "galton"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              กระดานกัลตัน (Galton Board)
            </button>
          </div>

          {/* Simulation Stage Viewport */}
          <div className="relative flex-grow flex items-center justify-center">
            {activeTab === "curve" ? (
              // Curve mode
              <svg className="w-full max-w-[460px] h-64 relative z-10" viewBox="0 0 480 320">
                {/* Math axes */}
                <line x1="40" y1="280" x2="440" y2="280" stroke="#475569" strokeWidth="2.5" />
                <line x1="240" y1="20" x2="240" y2="290" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />

                {/* X Axis Labels */}
                {[-10, -5, 0, 5, 10].map((val) => (
                  <g key={val} transform={`translate(${xToSvg(val)}, 295)`}>
                    <line x1="0" y1="-15" x2="0" y2="0" stroke="#475569" strokeWidth="1.5" />
                    <text fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {val}
                    </text>
                  </g>
                ))}

                {/* Shaded Area */}
                {shadedAreaPath && (
                  <path
                    d={shadedAreaPath}
                    fill="url(#indigo-glow-gradient)"
                    opacity="0.35"
                    stroke="#4f46e5"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                )}

                {/* Main Normal Curve */}
                <path
                  d={`M ${svgCurvePoints.map((p) => `${xToSvg(p.x)},${yToSvg(p.y)}`).join(" L ")}`}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Helper Shaded Range Limits markers */}
                <line
                  x1={xToSvg(x1)}
                  y1={yToSvg(0)}
                  x2={xToSvg(x1)}
                  y2={yToSvg(normalPDF(x1, mean, sd))}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                />
                <circle cx={xToSvg(x1)} cy={yToSvg(normalPDF(x1, mean, sd))} r="4" fill="#ef4444" />

                <line
                  x1={xToSvg(x2)}
                  y1={yToSvg(0)}
                  x2={xToSvg(x2)}
                  y2={yToSvg(normalPDF(x2, mean, sd))}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                />
                <circle cx={xToSvg(x2)} cy={yToSvg(normalPDF(x2, mean, sd))} r="4" fill="#10b981" />

                {/* Bounds Text Labels */}
                <text x={xToSvg(x1)} y="315" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">
                  x1 = {x1.toFixed(1)}
                </text>
                <text x={xToSvg(x2)} y="315" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">
                  x2 = {x2.toFixed(1)}
                </text>

                {/* Defs for gradients */}
                <defs>
                  <linearGradient id="indigo-glow-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#c7d2fe" />
                  </linearGradient>
                </defs>
              </svg>
            ) : (
              // Galton Board Mode
              <svg className="w-full max-w-[460px] h-64 relative z-10" viewBox="0 0 480 320">
                {/* Pins/Pegs */}
                {pegPositions.map((peg, idx) => (
                  <circle key={idx} cx={peg.x} cy={peg.y} r="2.5" fill="#64748b" />
                ))}

                {/* Bins slots at the bottom */}
                <line x1="110" y1="280" x2="370" y2="280" stroke="#334155" strokeWidth="3" />
                {Array.from({ length: BINS_COUNT + 1 }).map((_, idx) => {
                  const x = 110 + idx * 26;
                  return (
                    <line
                      key={idx}
                      x1={x}
                      y1="250"
                      x2={x}
                      y2="280"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Accumulated Bin Blocks */}
                {binCounts.map((count, idx) => {
                  if (count === 0) return null;
                  const x = 110 + idx * 26 + 2.5;
                  // Scale block height relative to max accumulated counts
                  const maxHeight = 30; // max visible height in px
                  const height = (count / maxBinCount) * maxHeight;
                  return (
                    <rect
                      key={idx}
                      x={x}
                      y={280 - height}
                      width="21"
                      height={height}
                      fill="#818cf8"
                      rx="2"
                      opacity="0.8"
                    />
                  );
                })}

                {/* Active Falling Balls */}
                {activeBalls.map((ball) => (
                  <circle
                    key={ball.id}
                    cx={ball.x}
                    cy={ball.y}
                    r="3.5"
                    fill="#4f46e5"
                    stroke="#ffffff"
                    strokeWidth="0.5"
                  />
                ))}

                {/* Expected binomial envelope curve overlay */}
                <path
                  d={`M ${Array.from({ length: 11 }).map((_, idx) => {
                    const x = 110 + idx * 26 + 13;
                    // Standard binomial coeff distribution centered at 5
                    // P(k) = (10 choose k) * (0.5)^10
                    const coeff = [1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1][idx];
                    const binomialProb = coeff / 1024;
                    // Scale to match height
                    const y = 280 - binomialProb * 120;
                    return `${x},${y}`;
                  }).join(" L ")}`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />

                {/* Funnel on top */}
                <path
                  d="M 220 15 L 235 25 L 235 30 L 245 30 L 245 25 L 260 15"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2.5"
                />

                <text x="240" y="310" fill="#64748b" fontSize="9" fontWeight="extrabold" textAnchor="middle">
                  ลูกบอลตกสะสมแล้ว: {droppedBalls} ลูก
                </text>
              </svg>
            )}

            {/* Display overlay variables info */}
            <div className="absolute top-2 right-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-right shadow-sm backdrop-blur-md z-10 font-sans text-[11px] leading-relaxed">
              <span className="block font-bold text-slate-700">พารามิเตอร์การแจกแจง:</span>
              <span className="block text-indigo-600 font-mono">Mean (μ): {mean.toFixed(1)}</span>
              <span className="block text-violet-600 font-mono">SD (σ): {sd.toFixed(2)}</span>
            </div>
          </div>
        </div>
      }
      controlsTitle="ปรับแต่งพารามิเตอร์การแจกแจง"
      controls={
        <div className="flex flex-col gap-6 font-sans">
          {/* Normal distribution variables */}
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-indigo-500" />
              กำหนดตัวแปรฟังก์ชัน
            </h3>

            <div className="flex flex-col gap-4">
              <ManualNumberInput
                label="ค่าเฉลี่ย (μ - Mean)"
                ariaLabel="ค่าเฉลี่ย (μ - Mean)"
                value={mean}
                min={-5}
                max={5}
                step={0.1}
                onChange={setMean}
                tone="blue"
              />
              <ManualNumberInput
                label="ส่วนเบี่ยงเบนมาตรฐาน (σ - SD)"
                ariaLabel="ส่วนเบี่ยงเบนมาตรฐาน (σ - SD)"
                value={sd}
                min={0.2}
                max={3.0}
                step={0.1}
                onChange={setSd}
                tone="violet"
              />
            </div>
          </section>

          {/* Shading Bounds (Only visible in Curve Tab) */}
          {activeTab === "curve" ? (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Target className="h-4.5 w-4.5 text-indigo-500" />
                กำหนดขอบเขตพื้นที่ความน่าจะเป็น
              </h3>
              <div className="flex flex-col gap-4">
                <ManualNumberInput
                  label="ขอบเขตล่าง (x1)"
                  ariaLabel="ขอบเขตล่าง (x1)"
                  value={x1}
                  min={-10}
                  max={10}
                  step={0.1}
                  onChange={handleX1Change}
                  tone="pink"
                />
                <ManualNumberInput
                  label="ขอบเขตบน (x2)"
                  ariaLabel="ขอบเขตบน (x2)"
                  value={x2}
                  min={-10}
                  max={10}
                  step={0.1}
                  onChange={handleX2Change}
                  tone="emerald"
                />
              </div>
            </section>
          ) : (
            // Galton Board controls (Only visible in Galton Tab)
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Play className="h-4.5 w-4.5 text-indigo-500" />
                ปล่อยลูกบอลกระดานกัลตัน
              </h3>
              <div className="flex flex-col gap-3">
                <ManualNumberInput
                  label="จำนวนลูกบอล (ลูก)"
                  ariaLabel="จำนวนลูกบอล"
                  value={ballsCount}
                  min={10}
                  max={1000}
                  step={10}
                  onChange={setBallsCount}
                  tone="blue"
                />
                <button
                  onClick={() => handleDropBalls(ballsCount)}
                  disabled={isSimulatingGalton}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-200 px-4 py-2.5 text-sm font-black text-pink-900 shadow-md transition-all hover:bg-pink-300 active:scale-98 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  {isSimulatingGalton ? "กำลังปล่อย..." : "ปล่อยลูกบอล"}
                </button>
              </div>
            </section>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-97"
            >
              <Clipboard className="h-3.5 w-3.5 text-indigo-500" />
              บันทึกจุดวัด
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-rose-600 shadow-sm transition-all hover:bg-rose-50/50 hover:text-rose-700 active:scale-97"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              รีเซ็ตค่า
            </button>
          </div>

          <button
            onClick={handleSaveResults}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-md shadow-emerald-600/10 transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-98"
          >
            ส่งรายงานการทดลอง
          </button>
        </div>
      }
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-semibold text-slate-800">การแจกแจงปกติ (Normal Distribution หรือ Gaussian Distribution)</p>
          <p className="mb-3">
            เป็นหนึ่งในการแจกแจงความน่าจะเป็นที่สำคัญที่สุดในทางสถิติ ข้อมูลส่วนใหญ่ในธรรมชาติมักมีการแจกแจงแบบโค้งระฆังคว่ำ (Bell Curve)
            เช่น ส่วนสูงของประชากร, ความคลาดเคลื่อนจากการวัดของเซนเซอร์, หรือคะแนนสอบของนักเรียน
          </p>
          <p className="mb-3 font-semibold text-slate-800">สูตรฟังก์ชันความหนาแน่นความน่าจะเป็น (PDF):</p>
          <div className="my-4 rounded-xl bg-slate-50 p-3 text-center font-mono text-xs font-bold text-indigo-700">
            {"f(x) = [1 / (σ√(2π))] * e^[-(x - μ)² / (2σ²)]"}
          </div>
          <ul className="list-disc pl-5 flex flex-col gap-2.5 mt-2">
            <li><strong>μ (Mean):</strong> ค่าเฉลี่ยของข้อมูล กำหนดจุดศูนย์กลางสูงสุดของโค้ง</li>
            <li><strong>σ (Standard Deviation):</strong> ส่วนเบี่ยงเบนมาตรฐาน กำหนดความกว้างหรือการกระจายตัวของโค้ง ค่า σ น้อยทำให้โค้งสูงชันและแคบลง ค่า σ มากทำให้โค้งเตี้ยและกระจายกว้างออก</li>
            <li><strong>พื้นที่ใต้โค้งทั้งหมด:</strong> จะมีค่ารวมกันเท่ากับ 1.0 (หรือ 100%) เสมอ</li>
            <li><strong>Empirical Rule (กฎ 68-95-99.7):</strong> ในการแจกแจงปกติ ข้อมูลประมาณ 68.27% จะอยู่ห่างจากค่าเฉลี่ยไม่เกิน 1 เท่าของ SD (μ ± σ), 95.45% อยู่ไม่เกิน 2 เท่าของ SD (μ ± 2σ) และ 99.73% อยู่ไม่เกิน 3 เท่าของ SD (μ ± 3σ)</li>
          </ul>
        </div>
      }
      tips={[
        "ทดลองปรับค่าเฉลี่ย (Mean) เพื่อเลื่อนตำแหน่งโค้งระฆังคว่ำไปตามแนวแกน X",
        "สังเกตว่าเมื่อลดค่า SD (ส่วนเบี่ยงเบนมาตรฐาน) ลง ยอดของโค้งจะชันขึ้นมาก และเมื่อเพิ่มค่า SD โค้งจะแบนราบลง",
        "Empirical Rule: ปรับขอบเขต x1 = -1.5 และ x2 = 1.5 (เมื่อ Mean = 0, SD = 1.5) เพื่อดูความน่าจะเป็นในช่วง 1 เท่าของ SD (ซึ่งควรมีค่าประมาณ 68.27%)",
        "ในแท็บ 'กระดานกัลตัน' ลองปล่อยลูกบอลจำนวนมาก 500 ลูกขึ้นไป เพื่อดูว่าสถิติความสูงของกองลูกบอลที่ก้นช่องจะตกลงมาสอดคล้องกับซองเส้นโค้งสีแดงในทฤษฎีสถิติแบบทวิพจน์และปกติอย่างไร",
      ]}
      metrics={[
        {
          label: "ค่าเฉลี่ย (μ)",
          value: mean.toFixed(1),
          tone: "blue",
        },
        {
          label: "ส่วนเบี่ยงเบน (σ)",
          value: sd.toFixed(2),
          tone: "violet",
        },
        {
          label: "ขอบเขตการวัด",
          value: `[${x1.toFixed(1)}, ${x2.toFixed(1)}]`,
          tone: "cyan",
        },
        {
          label: "พื้นที่ความน่าจะเป็น",
          value: `${(probability * 100).toFixed(2)}%`,
          tone: "emerald",
        },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
              เกณฑ์การแจกแจงปกติ (Empirical Rule)
            </h3>
          </div>
          <div className="flex-grow flex flex-col justify-center gap-3 text-xs leading-relaxed text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3 flex flex-col gap-2 border border-slate-150">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">ช่วง ±1σ (μ ± σ):</span>
                <span className="font-mono font-black text-indigo-600">≈ 68.27%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">ช่วง ±2σ (μ ± 2σ):</span>
                <span className="font-mono font-black text-indigo-600">≈ 95.45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">ช่วง ±3σ (μ ± 3σ):</span>
                <span className="font-mono font-black text-indigo-600">≈ 99.73%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              * กฎ 68-95-99.7 ช่วยให้เข้าใจสถิติการกระจายตัวของข้อมูลส่วนใหญ่ที่มักเกาะกลุ่มกันอยู่ใกล้จุดเฉลี่ยกลาง
            </p>
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="flex flex-col gap-3 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                <ClipboardList className="h-4.5 w-4.5 text-indigo-500" />
                ตารางบันทึกการวัด (Experiment Log)
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
                ยังไม่มีการบันทึกข้อมูลการทดลอง กดปุ่ม &quot;บันทึกจุดวัด&quot; ด้านบน
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-2.5 text-center">ชุดที่</th>
                      <th className="p-2.5">โหมด</th>
                      <th className="p-2.5">Mean (μ)</th>
                      <th className="p-2.5">SD (σ)</th>
                      <th className="p-2.5">ช่วง [x1, x2]</th>
                      <th className="p-2.5 text-right">ความน่าจะเป็น</th>
                      <th className="p-2.5 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                    {loggedRuns.map((run) => (
                      <tr key={run.index} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="p-2 text-center font-bold">{run.index}</td>
                        <td className="p-2 font-sans text-slate-800">
                          {run.mode === "curve" ? (
                            <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700">
                              Curve
                            </span>
                          ) : (
                            <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold text-violet-700">
                              Galton ({run.totalBalls} ลูก)
                            </span>
                          )}
                        </td>
                        <td className="p-2">{run.mean.toFixed(2)}</td>
                        <td className="p-2">{run.sd.toFixed(2)}</td>
                        <td className="p-2">[{run.x1.toFixed(1)}, {run.x2.toFixed(1)}]</td>
                        <td className="p-2 text-right font-bold text-slate-800">{(run.probability * 100).toFixed(2)}%</td>
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
        "ศึกษาแนวคิดของการแจกแจงปกติและกราฟโค้งระฆังคว่ำ",
        "วิเคราะห์ผลกระทบของค่าเฉลี่ย (μ) และส่วนเบี่ยงเบนมาตรฐาน (σ) ต่อรูปทรงความน่าจะเป็น",
        "เรียนรู้ Empirical Rule การแจกแจงพื้นที่ 68.27% ภายใต้ 1 เท่าของส่วนเบี่ยงเบนมาตรฐาน",
        "ศึกษาแนวคิดทวิพจน์ลู่เข้าหาปกติผ่านการจำลองการกระจายของกระดานกัลตัน (Galton Board)",
      ]}
      steps={[
        { label: "ปรับค่าเฉลี่ย (μ) เพื่อสังเกตการเคลื่อนของกราฟบนแกน X", icon: Sliders },
        { label: "ปรับค่า SD (σ) เพื่อดูอัตราส่วนความสูงและการแผ่ของกราฟ", icon: Sliders },
        { label: "กำหนดช่วงขอบเขต x1 และ x2 เพื่อคำนวณพื้นที่ความน่าจะเป็น", icon: Target },
        { label: "สลับไปที่กระดานกัลตันเพื่อศึกษาความถี่และการตกของลูกบอล", icon: Layers },
      ]}
      progressLabel="ระดับการเรียนรู้การแจกแจงปกติ"
      progressValue={droppedBalls >= 300 ? "บรรลุเงื่อนไขจำลองกัลตันสำเร็จ" : `${droppedBalls}/300 ลูกที่ปล่อยจำลอง`}
      progressPercent={questProgress}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}

