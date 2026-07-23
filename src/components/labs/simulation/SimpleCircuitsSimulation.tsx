"use client";

import React, { useId, useMemo, useState } from "react";
import {
  BatteryCharging,
  CheckCircle2,
  CircuitBoard,
  ClipboardList,
  Lightbulb,
  PlugZap,
  ToggleLeft,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import { calculateSimpleCircuit } from "@/lib/simulations/elementaryPhysics";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

type CircuitRun = {
  index: number;
  cellCount: 1 | 2;
  wireConnected: boolean;
  switchClosed: boolean;
  voltageVolt: number;
  currentAmp: number;
  powerWatt: number;
  isClosed: boolean;
};

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2";

export default function SimpleCircuitsSimulation() {
  const svgId = useId().replaceAll(":", "");
  const glowId = `bulb-glow-${svgId}`;
  const copperId = `copper-${svgId}`;
  const titleId = `circuit-title-${svgId}`;
  const descriptionId = `circuit-description-${svgId}`;
  const labId = "simple-circuits";

  const [cellCount, setCellCount] = useState<1 | 2>(1);
  const [wireConnected, setWireConnected] = useState(true);
  const [switchClosed, setSwitchClosed] = useState(false);
  const [loggedRuns, setLoggedRuns] = useState<CircuitRun[]>([]);

  const result = useMemo(
    () => calculateSimpleCircuit(cellCount, wireConnected, switchClosed),
    [cellCount, switchClosed, wireConnected],
  );

  const missionEvidence = useMemo(() => {
    const powered = loggedRuns.some((run) => run.isClosed && run.currentAmp > 0);
    const interrupted = loggedRuns.some(
      (run) => !run.isClosed && run.currentAmp === 0,
    );
    const comparedCells =
      loggedRuns.some((run) => run.isClosed && run.cellCount === 1) &&
      loggedRuns.some((run) => run.isClosed && run.cellCount === 2);
    return [powered, interrupted, comparedCells];
  }, [loggedRuns]);

  const completedMissions = missionEvidence.filter(Boolean).length;
  const progressPercent = (completedMissions / missionEvidence.length) * 100;
  const statusText = !wireConnected
    ? "สายไฟขาด วงจรไม่ครบ"
    : switchClosed
      ? "วงจรปิด หลอดไฟทำงาน"
      : "สวิตช์เปิด กระแสหยุด";

  const handleLog = () => {
    const run: CircuitRun = {
      index: loggedRuns.length + 1,
      cellCount,
      wireConnected,
      switchClosed,
      voltageVolt: result.voltageVolt,
      currentAmp: result.currentAmp,
      powerWatt: result.powerWatt,
      isClosed: result.isClosed,
    };

    setLoggedRuns((previous) => [...previous, run].slice(-12));
  };

  const handleReset = () => {
    setCellCount(1);
    setWireConnected(true);
    setSwitchClosed(false);
    setLoggedRuns([]);
  };

  const handleSave = async () => {
    if (loggedRuns.length === 0) {
      window.alert("กรุณาจดบันทึกผลอย่างน้อย 1 ครั้งก่อนบันทึกการทดลอง");
      return;
    }

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_simple_circuits_experiment",
      localPayload: {
        labId,
        savedAt: new Date().toISOString(),
        loggedRuns,
        completedMissions,
      },
      labId,
      title: "วงจรไฟฟ้าอย่างง่าย",
      variables: { cellCount, wireConnected, switchClosed, resistanceOhm: 6 },
      liveValues: result,
      graphPoints: loggedRuns.map((run) => ({
        index: run.index,
        voltageVolt: run.voltageVolt,
        currentAmp: run.currentAmp,
      })),
      tableRows: loggedRuns,
      summary: {
        completedMissions,
        runsCount: loggedRuns.length,
        latestStatus: statusText,
      },
      durationSeconds: null,
    });

    window.alert("บันทึกผลการทดลองวงจรไฟฟ้าแล้ว");
  };

  const missionPanel = (
    <section className="rounded-xl border border-orange-200 bg-orange-50 p-3">
      <p className="mb-2 text-xs font-black text-orange-900">
        ภารกิจสั้น 3 ขั้น
      </p>
      <ol className="space-y-2">
        {[
          "ทำให้หลอดไฟติดและจดบันทึก",
          "ทำให้กระแสเป็นศูนย์ด้วยสวิตช์หรือสายไฟ",
          "เปรียบเทียบวงจร 1 เซลล์กับ 2 เซลล์",
        ].map((mission, index) => (
          <li
            key={mission}
            className="flex items-start gap-2 text-xs font-bold leading-relaxed text-slate-700"
          >
            <CheckCircle2
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                missionEvidence[index] ? "text-emerald-600" : "text-slate-300"
              }`}
            />
            <span>{mission}</span>
          </li>
        ))}
      </ol>
      {completedMissions === 3 && (
        <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-black text-emerald-700">
          ปลดล็อกทดลองอิสระแล้ว ลองสร้างรูปแบบวงจรของตนเองได้เลย
        </p>
      )}
    </section>
  );

  return (
    <SharedSimulationShell
      accent="orange"
      labId={labId}
      category="Physics"
      title="วงจรไฟฟ้าอย่างง่าย"
      subtitle="ต่อวงจรแบตเตอรี่ สวิตช์ และหลอดไฟ เพื่อสังเกตว่าทางเดินไฟฟ้าที่ครบวงจรทำให้กระแสไหลได้อย่างไร"
      statusLabel={statusText}
      icon={CircuitBoard}
      sceneTitle="โต๊ะทดลองวงจรไฟฟ้า"
      scene={
        <div className="h-full min-h-[300px] overflow-hidden rounded-2xl border border-orange-100 bg-[#fffaf3]">
          <svg
            viewBox="0 0 760 360"
            className="h-full w-full"
            role="img"
            aria-labelledby={`${titleId} ${descriptionId}`}
          >
            <title id={titleId}>วงจรไฟฟ้าอย่างง่ายพร้อมแบตเตอรี่ สวิตช์ และหลอดไฟ</title>
            <desc id={descriptionId}>
              แสดงสายไฟที่ต่อครบหรือขาด สวิตช์เปิดหรือปิด และความสว่างของหลอดไฟตามกระแสไฟฟ้า
            </desc>
            <defs>
              <linearGradient id={copperId} x1="0" x2="1">
                <stop offset="0" stopColor="#c2410c" />
                <stop offset="0.5" stopColor="#fb923c" />
                <stop offset="1" stopColor="#c2410c" />
              </linearGradient>
              <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation={5 + result.brightness * 8} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="760" height="360" fill="#fffaf3" />
            <path
              d="M0 302 H760"
              stroke="#fed7aa"
              strokeWidth="3"
              strokeDasharray="8 8"
            />

            <g transform="translate(72 132)">
              <rect width="128" height="104" rx="18" fill="#fff" stroke="#fdba74" strokeWidth="3" />
              <text x="64" y="-18" textAnchor="middle" fill="#9a3412" fontSize="18" fontWeight="800">
                แบตเตอรี่ {cellCount} เซลล์
              </text>
              {Array.from({ length: cellCount }).map((_, index) => (
                <g key={index} transform={`translate(${22 + index * 54} 22)`}>
                  <rect width="38" height="64" rx="8" fill="#fb923c" />
                  <rect x="8" y="-6" width="22" height="8" rx="3" fill="#475569" />
                  <text x="19" y="39" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="900">
                    +
                  </text>
                </g>
              ))}
            </g>

            <g transform="translate(314 232)">
              <text x="64" y="53" textAnchor="middle" fill="#475569" fontSize="16" fontWeight="800">
                {switchClosed ? "สวิตช์ปิด" : "สวิตช์เปิด"}
              </text>
              <circle cx="20" cy="0" r="9" fill="#334155" />
              <circle cx="108" cy="0" r="9" fill="#334155" />
              <line
                x1="20"
                y1="0"
                x2={switchClosed ? 108 : 91}
                y2={switchClosed ? 0 : -42}
                stroke="#475569"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </g>

            <g transform="translate(558 90)">
              <circle
                cx="70"
                cy="70"
                r={result.isClosed ? 55 + result.brightness * 8 : 52}
                fill={result.isClosed ? "#fde68a" : "#f8fafc"}
                stroke={result.isClosed ? "#f59e0b" : "#94a3b8"}
                strokeWidth="5"
                filter={result.isClosed ? `url(#${glowId})` : undefined}
              />
              <path d="M43 63 Q70 30 97 63 Q70 96 43 63" fill="none" stroke="#c2410c" strokeWidth="5" />
              <rect x="48" y="123" width="44" height="38" rx="8" fill="#64748b" />
              <path d="M53 133 H87 M53 144 H87" stroke="#cbd5e1" strokeWidth="4" />
              <text x="70" y="190" textAnchor="middle" fill="#334155" fontSize="17" fontWeight="800">
                {result.isClosed ? "หลอดไฟติด" : "หลอดไฟดับ"}
              </text>
            </g>

            <path
              d="M200 158 H558"
              fill="none"
              stroke={`url(#${copperId})`}
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M628 251 V302 H422"
              fill="none"
              stroke={`url(#${copperId})`}
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M314 232 H236 V210 H200"
              fill="none"
              stroke={`url(#${copperId})`}
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {wireConnected ? (
              <path
                d="M422 302 H140 V236"
                fill="none"
                stroke={`url(#${copperId})`}
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <>
                <path d="M422 302 H330" stroke={`url(#${copperId})`} strokeWidth="9" strokeLinecap="round" />
                <path d="M286 302 H140 V236" fill="none" stroke={`url(#${copperId})`} strokeWidth="9" strokeLinecap="round" />
                <path d="M298 282 L318 322 M318 282 L298 322" stroke="#dc2626" strokeWidth="5" />
              </>
            )}

            {result.isClosed &&
              [250, 350, 450].map((x) => (
                <g key={x} transform={`translate(${x} 158)`}>
                  <circle r="8" fill="#2563eb" />
                  <path d="M-4 0 H4 M1 -3 L4 0 L1 3" stroke="#fff" strokeWidth="1.5" fill="none" />
                </g>
              ))}

            <g transform="translate(250 42)">
              <rect width="260" height="62" rx="18" fill="#fff" stroke="#fed7aa" strokeWidth="2" />
              <text x="130" y="25" textAnchor="middle" fill="#9a3412" fontSize="14" fontWeight="800">
                สถานะวงจร
              </text>
              <text x="130" y="48" textAnchor="middle" fill="#0f172a" fontSize="17" fontWeight="900">
                {statusText}
              </text>
            </g>
          </svg>
        </div>
      }
      controlsTitle="แผงต่อวงจร"
      controls={
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="mb-2 text-xs font-black text-slate-500">จำนวนเซลล์ไฟฟ้า</p>
              <div className="grid grid-cols-2 gap-2">
                {([1, 2] as const).map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setCellCount(count)}
                    aria-pressed={cellCount === count}
                    className={`${buttonBase} ${
                      cellCount === count
                        ? "border-orange-500 bg-orange-50 text-orange-800"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <BatteryCharging className="h-4 w-4" />
                    {count} เซลล์
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWireConnected((value) => !value)}
              aria-pressed={wireConnected}
              className={`${buttonBase} w-full ${
                wireConnected
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-rose-300 bg-rose-50 text-rose-800"
              }`}
            >
              <PlugZap className="h-4 w-4" />
              {wireConnected ? "สายไฟต่อครบ" : "สายไฟถูกถอด"}
            </button>
          </section>
          <div className="space-y-4">
            {missionPanel}
            <div>
              <button
                type="button"
                onClick={handleLog}
                className={`${buttonBase} w-full border-orange-500 bg-orange-500 text-white hover:bg-orange-600`}
              >
                <ClipboardList className="h-4 w-4" />
                จดผล
              </button>
            </div>
          </div>
        </div>
      }
      compactControls={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleLog}
            className={`${buttonBase} border-orange-500 bg-orange-500 text-white`}
          >
            <ClipboardList className="h-4 w-4" />
            จดผล
          </button>
        </div>
      }
      drawerSummary={missionPanel}
      metrics={[
        { label: "แรงดันไฟฟ้า", value: `${result.voltageVolt.toFixed(1)} V`, tone: "orange" },
        { label: "กระแสไฟฟ้า", value: `${result.currentAmp.toFixed(2)} A`, tone: "blue" },
        { label: "กำลังไฟฟ้า", value: `${result.powerWatt.toFixed(2)} W`, tone: "violet" },
        {
          label: "สถานะหลอดไฟ",
          value: result.isClosed ? `${Math.round(result.brightness * 100)}%` : "ดับ",
          tone: result.isClosed ? "orange" : "rose",
        },
      ]}
      graph={
        <section className="min-h-[300px] rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
            <PlugZap className="h-4 w-4 text-orange-600" />
            เปรียบเทียบแรงดันกับกระแส
          </h3>
          {loggedRuns.length === 0 ? (
            <p className="grid min-h-52 place-items-center text-sm font-bold text-slate-400">
              จดผลเพื่อสร้างกราฟ
            </p>
          ) : (
            <svg viewBox="0 0 520 230" className="w-full" role="img" aria-label="กราฟแท่งกระแสไฟฟ้าของแต่ละการทดลอง">
              <path d="M45 18 V190 H500" fill="none" stroke="#cbd5e1" strokeWidth="2" />
              {loggedRuns.map((run, index) => {
                const width = Math.max(18, 400 / loggedRuns.length - 8);
                const x = 58 + index * (400 / loggedRuns.length);
                const height = run.currentAmp * 280;
                return (
                  <g key={`${run.index}-${index}`}>
                    <rect x={x} y={190 - height} width={width} height={height} rx="6" fill={run.isClosed ? "#f97316" : "#cbd5e1"} />
                    <text x={x + width / 2} y="211" textAnchor="middle" fontSize="11" fill="#475569">
                      {run.cellCount}C
                    </text>
                  </g>
                );
              })}
              <text x="12" y="24" fontSize="11" fill="#64748b">A</text>
              <text x="465" y="225" fontSize="11" fill="#64748b">เซลล์</text>
            </svg>
          )}
        </section>
      }
      table={
        <section className="min-h-[300px] rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
            <ClipboardList className="h-4 w-4 text-orange-600" />
            สมุดบันทึกวงจร
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">ครั้ง</th>
                  <th className="p-3">เซลล์</th>
                  <th className="p-3">ทางเดินไฟฟ้า</th>
                  <th className="p-3">แรงดัน</th>
                  <th className="p-3">กระแส</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loggedRuns.map((run, index) => (
                  <tr key={`${run.index}-${index}`}>
                    <td className="p-3 font-bold">{index + 1}</td>
                    <td className="p-3">{run.cellCount}</td>
                    <td className="p-3">{run.isClosed ? "ครบวงจร" : "วงจรขาด"}</td>
                    <td className="p-3">{run.voltageVolt.toFixed(1)} V</td>
                    <td className="p-3 font-black text-orange-700">{run.currentAmp.toFixed(2)} A</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loggedRuns.length === 0 && (
              <p className="py-16 text-center text-sm font-bold text-slate-400">ยังไม่มีข้อมูล</p>
            )}
          </div>
        </section>
      }
      learningGoals={[
        "อธิบายได้ว่าวงจรต้องมีทางเดินไฟฟ้าที่ต่อครบจึงมีกระแส",
        "สังเกตผลของสวิตช์และสายไฟต่อการทำงานของหลอดไฟ",
        "เปรียบเทียบแรงดัน กระแส และความสว่างเมื่อเพิ่มจำนวนเซลล์",
      ]}
      steps={[
        { label: "เลือกจำนวนเซลล์และตรวจสายไฟ", icon: BatteryCharging },
        { label: "ปิดสวิตช์เพื่อให้วงจรครบ", icon: ToggleLeft },
        { label: "สังเกตหลอดไฟและค่ากระแส", icon: Lightbulb },
        { label: "จดผลเพื่อผ่านภารกิจ", icon: ClipboardList },
      ]}
      progressLabel="ความคืบหน้าภารกิจ"
      progressValue={`${completedMissions}/3 ภารกิจ`}
      progressPercent={progressPercent}
      tips={[
        "ถ้าหลอดไฟไม่ติด ให้ตรวจทั้งสายไฟและสวิตช์ เพราะอย่างใดอย่างหนึ่งที่เปิดอยู่ทำให้วงจรขาด",
        "วงจรนี้ใช้ความต้านทานคงที่ 6 โอห์มเพื่อให้เปรียบเทียบจำนวนเซลล์ได้ง่าย",
        "เมื่อผ่านครบสามภารกิจแล้ว สามารถเปลี่ยนค่าและจดผลเพิ่มเติมได้อย่างอิสระ",
      ]}
      theory={
        <div className="space-y-3 text-sm font-semibold leading-relaxed text-slate-600">
          <p>
            กระแสไฟฟ้าไหลได้เมื่อวงจรเป็นทางปิดครบจากขั้วหนึ่งของแบตเตอรี่ ผ่านหลอดไฟ แล้วกลับสู่อีกขั้วหนึ่ง
          </p>
          <p className="rounded-xl bg-orange-50 p-3 font-black text-orange-900">
            กฎของโอห์ม: I = V / R
          </p>
          <p>
            แบบจำลองนี้ใช้เซลล์ละ 1.5 โวลต์และความต้านทานคงที่ 6 โอห์ม จึงเห็นได้ชัดว่าเมื่อเพิ่มแรงดัน กระแสและกำลังไฟฟ้าจะเพิ่มขึ้น
          </p>
        </div>
      }
      onRun={() => setSwitchClosed((value) => !value)}
      runLabel={switchClosed ? "เปิดวงจร" : "ทดลอง"}
      runActive={switchClosed}
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}
