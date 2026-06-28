"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sliders,
  RotateCcw,
  ClipboardList,
  Compass,
  Sparkles,
  Layers,
  Clipboard,
  Download,
  Trash,
  Target,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

// ponytail: define local type for log
interface LoggedFieldRun {
  index: number;
  fieldType: string;
  probeX: number;
  probeY: number;
  vectorX: number;
  vectorY: number;
  magnitude: number;
  divergence: number;
  curl: number;
}

const FIELD_PRESETS = [
  { id: "rotational", label: "พายุหมุน (Rotational / Curl)", desc: "สนามเวกเตอร์หมุนวนแบบเบ้าลึก: F(x, y) = -y i + x j" },
  { id: "divergence", label: "การแพร่กระจาย (Radial Divergence)", desc: "สนามเวกเตอร์พุ่งกระจายออกจากศูนย์กลาง: F(x, y) = x i + y j" },
  { id: "gradient", label: "เนินเขาความชัน (Gradient of a Hill)", desc: "เกรเดียนต์ของเนินโค้ง: F(x, y) = -0.1x i - 0.1y j" },
] as const;

export default function VectorFieldsGradientsSimulation() {
  const router = useRouter();
  const labId = "vector-fields-gradients";

  const [presetId, setPresetId] = useState<string>("rotational");
  const [probeX, setProbeX] = useState<number>(2.0);
  const [probeY, setProbeY] = useState<number>(1.5);
  const [gridDensity, setGridDensity] = useState<number>(11); // grid size: 9x9, 11x11, etc.
  const [vectorScale, setVectorScale] = useState<number>(1.0);
  const [loggedRuns, setLoggedRuns] = useState<LoggedFieldRun[]>([]);

  // SVG coordinate conversions
  // Map x: [-5, 5] -> [25, 275], y: [-5, 5] -> [275, 25]
  const toSvgX = (x: number) => 150 + x * 25;
  const toSvgY = (y: number) => 150 - y * 25;
  const fromSvgX = (svgX: number) => (svgX - 150) / 25;
  const fromSvgY = (svgY: number) => (150 - svgY) / 25;

  // Calculate vector components at any given (x,y)
  const calculateVector = (x: number, y: number, preset: string) => {
    let vx = 0;
    let vy = 0;
    let div = 0;
    let curl = 0;

    if (preset === "rotational") {
      vx = -y * 0.4;
      vy = x * 0.4;
      div = 0.0;
      curl = 0.8; // constant curl
    } else if (preset === "divergence") {
      vx = x * 0.4;
      vy = y * 0.4;
      div = 0.8; // constant divergence
      curl = 0.0;
    } else if (preset === "gradient") {
      vx = -x * 0.2;
      vy = -y * 0.2;
      div = -0.4; // negative divergence (sink)
      curl = 0.0;
    }

    return { vx, vy, div, curl };
  };

  const currentVector = useMemo(() => {
    return calculateVector(probeX, probeY, presetId);
  }, [probeX, probeY, presetId]);

  const probeMagnitude = useMemo(() => {
    const { vx, vy } = currentVector;
    return Math.sqrt(vx * vx + vy * vy);
  }, [currentVector]);

  // Generate grid points for SVG vector arrows
  const gridArrows = useMemo(() => {
    const arrows = [];
    const step = 10 / (gridDensity - 1);
    for (let i = 0; i < gridDensity; i++) {
      const x = -5 + i * step;
      for (let j = 0; j < gridDensity; j++) {
        const y = -5 + j * step;
        
        // Skip central point on rotational/radial fields to avoid clutter
        if (Math.abs(x) < 0.01 && Math.abs(y) < 0.01) continue;

        const { vx, vy } = calculateVector(x, y, presetId);
        const mag = Math.sqrt(vx * vx + vy * vy);
        if (mag === 0) continue;

        // Normalise and scale arrow length
        const displayLength = Math.min(22, mag * 25 * vectorScale);
        const angle = Math.atan2(vy, vx);

        const startX = toSvgX(x);
        const startY = toSvgY(y);
        const endX = startX + displayLength * Math.cos(angle);
        const endY = startY - displayLength * Math.sin(angle); // flip Y for SVG screen coordinates

        // Opacity/color based on strength
        const strengthPercent = Math.min(1, mag / 2);
        const strokeColor = presetId === "gradient" 
          ? `rgb(${Math.round(239 - strengthPercent * 100)}, ${Math.round(68 + strengthPercent * 50)}, ${Math.round(68 + strengthPercent * 50)})`
          : `rgb(${Math.round(225 - strengthPercent * 50)}, ${Math.round(29 + strengthPercent * 100)}, ${Math.round(72 + strengthPercent * 50)})`;

        arrows.push({
          startX,
          startY,
          endX,
          endY,
          color: strokeColor,
          opacity: 0.35 + strengthPercent * 0.5,
        });
      }
    }
    return arrows;
  }, [gridDensity, presetId, vectorScale]);

  // Drag handler on SVG viewport
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    svgRef.current.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateProbeCoords(e);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    updateProbeCoords(e);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (svgRef.current) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  const updateProbeCoords = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Map back to [-5, 5]
    const x = Math.min(5, Math.max(-5, fromSvgX(clickX)));
    const y = Math.min(5, Math.max(-5, fromSvgY(clickY)));

    // Round to 1 decimal place for cleaner controls
    setProbeX(Math.round(x * 10) / 10);
    setProbeY(Math.round(y * 10) / 10);
  };

  // Pulse & Rotation animation angles
  const [pulseScale, setPulseScale] = useState(1);
  const [rotAngle, setRotAngle] = useState(0);

  useEffect(() => {
    let animId: number;
    let t = 0;
    const updateAnim = () => {
      t += 0.05;
      // Pulse animation for divergence
      setPulseScale(1 + Math.sin(t * 8) * 0.15 * Math.abs(currentVector.div));
      // Rotation animation for curl
      setRotAngle((prev) => (prev + currentVector.curl * 4) % 360);
      animId = requestAnimationFrame(updateAnim);
    };
    animId = requestAnimationFrame(updateAnim);
    return () => cancelAnimationFrame(animId);
  }, [currentVector]);

  // Log functions
  const handleAddLog = () => {
    const run: LoggedFieldRun = {
      index: loggedRuns.length + 1,
      fieldType: FIELD_PRESETS.find((p) => p.id === presetId)?.label || presetId,
      probeX,
      probeY,
      vectorX: currentVector.vx,
      vectorY: currentVector.vy,
      magnitude: probeMagnitude,
      divergence: currentVector.div,
      curl: currentVector.curl,
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setPresetId("rotational");
    setProbeX(2.0);
    setProbeY(1.5);
    setGridDensity(11);
    setVectorScale(1.0);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุด\tประเภทสนาม\tพิกัด X\tพิกัด Y\tเวกเตอร์ X\tเวกเตอร์ Y\tMagnitude\tDivergence\tCurl\n";
    const rows = loggedRuns.map(
      (r) => `${r.index}\t${r.fieldType}\t${r.probeX}\t${r.probeY}\t${r.vectorX.toFixed(3)}\t${r.vectorY.toFixed(3)}\t${r.magnitude.toFixed(3)}\t${r.divergence.toFixed(2)}\t${r.curl.toFixed(2)}`
    );
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map(
      (r) => `${r.index},${r.fieldType},${r.probeX},${r.probeY},${r.vectorX},${r.vectorY},${r.magnitude},${r.divergence},${r.curl}`
    );
    const csv = "data:text/csv;charset=utf-8," + ["Index,FieldType,ProbeX,ProbeY,VectorX,VectorY,Magnitude,Divergence,Curl", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "vector_fields_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    if (loggedRuns.length === 0) {
      alert("กรุณากดบันทึกค่าพิกัดจำลองอย่างน้อย 1 ครั้งก่อนส่งออกรายงาน");
      return;
    }
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_vector_fields_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "Vector Fields & Gradients",
      variables: { presetId, gridDensity, vectorScale },
      liveValues: { probeX, probeY, divergence: currentVector.div, curl: currentVector.curl },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.probeX, y: r.magnitude })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, maxMagnitude: Math.max(...loggedRuns.map((r) => r.magnitude)) },
      score: Math.min(100, Math.max(40, 40 + loggedRuns.length * 15)),
      durationSeconds: null,
    });
    alert("บันทึกการทดลองแคลคูลัสสนามเวกเตอร์สำเร็จ");
    router.push(`/labs/${labId}`);
  };

  const questProgress = Math.min(100, Math.round((loggedRuns.length / 3) * 100));

  return (
    <SharedSimulationShell
      accent="rose"
      labId={labId}
      category="Mathematics"
      title="Vector Fields & Gradients"
      subtitle="ทำความเข้าใจเวกเตอร์ 2 มิติ ในฐานะสนามแรง ค้นหาอัตราการแผ่ออก (Divergence) และการหมุนวน (Curl) บนระนาบแคลคูลัสเชิงเวกเตอร์"
      statusLabel={`พิกัดวัด (${probeX.toFixed(1)}, ${probeY.toFixed(1)}) | V = [${currentVector.vx.toFixed(2)}, ${currentVector.vy.toFixed(2)}]`}
      icon={Compass}
      sceneTitle="วิชวลสนามเวกเตอร์ (Vector Field Stage)"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-rose-100 bg-[linear-gradient(135deg,#fff8f8_0%,#fff1f2_48%,#fff7f6_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          {/* Preset buttons */}
          <div className="relative z-10 mb-3 flex gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans overflow-x-auto max-w-full">
            {FIELD_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPresetId(p.id)}
                className={`rounded-lg px-2.5 py-1.5 text-[10.5px] font-black transition-all whitespace-nowrap ${
                  presetId === p.id ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {p.id === "rotational" ? "Rotational" : p.id === "divergence" ? "Divergence" : "Gradient of Hill"}
              </button>
            ))}
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            <svg
              ref={svgRef}
              viewBox="0 0 300 300"
              className="w-full max-w-[300px] h-auto overflow-visible touch-none cursor-crosshair rounded-xl border border-rose-200/70 bg-white/90 shadow-inner"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 2 L 10 5 L 0 8 z" fill="#be123c" />
                </marker>
                <marker id="grid-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#e11d48" opacity="0.8" />
                </marker>
              </defs>

              {/* Grid Lines */}
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={`lh-${i}`} x1="12.5" y1={12.5 + i * 27.5} x2="287.5" y2={12.5 + i * 27.5} stroke="#f1f5f9" strokeWidth="0.8" />
              ))}
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={`lv-${i}`} x1={12.5 + i * 27.5} y1="12.5" x2={12.5 + i * 27.5} y2="287.5" stroke="#f1f5f9" strokeWidth="0.8" />
              ))}

              {/* XY Axes */}
              <line x1="150" y1="10" x2="150" y2="290" stroke="#cbd5e1" strokeWidth="1.2" />
              <line x1="10" y1="150" x2="290" y2="150" stroke="#cbd5e1" strokeWidth="1.2" />
              <text x="282" y="146" fill="#94a3b8" fontSize="8" fontWeight="bold">x</text>
              <text x="154" y="20" fill="#94a3b8" fontSize="8" fontWeight="bold">y</text>

              {/* Field Arrows */}
              {gridArrows.map((arr, idx) => (
                <g key={`arrow-${idx}`}>
                  <line
                    x1={arr.startX}
                    y1={arr.startY}
                    x2={arr.endX}
                    y2={arr.endY}
                    stroke={arr.color}
                    strokeWidth="1.2"
                    opacity={arr.opacity}
                    markerEnd="url(#grid-arrow)"
                  />
                </g>
              ))}

              {/* Divergence effect (pulsing circle) */}
              {presetId === "divergence" && (
                <circle
                  cx={toSvgX(probeX)}
                  cy={toSvgY(probeY)}
                  r={12 * pulseScale}
                  fill="rgba(244, 63, 94, 0.15)"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                  opacity={0.8}
                />
              )}

              {/* Gradient sink effect (converging pulse) */}
              {presetId === "gradient" && (
                <circle
                  cx={toSvgX(probeX)}
                  cy={toSvgY(probeY)}
                  r={Math.max(4, 18 - (pulseScale - 1) * 35)}
                  fill="none"
                  stroke="#be123c"
                  strokeWidth="1"
                  opacity={0.6}
                />
              )}

              {/* Curl effect (rotating arrows wheel) */}
              {presetId === "rotational" && (
                <g transform={`translate(${toSvgX(probeX)}, ${toSvgY(probeY)}) rotate(${rotAngle})`}>
                  <circle cx="0" cy="0" r="10" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                  <path d="M -8 0 A 8 8 0 0 1 8 0" fill="none" stroke="#2563eb" strokeWidth="1.5" markerEnd="url(#grid-arrow)" />
                  <path d="M 8 0 A 8 8 0 0 1 -8 0" fill="none" stroke="#2563eb" strokeWidth="1.5" markerEnd="url(#grid-arrow)" />
                </g>
              )}

              {/* Draggable Probe Dot */}
              <circle
                cx={toSvgX(probeX)}
                cy={toSvgY(probeY)}
                r="6.5"
                fill="#e11d48"
                stroke="white"
                strokeWidth="2.5"
                className="filter drop-shadow-md cursor-grab active:cursor-grabbing"
              />

              {/* Probe local Vector Arrow */}
              {probeMagnitude > 0.02 && (
                <line
                  x1={toSvgX(probeX)}
                  y1={toSvgY(probeY)}
                  x2={toSvgX(probeX) + currentVector.vx * 35 * vectorScale}
                  y2={toSvgY(probeY) - currentVector.vy * 35 * vectorScale}
                  stroke="#be123c"
                  strokeWidth="2.8"
                  markerEnd="url(#arrow)"
                />
              )}
            </svg>
          </div>
        </div>
      }
      controlsTitle="ตั้งค่าพารามิเตอร์สนามและจุดตรวจสอบ"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-rose-500" />
              ตำแหน่งของจุดตรวจสอบ (Probe Target)
            </h3>
            
            <ManualNumberInput
              label="แกน X ของจุดตรวจ (Probe X)"
              ariaLabel="ตำแหน่งแกน X"
              value={probeX}
              min={-5.0}
              max={5.0}
              step={0.1}
              onChange={setProbeX}
              tone="pink"
            />
            <ManualNumberInput
              label="แกน Y ของจุดตรวจ (Probe Y)"
              ariaLabel="ตำแหน่งแกน Y"
              value={probeY}
              min={-5.0}
              max={5.0}
              step={0.1}
              onChange={setProbeY}
              tone="pink"
            />
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Layers className="h-4.5 w-4.5 text-rose-500" />
              การแสดงผลสนามเวกเตอร์
            </h3>
            
            <ManualNumberInput
              label="ความหนาแน่นกริด (Density)"
              ariaLabel="ความหนาแน่นลูกศร"
              value={gridDensity}
              min={7}
              max={15}
              step={2}
              onChange={setGridDensity}
              tone="orange"
            />
            <ManualNumberInput
              label="ขนาดลูกศรเวกเตอร์ (Scale)"
              ariaLabel="สเกลสไลเดอร์ลูกศร"
              value={vectorScale}
              min={0.2}
              max={2.0}
              step={0.1}
              onChange={setVectorScale}
              tone="amber"
            />
          </section>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-200 px-3 py-2.5 text-xs font-bold text-pink-900 shadow-sm transition-all hover:bg-pink-300 active:scale-97 cursor-pointer"
            >
              <ClipboardList className="h-3.5 w-3.5 text-rose-500" />
              บันทึกจุดวัด
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2.5 text-xs font-bold text-rose-700 shadow-sm transition-all hover:bg-rose-50 active:scale-97 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              รีเซ็ตสนาม
            </button>
          </div>
        </div>
      }
      compactControls={
        <div className="flex items-center gap-2 font-sans flex-wrap">
          <ManualNumberInput label="X" ariaLabel="แกน X" value={probeX} min={-5} max={5} step={0.5} onChange={setProbeX} tone="pink" />
          <ManualNumberInput label="Y" ariaLabel="แกน Y" value={probeY} min={-5} max={5} step={0.5} onChange={setProbeY} tone="pink" />
        </div>
      }
      metrics={[
        { label: "ขนาดเวกเตอร์ที่จุดตรวจ", value: `${probeMagnitude.toFixed(3)} หน่วย`, tone: "rose" },
        { label: "ไดเวอร์เจนซ์ P(div F)", value: currentVector.div.toFixed(2), tone: "orange" },
        { label: "เคิร์ลหมุนวน P(curl F)", value: currentVector.curl.toFixed(2), tone: "violet" },
        { label: "พิกัด X, Y ในระบบ", value: `${probeX.toFixed(1)}, ${probeY.toFixed(1)}`, tone: undefined },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-rose-600" />
              กราฟความเข้มเวกเตอร์ตามพิกัด X (Vector Magnitude vs X)
            </h3>
          </div>
          <div className="flex-grow flex items-center justify-center">
            {loggedRuns.length === 0 ? (
              <div className="text-xs text-slate-400">บันทึกพิกัดสนามเพื่อแสดงแผนภูมิประเมิน</div>
            ) : (
              <svg viewBox="0 0 200 120" className="w-full max-w-[240px] h-auto">
                <line x1="15" y1="100" x2="185" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="15" y1="10" x2="15" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                {loggedRuns.map((r, i) => {
                  const cx = 15 + ((r.probeX + 5) / 10) * 160;
                  const cy = 100 - (r.magnitude / 3) * 80;
                  return (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="3" fill="#e11d48" />
                      {i > 0 && (
                        <line
                          x1={15 + ((loggedRuns[i - 1].probeX + 5) / 10) * 160}
                          y1={100 - (loggedRuns[i - 1].magnitude / 3) * 80}
                          x2={cx}
                          y2={cy}
                          stroke="#fda4af"
                          strokeWidth="1.2"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <ClipboardList className="h-4.5 w-4.5 text-rose-500" />
              ตารางวิเคราะห์พิกัดเวกเตอร์
            </h3>
            {loggedRuns.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={handleCopyData} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                  <Clipboard className="h-3 w-3" /> คัดลอก
                </button>
                <button onClick={handleExportCSV} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                  <Download className="h-3 w-3" /> CSV
                </button>
              </div>
            )}
          </div>
          {loggedRuns.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-xs text-slate-400 py-10">ยังไม่มีการบันทึกจุดพิกัดวัด</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center">ชุด</th>
                    <th className="p-2">สนามเวกเตอร์</th>
                    <th className="p-2">พิกัด (X, Y)</th>
                    <th className="p-2">ทิศทาง [Fx, Fy]</th>
                    <th className="p-2">Magnitude</th>
                    <th className="p-2">Div</th>
                    <th className="p-2">Curl</th>
                    <th className="p-2 text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  {loggedRuns.map((r) => (
                    <tr key={r.index} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-bold">{r.index}</td>
                      <td className="p-2 font-sans">{r.fieldType.split(" ")[0]}</td>
                      <td className="p-2">({r.probeX.toFixed(1)}, {r.probeY.toFixed(1)})</td>
                      <td className="p-2">[{r.vectorX.toFixed(2)}, {r.vectorY.toFixed(2)}]</td>
                      <td className="p-2 font-bold">{r.magnitude.toFixed(3)}</td>
                      <td className="p-2">{r.divergence.toFixed(2)}</td>
                      <td className="p-2">{r.curl.toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <button onClick={() => handleClearLog(r.index)} className="text-rose-500 hover:bg-rose-50 p-1 rounded">
                          <Trash className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      }
      learningGoals={[
        "ทำความเข้าใจวิธีการหาค่าและทิศทางของเวกเตอร์ในระดับพื้นที่สองมิติ (Vector Fields)",
        "ศึกษาความหมายทางกายภาพของอัตราการลู่แผ่กระจายออก (Divergence)",
        "วิเคราะห์ทิศทางและอัตราการหมุนวนรอบจุดตรวจสอบเวกเตอร์คณิตศาสตร์ (Curl)",
      ]}
      steps={[
        { label: "เลือกสไตล์ของสนามเวกเตอร์จำลองเพื่อศึกษาประเภทแรงต่างกัน", icon: Layers },
        { label: "คลิกลากหรือเลื่อนสไลเดอร์จุดตรวจสอบสีแดงเพื่อสุ่มวัดเวกเตอร์จุดต่างๆ", icon: Sliders },
        { label: "สังเกตการณ์ขยายตัวและหมุนวนเวกเตอร์ ณ จุด Probe ตรวจสอบตัวแปร", icon: Target },
        { label: "บันทึกผลพิกัดลงในฐานข้อมูลประวัติและส่งรายงานผลการทดลอง", icon: ClipboardList },
      ]}
      progressLabel="ความคืบหน้าของกิจกรรมสนามเวกเตอร์"
      progressValue={
        questProgress === 100
          ? "วิเคราะห์จุดพิกัดสนามเวกเตอร์เสร็จสมบูรณ์"
          : `บันทึกข้อมูลแล้ว ${loggedRuns.length}/3 จุดวัด`
      }
      progressPercent={questProgress}
      tips={[
        "สนามแบบพายุหมุน (Rotational) มีค่า Curl สม่ำเสมอทั่วสนาม แต่มี Divergence เป็นศูนย์เสมอ",
        "สนามแบบ Radial Divergence มีทิศแรงระเบิดกระจายจากศูนย์กลาง ทำลายแรงหมุนรอบตัวเอง",
        "เมื่อขนาดของเวกเตอร์ที่จุดตรวจมีขนาดสูง ทิศทางลูกศร Probe ที่แสดงผลจะยาวตามสัดส่วนคูณสเกล",
      ]}
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">แคลคูลัสสนามเวกเตอร์ (Vector Fields & Gradients)</p>
          <p className="mb-3">
            สนามเวกเตอร์คือฟังก์ชันที่กำหนดค่าเวกเตอร์ให้กับทุกๆ จุดในอวกาศ คอนเซปต์สำคัญในการวิเคราะห์สนามเวกเตอร์มีดังนี้:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>Gradient (∇f):</strong> คือทิศทางอัตราการเพิ่มขึ้นสูงสุดของฟังก์ชันสเกลาร์ (เช่น ความชันของเนินเขา เวกเตอร์ลาดเอียงพุ่งเข้าหาศูนย์กลางยอดเนิน)
            </li>
            <li>
              <strong>Divergence (∇·F):</strong> วัดการขยายตัวหรือบีบอัดของฟิลด์ที่จุดหนึ่งๆ หากเป็นบวกแสดงว่าเป็น Source (แหล่งกำเนิดแผ่ออก) หากเป็นลบแสดงว่าเป็น Sink (จุดสลายจมลง)
            </li>
            <li>
              <strong>Curl (∇×F):</strong> วัดแนวโน้มความหมุนรอบตัวเองของอนุภาคเมื่อลอยไปตามสนามความเข้มข้น มีทิศทางตามกฎมือขวา
            </li>
          </ul>
        </div>
      }
      onSave={handleSaveResults}
    />
  );
}
