"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sliders,
  RotateCcw,
  Clipboard,
  ClipboardList,
  Download,
  Trash,
  Target,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

type MatrixPreset = "scaling" | "reflection" | "shear" | "rotation";

interface LoggedVectorState {
  index: number;
  preset: MatrixPreset;
  matrixStr: string;
  vecV: string;
  vecW: string;
  isEigenvector: boolean;
  eigenvalue: string;
}

export default function LinearAlgebraEigenvectorsSimulation() {
  const router = useRouter();
  const labId = "linear-algebra-eigenvectors";
  const svgRef = useRef<SVGSVGElement>(null);

  // Matrix and Vector states
  const [preset, setPreset] = useState<MatrixPreset>("scaling");
  const [vx, setVx] = useState<number>(2.0);
  const [vy, setVy] = useState<number>(1.0);

  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // History
  const [loggedRuns, setLoggedRuns] = useState<LoggedVectorState[]>([]);

  // Matrix representation
  const matrix = useMemo(() => {
    switch (preset) {
      case "scaling":
        return { a: 1.5, b: 0.0, c: 0.0, d: 0.8, name: "Scaling Matrix" };
      case "reflection":
        return { a: 0.0, b: 1.0, c: 1.0, d: 0.0, name: "Reflection Matrix (y=x)" };
      case "shear":
        return { a: 1.0, b: 1.0, c: 0.0, d: 1.0, name: "Shear Matrix" };
      case "rotation":
        // 36.87 deg rotation
        return { a: 0.8, b: -0.6, c: 0.6, d: 0.8, name: "Rotation Matrix" };
      default:
        return { a: 1.0, b: 0.0, c: 0.0, d: 1.0, name: "Identity" };
    }
  }, [preset]);

  // Transformed vector w = Av
  const wx = useMemo(() => matrix.a * vx + matrix.b * vy, [matrix, vx, vy]);
  const wy = useMemo(() => matrix.c * vx + matrix.d * vy, [matrix, vx, vy]);

  // Vector magnitudes
  const magV = useMemo(() => Math.sqrt(vx * vx + vy * vy), [vx, vy]);
  const magW = useMemo(() => Math.sqrt(wx * wx + wy * wy), [wx, wy]);

  // Check if collinear (v and w are collinear -> Av = lambda * v)
  // Calculate angle of v and w in radians, check if difference is 0 or PI
  const isEigenvector = useMemo(() => {
    if (magV < 0.2) return false;
    const angleV = Math.atan2(vy, vx);
    const angleW = Math.atan2(wy, wx);

    // Normalize diff to [0, PI]
    let diff = Math.abs(angleV - angleW);
    while (diff > Math.PI) diff -= Math.PI;
    diff = Math.abs(diff);

    // Tolerance approx 1.7 degrees
    return diff < 0.03 || Math.abs(diff - Math.PI) < 0.03;
  }, [vx, vy, wx, wy, magV]);

  // Calculate eigenvalue lambda if collinear
  const eigenvalue = useMemo(() => {
    if (!isEigenvector || magV < 0.1) return "-";
    // Check projection sign
    const dot = vx * wx + vy * wy;
    const sign = dot >= 0 ? 1.0 : -1.0;
    return (sign * (magW / magV)).toFixed(2);
  }, [isEigenvector, vx, vy, magW, magV]);

  // True eigenvector directions for guide lines
  const guides = useMemo(() => {
    // Return slopes y/x of eigenvectors
    switch (preset) {
      case "scaling":
        return [
          { slope: 0, label: "x-axis (λ = 1.50)", color: "stroke-slate-400" },
          { slope: Infinity, label: "y-axis (λ = 0.80)", color: "stroke-slate-400" },
        ];
      case "reflection":
        return [
          { slope: 1, label: "y = x (λ = 1.00)", color: "stroke-emerald-400" },
          { slope: -1, label: "y = -x (λ = -1.00)", color: "stroke-rose-400" },
        ];
      case "shear":
        return [
          { slope: 0, label: "x-axis (λ = 1.00)", color: "stroke-slate-400" },
        ];
      default:
        return []; // Rotation has no real eigenvectors
    }
  }, [preset]);

  // SVG coordinate transformation
  // Center is at 240, 160. Grid scale: 25px per unit
  const xToSvg = (x: number) => 240 + x * 25;
  const yToSvg = (y: number) => 160 - y * 25;

  const svgToGrid = (svgX: number, svgY: number) => {
    const gridX = (svgX - 240) / 25;
    const gridY = (160 - svgY) / 25;
    // Round to 1 decimal place for comfort
    return {
      x: Math.min(5, Math.max(-5, Math.round(gridX * 10) / 10)),
      y: Math.min(5, Math.max(-5, Math.round(gridY * 10) / 10)),
    };
  };

  // Click & Drag handlers on SVG canvas
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is close to tip of vector v
    const tipX = xToSvg(vx);
    const tipY = yToSvg(vy);
    const dist = Math.sqrt((x - tipX) * (x - tipX) + (y - tipY) * (y - tipY));

    if (dist < 20) {
      setIsDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    // The client coordinates might map to scaled elements, calculate using viewBox
    const widthSvg = rect.width;
    const heightSvg = rect.height;

    const clickX = ((e.clientX - rect.left) / widthSvg) * 480;
    const clickY = ((e.clientY - rect.top) / heightSvg) * 320;

    const gridPt = svgToGrid(clickX, clickY);
    setVx(gridPt.x);
    setVy(gridPt.y);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleAddLog = () => {
    const matrixStr = `[${matrix.a} ${matrix.b}; ${matrix.c} ${matrix.d}]`;
    const newLog: LoggedVectorState = {
      index: loggedRuns.length + 1,
      preset,
      matrixStr,
      vecV: `(${vx.toFixed(1)}, ${vy.toFixed(1)})`,
      vecW: `(${wx.toFixed(1)}, ${wy.toFixed(1)})`,
      isEigenvector,
      eigenvalue,
    };
    setLoggedRuns((prev) => [...prev, newLog]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const questProgress = useMemo(() => {
    let progress = 0;

    // Check if aligned with an eigenvector of active matrix
    const hasAlignedNow = isEigenvector && magV > 1.0;
    if (hasAlignedNow) {
      progress += 50;
    } else if (loggedRuns.some((r) => r.preset === preset && r.isEigenvector)) {
      progress += 50;
    }

    // Check log count
    if (loggedRuns.length >= 3) {
      progress += 50;
    }

    return progress;
  }, [isEigenvector, magV, loggedRuns, preset]);

  // Copy logged data
  const handleCopyData = () => {
    const rows = loggedRuns.map(
      (r) =>
        `${r.index}\t${r.matrixStr}\t${r.vecV}\t${r.vecW}\t${r.isEigenvector ? "Yes" : "No"}\t${r.eigenvalue}`
    );
    const header = "ชุดที่\tเมทริกซ์การแปลง A\tเวกเตอร์ v\tเวกเตอร์ Av\tEigenvector?\tEigenvalue (λ)\n";
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลเรียบร้อยแล้ว");
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = loggedRuns.map(
      (r) =>
        `${r.index},"${r.matrixStr}","${r.vecV}","${r.vecW}",${r.isEigenvector},${r.eigenvalue}`
    );
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Index,Matrix,VectorV,VectorAv,IsEigenvector,Eigenvalue", ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "linear_algebra_eigenvectors_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    if (loggedRuns.length === 0) {
      alert("กรุณากดบันทึกผลการจำลองอย่างน้อย 1 ครั้งก่อนบันทึกรายงานการทดลอง");
      return;
    }

    const payload = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      preset,
      vx,
      vy,
      loggedRuns,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_linear_algebra_experiment",
      localPayload: payload,
      labId,
      title: "Linear Algebra & Eigenvectors",
      variables: { vx, vy, preset },
      liveValues: { isEigenvector, eigenvalue, questProgress },
      graphPoints: loggedRuns.map((r, i) => ({
        index: i + 1,
        x: parseFloat(r.vecV.replace(/[()]/g, "").split(",")[0]),
        y: parseFloat(r.vecW.replace(/[()]/g, "").split(",")[0]),
      })),
      tableRows: loggedRuns,
      summary: {
        runsCount: loggedRuns.length,
        eigenvectorsFoundCount: loggedRuns.filter((r) => r.isEigenvector).length,
      },
      score: Math.min(100, Math.max(40, 40 + questProgress * 0.6)),
      durationSeconds: null,
    });

    alert("บันทึกรายงานผลแล็บ Linear Algebra & Eigenvectors สำเร็จ");
    router.push(`/labs/${labId}`);
  };

  return (
    <SharedSimulationShell
      accent="blue"
      labId={labId}
      category="Mathematics"
      title="Linear Algebra & Eigenvectors"
      subtitle="ทำความเข้าใจผลการแปลงเชิงเส้นของเมทริกซ์ ค้นหาทิศทางพิเศษ (Eigenvector) และอัตราขยายตัว (Eigenvalue)"
      statusLabel={
        isEigenvector
          ? `พบ Eigenvector! λ = ${eigenvalue}`
          : "วิเคราะห์การแปลงเชิงเส้นเชิงเวกเตอร์"
      }
      icon={Sliders}
      sceneTitle="ระนาบพิกัดการแปลงเวกเตอร์แบบเรียลไทม์"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eefcff_48%,#fff7fb_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:25px_25px] opacity-40" />

          {/* Preset Selectors */}
          <div className="relative z-10 mb-4 flex flex-wrap gap-1 rounded-xl bg-slate-200/60 p-1 self-start font-sans">
            {(["scaling", "reflection", "shear", "rotation"] as MatrixPreset[]).map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase transition-all cursor-pointer ${
                  preset === p ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="relative flex-grow flex items-center justify-center">
            <svg
              ref={svgRef}
              viewBox="0 0 480 320"
              className="w-full max-w-[480px] h-auto overflow-visible cursor-crosshair"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Grid background outlines */}
              {Array.from({ length: 11 }).map((_, idx) => {
                const val = -5 + idx;
                return (
                  <g key={val}>
                    {/* Horizontal grid guide */}
                    <line
                      x1={xToSvg(-5)}
                      y1={yToSvg(val)}
                      x2={xToSvg(5)}
                      y2={yToSvg(val)}
                      stroke={val === 0 ? "#64748b" : "#cbd5e1"}
                      strokeWidth={val === 0 ? 1.5 : 0.5}
                      strokeDasharray={val !== 0 ? "3,3" : ""}
                    />
                    {/* Vertical grid guide */}
                    <line
                      x1={xToSvg(val)}
                      y1={yToSvg(-5)}
                      x2={xToSvg(val)}
                      y2={yToSvg(5)}
                      stroke={val === 0 ? "#64748b" : "#cbd5e1"}
                      strokeWidth={val === 0 ? 1.5 : 0.5}
                      strokeDasharray={val !== 0 ? "3,3" : ""}
                    />
                    {/* Ticks text */}
                    {val !== 0 && (
                      <>
                        <text x={xToSvg(val)} y={yToSvg(0) + 12} fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">
                          {val}
                        </text>
                        <text x={xToSvg(0) - 8} y={yToSvg(val) + 3} fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">
                          {val}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}

              {/* Eigenvector guide directions (Dashed lines) */}
              {guides.map((g, idx) => {
                if (g.slope === Infinity) {
                  return (
                    <line
                      key={idx}
                      x1={xToSvg(0)}
                      y1={yToSvg(-5)}
                      x2={xToSvg(0)}
                      y2={yToSvg(5)}
                      className={`${g.color} opacity-60`}
                      strokeWidth="1.2"
                      strokeDasharray="4,4"
                    />
                  );
                }
                // y = slope * x -> endpoint at x = 5
                const yEnd = g.slope * 5;
                return (
                  <line
                    key={idx}
                    x1={xToSvg(-5)}
                    y1={yToSvg(-g.slope * 5)}
                    x2={xToSvg(5)}
                    y2={yToSvg(yEnd)}
                    stroke="#a855f7"
                    className="opacity-50"
                    strokeWidth="1.2"
                    strokeDasharray="5,3"
                  />
                );
              })}

              {/* Draggable original Vector v (Blue) */}
              <defs>
                <marker id="arrow-v" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
                </marker>
                <marker id="arrow-w" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#db2777" />
                </marker>
              </defs>

              {/* Vector w = Av (Pink) */}
              {magW > 0.1 && (
                <line
                  x1={xToSvg(0)}
                  y1={yToSvg(0)}
                  x2={xToSvg(wx)}
                  y2={yToSvg(wy)}
                  stroke="#db2777"
                  strokeWidth="3.5"
                  markerEnd="url(#arrow-w)"
                />
              )}

              {/* Vector v (Blue) */}
              {magV > 0.1 && (
                <line
                  x1={xToSvg(0)}
                  y1={yToSvg(0)}
                  x2={xToSvg(vx)}
                  y2={yToSvg(vy)}
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  markerEnd="url(#arrow-v)"
                />
              )}

              {/* Vector v handle indicator (Draggable point) */}
              <circle
                cx={xToSvg(vx)}
                cy={yToSvg(vy)}
                r="7"
                fill={isEigenvector ? "#fbbf24" : "#60a5fa"}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-colors duration-250 cursor-pointer shadow-md hover:scale-115"
              />

              {/* Vector names labels */}
              <text x={xToSvg(vx) + 10} y={yToSvg(vy) - 10} fill="#1d4ed8" fontSize="9" fontWeight="black">
                v ({vx.toFixed(1)}, {vy.toFixed(1)})
              </text>
              {magW > 0.1 && (
                <text x={xToSvg(wx) - 12} y={yToSvg(wy) + 16} fill="#be185d" fontSize="9" fontWeight="black">
                  Av ({wx.toFixed(1)}, {wy.toFixed(1)})
                </text>
              )}
            </svg>
          </div>
        </div>
      }
      controlsTitle="ควบคุมการแปลงเชิงเส้น"
      controls={
        <div className="flex flex-col gap-6 font-sans">
          {/* Vector Coordinates sliders */}
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-blue-500" />
              พิกัดเวกเตอร์เริ่มต้น v = (vx, vy)
            </h3>
            <div className="flex flex-col gap-4">
              <ManualNumberInput
                label="แกนนอน vx"
                ariaLabel="แกนนอน vx"
                value={vx}
                min={-5.0}
                max={5.0}
                step={0.1}
                onChange={setVx}
                tone="blue"
              />
              <ManualNumberInput
                label="แกนตั้ง vy"
                ariaLabel="แกนตั้ง vy"
                value={vy}
                min={-5.0}
                max={5.0}
                step={0.1}
                onChange={setVy}
                tone="cyan"
              />
            </div>
          </section>

          {/* Matrix Presets Info Panel */}
          <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm text-xs">
            <h4 className="font-black text-slate-800 border-b border-slate-100 pb-1.5 flex justify-between">
              <span>เมทริกซ์การแปลง A:</span>
              <span className="font-mono text-blue-600 font-bold">{matrix.name}</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center font-mono font-black text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
              <div>[ {matrix.a.toFixed(1)} ]</div>
              <div>[ {matrix.b.toFixed(1)} ]</div>
              <div>[ {matrix.c.toFixed(1)} ]</div>
              <div>[ {matrix.d.toFixed(1)} ]</div>
            </div>
            {guides.length > 0 ? (
              <div className="text-[10px] text-slate-500">
                <span className="font-bold block text-slate-600 mb-0.5">ทิศทาง Eigenvector ทางทฤษฎี:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {guides.map((g, i) => (
                    <li key={i}>{g.label}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-[10px] text-rose-500 font-bold">
                * เมทริกซ์นี้ไม่มี Eigenvector ที่เป็นจำนวนจริง (พิกัดเวกเตอร์หมุนไปตลอดทาง)
              </div>
            )}
          </section>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddLog}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-97 cursor-pointer"
            >
              <ClipboardList className="h-3.5 w-3.5 text-blue-500" />
              บันทึกจุดวัด
            </button>
            <button
              onClick={() => {
                setPreset("scaling");
                setVx(2.0);
                setVy(1.0);
                setLoggedRuns([]);
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2.5 text-xs font-bold text-rose-700 shadow-sm transition-all hover:bg-rose-50 active:scale-97 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              รีเซ็ตทั้งหมด
            </button>
          </div>
        </div>
      }
      metrics={[
        {
          label: "ขนาดเวกเตอร์ v",
          value: magV.toFixed(2),
          tone: "blue",
        },
        {
          label: "ขนาดเวกเตอร์ Av",
          value: magW.toFixed(2),
          tone: "rose",
        },
        {
          label: "ขนาน (Collinear)?",
          value: isEigenvector ? "ขนาน (Eigenvector)" : "ไม่ขนาน",
          tone: isEigenvector ? "emerald" : "orange",
        },
        {
          label: "ค่าลู่ขยาย Eigenvalue (λ)",
          value: eigenvalue,
          tone: "violet",
        },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-blue-600" />
              ทฤษฎีบทระบบแปลงเชิงเส้น (Linear Transformation)
            </h3>
          </div>
          <div className="flex-grow flex flex-col justify-center gap-3 text-xs leading-relaxed text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3 flex flex-col gap-2 border border-slate-150">
              <div>
                <span className="font-bold text-slate-700">Eigenvectors & Eigenvalues:</span>
                <p className="mt-0.5 text-slate-500">
                  คือทิศทางพิเศษ $v$ ที่เมื่อคูณแปลงด้วยเมทริกซ์ $A$ แล้วจะยังมีทิศขนานกับแนวเดิม เพียงแต่ความยาวจะหดหรือยืดออกด้วยค่าคงตัว $\lambda$:
                </p>
                <div className="text-center font-mono font-black text-sm text-blue-600 my-1">
                  Av = λv
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              * ลองปรับเมทริกซ์เป็นแบบสะท้อน (Reflection) แล้วลากเวกเตอร์ทับแนว $y = x$ เพื่อดูเวกเตอร์ที่ขนานกันพอดี
            </p>
          </div>
        </section>
      }
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">พีชคณิตเชิงเส้นและไอเกนเวกเตอร์ (Linear Algebra & Eigenvectors)</p>
          <p className="mb-3">
            เมทริกซ์ $A$ ทำหน้าที่เป็นโอเปอเรเตอร์การแปลงเชิงเส้น (Linear Transformation) ที่ยืด หมุน หรือบิดระนาบพิกัด:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>ไอเกนเวกเตอร์ (Eigenvectors):</strong>
              คือ เวกเตอร์ทิศทาง $v$ ที่ไม่เกิดการเปลี่ยนทิศทางจากการกระทำของเมทริกซ์ $A$ ทิศทางยังคงขนานตามเดิม
            </li>
            <li>
              <strong>ไอเกนแวลู (Eigenvalues):</strong>
              คือ สเกลาร์ $\lambda$ ที่บอกอัตราการขยายหรือลดทอนขนาดของไอเกนเวกเตอร์นั้นๆ จากสมการหลัก:
              <div className="my-2 rounded-xl bg-slate-50 p-2 text-center font-mono text-xs font-bold text-blue-700">
                Av = λv
              </div>
            </li>
          </ul>
        </div>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                <ClipboardList className="h-4.5 w-4.5 text-blue-500" />
                ตารางบันทึกค่าพิกัดวิเคราะห์เมทริกซ์ (Log)
              </h3>
              {loggedRuns.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyData}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 animate-fade-in"
                  >
                    <Clipboard className="h-3 w-3" />
                    คัดลอกข้อมูล
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Download className="h-3 w-3" />
                    ส่งออก CSV
                  </button>
                </div>
              )}
            </div>

            {loggedRuns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-slate-400">
                <Clipboard className="h-8 w-8 stroke-1 text-slate-300 mb-2" />
                ยังไม่มีการบันทึกข้อมูล ลากปลายลูกศรเวกเตอร์ v และกด &quot;บันทึกจุดวัด&quot; ด้านซ้าย
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-2.5 text-center">ชุดที่</th>
                      <th className="p-2.5">รูปแบบเมทริกซ์</th>
                      <th className="p-2.5">พารามิเตอร์ A</th>
                      <th className="p-2.5">เวกเตอร์ v</th>
                      <th className="p-2.5">ผลแปลง Av</th>
                      <th className="p-2.5">Eigenvector?</th>
                      <th className="p-2.5 text-center">Eigenvalue (λ)</th>
                      <th className="p-2.5 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                    {loggedRuns.map((run) => (
                      <tr key={run.index} className="hover:bg-blue-50/20 transition-colors">
                        <td className="p-2 text-center font-bold">{run.index}</td>
                        <td className="p-2 font-sans text-slate-800 capitalize">{run.preset}</td>
                        <td className="p-2">{run.matrixStr}</td>
                        <td className="p-2 font-bold text-blue-600">{run.vecV}</td>
                        <td className="p-2 font-bold text-rose-600">{run.vecW}</td>
                        <td className="p-2 font-sans">
                          {run.isEigenvector ? (
                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                              Yes
                            </span>
                          ) : (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                              No
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-center font-bold">{run.eigenvalue}</td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleClearLog(run.index)}
                            className="rounded p-1 text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      }
      learningGoals={[
        "ทำความเข้าใจผลลัพธ์ของการแปลงเชิงเส้น (Linear Transformation) ด้วยเมทริกซ์ 2x2",
        "ศึกษาความหมายของเวกเตอร์ลักษณะเฉพาะ (Eigenvectors) และค่าลักษณะเฉพาะ (Eigenvalues)",
        "วิเคราะห์ทิศทางและอัตราขยายของเวกเตอร์ในเมทริกซ์รูปแบบต่างๆ เช่น ยืดขยาย หมุน และสะท้อน",
        "เชื่อมโยงแนวคิดทางเมทริกซ์และเรขาคณิตวิเคราะห์ผ่านการทดลองจับคู่เวกเตอร์แบบอินเทอร์แอคทีฟ",
      ]}
      steps={[
        { label: "เลือกรูปแบบเมทริกซ์แปลงค่าที่ต้องการศึกษาเพื่อดูรูปแบบของกริด", icon: Layers },
        { label: "ลากที่หัวลูกศรเวกเตอร์ v เพื่อปรับทิศทางและระยะของเวกเตอร์เริ่มต้น", icon: Sliders },
        { label: "สังเกตการขยับและเปลี่ยนแปลงของเวกเตอร์ Av ว่าขนานกับ v หรือไม่", icon: Target },
        { label: "จัดเรียงให้ทั้งสองเวกเตอร์ทับทแยงในแนวเดียวกันเพื่อตรวจจับไอเกนเวกเตอร์", icon: Sparkles },
      ]}
      progressLabel="ระดับการสืบค้นไอเกนเวกเตอร์"
      progressValue={
        questProgress === 100
          ? "ตรวจพบและบันทึกประวัติสำเร็จ"
          : questProgress === 50
          ? "ค้นพบทิศทางเวกเตอร์พิเศษแล้ว! บันทึกรายงานให้ครบ 3 ครั้ง"
          : "โปรดค้นหาทิศทางที่ Av ขนานกับ v (จุดสีเหลืองจะส่องประกาย)"
      }
      progressPercent={questProgress}
      tips={[
        " Eigenvector คือทิศทางเดียวที่เวกเตอร์หลังการแปลง Av จะรักษาแนวระนาบขนานกับเวกเตอร์เริ่มต้น v เสมอ",
        " สังเกตแนวเส้นประบางๆ บนจอ ซึ่งแสดงถึงแนวทิศทางไอเกนเวกเตอร์ตามทฤษฎีคณิตศาสตร์",
        " ในโหมด Reflection (y = x) ลองลากเวกเตอร์ v ไปทับพิกัดแนวทแยงมุมพอดีเพื่อดูค่าไอเกนแวลู λ = 1.00",
        " ในโหมด Scaling ลองหันเวกเตอร์เข้าหาแกนนอน หรือแกนตั้ง ซึ่งทำหน้าที่เป็นขอบเขตไอเกนเวกเตอร์",
      ]}
      onSave={handleSaveResults}
    />
  );
}
