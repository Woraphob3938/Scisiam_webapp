"use client";

import React, { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ClipboardList,
  Compass,
  FlaskConical,
  Gauge,
  Magnet,
  RotateCcw,
  Ruler,
  TestTube2,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import {
  calculateMagneticInteraction,
  isMagneticallyAttracted,
  type MagneticPole,
  type TestMaterial,
} from "@/lib/simulations/elementaryPhysics";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

type TestMode = "poles" | "materials";

type MagnetRun = {
  index: number;
  mode: TestMode;
  facingPole: MagneticPole;
  distanceCm: number;
  material: TestMaterial;
  relation: "attract" | "repel" | "none";
  strength: number;
  resultText: string;
};

const MATERIAL_LABELS: Record<TestMaterial, string> = {
  iron: "เหล็ก",
  aluminum: "อะลูมิเนียม",
  wood: "ไม้",
  plastic: "พลาสติก",
};

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2";

export default function MagnetExplorationSimulation() {
  const router = useRouter();
  const svgId = useId().replaceAll(":", "");
  const arrowId = `magnet-arrow-${svgId}`;
  const titleId = `magnet-title-${svgId}`;
  const descriptionId = `magnet-description-${svgId}`;
  const labId = "magnet-exploration";

  const [facingPole, setFacingPole] = useState<MagneticPole>("S");
  const [distanceCm, setDistanceCm] = useState(12);
  const [testMode, setTestMode] = useState<TestMode>("poles");
  const [material, setMaterial] = useState<TestMaterial>("iron");
  const [tested, setTested] = useState(false);
  const [loggedRuns, setLoggedRuns] = useState<MagnetRun[]>([]);
  const [observedAttraction, setObservedAttraction] = useState(false);
  const [observedRepulsion, setObservedRepulsion] = useState(false);
  const [testedIron, setTestedIron] = useState(false);
  const [testedNonMagnetic, setTestedNonMagnetic] = useState(false);

  const poleInteraction = useMemo(
    () => calculateMagneticInteraction("N", facingPole, distanceCm),
    [distanceCm, facingPole],
  );
  const materialAttracted = isMagneticallyAttracted(material);
  const displayedStrength =
    testMode === "poles"
      ? poleInteraction.strength
      : materialAttracted
        ? poleInteraction.strength
        : 0;
  const relation =
    testMode === "poles"
      ? poleInteraction.relation
      : materialAttracted
        ? ("attract" as const)
        : ("none" as const);
  const resultText =
    relation === "attract"
      ? "เกิดแรงดึงดูด"
      : relation === "repel"
        ? "เกิดแรงผลัก"
        : "ไม่พบแรงดึงดูดชัดเจน";

  const materialMission = testedIron && testedNonMagnetic;
  const missionEvidence = [
    observedAttraction,
    observedRepulsion,
    materialMission,
  ];
  const completedMissions = missionEvidence.filter(Boolean).length;
  const progressPercent = (completedMissions / missionEvidence.length) * 100;
  const graphPoints = useMemo(
    () =>
      [4, 8, 12, 16, 20, 24, 28].map((distance) => ({
        distance,
        strength: calculateMagneticInteraction("N", facingPole, distance).strength,
      })),
    [facingPole],
  );

  const handleTest = () => {
    setTested(true);
    if (testMode === "poles") {
      if (poleInteraction.relation === "attract") setObservedAttraction(true);
      if (poleInteraction.relation === "repel") setObservedRepulsion(true);
      return;
    }

    if (material === "iron") setTestedIron(true);
    else setTestedNonMagnetic(true);
  };

  const handleLog = () => {
    if (!tested) {
      window.alert("กรุณากดทดลองก่อนจดบันทึก");
      return;
    }

    const run: MagnetRun = {
      index: loggedRuns.length + 1,
      mode: testMode,
      facingPole,
      distanceCm,
      material,
      relation,
      strength: displayedStrength,
      resultText,
    };
    setLoggedRuns((previous) => [...previous, run].slice(-12));
  };

  const handleReset = () => {
    setFacingPole("S");
    setDistanceCm(12);
    setTestMode("poles");
    setMaterial("iron");
    setTested(false);
    setLoggedRuns([]);
    setObservedAttraction(false);
    setObservedRepulsion(false);
    setTestedIron(false);
    setTestedNonMagnetic(false);
  };

  const handleSave = async () => {
    if (loggedRuns.length === 0) {
      window.alert("กรุณาจดบันทึกผลอย่างน้อย 1 ครั้งก่อนบันทึกการทดลอง");
      return;
    }

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_magnet_exploration_experiment",
      localPayload: {
        labId,
        savedAt: new Date().toISOString(),
        loggedRuns,
        completedMissions,
      },
      labId,
      title: "สำรวจแม่เหล็ก",
      variables: { facingPole, distanceCm, testMode, material },
      liveValues: { relation, strength: displayedStrength, resultText },
      graphPoints,
      tableRows: loggedRuns,
      summary: {
        completedMissions,
        runsCount: loggedRuns.length,
        latestResult: resultText,
      },
      durationSeconds: null,
    });

    window.alert("บันทึกผลการสำรวจแม่เหล็กแล้ว");
    router.push(`/labs/${labId}`);
  };

  const missionPanel = (
    <section className="rounded-xl border border-violet-200 bg-violet-50 p-3">
      <p className="mb-2 text-xs font-black text-violet-950">ภารกิจสั้น 3 ขั้น</p>
      <ol className="space-y-2">
        {[
          "จัดขั้วต่างกันเพื่อสังเกตแรงดึงดูด",
          "จัดขั้วเหมือนกันเพื่อสังเกตแรงผลัก",
          "ทดสอบเหล็กและวัสดุที่ไม่ถูกดูด",
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
          ปลดล็อกทดลองอิสระแล้ว ลองเปลี่ยนระยะและวัสดุเพิ่มเติม
        </p>
      )}
    </section>
  );

  const gap = 72 + distanceCm * 5;
  const leftMagnetX = 380 - gap / 2 - 120;
  const rightObjectX = 380 + gap / 2;
  const forceColor = relation === "attract" ? "#0f766e" : relation === "repel" ? "#e11d48" : "#64748b";

  return (
    <SharedSimulationShell
      accent="violet"
      labId={labId}
      category="Physics"
      title="สำรวจแม่เหล็ก"
      subtitle="หมุนขั้ว ปรับระยะ และทดสอบวัสดุ เพื่อสังเกตแรงดึงดูด แรงผลัก และวัสดุที่ตอบสนองต่อแม่เหล็ก"
      statusLabel={tested ? resultText : "รอการทดลอง"}
      icon={Magnet}
      sceneTitle="โต๊ะสำรวจแรงแม่เหล็ก"
      scene={
        <div className="h-full min-h-[300px] overflow-hidden rounded-2xl border border-violet-100 bg-[#faf8ff]">
          <svg
            viewBox="0 0 760 360"
            className="h-full w-full"
            role="img"
            aria-labelledby={`${titleId} ${descriptionId}`}
          >
            <title id={titleId}>การทดลองแรงระหว่างขั้วแม่เหล็กและวัสดุ</title>
            <desc id={descriptionId}>
              แสดงแม่เหล็กแท่ง ขั้วที่หันเข้าหากัน ระยะห่าง ทิศแรง และผลการทดสอบวัสดุ
            </desc>
            <defs>
              <marker id={arrowId} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                <path d="M0 0 L10 5 L0 10 Z" fill={forceColor} />
              </marker>
            </defs>
            <rect width="760" height="360" fill="#faf8ff" />
            <path d="M0 295 H760" stroke="#ddd6fe" strokeWidth="4" strokeDasharray="8 8" />

            <g transform={`translate(${leftMagnetX} 135)`}>
              <rect width="120" height="82" rx="15" fill="#fff" stroke="#7c3aed" strokeWidth="4" />
              <path d="M0 0 H60 V82 H0 Z" fill="#2563eb" />
              <path d="M60 0 H120 V82 H60 Z" fill="#ef4444" />
              <text x="30" y="52" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="900">S</text>
              <text x="90" y="52" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="900">N</text>
            </g>

            {testMode === "poles" ? (
              <g transform={`translate(${rightObjectX} 135)`}>
                <rect width="120" height="82" rx="15" fill="#fff" stroke="#7c3aed" strokeWidth="4" />
                {facingPole === "N" ? (
                  <>
                    <path d="M0 0 H60 V82 H0 Z" fill="#ef4444" />
                    <path d="M60 0 H120 V82 H60 Z" fill="#2563eb" />
                    <text x="30" y="52" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="900">N</text>
                    <text x="90" y="52" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="900">S</text>
                  </>
                ) : (
                  <>
                    <path d="M0 0 H60 V82 H0 Z" fill="#2563eb" />
                    <path d="M60 0 H120 V82 H60 Z" fill="#ef4444" />
                    <text x="30" y="52" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="900">S</text>
                    <text x="90" y="52" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="900">N</text>
                  </>
                )}
              </g>
            ) : (
              <g transform={`translate(${rightObjectX + 22} 122)`}>
                {material === "iron" ? (
                  <>
                    <rect x="10" y="12" width="74" height="110" rx="12" fill="#64748b" stroke="#334155" strokeWidth="4" />
                    <circle cx="47" cy="34" r="12" fill="#cbd5e1" />
                  </>
                ) : material === "aluminum" ? (
                  <rect x="8" y="14" width="80" height="106" rx="18" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="4" />
                ) : material === "wood" ? (
                  <rect x="0" y="25" width="96" height="88" rx="8" fill="#b45309" stroke="#78350f" strokeWidth="4" />
                ) : (
                  <circle cx="48" cy="72" r="45" fill="#22c55e" stroke="#15803d" strokeWidth="4" />
                )}
                <text x="48" y="148" textAnchor="middle" fill="#334155" fontSize="16" fontWeight="900">
                  {MATERIAL_LABELS[material]}
                </text>
              </g>
            )}

            {tested && relation !== "none" && (
              <>
                <path
                  d={
                    relation === "attract"
                      ? `M${leftMagnetX + 128} 176 H${rightObjectX - 12}`
                      : `M${leftMagnetX + 112} 176 H${leftMagnetX + 35}`
                  }
                  stroke={forceColor}
                  strokeWidth="7"
                  markerEnd={`url(#${arrowId})`}
                />
                {relation === "repel" && (
                  <path
                    d={`M${rightObjectX + 8} 176 H${rightObjectX + 86}`}
                    stroke={forceColor}
                    strokeWidth="7"
                    markerEnd={`url(#${arrowId})`}
                  />
                )}
              </>
            )}

            {tested && relation === "attract" && (
              <>
                <path d={`M${leftMagnetX + 104} 126 Q380 30 ${rightObjectX + 15} 126`} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="9 8" />
                <path d={`M${leftMagnetX + 104} 226 Q380 318 ${rightObjectX + 15} 226`} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="9 8" />
              </>
            )}

            <g transform="translate(234 42)">
              <rect width="292" height="66" rx="18" fill="#fff" stroke="#ddd6fe" strokeWidth="2" />
              <text x="146" y="27" textAnchor="middle" fill="#6d28d9" fontSize="14" fontWeight="900">
                ผลการสังเกต
              </text>
              <text x="146" y="51" textAnchor="middle" fill={tested ? forceColor : "#64748b"} fontSize="19" fontWeight="900">
                {tested ? resultText : "กดทดลองเพื่อดูผล"}
              </text>
            </g>

            <g transform="translate(270 270)">
              <path d="M0 0 H220" stroke="#64748b" strokeWidth="2" />
              <path d="M0 -7 V7 M220 -7 V7" stroke="#64748b" strokeWidth="2" />
              <text x="110" y="25" textAnchor="middle" fill="#475569" fontSize="14" fontWeight="900">
                ระยะห่าง {distanceCm} cm
              </text>
            </g>

            <g transform="translate(24 55)">
              <rect width="164" height="96" rx="18" fill="#fff" stroke="#ddd6fe" strokeWidth="2" />
              <text x="18" y="29" fill="#6d28d9" fontSize="14" fontWeight="900">
                ตัวชี้วัดแรง
              </text>
              <text x="18" y="63" fill="#0f172a" fontSize="25" fontWeight="900">
                {tested ? displayedStrength : 0} / 100
              </text>
              <text x="18" y="84" fill="#64748b" fontSize="11" fontWeight="800">
                ค่าคุณภาพสำหรับเปรียบเทียบ
              </text>
            </g>
          </svg>
        </div>
      }
      controlsTitle="แผงสำรวจแม่เหล็ก"
      controls={
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="mb-2 text-xs font-black text-slate-500">โหมดทดลอง</p>
              <div className="grid grid-cols-2 gap-2">
                {(["poles", "materials"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setTestMode(mode);
                      setTested(false);
                    }}
                    aria-pressed={testMode === mode}
                    className={`${buttonBase} ${
                      testMode === mode
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {mode === "poles" ? <Magnet className="h-4 w-4" /> : <TestTube2 className="h-4 w-4" />}
                    {mode === "poles" ? "ขั้วแม่เหล็ก" : "ทดสอบวัสดุ"}
                  </button>
                ))}
              </div>
            </div>

            {testMode === "poles" ? (
              <div>
                <p className="mb-2 text-xs font-black text-slate-500">ขั้วที่หันเข้าหา N ด้านซ้าย</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["N", "S"] as const).map((pole) => (
                    <button
                      key={pole}
                      type="button"
                      onClick={() => {
                        setFacingPole(pole);
                        setTested(false);
                      }}
                      aria-pressed={facingPole === pole}
                      className={`${buttonBase} ${
                        facingPole === pole
                          ? "border-violet-500 bg-violet-50 text-violet-900"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      ขั้ว {pole}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-2 text-xs font-black text-slate-500">เลือกวัสดุ</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(MATERIAL_LABELS) as TestMaterial[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setMaterial(id);
                        setTested(false);
                      }}
                      aria-pressed={material === id}
                      className={`${buttonBase} ${
                        material === id
                          ? "border-violet-500 bg-violet-50 text-violet-900"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {MATERIAL_LABELS[id]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="magnet-distance" className="text-xs font-black text-slate-500">
                  ระยะห่าง
                </label>
                <input
                  type="number"
                  min={4}
                  max={30}
                  value={distanceCm}
                  onChange={(event) =>
                    setDistanceCm(
                      Math.min(30, Math.max(4, Number(event.target.value) || 4)),
                    )
                  }
                  className="h-11 w-24 rounded-xl border border-slate-200 px-3 text-center text-sm font-black text-slate-800"
                  aria-label="ระยะห่างแม่เหล็กเป็นเซนติเมตร"
                />
              </div>
              <input
                id="magnet-distance"
                type="range"
                min={4}
                max={30}
                value={distanceCm}
                onChange={(event) => {
                  setDistanceCm(Number(event.target.value));
                  setTested(false);
                }}
                className="h-11 w-full accent-violet-600"
              />
            </div>

            <button
              type="button"
              onClick={handleTest}
              className={`${buttonBase} w-full border-violet-600 bg-violet-600 text-white hover:bg-violet-700`}
            >
              <FlaskConical className="h-4 w-4" />
              ทดลอง
            </button>
          </section>

          <div className="space-y-4">
            {missionPanel}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleLog}
                className={`${buttonBase} border-violet-600 bg-violet-600 text-white`}
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
            className={`${buttonBase} border-violet-600 bg-violet-600 text-white`}
          >
            <FlaskConical className="h-4 w-4" />
            ทดลอง
          </button>
          <button
            type="button"
            onClick={handleLog}
            className={`${buttonBase} border-violet-200 bg-violet-50 text-violet-900`}
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
          label: "ผลการทดลอง",
          value: tested ? resultText : "รอทดลอง",
          tone: relation === "repel" ? "rose" : relation === "attract" ? "emerald" : "blue",
        },
        { label: "ตัวชี้วัดแรง", value: `${tested ? displayedStrength : 0}/100`, tone: "violet" },
        { label: "ระยะห่าง", value: `${distanceCm} cm`, tone: "blue" },
        {
          label: "สิ่งที่ทดสอบ",
          value: testMode === "poles" ? `N กับ ${facingPole}` : MATERIAL_LABELS[material],
          tone: "orange",
        },
      ]}
      graph={
        <section className="min-h-[300px] rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
            <Gauge className="h-4 w-4 text-violet-700" />
            ตัวชี้วัดแรงตามระยะห่าง
          </h3>
          <svg viewBox="0 0 520 230" className="w-full" role="img" aria-label="กราฟแรงแม่เหล็กลดลงเมื่อระยะห่างเพิ่มขึ้น">
            <path d="M48 20 V190 H500" fill="none" stroke="#cbd5e1" strokeWidth="2" />
            <polyline
              points={graphPoints
                .map(
                  (point) =>
                    `${48 + ((point.distance - 4) / 24) * 430},${190 - point.strength * 1.55}`,
                )
                .join(" ")}
              fill="none"
              stroke="#7c3aed"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {graphPoints.map((point) => (
              <circle
                key={point.distance}
                cx={48 + ((point.distance - 4) / 24) * 430}
                cy={190 - point.strength * 1.55}
                r="6"
                fill="#fff"
                stroke="#7c3aed"
                strokeWidth="4"
              />
            ))}
            <text x="8" y="25" fontSize="11" fill="#64748b">แรง</text>
            <text x="447" y="220" fontSize="11" fill="#64748b">ระยะ cm</text>
          </svg>
        </section>
      }
      table={
        <section className="min-h-[300px] rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
            <ClipboardList className="h-4 w-4 text-violet-700" />
            สมุดบันทึกแม่เหล็ก
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">โหมด</th>
                  <th className="p-3">ชุดทดลอง</th>
                  <th className="p-3">ระยะ</th>
                  <th className="p-3">ผล</th>
                  <th className="p-3">ตัวชี้วัดแรง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loggedRuns.map((run, index) => (
                  <tr key={`${run.index}-${index}`}>
                    <td className="p-3 font-bold">{run.mode === "poles" ? "ขั้ว" : "วัสดุ"}</td>
                    <td className="p-3">
                      {run.mode === "poles" ? `N กับ ${run.facingPole}` : MATERIAL_LABELS[run.material]}
                    </td>
                    <td className="p-3">{run.distanceCm} cm</td>
                    <td className="p-3">{run.resultText}</td>
                    <td className="p-3 font-black text-violet-700">{run.strength}/100</td>
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
        "จำแนกแรงดึงดูดของขั้วต่างกันและแรงผลักของขั้วเหมือนกัน",
        "สังเกตว่าผลของแม่เหล็กลดลงเมื่อระยะห่างเพิ่มขึ้น",
        "ทดสอบและจำแนกวัสดุที่ถูกแม่เหล็กดูดในแบบจำลองระดับประถม",
      ]}
      steps={[
        { label: "เลือกโหมดขั้วแม่เหล็กหรือวัสดุ", icon: Compass },
        { label: "ตั้งขั้ว วัสดุ และระยะ", icon: Ruler },
        { label: "ทดลองและสังเกตทิศแรง", icon: Magnet },
        { label: "จดผลเพื่อผ่านภารกิจ", icon: ClipboardList },
      ]}
      progressLabel="ความคืบหน้าภารกิจ"
      progressValue={`${completedMissions}/3 ภารกิจ`}
      progressPercent={progressPercent}
      tips={[
        "ขั้วเหมือนกันผลักกัน ส่วนขั้วต่างกันดึงดูดกัน",
        "ตัวชี้วัดแรงเป็นค่าเปรียบเทียบในชั้นเรียน ไม่ใช่หน่วยแรงนิวตัน",
        "แบบจำลองวัสดุนี้ให้เหล็กตอบสนองต่อแม่เหล็ก ส่วนอะลูมิเนียม ไม้ และพลาสติกไม่ถูกดูดอย่างชัดเจน",
      ]}
      theory={
        <div className="space-y-3 text-sm font-semibold leading-relaxed text-slate-600">
          <p>
            แม่เหล็กมีขั้วเหนือ N และขั้วใต้ S ขั้วต่างกันดึงดูดกัน ส่วนขั้วเหมือนกันผลักกัน
          </p>
          <p className="rounded-xl bg-violet-50 p-3 font-black text-violet-950">
            เมื่อเพิ่มระยะห่าง ผลของแรงแม่เหล็กจะลดลงอย่างรวดเร็ว
          </p>
          <p>
            วัสดุแต่ละชนิดตอบสนองต่อแม่เหล็กต่างกัน การทดลองนี้ใช้กฎพื้นฐานสำหรับผู้เรียนระดับประถมและใช้ค่าความแรงแบบไม่มีหน่วยเพื่อการเปรียบเทียบ
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
