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

interface LoggedSystem {
  index: number;
  m1: number;
  b1: number;
  m2: number;
  b2: number;
  intersectX: number | null;
  intersectY: number | null;
  state: "one-solution" | "no-solution" | "infinite-solutions";
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

function formatEquation(slope: number, intercept: number, lineLabel: string) {
  const m = formatNumber(slope);
  const b = formatNumber(Math.abs(intercept));
  if (slope === 0) {
    return `${lineLabel}: y = ${formatNumber(intercept)}`;
  }
  const mxTerm = m === "1" ? "x" : m === "-1" ? "-x" : `${m}x`;
  if (intercept === 0) return `${lineLabel}: y = ${mxTerm}`;
  return `${lineLabel}: y = ${mxTerm} ${intercept > 0 ? "+" : "-"} ${b}`;
}

function MiniGraph({
  m1,
  b1,
  m2,
  b2,
  intersectX,
  intersectY,
}: {
  m1: number;
  b1: number;
  m2: number;
  b2: number;
  intersectX: number | null;
  intersectY: number | null;
}) {
  const xCoord = (x: number) => 24 + ((x - GRAPH_MIN) / (GRAPH_MAX - GRAPH_MIN)) * 156;
  const yCoord = (y: number) => 100 - ((y - GRAPH_MIN) / (GRAPH_MAX - GRAPH_MIN)) * 82;

  const line1Path = `M${xCoord(GRAPH_MIN)},${yCoord(m1 * GRAPH_MIN + b1)} L${xCoord(GRAPH_MAX)},${yCoord(m1 * GRAPH_MAX + b1)}`;
  const line2Path = `M${xCoord(GRAPH_MIN)},${yCoord(m2 * GRAPH_MIN + b2)} L${xCoord(GRAPH_MAX)},${yCoord(m2 * GRAPH_MAX + b2)}`;

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 font-sans">
          <LineChart className="h-4.5 w-4.5 text-violet-600" />
          กราฟผลลัพธ์ย่อ
        </h3>
      </div>
      <div className="flex-grow rounded-xl bg-slate-950 p-3 flex items-center justify-center">
        <svg className="h-full min-h-[174px] w-full" viewBox="0 0 200 120" fill="none">
          {Array.from({ length: 5 }, (_, index) => 18 + index * 20).map((y) => (
            <line key={y} x1="24" y1={y} x2="180" y2={y} stroke="rgba(255,255,255,0.06)" />
          ))}
          {Array.from({ length: 5 }, (_, index) => 24 + index * 39).map((x) => (
            <line key={x} x1={x} y1="18" x2={x} y2="100" stroke="rgba(255,255,255,0.06)" />
          ))}
          <line x1="24" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.18)" />
          <line x1="24" y1="18" x2="24" y2="100" stroke="rgba(255,255,255,0.18)" />
          <path d={line1Path} stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" />
          <path d={line2Path} stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
          {intersectX !== null &&
            intersectY !== null &&
            intersectX >= GRAPH_MIN &&
            intersectX <= GRAPH_MAX &&
            intersectY >= GRAPH_MIN &&
            intersectY <= GRAPH_MAX && (
              <circle
                cx={xCoord(intersectX)}
                cy={yCoord(intersectY)}
                r="4.5"
                fill="#8b5cf6"
                stroke="#ffffff"
                strokeWidth="1.2"
              />
            )}
          <text x="180" y="112" fill="#94a3b8" fontSize="8" fontWeight="800" textAnchor="middle">
            x
          </text>
          <text x="14" y="22" fill="#94a3b8" fontSize="8" fontWeight="800">
            y
          </text>
        </svg>
      </div>
    </section>
  );
}

export default function SystemsEquationsSimulation() {
  const router = useRouter();
  const labId = "systems-of-equations";

  // Line 1 parameters (Blue line)
  const [m1, setM1] = useState<number>(1.0);
  const [b1, setB1] = useState<number>(1.0);

  // Line 2 parameters (Red line)
  const [m2, setM2] = useState<number>(-0.5);
  const [b2, setB2] = useState<number>(-2.0);

  // History log
  const [loggedSystems, setLoggedSystems] = useState<LoggedSystem[]>([]);

  // Compute intersection point
  const { intersectX, intersectY, state } = useMemo(() => {
    const dSlope = m1 - m2;
    if (Math.abs(dSlope) < 0.0001) {
      if (Math.abs(b1 - b2) < 0.0001) {
        return { intersectX: null, intersectY: null, state: "infinite-solutions" as const };
      }
      return { intersectX: null, intersectY: null, state: "no-solution" as const };
    }
    const x = (b2 - b1) / dSlope;
    const y = m1 * x + b1;
    return { intersectX: x, intersectY: y, state: "one-solution" as const };
  }, [m1, b1, m2, b2]);

  // Exploration progress based on logged equations count
  const questProgress = useMemo(() => {
    return Math.min(100, loggedSystems.length * 20);
  }, [loggedSystems]);

  const handleAddPoint = () => {
    setLoggedSystems((prev) => [
      ...prev.slice(-11),
      {
        index: prev.length > 0 ? Math.max(...prev.map((s) => s.index)) + 1 : 1,
        m1,
        b1,
        m2,
        b2,
        intersectX,
        intersectY,
        state,
      },
    ]);
  };

  const handleClearPoint = (index: number) => {
    setLoggedSystems((current) => current.filter((s) => s.index !== index));
  };

  const handleReset = () => {
    setM1(1.0);
    setB1(1.0);
    setM2(-0.5);
    setB2(-2.0);
    setLoggedSystems([]);
  };

  const handleCopyData = () => {
    if (loggedSystems.length === 0) {
      alert("ยังไม่มีข้อมูลในตารางบันทึก");
      return;
    }
    const content = loggedSystems
      .map((s) => {
        const intersectionStr =
          s.state === "one-solution"
            ? `(${formatNumber(s.intersectX!)}, ${formatNumber(s.intersectY!)})`
            : s.state === "no-solution"
            ? "ไม่มีจุดตัด (ขนานกัน)"
            : "จุดตัดไม่สิ้นสุด (ทับกัน)";
        return `#${s.index}: เส้นที่ 1 (y=${formatNumber(s.m1)}x+${formatNumber(
          s.b1
        )}), เส้นที่ 2 (y=${formatNumber(s.m2)}x+${formatNumber(s.b2)}), จุดตัด=${intersectionStr}`;
      })
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกข้อมูลระบบสมการแล้ว"));
  };

  const handleExportCSV = () => {
    if (loggedSystems.length === 0) {
      alert("ยังไม่มีข้อมูลสำหรับส่งออก");
      return;
    }
    const headers = "index,m1,b1,m2,b2,intersect_x,intersect_y,solution_state\n";
    const rows = loggedSystems
      .map(
        (s) =>
          `${s.index},${s.m1},${s.b1},${s.m2},${s.b2},${
            s.intersectX !== null ? s.intersectX.toFixed(4) : ""
          },${s.intersectY !== null ? s.intersectY.toFixed(4) : ""},${s.state}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scisiam_systems_equations_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveResults = async () => {
    if (loggedSystems.length === 0) {
      alert("บันทึกจุดตัดในตารางการทดลองอย่างน้อย 1 ครั้งก่อนส่งผลลัพธ์");
      return;
    }

    const experimentData = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      m1,
      b1,
      m2,
      b2,
      intersectX,
      intersectY,
      state,
      loggedSystems,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_systems_eq_experiment",
      localPayload: experimentData,
      labId,
      title: "Systems of Equations",
      variables: { m1, b1, m2, b2 },
      liveValues: { intersectX, intersectY, state, questProgress },
      graphPoints: loggedSystems.map((s) => ({
        index: s.index,
        x: s.intersectX || 0,
        y: s.intersectY || 0,
        slope: s.m1,
        intercept: s.b1,
      })),
      tableRows: loggedSystems,
      summary: {
        m1,
        b1,
        m2,
        b2,
        state,
        loggedCount: loggedSystems.length,
      },
      score: Math.min(100, Math.max(40, loggedSystems.length * 20)),
      durationSeconds: null,
    });

    alert("บันทึกผลแล็บ Systems of Equations สำเร็จ");
    router.push(`/labs/${labId}`);
  };

  // Convert coordinate values to SVG coordinates
  const xToSvg = (x: number) =>
    PLOT_LEFT + ((x - GRAPH_MIN) / (GRAPH_MAX - GRAPH_MIN)) * (PLOT_RIGHT - PLOT_LEFT);
  const yToSvg = (y: number) =>
    PLOT_BOTTOM - ((y - GRAPH_MIN) / (GRAPH_MAX - GRAPH_MIN)) * (PLOT_BOTTOM - PLOT_TOP);

  // Line paths calculation within bounding box
  const getLinePoints = (m: number, b: number) => {
    const yStart = m * GRAPH_MIN + b;
    const yEnd = m * GRAPH_MAX + b;
    return {
      x1: GRAPH_MIN,
      y1: yStart,
      x2: GRAPH_MAX,
      y2: yEnd,
    };
  };

  const line1Points = getLinePoints(m1, b1);
  const line2Points = getLinePoints(m2, b2);

  const isIntersectionVisible =
    intersectX !== null &&
    intersectY !== null &&
    intersectX >= GRAPH_MIN &&
    intersectX <= GRAPH_MAX &&
    intersectY >= GRAPH_MIN &&
    intersectY <= GRAPH_MAX;

  return (
    <SharedSimulationShell
      accent="violet"
      labId={labId}
      category="Mathematics"
      title="Systems of Equations"
      subtitle="สำรวจระบบสมการเชิงเส้นสองตัวแปร ปรับความชันและจุดตัดของเส้นตรงเพื่อหาจุดร่วม ค้นหาคำตอบเชิงพิกัด"
      statusLabel={
        state === "one-solution"
          ? "พบคำตอบหนึ่งเดียว"
          : state === "no-solution"
          ? "ไม่มีคำตอบ (ขนานกัน)"
          : "มีคำตอบอนันต์ (ทับกัน)"
      }
      icon={LineChart}
      sceneTitle="วิชวลแสดงกราฟระบบสมการเชิงเส้น"
      scene={
        <div className="relative flex h-full min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eefcff_48%,#fff7fb_100%)] p-4 select-none">
          {/* Grid lines pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-45" />

          {/* Info overlay card */}
          <div className="absolute left-5 bottom-5 rounded-xl border border-slate-200 bg-white/92 px-3 py-2 text-left shadow-md backdrop-blur-md z-10 font-sans">
            <p className="text-[9px] font-black uppercase tracking-wider text-blue-600">Line 1 (Blue)</p>
            <p className="font-mono text-xs font-black text-slate-700">
              {formatEquation(m1, b1, "y")}
            </p>
            <p className="text-[9px] font-black uppercase tracking-wider text-rose-600 mt-1">Line 2 (Red)</p>
            <p className="font-mono text-xs font-black text-slate-700">
              {formatEquation(m2, b2, "y")}
            </p>
          </div>

          {/* Intersection display card */}
          <div className="absolute right-5 bottom-5 rounded-xl border border-slate-200 bg-white/92 px-3 py-2 text-right shadow-md backdrop-blur-md z-10 font-sans">
            <p className="text-[9px] font-black uppercase tracking-wider text-violet-600 font-sans">คำตอบ (Solution)</p>
            <p className="font-mono text-xs font-extrabold text-slate-800">
              {state === "one-solution" && intersectX !== null && intersectY !== null ? (
                `(${formatNumber(intersectX)}, ${formatNumber(intersectY)})`
              ) : state === "no-solution" ? (
                <span className="text-amber-600">ไม่มีคำตอบ (Parallel)</span>
              ) : (
                <span className="text-emerald-600">คำตอบอนันต์ (Identical)</span>
              )}
            </p>
          </div>

          <svg className="relative z-10 w-full max-w-[440px] h-64" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
            <defs>
              <clipPath id="systems-clip">
                <rect
                  x={PLOT_LEFT}
                  y={PLOT_TOP}
                  width={PLOT_RIGHT - PLOT_LEFT}
                  height={PLOT_BOTTOM - PLOT_TOP}
                  rx="14"
                />
              </clipPath>
              <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Drawing axes and grid */}
            <rect
              x={PLOT_LEFT}
              y={PLOT_TOP}
              width={PLOT_RIGHT - PLOT_LEFT}
              height={PLOT_BOTTOM - PLOT_TOP}
              rx="14"
              fill="#ffffff"
              stroke="#ddd6fe"
              strokeWidth="2"
            />

            {Array.from({ length: 21 }, (_, index) => GRAPH_MIN + index).map((value) => {
              const x = xToSvg(value);
              const y = yToSvg(value);
              const isAxis = value === 0;
              const isMajor = value % 2 === 0;
              return (
                <g key={value}>
                  <line
                    x1={x}
                    y1={PLOT_TOP}
                    x2={x}
                    y2={PLOT_BOTTOM}
                    stroke={isAxis ? "#475569" : isMajor ? "#e2e8f0" : "#f1f5f9"}
                    strokeWidth={isAxis ? 2 : 1}
                  />
                  <line
                    x1={PLOT_LEFT}
                    y1={y}
                    x2={PLOT_RIGHT}
                    y2={y}
                    stroke={isAxis ? "#475569" : isMajor ? "#e2e8f0" : "#f1f5f9"}
                    strokeWidth={isAxis ? 2 : 1}
                  />
                  {isMajor && value !== 0 && (
                    <>
                      <text
                        x={x}
                        y={PLOT_BOTTOM + 16}
                        fill="#94a3b8"
                        fontSize="9"
                        fontWeight="800"
                        textAnchor="middle"
                      >
                        {value}
                      </text>
                      <text
                        x={PLOT_LEFT - 10}
                        y={y + 3}
                        fill="#94a3b8"
                        fontSize="9"
                        fontWeight="800"
                        textAnchor="end"
                      >
                        {value}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Grid center labels (Origin indicator) */}
            <text
              x={xToSvg(0) - 8}
              y={yToSvg(0) + 14}
              fill="#94a3b8"
              fontSize="9"
              fontWeight="800"
            >
              0
            </text>

            <g clipPath="url(#systems-clip)">
              {/* Line 1 (Blue) */}
              <line
                x1={xToSvg(line1Points.x1)}
                y1={yToSvg(line1Points.y1)}
                x2={xToSvg(line1Points.x2)}
                y2={yToSvg(line1Points.y2)}
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Line 2 (Red) */}
              <line
                x1={xToSvg(line2Points.x1)}
                y1={yToSvg(line2Points.y1)}
                x2={xToSvg(line2Points.x2)}
                y2={yToSvg(line2Points.y2)}
                stroke="#dc2626"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Intersection coordinates drop lines */}
              {isIntersectionVisible && (
                <g>
                  <line
                    x1={xToSvg(intersectX!)}
                    y1={yToSvg(intersectY!)}
                    x2={xToSvg(intersectX!)}
                    y2={yToSvg(0)}
                    stroke="#7c3aed"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1={xToSvg(intersectX!)}
                    y1={yToSvg(intersectY!)}
                    x2={xToSvg(0)}
                    y2={yToSvg(intersectY!)}
                    stroke="#7c3aed"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Intersection Point Ring */}
                  <circle
                    cx={xToSvg(intersectX!)}
                    cy={yToSvg(intersectY!)}
                    r="8"
                    fill="#7c3aed"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    filter="url(#glow)"
                  />
                  <circle
                    cx={xToSvg(intersectX!)}
                    cy={yToSvg(intersectY!)}
                    r="3"
                    fill="#ffffff"
                  />
                </g>
              )}
            </g>

            {/* Axis Label Tags */}
            <text x={PLOT_RIGHT + 12} y={yToSvg(0) + 4} fill="#475569" fontSize="11" fontWeight="950">
              x
            </text>
            <text x={xToSvg(0) - 3} y={PLOT_TOP - 8} fill="#475569" fontSize="11" fontWeight="950" textAnchor="middle">
              y
            </text>
          </svg>
        </div>
      }
      controlsTitle="แผงควบคุมระบบสมการเชิงเส้น"
      controls={
        <div className="space-y-4">
          {/* Line 1 (Blue) Sliders */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
            <span className="block text-[11px] font-black text-blue-700 mb-1">สมการที่ 1 (เส้นสีน้ำเงิน)</span>

            <div className="mb-2">
              <div className="flex justify-between items-center text-[10px] font-bold mb-0.5">
                <span className="text-slate-500">ความชัน m₁</span>
                <span className="font-extrabold text-blue-600">{formatNumber(m1)}</span>
              </div>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.25"
                value={m1}
                onChange={(e) => setM1(Number(e.target.value))}
                className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] font-bold mb-0.5">
                <span className="text-slate-500">จุดตัด b₁</span>
                <span className="font-extrabold text-blue-600">{formatNumber(b1)}</span>
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                step="0.5"
                value={b1}
                onChange={(e) => setB1(Number(e.target.value))}
                className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Line 2 (Red) Sliders */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
            <span className="block text-[11px] font-black text-rose-700 mb-1">สมการที่ 2 (เส้นสีแดง)</span>

            <div className="mb-2">
              <div className="flex justify-between items-center text-[10px] font-bold mb-0.5">
                <span className="text-slate-500">ความชัน m₂</span>
                <span className="font-extrabold text-rose-600">{formatNumber(m2)}</span>
              </div>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.25"
                value={m2}
                onChange={(e) => setM2(Number(e.target.value))}
                className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] font-bold mb-0.5">
                <span className="text-slate-500">จุดตัด b₂</span>
                <span className="font-extrabold text-rose-600">{formatNumber(b2)}</span>
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                step="0.5"
                value={b2}
                onChange={(e) => setB2(Number(e.target.value))}
                className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>
          </div>

          {/* Quick Action Button Grid */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={handleAddPoint}
              className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-650 px-3 py-2.5 text-xs font-black text-white shadow-sm hover:bg-violet-750 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              บันทึกจุดตัด
            </button>
            <button
              type="button"
              onClick={() => {
                setM1(-m1);
                setM2(-m2);
              }}
              className="inline-flex items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-xs font-black text-violet-700 hover:bg-violet-100 cursor-pointer"
            >
              กลับความชัน
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-655 hover:bg-slate-50 cursor-pointer"
              aria-label="Reset parameters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
      compactControls={
        <div className="grid grid-cols-4 gap-2">
          <ManualNumberInput
            label="m₁ (Line 1)"
            ariaLabel="Slope 1"
            value={m1}
            min={-3}
            max={3}
            step={0.25}
            tone="blue"
            onChange={setM1}
          />
          <ManualNumberInput
            label="b₁ (Line 1)"
            ariaLabel="Intercept 1"
            value={b1}
            min={-6}
            max={6}
            step={0.5}
            tone="blue"
            onChange={setB1}
          />
          <ManualNumberInput
            label="m₂ (Line 2)"
            ariaLabel="Slope 2"
            value={m2}
            min={-3}
            max={3}
            step={0.25}
            tone="pink"
            onChange={setM2}
          />
          <ManualNumberInput
            label="b₂ (Line 2)"
            ariaLabel="Intercept 2"
            value={b2}
            min={-6}
            max={6}
            step={0.5}
            tone="pink"
            onChange={setB2}
          />
        </div>
      }
      metrics={[
        {
          label: "ความต่าง m₁ - m₂",
          value: formatNumber(m1 - m2),
          tone: "violet",
        },
        {
          label: "พิกัด x จุดตัด",
          value: intersectX !== null ? formatNumber(intersectX) : "N/A",
          tone: "blue",
        },
        {
          label: "พิกัด y จุดตัด",
          value: intersectY !== null ? formatNumber(intersectY) : "N/A",
          tone: "orange",
        },
        {
          label: "สถานะระบบสมการ",
          value: state === "one-solution" ? "มีคำตอบเดียว" : state === "no-solution" ? "ไม่มีคำตอบ" : "คำตอบอนันต์",
          tone: state === "one-solution" ? "emerald" : state === "no-solution" ? "orange" : "violet",
        },
      ]}
      graph={<MiniGraph m1={m1} b1={b1} m2={m2} b2={b2} intersectX={intersectX} intersectY={intersectY} />}
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 font-sans">
              <ClipboardList className="h-4.5 w-4.5 text-violet-600" />
              ตารางบันทึกการสำรวจพิกัด
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyData}
                className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                aria-label="Copy table data"
              >
                <Clipboard className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                aria-label="Download table as CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-violet-50/70 text-[11px] font-black text-violet-850">
                <tr>
                  <th className="px-3 py-2">จุด</th>
                  <th className="px-2 py-2">สมการ 1</th>
                  <th className="px-2 py-2">สมการ 2</th>
                  <th className="px-3 py-2">คำตอบ (x, y)</th>
                  <th className="px-3 py-2 text-center">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                {loggedSystems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      ยังไม่มีข้อมูลที่บันทึก
                    </td>
                  </tr>
                ) : (
                  loggedSystems.map((s) => (
                    <tr key={s.index} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-mono">#{s.index}</td>
                      <td className="px-2 py-2 font-mono text-[10px] text-blue-600">
                        y={formatNumber(s.m1)}x{s.b1 >= 0 ? "+" : "-"}
                        {formatNumber(Math.abs(s.b1))}
                      </td>
                      <td className="px-2 py-2 font-mono text-[10px] text-rose-600">
                        y={formatNumber(s.m2)}x{s.b2 >= 0 ? "+" : "-"}
                        {formatNumber(Math.abs(s.b2))}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {s.state === "one-solution" && s.intersectX !== null && s.intersectY !== null ? (
                          <span className="text-violet-700">
                            ({formatNumber(s.intersectX)}, {formatNumber(s.intersectY)})
                          </span>
                        ) : s.state === "no-solution" ? (
                          <span className="text-amber-600">Parallel</span>
                        ) : (
                          <span className="text-emerald-600">Identical</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleClearPoint(s.index)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      }
      theory={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800 font-sans">
            <Calculator className="h-4.5 w-4.5 text-violet-600" />
            ทฤษฎีระบบสมการเชิงเส้นสองตัวแปร
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3 text-xs leading-relaxed text-slate-500">
            <div>
              <p className="font-semibold mb-1">
                ระบบสมการเชิงเส้นสองตัวแปร (System of Linear Equations) คือกลุ่มของสมการเส้นตรงสองเส้นขึ้นไปที่มีตัวแปรร่วมกัน เช่น:
              </p>
              <div className="my-2 rounded-xl border border-violet-100 bg-violet-50/60 p-3 text-center text-sm font-bold text-slate-800 font-mono">
                Line 1: y = m₁x + b₁ <br />
                Line 2: y = m₂x + b₂
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-700">ผลเฉลยของระบบสมการมีได้ 3 รูปแบบ:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>
                  <b className="text-blue-700">มีหนึ่งคำตอบเดียว:</b> เมื่อเส้นตรงมีความชันต่างกัน (m₁ ≠ m₂) เส้นจะตัดกันที่พิกัดร่วมพอยต์เดียว
                </li>
                <li>
                  <b className="text-amber-700">ไม่มีคำตอบ:</b> เมื่อเส้นตรงขนานกัน (m₁ = m₂ แต่ b₁ ≠ b₂) ซึ่งทำให้พิกัดไม่มีวันตัดกัน
                </li>
                <li>
                  <b className="text-emerald-700">มีคำตอบอนันต์:</b> เมื่อเส้นตรงสองเส้นทับกันสนิท (m₁ = m₂ และ b₁ = b₂)
                </li>
              </ul>
            </div>
          </div>
        </section>
      }
      steps={[
        { label: "ปรับแต่งความชัน (m₁) และจุดตัด (b₁) ของเส้นที่ 1", icon: Sliders },
        { label: "ปรับแต่งความชัน (m₂) และจุดตัด (b₂) ของเส้นที่ 2", icon: Sliders },
        { label: "สังเกตจุดตัดร่วมวิเคราะห์เชิงพิกัดทางคณิตศาสตร์", icon: Target },
        { label: "บันทึกพิกัดระบบสมการเพื่อสะสมความคืบหน้าการเรียนรู้", icon: ClipboardList },
      ]}
      learningGoals={[
        "อธิบายความหมายและวิเคราะห์คำตอบของระบบสมการเชิงเส้นได้ชัดเจน",
        "ระบุความสัมพันธ์ของความชันต่อทิศทางและสมบัติเส้นขนาน/เส้นตั้งฉาก",
        "หาจุดตัดร่วมทางคณิตศาสตร์จากสูตรวิเคราะห์ความแตกต่างได้ถูกต้อง",
        "คำนวณเปรียบเทียบคู่ลำดับ (x, y) จากการสมดุลระบบสมการทางตัวแปร",
      ]}
      progressLabel="ความคืบหน้าการสำรวจระบบสมการเชิงเส้น"
      progressValue={`${loggedSystems.length} / 5 คู่สมการที่บันทึก`}
      progressPercent={questProgress}
      tips={[
        "หากต้องการหาจุดตัด x ทางทฤษฎี ให้คำนวณจากสูตร x = (b₂ - b₁) / (m₁ - m₂)",
        "จำง่ายๆ: เส้นตรงตั้งฉากกันเมื่อผลคูณของความชัน m₁ × m₂ มีค่าเท่ากับ -1 พอดี",
        "ลองทดลองปรับความชัน m₁ และ m₂ ให้เท่ากัน เพื่อดูการเกิดเส้นขนานที่ไม่มีทางตัดกัน",
      ]}
      onSave={handleSaveResults}
    />
  );
}
