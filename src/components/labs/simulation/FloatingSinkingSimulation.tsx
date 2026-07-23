"use client";

import React, { useId, useMemo, useState } from "react";
import {
  Anchor,
  CheckCircle2,
  ClipboardList,
  Droplets,
  FlaskConical,
  RotateCcw,
  Scale,
  Waves,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { calculateBuoyancy } from "@/lib/simulations/elementaryPhysics";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

type MaterialId = "wood" | "plastic" | "steel" | "clay";
type ClayShape = "ball" | "boat";
type Prediction = "float" | "sink";

type MaterialDefinition = {
  id: MaterialId;
  label: string;
  massKg: number;
  displacedVolumeM3: number;
  color: string;
};

type BuoyancyRun = {
  index: number;
  material: string;
  shape: string;
  prediction: Prediction;
  outcome: Prediction;
  massKg: number;
  displacedVolumeM3: number;
  averageDensityKgM3: number;
  weightNewton: number;
  buoyantForceNewton: number;
  predictionCorrect: boolean;
};

const MATERIALS: Record<Exclude<MaterialId, "clay">, MaterialDefinition> = {
  wood: {
    id: "wood",
    label: "ไม้",
    massKg: 0.06,
    displacedVolumeM3: 0.0001,
    color: "#b45309",
  },
  plastic: {
    id: "plastic",
    label: "พลาสติก",
    massKg: 0.08,
    displacedVolumeM3: 0.0001,
    color: "#22c55e",
  },
  steel: {
    id: "steel",
    label: "เหล็ก",
    massKg: 0.2,
    displacedVolumeM3: 0.00005,
    color: "#64748b",
  },
};

const CLAY: Record<ClayShape, MaterialDefinition> = {
  ball: {
    id: "clay",
    label: "ดินน้ำมันก้อนกลม",
    massKg: 0.12,
    displacedVolumeM3: 0.00008,
    color: "#a855f7",
  },
  boat: {
    id: "clay",
    label: "ดินน้ำมันรูปเรือ",
    massKg: 0.12,
    displacedVolumeM3: 0.00018,
    color: "#a855f7",
  },
};

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2";

export default function FloatingSinkingSimulation() {
  const svgId = useId().replaceAll(":", "");
  const waterId = `water-${svgId}`;
  const titleId = `buoyancy-title-${svgId}`;
  const descriptionId = `buoyancy-description-${svgId}`;
  const labId = "floating-and-sinking";

  const [material, setMaterial] = useState<MaterialId>("wood");
  const [clayShape, setClayShape] = useState<ClayShape>("ball");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [tested, setTested] = useState(false);
  const [loggedRuns, setLoggedRuns] = useState<BuoyancyRun[]>([]);
  const [correctFloatingTest, setCorrectFloatingTest] = useState(false);
  const [correctSinkingTest, setCorrectSinkingTest] = useState(false);
  const [clayOutcomes, setClayOutcomes] = useState<Partial<Record<ClayShape, Prediction>>>({});

  const selectedMaterial = useMemo(
    () => (material === "clay" ? CLAY[clayShape] : MATERIALS[material]),
    [clayShape, material],
  );
  const result = useMemo(
    () =>
      calculateBuoyancy(
        selectedMaterial.massKg,
        selectedMaterial.displacedVolumeM3,
      ),
    [selectedMaterial],
  );

  const clayCompared =
    clayOutcomes.ball === "sink" && clayOutcomes.boat === "float";
  const missionEvidence = [
    correctFloatingTest,
    correctSinkingTest,
    clayCompared,
  ];
  const completedMissions = missionEvidence.filter(Boolean).length;
  const progressPercent = (completedMissions / missionEvidence.length) * 100;
  const outcomeText =
    result.outcome === "float" ? "วัตถุลอยน้ำ" : "วัตถุจมน้ำ";

  const chooseMaterial = (next: MaterialId) => {
    setMaterial(next);
    setPrediction(null);
    setTested(false);
  };

  const chooseClayShape = (next: ClayShape) => {
    setClayShape(next);
    setPrediction(null);
    setTested(false);
  };

  const handleTest = () => {
    if (!prediction) {
      window.alert("เลือกคำทำนายว่าลอยหรือจมก่อนเริ่มทดลอง");
      return;
    }

    setTested(true);
    const correct = prediction === result.outcome;
    if (correct && result.outcome === "float") setCorrectFloatingTest(true);
    if (correct && result.outcome === "sink") setCorrectSinkingTest(true);
    if (material === "clay") {
      setClayOutcomes((previous) => ({
        ...previous,
        [clayShape]: result.outcome,
      }));
    }
  };

  const handleLog = () => {
    if (!tested || !prediction) {
      window.alert("กรุณาทำนายและกดทดลองก่อนจดบันทึก");
      return;
    }

    const run: BuoyancyRun = {
      index: loggedRuns.length + 1,
      material: selectedMaterial.label,
      shape: material === "clay" ? (clayShape === "ball" ? "ก้อนกลม" : "รูปเรือ") : "-",
      prediction,
      outcome: result.outcome,
      massKg: selectedMaterial.massKg,
      displacedVolumeM3: selectedMaterial.displacedVolumeM3,
      averageDensityKgM3: result.averageDensityKgM3,
      weightNewton: result.weightNewton,
      buoyantForceNewton: result.buoyantForceNewton,
      predictionCorrect: prediction === result.outcome,
    };

    setLoggedRuns((previous) => [...previous, run].slice(-12));
  };

  const handleReset = () => {
    setMaterial("wood");
    setClayShape("ball");
    setPrediction(null);
    setTested(false);
    setLoggedRuns([]);
    setCorrectFloatingTest(false);
    setCorrectSinkingTest(false);
    setClayOutcomes({});
  };

  const handleSave = async () => {
    if (loggedRuns.length === 0) {
      window.alert("กรุณาจดบันทึกผลอย่างน้อย 1 ครั้งก่อนบันทึกการทดลอง");
      return;
    }

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_floating_sinking_experiment",
      localPayload: {
        labId,
        savedAt: new Date().toISOString(),
        loggedRuns,
        completedMissions,
      },
      labId,
      title: "การลอยและการจม",
      variables: {
        material,
        clayShape,
        massKg: selectedMaterial.massKg,
        displacedVolumeM3: selectedMaterial.displacedVolumeM3,
      },
      liveValues: result,
      graphPoints: loggedRuns.map((run) => ({
        index: run.index,
        density: run.averageDensityKgM3,
        waterDensity: 1000,
      })),
      tableRows: loggedRuns,
      prediction,
      summary: {
        completedMissions,
        runsCount: loggedRuns.length,
        latestOutcome: result.outcome,
      },
      durationSeconds: null,
    });

    window.alert("บันทึกผลการทดลองการลอยและการจมแล้ว");
  };

  const missionPanel = (
    <section className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
      <p className="mb-2 text-xs font-black text-cyan-950">ภารกิจสั้น 3 ขั้น</p>
      <ol className="space-y-2">
        {[
          "ทำนายและทดลองวัตถุที่ลอยให้ถูกต้อง",
          "ทำนายและทดลองวัตถุที่จมให้ถูกต้อง",
          "เปลี่ยนดินน้ำมันจากก้อนกลมเป็นรูปเรือ",
        ].map((mission, index) => (
          <li key={mission} className="flex items-start gap-2 text-xs font-bold leading-relaxed text-slate-700">
            <CheckCircle2
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                missionEvidence[index] ? "text-emerald-600" : "text-slate-300"
              }`}
            />
            <span>{mission}</span>
          </li>
        ))}
      </ol>
      {completedMissions === 3 && (
        <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-black text-emerald-700">
          ปลดล็อกทดลองอิสระแล้ว ลองเปรียบเทียบวัสดุทุกชนิด
        </p>
      )}
    </section>
  );

  const objectY = !tested ? 82 : result.outcome === "float" ? 145 : 267;
  const arrowScale = Math.min(
    70,
    Math.max(result.weightNewton, result.buoyantForceNewton) * 45,
  );

  return (
    <SharedSimulationShell
      accent="cyan"
      labId={labId}
      category="Physics"
      title="การลอยและการจม"
      subtitle="ทำนายและเปรียบเทียบน้ำหนัก แรงลอยตัว และความหนาแน่น เพื่อค้นหาว่าทำไมวัตถุบางชิ้นลอยแต่วัตถุบางชิ้นจม"
      statusLabel={tested ? outcomeText : "รอการทำนาย"}
      icon={Waves}
      sceneTitle="ถังทดสอบแรงลอยตัว"
      scene={
        <div className="h-full min-h-[300px] overflow-hidden rounded-2xl border border-cyan-100 bg-[#f5fcff]">
          <svg
            viewBox="0 0 760 360"
            className="h-full w-full"
            role="img"
            aria-labelledby={`${titleId} ${descriptionId}`}
          >
            <title id={titleId}>ถังน้ำสำหรับทดลองการลอยและการจม</title>
            <desc id={descriptionId}>
              แสดงวัตถุที่เลือกเหนือผิวน้ำ ขณะลอย หรือที่ก้นถัง พร้อมลูกศรน้ำหนักและแรงลอยตัว
            </desc>
            <defs>
              <linearGradient id={waterId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#67e8f9" stopOpacity="0.78" />
                <stop offset="1" stopColor="#0284c7" stopOpacity="0.74" />
              </linearGradient>
              <filter id="buoyancy-object-shadow" x="-40%" y="-40%" width="180%" height="190%">
                <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#0c4a6e" floodOpacity="0.25" />
              </filter>
            </defs>
            <rect width="760" height="360" fill="#f5fcff" />
            <path d="M0 310H760" stroke="#e0f2fe" strokeWidth="3" strokeDasharray="8 8" />

            <g transform="translate(166 42)">
              <path
                d="M18 58 V278 Q18 304 44 304 H386 Q412 304 412 278 V58"
                fill="#fff"
                stroke="#94a3b8"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path d="M22 116 H408 V282 Q408 300 386 300 H44 Q22 300 22 282 Z" fill={`url(#${waterId})`} />
              <path d="M22 116 Q72 103 122 116 T222 116 T322 116 T408 116" fill="none" stroke="#0ea5e9" strokeWidth="5" />
              <path d="M34 162H54M34 208H54M34 254H54" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" />
              <text x="61" y="166" fill="#e0f2fe" fontSize="10" fontWeight="900">25%</text>
              <text x="61" y="212" fill="#e0f2fe" fontSize="10" fontWeight="900">50%</text>
              <text x="61" y="258" fill="#e0f2fe" fontSize="10" fontWeight="900">75%</text>

              <g
                transform={`translate(215 ${objectY})`}
                style={{ transition: "transform 420ms ease, opacity 220ms ease", filter: "url(#buoyancy-object-shadow)" }}
              >
                {material === "clay" && clayShape === "boat" ? (
                  <path
                    d="M-70 -12 Q-54 34 0 38 Q54 34 70 -12 Q36 4 0 2 Q-36 4 -70 -12 Z"
                    fill={selectedMaterial.color}
                    stroke="#6b21a8"
                    strokeWidth="4"
                  />
                ) : material === "clay" && clayShape === "ball" ? (
                  <circle r="36" fill={selectedMaterial.color} stroke="#6b21a8" strokeWidth="4" />
                ) : material === "steel" ? (
                  <circle r="34" fill={selectedMaterial.color} stroke="#334155" strokeWidth="5" />
                ) : (
                  <rect x="-48" y="-29" width="96" height="58" rx={material === "plastic" ? 20 : 7} fill={selectedMaterial.color} stroke="#334155" strokeWidth="4" />
                )}
                <text y="-48" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="900">
                  {selectedMaterial.label}
                </text>

                {tested && (
                  <>
                    <path d={`M-66 0 V${arrowScale}`} stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
                    <path d={`M-77 ${arrowScale - 13} L-66 ${arrowScale} L-55 ${arrowScale - 13}`} fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
                    <text x="-78" y={arrowScale + 23} textAnchor="middle" fill="#b91c1c" fontSize="14" fontWeight="900">
                      น้ำหนัก
                    </text>
                    <path d={`M66 0 V-${Math.min(70, result.buoyantForceNewton * 45)}`} stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
                    <path d={`M55 ${-Math.min(70, result.buoyantForceNewton * 45) + 13} L66 -${Math.min(70, result.buoyantForceNewton * 45)} L77 ${-Math.min(70, result.buoyantForceNewton * 45) + 13}`} fill="none" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
                    <text x="83" y={-Math.min(70, result.buoyantForceNewton * 45) - 8} textAnchor="middle" fill="#0f766e" fontSize="14" fontWeight="900">
                      แรงลอยตัว
                    </text>
                  </>
                )}
              </g>
            </g>

            <g transform="translate(24 48)">
              <rect width="132" height="120" rx="18" fill="#fff" stroke="#bae6fd" strokeWidth="2" />
              <text x="18" y="29" fill="#0369a1" fontSize="14" fontWeight="900">ข้อมูลวัตถุ</text>
              <text x="18" y="58" fill="#475569" fontSize="13" fontWeight="800">มวล {selectedMaterial.massKg.toFixed(2)} kg</text>
              <text x="18" y="84" fill="#475569" fontSize="13" fontWeight="800">
                ความหนาแน่น
              </text>
              <text x="18" y="106" fill="#0f172a" fontSize="15" fontWeight="900">
                {Math.round(result.averageDensityKgM3)} kg/m³
              </text>
            </g>

            <g transform="translate(596 48)">
              <rect width="140" height="120" rx="18" fill="#fff" stroke="#bae6fd" strokeWidth="2" />
              <text x="70" y="30" textAnchor="middle" fill="#0369a1" fontSize="14" fontWeight="900">ผลการทดลอง</text>
              <text x="70" y="67" textAnchor="middle" fill={tested ? (result.outcome === "float" ? "#047857" : "#be123c") : "#64748b"} fontSize="20" fontWeight="900">
                {tested ? outcomeText : "ยังไม่ทดสอบ"}
              </text>
              <text x="70" y="96" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="800">
                น้ำ = 1000 kg/m³
              </text>
            </g>
            <g transform="translate(579 200)">
              <rect width="157" height="90" rx="18" fill="#ecfeff" stroke="#67e8f9" strokeWidth="2" />
              <text x="78.5" y="26" textAnchor="middle" fill="#0369a1" fontSize="13" fontWeight="900">เปรียบเทียบความหนาแน่น</text>
              <rect x="18" y="42" width="121" height="12" rx="6" fill="#bae6fd" />
              <rect
                x="18"
                y="42"
                width={Math.min(121, (result.averageDensityKgM3 / 1500) * 121)}
                height="12"
                rx="6"
                fill={result.averageDensityKgM3 <= 1000 ? "#10b981" : "#f43f5e"}
              />
              <path d="M99 37V60" stroke="#0f172a" strokeWidth="2" />
              <text x="99" y="75" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="800">น้ำ 1000</text>
            </g>
          </svg>
        </div>
      }
      controlsTitle="แผงทดลองลอยหรือจม"
      controls={
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="mb-2 text-xs font-black text-slate-500">เลือกวัตถุ</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(["wood", "plastic", "steel", "clay"] as const).map((id) => {
                  const label = id === "wood" ? "ไม้" : id === "plastic" ? "พลาสติก" : id === "steel" ? "เหล็ก" : "ดินน้ำมัน";
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => chooseMaterial(id)}
                      aria-pressed={material === id}
                      className={`${buttonBase} ${
                        material === id
                          ? "border-cyan-500 bg-cyan-50 text-cyan-900"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {material === "clay" && (
              <div>
                <p className="mb-2 text-xs font-black text-slate-500">ปั้นดินน้ำมัน</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["ball", "boat"] as const).map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => chooseClayShape(shape)}
                      aria-pressed={clayShape === shape}
                      className={`${buttonBase} ${
                        clayShape === shape
                          ? "border-violet-500 bg-violet-50 text-violet-900"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {shape === "ball" ? "ก้อนกลม" : "รูปเรือ"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-black text-slate-500">ทำนายก่อนทดลอง</p>
              <div className="grid grid-cols-2 gap-2">
                {(["float", "sink"] as const).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => {
                      setPrediction(choice);
                      setTested(false);
                    }}
                    aria-pressed={prediction === choice}
                    className={`${buttonBase} ${
                      prediction === choice
                        ? "border-cyan-600 bg-cyan-600 text-white"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {choice === "float" ? <Waves className="h-4 w-4" /> : <Anchor className="h-4 w-4" />}
                    {choice === "float" ? "ลอย" : "จม"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleTest}
              className={`${buttonBase} w-full border-cyan-600 bg-cyan-600 text-white hover:bg-cyan-700`}
            >
              <FlaskConical className="h-4 w-4" />
              เริ่มทดลอง
            </button>
          </section>

          <div className="space-y-4">
            {missionPanel}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleLog}
                className={`${buttonBase} border-cyan-600 bg-cyan-600 text-white`}
              >
                <ClipboardList className="h-4 w-4" />
                จดผล
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={`${buttonBase} border-slate-200 bg-white text-slate-700`}
              >
                <RotateCcw className="h-4 w-4" />
                เริ่มใหม่
              </button>
            </div>
          </div>
        </div>
      }
      compactControls={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleTest}
            className={`${buttonBase} border-cyan-600 bg-cyan-600 text-white`}
          >
            <FlaskConical className="h-4 w-4" />
            ทดลอง
          </button>
          <button
            type="button"
            onClick={handleLog}
            className={`${buttonBase} border-cyan-200 bg-cyan-50 text-cyan-900`}
          >
            <ClipboardList className="h-4 w-4" />
            จดผล
          </button>
          <button
            type="button"
            onClick={handleReset}
            className={`${buttonBase} border-slate-200 bg-white text-slate-700`}
          >
            <RotateCcw className="h-4 w-4" />
            เริ่มใหม่
          </button>
        </div>
      }
      drawerSummary={missionPanel}
      metrics={[
        {
          label: "ความหนาแน่นวัตถุ",
          value: `${Math.round(result.averageDensityKgM3)} kg/m³`,
          tone: "cyan",
        },
        { label: "น้ำหนัก", value: `${result.weightNewton.toFixed(2)} N`, tone: "rose" },
        {
          label: "แรงลอยตัว",
          value: `${result.buoyantForceNewton.toFixed(2)} N`,
          tone: "emerald",
        },
        {
          label: "ผล",
          value: tested ? (result.outcome === "float" ? "ลอย" : "จม") : "รอทดลอง",
          tone: tested ? (result.outcome === "float" ? "emerald" : "rose") : "blue",
        },
      ]}
      graph={
        <section className="min-h-[300px] rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-5 flex items-center gap-2 text-sm font-black text-slate-900">
            <Scale className="h-4 w-4 text-cyan-700" />
            ความหนาแน่นเทียบกับน้ำ
          </h3>
          <div className="space-y-4">
            {[
              { label: selectedMaterial.label, value: result.averageDensityKgM3, color: "#0891b2" },
              { label: "น้ำ", value: 1000, color: "#38bdf8" },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex justify-between text-xs font-black text-slate-600">
                  <span>{bar.label}</span>
                  <span>{Math.round(bar.value)} kg/m³</span>
                </div>
                <div className="h-9 overflow-hidden rounded-lg bg-slate-100">
                  <div
                    className="h-full rounded-lg transition-[width] duration-300"
                    style={{
                      width: `${Math.min(100, (bar.value / 2500) * 100)}%`,
                      backgroundColor: bar.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs font-bold leading-relaxed text-slate-600">
            วัตถุที่มีความหนาแน่นเฉลี่ยน้อยกว่าน้ำมีแนวโน้มลอย ส่วนวัตถุที่หนาแน่นกว่าน้ำมีแนวโน้มจม
          </p>
        </section>
      }
      table={
        <section className="min-h-[300px] rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
            <ClipboardList className="h-4 w-4 text-cyan-700" />
            สมุดบันทึกการลอยและการจม
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">วัตถุ</th>
                  <th className="p-3">ทำนาย</th>
                  <th className="p-3">ผล</th>
                  <th className="p-3">ความหนาแน่น</th>
                  <th className="p-3">ถูกต้อง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loggedRuns.map((run, index) => (
                  <tr key={`${run.index}-${index}`}>
                    <td className="p-3 font-bold">{run.material}</td>
                    <td className="p-3">{run.prediction === "float" ? "ลอย" : "จม"}</td>
                    <td className="p-3">{run.outcome === "float" ? "ลอย" : "จม"}</td>
                    <td className="p-3">{Math.round(run.averageDensityKgM3)} kg/m³</td>
                    <td className={`p-3 font-black ${run.predictionCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                      {run.predictionCorrect ? "ถูก" : "ลองใหม่"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loggedRuns.length === 0 && (
              <p className="py-16 text-center text-sm font-bold text-slate-400">ยังไม่มีข้อมูล</p>
            )}
          </div>
        </section>
      }
      learningGoals={[
        "เปรียบเทียบน้ำหนักกับแรงลอยตัวที่น้ำกระทำต่อวัตถุ",
        "เชื่อมโยงความหนาแน่นเฉลี่ยกับผลการลอยหรือจม",
        "อธิบายได้ว่าการเปลี่ยนรูปร่างดินน้ำมันเพิ่มปริมาตรน้ำที่ถูกแทนที่",
      ]}
      steps={[
        { label: "เลือกวัตถุหรือปั้นดินน้ำมัน", icon: Anchor },
        { label: "ทำนายว่าจะลอยหรือจม", icon: Droplets },
        { label: "ทดลองและดูแรงทั้งสองทิศ", icon: Scale },
        { label: "จดผลเพื่อผ่านภารกิจ", icon: ClipboardList },
      ]}
      progressLabel="ความคืบหน้าภารกิจ"
      progressValue={`${completedMissions}/3 ภารกิจ`}
      progressPercent={progressPercent}
      tips={[
        "ต้องเลือกคำทำนายก่อนกดทดลอง เพื่อฝึกคิดจากข้อมูลมวลและปริมาตร",
        "ดินน้ำมันรูปเรือมีมวลเท่าเดิม แต่แทนที่น้ำได้มากขึ้น จึงเกิดแรงลอยตัวมากขึ้น",
        "แบบจำลองใช้น้ำสะอาดที่ความหนาแน่น 1000 กิโลกรัมต่อลูกบาศก์เมตร",
      ]}
      theory={
        <div className="space-y-3 text-sm font-semibold leading-relaxed text-slate-600">
          <p>
            น้ำออกแรงดันวัตถุขึ้น เรียกว่าแรงลอยตัว ซึ่งมีค่าเท่ากับน้ำหนักของน้ำที่วัตถุแทนที่
          </p>
          <p className="rounded-xl bg-cyan-50 p-3 font-black text-cyan-950">
            F<sub>b</sub> = ρVg
          </p>
          <p>
            ถ้าแรงลอยตัวมากพอเทียบกับน้ำหนัก วัตถุจะลอย การเปลี่ยนดินน้ำมันเป็นรูปเรือเพิ่มปริมาตรที่แทนที่น้ำโดยไม่เพิ่มมวล
          </p>
        </div>
      }
      onRun={handleTest}
      runLabel="ทดลอง"
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}
