"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/labs/Breadcrumb";
import BottomCallout from "@/components/BottomCallout";
import DecorativeBackground from "@/components/labs/DecorativeBackground";
import { Sparkles, ArrowRight, Play, Pause, RefreshCw, Zap, Sliders, CheckCircle, Plus, Trash, Download, Clipboard } from "lucide-react";

export interface OhmsDataPoint {
  index: number;
  voltage: number;
  resistance: number;
  current: number;
}

export default function OhmsLawSimulation() {
  const router = useRouter();

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
    // Add minor sensor fluctuation
    const noise = (Math.random() - 0.5) * 0.003;
    const finalI = Math.max(0.0, rawI + noise);
    setCurrent(Math.round(finalI * 1000) / 1000);
  };

  useEffect(() => {
    // Derived readout is intentionally synchronized when circuit controls change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateCurrentValue(voltage, resistance, switchStatus);
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

            const currentPoints = Number(localStorage.getItem("scisiam_points") || "120");
            localStorage.setItem("scisiam_points", String(currentPoints + 25));
            window.dispatchEvent(new Event("points-updated"));
            alert("🎉 ยินดีด้วย! คุณรักษากระแสไฟฟ้าให้อยู่ระหว่าง 0.1A - 0.2A ต่อเนื่องเป็นเวลา 20 วินาทีสำเร็จ! รับ +25 แต้ม 💎");
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

  const handleAddPoint = () => {
    // Add operating point to logs
    setDataPoints((prev) => [
      ...prev,
      {
        index: prev.length + 1,
        voltage,
        resistance,
        current: switchStatus ? current : 0.0,
      },
    ]);
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

  const handleSaveResults = () => {
    if (dataPoints.length === 0) {
      alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล! กรุณากดเริ่มทดลองและเก็บบันทึกข้อมูลก่อน");
      return;
    }

    const experimentData = {
      labId: "ohms-law",
      timestamp: new Date().toLocaleString("th-TH"),
      voltage: Math.max(...dataPoints.map((p) => p.voltage)),
      resistance: dataPoints[0].resistance,
      dataPoints,
    };

    localStorage.setItem("scisiam_saved_ohms_experiment", JSON.stringify(experimentData));

    // Award completion points
    const currentPoints = Number(localStorage.getItem("scisiam_points") || "120");
    localStorage.setItem("scisiam_points", String(currentPoints + 25));
    window.dispatchEvent(new Event("points-updated"));

    alert("บันทึกข้อมูลการทดลอง (กราฟกระแสไฟฟ้าและตารางผล) สำเร็จ! 🎉");
    router.push(`/labs/ohms-law`);
  };

  // SVG resistor color band calculator
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

  const bandColors = getResistorColors(resistance);
  const flowActive = switchStatus && current > 0;
  const flowColor = flowActive ? "#22d3ee" : "#475569";

  // Coordinates translation for the live plot (Current Y vs Voltage X)
  const xCoord = (v: number) => 30 + (v / 24) * 150;
  const yCoord = (i: number) => 100 - (i / 2.5) * 85;

  const currentLinePath = useMemo(() => {
    if (dataPoints.length === 0) return "";
    // Sort points by voltage to draw line
    const sorted = [...dataPoints].sort((a, b) => a.voltage - b.voltage);
    return sorted.map((p, idx) => `${idx === 0 ? "M" : "L"}${xCoord(p.voltage)},${yCoord(p.current)}`).join(" ");
  }, [dataPoints]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-16 overflow-hidden">
      <DecorativeBackground />
      <Navbar />

      {/* Breadcrumb */}
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 md:px-20 pt-6 pb-2 select-none">
        <Breadcrumb category="Physics" title="Ohm's Law & DC Circuits / ห้องทดลองจำลอง" />
      </div>

      {/* Hero Header */}
      <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-12 md:px-20 pt-3 select-none relative z-10">
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100/50">
                PHYSICS SIMULATOR
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="text-xs font-bold text-slate-400">ACTIVE ROOM</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-wide mt-2">
              ห้องปฏิบัติการจำลองวงจรไฟฟ้ากระแสตรง (DC Circuits)
            </h1>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 shrink-0 self-start md:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-600 leading-normal">
              สถานะ: ระบบจำลองแบบ Interactive พร้อมทำงาน
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-12 md:px-20 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Area (75%) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Viewport and controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Circuit Viewport */}
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-5 flex flex-col justify-between relative overflow-hidden min-h-[300px] shadow-lg shadow-slate-950/20 select-none">
                <div className="flex justify-between items-center z-10">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                    <span className={`w-2 h-2 rounded-full ${flowActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                    <span className="text-[10px] font-extrabold text-slate-300 uppercase">
                      {flowActive ? "Circuit Active" : "Circuit Inactive"}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 tracking-wider">HUD CONSOLE v1.0</span>
                </div>

                <div className="flex-1 flex items-center justify-center py-4">
                  <svg className="w-full max-w-[280px] h-48" viewBox="0 0 300 160">
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
                    <rect x="172" y="30.7" width="5.5" height="18.6" fill="#d4af37" /> {/* Gold Tolerance */}
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
                    <text x="150" y="148" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle">
                      {switchStatus ? "สวิตช์ปิด (วงจรทำงาน)" : "สวิตช์เปิด (ตัดวงจร)"}
                    </text>
                  </svg>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold border-t border-slate-900 pt-3">
                  <span>RUN TIME: {elapsedSeconds.toFixed(1)}s</span>
                  <span className="text-cyan-400">AMPS: {(switchStatus ? current : 0.0).toFixed(3)} A</span>
                </div>
              </div>

              {/* Control Panel */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-5 flex flex-col justify-between gap-5 shadow-xs">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 select-none">
                    <Sliders className="w-5 h-5 text-indigo-500" />
                    แผงควบคุมวงจรจำลอง (DC Controls)
                  </h3>

                  {/* Inputs Stack */}
                  <div className="space-y-4 mt-4">
                    {/* Switch Toggle */}
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-2xl select-none">
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
                </div>

                {/* Primary Actions */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleStartStop}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs ${
                        isRunning 
                          ? "bg-amber-500 text-white border border-amber-600 shadow-amber-500/10" 
                          : "bg-indigo-600 text-white border border-indigo-700 shadow-indigo-500/10"
                      }`}
                    >
                      {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isRunning ? "พักการจำลอง (Pause)" : "เริ่มการจำลอง (Start)"}</span>
                    </button>

                    <button
                      onClick={handleAddPoint}
                      className="py-2.5 px-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold hover:bg-emerald-100 transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>บันทึกจุดวัด</span>
                    </button>
                  </div>

                  <button
                    onClick={handleReset}
                    className="w-full py-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>รีเซ็ตค่าเครื่องมือ (Reset)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Table & Live Graph */}
            <div className="flex flex-col gap-6">
              
              {/* Log Data Table */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 select-none">
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-800">
                      ตารางบันทึกผลการทดลอง
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      จุดวัดพารามิเตอร์ V, R และกระแสไฟฟ้า I เพื่อใช้พล็อตกราฟหาค่าความต้านทาน
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyData}
                      className="p-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer active:scale-95 flex items-center gap-1.5"
                      title="คัดลอกตาราง"
                    >
                      <Clipboard className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="p-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer active:scale-95 flex items-center gap-1.5"
                      title="ส่งออก CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto select-text">
                  <table className="w-full text-left border-collapse min-w-[400px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold text-[10px] sm:text-xs">
                        <th className="py-2.5 px-4 w-16">จุดวัด</th>
                        <th className="py-2.5 px-4">แรงดันไฟฟ้า (Voltage, V)</th>
                        <th className="py-2.5 px-4">ความต้านทาน (Resistance, R)</th>
                        <th className="py-2.5 px-4">กระแสไฟฟ้า (Current, I)</th>
                        <th className="py-2.5 px-4 w-12 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] sm:text-xs font-bold text-slate-600">
                      {dataPoints.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 select-none">
                            ไม่มีข้อมูลผลการทดลองที่บันทึกไว้ในตาราง
                          </td>
                        </tr>
                      ) : (
                        dataPoints.map((p) => (
                          <tr key={p.index} className="hover:bg-slate-50/50 transition">
                            <td className="py-2 px-4 font-mono">#{p.index}</td>
                            <td className="py-2 px-4 font-mono text-blue-600">{p.voltage.toFixed(1)} V</td>
                            <td className="py-2 px-4 font-mono text-amber-600">{p.resistance.toFixed(0)} Ω</td>
                            <td className="py-2 px-4 font-mono text-emerald-600">{p.current.toFixed(3)} A</td>
                            <td className="py-2 px-4 text-center">
                              <button
                                onClick={() => handleClearPoint(p.index)}
                                className="text-red-500 hover:text-red-700 cursor-pointer p-1 rounded hover:bg-red-50"
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
              </div>

              {/* Live Scatter Graph */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs">
                <div className="border-b border-slate-100 pb-3 mb-4 select-none">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800">
                    กราฟผลการทดลองตามกฎของโอห์ม (V-I Curve)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    กราฟแสดงกระแสไฟฟ้า (I) ในหน่วยแอมแปร์ บนแกน Y เทียบกับแรงดันไฟฟ้า (V) บนแกน X
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl flex flex-col justify-between select-none relative overflow-hidden">
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold border-b border-slate-900 pb-1.5 mb-2">
                    <span>LIVE RELATION SCATTER GRAPH</span>
                    <span className="text-emerald-400">กฎของโอห์ม: I = V / R</span>
                  </div>

                  <svg className="w-full h-48" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                      <path d={currentLinePath} stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
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
                        className="animate-ping"
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
                    <text x="195" y="108" fill="#94a3b8" fontSize="6" fontWeight="bold">แรงดัน (V)</text>
                  </svg>
                </div>
              </div>

              {/* Theory formula card */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs select-none text-left">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                  สูตรความสัมพันธ์ทางฟิสิกส์ (Physical Formula)
                </h3>
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">สมการตามกฎของโอห์ม</span>
                    <div className="text-2xl font-mono font-bold text-slate-800">I = V / R</div>
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-semibold space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-indigo-600">V</span>
                      <span>= แรงดันไฟฟ้าตกคร่อมตัวต้านทาน (V)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-emerald-600">I</span>
                      <span>= กระแสไฟฟ้าที่วัดได้ในวงจร (A)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-amber-600">R</span>
                      <span>= ความต้านทานไฟฟ้าของโหลด (Ω)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Area (25%) */}
          <div className="lg:col-span-3 select-none">
            <div className="bg-white rounded-3xl border border-slate-200/60 p-5 space-y-5">
              
              {/* Quest Section */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 rounded-bl-full" />
                <h3 className="text-xs sm:text-sm font-extrabold text-indigo-950 flex items-center gap-2 border-b border-indigo-100/60 pb-2 mb-3">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  ภารกิจจำลอง
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed leading-1.4 text-left">
                  ปรับค่าควบคุมแรงดันและความต้านทานเพื่อให้กระแสไฟฟ้าคงอยู่ที่ **0.1 A ถึง 0.2 A** ต่อเนื่องเป็นเวลา 20 วินาที
                </p>

                {/* Progress bar */}
                <div className="space-y-2 mt-4">
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${(questProgress / 20) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400">PROGRESS</span>
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {questProgress.toFixed(1)} / 20.0 วินาที
                    </span>
                  </div>
                </div>

                {questSuccess && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-bold p-2.5 rounded-xl text-center">
                    🎉 ภารกิจสำเร็จแล้ว! คุณได้รับ +25 คะแนน
                  </div>
                )}
              </div>

              {/* Lab Guideline tips */}
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 mb-3 text-left">คำแนะนำข้อเสนอแนะ</h3>
                <ul className="space-y-2.5 text-left text-[11px] sm:text-xs text-slate-400 font-semibold leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <span>ค่อย ๆ เพิ่มระดับแรงดันเพื่อดูความแปรผันของกระแสไฟฟ้าเชิงเส้น</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <span>ทดลองเปลี่ยนขนาดความต้านทานเพื่อศึกษาการเปลี่ยนความชัน (Slope) ของเส้นโค้งกราฟความสัมพันธ์</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <span>เพื่อหลีกเลี่ยงกระแสที่สูงเกินจนเกิดลัดวงจร ไม่ควรป้อนแรงดันสูงสุดที่ความต้านทานต่ำสุด</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
