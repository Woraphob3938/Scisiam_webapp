"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Calculator,
  Clipboard,
  ClipboardList,
  Download,
  FunctionSquare,
  LineChart,
  RotateCcw,
  Save,
  Sliders,
  Target,
  Trash,
  type LucideIcon,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

type FunctionMode = "linear" | "quadratic" | "absolute";

interface FunctionPoint {
  x: number;
  y: number;
}

interface FunctionLog {
  index: number;
  mode: FunctionMode;
  input: number;
  output: number;
  scale: number;
  horizontalShift: number;
  verticalShift: number;
  formula: string;
}

const MAX_LOGS = 12;
const X_MIN = -8;
const X_MAX = 8;
const Y_MIN = -18;
const Y_MAX = 18;
const CHART_LEFT = 56;
const CHART_RIGHT = 520;
const CHART_TOP = 42;
const CHART_BOTTOM = 322;

const MODE_LABELS: Record<FunctionMode, string> = {
  linear: "linear",
  quadratic: "quadratic",
  absolute: "absolute",
};

const PRESETS: Record<FunctionMode, { scale: number; horizontalShift: number; verticalShift: number; input: number }> = {
  linear: { scale: 2, horizontalShift: 1, verticalShift: 3, input: 2 },
  quadratic: { scale: 0.5, horizontalShift: -1, verticalShift: -2, input: 3 },
  absolute: { scale: 2, horizontalShift: 2, verticalShift: 1, input: -3 },
};

function formatNumber(value: number) {
  const rounded = Math.abs(value) < 0.005 ? 0 : value;
  return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2);
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function evaluateFunction(mode: FunctionMode, x: number, scale: number, horizontalShift: number, verticalShift: number) {
  const input = x - horizontalShift;
  if (mode === "linear") return scale * input + verticalShift;
  if (mode === "quadratic") return scale * input * input + verticalShift;
  return scale * Math.abs(input) + verticalShift;
}

function buildFormula(mode: FunctionMode, scale: number, horizontalShift: number, verticalShift: number) {
  const shiftText = horizontalShift >= 0 ? `(x - ${formatNumber(horizontalShift)})` : `(x + ${formatNumber(Math.abs(horizontalShift))})`;
  const verticalText = verticalShift >= 0 ? ` + ${formatNumber(verticalShift)}` : ` - ${formatNumber(Math.abs(verticalShift))}`;
  if (mode === "linear") return `f(x) = ${formatNumber(scale)}${shiftText}${verticalText}`;
  if (mode === "quadratic") return `f(x) = ${formatNumber(scale)}${shiftText}^2${verticalText}`;
  return `f(x) = ${formatNumber(scale)}|${shiftText}|${verticalText}`;
}

function makePoints(mode: FunctionMode, scale: number, horizontalShift: number, verticalShift: number) {
  return Array.from({ length: 65 }, (_, index) => {
    const x = X_MIN + (index * (X_MAX - X_MIN)) / 64;
    return { x, y: evaluateFunction(mode, x, scale, horizontalShift, verticalShift) };
  });
}

function makeTableRows(mode: FunctionMode, scale: number, horizontalShift: number, verticalShift: number, centerX: number) {
  return [-2, -1, 0, 1, 2].map((offset) => {
    const x = clampNumber(centerX + offset, X_MIN, X_MAX);
    return { x, y: evaluateFunction(mode, x, scale, horizontalShift, verticalShift) };
  });
}

function FunctionMachineStage({
  mode,
  input,
  output,
  scale,
  horizontalShift,
  verticalShift,
  points,
  logs,
}: {
  mode: FunctionMode;
  input: number;
  output: number;
  scale: number;
  horizontalShift: number;
  verticalShift: number;
  points: FunctionPoint[];
  logs: FunctionLog[];
}) {
  const xToSvg = (x: number) => CHART_LEFT + ((x - X_MIN) / (X_MAX - X_MIN)) * (CHART_RIGHT - CHART_LEFT);
  const yToSvg = (y: number) => CHART_BOTTOM - ((clampNumber(y, Y_MIN, Y_MAX) - Y_MIN) / (Y_MAX - Y_MIN)) * (CHART_BOTTOM - CHART_TOP);
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xToSvg(point.x).toFixed(1)} ${yToSvg(point.y).toFixed(1)}`)
    .join(" ");
  const inputX = xToSvg(input);
  const outputY = yToSvg(output);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
      <div className="rounded-3xl border border-violet-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-violet-600">FUNCTION BUILDER LAB</p>
            <h3 className="mt-1 text-2xl font-black text-slate-950">function machine</h3>
            <p className="mt-1 text-sm font-bold text-slate-500">input goes through rules to produce output</p>
          </div>
          <span className="rounded-2xl bg-violet-50 px-3 py-2 text-xs font-black text-violet-700">{MODE_LABELS[mode]}</span>
        </div>

        <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1.3fr_auto_1fr]">
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-center">
            <p className="text-xs font-black text-cyan-700">input</p>
            <p className="mt-2 text-3xl font-black text-slate-950">x = {formatNumber(input)}</p>
          </div>
          <ArrowRight className="hidden h-6 w-6 text-slate-300 sm:block" />
          <div className="rounded-3xl border border-violet-100 bg-violet-600 p-4 text-white shadow-lg shadow-violet-200">
            <p className="text-xs font-black uppercase text-violet-100">rule stack</p>
            <div className="mt-3 grid gap-2 text-xs font-black">
              <span className="rounded-xl bg-white/15 px-3 py-2">1. shift x by h = {formatNumber(horizontalShift)}</span>
              <span className="rounded-xl bg-white/15 px-3 py-2">2. apply {mode} parent function</span>
              <span className="rounded-xl bg-white/15 px-3 py-2">3. scale by a = {formatNumber(scale)} and move k = {formatNumber(verticalShift)}</span>
            </div>
          </div>
          <ArrowRight className="hidden h-6 w-6 text-slate-300 sm:block" />
          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-center">
            <p className="text-xs font-black text-orange-700">output</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{formatNumber(output)}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase text-slate-500">live expression</p>
          <p className="mt-2 break-words text-xl font-black text-slate-950">
            {buildFormula(mode, scale, horizontalShift, verticalShift)}
          </p>
        </div>
      </div>

      <svg viewBox="0 0 580 360" role="img" aria-label="Function graph showing input and output" className="min-h-[330px] w-full rounded-3xl border border-slate-100 bg-white shadow-sm">
        <defs>
          <linearGradient id="functionPath" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="580" height="360" fill="#ffffff" />
        {Array.from({ length: 9 }, (_, index) => {
          const x = CHART_LEFT + (index * (CHART_RIGHT - CHART_LEFT)) / 8;
          return <line key={`vx-${index}`} x1={x} y1={CHART_TOP} x2={x} y2={CHART_BOTTOM} stroke="#e2e8f0" strokeWidth="1" />;
        })}
        {Array.from({ length: 9 }, (_, index) => {
          const y = CHART_TOP + (index * (CHART_BOTTOM - CHART_TOP)) / 8;
          return <line key={`hy-${index}`} x1={CHART_LEFT} y1={y} x2={CHART_RIGHT} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
        })}
        <line x1={CHART_LEFT} y1={yToSvg(0)} x2={CHART_RIGHT} y2={yToSvg(0)} stroke="#64748b" strokeWidth="1.5" />
        <line x1={xToSvg(0)} y1={CHART_TOP} x2={xToSvg(0)} y2={CHART_BOTTOM} stroke="#64748b" strokeWidth="1.5" />
        <path d={path} fill="none" stroke="url(#functionPath)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        <line x1={inputX} y1={yToSvg(0)} x2={inputX} y2={outputY} stroke="#f97316" strokeDasharray="6 6" strokeWidth="2" />
        <line x1={xToSvg(0)} y1={outputY} x2={inputX} y2={outputY} stroke="#f97316" strokeDasharray="6 6" strokeWidth="2" />
        <circle cx={inputX} cy={outputY} r="8" fill="#7c3aed" stroke="#ffffff" strokeWidth="3" />
        <text x={inputX + 12} y={outputY - 10} fill="#4c1d95" fontSize="13" fontWeight="900">
          ({formatNumber(input)}, {formatNumber(output)})
        </text>
        <text x="26" y={CHART_TOP - 14} fill="#475569" fontSize="12" fontWeight="900">y</text>
        <text x={CHART_RIGHT + 10} y={yToSvg(0) + 4} fill="#475569" fontSize="12" fontWeight="900">x</text>
        <text x={CHART_LEFT} y="344" fill="#64748b" fontSize="11" fontWeight="800">{X_MIN}</text>
        <text x={CHART_RIGHT - 12} y="344" fill="#64748b" fontSize="11" fontWeight="800">{X_MAX}</text>
        <g transform="translate(360 24)">
          <rect width="178" height="54" rx="16" fill="#f8fafc" stroke="#e2e8f0" />
          <text x="14" y="22" fill="#7c3aed" fontSize="12" fontWeight="900">f(x) graph</text>
          <text x="14" y="40" fill="#475569" fontSize="11" fontWeight="800">logged runs: {logs.length}</text>
        </g>
      </svg>
    </div>
  );
}

function FunctionValueGraph({ points, input, output }: { points: FunctionPoint[]; input: number; output: number }) {
  const xToSvg = (x: number) => CHART_LEFT + ((x - X_MIN) / (X_MAX - X_MIN)) * (CHART_RIGHT - CHART_LEFT);
  const yToSvg = (y: number) => CHART_BOTTOM - ((clampNumber(y, Y_MIN, Y_MAX) - Y_MIN) / (Y_MAX - Y_MIN)) * (CHART_BOTTOM - CHART_TOP);
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xToSvg(point.x).toFixed(1)} ${yToSvg(point.y).toFixed(1)}`)
    .join(" ");

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
          <LineChart className="h-4 w-4 text-violet-600" />
          Function graph
        </h3>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">output {formatNumber(output)}</span>
      </div>
      <svg viewBox="0 0 580 360" role="img" aria-label="Function value graph" className="w-full rounded-2xl bg-slate-50">
        {Array.from({ length: 9 }, (_, index) => {
          const x = CHART_LEFT + (index * (CHART_RIGHT - CHART_LEFT)) / 8;
          return <line key={`value-x-${index}`} x1={x} y1={CHART_TOP} x2={x} y2={CHART_BOTTOM} stroke="#e2e8f0" />;
        })}
        {Array.from({ length: 9 }, (_, index) => {
          const y = CHART_TOP + (index * (CHART_BOTTOM - CHART_TOP)) / 8;
          return <line key={`value-y-${index}`} x1={CHART_LEFT} y1={y} x2={CHART_RIGHT} y2={y} stroke="#e2e8f0" />;
        })}
        <line x1={CHART_LEFT} y1={yToSvg(0)} x2={CHART_RIGHT} y2={yToSvg(0)} stroke="#64748b" strokeWidth="1.5" />
        <line x1={xToSvg(0)} y1={CHART_TOP} x2={xToSvg(0)} y2={CHART_BOTTOM} stroke="#64748b" strokeWidth="1.5" />
        <path d={path} fill="none" stroke="#7c3aed" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        <circle cx={xToSvg(input)} cy={yToSvg(output)} r="7" fill="#f97316" stroke="#ffffff" strokeWidth="3" />
      </svg>
    </div>
  );
}

function FunctionTable({
  rows,
  logs,
  onClearLog,
  onCopyData,
  onExportCSV,
}: {
  rows: FunctionPoint[];
  logs: FunctionLog[];
  onClearLog: (index: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
          <ClipboardList className="h-4 w-4 text-violet-600" />
          Input output table
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={onCopyData} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">
            <Clipboard className="h-4 w-4" />
            Copy
          </button>
          <button type="button" onClick={onExportCSV} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-black">input x</th>
              <th className="px-3 py-2 font-black">output f(x)</th>
              <th className="px-3 py-2 font-black">ordered pair</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={`${row.x}-${row.y}`}>
                <td className="px-3 py-2 font-bold text-slate-700">{formatNumber(row.x)}</td>
                <td className="px-3 py-2 font-black text-violet-700">{formatNumber(row.y)}</td>
                <td className="px-3 py-2 font-bold text-slate-500">({formatNumber(row.x)}, {formatNumber(row.y)})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2">
        {logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs font-bold text-slate-500">
            Log a function run to compare formulas.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.index} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
              <div>
                <p className="font-black text-slate-900">#{log.index} {log.formula}</p>
                <p className="font-bold text-slate-500">input {formatNumber(log.input)} gives output {formatNumber(log.output)}</p>
              </div>
              <button type="button" onClick={() => onClearLog(log.index)} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-rose-500" aria-label={`Delete function log ${log.index}`}>
                <Trash className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TheoryPanel({
  mode,
  scale,
  horizontalShift,
  verticalShift,
}: {
  mode: FunctionMode;
  scale: number;
  horizontalShift: number;
  verticalShift: number;
}) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
      <h3 className="flex items-center gap-2 text-sm font-black text-violet-900">
        <Calculator className="h-4 w-4" />
        Function builder theory
      </h3>
      <div className="mt-3 grid gap-3 text-sm font-bold leading-relaxed text-slate-700 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs font-black uppercase text-violet-600">Parent function</p>
          <p className="mt-1">{mode === "linear" ? "linear parent y = x" : mode === "quadratic" ? "quadratic parent y = x^2" : "absolute parent y = |x|"}</p>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs font-black uppercase text-cyan-600">Transformations</p>
          <p className="mt-1">h = {formatNumber(horizontalShift)} shifts the graph horizontally, k = {formatNumber(verticalShift)} shifts it vertically.</p>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs font-black uppercase text-orange-600">Scale</p>
          <p className="mt-1">a = {formatNumber(scale)} stretches, compresses, or reflects the output values.</p>
        </div>
      </div>
    </div>
  );
}

export default function FunctionBuilderSimulation() {
  const [mode, setMode] = useState<FunctionMode>("linear");
  const [scale, setScale] = useState(PRESETS.linear.scale);
  const [horizontalShift, setHorizontalShift] = useState(PRESETS.linear.horizontalShift);
  const [verticalShift, setVerticalShift] = useState(PRESETS.linear.verticalShift);
  const [input, setInput] = useState(PRESETS.linear.input);
  const [logs, setLogs] = useState<FunctionLog[]>([]);

  const output = useMemo(
    () => evaluateFunction(mode, input, scale, horizontalShift, verticalShift),
    [mode, input, scale, horizontalShift, verticalShift],
  );
  const formula = useMemo(
    () => buildFormula(mode, scale, horizontalShift, verticalShift),
    [mode, scale, horizontalShift, verticalShift],
  );
  const points = useMemo(
    () => makePoints(mode, scale, horizontalShift, verticalShift),
    [mode, scale, horizontalShift, verticalShift],
  );
  const tableRows = useMemo(
    () => makeTableRows(mode, scale, horizontalShift, verticalShift, input),
    [mode, scale, horizontalShift, verticalShift, input],
  );
  const questProgress = useMemo(() => {
    const modeCount = new Set(logs.map((log) => log.mode)).size;
    const transformed = logs.some((log) => log.horizontalShift !== 0 || log.verticalShift !== 0);
    return Math.min(100, logs.length * 16 + modeCount * 16 + (transformed ? 20 : 0));
  }, [logs]);

  const applyPreset = (nextMode: FunctionMode) => {
    const preset = PRESETS[nextMode];
    setMode(nextMode);
    setScale(preset.scale);
    setHorizontalShift(preset.horizontalShift);
    setVerticalShift(preset.verticalShift);
    setInput(preset.input);
  };

  const handleAddLog = () => {
    setLogs((current) => [
      ...current.slice(-(MAX_LOGS - 1)),
      {
        index: current.length > 0 ? Math.max(...current.map((log) => log.index)) + 1 : 1,
        mode,
        input,
        output,
        scale,
        horizontalShift,
        verticalShift,
        formula,
      },
    ]);
  };

  const handleReset = () => {
    const preset = PRESETS.linear;
    setMode("linear");
    setScale(preset.scale);
    setHorizontalShift(preset.horizontalShift);
    setVerticalShift(preset.verticalShift);
    setInput(preset.input);
    setLogs([]);
  };

  const handleClearLog = (index: number) => {
    setLogs((current) => current.filter((log) => log.index !== index));
  };

  const handleCopyData = () => {
    const content = `${formula}\ninput=${formatNumber(input)}\noutput=${formatNumber(output)}\nmode=${mode}`;
    navigator.clipboard.writeText(content).then(() => alert("Copied function builder data"));
  };

  const handleExportCSV = () => {
    const rowsToExport = logs.length > 0 ? logs : [{
      index: 1,
      mode,
      input,
      output,
      scale,
      horizontalShift,
      verticalShift,
      formula,
    }];
    const headers = "index,mode,input,output,scale,horizontal_shift,vertical_shift,formula\n";
    const csvRows = rowsToExport
      .map((log) => `${log.index},${log.mode},${log.input.toFixed(4)},${log.output.toFixed(4)},${log.scale.toFixed(4)},${log.horizontalShift.toFixed(4)},${log.verticalShift.toFixed(4)},"${log.formula}"`)
      .join("\n");
    const blob = new Blob([headers + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scisiam_function_builder_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveResults = async () => {
    if (logs.length === 0) {
      alert("Log at least one function run before submitting the lab result.");
      return;
    }

    const experimentData = {
      labId: "function-builder",
      timestamp: new Date().toLocaleString("th-TH"),
      mode,
      input,
      output,
      scale,
      horizontalShift,
      verticalShift,
      formula,
      logs,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_function_builder_experiment",
      localPayload: experimentData,
      labId: "function-builder",
      title: "Function Builder",
      variables: { mode, input, scale, horizontalShift, verticalShift },
      liveValues: {
        output,
        formula,
        questProgress,
      },
      graphPoints: points,
      tableRows: logs,
      prediction: { input, output, formula },
      summary: {
        mode,
        input,
        output,
        scale,
        horizontalShift,
        verticalShift,
        logCount: logs.length,
      },
      score: Math.min(100, Math.max(40, questProgress)),
      durationSeconds: null,
    });

  };

  const controls = (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(PRESETS) as FunctionMode[]).map((presetMode) => (
          <button
            key={presetMode}
            type="button"
            onClick={() => applyPreset(presetMode)}
            className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
              mode === presetMode
                ? "border-pink-200 bg-pink-200 text-pink-900 shadow-sm"
                : "border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            {MODE_LABELS[presetMode]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ControlSlider label="input x" icon={Target} value={input} min={X_MIN} max={X_MAX} step={0.5} tone="cyan" onChange={setInput} />
        <ControlSlider label="scale a" icon={Sliders} value={scale} min={-4} max={4} step={0.25} tone="violet" onChange={setScale} />
        <ControlSlider label="horizontal shift h" icon={ArrowRight} value={horizontalShift} min={-5} max={5} step={0.5} tone="violet" onChange={setHorizontalShift} />
        <ControlSlider label="vertical shift k" icon={Activity} value={verticalShift} min={-10} max={10} step={0.5} tone="orange" onChange={setVerticalShift} />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <button type="button" onClick={handleAddLog} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-pink-200 px-3 py-2.5 text-xs font-black text-pink-900 shadow-sm hover:bg-pink-300">
          <Save className="h-4 w-4" />
          Log function
        </button>
        <button type="button" onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Reset function builder lab">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const compactControls = (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_170px]">
      <label className="text-xs font-black text-slate-600">
        input {formatNumber(input)}
        <input type="range" min={X_MIN} max={X_MAX} step="0.5" value={input} onChange={(event) => setInput(Number(event.target.value))} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-cyan-600" />
      </label>
      <label className="text-xs font-black text-slate-600">
        scale {formatNumber(scale)}
        <input type="range" min="-4" max="4" step="0.25" value={scale} onChange={(event) => setScale(Number(event.target.value))} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-violet-600" />
      </label>
      <button type="button" onClick={handleAddLog} className="min-h-11 rounded-xl bg-pink-200 px-3 py-2 text-xs font-black text-pink-900 hover:bg-pink-300">
        Log f(x) {formatNumber(output)}
      </button>
    </div>
  );

  const drawerSummary = (
    <div className="space-y-3">
      <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3">
        <p className="text-[10px] font-black uppercase text-violet-600">Manual number input</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">Type the input and transformation values to rebuild the function.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ManualNumberInput label="input x" ariaLabel="Enter input x" value={input} min={X_MIN} max={X_MAX} step={0.5} tone="cyan" onChange={setInput} />
        <ManualNumberInput label="scale a" ariaLabel="Enter scale a" value={scale} min={-4} max={4} step={0.25} tone="violet" onChange={setScale} />
        <ManualNumberInput label="shift h" ariaLabel="Enter horizontal shift h" value={horizontalShift} min={-5} max={5} step={0.5} tone="violet" onChange={setHorizontalShift} />
        <ManualNumberInput label="shift k" ariaLabel="Enter vertical shift k" value={verticalShift} min={-10} max={10} step={0.5} tone="orange" onChange={setVerticalShift} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-black">
        <span className="rounded-xl bg-cyan-50 px-3 py-2 text-cyan-700">input: {formatNumber(input)}</span>
        <span className="rounded-xl bg-orange-50 px-3 py-2 text-orange-700">output: {formatNumber(output)}</span>
        <span className="rounded-xl bg-violet-50 px-3 py-2 text-violet-700">mode: {mode}</span>
        <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">logs: {logs.length}</span>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="violet"
      labId="function-builder"
      category="Mathematics"
      title="Function Builder"
      subtitle="Build a function from transformation rules, send input values through the machine, and compare output values on a graph."
      statusLabel="Interactive function ready"
      icon={FunctionSquare}
      sceneTitle="Function builder workspace"
      scene={<FunctionMachineStage mode={mode} input={input} output={output} scale={scale} horizontalShift={horizontalShift} verticalShift={verticalShift} points={points} logs={logs} />}
      controlsTitle="Function controls"
      controls={controls}
      compactControls={compactControls}
      drawerSummary={drawerSummary}
      metrics={[
        { label: "input", value: formatNumber(input), tone: "cyan" },
        { label: "output", value: formatNumber(output), tone: "orange" },
        { label: "mode", value: MODE_LABELS[mode], tone: "violet" },
        { label: "f(x)", value: formula, tone: "emerald" },
      ]}
      graph={<FunctionValueGraph points={points} input={input} output={output} />}
      table={<FunctionTable rows={tableRows} logs={logs} onClearLog={handleClearLog} onCopyData={handleCopyData} onExportCSV={handleExportCSV} />}
      theory={<TheoryPanel mode={mode} scale={scale} horizontalShift={horizontalShift} verticalShift={verticalShift} />}
      steps={[
        { label: "Choose a parent function", icon: FunctionSquare },
        { label: "Set input x", icon: Target },
        { label: "Adjust transformations", icon: Sliders },
        { label: "Read output f(x)", icon: Calculator },
        { label: "Log and compare runs", icon: ClipboardList },
      ]}
      learningGoals={[
        "Explain a function as a rule that maps each input to one output.",
        "Build linear, quadratic, and absolute-value functions from transformations.",
        "Connect formulas, input-output tables, and graph shapes.",
        "Predict how scale and shifts change output values.",
      ]}
      progressLabel="Function reasoning mission"
      progressValue={`${questProgress.toFixed(0)} / 100 progress`}
      progressPercent={questProgress}
      tips={[
        "A function machine accepts an input and returns exactly one output.",
        "The horizontal shift changes which input reaches the parent function vertex or center.",
        "The scale factor can stretch, compress, or reflect the graph.",
        "Use the table to verify points shown on the graph.",
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
  icon: LucideIcon;
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
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-bold">
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

