"use client";

import React, {
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  Sliders,
  RotateCcw,
  Clipboard,
  ClipboardList,
  Download,
  Trash,
  Target,
  Sparkles,
  LineChart,
  Layers,
  Play,
  Pause,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

// Signal presets
const SIGNAL_TYPES = [
  { label: "คลื่นสี่เหลี่ยม (Square Wave)", type: "square" },
  { label: "คลื่นสามเหลี่ยม (Triangle Wave)", type: "triangle" },
  { label: "คลื่นฟันเลื่อย (Sawtooth Wave)", type: "sawtooth" },
] as const;

interface LoggedFourierRun {
  index: number;
  signalType: string;
  harmonics: number;
  fundamentalFreq: number;
  amplitude: number;
  rmse: number;
  thd: number;
}

export default function FourierAnalysisSimulation() {
  const labId = "fourier-analysis-signals";

  const [signalIdx, setSignalIdx] = useState(0);
  const [harmonicsCount, setHarmonicsCount] = useState<number>(4); // number of active harmonic terms
  const [fundamentalFreq, setFundamentalFreq] = useState<number>(1.0); // f0 in Hz
  const [amplitude, setAmplitude] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);

  const [loggedRuns, setLoggedRuns] = useState<LoggedFourierRun[]>([]);

  const signal = SIGNAL_TYPES[signalIdx];

  // RequestAnimationFrame loop for phasor rotation time-progression
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    const tick = () => {
      setTime((prev) => (prev + 0.05) % (2 * Math.PI));
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Compute harmonic amplitudes for spectrum & drawing circles
  // For Square wave: An = (4*Amp) / (n*pi) for n = 1, 3, 5, 7, ...
  // For Triangle wave: An = (8*Amp) / (n^2 * pi^2) with alternating signs for n = 1, 3, 5, 7, ...
  // For Sawtooth wave: An = (2*Amp) / (n*pi) with alternating signs for n = 1, 2, 3, 4, ...
  const harmonicComponents = useMemo(() => {
    const list = [];
    const maxTerms = 10;

    for (let i = 1; i <= maxTerms; i++) {
      let termNum = i;
      let amp = 0;
      let active = false;

      if (signal.type === "square") {
        termNum = 2 * i - 1; // odd harmonics
        amp = (4 * amplitude) / (termNum * Math.PI);
        active = i <= harmonicsCount;
      } else if (signal.type === "triangle") {
        termNum = 2 * i - 1; // odd harmonics
        amp = (8 * amplitude) / (termNum * termNum * Math.PI * Math.PI);
        active = i <= harmonicsCount;
      } else if (signal.type === "sawtooth") {
        termNum = i; // all harmonics
        amp = (2 * amplitude) / (termNum * Math.PI);
        active = i <= harmonicsCount;
      }

      list.push({ n: termNum, amplitude: amp, active });
    }
    return list;
  }, [signal, harmonicsCount, amplitude]);

  // Calculate coordinates for Epicycles (circles drawn on top of each other)
  const phasorCircles = useMemo(() => {
    const list = [];
    let startX = 100;
    let startY = 150;

    for (const comp of harmonicComponents) {
      if (!comp.active) continue;

      // Phase calculation based on time and frequency
      const phase = comp.n * fundamentalFreq * time;

      // Let's alternate phase signs depending on sawtooth/triangle properties to match standard Fourier series sign alternates
      let actualPhase = phase;
      if (signal.type === "sawtooth") {
        actualPhase = comp.n % 2 === 0 ? -phase : phase;
      } else if (signal.type === "triangle") {
        // Triangle wave alternating sign is sin(nx)*(-1)^((n-1)/2)
        const sign = Math.round((comp.n - 1) / 2) % 2 === 0 ? 1 : -1;
        if (sign === -1) {
          actualPhase = phase + Math.PI;
        }
      }

      const dx = comp.amplitude * Math.cos(actualPhase);
      const dy = comp.amplitude * Math.sin(actualPhase);
      const endX = startX + dx;
      const endY = startY + dy;

      list.push({
        cx: startX,
        cy: startY,
        r: comp.amplitude,
        endX,
        endY,
      });

      startX = endX;
      startY = endY;
    }
    return { circles: list, finalPt: { x: startX, y: startY } };
  }, [harmonicComponents, fundamentalFreq, time, signal]);

  // Calculate approximation error (RMSE) and THD
  const rmse = useMemo(() => {
    // Standard analytic RMSE calculation depending on harmonics count
    // A square wave has total energy Amp^2 * pi^2 / 8. Approximations capture energy = Sum(An^2)/2
    const totalEnergy = signal.type === "square" ? (amplitude * amplitude * Math.PI * Math.PI) / 8
                      : signal.type === "triangle" ? (amplitude * amplitude) / 3 // simplified approx energy
                      : (amplitude * amplitude) / 3;

    let approxEnergy = 0;
    for (const comp of harmonicComponents) {
      if (comp.active) {
        approxEnergy += (comp.amplitude * comp.amplitude) / 2;
      }
    }
    return Math.sqrt(Math.max(0, totalEnergy - approxEnergy)) * 0.1;
  }, [harmonicComponents, signal, amplitude]);

  const thd = useMemo(() => {
    // Total Harmonic Distortion = sqrt(Sum(An^2 for n > 1)) / A1
    let num = 0;
    const a1 = harmonicComponents[0].amplitude;
    if (a1 === 0) return 0;
    for (let i = 1; i < harmonicComponents.length; i++) {
      const comp = harmonicComponents[i];
      if (comp.active) {
        num += comp.amplitude * comp.amplitude;
      }
    }
    return (Math.sqrt(num) / a1) * 100;
  }, [harmonicComponents]);

  // Build moving wave history coordinates for display
  const [waveHistory, setWaveHistory] = useState<{ t: number; y: number }[]>([]);

  useEffect(() => {
    const finalY = phasorCircles.finalPt.y;
    const timer = window.setTimeout(() => {
      setWaveHistory((prev) => [{ t: time, y: finalY }, ...prev].slice(0, 100));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [time, phasorCircles.finalPt.y]);

  const timeWavePath = useMemo(() => {
    const pts = waveHistory.map((pt, idx) => {
      // Map index to visual x coordinate to slide the wave to the right
      const x = 200 + idx * 2.2;
      return `${x},${pt.y}`;
    });
    return pts.join(" ");
  }, [waveHistory]);

  const questProgress = useMemo(() => {
    let p = 0;
    if (loggedRuns.length >= 1) p += 30;
    // Condition 1: Increase harmonics count to reduce RMSE
    if (harmonicsCount >= 8) p += 40;
    // Condition 2: Adjust waves to analyze square vs triangle properties
    if (loggedRuns.some((r) => r.signalType === "triangle") && loggedRuns.some((r) => r.signalType === "square")) p += 30;
    return Math.min(100, p);
  }, [harmonicsCount, loggedRuns]);

  const handleAddLog = () => {
    const run: LoggedFourierRun = {
      index: loggedRuns.length + 1,
      signalType: signal.label,
      harmonics: harmonicsCount,
      fundamentalFreq,
      amplitude,
      rmse,
      thd,
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setHarmonicsCount(4);
    setFundamentalFreq(1.0);
    setAmplitude(100);
    setLoggedRuns([]);
    setWaveHistory([]);
  };

  const handleCopyData = () => {
    const header = "ชุด\tประเภทคลื่น\tHarmonics\tความถี่หลัก (Hz)\tแอมพลิจูด\tRMSE\tTHD (%)\n";
    const rows = loggedRuns.map(
      (r) => `${r.index}\t${r.signalType}\t${r.harmonics}\t${r.fundamentalFreq.toFixed(2)}\t${r.amplitude.toFixed(1)}\t${r.rmse.toFixed(4)}\t${r.thd.toFixed(2)}`
    );
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map(
      (r) => `${r.index},${r.signalType},${r.harmonics},${r.fundamentalFreq},${r.amplitude},${r.rmse},${r.thd}`
    );
    const csv = "data:text/csv;charset=utf-8," + ["Index,SignalType,Harmonics,Frequency,Amplitude,RMSE,THD", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "fourier_analysis_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    if (loggedRuns.length === 0) {
      alert("กรุณากดบันทึกผลการจำลองอย่างน้อย 1 ครั้งก่อนบันทึกรายงาน");
      return;
    }
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_fourier_analysis_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "Fourier Analysis & Signals",
      variables: { signalIdx, harmonicsCount, fundamentalFreq, amplitude },
      liveValues: { rmse, thd },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.harmonics, y: r.rmse })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, minRMSE: Math.min(...loggedRuns.map((r) => r.rmse)) },
      score: Math.min(100, Math.max(40, 40 + questProgress * 0.6)),
      durationSeconds: null,
    });
    alert("บันทึกผลการทดลองวิเคราะห์สัญญาณฟูเรียร์สำเร็จ");
  };

  return (
    <SharedSimulationShell
      accent="rose"
      labId={labId}
      category="Mathematics"
      title="Fourier Analysis & Signals"
      subtitle="วิเคราะห์คลื่นและสัญญาณคาบเวลาโดยการแจกแจงฮาร์มอนิกด้วยอนุกรมฟูเรียร์ ดูเฟสเซอร์และสเปกตรัมของคลื่น"
      statusLabel={`${signal.label} | ${harmonicsCount} Harmonics | RMSE = ${rmse.toFixed(3)}`}
      icon={LineChart}
      sceneTitle="Fourier Series Epicycles Visualization"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-rose-100 bg-[linear-gradient(135deg,#fff8f8_0%,#fff1f2_48%,#fff7f6_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />

          {/* Preset selector tabs */}
          <div className="relative z-10 mb-3 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans overflow-x-auto">
            {SIGNAL_TYPES.map((sig, idx) => (
              <button
                key={sig.type}
                onClick={() => { setSignalIdx(idx); handleReset(); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all whitespace-nowrap ${
                  signalIdx === idx ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {sig.label}
              </button>
            ))}
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            <svg viewBox="0 0 480 300" className="w-full max-w-[480px] h-auto overflow-visible">
              <line x1="200" y1="150" x2="440" y2="150" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />

              {/* Rotating circles */}
              {phasorCircles.circles.map((circle, idx) => (
                <circle
                  key={idx}
                  cx={circle.cx}
                  cy={circle.cy}
                  r={circle.r}
                  fill="none"
                  stroke="#fda4af"
                  strokeWidth="0.8"
                  opacity="0.6"
                />
              ))}

              {/* Phasor linkages */}
              {phasorCircles.circles.map((circle, idx) => (
                <line
                  key={`line-${idx}`}
                  x1={circle.cx}
                  y1={circle.cy}
                  x2={circle.endX}
                  y2={circle.endY}
                  stroke="#be123c"
                  strokeWidth="1.2"
                />
              ))}

              {/* Moving wave curve */}
              {timeWavePath && (
                <polyline
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  points={timeWavePath}
                />
              )}

              {/* Guide line from epicycle tip to wave start */}
              {phasorCircles.circles.length > 0 && (
                <line
                  x1={phasorCircles.finalPt.x}
                  y1={phasorCircles.finalPt.y}
                  x2="200"
                  y2={phasorCircles.finalPt.y}
                  stroke="#e11d48"
                  strokeWidth="1"
                  strokeDasharray="4,2"
                  opacity="0.75"
                />
              )}

              {/* Trace dot at the wave front */}
              <circle
                cx="200"
                cy={phasorCircles.finalPt.y}
                r="4.5"
                fill="#f43f5e"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      }
      controlsTitle="ควบคุมพารามิเตอร์คลื่นสัญญาณ"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-rose-500" />
              ปัจจัยอนุกรมฟูเรียร์ (Fourier Factors)
            </h3>
            <ManualNumberInput
              label="จำนวนฮาร์มอนิกที่วิเคราะห์ (Harmonics)"
              ariaLabel="จำนวนฮาร์มอนิก"
              value={harmonicsCount}
              min={1}
              max={10}
              step={1}
              onChange={(v) => setHarmonicsCount(Math.round(v))}
              tone="pink"
            />
            <ManualNumberInput
              label="ความถี่มูลฐาน f₀ (Hz)"
              ariaLabel="ความถี่มูลฐาน f₀"
              value={fundamentalFreq}
              min={0.2}
              max={3.0}
              step={0.1}
              onChange={setFundamentalFreq}
              tone="pink"
            />
            <ManualNumberInput
              label="ขนาดแอมพลิจูดสัญญาณ (Amplitude)"
              ariaLabel="ขนาดแอมพลิจูด"
              value={amplitude}
              min={30}
              max={120}
              step={5}
              onChange={setAmplitude}
              tone="orange"
            />
          </section>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold shadow-sm transition-all active:scale-97 cursor-pointer ${
                isPlaying ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isPlaying ? "หยุดเคลื่อนที่" : "เล่นต่อเนื่อง"}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2.5 text-xs font-bold text-rose-700 shadow-sm transition-all hover:bg-rose-50 active:scale-97 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              รีเซ็ตสัญญาณ
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-97 cursor-pointer"
            >
              <ClipboardList className="h-3.5 w-3.5 text-rose-500" />
              บันทึกสเปกตรัม
            </button>
            <button
              onClick={handleSaveResults}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/10 transition-all hover:from-rose-700 hover:to-red-700 active:scale-97 cursor-pointer"
            >
              ส่งออกรายงาน
            </button>
          </div>
        </div>
      }
      compactControls={
        <div className="flex items-center gap-2 font-sans flex-wrap">
          <ManualNumberInput label="Harmonics" ariaLabel="ฮาร์มอนิก" value={harmonicsCount} min={1} max={10} step={1} onChange={(v) => setHarmonicsCount(Math.round(v))} tone="pink" />
          <button onClick={() => setIsPlaying(!isPlaying)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600">
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      }
      metrics={[
        { label: "จำนวนฮาร์มอนิกสูงสุด", value: `${harmonicsCount} เทอม`, tone: "rose" },
        { label: "ความถี่ฮาร์มอนิกที่ 1", value: `${fundamentalFreq.toFixed(2)} Hz`, tone: "rose" },
        { label: "ค่าความเพี้ยน THD", value: `${thd.toFixed(1)}%`, tone: "orange" },
        { label: "ค่า RMSE ล่าสุด", value: rmse.toFixed(4), tone: undefined },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-rose-600" />
              Spectrum แอมพลิจูดความถี่ (Frequency Spectrum)
            </h3>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <svg viewBox="0 0 400 200" className="w-full max-w-[400px] h-auto">
              <line x1="40" y1="160" x2="360" y2="160" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="40" y1="20" x2="40" y2="160" stroke="#cbd5e1" strokeWidth="1" />
              <text x="200" y="185" fill="#64748b" fontSize="8.5" fontWeight="bold" textAnchor="middle">ฮาร์มอนิกลำดับที่ (n)</text>
              <text x="14" y="90" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle" transform="rotate(-90,14,90)">แอมพลิจูด An</text>

              {harmonicComponents.map((comp, idx) => {
                const bw = 16;
                const bx = 60 + idx * 28;
                const bh = (comp.amplitude / amplitude) * 110;
                return (
                  <g key={idx}>
                    <rect
                      x={bx}
                      y={160 - bh}
                      width={bw}
                      height={bh}
                      rx="2"
                      fill={comp.active ? "#f43f5e" : "#e2e8f0"}
                      opacity={comp.active ? "0.85" : "0.5"}
                    />
                    <text x={bx + bw / 2} y={172} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
                      {comp.n}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>
      }
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">การวิเคราะห์ฟูเรียร์ (Fourier Analysis)</p>
          <p className="mb-3">
            คือทฤษฎีทางคณิตศาสตร์ที่พิสูจน์ว่า ฟังก์ชันหรือสัญญาณคาบใดๆ สามารถแยกย่อย (Decompose) ออกเป็นผลรวมเชิงเส้นของคลื่นรูปไซน์ (Sine/Cosine Waves) ที่มีความถี่เป็นจำนวนเท่า (Harmonics) ของความถี่มูลฐานได้
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>Time vs Frequency Domain:</strong> แกนเวลามองสัญญาณเป็นความผันแปรตามนาที/วินาที ขณะที่แกนความถี่มองโครงสร้างภายในว่ามีสัญญาณย่อยใดซ่อนอยู่บ้าง
            </li>
            <li>
              <strong>Total Harmonic Distortion (THD):</strong> สัดส่วนเปรียบเทียบแอมพลิจูดความถี่คลื่นย่อยลำดับสูงเทียบกับคลื่นฐานแรก
            </li>
          </ul>
        </div>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                <ClipboardList className="h-4.5 w-4.5 text-rose-500" />
                บันทึกสัญญาณคลื่นฮาร์มอนิก
              </h3>
              {loggedRuns.length > 0 && (
                <div className="flex items-center gap-2">
                  <button onClick={handleCopyData} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-slate-50">
                    <Clipboard className="h-3 w-3" /> คัดลอก
                  </button>
                  <button onClick={handleExportCSV} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-slate-50">
                    <Download className="h-3 w-3" /> CSV
                  </button>
                </div>
              )}
            </div>
            {loggedRuns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-slate-400">
                <Clipboard className="h-8 w-8 stroke-1 text-slate-300 mb-2" />
                ยังไม่มีการบันทึกข้อมูลการทดลอง
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-2.5 text-center">ชุดที่</th>
                      <th className="p-2.5">ประเภทสัญญาณ</th>
                      <th className="p-2.5">Harmonics</th>
                      <th className="p-2.5">ความถี่หลัก (Hz)</th>
                      <th className="p-2.5">แอมพลิจูด</th>
                      <th className="p-2.5">RMSE</th>
                      <th className="p-2.5 text-right">THD (%)</th>
                      <th className="p-2.5 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                    {loggedRuns.map((run) => (
                      <tr key={run.index} className="hover:bg-rose-50/20 transition-colors">
                        <td className="p-2 text-center font-bold">{run.index}</td>
                        <td className="p-2 font-sans">{run.signalType}</td>
                        <td className="p-2">{run.harmonics}</td>
                        <td className="p-2">{run.fundamentalFreq.toFixed(2)}</td>
                        <td className="p-2">{run.amplitude.toFixed(1)}</td>
                        <td className="p-2">{run.rmse.toFixed(4)}</td>
                        <td className="p-2 text-right font-bold text-slate-800">{run.thd.toFixed(2)}%</td>
                        <td className="p-2 text-center">
                          <button onClick={() => handleClearLog(run.index)} className="rounded p-1 text-rose-500 hover:bg-rose-50 transition-colors">
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
        "ทำความเข้าใจวิธีการแยกย่อยคลื่นซับซ้อนให้เป็นส่วนประกอบคลื่นไซน์ย่อยในโดเมนความถี่",
        "ศึกษาผลกระทบของการเพิ่มจำนวนฮาร์มอนิก (Harmonic terms) ต่อคุณภาพของสัญญาณสร้างใหม่ (Signal reconstruction)",
        "คำนวณและเปรียบเทียบค่าความผิดเพี้ยนฮาร์มอนิกรวม (THD) และค่า RMSE สำหรับคลื่นรูปแบบต่างๆ",
      ]}
      steps={[
        { label: "เลือกสไตล์ของคลื่นจำลองจากปุ่มแท็บด้านบน", icon: Layers },
        { label: "ปรับเพิ่ม-ลดจำนวนฮาร์มอนิก และดูวงกลมที่วาดประกอบสัญญาณ", icon: Sliders },
        { label: "ดูสเปกตรัมความถี่ด้านล่างเพื่อเปรียบเทียบแอมพลิจูดของแต่ละความถี่", icon: Target },
        { label: "กดหยุดหมุนเวกเตอร์ชั่วขณะเพื่ออ่านพิกัดความถี่เฉพาะจุด", icon: Play },
      ]}
      progressLabel="ความคืบหน้าวิเคราะห์ฟูเรียร์"
      progressValue={
        questProgress === 100
          ? "วิเคราะห์สัญญาณฟูเรียร์สำเร็จแล้ว"
          : questProgress >= 50
          ? "ผ่านเกณฑ์ขั้นต้น..."
          : "ยังไม่ผ่านเงื่อนไขกิจกรรม"
      }
      progressPercent={questProgress}
      tips={[
        "สังเกตว่าคลื่นสามเหลี่ยม (Triangle Wave) ลู่เข้าหาคลื่นเป้าหมายเร็วกว่าคลื่นสี่เหลี่ยมมาก เนื่องจากกำลังของฮาร์มอนิกตัวคูณลดลงแบบยกกำลังสอง n² ทำให้มี THD ต่ำกว่า",
        "สังเกตปรากฏการณ์ Gibbs (Gibbs Phenomenon) เป็นการกระเพื่อมปัดที่มุมแหลมของคลื่นสี่เหลี่ยม แม้จะเพิ่มจำนวนฮาร์มอนิกเป็นสิบเทอมก็ตาม",
      ]}
      onRun={() => setIsPlaying((current) => !current)}
      runLabel={isPlaying ? "หยุดทดลอง" : "ทดลอง"}
      runActive={isPlaying}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
