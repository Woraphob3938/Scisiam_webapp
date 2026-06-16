"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
      alert("🎉 ภารกิจสำเร็จ! ตั้งค่าการชนแบบไม่ยืดหยุ่นให้ได้ความเร็วปลายร่วมกัน v = 1.0 m/s บันทึกผลเพื่อเก็บความคืบหน้า");
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
    router.push(`/labs/momentum-conservation`);
  };

  // Convert physical X coordinates (0 to 10m) to SVG X (40 to 520px)
  const toSvgX = (mX: number) => 40 + (mX / 10) * 480;
  const c1SvgX = toSvgX(cart1X);
  const c2SvgX = toSvgX(cart2X);
  const widthSvg = (cartWidthPhysical / 10) * 480; // ~57.6px

  const timeLabel = `${Math.floor(elapsedSeconds).toString().padStart(2, "0")}:${Math.floor((elapsedSeconds % 1) * 100).toString().padStart(2, "0")}`;

  const scene = (
    <div className="relative flex h-full min-h-[258px] items-center justify-center overflow-hidden rounded-2xl border border-violet-100 bg-[linear-gradient(135deg,#fcfaff_0%,#f5f3ff_48%,#fdfaff_100%)]">
      {/* Dynamic collision flash */}
      {collisionEvent && (
        <div className="absolute inset-0 bg-violet-400/25 z-0 animate-ping" />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      
      {/* Live metrics overlay */}
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/75 px-3 py-2 text-left shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-violet-600">collision simulator</p>
        <p className="mt-0.5 text-xs font-bold text-slate-600">
          {!hasCollided ? "Approaching Collision" : "Post-Collision State"}
        </p>
      </div>

      <svg className="relative z-10 w-full max-w-[500px] h-48 select-none" viewBox="0 0 560 200">
        {/* Track wood guard rails */}
        <rect x="25" y="145" width="510" height="20" rx="3" fill="#8c6239" stroke="#5c3f19" strokeWidth="2.5" />
        
        {/* Track lines ticks */}
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={i}
            x1={toSvgX(i)}
            y1="145"
            x2={toSvgX(i)}
            y2="157"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.7"
          />
        ))}

        {/* Speed indicators texts */}
        <g transform="translate(30, 20)">
          <rect x="0" y="0" width="100" height="32" rx="10" fill="#ffffff" stroke="#ddd6fe" strokeWidth="1.5" />
          <text x="50" y="13" fill="#64748b" fontSize="6.5" fontWeight="black" textAnchor="middle">CART 1 SPEED</text>
          <text x="50" y="26" fill="#3b82f6" fontSize="11" fontWeight="black" textAnchor="middle">
            {(hasCollided ? v1 : u1).toFixed(2)} m/s
          </text>
        </g>
        <g transform="translate(430, 20)">
          <rect x="0" y="0" width="100" height="32" rx="10" fill="#ffffff" stroke="#ddd6fe" strokeWidth="1.5" />
          <text x="50" y="13" fill="#64748b" fontSize="6.5" fontWeight="black" textAnchor="middle">CART 2 SPEED</text>
          <text x="50" y="26" fill="#ef4444" fontSize="11" fontWeight="black" textAnchor="middle">
            {(hasCollided ? v2 : u2).toFixed(2)} m/s
          </text>
        </g>

        {/* Cart 1 (Blue/Violet) */}
        <g transform={`translate(${c1SvgX}, 90)`}>
          <rect x="0" y="0" width={widthSvg} height="35" rx="5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2.5" />
          {/* Load box representing mass */}
          <rect x={12} y="-12" width={widthSvg - 24} height="12" rx="2" fill="#93c5fd" stroke="#1d4ed8" strokeWidth="1.5" />
          <text x={widthSvg / 2} y="-2" fill="#1e3a8a" fontSize="8.5" fontWeight="950" textAnchor="middle">{m1.toFixed(1)} kg</text>
          
          {/* Wheels */}
          <circle cx="12" cy="40" r="7" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="12" cy="40" r="2.5" fill="#ffffff" />
          <circle cx={widthSvg - 12} cy="40" r="7" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx={widthSvg - 12} cy="40" r="2.5" fill="#ffffff" />

          {/* Velocity arrow vector */}
          {!hasCollided && u1 !== 0 && (
            <path
              d={`M ${widthSvg / 2} -22 L ${widthSvg / 2 + u1 * 12} -22 ${
                u1 > 0 ? `l -5 -4 v 8 z` : `l 5 -4 v 8 z`
              }`}
              fill="#2563eb"
            />
          )}
          <text x={widthSvg / 2} y="22" fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">Cart 1</text>
        </g>

        {/* Cart 2 (Red/Orange) */}
        <g transform={`translate(${c2SvgX}, 90)`}>
          <rect x="0" y="0" width={widthSvg} height="35" rx="5" fill="#ef4444" stroke="#b91c1c" strokeWidth="2.5" />
          {/* Load box representing mass */}
          <rect x={12} y="-12" width={widthSvg - 24} height="12" rx="2" fill="#fca5a5" stroke="#b91c1c" strokeWidth="1.5" />
          <text x={widthSvg / 2} y="-2" fill="#7f1d1d" fontSize="8.5" fontWeight="950" textAnchor="middle">{m2.toFixed(1)} kg</text>
          
          {/* Wheels */}
          <circle cx="12" cy="40" r="7" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="12" cy="40" r="2.5" fill="#ffffff" />
          <circle cx={widthSvg - 12} cy="40" r="7" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx={widthSvg - 12} cy="40" r="2.5" fill="#ffffff" />

          {/* Velocity arrow vector */}
          {!hasCollided && u2 !== 0 && (
            <path
              d={`M ${widthSvg / 2} -22 L ${widthSvg / 2 + u2 * 12} -22 ${
                u2 > 0 ? `l -5 -4 v 8 z` : `l 5 -4 v 8 z`
              }`}
              fill="#dc2626"
            />
          )}
          <text x={widthSvg / 2} y="22" fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">Cart 2</text>
        </g>

        {/* Shock/Flash star at collision point */}
        {collisionEvent && (
          <path
            d={`M ${toSvgX((cart1X + cartWidthPhysical + cart2X) / 2)} 100 l 5 -15 l 10 10 l 15 -15 l -10 25 l 15 10 l -25 5 l -10 15 l -5 -20 l -15 5 z`}
            fill="#eab308"
            stroke="#f97316"
            strokeWidth="1.5"
          />
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
        "ภารกิจ: ชนแบบไม่ยืดหยุ่น (Inelastic) ให้ความเร็วปลาย v มีค่าเท่ากับ 1.0 m/s พอดิบพอดี แล้วกด บันทึกจุด เพื่อรับคะแนน",
        "ตัวอย่าง: ตั้งค่ามวล m1=2.0kg u1=2.0m/s และมวล m2=2.0kg u2=0.0m/s ในโหมดไม่ยืดหยุ่น",
        "ในโหมดชนแบบยืดหยุ่น รถทั้งสองคันจะแยกทิศทางกันหลังชนโดยอนุรักษ์พลังงานจลน์",
        "กด บันทึกจุด เพื่อบันทึกผลการคำนวณโมเมนตัมลงในตารางบันทึกผลสำหรับการเปรียบเทียบเป้าหมายการเรียนรู้",
      ]}
      onSave={handleSaveResults}
    />
  );
}
