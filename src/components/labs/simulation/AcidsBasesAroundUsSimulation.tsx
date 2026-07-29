"use client";

import React, { useState } from "react";
import SharedSimulationShell from "./SharedSimulationShell";
import {
  Beaker,
  Droplets,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import { labsById } from "@/data/labs";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface ObservationLog {
  id: number;
  substanceName: string;
  indicatorName: string;
  drops: number;
  ph: number;
  colorName: string;
  classification: string;
}

const substances = [
  { id: "lemon", name: "น้ำมะนาว (Lemon Juice)", ph: 2.0, color: "#fef08a" },
  { id: "vinegar", name: "น้ำส้มสายชู (Vinegar)", ph: 3.0, color: "#f8fafc" },
  { id: "tomato", name: "น้ำมะเขือเทศ (Tomato Juice)", ph: 4.2, color: "#fca5a5" },
  { id: "water", name: "น้ำบริสุทธิ์ (Pure Water)", ph: 7.0, color: "#e2e8f0" },
  { id: "baking-soda", name: "สารละลายผงฟู (Baking Soda)", ph: 9.0, color: "#f1f5f9" },
  { id: "soap", name: "น้ำสบู่ (Soapy Water)", ph: 10.5, color: "#cbd5e1" },
  { id: "bleach", name: "น้ำยาซักผ้าขาว (Bleach)", ph: 12.0, color: "#e2e8f0" },
];

const indicators = [
  { id: "cabbage", name: "น้ำกะหล่ำปลีม่วง (Red Cabbage)" },
  { id: "turmeric", name: "น้ำขมิ้นชัน (Turmeric)" },
  { id: "butterfly-pea", name: "น้ำอัญชัน (Butterfly Pea)" },
];

// Helper to calculate blended color based on substance pH, indicator, and drops count
const getBlendedColor = (substanceColor: string, ph: number, indicatorId: string, drops: number) => {
  if (drops === 0) return substanceColor;

  let indicatorColor = "#ffffff";
  if (indicatorId === "cabbage") {
    if (ph <= 2.5) indicatorColor = "#ef4444"; // red
    else if (ph <= 4.5) indicatorColor = "#c084fc"; // purple-pink
    else if (ph <= 7.5) indicatorColor = "#6366f1"; // blue-violet
    else if (ph <= 9.5) indicatorColor = "#10b981"; // green-blue
    else indicatorColor = "#eab308"; // yellow-green
  } else if (indicatorId === "turmeric") {
    if (ph < 8.0) indicatorColor = "#eab308"; // yellow
    else indicatorColor = "#7c2d12"; // reddish-brown
  } else if (indicatorId === "butterfly-pea") {
    if (ph <= 4.5) indicatorColor = "#a855f7"; // purple
    else if (ph <= 7.5) indicatorColor = "#3b82f6"; // blue
    else indicatorColor = "#0f766e"; // greenish-blue
  }

  // Linear color interpolation based on drops (max mix at 5 drops)
  const ratio = Math.min(drops / 5, 0.8);

  // Parse hex colors
  const hexToRgb = (hex: string) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return { r, g, b };
  };

  const c1 = hexToRgb(substanceColor);
  const c2 = hexToRgb(indicatorColor);

  const r = Math.round(c1.r * (1 - ratio) + c2.r * ratio);
  const g = Math.round(c1.g * (1 - ratio) + c2.g * ratio);
  const b = Math.round(c1.b * (1 - ratio) + c2.b * ratio);

  return `rgb(${r}, ${g}, ${b})`;
};

const getColorName = (ph: number, indicatorId: string, drops: number) => {
  if (drops === 0) return "สีเดิมของสาร";
  if (indicatorId === "cabbage") {
    if (ph <= 2.5) return "แดง (Red)";
    if (ph <= 4.5) return "ม่วงชมพู (Purple-Pink)";
    if (ph <= 7.5) return "น้ำเงินม่วง (Blue-Violet)";
    if (ph <= 9.5) return "เขียวอมน้ำเงิน (Green-Blue)";
    return "เหลืองเขียว (Yellow-Green)";
  }
  if (indicatorId === "turmeric") {
    if (ph < 8.0) return "เหลือง (Yellow)";
    return "ส้มแดง/น้ำตาลแดง (Red-Brown)";
  }
  if (ph <= 4.5) return "ม่วง (Purple)";
  if (ph <= 7.5) return "น้ำเงิน (Blue)";
  return "เขียวอมน้ำเงิน (Green-Blue)";
};

const getClassification = (ph: number) => {
  if (ph < 6.5) return "กรด (Acid)";
  if (ph > 7.5) return "เบส (Base)";
  return "กลาง (Neutral)";
};

export default function AcidsBasesAroundUsSimulation() {
  const labId = "acids-bases-around-us";
  const labData = labsById[labId];

  const [selectedSubstance, setSelectedSubstance] = useState(substances[0]);
  const [selectedIndicator, setSelectedIndicator] = useState(indicators[0]);
  const [drops, setDrops] = useState(0);
  const [isDropping, setIsDropping] = useState(false);
  const [observations, setObservations] = useState<ObservationLog[]>([]);
  const [, setIsSaving] = useState(false);

  // Animation drop positioning
  const [dropY, setDropY] = useState(60);
  const [dropOpacity, setDropOpacity] = useState(0);

  // Handle dropping animation
  const handleAddDrop = () => {
    if (isDropping) return;
    setIsDropping(true);
    setDropY(60);
    setDropOpacity(1);

    const startTime = performance.now();
    const duration = 600; // 600ms drop animation

    const animateDrop = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Calculate drop Y position (from dropper tip 60px to liquid surface 180px)
      setDropY(60 + progress * 120);

      if (progress < 1) {
        requestAnimationFrame(animateDrop);
      } else {
        setDropOpacity(0);
        setIsDropping(false);
        setDrops(prev => Math.min(prev + 1, 10));
      }
    };

    requestAnimationFrame(animateDrop);
  };

  const handleReset = () => {
    setDrops(0);
    setIsDropping(false);
    setDropOpacity(0);
  };

  const handleLogObservation = () => {
    const ph = selectedSubstance.ph;
    const classification = getClassification(ph);
    const colorName = getColorName(ph, selectedIndicator.id, drops);

    const isDuplicate = observations.some(
      o => o.substanceName === selectedSubstance.name && o.indicatorName === selectedIndicator.name && o.drops === drops
    );

    if (isDuplicate) {
      window.alert("บันทึกการสังเกตนี้มีอยู่แล้ว");
      return;
    }

    const newLog: ObservationLog = {
      id: Date.now(),
      substanceName: selectedSubstance.name,
      indicatorName: selectedIndicator.name,
      drops,
      ph,
      colorName,
      classification,
    };

    setObservations(prev => [newLog, ...prev]);
  };

  const handleClearLogs = () => {
    setObservations([]);
  };

  const handleSave = async () => {
    if (observations.length === 0) {
      window.alert("กรุณาบันทึกการทดสอบอย่างน้อย 1 รายการก่อนส่งผล");
      return;
    }

    setIsSaving(true);
    try {
      await saveExperimentAndSync({
        localStorageKey: "scisiam_saved_acids_bases_around_us_experiment",
        localPayload: {
          labId,
          timestamp: new Date().toISOString(),
          observations,
        },
        labId,
        title: "กรด-เบสรอบตัว",
        variables: { dropsCount: drops },
        liveValues: {
          substance: selectedSubstance.id,
          indicator: selectedIndicator.id,
          ph: selectedSubstance.ph,
        },
        graphPoints: observations.map((o, idx) => ({
          index: idx,
          ph: o.ph,
        })),
        tableRows: observations,
        summary: {
          testCount: observations.length,
          latestPh: selectedSubstance.ph,
          latestClass: getClassification(selectedSubstance.ph),
        },
        durationSeconds: 30, // Ponytail: hardcoded estimated duration
      });
    } finally {
      setIsSaving(false);
    }
  };

  const classification = getClassification(selectedSubstance.ph);
  const liquidColor = getBlendedColor(selectedSubstance.color, selectedSubstance.ph, selectedIndicator.id, drops);

  const getMetricDisplay = () => [
    { label: "ค่า pH ของสาร", value: selectedSubstance.ph.toFixed(1) },
    { label: "จำนวนหยดอินดิเคเตอร์", value: `${drops} หยด` },
    { label: "ความเป็นกรด-เบส", value: classification },
  ];

  const compactControls = (
    <div className="flex min-h-[5.5rem] items-center justify-between gap-4 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-5 py-3">
      <div>
        <p className="text-sm font-extrabold text-slate-800">อินดิเคเตอร์ในตัวอย่าง</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          {selectedIndicator.name} · {drops} / 10 หยด
        </p>
      </div>
      <button
        type="button"
        onClick={handleAddDrop}
        disabled={isDropping || drops >= 10}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-extrabold text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <PlusCircle className="h-4 w-4" aria-hidden="true" />
        หยดอินดิเคเตอร์
      </button>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="cyan"
      labId={labId}
      category={labData?.category || "Chemistry"}
      title={labData?.thaiTitle || labData?.title || "กรด-เบสรอบตัว"}
      subtitle={labData?.description || ""}
      statusLabel="พร้อมใช้งาน"
      icon={Droplets}
      sceneTitle="หลอดทดลองกรด-เบส"
      scene={
        <div className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 min-h-[340px] relative w-full h-full">
          <svg viewBox="0 0 300 300" className="w-full max-w-sm h-auto drop-shadow-md" aria-labelledby="sim-title sim-desc">
            <title id="sim-title">หลอดทดลองผสมอินดิเคเตอร์ธรรมชาติ</title>
            <desc id="sim-desc">แสดงการเปลี่ยนสีของสารละลายเมื่อหยดอินดิเคเตอร์กรด-เบส</desc>

            {/* Dropper apparatus */}
            <g transform="translate(150, 20)">
              {/* Bulb */}
              <path d="M -15 -15 Q 0 -35 15 -15 L 10 15 L -10 15 Z" fill="#ef4444" opacity="0.8" />
              {/* Glass tube */}
              <rect x="-4" y="15" width="8" height="35" fill="#e2e8f0" opacity="0.6" stroke="#94a3b8" strokeWidth="1" />
              {/* Tip */}
              <path d="M -4 50 L 4 50 L 1 58 L -1 58 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
            </g>

            {/* Falling drop */}
            <circle cx="150" cy={dropY} r="5" fill="#a855f7" opacity={dropOpacity} />

            {/* Beaker container */}
            <path d="M 90 120 L 90 240 Q 90 250 100 250 L 200 250 Q 210 250 210 240 L 210 120" fill="none" stroke="#94a3b8" strokeWidth="4" />
            <path d="M 85 120 L 215 120" fill="none" stroke="#94a3b8" strokeWidth="4" />

            {/* Liquid level */}
            <path d="M 92 180 Q 150 178 208 180 L 208 240 Q 208 248 200 248 L 100 248 Q 92 248 92 240 Z" fill={liquidColor} opacity="0.75" style={{ transition: "fill 0.4s ease" }} />

            {/* Subtle beaker scale lines */}
            <line x1="90" y1="150" x2="110" y2="150" stroke="#64748b" strokeWidth="2" opacity="0.4" />
            <line x1="90" y1="180" x2="120" y2="180" stroke="#64748b" strokeWidth="2" opacity="0.4" />
            <line x1="90" y1="210" x2="110" y2="210" stroke="#64748b" strokeWidth="2" opacity="0.4" />
            <text x="125" y="184" className="text-[10px] fill-slate-400 font-bold" pointerEvents="none">100 ml</text>
          </svg>

          {/* pH Indicator Bar overlay */}
          <div className="w-full max-w-xs mt-4 bg-slate-200 dark:bg-slate-800 rounded-lg p-2 flex flex-col gap-1 items-center">
            <div className="flex justify-between w-full text-[10px] font-semibold text-slate-500">
              <span className="text-red-500">กรดจัด (pH 2)</span>
              <span className="text-green-500">กลาง (pH 7)</span>
              <span className="text-violet-500">เบสจัด (pH 12)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-violet-600 relative">
              <div
                className="absolute w-4 h-4 -top-0.5 border-2 border-white bg-slate-900 rounded-full shadow-md transition-all duration-300"
                style={{ left: `${((selectedSubstance.ph - 2) / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      }
      controlsTitle="การควบคุมสารและอินดิเคเตอร์"
      compactControls={compactControls}
      controls={
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">เลือกสารรอบตัว</label>
            <div className="grid grid-cols-1 gap-2">
              {substances.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSubstance(s);
                    handleReset();
                  }}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all ${
                    selectedSubstance.id === s.id
                      ? "bg-cyan-50 border-cyan-300 text-cyan-700 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-300 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-350 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{s.name}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">pH {s.ph.toFixed(1)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">เลือกอินดิเคเตอร์สีธรรมชาติ</label>
            <div className="grid grid-cols-1 gap-1.5">
              {indicators.map(ind => (
                <button
                  key={ind.id}
                  onClick={() => {
                    setSelectedIndicator(ind);
                    handleReset();
                  }}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all ${
                    selectedIndicator.id === ind.id
                      ? "bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-350 hover:bg-slate-50"
                  }`}
                >
                  {ind.name}
                </button>
              ))}
            </div>
          </div>

        </div>
      }
      metrics={getMetricDisplay()}
      graph={null}
      table={
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="p-3">สารรอบตัว</th>
                <th className="p-3">อินดิเคเตอร์</th>
                <th className="p-3">จำนวนหยด</th>
                <th className="p-3">pH</th>
                <th className="p-3">สีหลังทำปฏิกิริยา</th>
                <th className="p-3">สรุปผล</th>
              </tr>
            </thead>
            <tbody>
              {observations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 italic">ยังไม่มีผลการทดสอบที่บันทึกไว้</td>
                </tr>
              ) : (
                observations.map(o => (
                  <tr key={o.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{o.substanceName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{o.indicatorName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{o.drops} หยด</td>
                    <td className="p-3 font-bold text-cyan-600 dark:text-cyan-400">{o.ph.toFixed(1)}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{o.colorName}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.ph < 6.5 ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400" :
                        o.ph > 7.5 ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400" :
                        "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                      }`}>
                        {o.classification}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {observations.length > 0 && (
            <div className="p-2 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <button onClick={handleClearLogs} className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors">
                ล้างข้อมูลตารางทั้งหมด
              </button>
            </div>
          )}
        </div>
      }
      theory={
        <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>
            <strong>อินดิเคเตอร์กรด-เบสธรรมชาติ (Natural pH Indicators)</strong> เป็นสารสกัดจากพืชหรือดอกไม้ที่มีสารกลุ่ม
            <em>แอนโทไซยานิน (Anthocyanins)</em> หรือ <em>เคอร์คูมินอยด์ (Curcuminoids)</em> ซึ่งสามารถเปลี่ยนโครงสร้างโมเลกุลและแสดงสีสันที่แตกต่างกันไปเมื่ออยู่ในระดับความเป็นกรด (pH ต่ำ) หรือเบส (pH สูง)
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>น้ำกะหล่ำปลีสีม่วง</strong>: มีการเปลี่ยนสีได้หลากหลายที่สุด ครอบคลุมตั้งแต่ช่วงกรดจัด (สีแดง/ชมพู) จนถึงเบสจัด (สีเขียว/เหลือง)</li>
            <li><strong>น้ำขมิ้นชัน</strong>: สารเคอร์คูมินจะคงตัวเป็นสีเหลืองในสภาวะกรดและเป็นกลาง แต่จะเปลี่ยนเป็นสารสีน้ำตาลแดงในสภาวะเบส</li>
            <li><strong>น้ำดอกอัญชัน</strong>: จะแสดงสีน้ำเงินสวยงามในสภาวะเป็นกลาง เปลี่ยนเป็นสีม่วงหรือแดงเมื่อได้รับกรด และเปลี่ยนเป็นสีเขียวหรือเขียวแกมน้ำเงินในสภาวะเบส</li>
          </ul>
        </div>
      }
      steps={[
        { label: "เลือกสารรอบตัวที่ต้องการทดสอบในกล่องควบคุม", icon: Beaker },
        { label: "เลือกอินดิเคเตอร์ธรรมชาติที่จะใช้ทำปฏิกิริยา", icon: Droplets },
        { label: "คลิกปุ่ม 'หยดสาร' เพื่อหยดสารและสังเกตการผสมสี", icon: PlusCircle },
        { label: "บันทึกผลการสังเกตเพื่อรวบรวมลงตารางแล็บ", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "เรียนรู้คุณสมบัติความเป็นกรด-เบสของสารเคมีและของใช้ในบ้าน",
        "เข้าใจการทำงานของอินดิเคเตอร์วัดระดับ pH สกัดจากพืชธรรมชาติ",
        "สรุปแนวโน้มการเปลี่ยนแปลงของระดับสีตามค่า pH และระดับการเปลี่ยนโครงสร้างเคมี",
      ]}
      progressLabel="ภารกิจสำรวจสารทดลอง"
      progressValue={`${Math.min(observations.length, 3)} / 3`}
      progressPercent={Math.min((observations.length / 3) * 100, 100)}
      tips={[
        "น้ำยาล้างจานหรือน้ำสบู่มีฤทธิ์เป็นเบสอ่อนเพื่อช่วยชะล้างไขมัน",
        "น้ำมะนาวและน้ำส้มสายชูประกอบด้วยกรดอินทรีย์ (กรดซิตริกและกรดอะซิติกตามลำดับ)",
        "น้ำยาซักผ้าขาวมีฤทธิ์เป็นเบสแก่และมีฤทธิ์กัดกร่อนสูง ควรทำความเข้าใจอย่างระมัดระวัง",
      ]}
      showLiveMetrics={true}
      showInfoTabs={true}
      showSaveButton={true}
      onRun={handleLogObservation}
      runLabel="บันทึกการสังเกต"
      runDisabled={drops === 0}
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}

