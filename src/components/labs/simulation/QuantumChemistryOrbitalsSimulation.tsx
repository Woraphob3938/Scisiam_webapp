"use client";

import React, { useId, useState } from "react";
import SharedSimulationShell from "./SharedSimulationShell";
import CompactRangeControl from "./CompactRangeControl";
import { Info, Activity, Disc } from "lucide-react";
import { labsById } from "@/data/labs";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface MolecularOrbital {
  id: string;
  name: string;
  energyLevelEv: number;
  nodeCount: number;
  character: "Bonding" | "Antibonding" | "Non-bonding";
}

interface OrbitalLog {
  id: number;
  molecule: string;
  orbital: string;
  distance: string;
  energy: string;
  character: MolecularOrbital["character"];
  nodes: number;
}

const molecules = [
  {
    id: "h2",
    name: "ไฮโดรเจน (Hydrogen - H₂)",
    orbitals: [
      { id: "sigma1s", name: "1σ (Bonding HOMO)", energyLevelEv: -13.6, nodeCount: 0, character: "Bonding" as const },
      { id: "sigma1s_star", name: "1σ* (Antibonding LUMO)", energyLevelEv: 4.5, nodeCount: 1, character: "Antibonding" as const },
    ],
    idealDistance: 0.74,
  },
  {
    id: "co",
    name: "คาร์บอนมอนอกไซด์ (Carbon Monoxide - CO)",
    orbitals: [
      { id: "sigma5", name: "5σ (HOMO)", energyLevelEv: -14.0, nodeCount: 2, character: "Bonding" as const },
      { id: "pi2_star", name: "2π* (LUMO)", energyLevelEv: 1.2, nodeCount: 3, character: "Antibonding" as const },
    ],
    idealDistance: 1.13,
  }
];

export default function QuantumChemistryOrbitalsSimulation() {
  const labId = "quantum-chemistry-orbitals";
  const labData = labsById[labId];

  const [selectedMolecule, setSelectedMolecule] = useState(molecules[0]);
  const [selectedOrbital, setSelectedOrbital] = useState(molecules[0].orbitals[0]);
  const [bondDistance, setBondDistance] = useState(0.74); // Angstroms (0.4 to 2.5)
  const [logs, setLogs] = useState<OrbitalLog[]>([]);
  const [, setIsSaving] = useState(false);
  const orbitalPositiveId = useId().replace(/:/g, "");
  const orbitalNegativeId = useId().replace(/:/g, "");
  const orbitalGlowId = useId().replace(/:/g, "");
  const sceneCenterX = 230;
  const sceneCenterY = 112;
  const nucleusAX = sceneCenterX - bondDistance * 38;
  const nucleusBX = sceneCenterX + bondDistance * 38;

  // Calculate potential energy based on Morse Potential: V(r) = De * (1 - e^-a(r-re))^2 - De
  const getMorsePotential = (r: number) => {
    const De = 4.52; // dissociation energy in eV
    const a = 1.8; // potential width parameter
    const re = selectedMolecule.idealDistance; // equilibrium bond length
    const V = De * Math.pow(1 - Math.exp(-a * (r - re)), 2) - De;
    return V;
  };

  const currentEnergy = selectedOrbital.energyLevelEv + getMorsePotential(bondDistance) * 0.5;

  const DeToY = (d: number) => {
    const De = 4.52;
    const a = 1.8;
    const re = selectedMolecule.idealDistance;
    const V = De * Math.pow(1 - Math.exp(-a * (d - re)), 2) - De;
    return (V / 5) * 40 + 40;
  };


  const handleLogResult = () => {
    const isDuplicate = logs.some(
      l => l.molecule === selectedMolecule.name && l.orbital === selectedOrbital.name && l.distance === bondDistance.toFixed(2)
    );

    if (isDuplicate) {
      window.alert("การบันทึกระดับออร์บิทัลนี้มีอยู่แล้ว");
      return;
    }

    const newLog = {
      id: Date.now(),
      molecule: selectedMolecule.name,
      orbital: selectedOrbital.name,
      distance: bondDistance.toFixed(2),
      energy: currentEnergy.toFixed(2),
      character: selectedOrbital.character,
      nodes: selectedOrbital.nodeCount,
    };

    setLogs(prev => [newLog, ...prev]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleReset = () => {
    const defaultMolecule = molecules[0];
    setSelectedMolecule(defaultMolecule);
    setSelectedOrbital(defaultMolecule.orbitals[0]);
    setBondDistance(defaultMolecule.idealDistance);
  };

  const handleSave = async () => {
    if (logs.length === 0) {
      window.alert("กรุณาบันทึกข้อมูลตารางอย่างน้อย 1 รายการก่อนส่งผล");
      return;
    }

    setIsSaving(true);
    try {
      await saveExperimentAndSync({
        localStorageKey: "scisiam_saved_quantum_chemistry_orbitals_experiment",
        localPayload: {
          labId,
          timestamp: new Date().toISOString(),
          logs,
        },
        labId,
        title: "ออร์บิทัลเคมีควอนตัม",
        variables: { lastDistance: bondDistance },
        liveValues: {
          moleculeId: selectedMolecule.id,
          orbitalId: selectedOrbital.id,
          totalEnergyEv: currentEnergy,
        },
        graphPoints: logs.map((l) => ({
          x: parseFloat(l.distance),
          y: parseFloat(l.energy),
        })),
        tableRows: logs,
        summary: {
          moleculeTested: selectedMolecule.name,
          orbitalTested: selectedOrbital.name,
        },
        durationSeconds: 30,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const compactControls = (
    <CompactRangeControl
      label="ระยะพันธะระหว่างนิวเคลียส"
      symbol="r"
      value={bondDistance}
      min={0.4}
      max={2.5}
      step={0.05}
      precision={2}
      unit="Å"
      tone="cyan"
      onChange={setBondDistance}
    />
  );

  const getMetricDisplay = () => [
    { label: "ระยะห่างระหว่างนิวเคลียส", value: `${bondDistance.toFixed(2)} Å` },
    { label: "พลังงานรวมออร์บิทัล", value: `${currentEnergy.toFixed(2)} eV` },
    { label: "จำนวนระนาบบัพ (Nodal Planes)", value: `${selectedOrbital.nodeCount} ระนาบ` },
  ];

  // Render SVG contour lobes representing the Molecular Orbitals wavefunction
  const renderOrbitalLobes = () => {
    const scale = bondDistance / selectedMolecule.idealDistance;
    const isH2 = selectedMolecule.id === "h2";
    const isAntibonding = selectedOrbital.character === "Antibonding";

    if (isH2) {
      if (!isAntibonding) {
        return (
          <g filter={`url(#${orbitalGlowId})`}>
            <ellipse cx={sceneCenterX} cy={sceneCenterY} rx={Math.max(48, 78 / scale)} ry="48" fill={`url(#${orbitalPositiveId})`} opacity="0.3" />
            <ellipse cx={sceneCenterX} cy={sceneCenterY} rx={Math.max(38, 60 / scale)} ry="33" fill={`url(#${orbitalPositiveId})`} opacity="0.58" />
            <ellipse cx={sceneCenterX} cy={sceneCenterY} rx={Math.max(25, 42 / scale)} ry="20" fill="#2563eb" opacity="0.34" />
          </g>
        );
      }

      return (
        <g filter={`url(#${orbitalGlowId})`}>
          <ellipse cx={nucleusAX - 17} cy={sceneCenterY} rx="39" ry="36" fill={`url(#${orbitalPositiveId})`} opacity="0.68" />
          <ellipse cx={nucleusBX + 17} cy={sceneCenterY} rx="39" ry="36" fill={`url(#${orbitalNegativeId})`} opacity="0.68" />
          <rect x={sceneCenterX - 5} y="62" width="10" height="100" rx="5" fill="#ffffff" opacity="0.88" />
        </g>
      );
    }

    if (selectedOrbital.id === "sigma5") {
      return (
        <g filter={`url(#${orbitalGlowId})`}>
          <ellipse cx={nucleusAX - 16} cy={sceneCenterY} rx="53" ry="41" fill={`url(#${orbitalPositiveId})`} opacity="0.62" />
          <ellipse cx={nucleusBX - 8} cy={sceneCenterY} rx="39" ry="33" fill={`url(#${orbitalPositiveId})`} opacity="0.48" />
          <ellipse cx={nucleusAX - 48} cy={sceneCenterY} rx="18" ry="22" fill={`url(#${orbitalNegativeId})`} opacity="0.5" />
        </g>
      );
    }

    return (
      <g filter={`url(#${orbitalGlowId})`}>
        <ellipse cx={nucleusAX} cy={sceneCenterY - 31} rx="34" ry="23" fill={`url(#${orbitalPositiveId})`} opacity="0.7" />
        <ellipse cx={nucleusAX} cy={sceneCenterY + 31} rx="34" ry="23" fill={`url(#${orbitalNegativeId})`} opacity="0.7" />
        <ellipse cx={nucleusBX} cy={sceneCenterY - 31} rx="39" ry="26" fill={`url(#${orbitalNegativeId})`} opacity="0.7" />
        <ellipse cx={nucleusBX} cy={sceneCenterY + 31} rx="39" ry="26" fill={`url(#${orbitalPositiveId})`} opacity="0.7" />
        <rect x={sceneCenterX - 5} y="54" width="10" height="116" rx="5" fill="#ffffff" opacity="0.88" />
        <rect x="128" y={sceneCenterY - 4} width="204" height="8" rx="4" fill="#ffffff" opacity="0.78" />
      </g>
    );
  };

  return (
    <SharedSimulationShell
      accent="cyan"
      labId={labId}
      category={labData?.category || "Chemistry"}
      title={labData?.thaiTitle || labData?.title || "ออร์บิทัลเคมีควอนตัม"}
      subtitle={labData?.description || ""}
      statusLabel="พร้อมใช้งาน"
      icon={Disc}
      sceneTitle="แผนภาพความหนาแน่นอิเล็กตรอน (Orbital Probability Density)"
      scene={
        <div className="relative flex min-h-[340px] h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_center,#eef2ff_0%,#f8fafc_58%,#fdf2f8_100%)] p-4">
          <svg viewBox="0 0 460 260" className="h-auto w-full max-w-xl" role="img" aria-label={`ความหนาแน่นอิเล็กตรอนของออร์บิทัล ${selectedOrbital.name}`}>
            <title>ความหนาแน่นอิเล็กตรอนของโมเลกุล</title>
            <desc>สีฟ้าและสีชมพูแสดงเฟสตรงข้ามของฟังก์ชันคลื่น นิวเคลียสสองอะตอมห่างกันตามระยะพันธะที่ตั้งไว้</desc>
            <defs>
              <radialGradient id={orbitalPositiveId}>
                <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.95" />
                <stop offset="62%" stopColor="#60a5fa" stopOpacity="0.68" />
                <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.08" />
              </radialGradient>
              <radialGradient id={orbitalNegativeId}>
                <stop offset="0%" stopColor="#be123c" stopOpacity="0.92" />
                <stop offset="62%" stopColor="#fb7185" stopOpacity="0.66" />
                <stop offset="100%" stopColor="#ffe4e6" stopOpacity="0.08" />
              </radialGradient>
              <filter id={orbitalGlowId} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <text x="24" y="26" fill="#0f172a" fontSize="15" fontWeight="900">{selectedOrbital.name}</text>
            <rect x="344" y="10" width="92" height="28" rx="14" fill={selectedOrbital.character === "Bonding" ? "#dcfce7" : "#ffe4e6"} />
            <text x="390" y="28" textAnchor="middle" fill={selectedOrbital.character === "Bonding" ? "#047857" : "#be123c"} fontSize="11" fontWeight="900">
              {selectedOrbital.character === "Bonding" ? "พันธะ" : "ต้านพันธะ"}
            </text>
            <line x1="88" y1={sceneCenterY} x2="372" y2={sceneCenterY} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 5" />

            {renderOrbitalLobes()}

            <circle cx={nucleusAX} cy={sceneCenterY} r="14" fill="#1e293b" stroke="#ffffff" strokeWidth="3" />
            <text x={nucleusAX} y={sceneCenterY + 4} fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">
              {selectedMolecule.id === "h2" ? "H" : "C"}
            </text>
            <circle cx={nucleusBX} cy={sceneCenterY} r="14" fill="#1e293b" stroke="#ffffff" strokeWidth="3" />
            <text x={nucleusBX} y={sceneCenterY + 4} fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">
              {selectedMolecule.id === "h2" ? "H" : "O"}
            </text>

            {selectedOrbital.character === "Antibonding" && (
              <g>
                <line x1={sceneCenterX} y1="50" x2={sceneCenterX} y2="174" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 4" />
                <text x={sceneCenterX + 9} y="56" fill="#475569" fontSize="9" fontWeight="900">ระนาบโหนด</text>
              </g>
            )}

            <line x1={nucleusAX} y1="184" x2={nucleusBX} y2="184" stroke="#475569" strokeWidth="2" />
            <line x1={nucleusAX} y1="178" x2={nucleusAX} y2="190" stroke="#475569" strokeWidth="2" />
            <line x1={nucleusBX} y1="178" x2={nucleusBX} y2="190" stroke="#475569" strokeWidth="2" />
            <text x={sceneCenterX} y="205" textAnchor="middle" fill="#334155" fontSize="12" fontWeight="900">ระยะพันธะ {bondDistance.toFixed(2)} Å</text>

            <g transform="translate(24 232)">
              <circle cx="0" cy="0" r="8" fill="#3b82f6" opacity="0.85" /><text x="15" y="4" fill="#475569" fontSize="10" fontWeight="800">เฟสบวก</text>
              <circle cx="92" cy="0" r="8" fill="#ef4444" opacity="0.85" /><text x="107" y="4" fill="#475569" fontSize="10" fontWeight="800">เฟสลบ</text>
              <text x="255" y="4" fill="#475569" fontSize="10" fontWeight="900">พลังงาน {currentEnergy.toFixed(2)} eV · โหนด {selectedOrbital.nodeCount}</text>
            </g>
          </svg>

          {/* Potential energy curve graph at bottom */}
          <div className="w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 h-28 relative">
            <span className="absolute left-2 top-1 text-[9px] font-bold text-slate-400">Morse Potential Energy Curve</span>
            <div className="w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 300 100" role="img" aria-label="กราฟพลังงานศักย์มอร์สตามระยะพันธะ">
                <title>กราฟพลังงานศักย์มอร์ส</title>
                {/* Zero Energy baseline */}
                <line x1="30" y1="30" x2="270" y2="30" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />

                {/* Morse potential curve */}
                <path
                  d={`M 30 ${30 + DeToY(0.4)}
                      ${Array.from({ length: 45 }, (_, i) => {
                        const d = 0.4 + i * 0.05;
                        const rx = 30 + ((d - 0.4) / 2.1) * 240;
                        const V = DeToY(d);
                        return `L ${rx} ${30 + V}`;
                      }).join(" ")}`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />

                {/* Current distance locator marker */}
                <circle
                  cx={30 + ((bondDistance - 0.4) / 2.1) * 240}
                  cy={30 + DeToY(bondDistance)}
                  r="4"
                  fill="#ef4444"
                  className="animate-ping"
                />
                <circle
                  cx={30 + ((bondDistance - 0.4) / 2.1) * 240}
                  cy={30 + DeToY(bondDistance)}
                  r="3.5"
                  fill="#b91c1c"
                />



                {/* X Axis labels */}
                <text x="30" y="94" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">0.4 Å</text>
                <text x="150" y="94" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">1.45 Å</text>
                <text x="270" y="94" className="text-[8px] fill-slate-400 font-semibold" textAnchor="middle">2.5 Å</text>
              </svg>
            </div>
          </div>
        </div>
      }
      compactControls={compactControls}
      controlsTitle="ควบคุมพารามิเตอร์โมเลกุล"
      controls={
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">เลือกโมเลกุลอะตอมคู่</label>
            <div className="grid grid-cols-1 gap-1.5">
              {molecules.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMolecule(m);
                    setSelectedOrbital(m.orbitals[0]);
                    setBondDistance(m.idealDistance);
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-all ${
                    selectedMolecule.id === m.id
                      ? "bg-cyan-50 border-cyan-300 text-cyan-700 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-300 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-350 hover:bg-slate-50"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">เลือกระดับพลังงานออร์บิทัล</label>
            <div className="grid grid-cols-1 gap-1.5">
              {selectedMolecule.orbitals.map(o => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrbital(o)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-all ${
                    selectedOrbital.id === o.id
                      ? "bg-cyan-50 border-cyan-300 text-cyan-700 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-300 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-350 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{o.name}</span>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-500">{o.character}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      }
      metrics={getMetricDisplay()}
      graph={null}
      table={
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="p-3">โมเลกุล</th>
                <th className="p-3">ออร์บิทัลโมเลกุล</th>
                <th className="p-3">ระยะพันธะ (r - Å)</th>
                <th className="p-3">พลังงานรวม (eV)</th>
                <th className="p-3">ลักษณะออร์บิทัล</th>
                <th className="p-3">จำนวนบัพ</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 italic">ยังไม่มีการเก็บบันทึกออร์บิทัลเคมีควอนตัม</td>
                </tr>
              ) : (
                logs.map(l => (
                  <tr key={l.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{l.molecule.split(" (")[0]}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{l.orbital}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{l.distance} Å</td>
                    <td className="p-3 font-bold text-cyan-600 dark:text-cyan-400">{l.energy} eV</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{l.character}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{l.nodes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {logs.length > 0 && (
            <div className="p-2 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <button onClick={handleClearLogs} className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors">
                ล้างข้อมูล
              </button>
            </div>
          )}
        </div>
      }
      theory={
        <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>
            <strong>ออร์บิทัลโมเลกุล (Molecular Orbitals - MO)</strong> เกิดจากการนำออร์บิทัลอะตอม (Atomic Orbitals - AO) มารวมกันทางคณิตศาสตร์ตามวิธี LCAO (Linear Combination of Atomic Orbitals)
            สร้างฟังก์ชันคลื่นกระจายครอบคลุมนิวเคลียสทั้งหมดในโมเลกุล
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Bonding Orbital ($\sigma, \pi$)</strong>: เกิดจากการแทรกสอดแบบเสริมกันของฟังก์ชันคลื่น เพิ่มความหนาแน่นอิเล็กตรอนระหว่างนิวเคลียส ช่วยยึดเหนี่ยวโมเลกุลให้เสถียร (ไม่มีระนาบบัพระหว่างนิวเคลียส)</li>
            <li><strong>Antibonding Orbital ($\sigma^*, \pi^*$)</strong>: เกิดจากการแทรกสอดแบบหักล้างกัน มีระนาบบัพ (Nodal Plane) ที่ความหนาแน่นอิเล็กตรอนเท่ากับศูนย์ขวางอยู่ตรงกลางนิวเคลียส เพิ่มพลังงานให้สูงขึ้นและทำให้โมเลกุลไม่เสถียร</li>
            <li><strong>ศักย์ไฟฟ้ามอร์ส (Morse Potential)</strong>: เป็นแบบจำลองพลังงานศักย์ของพันธะโควาเลนต์ตามระยะห่างนิวเคลียส โดยจุดต่ำสุดของโค้งพลังงานจะระบุระยะพันธะสมดุล ($r_e$) ที่เสถียรที่สุด</li>
          </ul>
        </div>
      }
      steps={[
        { label: "เลือกโมเลกุลตัวอย่างเพื่อจำลองฟังก์ชันคลื่นพันธะ", icon: Activity },
        { label: "เลือกระดับพลังงานออร์บิทัลที่ต้องการวิเคราะห์รูปร่างคลื่น", icon: Activity },
        { label: "ปรับระยะห่างระหว่างนิวเคลียส (r) เพื่อสังเกตการบิดเบี้ยวของลูปเฟส", icon: Disc },
        { label: "วิเคราะห์ความสัมพันธ์เชิงพลังงานในกราฟ Morse Potential", icon: Info },
      ]}
      learningGoals={[
        "เข้าใจทฤษฎีออร์บิทัลโมเลกุลแบบ LCAO และความต่างของเฟสอิเล็กตรอน",
        "แยกแยะออร์บิทัลแบบ Bonding และ Antibonding ผ่านการดูจำนวนระนาบบัพ",
        "อธิบายจุดสมดุลพลังงานพันธะเคมีโดยใช้ความสัมพันธ์แบบ Morse Potential",
      ]}
      progressLabel="ระดับการสำรวจออร์บิทัล"
      progressValue={logs.length >= 2 ? "สำเร็จ" : `${logs.length} / 2`}
      progressPercent={Math.min((logs.length / 2) * 100, 100)}
      tips={[
        " HOMO คือ ออร์บิทัลพลังงานสูงสุดที่มีอิเล็กตรอนบรรจุอยู่ ส่วน LUMO คือ ออร์บิทัลว่างถัดไปที่มีพลังงานต่ำสุด",
        "เมื่อดึงอะตอมห่างออกจากกันจนพลังงานโค้งมอร์สลู่เข้าใกล้ 0 eV จะแสดงสภาวะการสลายพันธะโควาเลนต์โดยสมบูรณ์",
      ]}
      showLiveMetrics={true}
      showInfoTabs={true}
      showSaveButton={true}
      onRun={handleLogResult}
      runLabel="คำนวณออร์บิทัล"
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}

