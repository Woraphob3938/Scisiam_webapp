"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Dna,
  GitBranch,
  Shuffle,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

type Genotype = "YY" | "Yy" | "yy";

interface MendelPoint {
  index: number;
  genotype: Genotype;
  phenotype: "เด่น" | "ด้อย";
}

const genotypeOptions: Genotype[] = ["YY", "Yy", "yy"];

const getGametes = (genotype: Genotype) => genotype.split("") as Array<"Y" | "y">;

const normalizeGenotype = (a: "Y" | "y", b: "Y" | "y"): Genotype => {
  if (a === "Y" && b === "Y") return "YY";
  if (a === "y" && b === "y") return "yy";
  return "Yy";
};

const getPhenotype = (genotype: Genotype) => (genotype.includes("Y") ? "เด่น" : "ด้อย");

const buildPunnett = (parentA: Genotype, parentB: Genotype) => {
  const gametesA = getGametes(parentA);
  const gametesB = getGametes(parentB);

  return gametesA.flatMap((a) => gametesB.map((b) => normalizeGenotype(a, b)));
};

const countResults = (points: MendelPoint[]) => {
  const counts = { YY: 0, Yy: 0, yy: 0, dominant: 0, recessive: 0 };
  points.forEach((point) => {
    counts[point.genotype] += 1;
    if (point.phenotype === "เด่น") counts.dominant += 1;
    else counts.recessive += 1;
  });
  return counts;
};

function GeneticsScene({
  parentA,
  parentB,
  results,
  traitLabel,
  isRunning,
}: {
  parentA: Genotype;
  parentB: Genotype;
  results: MendelPoint[];
  traitLabel: string;
  isRunning: boolean;
}) {
  const punnett = buildPunnett(parentA, parentB);
  const latest = results[results.length - 1];

  return (
    <div className="relative flex h-full min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-violet-100 bg-[linear-gradient(135deg,#faf5ff_0%,#ecfeff_48%,#f8fafc_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-30" />
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 text-left shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-violet-600">punnett square</p>
        <p className="mt-0.5 text-xs font-bold text-slate-600">{traitLabel}</p>
      </div>

      <svg className="relative z-10 h-full max-h-[365px] w-full max-w-[580px]" viewBox="0 0 580 365" fill="none" aria-hidden="true">
        <ellipse cx="292" cy="312" rx="190" ry="24" fill="#ddd6fe" opacity="0.44" />

        <g transform="translate(76, 88)">
          <rect x="0" y="0" width="118" height="78" rx="24" fill="#ffffff" stroke="#a78bfa" strokeWidth="4" />
          <text x="59" y="28" fill="#64748b" fontSize="12" fontWeight="900" textAnchor="middle">Parent A</text>
          <text x="59" y="56" fill="#7c3aed" fontSize="27" fontWeight="900" textAnchor="middle">{parentA}</text>
          <path d="M112 40H165" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 8" />
        </g>

        <g transform="translate(386, 88)">
          <rect x="0" y="0" width="118" height="78" rx="24" fill="#ffffff" stroke="#38bdf8" strokeWidth="4" />
          <text x="59" y="28" fill="#64748b" fontSize="12" fontWeight="900" textAnchor="middle">Parent B</text>
          <text x="59" y="56" fill="#0891b2" fontSize="27" fontWeight="900" textAnchor="middle">{parentB}</text>
          <path d="M6 40H-47" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 8" />
        </g>

        <g transform="translate(214, 64)">
          <rect x="0" y="0" width="152" height="152" rx="24" fill="#ffffff" stroke="#e2e8f0" strokeWidth="4" />
          <path d="M76 0V152M0 76H152" stroke="#e2e8f0" strokeWidth="4" />
          {punnett.map((genotype, index) => {
            const x = index % 2 === 0 ? 38 : 114;
            const y = index < 2 ? 45 : 121;
            const isDominant = getPhenotype(genotype) === "เด่น";
            return (
              <g key={`${genotype}-${index}`} className={isRunning ? "animate-pulse" : ""}>
                <circle cx={x} cy={y} r="24" fill={isDominant ? "#dcfce7" : "#f1f5f9"} stroke={isDominant ? "#22c55e" : "#94a3b8"} strokeWidth="3" />
                <text x={x} y={y + 6} fill={isDominant ? "#15803d" : "#475569"} fontSize="18" fontWeight="900" textAnchor="middle">{genotype}</text>
              </g>
            );
          })}
        </g>

        <g transform="translate(174, 238)">
          <rect x="0" y="0" width="232" height="62" rx="22" fill="#ffffff" stroke="#ddd6fe" strokeWidth="3" />
          <text x="116" y="23" fill="#64748b" fontSize="11" fontWeight="900" textAnchor="middle">ล่าสุด</text>
          <text x="116" y="47" fill="#7c3aed" fontSize="20" fontWeight="900" textAnchor="middle">{latest ? `${latest.genotype} / ${latest.phenotype}` : "รอเริ่มจำลอง"}</text>
        </g>

        {[0, 1, 2, 3, 4, 5].map((seed, index) => (
          <g key={seed} transform={`translate(${96 + index * 72}, ${276 + (index % 2) * 18})`} opacity={Math.min(1, results.length / 24 + 0.25)}>
            <path d="M16 28C16 17 16 10 16 4" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" />
            <path d="M16 16C5 7 -4 11 -9 20C2 25 11 25 16 16Z" fill="#22c55e" />
            <path d="M16 12C28 2 39 6 43 17C31 22 22 22 16 12Z" fill="#16a34a" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function RatioGraph({ points }: { points: MendelPoint[] }) {
  const counts = useMemo(() => countResults(points), [points]);
  const total = Math.max(1, points.length);
  const dominantPct = (counts.dominant / total) * 100;
  const recessivePct = (counts.recessive / total) * 100;

  return (
    <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <BarChart3 className="h-4.5 w-4.5 text-violet-600" />
          กราฟสัดส่วนฟีโนไทป์
        </h3>
        <span className="text-[10px] font-bold text-violet-600">phenotype ratio</span>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-5 rounded-xl bg-slate-50/70 p-4">
        {[
          ["เด่น", dominantPct, "#22c55e"],
          ["ด้อย", recessivePct, "#94a3b8"],
        ].map(([label, pct, color]) => (
          <div key={label as string}>
            <div className="mb-1 flex justify-between text-xs font-black text-slate-600">
              <span>{label as string}</span>
              <span>{(pct as number).toFixed(1)}%</span>
            </div>
            <div className="h-6 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color as string }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResultsTable({ points }: { points: MendelPoint[] }) {
  const rows = points.slice(-7);

  return (
    <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-violet-600" />
          ตารางลูกหลาน
        </h3>
        <span className="text-[10px] font-bold text-slate-400">{points.length} ตัวอย่าง</span>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-violet-50/70 text-[11px] font-black text-violet-800">
            <tr>
              <th className="px-3 py-2">ลำดับ</th>
              <th className="px-3 py-2">Genotype</th>
              <th className="px-3 py-2">Phenotype</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {rows.map((point) => (
              <tr key={point.index}>
                <td className="px-3 py-2 font-mono">#{point.index}</td>
                <td className="px-3 py-2 font-mono text-violet-700">{point.genotype}</td>
                <td className="px-3 py-2 text-emerald-700">{point.phenotype}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TheoryPanel() {
  return (
    <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Dna className="h-4.5 w-4.5 text-violet-600" />
        ทฤษฎีและสมการ
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-center text-2xl font-black text-slate-800">
          P × P → F₁
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500">
          ตาราง Punnett ใช้คาดการณ์โอกาสของจีโนไทป์จากแอลลีลของพ่อแม่ ลักษณะเด่นจะแสดงออกเมื่อมีแอลลีลเด่นอย่างน้อยหนึ่งตัว
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">Y: <b className="text-emerald-700">เด่น</b></span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5">y: <b className="text-slate-700">ด้อย</b></span>
        </div>
      </div>
    </section>
  );
}

export default function MendelianGeneticsSimulation() {
  const [parentA, setParentA] = useState<Genotype>("Yy");
  const [parentB, setParentB] = useState<Genotype>("Yy");
  const [traitLabel, setTraitLabel] = useState("สีเมล็ดถั่ว");
  const [sampleSize, setSampleSize] = useState(64);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<MendelPoint[]>([]);

  const isRunningRef = useRef(isRunning);
  const resultsRef = useRef(results);
  const sampleSizeRef = useRef(sampleSize);
  const parentARef = useRef(parentA);
  const parentBRef = useRef(parentB);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { resultsRef.current = results; }, [results]);
  useEffect(() => { sampleSizeRef.current = sampleSize; }, [sampleSize]);
  useEffect(() => { parentARef.current = parentA; }, [parentA]);
  useEffect(() => { parentBRef.current = parentB; }, [parentB]);

  const punnett = useMemo(() => buildPunnett(parentA, parentB), [parentA, parentB]);
  const counts = useMemo(() => countResults(results), [results]);
  const dominantPct = results.length > 0 ? (counts.dominant / results.length) * 100 : 75;
  const progress = Math.min(100, (results.length / sampleSize) * 100);

  const createOffspring = (index: number): MendelPoint => {
    const options = buildPunnett(parentARef.current, parentBRef.current);
    const genotype = options[Math.floor(Math.random() * options.length)];
    return {
      index,
      genotype,
      phenotype: getPhenotype(genotype),
    };
  };

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      const currentLength = resultsRef.current.length;
      if (currentLength >= sampleSizeRef.current) {
        setIsRunning(false);
        isRunningRef.current = false;
        return;
      }

      const next = createOffspring(currentLength + 1);
      setResults((previous) => [...previous, next]);
    }, 120);

    return () => clearInterval(timer);
  }, [isRunning]);

  const handleStartStop = () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    isRunningRef.current = nextRunning;
  };

  const handleReset = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setResults([]);
    resultsRef.current = [];
  };

  const handleSave = async () => {
    if (results.length === 0) {
      alert("ยังไม่มีข้อมูล Mendelian Genetics สำหรับบันทึก กรุณาเริ่มทดลองก่อน");
      return;
    }

    const experimentData = {
      labId: "mendels-inheritance",
      timestamp: new Date().toLocaleString("th-TH"),
      parentA,
      parentB,
      traitLabel,
      sampleSize,
      dataPoints: results,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_mendelian_experiment",
      localPayload: experimentData,
      labId: "mendels-inheritance",
      title: "Mendelian Genetics Lab",
      variables: { parentA, parentB, traitLabel, sampleSize },
      liveValues: { dominantPct, counts, progress },
      graphPoints: results,
      tableRows: results,
      summary: {
        traitLabel,
        sampleSize,
        dataPointCount: results.length,
        dominantPercent: dominantPct,
      },
      score: Math.round(Math.min(100, Math.max(0, progress))),
    });
  };

  const controls = (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-slate-600">ลักษณะที่ศึกษา</span>
        <select value={traitLabel} onChange={(event) => setTraitLabel(event.target.value)} disabled={isRunning || results.length > 0} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-45">
          <option value="สีเมล็ดถั่ว">สีเมล็ดถั่ว</option>
          <option value="ความสูงลำต้น">ความสูงลำต้น</option>
          <option value="รูปทรงเมล็ด">รูปทรงเมล็ด</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        {[
          ["พ่อแม่ A", parentA, setParentA],
          ["พ่อแม่ B", parentB, setParentB],
        ].map(([label, value, setValue]) => (
          <label key={label as string} className="block">
            <span className="mb-1 block text-xs font-bold text-slate-600">{label as string}</span>
            <select value={value as Genotype} onChange={(event) => (setValue as React.Dispatch<React.SetStateAction<Genotype>>)(event.target.value as Genotype)} disabled={isRunning || results.length > 0} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-45">
              {genotypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        ))}
      </div>

      <label className="block">
        <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>จำนวนตัวอย่าง</span>
          <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">{sampleSize}</span>
        </div>
        <input type="range" min={16} max={128} step={8} value={sampleSize} disabled={isRunning || results.length > 0} onChange={(event) => setSampleSize(Number(event.target.value))} className="h-1.5 w-full rounded-full bg-slate-100 accent-violet-500 disabled:opacity-45" />
      </label>

    </div>
  );

  return (
    <SharedSimulationShell
      accent="violet"
      labId="mendels-inheritance"
      category="Biology"
      title="Mendelian Genetics Lab"
      subtitle="จำลองการผสมลักษณะของถั่วลันเตาด้วยตาราง Punnett สุ่มลูกหลานและเปรียบเทียบสัดส่วนจีโนไทป์กับฟีโนไทป์"
      statusLabel={isRunning ? "กำลังสุ่มรุ่นลูก" : "พร้อมทดลอง"}
      icon={Dna}
      sceneTitle="ตารางพันธุกรรมจำลอง"
      scene={<GeneticsScene parentA={parentA} parentB={parentB} results={results} traitLabel={traitLabel} isRunning={isRunning} />}
      controlsTitle="แผงควบคุมการผสมพันธุ์"
      controls={controls}
      metrics={[
        { label: "ตัวอย่าง", value: `${results.length}/${sampleSize}`, tone: "violet" },
        { label: "เด่น", value: `${dominantPct.toFixed(1)}%`, tone: "emerald" },
        { label: "YY", value: String(counts.YY), tone: "blue" },
        { label: "yy", value: String(counts.yy), tone: "orange" },
      ]}
      graph={<RatioGraph points={results.length > 0 ? results : punnett.map((genotype, index) => ({ index: index + 1, genotype, phenotype: getPhenotype(genotype) }))} />}
      table={<ResultsTable points={results} />}
      theory={<TheoryPanel />}
      steps={[
        { label: "เลือกพ่อแม่", icon: Dna },
        { label: "สร้าง Punnett", icon: GitBranch },
        { label: "สุ่มรุ่นลูก", icon: Shuffle },
        { label: "นับสัดส่วน", icon: BarChart3 },
        { label: "สรุปผล", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "เข้าใจความสัมพันธ์ระหว่าง genotype และ phenotype",
        "อ่านตาราง Punnett สำหรับการผสมแบบยีนเดียว",
        "เปรียบเทียบผลสุ่มกับสัดส่วนคาดการณ์",
        "ตีความลักษณะเด่นและลักษณะด้อย",
      ]}
      progressLabel="ตัวอย่างที่สุ่มแล้ว"
      progressValue={`${results.length} / ${sampleSize}`}
      progressPercent={progress}
      tips={[
        "เพิ่มจำนวนตัวอย่างเพื่อให้สัดส่วนใกล้ค่าทฤษฎีมากขึ้น",
        "ลองเปลี่ยนพ่อแม่จาก Yy × Yy เป็น YY × yy เพื่อเทียบผล",
        "แยกการนับ genotype และ phenotype เพราะสองอย่างนี้ไม่เหมือนกัน",
        "สังเกตว่าลักษณะด้อยจะแสดงเมื่อ genotype เป็น yy เท่านั้น",
      ]}
      onRun={handleStartStop}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}

