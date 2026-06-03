"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Compass,
  Pause,
  Play,
  RotateCcw,
  Wind,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface DataPoint {
  generation: number;
  lightCount: number;
  darkCount: number;
  sootLevel: number;
}

export default function NaturalSelectionSimulation() {
  const [sootLevel, setSootLevel] = useState(20); // % soot (0-100)
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [maxGenerations, setMaxGenerations] = useState(8);
  const [lightCount, setLightCount] = useState(50); // initial 50%
  const [darkCount, setDarkCount] = useState(50); // initial 50%
  const [history, setHistory] = useState<DataPoint[]>([
    { generation: 1, lightCount: 50, darkCount: 50, sootLevel: 20 },
  ]);

  const isRunningRef = useRef(isRunning);
  const generationRef = useRef(generation);
  const maxGenerationsRef = useRef(maxGenerations);
  const lightCountRef = useRef(lightCount);
  const darkCountRef = useRef(darkCount);
  const sootLevelRef = useRef(sootLevel);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { generationRef.current = generation; }, [generation]);
  useEffect(() => { maxGenerationsRef.current = maxGenerations; }, [maxGenerations]);
  useEffect(() => { lightCountRef.current = lightCount; }, [lightCount]);
  useEffect(() => { darkCountRef.current = darkCount; }, [darkCount]);
  useEffect(() => { sootLevelRef.current = sootLevel; }, [sootLevel]);

  // Calculate camouflage/adaptation message
  const camouflageState = useMemo(() => {
    if (sootLevel < 40) return "เหมาะกับผีเสื้อสีสว่าง (Lichen Dominant)";
    if (sootLevel > 60) return "เหมาะกับผีเสื้อสีเขม่า (Soot Dominant)";
    return "สภาวะสมดุลเชิงวิวัฒนาการ";
  }, [sootLevel]);

  // Evolution logic running over generations
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      const currentGen = generationRef.current;
      if (currentGen >= maxGenerationsRef.current) {
        setIsRunning(false);
        isRunningRef.current = false;
        return;
      }

      // Natural Selection calculations:
      const soot = sootLevelRef.current / 100;
      const L = lightCountRef.current;
      const D = darkCountRef.current;

      // Survival probabilities:
      // If soot is high (1.0), light moths have very low survival (0.15), dark moths have high (0.85)
      // If soot is low (0.0), light moths have high survival (0.85), dark moths have low (0.15)
      const lightSurvival = 0.85 - soot * 0.7;
      const darkSurvival = 0.15 + soot * 0.7;

      // Survival population
      let nextL = L * lightSurvival;
      let nextD = D * darkSurvival;

      // Repopulation back to carrying capacity (100 moths total)
      const totalSurvival = nextL + nextD;
      if (totalSurvival > 0) {
        nextL = (nextL / totalSurvival) * 100;
        nextD = (nextD / totalSurvival) * 100;
      } else {
        // Fallback if everything dies
        nextL = 50;
        nextD = 50;
      }

      const finalL = Math.round(nextL);
      const finalD = Math.round(nextD);

      const nextGen = currentGen + 1;
      setGeneration(nextGen);
      setLightCount(finalL);
      setDarkCount(finalD);

      setHistory((prev) => [
        ...prev,
        {
          generation: nextGen,
          lightCount: finalL,
          darkCount: finalD,
          sootLevel: sootLevelRef.current,
        },
      ]);
    }, 1500); // 1.5 seconds per generation

    return () => clearInterval(timer);
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setGeneration(1);
    setLightCount(50);
    setDarkCount(50);
    setHistory([{ generation: 1, lightCount: 50, darkCount: 50, sootLevel }]);
  };

  const handleSave = async () => {
    if (history.length <= 1) {
      alert("กรุณาเริ่มจำลองกระบวนการรันรุ่นประชากรสะสมก่อนบันทึกผล");
      return;
    }

    const lastPoint = history[history.length - 1];
    const experimentData = {
      labId: "natural-selection",
      timestamp: new Date().toLocaleString("th-TH"),
      sootLevel,
      maxGenerations,
      finalLightPercent: lastPoint.lightCount,
      finalDarkPercent: lastPoint.darkCount,
      dataPoints: history,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_selection_experiment",
      localPayload: experimentData,
      labId: "natural-selection",
      title: "Natural Selection Simulator",
      variables: { sootLevel, maxGenerations },
      liveValues: { finalLightPercent: lastPoint.lightCount, finalDarkPercent: lastPoint.darkCount },
      graphPoints: history.map((h) => ({ x: h.generation, y: h.lightCount })),
      tableRows: history,
      summary: {
        sootLevel,
        finalGeneration: lastPoint.generation,
        finalLightPercent: lastPoint.lightCount,
      },
      score: 100,
    });
    alert("บันทึกผลการทดลอง Natural Selection สำเร็จ");
  };

  // Convert SootLevel to bark color hex
  const barkColor = useMemo(() => {
    // 0% soot = light silver grayish bark (#cbd5e1)
    // 100% soot = black charcoal bark (#0f172a)
    const baseVal = 203 - Math.round((sootLevel / 100) * 180); // LERP green/blue channel
    const rgbStr = `rgb(${baseVal}, ${baseVal}, ${baseVal})`;
    return rgbStr;
  }, [sootLevel]);

  return (
    <SharedSimulationShell
      accent="emerald"
      labId="natural-selection"
      category="Biology"
      title="Natural Selection Simulator"
      subtitle="จำลองสัดส่วนวิวัฒนาการและการปรับตัวตามสภาพแวดล้อมประชากรผีเสื้อกลางคืน (Peppered Moth) ตามทฤษฎีการคัดเลือกโดยธรรมชาติ"
      statusLabel={isRunning ? "กำลังคัดเลือกธรรมชาติ" : "พร้อมทดลอง"}
      icon={Activity}
      sceneTitle="ภาพจำลองลำต้นต้นไม้ของผีเสื้อจำลอง"
      scene={
        <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-[#0f172a] shadow-inner">
          {/* Trunk visualization */}
          <div className="absolute inset-0 transition-colors duration-500 pointer-events-none" style={{ backgroundColor: barkColor }} />

          {/* Tree trunk bark texture details */}
          <svg className="absolute inset-0 h-full w-full opacity-20 pointer-events-none" viewBox="0 0 400 300">
            <path d="M50 0 V300 M100 0 V300 M180 0 V300 M240 0 V300 M320 0 V300 M370 0 V300" stroke="#000" strokeWidth="6" strokeDasharray="30 20" />
            <path d="M80 0 V300 M140 0 V300 M210 0 V300 M290 0 V300 M350 0 V300" stroke="#fff" strokeWidth="2.5" strokeDasharray="15 30" />
          </svg>

          {/* Bird sweeps across during generation updates */}
          {isRunning && (
            <div className="absolute top-1/3 left-0 w-24 h-16 pointer-events-none animate-[ping_3s_infinite]" style={{ transform: "scaleX(-1)" }}>
              <svg viewBox="0 0 64 64" fill="#1e293b" className="w-full h-full opacity-60">
                <path d="M10 20 Q 32 5 54 20 Q 32 40 10 20 Z M32 20 Q 32 35 48 30" />
              </svg>
            </div>
          )}

          {/* Moth populations representation on trunk */}
          <svg className="relative z-10 h-full w-full max-w-[480px] p-4" viewBox="0 0 400 300" fill="none">
            {/* Draw light moths */}
            {Array.from({ length: Math.round(lightCount / 10) }).map((_, idx) => {
              const mx = 60 + (idx * 79) % 280;
              const my = 40 + (idx * 53) % 220;

              return (
                <g key={`light-${idx}`} transform={`translate(${mx}, ${my})`}>
                  {/* Moth body (white/gray wings) */}
                  <path d="M 0 0 L -12 -20 L -6 -6 L 0 -18 L 6 -6 L 12 -20 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                  <path d="M 0 0 L -14 -8 L -4 -2 L 0 -14 L 4 -2 L 14 -8 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
                  <circle cx="0" cy="-6" r="2.5" fill="#334155" />
                </g>
              );
            })}

            {/* Draw dark moths */}
            {Array.from({ length: Math.round(darkCount / 10) }).map((_, idx) => {
              const mx = 80 + (idx * 83) % 270;
              const my = 50 + (idx * 61) % 210;

              return (
                <g key={`dark-${idx}`} transform={`translate(${mx}, ${my})`}>
                  {/* Moth body (charcoal/black wings) */}
                  <path d="M 0 0 L -12 -20 L -6 -6 L 0 -18 L 6 -6 L 12 -20 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
                  <path d="M 0 0 L -14 -8 L -4 -2 L 0 -14 L 4 -2 L 14 -8 Z" fill="#0f172a" stroke="#020617" strokeWidth="1" />
                  <circle cx="0" cy="-6" r="2.5" fill="#475569" />
                </g>
              );
            })}
          </svg>

          {/* Camouflage status badge inside viewport */}
          <div className="absolute right-5 bottom-5 rounded-xl bg-slate-900/90 border border-slate-700/60 px-3.5 py-1.5 text-right font-bold text-xs text-white">
            <span className="text-[10px] text-slate-400 block font-black">สภาพผิวเปลือกไม้พืช</span>
            {sootLevel}% โลหะเขม่าควัน
          </div>
        </div>
      }
      controlsTitle="ควบคุมสภาพแวดล้อมป่าอุตสาหกรรม"
      controls={
        <div className="space-y-4 font-sans">
          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600 font-sans">
              <span>ระดับควันเขม่าเกาะขอนไม้ (Pollution Soot)</span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-black text-emerald-700">{sootLevel}% Soot</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={sootLevel}
              disabled={isRunning || generation > 1}
              onChange={(e) => setSootLevel(Number(e.target.value))}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-emerald-500 disabled:opacity-45"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600 font-sans">
              <span>จำลองรันข้ามรุ่นสูงสุด (Max Generations)</span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-black text-emerald-700">{maxGenerations} รุ่น</span>
            </div>
            <input
              type="range"
              min={5}
              max={15}
              step={1}
              value={maxGenerations}
              disabled={isRunning || generation > 1}
              onChange={(e) => setMaxGenerations(Number(e.target.value))}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-emerald-500 disabled:opacity-45"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600 font-sans">
              <span>รุ่นการคัดเลือกปัจจุบัน</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono font-black text-slate-800">รุ่นที่ {generation} / {maxGenerations}</span>
            </div>
          </label>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleStartStop}
              className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${
                isRunning ? "bg-slate-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
              {isRunning ? "หยุดจำลอง" : "เริ่มวิวัฒนาการ"}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label="รีเซ็ต"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
      metrics={[
        { label: "รุ่นปัจจุบัน", value: `รุ่นที่ ${generation}`, tone: "emerald" },
        { label: "ผีเสื้อสว่าง (Light)", value: `${lightCount}%`, tone: "cyan" },
        { label: "ผีเสื้อดำ (Dark)", value: `${darkCount}%`, tone: "orange" },
        { label: "ระดับการพรางตัว", value: camouflageState.split(" (")[0], tone: "violet" },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <BarChart3 className="h-4.5 w-4.5 text-emerald-600" />
              อัตราส่วนการปรับตัว
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 select-none">natural selection ratio</span>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-4 rounded-xl bg-slate-50/70 p-4 text-xs font-semibold text-slate-500">
            <div className="flex justify-between items-center text-slate-700 font-bold">
              <span>ประชากรผีเสื้อสว่าง (Light):</span>
              <span>{lightCount}%</span>
            </div>
            <div className="h-6 overflow-hidden rounded-full bg-white relative">
              <div
                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-400 to-emerald-600"
                style={{ width: `${lightCount}%` }}
              />
            </div>
            <p className="text-[10px] font-bold leading-normal text-slate-400">
              * สีขาวแทนผีเสื้อสว่าง สีเข้มแทนผีเสื้อสีดาร์ก/เขม่าควัน สัดส่วนจะเปลี่ยนไปอย่างมีนัยสำคัญเมื่อรันไปหลายชั่วอายุคน
            </p>
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <ClipboardList className="h-4.5 w-4.5 text-emerald-600" />
              ตารางรุ่นประชากร
            </h3>
            <span className="text-[10px] font-bold text-slate-400 select-none">{history.length} รุ่นสถิติ</span>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-100 max-h-[190px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50/70 text-[11px] font-black text-emerald-800 sticky top-0">
                <tr>
                  <th className="px-2 py-2">รุ่น</th>
                  <th className="px-2 py-2">ผีเสื้อสว่าง</th>
                  <th className="px-2 py-2">ผีเสื้อดำ</th>
                  <th className="px-2 py-2">เขม่าควัน (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                {history.map((point, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-2 font-mono">G{point.generation}</td>
                    <td className="px-2 py-2 font-mono text-cyan-700">{point.lightCount}%</td>
                    <td className="px-2 py-2 font-mono text-orange-700">{point.darkCount}%</td>
                    <td className="px-2 py-2 font-mono">{point.sootLevel}%</td>
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
            <Compass className="h-4.5 w-4.5 text-emerald-600" />
            ทฤษฎีการคัดเลือกตามธรรมชาติ
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3 text-xs font-semibold leading-relaxed text-slate-500">
            <p>
              **Natural Selection**: สิ่งมีชีวิตที่มีลักษณะเหมาะสมกับสภาพแวดล้อมมากกว่า จะมีโอกาสอยู่รอดและสืบพันธุ์เพื่อส่งลักษณะนั้นไปยังรุ่นถัดไป (Survival of the Fittest)
            </p>
            <p>
              **Industrial Melanism**: การปฏิวัติอุตสาหกรรมในอังกฤษทำให้ต้นไม้ปกคลุมไปด้วยเขม่าควันสีดำ ส่งผลให้ผีเสื้อกลางคืนตัวสีเข้มพรางตัวพ้นสายตานกนักล่าได้ดีกว่าผีเสื้อตัวสีขาว
            </p>
          </div>
        </section>
      }
      steps={[
        { label: "ปรับตั้งค่าระดับมลพิษ", icon: Wind },
        { label: "รันจำลองการคัดเลือก", icon: Play },
        { label: "นกนักล่าเริ่มกินผีเสื้อ", icon: Activity },
        { label: "วัดสัดส่วนยีนประชากร", icon: BarChart3 },
        { label: "บันทึกผลทางชีววิทยา", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "อธิบายผลของสิ่งแวดล้อม (มลพิษเขม่า) ต่อการพรางตัวและการอยู่รอดของผีเสื้อ",
        "ศึกษาผลกระทบของการล่าโดยผู้ล่าที่เป็นนกต่อสัดส่วนยีนของประชากร",
        "ทำความเข้าใจการเปลี่ยนแปลงความถี่ยีนในประชากรผีเสื้อข้ามรุ่นอายุขัย",
        "อธิบายทฤษฎีวิวัฒนาการการคัดเลือกตามธรรมชาติของชาร์ลส์ ดาร์วิน",
      ]}
      progressLabel="อัตราความคืบหน้าของรุ่นจำลอง"
      progressValue={`รุ่นที่ ${generation} / ${maxGenerations}`}
      progressPercent={Math.min(100, (generation / maxGenerations) * 100)}
      tips={[
        "ทดลองปรับ Pollution Soot ไปที่ 0% (ธรรมชาติบริสุทธิ์) เพื่อดูประชากรผีเสื้อขาวครองป่า",
        "ทดลองปรับ Pollution Soot ไปที่ 100% (เขม่าดำสนิท) เพื่อดูผีเสื้อดำปรับตัวรอดได้มากกว่า",
        "เปรียบเทียบสถิติการขยับของความถี่ยีนในตารางเมื่อจำลองไปจนครบ 15 รุ่น",
      ]}
      onSave={handleSave}
    />
  );
}
