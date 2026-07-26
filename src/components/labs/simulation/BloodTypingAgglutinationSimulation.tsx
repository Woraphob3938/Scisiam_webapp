"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Compass,
  Droplets,
  Play,
  RotateCcw,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

const bloodTypeOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
type BloodType = (typeof bloodTypeOptions)[number];

interface BloodProfile {
  antiA: boolean;
  antiB: boolean;
  antiD: boolean;
  donors: string;
  recipients: string;
}

interface BloodTypingRun {
  sample: BloodType;
  antiA: string;
  antiB: string;
  antiD: string;
  aboGroup: string;
  rhFactor: string;
}

const bloodProfiles: Record<BloodType, BloodProfile> = {
  "A+": { antiA: true, antiB: false, antiD: true, donors: "A+, A-, O+, O-", recipients: "A+, AB+" },
  "A-": { antiA: true, antiB: false, antiD: false, donors: "A-, O-", recipients: "A+, A-, AB+, AB-" },
  "B+": { antiA: false, antiB: true, antiD: true, donors: "B+, B-, O+, O-", recipients: "B+, AB+" },
  "B-": { antiA: false, antiB: true, antiD: false, donors: "B-, O-", recipients: "B+, B-, AB+, AB-" },
  "AB+": { antiA: true, antiB: true, antiD: true, donors: "ทุกหมู่เลือด ABO/Rh", recipients: "AB+ เท่านั้น" },
  "AB-": { antiA: true, antiB: true, antiD: false, donors: "AB-, A-, B-, O-", recipients: "AB+, AB-" },
  "O+": { antiA: false, antiB: false, antiD: true, donors: "O+, O-", recipients: "O+, A+, B+, AB+" },
  "O-": { antiA: false, antiB: false, antiD: false, donors: "O- เท่านั้น", recipients: "ทุกหมู่เลือด ABO/Rh" },
};

function reactionLabel(active: boolean) {
  return active ? "ตกตะกอน" : "ไม่ตกตะกอน";
}

export default function BloodTypingAgglutinationSimulation() {
  const [selectedType, setSelectedType] = useState<BloodType>("A+");
  const [isMixed, setIsMixed] = useState(false);
  const [mixCount, setMixCount] = useState(0);
  const [history, setHistory] = useState<BloodTypingRun[]>([]);

  const profile = bloodProfiles[selectedType];

  const reactions = useMemo(
    () => [
      { reagent: "Anti-A", active: profile.antiA, x: 92, tone: "#ef4444" },
      { reagent: "Anti-B", active: profile.antiB, x: 200, tone: "#3b82f6" },
      { reagent: "Anti-D", active: profile.antiD, x: 308, tone: "#a855f7" },
    ],
    [profile]
  );

  const aboGroup = useMemo(() => selectedType.replace(/[+-]/, ""), [selectedType]);
  const rhFactor = profile.antiD ? "Rh+" : "Rh-";
  const positiveReactionCount = reactions.filter((reaction) => reaction.active).length;

  const invalidateRunState = () => {
    setIsMixed(false);
    setHistory([]);
    setMixCount(0);
  };

  const handleTypeChange = (type: BloodType) => {
    invalidateRunState();
    setSelectedType(type);
  };

  const handleRun = () => {
    const run: BloodTypingRun = {
      sample: selectedType,
      antiA: reactionLabel(profile.antiA),
      antiB: reactionLabel(profile.antiB),
      antiD: reactionLabel(profile.antiD),
      aboGroup,
      rhFactor,
    };

    setIsMixed(true);
    setMixCount((count) => count + 1);
    setHistory((prev) => [run, ...prev].slice(0, 6));
  };

  const handleReset = () => {
    setIsMixed(false);
    setHistory([]);
    setMixCount(0);
  };

  const handleSave = async () => {
    if (history.length === 0) {
      alert("กรุณากดเริ่มทดสอบปฏิกิริยา Agglutination ก่อนบันทึกผล");
      return;
    }

    const latest = history[0];
    const experimentData = {
      labId: "blood-typing",
      timestamp: new Date().toLocaleString("th-TH"),
      selectedType,
      aboGroup,
      rhFactor,
      compatibleDonors: profile.donors,
      compatibleRecipients: profile.recipients,
      dataPoints: history,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_blood_typing_experiment",
      localPayload: experimentData,
      labId: "blood-typing",
      title: "Blood Typing & Agglutination",
      variables: { selectedType },
      liveValues: latest,
      graphPoints: reactions.map((reaction, index) => ({ x: index + 1, y: reaction.active ? 1 : 0 })),
      tableRows: history,
      summary: {
        bloodType: selectedType,
        aboGroup,
        rhFactor,
        positiveReactionCount,
      },
      score: 100,
    });
    alert("บันทึกผลการทดลอง Blood Typing สำเร็จ");
  };

  return (
    <SharedSimulationShell
      accent="rose"
      labId="blood-typing"
      category="Biology"
      title="Blood Typing & Agglutination"
      subtitle="จำลองการตรวจหมู่เลือดระบบ ABO และ Rh โดยหยดน้ำยา Anti-A, Anti-B และ Anti-D เพื่ออ่านผลการตกตะกอนของเม็ดเลือดแดง"
      statusLabel={isMixed ? `อ่านผลแล้ว: ${selectedType}` : "พร้อมทดลอง"}
      icon={Droplets}
      sceneTitle="แผ่นหลุมทดสอบหมู่เลือดจำลอง"
      scene={
        <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-rose-100 bg-[#0f172a] shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-45 pointer-events-none" />

          <svg className="relative z-10 h-full w-full max-w-[520px] p-4" viewBox="0 0 400 300" fill="none">
            <rect x="38" y="58" width="324" height="164" rx="28" fill="#f8fafc" stroke="#fecdd3" strokeWidth="4" />
            <rect x="58" y="84" width="284" height="112" rx="20" fill="#fff1f2" stroke="#ffe4e6" strokeWidth="2" />

            {reactions.map((reaction) => (
              <g key={reaction.reagent}>
                <circle cx={reaction.x} cy="136" r="42" fill="#ffffff" stroke={reaction.tone} strokeWidth="4" />
                <circle cx={reaction.x} cy="136" r="31" fill="#fee2e2" opacity="0.85" />
                <text x={reaction.x} y="78" textAnchor="middle" fill="#334155" fontSize="13" fontWeight="900">
                  {reaction.reagent}
                </text>

                {isMixed && reaction.active ? (
                  <g fill="#991b1b">
                    {Array.from({ length: 18 }).map((_, index) => (
                      <circle
                        key={index}
                        cx={reaction.x - 21 + ((index * 13) % 42)}
                        cy={119 + ((index * 17) % 34)}
                        r={index % 3 === 0 ? 3.8 : 2.6}
                        opacity="0.9"
                      />
                    ))}
                  </g>
                ) : (
                  <g fill="#ef4444" opacity={isMixed ? "0.55" : "0.35"}>
                    {Array.from({ length: 12 }).map((_, index) => (
                      <circle
                        key={index}
                        cx={reaction.x - 22 + ((index * 11) % 44)}
                        cy={120 + ((index * 19) % 32)}
                        r="2.3"
                      />
                    ))}
                  </g>
                )}

                <text x={reaction.x} y="212" textAnchor="middle" fill={reaction.active && isMixed ? "#be123c" : "#64748b"} fontSize="11" fontWeight="900">
                  {isMixed ? reactionLabel(reaction.active) : "รอผสม"}
                </text>
              </g>
            ))}

            <path d="M88 242 H312" stroke="#fb7185" strokeWidth="6" strokeLinecap="round" strokeDasharray="12 10" opacity="0.65" />
            <text x="200" y="266" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="900">
              Agglutination pattern → {isMixed ? selectedType : "เลือกรหัสตัวอย่างแล้วกดเริ่ม"}
            </text>
          </svg>

          <div className="absolute right-5 bottom-5 rounded-xl border border-slate-700/60 bg-slate-900/90 px-3.5 py-1.5 text-right text-xs font-bold text-white">
            <span className="block text-[10px] font-black text-slate-400">ผลสรุปจำลอง</span>
            {isMixed ? `${aboGroup} / ${rhFactor}` : "ยังไม่อ่านผล"}
          </div>
        </div>
      }
      controlsTitle="ควบคุมตัวอย่างและน้ำยาทดสอบ"
      controls={
        <div className="space-y-4 font-sans">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-600">เลือกตัวอย่างเลือดจำลอง</span>
            <select
              value={selectedType}
              onChange={(event) => handleTypeChange(event.target.value as BloodType)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
            >
              {bloodTypeOptions.map((type) => (
                <option key={type} value={type}>ตัวอย่างเลือด {type}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleRun}
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2.5 text-xs font-black text-white shadow-sm hover:bg-rose-700"
            >
              <Play className="h-4 w-4 fill-white stroke-none" />
              เริ่มหยดน้ำยา
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label="รีเซ็ตผลหมู่เลือด"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-xs font-semibold leading-relaxed text-rose-800">
            หลักการอ่านผล: หลุมใดเกิดตะกอน แสดงว่าเม็ดเลือดมีแอนติเจนที่ตรงกับน้ำยานั้น เช่น Anti-A ตกตะกอน หมายถึงมีแอนติเจน A
          </div>
        </div>
      }
      metrics={[
        { label: "ABO", value: isMixed ? aboGroup : "รอผล", tone: "rose" },
        { label: "Rh", value: isMixed ? rhFactor : "รอผล", tone: "violet" },
        { label: "ปฏิกิริยาบวก", value: `${isMixed ? positiveReactionCount : 0}/3`, tone: "orange" },
        { label: "รอบทดสอบ", value: `${mixCount} ครั้ง`, tone: "blue" },
      ]}
      graph={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <BarChart3 className="h-4.5 w-4.5 text-rose-600" />
              Reaction Matrix
            </h3>
            <span className="text-[10px] font-bold text-rose-600 select-none">positive = 1</span>
          </div>
          <div className="flex flex-1 items-end justify-around gap-3 rounded-xl bg-slate-50/70 p-4">
            {reactions.map((reaction) => (
              <div key={reaction.reagent} className="flex h-44 flex-1 flex-col items-center justify-end gap-2 text-center">
                <div
                  className={`w-full max-w-[56px] rounded-t-xl transition-all duration-300 ${reaction.active && isMixed ? "bg-rose-500" : "bg-slate-200"}`}
                  style={{ height: reaction.active && isMixed ? "88%" : "18%" }}
                />
                <span className="text-[11px] font-black text-slate-600">{reaction.reagent}</span>
              </div>
            ))}
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <ClipboardList className="h-4.5 w-4.5 text-rose-600" />
              ตารางผลการตรวจ
            </h3>
            <span className="text-[10px] font-bold text-slate-400 select-none">{history.length} records</span>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-100 max-h-[190px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-rose-50/80 text-[11px] font-black text-rose-800">
                <tr>
                  <th className="px-2 py-2">Type</th>
                  <th className="px-2 py-2">A</th>
                  <th className="px-2 py-2">B</th>
                  <th className="px-2 py-2">D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                {history.map((run, index) => (
                  <tr key={`${run.sample}-${index}`}>
                    <td className="px-2 py-2 font-mono text-rose-700">{run.sample}</td>
                    <td className="px-2 py-2">{run.antiA}</td>
                    <td className="px-2 py-2">{run.antiB}</td>
                    <td className="px-2 py-2">{run.antiD}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      }
      theory={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800 leading-normal">
            <Compass className="h-4.5 w-4.5 text-rose-600" />
            ทฤษฎี ABO/Rh
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3 text-xs font-semibold leading-relaxed text-slate-500">
            <p>เม็ดเลือดแดงมีแอนติเจนบนผิวเซลล์ หากแอนติบอดีในน้ำยาทดสอบจับกับแอนติเจนตรงชนิด จะเกิดการจับกลุ่มหรือ Agglutination ที่สังเกตเห็นเป็นตะกอน</p>
            <p className="rounded-xl bg-slate-50 p-3 text-slate-700">ผู้บริจาคที่เข้ากันได้: <b>{profile.donors}</b><br />ผู้รับที่เข้ากันได้: <b>{profile.recipients}</b></p>
          </div>
        </section>
      }
      steps={[
        { label: "หยดตัวอย่างเลือด", icon: Droplets },
        { label: "เติม Anti-A/Anti-B/Anti-D", icon: Activity },
        { label: "ผสมและรอจับกลุ่ม", icon: Play },
        { label: "อ่านผล ABO/Rh", icon: BarChart3 },
        { label: "สรุปความเข้ากันได้", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "ระบุความหมายของแอนติเจน A, B และ Rh บนผิวเม็ดเลือดแดง",
        "อ่านผลปฏิกิริยา Agglutination จากน้ำยา Anti-A, Anti-B และ Anti-D",
        "เชื่อมโยงผลตรวจหมู่เลือดกับความปลอดภัยในการให้และรับเลือด",
        "แยกความแตกต่างระหว่างระบบ ABO และปัจจัย Rh ได้ถูกต้อง",
      ]}
      progressLabel="ความครบถ้วนของการอ่านผล"
      progressValue={isMixed ? "อ่านครบ 3 น้ำยา" : "รอเริ่มทดสอบ"}
      progressPercent={isMixed ? 100 : 0}
      tips={[
        "ลองเลือก O- เพื่อดูตัวอย่าง universal donor ในระบบเม็ดเลือดแดง",
        "ลองเลือก AB+ เพื่อดูตัวอย่าง universal recipient",
        "สังเกตว่าผล Rh ดูจากหลุม Anti-D เท่านั้น ไม่ได้เปลี่ยนผล ABO",
      ]}
      onRun={handleRun}
      runLabel="เริ่มทดลอง"
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}
