"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FlaskConical,
  Gauge,
  MoveHorizontal,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sliders,
  Target,
  Thermometer,
} from "lucide-react";

interface BoylePoint {
  volume: number;
  pressure: number;
  pv: number;
}

const GAS_CONSTANT = 8.314;

const calculatePressure = (gasMoles: number, temperatureC: number, volumeMl: number) => {
  const volumeL = Math.max(0.001, volumeMl / 1000);
  const kelvin = temperatureC + 273.15;
  return (gasMoles * GAS_CONSTANT * kelvin) / volumeL;
};

const buildBoylePreview = (gasMoles: number, temperatureC: number) =>
  Array.from({ length: 28 }, (_, index) => {
    const volume = 250 + (index / 27) * 550;
    const pressure = calculatePressure(gasMoles, temperatureC, volume);
    return {
      volume,
      pressure,
      pv: pressure * (volume / 1000),
    };
  });

function GasChamberScene({
  volume,
  pressure,
  isRunning,
}: {
  volume: number;
  pressure: number;
  isRunning: boolean;
}) {
  const pistonX = 235 - ((volume - 250) / 550) * 112;
  const gasWidth = Math.max(56, pistonX - 72);
  const gaugeAngle = Math.min(62, Math.max(-50, -42 + ((pressure - 70) / 180) * 104));

  return (
    <div className="relative flex h-full min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-cyan-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eefcff_48%,#f8fafc_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-left shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-cyan-600">isothermal system</p>
        <p className="mt-0.5 text-xs font-bold text-slate-600">PV remains nearly constant</p>
      </div>

      <svg className="relative z-10 h-full max-h-[360px] w-full max-w-[560px]" viewBox="0 0 560 360" fill="none" aria-hidden="true">
        <ellipse cx="278" cy="298" rx="190" ry="22" fill="#dbeafe" opacity="0.55" />

        {/* Syringe body */}
        <g transform="translate(72, 142)">
          <rect x="0" y="0" width="290" height="86" rx="31" fill="#ffffff" stroke="#38bdf8" strokeWidth="5" />
          <rect x="15" y="12" width={gasWidth} height="62" rx="25" fill="#bfdbfe" opacity="0.72" />
          <path d="M44 3V83M84 3V83M124 3V83M164 3V83M204 3V83M244 3V83" stroke="#bae6fd" strokeWidth="2" />
          <rect x={pistonX} y="13" width="34" height="60" rx="13" fill="#64748b" />
          <path d={`M${pistonX + 34} 43H382`} stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
          <path d="M450 16V70" stroke="#64748b" strokeWidth="9" strokeLinecap="round" />
          <path d="M-2 43H-32" stroke="#0891b2" strokeWidth="7" strokeLinecap="round" />
        </g>

        {/* Molecules */}
        <g className={isRunning ? "animate-pulse" : ""}>
          {[
            [114, 175, "#22c55e"],
            [147, 205, "#60a5fa"],
            [185, 171, "#a78bfa"],
            [221, 207, "#f59e0b"],
            [258, 180, "#06b6d4"],
          ].map(([cx, cy, fill], index) => (
            <circle key={index} cx={cx as number} cy={cy as number} r="5" fill={fill as string} opacity={pistonX > (cx as number) - 72 ? 0.95 : 0.18} />
          ))}
        </g>

        {/* Pressure gauge */}
        <g transform="translate(354, 52)">
          <circle cx="60" cy="60" r="50" fill="#ffffff" stroke="#cbd5e1" strokeWidth="5" />
          <path d="M28 79C34 49 50 34 80 34" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
          <g transform={`rotate(${gaugeAngle} 60 60)`}>
            <path d="M60 60L91 44" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
          </g>
          <circle cx="60" cy="60" r="7" fill="#ef4444" />
          <text x="60" y="91" fill="#0891b2" fontSize="14" fontWeight="900" textAnchor="middle">kPa</text>
        </g>

        <g transform="translate(83, 68)">
          <rect x="0" y="0" width="92" height="52" rx="18" fill="#ffffff" stroke="#bae6fd" strokeWidth="3" />
          <text x="46" y="21" fill="#64748b" fontSize="10" fontWeight="900" textAnchor="middle">VOLUME</text>
          <text x="46" y="39" fill="#2563eb" fontSize="18" fontWeight="900" textAnchor="middle">{volume.toFixed(0)} ml</text>
        </g>
      </svg>
    </div>
  );
}

function BoyleGraph({ points }: { points: BoylePoint[] }) {
  const x = React.useCallback((volume: number) => 32 + ((volume - 250) / 550) * 252, []);
  const y = React.useCallback((pressure: number) => 138 - ((pressure - 55) / 185) * 112, []);

  const path = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((point, index) => `${index === 0 ? "M" : "L"}${x(point.volume)},${y(point.pressure)}`).join(" ");
  }, [points, x, y]);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <BarChart3 className="h-4.5 w-4.5 text-cyan-600" />
          กราฟความดันกับปริมาตร
        </h3>
        <span className="text-[10px] font-bold text-cyan-600">P-V curve</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-50/70 p-2">
        <svg className="h-full min-h-[174px] w-full" viewBox="0 0 320 170" fill="none" aria-hidden="true">
          <line x1="32" y1="138" x2="284" y2="138" stroke="#cbd5e1" strokeWidth="1.4" />
          <line x1="32" y1="110" x2="284" y2="110" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="82" x2="284" y2="82" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="54" x2="284" y2="54" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="26" x2="284" y2="26" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="22" x2="32" y2="138" stroke="#cbd5e1" strokeWidth="1.4" />
          <text x="26" y="29" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">240</text>
          <text x="26" y="85" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">150</text>
          <text x="26" y="141" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">55</text>
          <path d={path} stroke="#06b6d4" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          {points.slice(-1).map((point) => (
            <circle key={`${point.volume}-${point.pressure}`} cx={x(point.volume)} cy={y(point.pressure)} r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          ))}
          <text x="32" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">250</text>
          <text x="158" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">525</text>
          <text x="284" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">800 ml</text>
        </svg>
      </div>
    </section>
  );
}

export default function BoylesLawSimulation() {
  const [gasMoles, setGasMoles] = useState(0.02);
  const [temperature, setTemperature] = useState(25);
  const [volume, setVolume] = useState(500);
  const [pistonSpeed, setPistonSpeed] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<BoylePoint[]>([]);
  const [lastLoggedVolume, setLastLoggedVolume] = useState(volume);

  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const volumeRef = useRef(volume);
  const lastLoggedVolumeRef = useRef(lastLoggedVolume);
  const gasMolesRef = useRef(gasMoles);
  const temperatureRef = useRef(temperature);
  const pistonSpeedRef = useRef(pistonSpeed);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { lastLoggedVolumeRef.current = lastLoggedVolume; }, [lastLoggedVolume]);
  useEffect(() => { gasMolesRef.current = gasMoles; }, [gasMoles]);
  useEffect(() => { temperatureRef.current = temperature; }, [temperature]);
  useEffect(() => { pistonSpeedRef.current = pistonSpeed; }, [pistonSpeed]);

  const pressure = useMemo(() => calculatePressure(gasMoles, temperature, volume), [gasMoles, temperature, volume]);
  const pvValue = pressure * (volume / 1000);
  const previewPoints = useMemo(() => buildBoylePreview(gasMoles, temperature), [gasMoles, temperature]);
  const displayPoints = dataPoints.length > 0 ? dataPoints : previewPoints;
  const progress = Math.min(100, ((800 - volume) / 550) * 100);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      const deltaSeconds = 0.12;
      const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
      const nextVolume = Math.max(250, volumeRef.current - pistonSpeedRef.current * 18 * deltaSeconds);
      const nextPressure = calculatePressure(gasMolesRef.current, temperatureRef.current, nextVolume);

      elapsedSecondsRef.current = nextSeconds;
      volumeRef.current = nextVolume;
      setElapsedSeconds(nextSeconds);
      setVolume(nextVolume);

      if (Math.abs(nextVolume - lastLoggedVolumeRef.current) >= 25 || nextVolume <= 250) {
        const point = {
          volume: nextVolume,
          pressure: nextPressure,
          pv: nextPressure * (nextVolume / 1000),
        };
        setDataPoints((previous) => [...previous, point]);
        setLastLoggedVolume(nextVolume);
        lastLoggedVolumeRef.current = nextVolume;
      }

      if (nextVolume <= 250) {
        setIsRunning(false);
        isRunningRef.current = false;
      }
    }, 120);

    return () => clearInterval(timer);
  }, [isRunning]);

  const makePoint = (nextVolume: number) => {
    const nextPressure = calculatePressure(gasMoles, temperature, nextVolume);
    return {
      volume: nextVolume,
      pressure: nextPressure,
      pv: nextPressure * (nextVolume / 1000),
    };
  };

  const handleStartStop = () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    isRunningRef.current = nextRunning;

    if (nextRunning && dataPoints.length === 0) {
      const point = makePoint(volume);
      setDataPoints([point]);
      setLastLoggedVolume(volume);
      lastLoggedVolumeRef.current = volume;
    }
  };

  const handleCompress = () => {
    const nextVolume = Math.max(250, volume - 25);
    setVolume(nextVolume);
    volumeRef.current = nextVolume;
    const point = makePoint(nextVolume);
    setDataPoints((previous) => [...previous, point]);
    setLastLoggedVolume(nextVolume);
    lastLoggedVolumeRef.current = nextVolume;
  };

  const handleReset = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setElapsedSeconds(0);
    elapsedSecondsRef.current = 0;
    setVolume(500);
    volumeRef.current = 500;
    setDataPoints([]);
    setLastLoggedVolume(500);
    lastLoggedVolumeRef.current = 500;
  };

  const handleSave = async () => {
    if (dataPoints.length === 0) {
      alert("ยังไม่มีข้อมูลกฎของบอยล์สำหรับบันทึก กรุณาเริ่มจำลองหรือกดอัดแก๊สก่อน");
      return;
    }

    const experimentData = {
      labId: "boyles-law",
      timestamp: new Date().toLocaleString("th-TH"),
      gasMoles,
      temperature,
      dataPoints,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_boyle_experiment",
      localPayload: experimentData,
      labId: "boyles-law",
      title: "Boyle's Gas Law Lab",
      variables: { gasMoles, temperature, pistonSpeed },
      liveValues: { volume, pressure, pvValue, progress },
      graphPoints: dataPoints,
      tableRows: dataPoints,
      summary: {
        finalVolume: volume,
        finalPressure: pressure,
        pvValue,
        dataPointCount: dataPoints.length,
      },
      score: Math.round(Math.min(100, Math.max(0, progress))),
      durationSeconds: Math.round(elapsedSeconds),
    });
    alert("บันทึกผลการทดลองกฎของบอยล์สำเร็จ");
  };

  const visibleRows = displayPoints.slice(-7);
  const timeLabel = `${Math.floor(elapsedSeconds / 60).toString().padStart(2, "0")}:${Math.floor(elapsedSeconds % 60).toString().padStart(2, "0")}`;

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8fafc] pb-12">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-12 md:px-20">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <section className="space-y-5 lg:col-span-9">
              <div className="relative flex min-h-[164px] items-center overflow-hidden rounded-2xl border border-cyan-100 bg-white px-5 py-6 shadow-sm shadow-slate-200/50 sm:px-7">
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-600 text-white">
                      <Gauge className="h-4.5 w-4.5" />
                    </div>
                    <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-700">Chemistry</span>
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">ระบบแก๊สพร้อมทดลอง</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-normal text-slate-900">Boyle&apos;s Gas Law Lab Simulator</h1>
                  <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
                    จำลองการอัดและขยายแก๊สในกระบอกปิด อ่านค่าเกจความดัน และตรวจสอบความสัมพันธ์ P-V เมื่ออุณหภูมิคงที่
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-7">
                  <div className="min-h-[460px] rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm shadow-slate-200/50">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-sm font-black text-slate-800">
                        <FlaskConical className="h-4.5 w-4.5 text-cyan-600" />
                        ห้องทดลองแก๊สจำลอง
                      </h2>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">{isRunning ? "กำลังอัดแก๊ส" : "พร้อมทดลอง"}</span>
                    </div>
                    <GasChamberScene volume={volume} pressure={pressure} isRunning={isRunning} />
                  </div>
                </div>

                <div className="xl:col-span-5">
                  <section className="flex min-h-[460px] flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/50">
                    <h2 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
                      <Sliders className="h-4.5 w-4.5 text-cyan-600" />
                      แผงควบคุมระบบแก๊ส
                    </h2>
                    <div className="flex-1 space-y-4">
                      {[
                        { label: "ปริมาตรแก๊ส (V)", value: volume, set: setVolume, min: 250, max: 800, step: 10, suffix: "ml", color: "accent-blue-500", disabled: isRunning },
                        { label: "ปริมาณแก๊ส (n)", value: gasMoles, set: setGasMoles, min: 0.012, max: 0.03, step: 0.001, suffix: "mol", color: "accent-emerald-500", disabled: isRunning || dataPoints.length > 0 },
                        { label: "อุณหภูมิคงที่", value: temperature, set: setTemperature, min: 20, max: 40, step: 1, suffix: "°C", color: "accent-rose-500", disabled: isRunning || dataPoints.length > 0 },
                      ].map((control) => (
                        <label key={control.label} className="block">
                          <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                            <span>{control.label}</span>
                            <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">
                              {control.value.toFixed(control.step < 1 ? 3 : 0)} {control.suffix}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={control.min}
                            max={control.max}
                            step={control.step}
                            value={control.value}
                            disabled={control.disabled}
                            onChange={(event) => control.set(Number(event.target.value))}
                            className={`h-1.5 w-full rounded-full bg-slate-100 ${control.color} disabled:opacity-45`}
                          />
                        </label>
                      ))}

                      <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-bold text-slate-400">ความเร็วลูกสูบ</span>
                          <div className="relative">
                            <select
                              value={pistonSpeed}
                              onChange={(event) => setPistonSpeed(Number(event.target.value))}
                              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                            >
                              <option value={0.6}>ช้า</option>
                              <option value={1}>ปานกลาง</option>
                              <option value={1.6}>เร็ว</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          </div>
                        </label>
                        <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 px-3 py-2">
                          <span className="block text-[11px] font-bold text-cyan-600">ความดันปัจจุบัน</span>
                          <strong className="text-sm font-black text-slate-800">{pressure.toFixed(1)} kPa</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                        <span className="rounded-lg bg-slate-50 px-2 py-1.5">PV: <b className="text-cyan-700">{pvValue.toFixed(2)}</b></span>
                        <span className="rounded-lg bg-slate-50 px-2 py-1.5">เวลา: <b className="text-slate-800">{timeLabel}</b></span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${isRunning ? "bg-slate-700" : "bg-cyan-600 hover:bg-cyan-700"}`}>
                        {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
                        {isRunning ? "หยุดชั่วคราว" : "เริ่มอัดแก๊ส"}
                      </button>
                      <button onClick={handleCompress} className="inline-flex items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-xs font-black text-cyan-700 hover:bg-cyan-100">-25 ml</button>
                      <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="รีเซ็ต">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button onClick={handleSave} className="col-span-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-700">
                        <Save className="h-4 w-4" />
                        บันทึกผลกฎของบอยล์
                      </button>
                    </div>
                  </section>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <BoyleGraph points={displayPoints} />
                </div>

                <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 xl:col-span-4">
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                      <ClipboardList className="h-4.5 w-4.5 text-cyan-600" />
                      ตารางบันทึกผล
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">{displayPoints.length} จุด</span>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-cyan-50/60 text-[11px] font-black text-cyan-800">
                        <tr>
                          <th className="px-3 py-2">V (ml)</th>
                          <th className="px-3 py-2">P (kPa)</th>
                          <th className="px-3 py-2">PV</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                        {visibleRows.map((point, index) => (
                          <tr key={`${point.volume}-${index}`}>
                            <td className="px-3 py-2 font-mono">{point.volume.toFixed(0)}</td>
                            <td className="px-3 py-2 font-mono text-cyan-700">{point.pressure.toFixed(1)}</td>
                            <td className="px-3 py-2 font-mono text-slate-500">{point.pv.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 xl:col-span-4">
                  <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
                    <Thermometer className="h-4.5 w-4.5 text-cyan-600" />
                    ทฤษฎีและสมการ
                  </h3>
                  <div className="flex flex-1 flex-col justify-between gap-3">
                    <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 text-center font-mono text-2xl font-black text-slate-800">
                      P<sub>1</sub>V<sub>1</sub> = P<sub>2</sub>V<sub>2</sub>
                    </div>
                    <p className="text-xs font-semibold leading-relaxed text-slate-500">
                      เมื่ออุณหภูมิและจำนวนโมลคงที่ ผลคูณระหว่างความดันกับปริมาตรจะใกล้เคียงค่าคงที่ ดังนั้นการลดปริมาตรทำให้ความดันเพิ่มขึ้นแบบผกผัน
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">V: <b className="text-blue-700">{volume.toFixed(0)} ml</b></span>
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">P: <b className="text-cyan-700">{pressure.toFixed(1)} kPa</b></span>
                    </div>
                  </div>
                </section>
              </div>

              <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["เตรียมระบบปิด", FlaskConical],
                  ["ตั้งปริมาตร", Sliders],
                  ["อัดลูกสูบ", MoveHorizontal],
                  ["อ่านเกจ", Gauge],
                  ["สรุปกราฟ", CheckCircle2],
                ].map(([label, Icon], index) => {
                  const StepIcon = Icon as typeof FlaskConical;
                  return (
                    <div key={label as string} className="flex items-center gap-3 rounded-xl bg-slate-50/70 px-3 py-2">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                        <StepIcon className="h-5 w-5" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">{index + 1}</span>
                      </div>
                      <span className="text-xs font-black leading-relaxed text-slate-700">{label as string}</span>
                    </div>
                  );
                })}
              </section>
            </section>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-3">
              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <Target className="h-4.5 w-4.5 text-blue-600" />
                  เป้าหมายการเรียนรู้
                </h2>
                <ul className="space-y-2.5 text-xs font-semibold leading-relaxed text-slate-500">
                  {["เข้าใจความสัมพันธ์ผกผัน P-V", "อ่านค่าเกจความดันและปริมาตร", "ตรวจสอบค่า PV ที่ใกล้คงที่", "ตีความกราฟกฎของบอยล์"].map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                  <Gauge className="h-4.5 w-4.5 text-emerald-600" />
                  ความคืบหน้า
                </h2>
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full text-sm font-black text-slate-800" style={{ background: `conic-gradient(#10b981 ${Math.min(100, progress)}%, #e2e8f0 0)` }}>
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-white">{progress.toFixed(0)}%</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500">อัดปริมาตรแล้ว</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{volume.toFixed(0)} ml</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  คำแนะนำในการทดลอง
                </h2>
                <ul className="space-y-2 text-xs font-semibold leading-relaxed text-slate-500">
                  {["ตรวจว่าระบบแก๊สปิดสนิทก่อนเริ่ม", "ปรับลูกสูบทีละช่วงและรอค่าเกจนิ่ง", "รักษาอุณหภูมิให้คงที่ตลอดการทดลอง", "เปรียบเทียบค่า PV ของแต่ละจุดข้อมูล"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
