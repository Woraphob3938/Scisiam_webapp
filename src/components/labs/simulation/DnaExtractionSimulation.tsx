"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Compass,
  Dna,
  Play,
  RotateCcw,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface DataPoint {
  sample: string;
  lysisTime: number;
  ethanolTemp: number;
  yieldMg: number;
  purity: string;
}

export default function DnaExtractionSimulation() {
  const [sample, setSample] = useState("Strawberry"); // Strawberry, Onion, Banana
  const [lysisTime, setLysisTime] = useState(5); // minutes (optimal: 5 min)
  const [ethanolTemp, setEthanolTemp] = useState(-20); // °C (optimal: -20°C)
  const [step, setStep] = useState(1); // 1: Lysis, 2: Filtration, 3: Precipitation, 4: Complete
  const [isLysisBufferAdded, setIsLysisBufferAdded] = useState(false);
  const [isFiltrationDone, setIsFiltrationDone] = useState(false);
  const [isEthanolAdded, setIsEthanolAdded] = useState(false);
  const [history, setHistory] = useState<DataPoint[]>([]);

  const sampleThai = useMemo(() => {
    if (sample === "Strawberry") return "สตรอว์เบอร์รี่ (Strawberry)";
    if (sample === "Onion") return "หอมหัวใหญ่ (Onion)";
    return "กล้วยหอม (Banana)";
  }, [sample]);

  // Calculate DNA yield based on input parameters
  const calculatedYield = useMemo(() => {
    if (!isLysisBufferAdded || !isFiltrationDone || !isEthanolAdded) return 0;

    // Base yield by organism genome size/ploidy (Strawberry is octoploid!)
    const baseYield = sample === "Strawberry" ? 24 : sample === "Onion" ? 12 : 8;

    // Lysis time multiplier (peaks at 5 min, degrades if too long, low if too short)
    const lysisDiff = lysisTime - 5;
    const lysisMultiplier = Math.max(0.1, Math.exp(-(lysisDiff * lysisDiff) / 8));

    // Ethanol temp multiplier (ice cold -20°C is 1.0, room temp 25°C is 0.2)
    const tempDiff = ethanolTemp + 20;
    const tempMultiplier = Math.max(0.2, 1.0 - (tempDiff / 45) * 0.8);

    return Math.round(baseYield * lysisMultiplier * tempMultiplier * 10) / 10;
  }, [sample, lysisTime, ethanolTemp, isLysisBufferAdded, isFiltrationDone, isEthanolAdded]);

  const calculatedPurity = useMemo(() => {
    if (!isLysisBufferAdded || !isFiltrationDone || !isEthanolAdded) return "N/A";
    const yieldMg = calculatedYield;
    if (yieldMg > 18) return "บริสุทธิ์สูง (A260/280 ~ 1.8)";
    if (yieldMg > 8) return "บริสุทธิ์ปานกลาง (A260/280 ~ 1.6)";
    return "เจือปนโปรตีน/ผนังเซลล์";
  }, [calculatedYield, isLysisBufferAdded, isFiltrationDone, isEthanolAdded]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!isLysisBufferAdded) {
        alert("กรุณากดเติมน้ำยา Lysis Buffer ก่อนเพื่อย่อยสลายเซลล์");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setIsFiltrationDone(true);
      setStep(3);
    } else if (step === 3) {
      setIsEthanolAdded(true);
      setStep(4);
      // Log to history when DNA is spooled
      const yieldVal = calculatedYield;
      setHistory((prev) => [
        ...prev,
        {
          sample: sampleThai,
          lysisTime,
          ethanolTemp,
          yieldMg: yieldVal,
          purity: calculatedPurity,
        },
      ]);
    }
  };

  const handleReset = () => {
    setStep(1);
    setIsLysisBufferAdded(false);
    setIsFiltrationDone(false);
    setIsEthanolAdded(false);
  };

  const handleSave = async () => {
    if (history.length === 0) {
      alert("กรุณาทำตามขั้นตอนจำลองให้เสร็จครบกระบวนการและสกัดดีเอ็นเอออกมาก่อนบันทึกผล");
      return;
    }

    const lastPoint = history[history.length - 1];
    const experimentData = {
      labId: "dna-extraction",
      timestamp: new Date().toLocaleString("th-TH"),
      sample,
      lysisTime,
      ethanolTemp,
      finalYield: lastPoint.yieldMg,
      purity: lastPoint.purity,
      dataPoints: history,
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_dna_experiment",
      localPayload: experimentData,
      labId: "dna-extraction",
      title: "DNA Extraction Chamber",
      variables: { sample, lysisTime, ethanolTemp },
      liveValues: { finalYield: lastPoint.yieldMg, purity: lastPoint.purity },
      graphPoints: history.map((h, idx) => ({ x: idx + 1, y: h.yieldMg })),
      tableRows: history,
      summary: {
        sample: lastPoint.sample,
        lysisTime,
        ethanolTemp,
        finalYield: lastPoint.yieldMg,
      },
      score: 100,
    });
    alert("บันทึกผลการทดลอง DNA Extraction สำเร็จ");
  };

  return (
    <SharedSimulationShell
      accent="violet"
      labId="dna-extraction"
      category="Biology"
      title="DNA Extraction Chamber"
      subtitle="จำลองขั้นตอนการสกัดสายดีเอ็นเอ (DNA Isolation) จากผนังเซลล์ของเนื้อเยื่อสตรอว์เบอร์รี่ หอมใหญ่ และกล้วยหอม"
      statusLabel={step === 4 ? "สกัด DNA สำเร็จ" : "พร้อมทดลอง"}
      icon={Dna}
      sceneTitle="แท่นจำลองเครื่องแก้วสารสกัดดีเอ็นเอ"
      scene={
        <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-violet-100 bg-[#0f172a] shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-45 pointer-events-none" />

          {/* Render steps inside viewport */}
          <svg className="h-full w-full max-w-[480px] p-4" viewBox="0 0 400 300" fill="none">
            <defs>
              <linearGradient id="lysisBufferGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="filtrateGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="ethanolGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {step === 1 && (
              <g>
                {/* Lysis tube view */}
                <path d="M170 50 V200 C170 230 230 230 230 200 V50" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
                {/* Mashed tissue at the bottom */}
                <path d="M173 170 Q200 160 227 170 V205 C227 218 173 218 173 205 Z" fill="#ec4899" opacity="0.8" />
                
                {isLysisBufferAdded && (
                  <path d="M173 120 Q200 110 227 120 V170 Q200 160 173 170 Z" fill="url(#lysisBufferGrad)" />
                )}
                
                <text x="200" y="270" fill="#cbd5e1" fontSize="12" fontWeight="bold" textAnchor="middle">ขั้นตอนที่ 1: การย่อยสลายเซลล์ (Cell Lysis)</text>
              </g>
            )}

            {step === 2 && (
              <g>
                {/* Filter and funnel view */}
                <path d="M150 50 L180 120 V170 H220 V120 L250 50" stroke="#94a3b8" strokeWidth="5" />
                <path d="M165 80 L185 125 H215 L235 80" fill="#e2e8f0" opacity="0.6" /> {/* Filter paper */}

                {/* Collecting tube below */}
                <path d="M185 190 V250 C185 260 215 260 215 250 V190" stroke="#94a3b8" strokeWidth="4" />
                <path d="M187 220 Q200 215 213 220 V250 C213 255 187 255 187 250 Z" fill="url(#filtrateGrad)" />
                
                <text x="200" y="280" fill="#cbd5e1" fontSize="12" fontWeight="bold" textAnchor="middle">ขั้นตอนที่ 2: การกรองแยกเศษเซลล์ (Filtration)</text>
              </g>
            )}

            {step >= 3 && (
              <g>
                {/* Tube with two layers: Filtrate at bottom, ethanol at top */}
                <path d="M170 50 V200 C170 230 230 230 230 200 V50" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
                
                {/* Filtrate layer at bottom */}
                <path d="M173 150 Q200 145 227 150 V205 C227 218 173 218 173 205 Z" fill="url(#filtrateGrad)" />
                
                {isEthanolAdded && (
                  <>
                    {/* Ethanol layer on top */}
                    <path d="M173 90 Q200 85 227 90 V150 Q200 145 173 150 Z" fill="url(#ethanolGrad)" />
                    
                    {/* DNA precipitation fibers */}
                    {step === 4 && (
                      <g stroke="#ffffff" strokeWidth="2.5" opacity="0.9" strokeLinecap="round" fill="none">
                        {/* Swirling DNA strings precipitating into the alcohol layer */}
                        <path d="M190 170 Q185 140 205 130 T210 95" />
                        <path d="M210 160 Q215 135 195 125 T200 100" />
                        <path d="M198 150 Q205 140 190 120 T208 105" />
                        <path d="M185 105 Q200 100 215 105" strokeWidth="1" strokeDasharray="3 3" />
                      </g>
                    )}
                  </>
                )}

                <text x="200" y="270" fill="#cbd5e1" fontSize="12" fontWeight="bold" textAnchor="middle">
                  {step === 3 ? "ขั้นตอนที่ 3: ตกตะกอนด้วยเอทานอล" : "ขั้นตอนที่ 4: สกัดสาย DNA สำเร็จ!"}
                </text>
              </g>
            )}
          </svg>

          {/* Current action badge inside viewport */}
          <div className="absolute right-5 bottom-5 rounded-xl bg-slate-900/90 border border-slate-700/60 px-3.5 py-1.5 text-right font-bold text-xs text-white">
            <span className="text-[10px] text-slate-400 block font-black">ขั้นตอนปัจจุบัน</span>
            {step === 1 ? "1. สลายเซลล์ (Lysis)" : step === 2 ? "2. กรองสารละลาย" : step === 3 ? "3. ตกตะกอนแอลกอฮอล์" : "4. สกัด DNA สำเร็จ"}
          </div>
        </div>
      }
      controlsTitle="ควบคุมขั้นตอนการบดและสกัดเยื่อเลือกผ่าน"
      controls={
        <div className="space-y-4 font-sans">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-600">เลือกเนื้อเยื่อพืชตัวอย่าง</span>
            <select
              value={sample}
              onChange={(e) => setSample(e.target.value)}
              disabled={step > 1}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-45"
            >
              <option value="Strawberry">สตรอว์เบอร์รี่ ( Strawberry - Octoploid 8n )</option>
              <option value="Onion">หอมใหญ่ ( Onion - Diploid 2n )</option>
              <option value="Banana">กล้วยหอม ( Banana - Triploid 3n )</option>
            </select>
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>เวลาทำปฏิกิริยาย่อยเซลล์ (Lysis)</span>
              <span className="rounded-md bg-violet-50 px-2 py-0.5 font-black text-violet-700">{lysisTime} นาที</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={lysisTime}
              disabled={step > 1}
              onChange={(e) => setLysisTime(Number(e.target.value))}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-violet-500 disabled:opacity-45"
            />
          </label>

          <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>อุณหภูมิเอทานอลที่เติม (Precipitant Temp)</span>
              <span className="rounded-md bg-violet-50 px-2 py-0.5 font-black text-violet-700">{ethanolTemp}°C</span>
            </div>
            <input
              type="range"
              min={-20}
              max={25}
              step={5}
              value={ethanolTemp}
              disabled={step > 3}
              onChange={(e) => setEthanolTemp(Number(e.target.value))}
              className="h-1.5 w-full rounded-full bg-slate-100 accent-violet-500 disabled:opacity-45"
            />
          </label>

          <div className="flex gap-2.5 pt-1.5">
            {step === 1 && (
              <button
                onClick={() => setIsLysisBufferAdded(true)}
                className="flex-1 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-100 font-extrabold rounded-xl text-xs transition-colors"
              >
                1. เติม Lysis Buffer
              </button>
            )}
            <button
              onClick={handleNextStep}
              disabled={step === 4}
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-xl text-xs transition-colors disabled:opacity-45"
            >
              ถัดไป &rarr;
            </button>
            <button
              onClick={handleReset}
              className="px-3.5 py-2.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-extrabold rounded-xl text-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      }
      metrics={[
        { label: "ตัวอย่าง", value: sampleThai.split(" (")[0], tone: "violet" },
        { label: "ปริมาณดีเอ็นเอ", value: step === 4 ? `${calculatedYield} mg` : "0.0 mg", tone: "emerald" },
        { label: "ความบริสุทธิ์ DNA", value: calculatedPurity, tone: "cyan" },
        { label: "อุณหภูมิแอลกอฮอล์", value: `${ethanolTemp}°C`, tone: "blue" },
      ]}
      graph={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <BarChart3 className="h-4.5 w-4.5 text-violet-600" />
              การตกตะกอน DNA
            </h3>
            <span className="text-[10px] font-bold text-violet-600 select-none">yield analytics</span>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-4 rounded-xl bg-slate-50/70 p-4 text-xs font-semibold text-slate-500">
            <div className="flex justify-between items-center text-slate-700 font-bold">
              <span>ผลลัพธ์มวลสกัดสะสม:</span>
              <span>{step === 4 ? `${calculatedYield} mg` : "0.0 mg"}</span>
            </div>
            <div className="h-6 overflow-hidden rounded-full bg-white relative">
              <div
                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-violet-400 to-violet-600"
                style={{ width: `${Math.min(100, ((step === 4 ? calculatedYield : 0) / 24) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-bold leading-normal text-slate-400">
              * การสกัดจากสตรอว์เบอร์รี่จะมีความคุ้มค่าสูงสุดเนื่องจากมีจำนวนชุดโครโมโซมมาก (Octoploid)
            </p>
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 leading-normal">
              <ClipboardList className="h-4.5 w-4.5 text-violet-600" />
              ตารางสารสกัดสะสม
            </h3>
            <span className="text-[10px] font-bold text-slate-400 select-none">{history.length} ตัวอย่างสกัด</span>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-slate-100 max-h-[190px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-violet-50/70 text-[11px] font-black text-violet-800 sticky top-0">
                <tr>
                  <th className="px-2 py-2">พืช</th>
                  <th className="px-2 py-2">เวลาย่อย</th>
                  <th className="px-2 py-2">อุณหภูมิ</th>
                  <th className="px-2 py-2">ดีเอ็นเอ (mg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                {history.slice(-6).map((point, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-2 font-mono">{point.sample.split(" ")[0]}</td>
                    <td className="px-2 py-2 font-mono">{point.lysisTime}m</td>
                    <td className="px-2 py-2 font-mono">{point.ethanolTemp}°C</td>
                    <td className="px-2 py-2 font-mono text-violet-700">{point.yieldMg} mg</td>
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
            <Compass className="h-4.5 w-4.5 text-violet-600" />
            ทฤษฎีสารชีวเคมีดีเอ็นเอ
          </h3>
          <div className="flex flex-1 flex-col justify-between gap-3 text-xs font-semibold leading-relaxed text-slate-500">
            <p>
              **Lysis Buffer** ผสมน้ำยาล้างจาน (ย่อยสลายไขมันหุ้มเยื่อเซลล์) และเกลือ NaCl (ทำปฏิกิริยาสะเทินประจุฟอสเฟตของดีเอ็นเอให้ลดแรงดันผลักกัน)
            </p>
            <p>
              **Ethanol (-20°C)** ดีเอ็นเอไม่ละลายในแอลกอฮอล์เย็นจัด จึงจับตัวตกตะกอนแยกตัวเป็นเส้นใยสีขาวด้านบนอย่างชัดเจน
            </p>
          </div>
        </section>
      }
      steps={[
        { label: "เลือกเซลล์ตัวอย่าง", icon: Dna },
        { label: "ย่อยสลายผนังเซลล์", icon: Play },
        { label: "กรองเศษเนื้อพืช", icon: Activity },
        { label: "ตกตะกอนเอทานอล", icon: BarChart3 },
        { label: "สลัดและเก็บสายใย", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "อธิบายบทบาทของโซเดียมคลอไรด์และผงซักฟอกใน Lysis Buffer ต่อเยื่อเซลล์",
        "วิเคราะห์ความแตกต่างของปริมาณดีเอ็นเอตามจำนวนชุดโครโมโซมของพืช",
        "ระบุเหตุผลในการใช้เอทานอลแช่แข็งจัด (-20°C) ต่อกระบวนการตกตะกอน",
        "ทำการคำนวณหามวลน้ำหนักผลผลิตสกัดบริสุทธิ์ของดีเอ็นเอตัวอย่าง",
      ]}
      progressLabel="ประสิทธิภาพตะกอนสะสม"
      progressValue={step === 4 ? `${calculatedYield} mg` : "0.0 mg"}
      progressPercent={step === 4 ? Math.min(100, (calculatedYield / 24) * 100) : 0}
      tips={[
        "ทดลองใช้สตรอว์เบอร์รี่และเอทานอลอุณหภูมิเย็นจัดที่ -20°C จะได้ปริมาณมากที่สุด",
        "ไม่ควรใช้เวลาย่อย Lysis นานเกิน 8 นาที เพราะเอนไซม์นิวคลีเอสในไซโตพลาสซึมจะเริ่มทำลายดีเอ็นเอ",
        "หากใช้แอลกอฮอล์ที่อุณหภูมิห้อง (25°C) สารจะตกตะกอนได้ไม่สมบูรณ์และปริมาณจะลดฮวบ",
      ]}
      onRun={handleNextStep}
      runLabel={step >= 4 ? "สกัดเสร็จแล้ว" : "ทำขั้นตอนถัดไป"}
      runDisabled={step >= 4}
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}
