"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ClipboardList,
  Droplets,
  FlaskConical,
  Gauge,
  LineChart,
  LucideIcon,
  RotateCcw,
  Sliders,
  Thermometer,
  Timer,
  Zap,
} from "lucide-react";
import SharedSimulationShell, { SimulationMetric, SimulationStep } from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

export type ChemistryConceptLabId =
  | "galvanic-cell"
  | "chemical-kinetics"
  | "solubility-product"
  | "avogadros-law"
  | "electrolysis-lab"
  | "colligative-properties";

type Accent = "blue" | "cyan" | "emerald" | "orange" | "rose" | "violet";

interface SliderConfig {
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  defaultValue: number;
}

interface LabConfig {
  title: string;
  subtitle: string;
  accent: Accent;
  icon: LucideIcon;
  sceneTitle: string;
  controlsTitle: string;
  saveKey: string;
  primary: SliderConfig;
  secondary: SliderConfig;
  learningGoals: string[];
  tips: string[];
  steps: SimulationStep[];
  theoryTitle: string;
  equation: React.ReactNode;
  theoryNotes: string[];
}

interface PlotPoint {
  x: number;
  y: number;
}

interface ChemistryResult {
  metrics: SimulationMetric[];
  tableHeaders: string[];
  tableRows: string[][];
  graphTitle: string;
  graphSubtitle: string;
  xLabel: string;
  yLabel: string;
  xMax: number;
  yMax: number;
  points: PlotPoint[];
  progressPercent: number;
  progressValue: string;
  summary: string;
  savedPayload: Record<string, number | string>;
  dataPoints: Array<Record<string, number | string>>;
}

const FARADAY = 96485;

const labConfigs: Record<ChemistryConceptLabId, LabConfig> = {
  "galvanic-cell": {
    title: "Galvanic Cells & Voltage",
    subtitle: "จำลองเซลล์กัลวานิก Zn/Cu ปรับอัตราส่วนไอออนและคุณภาพสะพานเกลือเพื่อดูผลต่อแรงดันเซลล์",
    accent: "violet",
    icon: Zap,
    sceneTitle: "เซลล์กัลวานิกจำลอง",
    controlsTitle: "ปรับเงื่อนไขรีดอกซ์",
    saveKey: "scisiam_saved_galvanic_experiment",
    primary: { label: "อัตราส่วนไอออน Q", min: 0.2, max: 3, step: 0.1, unit: "ratio", defaultValue: 1 },
    secondary: { label: "ประสิทธิภาพสะพานเกลือ", min: 40, max: 100, step: 5, unit: "%", defaultValue: 85 },
    learningGoals: [
      "ระบุแอโนด แคโทด และทิศทางการไหลของอิเล็กตรอนได้",
      "อธิบายผลของอัตราส่วนไอออนต่อแรงดันเซลล์ได้",
      "เชื่อมโยงแรงดันเซลล์กับปฏิกิริยารีดอกซ์ได้",
    ],
    tips: [
      "เริ่มจาก Q = 1 เพื่อดูแรงดันมาตรฐาน",
      "ลดประสิทธิภาพสะพานเกลือเพื่อเห็นแรงดันตกจากความต้านทานภายใน",
      "บันทึกผลเมื่อกราฟแรงดันมีข้อมูลครบช่วง",
    ],
    steps: [
      { label: "เตรียมครึ่งเซลล์ Zn/Cu", icon: FlaskConical },
      { label: "เชื่อมสะพานเกลือ", icon: Droplets },
      { label: "วัดแรงดันเซลล์", icon: Zap },
      { label: "วิเคราะห์สมการเนิร์นสต์", icon: LineChart },
    ],
    theoryTitle: "Ecell = Ecathode - Eanode",
    equation: <span>E<sub>cell</sub> = E° - 0.0592/n log Q</span>,
    theoryNotes: [
      "เซลล์กัลวานิกสร้างไฟฟ้าจากปฏิกิริยารีดอกซ์ที่เกิดเอง",
      "สะพานเกลือช่วยให้ไอออนเคลื่อนที่เพื่อรักษาสมดุลประจุ",
      "ค่า Q สูงขึ้นอาจทำให้แรงดันลดลงตามสมการเนิร์นสต์",
    ],
  },
  "chemical-kinetics": {
    title: "Chemical Reaction Rates",
    subtitle: "ทดลองปรับความเข้มข้นและอุณหภูมิ เพื่อดูการเปลี่ยนอัตราการเกิดปฏิกิริยาแบบทันที",
    accent: "orange",
    icon: Activity,
    sceneTitle: "ภาชนะปฏิกิริยาจำลอง",
    controlsTitle: "ปรับตัวแปรจลนพลศาสตร์",
    saveKey: "scisiam_saved_kinetics_experiment",
    primary: { label: "ความเข้มข้นสารตั้งต้น [A]", min: 0.1, max: 2, step: 0.1, unit: "M", defaultValue: 1 },
    secondary: { label: "อุณหภูมิ", min: 15, max: 70, step: 1, unit: "°C", defaultValue: 35 },
    learningGoals: [
      "อธิบายผลของความเข้มข้นต่ออัตราปฏิกิริยาได้",
      "เชื่อมโยงอุณหภูมิกับพลังงานจลน์และการชนได้",
      "อ่านกราฟ rate-concentration เพื่อสรุปแนวโน้มได้",
    ],
    tips: [
      "ปรับทีละตัวแปรเพื่อแยกผลของความเข้มข้นและอุณหภูมิ",
      "อุณหภูมิสูงมากทำให้ rate เพิ่มเร็ว ควรเทียบกับค่ากลาง",
      "บันทึกค่าหลายช่วงเพื่อเห็นความโค้งของกราฟ",
    ],
    steps: [
      { label: "ตั้งความเข้มข้น", icon: Sliders },
      { label: "ควบคุมอุณหภูมิ", icon: Thermometer },
      { label: "จับเวลาการเปลี่ยนสี", icon: Timer },
      { label: "สรุปกฎอัตรา", icon: LineChart },
    ],
    theoryTitle: "rate = k[A]^m",
    equation: <span>rate = k[A]<sup>m</sup></span>,
    theoryNotes: [
      "อัตราปฏิกิริยาสูงขึ้นเมื่ออนุภาคชนกันถี่และมีพลังงานมากพอ",
      "อุณหภูมิทำให้ค่าคงที่อัตรา k เปลี่ยนตามแนวคิด Arrhenius",
      "ความชันของกราฟช่วยบอกความไวของระบบต่อความเข้มข้น",
    ],
  },
  "solubility-product": {
    title: "Solubility Product Constant",
    subtitle: "จำลองสมดุลการละลายของเกลือละลายน้อย เปรียบเทียบ Qsp กับ Ksp และจุดเกิดตะกอน",
    accent: "cyan",
    icon: Droplets,
    sceneTitle: "การตกตะกอนจำลอง",
    controlsTitle: "ปรับความเข้มข้นไอออน",
    saveKey: "scisiam_saved_ksp_experiment",
    primary: { label: "ความเข้มข้นไอออนรวม", min: 0.2, max: 2, step: 0.1, unit: "x", defaultValue: 0.9 },
    secondary: { label: "ผลของ common ion", min: 0, max: 1, step: 0.05, unit: "x", defaultValue: 0.25 },
    learningGoals: [
      "คำนวณและตีความ Qsp/Ksp ได้",
      "บอกสภาวะไม่อิ่มตัว อิ่มตัว หรือเกิดตะกอนได้",
      "อธิบาย common ion effect ต่อการละลายได้",
    ],
    tips: [
      "สังเกตเส้น threshold ที่ Qsp/Ksp = 1",
      "เพิ่ม common ion แล้วดูว่าตะกอนเกิดเร็วขึ้นอย่างไร",
      "ใช้ค่าที่อยู่ใกล้ 1 เพื่อฝึกตัดสินสมดุล",
    ],
    steps: [
      { label: "เตรียมไอออน", icon: Droplets },
      { label: "ผสมสารละลาย", icon: FlaskConical },
      { label: "คำนวณ Qsp", icon: ClipboardList },
      { label: "เทียบกับ Ksp", icon: LineChart },
    ],
    theoryTitle: "Ksp และ Qsp",
    equation: <span>K<sub>sp</sub> = [M<sup>+</sup>][X<sup>-</sup>]</span>,
    theoryNotes: [
      "Ksp เป็นค่าคงที่สมดุลของการละลาย ณ อุณหภูมิหนึ่ง",
      "ถ้า Qsp มากกว่า Ksp สารละลายมีไอออนเกินและจะเกิดตะกอน",
      "common ion ทำให้สมดุลเลื่อนไปทางของแข็งและลดการละลาย",
    ],
  },
  "avogadros-law": {
    title: "Avogadro's Molar Volume",
    subtitle: "ปรับจำนวนโมลและอุณหภูมิของแก๊สเพื่อประเมินปริมาตรโมลาร์และเปรียบเทียบกับค่า STP",
    accent: "blue",
    icon: Gauge,
    sceneTitle: "กระบอกเก็บแก๊สจำลอง",
    controlsTitle: "ปรับจำนวนโมลแก๊ส",
    saveKey: "scisiam_saved_avogadro_experiment",
    primary: { label: "จำนวนโมลแก๊ส", min: 0.1, max: 1, step: 0.05, unit: "mol", defaultValue: 0.5 },
    secondary: { label: "อุณหภูมิแก๊ส", min: 0, max: 45, step: 1, unit: "°C", defaultValue: 25 },
    learningGoals: [
      "อธิบายปริมาตรโมลาร์ของแก๊สได้",
      "ใช้ PV = nRT เพื่อปรับเทียบปริมาตรได้",
      "อ่านกราฟ V-n และตีความความชันได้",
    ],
    tips: [
      "ลองอุณหภูมิ 0°C เพื่อเข้าใกล้สภาวะ STP แบบคลาสสิก",
      "เพิ่มจำนวนโมลแล้วสังเกตเส้นตรงของกราฟ",
      "เปรียบเทียบ Vm กับค่า 22.4 L/mol",
    ],
    steps: [
      { label: "ชั่งสารตั้งต้น", icon: ClipboardList },
      { label: "เก็บแก๊ส", icon: Gauge },
      { label: "ปรับเทียบ T/P", icon: Thermometer },
      { label: "คำนวณ Vm", icon: LineChart },
    ],
    theoryTitle: "Vm = V/n",
    equation: <span>PV = nRT, V<sub>m</sub> = V/n</span>,
    theoryNotes: [
      "จำนวนโมลเพิ่มขึ้นทำให้ปริมาตรแก๊สเพิ่มขึ้นในสัดส่วนตรง",
      "อุณหภูมิสูงขึ้นทำให้ปริมาตรที่วัดได้สูงขึ้นหากความดันคงที่",
      "ค่า STP แบบคลาสสิกมักใช้อ้างอิงที่ประมาณ 22.4 L/mol",
    ],
  },
  "electrolysis-lab": {
    title: "Electrolysis & Metal Plating",
    subtitle: "ปรับกระแสและเวลาเพื่อดูมวลโลหะที่ชุบตามกฎของฟาราเดย์ในเซลล์อิเล็กโทรไลซิส",
    accent: "violet",
    icon: Zap,
    sceneTitle: "เซลล์ชุบโลหะจำลอง",
    controlsTitle: "ปรับกระแสและเวลา",
    saveKey: "scisiam_saved_electrolysis_experiment",
    primary: { label: "กระแสไฟฟ้า", min: 0.2, max: 3, step: 0.1, unit: "A", defaultValue: 1.2 },
    secondary: { label: "เวลาในการชุบ", min: 5, max: 60, step: 5, unit: "นาที", defaultValue: 30 },
    learningGoals: [
      "อธิบายการชุบโลหะที่แคโทดได้",
      "คำนวณ Q = It และมวลตามกฎของฟาราเดย์ได้",
      "วิเคราะห์ผลของกระแสและเวลาต่อคุณภาพการชุบได้",
    ],
    tips: [
      "เริ่มที่กระแสกลางเพื่อหลีกเลี่ยงการชุบเร็วเกินไป",
      "เพิ่มเวลาแล้วดูกราฟมวลสะสมเป็นเส้นตรง",
      "ตรวจขั้วไฟฟ้าก่อนเริ่มทุกครั้งในโลกจริง",
    ],
    steps: [
      { label: "ตั้งเซลล์", icon: FlaskConical },
      { label: "จ่ายกระแส DC", icon: Zap },
      { label: "สะสมโลหะ", icon: Activity },
      { label: "คำนวณมวล", icon: LineChart },
    ],
    theoryTitle: "Faraday's law",
    equation: <span>m = ItM / nF</span>,
    theoryNotes: [
      "ประจุไฟฟ้ารวมมากขึ้นทำให้โลหะถูกรีดิวซ์และเกาะแคโทดมากขึ้น",
      "ค่า n คือจำนวนอิเล็กตรอนต่อไอออนโลหะหนึ่งตัว",
      "มวลเชิงทฤษฎีช่วยประเมินประสิทธิภาพการชุบได้",
    ],
  },
  "colligative-properties": {
    title: "Colligative Properties Lab",
    subtitle: "จำลองการลดจุดเยือกแข็งและเพิ่มจุดเดือดเมื่อปรับ molality และจำนวนอนุภาคตัวละลาย",
    accent: "cyan",
    icon: Thermometer,
    sceneTitle: "อ่างควบคุมอุณหภูมิจำลอง",
    controlsTitle: "ปรับความเข้มข้นสารละลาย",
    saveKey: "scisiam_saved_colligative_experiment",
    primary: { label: "molality", min: 0.1, max: 3, step: 0.1, unit: "m", defaultValue: 1 },
    secondary: { label: "van't Hoff factor", min: 1, max: 3, step: 0.1, unit: "i", defaultValue: 1.8 },
    learningGoals: [
      "อธิบายสมบัติคอลลิเกทีฟจากจำนวนอนุภาคได้",
      "คำนวณ ΔTf และ ΔTb จาก i, K และ molality ได้",
      "เปรียบเทียบตัวละลายแตกตัวกับไม่แตกตัวได้",
    ],
    tips: [
      "เริ่มจาก i = 1 เพื่อดูตัวละลายไม่แตกตัว",
      "เพิ่ม molality เพื่อเห็น ΔT เพิ่มแบบเส้นตรง",
      "เปรียบเทียบ ΔTf กับ ΔTb เพราะค่าคงที่ของน้ำต่างกัน",
    ],
    steps: [
      { label: "วัดค่าอ้างอิง", icon: Thermometer },
      { label: "เติมตัวละลาย", icon: Droplets },
      { label: "วัด ΔT", icon: Gauge },
      { label: "สรุปผล", icon: LineChart },
    ],
    theoryTitle: "ΔT = iKm",
    equation: <span>ΔT<sub>f</sub> = iK<sub>f</sub>m</span>,
    theoryNotes: [
      "สมบัติคอลลิเกทีฟขึ้นกับจำนวนอนุภาค ไม่ใช่ชื่อสารโดยตรง",
      "ค่า i สูงขึ้นหมายถึงมีอนุภาคในสารละลายมากขึ้นหลังแตกตัว",
      "สำหรับน้ำ Kf ≈ 1.86 และ Kb ≈ 0.512 °C/m",
    ],
  },
};

function calculateLab(labId: ChemistryConceptLabId, primary: number, secondary: number): ChemistryResult {
  if (labId === "galvanic-cell") {
    const standardVoltage = 1.1;
    const internalLoss = (100 - secondary) * 0.0022;
    const cellVoltage = Math.max(0.45, standardVoltage - 0.0296 * Math.log10(primary) - internalLoss);
    const dataPoints = Array.from({ length: 6 }, (_, index) => {
      const qRatio = 0.2 + index * 0.56;
      const voltage = Math.max(0.45, standardVoltage - 0.0296 * Math.log10(qRatio) - internalLoss);
      return {
        time: index * 20,
        concentration: qRatio,
        cellVoltage: voltage,
      };
    });

    return {
      metrics: [
        { label: "Ecell", value: `${cellVoltage.toFixed(2)} V`, tone: "violet" },
        { label: "Q", value: primary.toFixed(2), tone: "blue" },
        { label: "Salt bridge", value: `${secondary.toFixed(0)}%`, tone: "cyan" },
        { label: "Loss", value: `${internalLoss.toFixed(2)} V`, tone: "rose" },
      ],
      tableHeaders: ["Q%", "Ion ratio", "Ecell (V)"],
      tableRows: dataPoints.map((p) => [p.time.toFixed(0), p.concentration.toFixed(2), p.cellVoltage.toFixed(2)]),
      graphTitle: "แรงดันเซลล์ตาม Q",
      graphSubtitle: "Nernst trend",
      xLabel: "Q%",
      yLabel: "Ecell",
      xMax: 100,
      yMax: 1.2,
      points: dataPoints.map((p) => ({ x: Number(p.time), y: p.cellVoltage })),
      progressPercent: Math.min(100, 55 + secondary * 0.35),
      progressValue: `${cellVoltage.toFixed(2)} V`,
      summary: "แรงดันลดลงเล็กน้อยเมื่อ Q เพิ่มและสะพานเกลือมีประสิทธิภาพต่ำลง",
      savedPayload: { cellVoltage, concentration: primary },
      dataPoints,
    };
  }

  if (labId === "chemical-kinetics") {
    const rate = Math.min(100, 18 * Math.pow(primary, 1.2) * Math.exp(0.045 * (secondary - 25)));
    const endpointTime = Math.max(8, 900 / Math.max(1, rate));
    const dataPoints = Array.from({ length: 6 }, (_, index) => {
      const concentration = 0.1 + index * 0.38;
      const reactionRate = Math.min(100, 18 * Math.pow(concentration, 1.2) * Math.exp(0.045 * (secondary - 25)));
      return {
        time: endpointTime * (index + 1) / 6,
        concentration,
        reactionRate,
      };
    });

    return {
      metrics: [
        { label: "Rate", value: rate.toFixed(1), tone: "orange" },
        { label: "[A]", value: `${primary.toFixed(2)} M`, tone: "blue" },
        { label: "Temp", value: `${secondary.toFixed(0)}°C`, tone: "rose" },
        { label: "Endpoint", value: `${endpointTime.toFixed(0)} s`, tone: "emerald" },
      ],
      tableHeaders: ["[A] (M)", "Rate", "เวลา (s)"],
      tableRows: dataPoints.map((p) => [p.concentration.toFixed(2), p.reactionRate.toFixed(1), p.time.toFixed(0)]),
      graphTitle: "Rate เทียบความเข้มข้น",
      graphSubtitle: "rate law",
      xLabel: "[A] M",
      yLabel: "Rate",
      xMax: 2,
      yMax: 100,
      points: dataPoints.map((p) => ({ x: p.concentration, y: p.reactionRate })),
      progressPercent: Math.min(100, 35 + rate * 0.65),
      progressValue: `${rate.toFixed(1)} rate`,
      summary: "อัตราปฏิกิริยาเพิ่มเมื่อความเข้มข้นและอุณหภูมิสูงขึ้น",
      savedPayload: { concentration: primary, reactionRate: rate, temperature: secondary },
      dataPoints,
    };
  }

  if (labId === "solubility-product") {
    const ksp = 2.8e-9;
    const saturationIndex = primary * primary * (1 + secondary * 0.65);
    const ionProduct = ksp * saturationIndex;
    const dataPoints = Array.from({ length: 6 }, (_, index) => {
      const mix = index * 20;
      const factor = 0.25 + index * 0.23;
      const pointSaturation = factor * factor * (1 + secondary * 0.65);
      return {
        time: mix,
        ionProduct: ksp * pointSaturation,
        ksp,
        saturationIndex: pointSaturation,
      };
    });

    return {
      metrics: [
        { label: "Qsp/Ksp", value: saturationIndex.toFixed(2), tone: saturationIndex > 1 ? "rose" : "cyan" },
        { label: "Qsp", value: ionProduct.toExponential(1), tone: "blue" },
        { label: "Ksp", value: ksp.toExponential(1), tone: "violet" },
        { label: "State", value: saturationIndex > 1 ? "ตะกอน" : "ละลาย", tone: saturationIndex > 1 ? "rose" : "emerald" },
      ],
      tableHeaders: ["ขั้นผสม", "Qsp/Ksp", "สถานะ"],
      tableRows: dataPoints.map((p, index) => [`#${index + 1}`, p.saturationIndex.toFixed(2), p.saturationIndex > 1 ? "เกิดตะกอน" : "ยังละลายได้"]),
      graphTitle: "Qsp เทียบ Ksp",
      graphSubtitle: "precipitation threshold",
      xLabel: "mix",
      yLabel: "Qsp/Ksp",
      xMax: 100,
      yMax: 1.2,
      points: dataPoints.map((p) => ({ x: Number(p.time), y: Math.min(1.2, p.saturationIndex) })),
      progressPercent: Math.min(100, 45 + saturationIndex * 35),
      progressValue: saturationIndex > 1 ? "เกิดตะกอน" : "ยังไม่ตกตะกอน",
      summary: saturationIndex > 1 ? "Qsp มากกว่า Ksp ระบบจึงเริ่มเกิดตะกอน" : "Qsp ยังต่ำกว่า Ksp สารละลายยังไม่อิ่มตัว",
      savedPayload: { ionProduct, ksp, saturationIndex },
      dataPoints,
    };
  }

  if (labId === "avogadros-law") {
    const tempK = secondary + 273.15;
    const molarVolume = 22.414 * (tempK / 273.15);
    const volume = primary * molarVolume;
    const dataPoints = Array.from({ length: 6 }, (_, index) => {
      const moles = 0.1 + index * 0.18;
      const pointVolume = moles * molarVolume;
      return {
        moles,
        volume: pointVolume,
        molarVolume,
      };
    });

    return {
      metrics: [
        { label: "Volume", value: `${volume.toFixed(2)} L`, tone: "blue" },
        { label: "Moles", value: `${primary.toFixed(2)} mol`, tone: "cyan" },
        { label: "Vm", value: `${molarVolume.toFixed(1)} L/mol`, tone: "emerald" },
        { label: "Temp", value: `${secondary.toFixed(0)}°C`, tone: "orange" },
      ],
      tableHeaders: ["โมล", "ปริมาตร (L)", "Vm"],
      tableRows: dataPoints.map((p) => [p.moles.toFixed(2), p.volume.toFixed(2), p.molarVolume.toFixed(1)]),
      graphTitle: "ปริมาตรเทียบจำนวนโมล",
      graphSubtitle: "V ∝ n",
      xLabel: "n mol",
      yLabel: "V L",
      xMax: 1,
      yMax: 25,
      points: dataPoints.map((p) => ({ x: p.moles, y: p.volume })),
      progressPercent: Math.min(100, 45 + primary * 55),
      progressValue: `${molarVolume.toFixed(1)} L/mol`,
      summary: "ปริมาตรแก๊สเพิ่มเป็นสัดส่วนตรงกับจำนวนโมลเมื่อความดันคงที่",
      savedPayload: { moles: primary, molarVolume, temperature: secondary },
      dataPoints,
    };
  }

  if (labId === "electrolysis-lab") {
    const charge = primary * secondary * 60;
    const platedMass = charge * 63.546 / (2 * FARADAY);
    const dataPoints = Array.from({ length: 6 }, (_, index) => {
      const fraction = (index + 1) / 6;
      const pointCharge = charge * fraction;
      return {
        time: secondary * fraction,
        current: primary,
        charge: pointCharge,
        platedMass: pointCharge * 63.546 / (2 * FARADAY),
      };
    });

    return {
      metrics: [
        { label: "Current", value: `${primary.toFixed(2)} A`, tone: "blue" },
        { label: "Charge", value: `${charge.toFixed(0)} C`, tone: "violet" },
        { label: "Plated mass", value: `${platedMass.toFixed(3)} g`, tone: "orange" },
        { label: "Time", value: `${secondary.toFixed(0)} นาที`, tone: "emerald" },
      ],
      tableHeaders: ["ประจุ (C)", "มวล (g)", "กระแส (A)"],
      tableRows: dataPoints.map((p) => [p.charge.toFixed(0), p.platedMass.toFixed(3), p.current.toFixed(2)]),
      graphTitle: "มวลโลหะเทียบประจุ",
      graphSubtitle: "Faraday law",
      xLabel: "Q C",
      yLabel: "m g",
      xMax: 9000,
      yMax: 3,
      points: dataPoints.map((p) => ({ x: p.charge, y: p.platedMass })),
      progressPercent: Math.min(100, 35 + charge / 120),
      progressValue: `${platedMass.toFixed(3)} g`,
      summary: "มวลโลหะที่ชุบเพิ่มเป็นเส้นตรงกับประจุไฟฟ้ารวม Q = It",
      savedPayload: { current: primary, charge, platedMass },
      dataPoints,
    };
  }

  const deltaTf = primary * secondary * 1.86;
  const deltaTb = primary * secondary * 0.512;
  const dataPoints = Array.from({ length: 6 }, (_, index) => {
    const molality = 0.1 + index * 0.58;
    const deltaT = molality * secondary * 1.86;
    return {
      molality,
      concentration: secondary,
      deltaT,
    };
  });

  return {
    metrics: [
      { label: "ΔTf", value: `${deltaTf.toFixed(2)}°C`, tone: "cyan" },
      { label: "ΔTb", value: `${deltaTb.toFixed(2)}°C`, tone: "orange" },
      { label: "molality", value: `${primary.toFixed(2)} m`, tone: "blue" },
      { label: "i", value: secondary.toFixed(1), tone: "violet" },
    ],
    tableHeaders: ["molality", "ΔT (°C)", "i"],
    tableRows: dataPoints.map((p) => [p.molality.toFixed(2), p.deltaT.toFixed(2), Number(p.concentration).toFixed(1)]),
    graphTitle: "ΔT เทียบ molality",
    graphSubtitle: "colligative trend",
    xLabel: "molality",
    yLabel: "ΔT",
    xMax: 3,
    yMax: 8,
    points: dataPoints.map((p) => ({ x: p.molality, y: p.deltaT })),
    progressPercent: Math.min(100, 40 + deltaTf * 8),
    progressValue: `ΔTf ${deltaTf.toFixed(2)}°C`,
    summary: "การเปลี่ยนอุณหภูมิเพิ่มตาม molality และจำนวนอนุภาคตัวละลาย",
    savedPayload: { molality: primary, concentration: secondary, deltaT: deltaTf },
    dataPoints,
  };
}

function ChemistryScene({ labId, result }: { labId: ChemistryConceptLabId; result: ChemistryResult }) {
  const isGalvanic = labId === "galvanic-cell";
  const isKinetics = labId === "chemical-kinetics";
  const isKsp = labId === "solubility-product";
  const isAvogadro = labId === "avogadros-law";
  const isElectrolysis = labId === "electrolysis-lab";
  const accent = isGalvanic || isElectrolysis ? "#7c3aed" : isKinetics ? "#f97316" : isKsp ? "#06b6d4" : isAvogadro ? "#2563eb" : "#0891b2";

  return (
    <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-white to-blue-50/50 p-4">
      <svg className="h-full min-h-[320px] w-full max-w-[620px]" viewBox="0 0 620 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="38" y="247" width="540" height="34" rx="17" fill="#e2e8f0" opacity="0.55" />
        <circle cx="300" cy="160" r="116" fill={accent} opacity="0.08" />

        {isGalvanic ? (
          <g>
            <rect x="135" y="137" width="108" height="110" rx="20" fill="#ecfeff" stroke="#67e8f9" strokeWidth="5" />
            <rect x="377" y="137" width="108" height="110" rx="20" fill="#faf5ff" stroke="#c4b5fd" strokeWidth="5" />
            <path d="M161 205H219M403 205H461" stroke="#2563eb" strokeWidth="9" strokeLinecap="round" />
            <path d="M187 137V91H433V137" stroke="#475569" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M224 91C248 50 372 50 397 91" stroke="#7c3aed" strokeWidth="7" strokeLinecap="round" />
            <circle cx="310" cy="73" r="42" fill="#ffffff" stroke="#cbd5e1" strokeWidth="6" />
            <path d="M310 73L335 51" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
            <text x="310" y="105" fill="#7c3aed" fontSize="20" fontWeight="900" textAnchor="middle">{result.metrics[0].value}</text>
          </g>
        ) : isKinetics ? (
          <g>
            <rect x="180" y="104" width="160" height="150" rx="28" fill="#fff7ed" stroke="#fed7aa" strokeWidth="6" />
            <path d="M199 220C246 180 285 203 326 134" stroke="#f97316" strokeWidth="14" strokeLinecap="round" fill="none" />
            {[218, 256, 296, 326].map((x, index) => (
              <circle key={x} cx={x} cy={140 + (index % 3) * 24} r="9" fill={index % 2 ? "#a855f7" : "#22c55e"} />
            ))}
            <circle cx="412" cy="126" r="45" fill="#ffffff" stroke="#cbd5e1" strokeWidth="6" />
            <path d="M412 126V96M412 126L440 139" stroke="#f97316" strokeWidth="7" strokeLinecap="round" />
            <text x="412" y="188" fill="#f97316" fontSize="18" fontWeight="900" textAnchor="middle">{result.metrics[0].value}</text>
          </g>
        ) : isKsp ? (
          <g>
            <path d="M224 74H396L371 250H249L224 74Z" fill="#ecfeff" stroke="#64748b" strokeWidth="7" strokeLinejoin="round" />
            <path d="M243 178H376L365 250H254L243 178Z" fill="#67e8f9" opacity="0.5" />
            {Array.from({ length: 18 }, (_, index) => (
              <circle key={index} cx={250 + (index % 6) * 24} cy={103 + Math.floor(index / 6) * 23} r="7" fill={index % 2 ? "#a855f7" : "#06b6d4"} />
            ))}
            <path d="M260 229C293 207 334 207 363 229" stroke="#f97316" strokeWidth="11" strokeLinecap="round" />
            <text x="310" y="286" fill={result.progressValue === "เกิดตะกอน" ? "#e11d48" : "#0891b2"} fontSize="20" fontWeight="900" textAnchor="middle">{result.progressValue}</text>
          </g>
        ) : isAvogadro ? (
          <g>
            <rect x="170" y="148" width="270" height="66" rx="22" fill="#eff6ff" stroke="#93c5fd" strokeWidth="7" />
            <rect x="440" y="165" width="78" height="30" rx="12" fill="#ffffff" stroke="#64748b" strokeWidth="7" />
            <path d="M181 181H430" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
            <path d="M204 148V92H285V148" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
            <circle cx="244" cy="70" r="43" fill="#dbeafe" stroke="#60a5fa" strokeWidth="7" />
            <text x="244" y="77" fill="#2563eb" fontSize="23" fontWeight="900" textAnchor="middle">gas</text>
            <text x="310" y="260" fill="#2563eb" fontSize="20" fontWeight="900" textAnchor="middle">{result.metrics[2].value}</text>
          </g>
        ) : isElectrolysis ? (
          <g>
            <rect x="172" y="105" width="276" height="150" rx="28" fill="#f5f3ff" stroke="#c4b5fd" strokeWidth="7" />
            <rect x="216" y="130" width="24" height="112" rx="8" fill="#64748b" />
            <rect x="382" y="130" width="24" height="112" rx="8" fill="#a855f7" />
            <path d="M228 105V56H393V105" stroke="#475569" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="251" y="36" width="118" height="45" rx="16" fill="#ffffff" stroke="#cbd5e1" strokeWidth="5" />
            <text x="310" y="65" fill="#7c3aed" fontSize="19" fontWeight="900" textAnchor="middle">DC</text>
            <path d="M392 184C355 222 305 235 248 232" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
            <text x="310" y="290" fill="#7c3aed" fontSize="20" fontWeight="900" textAnchor="middle">{result.metrics[2].value}</text>
          </g>
        ) : (
          <g>
            <rect x="210" y="101" width="180" height="150" rx="28" fill="#ecfeff" stroke="#67e8f9" strokeWidth="7" />
            <path d="M228 197H372" stroke="#06b6d4" strokeWidth="10" strokeLinecap="round" />
            <rect x="394" y="72" width="23" height="160" rx="11.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="5" />
            <circle cx="405" cy="246" r="27" fill="#06b6d4" stroke="#cbd5e1" strokeWidth="5" />
            <rect x="401" y="135" width="8" height="101" rx="4" fill="#06b6d4" />
            <path d="M210 251C255 276 337 276 390 251" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
            <text x="300" y="294" fill="#0891b2" fontSize="20" fontWeight="900" textAnchor="middle">{result.metrics[0].value}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

function SliderControl({
  config,
  value,
  onChange,
}: {
  config: SliderConfig;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <span className="mb-2 flex items-center justify-between gap-3 text-xs font-black text-slate-700">
        <span>{config.label}</span>
        <span className="rounded-lg bg-white px-2 py-1 font-mono text-blue-600 shadow-sm">
          {value.toFixed(config.step < 1 ? 2 : 0)} {config.unit}
        </span>
      </span>
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-blue-600"
      />
    </label>
  );
}

function ResultGraph({ result, accent }: { result: ChemistryResult; accent: Accent }) {
  const color = accent === "orange" ? "#f97316" : accent === "violet" ? "#7c3aed" : accent === "emerald" ? "#10b981" : accent === "rose" ? "#e11d48" : accent === "cyan" ? "#06b6d4" : "#2563eb";
  const xCoord = (x: number) => 30 + (Math.min(result.xMax, Math.max(0, x)) / result.xMax) * 150;
  const yCoord = (y: number) => 100 - (Math.min(result.yMax, Math.max(0, y)) / result.yMax) * 85;

  const path = result.points.map((point, index) => `${index === 0 ? "M" : "L"}${xCoord(point.x)},${yCoord(point.y)}`).join(" ");

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <LineChart className="h-4.5 w-4.5" style={{ color }} />
          {result.graphTitle}
        </h3>
        <span className="text-[10px] font-bold" style={{ color }}>{result.graphSubtitle}</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-950 p-3">
        <svg className="h-full min-h-[174px] w-full" viewBox="0 0 200 120" fill="none" aria-hidden="true">
          <line x1="30" y1="15" x2="180" y2="15" stroke="rgba(255,255,255,0.04)" />
          <line x1="30" y1="57.5" x2="180" y2="57.5" stroke="rgba(255,255,255,0.04)" />
          <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.1)" />
          <text x="27" y="17.5" fill="#64748b" fontSize="6" fontWeight="bold" textAnchor="end">{result.yMax.toFixed(result.yMax <= 3 ? 1 : 0)}</text>
          <text x="27" y="59.5" fill="#64748b" fontSize="6" fontWeight="bold" textAnchor="end">{(result.yMax / 2).toFixed(result.yMax <= 3 ? 1 : 0)}</text>
          <text x="27" y="101" fill="#64748b" fontSize="6" fontWeight="bold" textAnchor="end">0</text>
          <path d={path} stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {result.points.map((point, index) => (
            <circle key={`${point.x}-${index}`} cx={xCoord(point.x)} cy={yCoord(point.y)} r="3" fill={color} stroke="#ffffff" strokeWidth="0.8" />
          ))}
          <line x1="30" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.15)" />
          <text x="30" y="110" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">0</text>
          <text x="105" y="110" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">{(result.xMax / 2).toFixed(result.xMax <= 3 ? 1 : 0)}</text>
          <text x="180" y="110" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">{result.xMax.toFixed(result.xMax <= 3 ? 1 : 0)}</text>
          <text x="195" y="110" fill="#94a3b8" fontSize="6.5" fontWeight="bold">{result.xLabel}</text>
        </svg>
      </div>
    </section>
  );
}

function ResultTable({ result }: { result: ChemistryResult }) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-blue-600" />
          ตารางข้อมูลจำลอง
        </h3>
        <span className="text-[10px] font-bold text-slate-500">{result.tableRows.length} จุดข้อมูล</span>
      </div>
      <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-black text-slate-600">
            <tr>
              {result.tableHeaders.map((header) => (
                <th key={header} className="px-3 py-2">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {result.tableRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50/70">
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-2 font-mono">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TheoryPanel({ config, result }: { config: LabConfig; result: ChemistryResult }) {
  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
        <Sliders className="h-4.5 w-4.5 text-violet-600" />
        {config.theoryTitle}
      </h3>
      <div className="flex flex-1 flex-col justify-between gap-3 text-left">
        <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3 text-center font-mono text-sm font-black text-slate-800">
          {config.equation}
        </div>
        <ul className="space-y-2 text-xs font-semibold leading-relaxed text-slate-500">
          {config.theoryNotes.map((note) => (
            <li key={note} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-500" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-xl bg-slate-50 p-3 text-xs font-bold leading-relaxed text-slate-600">
          {result.summary}
        </div>
      </div>
    </section>
  );
}

export default function ChemistryConceptSimulation({ labId }: { labId: ChemistryConceptLabId }) {
  const router = useRouter();
  const config = labConfigs[labId];
  const [primary, setPrimary] = useState(config.primary.defaultValue);
  const [secondary, setSecondary] = useState(config.secondary.defaultValue);

  const result = useMemo(() => calculateLab(labId, primary, secondary), [labId, primary, secondary]);

  const handleReset = () => {
    setPrimary(config.primary.defaultValue);
    setSecondary(config.secondary.defaultValue);
  };

  const handleSave = async () => {
    const payload = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      ...result.savedPayload,
      dataPoints: result.dataPoints,
    };
    await saveExperimentAndSync({
      localStorageKey: config.saveKey,
      localPayload: payload,
      labId,
      title: config.title,
      variables: {
        primary: {
          label: config.primary.label,
          value: primary,
          unit: config.primary.unit,
        },
        secondary: {
          label: config.secondary.label,
          value: secondary,
          unit: config.secondary.unit,
        },
      },
      liveValues: result.savedPayload,
      graphPoints: result.points,
      tableRows: result.dataPoints,
      summary: {
        summary: result.summary,
        progressPercent: result.progressPercent,
        progressValue: result.progressValue,
      },
      score: Math.min(100, Math.max(0, result.progressPercent)),
    });
    router.push(`/labs/${labId}`);
  };

  const controls = (
    <div className="space-y-3">
      <SliderControl config={config.primary} value={primary} onChange={setPrimary} />
      <SliderControl config={config.secondary} value={secondary} onChange={setSecondary} />
      <button
        type="button"
        onClick={handleReset}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
      >
        <RotateCcw className="h-4 w-4" />
        รีเซ็ตค่าทดลอง
      </button>
      <div className="rounded-xl bg-slate-50 p-3 text-xs font-semibold leading-relaxed text-slate-500">
        {result.summary}
      </div>
    </div>
  );

  return (
    <SharedSimulationShell
      accent={config.accent}
      labId={labId}
      category="Chemistry"
      title={config.title}
      subtitle={config.subtitle}
      statusLabel="พร้อมจำลอง"
      icon={config.icon}
      sceneTitle={config.sceneTitle}
      scene={<ChemistryScene labId={labId} result={result} />}
      controlsTitle={config.controlsTitle}
      controls={controls}
      metrics={result.metrics}
      graph={<ResultGraph result={result} accent={config.accent} />}
      table={<ResultTable result={result} />}
      theory={<TheoryPanel config={config} result={result} />}
      steps={config.steps}
      learningGoals={config.learningGoals}
      progressLabel="ผลลัพธ์ปัจจุบัน"
      progressValue={result.progressValue}
      progressPercent={result.progressPercent}
      tips={config.tips}
      onSave={handleSave}
    />
  );
}
