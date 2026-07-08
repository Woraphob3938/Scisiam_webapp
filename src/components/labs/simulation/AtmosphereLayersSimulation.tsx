"use client";

import React, { useMemo, useState } from "react";
import {
  CloudRain,
  Layers,
  MousePointer2,
  X,
} from "lucide-react";
import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";

type CloudKind = {
  id: string;
  thaiName: string;
  englishName: string;
  altitude: string;
  altitudeMinKm: number;
  altitudeMaxKm: number;
  layer: string;
  weather: string;
  description: string;
  x: number;
  y: number;
  size: "sm" | "md" | "lg";
};

const cloudKinds: CloudKind[] = [
  {
    id: "cirrus",
    thaiName: "ซีร์รัส",
    englishName: "Cirrus",
    altitude: "6-12 กม.",
    altitudeMinKm: 6,
    altitudeMaxKm: 12,
    layer: "โทรโพสเฟียร์ตอนบน",
    weather: "มักพบในวันที่อากาศดี แต่อาจบอกว่าอากาศกำลังเปลี่ยน",
    description: "เมฆสูงเป็นเส้นบางคล้ายขนนก เกิดจากผลึกน้ำแข็งขนาดเล็ก",
    x: 70,
    y: 22,
    size: "sm",
  },
  {
    id: "altocumulus",
    thaiName: "อัลโตคิวมูลัส",
    englishName: "Altocumulus",
    altitude: "2-7 กม.",
    altitudeMinKm: 2,
    altitudeMaxKm: 7,
    layer: "โทรโพสเฟียร์ตอนกลาง",
    weather: "มักเห็นเป็นก้อนเล็ก ๆ หลายก้อน อาจพบก่อนฝนหรือพายุในบางช่วง",
    description: "เมฆระดับกลางเป็นก้อนเรียงกัน คล้ายฝูงแกะบนท้องฟ้า",
    x: 46,
    y: 42,
    size: "md",
  },
  {
    id: "cumulus",
    thaiName: "คิวมูลัส",
    englishName: "Cumulus",
    altitude: "0.5-2 กม.",
    altitudeMinKm: 0.5,
    altitudeMaxKm: 2,
    layer: "โทรโพสเฟียร์ตอนล่าง",
    weather: "มักพบในวันที่อากาศแจ่มใส ถ้าก้อนโตขึ้นมากอาจพัฒนาเป็นเมฆฝน",
    description: "เมฆก้อนปุยฐานค่อนข้างแบน ยอดฟูคล้ายสำลี",
    x: 33,
    y: 66,
    size: "lg",
  },
  {
    id: "stratus",
    thaiName: "สเตรตัส",
    englishName: "Stratus",
    altitude: "0-2 กม.",
    altitudeMinKm: 0,
    altitudeMaxKm: 2,
    layer: "โทรโพสเฟียร์ตอนล่าง",
    weather: "ทำให้ท้องฟ้าครึ้ม อาจมีละอองฝนหรือหมอกบาง ๆ",
    description: "เมฆต่ำเป็นแผ่นปกคลุมกว้าง ดูเรียบและเทา",
    x: 68,
    y: 72,
    size: "lg",
  },
  {
    id: "cumulonimbus",
    thaiName: "คิวมูโลนิมบัส",
    englishName: "Cumulonimbus",
    altitude: "0.5-16 กม.",
    altitudeMinKm: 0.5,
    altitudeMaxKm: 16,
    layer: "โทรโพสเฟียร์แนวตั้ง",
    weather: "เกี่ยวข้องกับฝนหนัก ฟ้าร้อง ฟ้าผ่า และลมกระโชก",
    description: "เมฆพายุขนาดใหญ่ ฐานต่ำแต่ยอดสูงมาก บางครั้งยอดแผ่ออกคล้ายทั่ง",
    x: 24,
    y: 35,
    size: "lg",
  },
];

const atmosphereLayers = [
  { name: "เทอร์โมสเฟียร์", range: "85+ กม.", color: "from-indigo-950/90 to-blue-900/80" },
  { name: "มีโซสเฟียร์", range: "50-85 กม.", color: "from-blue-900/80 to-sky-700/70" },
  { name: "สตราโตสเฟียร์", range: "12-50 กม.", color: "from-sky-700/60 to-sky-400/55" },
  { name: "โทรโพสเฟียร์", range: "0-12 กม.", color: "from-sky-300/70 to-emerald-100/90" },
] as const;

const cloudSizeClasses = {
  sm: "h-14 w-24",
  md: "h-16 w-32",
  lg: "h-20 w-40",
} as const;

export default function AtmosphereLayersSimulation() {
  const labId = "atmosphere-layers";
  const [activeCloudId, setActiveCloudId] = useState("cumulus");
  const [infoOpen, setInfoOpen] = useState(false);

  const activeCloud = useMemo(
    () => cloudKinds.find((cloud) => cloud.id === activeCloudId) ?? cloudKinds[0],
    [activeCloudId],
  );

  const scene = (
    <div className="relative h-full min-h-[390px] overflow-hidden rounded-2xl border border-sky-100 bg-[#14355f]">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.22),transparent_18%),radial-gradient(circle_at_35%_72%,rgba(125,211,252,0.28),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.18),transparent_40%)]" />
      <div aria-hidden="true" className="absolute -right-24 top-8 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl" />
      <div className="absolute inset-0 grid grid-rows-4">
        {atmosphereLayers.map((layer, index) => (
          <div key={layer.name} className={`relative bg-gradient-to-b ${layer.color}`}>
            <div className="absolute left-5 top-4 rounded-full border border-white/35 bg-white/20 px-4 py-2 text-xs font-black text-white shadow-sm backdrop-blur-md">
              {layer.name} <span className="font-bold opacity-80">{layer.range}</span>
            </div>
            {index < atmosphereLayers.length - 1 && (
              <div aria-hidden="true" className="absolute inset-x-5 bottom-0 h-px bg-white/20" />
            )}
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-emerald-300/80 to-transparent" />
      <div className="absolute right-5 top-5 rounded-full border border-white/35 bg-white/20 px-4 py-2 text-xs font-black text-white shadow-sm backdrop-blur-md">
        0-100 กม. จากพื้นโลก
      </div>
      <div className="absolute inset-0">
        {cloudKinds.map((cloud) => {
          const isActive = cloud.id === activeCloud.id;
          return (
            <button
              key={cloud.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                setActiveCloudId(cloud.id);
                setInfoOpen(true);
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-[2rem] p-2 text-left transition hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/40 ${isActive ? "scale-105 bg-white/35 shadow-2xl shadow-blue-900/25" : "bg-white/10 shadow-lg shadow-sky-900/10"}`}
              style={{ left: `${cloud.x}%`, top: `${cloud.y}%` }}
            >
              <span className={`relative block ${cloudSizeClasses[cloud.size]}`}>
                <span className="absolute bottom-2 left-2 right-2 h-9 rounded-full bg-white shadow-lg" />
                <span className="absolute bottom-4 left-5 h-11 w-11 rounded-full bg-white shadow" />
                <span className="absolute bottom-5 left-12 h-14 w-14 rounded-full bg-white shadow" />
                <span className="absolute bottom-4 right-5 h-10 w-10 rounded-full bg-white shadow" />
                {cloud.id === "cumulonimbus" && (
                  <span className="absolute left-10 top-14 h-24 w-12 rounded-full bg-slate-200/90 shadow-inner" />
                )}
                <span className="absolute left-1/2 top-1/2 z-10 w-max -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 px-2 py-1 text-[10px] font-black text-white">
                  {cloud.thaiName}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="absolute bottom-4 right-4 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-xs font-black text-slate-700 shadow-lg shadow-sky-900/10 backdrop-blur">
        คลิกก้อนเมฆเพื่อดูข้อมูล
      </div>
      {infoOpen && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm" onClick={() => setInfoOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cloud-info-title"
            className="w-full max-w-lg rounded-[28px] border border-white/80 bg-white p-6 shadow-2xl shadow-slate-950/25"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">ข้อมูลก้อนเมฆ</p>
                <h3 id="cloud-info-title" className="mt-1 text-3xl font-black leading-relaxed text-slate-950">{activeCloud.thaiName}</h3>
                <p className="text-sm font-bold text-slate-500">{activeCloud.englishName}</p>
              </div>
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="ปิดข้อมูลเมฆ"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs font-black text-blue-600">ช่วงความสูง</p>
                <p className="mt-1 text-xl font-black text-blue-900">{activeCloud.altitude}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-black text-emerald-600">ชั้นที่เกี่ยวข้อง</p>
                <p className="mt-1 text-lg font-black leading-relaxed text-emerald-900">{activeCloud.layer}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm font-semibold leading-relaxed text-slate-700">
              <p>{activeCloud.description}</p>
              <p className="rounded-2xl bg-sky-50 p-4 text-slate-700">{activeCloud.weather}</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );

  const controls = (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
      <div className="flex items-start gap-3">
        <MousePointer2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div>
          <h3 className="text-base font-black text-slate-900">คลิกก้อนเมฆบนภาพ</h3>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">
            เลือกก้อนเมฆเพื่อเปิดข้อมูลกลางจอ ดูชื่อเมฆ ช่วงความสูง ชั้นบรรยากาศ และสภาพอากาศที่เกี่ยวข้อง
          </p>
        </div>
      </div>
    </div>
  );

  const graph = (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <h3 className="text-sm font-black text-slate-900">ช่วงความสูงของเมฆ</h3>
        <p className="text-xs font-semibold leading-relaxed text-slate-500">แถบแนวตั้งแสดงช่วงความสูงโดยประมาณของเมฆแต่ละชนิด</p>
      </div>
      <div className="grid gap-3">
        {cloudKinds.map((cloud) => (
          <div key={cloud.id} className="grid grid-cols-[7rem_minmax(0,1fr)_4rem] items-center gap-3 text-xs font-bold text-slate-600">
            <span className="truncate">{cloud.englishName}</span>
            <div className="relative h-3 rounded-full bg-slate-100">
              <div
                className="absolute top-0 h-3 rounded-full bg-gradient-to-r from-sky-400 to-blue-600"
                style={{
                  left: `${Math.min(100, (cloud.altitudeMinKm / 16) * 100)}%`,
                  width: `${Math.max(4, ((cloud.altitudeMaxKm - cloud.altitudeMinKm) / 16) * 100)}%`,
                }}
              />
            </div>
            <span className="text-right">{cloud.altitude}</span>
          </div>
        ))}
      </div>
    </section>
  );

  const table = (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-black text-slate-900">ตารางชนิดเมฆ</h3>
        <span className="text-xs font-black text-slate-400">{cloudKinds.length} ชนิด</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">เมฆ</th>
              <th className="px-4 py-3">ความสูง</th>
              <th className="px-4 py-3">ชั้นบรรยากาศ</th>
              <th className="px-4 py-3">ลักษณะเด่น</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {cloudKinds.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-black text-slate-900">{item.thaiName}</td>
                <td className="px-4 py-3">{item.altitude}</td>
                <td className="px-4 py-3">{item.layer}</td>
                <td className="px-4 py-3">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <SharedSimulationShell
      accent="cyan"
      labId={labId}
      category="Foundation"
      title="ชั้นบรรยากาศและก้อนเมฆ"
      subtitle="คลิกก้อนเมฆเพื่อดูชนิด ลักษณะ และระดับความสูงที่พบในชั้นบรรยากาศ"
      statusLabel={`กำลังดู ${activeCloud.thaiName} · ${activeCloud.altitude}`}
      icon={CloudRain}
      sceneTitle="แผนภาพชั้นบรรยากาศ"
      scene={scene}
      controlsTitle="วิธีสำรวจเมฆ"
      controls={controls}
      compactControls={controls}
      metrics={[
        { label: "เมฆที่เลือก", value: activeCloud.thaiName, tone: "cyan" },
        { label: "ช่วงความสูง", value: activeCloud.altitude, tone: "blue" },
        { label: "ชั้นที่เกี่ยวข้อง", value: activeCloud.layer, tone: "emerald" },
      ]}
      graph={graph}
      table={table}
      theory={<p className="leading-relaxed text-slate-600">เมฆเกิดจากไอน้ำควบแน่นเป็นหยดน้ำหรือผลึกน้ำแข็งในบรรยากาศ เมฆส่วนใหญ่เกิดในโทรโพสเฟียร์ประมาณ 0-12 กิโลเมตร แต่เมฆพายุบางชนิดอาจมีฐานต่ำและยอดสูงมาก การดูรูปร่างกับระดับความสูงช่วยจำแนกชนิดเมฆและคาดเดาสภาพอากาศเบื้องต้นได้</p>}
      steps={[
        { label: "ดูภาพรวมชั้นบรรยากาศ", icon: Layers },
        { label: "คลิกก้อนเมฆเพื่ออ่านรายละเอียด", icon: MousePointer2 },
        { label: "เปรียบเทียบช่วงความสูงของเมฆ", icon: CloudRain },
      ]}
      learningGoals={["จำแนกเมฆพื้นฐานจากรูปร่างและระดับความสูง", "บอกได้ว่าเมฆส่วนใหญ่เกิดในโทรโพสเฟียร์", "เชื่อมชนิดเมฆกับสภาพอากาศที่อาจพบ"]}
      progressLabel="การสำรวจเมฆ"
      progressValue="คลิกเมฆเพื่อดูข้อมูล"
      progressPercent={0}
      tips={["เมฆต่ำไม่จำเป็นต้องมีฝนเสมอไป ต้องดูสี ความหนา และการพัฒนาตัวร่วมกัน", "คิวมูโลนิมบัสเป็นเมฆแนวตั้ง จึงมีช่วงความสูงกว้างกว่าเมฆชนิดอื่น", "ค่าความสูงเป็นช่วงโดยประมาณ เพราะตำแหน่งจริงเปลี่ยนตามพื้นที่และฤดูกาล"]}
      showSaveButton={false}
      showLiveMetrics={false}
      showInfoTabs={false}
    />
  );
}
