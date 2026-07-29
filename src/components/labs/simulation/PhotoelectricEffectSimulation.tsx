"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Zap,
  Sliders,
  ClipboardList,
  Trash,
  Download,
  Clipboard,
  Target,
  Sun,
  Flame
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

// Types
export interface PhotoelectricDataPoint {
  index: number;
  metal: string;
  wavelength: number; // nm
  frequency: number; // THz
  photonEnergy: number; // eV
  intensity: number; // %
  voltage: number; // V
  current: number; // uA
}

interface MetalConfig {
  name: string;
  w0: number; // eV
}

const METALS: Record<string, MetalConfig> = {
  sodium: { name: "Sodium (โซเดียม)", w0: 2.28 },
  zinc: { name: "Zinc (สังกะสี)", w0: 4.33 },
  copper: { name: "Copper (ทองแดง)", w0: 4.7 },
};

// Help helper to convert wavelength to RGB color for SVG drawing
const wavelengthToColor = (nm: number): string => {
  if (nm >= 100 && nm < 380) return "#a855f7"; // UV (purple glow)
  if (nm >= 380 && nm < 440) return "#6366f1"; // Violet
  if (nm >= 440 && nm < 490) return "#3b82f6"; // Blue
  if (nm >= 490 && nm < 510) return "#06b6d4"; // Cyan
  if (nm >= 510 && nm < 580) return "#10b981"; // Green
  if (nm >= 580 && nm < 600) return "#eab308"; // Yellow
  if (nm >= 600 && nm < 640) return "#f97316"; // Orange
  if (nm >= 640 && nm <= 800) return "#ef4444"; // Red
  return "#cbd5e1";
};

function PhotoelectricScene({
  wavelength,
  intensity,
  voltage,
  metal,
  current,
  hasEmission
}: {
  wavelength: number;
  intensity: number;
  voltage: number;
  metal: string;
  current: number;
  hasEmission: boolean;
}) {
  const [electrons, setElectrons] = useState<{ id: number; x: number; y: number; speed: number; active: boolean }[]>([]);
  const electronIdCounter = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  const lightColor = wavelengthToColor(wavelength);
  const metalName = METALS[metal]?.name || "";

  // Particle simulation loop
  useEffect(() => {
    let lastSpawn = 0;

    const updateParticles = (time: number) => {
      // Spawn new electron if emission condition is met and intensity > 0
      if (hasEmission && intensity > 0 && time - lastSpawn > Math.max(30, 2000 / intensity)) {
        const newElectron = {
          id: electronIdCounter.current++,
          x: 90, // Cathode x position
          y: 50 + Math.random() * 80, // Middle area vertical span
          speed: 1.5 + Math.random() * 1.5, // Initial velocity factor
          active: true
        };
        setElectrons(prev => [...prev, newElectron].slice(-25)); // Cap active array size
        lastSpawn = time;
      }

      // Update positions based on stopping voltage
      setElectrons(prev =>
        prev
          .map(el => {
            if (!el.active) return el;
            
            // Acceleration factor based on applied voltage
            // If voltage is negative, it opposes electron motion
            const acceleration = voltage * 0.15;
            const nextSpeed = el.speed + acceleration;
            const nextX = el.x + nextSpeed;

            // Anode is at x = 210
            if (nextX >= 210) {
              return { ...el, active: false }; // Reached anode
            }
            // If turned back to cathode
            if (nextX <= 88 && nextSpeed < 0) {
              return { ...el, active: false }; // Reabsorbed
            }

            return { ...el, x: nextX, speed: nextSpeed };
          })
          .filter(el => el.active)
      );

      animationFrameId.current = requestAnimationFrame(updateParticles);
    };

    animationFrameId.current = requestAnimationFrame(updateParticles);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [hasEmission, intensity, voltage]);

  return (
    <div className="relative flex h-full min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      
      <div className="absolute left-5 top-5 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-left shadow-md backdrop-blur-md">
        <p className="text-[9px] font-black uppercase tracking-wider text-blue-400">Target Metal Cathode</p>
        <p className="mt-0.5 text-xs font-bold text-slate-200">{metalName}</p>
      </div>

      <svg className="relative z-10 w-full max-w-[340px] h-48" viewBox="0 0 300 160">
        <defs>
          <linearGradient id="lightBeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={lightColor} stopOpacity={intensity / 100 * 0.8} />
            <stop offset="100%" stopColor={lightColor} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="electronGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Phototube Glass Envelope */}
        <rect x="50" y="30" width="200" height="100" rx="40" fill="rgba(30, 41, 59, 0.4)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        
        {/* Cathode (Left Plate) */}
        <rect x="80" y="45" width="10" height="70" rx="3" fill="#64748b" stroke="#94a3b8" strokeWidth="1" />
        <text x="85" y="83" fill="#cbd5e1" fontSize="6.5" fontWeight="900" textAnchor="middle" transform="rotate(-90 85 80)">CATHODE (-)</text>
        
        {/* Anode (Right Plate) */}
        <rect x="210" y="45" width="5" height="70" rx="1.5" fill="#94a3b8" opacity="0.8" />
        <text x="212.5" y="83" fill="#cbd5e1" fontSize="6.5" fontWeight="900" textAnchor="middle" transform="rotate(90 212.5 80)">ANODE (+)</text>

        {/* Light Beam Pathway */}
        {intensity > 0 && (
          <polygon points="10,0 120,0 90,80 80,80" fill="url(#lightBeam)" />
        )}

        {/* Circulating Electrons */}
        {electrons.map(el => (
          <circle key={el.id} cx={el.x} cy={el.y} r="3" fill="url(#electronGlow)" />
        ))}

        {/* Wiring Circuit */}
        <path d="M 85 115 L 85 145 L 120 145" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
        <path d="M 212.5 115 L 212.5 145 L 180 145" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />

        {/* Voltage Source Box */}
        <rect x="120" y="132" width="60" height="24" rx="4" fill="#0f172a" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <text x="150" y="143" fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">
          V: {voltage.toFixed(2)} V
        </text>
        <text x="150" y="151" fill="rgba(255,255,255,0.4)" fontSize="5.5" textAnchor="middle">
          {voltage >= 0 ? "Forward Bias" : "Reverse Bias"}
        </text>

        {/* Microammeter Indicator Dial */}
        <circle cx="270" cy="80" r="18" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="270" y="74" fill="#f59e0b" fontSize="7" fontWeight="900" textAnchor="middle">μA</text>
        <text x="270" y="87" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">
          {current.toFixed(2)}
        </text>
      </svg>
    </div>
  );
}

function PhotoelectricGraph({
  dataPoints,
  current,
  voltage,
  intensity,
  vStopping,
  metal
}: {
  dataPoints: PhotoelectricDataPoint[];
  current: number;
  voltage: number;
  intensity: number;
  vStopping: number;
  metal: string;
}) {
  const xCoord = (v: number) => 30 + ((v + 5) / 10) * 150; // Map -5V..+5V to 30..180
  const yCoord = (c: number) => 100 - (c / 6.0) * 80;    // Map 0..6uA to 100..20

  const theoreticalCurvePath = useMemo(() => {
    if (intensity === 0 || vStopping >= 5.0) return "";
    const points: string[] = [];
    for (let v = -5.0; v <= 5.0; v += 0.2) {
      let c = 0;
      if (v > vStopping) {
        const I_sat = (intensity / 100) * 5.0;
        c = I_sat * (1 - Math.exp(-2.0 * (v - vStopping)));
      }
      points.push(`${points.length === 0 ? "M" : "L"}${xCoord(v)},${yCoord(c)}`);
    }
    return points.join(" ");
  }, [intensity, vStopping]);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <Zap className="h-4.5 w-4.5 text-blue-600" />
          กราฟกระแสกับแรงดัน (I-V Curve)
        </h3>
        <span className="text-[10px] font-bold text-slate-400">Stopping Vs: {vStopping.toFixed(2)} V</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-950 p-3 flex flex-col justify-between">
        <svg className="w-full h-full min-h-[174px]" viewBox="0 0 200 120" fill="none">
          {/* Grid lines */}
          <line x1="30" y1="20" x2="180" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="40" x2="180" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="60" x2="180" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="30" y1="80" x2="180" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="105" y1="20" x2="105" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" /> {/* V = 0 line */}

          {/* Y Axis labels */}
          <text x="27" y="22" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">6.0 μA</text>
          <text x="27" y="62" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">3.0 μA</text>
          <text x="27" y="102" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.0</text>

          {/* Theoretical Curve */}
          {theoreticalCurvePath && (
            <path d={theoreticalCurvePath} stroke="#6366f1" strokeWidth="1" strokeDasharray="2,2" fill="none" opacity="0.6" />
          )}

          {/* Logged points circles */}
          {dataPoints
            .filter(p => p.metal === metal)
            .map((p, idx) => (
              <circle
                key={idx}
                cx={xCoord(p.voltage)}
                cy={yCoord(p.current)}
                r="2.5"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="0.5"
              />
            ))}

          {/* Live indicator dot */}
          {intensity > 0 && (
            <circle
              cx={xCoord(voltage)}
              cy={yCoord(current)}
              r="3.5"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="0.75"
            />
          )}

          {/* X and Y axes */}
          <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <line x1="30" y1="20" x2="30" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

          {/* X Axis labels */}
          <text x="30" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">-5.0</text>
          <text x="105" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0.0</text>
          <text x="180" y="108" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">+5.0</text>
          <text x="192" y="108" fill="#94a3b8" fontSize="6" fontWeight="black">V</text>
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
  dataPoints: PhotoelectricDataPoint[];
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
              <th className="px-2 py-2">โลหะ</th>
              <th className="px-2 py-2">λ (nm)</th>
              <th className="px-2 py-2">E (eV)</th>
              <th className="px-2 py-2">V (V)</th>
              <th className="px-2 py-2">I (μA)</th>
              <th className="px-2 py-2 text-center">ลบ</th>
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
                  <td className="px-2 py-2 capitalize font-mono text-[10px]">{point.metal}</td>
                  <td className="px-2 py-2 font-mono text-blue-600">{point.wavelength} nm</td>
                  <td className="px-2 py-2 font-mono text-amber-600">{point.photonEnergy.toFixed(2)} eV</td>
                  <td className="px-2 py-2 font-mono text-indigo-600">{point.voltage.toFixed(2)} V</td>
                  <td className="px-2 py-2 font-mono text-emerald-600">{point.current.toFixed(2)} μA</td>
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
  photonEnergy,
  workFunction,
  ekMax,
  wavelength
}: {
  photonEnergy: number;
  workFunction: number;
  ekMax: number;
  wavelength: number;
}) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Sliders className="h-4.5 w-4.5 text-blue-600" />
        ทฤษฎีและสมการ
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-center text-[15px] font-black text-slate-800 font-mono space-y-1">
          <div>E<sub>k,max</sub> = hf - W<sub>0</sub></div>
          <div className="text-[11px] font-bold text-slate-500">
            E = hc / λ = 1240 / λ (eV)
          </div>
        </div>
        <p className="text-[11px] font-semibold leading-relaxed text-slate-500">
          ปรากฏการณ์โฟโตอิเล็กทริก: เมื่อแสงมีความถี่สูงเพียงพอ (พลังงานโฟตอนสูงกว่าฟังก์ชันงาน W₀) กระทบผิวโลหะ จะทำให้อิเล็กตรอนหลุดออกมา การจ่ายแรงดันไฟฟ้าลบ (Stopping Voltage) จะต้านกระแสอิเล็กตรอนนี้จนกระแสเป็นศูนย์
        </p>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1">พลังงานโฟตอน: <b className="text-blue-700">{photonEnergy.toFixed(2)} eV</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">ฟังก์ชันงาน W₀: <b className="text-amber-700">{workFunction.toFixed(2)} eV</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">E<sub>k,max</sub> อิเล็กตรอน: <b className="text-emerald-700">{ekMax.toFixed(2)} eV</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1">ความเร็วแสงสว่าง: <b className="text-purple-700">{(3.0e8 / (wavelength * 1e-9) / 1e12).toFixed(1)} THz</b></span>
        </div>
      </div>
    </section>
  );
}

export default function PhotoelectricEffectSimulation() {

  // Primary states
  const [wavelength, setWavelength] = useState(300); // 100 to 800 nm
  const [intensity, setIntensity] = useState(50); // 0 to 100 %
  const [metal, setMetal] = useState("sodium"); // sodium, zinc, copper
  const [voltage, setVoltage] = useState(0.00); // -5.0 to 5.0 V

  // Data history
  const [dataPoints, setDataPoints] = useState<PhotoelectricDataPoint[]>([]);

  // Simulation Running State (mainly for recording points or visual updates)
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Quest tracking
  const [questSuccess, setQuestSuccess] = useState(false);

  // Constants & Computed Values
  const workFunction = METALS[metal]?.w0 || 2.28;
  const photonEnergy = 1240 / wavelength; // eV
  const frequency = 300000 / wavelength; // THz (approx from f = c / lambda)
  const ekMax = Math.max(0, photonEnergy - workFunction);
  const vStopping = ekMax > 0 ? -ekMax : 0;
  const hasEmission = photonEnergy >= workFunction && intensity > 0;

  // Real-time Current Calculation (uA)
  const current = useMemo(() => {
    if (!hasEmission) return 0.0;
    if (voltage <= vStopping) return 0.0;
    
    // Saturation current (proportional to light intensity)
    const iSat = (intensity / 100) * 4.5;
    // Current rises with voltage above the stopping threshold
    const curVal = iSat * (1 - Math.exp(-2.5 * (voltage - vStopping)));
    return Math.max(0.0, Math.round(curVal * 100) / 100);
  }, [hasEmission, intensity, voltage, vStopping]);

  // Main ticking timer loop (if simulation is running)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 0.1);
      }, 100);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  // Quest Checker: Find stopping voltage for Sodium at 300 nm
  useEffect(() => {
    // Under 300nm wavelength:
    // Photon energy E = 1240/300 = 4.1333 eV
    // For Sodium: W0 = 2.28 eV
    // Ek = 4.1333 - 2.28 = 1.8533 eV -> stopping voltage ~ -1.85V.
    // Allow small delta around -1.85V. Let's make it exactly -1.85V (or between -1.85 and -1.86).
    if (
      metal === "sodium" &&
      wavelength === 300 &&
      Math.abs(voltage - (-1.85)) < 0.01 &&
      current === 0.0 &&
      !questSuccess
    ) {
      const timer = setTimeout(() => {
        setQuestSuccess(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [metal, wavelength, voltage, current, questSuccess]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setWavelength(300);
    setIntensity(50);
    setMetal("sodium");
    setVoltage(0.0);
    setDataPoints([]);
  };

  const handleClearPoint = (idx: number) => {
    setDataPoints(prev => prev.filter(p => p.index !== idx).map((p, i) => ({ ...p, index: i + 1 })));
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    const headers = "จุดวัด,โลหะตัวเป้า,ความยาวคลื่น (nm),ความถี่ (THz),พลังงานโฟตอน (eV),ความเข้มแสง (%),แรงดัน (V),กระแสไฟฟ้า (uA)\n";
    const rows = dataPoints
      .map(p => `${p.index},${p.metal},${p.wavelength},${p.frequency.toFixed(1)},${p.photonEnergy.toFixed(2)},${p.intensity},${p.voltage.toFixed(2)},${p.current.toFixed(2)}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scisiam_photoelectric_log.csv`);
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
      .map(p => `จุดที่ ${p.index} | โลหะ: ${p.metal} | λ: ${p.wavelength}nm | พลังงานโฟตอน: ${p.photonEnergy.toFixed(2)}eV | แรงดัน: ${p.voltage.toFixed(2)}V | กระแส: ${p.current.toFixed(2)}μA`)
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"));
  };

  const handleSaveResults = async () => {
    const currentPoint: PhotoelectricDataPoint = {
      index: dataPoints.length + 1,
      metal,
      wavelength,
      frequency,
      photonEnergy,
      intensity,
      voltage,
      current,
    };
    const pointsToSave = [...dataPoints, currentPoint].slice(-20);
    setDataPoints(pointsToSave);

    const experimentData = {
      labId: "photoelectric-effect",
      timestamp: new Date().toLocaleString("th-TH"),
      metal,
      dataPoints: pointsToSave,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_photoelectric_experiment",
      localPayload: experimentData,
      labId: "photoelectric-effect",
      title: "Einstein's Photoelectric Effect",
      graphPoints: experimentData.dataPoints,
      tableRows: experimentData.dataPoints,
      summary: { dataPointCount: experimentData.dataPoints.length },
      score: Math.min(100, experimentData.dataPoints.length * 20),
    });

  };

  const timeLabel = `${Math.floor(elapsedSeconds / 60).toString().padStart(2, "0")}:${Math.floor(elapsedSeconds % 60).toString().padStart(2, "0")}`;

  const controls = (
    <div className="space-y-3">
      <p className="text-sm font-black text-slate-800">เลือกโลหะเป้าหมาย</p>
      <p className="text-xs font-semibold leading-relaxed text-slate-500">
        โลหะแต่ละชนิดมีฟังก์ชันงานต่างกัน จึงต้องใช้พลังงานโฟตอนไม่เท่ากัน
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Object.entries(METALS).map(([key, config]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMetal(key)}
            aria-pressed={metal === key}
            className={`min-h-12 rounded-xl border px-3 py-2 text-xs font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              metal === key
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {config.name.split(" ")[0]}
            <span className="block text-[10px] font-bold opacity-75">{config.w0} eV</span>
          </button>
        ))}
      </div>
    </div>
  );

  const compactControls = (
    <div className="grid gap-3 md:grid-cols-3">
      <label className="rounded-xl bg-slate-50 p-3 text-xs font-black text-slate-700">
        <span className="mb-2 flex justify-between gap-2">
          <span>ความยาวคลื่น</span><span>{wavelength} nm</span>
        </span>
        <input aria-label="ความยาวคลื่นแสง" type="range" min="100" max="800" step="5" value={wavelength} onChange={(event) => setWavelength(Number(event.target.value))} className="w-full accent-blue-500" />
      </label>
      <label className="rounded-xl bg-slate-50 p-3 text-xs font-black text-slate-700">
        <span className="mb-2 flex justify-between gap-2">
          <span>ความเข้มแสง</span><span>{intensity}%</span>
        </span>
        <input aria-label="ความเข้มแสง" type="range" min="0" max="100" step="1" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} className="w-full accent-rose-500" />
      </label>
      <label className="rounded-xl bg-slate-50 p-3 text-xs font-black text-slate-700">
        <span className="mb-2 flex justify-between gap-2">
          <span>แรงดันไฟฟ้า</span><span>{voltage.toFixed(2)} V</span>
        </span>
        <input aria-label="แรงดันไฟฟ้า" type="range" min="-5" max="5" step="0.01" value={voltage} onChange={(event) => setVoltage(Number(event.target.value))} className="w-full accent-indigo-500" />
      </label>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="blue"
      labId="photoelectric-effect"
      category="Physics"
      title="Einstein's Photoelectric Effect"
      subtitle="ทดลองยิงโฟตอนพลังงานแสงกระแทกผิวแผ่นโลหะแคโทดเพื่อกระตุ้นให้เกิดกระแสโฟโตอิเล็กตรอน และปรับแรงดันต้านเพื่อหาจุดหยุดยั้ง"
      statusLabel={hasEmission ? "เกิดโฟโตอิเล็กตรอน" : "ไม่มีการหลุดของประจุ"}
      icon={Zap}
      sceneTitle="หลอดแก้วสุญญากาศโฟโตทูบจำลอง"
      scene={
        <PhotoelectricScene
          wavelength={wavelength}
          intensity={intensity}
          voltage={voltage}
          metal={metal}
          current={current}
          hasEmission={hasEmission}
        />
      }
      controlsTitle="แผงความถี่และแสงตัวกระตุ้น"
      controls={controls}
      compactControls={compactControls}
      metrics={[
        { label: "แรงดันเบี่ยง", value: `${voltage.toFixed(2)} V`, tone: "blue" },
        { label: "กระแสวัดได้", value: `${current.toFixed(2)} μA`, tone: "emerald" },
        { label: "พลังงานโฟตอน", value: `${photonEnergy.toFixed(2)} eV`, tone: "violet" },
        { label: "เวลาจำลอง", value: timeLabel, tone: "cyan" },
      ]}
      graph={
        <PhotoelectricGraph
          dataPoints={dataPoints}
          current={current}
          voltage={voltage}
          intensity={intensity}
          vStopping={vStopping}
          metal={metal}
        />
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
          photonEnergy={photonEnergy}
          workFunction={workFunction}
          ekMax={ekMax}
          wavelength={wavelength}
        />
      }
      steps={[
        { label: "เลือกโลหะผิวเป้า", icon: Sliders },
        { label: "ปรับความยาวคลื่น", icon: Sun },
        { label: "ปล่อยกระแสแสง", icon: Flame },
        { label: "หาจุดแรงดันเบี่ยง", icon: Target },
        { label: "บันทึกข้อมูลกราฟ", icon: ClipboardList },
      ]}
      learningGoals={[
        "เรียนรู้สมการโฟโตอิเล็กทริกของอัลเบิร์ต ไอน์สไตน์ E = hf - W₀",
        "ทำความเข้าใจคุณสมบัติอนุภาคของแสงในรูปโฟตอน",
        "วิเคราะห์หาค่าฟังก์ชันงานและความถี่ขีดเริ่มจากชนิดโลหะต่าง ๆ",
        "วิเคราะห์พฤติกรรมความต่างศักย์หยุดยั้ง (Stopping Voltage)",
      ]}
      progressLabel="เป้าหมายภารกิจจำลองโซเดียม"
      progressValue={questSuccess ? "สำเร็จแล้ว (100%)" : "ค้นหาแรงดันหยุดยั้ง (0%)"}
      progressPercent={questSuccess ? 100 : 0}
      tips={[
        "หากพลังงานแสงต่ำกว่าฟังก์ชันงาน (E < W₀) จะไม่มีอิเล็กตรอนหลุดเลยไม่ว่าความเข้มแสงจะสูงเพียงใด",
        "ความเข้มแสงส่งผลโดยตรงต่อปริมาณอิเล็กตรอน (กระแสอิ่มตัว) แต่ไม่ส่งผลต่อระดับพลังงานจลน์สูงสุด",
        "ภารกิจ: หาแรงดันหยุดยั้งของโซเดียม (Sodium) ที่สว่าง 300 nm จนได้ค่ากระแสเป็น 0.00 μA พอดี (ใบ้ให้ว่าแรงดันจะติดลบ)"
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}

