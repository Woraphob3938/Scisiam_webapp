"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Compass,
  Flame,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface DataPoint {
  temp: number;
  ph: number;
  substrate: number;
  enzyme: number;
  velocity: number;
}

export default function EnzymeKineticsSimulation() {
  const [temperature, setTemperature] = useState(37); // °C
  const [ph, setPh] = useState(7.0);
  const [substrate, setSubstrate] = useState(50); // mM
  const [enzyme, setEnzyme] = useState(40); // nM
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [history, setHistory] = useState<DataPoint[]>([]);

  const isRunningRef = useRef(isRunning);
  const elapsedTimeRef = useRef(elapsedTime);
  const tempRef = useRef(temperature);
  const phRef = useRef(ph);
  const substrateRef = useRef(substrate);
  const enzymeRef = useRef(enzyme);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedTimeRef.current = elapsedTime; }, [elapsedTime]);
  useEffect(() => { tempRef.current = temperature; }, [temperature]);
  useEffect(() => { phRef.current = ph; }, [ph]);
  useEffect(() => { substrateRef.current = substrate; }, [substrate]);
  useEffect(() => { enzymeRef.current = enzyme; }, [enzyme]);

  // Calculate pH multiplier (Gaussian-like curve centered at 7.0)
  const phMultiplier = useMemo(() => {
    const diff = ph - 7.0;
    return Math.max(0, Math.exp(-(diff * diff) / 4));
  }, [ph]);

  // Calculate Temp multiplier (Asymmetrical curve peaking at 37°C, denaturing at 55°C)
  const tempMultiplier = useMemo(() => {
    const temp = temperature;
    if (temp < 37) {
      // Q10 rule: rate doubles every 10 degrees, approx linear/exponential climb
      return Math.max(0.05, Math.pow(2, (temp - 37) / 10));
    } else {
      // Denaturation starts rapidly after 40°C, drops to 0 at 60°C
      if (temp >= 55) return 0;
      return Math.max(0, 1 - (temp - 37) / (55 - 37));
    }
  }, [temperature]);

  // Calculate Reaction velocity V0 using Michaelis-Menten equation
  // V = (Vmax * [S]) / (Km + [S])
  const reactionVelocity = useMemo(() => {
    const Km = 25; // mM
    // Vmax scales linearly with enzyme concentration and modifiers
    const Vmax = (enzyme / 100) * 120 * tempMultiplier * phMultiplier;
    const V = (Vmax * substrate) / (Km + substrate);
    return Math.round(V * 10) / 10;
  }, [enzyme, tempMultiplier, phMultiplier, substrate]);

  // Molecules state representation
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number }>>([]);

  // Animation frame effect
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      const newTime = elapsedTimeRef.current + 1;
      setElapsedTime(newTime);

      // Generate bubbles based on reaction velocity
      const velocity = reactionVelocity;
      if (velocity > 0 && Math.random() < velocity / 30) {
        setBubbles((prev) => [
          ...prev,
          {
            id: Math.random(),
            x: 80 + Math.random() * 240,
            y: 260,
            size: 3 + Math.random() * 6,
            speed: 1 + Math.random() * 2,
          },
        ]);
      }

      // Log to history every 2 seconds
      if (newTime % 2 === 0) {
        setHistory((prev) => [
          ...prev,
          {
            temp: tempRef.current,
            ph: phRef.current,
            substrate: substrateRef.current,
            enzyme: enzymeRef.current,
            velocity,
          },
        ]);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isRunning, reactionVelocity]);

  // Physics update loop for bubbles
  useEffect(() => {
    let animId: number;

    const updateBubbles = () => {
      setBubbles((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - b.speed })) // move up
          .filter((b) => b.y > 60) // keep inside liquid area
      );
      animId = requestAnimationFrame(updateBubbles);
    };

    if (isRunning) {
      animId = requestAnimationFrame(updateBubbles);
    }

    return () => cancelAnimationFrame(animId);
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setBubbles([]);
    setHistory([]);
  };

  const handleSave = async () => {
    if (history.length === 0) {
      alert("กรุณาเริ่มแอนิเมชันสะสมข้อมูลก่อนบันทึกผล");
      return;
    }

    const lastPoint = history[history.length - 1];
    const experimentData = {
      labId: "enzyme-kinetics",
      timestamp: new Date().toLocaleString("th-TH"),
      temperature,
      ph,
      substrate,
      enzyme,
      elapsedTime,
      finalVelocity: lastPoint.velocity,
      dataPoints: history,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_enzyme_experiment",
      localPayload: experimentData,
      labId: "enzyme-kinetics",
      title: "Enzyme Catalysis Lab",
      variables: { temperature, ph, substrate, enzyme },
      liveValues: { finalVelocity: lastPoint.velocity },
      graphPoints: history.map((h, idx) => ({ x: idx * 2, y: h.velocity })),
      tableRows: history,
      summary: {
        temperature,
        ph,
        substrate,
        enzyme,
        finalVelocity: lastPoint.velocity,
      },
      score: 100,
    });
    alert("บันทึกผลการทดลอง Enzyme Catalysis สำเร็จ");
  };

  const isDenatured = useMemo(() => {
    return temperature >= 55 || ph < 3.0 || ph > 11.0;
  }, [temperature, ph]);

  return (
    <SharedSimulationShell
      accent="emerald"
      labId="enzyme-kinetics"
      category="Biology"
      title="Enzyme Catalysis Lab"
      subtitle="ศึกษากลไกการทำงานของเอนไซม์คะตาเลสในการย่อยสลายไฮโดรเจนเปอร์ออกไซด์ ภายใต้ตัวแปรอุณหภูมิ, pH และความเข้มข้นตัวทำปฏิกิริยา"
      statusLabel={isRunning ? "กำลังเร่งปฏิกิริยา" : "พร้อมทดลอง"}
      icon={Activity}
      sceneTitle="ภาพจำลองโมเลกุลในถ้วยแก้ววิจัย"
      scene={
        <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-[#0f172a] shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-45 pointer-events-none" />

          {/* Render reaction beaker */}
          <svg className="h-full w-full max-w-[480px] p-4" viewBox="0 0 400 300" fill="none">
            <defs>
              <linearGradient id="beakerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Liquid inside beaker */}
            <rect x="68" y="70" width="264" height="200" fill="url(#liquidGrad)" rx="10" />

            {/* Beaker outline */}
            <path d="M60 50 V270 Q60 280 70 280 H330 Q340 280 340 270 V50" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            
            {/* Beaker measurement lines */}
            <path d="M80 100 H110 M80 150 H120 M80 200 H110 M80 250 H120" stroke="#cbd5e1" strokeWidth="2.5" />
            <text x="130" y="154" fill="#cbd5e1" fontSize="10" fontWeight="bold">200 mL</text>
            <text x="130" y="254" fill="#cbd5e1" fontSize="10" fontWeight="bold">100 mL</text>

            {/* Gas bubbles O2 generated */}
            {bubbles.map((b) => (
              <circle key={b.id} cx={b.x} cy={b.y} r={b.size} fill="#ffffff" stroke="#10b981" strokeWidth="1.2" opacity="0.85" />
            ))}

            {/* Enzyme molecules floating around (showing shapes) */}
            {Array.from({ length: Math.round(enzyme / 6) }).map((_, idx) => {
              const ex = 90 + (idx * 59) % 220;
              const ey = 90 + (idx * 43) % 150;

              return (
                <g key={idx} className={isRunning ? "animate-pulse" : ""}>
                  {/* Outer sphere */}
                  <circle cx={ex} cy={ey} r="14" fill={isDenatured ? "#b91c1c" : "#10b981"} stroke="#ffffff" strokeWidth="1.5" opacity="0.75" />
                  {/* Active site notch */}
                  <path d={`M ${ex - 4} ${ey - 14} Q ${ex} ${ey - 2} ${ex + 4} ${ey - 14}`} stroke="#ffffff" strokeWidth="2" fill="none" />
                </g>
              );
            })}

            {/* Heat effect if temperature is high */}
            {temperature > 50 && (
              <g opacity={(temperature - 50) / 50}>
                <path d="M70 290 Q90 280 110 290 T150 290 T190 290 T230 290 T270 290 T310 290" stroke="#f97316" strokeWidth="4" fill="none" />
              </g>
            )}
          </svg>

          {/* Temperature/pH status badge */}
          {isDenatured && (
            <div className="absolute left-5 bottom-5 rounded-xl bg-red-950/95 border border-red-500/60 px-3.5 py-1.5 font-bold text-xs text-red-200 animate-pulse">
              ⚠️ เอนไซม์เสียสภาพ (Denatured)
            </div>
          )}
        </div>
      }
      controlsTitle="แผงควบคุมสภาวะปฏิกิริยาเคมี"
      controls={
        <div className="space-y-4 font-sans">
          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>อุณหภูมิ (Temperature)</span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-black text-emerald-700">{temperature}°C</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={temperature}
              disabled={isRunning}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-emerald-500 disabled:opacity-45"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>ความเป็นกรด-เบส (pH)</span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-black text-emerald-700">pH {ph.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={14.0}
              step={0.1}
              value={ph}
              disabled={isRunning}
              onChange={(e) => setPh(Number(e.target.value))}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-emerald-500 disabled:opacity-45"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold text-slate-600">[Substrate] (H₂O₂)</span>
              <select
                value={substrate}
                onChange={(e) => setSubstrate(Number(e.target.value))}
                disabled={isRunning}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 disabled:opacity-45"
              >
                <option value="10">10 mM</option>
                <option value="25">25 mM</option>
                <option value="50">50 mM</option>
                <option value="100">100 mM</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-bold text-slate-600">[Enzyme] (Catalase)</span>
              <select
                value={enzyme}
                onChange={(e) => setEnzyme(Number(e.target.value))}
                disabled={isRunning}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 disabled:opacity-45"
              >
                <option value="20">20 nM</option>
                <option value="40">40 nM</option>
                <option value="60">60 nM</option>
                <option value="100">100 nM</option>
              </select>
            </label>
          </div>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>เวลาสะสมปฏิกิริยา</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono font-black text-slate-800">{elapsedTime}s</span>
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
              {isRunning ? "หยุดปฏิกิริยา" : "เริ่มปฏิกิริยา"}
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
        { label: "อัตราความเร็ว V0", value: `${reactionVelocity} mol/min`, tone: "emerald" },
        { label: "[Substrate]", value: `${substrate} mM`, tone: "blue" },
        { label: "[Enzyme]", value: `${enzyme} nM`, tone: "violet" },
        { label: "สภาพการทำงาน", value: isDenatured ? "เสียสภาพ (0%)" : "ปกติ (100%)", tone: isDenatured ? "rose" : "emerald" },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <BarChart3 className="h-4.5 w-4.5 text-emerald-600" />
              Michaelis-Menten
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 select-none">reaction kinetics</span>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-4 rounded-xl bg-slate-50/70 p-4 text-xs font-semibold text-slate-500">
            <div className="flex justify-between items-center text-slate-700 font-bold">
              <span>ความเร็วเริ่มต้นปัจจุบัน:</span>
              <span>{reactionVelocity} mol/min</span>
            </div>
            <div className="h-6 overflow-hidden rounded-full bg-white relative">
              <div
                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-400 to-emerald-600"
                style={{ width: `${Math.min(100, (reactionVelocity / 120) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-bold leading-normal text-slate-400">
              * กราฟจะพุ่งขึ้นแบบไฮเปอร์โบลาเข้าหาขีดจำกัดความเร็วสูงสุด Vmax เมื่อความเข้มข้นของซับสเตรตสูงเกินค่า Km
            </p>
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <ClipboardList className="h-4.5 w-4.5 text-emerald-600" />
              ข้อมูล kinetics
            </h3>
            <span className="text-[10px] font-bold text-slate-400 select-none">{history.length} จุดข้อมูล</span>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-100 max-h-[190px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50/70 text-[11px] font-black text-emerald-800 sticky top-0">
                <tr>
                  <th className="px-2 py-2">อุณหภูมิ</th>
                  <th className="px-2 py-2">pH</th>
                  <th className="px-2 py-2">Substrate</th>
                  <th className="px-2 py-2">ความเร็ว V0</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                {history.slice(-6).map((point, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-2 font-mono">{point.temp}°C</td>
                    <td className="px-2 py-2 font-mono">{point.ph.toFixed(1)}</td>
                    <td className="px-2 py-2 font-mono">{point.substrate} mM</td>
                    <td className="px-2 py-2 font-mono text-emerald-700">{point.velocity}</td>
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
            สมการตัวเร่งปฏิกิริยา
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3 text-xs font-semibold leading-relaxed text-slate-500">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5 text-center text-[11px] font-bold text-emerald-800 leading-none">
              {"V0 = (Vmax * [S]) / (Km + [S])"}
            </div>
            <p>
              **Michaelis-Menten Kinetics**: อธิบายผลของความเข้มข้นของซับสเตรตต่ออัตราเร็วของปฏิกิริยา ค่า Km คือความเข้มข้นของซับสเตรตที่ทำให้อัตราปฏิกิริยาเป็นครึ่งหนึ่งของความเร็วสูงสุด Vmax
            </p>
          </div>
        </section>
      }
      steps={[
        { label: "กำหนดตัวแปรทดลอง", icon: Flame },
        { label: "เริ่มสะสมฟองออกซิเจน", icon: Play },
        { label: "บันทึกผล kinetics", icon: Activity },
        { label: "วิเคราะห์สมการความชัน", icon: BarChart3 },
        { label: "กดบันทึกผลการทดลอง", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "เรียนรู้วิธีการทำงานของเอนไซม์และกลไกการเกิดปฏิกิริยาเคมีชีวภาพ",
        "สังเกตผลกระทบของอุณหภูมิสูงต่อกระบวนการเสียสภาพของโปรตีน",
        "อธิบายผลของระดับกรด-เบส (pH) ต่อโครงสร้างและการทำงานของเอนไซม์",
        "เขียนความสัมพันธ์ระดับความเข้มข้นสารตามแบบจำลอง Michaelis-Menten",
      ]}
      progressLabel="อัตราสร้างฟองอากาศสะสม"
      progressValue={`${Math.round(reactionVelocity)} / sec`}
      progressPercent={Math.min(100, (reactionVelocity / 120) * 100)}
      tips={[
        "ตั้งอุณหภูมิที่ 37°C และ pH ที่ 7.0 เพื่อสภาวะประสิทธิภาพสูงสุด",
        "ทดลองเพิ่มอุณหภูมิเป็น 60°C จะพบว่าฟองอากาศหยุดพุ่งจากการเดนิวเจอร์",
        "ศึกษาความเข้มข้นระดับต่าง ๆ ตั้งแต่ 10 mM ถึง 100 mM เพื่อวาดกราฟไฮเปอร์โบลา",
      ]}
      onSave={handleSave}
    />
  );
}
