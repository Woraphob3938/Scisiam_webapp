"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Sliders,
  ClipboardList,
  Activity,
  Zap,
  Sparkles,
  Clipboard,
  Download,
  Trash,
  Target,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedForceRun {
  index: number;
  actionType: string; // "ผลัก (Push)" or "ดึง (Pull)"
  forceNewton: number;
  weightLoad: string;
  surfaceType: string;
  maxSpeed: number; // m/s
  duration: number; // seconds
}

export default function PushPullForcesSimulation() {
  const labId = "push-pull-forces";

  const [actionType, setActionType] = useState<"push" | "pull">("push");
  const [forceVal, setForceVal] = useState<number>(50); // Newtons
  const [loadWeight, setLoadWeight] = useState<"none" | "box" | "teddy">("none");
  const [surface, setSurface] = useState<"ice" | "grass" | "gravel">("ice");

  // Physics Ticker
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [cartPos, setCartPos] = useState<number>(50); // X coordinate of cart (50-180)
  const [velocity, setVelocity] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  const [loggedRuns, setLoggedRuns] = useState<LoggedForceRun[]>([]);

  // Physics calculations: F_net = F_applied - F_friction
  // Mass: none = 10kg, box = 30kg, teddy = 15kg
  const massKg = useMemo(() => {
    if (loadWeight === "box") return 30;
    if (loadWeight === "teddy") return 15;
    return 10;
  }, [loadWeight]);

  // Friction coefficient: ice = 0, grass = 0.2, gravel = 0.5
  // F_friction = mu * mass * gravity (10 m/s^2)
  const frictionForce = useMemo(() => {
    let mu = 0;
    if (surface === "grass") mu = 0.15;
    if (surface === "gravel") mu = 0.4;
    return Math.round(mu * massKg * 10);
  }, [surface, massKg]);

  const netForce = useMemo(() => {
    const applied = forceVal;
    if (applied === 0) return 0;
    const net = Math.max(0, applied - frictionForce);
    return actionType === "push" ? -net : net; // push moves left (smaller X), pull moves right (larger X)
  }, [forceVal, frictionForce, actionType]);

  const acceleration = useMemo(() => {
    return netForce / massKg;
  }, [netForce, massKg]);

  // Physics animation tick
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeElapsed((t) => {
        if (t >= 5) {
          setIsPlaying(false);
          return 5;
        }
        return parseFloat((t + 0.1).toFixed(1));
      });

      setVelocity((v) => {
        const nextV = v + acceleration * 0.1;
        // Limit speed to 10 m/s for display
        return Math.max(-10, Math.min(10, nextV));
      });

      setCartPos((pos) => {
        // X Pos limits: 15 to 180
        const delta = velocity * 1.5;
        const nextPos = pos + delta;
        if (nextPos <= 15 || nextPos >= 180) {
          setIsPlaying(false);
          return nextPos <= 15 ? 15 : 180;
        }
        return nextPos;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isPlaying, acceleration, velocity]);

  const handleStartSim = () => {
    // Reset positions but keep variables
    setCartPos(actionType === "push" ? 150 : 50); // push starts from right and goes left, pull starts from left and goes right
    setVelocity(0);
    setTimeElapsed(0);
    setIsPlaying(true);
  };

  const createCurrentRun = (index: number): LoggedForceRun => ({
      index,
      actionType: actionType === "push" ? "ผลัก (Push)" : "ดึง (Pull)",
      forceNewton: forceVal,
      weightLoad: loadWeight === "none" ? "กล่องเปล่า (10kg)" : loadWeight === "box" ? "กล่องไม้หนัก (30kg)" : "ตุ๊กตาหมี (15kg)",
      surfaceType: surface === "ice" ? "น้ำแข็งลื่น (Ice)" : surface === "grass" ? "สนามหญ้า (Grass)" : "ทางกรวดหยาบ (Gravel)",
      maxSpeed: Math.abs(parseFloat(velocity.toFixed(2))),
      duration: timeElapsed
  });

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setActionType("push");
    setForceVal(50);
    setLoadWeight("none");
    setSurface("ice");
    setIsPlaying(false);
    setCartPos(50);
    setVelocity(0);
    setTimeElapsed(0);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุดที่\tชนิดแรง\tขนาดแรง (N)\tน้ำหนักบรรทุก\tพื้นผิว\tความเร็วสูงสุด (m/s)\tเวลาเคลื่อนที่ (s)\n";
    const rows = loggedRuns.map((r) => `${r.index}\t${r.actionType}\t${r.forceNewton}\t${r.weightLoad}\t${r.surfaceType}\t${r.maxSpeed}\t${r.duration}`);
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map((r) => `${r.index},${r.actionType},${r.forceNewton},"${r.weightLoad}","${r.surfaceType}",${r.maxSpeed},${r.duration}`);
    const csv = "data:text/csv;charset=utf-8," + ["Index,ActionType,ForceNewton,WeightLoad,SurfaceType,MaxSpeed,Duration", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "push_pull_forces_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    const nextRuns = [...loggedRuns, createCurrentRun(loggedRuns.length + 1)];
    setLoggedRuns(nextRuns);

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_push_pull_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns: nextRuns },
      labId,
      title: "Push & Pull Forces",
      variables: { actionType, forceVal, loadWeight, surface },
      liveValues: { velocity, cartPos, timeElapsed },
      graphPoints: nextRuns.map((r) => ({ index: r.index, x: r.forceNewton, y: r.maxSpeed })),
      tableRows: nextRuns,
      summary: { runsCount: nextRuns.length, maxSpeed: Math.max(...nextRuns.map((r) => r.maxSpeed)) },
      score: Math.min(100, Math.max(40, 40 + nextRuns.length * 15)),
      durationSeconds: null
    });
    alert("บันทึกรายงานผลการทดลองการเคลื่อนที่สำเร็จ");
  };

  const questProgress = Math.min(100, Math.round((loggedRuns.length / 3) * 100));
  const compactControls = (
    <div className="grid gap-3 lg:grid-cols-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
        <span className="mb-2 block text-xs font-bold text-slate-600">ทิศทางแรง</span>
        <div className="grid grid-cols-2 gap-2">
          {(["push", "pull"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActionType(type)}
              aria-pressed={actionType === type}
              className={`rounded-xl border px-2 py-2 text-xs font-bold transition ${
                actionType === type ? "border-blue-500 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {type === "push" ? "ผลัก" : "ดึง"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
        <ManualNumberInput label="แรงกระทำ" ariaLabel="แรงกระทำนิวตัน" value={forceVal} min={10} max={100} step={10} onChange={setForceVal} tone="blue" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
        <span className="mb-2 block text-xs font-bold text-slate-600">น้ำหนักบรรทุก</span>
        <div className="grid grid-cols-3 gap-1">
          {(["none", "teddy", "box"] as const).map((weight) => (
            <button
              key={weight}
              type="button"
              onClick={() => setLoadWeight(weight)}
              aria-pressed={loadWeight === weight}
              className={`rounded-lg border px-1 py-2 text-[11px] font-bold ${
                loadWeight === weight ? "border-amber-400 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {weight === "none" ? "ว่าง" : weight === "teddy" ? "หมี" : "กล่อง"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
        <span className="mb-2 block text-xs font-bold text-slate-600">พื้นผิว</span>
        <div className="grid grid-cols-3 gap-1">
          {(["ice", "grass", "gravel"] as const).map((surfaceType) => (
            <button
              key={surfaceType}
              type="button"
              onClick={() => setSurface(surfaceType)}
              aria-pressed={surface === surfaceType}
              className={`rounded-lg border px-1 py-2 text-[11px] font-bold ${
                surface === surfaceType ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {surfaceType === "ice" ? "น้ำแข็ง" : surfaceType === "grass" ? "หญ้า" : "กรวด"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="blue"
      labId="push-pull-forces"
      category="Physics"
      title="Push & Pull Forces"
      subtitle="สำรวจโลกของแรงผลักและแรงดึงที่มีผลต่อการเริ่มเคลื่อนที่หรือความเร็วของกล่องรถของเล่นแสนสนุก"
      statusLabel={`ระบบ: ${isPlaying ? "กำลังเคลื่อนที่!" : "หยุดนิ่ง"}`}
      icon={Activity}
      sceneTitle="วิชวลจำลองรถลากของเล่น (Forces Play Stage)"
      scene={
        <div
          data-testid="push-pull-experiment-scene"
          className="relative flex h-full min-h-[300px] flex-col overflow-hidden bg-[linear-gradient(180deg,#eff6ff_0%,#dbeafe_58%,#f8fafc_100%)] p-4 select-none"
        >
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          {/* Surface Indicator label */}
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-2.5 py-1 rounded-lg border border-blue-200 text-[10px] font-black text-blue-700">พื้นผิว: {surface === "ice" ? "❄️ น้ำแข็ง (ลื่นมาก)" : surface === "grass" ? "🌱 สนามหญ้า (ฝืดนิดหน่อย)" : "🪨 ทางกรวด (ฝืดมาก)"}</div>

          <div className="relative flex-grow flex items-end justify-start pb-6">
            {/* Play track line */}
            <svg
              viewBox="0 0 200 120"
              className="h-full min-h-[240px] w-full overflow-visible"
              role="img"
              aria-labelledby="push-pull-title push-pull-description"
            >
              <title id="push-pull-title">แรงผลักและแรงดึง</title>
              <desc id="push-pull-description">รถของเล่นบนพื้นผิวจำลอง พร้อมคนออกแรงและลูกศรแสดงทิศทางของแรง</desc>
              <defs>
                <marker id="push-pull-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
                <linearGradient id="push-pull-cart" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fbbf24" />
                  <stop offset="1" stopColor="#ea580c" />
                </linearGradient>
              </defs>
              <rect x="8" y="18" width="184" height="82" rx="14" fill="#ffffff" opacity="0.68" />
              <path d="M18 34H72M128 34H182" stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="100" y="30" fill="#1d4ed8" fontSize="6.5" fontWeight="900" textAnchor="middle">
                แรงลัพธ์ = {Math.max(0, forceVal - frictionForce).toFixed(0)} N
              </text>
              <g transform="translate(16 44)">
                <rect width="54" height="30" rx="8" fill="#ffffff" stroke="#bfdbfe" />
                <text x="27" y="11" fill="#64748b" fontSize="5.5" fontWeight="800" textAnchor="middle">แรงที่ออก</text>
                <text x="27" y="23" fill="#dc2626" fontSize="8" fontWeight="900" textAnchor="middle">{forceVal} N</text>
              </g>
              <g transform="translate(16 78)">
                <rect width="54" height="18" rx="7" fill="#fff7ed" stroke="#fed7aa" />
                <text x="27" y="12" fill="#c2410c" fontSize="5.5" fontWeight="900" textAnchor="middle">แรงเสียดทาน {frictionForce} N</text>
              </g>
              {/* Floor Surface line */}
              <line x1="10" y1="100" x2="190" y2="100" stroke={surface === "ice" ? "#93c5fd" : surface === "grass" ? "#22c55e" : "#78716c"} strokeWidth="5" />
              {surface === "grass" && [18, 36, 54, 72, 132, 150, 168, 186].map((x) => (
                <path key={x} d={`M${x} 99l3-7 3 7`} stroke="#15803d" strokeWidth="1" fill="none" />
              ))}
              {surface === "gravel" && [22, 43, 67, 139, 162, 181].map((x) => (
                <circle key={x} cx={x} cy="96" r="2.2" fill="#57534e" />
              ))}

              {/* Cartoon Character pulling or pushing the cart */}
              <g transform={`translate(${actionType === "pull" ? cartPos - 25 : cartPos + 25}, 70)`}>
                {/* Simple character stick figure/avatar */}
                <circle cx="10" cy="10" r="6" fill="#3b82f6" />
                {/* Torso */}
                <line x1="10" y1="16" x2="10" y2="26" stroke="#1e3a8a" strokeWidth="2.5" />
                {/* Arms holding the rope or pushing */}
                <line x1="10" y1="20" x2={actionType === "pull" ? "20" : "0"} y2="20" stroke="#1e3a8a" strokeWidth="1.5" />
                {/* Legs */}
                <line x1="10" y1="26" x2="5" y2="35" stroke="#1e3a8a" strokeWidth="2" />
                <line x1="10" y1="26" x2="15" y2="35" stroke="#1e3a8a" strokeWidth="2" />
              </g>

              {/* Rope between character and cart */}
              {actionType === "pull" && <line x1={cartPos} y1="90" x2={cartPos - 12} y2="90" stroke="#78350f" strokeWidth="1.5" strokeDasharray="2,2" />}

              {/* The Toy Cart */}
              <g transform={`translate(${cartPos}, 82)`}>
                {/* Wooden Box cart */}
                <rect x="-17" y="-1" width="34" height="14" fill="url(#push-pull-cart)" stroke="#9a3412" strokeWidth="1.5" rx="3" />
                <path d="M-11 3H11M-11 8H11" stroke="#ffedd5" strokeWidth="1.2" opacity="0.8" />

                {/* Wheels */}
                <circle cx="-10" cy="13" r="4.5" fill="#1e293b" />
                <circle cx="-10" cy="13" r="1.5" fill="#94a3b8" />
                <circle cx="10" cy="13" r="4.5" fill="#1e293b" />
                <circle cx="10" cy="13" r="1.5" fill="#94a3b8" />

                {/* Loaded Weight item */}
                {loadWeight === "box" && <rect x="-8" y="-10" width="16" height="10" fill="#78350f" rx="1" />}
                {loadWeight === "teddy" && (
                  // Friendly circle teddy shape
                  <g transform="translate(0, -6)">
                    <circle cx="0" cy="-3" r="5" fill="#b45309" />
                    <circle cx="-4" cy="-7" r="2" fill="#b45309" />
                    <circle cx="4" cy="-7" r="2" fill="#b45309" />
                    {/* Face snout */}
                    <circle cx="0" cy="-1" r="2" fill="#fef08a" />
                  </g>
                )}
              </g>

              {/* Big Force Vector Arrow */}
              {forceVal > 0 && (
                <g transform={`translate(${cartPos}, 68)`}>
                  {actionType === "pull" ? (
                    // Pull force arrow to the right
                    <g>
                          <line x1="-20" y1="0" x2={forceVal * 0.4} y2="0" stroke="#ef4444" strokeWidth="3.5" markerEnd="url(#push-pull-arrow)" />
                      <text x="0" y="-6" fill="#ef4444" fontSize="7" fontWeight="bold">
                        ดึง (Pull)
                      </text>
                    </g>
                  ) : (
                    // Push force arrow to the left
                    <g>
                          <line x1="20" y1="0" x2={-forceVal * 0.4} y2="0" stroke="#ef4444" strokeWidth="3.5" markerEnd="url(#push-pull-arrow)" />
                      <text x="0" y="-6" fill="#ef4444" fontSize="7" fontWeight="bold">
                        ผลัก (Push)
                      </text>
                    </g>
                  )}
                </g>
              )}
              <g transform="translate(136 46)">
                <rect width="48" height="31" rx="9" fill="#eff6ff" stroke="#bfdbfe" />
                <text x="24" y="12" fill="#64748b" fontSize="5.5" fontWeight="900" textAnchor="middle">ความเร็วรถ</text>
                <text x="24" y="24" fill="#1d4ed8" fontSize="8" fontWeight="900" textAnchor="middle">{Math.abs(velocity).toFixed(1)} m/s</text>
              </g>
            </svg>
          </div>
        </div>
      }
      controlsTitle="ควบคุมแรงของเด็กๆ"
      controls={compactControls}
      compactControls={compactControls}
      metrics={[
        { label: "ความเร็วรถของเล่น", value: `${Math.abs(parseFloat(velocity.toFixed(1)))} m/s`, tone: "blue" },
        { label: "แรงสุทธิหลังหักลบ", value: `${Math.abs(netForce)} นิวตัน`, tone: "blue" },
        { label: "น้ำหนักรวมรถลาก", value: `${massKg} กิโลกรัม`, tone: "orange" },
        { label: "แรงต้านแรงเสียดทานถนน", value: `${frictionForce} นิวตัน`, tone: frictionForce > 0 ? "orange" : undefined }
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-blue-600" />
              เปรียบเทียบความเร็วกับแรงผลัก (Speed vs Force)
            </h3>
          </div>
          <div className="flex-grow flex items-center justify-center">
            {loggedRuns.length === 0 ? (
              <div className="text-xs text-slate-400">จดบันทึกการปล่อยวิ่งเพื่อพลอตกราฟจุดวัด</div>
            ) : (
              <svg viewBox="0 0 200 120" className="w-full max-w-[240px] h-auto">
                <line x1="15" y1="100" x2="185" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="15" y1="10" x2="15" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                {loggedRuns.map((r, i) => {
                  const cx = 15 + (r.forceNewton / 100) * 165;
                  const cy = 100 - (r.maxSpeed / 10) * 80;
                  return (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="3" fill="#3b82f6" />
                      {i > 0 && <line x1={15 + (loggedRuns[i - 1].forceNewton / 100) * 165} y1={100 - (loggedRuns[i - 1].maxSpeed / 10) * 80} x2={cx} y2={cy} stroke="#93c5fd" strokeWidth="1.2" />}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <ClipboardList className="h-4.5 w-4.5 text-blue-500" />
              สมุดจดผลการวิ่งของหนูๆ
            </h3>
            {loggedRuns.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={handleCopyData} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                  <Clipboard className="h-3 w-3" /> คัดลอก
                </button>
                <button onClick={handleExportCSV} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                  <Download className="h-3 w-3" /> CSV
                </button>
              </div>
            )}
          </div>
          {loggedRuns.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-xs text-slate-400 py-10">ยังไม่มีการบันทึกการวิ่ง</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center">ที่</th>
                    <th className="p-2">ชนิดแรง</th>
                    <th className="p-2">ขนาดแรง</th>
                    <th className="p-2">ของบรรทุก</th>
                    <th className="p-2">ชนิดพื้นผิว</th>
                    <th className="p-2">ความเร็วสูงสุด</th>
                    <th className="p-2 text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  {loggedRuns.map((r) => (
                    <tr key={r.index} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-bold">{r.index}</td>
                      <td className="p-2 font-sans">{r.actionType}</td>
                      <td className="p-2 font-sans">{r.forceNewton} นิวตัน (N)</td>
                      <td className="p-2 font-sans">{r.weightLoad}</td>
                      <td className="p-2 font-sans">{r.surfaceType}</td>
                      <td className="p-2 text-blue-700 font-bold">{r.maxSpeed} m/s</td>
                      <td className="p-2 text-center">
                        <button onClick={() => handleClearLog(r.index)} className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                          <Trash className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      }
      learningGoals={["เรียนรู้ว่า 'แรงผลัก' คือการดันสิ่งของออกตัว และ 'แรงดึง' คือการดึงสิ่งของเข้าหาตัวเรา", "สังเกตว่าความเร็วของรถของเล่นขึ้นอยู่กับขนาดของแรงที่ผลักหรือดึง (ยิ่งแรงเยอะ ยิ่งวิ่งเร็ว)", "ทำความเข้าใจผลกระทบของน้ำหนักบรรทุก (มวลเยอะ วิ่งช้าลง) และพื้นผิวฝืดชะลอแรง (แรงเสียดทาน)"]}
      steps={[
        { label: "เลือกชนิดของแรงว่าจะทำการผลักออกหรือดึงเข้า และตั้งค่าขนาดของแรงกระทำ", icon: Sliders },
        { label: "เลือกของใส่บนรถ (น้องตุ๊กตาหรือกล่องไม้) และเลือกทางด่านพื้นผิวสนาม", icon: Target },
        { label: "กดสวิตช์ปล่อยตัววิ่ง สังเกตแรงผลักดันรถและตัวเลขมาตรวัดความเร็วท้ายที่สุด", icon: Zap },
        { label: "จดสถิติลงในสมุดผลและวิเคราะห์เปรียบเทียบว่าตั้งแบบไหนลากได้เร็วที่สุด", icon: ClipboardList }
      ]}
      progressLabel="ความคืบหน้าการเล่น"
      progressValue={questProgress === 100 ? "เล่นและบันทึกผลการวิ่งรถสำเร็จแล้วจ้า!" : `ทดลองสำเร็จแล้ว ${loggedRuns.length}/3 รอบ`}
      progressPercent={questProgress}
      tips={["ทางน้ำแข็งลื่นมากจะไม่มีแรงเสียดทานมารบกวน รถจะไถลปลิวไปได้รวดเร็วที่สุดเลยนะ", "ถ้าน้ำหนักบรรทุกหนักขึ้น (เช่นเพิ่มเป็นกล่องไม้) เราจะต้องออกแรงผลักให้เยอะขึ้น รถถึงจะวิ่งได้เท่าเดิม", "แรงต้านหรือ 'แรงเสียดทาน' จากถนนกรวดจะคอยดึงให้รถวิ่งช้าลงเหมือนเวลาหนูเข็นรถบนหญ้า"]}
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">แรงคืออะไรเอ่ย? (Push & Pull Forces)</p>
          <p className="mb-3">รอบตัวเรามีแรงคอยขับเคลื่อนอยู่เสมอ มาทำความรู้จักกันนะเด็กๆ:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>แรงผลัก (Push):</strong> เป็นการออกแรงที่ทิศทางพุ่งออกไปจากตัวเรา เช่น เวลาหนูเปิดประตูผลักออกจากห้อง หรือผลักรถให้เลื่อนไปข้างหน้า
            </li>
            <li>
              <strong>แรงดึง (Pull):</strong> เป็นการออกแรงที่ทิศทางพุ่งเข้าหาตัวเรา เช่น หนูจูงน้องตุ๊กตาเดินลากจูง หรือลากเชือกรถของเล่นเข้าหาตัว
            </li>
            <li>
              <strong>ของบรรทุก (น้ำหนัก/มวล):</strong> ยิ่งของหนักขึ้น ของก็จะลากเลื่อนได้ช้าลงตามธรรมชาติ
            </li>
            <li>
              <strong>ความฝืดของพื้นถนน (แรงเสียดทาน):</strong> พื้นผิวขรุขระ เช่น พื้นทรายหรือกรวด จะเกิดแรงต้านคอยยึดรั้งไม่ให้รถไหลสะดวก
            </li>
          </ul>
        </div>
      }
      onRun={handleStartSim}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
