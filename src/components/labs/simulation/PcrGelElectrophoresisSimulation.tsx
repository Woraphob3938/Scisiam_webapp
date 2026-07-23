"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Sliders,
  RotateCcw,
  ClipboardList,
  Play,
  Layers,
  Thermometer,
  Zap,
  Sparkles,
  Clipboard,
  Download,
  Trash,
  Target,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedPcrRun {
  index: number;
  cycles: number;
  annealTemp: number;
  voltage: number;
  dnaYield: string; // scientific notation or formatted
  migDistance: number; // mm
  bandSize: number; // bp
}

export default function PcrGelElectrophoresisSimulation() {
  const labId = "pcr-gel-electrophoresis";

  const [activeTab, setActiveTab] = useState<"pcr" | "gel">("pcr");
  const [cycleCount, setCycleCount] = useState<number>(25);
  const [annealTemp, setAnnealTemp] = useState<number>(55);
  const [voltage, setVoltage] = useState<number>(100);

  // PCR Simulation Play State
  const [isPcrRunning, setIsPcrRunning] = useState<boolean>(false);
  const [pcrStep, setPcrStep] = useState<"idle" | "denature" | "anneal" | "extend">("idle");
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [pcrTemp, setPcrTemp] = useState<number>(25);

  // Electrophoresis State
  const [isGelRunning, setIsGelRunning] = useState<boolean>(false);
  const [gelTime, setGelTime] = useState<number>(0); // in simulated minutes (0-40)

  const [loggedRuns, setLoggedRuns] = useState<LoggedPcrRun[]>([]);

  // DNA yields calculation: N = N0 * (Efficiency)^cycles
  // efficiency decreases if annealing temperature is too far from 55°C (optimal)
  const pcrEfficiency = useMemo(() => {
    const dev = Math.abs(annealTemp - 55);
    return Math.max(1.1, 2.0 - dev * 0.05); // max 2.0 (doubling), decays if off-optimal
  }, [annealTemp]);

  const pcrYield = useMemo(() => {
    const yieldCount = 100 * Math.pow(pcrEfficiency, cycleCount);
    return yieldCount;
  }, [pcrEfficiency, cycleCount]);

  // DNA fragment migration rate on 1% Agarose:
  // Smaller fragments (e.g. target 500bp) move faster than larger ones (e.g. 2000bp)
  // Distance migrated = BaseSpeed * voltageScale * timeScale
  const sample1Distance = useMemo(() => {
    // Target band (500 bp) - relatively fast
    const baseSpeed = 1.6;
    const vScale = voltage / 100;
    return Math.min(80, gelTime * baseSpeed * vScale);
  }, [gelTime, voltage]);

  const ladderBands = [
    { size: 2000, speed: 0.5, label: "2000 bp" },
    { size: 1500, speed: 0.7, label: "1500 bp" },
    { size: 1000, speed: 1.0, label: "1000 bp" },
    { size: 500, speed: 1.6, label: "500 bp" },
    { size: 250, speed: 2.2, label: "250 bp" }
  ];

  // PCR cycle step-through timer
  useEffect(() => {
    if (!isPcrRunning) return;

    const runCycleStep = () => {
      if (currentCycle >= cycleCount) {
        setIsPcrRunning(false);
        setPcrStep("idle");
        return;
      }

      setPcrStep((step) => {
        if (step === "idle" || step === "extend") {
          // Go to Denature
          setPcrTemp(95);
          setCurrentCycle((c) => c + 1);
          return "denature";
        } else if (step === "denature") {
          // Go to Anneal
          setPcrTemp(annealTemp);
          return "anneal";
        } else {
          // Go to Extend
          setPcrTemp(72);
          return "extend";
        }
      });
    };

    // Initial trigger
    const timer = setInterval(runCycleStep, 1000);

    return () => clearInterval(timer);
  }, [isPcrRunning, currentCycle, cycleCount, annealTemp]);

  // Gel electrophoresis timer
  useEffect(() => {
    if (!isGelRunning) return;

    const timer = setInterval(() => {
      setGelTime((t) => {
        if (t >= 40) {
          setIsGelRunning(false);
          return 40;
        }
        return t + 1;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [isGelRunning]);

  const handleStartPcr = () => {
    setCurrentCycle(0);
    setPcrStep("idle");
    setIsPcrRunning(true);
  };

  const handleStartGel = () => {
    setGelTime(0);
    setIsGelRunning(true);
  };

  const handleAddLog = () => {
    const run: LoggedPcrRun = {
      index: loggedRuns.length + 1,
      cycles: cycleCount,
      annealTemp,
      voltage,
      dnaYield: pcrYield.toExponential(2),
      migDistance: Math.round(sample1Distance),
      bandSize: 500 // target segment size
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setActiveTab("pcr");
    setCycleCount(25);
    setAnnealTemp(55);
    setVoltage(100);
    setIsPcrRunning(false);
    setPcrStep("idle");
    setCurrentCycle(0);
    setPcrTemp(25);
    setIsGelRunning(false);
    setGelTime(0);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุดที่\tจำนวนรอบ (Cycles)\tTemp Annealing (°C)\tแรงดันไฟฟ้า (V)\tผลผลิต DNA (ชิ้น)\tระยะทางบนเจล (mm)\n";
    const rows = loggedRuns.map((r) => `${r.index}\t${r.cycles}\t${r.annealTemp}\t${r.voltage}\t${r.dnaYield}\t${r.migDistance}`);
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map((r) => `${r.index},${r.cycles},${r.annealTemp},${r.voltage},${r.dnaYield},${r.migDistance}`);
    const csv = "data:text/csv;charset=utf-8," + ["Index,Cycles,AnnealTemp,Voltage,DnaYield,MigrationDistance", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "pcr_gel_electrophoresis_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    if (loggedRuns.length === 0) {
      alert("กรุณากดบันทึกค่าพารามิเตอร์จำลองอย่างน้อย 1 ครั้งก่อนส่งออกรายงาน");
      return;
    }
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_pcr_gel_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "PCR & Gel Electrophoresis",
      variables: { cycleCount, annealTemp, voltage },
      liveValues: { pcrYield, sample1Distance },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.cycles, y: parseFloat(r.dnaYield) })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, maxYield: Math.max(...loggedRuns.map((r) => parseFloat(r.dnaYield))) },
      score: Math.min(100, Math.max(40, 40 + loggedRuns.length * 15)),
      durationSeconds: null
    });
    alert("บันทึกรายงานการทดลองเทคโนโลยีดีเอ็นเอสำเร็จ");
  };

  const questProgress = Math.min(100, Math.round((loggedRuns.length / 3) * 100));

  return (
    <SharedSimulationShell
      accent="emerald"
      labId="pcr-gel-electrophoresis"
      category="Biology"
      title="PCR & Gel Electrophoresis"
      subtitle="จำลองการสังเคราะห์เพิ่มผลผลิตสายดีเอ็นเอเป้าหมายด้วยเครื่อง PCR และแยกขนาดโมเลกุลผ่านวุ้นอะกาโรสเจลด้วยสนามไฟฟ้ากระแสตรง"
      statusLabel={`สถานะ: ${isPcrRunning ? `พีซีอาร์ รอบที่ ${currentCycle}/${cycleCount}` : isGelRunning ? `กำลังรันวุ้นเจลไฟฟ้า ${gelTime} นาที` : "รันการทดลองสำเร็จ"}`}
      icon={Zap}
      sceneTitle="กระบวนการขยายและแยกขนาดโมเลกุล (Reaction & Separation Stage)"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_48%,#f6fdf9_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          {/* Toggle stage tabs */}
          <div className="relative z-10 mb-3 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans">
            <button onClick={() => setActiveTab("pcr")} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-black transition-all ${activeTab === "pcr" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
              <Thermometer className="h-3.5 w-3.5" />
              1. PCR Cycler
            </button>
            <button onClick={() => setActiveTab("gel")} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-black transition-all ${activeTab === "gel" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
              <Layers className="h-3.5 w-3.5" />
              2. Agarose Gel Electrophoresis
            </button>
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            {activeTab === "pcr" ? (
              // PCR animation stage
              <div className="flex flex-col items-center gap-2 font-sans w-full max-w-[320px]">
                <span className="text-[10px] font-bold text-slate-500 mb-1">วิชวลรอบอุณหภูมิและสาย DNA (T = {pcrTemp}°C)</span>
                <svg viewBox="0 0 200 120" className="w-full h-auto overflow-visible rounded-xl border border-emerald-200/70 bg-white/95 p-3 shadow-inner">
                  {/* Thermometer scale */}
                  <line x1="20" y1="100" x2="20" y2="20" stroke="#cbd5e1" strokeWidth="2" />
                  <rect x="18" y={100 - (pcrTemp / 100) * 80} width="4" height={(pcrTemp / 100) * 80} fill="#f43f5e" rx="1" />
                  <text x="12" y="102" fontSize="6.5" fill="#64748b" fontWeight="bold">
                    0
                  </text>
                  <text x="8" y="24" fontSize="6.5" fill="#f43f5e" fontWeight="bold">
                    100°C
                  </text>

                  {/* DNA molecules visualization based on step */}
                  {pcrStep === "idle" && (
                    <g transform="translate(60, 50)">
                      {/* Double Helix intact */}
                      <path d="M 10,20 Q 35,0 60,20 T 110,20" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                      <path d="M 10,10 Q 35,30 60,10 T 110,10" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                      {/* Rungs */}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <line key={i} x1={20 + i * 15} y1={12} x2={20 + i * 15} y2={18} stroke="#cbd5e1" strokeWidth="1" />
                      ))}
                    </g>
                  )}

                  {pcrStep === "denature" && (
                    <g transform="translate(60, 50)" className="opacity-80">
                      {/* DNA strands separated at 95 degrees */}
                      <path d="M 10,5 Q 35,-15 60,5 T 110,5" fill="none" stroke="#ef4444" strokeWidth="2" />
                      <path d="M 10,25 Q 35,45 60,25 T 110,25" fill="none" stroke="#ef4444" strokeWidth="2" />
                      <text x="60" y="19" fontSize="6" fill="#be123c" textAnchor="middle" fontWeight="bold">
                        Denaturation: H-Bonds broken
                      </text>
                    </g>
                  )}

                  {pcrStep === "anneal" && (
                    <g transform="translate(60, 50)">
                      {/* DNA strands separated with primers (emerald) binding */}
                      <path d="M 10,5 Q 35,-15 60,5 T 110,5" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                      <path d="M 10,25 Q 35,45 60,25 T 110,25" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                      {/* Primers */}
                      <line x1="20" y1="2" x2="45" y2="2" stroke="#10b981" strokeWidth="2.5" />
                      <line x1="85" y1="28" x2="110" y2="28" stroke="#10b981" strokeWidth="2.5" />
                      <text x="60" y="19" fontSize="6.5" fill="#047857" textAnchor="middle" fontWeight="bold">
                        Annealing: Primers bind
                      </text>
                    </g>
                  )}

                  {pcrStep === "extend" && (
                    <g transform="translate(60, 50)">
                      {/* DNA polymerase (violet) copying strands */}
                      <path d="M 10,5 Q 35,-15 60,5 T 110,5" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                      <path d="M 10,25 Q 35,45 60,25 T 110,25" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                      {/* Taq Polymerase circles */}
                      <circle cx="45" cy="5" r="4.5" fill="#8b5cf6" opacity="0.9" />
                      <circle cx="85" cy="25" r="4.5" fill="#8b5cf6" opacity="0.9" />
                      {/* Extended green lines */}
                      <line x1="20" y1="5" x2="60" y2="5" stroke="#10b981" strokeWidth="1.5" />
                      <line x1="70" y1="25" x2="110" y2="25" stroke="#10b981" strokeWidth="1.5" />
                      <text x="60" y="19" fontSize="6" fill="#6d28d9" textAnchor="middle" fontWeight="bold">
                        Taq extension: 72°C
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            ) : (
              // Gel electrophoresis animation stage
              <div className="flex flex-col items-center gap-2 font-sans w-full max-w-[320px]">
                <span className="text-[10px] font-bold text-slate-500 mb-1">ถังวุ้นสียูวีเรืองแสง (Agarose Gel Tank)</span>
                <svg viewBox="0 0 200 130" className="w-full h-auto overflow-visible rounded-xl border border-emerald-200/70 bg-slate-900 p-3 shadow-inner">
                  {/* Gel body boundary */}
                  <rect x="25" y="15" width="150" height="95" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" strokeWidth="1.5" />

                  {/* Electrode markers */}
                  <text x="18" y="24" fill="#ef4444" fontSize="9" fontWeight="black" textAnchor="middle">
                    -
                  </text>
                  <text x="182" y="24" fill="#3b82f6" fontSize="9" fontWeight="black" textAnchor="middle">
                    +
                  </text>

                  {/* Loading Wells */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <rect key={i} x="35" y="28 + i * 20" width="8" height="12" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                  ))}

                  {/* Lane Labels */}
                  <text x="39" y="22" fill="#94a3b8" fontSize="6" textAnchor="middle">
                    Ladder
                  </text>
                  <text x="39" y="42" fill="#94a3b8" fontSize="6" textAnchor="middle">
                    Sample
                  </text>

                  {/* DNA Bands Migration under UV Light */}
                  {/* Lane 0: Ladder */}
                  {ladderBands.map((band) => {
                    const bx = 35 + gelTime * band.speed * (voltage / 100) * 1.5;
                    if (bx < 43) return null;
                    return <rect key={band.size} x={Math.min(165, bx)} y="30" width="3" height="8" fill="#34d399" className="animate-pulse" opacity="0.9" />;
                  })}

                  {/* Lane 1: Sample 1 (PCR target 500bp) */}
                  {gelTime > 0 && <rect x={Math.min(165, 35 + sample1Distance * 1.5)} y="50" width="3.5" height="8" fill="#10b981" className="animate-pulse" opacity={pcrYield > 200 ? "0.95" : "0.4"} />}

                  {/* Electric bubble flow lines */}
                  {isGelRunning && Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={50 + i * 20 + ((gelTime * 5) % 15)} cy={25 + i * 15} r="1" fill="#60a5fa" opacity="0.4" />)}
                </svg>
              </div>
            )}
          </div>
        </div>
      }
      controlsTitle="ตั้งค่าพารามิเตอร์ขยายพันธุ์ & แยกดีเอ็นเอ"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          {activeTab === "pcr" ? (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Sliders className="h-4.5 w-4.5 text-emerald-500" />
                รอบและอุณหภูมิเครื่องคุมวงจร PCR
              </h3>

              <ManualNumberInput label="จำนวนรอบปฏิกิริยา (Cycle Count)" ariaLabel="รอบปฏิกิริยา" value={cycleCount} min={10} max={35} step={1} onChange={setCycleCount} tone="emerald" />
              <ManualNumberInput label="อุณหภูมิเกาะจับไพรเมอร์ (Anneal Temp °C)" ariaLabel="อุณหภูมิแอนนีลลิ่ง" value={annealTemp} min={45} max={65} step={1} onChange={setAnnealTemp} tone="emerald" />
              <div className="flex gap-2">
                <button onClick={handleStartPcr} disabled={isPcrRunning} className="flex-grow flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer">
                  <Play className="h-3.5 w-3.5" />
                  เริ่มปฏิกิริยา PCR
                </button>
              </div>
            </section>
          ) : (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Sliders className="h-4.5 w-4.5 text-emerald-500" />
                ตั้งค่าสนามกระแสไฟฟ้าเจลวุ้น
              </h3>

              <ManualNumberInput label="แรงดันไฟฟ้าเหนี่ยวนำ (Voltage V)" ariaLabel="กระแสไฟฟ้าเจล" value={voltage} min={50} max={150} step={10} onChange={setVoltage} tone="emerald" />
              <div className="flex gap-2">
                <button onClick={handleStartGel} disabled={isGelRunning} className="flex-grow flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer">
                  <Zap className="h-3.5 w-3.5" />
                  เปิดไฟฟ้าแยกเจล (Gel Run)
                </button>
              </div>
            </section>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleAddLog} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-97 cursor-pointer">
              <ClipboardList className="h-3.5 w-3.5 text-emerald-500" />
              บันทึกจุดวัด
            </button>
            <button onClick={handleReset} className="flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2.5 text-xs font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 active:scale-97 cursor-pointer">
              <RotateCcw className="h-3.5 w-3.5" />
              รีเซ็ตจำลอง
            </button>
          </div>
        </div>
      }
      compactControls={
        <div className="flex items-center gap-2 font-sans flex-wrap">
          <button onClick={() => setCycleCount((c) => Math.max(10, c - 5))} className="px-2 py-1 text-xs font-bold rounded bg-slate-100">
            Cycles -5
          </button>
          <button onClick={() => setCycleCount((c) => Math.min(35, c + 5))} className="px-2 py-1 text-xs font-bold rounded bg-slate-100">
            Cycles +5
          </button>
          <button onClick={handleReset} className="px-2 py-1 text-xs font-bold rounded bg-emerald-500 text-white">
            Reset
          </button>
        </div>
      }
      metrics={[
        { label: "ผลผลิต DNA ล่าสุด (PCR Yield)", value: `${pcrYield.toExponential(2)} ชิ้น`, tone: "emerald" },
        { label: "รอบกระบวนการ PCR ปัจจุบัน", value: `${currentCycle}/${cycleCount} รอบ`, tone: "orange" },
        { label: "ระยะทางขยับแบนด์เป้าหมาย", value: `${sample1Distance.toFixed(1)} mm`, tone: "violet" },
        { label: "ประสิทธิภาพ PCR (Efficiency)", value: `${(pcrEfficiency * 50).toFixed(1)}%`, tone: undefined }
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
              อัตรา Yield สะสมต่อจำนวนรอบ (DNA Accumulation vs Cycles)
            </h3>
          </div>
          <div className="flex-grow flex items-center justify-center">
            {loggedRuns.length === 0 ? (
              <div className="text-xs text-slate-400">จดบันทึกผลการทดลองเพื่อพลอตกราฟสะสม</div>
            ) : (
              <svg viewBox="0 0 200 120" className="w-full max-w-[240px] h-auto">
                <line x1="15" y1="100" x2="185" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="15" y1="10" x2="15" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                {loggedRuns.map((r, i) => {
                  const cx = 15 + (r.cycles / 35) * 165;
                  const cy = 100 - Math.min(80, parseFloat(r.dnaYield) / 1e9) * 0.9;
                  return (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="3" fill="#10b981" />
                      {i > 0 && <line x1={15 + (loggedRuns[i - 1].cycles / 35) * 165} y1={100 - Math.min(80, parseFloat(loggedRuns[i - 1].dnaYield) / 1e9) * 0.9} x2={cx} y2={cy} stroke="#a7f3d0" strokeWidth="1.2" />}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <ClipboardList className="h-4.5 w-4.5 text-emerald-500" />
              ตารางบันทึกดีเอ็นเอวิเคราะห์
            </h3>
            {loggedRuns.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={handleCopyData} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                  <Clipboard className="h-3 w-3" /> คัดลอก
                </button>
                <button onClick={handleExportCSV} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                  <Download className="h-3 w-3" /> CSV
                </button>
              </div>
            )}
          </div>
          {loggedRuns.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-xs text-slate-400 py-10">ยังไม่มีการบันทึกชิ้นผลผลิต</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center">ชุด</th>
                    <th className="p-2">จำนวนรอบ</th>
                    <th className="p-2">Anneal Temp</th>
                    <th className="p-2">กระแสไฟ</th>
                    <th className="p-2">DNA Yield</th>
                    <th className="p-2">ระยะขยับ (mm)</th>
                    <th className="p-2 text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  {loggedRuns.map((r) => (
                    <tr key={r.index} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-bold">{r.index}</td>
                      <td className="p-2 font-sans">{r.cycles} รอบ</td>
                      <td className="p-2">{r.annealTemp}°C</td>
                      <td className="p-2">{r.voltage} V</td>
                      <td className="p-2 font-bold text-emerald-700">{r.dnaYield}</td>
                      <td className="p-2">{r.migDistance} mm</td>
                      <td className="p-2 text-center">
                        <button onClick={() => handleClearLog(r.index)} className="text-emerald-500 hover:bg-emerald-50 p-1 rounded">
                          <Trash className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      }
      learningGoals={["เรียนรู้กระบวนการเพิ่มโมเลกุลสารด้วยเครื่อง PCR Thermal Cycler 3 อุณหภูมิทดสอบ", "ศึกษาผลสัมฤทธิ์ของอุณหภูมิ Annealing ส่งผลต่อความเสถียรจับตัวไพรเมอร์และผลผลิต DNA", "สังเกตการณ์เคลื่อนทวิของดีเอ็นเอบนวุ้นไฟฟ้า Gel Electrophoresis ตามแรงต้านขนาด bp"]}
      steps={[
        { label: "เลือกจำนวนรอบและอุณหภูมิของเครื่องจำลอง PCR ในควบคุม", icon: Sliders },
        { label: "กดรัน PCR สังเกตภาพตัดแยกและประกอบต่อสายดีเอ็นเอทีละรอบ", icon: Target },
        { label: "ปรับแรงดันไฟฟ้ากระแสตรงและรันเจลแยกขนาดแบนด์สัมประสิทธิ์", icon: Zap },
        { label: "บันทึกตัวแปรเก็บไว้ในสมุดผลและส่งรายงานคณิตความน่าจะเป็น", icon: ClipboardList }
      ]}
      progressLabel="ความคืบหน้ากิจกรรมขยายยีน"
      progressValue={questProgress === 100 ? "วิเคราะห์และแยกขนาดดีเอ็นเอสำเร็จแล้ว" : `จดสถิติบันทึกสำเร็จ ${loggedRuns.length}/3 ครั้ง`}
      progressPercent={questProgress}
      tips={["อุณหภูมิ Annealing ที่ดีที่สุดคือ 55 องศาเซลเซียส การปรับเพิ่มหรือลดส่งผลให้ประสิทธิภาพต่ำลง", "ดีเอ็นเอมีประจุลบตามธรรมชาติ จะพุ่งเข้าหาขั้วบวกสีน้ำเงินขวาเสมอในอ่างเหนี่ยวนำเจลไฟฟ้า", "เมื่อระยะห่างของแท่งแบนด์ตรงกับตัวเทียบ Ladder 500bp แสดงว่าเป็นดีเอ็นเอเป้าหมายของเราอย่างชัดเจน"]}
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">เครื่องควบคุมอุณหภูมิและกระแสแยก (PCR & Electrophoresis)</p>
          <p className="mb-3">การเพิ่มจำนวนสารดีเอ็นเอเป็นขั้นตอนหลักในการทดลองอุดมศึกษาชีววิทยา:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>Polymerase Chain Reaction (PCR):</strong> อาศัยเอนไซม์ Taq Polymerase ทนความร้อนในการสร้างสายสำเนาเพิ่มจำนวนทวีคูณตามสมการ {"N = N_0 \\cdot 2^n"}
            </li>
            <li>
              <strong>Denaturation (95°C):</strong> สลายแรงยึดเหนี่ยวเกลียวคู่ให้เปิดออกเป็นสองสายเดี่ยว
            </li>
            <li>
              <strong>Annealing (55°C):</strong> ไพรเมอร์เข้าเกาะสายเดี่ยวแม่แบบ ณ ตำแหน่งเฉพาะเจาะจง
            </li>
            <li>
              <strong>Extension (72°C):</strong> เอนไซม์ Taq สังเคราะห์เบสคู่สมต่อเนื่องจนเต็มสาย
            </li>
            <li>
              <strong>Gel Electrophoresis:</strong> แยกขนาดตามมวล โมเลกุลใหญ่เคลื่อนช้าอยู่ด้านบน โมเลกุลเล็กวิ่งเร็วจมลงลึกด้านล่าง
            </li>
          </ul>
        </div>
      }
      onRun={activeTab === "pcr" ? handleStartPcr : handleStartGel}
      runLabel={activeTab === "pcr" ? "ทดลอง PCR" : "ทดลองเจล"}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
