"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Calculator,
  Clipboard,
  ClipboardList,
  Download,
  LineChart,
  Plus,
  RotateCcw,
  Save,
  Sliders,
  Target,
  Trash,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

type FitMode = "linear" | "quadratic";

interface DataPoint {
  id: number;
  x: number;
  y: number;
}

interface FitResult {
  mode: FitMode;
  a: number;
  b: number;
  c: number;
  equation: string;
  rSquared: number;
  sse: number;
  residuals: Array<{ id: number; x: number; y: number; predicted: number; residual: number }>;
}

interface FitLog {
  index: number;
  mode: FitMode;
  equation: string;
  rSquared: number;
  sse: number;
  points: DataPoint[];
}

const MAX_LOGS = 12;
const X_MIN = 0;
const X_MAX = 10;
const Y_MIN = 0;
const Y_MAX = 20;
const CHART_LEFT = 56;
const CHART_RIGHT = 516;
const CHART_TOP = 46;
const CHART_BOTTOM = 318;

const PRESETS = {
  linear: [
    { id: 1, x: 1, y: 3 },
    { id: 2, x: 2, y: 5 },
    { id: 3, x: 3, y: 7 },
    { id: 4, x: 5, y: 10 },
    { id: 5, x: 7, y: 15 },
    { id: 6, x: 9, y: 18 },
  ],
  curved: [
    { id: 1, x: 1, y: 2 },
    { id: 2, x: 2, y: 3 },
    { id: 3, x: 3, y: 5 },
    { id: 4, x: 5, y: 10 },
    { id: 5, x: 7, y: 15 },
    { id: 6, x: 9, y: 19 },
  ],
  noisy: [
    { id: 1, x: 1, y: 4 },
    { id: 2, x: 2, y: 6 },
    { id: 3, x: 4, y: 7 },
    { id: 4, x: 5, y: 12 },
    { id: 5, x: 7, y: 13 },
    { id: 6, x: 9, y: 19 },
  ],
} satisfies Record<string, DataPoint[]>;

function formatNumber(value: number) {
  const rounded = Math.abs(value) < 0.005 ? 0 : value;
  return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2);
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function predict(fit: Pick<FitResult, "mode" | "a" | "b" | "c">, x: number) {
  return fit.mode === "linear" ? fit.a * x + fit.b : fit.a * x * x + fit.b * x + fit.c;
}

function solve3x3(matrix: number[][], vector: number[]) {
  const augmented = matrix.map((row, index) => [...row, vector[index]]);

  for (let column = 0; column < 3; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < 3; row += 1) {
      if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) {
        pivot = row;
      }
    }

    if (Math.abs(augmented[pivot][column]) < 1e-9) return null;
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];

    const divisor = augmented[column][column];
    for (let item = column; item < 4; item += 1) {
      augmented[column][item] /= divisor;
    }

    for (let row = 0; row < 3; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let item = column; item < 4; item += 1) {
        augmented[row][item] -= factor * augmented[column][item];
      }
    }
  }

  return [augmented[0][3], augmented[1][3], augmented[2][3]] as const;
}

function calculateFit(points: DataPoint[], mode: FitMode): FitResult {
  const n = points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / n;
  let a = 0;
  let b = 0;
  let c = 0;

  if (mode === "linear") {
    const sumX = points.reduce((sum, point) => sum + point.x, 0);
    const sumY = points.reduce((sum, point) => sum + point.y, 0);
    const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);
    const denominator = n * sumXX - sumX * sumX;
    a = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
    b = (sumY - a * sumX) / n;
  } else {
    const sumX = points.reduce((sum, point) => sum + point.x, 0);
    const sumX2 = points.reduce((sum, point) => sum + point.x ** 2, 0);
    const sumX3 = points.reduce((sum, point) => sum + point.x ** 3, 0);
    const sumX4 = points.reduce((sum, point) => sum + point.x ** 4, 0);
    const sumY = points.reduce((sum, point) => sum + point.y, 0);
    const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumX2Y = points.reduce((sum, point) => sum + point.x ** 2 * point.y, 0);
    const solved = solve3x3(
      [
        [sumX4, sumX3, sumX2],
        [sumX3, sumX2, sumX],
        [sumX2, sumX, n],
      ],
      [sumX2Y, sumXY, sumY],
    );
    [a, b, c] = solved ?? [0, 0, meanY];
  }

  const residuals = points.map((point) => {
    const predicted = predict({ mode, a, b, c }, point.x);
    return {
      ...point,
      predicted,
      residual: point.y - predicted,
    };
  });
  const sse = residuals.reduce((sum, item) => sum + item.residual ** 2, 0);
  const sst = points.reduce((sum, point) => sum + (point.y - meanY) ** 2, 0);
  const rSquared = sst === 0 ? 1 : Math.max(0, Math.min(1, 1 - sse / sst));
  const equation = mode === "linear"
    ? `y = ${formatNumber(a)}x ${b >= 0 ? "+" : "-"} ${formatNumber(Math.abs(b))}`
    : `y = ${formatNumber(a)}x^2 ${b >= 0 ? "+" : "-"} ${formatNumber(Math.abs(b))}x ${c >= 0 ? "+" : "-"} ${formatNumber(Math.abs(c))}`;

  return { mode, a, b, c, equation, rSquared, sse, residuals };
}

function CurveStage({ points, fit, logs }: { points: DataPoint[]; fit: FitResult; logs: FitLog[] }) {
  const xToSvg = (x: number) => CHART_LEFT + ((x - X_MIN) / (X_MAX - X_MIN)) * (CHART_RIGHT - CHART_LEFT);
  const yToSvg = (y: number) => CHART_BOTTOM - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (CHART_BOTTOM - CHART_TOP);
  const trendSamples = Array.from({ length: 81 }, (_, index) => {
    const x = X_MIN + (index / 80) * (X_MAX - X_MIN);
    return {
      x,
      y: clampNumber(predict(fit, x), Y_MIN, Y_MAX),
    };
  });
  const trendPath = trendSamples.map((point, index) => `${index === 0 ? "M" : "L"}${xToSvg(point.x)},${yToSvg(point.y)}`).join(" ");

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-4">
      <div data-testid="curve-fitting-stage-header" className="relative z-10 grid shrink-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,320px)]">
        <div className="rounded-2xl border border-white/80 bg-white/92 px-4 py-3 shadow-lg shadow-violet-100/70 backdrop-blur-md">
          <p className="text-[10px] font-black uppercase text-violet-500">Curve Fitting & Trend Lines</p>
          <p className="mt-1 truncate font-mono text-lg font-black text-slate-900">{fit.equation}</p>
          <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
            trend line model: {fit.mode} | R^2 = {formatNumber(fit.rSquared)} | residual SSE = {formatNumber(fit.sse)}
          </p>
        </div>

        <div className="hidden rounded-2xl border border-cyan-100 bg-white/95 px-4 py-3 shadow-lg shadow-cyan-100/80 backdrop-blur-md md:block">
          <p className="text-[10px] font-black text-cyan-600">Residual view</p>
          <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">Shorter residual lines usually mean a better fit.</p>
        </div>
      </div>

      <svg data-testid="curve-fitting-chart" className="min-h-0 flex-1" viewBox="0 0 580 380" fill="none" role="img" aria-label="Curve fitting scatter plot with trend line and residuals">
        <defs>
          <filter id="curve-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#64748b" floodOpacity="0.16" />
          </filter>
          <linearGradient id="trend-gradient" x1="60" y1="300" x2="516" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0891b2" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        <rect x={CHART_LEFT} y={CHART_TOP} width={CHART_RIGHT - CHART_LEFT} height={CHART_BOTTOM - CHART_TOP} rx="20" fill="#ffffff" stroke="#ddd6fe" strokeWidth="2" />
        {Array.from({ length: 11 }, (_, index) => index).map((value) => {
          const x = xToSvg(value);
          return (
            <g key={`x-${value}`}>
              <line x1={x} y1={CHART_TOP} x2={x} y2={CHART_BOTTOM} stroke={value % 2 === 0 ? "#e2e8f0" : "#f1f5f9"} />
              {value % 2 === 0 && <text x={x} y={CHART_BOTTOM + 18} fill="#64748b" fontSize="10" fontWeight="900" textAnchor="middle">{value}</text>}
            </g>
          );
        })}
        {Array.from({ length: 6 }, (_, index) => index * 4).map((value) => {
          const y = yToSvg(value);
          return (
            <g key={`y-${value}`}>
              <line x1={CHART_LEFT} y1={y} x2={CHART_RIGHT} y2={y} stroke={value % 8 === 0 ? "#e2e8f0" : "#f1f5f9"} />
              <text x={CHART_LEFT - 12} y={y + 4} fill="#64748b" fontSize="10" fontWeight="900" textAnchor="end">{value}</text>
            </g>
          );
        })}

        {fit.residuals.map((item) => (
          <line
            key={`residual-${item.id}`}
            x1={xToSvg(item.x)}
            y1={yToSvg(item.y)}
            x2={xToSvg(item.x)}
            y2={yToSvg(clampNumber(item.predicted, Y_MIN, Y_MAX))}
            stroke="#f97316"
            strokeWidth="2.5"
            strokeDasharray="6 5"
            opacity="0.7"
          />
        ))}

        <path d={trendPath} stroke="url(#trend-gradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#curve-shadow)" />

        {points.map((point) => (
          <g key={point.id} filter="url(#curve-shadow)">
            <circle cx={xToSvg(point.x)} cy={yToSvg(point.y)} r="9" fill="#7c3aed" stroke="#ffffff" strokeWidth="3" />
            <text x={xToSvg(point.x)} y={yToSvg(point.y) - 13} fill="#5b21b6" fontSize="10" fontWeight="900" textAnchor="middle">P{point.id}</text>
          </g>
        ))}

        {logs.slice(-3).map((log, index) => (
          <text key={log.index} x="390" y={338 + index * 14} fill="#64748b" fontSize="10" fontWeight="800">
            #{log.index} {log.mode} R^2 {formatNumber(log.rSquared)}
          </text>
        ))}

        <text x={CHART_RIGHT + 12} y={CHART_BOTTOM + 4} fill="#64748b" fontSize="12" fontWeight="900">x</text>
        <text x={CHART_LEFT - 4} y={CHART_TOP - 14} fill="#64748b" fontSize="12" fontWeight="900">y</text>
      </svg>
    </div>
  );
}

function ResidualGraph({ fit }: { fit: FitResult }) {
  const maxAbs = Math.max(...fit.residuals.map((item) => Math.abs(item.residual)), 1);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <BarChart3 className="h-4 w-4 text-violet-600" />
          Residual plot
        </h3>
        <span className="font-mono text-[10px] font-bold text-violet-600">actual - predicted</span>
      </div>
      <div className="grid flex-1 content-center gap-2">
        {fit.residuals.map((item) => {
          const width = Math.max(4, (Math.abs(item.residual) / maxAbs) * 50);
          return (
            <div key={item.id} className="grid grid-cols-[34px_1fr_52px] items-center gap-2 text-[11px] font-black text-slate-500">
              <span>P{item.id}</span>
              <div className="relative h-5 rounded-full bg-slate-200">
                <div className="absolute left-1/2 top-0 h-full w-px bg-slate-400" />
                <div
                  className={`absolute top-0 h-full rounded-full ${item.residual >= 0 ? "bg-emerald-500" : "bg-orange-500"}`}
                  style={item.residual >= 0 ? { left: "50%", width: `${width}%` } : { right: "50%", width: `${width}%` }}
                />
              </div>
              <span className="text-right font-mono">{formatNumber(item.residual)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FitTable({
  points,
  fit,
  logs,
  onClearLog,
  onCopyData,
  onExportCSV,
}: {
  points: DataPoint[];
  fit: FitResult;
  logs: FitLog[];
  onClearLog: (index: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4 w-4 text-violet-600" />
          Fit table
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={onCopyData} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:bg-slate-100" aria-label="Copy curve fitting data">
            <Clipboard className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onExportCSV} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:bg-slate-100" aria-label="Export curve fitting CSV">
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid flex-1 gap-3 overflow-auto md:grid-cols-2">
        <div className="rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-violet-50/80 text-[11px] font-black text-violet-800">
              <tr>
                <th className="px-3 py-2">point</th>
                <th className="px-3 py-2">x</th>
                <th className="px-3 py-2">y</th>
                <th className="px-3 py-2">predicted</th>
                <th className="px-3 py-2">residual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
              {points.map((point) => {
                const residual = fit.residuals.find((item) => item.id === point.id);
                return (
                  <tr key={point.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2 font-mono">P{point.id}</td>
                    <td className="px-3 py-2 font-mono text-violet-600">{formatNumber(point.x)}</td>
                    <td className="px-3 py-2 font-mono text-cyan-600">{formatNumber(point.y)}</td>
                    <td className="px-3 py-2 font-mono text-orange-600">{formatNumber(residual?.predicted ?? 0)}</td>
                    <td className="px-3 py-2 font-mono text-slate-700">{formatNumber(residual?.residual ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-cyan-50/80 text-[11px] font-black text-cyan-800">
              <tr>
                <th className="px-3 py-2">log</th>
                <th className="px-3 py-2">model</th>
                <th className="px-3 py-2">R^2</th>
                <th className="px-3 py-2">SSE</th>
                <th className="px-3 py-2 text-center">del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No model snapshots saved yet</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.index} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2 font-mono">#{log.index}</td>
                    <td className="px-3 py-2 font-mono text-violet-600">{log.mode}</td>
                    <td className="px-3 py-2 font-mono text-cyan-600">{formatNumber(log.rSquared)}</td>
                    <td className="px-3 py-2 font-mono text-orange-600">{formatNumber(log.sse)}</td>
                    <td className="px-3 py-2 text-center">
                      <button type="button" onClick={() => onClearLog(log.index)} className="p-1 text-red-500 hover:text-red-700" aria-label={`Delete curve fit log ${log.index}`}>
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function TheoryPanel({ fit }: { fit: FitResult }) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Calculator className="h-4 w-4 text-violet-600" />
        Curve fitting theory
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-4 text-center font-mono text-lg font-black text-slate-800">
          trend line + residual + R^2
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500">
          Curve fitting chooses a model that keeps predictions close to observed data. A residual is actual y minus predicted y. R^2 describes how much variation the trend line explains; values closer to 1 indicate a stronger fit for the current data.
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">model: <b className="text-violet-700">{fit.mode}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">R^2: <b className="text-cyan-700">{formatNumber(fit.rSquared)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">SSE: <b className="text-orange-700">{formatNumber(fit.sse)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">equation: <b className="text-violet-700">{fit.equation}</b></span>
        </div>
      </div>
    </section>
  );
}

export default function CurveFittingSimulation() {
  const [points, setPoints] = useState<DataPoint[]>(PRESETS.linear);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<FitMode>("linear");
  const [logs, setLogs] = useState<FitLog[]>([]);

  const fit = useMemo(() => calculateFit(points, mode), [points, mode]);
  const selectedPoint = points[selectedIndex] ?? points[0];
  const questProgress = useMemo(() => {
    const comparedModels = new Set(logs.map((log) => log.mode)).size >= 2;
    const highFit = logs.some((log) => log.rSquared >= 0.9);
    return Math.min(100, logs.length * 18 + (comparedModels ? 22 : 0) + (highFit ? 18 : 0));
  }, [logs]);

  const updatePoint = (index: number, updates: Partial<Pick<DataPoint, "x" | "y">>) => {
    setPoints((current) => current.map((point, pointIndex) => (
      pointIndex === index
        ? {
            ...point,
            x: clampNumber(updates.x ?? point.x, X_MIN, X_MAX),
            y: clampNumber(updates.y ?? point.y, Y_MIN, Y_MAX),
          }
        : point
    )));
  };

  const handleAddLog = () => {
    setLogs((current) => [
      ...current.slice(-(MAX_LOGS - 1)),
      {
        index: current.length > 0 ? Math.max(...current.map((log) => log.index)) + 1 : 1,
        mode,
        equation: fit.equation,
        rSquared: fit.rSquared,
        sse: fit.sse,
        points,
      },
    ]);
  };

  const handleReset = () => {
    setPoints(PRESETS.linear);
    setMode("linear");
    setSelectedIndex(0);
    setLogs([]);
  };

  const handleClearLog = (index: number) => {
    setLogs((current) => current.filter((log) => log.index !== index));
  };

  const handleCopyData = () => {
    const content = `${fit.equation}\nR^2=${formatNumber(fit.rSquared)}\nSSE=${formatNumber(fit.sse)}\npoints=${points.map((point) => `(${point.x},${point.y})`).join(" ")}`;
    navigator.clipboard.writeText(content).then(() => alert("Copied curve fitting data"));
  };

  const handleExportCSV = () => {
    const headers = "point,x,y,predicted,residual,model,equation,r_squared,sse\n";
    const rows = fit.residuals
      .map((item) => `${item.id},${item.x},${item.y},${item.predicted.toFixed(4)},${item.residual.toFixed(4)},${fit.mode},"${fit.equation}",${fit.rSquared.toFixed(4)},${fit.sse.toFixed(4)}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scisiam_curve_fitting_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveResults = async () => {
    if (logs.length === 0) {
      alert("Log at least one trend line model before saving the lab result.");
      return;
    }

    const experimentData = {
      labId: "curve-fitting",
      timestamp: new Date().toLocaleString("th-TH"),
      points,
      fit,
      logs,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_curve_fitting_experiment",
      localPayload: experimentData,
      labId: "curve-fitting",
      title: "Curve Fitting & Trend Lines",
      variables: { points, mode },
      liveValues: {
        equation: fit.equation,
        rSquared: fit.rSquared,
        sse: fit.sse,
        questProgress,
      },
      graphPoints: fit.residuals,
      tableRows: logs,
      prediction: { equation: fit.equation, rSquared: fit.rSquared },
      summary: {
        mode,
        equation: fit.equation,
        rSquared: fit.rSquared,
        sse: fit.sse,
        logCount: logs.length,
      },
      score: Math.min(100, Math.max(40, questProgress)),
      durationSeconds: null,
    });

    alert("Saved Curve Fitting & Trend Lines result");
  };

  const controls = (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={() => { setPoints(PRESETS.linear); setSelectedIndex(0); setMode("linear"); }} className="rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 hover:bg-violet-100">
          linear data
        </button>
        <button type="button" onClick={() => { setPoints(PRESETS.curved); setSelectedIndex(0); setMode("quadratic"); }} className="rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700 hover:bg-cyan-100">
          curved data
        </button>
        <button type="button" onClick={() => { setPoints(PRESETS.noisy); setSelectedIndex(0); }} className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-black text-orange-700 hover:bg-orange-100">
          noisy data
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setMode("linear")} className={`rounded-xl border px-3 py-2 text-xs font-black ${mode === "linear" ? "border-pink-200 bg-pink-200 text-pink-900" : "border-pink-100 bg-pink-50 text-pink-900"}`}>
          linear trend line
        </button>
        <button type="button" onClick={() => setMode("quadratic")} className={`rounded-xl border px-3 py-2 text-xs font-black ${mode === "quadratic" ? "border-cyan-200 bg-cyan-600 text-white" : "border-cyan-100 bg-cyan-50 text-cyan-700"}`}>
          quadratic curve
        </button>
      </div>

      <ControlSlider label="selected point" icon={Target} value={selectedIndex + 1} min={1} max={points.length} step={1} tone="violet" onChange={(value) => setSelectedIndex(value - 1)} />
      <ControlSlider label="x coordinate" icon={Sliders} value={selectedPoint.x} min={X_MIN} max={X_MAX} step={0.5} tone="cyan" onChange={(value) => updatePoint(selectedIndex, { x: value })} />
      <ControlSlider label="y coordinate" icon={Sliders} value={selectedPoint.y} min={Y_MIN} max={Y_MAX} step={0.5} tone="orange" onChange={(value) => updatePoint(selectedIndex, { y: value })} />

      <div className="grid grid-cols-4 gap-2 pt-1">
        <button type="button" onClick={handleAddLog} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-pink-200 px-3 py-2.5 text-xs font-black text-pink-900 shadow-sm hover:bg-pink-300">
          <Save className="h-4 w-4" />
          Log model
        </button>
        <button type="button" onClick={() => setPoints((current) => current.map((point, index) => index === current.length - 1 ? { ...point, y: 4 } : point))} className="inline-flex items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-xs font-black text-orange-700 hover:bg-orange-100">
          <Plus className="h-4 w-4" />
        </button>
        <button type="button" onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Reset curve fitting lab">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const compactControls = (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_170px]">
      <label className="text-xs font-black text-slate-600">
        y of P{selectedPoint.id}: {formatNumber(selectedPoint.y)}
        <input type="range" min={Y_MIN} max={Y_MAX} step="0.5" value={selectedPoint.y} onChange={(event) => updatePoint(selectedIndex, { y: Number(event.target.value) })} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-violet-600" />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setMode("linear")} className={`rounded-xl px-3 py-2 text-xs font-black ${mode === "linear" ? "bg-pink-200 text-pink-900" : "bg-pink-50 text-pink-900"}`}>
          linear
        </button>
        <button type="button" onClick={() => setMode("quadratic")} className={`rounded-xl px-3 py-2 text-xs font-black ${mode === "quadratic" ? "bg-cyan-600 text-white" : "bg-cyan-50 text-cyan-700"}`}>
          quad
        </button>
      </div>
      <button type="button" onClick={handleAddLog} className="min-h-11 rounded-xl bg-pink-200 px-3 py-2 text-xs font-black text-pink-900 hover:bg-pink-300">
        Log R^2 {formatNumber(fit.rSquared)}
      </button>
    </div>
  );

  const drawerSummary = (
    <div className="space-y-3">
      <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3">
        <p className="text-[10px] font-black uppercase text-violet-600">Manual number input</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">Select a data point, then type x-y values to refit the trend line.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ManualNumberInput label="point" ariaLabel="Enter selected trend point" value={selectedIndex + 1} min={1} max={points.length} step={1} tone="violet" onChange={(value) => setSelectedIndex(Math.round(value) - 1)} />
        <ManualNumberInput label="x" ariaLabel="Enter selected point x" value={selectedPoint.x} min={X_MIN} max={X_MAX} step={0.5} tone="cyan" onChange={(value) => updatePoint(selectedIndex, { x: value })} />
        <ManualNumberInput label="y" ariaLabel="Enter selected point y" value={selectedPoint.y} min={Y_MIN} max={Y_MAX} step={0.5} tone="orange" onChange={(value) => updatePoint(selectedIndex, { y: value })} />
        <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700">
          fit<br />
          <span className="font-mono text-base">{formatNumber(fit.rSquared)}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-black">
        <span className="rounded-xl bg-violet-50 px-3 py-2 text-violet-700">model: {fit.mode}</span>
        <span className="rounded-xl bg-cyan-50 px-3 py-2 text-cyan-700">R^2: {formatNumber(fit.rSquared)}</span>
        <span className="col-span-2 rounded-xl bg-orange-50 px-3 py-2 text-orange-700">SSE: {formatNumber(fit.sse)}</span>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="violet"
      labId="curve-fitting"
      category="Mathematics"
      title="Curve Fitting & Trend Lines"
      subtitle="Adjust data points, compare linear and quadratic models, and evaluate fit quality with residuals and R^2."
      statusLabel="Interactive trend ready"
      icon={LineChart}
      sceneTitle="Curve fitting workspace"
      scene={<CurveStage points={points} fit={fit} logs={logs} />}
      controlsTitle="Trend line controls"
      controls={controls}
      compactControls={compactControls}
      drawerSummary={drawerSummary}
      metrics={[
        { label: "trend line", value: fit.mode, tone: "violet" },
        { label: "R^2", value: formatNumber(fit.rSquared), tone: "cyan" },
        { label: "SSE", value: formatNumber(fit.sse), tone: "orange" },
        { label: "points", value: String(points.length), tone: "emerald" },
      ]}
      graph={<ResidualGraph fit={fit} />}
      table={<FitTable points={points} fit={fit} logs={logs} onClearLog={handleClearLog} onCopyData={handleCopyData} onExportCSV={handleExportCSV} />}
      theory={<TheoryPanel fit={fit} />}
      steps={[
        { label: "Choose data pattern", icon: Activity },
        { label: "Select trend line model", icon: LineChart },
        { label: "Adjust a data point", icon: Sliders },
        { label: "Read residuals and R^2", icon: BarChart3 },
        { label: "Log the model", icon: ClipboardList },
      ]}
      learningGoals={[
        "Fit a linear trend line to scatter plot data.",
        "Compare linear and quadratic models for curved patterns.",
        "Interpret residuals as actual minus predicted values.",
        "Use R^2 and SSE to judge model fit quality.",
      ]}
      progressLabel="Trend modeling mission"
      progressValue={`${questProgress.toFixed(0)} / 100 progress`}
      progressPercent={questProgress}
      tips={[
        "A good trend line follows the overall pattern, not every point exactly.",
        "Residuals above zero mean the observed point is above the model.",
        "R^2 closer to 1 means the model explains more variation.",
        "Quadratic curves can fit bending data better, but compare residuals before deciding.",
      ]}
      onRun={handleAddLog}
      onReset={handleReset}
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
  icon: typeof Sliders;
  value: number;
  min: number;
  max: number;
  step: number;
  tone: "violet" | "cyan" | "orange";
  onChange: (value: number) => void;
}) {
  const toneClasses = {
    violet: "text-violet-600 bg-violet-50 border-violet-100 accent-violet-600",
    cyan: "text-cyan-600 bg-cyan-50 border-cyan-100 accent-cyan-600",
    orange: "text-orange-600 bg-orange-50 border-orange-100 accent-orange-500",
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
