"use client";

import React from "react";
import { Target, CheckCircle2, Award, HelpCircle, Check } from "lucide-react";

interface LearningSidebarProps {
  questProgress?: number;
  questSuccess?: boolean;
}

export default function LearningSidebar({
  questProgress = 0,
  questSuccess = false,
}: LearningSidebarProps) {
  return (
    <aside className="w-full flex flex-col gap-6 select-none">
      
      {/* 1. เป้าหมายการเรียนรู้ */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all duration-300">
        <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-3 flex items-center gap-2 border-b border-slate-50 pb-2">
          <Target className="w-4.5 h-4.5 text-indigo-500" />
          เป้าหมายการเรียนรู้
        </h4>
        <ul className="space-y-2 text-left">
          {[
            "เข้าใจกฎการเย็นตัวของนิวตัน",
            "อธิบายความสัมพันธ์ระหว่างอุณหภูมิและเวลา",
            "ใช้กราฟเพื่อตีความหมายข้อมูลการทดลอง",
            "คำนวณและหาค่าคงที่การเย็นตัว (k)",
          ].map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span className="text-[11px] sm:text-xs text-slate-500 font-semibold leading-relaxed">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. ความคืบหน้า */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
            ความคืบหน้า
          </h4>
          <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            70%
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "70%" }} />
          </div>
          <p className="text-[10px] text-slate-400 font-semibold text-left">
            ทำไปแล้ว 7 / 10 ขั้นตอน
          </p>
        </div>
      </div>

      {/* 3. ภารกิจนักวิทย์ */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-purple-500" />
            ภารกิจนักวิทย์
          </h4>
          <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
            {questSuccess ? "5 / 5" : "4 / 5"}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-300" 
              style={{ width: questSuccess ? "100%" : `${80 + (questProgress / 20) * 20}%` }} 
            />
          </div>
          <p className="text-[10px] text-slate-400 font-semibold text-left">
            {questSuccess 
              ? "ยินดีด้วย! คุณคุมความร้อนในภารกิจแล็บฟิสิกส์สำเร็จ"
              : `คุมอุณหภูมิ 50-60°C: ${questProgress.toFixed(1)} / 20.0 วินาที`}
          </p>
        </div>
      </div>

      {/* 4. คำแนะนำในการทดลอง */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all duration-300">
        <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-3 flex items-center gap-2">
          <HelpCircle className="w-4.5 h-4.5 text-amber-500" />
          คำแนะนำในการทดลอง
        </h4>
        <ul className="space-y-2 text-left">
          {[
            "ตรวจสอบการตั้งค่าตัวแปรจำลองให้เรียบร้อยก่อนกดเริ่มการทดลอง",
            "บันทึกข้อมูลอย่างสม่ำเสมอเพื่อความถูกต้องและต่อเนื่องของตารางข้อมูล",
            "สังเกตอัตราการเปลี่ยนแปลงอุณหภูมิเทียบกับค่ากราฟจำลอง",
            "หน่วยอุณหภูมิที่ใช้งานในการทดลองนี้อิงองศาเซลเซียส (°C) เป็นหลัก",
          ].map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
              <p className="text-[10px] sm:text-xs text-slate-400 font-semibold leading-relaxed">
                {bullet}
              </p>
            </li>
          ))}
        </ul>
      </div>

    </aside>
  );
}
