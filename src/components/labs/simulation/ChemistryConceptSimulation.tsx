"use client";

import React, { useId, useMemo, useState } from "react";
import {
  Activity,
  ClipboardList,
  Droplets,
  FlaskConical,
  Gauge,
  LineChart,
  LucideIcon,
  Sliders,
  Thermometer,
  Timer,
  Zap,
} from "lucide-react";
import SharedSimulationShell, { SimulationMetric, SimulationStep } from "@/components/labs/simulation/SharedSimulationShell";
import CompactRangeControl from "@/components/labs/simulation/CompactRangeControl";
import ReactionRateParticleCanvas from "@/components/labs/simulation/ReactionRateParticleCanvas";
import {
  buildGalvanicSceneModel,
  buildReactionRateSceneModel,
  buildSolubilitySceneModel,
  createReadyExperimentPlayback,
  resetExperimentPlayback,
  toggleExperimentPlayback,
  type ExperimentPlaybackState,
  type GalvanicSceneModel,
  type SolubilitySceneModel,
} from "@/components/labs/simulation/chemistrySceneModels";
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

type ExperimentSceneProps = {
  runToken: number;
  isRunning: boolean;
};

function ExperimentMotionStyles() {
  return (
    <style>{`
      .electron-flow {
        offset-path: path("M 166 91 C 210 31, 408 31, 454 91");
        offset-rotate: 0deg;
        animation: electron-flow 1.35s linear infinite both;
      }
      .salt-ion-left { animation: salt-ion-left 1.8s ease-in-out infinite both; }
      .salt-ion-right { animation: salt-ion-right 1.8s ease-in-out infinite both; }
      .zinc-ion-release { animation: zinc-ion-release 2.2s ease-in-out infinite alternate both; }
      .copper-ion-arrival { animation: copper-ion-arrival 2.2s ease-in-out infinite alternate both; }
      .cathode-deposit {
        transform-box: fill-box;
        transform-origin: center bottom;
        animation: cathode-deposit 2.4s cubic-bezier(.16, 1, .3, 1) both;
      }
      .solution-drop { animation: solution-drop 1.5s cubic-bezier(.55, .06, .68, .19) infinite both; }
      .ion-drift-left { animation: ion-drift-left 1.8s ease-in-out infinite alternate both; }
      .ion-drift-right { animation: ion-drift-right 1.8s ease-in-out infinite alternate both; }
      .ion-gather-left { animation: ion-gather-left 1.8s cubic-bezier(.45, 0, .55, 1) both; }
      .ion-gather-right { animation: ion-gather-right 1.8s cubic-bezier(.45, 0, .55, 1) both; }
      .precipitate-settle { animation: precipitate-settle 2s cubic-bezier(.16, 1, .3, 1) both; }

      .experiment-motion .electron-flow,
      .experiment-motion .salt-ion-left,
      .experiment-motion .salt-ion-right,
      .experiment-motion .zinc-ion-release,
      .experiment-motion .copper-ion-arrival,
      .experiment-motion .cathode-deposit,
      .experiment-motion .solution-drop,
      .experiment-motion .ion-drift-left,
      .experiment-motion .ion-drift-right,
      .experiment-motion .ion-gather-left,
      .experiment-motion .ion-gather-right,
      .experiment-motion .precipitate-settle {
        animation-play-state: var(--experiment-play-state, paused);
      }

      @keyframes electron-flow {
        0% { offset-distance: 0%; opacity: 0; }
        12%, 88% { opacity: 1; }
        100% { offset-distance: 100%; opacity: 0; }
      }
      @keyframes salt-ion-left {
        0%, 100% { transform: translateX(18px); }
        50% { transform: translateX(-18px); }
      }
      @keyframes salt-ion-right {
        0%, 100% { transform: translateX(-18px); }
        50% { transform: translateX(18px); }
      }
      @keyframes zinc-ion-release {
        0% { transform: translate(0, 0); opacity: 0; }
        20% { opacity: 1; }
        100% { transform: translate(30px, 22px); opacity: .2; }
      }
      @keyframes copper-ion-arrival {
        0% { transform: translate(0, 0); opacity: 1; }
        100% { transform: translate(-34px, 0); opacity: .18; }
      }
      @keyframes cathode-deposit {
        from { transform: scaleY(.08); opacity: .2; }
        to { transform: scaleY(1); opacity: .95; }
      }
      @keyframes solution-drop {
        0% { transform: translateY(-35px); opacity: 0; }
        15% { opacity: 1; }
        72% { transform: translateY(62px); opacity: 1; }
        100% { transform: translateY(67px) scale(1.8, .35); opacity: 0; }
      }
      @keyframes ion-drift-left {
        0% { transform: translate(0, 0); }
        50% { transform: translate(12px, 5px); }
        100% { transform: translate(3px, -3px); }
      }
      @keyframes ion-drift-right {
        0% { transform: translate(0, 0); }
        50% { transform: translate(-12px, -4px); }
        100% { transform: translate(-3px, 3px); }
      }
      @keyframes ion-gather-left {
        0%, 24% { transform: translate(0, 0); opacity: 1; }
        76% { transform: translate(40px, 55px); opacity: 1; }
        100% { transform: translate(42px, 70px); opacity: 0; }
      }
      @keyframes ion-gather-right {
        0%, 24% { transform: translate(0, 0); opacity: 1; }
        76% { transform: translate(-40px, 55px); opacity: 1; }
        100% { transform: translate(-42px, 70px); opacity: 0; }
      }
      @keyframes precipitate-settle {
        0%, 58% { transform: translateY(-44px); opacity: 0; }
        74% { opacity: 1; }
        100% { transform: translateY(0); opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        .electron-flow, .salt-ion-left, .salt-ion-right, .zinc-ion-release, .copper-ion-arrival,
        .cathode-deposit, .solution-drop, .ion-drift-left, .ion-drift-right, .ion-gather-left, .ion-gather-right,
        .precipitate-settle {
          animation-duration: 0.01ms !important;
          animation-delay: 0ms !important;
          animation-iteration-count: 1 !important;
        }
      }
    `}</style>
  );
}

function GalvanicExperimentScene({
  runToken,
  isRunning,
  model,
}: ExperimentSceneProps & { model: GalvanicSceneModel }) {
  const hasStarted = runToken > 0;
  const idPrefix = useId().replaceAll(":", "");
  const zincSolutionId = `${idPrefix}-zinc-solution`;
  const copperSolutionId = `${idPrefix}-copper-solution`;
  const zincPositions = [
    [101, 214], [119, 254], [208, 214], [227, 254], [103, 278],
    [212, 278], [108, 184], [222, 184], [211, 241],
  ];
  const copperPositions = zincPositions.map(([x, y]) => [620 - x, y]);
  const electronDuration = `${model.electronDurationMs}ms`;
  const bridgeDuration = `${Math.round(2200 - model.flowStrength * 900)}ms`;
  const anodeInset = hasStarted ? model.anodeWear * 5 : 0;
  const depositWidth = hasStarted ? 4 + model.cathodeDeposit * 8 : 0;
  const motionStyle = {
    "--experiment-play-state": isRunning ? "running" : "paused",
  } as React.CSSProperties;

  return (
    <g key={`galvanic-${runToken}`} className="experiment-motion" style={motionStyle}>
      <ExperimentMotionStyles />
      <defs>
        <linearGradient id={zincSolutionId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cffafe" stopOpacity=".62" />
          <stop offset="1" stopColor="#67e8f9" stopOpacity=".78" />
        </linearGradient>
        <linearGradient id={copperSolutionId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ede9fe" stopOpacity=".62" />
          <stop offset="1" stopColor="#c4b5fd" stopOpacity=".82" />
        </linearGradient>
      </defs>

      <path d="M160 140V61H258" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
      <path d="M362 61H460V140" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
      {hasStarted ? Array.from({ length: model.electronCount }, (_, index) => (
        <circle
          key={`electron-${index}`}
          className="electron-flow"
          cx="0"
          cy="0"
          r="6"
          fill="#7c3aed"
          stroke="#ffffff"
          strokeWidth="2"
          style={{ animationDelay: `${index * 0.2}s`, animationDuration: electronDuration }}
        />
      )) : null}

      <rect x="258" y="35" width="104" height="52" rx="14" fill="#ffffff" stroke="#94a3b8" strokeWidth="4" />
      <circle cx="279" cy="61" r="7" fill={hasStarted ? "#22c55e" : "#cbd5e1"} />
      <text x="320" y="58" fill="#334155" fontSize="11" fontWeight="900" textAnchor="middle">วงจรภายนอก</text>
      <text x="320" y="74" fill="#6d28d9" fontSize="10" fontWeight="900" textAnchor="middle">e⁻ : Zn → Cu</text>

      <path d="M214 158C226 104 394 104 406 158" stroke="#dcfce7" strokeWidth="24" strokeLinecap="round" />
      <path d="M214 158C226 104 394 104 406 158" stroke="#16a34a" strokeWidth="4" strokeDasharray="7 7" strokeLinecap="round" />
      <text x="310" y="111" fill="#166534" fontSize="11" fontWeight="900" textAnchor="middle">สะพานเกลือ</text>
      {hasStarted ? (
        <>
          <g className="salt-ion-left" style={{ animationDuration: bridgeDuration }}>
            <circle cx="281" cy="132" r="11" fill="#dbeafe" stroke="#2563eb" strokeWidth="2" />
            <text x="281" y="136" fill="#1d4ed8" fontSize="8" fontWeight="900" textAnchor="middle">K⁺</text>
          </g>
          <g className="salt-ion-right" style={{ animationDuration: bridgeDuration }}>
            <circle cx="339" cy="132" r="12" fill="#ffedd5" stroke="#ea580c" strokeWidth="2" />
            <text x="339" y="136" fill="#c2410c" fontSize="7" fontWeight="900" textAnchor="middle">NO₃⁻</text>
          </g>
        </>
      ) : null}

      <path d="M53 150V280C53 291 62 300 73 300H247C258 300 267 291 267 280V150" fill="#f8fafc" stroke="#0891b2" strokeWidth="6" strokeLinejoin="round" />
      <path d="M353 150V280C353 291 362 300 373 300H547C558 300 567 291 567 280V150" fill="#faf5ff" stroke="#7c3aed" strokeWidth="6" strokeLinejoin="round" />
      <path d="M62 197H258V278C258 285 252 291 245 291H75C68 291 62 285 62 278Z" fill={`url(#${zincSolutionId})`} />
      <path d="M362 197H558V278C558 285 552 291 545 291H375C368 291 362 285 362 278Z" fill={`url(#${copperSolutionId})`} />

      {zincPositions.slice(0, model.zincIonCount).map(([x, y], index) => (
        <g key={`zinc-${index}`} className={hasStarted && index < 2 ? "zinc-ion-release" : undefined}>
          <circle cx={x} cy={y} r="12" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <text x={x} y={y + 3} fill="#475569" fontSize="7" fontWeight="900" textAnchor="middle">Zn²⁺</text>
        </g>
      ))}
      {copperPositions.slice(0, model.copperIonCount).map(([x, y], index) => (
        <g key={`copper-${index}`} className={hasStarted && index < 2 ? "copper-ion-arrival" : undefined}>
          <circle cx={x} cy={y} r="12" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
          <text x={x} y={y + 3} fill="#6d28d9" fontSize="7" fontWeight="900" textAnchor="middle">Cu²⁺</text>
        </g>
      ))}

      <rect x={145 + anodeInset} y="132" width={30 - anodeInset * 2} height="159" rx="6" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
      <rect x="445" y="132" width="30" height="159" rx="6" fill="#d97706" stroke="#92400e" strokeWidth="3" />
      {depositWidth > 0 ? <rect className="cathode-deposit" x={445 - depositWidth / 2} y="175" width={30 + depositWidth} height="116" rx="7" fill="#fbbf24" fillOpacity=".9" /> : null}

      <text x="160" y="320" fill="#334155" fontSize="13" fontWeight="900" textAnchor="middle">Zn · แอโนด · ให้อิเล็กตรอน</text>
      <text x="460" y="320" fill="#92400e" fontSize="13" fontWeight="900" textAnchor="middle">Cu · แคโทด · รับอิเล็กตรอน</text>
    </g>
  );
}

function SolubilityExperimentScene({
  runToken,
  isRunning,
  model,
}: ExperimentSceneProps & { model: SolubilitySceneModel }) {
  const hasStarted = runToken > 0;
  const isPrecipitating = hasStarted && model.state === "precipitating";
  const statusText = !hasStarted
    ? "พร้อมผสมสารละลาย"
    : model.state === "precipitating"
      ? "ไอออนส่วนเกินรวมตัวเป็นของแข็ง"
      : model.state === "near-saturation"
        ? "ไอออนเริ่มอยู่ใกล้สมดุลการละลาย"
        : "ไอออนยังกระจายและละลายอยู่";
  const mixingDuration = `${Math.round(2300 - model.mixingStrength * 900)}ms`;
  const motionStyle = {
    "--experiment-play-state": isRunning ? "running" : "paused",
  } as React.CSSProperties;

  return (
    <g key={`solubility-${runToken}`} className="experiment-motion" style={motionStyle}>
      <ExperimentMotionStyles />
      <path d="M276 27H344V88L329 111H291L276 88Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="5" strokeLinejoin="round" />
      <path d="M290 111H330L322 139H298Z" fill="#bae6fd" stroke="#0284c7" strokeWidth="4" strokeLinejoin="round" />
      <rect x="285" y="43" width="50" height="32" rx="12" fill="#ffffff" fillOpacity=".72" />
      <text x="310" y="63" fill="#0369a1" fontSize="10" fontWeight="900" textAnchor="middle">สารละลาย X⁻</text>

      <path d="M151 124V278C151 292 162 303 176 303H444C458 303 469 292 469 278V124" fill="#f8fafc" stroke="#0891b2" strokeWidth="7" strokeLinejoin="round" />
      <path d="M160 175H460V277C460 286 453 294 444 294H176C167 294 160 286 160 277Z" fill="#a5f3fc" fillOpacity=".42" />
      <path d="M151 124H469" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
      <path d="M172 181C215 173 258 187 306 178C355 169 404 184 448 176" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" opacity=".72" />

      <path
        className={hasStarted ? "solution-drop" : undefined}
        d="M310 133C299 147 295 155 295 164C295 173 302 180 310 180C318 180 325 173 325 164C325 155 321 147 310 133Z"
        fill="#0284c7"
        opacity={hasStarted ? 1 : 0.42}
        style={hasStarted ? { animationDuration: mixingDuration } : undefined}
      />

      {Array.from({ length: model.dissolvedIonCount }, (_, index) => {
        const x = 205 + (index % 3) * 102;
        const y = 177 + Math.floor(index / 3) * 48;
        return (
          <g
            key={`metal-ion-${index}`}
            className={hasStarted ? (isPrecipitating && index < model.precipitateCount ? "ion-gather-left" : "ion-drift-left") : undefined}
            style={hasStarted ? { animationDelay: `${index * 0.08}s`, animationDuration: mixingDuration } : undefined}
          >
            <circle cx={x} cy={y} r="12" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
            <text x={x} y={y + 3} fill="#6d28d9" fontSize="8" fontWeight="900" textAnchor="middle">M⁺</text>
          </g>
        );
      })}
      {Array.from({ length: model.dissolvedIonCount }, (_, index) => {
        const x = 254 + (index % 3) * 84;
        const y = 199 + Math.floor(index / 3) * 45;
        return (
          <g
            key={`anion-${index}`}
            className={hasStarted ? (isPrecipitating && index < model.precipitateCount ? "ion-gather-right" : "ion-drift-right") : undefined}
            style={hasStarted ? { animationDelay: `${index * 0.08}s`, animationDuration: mixingDuration } : undefined}
          >
            <circle cx={x} cy={y} r="12" fill="#cffafe" stroke="#0891b2" strokeWidth="2" />
            <text x={x} y={y + 3} fill="#0e7490" fontSize="8" fontWeight="900" textAnchor="middle">X⁻</text>
          </g>
        );
      })}
      {Array.from({ length: model.commonIonCount }, (_, index) => {
        const x = 202 + (index % 4) * 72;
        const y = 151 + Math.floor(index / 4) * 31;
        return (
          <g key={`common-ion-${index}`} opacity=".9">
            <circle cx={x} cy={y} r="9" fill="#ecfeff" stroke="#0284c7" strokeWidth="2" />
            <text x={x} y={y + 3} fill="#0369a1" fontSize="7" fontWeight="900" textAnchor="middle">X⁻</text>
          </g>
        );
      })}

      {isPrecipitating ? Array.from({ length: model.precipitateCount }, (_, index) => {
        const x = 237 + (index % 4) * 48;
        const y = 277 - Math.floor(index / 4) * 22;
        return (
          <g key={`solid-${index}`} className="precipitate-settle" style={{ animationDelay: `${index * 0.1}s` }}>
            <rect x={x - 12} y={y - 9} width="24" height="18" rx="5" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
            <circle cx={x - 5} cy={y} r="5" fill="#8b5cf6" />
            <circle cx={x + 5} cy={y} r="5" fill="#06b6d4" />
          </g>
        );
      }) : null}

      <rect
        x="382"
        y="37"
        width="204"
        height="40"
        rx="20"
        fill={isPrecipitating ? "#fff7ed" : "#ecfeff"}
        stroke={isPrecipitating ? "#fb923c" : "#67e8f9"}
        strokeWidth="2"
      />
      <text x="484" y="62" fill={isPrecipitating ? "#7c2d12" : "#0e7490"} fontSize="11" fontWeight="900" textAnchor="middle">
        {statusText}
      </text>
    </g>
  );
}

function ChemistryScene({
  labId,
  result,
  runToken,
  isRunning,
  primary,
  secondary,
}: {
  labId: ChemistryConceptLabId;
  result: ChemistryResult;
  runToken: number;
  isRunning: boolean;
  primary: number;
  secondary: number;
}) {
  const isGalvanic = labId === "galvanic-cell";
  const isKinetics = labId === "chemical-kinetics";
  const isKsp = labId === "solubility-product";
  const isAvogadro = labId === "avogadros-law";
  const isElectrolysis = labId === "electrolysis-lab";
  const usesExperimentAnimation = isGalvanic || isKinetics || isKsp;
  const accent = isGalvanic || isElectrolysis ? "#7c3aed" : isKinetics ? "#f97316" : isKsp ? "#06b6d4" : isAvogadro ? "#2563eb" : "#0891b2";
  const idPrefix = useId().replaceAll(":", "");
  const workbenchId = `${idPrefix}-workbench`;
  const shadowId = `${idPrefix}-apparatus-shadow`;
  const titleId = `${idPrefix}-title`;
  const descriptionId = `${idPrefix}-description`;
  const sceneTitle = isGalvanic
    ? "เซลล์กัลวานิก"
    : isKinetics
      ? "การชนของอนุภาคในปฏิกิริยาเคมี"
      : isKsp
        ? "การเกิดตะกอนในสารละลาย"
        : isAvogadro
          ? "กระบอกเก็บแก๊ส"
          : isElectrolysis
            ? "เซลล์ชุบโลหะ"
            : "อ่างควบคุมอุณหภูมิ";
  const sceneDescription = isGalvanic
    ? "ครึ่งเซลล์สองฝั่งเชื่อมด้วยสะพานเกลือ เมื่อเริ่มทดลองอิเล็กตรอนและไอออนจะเคลื่อนที่"
    : isKinetics
      ? "อนุภาคสารตั้งต้นเคลื่อนเข้าชนกัน แล้วจับคู่เป็นผลิตภัณฑ์"
      : isKsp
        ? "สารจากหลอดหยดลงในบีกเกอร์ ไอออนรวมตัวและตกเป็นของแข็งที่ก้นภาชนะ"
        : "อุปกรณ์ทดลองเคมีที่ตอบสนองตามตัวแปรของผู้เรียน";
  const galvanicModel = useMemo(() => buildGalvanicSceneModel(primary, secondary), [primary, secondary]);
  const reactionModel = useMemo(() => buildReactionRateSceneModel(primary, secondary), [primary, secondary]);
  const solubilityModel = useMemo(() => buildSolubilitySceneModel(primary, secondary), [primary, secondary]);

  if (isKinetics) {
    return (
      <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 via-white to-slate-50 p-4 sm:h-full sm:min-h-0">
        <ReactionRateParticleCanvas model={reactionModel} runToken={runToken} isRunning={isRunning} />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-white to-blue-50/50 p-4 sm:h-full sm:min-h-0">
      <svg className="h-[320px] w-full max-w-[680px] sm:h-full sm:min-h-0" viewBox="0 0 620 340" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
        <title id={titleId}>{sceneTitle}</title>
        <desc id={descriptionId}>{sceneDescription}</desc>
        <defs>
          <linearGradient id={workbenchId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#e2e8f0" />
          </linearGradient>
          <filter id={shadowId} x="-20%" y="-30%" width="140%" height="180%">
            <feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="#334155" floodOpacity="0.16" />
          </filter>
        </defs>
        {usesExperimentAnimation ? null : (
          <>
            <rect x="24" y="40" width="572" height="252" rx="30" fill="#ffffff" opacity="0.62" />
            <circle cx="310" cy="156" r="126" fill={accent} opacity="0.065" />
          </>
        )}
        <rect x="38" y={usesExperimentAnimation ? 286 : 247} width="540" height={usesExperimentAnimation ? 18 : 34} rx="9" fill={`url(#${workbenchId})`} />

        {isGalvanic ? (
            <GalvanicExperimentScene runToken={runToken} isRunning={isRunning} model={galvanicModel} />
          ) : isKsp ? (
            <SolubilityExperimentScene runToken={runToken} isRunning={isRunning} model={solubilityModel} />
        ) : isAvogadro ? (
          <g>
            <g filter={`url(#${shadowId})`}>
              <rect x="116" y="102" width="360" height="142" rx="34" fill="#eff6ff" stroke="#60a5fa" strokeWidth="7" />
              <rect x="126" y="112" width="254" height="122" rx="27" fill="#bfdbfe" opacity="0.58" />
              <rect x="382" y="110" width="24" height="126" rx="9" fill="#334155" />
              <path d="M406 173H526" stroke="#475569" strokeWidth="12" strokeLinecap="round" />
              <path d="M525 138V208" stroke="#475569" strokeWidth="10" strokeLinecap="round" />
              {[152, 188, 224, 260, 296, 332, 170, 212, 252, 314].map((x, index) => (
                <circle key={x} cx={x} cy={139 + (index % 3) * 35} r="8" fill={index % 2 ? "#2563eb" : "#06b6d4"} opacity="0.86" />
              ))}
            </g>
            <g transform="translate(54 116)">
              <rect width="48" height="115" rx="18" fill="#ffffff" stroke="#bfdbfe" strokeWidth="3" />
              <path d="M31 18V98M20 31H31M20 55H31M20 79H31" stroke="#2563eb" strokeWidth="3" />
              <text x="24" y="108" fill="#1d4ed8" fontSize="8" fontWeight="900" textAnchor="middle">V</text>
            </g>
            <g transform="translate(170 56)">
              <rect width="280" height="35" rx="17.5" fill="#dbeafe" stroke="#93c5fd" strokeWidth="2" />
              <text x="140" y="22" fill="#1d4ed8" fontSize="12" fontWeight="900" textAnchor="middle">อุณหภูมิและความดันคงที่ · V ∝ n</text>
            </g>
            <text x="296" y="282" fill="#2563eb" fontSize="17" fontWeight="900" textAnchor="middle">{result.metrics[2].value}</text>
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
  const config = labConfigs[labId];
  const [primary, setPrimary] = useState(config.primary.defaultValue);
  const [secondary, setSecondary] = useState(config.secondary.defaultValue);
  const [playback, setPlayback] = useState<ExperimentPlaybackState>(createReadyExperimentPlayback);
  const { isRunning, runToken } = playback;
  const usesExperimentAnimation = labId === "galvanic-cell" || labId === "chemical-kinetics" || labId === "solubility-product";

  const result = useMemo(() => calculateLab(labId, primary, secondary), [labId, primary, secondary]);

  const handlePrimaryChange = (value: number) => {
    setPrimary(value);
    setPlayback(resetExperimentPlayback());
  };

  const handleSecondaryChange = (value: number) => {
    setSecondary(value);
    setPlayback(resetExperimentPlayback());
  };

  const handleRun = () => {
    if (usesExperimentAnimation) {
      setPlayback(toggleExperimentPlayback);
      return;
    }
    setPlayback((state) => ({ ...state, runToken: state.runToken + 1 }));
  };

  const handleReset = () => {
    setPrimary(config.primary.defaultValue);
    setSecondary(config.secondary.defaultValue);
    setPlayback(resetExperimentPlayback());
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
  };

  const compactControls = (
    <>
      <CompactRangeControl label={config.primary.label} symbol="A" value={primary} min={config.primary.min} max={config.primary.max} step={config.primary.step} unit={config.primary.unit} tone={config.accent === "rose" ? "pink" : config.accent} onChange={handlePrimaryChange} />
      <CompactRangeControl label={config.secondary.label} symbol="B" value={secondary} min={config.secondary.min} max={config.secondary.max} step={config.secondary.step} unit={config.secondary.unit} tone={config.accent === "rose" ? "pink" : config.accent} onChange={handleSecondaryChange} />
    </>
  );

  return (
    <SharedSimulationShell
      accent={config.accent}
      labId={labId}
      category="Chemistry"
      title={config.title}
      subtitle={config.subtitle}
      statusLabel={usesExperimentAnimation
        ? runToken === 0
          ? "พร้อมทดลอง"
          : isRunning
            ? "กำลังทดลอง"
            : "หยุดชั่วคราว"
        : runToken > 0
          ? "คำนวณผลแล้ว"
          : "พร้อมจำลอง"}
      icon={config.icon}
      sceneTitle={config.sceneTitle}
      scene={<ChemistryScene labId={labId} result={result} runToken={runToken} isRunning={isRunning} primary={primary} secondary={secondary} />}
      controlsTitle={config.controlsTitle}
      compactControls={compactControls}
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
      onRun={handleRun}
      runLabel={usesExperimentAnimation && isRunning ? "หยุดชั่วคราว" : usesExperimentAnimation ? "เริ่มทดลอง" : "คำนวณผล"}
      runActive={usesExperimentAnimation && isRunning}
      onReset={handleReset}
      onSave={handleSave}
    />
  );
}
