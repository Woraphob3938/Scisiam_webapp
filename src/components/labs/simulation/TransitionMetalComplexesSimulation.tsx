"use client";

import React, { useState } from "react";
import SharedSimulationShell from "./SharedSimulationShell";
import {
  Info,
  Activity,
  Sparkles,
} from "lucide-react";
import { labsById } from "@/data/labs";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface ComplexLog {
  id: number;
  metal: string;
  ligand: string;
  gapEv: string;
  wavelengthNm: number;
  color: string;
  fieldStrength: string;
}

const metals = [
  { id: "cu2", name: "Copper(II) - Cu²⁺", dElectrons: 9 },
  { id: "co2", name: "Cobalt(II) - Co²⁺", dElectrons: 7 },
  { id: "ni2", name: "Nickel(II) - Ni²⁺", dElectrons: 8 },
];

const ligands = [
  { id: "cl", name: "Chloride - Cl⁻", strength: "Weak-field", energyFactor: 0.7, complementaryColor: { cu2: { hex: "#fbbf24", name: "เหลืองแกมเขียว" }, co2: { hex: "#3b82f6", name: "น้ำเงิน" }, ni2: { hex: "#eab308", name: "เหลือง" } } },
  { id: "h2o", name: "Water - H₂O", strength: "Intermediate-field", energyFactor: 1.0, complementaryColor: { cu2: { hex: "#60a5fa", name: "ฟ้าอ่อน" }, co2: { hex: "#ec4899", name: "ชมพูแดง" }, ni2: { hex: "#22c55e", name: "เขียว" } } },
  { id: "nh3", name: "Ammonia - NH₃", strength: "Intermediate-field", energyFactor: 1.3, complementaryColor: { cu2: { hex: "#1e3a8a", name: "น้ำเงินเข้ม" }, co2: { hex: "#b45309", name: "เหลืองอมน้ำตาล" }, ni2: { hex: "#8b5cf6", name: "ม่วงน้ำเงิน" } } },
  { id: "en", name: "Ethylenediamine - en", strength: "Strong-field", energyFactor: 1.5, complementaryColor: { cu2: { hex: "#6d28d9", name: "ม่วงคราม" }, co2: { hex: "#f97316", name: "ส้ม" }, ni2: { hex: "#ec4899", name: "ชมพูม่วง" } } },
  { id: "cn", name: "Cyanide - CN⁻", strength: "Strong-field", energyFactor: 2.1, complementaryColor: { cu2: { hex: "#fef08a", name: "เหลืองซีด" }, co2: { hex: "#facc15", name: "เหลืองทอง" }, ni2: { hex: "#ca8a04", name: "น้ำตาลทอง" } } },
];

export default function TransitionMetalComplexesSimulation() {
  const labId = "transition-metal-complexes";
  const labData = labsById[labId];

  const [selectedMetal, setSelectedMetal] = useState(metals[0]);
  const [selectedLigand, setSelectedLigand] = useState(ligands[1]); // Default H2O
  const [showExcitation, setShowExcitation] = useState(false);
  const [excitationProgress, setExcitationProgress] = useState(0);
  const [logs, setLogs] = useState<ComplexLog[]>([]);
  const [, setIsSaving] = useState(false);

  // Energy gap calculations
  // Base energy gap for octahedrals is roughly 2.0 eV
  const energyGap = 2.0 * selectedLigand.energyFactor;
  // E = hc / lambda => lambda = hc / E
  // hc is approx 1240 eV-nm
  const wavelength = Math.round(1240 / energyGap);

  const handleExcite = () => {
    if (showExcitation) return;
    setShowExcitation(true);
    setExcitationProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 4;
      setExcitationProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShowExcitation(false);
        }, 800);
      }
    }, 30);
  };

  const getComplexColor = () => {
    const key = selectedMetal.id as "cu2" | "co2" | "ni2";
    return selectedLigand.complementaryColor[key] || { hex: "#cbd5e1", name: "ไม่มีสี" };
  };

  const complexColor = getComplexColor();

  const handleLogResult = () => {
    const isDuplicate = logs.some(
      l => l.metal === selectedMetal.name && l.ligand === selectedLigand.name
    );

    if (isDuplicate) {
      window.alert("การบันทึกสารเชิงซ้อนนี้มีอยู่แล้ว");
      return;
    }

    const newLog = {
      id: Date.now(),
      metal: selectedMetal.name,
      ligand: selectedLigand.name,
      gapEv: energyGap.toFixed(2),
      wavelengthNm: wavelength,
      color: complexColor.name,
      fieldStrength: selectedLigand.strength,
    };

    setLogs(prev => [newLog, ...prev]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleSave = async () => {
    if (logs.length === 0) {
      window.alert("กรุณาบันทึกการสังเกตอย่างน้อย 1 รายการก่อนส่งผล");
      return;
    }

    setIsSaving(true);
    try {
      await saveExperimentAndSync({
        localStorageKey: "scisiam_saved_transition_metal_complexes_experiment",
        localPayload: {
          labId,
          timestamp: new Date().toISOString(),
          logs,
        },
        labId,
        title: "สารเชิงซ้อนโลหะแทรนซิชัน",
        variables: { lastLigandId: selectedLigand.id },
        liveValues: {
          metalId: selectedMetal.id,
          energyGapEv: energyGap,
          colorHex: complexColor.hex,
        },
        graphPoints: logs.map((l, idx) => ({
          x: idx + 1,
          y: parseFloat(l.gapEv),
        })),
        tableRows: logs,
        summary: {
          uniqueComplexesTested: logs.length,
          lastColor: complexColor.name,
        },
        durationSeconds: 40,
      });
      window.alert("บันทึกสารประกอบเชิงซ้อนเสร็จสิ้น");
    } finally {
      setIsSaving(false);
    }
  };

  const getMetricDisplay = () => [
    { label: "ค่าสปลิตพลังงาน (Δ₀)", value: `${energyGap.toFixed(2)} eV` },
    { label: "ความยาวคลื่นแสงที่ดูดกลืน", value: `${wavelength} nm` },
    { label: "จำนวนอิเล็กตรอนใน d-orbital", value: `${selectedMetal.dElectrons} e⁻` },
  ];

  return (
    <SharedSimulationShell
      accent="violet"
      labId={labId}
      category={labData?.category || "Chemistry"}
      title={labData?.thaiTitle || labData?.title || "สารเชิงซ้อนโลหะแทรนซิชัน"}
      subtitle={labData?.description || ""}
      statusLabel="พร้อมใช้งาน"
      icon={Sparkles}
      sceneTitle="โครงสร้างสารเชิงซ้อนแปดหน้า (Octahedral Structure)"
      scene={
        <div className="relative flex min-h-[340px] h-full w-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_35%,#f5f3ff_0%,#eef2ff_34%,#f8fafc_72%)] p-4">
          <svg viewBox="0 0 600 310" className="h-auto w-full max-w-[680px]" role="img" aria-label="โครงสร้างสารเชิงซ้อนทรงแปดหน้าและแผนภาพระดับพลังงานออร์บิทัล">
            <title>สารเชิงซ้อนโลหะแทรนซิชันและการแยกระดับพลังงาน</title>
            <desc>โลหะอยู่กลางลิแกนด์หกตำแหน่ง ด้านขวาแสดงระดับพลังงาน t2g และ eg กับค่าช่องว่างพลังงาน</desc>
            <g transform="translate(36 36)">
              {[[142, 16], [142, 218], [42, 66], [242, 168], [52, 178], [232, 56]].map(([x, y], index) => (
                <g key={index}>
                  <line x1="142" y1="118" x2={x} y2={y} stroke="#a5b4fc" strokeWidth="5" strokeLinecap="round" />
                  <circle cx={x} cy={y} r="23" fill="#ffffff" stroke="#8b5cf6" strokeWidth="4" />
                  <text x={x} y={y + 5} textAnchor="middle" fill="#6d28d9" fontSize="12" fontWeight="900">{selectedLigand.id.toUpperCase()}</text>
                </g>
              ))}
              <circle cx="142" cy="118" r="39" fill={complexColor.hex} stroke="#4f46e5" strokeWidth="6" />
              <text x="142" y="125" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="900">{selectedMetal.id === "cu2" ? "Cu²⁺" : selectedMetal.id === "co2" ? "Co²⁺" : "Ni²⁺"}</text>
              <text x="142" y="276" textAnchor="middle" fill="#475569" fontSize="14" fontWeight="800">โครงสร้างทรงแปดหน้า (Oₕ)</text>
            </g>

            <g transform="translate(350 34)">
              <text x="105" y="10" textAnchor="middle" fill="#475569" fontSize="14" fontWeight="900">การแยกระดับพลังงาน d-orbital</text>
              <text x="0" y="64" fill="#be123c" fontSize="15" fontWeight="900">e<tspan baselineShift="sub" fontSize="10">g</tspan></text>
              <line x1="44" y1="58" x2="106" y2="58" stroke="#fb7185" strokeWidth="6" strokeLinecap="round" />
              <line x1="126" y1="58" x2="188" y2="58" stroke="#fb7185" strokeWidth="6" strokeLinecap="round" />
              <text x="0" y="204" fill="#1d4ed8" fontSize="15" fontWeight="900">t<tspan baselineShift="sub" fontSize="10">2g</tspan></text>
              {[44, 98, 152].map((x) => <line key={x} x1={x} y1="198" x2={x + 42} y2="198" stroke="#60a5fa" strokeWidth="6" strokeLinecap="round" />)}
              <rect x="44" y="94" width="144" height="68" rx="18" fill="#ede9fe" />
              <text x="116" y="121" textAnchor="middle" fill="#6d28d9" fontSize="13" fontWeight="900">ช่องว่างพลังงาน Δ₀</text>
              <text x="116" y="148" textAnchor="middle" fill="#4c1d95" fontSize="24" fontWeight="900">{energyGap.toFixed(2)} eV</text>
              {Array.from({ length: selectedMetal.dElectrons }, (_, index) => (
                <circle key={index} cx={58 + (index % 5) * 27} cy={index < 5 ? 186 : 46} r="6" fill={index < 5 ? "#2563eb" : "#e11d48"} />
              ))}
              {showExcitation && <circle cx="116" cy={178 - excitationProgress * 1.05} r="9" fill="#a855f7" opacity="0.86" />}
              <text x="105" y="246" textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="800">d-electron {selectedMetal.dElectrons} ตัว</text>
            </g>
          </svg>
          <div className="absolute bottom-4 left-5 flex items-center gap-2 text-sm font-bold text-slate-700">
            <span className="h-8 w-5 rounded border border-slate-300" style={{ backgroundColor: complexColor.hex }} />
            สีสารละลาย: {complexColor.name}
          </div>
          <button onClick={handleExcite} disabled={showExcitation} className="absolute bottom-4 right-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60">
            <Sparkles className="h-4 w-4" /> กระตุ้นอิเล็กตรอน
          </button>
        </div>
      }
      controlsTitle="เลือกโลหะและลิแกนด์เชิงซ้อน"
      controls={
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">เลือกไอออนโลหะแทรนซิชัน</label>
            <div className="grid grid-cols-3 gap-2">
              {metals.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMetal(m)}
                  className={`px-2 py-2.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                    selectedMetal.id === m.id
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-350 hover:bg-slate-50"
                  }`}
                >
                  {m.name.split(" - ")[0]}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">เลือกประเภทลิแกนด์</label>
            <div className="grid grid-cols-1 gap-1.5">
              {ligands.map(l => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLigand(l)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-all ${
                    selectedLigand.id === l.id
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-350 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{l.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded ${
                      l.strength === "Strong-field" ? "bg-red-50 text-red-600 dark:bg-red-950/20" :
                      l.strength === "Weak-field" ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-600"
                    }`}>{l.strength}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogResult}
            className="w-full py-2 border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/20 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
          >
            บันทึกการจับคู่นี้ลงตาราง
          </button>
        </div>
      }
      metrics={getMetricDisplay()}
      graph={null}
      table={
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="p-3">โลหะแทรนซิชัน</th>
                <th className="p-3">ลิแกนด์ที่จับคู่</th>
                <th className="p-3">ความแรงสนามลิแกนด์</th>
                <th className="p-3">ค่าสปลิต Δ₀ (eV)</th>
                <th className="p-3">ความยาวคลื่นดูดกลืน</th>
                <th className="p-3">สีสารเชิงซ้อน</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 italic">ยังไม่ได้เก็บข้อมูลการผสมโลหะกับลิแกนด์</td>
                </tr>
              ) : (
                logs.map(l => (
                  <tr key={l.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{l.metal.split(" - ")[0]}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{l.ligand}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{l.fieldStrength}</td>
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{l.gapEv} eV</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{l.wavelengthNm} nm</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{l.color}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {logs.length > 0 && (
            <div className="p-2 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <button onClick={handleClearLogs} className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors">
                ล้างตารางทดสอบ
              </button>
            </div>
          )}
        </div>
      }
      theory={
        <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>
            <strong>ทฤษฎีสนามคริสตัล (Crystal Field Theory - CFT)</strong> อธิบายว่าประจุลบของลิแกนด์ที่เข้ามาล้อมรอบโลหะจะเหนี่ยวนำให้
            d-orbitals ของโลหะแทรนซิชันที่เคยมีระดับพลังงานเท่ากัน แยก (split) ออกเป็น 2 ระดับพลังงานที่มีระดับพลังงานต่างกัน (Delta_0)
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>การเปลี่ยนระดับพลังงาน d-d (d-d Transition)</strong>: เมื่อมีแสงกระทบ อิเล็กตรอนในระดับล่าง (t2g) จะดูดกลืนโฟตอนที่มีพลังงานเท่ากับค่าสปลิต (Delta_0) เพื่อขยับไปอยู่ระดับบน (eg)</li>
            <li><strong>อนุกรมสเปกโตรเคมี (Spectrochemical Series)</strong>: ลิแกนด์แต่ละตัวมีความแรงสนามในการสปลิตต่างกัน ลิแกนด์สนามแรง (เช่น CN-) จะมีค่า Delta_0 กว้าง ดูดกลืนแสงความยาวคลื่นสั้น (ฟ้า/UV) ทำให้แสดงเฉดสีเหลืองหรือส้มอมแดงที่เป็นสีคู่ตรงข้ามกลับมา</li>
          </ul>
        </div>
      }
      steps={[
        { label: "เลือกประเภทสารละลายไอออนของโลหะตั้งต้น", icon: Activity },
        { label: "ทดลองสลับเปลี่ยนชนิดลิแกนด์เพื่อเข้าทำปฏิกิริยาสร้างโครงสร้าง", icon: Activity },
        { label: "กด Excite เพื่อดูแอนิเมชันดูดกลืนพลังงานแสงของ d-orbital", icon: Sparkles },
        { label: "สังเกตความยาวคลื่นที่ดูดกลืนและบันทึกเฉดสีลงตารางแล็บ", icon: Info },
      ]}
      learningGoals={[
        "เข้าใจทฤษฎีการเกิดโครงสร้างและสีของสารประกอบเชิงซ้อนโลหะแทรนซิชันตามหลัก CFT",
        "วิเคราะห์สเปกตรัมดูดกลืนแสงและค่าพลังงานแยกตัวตามชนิดลิแกนด์ในอนุกรมสเปกโตรเคมี",
        "คำนวณความสัมพันธ์ระหว่างช่องว่างพลังงาน Δ₀ และความยาวคลื่นความถี่ดูดกลืนแสง",
      ]}
      progressLabel="ระดับการเรียนรู้"
      progressValue={logs.length >= 3 ? "สำเร็จ" : `${logs.length} / 3`}
      progressPercent={Math.min((logs.length / 3) * 100, 100)}
      tips={[
        "สีของสารเชิงซ้อนที่เรามองเห็นด้วยตา คือคู่สีตรงข้าม (Complementary Color) ของแสงความยาวคลื่นที่ดูดกลืนไปจริง",
        "สารประกอบเชิงซ้อนที่ไม่มีการดูดกลืนแสงในช่วงวิสัยทัศน์หรือช่องว่างพลังงานกว้างเกินช่วงแสงสีขาวจะมองเห็นเป็นสารไม่มีสีหรือสีขาวใส",
      ]}
      showLiveMetrics={true}
      showInfoTabs={true}
      showSaveButton={true}
      onSave={handleSave}
    />
  );
}
