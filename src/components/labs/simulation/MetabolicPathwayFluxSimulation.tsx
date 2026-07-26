"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Sliders,
  ClipboardList,
  Activity,
  Play,
  Zap,
  Sparkles,
  Clipboard,
  Download,
  Trash,
  Target,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedFluxRun {
  index: number;
  nutrientSource: string;
  oxygenLevel: string;
  glycolysisFlux: number; // mmol/g/h
  tcaFlux: number; // mmol/g/h
  lactateFlux: number; // mmol/g/h
  atpProduction: number; // relative ATP yield
}

export default function MetabolicPathwayFluxSimulation() {
  const labId = "metabolic-pathway-flux";

  const [nutrientSource, setNutrientSource] = useState<"glucose" | "fatty_acids">("glucose");
  const [oxygenLevel, setOxygenLevel] = useState<"low" | "normal" | "high">("normal");

  // Running Ticker State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);
  const [loggedRuns, setLoggedRuns] = useState<LoggedFluxRun[]>([]);

  // Simulation Calculations:
  // Flux values depend on nutrient source and oxygen level
  const glycolysisFlux = useMemo(() => {
    if (nutrientSource === "fatty_acids") return 5; // glycolysis is suppressed during fatty acid oxidation (glucose sparing)
    return oxygenLevel === "low" ? 45 : 20; // anaerobic glycolysis runs faster to compensate for low ATP
  }, [nutrientSource, oxygenLevel]);

  const tcaFlux = useMemo(() => {
    if (oxygenLevel === "low") return 2; // TCA cycle slows down due to high NADH/NAD ratio without oxygen
    return nutrientSource === "glucose" ? 22 : 35; // Fatty acids feed directly into Acetyl-CoA, boosting TCA cycle flux
  }, [nutrientSource, oxygenLevel]);

  const lactateFlux = useMemo(() => {
    if (nutrientSource === "fatty_acids" || oxygenLevel !== "low") return 0.5;
    return 38; // anaerobic fermentation
  }, [nutrientSource, oxygenLevel]);

  const atpProduction = useMemo(() => {
    if (oxygenLevel === "low") {
      return glycolysisFlux * 2 + lactateFlux * 0; // only glycolysis yield
    }
    // Aerobic yield: glucose yields ~32 ATP, fatty acid yields ~108 ATP
    return nutrientSource === "glucose" ? 32 : 108;
  }, [nutrientSource, oxygenLevel, glycolysisFlux, lactateFlux]);

  // Simulation loop ticker
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setSimTime((t) => {
        if (t >= 30) {
          setIsSimulating(false);
          return 30;
        }
        return t + 1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isSimulating]);

  const handleStartSim = () => {
    setIsSimulating(true);
    setSimTime(0);
  };

  const createCurrentRun = (index: number): LoggedFluxRun => ({
      index,
      nutrientSource: nutrientSource === "glucose" ? "กลูโคส (Glucose)" : "กรดไขมัน (Fatty Acids)",
      oxygenLevel: oxygenLevel === "low" ? "ต่ำ (Low)" : oxygenLevel === "normal" ? "ปกติ (Normal)" : "สูง (High)",
      glycolysisFlux,
      tcaFlux,
      lactateFlux,
      atpProduction
    });

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setNutrientSource("glucose");
    setOxygenLevel("normal");
    setIsSimulating(false);
    setSimTime(0);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุดที่\tแหล่งพลังงาน\tระดับออกซิเจน\tGlycolysis Flux\tTCA Flux\tLactate Flux\tผลผลิต ATP\n";
    const rows = loggedRuns.map((r) => `${r.index}\t${r.nutrientSource}\t${r.oxygenLevel}\t${r.glycolysisFlux}\t${r.tcaFlux}\t${r.lactateFlux}\t${r.atpProduction}`);
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map((r) => `${r.index},${r.nutrientSource},${r.oxygenLevel},${r.glycolysisFlux},${r.tcaFlux},${r.lactateFlux},${r.atpProduction}`);
    const csv = "data:text/csv;charset=utf-8," + ["Index,NutrientSource,OxygenLevel,GlycolysisFlux,TcaFlux,LactateFlux,AtpProduction", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "metabolic_flux_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    const runs = [...loggedRuns, createCurrentRun(loggedRuns.length + 1)];
    setLoggedRuns(runs);
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_metabolic_flux_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns: runs },
      labId,
      title: "Metabolic Pathway Flux Analysis",
      variables: { nutrientSource, oxygenLevel },
      liveValues: { glycolysisFlux, tcaFlux, lactateFlux, atpProduction },
      graphPoints: runs.map((r) => ({ index: r.index, x: r.glycolysisFlux, y: r.atpProduction })),
      tableRows: runs,
      summary: { runsCount: runs.length, maxAtp: Math.max(...runs.map((r) => r.atpProduction)) },
      score: Math.min(100, Math.max(40, 40 + runs.length * 15)),
      durationSeconds: null
    });
    alert("บันทึกรายงานฟลักซ์ทางชีววิทยาระดับเซลล์สำเร็จ");
  };

  const questProgress = Math.min(100, Math.round((loggedRuns.length / 3) * 100));

  return (
    <SharedSimulationShell
      accent="emerald"
      labId="metabolic-pathway-flux"
      category="Biology"
      title="Metabolic Pathway Flux Analysis"
      subtitle="จำลองอัตราการไหลของฟลักซ์สารเคมีชีวภาพข้าม Glycolysis, TCA Cycle และวิถีแลคเตท เพื่อเปรียบเทียบการผลิตพลังงาน ATP"
      statusLabel={`ระบบ: ${isSimulating ? `กำลังรันการสลายตัวของสารอาหาร ${simTime} ชม.` : "พร้อมทำงาน"}`}
      icon={Activity}
      sceneTitle="แผนภูมิวิถีชีวเคมีเมแทบอลิซึม (Metabolic Pathway Chart)"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_48%,#f6fdf9_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          {/* Pathway Flowchart SVG */}
          <div className="relative flex-grow flex items-center justify-center">
            <div className="flex flex-col items-center w-full max-w-[320px]">
              <span className="text-[10px] font-bold text-slate-500 mb-2">เครือข่าย Glycolysis & TCA Cycle & Fermentation</span>
              <svg viewBox="0 0 200 130" className="w-full h-auto overflow-visible rounded-xl border border-emerald-200/70 bg-slate-900 p-2 shadow-inner">
                {/* Glycolysis node (top) */}
                <rect x="70" y="10" width="60" height="20" rx="3" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                <text x="100" y="22" fill="#60a5fa" fontSize="7" fontWeight="bold" textAnchor="middle">
                  Glycolysis
                </text>

                {/* Pyruvate / Acetyl-CoA intermediate node */}
                <rect x="70" y="50" width="60" height="20" rx="3" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1" />
                <text x="100" y="62" fill="#a78bfa" fontSize="7" fontWeight="bold" textAnchor="middle">
                  Acetyl-CoA
                </text>

                {/* TCA cycle circle node */}
                <circle cx="100" cy="100" r="16" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                <text x="100" y="102" fill="#34d399" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                  TCA Cycle
                </text>

                {/* Lactic Acid Fermentation node (left) */}
                <rect x="10" y="50" width="50" height="20" rx="3" fill="#1e293b" stroke="#f43f5e" strokeWidth="1" />
                <text x="35" y="62" fill="#f43f5e" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                  Lactate
                </text>

                {/* Flow lines with animated flow particle dots */}
                {/* 1. Glycolysis to Acetyl-CoA */}
                <path d="M 100,30 L 100,50" fill="none" stroke="#64748b" strokeWidth="1.5" />
                {isSimulating && glycolysisFlux > 10 && <circle cx="100" cy={30 + ((simTime * 2) % 20)} r="2" fill="#3b82f6" className="animate-pulse" />}

                {/* 2. Acetyl-CoA to TCA */}
                <path d="M 100,70 L 100,84" fill="none" stroke="#64748b" strokeWidth="1.5" />
                {isSimulating && tcaFlux > 5 && <circle cx="100" cy={70 + ((simTime * 2) % 14)} r="2" fill="#10b981" className="animate-pulse" />}

                {/* 3. Pyruvate to Lactate (fermentation) */}
                <path d="M 70,60 L 60,60" fill="none" stroke="#64748b" strokeWidth="1.5" />
                {isSimulating && lactateFlux > 10 && <circle cx="70 - (simTime * 2) % 10" cy="60" r="2" fill="#f43f5e" className="animate-pulse" />}

                {/* Flux Rate Indicators */}
                <text x="106" y="42" fill="#60a5fa" fontSize="6" fontWeight="bold">
                  {glycolysisFlux} mmol
                </text>
                <text x="106" y="80" fill="#34d399" fontSize="6" fontWeight="bold">
                  {tcaFlux} mmol
                </text>
                {lactateFlux > 1 && (
                  <text x="40" y="45" fill="#f43f5e" fontSize="6" fontWeight="bold">
                    {lactateFlux} mmol
                  </text>
                )}
              </svg>
            </div>
          </div>
        </div>
      }
      controlsTitle="ควบคุมวิถีฟลักซ์เมแทบอลิซึม"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-emerald-500" />
              แหล่งป้อนสารอาหาร & ออกซิเจน
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500">ชนิดสารอาหารเป้าหมาย (Carbon Source)</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setNutrientSource("glucose")} className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${nutrientSource === "glucose" ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-black" : "border-slate-200 bg-white text-slate-500"}`}>
                  กลูโคส (Glucose)
                </button>
                <button type="button" onClick={() => setNutrientSource("fatty_acids")} className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${nutrientSource === "fatty_acids" ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-black" : "border-slate-200 bg-white text-slate-500"}`}>
                  กรดไขมัน (Fatty Acids)
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500">ระดับออกซิเจนเลี้ยงเซลล์ (Oxygen Supply)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["low", "normal", "high"] as const).map((level) => (
                  <button key={level} type="button" onClick={() => setOxygenLevel(level)} className={`rounded-lg border py-1.5 text-xs font-bold transition-all ${oxygenLevel === level ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-extrabold" : "border-slate-200 bg-white text-slate-500"}`}>
                    {level === "low" ? "ต่ำ" : level === "normal" ? "ปกติ" : "สูง"}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleStartSim} disabled={isSimulating} className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer">
              <Play className="h-3.5 w-3.5" />
              รันการจำลองอัตราฟลักซ์
            </button>
          </section>
        </div>
      }
      compactControls={
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
          <fieldset className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
            <legend className="px-1 text-xs font-bold text-slate-600">แหล่งพลังงาน</legend>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {(["glucose", "fatty_acids"] as const).map((source) => (
                <button key={source} type="button" onClick={() => setNutrientSource(source)} className={`min-h-9 rounded-xl border px-2 text-xs font-black ${nutrientSource === source ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}>
                  {source === "glucose" ? "กลูโคส" : "กรดไขมัน"}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
            <legend className="px-1 text-xs font-bold text-slate-600">ระดับออกซิเจน</legend>
            <div className="mt-1 grid grid-cols-3 gap-1.5">
              {(["low", "normal", "high"] as const).map((level) => (
                <button key={level} type="button" onClick={() => setOxygenLevel(level)} className={`min-h-9 rounded-xl border px-2 text-xs font-black ${oxygenLevel === level ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}>
                  {level === "low" ? "ต่ำ" : level === "normal" ? "ปกติ" : "สูง"}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      }
      metrics={[
        { label: "Glycolysis Pathway Flux", value: `${glycolysisFlux} mmol/g/h`, tone: "emerald" },
        { label: "TCA Cycle Activity Flux", value: `${tcaFlux} mmol/g/h`, tone: "emerald" },
        { label: "ผลผลิตพลังงาน ATP สัมบูรณ์", value: `${atpProduction} ATP`, tone: "orange" },
        { label: "Fermentation (Lactate) Flux", value: `${lactateFlux} mmol/g/h`, tone: lactateFlux > 5 ? "orange" : undefined }
      ]}
      graph={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
              ประสิทธิภาพผลผลิต ATP ต่อ Glycolysis Flux (ATP Yield vs Glycolysis)
            </h3>
          </div>
          <div className="flex-grow flex items-center justify-center">
            {loggedRuns.length === 0 ? (
              <div className="text-xs text-slate-400">จดบันทึกผลสลายอาหารเพื่อพลอตกราฟเปรียบเทียบ</div>
            ) : (
              <svg viewBox="0 0 200 120" className="w-full max-w-[240px] h-auto">
                <line x1="15" y1="100" x2="185" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="15" y1="10" x2="15" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                {loggedRuns.map((r, i) => {
                  const cx = 15 + (r.glycolysisFlux / 50) * 165;
                  const cy = 100 - (r.atpProduction / 120) * 80;
                  return (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="3" fill="#10b981" />
                      {i > 0 && <line x1={15 + (loggedRuns[i - 1].glycolysisFlux / 50) * 165} y1={100 - (loggedRuns[i - 1].atpProduction / 120) * 80} x2={cx} y2={cy} stroke="#a7f3d0" strokeWidth="1.2" />}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <ClipboardList className="h-4.5 w-4.5 text-emerald-500" />
              ตารางวิเคราะห์ฟลักซ์พลังงานเซลล์
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
            <div className="flex-grow flex items-center justify-center text-xs text-slate-400 py-10">ยังไม่มีการบันทึกฟลักซ์</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center">ชุด</th>
                    <th className="p-2">สารป้อนเข้า</th>
                    <th className="p-2">ออกซิเจน</th>
                    <th className="p-2">Glycolysis Flux</th>
                    <th className="p-2">TCA Flux</th>
                    <th className="p-2">Lactate Flux</th>
                    <th className="p-2">ผลผลิต ATP</th>
                    <th className="p-2 text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  {loggedRuns.map((r) => (
                    <tr key={r.index} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-bold">{r.index}</td>
                      <td className="p-2 font-sans">{r.nutrientSource}</td>
                      <td className="p-2 font-sans">{r.oxygenLevel}</td>
                      <td className="p-2 text-blue-700 font-bold">{r.glycolysisFlux}</td>
                      <td className="p-2 text-emerald-700 font-bold">{r.tcaFlux}</td>
                      <td className="p-2 text-rose-700">{r.lactateFlux}</td>
                      <td className="p-2 text-orange-700 font-bold">{r.atpProduction} ATP</td>
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
      learningGoals={["เรียนรู้แผนผังวิถีการสลายสารอาหารข้าม Glycolysis และ TCA Cycle เพื่อสร้างพลังงานของสิ่งมีชีวิต", "ศึกษาผลสัมฤทธิ์ของออกซิเจน (Aerobic vs Anaerobic) ต่ออัตราการสับเปลี่ยนเส้นทางสร้างกรดแลคติก", "คำนวณและประเมินผลต่างประสิทธิภาพ ATP ระหว่างการสลายน้ำตาลกลูโคสเทียบกับการสลายกรดไขมัน (Beta Oxidation)"]}
      steps={[
        { label: "เลือกชนิดสารอาหารป้อนเข้า (Carbon Source) และระดับของก๊าซออกซิเจนหล่อเลี้ยงเซลล์", icon: Sliders },
        { label: "กดรันสลายและสังเกตอัตราไหลของอนุภาคฟลักซ์ทางเคมีข้ามท่อน้ำยางานจำลอง", icon: Target },
        { label: "เปรียบเทียบการผลิตพลังงาน ATP และอัตราการเกิดของเสีย (Lactate) ตามสภาวะควบคุม", icon: Zap },
        { label: "บันทึกข้อมูลวิถีพลังงานลงสมุดประวัติการทดลอง และวิเคราะห์แนวโน้มขีดความสามารถ", icon: ClipboardList }
      ]}
      progressLabel="ความคืบหน้าวิถีพลังงาน"
      progressValue={questProgress === 100 ? "วิเคราะห์และคำนวณฟลักซ์พลังงานสำเร็จ" : `เก็บข้อมูลจุดทดลองแล้ว ${loggedRuns.length}/3 รอบ`}
      progressPercent={questProgress}
      tips={["สภาวะออกซิเจนต่ำ (Low Oxygen) จะเหนี่ยวนำให้ Glycolysis ทำงานเร่งสปีดขึ้น และผลิตกรดแลคติกเพิ่มสูงขึ้นอย่างชัดเจน", "การสลายกรดไขมัน (Fatty Acid Oxidation) ให้พลังงาน ATP (108 ATP) สูงกว่าการสลายกลูโคส (32 ATP) หลายเท่าตัว", "ในสภาวะปกติ อัตราการเปลี่ยนแปลงสารขั้นกลางจะมีค่าคงที่ (Steady State) ทำให้อัตราป้อนเข้าเท่ากับอัตราออกไปต่อ"]}
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">วิถีอัตราไหลพลังงานเคมีระดับเซลล์ (Metabolic Pathway Flux Analysis)</p>
          <p className="mb-3">การวัดและคำนวณอัตราความเร็ว (Flux) ของปฏิกิริยาเคมีชีวภาพภายในเซลล์:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>Glycolysis:</strong> การสลายกลูโคส (คาร์บอน 6 อะตอม) เป็นไพรูเวต (คาร์บอน 3 อะตอม) ในไซโตโซล ได้ผลผลิตสุทธิ 2 ATP และ 2 NADH
            </li>
            <li>
              <strong>TCA Cycle (Krebs Cycle):</strong> เกิดขึ้นในไมโตคอนเดรีย นำ Acetyl-CoA มาสลายต่อเพื่อสร้าง NADH, FADH₂ ไปขับเคลื่อนกระบวนการ ETC
            </li>
            <li>
              <strong>Anaerobic Fermentation:</strong> ในสภาวะขาดออกซิเจน ไพรูเวตจะถูกรีดิวซ์เป็นกรดแลคติกเพื่อรีไซเคิล NAD+ ให้ Glycolysis ทำงานต่อไปได้
            </li>
            <li>
              <strong>Beta-Oxidation:</strong> การตัดกรดไขมันได้โมเลกุล Acetyl-CoA จำนวนมากป้อนเข้า TCA Cycle โดยตรงโดยไม่ต้องผ่าน Glycolysis
            </li>
          </ul>
        </div>
      }
      onRun={handleStartSim}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
