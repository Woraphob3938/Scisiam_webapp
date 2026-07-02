"use client";

import React, { useState } from "react";
import SharedSimulationShell from "./SharedSimulationShell";
import { Info, HelpCircle, Activity, Disc } from "lucide-react";
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
  const [isSaving, setIsSaving] = useState(false);

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
        graphPoints: logs.map((l, idx) => ({
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
      window.alert("บันทึกการกระจายตัวของออร์บิทัลสำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const getMetricDisplay = () => [
    { label: "ระยะห่างระหว่างนิวเคลียส", value: `${bondDistance.toFixed(2)} Å` },
    { label: "พลังงานรวมออร์บิทัล", value: `${currentEnergy.toFixed(2)} eV` },
    { label: "จำนวนระนาบบัพ (Nodal Planes)", value: `${selectedOrbital.nodeCount} ระนาบ` },
  ];

  // Render SVG contour lobes representing the Molecular Orbitals wavefunction
  const renderOrbitalLobes = () => {
    const scale = bondDistance / selectedMolecule.idealDistance;
    // Nucleus A: (150 - bondDistance * 40), Nucleus B: (150 + bondDistance * 40)
    const nA = 150 - bondDistance * 30;
    const nB = 150 + bondDistance * 30;

    const isH2 = selectedMolecule.id === "h2";
    const isSigma = selectedOrbital.id.includes("sigma");

    if (isH2) {
      if (isSigma) {
        // Bonding Sigma orbital (HOMO) -> single continuous oval density wave
        return (
          <g>
            <ellipse cx="150" cy="150" rx={Math.max(10, 50 / scale)} ry="30" fill="#3b82f6" opacity="0.6" />
          </g>
        );
      } else {
        // Antibonding Sigma* orbital (LUMO) -> 2 separate lobes of opposite phases (red/blue)
        return (
          <g>
            <circle cx={nA - 10} cy="150" r="22" fill="#ef4444" opacity="0.6" />
            <circle cx={nB + 10} cy="150" r="22" fill="#3b82f6" opacity="0.6" />
            {/* Nodal plane line */}
            <line x1="150" y1="100" x2="150" y2="200" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
          </g>
        );
      }
    } else {
      // CO molecule (asymmetric polar molecular orbital)
      if (selectedOrbital.id === "sigma5") {
        // Asymmetric polar bonding lobe skewed towards oxygen (high electronegativity)
        return (
          <g>
            <ellipse cx={nA + 10} cy="150" rx="30" ry="25" fill="#3b82f6" opacity="0.6" />
            <ellipse cx={nB - 5} cy="150" rx="42" ry="32" fill="#3b82f6" opacity="0.5" />
          </g>
        );
      } else {
        // Antibonding LUMO with nodes
        return (
          <g>
            <circle cx={nA - 15} cy="150" r="16" fill="#ef4444" opacity="0.6" />
            <circle cx={nA + 15} cy="150" r="16" fill="#3b82f6" opacity="0.6" />
            <circle cx={nB - 15} cy="150" r="22" fill="#3b82f6" opacity="0.6" />
            <circle cx={nB + 15} cy="150" r="22" fill="#ef4444" opacity="0.6" />
            <line x1="150" y1="100" x2="150" y2="200" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
          </g>
        );
      }
    }
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
        <div className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 min-h-[340px] relative w-full h-full">
          <svg viewBox="0 0 300 300" className="w-full max-w-sm h-auto drop-shadow-md">
            {/* Background space grid */}
            <circle cx="150" cy="150" r="120" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

            {/* Electron Wave Contour Lobes */}
            {renderOrbitalLobes()}

            {/* Atom Nuclei */}
            {/* Nucleus A */}
            <circle cx={150 - bondDistance * 30} cy="150" r="12" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
            <text x={150 - bondDistance * 30} y="153" className="text-[8px] fill-white font-bold" textAnchor="middle">
              {selectedMolecule.id === "h2" ? "H" : "C"}
            </text>

            {/* Nucleus B */}
            <circle cx={150 + bondDistance * 30} cy="150" r="12" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
            <text x={150 + bondDistance * 30} y="153" className="text-[8px] fill-white font-bold" textAnchor="middle">
              {selectedMolecule.id === "h2" ? "H" : "O"}
            </text>
          </svg>

          {/* Potential energy curve graph at bottom */}
          <div className="w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 h-28 relative">
            <span className="absolute left-2 top-1 text-[9px] font-bold text-slate-400">Morse Potential Energy Curve</span>
            <div className="w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 300 100">
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

          <div>
            <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>ระยะห่างบอนด์ระหว่างนิวเคลียส (r)</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">{bondDistance.toFixed(2)} Å</span>
            </div>
            <input
              type="range"
              min="0.40"
              max="2.50"
              step="0.05"
              value={bondDistance}
              onChange={(e) => setBondDistance(parseFloat(e.target.value))}
              className="w-full accent-cyan-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.40 Å (ทับซ้อนสูง)</span>
              <span>2.50 Å (สลายพันธะ)</span>
            </div>
          </div>

          <button
            onClick={handleLogResult}
            className="w-full py-2 border border-dashed border-cyan-300 dark:border-cyan-800 text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950/20 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
          >
            บันทึกค่าระยะนี้ลงตาราง
          </button>
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
      onSave={handleSave}
    />
  );
}
