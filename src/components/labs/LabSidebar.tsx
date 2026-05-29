"use client";

import React from "react";
import { BarChart2, Clock, Sparkles, Languages, CheckSquare, Info, ShieldAlert, Award, Beaker } from "lucide-react";

interface LabSidebarProps {
  labId?: string;
}

export default function LabSidebar({ labId = "newtons-cooling" }: LabSidebarProps) {
  const isOhmsLaw = labId === "ohms-law";
  const isHookesLaw = labId === "hookes-law";
  const isAcidBase = labId === "acid-base-titration";
  const isBoylesLaw = labId === "boyles-law";
  const isCharlesLaw = labId === "charles-law";
  const isPhotosynthesis = labId === "photosynthesis-rate";
  const isMendelian = labId === "mendels-inheritance";
  const isMitosis = labId === "mitosis-division";

  // 1. Lab details rows
  const labInfoRows = [
    { label: "ระดับ", value: "ปานกลาง", icon: BarChart2, color: "text-amber-500", valColor: "text-amber-600 font-bold" },
    { label: "เวลา", value: "20–30 นาที", icon: Clock, color: "text-blue-500", valColor: "text-slate-700 font-bold" },
    { label: "คะแนนที่ได้รับ", value: "+25 คะแนน", icon: Sparkles, color: "text-amber-500", valColor: "text-amber-600 font-bold" },
    { label: "ภาษา", value: "ไทย 🇹🇭", icon: Languages, color: "text-indigo-500", valColor: "text-slate-700 font-semibold" },
  ];

  const adviceList = [
    "ตรวจสอบอุปกรณ์ให้พร้อมและปลอดภัยก่อนกดเริ่มทำการทดลอง",
    isMitosis
      ? "สังเกตตำแหน่งโครโมโซมในแต่ละระยะและอย่าข้าม checkpoint ก่อนเปรียบเทียบผล"
      : isMendelian
      ? "เริ่มจากการอ่าน genotype ของพ่อแม่ แล้วใช้ตาราง Punnett ตรวจสัดส่วนก่อนสุ่มตัวอย่าง"
      : isPhotosynthesis
      ? "ปรับทีละปัจจัย เช่น แสงหรือ CO₂ เพื่อดูปัจจัยจำกัดของอัตราการสังเคราะห์แสงอย่างชัดเจน"
      : isCharlesLaw
      ? "ใช้อุณหภูมิหน่วยเคลวินในการตรวจสอบอัตราส่วน V/T และรอให้ลูกสูบนิ่งก่อนบันทึกปริมาตร"
      : isBoylesLaw
      ? "ปรับลูกสูบทีละช่วงและรอให้ความดันนิ่งก่อนบันทึกค่าเพื่อให้กราฟ P-V แม่นยำ"
      : isAcidBase
      ? "อ่านค่าปริมาตรจากบิวเรตที่ระดับสายตาและหยดสารช้าลงเมื่อ pH เปลี่ยนเร็ว"
      : isHookesLaw
      ? "ค่อย ๆ เพิ่มตุ้มน้ำหนักทีละก้อนเพื่อให้ระบบอยู่ในสมดุลก่อนอ่านค่าระยะยืด"
      : isOhmsLaw 
      ? "บันทึกข้อมูลค่ากระแสไฟฟ้าและแรงดันไฟฟ้าอย่างสม่ำเสมอเพื่อความแม่นยำของกราฟ" 
      : "บันทึกข้อมูลและค่าอุณหภูมิอย่างสม่ำเสมอเพื่อความแม่นยำของกราฟ",
    "สังเกตและจดบันทึกสิ่งต่าง ๆ ที่เกิดขึ้นระหว่างการทดลองลงในสมุดบันทึก",
  ];

  return (
    <aside className="w-full flex flex-col gap-4 select-none lg:sticky lg:top-24 self-start">
      
      {/* CARD 1: ข้อมูลห้องแล็บ */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Info className="w-4.5 h-4.5 text-blue-500" />
          ข้อมูลห้องแล็บ
        </h3>
        <div className="divide-y divide-slate-100">
          {labInfoRows.map((row, idx) => {
            const Icon = row.icon;
            return (
              <div key={idx} className="flex items-center justify-between py-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-slate-400 font-semibold">
                  <Icon className={`w-4.5 h-4.5 ${row.color}`} />
                  <span>{row.label}</span>
                </div>
                <span className={row.valColor}>{row.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CARD 2: ความคืบหน้า */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
            ความคืบหน้า
          </h3>
          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            60%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2">
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100} aria-label="ความคืบหน้าการทำแล็บ">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: "60%" }} />
          </div>
          <p className="text-[11px] text-slate-400 font-semibold text-left">
            ทำไปแล้ว 3 / 5 ขั้นตอน
          </p>
        </div>
      </div>

      {/* CARD 3: คำแนะนำก่อนเริ่ม */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3.5 flex items-center gap-2">
          <ShieldAlert className="w-4.5 h-4.5 text-amber-500" />
          คำแนะนำก่อนเริ่ม
        </h3>
        <ul className="space-y-2.5 text-left">
          {adviceList.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
              <p className="text-[11px] sm:text-xs text-slate-400 font-semibold leading-relaxed leading-1.4">
                {bullet}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* CARD 4: ภารกิจนักวิทย์ */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/5 rounded-bl-full" />
        
        <div className="flex items-center gap-2.5 mb-3 border-b border-slate-50 pb-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">ภารกิจนักวิทย์</h3>
            <p className="text-[10px] text-slate-400 font-semibold">เก็บครบ 5 ห้อง</p>
          </div>
        </div>

        {/* Progress details */}
        <div className="space-y-2">
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100} aria-label="ความคืบหน้าภารกิจนักวิทย์">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500 group-hover:scale-x-105 origin-left" style={{ width: "60%" }} />
          </div>
          
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-slate-400 flex items-center gap-1">
              <Beaker className="w-3.5 h-3.5 text-purple-500" />
              Progress
            </span>
            <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              3 / 5 ห้อง
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
}
