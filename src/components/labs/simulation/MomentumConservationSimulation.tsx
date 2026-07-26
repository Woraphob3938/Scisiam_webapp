"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ClipboardList,
  Trash,
  Download,
  Clipboard,
  Target,
  Flame,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface MomentumDataPoint {
  index: number;
  type: "Elastic" | "Inelastic";
  m1: number;
  m2: number;
  u1: number;
  u2: number;
  v1: number;
  v2: number;
  pBefore: number;
  pAfter: number;
}

function MomentumGraph({
  m1,
  m2,
  u1,
  u2,
  v1,
  v2,
  hasCollided,
}: {
  m1: number;
  m2: number;
  u1: number;
  u2: number;
  v1: number;
  v2: number;
  hasCollided: boolean;
}) {
  const p1Before = m1 * u1;
  const p2Before = m2 * u2;
  const pTotalBefore = p1Before + p2Before;

  const p1After = hasCollided ? m1 * v1 : 0;
  const p2After = hasCollided ? m2 * v2 : 0;
  const pTotalAfter = hasCollided ? p1After + p2After : 0;

  // Let's scale momentum values to SVG height. Max momentum can be 5kg * 5m/s = 25.
  // With 2 carts, max total momentum could be 50. Let's set scale range from -30 to 30.
  const scaleY = (p: number) => {
    // Center is 60px (height 120px)
    // 1 unit = 1.5px
    return 60 - p * 1.5;
  };

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <RefreshCw className="h-4.5 w-4.5 text-violet-600 animate-spin-slow" />
          กราฟแท่งเปรียบเทียบโมเมนตัม (Before vs After)
        </h3>
        <span className="text-[10px] font-bold text-violet-600">p = mv</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-950 p-3 flex flex-col justify-between">
        <svg className="w-full h-full min-h-[174px]" viewBox="0 0 200 120" fill="none">
          {/* Reference line for 0 momentum */}
          <line x1="15" y1="60" x2="185" y2="60" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

          {/* Grid lines */}
          <line x1="15" y1="22.5" x2="185" y2="22.5" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="15" y1="97.5" x2="185" y2="97.5" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="2 2" />

          {/* Y-axis labels */}
          <text x="12" y="25" fill="#475569" fontSize="5" fontWeight="bold" textAnchor="end">+25</text>
          <text x="12" y="62.5" fill="#475569" fontSize="5" fontWeight="bold" textAnchor="end">0</text>
          <text x="12" y="100" fill="#475569" fontSize="5" fontWeight="bold" textAnchor="end">-25</text>
          <text x="12" y="12" fill="#475569" fontSize="5" fontWeight="black">p (kg·m/s)</text>

          {/* Cart 1 Momentum Before Bar (Blue) */}
          <rect
            x="30"
            y={Math.min(60, scaleY(p1Before))}
            width="12"
            height={Math.abs(60 - scaleY(p1Before))}
            fill="#3b82f6"
            rx="1"
            opacity="0.8"
          />
          {/* Cart 1 Momentum After Bar (Cyan) */}
          <rect
            x="44"
            y={Math.min(60, scaleY(p1After))}
            width="12"
            height={Math.abs(60 - scaleY(p1After))}
            fill="#22d3ee"
            rx="1"
            opacity={hasCollided ? "0.9" : "0.2"}
          />

          {/* Cart 2 Momentum Before Bar (Red) */}
          <rect
            x="75"
            y={Math.min(60, scaleY(p2Before))}
            width="12"
            height={Math.abs(60 - scaleY(p2Before))}
            fill="#ef4444"
            rx="1"
            opacity="0.8"
          />
          {/* Cart 2 Momentum After Bar (Orange) */}
          <rect
            x="89"
            y={Math.min(60, scaleY(p2After))}
            width="12"
            height={Math.abs(60 - scaleY(p2After))}
            fill="#f97316"
            rx="1"
            opacity={hasCollided ? "0.9" : "0.2"}
          />

          {/* Total Momentum Before Bar (Purple) */}
          <rect
            x="130"
            y={Math.min(60, scaleY(pTotalBefore))}
            width="14"
            height={Math.abs(60 - scaleY(pTotalBefore))}
            fill="#a855f7"
            rx="1"
            opacity="0.8"
          />
          {/* Total Momentum After Bar (Green) */}
          <rect
            x="146"
            y={Math.min(60, scaleY(pTotalAfter))}
            width="14"
            height={Math.abs(60 - scaleY(pTotalAfter))}
            fill="#10b981"
            rx="1"
            opacity={hasCollided ? "0.9" : "0.2"}
          />

          {/* Labels for groups */}
          <text x="43" y="114" fill="#94a3b8" fontSize="5.5" fontWeight="bold" textAnchor="middle">Cart 1</text>
          <text x="88" y="114" fill="#94a3b8" fontSize="5.5" fontWeight="bold" textAnchor="middle">Cart 2</text>
          <text x="145" y="114" fill="#94a3b8" fontSize="5.5" fontWeight="bold" textAnchor="middle">Total (P)</text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 mt-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1.5 bg-blue-500 rounded-xs" />
            <span>ก่อนชน (Before)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1.5 bg-emerald-500 rounded-xs" />
            <span>หลังชน (After)</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MomentumTable({
  dataPoints,
  onClearPoint,
  onCopyData,
  onExportCSV,
}: {
  dataPoints: MomentumDataPoint[];
  onClearPoint: (idx: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-violet-600" />
          ตารางบันทึกผลการชน
        </h3>
        <div className="flex gap-2">
          <button onClick={onCopyData} className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <Clipboard className="w-3.5 h-3.5" />
          </button>
          <button onClick={onExportCSV} className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded-xl border border-slate-100 max-h-[174px]">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-violet-50/70 text-[10px] font-black text-violet-850 sticky top-0">
            <tr>
              <th className="px-2 py-1.5">จุด</th>
              <th className="px-2 py-1.5">ประเภท</th>
              <th className="px-2 py-1.5">มวล (kg)</th>
              <th className="px-2 py-1.5">ความเร็วต้น (m/s)</th>
              <th className="px-2 py-1.5">ความเร็วปลาย (m/s)</th>
              <th className="px-2 py-1.5">P ก่อนชน</th>
              <th className="px-2 py-1.5">P หลังชน</th>
              <th className="px-2 py-1.5 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {dataPoints.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">ไม่มีข้อมูลบันทึก</td>
              </tr>
            ) : (
              dataPoints.map((point) => (
                <tr key={point.index} className="hover:bg-slate-50/50">
                  <td className="px-2 py-1.5 font-mono">#{point.index}</td>
                  <td className="px-2 py-1.5 font-sans">
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                      point.type === "Elastic" ? "bg-cyan-50 text-cyan-700 border border-cyan-100" : "bg-orange-50 text-orange-700 border border-orange-100"
                    }`}>
                      {point.type === "Elastic" ? "ยืดหยุ่น" : "ไม่ยืดหยุ่น"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 font-mono text-slate-700">{point.m1.toFixed(1)} / {point.m2.toFixed(1)}</td>
                  <td className="px-2 py-1.5 font-mono text-blue-600">{point.u1.toFixed(1)} / {point.u2.toFixed(1)}</td>
                  <td className="px-2 py-1.5 font-mono text-emerald-600">{point.v1.toFixed(2)} / {point.v2.toFixed(2)}</td>
                  <td className="px-2 py-1.5 font-mono text-violet-750">{point.pBefore.toFixed(2)}</td>
                  <td className="px-2 py-1.5 font-mono text-emerald-700">{point.pAfter.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-center">
                    <button onClick={() => onClearPoint(point.index)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MomentumTheoryPanel({
  m1,
  m2,
  u1,
  u2,
  v1,
  v2,
  collisionType,
  hasCollided,
}: {
  m1: number;
  m2: number;
  u1: number;
  u2: number;
  v1: number;
  v2: number;
  collisionType: "Elastic" | "Inelastic";
  hasCollided: boolean;
}) {
  const pBefore = m1 * u1 + m2 * u2;
  const pAfter = hasCollided ? m1 * v1 + m2 * v2 : pBefore;

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Target className="h-4.5 w-4.5 text-violet-600" />
        กฎการอนุรักษ์โมเมนตัม
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-3 text-center text-[13px] font-black text-slate-800 font-mono">
          <p className="text-violet-700 mb-1">ΣP_before = ΣP_after</p>
          <p className="text-[11px] text-slate-500 font-normal">m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂</p>
        </div>
        <p className="text-[11px] font-semibold leading-relaxed text-slate-500 leading-[1.6]">
          เมื่อไม่มีแรงภายนอกมากระทำต่อระบบ ผลรวมของโมเมนตัมของวัตถุก่อนการชนจะเท่ากับผลรวมของโมเมนตัมของวัตถุหลังการชนเสมอ
        </p>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1">ประเภท: <b className="text-violet-600">{collisionType === "Elastic" ? "ชนแบบยืดหยุ่น" : "ชนแบบไม่ยืดหยุ่น"}</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">P ก่อนชน: <b className="text-blue-700">{pBefore.toFixed(2)} kg·m/s</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">P หลังชน: <b className="text-emerald-700">{pAfter.toFixed(2)} kg·m/s</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">ความเร็วปลาย: <b className="text-amber-700">{hasCollided ? `${v1.toFixed(2)} m/s` : "รอชน"}</b></span>
        </div>
      </div>
    </section>
  );
}

export default function MomentumConservationSimulation() {

  // Physics inputs
  const [m1, setM1] = useState(2.0); // 1.0 to 5.0 kg
  const [m2, setM2] = useState(2.0); // 1.0 to 5.0 kg
  const [u1, setU1] = useState(2.0); // -5.0 to 5.0 m/s
  const [u2, setU2] = useState(0.0); // -5.0 to 5.0 m/s
  const [collisionType, setCollisionType] = useState<"Elastic" | "Inelastic">("Inelastic");

  // Dynamic simulation states
  const [isRunning, setIsRunning] = useState(false);
  const [hasCollided, setHasCollided] = useState(false);
  const [collisionEvent, setCollisionEvent] = useState(false); // To trigger a flash effect
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Cart positions (in physical track coordinates, say 0 to 10 meters)
  // Track starts at 0m, ends at 10m.
  const [cart1X, setCart1X] = useState(2.5); // meters
  const [cart2X, setCart2X] = useState(6.5); // meters

  // Current velocities
  const [v1, setV1] = useState(2.0);
  const [v2, setV2] = useState(0.0);

  // History data log
  const [dataPoints, setDataPoints] = useState<MomentumDataPoint[]>([]);

  // Quest success states
  const [questSuccess, setQuestSuccess] = useState(false);

  // Constants
  const cartWidthPhysical = 1.2; // meters

  // Refs for tracking mutable states inside interval loop
  const isRunningRef = useRef(isRunning);
  const hasCollidedRef = useRef(hasCollided);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const cart1XRef = useRef(cart1X);
  const cart2XRef = useRef(cart2X);
  const v1Ref = useRef(v1);
  const v2Ref = useRef(v2);

  const m1Ref = useRef(m1);
  const m2Ref = useRef(m2);
  const u1Ref = useRef(u1);
  const u2Ref = useRef(u2);
  const typeRef = useRef(collisionType);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { hasCollidedRef.current = hasCollided; }, [hasCollided]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { cart1XRef.current = cart1X; }, [cart1X]);
  useEffect(() => { cart2XRef.current = cart2X; }, [cart2X]);
  useEffect(() => { v1Ref.current = v1; }, [v1]);
  useEffect(() => { v2Ref.current = v2; }, [v2]);

  useEffect(() => { m1Ref.current = m1; }, [m1]);
  useEffect(() => { m2Ref.current = m2; }, [m2]);
  useEffect(() => { u1Ref.current = u1; }, [u1]);
  useEffect(() => { u2Ref.current = u2; }, [u2]);
  useEffect(() => { typeRef.current = collisionType; }, [collisionType]);



  // Main ticking animation loop (Run at 60fps-like speed using setInterval)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning) {
      const dt = 0.02; // 20ms step
      timer = setInterval(() => {
        const nextTime = elapsedSecondsRef.current + dt;
        setElapsedSeconds(nextTime);
        elapsedSecondsRef.current = nextTime;

        // Current parameters
        let x1 = cart1XRef.current;
        let x2 = cart2XRef.current;
        let currentV1 = v1Ref.current;
        let currentV2 = v2Ref.current;
        let collided = hasCollidedRef.current;

        // Step positions
        x1 += currentV1 * dt;
        x2 += currentV2 * dt;

        // Check boundary collision for track ends
        if (x1 <= 0.2) {
          x1 = 0.2;
          currentV1 = 0;
        }
        if (x2 + cartWidthPhysical >= 9.8) {
          x2 = 9.8 - cartWidthPhysical;
          currentV2 = 0;
        }

        // Check collision between carts
        if (!collided && x1 + cartWidthPhysical >= x2) {
          collided = true;
          setHasCollided(true);
          hasCollidedRef.current = true;
          setCollisionEvent(true);
          setTimeout(() => setCollisionEvent(false), 200); // flash timeout

          // Adjust positions so they touch exactly
          const mid = (x1 + cartWidthPhysical + x2) / 2;
          x1 = mid - cartWidthPhysical;
          x2 = mid;

          // Physics collision formulas
          const m_1 = m1Ref.current;
          const m_2 = m2Ref.current;
          const u_1 = u1Ref.current;
          const u_2 = u2Ref.current;

          if (typeRef.current === "Inelastic") {
            // Both carts stick together
            const commonV = (m_1 * u_1 + m_2 * u_2) / (m_1 + m_2);
            currentV1 = commonV;
            currentV2 = commonV;
          } else {
            // Elastic collision
            const finalV1 = ((m_1 - m_2) * u_1 + 2 * m_2 * u_2) / (m_1 + m_2);
            const finalV2 = (2 * m_1 * u_1 + (m_2 - m_1) * u_2) / (m_1 + m_2);
            currentV1 = finalV1;
            currentV2 = finalV2;
          }

          setV1(currentV1);
          setV2(currentV2);
          v1Ref.current = currentV1;
          v2Ref.current = currentV2;
        }

        // Update state
        setCart1X(x1);
        setCart2X(x2);
        cart1XRef.current = x1;
        cart2XRef.current = x2;

        // Auto-stop if both carts are stopped or reach ends of track
        if (collided && (
          (currentV1 === 0 && currentV2 === 0) ||
          (x1 <= 0.21 && x2 + cartWidthPhysical >= 9.79) ||
          (currentV1 <= 0 && x1 <= 0.21 && currentV2 >= 0 && x2 + cartWidthPhysical >= 9.79)
        )) {
          setIsRunning(false);
          isRunningRef.current = false;
        }
      }, 20);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  // Actions
  const handleStartStop = () => {
    if (hasCollided) {
      // If already collided, reset position and run
      handleResetPhysicsOnly();
    }
    setIsRunning(!isRunning);
  };

  const handleResetPhysicsOnly = () => {
    setIsRunning(false);
    setHasCollided(false);
    setElapsedSeconds(0);
    setCart1X(2.5);
    setCart2X(6.5);
    setV1(u1);
    setV2(u2);
    cart1XRef.current = 2.5;
    cart2XRef.current = 6.5;
    v1Ref.current = u1;
    v2Ref.current = u2;
    hasCollidedRef.current = false;
    elapsedSecondsRef.current = 0;
  };

  const handleReset = () => {
    setIsRunning(false);
    setHasCollided(false);
    setElapsedSeconds(0);
    setM1(2.0);
    setM2(2.0);
    setU1(2.0);
    setU2(0.0);
    setCollisionType("Inelastic");
    setCart1X(2.5);
    setCart2X(6.5);
    setV1(2.0);
    setV2(0.0);
    cart1XRef.current = 2.5;
    cart2XRef.current = 6.5;
    v1Ref.current = 2.0;
    v2Ref.current = 0.0;
    hasCollidedRef.current = false;
    elapsedSecondsRef.current = 0;
    setDataPoints([]);
  };

  const handleAddPoint = () => {
    const finalV1 = hasCollided ? v1 : u1;
    const finalV2 = hasCollided ? v2 : u2;
    const pB = m1 * u1 + m2 * u2;
    const pA = m1 * finalV1 + m2 * finalV2;

    const newPoint: MomentumDataPoint = {
      index: dataPoints.length + 1,
      type: collisionType,
      m1,
      m2,
      u1,
      u2,
      v1: finalV1,
      v2: finalV2,
      pBefore: pB,
      pAfter: pA,
    };

    setDataPoints((prev) => [...prev, newPoint]);

    // Quest Check: Inelastic collision with final velocity (v) exactly equal to 1.0 m/s
    const isQuestV = Math.abs(finalV1 - 1.0) < 0.02 && Math.abs(finalV2 - 1.0) < 0.02;
    if (collisionType === "Inelastic" && isQuestV && !questSuccess) {
      setQuestSuccess(true);
    }
  };

  const handleClearPoint = (idx: number) => {
    setDataPoints((prev) => prev.filter((p) => p.index !== idx).map((p, i) => ({ ...p, index: i + 1 })));
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    const headers = "จุดวัด,ประเภท,m1 (kg),m2 (kg),u1 (m/s),u2 (m/s),v1 (m/s),v2 (m/s),P_before,P_after\n";
    const rows = dataPoints.map((p) => `${p.index},${p.type},${p.m1},${p.m2},${p.u1},${p.u2},${p.v1.toFixed(3)},${p.v2.toFixed(3)},${p.pBefore.toFixed(3)},${p.pAfter.toFixed(3)}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scisiam_momentum_conservation.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyData = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการคัดลอก!");
      return;
    }
    const content = dataPoints
      .map((p) => `จุดที่ ${p.index} | ชนิด: ${p.type === "Elastic" ? "ยืดหยุ่น" : "ไม่ยืดหยุ่น"} | มวล: ${p.m1}/${p.m2}kg | ความเร็วต้น: ${p.u1}/${p.u2}m/s | ความเร็วปลาย: ${p.v1.toFixed(2)}/${p.v2.toFixed(2)}m/s | Pรวมก่อน: ${p.pBefore.toFixed(2)} | Pรวมหลัง: ${p.pAfter.toFixed(2)}`)
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"));
  };

  const handleSaveResults = async () => {
    if (dataPoints.length === 0) {
      alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล! กรุณากดเริ่มทดลองและเก็บบันทึกข้อมูลก่อน");
      return;
    }

    const experimentData = {
      labId: "momentum-conservation",
      timestamp: new Date().toLocaleString("th-TH"),
      collisionType,
      dataPoints,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_momentum_experiment",
      localPayload: experimentData,
      labId: "momentum-conservation",
      title: "Conservation of Linear Momentum",
      graphPoints: experimentData.dataPoints,
      tableRows: experimentData.dataPoints,
      summary: { dataPointCount: experimentData.dataPoints.length },
      score: Math.min(100, experimentData.dataPoints.length * 20),
    });

    alert("บันทึกข้อมูลการทดลอง (การชนและกฎโมเมนตัม) สำเร็จ! 🎉");
  };

  // Convert physical X coordinates (0 to 10m) to SVG X (40 to 520px)
  const toSvgX = (mX: number) => 40 + (mX / 10) * 480;
  const c1SvgX = toSvgX(cart1X);
  const c2SvgX = toSvgX(cart2X);
  const widthSvg = (cartWidthPhysical / 10) * 480; // ~57.6px

  const timeLabel = `${Math.floor(elapsedSeconds).toString().padStart(2, "0")}:${Math.floor((elapsedSeconds % 1) * 100).toString().padStart(2, "0")}`;

  // Wheel rotation angles (in radians) based on position
  // 1 meter of travel ≈ 5 radians of rotation
  const angle1 = (cart1X * 5) % (2 * Math.PI);
  const angle2 = (cart2X * 5) % (2 * Math.PI);

  // Dynamic collision point
  const collisionX = toSvgX((cart1X + cartWidthPhysical + cart2X) / 2);

  const scene = (
    <div className="relative flex h-full min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eefcff_48%,#fff7fb_100%)] p-4">
      {/* Dynamic tech grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      {/* Futuristic ambient background glows */}
      <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-blue-500/5 blur-[80px]" />
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-rose-500/5 blur-[80px]" />
      {collisionEvent && (
        <div className="absolute inset-0 bg-amber-500/5 z-0 animate-pulse duration-75" />
      )}

      {/* Live status badge */}
      <div className="absolute left-5 top-5 rounded-xl border border-slate-200 bg-white/75 px-3 py-1.5 text-left shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isRunning ? "bg-green-500 animate-ping" : hasCollided ? "bg-amber-500" : "bg-blue-500"}`} />
          <p className="text-[9px] font-black uppercase tracking-wider text-violet-650">collision stage v1.2</p>
        </div>
        <p className="mt-0.5 text-xs font-black text-slate-700">
          {!hasCollided ? "รางระดับพลังงานจลน์" : "หลังเกิดการชนเชิงเส้น"}
        </p>
      </div>

      <svg className="relative z-10 w-full max-w-[520px] h-52 select-none" viewBox="0 0 560 200">
        <defs>
          {/* Gradients */}
          <linearGradient id="metalTrackGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="20%" stopColor="#f1f5f9" />
            <stop offset="40%" stopColor="#64748b" />
            <stop offset="80%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="railGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="cart1Grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="40%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="cart2Grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="40%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          <linearGradient id="weightSteel" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="25%" stopColor="#cbd5e1" />
            <stop offset="75%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="weightBrass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="75%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id="wheelHubGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="vector1Grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="vector2Grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0.9" />
          </linearGradient>

          <radialGradient id="collisionGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
            <stop offset="35%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#dc2626" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </radialGradient>

          {/* Filters */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#020617" floodOpacity="0.6" />
          </filter>

          <filter id="laserGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Grid Floor */}
        <line x1="20" y1="185" x2="540" y2="185" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="20" y1="192" x2="540" y2="192" stroke="#94a3b8" strokeWidth="1" />

        {/* Support Pillar Legs */}
        {/* Left Stand */}
        <path d="M 30 145 L 20 185 L 40 185 Z" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="15" y="185" width="30" height="4" rx="1" fill="#0f172a" />
        {/* Right Stand */}
        <path d="M 530 145 L 520 185 L 540 185 Z" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="515" y="185" width="30" height="4" rx="1" fill="#0f172a" />

        {/* Laser Gate Sensors (Photo-gates) */}
        {/* Left Gate (x = 2.0m) */}
        <g transform="translate(136, 60)">
          <path d="M -5 85 L -5 0 L 10 0 L 10 12 L 0 12 L 0 85 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <circle cx="2.5" cy="6" r="2.5" fill={isRunning ? "#22c55e" : "#ef4444"} filter="url(#laserGlow)" />
          {/* Laser beam */}
          <line x1="2.5" y1="12" x2="2.5" y2="85" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" opacity={isRunning ? 0.8 : 0.35} filter="url(#laserGlow)" />
        </g>
        {/* Right Gate (x = 8.0m) */}
        <g transform="translate(424, 60)">
          <path d="M -5 85 L -5 0 L 10 0 L 10 12 L 0 12 L 0 85 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <circle cx="2.5" cy="6" r="2.5" fill={isRunning ? "#22c55e" : "#ef4444"} filter="url(#laserGlow)" />
          {/* Laser beam */}
          <line x1="2.5" y1="12" x2="2.5" y2="85" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" opacity={isRunning ? 0.8 : 0.35} filter="url(#laserGlow)" />
        </g>

        {/* Main Aluminum Air Track Rail */}
        <rect x="20" y="145" width="520" height="14" rx="3" fill="url(#metalTrackGrad)" filter="url(#dropShadow)" />
        <rect x="25" y="142" width="510" height="3" fill="url(#railGrad)" rx="1" />

        {/* Scale Metric Ticks & Distance Labels */}
        {Array.from({ length: 21 }).map((_, i) => {
          const tickX = toSvgX(i * 0.5);
          const isMajor = i % 2 === 0;
          return (
            <g key={i}>
              <line
                x1={tickX}
                y1="145"
                x2={tickX}
                y2={isMajor ? "156" : "151"}
                stroke={isMajor ? "#475569" : "#94a3b8"}
                strokeWidth={isMajor ? "1.5" : "1"}
                opacity={isMajor ? "0.9" : "0.7"}
              />
              {isMajor && (
                <text
                  x={tickX}
                  y="166"
                  fill="#64748b"
                  fontSize="6.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {(i * 0.5).toFixed(1)}m
                </text>
              )}
            </g>
          );
        })}

        {/* Magnetic End Buffer Springs */}
        {/* Left Bumper */}
        <rect x="20" y="132" width="6" height="13" fill="#334155" rx="1" />
        <path d="M 26 135 Q 31 133 30 138 T 34 138" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Right Bumper */}
        <rect x="534" y="132" width="6" height="13" fill="#334155" rx="1" />
        <path d="M 534 135 Q 529 133 530 138 T 526 138" fill="none" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Instrument Panels (Speed readouts inside SVG canvas) */}
        {/* Speed Board 1 (Blue Panel) */}
        <g transform="translate(30, 16)" filter="url(#dropShadow)">
          <rect x="0" y="0" width="105" height="34" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
          <rect x="2" y="2" width="101" height="11" rx="6" fill="#1d4ed8" opacity="0.15" />
          <text x="52" y="10" fill="#3b82f6" fontSize="6" fontWeight="black" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">VELOCITY C1</text>
          <text x="52" y="27" fill="#60a5fa" fontSize="13" fontWeight="950" fontFamily="monospace" textAnchor="middle" filter="url(#laserGlow)">
            {(hasCollided ? v1 : u1).toFixed(2)} <tspan fontSize="8">m/s</tspan>
          </text>
        </g>
        {/* Speed Board 2 (Rose Panel) */}
        <g transform="translate(425, 16)" filter="url(#dropShadow)">
          <rect x="0" y="0" width="105" height="34" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
          <rect x="2" y="2" width="101" height="11" rx="6" fill="#e11d48" opacity="0.15" />
          <text x="52" y="10" fill="#f43f5e" fontSize="6" fontWeight="black" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">VELOCITY C2</text>
          <text x="52" y="27" fill="#fb7185" fontSize="13" fontWeight="950" fontFamily="monospace" textAnchor="middle" filter="url(#laserGlow)">
            {(hasCollided ? v2 : u2).toFixed(2)} <tspan fontSize="8">m/s</tspan>
          </text>
        </g>

        {/* Cart 1 (Blue) */}
        <g transform={`translate(${c1SvgX}, 98)`} filter="url(#dropShadow)">
          {/* Custom vector speed arrow */}
          {!hasCollided && u1 !== 0 && (
            <g>
              <line
                x1={widthSvg / 2}
                y1="-22"
                x2={widthSvg / 2 + u1 * 14}
                y2="-22"
                stroke="url(#vector1Grad)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d={u1 > 0
                  ? `M ${widthSvg / 2 + u1 * 14} -22 L ${widthSvg / 2 + u1 * 14 - 5} -25 L ${widthSvg / 2 + u1 * 14 + 1} -22 L ${widthSvg / 2 + u1 * 14 - 5} -19 Z`
                  : `M ${widthSvg / 2 + u1 * 14} -22 L ${widthSvg / 2 + u1 * 14 + 5} -25 L ${widthSvg / 2 + u1 * 14 - 1} -22 L ${widthSvg / 2 + u1 * 14 + 5} -19 Z`
                }
                fill="#3b82f6"
              />
              <text x={widthSvg / 2 + u1 * 7} y="-28" fill="#2563eb" fontSize="7.5" fontWeight="black" fontFamily="monospace" textAnchor="middle">
                {u1 > 0 ? "+" : ""}{u1.toFixed(1)}
              </text>
            </g>
          )}

          {/* Cart Bumper Hook */}
          {collisionType === "Elastic" ? (
            // Elastic wire bumper loop
            <path d={`M ${widthSvg} 14 Q ${widthSvg + 6} 8 ${widthSvg} 22`} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          ) : (
            // Inelastic velcro needle lock
            <rect x={widthSvg} y="15" width="4" height="4" fill="#64748b" stroke="#1e293b" strokeWidth="1" />
          )}

          {/* Cart chassis body */}
          <rect x="0" y="5" width={widthSvg} height="30" rx="6" fill="url(#cart1Grad)" stroke="#1d4ed8" strokeWidth="2" />

          {/* LED Active Strip */}
          <rect x="6" y="19" width={widthSvg - 12} height="3" rx="1.5" fill="#020617" />
          <rect
            x="8"
            y="20"
            width={widthSvg - 16}
            height="1"
            rx="0.5"
            fill={hasCollided ? "#f59e0b" : isRunning ? "#22c55e" : "#3b82f6"}
            filter="url(#laserGlow)"
          />

          {/* Tray and Stacked Weights */}
          <rect x="7" y="4" width={widthSvg - 14} height="2" fill="#1e293b" />
          {Array.from({ length: Math.round(m1 * 2) }).map((_, weightIdx) => {
            const slabH = 3.5;
            const slabY = 4 - (weightIdx + 1) * slabH;
            return (
              <rect
                key={weightIdx}
                x="9"
                y={slabY}
                width={widthSvg - 18}
                height={slabH - 0.5}
                rx="1"
                fill="url(#weightSteel)"
                stroke="#334155"
                strokeWidth="0.5"
              />
            );
          })}
          <text x={widthSvg / 2} y="-1" fill="#1e3a8a" fontSize="8" fontWeight="black" fontFamily="sans-serif" textAnchor="middle">
            {m1.toFixed(1)} kg
          </text>

          {/* Wheels with rotation lines */}
          {/* Left Wheel */}
          <g transform={`translate(12, 35)`}>
            <circle cx="0" cy="0" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
            <circle cx="0" cy="0" r="5.5" fill="url(#wheelHubGrad)" />
            <line
              x1={-5 * Math.cos(angle1)}
              y1={-5 * Math.sin(angle1)}
              x2={5 * Math.cos(angle1)}
              y2={5 * Math.sin(angle1)}
              stroke="#334155"
              strokeWidth="1.5"
            />
            <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
          </g>
          {/* Right Wheel */}
          <g transform={`translate(${widthSvg - 12}, 35)`}>
            <circle cx="0" cy="0" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
            <circle cx="0" cy="0" r="5.5" fill="url(#wheelHubGrad)" />
            <line
              x1={-5 * Math.cos(angle1)}
              y1={-5 * Math.sin(angle1)}
              x2={5 * Math.cos(angle1)}
              y2={5 * Math.sin(angle1)}
              stroke="#334155"
              strokeWidth="1.5"
            />
            <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
          </g>

          <text x={widthSvg / 2} y="28" fill="#ffffff" opacity="0.9" fontSize="8.5" fontWeight="950" textAnchor="middle">C1</text>
        </g>

        {/* Cart 2 (Red) */}
        <g transform={`translate(${c2SvgX}, 98)`} filter="url(#dropShadow)">
          {/* Custom vector speed arrow */}
          {!hasCollided && u2 !== 0 && (
            <g>
              <line
                x1={widthSvg / 2}
                y1="-22"
                x2={widthSvg / 2 + u2 * 14}
                y2="-22"
                stroke="url(#vector2Grad)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d={u2 > 0
                  ? `M ${widthSvg / 2 + u2 * 14} -22 L ${widthSvg / 2 + u2 * 14 - 5} -25 L ${widthSvg / 2 + u2 * 14 + 1} -22 L ${widthSvg / 2 + u2 * 14 - 5} -19 Z`
                  : `M ${widthSvg / 2 + u2 * 14} -22 L ${widthSvg / 2 + u2 * 14 + 5} -25 L ${widthSvg / 2 + u2 * 14 - 1} -22 L ${widthSvg / 2 + u2 * 14 + 5} -19 Z`
                }
                fill="#e11d48"
              />
              <text x={widthSvg / 2 + u2 * 7} y="-28" fill="#db2777" fontSize="7.5" fontWeight="black" fontFamily="monospace" textAnchor="middle">
                {u2 > 0 ? "+" : ""}{u2.toFixed(1)}
              </text>
            </g>
          )}

          {/* Cart Bumper Hook */}
          {collisionType === "Elastic" ? (
            // Elastic wire bumper loop
            <path d={`M 0 14 Q -6 8 0 22`} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          ) : (
            // Inelastic velcro socket lock
            <rect x="-4" y="15" width="4" height="4" fill="#334155" stroke="#1e293b" strokeWidth="1" />
          )}

          {/* Cart chassis body */}
          <rect x="0" y="5" width={widthSvg} height="30" rx="6" fill="url(#cart2Grad)" stroke="#b91c1c" strokeWidth="2" />

          {/* LED Active Strip */}
          <rect x="6" y="19" width={widthSvg - 12} height="3" rx="1.5" fill="#020617" />
          <rect
            x="8"
            y="20"
            width={widthSvg - 16}
            height="1"
            rx="0.5"
            fill={hasCollided ? "#f59e0b" : isRunning ? "#22c55e" : "#e11d48"}
            filter="url(#laserGlow)"
          />

          {/* Tray and Stacked Weights */}
          <rect x="7" y="4" width={widthSvg - 14} height="2" fill="#1e293b" />
          {Array.from({ length: Math.round(m2 * 2) }).map((_, weightIdx) => {
            const slabH = 3.5;
            const slabY = 4 - (weightIdx + 1) * slabH;
            return (
              <rect
                key={weightIdx}
                x="9"
                y={slabY}
                width={widthSvg - 18}
                height={slabH - 0.5}
                rx="1"
                fill="url(#weightBrass)"
                stroke="#78350f"
                strokeWidth="0.5"
              />
            );
          })}
          <text x={widthSvg / 2} y="-1" fill="#78350f" fontSize="8" fontWeight="black" fontFamily="sans-serif" textAnchor="middle">
            {m2.toFixed(1)} kg
          </text>

          {/* Wheels with rotation lines */}
          {/* Left Wheel */}
          <g transform={`translate(12, 35)`}>
            <circle cx="0" cy="0" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
            <circle cx="0" cy="0" r="5.5" fill="url(#wheelHubGrad)" />
            <line
              x1={-5 * Math.cos(angle2)}
              y1={-5 * Math.sin(angle2)}
              x2={5 * Math.cos(angle2)}
              y2={5 * Math.sin(angle2)}
              stroke="#334155"
              strokeWidth="1.5"
            />
            <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
          </g>
          {/* Right Wheel */}
          <g transform={`translate(${widthSvg - 12}, 35)`}>
            <circle cx="0" cy="0" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
            <circle cx="0" cy="0" r="5.5" fill="url(#wheelHubGrad)" />
            <line
              x1={-5 * Math.cos(angle2)}
              y1={-5 * Math.sin(angle2)}
              x2={5 * Math.cos(angle2)}
              y2={5 * Math.sin(angle2)}
              stroke="#334155"
              strokeWidth="1.5"
            />
            <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
          </g>

          <text x={widthSvg / 2} y="28" fill="#ffffff" opacity="0.9" fontSize="8.5" fontWeight="950" textAnchor="middle">C2</text>
        </g>

        {/* Dynamic Collision Energy Ripples & Shockwave */}
        {collisionEvent && (
          <g>
            <circle cx={collisionX} cy="133" r="32" fill="url(#collisionGlow)" />
            <circle cx={collisionX} cy="133" r="18" fill="url(#collisionGlow)" />

            {/* Plasma particle rays */}
            <path
              d={`M ${collisionX} 133 L ${collisionX - 16} 113 M ${collisionX} 133 L ${collisionX + 16} 113 M ${collisionX} 133 L ${collisionX - 22} 133 M ${collisionX} 133 L ${collisionX + 22} 133 M ${collisionX} 133 L ${collisionX - 10} 148 M ${collisionX} 133 L ${collisionX + 10} 148`}
              stroke="#fde047"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#laserGlow)"
            />
          </g>
        )}
      </svg>
    </div>
  );

  const controls = (
    <div className="space-y-4">
      {/* Collision Type Selection */}
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
        <span className="text-xs font-bold text-slate-600">💥 ลักษณะการชน (Collision Type)</span>
        <button
          onClick={() => {
            if (isRunning) return;
            setCollisionType(collisionType === "Elastic" ? "Inelastic" : "Elastic");
          }}
          disabled={isRunning}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border cursor-pointer active:scale-95 transition-all ${
            collisionType === "Elastic"
              ? "bg-cyan-500 border-cyan-600 text-white shadow-xs"
              : "bg-orange-500 border-orange-600 text-white shadow-xs"
          }`}
        >
          {collisionType === "Elastic" ? "🟢 ยืดหยุ่นสมบูรณ์ (Elastic)" : "🟠 ไม่ยืดหยุ่น (Inelastic)"}
        </button>
      </div>

      {/* Cart 1 Mass & Velocity */}
      <div className="group bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 select-none space-y-2.5">
        <div className="flex justify-between items-center text-[11px] font-bold">
          <span className="text-blue-600 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            มวลรถเข็น 1 (m₁)
          </span>
          <span className="text-blue-600 font-extrabold bg-blue-50 px-2 py-0.2 rounded">
            {m1.toFixed(1)} kg
          </span>
        </div>
        <input
          type="range"
          min="1.0"
          max="5.0"
          step="0.5"
          value={m1}
          disabled={isRunning}
          onChange={(e) => setM1(Number(e.target.value))}
          className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
        />

        <div className="flex justify-between items-center text-[11px] font-bold">
          <span className="text-blue-600 flex items-center gap-1">
            <ArrowRight className="w-3.5 h-3.5" />
            ความเร็วต้น 1 (u₁)
          </span>
          <span className="text-blue-600 font-extrabold bg-blue-50 px-2 py-0.2 rounded">
            {u1.toFixed(1)} m/s
          </span>
        </div>
        <input
          type="range"
          min="-5.0"
          max="5.0"
          step="0.5"
          value={u1}
          disabled={isRunning}
          onChange={(e) => {
            const val = Number(e.target.value);
            setU1(val);
            if (!isRunning && !hasCollided) {
              setV1(val);
              v1Ref.current = val;
            }
          }}
          className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
        />
      </div>

      {/* Cart 2 Mass & Velocity */}
      <div className="group bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 select-none space-y-2.5">
        <div className="flex justify-between items-center text-[11px] font-bold">
          <span className="text-rose-600 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            มวลรถเข็น 2 (m₂)
          </span>
          <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.2 rounded">
            {m2.toFixed(1)} kg
          </span>
        </div>
        <input
          type="range"
          min="1.0"
          max="5.0"
          step="0.5"
          value={m2}
          disabled={isRunning}
          onChange={(e) => setM2(Number(e.target.value))}
          className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-rose-500 disabled:opacity-50"
        />

        <div className="flex justify-between items-center text-[11px] font-bold">
          <span className="text-rose-600 flex items-center gap-1">
            <ArrowRight className="w-3.5 h-3.5" />
            ความเร็วต้น 2 (u₂)
          </span>
          <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.2 rounded">
            {u2.toFixed(1)} m/s
          </span>
        </div>
        <input
          type="range"
          min="-5.0"
          max="5.0"
          step="0.5"
          value={u2}
          disabled={isRunning}
          onChange={(e) => {
            const val = Number(e.target.value);
            setU2(val);
            if (!isRunning && !hasCollided) {
              setV2(val);
              v2Ref.current = val;
            }
          }}
          className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-rose-500 disabled:opacity-50"
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${isRunning ? "bg-slate-700" : "bg-violet-600 hover:bg-violet-750"}`}>
          {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
          {isRunning ? "หยุดเคลื่อนที่" : "เริ่มชนรถ"}
        </button>
        <button onClick={handleAddPoint} className="inline-flex items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-xs font-black text-violet-700 hover:bg-violet-100 cursor-pointer">บันทึกจุด</button>
        <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer" aria-label="รีเซ็ต">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="violet"
      labId="momentum-conservation"
      category="Physics"
      title="Conservation of Linear Momentum"
      subtitle="ทดลองยึดหลักกฎการอนุรักษ์โมเมนตัมโดยการชนของรถสองคันบนรางเปรียบเทียบค่าความเร็ว การชนแบบยืดหยุ่นและไม่ยืดหยุ่น เพื่อพิสูจน์ผลรวมทางคณิตศาสตร์"
      statusLabel={isRunning ? "กำลังเคลื่อนที่" : hasCollided ? "ชนเสร็จสิ้น" : "พร้อมชน"}
      icon={RefreshCw}
      sceneTitle="รางทดสอบการชนเชิงเส้นตรง"
      scene={scene}
      controlsTitle="แผงควบคุมมวลและความเร็วรถ"
      controls={controls}
      compactControls={
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            { label: "มวลรถ 1", value: m1, set: setM1, min: 1, max: 5, step: 0.5, unit: "kg", tone: "accent-blue-500" },
            { label: "ความเร็วรถ 1", value: u1, set: setU1, min: -5, max: 5, step: 0.5, unit: "m/s", tone: "accent-blue-500" },
            { label: "มวลรถ 2", value: m2, set: setM2, min: 1, max: 5, step: 0.5, unit: "kg", tone: "accent-rose-500" },
            { label: "ความเร็วรถ 2", value: u2, set: setU2, min: -5, max: 5, step: 0.5, unit: "m/s", tone: "accent-rose-500" },
          ].map((control) => (
            <label key={control.label} className="rounded-xl bg-slate-50 p-2 text-xs font-black text-slate-700">
              <span className="mb-1 flex justify-between gap-2"><span>{control.label}</span><span>{control.value.toFixed(1)} {control.unit}</span></span>
              <input aria-label={control.label} disabled={isRunning} type="range" min={control.min} max={control.max} step={control.step} value={control.value} onChange={(event) => control.set(Number(event.target.value))} className={`w-full ${control.tone}`} />
            </label>
          ))}
        </div>
      }
      metrics={[
        { label: "ความเร็ว Cart1", value: `${(hasCollided ? v1 : u1).toFixed(2)} m/s`, tone: "blue" },
        { label: "ความเร็ว Cart2", value: `${(hasCollided ? v2 : u2).toFixed(2)} m/s`, tone: "rose" },
        { label: "P ก่อนชนรวม", value: `${(m1 * u1 + m2 * u2).toFixed(2)} kg·m/s`, tone: "violet" },
        { label: "เวลา", value: timeLabel, tone: "cyan" },
      ]}
      graph={
        <MomentumGraph
          m1={m1}
          m2={m2}
          u1={u1}
          u2={u2}
          v1={v1}
          v2={v2}
          hasCollided={hasCollided}
        />
      }
      table={
        <MomentumTable
          dataPoints={dataPoints}
          onClearPoint={handleClearPoint}
          onCopyData={handleCopyData}
          onExportCSV={handleExportCSV}
        />
      }
      theory={
        <MomentumTheoryPanel
          m1={m1}
          m2={m2}
          u1={u1}
          u2={u2}
          v1={v1}
          v2={v2}
          collisionType={collisionType}
          hasCollided={hasCollided}
        />
      }
      steps={[
        { label: "กำหนดมวลรถ 1 & 2", icon: Sliders },
        { label: "ตั้งความเร็วต้นชนกัน", icon: Sliders },
        { label: "เลือกสับแบบการชน", icon: Flame },
        { label: "เริ่มปล่อยรถเข้าชน", icon: Play },
        { label: "บันทึกและวิเคราะห์ค่า", icon: ClipboardList },
      ]}
      learningGoals={[
        "พิสูจน์กฎการอนุรักษ์โมเมนตัมในระบบปิด",
        "เปรียบเทียบการชนแบบยืดหยุ่นและไม่ยืดหยุ่น",
        "ศึกษาผลกระทบของการเปลี่ยนมวลที่มีต่อความเร็วปลาย",
        "วิเคราะห์การถ่ายโอนพลังงานจลน์และการยุบรวมความเร็ว",
      ]}
      progressLabel="สถานะความสำเร็จภารกิจชนรถ"
      progressValue={questSuccess ? "สำเร็จเรียบร้อย" : "ยังไม่เสร็จสิ้น"}
      progressPercent={questSuccess ? 100 : 0}
      tips={[
        "ภารกิจ: ชนแบบไม่ยืดหยุ่น (Inelastic) ให้ความเร็วปลาย v มีค่าเท่ากับ 1.0 m/s พอดิบพอดี แล้วกดบันทึกจุด",
        "ตัวอย่าง: ตั้งค่ามวล m1=2.0kg u1=2.0m/s และมวล m2=2.0kg u2=0.0m/s ในโหมดไม่ยืดหยุ่น",
        "ในโหมดชนแบบยืดหยุ่น รถทั้งสองคันจะแยกทิศทางกันหลังชนโดยอนุรักษ์พลังงานจลน์",
        "กด บันทึกจุด เพื่อบันทึกผลการคำนวณโมเมนตัมลงในตารางบันทึกผลสำหรับการเปรียบเทียบเป้าหมายการเรียนรู้",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดเคลื่อนที่" : "ทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
