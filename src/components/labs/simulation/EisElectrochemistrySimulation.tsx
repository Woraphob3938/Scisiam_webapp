"use client";

import React, { useState, useEffect, useRef } from "react";
import SharedSimulationShell from "./SharedSimulationShell";
import CompactRangeControl from "./CompactRangeControl";
import {
  Info,
  Zap,
  Disc,
  Play,
} from "lucide-react";
import { labsById } from "@/data/labs";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface EisLog {
  id: number;
  electrode: string;
  rs: number;
  rct: number;
  cdl: number;
  acAmp: number;
}

const electrodes = [
  {
    id: "platinum",
    name: "ขั้วพลาทินัมบริสุทธิ์ (Polished Platinum)",
    rs: 15,
    rct: 80,
    cdl: 10,
    description: "ขั้วนำไฟฟ้าดีเยี่ยม มีความต้านทานถ่ายโอนประจุต่ำมาก"
  },
  {
    id: "steel",
    name: "เหล็กในน้ำเกลือ (Corroding Steel)",
    rs: 30,
    rct: 350,
    cdl: 50,
    description: "เหล็กกำลังเกิดสนิมช้า ๆ พฤติกรรมการถ่ายโอนประจุมีแรงต้านทานสูงขึ้น"
  },
  {
    id: "coated",
    name: "โลหะเคลือบกันสนิม (Polymer Coated Metal)",
    rs: 60,
    rct: 2000,
    cdl: 2,
    description: "มีผิวเคลือบกันประจุไฟฟ้าผ่านสูงมาก แสดงผลใกล้เคียงกับตัวเก็บประจุบริสุทธิ์"
  }
];

export default function EisElectrochemistrySimulation() {
  const labId = "eis-electrochemistry";
  const labData = labsById[labId];

  const [selectedElectrode, setSelectedElectrode] = useState(electrodes[0]);
  const [acAmplitude, setAcAmplitude] = useState(10); // mV (5 - 20)
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepProgress, setSweepProgress] = useState(0); // 0 to 100
  const [sweepData, setSweepData] = useState<{ real: number; imag: number; freq: number }[]>([]);
  const [logs, setLogs] = useState<EisLog[]>([]);
  const [, setIsSaving] = useState(false);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const handleSweep = () => {
    if (isSweeping) return;
    setIsSweeping(true);
    setSweepProgress(0);
    setSweepData([]);
  };

  const handleReset = () => {
    setIsSweeping(false);
    setSweepProgress(0);
    setSweepData([]);
  };

  // Generate Randles circuit Nyquist points mathematically
  const getNyquistPoint = (freq: number) => {
    const w = 2 * Math.PI * freq;
    const Rs = selectedElectrode.rs;
    const Rct = selectedElectrode.rct;
    const Cdl = selectedElectrode.cdl * 1e-6;

    // Impedance of parallel RC: Z_rc = Rct / (1 + i * w * Rct * Cdl)
    // Real part: Rs + Rct / (1 + w^2 * Rct^2 * Cdl^2)
    // Imaginary part: w * Rct^2 * Cdl / (1 + w^2 * Rct^2 * Cdl^2)
    const denom = 1 + Math.pow(w * Rct * Cdl, 2);
    const real = Rs + Rct / denom;
    const imag = (w * Math.pow(Rct, 2) * Cdl) / denom;

    return { real, imag, freq };
  };

  // Frequency range: 100,000 Hz down to 1 Hz
  const minFreqLog = 0; // 10^0 = 1 Hz
  const maxFreqLog = 5; // 10^5 = 100,000 Hz

  const animate = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;

    if (isSweeping && sweepProgress < 100) {
      setSweepProgress(prev => {
        const next = prev + 2;

        // Map progress to log frequency sweep (high frequency to low frequency)
        const currentLogFreq = maxFreqLog - (next / 100) * (maxFreqLog - minFreqLog);
        const freq = Math.pow(10, currentLogFreq);
        const pt = getNyquistPoint(freq);

        setSweepData(prevData => [...prevData, pt]);

        if (next >= 100) {
          setIsSweeping(false);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- RAF sweep loop intentionally uses the current animation closure.
  }, [isSweeping, sweepProgress]);

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleSave = async () => {
    if (sweepData.length === 0) {
      window.alert("กรุณาเริ่มทดลองเพื่อเก็บข้อมูลอิมพีแดนซ์ก่อนบันทึก");
      return;
    }

    const savedLogs = logs.some((log) => log.electrode === selectedElectrode.name)
      ? logs
      : [{
          id: Date.now(),
          electrode: selectedElectrode.name,
          rs: selectedElectrode.rs,
          rct: selectedElectrode.rct,
          cdl: selectedElectrode.cdl,
          acAmp: acAmplitude,
        }, ...logs];
    if (savedLogs.length !== logs.length) setLogs(savedLogs);

    setIsSaving(true);
    try {
      await saveExperimentAndSync({
        localStorageKey: "scisiam_saved_eis_electrochemistry_experiment",
        localPayload: {
          labId,
          timestamp: new Date().toISOString(),
          logs: savedLogs,
        },
        labId,
        title: "อิมพีแดนซ์ไฟฟ้าเคมี",
        variables: { lastAmplitudeMv: acAmplitude },
        liveValues: {
          electrodeId: selectedElectrode.id,
          rs: selectedElectrode.rs,
          rct: selectedElectrode.rct,
        },
        graphPoints: sweepData.map(d => ({
          x: d.real,
          y: d.imag,
        })),
        tableRows: savedLogs,
        summary: {
          electrodesTested: savedLogs.length,
          lastRct: selectedElectrode.rct,
        },
        durationSeconds: 40,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getMetricDisplay = () => [
    { label: "แรงต้านสารละลาย (Rs)", value: `${selectedElectrode.rs} Ω` },
    { label: "ความต้านทานถ่ายโอนประจุ (Rct)", value: `${selectedElectrode.rct} Ω` },
    { label: "ความจุไฟฟ้าสลายขั้ว (Cdl)", value: `${selectedElectrode.cdl} µF` },
  ];

  const compactControls = (
    <CompactRangeControl
      label="แอมพลิจูดกระแสสลับ"
      symbol="AC"
      value={acAmplitude}
      min={5}
      max={20}
      step={1}
      precision={0}
      unit="mV"
      tone="orange"
      onChange={(value) => {
        setAcAmplitude(value);
        handleReset();
      }}
    />
  );

  return (
    <SharedSimulationShell
      accent="orange"
      labId={labId}
      category={labData?.category || "Chemistry"}
      title={labData?.thaiTitle || labData?.title || "อิมพีแดนซ์ไฟฟ้าเคมี"}
      subtitle={labData?.description || ""}
      statusLabel="พร้อมใช้งาน"
      icon={Disc}
      sceneTitle="ระบบเซลล์สามขั้วไฟฟ้า (Three-Electrode Cell)"
      scene={
        <div className="relative flex min-h-[340px] h-full w-full items-center justify-center bg-[linear-gradient(145deg,#fff7ed,#f8fafc_52%,#eff6ff)] p-4">
          <div className="grid w-full max-w-2xl grid-cols-2 gap-6 items-center">
            {/* 3-electrode cell SVG */}
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 190 180" className="h-auto w-full max-w-[210px]" role="img" aria-label="เซลล์อิเล็กโทรเคมีสามขั้วไฟฟ้าเชื่อมต่อกับโพเทนชิโอสแตต">
                <title>เซลล์สามขั้วไฟฟ้าสำหรับวัด EIS</title>
                <desc>ขั้วทำงาน ขั้วอ้างอิง และขั้วช่วยจุ่มในอิเล็กโทรไลต์และเชื่อมต่อเครื่องวิเคราะห์อิมพีแดนซ์</desc>
                {/* Electrolyte liquid in Beaker */}
                <rect x="20" y="40" width="120" height="100" fill="none" stroke="#64748b" strokeWidth="3" />
                <rect x="22" y="60" width="116" height="78" fill="#bae6fd" opacity="0.4" />

                {/* Electrodes */}
                {/* Working Electrode (WE) */}
                <rect x="40" y="30" width="10" height="70" fill={
                  selectedElectrode.id === "platinum" ? "#e2e8f0" :
                  selectedElectrode.id === "steel" ? "#94a3b8" : "#f1f5f9"
                } stroke="#475569" strokeWidth="1" />
                {selectedElectrode.id === "coated" && (
                  <rect x="38" y="50" width="14" height="40" fill="#a855f7" opacity="0.6" />
                )}

                {/* Reference Electrode (RE) */}
                <rect x="75" y="30" width="8" height="75" fill="#f8fafc" stroke="#94a3b8" />
                <rect x="77" y="95" width="4" height="8" fill="#10b981" />

                {/* Counter Electrode (CE) */}
                <rect x="110" y="30" width="10" height="70" fill="#475569" />

                {/* Potentiostat wiring connections */}
                <path d="M 45 30 L 45 15 L 80 15" stroke="#ef4444" strokeWidth="1.5" fill="none" />
                <path d="M 79 30 L 79 15" stroke="#10b981" strokeWidth="1.5" fill="none" />
                <path d="M 115 30 L 115 15 L 80 15" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
                <circle cx="80" cy="15" r="3" fill="#1e293b" />
                <rect x="66" y="2" width="28" height="18" rx="5" fill="#0f172a" />
                <text x="80" y="14" textAnchor="middle" fill="#f8fafc" fontSize="7" fontWeight="900">EIS</text>
                <text x="45" y="118" textAnchor="middle" fill="#b91c1c" fontSize="10" fontWeight="900">WE</text>
                <text x="79" y="118" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="900">RE</text>
                <text x="115" y="118" textAnchor="middle" fill="#1d4ed8" fontSize="10" fontWeight="900">CE</text>

                {/* AC wave ripple inside electrolyte */}
                {isSweeping && (
                  <path d="M 45 80 Q 60 70 75 80 T 105 80" stroke="#f97316" strokeWidth="1.5" fill="none" className="animate-pulse" />
                )}
              </svg>
              <div className="mt-2 text-xs font-bold text-slate-600">ขั้วทำงาน: {selectedElectrode.name.split(" (")[0]}</div>
            </div>

            {/* Nyquist Plot SVG */}
            <div className="relative flex h-full flex-col justify-between border-l border-slate-200 pl-5 py-2">
              <span className="mb-1 block text-xs font-black text-slate-600">Nyquist plot (-Z&apos;&apos; เทียบ Z&apos;)</span>
              <svg viewBox="0 0 220 38" className="mb-1 h-10 w-full" role="img" aria-label="วงจรสมมูลแบบแรนเดิลส์">
                <title>วงจรสมมูล Randles</title>
                <path d="M8 19H34M64 19H90M90 19V7H132V19M90 19V31H132V19M132 19H158M190 19H212" stroke="#64748b" strokeWidth="2" fill="none" />
                <path d="M34 11L39 27L45 11L51 27L57 11L64 19M158 11L164 27L170 11L176 27L182 11L190 19" stroke="#f97316" strokeWidth="2" fill="none" />
                <text x="49" y="9" textAnchor="middle" fill="#9a3412" fontSize="8" fontWeight="900">Rₛ</text>
                <text x="111" y="6" textAnchor="middle" fill="#1d4ed8" fontSize="8" fontWeight="900">Cdl</text>
                <text x="174" y="9" textAnchor="middle" fill="#9a3412" fontSize="8" fontWeight="900">Rct</text>
              </svg>
              <div className="relative h-44 w-full p-1">
                <svg className="w-full h-full" viewBox="0 0 160 120" role="img" aria-label="กราฟ Nyquist ของอิมพีแดนซ์เชิงซ้อน">
                  <title>กราฟ Nyquist</title>
                  {/* Axis */}
                  <line x1="20" y1="100" x2="150" y2="100" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="20" y1="10" x2="20" y2="100" stroke="#94a3b8" strokeWidth="1" />
                  <text x="145" y="112" className="text-[7px] fill-slate-400 font-bold" textAnchor="middle">Z&apos; (Ω)</text>
                  <text x="15" y="15" className="text-[7px] fill-slate-400 font-bold" textAnchor="end" transform="rotate(-90 15 15)">-Z&apos;&apos; (Ω)</text>

                  {/* Dynamic semicircle path */}
                  {sweepData.length > 1 && (
                    <path
                      d={`M ${20 + (sweepData[0].real / 2200) * 120} ${100 - (sweepData[0].imag / 2200) * 120}
                          ${sweepData.map(d => {
                            // Scale axis according to maximum resistance (2200 max)
                            const rx = 20 + (d.real / 2200) * 120;
                            const ry = 100 - (d.imag / 2200) * 120;
                            return `L ${rx} ${ry}`;
                          }).join(" ")}`}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                    />
                  )}

                  {/* Semicircle endpoints indicators */}
                  {sweepData.length > 0 && (
                    <g>
                      <circle cx={20 + (sweepData[0].real / 2200) * 120} cy="100" r="2" fill="#ef4444" />
                      <circle cx={20 + (sweepData[sweepData.length - 1].real / 2200) * 120} cy="100" r="2" fill="#ef4444" />
                    </g>
                  )}
                </svg>
              </div>

              {/* Progress scale */}
              {isSweeping && (
                <div className="text-[8px] text-orange-600 font-bold text-center mt-1">
                  กำลังรันความถี่: {Math.round(sweepProgress)}%
                </div>
              )}
            </div>
          </div>
        </div>
      }
      controlsTitle="เลือกขั้ววัดและกำหนดกระแสสลับ"
      compactControls={compactControls}
      controls={
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">เลือกขั้วไฟฟ้าทำงาน (Working)</label>
            <div className="grid grid-cols-1 gap-1.5">
              {electrodes.map(e => (
                <button
                  key={e.id}
                  onClick={() => {
                    setSelectedElectrode(e);
                    handleReset();
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-all ${
                    selectedElectrode.id === e.id
                      ? "bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-350 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-bold">{e.name.split(" (")[0]}</div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">{e.description}</div>
                </button>
              ))}
            </div>
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
                <th className="p-3">ขั้วไฟฟ้า</th>
                <th className="p-3">Rs (ความต้านทานน้ำยา - Ω)</th>
                <th className="p-3">Rct (ความต้านทานขั้ว - Ω)</th>
                <th className="p-3">Cdl (ความจุไฟฟ้าขั้ว - µF)</th>
                <th className="p-3">แอมพลิจูดสัญญาณ</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 italic">ยังไม่มีข้อมูลบันทึกสเปกโทรสโกปีอิมพีแดนซ์</td>
                </tr>
              ) : (
                logs.map(l => (
                  <tr key={l.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{l.electrode.split(" (")[0]}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{l.rs} Ω</td>
                    <td className="p-3 font-bold text-orange-600 dark:text-orange-400">{l.rct} Ω</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{l.cdl} µF</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{l.acAmp} mV</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {logs.length > 0 && (
            <div className="p-2 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <button onClick={handleClearLogs} className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors">
                ล้างข้อมูล
              </button>
            </div>
          )}
        </div>
      }
      theory={
        <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>
            <strong>Electrochemical Impedance Spectroscopy (EIS)</strong> เป็นเทคนิคการจ่ายไฟฟ้ากระแสสลับแรงดันต่ำ (AC voltage)
            เข้าไปในขั้วไฟฟ้าในช่วงความถี่กว้าง (เช่น $10^5$ Hz ถึง $1$ Hz) เพื่อวัดค่าความต้านทานเสมือน (Impedance, Z) ที่เปลี่ยนแปลงไปตามเฟส
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>วงจรสมมูล Randles (Equivalent Circuit)</strong>: พฤติกรรมที่รอยต่อขั้วไฟฟ้าถูกสร้างแบบจำลองด้วยชิ้นส่วนอิเล็กทรอนิกส์:
              <ul className="list-circle pl-5 mt-1">
                <li><strong>Rs (Solution Resistance)</strong>: แรงต้านการเคลื่อนย้ายไอออนในสารละลายอิเล็กโทรไลต์</li>
                <li><strong>Rct (Charge Transfer Resistance)</strong>: แรงต้านทานตอนอิเล็กตรอนเกิดปฏิกิริยารีดอกซ์ข้ามขั้วไฟฟ้า</li>
                <li><strong>Cdl (Double Layer Capacitance)</strong>: ความจุไฟฟ้าของประจุที่มาออดันกันที่ผิวสัมผัสขั้วไฟฟ้า</li>
              </ul>
            </li>
            <li><strong>แผนภาพ Nyquist Plot</strong>: เป็นกราฟระหว่างค่าความต้านทานจริง (Real Z&apos;) และค่าความต้านทานจินตภาพ (Imaginary -Z&apos;&apos;) พีคครึ่งวงกลมจะขยายกว้างออกตามค่าความต้านทานขั้ว (Rct)</li>
          </ul>
        </div>
      }
      steps={[
        { label: "เลือกขั้วไฟฟ้าทำงานที่คุณต้องการศึกษาในกล่องสลับ", icon: Zap },
        { label: "กำหนดแอมพลิจูดแรงดันกระแสสลับป้อนป้อนเข้าระบบ", icon: Zap },
        { label: "กดกวาดความถี่ (Sweep) เพื่อให้ปั๊มสัญญาณคลื่นความถี่ต่าง ๆ", icon: Play },
        { label: "สังเกตการวาดเส้นครึ่งวงกลมและอ่านค่าขอบเขตความต้านทาน", icon: Info },
      ]}
      learningGoals={[
        "เรียนรู้วิธีการวิเคราะห์ข้อมูลความจุและแรงต้านไฟฟ้าในแผนภาพ Nyquist Plot",
        "ศึกษาผลกระทบของคุณลักษณะทางกายภาพขั้วต่อ (เช่น การกัดกร่อน ตัวเคลือบพอลิเมอร์)",
        "วิเคราะห์วงจรสมมูล Randles ในการอธิบายกลไกแลกเปลี่ยนไอออนไฟเคมี",
      ]}
      progressLabel="ระดับการสแกนความถี่"
      progressValue={sweepProgress >= 100 ? "สำเร็จ" : `${Math.round(sweepProgress)}%`}
      progressPercent={sweepProgress}
      tips={[
        "ยอดครึ่งวงกลมใน Nyquist plot จะเกิดขึ้นที่ค่าความถี่เฉพาะเจาะจง ($\omega_{\text{max}} = 1/(R_{ct} \cdot C_{dl})$)",
        "ขั้วที่มีการเคลือบสีหนาแน่นมักแสดงค่าครึ่งวงกลมขนาดใหญ่มากเกือบเป็นเส้นตรงแนวตั้ง เพราะประจุไม่สามารถแลกเปลี่ยนได้เลย (ทำตัวเสมือนตัวเก็บประจุแบบ Pure Capacitor)",
      ]}
      showLiveMetrics={true}
      showInfoTabs={true}
      showSaveButton={true}
      onRun={handleSweep}
      runLabel={isSweeping ? "กำลังกวาดความถี่" : "เริ่มทดลอง"}
      runActive={isSweeping}
      runDisabled={isSweeping}
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}

