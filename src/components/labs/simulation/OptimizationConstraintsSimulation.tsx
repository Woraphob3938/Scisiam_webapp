"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Sliders,
  RotateCcw,
  Clipboard,
  ClipboardList,
  Download,
  Trash,
  Calculator,
  Target,
  Sparkles,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedOptimization {
  index: number;
  materialLimit: number;
  laborLimit: number;
  timeLimit: number;
  profitA: number;
  profitB: number;
  prodX: number;
  prodY: number;
  isFeasible: boolean;
  totalProfit: number;
}

interface Vertex {
  x: number;
  y: number;
  label?: string;
  source?: string;
}

export default function OptimizationConstraintsSimulation() {
  const labId = "optimization-constraints";

  // Capacities limits (Resource constraints limits)
  const [materialLimit, setMaterialLimit] = useState<number>(24); // max material
  const [laborLimit, setLaborLimit] = useState<number>(32); // max labor hours
  const [timeLimit, setTimeLimit] = useState<number>(10); // max machine hours

  // Profit coefficients
  const [profitA, setProfitA] = useState<number>(30); // profit coefficient for A (x)
  const [profitB, setProfitB] = useState<number>(40); // profit coefficient for B (y)

  // Current production point chosen by the user
  const [prodX, setProdX] = useState<number>(4);
  const [prodY, setProdY] = useState<number>(4);

  // Profit slider helper (to sweep the objective line Z)
  const [sweepZ, setSweepZ] = useState<number>(200);

  // History & quest
  const [loggedRuns, setLoggedRuns] = useState<LoggedOptimization[]>([]);

  // Constraint equations check helpers
  const checkConstraints = useCallback((x: number, y: number) => {
    const isMaterialOk = 2 * x + 3 * y <= materialLimit + 0.001;
    const isLaborOk = 4 * x + 2 * y <= laborLimit + 0.001;
    const isTimeOk = x + y <= timeLimit + 0.001;
    const isNonNegative = x >= -0.001 && y >= -0.001;
    return isMaterialOk && isLaborOk && isTimeOk && isNonNegative;
  }, [laborLimit, materialLimit, timeLimit]);

  const isCurrentFeasible = useMemo(() => {
    return checkConstraints(prodX, prodY);
  }, [checkConstraints, prodX, prodY]);

  // Compute all valid intersection vertices of constraints
  // 1. x = 0, y = 0
  // 2. x = 0, y-intercepts of the 3 constraint lines
  // 3. y = 0, x-intercepts of the 3 constraint lines
  // 4. Intersections of the 3 constraint lines
  const feasibleVertices = useMemo(() => {
    const candidates: Vertex[] = [
      { x: 0, y: 0, label: "O (0,0)", source: "Origin" },
    ];

    // Y intercepts (x = 0)
    // Line 1: 2x + 3y = materialLimit -> y = materialLimit/3
    candidates.push({ x: 0, y: materialLimit / 3, label: "Y1", source: "Material Limit" });
    // Line 2: 4x + 2y = laborLimit -> y = laborLimit/2
    candidates.push({ x: 0, y: laborLimit / 2, label: "Y2", source: "Labor Limit" });
    // Line 3: x + y = timeLimit -> y = timeLimit
    candidates.push({ x: 0, y: timeLimit, label: "Y3", source: "Machine Time" });

    // X intercepts (y = 0)
    // Line 1: 2x + 3y = materialLimit -> x = materialLimit/2
    candidates.push({ x: materialLimit / 2, y: 0, label: "X1", source: "Material Limit" });
    // Line 2: 4x + 2y = laborLimit -> x = laborLimit/4
    candidates.push({ x: laborLimit / 4, y: 0, label: "X2", source: "Labor Limit" });
    // Line 3: x + y = timeLimit -> x = timeLimit
    candidates.push({ x: timeLimit, y: 0, label: "X3", source: "Machine Time" });

    // Line 1 & Line 2 intersection
    // 2x + 3y = mat, 4x + 2y = lab
    // 4x + 6y = 2*mat -> 4y = 2*mat - lab -> y = (2*mat - lab)/4, x = (mat - 3y)/2
    const d12 = 2 * 2 - 3 * 4; // determinant: -8
    if (d12 !== 0) {
      const intersectY = (2 * laborLimit - 4 * materialLimit) / d12;
      const intersectX = (materialLimit - 3 * intersectY) / 2;
      candidates.push({ x: intersectX, y: intersectY, label: "M-L", source: "Material-Labor" });
    }

    // Line 1 & Line 3 intersection
    // 2x + 3y = mat, x + y = time
    // 2x + 3(time - x) = mat -> -x = mat - 3*time -> x = 3*time - mat, y = time - x
    const intersectX13 = 3 * timeLimit - materialLimit;
    const intersectY13 = timeLimit - intersectX13;
    candidates.push({ x: intersectX13, y: intersectY13, label: "M-T", source: "Material-Time" });

    // Line 2 & Line 3 intersection
    // 4x + 2y = lab, x + y = time
    // 4(time - y) + 2y = lab -> 4*time - 2y = lab -> y = (4*time - lab)/2, x = time - y
    const intersectY23 = (4 * timeLimit - laborLimit) / 2;
    const intersectX23 = timeLimit - intersectY23;
    candidates.push({ x: intersectX23, y: intersectY23, label: "L-T", source: "Labor-Time" });

    // Filter candidate vertices that are feasible
    const valid = candidates.filter((pt) => {
      // Check limits with float tolerance
      const isFeasible = checkConstraints(pt.x, pt.y);
      return isFeasible;
    });

    // Remove duplicates
    const unique: Vertex[] = [];
    valid.forEach((pt) => {
      const isDuplicate = unique.some(
        (u) => Math.abs(u.x - pt.x) < 0.01 && Math.abs(u.y - pt.y) < 0.01
      );
      if (!isDuplicate) {
        unique.push(pt);
      }
    });

    // Sort unique points radially to form a convex polygon outline for SVG plotting
    // Find centroid
    if (unique.length === 0) return [];
    const cx = unique.reduce((sum, p) => sum + p.x, 0) / unique.length;
    const cy = unique.reduce((sum, p) => sum + p.y, 0) / unique.length;

    unique.sort((a, b) => {
      const angleA = Math.atan2(a.y - cy, a.x - cx);
      const angleB = Math.atan2(b.y - cy, b.x - cx);
      return angleA - angleB;
    });

    return unique;
  }, [checkConstraints, laborLimit, materialLimit, timeLimit]);

  // Solve the optimal point dynamically by checking values of Profit (Z = profitA*x + profitB*y) at all vertices
  const optimalSolution = useMemo(() => {
    if (feasibleVertices.length === 0) return { x: 0, y: 0, profit: 0 };
    let bestX = 0;
    let bestY = 0;
    let maxProfit = -1;

    feasibleVertices.forEach((v) => {
      const z = profitA * v.x + profitB * v.y;
      if (z > maxProfit) {
        maxProfit = z;
        bestX = v.x;
        bestY = v.y;
      }
    });

    return { x: bestX, y: bestY, profit: maxProfit };
  }, [feasibleVertices, profitA, profitB]);

  // Click handler to snap to optimal vertex
  const handleSolve = () => {
    setProdX(Number(optimalSolution.x.toFixed(2)));
    setProdY(Number(optimalSolution.y.toFixed(2)));
    setSweepZ(Number(optimalSolution.profit.toFixed(0)));
  };

  const matUsed = 2 * prodX + 3 * prodY;
  const laborUsed = 4 * prodX + 2 * prodY;
  const timeUsed = prodX + prodY;
  const totalProfit = profitA * prodX + profitB * prodY;

  // Quest Evaluation:
  // Quest 1: Match standard capacities configuration & profit weights, and place prodX & prodY to optimal point
  // Optimal for defaults (mat=24, lab=32, time=10, profitA=30, profitB=40) is:
  // Mat: 2x + 3y <= 24
  // Lab: 4x + 2y <= 32
  // Time: x + y <= 10
  // Vertices check:
  // (0,0) -> 0
  // (0, 8) -> 40*8 = 320 (satisfies labor 16<=32, time 8<=10)
  // (8, 0) -> 30*8 = 240 (violates labor 32<=32, mat 16<=24, time 8<=10)
  // M-L: 2x+3y=24, 4x+2y=32 -> x = 6, y = 4 (time: 6+4=10 ok, profit: 30*6+40*4=340) -> Optimal!
  const questProgress = useMemo(() => {
    let progress = 0;
    const isAtOptimal =
      Math.abs(prodX - optimalSolution.x) < 0.1 && Math.abs(prodY - optimalSolution.y) < 0.1;
    if (isAtOptimal) {
      progress += 50;
    }
    if (loggedRuns.length >= 3) {
      progress += 50;
    }
    return progress;
  }, [prodX, prodY, optimalSolution, loggedRuns]);

  // Map coordinates to SVG. Box size 480x320
  // Limits: X: [0, 15] -> maps to 50 to 430 (width = 380, scaling = 380 / 15 = 25.33)
  // Limits: Y: [0, 15] -> maps to 270 to 30 (height = 240, scaling = 240 / 15 = 16)
  const xToSvg = (x: number) => 50 + x * 25.33;
  const yToSvg = (y: number) => 270 - y * 16;

  // Render SVG polygon coordinates
  const polygonPointsStr = useMemo(() => {
    return feasibleVertices.map((v) => `${xToSvg(v.x)},${yToSvg(v.y)}`).join(" ");
  }, [feasibleVertices]);

  // Objective sweep line coordinates
  // ax + by = Z -> y = (Z - ax)/b -> X=0 y=Z/b, Y=0 x=Z/a
  const sweepLineCoords = useMemo(() => {
    const xStart = 0;
    const yStart = sweepZ / profitB;
    const xEnd = sweepZ / profitA;
    const yEnd = 0;
    return {
      x1: xToSvg(xStart),
      y1: yToSvg(yStart),
      x2: xToSvg(xEnd),
      y2: yToSvg(yEnd),
    };
  }, [sweepZ, profitA, profitB]);

  const handleAddLog = () => {
    const newLog: LoggedOptimization = {
      index: loggedRuns.length + 1,
      materialLimit,
      laborLimit,
      timeLimit,
      profitA,
      profitB,
      prodX,
      prodY,
      isFeasible: isCurrentFeasible,
      totalProfit: profitA * prodX + profitB * prodY,
    };
    setLoggedRuns((prev) => [...prev, newLog]);
  };

  const handleClearLog = (index: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== index));
  };

  const handleReset = () => {
    setMaterialLimit(24);
    setLaborLimit(32);
    setTimeLimit(10);
    setProfitA(30);
    setProfitB(40);
    setProdX(4);
    setProdY(4);
    setSweepZ(200);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    if (loggedRuns.length === 0) {
      alert("ยังไม่มีข้อมูลบันทึก");
      return;
    }
    const content = loggedRuns
      .map(
        (r) =>
          `Run #${r.index}: Limits=[Mat:${r.materialLimit}, Labor:${r.laborLimit}, Time:${r.timeLimit}], ProfitCoeffs=[${r.profitA}, ${r.profitB}], Target=[${r.prodX}, ${r.prodY}] -> Feasible=${r.isFeasible ? "YES" : "NO"}, Profit=${r.totalProfit.toFixed(0)}`
      )
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกข้อมูลแล้ว"));
  };

  const handleExportCSV = () => {
    if (loggedRuns.length === 0) {
      alert("ยังไม่มีข้อมูลบันทึก");
      return;
    }
    const headers = "index,material_limit,labor_limit,time_limit,profit_a,profit_b,prod_x,prod_y,is_feasible,total_profit\n";
    const rows = loggedRuns
      .map(
        (r) =>
          `${r.index},${r.materialLimit},${r.laborLimit},${r.timeLimit},${r.profitA},${r.profitB},${r.prodX},${r.prodY},${r.isFeasible},${r.totalProfit}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "optimization_constraints_experiments.csv");
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
      materialLimit,
      laborLimit,
      timeLimit,
      profitA,
      profitB,
      prodX,
      prodY,
      isFeasible: isCurrentFeasible,
      loggedRuns,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_optimization_constraints_experiment",
      localPayload: experimentData,
      labId,
      title: "Optimization & Constraints",
      variables: { materialLimit, laborLimit, timeLimit, profitA, profitB },
      liveValues: { prodX, prodY, isFeasible: isCurrentFeasible, optimalProfit: optimalSolution.profit, questProgress },
      graphPoints: loggedRuns.map((r) => ({
        index: r.index,
        x: r.prodX,
        y: r.prodY,
      })),
      tableRows: loggedRuns,
      summary: {
        runsCount: loggedRuns.length,
        maxProfit: Math.max(...loggedRuns.map((r) => r.totalProfit)),
      },
      score: Math.min(100, Math.max(40, 40 + questProgress * 0.6)),
      durationSeconds: null,
    });

    alert("บันทึกผลแล็บ Optimization & Constraints สำเร็จ");
  };

  return (
    <SharedSimulationShell
      accent="orange"
      labId={labId}
      category="Mathematics"
      title="Optimization & Constraints"
      subtitle="ศึกษากระบวนการกำหนดการเชิงเส้น (Linear Programming) จัดสรรทรัพยากรที่มีอยู่จำกัดเพื่อค้นหาผลผลิตสูงสุดหรือต้นทุนต่ำสุดอย่างเป็นระบบ"
      statusLabel={
        isCurrentFeasible
          ? `อยู่ในช่วงที่เป็นไปได้ (Feasible) | กำไร: ${(profitA * prodX + profitB * prodY).toFixed(0)}`
          : "เกินขีดจำกัดทรัพยากร (Infeasible)"
      }
      icon={Calculator}
      sceneTitle="วิชวลแสดงขอบเขตคำตอบและจุดที่เหมาะสม"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-orange-100 bg-[linear-gradient(135deg,#fffdfa_0%,#fffaf0_50%,#fdfaff_100%)] p-4 select-none">
          {/* Grid backgrounds */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-60" />

          {/* Solution Info Card Overlay */}
          <div className="absolute left-4 top-4 rounded-xl border border-slate-200 bg-white/92 px-3 py-2 text-left shadow-sm backdrop-blur-md z-10 font-sans text-xs">
            <span className="block font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">
              สถานะการผลิต
            </span>
            <div className="flex flex-col gap-0.5 font-mono text-[10.5px]">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">ผลผลิตชิ้น A (x):</span>
                <span className="font-bold text-slate-700">{prodX} ชิ้น</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">ผลผลิตชิ้น B (y):</span>
                <span className="font-bold text-slate-700">{prodY} ชิ้น</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-100 pt-1 mt-1">
                <span className="text-slate-500 font-sans">กำไรสะสม:</span>
                <span className="font-bold text-orange-600">{(profitA * prodX + profitB * prodY).toFixed(0)} บาท</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 font-sans">กำไรสูงสุดที่เป็นไปได้:</span>
                <span className="font-bold text-emerald-600">{optimalSolution.profit.toFixed(0)} บาท</span>
              </div>
            </div>
          </div>

          {/* SVG Viewport */}
          <div className="relative flex-grow flex items-center justify-center">
            <svg className="w-full max-w-[460px] h-64 relative z-10" viewBox="0 0 480 320">
              <defs>
                <clipPath id="lp-grid">
                  <rect x="50" y="30" width="380" height="240" rx="12" />
                </clipPath>
              </defs>

              {/* Box container */}
              <rect x="50" y="30" width="380" height="240" rx="12" fill="#ffffff" stroke="#fed7aa" strokeWidth="1.5" />

              <g clipPath="url(#lp-grid)">
                {/* Major Grid Lines */}
                {Array.from({ length: 16 }).map((_, val) => {
                  const x = xToSvg(val);
                  const y = yToSvg(val);
                  return (
                    <g key={val}>
                      <line x1={x} y1="30" x2={x} y2="270" stroke="#f8fafc" strokeWidth="1" />
                      <line x1="50" y1={y} x2="430" y2={y} stroke="#f8fafc" strokeWidth="1" />
                    </g>
                  );
                })}

                {/* Shaded Feasible Region (Polygon) */}
                {polygonPointsStr && (
                  <polygon points={polygonPointsStr} fill="#fed7aa" opacity="0.45" stroke="#f97316" strokeWidth="1.5" />
                )}

                {/* Constraint Line 1 (Material): 2x + 3y = mat */}
                <line
                  x1={xToSvg(0)}
                  y1={yToSvg(materialLimit / 3)}
                  x2={xToSvg(materialLimit / 2)}
                  y2={yToSvg(0)}
                  stroke="#ef4444"
                  strokeWidth="2"
                  opacity="0.8"
                />

                {/* Constraint Line 2 (Labor): 4x + 2y = lab */}
                <line
                  x1={xToSvg(0)}
                  y1={yToSvg(laborLimit / 2)}
                  x2={xToSvg(laborLimit / 4)}
                  y2={yToSvg(0)}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.8"
                />

                {/* Constraint Line 3 (Time): x + y = time */}
                <line
                  x1={xToSvg(0)}
                  y1={yToSvg(timeLimit)}
                  x2={xToSvg(timeLimit)}
                  y2={yToSvg(0)}
                  stroke="#a855f7"
                  strokeWidth="2"
                  opacity="0.8"
                />

                {/* Objective Function/Profit line sweep */}
                <line
                  x1={sweepLineCoords.x1}
                  y1={sweepLineCoords.y1}
                  x2={sweepLineCoords.x2}
                  y2={sweepLineCoords.y2}
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeDasharray="5,4"
                  opacity="0.9"
                />

                {/* Target optimal vertex indicator */}
                <circle
                  cx={xToSvg(optimalSolution.x)}
                  cy={yToSvg(optimalSolution.y)}
                  r="7"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  className="animate-ping"
                />
                <circle
                  cx={xToSvg(optimalSolution.x)}
                  cy={yToSvg(optimalSolution.y)}
                  r="4"
                  fill="#10b981"
                />

                {/* Current User Selected production coordinate */}
                <circle
                  cx={xToSvg(prodX)}
                  cy={yToSvg(prodY)}
                  r="6"
                  fill={isCurrentFeasible ? "#f97316" : "#ef4444"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>

              {/* Axis markers & labels */}
              {Array.from({ length: 4 }).map((_, i) => {
                const val = (i + 1) * 3;
                return (
                  <g key={val}>
                    <text x={xToSvg(val)} y="285" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {val}
                    </text>
                    <text x="42" y={yToSvg(val) + 3} fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="end">
                      {val}
                    </text>
                  </g>
                );
              })}

              <text x="425" y="265" fill="#64748b" fontSize="9" fontWeight="bold">
                A(x)
              </text>
              <text x="56" y="44" fill="#64748b" fontSize="9" fontWeight="bold">
                B(y)
              </text>
            </svg>
          </div>
        </div>
      }
      controlsTitle="กำหนดตัวแปรและข้อจำกัด"
      controls={
        <div className="flex flex-col gap-6 font-sans">
          {/* Resource Constraints capacities limits */}
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-orange-500" />
              กำหนดขีดจำกัดทรัพยากร
            </h3>
            <div className="flex flex-col gap-4">
              <ManualNumberInput
                label="ขีดจำกัดวัตถุดิบ (Material)"
                ariaLabel="ขีดจำกัดวัตถุดิบ (Material)"
                value={materialLimit}
                min={10}
                max={30}
                step={1}
                onChange={setMaterialLimit}
                tone="pink"
              />
              <ManualNumberInput
                label="ชั่วโมงแรงงานการผลิต (Labor)"
                ariaLabel="ชั่วโมงแรงงานการผลิต (Labor)"
                value={laborLimit}
                min={12}
                max={40}
                step={1}
                onChange={setLaborLimit}
                tone="blue"
              />
              <ManualNumberInput
                label="ชั่วโมงเครื่องจักร (Machine Time)"
                ariaLabel="ชั่วโมงเครื่องจักร (Machine Time)"
                value={timeLimit}
                min={6}
                max={15}
                step={1}
                onChange={setTimeLimit}
                tone="violet"
              />
            </div>
          </section>

          {/* Profit Coefficients & Solver */}
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-orange-500" />
              อัตรากำไรต่อหน่วย
            </h3>
            <div className="flex flex-col gap-4">
              <ManualNumberInput
                label="กำไรชิ้นงาน A (บาท)"
                ariaLabel="กำไรชิ้นงาน A"
                value={profitA}
                min={10}
                max={100}
                step={5}
                onChange={setProfitA}
                tone="orange"
              />
              <ManualNumberInput
                label="กำไรชิ้นงาน B (บาท)"
                ariaLabel="กำไรชิ้นงาน B"
                value={profitB}
                min={10}
                max={100}
                step={5}
                onChange={setProfitB}
                tone="orange"
              />
            </div>
          </section>

          {/* User selected production values */}
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Target className="h-4.5 w-4.5 text-orange-500" />
              กำหนดแผนการผลิต (x, y)
            </h3>
            <div className="flex flex-col gap-4">
              <ManualNumberInput
                label="ยอดผลิตชิ้นงาน A (x)"
                ariaLabel="ยอดผลิตชิ้นงาน A"
                value={prodX}
                min={0}
                max={15}
                step={0.5}
                onChange={setProdX}
                tone="orange"
              />
              <ManualNumberInput
                label="ยอดผลิตชิ้นงาน B (y)"
                ariaLabel="ยอดผลิตชิ้นงาน B"
                value={prodY}
                min={0}
                max={15}
                step={0.5}
                onChange={setProdY}
                tone="orange"
              />
              <button
                onClick={handleSolve}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-black text-white shadow-md transition-all hover:bg-orange-700 active:scale-98"
              >
                <Calculator className="h-4 w-4" />
                คำนวณจุดที่เหมาะสมที่สุด (Solve)
              </button>
            </div>
          </section>

          {/* Log and control actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-97"
            >
              <Clipboard className="h-3.5 w-3.5 text-orange-500" />
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
          <p className="mb-3 font-semibold text-slate-800">การหาค่าที่เหมาะสมที่สุดภายใต้ข้อจำกัด (Optimization with Constraints)</p>
          <p className="mb-3">
            เป็นหนึ่งในเทคนิคการแก้ปัญหาทางคณิตศาสตร์ประยุกต์และวิทยาการจัดการ โดยเฉพาะในหัวข้อ **กำหนดการเชิงเส้น (Linear Programming)**
            เพื่อใช้ตัดสินใจหาผลลัพธ์ที่ดีที่สุด เช่น การทำกำไรสูงสุด หรือการประหยัดต้นทุนต่ำสุดภายใต้ข้อจำกัดของปัจจัยการผลิต (ทรัพยากร, งบประมาณ, เวลา)
          </p>
          <p className="mb-3 font-semibold text-slate-800">โครงสร้างทางคณิตศาสตร์ประกอบด้วย:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2.5 mb-3 font-sans">
            <li>
              <strong>สมการเป้าหมาย (Objective Function):</strong>
              ฟังก์ชันเป้าหมายเชิงเส้นที่ต้องการสูงสุด (Maximize) หรือต่ำสุด (Minimize) เช่น กำไรรวม:
              <span className="block my-1 font-mono text-xs font-bold text-orange-700">P = c₁x + c₂y</span>
            </li>
            <li>
              <strong>อสมการข้อจำกัด (Constraints):</strong>
              เงื่อนไขจำกัดทรัพยากรที่เขียนในรูปอสมการเชิงเส้น เช่น:
              <span className="block my-1 font-mono text-xs font-bold text-slate-700">a₁x + b₁y ≤ Limit</span>
            </li>
            <li>
              <strong>ขอบเขตที่เป็นไปได้ (Feasible Region):</strong>
              พื้นที่หรือรูปหลายเหลี่ยมที่เกิดจากการทับซ้อนกันของพื้นที่ภายใต้อสมการข้อจำกัดทั้งหมด (รวมถึงเงื่อนไข x ≥ 0, y ≥ 0)
            </li>
            <li>
              <strong>ทฤษฎีบทจุดมุม (Corner Point Theorem):</strong>
              ค่าสูงสุดหรือต่ำสุดของสมการเป้าหมายจะเกิดขึ้นที่ **จุดมุม (Vertices/Corners)** ของขอบเขตที่เป็นไปได้เสมอ
            </li>
          </ul>
        </div>
      }
      tips={[
        "แผนภาพ SVG จะแสดงขอบเขตการผลิตที่เป็นไปได้เป็นรูปหลายเหลี่ยมสีส้ม (Feasible Region) จุดมุมของรูปคือผู้เข้าชิงตำแหน่งจุดที่ผลิตแล้วได้กำไรสูงสุด",
        "กดปุ่ม 'คำนวณจุดที่เหมาะสมที่สุด (Solve)' เพื่อให้โปรแกรมใช้อัลกอริทึมค้นหาจุดมุมที่ดีที่สุดและเคลื่อนเส้นประสีเขียว (Objective line) ไปสัมผัสจุดนั้นทันที",
        "สังเกตว่าเมื่อขีดจำกัดวัตถุดิบหรือชั่วโมงทำงานเปลี่ยนแปลงไป ขนาดของพื้นที่ Feasible Region สีส้มจะยืดขยายหรือบีบหด ทำให้พิกัดจุดสูงสุดเปลี่ยนไป",
      ]}
      metrics={[
        {
          label: "การผลิต ชิ้นงาน A (x)",
          value: `${prodX.toFixed(1)} ชิ้น`,
          tone: "orange",
        },
        {
          label: "การผลิต ชิ้นงาน B (y)",
          value: `${prodY.toFixed(1)} ชิ้น`,
          tone: "orange",
        },
        {
          label: "แผนการผลิตสอดคล้อง",
          value: isCurrentFeasible ? "Feasible" : "Infeasible",
          tone: isCurrentFeasible ? "emerald" : "rose",
        },
        {
          label: "กำไรรวมที่ได้ (Z)",
          value: `${totalProfit} บาท`,
          tone: "emerald",
        },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-orange-650" />
              สรุปอัตราการใช้ทรัพยากรการผลิต
            </h3>
          </div>
          <div className="flex-grow flex flex-col justify-center gap-2.5 text-xs leading-relaxed text-slate-600">
            <div className="space-y-2">
              <div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>วัตถุดิบ (Material): 2x + 1y ≤ {materialLimit}</span>
                  <span className={matUsed > materialLimit ? "text-rose-600" : "text-slate-600"}>
                    {matUsed} / {materialLimit} ({Math.min(100, Math.round((matUsed / materialLimit) * 100))}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded transition-all duration-300 ${matUsed > materialLimit ? "bg-rose-500" : "bg-orange-500"}`} style={{ width: `${Math.min(100, (matUsed / materialLimit) * 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>แรงงาน (Labor): 2x + 3y ≤ {laborLimit}</span>
                  <span className={laborUsed > laborLimit ? "text-rose-600" : "text-slate-600"}>
                    {laborUsed} / {laborLimit} ({Math.min(100, Math.round((laborUsed / laborLimit) * 100))}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded transition-all duration-300 ${laborUsed > laborLimit ? "bg-rose-500" : "bg-orange-500"}`} style={{ width: `${Math.min(100, (laborUsed / laborLimit) * 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>เวลาเครื่องจักร (Machine): 1x + 1y ≤ {timeLimit}</span>
                  <span className={timeUsed > timeLimit ? "text-rose-600" : "text-slate-600"}>
                    {timeUsed} / {timeLimit} ({Math.min(100, Math.round((timeUsed / timeLimit) * 100))}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded transition-all duration-300 ${timeUsed > timeLimit ? "bg-rose-500" : "bg-orange-500"}`} style={{ width: `${Math.min(100, (timeUsed / timeLimit) * 100)}%` }} />
                </div>
              </div>
            </div>
            <p className="text-[9px] text-slate-400">
              * แผนการผลิตจะล้มเหลว (Infeasible) ทันทีหากมีการใช้ทรัพยากรส่วนใดส่วนหนึ่งเกิน 100%
            </p>
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="flex flex-col gap-3 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                <ClipboardList className="h-4.5 w-4.5 text-orange-500" />
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
                      <th className="p-2.5">ขีดจำกัด [Mat, Lab, Time]</th>
                      <th className="p-2.5">ยอดผลิต [A, B]</th>
                      <th className="p-2.5">กำไรต่อหน่วย [A, B]</th>
                      <th className="p-2.5">ความสอดคล้องขอบเขต</th>
                      <th className="p-2.5 text-right">กำไรรวม</th>
                      <th className="p-2.5 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                    {loggedRuns.map((run) => (
                      <tr key={run.index} className="hover:bg-orange-50/20 transition-colors">
                        <td className="p-2 text-center font-bold">{run.index}</td>
                        <td className="p-2">[{run.materialLimit}, {run.laborLimit}, {run.timeLimit}]</td>
                        <td className="p-2 font-bold text-slate-700">[{run.prodX}, {run.prodY}]</td>
                        <td className="p-2">[{run.profitA}, {run.profitB}]</td>
                        <td className="p-2 font-sans">
                          {run.isFeasible ? (
                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                              ผ่าน (Feasible)
                            </span>
                          ) : (
                            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                              เกิน (Infeasible)
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-right font-bold text-orange-600">{run.totalProfit} บาท</td>
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
        "อธิบายแนวคิดเรื่องตัวแปรตัดสินใจ (Decision Variables) และฟังก์ชันเป้าหมาย (Objective Function)",
        "ศึกษาและกำหนดสมการอสมการข้อจำกัดทรัพยากร (Resource Constraint Inequalities)",
        "วิเคราะห์ขอบเขตบริเวณที่เป็นไปได้ (Feasible Region) และพิกัดจุดมุมจุดยอดต่างๆ",
        "คำนวณและประยุกต์ทฤษฎีบทจุดมุมเพื่อหาค่ากำไรผลิตสูงสุดของการวางแผนระบบธุรกิจจำลอง",
      ]}
      steps={[
        { label: "กำหนดค่าขีดจำกัดสูงสุดของทรัพยากรดิบและชั่วโมงการทำงาน", icon: Sliders },
        { label: "กำหนดราคาอัตรากำไรขั้นต้นต่อชิ้นงานในการคิดคำนวณกำไรเป้าหมาย", icon: Sliders },
        { label: "ปรับอัตราการผลิตชิ้นงาน A และ B เพื่อให้ยังอยู่ในขอบเขตที่เป็นไปได้", icon: Target },
        { label: "กดค้นหาจุดมุมที่เหมาะสมและบันทึกเปรียบเทียบในประวัติการเรียนรู้", icon: Calculator },
      ]}
      progressLabel="ระดับการเรียนรู้การจัดสรรทรัพยากร"
      progressValue={loggedRuns.length >= 3 ? "บันทึกการคำนวณครบ 3 ชุดแผนการผลิตแล้ว" : `${loggedRuns.length}/3 แผนการผลิตที่บันทึกไว้`}
      progressPercent={questProgress}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
