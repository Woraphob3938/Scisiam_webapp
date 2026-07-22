"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Beaker,
  CirclePlay,
  Eraser,
  Filter,
  Flame,
  Magnet,
  RotateCcw,
  Save,
  ScanLine,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import {
  getSeparationOutcome,
  type MixtureType,
  type SeparationMethod,
} from "@/lib/simulations/elementaryChemistry";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

type SeparationTrial = {
  index: number;
  mixture: MixtureType;
  mixtureLabel: string;
  method: SeparationMethod;
  methodLabel: string;
  recoveryPercent: number;
  purityPercent: number;
  isPreferred: boolean;
};

const MIXTURES: Array<{ id: MixtureType; label: string; property: string }> = [
  { id: "iron-sand", label: "ผงตะไบเหล็ก + ทราย", property: "ความเป็นแม่เหล็ก" },
  { id: "sand-water", label: "ทราย + น้ำ", property: "ขนาดอนุภาค" },
  { id: "salt-water", label: "เกลือ + น้ำ", property: "การระเหยของตัวทำละลาย" },
  { id: "gravel-sand", label: "กรวด + ทราย", property: "ขนาดเม็ด" },
];

const METHODS = [
  { id: "magnet", label: "แม่เหล็ก", icon: Magnet, color: "text-rose-600" },
  { id: "filtration", label: "การกรอง", icon: Filter, color: "text-blue-600" },
  { id: "evaporation", label: "การระเหย", icon: Flame, color: "text-amber-600" },
  { id: "sieving", label: "การร่อน", icon: ScanLine, color: "text-slate-600" },
] satisfies Array<{
  id: SeparationMethod;
  label: string;
  icon: typeof Magnet;
  color: string;
}>;

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function MixingAndSeparatingSimulation() {
  const labId = "mixing-and-separating";
  const svgId = useId().replaceAll(":", "");
  const titleId = `separation-title-${svgId}`;
  const descriptionId = `separation-description-${svgId}`;
  const glassGradientId = `separation-glass-${svgId}`;
  const [mixture, setMixture] = useState<MixtureType>("iron-sand");
  const [method, setMethod] = useState<SeparationMethod | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trials, setTrials] = useState<SeparationTrial[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const completedRef = useRef(false);

  const mixtureOption = MIXTURES.find((option) => option.id === mixture) ?? MIXTURES[0];
  const methodOption = METHODS.find((option) => option.id === method) ?? null;
  const outcome = useMemo(
    () => (method ? getSeparationOutcome(mixture, method) : null),
    [method, mixture],
  );

  useEffect(() => {
    if (!isRunning || !method || !outcome || !methodOption) return;

    const tick = (timestamp: number) => {
      if (startTimeRef.current === 0) startTimeRef.current = timestamp;
      const nextProgress = Math.min(100, (timestamp - startTimeRef.current) / 30);
      setProgress(nextProgress);

      if (nextProgress >= 100 && !completedRef.current) {
        completedRef.current = true;
        setTrials((previous) => [
          ...previous,
          {
            index: previous.length + 1,
            mixture,
            mixtureLabel: mixtureOption.label,
            method,
            methodLabel: methodOption.label,
            ...outcome,
          },
        ].slice(-12).map((trial, index) => ({ ...trial, index: index + 1 })));
        setIsRunning(false);
        return;
      }

      animationRef.current = window.requestAnimationFrame(tick);
    };

    animationRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };
  }, [isRunning, method, methodOption, mixture, mixtureOption.label, outcome]);

  const startSeparation = (selectedMethod: SeparationMethod) => {
    if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    setMethod(selectedMethod);
    setProgress(0);
    startTimeRef.current = 0;
    completedRef.current = false;
    setIsRunning(true);
  };

  const resetCurrentTrial = () => {
    setIsRunning(false);
    setMethod(null);
    setProgress(0);
    startTimeRef.current = 0;
    completedRef.current = false;
  };

  const handleSave = async () => {
    if (trials.length === 0) {
      window.alert("กรุณาทดลองแยกสารอย่างน้อย 1 ครั้งก่อนบันทึกผล");
      return;
    }

    setIsSaving(true);
    try {
      await saveExperimentAndSync({
        localStorageKey: "scisiam_saved_mixing_separating_experiment",
        localPayload: { labId, timestamp: new Date().toISOString(), trials },
        labId,
        title: "การผสมและแยกสาร",
        variables: { mixture, method },
        liveValues: { progress, ...(outcome ?? {}) },
        graphPoints: trials.map(({ index, recoveryPercent, purityPercent }) => ({
          index,
          recoveryPercent,
          purityPercent,
        })),
        tableRows: trials,
        summary: {
          trialsCount: trials.length,
          preferredCount: trials.filter((trial) => trial.isPreferred).length,
        },
        durationSeconds: null,
      });
      window.alert("บันทึกผลการทดลองผสมและแยกสารแล้ว");
    } finally {
      setIsSaving(false);
    }
  };

  const resultText = isRunning
    ? "กำลังแยกสาร"
    : progress === 100 && outcome
      ? outcome.isPreferred
        ? "วิธีเหมาะสม"
        : "แยกได้บางส่วน"
      : "รอเลือกวิธี";

  const apparatus = (() => {
    if (!method) {
      return (
        <g transform="translate(278 94)">
          <rect width="206" height="210" rx="24" fill="#fff" stroke="#fed7aa" strokeWidth="3" />
          <path d="M54 54 H152 L140 164 Q138 178 124 178 H82 Q68 178 66 164 Z" fill="#fffbeb" stroke="#94a3b8" strokeWidth="4" />
          <rect x="69" y="124" width="68" height="50" rx="8" fill="#fcd34d" opacity="0.6" />
          <circle cx="86" cy="145" r="5" fill="#475569" /><circle cx="112" cy="158" r="5" fill="#475569" /><circle cx="128" cy="139" r="5" fill="#475569" />
          <text x="103" y="198" textAnchor="middle" fontSize="14" fontWeight="800" fill="#64748b">เลือกวิธีแยกสาร</text>
        </g>
      );
    }

    if (method === "magnet") {
      const lift = outcome?.isPreferred ? progress * 0.55 : progress * 0.08;
      return (
        <g>
          <path d="M306 232 H456 L445 306 H317 Z" fill="#fde68a" stroke="#d97706" strokeWidth="3" />
          <g transform={`translate(0 ${72 - lift})`}>
            <path d="M330 42 V126 A46 46 0 0 0 422 126 V42 H392 V124 A16 16 0 0 1 360 124 V42 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="3" />
            <rect x="330" y="104" width="30" height="28" fill="#e2e8f0" /><rect x="392" y="104" width="30" height="28" fill="#e2e8f0" />
            {Array.from({ length: 12 }, (_, index) => <circle key={index} cx={348 + (index % 4) * 20} cy={145 + Math.floor(index / 4) * 10} r="4" fill="#334155" opacity={(progress / 100) * (outcome?.isPreferred ? 1 : 0.25)} />)}
          </g>
        </g>
      );
    }

    if (method === "filtration") {
      return (
        <g>
          <path d="M292 64 H468 L402 166 V218 H358 V166 Z" fill={`url(#${glassGradientId})`} stroke="#64748b" strokeWidth="4" />
          <path d="M312 80 H448 L406 145 H354 Z" fill="#fde68a" opacity={outcome?.isPreferred ? 0.85 : 0.35} />
          <path d="M380 218 V272" stroke="#38bdf8" strokeWidth={outcome?.isPreferred ? 8 : 2} strokeDasharray="10 7" opacity={progress / 100} />
          <path d="M322 268 H438 L424 334 H336 Z" fill="#dbeafe" stroke="#64748b" strokeWidth="4" />
          <rect x="340" y={324 - progress * 0.38} width="80" height={progress * 0.38} fill="#7dd3fc" opacity={outcome?.isPreferred ? 0.65 : 0.18} />
        </g>
      );
    }

    if (method === "evaporation") {
      return (
        <g>
          <path d="M294 214 Q380 250 466 214 L446 278 Q380 310 314 278 Z" fill="#e0f2fe" stroke="#64748b" strokeWidth="4" />
          <path d="M318 230 Q380 250 442 230" fill="none" stroke="#38bdf8" strokeWidth={Math.max(2, 14 - progress * 0.1)} opacity={outcome?.isPreferred ? 0.75 : 0.25} />
          <rect x="328" y="294" width="104" height="22" rx="8" fill="#475569" />
          <path d="M348 326 Q360 298 372 326 M388 326 Q400 298 412 326" stroke="#f97316" strokeWidth="8" fill="none" opacity={progress / 100} />
          {[0, 1, 2].map((index) => <path key={index} d={`M${342 + index * 38} 206 Q${326 + index * 42} 164 ${348 + index * 36} 126`} fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="8 8" opacity={(progress / 100) * (outcome?.isPreferred ? 1 : 0.35)} />)}
          {progress > 75 && outcome?.isPreferred && Array.from({ length: 10 }, (_, index) => <rect key={index} x={332 + (index % 5) * 20} y={258 + Math.floor(index / 5) * 9} width="9" height="7" rx="2" fill="#fff" stroke="#cbd5e1" />)}
        </g>
      );
    }

    const shake = Math.sin((progress / 100) * Math.PI * 8) * 7;
    return (
      <g transform={`translate(${shake} 0)`}>
        <rect x="278" y="100" width="204" height="54" rx="14" fill="#f8fafc" stroke="#64748b" strokeWidth="5" />
        {Array.from({ length: 10 }, (_, index) => <line key={index} x1={294 + index * 19} y1="106" x2={294 + index * 19} y2="148" stroke="#94a3b8" />)}
        {Array.from({ length: 8 }, (_, index) => <circle key={index} cx={306 + index * 22} cy={91 - (index % 2) * 8} r={8 + (index % 3)} fill="#94a3b8" opacity={outcome?.isPreferred ? 1 : 0.45} />)}
        {Array.from({ length: 18 }, (_, index) => <circle key={index} cx={300 + (index % 9) * 21} cy={166 + (progress / 100) * (70 + (index % 3) * 10)} r="3" fill="#eab308" opacity={(progress / 100) * (outcome?.isPreferred ? 0.9 : 0.25)} />)}
        <path d="M286 284 H474 L454 330 H306 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="3" />
      </g>
    );
  })();

  const graph = (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-sm font-black text-slate-900">เปรียบเทียบผลการแยกสาร</h3><p className="text-xs font-semibold text-slate-500">สีน้ำเงิน = ได้คืน สีเขียว = ความบริสุทธิ์</p></div><span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-black text-orange-700">{trials.length} รอบ</span></div>
      <div className="flex min-h-[180px] items-end gap-3 overflow-x-auto rounded-xl bg-slate-50 px-4 pb-8 pt-4">
        {trials.length === 0 ? <p className="m-auto text-sm font-bold text-slate-400">ทดลองหนึ่งรอบเพื่อเริ่มสร้างกราฟ</p> : trials.map((trial) => (
          <div key={trial.index} className="relative flex h-[140px] min-w-16 items-end justify-center gap-1 border-b border-slate-300">
            <div className="w-5 rounded-t bg-blue-500" style={{ height: `${trial.recoveryPercent}%` }} title={`ได้คืน ${trial.recoveryPercent}%`} />
            <div className="w-5 rounded-t bg-emerald-500" style={{ height: `${trial.purityPercent}%` }} title={`บริสุทธิ์ ${trial.purityPercent}%`} />
            <span className="absolute -bottom-6 text-[11px] font-black text-slate-500">#{trial.index}</span>
          </div>
        ))}
      </div>
    </section>
  );

  const table = (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h3 className="text-sm font-black text-slate-900">ตารางผลการทดลอง</h3><button type="button" onClick={() => setTrials([])} disabled={trials.length === 0} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-black text-slate-500 hover:bg-slate-50 disabled:opacity-40"><Eraser className="h-4 w-4" />ล้างตาราง</button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">ครั้ง</th><th className="px-4 py-3">สารผสม</th><th className="px-4 py-3">วิธี</th><th className="px-4 py-3">ได้คืน</th><th className="px-4 py-3">บริสุทธิ์</th><th className="px-4 py-3">สรุป</th></tr></thead><tbody className="divide-y divide-slate-100 font-semibold text-slate-700">{trials.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">เลือกสารผสมและวิธีเพื่อเริ่มทดลอง</td></tr> : trials.map((trial) => <tr key={trial.index}><td className="px-4 py-3">{trial.index}</td><td className="px-4 py-3">{trial.mixtureLabel}</td><td className="px-4 py-3 font-black">{trial.methodLabel}</td><td className="px-4 py-3">{trial.recoveryPercent}%</td><td className="px-4 py-3">{trial.purityPercent}%</td><td className={`px-4 py-3 font-black ${trial.isPreferred ? "text-emerald-700" : "text-amber-700"}`}>{trial.isPreferred ? "เหมาะสม" : "แยกได้บางส่วน"}</td></tr>)}</tbody></table></div>
    </section>
  );

  const controls = (
    <div className="grid gap-4 xl:grid-cols-[minmax(220px,0.75fr)_minmax(0,1.25fr)_auto] xl:items-end">
      <label className="block"><span className="mb-2 block text-xs font-black text-slate-600">เลือกสารผสม</span><select value={mixture} onChange={(event) => { setMixture(event.target.value as MixtureType); resetCurrentTrial(); }} disabled={isRunning} className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50">{MIXTURES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
      <div><span className="mb-2 block text-xs font-black text-slate-600">เลือกวิธีแยกสาร</span><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{METHODS.map((option) => { const Icon = option.icon; return <button key={option.id} type="button" onClick={() => startSeparation(option.id)} disabled={isRunning} aria-pressed={method === option.id} className={`${buttonBase} ${method === option.id ? "border-orange-500 bg-orange-50 text-orange-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}><Icon className={`h-4 w-4 ${option.color}`} />{option.label}</button>; })}</div></div>
      <div className="grid grid-cols-2 gap-2 sm:flex"><button type="button" onClick={resetCurrentTrial} className={`${buttonBase} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}><RotateCcw className="h-4 w-4" />รีเซ็ต</button><button type="button" onClick={handleSave} disabled={isSaving || trials.length === 0} className={`${buttonBase} border-orange-600 bg-orange-600 text-white hover:bg-orange-700`}><Save className="h-4 w-4" />{isSaving ? "กำลังบันทึก..." : "บันทึกผล"}</button></div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="orange"
      labId={labId}
      category="Chemistry"
      title="การผสมและแยกสาร"
      subtitle="เปรียบเทียบวิธีแยกสารจากสมบัติทางกายภาพ เช่น ความเป็นแม่เหล็ก ขนาดอนุภาค และการระเหย"
      statusLabel={resultText}
      icon={Beaker}
      sceneTitle="สถานีแยกสาร"
      scene={<div className="h-full min-h-[310px] overflow-hidden rounded-2xl border border-orange-100 bg-[#fffaf3]"><svg viewBox="0 0 760 380" className="h-full w-full" role="img" aria-labelledby={`${titleId} ${descriptionId}`}><title id={titleId}>{`การแยก${mixtureOption.label}ด้วย${methodOption?.label ?? "วิธีที่เลือก"}`}</title><desc id={descriptionId}>แสดงอุปกรณ์และการเคลื่อนที่ของส่วนประกอบตามวิธีแยกสาร พร้อมค่าการได้คืนและความบริสุทธิ์</desc><defs><linearGradient id={glassGradientId} x1="0" x2="1"><stop offset="0" stopColor="#e0f2fe" stopOpacity="0.75" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.35" /><stop offset="1" stopColor="#bae6fd" stopOpacity="0.75" /></linearGradient></defs><rect width="760" height="380" fill="#fffaf3" /><path d="M0 340 H760" stroke="#fed7aa" strokeWidth="4" /><rect x="36" y="54" width="178" height="128" rx="20" fill="#fff" stroke="#fed7aa" strokeWidth="2" /><text x="125" y="84" textAnchor="middle" fontSize="13" fontWeight="800" fill="#9a3412">สารผสม</text><text x="125" y="111" textAnchor="middle" fontSize="15" fontWeight="900" fill="#0f172a">{mixtureOption.label}</text><text x="125" y="140" textAnchor="middle" fontSize="12" fontWeight="700" fill="#64748b">สมบัติที่ควรใช้</text><text x="125" y="161" textAnchor="middle" fontSize="13" fontWeight="900" fill="#c2410c">{mixtureOption.property}</text>{apparatus}<g transform="translate(562 62)"><rect width="162" height="174" rx="22" fill="#fff" stroke="#fed7aa" strokeWidth="2" /><text x="81" y="31" textAnchor="middle" fontSize="12" fontWeight="800" fill="#64748b">ความคืบหน้า</text><text x="81" y="65" textAnchor="middle" fontSize="26" fontWeight="900" fill="#ea580c">{Math.round(progress)}%</text><rect x="22" y="82" width="118" height="10" rx="5" fill="#ffedd5" /><rect x="22" y="82" width={118 * (progress / 100)} height="10" rx="5" fill="#f97316" /><text x="81" y="124" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">ได้คืน / บริสุทธิ์</text><text x="81" y="149" textAnchor="middle" fontSize="15" fontWeight="900" fill="#0f172a">{outcome ? `${outcome.recoveryPercent}% / ${outcome.purityPercent}%` : "- / -"}</text></g></svg></div>}
      controlsTitle="เลือกสารผสมและวิธีแยก"
      controls={controls}
      compactControls={controls}
      metrics={[
        { label: "สารผสม", value: mixtureOption.label, tone: "orange" },
        { label: "วิธีที่เลือก", value: methodOption?.label ?? "ยังไม่เลือก", tone: "blue" },
        { label: "การได้คืน", value: outcome ? `${outcome.recoveryPercent}%` : "-", tone: "emerald" },
        { label: "ความบริสุทธิ์", value: outcome ? `${outcome.purityPercent}%` : "-", tone: "violet" },
      ]}
      graph={graph}
      table={table}
      theory={<p className="leading-relaxed text-slate-600">สารผสมยังคงสมบัติของส่วนประกอบเดิม เราจึงเลือกวิธีแยกจากสมบัติที่ต่างกัน เช่น แม่เหล็กดูดเหล็ก ตัวกรองกั้นอนุภาคขนาดใหญ่ การระเหยแยกตัวทำละลาย และตะแกรงแยกเม็ดต่างขนาด ค่าร้อยละในแบบจำลองใช้สำหรับเปรียบเทียบ ไม่ใช่ผลผลิตจริงของทุกห้องทดลอง</p>}
      steps={[
        { label: "เลือกสารผสมที่ต้องการศึกษา", icon: Beaker },
        { label: "เลือกวิธีและดูอุปกรณ์ทำงาน", icon: CirclePlay },
        { label: "เปรียบเทียบการได้คืนและความบริสุทธิ์", icon: ScanLine },
      ]}
      learningGoals={["เลือกวิธีแยกสารจากสมบัติของส่วนประกอบ", "เปรียบเทียบวิธีที่เหมาะสมและไม่เหมาะสม", "อ่านค่าการได้คืนและความบริสุทธิ์จากหลักฐาน"]}
      progressLabel="การสำรวจอิสระ"
      progressValue={`ทดลองแล้ว ${trials.length} รอบ`}
      progressPercent={Math.min(100, trials.length * 10)}
      tips={["ลองใช้วิธีเดียวกันกับสารผสมหลายชนิดแล้วเปรียบเทียบ", "ผลที่ไม่สำเร็จยังเป็นหลักฐานว่าควรเลือกสมบัติอื่นในการแยก"]}
      showSaveButton={true}
      onRun={() => method && startSeparation(method)}
      runLabel={isRunning ? "กำลังแยกสาร" : "เริ่มทดลอง"}
      runActive={isRunning}
      runDisabled={!method || isRunning}
      onReset={resetCurrentTrial}
      onSave={handleSave}
    />
  );
}
