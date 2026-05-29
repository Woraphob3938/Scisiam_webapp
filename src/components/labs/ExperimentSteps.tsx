"use client";

import React from "react";
import { ListOrdered, Thermometer, Timer, ClipboardList, LineChart, ChevronRight, Zap, Sliders, Ruler, FlaskConical, Droplets, Gauge, Flame, Leaf, Sun, Wind, Dna, Microscope, Shuffle, Activity } from "lucide-react";

interface ExperimentStepsProps {
  labId?: string;
}

export default function ExperimentSteps({ labId = "newtons-cooling" }: ExperimentStepsProps) {
  const isOhmsLaw = labId === "ohms-law";
  const isAcidBase = labId === "acid-base-titration";
  const isBoylesLaw = labId === "boyles-law";
  const isCharlesLaw = labId === "charles-law";
  const isPhotosynthesis = labId === "photosynthesis-rate";
  const isMendelian = labId === "mendels-inheritance";
  const isMitosis = labId === "mitosis-division";

  const coolingSteps = [
    {
      num: 1,
      title: "เตรียมสารละลายร้อน",
      desc: "เตรียมน้ำร้อน in บีกเกอร์ และวัดอุณหภูมิเริ่มต้น (T₀)",
      icon: Thermometer,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "วางในสิ่งแวดล้อมควบคุม",
      desc: "วางบีกเกอร์ในสภาพแวดล้อมที่อุณหภูมิคงที่ และเริ่มจับเวลา",
      icon: Timer,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      num: 3,
      title: "บันทึกอุณหภูมิสม่ำเสมอ",
      desc: "บันทึกค่าอุณหภูมิทุกช่วงเวลาอย่างสม่ำเสมอ",
      icon: ClipboardList,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "วิเคราะห์สมการนิวตัน",
      desc: "สร้างกราฟและวิเคราะห์ข้อมูลเปรียบเทียบกับสมการ",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const ohmsLawSteps = [
    {
      num: 1,
      title: "ต่อวงจรไฟฟ้ากระแสตรง",
      desc: "ต่อเครื่องจ่ายไฟ ตัวต้านทาน และแอมมิเตอร์แบบอนุกรมให้ครบวงจร",
      icon: Zap,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "ตั้งค่าความต้านทาน",
      desc: "กำหนดขนาดความต้านทานไฟฟ้า (R) คงที่ค่าหนึ่งสำหรับใช้ในการวัด",
      icon: Sliders,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      num: 3,
      title: "ปรับแรงดันไฟฟ้า",
      desc: "ค่อย ๆ ปรับแรงดันไฟฟ้า (V) จากแหล่งจ่ายขึ้นทีละระดับอย่างช้า ๆ",
      icon: Timer,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "บันทึกผลการทดลอง",
      desc: "อ่านค่ากระแสไฟฟ้า (I) ที่ผ่านตัวต้านทานและแอมมิเตอร์เพื่อนำไปพล็อตกราฟ",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];
  const hookesLawSteps = [
    {
      num: 1,
      title: "แขวนสปริงบนขาตั้ง",
      desc: "ตั้งขาตั้งให้มั่นคงและแขวนสปริงในแนวดิ่ง บันทึกตำแหน่งสมดุลเริ่มต้น",
      icon: Ruler,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "เพิ่มตุ้มน้ำหนักทีละขั้น",
      desc: "ค่อย ๆ แขวนตุ้มน้ำหนักเพิ่มทีละก้อนอย่างช้า ๆ รอให้ระบบอยู่ในสมดุล",
      icon: Sliders,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      num: 3,
      title: "วัดระยะยืดของสปริง",
      desc: "อ่านค่าระยะยืดจากไม้บรรทัดที่ระดับสายตาอย่างแม่นยำ",
      icon: ClipboardList,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "พล็อตกราฟ F-x",
      desc: "นำข้อมูลแรงและระยะยืดมาพล็อตกราฟเพื่อหาค่าคงที่สปริง (k)",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const acidBaseSteps = [
    {
      num: 1,
      title: "เตรียมสารตัวอย่าง",
      desc: "ใช้ปิเปตตวงสารกรดหรือเบสลงขวดรูปชมพู่และหยดอินดิเคเตอร์",
      icon: FlaskConical,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      num: 2,
      title: "เติมสารมาตรฐานในบิวเรต",
      desc: "ล้างบิวเรต ไล่ฟองอากาศ และตั้งค่าปริมาตรเริ่มต้นให้พร้อม",
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 3,
      title: "หยดและติดตาม pH",
      desc: "หยดสารทีละช่วงพร้อมแกว่งขวดและอ่านค่า pH อย่างต่อเนื่อง",
      icon: ClipboardList,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "หาจุดสมมูล",
      desc: "พล็อตกราฟ pH-volume เพื่อระบุจุดสมมูลและคำนวณความเข้มข้น",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const boylesLawSteps = [
    {
      num: 1,
      title: "ตั้งระบบแก๊สปิด",
      desc: "เตรียมกระบอกแก๊สและตรวจให้ลูกสูบกับข้อต่อไม่มีการรั่ว",
      icon: FlaskConical,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      num: 2,
      title: "กำหนดปริมาตรเริ่มต้น",
      desc: "ตั้งปริมาตรแก๊สเริ่มต้นและคงอุณหภูมิของระบบให้เสถียร",
      icon: Sliders,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 3,
      title: "อ่านค่าความดัน",
      desc: "ปรับลูกสูบทีละช่วงและบันทึกความดันจากเกจเมื่อค่าเริ่มนิ่ง",
      icon: Gauge,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "พล็อตกราฟ P-V",
      desc: "นำข้อมูลความดันและปริมาตรมาวิเคราะห์ความสัมพันธ์แบบผกผัน",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const charlesLawSteps = [
    {
      num: 1,
      title: "ตั้งระบบความดันคงที่",
      desc: "เตรียมกระบอกแก๊สพร้อมลูกสูบให้ขยับได้อิสระและระบบไม่รั่ว",
      icon: Gauge,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      num: 2,
      title: "กำหนดอุณหภูมิเริ่มต้น",
      desc: "วัดอุณหภูมิแก๊สเริ่มต้นและแปลงเป็นหน่วยเคลวินก่อนคำนวณ",
      icon: Thermometer,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      num: 3,
      title: "ปรับอ่างน้ำควบคุม",
      desc: "เพิ่มหรือลดอุณหภูมิทีละช่วง แล้วรอให้ปริมาตรนิ่งก่อนอ่านค่า",
      icon: Flame,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      num: 4,
      title: "พล็อตกราฟ V-T",
      desc: "นำข้อมูลปริมาตรและอุณหภูมิสัมบูรณ์มาวิเคราะห์ความสัมพันธ์แบบเส้นตรง",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const photosynthesisSteps = [
    {
      num: 1,
      title: "เตรียมห้องพืชปิด",
      desc: "วางต้นพืชใน chamber และตรวจให้ระบบวัดแก๊สพร้อมทำงาน",
      icon: Leaf,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 2,
      title: "ปรับความเข้มแสง",
      desc: "ตั้งระดับแสงจากโคมไฟและรอให้ระบบเข้าสู่สมดุล",
      icon: Sun,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      num: 3,
      title: "ควบคุม CO₂ และน้ำ",
      desc: "ปรับระดับคาร์บอนไดออกไซด์และน้ำเพื่อศึกษาปัจจัยจำกัด",
      icon: Wind,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      num: 4,
      title: "วิเคราะห์กราฟอัตรา",
      desc: "ติดตาม O₂ และอัตราสังเคราะห์แสงเพื่อสรุปสภาพที่เหมาะสม",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const mendelianSteps = [
    {
      num: 1,
      title: "เลือกพ่อแม่",
      desc: "กำหนด genotype ของพ่อแม่ทั้งสองสำหรับลักษณะที่ต้องการศึกษา",
      icon: Dna,
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
    {
      num: 2,
      title: "สร้างตาราง Punnett",
      desc: "จับคู่แอลลีลจาก gamete ของพ่อแม่เพื่อดูความเป็นไปได้ของรุ่นลูก",
      icon: ClipboardList,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      num: 3,
      title: "สุ่มรุ่นลูก",
      desc: "จำลองลูกหลานหลายตัวอย่างเพื่อดูสัดส่วนสะสม",
      icon: Shuffle,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "เปรียบเทียบอัตราส่วน",
      desc: "นับ genotype และ phenotype แล้วเทียบกับค่าทฤษฎี",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const mitosisSteps = [
    {
      num: 1,
      title: "เตรียมเซลล์",
      desc: "เริ่มจาก Interphase ที่ DNA ถูกจำลองก่อนแบ่งเซลล์",
      icon: Microscope,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      num: 2,
      title: "โครโมโซมขดแน่น",
      desc: "เข้าสู่ Prophase และเตรียมโครงสร้าง spindle",
      icon: Dna,
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
    {
      num: 3,
      title: "เรียงและแยก",
      desc: "Metaphase เรียงกลางเซลล์ ก่อน Anaphase แยกโครมาทิด",
      icon: Activity,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      num: 4,
      title: "เกิดเซลล์ลูก",
      desc: "Telophase และ Cytokinesis ทำให้ได้เซลล์ลูกสองเซลล์",
      icon: LineChart,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  const isHookesLaw = labId === "hookes-law";
  const steps = isMitosis ? mitosisSteps : isMendelian ? mendelianSteps : isPhotosynthesis ? photosynthesisSteps : isCharlesLaw ? charlesLawSteps : isBoylesLaw ? boylesLawSteps : isAcidBase ? acidBaseSteps : isHookesLaw ? hookesLawSteps : isOhmsLaw ? ohmsLawSteps : coolingSteps;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6">
      <h2 className="text-base font-bold text-slate-900 mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
        <ListOrdered className="w-5 h-5 text-indigo-500" />
        ขั้นตอนการทดลอง
      </h2>

      {/* 1. Desktop Layout (Horizontal Timeline) */}
      <div className="hidden md:flex items-start justify-between relative gap-2 py-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.num}>
              {/* Step Card */}
              <div className="flex-1 flex flex-col items-center text-center group" aria-label={`ขั้นตอนที่ ${step.num}: ${step.title}`}>
                {/* Step Circle with Icon */}
                <div className="relative mb-3.5">
                  <div className="absolute -top-1.5 -right-1.5 z-10 w-6 h-6 bg-indigo-600 text-white font-extrabold text-xs rounded-full flex items-center justify-center border-2 border-white shadow-xs" aria-hidden="true">
                    {step.num}
                  </div>
                  <div className={`w-12 h-12 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center border border-white`} aria-hidden="true">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Step Description */}
                <h3 className="text-xs font-bold text-slate-700 mb-1 max-w-[120px]">{step.title}</h3>
                <p className="text-[11px] text-slate-400 font-semibold max-w-[150px] leading-relaxed leading-1.4">
                  {step.desc}
                </p>
              </div>

              {/* Connecting Chevron (skip after final item) */}
              {idx < steps.length - 1 && (
                <div className="flex items-center justify-center pt-5 text-slate-300" aria-hidden="true">
                  <ChevronRight className="w-5 h-5 animate-pulse" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 2. Mobile & Tablet Layout (Vertical Timeline) */}
      <div className="flex md:hidden flex-col gap-5 relative pl-4 border-l border-slate-100">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="flex gap-4 relative group" aria-label={`ขั้นตอนที่ ${step.num}: ${step.title}`}>
              {/* Vertical Connector Line Indicator */}
              <div className="absolute -left-[25px] top-1.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-4 ring-slate-50 z-10" aria-hidden="true">
                {step.num}
              </div>

              {/* Small Icon Badge */}
              <div className={`w-10 h-10 rounded-xl ${step.bg} ${step.color} flex items-center justify-center shadow-xs shrink-0`} aria-hidden="true">
                <Icon className="w-5 h-5" />
              </div>

              {/* Text Info */}
              <div className="flex flex-col text-left justify-center">
                <h3 className="text-xs font-bold text-slate-700">{step.title}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 font-semibold leading-relaxed mt-0.5 leading-1.4">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
