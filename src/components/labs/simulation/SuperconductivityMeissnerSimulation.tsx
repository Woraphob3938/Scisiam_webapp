"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ClipboardList,
  Target,
  Thermometer,
  Zap,
  Copy,
  Download,
  Trash2,
} from "lucide-react";
import SharedSimulationShell from "./SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface SuperconductivityDataPoint {
  time: number;
  temperature: number;
  magneticField: number;
  resistance: number;
  levitationHeight: number;
}

const MAX_DATA_POINTS = 500;

const MATERIALS = [
  { name: "YBCO (High-Tc)", tc: 93.0, r0: 0.1, alpha: 0.005 },
  { name: "Lead (Pb)", tc: 7.2, r0: 0.02, alpha: 0.001 },
  { name: "Mercury (Hg)", tc: 4.2, r0: 0.015, alpha: 0.0008 },
];

export default function SuperconductivityMeissnerSimulation() {
  const router = useRouter();
  const labId = "superconductivity-meissner";

  // Simulation controls
  const [temperature, setTemperature] = useState(120.0); // Kelvin
  const [magneticField, setMagneticField] = useState(1.0); // Tesla
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0);

  const logInterval = 10;
  const simulationSpeed = 1;

  // Running states
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<SuperconductivityDataPoint[]>([]);
  const [lastLoggedTime, setLastLoggedTime] = useState(0);

  // Quest states
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  // References
  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const lastLoggedTimeRef = useRef(lastLoggedTime);
  const temperatureRef = useRef(temperature);
  const magneticFieldRef = useRef(magneticField);
  const materialIdxRef = useRef(selectedMaterialIdx);
  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { lastLoggedTimeRef.current = lastLoggedTime; }, [lastLoggedTime]);
  useEffect(() => { temperatureRef.current = temperature; }, [temperature]);
  useEffect(() => { magneticFieldRef.current = magneticField; }, [magneticField]);
  useEffect(() => { materialIdxRef.current = selectedMaterialIdx; }, [selectedMaterialIdx]);
  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  const activeMaterial = MATERIALS[selectedMaterialIdx];
  const Tc = activeMaterial.tc;

  // Calculate resistance
  const getResistance = (T: number, matIdx: number) => {
    const mat = MATERIALS[matIdx];
    if (T < mat.tc) return 0.0;
    return mat.r0 + mat.alpha * (T - mat.tc);
  };

  const currentResistance = getResistance(temperature, selectedMaterialIdx);

  // Calculate levitation height (in mm, max 15mm)
  const getLevitationHeight = (T: number, B: number, matIdx: number) => {
    const mat = MATERIALS[matIdx];
    if (T >= mat.tc) return 0.0;
    const transitionWidth = 5.0;
    const shielding = 1.0 - Math.exp(-(mat.tc - T) / transitionWidth);
    return 15.0 * shielding * Math.tanh(B / 0.5);
  };

  const levitationHeight = getLevitationHeight(temperature, magneticField, selectedMaterialIdx);

  // Main run tick loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        const deltaSeconds = 0.1 * simulationSpeed;
        const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
        setElapsedSeconds(nextSeconds);
        elapsedSecondsRef.current = nextSeconds;

        const currentT = temperatureRef.current;
        const currentB = magneticFieldRef.current;
        const currentMatIdx = materialIdxRef.current;
        const curR = getResistance(currentT, currentMatIdx);
        const curH = getLevitationHeight(currentT, currentB, currentMatIdx);

        // Quest progress update: maintain levitation height between 8.0 mm and 12.0 mm
        if (curH >= 8.0 && curH <= 12.0) {
          const nextProgress = Math.min(5.0, questProgressRef.current + deltaSeconds);
          setQuestProgress(nextProgress);
          questProgressRef.current = nextProgress;
        }

        // Auto logging check
        if (nextSeconds - lastLoggedTimeRef.current >= logInterval) {
          setDataPoints((prev) =>
            [
              ...prev,
              {
                time: nextSeconds,
                temperature: currentT,
                magneticField: currentB,
                resistance: curR,
                levitationHeight: curH,
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

  // Quest trigger alert
  useEffect(() => {
    if (questProgress >= 5.0 && !questSuccess) {
      const timeoutId = setTimeout(() => {
        setQuestSuccess(true);
        alert("🎉 ยินดีด้วย! คุณสามารถควบคุมอุณหภูมิและสนามแม่เหล็กเพื่อลอยแม่เหล็กได้ในระยะสมดุล (8 - 12 mm) ต่อเนื่องครบ 5 วินาทีสำเร็จ!");
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [questProgress, questSuccess]);

  const handleStartStop = () => {
    setIsRunning(prev => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTemperature(120.0);
    setMagneticField(1.0);
    setElapsedSeconds(0);
    setQuestProgress(0);
    setQuestSuccess(false);
    setDataPoints([]);
    setLastLoggedTime(0);
  };

  const handleAddPoint = () => {
    setDataPoints((prev) =>
      [
        ...prev,
        {
          time: elapsedSeconds,
          temperature,
          magneticField,
          resistance: currentResistance,
          levitationHeight,
        },
      ].slice(-MAX_DATA_POINTS),
    );
  };

  const handleClearPoint = (index: number) => {
    setDataPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopyData = () => {
    if (dataPoints.length === 0) return;
    const header = "Time(s)\tTemp(K)\tB(T)\tR(Ohm)\tHeight(mm)\n";
    const rows = dataPoints
      .map(
        (p) =>
          `${p.time.toFixed(1)}\t${p.temperature.toFixed(1)}\t${p.magneticField.toFixed(2)}\t${p.resistance.toFixed(4)}\t${p.levitationHeight.toFixed(2)}`,
      )
      .join("\n");
    navigator.clipboard.writeText(header + rows);
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) return;
    const header = "Time(s),Temp(K),B(T),R(Ohm),Height(mm)\n";
    const rows = dataPoints
      .map(
        (p) =>
          `${p.time.toFixed(1)},${p.temperature.toFixed(1)},${p.magneticField.toFixed(2)},${p.resistance.toFixed(4)},${p.levitationHeight.toFixed(2)}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `superconductivity_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    const experimentData = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      material: activeMaterial.name,
      temperature,
      magneticField,
      dataPoints,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_superconductivity_experiment",
      localPayload: experimentData,
      labId,
      title: "Superconductivity & Meissner Effect",
      variables: {
        material: activeMaterial.name,
        temperature,
        magneticField,
        logInterval,
        simulationSpeed,
      },
      liveValues: {
        resistance: currentResistance,
        levitationHeight,
        elapsedSeconds,
        questProgress,
        questSuccess,
      },
      graphPoints: dataPoints.map(p => ({ x: p.temperature, y: p.resistance })),
      tableRows: dataPoints,
      summary: {
        finalResistance: currentResistance,
        finalHeight: levitationHeight,
        questSuccess,
      },
    });

    alert("บันทึกรายงานผลการทดลองสภาพนำยิ่งยวดสำเร็จ! 🎉");
    router.push(`/labs/${labId}`);
  };

  // Subcomponents defined locally
  const simControls = (
    <div className="space-y-5">
      {/* Preset Material */}
      <div className="space-y-2">
        <label className="block text-xs sm:text-sm font-bold text-slate-650">วัสดุตัวนำยิ่งยวด</label>
        <div className="grid grid-cols-3 gap-1.5">
          {MATERIALS.map((mat, idx) => (
            <button
              key={mat.name}
              onClick={() => {
                setSelectedMaterialIdx(idx);
                // Adjust starting temperature to slightly above material Tc
                setTemperature(Math.round(mat.tc * 1.3));
              }}
              className={`rounded-lg py-1.5 text-[10px] sm:text-xs font-black transition-all ${
                selectedMaterialIdx === idx
                  ? "bg-violet-50 text-violet-700 border border-violet-200"
                  : "bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100"
              }`}
            >
              {mat.name.split(" ")[0]}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 font-bold">อุณหภูมิวิกฤตวิเคราะห์ (T_c) = {Tc.toFixed(1)} K</p>
      </div>

      {/* Slider: Temperature */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-600">อุณหภูมิระบบ (T)</span>
          <span className="text-violet-650 font-mono">{temperature.toFixed(1)} K</span>
        </div>
        <input
          type="range"
          min="4.0"
          max="150.0"
          step="0.5"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full accent-violet-650"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>4 K</span>
          <span>150 K</span>
        </div>
      </div>

      {/* Slider: Magnetic Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-600">สนามแม่เหล็กภายนอก (B)</span>
          <span className="text-violet-650 font-mono">{magneticField.toFixed(2)} T</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="2.0"
          step="0.05"
          value={magneticField}
          onChange={(e) => setMagneticField(parseFloat(e.target.value))}
          className="w-full accent-violet-650"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>0.1 T</span>
          <span>2.0 T</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={handleStartStop}
          className={`flex-grow flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition-all active:scale-95 ${
            isRunning
              ? "bg-slate-700 shadow-lg shadow-slate-500/10"
              : "bg-violet-600 shadow-lg shadow-violet-500/20 hover:bg-violet-700"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" />
              <span>หยุดตรวจจับ</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>เริ่มตรวจจับ</span>
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
          title="รีเซ็ต"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={handleAddPoint}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
          title="บันทึกจุด"
        >
          <ClipboardList className="h-4 w-4 text-violet-500" />
        </button>
      </div>
    </div>
  );

  const dataTable = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ตารางวิเคราะห์ความต่างศักย์และอุณหภูมิ</span>
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
                <th className="px-3 py-2">T (K)</th>
                <th className="px-3 py-2">B (T)</th>
                <th className="px-3 py-2">R (Ω)</th>
                <th className="px-3 py-2">ระยะลอย (mm)</th>
                <th className="px-2 py-2 text-center">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataPoints.map((point, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono">{point.time.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono">{point.temperature.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono">{point.magneticField.toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono">
                    {point.resistance === 0 ? (
                      <span className="text-emerald-600 font-extrabold">0.0000 (Super)</span>
                    ) : (
                      point.resistance.toFixed(4)
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono">{point.levitationHeight.toFixed(2)} mm</td>
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
      accent="violet"
      labId={labId}
      category="Physics"
      title="Superconductivity (สภาพนำยิ่งยวด)"
      subtitle="ทดลองระบายความร้อนเพื่อสังเกตการสูญเสียความต้านทานไฟฟ้าที่อุณหภูมิต่ำวิกฤตของวัสดุตัวนำยิ่งยวด พร้อมศึกษากระแสไหลวนขับสนามแม่เหล็กด้วยปรากฏการณ์ไมส์เนอร์"
      statusLabel={temperature < Tc ? "สถานะนำยิ่งยวด ⚡" : "สถานะโลหะปกติ 🌡️"}
      icon={Zap}
      sceneTitle="ภาพจำลองสภาพเหนี่ยวนำและการลอยตัวแม่เหล็ก (Meissner Levitation)"
      scene={
        <SuperconductivityViewport
          temperature={temperature}
          Tc={Tc}
          levitationHeight={levitationHeight}
        />
      }
      controlsTitle="แผงควบคุมสภาวะอุณหภูมิแม่เหล็กไฟฟ้า"
      controls={simControls}
      metrics={[
        { label: "อุณหภูมิระบบ", value: `${temperature.toFixed(1)} K`, tone: "violet" },
        { label: "ความต้านทานไฟฟ้า", value: `${currentResistance.toFixed(4)} Ω`, tone: currentResistance === 0 ? "emerald" : "orange" },
        { label: "ระยะลอยของแม่เหล็ก", value: `${levitationHeight.toFixed(1)} mm`, tone: "cyan" },
        { label: "แรงต้านสนามแม่เหล็ก", value: temperature < Tc ? "🛡️ ทำงานเต็มพิกัด" : "❌ รั่วไหลทะลุผ่าน", tone: "blue" },
      ]}
      graph={
        <SuperconductivityGraph
          temperature={temperature}
          Tc={Tc}
          materialIdx={selectedMaterialIdx}
        />
      }
      table={dataTable}
      theory={<SuperconductivityTheory Tc={Tc} />}
      steps={[
        { label: "เลือกชนิดวัสดุเพื่อทราบค่า T_c", icon: Sliders },
        { label: "ปรับระดับสนามแม่เหล็กกระตุ้น B", icon: Target },
        { label: "ค่อย ๆ คูลดาวน์ระบบต่ำกว่า T_c", icon: Thermometer },
        { label: "สังเกตความต้านทานไฟฟ้าและระดับลอย", icon: Zap },
      ]}
      learningGoals={[
        "เรียนรู้ความแตกต่างระหว่างตัวนำยิ่งยวดและโลหะนำไฟฟ้าทั่วไป",
        "เข้าใจอุณหภูมิวิกฤต T_c และการสูญเสียแรงเสียดทานไฟฟ้าเชิงลึก",
        "ศึกษาแนวคิด Meissner effect และสภาวะแม่เหล็กไดอะแมกเนติกสมบูรณ์",
      ]}
      progressLabel="ระยะเวลาที่รักษาระดับสมดุล 8-12 mm"
      progressValue={`${questProgress.toFixed(1)} / 5.0 วินาที`}
      progressPercent={(questProgress / 5.0) * 100}
      tips={[
        "ค่าความต้านทานไฟฟ้าจะกลายเป็นศูนย์โดยสมบูรณ์ทันทีที่ระบบถูกคูลดาวน์ลงต่ำกว่า T_c",
        "เมื่อวัสดุเข้าสู่สถานะตัวนำยิ่งยวด จะกีดกันสนามแม่เหล็กภายนอกทันที ส่งผลให้แม่เหล็กเริ่มลอยตัวเหนือแผ่นตัวนำ",
        "ภารกิจ: ควบคุมความสูงในการลอยตัวของแม่เหล็กให้อยู่ในช่วง 8.0 - 12.0 mm ต่อเนื่องกันเป็นเวลา 5 วินาที",
      ]}
      onSave={handleSaveResults}
    />
  );
}

// ------------------- VIEWPORT COMPONENT -------------------
interface ViewportProps {
  temperature: number;
  Tc: number;
  levitationHeight: number;
}

function SuperconductivityViewport({
  temperature,
  Tc,
  levitationHeight,
}: ViewportProps) {
  const isSuper = temperature < Tc;

  // mist particles animation
  const [mist, setMist] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number }>>([]);
  const mistIdCounter = useRef(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    if (temperature < 77.0) { // liquid nitrogen boiling temperature
      interval = setInterval(() => {
        setMist((prev) => {
          const next = prev
            .map((m) => ({ ...m, y: m.y - 1.5, opacity: m.opacity - 0.03 }))
            .filter((m) => m.opacity > 0);

          if (next.length < 25) {
            next.push({
              id: mistIdCounter.current++,
              x: 100 + Math.random() * 200,
              y: 200 + Math.random() * 10,
              size: 4 + Math.random() * 8,
              opacity: 0.6 + Math.random() * 0.4,
            });
          }
          return next;
        });
      }, 40);
    } else {
      timeoutId = setTimeout(() => {
        setMist([]);
      }, 0);
    }
    return () => {
      if (interval) clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [temperature]);

  return (
    <div className="relative w-full h-full min-h-[340px] bg-slate-950 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-800">
      <svg className="w-full h-full" viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="puckGrad" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </radialGradient>
          <linearGradient id="magnetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="49%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Backdrop Glow */}
        <circle cx="200" cy="180" r="100" fill={isSuper ? "#8b5cf6" : "#f97316"} opacity="0.08" className="transition-all duration-500" />

        {/* Magnetic field lines */}
        <g stroke={isSuper ? "#c084fc" : "#fdba74"} strokeWidth="1.5" fill="none" opacity={isSuper ? "0.6" : "0.3"} className="transition-all duration-700">
          {isSuper ? (
            // Excluded lines going around the puck
            <>
              {/* Left exclusion lines */}
              <path d="M 120 70 C 50 120, 50 200, 120 250" strokeDasharray="3 3" />
              <path d="M 150 70 C 80 110, 80 200, 150 250" />
              <path d="M 170 70 C 110 120, 110 190, 170 250" />

              {/* Right exclusion lines */}
              <path d="M 280 70 C 350 120, 350 200, 280 250" strokeDasharray="3 3" />
              <path d="M 250 70 C 320 110, 320 200, 250 250" />
              <path d="M 230 70 C 290 120, 290 190, 230 250" />
            </>
          ) : (
            // Penetrating lines going straight through
            <>
              <path d="M 150 70 L 150 250" />
              <path d="M 175 70 L 175 250" />
              <path d="M 200 70 L 200 250" />
              <path d="M 225 70 L 225 250" />
              <path d="M 250 70 L 250 250" />
            </>
          )}
        </g>

        {/* Superconductor Puck */}
        <ellipse cx="200" cy="210" rx="100" ry="25" fill="url(#puckGrad)" />
        <path d="M 100 210 A 100 25 0 0 0 300 210 L 300 230 A 100 25 0 0 1 100 230 Z" fill="#334155" />

        {/* Cold vapor particles rising */}
        {mist.map((m) => (
          <circle key={m.id} cx={m.x} cy={m.y} r={m.size} fill="#e2e8f0" opacity={m.opacity} />
        ))}

        {/* Levitating Magnet */}
        {/* We base position y on levitationHeight: 0mm = bottom y 180, 15mm = top y 110 */}
        <g transform={`translate(0, ${-levitationHeight * 4.6})`} className="transition-all duration-300">
          {/* Magnet body */}
          <rect x="160" y="145" width="80" height="25" rx="4" fill="url(#magnetGrad)" stroke="#1e293b" strokeWidth="1" />
          {/* Red/Blue split visual labels */}
          <text x="180" y="161" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">N</text>
          <text x="220" y="161" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">S</text>
        </g>

        {/* Ground shadow beneath the magnet */}
        <ellipse cx="200" cy="205" rx={Math.max(10, 45 - levitationHeight * 2)} ry={Math.max(2, 10 - levitationHeight * 0.5)} fill="#0f172a" opacity="0.6" className="transition-all duration-300" />
      </svg>

      {/* Live parameters panel */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-0.5 text-[10px] sm:text-xs">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isSuper ? "bg-emerald-500 shadow-md shadow-emerald-500/50" : "bg-red-500 animate-pulse"}`} />
          <span className="font-extrabold text-slate-300">
            {isSuper ? "Superconducting Phase" : "Normal Resistor Phase"}
          </span>
        </div>
        <p className="text-slate-400 font-medium">Levitation Height: <span className="font-mono text-cyan-400 font-extrabold">{levitationHeight.toFixed(2)} mm</span></p>
      </div>
    </div>
  );
}

// ------------------- GRAPH COMPONENT -------------------
interface GraphProps {
  temperature: number;
  Tc: number;
  materialIdx: number;
}

function SuperconductivityGraph({ temperature, Tc, materialIdx }: GraphProps) {
  // Generate curve points for R vs T
  const points: Array<{ x: number; y: number }> = [];
  const mat = MATERIALS[materialIdx];

  // T from 0K to 150K
  for (let t = 0; t <= 150; t += 2) {
    let r = 0.0;
    if (t >= mat.tc) {
      r = mat.r0 + mat.alpha * (t - mat.tc);
    }
    points.push({ x: t, y: r });
  }

  // Scale variables to fit SVG viewBox 300x160
  // x: 0K to 150K -> scaled to [25, 280]
  // y: 0 Ohm to 0.4 Ohm -> scaled to [140, 10]
  const scaleX = (x: number) => 25 + (x / 150) * 255;
  const scaleY = (y: number) => 140 - (y / 0.4) * 130;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.x)} ${scaleY(p.y)}`).join(" ");

  return (
    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between select-none h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">กราฟวิเคราะห์ R(T) สหสัมพันธ์</span>
        <span className="text-[10px] font-black text-violet-500 font-mono">R vs Temperature (K)</span>
      </div>
      <div className="flex-grow">
        <svg className="w-full h-auto" viewBox="0 0 300 160">
          {/* Grid lines */}
          <line x1="25" y1="140" x2="280" y2="140" stroke="#334155" strokeWidth="1" />
          <line x1="25" y1="10" x2="25" y2="140" stroke="#334155" strokeWidth="1" />

          {/* Grid labels */}
          <text x="25" y="152" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">0K</text>
          <text x="110" y="152" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">50K</text>
          <text x="195" y="152" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">100K</text>
          <text x="280" y="152" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">150K</text>

          <text x="20" y="143" fill="#64748b" fontSize="8" textAnchor="end" fontWeight="bold">0.0</text>
          <text x="20" y="78" fill="#64748b" fontSize="8" textAnchor="end" fontWeight="bold">0.2</text>
          <text x="20" y="13" fill="#64748b" fontSize="8" textAnchor="end" fontWeight="bold">0.4 Ω</text>

          {/* R vs T Curve */}
          <path d={pathD} fill="none" stroke="#a78bfa" strokeWidth="2.5" />

          {/* Critical temperature marker */}
          <line x1={scaleX(Tc)} y1="10" x2={scaleX(Tc)} y2="140" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
          <text x={scaleX(Tc) + 4} y="20" fill="#ef4444" fontSize="7" fontWeight="black">Tc = {Tc}K</text>

          {/* Current state marker dot */}
          {points.length > 0 && (
            <circle
              cx={scaleX(temperature)}
              cy={scaleY(temperature >= Tc ? mat.r0 + mat.alpha * (temperature - mat.tc) : 0)}
              r="4.5"
              fill={temperature < Tc ? "#10b981" : "#f97316"}
            />
          )}
        </svg>
      </div>
    </div>
  );
}

// ------------------- THEORY COMPONENT -------------------
function SuperconductivityTheory({ Tc }: { Tc: number }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-3 leading-relaxed">
      <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
        <Zap className="w-4.5 h-4.5 text-violet-500" />
        ทฤษฎีสภาพนำยิ่งยวด & ปรากฏการณ์ไมส์เนอร์
      </h3>
      <p>
        <strong>สภาพนำยิ่งยวด (Superconductivity)</strong> คือสภาวะของวัสดุตัวนำบางชนิดที่สูญเสียความต้านทานไฟฟ้าโดยสิ้นเชิง ($R = 0$) เมื่ออุณหภูมิลดลงต่ำกว่าค่าอุณหภูมิวิกฤต ($T_c$) ซึ่งแตกต่างกับตัวนำโลหะทั่วไปที่มีแนวโน้มคงเหลือความต้านทานไฟฟ้าคงตัวจากสั่นไหวของโครงผลึกและการกระเจิงของอิเล็กตรอน
      </p>
      <p>
        <strong>ปรากฏการณ์ไมส์เนอร์ (Meissner Effect)</strong> คือสมบัติทางแม่เหล็กพิเศษของตัวนำยิ่งยวด เมื่ออยู่ต่ำกว่า $T_c$ วัสดุจะขับสนามแม่เหล็กภายนอกออกจากตัวโดยสมบูรณ์ ทำให้เกิดแรงผลักกับขั้วแม่เหล็กและเกิดการลอยตัวต้านแรงโน้มถ่วง
      </p>
      <p className="font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[10px] text-violet-400">
        {`R(T) = R0 + α(T - Tc)   [T >= Tc]`}
        <br />
        {`R(T) = 0               [T < Tc]`}
        <br />
        {`Tc = ${Tc.toFixed(1)} K`}
      </p>
    </div>
  );
}
