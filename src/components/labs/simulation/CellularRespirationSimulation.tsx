"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Compass,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface DataPoint {
  time: number;
  organism: string;
  temp: number;
  mode: string;
  gasVolume: number;
}

export default function CellularRespirationSimulation() {
  const [organism, setOrganism] = useState("Yeast"); // Yeast, Seeds, DrySeeds
  const [temperature, setTemperature] = useState(30); // °C
  const [mode, setMode] = useState("Aerobic"); // Aerobic (O2 consumed), Anaerobic (CO2 produced)
  const [substrate, setSubstrate] = useState("Glucose"); // Glucose, Sucrose, Water
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gasVolume, setGasVolume] = useState(0); // mL displacement
  const [history, setHistory] = useState<DataPoint[]>([]);

  const isRunningRef = useRef(isRunning);
  const elapsedTimeRef = useRef(elapsedTime);
  const gasVolumeRef = useRef(gasVolume);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedTimeRef.current = elapsedTime; }, [elapsedTime]);
  useEffect(() => { gasVolumeRef.current = gasVolume; }, [gasVolume]);

  const organismThai = useMemo(() => {
    if (organism === "Yeast") return "ยีสต์ (Yeast)";
    if (organism === "Seeds") return "เมล็ดถั่วเพาะงอก (Germinating Seeds)";
    return "เมล็ดถั่วแห้ง (Dry Seeds - Control)";
  }, [organism]);

  // Calculate respiration rate (mL/min) based on conditions
  const respirationRate = useMemo(() => {
    if (organism === "DrySeeds") return 0;

    // Base rate
    let base = 0;
    if (organism === "Seeds") {
      base = mode === "Aerobic" ? 0.35 : 0.05; // Seeds respire mostly aerobically
    } else {
      // Yeast
      if (substrate === "Water") {
        base = 0;
      } else {
        const substrateMult = substrate === "Glucose" ? 1.0 : 0.7;
        base = (mode === "Aerobic" ? 0.5 : 0.7) * substrateMult; // Yeast ferments anaerobically very well
      }
    }

    // Temperature multiplier (bell-shaped peaking at 37°C, denaturing at 50°C)
    const temp = temperature;
    let tempMult = 0;
    if (temp <= 37) {
      tempMult = Math.max(0.1, temp / 37);
    } else {
      tempMult = Math.max(0, 1 - (temp - 37) / (50 - 37));
    }

    return Math.round(base * tempMult * 100) / 100;
  }, [organism, mode, substrate, temperature]);

  // Respiration cycle running effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isRunningRef.current) return;

      const newTime = elapsedTimeRef.current + 1;
      setElapsedTime(newTime);

      // Gas volume changes. For seeds/yeast, gas volume increases over time
      const ratePerSec = respirationRate / 60;
      const nextVolume = gasVolumeRef.current + ratePerSec;
      setGasVolume(nextVolume);

      // Log points to history every 5 seconds
      if (newTime % 5 === 0) {
        setHistory((prev) => [
          ...prev,
          {
            time: newTime,
            organism: organismThai,
            temp: temperature,
            mode,
            gasVolume: Math.round(nextVolume * 100) / 100,
          },
        ]);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [respirationRate, organismThai, temperature, mode]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setGasVolume(0);
    setHistory([]);
  };

  const handleSave = async () => {
    if (history.length === 0) {
      alert("กรุณาเริ่มแอนิเมชันสะสมข้อมูลปริมาตรแก๊สก่อนบันทึกผล");
      return;
    }

    const lastPoint = history[history.length - 1];
    const experimentData = {
      labId: "cellular-respiration",
      timestamp: new Date().toLocaleString("th-TH"),
      organism,
      temperature,
      mode,
      substrate,
      elapsedTime,
      finalGasVolume: lastPoint.gasVolume,
      respirationRate,
      dataPoints: history,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_respiration_experiment",
      localPayload: experimentData,
      labId: "cellular-respiration",
      title: "Cellular Respiration Lab",
      variables: { organism, temperature, mode, substrate },
      liveValues: { finalGasVolume: lastPoint.gasVolume, respirationRate },
      graphPoints: history.map((h) => ({ x: h.time, y: h.gasVolume })),
      tableRows: history,
      summary: {
        organism: lastPoint.organism,
        temperature,
        mode,
        finalGasVolume: lastPoint.gasVolume,
      },
      score: 100,
    });
    alert("บันทึกผลการทดลอง Cellular Respiration สำเร็จ");
  };

  return (
    <SharedSimulationShell
      accent="orange"
      labId="cellular-respiration"
      category="Biology"
      title="Cellular Respiration Lab"
      subtitle="ศึกษาและวัดอัตราการหายใจระดับเซลล์ (Cellular Respiration) ทั้งแบบใช้ออกซิเจนและไม่ใช้ออกซิเจนของสิ่งมีชีวิตจำลอง"
      statusLabel={isRunning ? "กำลังหายใจระดับเซลล์" : "พร้อมทดลอง"}
      icon={Activity}
      sceneTitle="ภาพจำลองชุดทดลอง respirometer"
      scene={
        <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-orange-100 bg-[#0f172a] shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-45 pointer-events-none" />

          {/* Render respiration beaker/respirometer setup */}
          <svg className="h-full w-full max-w-[480px] p-4" viewBox="0 0 400 300" fill="none">
            <defs>
              <linearGradient id="dyeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
            </defs>

            {/* Respirometer Vial */}
            <path d="M50 80 H140 V230 C140 245 50 245 50 230 Z" stroke="#94a3b8" strokeWidth="5" fill="#1e293b" opacity="0.4" />
            <rect x="58" y="110" width="74" height="110" rx="8" fill="#334155" opacity="0.6" />

            {/* Organism visualization */}
            {organism === "Seeds" && (
              <g fill="#22c55e" stroke="#15803d" strokeWidth="1">
                {/* Draw seeds inside vial */}
                <ellipse cx="75" cy="180" rx="8" ry="12" transform="rotate(30 75 180)" />
                <ellipse cx="115" cy="190" rx="8" ry="12" transform="rotate(-25 115 190)" />
                <ellipse cx="90" cy="205" rx="8" ry="12" transform="rotate(15 90 205)" />
                {/* Sprouts */}
                <path d="M72 170 Q60 160 62 150" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M118 180 Q130 170 126 160" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M92 195 Q90 180 82 175" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}

            {organism === "DrySeeds" && (
              <g fill="#b45309" stroke="#78350f" strokeWidth="1">
                {/* Draw dry brown seeds */}
                <ellipse cx="75" cy="195" rx="8" ry="11" transform="rotate(40 75 195)" />
                <ellipse cx="110" cy="205" rx="8" ry="11" transform="rotate(-30 110 205)" />
                <ellipse cx="92" cy="210" rx="8" ry="11" transform="rotate(5 92 210)" />
              </g>
            )}

            {organism === "Yeast" && (
              <g fill="#fed7aa" stroke="#f97316" strokeWidth="0.8">
                {/* Yeast solution level */}
                <rect x="58" y="160" width="74" height="60" fill="#ea580c" opacity="0.3" rx="4" />
                {/* Tiny yeast yeast cell dots */}
                <circle cx="75" cy="195" r="4.5" />
                <circle cx="105" cy="190" r="5" />
                <circle cx="85" cy="205" r="4" />
                <circle cx="115" cy="200" r="4.5" />
                <circle cx="95" cy="175" r="3.5" />
                <circle cx="70" cy="180" r="5" />
                {/* Bubbles if respiring */}
                {respirationRate > 0 && isRunning && (
                  <g fill="#ffffff" opacity="0.6">
                    <circle cx="80" cy="170" r="1.5" />
                    <circle cx="100" cy="165" r="2" />
                    <circle cx="90" cy="168" r="1.2" />
                  </g>
                )}
              </g>
            )}

            {/* Aerobic KOH pad (to absorb CO2) */}
            {mode === "Aerobic" && (
              <g>
                <rect x="68" y="90" width="54" height="15" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" rx="2" />
                <text x="95" y="101" fill="#475569" fontSize="8" fontWeight="black" textAnchor="middle">KOH Cotton</text>
              </g>
            )}

            {/* Stopper and capillary tubing */}
            <rect x="85" y="70" width="20" height="13" fill="#64748b" rx="2" />
            {/* Tube lines extending out */}
            <path d="M95 72 V50 H240" stroke="#cbd5e1" strokeWidth="4.5" strokeLinecap="round" fill="none" />

            {/* Measuring Capillary Tube / Syringe */}
            {mode === "Aerobic" ? (
              <g>
                {/* Capillary tube with graduation lines */}
                <rect x="240" y="47" width="130" height="6" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
                {/* Graduation marks */}
                {Array.from({ length: 7 }).map((_, idx) => (
                  <line key={idx} x1={250 + idx * 18} y1="43" x2={250 + idx * 18} y2="47" stroke="#cbd5e1" strokeWidth="1.2" />
                ))}
                {/* Red dye bubble moving due to pressure drop */}
                {/* Move from right (250 + 100) to left (250) based on gas volume */}
                {(() => {
                  const maxVol = 10;
                  const startX = 350;
                  const endX = 250;
                  const currentX = startX - Math.min(1.0, gasVolume / maxVol) * (startX - endX);
                  return (
                    <rect x={currentX} y="45" width="12" height="10" fill="url(#dyeGrad)" rx="2" stroke="#b91c1c" strokeWidth="1" transform="translate(0, -2)" />
                  );
                })()}
                <text x="300" y="32" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">ท่อวัดการดูดออกซิเจน (O₂)</text>
              </g>
            ) : (
              <g>
                {/* Syringe barrel */}
                <rect x="240" y="38" width="80" height="24" fill="#64748b" fillOpacity="0.2" stroke="#94a3b8" strokeWidth="2.5" rx="2" />
                {/* Plunger expanding outwards based on gas volume */}
                {(() => {
                  const maxVol = 15;
                  const travel = 40;
                  const currentX = 240 + Math.min(1.0, gasVolume / maxVol) * travel;
                  return (
                    <g>
                      {/* Syringe plunger stem */}
                      <rect x={currentX} y="46" width="60" height="8" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
                      {/* Plunger rubber head */}
                      <rect x={currentX - 5} y="40" width="10" height="20" fill="#334155" />
                    </g>
                  );
                })()}
                <text x="280" y="28" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">กระบอกดักแก๊ส CO₂</text>
              </g>
            )}
          </svg>

          {/* Current mode indicator */}
          <div className="absolute right-5 bottom-5 rounded-xl bg-slate-900/90 border border-slate-700/60 px-3.5 py-1.5 text-right font-bold text-xs text-white">
            <span className="text-[10px] text-slate-400 block font-black">สภาวะทดลอง</span>
            {mode === "Aerobic" ? "ใช้ออกซิเจน (Aerobic)" : "ไม่ใช้ออกซิเจน (Anaerobic)"}
          </div>
        </div>
      }
      controlsTitle="ควบคุมสภาวะสิ่งมีชีวิตหายใจ"
      controls={
        <div className="space-y-4 font-sans">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-600">เลือกสิ่งมีชีวิตตัวอย่าง</span>
            <select
              value={organism}
              onChange={(e) => setOrganism(e.target.value)}
              disabled={isRunning || gasVolume > 0}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-45"
            >
              <option value="Yeast">ยีสต์สกัดในน้ำเชื่อม (Yeast + Substrate)</option>
              <option value="Seeds">เมล็ดถั่วเพาะงอก (Germinating Seeds)</option>
              <option value="DrySeeds">เมล็ดถั่วแห้ง (Dry Seeds - Control)</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold text-slate-600">การหายใจระดับเซลล์</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                disabled={isRunning || gasVolume > 0}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 disabled:opacity-45"
              >
                <option value="Aerobic">ใช้ออกซิเจน (O₂)</option>
                <option value="Anaerobic">ไม่ใช้ออกซิเจน (CO₂)</option>
              </select>
            </label>

            {organism === "Yeast" && (
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold text-slate-600">แหล่งพลังงาน (Sugar)</span>
                <select
                  value={substrate}
                  onChange={(e) => setSubstrate(e.target.value)}
                  disabled={isRunning || gasVolume > 0}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 disabled:opacity-45"
                >
                  <option value="Glucose">น้ำตาลกลูโคส (Glucose)</option>
                  <option value="Sucrose">น้ำตาลทราย (Sucrose)</option>
                  <option value="Water">น้ำเปล่า (Water - Control)</option>
                </select>
              </label>
            )}
          </div>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>อุณหภูมิห้องทดลอง (Temperature)</span>
              <span className="rounded-md bg-orange-50 px-2 py-0.5 font-black text-orange-700">{temperature}°C</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={temperature}
              disabled={isRunning}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-orange-500 disabled:opacity-45"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>เวลาการทดลองสะสม</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono font-black text-slate-800">{elapsedTime}s</span>
            </div>
          </label>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleStartStop}
              className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${
                isRunning ? "bg-slate-700" : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
              {isRunning ? "หยุดวัด" : "เริ่มหายใจ"}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label="รีเซ็ต"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
      metrics={[
        { label: "ตัวอย่าง", value: organismThai.split(" (")[0], tone: "orange" },
        { label: "ปริมาตรแก๊สสะสม", value: `${gasVolume.toFixed(2)} mL`, tone: "emerald" },
        { label: "อัตราเฉลี่ย", value: `${respirationRate} mL/min`, tone: "cyan" },
        { label: "อุณหภูมิ", value: `${temperature}°C`, tone: "violet" },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <BarChart3 className="h-4.5 w-4.5 text-orange-500" />
              การปริมาตรแก๊สสะสม
            </h3>
            <span className="text-[10px] font-bold text-orange-500 select-none">gas evolution</span>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-4 rounded-xl bg-slate-50/70 p-4 text-xs font-semibold text-slate-500">
            <div className="flex justify-between items-center text-slate-700 font-bold">
              <span>ปริมาตรแก๊สสะสมปัจจุบัน:</span>
              <span>{gasVolume.toFixed(2)} mL</span>
            </div>
            <div className="h-6 overflow-hidden rounded-full bg-white relative">
              <div
                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-orange-400 to-orange-600"
                style={{ width: `${Math.min(100, (gasVolume / 15) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-bold leading-normal text-slate-400">
              * กราฟจะแสดงความชันเชิงเส้นของปริมาตรแก๊สที่เคลื่อนที่เทียบกับเวลา อัตราความเร็วจะสะท้อนความสามารถในการสร้างพลังงานชีวภาพ
            </p>
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <ClipboardList className="h-4.5 w-4.5 text-orange-500" />
              ตารางบันทึกแก๊ส
            </h3>
            <span className="text-[10px] font-bold text-slate-400 select-none">{history.length} จุดข้อมูล</span>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-100 max-h-[190px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-orange-50/70 text-[11px] font-black text-orange-800 sticky top-0">
                <tr>
                  <th className="px-2 py-2">เวลา</th>
                  <th className="px-2 py-2">สิ่งมีชีวิต</th>
                  <th className="px-2 py-2">อุณหภูมิ</th>
                  <th className="px-2 py-2">ปริมาตร (mL)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                {history.slice(-6).map((point, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-2 font-mono">{point.time}s</td>
                    <td className="px-2 py-2 font-mono text-[10px] truncate max-w-[80px]">{point.organism.split(" ")[0]}</td>
                    <td className="px-2 py-2 font-mono">{point.temp}°C</td>
                    <td className="px-2 py-2 font-mono text-orange-700">{point.gasVolume.toFixed(2)} mL</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      }
      theory={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800 leading-normal">
            <Compass className="h-4.5 w-4.5 text-orange-500" />
            ทฤษฎีการสลายสารอาหาร
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3 text-xs font-semibold leading-relaxed text-slate-500">
            <p>
              **Aerobic Respiration** การสลายน้ำตาลโดยใช้ออกซิเจน จะดึงแก๊ส O₂ เข้าไป สารละลาย KOH จะทำหน้าที่จับแก๊ส CO₂ ที่คายออกมา ทำให้ความดันในหลอดลดลง ดึงหยดสีนำทางเข้าหาหลอดทดลอง
            </p>
            <p>
              **Anaerobic Fermentation** ในยีสต์ จะย่อยแป้งและน้ำตาลโดยไม่ใช้ออกซิเจน ได้เป็นแอลกอฮอล์และแก๊ส CO₂ ทำให้เกิดแรงดันไปดันกระบอกสูบให้พุ่งขยายออกมาภายนอก
            </p>
          </div>
        </section>
      }
      steps={[
        { label: "เลือกเซลล์ตัวอย่าง", icon: Activity },
        { label: "ตั้งค่ากรดหรือพลังงาน", icon: Play },
        { label: "รันจำลองการดักแก๊ส", icon: Activity },
        { label: "วาดกราฟความชัน", icon: BarChart3 },
        { label: "บันทึกผลแล็บวิจัย", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "อธิบายความแตกต่างระหว่างการหายใจแบบใช้ออกซิเจนและกระบวนการหมัก",
        "วิเคราะห์บทบาทของด่าง KOH ในการจับแก๊ส CO₂ เพื่อสังเกตการใช้ O₂",
        "เปรียบเทียบความเร็วในการเกิดปฏิกิริยาย่อยน้ำตาลชนิดต่างๆ ของยีสต์",
        "ศึกษาขีดจำกัดอุณหภูมิสูงสุดที่เอนไซม์หายใจเซลล์จะเสียสภาพ",
      ]}
      progressLabel="ปริมาตรแก๊สหายใจสะสม"
      progressValue={`${gasVolume.toFixed(2)} mL`}
      progressPercent={Math.min(100, (gasVolume / 15) * 100)}
      tips={[
        "ทดลองใช้ยีสต์ผสมกับกลูโคส ในสภาวะ Anaerobic เพื่อจำลองการทำไวน์หรือขนมปัง",
        "เมล็ดพืชแห้งจะไม่เกิดปฏิกิริยาหายใจ เนื่องจากเอนไซม์และเซลล์อยู่ในสภาพพักตัว (Dormant)",
        " KOH มีบทบาทสำคัญมากในโหมดใช้ออกซิเจน หากไม่มีกระดาษซับนี้ ปริมาตรหยดสีจะไม่ขยับเนื่องจากประจุ O2 และ CO2 คายเท่ากัน",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}
