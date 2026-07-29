"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ClipboardList,
  Trash,
  Download,
  Clipboard,
  Droplet,
  Info,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface BernoulliDataPoint {
  index: number;
  flowRate: number;
  throatWidth: number;
  v1: number;
  v2: number;
  p1: number;
  p2: number;
  state: string;
}

interface Particle {
  id: number;
  x: number;
  yOffset: number; // normalized between -0.8 and 0.8
}

export default function BernoullisPrincipleSimulation() {

  // Controls
  const [flowRate, setFlowRate] = useState<number>(3.0); // Q: 1.0 to 5.0 L/s
  const [throatWidth, setThroatWidth] = useState<number>(50); // A2: 20% to 80% (percentage of inlet width)

  // Simulation loop states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [dataPoints, setDataPoints] = useState<BernoulliDataPoint[]>([]);

  // Quest tracking
  const [questProgress, setQuestProgress] = useState<number>(0); // 0 to 5 seconds
  const [questSuccess, setQuestSuccess] = useState<boolean>(false);

  // Particles array for fluid animation
  const [particles, setParticles] = useState<Particle[]>(() => {
    const list: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      list.push({
        id: i,
        // Distribute along the tube length (30px to 470px)
        x: 30 + Math.random() * 440,
        yOffset: (Math.random() - 0.5) * 1.6, // -0.8 to 0.8
      });
    }
    return list;
  });

  // Refs for tracking mutable states inside interval loop
  const isRunningRef = useRef(isRunning);
  const flowRateRef = useRef(flowRate);
  const throatWidthRef = useRef(throatWidth);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { flowRateRef.current = flowRate; }, [flowRate]);
  useEffect(() => { throatWidthRef.current = throatWidth; }, [throatWidth]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Continuity & Bernoulli calculations
  // Inlet diameter is fixed at 1.0 area equivalent
  // Throat area is fractional: throatWidth / 100
  const a1 = 1.0;
  const a2 = useMemo(() => throatWidth / 100.0, [throatWidth]);

  const v1 = useMemo(() => flowRate / a1, [flowRate]);
  const v2 = useMemo(() => flowRate / a2, [flowRate, a2]);

  const p1 = 180.0; // Fixed inlet pressure (kPa)
  
  // Bernoulli: P1 + 0.5 * rho * v1^2 = P2 + 0.5 * rho * v2^2
  // We apply a scale factor of 4.5 for educational visualization
  const p2 = useMemo(() => {
    const calculatedP2 = p1 - 4.5 * (Math.pow(v2, 2) - Math.pow(v1, 2));
    // Clamp to minimum representing vapor pressure (cavitation limit)
    return Math.max(5.0, calculatedP2);
  }, [v1, v2]);

  const isCavitation = p2 <= 5.0;



  // Spatial width of Venturi tube at x coordinate (range 0 to 500)
  // Wider ends, narrower throat at center x = 250
  const getPipeWidthAtX = (x: number, a2Val: number) => {
    // Inlet width is 100px. Min throat width can drop to 20px (when a2Val = 0.2)
    const baseInletWidth = 90.0;
    const centerFactor = Math.exp(-Math.pow((x - 250) / 75.0, 2)); // Bell curve
    const widthFactor = 1.0 - (1.0 - a2Val) * centerFactor;
    return baseInletWidth * widthFactor;
  };

  // Main ticking animation loop
  useEffect(() => {
    const dt = 0.05; // 50ms step
    const timer = setInterval(() => {
      if (isRunningRef.current) {
        // Increment time
        const nextTime = elapsedSecondsRef.current + dt;
        setElapsedSeconds(nextTime);
        elapsedSecondsRef.current = nextTime;

        // Current parameters
        const q = flowRateRef.current;
        const wRatio = throatWidthRef.current / 100.0;
        
        // Bernoulli calculations for quest check
        const calculatedV1 = q / 1.0;
        const calculatedV2 = q / wRatio;
        const currentP2 = Math.max(5.0, 180.0 - 4.5 * (Math.pow(calculatedV2, 2) - Math.pow(calculatedV1, 2)));

        // Quest Check: Keep the pressure in the throat below 100 kPa for 5 seconds
        if (currentP2 < 100.0) {
          const nextProg = Math.min(5.0, questProgressRef.current + dt);
          setQuestProgress(nextProg);
          questProgressRef.current = nextProg;

          if (nextProg >= 5.0 && !questSuccessRef.current) {
            setQuestSuccess(true);
            questSuccessRef.current = true;
          }
        } else {
          setQuestProgress(0);
          questProgressRef.current = 0;
        }

        // Move particles along the pipe
        setParticles((prev) =>
          prev.map((p) => {
            // Continuity: velocity v(x) = Q / area(x)
            // Area is proportional to the width of the pipe
            const currentWidth = getPipeWidthAtX(p.x, wRatio);
            const particleSpeed = (q * 180.0) / currentWidth;
            
            let nextX = p.x + particleSpeed * dt;
            // Wrap particles around if they flow out of the pipe
            if (nextX > 470) {
              nextX = 30 + (nextX - 470);
            }
            return {
              ...p,
              x: nextX,
            };
          })
        );
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  // Controls actions
  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setFlowRate(3.0);
    setThroatWidth(50);
    setElapsedSeconds(0);
    setQuestProgress(0);
    setQuestSuccess(false);
    setDataPoints([]);
  };

  const handleAddPoint = () => {
    const states = isCavitation ? "โพรงไอน้ำ (Cavitation)" : p2 < 100 ? "ความดันต่ำ" : "ปกติ";

    const newPoint: BernoulliDataPoint = {
      index: dataPoints.length + 1,
      flowRate,
      throatWidth,
      v1,
      v2,
      p1,
      p2,
      state: states,
    };

    setDataPoints((prev) => [...prev, newPoint]);
  };

  const handleClearPoint = (idx: number) => {
    setDataPoints((prev) => prev.filter((p) => p.index !== idx).map((p, i) => ({ ...p, index: i + 1 })));
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    const headers = "จุดวัด,อัตราการไหล Q (L/s),ความกว้างคอคอด A2 (%),ความเร็วปากท่อ v1 (m/s),ความเร็วคอคอด v2 (m/s),ความดันปากท่อ P1 (kPa),ความดันคอคอด P2 (kPa),สถานะ\n";
    const rows = dataPoints.map((p) => `${p.index},${p.flowRate},${p.throatWidth},${p.v1.toFixed(2)},${p.v2.toFixed(2)},${p.p1.toFixed(1)},${p.p2.toFixed(1)},${p.state}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scisiam_bernoullis_principle.csv`);
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
      .map((p) => `จุดที่ ${p.index} | ไหล Q: ${p.flowRate}L/s | คอคอด A2: ${p.throatWidth}% | ความเร็ว v1/v2: ${p.v1.toFixed(1)}/${p.v2.toFixed(1)}m/s | ความดัน P1/P2: ${p.p1.toFixed(0)}/${p.p2.toFixed(0)}kPa`)
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"));
  };

  const handleSaveResults = async () => {
    if (dataPoints.length === 0) {
      alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล! กรุณากดเริ่มทดลองและเก็บบันทึกข้อมูลก่อน");
      return;
    }

    const experimentData = {
      labId: "bernoullis-principle",
      timestamp: new Date().toLocaleString("th-TH"),
      flowRate,
      throatWidth,
      dataPoints,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_bernoulli_experiment",
      localPayload: experimentData,
      labId: "bernoullis-principle",
      title: "Bernoulli's Principle & Fluid Dynamics",
      graphPoints: experimentData.dataPoints,
      tableRows: experimentData.dataPoints,
      summary: { dataPointCount: experimentData.dataPoints.length },
      score: Math.min(100, experimentData.dataPoints.length * 20),
    });

  };

  // Generate SVG coordinates for Venturi tube outline dynamically based on throatWidth
  // This uses a multi-segment smooth curve
  const tubeOutlinePath = useMemo(() => {
    const a2Val = throatWidth / 100.0;
    
    // Top border path
    const topPoints = [];
    // Bottom border path
    const botPoints = [];
    
    for (let x = 30; x <= 470; x += 10) {
      const halfWidth = getPipeWidthAtX(x, a2Val) / 2.0;
      topPoints.push(`${x},${100 - halfWidth}`);
      botPoints.unshift(`${x},${100 + halfWidth}`); // Insert backwards for smooth loop
    }
    
    return `M ${topPoints.join(" L ")} L ${botPoints.join(" L ")} Z`;
  }, [throatWidth]);

  // Math coordinates for drawing manometer water levels
  // Manometer heights scale: height extends from water surface in the pipe up to 30px (high pressure)
  // P1 = 180 kPa maps to y=35. P2 = 5 kPa maps to y=85.
  const pressureToGaugeY = (pVal: number) => {
    return 95 - (pVal / 220.0) * 65.0;
  };

  const man1Y = pressureToGaugeY(p1);
  const man2Y = pressureToGaugeY(p2);
  const man3Y = pressureToGaugeY(p1 - 5.0); // Slightly lower due to head loss representation



  const scene = (
    <div
      data-testid="bernoulli-venturi-rig"
      className="relative flex h-full min-h-[320px] items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#ecfdf5_0%,#eff6ff_55%,#f8fafc_100%)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      
      {/* Alert badge if cavitation is happening */}
      {isCavitation && (
        <div className="absolute left-5 top-5 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-left shadow-sm backdrop-blur flex items-center gap-1.5 animate-bounce">
          <Info className="w-3.5 h-3.5 text-rose-600" />
          <span className="text-[10px] font-black text-rose-600 uppercase">CAVITATION (โพรงไอน้ำเดือดเย็น)</span>
        </div>
      )}

      <svg className="relative z-10 h-full min-h-[320px] w-full select-none" viewBox="0 0 720 320" role="img" aria-label="ท่อเวนจูรีแสดงความเร็วและความดันของของไหลที่ปากท่อ คอคอด และทางออก">
        {/* Dynamic colored background representing local pressure inside pipe */}
        {/* Blue represents high pressure, cyan is lower, magenta/purple is extremely low */}
        <defs>
          <linearGradient id="pressureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" /> {/* High P */}
            <stop offset="35%" stopColor="#2563eb" stopOpacity="0.75" />
            <stop offset="50%" stopColor={isCavitation ? "#7c3aed" : "#06b6d4"} stopOpacity="0.8" /> {/* Throat P */}
            <stop offset="65%" stopColor="#2563eb" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <rect x="42" y="26" width="188" height="54" rx="16" fill="#ffffff" fillOpacity=".9" stroke="#a7f3d0" />
        <text x="58" y="48" fill="#059669" fontSize="10" fontWeight="900">VENTURI FLOW BENCH</text>
        <text x="58" y="67" fill="#334155" fontSize="13" fontWeight="800">น้ำไหลผ่านคอคอด · Q {flowRate.toFixed(1)} L/s</text>
        <g transform="translate(110 68)">
        {/* Manometers vertical columns glass tubes */}
        {/* Manometer 1 (x = 120) */}
        <rect x="116" y="25" width="8" height="70" fill="none" stroke="#64748b" strokeWidth="1.5" />
        <rect x="117.5" y={man1Y} width="5" height={95 - man1Y} fill="#93c5fd" opacity="0.8" />

        {/* Manometer 2 (x = 250) */}
        <rect x="246" y="25" width="8" height="70" fill="none" stroke="#64748b" strokeWidth="1.5" />
        <rect x="247.5" y={man2Y} width="5" height={95 - man2Y} fill={isCavitation ? "#c084fc" : "#a5f3fc"} opacity="0.8" />

        {/* Manometer 3 (x = 380) */}
        <rect x="376" y="25" width="8" height="70" fill="none" stroke="#64748b" strokeWidth="1.5" />
        <rect x="377.5" y={man3Y} width="5" height={95 - man3Y} fill="#93c5fd" opacity="0.8" />

        {/* Venturi Tube Fluid Body */}
        <path d={tubeOutlinePath} fill="url(#pressureGradient)" stroke="#334155" strokeWidth="2.5" />

        {/* Animated flow particles */}
        {particles.map((p) => {
          const a2Val = throatWidth / 100.0;
          const halfWidth = getPipeWidthAtX(p.x, a2Val) / 2.0;
          const particleY = 100 + p.yOffset * halfWidth;

          return (
            <circle
              key={p.id}
              cx={p.x}
              cy={particleY}
              r="2.5"
              fill="#ffffff"
              opacity="0.7"
            />
          );
        })}

        {/* Speed indicators overlay vectors */}
        <text x="120" y="170" fill="#1e3a8a" fontSize="7.5" fontWeight="950" textAnchor="middle">
          v₁ = {v1.toFixed(1)} m/s
        </text>
        <text x="250" y="170" fill={isCavitation ? "#6d28d9" : "#0891b2"} fontSize="7.5" fontWeight="950" textAnchor="middle">
          v₂ = {v2.toFixed(1)} m/s
        </text>
        <text x="380" y="170" fill="#1e3a8a" fontSize="7.5" fontWeight="950" textAnchor="middle">
          v₃ = {v1.toFixed(1)} m/s
        </text>

        {/* Flowing direction arrows */}
        <path d="M 40 100 L 50 100 m -4 -3 l 4 3 l -4 3" stroke="#ffffff" strokeWidth="1.5" fill="none" />
        <path d="M 450 100 L 460 100 m -4 -3 l 4 3 l -4 3" stroke="#ffffff" strokeWidth="1.5" fill="none" />
        <text x="120" y="188" fill="#1e3a8a" fontSize="10" fontWeight="900" textAnchor="middle">ปากท่อ</text>
        <text x="250" y="188" fill={isCavitation ? "#6d28d9" : "#0891b2"} fontSize="10" fontWeight="900" textAnchor="middle">คอคอด</text>
        <text x="380" y="188" fill="#1e3a8a" fontSize="10" fontWeight="900" textAnchor="middle">ทางออก</text>
        </g>
        <g transform="translate(52 266)">
          <rect width="616" height="34" rx="17" fill="#ffffff" fillOpacity=".88" stroke="#a7f3d0" />
          <text x="18" y="22" fill="#1e3a8a" fontSize="9.5" fontWeight="900">P₁ {p1.toFixed(0)} kPa · v₁ {v1.toFixed(1)} m/s</text>
          <text x="308" y="22" fill="#0891b2" fontSize="9.5" fontWeight="900" textAnchor="middle">คอคอดแคบลง → ความเร็วสูงขึ้น → ความดันลดลง</text>
          <text x="598" y="22" fill="#1e3a8a" fontSize="9.5" fontWeight="900" textAnchor="end">P₂ {p2.toFixed(0)} kPa</text>
        </g>
      </svg>
    </div>
  );

  const controls = (
    <div className="space-y-4">
      {/* Flow Rate Slider (Q) */}
      <div className="group bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 select-none space-y-2">
        <div className="flex justify-between items-center text-[11px] font-bold">
          <span className="text-emerald-600 flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-emerald-500" />
            อัตราการไหลเข้า (Flow Rate Q)
          </span>
          <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.2 rounded">
            {flowRate.toFixed(1)} L/s
          </span>
        </div>
        <input
          type="range"
          min="1.0"
          max="5.0"
          step="0.2"
          value={flowRate}
          onChange={(e) => setFlowRate(Number(e.target.value))}
          className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      {/* Constricted area slider (A2) */}
      <div className="group bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 select-none space-y-2">
        <div className="flex justify-between items-center text-[11px] font-bold">
          <span className="text-emerald-600 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-500" />
            ขนาดคอคอดส่วนกลาง (Throat Width A₂)
          </span>
          <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.2 rounded">
            {throatWidth.toFixed(0)} %
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="80"
          step="5"
          value={throatWidth}
          onChange={(e) => setThroatWidth(Number(e.target.value))}
          className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      {/* Control Actions buttons */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-black text-white shadow-sm ${isRunning ? "bg-slate-700" : "bg-emerald-650"}`}>
          {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
          {isRunning ? "หยุดน้ำไหล" : "เริ่มให้น้ำไหล"}
        </button>
        <button onClick={handleAddPoint} className="inline-flex items-center justify-center rounded-xl border border-emerald-100 bg-emerald-55 text-xs font-black text-emerald-700 hover:bg-emerald-100 cursor-pointer">
          บันทึกจุด
        </button>
        <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer" aria-label="รีเซ็ต">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // Generate SVG path for plotting pressure drop graph along pipe
  const pressurePlotPath = useMemo(() => {
    const a2Val = throatWidth / 100.0;
    const qVal = flowRate;
    const points = [];
    
    // Evaluate pressure at 40 spatial points from x=15 to x=185 in plotting scale
    for (let i = 0; i <= 100; i++) {
      // Map plot coordinate x (15-185 px) to physical pipe position x (30-470 px)
      const physicalX = 30 + (i / 100) * 440;
      
      const localWidth = getPipeWidthAtX(physicalX, a2Val);
      const relativeArea = localWidth / 90.0;
      
      const localV1 = qVal / 1.0;
      const localV2 = qVal / relativeArea;
      
      const localP = Math.max(5.0, p1 - 4.5 * (Math.pow(localV2, 2) - Math.pow(localV1, 2)));
      
      const xPlot = 15 + (i / 100) * 170;
      const yPlot = 110 - (localP / 220) * 90; // y-axis inversion, range 20 to 110
      points.push(`${xPlot},${yPlot}`);
    }
    
    return `M ${points.join(" L ")}`;
  }, [flowRate, throatWidth]);

  return (
    <SharedSimulationShell
      accent="emerald"
      labId="bernoullis-principle"
      category="Physics"
      title="Bernoulli's Principle & Fluid Dynamics"
      subtitle="ศึกษาพฤติกรรมพลศาสตร์ของไหลโดยใช้ท่อ Venturi วิเคราะห์ความสัมพันธ์แบบผกผันระหว่างความเร็วและความดันของน้ำที่ไหลผ่านคอคอด"
      statusLabel={isRunning ? "น้ำกำลังไหลเวียน" : "หยุดการระบาย"}
      icon={Droplet}
      sceneTitle="รางแก้ว Venturi Tube แสดงความดันเกจ"
      scene={scene}
      controlsTitle="แผงควบคุมมวลการไหล"
      controls={controls}
      compactControls={
        <div className="grid grid-cols-2 gap-2">
          <label className="rounded-xl bg-slate-50 p-2 text-xs font-black text-slate-700">
            <span className="mb-1 flex justify-between"><span>อัตราการไหล</span><span>{flowRate.toFixed(1)} L/s</span></span>
            <input aria-label="อัตราการไหล" type="range" min="1" max="5" step="0.2" value={flowRate} onChange={(event) => setFlowRate(Number(event.target.value))} className="w-full accent-emerald-500" />
          </label>
          <label className="rounded-xl bg-slate-50 p-2 text-xs font-black text-slate-700">
            <span className="mb-1 flex justify-between"><span>ขนาดคอคอด</span><span>{throatWidth.toFixed(0)}%</span></span>
            <input aria-label="ขนาดคอคอด" type="range" min="20" max="80" step="5" value={throatWidth} onChange={(event) => setThroatWidth(Number(event.target.value))} className="w-full accent-emerald-500" />
          </label>
        </div>
      }
      metrics={[
        { label: "ความดันปากท่อ P1", value: `${p1.toFixed(0)} kPa`, tone: "emerald" },
        { label: "ความดันคอคอด P2", value: `${p2.toFixed(1)} kPa`, tone: isCavitation ? "rose" : "cyan" },
        { label: "ความเร็วคอคอด v2", value: `${v2.toFixed(2)} m/s`, tone: "violet" },
        { label: "อัตราส่วนพื้นที่", value: `1.0 : ${a2.toFixed(2)}`, tone: "orange" },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Droplet className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
              กราฟการกระจายความดันตามแนวยาวท่อ (P-x Profile)
            </h3>
            <span className="text-[10px] font-bold text-emerald-650">Pressure along Pipe</span>
          </div>
          <div className="flex-1 rounded-xl bg-slate-950 p-3 flex flex-col justify-between">
            <svg className="w-full h-full min-h-[174px]" viewBox="0 0 200 120" fill="none">
              {/* Pressure grids */}
              <line x1="15" y1="20" x2="185" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="15" y1="65" x2="185" y2="65" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="15" y1="110" x2="185" y2="110" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

              <text x="12" y="23" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">200 kPa</text>
              <text x="12" y="68" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">100 kPa</text>
              <text x="12" y="113" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0 kPa</text>

              {pressurePlotPath && (
                <path d={pressurePlotPath} stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" fill="none" />
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
            <Droplet className="h-4.5 w-4.5 text-emerald-600" />
            สมการพลังงานแบร์นูลลี
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-center text-[10px] font-black text-slate-800 font-mono">
              <p className="text-emerald-700">P₁ + ½ρv₁² = P₂ + ½ρv₂²</p>
            </div>
            <p className="text-[11px] font-semibold leading-relaxed text-slate-500 leading-[1.6]">
              ผลรวมของความดันสถิต พลังงานจลน์ต่อปริมาตร และพลังงานศักย์ต่อปริมาตรของของไหลที่ไม่มีความหนืดจะมีค่าคงตัวตลอดสายการไหล
            </p>
            <div className="rounded-md bg-slate-50 p-2 text-[10px] font-bold text-slate-500 text-center">
              พื้นที่แคบลง → ความเร็วเพิ่มขึ้น → ความดันลดต่ำลง (Venturi Effect)
            </div>
          </div>
        </section>
      }
      steps={[
        { label: "กำหนดอัตราการไหล Q", icon: Sliders },
        { label: "ปรับบีบพื้นที่คอคอด A2", icon: Sliders },
        { label: "สังเกตความเร็วอนุภาค", icon: Droplet },
        { label: "ตรวจสอบความสูงระดับน้ำ", icon: Droplet },
        { label: "บันทึกข้อมูลกราฟการไหล", icon: ClipboardList },
      ]}
      learningGoals={[
        "ทำความเข้าใจหลักการอนุรักษ์มวลและสมการความต่อเนื่อง",
        "ศึกษาความสัมพันธ์ของความดันและความเร็วของของไหล",
        "สังเกตการณ์ลดลงอย่างรวดเร็วของความดันที่จุด Venturi",
        "ทำความเข้าใจปรากฏการณ์โพรงไอน้ำกระทำ (Cavitation)",
      ]}
      progressLabel="ระยะเวลารักษาความดันคอคอด < 100 kPa"
      progressValue={`${questProgress.toFixed(1)} / 5.0 วินาที`}
      progressPercent={(questProgress / 5.0) * 100}
      tips={[
        "ภารกิจ: บีบขนาดคอคอดและเพิ่มความเร็วการไหลเพื่อรักษาความดัน ณ คอคอด P2 ให้ต่ำกว่า 100 kPa ต่อเนื่องครบ 5 วินาที เพื่อสำเร็จภารกิจ",
        "สังเกตการเคลื่อนที่ของฟองอากาศจำลองจะมีความเร็วสูงมากในบริเวณช่วงท่อที่แคบที่สุด",
        "เมื่อความดันลดต่ำจนเป็นศูนย์ (สุญญากาศสัมบูรณ์) จะเกิดปรากฏการณ์ต้มเย็นขึ้นภายในท่อหรือ Cavitation",
        "กด บันทึกจุด เพื่อนำข้อมูลชุดความเร็วน้ำและความต่างความดันไปจดสรุปเชิงลึกต่อไป",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดน้ำไหล" : "ทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
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
  dataPoints: BernoulliDataPoint[];
  onClearPoint: (idx: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-emerald-600" />
          ตารางกระแสน้ำไหลเวียน
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
          <thead className="bg-emerald-50/70 text-[10px] font-black text-emerald-850 sticky top-0">
            <tr>
              <th className="px-2.5 py-1.5">จุด</th>
              <th className="px-2.5 py-1.5">ไหล Q</th>
              <th className="px-2.5 py-1.5">คอคอด A2</th>
              <th className="px-2.5 py-1.5">ความเร็ว v2</th>
              <th className="px-2.5 py-1.5">ความดัน P2</th>
              <th className="px-2.5 py-1.5">สถานะ</th>
              <th className="px-2.5 py-1.5 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {dataPoints.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">ไม่มีข้อมูลบันทึก</td>
              </tr>
            ) : (
              dataPoints.map((point) => (
                <tr key={point.index} className="hover:bg-slate-50/50">
                  <td className="px-2.5 py-1.5 font-mono">#{point.index}</td>
                  <td className="px-2.5 py-1.5 font-mono text-emerald-700">{point.flowRate.toFixed(1)} L/s</td>
                  <td className="px-2.5 py-1.5 font-mono text-slate-600">{point.throatWidth}%</td>
                  <td className="px-2.5 py-1.5 font-mono text-cyan-600">{point.v2.toFixed(1)} m/s</td>
                  <td className="px-2.5 py-1.5 font-mono text-emerald-600">{point.p2.toFixed(1)} kPa</td>
                  <td className="px-2.5 py-1.5 text-amber-600 font-sans">{point.state}</td>
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

