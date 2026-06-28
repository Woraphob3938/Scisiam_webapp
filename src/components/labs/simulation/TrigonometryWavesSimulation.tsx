"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Download,
  Clipboard,
  ClipboardList,
  Target,
  Trash,
  Volume2,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface WaveDataPoint {
  index: number;
  funcType: "Sin" | "Cos";
  amplitude: number;
  frequency: number;
  phase: number;
  resonanceScore: number;
}

export default function TrigonometryWavesSimulation() {
  const router = useRouter();
  const labId = "trigonometry-waves";

  // Wave configurations
  const [funcType, setFuncType] = useState<"Sin" | "Cos">("Sin");
  const [amplitude, setAmplitude] = useState<number>(2.0); // 0.5 - 4.0
  const [frequency, setFrequency] = useState<number>(1.5); // 0.5 - 5.0 Hz
  const [phase, setPhase] = useState<number>(0); // -180 to 180 degrees

  const [isRunning, setIsRunning] = useState(true);
  const [time, setTime] = useState(0);

  // Target values to match for the quest
  const targetConfig = useMemo(() => ({
    funcType: "Sin" as const,
    amplitude: 3.0,
    frequency: 2.0,
    phase: 90,
  }), []);

  // Compute closeness (resonance) score
  const resonanceScore = useMemo(() => {
    if (funcType !== targetConfig.funcType) return 0;
    const ampDiff = Math.abs(amplitude - targetConfig.amplitude) / 3.5; // norm range
    const freqDiff = Math.abs(frequency - targetConfig.frequency) / 4.5;
    const phaseDiff = Math.abs(phase - targetConfig.phase) / 360;

    const totalDiff = (ampDiff + freqDiff + phaseDiff) / 3;
    const score = Math.max(0, Math.min(100, Math.round((1 - totalDiff) * 100)));
    return score;
  }, [funcType, amplitude, frequency, phase, targetConfig]);

  const questSuccess = resonanceScore >= 98;

  // History logs
  const [dataPoints, setDataPoints] = useState<WaveDataPoint[]>([]);

  // Refs for loop
  const isRunningRef = useRef(isRunning);
  const timeRef = useRef(time);
  const announcedQuestRef = useRef(false);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { timeRef.current = time; }, [time]);

  // Handle continuous wave oscillation
  useEffect(() => {
    let animationFrameId: number;

    const updatePhysics = () => {
      if (isRunningRef.current) {
        // dt is approx 0.016s (60fps)
        const nextTime = timeRef.current + 0.035;
        setTime(nextTime);
        timeRef.current = nextTime;
      }
      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Check quest completion when parameters shift
  useEffect(() => {
    if (resonanceScore >= 98 && !announcedQuestRef.current) {
      announcedQuestRef.current = true;
      alert("🎉 ยินดีด้วย! คุณสามารถปรับแต่งคลื่น Sine ให้กำทอน (Resonance) ได้ตรงกับคลื่นเป้าหมายสำเร็จ!");
    }

    if (resonanceScore < 98) {
      announcedQuestRef.current = false;
    }
  }, [resonanceScore]);

  const handleStartStop = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(true);
    setFuncType("Sin");
    setAmplitude(2.0);
    setFrequency(1.5);
    setPhase(0);
    setTime(0);
    announcedQuestRef.current = false;
    setDataPoints([]);
  };

  const handleAddPoint = () => {
    setDataPoints((prev) => [
      ...prev,
      {
        index: prev.length + 1,
        funcType,
        amplitude,
        frequency,
        phase,
        resonanceScore,
      },
    ]);
  };

  const handleClearPoint = (idx: number) => {
    setDataPoints((prev) =>
      prev.filter((p) => p.index !== idx).map((p, i) => ({ ...p, index: i + 1 }))
    );
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    const headers = "จุดบันทึก,ประเภท,แอมพลิจูด (A),ความถี่ (Hz),เฟส (องศา),ความสอดคล้อง (%)\n";
    const rows = dataPoints
      .map((p) => `${p.index},${p.funcType === "Sin" ? "Sine" : "Cosine"},${p.amplitude},${p.frequency},${p.phase},${p.resonanceScore}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scisiam_trigonometry_waves.csv");
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
      .map(
        (p) =>
          `จุดที่ ${p.index} | ฟังก์ชัน: ${p.funcType} | แอมพลิจูด: ${p.amplitude} | ความถี่: ${p.frequency} Hz | เฟส: ${p.phase}° | ความสอดคล้อง: ${p.resonanceScore}%`
      )
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"));
  };

  const handleSaveResults = async () => {
    if (dataPoints.length === 0) {
      alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล!");
      return;
    }
    const experimentData = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      funcType,
      amplitude,
      frequency,
      phase,
      dataPoints,
    };
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_trig_experiment",
      localPayload: experimentData,
      labId,
      title: "Trigonometry & Waves",
      variables: { funcType, amplitude, frequency, phase },
      liveValues: { time, resonanceScore, questSuccess },
      graphPoints: dataPoints,
      tableRows: dataPoints,
      summary: {
        resonanceScore,
        questSuccess,
        dataPointCount: dataPoints.length,
      },
      score: questSuccess ? 100 : Math.min(90, dataPoints.length * 20),
      durationSeconds: Math.round(time),
    });
    alert("บันทึกข้อมูลการทดลองสำเร็จ! 🎉");
    router.push(`/labs/${labId}`);
  };

  // Wave rendering calculations
  // Unit circle center coordinates
  const circleCenterX = 55;
  const circleCenterY = 90;
  const circleRadius = 32;

  // Running angle calculation (radians)
  const currentTheta = (time * frequency) % (2 * Math.PI);
  const phaseRad = (phase * Math.PI) / 180;

  // Project unit circle coordinates
  const targetX = circleCenterX + circleRadius * Math.cos(currentTheta + phaseRad);
  // Y coordinate is inverted in SVG
  const targetY = circleCenterY - circleRadius * (funcType === "Sin" ? Math.sin(currentTheta + phaseRad) : Math.cos(currentTheta + phaseRad));

  // Oscilloscope wave path
  const wavePath = useMemo(() => {
    const points = [];
    const scopeStartX = 120;
    const scopeEndX = 290;
    const amplitudePx = amplitude * 8.5; // pixel scalar for A

    for (let x = scopeStartX; x <= scopeEndX; x++) {
      // Calculate phase angle for each horizontal pixel
      const angle = ((x - scopeStartX) / 40) * Math.PI * frequency - time * frequency + phaseRad;
      const yVal = funcType === "Sin" ? Math.sin(angle) : Math.cos(angle);
      const y = circleCenterY - yVal * amplitudePx;
      points.push(`${x === scopeStartX ? "M" : "L"}${x},${y}`);
    }
    return points.join(" ");
  }, [amplitude, frequency, phaseRad, funcType, time]);

  // Target wave path (oscilloscope outline reference)
  const targetWavePath = useMemo(() => {
    const points = [];
    const scopeStartX = 120;
    const scopeEndX = 290;
    const amplitudePx = targetConfig.amplitude * 8.5;
    const targetPhaseRad = (targetConfig.phase * Math.PI) / 180;

    for (let x = scopeStartX; x <= scopeEndX; x++) {
      const angle = ((x - scopeStartX) / 40) * Math.PI * targetConfig.frequency - time * targetConfig.frequency + targetPhaseRad;
      const yVal = Math.sin(angle);
      const y = circleCenterY - yVal * amplitudePx;
      points.push(`${x === scopeStartX ? "M" : "L"}${x},${y}`);
    }
    return points.join(" ");
  }, [targetConfig, time]);

  return (
    <SharedSimulationShell
      accent="violet"
      labId={labId}
      category="Mathematics"
      title="Trigonometry & Waves"
      subtitle="ศึกษาฟังก์ชันตรีโกณมิติเชื่อมโยงกับการแผ่ของคลื่น ปรับค่าแอมพลิจูด ความถี่ และเฟส เพื่อดูการสั่นพ้อง"
      statusLabel={isRunning ? "คลื่นกำลังแกว่งตัว" : "หยุดนิ่งชั่วคราว"}
      icon={Volume2}
      sceneTitle="วิชวลการหมุนวงกลมหนึ่งหน่วยและออสซิลโลสโคป"
      scene={
        <div className="relative flex h-full min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eefcff_48%,#fff7fb_100%)] p-4 select-none">
          {/* Tech Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-45" />

          {/* Environmental info overlay card */}
          <div className="absolute left-5 top-5 rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-left shadow-sm backdrop-blur-md z-10">
            <p className="text-[9px] font-black uppercase tracking-wider text-violet-650">wave function</p>
            <p className="font-mono text-xs font-black text-slate-700">
              y = {amplitude.toFixed(1)} {funcType === "Sin" ? "sin" : "cos"}({frequency.toFixed(1)}t {phase >= 0 ? "+" : ""}{phase}°)
            </p>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">
              ความใกล้เคียงเป้าหมาย: <b className="text-violet-650 font-black">{resonanceScore}%</b>
            </p>
          </div>

          {/* SVG stage container */}
          <svg className="relative z-10 w-full max-w-[420px] h-52" viewBox="0 0 320 180">
            <defs>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#4f46e5" floodOpacity="0.08" />
              </filter>
            </defs>

            {/* Stage backdrop panels */}
            <rect x="15" y="10" width="290" height="160" rx="20" fill="#ffffff" stroke="#ddd6fe" strokeWidth="2.2" filter="url(#shadow)" />
            <rect x="23" y="18" width="274" height="144" rx="14" fill="#faf5ff" />

            {/* LEFT ZONE: Unit Circle */}
            <g>
              {/* Outer compass grid */}
              <circle cx={circleCenterX} cy={circleCenterY} r={circleRadius} fill="none" stroke="#ddd6fe" strokeWidth="1.2" strokeDasharray="3 2" />

              {/* X & Y Axes */}
              <line x1={circleCenterX - circleRadius - 5} y1={circleCenterY} x2={circleCenterX + circleRadius + 5} y2={circleCenterY} stroke="#cbd5e1" strokeWidth="1" />
              <line x1={circleCenterX} y1={circleCenterY - circleRadius - 5} x2={circleCenterX} y2={circleCenterY + circleRadius + 5} stroke="#cbd5e1" strokeWidth="1" />

              {/* Radius pointer line */}
              <line x1={circleCenterX} y1={circleCenterY} x2={targetX} y2={targetY} stroke="#7c3aed" strokeWidth="2" />

              {/* Projections to axes */}
              <line x1={targetX} y1={targetY} x2={targetX} y2={circleCenterY} stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
              <line x1={targetX} y1={targetY} x2={circleCenterX} y2={targetY} stroke="#db2777" strokeWidth="1" strokeDasharray="2 2" />

              {/* Angle Sweeper Arc */}
              <path d={`M ${circleCenterX + 8} ${circleCenterY} A 8 8 0 0 0 ${circleCenterX + 8 * Math.cos(currentTheta)} ${circleCenterY - 8 * Math.sin(currentTheta)}`} fill="none" stroke="#ca8a04" strokeWidth="1.2" />

              {/* Point on Circle */}
              <circle cx={targetX} cy={targetY} r="4" fill="#7c3aed" />
            </g>

            {/* Connecting projection line from circle point to oscilloscope entry */}
            <line x1={targetX} y1={targetY} x2="120" y2={targetY} stroke="#c084fc" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />

            {/* RIGHT ZONE: Oscilloscope grid screen */}
            <g>
              <rect x="116" y="28" width="176" height="124" rx="10" fill="#020617" />
              {/* Scope center horizontal grid line */}
              <line x1="116" y1={circleCenterY} x2="292" y2={circleCenterY} stroke="#1e293b" strokeWidth="1.2" strokeDasharray="4 4" />

              {/* Target Wave outline (ghost wave target) */}
              <path d={targetWavePath} stroke="#ca8a04" strokeWidth="1.2" fill="none" opacity="0.45" strokeDasharray="2 2" />

              {/* Current running wave path */}
              <path d={wavePath} stroke="#c084fc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

              {/* Bouncing speaker pulse at wave output */}
              <g transform="translate(298, 90)">
                <rect x="-3" y="-12" width="6" height="24" rx="1" fill="#475569" />
                <path d="M 3 -8 L 8 -12 L 8 12 L 3 8 Z" fill="#334155" />

                {/* Speaker soundwave arcs dynamically sizing with amplitude */}
                {isRunning && amplitude > 1.0 && (
                  <path d={`M 11 -5 A 6 6 0 0 1 11 5`} stroke="#475569" strokeWidth="1.2" fill="none" className="animate-pulse" />
                )}
                {isRunning && amplitude > 2.5 && (
                  <path d={`M 15 -8 A 10 10 0 0 1 15 8`} stroke="#475569" strokeWidth="1.2" fill="none" className="animate-pulse" />
                )}
              </g>
            </g>
          </svg>
        </div>
      }
      controlsTitle="แผงควบคุมแอมพลิจูดและความถี่"
      controls={
        <div className="space-y-4">
          {/* Function choice */}
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-black text-slate-500 block mb-1.5">ฟังก์ชันคลื่นตรีโกณมิติ</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFuncType("Sin")}
                className={`py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                  funcType === "Sin"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-655 hover:bg-slate-50"
                }`}
              >
                ไซน์ (Sine)
              </button>
              <button
                type="button"
                onClick={() => setFuncType("Cos")}
                className={`py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                  funcType === "Cos"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-655 hover:bg-slate-50"
                }`}
              >
                โคไซน์ (Cosine)
              </button>
            </div>
          </div>

          {/* Amplitude Slider */}
          <div className="group bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-[11px] font-bold mb-1">
              <span className="text-slate-500">แอมพลิจูด (Amplitude - A)</span>
              <span className="text-violet-650 font-black">{amplitude.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
              className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
          </div>

          {/* Frequency Slider */}
          <div className="group bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-[11px] font-bold mb-1">
              <span className="text-slate-500">ความถี่ (Frequency - f)</span>
              <span className="text-violet-650 font-black">{frequency.toFixed(2)} Hz</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
          </div>

          {/* Phase Offset Slider */}
          <div className="group bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-[11px] font-bold mb-1">
              <span className="text-slate-500">เฟสเริ่มต้น (Phase Offset - φ)</span>
              <span className="text-violet-650 font-black">{phase}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="10"
              value={phase}
              onChange={(e) => setPhase(Number(e.target.value))}
              className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={handleStartStop}
              className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${
                isRunning ? "bg-slate-700" : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
              {isRunning ? "หยุดเคลื่อนที่" : "เริ่มแกว่งคลื่น"}
            </button>
            <button
              onClick={handleAddPoint}
              className="inline-flex items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-xs font-black text-violet-700 hover:bg-violet-100 cursor-pointer"
            >
              บันทึกจุด
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-650 hover:bg-slate-50 cursor-pointer"
              aria-label="รีเซ็ตค่า"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
      compactControls={
        <div className="grid grid-cols-3 gap-2.5">
          <ManualNumberInput
            label="แอมพลิจูด A"
            ariaLabel="แอมพลิจูด"
            value={amplitude}
            min={0.5}
            max={4.0}
            step={0.1}
            tone="violet"
            onChange={setAmplitude}
          />
          <ManualNumberInput
            label="ความถี่ f (Hz)"
            ariaLabel="ความถี่"
            value={frequency}
            min={0.5}
            max={5.0}
            step={0.1}
            tone="violet"
            onChange={setFrequency}
          />
          <ManualNumberInput
            label="เฟส φ (องศา)"
            ariaLabel="เฟสเริ่มต้น"
            value={phase}
            min={-180}
            max={180}
            step={10}
            tone="violet"
            onChange={setPhase}
          />
        </div>
      }
      metrics={[
        { label: "ความยาวคลื่น λ", value: `${(2 / frequency).toFixed(2)} m`, tone: "violet" },
        { label: "คาบเวลา T", value: `${(1 / frequency).toFixed(2)} s`, tone: "cyan" },
        { label: "ความใกล้เคียง", value: `${resonanceScore}%`, tone: "emerald" },
        { label: "กำทอนคลื่น", value: questSuccess ? "สำเร็จ 🎉" : "ปรับแต่งคลื่น", tone: questSuccess ? "emerald" : "orange" },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-600" />
              สมการเป้าหมายทัศนคติกำทอน (Target Wave)
            </h3>
          </div>
          <div className="flex-grow rounded-xl bg-slate-950 p-4 flex flex-col justify-between min-h-[174px]">
            <div className="space-y-4 py-2 text-xs font-mono text-slate-350">
              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-bold">ฟังก์ชันเป้าหมาย:</span>
                <span className="text-white font-extrabold">Sine Wave (ไซน์)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-bold">แอมพลิจูด (A):</span>
                <span className="text-white font-extrabold">{targetConfig.amplitude.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-bold">ความถี่ (f):</span>
                <span className="text-white font-extrabold">{targetConfig.frequency.toFixed(1)} Hz</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-bold">เฟสเริ่มต้น (φ):</span>
                <span className="text-white font-extrabold">{targetConfig.phase}°</span>
              </div>
            </div>
            <div className="border-t border-slate-900 pt-2 text-[10px] text-amber-500 font-bold text-center">
              หมุนปุ่มแอมพลิจูดเป็น 3.0, ความถี่เป็น 2.0 Hz และเฟสเป็น 90 องศาเพื่อสั่นพ้อง!
            </div>
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <ClipboardList className="h-4.5 w-4.5 text-violet-600" />
              ตารางบันทึกคลื่นความถี่
            </h3>
            <div className="flex gap-2">
              <button onClick={handleCopyData} className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <Clipboard className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleExportCSV} className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-violet-50/70 text-[11px] font-black text-violet-850">
                <tr>
                  <th className="px-3 py-2">จุด</th>
                  <th className="px-3 py-2">ฟังก์ชัน</th>
                  <th className="px-3 py-2">แอมพลิจูด</th>
                  <th className="px-3 py-2">ความถี่ f</th>
                  <th className="px-3 py-2">เฟส φ</th>
                  <th className="px-3 py-2 text-center">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                {dataPoints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">ยังไม่มีข้อมูลบันทึก</td>
                  </tr>
                ) : (
                  dataPoints.map((point) => (
                    <tr key={point.index} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-mono">#{point.index}</td>
                      <td className="px-3 py-2">{point.funcType === "Sin" ? "Sine" : "Cosine"}</td>
                      <td className="px-3 py-2 font-mono text-blue-600">{point.amplitude.toFixed(1)}</td>
                      <td className="px-3 py-2 font-mono text-emerald-600">{point.frequency.toFixed(1)} Hz</td>
                      <td className="px-3 py-2 font-mono text-amber-600">{point.phase}°</td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => handleClearPoint(point.index)} className="text-red-500 hover:text-red-700 p-1">
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
          <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
            <Sliders className="h-4.5 w-4.5 text-violet-600" />
            สมการคลื่นคาบการสั่น (Wave Harmonic Equation)
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3 text-xs leading-relaxed text-slate-500">
            <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-center text-lg font-black text-slate-800 font-mono">
              y(t) = A sin(2πft + φ)
            </div>
            <p className="font-semibold">
              คลื่นแบบฮาร์มอนิกอย่างง่าย อธิบายการแทนค่าขจัด $y$ ของคลื่น ณ ตนเองและเวลา โดยมี $A$ แทนแอมพลิจูด (ความสูงคลื่นสูงสุด) $f$ แทนความถี่ (รอบต่อวินาที) และ $\phi$ แทนมุมเฟสเริ่มต้น ณ เวลาศูนย์
            </p>
            <p className="font-semibold border-t border-slate-100 pt-2">
              วงกลมหนึ่งหน่วย (Unit Circle) แสดงค่าความสูงโปรเจกต์ชันทางแนวตั้งเป็นฟังก์ชัน Sine และความต่างแนวขวางเป็นฟังก์ชัน Cosine ตามการเดินทางของมุมรอบวงกลม
            </p>
          </div>
        </section>
      }
      steps={[
        { label: "เลือก Sine หรือ Cosine", icon: Sliders },
        { label: "ปรับแอมพลิจูด (ความสูงคลื่น)", icon: Sliders },
        { label: "ปรับความถี่ (ความชันความถี่)", icon: Sliders },
        { label: "หมุนเฟสเพื่อเปลี่ยนจุดเริ่ม", icon: Sliders },
        { label: "บันทึกและสั่นพ้องกับเป้าหมาย", icon: Target },
      ]}
      learningGoals={[
        "ทำความเข้าใจผลกระทบของแอมพลิจูด ความถี่ และเฟสที่มีต่อโครงสร้างคลื่น",
        "เชื่อมโยงมุมการหมุนบนวงกลมหนึ่งหน่วยเข้ากับคาบการเดินทางของฟังก์ชันคลื่น",
        "เรียนรู้ความหมายทางคณิตศาสตร์ของความยาวคลื่น คาบเวลา และความถี่",
        "ประยุกต์ความรู้ฟังก์ชันตรีโกณมิติในการอธิบายคลื่นเสียงและคลื่นแสง",
      ]}
      progressLabel="ระดับการกำทอนพ้องฟิวชันเป้าหมาย (เป้าหมาย ≥ 98%)"
      progressValue={`${resonanceScore}%`}
      progressPercent={resonanceScore}
      tips={[
        "ภารกิจ: สัญญาณ Sine ให้ตรงกับเป้าหมาย (แอมพลิจูด = 3.0, ความถี่ = 2.0 Hz, เฟส = 90 องศา) เพื่อทำการกระตุ้นการสั่นพ้องเต็มพิกัด",
        "สังเกตว่าคลื่นไซน์และโคไซน์เบี่ยงเบนกันเพียงมุมเฟส 90 องศาเท่านั้น",
      ]}
      onSave={handleSaveResults}
    />
  );
}
