"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Apple,
  Beaker,
  Bone,
  Dumbbell,
  FlaskConical,
  HeartPulse,
  Info,
  Leaf,
  ListChecks,
  Microscope,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";

import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";
import {
  foundationExplorerLabs,
  isFoundationExplorerLabId,
  type FoundationExplorerItem,
  type FoundationExplorerLab,
} from "@/data/foundationExplorerLabs";

const iconMap: Record<FoundationExplorerLab["visualKind"], LucideIcon> = {
  equipment: Beaker,
  "animal-cell": Microscope,
  "leaf-cell": Leaf,
  blood: HeartPulse,
  chemicals: FlaskConical,
  "external-muscle": Dumbbell,
  "internal-muscle": Bone,
  minerals: Apple,
};

const toneClasses = {
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  cyan: "border-cyan-100 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  orange: "border-orange-100 bg-orange-50 text-orange-700",
  rose: "border-rose-100 bg-rose-50 text-rose-700",
  violet: "border-violet-100 bg-violet-50 text-violet-700",
};

function MiniDiagram({ lab }: { lab: FoundationExplorerLab }) {
  const Icon = iconMap[lab.visualKind];
  const isMinerals = lab.visualKind === "minerals";
  const isBlood = lab.visualKind === "blood";
  const isCell = lab.visualKind.includes("cell");

  return (
    <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[30px] border border-white/60 bg-gradient-to-br from-white/90 via-sky-50/70 to-emerald-50/60 p-6 shadow-inner">
      <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="absolute -right-16 bottom-8 h-44 w-44 rounded-full bg-emerald-200/35 blur-3xl" />

      {isMinerals ? (
        <div className="relative grid w-full max-w-[640px] grid-cols-2 gap-5">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-lg shadow-emerald-100/50">
            <p className="mb-3 text-sm font-black text-emerald-700">แร่ธาตุจำเป็น</p>
            {lab.items.filter((item) => item.side === "good").slice(0, 5).map((item) => (
              <div key={item.id} className="mb-2 rounded-2xl bg-white/85 px-3 py-2 text-sm font-black text-slate-800">
                {item.name}
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-rose-200 bg-rose-50/90 p-5 shadow-lg shadow-rose-100/50">
            <p className="mb-3 text-sm font-black text-rose-700">ควรหลีกเลี่ยง/ระวัง</p>
            {lab.items.filter((item) => item.side === "bad").slice(0, 5).map((item) => (
              <div key={item.id} className="mb-2 rounded-2xl bg-white/85 px-3 py-2 text-sm font-black text-slate-800">
                {item.name}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative grid h-64 w-64 place-items-center rounded-full border border-white bg-white/80 shadow-2xl shadow-slate-200/70">
          <div className={`absolute inset-7 rounded-full border-8 ${isCell ? "border-emerald-200/70" : "border-sky-200/70"}`} />
          {isCell && <div className="absolute h-20 w-24 rounded-full bg-violet-200/80" />}
          {isBlood && (
            <>
              <span className="absolute left-10 top-20 h-14 w-20 rounded-full bg-rose-400/85 shadow-md" />
              <span className="absolute bottom-16 right-12 h-10 w-10 rounded-full bg-white shadow-md" />
              <span className="absolute bottom-20 left-20 h-4 w-8 rounded-full bg-amber-300" />
            </>
          )}
          {lab.visualKind === "chemicals" && (
            <div className="absolute grid grid-cols-3 gap-3">
              {["กรด", "เบส", "เกลือ", "อินดิเคเตอร์", "ตัวทำละลาย", "รีเอเจนต์"].map((label) => (
                <span key={label} className="rounded-2xl border border-orange-100 bg-white px-3 py-2 text-center text-xs font-black text-orange-700 shadow-sm">
                  {label}
                </span>
              ))}
            </div>
          )}
          {lab.visualKind.includes("muscle") && (
            <div className="absolute h-56 w-28 rounded-full bg-rose-100">
              <span className="absolute left-8 top-8 h-16 w-12 rounded-full bg-rose-400/80" />
              <span className="absolute left-5 top-28 h-20 w-7 rounded-full bg-rose-500/80" />
              <span className="absolute right-5 top-28 h-20 w-7 rounded-full bg-rose-500/80" />
            </div>
          )}
          <Icon className={`relative h-16 w-16 ${toneClasses[lab.accent].split(" ")[2]}`} />
        </div>
      )}

      <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm font-bold leading-relaxed text-slate-700 shadow-sm backdrop-blur-md">
        {lab.keyLine}
      </div>
    </div>
  );
}

function DetailCard({ item, lab }: { item: FoundationExplorerItem; lab: FoundationExplorerLab }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${toneClasses[lab.accent]}`}>{item.tag}</span>
        {item.side && (
          <span className={`rounded-full px-3 py-1 text-xs font-black ${item.side === "good" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {item.side === "good" ? "ฝั่งดี" : "ฝั่งระวัง"}
          </span>
        )}
      </div>
      <h3 className="text-xl font-black text-slate-950">{item.name}</h3>
      <p className="mt-1 text-sm font-bold text-slate-500">{item.subtitle}</p>
      <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-600">{item.detail}</p>
    </div>
  );
}

function ChemicalListModal({
  lab,
  onClose,
}: {
  lab: FoundationExplorerLab;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="รายการสารเคมีในการทดลอง">
      <div className="max-h-[86%] w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Chemical list</p>
            <h2 className="text-2xl font-black text-slate-950">รายการสารเคมีในการทดลอง</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">อ่านหน้าที่และข้อควรระวังของสารที่พบบ่อยในห้องแล็บ</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            aria-label="ปิดรายการสารเคมี"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[62vh] overflow-y-auto p-5">
          <div className="grid gap-3 md:grid-cols-2">
            {lab.items.map((item) => (
              <DetailCard key={item.id} item={item} lab={lab} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExplorerScene({ lab }: { lab: FoundationExplorerLab }) {
  const [selectedId, setSelectedId] = useState(lab.items[0]?.id ?? "");
  const [chemicalsOpen, setChemicalsOpen] = useState(false);
  const selected = lab.items.find((item) => item.id === selectedId) ?? lab.items[0];
  const isChemicals = lab.visualKind === "chemicals";

  return (
    <section className="relative grid min-h-full gap-5 bg-slate-50 p-5 lg:grid-cols-[1.05fr_0.95fr]">
      <MiniDiagram lab={lab} />

      <div className="flex min-h-[320px] flex-col gap-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className={`text-xs font-black uppercase tracking-[0.16em] ${toneClasses[lab.accent].split(" ")[2]}`}>{lab.sceneLabel}</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{lab.thaiTitle}</h2>
            </div>
            {isChemicals && (
              <button
                type="button"
                onClick={() => setChemicalsOpen(true)}
                className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                เปิดรายการสารเคมี
              </button>
            )}
          </div>

          <div className={lab.visualKind === "minerals" ? "grid gap-3 md:grid-cols-2" : "grid max-h-[300px] gap-3 overflow-y-auto pr-1 md:grid-cols-2"}>
            {lab.items.slice(0, isChemicals ? 6 : lab.items.length).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  selected?.id === item.id ? `${toneClasses[lab.accent]} shadow-sm` : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <span className="text-xs font-black text-slate-400">{item.tag}</span>
                <p className="mt-1 text-sm font-black text-slate-950">{item.name}</p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{item.subtitle}</p>
              </button>
            ))}
          </div>
        </div>

        {selected && <DetailCard item={selected} lab={lab} />}
      </div>

      {chemicalsOpen && <ChemicalListModal lab={lab} onClose={() => setChemicalsOpen(false)} />}
    </section>
  );
}

export default function FoundationExplorerSimulation() {
  const params = useParams();
  const labId = typeof params?.id === "string" && isFoundationExplorerLabId(params.id)
    ? params.id
    : "lab-equipment-overview";
  const lab = foundationExplorerLabs[labId];
  const Icon = iconMap[lab.visualKind];

  const controls = (
    <div className="grid gap-3">
      {lab.overviewBullets.map((item, index) => (
        <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-black text-slate-400">หัวข้อที่ {index + 1}</p>
          <p className="text-sm font-bold leading-relaxed text-slate-700">{item}</p>
        </div>
      ))}
    </div>
  );

  return (
    <SharedSimulationShell
      accent={lab.accent}
      labId={lab.id}
      category="Foundation"
      title={lab.thaiTitle}
      subtitle={lab.subtitle}
      statusLabel={`สำรวจ ${lab.items.length} หัวข้อ`}
      icon={Icon}
      sceneTitle={lab.sceneLabel}
      scene={<ExplorerScene lab={lab} />}
      controlsTitle="แนวทางการสำรวจ"
      controls={controls}
      compactControls={controls}
      metrics={[
        { label: "หมวด", value: "ความรู้พื้นฐาน", tone: lab.accent },
        { label: "หัวข้อ", value: `${lab.items.length} รายการ`, tone: "cyan" },
        { label: "รูปแบบ", value: "สำรวจข้อมูล", tone: "emerald" },
      ]}
      graph={<p>{lab.keyLine}</p>}
      table={<p>{lab.theory}</p>}
      theory={<p className="leading-relaxed text-slate-600">{lab.theory}</p>}
      steps={[
        { label: "อ่านภาพรวม", icon: Info },
        { label: "เลือกหัวข้อบนภาพ", icon: Sparkles },
        { label: "ทบทวนข้อควรจำ", icon: ListChecks },
      ]}
      learningGoals={lab.learningObjectives}
      progressLabel="การสำรวจ"
      progressValue="เลือกหัวข้อเพื่ออ่านรายละเอียด"
      progressPercent={0}
      tips={lab.tips}
      showSaveButton={false}
      showLiveMetrics={false}
      showInfoTabs={false}
    />
  );
}
