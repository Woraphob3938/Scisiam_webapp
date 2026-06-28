"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calculator,
  Clipboard,
  ClipboardList,
  Compass,
  Download,
  LineChart,
  MoveRight,
  RotateCcw,
  Save,
  Trash,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface Vector {
  magnitude: number;
  angle: number;
  x: number;
  y: number;
}

interface VectorLog {
  index: number;
  aMagnitude: number;
  aAngle: number;
  bMagnitude: number;
  bAngle: number;
  resultMagnitude: number;
  resultAngle: number;
  resultX: number;
  resultY: number;
}

const MAX_LOGS = 12;
const SVG_WIDTH = 560;
const SVG_HEIGHT = 380;
const ORIGIN_X = 260;
const ORIGIN_Y = 210;
const VECTOR_SCALE = 18;

function formatNumber(value: number) {
  const rounded = Math.abs(value) < 0.005 ? 0 : value;
  return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2);
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number) {
  const degrees = (radians * 180) / Math.PI;
  return degrees < 0 ? degrees + 360 : degrees;
}

function makeVector(magnitude: number, angle: number): Vector {
  const radians = toRadians(angle);
  return {
    magnitude,
    angle,
    x: magnitude * Math.cos(radians),
    y: magnitude * Math.sin(radians),
  };
}

function pointFromVector(start: { x: number; y: number }, vector: Pick<Vector, "x" | "y">) {
  return {
    x: start.x + vector.x * VECTOR_SCALE,
    y: start.y - vector.y * VECTOR_SCALE,
  };
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function VectorStage({
  vectorA,
  vectorB,
  result,
  logs,
}: {
  vectorA: Vector;
  vectorB: Vector;
  result: Vector;
  logs: VectorLog[];
}) {
  const origin = { x: ORIGIN_X, y: ORIGIN_Y };
  const aEnd = pointFromVector(origin, vectorA);
  const bEnd = pointFromVector(origin, vectorB);
  const bHeadTailEnd = pointFromVector(aEnd, vectorB);
  const resultEnd = pointFromVector(origin, result);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-violet-50 via-white to-cyan-50">
      <div className="absolute left-4 top-4 z-10 max-w-[380px] rounded-2xl border border-white/80 bg-white/92 px-4 py-3 shadow-lg shadow-violet-100/70 backdrop-blur-md">
        <p className="text-[10px] font-black uppercase text-violet-500">Vector Addition Lab</p>
        <p className="mt-1 font-mono text-xl font-black text-slate-900">A + B = R</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
          R = ({formatNumber(result.x)}, {formatNumber(result.y)}) | magnitude {formatNumber(result.magnitude)} | angle {formatNumber(result.angle)}
        </p>
      </div>

      <div className="absolute right-5 top-5 z-10 hidden rounded-2xl border border-cyan-100 bg-white/95 px-4 py-3 shadow-lg shadow-cyan-100/80 backdrop-blur-md md:block">
        <p className="text-[10px] font-black text-cyan-600">head-to-tail construction</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">Place B at the head of A, then draw R from start to finish.</p>
      </div>

      <svg className="h-full w-full" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} fill="none" role="img" aria-label="Vector addition head-to-tail diagram">
        <defs>
          <marker id="arrow-a" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth">
            <path d="M2,2 L10,6 L2,10 Z" fill="#7c3aed" />
          </marker>
          <marker id="arrow-b" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth">
            <path d="M2,2 L10,6 L2,10 Z" fill="#0891b2" />
          </marker>
          <marker id="arrow-r" markerWidth="13" markerHeight="13" refX="11" refY="6.5" orient="auto" markerUnits="strokeWidth">
            <path d="M2,2 L11,6.5 L2,11 Z" fill="#f97316" />
          </marker>
          <filter id="vector-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#64748b" floodOpacity="0.18" />
          </filter>
        </defs>

        {Array.from({ length: 23 }, (_, index) => index * 28).map((x) => (
          <line key={`x-${x}`} x1={x} y1="0" x2={x} y2={SVG_HEIGHT} stroke={x === ORIGIN_X ? "#94a3b8" : "#e2e8f0"} strokeWidth={x === ORIGIN_X ? 2 : 1} />
        ))}
        {Array.from({ length: 16 }, (_, index) => index * 28).map((y) => (
          <line key={`y-${y}`} x1="0" y1={y} x2={SVG_WIDTH} y2={y} stroke={y === ORIGIN_Y ? "#94a3b8" : "#e2e8f0"} strokeWidth={y === ORIGIN_Y ? 2 : 1} />
        ))}

        <line x1={aEnd.x} y1={aEnd.y} x2={bHeadTailEnd.x} y2={bHeadTailEnd.y} stroke="#0891b2" strokeWidth="5" strokeLinecap="round" markerEnd="url(#arrow-b)" filter="url(#vector-shadow)" />
        <line x1={origin.x} y1={origin.y} x2={aEnd.x} y2={aEnd.y} stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" markerEnd="url(#arrow-a)" filter="url(#vector-shadow)" />

        <line x1={origin.x} y1={origin.y} x2={bEnd.x} y2={bEnd.y} stroke="#0891b2" strokeWidth="3" strokeLinecap="round" strokeDasharray="7 7" markerEnd="url(#arrow-b)" opacity="0.7" />
        <line x1={bEnd.x} y1={bEnd.y} x2={resultEnd.x} y2={resultEnd.y} stroke="#7c3aed" strokeWidth="2" strokeDasharray="6 8" opacity="0.45" />
        <line x1={aEnd.x} y1={aEnd.y} x2={resultEnd.x} y2={resultEnd.y} stroke="#0891b2" strokeWidth="2" strokeDasharray="6 8" opacity="0.45" />

        <line x1={origin.x} y1={origin.y} x2={resultEnd.x} y2={resultEnd.y} stroke="#f97316" strokeWidth="6" strokeLinecap="round" markerEnd="url(#arrow-r)" filter="url(#vector-shadow)" />

        <circle cx={origin.x} cy={origin.y} r="6" fill="#0f172a" stroke="#ffffff" strokeWidth="3" />
        <circle cx={resultEnd.x} cy={resultEnd.y} r="7" fill="#f97316" stroke="#ffffff" strokeWidth="3" />

        <text x={aEnd.x + 10} y={aEnd.y - 8} fill="#6d28d9" fontSize="13" fontWeight="900">A</text>
        <text x={bHeadTailEnd.x + 10} y={bHeadTailEnd.y - 8} fill="#0e7490" fontSize="13" fontWeight="900">B</text>
        <text x={resultEnd.x + 12} y={resultEnd.y + 18} fill="#ea580c" fontSize="14" fontWeight="900">R</text>
        <text x="520" y={ORIGIN_Y - 8} fill="#64748b" fontSize="12" fontWeight="900">x</text>
        <text x={ORIGIN_X + 10} y="32" fill="#64748b" fontSize="12" fontWeight="900">y</text>

        {logs.slice(-4).map((log, index) => {
          const end = pointFromVector(origin, { x: log.resultX, y: log.resultY });
          return (
            <g key={log.index} opacity={0.18 + index * 0.12}>
              <line x1={origin.x} y1={origin.y} x2={end.x} y2={end.y} stroke="#475569" strokeWidth="2" strokeDasharray="4 6" />
              <circle cx={end.x} cy={end.y} r="3" fill="#475569" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ComponentGraph({ vectorA, vectorB, result }: { vectorA: Vector; vectorB: Vector; result: Vector }) {
  const rows = [
    { label: "A", x: vectorA.x, y: vectorA.y, tone: "violet" },
    { label: "B", x: vectorB.x, y: vectorB.y, tone: "cyan" },
    { label: "R", x: result.x, y: result.y, tone: "orange" },
  ];
  const maxAbs = Math.max(...rows.flatMap((row) => [Math.abs(row.x), Math.abs(row.y)]), 1);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <LineChart className="h-4 w-4 text-violet-600" />
          Component graph
        </h3>
        <span className="font-mono text-[10px] font-bold text-violet-600">Rx = Ax + Bx</span>
      </div>
      <div className="grid flex-1 content-center gap-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-black text-slate-600">
              <span>{row.label}</span>
              <span className="font-mono">x {formatNumber(row.x)} | y {formatNumber(row.y)}</span>
            </div>
            <ComponentBar label="x" value={row.x} maxAbs={maxAbs} tone={row.tone} />
            <ComponentBar label="y" value={row.y} maxAbs={maxAbs} tone={row.tone} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ComponentBar({ label, value, maxAbs, tone }: { label: string; value: number; maxAbs: number; tone: string }) {
  const width = Math.max(4, (Math.abs(value) / maxAbs) * 50);
  const color = tone === "violet" ? "bg-violet-500" : tone === "cyan" ? "bg-cyan-500" : "bg-orange-500";
  return (
    <div className="grid grid-cols-[18px_1fr_46px] items-center gap-2 text-[11px] font-black text-slate-500">
      <span>{label}</span>
      <div className="relative h-4 rounded-full bg-slate-200">
        <div className="absolute left-1/2 top-0 h-full w-px bg-slate-400" />
        <div
          className={`absolute top-0 h-full rounded-full ${color}`}
          style={value >= 0 ? { left: "50%", width: `${width}%` } : { right: "50%", width: `${width}%` }}
        />
      </div>
      <span className="text-right font-mono">{formatNumber(value)}</span>
    </div>
  );
}

function VectorResultsTable({
  logs,
  onClearLog,
  onCopyData,
  onExportCSV,
}: {
  logs: VectorLog[];
  onClearLog: (index: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4 w-4 text-violet-600" />
          Vector log
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={onCopyData} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:bg-slate-100" aria-label="Copy vector data">
            <Clipboard className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onExportCSV} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:bg-slate-100" aria-label="Export vector CSV">
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-violet-50/80 text-[11px] font-black text-violet-800">
            <tr>
              <th className="px-3 py-2">log</th>
              <th className="px-3 py-2">A</th>
              <th className="px-3 py-2">B</th>
              <th className="px-3 py-2">R</th>
              <th className="px-3 py-2">components</th>
              <th className="px-3 py-2 text-center">del</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">No vector observations saved yet</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.index} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2 font-mono">#{log.index}</td>
                  <td className="px-3 py-2 font-mono text-violet-600">{formatNumber(log.aMagnitude)} at {formatNumber(log.aAngle)}</td>
                  <td className="px-3 py-2 font-mono text-cyan-600">{formatNumber(log.bMagnitude)} at {formatNumber(log.bAngle)}</td>
                  <td className="px-3 py-2 font-mono text-orange-600">{formatNumber(log.resultMagnitude)} at {formatNumber(log.resultAngle)}</td>
                  <td className="px-3 py-2 font-mono text-slate-700">({formatNumber(log.resultX)}, {formatNumber(log.resultY)})</td>
                  <td className="px-3 py-2 text-center">
                    <button type="button" onClick={() => onClearLog(log.index)} className="p-1 text-red-500 hover:text-red-700" aria-label={`Delete vector log ${log.index}`}>
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TheoryPanel({ vectorA, vectorB, result }: { vectorA: Vector; vectorB: Vector; result: Vector }) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Calculator className="h-4 w-4 text-violet-600" />
        Vector addition theory
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-4 text-center font-mono text-xl font-black text-slate-800">
          A + B = R
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500">
          Vectors add by components: Rx = Ax + Bx and Ry = Ay + By. The same result appears visually with the head-to-tail method: move vector B so its tail starts at the head of vector A, then draw the resultant from the original start point to the final head.
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">Ax: <b className="text-violet-700">{formatNumber(vectorA.x)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">Ay: <b className="text-violet-700">{formatNumber(vectorA.y)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">Bx: <b className="text-cyan-700">{formatNumber(vectorB.x)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">By: <b className="text-cyan-700">{formatNumber(vectorB.y)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">Rx: <b className="text-orange-700">{formatNumber(result.x)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">Ry: <b className="text-orange-700">{formatNumber(result.y)}</b></span>
        </div>
      </div>
    </section>
  );
}

export default function VectorAdditionSimulation() {
  const router = useRouter();
  const [aMagnitude, setAMagnitude] = useState(5);
  const [aAngle, setAAngle] = useState(30);
  const [bMagnitude, setBMagnitude] = useState(4);
  const [bAngle, setBAngle] = useState(125);
  const [logs, setLogs] = useState<VectorLog[]>([]);

  const vectorA = useMemo(() => makeVector(aMagnitude, aAngle), [aMagnitude, aAngle]);
  const vectorB = useMemo(() => makeVector(bMagnitude, bAngle), [bMagnitude, bAngle]);
  const result = useMemo(() => {
    const x = vectorA.x + vectorB.x;
    const y = vectorA.y + vectorB.y;
    const magnitude = Math.hypot(x, y);
    const angle = magnitude === 0 ? 0 : toDegrees(Math.atan2(y, x));
    return { magnitude, angle, x, y };
  }, [vectorA, vectorB]);

  const questProgress = useMemo(() => {
    const differentQuadrants = new Set(logs.map((log) => Math.floor(log.resultAngle / 90))).size >= 2;
    const triedCancellation = logs.some((log) => log.resultMagnitude < Math.max(log.aMagnitude, log.bMagnitude));
    return Math.min(100, logs.length * 18 + (differentQuadrants ? 18 : 0) + (triedCancellation ? 18 : 0));
  }, [logs]);

  const handleAddLog = () => {
    setLogs((current) => [
      ...current.slice(-(MAX_LOGS - 1)),
      {
        index: current.length > 0 ? Math.max(...current.map((log) => log.index)) + 1 : 1,
        aMagnitude,
        aAngle,
        bMagnitude,
        bAngle,
        resultMagnitude: result.magnitude,
        resultAngle: result.angle,
        resultX: result.x,
        resultY: result.y,
      },
    ]);
  };

  const handleReset = () => {
    setAMagnitude(5);
    setAAngle(30);
    setBMagnitude(4);
    setBAngle(125);
    setLogs([]);
  };

  const handleSwapVectors = () => {
    setAMagnitude(bMagnitude);
    setAAngle(bAngle);
    setBMagnitude(aMagnitude);
    setBAngle(aAngle);
  };

  const handleClearLog = (index: number) => {
    setLogs((current) => current.filter((log) => log.index !== index));
  };

  const handleCopyData = () => {
    if (logs.length === 0) {
      alert("No vector observations to copy yet.");
      return;
    }
    const content = logs
      .map((log) => `#${log.index}: A=${formatNumber(log.aMagnitude)} at ${formatNumber(log.aAngle)}, B=${formatNumber(log.bMagnitude)} at ${formatNumber(log.bAngle)}, R=(${formatNumber(log.resultX)}, ${formatNumber(log.resultY)}) |R|=${formatNumber(log.resultMagnitude)}`)
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("Copied vector data"));
  };

  const handleExportCSV = () => {
    const rowsToExport = logs.length > 0 ? logs : [{
      index: 1,
      aMagnitude,
      aAngle,
      bMagnitude,
      bAngle,
      resultMagnitude: result.magnitude,
      resultAngle: result.angle,
      resultX: result.x,
      resultY: result.y,
    }];
    const headers = "index,a_magnitude,a_angle,b_magnitude,b_angle,result_x,result_y,result_magnitude,result_angle\n";
    const csvRows = rowsToExport
      .map((log) => `${log.index},${log.aMagnitude},${log.aAngle},${log.bMagnitude},${log.bAngle},${log.resultX.toFixed(4)},${log.resultY.toFixed(4)},${log.resultMagnitude.toFixed(4)},${log.resultAngle.toFixed(4)}`)
      .join("\n");
    const blob = new Blob([headers + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scisiam_vector_addition_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveResults = async () => {
    if (logs.length === 0) {
      alert("Log at least one vector setup before saving the lab result.");
      return;
    }

    const experimentData = {
      labId: "vector-addition",
      timestamp: new Date().toLocaleString("th-TH"),
      vectors: { vectorA, vectorB, result },
      logs,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_vector_addition_experiment",
      localPayload: experimentData,
      labId: "vector-addition",
      title: "Vector Addition Lab",
      variables: { aMagnitude, aAngle, bMagnitude, bAngle },
      liveValues: {
        resultX: result.x,
        resultY: result.y,
        resultMagnitude: result.magnitude,
        resultAngle: result.angle,
        questProgress,
      },
      graphPoints: logs,
      tableRows: logs,
      prediction: { result },
      summary: {
        resultMagnitude: result.magnitude,
        resultAngle: result.angle,
        resultX: result.x,
        resultY: result.y,
        logCount: logs.length,
      },
      score: Math.min(100, Math.max(40, questProgress)),
      durationSeconds: null,
    });

    alert("Saved Vector Addition Lab result");
    router.push("/labs/vector-addition");
  };

  const controls = (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <ControlSlider label="Vector A magnitude" icon={ArrowRight} value={aMagnitude} min={0} max={9} step={0.5} tone="violet" onChange={setAMagnitude} />
        <ControlSlider label="Vector A angle" icon={Compass} value={aAngle} min={0} max={360} step={5} tone="violet" onChange={setAAngle} />
        <ControlSlider label="Vector B magnitude" icon={ArrowRight} value={bMagnitude} min={0} max={9} step={0.5} tone="cyan" onChange={setBMagnitude} />
        <ControlSlider label="Vector B angle" icon={Compass} value={bAngle} min={0} max={360} step={5} tone="cyan" onChange={setBAngle} />
      </div>

      <div className="grid grid-cols-4 gap-2 pt-1">
        <button type="button" onClick={handleAddLog} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2.5 text-xs font-black text-white shadow-sm hover:bg-rose-700">
          <Save className="h-4 w-4" />
          Log vectors
        </button>
        <button type="button" onClick={handleSwapVectors} className="inline-flex items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-xs font-black text-cyan-700 hover:bg-cyan-100">
          swap
        </button>
        <button type="button" onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Reset vector lab">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const compactControls = (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_170px]">
      <label className="text-xs font-black text-slate-600">
        A angle {formatNumber(aAngle)}
        <input type="range" min="0" max="360" step="5" value={aAngle} onChange={(event) => setAAngle(Number(event.target.value))} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-violet-600" />
      </label>
      <label className="text-xs font-black text-slate-600">
        B angle {formatNumber(bAngle)}
        <input type="range" min="0" max="360" step="5" value={bAngle} onChange={(event) => setBAngle(Number(event.target.value))} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-cyan-600" />
      </label>
      <button type="button" onClick={handleAddLog} className="min-h-11 rounded-xl bg-rose-600 px-3 py-2 text-xs font-black text-white hover:bg-rose-700">
        Log R {formatNumber(result.magnitude)}
      </button>
    </div>
  );

  const drawerSummary = (
    <div className="space-y-3">
      <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3">
        <p className="text-[10px] font-black uppercase text-violet-600">Manual number input</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">Type vector magnitudes and angles directly, or use the sliders.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ManualNumberInput label="A |A|" ariaLabel="Enter vector A magnitude" value={aMagnitude} min={0} max={9} step={0.5} tone="violet" onChange={setAMagnitude} />
        <ManualNumberInput label="A angle" ariaLabel="Enter vector A angle" value={aAngle} min={0} max={360} step={5} tone="violet" onChange={setAAngle} />
        <ManualNumberInput label="B |B|" ariaLabel="Enter vector B magnitude" value={bMagnitude} min={0} max={9} step={0.5} tone="cyan" onChange={setBMagnitude} />
        <ManualNumberInput label="B angle" ariaLabel="Enter vector B angle" value={bAngle} min={0} max={360} step={5} tone="cyan" onChange={setBAngle} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-black">
        <span className="rounded-xl bg-violet-50 px-3 py-2 text-violet-700">A: ({formatNumber(vectorA.x)}, {formatNumber(vectorA.y)})</span>
        <span className="rounded-xl bg-cyan-50 px-3 py-2 text-cyan-700">B: ({formatNumber(vectorB.x)}, {formatNumber(vectorB.y)})</span>
        <span className="rounded-xl bg-orange-50 px-3 py-2 text-orange-700">Rx: {formatNumber(result.x)}</span>
        <span className="rounded-xl bg-orange-50 px-3 py-2 text-orange-700">Ry: {formatNumber(result.y)}</span>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="violet"
      labId="vector-addition"
      category="Mathematics"
      title="Vector Addition Lab"
      subtitle="Adjust magnitudes and angles to see vector addition by components and by the head-to-tail geometric method."
      statusLabel="Interactive vector ready"
      icon={MoveRight}
      sceneTitle="Vector addition workspace"
      scene={<VectorStage vectorA={vectorA} vectorB={vectorB} result={result} logs={logs} />}
      controlsTitle="Vector controls"
      controls={controls}
      compactControls={compactControls}
      drawerSummary={drawerSummary}
      metrics={[
        { label: "A components", value: `(${formatNumber(vectorA.x)}, ${formatNumber(vectorA.y)})`, tone: "violet" },
        { label: "B components", value: `(${formatNumber(vectorB.x)}, ${formatNumber(vectorB.y)})`, tone: "cyan" },
        { label: "Result |R|", value: formatNumber(result.magnitude), tone: "orange" },
        { label: "Result angle", value: formatNumber(result.angle), tone: "emerald" },
      ]}
      graph={<ComponentGraph vectorA={vectorA} vectorB={vectorB} result={result} />}
      table={<VectorResultsTable logs={logs} onClearLog={handleClearLog} onCopyData={handleCopyData} onExportCSV={handleExportCSV} />}
      theory={<TheoryPanel vectorA={vectorA} vectorB={vectorB} result={result} />}
      steps={[
        { label: "Set vector A", icon: ArrowRight },
        { label: "Set vector B", icon: ArrowRight },
        { label: "Read head-to-tail sum", icon: MoveRight },
        { label: "Compare x-y components", icon: Calculator },
        { label: "Log the resultant", icon: ClipboardList },
      ]}
      learningGoals={[
        "Add vectors by x and y components.",
        "Explain the head-to-tail geometric method.",
        "Connect resultant magnitude and direction to component sums.",
        "Compare cases where vectors reinforce or partially cancel each other.",
      ]}
      progressLabel="Vector addition mission"
      progressValue={`${questProgress.toFixed(0)} / 100 progress`}
      progressPercent={questProgress}
      tips={[
        "Changing the order of A and B does not change the resultant.",
        "Opposite directions can reduce the resultant magnitude.",
        "Use components when visual estimates are difficult.",
        "The resultant starts at the original tail and ends at the final head.",
      ]}
      scoreLabel="+25 points"
      onSave={handleSaveResults}
    />
  );
}

function ControlSlider({
  label,
  icon: Icon,
  value,
  min,
  max,
  step,
  tone,
  onChange,
}: {
  label: string;
  icon: LucideIcon;
  value: number;
  min: number;
  max: number;
  step: number;
  tone: "violet" | "cyan";
  onChange: (value: number) => void;
}) {
  const toneClasses = {
    violet: "text-violet-600 bg-violet-50 border-violet-100 accent-violet-600",
    cyan: "text-cyan-600 bg-cyan-50 border-cyan-100 accent-cyan-600",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
        <span className="flex items-center gap-1.5 text-slate-600">
          <Icon className={`h-4 w-4 ${toneClasses.split(" ")[0]}`} />
          {label}
        </span>
        <span className={`rounded border px-2.5 py-0.5 text-xs font-extrabold ${toneClasses}`}>{formatNumber(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(clampNumber(Number(event.target.value), min, max))}
        className={`h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 ${toneClasses.split(" ").at(-1)}`}
      />
    </div>
  );
}
