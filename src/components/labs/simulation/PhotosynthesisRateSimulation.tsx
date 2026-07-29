"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Leaf,
  Sprout,
  Sun,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface PhotosynthesisPoint {
  time: number;
  rate: number;
  oxygen: number;
  lightIntensity: number;
  carbonDioxide: number;
  temperature: number;
  waterLevel: number;
}

const calculateRate = (
  lightIntensity: number,
  carbonDioxide: number,
  temperature: number,
  waterLevel: number,
) => {
  const lightFactor = lightIntensity / (lightIntensity + 35);
  const co2Factor = carbonDioxide / (carbonDioxide + 360);
  const tempFactor = Math.exp(-Math.pow(temperature - 28, 2) / (2 * Math.pow(8.5, 2)));
  const waterFactor = Math.min(1, Math.max(0.15, waterLevel / 100));

  return Math.min(100, Math.max(0, lightFactor * co2Factor * tempFactor * waterFactor * 155));
};

const buildPreview = () =>
  Array.from({ length: 20 }, (_, index) => {
    const time = index * 0.5;
    const rate = calculateRate(70, 650, 28, 80) * (0.82 + index * 0.008);

    return {
      time,
      rate: Math.min(100, rate),
      oxygen: Math.min(100, index * 3.2),
      lightIntensity: 70,
      carbonDioxide: 650,
      temperature: 28,
      waterLevel: 80,
    };
  });

function PlantChamberScene({
  rate,
  oxygen,
  lightIntensity,
  carbonDioxide,
  temperature,
  waterLevel,
  isRunning,
}: {
  rate: number;
  oxygen: number;
  lightIntensity: number;
  carbonDioxide: number;
  temperature: number;
  waterLevel: number;
  isRunning: boolean;
}) {
  const lightOpacity = Math.min(0.9, Math.max(0.2, lightIntensity / 100));
  const leafLift = Math.min(14, rate / 8);
  const waterHeight = 42 + (waterLevel / 100) * 42;
  const tempNeedle = -45 + ((temperature - 10) / 35) * 90;

  return (
    <div className="relative flex h-full min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#ecfeff_48%,#f8fafc_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-30" />
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 text-left shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-emerald-600">plant chamber</p>
        <p className="mt-0.5 text-xs font-bold text-slate-600">light + CO₂ + water → O₂</p>
      </div>

      <svg className="relative z-10 h-full max-h-[365px] w-full max-w-[580px]" viewBox="0 0 580 365" fill="none" aria-hidden="true">
        <defs>
          <radialGradient id="photoLight" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(142 88) rotate(48) scale(250 170)">
            <stop stopColor="#fde68a" stopOpacity={lightOpacity} />
            <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="leafGradient" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#15803d" />
          </linearGradient>
        </defs>

        <circle cx="124" cy="72" r="38" fill="#facc15" opacity={lightOpacity} />
        <path d="M145 95L280 236L382 150L186 48Z" fill="url(#photoLight)" />
        <g opacity={lightOpacity}>
          <path d="M124 15V0M124 144V128M67 72H50M198 72H181M83 31L71 19M174 123L162 111M83 113L71 125M174 21L162 33" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* Chamber */}
        <g transform="translate(145, 72)">
          <rect x="28" y="28" width="262" height="226" rx="42" fill="#ffffff" opacity="0.78" stroke="#86efac" strokeWidth="5" />
          <path d="M42 182C92 163 144 198 192 181C227 169 253 170 276 184V226C276 235 268 242 259 242H58C49 242 42 235 42 226V182Z" fill="#bae6fd" opacity="0.72" />
          <rect x="48" y={236 - waterHeight} width="222" height={waterHeight} rx="22" fill="#67e8f9" opacity="0.55" />
          <path d="M42 182C92 163 144 198 192 181C227 169 253 170 276 184" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" opacity="0.75" />

          {/* Plant */}
          <path d="M158 213C158 174 158 144 158 111" stroke="#16a34a" strokeWidth="9" strokeLinecap="round" />
          <path d={`M158 155C124 ${124 - leafLift} 93 ${118 - leafLift} 70 ${145 - leafLift}C98 ${160 - leafLift} 128 ${173 - leafLift} 158 155Z`} fill="url(#leafGradient)" />
          <path d={`M158 135C190 ${98 - leafLift} 233 ${101 - leafLift} 254 ${132 - leafLift}C220 ${145 - leafLift} 187 ${153 - leafLift} 158 135Z`} fill="url(#leafGradient)" />
          <path d={`M158 185C191 ${161 - leafLift} 226 ${170 - leafLift} 246 ${203 - leafLift}C211 ${211 - leafLift} 184 ${205 - leafLift} 158 185Z`} fill="url(#leafGradient)" opacity="0.92" />
          <path d="M92 144C115 151 134 155 158 155M184 136C206 130 226 129 248 133M184 187C206 190 225 196 242 203" stroke="#bbf7d0" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
          <rect x="126" y="211" width="64" height="28" rx="10" fill="#92400e" />
        </g>

        {/* CO2 inlet */}
        <g transform="translate(394, 128)">
          <rect x="0" y="0" width="96" height="56" rx="20" fill="#ffffff" stroke="#bae6fd" strokeWidth="3" />
          <text x="48" y="23" fill="#0891b2" fontSize="12" fontWeight="900" textAnchor="middle">CO₂</text>
          <text x="48" y="42" fill="#0f172a" fontSize="15" fontWeight="900" textAnchor="middle">{carbonDioxide}</text>
          <path className={isRunning ? "animate-pulse" : ""} d="M0 28H-42" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 8" />
        </g>

        {/* Oxygen bubbles */}
        <g className={isRunning ? "animate-pulse" : ""}>
          {[0, 1, 2, 3, 4].map((bubble) => (
            <circle
              key={bubble}
              cx={306 + bubble * 17}
              cy={226 - bubble * 26}
              r={4 + (bubble % 2)}
              fill="#22c55e"
              opacity={Math.min(0.9, oxygen / 100 + bubble * 0.08)}
            />
          ))}
        </g>

        {/* Temperature gauge */}
        <g transform="translate(410, 218)">
          <circle cx="44" cy="44" r="37" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
          <path d="M20 55C23 34 34 23 55 22" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          <g transform={`rotate(${tempNeedle} 44 44)`}>
            <path d="M44 44L65 32" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
          </g>
          <circle cx="44" cy="44" r="5" fill="#ef4444" />
          <text x="44" y="70" fill="#ea580c" fontSize="12" fontWeight="900" textAnchor="middle">{temperature}°C</text>
        </g>
      </svg>
    </div>
  );
}

function RateGraph({ points }: { points: PhotosynthesisPoint[] }) {
  const path = useMemo(() => {
    if (points.length === 0) return "";
    return points
      .map((point, index) => {
        const x = 32 + Math.min(1, point.time / 10) * 252;
        const y = 138 - (point.rate / 100) * 112;
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }, [points]);

  const latest = points[points.length - 1];

  return (
    <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <BarChart3 className="h-4.5 w-4.5 text-emerald-600" />
          กราฟอัตราสังเคราะห์แสง
        </h3>
        <span className="text-[10px] font-bold text-emerald-600">rate-time</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-50/70 p-2">
        <svg className="h-full min-h-[174px] w-full" viewBox="0 0 320 170" fill="none" aria-hidden="true">
          <line x1="32" y1="138" x2="284" y2="138" stroke="#cbd5e1" strokeWidth="1.4" />
          <line x1="32" y1="110" x2="284" y2="110" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="82" x2="284" y2="82" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="54" x2="284" y2="54" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="26" x2="284" y2="26" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="22" x2="32" y2="138" stroke="#cbd5e1" strokeWidth="1.4" />
          <text x="26" y="29" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">100</text>
          <text x="26" y="85" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">50</text>
          <text x="26" y="141" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">0</text>
          <path d={path} stroke="#10b981" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          {latest && (
            <circle cx={32 + Math.min(1, latest.time / 10) * 252} cy={138 - (latest.rate / 100) * 112} r="4.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
          )}
          <text x="32" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">0</text>
          <text x="158" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">5</text>
          <text x="284" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">10 นาที</text>
        </svg>
      </div>
    </section>
  );
}

function ResultsTable({ points }: { points: PhotosynthesisPoint[] }) {
  const rows = points.slice(-7);

  return (
    <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-emerald-600" />
          ตารางบันทึกผล
        </h3>
        <span className="text-[10px] font-bold text-slate-400">{points.length} จุด</span>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-emerald-50/70 text-[11px] font-black text-emerald-800">
            <tr>
              <th className="px-3 py-2">เวลา</th>
              <th className="px-3 py-2">Rate</th>
              <th className="px-3 py-2">O₂</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {rows.map((point, index) => (
              <tr key={`${point.time}-${index}`}>
                <td className="px-3 py-2 font-mono">{point.time.toFixed(1)}</td>
                <td className="px-3 py-2 font-mono text-emerald-700">{point.rate.toFixed(1)}%</td>
                <td className="px-3 py-2 font-mono text-cyan-700">{point.oxygen.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TheoryPanel({ rate }: { rate: number }) {
  return (
    <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Leaf className="h-4.5 w-4.5 text-emerald-600" />
        ทฤษฎีและสมการ
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-center text-lg font-black text-slate-800">
          6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500">
          อัตราสังเคราะห์แสงขึ้นกับแสง คาร์บอนไดออกไซด์ น้ำ และอุณหภูมิ โดยแต่ละปัจจัยมีช่วงเหมาะสม หากปัจจัยใดจำกัด อัตรารวมจะลดลง
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">Rate: <b className="text-emerald-700">{rate.toFixed(1)}%</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">Output: <b className="text-cyan-700">O₂</b></span>
        </div>
      </div>
    </section>
  );
}

export default function PhotosynthesisRateSimulation() {
  const [lightIntensity, setLightIntensity] = useState(70);
  const [carbonDioxide, setCarbonDioxide] = useState(650);
  const [temperature, setTemperature] = useState(28);
  const [waterLevel, setWaterLevel] = useState(80);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [oxygen, setOxygen] = useState(0);
  const [dataPoints, setDataPoints] = useState<PhotosynthesisPoint[]>([]);
  const [lastLoggedMinute, setLastLoggedMinute] = useState(0);

  const isRunningRef = useRef(isRunning);
  const elapsedMinutesRef = useRef(elapsedMinutes);
  const oxygenRef = useRef(oxygen);
  const lastLoggedMinuteRef = useRef(lastLoggedMinute);
  const lightRef = useRef(lightIntensity);
  const co2Ref = useRef(carbonDioxide);
  const temperatureRef = useRef(temperature);
  const waterRef = useRef(waterLevel);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedMinutesRef.current = elapsedMinutes; }, [elapsedMinutes]);
  useEffect(() => { oxygenRef.current = oxygen; }, [oxygen]);
  useEffect(() => { lastLoggedMinuteRef.current = lastLoggedMinute; }, [lastLoggedMinute]);
  useEffect(() => { lightRef.current = lightIntensity; }, [lightIntensity]);
  useEffect(() => { co2Ref.current = carbonDioxide; }, [carbonDioxide]);
  useEffect(() => { temperatureRef.current = temperature; }, [temperature]);
  useEffect(() => { waterRef.current = waterLevel; }, [waterLevel]);

  const rate = useMemo(
    () => calculateRate(lightIntensity, carbonDioxide, temperature, waterLevel),
    [lightIntensity, carbonDioxide, temperature, waterLevel],
  );
  const previewPoints = useMemo(() => buildPreview(), []);
  const displayPoints = dataPoints.length > 0 ? dataPoints : previewPoints;
  const timeLabel = `${Math.floor(elapsedMinutes).toString().padStart(2, "0")}:${Math.floor((elapsedMinutes % 1) * 60).toString().padStart(2, "0")}`;

  const makePoint = (time: number, nextOxygen: number): PhotosynthesisPoint => {
    const nextRate = calculateRate(lightIntensity, carbonDioxide, temperature, waterLevel);

    return {
      time,
      rate: nextRate,
      oxygen: nextOxygen,
      lightIntensity,
      carbonDioxide,
      temperature,
      waterLevel,
    };
  };

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      const deltaMinutes = 0.05;
      const nextMinutes = elapsedMinutesRef.current + deltaMinutes;
      const nextRate = calculateRate(lightRef.current, co2Ref.current, temperatureRef.current, waterRef.current);
      const nextOxygen = Math.min(100, oxygenRef.current + nextRate * deltaMinutes * 0.08);

      elapsedMinutesRef.current = nextMinutes;
      oxygenRef.current = nextOxygen;
      setElapsedMinutes(nextMinutes);
      setOxygen(nextOxygen);

      if (nextMinutes - lastLoggedMinuteRef.current >= 0.5 || nextOxygen >= 100) {
        const point = {
          time: nextMinutes,
          rate: nextRate,
          oxygen: nextOxygen,
          lightIntensity: lightRef.current,
          carbonDioxide: co2Ref.current,
          temperature: temperatureRef.current,
          waterLevel: waterRef.current,
        };
        setDataPoints((previous) => [...previous, point]);
        setLastLoggedMinute(nextMinutes);
        lastLoggedMinuteRef.current = nextMinutes;
      }

      if (nextMinutes >= 10 || nextOxygen >= 100) {
        setIsRunning(false);
        isRunningRef.current = false;
      }
    }, 120);

    return () => clearInterval(timer);
  }, [isRunning]);

  const handleStartStop = () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    isRunningRef.current = nextRunning;

    if (nextRunning && dataPoints.length === 0) {
      const point = makePoint(0, oxygen);
      setDataPoints([point]);
      setLastLoggedMinute(0);
      lastLoggedMinuteRef.current = 0;
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setElapsedMinutes(0);
    elapsedMinutesRef.current = 0;
    setOxygen(0);
    oxygenRef.current = 0;
    setDataPoints([]);
    setLastLoggedMinute(0);
    lastLoggedMinuteRef.current = 0;
  };

  const handleSave = async () => {
    if (dataPoints.length === 0) {
      alert("ยังไม่มีข้อมูล Photosynthesis Rate สำหรับบันทึก กรุณาเริ่มจำลองก่อน");
      return;
    }

    const experimentData = {
      labId: "photosynthesis-rate",
      timestamp: new Date().toLocaleString("th-TH"),
      lightIntensity,
      carbonDioxide,
      temperature,
      waterLevel,
      dataPoints,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_photosynthesis_experiment",
      localPayload: experimentData,
      labId: "photosynthesis-rate",
      title: "Photosynthesis Rate Chamber",
      variables: { lightIntensity, carbonDioxide, temperature, waterLevel },
      liveValues: { oxygen, rate, elapsedMinutes },
      graphPoints: dataPoints,
      tableRows: dataPoints,
      summary: {
        finalOxygen: oxygen,
        rate,
        dataPointCount: dataPoints.length,
      },
      score: Math.round(Math.min(100, Math.max(0, oxygen))),
      durationSeconds: Math.round(elapsedMinutes * 60),
    });
  };

  const controls = (
    <div className="space-y-4">
      {[
        { label: "ความเข้มแสง", value: lightIntensity, set: setLightIntensity, min: 5, max: 100, step: 1, suffix: "%", color: "accent-yellow-500", icon: Sun },
        { label: "คาร์บอนไดออกไซด์", value: carbonDioxide, set: setCarbonDioxide, min: 200, max: 1200, step: 25, suffix: "ppm", color: "accent-cyan-500", icon: Wind },
        { label: "อุณหภูมิห้อง", value: temperature, set: setTemperature, min: 10, max: 45, step: 1, suffix: "°C", color: "accent-orange-500", icon: Thermometer },
        { label: "ระดับน้ำ", value: waterLevel, set: setWaterLevel, min: 20, max: 100, step: 1, suffix: "%", color: "accent-blue-500", icon: Waves },
      ].map((control) => {
        const ControlIcon = control.icon;

        return (
          <label key={control.label} className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <ControlIcon className="h-3.5 w-3.5 text-emerald-600" />
                {control.label}
              </span>
              <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">
                {control.value.toFixed(0)} {control.suffix}
              </span>
            </div>
            <input
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={control.value}
              disabled={isRunning}
              onChange={(event) => control.set(Number(event.target.value))}
              className={`h-1.5 w-full rounded-full bg-slate-100 ${control.color} disabled:opacity-45`}
            />
          </label>
        );
      })}

    </div>
  );

  return (
    <SharedSimulationShell
      accent="emerald"
      labId="photosynthesis-rate"
      category="Biology"
      title="Photosynthesis Rate Chamber"
      subtitle="จำลองห้องเพาะเลี้ยงพืชแบบปิด ปรับแสง CO₂ อุณหภูมิ และน้ำ เพื่อสังเกตอัตราการสังเคราะห์แสงและปริมาณออกซิเจนที่เกิดขึ้น"
      statusLabel={isRunning ? "กำลังวัดอัตรา" : "พร้อมทดลอง"}
      icon={Leaf}
      sceneTitle="ห้องเพาะเลี้ยงพืชจำลอง"
      scene={<PlantChamberScene rate={rate} oxygen={oxygen} lightIntensity={lightIntensity} carbonDioxide={carbonDioxide} temperature={temperature} waterLevel={waterLevel} isRunning={isRunning} />}
      controlsTitle="แผงควบคุมสภาพแวดล้อม"
      controls={controls}
      compactControls={
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            { label: "แสง", value: lightIntensity, set: setLightIntensity, min: 5, max: 100, step: 1, unit: "%", tone: "accent-yellow-500" },
            { label: "CO₂", value: carbonDioxide, set: setCarbonDioxide, min: 200, max: 1200, step: 25, unit: "ppm", tone: "accent-cyan-500" },
            { label: "อุณหภูมิ", value: temperature, set: setTemperature, min: 10, max: 45, step: 1, unit: "°C", tone: "accent-orange-500" },
            { label: "น้ำ", value: waterLevel, set: setWaterLevel, min: 10, max: 100, step: 5, unit: "%", tone: "accent-blue-500" },
          ].map((control) => (
            <label key={control.label} className="rounded-xl bg-slate-50 p-2 text-xs font-black text-slate-700">
              <span className="mb-1 flex justify-between gap-2"><span>{control.label}</span><span>{control.value} {control.unit}</span></span>
              <input aria-label={control.label} disabled={isRunning} type="range" min={control.min} max={control.max} step={control.step} value={control.value} onChange={(event) => control.set(Number(event.target.value))} className={`w-full ${control.tone}`} />
            </label>
          ))}
        </div>
      }
      metrics={[
        { label: "Rate", value: `${rate.toFixed(1)}%`, tone: "emerald" },
        { label: "O₂", value: oxygen.toFixed(1), tone: "cyan" },
        { label: "เวลา", value: timeLabel, tone: "blue" },
        { label: "CO₂", value: `${carbonDioxide} ppm`, tone: "orange" },
      ]}
      graph={<RateGraph points={displayPoints} />}
      table={<ResultsTable points={displayPoints} />}
      theory={<TheoryPanel rate={rate} />}
      steps={[
        { label: "ตั้งห้องพืช", icon: Sprout },
        { label: "ปรับแสง", icon: Sun },
        { label: "ควบคุม CO₂", icon: Wind },
        { label: "วัด O₂", icon: BarChart3 },
        { label: "สรุปผล", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "เข้าใจปัจจัยจำกัดของการสังเคราะห์แสง",
        "วิเคราะห์ผลของแสง CO₂ น้ำ และอุณหภูมิ",
        "อ่านกราฟอัตราการเกิดออกซิเจน",
        "เปรียบเทียบสภาพแวดล้อมที่เหมาะสมของพืช",
      ]}
      progressLabel="ออกซิเจนสะสม"
      progressValue={`${oxygen.toFixed(1)} หน่วย`}
      progressPercent={oxygen}
      tips={[
        "ปรับทีละตัวแปรเพื่อเห็นผลของปัจจัยจำกัดชัดเจน",
        "อุณหภูมิใกล้ 28°C มักให้ rate สูงในแบบจำลองนี้",
        "แสงสูงมากแต่ CO₂ ต่ำอาจทำให้อัตราเพิ่มได้ไม่มาก",
        "บันทึกข้อมูลหลายจุดก่อนสรุปแนวโน้มของกราฟ",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดชั่วคราว" : "ทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}

