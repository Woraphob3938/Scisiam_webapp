"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sliders,
  RotateCcw,
  ClipboardList,
  Activity,
  Zap,
  Sparkles,
  Clipboard,
  Download,
  Trash,
  Eye,
  Target,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import ManualNumberInput from "@/components/labs/simulation/ManualNumberInput";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedShadowRun {
  index: number;
  lightDistance: number; // cm
  transparency: string;
  lightState: string;
  shadowWidth: number; // px representation
  shadowDarkness: string;
}

export default function LightShadowsSimulation() {
  const router = useRouter();
  const labId = "light-and-shadows";

  const [lightDistance, setLightDistance] = useState<number>(40); // cm from flashlight
  const [transparency, setTransparency] = useState<"opaque" | "translucent" | "transparent">("opaque");
  const [lightOn, setLightOn] = useState<boolean>(false);

  const [loggedRuns, setLoggedRuns] = useState<LoggedShadowRun[]>([]);

  // Simulation calculations:
  // Shadow size (width) = BaseSize * (TotalDistance / distanceToObject)
  // Closer to source (small lightDistance) = Bigger shadow
  const shadowWidth = useMemo(() => {
    if (!lightOn) return 0;
    const totalDist = 100; // cm from flashlight to screen
    const baseSize = 25;
    // geometric scaling
    const scale = totalDist / Math.max(10, lightDistance);
    return Math.min(100, Math.round(baseSize * scale));
  }, [lightDistance, lightOn]);

  const shadowDarkness = useMemo(() => {
    if (!lightOn) return "0.0";
    if (transparency === "opaque") return "0.9";
    if (transparency === "translucent") return "0.4";
    return "0.05";
  }, [transparency, lightOn]);

  const handleAddLog = () => {
    const run: LoggedShadowRun = {
      index: loggedRuns.length + 1,
      lightDistance,
      transparency: transparency === "opaque" ? "ทึบแสง (Opaque)" : transparency === "translucent" ? "โปร่งแสง (Translucent)" : "โปร่งใส (Transparent)",
      lightState: lightOn ? "เปิดไฟ" : "ปิดไฟ",
      shadowWidth,
      shadowDarkness: transparency === "opaque" ? "เข้มมาก" : transparency === "translucent" ? "จาง/มีสี" : "จางจนเกือบมองไม่เห็น"
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setLightDistance(40);
    setTransparency("opaque");
    setLightOn(false);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุดที่\tระยะจากไฟฉาย (cm)\tความโปร่งแสงวัตถุ\tสถานะไฟฉาย\tขนาดของเงา (px)\tระดับความเข้มเงา\n";
    const rows = loggedRuns.map((r) => `${r.index}\t${r.lightDistance}\t${r.transparency}\t${r.lightState}\t${r.shadowWidth}\t${r.shadowDarkness}`);
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map((r) => `${r.index},${r.lightDistance},${r.transparency},${r.lightState},${r.shadowWidth},"${r.shadowDarkness}"`);
    const csv = "data:text/csv;charset=utf-8," + ["Index,LightDistance,Transparency,LightState,ShadowWidth,ShadowDarkness", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "light_and_shadows_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResults = async () => {
    if (loggedRuns.length === 0) {
      alert("กรุณากดบันทึกค่าพารามิเตอร์จำลองอย่างน้อย 1 ครั้งก่อนส่งออกรายงาน");
      return;
    }
    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_light_shadows_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "Light and Shadows",
      variables: { lightDistance, transparency, lightOn },
      liveValues: { shadowWidth, shadowDarkness },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.lightDistance, y: r.shadowWidth })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, maxShadow: Math.max(...loggedRuns.map((r) => r.shadowWidth)) },
      score: Math.min(100, Math.max(40, 40 + loggedRuns.length * 15)),
      durationSeconds: null
    });
    alert("บันทึกรายงานผลการเกิดเงาและแสงเดินทางสำเร็จ");
    router.push(`/labs/${labId}`);
  };

  const questProgress = Math.min(100, Math.round((loggedRuns.length / 3) * 100));

  return (
    <SharedSimulationShell
      accent="blue"
      labId="light-and-shadows"
      category="Physics"
      title="Light and Shadows"
      subtitle="เรียนรู้เรื่องเงาและการเดินทางเป็นเส้นตรงของแสงผ่านการยืดหดระยะห่างของเล่นและส่องทะลุเนื้อวัตถุประเภทต่างๆ"
      statusLabel={`ระบบ: ${lightOn ? "เปิดไฟส่องสว่าง" : "ปิดสวิตช์ไฟฉาย"}`}
      icon={Eye}
      sceneTitle="วิชวลแสดงการฉายแสงเงาตกกระทบ (Projection Screen)"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-blue-100 bg-slate-950 p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />

          {/* Flashlight projecting light cone and shadow */}
          <div className="relative flex-grow flex items-center justify-center pb-6">
            <svg viewBox="0 0 200 120" className="w-full max-w-[280px] h-auto overflow-visible">
              {/* Flashlight source (left: x=15, y=60) */}
              <g transform="translate(15, 60)">
                <rect x="-10" y="-5" width="20" height="10" fill="#475569" rx="1.5" />
                <rect x="5" y="-8" width="6" height="16" fill="#64748b" rx="1" />
                <polygon points="11,-8 11,8 15,12 15,-12" fill="#94a3b8" />
              </g>

              {/* Light Cone (yellow projection) */}
              {lightOn && <polygon points="30,60 170,20 170,100" fill="rgba(253, 224, 71, 0.18)" stroke="rgba(253, 224, 71, 0.4)" strokeWidth="1.2" strokeDasharray="2,2" />}

              {/* Blocker Object in the middle (x=lightDistance + 30) */}
              {lightOn && (
                <g transform={`translate(${lightDistance * 1.35 + 30}, 60)`}>
                  {/* Blocker Ball design */}
                  <circle cx="0" cy="0" r="10" fill={transparency === "opaque" ? "#b45309" : transparency === "translucent" ? "rgba(16, 185, 129, 0.7)" : "rgba(186, 230, 253, 0.3)"} stroke={transparency === "opaque" ? "#78350f" : transparency === "translucent" ? "#10b981" : "#38bdf8"} strokeWidth="1.5" />
                  <text x="0" y="16" fill="#94a3b8" fontSize="5.5" fontWeight="bold" textAnchor="middle">
                    ของเล่น
                  </text>
                </g>
              )}

              {/* Wall Screen (right: x=170) */}
              <line x1="170" y1="10" x2="170" y2="110" stroke="#cbd5e1" strokeWidth="4" />
              <text x="180" y="62" fill="#cbd5e1" fontSize="6.5" fontWeight="bold">
                ฉากรับเงา
              </text>

              {/* Shadow on the wall screen */}
              {lightOn && shadowWidth > 0 && <rect x="169" y={60 - shadowWidth / 2} width="3" height={shadowWidth} fill={transparency === "translucent" ? "#047857" : "#020617"} opacity={shadowDarkness} rx="1" />}

              {/* Dimension label showing distance */}
              {lightOn && (
                <g>
                  <line x1="30" y1="110" x2={lightDistance * 1.35 + 30} y2="110" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                  <text x={(lightDistance * 1.35 + 60) / 2} y="116" fill="#94a3b8" fontSize="5" fontWeight="bold" textAnchor="middle">
                    ระยะ: {lightDistance} cm
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>
      }
      controlsTitle="ควบคุมการทดลองแสงและเงา"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-blue-500" />
              1. ปรับระยะทางและสวิตช์ไฟ
            </h3>

            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-500">สถานะปุ่มไฟฉาย</label>
              <button type="button" onClick={() => setLightOn(!lightOn)} className={`px-3 py-1.5 text-xs font-black rounded-lg border transition-all cursor-pointer ${lightOn ? "bg-amber-50 border-amber-200 text-amber-700 font-extrabold" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                {lightOn ? "💡 เปิดไฟ" : "🔌 ปิดไฟ"}
              </button>
            </div>

            <ManualNumberInput label="ระยะห่างของเล่นจากไฟฉาย (cm)" ariaLabel="ระยะห่างของเล่น" value={lightDistance} min={15} max={85} step={5} onChange={setLightDistance} tone="blue" />
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Activity className="h-4.5 w-4.5 text-blue-500" />
              2. เลือกประเภทวัสดุของเล่น
            </h3>

            <div className="grid grid-cols-3 gap-1.5">
              {(["opaque", "translucent", "transparent"] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setTransparency(mode)} className={`rounded-xl border py-2 text-[10px] font-bold transition-all cursor-pointer ${transparency === mode ? "border-blue-600 bg-blue-50 text-blue-700 font-black" : "border-slate-200 bg-white text-slate-500"}`}>
                  {mode === "opaque" ? "ทึบแสง" : mode === "translucent" ? "โปร่งแสง" : "โปร่งใส"}
                </button>
              ))}
            </div>
          </section>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleAddLog} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-97 cursor-pointer">
              <ClipboardList className="h-3.5 w-3.5 text-blue-500" />
              จดบันทึกผล
            </button>
            <button onClick={handleReset} className="flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2.5 text-xs font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-50 active:scale-97 cursor-pointer">
              <RotateCcw className="h-3.5 w-3.5" />
              ตั้งใหม่ (Reset)
            </button>
          </div>
        </div>
      }
      compactControls={
        <div className="flex items-center gap-2 font-sans flex-wrap">
          <button onClick={() => setLightDistance((d) => Math.max(15, d - 10))} className="px-2 py-1 text-xs font-bold rounded bg-slate-100">
            Distance -10cm
          </button>
          <button onClick={() => setLightDistance((d) => Math.min(85, d + 10))} className="px-2 py-1 text-xs font-bold rounded bg-slate-100">
            Distance +10cm
          </button>
          <button onClick={handleReset} className="px-2 py-1 text-xs font-bold rounded bg-blue-500 text-white">
            Reset
          </button>
        </div>
      }
      metrics={[
        { label: "ความกว้างเงาที่ฉากรับ", value: `${shadowWidth} พิกเซล`, tone: "blue" },
        { label: "ระดับความโปร่งใสของยีน", value: transparency === "opaque" ? "ทึบแสงค้าง" : transparency === "translucent" ? "กึ่งโปร่งแสง" : "โปร่งใสทะลุ", tone: "blue" },
        { label: "ระยะทางจำลองวัตถุ", value: `${lightDistance} เซนติเมตร`, tone: "orange" },
        { label: "ระดับความเข้มของเงา", value: transparency === "opaque" ? "เข้มสุด (90%)" : transparency === "translucent" ? "จางลง (40%)" : "แทบไม่มี (5%)", tone: undefined }
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-blue-600" />
              ขนาดของเงาต่อระยะห่างจากไฟฉาย (Shadow Width vs Distance)
            </h3>
          </div>
          <div className="flex-grow flex items-center justify-center">
            {loggedRuns.length === 0 ? (
              <div className="text-xs text-slate-400">จดบันทึกการวัดตำแหน่งเพื่อจุดพลอตกราฟ</div>
            ) : (
              <svg viewBox="0 0 200 120" className="w-full max-w-[240px] h-auto">
                <line x1="15" y1="100" x2="185" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="15" y1="10" x2="15" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                {loggedRuns.map((r, i) => {
                  const cx = 15 + (r.lightDistance / 100) * 165;
                  const cy = 100 - (r.shadowWidth / 100) * 80;
                  return (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="3" fill="#3b82f6" />
                      {i > 0 && <line x1={15 + (loggedRuns[i - 1].lightDistance / 100) * 165} y1={100 - (loggedRuns[i - 1].shadowWidth / 100) * 80} x2={cx} y2={cy} stroke="#93c5fd" strokeWidth="1.2" />}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <ClipboardList className="h-4.5 w-4.5 text-blue-500" />
              สมุดจดบันทึกขนาดเงาของเด็กๆ
            </h3>
            {loggedRuns.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={handleCopyData} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                  <Clipboard className="h-3 w-3" /> คัดลอก
                </button>
                <button onClick={handleExportCSV} className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                  <Download className="h-3 w-3" /> CSV
                </button>
              </div>
            )}
          </div>
          {loggedRuns.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-xs text-slate-400 py-10">ยังไม่มีการจดบันทึก</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center">ที่</th>
                    <th className="p-2">ระยะ (cm)</th>
                    <th className="p-2">ชนิดของวัตถุ</th>
                    <th className="p-2">สถานะไฟ</th>
                    <th className="p-2">ขนาดของเงา</th>
                    <th className="p-2">ระดับสีเงา</th>
                    <th className="p-2 text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  {loggedRuns.map((r) => (
                    <tr key={r.index} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-bold">{r.index}</td>
                      <td className="p-2">{r.lightDistance} cm</td>
                      <td className="p-2 font-sans">{r.transparency}</td>
                      <td className="p-2 font-sans">{r.lightState}</td>
                      <td className="p-2 text-blue-700 font-bold">{r.shadowWidth} px</td>
                      <td className="p-2 font-sans">{r.shadowDarkness}</td>
                      <td className="p-2 text-center">
                        <button onClick={() => handleClearLog(r.index)} className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                          <Trash className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      }
      learningGoals={["ทำความเข้าใจว่าแสงเดินทางออกจากแหล่งกำเนิดแสง (ไฟฉาย) เป็นเส้นตรงเสมอ", "สังเกตว่าเมื่อมีวัตถุมาขวางทางแสง จะเกิดเงาขึ้นด้านหลังของวัตถุบนฉากรับเงา", "ศึกษาความสัมพันธ์ของระยะห่างของเล่นกับขนาดของเงา (ยิ่งใกล้ไฟฉาย เงายิ่งกว้างใหญ่)"]}
      steps={[
        { label: "เปิดสวิตช์ไฟฉายเพื่อเริ่มฉายลำแสง และเลือกระยะห่างของเล่นที่ต้องการทดสอบ", icon: Sliders },
        { label: "เลือกชนิดของของเล่นว่าปล่อยให้แสงส่องทะลุผ่านได้มากน้อยเพียงใด", icon: Target },
        { label: "สังเกตความกว้างและสีของเงาที่เกิดขึ้นบนฉากรับด้านหลังว่าแตกต่างกันอย่างไร", icon: Zap },
        { label: "จดบันทึกขนาดของเงาลงในตารางสถิติเพื่อเก็บไว้เปรียบเทียบในสมุดบันทึกผล", icon: ClipboardList }
      ]}
      progressLabel="ความคืบหน้าการทดลองแสง"
      progressValue={questProgress === 100 ? "วิเคราะห์และวัดขนาดแสงและเงาสำเร็จแล้วจ้า!" : `เก็บสถิติได้ ${loggedRuns.length}/3 รอบ`}
      progressPercent={questProgress}
      tips={["ถ้าเอาของเล่นขยับเข้าใกล้ไฟฉายมากๆ จะขวางลำแสงมุมกว้างขึ้น ทำให้เกิดเงาขนาดใหญ่บนฉากรับด้านหลัง", "วัตถุโปร่งแสง (Translucent) เช่น ขวดน้ำสีเขียว จะเกิดเงาจางๆ ที่มีสีเขียวอมตามสีของขวดน้ำนะเด็ดๆ", "วัตถุโปร่งใส (Transparent) เช่น พลาสติกใสหรือกระจกเงา แสงจะเดินทางทะลุผ่านไปได้เกือบหมดจนแทบไม่เกิดเงาเลย"]}
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">แสงและการเกิดเงา (Light and Shadows)</p>
          <p className="mb-3">เรื่องน่ารู้สำหรับเด็กๆ เกี่ยวกับเงาแสนวิเศษในบ้านของเรา:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>การเดินทางของแสง:</strong> แสงวิ่งออกจากหลอดไฟหรือดวงอาทิตย์เป็นเส้นตรงไปข้างหน้าอย่างไร้ทิศทางเบี่ยงเบน
            </li>
            <li>
              <strong>การเกิดเงา:</strong> เมื่อมีอะไรทึบๆ มาบังเส้นทางเดินตรงของแสง บริเวณหลังสิ่งนั้นจะมืดลงเพราะไม่มีแสงส่องถึงเรียกว่าเกิด &apos;เงา&apos;
            </li>
            <li>
              <strong>วัตถุทึบแสง (Opaque):</strong> บังแสงได้ 100% จึงเกิดเงาที่เข้มขรึมและชัดเจนที่สุด เช่น ร่างกายคน หรือของเล่นไม้
            </li>
            <li>
              <strong>วัตถุกึ่งโปร่งแสง (Translucent):</strong> แสงทะลุผ่านได้บ้างบางส่วน เงาที่ได้จะจางและอาจมีสีสัน
            </li>
          </ul>
        </div>
      }
      onRun={() => setLightOn((current) => !current)}
      runLabel={lightOn ? "ปิดแสง" : "ทดลอง"}
      runActive={lightOn}
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
