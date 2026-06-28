import React from "react";

// --- PHYSICS (6 Labs) ---

// 1. Push & Pull Forces
export const PushPullForcesSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <defs>
      <linearGradient id="pp-box-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="pp-force-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
    </defs>
    {/* Ground */}
    <line x1="20" y1="85" x2="180" y2="85" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

    {/* Sliding Crate */}
    <rect x="75" y="45" width="45" height="38" rx="4" fill="url(#pp-box-grad)" stroke="#1d4ed8" strokeWidth="2" />
    {/* Crate Cross/Lines */}
    <line x1="77" y1="47" x2="118" y2="81" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.6" />
    <line x1="118" y1="47" x2="77" y2="81" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.6" />
    <rect x="80" y="50" width="35" height="28" rx="2" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.5" />

    {/* Force Vectors */}
    {/* Push Vector */}
    <path d="M30,64 L65,64" stroke="url(#pp-force-grad)" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M65,64 L58,59 M65,64 L58,69" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <text x="45" y="52" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">PUSH</text>

    {/* Pull Vector */}
    <path d="M125,64 L165,64" stroke="url(#pp-force-grad)" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M165,64 L158,59 M165,64 L158,69" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <text x="145" y="52" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">PULL</text>
  </svg>
);

// 2. Light and Shadows
export const LightShadowsSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <defs>
      <linearGradient id="ls-beam-grad" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#fef08a" stopOpacity="0.1" />
      </linearGradient>
      <radialGradient id="ls-sphere-grad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="70%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </radialGradient>
    </defs>

    {/* Projection Ray lines */}
    <path d="M25,60 L140,25 L140,95 Z" fill="url(#ls-beam-grad)" />

    {/* Flashlight */}
    <g transform="translate(15, 50)">
      <rect x="0" y="6" width="12" height="8" fill="#475569" rx="1" />
      <path d="M12,4 L20,2 L20,18 L12,16 Z" fill="#64748b" />
      <circle cx="20" cy="10" r="8" fill="#fef08a" opacity="0.8" />
    </g>

    {/* Sphere blocking light */}
    <circle cx="85" cy="60" r="16" fill="url(#ls-sphere-grad)" stroke="#2563eb" strokeWidth="1" />

    {/* Dark Shadow on Screen */}
    <rect x="150" y="25" width="8" height="70" rx="3" fill="#cbd5e1" />
    <ellipse cx="150" cy="60" rx="4" ry="24" fill="#1e293b" opacity="0.85" />
  </svg>
);

// 3. Sound Vibrations
export const SoundVibrationsSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <defs>
      <linearGradient id="sv-fork-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    {/* Base Stand */}
    <rect x="40" y="90" width="30" height="6" rx="2" fill="#475569" />
    <rect x="52" y="70" width="6" height="20" fill="#64748b" />

    {/* Tuning Fork U-shape */}
    <path d="M40,25 L40,65 A15,15 0 0,0 70,65 L70,25" stroke="url(#sv-fork-grad)" strokeWidth="6" strokeLinecap="round" fill="none" />

    {/* Sine waves / vibration ripples */}
    <path d="M85,45 Q95,35 105,45 T125,45 T145,45 T165,45" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
    <path d="M85,60 Q95,50 105,60 T125,60 T145,60 T165,60" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
    <path d="M85,75 Q95,65 105,75 T125,75 T145,75 T165,75" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />

    {/* Concentric vibration arcs at fork tips */}
    <path d="M30,25 C26,20 26,30 30,25" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" className="animate-ping" />
    <path d="M80,25 C84,20 84,30 80,25" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" className="animate-ping" />
  </svg>
);

// 4. Simple Circuits
export const SimpleCircuitsSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <defs>
      <radialGradient id="sc-bulb-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
        <stop offset="50%" stopColor="#eab308" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Wire loop layout */}
    <path d="M45,85 L25,85 L25,35 L175,35 L175,85 L145,85" stroke="#475569" strokeWidth="2" strokeLinecap="round" />

    {/* Battery */}
    <g transform="translate(45, 75)">
      <rect x="0" y="0" width="36" height="20" rx="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
      <rect x="36" y="5" width="4" height="10" rx="1" fill="#ef4444" />
      <text x="18" y="13" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">1.5V</text>
    </g>

    {/* Knife Switch (Closed/Active) */}
    <g transform="translate(95, 80)">
      <circle cx="0" cy="5" r="3" fill="#475569" />
      <circle cx="30" cy="5" r="3" fill="#475569" />
      {/* Closed lever connecting the dots */}
      <line x1="0" y1="5" x2="30" y2="5" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
    </g>

    {/* Glowing Lightbulb */}
    <g transform="translate(138, 25)">
      {/* Glow Aura */}
      <circle cx="12" cy="10" r="20" fill="url(#sc-bulb-glow)" className="animate-pulse" />
      {/* Holder base */}
      <rect x="6" y="20" width="12" height="6" fill="#94a3b8" rx="1" />
      <rect x="8" y="26" width="8" height="3" fill="#475569" />
      {/* Glass */}
      <circle cx="12" cy="10" r="10" fill="rgba(254, 240, 138, 0.4)" stroke="#eab308" strokeWidth="1.5" />
      {/* Filament */}
      <path d="M9,15 L11,10 Q12,8 13,10 L15,15" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
    </g>
  </svg>
);

// 5. Floating and Sinking
export const FloatingSinkingSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <defs>
      <linearGradient id="fs-water-grad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.75" />
      </linearGradient>
    </defs>

    {/* Glass Container / Beaker */}
    <path d="M55,25 L55,95 A5,5 0 0,0 60,100 L140,100 A5,5 0 0,0 145,95 L145,25" stroke="#64748b" strokeWidth="2.5" fill="none" />

    {/* Water body */}
    <path d="M56,45 L144,45 L144,95 A4,4 0 0,1 140,99 L60,99 A4,4 0 0,1 56,95 Z" fill="url(#fs-water-grad)" />
    <path d="M56,45 Q77,42 100,45 Q123,48 144,45" stroke="#38bdf8" strokeWidth="2" fill="none" />

    {/* 1. Floating Block (Wood) */}
    <rect x="68" y="32" width="16" height="16" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1" />
    <text x="76" y="42" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">WOOD</text>

    {/* 2. Suspended Block (Plastic) */}
    <rect x="92" y="58" width="16" height="16" rx="2" fill="#059669" stroke="#047857" strokeWidth="1" />
    <text x="100" y="68" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">PLAS</text>

    {/* 3. Sunken Block (Steel/Iron) */}
    <rect x="116" y="82" width="16" height="16" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="1" />
    <text x="124" y="92" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">IRON</text>
  </svg>
);

// 6. Magnet Exploration
export const MagnetExplorationSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    {/* Magnetic field line loops */}
    <ellipse cx="100" cy="60" rx="65" ry="30" stroke="#60a5fa" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
    <ellipse cx="100" cy="60" rx="80" ry="48" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
    <path d="M50,60 C40,40 10,40 10,60 C10,80 40,80 50,60" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
    <path d="M150,60 C160,40 190,40 190,60 C190,80 160,80 150,60" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

    {/* Bar Magnet */}
    <g transform="translate(50, 48)">
      {/* North Pole (Red) */}
      <path d="M0,4 C0,1.8 1.8,0 4,0 L50,0 L50,24 L4,24 C1.8,24 0,22.2 0,20 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
      <text x="20" y="16" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">N</text>

      {/* South Pole (Blue) */}
      <path d="M50,0 L96,0 C98.2,0 100,1.8 100,4 L100,20 C100,22.2 98.2,24 96,24 L50,24 Z" fill="#3b82f6" stroke="#2563eb" strokeWidth="1" />
      <text x="75" y="16" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">S</text>
    </g>

    {/* Magnetic compass pointer or attracted steel filings */}
    <circle cx="165" cy="75" r="2" fill="#475569" className="animate-pulse" />
    <circle cx="172" cy="50" r="1.5" fill="#475569" />
    <circle cx="160" cy="45" r="2" fill="#475569" />
  </svg>
);


// --- CHEMISTRY (6 Labs) ---

// 7. States of Matter
export const StatesOfMatterSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />

    {/* Solid Container */}
    <g transform="translate(25, 30)">
      <rect x="0" y="0" width="40" height="50" rx="3" stroke="#cbd5e1" strokeWidth="1.5" fill="rgba(255,255,255,0.7)" />
      {/* Neat grid of solid molecules */}
      <circle cx="12" cy="30" r="3.5" fill="#a855f7" />
      <circle cx="20" cy="30" r="3.5" fill="#a855f7" />
      <circle cx="28" cy="30" r="3.5" fill="#a855f7" />
      <circle cx="12" cy="38" r="3.5" fill="#a855f7" />
      <circle cx="20" cy="38" r="3.5" fill="#a855f7" />
      <circle cx="28" cy="38" r="3.5" fill="#a855f7" />
      <circle cx="12" cy="46" r="3.5" fill="#a855f7" />
      <circle cx="20" cy="46" r="3.5" fill="#a855f7" />
      <circle cx="28" cy="46" r="3.5" fill="#a855f7" />
      <text x="20" y="-5" fill="#6b21a8" fontSize="8" fontWeight="bold" textAnchor="middle">SOLID</text>
    </g>

    {/* Liquid Container */}
    <g transform="translate(80, 30)">
      <rect x="0" y="0" width="40" height="50" rx="3" stroke="#cbd5e1" strokeWidth="1.5" fill="rgba(255,255,255,0.7)" />
      <path d="M1,35 L39,35 L39,49 L1,49 Z" fill="#e879f9" opacity="0.4" />
      {/* Loose liquids */}
      <circle cx="10" cy="42" r="3" fill="#c084fc" />
      <circle cx="18" cy="45" r="3" fill="#c084fc" />
      <circle cx="28" cy="40" r="3" fill="#c084fc" />
      <circle cx="33" cy="46" r="3" fill="#c084fc" />
      <circle cx="24" cy="46" r="3" fill="#c084fc" />
      <text x="20" y="-5" fill="#6b21a8" fontSize="8" fontWeight="bold" textAnchor="middle">LIQUID</text>
    </g>

    {/* Gas Container */}
    <g transform="translate(135, 30)">
      <rect x="0" y="0" width="40" height="50" rx="3" stroke="#cbd5e1" strokeWidth="1.5" fill="rgba(255,255,255,0.7)" />
      {/* Scattered gas molecules */}
      <circle cx="10" cy="12" r="2.5" fill="#a855f7" />
      <circle cx="30" cy="18" r="2.5" fill="#a855f7" />
      <circle cx="20" cy="30" r="2.5" fill="#a855f7" className="animate-pulse" />
      <circle cx="12" cy="42" r="2.5" fill="#a855f7" />
      <circle cx="32" cy="38" r="2.5" fill="#a855f7" className="animate-pulse" />
      <text x="20" y="-5" fill="#6b21a8" fontSize="8" fontWeight="bold" textAnchor="middle">GAS</text>
    </g>
  </svg>
);

// 8. Mixing and Separating
export const MixingSeparatingSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    <defs>
      <linearGradient id="ms-liquid-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
      </linearGradient>
    </defs>

    {/* Filter Funnel */}
    <path d="M60,15 L140,15 L110,48 L110,65 L90,65 L90,48 Z" fill="rgba(255,255,255,0.8)" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" />
    {/* Filter Paper inside funnel */}
    <path d="M68,22 L132,22 L100,45 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

    {/* Residue on filter (unseparated solids) */}
    <circle cx="95" cy="28" r="2.5" fill="#1e293b" />
    <circle cx="102" cy="26" r="2" fill="#1e293b" />
    <circle cx="105" cy="32" r="2.5" fill="#1e293b" />
    <circle cx="90" cy="33" r="1.5" fill="#1e293b" />

    {/* Dripping purified liquid */}
    <circle cx="100" cy="72" r="2.5" fill="#a855f7" className="animate-bounce" />

    {/* Receiving Beaker below */}
    <path d="M78,80 L80,110 A4,4 0 0,0 84,114 L116,114 A4,4 0 0,0 120,110 L122,80" stroke="#94a3b8" strokeWidth="2" fill="none" />
    {/* Purified Liquid in beaker */}
    <path d="M80,95 L120,95 L119,110 A3,3 0 0,1 116,113 L84,113 A3,3 0 0,1 81,110 Z" fill="url(#ms-liquid-grad)" />
  </svg>
);

// 9. Dissolving and Solutions
export const DissolvingSolutionsSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />

    {/* Beaker container */}
    <path d="M60,30 L60,95 A5,5 0 0,0 65,100 L135,100 A5,5 0 0,0 140,95 L140,30" stroke="#94a3b8" strokeWidth="2.5" fill="none" />
    {/* Water */}
    <path d="M61,50 L139,50 L139,95 A4,4 0 0,1 135,99 L65,99 A4,4 0 0,1 61,95 Z" fill="#dbeafe" opacity="0.5" />
    <path d="M61,50 Q100,47 139,50" stroke="#60a5fa" strokeWidth="1.5" fill="none" />

    {/* Spoon pouring solute */}
    <path d="M25,20 L75,35 L85,30 M75,35 A5,5 0 0,1 70,40 L60,35" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Solute falling & dispersing */}
    <g className="animate-pulse">
      {/* Undissolved falling cluster */}
      <circle cx="78" cy="46" r="2" fill="#eab308" />
      <circle cx="83" cy="49" r="1.5" fill="#eab308" />
      <circle cx="75" cy="52" r="2.5" fill="#eab308" />

      {/* Dissolved particles dispersing (color change representation) */}
      <circle cx="85" cy="68" r="2" fill="#c084fc" />
      <circle cx="105" cy="62" r="2.5" fill="#c084fc" />
      <circle cx="120" cy="74" r="2" fill="#c084fc" />
      <circle cx="70" cy="78" r="3" fill="#c084fc" />
      <circle cx="95" cy="85" r="2" fill="#c084fc" />
      <circle cx="110" cy="90" r="1.5" fill="#c084fc" />
    </g>
  </svg>
);

// 10. Acids and Bases Around Us
export const AcidsBasesSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />

    {/* Test Tube Stand */}
    <rect x="40" y="85" width="120" height="5" fill="#94a3b8" rx="1.5" />
    <rect x="40" y="45" width="120" height="4" fill="#cbd5e1" rx="1" />
    <line x1="45" y1="45" x2="45" y2="85" stroke="#94a3b8" strokeWidth="2" />
    <line x1="155" y1="45" x2="155" y2="85" stroke="#94a3b8" strokeWidth="2" />

    {/* Tube 1: Acidic (Red, pH 2) */}
    <g transform="translate(55, 20)">
      <rect x="0" y="0" width="12" height="60" rx="6" fill="rgba(255,255,255,0.8)" stroke="#64748b" strokeWidth="1.5" />
      <path d="M1,35 L11,35 L11,54 A5,5 0 0,1 1,54 Z" fill="#ef4444" opacity="0.75" />
      <text x="6" y="-3" fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="middle">pH 2</text>
    </g>

    {/* Tube 2: Neutral (Green, pH 7) */}
    <g transform="translate(94, 20)">
      <rect x="0" y="0" width="12" height="60" rx="6" fill="rgba(255,255,255,0.8)" stroke="#64748b" strokeWidth="1.5" />
      <path d="M1,35 L11,35 L11,54 A5,5 0 0,1 1,54 Z" fill="#22c55e" opacity="0.75" />
      <text x="6" y="-3" fill="#22c55e" fontSize="7" fontWeight="bold" textAnchor="middle">pH 7</text>
    </g>

    {/* Tube 3: Alkaline/Base (Blue, pH 12) */}
    <g transform="translate(133, 20)">
      <rect x="0" y="0" width="12" height="60" rx="6" fill="rgba(255,255,255,0.8)" stroke="#64748b" strokeWidth="1.5" />
      <path d="M1,35 L11,35 L11,54 A5,5 0 0,1 1,54 Z" fill="#3b82f6" opacity="0.75" />
      <text x="6" y="-3" fill="#3b82f6" fontSize="7" fontWeight="bold" textAnchor="middle">pH 12</text>
    </g>

    {/* Dropper */}
    <g transform="translate(18, 15) rotate(20)">
      <rect x="0" y="0" width="4" height="25" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
      <ellipse cx="2" cy="-4" rx="4" ry="5" fill="#ef4444" />
      <path d="M2,25 C2,25 0,29 0,31 C0,32 1,33 2,33 C3,33 4,32 4,31 C4,29 2,25 2,25 Z" fill="#ef4444" opacity="0.8" />
    </g>
  </svg>
);

// 11. Heating and Cooling Materials
export const HeatingCoolingSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    <defs>
      <linearGradient id="hc-flame-grad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="50%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
      </linearGradient>
    </defs>

    {/* Tripod Stand */}
    <path d="M60,78 L140,78 M70,78 L55,108 M130,78 L145,108 M100,78 L100,105" stroke="#475569" strokeWidth="2.5" />

    {/* Bunsen Burner (Heating source) */}
    <g transform="translate(88, 80)">
      <rect x="9" y="10" width="6" height="18" fill="#64748b" />
      <rect x="0" y="24" width="24" height="4" fill="#334155" rx="1" />

      {/* Flame */}
      <path d="M12,10 Q6,0 12,-15 Q18,0 12,10 Z" fill="url(#hc-flame-grad)" className="animate-bounce" />
    </g>

    {/* Beaker with water on stand */}
    <g transform="translate(75, 38)">
      <path d="M5,0 L5,36 A4,4 0 0,0 9,40 L41,40 A4,4 0 0,0 45,36 L45,0" stroke="#94a3b8" strokeWidth="2" fill="none" />
      {/* Liquid bubbling */}
      <rect x="6" y="18" width="38" height="21" fill="#c084fc" opacity="0.4" />
      <circle cx="15" cy="25" r="1.5" fill="#ffffff" opacity="0.8" className="animate-bounce" />
      <circle cx="35" cy="22" r="2" fill="#ffffff" opacity="0.7" />
      <circle cx="25" cy="28" r="1.5" fill="#ffffff" opacity="0.8" className="animate-bounce" />
    </g>
  </svg>
);

// 12. Physical vs Chemical Changes
export const PhysicalChemicalSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    {/* Split Screen border */}
    <line x1="100" y1="20" x2="100" y2="100" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />

    {/* Physical Change (Left - Ice melting to water) */}
    <g transform="translate(20, 35)">
      {/* Melting Ice Cube */}
      <rect x="20" y="10" width="20" height="20" rx="3" fill="#93c5fd" opacity="0.8" stroke="#60a5fa" strokeWidth="1" />
      {/* Puddle */}
      <path d="M10,34 Q30,40 50,34 Q58,30 45,28 Q25,26 15,29 Z" fill="#bfdbfe" />
      <text x="30" y="55" fill="#3b82f6" fontSize="7.5" fontWeight="bold" textAnchor="middle">PHYSICAL</text>
    </g>

    {/* Chemical Change (Right - Test tube color change & gas release) */}
    <g transform="translate(120, 25)">
      {/* Test Tube */}
      <rect x="15" y="5" width="14" height="50" rx="7" fill="rgba(255,255,255,0.8)" stroke="#64748b" strokeWidth="2" />
      {/* Reacting dynamic liquid */}
      <path d="M16,30 L28,30 L28,48 A6,6 0 0,1 16,48 Z" fill="#ef4444" opacity="0.8" />
      {/* Gas Bubbles escaping */}
      <circle cx="20" cy="18" r="2" fill="#ef4444" className="animate-bounce" />
      <circle cx="25" cy="12" r="1.5" fill="#f97316" />
      <circle cx="18" cy="8" r="1" fill="#f59e0b" className="animate-bounce" />
      <text x="22" y="65" fill="#b91c1c" fontSize="7.5" fontWeight="bold" textAnchor="middle">CHEMICAL</text>
    </g>
  </svg>
);


// --- MATHEMATICS (30 Labs) ---

// 13. Probability & Random Trials
export const ProbabilitySVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <defs>
      <linearGradient id="pr-dice-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    {/* Dice 1 (3D perspective isometric) */}
    <g transform="translate(42, 38)">
      {/* Front-left */}
      <path d="M20,15 L5,22 L5,42 L20,35 Z" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="1" />
      {/* Front-right */}
      <path d="M20,15 L35,22 L35,42 L20,35 Z" fill="url(#pr-dice-grad)" stroke="#6d28d9" strokeWidth="1" />
      {/* Top */}
      <path d="M20,15 L5,22 L20,29 L35,22 Z" fill="#ddd6fe" stroke="#6d28d9" strokeWidth="1" />
      {/* Dots on Top (representing 1) */}
      <circle cx="20" cy="22" r="2" fill="#475569" />
      {/* Dots on Right (representing 3) */}
      <circle cx="24" cy="27" r="1.5" fill="#ffffff" />
      <circle cx="27" cy="31" r="1.5" fill="#ffffff" />
      <circle cx="30" cy="35" r="1.5" fill="#ffffff" />
    </g>

    {/* Coin flipping path */}
    <path d="M125,75 C125,45 155,45 155,25" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

    {/* Coin */}
    <g transform="translate(138, 20)">
      <circle cx="10" cy="10" r="10" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="7" fill="none" stroke="#fef08a" strokeWidth="1" />
      <text x="10" y="13" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">H</text>
    </g>

    {/* Formula panel */}
    <rect x="90" y="76" width="55" height="18" rx="5" fill="#ffffff" stroke="#ddd6fe" strokeWidth="1.5" />
    <text x="117.5" y="88" fill="#7c3aed" fontSize="7.5" fontWeight="black" textAnchor="middle">P(A) = n(A)/n(S)</text>
  </svg>
);

// 14. Trigonometry & Waves
export const TrigoWavesSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    {/* Unit Circle (Left) */}
    <g transform="translate(45, 60)">
      <circle cx="0" cy="0" r="25" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="-30" y1="0" x2="30" y2="0" stroke="#94a3b8" strokeWidth="1" />
      <line x1="0" y1="-30" x2="0" y2="30" stroke="#94a3b8" strokeWidth="1" />

      {/* Radius line and angle */}
      <line x1="0" y1="0" x2="17" y2="-17" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="17" cy="-17" r="3.5" fill="#ef4444" />
      {/* Sine projector */}
      <line x1="17" y1="-17" x2="17" y2="0" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
    </g>

    {/* Connecting arrow */}
    <path d="M80,60 L92,60" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
    <path d="M92,60 L87,56 M92,60 L87,64" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />

    {/* Sine wave (Right) */}
    <g transform="translate(100, 60)">
      <line x1="0" y1="0" x2="80" y2="0" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Sine Wave Curve */}
      <path d="M0,0 Q10,-25 20,0 T40,0 T60,0 T80,0" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="20" cy="-22" r="3" fill="#ef4444" />
      <text x="70" y="-12" fill="#7c3aed" fontSize="9" fontWeight="black">sin(θ)</text>
    </g>
  </svg>
);

// 15. Systems of Equations
export const SystemsEquationsSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />

    {/* Grid Backdrop */}
    <line x1="60" y1="20" x2="60" y2="100" stroke="#e2e8f0" strokeWidth="1" />
    <line x1="84" y1="20" x2="84" y2="100" stroke="#e2e8f0" strokeWidth="1" />
    <line x1="108" y1="20" x2="108" y2="100" stroke="#ede9fe" strokeWidth="2" /> {/* Axis Y */}
    <line x1="132" y1="20" x2="132" y2="100" stroke="#e2e8f0" strokeWidth="1" />
    <line x1="156" y1="20" x2="156" y2="100" stroke="#e2e8f0" strokeWidth="1" />

    <line x1="36" y1="40" x2="164" y2="40" stroke="#e2e8f0" strokeWidth="1" />
    <line x1="36" y1="60" x2="164" y2="60" stroke="#ede9fe" strokeWidth="2" /> {/* Axis X */}
    <line x1="36" y1="80" x2="164" y2="80" stroke="#e2e8f0" strokeWidth="1" />

    {/* Line 1 (y = -x + 4) */}
    <line x1="45" y1="30" x2="145" y2="90" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />

    {/* Line 2 (y = x - 2) */}
    <line x1="45" y1="85" x2="145" y2="35" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />

    {/* Intersection Point */}
    {/* Calculated intersection of the sample lines */}
    <circle cx="108" cy="53" r="5" fill="#7c3aed" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />

    {/* Label tag */}
    <rect x="115" y="42" width="42" height="15" rx="5" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1" />
    <text x="136" y="52" fill="#7c3aed" fontSize="7" fontWeight="bold" textAnchor="middle">(x*, y*)</text>
  </svg>
);

// 16. Geometry Measurement Lab
export const GeometryMeasurementSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    {/* Triangular ruler */}
    <path d="M40,85 L140,85 L40,25 Z" fill="rgba(255,255,255,0.7)" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
    <path d="M52,77 L110,77 L52,42 Z" fill="none" stroke="#ddd6fe" strokeWidth="1.5" />

    {/* Measurement ticks on ruler bottom */}
    <line x1="45" y1="85" x2="45" y2="80" stroke="#7c3aed" strokeWidth="1" />
    <line x1="60" y1="85" x2="60" y2="81" stroke="#7c3aed" strokeWidth="1" />
    <line x1="75" y1="85" x2="75" y2="80" stroke="#7c3aed" strokeWidth="1" />
    <line x1="90" y1="85" x2="90" y2="81" stroke="#7c3aed" strokeWidth="1" />
    <line x1="105" y1="85" x2="105" y2="80" stroke="#7c3aed" strokeWidth="1" />
    <line x1="120" y1="85" x2="120" y2="81" stroke="#7c3aed" strokeWidth="1" />
    <line x1="135" y1="85" x2="135" y2="80" stroke="#7c3aed" strokeWidth="1" />

    {/* Cylindrical shape being measured */}
    <g transform="translate(125, 30)">
      <ellipse cx="20" cy="10" rx="15" ry="5" fill="#c084fc" stroke="#a855f7" strokeWidth="1" />
      <path d="M5,10 L5,45 A15,5 0 0,0 35,45 L35,10 Z" fill="#c084fc" opacity="0.5" stroke="#a855f7" strokeWidth="1" />
      <ellipse cx="20" cy="45" rx="15" ry="5" fill="#a855f7" />

      {/* Dimension Line */}
      <line x1="5" y1="25" x2="35" y2="25" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
      <text x="20" y="21" fill="#1e293b" fontSize="7.5" fontWeight="black" textAnchor="middle">h</text>
    </g>
  </svg>
);

// 17. Exponential Growth & Decay
export const ExponentialGrowthDecaySVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />
    {/* Axes */}
    <path d="M48,30 V90 H150" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

    {/* Exponential Growth Curve (y = e^x) */}
    <path d="M48,85 Q80,82 105,70 T145,35" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" />
    <text x="142" y="27" fill="#047857" fontSize="8" fontWeight="bold">Growth</text>

    {/* Exponential Decay Curve (y = e^-x) */}
    <path d="M48,35 Q65,65 95,80 T148,88" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" fill="none" />
    <text x="98" y="66" fill="#b91c1c" fontSize="8" fontWeight="bold">Decay</text>
  </svg>
);

// 18. Sampling & Measurement Error
export const DataSamplingErrorSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    {/* Bullseye target (representing precision vs accuracy) */}
    <g transform="translate(60, 60)">
      <circle cx="0" cy="0" r="35" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="23" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="10" stroke="#fecdd3" strokeWidth="1" fill="#ffe4e6" />
      <circle cx="0" cy="0" r="2" fill="#be123c" />

      {/* Target hits: scattered with systematic error */}
      <circle cx="-15" cy="-12" r="2" fill="#7c3aed" />
      <circle cx="-13" cy="-16" r="2" fill="#7c3aed" />
      <circle cx="-18" cy="-15" r="2" fill="#7c3aed" />
      <circle cx="-14" cy="-9" r="2" fill="#7c3aed" />
      <circle cx="-10" cy="-12" r="2" fill="#7c3aed" />
    </g>

    {/* Bar Chart with Error Bars (Right) */}
    <g transform="translate(115, 30)">
      {/* Axes */}
      <path d="M0,0 V55 H55" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Bar 1 */}
      <rect x="8" y="20" width="12" height="35" fill="#c084fc" rx="1" />
      {/* Error Bar 1 */}
      <line x1="14" y1="12" x2="14" y2="28" stroke="#475569" strokeWidth="1.5" />
      <line x1="10" y1="12" x2="18" y2="12" stroke="#475569" strokeWidth="1.5" />
      <line x1="10" y1="28" x2="18" y2="28" stroke="#475569" strokeWidth="1.5" />

      {/* Bar 2 */}
      <rect x="28" y="32" width="12" height="23" fill="#a78bfa" rx="1" />
      {/* Error Bar 2 */}
      <line x1="34" y1="22" x2="34" y2="42" stroke="#475569" strokeWidth="1.5" />
      <line x1="30" y1="22" x2="38" y2="22" stroke="#475569" strokeWidth="1.5" />
      <line x1="30" y1="42" x2="38" y2="42" stroke="#475569" strokeWidth="1.5" />
    </g>
  </svg>
);

// 19. Quadratic Functions & Projectiles
export const QuadraticProjectilesSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />
    {/* Ground */}
    <line x1="42" y1="88" x2="158" y2="88" stroke="#e2e8f0" strokeWidth="2" />

    {/* Projectile launcher (Cannon) */}
    <g transform="translate(42, 76)">
      <circle cx="6" cy="12" r="6" fill="#475569" />
      <rect x="2" y="2" width="16" height="6" rx="1" fill="#334155" transform="rotate(-30 6 12)" />
    </g>

    {/* Parabolic Trajectory (y = -x^2) */}
    <path d="M50,80 Q95,20 140,88" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" fill="none" />

    {/* Peak Vertex */}
    <circle cx="95" cy="50" r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
    <text x="95" y="42" fill="#b91c1c" fontSize="7" fontWeight="bold" textAnchor="middle">Vertex</text>

    {/* Landing circle */}
    <circle cx="140" cy="88" r="3" fill="#10b981" />
  </svg>
);

// 20. Logarithms & Scientific Scales
export const LogarithmScalesSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    {/* Slider scale background */}
    <rect x="25" y="42" width="150" height="36" rx="8" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />

    {/* Logarithmic scale markings (decreasing gap widths) */}
    <line x1="35" y1="42" x2="35" y2="65" stroke="#7c3aed" strokeWidth="2" />
    <text x="35" y="72" fill="#7c3aed" fontSize="7.5" fontWeight="black" textAnchor="middle">10⁰</text>

    <line x1="75" y1="42" x2="75" y2="65" stroke="#7c3aed" strokeWidth="1.8" />
    <text x="75" y="72" fill="#7c3aed" fontSize="7.5" fontWeight="black" textAnchor="middle">10¹</text>

    <line x1="105" y1="42" x2="105" y2="65" stroke="#7c3aed" strokeWidth="1.5" />
    <text x="105" y="72" fill="#7c3aed" fontSize="7.5" fontWeight="black" textAnchor="middle">10²</text>

    <line x1="128" y1="42" x2="128" y2="60" stroke="#7c3aed" strokeWidth="1.2" />
    <text x="128" y="72" fill="#7c3aed" fontSize="7.5" fontWeight="black" textAnchor="middle">10³</text>

    <line x1="145" y1="42" x2="145" y2="60" stroke="#7c3aed" strokeWidth="1" />
    <line x1="158" y1="42" x2="158" y2="60" stroke="#7c3aed" strokeWidth="1" />
    <line x1="168" y1="42" x2="168" y2="60" stroke="#7c3aed" strokeWidth="1" />

    {/* Label tag */}
    <rect x="75" y="16" width="50" height="15" rx="5" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1" />
    <text x="100" y="26" fill="#7c3aed" fontSize="7.5" fontWeight="black" textAnchor="middle">log₁₀(x)</text>
  </svg>
);

// 21. Unit Conversion & Dimensional Analysis
export const UnitConversionSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    {/* Balancing Scales */}
    <path d="M100,85 L100,45 M80,45 L120,45" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    {/* Triangle Base */}
    <path d="M85,95 L115,95 L100,85 Z" fill="#64748b" />

    {/* Left Pan (with weight '1 kg') */}
    <line x1="80" y1="45" x2="60" y2="70" stroke="#475569" strokeWidth="1.5" />
    <line x1="80" y1="45" x2="100" y2="70" stroke="#475569" strokeWidth="1.5" />
    <ellipse cx="80" cy="70" rx="20" ry="3" fill="#94a3b8" />
    <rect x="70" y="55" width="20" height="13" rx="2" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1" />
    <text x="80" y="64" fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">1 kg</text>

    {/* Right Pan (with weight '1000 g') */}
    <line x1="120" y1="45" x2="100" y2="70" stroke="#475569" strokeWidth="1.5" />
    <line x1="120" y1="45" x2="140" y2="70" stroke="#475569" strokeWidth="1.5" />
    <ellipse cx="120" cy="70" rx="20" ry="3" fill="#94a3b8" />
    <rect x="108" y="57" width="24" height="11" rx="2" fill="#10b981" stroke="#059669" strokeWidth="1" />
    <text x="120" y="65" fill="#ffffff" fontSize="5.5" fontWeight="bold" textAnchor="middle">1000 g</text>

    {/* Math Equals sign */}
    <text x="100" y="72" fill="#475569" fontSize="13" fontWeight="bold" textAnchor="middle">=</text>
  </svg>
);

// 22. Matrix Transformations
export const MatrixTransformationsSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    {/* Coordinate grid */}
    <g transform="translate(50, 60)">
      <line x1="-35" y1="0" x2="35" y2="0" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="0" y1="-35" x2="0" y2="35" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Original shape (Square) */}
      <rect x="0" y="-20" width="20" height="20" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" fill="none" />

      {/* Transformed shape (Sheared/Rotated) */}
      <polygon points="0,0 22,-8 30,-28 8,-20" fill="rgba(124, 58, 237, 0.35)" stroke="#7c3aed" strokeWidth="2" />
    </g>

    {/* Vector transformation symbol / matrix bracket */}
    <g transform="translate(115, 38)">
      <text x="0" y="24" fill="#475569" fontSize="18" fontWeight="light">[</text>
      <text x="10" y="16" fill="#7c3aed" fontSize="9.5" fontWeight="bold">cos θ</text>
      <text x="35" y="16" fill="#7c3aed" fontSize="9.5" fontWeight="bold">-sin θ</text>
      <text x="10" y="30" fill="#7c3aed" fontSize="9.5" fontWeight="bold">sin θ</text>
      <text x="35" y="30" fill="#7c3aed" fontSize="9.5" fontWeight="bold">cos θ</text>
      <text x="65" y="24" fill="#475569" fontSize="18" fontWeight="light">]</text>
    </g>
  </svg>
);

// 23. Sequences & Series Lab
export const SequencesSeriesSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />

    {/* Progression of Towers (Arithmetic/Geometric) */}
    {/* Tower 1 (height 1) */}
    <g transform="translate(30, 80)">
      <rect x="0" y="0" width="15" height="15" rx="2" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1" />
      <text x="7.5" y="25" fill="#7c3aed" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>
    </g>

    {/* Tower 2 (height 2) */}
    <g transform="translate(55, 65)">
      <rect x="0" y="15" width="15" height="15" rx="2" fill="#a78bfa" stroke="#6d28d9" strokeWidth="1" />
      <rect x="0" y="0" width="15" height="15" rx="2" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1" />
      <text x="7.5" y="40" fill="#7c3aed" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
    </g>

    {/* Tower 3 (height 4 - geometric example) */}
    <g transform="translate(80, 35)">
      <rect x="0" y="45" width="15" height="15" rx="2" fill="#ddd6fe" stroke="#6d28d9" strokeWidth="1" />
      <rect x="0" y="30" width="15" height="15" rx="2" fill="#a78bfa" stroke="#6d28d9" strokeWidth="1" />
      <rect x="0" y="15" width="15" height="15" rx="2" fill="#a78bfa" stroke="#6d28d9" strokeWidth="1" />
      <rect x="0" y="0" width="15" height="15" rx="2" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1" />
      <text x="7.5" y="70" fill="#7c3aed" fontSize="9" fontWeight="bold" textAnchor="middle">4</text>
    </g>

    {/* Sigma Summation sign representing Series */}
    <g transform="translate(125, 30)">
      <path d="M5,10 L30,10 L18,22 L30,34 L5,34 L5,31 L20,31 L12,22 L20,13 L5,13 Z" fill="#6d28d9" />
      <text x="18" y="8" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle">∞</text>
      <text x="18" y="44" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle">n=1</text>
      <text x="42" y="27" fill="#7c3aed" fontSize="13" fontWeight="black">a·rⁿ</text>
    </g>
  </svg>
);

// 24. Inequalities & Feasible Regions
export const InequalitiesFeasibleSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />
    {/* Grid / Axes */}
    <line x1="50" y1="90" x2="150" y2="90" stroke="#cbd5e1" strokeWidth="2" />
    <line x1="55" y1="25" x2="55" y2="95" stroke="#cbd5e1" strokeWidth="2" />

    {/* Feasible Region shaded polygon */}
    <polygon points="55,90 55,45 95,55 125,90" fill="rgba(167, 139, 250, 0.45)" stroke="#7c3aed" strokeWidth="1.5" />

    {/* Boundary Line 1 */}
    <line x1="45" y1="40" x2="115" y2="60" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />

    {/* Boundary Line 2 */}
    <line x1="75" y1="35" x2="135" y2="95" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />

    <text x="82" y="75" fill="#6d28d9" fontSize="8" fontWeight="black" textAnchor="middle">FEASIBLE</text>
  </svg>
);

// 25. Transformations & Symmetry
export const TransformationsSymmetrySVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    {/* Symmetry line */}
    <line x1="100" y1="15" x2="100" y2="105" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />

    {/* Left side shape (original) */}
    <path d="M55,35 L90,45 L85,85 L55,75 Z" fill="rgba(124, 58, 237, 0.4)" stroke="#7c3aed" strokeWidth="2" />

    {/* Right side shape (reflected symmetry) */}
    <path d="M145,35 L110,45 L115,85 L145,75 Z" fill="rgba(16, 185, 129, 0.4)" stroke="#10b981" strokeWidth="2" />

    {/* Connection arrows indicating transformation */}
    <path d="M75,55 Q100,48 125,55" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
    <path d="M125,55 L119,51 M125,55 L119,59" stroke="#7c3aed" strokeWidth="1.5" />
  </svg>
);

// 26. Angles & Circles Lab
export const AnglesCirclesSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    {/* Circle outline */}
    <circle cx="100" cy="60" r="35" stroke="#7c3aed" strokeWidth="2.5" />
    <circle cx="100" cy="60" r="2.5" fill="#6d28d9" />

    {/* Radius lines defining a sector */}
    <line x1="100" y1="60" x2="135" y2="60" stroke="#7c3aed" strokeWidth="2" />
    <line x1="100" y1="60" x2="124" y2="35" stroke="#7c3aed" strokeWidth="2" />

    {/* Shaded sector (arc/pie slice) */}
    <path d="M100,60 L135,60 A35,35 0 0,0 124,35 Z" fill="#a78bfa" opacity="0.5" />

    {/* Angle theta symbol */}
    <path d="M112,60 A12,12 0 0,0 108,51" stroke="#ef4444" strokeWidth="1.5" fill="none" />
    <text x="115" y="55" fill="#ef4444" fontSize="8" fontWeight="bold">θ</text>

    {/* Radius annotation */}
    <text x="116" y="70" fill="#7c3aed" fontSize="7" fontWeight="bold">r</text>
  </svg>
);

// 27. Combinatorics & Counting
export const CombinatoricsCountingSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    {/* Counting Tree diagram */}
    <g transform="translate(18, 30)">
      {/* Root Node */}
      <circle cx="15" cy="30" r="4.5" fill="#7c3aed" />

      {/* Branch Level 1 */}
      <line x1="15" y1="30" x2="45" y2="15" stroke="#a78bfa" strokeWidth="2" />
      <line x1="15" y1="30" x2="45" y2="45" stroke="#a78bfa" strokeWidth="2" />
      <circle cx="45" cy="15" r="4" fill="#a78bfa" />
      <circle cx="45" cy="45" r="4" fill="#a78bfa" />

      {/* Branch Level 2 */}
      <line x1="45" y1="15" x2="75" y2="7" stroke="#ddd6fe" strokeWidth="1.5" />
      <line x1="45" y1="15" x2="75" y2="23" stroke="#ddd6fe" strokeWidth="1.5" />
      <line x1="45" y1="45" x2="75" y2="37" stroke="#ddd6fe" strokeWidth="1.5" />
      <line x1="45" y1="45" x2="75" y2="53" stroke="#ddd6fe" strokeWidth="1.5" />

      <circle cx="75" cy="7" r="3" fill="#ddd6fe" />
      <circle cx="75" cy="23" r="3" fill="#ddd6fe" />
      <circle cx="75" cy="37" r="3" fill="#ddd6fe" />
      <circle cx="75" cy="53" r="3" fill="#ddd6fe" />
    </g>

    {/* Formula panel box */}
    <g transform="translate(108, 32)">
      <rect x="0" y="0" width="65" height="52" rx="10" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />
      <text x="32" y="17" fill="#6d28d9" fontSize="9.5" fontWeight="black" textAnchor="middle">nCr</text>
      <line x1="10" y1="24" x2="55" y2="24" stroke="#e2e8f0" strokeWidth="1.5" />
      <text x="32" y="35" fill="#7c3aed" fontSize="8" fontWeight="bold" textAnchor="middle">n!</text>
      <line x1="15" y1="39" x2="50" y2="39" stroke="#7c3aed" strokeWidth="1" />
      <text x="32" y="48" fill="#7c3aed" fontSize="7.5" fontWeight="bold" textAnchor="middle">r!(n-r)!</text>
    </g>
  </svg>
);

// 28. Normal Distribution Lab
export const NormalDistributionSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />

    {/* Base line */}
    <line x1="44" y1="85" x2="156" y2="85" stroke="#cbd5e1" strokeWidth="2" />

    {/* Shaded standard dev areas (e.g. Center 68%) */}
    <path d="M80,85 L80,62 C88,52 92,40 100,40 C108,40 112,52 120,62 L120,85 Z" fill="rgba(167, 139, 250, 0.4)" />

    {/* Gaussian Bell Curve path */}
    <path d="M48,85 Q75,85 85,60 T100,38 T115,60 T152,85" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" fill="none" />

    {/* Mean μ axis line */}
    <line x1="100" y1="38" x2="100" y2="85" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
    <text x="100" y="94" fill="#ef4444" fontSize="8.5" fontWeight="bold" textAnchor="middle">μ</text>
  </svg>
);

// 29. Rates of Change Lab
export const RatesOfChangeSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />
    {/* Axis lines */}
    <path d="M48,30 V90 H150" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />

    {/* Function Curve y = f(x) */}
    <path d="M48,85 Q90,80 110,55 T150,25" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />

    {/* Tangent line at critical point */}
    <line x1="80" y1="82" x2="140" y2="28" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />

    {/* Point of tangency */}
    <circle cx="110" cy="55" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />

    {/* Slope rate triangle labels */}
    <path d="M110,55 H130 V37 Z" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="2 2" />
    <text x="135" y="49" fill="#ea580c" fontSize="7" fontWeight="bold">dy</text>
    <text x="120" y="63" fill="#ea580c" fontSize="7" fontWeight="bold">dx</text>
  </svg>
);

// 30. Optimization & Constraints
export const OptimizationConstraintsSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    {/* 3D-like topological contour lines of profit/cost function */}
    <ellipse cx="100" cy="65" rx="55" ry="32" stroke="#ddd6fe" strokeWidth="1.5" />
    <ellipse cx="105" cy="60" rx="38" ry="22" stroke="#c4b5fd" strokeWidth="1.5" />
    <ellipse cx="110" cy="55" rx="22" ry="12" stroke="#a78bfa" strokeWidth="1.5" />

    {/* Constraint boundary line cutting the loops */}
    <line x1="50" y1="80" x2="160" y2="35" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
    <text x="155" y="30" fill="#ef4444" fontSize="6.5" fontWeight="bold">Constraint</text>

    {/* Optimal solution point (tangency of constraint to highest possible contour) */}
    <circle cx="114" cy="54" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />
    <text x="114" y="44" fill="#047857" fontSize="7.5" fontWeight="black" textAnchor="middle">MAX</text>
  </svg>
);

// 31. Advanced Calculus & Optimization
export const AdvancedCalculusSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />
    {/* Axis lines */}
    <path d="M48,30 V90 H150" stroke="#cbd5e1" strokeWidth="1.5" />

    {/* Shaded Area under Curve (Integral) */}
    <path d="M68,90 L68,68 Q90,45 110,65 L110,90 Z" fill="rgba(124, 58, 237, 0.4)" />

    {/* Integration bounds lines */}
    <line x1="68" y1="90" x2="68" y2="68" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="110" y1="90" x2="110" y2="65" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 2" />
    <text x="68" y="97" fill="#6d28d9" fontSize="7" fontWeight="bold" textAnchor="middle">a</text>
    <text x="110" y="97" fill="#6d28d9" fontSize="7" fontWeight="bold" textAnchor="middle">b</text>

    {/* Curve f(x) */}
    <path d="M48,80 Q68,65 90,60 T135,55" stroke="#7c3aed" strokeWidth="3" fill="none" strokeLinecap="round" />

    {/* Integral Sign */}
    <g transform="translate(138, 25)">
      <path d="M10,0 C12,0 14,3 12,8 L8,24 C6,29 8,32 10,32" stroke="#6d28d9" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <text x="16" y="22" fill="#7c3aed" fontSize="10" fontWeight="black">∫</text>
    </g>
  </svg>
);

// 32. Linear Algebra & Eigenvectors
export const LinearAlgebraSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />
    {/* Grid / Axes */}
    <line x1="100" y1="20" x2="100" y2="100" stroke="#e2e8f0" strokeWidth="1.5" />
    <line x1="36" y1="60" x2="164" y2="60" stroke="#e2e8f0" strokeWidth="1.5" />

    {/* Original Vector (v) */}
    <path d="M100,60 L125,40" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M125,40 L118,40 M125,40 L122,47" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <text x="112" y="46" fill="#2563eb" fontSize="8.5" fontWeight="bold">v</text>

    {/* Scaled Eigenvector (λv - stays on same span line) */}
    <line x1="50" y1="100" x2="150" y2="20" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />

    <path d="M100,60 L140,28" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M140,28 L133,28 M140,28 L137,35" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <text x="135" y="24" fill="#b91c1c" fontSize="8.5" fontWeight="bold">λv</text>

    <text x="50" y="32" fill="#475569" fontSize="8.5" fontWeight="black">A·v = λ·v</text>
  </svg>
);

// 33. Differential Equations Lab
export const DifferentialEquationsSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />

    {/* Slope Field (Grid of tiny tick marks) */}
    {[45, 65, 85, 105, 125, 145].map((x) =>
      [30, 45, 60, 75, 90].map((y) => {
        // Calculate a slope pattern (e.g. circular field)
        const dx = x - 95;
        const dy = y - 60;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        const length = 5;
        const x1 = x - Math.cos(angle) * length;
        const y1 = y - Math.sin(angle) * length;
        const x2 = x + Math.cos(angle) * length;
        const y2 = y + Math.sin(angle) * length;
        return (
          <line key={`${x}-${y}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth="1.2" />
        );
      })
    )}

    {/* Particular solution curve tracing the slope field */}
    <path d="M50,75 C70,30 110,35 125,60 T155,80" stroke="#7c3aed" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="50" cy="75" r="3.5" fill="#ef4444" />
    <text x="64" y="93" fill="#6d28d9" fontSize="8" fontWeight="bold">dy/dx = f(x,y)</text>
  </svg>
);

// 34. Numerical Methods Lab
export const NumericalMethodsSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />
    <line x1="44" y1="85" x2="156" y2="85" stroke="#cbd5e1" strokeWidth="1.5" />

    {/* Trapezoids approximating integral */}
    {/* Trapezoid 1 */}
    <polygon points="56,85 56,65 76,55 76,85" fill="rgba(167, 139, 250, 0.3)" stroke="#7c3aed" strokeWidth="1" />
    {/* Trapezoid 2 */}
    <polygon points="76,85 76,55 96,40 96,85" fill="rgba(167, 139, 250, 0.4)" stroke="#7c3aed" strokeWidth="1" />
    {/* Trapezoid 3 */}
    <polygon points="96,85 96,40 116,42 116,85" fill="rgba(167, 139, 250, 0.3)" stroke="#7c3aed" strokeWidth="1" />
    {/* Trapezoid 4 */}
    <polygon points="116,85 116,42 136,52 136,85" fill="rgba(167, 139, 250, 0.2)" stroke="#7c3aed" strokeWidth="1" />

    {/* True Curve overlay */}
    <path d="M50,75 C70,55 90,34 110,40 T145,62" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <text x="135" y="32" fill="#7c3aed" fontSize="7" fontWeight="bold">Error Δ</text>
  </svg>
);

// 35. Multivariable Calculus
export const MultivariableCalculusSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    {/* 3D grid/mesh curves for a saddle/paraboloid surface */}
    <g transform="translate(15, 0)">
      {/* Surface grid lines */}
      <path d="M50,60 Q80,25 110,60 Q110,60 140,80" stroke="#cbd5e1" strokeWidth="1" fill="none" />
      <path d="M60,65 Q85,32 110,65" stroke="#c4b5fd" strokeWidth="1.5" fill="none" />
      <path d="M70,70 Q90,38 110,70" stroke="#a78bfa" strokeWidth="2" fill="none" />
      <path d="M80,75 Q95,45 110,75" stroke="#7c3aed" strokeWidth="1.5" fill="none" />

      {/* Vertical cross-section lines */}
      <path d="M50,60 Q80,85 110,75" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
      <path d="M80,25 Q90,60 110,75" stroke="#94a3b8" strokeWidth="1.2" fill="none" opacity="0.7" />
    </g>

    {/* Partial Derivative Equation */}
    <g transform="translate(132, 30)">
      <rect x="0" y="0" width="46" height="40" rx="8" fill="#ffffff" stroke="#c4b5fd" strokeWidth="1.5" />
      {/* ∂f/∂x */}
      <text x="23" y="18" fill="#7c3aed" fontSize="13" fontWeight="black" textAnchor="middle">∂</text>
      <line x1="8" y1="23" x2="38" y2="23" stroke="#7c3aed" strokeWidth="1.5" />
      <text x="23" y="34" fill="#7c3aed" fontSize="10" fontWeight="bold" textAnchor="middle">∂x</text>
    </g>
  </svg>
);

// 36. Statistical Inference
export const StatisticalInferenceSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />
    <line x1="44" y1="85" x2="156" y2="85" stroke="#cbd5e1" strokeWidth="1.5" />

    {/* Overlapping Null Curve H0 */}
    <path d="M48,85 Q70,85 80,60 T95,45 T110,70 T125,85" stroke="#3b82f6" strokeWidth="2" fill="none" />
    <text x="75" y="40" fill="#2563eb" fontSize="7.5" fontWeight="bold">H₀</text>

    {/* Overlapping Alt Curve H1 */}
    <path d="M78,85 Q100,85 110,60 T125,45 T140,70 T152,85" stroke="#ef4444" strokeWidth="2" fill="none" />
    <text x="125" y="40" fill="#b91c1c" fontSize="7.5" fontWeight="bold">H₁</text>

    {/* Shaded Rejection Critical Region */}
    <path d="M116,85 L116,62 C120,68 122,80 125,85 Z" fill="#ef4444" opacity="0.5" />
    <line x1="116" y1="45" x2="116" y2="85" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="2 2" />
    <text x="116" y="93" fill="#1e293b" fontSize="7" fontWeight="bold" textAnchor="middle">α = 0.05</text>
  </svg>
);

// 37. Bayesian Reasoning Lab
export const BayesianReasoningSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />

    {/* Venn Diagram circles */}
    <circle cx="85" cy="55" r="25" fill="rgba(59, 130, 246, 0.45)" stroke="#3b82f6" strokeWidth="2" />
    <text x="70" y="58" fill="#1e3a8a" fontSize="10" fontWeight="bold" textAnchor="middle">A</text>

    <circle cx="115" cy="55" r="25" fill="rgba(167, 139, 250, 0.45)" stroke="#7c3aed" strokeWidth="2" />
    <text x="130" y="58" fill="#6d28d9" fontSize="10" fontWeight="bold" textAnchor="middle">B</text>

    {/* Overlap area highlight */}
    <text x="100" y="58" fill="#475569" fontSize="7" fontWeight="black" textAnchor="middle">A∩B</text>

    {/* Conditional Probability Equation bottom */}
    <rect x="52" y="85" width="96" height="18" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
    <text x="100" y="97" fill="#7c3aed" fontSize="8" fontWeight="black" textAnchor="middle">P(A|B) = P(B|A)P(A)/P(B)</text>
  </svg>
);

// 38. Fourier Analysis & Signals
export const FourierAnalysisSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />

    {/* Square Wave (Signal Input) */}
    <path d="M48,50 L68,50 L68,80 L88,80 L88,50 L108,50 L108,80 L128,80" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="miter" fill="none" />

    {/* Decomposing harmonics (Sine Waves of different frequencies) */}
    {/* Fundamental Sine (Green) */}
    <path d="M48,65 Q58,45 68,65 T88,65 T108,65 T128,65" stroke="#10b981" strokeWidth="1.5" fill="none" opacity="0.75" />

    {/* 3rd Harmonic (Purple) */}
    <path d="M48,65 Q51,55 55,65 T62,65 T68,65 T75,65 T82,65 T88,65 T95,65 T102,65 T108,65 T115,65 T122,65 T128,65" stroke="#7c3aed" strokeWidth="1" fill="none" opacity="0.6" />

    <text x="140" y="38" fill="#7c3aed" fontSize="11" fontWeight="black">f(t) = Σ</text>
  </svg>
);

// 39. Complex Numbers & Phasors
export const ComplexNumbersPhasorsSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />
    {/* Complex Plane Axes (Re / Im) */}
    <line x1="100" y1="20" x2="100" y2="100" stroke="#cbd5e1" strokeWidth="1.5" />
    <line x1="36" y1="60" x2="164" y2="60" stroke="#cbd5e1" strokeWidth="1.5" />
    <text x="100" y="16" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">Im</text>
    <text x="160" y="56" fill="#94a3b8" fontSize="6.5" fontWeight="bold">Re</text>

    {/* Phasor rotating vector (polar/exponential form) */}
    <path d="M100,60 L135,35" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M135,35 L128,36 M135,35 L133,42" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <text x="122" y="32" fill="#7c3aed" fontSize="8" fontWeight="bold">{"z = r·e^{iθ}"}</text>

    {/* Projection lines onto axes */}
    <line x1="135" y1="35" x2="135" y2="60" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="100" y1="35" x2="135" y2="35" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />

    {/* Angle arc */}
    <path d="M112,60 A12,12 0 0,0 110,51" stroke="#f97316" strokeWidth="1.5" fill="none" />
  </svg>
);

// 40. Vector Fields & Gradients
export const VectorFieldsGradientsSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="36" y="20" width="128" height="80" rx="12" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />

    {/* Radial flow vector arrows field */}
    {/* Central source radiating outward */}
    {[
      [75, 40, -25, -15],
      [100, 30, 0, -20],
      [125, 40, 25, -15],
      [65, 60, -25, 0],
      [135, 60, 25, 0],
      [75, 80, -25, 15],
      [100, 90, 0, 20],
      [125, 80, 25, 15],
    ].map(([x, y, vx, vy], i) => {
      const length = 5;
      const angle = Math.atan2(vy, vx);
      const x2 = x + Math.cos(angle) * length;
      const y2 = y + Math.sin(angle) * length;

      return (
        <g key={i}>
          <line x1={x} y1={y} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
          <path d={`M${x2} ${y2} L${x2 - Math.cos(angle - 0.5) * 3} ${y2 - Math.sin(angle - 0.5) * 3} M${x2} ${y2} L${x2 - Math.cos(angle + 0.5) * 3} ${y2 - Math.sin(angle + 0.5) * 3}`} stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    })}

    {/* Central source point */}
    <circle cx="100" cy="60" r="4" fill="#ef4444" />
    <text x="100" y="52" fill="#b91c1c" fontSize="8" fontWeight="bold" textAnchor="middle">∇F</text>
  </svg>
);

// 41. Discrete Graph Theory
export const DiscreteGraphTheorySVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />

    {/* Network connections (Edges) */}
    <line x1="50" y1="40" x2="100" y2="25" stroke="#cbd5e1" strokeWidth="2" />
    <line x1="50" y1="40" x2="80" y2="70" stroke="#cbd5e1" strokeWidth="2" />
    <line x1="100" y1="25" x2="150" y2="40" stroke="#cbd5e1" strokeWidth="2" />
    <line x1="80" y1="70" x2="120" y2="90" stroke="#cbd5e1" strokeWidth="2" />

    {/* Shortest Path highlight (Orange edges) */}
    <line x1="50" y1="40" x2="100" y2="55" stroke="#f97316" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="100" y1="55" x2="150" y2="40" stroke="#f97316" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="100" y1="55" x2="120" y2="90" stroke="#cbd5e1" strokeWidth="2" />

    {/* Network Nodes */}
    <circle cx="50" cy="40" r="7" fill="#7c3aed" stroke="#ffffff" strokeWidth="2" />
    <circle cx="100" cy="25" r="5" fill="#a78bfa" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="80" cy="70" r="5" fill="#a78bfa" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="100" cy="55" r="7.5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" /> {/* Path vertex */}
    <circle cx="150" cy="40" r="7" fill="#7c3aed" stroke="#ffffff" strokeWidth="2" />
    <circle cx="120" cy="90" r="5.5" fill="#a78bfa" stroke="#ffffff" strokeWidth="1.5" />
  </svg>
);

// 42. Mathematical Modeling Lab
export const MathematicalModelingSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />

    {/* Flow boxes */}
    {/* Box 1: Real World */}
    <rect x="25" y="16" width="56" height="24" rx="6" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1.5" />
    <text x="53" y="31" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle">REAL WORLD</text>

    {/* Box 2: Model formulation */}
    <rect x="120" y="16" width="56" height="24" rx="6" fill="#10b981" stroke="#059669" strokeWidth="1.5" />
    <text x="148" y="31" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle">MATH MODEL</text>

    {/* Box 3: Solution */}
    <rect x="72" y="76" width="56" height="24" rx="6" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
    <text x="100" y="91" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle">SOLUTION</text>

    {/* Connecting Flow Arrows */}
    {/* Real World -> Model */}
    <path d="M86,28 L114,28" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
    <path d="M114,28 L108,24 M114,28 L108,32" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
    <text x="100" y="23" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">Formulate</text>

    {/* Model -> Solution */}
    <path d="M148,45 L148,88 L133,88" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M133,88 L139,84 M133,88 L139,92" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
    <text x="148" y="65" fill="#475569" fontSize="6.5" fontWeight="bold" transform="rotate(90 148 65)" textAnchor="middle">Solve</text>

    {/* Solution -> Real World */}
    <path d="M67,88 L50,88 L50,45" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M50,45 L46,51 M50,45 L54,51" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
    <text x="50" y="65" fill="#475569" fontSize="6.5" fontWeight="bold" transform="rotate(-90 50 65)" textAnchor="middle">Validate</text>
  </svg>
);

// 43. Quantum Tunneling & Wave Packets SVG
export const QuantumTunnelingSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#f5f3ff" opacity="0.5" />
    <defs>
      <linearGradient id="qt-barrier-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#be123c" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id="qt-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="50%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>

    {/* Potential Barrier */}
    <rect x="94" y="25" width="12" height="70" rx="3" fill="url(#qt-barrier-grad)" stroke="#be123c" strokeWidth="1.5" />
    <text x="100" y="20" fill="#be123c" fontSize="7.5" fontWeight="black" textAnchor="middle">V₀</text>

    {/* Wave Function ψ(x) */}
    {/* Incident & Reflected wave packet on the left */}
    <path d="M20,60 Q30,30 40,60 T60,60 T80,60 Q87,60 94,62" stroke="url(#qt-wave-grad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

    {/* Decaying wave inside barrier */}
    <path d="M94,62 Q100,64 106,66" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" fill="none" />

    {/* Transmitted smaller wave packet on the right */}
    <path d="M106,66 Q113,68 120,60 T140,60 T160,60 T180,60" stroke="#ec4899" strokeWidth="1.8" strokeLinecap="round" fill="none" />

    {/* Energy level line */}
    <line x1="15" y1="60" x2="185" y2="60" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
    <text x="175" y="54" fill="#64748b" fontSize="7" fontWeight="bold">E &lt; V₀</text>
  </svg>
);

// 44. Michelson Interferometer SVG
export const MichelsonInterferometerSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#fef2f2" opacity="0.5" />
    <defs>
      <linearGradient id="mi-laser" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#f87171" />
      </linearGradient>
    </defs>

    {/* Laser Source (Left) */}
    <rect x="15" y="52" width="22" height="16" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
    <rect x="37" y="56" width="6" height="8" fill="#64748b" />
    <circle cx="22" cy="60" r="2.5" fill="#ef4444" />

    {/* Mirrors */}
    {/* Top Mirror (M1) */}
    <rect x="90" y="15" width="20" height="6" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
    <line x1="90" y1="21" x2="110" y2="21" stroke="#38bdf8" strokeWidth="2" />

    {/* Right Mirror (M2) */}
    <rect x="155" y="50" width="6" height="20" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
    <line x1="155" y1="50" x2="155" y2="70" stroke="#38bdf8" strokeWidth="2" />

    {/* Beam Splitter (Center) */}
    <line x1="90" y1="70" x2="110" y2="50" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    <line x1="91" y1="69" x2="109" y2="51" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />

    {/* Detector (Bottom) */}
    <rect x="90" y="95" width="20" height="12" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
    <rect x="92" y="98" width="16" height="6" fill="#000000" />
    {/* Fringe pattern simulation on detector */}
    <line x1="94" y1="101" x2="94" y2="101" stroke="#38bdf8" strokeWidth="2" />
    <line x1="98" y1="101" x2="98" y2="101" stroke="#38bdf8" strokeWidth="2" />
    <line x1="102" y1="101" x2="102" y2="101" stroke="#38bdf8" strokeWidth="2" />
    <line x1="106" y1="101" x2="106" y2="101" stroke="#38bdf8" strokeWidth="2" />

    {/* Light Paths */}
    {/* Laser to Splitter */}
    <line x1="43" y1="60" x2="100" y2="60" stroke="#ef4444" strokeWidth="2.5" opacity="0.8" />
    {/* Splitter to Top Mirror */}
    <line x1="100" y1="60" x2="100" y2="21" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
    {/* Splitter to Right Mirror */}
    <line x1="100" y1="60" x2="155" y2="60" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
    {/* Splitter to Detector */}
    <line x1="100" y1="60" x2="100" y2="95" stroke="#ff7171" strokeWidth="2" strokeDasharray="2 1" />
  </svg>
);

// 45. Zeeman Effect in Atoms SVG
export const ZeemanEffectSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#eff6ff" opacity="0.5" />
    <defs>
      <linearGradient id="zm-magnet" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>

    {/* Electromagnet Poles */}
    <rect x="25" y="35" width="20" height="50" rx="3" fill="url(#zm-magnet)" stroke="#0f172a" strokeWidth="1.5" />
    <text x="35" y="63" fill="#ffffff" fontSize="10" fontWeight="black" textAnchor="middle">N</text>

    <rect x="155" y="35" width="20" height="50" rx="3" fill="url(#zm-magnet)" stroke="#0f172a" strokeWidth="1.5" />
    <text x="165" y="63" fill="#ffffff" fontSize="10" fontWeight="black" textAnchor="middle">S</text>

    {/* Magnetic Field Lines */}
    <path d="M45,45 Q100,40 155,45" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="3 3" />
    <path d="M45,60 L155,60" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
    <path d="M45,75 Q100,80 155,75" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="3 3" />

    {/* Central Glowing Sample (Gas Discharge Tube) */}
    <rect x="94" y="25" width="12" height="70" rx="6" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />
    <line x1="100" y1="30" x2="100" y2="90" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />

    {/* Spectral Splitting (Zeeman diagram) bubble */}
    <g transform="translate(100, 45)">
      <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* 3 split lines */}
      <line x1="-10" y1="-5" x2="10" y2="-5" stroke="#ef4444" strokeWidth="2.5" />
      <line x1="-10" y1="0" x2="10" y2="0" stroke="#a78bfa" strokeWidth="2.5" />
      <line x1="-10" y1="5" x2="10" y2="5" stroke="#3b82f6" strokeWidth="2.5" />
    </g>
  </svg>
);

// 46. Superconductivity & Meissner Effect SVG
export const SuperconductivityMeissnerSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ecfeff" opacity="0.5" />
    <defs>
      <linearGradient id="sc-base" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
      <linearGradient id="mag-nord" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
      <linearGradient id="mag-sud" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>

    {/* Superconductor Disk */}
    <ellipse cx="100" cy="85" rx="40" ry="12" fill="url(#sc-base)" stroke="#0891b2" strokeWidth="2" />
    <ellipse cx="100" cy="81" rx="40" ry="10" fill="#cffafe" opacity="0.7" />

    {/* Levitaling Magnet */}
    <g transform="translate(85, 36)">
      {/* North half */}
      <rect x="0" y="0" width="15" height="12" fill="url(#mag-nord)" stroke="#7f1d1d" strokeWidth="1" />
      <text x="7.5" y="9" fill="#ffffff" fontSize="7" fontWeight="black" textAnchor="middle">N</text>
      {/* South half */}
      <rect x="15" y="0" width="15" height="12" fill="url(#mag-sud)" stroke="#1e3a8a" strokeWidth="1" />
      <text x="22.5" y="9" fill="#ffffff" fontSize="7" fontWeight="black" textAnchor="middle">S</text>
    </g>

    {/* Frost/Vapor clouds (Cold indicator) */}
    <path d="M50,90 Q45,85 55,80 T75,83 T95,81 T115,82 T135,80 T150,88" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />

    {/* Excluded Magnetic Field Lines bending around Superconductor */}
    <path d="M70,30 C60,40 50,65 55,80" stroke="#06b6d4" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.75" />
    <path d="M130,30 C140,40 150,65 145,80" stroke="#06b6d4" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.75" />

    <path d="M80,25 C50,30 40,75 50,92" stroke="#0891b2" strokeWidth="1" strokeDasharray="3 2" fill="none" opacity="0.5" />
    <path d="M120,25 C150,30 160,75 150,92" stroke="#0891b2" strokeWidth="1" strokeDasharray="3 2" fill="none" opacity="0.5" />
  </svg>
);

// 47. Bragg Diffraction & Crystallography SVG
export const BraggDiffractionSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#f0fdf4" opacity="0.5" />
    <defs>
      <linearGradient id="bg-beam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>

    {/* Crystal Atoms Lattice (3 rows, 5 columns) */}
    {/* Row 1 */}
    <circle cx="40" cy="50" r="4.5" fill="#64748b" />
    <circle cx="70" cy="50" r="4.5" fill="#64748b" />
    <circle cx="100" cy="50" r="4.5" fill="#34d399" stroke="#059669" strokeWidth="1" /> {/* Target 1 */}
    <circle cx="130" cy="50" r="4.5" fill="#64748b" />
    <circle cx="160" cy="50" r="4.5" fill="#64748b" />
    {/* Row 2 */}
    <circle cx="40" cy="75" r="4.5" fill="#64748b" />
    <circle cx="70" cy="75" r="4.5" fill="#64748b" />
    <circle cx="100" cy="75" r="4.5" fill="#34d399" stroke="#059669" strokeWidth="1" /> {/* Target 2 */}
    <circle cx="130" cy="75" r="4.5" fill="#64748b" />
    <circle cx="160" cy="75" r="4.5" fill="#64748b" />
    {/* Lattice plane lines */}
    <line x1="30" y1="50" x2="170" y2="50" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 3" />
    <line x1="30" y1="75" x2="170" y2="75" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 3" />
    <text x="175" y="53" fill="#64748b" fontSize="6.5" fontWeight="bold">d</text>

    {/* Incident X-ray 1 */}
    <path d="M40,20 L100,50 L160,20" stroke="url(#bg-beam-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Incident X-ray 2 */}
    <path d="M50,15 L100,75 L150,15" stroke="url(#bg-beam-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.75" />

    {/* Wavefront symbols */}
    <path d="M50,25 L60,15" stroke="#10b981" strokeWidth="1" />
    <path d="M58,29 L68,19" stroke="#10b981" strokeWidth="1" />
    <path d="M140,25 L150,15" stroke="#10b981" strokeWidth="1" />

    {/* Angle indicator θ */}
    <path d="M80,50 A20,20 0 0,1 88,44" stroke="#059669" strokeWidth="1.2" fill="none" />
    <text x="75" y="44" fill="#059669" fontSize="7" fontWeight="bold">θ</text>
  </svg>
);

// 48. Relativistic Kinematics SVG
export const RelativisticKinematicsSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#fff7ed" opacity="0.5" />
    <defs>
      <linearGradient id="rk-rocket" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
    </defs>

    {/* Lorentz Contracted Spacecraft (Shorter length) */}
    <g transform="translate(65, 45)">
      {/* Ship Body */}
      <path d="M0,15 L35,5 L50,15 L35,25 L0,15 Z" fill="url(#rk-rocket)" stroke="#c2410c" strokeWidth="1.5" />
      {/* Cockpit */}
      <path d="M30,10 L45,15 L30,20 Z" fill="#38bdf8" />
      {/* Thruster Fire */}
      <path d="M-2,12 L-12,15 L-2,18 Z" fill="#facc15" />
    </g>

    {/* Speed lines */}
    <line x1="20" y1="40" x2="50" y2="40" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    <line x1="15" y1="75" x2="45" y2="75" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <line x1="130" y1="35" x2="175" y2="35" stroke="#f97316" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

    {/* Time Dilation Clocks */}
    {/* Local clock inside spaceship t' */}
    <g transform="translate(100, 60)">
      <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#ea580c" strokeWidth="1.5" />
      <line x1="0" y1="0" x2="0" y2="-5" stroke="#ea580c" strokeWidth="1.2" />
      <line x1="0" y1="0" x2="4" y2="0" stroke="#ea580c" strokeWidth="1.2" />
      <text x="0" y="16" fill="#ea580c" fontSize="6" fontWeight="bold" textAnchor="middle">t&apos; = 1s</text>
    </g>

    {/* Stationary Earth clock t */}
    <g transform="translate(155, 75)">
      <circle cx="0" cy="0" r="11" fill="#ffffff" stroke="#475569" strokeWidth="2" />
      <line x1="0" y1="0" x2="0" y2="-8" stroke="#475569" strokeWidth="1.5" />
      <line x1="0" y1="0" x2="-6" y2="4" stroke="#475569" strokeWidth="1.5" />
      <text x="0" y="20" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">t = 7s</text>
    </g>

    <text x="100" y="22" fill="#ea580c" fontSize="8" fontWeight="black" textAnchor="middle">v ≈ 0.99c</text>
  </svg>
);

// --- CHEMISTRY (6 Labs) ---

// 49. NMR Spectroscopy SVG
export const NmrSpectroscopySVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#faf5ff" opacity="0.5" />
    <defs>
      <linearGradient id="nmr-coil" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d8b4fe" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>

    {/* Magnet Ring */}
    <circle cx="100" cy="50" r="32" stroke="url(#nmr-coil)" strokeWidth="6" fill="none" opacity="0.8" />
    <circle cx="100" cy="50" r="32" stroke="#a78bfa" strokeWidth="1.5" fill="none" />

    {/* Sample Tube inside magnet */}
    <rect x="96" y="10" width="8" height="60" rx="3" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
    {/* Sample solution inside */}
    <rect x="97" y="30" width="6" height="38" fill="#38bdf8" opacity="0.6" />

    {/* RF Coil lines around tube */}
    <path d="M92,30 H108 M92,36 H108 M92,42 H108 M92,48 H108 M92,54 H108" stroke="#f59e0b" strokeWidth="1.8" opacity="0.75" />

    {/* Spectrum Peaks in the background grid */}
    <rect x="25" y="80" width="150" height="32" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
    <line x1="25" y1="102" x2="175" y2="102" stroke="#94a3b8" strokeWidth="1" />
    {/* Spectral Peaks */}
    <path d="M35,102 L80,102 L85,82 L90,102 L120,102 L125,92 L130,102 L145,102 L148,88 L152,102 L170,102" stroke="#7c3aed" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
  </svg>
);

// 50. XPS Spectroscopy SVG
export const XpsSpectroscopySVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#faf5ff" opacity="0.5" />
    <defs>
      <linearGradient id="xps-beam" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>

    {/* Sample Surface Base */}
    <rect x="30" y="85" width="140" height="15" rx="3" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
    <line x1="30" y1="89" x2="170" y2="89" stroke="#94a3b8" strokeWidth="1" />

    {/* Target atom and orbit shells representation */}
    <g transform="translate(100, 75)">
      <circle cx="0" cy="0" r="10" fill="#f472b6" opacity="0.4" />
      <circle cx="0" cy="0" r="3" fill="#db2777" />

      {/* Incident X-ray photon */}
      <path d="M-60,-45 L-30,-22.5 L0,0" stroke="url(#xps-beam)" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="3 1" />
      <text x="-38" y="-30" fill="#db2777" fontSize="7" fontWeight="bold">hν (X-ray)</text>

      {/* Ejected core-electron (Photoelectron) */}
      <circle cx="15" cy="-22" r="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
      <path d="M0,0 L15,-22 L35,-50" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
      <path d="M35,-50 L28,-49 M35,-50 L34,-43" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" />
      <text x="35" y="-30" fill="#ca8a04" fontSize="7.5" fontWeight="bold">e⁻ (K.E.)</text>
    </g>

    {/* Analyzer entrance slit */}
    <path d="M125,20 H145 L150,5 H120 Z" fill="#64748b" stroke="#334155" strokeWidth="1" />
  </svg>
);

// 51. HPLC Chromatography SVG
export const HplcChromatographySVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.5" />
    <defs>
      <linearGradient id="hplc-col" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="50%" stopColor="#f1f5f9" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
    </defs>

    {/* Column Tube */}
    <rect x="25" y="32" width="150" height="24" rx="4" fill="url(#hplc-col)" stroke="#475569" strokeWidth="2" />
    {/* Packing beads pattern */}
    <circle cx="35" cy="44" r="2.5" fill="#94a3b8" />
    <circle cx="45" cy="44" r="2.5" fill="#94a3b8" />
    <circle cx="155" cy="44" r="2.5" fill="#94a3b8" />
    <circle cx="165" cy="44" r="2.5" fill="#94a3b8" />

    {/* Separated Sample Bands (Pink, Amber, Cyan) */}
    <rect x="65" y="33" width="12" height="22" fill="#ec4899" opacity="0.8" />
    <rect x="95" y="33" width="15" height="22" fill="#f59e0b" opacity="0.8" />
    <rect x="130" y="33" width="10" height="22" fill="#06b6d4" opacity="0.8" />

    {/* Flow Direction Arrows */}
    <path d="M10,44 L20,44" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20,44 L16,40 M20,44 L16,48" stroke="#334155" strokeWidth="2" strokeLinecap="round" />

    {/* HPLC Chromatogram Bubble (detector output) */}
    <g transform="translate(100, 85)">
      <rect x="-55" y="-18" width="110" height="30" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
      <line x1="-50" y1="6" x2="50" y2="6" stroke="#cbd5e1" strokeWidth="1" />
      {/* 3 peaks corresponding to separated components */}
      <path d="M-45,6 L-25,6 L-20,-10 L-15,6 L0,6 L5,-4 L10,6 L25,6 L30,-14 L35,6 L45,6" stroke="#8b5cf6" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
    </g>
  </svg>
);

// 52. Transition Metal Complexes SVG
export const TransitionMetalComplexesSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#fdf4ff" opacity="0.5" />
    <defs>
      <radialGradient id="metal-g" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#6b21a8" />
      </radialGradient>
    </defs>

    {/* Octahedral Complex geometry */}
    <g transform="translate(70, 60)">
      {/* Ligand bonds (axes) */}
      <line x1="0" y1="-35" x2="0" y2="35" stroke="#a78bfa" strokeWidth="2" strokeDasharray="2 2" />
      <line x1="-35" y1="0" x2="35" y2="0" stroke="#a78bfa" strokeWidth="2" strokeDasharray="2 2" />
      <line x1="-22" y1="-22" x2="22" y2="22" stroke="#a78bfa" strokeWidth="2" strokeDasharray="2 2" />

      {/* Ligand atoms (NH3 or similar) */}
      <circle cx="0" cy="-35" r="5.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
      <circle cx="0" cy="35" r="5.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
      <circle cx="-35" cy="0" r="5.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
      <circle cx="35" cy="0" r="5.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
      <circle cx="-22" cy="-22" r="5.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
      <circle cx="22" cy="22" r="5.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

      {/* Central Metal Ion (eg Cobalt) */}
      <circle cx="0" cy="0" r="11" fill="url(#metal-g)" stroke="#581c87" strokeWidth="1.5" />
      <text x="0" y="3" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">Mⁿ⁺</text>
    </g>

    {/* Energy splitting diagram (d-orbitals splitting in crystal field) */}
    <g transform="translate(150, 60)">
      {/* eg energy level (higher, 2 lines) */}
      <line x1="-12" y1="-20" x2="-2" y2="-20" stroke="#d946ef" strokeWidth="2" />
      <line x1="2" y1="-20" x2="12" y2="-20" stroke="#d946ef" strokeWidth="2" />
      <text x="18" y="-17" fill="#d946ef" fontSize="7" fontWeight="bold">e_g</text>

      {/* Δ oct split indicator arrow */}
      <path d="M0,-16 L0,6" stroke="#9333ea" strokeWidth="1" />
      <path d="M-3,-13 L0,-17 L3,-13 M-3,3 L0,7 L3,3" stroke="#9333ea" strokeWidth="1" fill="none" />
      <text x="6" y="-3" fill="#9333ea" fontSize="8" fontWeight="bold">Δ</text>

      {/* t2g energy level (lower, 3 lines) */}
      <line x1="-15" y1="10" x2="-8" y2="10" stroke="#8b5cf6" strokeWidth="2" />
      <line x1="-4" y1="10" x2="3" y2="10" stroke="#8b5cf6" strokeWidth="2" />
      <line x1="7" y1="10" x2="14" y2="10" stroke="#8b5cf6" strokeWidth="2" />
      <text x="20" y="13" fill="#8b5cf6" fontSize="7" fontWeight="bold">t_2g</text>
    </g>
  </svg>
);

// 53. EIS Electrochemistry SVG
export const EisElectrochemistrySVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#f0fdf4" opacity="0.5" />
    <defs>
      <linearGradient id="eis-cell" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#a7f3d0" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
    </defs>

    {/* Nyquist Plot Area (Left) */}
    <g transform="translate(25, 20)">
      <rect x="0" y="0" width="75" height="70" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="6" y1="64" x2="70" y2="64" stroke="#94a3b8" strokeWidth="1.2" /> {/* X axis */}
      <line x1="6" y1="6" x2="6" y2="64" stroke="#94a3b8" strokeWidth="1.2" /> {/* Y axis */}
      <text x="68" y="61" fill="#64748b" fontSize="6.5" textAnchor="end">Z&apos;</text>
      <text x="10" y="12" fill="#64748b" fontSize="6.5" transform="rotate(-90 10 12)" textAnchor="end">-Z&apos;&apos;</text>

      {/* Nyquist curve (semicircle + straight Warburg diffusion line) */}
      <path d="M6,64 Q25,35 45,64 L65,40" stroke="#059669" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>

    {/* Equivalent Circuit Model (Right) */}
    <g transform="translate(115, 45)">
      {/* Rs Resistor */}
      <rect x="0" y="10" width="18" height="8" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
      <line x1="-10" y1="14" x2="0" y2="14" stroke="#475569" strokeWidth="1.5" />
      <text x="9" y="6" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">Rs</text>

      {/* Parallel Split */}
      <path d="M18,14 H24 V2 H30 M24,14 V26 H30" stroke="#475569" strokeWidth="1.5" fill="none" />

      {/* Cdl (Capacitor top branch) */}
      <line x1="30" y1="-2" x2="30" y2="6" stroke="#059669" strokeWidth="2.5" />
      <line x1="33" y1="-2" x2="33" y2="6" stroke="#059669" strokeWidth="2.5" />
      <line x1="33" y1="2" x2="42" y2="2" stroke="#475569" strokeWidth="1.5" />
      <line x1="18" y1="2" x2="30" y2="2" stroke="#475569" strokeWidth="1.5" />
      <text x="31" y="-5" fill="#059669" fontSize="6" fontWeight="bold" textAnchor="middle">Cdl</text>

      {/* Rct (Resistor bottom branch) */}
      <rect x="30" y="22" width="18" height="8" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
      <line x1="48" y1="26" x2="54" y2="26" stroke="#475569" strokeWidth="1.5" />
      <text x="39" y="18" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">Rct</text>

      {/* Recombine */}
      <path d="M42,2 H48 V14 H58 M48,26 H48" stroke="#475569" strokeWidth="1.5" fill="none" />
    </g>
  </svg>
);

// 54. Quantum Chemistry Molecular Orbitals SVG
export const QuantumChemistryOrbitalsSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#f5f3ff" opacity="0.5" />
    <defs>
      <radialGradient id="orb-blue" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </radialGradient>
      <radialGradient id="orb-red" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#db2777" />
      </radialGradient>
    </defs>

    {/* Molecular Orbital Wavefunction Lobes (bonding pi-orbital shape) */}
    {/* Top left blue lobe */}
    <ellipse cx="78" cy="42" rx="16" ry="12" fill="url(#orb-blue)" stroke="#0284c7" strokeWidth="1" />
    {/* Bottom left red lobe */}
    <ellipse cx="78" cy="78" rx="16" ry="12" fill="url(#orb-red)" stroke="#db2777" strokeWidth="1" />

    {/* Top right red lobe */}
    <ellipse cx="122" cy="42" rx="16" ry="12" fill="url(#orb-red)" stroke="#db2777" strokeWidth="1" />
    {/* Bottom right blue lobe */}
    <ellipse cx="122" cy="78" rx="16" ry="12" fill="url(#orb-blue)" stroke="#0284c7" strokeWidth="1" />

    {/* Atom Nuclei */}
    <circle cx="78" cy="60" r="4.5" fill="#475569" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="122" cy="60" r="4.5" fill="#475569" stroke="#ffffff" strokeWidth="1.5" />
    <line x1="78" y1="60" x2="122" y2="60" stroke="#cbd5e1" strokeWidth="2.5" />

    {/* Nodal Plane lines */}
    <line x1="100" y1="20" x2="100" y2="100" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
    <text x="100" y="16" fill="#f43f5e" fontSize="7" fontWeight="bold" textAnchor="middle">NODE</text>
  </svg>
);

// --- BIOLOGY (6 Labs) ---

// 55. PCR & Gel Electrophoresis SVG
export const PcrGelElectrophoresisSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ecfdf5" opacity="0.5" />
    <defs>
      <linearGradient id="gel-plate" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>

    {/* Left Side: PCR Tube */}
    <g transform="translate(15, 20)">
      <path d="M15,10 H35 V45 L25,60 L15,45 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" opacity="0.8" />
      <rect x="18" y="10" width="14" height="2" rx="0.5" fill="#94a3b8" />
      {/* Liquid in tube */}
      <path d="M16.5,35 H33.5 V44 L25,56 L16.5,44 Z" fill="#34d399" opacity="0.6" />
      {/* DNA Helix representation inside liquid */}
      <path d="M20,38 Q25,34 30,38" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M20,42 Q25,46 30,42" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </g>

    {/* Right Side: Gel Electrophoresis Tank */}
    <g transform="translate(85, 18)">
      <rect x="0" y="0" width="90" height="84" rx="4" fill="url(#gel-plate)" stroke="#475569" strokeWidth="2" />
      {/* Wells */}
      <rect x="12" y="8" width="12" height="6" fill="#334155" rx="1" />
      <rect x="38" y="8" width="12" height="6" fill="#334155" rx="1" />
      <rect x="64" y="8" width="12" height="6" fill="#334155" rx="1" />

      {/* Fluorescent Bands (Lane 1: DNA Ladder) */}
      <rect x="12" y="22" width="12" height="3" fill="#10b981" />
      <rect x="12" y="34" width="12" height="3" fill="#10b981" />
      <rect x="12" y="46" width="12" height="3" fill="#10b981" />
      <rect x="12" y="58" width="12" height="3" fill="#10b981" />
      <rect x="12" y="70" width="12" height="3" fill="#10b981" />

      {/* Lane 2: Sample A (Single heavy band) */}
      <rect x="38" y="34" width="12" height="4.5" fill="#34d399" className="animate-pulse" />

      {/* Lane 3: Sample B (Two lighter bands) */}
      <rect x="64" y="22" width="12" height="3" fill="#34d399" />
      <rect x="64" y="58" width="12" height="3" fill="#34d399" />
    </g>
  </svg>
);

// 56. CRISPR-Cas9 Gene Editing SVG
export const CrisprGeneEditingSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#f0fdf4" opacity="0.5" />
    <defs>
      <linearGradient id="cas9-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#047857" stopOpacity="0.4" />
      </linearGradient>
    </defs>

    {/* Cas9 Protein shadow/blob */}
    <path d="M40,60 C40,25 70,18 100,20 C130,22 170,35 170,70 C170,105 120,105 100,102 C80,100 40,95 40,60 Z" fill="url(#cas9-grad)" stroke="#059669" strokeWidth="2" strokeDasharray="3 3" />
    <text x="145" y="94" fill="#047857" fontSize="9" fontWeight="black">Cas9</text>

    {/* DNA Strands */}
    {/* Strand 1 (split) */}
    <path d="M15,48 H65 C80,32 110,32 125,48 H185" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Strand 2 (split) */}
    <path d="M15,62 H65 C80,78 110,78 125,62 H185" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none" />

    {/* guide RNA (gRNA) matching targeted DNA sequence */}
    <path d="M50,48 C70,32 110,32 130,48" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" fill="none" />
    {/* H-bond base pair ticks between gRNA and target DNA */}
    <path d="M72,42 V46 M85,39 V43 M98,38 V42 M111,41 V45" stroke="#ffffff" strokeWidth="1" />
    <text x="96" y="28" fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="middle">gRNA</text>

    {/* Cut Site indicators (scissors) */}
    <g transform="translate(112, 45)">
      <circle cx="5" cy="5" r="3" stroke="#ef4444" strokeWidth="1" fill="none" />
      <circle cx="5" cy="11" r="3" stroke="#ef4444" strokeWidth="1" fill="none" />
      <line x1="5" y1="8" x2="16" y2="8" stroke="#ef4444" strokeWidth="1.5" />
      <line x1="8" y1="5" x2="14" y2="11" stroke="#ef4444" strokeWidth="1.5" />
    </g>
  </svg>
);

// 57. Recombinant DNA Transformation SVG
export const RecombinantDnaTransformationSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#f0fdf4" opacity="0.5" />
    <defs>
      <linearGradient id="bact-wall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>

    {/* E. Coli Cell Outline */}
    <rect x="25" y="32" width="130" height="56" rx="28" fill="#ecfdf5" stroke="url(#bact-wall)" strokeWidth="3" />
    <text x="90" y="80" fill="#047857" fontSize="7" fontWeight="bold" opacity="0.5">E. coli host cell</text>

    {/* Bacterial Genomic DNA (messy coil) */}
    <path d="M35,60 Q45,45 60,65 T85,55 T100,70 T125,50" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.65" />

    {/* Plasmids */}
    {/* Plasmid 1: Spliced Recombinant Plasmid inside host */}
    <g transform="translate(130, 48)">
      <circle cx="0" cy="0" r="11" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
      {/* Inserted target gene segment */}
      <path d="M8,-7 A11,11 0 0,1 8,7" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x="0" y="2.5" fill="#ef4444" fontSize="5.5" fontWeight="bold" textAnchor="middle">gene</text>
    </g>

    {/* Plasmid 2: Entering via heat-shock pore */}
    <g transform="translate(155, 20)">
      <circle cx="0" cy="0" r="11" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
      <path d="M8,-7 A11,11 0 0,1 8,7" stroke="#ef4444" strokeWidth="3" fill="none" />

      {/* Arrow showing entry path */}
      <path d="M2,12 L-12,22" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M-12,22 L-6,21 M-12,22 L-11,16" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </svg>
);

// 58. Flow Cytometry SVG
export const FlowCytometrySVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ecfdf5" opacity="0.5" />
    <defs>
      <linearGradient id="cyto-laser" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Flow Capillary Channel */}
    <line x1="100" y1="12" x2="100" y2="108" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
    <line x1="96" y1="12" x2="96" y2="108" stroke="#94a3b8" strokeWidth="1" />
    <line x1="104" y1="12" x2="104" y2="108" stroke="#94a3b8" strokeWidth="1" />

    {/* Focused Cells flowing down in single file */}
    <circle cx="100" cy="22" r="3.5" fill="#10b981" />
    <circle cx="100" cy="42" r="3.5" fill="#10b981" />
    <circle cx="100" cy="60" r="3.5" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" /> {/* Cell under analysis */}
    <circle cx="100" cy="78" r="3.5" fill="#10b981" />
    <circle cx="100" cy="96" r="3.5" fill="#10b981" />

    {/* Laser Intercept */}
    {/* Laser emitter */}
    <rect x="25" y="55" width="20" height="10" rx="1.5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
    <path d="M45,60 L100,60" stroke="#0284c7" strokeWidth="2.5" />

    {/* Forward and Side Scatter Light rays */}
    <path d="M100,60 L145,45 M100,60 L155,60 M100,60 L145,75" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 1" />

    {/* Forward scatter detector (FSC) */}
    <rect x="155" y="52" width="10" height="16" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />
    <text x="160" y="62" fill="#ffffff" fontSize="5" fontWeight="bold" textAnchor="middle">FSC</text>
  </svg>
);

// 59. Western Blotting SVG
export const WesternBlottingSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ecfdf5" opacity="0.5" />
    <defs>
      <linearGradient id="wb-membrane" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
    </defs>

    {/* Blotting Membrane */}
    <rect x="35" y="25" width="130" height="70" rx="4" fill="url(#wb-membrane)" stroke="#475569" strokeWidth="1.5" />
    <line x1="35" y1="35" x2="165" y2="35" stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" />

    {/* Target protein bands layout */}
    {/* Lane 1 */}
    <rect x="52" y="44" width="16" height="3.5" rx="1" fill="#0f172a" />
    <rect x="52" y="56" width="16" height="3.5" rx="1" fill="#0f172a" />
    <rect x="52" y="74" width="16" height="3.5" rx="1" fill="#0f172a" />

    {/* Lane 2 (Target signal band is glowing) */}
    <rect x="92" y="44" width="16" height="3.5" rx="1" fill="#0f172a" />
    {/* Glowing chemiluminescent band */}
    <rect x="92" y="56" width="16" height="4.5" rx="1" fill="#34d399" stroke="#10b981" strokeWidth="1.5" className="animate-pulse" />
    <rect x="92" y="74" width="16" height="3.5" rx="1" fill="#0f172a" />

    {/* Lane 3 */}
    <rect x="132" y="44" width="16" height="3.5" rx="1" fill="#0f172a" />
    <rect x="132" y="74" width="16" height="3.5" rx="1" fill="#0f172a" />

    {/* Antibody sandwich bubble (detailed view) */}
    <g transform="translate(145, 45)">
      <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Target protein */}
      <ellipse cx="0" cy="8" rx="8" ry="4" fill="#64748b" />
      {/* Primary Ab (Y-shape) */}
      <path d="M0,8 L0,0 M-5,-4 L0,0 L5,-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      {/* Secondary Ab (linked) */}
      <path d="M0,0 L0,-7 M-4,-11 L0,-7 L4,-11" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
      {/* Enzyme tag */}
      <circle cx="0" cy="-11" r="2.5" fill="#f59e0b" />
    </g>
  </svg>
);

// 60. Metabolic Pathway Flux SVG
export const MetabolicPathwayFluxSVG = ({ className = "w-full h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ecfdf5" opacity="0.5" />

    {/* Metabolic Nodes (Metabolites) */}
    {/* A: Glucose */}
    <circle cx="30" cy="40" r="8" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
    <text x="30" y="42.5" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">G</text>

    {/* B: Pyruvate */}
    <circle cx="90" cy="40" r="8" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
    <text x="90" y="42.5" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">P</text>

    {/* C: Acetyl-CoA */}
    <circle cx="150" cy="40" r="8" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
    <text x="150" y="42.5" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">Ac</text>

    {/* D: Lactate (alternative side-pathway) */}
    <circle cx="90" cy="85" r="8" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
    <text x="90" y="87.5" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">L</text>

    {/* Pathway Flux Arrows */}
    {/* Active High-Flux Arrow: Glucose -> Pyruvate (thick arrow) */}
    <path d="M42,40 L78,40" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M78,40 L72,36 M78,40 L72,44" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

    {/* Active High-Flux Arrow: Pyruvate -> Acetyl-CoA (thick arrow) */}
    <path d="M102,40 L138,40" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M138,40 L132,36 M138,40 L132,44" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

    {/* Inactive Low-Flux Side Arrow: Pyruvate -> Lactate (thin arrow) */}
    <path d="M90,52 L90,73" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M90,73 L87,68 M90,73 L93,68" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

    <text x="60" y="32" fill="#047857" fontSize="6.5" fontWeight="bold" textAnchor="middle">Active Flux</text>
    <text x="112" y="80" fill="#94a3b8" fontSize="6" fontWeight="bold">Suppressed</text>
  </svg>
);
