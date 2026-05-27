"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import LabCard, { LabData } from "@/components/LabCard";
import { LeftDecorations, RightDecorations } from "@/components/DecorativeElements";
import BottomCallout from "@/components/BottomCallout";
import { Play, BookOpen, X, CheckCircle, HelpCircle } from "lucide-react";

// Mock lab data based on system requirements
const labsData: LabData[] = [
  {
    id: "newtons-cooling",
    title: "Newton's law of cooling",
    category: "Physics",
    status: "ว่าง",
    description: "เรียนรู้เกี่ยวกับการระบายความร้อนของวัตถุตามกฎการเย็นตัวของนิวตัน วิเคราะห์อัตราการสูญเสียความร้อนสอดคล้องกับอุณหภูมิแวดล้อมจำลอง"
  },
  {
    id: "acid-base-titration",
    title: "Acid-Base Titration Lab",
    category: "Chemistry",
    status: "ว่าง",
    description: "ทดลองวัดและหาค่าความเข้มข้นของกรดหรือเบสผ่านกระบวนการไทเทรตทางเคมี ติดตามระดับ pH และการเปลี่ยนสีของอินดิเคเตอร์แบบเรียลไทม์"
  },
  {
    id: "photosynthesis-rate",
    title: "Photosynthesis Rate Chamber",
    category: "Biology",
    status: "ว่าง",
    description: "ศึกษาระดับกระบวนการสังเคราะห์แสงของพืชสีเขียวในห้องทดลองปิด วิเคราะห์ผลกระทบของแสง ระดับคาร์บอนไดออกไซด์ และอุณหภูมิ"
  }
];

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [activeModal, setActiveModal] = useState<{ type: "details" | "enter"; lab: LabData } | null>(null);
  const [enterProgress, setEnterProgress] = useState(0);
  const [enterStage, setEnterStage] = useState("");

  const filteredLabs = labsData.filter((lab) => {
    if (selectedCategory === "All") return true;
    return lab.category === selectedCategory;
  });

  const handleViewDetails = (id: string) => {
    router.push(`/labs/${id}`);
  };

  const handleEnterRoom = (id: string) => {
    const lab = labsData.find((l) => l.id === id);
    if (lab) {
      setActiveModal({ type: "enter", lab });
      setEnterProgress(0);
      setEnterStage("กำลังเชื่อมต่อเซิร์ฟเวอร์จำลอง...");

      // Simulate step-by-step loading for the lab entry
      const interval = setInterval(() => {
        setEnterProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const next = prev + 25;
          if (next === 25) setEnterStage("ดาวน์โหลดข้อมูลห้องปฏิบัติการเสมือน...");
          if (next === 50) setEnterStage("จัดเตรียมเครื่องมือวัดและสารเคมี...");
          if (next === 75) setEnterStage("ตรวจสอบความปลอดภัยห้องปฏิบัติการ...");
          if (next === 100) setEnterStage("ห้องแล็บพร้อมใช้งานแล้ว! 🚀");
          return next;
        });
      }, 500);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans antialiased pb-12 selection:bg-indigo-500 selection:text-white">
      {/* 1. Header / Navbar */}
      <Navbar />

      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Filter Category Section */}
      <CategoryFilter
        activeCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* 4. Responsive Grid Layout */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 md:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Decorations (Pushes to bottom on mobile, side-aligned on desktop) */}
          <div className="lg:col-span-2 order-2 lg:order-1 flex justify-center">
            <LeftDecorations />
          </div>

          {/* Center Column: Lab Card Grid */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            {filteredLabs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center gap-3">
                <HelpCircle className="w-12 h-12 text-slate-300" />
                <h4 className="font-bold text-slate-700 text-lg">ไม่พบห้องแล็บในหมวดหมู่นี้</h4>
                <p className="text-sm text-slate-400">กรุณาเลือกหมวดหมู่อื่นเพื่อค้นหาห้องแล็บทดลอง</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6.5">
                {filteredLabs.map((lab) => (
                  <div key={lab.id} className="h-full">
                    <LabCard
                      lab={lab}
                      onViewDetails={handleViewDetails}
                      onEnterRoom={handleEnterRoom}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column Decorations (Pushes to bottom on mobile, side-aligned on desktop) */}
          <div className="lg:col-span-2 order-3 flex justify-center">
            <RightDecorations />
          </div>

        </div>
      </div>

      {/* 5. Bottom Callout Banner */}
      <BottomCallout />

      {/* 6. Dynamic Pop-up Modal (Details / Room Entry) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                activeModal.lab.category === "Physics"
                  ? "bg-blue-50 text-blue-700 border-blue-100"
                  : activeModal.lab.category === "Chemistry"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-green-50 text-green-700 border-green-100"
              }`}>
                {activeModal.lab.category}
              </span>
              <button 
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 tracking-tight">
                {activeModal.lab.title}
              </h3>
              
              {activeModal.type === "details" ? (
                /* Detail Modal View */
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {activeModal.lab.description}
                  </p>
                  
                  {/* Mock Lab Metadata & Specifications */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs sm:text-sm text-slate-600 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">ระดับการศึกษา:</span>
                      <span className="font-bold text-slate-700">มัธยมศึกษาตอนปลาย - อุดมศึกษา</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">เวลาการทดลองเฉลี่ย:</span>
                      <span className="font-bold text-slate-700">20 - 30 นาที</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">หน่วยการเรียนรู้:</span>
                      <span className="font-bold text-slate-700">
                        {activeModal.lab.category === "Physics" ? "ความร้อนและเทอร์โมไดนามิกส์" : activeModal.lab.category === "Chemistry" ? "กรด-เบสและสารละลาย" : "สรีรวิทยาและพลังงานพืช"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-400 leading-relaxed font-semibold">
                      ห้องแล็บนี้รองรับระบบจำลองกราฟิกสามมิติ พร้อมใบรายงานกิจกรรมการทดลองที่สามารถดาวน์โหลดได้หลังจากทำแบบฝึกหัดเสร็จสิ้น
                    </div>
                  </div>
                </div>
              ) : (
                /* Enter Room loading simulation */
                <div className="space-y-6 py-4 flex flex-col items-center text-center">
                  {enterProgress < 100 ? (
                    <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-indigo-500 animate-spin flex items-center justify-center shadow-inner" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-emerald-100">
                      <CheckCircle className="w-10 h-10 animate-bounce" />
                    </div>
                  )}

                  <div className="space-y-1.5 w-full">
                    <p className="text-sm font-bold text-slate-700 transition-colors">
                      {enterStage}
                    </p>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${enterProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3.5">
              {activeModal.type === "details" ? (
                <>
                  <button 
                    onClick={closeModal}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    ปิดหน้านี้
                  </button>
                  <button 
                    onClick={() => handleEnterRoom(activeModal.lab.id)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>เข้าสู่บทเรียนจำลอง</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    if (activeModal) {
                      router.push(`/labs/${activeModal.lab.id}/simulation`);
                      closeModal();
                    }
                  }}
                  disabled={enterProgress < 100}
                  className={`
                    w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer
                    ${
                      enterProgress < 100 
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none" 
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10"
                    }
                  `}
                >
                  {enterProgress < 100 ? "กำลังเตรียมการห้องแล็บ..." : "เริ่มทำแล็บวิทยาศาสตร์กันเลย! 🔬"}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
