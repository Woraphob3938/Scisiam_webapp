"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";
import {
  Beaker,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Droplets,
  FlaskConical,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Save,
  Target,
} from "lucide-react";

interface TitrationPoint {
  volume: number;
  ph: number;
}

const clampPH = (value: number) => Math.min(14, Math.max(0, value));

const calculatePH = (acidConc: number, acidVolumeMl: number, baseConc: number, baseVolumeMl: number) => {
  const acidMoles = acidConc * (acidVolumeMl / 1000);
  const baseMoles = baseConc * (baseVolumeMl / 1000);
  const totalVolumeL = Math.max(0.000001, (acidVolumeMl + baseVolumeMl) / 1000);
  const difference = acidMoles - baseMoles;

  if (Math.abs(difference) < 0.0000003) return 7;

  if (difference > 0) {
    const hydrogen = difference / totalVolumeL;
    return clampPH(-Math.log10(hydrogen));
  }

  const hydroxide = Math.abs(difference) / totalVolumeL;
  return clampPH(14 + Math.log10(hydroxide));
};

const getIndicatorColor = (ph: number) => {
  if (ph < 4) return "#fca5a5";
  if (ph < 6.5) return "#fde68a";
  if (ph < 8.5) return "#bbf7d0";
  if (ph < 10) return "#a5f3fc";
  return "#f9a8d4";
};

const buildTitrationPreview = (acidConc: number, acidVolume: number, baseConc: number) => {
  const equivalenceVolume = (acidConc * acidVolume) / baseConc;
  const maxVolume = Math.max(32, equivalenceVolume * 1.45);
  return Array.from({ length: 34 }, (_, index) => {
    const volume = (index / 33) * maxVolume;
    return {
      volume,
      ph: calculatePH(acidConc, acidVolume, baseConc, volume),
    };
  });
};

function MiniTitrationScene({
  addedVolume,
  currentPH,
  equivalenceVolume,
  isRunning,
}: {
  addedVolume: number;
  currentPH: number;
  equivalenceVolume: number;
  isRunning: boolean;
}) {
  const liquidColor = getIndicatorColor(currentPH);
  const fillHeight = Math.min(66, 34 + addedVolume * 0.65);
  const buretteFill = Math.max(18, 92 - addedVolume * 1.35);

  return (
    <div className="relative flex h-full min-h-[258px] items-center justify-center overflow-hidden rounded-2xl border border-cyan-100/80 bg-[linear-gradient(135deg,#f8fbff_0%,#eefcff_48%,#fff7fb_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/75 px-3 py-2 text-left shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-cyan-600">endpoint window</p>
        <p className="mt-0.5 text-xs font-bold text-slate-600">
          Veq {equivalenceVolume.toFixed(1)} ml
        </p>
      </div>

      <svg className="relative z-10 h-full max-h-[278px] w-full max-w-[420px]" viewBox="0 0 420 286" fill="none" aria-hidden="true">
        <ellipse cx="218" cy="253" rx="132" ry="18" fill="#dbeafe" opacity="0.55" />

        <rect x="105" y="33" width="8" height="205" rx="4" fill="#94a3b8" />
        <rect x="58" y="236" width="116" height="12" rx="5" fill="#cbd5e1" />
        <path d="M110 66H250" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
        <circle cx="110" cy="66" r="9" fill="#475569" />

        <g transform="translate(238, 18)">
          <rect x="0" y="0" width="30" height="172" rx="14" fill="rgba(255,255,255,.84)" stroke="#67e8f9" strokeWidth="4" />
          <rect x="7" y={buretteFill} width="16" height={146 - buretteFill} rx="8" fill="#38bdf8" opacity="0.45" />
          <path d="M30 22H42M30 42H38M30 62H42M30 82H38M30 102H42M30 122H38" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 172V199" stroke="#0891b2" strokeWidth="4" strokeLinecap="round" />
          <path d="M4 158H27" stroke="#0e7490" strokeWidth="5" strokeLinecap="round" />
        </g>

        {(isRunning || addedVolume > 0) && (
          <g className="animate-pulse">
            <path d="M253 223C253 223 246 232 246 237C246 242 249 245 253 245C257 245 260 242 260 237C260 232 253 223 253 223Z" fill="#22c55e" />
            <circle cx="259" cy="204" r="4" fill="#22c55e" opacity="0.7" />
          </g>
        )}

        <g transform="translate(142, 142)">
          <path d="M54 0H82M62 0V48L26 116C21 126 28 138 40 138H96C108 138 115 126 110 116L74 48V0" fill="#f8fafc" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M35 ${142 - fillHeight}H101L111 116C115 126 108 135 97 135H39C28 135 21 126 25 116L35 ${142 - fillHeight}Z`} fill={liquidColor} opacity="0.82" />
          <path d="M42 101C58 94 78 94 94 101" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          <circle cx="56" cy="116" r="4" fill="#ffffff" opacity="0.7" />
          <circle cx="83" cy="123" r="3" fill="#ffffff" opacity="0.65" />
        </g>

        <g transform="translate(300, 116)">
          <rect x="0" y="0" width="74" height="88" rx="16" fill="#ffffff" stroke="#bbf7d0" strokeWidth="3" />
          <rect x="11" y="13" width="52" height="26" rx="8" fill="#ecfdf5" />
          <text x="37" y="32" fill="#047857" fontSize="18" fontWeight="900" textAnchor="middle">{currentPH.toFixed(2)}</text>
          <circle cx="24" cy="57" r="6" fill="#10b981" />
          <circle cx="50" cy="57" r="6" fill="#64748b" />
          <path d="M37 88V132" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

function TitrationGraph({ points, equivalenceVolume }: { points: TitrationPoint[]; equivalenceVolume: number }) {
  const maxVolume = Math.max(30, equivalenceVolume * 1.45);
  const x = React.useCallback((volume: number) => 28 + (volume / maxVolume) * 264, [maxVolume]);
  const y = React.useCallback((ph: number) => 136 - (ph / 14) * 112, []);
  const path = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((point, index) => `${index === 0 ? "M" : "L"}${x(point.volume)},${y(point.ph)}`).join(" ");
  }, [points, x, y]);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <Gauge className="h-4.5 w-4.5 text-cyan-600" />
          กราฟ pH กับปริมาตร
        </h3>
        <span className="text-[10px] font-bold text-cyan-600">Veq {equivalenceVolume.toFixed(1)} ml</span>
      </div>
      <div className="min-h-0 flex-1 rounded-xl bg-slate-50/70 p-2">
        <svg className="h-full min-h-[136px] w-full" viewBox="0 0 320 160" fill="none" aria-hidden="true">
          <line x1="28" y1="136" x2="292" y2="136" stroke="#cbd5e1" strokeWidth="1.4" />
          <line x1="28" y1="108" x2="292" y2="108" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="28" y1="80" x2="292" y2="80" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="28" y1="52" x2="292" y2="52" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="28" y1="24" x2="292" y2="24" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="28" y1="20" x2="28" y2="136" stroke="#cbd5e1" strokeWidth="1.4" />
          <text x="22" y="27" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">14</text>
          <text x="22" y="83" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">7</text>
          <text x="22" y="139" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">0</text>
          <line x1={x(equivalenceVolume)} y1="20" x2={x(equivalenceVolume)} y2="136" stroke="#f43f5e" strokeWidth="1.4" strokeDasharray="4 3" />
          <path d={path} stroke="#06b6d4" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          {points.slice(-1).map((point) => (
            <circle key={`${point.volume}-${point.ph}`} cx={x(point.volume)} cy={y(point.ph)} r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
          ))}
          <text x="28" y="151" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">0</text>
          <text x="292" y="151" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">{maxVolume.toFixed(0)} ml</text>
        </svg>
      </div>
    </section>
  );
}

export default function AcidBaseTitrationSimulation() {
  const [acidConc, setAcidConc] = useState(0.1);
  const [acidVolume, setAcidVolume] = useState(25);
  const [baseConc, setBaseConc] = useState(0.1);
  const [dropRate, setDropRate] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [addedVolume, setAddedVolume] = useState(0);
  const [dataPoints, setDataPoints] = useState<TitrationPoint[]>([]);
  const [lastLoggedVolume, setLastLoggedVolume] = useState(0);

  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const addedVolumeRef = useRef(addedVolume);
  const lastLoggedVolumeRef = useRef(lastLoggedVolume);
  const acidConcRef = useRef(acidConc);
  const acidVolumeRef = useRef(acidVolume);
  const baseConcRef = useRef(baseConc);
  const dropRateRef = useRef(dropRate);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { addedVolumeRef.current = addedVolume; }, [addedVolume]);
  useEffect(() => { lastLoggedVolumeRef.current = lastLoggedVolume; }, [lastLoggedVolume]);
  useEffect(() => { acidConcRef.current = acidConc; }, [acidConc]);
  useEffect(() => { acidVolumeRef.current = acidVolume; }, [acidVolume]);
  useEffect(() => { baseConcRef.current = baseConc; }, [baseConc]);
  useEffect(() => { dropRateRef.current = dropRate; }, [dropRate]);

  const equivalenceVolume = useMemo(() => (acidConc * acidVolume) / baseConc, [acidConc, acidVolume, baseConc]);
  const currentPH = useMemo(() => calculatePH(acidConc, acidVolume, baseConc, addedVolume), [acidConc, acidVolume, baseConc, addedVolume]);
  const previewPoints = useMemo(() => buildTitrationPreview(acidConc, acidVolume, baseConc), [acidConc, acidVolume, baseConc]);
  const displayPoints = dataPoints.length > 0 ? dataPoints : previewPoints;
  const progress = Math.min(100, (addedVolume / equivalenceVolume) * 100);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      const deltaSeconds = 0.12;
      const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
      const nextVolume = Math.min(equivalenceVolume * 1.45, addedVolumeRef.current + dropRateRef.current * deltaSeconds);
      const nextPH = calculatePH(acidConcRef.current, acidVolumeRef.current, baseConcRef.current, nextVolume);

      elapsedSecondsRef.current = nextSeconds;
      addedVolumeRef.current = nextVolume;
      setElapsedSeconds(nextSeconds);
      setAddedVolume(nextVolume);

      if (nextVolume - lastLoggedVolumeRef.current >= 1 || nextVolume >= equivalenceVolume * 1.45) {
        setDataPoints((previous) => [...previous, { volume: nextVolume, ph: nextPH }]);
        setLastLoggedVolume(nextVolume);
        lastLoggedVolumeRef.current = nextVolume;
      }

      if (nextVolume >= equivalenceVolume * 1.45) {
        setIsRunning(false);
        isRunningRef.current = false;
      }
    }, 120);

    return () => clearInterval(timer);
  }, [isRunning, equivalenceVolume]);

  const resetSimulation = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setElapsedSeconds(0);
    elapsedSecondsRef.current = 0;
    setAddedVolume(0);
    addedVolumeRef.current = 0;
    setDataPoints([]);
    setLastLoggedVolume(0);
    lastLoggedVolumeRef.current = 0;
  };

  const handleStartStop = () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    isRunningRef.current = nextRunning;

    if (nextRunning && dataPoints.length === 0) {
      const firstPoint = { volume: 0, ph: calculatePH(acidConc, acidVolume, baseConc, 0) };
      setDataPoints([firstPoint]);
      setLastLoggedVolume(0);
      lastLoggedVolumeRef.current = 0;
    }
  };

  const handleAddDrop = () => {
    const nextVolume = Math.min(equivalenceVolume * 1.45, addedVolume + 0.5);
    const nextPH = calculatePH(acidConc, acidVolume, baseConc, nextVolume);
    setAddedVolume(nextVolume);
    addedVolumeRef.current = nextVolume;
    setDataPoints((previous) => [...previous, { volume: nextVolume, ph: nextPH }]);
    setLastLoggedVolume(nextVolume);
    lastLoggedVolumeRef.current = nextVolume;
  };

  const handleSave = async () => {
    if (dataPoints.length === 0) {
      alert("ยังไม่มีข้อมูลการไทเทรตสำหรับบันทึก กรุณาเริ่มจำลองหรือเพิ่มหยดสารก่อน");
      return;
    }

    const experimentData = {
      labId: "acid-base-titration",
      timestamp: new Date().toLocaleString("th-TH"),
      acidConc,
      acidVolume,
      baseConc,
      equivalenceVolume,
      dataPoints,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_titration_experiment",
      localPayload: experimentData,
      labId: "acid-base-titration",
      title: "Acid-Base Titration Lab",
      variables: { acidConc, acidVolume, baseConc, dropRate, equivalenceVolume },
      liveValues: { currentPH, addedVolume, progress },
      graphPoints: dataPoints,
      tableRows: dataPoints,
      summary: {
        endpointPH: currentPH,
        equivalenceVolume,
        dataPointCount: dataPoints.length,
      },
      score: Math.round(Math.min(100, Math.max(0, progress))),
      durationSeconds: Math.round(elapsedSeconds),
    });
  };

  const visibleRows = displayPoints.slice(-6);
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
                      <FlaskConical className="h-4.5 w-4.5" />
                    </div>
                    <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-700">Chemistry</span>
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">ไทเทรตพร้อมทดลอง</span>
                  </div>
                  <h1 className="truncate text-2xl font-black tracking-normal text-slate-900">Acid-Base Titration Lab Simulator</h1>
                  <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
                    จำลองการหยดสารมาตรฐานจากบิวเรต ติดตามค่า pH สีอินดิเคเตอร์ และอ่านจุดสมมูลจากกราฟแบบเรียลไทม์
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-7">
                  <div className="min-h-[430px] rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm shadow-slate-200/50">
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-sm font-black text-slate-800">
                        <Beaker className="h-4.5 w-4.5 text-cyan-600" />
                        ห้องทดลองไทเทรต
                      </h2>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">{isRunning ? "กำลังหยดสาร" : "พร้อมทดลอง"}</span>
                    </div>
                    <MiniTitrationScene addedVolume={addedVolume} currentPH={currentPH} equivalenceVolume={equivalenceVolume} isRunning={isRunning} />
                  </div>
                </div>

                <div className="xl:col-span-5">
                  <section className="flex min-h-[430px] flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/50">
                    <h2 className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
                      <Droplets className="h-4.5 w-4.5 text-cyan-600" />
                      แผงควบคุมการไทเทรต
                    </h2>
                    <div className="flex-1 space-y-4">
                      {[
                        { label: "ความเข้มข้นกรด (Ma)", value: acidConc, set: setAcidConc, min: 0.05, max: 0.2, step: 0.01, suffix: "M", color: "accent-rose-500" },
                        { label: "ปริมาตรกรด (Va)", value: acidVolume, set: setAcidVolume, min: 10, max: 50, step: 1, suffix: "ml", color: "accent-blue-500" },
                        { label: "ความเข้มข้นเบส (Mb)", value: baseConc, set: setBaseConc, min: 0.05, max: 0.2, step: 0.01, suffix: "M", color: "accent-emerald-500" },
                      ].map((control) => (
                        <label key={control.label} className="block">
                          <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                            <span>{control.label}</span>
                            <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">{control.value.toFixed(control.step < 1 ? 2 : 0)} {control.suffix}</span>
                          </div>
                          <input
                            type="range"
                            min={control.min}
                            max={control.max}
                            step={control.step}
                            value={control.value}
                            disabled={isRunning || addedVolume > 0}
                            onChange={(event) => control.set(Number(event.target.value))}
                            className={`h-1.5 w-full rounded-full bg-slate-100 ${control.color} disabled:opacity-45`}
                          />
                        </label>
                      ))}

                      <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-bold text-slate-400">อัตราหยด</span>
                          <div className="relative">
                            <select
                              value={dropRate}
                              onChange={(event) => setDropRate(Number(event.target.value))}
                              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                            >
                              <option value={0.5}>ช้า</option>
                              <option value={1}>ปานกลาง</option>
                              <option value={2}>เร็ว</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          </div>
                        </label>
                        <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 px-3 py-2">
                          <span className="block text-[11px] font-bold text-cyan-600">จุดสมมูล</span>
                          <strong className="text-sm font-black text-slate-800">{equivalenceVolume.toFixed(2)} ml</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-2">
                      <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${isRunning ? "bg-slate-700" : "bg-cyan-600 hover:bg-cyan-700"}`}>
                        {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
                        {isRunning ? "หยุดชั่วคราว" : "เริ่มไทเทรต"}
                      </button>
                      <button onClick={handleAddDrop} className="inline-flex items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-xs font-black text-cyan-700 hover:bg-cyan-100">+0.5 ml</button>
                      <button onClick={resetSimulation} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="รีเซ็ต">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button onClick={handleSave} className="col-span-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-700">
                        <Save className="h-4 w-4" />
                        บันทึกผลการไทเทรต
                      </button>
                    </div>
                  </section>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <TitrationGraph points={displayPoints} equivalenceVolume={equivalenceVolume} />
                </div>

                <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 xl:col-span-4">
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                      <ClipboardList className="h-4.5 w-4.5 text-cyan-600" />
                      ตารางบันทึกผล
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">{displayPoints.length} จุด</span>
                  </div>
                  <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-cyan-50/60 text-[11px] font-black text-cyan-800">
                        <tr>
                          <th className="px-3 py-2">Vb (ml)</th>
                          <th className="px-3 py-2">pH</th>
                          <th className="px-3 py-2">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                        {visibleRows.map((point, index) => (
                          <tr key={`${point.volume}-${index}`}>
                            <td className="px-3 py-2 font-mono">{point.volume.toFixed(1)}</td>
                            <td className="px-3 py-2 font-mono text-cyan-700">{point.ph.toFixed(2)}</td>
                            <td className="px-3 py-2 text-[11px] text-slate-400">{Math.abs(point.volume - equivalenceVolume) < 1 ? "ใกล้จุดสมมูล" : point.ph < 7 ? "กรดเด่น" : "เบสเด่น"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 xl:col-span-4">
                  <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
                    <BookOpen className="h-4.5 w-4.5 text-cyan-600" />
                    ทฤษฎีและสมการ
                  </h3>
                  <div className="flex flex-1 flex-col justify-between gap-2">
                    <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 text-center font-mono text-2xl font-black text-slate-800">
                      M<sub>a</sub>V<sub>a</sub> = M<sub>b</sub>V<sub>b</sub>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">pH ปัจจุบัน: <b className="text-cyan-700">{currentPH.toFixed(2)}</b></span>
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">เวลา: <b className="text-slate-800">{timeLabel}</b></span>
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">เติมแล้ว: <b className="text-blue-700">{addedVolume.toFixed(1)} ml</b></span>
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">ความคืบหน้า: <b className="text-emerald-700">{progress.toFixed(0)}%</b></span>
                    </div>
                  </div>
                </section>
              </div>

              <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["เตรียมสาร", FlaskConical],
                  ["ตั้งบิวเรต", Droplets],
                  ["เริ่มหยด", Play],
                  ["อ่าน pH", Gauge],
                  ["สรุปผล", CheckCircle2],
                ].map(([label, Icon], index) => {
                  const StepIcon = Icon as typeof FlaskConical;
                  return (
                    <div key={label as string} className="flex items-center gap-3 rounded-xl bg-slate-50/70 px-3">
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
                  {["เข้าใจจุดสมมูลของกรด-เบส", "อ่านค่า pH และปริมาตรบิวเรต", "วิเคราะห์กราฟไทเทรชัน", "คำนวณความเข้มข้นจากสมการ"].map((item) => (
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
                    <p className="text-xs font-bold text-slate-500">เติมสารมาตรฐานแล้ว</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{addedVolume.toFixed(1)} / {equivalenceVolume.toFixed(1)} ml</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  คำแนะนำในการทดลอง
                </h2>
                <ul className="space-y-2 text-xs font-semibold leading-relaxed text-slate-500">
                  {["ชะลอการหยดเมื่อ pH เริ่มเปลี่ยนเร็ว", "แกว่งขวดให้สารผสมกันทุกครั้ง", "สังเกตทั้งสีอินดิเคเตอร์และค่า pH", "บันทึกปริมาตรใกล้จุดสมมูลให้ละเอียด"].map((item) => (
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

