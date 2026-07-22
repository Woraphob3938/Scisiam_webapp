"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
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

interface StatsSummary {
  sorted: number[];
  mean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  mad: number;
  standardDeviation: number;
}

interface StatsLog {
  index: number;
  data: number[];
  mean: number;
  median: number;
  range: number;
  iqr: number;
  standardDeviation: number;
}

const MAX_LOGS = 12;
const PRESETS = {
  balanced: [4, 5, 5, 6, 7, 8, 8, 9],
  outlier: [3, 4, 5, 5, 6, 7, 8, 18],
  clustered: [6, 6, 7, 7, 7, 8, 8, 9],
} satisfies Record<string, number[]>;

function formatNumber(value: number) {
  const rounded = Math.abs(value) < 0.005 ? 0 : value;
  return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2);
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const middle = Math.floor(values.length / 2);
  return values.length % 2 === 0
    ? (values[middle - 1] + values[middle]) / 2
    : values[middle];
}

function calculateStats(data: number[]): StatsSummary {
  const sorted = [...data].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const med = median(sorted);
  const lowerHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const upperHalf = sorted.slice(Math.ceil(sorted.length / 2));
  const q1 = median(lowerHalf);
  const q3 = median(upperHalf);
  const counts = new Map<number, number>();
  sorted.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  const maxCount = Math.max(...counts.values());
  const mode = [...counts.entries()]
    .filter(([, count]) => count === maxCount && count > 1)
    .map(([value]) => value);
  const variance = sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / sorted.length;

  return {
    sorted,
    mean,
    median: med,
    mode,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    range: sorted[sorted.length - 1] - sorted[0],
    q1,
    q3,
    iqr: q3 - q1,
    mad: sorted.reduce((sum, value) => sum + Math.abs(value - mean), 0) / sorted.length,
    standardDeviation: Math.sqrt(variance),
  };
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function CenterStage({ data, stats, logs }: { data: number[]; stats: StatsSummary; logs: StatsLog[] }) {
  const minScale = 0;
  const maxScale = 20;
  const xForValue = (value: number) => 56 + ((value - minScale) / (maxScale - minScale)) * 448;
  const stackCounts = new Map<number, number>();
  const points = data.map((value, index) => {
    const stack = stackCounts.get(value) ?? 0;
    stackCounts.set(value, stack + 1);
    return {
      value,
      index,
      x: xForValue(value),
      y: 254 - stack * 24,
    };
  });

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-violet-50 via-white to-cyan-50">
      <div className="absolute left-4 top-4 z-10 max-w-[420px] rounded-2xl border border-white/80 bg-white/92 px-4 py-3 shadow-lg shadow-violet-100/70 backdrop-blur-md">
        <p className="text-[10px] font-black uppercase text-violet-500">Center & Variability</p>
        <p className="mt-1 font-mono text-xl font-black text-slate-900">
          mean {formatNumber(stats.mean)} | median {formatNumber(stats.median)}
        </p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
          IQR = {formatNumber(stats.iqr)} | standard deviation = {formatNumber(stats.standardDeviation)}
        </p>
      </div>

      <div className="absolute right-5 top-5 z-10 hidden rounded-2xl border border-cyan-100 bg-white/95 px-4 py-3 shadow-lg shadow-cyan-100/80 backdrop-blur-md md:block">
        <p className="text-[10px] font-black text-cyan-600">Outlier check</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
          Compare how mean and median move when the spread changes.
        </p>
      </div>

      <svg className="h-full w-full" viewBox="0 0 560 360" fill="none" role="img" aria-label="Dot plot and box plot for center and variability">
        <defs>
          <filter id="stats-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#64748b" floodOpacity="0.18" />
          </filter>
        </defs>

        <rect x="34" y="128" width="492" height="172" rx="22" fill="white" stroke="#ddd6fe" strokeWidth="2" />
        {Array.from({ length: 11 }, (_, index) => index * 2).map((value) => {
          const x = xForValue(value);
          return (
            <g key={value}>
              <line x1={x} y1="144" x2={x} y2="276" stroke={value % 4 === 0 ? "#cbd5e1" : "#e2e8f0"} />
              <text x={x} y="292" fill="#64748b" fontSize="10" fontWeight="900" textAnchor="middle">{value}</text>
            </g>
          );
        })}
        <line x1="56" y1="276" x2="504" y2="276" stroke="#64748b" strokeWidth="2" />

        <line x1={xForValue(stats.mean)} y1="136" x2={xForValue(stats.mean)} y2="274" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
        <line x1={xForValue(stats.median)} y1="136" x2={xForValue(stats.median)} y2="274" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />
        <text x={xForValue(stats.mean) + 8} y="150" fill="#ea580c" fontSize="11" fontWeight="900">mean</text>
        <text x={xForValue(stats.median) + 8} y="168" fill="#6d28d9" fontSize="11" fontWeight="900">median</text>

        {points.map((point) => (
          <g key={`${point.index}-${point.value}`} filter="url(#stats-shadow)">
            <circle cx={point.x} cy={point.y} r="10" fill="#0891b2" stroke="#ffffff" strokeWidth="3" />
            <text x={point.x} y={point.y + 4} fill="white" fontSize="9" fontWeight="900" textAnchor="middle">{point.value}</text>
          </g>
        ))}

        <g transform="translate(0 316)">
          <line x1={xForValue(stats.min)} y1="0" x2={xForValue(stats.max)} y2="0" stroke="#334155" strokeWidth="3" />
          <rect x={xForValue(stats.q1)} y="-18" width={Math.max(4, xForValue(stats.q3) - xForValue(stats.q1))} height="36" rx="8" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
          <line x1={xForValue(stats.median)} y1="-20" x2={xForValue(stats.median)} y2="20" stroke="#7c3aed" strokeWidth="4" />
          <line x1={xForValue(stats.min)} y1="-10" x2={xForValue(stats.min)} y2="10" stroke="#334155" strokeWidth="3" />
          <line x1={xForValue(stats.max)} y1="-10" x2={xForValue(stats.max)} y2="10" stroke="#334155" strokeWidth="3" />
          <text x="36" y="36" fill="#64748b" fontSize="10" fontWeight="900">box plot</text>
        </g>

        {logs.slice(-3).map((log, index) => (
          <line
            key={log.index}
            x1={xForValue(log.mean)}
            y1="130"
            x2={xForValue(log.mean)}
            y2="276"
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="5 7"
            opacity={0.18 + index * 0.12}
          />
        ))}
      </svg>
    </div>
  );
}

function DistributionGraph({ stats }: { stats: StatsSummary }) {
  const metrics = [
    { label: "range", value: stats.range, tone: "cyan" },
    { label: "IQR", value: stats.iqr, tone: "violet" },
    { label: "MAD", value: stats.mad, tone: "emerald" },
    { label: "standard deviation", value: stats.standardDeviation, tone: "orange" },
  ];
  const maxValue = Math.max(...metrics.map((metric) => metric.value), 1);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <BarChart3 className="h-4 w-4 text-violet-600" />
          Variability measures
        </h3>
        <span className="font-mono text-[10px] font-bold text-violet-600">spread comparison</span>
      </div>
      <div className="grid flex-1 content-center gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-black text-slate-600">
              <span>{metric.label}</span>
              <span className="font-mono">{formatNumber(metric.value)}</span>
            </div>
            <div className="h-5 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full ${metric.tone === "cyan" ? "bg-cyan-500" : metric.tone === "violet" ? "bg-violet-500" : metric.tone === "emerald" ? "bg-emerald-500" : "bg-orange-500"}`}
                style={{ width: `${Math.max(5, (metric.value / maxValue) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatsTable({
  data,
  stats,
  logs,
  onClearLog,
  onCopyData,
  onExportCSV,
}: {
  data: number[];
  stats: StatsSummary;
  logs: StatsLog[];
  onClearLog: (index: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4 w-4 text-violet-600" />
          Center and spread table
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={onCopyData} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:bg-slate-100" aria-label="Copy statistics data">
            <Clipboard className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onExportCSV} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:bg-slate-100" aria-label="Export statistics CSV">
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid flex-1 gap-3 overflow-auto md:grid-cols-2">
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="mb-2 text-xs font-black text-slate-600">Current data: {data.join(", ")}</p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
            <span className="rounded-lg bg-violet-50 px-2 py-1.5">mean: <b className="text-violet-700">{formatNumber(stats.mean)}</b></span>
            <span className="rounded-lg bg-violet-50 px-2 py-1.5">median: <b className="text-violet-700">{formatNumber(stats.median)}</b></span>
            <span className="rounded-lg bg-cyan-50 px-2 py-1.5">mode: <b className="text-cyan-700">{stats.mode.length ? stats.mode.join(", ") : "none"}</b></span>
            <span className="rounded-lg bg-cyan-50 px-2 py-1.5">range: <b className="text-cyan-700">{formatNumber(stats.range)}</b></span>
            <span className="rounded-lg bg-emerald-50 px-2 py-1.5">Q1/Q3: <b className="text-emerald-700">{formatNumber(stats.q1)} / {formatNumber(stats.q3)}</b></span>
            <span className="rounded-lg bg-orange-50 px-2 py-1.5">SD: <b className="text-orange-700">{formatNumber(stats.standardDeviation)}</b></span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-violet-50/80 text-[11px] font-black text-violet-800">
              <tr>
                <th className="px-3 py-2">log</th>
                <th className="px-3 py-2">mean</th>
                <th className="px-3 py-2">median</th>
                <th className="px-3 py-2">IQR</th>
                <th className="px-3 py-2 text-center">del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No snapshots saved yet</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.index} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2 font-mono">#{log.index}</td>
                    <td className="px-3 py-2 font-mono text-violet-600">{formatNumber(log.mean)}</td>
                    <td className="px-3 py-2 font-mono text-cyan-600">{formatNumber(log.median)}</td>
                    <td className="px-3 py-2 font-mono text-orange-600">{formatNumber(log.iqr)}</td>
                    <td className="px-3 py-2 text-center">
                      <button type="button" onClick={() => onClearLog(log.index)} className="p-1 text-red-500 hover:text-red-700" aria-label={`Delete statistics log ${log.index}`}>
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

function TheoryPanel({ stats }: { stats: StatsSummary }) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Calculator className="h-4 w-4 text-violet-600" />
        Center and variability theory
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-4 text-center font-mono text-xl font-black text-slate-800">
          center + variability
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500">
          Center describes a typical value: mean balances the data, median splits ordered data in half, and mode is the most frequent value. Variability describes spread: range uses max - min, IQR uses Q3 - Q1, MAD averages distance from the mean, and standard deviation measures typical squared-distance spread.
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">mean: <b className="text-violet-700">{formatNumber(stats.mean)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">median: <b className="text-violet-700">{formatNumber(stats.median)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">IQR: <b className="text-orange-700">{formatNumber(stats.iqr)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">standard deviation: <b className="text-orange-700">{formatNumber(stats.standardDeviation)}</b></span>
        </div>
      </div>
    </section>
  );
}

export default function CenterVariabilitySimulation() {
  const router = useRouter();
  const [data, setData] = useState<number[]>(PRESETS.balanced);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [logs, setLogs] = useState<StatsLog[]>([]);

  const stats = useMemo(() => calculateStats(data), [data]);
  const selectedValue = data[selectedIndex] ?? data[0];
  const questProgress = useMemo(() => {
    const triedOutlier = logs.some((log) => log.range >= 12);
    const comparedCenters = logs.some((log) => Math.abs(log.mean - log.median) >= 1);
    return Math.min(100, logs.length * 18 + (triedOutlier ? 20 : 0) + (comparedCenters ? 20 : 0));
  }, [logs]);

  const updateValue = (index: number, value: number) => {
    setData((current) => current.map((item, itemIndex) => itemIndex === index ? clampNumber(value, 0, 20) : item));
  };

  const handleAddSnapshot = () => {
    setLogs((current) => [
      ...current.slice(-(MAX_LOGS - 1)),
      {
        index: current.length > 0 ? Math.max(...current.map((log) => log.index)) + 1 : 1,
        data,
        mean: stats.mean,
        median: stats.median,
        range: stats.range,
        iqr: stats.iqr,
        standardDeviation: stats.standardDeviation,
      },
    ]);
  };

  const handleClearLog = (index: number) => {
    setLogs((current) => current.filter((log) => log.index !== index));
  };

  const handleReset = () => {
    setData(PRESETS.balanced);
    setSelectedIndex(0);
    setLogs([]);
  };

  const handleCopyData = () => {
    const content = `data=${data.join(", ")}\nmean=${formatNumber(stats.mean)}\nmedian=${formatNumber(stats.median)}\nIQR=${formatNumber(stats.iqr)}\nstandard deviation=${formatNumber(stats.standardDeviation)}`;
    navigator.clipboard.writeText(content).then(() => alert("Copied statistics data"));
  };

  const handleExportCSV = () => {
    const rowsToExport = logs.length > 0 ? logs : [{
      index: 1,
      data,
      mean: stats.mean,
      median: stats.median,
      range: stats.range,
      iqr: stats.iqr,
      standardDeviation: stats.standardDeviation,
    }];
    const headers = "index,data,mean,median,range,iqr,standard_deviation\n";
    const csvRows = rowsToExport
      .map((log) => `${log.index},"${log.data.join(" ")}",${log.mean.toFixed(4)},${log.median.toFixed(4)},${log.range.toFixed(4)},${log.iqr.toFixed(4)},${log.standardDeviation.toFixed(4)}`)
      .join("\n");
    const blob = new Blob([headers + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scisiam_center_variability_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveResults = async () => {
    if (logs.length === 0) {
      alert("Save at least one statistics snapshot before submitting the lab result.");
      return;
    }

    const experimentData = {
      labId: "center-and-variability",
      timestamp: new Date().toLocaleString("th-TH"),
      data,
      stats,
      logs,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_center_variability_experiment",
      localPayload: experimentData,
      labId: "center-and-variability",
      title: "Center & Variability",
      variables: { data, selectedIndex },
      liveValues: {
        mean: stats.mean,
        median: stats.median,
        mode: stats.mode,
        range: stats.range,
        iqr: stats.iqr,
        standardDeviation: stats.standardDeviation,
        questProgress,
      },
      graphPoints: data.map((value, index) => ({ index, value })),
      tableRows: logs,
      prediction: { outlierImpact: Math.abs(stats.mean - stats.median) },
      summary: {
        mean: stats.mean,
        median: stats.median,
        range: stats.range,
        iqr: stats.iqr,
        standardDeviation: stats.standardDeviation,
        logCount: logs.length,
      },
      score: Math.min(100, Math.max(40, questProgress)),
      durationSeconds: null,
    });

    alert("Saved Center & Variability result");
    router.push("/labs/center-and-variability");
  };

  const controls = (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={() => { setData(PRESETS.balanced); setSelectedIndex(0); }} className="rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 hover:bg-violet-100">
          balanced
        </button>
        <button type="button" onClick={() => { setData(PRESETS.outlier); setSelectedIndex(7); }} className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-black text-orange-700 hover:bg-orange-100">
          outlier
        </button>
        <button type="button" onClick={() => { setData(PRESETS.clustered); setSelectedIndex(3); }} className="rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700 hover:bg-cyan-100">
          clustered
        </button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
        <div className="mb-2 flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Target className="h-4 w-4 text-violet-500" />
            selected data point
          </span>
          <span className="rounded border border-violet-100 bg-violet-50 px-2.5 py-0.5 text-xs font-extrabold text-violet-600">#{selectedIndex + 1}</span>
        </div>
        <input type="range" min="0" max={data.length - 1} step="1" value={selectedIndex} onChange={(event) => setSelectedIndex(Number(event.target.value))} className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-violet-600" />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
        <div className="mb-2 flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Sliders className="h-4 w-4 text-cyan-500" />
            value
          </span>
          <span className="rounded border border-cyan-100 bg-cyan-50 px-2.5 py-0.5 text-xs font-extrabold text-cyan-600">{selectedValue}</span>
        </div>
        <input type="range" min="0" max="20" step="1" value={selectedValue} onChange={(event) => updateValue(selectedIndex, Number(event.target.value))} className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-cyan-600" />
      </div>

      <div className="grid grid-cols-4 gap-2 pt-1">
        <button type="button" onClick={handleAddSnapshot} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-pink-200 px-3 py-2.5 text-xs font-black text-pink-900 shadow-sm hover:bg-pink-300">
          <Save className="h-4 w-4" />
          Log snapshot
        </button>
        <button type="button" onClick={() => setData((current) => [...current.slice(1), 20])} className="inline-flex items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-xs font-black text-orange-700 hover:bg-orange-100">
          <Plus className="h-4 w-4" />
        </button>
        <button type="button" onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Reset center variability lab">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const compactControls = (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_170px]">
      <label className="text-xs font-black text-slate-600">
        point #{selectedIndex + 1}
        <input type="range" min="0" max={data.length - 1} step="1" value={selectedIndex} onChange={(event) => setSelectedIndex(Number(event.target.value))} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-violet-600" />
      </label>
      <label className="text-xs font-black text-slate-600">
        value {selectedValue}
        <input type="range" min="0" max="20" step="1" value={selectedValue} onChange={(event) => updateValue(selectedIndex, Number(event.target.value))} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-cyan-600" />
      </label>
      <button type="button" onClick={handleAddSnapshot} className="min-h-11 rounded-xl bg-pink-200 px-3 py-2 text-xs font-black text-pink-900 hover:bg-pink-300">
        Log mean {formatNumber(stats.mean)}
      </button>
    </div>
  );

  const drawerSummary = (
    <div className="space-y-3">
      <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3">
        <p className="text-[10px] font-black uppercase text-violet-600">Manual number input</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">Choose a data point and type its value to reshape the distribution.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ManualNumberInput label="point #" ariaLabel="Enter selected data point" value={selectedIndex + 1} min={1} max={data.length} step={1} tone="violet" onChange={(value) => setSelectedIndex(Math.round(value) - 1)} />
        <ManualNumberInput label="value" ariaLabel="Enter selected data value" value={selectedValue} min={0} max={20} step={1} tone="cyan" onChange={(value) => updateValue(selectedIndex, Math.round(value))} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-black">
        <span className="rounded-xl bg-violet-50 px-3 py-2 text-violet-700">mean: {formatNumber(stats.mean)}</span>
        <span className="rounded-xl bg-violet-50 px-3 py-2 text-violet-700">median: {formatNumber(stats.median)}</span>
        <span className="rounded-xl bg-orange-50 px-3 py-2 text-orange-700">IQR: {formatNumber(stats.iqr)}</span>
        <span className="rounded-xl bg-orange-50 px-3 py-2 text-orange-700">SD: {formatNumber(stats.standardDeviation)}</span>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="violet"
      labId="center-and-variability"
      category="Mathematics"
      title="Center & Variability"
      subtitle="Adjust a data set to compare center measures with variability measures on a dot plot and box plot."
      statusLabel="Interactive statistics ready"
      icon={BarChart3}
      sceneTitle="Center and spread workspace"
      scene={<CenterStage data={data} stats={stats} logs={logs} />}
      controlsTitle="Statistics controls"
      controls={controls}
      compactControls={compactControls}
      drawerSummary={drawerSummary}
      metrics={[
        { label: "mean", value: formatNumber(stats.mean), tone: "violet" },
        { label: "median", value: formatNumber(stats.median), tone: "cyan" },
        { label: "IQR", value: formatNumber(stats.iqr), tone: "orange" },
        { label: "standard deviation", value: formatNumber(stats.standardDeviation), tone: "emerald" },
      ]}
      graph={<DistributionGraph stats={stats} />}
      table={<StatsTable data={data} stats={stats} logs={logs} onClearLog={handleClearLog} onCopyData={handleCopyData} onExportCSV={handleExportCSV} />}
      theory={<TheoryPanel stats={stats} />}
      steps={[
        { label: "Choose a data set", icon: BarChart3 },
        { label: "Adjust one value", icon: Sliders },
        { label: "Compare mean and median", icon: Calculator },
        { label: "Read IQR and standard deviation", icon: LineChart },
        { label: "Log a snapshot", icon: ClipboardList },
      ]}
      learningGoals={[
        "Compare mean, median, and mode as measures of center.",
        "Explain how outliers can move the mean more than the median.",
        "Read range, IQR, MAD, and standard deviation as measures of variability.",
        "Connect dot plots and box plots to numerical summaries.",
      ]}
      progressLabel="Statistics reasoning mission"
      progressValue={`${questProgress.toFixed(0)} / 100 progress`}
      progressPercent={questProgress}
      tips={[
        "Mean is sensitive to outliers because every value affects the balance point.",
        "Median is often steadier when one value is far from the rest.",
        "IQR focuses on the middle half of the data.",
        "Standard deviation grows when values spread farther from the mean.",
      ]}
      onRun={handleAddSnapshot}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
