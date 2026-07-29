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
import CompactRangeControl from "@/components/labs/simulation/CompactRangeControl";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedFlowRun {
  index: number;
  flowRate: string;
  dyeConc: number; // μg/mL
  cellsAnalyzed: number;
  g1Percent: number;
  sPercent: number;
  g2mPercent: number;
  cvPercent: number; // Coefficient of Variation (resolution quality)
}

export default function FlowCytometrySimulation() {
  const labId = "flow-cytometry-cycle";

  const [flowRate, setFlowRate] = useState<"slow" | "medium" | "fast">("slow");
  const [dyeConc, setDyeConc] = useState<number>(1.0); // μg/mL

  // Simulation Running State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedCount, setScannedCount] = useState<number>(0);
  const [activeCellDot, setActiveCellDot] = useState<{ y: number; light: boolean }>({ y: 0, light: false });

  const [loggedRuns, setLoggedRuns] = useState<LoggedFlowRun[]>([]);

  // Simulation parameters calculations:
  // Fast flow rate increases CV (wider peaks, less resolution due to alignment drift)
  // Optimal PI dye concentration is 1.0 μg/mL. Too low or too high decreases resolution.
  const cvPercent = useMemo(() => {
    let baseCv = 3.0;
    if (flowRate === "medium") baseCv += 2.5;
    if (flowRate === "fast") baseCv += 6.0;

    const dyeDev = Math.abs(dyeConc - 1.0);
    baseCv += dyeDev * 5.0;
    return parseFloat(baseCv.toFixed(1));
  }, [flowRate, dyeConc]);

  // Proportions of cell cycle phases (in a healthy cancer line: e.g. G1=55%, S=25%, G2/M=20%)
  const g1Percent = 55;
  const sPercent = 25;
  const g2mPercent = 20;

  // Scanning loop timer
  useEffect(() => {
    if (!isScanning) return;

    // Capitalize on ponytail: simple flow animation
    let yPos = 0;
    const animTimer = setInterval(() => {
      yPos += 15;
      if (yPos > 120) {
        yPos = 0;
      }
      const hitLaser = yPos >= 55 && yPos <= 65;
      setActiveCellDot({ y: yPos, light: hitLaser });

      if (hitLaser) {
        setScannedCount((c) => {
          if (c >= 1000) {
            setIsScanning(false);
            clearInterval(animTimer);
            return 1000;
          }
          const add = flowRate === "slow" ? 25 : flowRate === "medium" ? 60 : 120;
          return Math.min(1000, c + add);
        });
      }
    }, 40);

    return () => {
      clearInterval(animTimer);
    };
  }, [isScanning, flowRate]);

  const handleStartScan = () => {
    setScannedCount(0);
    setIsScanning(true);
  };

  const createCurrentRun = (index: number): LoggedFlowRun => ({
      index,
      flowRate: flowRate === "slow" ? "ช้า (Slow)" : flowRate === "medium" ? "กลาง (Medium)" : "เร็ว (Fast)",
      dyeConc,
      cellsAnalyzed: scannedCount || 1000,
      g1Percent,
      sPercent,
      g2mPercent,
      cvPercent
    });

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setFlowRate("slow");
    setDyeConc(1.0);
    setIsScanning(false);
    setScannedCount(0);
    setActiveCellDot({ y: 0, light: false });
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุดที่\tอัตราการไหล\tความเข้มข้นสีย้อม (μg/mL)\tเซลล์ที่วิเคราะห์\tG1 (%)\tS (%)\tG2/M (%)\tCV (%)\n";
    const rows = loggedRuns.map((r) => `${r.index}\t${r.flowRate}\t${r.dyeConc}\t${r.cellsAnalyzed}\t${r.g1Percent}\t${r.sPercent}\t${r.g2mPercent}\t${r.cvPercent}`);
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map((r) => `${r.index},${r.flowRate},${r.dyeConc},${r.cellsAnalyzed},${r.g1Percent},${r.sPercent},${r.g2mPercent},${r.cvPercent}`);
    const csv = "data:text/csv;charset=utf-8," + ["Index,FlowRate,DyeConc,CellsAnalyzed,G1Percent,SPercent,G2MPercent,CvPercent", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "flow_cytometry_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    const runs = [...loggedRuns, createCurrentRun(loggedRuns.length + 1)];
    setLoggedRuns(runs);
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_flow_cytometry_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns: runs },
      labId,
      title: "Flow Cytometry Cell Analysis",
      variables: { flowRate, dyeConc },
      liveValues: { cvPercent, scannedCount },
      graphPoints: runs.map((r) => ({ index: r.index, x: r.dyeConc, y: r.cvPercent })),
      tableRows: runs,
      summary: { runsCount: runs.length, minCv: Math.min(...runs.map((r) => r.cvPercent)) },
      score: Math.min(100, Math.max(40, 40 + runs.length * 15)),
      durationSeconds: null
    });
  };

  const questProgress = Math.min(100, Math.round((loggedRuns.length / 3) * 100));

  return (
    <SharedSimulationShell
      accent="emerald"
      labId="flow-cytometry-cycle"
      category="Biology"
      title="Flow Cytometry Cell Analysis"
      subtitle="วิเคราะห์ปริมาณดีเอ็นเอของเซลล์เดี่ยวผ่านทางแสงกระเจิงและสัญญาณเรืองแสงฟลูออเรสเซนส์ เพื่อระบุสัดส่วนระยะในวัฏจักรเซลล์"
      statusLabel={`ระบบ: ${isScanning ? `กำลังลำเลียงเรียงกระแสเซลล์ ${scannedCount}/1000 cells` : "สแกนสำเร็จ"}`}
      icon={Activity}
      sceneTitle="วิชวลระบบ Hydrodynamic Focusing (Capillary Stage)"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_48%,#f6fdf9_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          {/* Flow Capillary SVG */}
          <div className="relative flex-grow flex items-center justify-center">
            <div className="flex flex-col items-center w-full max-w-[280px]">
              <span className="text-[10px] font-bold text-slate-500 mb-2">ท่อของไหลและจุดโฟกัสเลเซอร์ (FSC/SSC Scan)</span>
              <svg viewBox="0 0 120 140" className="w-full max-w-[140px] h-auto overflow-visible rounded-xl border border-emerald-200/70 bg-slate-950 p-2 shadow-inner">
                {/* Flow Tube path */}
                <path d="M 30,0 L 50,45 L 50,95 L 30,140" fill="none" stroke="#475569" strokeWidth="2.5" />
                <path d="M 90,0 L 70,45 L 70,95 L 90,140" fill="none" stroke="#475569" strokeWidth="2.5" />

                {/* Laser beam (blue/violet) horizontal crossing */}
                <line x1="10" y1="60" x2="110" y2="60" stroke="#00d2ff" strokeWidth="3" opacity="0.8" className="animate-pulse" />
                <text x="100" y="55" fill="#00d2ff" fontSize="6.5" fontWeight="bold" textAnchor="end">
                  Laser (488nm)
                </text>

                {/* Hydrodynamic aligned cell dot */}
                {isScanning && activeCellDot.y > 0 && (
                  <g>
                    <circle cx="60" cy={activeCellDot.y} r="4" fill={activeCellDot.light ? "#22c55e" : "#eab308"} className={activeCellDot.light ? "shadow-[0_0_12px_#22c55e] animate-ping" : ""} />
                    {activeCellDot.light && (
                      <g>
                        {/* Scattering photons */}
                        <line x1="60" y1="60" x2="40" y2="35" stroke="#4ade80" strokeWidth="1" />
                        <line x1="60" y1="60" x2="15" y2="60" stroke="#f43f5e" strokeWidth="1" />
                        <text x="18" y="70" fill="#f43f5e" fontSize="5" fontWeight="bold">
                          FSC/SSC
                        </text>
                      </g>
                    )}
                  </g>
                )}

                {/* Background sheath fluid arrows */}
                <path d="M 38,10 L 44,25" fill="none" stroke="#3b82f6" strokeWidth="1" markerEnd="url(#arrow)" opacity="0.5" />
                <path d="M 82,10 L 76,25" fill="none" stroke="#3b82f6" strokeWidth="1" markerEnd="url(#arrow)" opacity="0.5" />
              </svg>
            </div>
          </div>
        </div>
      }
      controlsTitle="ควบคุมระบบโฟลว์ไซโตเมทรี"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-emerald-500" />
              อัตราการไหล & การย้อมเรืองแสง
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500">อัตราการไหลของไหล (Sheath Flow Rate)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["slow", "medium", "fast"] as const).map((rate) => (
                  <button key={rate} type="button" onClick={() => setFlowRate(rate)} className={`rounded-lg border py-1.5 text-xs font-bold transition-all ${flowRate === rate ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-extrabold" : "border-slate-200 bg-white text-slate-500"}`}>
                    {rate === "slow" ? "ช้า" : rate === "medium" ? "กลาง" : "เร็ว"}
                  </button>
                ))}
              </div>
            </div>

            <ManualNumberInput label="ความเข้มข้นสีย้อมดีเอ็นเอ (PI Dye μg/mL)" ariaLabel="ความเข้มข้นสีย้อม" value={dyeConc} min={0.2} max={2.0} step={0.2} onChange={setDyeConc} tone="emerald" />

            <button onClick={handleStartScan} disabled={isScanning} className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer">
              <Play className="h-3.5 w-3.5" />
              รันสแกนเซลล์เดี่ยว
            </button>
          </section>
        </div>
      }
      compactControls={
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
          <CompactRangeControl label="ความเข้มข้นสีย้อม PI" symbol="C" value={dyeConc} min={0.2} max={2} step={0.2} precision={1} unit="μg/mL" tone="emerald" onChange={setDyeConc} />
          <fieldset className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
            <legend className="px-1 text-xs font-bold text-slate-600">อัตราการไหล</legend>
            <div className="mt-1 grid grid-cols-3 gap-1.5">
              {(["slow", "medium", "fast"] as const).map((rate) => (
                <button key={rate} type="button" onClick={() => setFlowRate(rate)} className={`min-h-9 rounded-xl border px-2 text-xs font-black ${flowRate === rate ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}>
                  {rate === "slow" ? "ช้า" : rate === "medium" ? "กลาง" : "เร็ว"}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      }
      metrics={[
        { label: "ความละเอียดการสแกน (Peak CV)", value: `${cvPercent}%`, tone: cvPercent < 5.0 ? "emerald" : "orange" },
        { label: "จำนวนเซลล์สแกนสะสม", value: `${scannedCount} cells`, tone: "emerald" },
        { label: "สัดส่วนประชากรเฟส G1 (2n)", value: `${g1Percent}%`, tone: undefined },
        { label: "สัดส่วนประชากรเฟส G2/M (4n)", value: `${g2mPercent}%`, tone: undefined }
      ]}
      graph={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
              สเปกตรัมปริมาณ DNA (DNA Cell Cycle Histogram)
            </h3>
          </div>
          <div className="flex-grow flex flex-col items-center justify-center p-2">
            <span className="text-[9px] font-bold text-slate-400 self-start mb-1">ความละเอียด: CV = {cvPercent}%</span>
            <svg viewBox="0 0 200 110" className="w-full max-w-[240px] h-auto overflow-visible">
              {/* Axes */}
              <line x1="20" y1="90" x2="190" y2="90" stroke="#94a3b8" strokeWidth="1" />
              <line x1="20" y1="10" x2="20" y2="90" stroke="#94a3b8" strokeWidth="1" />

              {/* DNA cell cycle distribution path */}
              {/* Peak 1 at 2n (G1), Peak 2 at 4n (G2/M) with intermediate S phase valley */}
              {/* Peak width changes based on resolution CV */}
              <path
                d={`M 20,90 Q 45,90 55,${90 - (100 / cvPercent) * 2} Q 60,${90 - (100 / cvPercent) * 3} 65,${90 - (100 / cvPercent) * 2} T 80,85 Q 105,85 110,${90 - (50 / cvPercent) * 2} Q 115,${90 - (50 / cvPercent) * 2.8} 120,${90 - (50 / cvPercent) * 2} T 140,90 L 190,90`}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2"
              />

              {/* G1 & G2 labels */}
              <text x="60" y="102" fill="#64748b" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                G1 (2n)
              </text>
              <text x="85" y="102" fill="#64748b" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                S Phase
              </text>
              <text x="115" y="102" fill="#64748b" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                G2/M (4n)
              </text>
            </svg>
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <ClipboardList className="h-4.5 w-4.5 text-emerald-500" />
              ตารางบันทึกสัญญาณวิเคราะห์โฟลว์
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
            <div className="flex-grow flex items-center justify-center text-xs text-slate-400 py-10">ยังไม่มีการบันทึกผลสแกน</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center">ชุด</th>
                    <th className="p-2">อัตราการไหล</th>
                    <th className="p-2">สีย้อม (μg/mL)</th>
                    <th className="p-2">เซลล์ที่นับ</th>
                    <th className="p-2">G1 Phase</th>
                    <th className="p-2">S Phase</th>
                    <th className="p-2">G2/M Phase</th>
                    <th className="p-2">Peak CV</th>
                    <th className="p-2 text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  {loggedRuns.map((r) => (
                    <tr key={r.index} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-bold">{r.index}</td>
                      <td className="p-2 font-sans">{r.flowRate}</td>
                      <td className="p-2">{r.dyeConc} μg/mL</td>
                      <td className="p-2">{r.cellsAnalyzed} cells</td>
                      <td className="p-2 text-sky-700">{r.g1Percent}%</td>
                      <td className="p-2">{r.sPercent}%</td>
                      <td className="p-2">{r.g2mPercent}%</td>
                      <td className={`p-2 font-bold ${r.cvPercent < 5.0 ? "text-emerald-700" : "text-amber-700"}`}>{r.cvPercent}%</td>
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
      learningGoals={["เรียนรู้ทฤษฎีกลไก Hydrodynamic Focusing ในการลำเลียงเซลล์ให้เรียงเดี่ยวผ่านสัญญาณเลเซอร์สแกน", "ศึกษาผลกระทบของ Sheath Flow Rate ต่อความแปรปรวนของการเบี่ยงเบนสัญญาณสะสม (Peak CV)", "วิเคราะห์และจำแนกระยะ G1, S, และ G2/M ของประชากรเซลล์จากการสว่างเรืองแสงปริมาณดีเอ็นเอ"]}
      steps={[
        { label: "กำหนดSheath Flow Rate (อัตราการไหลของน้ำยาหุ้ม) และความเข้มข้นของสีย้อม PI", icon: Sliders },
        { label: "กดรันสแกนโฟลว์และสังเกตลักษณะเซลล์เรียงเดี่ยวสะท้อนสัญญาณไฟเมื่อข้ามลำเลเซอร์", icon: Target },
        { label: "เปรียบเทียบความคมชัดของพีคสเปกตรัมที่ได้ตามผลกระทบของ CV ที่ปรับจูน", icon: Zap },
        { label: "บันทึกข้อมูลผลสัมฤทธิ์ลงตาราง สังเกตแนวโน้มขีดจำกัดความจำเพาะของเครื่องชี้วัด", icon: ClipboardList }
      ]}
      progressLabel="ความคืบหน้ากิจกรรมวิเคราะห์เซลล์"
      progressValue={questProgress === 100 ? "วิเคราะห์และรายงานวัฏจักรเซลล์สำเร็จสมบูรณ์" : `เก็บข้อมูลจุดทดสอบแล้ว ${loggedRuns.length}/3 รอบ`}
      progressPercent={questProgress}
      tips={["Sheath Flow Rate แบบช้า (Slow Flow) ให้ความแม่นยำสูงที่สุด ส่งผลให้ Peak CV แคบคมชัดเจน", "ความเข้มข้นสีย้อม PI ย้อมดีเอ็นเอที่ 1.0 μg/mL คือสภาวะเกลือสมดุลที่ดีที่สุดสำหรับการคัดแยกพีคยอด", "ระยะ G2/M จะมีปริมาณสารพันธุกรรมดีเอ็นเอเป็น 2 เท่า (4n) ของระยะ G1 (2n) จึงเรืองแสงสว่างกว่าเป็น 2 เท่า"]}
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">เครื่องวิเคราะห์ลักษณะเซลล์ไหลเดี่ยว (Flow Cytometry)</p>
          <p className="mb-3">เครื่องมือวิทยาศาสตร์ชีวการแพทย์ขั้นสูงสำหรับวิเคราะห์ลักษณะรายเซลล์แบบความเร็วสูง:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>Hydrodynamic Focusing:</strong> การปล่อยของเหลว Sheath Fluid บีบรัดแนวไหลจนเซลล์เรียงแถวเดี่ยวผ่านหัววัดได้อย่างแม่นยำ
            </li>
            <li>
              <strong>Forward Scatter (FSC):</strong> การหักเหกระเจิงแสงมุมเฉียงข้างหน้า บอกลักษณะและขนาดความกว้างภายนอกเซลล์
            </li>
            <li>
              <strong>Side Scatter (SSC):</strong> การหักเหกระเจิงแสงมุมข้างฉาก 90 องศา บอกความขรุขระเม็ดแกรนูลภายในไซโตพลาสซึม
            </li>
            <li>
              <strong>DNA Index / Histogram:</strong> การเรืองแสงสีย้อม Propidium Iodide (PI) จับคู่เบสดีเอ็นเอ บ่งชี้ระยะวัฏจักร G1, S, และ G2/M
            </li>
          </ul>
        </div>
      }
      onRun={handleStartScan}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}

