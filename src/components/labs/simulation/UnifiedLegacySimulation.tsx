"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import {
  Atom,
  Beaker,
  BookOpen,
  ClipboardList,
  Gauge,
  Play,
  Sliders,
  Target,
  Waves,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { BoundedNumberInput } from "@/components/labs/simulation/ManualNumberInput";
import { GasChamber3DScene } from "@/components/labs/simulation/IdealGasLawSimulation";
import { MotionTrackScene } from "@/components/labs/simulation/NewtonsSecondLawSimulation";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

export type UnifiedLegacyLabId =
  | "acid-base-titration"
  | "boyles-law"
  | "charles-law"
  | "ideal-gas-law"
  | "newtons-second-law"
  | "snells-law";

type ControlKey =
  | "acidConc"
  | "acidVolume"
  | "baseConc"
  | "baseVolume"
  | "volume"
  | "temperature"
  | "moles"
  | "force"
  | "mass"
  | "angle"
  | "n1"
  | "n2";

type ControlConfig = {
  key: ControlKey;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
  accent: string;
};

type LabConfig = {
  accent: "blue" | "cyan" | "emerald" | "orange" | "rose" | "violet";
  category: string;
  title: string;
  subtitle: string;
  sceneTitle: string;
  icon: typeof Beaker;
  controls: ControlConfig[];
  initial: Partial<Record<ControlKey, number>>;
  goals: string[];
  tips: string[];
  equation: string;
};

const configs: Record<UnifiedLegacyLabId, LabConfig> = {
  "acid-base-titration": {
    accent: "cyan",
    category: "Chemistry",
    title: "Acid-Base Titration Lab",
    subtitle: "จำลองการหยดสารมาตรฐานจากบิวเรต อ่านค่า pH และหาจุดสมมูลจากกราฟแบบ Real-time",
    sceneTitle: "ห้องทดลองไทเทรตกรด-เบส",
    icon: Beaker,
    controls: [
      { key: "acidConc", label: "ความเข้มข้นกรด", min: 0.05, max: 0.2, step: 0.01, suffix: "M", accent: "accent-rose-500" },
      { key: "acidVolume", label: "ปริมาตรกรด", min: 10, max: 50, step: 1, suffix: "ml", accent: "accent-blue-500" },
      { key: "baseConc", label: "ความเข้มข้นเบส", min: 0.05, max: 0.2, step: 0.01, suffix: "M", accent: "accent-emerald-500" },
      { key: "baseVolume", label: "ปริมาตรเบสที่เติม", min: 0, max: 55, step: 0.5, suffix: "ml", accent: "accent-cyan-500" },
    ],
    initial: { acidConc: 0.1, acidVolume: 25, baseConc: 0.1, baseVolume: 0 },
    goals: ["เข้าใจจุดสมมูลของกรด-เบส", "อ่านค่า pH จากปริมาตรเบสที่เติม", "เชื่อมโยงสีอินดิเคเตอร์กับค่า pH", "ใช้สมการ MaVa = MbVb เพื่อสรุปผล"],
    tips: ["เพิ่มเบสช้า ๆ เมื่อเข้าใกล้จุดสมมูล", "สังเกตทั้งกราฟ ค่า pH และสีสารละลาย", "เปลี่ยนความเข้มข้นเพื่อดูผลต่อปริมาตรสมมูล"],
    equation: "MaVa = MbVb",
  },
  "boyles-law": {
    accent: "violet",
    category: "Chemistry",
    title: "Boyle's Gas Law Lab",
    subtitle: "ทดลองความสัมพันธ์ระหว่างความดันและปริมาตรของแก๊สที่อุณหภูมิคงที่",
    sceneTitle: "กระบอกสูบแก๊สอุณหภูมิคงที่",
    icon: Gauge,
    controls: [
      { key: "volume", label: "ปริมาตรแก๊ส", min: 1, max: 8, step: 0.1, suffix: "L", accent: "accent-violet-500" },
      { key: "temperature", label: "อุณหภูมิ", min: 273, max: 373, step: 1, suffix: "K", accent: "accent-orange-500" },
      { key: "moles", label: "จำนวนโมล", min: 0.05, max: 0.3, step: 0.01, suffix: "mol", accent: "accent-blue-500" },
    ],
    initial: { volume: 4, temperature: 300, moles: 0.14 },
    goals: ["เห็นว่า P เพิ่มเมื่อ V ลดลง", "ควบคุมตัวแปรอุณหภูมิให้คงที่", "อ่านกราฟ P-V ของแก๊ส", "ใช้ PV = nRT ในการคำนวณ"],
    tips: ["ลดปริมาตรทีละน้อยแล้วสังเกตความดัน", "คงอุณหภูมิไว้ใกล้เดิมเพื่อดู Boyle ชัดขึ้น", "เปรียบเทียบค่า P×V ในหลายจุด"],
    equation: "PV = nRT",
  },
  "charles-law": {
    accent: "orange",
    category: "Chemistry",
    title: "Charles's Temperature-Volume Lab",
    subtitle: "วิเคราะห์ความสัมพันธ์ระหว่างอุณหภูมิและปริมาตรของแก๊สเมื่อความดันคงที่",
    sceneTitle: "กระบอกแก๊สความดันคงที่",
    icon: Gauge,
    controls: [
      { key: "temperature", label: "อุณหภูมิ", min: 250, max: 420, step: 1, suffix: "K", accent: "accent-orange-500" },
      { key: "volume", label: "ปริมาตรเริ่มต้น", min: 1, max: 6, step: 0.1, suffix: "L", accent: "accent-blue-500" },
    ],
    initial: { temperature: 300, volume: 3 },
    goals: ["เห็นว่า V แปรผันตรงกับ T", "ใช้หน่วย Kelvin อย่างถูกต้อง", "อ่านกราฟ V-T", "อธิบายพฤติกรรมของแก๊สเมื่อได้รับความร้อน"],
    tips: ["เพิ่มอุณหภูมิแล้วสังเกตลูกสูบขยับขึ้น", "อย่าใช้ °C ในสมการโดยตรง", "เปรียบเทียบอัตราส่วน V/T"],
    equation: "V₁/T₁ = V₂/T₂",
  },
  "ideal-gas-law": {
    accent: "emerald",
    category: "Physics",
    title: "Ideal Gas Law Lab",
    subtitle: "จำลองความสัมพันธ์ของความดัน ปริมาตร อุณหภูมิ และจำนวนโมลตามสมการแก๊สอุดมคติ",
    sceneTitle: "ภาชนะโมเลกุลแก๊สจำลอง",
    icon: Atom,
    controls: [
      { key: "volume", label: "ปริมาตร", min: 1, max: 8, step: 0.1, suffix: "L", accent: "accent-emerald-500" },
      { key: "temperature", label: "อุณหภูมิ", min: 250, max: 450, step: 1, suffix: "K", accent: "accent-orange-500" },
      { key: "moles", label: "จำนวนโมล", min: 0.05, max: 0.35, step: 0.01, suffix: "mol", accent: "accent-blue-500" },
    ],
    initial: { volume: 4, temperature: 300, moles: 0.16 },
    goals: ["เชื่อมโยง P, V, n และ T", "ทำนายความดันจากสมการ PV=nRT", "สังเกตผลของจำนวนโมล", "อ่านค่าแก๊สจากกราฟและตาราง"],
    tips: ["เพิ่มอุณหภูมิหรือจำนวนโมลเพื่อดูความดันสูงขึ้น", "เพิ่มปริมาตรเพื่อดูความดันลดลง", "ลองเปลี่ยนทีละตัวแปรเพื่อสรุปง่ายขึ้น"],
    equation: "PV = nRT",
  },
  "newtons-second-law": {
    accent: "blue",
    category: "Physics",
    title: "Newton's Second Law Lab",
    subtitle: "ทดลองความสัมพันธ์ระหว่างแรง มวล และความเร่งของวัตถุตามกฎข้อที่สองของนิวตัน",
    sceneTitle: "รถทดลองบนรางตรง",
    icon: Waves,
    controls: [
      { key: "force", label: "แรงลัพธ์", min: 1, max: 20, step: 0.5, suffix: "N", accent: "accent-blue-500" },
      { key: "mass", label: "มวลวัตถุ", min: 0.5, max: 8, step: 0.1, suffix: "kg", accent: "accent-violet-500" },
    ],
    initial: { force: 8, mass: 2 },
    goals: ["เห็นว่า a เพิ่มเมื่อ F เพิ่ม", "เห็นว่า a ลดเมื่อ m เพิ่ม", "ใช้สมการ F=ma", "ตีความกราฟแรงกับความเร่ง"],
    tips: ["เพิ่มแรงโดยคงมวลไว้เพื่อดูความเร่ง", "เพิ่มมวลโดยคงแรงไว้เพื่อเห็นความเร่งลดลง", "เปรียบเทียบอัตราส่วน F/m"],
    equation: "F = ma",
  },
  "snells-law": {
    accent: "cyan",
    category: "Physics",
    title: "Snell's Law Refraction Lab",
    subtitle: "จำลองการหักเหของแสงเมื่อเดินทางผ่านตัวกลางต่างชนิดและตรวจสอบกฎของสเนลล์",
    sceneTitle: "โต๊ะทดลองรังสีแสง",
    icon: Waves,
    controls: [
      { key: "angle", label: "มุมตกกระทบ", min: 5, max: 75, step: 1, suffix: "°", accent: "accent-cyan-500" },
      { key: "n1", label: "ดัชนีหักเหตัวกลาง 1", min: 1, max: 1.8, step: 0.01, suffix: "", accent: "accent-blue-500" },
      { key: "n2", label: "ดัชนีหักเหตัวกลาง 2", min: 1.1, max: 2.2, step: 0.01, suffix: "", accent: "accent-violet-500" },
    ],
    initial: { angle: 35, n1: 1, n2: 1.5 },
    goals: ["เข้าใจกฎ n₁sinθ₁ = n₂sinθ₂", "สังเกตการเบนเข้าหาเส้นปกติ", "เปรียบเทียบตัวกลางต่างชนิด", "อ่านมุมตกกระทบและมุมหักเห"],
    tips: ["เพิ่ม n₂ เพื่อเห็นแสงหักเหเข้าหาเส้นปกติมากขึ้น", "ลองเพิ่มมุมตกกระทบแล้วดูมุมหักเห", "ระวังมุมวิกฤตเมื่อแสงออกจากตัวกลางหนาแน่น"],
    equation: "n₁sinθ₁ = n₂sinθ₂",
  },
};

const getValue = (values: Partial<Record<ControlKey, number>>, key: ControlKey) => values[key] ?? 0;
const toFixedSmart = (value: number, step = 0.1) => value.toFixed(step < 0.1 ? 2 : step < 1 ? 1 : 0);

function calculate(labId: UnifiedLegacyLabId, values: Partial<Record<ControlKey, number>>) {
  const R = 8.314;
  if (labId === "acid-base-titration") {
    const acidMoles = getValue(values, "acidConc") * getValue(values, "acidVolume") / 1000;
    const baseMoles = getValue(values, "baseConc") * getValue(values, "baseVolume") / 1000;
    const totalVolume = Math.max(0.000001, (getValue(values, "acidVolume") + getValue(values, "baseVolume")) / 1000);
    const diff = acidMoles - baseMoles;
    const ph = Math.abs(diff) < 0.0000003 ? 7 : diff > 0 ? -Math.log10(diff / totalVolume) : 14 + Math.log10(Math.abs(diff) / totalVolume);
    const equivalence = (getValue(values, "acidConc") * getValue(values, "acidVolume")) / Math.max(getValue(values, "baseConc"), 0.001);
    return { primary: Math.min(14, Math.max(0, ph)), secondary: equivalence, unit: "pH", secondaryUnit: "ml" };
  }
  if (labId === "newtons-second-law") {
    return { primary: getValue(values, "force") / Math.max(getValue(values, "mass"), 0.1), secondary: getValue(values, "force"), unit: "m/s²", secondaryUnit: "N" };
  }
  if (labId === "charles-law") {
    const baseTemp = 300;
    return { primary: getValue(values, "volume") * getValue(values, "temperature") / baseTemp, secondary: getValue(values, "temperature"), unit: "L", secondaryUnit: "K" };
  }
  if (labId === "snells-law") {
    const angle = getValue(values, "angle");
    const ratio = getValue(values, "n1") * Math.sin((angle * Math.PI) / 180) / Math.max(getValue(values, "n2"), 0.01);
    const refracted = Math.asin(Math.min(1, Math.max(-1, ratio))) * 180 / Math.PI;
    return { primary: refracted, secondary: angle, unit: "°", secondaryUnit: "°" };
  }
  const pressure = (getValue(values, "moles") * R * getValue(values, "temperature")) / Math.max(getValue(values, "volume"), 0.1);
  return { primary: pressure, secondary: getValue(values, "volume"), unit: "kPa", secondaryUnit: "L" };
}

function LabScene({
  labId,
  result,
  values,
  isRunning,
  elapsedSeconds,
}: {
  labId: UnifiedLegacyLabId;
  result: ReturnType<typeof calculate>;
  values: Partial<Record<ControlKey, number>>;
  isRunning: boolean;
  elapsedSeconds: number;
}) {
  const sceneId = useId().replace(/:/g, "");

  if (labId === "ideal-gas-law") {
    return (
      <GasChamber3DScene
        volume={getValue(values, "volume")}
        temperature={getValue(values, "temperature")}
        moles={getValue(values, "moles")}
        pressure={result.primary}
        isRunning={isRunning}
      />
    );
  }

  if (labId === "newtons-second-law") {
    return (
      <MotionTrackScene
        mass={getValue(values, "mass")}
        acceleration={result.primary}
        elapsedTime={elapsedSeconds}
      />
    );
  }

  const indicatorColor = result.primary < 6 ? "#fb7185" : result.primary < 8 ? "#86efac" : "#67e8f9";
  const volume = getValue(values, "volume");
  const pistonY = 292 - ((volume - 1) / 7) * 150;
  const charlesVolume = Math.max(1, Math.min(6, result.primary));
  const charlesPistonY = 286 - ((charlesVolume - 1) / 5) * 142;
  const baseVolume = getValue(values, "baseVolume");
  const buretteLevel = Math.max(48, 204 - baseVolume * 2.35);

  return (
    <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_48%,#ffffff_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      <div className="absolute left-4 top-4 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-left text-[11px] font-bold text-slate-500 shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-blue-600">live apparatus</p>
        <p>{configs[labId].sceneTitle}</p>
      </div>
      <svg
        className="relative z-10 h-full max-h-[430px] w-full max-w-[720px]"
        viewBox="0 0 720 430"
        fill="none"
        role="img"
        aria-labelledby={`${sceneId}-title ${sceneId}-description`}
      >
        <title id={`${sceneId}-title`}>{configs[labId].sceneTitle}</title>
        <desc id={`${sceneId}-description`}>อุปกรณ์ทดลองตอบสนองตามค่าที่ผู้เรียนกำหนดและแสดงผลลัพธ์ปัจจุบัน</desc>
        <ellipse cx="360" cy="355" rx="230" ry="28" fill="#dbeafe" opacity="0.7" />
        {labId === "snells-law" ? (
          <>
            <rect x="135" y="215" width="450" height="116" rx="18" fill="#dbeafe" opacity="0.9" />
            <line x1="360" y1="95" x2="360" y2="350" stroke="#94a3b8" strokeWidth="4" strokeDasharray="8 8" />
            <line x1="215" y1="120" x2="360" y2="215" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" />
            <line x1="360" y1="215" x2={360 + 170 * Math.sin((result.primary * Math.PI) / 180)} y2={215 + 170 * Math.cos((result.primary * Math.PI) / 180)} stroke="#2563eb" strokeWidth="7" strokeLinecap="round" />
            <circle cx="360" cy="215" r="9" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
            <text x="470" y="170" fill="#0f172a" fontSize="18" fontWeight="900">θ₂ {result.primary.toFixed(1)}°</text>
          </>
        ) : labId === "acid-base-titration" ? (
          <>
            <path d="M198 80H282M240 80V318" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
            <rect x="222" y="48" width="36" height="206" rx="16" fill="#ffffff" stroke="#64748b" strokeWidth="4" />
            <rect x="230" y={buretteLevel} width="20" height={244 - buretteLevel} rx="8" fill="#67e8f9" opacity="0.82" />
            {Array.from({ length: 8 }, (_, index) => (
              <line key={index} x1="222" x2={index % 2 === 0 ? 238 : 232} y1={72 + index * 22} y2={72 + index * 22} stroke="#94a3b8" strokeWidth="2" />
            ))}
            <path d="M240 254V278H270" stroke="#475569" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="270" cy="278" r="7" fill="#0891b2" />
            {baseVolume > 0 && <circle cx="270" cy="296" r="5" fill="#22d3ee" opacity={isRunning ? 1 : 0.55} />}
            <path d="M318 198H456L438 330H336L318 198Z" fill="#ffffff" stroke="#64748b" strokeWidth="5" strokeLinejoin="round" />
            <path d="M330 262C360 250 414 250 444 262L436 324H338L330 262Z" fill={indicatorColor} opacity="0.72" />
            <path d="M360 188V286" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
            <ellipse cx="388" cy="337" rx="82" ry="12" fill="#cbd5e1" opacity="0.65" />
            <g transform="translate(482 132)">
              <rect width="126" height="92" rx="18" fill="#0f172a" />
              <text x="63" y="24" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="800">pH SENSOR</text>
              <text x="63" y="57" textAnchor="middle" fill="#dcfce7" fontSize="28" fontWeight="900">{result.primary.toFixed(2)}</text>
              <text x="63" y="76" textAnchor="middle" fill="#67e8f9" fontSize="10" fontWeight="800">เติมเบส {baseVolume.toFixed(1)} ml</text>
            </g>
          </>
        ) : labId === "boyles-law" ? (
          <>
            <g transform="translate(222 52)">
              <rect x="0" y="32" width="224" height="252" rx="28" fill="#eef2ff" stroke="#64748b" strokeWidth="6" />
              <rect x="12" y={pistonY} width="200" height={276 - pistonY} rx="18" fill="#c4b5fd" opacity="0.7" />
              <rect x="-12" y={pistonY - 12} width="248" height="24" rx="12" fill="#475569" />
              <path d={`M112 ${pistonY - 12}V8`} stroke="#475569" strokeWidth="12" strokeLinecap="round" />
              <rect x="58" y="0" width="108" height="22" rx="11" fill="#94a3b8" />
              {Array.from({ length: 12 }, (_, index) => (
                <circle key={index} cx={32 + (index * 41) % 160} cy={pistonY + 30 + ((index * 29) % Math.max(36, 234 - pistonY))} r="6" fill="#7c3aed" opacity="0.78" />
              ))}
            </g>
            <g transform="translate(490 132)">
              <circle cx="60" cy="60" r="58" fill="#ffffff" stroke="#94a3b8" strokeWidth="6" />
              <path d="M60 60L91 35" stroke="#7c3aed" strokeWidth="7" strokeLinecap="round" />
              <circle cx="60" cy="60" r="7" fill="#0f172a" />
              <text x="60" y="94" textAnchor="middle" fill="#475569" fontSize="13" fontWeight="900">{result.primary.toFixed(1)} kPa</text>
              <text x="60" y="116" textAnchor="middle" fill="#7c3aed" fontSize="11" fontWeight="800">V = {volume.toFixed(1)} L</text>
            </g>
          </>
        ) : labId === "charles-law" ? (
          <>
            <rect x="188" y="238" width="348" height="104" rx="32" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="5" opacity="0.88" />
            <path d="M206 272C248 246 294 298 338 272C382 246 430 298 516 266" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" opacity="0.75" />
            <g transform="translate(278 54)">
              <rect x="0" y="24" width="168" height="244" rx="24" fill="#ffffff" stroke="#64748b" strokeWidth="6" />
              <rect x="10" y={charlesPistonY} width="148" height={258 - charlesPistonY} rx="16" fill="#fdba74" opacity="0.62" />
              <rect x="-10" y={charlesPistonY - 10} width="188" height="22" rx="11" fill="#475569" />
              <path d={`M84 ${charlesPistonY - 10}V4`} stroke="#475569" strokeWidth="10" strokeLinecap="round" />
              {Array.from({ length: 10 }, (_, index) => (
                <circle key={index} cx={24 + (index * 37) % 120} cy={charlesPistonY + 28 + ((index * 31) % Math.max(34, 218 - charlesPistonY))} r="6" fill="#f97316" opacity="0.78" />
              ))}
            </g>
            <g transform="translate(492 94)">
              <rect width="122" height="98" rx="18" fill="#fff7ed" stroke="#fdba74" strokeWidth="4" />
              <text x="61" y="28" textAnchor="middle" fill="#9a3412" fontSize="11" fontWeight="900">WATER BATH</text>
              <text x="61" y="59" textAnchor="middle" fill="#ea580c" fontSize="25" fontWeight="900">{getValue(values, "temperature").toFixed(0)} K</text>
              <text x="61" y="80" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="800">V = {result.primary.toFixed(2)} L</text>
            </g>
          </>
        ) : null}
      </svg>
    </div>
  );
}

function MiniGraph({ labId, values }: { labId: UnifiedLegacyLabId; values: Partial<Record<ControlKey, number>> }) {
  const points = useMemo(() => Array.from({ length: 18 }, (_, index) => {
    const nextValues = { ...values };
    const xKey: ControlKey =
      labId === "acid-base-titration"
        ? "baseVolume"
        : labId === "newtons-second-law"
          ? "force"
          : labId === "snells-law"
            ? "angle"
            : labId === "charles-law"
              ? "temperature"
              : "volume";
    nextValues[xKey] = configs[labId].controls.find((control) => control.key === xKey)?.min ?? 0;
    const control = configs[labId].controls.find((item) => item.key === xKey);
    const xValue = (control?.min ?? 0) + (index / 17) * ((control?.max ?? 1) - (control?.min ?? 0));
    nextValues[xKey] = xValue;
    return { x: xValue, y: calculate(labId, nextValues).primary };
  }), [labId, values]);
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const path = points.map((point, index) => {
    const x = 28 + (index / Math.max(points.length - 1, 1)) * 264;
    const y = 136 - ((point.y - minY) / Math.max(maxY - minY, 0.001)) * 112;
    return `${index === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  return (
    <section className="flex h-full min-h-[260px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Gauge className="h-4.5 w-4.5 text-blue-600" />
        กราฟผลการทดลอง
      </h3>
      <div className="min-h-0 flex-1 rounded-xl bg-slate-50/70 p-2">
        <svg className="h-full min-h-[150px] w-full" viewBox="0 0 320 160" fill="none" aria-hidden="true">
          <line x1="28" y1="136" x2="292" y2="136" stroke="#cbd5e1" strokeWidth="1.4" />
          <line x1="28" y1="20" x2="28" y2="136" stroke="#cbd5e1" strokeWidth="1.4" />
          {[24, 52, 80, 108].map((y) => <line key={y} x1="28" y1={y} x2="292" y2={y} stroke="#e2e8f0" />)}
          <path d={path} stroke="#2563eb" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="292" cy={136 - ((points.at(-1)?.y ?? 0) - minY) / Math.max(maxY - minY, 0.001) * 112} r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
        </svg>
      </div>
    </section>
  );
}

export default function UnifiedLegacySimulation({ labId }: { labId: UnifiedLegacyLabId }) {
  const config = configs[labId];
  const [values, setValues] = useState<Partial<Record<ControlKey, number>>>(config.initial);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const result = useMemo(() => calculate(labId, values), [labId, values]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => setElapsedSeconds((current) => current + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const updateValue = (key: ControlKey, value: number) => setValues((current) => ({ ...current, [key]: value }));
  const progressPercent = labId === "acid-base-titration"
    ? Math.min(100, (getValue(values, "baseVolume") / Math.max(result.secondary, 0.1)) * 100)
    : Math.min(100, (elapsedSeconds / 30) * 100);
  const timeLabel = `${Math.floor(elapsedSeconds / 60).toString().padStart(2, "0")}:${Math.floor(elapsedSeconds % 60).toString().padStart(2, "0")}`;

  const handleRunToggle = () => setIsRunning((current) => !current);
  const handleReset = () => {
    setValues(config.initial);
    setElapsedSeconds(0);
    setIsRunning(false);
  };

  const controls = (
    <div className="space-y-4">
      {config.controls.map((control) => (
        <label key={control.key} className="block">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>{control.label}</span>
            <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">
              {toFixedSmart(getValue(values, control.key), control.step)} {control.suffix}
            </span>
          </div>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={getValue(values, control.key)}
            onChange={(event) => updateValue(control.key, Number(event.target.value))}
            className={`h-1.5 w-full rounded-full bg-slate-100 ${control.accent}`}
          />
        </label>
      ))}
    </div>
  );

  const compactControls = (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {config.controls.map((control) => (
        <label key={control.key} className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="truncate text-xs font-black text-slate-700">{control.label}</span>
            <BoundedNumberInput
              ariaLabel={`กรอก${control.label}`}
              min={control.min}
              max={control.max}
              step={control.step}
              value={getValue(values, control.key)}
              onChange={(value) => updateValue(control.key, value)}
              className="h-7 w-20 rounded-lg border border-slate-200 bg-white px-2 text-right text-xs font-black text-slate-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={getValue(values, control.key)}
            onChange={(event) => updateValue(control.key, Number(event.target.value))}
            className={`h-1.5 w-full rounded-full bg-slate-100 ${control.accent}`}
          />
        </label>
      ))}
    </div>
  );

  const drawerSummary = (
    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
      {config.controls.map((control) => (
        <label key={control.key} className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
          <span className="block truncate opacity-75">{control.label}</span>
          <BoundedNumberInput
            ariaLabel={`กรอก${control.label}`}
            min={control.min}
            max={control.max}
            step={control.step}
            value={getValue(values, control.key)}
            onChange={(value) => updateValue(control.key, value)}
            className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white/80 px-2 text-right text-sm font-black text-slate-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
        </label>
      ))}
      <div className="rounded-xl bg-cyan-50 px-3 py-2 text-cyan-700">
        <span className="block opacity-75">เวลา</span>
        <span className="mt-1 block h-8 rounded-lg bg-white/60 px-2 py-1.5 text-right text-sm font-black">{timeLabel}</span>
      </div>
      <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
        <span className="block opacity-75">สถานะ</span>
        <span className="mt-1 block h-8 rounded-lg bg-white/60 px-2 py-1.5 text-right text-sm font-black">{isRunning ? "กำลังทดลอง" : "พร้อม"}</span>
      </div>
    </div>
  );

  const tableRows = config.controls.map((control) => ({
    label: control.label,
    value: `${toFixedSmart(getValue(values, control.key), control.step)} ${control.suffix}`,
  }));

  return (
    <SharedSimulationShell
      accent={config.accent}
      labId={labId}
      category={config.category}
      title={config.title}
      subtitle={config.subtitle}
      statusLabel={isRunning ? "กำลังจำลอง" : "พร้อมทดลอง"}
      icon={config.icon}
      sceneTitle={config.sceneTitle}
      scene={
        <LabScene
          labId={labId}
          result={result}
          values={values}
          isRunning={isRunning}
          elapsedSeconds={elapsedSeconds}
        />
      }
      controlsTitle="แผงควบคุมการทดลอง"
      controls={controls}
      compactControls={compactControls}
      onRun={handleRunToggle}
      runLabel={isRunning ? "หยุดชั่วคราว" : "เริ่มทดลอง"}
      runActive={isRunning}
      onReset={handleReset}
      drawerSummary={drawerSummary}
      metrics={[
        { label: "ค่าหลัก", value: `${result.primary.toFixed(2)} ${result.unit}`, tone: config.accent },
        { label: "ค่าอ้างอิง", value: `${result.secondary.toFixed(2)} ${result.secondaryUnit}`, tone: "blue" },
        { label: "เวลา", value: timeLabel, tone: "cyan" },
        { label: "สถานะ", value: isRunning ? "กำลังทดลอง" : "พร้อม", tone: isRunning ? "orange" : "emerald" },
      ]}
      graph={<MiniGraph labId={labId} values={values} />}
      table={
        <section className="min-h-[260px] rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
          <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
            <ClipboardList className="h-4.5 w-4.5 text-blue-600" />
            ตารางค่าตัวแปร
          </h3>
          <div className="grid gap-2">
            {tableRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold">
                <span className="text-slate-500">{row.label}</span>
                <span className="text-slate-900">{row.value}</span>
              </div>
            ))}
          </div>
        </section>
      }
      theory={
        <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
          <h2 className="mb-3 flex items-center gap-2 text-base font-black text-slate-900">
            <BookOpen className="h-5 w-5 text-blue-600" />
            ทฤษฎีและสมการ
          </h2>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-center font-mono text-2xl font-black text-slate-900">{config.equation}</div>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500">{config.subtitle}</p>
        </section>
      }
      steps={[
        { label: "ตั้งค่าตัวแปร", icon: Sliders },
        { label: "เริ่มจำลอง", icon: Play },
        { label: "สังเกตค่า", icon: Gauge },
        { label: "อ่านกราฟ", icon: ClipboardList },
        { label: "สรุปผล", icon: Target },
      ]}
      learningGoals={config.goals}
      progressLabel="ความคืบหน้าการทดลอง"
      progressValue={`${progressPercent.toFixed(0)}%`}
      progressPercent={progressPercent}
      tips={config.tips}
      onSave={async () => {
        await saveExperimentAndSync({
          localStorageKey: `scisiam_saved_${labId}_experiment`,
          localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), values, result },
          labId,
          title: config.title,
          variables: values,
          liveValues: { result: result.primary, elapsedSeconds },
          graphPoints: [],
          tableRows,
          summary: { result: result.primary, equation: config.equation },
          score: Math.round(progressPercent),
          durationSeconds: elapsedSeconds,
        });
      }}
    />
  );
}

