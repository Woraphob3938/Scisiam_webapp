"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Sun,
  Zap
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

// Types
export interface StefanDataPoint {
  index: number;
  temperature: number; // K
  radius: number; // R_sun
  intensity: number; // W/m^2
  totalPower: number; // W
  relativeLuminosity: number; // L_sun
  peakWavelength: number; // nm
}

// Convert temperature (1000K to 12000K) to smooth RGB string
const temperatureToRGB = (temp: number): string => {
  // Approximate color temperature
  // Key points:
  // 1000K: Red-hot coal (180, 20, 20)
  // 3000K: Warm orange (244, 91, 5)
  // 5500K: Sun yellowish-white (255, 235, 190)
  // 8000K: Blue-white (200, 225, 255)
  // 12000K: Intense electric blue (140, 185, 255)
  let r = 255, g = 255, b = 255;
  if (temp < 3000) {
    const t = (temp - 1000) / 2000;
    r = 180 + Math.round(t * (244 - 180));
    g = 20 + Math.round(t * (91 - 20));
    b = 20 + Math.round(t * (5 - 20));
  } else if (temp < 5500) {
    const t = (temp - 3000) / 2500;
    r = 244 + Math.round(t * (255 - 244));
    g = 91 + Math.round(t * (235 - 91));
    b = 5 + Math.round(t * (190 - 5));
  } else if (temp < 8000) {
    const t = (temp - 5500) / 2500;
    r = 255 - Math.round(t * (255 - 200));
    g = 235 - Math.round(t * (235 - 225));
    b = 190 + Math.round(t * (255 - 190));
  } else {
    const t = Math.min(1.0, (temp - 8000) / 4000);
    r = 200 - Math.round(t * (200 - 140));
    g = 225 - Math.round(t * (225 - 185));
    b = 255;
  }
  return `rgb(${r}, ${g}, ${b})`;
};

function StarRadiatorScene({
  temperature,
  radius,
  isRunning
}: {
  temperature: number;
  radius: number;
  isRunning: boolean;
}) {
  const starColor = temperatureToRGB(temperature);
  
  // Outer heat wave count depending on temperature / intensity
  const waves = useMemo(() => {
    if (temperature < 3000) return [1.15];
    if (temperature < 6000) return [1.15, 1.3];
    return [1.15, 1.3, 1.45];
  }, [temperature]);

  // Radius visual scaling (say 1 R_sun = 18 pixels)
  const starRadiusPx = Math.max(12, Math.min(65, radius * 14));

  return (
    <div className="relative flex h-full min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#050510_0%,#111122_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      <div className="absolute left-5 top-5 rounded-xl border border-white/5 bg-black/60 px-3 py-1.5 text-left shadow-md backdrop-blur-md">
        <span className="text-[9px] font-black uppercase tracking-wider text-rose-400">Radiating Body</span>
        <span className="block mt-0.5 text-xs font-bold text-slate-200">Blackbody Sphere Model</span>
      </div>

      <svg className="relative z-10 w-full max-w-[340px] h-48" viewBox="0 0 300 160">
        <defs>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={starColor} stopOpacity="1" />
            <stop offset="65%" stopColor={starColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={starColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Heat Ripples animation */}
        {isRunning && waves.map((scaleFactor, index) => (
          <circle
            key={index}
            cx="150"
            cy="80"
            r={starRadiusPx * scaleFactor}
            fill="none"
            stroke={starColor}
            strokeWidth="1.2"
            opacity="0.3"
            className="animate-ping"
            style={{
              animationDuration: `${3.5 - index * 0.8}s`,
              animationTimingFunction: "ease-out"
            }}
          />
        ))}

        {/* Outer Glow Halo */}
        <circle cx="150" cy="80" r={starRadiusPx * 1.5} fill="url(#starGlow)" opacity="0.6" />

        {/* The Star Body */}
        <circle cx="150" cy="80" r={starRadiusPx} fill={starColor} stroke="#ffffff" strokeWidth="0.5" />

        {/* Core details/flares effect */}
        {temperature > 4000 && (
          <circle cx="150" cy="80" r={starRadiusPx * 0.85} fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3,6" opacity="0.6" />
        )}
      </svg>
    </div>
  );
}

function BlackbodyGraph({
  temperature,
  peakWavelength
}: {
  temperature: number;
  peakWavelength: number;
}) {
  const C2 = 1.4388e7; // nm K
  const peakIntensity = 1 / (Math.pow(peakWavelength, 5) * (Math.exp(C2 / (peakWavelength * temperature)) - 1));

  // Map lambda nm [50..2000] to SVG x [30..180]
  const xCoord = (l: number) => 30 + ((l - 50) / 1950) * 150;
  // Map intensity normalized [0..1] to SVG y [100..20]
  const yCoord = (val: number) => 100 - val * 75;

  const planckCurvePoints = useMemo(() => {
    const points: string[] = [];
    for (let l = 50; l <= 2000; l += 15) {
      const exponent = C2 / (l * temperature);
      if (exponent > 700) continue;
      const val = 1 / (Math.pow(l, 5) * (Math.exp(exponent) - 1));
      const normalizedIntensity = val / peakIntensity;
      points.push(`${points.length === 0 ? "M" : "L"}${xCoord(l).toFixed(1)},${yCoord(normalizedIntensity).toFixed(1)}`);
    }
    return points.join(" ");
  }, [temperature, peakIntensity]);

  // Visible Spectrum region coordinates
  // 380nm to 750nm
  const visX1 = xCoord(380);
  const visX2 = xCoord(750);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <Sun className="h-4.5 w-4.5 text-blue-600" />
          แผนภาพการแผ่รังสีของวัตถุดำ
        </h3>
        <span className="text-[10px] font-bold text-slate-400">Peak λ: {peakWavelength.toFixed(0)} nm</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-950 p-3 flex flex-col justify-between">
        <svg className="w-full h-full min-h-[174px]" viewBox="0 0 200 120" fill="none">
          <defs>
            {/* Rainbow Spectrum Gradient for visible light portion */}
            <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" /> {/* Violet */}
              <stop offset="20%" stopColor="#3b82f6" /> {/* Blue */}
              <stop offset="40%" stopColor="#10b981" /> {/* Green */}
              <stop offset="60%" stopColor="#eab308" /> {/* Yellow */}
              <stop offset="80%" stopColor="#f97316" /> {/* Orange */}
              <stop offset="100%" stopColor="#ef4444" /> {/* Red */}
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="30" y1="25" x2="180" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="50" x2="180" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="75" x2="180" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Visible Spectrum Region Indicator */}
          <rect x={visX1} y="20" width={visX2 - visX1} height="80" fill="url(#rainbowGrad)" opacity="0.08" />
          <text x={(visX1 + visX2) / 2} y="18" fill="#475569" fontSize="5" fontWeight="black" textAnchor="middle">Visible Light Region</text>

          {/* Planck Blackbody curve line */}
          {planckCurvePoints && (
            <path d={planckCurvePoints} stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          )}

          {/* Peak indicator dot */}
          <circle cx={xCoord(peakWavelength)} cy={yCoord(1.0)} r="2.8" fill="#ef4444" stroke="#ffffff" strokeWidth="0.75" />

          {/* Y Axis (Relative Intensity) */}
          <line x1="30" y1="20" x2="30" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <text x="27" y="27" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">Peak</text>
          <text x="27" y="102" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="end">0</text>

          {/* X Axis (Wavelength in nm) */}
          <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <text x="30" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">50</text>
          <text x="105" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">1000</text>
          <text x="180" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">2000</text>
          <text x="194" y="108" fill="#94a3b8" fontSize="6" fontWeight="black">nm</text>
        </svg>
      </div>
    </section>
  );
}

function ResultsTable({
  dataPoints,
  onClearPoint,
  onCopyData,
  onExportCSV,
}: {
  dataPoints: StefanDataPoint[];
  onClearPoint: (idx: number) => void;
  onCopyData: () => void;
  onExportCSV: () => void;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-blue-600" />
          ตารางบันทึกผล
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
      <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-blue-50/70 text-[11px] font-black text-blue-800">
            <tr>
              <th className="px-2 py-2">อุณหภูมิ (K)</th>
              <th className="px-2 py-2">รัศมี (R_☉)</th>
              <th className="px-2 py-2">ความเข้ม I (W/m²)</th>
              <th className="px-2 py-2">L (L_☉)</th>
              <th className="px-2 py-2 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600 font-mono">
            {dataPoints.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">ไม่มีข้อมูลบันทึก</td>
              </tr>
            ) : (
              dataPoints.map((point) => (
                <tr key={point.index} className="hover:bg-slate-50/50">
                  <td className="px-2 py-2 text-blue-600">{point.temperature.toFixed(0)} K</td>
                  <td className="px-2 py-2 text-amber-600">{point.radius.toFixed(2)} R_☉</td>
                  <td className="px-2 py-2 text-[10px] text-rose-600">{point.intensity.toExponential(3)}</td>
                  <td className="px-2 py-2 text-emerald-600">{point.relativeLuminosity.toExponential(2)}</td>
                  <td className="px-2 py-2 text-center">
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

function TheoryPanel({
  intensity,
  totalPower,
  luminosity,
  temperature
}: {
  intensity: number;
  totalPower: number;
  luminosity: number;
  temperature: number;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-bold">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Flame className="h-4.5 w-4.5 text-rose-600" />
        ทฤษฎีและสมการ
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-center text-[15px] font-black text-slate-800 font-mono space-y-1">
          <div>I = σT⁴</div>
          <div className="text-[10px] font-bold text-slate-500">
            P = 4πR²σT⁴ | σ = 5.67037×10⁻⁸
          </div>
        </div>
        <p className="text-[11px] font-semibold leading-relaxed text-slate-500">
          กฎของสเตฟาน-โบลทซ์มันน์: ความเข้มของการแผ่รังสีพลังงานความร้อนออกจากผิววัตถุดำจะแปรผันตรงกับกำลังสี่ของอุณหภูมิสัมบูรณ์ (T⁴) โดยไม่ขึ้นกับโครงสร้างภายใน
        </p>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1">ความเข้ม I: <b className="text-rose-700">{intensity.toExponential(3)} W/m²</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">พลังงานรวม P: <b className="text-orange-700">{totalPower.toExponential(3)} W</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">ความสว่าง L/L₀: <b className="text-emerald-700">{luminosity.toFixed(2)} L₀</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">จุดยอด Wien: <b className="text-blue-700">{(2.8977e6 / temperature).toFixed(0)} nm</b></span>
        </div>
      </div>
    </section>
  );
}

export default function StefanBoltzmannSimulation() {
  const router = useRouter();

  // Primary controls
  const [temperature, setTemperature] = useState(5778); // K (1000K to 12000K)
  const [radius, setRadius] = useState(1.0); // solar radii R_sun (0.1 to 8.0)

  // Simulation running state
  const [isRunning, setIsRunning] = useState(true);

  // Quest tracking
  const [questTime, setQuestTime] = useState(0.0); // accumulated success seconds
  const [questSuccess, setQuestSuccess] = useState(false);

  // Data history
  const [dataPoints, setDataPoints] = useState<StefanDataPoint[]>([]);

  // Physics constants
  const SIGMA = 5.670374e-8; // Stefan-Boltzmann constant W / m^2 K^4
  const R_SUN = 6.957e8; // solar radius in meters

  // Computed values
  const intensity = useMemo(() => {
    return SIGMA * Math.pow(temperature, 4);
  }, [temperature]);

  const totalPower = useMemo(() => {
    const starRadiusMeters = radius * R_SUN;
    return 4 * Math.PI * Math.pow(starRadiusMeters, 2) * intensity;
  }, [radius, intensity]);

  const relativeLuminosity = useMemo(() => {
    // Relative to solar luminosity: L / L_sun = (R / R_sun)^2 * (T / T_sun)^4
    return Math.pow(radius, 2) * Math.pow(temperature / 5778, 4);
  }, [radius, temperature]);

  const peakWavelength = useMemo(() => {
    // Wien's Displacement Law: peak lambda = b / T
    return 2.8977719e6 / temperature; // nm
  }, [temperature]);

  // Quest Tracker
  // Quest: Maintain radiation intensity within 5.0e7 - 6.0e7 W/m2 continuously for 5 seconds.
  // 5.0e7 to 6.0e7 corresponds to T between 5446 K and 5702 K.
  useEffect(() => {
    let questTimer: NodeJS.Timeout | null = null;
    
    if (isRunning && !questSuccess) {
      questTimer = setInterval(() => {
        if (intensity >= 5.0e7 && intensity <= 6.0e7) {
          setQuestTime(prev => {
            const nextTime = Number((prev + 0.1).toFixed(1));
            if (nextTime >= 5.0) {
              setQuestSuccess(true);
              
              // Award points (+25)
              const currentPoints = Number(localStorage.getItem("scisiam_points") || "120");
              localStorage.setItem("scisiam_points", String(currentPoints + 25));
              window.dispatchEvent(new Event("points-updated"));
              alert("🎉 ภารกิจสำเร็จ! คุณควบคุมความเข้มของการแผ่รังสีให้อยู่ในช่วง 5.0e7 - 6.0e7 W/m² (อุณหภูมิประมาณ 5446 K - 5702 K) ต่อเนื่องเป็นเวลา 5 วินาทีได้สำเร็จ! รับ +25 คะแนน 💎");
              return 5.0;
            }
            return nextTime;
          });
        } else {
          setQuestTime(0.0); // Reset timer if range is broken
        }
      }, 100);
    }

    return () => {
      if (questTimer) clearInterval(questTimer);
    };
  }, [intensity, isRunning, questSuccess]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(true);
    setTemperature(5778);
    setRadius(1.0);
    setQuestTime(0.0);
    setDataPoints([]);
  };

  const handleAddPoint = () => {
    const newPoint: StefanDataPoint = {
      index: dataPoints.length + 1,
      temperature,
      radius,
      intensity,
      totalPower,
      relativeLuminosity,
      peakWavelength
    };
    setDataPoints(prev => [...prev, newPoint]);
  };

  const handleClearPoint = (idx: number) => {
    setDataPoints(prev => prev.filter(p => p.index !== idx).map((p, i) => ({ ...p, index: i + 1 })));
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    const headers = "จุดวัด,อุณหภูมิ (K),รัศมีดาว (R_sun),ความเข้มการแผ่รังสี I (W/m2),พลังงานทั้งหมด P (W),ความสว่างสัมพัทธ์ (L_sun),จุดยอดช่วงคลื่น (nm)\n";
    const rows = dataPoints
      .map(p => `${p.index},${p.temperature},${p.radius.toFixed(2)},${p.intensity.toExponential(4)},${p.totalPower.toExponential(4)},${p.relativeLuminosity.toFixed(4)},${p.peakWavelength.toFixed(1)}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scisiam_stefan_boltzmann_log.csv`);
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
      .map(p => `อุณหภูมิ: ${p.temperature}K | รัศมี: ${p.radius.toFixed(2)}R₀ | ความเข้ม: ${p.intensity.toExponential(3)}W/m² | ความสว่าง: ${p.relativeLuminosity.toExponential(2)}L₀`)
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"));
  };

  const handleSaveResults = async () => {
    if (dataPoints.length === 0) {
      alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล! กรุณากดเริ่มทดลองและเก็บบันทึกข้อมูลก่อน");
      return;
    }

    const experimentData = {
      labId: "stefan-boltzmann",
      timestamp: new Date().toLocaleString("th-TH"),
      dataPoints
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_stefan_boltzmann_experiment",
      localPayload: experimentData,
      labId: "stefan-boltzmann",
      title: "Stefan-Boltzmann Law of Blackbody Radiation",
      graphPoints: experimentData.dataPoints,
      tableRows: experimentData.dataPoints,
      summary: { dataPointCount: experimentData.dataPoints.length },
      score: Math.min(100, experimentData.dataPoints.length * 20),
    });

    alert("บันทึกผลการทดลอง Stefan-Boltzmann สำเร็จ! 🎉");
    router.push(`/labs/stefan-boltzmann`);
  };

  // Log Intensity vs T^4 Graph for blackbody verification
  // Map x: T^4 (0..2.07e16 for 12000K) -> SVG X: 30..180
  // Map y: Intensity I (0..1.18e9 W/m^2) -> SVG Y: 100..20
  const linX = (t: number) => 30 + (Math.pow(t, 4) / 2.0736e16) * 150;
  const linY = (i: number) => 100 - (i / 1.1758e9) * 80;

  const liveLinePoints = useMemo(() => {
    const points: string[] = [];
    for (let temp = 1000; temp <= 12000; temp += 500) {
      const i = SIGMA * Math.pow(temp, 4);
      points.push(`${points.length === 0 ? "M" : "L"}${linX(temp).toFixed(1)},${linY(i).toFixed(1)}`);
    }
    return points.join(" ");
  }, []);

  const relativeLinearGraph = (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <Zap className="h-4.5 w-4.5 text-rose-500" />
          กราฟความสัมพันธ์ I - T⁴ (สัดส่วนโดยตรง)
        </h3>
        <span className="text-[10px] font-bold text-rose-600">I ∝ T⁴</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-950 p-3 flex flex-col justify-between">
        <svg className="w-full h-full min-h-[174px]" viewBox="0 0 200 120" fill="none">
          {/* Grid lines */}
          <line x1="30" y1="20" x2="180" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="60" x2="180" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Theoretical linear line */}
          {liveLinePoints && (
            <path d={liveLinePoints} stroke="#f43f5e" strokeWidth="1" strokeDasharray="2,2" fill="none" opacity="0.6" />
          )}

          {/* Y Axis labels */}
          <text x="27" y="22" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">1.2e9</text>
          <text x="27" y="62" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">6.0e8</text>
          <text x="27" y="102" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0</text>

          {/* Logged points */}
          {dataPoints.map((p, idx) => (
            <circle
              key={idx}
              cx={linX(p.temperature)}
              cy={linY(p.intensity)}
              r="2.5"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="0.5"
            />
          ))}

          {/* Live indicator dot */}
          <circle cx={linX(temperature)} cy={linY(intensity)} r="3.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.75" />

          {/* Axes */}
          <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="30" y1="20" x2="30" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

          {/* X Axis labels */}
          <text x="30" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0</text>
          <text x="105" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">1.0e16</text>
          <text x="180" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">2.0e16</text>
          <text x="194" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="black">T⁴</text>
        </svg>
      </div>
    </section>
  );

  const controls = (
    <div className="space-y-4">
      {/* Temperature control */}
      <div className="group bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <div className="flex justify-between items-center text-xs font-bold mb-1">
          <span className="text-slate-600 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            อุณหภูมิร่างกายดาว (Temperature T)
          </span>
          <span className="text-rose-600 font-extrabold text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
            {temperature} K
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max="12000"
          step="50"
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
        />
        <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-1">
          <span>1000 K</span>
          <span>Sun (5778 K)</span>
          <span>12000 K</span>
        </div>
      </div>

      {/* Radius control */}
      <div className="group bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100 hover:border-slate-200/50 transition-all select-none">
        <div className="flex justify-between items-center text-xs font-bold mb-1">
          <span className="text-slate-600 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            รัศมีร่างกายดาว (Radius R)
          </span>
          <span className="text-amber-600 font-extrabold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
            {radius.toFixed(2)} R_☉
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="4.0"
          step="0.05"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-1">
          <span>0.1 R_☉</span>
          <span>Sun (1.0 R_☉)</span>
          <span>4.0 R_☉</span>
        </div>
      </div>

      {/* Controls box */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm transition active:scale-95 cursor-pointer ${isRunning ? "bg-slate-700" : "bg-blue-600 hover:bg-blue-700"}`}>
          {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
          {isRunning ? "หยุดจำลอง" : "เริ่มจำลอง"}
        </button>
        <button onClick={handleAddPoint} className="inline-flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xs font-black text-blue-700 hover:bg-blue-100 cursor-pointer active:scale-95 transition">บันทึกจุด</button>
        <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95 transition" aria-label="รีเซ็ต">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="rose"
      labId="stefan-boltzmann"
      category="Physics"
      title="Stefan-Boltzmann Law"
      subtitle="ศึกษาความสัมพันธ์ของอุณหภูมิร่างกายและอัตราการแผ่รังสีความร้อนของดวงดาว และพิสูจน์กฎกำลังสี่ของการแผ่รังสี"
      statusLabel={isRunning ? "กำลังแผ่รังสี" : "หยุดจำลอง"}
      icon={Flame}
      sceneTitle="สภาพจำลองการจำลองดวงดาว"
      scene={
        <StarRadiatorScene
          temperature={temperature}
          radius={radius}
          isRunning={isRunning}
        />
      }
      controlsTitle="แผงกำหนดมิติดวงดาว"
      controls={controls}
      metrics={[
        { label: "ความเข้มคลื่น I", value: `${intensity.toExponential(3)} W/m²`, tone: "rose" },
        { label: "กำลังแผ่รวม P", value: `${totalPower.toExponential(3)} W`, tone: "orange" },
        { label: "ความสว่าง L/L_sun", value: `${relativeLuminosity.toFixed(2)}`, tone: "emerald" },
        { label: "จุดยอดช่วงคลื่น", value: `${peakWavelength.toFixed(0)} nm`, tone: "cyan" },
      ]}
      graph={
        <div className="flex flex-col gap-5">
          <BlackbodyGraph temperature={temperature} peakWavelength={peakWavelength} />
          {relativeLinearGraph}
        </div>
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
        <TheoryPanel
          intensity={intensity}
          totalPower={totalPower}
          luminosity={relativeLuminosity}
          temperature={temperature}
        />
      }
      steps={[
        { label: "ปรับระดับอุณหภูมิ T", icon: Sliders },
        { label: "ขยาย-หด รัศมีดาว R", icon: Sun },
        { label: "คำนวณกำลังไฟแผ่", icon: Flame },
        { label: "ตรวจความชัน Wien", icon: Target },
        { label: "พล็อตกราฟเปรียบเทียบ", icon: ClipboardList },
      ]}
      learningGoals={[
        "เรียนรู้กฎของสเตฟาน-โบลทซ์มันน์ I = σT⁴",
        "ศึกษาผลกระทบของการเพิ่มขนาดรัศมีดาวต่อกำลังการแผ่รังสีรวม P",
        "วิเคราะห์จุดสูงสุดของช่วงคลื่นการแผ่รังสีตามกฎการกระจัดของวิน (Wien's Law)",
        "ศึกษาพฤติกรรมดวงดาวจำลองช่วงความยาวคลื่นต่าง ๆ (ยูวี, แสงขาว, อินฟราเรด)",
      ]}
      progressLabel="ระยะเวลาควบคุมความเข้มเป้าหมาย"
      progressValue={`${questTime.toFixed(1)} / 5.0 วินาที`}
      progressPercent={(questTime / 5.0) * 100}
      tips={[
        "ความเข้มการแผ่รังสี I ขึ้นอยู่กับอุณหภูมิ T เพียงอย่างเดียว แต่พลังงานทั้งหมด P ขึ้นอยู่กับรัศมี R ด้วย",
        "ความเข้มเป้าหมาย 5.0e7 - 6.0e7 W/m² (อุณหภูมิประมาณ 5446 K - 5702 K)",
        "ภารกิจ: พยายามรักษาระดับอุณหภูมิให้อยู่ในช่วงความเข้มเป้าหมายติดต่อกันนาน 5 วินาที (ใบ้ให้ว่าตั้งไว้ประมาณ 5500 K - 5650 K แล้วปล่อยทิ้งไว้ 5 วินาที)"
      ]}
      onSave={handleSaveResults}
    />
  );
}
