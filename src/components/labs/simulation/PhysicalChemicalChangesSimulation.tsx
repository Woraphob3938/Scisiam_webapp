"use client";

import React, { useState, useEffect, useRef } from "react";
import SharedSimulationShell from "./SharedSimulationShell";
import {
  Beaker,
  Info,
  Play,
  CheckCircle,
  XCircle,
  Award,
} from "lucide-react";
import { labsById } from "@/data/labs";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

interface QuizLog {
  id: number;
  activityName: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

const activities = [
  {
    id: "boiling",
    name: "การต้มเดือดของน้ำ (Water Boiling)",
    type: "physical",
    typeThai: "การเปลี่ยนแปลงทางกายภาพ",
    evidence: ["state"],
    description: "สังเกตน้ำที่ได้รับความร้อนและเปลี่ยนสถานะเป็นไอน้ำ"
  },
  {
    id: "dissolving",
    name: "การละลายของน้ำตาล (Sugar Dissolving)",
    type: "physical",
    typeThai: "การเปลี่ยนแปลงทางกายภาพ",
    evidence: ["dissolve"],
    description: "น้ำตาลก้อนสลายตัวกระจายไปในน้ำโดยยังคงรสหวานเดิม"
  },
  {
    id: "burning",
    name: "การเผากระดาษ (Paper Burning)",
    type: "chemical",
    typeThai: "การเปลี่ยนแปลงทางเคมี",
    evidence: ["new-substance", "gas", "heat-light"],
    description: "กระดาษทำปฏิกิริยากับความร้อน เกิดการเผาไหม้กลายเป็นเขม่าควันและเถ้าถ่าน"
  },
  {
    id: "rusting",
    name: "การเกิดสนิมเหล็ก (Iron Rusting)",
    type: "chemical",
    typeThai: "การเปลี่ยนแปลงทางเคมี",
    evidence: ["new-substance", "color"],
    description: "ตะปูเหล็กทำปฏิกิริยากับออกซิเจนและน้ำ เกิดเป็นสารสีแดงส้มเกาะตามผิว"
  },
  {
    id: "soda-vinegar",
    name: "เบกกิ้งโซดา + น้ำส้มสายชู (Soda & Vinegar)",
    type: "chemical",
    typeThai: "การเปลี่ยนแปลงทางเคมี",
    evidence: ["new-substance", "gas"],
    description: "ผงเบกกิ้งโซดาทำปฏิกิริยากับกรดส้มสายชู เกิดฟองฟูฟุ้งกระจายขึ้นอย่างรวดเร็ว"
  }
];

export default function PhysicalChemicalChangesSimulation() {
  const labId = "physical-chemical-changes";
  const labData = labsById[labId];

  const [selectedActivity, setSelectedActivity] = useState(activities[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100 for animation

  // Interactive quiz state
  const [studentAnswer, setStudentAnswer] = useState<"physical" | "chemical" | null>(null);
  const [selectedEvidences, setSelectedEvidences] = useState<string[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [logs, setLogs] = useState<QuizLog[]>([]);
  const [, setIsSaving] = useState(false);

  const requestRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const animate = (time: number) => {
    if (!lastUpdateRef.current) lastUpdateRef.current = time;

    if (isRunning && progress < 100) {
      // Speed up animation based on activity
      const speed = selectedActivity.id === "rusting" ? 0.2 : 1.0;
      setProgress(prev => Math.min(prev + speed, 100));
    }

    lastUpdateRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- RAF loop intentionally uses the current activity animation closure.
  }, [isRunning, progress]);

  const handleStart = () => {
    setProgress(0);
    setIsRunning(true);
    setStudentAnswer(null);
    setSelectedEvidences([]);
    setHasChecked(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setProgress(0);
    setStudentAnswer(null);
    setSelectedEvidences([]);
    setHasChecked(false);
  };

  const handleEvidenceToggle = (ev: string) => {
    if (hasChecked) return;
    setSelectedEvidences(prev =>
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    );
  };

  const handleCheckAnswer = () => {
    if (!studentAnswer) {
      window.alert("กรุณาเลือกประเภทการเปลี่ยนแปลงก่อนตรวจคำตอบ");
      return;
    }

    setHasChecked(true);
    const isCorrect = studentAnswer === selectedActivity.type;

    const newLog: QuizLog = {
      id: Date.now(),
      activityName: selectedActivity.name,
      studentAnswer: studentAnswer === "physical" ? "กายภาพ" : "เคมี",
      correctAnswer: selectedActivity.type === "physical" ? "กายภาพ" : "เคมี",
      isCorrect,
    };

    setLogs(prev => [newLog, ...prev]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleSave = async () => {
    if (logs.length === 0) {
      window.alert("กรุณาทำกิจกรรมและตรวจคำตอบอย่างน้อย 1 รายการก่อนส่งผล");
      return;
    }

    setIsSaving(true);
    try {
      const correctCount = logs.filter(l => l.isCorrect).length;
      await saveExperimentAndSync({
        localStorageKey: "scisiam_saved_physical_chemical_changes_experiment",
        localPayload: {
          labId,
          timestamp: new Date().toISOString(),
          logs,
        },
        labId,
        title: "การเปลี่ยนแปลงกายภาพและเคมี",
        variables: { progressLimit: progress },
        liveValues: {
          lastActivity: selectedActivity.id,
          correctAnswers: correctCount,
          totalQuizzes: logs.length,
        },
        graphPoints: logs.map((l, idx) => ({
          x: idx + 1,
          y: l.isCorrect ? 1 : 0,
        })),
        tableRows: logs,
        summary: {
          quizzesSolved: logs.length,
          correctScore: correctCount,
        },
        durationSeconds: 45,
      });
      window.alert("บันทึกผลการเรียนรู้แล้ว");
    } finally {
      setIsSaving(false);
    }
  };

  const getMetricDisplay = () => {
    const correctCount = logs.filter(l => l.isCorrect).length;
    return [
      { label: "กิจกรรมที่ทำสำเร็จ", value: `${logs.length} ครั้ง` },
      { label: "คะแนนเฉลี่ยการตอบ", value: logs.length > 0 ? `${Math.round((correctCount / logs.length) * 100)}%` : "0%" },
      { label: "คะแนนถูกต้อง", value: `${correctCount} / ${logs.length}` },
    ];
  };

  // Render SVG views for selected activity transformations
  const renderSVGViewport = () => {
    const scale = progress / 100;

    switch (selectedActivity.id) {
      case "boiling":
        return (
          <g>
            {/* Burner */}
            <path d="M 100 250 L 200 250" stroke="#475569" strokeWidth="6" />
            <path d="M 120 250 L 120 280 M 180 250 L 180 280" stroke="#475569" strokeWidth="4" />
            {/* Fire flame */}
            {progress > 10 && (
              <path d="M 130 250 Q 150 210 170 250 Z" fill="#ef4444" opacity={0.6 + scale * 0.4} className="animate-pulse" />
            )}

            {/* Beaker & Water level */}
            <rect x="110" y="140" width="80" height="100" fill="none" stroke="#64748b" strokeWidth="4" />
            <rect x="112" y="170" width="76" height="76" fill="#bae6fd" opacity="0.6" />

            {/* Steam and Bubbles */}
            {progress > 30 && (
              <g>
                <circle cx="130" cy={230 - scale * 40} r="3" fill="#ffffff" opacity="0.7" />
                <circle cx="150" cy={220 - scale * 30} r="4" fill="#ffffff" opacity="0.8" />
                <circle cx="170" cy={240 - scale * 50} r="3" fill="#ffffff" opacity="0.6" />
                <circle cx="140" cy={200 - scale * 20} r="4" fill="#ffffff" opacity="0.7" />
              </g>
            )}
            {progress > 60 && (
              <g opacity={scale}>
                <path d="M 125 130 Q 130 115 125 105 T 125 90" stroke="#cbd5e1" strokeWidth="2" fill="none" className="animate-bounce" />
                <path d="M 150 125 Q 155 110 150 100 T 150 85" stroke="#cbd5e1" strokeWidth="2" fill="none" className="animate-bounce" />
                <path d="M 175 130 Q 180 115 175 105 T 175 90" stroke="#cbd5e1" strokeWidth="2" fill="none" className="animate-bounce" />
              </g>
            )}
          </g>
        );

      case "dissolving":
        return (
          <g>
            {/* Beaker with water */}
            <path d="M 100 120 L 100 240 Q 100 250 110 250 L 190 250 Q 200 250 200 240 L 200 120" fill="none" stroke="#64748b" strokeWidth="4" />
            <rect x="102" y="160" width="96" height="88" fill="#bae6fd" opacity="0.5" />

            {/* Sugar cube falling and dissolving */}
            {progress < 80 && (
              <rect
                x={140}
                y={100 + scale * 100}
                width="20"
                height="20"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                opacity={1 - scale * 0.9}
              />
            )}
            {/* Dissolved sugar particles swirl */}
            {progress > 40 && (
              <g opacity={scale}>
                <path d="M 120 190 A 30 10 0 1 0 180 190" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin-slow" />
                <path d="M 130 210 A 20 6 0 1 0 170 210" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3 3" />
              </g>
            )}
          </g>
        );

      case "burning":
        return (
          <g>
            {/* Stand holding paper */}
            <line x1="80" y1="250" x2="220" y2="250" stroke="#64748b" strokeWidth="4" />
            <line x1="90" y1="250" x2="90" y2="150" stroke="#64748b" strokeWidth="3" />
            <line x1="90" y1="150" x2="120" y2="150" stroke="#64748b" strokeWidth="3" />

            {/* Paper sheet */}
            <rect
              x="120"
              y={130 + scale * 60}
              width="60"
              height={80 - scale * 80}
              fill={scale > 0.8 ? "#334155" : scale > 0.4 ? "#64748b" : "#f8fafc"}
              stroke="#94a3b8"
              strokeWidth="1"
            />

            {/* Fire burning paper */}
            {progress > 5 && progress < 95 && (
              <path
                d={`M 115 ${210 - scale * 80} Q 150 ${180 - scale * 90} 185 ${210 - scale * 80} Z`}
                fill="#f97316"
                opacity="0.85"
                className="animate-pulse"
              />
            )}

            {/* Falling ash particles */}
            {progress > 30 && (
              <g opacity={scale}>
                <rect x="135" y={220 + scale * 10} width="4" height="4" fill="#334155" />
                <rect x="155" y={215 + scale * 15} width="5" height="3" fill="#1e293b" />
                <rect x="165" y={225 + scale * 8} width="3" height="4" fill="#334155" />
              </g>
            )}
          </g>
        );

      case "rusting":
        return (
          <g>
            {/* Iron nail */}
            <rect x="145" y="80" width="10" height="150" fill={progress > 10 ? `url(#rust-gradient-${progress})` : "#94a3b8"} rx="1" />
            <rect x="135" y="75" width="30" height="8" fill={progress > 10 ? `url(#rust-gradient-${progress})` : "#94a3b8"} rx="2" />

            {/* Define rust color gradient dynamically based on scale */}
            <defs>
              <linearGradient id={`rust-gradient-${progress}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7c2d12" stopOpacity={scale} />
                <stop offset={`${100 - progress}%`} stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#7c2d12" stopOpacity={scale} />
              </linearGradient>
            </defs>

            {/* Test tube container with water */}
            <path d="M 120 60 L 120 220 Q 120 260 150 260 Q 180 260 180 220 L 180 60" fill="none" stroke="#cbd5e1" strokeWidth="4" />
            <path d="M 120 140 Q 150 135 180 140 L 180 220 Q 180 256 150 256 Q 120 256 120 220 Z" fill="#bae6fd" opacity="0.3" />
          </g>
        );

      case "soda-vinegar":
        return (
          <g>
            {/* Beaker with white baking soda at bottom */}
            <path d="M 90 120 L 90 240 Q 90 250 100 250 L 200 250 Q 210 250 210 240 L 210 120" fill="none" stroke="#64748b" strokeWidth="4" />
            <rect x="92" y="225" width="116" height="23" fill="#f8fafc" rx="2" />

            {/* Pouring vinegar tube */}
            {progress < 40 && (
              <g transform="translate(60, 40)" opacity={1 - scale * 2.5}>
                <rect x="0" y="0" width="12" height="70" fill="#bae6fd" opacity="0.5" stroke="#94a3b8" />
                <path d="M 6 70 L 6 90" stroke="#bae6fd" strokeWidth="3" />
              </g>
            )}

            {/* Rapid foaming bubbles overflowing beaker */}
            {progress > 20 && (
              <g opacity={scale}>
                <path
                  d={`M 92 ${230 - scale * 60} Q 150 ${220 - scale * 90} 208 ${230 - scale * 60} L 208 248 L 92 248 Z`}
                  fill="#f1f5f9"
                  opacity="0.85"
                />
                {/* bubble circles */}
                <circle cx="120" cy="180" r="5" fill="#ffffff" stroke="#e2e8f0" />
                <circle cx="140" cy="150" r="6" fill="#ffffff" stroke="#e2e8f0" />
                <circle cx="160" cy="170" r="4" fill="#ffffff" stroke="#e2e8f0" />
                <circle cx="110" cy="160" r="5" fill="#ffffff" stroke="#e2e8f0" />
                <circle cx="180" cy="150" r="7" fill="#ffffff" stroke="#e2e8f0" />
              </g>
            )}
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <SharedSimulationShell
      accent="orange"
      labId={labId}
      category={labData?.category || "Chemistry"}
      title={labData?.thaiTitle || labData?.title || "การเปลี่ยนแปลงกายภาพและเคมี"}
      subtitle={labData?.description || ""}
      statusLabel="พร้อมใช้งาน"
      icon={Award}
      sceneTitle="แท่นการจำลองปฏิกิริยา"
      scene={
        <div className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 min-h-[340px] relative w-full h-full">
          <svg viewBox="0 0 300 300" className="w-full max-w-sm h-auto drop-shadow-md" aria-labelledby="sim-title sim-desc">
            <title id="sim-title">แอนิเมชันปฏิกิริยากายภาพเคมี</title>
            <desc id="sim-desc">แสดงการเปลี่ยนแปลงสถานะหรือโครงสร้างโมเลกุลในห้องปฏิบัติการ</desc>

            {renderSVGViewport()}
          </svg>

          {/* Progress gauge for reaction animation */}
          {isRunning && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-slate-500">ความคืบหน้าปฏิกิริยา:</span>
              <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-bold text-orange-600">{progress.toFixed(0)}%</span>
            </div>
          )}
        </div>
      }
      controlsTitle="สำรวจปฏิกิริยาและระบุประเภท"
      controls={
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">เลือกกิจกรรมการทดลอง</label>
            <div className="grid grid-cols-1 gap-1.5">
              {activities.map(act => (
                <button
                  key={act.id}
                  onClick={() => {
                    setSelectedActivity(act);
                    handleReset();
                  }}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-lg border text-left transition-all ${
                    selectedActivity.id === act.id
                      ? "bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-350 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="font-bold">{act.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{act.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={isRunning && progress < 100}
            className="w-full py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Play className="w-4 h-4" />
            เริ่มทำการทดลอง / ทริกเกอร์
          </button>

          {/* Interactive Quiz section shown after running reaction */}
          {progress >= 100 && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-1.5">ผลลัพธ์นี้จัดเป็นการเปลี่ยนแปลงประเภทใด?</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => !hasChecked && setStudentAnswer("physical")}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      studentAnswer === "physical"
                        ? "bg-blue-500 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    }`}
                    disabled={hasChecked}
                  >
                    ทางกายภาพ
                  </button>
                  <button
                    onClick={() => !hasChecked && setStudentAnswer("chemical")}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      studentAnswer === "chemical"
                        ? "bg-purple-500 border-purple-600 text-white"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    }`}
                    disabled={hasChecked}
                  >
                    ทางเคมี
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-1.5">หลักฐานที่สังเกตพบเห็น (เลือกได้หลายข้อ)</span>
                <div className="grid grid-cols-1 gap-1.5">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvidences.includes("state")}
                      onChange={() => handleEvidenceToggle("state")}
                      disabled={hasChecked}
                      className="rounded border-slate-300 accent-orange-600"
                    />
                    <span>เปลี่ยนสถานะกลับไปกลับมาได้</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvidences.includes("new-substance")}
                      onChange={() => handleEvidenceToggle("new-substance")}
                      disabled={hasChecked}
                      className="rounded border-slate-300 accent-orange-600"
                    />
                    <span>เกิดสารใหม่ขึ้นมาที่มีโครงสร้างเปลี่ยนไป</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvidences.includes("gas")}
                      onChange={() => handleEvidenceToggle("gas")}
                      disabled={hasChecked}
                      className="rounded border-slate-300 accent-orange-600"
                    />
                    <span>เกิดฟองแก๊สผุดขึ้น (Gas Release)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvidences.includes("color")}
                      onChange={() => handleEvidenceToggle("color")}
                      disabled={hasChecked}
                      className="rounded border-slate-300 accent-orange-600"
                    />
                    <span>มีการเปลี่ยนรูปหรือการเปลี่ยนเฉดสีอย่างถาวร</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvidences.includes("heat-light")}
                      onChange={() => handleEvidenceToggle("heat-light")}
                      disabled={hasChecked}
                      className="rounded border-slate-300 accent-orange-600"
                    />
                    <span>ปล่อยพลังงานความร้อน แสง หรือควัน</span>
                  </label>
                </div>
              </div>

              {!hasChecked ? (
                <button
                  onClick={handleCheckAnswer}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  ตรวจคำตอบ
                </button>
              ) : (
                <div className={`p-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                  studentAnswer === selectedActivity.type
                    ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900"
                    : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900"
                }`}>
                  {studentAnswer === selectedActivity.type ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {studentAnswer === selectedActivity.type ? "ถูกต้อง! ยอดเยี่ยมมาก" : `ผิดไปนิด เฉลยคือ: ${selectedActivity.typeThai}`}
                </div>
              )}
            </div>
          )}
        </div>
      }
      metrics={getMetricDisplay()}
      graph={null}
      table={
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="p-3">กิจกรรมจำลอง</th>
                <th className="p-3">คำตอบของผู้เรียน</th>
                <th className="p-3">เฉลยจริง</th>
                <th className="p-3">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400 italic">ทำปฏิกิริยาให้จบและกดตรวจคำตอบเพื่อเพิ่มข้อมูลในบันทึกตารางแล็บ</td>
                </tr>
              ) : (
                logs.map(l => (
                  <tr key={l.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{l.activityName.split(" (")[0]}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">การเปลี่ยนแปลงทาง{l.studentAnswer}</td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">การเปลี่ยนแปลงทาง{l.correctAnswer}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.isCorrect
                          ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                          : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                      }`}>
                        {l.isCorrect ? "ถูกต้อง" : "ผิด"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {logs.length > 0 && (
            <div className="p-2 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <button onClick={handleClearLogs} className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors">
                ล้างผลตาราง
              </button>
            </div>
          )}
        </div>
      }
      theory={
        <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>
            <strong>การเปลี่ยนแปลงทางกายภาพ vs ทางเคมี (Physical vs Chemical Changes)</strong> สามารถจำแนกโดยใช้เกณฑ์โครงสร้างและสารตั้งต้นดังนี้:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>การเปลี่ยนแปลงทางกายภาพ (Physical Change)</strong>: เป็นการเปลี่ยนเพียงขนาด รูปร่าง หรือสถานะ โดยไม่มีสารใหม่เกิดขึ้นและย้อนกลับมาง่าย (เช่น การละลายของน้ำตาล น้ำเปลี่ยนเป็นไอ)</li>
            <li><strong>การเปลี่ยนแปลงทางเคมี (Chemical Change)</strong>: เป็นการเปลี่ยนแปลงที่เกิดจากปฏิกิริยาเคมี มีการจัดเรียงอะตอมใหม่ เกิดเป็นสารใหม่ที่มีคุณสมบัติเปลี่ยนไปจากสารตั้งต้น และย้อนกลับมาได้ยาก (เช่น เหล็กเกิดสนิม การเกิดฟองของผงฟูกับกรด การเผาไหม้ถ่านแก๊ส)</li>
          </ul>
        </div>
      }
      steps={[
        { label: "เลือกการทดลองที่ต้องการวิเคราะห์ปฏิกิริยาทางวิทยาศาสตร์", icon: Beaker },
        { label: "กดปุ่ม 'เริ่มทำการทดลอง' เพื่อชมกระบวนการเปลี่ยนแปลง", icon: Play },
        { label: "ระบุประเภทการเปลี่ยนแปลงและระบุหลักฐานที่พบผ่านข้อบ่งชี้", icon: Info },
        { label: "กดตรวจคำตอบเพื่อรวบรวมลงในตารางประเมินผลสัมฤทธิ์", icon: CheckCircle },
      ]}
      learningGoals={[
        "แยกแยะหลักฐานของการเปลี่ยนแปลงทางกายภาพและเคมีได้อย่างแม่นยำ",
        "ระบุการเกิดปฏิกิริยาเคมีจากปัจจัยความต่างของกลิ่น ฟอง แก๊ส สี และอุณหภูมิ",
        "สังเกตความแตกต่างของคุณสมบัติสารที่ผันกลับได้และผันกลับไม่ได้",
      ]}
      progressLabel="ระดับการทำโจทย์"
      progressValue={`${Math.min(logs.length, 3)} / 3`}
      progressPercent={Math.min((logs.length / 3) * 100, 100)}
      tips={[
        "การต้มเดือดของน้ำเป็นการเปลี่ยนสถานะทางกายภาพ เพราะองค์ประกอบยังคงเป็นน้ำ (H2O) เหมือนเดิม",
        "การเผากระดาษเกิดแก๊สคาร์บอนไดออกไซด์และเถ้าถ่านที่เป็นสารใหม่ ทำให้จัดเป็นการเปลี่ยนแปลงทางเคมี",
        "ฟองฟู่จากการผสมเบกกิ้งโซดากับน้ำส้มสายชูคือฟองแก๊สคาร์บอนไดออกไซด์จากการสลายพันธะเคมี",
      ]}
      showLiveMetrics={true}
      showInfoTabs={true}
      showSaveButton={true}
      onSave={handleSave}
    />
  );
}
