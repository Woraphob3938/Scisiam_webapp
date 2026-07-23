"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Sliders,
  RotateCcw,
  ClipboardList,
  Activity,
  Play,
  Zap,
  Sparkles,
  Clipboard,
  Download,
  Trash,
  Hourglass,
  Eye,
  Target,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedBlotRun {
  index: number;
  acrylamidePercent: number; // %
  transferTime: number; // minutes
  blockingBuffer: string;
  exposureTime: number; // seconds
  transferEfficiency: number; // %
  bandIntensity: number; // relative density
  sNrRatio: number; // Signal to Noise ratio
}

export default function WesternBlottingSimulation() {
  const labId = "western-blotting";

  const [activeStage, setActiveStage] = useState<"sds" | "transfer" | "antibody" | "imager">("sds");
  const [acrylamidePercent, setAcrylamidePercent] = useState<number>(12); // % (10, 12, 15)
  const [transferTime, setTransferTime] = useState<number>(60); // minutes (optimal: 60)
  const [blockingBuffer, setBlockingBuffer] = useState<"milk" | "bsa">("milk");
  const [exposureTime, setExposureTime] = useState<number>(5); // seconds (optimal: 5s)

  // Running State
  const [isSdsRunning, setIsSdsRunning] = useState<boolean>(false);
  const [sdsTime, setSdsTime] = useState<number>(0); // 0-40 simulated minutes
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [isTransferDone, setIsTransferDone] = useState<boolean>(false);
  const [isBlocking, setIsBlocking] = useState<boolean>(false);
  const [isBlockingDone, setIsBlockingDone] = useState<boolean>(false);

  const [loggedRuns, setLoggedRuns] = useState<LoggedBlotRun[]>([]);

  // Simulation Calculations:
  // Transfer efficiency peaks around 60 minutes
  const transferEfficiency = useMemo(() => {
    const dev = Math.abs(transferTime - 60);
    const eff = 95 * Math.exp(-0.0008 * (dev * dev));
    return Math.max(0, Math.round(eff));
  }, [transferTime]);

  // Band intensity increases with exposure time and transfer efficiency
  const bandIntensity = useMemo(() => {
    if (!isTransferDone) return 0;
    const baseDensity = (transferEfficiency / 100) * 120;
    const expScale = exposureTime / 5;
    return Math.min(255, Math.round(baseDensity * expScale));
  }, [isTransferDone, transferEfficiency, exposureTime]);

  // Signal-to-noise ratio: Skim Milk blocking is better for general antigens,
  // too much exposure time increases background noise (overexposure)
  const sNrRatio = useMemo(() => {
    let baseSnr = blockingBuffer === "milk" ? 18.0 : 12.0;
    const expDev = Math.abs(exposureTime - 5);
    baseSnr -= expDev * 2.0; // over or under exposure degrades SNR
    return Math.max(1.0, parseFloat(baseSnr.toFixed(1)));
  }, [blockingBuffer, exposureTime]);

  // Protein migration distances based on acrylamide concentration (Gel matrix density)
  // Higher % acrylamide separates smaller proteins better (migrates slower overall)
  const gelMigrationScale = useMemo(() => {
    return 12 / acrylamidePercent;
  }, [acrylamidePercent]);

  // SDS PAGE separation timer
  const handleStartSds = () => {
    setIsSdsRunning(true);
    setSdsTime(0);
  };

  useEffect(() => {
    if (!isSdsRunning) return;
    const timer = setInterval(() => {
      setSdsTime((t) => {
        if (t >= 40) {
          setIsSdsRunning(false);
          setActiveStage("transfer");
          return 40;
        }
        return t + 2;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [isSdsRunning]);

  const handleStartTransfer = () => {
    setIsTransferring(true);
    setTimeout(() => {
      setIsTransferring(false);
      setIsTransferDone(true);
      setActiveStage("antibody");
    }, 1500);
  };

  const handleStartBlocking = () => {
    setIsBlocking(true);
    setTimeout(() => {
      setIsBlocking(false);
      setIsBlockingDone(true);
      setActiveStage("imager");
    }, 1200);
  };

  const handleAddLog = () => {
    const run: LoggedBlotRun = {
      index: loggedRuns.length + 1,
      acrylamidePercent,
      transferTime,
      blockingBuffer: blockingBuffer === "milk" ? "Skim Milk (นมแห้ง)" : "BSA (ซีรัมแอลบูมิน)",
      exposureTime,
      transferEfficiency,
      bandIntensity,
      sNrRatio
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setActiveStage("sds");
    setAcrylamidePercent(12);
    setTransferTime(60);
    setBlockingBuffer("milk");
    setExposureTime(5);
    setIsSdsRunning(false);
    setSdsTime(0);
    setIsTransferring(false);
    setIsTransferDone(false);
    setIsBlocking(false);
    setIsBlockingDone(false);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุดที่\tAcrylamide (%)\tเวลาโอนย้าย (นาที)\tตัวบล็อก\tเวลาฉายแสง (s)\tประสิทธิภาพโอนย้าย (%)\tความเข้มแบนด์\tSNR\n";
    const rows = loggedRuns.map((r) => `${r.index}\t${r.acrylamidePercent}\t${r.transferTime}\t${r.blockingBuffer}\t${r.exposureTime}\t${r.transferEfficiency}\t${r.bandIntensity}\t${r.sNrRatio}`);
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map((r) => `${r.index},${r.acrylamidePercent},${r.transferTime},${r.blockingBuffer},${r.exposureTime},${r.transferEfficiency},${r.bandIntensity},${r.sNrRatio}`);
    const csv = "data:text/csv;charset=utf-8," + ["Index,AcrylamidePercent,TransferTime,BlockingBuffer,ExposureTime,TransferEfficiency,BandIntensity,SnrRatio", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "western_blotting_log.csv");
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
      localStorageKey: "scisiam_saved_western_blotting_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "Western Blotting Protein Detection",
      variables: { acrylamidePercent, transferTime, blockingBuffer, exposureTime },
      liveValues: { transferEfficiency, bandIntensity, sNrRatio },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.transferTime, y: r.transferEfficiency })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, maxIntensity: Math.max(...loggedRuns.map((r) => r.bandIntensity)) },
      score: Math.min(100, Math.max(40, 40 + loggedRuns.length * 15)),
      durationSeconds: null
    });
    alert("บันทึกรายงานการทดลองวิเคราะห์แบนด์โปรตีนสำเร็จ");
  };

  const questProgress = Math.min(100, Math.round((loggedRuns.length / 3) * 100));

  return (
    <SharedSimulationShell
      accent="emerald"
      labId="western-blotting"
      category="Biology"
      title="Western Blotting Protein Detection"
      subtitle="แยกส่วนผสมโปรตีนตามขนาดเชิงมวลผ่านแผ่นเจล SDS-PAGE โอนย้ายเข้าแผ่นเมมเบรน PVDF และเหนี่ยวนำสัญญาณเรืองแสงเคมีจากแอนติบอดีปฐมภูมิ-ทุติยภูมิ"
      statusLabel={`ระบบ: ${activeStage === "sds" ? (isSdsRunning ? `กำลังรันเจล SDS-PAGEแนวดิ่ง ${sdsTime} นาที` : "ส SDS-PAGE พร้อมทำงาน") : activeStage === "transfer" ? "กำลังถ่ายโอนโปรตีน..." : activeStage === "antibody" ? "ขั้นตอนฟักคัดกรองแอนติบอดี..." : "ขั้นตอนฉายถ่ายแสงเคมีภาพแบนด์"}`}
      icon={Activity}
      sceneTitle="วิชวลแถบแยกโปรตีน (Immunoblot Stage)"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_48%,#f6fdf9_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          {/* Toggle stage tabs */}
          <div className="relative z-10 mb-3 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans">
            <button onClick={() => setActiveStage("sds")} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-black transition-all ${activeStage === "sds" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
              1. SDS-PAGE
            </button>
            <button onClick={() => setActiveStage("transfer")} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-black transition-all ${activeStage === "transfer" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
              2. Transfer
            </button>
            <button onClick={() => setActiveStage("antibody")} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-black transition-all ${activeStage === "antibody" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
              3. Block & Ab
            </button>
            <button onClick={() => setActiveStage("imager")} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-black transition-all ${activeStage === "imager" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
              4. Imager
            </button>
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            {activeStage === "sds" ? (
              // SDS-PAGE vertical tank SVG
              <div className="flex flex-col items-center gap-2 font-sans w-full max-w-[320px]">
                <span className="text-[10px] font-bold text-slate-500 mb-1">แผ่นเจล SDS-PAGE ในถังแนวดิ่ง</span>
                <svg viewBox="0 0 160 120" className="w-full h-auto overflow-visible rounded-xl border border-emerald-200/70 bg-white/95 p-3 shadow-inner">
                  {/* Vertical Gel cassette boundaries */}
                  <rect x="40" y="10" width="80" height="90" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

                  {/* Loading wells top slots */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <rect key={i} x={50 + i * 16} y="10" width="8" height="12" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
                  ))}

                  {/* Migrating bands (red/blue) moving downwards */}
                  {sdsTime > 0 && (
                    <g>
                      {/* Ladder lane */}
                      <rect x="52" y={15 + sdsTime * 1.5 * gelMigrationScale} width="4" height="2.5" fill="#f43f5e" />
                      <rect x="52" y={15 + sdsTime * 0.9 * gelMigrationScale} width="4" height="2.5" fill="#3b82f6" />

                      {/* Sample lane (target protein 75kDa) */}
                      <rect x="68" y={15 + sdsTime * 1.1 * gelMigrationScale} width="4" height="3" fill="#10b981" />
                    </g>
                  )}

                  {/* Electric current bubble indicators */}
                  {isSdsRunning && Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={45 + i * 14} cy={100 - ((sdsTime * 2) % 30)} r="1" fill="#60a5fa" opacity="0.6" className="animate-bounce" />)}
                </svg>
              </div>
            ) : activeStage === "transfer" ? (
              // Blotting transfer sandwich
              <div className="flex flex-col items-center gap-2 font-sans w-full max-w-[320px]">
                <span className="text-[10px] font-bold text-slate-500 mb-1">การทำ Transfer Sandwich</span>
                <svg viewBox="0 0 160 120" className="w-full h-auto overflow-visible rounded-xl border border-emerald-200/70 bg-white/95 p-3 shadow-inner">
                  {/* Sandwich stack layers */}
                  <g stroke="#cbd5e1" strokeWidth="1.5">
                    {/* Cathode Paper */}
                    <rect x="25" y="45" width="25" height="40" fill="#f1f5f9" />
                    <text x="37" y="40" fill="#f43f5e" fontSize="6" fontWeight="bold" textAnchor="middle">
                      -
                    </text>

                    {/* Gel layer */}
                    <rect x="55" y="45" width="10" height="40" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" />

                    {/* PVDF Membrane */}
                    <rect x="70" y="45" width="10" height="40" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" />

                    {/* Anode Paper */}
                    <rect x="85" y="45" width="25" height="40" fill="#f1f5f9" />
                    <text x="97" y="40" fill="#3b82f6" fontSize="6" fontWeight="bold" textAnchor="middle">
                      +
                    </text>
                  </g>

                  {/* Electric Transfer field flow lines */}
                  {isTransferring ? (
                    <g>
                      <path d="M 52,65 L 82,65" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3,3" className="animate-pulse" />
                      <text x="80" y="32" fill="#10b981" fontSize="7" fontWeight="bold" textAnchor="middle">
                        Transferring...
                      </text>
                    </g>
                  ) : (
                    <text x="80" y="32" fill="#64748b" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                      พร้อมเปิดกระแสย้ายแบนด์
                    </text>
                  )}
                </svg>
              </div>
            ) : activeStage === "antibody" ? (
              // Antibody antigen binding
              <div className="flex flex-col items-center gap-2 font-sans w-full max-w-[320px]">
                <span className="text-[10px] font-bold text-slate-500 mb-1">การเกาะตัวของ Primary & Secondary Antibody</span>
                <svg viewBox="0 0 160 120" className="w-full h-auto overflow-visible rounded-xl border border-emerald-200/70 bg-white/95 p-3 shadow-inner">
                  {/* Antigen on membrane surface */}
                  <rect x="30" y="80" width="100" height="15" rx="2" fill="#10b981" />
                  <text x="80" y="91" fill="#ffffff" fontSize="7.5" fontWeight="black" textAnchor="middle">
                    Target Protein Antigen
                  </text>

                  {/* Primary Antibody (Y shape) */}
                  {isBlockingDone && (
                    <g transform="translate(65, 45)" stroke="#3b82f6" strokeWidth="2" fill="none">
                      <line x1="15" y1="35" x2="15" y2="15" />
                      <line x1="15" y1="15" x2="5" y2="5" />
                      <line x1="15" y1="15" x2="25" y2="5" />
                      <text x="15" y="-1" fill="#3b82f6" stroke="none" fontSize="6" fontWeight="bold" textAnchor="middle">
                        1st Ab
                      </text>
                    </g>
                  )}

                  {/* Secondary Antibody with Enzyme (HRP) */}
                  {isBlockingDone && (
                    <g transform="translate(80, 20)" stroke="#8b5cf6" strokeWidth="1.8" fill="none">
                      <line x1="15" y1="30" x2="15" y2="15" />
                      <line x1="15" y1="15" x2="5" y2="5" />
                      <line x1="15" y1="15" x2="25" y2="5" />
                      {/* HRP Enzyme circle indicator */}
                      <circle cx="15" cy="5" r="4.5" fill="#f59e0b" stroke="none" />
                      <text x="15" y="-3" fill="#8b5cf6" stroke="none" fontSize="5.5" fontWeight="bold" textAnchor="middle">
                        2nd Ab (HRP)
                      </text>
                    </g>
                  )}

                  {isBlocking && (
                    <text x="80" y="45" fill="#eab308" fontSize="7.5" fontWeight="bold" textAnchor="middle" className="animate-pulse">
                      นมแห้งกำลังบล็อกพื้นที่ว่าง...
                    </text>
                  )}
                </svg>
              </div>
            ) : (
              // Imager stage: glowing bands in the dark
              <div className="flex flex-col items-center gap-2 font-sans w-full max-w-[320px]">
                <span className="text-[10px] font-bold text-slate-500 mb-1">กล่องสแกนแสงเคมี (Chemiluminescent Darkroom)</span>
                <svg viewBox="0 0 160 120" className="w-full h-auto overflow-visible rounded-xl border border-emerald-200/70 bg-slate-950 p-3 shadow-inner">
                  {/* Glow bands on membrane sheet */}
                  <rect x="40" y="20" width="80" height="80" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />

                  {/* Target protein glowing band at 75kDa */}
                  {isTransferDone && <rect x="45" y="50" width="70" height="8" rx="1.5" fill="#34d399" className="animate-pulse" opacity={bandIntensity / 255} style={{ filter: `drop-shadow(0 0 ${exposureTime}px #10b981)` }} />}

                  {/* Beta-Actin control band at 42kDa */}
                  {isTransferDone && <rect x="45" y="80" width="70" height="6" rx="1" fill="#60a5fa" opacity="0.8" style={{ filter: `drop-shadow(0 0 3px #3b82f6)` }} />}

                  <text x="80" y="45" fill="#94a3b8" fontSize="6.5" textAnchor="middle">
                    75 kDa Target
                  </text>
                  <text x="80" y="75" fill="#94a3b8" fontSize="6.5" textAnchor="middle">
                    42 kDa Control
                  </text>
                </svg>
              </div>
            )}
          </div>
        </div>
      }
      controlsTitle="ตั้งค่าขั้นตอนเวสเทิร์นบลอต"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          {activeStage === "sds" ? (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Sliders className="h-4.5 w-4.5 text-emerald-500" />
                SDS-PAGE Gel Concentration
              </h3>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-500">ความเข้มข้นเจลอะคริลาไมด์ (Polyacrylamide Gel %)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[10, 12, 15].map((pct) => (
                    <button key={pct} type="button" onClick={() => setAcrylamidePercent(pct)} className={`rounded-lg border py-1.5 text-xs font-bold transition-all ${acrylamidePercent === pct ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-extrabold" : "border-slate-200 bg-white text-slate-500"}`}>
                      {pct}% Gel
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleStartSds} disabled={isSdsRunning} className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer">
                <Play className="h-3.5 w-3.5" />
                เริ่มเดินกระแสไฟ SDS-PAGE
              </button>
            </section>
          ) : activeStage === "transfer" ? (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Zap className="h-4.5 w-4.5 text-emerald-500" />
                ขั้นตอนโอนย้ายกระแสไฟ (Electrotransfer)
              </h3>

              <ManualNumberInput label="ระยะเวลาถ่ายโอนไฟฟ้า (นาที)" ariaLabel="เวลาถ่ายโอนไฟฟ้า" value={transferTime} min={20} max={100} step={5} onChange={setTransferTime} tone="emerald" />

              <button onClick={handleStartTransfer} disabled={isTransferring} className="flex-grow flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer">
                <Zap className="h-3.5 w-3.5" />
                เริ่มถ่ายโอนแบนด์เข้า PVDF
              </button>
            </section>
          ) : activeStage === "antibody" ? (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Hourglass className="h-4.5 w-4.5 text-emerald-500" />
                บล็อกเมมเบรน & บ่มแอนติบอดี
              </h3>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-500">เลือกน้ำยาบล็อก (Blocking Buffer)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setBlockingBuffer("milk")} className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${blockingBuffer === "milk" ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-black" : "border-slate-200 bg-white text-slate-500"}`}>
                    Skim Milk (นมแห้ง)
                  </button>
                  <button type="button" onClick={() => setBlockingBuffer("bsa")} className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${blockingBuffer === "bsa" ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-black" : "border-slate-200 bg-white text-slate-500"}`}>
                    BSA (แอลบูมิน)
                  </button>
                </div>
              </div>

              <button onClick={handleStartBlocking} disabled={isBlocking} className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer">
                <Play className="h-3.5 w-3.5" />
                เทน้ำยา Blocking & บ่ม Ab
              </button>
            </section>
          ) : (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Eye className="h-4.5 w-4.5 text-emerald-500" />
                ขั้นตอนฉายถ่ายแสงเคมี (Chemiluminescence)
              </h3>

              <ManualNumberInput label="ระยะเวลาเปิดรับแสงเลนส์ (วินาที)" ariaLabel="เวลาเปิดรับแสงเลนส์" value={exposureTime} min={1} max={15} step={1} onChange={setExposureTime} tone="emerald" />
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
          <button onClick={() => setExposureTime((e) => Math.max(1, e - 1))} className="px-2 py-1 text-xs font-bold rounded bg-slate-100">
            Expose -1s
          </button>
          <button onClick={() => setExposureTime((e) => Math.min(15, e + 1))} className="px-2 py-1 text-xs font-bold rounded bg-slate-100">
            Expose +1s
          </button>
          <button onClick={handleReset} className="px-2 py-1 text-xs font-bold rounded bg-emerald-500 text-white">
            Reset
          </button>
        </div>
      }
      metrics={[
        { label: "ประสิทธิภาพถ่ายโอน (Transfer)", value: `${transferEfficiency}%`, tone: "emerald" },
        { label: "ความสว่างแบนด์เป้าหมาย (Density)", value: `${bandIntensity} Intensity`, tone: "emerald" },
        { label: "อัตราส่วนสัญญาณต่อรบกวน (SNR)", value: `${sNrRatio} dB`, tone: sNrRatio > 12.0 ? "emerald" : "orange" },
        { label: "ความละเอียดเจล (Acrylamide)", value: `${acrylamidePercent}%`, tone: undefined }
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
              ประสิทธิภาพโอนย้ายโปรตีน (Transfer Efficiency vs Time)
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
                  const cx = 15 + (r.transferTime / 100) * 165;
                  const cy = 100 - (r.transferEfficiency / 100) * 80;
                  return (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="3" fill="#10b981" />
                      {i > 0 && <line x1={15 + (loggedRuns[i - 1].transferTime / 100) * 165} y1={100 - (loggedRuns[i - 1].transferEfficiency / 100) * 80} x2={cx} y2={cy} stroke="#a7f3d0" strokeWidth="1.2" />}
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
              ตารางบันทึกความเข้มแบนด์โปรตีน
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
            <div className="flex-grow flex items-center justify-center text-xs text-slate-400 py-10">ยังไม่มีการบันทึกแบนด์โปรตีน</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center">ชุด</th>
                    <th className="p-2">Acrylamide %</th>
                    <th className="p-2">เวลาโอนย้าย</th>
                    <th className="p-2">ตัวบล็อก</th>
                    <th className="p-2">เวลาฉายแสง</th>
                    <th className="p-2">ประสิทธิภาพ</th>
                    <th className="p-2">ความสว่าง</th>
                    <th className="p-2">SNR (dB)</th>
                    <th className="p-2 text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  {loggedRuns.map((r) => (
                    <tr key={r.index} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-bold">{r.index}</td>
                      <td className="p-2">{r.acrylamidePercent}%</td>
                      <td className="p-2">{r.transferTime} นาที</td>
                      <td className="p-2 font-sans">{r.blockingBuffer}</td>
                      <td className="p-2">{r.exposureTime} วินาที</td>
                      <td className="p-2 text-emerald-700 font-bold">{r.transferEfficiency}%</td>
                      <td className="p-2 font-bold">{r.bandIntensity}</td>
                      <td className="p-2">{r.sNrRatio} dB</td>
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
      learningGoals={["เรียนรู้กระบวนการแปลงสภาพโปรตีนด้วยสารซักฟอกประจุลบ SDS เพื่อแยกขนาดเชิงมวลผ่าน SDS-PAGE", "ศึกษาขั้นตอนและหาเวลาที่เหมาะสมที่สุดในการโอนย้ายกระแสไฟฟ้า (Electrotransfer) เข้าสู่ PVDF", "วิเคราะห์ระดับความจำเพาะของแอนติบอดีปฐมภูมิ-ทุติยภูมิ ร่วมกับตัวบล็อกนมแห้งในสัญญาณ SNR"]}
      steps={[
        { label: "เลือกความเข้มข้นเจล SDS-PAGE ให้สมมาตรกับขนาดโปรตีนเป้าหมายการทดสอบ", icon: Sliders },
        { label: "ประกอบแซนด์วิชเมมเบรนและรันกระแสไฟฟ้าเพื่อถ่ายโปรตีนเข้า PVDF", icon: Target },
        { label: "บ่มนมแห้งเพื่อ Blocking และหยดแอนติบอดีขั้นหนึ่งและขั้นสองเฉพาะ", icon: Hourglass },
        { label: "ฉายน้ำยาเคมีเรืองแสง วัดระดับสัญญาณความเข้ม และจดบันทึกยอดรายงานการทดลอง", icon: ClipboardList }
      ]}
      progressLabel="ความคืบหน้าวิเคราะห์โปรตีน"
      progressValue={questProgress === 100 ? "ตรวจวัดและพล็อตความเข้มข้นโปรตีนสำเร็จ" : `บันทึกข้อมูลริ้วแบนด์แล้ว ${loggedRuns.length}/3 รอบ`}
      progressPercent={questProgress}
      tips={["เวลาการทรานเฟอร์ 60 นาทีดีที่สุด หากช้าไปโปรตีนอาจจะหลุดลอย หรือนานไปจะเกิดการ Over-transfer", "นมแห้ง (Skim Milk) บล็อกช่องว่างผิวเมมเบรนได้ดีเยี่ยม ช่วยลดสัญญาณรบกวนฉากหลัง ส่งผลให้ SNR ดีขึ้น", "เวลาการฉายถ่ายแสงเคมีภาพแบนด์ 5 วินาทีเป๊ะๆ ให้ความคมชัดสูงสุด ไม่ขาวกระเจิงหรือมืดสลาย"]}
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">เครื่องรันเจลและวิเคราะห์โปรตีนเฉพาะ (Western Blotting)</p>
          <p className="mb-3">วิธีตรวจหาและวิเคราะห์ประเภทโปรตีนจำเพาะเชิงกึ่งปริมาณจากตัวอย่างชีวภาพ:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>SDS-PAGE:</strong> สารซักฟอก SDS คลุมโปรตีนให้มีประจุลบสม่ำเสมอ แผ่สายธรรมชาติเป็นเส้นตรง และแยกตามขนาดน้ำหนักแนวดิ่ง
            </li>
            <li>
              <strong>PVDF Membrane:</strong> กระดาษตัวรับโปรตีนที่มีความเสถียรและยึดเกาะกับหมู่อะมิโนของโปรตีนได้อย่างเหนียวแน่น
            </li>
            <li>
              <strong>Blocking:</strong> การใช้นมแห้งหรือ BSA อุดรอยรูบน PVDF เพื่อไม่ให้แอนติบอดีจับพื้นที่ว่างอย่างไร้ทิศทาง
            </li>
            <li>
              <strong>Primary & Secondary Ab:</strong> ตัวชี้เป้าจำเพาะแอนติเจนเป้าหมาย และตัวเชื่อม HRP เร่งปฏิกิริยาเคมีเรืองแสง (ECL) สว่างบอกตำแหน่งแบนด์
            </li>
          </ul>
        </div>
      }
      onRun={handleStartSds}
      runLabel="เริ่มทดลอง"
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
