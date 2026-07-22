"use client";

import React, { useState, useEffect, useRef } from "react";
import SharedSimulationShell from "./SharedSimulationShell";
import {
  Info,
  RefreshCw,
  Radio,
  Settings,
} from "lucide-react";
import { labsById } from "@/data/labs";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

const samples = [
  {
    id: "ethanol",
    name: "เอทานอล (Ethanol - CH3CH2OH)",
    peaks: [
      { ppm: 1.2, height: 60, label: "-CH3", multiplicity: "Triplet" },
      { ppm: 2.6, height: 20, label: "-OH", multiplicity: "Singlet" },
      { ppm: 3.7, height: 40, label: "-CH2-", multiplicity: "Quartet" },
    ]
  },
  {
    id: "acetone",
    name: "อะซิโตน (Acetone - (CH3)2CO)",
    peaks: [
      { ppm: 2.1, height: 90, label: "-CH3", multiplicity: "Singlet" },
    ]
  },
  {
    id: "ethyl-acetate",
    name: "เอทิลอะซีเตต (Ethyl Acetate)",
    peaks: [
      { ppm: 1.2, height: 60, label: "-CH3 (ester)", multiplicity: "Triplet" },
      { ppm: 2.0, height: 60, label: "-CH3 (acetyl)", multiplicity: "Singlet" },
      { ppm: 4.1, height: 40, label: "-CH2-", multiplicity: "Quartet" },
    ]
  }
];

export default function NmrSpectroscopySimulation() {
  const labId = "nmr-spectroscopy";
  const labData = labsById[labId];

  const [selectedSample, setSelectedSample] = useState(samples[0]);
  const [magneticField, setMagneticField] = useState(4.7); // Tesla (Resonates at 200MHz for 1H)
  const [isPulsing, setIsPulsing] = useState(false);
  const [hasSpectrum, setHasSpectrum] = useState(false);
  const [pulseProgress, setPulseProgress] = useState(0);
  const [, setIsSaving] = useState(false);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const handlePulse = () => {
    if (isPulsing) return;
    setIsPulsing(true);
    setPulseProgress(0);
    setHasSpectrum(false);
  };

  const handleReset = () => {
    setIsPulsing(false);
    setPulseProgress(0);
    setHasSpectrum(false);
  };

  const animate = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;

    if (isPulsing && pulseProgress < 100) {
      setPulseProgress(prev => {
        const next = prev + 2.5;
        if (next >= 100) {
          setIsPulsing(false);
          setHasSpectrum(true);
          return 100;
        }
        return next;
      });
    }

    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- RAF pulse loop intentionally uses the current animation closure.
  }, [isPulsing, pulseProgress]);

  const handleSaveResult = async () => {
    if (!hasSpectrum) {
      window.alert("กรุณายิงสัญญาณ RF เพื่อวัดโครงสร้างก่อนบันทึกผล");
      return;
    }

    setIsSaving(true);
    try {
      const records = selectedSample.peaks.map(p => ({
        sample: selectedSample.name,
        ppm: p.ppm,
        height: p.height,
        label: p.label,
        multiplicity: p.multiplicity,
        tesla: magneticField,
        mhz: Math.round(magneticField * 42.57),
      }));

      await saveExperimentAndSync({
        localStorageKey: "scisiam_saved_nmr_spectroscopy_experiment",
        localPayload: {
          labId,
          timestamp: new Date().toISOString(),
          records,
        },
        labId,
        title: "สเปกโทรสโกปีเอ็นเอ็มอาร์",
        variables: { magneticFieldTesla: magneticField },
        liveValues: {
          sampleId: selectedSample.id,
          resonanceFrequencyMhz: Math.round(magneticField * 42.57),
        },
        graphPoints: selectedSample.peaks.map(p => ({
          x: p.ppm,
          y: p.height,
        })),
        tableRows: records,
        summary: {
          sampleTested: selectedSample.name,
          peakCount: selectedSample.peaks.length,
        },
        durationSeconds: 45,
      });
      window.alert("บันทึกผลสเปกตรัม NMR สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const getMetricDisplay = () => {
    const freqMhz = Math.round(magneticField * 42.57); // gyromagnetic ratio of 1H is ~42.57 MHz/T
    return [
      { label: "ความแรงสนามแม่เหล็ก (B0)", value: `${magneticField.toFixed(1)} Tesla` },
      { label: "ความถี่เรโซแนนซ์ (1H)", value: `${freqMhz} MHz` },
      { label: "นิวเคลียสที่วัดสปิน", value: "1H (Proton)" },
    ];
  };

  // Generate SVG lines for NMR spectra
  const renderSpectrumLines = () => {
    if (!hasSpectrum) return null;

    // Convert ppm (10 to 0) to X coordinates (30 to 270)
    const getX = (ppm: number) => 270 - (ppm / 10) * 240;

    return selectedSample.peaks.map((peak, idx) => {
      const x = getX(peak.ppm);
      const h = peak.height * 1.2;

      // Draw triplet/quartet splitting lines
      const lines = [];
      const numLines = peak.multiplicity === "Singlet" ? 1 :
                       peak.multiplicity === "Doublet" ? 2 :
                       peak.multiplicity === "Triplet" ? 3 : 4;

      const spacing = 4;
      const startX = x - ((numLines - 1) * spacing) / 2;

      for (let i = 0; i < numLines; i++) {
        // Binomial coefficient heights (Pascal's Triangle approximation)
        let ratio = 1;
        if (numLines === 3) ratio = i === 1 ? 2 : 1;
        if (numLines === 4) ratio = (i === 1 || i === 2) ? 3 : 1;

        const lineH = h * (ratio / Math.max(...(numLines === 3 ? [1,2,1] : numLines === 4 ? [1,3,3,1] : [1])));
        const curX = startX + i * spacing;

        lines.push(
          <line
            key={i}
            x1={curX}
            y1="220"
            x2={curX}
            y2={220 - lineH}
            stroke="#ef4444"
            strokeWidth="2"
          />
        );
      }

      return (
        <g key={idx}>
          {lines}
          <text x={x} y={220 - h - 8} className="text-[9px] fill-slate-500 font-bold text-center" textAnchor="middle">
            {peak.label} ({peak.multiplicity})
          </text>
        </g>
      );
    });
  };

  return (
    <SharedSimulationShell
      accent="cyan"
      labId={labId}
      category={labData?.category || "Chemistry"}
      title={labData?.thaiTitle || labData?.title || "สเปกโทรสโกปีเอ็นเอ็มอาร์"}
      subtitle={labData?.description || ""}
      statusLabel="พร้อมใช้งาน"
      icon={Radio}
      sceneTitle="เครื่องตรวจวัดสเปกตรัม NMR"
      scene={
        <div className="relative flex min-h-[340px] h-full w-full flex-col items-center justify-center bg-[linear-gradient(145deg,#ecfeff,#f8fafc_55%,#eff6ff)] p-4">
          <svg viewBox="0 0 360 300" className="h-auto w-full max-w-md" role="img" aria-label="เครื่อง NMR แสดงแม่เหล็ก ตัวอย่าง ขดลวด RF และแนวสปินของโปรตอน">
            <title>เครื่องตรวจวัดสเปกตรัม NMR</title>
            <desc>หลอดตัวอย่างอยู่กึ่งกลางแม่เหล็กสนามสูง ขดลวดส่งพัลส์วิทยุทำให้สปินโปรตอนตอบสนองและเกิดสเปกตรัม</desc>
            {/* NMR Magnet body */}
            <rect x="100" y="60" width="160" height="180" fill="#475569" rx="18" />
            <rect x="115" y="75" width="130" height="150" fill="#94a3b8" rx="10" />

            {/* Superconducting coils */}
            {[100, 120, 180, 200].map((y) => <line key={y} x1="115" y1={y} x2="245" y2={y} stroke="#f1f5f9" strokeWidth="4" strokeDasharray="3 3" />)}

            {/* Liquid Nitrogen Cooling level */}
            <rect x="120" y="80" width="25" height="140" fill="#bae6fd" opacity="0.45" />
            <rect x="215" y="80" width="25" height="140" fill="#bae6fd" opacity="0.45" />

            {/* NMR Tube insertion sleeve */}
            <rect x="170" y="20" width="20" height="220" fill="#1e293b" opacity="0.9" />

            {/* Glass NMR Tube */}
            <rect x="176" y="30" width="8" height="190" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" opacity="0.8" />
            {/* Sample liquid inside tube */}
            <rect x="177" y="110" width="6" height="70" fill="#22d3ee" opacity="0.8" />

            {/* RF coils at the center */}
            <circle cx="180" cy="145" r="18" fill="none" stroke="#eab308" strokeWidth="3" strokeDasharray="4 2" />
            {[[162, 128], [180, 130], [198, 128], [170, 158], [190, 158]].map(([x, y], index) => (
              <g key={index} transform={`translate(${x} ${y}) rotate(${isPulsing ? 90 : index % 2 === 0 ? -20 : 20})`}>
                <circle r="5" fill="#ffffff" stroke="#0891b2" strokeWidth="2" />
                <line y1="-5" y2="-16" stroke="#0e7490" strokeWidth="2" strokeLinecap="round" />
              </g>
            ))}
            <text x="38" y="93" fill="#0e7490" fontSize="13" fontWeight="900">B₀ {magneticField.toFixed(1)} T</text>
            <text x="38" y="112" fill="#64748b" fontSize="11" fontWeight="700">สนามแม่เหล็กหลัก</text>
            <text x="274" y="142" fill="#a16207" fontSize="13" fontWeight="900">RF pulse</text>
            <text x="274" y="160" fill="#64748b" fontSize="11" fontWeight="700">กระตุ้นสปิน ¹H</text>

            {/* RF Pulsing wave circles */}
            {isPulsing && (
              <g transform="translate(180, 145)">
                <circle cx="0" cy="0" r={pulseProgress * 0.4} fill="none" stroke="#ef4444" strokeWidth="2" opacity={1 - pulseProgress / 100} />
                <circle cx="0" cy="0" r={Math.max(0, pulseProgress * 0.4 - 20)} fill="none" stroke="#f97316" strokeWidth="1.5" opacity={1 - pulseProgress / 100} />
              </g>
            )}
          </svg>

          {/* Real-time spectrum readout graph at the bottom */}
          <div className="w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 h-28 relative">
            <span className="absolute left-2 top-1 text-[9px] font-bold text-slate-400">1H-NMR Spectrum</span>
            {hasSpectrum ? (
              <svg className="w-full h-full" viewBox="0 0 300 100">
                {/* Baseline */}
                <line x1="30" y1="80" x2="270" y2="80" stroke="#94a3b8" strokeWidth="1.5" />

                {/* NMR Spectrum Line */}
                <path
                  d={`M 30 80
                      ${selectedSample.peaks.map(p => {
                        const getX = (ppm: number) => 270 - (ppm / 10) * 240;
                        const rx = getX(p.ppm);
                        const h = p.height * 0.7;
                        return `L ${rx - 4} 80 Q ${rx} ${80 - h} ${rx + 4} 80`;
                      }).join(" ")}
                      L 270 80`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />

                {/* Splitting peaks indicators */}
                {renderSpectrumLines()}

                {/* X Axis Labels */}
                <text x="30" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">10 ppm</text>
                <text x="90" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">7.5</text>
                <text x="150" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">5.0</text>
                <text x="210" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">2.5</text>
                <text x="270" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">0 ppm</text>
              </svg>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic">
                {isPulsing ? "กำลังส่งคลื่นความถี่วิทยุ..." : "กด Pulse RF เพื่อแสดงสเปกตรัม"}
              </div>
            )}
          </div>
        </div>
      }
      controlsTitle="ตั้งค่าสารตัวอย่างและสนามแม่เหล็ก"
      controls={
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">เลือกสารตัวอย่าง</label>
            <div className="grid grid-cols-1 gap-1.5">
              {samples.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSample(s);
                    handleReset();
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-all ${
                    selectedSample.id === s.id
                      ? "bg-cyan-50 border-cyan-300 text-cyan-700 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-300 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-350 hover:bg-slate-50"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          <div>
            <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>กำลังสนามแม่เหล็ก (B0)</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">{magneticField.toFixed(1)} Tesla</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="7.0"
              step="0.5"
              value={magneticField}
              onChange={(e) => {
                setMagneticField(parseFloat(e.target.value));
                handleReset();
              }}
              className="w-full accent-cyan-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1.0 T (~42 MHz)</span>
              <span>4.7 T (~200 MHz)</span>
              <span>7.0 T (~300 MHz)</span>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={handlePulse}
              disabled={isPulsing}
              className="flex-1 py-2 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              ส่งสัญญาณ RF (Pulse)
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
                <th className="p-3">สารตัวอย่าง</th>
                <th className="p-3">Chemical Shift (ppm)</th>
                <th className="p-3">สัญลักษณ์กลุ่มโครงสร้าง</th>
                <th className="p-3">รูปแบบพีค (Splitting)</th>
                <th className="p-3">ความเข้มสัมพัทธ์</th>
              </tr>
            </thead>
            <tbody>
              {selectedSample.peaks.map((p, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{idx === 0 ? selectedSample.name.split(" (")[0] : ""}</td>
                  <td className="p-3 font-bold text-cyan-600 dark:text-cyan-400">{p.ppm.toFixed(2)}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{p.label}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{p.multiplicity}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{p.height / 10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      theory={
        <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>
            <strong>Nuclear Magnetic Resonance (NMR) Spectroscopy</strong> เป็นเครื่องมือที่ใช้ยืนยันโครงสร้างสารอินทรีย์
            โดยการตรวจวัดระดับพลังงานที่เปลี่ยนไปของสปินนิวเคลียส (เช่น <sup>1</sup>H) ภายใต้สนามแม่เหล็กแรงสูง เมื่อได้รับคลื่นวิทยุ (Radio Frequency)
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Chemical Shift ($\delta$ ใน ppm)</strong>: แสดงสภาพแวดล้อมทางเคมีและผลกระทบของอิเล็กตรอนรอบข้าง (Shielding/Deshielding Effect)</li>
            <li><strong>Spin-Spin Splitting (N+1 Rule)</strong>: พีคเดี่ยวจะถูกสปลิตออกตามจำนวนโปรตอนข้างเคียงที่เกิดคัปปลิง ทำให้สามารถอ่านเรียงลำดับการเชื่อมต่อของคาร์บอนสายโซ่ได้</li>
          </ul>
        </div>
      }
      steps={[
        { label: "เลือกสารตัวอย่างที่ต้องการวิเคราะห์โครงสร้างเคมี", icon: Settings },
        { label: "ปรับความแรงของสนามแม่เหล็กภายนอก B0 ในแผงควบคุม", icon: Settings },
        { label: "กดปุ่ม 'ส่งสัญญาณ RF (Pulse)' เพื่อกระตุ้นนิวเคลียส", icon: Radio },
        { label: "วิเคราะห์สเปกตรัมที่แสดงออกมาและบันทึกผลการทดสอบลงระบบ", icon: Info },
      ]}
      learningGoals={[
        "ทำความเข้าใจผลของ Chemical Shift และการเหนี่ยวนำขั้วแม่เหล็กของโปรตอนแต่ละประเภท",
        "ศึกษาผลกระทบของการสปลิตพีคตามกฎ N+1 จากจำนวนโปรตอนข้างเคียง",
        "วิเคราะห์หาโครงสร้างโมเลกุลสารผสมจากรูปพีคสเปกตรัม NMR",
      ]}
      progressLabel="ระดับการวิเคราะห์สาร"
      progressValue={hasSpectrum ? "1 / 1" : "0 / 1"}
      progressPercent={hasSpectrum ? 100 : 0}
      tips={[
        " gyromagnetic ratio ของโปรตอนอยู่ที่ประมาณ 42.57 MHz ต่อ Tesla ดังนั้น ยิ่งใช้สนามแม่เหล็กแรงสูง พีคสเปกตรัมจะยิ่งแยกชัดเจนขึ้น",
        "สารละลายมาตรฐานที่ใช้เป็นศูนย์ในการหา Chemical Shift คือ Tetramethylsilane (TMS) ที่ 0 ppm",
      ]}
      showLiveMetrics={true}
      showInfoTabs={true}
      showSaveButton={true}
      onRun={handlePulse}
      runLabel={isPulsing ? "กำลังส่งพัลส์" : "เริ่มทดลอง"}
      runActive={isPulsing}
      runDisabled={isPulsing}
      onReset={handleReset}
      onSave={handleSaveResult}
    />
  );
}
