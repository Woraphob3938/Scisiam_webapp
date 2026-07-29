"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CirclePlay,
  ClipboardPlus,
  Droplets,
  Eraser,
  Thermometer,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import CompactRangeControl from "@/components/labs/simulation/CompactRangeControl";
import { getMatterPhase } from "@/lib/simulations/elementaryChemistry";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

type MatterObservation = {
  index: number;
  elapsedSeconds: number;
  temperatureC: number;
  phaseId: "solid" | "liquid" | "gas";
  phaseLabel: string;
  spacing: string;
};

const PARTICLES = Array.from({ length: 36 }, (_, index) => ({
  id: index,
  column: index % 9,
  row: Math.floor(index / 9),
  phaseOffset: ((index * 37) % 360) * (Math.PI / 180),
}));

const phaseColors = {
  solid: "#6366f1",
  liquid: "#2563eb",
  gas: "#0d9488",
} as const;

function wrap(value: number, span: number) {
  return ((value % span) + span) % span;
}

export default function StatesOfMatterSimulation() {
  const labId = "states-of-matter";
  const svgId = useId().replaceAll(":", "");
  const titleId = `matter-title-${svgId}`;
  const descriptionId = `matter-description-${svgId}`;
  const chamberGradientId = `matter-chamber-${svgId}`;
  const [temperatureC, setTemperatureC] = useState(-20);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [observations, setObservations] = useState<MatterObservation[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimestampRef = useRef(0);
  const elapsedRef = useRef(0);
  const lastPublishedRef = useRef(0);

  const phase = useMemo(() => getMatterPhase(temperatureC), [temperatureC]);

  useEffect(() => {
    if (!isRunning) return;

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === 0) lastTimestampRef.current = timestamp;
      const deltaSeconds = Math.min(
        0.05,
        Math.max(0, (timestamp - lastTimestampRef.current) / 1000),
      );
      lastTimestampRef.current = timestamp;
      elapsedRef.current += deltaSeconds;

      if (elapsedRef.current - lastPublishedRef.current >= 0.1) {
        lastPublishedRef.current = elapsedRef.current;
        setElapsedSeconds(elapsedRef.current);
      }

      animationRef.current = window.requestAnimationFrame(tick);
    };

    animationRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = null;
      lastTimestampRef.current = 0;
    };
  }, [isRunning]);

  const particlePositions = useMemo(() => {
    return PARTICLES.map((particle) => {
      if (phase.id === "solid") {
        const vibration = Math.sin(elapsedSeconds * 8 + particle.phaseOffset) * 1.8;
        return {
          ...particle,
          x: 250 + particle.column * 31 + vibration,
          y: 235 + particle.row * 27 + vibration * 0.5,
        };
      }

      if (phase.id === "liquid") {
        const drift = elapsedSeconds * (12 + (particle.id % 4) * 2);
        return {
          ...particle,
          x: 218 + wrap(particle.column * 38 + drift, 324),
          y:
            210 +
            particle.row * 25 +
            Math.sin(elapsedSeconds * 2.4 + particle.phaseOffset) * 10,
        };
      }

      const horizontal = elapsedSeconds * (28 + (particle.id % 5) * 3);
      const vertical = elapsedSeconds * (19 + (particle.id % 4) * 2);
      return {
        ...particle,
        x: 205 + wrap(particle.column * 47 + horizontal, 350),
        y: 78 + wrap(particle.row * 69 + vertical + particle.id * 13, 230),
      };
    });
  }, [elapsedSeconds, phase.id]);

  const handleToggle = () => {
    lastTimestampRef.current = 0;
    setIsRunning((running) => !running);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTemperatureC(-20);
    setElapsedSeconds(0);
    setObservations([]);
    elapsedRef.current = 0;
    lastPublishedRef.current = 0;
    lastTimestampRef.current = 0;
  };

  const handleSave = async () => {
    const savedObservations = observations.length > 0
      ? observations
      : [{
          index: 1,
          elapsedSeconds: Number(elapsedSeconds.toFixed(1)),
          temperatureC,
          phaseId: phase.id,
          phaseLabel: phase.thaiLabel,
          spacing: phase.spacing,
        }];
    if (observations.length === 0) setObservations(savedObservations);

    await saveExperimentAndSync({
        localStorageKey: "scisiam_saved_states_of_matter_experiment",
        localPayload: {
          labId,
          timestamp: new Date().toISOString(),
          observations: savedObservations,
        },
        labId,
        title: "สถานะของสสาร",
        variables: { temperatureC },
        liveValues: {
          elapsedSeconds,
          phase: phase.id,
          motionLevel: phase.motionLevel,
        },
        graphPoints: savedObservations.map(({ index, temperatureC: value, phaseId }) => ({
          index,
          temperatureC: value,
          phase: phaseId,
        })),
        tableRows: savedObservations,
        summary: {
          observationsCount: savedObservations.length,
          latestPhase: phase.thaiLabel,
        },
        durationSeconds: Math.round(elapsedSeconds),
    });
  };

  const graph = (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-black text-slate-900">กราฟอุณหภูมิและสถานะ</h3>
          <p className="text-xs font-semibold leading-relaxed text-slate-500">
            เส้นประแสดงจุดเยือกแข็ง 0 °C และจุดเดือด 100 °C
          </p>
        </div>
        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">
          {observations.length} จุด
        </span>
      </div>
      <svg viewBox="0 0 620 230" className="h-auto w-full" role="img" aria-label="กราฟอุณหภูมิจากการสังเกต">
        <rect x="52" y="18" width="540" height="170" rx="12" fill="#f8fafc" />
        {[0, 100].map((value) => {
          const y = 178 - ((value + 20) / 140) * 145;
          return (
            <g key={value}>
              <line x1="52" y1={y} x2="592" y2={y} stroke="#94a3b8" strokeDasharray="6 6" />
              <text x="45" y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">{value}°</text>
            </g>
          );
        })}
        <line x1="52" y1="188" x2="592" y2="188" stroke="#cbd5e1" />
        <line x1="52" y1="18" x2="52" y2="188" stroke="#cbd5e1" />
        {observations.length > 1 && (
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinejoin="round"
            points={observations.map((item, index) => {
              const x = 72 + (index / Math.max(1, observations.length - 1)) * 500;
              const y = 178 - ((item.temperatureC + 20) / 140) * 145;
              return `${x},${y}`;
            }).join(" ")}
          />
        )}
        {observations.map((item, index) => {
          const x = 72 + (index / Math.max(1, observations.length - 1)) * 500;
          const y = 178 - ((item.temperatureC + 20) / 140) * 145;
          return <circle key={`${item.index}-${item.phaseId}`} cx={x} cy={y} r="6" fill={phaseColors[item.phaseId]} />;
        })}
        <text x="322" y="218" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">ลำดับการสังเกต</text>
      </svg>
    </section>
  );

  const table = (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-black text-slate-900">ตารางการสังเกต</h3>
        <button type="button" onClick={() => setObservations([])} disabled={observations.length === 0} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-black text-slate-500 hover:bg-slate-50 disabled:opacity-40">
          <Eraser className="h-4 w-4" /> ล้างตาราง
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr><th className="px-4 py-3">ครั้ง</th><th className="px-4 py-3">เวลา</th><th className="px-4 py-3">อุณหภูมิ</th><th className="px-4 py-3">สถานะ</th><th className="px-4 py-3">การเรียงตัว</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {observations.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">ปรับอุณหภูมิแล้วกดบันทึกการสังเกต</td></tr>
            ) : observations.map((item) => (
              <tr key={item.index}><td className="px-4 py-3">{item.index}</td><td className="px-4 py-3">{item.elapsedSeconds.toFixed(1)} วินาที</td><td className="px-4 py-3">{item.temperatureC} °C</td><td className="px-4 py-3 font-black" style={{ color: phaseColors[item.phaseId] }}>{item.phaseLabel}</td><td className="px-4 py-3">{item.spacing}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const compactControls = (
    <CompactRangeControl label="อุณหภูมิของสาร" symbol="T" value={temperatureC} min={-20} max={120} step={1} precision={0} unit="°C" tone="blue" onChange={setTemperatureC} />
  );

  return (
    <SharedSimulationShell
      accent="blue"
      labId={labId}
      category="Chemistry"
      title="สถานะของสสาร"
      subtitle="ปรับอุณหภูมิแล้วสังเกตการจัดเรียงและการเคลื่อนที่ของอนุภาคในของแข็ง ของเหลว และแก๊ส"
      statusLabel={isRunning ? "กำลังจำลองอนุภาค" : `ขณะนี้เป็น${phase.thaiLabel}`}
      icon={Droplets}
      sceneTitle="ห้องสังเกตอนุภาค"
      scene={
        <div className="h-full min-h-[310px] overflow-hidden rounded-2xl border border-blue-100 bg-[#f7fbff]">
          <svg viewBox="0 0 760 380" className="h-full w-full" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
            <title id={titleId}>{`แบบจำลองอนุภาคของ${phase.thaiLabel}`}</title>
            <desc id={descriptionId}>อนุภาคเปลี่ยนการจัดเรียงและความเร็วตามอุณหภูมิ โดยใช้แบบจำลองน้ำที่ความดันปกติ</desc>
            <defs><linearGradient id={chamberGradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor={phase.id === "gas" ? "#ccfbf1" : "#dbeafe"} /></linearGradient></defs>
            <rect width="760" height="380" fill="#f7fbff" />
            <rect x="176" y="38" width="414" height="300" rx="28" fill={`url(#${chamberGradientId})`} stroke="#93c5fd" strokeWidth="4" />
            <path d="M176 118 H590 M176 198 H590 M176 278 H590" stroke="#bfdbfe" strokeDasharray="5 10" />
            <g transform="translate(76 74)"><rect width="64" height="232" rx="30" fill="#fff" stroke="#cbd5e1" strokeWidth="4" /><rect x="26" y="34" width="12" height="154" rx="6" fill="#dbeafe" /><rect x="26" y={188 - ((temperatureC + 20) / 140) * 154} width="12" height={((temperatureC + 20) / 140) * 154} rx="6" fill={temperatureC >= 100 ? "#f43f5e" : temperatureC >= 0 ? "#3b82f6" : "#6366f1"} /><circle cx="32" cy="202" r="19" fill={temperatureC >= 100 ? "#f43f5e" : temperatureC >= 0 ? "#3b82f6" : "#6366f1"} /><text x="32" y="262" textAnchor="middle" fontSize="17" fontWeight="900" fill="#0f172a">{temperatureC}°C</text></g>
            {phase.id === "liquid" && <path d="M180 185 Q383 170 586 185 V334 H180 Z" fill="#60a5fa" opacity="0.18" />}
            {phase.id === "solid" && <rect x="190" y="220" width="386" height="112" rx="18" fill="#c7d2fe" opacity="0.35" />}
            {particlePositions.map((particle) => <circle key={particle.id} cx={particle.x} cy={particle.y} r={phase.id === "gas" ? 7 : 8} fill={phaseColors[phase.id]} opacity="0.88" />)}
            <g transform="translate(616 74)"><rect width="112" height="116" rx="18" fill="#fff" stroke="#dbeafe" strokeWidth="2" /><text x="56" y="30" textAnchor="middle" fontSize="12" fontWeight="800" fill="#64748b">สถานะ</text><text x="56" y="62" textAnchor="middle" fontSize="20" fontWeight="900" fill={phaseColors[phase.id]}>{phase.thaiLabel}</text><text x="56" y="88" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">การเคลื่อนที่</text><text x="56" y="106" textAnchor="middle" fontSize="12" fontWeight="900" fill="#0f172a">{Math.round(phase.motionLevel * 100)}%</text></g>
          </svg>
        </div>
      }
      controlsTitle="แผงควบคุมอุณหภูมิ"
      compactControls={compactControls}
      metrics={[
        { label: "อุณหภูมิ", value: `${temperatureC} °C`, tone: "blue" },
        { label: "สถานะ", value: phase.thaiLabel, tone: phase.id === "gas" ? "emerald" : "violet" },
        { label: "การเรียงตัว", value: phase.spacing, tone: "cyan" },
        { label: "เวลาจำลอง", value: `${elapsedSeconds.toFixed(1)} วินาที`, tone: "orange" },
      ]}
      graph={graph}
      table={table}
      theory={<p className="leading-relaxed text-slate-600">เมื่อสารได้รับหรือสูญเสียพลังงาน อนุภาคจะเปลี่ยนความเร็วและการจัดเรียง แบบจำลองนี้ใช้ขอบเขตของน้ำที่ความดันปกติ: ต่ำกว่า 0 °C เป็นของแข็ง ตั้งแต่ 0 ถึงต่ำกว่า 100 °C เป็นของเหลว และตั้งแต่ 100 °C เป็นแก๊ส</p>}
      steps={[
        { label: "เลือกอุณหภูมิที่ต้องการสังเกต", icon: Thermometer },
        { label: "เริ่มการเคลื่อนที่และเปรียบเทียบอนุภาค", icon: CirclePlay },
        { label: "บันทึกผลหลายอุณหภูมิลงตาราง", icon: ClipboardPlus },
      ]}
      learningGoals={["แยกความแตกต่างของของแข็ง ของเหลว และแก๊สจากอนุภาค", "เชื่อมอุณหภูมิกับการเปลี่ยนสถานะ", "ใช้หลักฐานจากกราฟและตารางอธิบายผล"]}
      progressLabel="การสำรวจอิสระ"
      progressValue={`บันทึกแล้ว ${observations.length} ครั้ง`}
      progressPercent={Math.min(100, observations.length * 10)}
      tips={["ทดลองบันทึกที่ -10, 25 และ 110 °C เพื่อเปรียบเทียบครบสามสถานะ", "การเปลี่ยนสถานะจริงขึ้นกับชนิดสารและความดันด้วย"]}
      showSaveButton={true}
      onRun={handleToggle}
      runLabel={isRunning ? "หยุดทดลอง" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}

