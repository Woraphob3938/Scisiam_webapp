"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Sliders,
  RotateCcw,
  ClipboardList,
  Activity,
  Play,
  Settings,
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

interface LoggedCrisprRun {
  index: number;
  gRNAComplement: number; // %
  pamPresent: boolean;
  repairPathway: string;
  efficiency: number; // %
  offTargetRisk: number; // %
  status: string;
}

export default function CrisprGeneEditingSimulation() {
  const labId = "crispr-gene-editing";

  const [gRNAComplement, setGRNAComplement] = useState<number>(90); // % matching
  const [pamPresent, setPamPresent] = useState<boolean>(true);
  const [repairPathway, setRepairPathway] = useState<"nhej" | "hdr">("nhej");

  // Playback/Cut animation state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editStep, setEditStep] = useState<"idle" | "targeting" | "cleaving" | "repairing" | "done">("idle");
  const [, setAnimProgress] = useState<number>(0);

  const [loggedRuns, setLoggedRuns] = useState<LoggedCrisprRun[]>([]);

  // Calculate efficiency & off-target risk
  const editingEfficiency = useMemo(() => {
    if (!pamPresent) return 0;
    // Efficiency scale: matching high = high efficiency
    return Math.max(0, Math.round(gRNAComplement * 0.95));
  }, [gRNAComplement, pamPresent]);

  const offTargetRisk = useMemo(() => {
    // Lower complementarity increases risk of off-target edits
    return Math.round(100 - gRNAComplement);
  }, [gRNAComplement]);

  // Cleavage & repair steps timer
  useEffect(() => {
    if (!isEditing) return;

    const steps = ["targeting", "cleaving", "repairing", "done"] as const;
    let stepIdx = 0;

    const timer = setInterval(() => {
      if (stepIdx >= steps.length) {
        setIsEditing(false);
        return;
      }
      setEditStep(steps[stepIdx]);
      setAnimProgress((p) => p + 25);
      stepIdx++;
    }, 1200);

    return () => clearInterval(timer);
  }, [isEditing]);

  const handleStartEditing = () => {
    setAnimProgress(0);
    setEditStep("targeting");
    setIsEditing(true);
  };

  const handleAddLog = () => {
    let finalStatus = "ล้มเหลว (ไร้จุดจับ)";
    if (editingEfficiency > 0) {
      finalStatus = repairPathway === "nhej" ? "Knock-out สำเร็จ" : "ยีน GFP แทรกสำเร็จ";
    }
    const run: LoggedCrisprRun = {
      index: loggedRuns.length + 1,
      gRNAComplement,
      pamPresent,
      repairPathway: repairPathway === "nhej" ? "NHEJ (ปิดการทำงาน)" : "HDR (ตัดต่อแทรกยีน)",
      efficiency: editingEfficiency,
      offTargetRisk,
      status: finalStatus
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setGRNAComplement(90);
    setPamPresent(true);
    setRepairPathway("nhej");
    setIsEditing(false);
    setEditStep("idle");
    setAnimProgress(0);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุดที่\tComplementarity (%)\tPAM Present\tวิถีการซ่อมแซม\tประสิทธิภาพการตัด (%)\tOff-target Risk (%)\tผลลัพธ์\n";
    const rows = loggedRuns.map((r) => `${r.index}\t${r.gRNAComplement}\t${r.pamPresent ? "มี" : "ไม่มี"}\t${r.repairPathway}\t${r.efficiency}\t${r.offTargetRisk}\t${r.status}`);
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map((r) => `${r.index},${r.gRNAComplement},${r.pamPresent},${r.repairPathway},${r.efficiency},${r.offTargetRisk},"${r.status}"`);
    const csv = "data:text/csv;charset=utf-8," + ["Index,Complementarity,PamPresent,RepairPathway,Efficiency,OffTargetRisk,Status", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "crispr_gene_editing_log.csv");
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
      localStorageKey: "scisiam_saved_crispr_gene_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "CRISPR-Cas9 Gene Editing",
      variables: { gRNAComplement, pamPresent, repairPathway },
      liveValues: { editingEfficiency, offTargetRisk },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.gRNAComplement, y: r.efficiency })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, maxEfficiency: Math.max(...loggedRuns.map((r) => r.efficiency)) },
      score: Math.min(100, Math.max(40, 40 + loggedRuns.length * 15)),
      durationSeconds: null
    });
    alert("บันทึกรายงานการตัดแต่งยีนสำเร็จ");
  };

  const questProgress = Math.min(100, Math.round((loggedRuns.length / 3) * 100));

  return (
    <SharedSimulationShell
      accent="emerald"
      labId="crispr-gene-editing"
      category="Biology"
      title="CRISPR-Cas9 Gene Editing"
      subtitle="จำลองการออกแบบ guide RNA (gRNA) นำทางโปรตีน Cas9 เข้าชี้ตำแหน่งเป้าหมายและเหนี่ยวนำกลไกการซ่อมแซมของโฮสต์เซลล์"
      statusLabel={`ระบบ: ${editStep === "idle" ? "กำลังรอคำสั่ง..." : editStep === "targeting" ? "Cas9 กำลังเข้าชี้เป้ายีน..." : editStep === "cleaving" ? "เอนไซม์กำลังตัดสายยีนคู่..." : editStep === "repairing" ? "โฮสต์เซลล์กำลังทำปฏิกิริยาซ่อมแซม..." : "ตัดแต่งยีนเสร็จสมบูรณ์"}`}
      icon={Settings}
      sceneTitle="วิชวลการทำปฏิกิริยาตัดสายยีน (Cas9 Action Stage)"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_48%,#f6fdf9_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          {/* Visual of DNA cleavage & repair */}
          <div className="relative flex-grow flex items-center justify-center">
            <div className="flex flex-col items-center w-full max-w-[340px]">
              <span className="text-[10px] font-bold text-slate-500 mb-2">โครงสร้างจำลอง CRISPR-Cas9 Complex</span>
              <svg viewBox="0 0 240 140" className="w-full h-auto overflow-visible rounded-xl border border-emerald-200/70 bg-slate-900 p-2 shadow-inner">
                {/* Double Stranded Host DNA */}
                <g stroke="#cbd5e1" strokeWidth="2.2" strokeLinecap="round">
                  {/* Top Strand */}
                  <path d="M 15,30 L 70,30 Q 100,10 120,30 L 225,30" fill="none" stroke="#3b82f6" />
                  {/* Bottom Strand */}
                  <path d="M 15,50 L 70,50 Q 100,70 120,50 L 225,50" fill="none" stroke="#3b82f6" />
                </g>

                {/* PAM Sequence indicator (NGG at line 120) */}
                {pamPresent && (
                  <g transform="translate(125, 23)">
                    <rect width="20" height="34" rx="2" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="1" />
                    <text x="10" y="10" fill="#f59e0b" fontSize="6.5" fontWeight="black" textAnchor="middle">
                      PAM
                    </text>
                    <text x="10" y="24" fill="#fbbf24" fontSize="7" fontWeight="bold" textAnchor="middle">
                      NGG
                    </text>
                  </g>
                )}

                {/* Cas9 Protein Complex (floating/targeting/cleaving) */}
                {editStep !== "idle" && (
                  <g transform={`translate(${editStep === "targeting" ? "40" : editStep === "cleaving" ? "100" : "100"}, ${editStep === "targeting" ? "15" : "20"})`} className="transition-transform duration-1000 ease-out">
                    {/* Cas9 big circular protein shadow */}
                    <circle cx="20" cy="20" r="30" fill="rgba(167, 139, 250, 0.28)" stroke="#a78bfa" strokeWidth="1.5" />
                    <text x="20" y="3" fill="#c084fc" fontSize="7" fontWeight="black" textAnchor="middle">
                      Cas9 Complex
                    </text>

                    {/* Guide RNA loop */}
                    <path d="M 5,20 C 10,8 30,8 35,20" fill="none" stroke="#f43f5e" strokeWidth="2.5" />
                    <text x="20" y="18" fill="#f43f5e" fontSize="5" fontWeight="bold" textAnchor="middle">
                      gRNA
                    </text>
                  </g>
                )}

                {/* DNA Cleaved visual at step cleaving */}
                {editStep === "cleaving" && (
                  <g transform="translate(100, 32)">
                    {/* Laser/Cut sparks */}
                    <line x1="5" y1="0" x2="5" y2="16" stroke="#f43f5e" strokeWidth="3" className="animate-ping" />
                    <line x1="0" y1="8" x2="10" y2="8" stroke="#f43f5e" strokeWidth="3" className="animate-ping" />
                    <text x="5" y="-5" fill="#f43f5e" fontSize="7" fontWeight="black" textAnchor="middle">
                      Cleaved!
                    </text>
                  </g>
                )}

                {/* Repair stage visualization */}
                {editStep === "repairing" && (
                  <g transform="translate(90, 30)">
                    {repairPathway === "nhej" ? (
                      <g>
                        {/* Indel mutation deletion representation */}
                        <circle cx="15" cy="10" r="8" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1" />
                        <text x="15" y="13" fill="#ef4444" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                          NHEJ
                        </text>
                        <text x="15" y="24" fill="#94a3b8" fontSize="5.5" fontWeight="bold" textAnchor="middle">
                          Indel mut
                        </text>
                      </g>
                    ) : (
                      <g>
                        {/* Homology directed insert (emerald) representing GFP green gene */}
                        <rect x="0" y="-5" width="30" height="30" rx="3" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="1.5" />
                        <text x="15" y="6" fill="#10b981" fontSize="6.5" fontWeight="black" textAnchor="middle">
                          HDR
                        </text>
                        <text x="15" y="16" fill="#34d399" fontSize="6" fontWeight="bold" textAnchor="middle">
                          GFP Insert
                        </text>
                      </g>
                    )}
                  </g>
                )}

                {/* Done stage screen overlay */}
                {editStep === "done" && (
                  <g transform="translate(80, 5)">
                    {editingEfficiency > 0 ? (
                      <g>
                        {repairPathway === "hdr" && <rect x="0" y="0" width="80" height="28" rx="6" fill="#047857" stroke="#34d399" strokeWidth="1" className="animate-pulse" />}
                        <text x="40" y="17" fill={repairPathway === "hdr" ? "#ffffff" : "#34d399"} fontSize="8" fontWeight="black" textAnchor="middle">
                          {repairPathway === "nhej" ? "✅ KO Success" : "✨ GFP Integrated"}
                        </text>
                      </g>
                    ) : (
                      <text x="40" y="17" fill="#ef4444" fontSize="8" fontWeight="black" textAnchor="middle">
                        ❌ Failure (No PAM)
                      </text>
                    )}
                  </g>
                )}
              </svg>
            </div>
          </div>
        </div>
      }
      controlsTitle="ตั้งค่าพารามิเตอร์ตัดต่อยีน CRISPR"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-emerald-500" />
              การชี้เป้า guide RNA และ PAM
            </h3>

            <ManualNumberInput label="ความเข้าคู่สาย gRNA (%)" ariaLabel="ความสอดคล้องสายเบส" value={gRNAComplement} min={50} max={100} step={5} onChange={setGRNAComplement} tone="emerald" />

            <div className="flex items-center justify-between mt-2">
              <label className="text-[11px] font-bold text-slate-500">มีสัญลักษณ์ PAM (5&apos;-NGG-3&apos;)</label>
              <button type="button" onClick={() => setPamPresent(!pamPresent)} className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${pamPresent ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                {pamPresent ? "มี PAM" : "ไม่มี PAM"}
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Activity className="h-4.5 w-4.5 text-emerald-500" />
              เลือกวิถีซ่อมแซมยีนของเซลล์ (Repair Pathway)
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setRepairPathway("nhej")} className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${repairPathway === "nhej" ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-black" : "border-slate-200 bg-white text-slate-500"}`}>
                NHEJ (Gene Knock-out)
              </button>
              <button type="button" onClick={() => setRepairPathway("hdr")} className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${repairPathway === "hdr" ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-black" : "border-slate-200 bg-white text-slate-500"}`}>
                HDR (GFP Knock-in)
              </button>
            </div>

            <button onClick={handleStartEditing} disabled={isEditing} className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer">
              <Play className="h-3.5 w-3.5" />
              เริ่มการทำงานตัดแต่งยีน (Edit)
            </button>
          </section>

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
          <button onClick={() => setGRNAComplement((c) => Math.max(50, c - 10))} className="px-2 py-1 text-xs font-bold rounded bg-slate-100">
            gRNA -10%
          </button>
          <button onClick={() => setGRNAComplement((c) => Math.min(100, c + 10))} className="px-2 py-1 text-xs font-bold rounded bg-slate-100">
            gRNA +10%
          </button>
          <button onClick={handleReset} className="px-2 py-1 text-xs font-bold rounded bg-emerald-500 text-white">
            Reset
          </button>
        </div>
      }
      metrics={[
        { label: "ประสิทธิภาพตัดยีนสำเร็จ (Efficiency)", value: `${editingEfficiency}%`, tone: "emerald" },
        { label: "ความเสี่ยงการจับผิดจุด (Off-target)", value: `${offTargetRisk}%`, tone: "orange" },
        { label: "วิถีซ่อมแซมเซลล์ที่เปิดสวิตช์", value: repairPathway === "nhej" ? "NHEJ (Knock-out)" : "HDR (Knock-in GFP)", tone: "violet" },
        { label: "ความต้องการสัญลักษณ์ PAM", value: pamPresent ? "5'-NGG-3' ตรวจพบ" : "ไม่พบสัญลักษณ์", tone: undefined }
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
              อัตราตัดต่อสำเร็จตามระดับความเข้าคู่ (Efficiency vs Complementarity)
            </h3>
          </div>
          <div className="flex-grow flex items-center justify-center">
            {loggedRuns.length === 0 ? (
              <div className="text-xs text-slate-400">จดบันทึกการตัดต่อยีนเพื่อจำลองกราฟสมดุล</div>
            ) : (
              <svg viewBox="0 0 200 120" className="w-full max-w-[240px] h-auto">
                <line x1="15" y1="100" x2="185" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="15" y1="10" x2="15" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                {loggedRuns.map((r, i) => {
                  const cx = 15 + (r.gRNAComplement / 100) * 165;
                  const cy = 100 - (r.efficiency / 100) * 80;
                  return (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="3" fill="#10b981" />
                      {i > 0 && <line x1={15 + (loggedRuns[i - 1].gRNAComplement / 100) * 165} y1={100 - (loggedRuns[i - 1].efficiency / 100) * 80} x2={cx} y2={cy} stroke="#a7f3d0" strokeWidth="1.2" />}
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
              ตารางบันทึกการทดลองตัดแต่งยีน
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
            <div className="flex-grow flex items-center justify-center text-xs text-slate-400 py-10">ยังไม่มีการบันทึกการตัดต่อ</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center">ชุด</th>
                    <th className="p-2">ความเข้าคู่ gRNA</th>
                    <th className="p-2">PAM</th>
                    <th className="p-2">วิถีการซ่อมแซม</th>
                    <th className="p-2">ประสิทธิภาพ</th>
                    <th className="p-2">ความเสี่ยง Off-target</th>
                    <th className="p-2">ผลลัพธ์</th>
                    <th className="p-2 text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  {loggedRuns.map((r) => (
                    <tr key={r.index} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-bold">{r.index}</td>
                      <td className="p-2 font-sans">{r.gRNAComplement}%</td>
                      <td className="p-2 font-sans">{r.pamPresent ? "มี" : "ไม่มี"}</td>
                      <td className="p-2 font-sans">{r.repairPathway}</td>
                      <td className="p-2 font-bold text-emerald-700">{r.efficiency}%</td>
                      <td className="p-2">{r.offTargetRisk}%</td>
                      <td className="p-2 font-sans font-bold">{r.status}</td>
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
      learningGoals={["ทำความเข้าใจวิธีการวางตำแหน่ง guide RNA (gRNA) ให้ตรงกับยีนและลักษระตำแหน่ง PAM", "ศึกษาความแตกต่างระหว่างการซ่อมแซมดีเอ็นเอด้วยวิธี NHEJ (เพื่อทำให้ยีนหยุดทำงาน) และ HDR (เหนี่ยวนำยีนใหม่)", "วิเคราะห์ความเสี่ยงในการเกิดจุดตัดผิดเป้าหมาย (Off-target) จากการออกแบบ gRNA ที่มีความเฉพาะเจาะจงต่ำ"]}
      steps={[
        { label: "ปรับแต่งระดับความสอดคล้อง (Complementarity) ของสายนำทาง gRNA", icon: Sliders },
        { label: "เลือกเปิด-ปิด สวิตช์สัญลักษณ์นำทาง PAM เพื่อศึกษาอุปสรรคการตัด", icon: Target },
        { label: "เลือกวิถีการซ่อมแซม NHEJ หรือ HDR แล้วกด Edit เพื่อดูแอนิเมชัน", icon: Zap },
        { label: "บันทึกผลการตัดต่อยีนลงสมุดประวัติและรายงานสัดส่วนการปิดยีน", icon: ClipboardList }
      ]}
      progressLabel="ความคืบหน้าการตัดต่อยีน"
      progressValue={questProgress === 100 ? "วิเคราะห์และดัดแปลงพันธุกรรมเสร็จสมบูรณ์" : `บันทึกข้อมูลดัดแปลงแล้ว ${loggedRuns.length}/3 แถว`}
      progressPercent={questProgress}
      tips={["หากไม่มีลักษระลำดับ PAM (NGG) โปรตีน Cas9 จะไม่ทำการตัดสายคู่ดีเอ็นเออย่างเด็ดขาด", "การซ่อมแซมด้วยวิธี NHEJ เกิดขึ้นตามธรรมชาติได้ง่ายที่สุด มักส่งผลให้ยีนหยุดทำงานถาวร (Knock-out)", "คุณสามารถออกแบบ Donor DNA ในช่อง HDR เพื่อสอดแทรกยีนเรืองแสงสีเขียว GFP เข้าจีโนมได้สำเร็จ"]}
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">ระบบตัดแต่งยีน CRISPR-Cas9 (CRISPR-Cas9 Gene Editing)</p>
          <p className="mb-3">เทคโนโลยีชีววิทยาระดับอณูขั้นสูงที่ได้รับรางวัลโนเบล มีกลไกสำคัญดังนี้:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>gRNA (Guide RNA):</strong> สายอาร์เอ็นเอสังเคราะห์นำทาง ความยาว 20 นิวคลีโอไทด์ นำทาง Cas9 ไปยังจุดเป้าหมายบน DNA
            </li>
            <li>
              <strong>PAM (Protospacer Adjacent Motif):</strong> ลำดับนิวคลีโอไทด์สั้นๆ 5&apos;-NGG-3&apos; ที่ Cas9 ใช้จดจำเป้าหมายเบื้องต้น
            </li>
            <li>
              <strong>NHEJ:</strong> กลไกประสานปลายดีเอ็นเอโดยตรง (Non-Homologous End Joining) มักทำให้คู่เบสเกินหรือขาดหาย (Indel) ยีนจึงหยุดทำงาน
            </li>
            <li>
              <strong>HDR:</strong> กลไกอาศัยแม่แบบ (Homology Directed Repair) สอดแทรกสายยีนสังเคราะห์ชิ้นใหม่เข้าสู่เซลล์เป้าหมายอย่างแม่นยำ
            </li>
          </ul>
        </div>
      }
      onRun={handleStartEditing}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
