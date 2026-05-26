"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/labs/Breadcrumb";
import LabHero from "@/components/labs/LabHero";
import InfoCard from "@/components/labs/InfoCard";
import EquipmentList from "@/components/labs/EquipmentList";
import ExperimentSteps from "@/components/labs/ExperimentSteps";
import TheoryCard from "@/components/labs/TheoryCard";
import LabSidebar from "@/components/labs/LabSidebar";
import DecorativeBackground from "@/components/labs/DecorativeBackground";
import BottomCallout from "@/components/BottomCallout";

import { ClipboardList, Target, X, CheckCircle, Sliders, Thermometer, Sun, Zap, RefreshCw, Play } from "lucide-react";

// Types
import { LabData } from "@/components/LabCard";

const labsData: Record<string, LabData> = {
  "newtons-cooling": {
    id: "newtons-cooling",
    title: "Newton's law of cooling",
    category: "Physics",
    status: "ว่าง",
    description: "ศึกษาการเปลี่ยนแปลงอุณหภูมิของวัตถุตามเวลา และเข้าใจความสัมพันธ์ตามกฎการเย็นตัวของนิวตัน วิเคราะห์สมการและสัมประสิทธิ์การแลกเปลี่ยนความร้อน"
  }
};

export default function LabDetailPage() {
  const params = useParams();
  const router = useRouter();
  const labId = (params?.id as string) || "newtons-cooling";

  // Fallback to Newton's Law of Cooling as primary demo
  const lab = labsData[labId] || labsData["newtons-cooling"];

  // Simulation states
  const [showSimModal, setShowSimModal] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simStage, setSimStage] = useState("");
  
  // Real-time Interactive Simulator Inputs
  const [initialTemp, setInitialTemp] = useState(90); // T0 (60 - 100)
  const [ambientTemp, setAmbientTemp] = useState(25); // Ts (10 - 40)
  const [coolingConstant, setCoolingConstant] = useState(0.04); // k (0.01 - 0.1)
  
  // Simulated Chart Data Points
  const [chartPoints, setChartPoints] = useState<{ x: number; y: number }[]>([]);

  // Calculate cooling curve data points when sliders change
  // Formula: T(t) = Ts + (T0 - Ts) * e^(-kt)
  useEffect(() => {
    const points = [];
    const totalTime = 60; // 60 minutes
    const step = 2.5; // step interval
    
    for (let t = 0; t <= totalTime; t += step) {
      const temp = ambientTemp + (initialTemp - ambientTemp) * Math.exp(-coolingConstant * t);
      points.push({ x: t, y: temp });
    }
    setChartPoints(points);
  }, [initialTemp, ambientTemp, coolingConstant]);

  const handleStartExperiment = () => {
    setShowSimModal(true);
    setSimProgress(0);
    setSimStage("กำลังเชื่อมต่อเซิร์ฟเวอร์จำลอง...");

    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + 25;
        if (next === 25) setSimStage("ดาวน์โหลดข้อมูลห้องปฏิบัติการฟิสิกส์เสมือน...");
        if (next === 50) setSimStage("ตรวจสอบทฤษฎีและตัวแปรควบคุม...");
        if (next === 75) setSimStage("ปรับแต่งเครื่องมือเทอร์โมมิเตอร์และสภาพแวดล้อม...");
        if (next === 100) setSimStage("เครื่องจำลองพร้อมใช้งานแล้ว! 🔬");
        return next;
      });
    }, 450);
  };

  const closeModal = () => {
    setShowSimModal(false);
  };

  // Convert mathematical coordinates to SVG viewbox coordinates (200w x 120h)
  const getSvgPath = () => {
    if (chartPoints.length === 0) return "";
    
    // SVG Dimensions: W=180 (starts at X=20), H=90 (starts at Y=10)
    // Math bounds: Time: 0 to 60. Temp: 0 to 100.
    const timeToSvgX = (t: number) => 20 + (t / 60) * 160;
    const tempToSvgY = (temp: number) => 100 - (temp / 100) * 90;

    return chartPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${timeToSvgX(p.x)},${tempToSvgY(p.y)}`)
      .join(" ");
  };

  const ambientY = 100 - (ambientTemp / 100) * 90;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-16 overflow-hidden">
      
      {/* Absolute Decorative Floating Elements */}
      <DecorativeBackground />

      {/* 1. Header/Navbar */}
      <Navbar />

      {/* 2. Breadcrumb Navigation */}
      <Breadcrumb category={lab.category} title={lab.title} />

      {/* 3. Hero Section Details */}
      <LabHero
        title={lab.title}
        category={lab.category}
        status={lab.status}
        description={lab.description}
        onStartExperiment={handleStartExperiment}
      />

      {/* 4. Two-Column Dashboard Content */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-12 md:px-20 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (70%) */}
          <div className="lg:col-span-8 space-y-7">
            {/* Overview & Objective cards (Grid layout side-by-side on desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard
                title="ภาพรวมการทดลอง"
                icon={ClipboardList}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                bullets={[
                  "ศึกษาการลดลงของอุณหภูมิของวัตถุร้อนในสภาพแวดล้อมควบคุมความเย็น",
                  "เก็บข้อมูลอุณหภูมิของวัตถุตามช่วงเวลาเพื่อสังเกตแนวโน้ม",
                  "วิเคราะห์และเปรียบเทียบผลลัพธ์กับสมการของกฎการเย็นตัวของนิวตัน"
                ]}
              />
              <InfoCard
                title="วัตถุประสงค์การเรียนรู้"
                icon={Target}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                bullets={[
                  "อธิบายหลักทฤษฎีกฎการเย็นตัวของนิวตันได้อย่างถูกต้อง",
                  "รู้วิธีเก็บและบันทึกข้อมูลอุณหภูมิในระบบแล็บฟิสิกส์ได้อย่างแม่นยำ",
                  "สามารถวิเคราะห์เส้นโค้งกราฟและตีความค่าคงที่อัตราการเย็นตัวได้"
                ]}
              />
            </div>

            {/* Equipment checklist section */}
            <EquipmentList />

            {/* Timelines Steps progress */}
            <ExperimentSteps />

            {/* Theoretical formulas and graph */}
            <TheoryCard />
          </div>

          {/* Right Sidebar Column (30%) */}
          <div className="lg:col-span-4">
            <LabSidebar />
          </div>

        </div>
      </main>

      {/* 5. Bottom callout banner */}
      <div className="w-full max-w-4xl mx-auto px-6 py-6 select-none relative z-10">
        <div className="relative overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-indigo-500/10 group hover:shadow-xl hover:shadow-indigo-500/15 transition-all duration-300">
          <div className="bg-white/95 rounded-full px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center shrink-0">🚀</span>
              <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent leading-relaxed tracking-wide">
                พร้อมเริ่มเรียนรู้แล้วหรือยัง? กดเริ่มทดลองและค้นพบการเปลี่ยนแปลงของอุณหภูมิไปพร้อมกัน!
              </p>
            </div>
            
            <button
              onClick={handleStartExperiment}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-indigo-500/10 shrink-0"
            >
              <span>เริ่มทดลอง</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Simulator Loading & Interactive Console Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">เครื่องทดลองเย็นตัวจำลองเสมือนจริง</span>
              </div>
              <button 
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="ปิดเครื่องมือ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              {simProgress < 100 ? (
                /* Loading Phase */
                <div className="flex flex-col items-center justify-center text-center py-10 space-y-6 select-none">
                  <div className="w-18 h-18 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                  <div className="space-y-2.5 w-full max-w-xs">
                    <p className="text-sm font-bold text-slate-700">{simStage}</p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${simProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Interactive Lab Simulation Interface */
                <div className="space-y-6">
                  {/* Banner Info */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-800 flex items-start gap-3 select-none">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold">จำลองระบบทำงานเรียบร้อย!</h4>
                      <p className="text-xs text-emerald-700/95 font-medium mt-0.5">
                        ลองปรับตั้งค่าตัวแปรจำลองด้านล่าง เพื่อดูการฟิตติ้งเส้นโค้งอุณหภูมิตามกฎนิวตันในทันที
                      </p>
                    </div>
                  </div>

                  {/* Two Column Layout for controls vs output */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Simulator Sliders (Left 5 Columns) */}
                    <div className="md:col-span-5 bg-slate-50 border border-slate-100 p-4.5 rounded-2xl space-y-4">
                      <h5 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2 select-none">
                        <Sliders className="w-4 h-4 text-indigo-500" />
                        ตัวแปรทดลองควบคุม
                      </h5>

                      {/* Slider 1: Initial Temp T0 */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold select-none">
                          <span className="text-slate-600 flex items-center gap-1">
                            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                            อุณหภูมิเริ่มต้น (T₀)
                          </span>
                          <span className="text-rose-600 font-extrabold">{initialTemp} °C</span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="100"
                          value={initialTemp}
                          onChange={(e) => setInitialTemp(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                      </div>

                      {/* Slider 2: Ambient Temp Ts */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold select-none">
                          <span className="text-slate-600 flex items-center gap-1">
                            <Sun className="w-3.5 h-3.5 text-emerald-500" />
                            อุณหภูมิแวดล้อม (T<sub>s</sub>)
                          </span>
                          <span className="text-emerald-600 font-extrabold">{ambientTemp} °C</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="40"
                          value={ambientTemp}
                          onChange={(e) => setAmbientTemp(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>

                      {/* Slider 3: Cooling Rate Constant k */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold select-none">
                          <span className="text-slate-600 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-blue-500" />
                            อัตราการเย็นตัว (k)
                          </span>
                          <span className="text-blue-600 font-extrabold">{coolingConstant.toFixed(3)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.01"
                          max="0.1"
                          step="0.005"
                          value={coolingConstant}
                          onChange={(e) => setCoolingConstant(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>

                      {/* Reset button */}
                      <button
                        onClick={() => {
                          setInitialTemp(90);
                          setAmbientTemp(25);
                          setCoolingConstant(0.04);
                        }}
                        className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>คืนค่าเริ่มต้น</span>
                      </button>
                    </div>

                    {/* Output Real-time Graph (Right 7 Columns) */}
                    <div className="md:col-span-7 flex flex-col items-center">
                      <div className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-center">
                        <svg className="w-full h-44" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Grid Lines */}
                          <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                          <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />

                          {/* Axes labels */}
                          <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">100</text>
                          <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">75</text>
                          <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">50</text>
                          <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">25</text>

                          {/* Ambient Temp Ts line */}
                          <line x1="20" y1={ambientY} x2="180" y2={ambientY} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
                          <text x="183" y={ambientY + 2} fill="#10b981" fontSize="7" fontWeight="extrabold">Tₛ</text>

                          {/* Interactive Cooling Curve path */}
                          <path d={getSvgPath()} stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                          {/* Horizontal axis time line */}
                          <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                          
                          {/* Time tick labels */}
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                          <text x="60" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">15</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">30</text>
                          <text x="140" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">45</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">60</text>
                          
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">นาที</text>
                        </svg>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 select-none">
              {simProgress < 100 ? (
                <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold cursor-not-allowed">
                  กำลังดาวน์โหลดแบบจำลอง...
                </button>
              ) : (
                <button 
                  onClick={() => {
                    router.push(`/labs/${labId}/simulation`);
                    closeModal();
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>เข้าสู่ห้องทดลองจำลอง 🔬</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
