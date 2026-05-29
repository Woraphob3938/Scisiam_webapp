"use client";

import React from "react";
import Link from "next/link";
import { Atom, FlaskConical, Gauge, Play, ArrowLeft, Snowflake, Thermometer, Leaf, Dna, Microscope } from "lucide-react";

interface LabHeroProps {
  labId?: string;
  title: string;
  category: string;
  status: string;
  description: string;
  onStartExperiment?: () => void;
}

export default function LabHero({
  labId = "newtons-cooling",
  title,
  category,
  status,
  description,
  onStartExperiment,
}: LabHeroProps) {
  const isAcidBase = labId === "acid-base-titration";
  const isBoylesLaw = labId === "boyles-law";
  const isCharlesLaw = labId === "charles-law";
  const isPhotosynthesis = labId === "photosynthesis-rate";
  const isMendelian = labId === "mendels-inheritance";
  const isMitosis = labId === "mitosis-division";
  const isBiology = isPhotosynthesis || isMendelian || isMitosis;
  const HeroIcon = isMitosis ? Microscope : isMendelian ? Dna : isPhotosynthesis ? Leaf : isCharlesLaw ? Thermometer : isBoylesLaw ? Gauge : isAcidBase ? FlaskConical : Atom;
  const chemistryTone = isAcidBase || isBoylesLaw || isCharlesLaw;
  const iconClass = isBiology ? "bg-emerald-600 shadow-emerald-500/20" : chemistryTone ? "bg-cyan-600 shadow-cyan-500/20" : "bg-blue-600 shadow-blue-500/20";
  const badgeClass = isBiology ? "bg-emerald-50 text-emerald-700 border-emerald-100" : chemistryTone ? "bg-cyan-50 text-cyan-700 border-cyan-100" : "bg-blue-50 text-blue-700 border-blue-100";

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-12 md:px-20 py-3 select-none">
      <div className="relative overflow-hidden bg-white border border-slate-200/70 rounded-[24px] p-5 sm:p-7 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10">

        {/* Left Side: Content & Actions */}
        <div className="flex-1 flex flex-col items-start text-left z-10 w-full">
          {/* Header row with Atom indicator box and Subject Tags */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            {/* Physics Logo Icon */}
            <div className={`w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-sm ${iconClass}`}>
              <HeroIcon className="w-5 h-5" />
            </div>

            {/* Department Category badge */}
            <span className={`px-3 py-1 border text-xs font-bold rounded-full ${badgeClass}`}>
              {category}
            </span>

            {/* Status badge */}
            {status === "ว่าง" && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                ว่าง
              </span>
            )}
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 leading-[1.15] tracking-normal">
            {title}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed max-w-2xl mb-6">
            {description}
          </p>

          {/* Buttons Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
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
              href="/"
              className="flex items-center justify-center gap-1.5 py-3 px-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl focus:outline-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับไปหน้ารายชื่อห้องแล็บ</span>
            </Link>
          </div>
        </div>

        {/* Right Side: High-Fidelity SVG Experiment Illustration */}
        <div className="relative shrink-0 w-48 h-48 sm:w-60 sm:h-60 select-none flex items-center justify-center opacity-95">
          {isMitosis ? (
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
