"use client";

import React from "react";
import Link from "next/link";
import { Atom, CircuitBoard, FlaskConical, Gauge, Play, ArrowLeft, Snowflake, Thermometer, Leaf, Dna, Microscope, Weight, Sliders, Zap, Sun } from "lucide-react";
import { getLabReadiness } from "@/data/labReadiness";

interface LabHeroProps {
  labId: string;
  title: string;
  category: string;
  description: string;
  onStartExperiment?: () => void;
}

const OhmsHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#bfdbfe" opacity="0.36" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#eff6ff" opacity="0.9" />

    {/* Circuit loop */}
    <path
      d="M46 132V82H83M157 82H196V174H46V132"
      stroke="#475569"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Battery */}
    <g transform="translate(42, 102)">
      <rect x="0" y="0" width="46" height="58" rx="11" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="4" />
      <rect x="15" y="-10" width="16" height="10" rx="3" fill="#1d4ed8" />
      <path d="M23 15V43M10 29H36" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Resistor */}
    <g transform="translate(93, 65)">
      <rect x="0" y="0" width="78" height="34" rx="12" fill="#fef08a" stroke="#ca8a04" strokeWidth="4" />
      <rect x="12" y="0" width="7" height="34" fill="#ef4444" />
      <rect x="31" y="0" width="7" height="34" fill="#a855f7" />
      <rect x="50" y="0" width="7" height="34" fill="#f97316" />
      <path d="M-23 17H0M78 17H102" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
    </g>

    {/* Ammeter */}
    <g transform="translate(151, 119)">
      <circle cx="31" cy="31" r="28" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
      <path d="M31 31L48 18" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
      <circle cx="31" cy="31" r="5" fill="#ef4444" />
      <text x="31" y="52" fill="#2563eb" fontSize="15" fontWeight="900" textAnchor="middle">A</text>
    </g>

    {/* Voltmeter tag */}
    <g transform="translate(25, 52)">
      <rect x="0" y="0" width="66" height="39" rx="15" fill="#ffffff" stroke="#bfdbfe" strokeWidth="2" />
      <text x="33" y="16" fill="#64748b" fontSize="9" fontWeight="800" textAnchor="middle">Ohm</text>
      <text x="33" y="31" fill="#2563eb" fontSize="14" fontWeight="900" textAnchor="middle">I = V/R</text>
    </g>

    {/* Moving electrons */}
    <g className="animate-pulse">
      <circle cx="114" cy="174" r="4" fill="#2563eb" />
      <circle cx="147" cy="174" r="3" fill="#60a5fa" />
      <circle cx="195" cy="114" r="3" fill="#2563eb" />
      <circle cx="63" cy="82" r="3.5" fill="#60a5fa" />
    </g>

    {/* Direction cue */}
    <path d="M105 121L122 138L139 121" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M122 138V105" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />

    <circle cx="193" cy="70" r="4" fill="#60a5fa" opacity="0.75" />
    <circle cx="201" cy="184" r="5" fill="#a78bfa" opacity="0.7" />
  </svg>
);

const HookesHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#bfdbfe" opacity="0.34" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#eff6ff" opacity="0.9" />

    {/* Support beam */}
    <g transform="translate(58, 33)">
      <line x1="0" y1="0" x2="122" y2="0" stroke="#334155" strokeWidth="9" strokeLinecap="round" />
      {[12, 35, 58, 81, 104].map((x) => (
        <line key={x} x1={x} y1="1" x2={x - 8} y2="11" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      ))}
    </g>

    {/* Spring and mass */}
    <g transform="translate(78, 33)">
      <path
        d="M41 0V19L26 26L56 38L26 50L56 62L26 74L56 86L26 98L56 110L41 118V136"
        stroke="#475569"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="16" y="136" width="50" height="39" rx="9" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="4" />
      <text x="41" y="161" fill="#ffffff" fontSize="15" fontWeight="900" textAnchor="middle">500g</text>
    </g>

    {/* Ruler */}
    <g transform="translate(149, 55)">
      <rect x="0" y="0" width="18" height="126" rx="7" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
      {[17, 34, 51, 68, 85, 102].map((y, index) => (
        <line key={y} x1="18" y1={y} x2={index % 2 === 0 ? 31 : 26} y2={y} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      ))}
      <path d="M-7 106H22" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Force arrow */}
    <g transform="translate(178, 94)">
      <path d="M0 0V70" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
      <path d="M-8 58L0 70L8 58" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="19" y="43" fill="#ef4444" fontSize="16" fontWeight="900">F</text>
    </g>

    {/* Equation badge */}
    <g transform="translate(21, 61)">
      <rect x="0" y="0" width="68" height="39" rx="15" fill="#ffffff" stroke="#bfdbfe" strokeWidth="2" />
      <text x="34" y="16" fill="#64748b" fontSize="9" fontWeight="800" textAnchor="middle">Hooke</text>
      <text x="34" y="31" fill="#2563eb" fontSize="14" fontWeight="900" textAnchor="middle">F = kx</text>
    </g>

    {/* Extension guide */}
    <path d="M68 151H111" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 7" />
    <path d="M68 151L79 143M68 151L79 159" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
    <text x="90" y="141" fill="#2563eb" fontSize="12" fontWeight="900" textAnchor="middle">x</text>

    <circle cx="52" cy="176" r="5" fill="#22c55e" opacity="0.75" />
    <circle cx="199" cy="63" r="4" fill="#a78bfa" opacity="0.8" />
  </svg>
);

const SnellsHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#a5f3fc" opacity="0.36" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#ecfeff" opacity="0.9" />

    {/* Medium 2: Glass (bottom half) */}
    <path d="M40 120 C40 120 40 172 122 172 C204 172 204 120 204 120 Z" fill="#bae6fd" opacity="0.4" />
    <line x1="40" y1="120" x2="200" y2="120" stroke="#0891b2" strokeWidth="4.5" strokeLinecap="round" />

    {/* Normal Line */}
    <line x1="122" y1="45" x2="122" y2="195" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" />

    {/* Laser Source */}
    <g transform="translate(42, 45) rotate(45)">
      <rect x="0" y="0" width="30" height="14" rx="4" fill="#334155" stroke="#1e293b" strokeWidth="2" />
      <rect x="30" y="3" width="6" height="8" rx="2" fill="#ef4444" />
    </g>

    {/* Incident Beam */}
    <path d="M68 70 L122 120" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" className="animate-pulse" />
    {/* Refracted Beam */}
    <path d="M122 120 L156 180" stroke="#f43f5e" strokeWidth="5" strokeLinecap="round" />
    
    {/* Reflected Beam (subtle) */}
    <path d="M122 120 L176 70" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />

    {/* Angle arcs */}
    <path d="M122 90 A30 30 0 0 0 99 100" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <text x="102" y="86" fill="#0284c7" fontSize="11" fontWeight="955">θ₁</text>

    <path d="M122 155 A35 35 0 0 0 142 147" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <text x="135" y="172" fill="#0284c7" fontSize="11" fontWeight="955">θ₂</text>

    {/* Formula tag */}
    <g transform="translate(136, 42)">
      <rect x="0" y="0" width="76" height="38" rx="14" fill="#ffffff" stroke="#bae6fd" strokeWidth="2" />
      <text x="38" y="15" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">Snell&apos;s Law</text>
      <text x="38" y="29" fill="#0891b2" fontSize="10" fontWeight="900" textAnchor="middle">n₁sinθ₁=n₂sinθ₂</text>
    </g>
  </svg>
);

const IdealGasHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#fed7aa" opacity="0.36" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#fff7ed" opacity="0.9" />

    {/* Cylinder Body */}
    <rect x="68" y="52" width="104" height="120" rx="15" fill="#ffffff" opacity="0.8" stroke="#64748b" strokeWidth="4.5" />

    {/* Piston Plate */}
    <rect x="73" y="92" width="94" height="14" rx="4" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
    {/* Piston Rod */}
    <path d="M120 92 V42" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
    <path d="M102 42 H138" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

    {/* Heat/Cold Indicator */}
    <path d="M85 174 Q120 182 155 174" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />

    {/* Gas Molecules */}
    <g>
      <circle cx="92" cy="122" r="5" fill="#ef4444" />
      <path d="M92 122 L84 115" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="145" cy="116" r="6" fill="#3b82f6" />
      <path d="M145 116 L154 108" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="108" cy="148" r="5.5" fill="#10b981" />
      <path d="M108 148 L100 155" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="150" cy="144" r="5" fill="#f59e0b" />
      <path d="M150 144 L158 149" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    {/* Pressure Dial */}
    <g transform="translate(142, 34)">
      <circle cx="24" cy="24" r="21" fill="#ffffff" stroke="#94a3b8" strokeWidth="3" />
      <path d="M24 24 L36 12" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="24" r="3.5" fill="#dc2626" />
      <text x="24" y="38" fill="#475569" fontSize="9" fontWeight="900" textAnchor="middle">P</text>
    </g>

    {/* Equation Tag */}
    <g transform="translate(20, 58)">
      <rect x="0" y="0" width="70" height="38" rx="14" fill="#ffffff" stroke="#fed7aa" strokeWidth="2" />
      <text x="35" y="16" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">Ideal Gas</text>
      <text x="35" y="30" fill="#ea580c" fontSize="13" fontWeight="900" textAnchor="middle">PV = nRT</text>
    </g>
  </svg>
);

const NewtonsSecondHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#dbeafe" opacity="0.36" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#eff6ff" opacity="0.9" />

    {/* Track */}
    <line x1="30" y1="130" x2="210" y2="130" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />

    {/* Pulley */}
    <circle cx="185" cy="130" r="14" fill="#64748b" stroke="#334155" strokeWidth="3" />
    <circle cx="185" cy="130" r="3" fill="#ffffff" />

    {/* Cart */}
    <g transform="translate(52, 96)">
      <rect x="0" y="0" width="72" height="26" rx="6" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="3.5" />
      <rect x="18" y="-12" width="36" height="12" rx="3" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
      <text x="36" y="-3" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">Mass</text>
      <circle cx="14" cy="27" r="8.5" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
      <circle cx="58" cy="27" r="8.5" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
    </g>

    {/* String & Hanging Mass */}
    <path d="M124 109 H185 L185 174" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <rect x="171" y="174" width="28" height="22" rx="4" fill="#ef4444" stroke="#b91c1c" strokeWidth="2.5" />
    <text x="185" y="188" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">m</text>

    {/* Acceleration Vector */}
    <g transform="translate(82, 65)">
      <path d="M0 5 H38" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M30 0 L38 5 L30 10" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="18" y="-3" fill="#047857" fontSize="12" fontWeight="950">a</text>
    </g>

    {/* Equation Tag */}
    <g transform="translate(136, 38)">
      <rect x="0" y="0" width="70" height="38" rx="14" fill="#ffffff" stroke="#bfdbfe" strokeWidth="2" />
      <text x="35" y="16" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">Newton II</text>
      <text x="35" y="30" fill="#2563eb" fontSize="14" fontWeight="900" textAnchor="middle">F = ma</text>
    </g>
  </svg>
);

const MomentumHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#ddd6fe" opacity="0.36" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#faf5ff" opacity="0.9" />

    {/* Track */}
    <line x1="30" y1="130" x2="210" y2="130" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />

    {/* Cart 1 (Blue) */}
    <g transform="translate(40, 98)">
      <rect x="0" y="0" width="46" height="24" rx="5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="3" />
      <circle cx="10" cy="27" r="6" fill="#334155" />
      <circle cx="36" cy="27" r="6" fill="#334155" />
      <text x="23" y="15" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">m₁</text>
      <path d="M52 12 H76" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M68 7 L76 12 L68 17" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="64" y="2" fill="#2563eb" fontSize="10" fontWeight="950" textAnchor="middle">u₁</text>
    </g>

    {/* Cart 2 (Red) */}
    <g transform="translate(142, 98)">
      <rect x="0" y="0" width="46" height="24" rx="5" fill="#ef4444" stroke="#b91c1c" strokeWidth="3" />
      <circle cx="10" cy="27" r="6" fill="#334155" />
      <circle cx="36" cy="27" r="6" fill="#334155" />
      <text x="23" y="15" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">m₂</text>
      <path d="-6 12 H-30" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
      <path d="-22 7 L-30 12 L-22 17" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="-18" y="2" fill="#b91c1c" fontSize="10" fontWeight="950" textAnchor="middle">u₂</text>
    </g>

    {/* Impact Spark */}
    <path
      d="M 120 110 l 4 -8 l 6 6 l 10 -10 l -7 16 l 10 6 l -16 3 l -6 10 l -4 -13 l -10 3 z"
      fill="#eab308"
      stroke="#f97316"
      strokeWidth="1.5"
    />

    {/* Equation Tag */}
    <g transform="translate(68, 42)">
      <rect x="0" y="0" width="104" height="38" rx="14" fill="#ffffff" stroke="#ddd6fe" strokeWidth="2" />
      <text x="52" y="15" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">Linear Momentum</text>
      <text x="52" y="30" fill="#7c3aed" fontSize="11" fontWeight="900" textAnchor="middle">p_before = p_after</text>
    </g>
  </svg>
);

const FaradaysHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#bae6fd" opacity="0.36" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#f0f9ff" opacity="0.9" />

    {/* Fields */}
    <path d="M40 70 C70 40 170 40 200 70" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
    <path d="M40 170 C70 200 170 200 200 170" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
    <path d="M40 120 H200" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />

    {/* Coil Loops */}
    <g transform="translate(122, 85)">
      <path
        d="M-20 40 C-20 0 20 0 20 20 C20 40 -20 40 -20 50 C-20 60 20 60 20 70 C20 80 -20 80 -20 90 C-20 100 20 100 20 110"
        stroke="#d97706"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M-20 40 L-50 40 L-50 115 H-30" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 110 L40 110 L40 115 H30" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    </g>

    {/* Light Bulb */}
    <g transform="translate(112, 192)">
      <circle cx="10" cy="10" r="11" fill="#fef08a" stroke="#ca8a04" strokeWidth="2.5" />
      <path d="M4 20 H16 M6 23 H14" stroke="#ca8a04" strokeWidth="2.5" />
      <path d="M10 -4 V-1 M-4 10 H-1 M24 10 H21 M0 0 L2 2 M20 0 L18 2" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
    </g>

    {/* Magnet */}
    <g transform="translate(26, 96)">
      <rect x="0" y="0" width="34" height="28" fill="#ef4444" stroke="#b91c1c" strokeWidth="3" />
      <text x="17" y="19" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle">N</text>
      <rect x="34" y="0" width="34" height="28" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="3" />
      <text x="51" y="19" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle">S</text>
      <path d="M25 40 H60" stroke="#ea580c" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M52 35 L60 40 L52 45" stroke="#ea580c" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Equation Tag */}
    <g transform="translate(136, 32)">
      <rect x="0" y="0" width="70" height="38" rx="14" fill="#ffffff" stroke="#bae6fd" strokeWidth="2" />
      <text x="35" y="16" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">Faraday&apos;s</text>
      <text x="35" y="30" fill="#0284c7" fontSize="12" fontWeight="900" textAnchor="middle">dΦ / dt</text>
    </g>
  </svg>
);

const BernoullisHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#bbf7d0" opacity="0.36" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#f0fdf4" opacity="0.9" />

    {/* Venturi Tube */}
    <path
      d="M30 85 H70 C85 85 95 105 110 105 H130 C145 105 155 85 170 85 H210 M30 155 H70 C85 155 95 135 110 135 H130 C145 135 155 155 170 155 H210"
      stroke="#10b981"
      strokeWidth="4.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Vertical Tubes */}
    <rect x="52" y="30" width="10" height="55" fill="none" stroke="#10b981" strokeWidth="3" />
    <rect x="53.5" y="55" width="7" height="30" fill="#60a5fa" opacity="0.85" />

    <rect x="115" y="30" width="10" height="75" fill="none" stroke="#10b981" strokeWidth="3" />
    <rect x="116.5" y="85" width="7" height="20" fill="#60a5fa" opacity="0.85" />

    <rect x="178" y="30" width="10" height="55" fill="none" stroke="#10b981" strokeWidth="3" />
    <rect x="179.5" y="65" width="7" height="20" fill="#60a5fa" opacity="0.85" />

    {/* Water streams */}
    <path d="M35 100 H70 C85 100 95 115 110 115 H130 C145 115 155 100 170 100 H205" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M35 120 H70 C85 120 95 120 110 120 H130 C145 120 155 120 170 120 H205" stroke="#60a5fa" strokeWidth="3.5" strokeLinecap="round" opacity="0.65" />
    <path d="M35 140 H70 C85 140 95 125 110 125 H130 C145 125 155 140 170 140 H205" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />

    {/* Moving Points */}
    <circle cx="52" cy="120" r="3" fill="#2563eb" />
    <circle cx="120" cy="120" r="2.5" fill="#2563eb" />
    <circle cx="188" cy="120" r="3" fill="#2563eb" />

    {/* Equation Tag */}
    <g transform="translate(136, 171)">
      <rect x="0" y="0" width="72" height="38" rx="14" fill="#ffffff" stroke="#bbf7d0" strokeWidth="2" />
      <text x="36" y="16" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">Bernoulli</text>
      <text x="36" y="30" fill="#059669" fontSize="13" fontWeight="900" textAnchor="middle">P + ½ρv²=k</text>
    </g>
  </svg>
);

const PhotoelectricHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#fed7aa" opacity="0.36" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#fffcf8" opacity="0.9" />

    {/* Tube */}
    <rect x="52" y="70" width="136" height="100" rx="40" fill="none" stroke="#94a3b8" strokeWidth="4.5" />

    {/* Plates */}
    <rect x="74" y="90" width="8" height="60" rx="3.5" fill="#475569" stroke="#334155" strokeWidth="2.5" />
    <rect x="158" y="90" width="8" height="60" rx="3.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2.5" />

    {/* Photons */}
    <g transform="translate(25, 45) rotate(25)">
      <path d="M0 10 Q10 0 20 10 T40 10 T60 10" stroke="#eab308" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M53 5 L61 10 L53 15" stroke="#eab308" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x="15" y="-5" fill="#ca8a04" fontSize="10" fontWeight="950">Photon (hf)</text>
    </g>

    {/* Electrons */}
    <g>
      <circle cx="98" cy="105" r="4.5" fill="#3b82f6" />
      <path d="M98 105 H122" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M117 102 L122 105 L117 108" stroke="#93c5fd" strokeWidth="1.5" />
      <circle cx="112" cy="135" r="4.5" fill="#3b82f6" />
      <path d="M112 135 H140" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M135 132 L140 135 L135 138" stroke="#93c5fd" strokeWidth="1.5" />
      <text x="114" y="152" fill="#2563eb" fontSize="10" fontWeight="950" textAnchor="middle">e⁻</text>
    </g>

    {/* Equation Tag */}
    <g transform="translate(136, 171)">
      <rect x="0" y="0" width="76" height="38" rx="14" fill="#ffffff" stroke="#fed7aa" strokeWidth="2" />
      <text x="38" y="15" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">Photoelectric</text>
      <text x="38" y="30" fill="#ea580c" fontSize="11" fontWeight="900" textAnchor="middle">Ek = hf - W₀</text>
    </g>
  </svg>
);

const KeplersHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#ddd6fe" opacity="0.38" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#faf5ff" opacity="0.9" />

    {/* Orbit Ellipse */}
    <ellipse cx="120" cy="124" rx="80" ry="42" stroke="#7c3aed" strokeWidth="3.5" strokeDasharray="4 4" opacity="0.8" />

    {/* Sun */}
    <circle cx="68" cy="124" r="16" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3.5" />
    <g stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
      <path d="M68 102 V106 M68 142 V146 M46 124 H50 M86 124 H90 M52 108 L55 111 M81 137 L84 140 M52 140 L55 137 M81 111 L84 108" />
    </g>

    {/* Planet */}
    <g transform="translate(172, 98)">
      <circle cx="0" cy="0" r="8.5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
      <path d="M-5 -2 A5 5 0 0 0 2 6" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    {/* Area Sector */}
    <path d="M68 124 L146 95 A 80 42 0 0 1 184 108 Z" fill="#c084fc" opacity="0.34" />
    <text x="142" y="112" fill="#a855f7" fontSize="9" fontWeight="950">Area</text>

    {/* Equation Tag */}
    <g transform="translate(136, 171)">
      <rect x="0" y="0" width="70" height="38" rx="14" fill="#ffffff" stroke="#ddd6fe" strokeWidth="2" />
      <text x="35" y="16" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">Kepler III</text>
      <text x="35" y="30" fill="#7c3aed" fontSize="13" fontWeight="900" textAnchor="middle">T² ∝ a³</text>
    </g>
  </svg>
);

const StefanBoltzmannHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#fca5a5" opacity="0.36" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#fff5f5" opacity="0.9" />

    {/* Radiating Star */}
    <circle cx="120" cy="124" r="38" fill="url(#starGlow)" stroke="#f87171" strokeWidth="4.5" />

    {/* Rays */}
    <g stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.85">
      <path d="M120 72 C115 62 125 56 120 46" />
      <path d="M120 176 C115 186 125 192 120 202" />
      <path d="M68 124 C58 119 52 129 42 124" />
      <path d="M172 124 C182 119 188 129 198 124" />
    </g>

    <defs>
      <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#fef08a" />
        <stop offset="65%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#dc2626" />
      </radialGradient>
    </defs>

    {/* Equation Tag */}
    <g transform="translate(136, 32)">
      <rect x="0" y="0" width="70" height="38" rx="14" fill="#ffffff" stroke="#fca5a5" strokeWidth="2" />
      <text x="35" y="16" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">Blackbody</text>
      <text x="35" y="30" fill="#dc2626" fontSize="13" fontWeight="900" textAnchor="middle">E = σT⁴</text>
    </g>
  </svg>
);

const LeChateliersHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#fbcfe8" opacity="0.36" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#fdf2f8" opacity="0.9" />

    {/* Stand */}
    <rect x="64" y="60" width="112" height="10" rx="4" fill="#475569" />
    <rect x="76" y="70" width="8" height="90" fill="#94a3b8" />
    <rect x="156" y="70" width="8" height="90" fill="#94a3b8" />
    <rect x="54" y="160" width="132" height="12" rx="4" fill="#475569" />

    {/* Tube 1 (Fe3+ Yellowish) */}
    <g transform="translate(90, 45)">
      <rect x="0" y="0" width="18" height="95" rx="9" fill="rgba(255,255,255,0.8)" stroke="#94a3b8" strokeWidth="2.5" />
      <rect x="2.5" y="45" width="13" height="42" rx="6" fill="#f59e0b" opacity="0.8" />
      {/* Liquid bubbles */}
      <circle cx="9" cy="65" r="1.5" fill="#ffffff" opacity="0.7" />
      <circle cx="14" cy="78" r="1" fill="#ffffff" opacity="0.6" />
    </g>

    {/* Tube 2 (FeSCN2+ Deep Red) */}
    <g transform="translate(132, 45)">
      <rect x="0" y="0" width="18" height="95" rx="9" fill="rgba(255,255,255,0.8)" stroke="#94a3b8" strokeWidth="2.5" />
      <rect x="2.5" y="30" width="13" height="57" rx="6" fill="#991b1b" opacity="0.85" />
      {/* Liquid bubbles */}
      <circle cx="6" cy="55" r="1.5" fill="#ffffff" opacity="0.7" />
      <circle cx="12" cy="70" r="1" fill="#ffffff" opacity="0.6" />
    </g>

    {/* Equilibrium Double Arrow */}
    <g transform="translate(112, 90)">
      <path d="M-4 -6 H12 L8 -10 M12 -6 L8 -2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6 H-8 L-4 2 M-8 6 L-4 10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Formula Tag */}
    <g transform="translate(20, 45)">
      <rect x="0" y="0" width="66" height="38" rx="14" fill="#ffffff" stroke="#fbcfe8" strokeWidth="2" />
      <text x="33" y="15" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">Equilibrium</text>
      <text x="33" y="29" fill="#db2777" fontSize="11" fontWeight="900" textAnchor="middle">Fe³⁺ ⇌ Red</text>
    </g>
  </svg>
);

const BeerLambertHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#bae6fd" opacity="0.36" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#f0f9ff" opacity="0.9" />

    {/* Light Source (left) */}
    <g transform="translate(32, 104)">
      <rect x="0" y="0" width="36" height="26" rx="6" fill="#334155" stroke="#1e293b" strokeWidth="2" />
      <circle cx="36" cy="13" r="6" fill="#eab308" />
      <path d="M38 13 L52 13" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
    </g>

    {/* Strong light beam before cuvette */}
    <path d="M72 117 H102" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" opacity="0.95" className="animate-pulse" />

    {/* Cuvette (middle) */}
    <g transform="translate(102, 75)">
      <rect x="0" y="0" width="36" height="78" rx="4" fill="rgba(255,255,255,0.6)" stroke="#0891b2" strokeWidth="3" />
      {/* Solution in cuvette (CuSO4 blue) */}
      <rect x="3" y="15" width="30" height="60" rx="2" fill="#2563eb" opacity="0.75" />
      {/* Reflections */}
      <path d="M8 8 V70" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" />
    </g>

    {/* Weak light beam after cuvette */}
    <path d="M138 117 H168" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />

    {/* Detector (right) */}
    <g transform="translate(168, 98)">
      <rect x="0" y="0" width="40" height="38" rx="8" fill="#475569" stroke="#334155" strokeWidth="2" />
      <rect x="6" y="8" width="28" height="22" rx="4" fill="#0f172a" />
      <text x="20" y="24" fill="#22c55e" fontSize="11" fontWeight="900" textAnchor="middle">0.45</text>
    </g>

    {/* Wavelength tag */}
    <g transform="translate(92, 45)">
      <rect x="0" y="0" width="56" height="22" rx="8" fill="#f43f5e" />
      <text x="28" y="14" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">540 nm</text>
    </g>

    {/* Equation Tag */}
    <g transform="translate(20, 52)">
      <rect x="0" y="0" width="66" height="39" rx="14" fill="#ffffff" stroke="#bae6fd" strokeWidth="2" />
      <text x="33" y="16" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">Beer-Lambert</text>
      <text x="33" y="30" fill="#0284c7" fontSize="13" fontWeight="900" textAnchor="middle">A = ε·c·b</text>
    </g>
  </svg>
);

const HesssLawHeroIllustration = () => (
  <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="122" cy="124" r="74" fill="#fed7aa" opacity="0.36" filter="blur(30px)" />
    <circle cx="122" cy="124" r="52" fill="#fff7ed" opacity="0.9" />

    {/* Coffee Cup Calorimeter Body */}
    <g transform="translate(85, 78)">
      {/* Outer Cup */}
      <path d="M10 0 L20 80 C22 90 32 90 35 90 H55 C58 90 68 90 70 80 L80 0 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="3" />
      {/* Inner Cup rim */}
      <ellipse cx="45" cy="0" rx="35" ry="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
      {/* Liquid inside */}
      <path d="M13 28 L17 65 C18 72 26 72 28 72 H62 C64 72 72 72 73 65 L77 28 Z" fill="#38bdf8" opacity="0.5" />
      {/* Stirrer (metal loop rod) */}
      <path d="M30 -22 V55 H45" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Thermometer */}
    <g transform="translate(132, 42)">
      <rect x="4" y="0" width="10" height="90" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2.5" />
      <circle cx="9" cy="95" r="11" fill="#ef4444" stroke="#cbd5e1" strokeWidth="2.5" />
      <rect x="7" y="25" width="4" height="65" rx="2" fill="#ef4444" />
      <circle cx="9" cy="95" r="7" fill="#ef4444" />
    </g>

    {/* Heat rise waves */}
    <g className="animate-pulse" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round">
      <path d="M72 135 C68 142 74 146 70 152" />
      <path d="M172 135 C168 142 174 146 170 152" />
    </g>

    {/* Equation Tag */}
    <g transform="translate(20, 52)">
      <rect x="0" y="0" width="66" height="39" rx="14" fill="#ffffff" stroke="#fed7aa" strokeWidth="2" />
      <text x="33" y="16" fill="#64748b" fontSize="9" fontWeight="800" textAnchor="middle">Hess&apos;s Law</text>
      <text x="33" y="30" fill="#ea580c" fontSize="11" fontWeight="900" textAnchor="middle">ΔH1=ΔH2+ΔH3</text>
    </g>
  </svg>
);

type ChemistryHeroVariant =
  | "galvanic"
  | "kinetics"
  | "ksp"
  | "avogadro"
  | "electrolysis"
  | "colligative";

const ChemistryConceptHeroIllustration = ({ variant }: { variant: ChemistryHeroVariant }) => {
  const isGalvanic = variant === "galvanic";
  const isKinetics = variant === "kinetics";
  const isKsp = variant === "ksp";
  const isAvogadro = variant === "avogadro";
  const isElectrolysis = variant === "electrolysis";
  const isColligative = variant === "colligative";
  const label = isGalvanic
    ? "Galvanic"
    : isKinetics
    ? "Reaction Rate"
    : isKsp
    ? "Ksp"
    : isAvogadro
    ? "Molar Volume"
    : isElectrolysis
    ? "Electrolysis"
    : "Colligative";
  const equation = isGalvanic
    ? "Ecell"
    : isKinetics
    ? "rate = k[A]"
    : isKsp
    ? "Qsp / Ksp"
    : isAvogadro
    ? "Vm = V/n"
    : isElectrolysis
    ? "m = ItM/nF"
    : "ΔT = iKm";
  const halo = isElectrolysis || isGalvanic ? "#ddd6fe" : isColligative ? "#cffafe" : "#ede9fe";
  const accent = isElectrolysis || isGalvanic ? "#7c3aed" : isKinetics ? "#f97316" : isKsp ? "#06b6d4" : isAvogadro ? "#2563eb" : "#0891b2";

  return (
    <svg className="h-full w-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="122" cy="124" r="74" fill={halo} opacity="0.4" filter="blur(30px)" />
      <circle cx="122" cy="124" r="52" fill="#ffffff" opacity="0.82" />

      {isGalvanic ? (
        <g>
          <rect x="52" y="95" width="48" height="58" rx="12" fill="#ecfeff" stroke="#67e8f9" strokeWidth="4" />
          <rect x="140" y="95" width="48" height="58" rx="12" fill="#f5f3ff" stroke="#c4b5fd" strokeWidth="4" />
          <path d="M62 125H90M150 125H178" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
          <path d="M76 95V73H164V95" stroke="#64748b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M88 73C101 53 139 53 152 73" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" />
          <circle cx="120" cy="59" r="23" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
          <path d="M120 59L134 47" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
          <text x="120" y="78" fill="#7c3aed" fontSize="12" fontWeight="900" textAnchor="middle">V</text>
        </g>
      ) : isKinetics ? (
        <g>
          <rect x="72" y="80" width="78" height="78" rx="18" fill="#fff7ed" stroke="#fed7aa" strokeWidth="4" />
          <path d="M84 139C105 122 126 132 148 106" stroke="#f97316" strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="91" cy="104" r="5" fill="#fb7185" />
          <circle cx="121" cy="119" r="4" fill="#a855f7" />
          <circle cx="144" cy="92" r="5" fill="#22c55e" />
          <g transform="translate(148, 47)">
            <circle cx="26" cy="26" r="22" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
            <path d="M26 26V12M26 26L38 31" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
          </g>
        </g>
      ) : isKsp ? (
        <g>
          <path d="M78 58H162L152 152H88L78 58Z" fill="#ecfeff" stroke="#64748b" strokeWidth="4" strokeLinejoin="round" />
          <path d="M88 116H152L147 152H93L88 116Z" fill="#67e8f9" opacity="0.55" />
          {[93, 112, 132, 147, 105, 125].map((x, index) => (
            <circle key={x} cx={x} cy={82 + (index % 3) * 14} r="4" fill={index % 2 ? "#a855f7" : "#06b6d4"} />
          ))}
          <path d="M95 143C110 134 130 134 146 143" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
          <text x="120" y="169" fill="#0891b2" fontSize="12" fontWeight="900" textAnchor="middle">precipitate</text>
        </g>
      ) : isAvogadro ? (
        <g>
          <rect x="64" y="95" width="92" height="36" rx="12" fill="#eff6ff" stroke="#93c5fd" strokeWidth="4" />
          <rect x="156" y="105" width="34" height="16" rx="6" fill="#ffffff" stroke="#64748b" strokeWidth="4" />
          <path d="M66 113H154" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
          <path d="M81 95V75H119V95" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <circle cx="96" cy="61" r="22" fill="#dbeafe" stroke="#60a5fa" strokeWidth="4" />
          <text x="96" y="66" fill="#2563eb" fontSize="14" fontWeight="900" textAnchor="middle">gas</text>
          <path d="M65 151C91 137 131 137 158 151" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" />
        </g>
      ) : isElectrolysis ? (
        <g>
          <rect x="63" y="76" width="114" height="78" rx="16" fill="#f5f3ff" stroke="#c4b5fd" strokeWidth="4" />
          <rect x="81" y="91" width="14" height="56" rx="5" fill="#64748b" />
          <rect x="145" y="91" width="14" height="56" rx="5" fill="#a855f7" />
          <path d="M88 76V53H152V76" stroke="#475569" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="94" y="39" width="52" height="27" rx="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
          <text x="120" y="58" fill="#7c3aed" fontSize="12" fontWeight="900" textAnchor="middle">DC</text>
          <path d="M154 118C142 136 126 141 107 141" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <rect x="72" y="72" width="88" height="82" rx="18" fill="#ecfeff" stroke="#67e8f9" strokeWidth="4" />
          <path d="M83 126H149" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" />
          <g transform="translate(146, 42)">
            <rect x="5" y="0" width="12" height="88" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
            <circle cx="11" cy="92" r="13" fill="#06b6d4" stroke="#cbd5e1" strokeWidth="3" />
            <rect x="9" y="35" width="4" height="54" rx="2" fill="#06b6d4" />
          </g>
          <path d="M72 154C94 166 135 166 160 154" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
          <path d="M60 82C50 91 50 105 60 114" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      <g transform="translate(22, 53)">
        <rect x="0" y="0" width="78" height="40" rx="15" fill="#ffffff" stroke={halo} strokeWidth="2" />
        <text x="39" y="16" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">{label}</text>
        <text x="39" y="31" fill={accent} fontSize="12" fontWeight="900" textAnchor="middle">{equation}</text>
      </g>

      <circle cx="190" cy="70" r="4" fill="#60a5fa" opacity="0.75" />
      <circle cx="198" cy="176" r="5" fill="#a78bfa" opacity="0.7" />
    </svg>
  );
};


export default function LabHero({
  labId,
  title,
  category,
  description,
  onStartExperiment,
}: LabHeroProps) {
  const isOhmsLaw = labId === "ohms-law";
  const isHookesLaw = labId === "hookes-law";
  const isAcidBase = labId === "acid-base-titration";
  const isBoylesLaw = labId === "boyles-law";
  const isCharlesLaw = labId === "charles-law";
  const isPhotosynthesis = labId === "photosynthesis-rate";
  const isMendelian = labId === "mendels-inheritance";
  const isMitosis = labId === "mitosis-division";
  const isLeChateliers = labId === "le-chateliers-principle";
  const isBeerLambert = labId === "beer-lambert-law";
  const isHesssLaw = labId === "hesss-law";
  const isGalvanicCell = labId === "galvanic-cell";
  const isChemicalKinetics = labId === "chemical-kinetics";
  const isSolubilityProduct = labId === "solubility-product";
  const isAvogadrosLaw = labId === "avogadros-law";
  const isElectrolysis = labId === "electrolysis-lab";
  const isColligative = labId === "colligative-properties";

  // New Labs
  const isSnellsLaw = labId === "snells-law";
  const isIdealGas = labId === "ideal-gas-law";
  const isNewtonsSecond = labId === "newtons-second-law";
  const isMomentum = labId === "momentum-conservation";
  const isFaradaysLaw = labId === "faradays-law";
  const isBernoulli = labId === "bernoullis-principle";
  const isPhotoelectric = labId === "photoelectric-effect";
  const isKepler = labId === "keplers-laws";
  const isStefanBoltzmann = labId === "stefan-boltzmann";

  const isBiology = isPhotosynthesis || isMendelian || isMitosis;
  const HeroIcon = isHookesLaw ? Weight
    : isOhmsLaw ? CircuitBoard
    : isMitosis ? Microscope
    : isMendelian ? Dna
    : isPhotosynthesis ? Leaf
    : isCharlesLaw ? Thermometer
    : isBoylesLaw ? Gauge
    : (isAcidBase || isLeChateliers || isBeerLambert || isChemicalKinetics || isSolubilityProduct) ? FlaskConical
    : isGalvanicCell || isElectrolysis ? Zap
    : isAvogadrosLaw ? Gauge
    : isColligative ? Thermometer
    : isHesssLaw ? Thermometer
    : (isFaradaysLaw || isPhotoelectric) ? Zap
    : (isBernoulli || isIdealGas) ? Gauge
    : isNewtonsSecond ? Sliders
    : isMomentum ? Sliders
    : isStefanBoltzmann ? Sun
    : Atom;

  const chemistryTone = isAcidBase || isBoylesLaw || isCharlesLaw || isIdealGas || isLeChateliers || isBeerLambert || isHesssLaw || isGalvanicCell || isChemicalKinetics || isSolubilityProduct || isAvogadrosLaw || isElectrolysis || isColligative;
  const readiness = getLabReadiness(labId);
  const iconClass = isBiology ? "bg-emerald-600 shadow-emerald-500/20" : chemistryTone ? "bg-violet-600 shadow-violet-500/20" : "bg-blue-600 shadow-blue-500/20";
  const badgeClass = isBiology ? "bg-emerald-50 text-emerald-700 border-emerald-100" : chemistryTone ? "bg-violet-50 text-violet-700 border-violet-100" : "bg-blue-50 text-blue-700 border-blue-100";

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-12 md:px-20 py-3 select-none">
      <div className="relative overflow-hidden bg-white border border-slate-200/70 rounded-2xl p-4 sm:p-6 md:p-7 flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-5 md:gap-8">

        {/* Left Side: Content & Actions */}
        <div className="flex-1 flex flex-col items-start text-left z-10 w-full">
          {/* Header row with Atom indicator box and Subject Tags */}
          <div className="flex flex-wrap items-center gap-2.5 mb-2.5 sm:mb-3">
            {/* Physics Logo Icon */}
            <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-sm sm:h-10 sm:w-10 sm:rounded-2xl ${iconClass}`}>
              <HeroIcon className="w-5 h-5" />
            </div>

            {/* Department Category badge */}
            <span className={`px-3 py-1 border text-xs font-bold rounded-full ${badgeClass}`}>
              {category}
            </span>

            <span
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                readiness.isReady
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-amber-100 bg-amber-50 text-amber-700"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${readiness.isReady ? "bg-emerald-500" : "bg-amber-500"}`} />
              {readiness.label}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="break-words text-[1.45rem] sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-2.5 sm:mb-3 leading-[1.18] tracking-normal">
            {title}
          </h1>

          {/* Description */}
          <p className="max-w-2xl break-words text-sm sm:text-base text-slate-600 font-medium leading-[1.6] sm:leading-relaxed mb-4 sm:mb-5">
            {description}
          </p>

          {/* Buttons Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
            {/* Start Lab Button */}
            <button
              onClick={onStartExperiment}
              aria-label={`เริ่มทำการทดลองห้องแล็บ ${title}`}
              className="flex items-center justify-center gap-2 py-3 px-7 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus:outline-none cursor-pointer shadow-sm shadow-blue-600/10"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>เริ่มทดลอง</span>
            </button>

            {/* Back Button */}
            <Link
              href="/labs"
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl focus:outline-none sm:py-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับไปหน้ารายชื่อห้องแล็บ</span>
            </Link>
          </div>
        </div>

        {/* Right Side: High-Fidelity SVG Experiment Illustration */}
        <div className="relative -mt-1 flex h-28 w-28 shrink-0 select-none items-center justify-center opacity-95 sm:mt-0 sm:h-52 sm:w-52 lg:h-56 lg:w-56">
          {isOhmsLaw ? (
            <OhmsHeroIllustration />
          ) : isHookesLaw ? (
            <HookesHeroIllustration />
          ) : isLeChateliers ? (
            <LeChateliersHeroIllustration />
          ) : isBeerLambert ? (
            <BeerLambertHeroIllustration />
          ) : isHesssLaw ? (
            <HesssLawHeroIllustration />
          ) : isGalvanicCell ? (
            <ChemistryConceptHeroIllustration variant="galvanic" />
          ) : isChemicalKinetics ? (
            <ChemistryConceptHeroIllustration variant="kinetics" />
          ) : isSolubilityProduct ? (
            <ChemistryConceptHeroIllustration variant="ksp" />
          ) : isAvogadrosLaw ? (
            <ChemistryConceptHeroIllustration variant="avogadro" />
          ) : isElectrolysis ? (
            <ChemistryConceptHeroIllustration variant="electrolysis" />
          ) : isColligative ? (
            <ChemistryConceptHeroIllustration variant="colligative" />
          ) : isSnellsLaw ? (
            <SnellsHeroIllustration />
          ) : isIdealGas ? (
            <IdealGasHeroIllustration />
          ) : isNewtonsSecond ? (
            <NewtonsSecondHeroIllustration />
          ) : isMomentum ? (
            <MomentumHeroIllustration />
          ) : isFaradaysLaw ? (
            <FaradaysHeroIllustration />
          ) : isBernoulli ? (
            <BernoullisHeroIllustration />
          ) : isPhotoelectric ? (
            <PhotoelectricHeroIllustration />
          ) : isKepler ? (
            <KeplersHeroIllustration />
          ) : isStefanBoltzmann ? (
            <StefanBoltzmannHeroIllustration />
          ) : isMitosis ? (
            <svg className="w-full h-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="122" cy="124" r="74" fill="#cffafe" opacity="0.4" filter="blur(30px)" />
              <circle cx="122" cy="124" r="52" fill="#ecfeff" opacity="0.9" />
              <g transform="translate(49, 47)">
                <ellipse cx="72" cy="73" rx="62" ry="48" fill="#ffffff" stroke="#67e8f9" strokeWidth="4" />
                <ellipse cx="72" cy="73" rx="29" ry="23" fill="#f5f3ff" stroke="#a78bfa" strokeWidth="3" />
                {[44, 72, 100].map((x, index) => (
                  <g key={x} transform={`translate(${x}, ${64 + (index % 2) * 17}) rotate(${index % 2 ? 20 : -20})`}>
                    <path d="M-8 -10C-2 -3 2 3 8 10" stroke="#8b5cf6" strokeWidth="5" strokeLinecap="round" />
                    <path d="M8 -10C2 -3 -2 3 -8 10" stroke="#8b5cf6" strokeWidth="5" strokeLinecap="round" />
                  </g>
                ))}
                <path d="M20 73C43 46 101 46 124 73" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
                <path d="M20 73C43 100 101 100 124 73" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
              </g>
              <g transform="translate(34, 160)">
                <rect x="0" y="0" width="76" height="38" rx="15" fill="#ffffff" stroke="#bae6fd" strokeWidth="2" />
                <text x="38" y="16" fill="#64748b" fontSize="9" fontWeight="800" textAnchor="middle">Mitosis</text>
                <text x="38" y="30" fill="#0891b2" fontSize="13" fontWeight="900" textAnchor="middle">IPMAT</text>
              </g>
              <circle cx="180" cy="81" r="5" fill="#22c55e" opacity="0.75" />
              <circle cx="190" cy="153" r="4" fill="#a78bfa" opacity="0.8" />
            </svg>
          ) : isMendelian ? (
            <svg className="w-full h-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="122" cy="124" r="74" fill="#ddd6fe" opacity="0.42" filter="blur(30px)" />
              <circle cx="122" cy="124" r="52" fill="#faf5ff" opacity="0.88" />
              <g transform="translate(66, 57)">
                <rect x="0" y="0" width="108" height="108" rx="20" fill="#ffffff" stroke="#ddd6fe" strokeWidth="4" />
                <path d="M54 0V108M0 54H108" stroke="#e9d5ff" strokeWidth="4" />
                {["YY", "Yy", "Yy", "yy"].map((label, index) => (
                  <g key={`${label}-${index}`} transform={`translate(${index % 2 ? 81 : 27}, ${index > 1 ? 81 : 27})`}>
                    <circle r="18" fill={label === "yy" ? "#f1f5f9" : "#dcfce7"} stroke={label === "yy" ? "#94a3b8" : "#22c55e"} strokeWidth="3" />
                    <text y="5" fill={label === "yy" ? "#475569" : "#15803d"} fontSize="13" fontWeight="900" textAnchor="middle">{label}</text>
                  </g>
                ))}
              </g>
              <path d="M42 184C42 169 42 159 42 148" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" />
              <path d="M42 163C29 151 18 155 12 166C25 172 36 173 42 163Z" fill="#22c55e" />
              <path d="M42 157C56 145 70 149 76 162C61 168 50 168 42 157Z" fill="#16a34a" />
              <g transform="translate(132, 171)">
                <rect x="0" y="0" width="74" height="36" rx="14" fill="#ffffff" stroke="#ddd6fe" strokeWidth="2" />
                <text x="37" y="15" fill="#64748b" fontSize="9" fontWeight="800" textAnchor="middle">Ratio</text>
                <text x="37" y="29" fill="#7c3aed" fontSize="13" fontWeight="900" textAnchor="middle">3 : 1</text>
              </g>
            </svg>
          ) : isPhotosynthesis ? (
            <svg className="w-full h-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="124" cy="125" r="74" fill="#bbf7d0" opacity="0.36" filter="blur(30px)" />
              <circle cx="124" cy="125" r="50" fill="#ecfdf5" opacity="0.86" />

              <circle cx="64" cy="54" r="22" fill="#facc15" />
              <path d="M76 71L134 140L184 93L92 41Z" fill="#fde68a" opacity="0.44" />
              <path d="M64 18V7M64 101V90M28 54H17M111 54H100M38 28L30 20M98 88L90 80M38 80L30 88M98 20L90 28" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />

              {/* Chamber */}
              <g transform="translate(58, 65)">
                <rect x="20" y="22" width="120" height="118" rx="30" fill="#ffffff" opacity="0.82" stroke="#86efac" strokeWidth="4" />
                <path d="M31 100C55 91 78 108 101 99C116 93 127 94 138 101V123C138 131 132 137 124 137H45C37 137 31 131 31 123V100Z" fill="#7dd3fc" opacity="0.45" />
                <path d="M81 125C81 99 81 79 81 58" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
                <path d="M81 83C61 67 42 70 28 86C46 94 66 96 81 83Z" fill="#16a34a" />
                <path d="M81 70C101 49 126 53 139 73C118 79 99 82 81 70Z" fill="#22c55e" />
                <path d="M81 107C101 93 122 98 136 118C113 122 96 119 81 107Z" fill="#15803d" />
                <rect x="63" y="123" width="39" height="15" rx="6" fill="#92400e" />
              </g>

              {/* CO2 and O2 bubbles */}
              <g className="animate-pulse">
                <circle cx="181" cy="90" r="5" fill="#38bdf8" />
                <circle cx="197" cy="112" r="4" fill="#22c55e" />
                <circle cx="183" cy="146" r="3" fill="#22c55e" />
                <text x="188" y="76" fill="#0891b2" fontSize="13" fontWeight="900" textAnchor="middle">CO₂</text>
                <text x="194" y="166" fill="#16a34a" fontSize="12" fontWeight="900" textAnchor="middle">O₂</text>
              </g>

              <g transform="translate(25, 142)">
                <rect x="0" y="0" width="68" height="39" rx="15" fill="#ffffff" stroke="#bbf7d0" strokeWidth="2" />
                <text x="34" y="17" fill="#64748b" fontSize="9" fontWeight="800" textAnchor="middle">Rate</text>
                <text x="34" y="31" fill="#16a34a" fontSize="14" fontWeight="900" textAnchor="middle">O₂ ↑</text>
              </g>
            </svg>
          ) : isCharlesLaw ? (
            <svg className="w-full h-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="122" cy="126" r="74" fill="#fed7aa" opacity="0.34" filter="blur(30px)" />
              <circle cx="122" cy="126" r="50" fill="#ecfeff" opacity="0.82" />

              {/* Water bath */}
              <g transform="translate(47, 88)">
                <path d="M16 12H130L116 106H30L16 12Z" fill="#ffffff" stroke="#38bdf8" strokeWidth="4" />
                <path d="M29 58C47 49 66 63 84 56C101 50 113 52 122 60L114 99H32L29 58Z" fill="#7dd3fc" opacity="0.55" />
                <path d="M29 58C47 49 66 63 84 56C101 50 113 52 122 60" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" />
              </g>

              {/* Expanding gas cylinder */}
              <g transform="translate(92, 49)">
                <rect x="0" y="0" width="48" height="112" rx="18" fill="#f8fafc" stroke="#64748b" strokeWidth="4" />
                <rect x="8" y="34" width="32" height="70" rx="14" fill="#fdba74" opacity="0.76" />
                <path d="M9 28H39M9 52H34M9 76H39" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                <rect x="5" y="26" width="38" height="10" rx="5" fill="#334155" />
                <path d="M24 26V-14" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
                <path d="M11 -14H37" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
              </g>

              {/* Thermometer */}
              <g transform="translate(151, 39)">
                <rect x="12" y="0" width="15" height="103" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
                <circle cx="19.5" cy="111" r="15" fill="#ef4444" stroke="#cbd5e1" strokeWidth="3" />
                <rect x="17" y="37" width="5" height="74" rx="2.5" fill="#ef4444" />
                <circle cx="19.5" cy="111" r="10" fill="#ef4444" />
                <path d="M29 20H36M29 42H34M29 64H36" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Heater waves */}
              <g transform="translate(72, 197)">
                <rect x="0" y="0" width="95" height="12" rx="6" fill="#475569" />
                <path d="M22 -7C17 -14 28 -17 22 -26M48 -7C43 -14 54 -17 48 -26M74 -7C69 -14 80 -17 74 -26" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
              </g>

              <g transform="translate(25, 55)">
                <rect x="0" y="0" width="64" height="38" rx="15" fill="#ffffff" stroke="#fed7aa" strokeWidth="2" />
                <text x="32" y="16" fill="#64748b" fontSize="9" fontWeight="800" textAnchor="middle">Charles</text>
                <text x="32" y="30" fill="#ea580c" fontSize="14" fontWeight="900" textAnchor="middle">V/T=k</text>
              </g>

              <circle cx="47" cy="177" r="5" fill="#22c55e" opacity="0.75" />
              <circle cx="190" cy="74" r="4" fill="#a78bfa" opacity="0.8" />
              <circle cx="185" cy="166" r="3" fill="#38bdf8" opacity="0.7" />
            </svg>
          ) : isBoylesLaw ? (
            <svg className="w-full h-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="123" cy="124" r="74" fill="#dbeafe" opacity="0.42" filter="blur(30px)" />
              <circle cx="123" cy="124" r="50" fill="#ecfeff" opacity="0.85" />

              {/* Gas syringe barrel */}
              <g transform="translate(33, 88)">
                <rect x="18" y="26" width="126" height="48" rx="20" fill="#f8fafc" stroke="#38bdf8" strokeWidth="4" />
                <rect x="31" y="34" width="74" height="32" rx="15" fill="#bfdbfe" opacity="0.72" />
                <path d="M44 28V72M64 28V72M84 28V72M104 28V72" stroke="#93c5fd" strokeWidth="2" opacity="0.75" />
                <rect x="112" y="36" width="20" height="28" rx="8" fill="#64748b" />
                <path d="M132 50H172" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
                <path d="M170 30V70" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
                <path d="M16 50H2" stroke="#0891b2" strokeWidth="5" strokeLinecap="round" />
              </g>

              {/* Pressure gauge */}
              <g transform="translate(129, 36)">
                <circle cx="39" cy="39" r="34" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
                <path d="M15 50C20 31 30 22 48 23" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
                <path d="M39 39L57 28" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                <circle cx="39" cy="39" r="5" fill="#ef4444" />
                <text x="39" y="61" fill="#0891b2" fontSize="11" fontWeight="900" textAnchor="middle">kPa</text>
              </g>

              {/* Molecules */}
              <g className="animate-pulse">
                <circle cx="72" cy="98" r="4" fill="#22c55e" />
                <circle cx="91" cy="130" r="3" fill="#60a5fa" />
                <circle cx="122" cy="114" r="3.5" fill="#a78bfa" />
                <circle cx="56" cy="147" r="3" fill="#f59e0b" />
              </g>

              {/* P-V tag */}
              <g transform="translate(40, 52)">
                <rect x="0" y="0" width="68" height="39" rx="15" fill="#ffffff" stroke="#bae6fd" strokeWidth="2" />
                <text x="34" y="17" fill="#64748b" fontSize="9" fontWeight="800" textAnchor="middle">Boyle</text>
                <text x="34" y="31" fill="#0891b2" fontSize="14" fontWeight="900" textAnchor="middle">PV=k</text>
              </g>
            </svg>
          ) : isAcidBase ? (
            <svg className="w-full h-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="122" cy="126" r="72" fill="#ccfbf1" opacity="0.38" filter="blur(30px)" />
              <circle cx="122" cy="126" r="48" fill="#ecfeff" opacity="0.8" />

              {/* Burette stand */}
              <rect x="64" y="28" width="7" height="160" rx="3.5" fill="#94a3b8" />
              <rect x="45" y="184" width="90" height="12" rx="5" fill="#cbd5e1" />
              <path d="M68 54H151" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
              <circle cx="68" cy="54" r="7" fill="#475569" />

              {/* Burette */}
              <g transform="translate(136, 18)">
                <rect x="0" y="0" width="21" height="128" rx="9" fill="rgba(255,255,255,0.76)" stroke="#67e8f9" strokeWidth="3" />
                <path d="M4 18H17M4 34H14M4 50H17M4 66H14M4 82H17M4 98H14" stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="5" y="10" width="11" height="82" rx="5" fill="#38bdf8" opacity="0.34" />
                <path d="M10.5 128V146" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" />
                <path d="M5 116H16" stroke="#0e7490" strokeWidth="4" strokeLinecap="round" />
              </g>

              {/* Falling drops */}
              <path d="M147 166C147 166 141 174 141 179C141 183 144 186 147 186C151 186 154 183 154 179C154 174 147 166 147 166Z" fill="#22c55e" opacity="0.9" />
              <circle cx="151" cy="151" r="3" fill="#22c55e" opacity="0.75" />

              {/* Erlenmeyer flask */}
              <g transform="translate(76, 102)">
                <path d="M42 0H62M48 0V34L18 84C14 91 19 100 28 100H82C91 100 96 91 92 84L62 34V0" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M31 66H79L88 83C91 89 87 96 80 96H30C23 96 19 89 22 83L31 66Z" fill="#f9a8d4" opacity="0.72" />
                <path d="M36 74C48 69 63 70 76 74" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
                <circle cx="44" cy="83" r="3" fill="#ffffff" opacity="0.75" />
                <circle cx="66" cy="87" r="2" fill="#ffffff" opacity="0.65" />
              </g>

              {/* pH badge */}
              <g transform="translate(26, 69)">
                <rect x="0" y="0" width="58" height="36" rx="14" fill="#ffffff" stroke="#bae6fd" strokeWidth="2" />
                <text x="14" y="15" fill="#64748b" fontSize="9" fontWeight="800">pH</text>
                <text x="14" y="29" fill="#be185d" fontSize="16" fontWeight="900">7.0</text>
              </g>

              <circle cx="52" cy="47" r="5" fill="#22c55e" opacity="0.75" />
              <circle cx="190" cy="84" r="4" fill="#a78bfa" opacity="0.8" />
              <circle cx="184" cy="156" r="3" fill="#38bdf8" opacity="0.7" />
            </svg>
          ) : (
          <svg className="w-full h-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Glowing aura */}
            <circle cx="120" cy="120" r="70" fill="#bfdbfe" opacity="0.3" filter="blur(30px)" />
            <circle cx="120" cy="120" r="45" fill="#e0f2fe" opacity="0.5" />

            {/* Physics orbital path */}
            <ellipse cx="120" cy="120" rx="90" ry="30" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" transform="rotate(-15 120 120)" />

            {/* Large Ice Cube */}
            <g transform="translate(45, 60)">
              {/* Isometric Top */}
              <path d="M40,20 L10,35 L40,50 L70,35 Z" fill="#bae6fd" />
              {/* Isometric Left */}
              <path d="M10,35 L40,50 L40,90 L10,75 Z" fill="#93c5fd" opacity="0.8" />
              {/* Isometric Right */}
              <path d="M40,50 L70,35 L70,75 L40,90 Z" fill="#60a5fa" opacity="0.9" />
              
              {/* Glare and highlights on ice cube */}
              <path d="M40,52 L14,39 M40,52 L66,39" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              <path d="M40,24 L20,34" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              
              {/* Water puddle/droplet at the bottom */}
              <path d="M2,82 Q30,95 72,88 Q88,86 78,80 Q55,72 6,78 Z" fill="#e0f2fe" opacity="0.6" />
            </g>

            {/* Thermometer sticking inside the ice cube */}
            <g transform="translate(130, 20)">
              {/* Glass Tube Shaft */}
              <rect x="18" y="10" width="14" height="135" rx="7" fill="rgba(255, 255, 255, 0.7)" stroke="#cbd5e1" strokeWidth="3" />
              {/* Thermometer bulb at base */}
              <circle cx="25" cy="148" r="18" fill="#ef4444" stroke="#cbd5e1" strokeWidth="3" />
              <circle cx="25" cy="148" r="15" fill="#ef4444" />
              
              {/* Active low temperature liquid column */}
              <rect x="23" y="100" width="4" height="45" fill="#ef4444" />
              
              {/* Glare line */}
              <path d="M22,18 L22,130" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
              
              {/* Calibration notches */}
              <line x1="32" y1="30" x2="37" y2="30" stroke="#94a3b8" strokeWidth="2" />
              <line x1="32" y1="45" x2="37" y2="45" stroke="#ef4444" strokeWidth="2" />
              <line x1="32" y1="60" x2="37" y2="60" stroke="#94a3b8" strokeWidth="2" />
              <line x1="32" y1="75" x2="37" y2="75" stroke="#94a3b8" strokeWidth="2" />
              <line x1="32" y1="90" x2="37" y2="90" stroke="#94a3b8" strokeWidth="2" />
              <line x1="32" y1="105" x2="37" y2="105" stroke="#94a3b8" strokeWidth="2" />
            </g>

            {/* Floating Snowflakes & Sparkles */}
            <g className="animate-pulse">
              <Snowflake className="w-5 h-5 text-blue-400 absolute" style={{ top: "35px", left: "155px" }} />
              <Snowflake className="w-4 h-4 text-blue-300 absolute" style={{ top: "145px", left: "30px" }} />
              <circle cx="35" cy="80" r="3" fill="#60a5fa" />
              <circle cx="195" cy="90" r="2" fill="#3b82f6" />
              <circle cx="180" cy="150" r="4" fill="#93c5fd" />
            </g>
          </svg>
          )}
        </div>

      </div>
    </div>
  );
}
