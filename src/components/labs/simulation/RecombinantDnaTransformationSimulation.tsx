"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sliders, RotateCcw, ClipboardList, Activity, Play, Scissors, Zap, Sparkles, Clipboard, Download, Trash, CheckCircle2, Thermometer, Snowflake } from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedTransformationRun {
  index: number;
  restrictionEnzyme: string;
  heatShockTime: number; // seconds
  heatShockTemp: number; // °C
  ligationSuccess: boolean;
  efficiency: number; // transformants/μg
  coloniesCount: number;
  glowsUnderUv: boolean;
}

export default function RecombinantDnaTransformationSimulation() {
  const router = useRouter();
  const labId = "recombinant-dna-transformation";

  const [activeStage, setActiveStage] = useState<"ligation" | "transformation" | "plating">("ligation");
  const [restrictionEnzyme, setRestrictionEnzyme] = useState<"EcoRI" | "HindIII">("EcoRI");
  const [heatShockTime, setHeatShockTime] = useState<number>(45); // seconds (optimal: 45)
  const [heatShockTemp, setHeatShockTemp] = useState<number>(42); // °C (optimal: 42)

  // Simulation Running State
  const [isLigating, setIsLigating] = useState<boolean>(false);
  const [isLigationDone, setIsLigationDone] = useState<boolean>(false);
  const [isShocking, setIsShocking] = useState<boolean>(false);
  const [isShockDone, setIsShockDone] = useState<boolean>(false);

  const [loggedRuns, setLoggedRuns] = useState<LoggedTransformationRun[]>([]);

  // Ligation matches if using EcoRI (which cuts insert and vector matching sticky ends)
  const isLigationSuccess = useMemo(() => {
    return restrictionEnzyme === "EcoRI";
  }, [restrictionEnzyme]);

  // Transformation Efficiency based on Heat Shock parameters:
  // Gaussian decay off 42°C and 45s
  const transformationEfficiency = useMemo(() => {
    if (!isLigationSuccess) return 0;
    const tempDev = Math.abs(heatShockTemp - 42);
    const timeDev = Math.abs(heatShockTime - 45);
    const eff = 1000 * Math.exp(-0.08 * (tempDev * tempDev)) * Math.exp(-0.02 * (timeDev * timeDev));
    return Math.max(0, Math.round(eff));
  }, [isLigationSuccess, heatShockTemp, heatShockTime]);

  const coloniesCount = useMemo(() => {
    return Math.min(250, Math.round(transformationEfficiency * 0.15));
  }, [transformationEfficiency]);

  // DNA ligator timer
  const handleRunLigation = () => {
    setIsLigating(true);
    setTimeout(() => {
      setIsLigating(false);
      setIsLigationDone(true);
      setActiveStage("transformation");
    }, 1200);
  };

  const handleRunHeatShock = () => {
    setIsShocking(true);
    setTimeout(() => {
      setIsShocking(false);
      setIsShockDone(true);
      setActiveStage("plating");
    }, 1500);
  };

  const handleAddLog = () => {
    const run: LoggedTransformationRun = {
      index: loggedRuns.length + 1,
      restrictionEnzyme,
      heatShockTime,
      heatShockTemp,
      ligationSuccess: isLigationSuccess,
      efficiency: transformationEfficiency,
      coloniesCount,
      glowsUnderUv: isLigationSuccess && transformationEfficiency > 200
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setActiveStage("ligation");
    setRestrictionEnzyme("EcoRI");
    setHeatShockTime(45);
    setHeatShockTemp(42);
    setIsLigating(false);
    setIsLigationDone(false);
    setIsShocking(false);
    setIsShockDone(false);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุดที่\tเอนไซม์ตัดต่อ\tเวลาช็อก (วินาที)\tอุณหภูมิ (°C)\tLigation\tประสิทธิภาพ (cfu/μg)\tจำนวนโคโลนี\tเรืองแสงใต้ UV\n";
    const rows = loggedRuns.map((r) => `${r.index}\t${r.restrictionEnzyme}\t${r.heatShockTime}\t${r.heatShockTemp}\t${r.ligationSuccess ? "สำเร็จ" : "ล้มเหลว"}\t${r.efficiency}\t${r.coloniesCount}\t${r.glowsUnderUv ? "เรืองแสง" : "ไม่เรืองแสง"}`);
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map((r) => `${r.index},${r.restrictionEnzyme},${r.heatShockTime},${r.heatShockTemp},${r.ligationSuccess},${r.efficiency},${r.coloniesCount},${r.glowsUnderUv}`);
    const csv = "data:text/csv;charset=utf-8," + ["Index,RestrictionEnzyme,HeatShockTime,HeatShockTemp,LigationSuccess,Efficiency,ColoniesCount,GlowsUnderUv", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "recombinant_dna_transformation_log.csv");
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
      localStorageKey: "scisiam_saved_recombinant_dna_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "Recombinant DNA & Transformation",
      variables: { restrictionEnzyme, heatShockTime, heatShockTemp },
      liveValues: { transformationEfficiency, coloniesCount },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.heatShockTime, y: r.efficiency })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, maxEfficiency: Math.max(...loggedRuns.map((r) => r.efficiency)) },
      score: Math.min(100, Math.max(40, 40 + loggedRuns.length * 15)),
      durationSeconds: null
    });
    alert("บันทึกรายงานพันธุวิศวกรรมดีเอ็นเอลูกผสมสำเร็จ");
    router.push(`/labs/${labId}`);
  };

  const questProgress = Math.min(100, Math.round((loggedRuns.length / 3) * 100));

  return (
    <SharedSimulationShell
      accent="emerald"
      labId="recombinant-dna-transformation"
      category="Biology"
      title="Recombinant DNA & Transformation"
      subtitle="จำลองการตัดต่อเชื่อมยีน GFP เข้าสู่ pGLO พลาสมิดพาหะด้วยเอนไซม์จำเพาะ และเหนี่ยวนำเข้าสู่ E. coli ผ่านเทคนิคช็อกความร้อน"
      statusLabel={`ระบบ: ${activeStage === "ligation" ? "ขั้นตอนตัดและต่อสายยีนพลาสมิด..." : activeStage === "transformation" ? "ขั้นตอนทำเซลล์ Competent shock..." : "ขั้นตอนการทาลงจานเพาะเชื้อ"}`}
      icon={Scissors}
      sceneTitle="วิชวลการทำปฏิกิริยาลูกผสม (Molecular Transformation Stage)"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_48%,#f6fdf9_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          {/* Toggle stage tabs */}
          <div className="relative z-10 mb-3 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans">
            <button onClick={() => setActiveStage("ligation")} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-black transition-all ${activeStage === "ligation" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
              <Scissors className="h-3 w-3" />
              1. Ligation
            </button>
            <button onClick={() => setActiveStage("transformation")} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-black transition-all ${activeStage === "transformation" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
              <Thermometer className="h-3 w-3" />
              2. Heat Shock
            </button>
            <button onClick={() => setActiveStage("plating")} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-black transition-all ${activeStage === "plating" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
              <Zap className="h-3 w-3" />
              3. Agar Plates
            </button>
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            {activeStage === "ligation" ? (
              // Ligation visual stage (plasmid rings)
              <div className="flex flex-col items-center gap-2 font-sans w-full max-w-[320px]">
                <span className="text-[10px] font-bold text-slate-500 mb-1">การต่อยีน GFP เข้ากับ Plasmid Vector</span>
                <svg viewBox="0 0 200 120" className="w-full h-auto overflow-visible rounded-xl border border-emerald-200/70 bg-white/95 p-3 shadow-inner">
                  {/* Plasmid ring shape */}
                  <circle cx="100" cy="60" r="40" fill="none" stroke="#3b82f6" strokeWidth="4" />
                  <circle cx="100" cy="60" r="40" fill="none" stroke="#60a5fa" strokeWidth="1.5" />

                  {/* Sticky End splicing gap */}
                  <rect x="90" y="15" width="20" height="10" fill="#ffffff" />

                  {/* Restriction Enzyme scissors indicator */}
                  {isLigating && (
                    <g transform="translate(100, 20)" className="animate-bounce">
                      <line x1="-10" y1="-10" x2="10" y2="10" stroke="#f43f5e" strokeWidth="2" />
                      <line x1="10" y1="-10" x2="-10" y2="10" stroke="#f43f5e" strokeWidth="2" />
                    </g>
                  )}

                  {/* Insert Gene splicing (GFP emerald color) */}
                  {isLigationDone ? (
                    isLigationSuccess ? (
                      <g>
                        <path d="M 90,20 Q 100,20 110,20" fill="none" stroke="#10b981" strokeWidth="5.5" />
                        <text x="100" y="32" fill="#10b981" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                          GFP Linked
                        </text>
                      </g>
                    ) : (
                      <text x="100" y="32" fill="#ef4444" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                        Mismatch Sticky Ends (Failed)
                      </text>
                    )
                  ) : (
                    <text x="100" y="64" fill="#64748b" fontSize="6" fontWeight="bold" textAnchor="middle">
                      รอผสม Ligase...
                    </text>
                  )}
                </svg>
              </div>
            ) : activeStage === "transformation" ? (
              // Heat Shock simulation (Competent cells membrane pores)
              <div className="flex flex-col items-center gap-2 font-sans w-full max-w-[320px]">
                <span className="text-[10px] font-bold text-slate-500 mb-1">การทำปฏิกิริยา Heat Shock (42°C)</span>
                <svg viewBox="0 0 200 120" className="w-full h-auto overflow-visible rounded-xl border border-emerald-200/70 bg-white/95 p-3 shadow-inner">
                  {/* Bacterial Cell membrane */}
                  <rect x="30" y="25" width="140" height="70" rx="25" fill="none" stroke="#10b981" strokeWidth="3" />

                  {/* Membrane Pores (dashed/open slots) */}
                  {isShocking ? (
                    <g fill="#10b981">
                      <rect x="50" y="23" width="8" height="7" rx="1.5" />
                      <rect x="140" y="23" width="8" height="7" rx="1.5" />
                      <rect x="90" y="92" width="8" height="7" rx="1.5" />
                      <text x="100" y="60" fill="#ea580c" fontSize="8" fontWeight="black" textAnchor="middle" className="animate-pulse">
                        Shocking Membrane Pores Open!
                      </text>
                    </g>
                  ) : (
                    <text x="100" y="60" fill="#64748b" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                      Membrane Pores Closed
                    </text>
                  )}

                  {/* Plasmid rings migrating into cell */}
                  {isShocking && (
                    <g transform="translate(60, 15)" className="animate-pulse">
                      <circle cx="10" cy="15" r="4.5" fill="none" stroke="#3b82f6" strokeWidth="1" />
                      <circle cx="80" cy="80" r="4.5" fill="none" stroke="#3b82f6" strokeWidth="1" />
                    </g>
                  )}
                </svg>
              </div>
            ) : (
              // Plating results (LB, LB/Amp, LB/Amp/Ara)
              <div className="flex items-center gap-2 font-sans w-full justify-around">
                {/* Plate 1: LB */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[8px] font-bold text-slate-500">1. LB (Control)</span>
                  <svg viewBox="0 0 60 60" className="w-14 h-14 bg-amber-50 rounded-full border border-amber-200 shadow-sm">
                    {/* Colonies (growing thick all over) */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <circle key={i} cx={15 + ((i * 7) % 30)} cy={15 + ((i * 5) % 30)} r="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                    ))}
                  </svg>
                  <span className="text-[7px] font-bold text-slate-400">พรมโคโลนีเต็ม</span>
                </div>

                {/* Plate 2: LB + Amp */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[8px] font-bold text-slate-500">2. LB + Amp</span>
                  <svg viewBox="0 0 60 60" className="w-14 h-14 bg-amber-50 rounded-full border border-amber-200 shadow-sm">
                    {/* Only transformants grow (a few colonies) */}
                    {isLigationSuccess && Array.from({ length: Math.min(6, coloniesCount / 10) }).map((_, i) => <circle key={i} cx={15 + ((i * 9) % 30)} cy={20 + ((i * 7) % 30)} r="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />)}
                  </svg>
                  <span className="text-[7px] font-bold text-slate-400">โต {isLigationSuccess ? coloniesCount : 0} โคโลนี</span>
                </div>

                {/* Plate 3: LB + Amp + Ara */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[8px] font-bold text-slate-500">3. LB + Amp + Ara</span>
                  <svg viewBox="0 0 60 60" className="w-14 h-14 bg-slate-950 rounded-full border border-emerald-500/30 shadow-md">
                    {/* Transformants grow and GLOW GREEN under UV (with arabinose activator) */}
                    {isLigationSuccess && coloniesCount > 0 && Array.from({ length: Math.min(6, coloniesCount / 10) }).map((_, i) => <circle key={i} cx={15 + ((i * 9) % 30)} cy={20 + ((i * 7) % 30)} r="2.2" fill="#4ade80" className="animate-pulse shadow-[0_0_8px_#10b981]" />)}
                  </svg>
                  <span className="text-[7px] font-bold text-emerald-500">{isLigationSuccess ? coloniesCount : 0} โคโลนีเรืองแสง!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      }
      controlsTitle="ตั้งค่าพารามิเตอร์พันธุวิศวกรรม"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          {activeStage === "ligation" ? (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Scissors className="h-4.5 w-4.5 text-emerald-500" />
                ขั้นที่ 1: การตัดต่อด้วยเอนไซม์ Ligase
              </h3>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-500">เลือกเอนไซม์ตัดจำเพาะ (Restriction Enzyme)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setRestrictionEnzyme("EcoRI")} className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${restrictionEnzyme === "EcoRI" ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-black" : "border-slate-200 bg-white text-slate-500"}`}>
                    EcoRI (Sticky Ends)
                  </button>
                  <button type="button" onClick={() => setRestrictionEnzyme("HindIII")} className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${restrictionEnzyme === "HindIII" ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-black" : "border-slate-200 bg-white text-slate-500"}`}>
                    HindIII (Blunt/Mismatch)
                  </button>
                </div>
              </div>

              <button onClick={handleRunLigation} disabled={isLigating} className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer">
                <Play className="h-3.5 w-3.5" />
                ผสม Ligase & บ่มต่อสายยีน
              </button>
            </section>
          ) : activeStage === "transformation" ? (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <Thermometer className="h-4.5 w-4.5 text-emerald-500" />
                ขั้นที่ 2: ตั้งค่าช็อกความร้อน (Heat Shock)
              </h3>

              <ManualNumberInput label="ระยะเวลาช็อกความร้อน (วินาที)" ariaLabel="เวลาช็อกความร้อน" value={heatShockTime} min={20} max={80} step={5} onChange={setHeatShockTime} tone="emerald" />

              <ManualNumberInput label="อุณหภูมิเหนี่ยวนำ (°C)" ariaLabel="อุณหภูมิช็อกความร้อน" value={heatShockTemp} min={30} max={50} step={1} onChange={setHeatShockTemp} tone="emerald" />

              <button onClick={handleRunHeatShock} disabled={isShocking} className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer">
                <Zap className="h-3.5 w-3.5" />
                ทำปฏิกิริยา Heat Shock
              </button>
            </section>
          ) : (
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                ขั้นที่ 3: ตรวจสอบและบันทึกจดบันทึก
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">กรุณาตรวจสอบจำนวนโคโลนีแบคทีเรียบนจานเพาะเชื้อ LB + Amp + Ara ที่เรืองแสงสีเขียวภายใต้รังสี UV แล้วบันทึกจุดวัดลงในสมุดผล</p>
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
          <button onClick={() => setHeatShockTime((t) => Math.max(20, t - 5))} className="px-2 py-1 text-xs font-bold rounded bg-slate-100">
            Time -5s
          </button>
          <button onClick={() => setHeatShockTime((t) => Math.min(80, t + 5))} className="px-2 py-1 text-xs font-bold rounded bg-slate-100">
            Time +5s
          </button>
          <button onClick={handleReset} className="px-2 py-1 text-xs font-bold rounded bg-emerald-500 text-white">
            Reset
          </button>
        </div>
      }
      metrics={[
        { label: "ประสิทธิภาพแปลงพันธุ์ (Efficiency)", value: `${transformationEfficiency} cfu/μg`, tone: "emerald" },
        { label: "จำนวนโคโลนี E. coli ที่เรืองแสง", value: isLigationSuccess ? `${coloniesCount} โคโลนี` : "0 โคโลนี", tone: "orange" },
        { label: "สถานะ Ligation สายคู่", value: isLigationDone ? (isLigationSuccess ? "ต่อต่อสำเร็จ" : "ล้มเหลว") : "ยังไม่รันปฏิกิริยา", tone: "violet" },
        { label: "ระบบควบคุมอุณหภูมิช็อกความร้อน", value: `${heatShockTemp}°C สำหรับ ${heatShockTime} วินาที`, tone: undefined }
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
              ประสิทธิภาพต่อเวลาช็อกความร้อน (Efficiency vs Shock Duration)
            </h3>
          </div>
          <div className="flex-grow flex items-center justify-center">
            {loggedRuns.length === 0 ? (
              <div className="text-xs text-slate-400">จดบันทึกการแปลงยีนพลาสมิดเพื่อพลอตกราฟสะสม</div>
            ) : (
              <svg viewBox="0 0 200 120" className="w-full max-w-[240px] h-auto">
                <line x1="15" y1="100" x2="185" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="15" y1="10" x2="15" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                {loggedRuns.map((r, i) => {
                  const cx = 15 + (r.heatShockTime / 80) * 165;
                  const cy = 100 - (r.efficiency / 1000) * 80;
                  return (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="3" fill="#10b981" />
                      {i > 0 && <line x1={15 + (loggedRuns[i - 1].heatShockTime / 80) * 165} y1={100 - (loggedRuns[i - 1].efficiency / 1000) * 80} x2={cx} y2={cy} stroke="#a7f3d0" strokeWidth="1.2" />}
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
              ตารางบันทึกการทดลอง Transformation
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
            <div className="flex-grow flex items-center justify-center text-xs text-slate-400 py-10">ยังไม่มีการบันทึกการแปลงพันธุ์</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center">ชุด</th>
                    <th className="p-2">เอนไซม์ตัดต่อ</th>
                    <th className="p-2">เวลาช็อก</th>
                    <th className="p-2">อุณหภูมิช็อก</th>
                    <th className="p-2">ต่อสายสำเร็จ</th>
                    <th className="p-2">ประสิทธิภาพ</th>
                    <th className="p-2">จำนวนโคโลนี</th>
                    <th className="p-2">เรืองแสง UV</th>
                    <th className="p-2 text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  {loggedRuns.map((r) => (
                    <tr key={r.index} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-bold">{r.index}</td>
                      <td className="p-2 font-sans">{r.restrictionEnzyme}</td>
                      <td className="p-2">{r.heatShockTime} วินาที</td>
                      <td className="p-2">{r.heatShockTemp}°C</td>
                      <td className="p-2 font-sans">{r.ligationSuccess ? "สำเร็จ" : "ล้มเหลว"}</td>
                      <td className="p-2 font-bold text-emerald-700">{r.efficiency}</td>
                      <td className="p-2">{r.coloniesCount}</td>
                      <td className="p-2 font-sans">{r.glowsUnderUv ? "เรืองแสง" : "ไม่เรืองแสง"}</td>
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
      learningGoals={["เรียนรู้วิธีการเลือกเอนไซม์ตัดจำเพาะที่มีมุมตัดเข้าคู่กันเหนี่ยวนำให้ Ligase เชื่อมยีนสำเร็จ", "วิเคราะห์บทบาทของแคลเซียมคลอไรด์และการช็อกความร้อน (Heat Shock) ในการสั่นคลอนเยื่อหุ้มเซลล์เปิดรูรับพลาสมิด", "สังเกตการณ์ใช้ยีนต้านยาปฏิชีวนะร่วมกับสารอินดิวเซอร์อาหรับในการกระตุ้นยีนเป้าหมาย GFP ให้เรืองแสงในอาหาร LB"]}
      steps={[
        { label: "เลือกใช้เอนไซม์ตัดจำเพาะกับพลาสมิดและยีนเป้าหมายให้มีมุมตัดเข้าคู่กัน", icon: Scissors },
        { label: "รันการบ่มผสม Ligase เพื่อเชื่อมสายคู่ และเข้าสู่โหมดปรับเวลาอุณหภูมิช็อก", icon: Sliders },
        { label: "กดสวิตช์ทำปฏิกิริยาช็อกความร้อนแล้วทาสารละลาย E. coli บนจานวุ้นเพาะ LB", icon: Zap },
        { label: "ตรวจสอบการขึ้นโคโลนีใต้แสง UV บันทึกประสิทธิภาพการส่งถ่าย และส่งรายงานการบันทึก", icon: ClipboardList }
      ]}
      progressLabel="ความคืบหน้าพันธุวิศวกรรม"
      progressValue={questProgress === 100 ? "เหนี่ยวนำพลาสมิดเข้าแบคทีเรียสำเร็จสมบูรณ์" : `บันทึกข้อมูลผลลัพธ์แล้ว ${loggedRuns.length}/3 รอบ`}
      progressPercent={questProgress}
      tips={["หากเลือกเอนไซม์ HindIII ที่ไม่มีตำแหน่งตัดที่เข้าคู่กัน การต่อสายยีนพลาสมิด (Ligation) จะล้มเหลวทันที", "สภาวะการทำ Heat Shock ที่ดีที่สุดสำหรับ E. coli คืออุณหภูมิ 42 องศาเซลเซียส เป็นเวลา 45 วินาทีเป๊ะๆ", "จานวุ้นชนิด LB + Amp + Ara มีสารอาราบิโนสเป็นตัวเหนี่ยวนำกระตุ้นให้ยีน GFP สังเคราะห์โปรตีนเรืองแสงสีเขียวเด่นชัด"]}
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">การสร้างดีเอ็นเอสายผสมและการแปลงพันธุ์แบคทีเรีย (Recombinant DNA & Transformation)</p>
          <p className="mb-3">รากฐานเทคโนโลยีชีวภาพสำหรับการผลิตอินซูลินและยาดังนี้:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>Restriction Enzymes:</strong> เอนไซม์ตัดจำเพาะตัดที่ตำแหน่งสมมาตรร่วมของนิวคลีโอไทด์จนได้ปลายเหนียว (Sticky Ends)
            </li>
            <li>
              <strong>DNA Ligase:</strong> สร้างพันธะฟอสโฟไดเอสเทอร์เชื่อมต่อกระดูกสันหลังดีเอ็นเอคู่สมให้กลมกลืนเป็นเส้นเดียว
            </li>
            <li>
              <strong>Competent Cells:</strong> การบ่มเซลล์ E. coli ด้วย CaCl₂ ที่ 0°C ทำให้ขั้วประจุลบของฟอสเฟตผ่านผนังเซลล์ได้ง่าย
            </li>
            <li>
              <strong>Heat Shock (42°C for 45s):</strong> ความต่างอุณหภูมิฉับพลันทำให้ผนังและเยื่อหุ้มเซลล์ยืดเปิดออกจนพลาสมิดหลุดเข้าภายในเซลล์ E. coli
            </li>
            <li>
              <strong>pGLO Plasmid:</strong> พลาสมิดพาหะที่บรรจุยีนเป้าหมาย GFP, ยีนต้านแอมพิซิลลิน ampr, และยีนควบคุม araC
            </li>
          </ul>
        </div>
      }
      onSave={handleSaveResults}
    />
  );
}
