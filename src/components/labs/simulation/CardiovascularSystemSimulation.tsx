"use client";

import React, { useId, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Compass,
  Play,
  RotateCcw,
  Sliders,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface VitalSignRun {
  activityLevel: number;
  stimulantDose: number;
  recoveryMinutes: number;
  heartRate: number;
  systolic: number;
  diastolic: number;
  cardiacOutput: number;
  condition: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function classifyVitals(heartRate: number, systolic: number) {
  if (heartRate > 150 || systolic > 155) return "โซนภาระหัวใจสูง";
  if (heartRate > 105 || systolic > 132) return "ตอบสนองต่อกิจกรรม";
  if (heartRate < 58) return "พักตัวต่ำกว่าปกติ";
  return "สภาวะพักสมดุล";
}

export default function CardiovascularSystemSimulation() {
  const sceneId = useId().replace(/:/g, "");
  const [activityLevel, setActivityLevel] = useState(2);
  const [stimulantDose, setStimulantDose] = useState(0);
  const [recoveryMinutes, setRecoveryMinutes] = useState(0);
  const [isMeasured, setIsMeasured] = useState(false);
  const [history, setHistory] = useState<VitalSignRun[]>([]);

  const vitalSigns = useMemo(() => {
    const heartRate = Math.round(clamp(62 + activityLevel * 18 + stimulantDose * 1.2 - recoveryMinutes * 3.5, 48, 188));
    const systolic = Math.round(clamp(108 + activityLevel * 9 + stimulantDose * 0.55 - recoveryMinutes * 1.2, 88, 172));
    const diastolic = Math.round(clamp(68 + activityLevel * 3 + stimulantDose * 0.18 - recoveryMinutes * 0.4, 55, 108));
    const strokeVolume = clamp(68 + activityLevel * 4 - stimulantDose * 0.05, 54, 96);
    const cardiacOutput = Math.round((heartRate * strokeVolume / 1000) * 10) / 10;
    const condition = classifyVitals(heartRate, systolic);

    return { heartRate, systolic, diastolic, strokeVolume, cardiacOutput, condition };
  }, [activityLevel, stimulantDose, recoveryMinutes]);

  const ecgPath = useMemo(() => {
    const beatSpacing = clamp(92 - vitalSigns.heartRate * 0.26, 42, 76);
    const points: string[] = ["M12 150"];

    for (let x = 18; x < 390; x += beatSpacing) {
      points.push(
        `L${x} 150`,
        `L${x + 10} 150`,
        `L${x + 16} 136`,
        `L${x + 24} 168`,
        `L${x + 32} 112`,
        `L${x + 40} 174`,
        `L${x + 50} 146`,
        `L${x + 60} 150`
      );
    }

    return points.join(" ");
  }, [vitalSigns.heartRate]);

  const latestRun: VitalSignRun = {
    activityLevel,
    stimulantDose,
    recoveryMinutes,
    heartRate: vitalSigns.heartRate,
    systolic: vitalSigns.systolic,
    diastolic: vitalSigns.diastolic,
    cardiacOutput: vitalSigns.cardiacOutput,
    condition: vitalSigns.condition,
  };

  const invalidateRunState = () => {
    setIsMeasured(false);
    setHistory([]);
  };

  const handleMeasure = () => {
    setIsMeasured(true);
    setHistory((prev) => [latestRun, ...prev].slice(0, 6));
  };

  const handleReset = () => {
    setActivityLevel(2);
    setStimulantDose(0);
    setRecoveryMinutes(0);
    setIsMeasured(false);
    setHistory([]);
  };

  const handleSave = async () => {
    if (history.length === 0) {
      alert("กรุณากดวัดสัญญาณชีพก่อนบันทึกผล");
      return;
    }

    const latest = history[0];
    const experimentData = {
      labId: "heart-rate",
      timestamp: new Date().toLocaleString("th-TH"),
      activityLevel,
      stimulantDose,
      recoveryMinutes,
      heartRate: latest.heartRate,
      bloodPressure: `${latest.systolic}/${latest.diastolic}`,
      cardiacOutput: latest.cardiacOutput,
      condition: latest.condition,
      dataPoints: history,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_heart_rate_experiment",
      localPayload: experimentData,
      labId: "heart-rate",
      title: "Cardiovascular System Lab",
      variables: { activityLevel, stimulantDose, recoveryMinutes },
      liveValues: {
        heartRate: latest.heartRate,
        systolic: latest.systolic,
        diastolic: latest.diastolic,
        cardiacOutput: latest.cardiacOutput,
      },
      graphPoints: history.slice().reverse().map((run, index) => ({ x: index + 1, y: run.heartRate })),
      tableRows: history,
      summary: {
        heartRate: latest.heartRate,
        bloodPressure: `${latest.systolic}/${latest.diastolic}`,
        cardiacOutput: latest.cardiacOutput,
        condition: latest.condition,
      },
      score: 100,
    });
    alert("บันทึกผลการทดลอง Cardiovascular System สำเร็จ");
  };

  return (
    <SharedSimulationShell
      accent="blue"
      labId="heart-rate"
      category="Biology"
      title="Cardiovascular System Lab"
      subtitle="จำลองการตอบสนองของหัวใจ ความดันเลือด และ Cardiac Output ต่อกิจกรรมทางกาย สารกระตุ้น และเวลาพักฟื้น"
      statusLabel={isMeasured ? vitalSigns.condition : "พร้อมทดลอง"}
      icon={Activity}
      sceneTitle="จอมอนิเตอร์ ECG และความดันเลือด"
      scene={
        <div className="relative flex h-[360px] items-center justify-center overflow-hidden bg-[#0f172a]">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-45 pointer-events-none" />
          <svg
            className="relative z-10 h-full w-full max-w-[720px] p-4"
            viewBox="0 0 640 340"
            fill="none"
            role="img"
            aria-labelledby={`${sceneId}-title ${sceneId}-description`}
          >
            <title id={`${sceneId}-title`}>ระบบไหลเวียนเลือดและจอมอนิเตอร์สัญญาณชีพ</title>
            <desc id={`${sceneId}-description`}>หัวใจส่งเลือดไปปอดและร่างกาย พร้อมแสดงคลื่นไฟฟ้าหัวใจ อัตราการเต้น ความดัน และปริมาตรเลือดที่สูบฉีด</desc>

            <g transform="translate(22 44)">
              <path d="M128 50C77 18 31 65 48 119C61 159 112 190 128 205C144 190 195 159 208 119C225 65 179 18 128 50Z" fill="#ef4444" stroke="#fecaca" strokeWidth="5" />
              <path d="M128 51V199M52 112H204" stroke="#991b1b" strokeWidth="5" opacity="0.72" />
              <path d="M87 42C70 16 79 0 96 -15M168 43C187 14 177 -3 161 -18" stroke="#f8fafc" strokeWidth="12" strokeLinecap="round" />
              <path d="M84 42C70 15 77 2 94 -15M171 43C188 15 180 1 164 -18" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
              <circle cx="92" cy="91" r="23" fill="#60a5fa" opacity="0.72" />
              <circle cx="164" cy="91" r="23" fill="#fb7185" opacity="0.76" />
              <circle cx="91" cy="148" r="28" fill="#2563eb" opacity="0.74" />
              <circle cx="165" cy="148" r="28" fill="#dc2626" opacity="0.78" />
              <path d="M43 90C5 77 -2 42 15 20M211 90C249 78 260 42 242 19" stroke="#60a5fa" strokeWidth="7" strokeLinecap="round" />
              <path d="M43 146C4 160 -2 196 18 220M211 146C249 162 258 197 238 222" stroke="#fb7185" strokeWidth="7" strokeLinecap="round" />
              <text x="128" y="244" textAnchor="middle" fill="#cbd5e1" fontSize="13" fontWeight="800">การไหลเวียนเลือด ปอด ↔ หัวใจ ↔ ร่างกาย</text>
            </g>

            <g transform="translate(285 37)">
              <rect width="330" height="238" rx="24" fill="#020617" stroke="#1e40af" strokeWidth="4" />
              <rect x="20" y="28" width="290" height="126" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              <g opacity="0.28" stroke="#1d4ed8">
                {Array.from({ length: 8 }).map((_, index) => <line key={`v-${index}`} x1={38 + index * 36} y1="34" x2={38 + index * 36} y2="148" />)}
                {Array.from({ length: 5 }).map((_, index) => <line key={`h-${index}`} x1="26" y1={46 + index * 22} x2="304" y2={46 + index * 22} />)}
              </g>
              <path d={ecgPath} transform="translate(15 -42) scale(.73 .82)" stroke={vitalSigns.heartRate > 150 ? "#fb7185" : "#22c55e"} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <text x="24" y="185" fill="#93c5fd" fontSize="12" fontWeight="900">HR</text>
              <text x="54" y="190" fill="#f8fafc" fontSize="26" fontWeight="900">{isMeasured ? vitalSigns.heartRate : "--"}</text>
              <text x="108" y="187" fill="#64748b" fontSize="10" fontWeight="900">bpm</text>
              <text x="162" y="185" fill="#93c5fd" fontSize="12" fontWeight="900">BP</text>
              <text x="190" y="190" fill="#f8fafc" fontSize="22" fontWeight="900">{isMeasured ? `${vitalSigns.systolic}/${vitalSigns.diastolic}` : "--/--"}</text>
              <text x="24" y="218" fill="#94a3b8" fontSize="11" fontWeight="800">CO {isMeasured ? `${vitalSigns.cardiacOutput} L/min` : "--"}</text>
              <text x="306" y="218" textAnchor="end" fill="#cbd5e1" fontSize="11" fontWeight="800">{isMeasured ? vitalSigns.condition : "ยังไม่วัด"}</text>
            </g>
          </svg>
        </div>
      }
      controlsTitle="ควบคุมกิจกรรมและภาระต่อหัวใจ"
      controls={
        <div className="space-y-4 font-sans">
          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>ระดับกิจกรรมทางกาย</span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-black text-blue-700">Level {activityLevel}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={activityLevel}
              onChange={(event) => {
                invalidateRunState();
                setActivityLevel(Number(event.target.value));
              }}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-blue-500"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>สารกระตุ้นจำลอง</span>
              <span className="rounded-md bg-rose-50 px-2 py-0.5 font-black text-rose-700">{stimulantDose} μg</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={5}
              value={stimulantDose}
              onChange={(event) => {
                invalidateRunState();
                setStimulantDose(Number(event.target.value));
              }}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-rose-500"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>เวลาพักฟื้นหลังออกแรง</span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-black text-emerald-700">{recoveryMinutes} นาที</span>
            </div>
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={recoveryMinutes}
              onChange={(event) => {
                invalidateRunState();
                setRecoveryMinutes(Number(event.target.value));
              }}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-emerald-500"
            />
          </label>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleMeasure}
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-black text-white shadow-sm hover:bg-blue-700"
            >
              <Play className="h-4 w-4 fill-white stroke-none" />
              วัดสัญญาณชีพ
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label="รีเซ็ตสัญญาณชีพ"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
      metrics={[
        { label: "Heart Rate", value: isMeasured ? `${vitalSigns.heartRate} bpm` : "--", tone: vitalSigns.heartRate > 150 ? "rose" : "blue" },
        { label: "Blood Pressure", value: isMeasured ? `${vitalSigns.systolic}/${vitalSigns.diastolic}` : "--/--", tone: "cyan" },
        { label: "Stroke Volume", value: isMeasured ? `${Math.round(vitalSigns.strokeVolume)} ml` : "--", tone: "emerald" },
        { label: "Cardiac Output", value: isMeasured ? `${vitalSigns.cardiacOutput} L/min` : "--", tone: "orange" },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <BarChart3 className="h-4.5 w-4.5 text-blue-600" />
              Heart Rate Trend
            </h3>
            <span className="text-[10px] font-bold text-blue-600 select-none">recent measurements</span>
          </div>
          <div className="flex flex-1 items-end justify-around gap-2 rounded-xl bg-slate-50/70 p-4">
            {(history.length > 0 ? history.slice().reverse() : [latestRun]).map((run, index) => (
              <div key={`${run.heartRate}-${index}`} className="flex h-44 flex-1 flex-col items-center justify-end gap-2 text-center">
                <div
                  className={`w-full max-w-[44px] rounded-t-xl transition-all duration-300 ${run.heartRate > 150 ? "bg-rose-500" : "bg-blue-500"}`}
                  style={{ height: `${Math.max(18, (run.heartRate / 190) * 100)}%` }}
                />
                <span className="text-[10px] font-black text-slate-600">{run.heartRate}</span>
              </div>
            ))}
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <ClipboardList className="h-4.5 w-4.5 text-blue-600" />
              ตารางสัญญาณชีพ
            </h3>
            <span className="text-[10px] font-bold text-slate-400 select-none">{history.length} records</span>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-100 max-h-[190px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-blue-50/80 text-[11px] font-black text-blue-800">
                <tr>
                  <th className="px-2 py-2">HR</th>
                  <th className="px-2 py-2">BP</th>
                  <th className="px-2 py-2">CO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                {history.map((run, index) => (
                  <tr key={`${run.heartRate}-${run.systolic}-${index}`}>
                    <td className="px-2 py-2 font-mono text-blue-700">{run.heartRate}</td>
                    <td className="px-2 py-2 font-mono">{run.systolic}/{run.diastolic}</td>
                    <td className="px-2 py-2 font-mono text-orange-700">{run.cardiacOutput}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      }
      theory={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800 leading-normal">
            <Compass className="h-4.5 w-4.5 text-blue-600" />
            ทฤษฎี Cardiac Output
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3 text-xs font-semibold leading-relaxed text-slate-500">
            <p>เมื่อร่างกายทำกิจกรรม ระบบประสาทซิมพาเทติกจะเพิ่มอัตราการเต้นหัวใจและแรงบีบตัว ทำให้ Cardiac Output สูงขึ้นเพื่อส่งเลือดและออกซิเจนให้กล้ามเนื้อ</p>
            <p className="rounded-xl bg-slate-50 p-3 text-slate-700">Cardiac Output = Heart Rate × Stroke Volume<br />ค่าปัจจุบัน: <b>{vitalSigns.cardiacOutput} L/min</b></p>
          </div>
        </section>
      }
      steps={[
        { label: "ตั้งระดับกิจกรรม", icon: Sliders },
        { label: "ปรับสารกระตุ้น", icon: Activity },
        { label: "วัด HR และ BP", icon: Play },
        { label: "คำนวณ Cardiac Output", icon: BarChart3 },
        { label: "ตีความโฮมีโอสเตซิส", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "อธิบายผลของกิจกรรมทางกายต่ออัตราการเต้นหัวใจและความดันเลือด",
        "คำนวณ Cardiac Output จาก Heart Rate และ Stroke Volume",
        "ตีความสัญญาณชีพเมื่อมีสารกระตุ้นหรือเมื่อเข้าสู่ช่วงพักฟื้น",
        "เชื่อมโยงระบบหมุนเวียนโลหิตกับการรักษาโฮมีโอสเตซิสของร่างกาย",
      ]}
      progressLabel="สถานะการวัดสัญญาณชีพ"
      progressValue={isMeasured ? vitalSigns.condition : "รอวัด"}
      progressPercent={isMeasured ? 100 : 0}
      tips={[
        "เพิ่ม Activity Level แล้วสังเกตว่า HR และ Systolic Pressure สูงขึ้นพร้อมกัน",
        "เพิ่ม Recovery Minutes เพื่อดูการกลับสู่สภาวะพัก",
        "ลองเพิ่ม Stimulant Dose เพื่อดูว่าหัวใจเข้าใกล้โซนภาระสูงเร็วขึ้น",
      ]}
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}
