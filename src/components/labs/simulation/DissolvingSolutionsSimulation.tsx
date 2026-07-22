"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CirclePause,
  CirclePlay,
  Droplets,
  Eraser,
  RotateCcw,
  Save,
  Thermometer,
  Utensils,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import {
  advanceDissolution,
  calculateDissolutionRate,
} from "@/lib/simulations/elementaryChemistry";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

type DissolutionPoint = {
  elapsedSeconds: number;
  dissolvedPercent: number;
};

type DissolutionTrial = {
  index: number;
  temperatureC: number;
  soluteGrams: number;
  isStirring: boolean;
  completionSeconds: number;
  dissolvedPercent: number;
};

const CRYSTALS = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  x: 292 + (index % 10) * 22 + (Math.floor(index / 10) % 2) * 8,
  y: 286 - Math.floor(index / 10) * 18 - (index % 3) * 2,
  size: 7 + (index % 4),
  angle: (index * 31) % 90,
}));

const FLOW_LINES = Array.from({ length: 5 }, (_, index) => ({
  id: index,
  radius: 42 + index * 18,
  offset: index * 19,
}));

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function DissolvingSolutionsSimulation() {
  const labId = "dissolving-solutions";
  const svgId = useId().replaceAll(":", "");
  const titleId = `dissolving-title-${svgId}`;
  const descriptionId = `dissolving-description-${svgId}`;
  const waterGradientId = `solution-water-${svgId}`;
  const [temperatureC, setTemperatureC] = useState(25);
  const [soluteGrams, setSoluteGrams] = useState(5);
  const [isStirring, setIsStirring] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dissolvedGrams, setDissolvedGrams] = useState(0);
  const [points, setPoints] = useState<DissolutionPoint[]>([
    { elapsedSeconds: 0, dissolvedPercent: 0 },
  ]);
  const [trials, setTrials] = useState<DissolutionTrial[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTimestampRef = useRef(0);
  const accumulatorRef = useRef(0);
  const elapsedRef = useRef(0);
  const dissolvedRef = useRef(0);
  const lastPublishedRef = useRef(0);
  const lastSampleRef = useRef(0);
  const completedRef = useRef(false);

  const rateGramsPerSecond = useMemo(
    () => calculateDissolutionRate(temperatureC, isStirring, soluteGrams),
    [isStirring, soluteGrams, temperatureC],
  );

  useEffect(() => {
    if (!isRunning) return;

    const publishPoint = (time: number, dissolved: number) => {
      const dissolvedPercent = Math.min(100, (dissolved / soluteGrams) * 100);
      setPoints((previous) => {
        const nextPoint = {
          elapsedSeconds: Number(time.toFixed(1)),
          dissolvedPercent: Number(dissolvedPercent.toFixed(1)),
        };
        const latest = previous.at(-1);
        if (latest?.elapsedSeconds === nextPoint.elapsedSeconds) return previous;
        return [...previous, nextPoint].slice(-80);
      });
    };

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === 0) lastTimestampRef.current = timestamp;
      const frameDelta = Math.min(
        0.1,
        Math.max(0, (timestamp - lastTimestampRef.current) / 1000),
      );
      lastTimestampRef.current = timestamp;
      accumulatorRef.current += frameDelta;

      let completed = false;
      while (accumulatorRef.current >= 0.05 && !completed) {
        dissolvedRef.current = advanceDissolution(
          dissolvedRef.current,
          rateGramsPerSecond,
          0.05,
          soluteGrams,
        );
        elapsedRef.current += 0.05;
        accumulatorRef.current -= 0.05;
        completed = dissolvedRef.current >= soluteGrams;
      }

      if (
        elapsedRef.current - lastPublishedRef.current >= 0.1 ||
        completed
      ) {
        lastPublishedRef.current = elapsedRef.current;
        setElapsedSeconds(elapsedRef.current);
        setDissolvedGrams(dissolvedRef.current);
      }

      if (elapsedRef.current - lastSampleRef.current >= 0.5 || completed) {
        lastSampleRef.current = elapsedRef.current;
        publishPoint(elapsedRef.current, dissolvedRef.current);
      }

      if (completed && !completedRef.current) {
        completedRef.current = true;
        setTrials((previous) => [
          ...previous,
          {
            index: previous.length + 1,
            temperatureC,
            soluteGrams,
            isStirring,
            completionSeconds: Number(elapsedRef.current.toFixed(1)),
            dissolvedPercent: 100,
          },
        ].slice(-12).map((trial, index) => ({ ...trial, index: index + 1 })));
        setIsRunning(false);
        return;
      }

      animationRef.current = window.requestAnimationFrame(tick);
    };

    animationRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastTimestampRef.current = 0;
    };
  }, [isRunning, isStirring, rateGramsPerSecond, soluteGrams, temperatureC]);

  const dissolvedPercent = Math.min(100, (dissolvedGrams / soluteGrams) * 100);
  const remainingGrams = Math.max(0, soluteGrams - dissolvedGrams);
  const concentrationGramsPerLiter = dissolvedGrams * 10;
  const visibleCrystalCount = Math.ceil(
    CRYSTALS.length * (remainingGrams / soluteGrams),
  );

  const toggleSimulation = () => {
    if (dissolvedRef.current >= soluteGrams) {
      window.alert("สารละลายหมดแล้ว กรุณารีเซ็ตเพื่อเริ่มรอบใหม่");
      return;
    }
    setHasStarted(true);
    lastTimestampRef.current = 0;
    setIsRunning((running) => !running);
  };

  const resetCurrentTrial = () => {
    setIsRunning(false);
    setHasStarted(false);
    setElapsedSeconds(0);
    setDissolvedGrams(0);
    setPoints([{ elapsedSeconds: 0, dissolvedPercent: 0 }]);
    lastTimestampRef.current = 0;
    accumulatorRef.current = 0;
    elapsedRef.current = 0;
    dissolvedRef.current = 0;
    lastPublishedRef.current = 0;
    lastSampleRef.current = 0;
    completedRef.current = false;
  };

  const handleSave = async () => {
    if (!hasStarted || points.length < 2) {
      window.alert("กรุณาเริ่มทดลองและเก็บข้อมูลก่อนบันทึกผล");
      return;
    }

    setIsSaving(true);
    try {
      await saveExperimentAndSync({
        localStorageKey: "scisiam_saved_dissolving_solutions_experiment",
        localPayload: {
          labId,
          timestamp: new Date().toISOString(),
          points,
          trials,
        },
        labId,
        title: "การละลายและสารละลาย",
        variables: { temperatureC, soluteGrams, isStirring },
        liveValues: {
          elapsedSeconds,
          dissolvedGrams,
          dissolvedPercent,
          remainingGrams,
        },
        graphPoints: points,
        tableRows: trials,
        summary: {
          trialsCount: trials.length,
          latestDissolvedPercent: dissolvedPercent,
        },
        durationSeconds: Math.round(elapsedSeconds),
      });
      window.alert("บันทึกผลการทดลองการละลายแล้ว");
    } finally {
      setIsSaving(false);
    }
  };

  const maxGraphTime = Math.max(10, ...points.map((point) => point.elapsedSeconds));
  const graphPolyline = points.map((point) => {
    const x = 58 + (point.elapsedSeconds / maxGraphTime) * 520;
    const y = 190 - (point.dissolvedPercent / 100) * 150;
    return `${x},${y}`;
  }).join(" ");

  const graph = (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-black text-slate-900">กราฟการละลายต่อเวลา</h3><p className="text-xs font-semibold text-slate-500">แกนตั้งแสดงร้อยละที่ละลายแล้ว</p></div><span className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-700">{points.length} จุด</span></div>
      <svg viewBox="0 0 620 230" className="h-auto w-full" role="img" aria-label="กราฟร้อยละการละลายต่อเวลา">
        <rect x="58" y="25" width="520" height="165" rx="12" fill="#f8fafc" />
        {[0, 25, 50, 75, 100].map((value) => { const y = 190 - (value / 100) * 150; return <g key={value}><line x1="58" y1={y} x2="578" y2={y} stroke="#e2e8f0" /><text x="50" y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">{value}%</text></g>; })}
        <polyline points={graphPolyline} fill="none" stroke="#0891b2" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point, index) => { const x = 58 + (point.elapsedSeconds / maxGraphTime) * 520; const y = 190 - (point.dissolvedPercent / 100) * 150; return <circle key={`${point.elapsedSeconds}-${index}`} cx={x} cy={y} r="4" fill="#0e7490" />; })}
        <text x="318" y="220" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">เวลา (วินาที)</text>
      </svg>
    </section>
  );

  const table = (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h3 className="text-sm font-black text-slate-900">เปรียบเทียบรอบที่ละลายหมด</h3><button type="button" onClick={() => setTrials([])} disabled={trials.length === 0} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-black text-slate-500 hover:bg-slate-50 disabled:opacity-40"><Eraser className="h-4 w-4" />ล้างตาราง</button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">ครั้ง</th><th className="px-4 py-3">อุณหภูมิ</th><th className="px-4 py-3">ตัวละลาย</th><th className="px-4 py-3">การคน</th><th className="px-4 py-3">เวลาที่ใช้</th><th className="px-4 py-3">ละลายแล้ว</th></tr></thead><tbody className="divide-y divide-slate-100 font-semibold text-slate-700">{trials.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">ทดลองจนละลายหมดเพื่อเพิ่มผลในตาราง</td></tr> : trials.map((trial) => <tr key={trial.index}><td className="px-4 py-3">{trial.index}</td><td className="px-4 py-3">{trial.temperatureC} °C</td><td className="px-4 py-3">{trial.soluteGrams} กรัม</td><td className="px-4 py-3">{trial.isStirring ? "คน" : "ไม่คน"}</td><td className="px-4 py-3 font-black text-cyan-700">{trial.completionSeconds.toFixed(1)} วินาที</td><td className="px-4 py-3">{trial.dissolvedPercent}%</td></tr>)}</tbody></table></div>
    </section>
  );

  const controls = (
    <div className="grid gap-4 xl:grid-cols-[repeat(3,minmax(150px,1fr))_auto] xl:items-end">
      <label className="block"><span className="mb-2 flex justify-between text-xs font-black text-slate-600"><span>ปริมาณตัวละลาย</span><output>{soluteGrams} กรัม</output></span><input aria-label="ปริมาณตัวละลาย" type="range" min="1" max="10" step="1" value={soluteGrams} onChange={(event) => setSoluteGrams(Number(event.target.value))} disabled={hasStarted} className="w-full accent-cyan-600 disabled:opacity-50" /></label>
      <label className="block"><span className="mb-2 flex justify-between text-xs font-black text-slate-600"><span>อุณหภูมิน้ำ</span><output>{temperatureC} °C</output></span><input aria-label="อุณหภูมิน้ำ" type="range" min="10" max="80" step="5" value={temperatureC} onChange={(event) => setTemperatureC(Number(event.target.value))} disabled={hasStarted} className="w-full accent-rose-500 disabled:opacity-50" /></label>
      <button type="button" onClick={() => setIsStirring((value) => !value)} disabled={hasStarted} aria-pressed={isStirring} className={`${buttonBase} ${isStirring ? "border-cyan-500 bg-cyan-50 text-cyan-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}><Utensils className="h-4 w-4" />{isStirring ? "คนสารละลาย" : "ไม่คนสารละลาย"}</button>
      <div className="grid grid-cols-3 gap-2"><button type="button" onClick={toggleSimulation} className={`${buttonBase} border-cyan-600 bg-cyan-600 text-white hover:bg-cyan-700`}>{isRunning ? <CirclePause className="h-4 w-4" /> : <CirclePlay className="h-4 w-4" />}{isRunning ? "หยุด" : "เริ่ม"}</button><button type="button" onClick={resetCurrentTrial} className={`${buttonBase} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`} aria-label="รีเซ็ตรอบปัจจุบัน"><RotateCcw className="h-4 w-4" /></button><button type="button" onClick={handleSave} disabled={isSaving || !hasStarted || points.length < 2} className={`${buttonBase} border-violet-600 bg-violet-600 text-white hover:bg-violet-700`} aria-label="บันทึกผลการทดลอง"><Save className="h-4 w-4" /></button></div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="cyan"
      labId={labId}
      category="Chemistry"
      title="การละลายและสารละลาย"
      subtitle="ปรับปริมาณ อุณหภูมิ และการคน เพื่อเปรียบเทียบอัตราที่ตัวละลายกระจายในน้ำ"
      statusLabel={dissolvedPercent >= 100 ? "ละลายหมดแล้ว" : isRunning ? "กำลังละลาย" : hasStarted ? "หยุดชั่วคราว" : "พร้อมเริ่มทดลอง"}
      icon={Droplets}
      sceneTitle="สถานีเตรียมสารละลาย"
      scene={<div className="h-full min-h-[310px] overflow-hidden rounded-2xl border border-cyan-100 bg-[#f3fcff]"><svg viewBox="0 0 760 380" className="h-full w-full" role="img" aria-labelledby={`${titleId} ${descriptionId}`}><title id={titleId}>{`การละลายตัวละลาย ${soluteGrams} กรัม ในน้ำ ${temperatureC} องศาเซลเซียส`}</title><desc id={descriptionId}>ผลึกตัวละลายลดลงตามเวลา สีของสารละลายเข้มขึ้น และการคนหรืออุณหภูมิสูงช่วยเพิ่มอัตราการละลาย</desc><defs><linearGradient id={waterGradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={temperatureC >= 55 ? "#fecdd3" : "#bae6fd"} stopOpacity="0.62" /><stop offset="1" stopColor="#0891b2" stopOpacity={0.2 + dissolvedPercent * 0.005} /></linearGradient></defs><rect width="760" height="380" fill="#f3fcff" /><path d="M0 338 H760" stroke="#a5f3fc" strokeWidth="4" /><g transform="translate(54 72)"><rect width="156" height="194" rx="22" fill="#fff" stroke="#cffafe" strokeWidth="2" /><text x="78" y="31" textAnchor="middle" fontSize="12" fontWeight="800" fill="#64748b">ตัวแปรทดลอง</text><text x="78" y="66" textAnchor="middle" fontSize="23" fontWeight="900" fill="#0e7490">{soluteGrams} กรัม</text><text x="78" y="96" textAnchor="middle" fontSize="14" fontWeight="800" fill="#e11d48">{temperatureC} °C</text><text x="78" y="126" textAnchor="middle" fontSize="13" fontWeight="800" fill="#475569">{isStirring ? "คนสารละลาย" : "ไม่คนสารละลาย"}</text><text x="78" y="158" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">อัตราโดยแบบจำลอง</text><text x="78" y="180" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0891b2">{rateGramsPerSecond.toFixed(2)} กรัม/วินาที</text></g><g><path d="M260 72 H530 L506 316 Q502 334 484 334 H306 Q288 334 284 316 Z" fill="#fff" fillOpacity="0.68" stroke="#64748b" strokeWidth="5" /><path d="M277 150 H513 L496 316 Q493 324 481 324 H309 Q297 324 294 316 Z" fill={`url(#${waterGradientId})`} /><path d="M277 150 Q395 138 513 150" fill="none" stroke="#22d3ee" strokeWidth="3" />{isStirring && FLOW_LINES.map((line) => <ellipse key={line.id} cx="395" cy={218 + line.offset * 0.25} rx={line.radius} ry={line.radius * 0.28} fill="none" stroke="#67e8f9" strokeWidth="2" strokeDasharray="8 9" opacity={isRunning ? 0.75 : 0.35} />)}{CRYSTALS.slice(0, visibleCrystalCount).map((crystal) => <rect key={crystal.id} x={crystal.x} y={crystal.y} width={crystal.size} height={crystal.size} rx="2" fill="#f8fafc" stroke="#0891b2" strokeWidth="2" transform={`rotate(${crystal.angle} ${crystal.x + crystal.size / 2} ${crystal.y + crystal.size / 2})`} />)}{isStirring && <g transform={`rotate(${isRunning ? Math.sin(elapsedSeconds * 4) * 12 : 0} 454 185)`}><path d="M520 48 L438 234" stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" /><ellipse cx="430" cy="250" rx="18" ry="29" fill="#cbd5e1" stroke="#64748b" strokeWidth="3" /></g>}</g><g transform="translate(570 76)"><rect width="150" height="208" rx="22" fill="#fff" stroke="#cffafe" strokeWidth="2" /><text x="75" y="31" textAnchor="middle" fontSize="12" fontWeight="800" fill="#64748b">ผลแบบ Real-time</text><text x="75" y="72" textAnchor="middle" fontSize="30" fontWeight="900" fill="#0891b2">{dissolvedPercent.toFixed(0)}%</text><rect x="22" y="88" width="106" height="11" rx="6" fill="#cffafe" /><rect x="22" y="88" width={106 * (dissolvedPercent / 100)} height="11" rx="6" fill="#06b6d4" /><text x="75" y="128" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">ละลายแล้ว</text><text x="75" y="149" textAnchor="middle" fontSize="15" fontWeight="900" fill="#0f172a">{dissolvedGrams.toFixed(2)} กรัม</text><text x="75" y="176" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">เวลา</text><text x="75" y="197" textAnchor="middle" fontSize="15" fontWeight="900" fill="#0f172a">{elapsedSeconds.toFixed(1)} วินาที</text></g></svg></div>}
      controlsTitle="ตั้งค่าการละลาย"
      controls={controls}
      compactControls={controls}
      metrics={[
        { label: "ละลายแล้ว", value: `${dissolvedGrams.toFixed(2)} กรัม`, tone: "cyan" },
        { label: "คงเหลือ", value: `${remainingGrams.toFixed(2)} กรัม`, tone: "orange" },
        { label: "ความเข้มข้น", value: `${concentrationGramsPerLiter.toFixed(1)} กรัม/ลิตร`, tone: "violet" },
        { label: "เวลา", value: `${elapsedSeconds.toFixed(1)} วินาที`, tone: "blue" },
      ]}
      graph={graph}
      table={table}
      theory={<p className="leading-relaxed text-slate-600">ตัวละลายกระจายตัวในตัวทำละลายจนเป็นเนื้อเดียวกัน แบบจำลองนี้กำหนดให้ตัวละลายทุกปริมาณอยู่ในช่วงที่ละลายได้ อุณหภูมิสูงและการคนช่วยเพิ่มอัตราการละลาย แต่การคนไม่ได้หมายความว่าจะเพิ่มปริมาณสูงสุดที่สารละลายได้เสมอไป</p>}
      steps={[
        { label: "กำหนดปริมาณ อุณหภูมิ และการคน", icon: Thermometer },
        { label: "เริ่มทดลองและดูผลึกค่อย ๆ ลดลง", icon: CirclePlay },
        { label: "เปรียบเทียบเวลาและกราฟหลายรอบ", icon: Droplets },
      ]}
      learningGoals={["แยกตัวละลาย ตัวทำละลาย และสารละลาย", "อธิบายผลของอุณหภูมิและการคนต่ออัตราการละลาย", "ใช้กราฟร้อยละการละลายเปรียบเทียบรอบทดลอง"]}
      progressLabel="รอบปัจจุบัน"
      progressValue={`${dissolvedPercent.toFixed(0)}% ละลายแล้ว`}
      progressPercent={dissolvedPercent}
      tips={["ลองใช้ปริมาณเท่ากันแล้วเปลี่ยนเฉพาะอุณหภูมิ", "รีเซ็ตก่อนเปลี่ยนตัวแปรเพื่อให้เปรียบเทียบได้ยุติธรรม"]}
      showSaveButton={true}
      onRun={toggleSimulation}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={resetCurrentTrial}
      onSave={handleSave}
    />
  );
}
