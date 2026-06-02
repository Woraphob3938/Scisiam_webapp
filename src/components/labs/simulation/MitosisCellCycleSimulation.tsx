"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Circle,
  ClipboardList,
  Microscope,
  Pause,
  Play,
  RotateCcw,
  Timer,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface MitosisStage {
  name: string;
  thai: string;
  detail: string;
  color: string;
}

interface MitosisPoint {
  cycle: number;
  stage: string;
  progress: number;
  cellCount: number;
  checkpoint: number;
}

const stages: MitosisStage[] = [
  { name: "Interphase", thai: "อินเตอร์เฟส", detail: "เซลล์เตรียมพร้อมและจำลอง DNA", color: "#38bdf8" },
  { name: "Prophase", thai: "โพรเฟส", detail: "โครโมโซมขดแน่นและเยื่อหุ้มนิวเคลียสเริ่มสลาย", color: "#8b5cf6" },
  { name: "Metaphase", thai: "เมทาเฟส", detail: "โครโมโซมเรียงตัวกลางเซลล์", color: "#f59e0b" },
  { name: "Anaphase", thai: "แอนาเฟส", detail: "โครมาทิดแยกไปยังขั้วตรงข้าม", color: "#ef4444" },
  { name: "Telophase", thai: "เทโลเฟส", detail: "สร้างนิวเคลียสใหม่และเริ่มแบ่งไซโทพลาซึม", color: "#10b981" },
  { name: "Cytokinesis", thai: "ไซโทไคเนซิส", detail: "เซลล์แบ่งเป็นเซลล์ลูกสองเซลล์", color: "#14b8a6" },
];

function MitosisScene({
  stageIndex,
  stageProgress,
  cellCount,
  spindleHealth,
  dnaIntegrity,
  isRunning,
}: {
  stageIndex: number;
  stageProgress: number;
  cellCount: number;
  spindleHealth: number;
  dnaIntegrity: number;
  isRunning: boolean;
}) {
  const stage = stages[stageIndex];
  const splitDistance = stageIndex >= 3 ? 30 + stageProgress * 0.28 : 0;
  const chromosomeOpacity = stageIndex === 0 ? 0.42 : 0.95;
  const membraneOpacity = stageIndex >= 1 && stageIndex <= 3 ? 0.25 : 0.72;

  return (
    <div className="relative flex h-full min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-cyan-100 bg-[linear-gradient(135deg,#ecfeff_0%,#f8fafc_52%,#f5f3ff_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-30" />
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 text-left shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-cyan-600">cell cycle</p>
        <p className="mt-0.5 text-xs font-bold text-slate-600">{stage.thai}</p>
      </div>

      <svg className="relative z-10 h-full max-h-[365px] w-full max-w-[580px]" viewBox="0 0 580 365" fill="none" aria-hidden="true">
        <ellipse cx="292" cy="312" rx="190" ry="24" fill="#cffafe" opacity="0.5" />

        <g transform="translate(130, 54)">
          <ellipse cx="160" cy="140" rx={stageIndex === 5 ? 92 : 138} ry="104" fill="#ffffff" opacity="0.82" stroke="#67e8f9" strokeWidth="5" />
          {stageIndex === 5 && <ellipse cx="230" cy="140" rx="92" ry="104" fill="#ffffff" opacity="0.82" stroke="#67e8f9" strokeWidth="5" />}
          <ellipse cx={stageIndex === 5 ? 122 : 160} cy="140" rx="58" ry="48" fill="#f5f3ff" opacity={membraneOpacity} stroke="#a78bfa" strokeWidth="4" />
          {stageIndex === 5 && <ellipse cx="230" cy="140" rx="48" ry="42" fill="#f5f3ff" opacity="0.72" stroke="#a78bfa" strokeWidth="4" />}

          {/* Spindle fibers */}
          {stageIndex >= 2 && stageIndex <= 4 && (
            <g opacity={spindleHealth / 100}>
              <path d="M40 140C85 90 114 88 160 140C206 192 235 190 280 140" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 8" />
              <path d="M40 140C91 165 123 166 160 140C197 114 229 115 280 140" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 8" />
              <circle cx="40" cy="140" r="8" fill="#0891b2" />
              <circle cx="280" cy="140" r="8" fill="#0891b2" />
            </g>
          )}

          {/* Chromosomes */}
          <g className={isRunning ? "animate-pulse" : ""} opacity={chromosomeOpacity}>
            {[-24, 0, 24].map((offset, index) => (
              <g key={offset} transform={`translate(${160 + (index - 1) * splitDistance}, ${118 + offset}) rotate(${stageIndex === 2 ? 0 : index % 2 === 0 ? -18 : 18})`}>
                <path d="M-15 -18C-4 -5 4 5 15 18" stroke={stage.color} strokeWidth="8" strokeLinecap="round" />
                <path d="M15 -18C4 -5 -4 5 -15 18" stroke={stage.color} strokeWidth="8" strokeLinecap="round" />
              </g>
            ))}
          </g>

          {stageIndex === 5 && (
            <path d="M176 49C158 93 158 183 176 231" stroke="#14b8a6" strokeWidth="5" strokeLinecap="round" strokeDasharray="9 9" />
          )}
        </g>

        <g transform="translate(54, 220)">
          <rect x="0" y="0" width="126" height="62" rx="22" fill="#ffffff" stroke="#bae6fd" strokeWidth="3" />
          <text x="63" y="23" fill="#64748b" fontSize="11" fontWeight="900" textAnchor="middle">Cells</text>
          <text x="63" y="47" fill="#0891b2" fontSize="22" fontWeight="900" textAnchor="middle">{cellCount}</text>
        </g>

        <g transform="translate(398, 218)">
          <rect x="0" y="0" width="130" height="68" rx="22" fill="#ffffff" stroke="#ddd6fe" strokeWidth="3" />
          <text x="65" y="23" fill="#64748b" fontSize="11" fontWeight="900" textAnchor="middle">Checkpoint</text>
          <text x="65" y="49" fill="#7c3aed" fontSize="20" fontWeight="900" textAnchor="middle">{Math.round((spindleHealth + dnaIntegrity) / 2)}%</text>
        </g>
      </svg>
    </div>
  );
}

function CycleGraph({ points, stageIndex, stageProgress }: { points: MitosisPoint[]; stageIndex: number; stageProgress: number }) {
  const totalProgress = ((stageIndex + stageProgress / 100) / stages.length) * 100;

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <BarChart3 className="h-4.5 w-4.5 text-cyan-600" />
          แผนภาพวัฏจักรเซลล์
        </h3>
        <span className="text-[10px] font-bold text-cyan-600">{points.length} logs</span>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3 rounded-xl bg-slate-50/70 p-4">
        {stages.map((stage, index) => {
          const active = index === stageIndex;
          const width = index < stageIndex ? 100 : active ? stageProgress : 0;
          return (
            <div key={stage.name}>
              <div className="mb-1 flex justify-between text-[11px] font-black text-slate-600">
                <span>{stage.thai}</span>
                <span>{active ? `${stageProgress.toFixed(0)}%` : index < stageIndex ? "100%" : "0%"}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${width}%`, backgroundColor: stage.color }} />
              </div>
            </div>
          );
        })}
        <div className="mt-2 text-center text-xs font-black text-cyan-700">รอบปัจจุบัน {totalProgress.toFixed(1)}%</div>
      </div>
    </section>
  );
}

function StageTable({ points }: { points: MitosisPoint[] }) {
  const rows = points.slice(-7);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-cyan-600" />
          บันทึกระยะเซลล์
        </h3>
        <span className="text-[10px] font-bold text-slate-400">{points.length} จุด</span>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-cyan-50/70 text-[11px] font-black text-cyan-800">
            <tr>
              <th className="px-3 py-2">Cycle</th>
              <th className="px-3 py-2">Stage</th>
              <th className="px-3 py-2">Check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {rows.map((point, index) => (
              <tr key={`${point.cycle}-${point.stage}-${index}`}>
                <td className="px-3 py-2 font-mono">{point.cycle}</td>
                <td className="px-3 py-2 text-cyan-700">{point.stage}</td>
                <td className="px-3 py-2 font-mono text-violet-700">{point.checkpoint}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TheoryPanel() {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Microscope className="h-4.5 w-4.5 text-cyan-600" />
        ทฤษฎีและลำดับระยะ
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-4 text-center text-lg font-black text-slate-800">
          IPMAT + Cytokinesis
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500">
          ไมโทซิสเป็นการแบ่งนิวเคลียสของเซลล์ร่างกายเพื่อให้เซลล์ลูกมีชุดโครโมโซมเหมือนเซลล์แม่ โดย checkpoint ช่วยลดข้อผิดพลาดในการแยกโครโมโซม
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">DNA: <b className="text-violet-700">replicated</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">Result: <b className="text-cyan-700">2 cells</b></span>
        </div>
      </div>
    </section>
  );
}

export default function MitosisCellCycleSimulation() {
  const [stageIndex, setStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(1);
  const [cellCount, setCellCount] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [spindleHealth, setSpindleHealth] = useState(92);
  const [dnaIntegrity, setDnaIntegrity] = useState(96);
  const [isRunning, setIsRunning] = useState(false);
  const [points, setPoints] = useState<MitosisPoint[]>([]);

  const isRunningRef = useRef(isRunning);
  const stageIndexRef = useRef(stageIndex);
  const stageProgressRef = useRef(stageProgress);
  const cycleCountRef = useRef(cycleCount);
  const cellCountRef = useRef(cellCount);
  const speedRef = useRef(speed);
  const spindleHealthRef = useRef(spindleHealth);
  const dnaIntegrityRef = useRef(dnaIntegrity);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { stageIndexRef.current = stageIndex; }, [stageIndex]);
  useEffect(() => { stageProgressRef.current = stageProgress; }, [stageProgress]);
  useEffect(() => { cycleCountRef.current = cycleCount; }, [cycleCount]);
  useEffect(() => { cellCountRef.current = cellCount; }, [cellCount]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { spindleHealthRef.current = spindleHealth; }, [spindleHealth]);
  useEffect(() => { dnaIntegrityRef.current = dnaIntegrity; }, [dnaIntegrity]);

  const checkpoint = Math.round((spindleHealth + dnaIntegrity) / 2);
  const currentStage = stages[stageIndex];
  const totalProgress = ((stageIndex + stageProgress / 100) / stages.length) * 100;

  const addLogPoint = (nextStageIndex: number, nextProgress: number) => {
    const point = {
      cycle: cycleCountRef.current,
      stage: stages[nextStageIndex].thai,
      progress: nextProgress,
      cellCount: cellCountRef.current,
      checkpoint: Math.round((spindleHealthRef.current + dnaIntegrityRef.current) / 2),
    };
    setPoints((previous) => [...previous, point]);
  };

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      const increment = 3.5 * speedRef.current;
      const nextProgress = stageProgressRef.current + increment;

      if (nextProgress < 100) {
        stageProgressRef.current = nextProgress;
        setStageProgress(nextProgress);
        return;
      }

      addLogPoint(stageIndexRef.current, 100);
      const nextStage = stageIndexRef.current + 1;
      if (nextStage >= stages.length) {
        const nextCycle = cycleCountRef.current + 1;
        const nextCells = cellCountRef.current * 2;
        cycleCountRef.current = nextCycle;
        cellCountRef.current = nextCells;
        stageIndexRef.current = 0;
        stageProgressRef.current = 0;
        setCycleCount(nextCycle);
        setCellCount(nextCells);
        setStageIndex(0);
        setStageProgress(0);
        setIsRunning(false);
        isRunningRef.current = false;
      } else {
        stageIndexRef.current = nextStage;
        stageProgressRef.current = 0;
        setStageIndex(nextStage);
        setStageProgress(0);
      }
    }, 150);

    return () => clearInterval(timer);
  }, [isRunning]);

  const handleStartStop = () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    isRunningRef.current = nextRunning;
    if (nextRunning && points.length === 0) addLogPoint(stageIndex, stageProgress);
  };

  const handleStepStage = () => {
    addLogPoint(stageIndex, 100);
    const nextStage = stageIndex + 1;
    if (nextStage >= stages.length) {
      setCycleCount((current) => current + 1);
      setCellCount((current) => current * 2);
      setStageIndex(0);
      setStageProgress(0);
      stageIndexRef.current = 0;
      stageProgressRef.current = 0;
    } else {
      setStageIndex(nextStage);
      setStageProgress(0);
      stageIndexRef.current = nextStage;
      stageProgressRef.current = 0;
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setStageIndex(0);
    stageIndexRef.current = 0;
    setStageProgress(0);
    stageProgressRef.current = 0;
    setCycleCount(1);
    cycleCountRef.current = 1;
    setCellCount(1);
    cellCountRef.current = 1;
    setPoints([]);
  };

  const handleSave = async () => {
    if (points.length === 0) {
      alert("ยังไม่มีข้อมูล Mitosis สำหรับบันทึก กรุณาเริ่มจำลองหรือข้ามระยะก่อน");
      return;
    }

    const experimentData = {
      labId: "mitosis-division",
      timestamp: new Date().toLocaleString("th-TH"),
      spindleHealth,
      dnaIntegrity,
      cycleCount,
      cellCount,
      dataPoints: points,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_mitosis_experiment",
      localPayload: experimentData,
      labId: "mitosis-division",
      title: "Mitosis & Cell Cycle",
      variables: { spindleHealth, dnaIntegrity, speed },
      liveValues: { cycleCount, cellCount, currentStage: currentStage.name, stageProgress, checkpoint },
      graphPoints: points,
      tableRows: points,
      summary: {
        totalProgress,
        cycleCount,
        cellCount,
        dataPointCount: points.length,
      },
      score: checkpoint,
    });
    alert("บันทึกผลการทดลอง Mitosis & Cell Cycle สำเร็จ");
  };

  const controls = (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-slate-600">ความเร็วจำลอง</span>
        <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
          <option value={0.7}>ช้า</option>
          <option value={1}>ปานกลาง</option>
          <option value={1.5}>เร็ว</option>
        </select>
      </label>

      {[
        { label: "ความพร้อม spindle", value: spindleHealth, set: setSpindleHealth, color: "accent-cyan-500" },
        { label: "ความสมบูรณ์ DNA", value: dnaIntegrity, set: setDnaIntegrity, color: "accent-violet-500" },
      ].map((control) => (
        <label key={control.label} className="block">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>{control.label}</span>
            <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">{control.value}%</span>
          </div>
          <input type="range" min={50} max={100} step={1} value={control.value} disabled={isRunning} onChange={(event) => control.set(Number(event.target.value))} className={`h-1.5 w-full rounded-full bg-slate-100 ${control.color} disabled:opacity-45`} />
        </label>
      ))}

      <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 px-3 py-2">
        <p className="text-[11px] font-bold text-cyan-700">ระยะปัจจุบัน</p>
        <p className="mt-1 text-sm font-black text-slate-800">{currentStage.thai}</p>
        <p className="mt-0.5 text-[11px] font-semibold leading-relaxed text-slate-500">{currentStage.detail}</p>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-1">
        <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${isRunning ? "bg-slate-700" : "bg-cyan-600 hover:bg-cyan-700"}`}>
          {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
          {isRunning ? "หยุดชั่วคราว" : "เริ่มวัฏจักร"}
        </button>
        <button onClick={handleStepStage} className="inline-flex items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-xs font-black text-cyan-700 hover:bg-cyan-100">ข้ามระยะ</button>
        <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="รีเซ็ต">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="cyan"
      labId="mitosis-division"
      category="Biology"
      title="Mitosis & Cell Cycle"
      subtitle="จำลองวัฏจักรเซลล์และการแบ่งนิวเคลียสแบบไมโทซิส ตั้งแต่ Interphase จนถึง Cytokinesis พร้อมตรวจ checkpoint สำคัญ"
      statusLabel={isRunning ? "กำลังแบ่งเซลล์" : "พร้อมทดลอง"}
      icon={Microscope}
      sceneTitle="กล้องจุลทรรศน์เซลล์จำลอง"
      scene={<MitosisScene stageIndex={stageIndex} stageProgress={stageProgress} cellCount={cellCount} spindleHealth={spindleHealth} dnaIntegrity={dnaIntegrity} isRunning={isRunning} />}
      controlsTitle="แผงควบคุมวัฏจักรเซลล์"
      controls={controls}
      metrics={[
        { label: "Stage", value: currentStage.name, tone: "cyan" },
        { label: "Progress", value: `${stageProgress.toFixed(0)}%`, tone: "blue" },
        { label: "Cells", value: String(cellCount), tone: "emerald" },
        { label: "Check", value: `${checkpoint}%`, tone: "violet" },
      ]}
      graph={<CycleGraph points={points} stageIndex={stageIndex} stageProgress={stageProgress} />}
      table={<StageTable points={points} />}
      theory={<TheoryPanel />}
      steps={[
        { label: "เตรียม DNA", icon: Circle },
        { label: "ขดโครโมโซม", icon: Activity },
        { label: "เรียงกลางเซลล์", icon: BarChart3 },
        { label: "แยกโครมาทิด", icon: Timer },
        { label: "ได้เซลล์ลูก", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "จำแนกระยะสำคัญของไมโทซิสได้",
        "เข้าใจการเรียงและแยกโครโมโซม",
        "อธิบายบทบาทของ checkpoint ใน cell cycle",
        "เชื่อมโยงไมโทซิสกับการเพิ่มจำนวนเซลล์ร่างกาย",
      ]}
      progressLabel="ความคืบหน้ารอบปัจจุบัน"
      progressValue={`${totalProgress.toFixed(1)}%`}
      progressPercent={totalProgress}
      tips={[
        "ตรวจความพร้อม spindle ก่อนเข้าสู่ metaphase",
        "DNA integrity ต่ำอาจสะท้อนความเสี่ยงต่อการแบ่งผิดพลาด",
        "สังเกตตำแหน่งโครโมโซมใน metaphase และ anaphase ให้ชัด",
        "เมื่อ cytokinesis สำเร็จ จำนวนเซลล์จะเพิ่มเป็นสองเท่า",
      ]}
      onSave={handleSave}
    />
  );
}
