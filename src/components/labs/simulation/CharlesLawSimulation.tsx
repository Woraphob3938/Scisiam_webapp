"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Flame,
  FlaskConical,
  Gauge,
  Home,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  Target,
  Thermometer,
  Waves,
} from "lucide-react";

interface CharlesPoint {
  temperatureC: number;
  kelvin: number;
  volume: number;
  ratio: number;
}

const GAS_CONSTANT = 8.314;
const CONSTANT_PRESSURE_KPA = 101.3;

const calculateVolume = (gasMoles: number, temperatureC: number) => {
  const kelvin = temperatureC + 273.15;
  return ((gasMoles * GAS_CONSTANT * kelvin) / CONSTANT_PRESSURE_KPA) * 1000;
};

const buildCharlesPreview = (gasMoles: number) =>
  Array.from({ length: 28 }, (_, index) => {
    const temperatureC = (index / 27) * 90;
    const kelvin = temperatureC + 273.15;
    const volume = calculateVolume(gasMoles, temperatureC);

    return {
      temperatureC,
      kelvin,
      volume,
      ratio: volume / kelvin,
    };
  });

function GasBathScene({
  temperatureC,
  targetTemperature,
  volume,
  isRunning,
}: {
  temperatureC: number;
  targetTemperature: number;
  volume: number;
  isRunning: boolean;
}) {
  const volumeScale = Math.min(1, Math.max(0, (volume - 445) / 170));
  const gasHeight = 86 + volumeScale * 82;
  const gasY = 252 - gasHeight;
  const thermometerLevel = 188 - Math.min(1, Math.max(0, temperatureC / 100)) * 104;
  const heatOpacity = Math.min(0.9, Math.max(0.25, temperatureC / 100));

  return (
    <div className="relative flex h-full min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ecfeff_52%,#f8fafc_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 text-left shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-orange-600">constant pressure</p>
        <p className="mt-0.5 text-xs font-bold text-slate-600">V/T stays nearly constant</p>
      </div>

      <svg className="relative z-10 h-full max-h-[365px] w-full max-w-[580px]" viewBox="0 0 580 365" fill="none" aria-hidden="true">
        <ellipse cx="294" cy="311" rx="188" ry="23" fill="#fed7aa" opacity="0.42" />

        {/* Water bath */}
        <g transform="translate(128, 76)">
          <path d="M48 22H272L250 248H70L48 22Z" fill="#ffffff" opacity="0.84" stroke="#38bdf8" strokeWidth="5" />
          <path d="M70 118C104 105 137 129 171 116C206 104 232 108 254 120L242 237H79L70 118Z" fill="#7dd3fc" opacity="0.55" />
          <path d="M69 119C104 105 138 129 172 116C207 104 233 108 254 120" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
          <path className={isRunning ? "animate-pulse" : ""} d="M96 143C110 136 124 150 138 143M178 151C192 144 206 158 220 151" stroke="#ecfeff" strokeWidth="4" strokeLinecap="round" opacity="0.88" />
        </g>

        {/* Gas cylinder */}
        <g transform="translate(245, 86)">
          <rect x="0" y="0" width="86" height="184" rx="30" fill="#f8fafc" stroke="#64748b" strokeWidth="5" />
          <rect x="12" y={gasY - 86} width="62" height={gasHeight} rx="24" fill="#fdba74" opacity="0.72" />
          <path d="M14 36H72M14 68H65M14 100H72M14 132H65" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="8" y={gasY - 94} width="70" height="16" rx="8" fill="#334155" />
          <path d={`M43 ${gasY - 94}V-18`} stroke="#334155" strokeWidth="7" strokeLinecap="round" />
          <path d="M21 -18H65" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
          <text x="43" y="205" fill="#ea580c" fontSize="12" fontWeight="900" textAnchor="middle">GAS</text>
        </g>

        {/* Thermometer */}
        <g transform="translate(370, 68)">
          <rect x="20" y="0" width="20" height="166" rx="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="30" cy="176" r="21" fill="#ef4444" stroke="#cbd5e1" strokeWidth="4" />
          <rect x="26" y={thermometerLevel} width="8" height={176 - thermometerLevel} rx="4" fill="#ef4444" />
          <circle cx="30" cy="176" r="15" fill="#ef4444" />
          <path d="M42 24H52M42 50H48M42 76H52M42 102H48M42 128H52" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Heater */}
        <g transform="translate(205, 294)" opacity={heatOpacity}>
          <rect x="0" y="0" width="164" height="20" rx="9" fill="#475569" />
          <path className={isRunning ? "animate-pulse" : ""} d="M35 -12C27 -22 43 -26 35 -38M71 -12C63 -22 79 -26 71 -38M107 -12C99 -22 115 -26 107 -38" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* Molecules */}
        <g className={isRunning ? "animate-pulse" : ""}>
          <circle cx="271" cy="183" r="5" fill="#22c55e" />
          <circle cx="303" cy="206" r="4" fill="#60a5fa" />
          <circle cx="286" cy="232" r="5" fill="#a78bfa" />
          <circle cx="314" cy="162" r="4" fill="#f59e0b" />
        </g>

        <g transform="translate(72, 84)">
          <rect x="0" y="0" width="104" height="55" rx="18" fill="#ffffff" stroke="#fed7aa" strokeWidth="3" />
          <text x="52" y="22" fill="#64748b" fontSize="10" fontWeight="900" textAnchor="middle">TARGET</text>
          <text x="52" y="42" fill="#ea580c" fontSize="19" fontWeight="900" textAnchor="middle">{targetTemperature.toFixed(0)}°C</text>
        </g>

        <g transform="translate(78, 158)">
          <rect x="0" y="0" width="104" height="55" rx="18" fill="#ffffff" stroke="#bae6fd" strokeWidth="3" />
          <text x="52" y="22" fill="#64748b" fontSize="10" fontWeight="900" textAnchor="middle">VOLUME</text>
          <text x="52" y="42" fill="#0891b2" fontSize="18" fontWeight="900" textAnchor="middle">{volume.toFixed(0)} ml</text>
        </g>
      </svg>
    </div>
  );
}

function CharlesGraph({ points }: { points: CharlesPoint[] }) {
  const x = React.useCallback((temperatureC: number) => 32 + (temperatureC / 90) * 252, []);
  const y = React.useCallback((volume: number) => 138 - ((volume - 430) / 230) * 112, []);

  const path = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((point, index) => `${index === 0 ? "M" : "L"}${x(point.temperatureC)},${y(point.volume)}`).join(" ");
  }, [points, x, y]);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <BarChart3 className="h-4.5 w-4.5 text-orange-600" />
          กราฟปริมาตรกับอุณหภูมิ
        </h3>
        <span className="text-[10px] font-bold text-orange-600">V-T line</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-50/70 p-2">
        <svg className="h-full min-h-[174px] w-full" viewBox="0 0 320 170" fill="none" aria-hidden="true">
          <line x1="32" y1="138" x2="284" y2="138" stroke="#cbd5e1" strokeWidth="1.4" />
          <line x1="32" y1="110" x2="284" y2="110" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="82" x2="284" y2="82" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="54" x2="284" y2="54" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="26" x2="284" y2="26" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="22" x2="32" y2="138" stroke="#cbd5e1" strokeWidth="1.4" />
          <text x="26" y="29" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">660</text>
          <text x="26" y="85" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">545</text>
          <text x="26" y="141" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">430</text>
          <path d={path} stroke="#f97316" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          {points.slice(-1).map((point) => (
            <circle key={`${point.temperatureC}-${point.volume}`} cx={x(point.temperatureC)} cy={y(point.volume)} r="4.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
          ))}
          <text x="32" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">0°C</text>
          <text x="158" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">45°C</text>
          <text x="284" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">90°C</text>
        </svg>
      </div>
    </section>
  );
}

export default function CharlesLawSimulation() {
  const [gasMoles, setGasMoles] = useState(0.02);
  const [temperatureC, setTemperatureC] = useState(25);
  const [targetTemperature, setTargetTemperature] = useState(75);
  const [heatingRate, setHeatingRate] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<CharlesPoint[]>([]);
  const [lastLoggedTemp, setLastLoggedTemp] = useState(temperatureC);

  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const temperatureRef = useRef(temperatureC);
  const targetTemperatureRef = useRef(targetTemperature);
  const gasMolesRef = useRef(gasMoles);
  const heatingRateRef = useRef(heatingRate);
  const lastLoggedTempRef = useRef(lastLoggedTemp);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { temperatureRef.current = temperatureC; }, [temperatureC]);
  useEffect(() => { targetTemperatureRef.current = targetTemperature; }, [targetTemperature]);
  useEffect(() => { gasMolesRef.current = gasMoles; }, [gasMoles]);
  useEffect(() => { heatingRateRef.current = heatingRate; }, [heatingRate]);
  useEffect(() => { lastLoggedTempRef.current = lastLoggedTemp; }, [lastLoggedTemp]);

  const volume = useMemo(() => calculateVolume(gasMoles, temperatureC), [gasMoles, temperatureC]);
  const kelvin = temperatureC + 273.15;
  const ratio = volume / kelvin;
  const previewPoints = useMemo(() => buildCharlesPreview(gasMoles), [gasMoles]);
  const displayPoints = dataPoints.length > 0 ? dataPoints : previewPoints;
  const progress = Math.min(100, Math.max(0, (temperatureC / Math.max(1, targetTemperature)) * 100));

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      const deltaSeconds = 0.12;
      const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
      const currentTemp = temperatureRef.current;
      const target = targetTemperatureRef.current;
      const direction = target >= currentTemp ? 1 : -1;
      const nextTemp =
        direction > 0
          ? Math.min(target, currentTemp + heatingRateRef.current * 1.6 * deltaSeconds)
          : Math.max(target, currentTemp - heatingRateRef.current * 1.6 * deltaSeconds);
      const nextKelvin = nextTemp + 273.15;
      const nextVolume = calculateVolume(gasMolesRef.current, nextTemp);

      elapsedSecondsRef.current = nextSeconds;
      temperatureRef.current = nextTemp;
      setElapsedSeconds(nextSeconds);
      setTemperatureC(nextTemp);

      if (Math.abs(nextTemp - lastLoggedTempRef.current) >= 4 || nextTemp === target) {
        const point = {
          temperatureC: nextTemp,
          kelvin: nextKelvin,
          volume: nextVolume,
          ratio: nextVolume / nextKelvin,
        };
        setDataPoints((previous) => [...previous, point]);
        setLastLoggedTemp(nextTemp);
        lastLoggedTempRef.current = nextTemp;
      }

      if (nextTemp === target) {
        setIsRunning(false);
        isRunningRef.current = false;
      }
    }, 120);

    return () => clearInterval(timer);
  }, [isRunning]);

  const makePoint = (nextTemperatureC: number) => {
    const nextKelvin = nextTemperatureC + 273.15;
    const nextVolume = calculateVolume(gasMoles, nextTemperatureC);

    return {
      temperatureC: nextTemperatureC,
      kelvin: nextKelvin,
      volume: nextVolume,
      ratio: nextVolume / nextKelvin,
    };
  };

  const handleStartStop = () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    isRunningRef.current = nextRunning;

    if (nextRunning && dataPoints.length === 0) {
      const point = makePoint(temperatureC);
      setDataPoints([point]);
      setLastLoggedTemp(temperatureC);
      lastLoggedTempRef.current = temperatureC;
    }
  };

  const handleStepTemperature = () => {
    const direction = targetTemperature >= temperatureC ? 1 : -1;
    const nextTemperature = direction > 0 ? Math.min(targetTemperature, temperatureC + 5) : Math.max(targetTemperature, temperatureC - 5);
    const point = makePoint(nextTemperature);
    setTemperatureC(nextTemperature);
    temperatureRef.current = nextTemperature;
    setDataPoints((previous) => [...previous, point]);
    setLastLoggedTemp(nextTemperature);
    lastLoggedTempRef.current = nextTemperature;
  };

  const handleReset = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setElapsedSeconds(0);
    elapsedSecondsRef.current = 0;
    setTemperatureC(25);
    temperatureRef.current = 25;
    setTargetTemperature(75);
    targetTemperatureRef.current = 75;
    setDataPoints([]);
    setLastLoggedTemp(25);
    lastLoggedTempRef.current = 25;
  };

  const handleSave = () => {
    if (dataPoints.length === 0) {
      alert("ยังไม่มีข้อมูลกฎของชาร์ลสำหรับบันทึก กรุณาเริ่มจำลองหรือปรับอุณหภูมิก่อน");
      return;
    }

    const experimentData = {
      labId: "charles-law",
      timestamp: new Date().toLocaleString("th-TH"),
      gasMoles,
      pressure: CONSTANT_PRESSURE_KPA,
      targetTemperature,
      dataPoints,
    };

    localStorage.setItem("scisiam_saved_charles_experiment", JSON.stringify(experimentData));
    const currentPoints = Number(localStorage.getItem("scisiam_points") || "120");
    localStorage.setItem("scisiam_points", String(currentPoints + 25));
    window.dispatchEvent(new Event("points-updated"));
    alert("บันทึกผลการทดลองกฎของชาร์ลสำเร็จ");
  };

  const visibleRows = displayPoints.slice(-7);
  const timeLabel = `${Math.floor(elapsedSeconds / 60).toString().padStart(2, "0")}:${Math.floor(elapsedSeconds % 60).toString().padStart(2, "0")}`;

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8fafc] pb-12">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-12 md:px-20">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
            <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-600">
              <Home className="h-3.5 w-3.5" />
              หน้าแรก
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <Link href="/?category=Chemistry" className="text-cyan-600 hover:text-cyan-700">Chemistry</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <Link href="/labs/charles-law" className="text-slate-700 hover:text-cyan-700">Charles&apos;s Temperature-Volume Lab</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-slate-800">Simulator</span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <section className="space-y-5 lg:col-span-9">
              <div className="relative flex min-h-[164px] items-center overflow-hidden rounded-2xl border border-orange-100 bg-white px-5 py-6 shadow-sm shadow-slate-200/50 sm:px-7">
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white">
                      <Thermometer className="h-4.5 w-4.5" />
                    </div>
                    <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-700">Chemistry</span>
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">ความดันคงที่</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-normal text-slate-900">Charles&apos;s Temperature-Volume Lab Simulator</h1>
                  <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
                    จำลองแก๊สในกระบอกปิดที่ความดันคงที่ ปรับอุณหภูมิของอ่างน้ำ และสังเกตปริมาตรที่เพิ่มขึ้นตามอุณหภูมิสัมบูรณ์
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-7">
                  <div className="min-h-[460px] rounded-2xl border border-orange-100 bg-white p-4 shadow-sm shadow-slate-200/50">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-sm font-black text-slate-800">
                        <FlaskConical className="h-4.5 w-4.5 text-orange-600" />
                        ห้องทดลองแก๊สในอ่างน้ำ
                      </h2>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">{isRunning ? "กำลังปรับอุณหภูมิ" : "พร้อมทดลอง"}</span>
                    </div>
                    <GasBathScene temperatureC={temperatureC} targetTemperature={targetTemperature} volume={volume} isRunning={isRunning} />
                  </div>
                </div>

                <div className="xl:col-span-5">
                  <section className="flex min-h-[460px] flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/50">
                    <h2 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
                      <Sliders className="h-4.5 w-4.5 text-orange-600" />
                      แผงควบคุมอุณหภูมิ
                    </h2>
                    <div className="flex-1 space-y-4">
                      {[
                        { label: "อุณหภูมิแก๊สปัจจุบัน", value: temperatureC, set: setTemperatureC, min: 0, max: 90, step: 1, suffix: "°C", color: "accent-orange-500", disabled: isRunning },
                        { label: "อุณหภูมิเป้าหมาย", value: targetTemperature, set: setTargetTemperature, min: 0, max: 90, step: 1, suffix: "°C", color: "accent-rose-500", disabled: isRunning },
                        { label: "ปริมาณแก๊ส (n)", value: gasMoles, set: setGasMoles, min: 0.018, max: 0.024, step: 0.001, suffix: "mol", color: "accent-cyan-500", disabled: isRunning || dataPoints.length > 0 },
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
                          <span className="mb-1 block text-[11px] font-bold text-slate-400">อัตราปรับอุณหภูมิ</span>
                          <div className="relative">
                            <select
                              value={heatingRate}
                              onChange={(event) => setHeatingRate(Number(event.target.value))}
                              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                            >
                              <option value={0.6}>ช้า</option>
                              <option value={1}>ปานกลาง</option>
                              <option value={1.6}>เร็ว</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          </div>
                        </label>
                        <div className="rounded-xl border border-orange-100 bg-orange-50/50 px-3 py-2">
                          <span className="block text-[11px] font-bold text-orange-600">ปริมาตรปัจจุบัน</span>
                          <strong className="text-sm font-black text-slate-800">{volume.toFixed(1)} ml</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                        <span className="rounded-lg bg-slate-50 px-2 py-1.5">V/T: <b className="text-orange-700">{ratio.toFixed(3)}</b></span>
                        <span className="rounded-lg bg-slate-50 px-2 py-1.5">เวลา: <b className="text-slate-800">{timeLabel}</b></span>
                        <span className="rounded-lg bg-slate-50 px-2 py-1.5">T(K): <b className="text-cyan-700">{kelvin.toFixed(1)}</b></span>
                        <span className="rounded-lg bg-slate-50 px-2 py-1.5">P: <b className="text-slate-800">{CONSTANT_PRESSURE_KPA} kPa</b></span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${isRunning ? "bg-slate-700" : "bg-orange-500 hover:bg-orange-600"}`}>
                        {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
                        {isRunning ? "หยุดชั่วคราว" : "เริ่มปรับอุณหภูมิ"}
                      </button>
                      <button onClick={handleStepTemperature} className="inline-flex items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-xs font-black text-orange-700 hover:bg-orange-100">+/- 5°C</button>
                      <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="รีเซ็ต">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button onClick={handleSave} className="col-span-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-700">
                        <Save className="h-4 w-4" />
                        บันทึกผลกฎของชาร์ล
                      </button>
                    </div>
                  </section>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <CharlesGraph points={displayPoints} />
                </div>

                <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 xl:col-span-4">
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                      <ClipboardList className="h-4.5 w-4.5 text-orange-600" />
                      ตารางบันทึกผล
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">{displayPoints.length} จุด</span>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-orange-50/70 text-[11px] font-black text-orange-800">
                        <tr>
                          <th className="px-3 py-2">T (°C)</th>
                          <th className="px-3 py-2">V (ml)</th>
                          <th className="px-3 py-2">V/T</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                        {visibleRows.map((point, index) => (
                          <tr key={`${point.temperatureC}-${index}`}>
                            <td className="px-3 py-2 font-mono">{point.temperatureC.toFixed(1)}</td>
                            <td className="px-3 py-2 font-mono text-orange-700">{point.volume.toFixed(1)}</td>
                            <td className="px-3 py-2 font-mono text-slate-500">{point.ratio.toFixed(3)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 xl:col-span-4">
                  <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
                    <Thermometer className="h-4.5 w-4.5 text-orange-600" />
                    ทฤษฎีและสมการ
                  </h3>
                  <div className="flex flex-1 flex-col justify-between gap-3">
                    <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4 text-center font-mono text-2xl font-black text-slate-800">
                      V<sub>1</sub>/T<sub>1</sub> = V<sub>2</sub>/T<sub>2</sub>
                    </div>
                    <p className="text-xs font-semibold leading-relaxed text-slate-500">
                      เมื่อความดันและจำนวนโมลคงที่ ปริมาตรของแก๊สจะแปรผันตรงกับอุณหภูมิสัมบูรณ์ ดังนั้นกราฟ V-T ควรเป็นเส้นตรง
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">T: <b className="text-orange-700">{kelvin.toFixed(1)} K</b></span>
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">V: <b className="text-cyan-700">{volume.toFixed(1)} ml</b></span>
                    </div>
                  </div>
                </section>
              </div>

              <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["ตั้งระบบความดันคงที่", Gauge],
                  ["กำหนดอุณหภูมิ", Thermometer],
                  ["ให้ความร้อน/ทำเย็น", Flame],
                  ["อ่านปริมาตร", Activity],
                  ["สรุปกราฟ", CheckCircle2],
                ].map(([label, Icon], index) => {
                  const StepIcon = Icon as typeof Thermometer;
                  return (
                    <div key={label as string} className="flex items-center gap-3 rounded-xl bg-slate-50/70 px-3 py-2">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
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
                  {["เข้าใจความสัมพันธ์ตรง V-T", "อ่านค่าอุณหภูมิแบบเคลวิน", "ตรวจสอบค่า V/T ที่ใกล้คงที่", "ตีความกราฟกฎของชาร์ล"].map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                  <Waves className="h-4.5 w-4.5 text-emerald-600" />
                  ความคืบหน้า
                </h2>
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full text-sm font-black text-slate-800" style={{ background: `conic-gradient(#10b981 ${Math.min(100, progress)}%, #e2e8f0 0)` }}>
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-white">{progress.toFixed(0)}%</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500">อุณหภูมิปัจจุบัน</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{temperatureC.toFixed(1)}°C</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                  คะแนนเมื่อสำเร็จ
                </h2>
                <p className="text-2xl font-black text-emerald-600">+25 คะแนน</p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-400">บันทึกผล V-T พร้อมตารางข้อมูลครบถ้วน</p>
              </section>

              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  คำแนะนำในการทดลอง
                </h2>
                <ul className="space-y-2 text-xs font-semibold leading-relaxed text-slate-500">
                  {["รักษาความดันให้คงที่ก่อนอ่านค่าปริมาตร", "เพิ่มหรือลดอุณหภูมิทีละช่วงเพื่อให้ข้อมูลนิ่ง", "ใช้หน่วยเคลวินเมื่อตรวจสอบอัตราส่วน V/T", "เปรียบเทียบความเป็นเส้นตรงของกราฟ V-T"].map((item) => (
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
