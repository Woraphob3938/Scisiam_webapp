"use client";

import React, { useState, useEffect, useRef } from "react";
import SharedSimulationShell from "./SharedSimulationShell";
import {
  Info,
  Play,
  RefreshCw,
  Layers,
  Sliders,
} from "lucide-react";
import { labsById } from "@/data/labs";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

const mixtures = [
  {
    id: "painkillers",
    name: "ยาลดไข้-แก้ปวด (Paracetamol + Caffeine + Aspirin)",
    peaks: [
      { name: "พาราเซตามอล (Paracetamol)", baseRetentionTime: 2.0, height: 75 },
      { name: "คาเฟอีน (Caffeine)", baseRetentionTime: 3.5, height: 90 },
      { name: "แอสไพริน (Aspirin)", baseRetentionTime: 5.5, height: 50 },
    ]
  },
  {
    id: "dye-colors",
    name: "สีย้อมและสีผสมอาหาร (Food Dyes)",
    peaks: [
      { name: "Tartrazine (Yellow 5)", baseRetentionTime: 2.5, height: 60 },
      { name: "Sunset Yellow (Yellow 6)", baseRetentionTime: 4.0, height: 80 },
      { name: "Allura Red (Red 40)", baseRetentionTime: 6.0, height: 70 },
    ]
  }
];

export default function HplcChromatographySimulation() {
  const labId = "hplc-chromatography";
  const labData = labsById[labId];

  const [selectedMixture, setSelectedMixture] = useState(mixtures[0]);
  const [solventPercent, setSolventPercent] = useState(40); // % Acetonitrile (20 - 80)
  const [flowRate, setFlowRate] = useState(1.0); // mL/min (0.5 - 2.0)
  const [isInjecting, setIsInjecting] = useState(false);
  const [time, setTime] = useState(0); // simulation minutes
  const [chromatogramData, setChromatogramData] = useState<{ t: number; abs: number }[]>([]);
  const [, setIsSaving] = useState(false);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const timeRef = useRef(time);

  const handleInject = () => {
    if (isInjecting) return;
    setIsInjecting(true);
    timeRef.current = 0;
    setTime(0);
    setChromatogramData([]);
  };

  const handleReset = () => {
    setIsInjecting(false);
    timeRef.current = 0;
    setTime(0);
    setChromatogramData([]);
  };

  // Peak retention factor depends on solvent percent: higher ACN % washes things out faster
  const getRetentionTime = (baseTime: number) => {
    // Inverse exponential-like dependence on organic solvent modifier
    const factor = Math.exp(-(solventPercent - 40) / 40);
    // Flow rate speedup factor: higher flow = faster retention time
    const flowFactor = 1.0 / flowRate;
    return baseTime * factor * flowFactor;
  };

  // Absorbance value at a specific time (sum of Gaussian peaks)
  const getAbsorbance = (t: number) => {
    let sum = 0;
    selectedMixture.peaks.forEach(peak => {
      const rt = getRetentionTime(peak.baseRetentionTime);
      const width = 0.15 * rt; // peak width spreads as time increases (diffusion)

      // Gaussian shape: height * exp( - (t - rt)^2 / (2 * w^2) )
      const val = peak.height * Math.exp(-Math.pow(t - rt, 2) / (2 * Math.pow(width, 2)));
      if (val > 0.01) sum += val;
    });

    // Add baseline noise
    sum += Math.random() * 1.5;
    return sum;
  };

  const maxSimTime = Math.max(...selectedMixture.peaks.map(p => getRetentionTime(p.baseRetentionTime))) * 1.35;

  const animate = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = (timestamp - lastTimeRef.current) / 1000; // actual elapsed seconds
    lastTimeRef.current = timestamp;

    if (isInjecting && timeRef.current < maxSimTime) {
      // Scale simulation speed (1 real second = 0.5 chromatography minutes)
      const newTime = timeRef.current + delta * 0.45;
      timeRef.current = newTime;

      // Add data points
      const absVal = getAbsorbance(newTime);
      setChromatogramData(prev => [...prev, { t: newTime, abs: absVal }]);
      setTime(newTime);

      if (newTime >= maxSimTime) {
        setIsInjecting(false);
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- RAF loop intentionally uses the current chromatogram animation closure.
  }, [isInjecting]);

  const handleSaveResult = async () => {
    if (chromatogramData.length === 0) {
      window.alert("กรุณาฉีดตัวอย่างเพื่อรันโครมาโทแกรมก่อนส่งผล");
      return;
    }

    setIsSaving(true);
    try {
      const detectedPeaks = selectedMixture.peaks.map(p => ({
        mixture: selectedMixture.name,
        component: p.name,
        retentionTimeMin: getRetentionTime(p.baseRetentionTime),
        heightAbs: p.height,
        solventRatio: `${solventPercent}% Acetonitrile / ${100 - solventPercent}% Water`,
      }));

      await saveExperimentAndSync({
        localStorageKey: "scisiam_saved_hplc_chromatography_experiment",
        localPayload: {
          labId,
          timestamp: new Date().toISOString(),
          detectedPeaks,
        },
        labId,
        title: "โครมาโทกราฟีเอชพีแอลซี",
        variables: { solventPercentAcetonitrile: solventPercent, flowRateMlMin: flowRate },
        liveValues: {
          mixtureId: selectedMixture.id,
          pressureBar: Math.round(flowRate * 120 * (1 + (100 - solventPercent) / 100)),
        },
        graphPoints: chromatogramData.map(d => ({
          x: d.t,
          y: d.abs,
        })),
        tableRows: detectedPeaks,
        summary: {
          mixtureTested: selectedMixture.name,
          pressureBar: Math.round(flowRate * 120 * (1 + (100 - solventPercent) / 100)),
        },
        durationSeconds: Math.round(maxSimTime * 60),
      });
      window.alert("บันทึกโครมาโทแกรม HPLC สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const currentPressure = Math.round(flowRate * 120 * (1 + (100 - solventPercent) / 100));

  const getMetricDisplay = () => [
    { label: "ความดันคอลัมน์ (Pressure)", value: `${currentPressure} bar` },
    { label: "อัตราการไหล (Flow Rate)", value: `${flowRate.toFixed(2)} mL/min` },
    { label: "ตัวทำละลายอินทรีย์", value: `${solventPercent}% Acetonitrile` },
  ];

  // Visual position of sample bands traveling through HPLC column
  const renderColumnBands = () => {
    if (!isInjecting && chromatogramData.length === 0) return null;

    // Column range: X starts at 105, ends at 195 (width 90)
    // Travel speed corresponds to retention times
    return selectedMixture.peaks.map((p, idx) => {
      const rt = getRetentionTime(p.baseRetentionTime);
      // normalized position of this band (0 at inject, 1 at elute/detector)
      const fraction = Math.min(time / rt, 1.05);

      if (fraction >= 1.05) return null; // already eluted/detected

      const bandX = 105 + fraction * 90;

      const colors = ["#ef4444", "#3b82f6", "#eab308"];

      return (
        <g key={idx}>
          <ellipse
            cx={bandX}
            cy="150"
            rx={Math.max(2, fraction * 5)}
            ry="6"
            fill={colors[idx % colors.length]}
            opacity={0.8 - fraction * 0.2}
          />
        </g>
      );
    });
  };

  return (
    <SharedSimulationShell
      accent="emerald"
      labId={labId}
      category={labData?.category || "Chemistry"}
      title={labData?.thaiTitle || labData?.title || "โครมาโทกราฟีเอชพีแอลซี"}
      subtitle={labData?.description || ""}
      statusLabel="พร้อมใช้งาน"
      icon={Layers}
      sceneTitle="แผนภาพเส้นทางระบบ HPLC"
      scene={
        <div className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 min-h-[340px] relative w-full h-full">
          <svg viewBox="0 0 300 300" className="w-full max-w-sm h-auto drop-shadow-md">
            {/* Solvent Bottles */}
            <rect x="25" y="30" width="30" height="45" fill="#e2e8f0" rx="3" stroke="#94a3b8" />
            <text x="40" y="55" className="text-[7px] fill-slate-500 font-bold" textAnchor="middle">H2O</text>

            <rect x="65" y="30" width="30" height="45" fill="#bae6fd" rx="3" stroke="#38bdf8" />
            <text x="80" y="55" className="text-[7px] fill-slate-500 font-bold" textAnchor="middle">ACN</text>

            {/* Tube paths */}
            <path d="M 40 75 L 40 90 L 80 90 L 80 110" stroke="#cbd5e1" strokeWidth="2" fill="none" />
            <path d="M 80 75 L 80 110" stroke="#cbd5e1" strokeWidth="2" fill="none" />

            {/* High Pressure Pump */}
            <rect x="60" y="110" width="40" height="25" fill="#475569" rx="2" />
            <circle cx="80" cy="122" r="6" fill="#1e293b" className={isInjecting ? "animate-spin-slow" : ""} />

            {/* Autosampler/Injector */}
            <circle cx="80" cy="150" r="10" fill="#f97316" />
            <path d="M 80 135 L 80 150" stroke="#cbd5e1" strokeWidth="2" />

            {/* HPLC Column (C18 Stationary Phase) */}
            <rect x="105" y="142" width="90" height="16" fill="#334155" rx="2" />
            <rect x="110" y="144" width="80" height="12" fill="#1e293b" />

            {/* Travelling sample bands inside column */}
            {renderColumnBands()}

            {/* UV Detector flow cell */}
            <rect x="210" y="140" width="20" height="20" fill="#475569" />
            <circle cx="220" cy="150" r="4" fill="#a855f7" opacity="0.8" className={isInjecting ? "animate-pulse" : ""} />

            {/* Outflow line to waste */}
            <path d="M 230 150 L 250 150 L 250 180" stroke="#cbd5e1" strokeWidth="2" fill="none" />
            <rect x="240" y="180" width="20" height="30" fill="#64748b" rx="2" />

            {/* Labels */}
            <text x="80" y="105" className="text-[6px] fill-slate-400 font-bold" textAnchor="middle">PUMP</text>
            <text x="150" y="137" className="text-[6px] fill-slate-400 font-bold" textAnchor="middle">COLUMN (C18)</text>
            <text x="220" y="135" className="text-[6px] fill-slate-400 font-bold" textAnchor="middle">DETECTOR</text>
          </svg>

          {/* Chromatogram graph display at bottom */}
          <div className="w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 h-28 relative">
            <span className="absolute left-2 top-1 text-[9px] font-bold text-slate-400">UV Absorbance (Chromatogram)</span>
            <div className="w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 300 100">
                {/* Baseline */}
                <line x1="30" y1="80" x2="270" y2="80" stroke="#94a3b8" strokeWidth="1.5" />

                {/* Curve path */}
                {chromatogramData.length > 1 && (
                  <path
                    d={`M ${30 + (chromatogramData[0].t / maxSimTime) * 240} ${80 - chromatogramData[0].abs * 0.65}
                        ${chromatogramData.map(d => {
                          const rx = 30 + (d.t / maxSimTime) * 240;
                          const ry = 80 - d.abs * 0.65;
                          return `L ${rx} ${ry}`;
                        }).join(" ")}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                )}

                {/* X Axis Labels */}
                <text x="30" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">0.0 min</text>
                <text x="90" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">{(maxSimTime * 0.25).toFixed(1)}</text>
                <text x="150" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">{(maxSimTime * 0.5).toFixed(1)}</text>
                <text x="210" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">{(maxSimTime * 0.75).toFixed(1)}</text>
                <text x="270" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">{maxSimTime.toFixed(1)} min</text>
              </svg>
            </div>
          </div>
        </div>
      }
      controlsTitle="ตั้งค่า Solvent และ อัตราการชะสาร"
      controls={
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">เลือกสารตัวอย่างผสม</label>
            <div className="grid grid-cols-1 gap-1.5">
              {mixtures.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMixture(m);
                    handleReset();
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-all ${
                    selectedMixture.id === m.id
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-350 hover:bg-slate-50"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          <div>
            <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>สัดส่วน Acetonitrile (%)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{solventPercent} %</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="5"
              value={solventPercent}
              onChange={(e) => {
                setSolventPercent(parseInt(e.target.value));
                handleReset();
              }}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>20% (ขั้วสูง-สารชะช้า)</span>
              <span>80% (ขั้วต่ำ-สารชะไวมาก)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>อัตราการไหลคอลัมน์ (Flow Rate)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{flowRate.toFixed(2)} mL/min</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={flowRate}
              onChange={(e) => {
                setFlowRate(parseFloat(e.target.value));
                handleReset();
              }}
              className="w-full accent-emerald-600"
            />
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={handleInject}
              disabled={isInjecting}
              className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-4 h-4" />
              ฉีดสารละลาย (Inject)
            </button>
            <button
              onClick={handleReset}
              className="py-2 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      }
      metrics={getMetricDisplay()}
      graph={null}
      table={
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="p-3">สารส่วนประกอบ</th>
                <th className="p-3">เวลากักเก็บจริง (RT - min)</th>
                <th className="p-3">ความสูง Absorbance (mAU)</th>
                <th className="p-3">ความดัน (bar)</th>
              </tr>
            </thead>
            <tbody>
              {selectedMixture.peaks.map((p, idx) => {
                const rt = getRetentionTime(p.baseRetentionTime);
                return (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{p.name}</td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{rt.toFixed(3)} นาที</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{p.height} mAU</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{currentPressure} bar</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      }
      theory={
        <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>
            <strong>High-Performance Liquid Chromatography (HPLC)</strong> เป็นเครื่องมือที่ใช้แยก วิเคราะห์ และวัดปริมาณสารผสมในของเหลว
            โดยการผลักตัวทำละลาย (Mobile Phase) ด้วยความดันสูงผ่านคอลัมน์บรรจุสารขัดตัวคัดขนาด (Stationary Phase)
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>กลไก Reversed-Phase HPLC</strong>: คอลัมน์ที่นิยมใช้คือ C18 (Stationary phase ไม่มีขั้ว) ดังนั้นสารที่มีขั้วสูงจะเดินทางออกมาก่อน (Retention Time สั้น) สารที่ไม่มีขั้วจะชะช้า (Retention Time ยาว)</li>
            <li><strong>อิทธิพลของ Solvent</strong>: เมื่อเพิ่มระดับ Acetonitrile (ตัวทำละลายไม่มีขั้ว) จะช่วยให้ชะช้าง่ายขึ้น ส่งผลให้สารทุกชนิดหลุดออกจากคอลัมน์เร็วขึ้น</li>
          </ul>
        </div>
      }
      steps={[
        { label: "เลือกประเภทตัวอย่างผสมที่จะฉีดเข้าระบบเพื่อวิเคราะห์", icon: Sliders },
        { label: "กำหนดความเข้มข้นของสารละลาย Acetonitrile และ อัตราการไหล", icon: Sliders },
        { label: "กดปุ่ม 'ฉีดสารละลาย (Inject)' เพื่อเปิดการปั๊มสารเข้าระบบ", icon: Play },
        { label: "สังเกตแถบสีของสารที่แยกใน C18 คอลัมน์ และวัดโครมาโทแกรม", icon: Info },
      ]}
      learningGoals={[
        "เรียนรู้หลักการทำงานและทฤษฎีการแยกสารผสมเชิงปริมาณแบบ Reversed-Phase",
        "ศึกษาผลกระทบของสัดส่วนตัวทำละลาย (Organic Modifier %) ต่อเวลากักเก็บสาร (Retention Time)",
        "ทำความเข้าใจผลของอัตราการไหล (Flow Rate) ต่อแรงดันและรูปร่างพีคสเปกตรัม",
      ]}
      progressLabel="ระดับการวิเคราะห์ HPLC"
      progressValue={time >= maxSimTime ? "1 / 1" : "0 / 1"}
      progressPercent={time >= maxSimTime ? 100 : 0}
      tips={[
        "ความดันที่ระบบได้รับจะเพิ่มขึ้นตามความเร็วอัตราการไหล (Flow Rate) และตามปริมาณน้ำในสัดส่วน เนื่องจากน้ำมีความหนืดสูงกว่า Acetonitrile",
        "ความสม่ำเสมอของพีคในโครมาโทแกรมช่วยให้วิเคราะห์เปรียบเทียบคุณภาพของสารผสมได้อย่างมีเสถียรภาพ",
      ]}
      showLiveMetrics={true}
      showInfoTabs={true}
      showSaveButton={true}
      onSave={handleSaveResult}
    />
  );
}
