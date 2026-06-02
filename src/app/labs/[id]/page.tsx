"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/labs/Breadcrumb";
import LabHero from "@/components/labs/LabHero";
import InfoCard from "@/components/labs/InfoCard";
import EquipmentList from "@/components/labs/EquipmentList";
import ExperimentSteps from "@/components/labs/ExperimentSteps";
import TheoryCard from "@/components/labs/TheoryCard";
import LabSidebar from "@/components/labs/LabSidebar";
import { ClipboardList, Target, X, CheckCircle, Sliders, Thermometer, Sun, Zap, RefreshCw, Play } from "lucide-react";

import { labsById } from "@/data/labs";

const DEFAULT_LAB_ID = "newtons-cooling";
const SAVED_EXPERIMENT_KEYS: Record<string, string> = {
  "newtons-cooling": "scisiam_saved_cooling_experiment",
  "ohms-law": "scisiam_saved_ohms_experiment",
  "hookes-law": "scisiam_saved_hookes_experiment",
  "acid-base-titration": "scisiam_saved_titration_experiment",
  "boyles-law": "scisiam_saved_boyle_experiment",
  "charles-law": "scisiam_saved_charles_experiment",
  "photosynthesis-rate": "scisiam_saved_photosynthesis_experiment",
  "mendels-inheritance": "scisiam_saved_mendelian_experiment",
  "mitosis-division": "scisiam_saved_mitosis_experiment",
  "le-chateliers-principle": "scisiam_saved_le_chateliers_experiment",
  "beer-lambert-law": "scisiam_saved_beer_lambert_experiment",
  "hesss-law": "scisiam_saved_hesss_experiment",
  "galvanic-cell": "scisiam_saved_galvanic_experiment",
  "chemical-kinetics": "scisiam_saved_kinetics_experiment",
  "solubility-product": "scisiam_saved_ksp_experiment",
  "avogadros-law": "scisiam_saved_avogadro_experiment",
  "electrolysis-lab": "scisiam_saved_electrolysis_experiment",
  "colligative-properties": "scisiam_saved_colligative_experiment",
};

interface SavedExperiment {
  labId: string;
  timestamp: string;
  initialTemp?: number;
  ambientTemp?: number;
  coolingConstant?: number;
  voltage?: number;
  resistance?: number;
  gasMoles?: number;
  temperature?: number;
  pressure?: number;
  targetTemperature?: number;
  lightIntensity?: number;
  carbonDioxide?: number;
  waterLevel?: number;
  parentA?: string;
  parentB?: string;
  traitLabel?: string;
  sampleSize?: number;
  spindleHealth?: number;
  dnaIntegrity?: number;
  cycleCount?: number;
  cellCount?: number;
  initialReactant?: string;
  wavelength?: number;
  pathLength?: number;
  reactionType?: string;
  limitingMoles?: number;
  cellVoltage?: number;
  concentration?: number;
  reactionRate?: number;
  ionProduct?: number;
  ksp?: number;
  saturationIndex?: number;
  moles?: number;
  molarVolume?: number;
  current?: number;
  charge?: number;
  platedMass?: number;
  molality?: number;
  deltaT?: number;
  dataPoints: {
    time?: number;
    temp?: number;
    ambient?: number;
    voltage?: number;
    current?: number;
    volume?: number;
    pressure?: number;
    pv?: number;
    temperatureC?: number;
    kelvin?: number;
    ratio?: number;
    rate?: number;
    oxygen?: number;
    lightIntensity?: number;
    carbonDioxide?: number;
    waterLevel?: number;
    genotype?: string;
    phenotype?: string;
    stage?: string;
    progress?: number;
    cycle?: number;
    checkpoint?: number;
    cellCount?: number;
    concentration?: number;
    absorbance?: number;
    temperature?: number;
    cellVoltage?: number;
    reactionRate?: number;
    ionProduct?: number;
    ksp?: number;
    saturationIndex?: number;
    moles?: number;
    molarVolume?: number;
    charge?: number;
    platedMass?: number;
    molality?: number;
    deltaT?: number;
  }[];
}

export default function LabDetailPage() {
  const params = useParams();
  const router = useRouter();
  const labId = (params?.id as string) || DEFAULT_LAB_ID;
  const isOhmsLaw = labId === "ohms-law";
  const isHookesLaw = labId === "hookes-law";
  const isAcidBase = labId === "acid-base-titration";
  const isBoylesLaw = labId === "boyles-law";
  const isCharlesLaw = labId === "charles-law";
  const isPhotosynthesis = labId === "photosynthesis-rate";
  const isMendelian = labId === "mendels-inheritance";
  const isMitosis = labId === "mitosis-division";
  const isLeChateliers = labId === "le-chateliers-principle";
  const isBeerLambert = labId === "beer-lambert-law";
  const isHesssLaw = labId === "hesss-law";
  const isGalvanicCell = labId === "galvanic-cell";
  const isChemicalKinetics = labId === "chemical-kinetics";
  const isSolubilityProduct = labId === "solubility-product";
  const isAvogadrosLaw = labId === "avogadros-law";
  const isElectrolysis = labId === "electrolysis-lab";
  const isColligative = labId === "colligative-properties";
  const isSharedChemistryLab = isGalvanicCell || isChemicalKinetics || isSolubilityProduct || isAvogadrosLaw || isElectrolysis || isColligative;

  // Fallback to Newton's Law of Cooling as primary demo
  const lab = labsById[labId] || labsById[DEFAULT_LAB_ID];

  // Saved experiment history state
  const [savedData, setSavedData] = useState<SavedExperiment | null>(null);

  useEffect(() => {
    const key = SAVED_EXPERIMENT_KEYS[labId] ?? SAVED_EXPERIMENT_KEYS[DEFAULT_LAB_ID];
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SavedExperiment;
        if (parsed && parsed.labId === labId) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSavedData(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved experiment", e);
      }
    } else {
      setSavedData(null);
    }
  }, [labId]);

  const handleClearSavedData = () => {
    if (confirm("คุณต้องการลบประวัติผลการทดลองที่บันทึกไว้ล่าสุดหรือไม่?")) {
      const key = SAVED_EXPERIMENT_KEYS[labId] ?? SAVED_EXPERIMENT_KEYS[DEFAULT_LAB_ID];
      localStorage.removeItem(key);
      setSavedData(null);
    }
  };

  // Simulation states
  const [showSimModal, setShowSimModal] = useState(false);
  const [simProgress] = useState(0);
  const [simStage] = useState("");
  
  // Real-time Interactive Simulator Inputs
  const [initialTemp, setInitialTemp] = useState(90); // T0 (60 - 100)
  const [ambientTemp, setAmbientTemp] = useState(25); // Ts (10 - 40)
  const [coolingConstant, setCoolingConstant] = useState(0.04); // k (0.01 - 0.1)

  // Ohm's law inputs
  const [ohmsVoltage, setOhmsVoltage] = useState(12.0); // V (0 - 24)
  const [ohmsResistance, setOhmsResistance] = useState(100.0); // R (10 - 500)
  const ohmsCurrent = useMemo(() => ohmsVoltage / ohmsResistance, [ohmsVoltage, ohmsResistance]);
  
  const chartPoints = useMemo(() => {
    const totalTime = 60;
    const step = 2.5;
    const points: { x: number; y: number }[] = [];

    for (let t = 0; t <= totalTime; t += step) {
      const temp = ambientTemp + (initialTemp - ambientTemp) * Math.exp(-coolingConstant * t);
      points.push({ x: t, y: Math.max(0, temp) });
    }

    return points;
  }, [initialTemp, ambientTemp, coolingConstant]);

  const handleStartExperiment = () => {
    router.push(`/labs/${labId}/simulation`);
  };

  const closeModal = () => {
    setShowSimModal(false);
  };

  // Convert mathematical coordinates to SVG viewbox coordinates (200w x 120h)
  const timeToSvgX = (t: number) => 20 + (t / 60) * 160;
  const tempToSvgY = (temp: number) => 100 - (temp / 100) * 90;

  const svgPath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    return chartPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${timeToSvgX(p.x)},${tempToSvgY(p.y)}`)
      .join(" ");
  }, [chartPoints]);

  const svgAreaPath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    const startX = timeToSvgX(chartPoints[0].x);
    const endX = timeToSvgX(chartPoints[chartPoints.length - 1].x);
    const baseY = 100;
    return `${svgPath} L${endX},${baseY} L${startX},${baseY} Z`;
  }, [chartPoints, svgPath]);

  const ambientY = tempToSvgY(ambientTemp);

  // Ohm's law preview paths
  const ohmsPreviewLinePath = useMemo(() => {
    const endY = 100 - ((24 / ohmsResistance) / 2.5) * 90;
    return `M20,100 L180,${endY}`;
  }, [ohmsResistance]);

  const ohmsPreviewAreaPath = useMemo(() => {
    const endY = 100 - ((24 / ohmsResistance) / 2.5) * 90;
    return `M20,100 L180,${endY} L180,100 Z`;
  }, [ohmsResistance]);

  const savedSvgPath = useMemo(() => {
    if (!savedData || savedData.dataPoints.length === 0) return "";
    if (isBoylesLaw) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + (((p.volume ?? 250) - 250) / 550) * 160},${100 - (((p.pressure ?? 55) - 55) / 185) * 90}`)
        .join(" ");
    }
    if (isCharlesLaw) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + ((p.temperatureC ?? 0) / 90) * 160},${100 - (((p.volume ?? 430) - 430) / 230) * 90}`)
        .join(" ");
    }
    if (isPhotosynthesis) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + ((p.time ?? 0) / 10) * 160},${100 - ((p.rate ?? 0) / 100) * 90}`)
        .join(" ");
    }
    if (isMendelian) {
      const total = Math.max(1, savedData.dataPoints.length);
      let dominant = 0;
      return savedData.dataPoints
        .map((p, i) => {
          if (p.phenotype === "เด่น") dominant += 1;
          const x = 20 + (i / Math.max(1, total - 1)) * 160;
          const y = 100 - (dominant / (i + 1)) * 90;
          return `${i === 0 ? "M" : "L"}${x},${y}`;
        })
        .join(" ");
    }
    if (isMitosis) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + (i / Math.max(1, savedData.dataPoints.length - 1)) * 160},${100 - ((p.progress ?? 0) / 100) * 90}`)
        .join(" ");
    }
    if (isOhmsLaw) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + ((p.voltage ?? 0) / 24) * 160},${100 - ((p.current ?? 0) / 2.5) * 90}`)
        .join(" ");
    }
    if (isLeChateliers) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + ((p.time ?? 0) / 100) * 160},${100 - ((p.concentration ?? 0) / 0.05) * 90}`)
        .join(" ");
    }
    if (isBeerLambert) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + ((p.concentration ?? 0) / 0.5) * 160},${100 - ((p.absorbance ?? 0) / 2.0) * 90}`)
        .join(" ");
    }
    if (isHesssLaw) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + ((p.time ?? 0) / 100) * 160},${100 - (((p.temperature ?? 25) - 20) / 40) * 90}`)
        .join(" ");
    }
    if (isGalvanicCell) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + ((p.time ?? 0) / 100) * 160},${100 - ((p.cellVoltage ?? 0) / 1.2) * 90}`)
        .join(" ");
    }
    if (isChemicalKinetics) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + ((p.concentration ?? 0) / 2) * 160},${100 - ((p.reactionRate ?? 0) / 100) * 90}`)
        .join(" ");
    }
    if (isSolubilityProduct) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + ((p.time ?? 0) / 100) * 160},${100 - Math.min(1.2, p.saturationIndex ?? 0) / 1.2 * 90}`)
        .join(" ");
    }
    if (isAvogadrosLaw) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + ((p.moles ?? 0) / 1) * 160},${100 - ((p.volume ?? 0) / 25) * 90}`)
        .join(" ");
    }
    if (isElectrolysis) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + ((p.charge ?? 0) / 9000) * 160},${100 - ((p.platedMass ?? 0) / 3) * 90}`)
        .join(" ");
    }
    if (isColligative) {
      return savedData.dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"}${20 + ((p.molality ?? 0) / 3) * 160},${100 - ((p.deltaT ?? 0) / 8) * 90}`)
        .join(" ");
    }
    return savedData.dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${timeToSvgX(p.time ?? 0)},${tempToSvgY(p.temp ?? 0)}`)
      .join(" ");
  }, [savedData, isBoylesLaw, isCharlesLaw, isMendelian, isMitosis, isOhmsLaw, isPhotosynthesis, isLeChateliers, isBeerLambert, isHesssLaw, isGalvanicCell, isChemicalKinetics, isSolubilityProduct, isAvogadrosLaw, isElectrolysis, isColligative]);

  const savedAmbientPath = useMemo(() => {
    if (!savedData || savedData.dataPoints.length === 0 || isBoylesLaw || isCharlesLaw || isOhmsLaw || isPhotosynthesis || isMendelian || isMitosis || isLeChateliers || isBeerLambert || isHesssLaw || isSharedChemistryLab) return "";
    return savedData.dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${timeToSvgX(p.time ?? 0)},${tempToSvgY(p.ambient ?? 0)}`)
      .join(" ");
  }, [savedData, isBoylesLaw, isCharlesLaw, isMendelian, isMitosis, isOhmsLaw, isPhotosynthesis, isLeChateliers, isBeerLambert, isHesssLaw, isSharedChemistryLab]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] relative pb-12 overflow-hidden">
      {/* 1. Header/Navbar */}
      <Navbar />

      {/* 2. Breadcrumb Navigation */}
      <div className="hidden sm:block w-full max-w-[1440px] mx-auto px-6 sm:px-12 md:px-20 pt-6 pb-2 select-none">
        <Breadcrumb category={lab.category} title={lab.title} />
      </div>

      {/* 3. Hero Section Details */}
      <LabHero
        labId={labId}
        title={lab.title}
        category={lab.category}
        status={lab.status}
        description={lab.description}
        onStartExperiment={handleStartExperiment}
      />

      {/* 4. Two-Column Dashboard Content */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-12 md:px-20 py-5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (70%) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Overview & Objective cards (Grid layout side-by-side on desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                title="ภาพรวมการทดลอง"
                icon={ClipboardList}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                bullets={isMitosis ? [
                  "ศึกษาลำดับระยะของวัฏจักรเซลล์และการแบ่งนิวเคลียสแบบไมโทซิส",
                  "สังเกตการขดตัว การเรียงตัว และการแยกของโครโมโซมในแต่ละระยะ",
                  "วิเคราะห์บทบาทของ checkpoint ที่ช่วยลดข้อผิดพลาดระหว่างการแบ่งเซลล์"
                ] : isMendelian ? [
                  "ศึกษาการถ่ายทอดลักษณะทางพันธุกรรมแบบยีนเดียวตามกฎของเมนเดล",
                  "ใช้ตาราง Punnett คาดการณ์จีโนไทป์และฟีโนไทป์ของรุ่นลูก",
                  "เปรียบเทียบสัดส่วนที่สุ่มได้กับสัดส่วนทางทฤษฎี เช่น 3:1 หรือ 1:2:1"
                ] : isPhotosynthesis ? [
                  "ศึกษาปัจจัยที่มีผลต่ออัตราการสังเคราะห์แสง ได้แก่ ความเข้มแสง CO₂ อุณหภูมิ และน้ำ",
                  "ติดตามการเกิดออกซิเจนใน chamber พืชแบบปิดเพื่อประเมินอัตราปฏิกิริยา",
                  "เปรียบเทียบกราฟ rate-time เพื่อระบุปัจจัยจำกัดของกระบวนการสังเคราะห์แสง"
                ] : isCharlesLaw ? [
                  "ศึกษาความสัมพันธ์เชิงเส้นระหว่างอุณหภูมิสัมบูรณ์ (T) และปริมาตร (V) ของแก๊สที่ความดันคงที่",
                  "ปรับอุณหภูมิของอ่างน้ำควบคุมและสังเกตการขยายตัวของแก๊สในกระบอกลูกสูบ",
                  "สร้างกราฟ V-T และตรวจสอบว่าอัตราส่วน V/T มีค่าใกล้คงที่ตามกฎของชาร์ล"
                ] : isBoylesLaw ? [
                  "ศึกษาความสัมพันธ์ผกผันระหว่างความดัน (P) และปริมาตร (V) ของแก๊สที่อุณหภูมิคงที่",
                  "ปรับลูกสูบในกระบอกแก๊สเพื่อเปลี่ยนปริมาตรและสังเกตค่าความดันจากเกจ",
                  "สร้างกราฟ P-V และตรวจสอบว่าผลคูณ PV มีค่าใกล้คงที่ตามกฎของบอยล์"
                ] : isAcidBase ? [
                  "ศึกษากระบวนการไทเทรตกรด-เบสด้วยบิวเรต ขวดรูปชมพู่ และอินดิเคเตอร์",
                  "ติดตามค่า pH และการเปลี่ยนสีของสารละลายเมื่อหยดสารมาตรฐานลงทีละช่วง",
                  "วิเคราะห์จุดสมมูลจากกราฟ pH-volume เพื่อหาความเข้มข้นของสารตัวอย่าง"
                ] : isHookesLaw ? [
                  "ศึกษาความสัมพันธ์ระหว่างแรงดึง (F) กับระยะยืดของสปริง (x)",
                  "เพิ่มตุ้มน้ำหนักทีละขั้นและวัดระยะยืดของสปริงจากตำแหน่งสมดุล",
                  "สร้างกราฟ F-x เพื่อหาค่าคงที่สปริง (k) จากความชันของเส้นกราฟ"
                ] : isOhmsLaw ? [
                  "ศึกษาความสัมพันธ์ของกระแสไฟฟ้า แรงดันไฟฟ้า และความต้านทานไฟฟ้า",
                  "ปรับค่าแรงดันตกคร่อมตัวต้านทานและบันทึกกระแสไฟฟ้าที่ไหลผ่าน",
                  "สร้างกราฟความสัมพันธ์ระหว่างแรงดันและกระแสเพื่อยืนยันกฎของโอห์ม"
                ] : isGalvanicCell ? [
                  "ศึกษาการสร้างแรงดันไฟฟ้าจากปฏิกิริยารีดอกซ์ในเซลล์กัลวานิก",
                  "ประกอบครึ่งเซลล์ ขั้วไฟฟ้า และสะพานเกลือเพื่อควบคุมการไหลของอิเล็กตรอน",
                  "เปรียบเทียบแรงดันเซลล์เมื่อเปลี่ยนความเข้มข้นของไอออนและสัดส่วน Q"
                ] : isChemicalKinetics ? [
                  "ศึกษาปัจจัยที่มีผลต่ออัตราการเกิดปฏิกิริยา เช่น ความเข้มข้นและอุณหภูมิ",
                  "ติดตามการเปลี่ยนสีหรือความขุ่นตามเวลาเพื่อประมาณค่า reaction rate",
                  "สร้างกราฟ rate-concentration เพื่อวิเคราะห์แนวโน้มของกฎอัตรา"
                ] : isSolubilityProduct ? [
                  "ศึกษาสมดุลการละลายของเกลือที่ละลายน้ำได้น้อยผ่านค่า Ksp",
                  "ผสมสารละลายไอออนและสังเกตจุดเริ่มเกิดตะกอนเมื่อ Qsp เกิน Ksp",
                  "คำนวณ ion product และเปรียบเทียบกับค่าคงที่ผลคูณการละลาย"
                ] : isAvogadrosLaw ? [
                  "ศึกษาปริมาตรโมลาร์ของแก๊สจากปริมาตรที่เก็บได้และจำนวนโมลของสารตั้งต้น",
                  "ปรับเทียบอุณหภูมิและความดันเพื่อประเมินปริมาตรแก๊สที่สภาวะมาตรฐาน",
                  "วิเคราะห์ความสัมพันธ์เชิงเส้นระหว่างจำนวนโมลและปริมาตรแก๊ส"
                ] : isElectrolysis ? [
                  "ศึกษาการใช้กระแสไฟฟ้าบังคับปฏิกิริยารีดอกซ์ในเซลล์อิเล็กโทรไลซิส",
                  "สังเกตการเคลือบโลหะบนแคโทดเมื่อปรับกระแสและเวลาในการชุบ",
                  "คำนวณมวลโลหะที่ชุบจากประจุไฟฟ้ารวมตามกฎของฟาราเดย์"
                ] : isColligative ? [
                  "ศึกษาสมบัติคอลลิเกทีฟของสารละลายจากจำนวนอนุภาคตัวละลาย",
                  "ปรับ molality และ van't Hoff factor เพื่อดูผลต่อจุดเดือดและจุดเยือกแข็ง",
                  "สร้างกราฟ ΔT-molality เพื่อสรุปผลของตัวละลายต่ออุณหภูมิเปลี่ยนเฟส"
                ] : [
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
                bullets={isMitosis ? [
                  "จำแนกระยะ Interphase, Prophase, Metaphase, Anaphase, Telophase และ Cytokinesis ได้",
                  "อธิบายการแยกโครมาทิดและการเกิดเซลล์ลูกที่มีชุดโครโมโซมเหมือนเดิมได้",
                  "เชื่อมโยง checkpoint กับความถูกต้องของการแบ่งเซลล์ได้"
                ] : isMendelian ? [
                  "อธิบายความแตกต่างของ genotype และ phenotype ได้อย่างถูกต้อง",
                  "คำนวณและตีความผลจากตาราง Punnett สำหรับการผสมแบบ monohybrid ได้",
                  "วิเคราะห์ความคลาดเคลื่อนระหว่างผลสุ่มกับค่าทฤษฎีเมื่อจำนวนตัวอย่างเปลี่ยนได้"
                ] : isPhotosynthesis ? [
                  "อธิบายสมการสังเคราะห์แสงและบทบาทของแสง CO₂ และน้ำได้",
                  "อ่านค่าอัตราการเกิดออกซิเจนและตีความสภาวะที่เหมาะสมของพืชได้",
                  "วิเคราะห์แนวคิดปัจจัยจำกัดเมื่อปรับตัวแปรแวดล้อมทีละตัวได้"
                ] : isCharlesLaw ? [
                  "อธิบายกฎของชาร์ล V₁/T₁ = V₂/T₂ ได้เมื่อความดันและจำนวนโมลคงที่",
                  "อ่านค่าอุณหภูมิ ปริมาตร และแปลงอุณหภูมิเป็นหน่วยเคลวินได้ถูกต้อง",
                  "วิเคราะห์กราฟเส้นตรง V-T และตรวจสอบค่า V/T จากข้อมูลทดลองได้"
                ] : isBoylesLaw ? [
                  "อธิบายกฎของบอยล์ P₁V₁ = P₂V₂ ได้เมื่ออุณหภูมิและจำนวนโมลคงที่",
                  "อ่านค่าปริมาตรกระบอกแก๊สและความดันจากเกจเพื่อบันทึกข้อมูลได้",
                  "วิเคราะห์กราฟความสัมพันธ์ผกผันและตรวจสอบค่า PV จากข้อมูลทดลองได้"
                ] : isAcidBase ? [
                  "อธิบายหลักสโตอิชิโอเมทรีของปฏิกิริยากรด-เบสที่จุดสมมูลได้",
                  "อ่านค่า pH และปริมาตรสารมาตรฐานจากบิวเรตเพื่อคำนวณความเข้มข้นได้",
                  "ตีความรูปทรงกราฟไทเทรชันและช่วงเปลี่ยนสีของอินดิเคเตอร์ได้อย่างถูกต้อง"
                ] : isHookesLaw ? [
                  "อธิบายหลักการของกฎของฮุค F = -kx ได้อย่างถูกต้อง",
                  "รู้วิธีติดตั้งอุปกรณ์สปริง ตุ้มน้ำหนัก และวัดระยะยืดอย่างแม่นยำ",
                  "สามารถคำนวณค่าคงที่สปริง (k) จากความชันของกราฟ F-x ได้"
                ] : isOhmsLaw ? [
                  "อธิบายความสัมพันธ์ตามกฎของโอห์ม V = I x R ได้อย่างถูกต้อง",
                  "รู้วิธีต่อและใช้งานเครื่องจ่ายแรงดัน แอมมิเตอร์ และโวลต์มิเตอร์ในวงจรปิด",
                  "สามารถคำนวณและวิเคราะห์ความต้านทานจากความชัน (Slope) ของกราฟได้"
                ] : isGalvanicCell ? [
                  "อธิบายบทบาทของแอโนด แคโทด สะพานเกลือ และโวลต์มิเตอร์ในเซลล์กัลวานิกได้",
                  "คำนวณ Ecell จากศักย์รีดักชันมาตรฐานและอธิบายผลของความเข้มข้นได้",
                  "เชื่อมโยงทิศทางการไหลของอิเล็กตรอนกับสมการออกซิเดชัน-รีดักชันได้"
                ] : isChemicalKinetics ? [
                  "อธิบายกฎอัตรา rate = k[A]^m[B]^n และความหมายของอันดับปฏิกิริยาได้",
                  "วิเคราะห์ผลของอุณหภูมิและความเข้มข้นต่ออัตราปฏิกิริยาตามทฤษฎีการชนได้",
                  "อ่านกราฟ rate-concentration เพื่อสรุปแนวโน้มของข้อมูลทดลองได้"
                ] : isSolubilityProduct ? [
                  "คำนวณ Qsp และ Ksp จากความเข้มข้นของไอออนในสารละลายได้",
                  "ตัดสินได้ว่าสารละลายไม่อิ่มตัว อิ่มตัว หรือเกิดตะกอนจาก Qsp/Ksp",
                  "อธิบายสมดุลการละลายของเกลือละลายน้ำได้น้อยได้อย่างถูกต้อง"
                ] : isAvogadrosLaw ? [
                  "คำนวณจำนวนโมลของแก๊สจากมวลสารตั้งต้นและสโตอิชิโอเมทรีได้",
                  "ปรับเทียบปริมาตรแก๊สด้วยอุณหภูมิและความดันตามกฎแก๊สอุดมคติได้",
                  "ประเมินค่า molar volume และเปรียบเทียบกับค่าประมาณ 22.4 L/mol ได้"
                ] : isElectrolysis ? [
                  "อธิบายการเคลื่อนที่ของไอออนและการเกิดโลหะเคลือบที่แคโทดได้",
                  "คำนวณประจุไฟฟ้า Q = It และมวลโลหะตามกฎของฟาราเดย์ได้",
                  "วิเคราะห์ผลของกระแสและเวลาในการชุบต่อปริมาณโลหะที่เกิดขึ้นได้"
                ] : isColligative ? [
                  "อธิบายการลดจุดเยือกแข็งและการเพิ่มจุดเดือดจากสมบัติคอลลิเกทีฟได้",
                  "คำนวณ ΔT จาก i, K และ molality ของสารละลายได้",
                  "เปรียบเทียบผลของตัวละลายแตกตัวและไม่แตกตัวผ่าน van't Hoff factor ได้"
                ] : [
                  "อธิบายหลักทฤษฎีกฎการเย็นตัวของนิวตันได้อย่างถูกต้อง",
                  "รู้วิธีเก็บและบันทึกข้อมูลอุณหภูมิในระบบแล็บฟิสิกส์ได้อย่างแม่นยำ",
                  "สามารถวิเคราะห์เส้นโค้งกราฟและตีความค่าคงที่อัตราการเย็นตัวได้"
                ]}
              />
            </div>

            {/* Equipment checklist section */}
            <EquipmentList labId={labId} />

            {/* Timelines Steps progress */}
            <ExperimentSteps labId={labId} />

            {/* Theoretical formulas and graph */}
            <TheoryCard labId={labId} />
            {/* 4. Saved Experiment Results (Only if exists in localStorage) */}
            {savedData && (
              <div className="bg-white rounded-[24px] border border-slate-200/70 p-5 sm:p-6 shadow-xl shadow-slate-100/30 hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 border-b border-slate-100 pb-3 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5.5 h-5.5 text-emerald-500 animate-pulse" />
                    <div className="text-left">
                      <h2 className="text-base sm:text-lg font-bold text-slate-800">
                        ผลการทดลองล่าสุดที่บันทึกไว้
                      </h2>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-semibold mt-0.5">
                        บันทึกเมื่อ: {savedData.timestamp}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearSavedData}
                    className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100/60 px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition-all"
                  >
                    ลบข้อมูลที่บันทึก
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  
                  {/* Left column: SVG Line Graph */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 select-none flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold border-b border-slate-900 pb-1.5 mb-2">
                      <span>SAVED EXPERIMENT GRAPH</span>
                      {isOhmsLaw ? (
                        <span className="text-emerald-400">V_max = {savedData.voltage}V | R = {savedData.resistance}Ω</span>
                      ) : isLeChateliers ? (
                        <span className="text-emerald-400">Temp = {savedData.temperature ?? 25}°C | Reactant = {savedData.initialReactant ?? "Fe³⁺"}</span>
                      ) : isBeerLambert ? (
                        <span className="text-emerald-400">Wavelength = {savedData.wavelength ?? 510}nm | Path = {savedData.pathLength ?? 1.0}cm</span>
                      ) : isHesssLaw ? (
                        <span className="text-emerald-400">Reaction = {savedData.reactionType ?? "1"} | limiting = {savedData.limitingMoles ?? 0.05}mol</span>
                      ) : isGalvanicCell ? (
                        <span className="text-emerald-400">Ecell = {(savedData.cellVoltage ?? 0).toFixed(2)}V | Ion ratio = {(savedData.concentration ?? 1).toFixed(2)}</span>
                      ) : isChemicalKinetics ? (
                        <span className="text-emerald-400">[A] = {(savedData.concentration ?? 0).toFixed(2)}M | rate = {(savedData.reactionRate ?? 0).toFixed(1)}</span>
                      ) : isSolubilityProduct ? (
                        <span className="text-emerald-400">Qsp/Ksp = {(savedData.saturationIndex ?? 0).toFixed(2)} | Ksp = {(savedData.ksp ?? 0).toExponential(1)}</span>
                      ) : isAvogadrosLaw ? (
                        <span className="text-emerald-400">n = {(savedData.moles ?? 0).toFixed(2)} mol | Vm = {(savedData.molarVolume ?? 0).toFixed(1)} L/mol</span>
                      ) : isElectrolysis ? (
                        <span className="text-emerald-400">I = {(savedData.current ?? 0).toFixed(2)}A | plated = {(savedData.platedMass ?? 0).toFixed(2)}g</span>
                      ) : isColligative ? (
                        <span className="text-emerald-400">m = {(savedData.molality ?? 0).toFixed(2)} | ΔT = {(savedData.deltaT ?? 0).toFixed(2)}°C</span>
                      ) : isBoylesLaw ? (
                        <span className="text-emerald-400">n = {(savedData.gasMoles ?? 0).toFixed(3)} mol | T = {savedData.temperature ?? "-"}°C</span>
                      ) : isCharlesLaw ? (
                        <span className="text-emerald-400">n = {(savedData.gasMoles ?? 0).toFixed(3)} mol | P = {savedData.pressure ?? "-"} kPa</span>
                      ) : isPhotosynthesis ? (
                        <span className="text-emerald-400">Light = {savedData.lightIntensity ?? "-"}% | CO₂ = {savedData.carbonDioxide ?? "-"} ppm</span>
                      ) : isMendelian ? (
                        <span className="text-emerald-400">{savedData.parentA ?? "-"} × {savedData.parentB ?? "-"} | n = {savedData.dataPoints.length}</span>
                      ) : isMitosis ? (
                        <span className="text-emerald-400">Cells = {savedData.cellCount ?? "-"} | Checkpoint = {savedData.spindleHealth ?? "-"}%</span>
                      ) : (
                        <span className="text-emerald-400">T₀ = {savedData.initialTemp}°C | Tₛ = {savedData.ambientTemp}°C | k = {(savedData.coolingConstant ?? 0).toFixed(3)}</span>
                      )}
                    </div>

                    <svg className="w-full h-44" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Grid Lines */}
                      <line x1="20" y1="10" x2="180" y2="10" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                      <line x1="20" y1="32.5" x2="180" y2="32.5" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                      <line x1="20" y1="55" x2="180" y2="55" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                      <line x1="20" y1="77.5" x2="180" y2="77.5" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                      <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                      {/* Axes metrics */}
                      {isOhmsLaw ? (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">2.5A</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">2.0A</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">1.5A</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">1.0A</text>
                        </>
                      ) : isLeChateliers ? (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.05M</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.038M</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.025M</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.013M</text>
                        </>
                      ) : isBeerLambert ? (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">2.0A</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">1.5A</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">1.0A</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.5A</text>
                        </>
                      ) : isHesssLaw ? (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">60°C</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">50°C</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">40°C</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">30°C</text>
                        </>
                      ) : isGalvanicCell ? (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">1.2V</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.9V</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.6V</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.3V</text>
                        </>
                      ) : isChemicalKinetics ? (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">100</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">75</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">50</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">25</text>
                        </>
                      ) : isSolubilityProduct ? (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">1.2</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.9</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.6</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.3</text>
                        </>
                      ) : isAvogadrosLaw ? (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">25L</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">18L</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">12L</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">6L</text>
                        </>
                      ) : isElectrolysis ? (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">3g</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">2.2g</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">1.5g</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">0.8g</text>
                        </>
                      ) : isColligative ? (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">8°C</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">6°C</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">4°C</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">2°C</text>
                        </>
                      ) : isCharlesLaw ? (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">660ml</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">600ml</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">545ml</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">485ml</text>
                        </>
                      ) : isPhotosynthesis ? (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">100%</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">75%</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">50%</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">25%</text>
                        </>
                      ) : isMendelian || isMitosis ? (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">100%</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">75%</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">50%</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">25%</text>
                        </>
                      ) : (
                        <>
                          <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">100°C</text>
                          <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">75°C</text>
                          <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">50°C</text>
                          <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">25°C</text>
                        </>
                      )}

                      {/* Ambient baseline (dashed) */}
                      {!isBoylesLaw && !isCharlesLaw && !isPhotosynthesis && !isMendelian && !isMitosis && !isOhmsLaw && !isLeChateliers && !isBeerLambert && !isHesssLaw && !isSharedChemistryLab && (
                        <path d={savedAmbientPath} stroke="#10b981" strokeWidth="1.25" strokeDasharray="3 2" fill="none" opacity="0.8" />
                      )}
                      
                      {/* Curve / line (solid) */}
                      <path d={savedSvgPath} stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" fill="none" />
                      
                      {/* Data Points overlay circles */}
                      {savedData.dataPoints.map((p, idx) => {
                        const cx = isBoylesLaw ? (20 + (((p.volume ?? 250) - 250) / 550) * 160) : isCharlesLaw ? (20 + ((p.temperatureC ?? 0) / 90) * 160) : isPhotosynthesis ? (20 + ((p.time ?? 0) / 10) * 160) : isMendelian || isMitosis ? (20 + (idx / Math.max(1, savedData.dataPoints.length - 1)) * 160) : isOhmsLaw ? (20 + ((p.voltage ?? 0) / 24) * 160) : isLeChateliers ? (20 + ((p.time ?? 0) / 100) * 160) : isBeerLambert ? (20 + ((p.concentration ?? 0) / 0.5) * 160) : isHesssLaw ? (20 + ((p.time ?? 0) / 100) * 160) : isGalvanicCell ? (20 + ((p.time ?? 0) / 100) * 160) : isChemicalKinetics ? (20 + ((p.concentration ?? 0) / 2) * 160) : isSolubilityProduct ? (20 + ((p.time ?? 0) / 100) * 160) : isAvogadrosLaw ? (20 + ((p.moles ?? 0) / 1) * 160) : isElectrolysis ? (20 + ((p.charge ?? 0) / 9000) * 160) : isColligative ? (20 + ((p.molality ?? 0) / 3) * 160) : timeToSvgX(p.time ?? 0);
                        const cy = isBoylesLaw ? (100 - (((p.pressure ?? 55) - 55) / 185) * 90) : isCharlesLaw ? (100 - (((p.volume ?? 430) - 430) / 230) * 90) : isPhotosynthesis ? (100 - ((p.rate ?? 0) / 100) * 90) : isMendelian ? (100 - (savedData.dataPoints.slice(0, idx + 1).filter((point) => point.phenotype === "เด่น").length / (idx + 1)) * 90) : isMitosis ? (100 - ((p.progress ?? 0) / 100) * 90) : isOhmsLaw ? (100 - ((p.current ?? 0) / 2.5) * 90) : isLeChateliers ? (100 - ((p.concentration ?? 0) / 0.05) * 90) : isBeerLambert ? (100 - ((p.absorbance ?? 0) / 2.0) * 90) : isHesssLaw ? (100 - (((p.temperature ?? 25) - 20) / 40) * 90) : isGalvanicCell ? (100 - ((p.cellVoltage ?? 0) / 1.2) * 90) : isChemicalKinetics ? (100 - ((p.reactionRate ?? 0) / 100) * 90) : isSolubilityProduct ? (100 - Math.min(1.2, p.saturationIndex ?? 0) / 1.2 * 90) : isAvogadrosLaw ? (100 - ((p.volume ?? 0) / 25) * 90) : isElectrolysis ? (100 - ((p.platedMass ?? 0) / 3) * 90) : isColligative ? (100 - ((p.deltaT ?? 0) / 8) * 90) : tempToSvgY(p.temp ?? 0);
                        return (
                          <circle
                            key={idx}
                            cx={cx}
                            cy={cy}
                            r="1.5"
                            fill="#ffffff"
                            stroke="#3b82f6"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Horizontal axis time line */}
                      <line x1="20" y1="110" x2="180" y2="110" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                      {isBoylesLaw ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">250</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">525</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">800</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">ml</text>
                        </>
                      ) : isCharlesLaw ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">45</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">90</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">°C</text>
                        </>
                      ) : isPhotosynthesis ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">5</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">10</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">min</text>
                        </>
                      ) : isMendelian || isMitosis ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">start</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">mid</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">end</text>
                        </>
                      ) : isLeChateliers ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                          <text x="60" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">25</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">50</text>
                          <text x="140" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">75</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">100</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">วินาที</text>
                        </>
                      ) : isBeerLambert ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                          <text x="60" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0.12</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0.25</text>
                          <text x="140" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0.37</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0.5</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">ความเข้มข้น (M)</text>
                        </>
                      ) : isHesssLaw ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                          <text x="60" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">25</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">50</text>
                          <text x="140" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">75</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">100</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">วินาที</text>
                        </>
                      ) : isGalvanicCell ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">50</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">100</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">Q%</text>
                        </>
                      ) : isChemicalKinetics ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">1.0</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">2.0</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">M</text>
                        </>
                      ) : isSolubilityProduct ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">50</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">100</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">mix</text>
                        </>
                      ) : isAvogadrosLaw ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0.5</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">1.0</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">mol</text>
                        </>
                      ) : isElectrolysis ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">4.5k</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">9k</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">C</text>
                        </>
                      ) : isColligative ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">1.5</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">3.0</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">m</text>
                        </>
                      ) : isOhmsLaw ? (
                        <>
                          <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                          <text x="60" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">6</text>
                          <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">12</text>
                          <text x="140" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">18</text>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">24</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">แรงดัน (V)</text>
                        </>
                      ) : (
                        <>
                          <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">60</text>
                          <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">นาที</text>
                        </>
                      )}
                    </svg>

                    <div className="flex items-center justify-center gap-4 mt-2 text-[9px] font-bold text-slate-500 select-none">
                      {isBoylesLaw ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>ความดันแก๊ส (P)</span>
                        </div>
                      ) : isCharlesLaw ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>ปริมาตรแก๊ส (V)</span>
                        </div>
                      ) : isPhotosynthesis ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>อัตราการสังเคราะห์แสง</span>
                        </div>
                      ) : isMendelian ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>สัดส่วนลักษณะเด่นสะสม</span>
                        </div>
                      ) : isMitosis ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>ความคืบหน้าแต่ละระยะ</span>
                        </div>
                      ) : isOhmsLaw ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>กระแสไฟฟ้า (I)</span>
                        </div>
                      ) : isLeChateliers ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>ความเข้มข้น [Fe(SCN)]²⁺</span>
                        </div>
                      ) : isBeerLambert ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>ค่าการดูดกลืนแสง (Absorbance)</span>
                        </div>
                      ) : isHesssLaw ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>อุณหภูมิ (°C)</span>
                        </div>
                      ) : isGalvanicCell ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>แรงดันเซลล์ (Ecell)</span>
                        </div>
                      ) : isChemicalKinetics ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>อัตราปฏิกิริยา</span>
                        </div>
                      ) : isSolubilityProduct ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>สัดส่วน Qsp/Ksp</span>
                        </div>
                      ) : isAvogadrosLaw ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>ปริมาตรแก๊ส (L)</span>
                        </div>
                      ) : isElectrolysis ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>มวลโลหะที่ชุบ</span>
                        </div>
                      ) : isColligative ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                          <span>การเปลี่ยนอุณหภูมิ ΔT</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                            <span>อุณหภูมิวัตถุ (T)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-0.5 border-t border-dashed border-emerald-500" />
                            <span>อุณหภูมิแวดล้อม (Tₛ)</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right column: Data Table */}
                  <div className="border border-slate-100 rounded-2xl bg-slate-50/20 p-4 flex flex-col justify-between max-h-[220px]">
                    <div className="overflow-x-auto overflow-y-auto flex-1">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold text-[10px] sm:text-xs">
                            {isOhmsLaw ? (
                              <>
                                <th className="py-2 px-3">จุดวัด</th>
                                <th className="py-2 px-3">แรงดัน (V)</th>
                                <th className="py-2 px-3">กระแสไฟฟ้า (A)</th>
                              </>
                            ) : isBoylesLaw ? (
                              <>
                                <th className="py-2 px-3">จุดวัด</th>
                                <th className="py-2 px-3">ปริมาตร (ml)</th>
                                <th className="py-2 px-3">ความดัน (kPa)</th>
                              </>
                            ) : isCharlesLaw ? (
                              <>
                                <th className="py-2 px-3">จุดวัด</th>
                                <th className="py-2 px-3">อุณหภูมิ (°C)</th>
                                <th className="py-2 px-3">ปริมาตร (ml)</th>
                              </>
                            ) : isPhotosynthesis ? (
                              <>
                                <th className="py-2 px-3">เวลา (นาที)</th>
                                <th className="py-2 px-3">Rate (%)</th>
                                <th className="py-2 px-3">O₂</th>
                              </>
                            ) : isMendelian ? (
                              <>
                                <th className="py-2 px-3">ลำดับ</th>
                                <th className="py-2 px-3">Genotype</th>
                                <th className="py-2 px-3">Phenotype</th>
                              </>
                            ) : isMitosis ? (
                              <>
                                <th className="py-2 px-3">Cycle</th>
                                <th className="py-2 px-3">Stage</th>
                                <th className="py-2 px-3">Checkpoint</th>
                              </>
                            ) : isGalvanicCell ? (
                              <>
                                <th className="py-2 px-3">สัดส่วน Q (%)</th>
                                <th className="py-2 px-3">Ecell (V)</th>
                                <th className="py-2 px-3">Ion ratio</th>
                              </>
                            ) : isChemicalKinetics ? (
                              <>
                                <th className="py-2 px-3">[A] (M)</th>
                                <th className="py-2 px-3">Rate</th>
                                <th className="py-2 px-3">เวลา (s)</th>
                              </>
                            ) : isSolubilityProduct ? (
                              <>
                                <th className="py-2 px-3">ขั้นผสม</th>
                                <th className="py-2 px-3">Qsp/Ksp</th>
                                <th className="py-2 px-3">สถานะ</th>
                              </>
                            ) : isAvogadrosLaw ? (
                              <>
                                <th className="py-2 px-3">โมล</th>
                                <th className="py-2 px-3">ปริมาตร (L)</th>
                                <th className="py-2 px-3">Vm</th>
                              </>
                            ) : isElectrolysis ? (
                              <>
                                <th className="py-2 px-3">ประจุ (C)</th>
                                <th className="py-2 px-3">มวล (g)</th>
                                <th className="py-2 px-3">กระแส (A)</th>
                              </>
                            ) : isColligative ? (
                              <>
                                <th className="py-2 px-3">molality</th>
                                <th className="py-2 px-3">ΔT (°C)</th>
                                <th className="py-2 px-3">i</th>
                              </>
                            ) : (
                              <>
                                <th className="py-2 px-3">เวลา (นาที)</th>
                                <th className="py-2 px-3">อุณหภูมิวัตถุ (°C)</th>
                                <th className="py-2 px-3">อุณหภูมิสิ่งแวดล้อม (°C)</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[10px] sm:text-xs font-semibold text-slate-600">
                          {savedData.dataPoints.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-100/50 transition-colors">
                              {isOhmsLaw ? (
                                <>
                                  <td className="py-1.5 px-3 font-mono">#{idx + 1}</td>
                                  <td className="py-1.5 px-3 font-mono text-rose-600">{(p.voltage ?? 0).toFixed(1)} V</td>
                                  <td className="py-1.5 px-3 font-mono text-blue-600">{(p.current ?? 0).toFixed(3)} A</td>
                                </>
                              ) : isBoylesLaw ? (
                                <>
                                  <td className="py-1.5 px-3 font-mono">#{idx + 1}</td>
                                  <td className="py-1.5 px-3 font-mono text-blue-600">{(p.volume ?? 0).toFixed(0)} ml</td>
                                  <td className="py-1.5 px-3 font-mono text-cyan-600">{(p.pressure ?? 0).toFixed(1)} kPa</td>
                                </>
                              ) : isCharlesLaw ? (
                                <>
                                  <td className="py-1.5 px-3 font-mono">#{idx + 1}</td>
                                  <td className="py-1.5 px-3 font-mono text-orange-600">{(p.temperatureC ?? 0).toFixed(1)} °C</td>
                                  <td className="py-1.5 px-3 font-mono text-cyan-600">{(p.volume ?? 0).toFixed(1)} ml</td>
                                </>
                              ) : isPhotosynthesis ? (
                                <>
                                  <td className="py-1.5 px-3 font-mono">{(p.time ?? 0).toFixed(1)}</td>
                                  <td className="py-1.5 px-3 font-mono text-emerald-600">{(p.rate ?? 0).toFixed(1)}%</td>
                                  <td className="py-1.5 px-3 font-mono text-cyan-600">{(p.oxygen ?? 0).toFixed(1)}</td>
                                </>
                              ) : isMendelian ? (
                                <>
                                  <td className="py-1.5 px-3 font-mono">#{idx + 1}</td>
                                  <td className="py-1.5 px-3 font-mono text-violet-600">{p.genotype ?? "-"}</td>
                                  <td className="py-1.5 px-3 text-emerald-600">{p.phenotype ?? "-"}</td>
                                </>
                              ) : isMitosis ? (
                                <>
                                  <td className="py-1.5 px-3 font-mono">{p.cycle ?? idx + 1}</td>
                                  <td className="py-1.5 px-3 text-cyan-600">{p.stage ?? "-"}</td>
                                  <td className="py-1.5 px-3 font-mono text-violet-600">{p.checkpoint ?? 0}%</td>
                                </>
                              ) : isGalvanicCell ? (
                                <>
                                  <td className="py-1.5 px-3 font-mono">{(p.time ?? 0).toFixed(0)}%</td>
                                  <td className="py-1.5 px-3 font-mono text-blue-600">{(p.cellVoltage ?? 0).toFixed(2)} V</td>
                                  <td className="py-1.5 px-3 font-mono text-violet-600">{(p.concentration ?? 1).toFixed(2)}</td>
                                </>
                              ) : isChemicalKinetics ? (
                                <>
                                  <td className="py-1.5 px-3 font-mono text-blue-600">{(p.concentration ?? 0).toFixed(2)}</td>
                                  <td className="py-1.5 px-3 font-mono text-orange-600">{(p.reactionRate ?? 0).toFixed(1)}</td>
                                  <td className="py-1.5 px-3 font-mono">{(p.time ?? 0).toFixed(0)}</td>
                                </>
                              ) : isSolubilityProduct ? (
                                <>
                                  <td className="py-1.5 px-3 font-mono">#{idx + 1}</td>
                                  <td className="py-1.5 px-3 font-mono text-cyan-600">{(p.saturationIndex ?? 0).toFixed(2)}</td>
                                  <td className="py-1.5 px-3 text-rose-600">{(p.saturationIndex ?? 0) > 1 ? "เกิดตะกอน" : "ยังละลายได้"}</td>
                                </>
                              ) : isAvogadrosLaw ? (
                                <>
                                  <td className="py-1.5 px-3 font-mono text-blue-600">{(p.moles ?? 0).toFixed(2)}</td>
                                  <td className="py-1.5 px-3 font-mono text-cyan-600">{(p.volume ?? 0).toFixed(2)}</td>
                                  <td className="py-1.5 px-3 font-mono text-emerald-600">{(p.molarVolume ?? 0).toFixed(1)}</td>
                                </>
                              ) : isElectrolysis ? (
                                <>
                                  <td className="py-1.5 px-3 font-mono text-violet-600">{(p.charge ?? 0).toFixed(0)}</td>
                                  <td className="py-1.5 px-3 font-mono text-amber-600">{(p.platedMass ?? 0).toFixed(3)}</td>
                                  <td className="py-1.5 px-3 font-mono text-blue-600">{(p.current ?? 0).toFixed(2)}</td>
                                </>
                              ) : isColligative ? (
                                <>
                                  <td className="py-1.5 px-3 font-mono text-blue-600">{(p.molality ?? 0).toFixed(2)}</td>
                                  <td className="py-1.5 px-3 font-mono text-cyan-600">{(p.deltaT ?? 0).toFixed(2)}</td>
                                  <td className="py-1.5 px-3 font-mono text-violet-600">{(p.concentration ?? 0).toFixed(1)}</td>
                                </>
                              ) : (
                                <>
                                  <td className="py-1.5 px-3 font-mono">{(p.time ?? 0).toFixed(1)}</td>
                                  <td className="py-1.5 px-3 font-mono text-rose-600">{(p.temp ?? 0).toFixed(1)}</td>
                                  <td className="py-1.5 px-3 font-mono text-blue-600">{(p.ambient ?? 0).toFixed(1)}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Column (30%) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 self-start">
            <LabSidebar labId={labId} />
          </div>

        </div>
      </main>

      {/* 5. Simulator Loading & Interactive Console Modal */}
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
                <span className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                  {isOhmsLaw ? "เครื่องจำลองวงจรไฟฟ้ากระแสตรงเสมือนจริง" : "เครื่องทดลองเย็นตัวจำลองเสมือนจริง"}
                </span>
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
                        {isOhmsLaw 
                          ? "ลองปรับตั้งค่าตัวแปรจำลองด้านล่าง เพื่อดูความชันของเส้นกราฟตามกฎของโอห์มในทันที"
                          : "ลองปรับตั้งค่าตัวแปรจำลองด้านล่าง เพื่อดูการฟิตติ้งเส้นโค้งอุณหภูมิตามกฎนิวตันในทันที"}
                      </p>
                    </div>
                  </div>

                  {/* Two Column Layout for controls vs output */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Simulator Sliders */}
                    <div className="md:col-span-5 bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between gap-4">
                      {isOhmsLaw ? (
                        /* Ohm's Law Controls */
                        <div>
                          <h5 className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase leading-relaxed flex items-center gap-1.5 mb-4 select-none">
                            <Sliders className="w-4 h-4 text-indigo-500" />
                            ตัวแปรทดลองควบคุม
                          </h5>

                          <div className="space-y-4">
                            {/* Voltage */}
                            <div className="group bg-white p-3 rounded-xl border border-slate-100 hover:border-slate-200/60 hover:shadow-xs transition-all duration-200 select-none">
                              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                                <span className="text-slate-600 flex items-center gap-1.5 leading-normal">
                                  <Zap className="w-4 h-4 text-blue-500 group-hover:scale-110" />
                                  แรงดันไฟฟ้า (V)
                                </span>
                                <span className="text-blue-600 font-extrabold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{ohmsVoltage.toFixed(1)} V</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="24"
                                step="0.5"
                                value={ohmsVoltage}
                                onChange={(e) => setOhmsVoltage(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                            </div>

                            {/* Resistance */}
                            <div className="group bg-white p-3 rounded-xl border border-slate-100 hover:border-slate-200/60 hover:shadow-xs transition-all duration-200 select-none">
                              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                                <span className="text-slate-600 flex items-center gap-1.5 leading-normal">
                                  <Sliders className="w-4 h-4 text-amber-500 group-hover:rotate-45" />
                                  ความต้านทาน (R)
                                </span>
                                <span className="text-amber-600 font-extrabold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{ohmsResistance.toFixed(0)} Ω</span>
                              </div>
                              <input
                                type="range"
                                min="10"
                                max="500"
                                step="10"
                                value={ohmsResistance}
                                onChange={(e) => setOhmsResistance(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                              />
                            </div>

                            {/* Computed Current Output */}
                            <div className="group bg-white p-3 rounded-xl border border-slate-100 hover:border-slate-200/60 hover:shadow-xs transition-all duration-200 select-none">
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-slate-600 flex items-center gap-1.5 leading-normal">
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  กระแสไฟฟ้าผลลัพธ์ (I)
                                </span>
                                <span className="text-emerald-600 font-extrabold text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{ohmsCurrent.toFixed(3)} A</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Cooling Controls */
                        <div>
                          <h5 className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase leading-relaxed flex items-center gap-1.5 mb-4 select-none">
                            <Sliders className="w-4 h-4 text-indigo-500" />
                            ตัวแปรทดลองควบคุม
                          </h5>

                          <div className="space-y-4">
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
                      )}

                      {/* Reset button */}
                      <button
                        onClick={() => {
                          if (isOhmsLaw) {
                            setOhmsVoltage(12.0);
                            setOhmsResistance(100.0);
                          } else {
                            setInitialTemp(90);
                            setAmbientTemp(25);
                            setCoolingConstant(0.04);
                          }
                        }}
                        className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>คืนค่าเริ่มต้น</span>
                      </button>
                    </div>

                    {/* Output Real-time Graph */}
                    <div className="md:col-span-7 flex flex-col justify-between">
                      <div className="w-full h-full bg-slate-950/95 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-inner relative overflow-hidden">
                        {/* Title block inside graph */}
                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold select-none border-b border-slate-900 pb-1.5 mb-2">
                          <span>TELEMETRY GRAPH (REAL-TIME)</span>
                          <span className="text-indigo-400">
                            {isOhmsLaw ? "MODEL: I = V / R" : "MODEL: T(t) = Tₛ + (T₀ - Tₛ)e⁻ᵏᵗ"}
                          </span>
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

                          {isOhmsLaw ? (
                            /* Ohm's Law Graph Metrics */
                            <>
                              <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">2.5A</text>
                              <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">2.0A</text>
                              <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">1.5A</text>
                              <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">1.0A</text>

                              {/* Area under curve */}
                              <path d={ohmsPreviewAreaPath} fill="url(#chartGrad)" />

                              {/* Glowing path */}
                              <path d={ohmsPreviewLinePath} stroke="#60a5fa" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.3" filter="url(#glow-line)" />

                              {/* Solid path */}
                              <path d={ohmsPreviewLinePath} stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" fill="none" />

                              {/* Operating Point Indicator dot */}
                              <circle cx={20 + (ohmsVoltage / 24) * 160} cy={100 - (ohmsCurrent / 2.5) * 90} r="3.5" fill="#f43f5e" />
                              
                              <line x1="20" y1="110" x2="180" y2="110" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                              <text x="20" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">0</text>
                              <text x="60" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">6</text>
                              <text x="100" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">12</text>
                              <text x="140" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">18</text>
                              <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">24</text>
                              <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">แรงดัน (V)</text>
                            </>
                          ) : (
                            /* Cooling Graph Metrics */
                            <>
                              <text x="17" y="12.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">100°C</text>
                              <text x="17" y="35" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">75°C</text>
                              <text x="17" y="57.5" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">50°C</text>
                              <text x="17" y="80" fill="#475569" fontSize="6.5" fontWeight="bold" textAnchor="end">25°C</text>

                              {/* Ambient Temp Ts line */}
                              <line x1="20" y1={ambientY} x2="180" y2={ambientY} stroke="#10b981" strokeWidth="1.25" strokeDasharray="3 2" opacity="0.8" />
                              <text x="183" y={ambientY + 2} fill="#10b981" fontSize="7" fontWeight="extrabold">Tₛ</text>

                              {/* Area under the path */}
                              <path d={svgAreaPath} fill="url(#chartGrad)" />

                              {/* Glowing line shadow */}
                              <path d={svgPath} stroke="#60a5fa" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.3" filter="url(#glow-line)" />
                              
                              {/* Interactive Cooling Curve path */}
                              <path d={svgPath} stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" fill="none" />

                              {/* Hot Initial Point Indicator */}
                              {chartPoints.length > 0 && (
                                <circle cx="20" cy={tempToSvgY(initialTemp)} r="3" fill="#f43f5e" />
                              )}

                              <line x1="20" y1="110" x2="180" y2="110" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                              <text x="180" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">60</text>
                              <text x="195" y="118" fill="#94a3b8" fontSize="6" fontWeight="bold">นาที</text>
                            </>
                          )}
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
