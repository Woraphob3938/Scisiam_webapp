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

function AcidBaseTitrationScene({
  ph,
  baseVolume,
  isRunning,
}: {
  ph: number;
  baseVolume: number;
  isRunning: boolean;
}) {
  const sceneId = useId().replace(/:/g, "");
  const buretteLevel = Math.max(76, 238 - baseVolume * 2.7);
  const solutionColor = ph < 6 ? "#fb7185" : ph < 8 ? "#86efac" : "#67e8f9";

  return (
    <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f8fcff_0%,#eef9ff_72%,#e2e8f0_72%,#f8fafc_100%)]">
      <svg
        className="h-full max-h-[430px] w-full max-w-[760px]"
        viewBox="0 0 720 430"
        fill="none"
        role="img"
        data-testid="acid-base-titration-apparatus"
        aria-labelledby={`${sceneId}-title ${sceneId}-description`}
      >
        <title id={`${sceneId}-title`}>ชุดทดลองไทเทรตกรด-เบส</title>
        <desc id={`${sceneId}-description`}>
          บิวเรตหยดสารละลายเบสลงในขวดรูปชมพู่ซึ่งมีโพรบวัดพีเอช สีสารละลายและค่าพีเอชเปลี่ยนตามปริมาตรเบสที่เติม
        </desc>
        <defs>
          <linearGradient id={`${sceneId}-glass`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.94" />
            <stop offset="1" stopColor="#dbeafe" stopOpacity="0.5" />
          </linearGradient>
          <filter id={`${sceneId}-shadow`} x="-25%" y="-30%" width="150%" height="180%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0f172a" floodOpacity="0.16" />
          </filter>
        </defs>

        <ellipse cx="380" cy="365" rx="250" ry="22" fill="#94a3b8" opacity="0.2" />

        <g filter={`url(#${sceneId}-shadow)`}>
          <rect x="92" y="344" width="205" height="18" rx="9" fill="#334155" />
          <path d="M143 344V58" stroke="#475569" strokeWidth="10" strokeLinecap="round" />
          <path d="M143 82H246" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
          <rect x="218" y="48" width="42" height="224" rx="18" fill={`url(#${sceneId}-glass)`} stroke="#64748b" strokeWidth="5" />
          <rect x="228" y={buretteLevel} width="22" height={258 - buretteLevel} rx="9" fill="#38bdf8" opacity="0.72" />
          {Array.from({ length: 9 }, (_, index) => (
            <line
              key={index}
              x1="219"
              x2={index % 2 === 0 ? "240" : "232"}
              y1={76 + index * 20}
              y2={76 + index * 20}
              stroke="#64748b"
              strokeWidth="2"
            />
          ))}
          <path d="M239 272V296H286" stroke="#475569" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M272 286V306" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
          <circle cx="272" cy="296" r="8" fill="#0e7490" />
          <path d="M286 290V314" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
          {baseVolume > 0 && (
            <circle
              cx="286"
              cy="326"
              r="5"
              fill="#22d3ee"
              className={isRunning ? "animate-bounce" : ""}
            />
          )}
        </g>

        <g filter={`url(#${sceneId}-shadow)`}>
          <path
            d="M356 172H430V226L482 337C489 352 478 365 462 365H324C308 365 297 352 304 337L356 226V172Z"
            fill={`url(#${sceneId}-glass)`}
            stroke="#64748b"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M322 320C355 304 431 304 466 320L476 341C480 349 474 355 463 355H323C312 355 306 349 310 341L322 320Z"
            fill={solutionColor}
            opacity="0.76"
          />
          <path d="M336 332C365 321 420 321 451 332" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d="M372 181V319" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
          <circle cx="372" cy="321" r="10" fill="#14b8a6" stroke="#ffffff" strokeWidth="3" />
        </g>

        <g transform="translate(511 164)" filter={`url(#${sceneId}-shadow)`}>
          <rect width="150" height="112" rx="22" fill="#0f172a" />
          <rect x="16" y="17" width="118" height="54" rx="10" fill="#052e16" />
          <text x="75" y="37" textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="800">pH METER</text>
          <text x="75" y="61" textAnchor="middle" fill="#dcfce7" fontSize="27" fontWeight="900">{ph.toFixed(2)}</text>
          <circle cx="23" cy="90" r="5" fill={isRunning ? "#22c55e" : "#64748b"} />
          <text x="37" y="94" fill="#cbd5e1" fontSize="10" fontWeight="700">เบส {baseVolume.toFixed(1)} ml</text>
        </g>
        <path d="M511 237C480 237 464 255 451 286L430 332" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

        <g transform="translate(86 106)">
          <rect width="118" height="66" rx="18" fill="#ffffff" stroke="#bae6fd" strokeWidth="3" />
          <text x="59" y="25" textAnchor="middle" fill="#0369a1" fontSize="10" fontWeight="900">BURETTE</text>
          <text x="59" y="47" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="900">
            เหลือ {(55 - baseVolume).toFixed(1)} ml
          </text>
        </g>
        <text x="393" y="398" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="800">
          บิวเรต · ขวดรูปชมพู่ · โพรบวัด pH
        </text>
      </svg>
    </div>
  );
}

function BoyleLawScene({
  volume,
  pressure,
  isRunning,
}: {
  volume: number;
  pressure: number;
  isRunning: boolean;
}) {
  const sceneId = useId().replace(/:/g, "");
  const pistonY = 102 + ((8 - volume) / 7) * 142;
  const gasHeight = 326 - pistonY;
  const gaugeAngle = Math.max(-58, Math.min(58, -52 + (pressure / 250) * 110));

  return (
    <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef2ff_72%,#e2e8f0_72%,#f8fafc_100%)]">
      <svg
        className="h-full max-h-[430px] w-full max-w-[760px]"
        viewBox="0 0 720 430"
        fill="none"
        role="img"
        data-testid="boyle-law-apparatus"
        aria-labelledby={`${sceneId}-title ${sceneId}-description`}
      >
        <title id={`${sceneId}-title`}>กระบอกสูบสำหรับทดลองกฎของบอยล์</title>
        <desc id={`${sceneId}-description`}>
          ลูกสูบเปลี่ยนตำแหน่งตามปริมาตรแก๊ส อนุภาคอยู่ใต้ลูกสูบ และเกจด้านข้างแสดงความดันที่เปลี่ยนแบบผกผันกับปริมาตร
        </desc>
        <defs>
          <linearGradient id={`${sceneId}-gas`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c4b5fd" stopOpacity="0.55" />
            <stop offset="1" stopColor="#7c3aed" stopOpacity="0.34" />
          </linearGradient>
          <clipPath id={`${sceneId}-chamber-clip`}>
            <rect x="264" y={pistonY + 10} width="184" height={gasHeight - 12} rx="15" />
          </clipPath>
          <filter id={`${sceneId}-shadow`} x="-25%" y="-30%" width="150%" height="180%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#312e81" floodOpacity="0.18" />
          </filter>
        </defs>

        <ellipse cx="360" cy="365" rx="225" ry="22" fill="#64748b" opacity="0.2" />
        <g filter={`url(#${sceneId}-shadow)`}>
          <rect x="252" y="82" width="208" height="258" rx="32" fill="#ffffff" fillOpacity="0.66" stroke="#64748b" strokeWidth="6" />
          <rect x="264" y={pistonY + 10} width="184" height={gasHeight - 12} rx="16" fill={`url(#${sceneId}-gas)`} />
          <g clipPath={`url(#${sceneId}-chamber-clip)`} className={isRunning ? "animate-pulse" : ""}>
            {Array.from({ length: 14 }, (_, index) => {
              const x = 282 + (index * 47) % 146;
              const y = pistonY + 32 + ((index * 37) % Math.max(28, gasHeight - 48));
              return <circle key={index} cx={x} cy={y} r={index % 3 === 0 ? 7 : 5} fill={index % 2 === 0 ? "#7c3aed" : "#38bdf8"} opacity="0.88" />;
            })}
          </g>
          <rect x="238" y={pistonY - 10} width="236" height="26" rx="13" fill="#334155" />
          <path d={`M356 ${pistonY - 10}V54`} stroke="#475569" strokeWidth="12" strokeLinecap="round" />
          <rect x="304" y="38" width="104" height="24" rx="12" fill="#94a3b8" />
          <rect x="274" y="26" width="164" height="16" rx="8" fill="#cbd5e1" />
          <path d="M460 199H505" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
        </g>

        <g transform="translate(496 113)" filter={`url(#${sceneId}-shadow)`}>
          <circle cx="72" cy="72" r="66" fill="#ffffff" stroke="#94a3b8" strokeWidth="6" />
          <path d="M29 91A50 50 0 0 1 115 91" stroke="#ddd6fe" strokeWidth="9" strokeLinecap="round" />
          <g transform={`rotate(${gaugeAngle} 72 72)`}>
            <path d="M72 72L104 48" stroke="#7c3aed" strokeWidth="7" strokeLinecap="round" />
          </g>
          <circle cx="72" cy="72" r="8" fill="#1e293b" />
          <text x="72" y="110" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="900">PRESSURE</text>
          <text x="72" y="130" textAnchor="middle" fill="#6d28d9" fontSize="16" fontWeight="900">{pressure.toFixed(1)} kPa</text>
        </g>

        <g transform="translate(74 126)">
          <rect width="132" height="82" rx="20" fill="#ffffff" stroke="#ddd6fe" strokeWidth="3" />
          <text x="66" y="28" textAnchor="middle" fill="#6d28d9" fontSize="11" fontWeight="900">VOLUME</text>
          <text x="66" y="54" textAnchor="middle" fill="#0f172a" fontSize="24" fontWeight="900">{volume.toFixed(1)} L</text>
          <text x="66" y="70" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="700">อุณหภูมิคงที่</text>
        </g>
        <g transform="translate(76 232)">
          <rect width="130" height="65" rx="18" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="2.5" />
          <text x="65" y="25" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="800">P × V</text>
          <text x="65" y="48" textAnchor="middle" fill="#6d28d9" fontSize="16" fontWeight="900">{(pressure * volume).toFixed(1)}</text>
        </g>
        <text x="358" y="400" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="800">
          ลดปริมาตร → อนุภาคชนผนังถี่ขึ้น → ความดันสูงขึ้น
        </text>
      </svg>
    </div>
  );
}

function CharlesLawScene({
  temperature,
  volume,
  isRunning,
}: {
  temperature: number;
  volume: number;
  isRunning: boolean;
}) {
  const sceneId = useId().replace(/:/g, "");
  const normalizedVolume = Math.max(1, Math.min(8, volume));
  const pistonY = 244 - ((normalizedVolume - 1) / 7) * 132;
  const gasHeight = 300 - pistonY;
  const temperatureRatio = Math.max(0, Math.min(1, (temperature - 250) / 170));
  const thermometerY = 276 - temperatureRatio * 145;
  const isCooling = temperature < 300;

  return (
    <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fffaf5_0%,#effcff_72%,#e2e8f0_72%,#f8fafc_100%)]">
      <svg
        className="h-full max-h-[430px] w-full max-w-[760px]"
        viewBox="0 0 720 430"
        fill="none"
        role="img"
        data-testid="charles-law-apparatus"
        aria-labelledby={`${sceneId}-title ${sceneId}-description`}
      >
        <title id={`${sceneId}-title`}>กระบอกแก๊สในอ่างควบคุมอุณหภูมิสำหรับกฎของชาร์ลส์</title>
        <desc id={`${sceneId}-description`}>
          กระบอกแก๊สมีลูกสูบเคลื่อนที่ได้แช่อยู่ในอ่างควบคุมอุณหภูมิ เมื่ออุณหภูมิสูงขึ้นปริมาตรแก๊สเพิ่มขึ้นโดยความดันคงที่
        </desc>
        <defs>
          <linearGradient id={`${sceneId}-bath`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={isCooling ? "#bfdbfe" : "#fed7aa"} stopOpacity="0.78" />
            <stop offset="1" stopColor={isCooling ? "#38bdf8" : "#fb923c"} stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`${sceneId}-gas`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde68a" stopOpacity="0.62" />
            <stop offset="1" stopColor="#f97316" stopOpacity="0.38" />
          </linearGradient>
          <clipPath id={`${sceneId}-gas-clip`}>
            <rect x="292" y={pistonY + 10} width="136" height={gasHeight - 10} rx="14" />
          </clipPath>
          <filter id={`${sceneId}-shadow`} x="-25%" y="-30%" width="150%" height="180%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0f172a" floodOpacity="0.16" />
          </filter>
        </defs>

        <ellipse cx="360" cy="369" rx="238" ry="22" fill="#64748b" opacity="0.2" />
        <g filter={`url(#${sceneId}-shadow)`}>
          <path d="M204 202H516L496 345H224L204 202Z" fill="#ffffff" fillOpacity="0.72" stroke="#38bdf8" strokeWidth="5" strokeLinejoin="round" />
          <path d="M216 250C257 232 301 264 346 247C391 230 435 262 504 244L492 334H228L216 250Z" fill={`url(#${sceneId}-bath)`} />
          <path d="M216 250C257 232 301 264 346 247C391 230 435 262 504 244" stroke={isCooling ? "#0284c7" : "#ea580c"} strokeWidth="4" strokeLinecap="round" opacity="0.62" />
        </g>

        <g filter={`url(#${sceneId}-shadow)`}>
          <rect x="280" y="78" width="160" height="232" rx="28" fill="#ffffff" fillOpacity="0.78" stroke="#64748b" strokeWidth="6" />
          <rect x="292" y={pistonY + 10} width="136" height={gasHeight - 10} rx="14" fill={`url(#${sceneId}-gas)`} />
          <g clipPath={`url(#${sceneId}-gas-clip)`} className={isRunning ? "animate-pulse" : ""}>
            {Array.from({ length: 11 }, (_, index) => (
              <circle
                key={index}
                cx={308 + (index * 41) % 105}
                cy={pistonY + 30 + ((index * 31) % Math.max(26, gasHeight - 42))}
                r={index % 3 === 0 ? 6 : 4.5}
                fill={index % 2 === 0 ? "#f97316" : "#facc15"}
                opacity="0.88"
              />
            ))}
          </g>
          <rect x="264" y={pistonY - 10} width="192" height="25" rx="12" fill="#334155" />
          <path d={`M360 ${pistonY - 10}V48`} stroke="#475569" strokeWidth="11" strokeLinecap="round" />
          <rect x="312" y="34" width="96" height="22" rx="11" fill="#94a3b8" />
        </g>

        <g transform="translate(500 82)">
          <rect x="16" width="26" height="206" rx="13" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="29" cy="222" r="26" fill={isCooling ? "#38bdf8" : "#ef4444"} stroke="#cbd5e1" strokeWidth="4" />
          <rect x="24" y={thermometerY - 82} width="10" height={222 - (thermometerY - 82)} rx="5" fill={isCooling ? "#38bdf8" : "#ef4444"} />
          <circle cx="29" cy="222" r="18" fill={isCooling ? "#38bdf8" : "#ef4444"} />
          <path d="M45 30H59M45 68H54M45 106H59M45 144H54M45 182H59" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        </g>

        <g transform="translate(74 115)">
          <rect width="132" height="80" rx="20" fill="#ffffff" stroke="#fed7aa" strokeWidth="3" />
          <text x="66" y="28" textAnchor="middle" fill="#c2410c" fontSize="11" fontWeight="900">TEMPERATURE</text>
          <text x="66" y="56" textAnchor="middle" fill="#0f172a" fontSize="23" fontWeight="900">{temperature.toFixed(0)} K</text>
        </g>
        <g transform="translate(74 220)">
          <rect width="132" height="72" rx="20" fill="#ffffff" stroke="#bae6fd" strokeWidth="3" />
          <text x="66" y="27" textAnchor="middle" fill="#0369a1" fontSize="11" fontWeight="900">VOLUME</text>
          <text x="66" y="53" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="900">{volume.toFixed(2)} L</text>
        </g>
        <g transform="translate(256 335)">
          <rect width="208" height="34" rx="17" fill={isCooling ? "#e0f2fe" : "#ffedd5"} stroke={isCooling ? "#7dd3fc" : "#fdba74"} strokeWidth="2.5" />
          <text x="104" y="22" textAnchor="middle" fill={isCooling ? "#0369a1" : "#c2410c"} fontSize="11" fontWeight="900">
            {isCooling ? "อ่างทำความเย็น" : "อ่างให้ความร้อน"} · ความดันคงที่
          </text>
        </g>
        <text x="360" y="402" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="800">
          อุณหภูมิสูงขึ้น → อนุภาคเคลื่อนที่เร็วขึ้น → ลูกสูบยกตัว
        </text>
      </svg>
    </div>
  );
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

  if (labId === "acid-base-titration") {
    return (
      <AcidBaseTitrationScene
        ph={result.primary}
        baseVolume={getValue(values, "baseVolume")}
        isRunning={isRunning}
      />
    );
  }

  if (labId === "boyles-law") {
    return (
      <BoyleLawScene
        volume={getValue(values, "volume")}
        pressure={result.primary}
        isRunning={isRunning}
      />
    );
  }

  if (labId === "charles-law") {
    return (
      <CharlesLawScene
        temperature={getValue(values, "temperature")}
        volume={result.primary}
        isRunning={isRunning}
      />
    );
  }

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

