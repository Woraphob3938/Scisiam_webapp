"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Compass,
  Play,
  RotateCcw,
  Sliders,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface TrophicPoint {
  level: string;
  organism: string;
  energy: number;
  biomass: number;
  toxin: number;
}

interface EcologyRun {
  producerEnergy: number;
  transferEfficiency: number;
  toxinInput: number;
  topPredatorEnergy: number;
  topPredatorToxin: number;
  pyramidHealth: string;
  dataPoints: TrophicPoint[];
}

const trophicTemplate = [
  { level: "ผู้ผลิต", organism: "หญ้า / สาหร่าย", color: "#22c55e" },
  { level: "ผู้บริโภคอันดับ 1", organism: "ตั๊กแตน / แพลงก์ตอน", color: "#84cc16" },
  { level: "ผู้บริโภคอันดับ 2", organism: "นกเล็ก / ปลาเล็ก", color: "#f59e0b" },
  { level: "ผู้ล่าสูงสุด", organism: "เหยี่ยว / ปลาใหญ่", color: "#ef4444" },
];

function classifyHealth(energyRatio: number, toxin: number) {
  if (toxin >= 18) return "เสี่ยงสารพิษสะสมสูง";
  if (energyRatio < 0.001) return "ผู้ล่าสูงสุดพลังงานต่ำมาก";
  if (energyRatio < 0.004) return "สมดุลเปราะบาง";
  return "ระบบนิเวศค่อนข้างสมดุล";
}

function TrophicIcon({ index }: { index: number }) {
  if (index === 0) {
    return (
      <g stroke="#064e3b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        <path d="M12 25 V10" />
        <path d="M12 16 C4 16 3 8 11 7 C15 9 15 13 12 16 Z" fill="#dcfce7" />
        <path d="M12 12 C18 11 21 5 15 3 C11 5 10 8 12 12 Z" fill="#bbf7d0" />
      </g>
    );
  }

  if (index === 1) {
    return (
      <g fill="#ecfccb" stroke="#365314" strokeLinecap="round" strokeWidth="1.6">
        <circle cx="7" cy="14" r="4" />
        <circle cx="14" cy="14" r="4.5" />
        <circle cx="22" cy="14" r="5" />
        <path d="M5 19 L2 23 M12 19 L10 24 M20 19 L22 24 M24 9 L27 5" fill="none" />
      </g>
    );
  }

  if (index === 2) {
    return (
      <g fill="#fef3c7" stroke="#78350f" strokeLinejoin="round" strokeWidth="1.6">
        <ellipse cx="13" cy="14" rx="10" ry="6" />
        <path d="M22 14 L29 8 V20 Z" />
        <circle cx="8" cy="12" r="1.3" fill="#78350f" stroke="none" />
      </g>
    );
  }

  return (
    <g fill="#fee2e2" stroke="#7f1d1d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
      <path d="M2 17 C7 6 13 8 16 13 C19 8 25 6 30 17 C24 14 20 17 16 21 C12 17 8 14 2 17 Z" />
      <path d="M16 13 V24" fill="none" />
    </g>
  );
}

export default function FoodChainEcologySimulation() {
  const [producerEnergy, setProducerEnergy] = useState(10000);
  const [transferEfficiency, setTransferEfficiency] = useState(10);
  const [toxinInput, setToxinInput] = useState(2);
  const [isSimulated, setIsSimulated] = useState(false);
  const [history, setHistory] = useState<EcologyRun[]>([]);

  const trophicData = useMemo<TrophicPoint[]>(() => {
    return trophicTemplate.map((item, index) => {
      const transferFactor = transferEfficiency / 100;
      const energy = Math.max(0.01, producerEnergy * Math.pow(transferFactor, index));
      const biomass = Math.max(0.01, energy / 20);
      const toxin = Math.round(toxinInput * Math.pow(3.2, index) * 10) / 10;

      return {
        level: item.level,
        organism: item.organism,
        energy: Math.round(energy * 10) / 10,
        biomass: Math.round(biomass * 10) / 10,
        toxin,
      };
    });
  }, [producerEnergy, transferEfficiency, toxinInput]);

  const topPredator = trophicData[trophicData.length - 1];
  const energyRatio = topPredator.energy / producerEnergy;
  const pyramidHealth = classifyHealth(energyRatio, topPredator.toxin);

  const invalidateRunState = () => {
    setIsSimulated(false);
    setHistory([]);
  };

  const handleSimulate = () => {
    const run: EcologyRun = {
      producerEnergy,
      transferEfficiency,
      toxinInput,
      topPredatorEnergy: topPredator.energy,
      topPredatorToxin: topPredator.toxin,
      pyramidHealth,
      dataPoints: trophicData,
    };

    setIsSimulated(true);
    setHistory((prev) => [run, ...prev].slice(0, 5));
  };

  const handleReset = () => {
    setProducerEnergy(10000);
    setTransferEfficiency(10);
    setToxinInput(2);
    setIsSimulated(false);
    setHistory([]);
  };

  const handleSave = async () => {
    if (history.length === 0) {
      alert("กรุณากดจำลองพีระมิดพลังงานก่อนบันทึกผล");
      return;
    }

    const latest = history[0];
    const experimentData = {
      labId: "food-chain",
      timestamp: new Date().toLocaleString("th-TH"),
      producerEnergy,
      transferEfficiency,
      toxinInput,
      topPredatorEnergy: latest.topPredatorEnergy,
      topPredatorToxin: latest.topPredatorToxin,
      pyramidHealth,
      dataPoints: trophicData,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_food_chain_experiment",
      localPayload: experimentData,
      labId: "food-chain",
      title: "Food Chain & Ecology",
      variables: { producerEnergy, transferEfficiency, toxinInput },
      liveValues: {
        topPredatorEnergy: latest.topPredatorEnergy,
        topPredatorToxin: latest.topPredatorToxin,
        pyramidHealth,
      },
      graphPoints: trophicData.map((point, index) => ({ x: index + 1, y: point.energy })),
      tableRows: trophicData,
      summary: {
        producerEnergy,
        transferEfficiency,
        topPredatorEnergy: latest.topPredatorEnergy,
        topPredatorToxin: latest.topPredatorToxin,
      },
      score: 100,
    });
  };

  return (
    <SharedSimulationShell
      accent="emerald"
      labId="food-chain"
      category="Biology"
      title="Food Chain & Ecology"
      subtitle="จำลองการถ่ายทอดพลังงานตามลำดับขั้น Trophic พร้อมผลของสารพิษสะสมชีวภาพ เพื่อเห็นว่าพลังงานลดลงแต่สารพิษเพิ่มขึ้นในผู้ล่าสูงสุด"
      statusLabel={isSimulated ? pyramidHealth : "พร้อมทดลอง"}
      icon={Activity}
      sceneTitle="พีระมิดพลังงานและสารพิษสะสม"
      scene={
        <div className="relative flex h-[360px] items-center justify-center overflow-hidden bg-[#0f172a]">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-45 pointer-events-none" />

          <svg className="relative z-10 h-full w-full max-w-[680px] p-4" viewBox="0 0 560 300" fill="none" role="img" aria-label="พีระมิดพลังงานและการสะสมสารพิษในห่วงโซ่อาหาร">
            <title>พีระมิดพลังงานและการสะสมสารพิษ</title>
            <desc>พลังงานลดลงเมื่อสูงขึ้นตามลำดับผู้บริโภค ขณะที่สารพิษสะสมเพิ่มขึ้นจนถึงผู้ล่าสูงสุด</desc>
            <defs>
              <linearGradient id="energyGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#bbf7d0" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="toxinGlow" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#fecdd3" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>

            <text x="32" y="28" fill="#86efac" fontSize="12" fontWeight="900">พลังงานลดลงเมื่อสูงขึ้น</text>
            <text x="407" y="28" fill="#fda4af" fontSize="12" fontWeight="900">สารพิษสะสมเพิ่มขึ้น</text>

            {trophicData.map((point, index) => {
              const y = 214 - index * 48;
              const width = 300 - index * 56;
              const left = 230 - width / 2;
              const right = 230 + width / 2;
              const topWidth = Math.max(56, width - 42);
              const topLeft = 230 - topWidth / 2;
              const topRight = 230 + topWidth / 2;
              const color = trophicTemplate[index].color;
              const toxinDots = toxinInput === 0 ? 0 : Math.max(1, Math.round((point.toxin / topPredator.toxin) * 5));

              return (
                <g key={point.level}>
                  <path
                    d={`M${left} ${y + 36} H${right} L${topRight} ${y} H${topLeft} Z`}
                    fill={color}
                    opacity={isSimulated ? 0.9 : 0.45}
                    stroke="#f8fafc"
                    strokeWidth="2"
                  />
                  <g transform={`translate(${left + 16} ${y + 6})`}>
                    <circle cx="14" cy="14" r="14" fill="#ffffff" opacity="0.9" />
                    <g transform="translate(1 1) scale(.88)"><TrophicIcon index={index} /></g>
                  </g>
                  <text x="230" y={y + 16} textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">
                    {point.level}
                  </text>
                  <text x="230" y={y + 31} textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="800">
                    {isSimulated ? `${point.energy.toLocaleString()} kcal` : point.organism}
                  </text>
                  {Array.from({ length: toxinDots }, (_, dotIndex) => (
                    <circle
                      key={`${point.level}-toxin-${dotIndex}`}
                      cx={420 + dotIndex * 17}
                      cy={y + 18}
                      r={4 + index * 0.7}
                      fill="#fb7185"
                      opacity={isSimulated ? 0.95 : 0.35}
                    />
                  ))}
                  <text x="407" y={y + 38} fill="#fecdd3" fontSize="9" fontWeight="800">
                    {isSimulated ? `${point.toxin}x` : index === 0 ? "ต่ำ" : index === 3 ? "สูง" : ""}
                  </text>
                </g>
              );
            })}

            <rect x="406" y="48" width="8" height="184" rx="4" fill="url(#toxinGlow)" opacity="0.28" />
            <path d="M72 258 H388" stroke="url(#energyGlow)" strokeWidth="5" strokeLinecap="round" opacity="0.78" />
            <text x="230" y="282" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="900">
              ส่งผ่านพลังงาน {transferEfficiency}% ต่อระดับ
            </text>
            <text x="407" y="260" fill="#fda4af" fontSize="10" fontWeight="900">จุดสีชมพู = ความเข้มข้นสารพิษ</text>
          </svg>
        </div>
      }
      controlsTitle="ควบคุมพลังงานฐานและการส่งต่อ"
      controls={
        <div className="space-y-4 font-sans">
          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>พลังงานผู้ผลิตตั้งต้น</span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-black text-emerald-700">{producerEnergy.toLocaleString()} kcal</span>
            </div>
            <input
              type="range"
              min={3000}
              max={20000}
              step={1000}
              value={producerEnergy}
              onChange={(event) => {
                invalidateRunState();
                setProducerEnergy(Number(event.target.value));
              }}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-emerald-500"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>ประสิทธิภาพการส่งผ่าน</span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-black text-blue-700">{transferEfficiency}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={20}
              step={1}
              value={transferEfficiency}
              onChange={(event) => {
                invalidateRunState();
                setTransferEfficiency(Number(event.target.value));
              }}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-emerald-500"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>สารพิษตั้งต้นในผู้ผลิต</span>
              <span className="rounded-md bg-rose-50 px-2 py-0.5 font-black text-rose-700">{toxinInput}x</span>
            </div>
            <input
              type="range"
              min={0}
              max={8}
              step={1}
              value={toxinInput}
              onChange={(event) => {
                invalidateRunState();
                setToxinInput(Number(event.target.value));
              }}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-rose-500"
            />
          </label>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleSimulate}
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-black text-white shadow-sm hover:bg-emerald-700"
            >
              <Play className="h-4 w-4 fill-white stroke-none" />
              จำลองพีระมิด
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label="รีเซ็ตพีระมิดพลังงาน"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
      metrics={[
        { label: "Producer", value: `${producerEnergy.toLocaleString()} kcal`, tone: "emerald" },
        { label: "Efficiency", value: `${transferEfficiency}%`, tone: "blue" },
        { label: "Top predator", value: `${topPredator.energy} kcal`, tone: "orange" },
        { label: "Toxin", value: `${topPredator.toxin}x`, tone: topPredator.toxin >= 18 ? "rose" : "violet" },
      ]}
      graph={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <BarChart3 className="h-4.5 w-4.5 text-emerald-600" />
              Energy Flow
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 select-none">log-like bars</span>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-3 rounded-xl bg-slate-50/70 p-4">
            {trophicData.map((point, index) => {
              const widthPercent = Math.max(8, (point.energy / producerEnergy) * 100);
              return (
                <div key={point.level} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-black text-slate-600">
                    <span>{point.level}</span>
                    <span>{point.energy.toLocaleString()} kcal</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                      style={{ width: `${widthPercent}%`, opacity: 1 - index * 0.12 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <ClipboardList className="h-4.5 w-4.5 text-emerald-600" />
              ตาราง Trophic
            </h3>
            <span className="text-[10px] font-bold text-slate-400 select-none">4 levels</span>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-100 max-h-[190px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-emerald-50/80 text-[11px] font-black text-emerald-800">
                <tr>
                  <th className="px-2 py-2">Level</th>
                  <th className="px-2 py-2">Energy</th>
                  <th className="px-2 py-2">Toxin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                {trophicData.map((point) => (
                  <tr key={point.level}>
                    <td className="px-2 py-2">{point.level}</td>
                    <td className="px-2 py-2 font-mono text-emerald-700">{point.energy}</td>
                    <td className="px-2 py-2 font-mono text-rose-700">{point.toxin}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      }
      theory={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800 leading-normal">
            <Compass className="h-4.5 w-4.5 text-emerald-600" />
            ทฤษฎีพีระมิดนิเวศ
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3 text-xs font-semibold leading-relaxed text-slate-500">
            <p>กฎ 10% อธิบายว่าพลังงานส่วนใหญ่สูญเสียเป็นความร้อนและกิจกรรมดำรงชีวิต ทำให้ผู้ล่าสูงสุดมีพลังงานเหลือน้อยกว่าฐานผู้ผลิตมาก</p>
            <p className="rounded-xl bg-slate-50 p-3 text-slate-700">Biomagnification: สารพิษบางชนิดไม่สลายง่าย จึงสะสมเข้มข้นขึ้นในสิ่งมีชีวิตระดับสูง</p>
          </div>
        </section>
      }
      steps={[
        { label: "ตั้งพลังงานผู้ผลิต", icon: Sliders },
        { label: "คำนวณการส่งต่อ", icon: Activity },
        { label: "สร้างพีระมิด Trophic", icon: BarChart3 },
        { label: "ประเมินสารพิษสะสม", icon: ClipboardList },
        { label: "สรุปสมดุลระบบนิเวศ", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "อธิบายการไหลของพลังงานจากผู้ผลิตไปยังผู้บริโภคลำดับต่าง ๆ",
        "คำนวณพลังงานที่เหลือในแต่ละระดับด้วยประสิทธิภาพการส่งผ่าน",
        "แยกความแตกต่างระหว่างการสูญเสียพลังงานและการเพิ่มขึ้นของสารพิษสะสม",
        "ตีความความเสี่ยงของผู้ล่าสูงสุดเมื่อระบบนิเวศมีมลพิษ",
      ]}
      progressLabel="ระดับความพร้อมของแบบจำลอง"
      progressValue={isSimulated ? pyramidHealth : "รอจำลอง"}
      progressPercent={isSimulated ? 100 : 0}
      tips={[
        "ลองปรับประสิทธิภาพเป็น 10% เพื่อเห็นกฎสิบเปอร์เซ็นต์แบบมาตรฐาน",
        "เพิ่มสารพิษตั้งต้นเพื่อดูผล Biomagnification ในผู้ล่าสูงสุด",
        "เพิ่มพลังงานผู้ผลิตแล้วเทียบว่าผู้ล่าสูงสุดยังได้พลังงานน้อยเพียงใด",
      ]}
      onRun={handleSimulate}
      runLabel="จำลองพีระมิด"
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}

