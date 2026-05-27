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
    status: "",
    description: "ศึกษาการเปลี่ยนแปลงอุณหภูมิของวัตถุตามเวลา และเข้าใจความสัมพันธ์ตามกฎการเย็นตัวของนิวตัน วิเคราะห์สมการและสัมประสิทธิ์การแลกเปลี่ยนความร้อน"
  },
  "ohms-law": {
    id: "ohms-law",
    title: "Ohm's Law & DC Circuits",
    category: "Physics",
    status: "",
    description: "ศึกษาความสัมพันธ์ระหว่างความต่างศักย์ กระแสไฟฟ้า และความต้านทานในวงจรไฟฟ้ากระแสตรงตามกฎของโอห์ม"
  },
  "hookes-law": {
    id: "hookes-law",
    title: "Hooke's Law of Elasticity",
    category: "Physics",
    status: "",
    description: "ศึกษาความยืดหยุ่นของสปริงและแรงดึงกลับตามระยะยืด วิเคราะห์ค่าคงตัวของสปริงตามกฎของฮุค"
  },
  "snells-law": {
    id: "snells-law",
    title: "Snell's Law of Refraction",
    category: "Physics",
    status: "",
    description: "ศึกษาดัชนีหักเหของแสงและการเดินทางผ่านตัวกลางต่างชนิดกัน วิเคราะห์ความสัมพันธ์ของมุมตามกฎของสเนลล์"
  },
  "ideal-gas-law": {
    id: "ideal-gas-law",
    title: "Ideal Gas Law Simulation",
    category: "Physics",
    status: "",
    description: "วิเคราะห์การเปลี่ยนแปลงสถานะของแก๊สอุดมคติผ่านการเปลี่ยนตัวแปรความดัน ปริมาตร และอุณหภูมิ"
  },
  "newtons-second-law": {
    id: "newtons-second-law",
    title: "Newton's Second Law of Motion",
    category: "Physics",
    status: "",
    description: "ศึกษาผลของแรงลัพธ์และมวลที่มีต่อความเร่งของวัตถุจำลองตามกฎการเคลื่อนที่ข้อที่สองของนิวตัน"
  },
  "momentum-conservation": {
    id: "momentum-conservation",
    title: "Conservation of Linear Momentum",
    category: "Physics",
    status: "",
    description: "จำลองการชนของวัตถุบนแนวเส้นตรงเพื่อวิเคราะห์การอนุรักษ์โมเมนตัมและพลังงานจลน์ในการชน"
  },
  "faradays-law": {
    id: "faradays-law",
    title: "Faraday's Electromagnetic Induction",
    category: "Physics",
    status: "",
    description: "ศึกษาการเกิดกระแสไฟฟ้าเหนี่ยวนำและแรงเคลื่อนไฟฟ้าเหนี่ยวนำจากการเปลี่ยนแปลงของฟลักซ์แม่เหล็ก"
  },
  "bernoullis-principle": {
    id: "bernoullis-principle",
    title: "Bernoulli's Principle & Fluid Dynamics",
    category: "Physics",
    status: "",
    description: "ศึกษาความสัมพันธ์ระหว่างความเร็วและความดันของของไหลในท่อที่มีหน้าตัดต่างกันตามหลักการแบร์นูลลี"
  },
  "photoelectric-effect": {
    id: "photoelectric-effect",
    title: "Einstein's Photoelectric Effect",
    category: "Physics",
    status: "",
    description: "วิเคราะห์พลังงานจลน์สูงสุดของโฟโตอิเล็กตรอนที่หลุดจากผิวโลหะตามฟังก์ชันงานและความถี่ของแสง"
  },
  "keplers-laws": {
    id: "keplers-laws",
    title: "Kepler's Third Law of Planetary Motion",
    category: "Physics",
    status: "",
    description: "วิเคราะห์คาบการโคจรและระยะห่างเฉลี่ยจากดวงอาทิตย์ของดาวเคราะห์จำลองตามกฎข้อที่สามของเคปเลอร์"
  },
  "stefan-boltzmann": {
    id: "stefan-boltzmann",
    title: "Stefan-Boltzmann Law of Blackbody Radiation",
    category: "Physics",
    status: "",
    description: "ศึกษาอัตราการแผ่รังสีความร้อนของวัตถุดำและอัตราการสูญเสียพลังงานที่แปรผันตามอุณหภูมิสัมบูรณ์ยกกำลังสี่"
  },
  "acid-base-titration": {
    id: "acid-base-titration",
    title: "Acid-Base Titration Lab",
    category: "Chemistry",
    status: "",
    description: "ทดลองวัดและหาค่าความเข้มข้นของกรดหรือเบสผ่านกระบวนการไทเทรตทางเคมี ติดตามระดับ pH และการเปลี่ยนสีของอินดิเคเตอร์แบบเรียลไทม์"
  },
  "boyles-law": {
    id: "boyles-law",
    title: "Boyle's Gas Law Lab",
    category: "Chemistry",
    status: "",
    description: "ทดลองวัดความสัมพันธ์ระหว่างความดันและปริมาตรของแก๊สที่อุณหภูมิคงที่เพื่อตรวจสอบกฎของบอยล์"
  },
  "charles-law": {
    id: "charles-law",
    title: "Charles's Temperature-Volume Lab",
    category: "Chemistry",
    status: "",
    description: "วิเคราะห์ความสัมพันธ์เชิงปริมาณระหว่างอุณหภูมิและปริมาตรของแก๊สภายใต้ความดันคงตัวตามกฎของชาร์ล"
  },
  "le-chateliers-principle": {
    id: "le-chateliers-principle",
    title: "Chemical Equilibrium Shift",
    category: "Chemistry",
    status: "",
    description: "ศึกษาการเปลี่ยนแปลงสมดุลเคมีเมื่อรบกวนระบบด้วยความดัน อุณหภูมิ และความเข้มข้นสารตามหลักของเลอชาเตอลิเย"
  },
  "beer-lambert-law": {
    id: "beer-lambert-law",
    title: "Spectrophotometry & Concentration",
    category: "Chemistry",
    status: "",
    description: "วัดการดูดกลืนแสงของสารละลายที่มีความเข้มข้นต่างกันเพื่อสร้างกราฟมาตรฐานตามกฎของเบียร์-ลัมแบร์ต"
  },
  "hesss-law": {
    id: "hesss-law",
    title: "Hess's Law & Calorimetry",
    category: "Chemistry",
    status: "",
    description: "ทดลองวัดความร้อนของปฏิกิริยาเคมีหลายขั้นตอนเพื่อพิสูจน์ความไม่ขึ้นกับเส้นทางของเอนทัลปีรวมตามกฎของเฮสส์"
  },
  "galvanic-cell": {
    id: "galvanic-cell",
    title: "Galvanic Cells & Voltage",
    category: "Chemistry",
    status: "",
    description: "ศึกษาปฏิกิริยารีดอกซ์และการไหลของกระแสไฟฟ้าในเซลล์เคมีไฟฟ้าเพื่อคำนวณหาค่าแรงเคลื่อนไฟฟ้ามาตรฐาน"
  },
  "chemical-kinetics": {
    id: "chemical-kinetics",
    title: "Chemical Reaction Rates",
    category: "Chemistry",
    status: "",
    description: "วิเคราะห์ปัจจัยที่มีผลต่ออัตราการเกิดปฏิกิริยาเคมี เช่น ความเข้มข้น อุณหภูมิ และตัวเร่งปฏิกิริยาตามทฤษฎีการชน"
  },
  "solubility-product": {
    id: "solubility-product",
    title: "Solubility Product Constant",
    category: "Chemistry",
    status: "",
    description: "ศึกษาปฏิกิริยาการเกิดตะกอนและการละลายของเกลือละลายยากเพื่อคำนวณหาค่าคงตัวผลคูณการละลาย"
  },
  "avogadros-law": {
    id: "avogadros-law",
    title: "Avogadro's Molar Volume",
    category: "Chemistry",
    status: "",
    description: "ทดลองหาปริมาตรของแก๊ส 1 โมลที่สภาวะมาตรฐาน (STP) และศึกษาความสัมพันธ์กับจำนวนอนุภาคของแก๊ส"
  },
  "electrolysis-lab": {
    id: "electrolysis-lab",
    title: "Electrolysis & Metal Plating",
    category: "Chemistry",
    status: "",
    description: "ทดลองแยกสารเคมีด้วยไฟฟ้าและชุบโลหะเพื่อวิเคราะห์ความสัมพันธ์ของปริมาณสารตามกฎการแยกสารด้วยไฟฟ้า"
  },
  "colligative-properties": {
    id: "colligative-properties",
    title: "Colligative Properties Lab",
    category: "Chemistry",
    status: "",
    description: "ศึกษาการลดลงของจุดเยือกแข็งและการเพิ่มขึ้นของจุดเดือดของตัวทำละลายเมื่อเติมตัวละลายที่ระเหยยาก"
  },
  "photosynthesis-rate": {
    id: "photosynthesis-rate",
    title: "Photosynthesis Rate Chamber",
    category: "Biology",
    status: "",
    description: "ศึกษาระดับกระบวนการสังเคราะห์แสงของพืชสีเขียวในห้องทดลองปิด วิเคราะห์ผลกระทบของแสง ระดับคาร์บอนไดออกไซด์ และอุณหภูมิ"
  },
  "mendels-inheritance": {
    id: "mendels-inheritance",
    title: "Mendelian Genetics Lab",
    category: "Biology",
    status: "",
    description: "ศึกษาการถ่ายทอดลักษณะทางพันธุกรรมของถั่วลันเตาและการจับคู่ยีนในตารางพุนเนตต์ตามกฎของเมนเดล"
  },
  "mitosis-division": {
    id: "mitosis-division",
    title: "Mitosis & Cell Cycle",
    category: "Biology",
    status: "",
    description: "ศึกษาขั้นตอนการจำลองตัวเองและการแบ่งนิวเคลียสแบบไมโทซิสในระยะต่างๆ ผ่านกล้องจุลทรรศน์เสมือน"
  },
  "cell-osmosis": {
    id: "cell-osmosis",
    title: "Osmosis & Plasmolysis",
    category: "Biology",
    status: "",
    description: "ทดลองศึกษาการแพร่และการออสโมซิสของน้ำผ่านเยื่อเลือกผ่านในสภาวะความเข้มข้นสารละลายต่างกัน"
  },
  "enzyme-kinetics": {
    id: "enzyme-kinetics",
    title: "Enzyme Catalysis Lab",
    category: "Biology",
    status: "",
    description: "วิเคราะห์อัตราการทำงานของเอนไซม์ตามการเปลี่ยนแปลงความเข้มข้นสาร อุณหภูมิ และค่า pH ตามสมการ Michaelis-Menten"
  },
  "dna-extraction": {
    id: "dna-extraction",
    title: "DNA Extraction Chamber",
    category: "Biology",
    status: "",
    description: "เรียนรู้ขั้นตอนการทำลายผนังเซลล์และตกตะกอนเพื่อแยกสายใยโมเลกุลดีเอ็นเอออกจากตัวอย่างพืชและผลไม้"
  },
  "cellular-respiration": {
    id: "cellular-respiration",
    title: "Cellular Respiration Lab",
    category: "Biology",
    status: "",
    description: "ศึกษาการสลายโมเลกุลสารอาหารเพื่อผลิตพลังงาน ATP ทั้งในภาวะที่มีและไม่มีแก๊สออกซิเจน"
  },
  "plant-transpiration": {
    id: "plant-transpiration",
    title: "Plant Transpiration Potometer",
    category: "Biology",
    status: "",
    description: "วัดอัตราการคายน้ำของยอดพืชภายใต้สภาวะควบคุม เช่น ความชื้น อุณหภูมิ ลม และความเข้มแสงด้วยโพโทมิเตอร์"
  },
  "natural-selection": {
    id: "natural-selection",
    title: "Natural Selection Simulator",
    category: "Biology",
    status: "",
    description: "จำลองการเปลี่ยนแปลงสัดส่วนลักษณะประชากรสิ่งมีชีวิตตามปัจจัยกดดันของสภาพแวดล้อมตามทฤษฎีวิวัฒนาการ"
  },
  "blood-typing": {
    id: "blood-typing",
    title: "Blood Typing & Agglutination",
    category: "Biology",
    status: "",
    description: "ทดลองหาหมู่เลือดระบบ ABO และ Rh ผ่านการตกตะกอนของเม็ดเลือดแดงเมื่อทำปฏิกิริยากับแอนติบอดีจำลอง"
  },
  "food-chain": {
    id: "food-chain",
    title: "Food Chain & Ecology",
    category: "Biology",
    status: "",
    description: "วิเคราะห์การถ่ายทอดพลังงานและสารอาหารผ่านผู้ผลิต ผู้บริโภค และผู้ย่อยสลายในพีระมิดพลังงานระบบนิเวศ"
  },
  "heart-rate": {
    id: "heart-rate",
    title: "Cardiovascular System Lab",
    category: "Biology",
    status: "",
    description: "วิเคราะห์อัตราการเต้นของหัวใจและความดันเลือดภายใต้การตอบสนองต่อการทำกิจกรรมและระดับสารกระตุ้นจำลอง"
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
  // Calculate cooling curve data points when sliders change
  // Formula: T(t) = Ts + (T0 - Ts) * e^(-kt)
  useEffect(() => {
    const points = [];
    const totalTime = 60; // 60 minutes
    const step = 2.5; // step interval
    
    for (let t = 0; t <= totalTime; t += step) {
      // Add subtle experimental sensor noise as per science-expert guideline
      const noise = t > 0 ? (Math.random() - 0.5) * 0.4 : 0;
      const temp = ambientTemp + (initialTemp - ambientTemp) * Math.exp(-coolingConstant * t) + noise;
      points.push({ x: t, y: Math.max(0, temp) });
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
  const timeToSvgX = (t: number) => 20 + (t / 60) * 160;
  const tempToSvgY = (temp: number) => 100 - (temp / 100) * 90;

  const getSvgPath = () => {
    if (chartPoints.length === 0) return "";
    return chartPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${timeToSvgX(p.x)},${tempToSvgY(p.y)}`)
      .join(" ");
  };

  const getSvgAreaPath = () => {
    if (chartPoints.length === 0) return "";
    const linePath = getSvgPath();
    const startX = timeToSvgX(chartPoints[0].x);
    const endX = timeToSvgX(chartPoints[chartPoints.length - 1].x);
    const baseY = 100; // maps to temp=0
    return `${linePath} L${endX},${baseY} L${startX},${baseY} Z`;
  };

  const ambientY = tempToSvgY(ambientTemp);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-16 overflow-hidden">
      
      {/* Absolute Decorative Floating Elements */}
      <DecorativeBackground />

      {/* 1. Header/Navbar */}
      <Navbar />

      {/* 2. Breadcrumb Navigation */}
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 md:px-20 pt-6 pb-2 select-none">
        <Breadcrumb category={lab.category} title={lab.title} />
      </div>

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
          <div className="lg:col-span-4 lg:sticky lg:top-24 self-start">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-[32px] shadow-2xl border border-slate-200/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center select-none backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">เครื่องทดลองเย็นตัวจำลองเสมือนจริง</span>
              </div>
              <button 
                onClick={closeModal}
                className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="ปิดเครื่องมือ"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              {simProgress < 100 ? (
                /* Loading Phase */
                <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 select-none">
                  {/* Glowing Double Ring Science Spinner */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                    <div className="absolute w-14 h-14 rounded-full border-4 border-slate-100/50 border-b-rose-500 animate-spin [animation-direction:reverse]" />
                    <Thermometer className="w-6 h-6 text-indigo-500 animate-pulse" />
                  </div>
                  <div className="space-y-3 w-full max-w-sm">
                    <p className="text-sm font-bold text-slate-700 leading-relaxed break-words">{simStage}</p>
                    <div className="w-full bg-slate-100/80 h-2.5 rounded-full overflow-hidden relative border border-slate-200/20">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-300 relative"
                        style={{ width: `${simProgress}%` }}
                      >
                        {/* Glow indicator at progress tip */}
                        <div className="absolute right-0 top-0 h-full w-2 bg-white/50 blur-[2px]" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Interactive Lab Simulation Interface */
                <div className="space-y-6">
                  {/* Banner Info */}
                  <div className="bg-emerald-50/80 border border-emerald-100/80 rounded-2xl p-4 text-emerald-800 flex items-start gap-3 select-none backdrop-blur-md">
                    <div className="p-1 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                      <CheckCircle className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold leading-normal">จำลองระบบทำงานเรียบร้อย!</h4>
                      <p className="text-xs text-emerald-700/90 font-medium mt-0.5 leading-relaxed break-words">
                        ลองปรับตั้งค่าตัวแปรจำลองด้านล่าง เพื่อดูการฟิตติ้งเส้นโค้งอุณหภูมิตามกฎนิวตันในทันที
                      </p>
                    </div>
                  </div>

                  {/* Two Column Layout for controls vs output */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Simulator Sliders (Left 5 Columns) */}
                    <div className="md:col-span-5 bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between gap-4">
                      <div>
                        <h5 className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase leading-relaxed flex items-center gap-1.5 mb-4 select-none">
                          <Sliders className="w-4 h-4 text-indigo-500" />
                          ตัวแปรทดลองควบคุม
                        </h5>

                        {/* Sliders Stack */}
                        <div className="space-y-4">
                          {/* Slider 1: Initial Temp T0 */}
                          <div className="group bg-white p-3 rounded-xl border border-slate-100 hover:border-slate-200/60 hover:shadow-xs transition-all duration-200 select-none">
                            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                              <span className="text-slate-600 flex items-center gap-1.5 leading-normal">
                                <Thermometer className="w-4 h-4 text-rose-500 group-hover:animate-bounce" />
                                อุณหภูมิเริ่มต้น (T₀)
                              </span>
                              <span className="text-rose-600 font-extrabold text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-100">{initialTemp} °C</span>
                            </div>
                            <input
                              type="range"
                              min="60"
                              max="100"
                              value={initialTemp}
                              onChange={(e) => setInitialTemp(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                            />
                          </div>

                          {/* Slider 2: Ambient Temp Ts */}
                          <div className="group bg-white p-3 rounded-xl border border-slate-100 hover:border-slate-200/60 hover:shadow-xs transition-all duration-200 select-none">
                            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                              <span className="text-slate-600 flex items-center gap-1.5 leading-normal">
                                <Sun className="w-4 h-4 text-amber-500 group-hover:animate-spin-slow" />
                                อุณหภูมิแวดล้อม (Tₛ)
                              </span>
                              <span className="text-emerald-600 font-extrabold text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{ambientTemp} °C</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="40"
                              value={ambientTemp}
                              onChange={(e) => setAmbientTemp(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>

                          {/* Slider 3: Cooling Rate Constant k */}
                          <div className="group bg-white p-3 rounded-xl border border-slate-100 hover:border-slate-200/60 hover:shadow-xs transition-all duration-200 select-none">
                            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                              <span className="text-slate-600 flex items-center gap-1.5 leading-normal">
                                <Zap className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                                อัตราการเย็นตัว (k)
                              </span>
                              <span className="text-blue-600 font-extrabold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{coolingConstant.toFixed(3)}</span>
                            </div>
                            <input
                              type="range"
                              min="0.01"
                              max="0.1"
                              step="0.005"
                              value={coolingConstant}
                              onChange={(e) => setCoolingConstant(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Reset button */}
                      <button
                        onClick={() => {
                          setInitialTemp(90);
                          setAmbientTemp(25);
                          setCoolingConstant(0.04);
                        }}
                        className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>คืนค่าเริ่มต้น</span>
                      </button>
                    </div>

                    {/* Output Real-time Graph (Right 7 Columns) */}
                    <div className="md:col-span-7 flex flex-col justify-between">
                      <div className="w-full h-full bg-slate-950/95 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-inner relative overflow-hidden">
                        {/* Title block inside graph */}
                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold select-none border-b border-slate-900 pb-1.5 mb-2">
                          <span>TELEMETRY GRAPH (REAL-TIME)</span>
                          <span className="text-indigo-400">MODEL: T(t) = Tₛ + (T₀ - Tₛ)e⁻ᵏᵗ</span>
                        </div>
                        <svg className="w-full h-44" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            {/* Glow Filter */}
                            <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="2.5" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            {/* Area Gradient */}
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          <line x1="20" y1="10" x2="180" y2="10" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                          <line x1="20" y1="32.5" x2="180" y2="32.5" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                          <line x1="20" y1="55" x2="180" y2="55" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                          <line x1="20" y1="77.5" x2="180" y2="77.5" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                          <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                          {/* Axes labels */}
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">100°C</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">75°C</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">50°C</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">25°C</text>

                          {/* Ambient Temp Ts line */}
                          <line x1="20" y1={ambientY} x2="180" y2={ambientY} stroke="#10b981" strokeWidth="1.25" strokeDasharray="3 2" opacity="0.8" />
                          <text x="183" y={ambientY + 2} fill="#10b981" fontSize="7" fontWeight="extrabold">Tₛ</text>

                          {/* Area under the path */}
                          <path d={getSvgAreaPath()} fill="url(#chartGrad)" />

                          {/* Glowing line shadow */}
                          <path d={getSvgPath()} stroke="#60a5fa" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.3" filter="url(#glow-line)" />
                          
                          {/* Interactive Cooling Curve path */}
                          <path d={getSvgPath()} stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" fill="none" />

                          {/* Hot Initial Point Indicator */}
                          {chartPoints.length > 0 && (
                            <circle cx="20" cy={tempToSvgY(initialTemp)} r="3" fill="#f43f5e" />
                          )}

                          {/* Horizontal axis time line */}
                          <line x1="20" y1="110" x2="180" y2="110" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                          
                          {/* Time tick labels */}
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
