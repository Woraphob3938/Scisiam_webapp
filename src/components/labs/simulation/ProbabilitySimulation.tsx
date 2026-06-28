"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Download,
  Clipboard,
  ClipboardList,
  Target,
  Trash,
  Sparkles,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface ProbabilityDataPoint {
  index: number;
  trialType: "Coin" | "Dice";
  addedCount: number;
  totalTrials: number;
  headsCount?: number;
  tailsCount?: number;
  diceFaceCounts?: number[];
  headsPercent?: number;
  tailsPercent?: number;
}

export default function ProbabilitySimulation() {
  const router = useRouter();
  const labId = "probability-simulation";

  // Simulator configurations
  const [trialType, setTrialType] = useState<"Coin" | "Dice">("Coin");
  const [batchSize, setBatchSize] = useState<number>(10); // 1, 10, 50, 100
  const [isAutoRunning, setIsAutoRunning] = useState(false);

  // Stats
  const [coinHeads, setCoinHeads] = useState(0);
  const [coinTails, setCoinTails] = useState(0);
  const [diceCounts, setDiceCounts] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [totalTrials, setTotalTrials] = useState(0);

  // Visualization animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastResults, setLastResults] = useState<number[]>([]); // 1 for heads, 2 for tails, or 1-6 for dice

  // Quest states
  const [questSuccess, setQuestSuccess] = useState(false);

  // History logs
  const [dataPoints, setDataPoints] = useState<ProbabilityDataPoint[]>([]);

  // Refs for animation & ticker
  const tickerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTrialsRef = useRef(totalTrials);
  const coinHeadsRef = useRef(coinHeads);
  const coinTailsRef = useRef(coinTails);
  const diceCountsRef = useRef(diceCounts);
  const trialTypeRef = useRef(trialType);
  const batchSizeRef = useRef(batchSize);

  useEffect(() => { totalTrialsRef.current = totalTrials; }, [totalTrials]);
  useEffect(() => { coinHeadsRef.current = coinHeads; }, [coinHeads]);
  useEffect(() => { coinTailsRef.current = coinTails; }, [coinTails]);
  useEffect(() => { diceCountsRef.current = diceCounts; }, [diceCounts]);
  useEffect(() => { trialTypeRef.current = trialType; }, [trialType]);
  useEffect(() => { batchSizeRef.current = batchSize; }, [batchSize]);

  // Clean up auto running on unmount
  useEffect(() => {
    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, []);

  // Run trials logic
  const runTrials = (count: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 400);

    const type = trialTypeRef.current;
    const newResults: number[] = [];

    if (type === "Coin") {
      let headsDelta = 0;
      let tailsDelta = 0;
      for (let i = 0; i < count; i++) {
        const isHeads = Math.random() < 0.5;
        if (isHeads) {
          headsDelta++;
          newResults.push(1);
        } else {
          tailsDelta++;
          newResults.push(2);
        }
      }
      const nextHeads = coinHeadsRef.current + headsDelta;
      const nextTails = coinTailsRef.current + tailsDelta;
      const nextTotal = totalTrialsRef.current + count;

      setCoinHeads(nextHeads);
      setCoinTails(nextTails);
      setTotalTrials(nextTotal);
      setLastResults(newResults.slice(-5)); // show up to last 5 values visually

      // Check quest condition: coin total >= 100 and deviation <= 2% (i.e. heads is between 48% and 52%)
      if (nextTotal >= 100) {
        const headsPercent = (nextHeads / nextTotal) * 100;
        if (headsPercent >= 48 && headsPercent <= 52) {
          setQuestSuccess(true);
        }
      }
    } else {
      const delta = [0, 0, 0, 0, 0, 0];
      for (let i = 0; i < count; i++) {
        const face = Math.floor(Math.random() * 6); // 0-5
        delta[face]++;
        newResults.push(face + 1);
      }
      const nextDice = diceCountsRef.current.map((v, i) => v + delta[i]);
      const nextTotal = totalTrialsRef.current + count;

      setDiceCounts(nextDice);
      setTotalTrials(nextTotal);
      setLastResults(newResults.slice(-5));

      // Check quest condition: dice total >= 120 and all faces are between 13.67% and 19.67% (within 3% of 16.67%)
      if (nextTotal >= 120) {
        const matches = nextDice.every((val) => {
          const pct = (val / nextTotal) * 100;
          return pct >= 13.67 && pct <= 19.67;
        });
        if (matches) {
          setQuestSuccess(true);
        }
      }
    }
  };

  // Auto run switch
  useEffect(() => {
    if (isAutoRunning) {
      tickerRef.current = setInterval(() => {
        runTrials(batchSizeRef.current);
      }, 500);
    } else {
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
    }
    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, [isAutoRunning]);

  const handleStartStop = () => setIsAutoRunning(!isAutoRunning);

  const handleSingleTrial = () => {
    if (isAutoRunning) setIsAutoRunning(false);
    runTrials(batchSize);
  };

  const handleReset = () => {
    setIsAutoRunning(false);
    setIsAnimating(false);
    setCoinHeads(0);
    setCoinTails(0);
    setDiceCounts([0, 0, 0, 0, 0, 0]);
    setTotalTrials(0);
    setLastResults([]);
    setDataPoints([]);
    setQuestSuccess(false);
  };

  const handleAddPoint = () => {
    if (totalTrials === 0) return;
    const type = trialType;

    const newPoint: ProbabilityDataPoint = {
      index: dataPoints.length + 1,
      trialType: type,
      addedCount: totalTrials - (dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].totalTrials : 0),
      totalTrials,
    };

    if (type === "Coin") {
      newPoint.headsCount = coinHeads;
      newPoint.tailsCount = coinTails;
      newPoint.headsPercent = parseFloat(((coinHeads / totalTrials) * 100).toFixed(1));
      newPoint.tailsPercent = parseFloat(((coinTails / totalTrials) * 100).toFixed(1));
    } else {
      newPoint.diceFaceCounts = [...diceCounts];
    }

    setDataPoints((prev) => [...prev, newPoint]);
  };

  const handleClearPoint = (idx: number) => {
    setDataPoints((prev) =>
      prev.filter((p) => p.index !== idx).map((p, i) => ({ ...p, index: i + 1 }))
    );
  };

  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    let csv = "จุดบันทึก,ประเภท,จำนวนรวม,ผลลัพธ์ย่อย\n";
    dataPoints.forEach((p) => {
      if (p.trialType === "Coin") {
        csv += `${p.index},เหรียญ,${p.totalTrials},หัว: ${p.headsCount} (${p.headsPercent}%) / ก้อย: ${p.tailsCount} (${p.tailsPercent}%)\n`;
      } else {
        csv += `${p.index},ลูกเต๋า,${p.totalTrials},[${p.diceFaceCounts?.join(" | ")}]\n`;
      }
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scisiam_probability_log.csv");
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
      .map((p) => {
        if (p.trialType === "Coin") {
          return `จุดที่ ${p.index} | สุ่มเหรียญ | การทดลองสะสม: ${p.totalTrials} ครั้ง | หัว: ${p.headsCount} (${p.headsPercent}%) | ก้อย: ${p.tailsCount} (${p.tailsPercent}%)`;
        } else {
          return `จุดที่ ${p.index} | สุ่มลูกเต๋า | การทดลองสะสม: ${p.totalTrials} ครั้ง | หน้า [1-6]: [${p.diceFaceCounts?.join(", ")}]`;
        }
      })
      .join("\n");
    navigator.clipboard.writeText(content).then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"));
  };

  const handleSaveResults = async () => {
    if (dataPoints.length === 0) {
      alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล!");
      return;
    }
    const experimentData = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      trialType,
      totalTrials,
      dataPoints,
    };
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_probability_experiment",
      localPayload: experimentData,
      labId,
      title: "Probability & Random Trials",
      variables: { trialType, batchSize },
      liveValues: { totalTrials, coinHeads, coinTails, questSuccess },
      graphPoints: dataPoints,
      tableRows: dataPoints,
      summary: {
        totalTrials,
        questSuccess,
        finalType: trialType,
      },
      score: questSuccess ? 100 : Math.min(90, dataPoints.length * 20),
      durationSeconds: 15,
    });
    alert("บันทึกข้อมูลการทดลองสำเร็จ! 🎉");
    router.push(`/labs/${labId}`);
  };

  // SVG Visual Renders
  const barChartHeight = 120;

  // Derive charts coordinates
  const renderCharts = () => {
    if (trialType === "Coin") {
      const headsPct = totalTrials > 0 ? (coinHeads / totalTrials) : 0.5;
      const tailsPct = totalTrials > 0 ? (coinTails / totalTrials) : 0.5;

      const headsH = headsPct * (barChartHeight - 30);
      const tailsH = tailsPct * (barChartHeight - 30);

      return (
        <g>
          {/* Heads Bar */}
          <rect x="75" y={barChartHeight - 15 - headsH} width="35" height={headsH} fill="#3b82f6" rx="4" opacity="0.85" />
          <text x="92.5" y={barChartHeight - 15 - headsH - 5} fill="#2563eb" fontSize="8" fontWeight="black" textAnchor="middle">
            {(headsPct * 100).toFixed(1)}%
          </text>
          <text x="92.5" y={barChartHeight} fill="#475569" fontSize="9" fontWeight="bold" textAnchor="middle">หัว (Heads)</text>

          {/* Tails Bar */}
          <rect x="135" y={barChartHeight - 15 - tailsH} width="35" height={tailsH} fill="#ec4899" rx="4" opacity="0.85" />
          <text x="152.5" y={barChartHeight - 15 - tailsH - 5} fill="#db2777" fontSize="8" fontWeight="black" textAnchor="middle">
            {(tailsPct * 100).toFixed(1)}%
          </text>
          <text x="152.5" y={barChartHeight} fill="#475569" fontSize="9" fontWeight="bold" textAnchor="middle">ก้อย (Tails)</text>

          {/* Theoretical probability baseline (50%) */}
          <line x1="60" y1={barChartHeight - 15 - 0.5 * (barChartHeight - 30)} x2="190" y2={barChartHeight - 15 - 0.5 * (barChartHeight - 30)} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="195" y={barChartHeight - 12 - 0.5 * (barChartHeight - 30)} fill="#64748b" fontSize="6.5" fontWeight="bold">ทฤษฎี 50%</text>
        </g>
      );
    } else {
      // Dice (1-6)
      const list = [];
      const theoreticalLineY = barChartHeight - 15 - (1 / 6) * (barChartHeight - 30);

      for (let i = 0; i < 6; i++) {
        const count = diceCounts[i];
        const pct = totalTrials > 0 ? (count / totalTrials) : 1 / 6;
        const barH = pct * (barChartHeight - 30);
        const barX = 40 + i * 28;

        list.push(
          <g key={i}>
            {/* Experimental bar */}
            <rect x={barX} y={barChartHeight - 15 - barH} width="16" height={barH} fill="#8b5cf6" rx="2" opacity="0.85" />
            <text x={barX + 8} y={barChartHeight - 15 - barH - 4} fill="#6d28d9" fontSize="7.5" fontWeight="black" textAnchor="middle">
              {(pct * 100).toFixed(0)}%
            </text>
            <text x={barX + 8} y={barChartHeight} fill="#475569" fontSize="9" fontWeight="bold" textAnchor="middle">{i + 1}</text>
          </g>
        );
      }

      return (
        <g>
          {list}
          {/* Theoretical baseline (16.67%) */}
          <line x1="30" y1={theoreticalLineY} x2="210" y2={theoreticalLineY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="213" y={theoreticalLineY + 2.5} fill="#64748b" fontSize="6.5" fontWeight="bold">ทฤษฎี 16.7%</text>
        </g>
      );
    }
  };

  return (
    <SharedSimulationShell
      accent="violet"
      labId={labId}
      category="Mathematics"
      title="Probability & Random Trials"
      subtitle="ทดลองทำซ้ำเหตุการณ์สุ่มด้วยลูกเต๋าและเหรียญเพื่อวิเคราะห์ความน่าจะเป็นแบบสะสม ค้นพบกฎจำนวนมาก (Law of Large Numbers)"
      statusLabel={totalTrials > 0 ? `จำนวนทดลองสะสม: ${totalTrials} ครั้ง` : "พร้อมทำการสุ่ม"}
      icon={Sparkles}
      sceneTitle="แท่นสุ่มจำลองและกราฟความถี่สะสม"
      scene={
        <div className="relative flex h-full min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eefcff_48%,#fff7fb_100%)] p-4 select-none">
          {/* Tech Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-45" />

          {/* Environmental information overlay card */}
          <div className="absolute left-5 top-5 rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-left shadow-sm backdrop-blur-md z-10">
            <p className="text-[9px] font-black uppercase tracking-wider text-violet-650">Trial statistics</p>
            <p className="mt-0.5 text-xs font-black text-slate-700">
              {trialType === "Coin" ? "สุ่มเหรียญ หัว/ก้อย" : "สุ่มลูกเต๋า 6 หน้า"}
            </p>
            <p className="font-mono text-[10px] font-bold text-slate-500 mt-0.5">
              รวม: {totalTrials} ครั้ง
            </p>
          </div>

          {/* SVG stage container */}
          <svg className="relative z-10 w-full max-w-[420px] h-52" viewBox="0 0 320 180">
            <defs>
              <linearGradient id="goldCoin" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#0f172a" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* Gaming Felt Plate / Table Layout */}
            <rect x="15" y="10" width="290" height="160" rx="20" fill="#ffffff" stroke="#ddd6fe" strokeWidth="2.2" filter="url(#shadow)" />
            <rect x="23" y="18" width="274" height="144" rx="14" fill="#faf5ff" />

            {/* Left Zone: Die/Coin display */}
            <g transform="translate(50, 80)">
              {/* Green felt mat for rolling */}
              <circle cx="0" cy="0" r="30" fill="#f5f3ff" stroke="#c084fc" strokeWidth="1.2" />

              {/* Coin graphics */}
              {trialType === "Coin" && (
                <g filter="url(#shadow)" className={isAnimating ? "animate-spin" : ""}>
                  <circle cx="0" cy="0" r="20" fill="url(#goldCoin)" stroke="#ca8a04" strokeWidth="1" />
                  <circle cx="0" cy="0" r="16" fill="none" stroke="#fef08a" strokeWidth="0.8" strokeDasharray="3 2" />
                  <text x="0" y="3.5" fill="#78350f" fontSize="10.5" fontWeight="950" textAnchor="middle" fontFamily="sans-serif">
                    {lastResults.length > 0 ? (lastResults[lastResults.length - 1] === 1 ? "หัว" : "ก้อย") : "เหรียญ"}
                  </text>
                </g>
              )}

              {/* Dice graphics */}
              {trialType === "Dice" && (
                <g filter="url(#shadow)" className={isAnimating ? "animate-bounce" : ""}>
                  <rect x="-16" y="-16" width="32" height="32" rx="6" fill="#ffffff" stroke="#7c3aed" strokeWidth="2.2" />

                  {/* Dice face dots configuration based on last roll */}
                  {(() => {
                    const roll = lastResults.length > 0 ? lastResults[lastResults.length - 1] : 6;
                    const dots = [];
                    const c = "fill-[#6d28d9]";
                    if ([1, 3, 5].includes(roll)) dots.push(<circle key="c" cx="0" cy="0" r="2.5" className={c} fill="#ef4444" />); // center dot (red for 1/3/5)
                    if ([2, 3, 4, 5, 6].includes(roll)) {
                      dots.push(<circle key="tl" cx="-8" cy="-8" r="2.2" className={c} />);
                      dots.push(<circle key="br" cx="8" cy="8" r="2.2" className={c} />);
                    }
                    if ([4, 5, 6].includes(roll)) {
                      dots.push(<circle key="tr" cx="8" cy="-8" r="2.2" className={c} />);
                      dots.push(<circle key="bl" cx="-8" cy="8" r="2.2" className={c} />);
                    }
                    if (roll === 6) {
                      dots.push(<circle key="ml" cx="-8" cy="0" r="2.2" className={c} />);
                      dots.push(<circle key="mr" cx="8" cy="0" r="2.2" className={c} />);
                    }
                    return dots;
                  })()}
                </g>
              )}
            </g>

            {/* Right Zone: Real-time Bar chart */}
            <g transform="translate(85, 20)">
              {renderCharts()}
            </g>
          </svg>
        </div>
      }
      controlsTitle="แผงควบคุมการทดลองสุ่ม"
      controls={
        <div className="space-y-4">
          {/* Trial Type Selector */}
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-black text-slate-500 block mb-1.5">วัตถุการสุ่ม (Trial Object)</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isAutoRunning) setIsAutoRunning(false);
                  setTrialType("Coin");
                  setTotalTrials(0);
                  setCoinHeads(0);
                  setCoinTails(0);
                  setLastResults([]);
                }}
                className={`py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                  trialType === "Coin"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-655 hover:bg-slate-50"
                }`}
              >
                เหรียญ (Coin)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isAutoRunning) setIsAutoRunning(false);
                  setTrialType("Dice");
                  setTotalTrials(0);
                  setDiceCounts([0, 0, 0, 0, 0, 0]);
                  setLastResults([]);
                }}
                className={`py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                  trialType === "Dice"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-655 hover:bg-slate-50"
                }`}
              >
                ลูกเต๋า (Dice)
              </button>
            </div>
          </div>

          {/* Batch size configuration */}
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-black text-slate-500 block mb-1.5">จำนวนครั้งต่อการสุ่มหนึ่งรอบ</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 10, 50, 100].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBatchSize(size)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    batchSize === size
                      ? "bg-slate-800 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Controls Actions */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={handleStartStop}
              className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${
                isAutoRunning ? "bg-slate-700" : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isAutoRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
              {isAutoRunning ? "หยุดอัตโนมัติ" : "รันอัตโนมัติ"}
            </button>
            <button
              onClick={handleSingleTrial}
              className="inline-flex items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-xs font-black text-violet-700 hover:bg-violet-100 cursor-pointer"
            >
              สุ่ม 1 รอบ
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-650 hover:bg-slate-50 cursor-pointer"
              aria-label="รีเซ็ตสถิติ"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
      compactControls={
        <div className="grid grid-cols-2 gap-3">
          <ManualNumberInput
            label="จำนวนครั้งสุ่มต่อรอบ"
            ariaLabel="กรอกจำนวนครั้งสุ่ม"
            value={batchSize}
            min={1}
            max={500}
            step={1}
            tone="violet"
            onChange={setBatchSize}
          />
        </div>
      }
      metrics={[
        { label: "จำนวนครั้งรวม", value: `${totalTrials} ครั้ง`, tone: "violet" },
        {
          label: trialType === "Coin" ? "อัตราออกหัว" : "ออกหน้า 6",
          value:
            trialType === "Coin"
              ? `${totalTrials > 0 ? ((coinHeads / totalTrials) * 100).toFixed(1) : "50.0"}%`
              : `${totalTrials > 0 ? ((diceCounts[5] / totalTrials) * 100).toFixed(1) : "16.7"}%`,
          tone: "emerald",
        },
        {
          label: trialType === "Coin" ? "อัตราออกก้อย" : "ออกหน้า 1",
          value:
            trialType === "Coin"
              ? `${totalTrials > 0 ? ((coinTails / totalTrials) * 100).toFixed(1) : "50.0"}%`
              : `${totalTrials > 0 ? ((diceCounts[0] / totalTrials) * 100).toFixed(1) : "16.7"}%`,
          tone: "rose",
        },
        { label: "ภารกิจเสร็จสิ้น", value: questSuccess ? "สำเร็จ 🎉" : "กำลังดำเนิน", tone: questSuccess ? "emerald" : "orange" },
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-violet-600" />
              สรุปตารางแจกแจงความถี่จำลอง
            </h3>
          </div>
          <div className="flex-1 rounded-xl bg-slate-950 p-4 flex flex-col justify-between font-mono text-xs text-slate-350">
            {trialType === "Coin" ? (
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-400 font-bold">หัว (Heads):</span>
                  <span className="text-white font-extrabold">{coinHeads} ครั้ง</span>
                  <span className="text-slate-400">({totalTrials > 0 ? ((coinHeads / totalTrials) * 100).toFixed(1) : "0"}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-pink-400 font-bold">ก้อย (Tails):</span>
                  <span className="text-white font-extrabold">{coinTails} ครั้ง</span>
                  <span className="text-slate-400">({totalTrials > 0 ? ((coinTails / totalTrials) * 100).toFixed(1) : "0"}%)</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 py-2">
                {diceCounts.map((count, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-slate-900 pb-1">
                    <span className="text-violet-400 font-bold">หน้า {index + 1}:</span>
                    <span className="text-white font-extrabold">{count} ครั้ง</span>
                    <span className="text-slate-400">({totalTrials > 0 ? ((count / totalTrials) * 100).toFixed(1) : "0"}%)</span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-slate-900 pt-2 text-[10px] text-slate-500 text-center font-sans font-bold">
              ความถี่สัมพัทธ์ (Relative Frequency) จะลู่เข้าหาความน่าจะเป็นตามทฤษฎีเมื่อจำนวนครั้งเพิ่มขึ้น
            </div>
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <ClipboardList className="h-4.5 w-4.5 text-violet-600" />
              ตารางบันทึกความถี่สะสม
            </h3>
            <div className="flex gap-2">
              <button onClick={handleCopyData} className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <Clipboard className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleExportCSV} className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleAddPoint} className="p-1.5 bg-violet-50 border border-violet-100 text-violet-600 rounded-lg hover:bg-violet-100 transition cursor-pointer text-[10px] font-black">
                บันทึกจุด
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-violet-50/70 text-[11px] font-black text-violet-850">
                <tr>
                  <th className="px-3 py-2">จุด</th>
                  <th className="px-3 py-2">ประเภท</th>
                  <th className="px-3 py-2">จำนวนรวม</th>
                  <th className="px-3 py-2">หัว / ก้อย (หน้า 1 / หน้า 6)</th>
                  <th className="px-3 py-2 text-center">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                {dataPoints.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">ยังไม่มีประวัติบันทึก</td>
                  </tr>
                ) : (
                  dataPoints.map((point) => (
                    <tr key={point.index} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-mono">#{point.index}</td>
                      <td className="px-3 py-2">{point.trialType === "Coin" ? "เหรียญ" : "ลูกเต๋า"}</td>
                      <td className="px-3 py-2 font-mono text-slate-700">{point.totalTrials}</td>
                      <td className="px-3 py-2 font-mono text-amber-600">
                        {point.trialType === "Coin"
                          ? `หัว: ${point.headsCount} (${point.headsPercent}%) / ก้อย: ${point.tailsCount}`
                          : `หน้า 1: ${point.diceFaceCounts?.[0]} / หน้า 6: ${point.diceFaceCounts?.[5]}`}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => handleClearPoint(point.index)} className="text-red-500 hover:text-red-700 p-1">
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
      }
      theory={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
            <Sliders className="h-4.5 w-4.5 text-violet-600" />
            ทฤษฎีความน่าจะเป็น (Probability Theory)
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3 text-xs leading-relaxed text-slate-500">
            <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-center text-xl font-black text-slate-800 font-mono">
              P(A) = n(A) / n(S)
            </div>
            <p className="font-semibold">
              ความน่าจะเป็นตามทฤษฎี $P(A)$ คืออัตราส่วนระหว่างจำนวนผลลัพธ์ในเหตุการณ์ที่สนใจ $n(A)$ ต่อจำนวนผลลัพธ์ทั้งหมดที่เป็นไปได้ในปริภูมิตัวอย่าง $n(S)$
            </p>
            <p className="font-semibold border-t border-slate-100 pt-2">
              <b>กฎของจำนวนมาก (Law of Large Numbers)</b> ระบุว่าเมื่อการทดลองแบบสุ่มถูกทำซ้ำเป็นจำนวนครั้งที่มากพอ ความถี่สัมพัทธ์ (Relative Frequency) ของผลลัพธ์จะลู่เข้าหาค่าความน่าจะเป็นเชิงทฤษฎี
            </p>
          </div>
        </section>
      }
      steps={[
        { label: "เลือกประเภทวัตถุสุ่ม", icon: Sliders },
        { label: "กำหนดขนาดการสุ่มต่อรอบ", icon: Sliders },
        { label: "กดสุ่มเดี่ยวหรือสุ่มออโต้", icon: Play },
        { label: "ดูผลลัพธ์สะสมลู่เข้าหาทฤษฎี", icon: Target },
        { label: "บันทึกข้อมูลการทดลอง", icon: ClipboardList },
      ]}
      learningGoals={[
        "เปรียบเทียบความน่าจะเป็นเชิงทฤษฎีกับค่าความถี่สัมพัทธ์ที่วัดได้จริง",
        "ทำความเข้าใจกฎจำนวนมาก (Law of Large Numbers) ผ่านการจำลองสุ่มขนาดใหญ่",
        "สังเกตพฤติกรรมความผันผวนของความถี่เมื่อจำนวนครั้งในการสุ่มมีค่าน้อย",
        "ฝึกคำนวณอัตราส่วนและแจกแจงค่าความน่าจะเป็นของตัวแปรสุ่มอย่างง่าย",
      ]}
      progressLabel="อัตราออกหัวสะสมเบี่ยงเบนจาก 50% (ต้องการคลาดเคลื่อนไม่เกิน 2%)"
      progressValue={
        totalTrials >= 100
          ? `${(((trialType === "Coin" ? coinHeads : diceCounts[5]) / totalTrials) * 100).toFixed(1)}%`
          : "ต้องการผลสุ่มสะสมอย่างน้อย 100 ครั้ง"
      }
      progressPercent={Math.min(100, (totalTrials / 100) * 100)}
      tips={[
        "ภารกิจ: สุ่มเหรียญให้ได้จำนวนสะสมอย่างน้อย 100 ครั้ง และมีอัตราออกหัวอยู่ระหว่าง 48% – 52% เพื่อบรรลุเป้าหมายการประเมิน",
        "ค่อย ๆ สังเกตความผันผวนของกราฟเมื่อสุ่มไปทีละ 1 ครั้ง เทียบกับการรัน 100 ครั้งพร้อมกัน",
        "เมื่อจำนวนการทดลองมากขึ้น ค่าเปอร์เซ็นต์สะสมจะลู่เข้าหาจุดทฤษฎีเสมอ",
      ]}
      onSave={handleSaveResults}
    />
  );
}
