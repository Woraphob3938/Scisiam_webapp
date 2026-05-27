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
    <circle cx="100" cy="60" r="45" fill="#d1fae5" opacity="0.4" />

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
      <rect x="6" y="25" width="4" height="40" fill="#34d399" opacity="0.7" />
      
      {/* Stopcock valve */}
      <circle cx="8" cy="72" r="3" fill="#ef4444" />
      
      {/* Drop falling */}
      <circle cx="8" cy="85" r="2" fill="#34d399" className="animate-bounce" />
    </g>

    {/* Laboratory Flask */}
    <g transform="translate(68, 52)">
      {/* Flask Body */}
      <path d="M26,8 L26,20 L12,42 A8,8 0 0,0 18,54 L44,54 A8,8 0 0,0 50,42 L36,20 L36,8 Z" fill="rgba(255, 255, 255, 0.9)" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" />
      {/* Liquid inside flask */}
      <path d="M16,40 L46,40 A8,8 0 0,1 50,42 L44,54 L18,54 A8,8 0 0,1 12,42 Z" fill="#10b981" opacity="0.75" />
      {/* Bubbles in flask */}
      <circle cx="25" cy="46" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="36" cy="48" r="2" fill="#ffffff" opacity="0.7" />
    </g>

    {/* Chemical Sparkles */}
    <circle cx="60" cy="40" r="2" fill="#10b981" className="animate-pulse" />
    <circle cx="148" cy="50" r="1.5" fill="#34d399" />
  </svg>
);

// 3. SVG Illustration for Biology (Photosynthesis Rate Chamber)
// Plant in glass dome under the sun
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
      border: "border-emerald-100 hover:border-emerald-300",
      accentBg: "bg-emerald-50/50",
      accentText: "text-emerald-600",
      glow: "soft-glow-chemistry",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
      btnPrimary: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/10",
      btnOutline: "border-emerald-200 text-emerald-600 hover:bg-emerald-50/50",
      iconColor: "text-emerald-500",
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
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-10 filter blur-xl ${lab.category === "Physics" ? "bg-blue-600" : lab.category === "Chemistry" ? "bg-emerald-600" : "bg-green-600"}`} />

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
