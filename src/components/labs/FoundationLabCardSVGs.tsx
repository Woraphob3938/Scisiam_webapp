import React from "react";

type FoundationCardSVGProps = {
  className?: string;
};

const svgProps = {
  viewBox: "0 0 200 120",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": "true",
  focusable: "false",
} as const;

export const LabEquipmentCardSVG = ({ className = "h-32 w-full" }: FoundationCardSVGProps) => (
  <svg {...svgProps} className={className}>
    <circle cx="100" cy="58" r="50" fill="#dbeafe" opacity="0.7" />
    <path d="M24 94H176" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
    <g stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M71 30H91L85 39H74L71 30Z" fill="#60a5fa" />
      <path d="M78 39C77 51 69 55 66 64C63 74 70 82 83 82H103" />
      <path d="M88 38L101 52" />
      <path d="M97 48L107 39L114 46L104 56" fill="#bfdbfe" />
      <path d="M99 57C107 61 109 69 106 78" />
      <path d="M61 83H111" strokeWidth="5" />
      <path d="M84 64H103" />
    </g>
    <g transform="translate(119 39)">
      <path d="M8 0V20L0 38C-2 43 2 47 8 47H34C40 47 44 43 42 38L34 20V0" fill="#eff6ff" stroke="#2563eb" strokeWidth="2.5" />
      <path d="M5 34C15 29 27 39 38 32L42 40C43 43 40 45 35 45H8C4 45 2 42 4 38L5 34Z" fill="#38bdf8" opacity="0.8" />
      <path d="M8 8H34" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="17" cy="35" r="2" fill="#ffffff" />
      <circle cx="27" cy="39" r="1.5" fill="#ffffff" />
    </g>
    <g transform="translate(35 49)">
      <path d="M2 0H26" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
      <path d="M7 2V33M15 2V33M23 2V33" stroke="#64748b" strokeWidth="2" />
      <path d="M5 21H9V31C9 35 5 35 5 31V21Z" fill="#f472b6" />
      <path d="M13 15H17V31C17 35 13 35 13 31V15Z" fill="#fbbf24" />
      <path d="M21 25H25V31C25 35 21 35 21 31V25Z" fill="#34d399" />
    </g>
  </svg>
);

export const AnimalCellCardSVG = ({ className = "h-32 w-full" }: FoundationCardSVGProps) => (
  <svg {...svgProps} className={className}>
    <circle cx="100" cy="60" r="51" fill="#ede9fe" opacity="0.9" />
    <path d="M43 61C43 34 67 20 96 24C124 17 157 36 157 61C162 88 130 103 101 96C70 103 39 88 43 61Z" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="3" />
    <circle cx="96" cy="58" r="21" fill="#c4b5fd" stroke="#6d28d9" strokeWidth="2.5" />
    <circle cx="91" cy="54" r="8" fill="#7c3aed" />
    <circle cx="88" cy="51" r="2.5" fill="#ffffff" opacity="0.75" />
    <g fill="#fb7185" stroke="#be123c" strokeWidth="1.5">
      <path d="M57 48C64 40 74 43 76 50C72 57 62 58 57 48Z" />
      <path d="M121 73C128 64 140 67 142 75C136 82 126 82 121 73Z" />
    </g>
    <g stroke="#ffffff" strokeWidth="1.5" opacity="0.9">
      <path d="M61 48C65 46 69 51 73 49" />
      <path d="M125 73C130 70 135 77 139 73" />
    </g>
    <g stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round">
      <path d="M121 43C129 38 139 40 144 46" />
      <path d="M120 48C130 44 140 47 145 52" />
      <path d="M119 53C128 51 138 54 142 58" />
    </g>
    <g fill="#22c55e">
      <circle cx="70" cy="76" r="4" />
      <circle cx="117" cy="33" r="3" />
      <circle cx="147" cy="64" r="3" />
    </g>
    <g fill="#38bdf8" opacity="0.85">
      <circle cx="61" cy="62" r="5" />
      <circle cx="111" cy="82" r="4" />
    </g>
  </svg>
);

export const LeafCellCardSVG = ({ className = "h-32 w-full" }: FoundationCardSVGProps) => (
  <svg {...svgProps} className={className}>
    <circle cx="100" cy="60" r="50" fill="#d1fae5" opacity="0.85" />
    <path d="M25 72C34 36 64 20 93 27C82 59 56 78 25 72Z" fill="#4ade80" opacity="0.8" />
    <path d="M30 69C52 56 66 45 88 31" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
    <rect x="68" y="25" width="105" height="73" rx="12" fill="#f0fdf4" stroke="#047857" strokeWidth="4" />
    <rect x="76" y="33" width="89" height="57" rx="8" fill="#dcfce7" stroke="#86efac" strokeWidth="2" />
    <rect x="94" y="40" width="59" height="43" rx="16" fill="#bae6fd" opacity="0.78" stroke="#38bdf8" strokeWidth="2" />
    <circle cx="86" cy="61" r="9" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
    <g fill="#22c55e" stroke="#047857" strokeWidth="1.2">
      <ellipse cx="84" cy="42" rx="7" ry="3.5" transform="rotate(-18 84 42)" />
      <ellipse cx="84" cy="79" rx="7" ry="3.5" transform="rotate(18 84 79)" />
      <ellipse cx="157" cy="44" rx="7" ry="3.5" transform="rotate(20 157 44)" />
      <ellipse cx="158" cy="77" rx="7" ry="3.5" transform="rotate(-20 158 77)" />
      <ellipse cx="116" cy="36" rx="7" ry="3.5" />
      <ellipse cx="118" cy="87" rx="7" ry="3.5" />
    </g>
  </svg>
);

export const HumanBloodCellsCardSVG = ({ className = "h-32 w-full" }: FoundationCardSVGProps) => (
  <svg {...svgProps} className={className}>
    <circle cx="100" cy="60" r="51" fill="#ffe4e6" />
    <circle cx="100" cy="60" r="44" fill="#fff1f2" stroke="#fda4af" strokeWidth="3" />
    <g fill="#fb7185" stroke="#e11d48" strokeWidth="2">
      <ellipse cx="61" cy="44" rx="15" ry="9" transform="rotate(-18 61 44)" />
      <ellipse cx="135" cy="38" rx="15" ry="9" transform="rotate(18 135 38)" />
      <ellipse cx="142" cy="78" rx="15" ry="9" transform="rotate(-15 142 78)" />
      <ellipse cx="62" cy="82" rx="15" ry="9" transform="rotate(15 62 82)" />
    </g>
    <g fill="#fecdd3">
      <ellipse cx="61" cy="44" rx="7" ry="3.5" transform="rotate(-18 61 44)" />
      <ellipse cx="135" cy="38" rx="7" ry="3.5" transform="rotate(18 135 38)" />
      <ellipse cx="142" cy="78" rx="7" ry="3.5" transform="rotate(-15 142 78)" />
      <ellipse cx="62" cy="82" rx="7" ry="3.5" transform="rotate(15 62 82)" />
    </g>
    <circle cx="101" cy="61" r="20" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
    <path d="M89 60C87 49 97 45 103 52C108 44 119 51 114 61C121 67 113 77 104 70C98 79 87 71 91 64Z" fill="#7c3aed" />
    <g fill="#f59e0b">
      <circle cx="84" cy="30" r="3" />
      <circle cx="118" cy="88" r="2.5" />
      <circle cx="151" cy="58" r="2.5" />
      <circle cx="47" cy="63" r="2" />
    </g>
  </svg>
);

export const ExperimentChemicalsCardSVG = ({ className = "h-32 w-full" }: FoundationCardSVGProps) => (
  <svg {...svgProps} className={className}>
    <circle cx="100" cy="59" r="50" fill="#ffedd5" opacity="0.9" />
    <path d="M24 91H176" stroke="#9a3412" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
    <g transform="translate(33 30)">
      <rect x="0" y="13" width="28" height="48" rx="5" fill="#ffffff" stroke="#c2410c" strokeWidth="2.5" />
      <rect x="5" y="0" width="18" height="16" rx="3" fill="#fdba74" stroke="#c2410c" strokeWidth="2" />
      <rect x="5" y="30" width="18" height="17" rx="3" fill="#fb923c" opacity="0.75" />
    </g>
    <g transform="translate(73 23)">
      <path d="M12 0V21L1 55C-1 62 4 67 11 67H48C55 67 60 62 58 55L47 21V0" fill="#fff7ed" stroke="#ea580c" strokeWidth="2.5" />
      <path d="M7 48C20 42 38 56 53 47L58 58C57 63 53 65 48 65H11C6 65 2 61 3 57L7 48Z" fill="#fbbf24" />
      <path d="M12 9H47" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="23" cy="51" r="3" fill="#ffffff" opacity="0.7" />
      <circle cx="39" cy="57" r="2" fill="#ffffff" opacity="0.7" />
    </g>
    <g transform="translate(142 32)">
      <rect x="0" y="9" width="27" height="50" rx="5" fill="#fffbeb" stroke="#b45309" strokeWidth="2.5" />
      <rect x="5" width="17" height="12" rx="3" fill="#f59e0b" />
      <path d="M13.5 20L23 36L13.5 52L4 36L13.5 20Z" fill="#fff7ed" stroke="#ef4444" strokeWidth="2" />
      <path d="M13.5 28V38" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="13.5" cy="44" r="1.8" fill="#ef4444" />
    </g>
  </svg>
);

export const ExternalMuscleCardSVG = ({ className = "h-32 w-full" }: FoundationCardSVGProps) => (
  <svg {...svgProps} className={className}>
    <circle cx="100" cy="59" r="51" fill="#ffe4e6" opacity="0.9" />
    <circle cx="100" cy="25" r="12" fill="#fecaca" stroke="#be123c" strokeWidth="2" />
    <path d="M82 42C72 48 66 59 67 72L77 69L80 94H91L96 66H104L109 94H120L123 69L133 72C134 59 128 48 118 42C107 38 93 38 82 42Z" fill="#fff1f2" stroke="#9f1239" strokeWidth="2.5" strokeLinejoin="round" />
    <g fill="#fb7185" stroke="#be123c" strokeWidth="1.2">
      <path d="M86 43C91 40 96 40 99 43L96 57C89 57 84 52 86 43Z" />
      <path d="M101 43C105 40 111 40 115 43C117 52 111 57 104 57L101 43Z" />
      <path d="M82 57C86 59 91 61 96 61L92 77C86 75 81 69 82 57Z" />
      <path d="M104 61C109 61 114 59 118 57C119 69 114 75 108 77L104 61Z" />
      <path d="M81 78L91 80L88 93H80L81 78Z" />
      <path d="M109 80L119 78L120 93H112L109 80Z" />
      <path d="M69 57C75 51 80 48 84 48L81 61L69 68V57Z" />
      <path d="M116 48C121 48 126 51 131 57V68L119 61L116 48Z" />
    </g>
    <path d="M100 42V91" stroke="#ffffff" strokeWidth="2" opacity="0.85" />
  </svg>
);

export const InternalMuscleCardSVG = ({ className = "h-32 w-full" }: FoundationCardSVGProps) => (
  <svg {...svgProps} className={className}>
    <circle cx="100" cy="59" r="51" fill="#ede9fe" opacity="0.95" />
    <circle cx="100" cy="24" r="11" fill="#ddd6fe" stroke="#5b21b6" strokeWidth="2" />
    <path d="M83 41C74 48 72 61 76 73L82 94H94L97 70H103L106 94H118L124 73C128 61 126 48 117 41C107 37 93 37 83 41Z" fill="#faf5ff" stroke="#5b21b6" strokeWidth="2.5" />
    <path d="M100 42V89" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
    <g stroke="#a78bfa" strokeWidth="2" strokeLinecap="round">
      <path d="M87 47C92 50 96 51 100 51C104 51 108 50 113 47" />
      <path d="M84 54C90 57 95 58 100 58C105 58 110 57 116 54" />
      <path d="M82 62C89 65 95 66 100 66C106 66 112 65 119 62" />
    </g>
    <g fill="#8b5cf6" stroke="#5b21b6" strokeWidth="1.2">
      <path d="M84 70C88 65 94 65 97 70L94 84C88 82 84 77 84 70Z" />
      <path d="M103 70C106 65 112 65 116 70C116 77 112 82 106 84L103 70Z" />
      <path d="M79 49C75 55 75 64 79 70L85 64L84 49H79Z" />
      <path d="M121 49C125 55 125 64 121 70L115 64L116 49H121Z" />
    </g>
    <path d="M91 42C89 52 91 61 97 66M109 42C111 52 109 61 103 66" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const GoodBadMineralsCardSVG = ({ className = "h-32 w-full" }: FoundationCardSVGProps) => (
  <svg {...svgProps} className={className}>
    <path d="M18 20C18 13 24 8 31 8H99V112H31C24 112 18 107 18 100V20Z" fill="#ecfdf5" />
    <path d="M99 8H169C176 8 182 13 182 20V100C182 107 176 112 169 112H99V8Z" fill="#fff7ed" />
    <path d="M100 17V103" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 5" />
    <g transform="translate(32 42)">
      <path d="M5 35L18 5L42 0L60 22L50 47H18L5 35Z" fill="#67e8f9" stroke="#0891b2" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 5L29 25L42 0M29 25L60 22M29 25L18 47" stroke="#cffafe" strokeWidth="2" />
      <circle cx="50" cy="8" r="14" fill="#10b981" stroke="#ffffff" strokeWidth="3" />
      <path d="M43 8L48 13L57 3" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform="translate(112 44)">
      <path d="M4 32L17 6L39 0L58 18L51 45H18L4 32Z" fill="#fdba74" stroke="#c2410c" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M17 6L28 23L39 0M28 23L58 18M28 23L18 45" stroke="#ffedd5" strokeWidth="2" />
      <path d="M48 0L63 26H33L48 0Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
      <path d="M48 8V17" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="48" cy="22" r="1.8" fill="#ffffff" />
    </g>
  </svg>
);
