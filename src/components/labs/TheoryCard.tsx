"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { getLabDetails, GraphConfigData } from "@/data/labDetails";

interface TheoryCardProps {
  labId: string;
}

interface TheoryGraphRendererProps {
  config: GraphConfigData;
}

function TheoryGraphRenderer({ config }: TheoryGraphRendererProps) {
  const {
    xTitle,
    yTitle,
    yLabels = [],
    xLabels = [],
    graphType,
    pathColor = "#3b82f6",
    customPath,
    solidLineCoords,
    dashedLineCoords,
  } = config;

  // Render specific complex graphs
  if (graphType === "mitosis") {
    const stages = ["I", "P", "M", "A", "T", "C"];
    return (
      <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {stages.map((label, index) => (
          <g key={label} transform={`translate(${28 + index * 29}, 55)`}>
            <circle r="15" fill={index === 0 ? "#cffafe" : index < 4 ? "#ede9fe" : "#dcfce7"} stroke={index === 0 ? "#06b6d4" : index < 4 ? "#8b5cf6" : "#22c55e"} strokeWidth="2.5" />
            <text y="5" fill="#0f172a" fontSize="11" fontWeight="900" textAnchor="middle">{label}</text>
            {index < 5 && <path d="M17 0H26" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />}
          </g>
        ))}
        <text x="100" y="100" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">Interphase → Prophase → Metaphase → Anaphase → Telophase</text>
      </svg>
    );
  }

  if (graphType === "mendelian") {
    return (
      <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="40" y="18" width="120" height="74" rx="16" fill="#faf5ff" stroke="#ddd6fe" strokeWidth="3" />
        <path d="M100 18V92M40 55H160" stroke="#ddd6fe" strokeWidth="3" />
        {["YY", "Yy", "Yy", "yy"].map((label, index) => (
          <text key={`${label}-${index}`} x={index % 2 ? 130 : 70} y={index > 1 ? 78 : 42} fill={label === "yy" ? "#475569" : "#16a34a"} fontSize="14" fontWeight="900" textAnchor="middle">{label}</text>
        ))}
        <text x="100" y="112" fill="#7c3aed" fontSize="9" fontWeight="900" textAnchor="middle">Genotype 1:2:1 / Phenotype 3:1</text>
      </svg>
    );
  }

  if (graphType === "enthalpy") {
    return (
      <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="20" y1="10" x2="20" y2="100" stroke="#cbd5e1" strokeWidth="1" />
        <text x="18" y="15" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">พลังงาน H</text>
        <line x1="30" y1="25" x2="100" y2="25" stroke="#475569" strokeWidth="3" />
        <text x="35" y="20" fill="#475569" fontSize="8" fontWeight="bold">NaOH(s) + HCl(aq)</text>
        <path d="M60 25 V85" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <path d="M57 78 L60 85 L63 78" stroke="#ef4444" strokeWidth="2" fill="none" />
        <text x="64" y="55" fill="#ef4444" fontSize="8" fontWeight="bold">ΔH1 (โดยตรง)</text>
        <line x1="110" y1="45" x2="185" y2="45" stroke="#475569" strokeWidth="3" />
        <text x="115" y="40" fill="#475569" fontSize="8" fontWeight="800">NaOH(aq) + HCl(aq)</text>
        <path d="M98 25 H140 V45" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M137 38 L140 45 L143 38" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
        <text x="144" y="32" fill="#3b82f6" fontSize="7" fontWeight="bold">ΔH2 (ละลาย)</text>
        <path d="M150 45 V85" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M147 78 L150 85 L153 78" stroke="#10b981" strokeWidth="1.5" fill="none" />
        <text x="154" y="65" fill="#10b981" fontSize="7" fontWeight="bold">ΔH3 (สะเทิน)</text>
        <line x1="30" y1="85" x2="185" y2="85" stroke="#475569" strokeWidth="3" />
        <text x="35" y="94" fill="#475569" fontSize="8" fontWeight="800">NaCl(aq) + H2O(l)</text>
      </svg>
    );
  }

  if (graphType === "le-chatelier") {
    return (
      <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="20" y1="20" x2="20" y2="104" stroke="#cbd5e1" strokeWidth="1" />
        <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">{yTitle}</text>
        <path d="M20,60 H80 L80,90 Q120,70 180,70" stroke={pathColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <line x1="80" y1="20" x2="80" y2="95" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" />
        <text x="84" y="25" fill="#3b82f6" fontSize="7" fontWeight="bold">รบกวนระบบ</text>
        <text x="190" y="108" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">{xTitle}</text>
      </svg>
    );
  }

  if (graphType === "solubility") {
    return (
      <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="20" y1="20" x2="20" y2="104" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="24" y1="56" x2="184" y2="56" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5 4" />
        <text x="188" y="59" fill="#8b5cf6" fontSize="7" fontWeight="bold">Ksp</text>
        <path d={customPath || "M28,88 C58,82 78,72 100,61 C122,50 148,36 180,25"} stroke={pathColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="111" cy="56" r="4" fill="#f43f5e" />
        <text x="115" y="47" fill="#f43f5e" fontSize="7" fontWeight="bold">เริ่มตกตะกอน</text>
        <text x="190" y="108" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">{xTitle}</text>
      </svg>
    );
  }

  if (graphType === "avogadro") {
    return (
      <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="20" y1="20" x2="20" y2="104" stroke="#cbd5e1" strokeWidth="1" />
        <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">{yTitle}</text>
        <line x1="28" y1="90" x2="180" y2="24" stroke={pathColor} strokeWidth="2.5" strokeLinecap="round" />
        {[0, 1, 2, 3].map((index) => (
          <circle key={index} cx={38 + index * 43} cy={86 - index * 19} r="3.5" fill="#06b6d4" />
        ))}
        <text x="104" y="44" fill={pathColor} fontSize="7" fontWeight="bold">Vm ≈ 22.4 L/mol</text>
        <text x="190" y="108" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">{xTitle}</text>
      </svg>
    );
  }

  if (graphType === "electrolysis") {
    return (
      <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="20" y1="20" x2="20" y2="104" stroke="#cbd5e1" strokeWidth="1" />
        <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">{yTitle}</text>
        <line x1="28" y1="92" x2="180" y2="26" stroke={pathColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M58,78 L58,95M108,56 L108,95M158,36 L158,95" stroke="#c4b5fd" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="118" y="30" fill={pathColor} fontSize="7" fontWeight="bold">m ∝ It</text>
        <text x="190" y="108" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">{xTitle}</text>
      </svg>
    );
  }

  // General grid calculation for line, curve, cooling, faraday, bernoulli, colligative, custom
  const N = yLabels.length;
  const M = xLabels.length;
  const ySpacing = N > 1 ? 75 / (N - 1) : 75;

  return (
    <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Y Grid lines and Y Labels */}
      {yLabels.map((lbl, idx) => {
        const y = 20 + idx * ySpacing;
        const isAxisLine = graphType === "cooling" ? idx === 3 : (graphType === "faraday" ? idx === 2 : false);
        return (
          <React.Fragment key={idx}>
            <line 
              x1="20" 
              y1={y} 
              x2="190" 
              y2={y} 
              stroke={isAxisLine ? "#cbd5e1" : "#f1f5f9"} 
              strokeWidth="1" 
            />
            <text x="18" y={y + 3} fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">{lbl}</text>
          </React.Fragment>
        );
      })}

      {/* Custom specific overlays for cooling */}
      {graphType === "cooling" && (
        <>
          <line x1="20" y1="95" x2="180" y2="95" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="185" y="97" fill="#10b981" fontSize="8" fontWeight="bold">Ts</text>
        </>
      )}

      {/* Plot path or lines */}
      {customPath && (
        <path d={customPath} stroke={pathColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {solidLineCoords && (
        <line 
          x1={solidLineCoords.x1} 
          y1={solidLineCoords.y1} 
          x2={solidLineCoords.x2} 
          y2={solidLineCoords.y2} 
          stroke={pathColor} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
      )}

      {dashedLineCoords && (
        <line 
          x1={dashedLineCoords.x1} 
          y1={dashedLineCoords.y1} 
          x2={dashedLineCoords.x2} 
          y2={dashedLineCoords.y2} 
          stroke="#f97316" 
          strokeWidth="1.8" 
          strokeDasharray="4 3" 
          strokeLinecap="round" 
        />
      )}

      {/* Specific lines for faraday wave */}
      {graphType === "faraday" && (
        <path d="M20,73 C40,43 60,103 100,73 C140,43 160,103 180,73" stroke={pathColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* Grid Y and X boundary axes */}
      <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="20" y1="20" x2="20" y2="110" stroke="#cbd5e1" strokeWidth="1" />

      {/* X labels */}
      {xLabels.map((lbl, idx) => {
        const xSpacing = M > 1 ? 160 / (M - 1) : 160;
        const x = 20 + idx * xSpacing;
        return (
          <text key={idx} x={x} y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">{lbl}</text>
        );
      })}

      {/* X axis title */}
      <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">{xTitle}</text>
    </svg>
  );
}

export default function TheoryCard({ labId }: TheoryCardProps) {
  const details = getLabDetails(labId);
  if (!details) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6">
      <h2 className="text-base font-bold text-slate-900 mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-500" />
        ทฤษฎีที่เกี่ยวข้อง
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-4 text-left">
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-[1.65]">
            {details.theoryDescription}
          </p>

          <div className="bg-slate-50 rounded-2xl border border-slate-200/70 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                สมการความสัมพันธ์
              </span>
              <div 
                className="text-lg sm:text-xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5"
                dangerouslySetInnerHTML={{ __html: details.equationHtml }}
              />
            </div>

            <div className="text-[11px] sm:text-xs text-slate-500 font-semibold space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto">
              {details.equationLabels.map((lbl, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className={`font-bold ${lbl.color || "text-indigo-600"}`}>{lbl.label}</span>
                  <span>= {lbl.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col items-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase mb-2 self-start lg:self-center">
            {details.graph.title}
          </span>

          <div className="w-full bg-slate-50 rounded-2xl border border-slate-200/70 p-3 select-none flex items-center justify-center">
            <TheoryGraphRenderer config={details.graph} />
          </div>
        </div>
      </div>
    </div>
  );
}
