"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Sliders,
  ClipboardList,
  Target,
  Zap,
  Copy,
  Download,
  Trash2,
} from "lucide-react";
import SharedSimulationShell from "./SharedSimulationShell";
import CompactRangeControl from "./CompactRangeControl";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface BraggDataPoint {
  time: number;
  wavelength: number;
  latticeSpacing: number;
  angle: number;
  intensity: number;
}

const MAX_DATA_POINTS = 500;

export default function BraggDiffractionSimulation() {
  const labId = "bragg-diffraction";

  // Simulator configurations
  const [wavelength, setWavelength] = useState(1.54); // Angstrom (Cu-Ka reference)
  const [latticeSpacing, setLatticeSpacing] = useState(2.82); // Angstrom (NaCl reference)
  const [angle, setAngle] = useState(15.0); // degrees

  const logInterval = 10;
  const simulationSpeed = 1;

  // Running states
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<BraggDataPoint[]>([]);
  const [lastLoggedTime, setLastLoggedTime] = useState(0);

  // Quest states
  const [questProgress, setQuestProgress] = useState(0); // number of unique Bragg peaks recorded (up to 3)
  const [questSuccess, setQuestSuccess] = useState(false);

  // References
  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const lastLoggedTimeRef = useRef(lastLoggedTime);
  const wavelengthRef = useRef(wavelength);
  const latticeSpacingRef = useRef(latticeSpacing);
  const angleRef = useRef(angle);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { lastLoggedTimeRef.current = lastLoggedTime; }, [lastLoggedTime]);
  useEffect(() => { wavelengthRef.current = wavelength; }, [wavelength]);
  useEffect(() => { latticeSpacingRef.current = latticeSpacing; }, [latticeSpacing]);
  useEffect(() => { angleRef.current = angle; }, [angle]);

  // Analytical diffraction intensity
  const getIntensity = (wl: number, d: number, thetaDeg: number) => {
    const thetaRad = (thetaDeg * Math.PI) / 180.0;
    const pathDiff = 2 * d * Math.sin(thetaRad);

    // Sum intensities over orders n = 1, 2, 3, 4
    let sum = 0.05; // background baseline
    for (let n = 1; n <= 4; n++) {
      const targetDiff = n * wl;
      const deviation = pathDiff - targetDiff;
      const sigma = 0.08; // width of diffraction peak
      sum += 0.95 * Math.exp(-(deviation * deviation) / (2 * sigma * sigma));
    }
    return Math.min(1.0, sum);
  };

  const intensity = getIntensity(wavelength, latticeSpacing, angle);

  // Main tick loop for scanning or auto logging
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        const deltaSeconds = 0.1 * simulationSpeed;
        const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
        setElapsedSeconds(nextSeconds);
        elapsedSecondsRef.current = nextSeconds;

        const currentWavelength = wavelengthRef.current;
        const currentD = latticeSpacingRef.current;
        const currentAngle = angleRef.current;
        const curI = getIntensity(currentWavelength, currentD, currentAngle);

        // Auto logging
        if (nextSeconds - lastLoggedTimeRef.current >= logInterval) {
          setDataPoints((prev) =>
            [
              ...prev,
              {
                time: nextSeconds,
                wavelength: currentWavelength,
                latticeSpacing: currentD,
                angle: currentAngle,
                intensity: curI,
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

  // Quest evaluation based on logged data points
  useEffect(() => {
    // A Bragg peak is hit when intensity >= 0.85
    // Unique peaks are characterized by their corresponding diffraction order n = round(2d sin(theta) / lambda)
    const recordedPeaks = dataPoints.filter(p => p.intensity >= 0.85);
    const uniqueOrders = new Set<number>();

    recordedPeaks.forEach((p) => {
      const thetaRad = (p.angle * Math.PI) / 180.0;
      const order = Math.round((2 * p.latticeSpacing * Math.sin(thetaRad)) / p.wavelength);
      if (order >= 1 && order <= 4) {
        uniqueOrders.add(order);
      }
    });

    const uniqueCount = uniqueOrders.size;

    // Defer state updates to avoid React's synchronous render warning
    const timeoutId = setTimeout(() => {
      setQuestProgress(uniqueCount);
      if (uniqueCount >= 3 && !questSuccess) {
        setQuestSuccess(true);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [dataPoints, questSuccess]);

  const handleStartStop = () => {
    setIsRunning(prev => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setWavelength(1.54);
    setLatticeSpacing(2.82);
    setAngle(15.0);
    setElapsedSeconds(0);
    setQuestProgress(0);
    setQuestSuccess(false);
    setDataPoints([]);
    setLastLoggedTime(0);
  };

  const handleClearPoint = (index: number) => {
    setDataPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopyData = () => {
    if (dataPoints.length === 0) return;
    const header = "Time(s)\tWavelength(A)\tSpacing(A)\tAngle(deg)\tIntensity(%)\n";
    const rows = dataPoints
      .map(
        (p) =>
          `${p.time.toFixed(1)}\t${p.wavelength.toFixed(2)}\t${p.latticeSpacing.toFixed(2)}\t${p.angle.toFixed(1)}\t${(p.intensity * 100).toFixed(1)}`,
      )
      .join("\n");
    navigator.clipboard.writeText(header + rows);
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) return;
    const header = "Time(s),Wavelength(A),Spacing(A),Angle(deg),Intensity(%)\n";
    const rows = dataPoints
      .map(
        (p) =>
          `${p.time.toFixed(1)},${p.wavelength.toFixed(2)},${p.latticeSpacing.toFixed(2)},${p.angle.toFixed(1)},${(p.intensity * 100).toFixed(1)}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `bragg_diffraction_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    const experimentData = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      wavelength,
      latticeSpacing,
      dataPoints,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_bragg_experiment",
      localPayload: experimentData,
      labId,
      title: "Bragg Diffraction",
      variables: {
        wavelength,
        latticeSpacing,
        angle,
        logInterval,
        simulationSpeed,
      },
      liveValues: {
        intensity,
        elapsedSeconds,
        questProgress,
        questSuccess,
      },
      graphPoints: dataPoints.map(p => ({ x: p.angle, y: p.intensity })),
      tableRows: dataPoints,
      summary: {
        finalIntensity: intensity,
        dataPointCount: dataPoints.length,
        questSuccess,
      },
    });

    alert("บันทึกรายงานผลการทดลองการเลี้ยวเบนของแบรกก์สำเร็จ! 🎉");
  };

  const compactControls = (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <CompactRangeControl
        label="มุมตกกระทบ"
        symbol="θ"
        value={angle}
        min={5}
        max={85}
        step={0.2}
        precision={1}
        unit="°"
        tone="emerald"
        onChange={setAngle}
      />
      <CompactRangeControl
        label="ความยาวคลื่นรังสีเอกซ์"
        symbol="λ"
        value={wavelength}
        min={0.5}
        max={2.5}
        step={0.01}
        precision={2}
        unit="Å"
        tone="blue"
        onChange={setWavelength}
      />
      <CompactRangeControl
        label="ระยะระนาบผลึก"
        symbol="d"
        value={latticeSpacing}
        min={1.5}
        max={4}
        step={0.01}
        precision={2}
        unit="Å"
        tone="violet"
        onChange={setLatticeSpacing}
      />
    </div>
  );

  const dataTable = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">บันทึกประวัติการสะท้อนแทรกสอด</span>
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
                <th className="px-3 py-2">λ (Å)</th>
                <th className="px-3 py-2">d (Å)</th>
                <th className="px-3 py-2">θ (deg)</th>
                <th className="px-3 py-2">ความเข้ม (%)</th>
                <th className="px-2 py-2 text-center">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataPoints.map((point, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono">{point.time.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono">{point.wavelength.toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono">{point.latticeSpacing.toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono">{point.angle.toFixed(1)}°</td>
                  <td className="px-3 py-2 font-mono font-bold">
                    {(point.intensity * 100).toFixed(1)}%
                  </td>
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
      accent="emerald"
      labId={labId}
      category="Physics"
      title="Bragg Diffraction (การเลี้ยวเบนแบบแบรกก์)"
      subtitle="จำลองการเลี้ยวเบนของรังสีเอกซ์ (X-ray) ผ่านระนาบอะตอมของผลึกคริสตัล ค้นหาตำแหน่งการสะท้อนแทรกสอดเสริมตามกฎของแบรกก์เพื่อวิเคราะห์โครงสร้างผลึก"
      statusLabel={intensity >= 0.85 ? "แทรกสอดเสริมสร้าง (Bragg Peak) 🌟" : "แทรกสอดทำลาย 🌫️"}
      icon={Target}
      sceneTitle="ภาพจำลองลำแสงรังสีเอกซ์เลี้ยวเบนสะท้อนระนาบอะตอมคริสตัล"
      scene={
        <BraggViewport
          latticeSpacing={latticeSpacing}
          angle={angle}
          intensity={intensity}
        />
      }
      controlsTitle="แผงพารามิเตอร์รังสีเอกซ์และระยะโครงผลึก"
      compactControls={compactControls}
      metrics={[
        { label: "ความเข้มสัญญาณดิสเพรส", value: `${(intensity * 100).toFixed(1)}%`, tone: "emerald" },
        { label: "มุมสะท้อนกวาด", value: `${angle.toFixed(1)}°`, tone: "cyan" },
        { label: "อัตราส่วน 2d sinθ / λ", value: ((2 * latticeSpacing * Math.sin((angle * Math.PI) / 180)) / wavelength).toFixed(3), tone: "violet" },
        { label: "ความยาวคลื่นรังสี", value: `${wavelength.toFixed(2)} Å`, tone: "blue" },
      ]}
      graph={
        <BraggGraph
          wavelength={wavelength}
          latticeSpacing={latticeSpacing}
          angle={angle}
        />
      }
      table={dataTable}
      theory={<BraggTheory />}
      steps={[
        { label: "เลือกความยาวคลื่นรังสีเอกซ์ λ", icon: Sliders },
        { label: "เลือกขนาดโครงข่ายอะตอมผลึก d", icon: Sliders },
        { label: "ค่อย ๆ ปรับหมุนมุมกวาด θ", icon: Target },
        { label: "ค้นหาจุดสะท้อนสูงสุด (Bragg Peaks)", icon: Zap },
      ]}
      learningGoals={[
        "อธิบายเงื่อนไขที่ทำให้รังสีแทรกสอดเสริมสร้างกันตามวิถีคลื่น",
        "คำนวณหามุมสะท้อนวิกฤตอันดับต่างๆ จากความสัมพันธ์เชิงคณิตศาสตร์",
        "วิเคราะห์ความแตกต่างของขนาดอะตอมผลึกที่มีต่อมุมกระจายตัวเลี้ยวเบน",
      ]}
      progressLabel="จำนวนระดับพีคเลี้ยวเบนเสริมที่บันทึกสำเร็จ"
      progressValue={`${questProgress} / 3 พีคที่ไม่ซ้ำกัน`}
      progressPercent={(questProgress / 3) * 100}
      tips={[
        "ความเข้มของสัญญาณรังสีเลี้ยวเบนจะขึ้นสูงปรี๊ดเมื่อผลต่างทางเดินคลื่นกลายเป็นจำนวนเต็มเท่าของความยาวคลื่นพอดี",
        "การเพิ่มระยะห่าง d จะส่งผลให้ตำแหน่งพีคสะท้อนเสริมตัวถัดไปเกิดขึ้นที่มุมเล็กลงตามสมการตรีโกณมิติ",
        "ภารกิจ: เก็บบันทึกข้อมูล Bragg Peaks บนตารางบันทึกผล (ความเข้มสัญญาณ ≥ 85%) ให้ครอบคลุมพีคที่ไม่ซ้ำกันอย่างน้อย 3 พีค",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}

// ------------------- VIEWPORT COMPONENT -------------------
interface ViewportProps {
  latticeSpacing: number;
  angle: number;
  intensity: number;
}

function BraggViewport({
  latticeSpacing,
  angle,
  intensity,
}: ViewportProps) {
  // We draw 3 layers of atoms in a crystal lattice
  // The spacing 'd' will translate directly to visual spacing between rows (y-coordinate)
  // Base spacing: d = 2.82 Å translates to 40px
  const rowSpacing = (latticeSpacing / 2.82) * 45;

  const thetaRad = (angle * Math.PI) / 180;
  const isPeak = intensity >= 0.85;

  // Wave phase offset for animation
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    let animId: number;
    const tick = () => {
      setPhase(p => p + 0.15);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Center point of reflection on top layer
  const reflectX1 = 200;
  const reflectY1 = 120;

  // Reflecting angles (symmetrical)
  const incomingLine1 = {
    x1: reflectX1 - 150 * Math.cos(thetaRad),
    y1: reflectY1 - 150 * Math.sin(thetaRad),
    x2: reflectX1,
    y2: reflectY1,
  };

  const outgoingLine1 = {
    x1: reflectX1,
    y1: reflectY1,
    x2: reflectX1 + 150 * Math.cos(thetaRad),
    y2: reflectY1 - 150 * Math.sin(thetaRad),
  };

  // Center point of reflection on second layer (shifted by geometry)
  const reflectX2 = reflectX1;
  const reflectY2 = reflectY1 + rowSpacing;

  const incomingLine2 = {
    x1: reflectX2 - 150 * Math.cos(thetaRad),
    y1: reflectY2 - 150 * Math.sin(thetaRad),
    x2: reflectX2,
    y2: reflectY2,
  };

  const outgoingLine2 = {
    x1: reflectX2,
    y1: reflectY2,
    x2: reflectX2 + 150 * Math.cos(thetaRad),
    y2: reflectY2 - 150 * Math.sin(thetaRad),
  };

  return (
    <div className="relative w-full h-full min-h-[340px] bg-slate-950 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-800">
      <svg className="w-full h-full" viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg">
        {/* Glow backdrop for peak conditions */}
        <circle cx={outgoingLine1.x2} cy={outgoingLine1.y2} r={isPeak ? "60" : "20"} fill={isPeak ? "#10b981" : "#f59e0b"} opacity={isPeak ? "0.15" : "0.03"} className="transition-all duration-300" />

        {/* Draw crystal lattice planes */}
        {[0, 1, 2].map((rowIdx) => {
          const y = reflectY1 + rowIdx * rowSpacing;
          return (
            <g key={rowIdx}>
              {/* Plane Line */}
              <line x1="50" y1={y} x2="350" y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
              {/* Atoms */}
              {[100, 150, 200, 250, 300].map((x) => (
                <circle
                  key={x}
                  cx={x}
                  cy={y}
                  r="8"
                  fill="url(#atomGrad)"
                  stroke="#475569"
                  strokeWidth="1"
                />
              ))}
            </g>
          );
        })}

        {/* X-ray Beams (Representing wave fronts using sinusoidal paths or glowing dashes) */}
        {/* Layer 1 Beams */}
        <line x1={incomingLine1.x1} y1={incomingLine1.y1} x2={incomingLine1.x2} y2={incomingLine1.y2} stroke="#38bdf8" strokeWidth="2.5" opacity="0.6" />
        <line x1={outgoingLine1.x1} y1={outgoingLine1.y1} x2={outgoingLine1.x2} y2={outgoingLine1.y2} stroke={isPeak ? "#34d399" : "#38bdf8"} strokeWidth={isPeak ? "3.5" : "2.5"} className="transition-all duration-300" />

        {/* Layer 2 Beams */}
        <line x1={incomingLine2.x1} y1={incomingLine2.y1} x2={incomingLine2.x2} y2={incomingLine2.y2} stroke="#0284c7" strokeWidth="1.5" opacity="0.5" />
        <line x1={outgoingLine2.x1} y1={outgoingLine2.y1} x2={outgoingLine2.x2} y2={outgoingLine2.y2} stroke={isPeak ? "#34d399" : "#0284c7"} strokeWidth={isPeak ? "3" : "1.5"} className="transition-all duration-300" />

        {/* Phase waves visualization overlay */}
        {/* We draw a wavy path showing constructive interference */}
        <g stroke={isPeak ? "#10b981" : "#0284c7"} strokeWidth="2" fill="none" opacity="0.8">
          <path
            d={`M ${outgoingLine1.x1} ${outgoingLine1.y1}
                L ${outgoingLine1.x1 + 30 * Math.cos(thetaRad)} ${outgoingLine1.y1 - 30 * Math.sin(thetaRad) + Math.sin(phase) * 6}
                L ${outgoingLine1.x1 + 60 * Math.cos(thetaRad)} ${outgoingLine1.y1 - 60 * Math.sin(thetaRad) + Math.sin(phase + 1) * 6}
                L ${outgoingLine1.x1 + 90 * Math.cos(thetaRad)} ${outgoingLine1.y1 - 90 * Math.sin(thetaRad) + Math.sin(phase + 2) * 6}
                L ${outgoingLine1.x1 + 120 * Math.cos(thetaRad)} ${outgoingLine1.y1 - 120 * Math.sin(thetaRad) + Math.sin(phase + 3) * 6}`}
            className="transition-all duration-300"
          />
        </g>

        {/* Detector Area */}
        <circle cx={outgoingLine1.x2} cy={outgoingLine1.y2} r="12" fill={isPeak ? "#10b981" : "#1e293b"} stroke="#475569" strokeWidth="1.5" className="transition-all duration-300" />
        <text x={outgoingLine1.x2} y={outgoingLine1.y2 - 18} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Detector</text>

        {/* Gradients */}
        <defs>
          <radialGradient id="atomGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </radialGradient>
        </defs>
      </svg>

      {/* Screen Intensity reading overlay */}
      <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-0.5 text-[10px] sm:text-xs">
        <span className="font-extrabold text-slate-300">ความเข้มสัญญาณรังสีเลี้ยวเบน</span>
        <p className="font-mono text-emerald-400 font-extrabold text-sm sm:text-base transition-all duration-300">
          {(intensity * 100).toFixed(1)}%
        </p>
        <p className="text-[10px] text-slate-400 font-bold">2d sinθ = { (2 * latticeSpacing * Math.sin(thetaRad)).toFixed(3) } Å</p>
      </div>
    </div>
  );
}

// ------------------- GRAPH COMPONENT -------------------
interface GraphProps {
  wavelength: number;
  latticeSpacing: number;
  angle: number;
}

function BraggGraph({ wavelength, latticeSpacing, angle }: GraphProps) {
  // Generate curve points for Intensity vs theta from 5 to 85 deg
  const points: Array<{ x: number; y: number }> = [];

  for (let theta = 5; theta <= 85; theta += 0.5) {
    const thetaRad = (theta * Math.PI) / 180.0;
    const pathDiff = 2 * latticeSpacing * Math.sin(thetaRad);
    let val = 0.05;
    for (let n = 1; n <= 4; n++) {
      const targetDiff = n * wavelength;
      const dev = pathDiff - targetDiff;
      const sigma = 0.08;
      val += 0.95 * Math.exp(-(dev * dev) / (2 * sigma * sigma));
    }
    points.push({ x: theta, y: Math.min(1.0, val) });
  }

  // Scale: x in [5, 85] -> [25, 280], y in [0, 1] -> [140, 10]
  const scaleX = (x: number) => 25 + ((x - 5) / 80) * 255;
  const scaleY = (y: number) => 140 - y * 130;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.x)} ${scaleY(p.y)}`).join(" ");

  return (
    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between select-none h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">กราฟวิเคราะห์ Intensity vs θ</span>
        <span className="text-[10px] font-black text-emerald-500 font-mono">Bragg Spectrum</span>
      </div>
      <div className="flex-grow">
        <svg className="w-full h-auto" viewBox="0 0 300 160">
          {/* Grid lines */}
          <line x1="25" y1="140" x2="280" y2="140" stroke="#334155" strokeWidth="1" />
          <line x1="25" y1="10" x2="25" y2="140" stroke="#334155" strokeWidth="1" />

          {/* Grid labels */}
          <text x="25" y="152" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">5°</text>
          <text x="110" y="152" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">30°</text>
          <text x="195" y="152" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">60°</text>
          <text x="280" y="152" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">85°</text>

          <text x="20" y="143" fill="#64748b" fontSize="8" textAnchor="end" fontWeight="bold">0%</text>
          <text x="20" y="78" fill="#64748b" fontSize="8" textAnchor="end" fontWeight="bold">50%</text>
          <text x="20" y="13" fill="#64748b" fontSize="8" textAnchor="end" fontWeight="bold">100%</text>

          {/* Spectrum curve */}
          <path d={pathD} fill="none" stroke="#34d399" strokeWidth="2" />

          {/* Current angle cursor marker */}
          <line x1={scaleX(angle)} y1="10" x2={scaleX(angle)} y2="140" stroke="#ef4444" strokeWidth="1" opacity="0.7" />
          <circle cx={scaleX(angle)} cy={scaleY(points.find(p => Math.abs(p.x - angle) < 0.6)?.y || 0.05)} r="4" fill="#ef4444" />
        </svg>
      </div>
    </div>
  );
}

// ------------------- THEORY COMPONENT -------------------
function BraggTheory() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-3 leading-relaxed">
      <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
        <Zap className="w-4.5 h-4.5 text-emerald-500" />
        ทฤษฎีการเลี้ยวเบนของรังสีเอกซ์ตามกฎของแบรกก์
      </h3>
      <p>
        <strong>กฎของแบรกก์ (Bragg&apos;s Law)</strong> เสนอโดย William Lawrence Bragg และ William Henry Bragg เพื่ออธิบายการแทรกสอดเสริมสร้างกันของรังสีเอกซ์ (หรืออนุภาคที่มีคลื่น เช่น อิเล็กตรอน นิวตรอน) ที่ตกกระทบระนาบอะตอมผลึกที่มีโครงสร้างเป็นระเบียบ
      </p>
      <p>
        ความแตกต่างระยะทางเดินของคลื่นที่สะท้อนจากชั้นระนาบติดกัน (Path Difference) มีค่าเท่ากับ $2d \sin\theta$ เมื่อระยะนี้มีสัดส่วนลงตัวเป็นจำนวนเท่าของความยาวคลื่นพอดี จะเกิดการแทรกสอดเสริมสร้างกันทำให้เกิดสัญญาณสะท้อนที่ความเข้มสูงโด่ง (Bragg Peaks)
      </p>
      <p className="font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[10px] text-emerald-400">
        {`2d sinθ = nλ`}
        <br />
        {`d = ระยะห่างระนาบโครงผลึก (Å)`}
        <br />
        {`θ = มุมตกกระทบเทียบกับระนาบผลึก`}
        <br />
        {`n = อันดับของการเลี้ยวเบน (1, 2, 3...)`}
      </p>
    </div>
  );
}
