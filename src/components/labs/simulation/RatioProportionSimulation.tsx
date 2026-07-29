"use client";

import React, { useMemo, useState } from "react";
import {
  Calculator,
  Clipboard,
  ClipboardList,
  Download,
  LineChart,
  Percent,
  RotateCcw,
  Save,
  Scale,
  Sliders,
  Target,
  Trash,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { BoundedNumberInput } from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface RatioLog {
  index: number;
  baseA: number;
  baseB: number;
  scaleFactor: number;
  scaledA: number;
  scaledB: number;
  targetA: number;
  missingB: number;
  unitRate: number;
}

interface RatioRow {
  factor: number;
  a: number;
  b: number;
}

const MAX_LOGS = 12;

function formatNumber(value: number) {
  const rounded = Math.abs(value) < 0.005 ? 0 : value;
  return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2);
}

function gcd(firstValue: number, secondValue: number): number {
  let first = Math.abs(Math.round(firstValue));
  let second = Math.abs(Math.round(secondValue));

  while (second !== 0) {
    const next = first % second;
    first = second;
    second = next;
  }

  return first || 1;
}

function simplifyRatio(first: number, second: number) {
  const divisor = gcd(first, second);
  return `${first / divisor}:${second / divisor}`;
}

function RatioStage({
  baseA,
  baseB,
  scaleFactor,
  scaledA,
  scaledB,
  targetA,
  missingB,
  rows,
}: {
  baseA: number;
  baseB: number;
  scaleFactor: number;
  scaledA: number;
  scaledB: number;
  targetA: number;
  missingB: number;
  rows: RatioRow[];
}) {
  const maxValue = Math.max(baseA, baseB, scaledA, scaledB, targetA, missingB, 1);
  const baseAWidth = Math.max(8, (baseA / maxValue) * 100);
  const baseBWidth = Math.max(8, (baseB / maxValue) * 100);
  const scaledAWidth = Math.max(8, (scaledA / maxValue) * 100);
  const scaledBWidth = Math.max(8, (scaledB / maxValue) * 100);
  const targetAWidth = Math.max(8, (targetA / maxValue) * 100);
  const missingBWidth = Math.max(8, (missingB / maxValue) * 100);

  const points = rows.map((row) => ({
    x: 44 + (row.a / (maxValue * 1.1)) * 350,
    y: 270 - (row.b / (maxValue * 1.1)) * 210,
  }));
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");

  return (
    <div data-testid="ratio-proportion-stage" className="relative h-full w-full overflow-hidden bg-gradient-to-br from-violet-50 via-white to-cyan-50">
      <div className="absolute left-4 top-4 z-10 max-w-[320px] rounded-2xl border border-white/80 bg-white/92 px-4 py-2.5 shadow-lg shadow-violet-100/70 backdrop-blur-md">
        <p className="text-[10px] font-black uppercase text-violet-500">Ratio & Proportion Lab</p>
        <p className="mt-0.5 font-mono text-lg font-black text-slate-900">
          {baseA}:{baseB} = {formatNumber(scaledA)}:{formatNumber(scaledB)}
        </p>
        <p className="mt-0.5 text-[11px] font-bold leading-relaxed text-slate-500">
          scale factor = {scaleFactor} | simplified ratio = {simplifyRatio(baseA, baseB)}
        </p>
      </div>

      <div className="absolute right-4 top-4 z-10 hidden rounded-2xl border border-cyan-100 bg-white/95 px-4 py-2.5 shadow-lg shadow-cyan-100/80 backdrop-blur-md md:block">
        <p className="text-[10px] font-black text-cyan-600">Missing value model</p>
        <p className="mt-1 font-mono text-sm font-black text-slate-700">
          {baseA} / {baseB} = {targetA} / {formatNumber(missingB)}
        </p>
      </div>

      <div className="absolute bottom-4 left-4 right-4 top-[104px] grid gap-3 lg:grid-cols-[minmax(0,0.92fr)_280px]">
        <section data-testid="ratio-proportion-bars-panel" className="flex min-h-0 flex-col justify-center gap-2.5 overflow-hidden rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-inner shadow-slate-100">
          <div className="grid gap-2">
            <BarRow label="Base A" value={baseA} width={baseAWidth} color="bg-violet-500" />
            <BarRow label="Base B" value={baseB} width={baseBWidth} color="bg-cyan-500" />
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-2 text-center">
            <p className="text-[11px] font-black uppercase text-violet-500">multiply both sides by the same factor</p>
            <p className="font-mono text-xl font-black text-slate-900">x {scaleFactor}</p>
          </div>

          <div className="grid gap-2">
            <BarRow label="Scaled A" value={scaledA} width={scaledAWidth} color="bg-violet-600" />
            <BarRow label="Scaled B" value={scaledB} width={scaledBWidth} color="bg-cyan-600" />
          </div>

          <div className="grid gap-2 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-2.5 sm:grid-cols-2">
            <BarRow label="Given c" value={targetA} width={targetAWidth} color="bg-amber-500" />
            <BarRow label="Solve d" value={missingB} width={missingBWidth} color="bg-emerald-500" />
          </div>
        </section>

        <section data-testid="ratio-proportion-graph-panel" className="hidden min-h-0 rounded-2xl border border-slate-100 bg-slate-950 p-3 shadow-lg shadow-slate-200 lg:block">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-black text-white">Proportional pairs</h3>
            <span className="font-mono text-[10px] font-bold text-cyan-200">B = kA</span>
          </div>
          <svg className="h-[calc(100%-28px)] min-h-[190px] w-full" viewBox="0 0 420 300" fill="none" role="img" aria-label="Proportional relationship graph">
            <defs>
              <linearGradient id="ratio-line-gradient" x1="44" y1="270" x2="390" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22d3ee" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            {Array.from({ length: 5 }, (_, index) => 60 + index * 48).map((y) => (
              <line key={y} x1="44" y1={y} x2="394" y2={y} stroke="rgba(255,255,255,0.07)" />
            ))}
            {Array.from({ length: 5 }, (_, index) => 44 + index * 78).map((x) => (
              <line key={x} x1={x} y1="60" x2={x} y2="270" stroke="rgba(255,255,255,0.07)" />
            ))}
            <line x1="44" y1="270" x2="394" y2="270" stroke="rgba(255,255,255,0.22)" />
            <line x1="44" y1="60" x2="44" y2="270" stroke="rgba(255,255,255,0.22)" />
            <path d={path} stroke="url(#ratio-line-gradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => (
              <g key={`${point.x}-${point.y}`}>
                <circle cx={point.x} cy={point.y} r="6" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
                <text x={point.x} y={point.y - 12} fill="#d1fae5" fontSize="10" fontWeight="900" textAnchor="middle">
                  x{index + 1}
                </text>
              </g>
            ))}
            <text x="394" y="290" fill="#94a3b8" fontSize="10" fontWeight="800" textAnchor="end">A</text>
            <text x="24" y="62" fill="#94a3b8" fontSize="10" fontWeight="800">B</text>
          </svg>
        </section>
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  width,
  color,
}: {
  label: string;
  value: number;
  width: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-black text-slate-600">
        <span>{label}</span>
        <span className="font-mono text-slate-900">{formatNumber(value)}</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color} shadow-sm`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ResultsTable({
  rows,
  logs,
  onClearLog,
  onCopyData,
  onExportCSV,
}: {
  rows: RatioRow[];
  logs: RatioLog[];
  onClearLog: (index: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-violet-600" />
          Equivalent ratio table
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={onCopyData} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:bg-slate-100" aria-label="Copy ratio data">
            <Clipboard className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onExportCSV} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:bg-slate-100" aria-label="Export ratio CSV">
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid flex-1 gap-3 overflow-auto md:grid-cols-2">
        <div className="rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-violet-50/80 text-[11px] font-black text-violet-800">
              <tr>
                <th className="px-3 py-2">factor</th>
                <th className="px-3 py-2">A</th>
                <th className="px-3 py-2">B</th>
                <th className="px-3 py-2">ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
              {rows.map((row) => (
                <tr key={row.factor} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2 font-mono">x{row.factor}</td>
                  <td className="px-3 py-2 font-mono text-violet-600">{formatNumber(row.a)}</td>
                  <td className="px-3 py-2 font-mono text-cyan-600">{formatNumber(row.b)}</td>
                  <td className="px-3 py-2 font-mono text-slate-700">{simplifyRatio(row.a, row.b)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-cyan-50/80 text-[11px] font-black text-cyan-800">
              <tr>
                <th className="px-3 py-2">log</th>
                <th className="px-3 py-2">scaled</th>
                <th className="px-3 py-2">missing d</th>
                <th className="px-3 py-2 text-center">del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">No observations saved yet</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.index} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2 font-mono">#{log.index}</td>
                    <td className="px-3 py-2 font-mono text-violet-600">{formatNumber(log.scaledA)}:{formatNumber(log.scaledB)}</td>
                    <td className="px-3 py-2 font-mono text-emerald-600">{formatNumber(log.missingB)}</td>
                    <td className="px-3 py-2 text-center">
                      <button type="button" onClick={() => onClearLog(log.index)} className="p-1 text-red-500 hover:text-red-700" aria-label={`Delete log ${log.index}`}>
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

function RatioGraph({ rows }: { rows: RatioRow[] }) {
  const maxValue = Math.max(...rows.flatMap((row) => [row.a, row.b]), 1);
  const points = rows.map((row) => ({
    x: 28 + (row.a / maxValue) * 150,
    y: 102 - (row.b / maxValue) * 80,
    label: `x${row.factor}`,
  }));
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <LineChart className="h-4.5 w-4.5 text-violet-600" />
          Proportion graph
        </h3>
        <span className="font-mono text-[10px] font-bold text-violet-600">straight line through origin</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-950 p-3">
        <svg className="h-full min-h-[174px] w-full" viewBox="0 0 200 120" fill="none" role="img" aria-label="Ratio graph">
          {Array.from({ length: 5 }, (_, index) => 22 + index * 20).map((y) => (
            <line key={y} x1="28" y1={y} x2="178" y2={y} stroke="rgba(255,255,255,0.06)" />
          ))}
          {Array.from({ length: 5 }, (_, index) => 28 + index * 37).map((x) => (
            <line key={x} x1={x} y1="22" x2={x} y2="102" stroke="rgba(255,255,255,0.06)" />
          ))}
          <line x1="28" y1="102" x2="178" y2="102" stroke="rgba(255,255,255,0.18)" />
          <line x1="28" y1="22" x2="28" y2="102" stroke="rgba(255,255,255,0.18)" />
          <path d={path} stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} r="3.5" fill="#22d3ee" stroke="#ffffff" strokeWidth="0.75" />
              <text x={point.x} y={point.y - 6} fill="#bae6fd" fontSize="7" fontWeight="800" textAnchor="middle">{point.label}</text>
            </g>
          ))}
          <text x="178" y="114" fill="#94a3b8" fontSize="8" fontWeight="800" textAnchor="end">A</text>
          <text x="15" y="24" fill="#94a3b8" fontSize="8" fontWeight="800">B</text>
        </svg>
      </div>
    </section>
  );
}

function TheoryPanel({
  baseA,
  baseB,
  targetA,
  missingB,
}: {
  baseA: number;
  baseB: number;
  targetA: number;
  missingB: number;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Calculator className="h-4.5 w-4.5 text-violet-600" />
        Ratio and proportion theory
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-4 text-center font-mono text-xl font-black text-slate-800">
          a / b = c / d
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500">
          Equivalent ratios keep the same relationship when both quantities are multiplied by the same scale factor. To solve a missing value in a proportion, use cross multiplication: a x d = b x c, so d = (b x c) / a.
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">a: <b className="text-violet-700">{formatNumber(baseA)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">b: <b className="text-cyan-700">{formatNumber(baseB)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">c: <b className="text-amber-700">{formatNumber(targetA)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">d: <b className="text-emerald-700">{formatNumber(missingB)}</b></span>
        </div>
      </div>
    </section>
  );
}

export default function RatioProportionSimulation() {
  const [baseA, setBaseA] = useState(2);
  const [baseB, setBaseB] = useState(3);
  const [scaleFactor, setScaleFactor] = useState(4);
  const [targetA, setTargetA] = useState(10);
  const [logs, setLogs] = useState<RatioLog[]>([]);

  const scaledA = baseA * scaleFactor;
  const scaledB = baseB * scaleFactor;
  const missingB = (baseB * targetA) / baseA;
  const unitRate = baseB / baseA;
  const simplified = simplifyRatio(baseA, baseB);

  const rows = useMemo(
    () => Array.from({ length: 6 }, (_, index) => {
      const factor = index + 1;
      return {
        factor,
        a: baseA * factor,
        b: baseB * factor,
      };
    }),
    [baseA, baseB],
  );

  const questProgress = useMemo(() => {
    const triedSeveralScales = new Set(logs.map((log) => log.scaleFactor)).size >= 3;
    const triedSeveralRatios = new Set(logs.map((log) => `${log.baseA}:${log.baseB}`)).size >= 2;
    return Math.min(100, logs.length * 18 + (triedSeveralScales ? 18 : 0) + (triedSeveralRatios ? 18 : 0) + (targetA !== scaledA ? 10 : 0));
  }, [logs, scaledA, targetA]);

  const handleAddLog = () => {
    setLogs((current) => [
      ...current.slice(-(MAX_LOGS - 1)),
      {
        index: current.length > 0 ? Math.max(...current.map((log) => log.index)) + 1 : 1,
        baseA,
        baseB,
        scaleFactor,
        scaledA,
        scaledB,
        targetA,
        missingB,
        unitRate,
      },
    ]);
  };

  const handleReset = () => {
    setBaseA(2);
    setBaseB(3);
    setScaleFactor(4);
    setTargetA(10);
    setLogs([]);
  };

  const handleClearLog = (index: number) => {
    setLogs((current) => current.filter((log) => log.index !== index));
  };

  const handleCopyData = () => {
    const sourceRows = logs.length > 0 ? logs : rows;
    const content = sourceRows
      .map((row) => {
        if ("scaledA" in row) {
          return `#${row.index}: ${row.baseA}:${row.baseB} scaled by ${row.scaleFactor} = ${formatNumber(row.scaledA)}:${formatNumber(row.scaledB)}, missing d=${formatNumber(row.missingB)}`;
        }
        return `x${row.factor}: A=${formatNumber(row.a)}, B=${formatNumber(row.b)}, ratio=${simplifyRatio(row.a, row.b)}`;
      })
      .join("\n");

    navigator.clipboard.writeText(content).then(() => alert("Copied ratio data"));
  };

  const handleExportCSV = () => {
    const headers = "index,base_a,base_b,scale_factor,scaled_a,scaled_b,target_a,missing_b,unit_rate\n";
    const rowsToExport = logs.length > 0
      ? logs
      : [{
          index: 1,
          baseA,
          baseB,
          scaleFactor,
          scaledA,
          scaledB,
          targetA,
          missingB,
          unitRate,
        }];
    const csvRows = rowsToExport
      .map((log) => `${log.index},${log.baseA},${log.baseB},${log.scaleFactor},${log.scaledA},${log.scaledB},${log.targetA},${log.missingB.toFixed(4)},${log.unitRate.toFixed(4)}`)
      .join("\n");
    const blob = new Blob([headers + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scisiam_ratio_proportion_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveResults = async () => {
    if (logs.length === 0) {
      alert("Save at least one ratio observation before submitting the lab result.");
      return;
    }

    const experimentData = {
      labId: "ratio-and-proportion",
      timestamp: new Date().toLocaleString("th-TH"),
      baseRatio: `${baseA}:${baseB}`,
      simplified,
      scaleFactor,
      scaledRatio: `${formatNumber(scaledA)}:${formatNumber(scaledB)}`,
      missingValue: {
        equation: `${baseA} / ${baseB} = ${targetA} / ${formatNumber(missingB)}`,
        targetA,
        missingB,
      },
      logs,
      rows,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_ratio_proportion_experiment",
      localPayload: experimentData,
      labId: "ratio-and-proportion",
      title: "Ratio & Proportion Lab",
      variables: { baseA, baseB, scaleFactor, targetA },
      liveValues: { scaledA, scaledB, missingB, unitRate, questProgress },
      graphPoints: rows,
      tableRows: logs,
      prediction: { targetA, missingB },
      summary: {
        baseRatio: `${baseA}:${baseB}`,
        simplified,
        scaledRatio: `${formatNumber(scaledA)}:${formatNumber(scaledB)}`,
        logCount: logs.length,
      },
      score: Math.min(100, Math.max(40, questProgress)),
      durationSeconds: null,
    });

  };

  const drawerSummary = (
    <div className="space-y-3">
      <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3">
        <p className="text-[10px] font-black uppercase text-violet-600">Manual number input</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">กรอกค่าเอง หรือใช้ slider ด้านซ้ายควบคู่กันได้</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ManualNumberInput
          label="A"
          ariaLabel="Enter base quantity A"
          value={baseA}
          min={1}
          max={12}
          tone="violet"
          onChange={setBaseA}
        />
        <ManualNumberInput
          label="B"
          ariaLabel="Enter base quantity B"
          value={baseB}
          min={1}
          max={12}
          tone="cyan"
          onChange={setBaseB}
        />
        <ManualNumberInput
          label="scale"
          ariaLabel="Enter scale factor"
          value={scaleFactor}
          min={1}
          max={8}
          tone="pink"
          onChange={setScaleFactor}
        />
        <ManualNumberInput
          label="c"
          ariaLabel="Enter given value c"
          value={targetA}
          min={2}
          max={48}
          tone="amber"
          onChange={setTargetA}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-black">
        <span className="rounded-xl bg-cyan-50 px-3 py-2 text-cyan-700">scaled: {formatNumber(scaledA)}:{formatNumber(scaledB)}</span>
        <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">d: {formatNumber(missingB)}</span>
      </div>
    </div>
  );

  const controls = (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <ControlSlider label="Base quantity A" icon={Scale} value={baseA} min={1} max={12} step={1} tone="violet" onChange={setBaseA} />
        <ControlSlider label="Base quantity B" icon={Scale} value={baseB} min={1} max={12} step={1} tone="cyan" onChange={setBaseB} />
      </div>

      <ControlSlider label="Scale factor" icon={Sliders} value={scaleFactor} min={1} max={8} step={1} tone="pink" onChange={setScaleFactor} />
      <ControlSlider label="Given value c" icon={Target} value={targetA} min={2} max={48} step={1} tone="amber" onChange={setTargetA} />

      <div className="grid grid-cols-4 gap-2 pt-1">
        <button type="button" onClick={handleAddLog} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-pink-200 px-3 py-2.5 text-xs font-black text-pink-900 shadow-sm hover:bg-pink-300">
          <Save className="h-4 w-4" />
          Log ratio
        </button>
        <button type="button" onClick={() => setTargetA(scaledA)} className="inline-flex items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-xs font-black text-cyan-700 hover:bg-cyan-100">
          match c
        </button>
        <button type="button" onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Reset ratio lab">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const compactControls = (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_160px]">
      <label className="text-xs font-black text-slate-600">
        ratio {baseA}:{baseB}
        <input type="range" min="1" max="12" step="1" value={baseA} onChange={(event) => setBaseA(Number(event.target.value))} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-violet-600" />
      </label>
      <label className="text-xs font-black text-slate-600">
        scale x{scaleFactor}
        <input type="range" min="1" max="8" step="1" value={scaleFactor} onChange={(event) => setScaleFactor(Number(event.target.value))} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-cyan-600" />
      </label>
      <button type="button" onClick={handleAddLog} className="min-h-11 rounded-xl bg-pink-200 px-3 py-2 text-xs font-black text-pink-900 hover:bg-pink-300">
        Log {formatNumber(scaledA)}:{formatNumber(scaledB)}
      </button>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="violet"
      labId="ratio-and-proportion"
      category="Mathematics"
      title="Ratio & Proportion Lab"
      subtitle="Explore equivalent ratios by scaling both quantities together, then solve a missing value with proportional reasoning."
      statusLabel="Interactive ratio ready"
      icon={Percent}
      sceneTitle="Equivalent ratio simulator"
      scene={<RatioStage baseA={baseA} baseB={baseB} scaleFactor={scaleFactor} scaledA={scaledA} scaledB={scaledB} targetA={targetA} missingB={missingB} rows={rows} />}
      controlsTitle="Ratio controls"
      controls={controls}
      compactControls={compactControls}
      drawerSummary={drawerSummary}
      metrics={[
        { label: "base ratio", value: `${baseA}:${baseB}`, tone: "violet" },
        { label: "scaled ratio", value: `${formatNumber(scaledA)}:${formatNumber(scaledB)}`, tone: "cyan" },
        { label: "unit rate B/A", value: formatNumber(unitRate), tone: "emerald" },
        { label: "missing d", value: formatNumber(missingB), tone: "orange" },
      ]}
      graph={<RatioGraph rows={rows} />}
      table={<ResultsTable rows={rows} logs={logs} onClearLog={handleClearLog} onCopyData={handleCopyData} onExportCSV={handleExportCSV} />}
      theory={<TheoryPanel baseA={baseA} baseB={baseB} targetA={targetA} missingB={missingB} />}
      steps={[
        { label: "Choose base ratio", icon: Scale },
        { label: "Apply scale factor", icon: Sliders },
        { label: "Compare equivalent bars", icon: Percent },
        { label: "Solve missing value", icon: Calculator },
        { label: "Log observations", icon: ClipboardList },
      ]}
      learningGoals={[
        "Explain why multiplying both quantities by the same factor creates an equivalent ratio.",
        "Connect equivalent ratio tables to a straight proportional graph.",
        "Use cross multiplication to solve a missing value in a proportion.",
        "Compare unit rate and scale factor as two ways to describe proportional relationships.",
      ]}
      progressLabel="Ratio reasoning mission"
      progressValue={`${questProgress.toFixed(0)} / 100 progress`}
      progressPercent={questProgress}
      tips={[
        "A ratio compares two quantities in a fixed relationship, such as 2:3.",
        "Equivalent ratios have the same simplified form even when the numbers are larger.",
        "If a / b = c / d, then a x d = b x c.",
        "A proportional graph forms a straight line through the origin.",
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
  icon: typeof Scale;
  value: number;
  min: number;
  max: number;
  step: number;
  tone: "violet" | "cyan" | "amber" | "pink";
  onChange: (value: number) => void;
}) {
  const toneClasses = {
    violet: "text-violet-600 bg-violet-50 border-violet-100 accent-violet-600",
    cyan: "text-cyan-600 bg-cyan-50 border-cyan-100 accent-cyan-600",
    amber: "text-amber-600 bg-amber-50 border-amber-100 accent-amber-500",
    pink: "text-pink-600 bg-pink-50 border-pink-100 accent-pink-500",
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
        onChange={(event) => onChange(Number(event.target.value))}
        className={`h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 ${toneClasses.split(" ").at(-1)}`}
      />
    </div>
  );
}

function ManualNumberInput({
  label,
  ariaLabel,
  value,
  min,
  max,
  tone,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  value: number;
  min: number;
  max: number;
  tone: "violet" | "cyan" | "amber" | "pink";
  onChange: (value: number) => void;
}) {
  const toneClasses = {
    violet: "border-violet-100 bg-violet-50 text-violet-700 focus:border-violet-300 focus:ring-violet-200",
    cyan: "border-cyan-100 bg-cyan-50 text-cyan-700 focus:border-cyan-300 focus:ring-cyan-200",
    amber: "border-amber-100 bg-amber-50 text-amber-700 focus:border-amber-300 focus:ring-amber-200",
    pink: "border-pink-100 bg-pink-50 text-pink-700 focus:border-pink-300 focus:ring-pink-200",
  }[tone];

  return (
    <label className="block rounded-2xl border border-slate-100 bg-white p-2.5 text-[11px] font-black text-slate-500 shadow-sm">
      <span className="mb-1 block">{label}</span>
      <BoundedNumberInput
        ariaLabel={ariaLabel}
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={onChange}
        className={`h-10 w-full rounded-xl border px-3 text-center font-mono text-base font-black outline-none transition focus:ring-2 ${toneClasses}`}
      />
    </label>
  );
}

