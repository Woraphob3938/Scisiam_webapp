"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ClipboardList,
  Target,
  Zap,
  Activity,
  Copy,
  Download,
  Trash2,
} from "lucide-react";
import SharedSimulationShell from "./SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface RelativityDataPoint {
  time: number;
  velocityFraction: number; // v/c
  lorentzFactor: number; // gamma
  contractedLength: number; // L (m)
  kineticEnergyJoules: number; // Ek
}

const MAX_DATA_POINTS = 500;

export default function RelativisticKinematicsSimulation() {
  const router = useRouter();
  const labId = "relativistic-kinematics";

  // Simulator configurations
  const [velocityFraction, setVelocityFraction] = useState(0.5); // v/c, beta
  const [restLength, setRestLength] = useState(50.0); // L0 (meters)
  const [restMass, setRestMass] = useState(1000.0); // m0 (kg)

  const logInterval = 10;
  const simulationSpeed = 1;

  // Running states
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<RelativityDataPoint[]>([]);
  const [lastLoggedTime, setLastLoggedTime] = useState(0);

  // Quest states
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  // References
  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const lastLoggedTimeRef = useRef(lastLoggedTime);
  const velocityFractionRef = useRef(velocityFraction);
  const restLengthRef = useRef(restLength);
  const restMassRef = useRef(restMass);
  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { lastLoggedTimeRef.current = lastLoggedTime; }, [lastLoggedTime]);
  useEffect(() => { velocityFractionRef.current = velocityFraction; }, [velocityFraction]);
  useEffect(() => { restLengthRef.current = restLength; }, [restLength]);
  useEffect(() => { restMassRef.current = restMass; }, [restMass]);
  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Speed of light constant
  const c = 3e8;

  // Derived values
  const gamma = 1 / Math.sqrt(1 - velocityFraction * velocityFraction);
  const contractedLength = restLength / gamma;
  const kineticEnergy = (gamma - 1) * restMass * c * c; // Joules

  // Main run loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        const deltaSeconds = 0.1 * simulationSpeed;
        const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
        setElapsedSeconds(nextSeconds);
        elapsedSecondsRef.current = nextSeconds;

        const currentBeta = velocityFractionRef.current;
        const currentL0 = restLengthRef.current;
        const currentM0 = restMassRef.current;
        const curGamma = 1 / Math.sqrt(1 - currentBeta * currentBeta);
        const curL = currentL0 / curGamma;
        const curEk = (curGamma - 1) * currentM0 * c * c;

        // Quest condition: Gamma must be exactly 2.0 (meaning beta = 0.866) within +/- 0.05
        if (Math.abs(curGamma - 2.0) <= 0.05) {
          const nextProgress = Math.min(5.0, questProgressRef.current + deltaSeconds);
          setQuestProgress(nextProgress);
          questProgressRef.current = nextProgress;
        }

        // Auto logging
        if (nextSeconds - lastLoggedTimeRef.current >= logInterval) {
          setDataPoints((prev) =>
            [
              ...prev,
              {
                time: nextSeconds,
                velocityFraction: currentBeta,
                lorentzFactor: curGamma,
                contractedLength: curL,
                kineticEnergyJoules: curEk,
              },
            ].slice(-MAX_DATA_POINTS),
          );
          setLastLoggedTime(nextSeconds);
          lastLoggedTimeRef.current = nextSeconds;
        }
      }, 100);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  // Quest trigger alert
  useEffect(() => {
    if (questProgress >= 5.0 && !questSuccess) {
      const timeoutId = setTimeout(() => {
        setQuestSuccess(true);
        alert("🎉 ยินดีด้วย! คุณสามารถจูนยานอวกาศให้วิ่งด้วย Lorentz factor (γ) มีค่าเป็น 2.0 (ความเร็ว 86.6% ของแสง) ได้นานครบ 5 วินาทีสำเร็จ!");
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [questProgress, questSuccess]);

  const handleStartStop = () => {
    setIsRunning(prev => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setVelocityFraction(0.5);
    setRestLength(50.0);
    setRestMass(1000.0);
    setElapsedSeconds(0);
    setQuestProgress(0);
    setQuestSuccess(false);
    setDataPoints([]);
    setLastLoggedTime(0);
  };

  const handleAddPoint = () => {
    setDataPoints((prev) =>
      [
        ...prev,
        {
          time: elapsedSeconds,
          velocityFraction,
          lorentzFactor: gamma,
          contractedLength,
          kineticEnergyJoules: kineticEnergy,
        },
      ].slice(-MAX_DATA_POINTS),
    );
  };

  const handleClearPoint = (index: number) => {
    setDataPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopyData = () => {
    if (dataPoints.length === 0) return;
    const header = "Time(s)\tv/c\tLorentz(gamma)\tL(m)\tEk(J)\n";
    const rows = dataPoints
      .map(
        (p) =>
          `${p.time.toFixed(1)}\t${p.velocityFraction.toFixed(3)}\t${p.lorentzFactor.toFixed(3)}\t${p.contractedLength.toFixed(1)}\t${p.kineticEnergyJoules.toExponential(3)}`,
      )
      .join("\n");
    navigator.clipboard.writeText(header + rows);
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) return;
    const header = "Time(s),v/c,Lorentz(gamma),L(m),Ek(J)\n";
    const rows = dataPoints
      .map(
        (p) =>
          `${p.time.toFixed(1)},${p.velocityFraction.toFixed(3)},${p.lorentzFactor.toFixed(3)},${p.contractedLength.toFixed(1)},${p.kineticEnergyJoules.toExponential(3)}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `relativity_kinematics_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    const experimentData = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      velocityFraction,
      restLength,
      restMass,
      dataPoints,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_relativistic_experiment",
      localPayload: experimentData,
      labId,
      title: "Relativistic Kinematics",
      variables: {
        velocityFraction,
        restLength,
        restMass,
        logInterval,
        simulationSpeed,
      },
      liveValues: {
        gamma,
        contractedLength,
        kineticEnergy,
        elapsedSeconds,
        questProgress,
        questSuccess,
      },
      graphPoints: dataPoints.map(p => ({ x: p.velocityFraction, y: p.lorentzFactor })),
      tableRows: dataPoints,
      summary: {
        finalGamma: gamma,
        finalLength: contractedLength,
        questSuccess,
      },
    });

    alert("บันทึกรายงานผลการทดลองจลนศาสตร์สัมพัทธภาพสำเร็จ! 🎉");
    router.push(`/labs/${labId}`);
  };

  // Subcomponents defined locally
  const simControls = (
    <div className="space-y-5">
      {/* Slider: Velocity Fraction v/c */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-650">ความเร็วสัมพัทธ์ (v/c)</span>
          <span className="text-pink-650 font-mono">{(velocityFraction * 100).toFixed(1)}% c</span>
        </div>
        <input
          type="range"
          min="0.00"
          max="0.99"
          step="0.01"
          value={velocityFraction}
          onChange={(e) => setVelocityFraction(parseFloat(e.target.value))}
          className="w-full accent-pink-650"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>0.0c (หยุดนิ่ง)</span>
          <span>0.99c (ความเร็วแสง)</span>
        </div>
      </div>

      {/* Slider: Rest Length L0 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-600">ความยาวของยานเมื่อหยุดนิ่ง (L₀)</span>
          <span className="text-pink-650 font-mono">{restLength.toFixed(1)} m</span>
        </div>
        <input
          type="range"
          min="10.0"
          max="100.0"
          step="1.0"
          value={restLength}
          onChange={(e) => setRestLength(parseFloat(e.target.value))}
          className="w-full accent-pink-650"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>10 m</span>
          <span>100 m</span>
        </div>
      </div>

      {/* Rest Mass Preset */}
      <div className="space-y-2">
        <label className="block text-xs sm:text-sm font-bold text-slate-600">มวลเมื่อหยุดนิ่ง (m₀)</label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: "ยานโพรบ (1,000 kg)", val: 1000 },
            { label: "ยานเล็ก (50,000 kg)", val: 50000 },
          ].map((m) => (
            <button
              key={m.label}
              onClick={() => setRestMass(m.val)}
              className={`rounded-lg py-1.5 text-[10px] sm:text-xs font-black transition-all ${
                restMass === m.val
                  ? "bg-pink-50 text-pink-700 border border-pink-200"
                  : "bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={handleStartStop}
          className={`flex-grow flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition-all active:scale-95 ${
            isRunning
              ? "bg-slate-700 shadow-lg shadow-slate-500/10"
              : "bg-pink-650 shadow-lg shadow-pink-500/20 hover:bg-pink-700"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" />
              <span>หยุดตรวจจับ</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>เริ่มตรวจจับ</span>
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
          title="รีเซ็ต"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={handleAddPoint}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
          title="บันทึกจุด"
        >
          <ClipboardList className="h-4 w-4 text-pink-500" />
        </button>
      </div>
    </div>
  );

  const dataTable = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ประวัติตรวจวัดค่าฟิสิกส์สัมพัทธภาพ</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyData}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-slate-500 hover:text-slate-800"
            title="คัดลอก"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportCSV}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-slate-500 hover:text-slate-800"
            title="ส่งออก CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto rounded-xl border border-slate-100 min-h-[140px]">
        {dataPoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 py-12">
            <ClipboardList className="w-8 h-8 text-slate-300" />
            <p className="text-[10px] font-bold">ยังไม่ได้บันทึกข้อมูลผลการทดลอง</p>
          </div>
        ) : (
          <table className="w-full text-[10px] sm:text-xs text-left text-slate-600 font-medium">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-extrabold sticky top-0">
              <tr>
                <th className="px-3 py-2">เวลา (s)</th>
                <th className="px-3 py-2">v/c</th>
                <th className="px-3 py-2">Lorentz (γ)</th>
                <th className="px-3 py-2">L (m)</th>
                <th className="px-3 py-2">E_k (J)</th>
                <th className="px-2 py-2 text-center">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataPoints.map((point, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono">{point.time.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono">{point.velocityFraction.toFixed(3)}</td>
                  <td className="px-3 py-2 font-mono">{point.lorentzFactor.toFixed(3)}</td>
                  <td className="px-3 py-2 font-mono">{point.contractedLength.toFixed(1)} m</td>
                  <td className="px-3 py-2 font-mono">{point.kineticEnergyJoules.toExponential(3)} J</td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => handleClearPoint(index)}
                      className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="pink"
      labId={labId}
      category="Physics"
      title="Relativistic Kinematics (จลนศาสตร์สัมพัทธภาพ)"
      subtitle="จำลองสภาวะแวดล้อมระบบพิกัดอ้างอิงเฉื่อยภายใต้ความเร็วใกล้แสง สังเกตผลจากการยืดออกของเวลา การหดตัวของความยาว และการพุ่งทยานของระดับพลังงานสะสม"
      statusLabel={`Lorentz Factor γ = ${gamma.toFixed(3)}`}
      icon={Zap}
      sceneTitle="ภาพเปรียบเทียบกรอบอ้างอิงสัมพัทธภาพ (Light Clock & Contractions)"
      scene={
        <RelativityViewport
          velocityFraction={velocityFraction}
          gamma={gamma}
          contractedLength={contractedLength}
        />
      }
      controlsTitle="แผงพารามิเตอร์จลนศาสตร์สัมพัทธภาพ"
      controls={simControls}
      metrics={[
        { label: "Lorentz Factor (γ)", value: gamma.toFixed(3), tone: "pink" },
        { label: "ความยาวสัญญาจ้าง L", value: `${contractedLength.toFixed(1)} m`, tone: "violet" },
        { label: "พลังงานจลน์จลน์ E_k", value: `${kineticEnergy.toExponential(3)} J`, tone: "orange" },
        { label: "ร้อยละความเร็วแสง", value: `${(velocityFraction * 100).toFixed(1)}% c`, tone: "blue" },
      ]}
      graph={
        <RelativityGraph
          velocityFraction={velocityFraction}
        />
      }
      table={dataTable}
      theory={<RelativityTheory />}
      steps={[
        { label: "ปรับตั้งความยาวหยุดนิ่ง L₀", icon: Sliders },
        { label: "เพิ่มความเร็วสัมพัทธ์ v/c", icon: Sliders },
        { label: "สังเกตความหดสั้นของยานและเวลา", icon: Target },
        { label: "ตรวจสอบ Lorentz factor กราฟิก", icon: Activity },
      ]}
      learningGoals={[
        "อธิบายการหดตัวของความยาว (Length Contraction) ในกรอบอ้างอิงเฉื่อย",
        "วิเคราะห์ทฤษฎีการยืดตัวของเวลา (Time Dilation) ผ่านพฤติกรรมแสงสะท้อน",
        "คำนวณพลังงานเชิงสัมพัทธภาพเมื่อความเร็วเข้าใกล้ขีดจำกัดความเร็วแสง",
      ]}
      progressLabel="ระยะเวลาที่รักษาเป้าหมาย γ ≈ 2.0"
      progressValue={`${questProgress.toFixed(1)} / 5.0 วินาที`}
      progressPercent={(questProgress / 5.0) * 100}
      tips={[
        "Lorentz factor (γ) จะเพิ่มขึ้นอย่างทวีคูณและรวดเร็วมากเมื่อความเร็วสัมพัทธ์ (v/c) สูงเกิน 80% เป็นต้นไป",
        "ที่ Lorentz factor = 2.0 (ความเร็ว 86.6% c) ความยาววัตถุในแนวเคลื่อนที่จะหดสั้นเหลือเพียงครึ่งเดียวพอดี",
        "ภารกิจ: บินด้วยความเร็วที่ทำให้ Lorentz factor (γ) มีค่าเท่ากับ 2.0 (± 0.05) ต่อเนื่องกันเป็นเวลา 5 วินาที",
      ]}
      onSave={handleSaveResults}
    />
  );
}

// ------------------- VIEWPORT COMPONENT -------------------
interface ViewportProps {
  velocityFraction: number;
  gamma: number;
  contractedLength: number;
}

function RelativityViewport({
  velocityFraction,
  gamma,
  contractedLength,
}: ViewportProps) {
  // Light clock photon position animation
  const [photonY, setPhotonY] = useState(0);
  const [photonDir, setPhotonDir] = useState(1); // 1 = down, -1 = up

  useEffect(() => {
    let animId: number;
    const tick = () => {
      setPhotonY((y) => {
        let nextY = y + photonDir * 4 * (1 / gamma); // motion is dilated/slower based on gamma
        if (nextY >= 60) {
          nextY = 60;
          setPhotonDir(-1);
        } else if (nextY <= 0) {
          nextY = 0;
          setPhotonDir(1);
        }
        return nextY;
      });
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gamma, photonDir]);

  // Scaled spaceship width
  const baseWidth = (contractedLength / 100) * 160;

  return (
    <div className="relative w-full h-full min-h-[340px] bg-slate-950 rounded-2xl flex flex-col justify-between overflow-hidden border border-slate-800 p-4">
      {/* FRAME A: Observer Frame (Earth View) */}
      <div className="flex-1 border-b border-slate-800 pb-2 relative flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Earth Reference Frame (Observer View)</span>
          <span className="text-[10px] text-pink-500 font-bold">Spacecraft moving at v = {(velocityFraction * 100).toFixed(0)}% c</span>
        </div>
        <div className="flex-grow flex items-center justify-center relative">
          {/* Moving spaceship */}
          <svg width="240" height="80" viewBox="0 0 240 80" className="overflow-visible">
            {/* Length Contracted spaceship */}
            <g transform={`translate(${120 - baseWidth / 2}, 10)`}>
              {/* Spaceship hull */}
              <rect x="0" y="10" width={baseWidth} height="40" rx="8" fill="url(#shipGrad)" stroke="#f472b6" strokeWidth="1.5" />
              {/* Cockpit canopy */}
              <path d={`M ${baseWidth - 20} 20 Q ${baseWidth} 20, ${baseWidth - 5} 35 L ${baseWidth - 20} 35 Z`} fill="#93c5fd" opacity="0.8" />

              {/* Moving light clock inside ship (Zigzag diagonal path) */}
              <line x1="20" y1="15" x2={baseWidth - 20} y2="15" stroke="#334155" strokeWidth="1" />
              <line x1="20" y1="45" x2={baseWidth - 20} y2="45" stroke="#334155" strokeWidth="1" />
              {/* Photon marker */}
              <circle cx={20 + (photonY / 60) * (baseWidth - 40)} cy={15 + photonY} r="3" fill="#facc15" className="shadow shadow-yellow-500" />
            </g>
          </svg>
        </div>
      </div>

      {/* FRAME B: Rest Frame (Spaceship View) */}
      <div className="flex-1 pt-2 relative flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Spaceship Reference Frame (Onboard View)</span>
          <span className="text-[10px] text-emerald-500 font-bold">Spacecraft is at rest</span>
        </div>
        <div className="flex-grow flex items-center justify-center relative">
          {/* Stationary spaceship, moving stars background */}
          <svg width="240" height="80" viewBox="0 0 240 80" className="overflow-visible">
            {/* Standard full-width spaceship */}
            <g transform={`translate(${120 - 80}, 10)`}>
              {/* Full rest size spaceship */}
              <rect x="0" y="10" width="80" height="40" rx="8" fill="url(#shipGrad)" stroke="#f472b6" strokeWidth="1.5" />
              <path d="M 60 20 Q 80 20, 75 35 L 60 35 Z" fill="#93c5fd" opacity="0.8" />

              {/* Normal vertical light clock */}
              <line x1="40" y1="15" x2="40" y2="45" stroke="#334155" strokeWidth="1.5" />
              {/* Photon marker (vertical only) */}
              <circle cx="40" cy={15 + (photonY * gamma <= 60 ? photonY * gamma : 60)} r="3" fill="#facc15" />
            </g>
          </svg>
        </div>
      </div>

      {/* Defs */}
      <svg className="hidden">
        <defs>
          <linearGradient id="shipGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ------------------- GRAPH COMPONENT -------------------
interface GraphProps {
  velocityFraction: number;
}

function RelativityGraph({ velocityFraction }: GraphProps) {
  // Generate curve points for gamma vs beta
  const points: Array<{ x: number; y: number }> = [];

  for (let beta = 0.0; beta <= 0.98; beta += 0.01) {
    const val = 1 / Math.sqrt(1 - beta * beta);
    points.push({ x: beta, y: val });
  }

  // Scale: x in [0.0, 1.0] -> [25, 280], y in [1.0, 5.0] -> [140, 10]
  const scaleX = (x: number) => 25 + x * 255;
  const scaleY = (y: number) => 140 - ((y - 1.0) / 4.0) * 130;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.x)} ${scaleY(p.y)}`).join(" ");

  const currentGamma = 1 / Math.sqrt(1 - velocityFraction * velocityFraction);

  return (
    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between select-none h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">กราฟวิเคราะห์ Lorentz Factor (γ)</span>
        <span className="text-[10px] font-black text-pink-500 font-mono">γ vs v/c</span>
      </div>
      <div className="flex-grow">
        <svg className="w-full h-auto" viewBox="0 0 300 160">
          {/* Grid lines */}
          <line x1="25" y1="140" x2="280" y2="140" stroke="#334155" strokeWidth="1" />
          <line x1="25" y1="10" x2="25" y2="140" stroke="#334155" strokeWidth="1" />

          {/* Grid labels */}
          <text x="25" y="152" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">0.0c</text>
          <text x="152" y="152" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">0.5c</text>
          <text x="280" y="152" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">1.0c</text>

          <text x="20" y="143" fill="#64748b" fontSize="8" textAnchor="end" fontWeight="bold">1.0</text>
          <text x="20" y="78" fill="#64748b" fontSize="8" textAnchor="end" fontWeight="bold">3.0</text>
          <text x="20" y="13" fill="#64748b" fontSize="8" textAnchor="end" fontWeight="bold">5.0</text>

          {/* Curve */}
          <path d={pathD} fill="none" stroke="#f472b6" strokeWidth="2.5" />

          {/* Target gamma line */}
          <line x1="25" y1={scaleY(2.0)} x2="280" y2={scaleY(2.0)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
          <text x="230" y={scaleY(2.0) - 4} fill="#f59e0b" fontSize="7" fontWeight="bold">γ = 2.0 (Quest)</text>

          {/* Current speed marker */}
          <circle cx={scaleX(velocityFraction)} cy={scaleY(currentGamma)} r="4" fill="#ef4444" />
        </svg>
      </div>
    </div>
  );
}

// ------------------- THEORY COMPONENT -------------------
function RelativityTheory() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-3 leading-relaxed">
      <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
        <Zap className="w-4.5 h-4.5 text-pink-500" />
        ทฤษฎีจลนศาสตร์สัมพัทธภาพพิเศษ
      </h3>
      <p>
        <strong>ทฤษฎีสัมพัทธภาพพิเศษ (Special Relativity)</strong> พัฒนาโดย อัลเบิร์ต ไอน์สไตน์ อธิบายว่า ความเร็วแสงในสุญญากาศมีค่าคงตัวเสมอสำหรับผู้สังเกตทุกคน และกฎทางฟิสิกส์เหมือนกันในทุกระบบอ้างอิงเฉื่อย
      </p>
      <p>
        เมื่อวัตถุเคลื่อนที่ด้วยความเร็วใกล้แสง ผลลัพธ์เชิงสัมพัทธภาพจะเกิดขึ้นจริง:
        <br />
        1. <strong>การยืดออกของเวลา (Time Dilation)</strong>: นาฬิกาที่เคลื่อนที่จะเดินช้าลงเมื่อเทียบกับนาฬิกาหยุดนิ่ง
        <br />
        2. <strong>การหดตัวของความยาว (Length Contraction)</strong>: ความยาววัตถุในทิศทางการเคลื่อนที่จะหดสั้นลงเมื่อเทียบจากผู้สังเกตภายนอก
      </p>
      <p className="font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[10px] text-pink-400">
        {`γ = 1 / sqrt(1 - (v/c)^2)`}
        <br />
        {`L = L0 / γ   [Length Contracted]`}
        <br />
        {`t = γ * t0   [Time Dilated]`}
      </p>
    </div>
  );
}
