"use client";

import React from "react";
import { Eye, ArrowRight } from "lucide-react";

export interface LabData {
  id: string;
  title: string;
  category: "Physics" | "Chemistry" | "Biology";
  status: "ว่าง" | string;
  description: string;
}

interface LabCardProps {
  lab: LabData;
  onViewDetails?: (id: string) => void;
  onEnterRoom?: (id: string) => void;
}

// 1. SVG Illustration for Physics (Newton's law of cooling)
// Ice cube with thermometer showing cold
const NewtonCooldownSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    
    {/* Ice Cube Isometric Shape */}
    <g transform="translate(45, 30)">
      {/* Front Left Face */}
      <path d="M35,42 L12,30 L12,54 L35,66 Z" fill="#93c5fd" opacity="0.8" />
      {/* Front Right Face */}
      <path d="M35,42 L58,30 L58,54 L35,66 Z" fill="#60a5fa" opacity="0.9" />
      {/* Top Face */}
      <path d="M35,42 L12,30 L35,18 L58,30 Z" fill="#bfdbfe" />
      {/* Sparkles / Highlights on Ice */}
      <path d="M35,44 L15,34" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M35,44 L55,34" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </g>

    {/* Thermometer */}
    <g transform="translate(108, 15)">
      {/* Glass Body */}
      <rect x="14" y="5" width="10" height="70" rx="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      {/* Bulb at the bottom */}
      <circle cx="19" cy="72" r="12" fill="#ef4444" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx="19" cy="72" r="10" fill="#ef4444" />
      
      {/* Red liquid column (low temperature for cooling) */}
      <rect x="17" y="45" width="4" height="25" fill="#ef4444" />
      
      {/* Measurement notches */}
      <line x1="24" y1="15" x2="27" y2="15" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="24" y1="25" x2="27" y2="25" stroke="#ef4444" strokeWidth="1.5" />
      <line x1="24" y1="35" x2="27" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="24" y1="45" x2="27" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
      
      {/* Temperature glare line */}
      <path d="M17,10 L17,68" stroke="#ffffff" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
    </g>

    {/* Cold Sparkles */}
    <circle cx="45" cy="40" r="1.5" fill="#60a5fa" />
    <circle cx="145" cy="75" r="2" fill="#3b82f6" className="animate-pulse" />
    <path d="M140,30 L145,35 M145,30 L140,35" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 2. SVG Illustration for Chemistry (Acid-Base Titration Lab)
// Flask and burette
const TitrationSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#fee2e2" opacity="0.4" />

    {/* Burette Stand & Tube */}
    <g transform="translate(100, 10)">
      {/* Base & Stand shaft */}
      <rect x="18" y="90" width="30" height="4" fill="#64748b" />
      <line x1="20" y1="20" x2="20" y2="90" stroke="#94a3b8" strokeWidth="3" />
      
      {/* Clamp */}
      <path d="M8,45 L20,45" stroke="#475569" strokeWidth="4" />
      
      {/* Burette Glass Column */}
      <rect x="4" y="5" width="8" height="65" rx="1.5" fill="rgba(255, 255, 255, 0.8)" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Active liquid inside burette */}
      <rect x="6" y="25" width="4" height="40" fill="#f87171" opacity="0.7" />
      
      {/* Stopcock valve */}
      <circle cx="8" cy="72" r="3" fill="#ef4444" />
      
      {/* Drop falling */}
      <circle cx="8" cy="85" r="2" fill="#f87171" className="animate-bounce" />
    </g>

    {/* Laboratory Flask */}
    <g transform="translate(68, 52)">
      {/* Flask Body */}
      <path d="M26,8 L26,20 L12,42 A8,8 0 0,0 18,54 L44,54 A8,8 0 0,0 50,42 L36,20 L36,8 Z" fill="rgba(255, 255, 255, 0.9)" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" />
      {/* Liquid inside flask */}
      <path d="M16,40 L46,40 A8,8 0 0,1 50,42 L44,54 L18,54 A8,8 0 0,1 12,42 Z" fill="#ef4444" opacity="0.75" />
      {/* Bubbles in flask */}
      <circle cx="25" cy="46" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="36" cy="48" r="2" fill="#ffffff" opacity="0.7" />
    </g>

    {/* Chemical Sparkles */}
    <circle cx="60" cy="40" r="2" fill="#ef4444" className="animate-pulse" />
    <circle cx="148" cy="50" r="1.5" fill="#f87171" />
  </svg>
);

// 4. Boyle's Law SVG
const BoylesLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#fee2e2" opacity="0.4" />
    <rect x="50" y="45" width="80" height="30" rx="2" fill="rgba(255,255,255,0.8)" stroke="#94a3b8" strokeWidth="2" />
    <rect x="110" y="46" width="6" height="28" fill="#ef4444" />
    <rect x="116" y="57" width="40" height="6" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
    <rect x="156" y="50" width="4" height="20" fill="#475569" />

    <circle cx="60" cy="55" r="2.5" fill="#ef4444" />
    <circle cx="70" cy="50" r="2.5" fill="#ef4444" className="animate-pulse" />
    <circle cx="65" cy="65" r="2.5" fill="#ef4444" />
    <circle cx="78" cy="60" r="2.5" fill="#ef4444" />
    <circle cx="85" cy="52" r="2.5" fill="#ef4444" />
    <circle cx="95" cy="58" r="2.5" fill="#ef4444" className="animate-pulse" />
    <circle cx="90" cy="68" r="2.5" fill="#ef4444" />
    <circle cx="75" cy="70" r="2.5" fill="#ef4444" />

    <g transform="translate(15, 45)">
      <circle cx="15" cy="15" r="12" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M15,15 L23,20" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
      <text x="15" y="24" fill="#94a3b8" fontSize="6" textAnchor="middle" fontWeight="bold">P</text>
    </g>
  </svg>
);

// 5. Charles's Law SVG
const CharlessLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#fee2e2" opacity="0.4" />
    <path d="M90,105 L110,105 L104,85 L96,85 Z" fill="#64748b" stroke="#475569" strokeWidth="1.5" />
    <path d="M100,85 L100,80" stroke="#94a3b8" strokeWidth="2" />
    <path d="M100,70 Q95,78 100,83 Q105,78 100,70" fill="#f59e0b" className="animate-bounce" />
    <path d="M100,74 Q97,79 100,82 Q103,79 100,74" fill="#ef4444" />

    <rect x="70" y="20" width="60" height="50" rx="3" fill="rgba(255,255,255,0.85)" stroke="#94a3b8" strokeWidth="2" />
    <rect x="72" y="25" width="56" height="6" fill="#ef4444" />

    <circle cx="85" cy="40" r="2.5" fill="#ef4444" />
    <circle cx="115" cy="38" r="2.5" fill="#ef4444" className="animate-pulse" />
    <circle cx="100" cy="45" r="2.5" fill="#ef4444" />
    <circle cx="90" cy="55" r="2.5" fill="#ef4444" />
    <circle cx="110" cy="58" r="2.5" fill="#ef4444" className="animate-pulse" />
    <circle cx="120" cy="48" r="2.5" fill="#ef4444" />
  </svg>
);

// 6. Le Chatelier's Principle SVG
const LeChateliersPrincipleSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#fee2e2" opacity="0.4" />
    <line x1="100" y1="30" x2="100" y2="90" stroke="#475569" strokeWidth="3" />
    <rect x="80" y="90" width="40" height="5" fill="#475569" rx="1" />
    
    <line x1="50" y1="40" x2="150" y2="40" stroke="#475569" strokeWidth="2" />
    <circle cx="100" cy="40" r="3" fill="#94a3b8" />

    <path d="M40,40 L45,65 H75 L80,40" stroke="#475569" strokeWidth="1.5" fill="none" />
    <path d="M46,63 H74 L78,45 H42 Z" fill="#ef4444" opacity="0.75" />

    <path d="M120,40 L125,65 H155 L160,40" stroke="#475569" strokeWidth="1.5" fill="none" />
    <path d="M126,63 H154 L158,45 H122 Z" fill="#f87171" opacity="0.4" />

    <path d="M92,20 L108,20 M104,17 L108,20 L104,23" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M108,26 L92,26 M96,23 L92,26 L96,29" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 7. Beer-Lambert Law SVG
const BeerLambertLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#fee2e2" opacity="0.4" />
    <rect x="85" y="25" width="30" height="70" rx="1" fill="rgba(255,255,255,0.7)" stroke="#94a3b8" strokeWidth="2" />
    <rect x="87" y="35" width="26" height="58" fill="#ef4444" opacity="0.75" />

    <path d="M20,60 L85,60" stroke="#f59e0b" strokeWidth="6" opacity="0.9" strokeLinecap="round" />
    <path d="M115,60 L180,60" stroke="#f59e0b" strokeWidth="2.5" opacity="0.5" strokeLinecap="round" />

    <text x="50" y="50" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">Light I₀</text>
    <text x="150" y="50" fill="#d97706" fontSize="8" fontWeight="bold" textAnchor="middle">Light I</text>
  </svg>
);

// 8. Hess's Law SVG
const HesssLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#fee2e2" opacity="0.4" />
    <path d="M75,35 L80,85 A8,8 0 0,0 88,93 H112 A8,8 0 0,0 120,85 L125,35 Z" fill="rgba(255,255,255,0.9)" stroke="#94a3b8" strokeWidth="2" />
    <line x1="72" y1="35" x2="128" y2="35" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

    <path d="M81,80 A6,6 0 0,0 87,86 H113 A6,6 0 0,0 119,80 L122,50 H78 Z" fill="#ef4444" opacity="0.5" />

    <rect x="98" y="15" width="4" height="60" rx="1.5" fill="#ffffff" stroke="#475569" strokeWidth="1" />
    <circle cx="100" cy="74" r="5" fill="#ef4444" stroke="#475569" strokeWidth="1" />
    <rect x="99.5" y="45" width="1" height="30" fill="#ef4444" />

    <path d="M68,50 Q64,55 68,60" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" />
    <path d="M132,50 Q136,55 132,60" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" />
  </svg>
);

// 9. Galvanic Cell SVG
const GalvanicCellSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#fee2e2" opacity="0.4" />
    <path d="M35,50 L38,85 A5,5 0 0,0 43,90 H67 A5,5 0 0,0 72,85 L75,50" stroke="#64748b" strokeWidth="1.5" fill="none" />
    <path d="M38,82 H72 L74,60 H36 Z" fill="#fee2e2" />
    <rect x="42" y="40" width="8" height="42" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />

    <path d="M125,50 L128,85 A5,5 0 0,0 133,90 H157 A5,5 0 0,0 162,85 L165,50" stroke="#64748b" strokeWidth="1.5" fill="none" />
    <path d="M128,82 H162 L164,60 H126 Z" fill="#93c5fd" opacity="0.4" />
    <rect x="150" y="40" width="8" height="42" fill="#94a3b8" stroke="#475569" strokeWidth="1" />

    <path d="M60,65 L60,45 A10,10 0 0,1 80,35 H120 A10,10 0 0,1 140,45 L140,65" stroke="#e2e8f0" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M60,65 L60,45 A10,10 0 0,1 80,35 H120 A10,10 0 0,1 140,45 L140,65" stroke="#cbd5e1" strokeWidth="3" fill="none" strokeLinecap="round" />

    <path d="M46,40 L46,25 L90,25" stroke="#475569" strokeWidth="1.5" fill="none" />
    <path d="M154,40 L154,25 L110,25" stroke="#475569" strokeWidth="1.5" fill="none" />
    <circle cx="100" cy="25" r="9" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
    <text x="100" y="29" fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="middle" className="animate-pulse">V</text>
  </svg>
);

// 10. Chemical Kinetics SVG
const ChemicalKineticsSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#fee2e2" opacity="0.4" />
    
    <g transform="translate(60, 45)">
      <circle cx="0" cy="0" r="8" fill="#ef4444" />
      <circle cx="14" cy="0" r="6" fill="#f87171" />
      <path d="M7,-10 L7,10 M-3,0 L17,0" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" className="animate-ping" />
    </g>

    <g transform="translate(130, 70)">
      <circle cx="0" cy="0" r="7" fill="#ef4444" />
      <circle cx="12" cy="0" r="7" fill="#94a3b8" />
      <path d="M6,-8 L6,8 M-2,0 L14,0" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
    </g>

    <path d="M30,95 Q70,95 90,40 T150,95" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.6" />
    <text x="90" y="32" fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="middle">Ea</text>
  </svg>
);

// 11. Solubility Product SVG
const SolubilityProductSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#fee2e2" opacity="0.4" />
    <path d="M65,30 L68,90 A6,6 0 0,0 74,96 H126 A6,6 0 0,0 132,90 L135,30" stroke="#64748b" strokeWidth="2" fill="none" />
    <path d="M68,88 H132 L133,48 H67 Z" fill="#fee2e2" opacity="0.5" />

    <g className="animate-pulse">
      <circle cx="80" cy="60" r="3" fill="#ef4444" />
      <text x="80" y="62" fill="#ffffff" fontSize="5" textAnchor="middle">+</text>
      
      <circle cx="115" cy="55" r="3" fill="#f87171" />
      <text x="115" y="57" fill="#ffffff" fontSize="5" textAnchor="middle">-</text>

      <circle cx="95" cy="72" r="3" fill="#ef4444" />
      <text x="95" y="74" fill="#ffffff" fontSize="5" textAnchor="middle">+</text>

      <circle cx="110" cy="78" r="3" fill="#f87171" />
      <text x="110" y="80" fill="#ffffff" fontSize="5" textAnchor="middle">-</text>
    </g>

    <path d="M80,95 Q100,85 120,95 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
    <circle cx="90" cy="91" r="2.5" fill="#b91c1c" />
    <circle cx="105" cy="90" r="2" fill="#ef4444" />
    <circle cx="98" cy="92" r="2.5" fill="#f87171" />
  </svg>
);

// 12. Avogadro's Law SVG
const AvogadrosLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#fee2e2" opacity="0.4" />
    <rect x="35" y="35" width="50" height="50" rx="4" fill="rgba(255,255,255,0.8)" stroke="#94a3b8" strokeWidth="2" />
    <circle cx="45" cy="45" r="3" fill="#ef4444" />
    <circle cx="75" cy="48" r="3" fill="#ef4444" className="animate-pulse" />
    <circle cx="60" cy="60" r="3" fill="#ef4444" />
    <circle cx="48" cy="72" r="3" fill="#ef4444" />
    <circle cx="70" cy="70" r="3" fill="#ef4444" className="animate-pulse" />
    <text x="60" y="100" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">1 Mole O₂</text>

    <rect x="115" y="35" width="50" height="50" rx="4" fill="rgba(255,255,255,0.8)" stroke="#94a3b8" strokeWidth="2" />
    <g className="animate-pulse">
      <circle cx="125" cy="45" r="2.5" fill="#f87171" /><circle cx="130" cy="45" r="2" fill="#ef4444" />
      <circle cx="150" cy="50" r="2.5" fill="#f87171" /><circle cx="155" cy="50" r="2" fill="#ef4444" />
      <circle cx="135" cy="65" r="2.5" fill="#f87171" /><circle cx="140" cy="65" r="2" fill="#ef4444" />
      <circle cx="128" cy="75" r="2.5" fill="#f87171" /><circle cx="133" cy="75" r="2" fill="#ef4444" />
      <circle cx="152" cy="72" r="2.5" fill="#f87171" /><circle cx="157" cy="72" r="2" fill="#ef4444" />
    </g>
    <text x="140" y="100" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">1 Mole CO₂</text>
  </svg>
);

// 13. Electrolysis SVG
const ElectrolysisSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#fee2e2" opacity="0.4" />
    <path d="M60,40 L63,90 A5,5 0 0,0 68,95 H132 A5,5 0 0,0 137,90 L140,40" stroke="#64748b" strokeWidth="2" fill="none" />
    <path d="M63,88 H137 L139,52 H61 Z" fill="#fee2e2" opacity="0.5" />

    <rect x="75" y="30" width="8" height="50" fill="#475569" />
    <rect x="117" y="30" width="8" height="50" fill="#ef4444" />

    <circle cx="80" cy="45" r="1.5" fill="#ffffff" opacity="0.8" className="animate-bounce" />
    <circle cx="78" cy="60" r="2" fill="#ffffff" opacity="0.8" />
    <circle cx="81" cy="70" r="1.5" fill="#ffffff" opacity="0.8" className="animate-bounce" />

    <circle cx="119" cy="50" r="2" fill="#ffffff" opacity="0.8" className="animate-bounce" />
    <circle cx="122" cy="62" r="1.5" fill="#ffffff" opacity="0.8" />
    <circle cx="120" cy="72" r="2" fill="#ffffff" opacity="0.8" className="animate-bounce" />

    <rect x="93" y="10" width="14" height="18" fill="#475569" rx="1" />
    <path d="M79,30 L79,18 L93,18" stroke="#475569" strokeWidth="1.5" fill="none" />
    <path d="M121,30 L121,18 L107,18" stroke="#475569" strokeWidth="1.5" fill="none" />
  </svg>
);

// 14. Colligative Properties SVG
const ColligativePropertiesSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#fee2e2" opacity="0.4" />
    <path d="M60,35 L63,85 A5,5 0 0,0 68,90 H132 A5,5 0 0,0 137,85 L140,35" stroke="#64748b" strokeWidth="2" fill="none" />
    <path d="M63,83 H137 L138,50 H62 Z" fill="#fee2e2" opacity="0.6" />

    <circle cx="75" cy="65" r="3" fill="#ef4444" />
    <circle cx="95" cy="72" r="3" fill="#ef4444" className="animate-pulse" />
    <circle cx="115" cy="60" r="3" fill="#ef4444" />
    <circle cx="125" cy="75" r="3" fill="#ef4444" className="animate-pulse" />
    <circle cx="85" cy="78" r="3" fill="#ef4444" />
    <circle cx="105" cy="80" r="3" fill="#ef4444" />

    <circle cx="80" cy="55" r="1.5" fill="#ef4444" opacity="0.6" />
    <circle cx="110" cy="54" r="2" fill="#ef4444" opacity="0.6" />

    <path d="M85,25 Q82,18 85,12" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" className="animate-bounce" />
    <path d="M100,28 Q97,21 100,15" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M115,25 Q112,18 115,12" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" className="animate-bounce" />
  </svg>
);

// 15. Photosynthesis Rate Chamber SVG
const PhotosynthesisSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dcfce7" opacity="0.4" />

    {/* Sun in the top-right corner */}
    <g transform="translate(138, 12)">
      <circle cx="12" cy="12" r="8" fill="#f59e0b" className="animate-pulse" />
      <path d="M12,2 L12,0 M12,22 L12,24 M2,12 L0,12 M22,12 L24,12 M5,5 L3,3 M19,19 L21,21 M5,19 L3,21 M19,5 L21,3" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    {/* Chamber Dome (Semi-transparent) */}
    <g transform="translate(68, 30)">
      {/* Base */}
      <rect x="5" y="56" width="54" height="6" rx="2" fill="#475569" />
      
      {/* Plant inside pot */}
      <g transform="translate(18, 22)">
        {/* Pot */}
        <path d="M6,24 L22,24 L19,34 L9,34 Z" fill="#b45309" />
        {/* Stem */}
        <path d="M14,14 Q14,24 14,24" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
        {/* Leaves */}
        <path d="M14,15 Q8,10 9,6 Q16,8 14,15" fill="#22c55e" />
        <path d="M14,18 Q20,15 19,11 Q14,13 14,18" fill="#4ade80" />
        <path d="M14,22 Q7,21 8,16 Q13,18 14,22" fill="#15803d" />
      </g>

      {/* Glass Dome */}
      <path d="M10,56 C10,18 54,18 54,56 Z" fill="rgba(186, 230, 253, 0.25)" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="60 0" />
      {/* Reflection shine on dome */}
      <path d="M22,24 C28,21 44,22 46,30" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </g>

    {/* Sparkles / Oxygen bubbles */}
    <circle cx="58" cy="70" r="2.5" fill="#22c55e" className="animate-bounce" />
    <circle cx="140" cy="78" r="1.5" fill="#4ade80" />
  </svg>
);

// 4. Ohm's Law SVG
const OhmsLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    {/* Battery */}
    <rect x="35" y="45" width="24" height="30" rx="3" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" />
    <rect x="43" y="40" width="8" height="5" fill="#2563eb" />
    <path d="M47,53 L47,67 M40,60 L54,60" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    
    {/* Resistor */}
    <rect x="125" y="50" width="40" height="20" rx="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
    <rect x="133" y="50" width="4" height="20" fill="#ef4444" />
    <rect x="143" y="50" width="4" height="20" fill="#a855f7" />
    <rect x="153" y="50" width="4" height="20" fill="#f97316" />

    {/* Connecting Wires */}
    <path d="M59,60 L125,60 M165,60 L180,60 L180,95 L20,95 L20,60 L35,60" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round" />

    {/* Electrons */}
    <circle cx="80" cy="60" r="2.5" fill="#3b82f6" className="animate-pulse" />
    <circle cx="105" cy="60" r="2.5" fill="#3b82f6" />
    <circle cx="150" cy="95" r="2.5" fill="#3b82f6" className="animate-pulse" />
    <circle cx="90" cy="95" r="2.5" fill="#3b82f6" />

    <path d="M92,42 L100,50 M108,42 L100,50 M100,50 L100,40" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="100" cy="48" r="1.5" fill="#f59e0b" />
  </svg>
);

// 5. Hooke's Law SVG
const HookesLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <line x1="70" y1="20" x2="130" y2="20" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
    <line x1="75" y1="20" x2="70" y2="25" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="85" y1="20" x2="80" y2="25" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="95" y1="20" x2="90" y2="25" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="105" y1="20" x2="100" y2="25" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="115" y1="20" x2="110" y2="25" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="125" y1="20" x2="120" y2="25" stroke="#94a3b8" strokeWidth="1.5" />

    <path d="M100,20 L100,30 L90,34 L110,40 L90,46 L110,52 L90,58 L110,64 L90,70 L100,74 L100,80" stroke="#64748b" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

    <rect x="85" y="80" width="30" height="22" rx="3" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" />
    <text x="100" y="94" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">500g</text>

    <path d="M130,55 L130,85" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    <path d="M127,80 L130,85 L133,80" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="138" y="74" fill="#ef4444" fontSize="9" fontWeight="bold">F</text>
  </svg>
);

// 6. Snell's Law SVG
const SnellsLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <path d="M20,60 L180,60 L180,105 L20,105 Z" fill="#93c5fd" opacity="0.3" stroke="#60a5fa" strokeWidth="1.5" />
    <text x="25" y="48" fill="#64748b" fontSize="8" fontWeight="bold">Air (n₁)</text>
    <text x="25" y="78" fill="#2563eb" fontSize="8" fontWeight="bold">Glass (n₂)</text>

    <line x1="100" y1="20" x2="100" y2="100" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />

    <path d="M45,25 L100,60" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M100,60 L125,95" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

    <path d="M70,41 L73,43 L71,45" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    <path d="M112,77 L114,79 L112,81" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

    <path d="M100,45 A15,15 0 0,0 87,51" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
    <path d="M100,75 A15,15 0 0,1 109,73" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
    <text x="90" y="42" fill="#3b82f6" fontSize="7" fontWeight="bold">θ₁</text>
    <text x="108" y="85" fill="#3b82f6" fontSize="7" fontWeight="bold">θ₂</text>
  </svg>
);

// 7. Ideal Gas Law SVG
const IdealGasLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <path d="M60,25 L60,95 L140,95 L140,25" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

    <rect x="62" y="40" width="76" height="10" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
    <rect x="95" y="15" width="10" height="25" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
    <path d="M100,5 L100,20 M97,15 L100,20 L103,15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

    <circle cx="75" cy="60" r="3" fill="#3b82f6" />
    <path d="M79,60 L83,60" stroke="#3b82f6" strokeWidth="1" />
    
    <circle cx="120" cy="55" r="3" fill="#3b82f6" />
    <path d="M124,53 L128,51" stroke="#3b82f6" strokeWidth="1" />

    <circle cx="95" cy="70" r="3" fill="#3b82f6" />
    <path d="M91,72 L87,74" stroke="#3b82f6" strokeWidth="1" />

    <circle cx="70" cy="85" r="3" fill="#3b82f6" />
    <path d="M70,81 L70,77" stroke="#3b82f6" strokeWidth="1" />

    <circle cx="115" cy="80" r="3" fill="#3b82f6" />
    <path d="M119,82 L123,84" stroke="#3b82f6" strokeWidth="1" />

    <circle cx="130" cy="70" r="3" fill="#3b82f6" />
    <path d="M130,74 L130,78" stroke="#3b82f6" strokeWidth="1" />

    <circle cx="85" cy="50" r="3" fill="#3b82f6" />
    <path d="M82,47 L79,44" stroke="#3b82f6" strokeWidth="1" />

    <g transform="translate(145, 45)">
      <circle cx="15" cy="15" r="12" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
      <path d="M15,15 L22,7" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
      <text x="15" y="23" fill="#475569" fontSize="5" textAnchor="middle">P</text>
    </g>
  </svg>
);

// 8. Newton's Second Law SVG
const NewtonsSecondLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <line x1="20" y1="85" x2="180" y2="85" stroke="#475569" strokeWidth="2.5" />
    <line x1="40" y1="85" x2="35" y2="90" stroke="#94a3b8" strokeWidth="1" />
    <line x1="60" y1="85" x2="55" y2="90" stroke="#94a3b8" strokeWidth="1" />
    <line x1="80" y1="85" x2="75" y2="90" stroke="#94a3b8" strokeWidth="1" />
    <line x1="100" y1="85" x2="95" y2="90" stroke="#94a3b8" strokeWidth="1" />
    <line x1="120" y1="85" x2="115" y2="90" stroke="#94a3b8" strokeWidth="1" />
    <line x1="140" y1="85" x2="135" y2="90" stroke="#94a3b8" strokeWidth="1" />
    <line x1="160" y1="85" x2="155" y2="90" stroke="#94a3b8" strokeWidth="1" />

    <rect x="55" y="45" width="45" height="40" rx="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
    <text x="77" y="69" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">m</text>

    <path d="M100,65 L150,65" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
    <path d="M143,60 L150,65 L143,70" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <text x="125" y="55" fill="#10b981" fontSize="10" fontWeight="bold">F = ma</text>

    <path d="M65,33 L95,33" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 1" />
    <path d="M90,30 L95,33 L90,36" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="80" y="27" fill="#ef4444" fontSize="8" fontWeight="bold">a</text>
  </svg>
);

// 9. Conservation of Momentum SVG
const MomentumConservationSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <line x1="20" y1="80" x2="180" y2="80" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2" />

    <circle cx="60" cy="65" r="15" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
    <text x="60" y="69" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">m₁</text>
    <path d="M78,65 L100,65" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    <path d="M94,62 L100,65 L94,68" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="88" y="56" fill="#ef4444" fontSize="8" fontWeight="bold">v₁</text>

    <circle cx="145" cy="65" r="11" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
    <text x="145" y="68" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">m₂</text>
    <path d="M131,65 L115,65" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
    <path d="M121,62 L115,65 L121,68" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="120" y="56" fill="#3b82f6" fontSize="8" fontWeight="bold">v₂</text>

    <path d="M107,60 L108,55 M107,70 L108,75 M112,65 L117,65" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" className="animate-ping" />
  </svg>
);

// 10. Faraday's Law SVG
const FaradaysLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    
    <g transform="translate(30, 45) rotate(15)">
      <rect x="0" y="0" width="25" height="16" fill="#ef4444" rx="2" />
      <text x="12" y="12" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">N</text>
      <rect x="25" y="0" width="25" height="16" fill="#3b82f6" rx="2" />
      <text x="37" y="12" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">S</text>
      <path d="M55,8 L65,8 M61,5 L65,8 L61,11" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
    </g>

    <g transform="translate(110, 40)">
      <rect x="0" y="8" width="55" height="16" fill="#e2e8f0" rx="3" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M5,5 Q10,25 15,25 Q20,25 20,5 Q25,25 30,25 Q35,25 35,5 Q40,25 45,25 Q50,25 50,5" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      <path d="M0,16 L-10,16 L-10,60 L20,60 L20,40" stroke="#475569" strokeWidth="1.5" fill="none" />
      <path d="M55,16 L65,16 L65,60 L40,60 L40,40" stroke="#475569" strokeWidth="1.5" fill="none" />
    </g>

    <g transform="translate(130, 80)">
      <circle cx="10" cy="10" r="12" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
      <path d="M10,10 L16,4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" className="animate-bounce" />
      <text x="10" y="18" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="middle">V</text>
    </g>
  </svg>
);

// 11. Bernoulli's Principle SVG
const BernoullisPrincipleSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <path d="M20,35 Q60,35 80,48 L120,48 Q140,35 180,35" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M20,85 Q60,85 80,72 L120,72 Q140,85 180,85" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />

    <path d="M20,50 Q60,50 82,56 L118,56 Q140,50 180,50" stroke="#3b82f6" strokeWidth="1" opacity="0.8" />
    <path d="M20,60 H180" stroke="#60a5fa" strokeWidth="1.5" />
    <path d="M20,70 Q60,70 82,64 L118,64 Q140,70 180,70" stroke="#3b82f6" strokeWidth="1" opacity="0.8" />

    <circle cx="45" cy="60" r="2" fill="#1d4ed8" />
    <circle cx="100" cy="60" r="1.5" fill="#1d4ed8" className="animate-pulse" />
    <circle cx="155" cy="60" r="2" fill="#1d4ed8" />

    <rect x="45" y="15" width="8" height="20" fill="rgba(147, 197, 253, 0.4)" stroke="#64748b" strokeWidth="1.2" />
    <line x1="45" y1="23" x2="53" y2="23" stroke="#2563eb" strokeWidth="2.5" />
    
    <rect x="96" y="15" width="8" height="33" fill="rgba(147, 197, 253, 0.4)" stroke="#64748b" strokeWidth="1.2" />
    <line x1="96" y1="42" x2="104" y2="42" stroke="#2563eb" strokeWidth="2.5" />

    <text x="50" y="12" fill="#64748b" fontSize="7" textAnchor="middle">P₁</text>
    <text x="100" y="12" fill="#64748b" fontSize="7" textAnchor="middle">P₂</text>
  </svg>
);

// 12. Photoelectric Effect SVG
const PhotoelectricEffectSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    
    <path d="M20,15 Q30,5 40,15 T60,15 T80,15 L90,25" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
    <path d="M30,35 Q40,25 50,35 T70,35 T90,35 L100,45" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M85,25 L90,25 L88,20" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />

    <rect x="90" y="70" width="80" height="12" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
    <text x="130" y="93" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle">Metal Cathode</text>

    <g transform="translate(100, 30)">
      <circle cx="15" cy="30" r="3" fill="#10b981" />
      <text x="15" y="32.5" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">-</text>
      <path d="M12,33 L5,38" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
      
      <circle cx="35" cy="20" r="3" fill="#10b981" />
      <text x="35" y="22.5" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">-</text>
      <path d="M32,23 L25,29" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />

      <circle cx="55" cy="32" r="3" fill="#10b981" />
      <text x="55" y="34.5" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">-</text>
      <path d="M52,35 L45,41" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </svg>
);

// 13. Kepler's Laws SVG
const KeplersLawsSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    
    <ellipse cx="100" cy="60" rx="70" ry="35" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />

    <path d="M80,60 L120,29 A70,35 0 0,1 155,42 Z" fill="#60a5fa" opacity="0.3" />

    <circle cx="80" cy="60" r="10" fill="#f59e0b" className="animate-pulse" stroke="#d97706" strokeWidth="1.5" />
    <circle cx="80" cy="60" r="8" fill="#f59e0b" />

    <circle cx="120" cy="29" r="4.5" fill="#3b82f6" stroke="#2563eb" strokeWidth="1" />
    <path d="M124,28 L138,24" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M133,23 L138,24 L135,28" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

    <circle cx="120" cy="60" r="1.5" fill="#64748b" opacity="0.5" />
  </svg>
);

// 14. Stefan-Boltzmann Law SVG
const StefanBoltzmannSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    
    <circle cx="100" cy="60" r="40" stroke="#f87171" strokeWidth="1.5" opacity="0.25" className="animate-ping" style={{ animationDuration: '3s' }} />
    <circle cx="100" cy="60" r="30" stroke="#f97316" strokeWidth="1.5" opacity="0.4" className="animate-ping" style={{ animationDuration: '2s' }} />
    <circle cx="100" cy="60" r="20" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />

    <circle cx="100" cy="60" r="12" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
    <circle cx="100" cy="60" r="9" fill="url(#stefanGlow)" opacity="0.9" />

    <defs>
      <radialGradient id="stefanGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ef4444" />
      </radialGradient>
    </defs>

    <text x="100" y="98" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">P = σAT⁴</text>
  </svg>
);

export default function LabCard({
  lab,
  onViewDetails,
  onEnterRoom,
}: LabCardProps) {
  // Setup color styling depending on category
  const themeColors = {
    Physics: {
      border: "border-blue-100 hover:border-blue-300",
      accentBg: "bg-blue-50/50",
      accentText: "text-blue-600",
      glow: "soft-glow-physics",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-100",
      btnPrimary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/10",
      btnOutline: "border-blue-200 text-blue-600 hover:bg-blue-50/50",
      iconColor: "text-blue-500",
    },
    Chemistry: {
      border: "border-red-100 hover:border-red-300",
      accentBg: "bg-red-50/50",
      accentText: "text-red-600",
      glow: "soft-glow-chemistry",
      badgeColor: "bg-red-50 text-red-700 border-red-100",
      btnPrimary: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md shadow-red-500/10",
      btnOutline: "border-red-200 text-red-600 hover:bg-red-50/50",
      iconColor: "text-red-500",
    },
    Biology: {
      border: "border-green-100 hover:border-green-300",
      accentBg: "bg-green-50/50",
      accentText: "text-green-600",
      glow: "soft-glow-biology",
      badgeColor: "bg-green-50 text-green-700 border-green-100",
      btnPrimary: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md shadow-green-500/10",
      btnOutline: "border-green-200 text-green-600 hover:bg-green-50/50",
      iconColor: "text-green-500",
    },
  }[lab.category] || {
    border: "border-slate-100 hover:border-slate-300",
    accentBg: "bg-slate-50",
    accentText: "text-slate-600",
    glow: "shadow-lg",
    badgeColor: "bg-slate-50 text-slate-700 border-slate-100",
    btnPrimary: "bg-slate-800 hover:bg-slate-900 text-white",
    btnOutline: "border-slate-200 text-slate-600 hover:bg-slate-50",
    iconColor: "text-slate-500",
  };

  // Render proper SVG
  const renderIllustration = () => {
    switch (lab.id) {
      case "newtons-cooling":
        return <NewtonCooldownSVG />;
      case "ohms-law":
        return <OhmsLawSVG />;
      case "hookes-law":
        return <HookesLawSVG />;
      case "snells-law":
        return <SnellsLawSVG />;
      case "ideal-gas-law":
        return <IdealGasLawSVG />;
      case "newtons-second-law":
        return <NewtonsSecondLawSVG />;
      case "momentum-conservation":
        return <MomentumConservationSVG />;
      case "faradays-law":
        return <FaradaysLawSVG />;
      case "bernoullis-principle":
        return <BernoullisPrincipleSVG />;
      case "photoelectric-effect":
        return <PhotoelectricEffectSVG />;
      case "keplers-laws":
        return <KeplersLawsSVG />;
      case "stefan-boltzmann":
        return <StefanBoltzmannSVG />;
      case "acid-base-titration":
        return <TitrationSVG />;
      case "boyles-law":
        return <BoylesLawSVG />;
      case "charles-law":
        return <CharlessLawSVG />;
      case "le-chateliers-principle":
        return <LeChateliersPrincipleSVG />;
      case "beer-lambert-law":
        return <BeerLambertLawSVG />;
      case "hesss-law":
        return <HesssLawSVG />;
      case "galvanic-cell":
        return <GalvanicCellSVG />;
      case "chemical-kinetics":
        return <ChemicalKineticsSVG />;
      case "solubility-product":
        return <SolubilityProductSVG />;
      case "avogadros-law":
        return <AvogadrosLawSVG />;
      case "electrolysis-lab":
        return <ElectrolysisSVG />;
      case "colligative-properties":
        return <ColligativePropertiesSVG />;
      default:
        switch (lab.category) {
          case "Physics":
            return <NewtonCooldownSVG />;
          case "Chemistry":
            return <TitrationSVG />;
          case "Biology":
            return <PhotosynthesisSVG />;
          default:
            return (
              <div className="w-full h-32 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                No Image
              </div>
            );
        }
    }
  };

  return (
    <div
      className={`
        bg-white rounded-3xl border-2 ${themeColors.border} ${themeColors.glow} p-6.5
        transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl
        flex flex-col justify-between group h-full relative overflow-hidden
      `}
    >
      {/* Top Background Glow Effect */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-10 filter blur-xl ${lab.category === "Physics" ? "bg-blue-600" : lab.category === "Chemistry" ? "bg-red-600" : "bg-green-600"}`} />

      <div>
        {/* SVG Illustration Container */}
        <div className={`w-full py-4 rounded-2xl ${themeColors.accentBg} flex items-center justify-center mb-5 border border-slate-50`}>
          {renderIllustration()}
        </div>

        {/* Lab Header details */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {/* Department Tag */}
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${themeColors.badgeColor}`}>
            {lab.category}
          </span>

        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 line-clamp-1 mb-2 tracking-tight transition-colors">
          {lab.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed mb-6">
          {lab.description}
        </p>
      </div>

      {/* Card Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button
          onClick={() => onViewDetails?.(lab.id)}
          className={`
            flex items-center justify-center gap-1.5 py-2.5 px-3.5 border rounded-2xl text-xs font-bold
            transition-all duration-300 transform select-none cursor-pointer active:scale-95
            ${themeColors.btnOutline}
          `}
        >
          <Eye className="w-4 h-4" />
          <span>รายละเอียด</span>
        </button>

        <button
          onClick={() => onEnterRoom?.(lab.id)}
          className={`
            flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-2xl text-xs font-bold
            transition-all duration-300 transform select-none cursor-pointer active:scale-95
            ${themeColors.btnPrimary}
          `}
        >
          <span>เข้าห้อง</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
