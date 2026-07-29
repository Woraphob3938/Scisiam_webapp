"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  LineChart,
  RotateCcw,
  Sliders,
  Download,
  Clipboard,
  ClipboardList,
  Target,
  Trash,
  Sparkles,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

type CurveType = "quadratic" | "cubic" | "sine";

interface LoggedRateChange {
  index: number;
  curveType: CurveType;
  xVal: number;
  deltaX: number;
  avgRate: number;
  instRate: number;
  error: number;
}

export default function RatesOfChangeSimulation() {
  const labId = "rates-of-change";

  // State configurations
  const [curveType, setCurveType] = useState<CurveType>("quadratic");
  const [xVal, setXVal] = useState<number>(1.0); // Point P x-coordinate
  const [deltaX, setDeltaX] = useState<number>(1.0); // interval width (dx)

  // Simulation runs logging & progress
  const [loggedRuns, setLoggedRuns] = useState<LoggedRateChange[]>([]);

  // Evaluate curve function f(x)
  const f = useCallback((x: number): number => {
    switch (curveType) {
      case "quadratic":
        // f(x) = 0.25 * x^2 - 2
        return 0.25 * x * x - 2.0;
      case "cubic":
        // f(x) = 0.05 * x^3 - 0.6 * x
        return 0.05 * x * x * x - 0.6 * x;
      case "sine":
        // f(x) = 2 * sin(0.8 * x)
        return 2.0 * Math.sin(0.8 * x);
      default:
        return 0;
    }
  }, [curveType]);

  // Evaluate derivative f'(x)
  const df = useCallback((x: number): number => {
    switch (curveType) {
      case "quadratic":
        // f'(x) = 0.5 * x
        return 0.5 * x;
      case "cubic":
        // f'(x) = 0.15 * x^2 - 0.6
        return 0.15 * x * x - 0.6;
      case "sine":
        // f'(x) = 1.6 * cos(0.8 * x)
        return 1.6 * Math.cos(0.8 * x);
      default:
        return 0;
    }
  }, [curveType]);

  const yVal = useMemo(() => f(xVal), [f, xVal]);
  const yPlusDelta = useMemo(() => f(xVal + deltaX), [deltaX, f, xVal]);

  // Average rate of change = delta y / delta x (slope of secant line)
  const averageRate = useMemo(() => {
    return (yPlusDelta - yVal) / deltaX;
  }, [yVal, yPlusDelta, deltaX]);

  // Instantaneous rate of change = f'(x) (slope of tangent line)
  const instantaneousRate = useMemo(() => {
    return df(xVal);
  }, [df, xVal]);

  // Difference/Error
  const rateDifference = useMemo(() => {
    return Math.abs(averageRate - instantaneousRate);
  }, [averageRate, instantaneousRate]);

  // Quest Tracker
  const questProgress = useMemo(() => {
    let progress = 0;
    // Condition 1: Use Cubic curve, position P at 1.5, and make deltaX <= 0.05
    if (curveType === "cubic" && Math.abs(xVal - 1.5) < 0.15 && deltaX <= 0.05) {
      progress += 50;
    }
    // Condition 2: Logged at least 4 distinct runs in the table
    if (loggedRuns.length >= 4) {
      progress += 50;
    }
    return progress;
  }, [curveType, xVal, deltaX, loggedRuns]);

  // SVG dimensions: ViewBox X: [-6, 6] -> Y: [-5, 5]
  // Dimensions 480x320
  // X: -6 to 6 maps to 40 to 440 (width = 400, center = 240, scale = 400 / 12 = 33.33)
  // Y: -5 to 5 maps to 280 to 40 (height = 240, center = 160, scale = 240 / 10 = 24)
  const xToSvg = (x: number) => 240 + x * 33.33;
  const yToSvg = (y: number) => 160 - y * 24;

  // Generate curve path coordinates
  const curvePathD = useMemo(() => {
    const points: string[] = [];
    const minX = -6;
    const maxX = 6;
    const step = 0.1;
    for (let x = minX; x <= maxX; x += step) {
      points.push(`${xToSvg(x)},${yToSvg(f(x))}`);
    }
    return `M ${points.join(" L ")}`;
  }, [f]);

  // Secant Line Points: extending line segment through P and Q
  const secantLinePoints = useMemo(() => {
    const p1x = xVal;
    const p1y = yVal;
    // y - y1 = m(x - x1)
    const m = averageRate;
    const xStart = -6;
    const yStart = m * (xStart - p1x) + p1y;
    const xEnd = 6;
    const yEnd = m * (xEnd - p1x) + p1y;
    return {
      x1: xToSvg(xStart),
      y1: yToSvg(yStart),
      x2: xToSvg(xEnd),
      y2: yToSvg(yEnd),
    };
  }, [averageRate, xVal, yVal]);

  // Tangent Line Points: extending line segment with slope f'(x)
  const tangentLinePoints = useMemo(() => {
    const p1x = xVal;
    const p1y = yVal;
    const m = instantaneousRate;
    const xStart = -6;
    const yStart = m * (xStart - p1x) + p1y;
    const xEnd = 6;
    const yEnd = m * (xEnd - p1x) + p1y;
    return {
      x1: xToSvg(xStart),
      y1: yToSvg(yStart),
      x2: xToSvg(xEnd),
      y2: yToSvg(yEnd),
    };
  }, [xVal, yVal, instantaneousRate]);

  const handleAddLog = () => {
    const newLog: LoggedRateChange = {
      index: loggedRuns.length + 1,
      curveType,
      xVal,
      deltaX,
      avgRate: averageRate,
      instRate: instantaneousRate,
      error: rateDifference,
    };
    setLoggedRuns((prev) => [...prev, newLog]);
  };

  const handleClearLog = (index: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== index));
  };

  const handleReset = () => {
    setCurveType("quadratic");
    setXVal(1.0);
    setDeltaX(1.0);
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
          `Run #${r.index}: Curve=${r.curveType}, x=${r.xVal.toFixed(2)}, Δx=${r.deltaX.toFixed(3)}, AvgRate(Secant)=${r.avgRate.toFixed(4)}, InstRate(Tangent)=${r.instRate.toFixed(4)}, Diff=${r.error.toFixed(4)}`
      )
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกข้อมูลแล้ว"));
  };

  const handleExportCSV = () => {
    if (loggedRuns.length === 0) {
      alert("ยังไม่มีข้อมูลบันทึก");
      return;
    }
    const headers = "index,curve_type,x_value,delta_x,average_rate,instantaneous_rate,error\n";
    const rows = loggedRuns
      .map(
        (r) =>
          `${r.index},${r.curveType},${r.xVal},${r.deltaX},${r.avgRate},${r.instRate},${r.error}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "rates_of_change_experiments.csv");
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
      curveType,
      xVal,
      deltaX,
      averageRate,
      instantaneousRate,
      rateDifference,
      loggedRuns,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_rates_of_change_experiment",
      localPayload: experimentData,
      labId,
      title: "Rates of Change Lab",
      variables: { xVal, deltaX, curveType },
      liveValues: { averageRate, instantaneousRate, rateDifference, questProgress },
      graphPoints: loggedRuns.map((r) => ({
        index: r.index,
        x: r.xVal,
        y: r.avgRate,
      })),
      tableRows: loggedRuns,
      summary: {
        runsCount: loggedRuns.length,
        minError: Math.min(...loggedRuns.map((r) => r.error)),
      },
      score: Math.min(100, Math.max(40, 40 + questProgress * 0.6)),
      durationSeconds: null,
    });

  };

  return (
    <SharedSimulationShell
      accent="violet"
      labId={labId}
      category="Mathematics"
      title="Rates of Change Lab"
      subtitle="ศึกษาความชันและแนวคิดแคลคูลัส เปรียบเทียบอัตราการเปลี่ยนแปลงเฉลี่ย (Secant) และอัตราขณะใดขณะหนึ่ง (Tangent) เมื่อช่วงช่วงเวลาบีบตัวเป็นศูนย์"
      statusLabel={`ความชันเส้นสัมผัสโค้ง: ${instantaneousRate.toFixed(2)}`}
      icon={LineChart}
      sceneTitle="วิชวลแสดงการแปลงความชันโค้งแบบเรียลไทม์"
      scene={
        <div className="relative flex h-full min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-violet-100 bg-[linear-gradient(135deg,#fcfdff_0%,#f8f5ff_50%,#f5f8ff_100%)] p-4 select-none">
          {/* Coordinate system background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-60" />

          {/* Value overlay display */}
          <div className="absolute left-4 top-4 rounded-xl border border-slate-200 bg-white/92 px-3 py-2.5 text-left shadow-sm backdrop-blur-md z-10 font-sans text-xs">
            <span className="block font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">
              อัตราการเปลี่ยนแปลงความชัน
            </span>
            <div className="flex flex-col gap-1 font-mono text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-slate-600">เฉลี่ย (Secant slope):</span>
                <span className="font-bold text-blue-600">{averageRate.toFixed(3)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-slate-600">เฉพาะจุด (Tangent):</span>
                <span className="font-bold text-rose-600">{instantaneousRate.toFixed(3)}</span>
              </div>
              <div className="flex items-center gap-1.5 border-t border-slate-100 pt-1 mt-1">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-slate-600">ส่วนต่าง (Difference):</span>
                <span className="font-bold text-indigo-600">{rateDifference.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* SVG mathematical visualization */}
          <svg className="w-full max-w-[440px] h-64 relative z-10" viewBox="0 0 480 320">
            {/* Grid Clipping Boundary */}
            <defs>
              <clipPath id="chart-area">
                <rect x="40" y="40" width="400" height="240" rx="12" />
              </clipPath>
            </defs>

            {/* Grid Box */}
            <rect x="40" y="40" width="400" height="240" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />

            <g clipPath="url(#chart-area)">
              {/* Axes lines */}
              <line x1="40" y1="160" x2="440" y2="160" stroke="#475569" strokeWidth="1.5" />
              <line x1="240" y1="40" x2="240" y2="280" stroke="#475569" strokeWidth="1.5" />

              {/* Major axes ticks and grid */}
              {[-6, -4, -2, 2, 4, 6].map((x) => (
                <line key={x} x1={xToSvg(x)} y1="40" x2={xToSvg(x)} y2="280" stroke="#f1f5f9" strokeWidth="1" />
              ))}
              {[-4, -2, 2, 4].map((y) => (
                <line key={y} x1="40" y1={yToSvg(y)} x2="440" y2={yToSvg(y)} stroke="#f1f5f9" strokeWidth="1" />
              ))}

              {/* Curve path */}
              <path d={curvePathD} fill="none" stroke="#64748b" strokeWidth="2.5" />

              {/* Secant Line (Blue) */}
              <line
                x1={secantLinePoints.x1}
                y1={secantLinePoints.y1}
                x2={secantLinePoints.x2}
                y2={secantLinePoints.y2}
                stroke="#3b82f6"
                strokeWidth="2"
                opacity="0.85"
              />

              {/* Tangent Line (Rose) */}
              <line
                x1={tangentLinePoints.x1}
                y1={tangentLinePoints.y1}
                x2={tangentLinePoints.x2}
                y2={tangentLinePoints.y2}
                stroke="#ec4899"
                strokeWidth="2"
                strokeDasharray="4,3"
                opacity="0.9"
              />

              {/* Δx & Δy triangle indicator */}
              <line
                x1={xToSvg(xVal)}
                y1={yToSvg(yVal)}
                x2={xToSvg(xVal + deltaX)}
                y2={yToSvg(yVal)}
                stroke="#3b82f6"
                strokeWidth="1.2"
                strokeDasharray="3,3"
              />
              <line
                x1={xToSvg(xVal + deltaX)}
                y1={yToSvg(yVal)}
                x2={xToSvg(xVal + deltaX)}
                y2={yToSvg(yPlusDelta)}
                stroke="#3b82f6"
                strokeWidth="1.2"
                strokeDasharray="3,3"
              />

              {/* Point P (violet) */}
              <circle cx={xToSvg(xVal)} cy={yToSvg(yVal)} r="5.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
              {/* Point Q (blue) */}
              <circle
                cx={xToSvg(xVal + deltaX)}
                cy={yToSvg(yPlusDelta)}
                r="5.5"
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>

            {/* Labels on Axes */}
            <text x="430" y="152" fill="#64748b" fontSize="9" fontWeight="bold">
              x
            </text>
            <text x="248" y="55" fill="#64748b" fontSize="9" fontWeight="bold">
              y
            </text>

            <text x={xToSvg(xVal) - 10} y={yToSvg(yVal) - 10} fill="#8b5cf6" fontSize="10" fontWeight="bold">
              P
            </text>
            <text x={xToSvg(xVal + deltaX) + 10} y={yToSvg(yPlusDelta) - 10} fill="#3b82f6" fontSize="10" fontWeight="bold">
              Q
            </text>
          </svg>
        </div>
      }
      controlsTitle="ปรับแต่งช่วงและชนิดสมการ"
      controls={
        <div className="flex flex-col gap-6 font-sans">
          {/* Curve Selection */}
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-violet-500" />
              ตัวเลือกกราฟฟังก์ชัน
            </h3>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500">เลือกสมการ f(x)</label>
              <select
                value={curveType}
                onChange={(e) => setCurveType(e.target.value as CurveType)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:border-violet-500 focus:outline-none"
              >
                <option value="quadratic">Quadratic: f(x) = 0.25x² - 2</option>
                <option value="cubic">Cubic: f(x) = 0.05x³ - 0.6x</option>
                <option value="sine">Sine Wave: f(x) = 2 sin(0.8x)</option>
              </select>
            </div>
          </section>

          {/* Adjust Variable Inputs */}
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-violet-500" />
              กำหนดช่วงและตัวแปร
            </h3>
            <div className="flex flex-col gap-4">
              <ManualNumberInput
                label="ตำแหน่งพิกัด x ของจุด P"
                ariaLabel="ตำแหน่งพิกัด x ของจุด P"
                value={xVal}
                min={-4.0}
                max={4.0}
                step={0.1}
                onChange={setXVal}
                tone="violet"
              />
              <ManualNumberInput
                label="ขนาดช่วงการขยับ (Δx)"
                ariaLabel="ขนาดช่วงการขยับ (Δx)"
                value={deltaX}
                min={0.01}
                max={2.0}
                step={0.01}
                onChange={setDeltaX}
                tone="blue"
              />
            </div>
          </section>

          {/* Log buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-97"
            >
              <Clipboard className="h-3.5 w-3.5 text-violet-500" />
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
          <p className="mb-3 font-semibold text-slate-800">อัตราการเปลี่ยนแปลงเฉลี่ยและเฉพาะจุด (Average vs Instantaneous Rate of Change)</p>
          <p className="mb-3">
            วิชาแคลคูลัสเริ่มต้นด้วยแนวคิดเรื่องอัตราการเปลี่ยนแปลง:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2.5">
            <li>
              <strong>อัตราการเปลี่ยนแปลงเฉลี่ย (Average Rate of Change):</strong>
              คือ ความชันของเส้นตรงที่เชื่อมระหว่างจุดสองจุด P และ Q บนเส้นโค้ง
              ซึ่งแทนด้วยเส้นตัด (Secant Line) มีสูตรคือ:
              <div className="my-2 rounded-xl bg-slate-50 p-2.5 text-center font-mono text-xs font-bold text-violet-700">
                {"Δy / Δx = [f(x + Δx) - f(x)] / Δx"}
              </div>
            </li>
            <li>
              <strong>อัตราการเปลี่ยนแปลงขณะใดขณะหนึ่ง (Instantaneous Rate of Change):</strong>
              คือ อัตราการเปลี่ยนแปลงที่แท้จริง ณ จุด P เท่านั้น
              เกิดจากการทำให้จุด Q เคลื่อนเข้าใกล้ P อย่างเป็นอนันต์ (ลิมิตเมื่อ Δx เข้าใกล้ 0)
              ซึ่งจะเท่ากับความชันของเส้นสัมผัสโค้ง (Tangent Line) และความชันนี้ก็คือค่า **อนุพันธ์ (Derivative)** ณ จุดนั้น:
              <div className="my-2 rounded-xl bg-slate-50 p-2.5 text-center font-mono text-xs font-bold text-pink-700">
                {"f'(x) = lim (Δx ➔ 0) [f(x + Δx) - f(x)] / Δx"}
              </div>
            </li>
          </ul>
        </div>
      }
      tips={[
        "ทดลองลากแกนตัวแปร Δx ให้ลดลงมาใกล้ 0.01 แล้วดูการรวมร่างกันของเส้นสีน้ำเงิน (Secant) และเส้นสีชมพู (Tangent)",
        "ลองเปลี่ยนฟังก์ชัน f(x) เป็นฟังก์ชันกำลังสาม (Cubic) หรือแบบไซน์ (Sine Wave) เพื่อเรียนรู้ว่าความชันสัมผัสโค้งเปลี่ยนแปลงไปอย่างไรตามแต่ละพิกัด x",
        "สังเกตว่าเมื่อพิกัด x เลื่อนไปที่จุดยอดสูงสุดหรือต่ำสุดของโค้ง ความชันของเส้นสัมผัสจะเป็น 0 พอดี (เส้นสัมผัสขนานกับแกน X)",
      ]}
      metrics={[
        {
          label: "ความชัน Secant (เฉลี่ย)",
          value: averageRate.toFixed(3),
          tone: "blue",
        },
        {
          label: "ความชัน Tangent (สัมผัส)",
          value: instantaneousRate.toFixed(3),
          tone: "rose",
        },
        {
          label: "ส่วนต่างความชัน (Error)",
          value: rateDifference.toFixed(4),
          tone: "violet",
        },
        {
          label: "ขนาดช่วง (Δx)",
          value: deltaX.toFixed(3),
          tone: "cyan",
        },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-violet-600" />
              สมการเชิงอนุพันธ์และลิมิตความชัน
            </h3>
          </div>
          <div className="flex-grow flex flex-col justify-center gap-3 text-xs leading-relaxed text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3 flex flex-col gap-2 border border-slate-150">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-700">สูตรอัตราเฉลี่ย (Secant slope):</span>
                <span className="font-mono font-black text-blue-600 text-center">Δy/Δx = [f(x+Δx) - f(x)] / Δx</span>
              </div>
              <div className="flex flex-col gap-1 border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-700">สูตรอัตราขณะใดขณะหนึ่ง (Tangent slope):</span>
                <span className="font-mono font-black text-rose-600 text-center">f&apos;(x) = lim(Δx➔0) [Δy/Δx]</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              * เมื่อ Δx มีค่าลู่เข้าสู่ศูนย์ (lim Δx ➔ 0) เส้นทแยงมุมเฉลี่ย (Secant) จะหมุนตัวมาซ้อนทับกับเส้นสัมผัสพอดี (Tangent) ซึ่งเป็นหัวใจสำคัญของทฤษฎีแคลคูลัส
            </p>
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                <ClipboardList className="h-4.5 w-4.5 text-violet-500" />
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
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-2.5 text-center">ชุดที่</th>
                      <th className="p-2.5">กราฟ</th>
                      <th className="p-2.5">พิกัด x (P)</th>
                      <th className="p-2.5">ขนาดช่วง Δx</th>
                      <th className="p-2.5 text-right">ความชันเฉลี่ย (Secant)</th>
                      <th className="p-2.5 text-right">ความชันสัมผัส (Tangent)</th>
                      <th className="p-2.5 text-right">ส่วนต่าง</th>
                      <th className="p-2.5 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                    {loggedRuns.map((run) => (
                      <tr key={run.index} className="hover:bg-violet-50/20 transition-colors">
                        <td className="p-2 text-center font-bold">{run.index}</td>
                        <td className="p-2 font-sans text-slate-800 capitalize">{run.curveType}</td>
                        <td className="p-2">{run.xVal.toFixed(2)}</td>
                        <td className="p-2">{run.deltaX.toFixed(3)}</td>
                        <td className="p-2 text-right text-blue-600 font-bold">{run.avgRate.toFixed(4)}</td>
                        <td className="p-2 text-right text-rose-600 font-bold">{run.instRate.toFixed(4)}</td>
                        <td className="p-2 text-right font-bold text-slate-800">{run.error.toFixed(4)}</td>
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
        "อธิบายความหมายและสูตรคำนวณอัตราการเปลี่ยนแปลงเฉลี่ยและขณะใดขณะหนึ่ง",
        "วิเคราะห์จุดเชื่อมโยงของเส้นตัดโค้ง (Secant) ที่หมุนเปลี่ยนไปสัมผัสโค้ง (Tangent) ตามลิมิตของช่วง",
        "ระบุความสัมพันธ์ของความชันของเส้นสัมผัสโค้งและสมบัติของฟังก์ชันคณิตศาสตร์เชิงลึก",
        "เปรียบเทียบแนวคิดคณิตศาสตร์เบื้องต้นที่เป็นพื้นฐานของบทอนุพันธ์และวิชาแคลคูลัส",
      ]}
      steps={[
        { label: "เลือกประเภทสมการโค้ง f(x) ที่มีลวดลายเฉพาะตัว", icon: Sliders },
        { label: "กำหนดพิกัดแกน x ของจุด P ที่จะทำการวัดความชันสัมผัส", icon: Sliders },
        { label: "ลดขนาดความกว้างช่วง Δx เพื่อสังเกต secant line ลู่เข้าหา tangent", icon: Target },
        { label: "บันทึกข้อมูลการเปรียบเทียบและวิเคราะห์ผลลัพธ์เชิงทฤษฎี", icon: Clipboard },
      ]}
      progressLabel="ความคืบหน้ากิจกรรมการลู่เข้าแคลคูลัส"
      progressValue={loggedRuns.length >= 4 ? "บันทึกเปรียบเทียบครบ 4 ชุดข้อมูลแล้ว" : `${loggedRuns.length}/4 ชุดพิกัดการวัดที่บันทึก`}
      progressPercent={questProgress}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}

