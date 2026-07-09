"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Apple,
  Beaker,
  Bone,
  Dumbbell,
  FlaskConical,
  HeartPulse,
  Info,
  Leaf,
  ListChecks,
  Microscope,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";

import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import {
  foundationExplorerLabs,
  isFoundationExplorerLabId,
  type FoundationExplorerItem,
  type FoundationExplorerLab,
} from "@/data/foundationExplorerLabs";

const iconMap: Record<FoundationExplorerLab["visualKind"], LucideIcon> = {
  equipment: Beaker,
  "animal-cell": Microscope,
  "leaf-cell": Leaf,
  blood: HeartPulse,
  chemicals: FlaskConical,
  "external-muscle": Dumbbell,
  "internal-muscle": Bone,
  minerals: Apple,
};

const toneClasses = {
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  cyan: "border-cyan-100 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  orange: "border-orange-100 bg-orange-50 text-orange-700",
  rose: "border-rose-100 bg-rose-50 text-rose-700",
  violet: "border-violet-100 bg-violet-50 text-violet-700",
};

function EquipmentDiagram({ selectedId, onSelectId }: { selectedId: string; onSelectId: (id: string) => void }) {
  const getStyle = (id: string) => {
    const active = selectedId === id;
    return {
      group: `cursor-pointer transition-all duration-200 ${active ? "opacity-100 scale-[1.03] origin-center" : "opacity-60 hover:opacity-90"}`,
      stroke: active ? "#2563eb" : "#475569",
      fill: active ? "rgba(37, 99, 235, 0.08)" : "none",
      strokeWidth: active ? 3 : 1.5,
    };
  };

  return (
    <svg viewBox="0 0 450 320" className="w-full h-full" aria-label="แผนภาพจำลองวัสดุอุปกรณ์ห้องแล็บ" role="img">
      {/* Table Bench */}
      <line x1="20" y1="240" x2="430" y2="240" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

      {/* Microscope */}
      <g className={getStyle("microscope").group} onClick={() => onSelectId("microscope")}>
        <path d="M 40 235 L 90 235 L 80 220 L 50 220 Z" fill="#64748b" stroke={getStyle("microscope").stroke} strokeWidth={getStyle("microscope").strokeWidth} />
        <path d="M 75 220 C 90 200, 90 150, 70 140" fill="none" stroke={getStyle("microscope").stroke} strokeWidth={getStyle("microscope").strokeWidth + 1} strokeLinecap="round" />
        <line x1="45" y1="180" x2="80" y2="180" stroke={getStyle("microscope").stroke} strokeWidth={getStyle("microscope").strokeWidth + 1} />
        <rect x="52" y="125" width="14" height="50" transform="rotate(-15 59 150)" fill="#94a3b8" stroke={getStyle("microscope").stroke} strokeWidth={getStyle("microscope").strokeWidth} />
        <rect x="54" y="115" width="10" height="10" transform="rotate(-15 59 150)" fill="#334155" />
        <line x1="46" y1="115" x2="62" y2="111" stroke={getStyle("microscope").stroke} strokeWidth={getStyle("microscope").strokeWidth + 2} />
        <title>กล้องจุลทรรศน์</title>
      </g>

      {/* Balance */}
      <g className={getStyle("balance").group} onClick={() => onSelectId("balance")}>
        <rect x="110" y="200" width="70" height="35" rx="4" fill="#e2e8f0" stroke={getStyle("balance").stroke} strokeWidth={getStyle("balance").strokeWidth} />
        <line x1="120" y1="195" x2="170" y2="195" stroke={getStyle("balance").stroke} strokeWidth={getStyle("balance").strokeWidth + 1} />
        <line x1="145" y1="195" x2="145" y2="200" stroke={getStyle("balance").stroke} strokeWidth={getStyle("balance").strokeWidth} />
        <rect x="122" y="212" width="46" height="15" rx="2" fill="#0f172a" />
        <text x="145" y="223" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">0.00g</text>
        <title>เครื่องชั่ง</title>
      </g>

      {/* Beaker */}
      <g className={getStyle("beaker").group} onClick={() => onSelectId("beaker")}>
        <rect x="202" y="180" width="46" height="55" fill="#93c5fd" opacity="0.75" />
        <ellipse cx="225" cy="180" rx="23" ry="4" fill="#60a5fa" />
        <path d="M 200 150 L 200 236 C 200 238, 202 240, 205 240 L 245 240 C 248 240, 250 238, 250 236 L 250 150" fill="none" stroke={getStyle("beaker").stroke} strokeWidth={getStyle("beaker").strokeWidth} />
        <path d="M 197 150 L 205 150" stroke={getStyle("beaker").stroke} strokeWidth={getStyle("beaker").strokeWidth} />
        <path d="M 253 150 L 245 150" stroke={getStyle("beaker").stroke} strokeWidth={getStyle("beaker").strokeWidth} />
        <line x1="240" y1="170" x2="246" y2="170" stroke={getStyle("beaker").stroke} strokeWidth="1" />
        <line x1="240" y1="190" x2="246" y2="190" stroke={getStyle("beaker").stroke} strokeWidth="1" />
        <line x1="240" y1="210" x2="246" y2="210" stroke={getStyle("beaker").stroke} strokeWidth="1" />
        <title>บีกเกอร์</title>
      </g>

      {/* Graduated Cylinder */}
      <g className={getStyle("cylinder").group} onClick={() => onSelectId("cylinder")}>
        <ellipse cx="285" cy="238" rx="18" ry="5" fill="#94a3b8" stroke={getStyle("cylinder").stroke} strokeWidth={getStyle("cylinder").strokeWidth} />
        <rect x="277" y="130" width="16" height="105" fill="#a7f3d0" opacity="0.75" />
        <ellipse cx="285" cy="130" rx="8" ry="2" fill="#34d399" />
        <rect x="275" y="105" width="20" height="130" rx="2" fill="none" stroke={getStyle("cylinder").stroke} strokeWidth={getStyle("cylinder").strokeWidth} />
        <path d="M 273 105 L 277 110" stroke={getStyle("cylinder").stroke} strokeWidth={getStyle("cylinder").strokeWidth} />
        {[120, 140, 160, 180, 200, 220].map(y => (
          <line key={y} x1="288" y1={y} x2="293" y2={y} stroke={getStyle("cylinder").stroke} strokeWidth="1" />
        ))}
        <title>กระบอกตวง</title>
      </g>

      {/* Test Tube Rack & Test Tube */}
      <g className={getStyle("test-tube").group} onClick={() => onSelectId("test-tube")}>
        <rect x="325" y="195" width="60" height="43" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="320" y1="238" x2="390" y2="238" stroke="#94a3b8" strokeWidth="3" />
        <path d="M 347 160 L 347 225 C 347 229, 363 229, 363 225 L 363 160 Z" fill="#fbcfe8" opacity="0.8" />
        <path d="M 345 140 L 345 225 C 345 233, 365 233, 365 225 L 365 140" fill="none" stroke={getStyle("test-tube").stroke} strokeWidth={getStyle("test-tube").strokeWidth} />
        <ellipse cx="355" cy="140" rx="10" ry="2.5" fill="none" stroke={getStyle("test-tube").stroke} strokeWidth={getStyle("test-tube").strokeWidth} />
        <title>หลอดทดลอง</title>
      </g>

      {/* Pipette */}
      <g className={getStyle("pipette").group} onClick={() => onSelectId("pipette")}>
        <path d="M 230 45 C 220 45, 220 65, 230 65 C 240 65, 240 45, 230 45 Z" fill="#ef4444" stroke={getStyle("pipette").stroke} strokeWidth={getStyle("pipette").strokeWidth} />
        <path d="M 227 65 L 227 100 L 230 108 L 233 100 L 233 65" fill="#cbd5e1" stroke={getStyle("pipette").stroke} strokeWidth={getStyle("pipette").strokeWidth} />
        <rect x="228" y="75" width="4" height="25" fill="#3b82f6" />
        <circle cx="230" cy="120" r="3" fill="#3b82f6" className="animate-bounce" />
        <title>หลอดหยด/ปิเปต</title>
      </g>

      {/* Thermometer */}
      <g className={getStyle("thermometer").group} onClick={() => onSelectId("thermometer")}>
        <rect x="352" y="55" width="6" height="70" rx="3" fill="none" stroke={getStyle("thermometer").stroke} strokeWidth={getStyle("thermometer").strokeWidth} />
        <circle cx="355" cy="125" r="7" fill="#ef4444" stroke={getStyle("thermometer").stroke} strokeWidth={getStyle("thermometer").strokeWidth} />
        <line x1="355" y1="125" x2="355" y2="75" stroke="#ef4444" strokeWidth="2.5" />
        {[65, 75, 85, 95, 105, 115].map(y => (
          <line key={y} x1="358" y1={y} x2="361" y2={y} stroke={getStyle("thermometer").stroke} strokeWidth="1" />
        ))}
        <title>เทอร์โมมิเตอร์</title>
      </g>

      {/* Safety Goggles */}
      <g className={getStyle("goggles").group} onClick={() => onSelectId("goggles")}>
        <path d="M 125 150 C 115 150, 110 165, 120 175 C 130 185, 140 180, 145 170 C 150 180, 160 185, 170 175 C 180 165, 175 150, 165 150 Z" fill="rgba(186, 230, 253, 0.4)" stroke={getStyle("goggles").stroke} strokeWidth={getStyle("goggles").strokeWidth} />
        <path d="M 140 155 Q 145 150 150 155" fill="none" stroke={getStyle("goggles").stroke} strokeWidth={getStyle("goggles").strokeWidth} />
        <path d="M 115 155 Q 110 150 100 155" fill="none" stroke={getStyle("goggles").stroke} strokeWidth={getStyle("goggles").strokeWidth} />
        <path d="M 175 155 Q 180 150 190 155" fill="none" stroke={getStyle("goggles").stroke} strokeWidth={getStyle("goggles").strokeWidth} />
        <title>แว่นตานิรภัย</title>
      </g>
    </svg>
  );
}

function AnimalCellDiagram({ selectedId, onSelectId }: { selectedId: string; onSelectId: (id: string) => void }) {
  const getStyle = (id: string) => {
    const active = selectedId === id;
    return {
      group: `cursor-pointer transition-all duration-200 ${active ? "opacity-100 scale-[1.02] origin-center" : "opacity-75 hover:opacity-95"}`,
      stroke: active ? "#8b5cf6" : "#475569",
      fill: active ? "rgba(139, 92, 246, 0.12)" : "none",
      strokeWidth: active ? 3 : 1.5,
    };
  };

  return (
    <svg viewBox="0 0 450 320" className="w-full h-full" aria-label="แผนภาพโครงสร้างเซลล์สัตว์" role="img">
      {/* Cytoplasm (general background cell body) */}
      <g className={getStyle("cytoplasm").group} onClick={() => onSelectId("cytoplasm")}>
        <path d="M 50 140 C 40 70, 160 30, 240 40 C 350 50, 410 110, 390 180 C 370 250, 280 280, 200 270 C 110 260, 60 210, 50 140 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        <title>ไซโทพลาซึม</title>
      </g>

      {/* Cell Membrane (outer border) */}
      <g className={getStyle("membrane").group} onClick={() => onSelectId("membrane")}>
        <path d="M 48 140 C 38 68, 158 28, 238 38 C 348 48, 412 108, 392 180 C 372 252, 278 282, 198 272 C 108 262, 58 212, 48 140 Z" fill="none" stroke={getStyle("membrane").stroke} strokeWidth={getStyle("membrane").strokeWidth + 1} />
        <title>เยื่อหุ้มเซลล์</title>
      </g>

      {/* Nucleus */}
      <g className={getStyle("nucleus").group} onClick={() => onSelectId("nucleus")}>
        <circle cx="160" cy="140" r="45" fill="#f3e8ff" stroke={getStyle("nucleus").stroke} strokeWidth={getStyle("nucleus").strokeWidth} />
        <circle cx="150" cy="130" r="16" fill="#c084fc" />
        <title>นิวเคลียส</title>
      </g>

      {/* Endoplasmic Reticulum (ER) */}
      <g className={getStyle("er").group} onClick={() => onSelectId("er")}>
        <path d="M 115 140 Q 95 110 115 85 Q 135 60 160 70 M 115 140 Q 90 160 115 190 Q 140 220 180 200" fill="none" stroke={getStyle("er").stroke} strokeWidth={getStyle("er").strokeWidth} strokeLinecap="round" />
        <circle cx="105" cy="110" r="2.5" fill="#475569" />
        <circle cx="103" cy="130" r="2.5" fill="#475569" />
        <circle cx="106" cy="155" r="2.5" fill="#475569" />
        <circle cx="112" cy="175" r="2.5" fill="#475569" />
        <title>เอนโดพลาสมิกเรติคูลัม</title>
      </g>

      {/* Golgi Body */}
      <g className={getStyle("golgi").group} onClick={() => onSelectId("golgi")}>
        <path d="M 280 100 C 300 95, 300 125, 280 120 M 290 115 C 310 110, 310 140, 290 135 M 300 130 C 320 125, 320 155, 300 150" fill="none" stroke={getStyle("golgi").stroke} strokeWidth={getStyle("golgi").strokeWidth + 1} strokeLinecap="round" />
        <circle cx="315" cy="115" r="4" fill="#a7f3d0" stroke={getStyle("golgi").stroke} strokeWidth="1" />
        <circle cx="325" cy="138" r="3.5" fill="#a7f3d0" stroke={getStyle("golgi").stroke} strokeWidth="1" />
        <title>กอลจิบอดี</title>
      </g>

      {/* Mitochondria */}
      <g className={getStyle("mitochondria").group} onClick={() => onSelectId("mitochondria")}>
        <rect x="220" y="200" width="45" height="24" rx="12" fill="#fee2e2" stroke={getStyle("mitochondria").stroke} strokeWidth={getStyle("mitochondria").strokeWidth} transform="rotate(25 242 212)" />
        <path d="M 227 215 Q 232 203 237 215 Q 242 203 247 215 Q 252 203 257 215" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" transform="rotate(25 242 212)" />
        <rect x="230" y="70" width="40" height="22" rx="11" fill="#fee2e2" stroke={getStyle("mitochondria").stroke} strokeWidth={getStyle("mitochondria").strokeWidth} transform="rotate(-15 250 81)" />
        <path d="M 236 83 Q 241 73 246 83 Q 251 73 256 83" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" transform="rotate(-15 250 81)" />
        <title>ไมโทคอนเดรีย</title>
      </g>

      {/* Lysosome */}
      <g className={getStyle("lysosome").group} onClick={() => onSelectId("lysosome")}>
        <circle cx="300" cy="200" r="14" fill="#e0f2fe" stroke={getStyle("lysosome").stroke} strokeWidth={getStyle("lysosome").strokeWidth} />
        <circle cx="295" cy="195" r="3" fill="#38bdf8" />
        <circle cx="305" cy="205" r="2" fill="#38bdf8" />
        <title>ไลโซโซม</title>
      </g>

      {/* Ribosome */}
      <g className={getStyle("ribosome").group} onClick={() => onSelectId("ribosome")}>
        <circle cx="180" cy="75" r="3" fill="#475569" />
        <circle cx="188" cy="72" r="3" fill="#475569" />
        <circle cx="196" cy="77" r="3" fill="#475569" />
        <circle cx="210" cy="150" r="3" fill="#475569" />
        <circle cx="218" cy="147" r="3" fill="#475569" />
        <circle cx="270" cy="165" r="3" fill="#475569" />
        <circle cx="277" cy="170" r="3" fill="#475569" />
        <title>ไรโบโซม</title>
      </g>
    </svg>
  );
}

function LeafCellDiagram({ selectedId, onSelectId }: { selectedId: string; onSelectId: (id: string) => void }) {
  const getStyle = (id: string) => {
    const active = selectedId === id;
    return {
      group: `cursor-pointer transition-all duration-200 ${active ? "opacity-100 scale-[1.02] origin-center" : "opacity-75 hover:opacity-95"}`,
      stroke: active ? "#059669" : "#475569",
      fill: active ? "rgba(16, 185, 129, 0.12)" : "none",
      strokeWidth: active ? 3 : 1.5,
    };
  };

  return (
    <svg viewBox="0 0 450 320" className="w-full h-full" aria-label="แผนภาพตัดขวางเนื้อเยื่อและเซลล์ใบไม้" role="img">
      {/* Upper Epidermis */}
      <rect x="20" y="20" width="410" height="25" fill="#f0fdf4" stroke="#cbd5e1" strokeWidth="1" rx="4" />
      <text x="225" y="37" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="bold">Epidermis ด้านบน</text>

      {/* Palisade Cells Layer */}
      <g className={getStyle("palisade").group} onClick={() => onSelectId("palisade")}>
        <rect x="35" y="55" width="40" height="110" rx="6" fill="#e8f5e9" stroke="#81c784" strokeWidth="1.5" />
        <rect x="135" y="55" width="40" height="110" rx="6" fill="#e8f5e9" stroke="#81c784" strokeWidth="1.5" />
        <rect x="185" y="55" width="40" height="110" rx="6" fill="#e8f5e9" stroke="#81c784" strokeWidth="1.5" />
        <title>เซลล์พาลิเสด</title>
      </g>

      {/* Palisade Cell 2: Interactive Cell Wall */}
      <g className={getStyle("cell-wall").group} onClick={() => onSelectId("cell-wall")}>
        <rect x="85" y="55" width="40" height="110" rx="6" fill="#e8f5e9" stroke={getStyle("cell-wall").stroke} strokeWidth={getStyle("cell-wall").strokeWidth} />
        <title>ผนังเซลล์</title>
      </g>

      {/* Vacuole inside Palisade Cell 2 */}
      <g className={getStyle("vacuole").group} onClick={() => onSelectId("vacuole")}>
        <rect x="93" y="75" width="24" height="70" rx="10" fill="#e0f2fe" stroke={getStyle("vacuole").stroke} strokeWidth={getStyle("vacuole").strokeWidth} />
        <title>แวคิวโอลกลาง</title>
      </g>

      {/* Chloroplasts inside Palisade Cell 2 */}
      <g className={getStyle("chloroplast").group} onClick={() => onSelectId("chloroplast")}>
        <ellipse cx="93" cy="65" rx="5" ry="3" fill="#10b981" />
        <ellipse cx="117" cy="65" rx="5" ry="3" fill="#10b981" />
        <ellipse cx="91" cy="90" rx="5" ry="3" fill="#10b981" />
        <ellipse cx="119" cy="95" rx="5" ry="3" fill="#10b981" />
        <ellipse cx="91" cy="120" rx="5" ry="3" fill="#10b981" />
        <ellipse cx="119" cy="125" rx="5" ry="3" fill="#10b981" />
        <ellipse cx="95" cy="153" rx="5" ry="3" fill="#10b981" />
        <ellipse cx="115" cy="153" rx="5" ry="3" fill="#10b981" />
        <title>คลอโรพลาสต์</title>
      </g>

      {/* Spongy Layer Cells */}
      <g className={getStyle("spongy").group} onClick={() => onSelectId("spongy")}>
        <circle cx="55" cy="200" r="18" fill="#e8f5e9" stroke="#81c784" strokeWidth="1.5" />
        <circle cx="110" cy="195" r="16" fill="#e8f5e9" stroke="#81c784" strokeWidth="1.5" />
        <circle cx="160" cy="205" r="19" fill="#e8f5e9" stroke="#81c784" strokeWidth="1.5" />
        <path d="M 80 200 L 95 200" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
        <text x="87" y="195" fill="#94a3b8" fontSize="8" textAnchor="middle">ช่องอากาศ</text>
        <title>เซลล์สปองจี / ช่องว่างอากาศ</title>
      </g>

      {/* Lower Epidermis Guard Cells and Stomata */}
      <g className={getStyle("guard-cell").group} onClick={() => onSelectId("guard-cell")}>
        <path d="M 232 235 C 220 235, 215 250, 232 265 C 242 265, 240 250, 240 235 Z" fill="#e8f5e9" stroke={getStyle("guard-cell").stroke} strokeWidth={getStyle("guard-cell").strokeWidth} />
        <path d="M 268 235 C 280 235, 285 250, 268 265 C 258 265, 260 250, 260 235 Z" fill="#e8f5e9" stroke={getStyle("guard-cell").stroke} strokeWidth={getStyle("guard-cell").strokeWidth} />
        <circle cx="236" cy="250" r="2" fill="#10b981" />
        <circle cx="264" cy="250" r="2" fill="#10b981" />
        <title>เซลล์คุม</title>
      </g>

      {/* Stomata */}
      <g className={getStyle("stomata").group} onClick={() => onSelectId("stomata")}>
        <ellipse cx="250" cy="250" rx="9" ry="14" fill="#0f172a" stroke={getStyle("stomata").stroke} strokeWidth={getStyle("stomata").strokeWidth} />
        <title>ปากใบ (ช่องเปิด)</title>
      </g>

      <rect x="20" y="240" width="190" height="15" fill="#f0fdf4" stroke="#cbd5e1" strokeWidth="1" rx="2" />
      <rect x="290" y="240" width="140" height="15" fill="#f0fdf4" stroke="#cbd5e1" strokeWidth="1" rx="2" />
    </svg>
  );
}

function HumanBloodCellsDiagram({ selectedId, onSelectId }: { selectedId: string; onSelectId: (id: string) => void }) {
  const getStyle = (id: string) => {
    const active = selectedId === id;
    return {
      group: `cursor-pointer transition-all duration-200 ${active ? "opacity-100 scale-[1.03] origin-center" : "opacity-75 hover:opacity-95"}`,
      stroke: active ? "#ef4444" : "#cbd5e1",
      fill: active ? "rgba(239, 68, 68, 0.1)" : "none",
      strokeWidth: active ? 3 : 1.5,
    };
  };

  return (
    <svg viewBox="0 0 450 320" className="w-full h-full" aria-label="แผนภาพจำลององค์ประกอบของเม็ดเลือดคน" role="img">
      {/* Plasma */}
      <g className={getStyle("plasma").group} onClick={() => onSelectId("plasma")}>
        <rect x="20" y="30" width="410" height="200" rx="24" fill="#fefcbf" opacity="0.65" stroke={getStyle("plasma").stroke} strokeWidth={getStyle("plasma").strokeWidth} />
        <text x="35" y="55" fill="#d97706" fontSize="10" fontWeight="bold">พลาสมา (Plasma)</text>
        <title>พลาสมา</title>
      </g>

      {/* Red Blood Cells (RBC) */}
      <g className={getStyle("rbc").group} onClick={() => onSelectId("rbc")}>
        <g transform="translate(60, 120)">
          <ellipse cx="0" cy="0" rx="22" ry="12" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <ellipse cx="0" cy="0" rx="10" ry="5" fill="#fca5a5" />
        </g>
        <g transform="translate(180, 70) rotate(20)">
          <ellipse cx="0" cy="0" rx="20" ry="11" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <ellipse cx="0" cy="0" rx="9" ry="4.5" fill="#fca5a5" />
        </g>
        <g transform="translate(110, 180) rotate(-15)">
          <ellipse cx="0" cy="0" rx="23" ry="13" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <ellipse cx="0" cy="0" rx="11" ry="5.5" fill="#fca5a5" />
        </g>
        <g transform="translate(290, 160) rotate(35)">
          <ellipse cx="0" cy="0" rx="21" ry="12" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <ellipse cx="0" cy="0" rx="10" ry="5" fill="#fca5a5" />
        </g>
        <title>เม็ดเลือดแดง (RBC)</title>
      </g>

      {/* White Blood Cell (WBC) */}
      <g className={getStyle("wbc").group} onClick={() => onSelectId("wbc")}>
        <circle cx="280" cy="95" r="28" fill="#faf5ff" stroke={getStyle("wbc").stroke} strokeWidth={getStyle("wbc").strokeWidth} />
        <path d="M 270 85 C 265 95, 275 105, 285 95 C 295 105, 290 80, 270 85 Z" fill="#9333ea" />
        <title>เม็ดเลือดขาว (WBC)</title>
      </g>

      {/* Lymphocyte */}
      <g className={getStyle("lymphocyte").group} onClick={() => onSelectId("lymphocyte")}>
        <circle cx="370" cy="140" r="24" fill="#faf5ff" stroke={getStyle("lymphocyte").stroke} strokeWidth={getStyle("lymphocyte").strokeWidth} />
        <circle cx="370" cy="140" r="18" fill="#7c3aed" />
        <title>ลิมโฟไซต์</title>
      </g>

      {/* Platelets */}
      <g className={getStyle("platelet").group} onClick={() => onSelectId("platelet")}>
        <path d="M 130 110 L 135 113 L 132 118 L 127 116 L 125 120 L 123 114 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
        <path d="M 220 160 L 225 163 L 222 168 L 217 166 L 215 170 L 213 164 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
        <title>เกล็ดเลือด (Platelet)</title>
      </g>

      {/* Hemoglobin */}
      <g className={getStyle("hemoglobin").group} onClick={() => onSelectId("hemoglobin")}>
        <rect x="20" y="235" width="130" height="75" rx="10" fill="#f8fafc" stroke={getStyle("hemoglobin").stroke} strokeWidth={getStyle("hemoglobin").strokeWidth} />
        <text x="85" y="249" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="middle">โครงสร้าง Hemoglobin</text>
        <circle cx="65" cy="275" r="10" fill="#fecaca" stroke="#dc2626" strokeWidth="1" />
        <circle cx="85" cy="275" r="10" fill="#fecaca" stroke="#dc2626" strokeWidth="1" />
        <circle cx="75" cy="290" r="10" fill="#fecaca" stroke="#dc2626" strokeWidth="1" />
        <circle cx="95" cy="290" r="10" fill="#fecaca" stroke="#dc2626" strokeWidth="1" />
        <circle cx="65" cy="275" r="2.5" fill="#b91c1c" />
        <circle cx="85" cy="275" r="2.5" fill="#b91c1c" />
        <circle cx="75" cy="290" r="2.5" fill="#b91c1c" />
        <circle cx="95" cy="290" r="2.5" fill="#b91c1c" />
        <title>ฮีโมโกลบิน (Hemoglobin)</title>
      </g>
    </svg>
  );
}

function ExperimentChemicalsDiagram({
  lab,
  selectedId,
  onSelectId,
}: {
  lab: FoundationExplorerLab;
  selectedId: string;
  onSelectId: (id: string) => void;
}) {
  const displayItems = lab.items.slice(0, 12);

  const getBottleLiquidColor = (id: string) => {
    switch (id) {
      case "cuso4":
        return "#3b82f6";
      case "kmno4":
        return "#a855f7";
      case "iodine":
        return "#b45309";
      case "universal":
        return "#10b981";
      case "phenolphthalein":
        return "#fda4af";
      default:
        return "#e0f2fe";
    }
  };

  const getStyle = (id: string) => {
    const active = selectedId === id;
    return {
      group: `cursor-pointer transition-all duration-200 ${active ? "opacity-100 scale-[1.04] origin-center" : "opacity-75 hover:opacity-95"}`,
      stroke: active ? "#ea580c" : "#475569",
      strokeWidth: active ? 3 : 1.5,
    };
  };

  return (
    <svg viewBox="0 0 450 320" className="w-full h-full" aria-label="แผนภาพชั้นวางสารเคมีในการทดลอง" role="img">
      {/* Cabinet Frame */}
      <rect x="25" y="15" width="400" height="260" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
      <line x1="25" y1="95" x2="425" y2="95" stroke="#94a3b8" strokeWidth="4" />
      <line x1="25" y1="180" x2="425" y2="180" stroke="#94a3b8" strokeWidth="4" />
      <line x1="25" y1="265" x2="425" y2="265" stroke="#94a3b8" strokeWidth="4" />

      {displayItems.map((item, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const x = 50 + col * 95;
        const y = 30 + row * 85;
        const liquidColor = getBottleLiquidColor(item.id);

        return (
          <g key={item.id} className={getStyle(item.id).group} onClick={() => onSelectId(item.id)}>
            <rect x={x} y={y + 15} width="48" height="48" rx="8" fill="rgba(241, 245, 249, 0.5)" stroke={getStyle(item.id).stroke} strokeWidth={getStyle(item.id).strokeWidth} />
            <rect x={x + 16} y={y + 3} width="16" height="12" fill="none" stroke={getStyle(item.id).stroke} strokeWidth={getStyle(item.id).strokeWidth} />
            <rect x={x + 12} y={y} width="24" height="6" rx="1" fill="#475569" stroke={getStyle(item.id).stroke} strokeWidth="1" />
            <path d={`M ${x + 2} ${y + 38} Q ${x + 24} ${y + 36} ${x + 46} ${y + 38} L ${x + 46} ${y + 59} C ${x + 46} ${y + 61} ${x + 42} ${y + 61} ${x + 42} ${y + 61} L ${x + 6} ${y + 61} C ${x + 2} ${y + 61} ${x + 2} ${y + 59} Z`} fill={liquidColor} opacity="0.8" />
            <rect x={x + 6} y={y + 20} width="36" height="15" rx="2" fill="white" stroke={getStyle(item.id).stroke} strokeWidth="1" />
            <text x={x + 24} y={y + 31} fill="#0f172a" fontSize="8" fontWeight="black" textAnchor="middle">
              {item.id === "acetic-acid" ? "AcOH" : item.id === "phenolphthalein" ? "PhPh" : item.id === "universal" ? "Univ" : item.tag}
            </text>
            <title>{item.name}</title>
          </g>
        );
      })}
    </svg>
  );
}

function ExternalMuscleDiagram({ selectedId, onSelectId }: { selectedId: string; onSelectId: (id: string) => void }) {
  const getStyle = (id: string) => {
    const active = selectedId === id;
    return {
      group: `cursor-pointer transition-all duration-200 ${active ? "opacity-100 scale-[1.03] origin-center" : "opacity-75 hover:opacity-95"}`,
      stroke: active ? "#ef4444" : "#fca5a5",
      fill: active ? "#ef4444" : "#fecaca",
      strokeWidth: active ? 2.5 : 1,
    };
  };

  return (
    <svg viewBox="0 0 450 320" className="w-full h-full" aria-label="แผนภาพกล้ามเนื้อผิวตื้นภายนอกร่างกาย" role="img">
      <path d="M 225 15 C 205 15, 205 60, 225 60 C 245 60, 245 15, 225 15 Z M 220 60 L 230 60 L 230 75 L 220 75 Z M 160 75 L 290 75 L 275 175 L 175 175 Z M 190 175 L 210 175 L 205 285 L 180 285 Z M 240 175 L 260 175 L 270 285 L 245 285 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

      {/* Trapezius */}
      <g className={getStyle("trapezius").group} onClick={() => onSelectId("trapezius")}>
        <polygon points="215,75 225,60 235,75 255,77 195,77" fill={getStyle("trapezius").fill} stroke={getStyle("trapezius").stroke} strokeWidth={getStyle("trapezius").strokeWidth} />
        <title>ทราพีเซียส (บ่า/หลังบน)</title>
      </g>

      {/* Deltoids */}
      <g className={getStyle("deltoid").group} onClick={() => onSelectId("deltoid")}>
        <circle cx="170" cy="85" r="13" fill={getStyle("deltoid").fill} stroke={getStyle("deltoid").stroke} strokeWidth={getStyle("deltoid").strokeWidth} />
        <circle cx="280" cy="85" r="13" fill={getStyle("deltoid").fill} stroke={getStyle("deltoid").stroke} strokeWidth={getStyle("deltoid").strokeWidth} />
        <title>เดลทอยด์ (ไหล่)</title>
      </g>

      {/* Pectoralis Major */}
      <g className={getStyle("pectoralis").group} onClick={() => onSelectId("pectoralis")}>
        <path d="M 183 85 L 223 85 L 223 110 L 185 110 Z" fill={getStyle("pectoralis").fill} stroke={getStyle("pectoralis").stroke} strokeWidth={getStyle("pectoralis").strokeWidth} />
        <path d="M 227 85 L 267 85 L 265 110 L 227 110 Z" fill={getStyle("pectoralis").fill} stroke={getStyle("pectoralis").stroke} strokeWidth={getStyle("pectoralis").strokeWidth} />
        <title>เพกทอราลิสเมเจอร์ (อก)</title>
      </g>

      {/* Biceps */}
      <g className={getStyle("biceps").group} onClick={() => onSelectId("biceps")}>
        <rect x="150" y="98" width="13" height="30" rx="5" fill={getStyle("biceps").fill} stroke={getStyle("biceps").stroke} strokeWidth={getStyle("biceps").strokeWidth} />
        <rect x="287" y="98" width="13" height="30" rx="5" fill={getStyle("biceps").fill} stroke={getStyle("biceps").stroke} strokeWidth={getStyle("biceps").strokeWidth} />
        <title>ไบเซปส์ (หน้าแขน)</title>
      </g>

      {/* Triceps */}
      <g className={getStyle("triceps").group} onClick={() => onSelectId("triceps")}>
        <rect x="138" y="102" width="10" height="28" rx="4" fill={getStyle("triceps").fill} stroke={getStyle("triceps").stroke} strokeWidth={getStyle("triceps").strokeWidth} />
        <rect x="302" y="102" width="10" height="28" rx="4" fill={getStyle("triceps").fill} stroke={getStyle("triceps").stroke} strokeWidth={getStyle("triceps").strokeWidth} />
        <title>ไตรเซปส์ (หลังแขน)</title>
      </g>

      {/* Rectus Abdominis */}
      <g className={getStyle("rectus").group} onClick={() => onSelectId("rectus")}>
        <rect x="208" y="118" width="34" height="48" rx="4" fill={getStyle("rectus").fill} stroke={getStyle("rectus").stroke} strokeWidth={getStyle("rectus").strokeWidth} />
        <line x1="225" y1="118" x2="225" y2="166" stroke="#ffffff" strokeWidth="1" />
        <line x1="210" y1="130" x2="240" y2="130" stroke="#ffffff" strokeWidth="1" />
        <line x1="210" y1="142" x2="240" y2="142" stroke="#ffffff" strokeWidth="1" />
        <line x1="210" y1="154" x2="240" y2="154" stroke="#ffffff" strokeWidth="1" />
        <title>เรคตัสแอบโดมินิส (หน้าท้อง)</title>
      </g>

      {/* Quadriceps */}
      <g className={getStyle("quadriceps").group} onClick={() => onSelectId("quadriceps")}>
        <path d="M 188 185 Q 200 178 212 185 L 208 235 L 192 235 Z" fill={getStyle("quadriceps").fill} stroke={getStyle("quadriceps").stroke} strokeWidth={getStyle("quadriceps").strokeWidth} />
        <path d="M 238 185 Q 250 178 262 185 L 258 235 L 242 235 Z" fill={getStyle("quadriceps").fill} stroke={getStyle("quadriceps").stroke} strokeWidth={getStyle("quadriceps").strokeWidth} />
        <title>ควอดริเซปส์ (หน้าขา)</title>
      </g>

      {/* Gastrocnemius */}
      <g className={getStyle("gastrocnemius").group} onClick={() => onSelectId("gastrocnemius")}>
        <rect x="180" y="242" width="16" height="35" rx="7" fill={getStyle("gastrocnemius").fill} stroke={getStyle("gastrocnemius").stroke} strokeWidth={getStyle("gastrocnemius").strokeWidth} />
        <rect x="254" y="242" width="16" height="35" rx="7" fill={getStyle("gastrocnemius").fill} stroke={getStyle("gastrocnemius").stroke} strokeWidth={getStyle("gastrocnemius").strokeWidth} />
        <title>แกสโตรนีเมียส (น่อง)</title>
      </g>
    </svg>
  );
}

function InternalMuscleDiagram({ selectedId, onSelectId }: { selectedId: string; onSelectId: (id: string) => void }) {
  const getStyle = (id: string) => {
    const active = selectedId === id;
    return {
      group: `cursor-pointer transition-all duration-200 ${active ? "opacity-100 scale-[1.03] origin-center" : "opacity-70 hover:opacity-95"}`,
      stroke: active ? "#8b5cf6" : "#c084fc",
      fill: active ? "#8b5cf6" : "#e9d5ff",
      strokeWidth: active ? 2.5 : 1,
    };
  };

  return (
    <svg viewBox="0 0 450 320" className="w-full h-full" aria-label="แผนภาพกล้ามเนื้อชั้นลึกภายในร่างกาย" role="img">
      <path d="M 225 35 L 225 240" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
      <circle cx="225" cy="20" r="12" fill="#cbd5e1" />
      <path d="M 225 60 C 180 60, 160 90, 160 120 C 160 140, 200 150, 225 150 C 250 150, 290 140, 290 120 C 290 90, 270 60, 225 60 Z" fill="none" stroke="#cbd5e1" strokeWidth="4" />
      <path d="M 225 80 C 190 80, 175 100, 175 120 C 175 130, 210 135, 225 135 C 240 135, 275 130, 275 120 C 275 100, 260 80, 225 80 Z" fill="none" stroke="#cbd5e1" strokeWidth="3" />
      <path d="M 195 200 L 255 200 L 245 235 L 205 235 Z" fill="none" stroke="#cbd5e1" strokeWidth="4" />

      {/* Rotator Cuff */}
      <g className={getStyle("rotator-cuff").group} onClick={() => onSelectId("rotator-cuff")}>
        <circle cx="155" cy="60" r="10" fill={getStyle("rotator-cuff").fill} stroke={getStyle("rotator-cuff").stroke} strokeWidth={getStyle("rotator-cuff").strokeWidth} />
        <circle cx="295" cy="60" r="10" fill={getStyle("rotator-cuff").fill} stroke={getStyle("rotator-cuff").stroke} strokeWidth={getStyle("rotator-cuff").strokeWidth} />
        <title>กลุ่มโรเทเตอร์คัฟ (ไหล่ชั้นลึก)</title>
      </g>

      {/* Intercostal Muscles */}
      <g className={getStyle("intercostal").group} onClick={() => onSelectId("intercostal")}>
        <path d="M 175 90 Q 163 110 178 125 L 188 120 Q 178 105 188 95 Z" fill={getStyle("intercostal").fill} stroke={getStyle("intercostal").stroke} strokeWidth={getStyle("intercostal").strokeWidth} />
        <path d="M 275 90 Q 287 110 272 125 L 262 120 Q 272 105 262 95 Z" fill={getStyle("intercostal").fill} stroke={getStyle("intercostal").stroke} strokeWidth={getStyle("intercostal").strokeWidth} />
        <title>กล้ามเนื้อระหว่างซี่โครง</title>
      </g>

      {/* Diaphragm */}
      <g className={getStyle("diaphragm").group} onClick={() => onSelectId("diaphragm")}>
        <path d="M 163 130 C 163 130, 200 90, 225 90 C 250 90, 287 130, 287 130 C 287 130, 250 115, 225 115 C 200 115, 163 130, 163 130 Z" fill={getStyle("diaphragm").fill} stroke={getStyle("diaphragm").stroke} strokeWidth={getStyle("diaphragm").strokeWidth} />
        <title>กะบังลม</title>
      </g>

      {/* Transverse Abdominis */}
      <g className={getStyle("transverse").group} onClick={() => onSelectId("transverse")}>
        <rect x="195" y="152" width="60" height="42" rx="3" fill={getStyle("transverse").fill} stroke={getStyle("transverse").stroke} strokeWidth={getStyle("transverse").strokeWidth} />
        <line x1="195" y1="162" x2="255" y2="162" stroke="#ffffff" strokeWidth="1" />
        <line x1="195" y1="172" x2="255" y2="172" stroke="#ffffff" strokeWidth="1" />
        <line x1="195" y1="182" x2="255" y2="182" stroke="#ffffff" strokeWidth="1" />
        <title>ทรานส์เวอร์ซัสแอบโดมินิส (หน้าท้องชั้นลึก)</title>
      </g>

      {/* Multifidus */}
      <g className={getStyle("multifidus").group} onClick={() => onSelectId("multifidus")}>
        <path d="M 220 70 L 225 65 L 230 70 M 220 90 L 225 85 L 230 90 M 220 110 L 225 105 L 230 110 M 220 130 L 225 125 L 230 130 M 220 150 L 225 145 L 230 150" fill="none" stroke={getStyle("multifidus").stroke} strokeWidth={getStyle("multifidus").strokeWidth + 1.5} strokeLinecap="round" />
        <title>มัลติฟิดัส (หลังชั้นลึก/พยุงหลัง)</title>
      </g>

      {/* Iliopsoas */}
      <g className={getStyle("iliopsoas").group} onClick={() => onSelectId("iliopsoas")}>
        <path d="M 215 158 Q 200 190 190 232 L 202 232 Q 212 195 220 170 Z" fill={getStyle("iliopsoas").fill} stroke={getStyle("iliopsoas").stroke} strokeWidth={getStyle("iliopsoas").strokeWidth} />
        <path d="M 235 158 Q 250 190 260 232 L 248 232 Q 238 195 230 170 Z" fill={getStyle("iliopsoas").fill} stroke={getStyle("iliopsoas").stroke} strokeWidth={getStyle("iliopsoas").strokeWidth} />
        <title>อิลิโอโซแอส (สะโพกชั้นลึก)</title>
      </g>

      {/* Pelvic Floor */}
      <g className={getStyle("pelvic-floor").group} onClick={() => onSelectId("pelvic-floor")}>
        <path d="M 207 232 Q 225 245 243 232 C 243 232, 235 240, 225 240 C 215 240, 207 232, 207 232 Z" fill={getStyle("pelvic-floor").fill} stroke={getStyle("pelvic-floor").stroke} strokeWidth={getStyle("pelvic-floor").strokeWidth} />
        <title>กล้ามเนื้อพื้นเชิงกราน</title>
      </g>
    </svg>
  );
}

function MineralsDiagram({
  lab,
  selectedId,
  onSelectId,
}: {
  lab: FoundationExplorerLab;
  selectedId: string;
  onSelectId: (id: string) => void;
}) {
  const goodItems = lab.items.filter(item => item.side === "good");
  const badItems = lab.items.filter(item => item.side === "bad");

  const getStyle = (id: string, side?: "good" | "bad") => {
    const active = selectedId === id;
    let strokeColor = "#cbd5e1";
    let fillColor = "#ffffff";
    if (active) {
      strokeColor = side === "good" ? "#10b981" : "#ef4444";
      fillColor = side === "good" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)";
    }
    return {
      group: `cursor-pointer transition-all duration-200 ${active ? "scale-105 origin-center" : "opacity-75 hover:opacity-95"}`,
      stroke: strokeColor,
      fill: fillColor,
      strokeWidth: active ? 2.5 : 1,
    };
  };

  const drawHexagonPath = (cx: number, cy: number, r: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return `M ${points.join(" L ")} Z`;
  };

  const getSymbol = (id: string) => {
    switch (id) {
      case "calcium": return "Ca";
      case "iron": return "Fe";
      case "iodine": return "I";
      case "zinc": return "Zn";
      case "magnesium": return "Mg";
      case "potassium": return "K";
      case "lead": return "Pb";
      case "mercury": return "Hg";
      case "cadmium": return "Cd";
      case "arsenic": return "As";
      case "excess-sodium": return "Na";
      case "excess-iron": return "Fe+";
      default: return "";
    }
  };

  return (
    <svg viewBox="0 0 450 320" className="w-full h-full" aria-label="กระดานเปรียบเทียบแร่ธาตุจำเป็นกับแร่ธาตุควรระวัง" role="img">
      <line x1="225" y1="20" x2="225" y2="260" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />

      {/* Left Column Title */}
      <g transform="translate(30, 20)">
        <path d="M 0 0 L 14 -5 L 28 0 C 28 10, 22 20, 14 26 C 6 20, 0 10, 0 0 Z" fill="#3b82f6" opacity="0.8" />
        <text x="35" y="16" fill="#1e3a8a" fontSize="11" fontWeight="black">แร่ธาตุจำเป็น</text>
      </g>

      {/* Right Column Title */}
      <g transform="translate(250, 20)">
        <path d="M 14 -5 L 28 20 L 0 20 Z" fill="#ef4444" opacity="0.8" />
        <text x="14" y="14" fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">!</text>
        <text x="35" y="16" fill="#7f1d1d" fontSize="11" fontWeight="black">ควรระวัง / มีพิษ</text>
      </g>

      {/* Good Minerals */}
      {goodItems.map((item, index) => {
        const row = index % 3;
        const col = Math.floor(index / 3);
        const cx = 65 + col * 100;
        const cy = 70 + row * 62;
        const symbol = getSymbol(item.id);
        const style = getStyle(item.id, "good");

        return (
          <g key={item.id} className={style.group} onClick={() => onSelectId(item.id)}>
            <path d={drawHexagonPath(cx, cy, 26)} fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} />
            <text x={cx} y={cy + 3} fill="#0f172a" fontSize="12" fontWeight="black" textAnchor="middle">{symbol}</text>
            <text x={cx} y={cy + 18} fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle">{item.name}</text>
            <title>{item.name}</title>
          </g>
        );
      })}

      {/* Bad Minerals */}
      {badItems.map((item, index) => {
        const row = index % 3;
        const col = Math.floor(index / 3);
        const cx = 285 + col * 100;
        const cy = 70 + row * 62;
        const symbol = getSymbol(item.id);
        const style = getStyle(item.id, "bad");

        return (
          <g key={item.id} className={style.group} onClick={() => onSelectId(item.id)}>
            <path d={drawHexagonPath(cx, cy, 26)} fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} />
            <text x={cx} y={cy + 3} fill="#0f172a" fontSize="12" fontWeight="black" textAnchor="middle">{symbol}</text>
            <text x={cx} y={cy + 18} fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle">{item.name}</text>
            <title>{item.name}</title>
          </g>
        );
      })}
    </svg>
  );
}

function MiniDiagram({
  lab,
  selectedId,
  onSelectId,
}: {
  lab: FoundationExplorerLab;
  selectedId: string;
  onSelectId: (id: string) => void;
}) {
  const visualKind = lab.visualKind;

  return (
    <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[30px] border border-white/60 bg-gradient-to-br from-white/90 via-sky-50/70 to-emerald-50/60 p-6 shadow-inner">
      <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="absolute -right-16 bottom-8 h-44 w-44 rounded-full bg-emerald-200/35 blur-3xl" />

      <div className="w-full max-w-[450px] aspect-[450/320] flex items-center justify-center pb-12">
        {visualKind === "equipment" && <EquipmentDiagram selectedId={selectedId} onSelectId={onSelectId} />}
        {visualKind === "animal-cell" && <AnimalCellDiagram selectedId={selectedId} onSelectId={onSelectId} />}
        {visualKind === "leaf-cell" && <LeafCellDiagram selectedId={selectedId} onSelectId={onSelectId} />}
        {visualKind === "blood" && <HumanBloodCellsDiagram selectedId={selectedId} onSelectId={onSelectId} />}
        {visualKind === "chemicals" && <ExperimentChemicalsDiagram lab={lab} selectedId={selectedId} onSelectId={onSelectId} />}
        {visualKind === "external-muscle" && <ExternalMuscleDiagram selectedId={selectedId} onSelectId={onSelectId} />}
        {visualKind === "internal-muscle" && <InternalMuscleDiagram selectedId={selectedId} onSelectId={onSelectId} />}
        {visualKind === "minerals" && <MineralsDiagram lab={lab} selectedId={selectedId} onSelectId={onSelectId} />}
      </div>

      <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm font-bold leading-relaxed text-slate-700 shadow-sm backdrop-blur-md">
        {lab.keyLine}
      </div>
    </div>
  );
}

function DetailCard({ item, lab }: { item: FoundationExplorerItem; lab: FoundationExplorerLab }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${toneClasses[lab.accent]}`}>{item.tag}</span>
        {item.side && (
          <span className={`rounded-full px-3 py-1 text-xs font-black ${item.side === "good" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {item.side === "good" ? "ฝั่งดี" : "ฝั่งระวัง"}
          </span>
        )}
      </div>
      <h3 className="text-xl font-black text-slate-950">{item.name}</h3>
      <p className="mt-1 text-sm font-bold text-slate-500">{item.subtitle}</p>
      <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-600">{item.detail}</p>
    </div>
  );
}

function ChemicalListModal({
  lab,
  onClose,
}: {
  lab: FoundationExplorerLab;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="รายการสารเคมีในการทดลอง">
      <div className="max-h-[86%] w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Chemical list</p>
            <h2 className="text-2xl font-black text-slate-950">รายการสารเคมีในการทดลอง</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">อ่านหน้าที่และข้อควรระวังของสารที่พบบ่อยในห้องแล็บ</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            aria-label="ปิดรายการสารเคมี"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[62vh] overflow-y-auto p-5">
          <div className="grid gap-3 md:grid-cols-2">
            {lab.items.map((item) => (
              <DetailCard key={item.id} item={item} lab={lab} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExplorerScene({ lab }: { lab: FoundationExplorerLab }) {
  const [selectedId, setSelectedId] = useState(lab.items[0]?.id ?? "");
  const [chemicalsOpen, setChemicalsOpen] = useState(false);
  const selected = lab.items.find((item) => item.id === selectedId) ?? lab.items[0];
  const isChemicals = lab.visualKind === "chemicals";

  return (
    <section className="relative grid min-h-full gap-5 bg-slate-50 p-5 lg:grid-cols-[1.05fr_0.95fr]">
      <MiniDiagram lab={lab} selectedId={selectedId} onSelectId={setSelectedId} />

      <div className="flex min-h-[320px] flex-col gap-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className={`text-xs font-black uppercase tracking-[0.16em] ${toneClasses[lab.accent].split(" ")[2]}`}>{lab.sceneLabel}</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{lab.thaiTitle}</h2>
            </div>
            {isChemicals && (
              <button
                type="button"
                onClick={() => setChemicalsOpen(true)}
                className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                เปิดรายการสารเคมี
              </button>
            )}
          </div>

          <div className={lab.visualKind === "minerals" ? "grid gap-3 md:grid-cols-2" : "grid max-h-[300px] gap-3 overflow-y-auto pr-1 md:grid-cols-2"}>
            {lab.items.slice(0, isChemicals ? 6 : lab.items.length).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  selected?.id === item.id ? `${toneClasses[lab.accent]} shadow-sm` : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <span className="text-xs font-black text-slate-400">{item.tag}</span>
                <p className="mt-1 text-sm font-black text-slate-950">{item.name}</p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{item.subtitle}</p>
              </button>
            ))}
          </div>
        </div>

        {selected && <DetailCard item={selected} lab={lab} />}
      </div>

      {chemicalsOpen && <ChemicalListModal lab={lab} onClose={() => setChemicalsOpen(false)} />}
    </section>
  );
}

export default function FoundationExplorerSimulation() {
  const params = useParams();
  const labId = typeof params?.id === "string" && isFoundationExplorerLabId(params.id)
    ? params.id
    : "lab-equipment-overview";
  const lab = foundationExplorerLabs[labId];
  const Icon = iconMap[lab.visualKind];

  const controls = (
    <div className="grid gap-3">
      {lab.overviewBullets.map((item, index) => (
        <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-black text-slate-400">หัวข้อที่ {index + 1}</p>
          <p className="text-sm font-bold leading-relaxed text-slate-700">{item}</p>
        </div>
      ))}
    </div>
  );

  return (
    <SharedSimulationShell
      accent={lab.accent}
      labId={lab.id}
      category="Foundation"
      title={lab.thaiTitle}
      subtitle={lab.subtitle}
      statusLabel={`สำรวจ ${lab.items.length} หัวข้อ`}
      icon={Icon}
      sceneTitle={lab.sceneLabel}
      scene={<ExplorerScene lab={lab} />}
      controlsTitle="แนวทางการสำรวจ"
      controls={controls}
      compactControls={controls}
      metrics={[
        { label: "หมวด", value: "ความรู้พื้นฐาน", tone: lab.accent },
        { label: "หัวข้อ", value: `${lab.items.length} รายการ`, tone: "cyan" },
        { label: "รูปแบบ", value: "สำรวจข้อมูล", tone: "emerald" },
      ]}
      graph={<p>{lab.keyLine}</p>}
      table={<p>{lab.theory}</p>}
      theory={<p className="leading-relaxed text-slate-600">{lab.theory}</p>}
      steps={[
        { label: "อ่านภาพรวม", icon: Info },
        { label: "เลือกหัวข้อบนภาพ", icon: Sparkles },
        { label: "ทบทวนข้อควรจำ", icon: ListChecks },
      ]}
      learningGoals={lab.learningObjectives}
      progressLabel="การสำรวจ"
      progressValue="เลือกหัวข้อเพื่ออ่านรายละเอียด"
      progressPercent={0}
      tips={lab.tips}
      showSaveButton={false}
      showLiveMetrics={false}
      showInfoTabs={false}
    />
  );
}
