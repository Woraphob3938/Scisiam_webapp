"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  RotateCcw,
  Sliders,
  ClipboardList,
  Trash,
  Download,
  Clipboard,
  Zap,
  Move,
  Lightbulb,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface FaradayDataPoint {
  index: number;
  turns: number;
  strength: number;
  speed: number;
  peakVoltage: number;
  bulbGlow: string;
}

export default function FaradaysLawSimulation() {
  const router = useRouter();

  // Controls
  const [turns, setTurns] = useState<number>(3); // N = 1, 2, 3
  const [strength, setStrength] = useState<number>(100); // 20% to 100%
  const [magnetX, setMagnetX] = useState<number>(15); // Magnet position 0 to 100 (x-coordinate slider)

  // Simulation state variables
  const [voltage, setVoltage] = useState<number>(0.0);
  const [bulbBrightness, setBulbBrightness] = useState<number>(0.0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  
  // Real-time graph points for scrolling plot (length ~ 100)
  const [graphPoints, setGraphPoints] = useState<number[]>(Array(100).fill(0));
  
  // Logged points table
  const [dataPoints, setDataPoints] = useState<FaradayDataPoint[]>([]);

  // Quest tracking
  const [peakVoltageCount, setPeakVoltageCount] = useState<number>(0);
  const [questSuccess, setQuestSuccess] = useState<boolean>(false);
  const lastPeakRegisteredTime = useRef<number>(0);

  // Dragging states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartX = useRef<number>(0);
  const dragStartMagnetX = useRef<number>(0);

  // Physical calculation variables
  const lastMagnetX = useRef<number>(15);
  const lastUpdateTime = useRef<number>(0);
  const voltagePeakThisRun = useRef<number>(0);

  // Loop references
  const turnsRef = useRef(turns);
  const strengthRef = useRef(strength);
  const magnetXRef = useRef(magnetX);
  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const peakVoltageCountRef = useRef(peakVoltageCount);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { turnsRef.current = turns; }, [turns]);
  useEffect(() => { strengthRef.current = strength; }, [strength]);
  useEffect(() => { magnetXRef.current = magnetX; }, [magnetX]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { peakVoltageCountRef.current = peakVoltageCount; }, [peakVoltageCount]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Handle magnetic induction calculations based on position change (dPhi/dt)
  const tickPhysics = (currentX: number) => {
    const now = Date.now();
    const dt = lastUpdateTime.current === 0 ? 0.016 : (now - lastUpdateTime.current) / 1000.0; // in seconds
    if (dt <= 0) return;

    const dx = currentX - lastMagnetX.current;
    const velocity = dx / dt; // units per second

    // Coil center is situated at x = 60
    const coilCenter = 60;
    
    // Spatial flux distribution: bell curve representing magnetic flux through coil
    // Phi(x) = exp(-((x - coilCenter) / 16)^2)
    // dPhi/dx = -2 * (x - coilCenter) / (16^2) * exp(-((x - coilCenter) / 16)^2)
    const distanceToCoil = currentX - coilCenter;
    const spatialDerivative = -2.0 * (distanceToCoil / 256.0) * Math.exp(-Math.pow(distanceToCoil / 16.0, 2));

    // EMF = -N * dPhi/dt = -N * (dPhi/dx) * (dx/dt)
    // Adjust scale factor to make it interactive and yield logical values (e.g. -10V to +10V)
    const scaleFactor = 0.5;
    const rawVoltage = -turnsRef.current * (strengthRef.current / 100.0) * spatialDerivative * velocity * scaleFactor;
    
    // Clamp voltage to voltmeter limits (-10V to 10V)
    const clampedVoltage = Math.max(-10.0, Math.min(10.0, rawVoltage));
    
    // Filament brightness proportional to absolute voltage magnitude
    const brightness = Math.min(1.0, Math.abs(clampedVoltage) / 8.0);

    setVoltage(clampedVoltage);
    setBulbBrightness(brightness);

    if (Math.abs(clampedVoltage) > voltagePeakThisRun.current) {
      voltagePeakThisRun.current = Math.abs(clampedVoltage);
    }

    // Quest Check: Induce a peak voltage >= 8.0 V continuously for 5 times
    if (Math.abs(clampedVoltage) >= 8.0 && now - lastPeakRegisteredTime.current > 600) {
      const nextCount = peakVoltageCountRef.current + 1;
      setPeakVoltageCount(nextCount);
      peakVoltageCountRef.current = nextCount;
      lastPeakRegisteredTime.current = now;

      if (nextCount >= 5 && !questSuccessRef.current) {
        setQuestSuccess(true);
        questSuccessRef.current = true;
        const currentPoints = Number(localStorage.getItem("scisiam_points") || "120");
        localStorage.setItem("scisiam_points", String(currentPoints + 25));
        window.dispatchEvent(new Event("points-updated"));
        alert("🎉 ภารกิจสำเร็จ! เหนี่ยวนำแรงดันไฟฟ้าสูงสุด >= 8.0 V ครบ 5 ครั้งสำเร็จ! ได้รับ +25 แต้ม 💎");
      }
    }

    // Record variables for next frame
    lastMagnetX.current = currentX;
    lastUpdateTime.current = now;
  };

  // Scroll real-time voltage plot graph
  useEffect(() => {
    let animId: number;
    const updateGraph = () => {
      if (isRunningRef.current) {
        setGraphPoints((prev) => {
          const copy = [...prev.slice(1)];
          // Decay current voltage slightly towards 0 if no updates are actively happening
          copy.push(voltage);
          return copy;
        });
      }
      animId = requestAnimationFrame(updateGraph);
    };
    animId = requestAnimationFrame(updateGraph);
    return () => cancelAnimationFrame(animId);
  }, [voltage]);

  // Main ticking timer to decay voltage if magnet is static
  useEffect(() => {
    const timer = setInterval(() => {
      if (isRunningRef.current) {
        const delta = 0.05;
        setElapsedSeconds((prev) => prev + delta);
        
        // Decay voltage back to zero representing static state
        const decayRate = 0.85;
        setVoltage((prev) => prev * decayRate);
        setBulbBrightness((prev) => prev * decayRate);
        lastUpdateTime.current = Date.now();
        lastMagnetX.current = magnetXRef.current;
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  // Slider change handling
  const handlePositionSlider = (val: number) => {
    setMagnetX(val);
    tickPhysics(val);
  };

  // Mouse drag handling inside SVG for tactile premium physics feel
  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement;
    if (target.closest(".draggable-magnet")) {
      setIsDragging(true);
      dragStartX.current = e.clientX;
      dragStartMagnetX.current = magnetX;
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const deltaPx = e.clientX - dragStartX.current;
    
    // Scale pixel movement to magnet position 0-100 (assuming SVG width of 500px, 1px ~ 0.2 units)
    const scaleFactor = 0.22;
    const nextMagnetX = Math.max(0, Math.min(100, dragStartMagnetX.current + deltaPx * scaleFactor));
    
    setMagnetX(nextMagnetX);
    tickPhysics(nextMagnetX);
  };

  const handleSvgMouseUp = () => {
    setIsDragging(false);
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(true);
    setVoltage(0.0);
    setBulbBrightness(0.0);
    setMagnetX(15);
    setTurns(3);
    setStrength(100);
    setElapsedSeconds(0);
    setGraphPoints(Array(100).fill(0));
    setDataPoints([]);
    setPeakVoltageCount(0);
    setQuestSuccess(false);
    lastMagnetX.current = 15;
    lastUpdateTime.current = Date.now();
    voltagePeakThisRun.current = 0;
  };

  const handleAddPoint = () => {
    const currentPeak = Math.max(0.01, voltagePeakThisRun.current);
    const glows = currentPeak >= 8 ? "เจิดจ้ามาก" : currentPeak >= 4 ? "สว่างปกติ" : currentPeak >= 1 ? "สลัว" : "ไม่ติด";

    const newPoint: FaradayDataPoint = {
      index: dataPoints.length + 1,
      turns,
      strength,
      speed: Math.round(currentPeak * 12),
      peakVoltage: currentPeak,
      bulbGlow: glows,
    };

    setDataPoints((prev) => [...prev, newPoint]);
    // Reset peak tracker for next measurement
    voltagePeakThisRun.current = 0;
  };

  const handleClearPoint = (idx: number) => {
    setDataPoints((prev) => prev.filter((p) => p.index !== idx).map((p, i) => ({ ...p, index: i + 1 })));
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    const headers = "จุดวัด,จำนวนขดลวด N,ความแรงแม่เหล็ก (%),ความเร็วสัมพัทธ์,แรงดันสูงสุด (V),การสว่างของหลอด\n";
    const rows = dataPoints.map((p) => `${p.index},${p.turns},${p.strength},${p.speed},${p.peakVoltage.toFixed(2)},${p.bulbGlow}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scisiam_faradays_law.csv`);
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
      .map((p) => `จุดที่ ${p.index} | ขดลวด: ${p.turns} รอบ | ความแรงแม่เหล็ก: ${p.strength}% | แรงดันเหนี่ยวนำสูงสุด: ${p.peakVoltage.toFixed(2)}V | หลอดไฟ: ${p.bulbGlow}`)
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"));
  };

  const handleSaveResults = async () => {
    if (dataPoints.length === 0) {
      alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล! กรุณากดเริ่มทดลองและเก็บบันทึกข้อมูลก่อน");
      return;
    }

    const experimentData = {
      labId: "faradays-law",
      timestamp: new Date().toLocaleString("th-TH"),
      turns,
      strength,
      dataPoints,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_faradays_experiment",
      localPayload: experimentData,
      labId: "faradays-law",
      title: "Faraday's Electromagnetic Induction",
      graphPoints: experimentData.dataPoints,
      tableRows: experimentData.dataPoints,
      summary: { dataPointCount: experimentData.dataPoints.length },
      score: Math.min(100, experimentData.dataPoints.length * 20),
    });

    alert("บันทึกข้อมูลการทดลอง (การเหนี่ยวนำแม่เหล็กไฟฟ้า) สำเร็จ! 🎉");
    router.push(`/labs/faradays-law`);
  };

  // SVG Coordinates
  // Map magnetX (0 to 100) to SVG Magnet translate X (-40px to 320px)
  const magnetSvgX = -40 + (magnetX / 100) * 360;

  // Render voltage graph lines
  const graphPath = useMemo(() => {
    return graphPoints
      .map((val, idx) => {
        // x ranges 15 to 185 px
        // y ranges 25 to 105 px (center is 65px, range +/- 40px)
        const x = 15 + (idx / 100) * 170;
        const y = 65 - val * 4.0;
        return `${idx === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }, [graphPoints]);



  const scene = (
    <div className="relative flex h-full min-h-[258px] items-center justify-center overflow-hidden rounded-2xl border border-cyan-100 bg-[linear-gradient(135deg,#f2fdff_0%,#ecfaff_48%,#f6f8ff_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      
      {/* Draggable indicator hint */}
      <div className="absolute right-5 top-5 rounded-2xl border border-white/70 bg-white/75 px-3 py-1.5 text-left shadow-sm backdrop-blur flex items-center gap-1.5 animate-pulse">
        <Move className="w-3.5 h-3.5 text-cyan-600" />
        <span className="text-[10px] font-black text-cyan-600">DRAG MAGNET INSIDE SCENE</span>
      </div>

      <svg
        className="relative z-10 w-full max-w-[500px] h-48 select-none cursor-grab active:cursor-grabbing"
        viewBox="0 0 500 200"
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onMouseLeave={handleSvgMouseUp}
      >
        {/* Wire Connections to Bulb & Voltmeter */}
        {/* Path to Bulb */}
        <path d="M 280 110 L 280 50 L 330 50" stroke="#b45309" strokeWidth="2" strokeDasharray={bulbBrightness > 0.05 ? "4 2" : "none"} fill="none" />
        <path d="M 300 130 L 300 70 L 330 70" stroke="#b45309" strokeWidth="2" strokeDasharray={bulbBrightness > 0.05 ? "4 2" : "none"} fill="none" />

        {/* Path to Voltmeter */}
        <path d="M 280 110 L 280 160 L 360 160" stroke="#334155" strokeWidth="1.8" fill="none" />
        <path d="M 300 130 L 300 175 L 360 175" stroke="#334155" strokeWidth="1.8" fill="none" />

        {/* Voltmeter Gauge */}
        <g transform="translate(370, 140)">
          <rect x="0" y="0" width="80" height="50" rx="6" fill="#1e293b" stroke="#0891b2" strokeWidth="1.5" />
          <path d="M 15 35 A 25 25 0 0 1 65 35" stroke="#cbd5e1" strokeWidth="2" fill="none" />
          
          {/* Voltage ticks */}
          <line x1="20" y1="31" x2="24" y2="28" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="40" y1="18" x2="40" y2="23" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="60" y1="31" x2="56" y2="28" stroke="#22c55e" strokeWidth="1.5" />
          
          <text x="40" y="44" fill="#22d3ee" fontSize="7.5" fontWeight="950" textAnchor="middle">
            {voltage.toFixed(1)} V
          </text>
          
          {/* Needle based on voltage (-10V to 10V maps to -60deg to 60deg) */}
          <g transform={`translate(40, 35) rotate(${voltage * 6})`}>
            <line x1="0" y1="0" x2="0" y2="-22" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
        </g>

        {/* Light Bulb */}
        <g transform="translate(340, 45)">
          <circle cx="20" cy="15" r="16" fill={bulbBrightness > 0.05 ? "rgba(253, 224, 71, 0.2)" : "none"} />
          
          {/* Bulb glowing overlay SVG filter or simple circles */}
          {bulbBrightness > 0.05 && (
            <circle
              cx="20"
              cy="15"
              r={12 + bulbBrightness * 25}
              fill="url(#bulbGlowRadial)"
              opacity={bulbBrightness * 0.8}
            />
          )}

          {/* Bulb base */}
          <rect x="14" y="27" width="12" height="8" fill="#94a3b8" rx="1" />
          <rect x="16" y="35" width="8" height="4" fill="#475569" />

          {/* Filament */}
          <path d="M 12 27 L 16 18 L 24 18 L 28 27" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
          <path d="M 16 18 Q 20 10 24 18" stroke={bulbBrightness > 0.05 ? "#fef08a" : "#cbd5e1"} strokeWidth="2.5" fill="none" />

          {/* Glass body */}
          <path d="M 10 25 C 2 18 5 0 20 0 C 35 0 38 18 30 25 C 29 27 27 27 27 27 L 13 27 C 13 27 11 27 10 25 Z" stroke="#64748b" strokeWidth="1.5" fill="none" />
          
          <Lightbulb className={`absolute left-2.5 top-1.5 w-5 h-5 transition-all duration-300 ${bulbBrightness > 0.05 ? "text-yellow-400 stroke-[2.5]" : "text-slate-400"}`} />
        </g>

        {/* Coil Loops (Center at x = 285) */}
        {/* We loop N times to draw the front/back layers of coils */}
        <g transform="translate(260, 80)">
          {/* Back loops of coil */}
          {Array.from({ length: turns }).map((_, i) => {
            const spacing = 14;
            const xOffset = i * spacing;
            return (
              <path
                key={`coil-back-${i}`}
                d={`M ${10 + xOffset} 10 Q ${10 + xOffset} 0 ${20 + xOffset} 0 T ${30 + xOffset} 10`}
                stroke="#d97706"
                strokeWidth="3.5"
                fill="none"
                opacity="0.95"
              />
            );
          })}

          {/* Front loops of coil (drawn over the magnet when it enters) */}
          {Array.from({ length: turns }).map((_, i) => {
            const spacing = 14;
            const xOffset = i * spacing;
            return (
              <path
                key={`coil-front-${i}`}
                d={`M ${10 + xOffset} 10 Q ${10 + xOffset} 50 ${20 + xOffset} 50 T ${30 + xOffset} 10`}
                stroke="#f59e0b"
                strokeWidth="4.5"
                fill="none"
                opacity="0.95"
                className="relative z-20"
              />
            );
          })}

          {/* Labels for coil loops */}
          <text x="25" y="66" fill="#78350f" fontSize="7" fontWeight="black" textAnchor="middle">
            {turns} TURNS
          </text>
        </g>

        {/* Bar Magnet (Draggable) */}
        <g
          transform={`translate(${magnetSvgX}, 75)`}
          className="draggable-magnet select-none cursor-grab active:cursor-grabbing group relative z-10"
        >
          {/* Field Lines (flowing curved loops emanating from N and S) */}
          {strength > 0 && (
            <g opacity={strength / 140} stroke="#0891b2" strokeWidth="1.2" strokeDasharray="3 3" fill="none">
              <path d="M 40 25 C -50 -50 170 -50 80 25" />
              <path d="M 40 25 C -70 -90 190 -90 80 25" />
              <path d="M 40 25 C -50 100 170 100 80 25" />
              <path d="M 40 25 C -70 140 190 140 80 25" />
            </g>
          )}

          {/* S Pole (Blue) */}
          <rect x="0" y="10" width="60" height="30" rx="3" fill="#1d4ed8" stroke="#172554" strokeWidth="2" />
          <text x="30" y="30" fill="#ffffff" fontSize="13" fontWeight="950" textAnchor="middle">S</text>

          {/* N Pole (Red) */}
          <rect x="60" y="10" width="60" height="30" rx="3" fill="#dc2626" stroke="#450a0a" strokeWidth="2" />
          <text x="90" y="30" fill="#ffffff" fontSize="13" fontWeight="950" textAnchor="middle">N</text>

          {/* Grip Icon */}
          <g transform="translate(50, 20)">
            <circle cx="10" cy="5" r="2.5" fill="rgba(255,255,255,0.7)" />
            <circle cx="10" cy="15" r="2.5" fill="rgba(255,255,255,0.7)" />
          </g>
        </g>

        {/* Linear Track under Magnet */}
        <line x1="30" y1="130" x2="350" y2="130" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <circle cx="30" cy="130" r="4" fill="#64748b" />
        <circle cx="350" cy="130" r="4" fill="#64748b" />

        {/* Gradient Definition for Glow */}
        <defs>
          <radialGradient id="bulbGlowRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
            <stop offset="60%" stopColor="#fef08a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );

  const controls = (
    <div className="space-y-4">
      {/* Position Slider (Backup or alternative control) */}
      <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 select-none space-y-1">
        <div className="flex justify-between items-center text-[11px] font-bold">
          <span className="text-cyan-600 flex items-center gap-1">
            <Move className="w-3.5 h-3.5" />
            เลื่อนแม่เหล็ก (Magnet X Position)
          </span>
          <span className="text-cyan-600 font-extrabold bg-cyan-50 px-2 py-0.2 rounded">
            {magnetX.toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={magnetX}
          onChange={(e) => handlePositionSlider(Number(e.target.value))}
          className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      {/* Coil Turns turns Selection */}
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
        <span className="text-xs font-bold text-slate-600">🌀 จำนวนรอบของขดลวด (N)</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setTurns(num)}
              className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer active:scale-95 ${
                turns === num 
                  ? "bg-amber-500 text-white shadow-xs" 
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {num} รอบ
            </button>
          ))}
        </div>
      </div>

      {/* Strength control */}
      <div className="group bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 select-none space-y-2">
        <div className="flex justify-between items-center text-[11px] font-bold">
          <span className="text-cyan-600 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-500" />
            ความแรงแม่เหล็ก (Strength)
          </span>
          <span className="text-cyan-600 font-extrabold bg-cyan-50 px-2 py-0.2 rounded">
            {strength.toFixed(0)} %
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="100"
          step="10"
          value={strength}
          onChange={(e) => setStrength(Number(e.target.value))}
          className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      {/* Action panel */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button onClick={handleStartStop} className={`col-span-1 inline-flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-black text-white shadow-sm ${isRunning ? "bg-slate-700" : "bg-cyan-600"}`}>
          {isRunning ? "พักกราฟ" : "เริ่มกราฟ"}
        </button>
        <button onClick={handleAddPoint} className="inline-flex items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-xs font-black text-cyan-700 hover:bg-cyan-100 cursor-pointer">
          บันทึกจุดวัด
        </button>
        <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-250 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="cyan"
      labId="faradays-law"
      category="Physics"
      title="Faraday's Electromagnetic Induction"
      subtitle="จำลองการเคลื่อนที่แม่เหล็กผ่านขดลวดเพื่อเหนี่ยวนำให้เกิดกระแสไฟฟ้า วิเคราะห์ความสัมพันธ์ของกระแสเหนี่ยวนำกับทิศทาง จำนวนรอบขดลวด และความเร็ว"
      statusLabel={isDragging ? "เหนี่ยวนำไฟฟ้า" : "พร้อมเหนี่ยวนำ"}
      icon={Zap}
      sceneTitle="ห้องเรียนไฟฟ้าเหนี่ยวนำเหนือกฏ Lenz"
      scene={scene}
      controlsTitle="แผงควบคุมฟลักซ์ขดลวด"
      controls={controls}
      metrics={[
        { label: "แรงดันเหนี่ยวนำ", value: `${voltage.toFixed(2)} V`, tone: voltage >= 0 ? "emerald" : "rose" },
        { label: "จังหวะไฟสว่าง", value: bulbBrightness > 0.6 ? "เจืดจ้า" : bulbBrightness > 0.2 ? "สว่างสลัว" : "ดับสนิท", tone: "orange" },
        { label: "ความแรงแม่เหล็ก", value: `${strength}%`, tone: "cyan" },
        { label: "รอบขดลวด N", value: `${turns} รอบ`, tone: "violet" },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Zap className="h-4.5 w-4.5 text-cyan-600 animate-pulse" />
              กราฟความต่างศักย์เหนี่ยวนำเรียลไทม์ (V-t Graph)
            </h3>
            <span className="text-[10px] font-bold text-cyan-650">EMF vs Time</span>
          </div>
          <div className="flex-1 rounded-xl bg-slate-950 p-3 flex flex-col justify-between">
            <svg className="w-full h-full min-h-[174px]" viewBox="0 0 200 120" fill="none">
              <line x1="15" y1="65" x2="185" y2="65" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <line x1="15" y1="25" x2="185" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="15" y1="105" x2="185" y2="105" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              <text x="12" y="27" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">+10V</text>
              <text x="12" y="67" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0V</text>
              <text x="12" y="107" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">-10V</text>

              {graphPath && (
                <path d={graphPath} stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              )}
            </svg>
          </div>
        </section>
      }
      table={
        <ResultsTable
          dataPoints={dataPoints}
          onClearPoint={handleClearPoint}
          onCopyData={handleCopyData}
          onExportCSV={handleExportCSV}
        />
      }
      theory={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
            <Zap className="h-4.5 w-4.5 text-cyan-600" />
            สมการเหนี่ยวนำของฟาราเดย์
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3">
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3 text-center text-[13px] font-black text-slate-800 font-mono">
              <p className="text-cyan-700">ε = -N (dΦ / dt)</p>
            </div>
            <p className="text-[11px] font-semibold leading-relaxed text-slate-500 leading-[1.6]">
              แรงเคลื่อนไฟฟ้าเหนี่ยวนำ (ε) แปรผันตรงกับจำนวนรอบขดลวด (N) และอัตราการเปลี่ยนแปลงฟลักซ์แม่เหล็กเทียบกับเวลา (dΦ/dt) โดยมีทิศทางต้านแรงเดิมตามกฎของเลนซ์
            </p>
            <div className="rounded-md bg-slate-50 p-2 text-[10px] font-bold text-slate-500 text-center">
              ลากแม่เหล็กเร็วขึ้น = เพิ่ม dΦ/dt = แรงดันกระเพื่อมสูงขึ้น
            </div>
          </div>
        </section>
      }
      steps={[
        { label: "เลือกจำนวนขดลวด N", icon: Sliders },
        { label: "ปรับความเข้มแม่เหล็ก", icon: Sliders },
        { label: "ลากแม่เหล็กเข้า-ออกขด", icon: Move },
        { label: "สังเกตเข็ม Volt/ความสว่าง", icon: Lightbulb },
        { label: "บันทึกกราฟค่าเหนี่ยวนำ", icon: ClipboardList },
      ]}
      learningGoals={[
        "อธิบายการเกิดกระแสเหนี่ยวนำและการสว่างของหลอดไฟ",
        "สังเกตความต่างศักย์กลับทิศทางตามกฎเลนซ์ Lenz's Law",
        "วิเคราะห์ปัจจัยความเร็วลากและจำนวนขดลวดต่อศักย์ไฟฟ้า",
        "ตีความกราฟคลื่นกระแสสลับ (AC Waveform) เหนี่ยวนำ",
      ]}
      progressLabel="ขยับผลิตไฟฟ้ากระตุกสูงสำเร็จ"
      progressValue={`${peakVoltageCount} / 5 ครั้ง (>= 8.0V)`}
      progressPercent={(peakVoltageCount / 5) * 100}
      tips={[
        "ภารกิจ: ลากแม่เหล็กเข้าและออกขดลวดอย่างรวดเร็วเพื่อให้ได้แรงดันเหนี่ยวนำสัมบูรณ์ >= 8.0 V จำนวน 5 ครั้ง เพื่อรับคะแนนพิเศษ",
        "ลากแม่เหล็กผ่านแกนกลางของขดลวดด้วยความเร็วสูงเพื่อเหนี่ยวนำให้เกิดแรงดันไฟฟ้ามากที่สุด",
        "สังเกตว่าเมื่อแม่เหล็กหยุดนิ่ง ค่าแรงดันไฟฟ้าจะกลับสู่ 0 ทันที เนื่องจากไม่มีการเปลี่ยนแปลงฟลักซ์",
        "เปรียบเทียบผลลัพธ์ระหว่างขดลวด 1 รอบ และ 3 รอบ ภายใต้การขยับด้วยความเร็วเท่ากัน",
      ]}
      onSave={handleSaveResults}
    />
  );
}

// Sub tables component
function ResultsTable({
  dataPoints,
  onClearPoint,
  onCopyData,
  onExportCSV,
}: {
  dataPoints: FaradayDataPoint[];
  onClearPoint: (idx: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-cyan-600" />
          ตารางกระแสเหนี่ยวนำ
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
          <thead className="bg-cyan-50/70 text-[10px] font-black text-cyan-850 sticky top-0">
            <tr>
              <th className="px-2.5 py-1.5">จุด</th>
              <th className="px-2.5 py-1.5">ขดลวด N</th>
              <th className="px-2.5 py-1.5">ความแรง (%)</th>
              <th className="px-2.5 py-1.5">แรงดันพีค (V)</th>
              <th className="px-2.5 py-1.5">ความสว่างหลอด</th>
              <th className="px-2.5 py-1.5 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {dataPoints.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">ไม่มีข้อมูลบันทึก</td>
              </tr>
            ) : (
              dataPoints.map((point) => (
                <tr key={point.index} className="hover:bg-slate-50/50">
                  <td className="px-2.5 py-1.5 font-mono">#{point.index}</td>
                  <td className="px-2.5 py-1.5 font-mono text-cyan-700">{point.turns} รอบ</td>
                  <td className="px-2.5 py-1.5 font-mono text-slate-600">{point.strength}%</td>
                  <td className="px-2.5 py-1.5 font-mono text-emerald-600">{point.peakVoltage.toFixed(2)} V</td>
                  <td className="px-2.5 py-1.5 text-amber-600 font-sans">{point.bulbGlow}</td>
                  <td className="px-2.5 py-1.5 text-center">
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
