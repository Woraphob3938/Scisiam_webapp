"use client";

import React, { useState, useEffect, useRef } from "react";
import SharedSimulationShell from "./SharedSimulationShell";
import { Beaker, Thermometer, RotateCcw, Info, Play, Pause, Flame } from "lucide-react";
import { labsById } from "@/data/labs";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface GraphPoint { x: number; y: number; }

interface SimulationLog {
  id: number;
  time: number;
  temperature: number;
  materialName: string;
  state: string;
  note: string;
}

const materials = [
  { id: "ice", name: "น้ำแข็ง (Ice)", meltingPoint: 0, boilingPoint: 100, color: "#3b82f6", liquidColor: "#60a5fa", solidLabel: "น้ำแข็ง (Solid)", liquidLabel: "น้ำ (Liquid)", gasLabel: "ไอน้ำ (Gas)" },
  { id: "chocolate", name: "ช็อกโกแลต (Chocolate)", meltingPoint: 32, boilingPoint: 999, color: "#78350f", liquidColor: "#92400e", solidLabel: "ช็อกโกแลตแท่ง (Solid)", liquidLabel: "ช็อกโกแลตเหลว (Liquid)", gasLabel: "ไหม้ (Burned)" },
  { id: "wax", name: "เทียนไข (Candle Wax)", meltingPoint: 60, boilingPoint: 999, color: "#fef08a", liquidColor: "#fef9c3", solidLabel: "เทียนไขแข็ง (Solid)", liquidLabel: "เทียนไขเหลว (Liquid)", gasLabel: "ระเหย (Vaporized)" },
];

export default function HeatingCoolingMaterialsSimulation() {
  const labId = "heating-cooling-materials";
  const labData = labsById[labId];

  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [envTemp, setEnvTemp] = useState(25); // -15 to 150
  const [temperature, setTemperature] = useState(25); // Current temp of material
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [observations, setObservations] = useState<SimulationLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // References for simulation loop
  const temperatureRef = useRef(25);
  const elapsedSecondsRef = useRef(0);
  const envTempRef = useRef(envTemp);

  const requestRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const simulateStep = (dt: number) => {
    // k represents heat transfer speed
    const k = 0.05;
    const diff = envTempRef.current - temperatureRef.current;

    // dT = k * (T_env - T) * dt
    temperatureRef.current += diff * k * dt;
    elapsedSecondsRef.current += dt;
  };

  const animate = (time: number) => {
    if (!lastUpdateRef.current) lastUpdateRef.current = time;
    const delta = Math.min((time - lastUpdateRef.current) / 1000, 0.1);
    lastUpdateRef.current = time;

    if (isRunning) {
      simulateStep(delta);

      // Throttle state updates for React
      setTemperature(temperatureRef.current);
      setElapsedSeconds(elapsedSecondsRef.current);
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    temperatureRef.current = 25;
    elapsedSecondsRef.current = 0;
    setTemperature(25);
    setElapsedSeconds(0);
  };

  // Determine state based on current temperature
  const getCurrentState = (temp: number) => {
    if (temp < selectedMaterial.meltingPoint) {
      return { id: "solid", label: selectedMaterial.solidLabel };
    }
    if (temp < selectedMaterial.boilingPoint) {
      return { id: "liquid", label: selectedMaterial.liquidLabel };
    }
    return { id: "gas", label: selectedMaterial.gasLabel };
  };

  const matState = getCurrentState(temperature);

  const handleLogObservation = () => {
    const note = temperature <= selectedMaterial.meltingPoint ? "แข็งตัวเป็นของแข็ง" :
                 (temperature >= selectedMaterial.boilingPoint ? "เดือดกลายเป็นแก๊ส" : "หลอมเหลวเป็นของเหลว");

    const newLog: SimulationLog = {
      id: observations.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      time: Math.round(elapsedSeconds),
      temperature,
      materialName: selectedMaterial.name,
      state: matState.label,
      note,
    };

    setObservations(prev => [newLog, ...prev]);
  };

  const handleClearLogs = () => {
    setObservations([]);
  };

  const handleSave = async () => {
    if (observations.length === 0) {
      window.alert("กรุณาบันทึกข้อมูลตารางทดลองอย่างน้อย 1 รายการก่อนบันทึกผล");
      return;
    }

    setIsSaving(true);
    try {
      await saveExperimentAndSync({
        localStorageKey: "scisiam_saved_heating_cooling_materials_experiment",
        localPayload: {
          labId,
          timestamp: new Date().toISOString(),
          observations,
        },
        labId,
        title: "การร้อนและเย็นของวัสดุ",
        variables: { envTemperature: envTemp },
        liveValues: {
          material: selectedMaterial.id,
          temperature,
          state: matState.id,
        },
        graphPoints: observations.map(o => ({
          x: o.time,
          y: o.temperature,
        })),
        tableRows: observations,
        summary: {
          logCount: observations.length,
          finalState: matState.label,
          finalTemp: temperature,
        },
        durationSeconds: Math.round(elapsedSeconds),
      });
      window.alert("บันทึกผลการทดลองการร้อนและเย็นของวัสดุแล้ว");
    } finally {
      setIsSaving(false);
    }
  };

  const getMetricDisplay = () => [
    { label: "อุณหภูมิวัสดุ", value: `${temperature.toFixed(1)} °C` },
    { label: "สถานะปัจจุบัน", value: matState.label },
    { label: "เวลาจำลอง", value: `${Math.round(elapsedSeconds)} วินาที` },
  ];

  // Render SVG view of the material melting/freezing
  const renderMaterialVisuals = () => {
    const isSolid = matState.id === "solid";
    const isLiquid = matState.id === "liquid";
    const isGas = matState.id === "gas";

    // Dynamic melting ratio for visuals (0 solid -> 1 liquid)
    const meltProgress = isSolid ? 0 :
                        isGas ? 1 :
                        Math.min((temperature - selectedMaterial.meltingPoint) / 10, 1);

    if (selectedMaterial.id === "ice") {
      return (
        <g>
          {/* Ice block shrinking */}
          {meltProgress < 1 && (
            <rect
              x={110 + meltProgress * 20}
              y={180 + meltProgress * 30}
              width={80 - meltProgress * 40}
              height={60 - meltProgress * 50}
              fill="#93c5fd"
              rx={5}
              opacity={0.8 - meltProgress * 0.5}
            />
          )}
          {/* Liquid pool accumulating */}
          {meltProgress > 0 && (
            <path
              d={`M 92 ${246 - meltProgress * 15} Q 150 ${242 - meltProgress * 20} 208 ${246 - meltProgress * 15} L 208 248 L 92 248 Z`}
              fill="#3b82f6"
              opacity="0.6"
            />
          )}
          {/* Steam boiling particles */}
          {isGas && (
            <g opacity="0.7">
              <path d="M 120 160 Q 125 150 120 140 T 120 120" stroke="#cbd5e1" strokeWidth="2" fill="none" className="animate-pulse" />
              <path d="M 150 155 Q 155 145 150 135 T 150 115" stroke="#cbd5e1" strokeWidth="2" fill="none" className="animate-pulse" />
              <path d="M 180 160 Q 185 150 180 140 T 180 120" stroke="#cbd5e1" strokeWidth="2" fill="none" className="animate-pulse" />
            </g>
          )}
        </g>
      );
    }

    if (selectedMaterial.id === "chocolate") {
      return (
        <g>
          {/* Solid chocolate blocks */}
          {meltProgress < 1 && (
            <g transform={`translate(${110 + meltProgress * 15}, ${190 + meltProgress * 20}) scale(${1 - meltProgress * 0.7})`} opacity={1 - meltProgress * 0.3}>
              <rect x="0" y="0" width="35" height="35" fill="#78350f" rx="3" />
              <rect x="5" y="5" width="10" height="10" fill="#92400e" rx="1" />
              <rect x="20" y="5" width="10" height="10" fill="#92400e" rx="1" />
              <rect x="5" y="20" width="10" height="10" fill="#92400e" rx="1" />
              <rect x="20" y="20" width="10" height="10" fill="#92400e" rx="1" />
              <rect x="40" y="10" width="30" height="30" fill="#451a03" rx="3" />
            </g>
          )}
          {/* Liquid puddle */}
          {meltProgress > 0 && (
            <path
              d={`M 92 ${248 - meltProgress * 20} Q 150 ${242 - meltProgress * 25} 208 ${248 - meltProgress * 20} L 208 248 L 92 248 Z`}
              fill="#5c2c0e"
            />
          )}
        </g>
      );
    }

    if (selectedMaterial.id === "wax") {
      return (
        <g>
          {/* Solid candle wax cylinder */}
          {meltProgress < 1 && (
            <g opacity={1 - meltProgress * 0.5}>
              <rect
                x={130 + meltProgress * 10}
                y={150 + meltProgress * 40}
                width={40 - meltProgress * 20}
                height={90 - meltProgress * 65}
                fill="#fef08a"
                rx={3}
              />
              <line
                x1="150"
                y1={140 + meltProgress * 50}
                x2="150"
                y2={150 + meltProgress * 40}
                stroke="#64748b"
                strokeWidth="2"
              />
            </g>
          )}
          {/* Melting yellow liquid puddle */}
          {meltProgress > 0 && (
            <path
              d={`M 92 ${248 - meltProgress * 15} Q 150 ${245 - meltProgress * 20} 208 ${248 - meltProgress * 15} L 208 248 L 92 248 Z`}
              fill="#fef08a"
              opacity="0.8"
            />
          )}
        </g>
      );
    }

    return null;
  };

  return (
    <SharedSimulationShell
      accent="orange"
      labId={labId}
      category={labData?.category || "Chemistry"}
      title={labData?.thaiTitle || labData?.title || "การร้อนและเย็นของวัสดุ"}
      subtitle={labData?.description || ""}
      statusLabel="พร้อมใช้งาน"
      icon={Flame}
      sceneTitle="จานทดลองความร้อน"
      scene={
        <div className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 min-h-[340px] relative w-full h-full">
          <svg viewBox="0 0 300 300" className="w-full max-w-sm h-auto drop-shadow-md" aria-labelledby="sim-title sim-desc">
            <title id="sim-title">จำลองอุณหภูมิของแข็งและของเหลว</title>
            <desc id="sim-desc">แสดงการเปลี่ยนแปลงทางกายภาพตามอุณหภูมิห้องทดลอง</desc>

            {/* Heating/Cooling base plate */}
            <rect x="70" y="248" width="160" height="20" fill={envTemp > 40 ? "#f87171" : envTemp < 10 ? "#93c5fd" : "#94a3b8"} rx="4" />
            <rect x="80" y="268" width="140" height="15" fill="#475569" />

            {/* Material container beaker */}
            <path d="M 90 120 L 90 240 Q 90 248 100 248 L 200 248 Q 210 248 210 240 L 210 120" fill="none" stroke="#64748b" strokeWidth="4" />

            {/* Dynamic material rendering */}
            {renderMaterialVisuals()}

            {/* Fire particles if heating */}
            {isRunning && envTemp > 40 && (
              <g transform="translate(150, 275)" className="animate-bounce">
                <circle cx="-20" cy="0" r="4" fill="#f97316" />
                <circle cx="0" cy="-5" r="5" fill="#ef4444" />
                <circle cx="20" cy="0" r="4" fill="#f97316" />
              </g>
            )}

            {/* Ice particles if freezing */}
            {isRunning && envTemp < 10 && (
              <g transform="translate(150, 275)" opacity="0.6">
                <rect x="-30" y="-2" width="6" height="6" fill="#38bdf8" />
                <rect x="0" y="-6" width="5" height="5" fill="#38bdf8" />
                <rect x="25" y="-2" width="6" height="6" fill="#38bdf8" />
              </g>
            )}
          </svg>

          {/* Interactive Temperature gauge on the side */}
          <div className="absolute right-4 top-4 bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-1">
            <Thermometer className="w-5 h-5 text-red-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{temperature.toFixed(0)} °C</span>
          </div>
        </div>
      }
      controlsTitle="ตั้งค่าวัสดุและแหล่งความร้อน"
      controls={
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">เลือกวัสดุ</label>
            <div className="grid grid-cols-3 gap-2">
              {materials.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMaterial(m);
                    handleReset();
                  }}
                  className={`px-2 py-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                    selectedMaterial.id === m.id
                      ? "bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-350 hover:bg-slate-50"
                  }`}
                >
                  {m.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          <div>
            <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>ตั้งค่าแหล่งจ่ายอุณหภูมิ</span>
              <span className="text-orange-600 dark:text-orange-400 font-bold">{envTemp} °C</span>
            </div>
            <input
              type="range"
              min="-15"
              max="150"
              step="5"
              value={envTemp}
              onChange={(e) => {
                const nextTemperature = parseInt(e.target.value);
                envTempRef.current = nextTemperature;
                setEnvTemp(nextTemperature);
              }}
              className="w-full accent-orange-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>ฟรีซเซอร์ (-15 °C)</span>
              <span>อุณหภูมิห้อง (25 °C)</span>
              <span>เตาต้ม (150 °C)</span>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-2 px-4 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                isRunning ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? "หยุดจำลอง" : "เริ่มจำลอง"}
            </button>
            <button
              onClick={handleReset}
              className="py-2 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <button
            onClick={handleLogObservation}
            className="w-full py-2 border border-dashed border-orange-300 dark:border-orange-800 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/20 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
          >
            บันทึกค่าลงตารางทดลอง
          </button>
        </div>
      }
      metrics={getMetricDisplay()}
      graph={null}
      table={
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="p-3">เวลา (วินาที)</th>
                <th className="p-3">วัสดุ</th>
                <th className="p-3">อุณหภูมิ (°C)</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3">รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {observations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 italic">ยังไม่มีข้อมูลการบันทึกการเปลี่ยนแปลงของอุณหภูมิ</td>
                </tr>
              ) : (
                observations.map(o => (
                  <tr key={o.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{o.time} วินาที</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{o.materialName}</td>
                    <td className="p-3 font-bold text-orange-600 dark:text-orange-400">{o.temperature.toFixed(1)} °C</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{o.state}</td>
                    <td className="p-3 text-slate-500 italic">{o.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {observations.length > 0 && (
            <div className="p-2 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <button onClick={handleClearLogs} className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors">
                ล้างตารางทดสอบ
              </button>
            </div>
          )}
        </div>
      }
      theory={
        <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>
            <strong>การร้อนและการเย็น (Heating & Cooling)</strong> ส่งผลต่อพลังงานความร้อนในโครงสร้างโมเลกุลของสสาร ทำให้เกิดการเปลี่ยนแปลงสถานะหรือคุณสมบัติทางกายภาพ
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>การหลอมเหลว (Melting)</strong>: การเพิ่มความร้อนให้กับของแข็ง ทำให้อนุภาคแยกออกจากกันและเปลี่ยนเป็นของเหลว (เช่น เทียนไขละลาย ช็อกโกแลตละลาย)</li>
            <li><strong>การแข็งตัว (Solidification/Freezing)</strong>: การลดอุณหภูมิของเหลว ทำให้อนุภาคเรียงตัวกลับมานิ่งเป็นของแข็ง (เช่น น้ำกลายเป็นน้ำแข็ง)</li>
            <li><strong>การเปลี่ยนแปลงที่ย้อนกลับได้ (Reversible Changes)</strong>: สารสามารถกลับคืนสู่สถานะเดิมได้เมื่อเปลี่ยนอุณหภูมิกลับ</li>
          </ul>
        </div>
      }
      steps={[
        { label: "เลือกประเภทวัสดุที่ต้องการทดสอบในแท็บความคุม", icon: Beaker },
        { label: "ปรับอุณหภูมิของแหล่งจ่ายเพื่อสังเกตการทำปฏิกิริยา", icon: Flame },
        { label: "กดปุ่ม 'เริ่มจำลอง' เพื่อปล่อยให้อุณหภูมิและสถานะปรับสมดุล", icon: Play },
        { label: "กดบันทึกข้อมูลเพื่อดูค่าที่เปลี่ยนไปตามเวลาในตาราง", icon: Info },
      ]}
      learningGoals={[
        "เรียนรู้คุณสมบัติของของแข็ง ของเหลว และแก๊ส ตามระดับอุณหภูมิ",
        "วิเคราะห์จุดหลอมเหลวและจุดเดือดของสารแต่ละชนิดผ่านกราฟและตัวเลข",
        "เข้าใจความแตกต่างระหว่างการเปลี่ยนแปลงทางกายภาพที่ย้อนกลับได้และสถานะสมดุล",
      ]}
      progressLabel="ระดับการสำรวจวัสดุ"
      progressValue={`${Math.min(observations.length, 3)} / 3`}
      progressPercent={Math.min((observations.length / 3) * 100, 100)}
      tips={[
        "น้ำแข็งหดตัวเล็กลงเมื่อหลอมเหลวเป็นน้ำเนื่องจากโครงสร้างผลึกน้ำแข็งมีความหนาแน่นต่ำกว่าน้ำเหลว",
        "ขี้ผึ้งหรือเทียนไขละลายที่อุณหภูมิประมาณ 60 °C ขึ้นไป และสามารถแข็งกลับมาเป็นรูปเล่มเทียนได้",
        "สังเกตอัตราการแลกเปลี่ยนความร้อนที่เกิดขึ้นเร็วขึ้นเมื่อความต่างอุณหภูมิแวดล้อมมีค่าสูง",
      ]}
      showLiveMetrics={true}
      showInfoTabs={true}
      showSaveButton={true}
      onSave={handleSave}
    />
  );
}
