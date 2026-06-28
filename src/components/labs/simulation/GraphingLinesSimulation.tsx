"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Clipboard,
  ClipboardList,
  Download,
  LineChart,
  RotateCcw,
  Save,
  Sliders,
  Target,
  Trash,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedPoint {
  index: number;
  x: number;
  y: number;
  slope: number;
  intercept: number;
}

const GRAPH_MIN = -10;
const GRAPH_MAX = 10;
const SVG_WIDTH = 480;
const SVG_HEIGHT = 360;
const PLOT_LEFT = 52;
const PLOT_RIGHT = 432;
const PLOT_TOP = 28;
const PLOT_BOTTOM = 316;

function formatNumber(value: number) {
  const rounded = Math.abs(value) < 0.005 ? 0 : value;
  return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2);
}

function formatEquation(slope: number, intercept: number) {
  const m = formatNumber(slope);
  const b = formatNumber(Math.abs(intercept));
  if (intercept === 0) return `y = ${m}x`;
  return `y = ${m}x ${intercept > 0 ? "+" : "-"} ${b}`;
}

function GraphingStage({
  slope,
  intercept,
  probeX,
  loggedPoints,
}: {
  slope: number;
  intercept: number;
  probeX: number;
  loggedPoints: LoggedPoint[];
}) {
  const xToSvg = (x: number) => PLOT_LEFT + ((x - GRAPH_MIN) / (GRAPH_MAX - GRAPH_MIN)) * (PLOT_RIGHT - PLOT_LEFT);
  const yToSvg = (y: number) => PLOT_BOTTOM - ((y - GRAPH_MIN) / (GRAPH_MAX - GRAPH_MIN)) * (PLOT_BOTTOM - PLOT_TOP);

  const probeY = slope * probeX + intercept;
  const triangleDx = probeX <= 6 ? 2 : -2;
  const triangleStartX = probeX;
  const triangleEndX = probeX + triangleDx;
  const triangleStartY = probeY;
  const triangleEndY = slope * triangleEndX + intercept;

  const lineStart = { x: GRAPH_MIN, y: slope * GRAPH_MIN + intercept };
  const lineEnd = { x: GRAPH_MAX, y: slope * GRAPH_MAX + intercept };
  const equation = formatEquation(slope, intercept);
  const interceptVisible = intercept >= GRAPH_MIN && intercept <= GRAPH_MAX;
  const probeVisible = probeY >= GRAPH_MIN && probeY <= GRAPH_MAX;

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <div className="absolute left-4 top-4 z-10 rounded-2xl border border-white/80 bg-white/92 px-4 py-3 shadow-lg shadow-violet-100/70 backdrop-blur-md">
        <p className="text-[10px] font-black uppercase text-violet-500">Slope-intercept lab</p>
        <p className="font-mono text-xl font-black text-slate-900">{equation}</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
          m = {formatNumber(slope)} | b = {formatNumber(intercept)} | จุด probe ({formatNumber(probeX)}, {formatNumber(probeY)})
        </p>
      </div>

      <div className="absolute bottom-10 right-7 z-10 rounded-2xl border border-orange-100 bg-white/95 px-4 py-3 shadow-lg shadow-orange-100/80 backdrop-blur-md sm:right-10">
        <p className="text-[10px] font-black text-orange-500">Slope triangle</p>
        <p className="mt-1 font-mono text-xs font-black text-slate-600">
          rise/run = {formatNumber(slope * triangleDx)} / {formatNumber(triangleDx)}
        </p>
      </div>

      <svg className="h-full w-full" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} fill="none" role="img" aria-label={`กราฟสมการ ${equation}`}>
        <defs>
          <clipPath id="graphing-lines-clip">
            <rect x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_RIGHT - PLOT_LEFT} height={PLOT_BOTTOM - PLOT_TOP} rx="18" />
          </clipPath>
          <linearGradient id="graphing-line-gradient" x1="60" y1="300" x2="420" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563eb" />
            <stop offset="0.5" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#db2777" />
          </linearGradient>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#7c3aed" floodOpacity="0.18" />
          </filter>
        </defs>

        <rect x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_RIGHT - PLOT_LEFT} height={PLOT_BOTTOM - PLOT_TOP} rx="18" fill="#ffffff" stroke="#ddd6fe" strokeWidth="2" />

        {Array.from({ length: 21 }, (_, index) => GRAPH_MIN + index).map((value) => {
          const x = xToSvg(value);
          const y = yToSvg(value);
          const isAxis = value === 0;
          const isMajor = value % 2 === 0;
          return (
            <g key={value}>
              <line x1={x} y1={PLOT_TOP} x2={x} y2={PLOT_BOTTOM} stroke={isAxis ? "#64748b" : isMajor ? "#e2e8f0" : "#f1f5f9"} strokeWidth={isAxis ? 2 : 1} />
              <line x1={PLOT_LEFT} y1={y} x2={PLOT_RIGHT} y2={y} stroke={isAxis ? "#64748b" : isMajor ? "#e2e8f0" : "#f1f5f9"} strokeWidth={isAxis ? 2 : 1} />
              {isMajor && value !== 0 && (
                <>
                  <text x={x} y={PLOT_BOTTOM + 18} fill="#94a3b8" fontSize="10" fontWeight="800" textAnchor="middle">{value}</text>
                  <text x={PLOT_LEFT - 14} y={y + 4} fill="#94a3b8" fontSize="10" fontWeight="800" textAnchor="end">{value}</text>
                </>
              )}
            </g>
          );
        })}

        <g clipPath="url(#graphing-lines-clip)">
          <line
            x1={xToSvg(lineStart.x)}
            y1={yToSvg(lineStart.y)}
            x2={xToSvg(lineEnd.x)}
            y2={yToSvg(lineEnd.y)}
            stroke="url(#graphing-line-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#soft-shadow)"
          />

          <path
            d={`M${xToSvg(triangleStartX)},${yToSvg(triangleStartY)} L${xToSvg(triangleEndX)},${yToSvg(triangleStartY)} L${xToSvg(triangleEndX)},${yToSvg(triangleEndY)}`}
            stroke="#f97316"
            strokeWidth="3"
            strokeDasharray="7 6"
            strokeLinejoin="round"
          />

          <line x1={xToSvg(probeX)} y1={PLOT_TOP} x2={xToSvg(probeX)} y2={PLOT_BOTTOM} stroke="#a78bfa" strokeWidth="2" strokeDasharray="5 6" />

          {loggedPoints.map((point) => {
            const visible = point.y >= GRAPH_MIN && point.y <= GRAPH_MAX;
            if (!visible) return null;
            return (
              <g key={point.index}>
                <circle cx={xToSvg(point.x)} cy={yToSvg(point.y)} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                <text x={xToSvg(point.x)} y={yToSvg(point.y) - 10} fill="#047857" fontSize="10" fontWeight="900" textAnchor="middle">#{point.index}</text>
              </g>
            );
          })}

          {interceptVisible && (
            <g>
              <circle cx={xToSvg(0)} cy={yToSvg(intercept)} r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
              <text x={xToSvg(0) + 12} y={yToSvg(intercept) - 10} fill="#b45309" fontSize="11" fontWeight="900">b</text>
            </g>
          )}

          {probeVisible && (
            <g>
              <circle cx={xToSvg(probeX)} cy={yToSvg(probeY)} r="8" fill="#db2777" stroke="#ffffff" strokeWidth="3" />
              <text x={xToSvg(probeX)} y={yToSvg(probeY) + 24} fill="#be185d" fontSize="11" fontWeight="900" textAnchor="middle">probe</text>
            </g>
          )}
        </g>

        <text x={PLOT_RIGHT + 16} y={yToSvg(0) + 4} fill="#475569" fontSize="13" fontWeight="900">x</text>
        <text x={xToSvg(0) - 4} y={PLOT_TOP - 9} fill="#475569" fontSize="13" fontWeight="900">y</text>
      </svg>
    </div>
  );
}

function GraphingResults({
  loggedPoints,
  onClearPoint,
  onCopyData,
  onExportCSV,
}: {
  loggedPoints: LoggedPoint[];
  onClearPoint: (index: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-violet-600" />
          ตารางคู่ลำดับที่บันทึก
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={onCopyData} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:bg-slate-100" aria-label="คัดลอกข้อมูล">
            <Clipboard className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onExportCSV} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:bg-slate-100" aria-label="ดาวน์โหลด CSV">
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-violet-50/80 text-[11px] font-black text-violet-800">
            <tr>
              <th className="px-3 py-2">จุด</th>
              <th className="px-3 py-2">x</th>
              <th className="px-3 py-2">y</th>
              <th className="px-3 py-2">m</th>
              <th className="px-3 py-2">b</th>
              <th className="px-3 py-2 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {loggedPoints.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">ยังไม่มีจุดที่บันทึก</td>
              </tr>
            ) : (
              loggedPoints.map((point) => (
                <tr key={point.index} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2 font-mono">#{point.index}</td>
                  <td className="px-3 py-2 font-mono text-blue-600">{formatNumber(point.x)}</td>
                  <td className="px-3 py-2 font-mono text-emerald-600">{formatNumber(point.y)}</td>
                  <td className="px-3 py-2 font-mono text-violet-600">{formatNumber(point.slope)}</td>
                  <td className="px-3 py-2 font-mono text-amber-600">{formatNumber(point.intercept)}</td>
                  <td className="px-3 py-2 text-center">
                    <button type="button" onClick={() => onClearPoint(point.index)} className="p-1 text-red-500 hover:text-red-700" aria-label={`ลบจุด ${point.index}`}>
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

function MiniGraph({ points, slope, intercept }: { points: LoggedPoint[]; slope: number; intercept: number }) {
  const xCoord = (x: number) => 24 + ((x - GRAPH_MIN) / (GRAPH_MAX - GRAPH_MIN)) * 156;
  const yCoord = (y: number) => 100 - ((y - GRAPH_MIN) / (GRAPH_MAX - GRAPH_MIN)) * 82;
  const linePath = `M${xCoord(GRAPH_MIN)},${yCoord(slope * GRAPH_MIN + intercept)} L${xCoord(GRAPH_MAX)},${yCoord(slope * GRAPH_MAX + intercept)}`;

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <LineChart className="h-4.5 w-4.5 text-violet-600" />
          กราฟผลลัพธ์ย่อ
        </h3>
        <span className="font-mono text-[10px] font-bold text-violet-600">y = mx + b</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-950 p-3">
        <svg className="h-full min-h-[174px] w-full" viewBox="0 0 200 120" fill="none">
          {Array.from({ length: 5 }, (_, index) => 18 + index * 20).map((y) => (
            <line key={y} x1="24" y1={y} x2="180" y2={y} stroke="rgba(255,255,255,0.06)" />
          ))}
          {Array.from({ length: 5 }, (_, index) => 24 + index * 39).map((x) => (
            <line key={x} x1={x} y1="18" x2={x} y2="100" stroke="rgba(255,255,255,0.06)" />
          ))}
          <line x1="24" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.18)" />
          <line x1="24" y1="18" x2="24" y2="100" stroke="rgba(255,255,255,0.18)" />
          <path d={linePath} stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
          {points.map((point) => point.y >= GRAPH_MIN && point.y <= GRAPH_MAX ? (
            <circle key={point.index} cx={xCoord(point.x)} cy={yCoord(point.y)} r="3" fill="#22c55e" stroke="#ffffff" strokeWidth="0.75" />
          ) : null)}
          <text x="180" y="112" fill="#94a3b8" fontSize="8" fontWeight="800" textAnchor="middle">x</text>
          <text x="14" y="22" fill="#94a3b8" fontSize="8" fontWeight="800">y</text>
        </svg>
      </div>
    </section>
  );
}

function TheoryPanel({ slope, intercept, probeX }: { slope: number; intercept: number; probeX: number }) {
  const probeY = slope * probeX + intercept;
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Calculator className="h-4.5 w-4.5 text-violet-600" />
        ทฤษฎีเส้นตรง
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-4 text-center font-mono text-xl font-black text-slate-800">
          y = mx + b
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500">
          ความชัน m บอกว่า y เปลี่ยนไปเท่าไรเมื่อ x เพิ่มขึ้น 1 หน่วย ส่วน b คือจุดตัดแกน y หรือค่าเริ่มต้นเมื่อ x = 0 ถ้า m เป็นบวกเส้นจะเอียงขึ้น และถ้า m เป็นลบเส้นจะเอียงลง
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">m: <b className="text-violet-700">{formatNumber(slope)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">b: <b className="text-amber-700">{formatNumber(intercept)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">x probe: <b className="text-blue-700">{formatNumber(probeX)}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">y: <b className="text-emerald-700">{formatNumber(probeY)}</b></span>
        </div>
      </div>
    </section>
  );
}

export default function GraphingLinesSimulation() {
  const router = useRouter();
  const [slope, setSlope] = useState(1.5);
  const [intercept, setIntercept] = useState(1);
  const [probeX, setProbeX] = useState(2);
  const [loggedPoints, setLoggedPoints] = useState<LoggedPoint[]>([]);

  const probeY = slope * probeX + intercept;
  const equation = formatEquation(slope, intercept);
  const questProgress = useMemo(() => {
    const hasPositive = loggedPoints.some((point) => point.slope > 0);
    const hasNegative = loggedPoints.some((point) => point.slope < 0);
    const hasIntercept = loggedPoints.some((point) => Math.abs(point.x) < 0.01);
    return Math.min(100, loggedPoints.length * 18 + (hasPositive ? 15 : 0) + (hasNegative ? 15 : 0) + (hasIntercept ? 16 : 0));
  }, [loggedPoints]);

  const sampleRows = useMemo(
    () => [-4, -2, 0, 2, 4].map((x) => ({ x, y: slope * x + intercept })),
    [slope, intercept],
  );

  const handleAddPoint = () => {
    setLoggedPoints((current) => [
      ...current.slice(-11),
      {
        index: current.length > 0 ? Math.max(...current.map((point) => point.index)) + 1 : 1,
        x: probeX,
        y: probeY,
        slope,
        intercept,
      },
    ]);
  };

  const handleReset = () => {
    setSlope(1.5);
    setIntercept(1);
    setProbeX(2);
    setLoggedPoints([]);
  };

  const handleClearPoint = (index: number) => {
    setLoggedPoints((current) => current.filter((point) => point.index !== index));
  };

  const handleCopyData = () => {
    if (loggedPoints.length === 0) {
      alert("ยังไม่มีข้อมูลคู่ลำดับให้คัดลอก");
      return;
    }
    const content = loggedPoints
      .map((point) => `#${point.index}: x=${formatNumber(point.x)}, y=${formatNumber(point.y)}, m=${formatNumber(point.slope)}, b=${formatNumber(point.intercept)}`)
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกข้อมูลกราฟเส้นตรงแล้ว"));
  };

  const handleExportCSV = () => {
    if (loggedPoints.length === 0) {
      alert("ยังไม่มีข้อมูลคู่ลำดับให้ส่งออก");
      return;
    }
    const headers = "index,x,y,slope,intercept\n";
    const rows = loggedPoints
      .map((point) => `${point.index},${point.x},${point.y.toFixed(4)},${point.slope},${point.intercept}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scisiam_graphing_lines_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveResults = async () => {
    if (loggedPoints.length === 0) {
      alert("บันทึกจุดบนกราฟอย่างน้อย 1 จุดก่อนบันทึกผลการทดลอง");
      return;
    }

    const experimentData = {
      labId: "graphing-lines",
      timestamp: new Date().toLocaleString("th-TH"),
      equation,
      slope,
      intercept,
      probe: { x: probeX, y: probeY },
      loggedPoints,
      sampleRows,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_graphing_lines_experiment",
      localPayload: experimentData,
      labId: "graphing-lines",
      title: "Graphing Lines & Slope",
      variables: { slope, intercept, probeX },
      liveValues: { equation, probeY, questProgress },
      graphPoints: loggedPoints,
      tableRows: sampleRows,
      prediction: { equation, yAtProbe: probeY },
      summary: {
        slope,
        intercept,
        loggedPointCount: loggedPoints.length,
        equation,
      },
      score: Math.min(100, Math.max(40, questProgress)),
      durationSeconds: null,
    });

    alert("บันทึกผลแล็บ Graphing Lines & Slope สำเร็จ");
    router.push("/labs/graphing-lines");
  };

  const controls = (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
        <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Sliders className="h-4 w-4 text-violet-500" />
            ความชัน (m)
          </span>
          <span className="rounded border border-violet-100 bg-violet-50 px-2.5 py-0.5 text-xs font-extrabold text-violet-600">{formatNumber(slope)}</span>
        </div>
        <input type="range" min="-3" max="3" step="0.25" value={slope} onChange={(event) => setSlope(Number(event.target.value))} className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-violet-600" />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
        <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Target className="h-4 w-4 text-amber-500" />
            จุดตัดแกน y (b)
          </span>
          <span className="rounded border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-xs font-extrabold text-amber-600">{formatNumber(intercept)}</span>
        </div>
        <input type="range" min="-6" max="6" step="0.5" value={intercept} onChange={(event) => setIntercept(Number(event.target.value))} className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-500" />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
        <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-slate-600">
            <LineChart className="h-4 w-4 text-blue-500" />
            จุด probe บนแกน x
          </span>
          <span className="rounded border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-extrabold text-blue-600">x = {formatNumber(probeX)}</span>
        </div>
        <input type="range" min="-8" max="8" step="0.5" value={probeX} onChange={(event) => setProbeX(Number(event.target.value))} className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-500" />
      </div>

      <div className="grid grid-cols-4 gap-2 pt-1">
        <button type="button" onClick={handleAddPoint} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-pink-200 px-3 py-2.5 text-xs font-black text-pink-900 shadow-sm hover:bg-pink-300">
          <Save className="h-4 w-4" />
          บันทึกจุด
        </button>
        <button type="button" onClick={() => { setSlope(-slope); }} className="inline-flex items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-xs font-black text-violet-700 hover:bg-violet-100">
          พลิก m
        </button>
        <button type="button" onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="รีเซ็ต">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const compactControls = (
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="text-xs font-black text-slate-600">
        m {formatNumber(slope)}
        <input type="range" min="-3" max="3" step="0.25" value={slope} onChange={(event) => setSlope(Number(event.target.value))} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-violet-600" />
      </label>
      <label className="text-xs font-black text-slate-600">
        b {formatNumber(intercept)}
        <input type="range" min="-6" max="6" step="0.5" value={intercept} onChange={(event) => setIntercept(Number(event.target.value))} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-500" />
      </label>
      <button type="button" onClick={handleAddPoint} className="min-h-11 rounded-xl bg-pink-200 px-3 py-2 text-xs font-black text-pink-900 hover:bg-pink-300">
        บันทึกจุด ({formatNumber(probeX)}, {formatNumber(probeY)})
      </button>
    </div>
  );

  const drawerSummary = (
    <div className="space-y-3">
      <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3">
        <p className="text-[10px] font-black uppercase text-violet-600">Manual number input</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">Type graph values directly, or use the sliders on the left.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ManualNumberInput label="m" ariaLabel="Enter slope m" value={slope} min={-3} max={3} step={0.25} tone="violet" onChange={setSlope} />
        <ManualNumberInput label="b" ariaLabel="Enter y-intercept b" value={intercept} min={-6} max={6} step={0.5} tone="amber" onChange={setIntercept} />
        <ManualNumberInput label="probe x" ariaLabel="Enter probe x" value={probeX} min={-8} max={8} step={0.5} tone="blue" onChange={setProbeX} />
        <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700">
          probe y<br />
          <span className="font-mono text-base">{formatNumber(probeY)}</span>
        </span>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="violet"
      labId="graphing-lines"
      category="Mathematics"
      title="Graphing Lines & Slope"
      subtitle="ปรับความชันและจุดตัดแกนเพื่อสำรวจสมการเส้นตรง y = mx + b พร้อมอ่านกราฟ ตารางค่า และสามเหลี่ยมความชัน"
      statusLabel="Interactive graph ready"
      icon={Calculator}
      sceneTitle="ห้องทดลองกราฟเส้นตรง"
      scene={<GraphingStage slope={slope} intercept={intercept} probeX={probeX} loggedPoints={loggedPoints} />}
      controlsTitle="แผงควบคุมเส้นตรง"
      controls={controls}
      compactControls={compactControls}
      drawerSummary={drawerSummary}
      metrics={[
        { label: "สมการ", value: equation, tone: "violet" },
        { label: "ความชัน m", value: formatNumber(slope), tone: "blue" },
        { label: "จุดตัด b", value: formatNumber(intercept), tone: "orange" },
        { label: "probe y", value: formatNumber(probeY), tone: "emerald" },
      ]}
      graph={<MiniGraph points={loggedPoints} slope={slope} intercept={intercept} />}
      table={<GraphingResults loggedPoints={loggedPoints} onClearPoint={handleClearPoint} onCopyData={handleCopyData} onExportCSV={handleExportCSV} />}
      theory={<TheoryPanel slope={slope} intercept={intercept} probeX={probeX} />}
      steps={[
        { label: "ปรับความชัน", icon: Sliders },
        { label: "เลื่อนจุดตัดแกน", icon: Target },
        { label: "อ่านสามเหลี่ยมความชัน", icon: LineChart },
        { label: "บันทึกคู่ลำดับ", icon: ClipboardList },
        { label: "สรุปสมการ", icon: Calculator },
      ]}
      learningGoals={[
        "อธิบายความหมายของความชัน m จาก rise/run ได้",
        "อ่านจุดตัดแกน y และเชื่อมกับค่า b ในสมการได้",
        "สร้างตารางคู่ลำดับจากสมการ y = mx + b ได้",
        "เปรียบเทียบกราฟเมื่อ m หรือ b เปลี่ยนค่าได้อย่างมีเหตุผล",
      ]}
      progressLabel="ภารกิจอ่านเส้นตรง"
      progressValue={`${questProgress.toFixed(0)} / 100 ความคืบหน้า`}
      progressPercent={questProgress}
      tips={[
        "ถ้า m เป็นบวก เส้นจะสูงขึ้นเมื่อ x เพิ่มขึ้น",
        "ถ้า m เป็นลบ เส้นจะลดลงเมื่อ x เพิ่มขึ้น",
        "ค่า b คือจุดที่เส้นตัดแกน y เมื่อ x = 0",
        "ลองบันทึกจุดที่ x = 0 เพื่อยืนยันค่า intercept",
      ]}
      onSave={handleSaveResults}
    />
  );
}
