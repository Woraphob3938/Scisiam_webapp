"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  Zap,
  Sliders,
  ClipboardList,
  Trash,
  Download,
  Clipboard,
  Target,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

export interface OhmsDataPoint {
  index: number;
  voltage: number;
  resistance: number;
  current: number;
}

function OhmsGraph({
  dataPoints,
  voltage,
  current,
  switchStatus,
}: {
  dataPoints: OhmsDataPoint[];
  voltage: number;
  current: number;
  switchStatus: boolean;
}) {
  const xCoord = (v: number) => 30 + (v / 24) * 150;
  const yCoord = (i: number) => 100 - (i / 2.5) * 85;

  const currentLinePath = useMemo(() => {
    if (dataPoints.length === 0) return "";
    const sorted = [...dataPoints].sort((a, b) => a.voltage - b.voltage);
    return sorted.map((p, idx) => `${idx === 0 ? "M" : "L"}${xCoord(p.voltage)},${yCoord(p.current)}`).join(" ");
  }, [dataPoints]);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <Zap className="h-4.5 w-4.5 text-blue-600" />
          กราฟผลการทดลอง (V-I Curve)
        </h3>
        <span className="text-[10px] font-bold text-blue-600">I = V / R</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-950 p-3 flex flex-col justify-between">
        <svg className="w-full h-full min-h-[174px]" viewBox="0 0 200 120" fill="none">
          {/* Grid lines */}
          <line x1="30" y1="15" x2="180" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="36.25" x2="180" y2="36.25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="57.5" x2="180" y2="57.5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="78.75" x2="180" y2="78.75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Y-axis metrics */}
          <text x="27" y="17.5" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">2.5 A</text>
          <text x="27" y="38.75" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">2.0 A</text>
          <text x="27" y="60" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">1.5 A</text>
          <text x="27" y="81.25" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">1.0 A</text>

          {/* Live Operating Position Line */}
          {currentLinePath && (
            <path d={currentLinePath} stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          )}

          {/* Logged points circles */}
          {dataPoints.map((p) => (
            <circle
              key={p.index}
              cx={xCoord(p.voltage)}
              cy={yCoord(p.current)}
              r="2.5"
              fill="#22d3ee"
              stroke="#ffffff"
              strokeWidth="0.75"
            />
          ))}

          {/* Live operating indicator circle */}
          {switchStatus && (
            <circle
              cx={xCoord(voltage)}
              cy={yCoord(current)}
              r="3.5"
              fill="#ef4444"
            />
          )}

          {/* Axes lines */}
          <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          
          {/* X-axis metrics */}
          <text x="30" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0</text>
          <text x="67.5" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">6</text>
          <text x="105" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">12</text>
          <text x="142.5" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">18</text>
          <text x="180" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">24</text>
          <text x="195" y="108" fill="#94a3b8" fontSize="6" fontWeight="bold">V</text>
        </svg>
      </div>
    </section>
  );
}

function ResultsTable({
  dataPoints,
  onClearPoint,
  onCopyData,
  onExportCSV,
}: {
  dataPoints: OhmsDataPoint[];
  onClearPoint: (idx: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-blue-600" />
          ตารางบันทึกผล
        </h3>
        <div className="flex gap-2">
          <button onClick={onCopyData} className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <Clipboard className="w-3.5 h-3.5" />
          </button>
          <button onClick={onExportCSV} className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-blue-50/70 text-[11px] font-black text-blue-800">
            <tr>
              <th className="px-3 py-2">จุดวัด</th>
              <th className="px-3 py-2">แรงดัน (V)</th>
              <th className="px-3 py-2">ความต้านทาน (Ω)</th>
              <th className="px-3 py-2">กระแส (I)</th>
              <th className="px-3 py-2 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {dataPoints.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">ไม่มีข้อมูลบันทึก</td>
              </tr>
            ) : (
              dataPoints.map((point) => (
                <tr key={point.index} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2 font-mono">#{point.index}</td>
                  <td className="px-3 py-2 font-mono text-blue-600">{point.voltage.toFixed(1)} V</td>
                  <td className="px-3 py-2 font-mono text-amber-600">{point.resistance.toFixed(0)} Ω</td>
                  <td className="px-3 py-2 font-mono text-emerald-600">{point.current.toFixed(3)} A</td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => onClearPoint(point.index)} className="text-red-500 hover:text-red-700 p-1">
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
  );
}

function TheoryPanel({
  voltage,
  resistance,
  current,
  switchStatus,
}: {
  voltage: number;
  resistance: number;
  current: number;
  switchStatus: boolean;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Zap className="h-4.5 w-4.5 text-blue-600" />
        ทฤษฎีและสมการ
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-center text-xl font-black text-slate-800 font-mono">
          I = V / R
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500">
          กระแสไฟฟ้า (I) ในตัวนำจะมีค่าแปรผันตรงกับแรงดันไฟฟ้า (V) และแปรผกผันกับความต้านทาน (R) ของตัวนำนั้น
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">แรงดัน: <b className="text-blue-700">{voltage.toFixed(1)} V</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">ความต้านทาน: <b className="text-amber-700">{resistance.toFixed(0)} Ω</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">กระแสไฟฟ้า: <b className="text-emerald-700">{(switchStatus ? current : 0.0).toFixed(3)} A</b></span>
        </div>
      </div>
    </section>
  );
}

export default function OhmsLawSimulation() {

  // Inputs
  const [voltage, setVoltage] = useState(12.0); // V (0V - 24V)
  const [resistance, setResistance] = useState(100.0); // R (10Ω - 500Ω)
  const [switchStatus, setSwitchStatus] = useState(true); // Circuit closed (active)

  // Simulation loop states
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<OhmsDataPoint[]>([]);

  // Telemetry Current
  const [current, setCurrent] = useState(0.12);

  // Quest Tracker
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  // Refs for tracking mutable states inside intervals
  const voltageRef = useRef(voltage);
  const resistanceRef = useRef(resistance);
  const switchStatusRef = useRef(switchStatus);
  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { voltageRef.current = voltage; }, [voltage]);
  useEffect(() => { resistanceRef.current = resistance; }, [resistance]);
  useEffect(() => { switchStatusRef.current = switchStatus; }, [switchStatus]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Handle immediate current update on adjustments
  const updateCurrentValue = (v: number, r: number, closed: boolean) => {
    if (!closed) {
      setCurrent(0.0);
      return;
    }
    const rawI = v / r;
    const noise = (Math.random() - 0.5) * 0.003;
    const finalI = Math.max(0.0, rawI + noise);
    setCurrent(Math.round(finalI * 1000) / 1000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateCurrentValue(voltage, resistance, switchStatus);
    }, 0);
    return () => clearTimeout(timer);
  }, [voltage, resistance, switchStatus]);

  // Main simulation ticking loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning) {
      timer = setInterval(() => {
        const delta = 0.1;
        const nextTime = elapsedSecondsRef.current + delta;
        setElapsedSeconds(nextTime);
        elapsedSecondsRef.current = nextTime;

        // Calculate active current value with noise
        const closed = switchStatusRef.current;
        const v = voltageRef.current;
        const r = resistanceRef.current;
        let activeI = 0.0;

        if (closed) {
          const rawI = v / r;
          const noise = (Math.random() - 0.5) * 0.003;
          activeI = Math.max(0.0, rawI + noise);
        }

        setCurrent(Math.round(activeI * 1000) / 1000);

        // Quest checking: Maintain current between 0.1A and 0.2A for 20 seconds
        if (closed && activeI >= 0.1 && activeI <= 0.2) {
          const nextProg = Math.min(20, questProgressRef.current + delta);
          setQuestProgress(nextProg);
          questProgressRef.current = nextProg;

          if (nextProg >= 20 && !questSuccessRef.current) {
            setQuestSuccess(true);
            questSuccessRef.current = true;
          }
        } else {
          setQuestProgress(0);
          questProgressRef.current = 0;
        }
      }, 100);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  // Actions
  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setVoltage(12.0);
    setResistance(100.0);
    setSwitchStatus(true);
    setQuestProgress(0);
    setDataPoints([]);
  };

  const handleClearPoint = (idx: number) => {
    setDataPoints((prev) => prev.filter((p) => p.index !== idx).map((p, i) => ({ ...p, index: i + 1 })));
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    const headers = "จุดวัด,แรงดันไฟฟ้า (V),ความต้านทาน (Ohm),กระแสไฟฟ้า (A)\n";
    const rows = dataPoints.map((p) => `${p.index},${p.voltage.toFixed(2)},${p.resistance.toFixed(1)},${p.current.toFixed(3)}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scisiam_ohms_log.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyData = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการคัดลอก!");
      return;
    }
    const content = dataPoints
      .map((p) => `จุดที่ ${p.index} | แรงดัน: ${p.voltage.toFixed(1)}V | ความต้านทาน: ${p.resistance.toFixed(0)}Ω | กระแส: ${p.current.toFixed(3)}A`)
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"));
  };

  const handleSaveResults = async () => {
    const currentPoint: OhmsDataPoint = {
      index: dataPoints.length + 1,
      voltage,
      resistance,
      current: switchStatus ? current : 0,
    };
    const pointsToSave = [...dataPoints, currentPoint].slice(-20);
    setDataPoints(pointsToSave);

    const experimentData = {
      labId: "ohms-law",
      timestamp: new Date().toLocaleString("th-TH"),
      voltage: Math.max(...pointsToSave.map((p) => p.voltage)),
      resistance: pointsToSave[0].resistance,
      dataPoints: pointsToSave,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_ohms_experiment",
      localPayload: experimentData,
      labId: "ohms-law",
      title: "Ohm's Law & DC Circuits",
      variables: { voltage, resistance, switchStatus },
      liveValues: { current, elapsedSeconds, questProgress, questSuccess },
      graphPoints: pointsToSave,
      tableRows: pointsToSave,
      summary: {
        maxVoltage: experimentData.voltage,
        resistance: experimentData.resistance,
        dataPointCount: pointsToSave.length,
      },
      score: questSuccess ? 100 : Math.min(100, pointsToSave.length * 20),
      durationSeconds: Math.round(elapsedSeconds),
    });

    alert("บันทึกข้อมูลการทดลอง (กราฟกระแสไฟฟ้าและตารางผล) สำเร็จ! 🎉");
  };

  const bandColors = getResistorColors(resistance);
  const flowActive = switchStatus && current > 0;
  const flowColor = flowActive ? "#22d3ee" : "#475569";
  const timeLabel = `${Math.floor(elapsedSeconds / 60).toString().padStart(2, "0")}:${Math.floor(elapsedSeconds % 60).toString().padStart(2, "0")}`;

  const scene = (
    <div className="relative flex h-full min-h-[258px] items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eefcff_48%,#fff7fb_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/75 px-3 py-2 text-left shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-blue-600">circuit status</p>
        <p className="mt-0.5 text-xs font-bold text-slate-600">
          {flowActive ? "Flow Active" : "Open Circuit"}
        </p>
      </div>

      <svg className="relative z-10 w-full max-w-[280px] h-48" viewBox="0 0 300 160">
        {/* Wires */}
        <path d="M 40 60 L 40 40 L 110 40" stroke="#475569" strokeWidth="2.5" fill="none" />
        <path d="M 190 40 L 260 40 L 260 65" stroke="#475569" strokeWidth="2.5" fill="none" />
        <path d="M 260 105 L 260 130 L 180 130" stroke="#475569" strokeWidth="2.5" fill="none" />
        <path d="M 120 130 L 40 130 L 40 110" stroke="#475569" strokeWidth="2.5" fill="none" />

        {/* Flowing electrons */}
        {flowActive && (
          <>
            <circle cx="60" cy="40" r="3.5" fill="#22d3ee" className="animate-pulse" />
            <circle cx="90" cy="40" r="3.5" fill="#22d3ee" className="animate-pulse" />
            <circle cx="260" cy="50" r="3.5" fill="#22d3ee" className="animate-pulse" />
            <circle cx="260" cy="120" r="3.5" fill="#22d3ee" className="animate-pulse" />
            <circle cx="215" cy="130" r="3.5" fill="#22d3ee" className="animate-pulse" />
            <circle cx="85" cy="130" r="3.5" fill="#22d3ee" className="animate-pulse" />
            <circle cx="40" cy="50" r="3.5" fill="#22d3ee" className="animate-pulse" />
            <circle cx="40" cy="120" r="3.5" fill="#22d3ee" className="animate-pulse" />
          </>
        )}

        {/* Directional current indicators */}
        <path d="M 75 37 L 80 40 L 75 43" stroke={flowColor} strokeWidth="1.5" fill="none" />
        <path d="M 257 52 L 260 57 L 263 52" stroke={flowColor} strokeWidth="1.5" fill="none" />
        <path d="M 85 127 L 80 130 L 85 133" stroke={flowColor} strokeWidth="1.5" fill="none" />
        <path d="M 37 53 L 40 48 L 43 53" stroke={flowColor} strokeWidth="1.5" fill="none" />

        {/* DC Power Supply */}
        <rect x="15" y="60" width="50" height="50" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
        <circle cx="30" cy="98" r="4.5" fill="#f43f5e" />
        <circle cx="50" cy="98" r="4.5" fill="#0f172a" stroke="#475569" strokeWidth="1" />
        <text x="40" y="78" fill="#60a5fa" fontSize="9" fontWeight="900" textAnchor="middle">{voltage.toFixed(1)}V</text>
        <text x="40" y="88" fill="#64748b" fontSize="6.5" fontWeight="bold" textAnchor="middle">DC Source</text>

        {/* Resistor */}
        <rect x="110" y="30" width="80" height="20" rx="5" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
        <line x1="90" y1="40" x2="110" y2="40" stroke="#475569" strokeWidth="2.5" />
        <line x1="190" y1="40" x2="210" y2="40" stroke="#475569" strokeWidth="2.5" />
        {/* Color Bands */}
        <rect x="122" y="30.7" width="5.5" height="18.6" fill={bandColors[0]} />
        <rect x="137" y="30.7" width="5.5" height="18.6" fill={bandColors[1]} />
        <rect x="152" y="30.7" width="5.5" height="18.6" fill={bandColors[2]} />
        <rect x="172" y="30.7" width="5.5" height="18.6" fill="#d4af37" />
        <text x="150" y="24" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">{resistance.toFixed(0)} Ω</text>

        {/* Ammeter */}
        <circle cx="260" cy="85" r="20" fill="#1e293b" stroke="#eab308" strokeWidth="1.5" />
        <text x="260" y="80" fill="#eab308" fontSize="12" fontWeight="900" textAnchor="middle">A</text>
        <text x="260" y="96" fill="#eab308" fontSize="9.5" fontWeight="900" textAnchor="middle">{(switchStatus ? current : 0.0).toFixed(3)}A</text>

        {/* Switch */}
        <circle cx="120" cy="130" r="3.5" fill="#94a3b8" />
        <circle cx="180" cy="130" r="3.5" fill="#94a3b8" />
        {switchStatus ? (
          <line x1="120" y1="130" x2="180" y2="130" stroke="#34d399" strokeWidth="4.5" strokeLinecap="round" />
        ) : (
          <line x1="120" y1="130" x2="165" y2="105" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );

  const controls = (
    <div className="space-y-4">
      {/* Switch Status */}
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
        <span className="text-xs font-bold text-slate-600">🔌 สวิตช์ปิด-เปิดวงจร</span>
        <button
          onClick={() => setSwitchStatus(!switchStatus)}
          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold border cursor-pointer active:scale-95 transition-all ${
            switchStatus 
              ? "bg-emerald-500 border-emerald-600 text-white shadow-xs" 
              : "bg-red-500 border-red-600 text-white shadow-xs"
          }`}
        >
          {switchStatus ? "🟢 สับสวิตช์ลง (Closed)" : "🔴 ยกสวิตช์ขึ้น (Open)"}
        </button>
      </div>

      {/* Voltage control */}
      <div className="group bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
          <span className="text-slate-600 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-500" />
            แรงดันไฟฟ้า (Voltage)
          </span>
          <span className="text-blue-600 font-extrabold text-xs bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
            {voltage.toFixed(1)} V
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="24"
          step="0.5"
          value={voltage}
          onChange={(e) => setVoltage(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex items-center gap-1.5 mt-2">
          {[-5, -1, 1, 5].map((val) => (
            <button
              key={val}
              onClick={() => setVoltage((prev) => Math.max(0, Math.min(24, prev + val)))}
              className="flex-1 py-1 text-[10px] font-black text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition active:scale-95"
            >
              {val > 0 ? `+${val}V` : `${val}V`}
            </button>
          ))}
        </div>
      </div>

      {/* Resistance control */}
      <div className="group bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
          <span className="text-slate-600 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-500" />
            ความต้านทาน (Resistance)
          </span>
          <span className="text-amber-600 font-extrabold text-xs bg-amber-50 px-2.5 py-0.5 rounded border border-amber-100">
            {resistance.toFixed(0)} Ω
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={resistance}
          onChange={(e) => setResistance(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex items-center gap-1.5 mt-2">
          {[-50, -10, 10, 50].map((val) => (
            <button
              key={val}
              onClick={() => setResistance((prev) => Math.max(10, Math.min(500, prev + val)))}
              className="flex-1 py-1 text-[10px] font-black text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition active:scale-95"
            >
              {val > 0 ? `+${val}Ω` : `${val}Ω`}
            </button>
          ))}
        </div>
      </div>

    </div>
  );

  return (
    <SharedSimulationShell
      accent="blue"
      labId="ohms-law"
      category="Physics"
      title="Ohm's Law & DC Circuits"
      subtitle="ศึกษาความสัมพันธ์ระหว่างความต่างศักย์ กระแสไฟฟ้า และความต้านทานในวงจรไฟฟ้ากระแสตรงตามกฎของโอห์ม"
      statusLabel={flowActive ? "ต่อวงจรทำงาน" : "วงจรเปิด/ตัดกระแส"}
      icon={Zap}
      sceneTitle="แผนภาพวงจรไฟฟ้าจำลอง"
      scene={scene}
      controlsTitle="แผงควบคุมวงจร"
      controls={controls}
      compactControls={
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          <button type="button" onClick={() => setSwitchStatus((current) => !current)} className={`min-h-11 rounded-xl border px-3 text-xs font-black ${switchStatus ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            สวิตช์: {switchStatus ? "ปิดวงจร" : "เปิดวงจร"}
          </button>
          <label className="rounded-xl bg-slate-50 p-2 text-xs font-black text-slate-700">
            <span className="mb-1 flex justify-between"><span>แรงดัน</span><span>{voltage.toFixed(1)} V</span></span>
            <input aria-label="แรงดันไฟฟ้า" type="range" min="0" max="24" step="0.5" value={voltage} onChange={(event) => setVoltage(Number(event.target.value))} className="w-full accent-blue-500" />
          </label>
          <label className="rounded-xl bg-slate-50 p-2 text-xs font-black text-slate-700">
            <span className="mb-1 flex justify-between"><span>ความต้านทาน</span><span>{resistance.toFixed(0)} Ω</span></span>
            <input aria-label="ความต้านทาน" type="range" min="10" max="500" step="10" value={resistance} onChange={(event) => setResistance(Number(event.target.value))} className="w-full accent-amber-500" />
          </label>
        </div>
      }
      metrics={[
        { label: "แรงดัน", value: `${voltage.toFixed(1)} V`, tone: "blue" },
        { label: "ความต้านทาน", value: `${resistance.toFixed(0)} Ω`, tone: "orange" },
        { label: "กระแสไฟฟ้า", value: `${(switchStatus ? current : 0.0).toFixed(3)} A`, tone: "emerald" },
        { label: "เวลา", value: timeLabel, tone: "cyan" },
      ]}
      graph={
        <OhmsGraph
          dataPoints={dataPoints}
          voltage={voltage}
          current={current}
          switchStatus={switchStatus}
        />
      }
      table={
        <ResultsTable
          dataPoints={dataPoints}
          onClearPoint={handleClearPoint}
          onCopyData={handleCopyData}
          onExportCSV={handleExportCSV}
        />
      }
      theory={
        <TheoryPanel
          voltage={voltage}
          resistance={resistance}
          current={current}
          switchStatus={switchStatus}
        />
      }
      steps={[
        { label: "ตั้งค่าโหลด", icon: Sliders },
        { label: "สับสวิตช์ลง", icon: Play },
        { label: "ปรับแรงดัน", icon: Zap },
        { label: "บันทึกผลการทดลอง", icon: ClipboardList },
        { label: "หาความชัน", icon: Target },
      ]}
      learningGoals={[
        "ศึกษาความสัมพันธ์ของกระแสไฟฟ้ากับแรงดัน",
        "ศึกษาความสัมพันธ์ของกระแสไฟฟ้ากับความต้านทาน",
        "หาความต้านทานไฟฟ้าจากความชันของกราฟ",
        "เรียนรู้กฎของโอห์มและการประยุกต์ใช้งาน",
      ]}
      progressLabel="ระยะเวลาที่กระแสอยู่ในช่วงภารกิจ"
      progressValue={`${questProgress.toFixed(1)} / 20 วินาที`}
      progressPercent={(questProgress / 20) * 100}
      tips={[
        "ค่อย ๆ เพิ่มระดับแรงดันเพื่อดูความแปรผันของกระแสไฟฟ้าเชิงเส้น",
        "ทดลองเปลี่ยนขนาดความต้านทานเพื่อศึกษาผลกระทบต่อความชันกราฟ",
        "ระวังอย่าใช้กระแสไฟฟ้าสูงเกินไปจนเกิดความร้อนสูงในวงจร",
        "จดบันทึกค่าอย่างน้อย 5 จุดเพื่อนำไปพล็อตกราฟหาค่าความชัน",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดชั่วคราว" : "ทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}

// Helpers
const getResistorColors = (r: number) => {
  const val = Math.round(r);
  const str = val.toString();
  let d1 = 0;
  let d2 = 0;
  let multiplier = 0;

  if (str.length === 1) {
    d1 = 0;
    d2 = val;
    multiplier = 0;
  } else if (str.length === 2) {
    d1 = parseInt(str[0]);
    d2 = parseInt(str[1]);
    multiplier = 0;
  } else {
    d1 = parseInt(str[0]);
    d2 = parseInt(str[1]);
    multiplier = str.length - 2;
  }

  const colorsMap = [
    "#000000", // 0: Black
    "#9c4a1b", // 1: Brown
    "#ef4444", // 2: Red
    "#f97316", // 3: Orange
    "#eab308", // 4: Yellow
    "#22c55e", // 5: Green
    "#3b82f6", // 6: Blue
    "#a855f7", // 7: Violet
    "#6b7280", // 8: Grey
    "#ffffff", // 9: White
  ];

  return [
    colorsMap[d1] || "#9c4a1b",
    colorsMap[d2] || "#000000",
    colorsMap[multiplier] || "#9c4a1b",
  ];
};
