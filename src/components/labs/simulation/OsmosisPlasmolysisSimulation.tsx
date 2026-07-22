"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Compass,
  Droplet,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface DataPoint {
  time: number;
  concentration: number;
  vacuoleVolume: number;
  state: string;
}

export default function OsmosisPlasmolysisSimulation() {
  const [concentration, setConcentration] = useState(2.0); // % NaCl
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentVolume, setCurrentVolume] = useState(100); // % of normal
  const [history, setHistory] = useState<DataPoint[]>([]);

  const isRunningRef = useRef(isRunning);
  const elapsedTimeRef = useRef(elapsedTime);
  const concentrationRef = useRef(concentration);
  const currentVolumeRef = useRef(currentVolume);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedTimeRef.current = elapsedTime; }, [elapsedTime]);
  useEffect(() => { concentrationRef.current = concentration; }, [concentration]);
  useEffect(() => { currentVolumeRef.current = currentVolume; }, [currentVolume]);

  // Target volume based on concentration:
  // 0% -> 125% (turgid)
  // 0.9% -> 100% (isotonic/normal)
  // 2% -> 80%
  // 5% -> 50% (plasmolysis starts)
  // 10% -> 35% (extreme plasmolysis)
  const targetVolume = useMemo(() => {
    const conc = concentration;
    if (conc <= 0.9) {
      // Hypotonic: interpolate 100% to 125%
      return 100 + ((0.9 - conc) / 0.9) * 25;
    } else {
      // Hypertonic: interpolate 100% to 35%
      return 100 - ((conc - 0.9) / (10 - 0.9)) * 65;
    }
  }, [concentration]);

  // Physics animation loop using LERP
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isRunningRef.current) return;

      const newTime = elapsedTimeRef.current + 1;
      setElapsedTime(newTime);

      // Smoothly LERP current volume towards target volume
      const diff = targetVolume - currentVolumeRef.current;
      const nextVolume = currentVolumeRef.current + diff * 0.15;
      setCurrentVolume(nextVolume);

      // Log points every 2 seconds
      if (newTime % 2 === 0) {
        const stateText =
          nextVolume > 110
            ? "เซลล์เต่ง (Turgid)"
            : nextVolume > 90
            ? "ปกติ (Isotonic)"
            : nextVolume > 60
            ? "เริ่มสลาย (Incipient Plasmolysis)"
            : "เซลล์เหี่ยว (Plasmolyzed)";

        setHistory((prev) => [
          ...prev,
          {
            time: newTime,
            concentration: concentrationRef.current,
            vacuoleVolume: Math.round(nextVolume),
            state: stateText,
          },
        ]);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [targetVolume]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setCurrentVolume(100);
    setHistory([]);
  };

  const handleSave = async () => {
    if (history.length === 0) {
      alert("กรุณาเริ่มแอนิเมชันสะสมข้อมูลก่อนบันทึกผล");
      return;
    }

    const lastPoint = history[history.length - 1];
    const experimentData = {
      labId: "cell-osmosis",
      timestamp: new Date().toLocaleString("th-TH"),
      concentration,
      elapsedTime,
      finalVolume: lastPoint.vacuoleVolume,
      cellState: lastPoint.state,
      dataPoints: history,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_osmosis_experiment",
      localPayload: experimentData,
      labId: "cell-osmosis",
      title: "Osmosis & Plasmolysis Lab",
      variables: { concentration },
      liveValues: { finalVolume: lastPoint.vacuoleVolume, cellState: lastPoint.state },
      graphPoints: history.map((h) => ({ x: h.time, y: h.vacuoleVolume })),
      tableRows: history,
      summary: {
        concentration,
        cellState: lastPoint.state,
        finalVolume: lastPoint.vacuoleVolume,
      },
      score: 100,
    });
    alert("บันทึกผลการทดลอง Osmosis สำเร็จ");
  };

  const cellStateText = useMemo(() => {
    if (currentVolume > 110) return "เซลล์เต่ง (Turgid)";
    if (currentVolume > 90) return "ปกติ (Flaccid)";
    if (currentVolume > 60) return "สลายบางส่วน (Incipient Plasmolysis)";
    return "เซลล์เหี่ยว (Plasmolyzed)";
  }, [currentVolume]);

  const turgorPressure = useMemo(() => {
    // Turgor pressure drops to 0 when volume is below normal (< 100%)
    if (currentVolume <= 100) return 0;
    return Math.round((currentVolume - 100) * 12); // kPa
  }, [currentVolume]);

  const solutionPreset = useMemo(() => {
    if (concentration === 0) return "hypotonic";
    if (concentration === 0.9) return "isotonic";
    if (concentration === 5.0) return "hypertonic";
    if (concentration === 10.0) return "extreme";
    return "custom";
  }, [concentration]);

  const handlePresetChange = (val: string) => {
    if (val === "hypotonic") setConcentration(0.0);
    else if (val === "isotonic") setConcentration(0.9);
    else if (val === "hypertonic") setConcentration(5.0);
    else if (val === "extreme") setConcentration(10.0);
  };

  return (
    <SharedSimulationShell
      accent="blue"
      labId="cell-osmosis"
      category="Biology"
      title="Osmosis & Plasmolysis Lab"
      subtitle="ศึกษาปรากฏการณ์การเคลื่อนที่ของน้ำผ่านเยื่อหุ้มเซลล์ของเซลล์พืชจำลอง ภายใต้ระดับความเข้มข้นสารละลายที่แตกต่างกัน"
      statusLabel={isRunning ? "กำลังจำลอง" : "พร้อมทดลอง"}
      icon={Droplet}
      sceneTitle="ภาพกล้องจุลทรรศน์จำลองเซลล์พืช"
      scene={
        <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-[#0f172a] shadow-inner">
          {/* Microscope overlay grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-45 pointer-events-none" />
          <div className="absolute inset-0 border-8 border-[#1e293b]/80 rounded-2xl pointer-events-none" />

          {/* Plant Cell drawing */}
          <svg className="h-full w-full max-w-[480px] p-4" viewBox="0 0 400 300" fill="none">
            <defs>
              <linearGradient id="cellWallGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="vacuoleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.8" />
              </linearGradient>
              <radialGradient id="cytoplasmGrad">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#172554" stopOpacity="0.5" />
              </radialGradient>
            </defs>

            {/* Cell Wall (Rigid, unchanging outer border) */}
            <rect x="50" y="40" width="300" height="220" rx="20" fill="url(#cytoplasmGrad)" stroke="#16a34a" strokeWidth="8" />

            {/* Plasma Membrane (Shrinks or swells based on currentVolume) */}
            {/* Standard: x: 58, y: 48, w: 284, h: 204 */}
            {(() => {
              const scale = currentVolume / 100;
              // Shrink center coords: cx = 200, cy = 150
              // In hypotonic state scale is > 1.0 but capped by Cell Wall boundary
              const effectiveScale = Math.min(1.02, scale);
              const w = 284 * effectiveScale;
              const h = 204 * effectiveScale;
              const x = 200 - w / 2;
              const y = 150 - h / 2;
              const rx = 16 * effectiveScale;

              return (
                <>
                  {/* Cytosol space boundary */}
                  <rect x={x} y={y} width={w} height={h} rx={rx} fill="#020617" opacity="0.35" stroke="#3b82f6" strokeWidth="2.5" />

                  {/* Vacuole (Largest component inside cell) */}
                  {(() => {
                    const vacScale = scale;
                    const vw = 180 * vacScale;
                    const vh = 130 * vacScale;

                    return (
                      <ellipse cx="200" cy="140" rx={vw / 2} ry={vh / 2} fill="url(#vacuoleGrad)" stroke="#2563eb" strokeWidth="2" />
                    );
                  })()}

                  {/* Chloroplasts floating in cytosol (Moving with membrane) */}
                  {[
                    { cx: 90, cy: 90 },
                    { cx: 310, cy: 90 },
                    { cx: 90, cy: 210 },
                    { cx: 310, cy: 210 },
                    { cx: 140, cy: 75 },
                    { cx: 260, cy: 75 },
                    { cx: 140, cy: 225 },
                    { cx: 260, cy: 225 },
                  ].map((ch, idx) => {
                    // LERP coordinate relative to cell center
                    const dx = ch.cx - 200;
                    const dy = ch.cy - 150;
                    const rx = 200 + dx * effectiveScale;
                    const ry = 150 + dy * effectiveScale;

                    return (
                      <ellipse key={idx} cx={rx} cy={ry} rx="12" ry="7" fill="#15803d" stroke="#22c55e" strokeWidth="1.5" transform={`rotate(${idx * 25}, ${rx}, ${ry})`} />
                    );
                  })}

                  {/* Nucleus (grayish ball) */}
                  {(() => {
                    const nx = 200 - 60 * effectiveScale;
                    const ny = 150 - 15 * effectiveScale;
                    return (
                      <circle cx={nx} cy={ny} r={18 * effectiveScale} fill="#64748b" opacity="0.85" stroke="#475569" strokeWidth="2.5" />
                    );
                  })()}
                </>
              );
            })()}

            {/* Solution environment representation (dots representing ions) */}
            {Array.from({ length: Math.round(concentration * 8) }).map((_, idx) => {
              // Place dots outside the cell wall or around
              const px = 20 + (idx * 57) % 360;
              const py = 15 + (idx * 93) % 270;
              // Make sure it doesn't fall deep inside cell center (just draw surrounding)
              const insideCell = px > 65 && px < 335 && py > 55 && py < 245;

              return (
                <circle key={idx} cx={px} cy={py} r="2.5" fill="#facc15" opacity={insideCell ? 0.15 : 0.85} />
              );
            })}
          </svg>

          {/* Cell status badge inside viewport */}
          <div className="absolute right-5 bottom-5 rounded-xl bg-slate-900/90 border border-slate-700/60 px-3.5 py-1.5 text-right font-bold text-xs text-white">
            <span className="text-[10px] text-slate-400 block font-black">สภาพเซลล์ปัจจุบัน</span>
            {cellStateText}
          </div>
        </div>
      }
      controlsTitle="แผงควบคุมสารละลายภายนอก"
      controls={
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-600 font-sans">ชุดความเข้มข้นตัวอย่าง (Preset)</span>
            <select
              value={solutionPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              disabled={isRunning}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-45"
            >
              <option value="hypotonic">Hypotonic (น้ำกลั่นบริสุทธิ์ - 0.0% NaCl)</option>
              <option value="isotonic">Isotonic (สมดุลทางสรีรวิทยา - 0.9% NaCl)</option>
              <option value="hypertonic">Hypertonic (น้ำเกลือปานกลาง - 5.0% NaCl)</option>
              <option value="extreme">Extreme Hypertonic (น้ำเกลือเข้มข้น - 10.0% NaCl)</option>
              <option value="custom">ระบุค่าเอง (Custom)</option>
            </select>
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600 font-sans">
              <span>ความเข้มข้น NaCl นอกเซลล์</span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-black text-blue-700">{concentration.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={10.0}
              step={0.1}
              value={concentration}
              disabled={isRunning || solutionPreset !== "custom"}
              onChange={(e) => setConcentration(Number(e.target.value))}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-blue-500 disabled:opacity-45"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600 font-sans">
              <span>วินาทีจำลองการแพร่</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono font-black text-slate-800">{elapsedTime}s</span>
            </div>
          </label>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleStartStop}
              className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${
                isRunning ? "bg-slate-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
              {isRunning ? "หยุดจำลอง" : "เริ่มจำลอง"}
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
        { label: "ความเข้มข้น", value: `${concentration.toFixed(1)}% NaCl`, tone: "blue" },
        { label: "ขนาดของแวคิวโอล", value: `${Math.round(currentVolume)}%`, tone: "cyan" },
        { label: "แรงดันเต่ง", value: `${turgorPressure} kPa`, tone: "emerald" },
        { label: "สถานะเซลล์", value: cellStateText.split(" (")[0], tone: "violet" },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <BarChart3 className="h-4.5 w-4.5 text-blue-600" />
              การเปลี่ยนแปลงปริมาตร
            </h3>
            <span className="text-[10px] font-bold text-blue-600 select-none">vacuole volume</span>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-4 rounded-xl bg-slate-50/70 p-4">
            <div className="mb-1 flex justify-between text-xs font-black text-slate-600">
              <span>ปริมาตรแวคิวโอลปัจจุบัน</span>
              <span>{Math.round(currentVolume)}%</span>
            </div>
            <div className="h-6 overflow-hidden rounded-full bg-white relative">
              <div
                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-400 to-blue-600"
                style={{ width: `${Math.min(100, (currentVolume / 130) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] font-bold text-slate-400 leading-normal">
              * ปริมาตรเซลล์ปกติของพืชมีค่าคงที่ที่ 100% สารละลายไฮโปโทนิกจะดึงน้ำเข้าทำให้เต่งถึง 125% สารละลายไฮเปอร์โทนิกจะรีดน้ำออกทำให้เซลล์เหี่ยว
            </div>
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <ClipboardList className="h-4.5 w-4.5 text-blue-600" />
              ตารางบันทึกความดัน
            </h3>
            <span className="text-[10px] font-bold text-slate-400 select-none">{history.length} จุดข้อมูล</span>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-100 max-h-[190px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-50/70 text-[11px] font-black text-blue-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2">เวลา</th>
                  <th className="px-3 py-2">ความเข้มข้น</th>
                  <th className="px-3 py-2">ปริมาตร</th>
                  <th className="px-3 py-2">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                {history.slice(-6).map((point, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 font-mono">{point.time}s</td>
                    <td className="px-3 py-2 font-mono">{point.concentration}%</td>
                    <td className="px-3 py-2 font-mono text-blue-700">{point.vacuoleVolume}%</td>
                    <td className="px-3 py-2 text-slate-500 text-[10px] truncate">{point.state}</td>
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
            ทฤษฎีออสโมซิสในเซลล์
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3 text-xs font-semibold leading-relaxed text-slate-500">
            <p>
              **Osmosis** คือการแพร่ของน้ำจากบริเวณที่มีสารละลายเจือจางไปยังบริเวณที่มีความเข้มข้นสูงกว่าผ่านเยื่อเลือกผ่าน
            </p>
            <p>
              **Plasmolysis** เกิดขึ้นเมื่อเซลล์พืชอยู่ในสารละลายที่มีความเข้มข้นของไอออนนอกเซลล์สูงกว่าในไซโตพลาสซึม (Hypertonic) ทำให้น้ำแพร่ออกนอกเซลล์จนเยื่อหุ้มเซลล์หดห่างออกจากผนังเซลล์
            </p>
          </div>
        </section>
      }
      steps={[
        { label: "เลือกความเข้มข้น", icon: Droplet },
        { label: "เริ่มระบบจำลอง", icon: Play },
        { label: "สังเกตเยื่อหุ้มเซลล์", icon: Activity },
        { label: "ตรวจความดันเต่ง", icon: BarChart3 },
        { label: "บันทึกผลแล็บ", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "อธิบายทิศทางการเคลื่อนที่ของน้ำในสภาวะความเข้มข้นต่างกัน",
        "สังเกตการหดตัวของแวคิวโอลและการฉีกห่างของเยื่อหุ้มเซลล์พืช",
        "ทำความเข้าใจผลของแรงดันเต่ง (Turgor Pressure) ต่อความคงรูป",
        "วิเคราะห์สภาวะสมดุลไอโซโทนิก ไฮโปโทนิก และไฮเปอร์โทนิก",
      ]}
      progressLabel="ระดับแวคิวโอลปัจจุบัน"
      progressValue={`${Math.round(currentVolume)}%`}
      progressPercent={Math.min(100, currentVolume)}
      tips={[
        "ทดลองกับค่า 0.9% NaCl ซึ่งเป็นสภาวะที่สมดุลกับเซลล์พืช",
        "น้ำเข้มข้นสูง (10.0% NaCl) จะเกิดการ Plasmolysis อย่างรวดเร็ว",
        "ลองสลับกลับไปที่ 0% NaCl ทันทีหลังจากเซลล์เหี่ยว เพื่อดูการฟื้นฟูเซลล์ (Deplasmolysis)",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}
