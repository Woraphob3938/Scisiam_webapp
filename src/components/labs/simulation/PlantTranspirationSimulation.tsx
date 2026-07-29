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
  Sun,
  Wind,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface DataPoint {
  time: number;
  wind: number;
  humidity: number;
  light: number;
  waterVolume: number;
}

export default function PlantTranspirationSimulation() {
  const [windSpeed, setWindSpeed] = useState(2); // m/s (0-10)
  const [humidity, setHumidity] = useState(50); // % (10-90)
  const [lightIntensity, setLightIntensity] = useState(60); // % (0-100)
  const [temperature, setTemperature] = useState(25); // °C (15-45)
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [waterVolume, setWaterVolume] = useState(0); // mL water absorbed
  const [history, setHistory] = useState<DataPoint[]>([]);

  const isRunningRef = useRef(isRunning);
  const elapsedTimeRef = useRef(elapsedTime);
  const waterVolumeRef = useRef(waterVolume);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedTimeRef.current = elapsedTime; }, [elapsedTime]);
  useEffect(() => { waterVolumeRef.current = waterVolume; }, [waterVolume]);

  // Calculate transpiration rate (mL/hour) based on environment
  // Rate = (TempFactor * LightFactor * WindFactor) / HumidityFactor
  const transpirationRate = useMemo(() => {
    // 1. Temp factor: evaporative pressure increases with temperature
    const tempFactor = 0.5 + (temperature - 15) / 30; // 0.5 at 15°C to 1.5 at 45°C

    // 2. Light factor: stomata open in light. Stomata completely closed at 0% light (small leakage)
    const lightFactor = lightIntensity === 0 ? 0.15 : 0.5 + (lightIntensity / 100) * 0.8; // 0.15 to 1.3

    // 3. Wind factor: wind removes humid boundary layer.
    const windFactor = 1.0 + (windSpeed / 10) * 1.2; // 1.0 at 0m/s to 2.2 at 10m/s

    // 4. Humidity factor: high humidity decreases concentration gradient of water vapor
    const humidityFactor = 2.0 - (humidity / 100) * 1.5; // 1.85 at 10% humidity to 0.65 at 90% humidity (inverse multiplier)

    const rate = (tempFactor * lightFactor * windFactor) * humidityFactor;
    return Math.round(rate * 100) / 100;
  }, [temperature, lightIntensity, windSpeed, humidity]);

  // Transpiration loop running effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isRunningRef.current) return;

      const newTime = elapsedTimeRef.current + 1;
      setElapsedTime(newTime);

      // Transpiration rate is in mL/hour. Convert to mL/sec for simulation
      const ratePerSec = transpirationRate / 3600;
      const nextVolume = waterVolumeRef.current + ratePerSec * 400; // Speed up by 400x for interactive experience
      setWaterVolume(nextVolume);

      // Log points every 2 seconds
      if (newTime % 2 === 0) {
        setHistory((prev) => [
          ...prev,
          {
            time: newTime,
            wind: windSpeed,
            humidity,
            light: lightIntensity,
            waterVolume: Math.round(nextVolume * 100) / 100,
          },
        ]);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [transpirationRate, windSpeed, humidity, lightIntensity]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setWaterVolume(0);
    setHistory([]);
  };

  const handleSave = async () => {
    if (history.length === 0) {
      alert("กรุณาเริ่มจำลองการดูดซึมน้ำของพืชก่อนบันทึกผล");
      return;
    }

    const lastPoint = history[history.length - 1];
    const experimentData = {
      labId: "plant-transpiration",
      timestamp: new Date().toLocaleString("th-TH"),
      windSpeed,
      humidity,
      lightIntensity,
      temperature,
      elapsedTime,
      finalWaterVolume: lastPoint.waterVolume,
      transpirationRate,
      dataPoints: history,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_transpiration_experiment",
      localPayload: experimentData,
      labId: "plant-transpiration",
      title: "Plant Transpiration Potometer",
      variables: { windSpeed, humidity, lightIntensity, temperature },
      liveValues: { finalWaterVolume: lastPoint.waterVolume, transpirationRate },
      graphPoints: history.map((h) => ({ x: h.time, y: h.waterVolume })),
      tableRows: history,
      summary: {
        windSpeed,
        humidity,
        lightIntensity,
        finalWaterVolume: lastPoint.waterVolume,
      },
      score: 100,
    });
  };

  const stomataStateText = useMemo(() => {
    if (lightIntensity === 0) return "ปิด (Closed)";
    if (lightIntensity < 40) return "เปิดบางส่วน (Partially Open)";
    return "เปิดกว้าง (Fully Open)";
  }, [lightIntensity]);

  return (
    <SharedSimulationShell
      accent="cyan"
      labId="plant-transpiration"
      category="Biology"
      title="Plant Transpiration Potometer"
      subtitle="วัดและเปรียบเทียบอัตราการคายน้ำของยอดพืชด้วยเครื่องมือโพโทมิเตอร์ (Potometer) ภายใต้ตัวแปรความชื้น ลม แสง และอุณหภูมิ"
      statusLabel={isRunning ? "กำลังคายน้ำ" : "พร้อมทดลอง"}
      icon={Activity}
      sceneTitle="ภาพจำลองอุปกรณ์พืชในเครื่องโพโทมิเตอร์"
      scene={
        <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-cyan-100 bg-[#0f172a] shadow-inner">
          {/* Environment visual layers (Sun, Wind overlay) */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-45 pointer-events-none" />

          {/* Light intensity glow */}
          <div
            className="absolute right-5 top-5 h-20 w-20 rounded-full bg-yellow-400 blur-3xl transition-opacity duration-300 pointer-events-none"
            style={{ opacity: lightIntensity / 120 }}
          />

          <svg className="h-full w-full max-w-[480px] p-4" viewBox="0 0 400 300" fill="none">
            <defs>
              <linearGradient id="potometerWaterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Light Bulb / Sun Icon */}
            {lightIntensity > 0 && (
              <g transform="translate(340, 20)" opacity={lightIntensity / 100}>
                <circle cx="20" cy="20" r="14" fill="#fef08a" stroke="#facc15" strokeWidth="2" />
                <path d="M20 2v4M20 34v4M2 20h4M34 20h4" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}

            {/* Fan Icon (representing wind speed) */}
            {windSpeed > 0 && (
              <g transform="translate(20, 100)">
                <circle cx="20" cy="20" r="18" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 4" className={isRunning ? "animate-spin" : ""} style={{ animationDuration: `${12 / windSpeed}s` }} />
                <path d="M20 10 V30 M10 20 H30" stroke="#cbd5e1" strokeWidth="3" className={isRunning ? "animate-spin" : ""} style={{ animationDuration: `${12 / windSpeed}s` }} />
              </g>
            )}

            {/* Plant shoot and reservoir vial */}
            <path d="M120 70 L140 100 V180 C140 190 120 190 120 180 Z" stroke="#64748b" strokeWidth="4.5" fill="#1e293b" />
            <rect x="123" y="100" width="14" height="60" fill="url(#potometerWaterGrad)" />

            {/* Leafy shoot */}
            <path d="M130 90 V20" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
            <path d="M130 60 Q100 50 105 35 Q120 40 130 60" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <path d="M130 45 Q160 35 155 20 Q140 25 130 45" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <path d="M130 30 Q105 10 115 2 Q125 10 130 30" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <path d="M130 75 Q165 70 160 55 Q145 60 130 75" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />

            {/* Evaporation lines (Droplets evaporating) */}
            {isRunning && transpirationRate > 0 && Array.from({ length: Math.round(transpirationRate * 2) }).map((_, idx) => {
              const dx = 80 + (idx * 63) % 120;
              const dy = 10 + (idx * 31) % 50;
              return (
                <circle key={idx} cx={dx} cy={dy} r="2.2" fill="#38bdf8" opacity="0.65" className="animate-bounce" />
              );
            })}

            {/* Capillary tube extending below reservoir */}
            <path d="M130 160 V185 H330" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <path d="M130 160 V185 H330" stroke="url(#potometerWaterGrad)" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* Air Bubble indicator */}
            {/* Starts at right (320) and crawls left (150) based on waterVolume */}
            {(() => {
              const maxTravel = 8;
              const startX = 320;
              const endX = 150;
              const currentX = startX - Math.min(1.0, waterVolume / maxTravel) * (startX - endX);
              return (
                <ellipse cx={currentX} cy="185" rx="6" ry="2.2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
              );
            })()}

            {/* Ruler behind capillary tube */}
            <g transform="translate(150, 195)">
              <rect x="0" y="0" width="170" height="14" fill="#334155" stroke="#475569" strokeWidth="1.5" rx="2" />
              {Array.from({ length: 18 }).map((_, idx) => (
                <line key={idx} x1={idx * 10} y1="0" x2={idx * 10} y2={idx % 5 === 0 ? "8" : "4"} stroke="#cbd5e1" strokeWidth="1.2" />
              ))}
            </g>
          </svg>

          {/* Stomata state badge inside viewport */}
          <div className="absolute right-5 bottom-5 rounded-xl bg-slate-900/90 border border-slate-700/60 px-3.5 py-1.5 text-right font-bold text-xs text-white">
            <span className="text-[10px] text-slate-400 block font-black">ปากใบพืชปัจจุบัน</span>
            {stomataStateText}
          </div>
        </div>
      }
      controlsTitle="แผงควบคุมสภาวะสิ่งแวดล้อม"
      controls={
        <div className="space-y-4 font-sans">
          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-yellow-500" />ความเข้มของแสง</span>
              <span className="rounded-md bg-cyan-50 px-2 py-0.5 font-black text-cyan-700">{lightIntensity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={lightIntensity}
              disabled={isRunning}
              onChange={(e) => setLightIntensity(Number(e.target.value))}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-cyan-500 disabled:opacity-45"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-blue-400" />ความเร็วลม</span>
              <span className="rounded-md bg-cyan-50 px-2 py-0.5 font-black text-cyan-700">{windSpeed} m/s</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={windSpeed}
              disabled={isRunning}
              onChange={(e) => setWindSpeed(Number(e.target.value))}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-cyan-500 disabled:opacity-45"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold text-slate-600">ความชื้นสัมพัทธ์</span>
              <select
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                disabled={isRunning}
                className="w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-700 disabled:opacity-45"
              >
                <option value="20">20% (แห้งแล้ง)</option>
                <option value="50">50% (ปานกลาง)</option>
                <option value="80">80% (ชื้นจัด)</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-bold text-slate-600">อุณหภูมิอากาศ</span>
              <select
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                disabled={isRunning}
                className="w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-700 disabled:opacity-45"
              >
                <option value="20">20°C (อากาศเย็น)</option>
                <option value="30">30°C (ปกติ)</option>
                <option value="40">40°C (ร้อนจัด)</option>
              </select>
            </label>
          </div>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>เวลาจำลองสะสม</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono font-black text-slate-800">{elapsedTime}s</span>
            </div>
          </label>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleStartStop}
              className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${
                isRunning ? "bg-slate-700" : "bg-cyan-600 hover:bg-cyan-700"
              }`}
            >
              {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
              {isRunning ? "หยุดวัด" : "เริ่มคายน้ำ"}
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
        { label: "อัตราคายน้ำ", value: `${transpirationRate.toFixed(2)} mL/hr`, tone: "cyan" },
        { label: "ปริมาณน้ำที่ดูดซึม", value: `${waterVolume.toFixed(3)} mL`, tone: "blue" },
        { label: "ปากใบพืช", value: stomataStateText.split(" (")[0], tone: "emerald" },
        { label: "ความชื้นอากาศ", value: `${humidity}%`, tone: "violet" },
      ]}
      graph={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <BarChart3 className="h-4.5 w-4.5 text-cyan-600" />
              การดูดซึมน้ำรวม
            </h3>
            <span className="text-[10px] font-bold text-cyan-600 select-none">water uptake</span>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-4 rounded-xl bg-slate-50/70 p-4 text-xs font-semibold text-slate-500">
            <div className="flex justify-between items-center text-slate-700 font-bold">
              <span>ปริมาตรดูดน้ำสะสม:</span>
              <span>{waterVolume.toFixed(3)} mL</span>
            </div>
            <div className="h-6 overflow-hidden rounded-full bg-white relative">
              <div
                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-cyan-400 to-cyan-600"
                style={{ width: `${Math.min(100, (waterVolume / 8) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-bold leading-normal text-slate-400">
              * ฟองอากาศในเครื่องโพโทมิเตอร์จะขยับเข้าหาลำต้นพืชเพื่อชดเชยน้ำที่ระเหยออกจากปากใบพืช
            </p>
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <ClipboardList className="h-4.5 w-4.5 text-cyan-600" />
              ตารางบันทึกโพโทมิเตอร์
            </h3>
            <span className="text-[10px] font-bold text-slate-400 select-none">{history.length} จุดข้อมูล</span>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-100 max-h-[190px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-cyan-50/70 text-[11px] font-black text-cyan-800 sticky top-0">
                <tr>
                  <th className="px-2 py-2">เวลา</th>
                  <th className="px-2 py-2">ลม (m/s)</th>
                  <th className="px-2 py-2">ชื้น (%)</th>
                  <th className="px-2 py-2">น้ำ (mL)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                {history.slice(-6).map((point, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-2 font-mono">{point.time}s</td>
                    <td className="px-2 py-2 font-mono">{point.wind} m/s</td>
                    <td className="px-2 py-2 font-mono">{point.humidity}%</td>
                    <td className="px-2 py-2 font-mono text-cyan-700">{point.waterVolume.toFixed(3)} mL</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      }
      theory={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800 leading-normal">
            <Compass className="h-4.5 w-4.5 text-cyan-600" />
            ทฤษฎีการดึงคายน้ำของพืช
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3 text-xs font-semibold leading-relaxed text-slate-500">
            <p>
              **Transpiration Pull** แรงดึงจากการคายน้ำ คือการที่โมเลกุลของน้ำเคลื่อนที่เชื่อมต่อกัน (Cohesion) ดึงกันเป็นสายขึ้นสู่ใบพืชเพื่อชดเชยน้ำที่ระเหยไป
            </p>
            <p>
              **Stomata (ปากใบ)** สภาพแวดล้อมที่ร้อน แห้ง และมีลมพัด จะส่งผลให้ความเข้มข้นของไอน้ำปากใบมีน้ำระเหยออกมากขึ้นอย่างรวดเร็ว
            </p>
          </div>
        </section>
      }
      steps={[
        { label: "เลือกสภาวะสิ่งแวดล้อม", icon: Wind },
        { label: "เริ่มเดินฟองอากาศ", icon: Play },
        { label: "วิเคราะห์ระยะทางโพโทมิเตอร์", icon: Activity },
        { label: "คำนวณอัตราความเร็วคายน้ำ", icon: BarChart3 },
        { label: "กดบันทึกผลการทดสอบ", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "อธิบายกลไกการเปิด-ปิดของปากใบพืชตามระดับความเข้มของแสงแดด",
        "ศึกษาผลกระทบของแรงลม (Wind) ต่อการพัดพาไอน้ำบริเวณผิวใบ",
        "ทำความเข้าใจผลกระทบของความชื้นสัมบูรณ์ในอากาศต่อแรงแพร่น้ำ",
        "ใช้ระบบโพโทมิเตอร์ในการประมาณอัตราเร็วการสังเคราะห์น้ำพืช",
      ]}
      progressLabel="ระดับการเคลื่อนที่ของฟองอากาศ"
      progressValue={`${(Math.min(1.0, waterVolume / 8) * 100).toFixed(0)}%`}
      progressPercent={Math.min(100, (waterVolume / 8) * 100)}
      tips={[
        "ตั้งค่าความชื้นสัมบูรณ์ไว้ที่ 20% (แห้งแล้ง) และความเร็วลม 10 m/s เพื่อสังเกตสภาวะการระเหยสูงสุด",
        "หากปิดไฟสนิท (0% Light Intensity) ปากใบจะปิดสนิท ทำให้อัตราการระเหยลดลงเหลือเพียงขีดการระเหยตามธรรมชาติ",
        "อุณหภูมิอากาศที่สูงขึ้นจะเพิ่มพลังงานจลน์ให้กับโมเลกุลน้ำ ทำให้การคายน้ำเพิ่มขีดจำกัดตามลำดับ",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}

