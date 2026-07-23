"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Compass,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sliders,
  Sun,
  Target,
  Zap,
} from "lucide-react";

interface SnellPoint {
  n1: number;
  n2: number;
  angle1: number;
  angle2: number;
  sin1: number;
  sin2: number;
  isTIR: boolean;
}

function OpticalScene({
  n1,
  n2,
  angle1,
  angle2,
  isTIR,
}: {
  n1: number;
  n2: number;
  angle1: number;
  angle2: number;
  isTIR: boolean;
}) {
  // Center is (280, 180)
  // Incident ray comes from top-left at angle1 relative to normal (normal is vertical at x=280)
  // angle1 is in degrees, convert to radians
  const rad1 = (angle1 * Math.PI) / 180;
  const rad2 = (angle2 * Math.PI) / 180;

  // Let's compute endpoints of rays
  const rayLength = 140;

  // Incident ray (originates in top-left, goes to center (280,180))
  // Relative to vertical normal, x is -sin(rad1), y is -cos(rad1) (since top-left is x < 280, y < 180)
  const incidentX = 280 - rayLength * Math.sin(rad1);
  const incidentY = 180 - rayLength * Math.cos(rad1);

  // Refracted ray (goes into bottom-right, x is sin(rad2), y is cos(rad2))
  const refractX = 280 + rayLength * Math.sin(rad2);
  const refractY = 180 + rayLength * Math.cos(rad2);

  // Reflected ray (goes into top-right if TIR or partially reflected, x is sin(rad1), y is -cos(rad1))
  const reflectX = 280 + rayLength * Math.sin(rad1);
  const reflectY = 180 - rayLength * Math.cos(rad1);

  return (
    <div className="relative flex h-full min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eff6ff_48%,#f8fafc_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-left shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-blue-600">optical interface</p>
        <p className="mt-0.5 text-xs font-bold text-slate-600">
          {isTIR ? "Total Internal Reflection" : "Refraction occurring"}
        </p>
      </div>

      <svg className="relative z-10 h-full max-h-[360px] w-full max-w-[620px]" viewBox="0 0 560 360" fill="none" role="img" aria-label="โต๊ะทดลองการหักเหของแสง แสดงลำแสง เส้นแนวฉาก และมุมในตัวกลางสองชนิด">
        <defs>
          <linearGradient id="snell-air" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
            <stop offset="1" stopColor="#e0f2fe" stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="snell-medium" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bfdbfe" stopOpacity="0.62" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0.32" />
          </linearGradient>
          <filter id="snell-beam-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        {/* Background mediums split */}
        {/* Medium 1 - Top Half */}
        <rect x="20" y="20" width="520" height="160" fill="url(#snell-air)" rx="18" />
        {/* Medium 2 - Bottom Half */}
        <rect x="20" y="180" width="520" height="160" fill="url(#snell-medium)" rx="18" />
        <path d="M20 201C82 188 134 214 196 201C258 188 310 214 372 201C434 188 486 214 540 201" stroke="#7dd3fc" strokeWidth="2" opacity="0.65" />

        {/* Medium boundary line */}
        <line x1="20" y1="180" x2="540" y2="180" stroke="#3b82f6" strokeWidth="4" strokeDasharray="none" />
        <rect x="214" y="168" width="132" height="24" rx="12" fill="#ffffff" stroke="#93c5fd" strokeWidth="2" />
        <text x="280" y="184" fill="#1d4ed8" fontSize="9" fontWeight="900" textAnchor="middle">รอยต่อระหว่างตัวกลาง</text>

        {/* Medium Text labels */}
        <text x="35" y="45" fill="#475569" fontSize="11" fontWeight="800">ตัวกลางที่ 1 (ด้านบน): n₁ = {n1.toFixed(2)}</text>
        <text x="35" y="325" fill="#1e40af" fontSize="11" fontWeight="800">ตัวกลางที่ 2 (ด้านล่าง): n₂ = {n2.toFixed(2)}</text>

        {/* Normal line (Vertical dashed line through center (280, 180)) */}
        <line x1="280" y1="30" x2="280" y2="330" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" />
        <text x="290" y="45" fill="#94a3b8" fontSize="9" fontWeight="800">เส้นแนวฉาก</text>

        {/* Protractors / Degree lines circles */}
        <circle cx="280" cy="180" r="100" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="280" cy="180" r="140" stroke="#94a3b8" strokeWidth="1.5" opacity="0.3" />

        {/* Laser Gun source */}
        <g transform={`translate(${incidentX}, ${incidentY}) rotate(${90 - angle1} 0 0)`}>
          <rect x="-24" y="-10" width="48" height="20" rx="4" fill="#ef4444" stroke="#b91c1c" strokeWidth="2.5" />
          <rect x="24" y="-4" width="8" height="8" rx="1" fill="#475569" />
          <circle cx="-12" cy="0" r="3" fill="#ffffff" />
          <line x1="24" y1="0" x2="35" y2="0" stroke="#b91c1c" strokeWidth="2" />
        </g>

        {/* Light Rays */}
        {/* Incident Ray (Laser to Center) */}
        <line x1={incidentX} y1={incidentY} x2="280" y2="180" stroke="#fb7185" strokeWidth="10" strokeLinecap="round" opacity="0.22" filter="url(#snell-beam-glow)" />
        <line x1={incidentX} y1={incidentY} x2="280" y2="180" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />
        {/* Incident ray glow */}
        <line x1={incidentX} y1={incidentY} x2="280" y2="180" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" opacity="0.25" />

        {/* Normal Refracted Ray or TIR Reflected Ray */}
        {isTIR ? (
          <>
            {/* Fully Reflected Ray */}
            <line x1="280" y1="180" x2={reflectX} y2={reflectY} stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="280" y1="180" x2={reflectX} y2={reflectY} stroke="#ef4444" strokeWidth="8" strokeLinecap="round" opacity="0.25" />
            {/* TIR Indicator Text */}
            <text x="280" y="220" fill="#ef4444" fontSize="13" fontWeight="950" textAnchor="middle" className="animate-pulse">สะท้อนกลับหมด!</text>
          </>
        ) : (
          <>
            {/* Refracted Ray */}
            <line x1="280" y1="180" x2={refractX} y2={refractY} stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="280" y1="180" x2={refractX} y2={refractY} stroke="#34d399" strokeWidth="10" strokeLinecap="round" opacity="0.2" filter="url(#snell-beam-glow)" />
            <line x1="280" y1="180" x2={refractX} y2={refractY} stroke="#34d399" strokeWidth="8" strokeLinecap="round" opacity="0.25" />

            {/* Faint reflected ray (Fresnel reflection) */}
            {angle1 > 0 && (
              <line x1="280" y1="180" x2={reflectX} y2={reflectY} stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            )}
          </>
        )}

        {/* Center Point */}
        <circle cx="280" cy="180" r="5.5" fill="#facc15" stroke="#d97706" strokeWidth="1.5" />
        <g transform="translate(414 264)">
          <rect width="110" height="58" rx="16" fill="#ffffff" stroke={isTIR ? "#fecaca" : "#a7f3d0"} strokeWidth="2.5" />
          <text x="55" y="20" fill="#64748b" fontSize="9" fontWeight="900" textAnchor="middle">ผลที่สังเกตได้</text>
          <text x="55" y="42" fill={isTIR ? "#dc2626" : "#047857"} fontSize="13" fontWeight="900" textAnchor="middle">
            {isTIR ? "สะท้อนกลับหมด" : `หักเห ${angle2.toFixed(1)}°`}
          </text>
        </g>

        {/* Angle indicator arcs and texts */}
        {angle1 > 5 && (
          <g>
            {/* Incidence angle arc */}
            <path
              d={`M 280,140 A 40,40 0 0,0 ${280 - 40 * Math.sin(rad1)},${180 - 40 * Math.cos(rad1)}`}
              stroke="#ef4444"
              strokeWidth="2"
              fill="none"
            />
            <text
              x={280 - 55 * Math.sin(rad1 / 2)}
              y={180 - 55 * Math.cos(rad1 / 2)}
              fill="#b91c1c"
              fontSize="10"
              fontWeight="900"
              textAnchor="middle"
            >
              θ₁={angle1.toFixed(0)}°
            </text>
          </g>
        )}

        {!isTIR && angle2 > 5 && (
          <g>
            {/* Refraction angle arc */}
            <path
              d={`M 280,220 A 40,40 0 0,0 ${280 + 40 * Math.sin(rad2)},${180 + 40 * Math.cos(rad2)}`}
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
            />
            <text
              x={280 + 55 * Math.sin(rad2 / 2)}
              y={180 + 55 * Math.cos(rad2 / 2)}
              fill="#047857"
              fontSize="10"
              fontWeight="900"
              textAnchor="middle"
            >
              θ₂={angle2.toFixed(0)}°
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function SnellGraph({ points }: { points: SnellPoint[] }) {
  // X: sin(θ₁) (0 to 1) -> 32 to 284 px
  // Y: sin(θ₂) (0 to 1) -> 138 to 26 px
  const x = React.useCallback((sin1: number) => 32 + sin1 * 252, []);
  const y = React.useCallback((sin2: number) => 138 - sin2 * 112, []);

  const path = useMemo(() => {
    if (points.length === 0) return "";
    // Sort points by sin1 for drawing
    const sorted = [...points].sort((a, b) => a.sin1 - b.sin1);
    return sorted.map((p, idx) => `${idx === 0 ? "M" : "L"}${x(p.sin1)},${y(p.sin2)}`).join(" ");
  }, [points, x, y]);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <BarChart3 className="h-4.5 w-4.5 text-blue-600" />
          กราฟดัชนีหักเหแสง sin(θ₁) - sin(θ₂)
        </h3>
        <span className="text-[10px] font-bold text-blue-600">Snell&apos;s plot</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-50/70 p-2">
        <svg className="h-full min-h-[174px] w-full" viewBox="0 0 320 170" fill="none" aria-hidden="true">
          {/* Grid lines */}
          <line x1="32" y1="138" x2="284" y2="138" stroke="#cbd5e1" strokeWidth="1.4" />
          <line x1="32" y1="110" x2="284" y2="110" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="82" x2="284" y2="82" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="54" x2="284" y2="54" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="26" x2="284" y2="26" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="22" x2="32" y2="138" stroke="#cbd5e1" strokeWidth="1.4" />
          
          <text x="26" y="29" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">1.0</text>
          <text x="26" y="85" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">0.5</text>
          <text x="26" y="141" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">0.0</text>

          {path && <path d={path} stroke="#3b82f6" strokeWidth="2.6" strokeLinecap="round" fill="none" />}

          {points.map((point, index) => (
            <circle
              key={`${point.angle1}-${index}`}
              cx={x(point.sin1)}
              cy={y(point.sin2)}
              r="3.5"
              fill={point.isTIR ? "#ef4444" : "#10b981"}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}

          <text x="32" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">0.0</text>
          <text x="158" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">0.5</text>
          <text x="284" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">1.0 sin(θ₁)</text>
          <text x="284" y="130" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">sin(θ₂)</text>
        </svg>
      </div>
    </section>
  );
}

export default function SnellsLawSimulation() {

  const [n1, setN1] = useState(1.50); // Medium 1 Index
  const [n2, setN2] = useState(1.00); // Medium 2 Index
  const [angle1, setAngle1] = useState(30); // Angle of Incidence (0 to 90)
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<SnellPoint[]>([]);
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const n1Ref = useRef(n1);
  const n2Ref = useRef(n2);
  const angle1Ref = useRef(angle1);
  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { n1Ref.current = n1; }, [n1]);
  useEffect(() => { n2Ref.current = n2; }, [n2]);
  useEffect(() => { angle1Ref.current = angle1; }, [angle1]);
  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Calculations
  const sin1 = useMemo(() => Math.sin((angle1 * Math.PI) / 180), [angle1]);
  
  // n1 * sin(θ1) = n2 * sin(θ2) => sin(θ2) = (n1 * sin(θ1)) / n2
  const sin2Value = useMemo(() => (n1 * sin1) / n2, [n1, sin1, n2]);
  const isTIR = useMemo(() => sin2Value > 1, [sin2Value]);
  
  const angle2 = useMemo(() => {
    if (isTIR) return angle1; // reflection angle equals incident angle
    return (Math.asin(sin2Value) * 180) / Math.PI;
  }, [sin2Value, isTIR, angle1]);

  const criticalAngle = useMemo(() => {
    if (n1 <= n2) return null;
    return (Math.asin(n2 / n1) * 180) / Math.PI;
  }, [n1, n2]);

  // Main tick loop for scanning / auto-logging or quest tracking
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      const deltaSeconds = 0.1;
      const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
      setElapsedSeconds(nextSeconds);
      elapsedSecondsRef.current = nextSeconds;

      // Quest: Find critical angle for Water (1.33) -> Air (1.00)
      // And trigger TIR (angle1 > 48.8°) for 5 seconds
      const currentN1 = n1Ref.current;
      const currentN2 = n2Ref.current;
      const currentAngle1 = angle1Ref.current;
      
      const isWater = Math.abs(currentN1 - 1.33) < 0.05;
      const isAir = Math.abs(currentN2 - 1.00) < 0.05;
      const isCriticalTIR = currentAngle1 > 48.5 && isTIR;

      if (isWater && isAir && isCriticalTIR) {
        const nextQuestProg = Math.min(5, questProgressRef.current + deltaSeconds);
        setQuestProgress(nextQuestProg);
        questProgressRef.current = nextQuestProg;

        if (nextQuestProg >= 5 && !questSuccessRef.current) {
          setQuestSuccess(true);
          questSuccessRef.current = true;
          alert("🎉 ยินดีด้วย! คุณค้นหามุมวิกฤตของน้ำไปสู่อากาศและสังเกตการสะท้อนกลับหมดได้สำเร็จ บันทึกผลเพื่อเก็บความคืบหน้า");
        }
      } else {
        setQuestProgress(0);
        questProgressRef.current = 0;
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isRunning, isTIR]);

  const makePoint = (a1: number) => {
    const s1 = Math.sin((a1 * Math.PI) / 180);
    const s2Val = (n1 * s1) / n2;
    const tir = s2Val > 1;
    const a2 = tir ? a1 : (Math.asin(s2Val) * 180) / Math.PI;
    return {
      n1,
      n2,
      angle1: a1,
      angle2: a2,
      sin1: s1,
      sin2: tir ? 1.0 : s2Val,
      isTIR: tir,
    };
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleLogPoint = () => {
    const point = makePoint(angle1);
    // Prevent duplicate entries for the exact same angles
    if (dataPoints.some((p) => p.angle1 === angle1 && p.n1 === n1 && p.n2 === n2)) return;
    setDataPoints((prev) => [...prev, point]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setN1(1.50);
    setN2(1.00);
    setAngle1(30);
    setDataPoints([]);
    setQuestProgress(0);
  };

  const handleSave = async () => {
    if (dataPoints.length === 0) {
      alert("ยังไม่มีข้อมูลการทดลองกฎของสเนลล์สำหรับบันทึก กรุณากดบันทึกจุดวัดผลก่อน");
      return;
    }

    const experimentData = {
      labId: "snells-law",
      timestamp: new Date().toLocaleString("th-TH"),
      n1,
      n2,
      dataPoints: dataPoints.map((p) => ({
        angle1: p.angle1,
        angle2: p.angle2,
        n1: p.n1,
        n2: p.n2,
        isTIR: p.isTIR,
      })),
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_snells_experiment",
      localPayload: experimentData,
      labId: "snells-law",
      title: "Snell's Law of Refraction",
      graphPoints: experimentData.dataPoints,
      tableRows: experimentData.dataPoints,
      summary: { dataPointCount: experimentData.dataPoints.length },
      score: Math.min(100, experimentData.dataPoints.length * 20),
    });
    alert("บันทึกผลการทดลองกฎของสเนลล์สำเร็จ! 🎉");
  };

  const visibleRows = dataPoints.slice(-7);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8fafc] pb-12">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-12 md:px-20">
        <div className="flex flex-col gap-5">
          {/* Banner Details */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <section className="space-y-5 lg:col-span-9">
              <div className="relative flex min-h-[164px] items-center overflow-hidden rounded-2xl border border-blue-100 bg-white px-5 py-6 shadow-sm shadow-slate-200/50 sm:px-7">
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Compass className="h-4.5 w-4.5" />
                    </div>
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">Physics</span>
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">พร้อมทดลองจำลองแสง</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-normal text-slate-900">Snell&apos;s Law of Refraction Simulator</h1>
                  <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
                    จำลองแสงเลเซอร์ผ่านสองตัวกลาง ตรวจสอบมุมหักเห วิเคราะห์ความลาดชันของกราฟไซน์ และเรียนรู้การสะท้อนกลับหมด (TIR)
                  </p>
                </div>
              </div>

              {/* Main Workspace Layout */}
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                {/* Apparatus Canvas */}
                <div className="xl:col-span-7">
                  <div className="min-h-[460px] rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-slate-200/50">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-sm font-black text-slate-800">
                        <Compass className="h-4.5 w-4.5 text-blue-600" />
                        แบบจำลองหักเหแสงด้วยปริซึม
                      </h2>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">
                        {isTIR ? "สะท้อนกลับหมด" : "หักเหปกติ"}
                      </span>
                    </div>
                    <OpticalScene n1={n1} n2={n2} angle1={angle1} angle2={angle2} isTIR={isTIR} />
                  </div>
                </div>

                {/* Control Panel */}
                <div className="xl:col-span-5">
                  <section className="flex min-h-[460px] flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/50">
                    <h2 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
                      <Sliders className="h-4.5 w-4.5 text-blue-600" />
                      แผงตั้งค่ามุมและตัวกลาง
                    </h2>
                    <div className="flex-1 space-y-4">
                      {/* n1 Slider */}
                      <label className="block">
                        <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                          <span>ดัชนีหักเหตัวกลาง 1 (n₁)</span>
                          <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">
                            {n1.toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1.00"
                          max="2.00"
                          step="0.01"
                          value={n1}
                          disabled={isRunning}
                          onChange={(e) => setN1(Number(e.target.value))}
                          className="h-1.5 w-full rounded-full bg-slate-100 accent-blue-600 disabled:opacity-45"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                          <span>อากาศ (1.0)</span>
                          <span>น้ำ (1.33)</span>
                          <span>แก้ว (1.5)</span>
                        </div>
                      </label>

                      {/* n2 Slider */}
                      <label className="block">
                        <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                          <span>ดัชนีหักเหตัวกลาง 2 (n₂)</span>
                          <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">
                            {n2.toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1.00"
                          max="2.00"
                          step="0.01"
                          value={n2}
                          disabled={isRunning}
                          onChange={(e) => setN2(Number(e.target.value))}
                          className="h-1.5 w-full rounded-full bg-slate-100 accent-teal-600 disabled:opacity-45"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                          <span>อากาศ (1.0)</span>
                          <span>น้ำ (1.33)</span>
                          <span>แก้ว (1.5)</span>
                        </div>
                      </label>

                      {/* Angle1 Slider */}
                      <label className="block">
                        <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                          <span>มุมตกกระทบ (θ₁)</span>
                          <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">
                            {angle1.toFixed(0)}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          step="1"
                          value={angle1}
                          onChange={(e) => setAngle1(Number(e.target.value))}
                          className="h-1.5 w-full rounded-full bg-slate-100 accent-rose-500"
                        />
                      </label>

                      {/* Info Outputs */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                          <span className="block text-[10px] text-slate-400">มุมหักเห (θ₂)</span>
                          <strong className="text-sm font-black text-slate-800">
                            {isTIR ? "สะท้อนกลับหมด" : `${angle2.toFixed(1)}°`}
                          </strong>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                          <span className="block text-[10px] text-slate-400">มุมวิกฤต (θc)</span>
                          <strong className="text-sm font-black text-slate-800 text-amber-600">
                            {criticalAngle ? `${criticalAngle.toFixed(1)}°` : "ไม่มี"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${isRunning ? "bg-slate-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                        {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
                        {isRunning ? "หยุดจับเวลา" : "เริ่มบันทึกเควส"}
                      </button>
                      <button onClick={handleLogPoint} className="inline-flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xs font-black text-blue-700 hover:bg-blue-100">บันทึกจุด</button>
                      <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="รีเซ็ต">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button onClick={handleSave} className="col-span-4 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-xs font-black text-white hover:bg-green-700">
                        <Save className="h-4 w-4" />
                        บันทึกผลการทดลองหักเหแสง
                      </button>
                    </div>
                  </section>
                </div>
              </div>

              {/* Data Table, Graph & Formula */}
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <SnellGraph points={dataPoints} />
                </div>

                <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 xl:col-span-4">
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                      <ClipboardList className="h-4.5 w-4.5 text-blue-600" />
                      ตารางบันทึกผลการทดลอง
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">{dataPoints.length} จุด</span>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-blue-50/60 text-[11px] font-black text-blue-800">
                        <tr>
                          <th className="px-3 py-2">θ₁ (°)</th>
                          <th className="px-3 py-2">θ₂ (°)</th>
                          <th className="px-3 py-2">sin(θ₁) / sin(θ₂)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                        {visibleRows.map((point, index) => (
                          <tr key={`${point.angle1}-${index}`}>
                            <td className="px-3 py-2 font-mono">{point.angle1.toFixed(0)}°</td>
                            <td className="px-3 py-2 font-mono text-blue-700">
                              {point.isTIR ? "TIR" : `${point.angle2.toFixed(1)}°`}
                            </td>
                            <td className="px-3 py-2 font-mono text-slate-500">
                              {point.isTIR ? "-" : `${(point.sin1 / point.sin2).toFixed(3)}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 xl:col-span-4">
                  <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
                    <Sun className="h-4.5 w-4.5 text-blue-600" />
                    ทฤษฎีและสูตรการคำนวณ
                  </h3>
                  <div className="flex flex-1 flex-col justify-between gap-3">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-center font-mono text-2xl font-black text-slate-800">
                      n₁ sin(θ₁) = n₂ sin(θ₂)
                    </div>
                    <p className="text-xs font-semibold leading-relaxed text-slate-500 leading-relaxed leading-[1.6]">
                      เมื่อแสงเดินทางข้ามตัวกลาง ดัชนีหักเหแสง n สัมพันธ์กับมุมตกกระทบและมุมหักเห หากดัชนีหักเหตัวกลางที่หนึ่งมากกว่าตัวกลางที่สอง แสงจะหักเหเบนออกจากเส้นปกติ
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">n₁: <b className="text-blue-700">{n1.toFixed(2)}</b></span>
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">n₂: <b className="text-teal-700">{n2.toFixed(2)}</b></span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Steps */}
              <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["ตั้งค่าดัชนีหักเห n", Sliders],
                  ["หมุนมุมตกกระทบ", Sliders],
                  ["ตรวจการเกิดหักเห", Compass],
                  ["บันทึกจุดทดลอง", ClipboardList],
                  ["เปรียบเทียบผลลัพธ์", Target],
                ].map(([label, Icon], index) => {
                  const StepIcon = Icon as typeof Sliders;
                  return (
                    <div key={label as string} className="flex items-center gap-3 rounded-xl bg-slate-50/70 px-3 py-2">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <StepIcon className="h-5 w-5" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">{index + 1}</span>
                      </div>
                      <span className="text-xs font-black leading-relaxed text-slate-700">{label as string}</span>
                    </div>
                  );
                })}
              </section>
            </section>

            {/* Sidebar Column */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-3">
              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <Target className="h-4.5 w-4.5 text-blue-600" />
                  เป้าหมายการเรียนรู้
                </h2>
                <ul className="space-y-2.5 text-xs font-semibold leading-relaxed text-slate-500 leading-[1.6]">
                  {["พิสูจน์กฎของสเนลล์ด้วยอัตราส่วน sin(θ₁)/sin(θ₂)", "คำนวณและหาดัชนีหักเหแสงของตัวกลาง", "ทำความเข้าใจเงื่อนไขการเกิดสะท้อนกลับหมด", "หาค่ามุมวิกฤตจากการทดลองจำลอง"].map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Quest section */}
              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                  <Zap className="h-4.5 w-4.5 text-orange-500" />
                  ภารกิจประจำห้องแล็บ
                </h2>
                <p className="text-xs font-semibold text-slate-500 leading-[1.6]">
                  ตั้งค่าดัชนีหักเหตัวกลางที่ 1 เป็นน้ำ (n₁ = 1.33) และตัวกลางที่ 2 เป็นอากาศ (n₂ = 1.00) จากนั้นหมุนมุมตกกระทบให้มากกว่ามุมวิกฤต (48.8°) เพื่อกระตุ้นระบบสะท้อนกลับหมดค้างไว้ 5 วินาที
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-300`}
                      style={{ width: `${(questProgress / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-500">{((questProgress / 5) * 100).toFixed(0)}%</span>
                </div>
                {questSuccess && (
                  <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-100 p-2 text-center text-xs font-bold text-emerald-700">
                    สำเร็จภารกิจการสะท้อนกลับหมดแล้ว
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  คำแนะนำในการทดลอง
                </h2>
                <ul className="space-y-2 text-xs font-semibold leading-relaxed text-slate-500 leading-[1.6]">
                  {["ดัชนี n₁ {'>'} n₂ เท่านั้นถึงจะทำให้เกิดมุมวิกฤตและการสะท้อนกลับหมดได้", "สังเกตความชันของเส้นกราฟจะเท่ากับอัตราส่วน n₂/n₁", "พยายามบันทึกหลาย ๆ จุดในมุมหักเหปกติเพื่อสร้างกราฟที่สมบูรณ์"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
