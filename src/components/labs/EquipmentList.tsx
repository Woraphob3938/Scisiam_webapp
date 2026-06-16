"use client";

import React from "react";
import { Beaker, CheckCircle2, ChevronDown } from "lucide-react";
import { labsById } from "@/data/labs";
import { getLabDetails } from "@/data/labDetails";

type EquipmentTone = "rose" | "blue" | "amber" | "orange" | "cyan" | "violet" | "emerald";

interface EquipmentItem {
  id: string;
  name: string;
  role: string;
  note: string;
  unit: string;
  tone: EquipmentTone;
  visual: React.ReactNode;
}

const toneClasses: Record<EquipmentTone, {
  row: string;
  visual: string;
  accent: string;
  text: string;
}> = {
  rose: {
    row: "border-rose-100/80 bg-rose-50/35",
    visual: "bg-white text-rose-500",
    accent: "bg-rose-500",
    text: "text-rose-600",
  },
  blue: {
    row: "border-blue-100/80 bg-blue-50/35",
    visual: "bg-white text-blue-500",
    accent: "bg-blue-500",
    text: "text-blue-600",
  },
  amber: {
    row: "border-amber-100/80 bg-amber-50/35",
    visual: "bg-white text-amber-500",
    accent: "bg-amber-500",
    text: "text-amber-600",
  },
  orange: {
    row: "border-orange-100/80 bg-orange-50/35",
    visual: "bg-white text-orange-500",
    accent: "bg-orange-500",
    text: "text-orange-600",
  },
  cyan: {
    row: "border-cyan-100/80 bg-cyan-50/35",
    visual: "bg-white text-cyan-500",
    accent: "bg-cyan-500",
    text: "text-cyan-600",
  },
  violet: {
    row: "border-violet-100/80 bg-violet-50/35",
    visual: "bg-white text-violet-500",
    accent: "bg-violet-500",
    text: "text-violet-600",
  },
  emerald: {
    row: "border-emerald-100/80 bg-emerald-50/35",
    visual: "bg-white text-emerald-500",
    accent: "bg-emerald-500",
    text: "text-emerald-600",
  },
};

const ThermometerVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="39" y="10" width="18" height="56" rx="9" fill="#ffffff" stroke="#f43f5e" strokeWidth="4" />
    <circle cx="48" cy="70" r="15" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="4" />
    <path d="M48 58V24" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
    <circle cx="48" cy="70" r="9" fill="#f43f5e" />
    <path d="M61 24H72M61 36H68M61 48H72" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
    <text x="24" y="88" fill="#e11d48" fontSize="9" fontWeight="800">TEMP</text>
  </svg>
);

const BeakerVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <path d="M28 14H68" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
    <path d="M34 16V68C34 76 40 82 48 82C56 82 62 76 62 68V16" fill="#eff6ff" />
    <path d="M34 16V68C34 76 40 82 48 82C56 82 62 76 62 68V16" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
    <path d="M36 54H60V68C60 74 55 79 48 79C41 79 36 74 36 68V54Z" fill="#93c5fd" />
    <path d="M63 30H72M63 42H69M63 54H72" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
    <circle cx="43" cy="63" r="3" fill="#ffffff" opacity="0.9" />
    <circle cx="52" cy="70" r="2" fill="#ffffff" opacity="0.8" />
    <text x="29" y="90" fill="#2563eb" fontSize="9" fontWeight="800">250 ml</text>
  </svg>
);

const StopwatchVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="41" y="10" width="14" height="10" rx="3" fill="#f59e0b" />
    <path d="M38 22H58" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    <circle cx="48" cy="54" r="28" fill="#fffbeb" stroke="#f59e0b" strokeWidth="4" />
    <path d="M48 34V55L63 45" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M48 28V33M48 75V80M22 54H27M69 54H74" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
    <text x="31" y="90" fill="#d97706" fontSize="9" fontWeight="800">TIME</text>
  </svg>
);

const HotWaterVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <path d="M29 40H64V70C64 78 57 84 48 84C38 84 29 78 29 68V40Z" fill="#fff7ed" stroke="#f97316" strokeWidth="4" />
    <path d="M33 56H60V68C60 75 55 80 48 80C40 80 33 75 33 68V56Z" fill="#fb923c" opacity="0.8" />
    <path d="M64 48H72C78 48 80 56 75 61C72 64 68 64 64 63" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
    <path d="M38 30C34 24 42 20 38 14M49 30C45 24 53 20 49 14M60 30C56 24 64 20 60 14" stroke="#fdba74" strokeWidth="4" strokeLinecap="round" />
    <text x="27" y="92" fill="#ea580c" fontSize="9" fontWeight="800">HOT</text>
  </svg>
);

const IceVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <path d="M48 14L22 28L48 42L74 28L48 14Z" fill="#bae6fd" stroke="#06b6d4" strokeWidth="3" />
    <path d="M22 28V60L48 76V42L22 28Z" fill="#67e8f9" stroke="#06b6d4" strokeWidth="3" />
    <path d="M74 28V60L48 76V42L74 28Z" fill="#38bdf8" stroke="#06b6d4" strokeWidth="3" />
    <path d="M34 34L48 42L63 34M48 42V76" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" />
    <path d="M21 78C31 73 42 75 50 78C58 81 68 81 77 76" stroke="#67e8f9" strokeWidth="4" strokeLinecap="round" />
    <text x="31" y="91" fill="#0891b2" fontSize="9" fontWeight="800">ICE</text>
  </svg>
);

const PowerSupplyVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="20" y="20" width="56" height="56" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="4" />
    <circle cx="36" cy="40" r="6" fill="#ef4444" />
    <circle cx="60" cy="40" r="6" fill="#334155" />
    <text x="48" y="62" fill="#3b82f6" fontSize="12" fontWeight="900" textAnchor="middle">V</text>
    <text x="48" y="90" fill="#2563eb" fontSize="9" fontWeight="800">DC SOURCE</text>
  </svg>
);

const AmmeterVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <circle cx="48" cy="48" r="32" fill="#fffbeb" stroke="#f59e0b" strokeWidth="4" />
    <text x="48" y="56" fill="#d97706" fontSize="24" fontWeight="900" textAnchor="middle">A</text>
    <text x="48" y="90" fill="#d97706" fontSize="9" fontWeight="800">AMMETER</text>
  </svg>
);

const ResistorVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="25" y="38" width="46" height="20" rx="4" fill="#fef08a" stroke="#d97706" strokeWidth="3" />
    <rect x="35" y="38" width="4" height="20" fill="#b45309" />
    <rect x="45" y="38" width="4" height="20" fill="#ef4444" />
    <rect x="55" y="38" width="4" height="20" fill="#eab308" />
    <line x1="10" y1="48" x2="25" y2="48" stroke="#94a3b8" strokeWidth="4" />
    <line x1="71" y1="48" x2="86" y2="48" stroke="#94a3b8" strokeWidth="4" />
    <text x="48" y="90" fill="#b45309" fontSize="9" fontWeight="800">RESISTOR</text>
  </svg>
);

const VoltmeterVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <circle cx="48" cy="48" r="32" fill="#fff1f2" stroke="#f43f5e" strokeWidth="4" />
    <text x="48" y="56" fill="#e11d48" fontSize="24" fontWeight="900" textAnchor="middle">V</text>
    <text x="48" y="90" fill="#e11d48" fontSize="9" fontWeight="800">VOLTMETER</text>
  </svg>
);

const WiresVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <path d="M20 30 Q 40 10 50 50 T 80 70" stroke="#06b6d4" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M20 70 Q 40 50 60 80 T 80 30" stroke="#0891b2" strokeWidth="3" fill="none" strokeLinecap="round" />
    <text x="48" y="90" fill="#0891b2" fontSize="9" fontWeight="800">CABLES</text>
  </svg>
);

const BuretteVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="40" y="8" width="16" height="58" rx="8" fill="#ecfeff" stroke="#06b6d4" strokeWidth="3" />
    <rect x="44" y="16" width="8" height="36" rx="4" fill="#67e8f9" opacity="0.75" />
    <path d="M56 18H65M56 30H62M56 42H65M56 54H62" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" />
    <path d="M48 66V80" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" />
    <path d="M40 72H56" stroke="#0e7490" strokeWidth="4" strokeLinecap="round" />
    <path d="M48 82C48 82 43 87 43 90C43 93 45 95 48 95C51 95 53 93 53 90C53 87 48 82 48 82Z" fill="#22c55e" />
    <text x="48" y="91" fill="#0891b2" fontSize="9" fontWeight="800" textAnchor="middle">BURETTE</text>
  </svg>
);

const ErlenmeyerVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <path d="M39 12H57M42 12V40L23 76C20 82 24 88 31 88H65C72 88 76 82 73 76L54 40V12" fill="#fff1f2" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30 66H66L72 78C74 82 71 86 66 86H30C25 86 22 82 24 78L30 66Z" fill="#f9a8d4" opacity="0.75" />
    <path d="M34 74C43 70 53 70 62 74" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <text x="48" y="96" fill="#e11d48" fontSize="9" fontWeight="800" textAnchor="middle">FLASK</text>
  </svg>
);

const PipetteVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <path d="M26 70L66 30" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
    <path d="M60 24L72 36" stroke="#93c5fd" strokeWidth="12" strokeLinecap="round" />
    <path d="M22 74L16 80" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
    <path d="M17 82C17 82 12 87 12 90C12 93 14 95 17 95C20 95 22 93 22 90C22 87 17 82 17 82Z" fill="#38bdf8" />
    <text x="48" y="90" fill="#2563eb" fontSize="9" fontWeight="800" textAnchor="middle">PIPETTE</text>
  </svg>
);

const IndicatorVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="34" y="12" width="28" height="62" rx="8" fill="#fdf2f8" stroke="#ec4899" strokeWidth="3" />
    <rect x="39" y="28" width="18" height="36" rx="7" fill="#f9a8d4" opacity="0.85" />
    <path d="M36 18H60" stroke="#be185d" strokeWidth="4" strokeLinecap="round" />
    <circle cx="70" cy="62" r="7" fill="#22c55e" opacity="0.85" />
    <circle cx="26" cy="56" r="5" fill="#38bdf8" opacity="0.85" />
    <text x="48" y="90" fill="#be185d" fontSize="9" fontWeight="800" textAnchor="middle">INDICATOR</text>
  </svg>
);

const PHMeterVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="25" y="16" width="46" height="54" rx="9" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
    <rect x="32" y="25" width="32" height="18" rx="4" fill="#d1fae5" stroke="#34d399" strokeWidth="2" />
    <text x="48" y="39" fill="#047857" fontSize="13" fontWeight="900" textAnchor="middle">7.0</text>
    <circle cx="39" cy="55" r="4" fill="#10b981" />
    <circle cx="57" cy="55" r="4" fill="#64748b" />
    <path d="M48 70V86" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
    <text x="48" y="95" fill="#059669" fontSize="9" fontWeight="800" textAnchor="middle">pH METER</text>
  </svg>
);

const GasSyringeVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="14" y="36" width="56" height="24" rx="10" fill="#eff6ff" stroke="#3b82f6" strokeWidth="3" />
    <rect x="23" y="41" width="29" height="14" rx="7" fill="#bfdbfe" />
    <path d="M29 36V60M41 36V60M53 36V60" stroke="#93c5fd" strokeWidth="2" />
    <rect x="55" y="42" width="10" height="12" rx="4" fill="#64748b" />
    <path d="M65 48H86" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
    <path d="M85 34V62" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
    <text x="48" y="90" fill="#2563eb" fontSize="9" fontWeight="800" textAnchor="middle">SYRINGE</text>
  </svg>
);

const PressureGaugeVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <circle cx="48" cy="44" r="30" fill="#ecfeff" stroke="#06b6d4" strokeWidth="4" />
    <path d="M30 54C33 39 41 32 55 32" stroke="#bae6fd" strokeWidth="5" strokeLinecap="round" />
    <path d="M48 44L63 34" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
    <circle cx="48" cy="44" r="5" fill="#ef4444" />
    <text x="48" y="64" fill="#0891b2" fontSize="11" fontWeight="900" textAnchor="middle">kPa</text>
    <text x="48" y="91" fill="#0891b2" fontSize="9" fontWeight="800" textAnchor="middle">GAUGE</text>
  </svg>
);

const PistonVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="20" y="28" width="36" height="40" rx="8" fill="#fff7ed" stroke="#f97316" strokeWidth="3" />
    <rect x="44" y="32" width="10" height="32" rx="4" fill="#f97316" opacity="0.75" />
    <path d="M54 48H78" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
    <path d="M76 34V62" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
    <path d="M26 39H38M26 48H34M26 57H38" stroke="#fdba74" strokeWidth="2.5" strokeLinecap="round" />
    <text x="48" y="90" fill="#ea580c" fontSize="9" fontWeight="800" textAnchor="middle">PISTON</text>
  </svg>
);

const GasMoleculesVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="18" y="20" width="60" height="54" rx="14" fill="#f8fafc" stroke="#10b981" strokeWidth="3" />
    <circle cx="35" cy="37" r="5" fill="#22c55e" />
    <circle cx="57" cy="34" r="4" fill="#60a5fa" />
    <circle cx="48" cy="54" r="5" fill="#a78bfa" />
    <circle cx="65" cy="60" r="4" fill="#f59e0b" />
    <path d="M35 37L57 34M48 54L65 60M35 37L48 54" stroke="#cbd5e1" strokeWidth="1.5" />
    <text x="48" y="90" fill="#059669" fontSize="9" fontWeight="800" textAnchor="middle">GAS</text>
  </svg>
);

const PlantChamberVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="18" y="14" width="60" height="66" rx="18" fill="#ecfdf5" stroke="#22c55e" strokeWidth="3" />
    <path d="M48 70V39" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" />
    <path d="M48 48C34 35 22 39 16 51C29 58 40 59 48 48Z" fill="#22c55e" />
    <path d="M48 40C63 26 78 31 83 45C68 51 57 51 48 40Z" fill="#16a34a" />
    <rect x="35" y="69" width="26" height="11" rx="4" fill="#92400e" />
    <text x="48" y="94" fill="#16a34a" fontSize="9" fontWeight="800" textAnchor="middle">PLANT</text>
  </svg>
);

const GrowLightVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <circle cx="48" cy="34" r="20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" />
    <path d="M48 5V15M48 53V63M19 34H9M87 34H77M27 13L20 6M76 62L69 55M27 55L20 62M76 6L69 13" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    <path d="M32 62L20 82M48 64L48 86M64 62L76 82" stroke="#fde68a" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
    <text x="48" y="94" fill="#d97706" fontSize="9" fontWeight="800" textAnchor="middle">LIGHT</text>
  </svg>
);

const CO2TankVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="31" y="18" width="34" height="60" rx="12" fill="#ecfeff" stroke="#06b6d4" strokeWidth="3" />
    <path d="M39 18V10H57V18" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" />
    <text x="48" y="52" fill="#0891b2" fontSize="17" fontWeight="900" textAnchor="middle">CO₂</text>
    <path d="M65 40H82" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" strokeDasharray="5 5" />
    <text x="48" y="92" fill="#0891b2" fontSize="9" fontWeight="800" textAnchor="middle">CO2</text>
  </svg>
);

const OxygenSensorVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="26" y="14" width="44" height="54" rx="10" fill="#f0fdf4" stroke="#10b981" strokeWidth="3" />
    <rect x="34" y="24" width="28" height="18" rx="5" fill="#dcfce7" stroke="#86efac" strokeWidth="2" />
    <text x="48" y="38" fill="#047857" fontSize="12" fontWeight="900" textAnchor="middle">O₂</text>
    <circle cx="40" cy="54" r="4" fill="#22c55e" />
    <circle cx="56" cy="54" r="4" fill="#64748b" />
    <path d="M48 68V85" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
    <text x="48" y="95" fill="#059669" fontSize="9" fontWeight="800" textAnchor="middle">SENSOR</text>
  </svg>
);

const WaterReservoirVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <path d="M24 28H72L66 78H30L24 28Z" fill="#eff6ff" stroke="#3b82f6" strokeWidth="3" />
    <path d="M30 52C40 45 50 58 62 50L58 74H34L30 52Z" fill="#60a5fa" opacity="0.75" />
    <path d="M30 52C40 45 50 58 62 50" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
    <path d="M72 38H84V58" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
    <text x="48" y="92" fill="#2563eb" fontSize="9" fontWeight="800" textAnchor="middle">WATER</text>
  </svg>
);

const ClipboardListVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="26" y="16" width="44" height="62" rx="8" fill="#fffbeb" stroke="#f59e0b" strokeWidth="3" />
    <rect x="37" y="10" width="22" height="14" rx="5" fill="#fde68a" stroke="#d97706" strokeWidth="3" />
    <path d="M36 38H60M36 50H60M36 62H54" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
    <text x="48" y="92" fill="#d97706" fontSize="9" fontWeight="800" textAnchor="middle">DATA</text>
  </svg>
);

const PunnettSquareVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="18" y="16" width="60" height="60" rx="10" fill="#faf5ff" stroke="#8b5cf6" strokeWidth="3" />
    <path d="M48 16V76M18 46H78" stroke="#c4b5fd" strokeWidth="3" />
    <text x="33" y="39" fill="#7c3aed" fontSize="12" fontWeight="900" textAnchor="middle">YY</text>
    <text x="63" y="39" fill="#7c3aed" fontSize="12" fontWeight="900" textAnchor="middle">Yy</text>
    <text x="33" y="69" fill="#7c3aed" fontSize="12" fontWeight="900" textAnchor="middle">Yy</text>
    <text x="63" y="69" fill="#475569" fontSize="12" fontWeight="900" textAnchor="middle">yy</text>
    <text x="48" y="92" fill="#7c3aed" fontSize="9" fontWeight="800" textAnchor="middle">PUNNETT</text>
  </svg>
);

const PeaPlantVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <path d="M48 76V28" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
    <path d="M48 46C31 31 17 36 10 50C26 58 40 59 48 46Z" fill="#22c55e" />
    <path d="M48 34C66 18 83 24 89 40C71 48 58 49 48 34Z" fill="#16a34a" />
    <circle cx="32" cy="58" r="5" fill="#facc15" />
    <circle cx="61" cy="52" r="5" fill="#facc15" />
    <rect x="34" y="76" width="28" height="10" rx="4" fill="#92400e" />
    <text x="48" y="96" fill="#16a34a" fontSize="9" fontWeight="800" textAnchor="middle">PEA</text>
  </svg>
);

const ChromosomeVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <path d="M32 18C44 34 52 48 64 78" stroke="#8b5cf6" strokeWidth="9" strokeLinecap="round" />
    <path d="M64 18C52 34 44 48 32 78" stroke="#8b5cf6" strokeWidth="9" strokeLinecap="round" />
    <circle cx="48" cy="48" r="7" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="2" />
    <text x="48" y="94" fill="#7c3aed" fontSize="9" fontWeight="800" textAnchor="middle">GENE</text>
  </svg>
);

const MicroscopeSlideVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="16" y="34" width="64" height="28" rx="8" fill="#ecfeff" stroke="#06b6d4" strokeWidth="3" />
    <circle cx="48" cy="48" r="11" fill="#cffafe" stroke="#0891b2" strokeWidth="3" />
    <path d="M43 48C45 42 52 42 54 48C52 55 45 55 43 48Z" fill="#8b5cf6" />
    <text x="48" y="88" fill="#0891b2" fontSize="9" fontWeight="800" textAnchor="middle">SLIDE</text>
  </svg>
);

const SpindleVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <circle cx="20" cy="48" r="7" fill="#0891b2" />
    <circle cx="76" cy="48" r="7" fill="#0891b2" />
    <path d="M20 48C35 25 61 25 76 48M20 48C35 71 61 71 76 48" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 5" />
    <path d="M41 34L55 62M55 34L41 62" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" />
    <text x="48" y="92" fill="#0891b2" fontSize="9" fontWeight="800" textAnchor="middle">SPINDLE</text>
  </svg>
);

interface EquipmentListProps {
  labId: string;
}

const SpringVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="40" y="8" width="16" height="6" rx="2" fill="#94a3b8" />
    <path d="M48 14 L36 22 L60 30 L36 38 L60 46 L36 54 L60 62 L36 70 L48 78" stroke="#8b5cf6" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="38" y="78" width="20" height="10" rx="3" fill="#a78bfa" />
    <text x="48" y="96" fill="#7c3aed" fontSize="9" fontWeight="800" textAnchor="middle">SPRING</text>
  </svg>
);

const MassSetVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="30" y="30" width="36" height="50" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" />
    <text x="48" y="62" fill="#d97706" fontSize="18" fontWeight="900" textAnchor="middle">g</text>
    <path d="M38 30 L38 22 L58 22 L58 30" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
    <text x="48" y="90" fill="#d97706" fontSize="9" fontWeight="800" textAnchor="middle">MASS</text>
  </svg>
);

const RulerVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="38" y="10" width="20" height="72" rx="3" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
    <line x1="42" y1="20" x2="50" y2="20" stroke="#10b981" strokeWidth="2" />
    <line x1="42" y1="30" x2="54" y2="30" stroke="#10b981" strokeWidth="2" />
    <line x1="42" y1="40" x2="50" y2="40" stroke="#10b981" strokeWidth="2" />
    <line x1="42" y1="50" x2="54" y2="50" stroke="#10b981" strokeWidth="2" />
    <line x1="42" y1="60" x2="50" y2="60" stroke="#10b981" strokeWidth="2" />
    <line x1="42" y1="70" x2="54" y2="70" stroke="#10b981" strokeWidth="2" />
    <text x="48" y="90" fill="#059669" fontSize="9" fontWeight="800" textAnchor="middle">RULER</text>
  </svg>
);

const RetortStandVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="44" y="10" width="8" height="72" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="2.5" />
    <rect x="26" y="76" width="44" height="8" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
    <line x1="48" y1="30" x2="72" y2="30" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
    <circle cx="72" cy="30" r="3" fill="#f43f5e" />
    <text x="48" y="96" fill="#475569" fontSize="9" fontWeight="800" textAnchor="middle">STAND</text>
  </svg>
);

const LaserSourceVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="20" y="38" width="46" height="20" rx="4" fill="#fecaca" stroke="#ef4444" strokeWidth="3" />
    <rect x="66" y="44" width="10" height="8" rx="1" fill="#475569" />
    <line x1="76" y1="48" x2="86" y2="48" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
    <text x="48" y="90" fill="#dc2626" fontSize="9" fontWeight="800" textAnchor="middle">LASER</text>
  </svg>
);

const AcrylicBlockVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <path d="M18 48 C18 20 78 20 78 48 Z" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="3.5" />
    <line x1="16" y1="48" x2="80" y2="48" stroke="#0284c7" strokeWidth="3" />
    <text x="48" y="90" fill="#0284c7" fontSize="9" fontWeight="800" textAnchor="middle">PRISM</text>
  </svg>
);

const ProtractorVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <circle cx="48" cy="48" r="32" fill="#fafafa" stroke="#94a3b8" strokeWidth="3" />
    <line x1="48" y1="16" x2="48" y2="80" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 2" />
    <line x1="16" y1="48" x2="80" y2="48" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 2" />
    <text x="48" y="90" fill="#475569" fontSize="9" fontWeight="800" textAnchor="middle">ANGLE</text>
  </svg>
);

const OpticalBenchVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="14" y="44" width="68" height="8" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="2.5" />
    <rect x="28" y="24" width="40" height="20" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
    <text x="48" y="90" fill="#475569" fontSize="9" fontWeight="800" textAnchor="middle">BENCH</text>
  </svg>
);

const GasTankVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="30" y="20" width="36" height="56" rx="10" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
    <path d="M41 20 V12 H55 V20" stroke="#059669" strokeWidth="3" />
    <circle cx="48" cy="48" r="8" fill="#d1fae5" stroke="#059669" strokeWidth="2" />
    <text x="48" y="90" fill="#059669" fontSize="9" fontWeight="800" textAnchor="middle">TANK</text>
  </svg>
);

const HeaterCoolerVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="20" y="48" width="56" height="28" rx="6" fill="#fef2f2" stroke="#ef4444" strokeWidth="3" />
    <path d="M 32,48 C 35,32 43,24 48,12 C 53,24 61,32 64,48 Z" fill="#f97316" />
    <text x="48" y="90" fill="#b91c1c" fontSize="9" fontWeight="800" textAnchor="middle">BURNER</text>
  </svg>
);

const WoodenTrackVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="10" y="40" width="76" height="12" rx="2" fill="#ffedd5" stroke="#ea580c" strokeWidth="2.5" />
    <line x1="20" y1="40" x2="20" y2="46" stroke="#ea580c" strokeWidth="1.5" />
    <line x1="48" y1="40" x2="48" y2="46" stroke="#ea580c" strokeWidth="1.5" />
    <line x1="76" y1="40" x2="76" y2="46" stroke="#ea580c" strokeWidth="1.5" />
    <text x="48" y="90" fill="#c2410c" fontSize="9" fontWeight="800" textAnchor="middle">TRACK</text>
  </svg>
);

const DynamicsCartVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="18" y="32" width="60" height="24" rx="4" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="3" />
    <circle cx="30" cy="62" r="8" fill="#475569" stroke="#334155" strokeWidth="2" />
    <circle cx="66" cy="62" r="8" fill="#475569" stroke="#334155" strokeWidth="2" />
    <text x="48" y="90" fill="#6d28d9" fontSize="9" fontWeight="800" textAnchor="middle">CART</text>
  </svg>
);

const PulleySystemVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <circle cx="48" cy="36" r="16" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
    <circle cx="48" cy="36" r="4" fill="#475569" />
    <line x1="32" y1="36" x2="32" y2="70" stroke="#475569" strokeWidth="2" />
    <line x1="64" y1="36" x2="64" y2="70" stroke="#475569" strokeWidth="2" />
    <rect x="24" y="70" width="16" height="12" rx="1" fill="#64748b" />
    <text x="48" y="90" fill="#475569" fontSize="9" fontWeight="800" textAnchor="middle">PULLEY</text>
  </svg>
);

const PhotogateVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <path d="M30 20 H66 V66 H50 V36 H46 V66 H30 Z" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
    <circle cx="48" cy="28" r="3.5" fill="#22c55e" />
    <text x="48" y="90" fill="#1e293b" fontSize="9" fontWeight="800" textAnchor="middle">SENSOR</text>
  </svg>
);

const MomentumTrackVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="55" width="76" height="8" fill="#94a3b8" rx="1" />
    <rect x="25" y="43" width="22" height="12" fill="#8b5cf6" rx="2" />
    <circle cx="30" cy="55" r="3" fill="#1e293b" />
    <circle cx="42" cy="55" r="3" fill="#1e293b" />
    <rect x="52" y="43" width="22" height="12" fill="#3b82f6" rx="2" />
    <circle cx="57" cy="55" r="3" fill="#1e293b" />
    <circle cx="69" cy="55" r="3" fill="#1e293b" />
    <text x="48" y="85" fill="#475569" fontSize="8" fontWeight="800" textAnchor="middle">MOMENTUM</text>
  </svg>
);

const MagnetCoilVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="12" y="24" width="30" height="14" fill="#ef4444" rx="1" />
    <rect x="42" y="24" width="30" height="14" fill="#3b82f6" rx="1" />
    <text x="20" y="34" fill="#ffffff" fontSize="8" fontWeight="900">N</text>
    <text x="58" y="34" fill="#ffffff" fontSize="8" fontWeight="900">S</text>
    <path d="M25 65 C 25 50, 71 50, 71 65" stroke="#f59e0b" strokeWidth="3" fill="none" />
    <path d="M30 68 C 30 54, 66 54, 66 68" stroke="#f59e0b" strokeWidth="3" fill="none" />
    <text x="48" y="86" fill="#b45309" fontSize="8" fontWeight="800" textAnchor="middle">INDUCTION</text>
  </svg>
);

const VenturiTubeVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 32 L32 32 L40 44 L56 44 L64 32 L86 32 L86 64 L64 64 L56 52 L40 52 L32 64 L10 64 Z" fill="#eff6ff" stroke="#3b82f6" strokeWidth="3.5" />
    <line x1="20" y1="36" x2="20" y2="72" stroke="#60a5fa" strokeWidth="2.5" />
    <line x1="48" y1="46" x2="48" y2="72" stroke="#60a5fa" strokeWidth="2.5" />
    <line x1="76" y1="36" x2="76" y2="72" stroke="#60a5fa" strokeWidth="2.5" />
    <text x="48" y="86" fill="#1d4ed8" fontSize="8" fontWeight="800" textAnchor="middle">BERNOULLI</text>
  </svg>
);

const PhotoCellVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="48" cy="45" r="26" fill="#f8fafc" stroke="#64748b" strokeWidth="3" />
    <rect x="35" y="32" width="6" height="26" fill="#475569" />
    <line x1="56" y1="28" x2="56" y2="62" stroke="#ef4444" strokeWidth="2.5" />
    <circle cx="56" cy="45" r="1.5" fill="#ef4444" />
    <text x="48" y="86" fill="#334155" fontSize="8" fontWeight="800" textAnchor="middle">PHOTO-CELL</text>
  </svg>
);

const PlanetaryOrbitVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="48" cy="48" rx="36" ry="20" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="3 2" />
    <circle cx="36" cy="48" r="9" fill="#f59e0b" />
    <circle cx="76" cy="40" r="4.5" fill="#3b82f6" />
    <text x="48" y="88" fill="#1e293b" fontSize="8" fontWeight="800" textAnchor="middle">KEPLER</text>
  </svg>
);

const WienSpectrumVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 70 Q 25 15, 32 15 T 48 55 T 84 70" stroke="#f97316" strokeWidth="3" fill="none" />
    <line x1="12" y1="72" x2="84" y2="72" stroke="#475569" strokeWidth="2" />
    <line x1="14" y1="12" x2="14" y2="72" stroke="#475569" strokeWidth="2" />
    <circle cx="32" cy="15" r="3" fill="#ef4444" />
    <text x="48" y="86" fill="#ea580c" fontSize="8" fontWeight="800" textAnchor="middle">BLACKBODY</text>
  </svg>
);

const SpectrophotometerVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="18" y="24" width="60" height="48" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="3" />
    <rect x="26" y="32" width="22" height="12" rx="2" fill="#1e293b" />
    <path d="M56 38 H70" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
    <circle cx="56" cy="38" r="4" fill="#eab308" />
    <circle cx="70" cy="38" r="3" fill="#10b981" />
    <text x="48" y="86" fill="#2563eb" fontSize="9" fontWeight="800" textAnchor="middle">SPECTRO</text>
  </svg>
);

const CuvetteVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="34" y="14" width="28" height="68" rx="4" fill="rgba(255,255,255,0.7)" stroke="#0891b2" strokeWidth="3" />
    <rect x="38" y="28" width="20" height="50" rx="2" fill="#2563eb" opacity="0.7" />
    <line x1="42" y1="20" x2="42" y2="76" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" />
    <text x="48" y="94" fill="#0891b2" fontSize="9" fontWeight="800" textAnchor="middle">CUVETTE</text>
  </svg>
);

const CalorimeterVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <path d="M26 26 L32 74 C33 80 39 84 46 84 H50 C57 84 63 80 64 74 L70 26 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="3" />
    <ellipse cx="48" cy="26" rx="22" ry="6" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
    <path d="M42 12 V65 H52" stroke="#64748b" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <text x="48" y="94" fill="#475569" fontSize="9" fontWeight="800" textAnchor="middle">CALORIMETER</text>
  </svg>
);

const EquilibriumTubesVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="28" y="16" width="14" height="60" rx="7" fill="rgba(255,255,255,0.8)" stroke="#94a3b8" strokeWidth="2" />
    <rect x="30" y="42" width="10" height="32" rx="5" fill="#f59e0b" opacity="0.8" />
    <rect x="54" y="16" width="14" height="60" rx="7" fill="rgba(255,255,255,0.8)" stroke="#94a3b8" strokeWidth="2" />
    <rect x="56" y="32" width="10" height="42" rx="5" fill="#991b1b" opacity="0.8" />
    <text x="48" y="90" fill="#475569" fontSize="9" fontWeight="800" textAnchor="middle">EQUILIBRIUM</text>
  </svg>
);

const BloodTypingPlateVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="16" y="18" width="64" height="56" rx="14" fill="#ecfeff" stroke="#0891b2" strokeWidth="3" />
    {["A", "B", "D"].map((label, index) => (
      <g key={label} transform={`translate(${30 + index * 18}, 44)`}>
        <circle r="8" fill="#fff1f2" stroke="#fb7185" strokeWidth="2.5" />
        <path d="M-3 -1C0 -5 5 -2 4 3C2 8 -5 6 -4 1Z" fill="#e11d48" opacity="0.85" />
        <text x="0" y="26" fill="#0e7490" fontSize="8" fontWeight="900" textAnchor="middle">{label}</text>
      </g>
    ))}
    <text x="48" y="90" fill="#0e7490" fontSize="8" fontWeight="800" textAnchor="middle">BLOOD TYPE</text>
  </svg>
);

const FoodChainVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <path d="M48 14L76 72H20L48 14Z" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
    <path d="M31 50H65M25 63H71" stroke="#10b981" strokeWidth="2.5" />
    <circle cx="48" cy="32" r="6" fill="#f59e0b" />
    <circle cx="41" cy="57" r="5" fill="#22c55e" />
    <circle cx="55" cy="57" r="5" fill="#3b82f6" />
    <text x="48" y="90" fill="#047857" fontSize="8" fontWeight="800" textAnchor="middle">FOOD CHAIN</text>
  </svg>
);

const HeartRateMonitorVisual = () => (
  <svg viewBox="0 0 96 96" className="h-14 w-14" fill="none" aria-hidden="true">
    <rect x="14" y="20" width="68" height="48" rx="10" fill="#eff6ff" stroke="#3b82f6" strokeWidth="3" />
    <path d="M20 48H32L37 36L45 60L53 42H64L68 48H76" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="68" cy="31" r="5" fill="#22c55e" />
    <text x="48" y="84" fill="#1d4ed8" fontSize="8" fontWeight="800" textAnchor="middle">HEART RATE</text>
  </svg>
);

const visualMap: Record<string, React.ReactNode> = {
  ThermometerVisual: <ThermometerVisual />,
  BeakerVisual: <BeakerVisual />,
  StopwatchVisual: <StopwatchVisual />,
  HotWaterVisual: <HotWaterVisual />,
  IceVisual: <IceVisual />,
  PowerSupplyVisual: <PowerSupplyVisual />,
  AmmeterVisual: <AmmeterVisual />,
  ResistorVisual: <ResistorVisual />,
  VoltmeterVisual: <VoltmeterVisual />,
  WiresVisual: <WiresVisual />,
  BuretteVisual: <BuretteVisual />,
  ErlenmeyerVisual: <ErlenmeyerVisual />,
  PipetteVisual: <PipetteVisual />,
  IndicatorVisual: <IndicatorVisual />,
  PHMeterVisual: <PHMeterVisual />,
  GasSyringeVisual: <GasSyringeVisual />,
  PressureGaugeVisual: <PressureGaugeVisual />,
  PistonVisual: <PistonVisual />,
  GasMoleculesVisual: <GasMoleculesVisual />,
  PlantChamberVisual: <PlantChamberVisual />,
  GrowLightVisual: <GrowLightVisual />,
  CO2TankVisual: <CO2TankVisual />,
  OxygenSensorVisual: <OxygenSensorVisual />,
  WaterReservoirVisual: <WaterReservoirVisual />,
  ClipboardListVisual: <ClipboardListVisual />,
  PunnettSquareVisual: <PunnettSquareVisual />,
  PeaPlantVisual: <PeaPlantVisual />,
  ChromosomeVisual: <ChromosomeVisual />,
  MicroscopeSlideVisual: <MicroscopeSlideVisual />,
  SpindleVisual: <SpindleVisual />,
  SpringVisual: <SpringVisual />,
  MassSetVisual: <MassSetVisual />,
  RulerVisual: <RulerVisual />,
  RetortStandVisual: <RetortStandVisual />,
  LaserSourceVisual: <LaserSourceVisual />,
  AcrylicBlockVisual: <AcrylicBlockVisual />,
  ProtractorVisual: <ProtractorVisual />,
  OpticalBenchVisual: <OpticalBenchVisual />,
  GasTankVisual: <GasTankVisual />,
  HeaterCoolerVisual: <HeaterCoolerVisual />,
  WoodenTrackVisual: <WoodenTrackVisual />,
  DynamicsCartVisual: <DynamicsCartVisual />,
  PulleySystemVisual: <PulleySystemVisual />,
  PhotogateVisual: <PhotogateVisual />,
  MomentumTrackVisual: <MomentumTrackVisual />,
  MagnetCoilVisual: <MagnetCoilVisual />,
  VenturiTubeVisual: <VenturiTubeVisual />,
  PhotoCellVisual: <PhotoCellVisual />,
  PlanetaryOrbitVisual: <PlanetaryOrbitVisual />,
  WienSpectrumVisual: <WienSpectrumVisual />,
  SpectrophotometerVisual: <SpectrophotometerVisual />,
  CuvetteVisual: <CuvetteVisual />,
  CalorimeterVisual: <CalorimeterVisual />,
  EquilibriumTubesVisual: <EquilibriumTubesVisual />,
  BloodTypingSVG: <BloodTypingPlateVisual />,
  FoodChainSVG: <FoodChainVisual />,
  HeartRateSVG: <HeartRateMonitorVisual />,
};

export default function EquipmentList({ labId }: EquipmentListProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  const details = getLabDetails(labId);
  if (!details) return null;

  const lab = labsById[labId];

  const equipments: EquipmentItem[] = details.equipments.map((eq) => ({
    id: eq.id,
    name: eq.name,
    role: eq.role,
    note: eq.note,
    unit: eq.unit,
    tone: eq.tone,
    visual: visualMap[eq.visualKey] || visualMap['BeakerVisual'],
  }));

  const equipmentSubtitle = `รายการอุปกรณ์สำหรับการทดลอง ${lab?.title || "ห้องปฏิบัติการจำลอง"}`;

  const equipmentSummary = equipments
    .slice(0, 3)
    .map((eq) => eq.name)
    .join(", ");
  const remainingEquipmentCount = Math.max(equipments.length - 3, 0);

  return (
    <section className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5">
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Beaker className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 sm:text-base">
              อุปกรณ์ในห้องแล็บ
            </h2>
            <p className="text-[11px] font-semibold leading-relaxed text-slate-500">
              {equipmentSubtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">
            {equipments.length} รายการ
          </span>
          <button
            type="button"
            onClick={() => setShowDetails((current) => !current)}
            aria-expanded={showDetails}
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[11px] font-bold text-indigo-600 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <span>{showDetails ? "ย่อรายละเอียด" : "เพิ่มรายละเอียด"}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {!showDetails ? (
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-2 sm:items-center">
            <div className="flex -space-x-1.5">
              {equipments.map((eq) => {
                const tone = toneClasses[eq.tone];

                return (
                  <span
                    key={eq.id}
                    className={`h-2.5 w-2.5 rounded-full border-2 border-white ${tone.accent}`}
                    aria-hidden="true"
                  />
                );
              })}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold leading-relaxed text-slate-700">
                สรุปอุปกรณ์ {equipments.length} รายการ
              </p>
              <p className="text-[11px] font-semibold leading-relaxed text-slate-500">
                {equipmentSummary}
                {remainingEquipmentCount > 0 ? ` และอีก ${remainingEquipmentCount} รายการ` : ""}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-extrabold leading-relaxed text-indigo-600">
            เปิดรายละเอียดเพื่อดูบทบาทและหน่วยของแต่ละอุปกรณ์
          </span>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2.5">
          {equipments.map((eq, index) => {
            const tone = toneClasses[eq.tone];

            return (
              <article
                key={eq.id}
                aria-label={`อุปกรณ์: ${eq.name}`}
                className={`grid grid-cols-[72px_1fr] gap-3 rounded-2xl border p-3 sm:grid-cols-[80px_1fr_auto] sm:items-center ${tone.row}`}
              >
                <div className={`relative flex h-[72px] items-center justify-center rounded-xl border border-white/70 sm:h-20 ${tone.visual}`}>
                  <span className={`absolute left-2.5 top-2.5 h-2 w-2 rounded-full ${tone.accent}`} />
                  {eq.visual}
                </div>

                <div className="min-w-0 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-black ${tone.text}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-sm font-extrabold leading-relaxed text-slate-800 sm:text-base">
                      {eq.name}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold leading-relaxed text-slate-600 break-words sm:text-sm">
                    {eq.role}
                  </p>
                  <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold leading-relaxed text-slate-500">
                    <CheckCircle2 className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${tone.text}`} />
                    <span>{eq.note}</span>
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-between gap-3 border-t border-white/70 pt-2 sm:col-span-1 sm:h-full sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                  <span className="text-[9px] font-bold uppercase text-slate-500">
                    หน่วย/ตัวแปร
                  </span>
                  <span className={`rounded-full bg-white px-2.5 py-1 text-xs font-black ${tone.text}`}>
                    {eq.unit}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
