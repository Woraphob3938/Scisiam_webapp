"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
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

// Surface functions
const SURFACES = [
  {
    label: "x² + y²  (พาราโบลอยด์)",
    f: (x: number, y: number) => x * x + y * y,
    dfdx: (x: number, _y: number) => 2 * x,
    dfdy: (_x: number, y: number) => 2 * y,
    xRange: [-3, 3] as [number, number],
    yRange: [-3, 3] as [number, number],
    zRange: [0, 18] as [number, number],
  },
  {
    label: "sin(x)·cos(y)",
    f: (x: number, y: number) => Math.sin(x) * Math.cos(y),
    dfdx: (x: number, y: number) => Math.cos(x) * Math.cos(y),
    dfdy: (x: number, y: number) => -Math.sin(x) * Math.sin(y),
    xRange: [-3.5, 3.5] as [number, number],
    yRange: [-3.5, 3.5] as [number, number],
    zRange: [-1, 1] as [number, number],
  },
  {
    label: "x²− y²  (อานม้า)",
    f: (x: number, y: number) => x * x - y * y,
    dfdx: (x: number, _y: number) => 2 * x,
    dfdy: (_x: number, y: number) => -2 * y,
    xRange: [-3, 3] as [number, number],
    yRange: [-3, 3] as [number, number],
    zRange: [-9, 9] as [number, number],
  },
] as const;

interface LoggedGradientRun {
  index: number;
  surfaceLabel: string;
  px: number;
  py: number;
  fval: number;
  dfdx: number;
  dfdy: number;
  gradMag: number;
}

export default function MultivariableCalculusSimulation() {
  const router = useRouter();
  const labId = "multivariable-calculus";

  const [surfIdx, setSurfIdx] = useState(0);
  const [probeX, setProbeX] = useState(1.0);
  const [probeY, setProbeY] = useState(1.0);
  const [showGradientField, setShowGradientField] = useState(true);
  const [loggedRuns, setLoggedRuns] = useState<LoggedGradientRun[]>([]);

  const surf = SURFACES[surfIdx];

  // Computed values at probe point
  const fVal = useMemo(() => surf.f(probeX, probeY), [surf, probeX, probeY]);
  const partialX = useMemo(() => surf.dfdx(probeX, probeY), [surf, probeX, probeY]);
  const partialY = useMemo(() => surf.dfdy(probeX, probeY), [surf, probeX, probeY]);
  const gradMag = useMemo(() => Math.sqrt(partialX * partialX + partialY * partialY), [partialX, partialY]);

  // SVG dimensions
  const svgW = 480, svgH = 360;
  const pad = { l: 40, r: 40, t: 30, b: 40 };
  const plotW = svgW - pad.l - pad.r;
  const plotH = svgH - pad.t - pad.b;
  const [xMin, xMax] = surf.xRange;
  const [yMin, yMax] = surf.yRange;
  const [zMin, zMax] = surf.zRange;

  const xToSvg = useCallback((x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * plotW, [xMin, xMax, plotW]);
  const yToSvg = useCallback((y: number) => pad.t + ((yMax - y) / (yMax - yMin)) * plotH, [yMin, yMax, plotH]);

  // Color for z value
  const zToColor = useCallback((z: number) => {
    const t = Math.max(0, Math.min(1, (z - zMin) / (zMax - zMin)));
    // Blue (cold) -> Cyan -> Green -> Yellow -> Orange -> Red (hot)
    const r = Math.round(t < 0.5 ? t * 2 * 200 : 200 + (t - 0.5) * 2 * 55);
    const g = Math.round(t < 0.25 ? 60 + t * 4 * 195 : t < 0.75 ? 255 : 255 - (t - 0.75) * 4 * 200);
    const b = Math.round(t < 0.5 ? 255 - t * 2 * 200 : 55 - Math.min(55, (t - 0.5) * 2 * 55));
    return `rgb(${r},${g},${b})`;
  }, [zMin, zMax]);

  // Generate contour lines
  const contourLevels = useMemo(() => {
    const numLevels = 12;
    const levels: number[] = [];
    for (let i = 0; i <= numLevels; i++) {
      levels.push(zMin + (i / numLevels) * (zMax - zMin));
    }
    return levels;
  }, [zMin, zMax]);

  // Generate filled grid cells for heatmap
  const heatmapCells = useMemo(() => {
    const res = 30;
    const cells: { x: number; y: number; w: number; h: number; color: string }[] = [];
    const cellW = plotW / res;
    const cellH = plotH / res;
    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const cx = xMin + ((i + 0.5) / res) * (xMax - xMin);
        const cy = yMin + ((j + 0.5) / res) * (yMax - yMin);
        const z = surf.f(cx, cy);
        cells.push({
          x: pad.l + (i / res) * plotW,
          y: pad.t + (j / res) * plotH,
          w: cellW + 0.5,
          h: cellH + 0.5,
          color: zToColor(z),
        });
      }
    }
    return cells;
  }, [surf, xMin, xMax, yMin, yMax, plotW, plotH, zToColor]);

  // Generate contour paths using marching squares approximation
  const contourPaths = useMemo(() => {
    const res = 60;
    const paths: { level: number; points: string }[] = [];

    for (const level of contourLevels) {
      const segments: string[] = [];
      for (let i = 0; i < res; i++) {
        for (let j = 0; j < res; j++) {
          const x0 = xMin + (i / res) * (xMax - xMin);
          const x1 = xMin + ((i + 1) / res) * (xMax - xMin);
          const y0 = yMax - (j / res) * (yMax - yMin);
          const y1 = yMax - ((j + 1) / res) * (yMax - yMin);
          const v00 = surf.f(x0, y0) - level;
          const v10 = surf.f(x1, y0) - level;
          const v01 = surf.f(x0, y1) - level;
          const v11 = surf.f(x1, y1) - level;

          // Simple marching: draw segment if there's a sign change on an edge
          const edges: [number, number, number, number][] = [];
          if (v00 * v10 < 0) {
            const t = v00 / (v00 - v10);
            edges.push([x0 + t * (x1 - x0), y0, 0, 0]);
          }
          if (v10 * v11 < 0) {
            const t = v10 / (v10 - v11);
            edges.push([x1, y0 + t * (y1 - y0), 0, 0]);
          }
          if (v01 * v11 < 0) {
            const t = v01 / (v01 - v11);
            edges.push([x0 + t * (x1 - x0), y1, 0, 0]);
          }
          if (v00 * v01 < 0) {
            const t = v00 / (v00 - v01);
            edges.push([x0, y0 + t * (y1 - y0), 0, 0]);
          }

          if (edges.length >= 2) {
            const sx1 = xToSvg(edges[0][0]);
            const sy1 = yToSvg(edges[0][1]);
            const sx2 = xToSvg(edges[1][0]);
            const sy2 = yToSvg(edges[1][1]);
            segments.push(`M${sx1.toFixed(1)},${sy1.toFixed(1)}L${sx2.toFixed(1)},${sy2.toFixed(1)}`);
          }
        }
      }
      if (segments.length > 0) {
        paths.push({ level, points: segments.join("") });
      }
    }
    return paths;
  }, [surf, contourLevels, xMin, xMax, yMin, yMax, xToSvg, yToSvg]);

  // Gradient field arrows
  const gradientArrows = useMemo(() => {
    if (!showGradientField) return [];
    const res = 8;
    const arrows: { sx: number; sy: number; dx: number; dy: number; mag: number }[] = [];
    for (let i = 1; i < res; i++) {
      for (let j = 1; j < res; j++) {
        const gx = xMin + (i / res) * (xMax - xMin);
        const gy = yMin + (j / res) * (yMax - yMin);
        const gdx = surf.dfdx(gx, gy);
        const gdy = surf.dfdy(gx, gy);
        const gm = Math.sqrt(gdx * gdx + gdy * gdy);
        if (gm > 0.01) {
          const scale = Math.min(20, gm * 6);
          arrows.push({
            sx: xToSvg(gx),
            sy: yToSvg(gy),
            dx: (gdx / gm) * scale,
            dy: -(gdy / gm) * scale,
            mag: gm,
          });
        }
      }
    }
    return arrows;
  }, [showGradientField, surf, xMin, xMax, yMin, yMax, xToSvg, yToSvg]);

  // Quest progress
  const questProgress = useMemo(() => {
    let p = 0;
    if (loggedRuns.length >= 1) p += 30;
    if (loggedRuns.length >= 3) p += 30;
    // Check if user found a critical point (gradient near 0)
    if (gradMag < 0.3) p += 40;
    else if (loggedRuns.some((r) => r.gradMag < 0.3)) p += 40;
    return Math.min(100, p);
  }, [loggedRuns, gradMag]);

  const handleAddLog = () => {
    const run: LoggedGradientRun = {
      index: loggedRuns.length + 1,
      surfaceLabel: surf.label,
      px: probeX,
      py: probeY,
      fval: fVal,
      dfdx: partialX,
      dfdy: partialY,
      gradMag,
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setProbeX(1.0);
    setProbeY(1.0);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุด\tฟังก์ชัน\tx\ty\tf(x,y)\t∂f/∂x\t∂f/∂y\t|∇f|\n";
    const rows = loggedRuns.map(
      (r) => `${r.index}\t${r.surfaceLabel}\t${r.px.toFixed(2)}\t${r.py.toFixed(2)}\t${r.fval.toFixed(4)}\t${r.dfdx.toFixed(4)}\t${r.dfdy.toFixed(4)}\t${r.gradMag.toFixed(4)}`
    );
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map(
      (r) => `${r.index},${r.surfaceLabel},${r.px},${r.py},${r.fval},${r.dfdx},${r.dfdy},${r.gradMag}`
    );
    const csv = "data:text/csv;charset=utf-8," + ["Index,Surface,x,y,f,dfdx,dfdy,gradMag", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "multivariable_calculus_log.csv");
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
      localStorageKey: "scisiam_saved_multivariable_calculus_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "Multivariable Calculus",
      variables: { surfIdx, probeX, probeY },
      liveValues: { fVal, partialX, partialY, gradMag },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.px, y: r.py })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, foundCritical: loggedRuns.some((r) => r.gradMag < 0.3) },
      score: Math.min(100, Math.max(40, 40 + questProgress * 0.6)),
      durationSeconds: null,
    });
    alert("บันทึกผลการทดลอง Multivariable Calculus สำเร็จ");
    router.push(`/labs/${labId}`);
  };

  return (
    <SharedSimulationShell
      accent="emerald"
      labId={labId}
      category="Mathematics"
      title="Multivariable Calculus"
      subtitle="สำรวจ contour maps, partial derivatives และ gradient vectors ของฟังก์ชันหลายตัวแปร"
      statusLabel={`f(${probeX.toFixed(1)}, ${probeY.toFixed(1)}) = ${fVal.toFixed(3)} | |∇f| = ${gradMag.toFixed(3)}`}
      icon={LineChart}
      sceneTitle="Contour Map & Gradient Visualization"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#ecfdf5_48%,#f5f3ff_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />

          {/* Surface selector tabs */}
          <div className="relative z-10 mb-3 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans overflow-x-auto">
            {SURFACES.map((s, idx) => (
              <button
                key={s.label}
                onClick={() => { setSurfIdx(idx); handleReset(); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all whitespace-nowrap ${
                  surfIdx === idx ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[480px] h-auto overflow-visible">
              <defs>
                <marker id="mvArrowHead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                  <path d="M0,0 L6,2 L0,4 Z" fill="#1e293b" opacity="0.7" />
                </marker>
                <radialGradient id="probeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Heatmap background */}
              {heatmapCells.map((cell, i) => (
                <rect key={i} x={cell.x} y={cell.y} width={cell.w} height={cell.h} fill={cell.color} opacity="0.35" />
              ))}

              {/* Contour lines */}
              {contourPaths.map((cp, i) => (
                <path key={i} d={cp.points} fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.4" />
              ))}

              {/* Gradient field arrows */}
              {gradientArrows.map((arr, i) => (
                <line
                  key={i}
                  x1={arr.sx}
                  y1={arr.sy}
                  x2={arr.sx + arr.dx}
                  y2={arr.sy + arr.dy}
                  stroke="#1e293b"
                  strokeWidth="1.2"
                  opacity={Math.min(0.7, 0.2 + arr.mag * 0.1)}
                  markerEnd="url(#mvArrowHead)"
                />
              ))}

              {/* Axes */}
              {xMin <= 0 && xMax >= 0 && (
                <line x1={xToSvg(0)} y1={pad.t} x2={xToSvg(0)} y2={svgH - pad.b} stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
              )}
              {yMin <= 0 && yMax >= 0 && (
                <line x1={pad.l} y1={yToSvg(0)} x2={svgW - pad.r} y2={yToSvg(0)} stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
              )}

              {/* Axis labels */}
              {Array.from({ length: 7 }).map((_, i) => {
                const val = xMin + (i / 6) * (xMax - xMin);
                return (
                  <text key={`xl${i}`} x={xToSvg(val)} y={svgH - pad.b + 16} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
                    {val.toFixed(1)}
                  </text>
                );
              })}
              {Array.from({ length: 7 }).map((_, i) => {
                const val = yMin + (i / 6) * (yMax - yMin);
                return (
                  <text key={`yl${i}`} x={pad.l - 6} y={yToSvg(val) + 3} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">
                    {val.toFixed(1)}
                  </text>
                );
              })}

              {/* Probe point glow */}
              <circle cx={xToSvg(probeX)} cy={yToSvg(probeY)} r="24" fill="url(#probeGlow)">
                <animate attributeName="r" values="20;28;20" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Gradient arrow at probe */}
              {gradMag > 0.01 && (
                <line
                  x1={xToSvg(probeX)}
                  y1={yToSvg(probeY)}
                  x2={xToSvg(probeX) + (partialX / gradMag) * Math.min(40, gradMag * 12)}
                  y2={yToSvg(probeY) - (partialY / gradMag) * Math.min(40, gradMag * 12)}
                  stroke="#dc2626"
                  strokeWidth="3"
                  strokeLinecap="round"
                  markerEnd="url(#mvArrowHead)"
                />
              )}

              {/* Probe point */}
              <circle cx={xToSvg(probeX)} cy={yToSvg(probeY)} r="7" fill="#10b981" stroke="#fff" strokeWidth="2.5" />

              {/* Probe label */}
              <text x={xToSvg(probeX)} y={yToSvg(probeY) - 14} fill="#065f46" fontSize="9" fontWeight="900" textAnchor="middle">
                P({probeX.toFixed(1)}, {probeY.toFixed(1)})
              </text>

              {/* Partial derivative annotations */}
              <g>
                <rect x={svgW - pad.r - 130} y={pad.t + 4} width="126" height="54" rx="8" fill="white" fillOpacity="0.85" stroke="#d1d5db" strokeWidth="0.8" />
                <text x={svgW - pad.r - 124} y={pad.t + 20} fill="#059669" fontSize="9" fontWeight="900">∂f/∂x = {partialX.toFixed(3)}</text>
                <text x={svgW - pad.r - 124} y={pad.t + 34} fill="#2563eb" fontSize="9" fontWeight="900">∂f/∂y = {partialY.toFixed(3)}</text>
                <text x={svgW - pad.r - 124} y={pad.t + 48} fill="#dc2626" fontSize="9" fontWeight="900">|∇f| = {gradMag.toFixed(3)}</text>
              </g>

              {/* Color scale legend */}
              <g>
                {Array.from({ length: 20 }).map((_, i) => {
                  const t = i / 19;
                  const z = zMin + t * (zMax - zMin);
                  return (
                    <rect key={i} x={pad.l + 2} y={pad.t + 2 + i * 6} width="8" height="7" fill={zToColor(z)} opacity="0.6" />
                  );
                })}
                <text x={pad.l + 14} y={pad.t + 10} fill="#64748b" fontSize="7" fontWeight="bold">{zMax.toFixed(0)}</text>
                <text x={pad.l + 14} y={pad.t + 124} fill="#64748b" fontSize="7" fontWeight="bold">{zMin.toFixed(0)}</text>
              </g>

              {/* Axis titles */}
              <text x={svgW / 2} y={svgH - 4} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">x</text>
              <text x={12} y={svgH / 2} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle" transform={`rotate(-90,12,${svgH / 2})`}>y</text>
            </svg>
          </div>
        </div>
      }
      controlsTitle="ปรับแต่งตำแหน่ง Probe และพารามิเตอร์"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-emerald-500" />
              ตำแหน่งจุดสำรวจ (Probe Position)
            </h3>
            <ManualNumberInput
              label="ตำแหน่ง x"
              ariaLabel="ตำแหน่ง x"
              value={probeX}
              min={surf.xRange[0]}
              max={surf.xRange[1]}
              step={0.1}
              onChange={setProbeX}
              tone="emerald"
            />
            <ManualNumberInput
              label="ตำแหน่ง y"
              ariaLabel="ตำแหน่ง y"
              value={probeY}
              min={surf.yRange[0]}
              max={surf.yRange[1]}
              step={0.1}
              onChange={setProbeY}
              tone="blue"
            />

            {/* Gradient field toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showGradientField}
                onChange={(e) => setShowGradientField(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 accent-emerald-600"
              />
              <span className="text-xs font-bold text-slate-600">แสดง Gradient Field (ลูกศรทิศทาง)</span>
            </label>

            {/* Quick jump to critical point */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setProbeX(0); setProbeY(0); }}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                ไปจุด Origin (0, 0)
              </button>
              <button
                onClick={() => { setProbeX(1.5); setProbeY(1.5); }}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                ไปจุด (1.5, 1.5)
              </button>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-97 cursor-pointer"
            >
              <ClipboardList className="h-3.5 w-3.5 text-emerald-500" />
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
          <ManualNumberInput label="x" ariaLabel="ตำแหน่ง x" value={probeX} min={surf.xRange[0]} max={surf.xRange[1]} step={0.2} onChange={setProbeX} tone="emerald" />
          <ManualNumberInput label="y" ariaLabel="ตำแหน่ง y" value={probeY} min={surf.yRange[0]} max={surf.yRange[1]} step={0.2} onChange={setProbeY} tone="blue" />
        </div>
      }
      metrics={[
        { label: "f(x, y)", value: fVal.toFixed(4), tone: "emerald" },
        { label: "∂f/∂x", value: partialX.toFixed(4), tone: "cyan" },
        { label: "∂f/∂y", value: partialY.toFixed(4), tone: "blue" },
        { label: "|∇f| (ขนาด gradient)", value: gradMag.toFixed(4), tone: "rose" },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
              สรุปทฤษฎี Gradient & Partial Derivatives
            </h3>
          </div>
          <div className="flex-grow flex flex-col justify-center gap-3 text-xs leading-relaxed text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3 flex flex-col gap-2 border border-slate-150">
              <div>
                <span className="font-bold text-slate-700">Gradient Vector (∇f):</span>
                <p className="mt-0.5 text-slate-500 font-bold">
                  คือเวกเตอร์ที่ชี้ทิศทางที่ฟังก์ชันเพิ่มขึ้นเร็วที่สุด ขนาดบอกอัตราการเปลี่ยนแปลง
                </p>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-700">Contour Lines:</span>
                <p className="mt-0.5 text-slate-500 font-bold">
                  เส้นที่เชื่อมจุดที่มีค่า f(x,y) เท่ากัน gradient จะตั้งฉากกับ contour เสมอ
                </p>
              </div>
            </div>
          </div>
        </section>
      }
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">แคลคูลัสหลายตัวแปร (Multivariable Calculus)</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>Partial Derivatives:</strong> อนุพันธ์ย่อย ∂f/∂x คือการหาอัตราการเปลี่ยนแปลงในทิศ x เมื่อคุม y ไว้คงที่ (และกลับกัน)
            </li>
            <li>
              <strong>Gradient:</strong> ∇f = ⟨∂f/∂x, ∂f/∂y⟩ เป็นเวกเตอร์ชี้ทิศที่ฟังก์ชันเพิ่มเร็วที่สุด ที่จุดวิกฤต (critical point) ∇f = 0
            </li>
            <li>
              <strong>Contour Map:</strong> เส้น contour เปรียบเสมือนเส้นชั้นความสูงบนแผนที่ภูมิประเทศ
            </li>
          </ul>
        </div>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                <ClipboardList className="h-4.5 w-4.5 text-emerald-500" />
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
                      <th className="p-2.5">x</th>
                      <th className="p-2.5">y</th>
                      <th className="p-2.5">f(x,y)</th>
                      <th className="p-2.5">∂f/∂x</th>
                      <th className="p-2.5">∂f/∂y</th>
                      <th className="p-2.5">|∇f|</th>
                      <th className="p-2.5 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                    {loggedRuns.map((run) => (
                      <tr key={run.index} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="p-2 text-center font-bold">{run.index}</td>
                        <td className="p-2">{run.px.toFixed(2)}</td>
                        <td className="p-2">{run.py.toFixed(2)}</td>
                        <td className="p-2 font-bold text-slate-800">{run.fval.toFixed(4)}</td>
                        <td className="p-2">{run.dfdx.toFixed(4)}</td>
                        <td className="p-2">{run.dfdy.toFixed(4)}</td>
                        <td className="p-2">{run.gradMag.toFixed(4)}</td>
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
        "เข้าใจความหมายของ partial derivatives ∂f/∂x และ ∂f/∂y",
        "สังเกตทิศทางของ gradient vector ที่ตั้งฉากกับ contour lines",
        "ระบุจุดวิกฤต (critical points) จากตำแหน่งที่ gradient เป็นศูนย์",
        "เปรียบเทียบพฤติกรรมของพื้นผิวต่างๆ (bowl, saddle, wave)",
      ]}
      steps={[
        { label: "เลือกฟังก์ชันพื้นผิวจากแท็บด้านบน", icon: Layers },
        { label: "ปรับตำแหน่ง x, y ของจุด Probe เพื่อดูค่า gradient", icon: Sliders },
        { label: "สังเกตลูกศร gradient (สีแดง) ที่ชี้ทิศทาง steepest ascent", icon: Target },
        { label: "บันทึกค่า partial derivatives ที่จุดต่างๆ ลงตาราง", icon: ClipboardList },
      ]}
      progressLabel="ความคืบหน้า Multivariable Calculus"
      progressValue={
        questProgress === 100
          ? "บรรลุภารกิจสำรวจ gradient แล้ว"
          : questProgress >= 50
          ? "กำลังดำเนินการ..."
          : "ยังไม่เริ่มภารกิจ"
      }
      progressPercent={questProgress}
      tips={[
        "ลองเลือกฟังก์ชัน x²+y² แล้วเลื่อน probe ไปที่ (0,0) เพื่อดูว่า gradient เป็น 0 (จุดต่ำสุด)",
        "สำหรับฟังก์ชัน x²−y² (saddle) จุด (0,0) ก็เป็น critical point แต่ไม่ใช่ max หรือ min",
        "ลูกศร gradient ยาว = ฟังก์ชันเปลี่ยนแปลงเร็ว, สั้น = เปลี่ยนช้า",
        "เส้น contour ที่อยู่ชิดกัน = ฟังก์ชันชันมาก (gradient มีขนาดใหญ่)",
      ]}
      onSave={handleSaveResults}
    />
  );
}
