"use client";

import React, { useState, useEffect, useRef } from "react";
import SharedSimulationShell from "./SharedSimulationShell";
import {
  Info,
  RefreshCw,
  Zap,
  Sliders,
} from "lucide-react";
import { labsById } from "@/data/labs";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

const samples = [
  {
    id: "carbon",
    name: "ฟิล์มคาร์บอน (Carbonaceous Film)",
    peaks: [
      { bindingEnergy: 285.0, height: 80, label: "C 1s (C-C / C-H)" },
      { bindingEnergy: 286.5, height: 35, label: "C 1s (C-O)" },
      { bindingEnergy: 288.0, height: 15, label: "C 1s (C=O)" },
    ]
  },
  {
    id: "silicon",
    name: "ซิลิคอนเวเฟอร์ (Silicon Wafer with Oxide)",
    peaks: [
      { bindingEnergy: 99.2, height: 75, label: "Si 2p (Metallic Silicon)" },
      { bindingEnergy: 103.3, height: 45, label: "Si 2p (Silicon Dioxide - SiO2)" },
    ]
  },
  {
    id: "gold",
    name: "ทองคำเปลว (Gold Leaf Standard)",
    peaks: [
      { bindingEnergy: 84.0, height: 90, label: "Au 4f 7/2" },
      { bindingEnergy: 87.7, height: 65, label: "Au 4f 5/2" },
    ]
  }
];

export default function XpsSpectroscopySimulation() {
  const labId = "xps-spectroscopy";
  const labData = labsById[labId];

  const [selectedSample, setSelectedSample] = useState(samples[0]);
  const [xrayPower, setXrayPower] = useState(150); // Watts (50 - 300)
  const [isEmitting, setIsEmitting] = useState(false);
  const [hasSpectrum, setHasSpectrum] = useState(false);
  const [beamProgress, setBeamProgress] = useState(0);
  const [, setIsSaving] = useState(false);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const handleEmit = () => {
    if (isEmitting) return;
    setIsEmitting(true);
    setBeamProgress(0);
    setHasSpectrum(false);
  };

  const handleReset = () => {
    setIsEmitting(false);
    setBeamProgress(0);
    setHasSpectrum(false);
  };

  const animate = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;

    if (isEmitting && beamProgress < 100) {
      setBeamProgress(prev => {
        const next = prev + 3;
        if (next >= 100) {
          setIsEmitting(false);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- RAF beam loop intentionally uses the current animation closure.
  }, [isEmitting, beamProgress]);

  const handleSaveResult = async () => {
    if (!hasSpectrum) {
      window.alert("กรุณาฉายรังสีเอกซ์เพื่อวิเคราะห์พื้นผิวก่อนบันทึกผล");
      return;
    }

    setIsSaving(true);
    try {
      const records = selectedSample.peaks.map(p => ({
        sample: selectedSample.name,
        bindingEnergy: p.bindingEnergy,
        intensity: Math.round(p.height * (xrayPower / 150)),
        label: p.label,
        xrayPowerWatts: xrayPower,
      }));

      await saveExperimentAndSync({
        localStorageKey: "scisiam_saved_xps_spectroscopy_experiment",
        localPayload: {
          labId,
          timestamp: new Date().toISOString(),
          records,
        },
        labId,
        title: "สเปกโทรสโกปีเอ็กซ์พีเอส",
        variables: { xrayPowerWatts: xrayPower },
        liveValues: {
          sampleId: selectedSample.id,
          maxIntensity: Math.max(...records.map(r => r.intensity)),
        },
        graphPoints: selectedSample.peaks.map(p => ({
          x: p.bindingEnergy,
          y: p.height * (xrayPower / 150),
        })),
        tableRows: records,
        summary: {
          sampleName: selectedSample.name,
          detectedPeaks: selectedSample.peaks.length,
        },
        durationSeconds: 30,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getMetricDisplay = () => [
    { label: "แหล่งกำเนิดแสงเอ็กซ์เรย์", value: "Al Ka (1486.6 eV)" },
    { label: "กำลังไฟฟ้าหลอดรังสี", value: `${xrayPower} Watts` },
    { label: "แรงดันสุญญากาศห้องวัด", value: "1.2 x 10^-9 mbar" },
  ];

  // Render peaks on Binding Energy (BE) graph
  const renderSpectrumPeaks = () => {
    if (!hasSpectrum) return null;

    // Convert Binding Energy to X coordinates (300 to 50 eV -> X range 30 to 270)
    // Formula: x = 30 + ((300 - BE) / 250) * 240
    const getX = (be: number) => 30 + ((300 - be) / 250) * 240;

    return selectedSample.peaks.map((peak, idx) => {
      const x = getX(peak.bindingEnergy);
      const intensity = peak.height * (xrayPower / 150);
      const h = intensity * 0.7;

      return (
        <g key={idx}>
          {/* Peak line */}
          <line x1={x} y1="80" x2={x} y2={80 - h} stroke="#0ea5e9" strokeWidth="2" />
          <circle cx={x} cy={80 - h} r="3" fill="#0284c7" />
          <text x={x} y={80 - h - 6} className="text-[8px] fill-slate-500 font-bold" textAnchor="middle">
            {peak.bindingEnergy.toFixed(1)} eV
          </text>
          <text x={x} y="92" className="text-[7px] fill-slate-400 font-medium" textAnchor="middle">
            {peak.label.split(" ")[0]}
          </text>
        </g>
      );
    });
  };

  return (
    <SharedSimulationShell
      accent="orange"
      labId={labId}
      category={labData?.category || "Chemistry"}
      title={labData?.thaiTitle || labData?.title || "สเปกโทรสโกปีเอ็กซ์พีเอส"}
      subtitle={labData?.description || ""}
      statusLabel="พร้อมใช้งาน"
      icon={Zap}
      sceneTitle="ห้องสูญญากาศวิเคราะห์พื้นผิว (UHV Chamber)"
      scene={
        <div className="relative flex min-h-[340px] h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_center,#1e293b_0%,#0f172a_56%,#020617_100%)] p-4">
          <svg viewBox="0 0 340 270" className="h-auto w-full max-w-md" role="img" aria-label="ห้องสูญญากาศ XPS ที่ยิงรังสีเอกซ์ไปยังผิวตัวอย่างและตรวจอิเล็กตรอนที่หลุดออกมา">
            <title>ระบบวิเคราะห์พื้นผิว XPS</title>
            <desc>แหล่งกำเนิดรังสีเอกซ์ฉายลงบนตัวอย่างในห้องสูญญากาศ อิเล็กตรอนที่หลุดออกถูกส่งไปยังเครื่องวิเคราะห์พลังงาน</desc>
            {/* Outer Chamber (UHV) */}
            <circle cx="170" cy="130" r="90" fill="none" stroke="#94a3b8" strokeWidth="6" />
            <circle cx="170" cy="130" r="86" fill="#1e293b" />

            {/* X-ray Source Gun */}
            <rect x="60" y="40" width="20" height="60" fill="#475569" stroke="#334155" transform="rotate(-45 60 40)" />
            <text x="24" y="34" fill="#c4b5fd" fontSize="11" fontWeight="900">X-ray source</text>
            <text x="24" y="50" fill="#94a3b8" fontSize="9" fontWeight="700">{xrayPower} W</text>

            {/* Electron Analyzer Inlet */}
            <rect x="250" y="40" width="25" height="70" fill="#475569" stroke="#334155" transform="rotate(45 250 40)" />
            <path d="M 200 80 Q 230 50 250 40" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" fill="none" />
            <text x="274" y="34" fill="#7dd3fc" fontSize="11" fontWeight="900">Analyzer</text>

            {/* Sample holder & stage */}
            <rect x="140" y="160" width="60" height="15" fill="#475569" />
            <rect x="165" y="175" width="10" height="40" fill="#64748b" />

            {/* Active Sample substrate */}
            <rect x="150" y="152" width="40" height="8" fill={
              selectedSample.id === "gold" ? "#fbbf24" :
              selectedSample.id === "silicon" ? "#94a3b8" : "#475569"
            } rx="1" />

            {/* X-ray beam beam path */}
            {isEmitting && (
              <line
                x1="100"
                y1="80"
                x2={150 + (beamProgress / 100) * 20}
                y2={120 + (beamProgress / 100) * 35}
                stroke="#a855f7"
                strokeWidth="4"
                strokeDasharray="4 4"
                opacity={0.8}
              />
            )}

            {/* Photoelectron emission balls flying to analyzer */}
            {isEmitting && beamProgress > 60 && (
              <g>
                <circle cx="180" cy="140" r="3" fill="#fbbf24" className="animate-ping" />
                <circle cx="195" cy="110" r="3.5" fill="#38bdf8" />
                <circle cx="210" cy="85" r="4" fill="#38bdf8" />
              </g>
            )}
            <text x="170" y="238" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="800">UHV chamber · วิเคราะห์ชั้นผิวของ {selectedSample.name}</text>
          </svg>

          {/* XPS Spectrum curve readout graph */}
          <div className="w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 h-28 relative">
            <span className="absolute left-2 top-1 text-[9px] font-bold text-slate-400">XPS Core Spectrum (Intensity vs BE)</span>
            {hasSpectrum ? (
              <svg className="w-full h-full" viewBox="0 0 300 100" role="img" aria-label="กราฟสเปกตรัม XPS แสดงความเข้มเทียบกับพลังงานยึดเหนี่ยว">
                <title>สเปกตรัม XPS</title>
                {/* Baseline */}
                <line x1="30" y1="80" x2="270" y2="80" stroke="#94a3b8" strokeWidth="1.5" />

                {/* XPS Plot envelope */}
                <path
                  d={`M 30 80
                      ${selectedSample.peaks.map(p => {
                        const getX = (be: number) => 30 + ((300 - be) / 250) * 240;
                        const rx = getX(p.bindingEnergy);
                        const h = p.height * (xrayPower / 150) * 0.45;
                        return `L ${rx - 8} 80 Q ${rx} ${80 - h} ${rx + 8} 80`;
                      }).join(" ")}
                      L 270 80`}
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="1.5"
                />

                {renderSpectrumPeaks()}

                {/* X Axis Labels (BE decreases to the right) */}
                <text x="30" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">300 eV</text>
                <text x="90" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">237.5</text>
                <text x="150" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">175.0</text>
                <text x="210" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">112.5</text>
                <text x="270" y="92" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">50 eV</text>
              </svg>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic">
                {isEmitting ? "กำลังยิงรังสีเอ็กซ์อนุภาค..." : "กด Emit X-ray เพื่อปล่อยโฟตอนและวัดค่า"}
              </div>
            )}
          </div>
        </div>
      }
      controlsTitle="ควบคุมลำแสงเอ็กซ์เรย์และวัสดุ"
      controls={
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">เลือกสารเป้าหมาย</label>
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
                      ? "bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300 shadow-sm"
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
              <span>กำลังไฟฟ้าของแสงเอ็กซ์เรย์</span>
              <span className="text-orange-600 dark:text-orange-400 font-bold">{xrayPower} Watts</span>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              step="50"
              value={xrayPower}
              onChange={(e) => {
                setXrayPower(parseInt(e.target.value));
                handleReset();
              }}
              className="w-full accent-orange-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>50 W (สัญญาณต่ำ)</span>
              <span>150 W (มาตรฐาน)</span>
              <span>300 W (สัญญาณชัด/สัญญาณรบกวนต่ำ)</span>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={handleEmit}
              disabled={isEmitting}
              className="flex-1 py-2 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Zap className="w-4 h-4 animate-pulse" />
              ฉายรังสีเอกซ์ (Emit)
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
      compactControls={
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="rounded-xl bg-slate-50 p-2 text-xs font-black text-slate-700">
            <span className="mb-1 block">สารเป้าหมาย</span>
            <select aria-label="สารเป้าหมาย" value={selectedSample.id} onChange={(event) => { setSelectedSample(samples.find((sample) => sample.id === event.target.value) ?? samples[0]); handleReset(); }} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-2">
              {samples.map((sample) => <option key={sample.id} value={sample.id}>{sample.name}</option>)}
            </select>
          </label>
          <label className="rounded-xl bg-slate-50 p-2 text-xs font-black text-slate-700">
            <span className="mb-1 flex justify-between"><span>กำลังรังสีเอกซ์</span><span>{xrayPower} W</span></span>
            <input aria-label="กำลังรังสีเอกซ์" disabled={isEmitting} type="range" min="50" max="300" step="50" value={xrayPower} onChange={(event) => { setXrayPower(Number(event.target.value)); handleReset(); }} className="w-full accent-orange-500" />
          </label>
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
                <th className="p-3">Binding Energy (eV)</th>
                <th className="p-3">ระดับอิเล็กตรอนวงโคจร</th>
                <th className="p-3">ความเข้มสัมพัทธ์ (Counts)</th>
              </tr>
            </thead>
            <tbody>
              {selectedSample.peaks.map((p, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{idx === 0 ? selectedSample.name.split(" (")[0] : ""}</td>
                  <td className="p-3 font-bold text-orange-600 dark:text-orange-400">{p.bindingEnergy.toFixed(1)} eV</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{p.label}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{Math.round(p.height * (xrayPower / 150))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      theory={
        <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>
            <strong>X-ray Photoelectron Spectroscopy (XPS)</strong> เป็นเทคนิคการวิเคราะห์สมบัติพื้นผิวขั้นสูง
            โดยใช้ปรากฏการณ์โฟโตอิเล็กทริก (Photoelectric Effect) เพื่อหาธาตุองค์ประกอบและสถานะเคมีบนพื้นผิวของแข็ง
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>สมการพลังงานยึดเหนี่ยว</strong>: $E_b = h\nu - E_k - \phi$ พลังงานของแสงเอ็กซ์เรย์ ($h\nu$) ลบพลังงานจลน์อิเล็กตรอนที่วัดได้ ($E_k$) จะให้ค่าคงที่ยึดเหนี่ยวแกนอะตอม ($E_b$) ของแต่ละชั้นวงโคจร</li>
            <li><strong>Chemical Shift</strong>: เมื่อสถานะออกซิเดชันของธาตุเปลี่ยนไป (เช่น ซิลิคอนโลหะที่ 99 eV เปลี่ยนเป็น $SiO_2$ ที่ 103 eV) พีคจะขยับเลื่อนขึ้นเนื่องจากแรงยึดเหนี่ยวในอะตอมเปลี่ยนแปลงไป</li>
          </ul>
        </div>
      }
      steps={[
        { label: "เลือกวัสดุตัวอย่างที่จะใช้วัดองค์ประกอบพื้นผิว", icon: Sliders },
        { label: "กำหนดกำลังกำลังไฟฟ้า (Watts) ของหลอดส่องเอ็กซ์เรย์", icon: Sliders },
        { label: "กดปุ่ม 'ฉายรังสีเอกซ์ (Emit)' เพื่อปลดปล่อยโฟโตอิเล็กตรอน", icon: Zap },
        { label: "วิเคราะห์พลังงาน Binding Energy แต่ละชั้นของอะตอมในกราฟิก", icon: Info },
      ]}
      learningGoals={[
        "เรียนรู้ทฤษฎีโฟโตอิเล็กทริกและการคำนวณพลังงานยึดเหนี่ยวอิเล็กตรอนชั้นใน",
        "วิเคราะห์สารเคมีองค์ประกอบและสถานะออกซิเดชันจากการเลื่อนตแหน่งพลังงาน Chemical Shift",
        "เข้าใจฟังก์ชันการทำงานของกระบอกวิเคราะห์พลังงานอิเล็กตรอนใต้แรงสูญญากาศ",
      ]}
      progressLabel="ระดับการวิเคราะห์ XPS"
      progressValue={hasSpectrum ? "1 / 1" : "0 / 1"}
      progressPercent={hasSpectrum ? 100 : 0}
      tips={[
        "XPS สามารถวัดระดับความลึกสูงสุดของพื้นผิวได้เพียงประมาณ 1-10 นาโนเมตรเท่านั้น เนื่องจากอิเล็กตรอนชั้นในที่อยู่ลึกเกินไปจะหลุดออกนอกพื้นผิวไม่ได้",
        "แกนกลาง C 1s ที่ 285.0 eV มักใช้เป็นมาตรฐานอ้างอิงภายในเพื่อปรับค่าความคลาดเคลื่อนของพลังงานจากการสะสมประจุบนของแข็งที่ไม่นำไฟฟ้า",
      ]}
      showLiveMetrics={true}
      showInfoTabs={true}
      showSaveButton={true}
      onRun={handleEmit}
      runLabel={isEmitting ? "กำลังวิเคราะห์" : "ทดลอง"}
      runActive={isEmitting}
      runDisabled={isEmitting}
      onReset={handleReset}
      onSave={handleSaveResult}
    />
  );
}

