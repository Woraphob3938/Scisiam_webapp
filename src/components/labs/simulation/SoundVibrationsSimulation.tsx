"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Sliders,
  RotateCcw,
  ClipboardList,
  Activity,
  Play,
  Zap,
  Sparkles,
  Clipboard,
  Download,
  Trash,
  Target,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface LoggedSoundRun {
  index: number;
  pitch: string; // "ต่ำ (Low)", "กลาง (Medium)", "สูง (High)"
  loudness: string; // "เบา (Soft)", "ปกติ (Normal)", "ดัง (Hard)"
  medium: string; // "อากาศ", "น้ำ", "เหล็ก"
  frequencyHz: number;
  amplitudeDb: number;
  travelSpeed: number; // m/s
}

export default function SoundVibrationsSimulation() {
  const labId = "sound-vibrations";

  const [pitch, setPitch] = useState<"low" | "medium" | "high">("medium");
  const [loudness, setLoudness] = useState<"soft" | "normal" | "hard">("normal");
  const [medium, setMedium] = useState<"air" | "water" | "steel">("air");

  // Vibration Play state
  const [isVibrating, setIsVibrating] = useState<boolean>(false);
  const [vibeOffset, setVibeOffset] = useState<number>(0);
  const [waveOffset, setWaveOffset] = useState<number>(0);

  const [loggedRuns, setLoggedRuns] = useState<LoggedSoundRun[]>([]);

  // Simulation derived values:
  const frequencyHz = useMemo(() => {
    if (pitch === "low") return 220;
    if (pitch === "medium") return 440;
    return 880;
  }, [pitch]);

  const amplitudeDb = useMemo(() => {
    if (loudness === "soft") return 40;
    if (loudness === "normal") return 65;
    return 90;
  }, [loudness]);

  const travelSpeed = useMemo(() => {
    // sound speed in different media: air ~343 m/s, water ~1482 m/s, steel ~5960 m/s
    if (medium === "water") return 1480;
    if (medium === "steel") return 5900;
    return 340;
  }, [medium]);

  // Animation ticks for vibration & wave traveling
  useEffect(() => {
    let animId: number;
    let waveId: number;

    if (isVibrating) {
      // String/tuning fork oscillation
      const freqFactor = pitch === "low" ? 0.2 : pitch === "medium" ? 0.4 : 0.8;
      const ampFactor = loudness === "soft" ? 3 : loudness === "normal" ? 7 : 15;

      let t = 0;
      const vibeTick = () => {
        t += freqFactor;
        setVibeOffset(Math.sin(t) * ampFactor);
        animId = requestAnimationFrame(vibeTick);
      };
      vibeTick();

      // Traveling wave offset
      const speedFactor = medium === "air" ? 2 : medium === "water" ? 6 : 12;
      const waveTick = () => {
        setWaveOffset((offset) => (offset + speedFactor) % 120);
        waveId = requestAnimationFrame(waveTick);
      };
      waveTick();
    }

    return () => {
      cancelAnimationFrame(animId);
      cancelAnimationFrame(waveId);
    };
  }, [isVibrating, pitch, loudness, medium]);

  const handleTriggerSound = () => {
    setIsVibrating(true);
    // Auto stop vibration after 2 seconds
    setTimeout(() => {
      setIsVibrating(false);
      setVibeOffset(0);
      setWaveOffset(0);
    }, 2000);
  };

  const handleAddLog = () => {
    const run: LoggedSoundRun = {
      index: loggedRuns.length + 1,
      pitch: pitch === "low" ? "ต่ำ (Low)" : pitch === "medium" ? "กลาง (Medium)" : "สูง (High)",
      loudness: loudness === "soft" ? "เบา (Soft)" : loudness === "normal" ? "ปกติ (Normal)" : "ดัง (Hard)",
      medium: medium === "air" ? "อากาศ" : medium === "water" ? "น้ำ" : "เหล็ก/ไม้",
      frequencyHz,
      amplitudeDb,
      travelSpeed
    };
    setLoggedRuns((prev) => [...prev, run]);
  };

  const handleClearLog = (idx: number) => {
    setLoggedRuns((prev) => prev.filter((r) => r.index !== idx));
  };

  const handleReset = () => {
    setPitch("medium");
    setLoudness("normal");
    setMedium("air");
    setIsVibrating(false);
    setVibeOffset(0);
    setWaveOffset(0);
    setLoggedRuns([]);
  };

  const handleCopyData = () => {
    const header = "ชุดที่\tระดับเสียง\tความดัง\tตัวกลาง\tความถี่ (Hz)\tความดัง (dB)\tความเร็วคลื่น (m/s)\n";
    const rows = loggedRuns.map((r) => `${r.index}\t${r.pitch}\t${r.loudness}\t${r.medium}\t${r.frequencyHz}\t${r.amplitudeDb}\t${r.travelSpeed}`);
    navigator.clipboard.writeText(header + rows.join("\n"));
    alert("คัดลอกข้อมูลลงคลิปบอร์ดแล้ว");
  };

  const handleExportCSV = () => {
    const rows = loggedRuns.map((r) => `${r.index},${r.pitch},${r.loudness},"${r.medium}",${r.frequencyHz},${r.amplitudeDb},${r.travelSpeed}`);
    const csv = "data:text/csv;charset=utf-8," + ["Index,Pitch,Loudness,Medium,FrequencyHz,AmplitudeDb,TravelSpeed", ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "sound_vibrations_log.csv");
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
      localStorageKey: "scisiam_saved_sound_vibrations_experiment",
      localPayload: { labId, timestamp: new Date().toLocaleString("th-TH"), loggedRuns },
      labId,
      title: "Sound Vibrations",
      variables: { pitch, loudness, medium },
      liveValues: { frequencyHz, amplitudeDb, travelSpeed },
      graphPoints: loggedRuns.map((r) => ({ index: r.index, x: r.frequencyHz, y: r.amplitudeDb })),
      tableRows: loggedRuns,
      summary: { runsCount: loggedRuns.length, maxDb: Math.max(...loggedRuns.map((r) => r.amplitudeDb)) },
      score: Math.min(100, Math.max(40, 40 + loggedRuns.length * 15)),
      durationSeconds: null
    });
    alert("บันทึกรายงานการสั่นสะเทือนเกิดเสียงสำเร็จ");
  };

  const questProgress = Math.min(100, Math.round((loggedRuns.length / 3) * 100));

  return (
    <SharedSimulationShell
      accent="blue"
      labId="sound-vibrations"
      category="Physics"
      title="Sound Vibrations"
      subtitle="เรียนรู้วิธีการเกิดเสียงจากการสั่นสะเทือนของวัตถุและตัวกลางที่คลื่นเสียงเคลื่อนที่ผ่านส่งตรงไปยังหูเรา"
      statusLabel={`ระบบ: ${isVibrating ? "วัตถุกำลังสั่นสะเทือน เกิดคลื่นเสียง!" : "สงบนิ่ง"}`}
      icon={Activity}
      sceneTitle="วิชวลแสดงการสั่นเกิดคลื่นเสียง (Soundwave Tube)"
      scene={
        <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#f0f9ff_0%,#e0f2fe_48%,#f8fafc_100%)] p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

          <div className="relative flex-grow flex items-center justify-center pb-6">
            <svg viewBox="0 0 200 120" className="w-full max-w-[280px] h-auto overflow-visible">
              {/* Sound Source (vibrating tuning fork/string) (left: x=25) */}
              <g transform="translate(25, 60)">
                {/* Tuning fork base stem */}
                <rect x="-3" y="10" width="6" height="15" fill="#475569" />
                {/* Left tine */}
                <path d={`M -6,10 L -6,-15 Q ${-6 + vibeOffset}, -15 ${-6 + vibeOffset}, -25`} fill="none" stroke="#64748b" strokeWidth="3" />
                {/* Right tine */}
                <path d={`M 6,10 L 6,-15 Q ${6 + vibeOffset}, -15 ${6 + vibeOffset}, -25`} fill="none" stroke="#64748b" strokeWidth="3" />
                <text x="0" y="32" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                  ซ่อมเสียง
                </text>
              </g>

              {/* Sound Wave Pulses traveling from x=45 to x=155 */}
              {isVibrating && (
                <g>
                  {Array.from({ length: 4 }).map((_, i) => {
                    const waveX = 45 + ((waveOffset + i * 30) % 110);
                    // Wave arcs matching the amplitude
                    const rValue = loudness === "soft" ? 5 : loudness === "normal" ? 10 : 18;
                    const strokeColor = pitch === "low" ? "#3b82f6" : pitch === "medium" ? "#8b5cf6" : "#ec4899";
                    return <path key={i} d={`M ${waveX}, ${60 - rValue} A ${rValue},${rValue} 0 0,1 ${waveX},${60 + rValue}`} fill="none" stroke={strokeColor} strokeWidth="2" opacity={Math.max(0, 1 - (waveX - 45) / 110)} />;
                  })}
                </g>
              )}

              {/* Recipient Ear (right: x=165) */}
              <g transform="translate(165, 60)">
                <path d="M 0,-15 A 15,15 0 0,1 0,15 L -5,12 A 10,10 0 0,0 -5,-12 Z" fill="#f59e0b" />
                <text x="0" y="24" fill="#d97706" fontSize="6" fontWeight="bold" textAnchor="middle">
                  หูผู้ฟัง
                </text>
              </g>
            </svg>
          </div>
        </div>
      }
      controlsTitle="ปุ่มวิทยุตั้งระดับเสียง"
      controls={
        <div className="flex flex-col gap-4 font-sans">
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Sliders className="h-4.5 w-4.5 text-blue-500" />
              1. ปรับระดับความดัง & ความสูงต่ำ
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500">ระดับเสียงความถี่ (Pitch / Frequency)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button key={p} type="button" onClick={() => setPitch(p)} className={`rounded-lg border py-1.5 text-xs font-bold transition-all cursor-pointer ${pitch === p ? "border-blue-600 bg-blue-50 text-blue-700 font-extrabold" : "border-slate-200 bg-white text-slate-500"}`}>
                    {p === "low" ? "เสียงต่ำ 🔉" : p === "medium" ? "เสียงกลาง 🔊" : "เสียงสูง ⚡"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500">ระดับความแรงสั่นสะเทือน (Loudness)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["soft", "normal", "hard"] as const).map((l) => (
                  <button key={l} type="button" onClick={() => setLoudness(l)} className={`rounded-lg border py-1.5 text-xs font-bold transition-all cursor-pointer ${loudness === l ? "border-blue-600 bg-blue-50 text-blue-700 font-extrabold" : "border-slate-200 bg-white text-slate-500"}`}>
                    {l === "soft" ? "เคาะเบา ๆ" : l === "normal" ? "เคาะปานกลาง" : "เคาะแรง ๆ"}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
              <Activity className="h-4.5 w-4.5 text-blue-500" />
              2. เลือกชนิดตัวกลางนำเสียง
            </h3>

            <div className="grid grid-cols-3 gap-1.5">
              {(["air", "water", "steel"] as const).map((m) => (
                <button key={m} type="button" onClick={() => setMedium(m)} className={`rounded-xl border py-2 text-[10px] font-black transition-all cursor-pointer ${medium === m ? "border-blue-600 bg-blue-50 text-blue-700 font-black" : "border-slate-200 bg-white text-slate-500"}`}>
                  {m === "air" ? "อากาศ" : m === "water" ? "น้ำเหลว" : "แผ่นเหล็ก"}
                </button>
              ))}
            </div>

            <button onClick={handleTriggerSound} disabled={isVibrating} className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer">
              <Play className="h-3.5 w-3.5" />
              เคาะซ่อมเสียงเพื่อสั่นสะเทือน
            </button>
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
          <button onClick={() => setMedium("air")} className="px-2 py-1 text-xs font-bold rounded bg-slate-100">
            Air
          </button>
          <button onClick={() => setMedium("steel")} className="px-2 py-1 text-xs font-bold rounded bg-slate-100">
            Steel
          </button>
          <button onClick={handleReset} className="px-2 py-1 text-xs font-bold rounded bg-blue-500 text-white">
            Reset
          </button>
        </div>
      }
      metrics={[
        { label: "ความถี่การสั่นเสียง", value: `${frequencyHz} เฮิรตซ์ (Hz)`, tone: "blue" },
        { label: "ระดับความดังเสียงเคาะ", value: `${amplitudeDb} เดซิเบล (dB)`, tone: "blue" },
        { label: "ความเร็วเดินทางในตัวกลาง", value: `${travelSpeed} เมตร/วินาที`, tone: "orange" },
        { label: "ตัวกลางนำพาคลื่น", value: medium === "air" ? "อากาศแก๊ส" : medium === "water" ? "ของเหลวน้ำ" : "ของแข็งเหล็ก", tone: undefined }
      ]}
      graph={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Sparkles className="h-4.5 w-4.5 text-blue-600" />
              รูปคลื่นเสียง (Oscilloscope View)
            </h3>
          </div>
          <div className="flex-grow flex flex-col items-center justify-center p-2">
            <span className="text-[9px] font-bold text-slate-400 self-start mb-1">
              ความสั่น: {frequencyHz} Hz, สูง: {amplitudeDb} dB
            </span>
            <svg viewBox="0 0 200 80" className="w-full max-w-[240px] h-auto overflow-visible rounded bg-slate-900 border border-slate-800 p-1">
              {/* Horizontal center axis */}
              <line x1="10" y1="40" x2="190" y2="40" stroke="#1e293b" strokeWidth="1" />

              {/* Oscillating sine wave based on pitch (frequency) and loudness (amplitude) */}
              <path
                d={Array.from({ length: 180 })
                  .map((_, x) => {
                    const cycleScale = pitch === "low" ? 0.05 : pitch === "medium" ? 0.12 : 0.28;
                    const ampHeight = loudness === "soft" ? 6 : loudness === "normal" ? 14 : 28;
                    const y = 40 + Math.sin(x * cycleScale) * ampHeight;
                    return `${x === 0 ? "M" : "L"} ${10 + x}, ${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.8"
              />
            </svg>
          </div>
        </section>
      }
      table={
        <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <ClipboardList className="h-4.5 w-4.5 text-blue-500" />
              ตารางบันทึกคลื่นการสั่นสะเทือนของหนูๆ
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
            <div className="flex-grow flex items-center justify-center text-xs text-slate-400 py-10">ยังไม่มีการจดบันทึกของคลื่นเสียง</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center">ที่</th>
                    <th className="p-2">ระดับเสียง</th>
                    <th className="p-2">ความดังเคาะ</th>
                    <th className="p-2">ชนิดตัวกลาง</th>
                    <th className="p-2">ความถี่ (Hz)</th>
                    <th className="p-2">ความดัง (dB)</th>
                    <th className="p-2">ความเร็วส่งผ่าน</th>
                    <th className="p-2 text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  {loggedRuns.map((r) => (
                    <tr key={r.index} className="hover:bg-slate-50/50">
                      <td className="p-2 text-center font-bold">{r.index}</td>
                      <td className="p-2 font-sans">{r.pitch}</td>
                      <td className="p-2 font-sans">{r.loudness}</td>
                      <td className="p-2 font-sans">{r.medium}</td>
                      <td className="p-2 text-blue-700 font-bold">{r.frequencyHz} Hz</td>
                      <td className="p-2 font-bold">{r.amplitudeDb} dB</td>
                      <td className="p-2 text-emerald-700 font-bold">{r.travelSpeed} m/s</td>
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
      learningGoals={["เรียนรู้ว่าเสียงทั้งหมดเกิดจากการสั่นสะเทือนของวัตถุต้นตอ เช่น สายกีตาร์ หรือลำคอ", "สังเกตว่าคลื่นเสียงสั่นถี่ขึ้นทำให้เกิดเสียงระดับสูงแหลม และการสั่นแรงๆ ทำให้เสียงดังขึ้น", "เรียนรู้ว่าเสียงต้องวิ่งพึ่งพาพาหะหรือ 'ตัวกลาง' โดยส่งผ่านของแข็ง (เหล็ก) ได้เร็วกว่าของเหลวและก๊าซ"]}
      steps={[
        { label: "เลือกระดับเสียงทุ้มแหลม (ความถี่) และแรงเคาะที่จะทำซ่อมเสียงจำลอง", icon: Sliders },
        { label: "เลือกชนิดของตัวกลางสะพานส่งคลื่นเสียงว่าจะใช้ อากาศ น้ำ หรือแผ่นเหล็ก", icon: Target },
        { label: "กดรันเคาะชี้วัด สังเกตตัวเครื่องกำเนิดคลื่นและระดับความห่างช่องคลื่นสั่นสะเทือน", icon: Zap },
        { label: "จดบันทึกตัวชี้วัดความถี่และระดับความดังของเสียงในสมุดรายคาบเรียนวิทยาศาสตร์", icon: ClipboardList }
      ]}
      progressLabel="ความคืบหน้าการเล่น"
      progressValue={questProgress === 100 ? "เล่นและวิเคราะห์การสั่นคลื่นเสียงสำเร็จแล้วจ้า!" : `ทดลองและเก็บสเปกตรัมสำเร็จ ${loggedRuns.length}/3 รอบ`}
      progressPercent={questProgress}
      tips={["ความสั่นสะเทือนยิ่งถี่สูง คลื่นบนหน้าจอกราฟจะบีบตัวแน่นขึ้นเรื่อยๆ ทำให้เสียงแหลมสูงปรี๊ด", "การเคาะหนักขึ้นทำให้ความสูงของยอดคลื่น (แอมพลิจูด) สูงเด่นตระหง่าน บ่งบอกว่าความดังเสียงดังลั่นบ้าน", "เสียงเดินผ่านแผ่นเหล็กได้เร็วปานสายฟ้าแลบ ยิ่งเป็นของแข็ง อนุภาคจะอัดอยู่ชิดติดกันช่วยส่งต่อพลังงานได้ไว"]}
      theory={
        <div className="font-sans text-sm leading-relaxed text-slate-600">
          <p className="mb-3 font-bold text-slate-800">เสียงเกิดจากอะไรนะ? (Sound Vibrations)</p>
          <p className="mb-3">เมื่อไรที่มีความสั่นสะเทือน เมื่อนั้นก็จะเกิดพลังงานคลื่นเสียงขึ้นมา:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>การสั่นสะเทือน (Vibration):</strong> ขยับขยิกสลับไปมาอย่างรวดเร็ว เช่น ซ่อมเสียงขยับไปมา หรือสายเอ็นกีตาร์สั่นไหวระยิบระยับ
            </li>
            <li>
              <strong>ความสูงต่ำเสียง (Pitch):</strong> วัดปริมาณความสั่นต่อหนึ่งวินาทีเป็นเฮิรตซ์ (Hz) สั่นช้า = เสียงทุ้มต่ำ สั่นถี่ไวมาก = เสียงสูงแหลม
            </li>
            <li>
              <strong>ความดังเสียง (Loudness):</strong> วัดความสูงคลื่นกระเจิงเป็นเดซิเบล (dB) เคาะแรงตัววัตถุสั่นกว้างใหญ่ขึ้น เสียงจะแว่วดังสนั่น
            </li>
            <li>
              <strong>ตัวกลางเดินทาง (Medium):</strong> คลื่นเสียงเดินทางไปตามอนุภาคอากาศ น้ำ หรือเหล็ก ถ้าไม่มีตัวกลางเลย (สุญญากาศ) เราจะไม่ได้ยินเสียง
            </li>
          </ul>
        </div>
      }
      onRun={handleTriggerSound}
      runLabel="ทดลองเสียง"
      onReset={handleReset}
      onSave={handleSaveResults}
    />
  );
}
