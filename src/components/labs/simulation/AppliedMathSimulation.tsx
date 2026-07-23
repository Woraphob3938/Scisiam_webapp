"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowRightLeft,
  Calculator,
  Clipboard,
  ClipboardList,
  Download,
  Gauge,
  LineChart,
  RotateCcw,
  Ruler,
  Save,
  Sliders,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import ManualNumberInput, { type ManualNumberInputTone } from "@/components/labs/simulation/ManualNumberInput";
import SharedSimulationShell, { type SimulationMetric } from "@/components/labs/simulation/SharedSimulationShell";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";

type AppliedMathLabId =
  | "geometry-measurement"
  | "exponential-growth-decay"
  | "data-sampling-error"
  | "quadratic-projectiles"
  | "logarithm-scales"
  | "unit-conversion"
  | "matrix-transformations"
  | "sequences-series"
  | "inequalities-feasible-regions"
  | "transformations-symmetry"
  | "angles-circles"
  | "combinatorics-counting";
type VarKey = "a" | "b" | "c";
type AccentTone = "blue" | "cyan" | "emerald" | "orange" | "rose" | "violet";

interface AppliedVars {
  a: number;
  b: number;
  c: number;
}

interface ControlSpec {
  key: VarKey;
  label: string;
  ariaLabel: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  tone: ManualNumberInputTone;
  icon: LucideIcon;
  helper: string;
  integer?: boolean;
}

interface AppliedMathConfig {
  title: string;
  subtitle: string;
  sceneTitle: string;
  controlsTitle: string;
  icon: LucideIcon;
  accent: AccentTone;
  localStorageKey: string;
  defaults: AppliedVars;
  controls: ControlSpec[];
  theory: string;
  goals: string[];
  tips: string[];
}

interface GraphPoint {
  x: number;
  y: number;
  label: string;
}

interface DerivedResult {
  mainLabel: string;
  mainValue: number;
  mainUnit: string;
  secondaryLabel: string;
  secondaryValue: number;
  secondaryUnit: string;
  tertiaryLabel: string;
  tertiaryValue: number;
  tertiaryUnit: string;
  progressLabel: string;
  progressValue: string;
  progressPercent: number;
  summary: string;
  prediction: string;
  formula: string;
  graphTitle: string;
  xLabel: string;
  yLabel: string;
  graphPoints: GraphPoint[];
  stageNote: string;
}

interface MathRun {
  index: number;
  main: string;
  secondary: string;
  tertiary: string;
  summary: string;
}

const toneAccentClass: Record<ManualNumberInputTone, string> = {
  violet: "accent-violet-600",
  cyan: "accent-cyan-600",
  amber: "accent-amber-500",
  orange: "accent-orange-500",
  blue: "accent-blue-600",
  emerald: "accent-emerald-600",
  pink: "accent-pink-600",
};

const toneTextClass: Record<ManualNumberInputTone, string> = {
  violet: "text-violet-600",
  cyan: "text-cyan-600",
  amber: "text-amber-600",
  orange: "text-orange-600",
  blue: "text-blue-600",
  emerald: "text-emerald-600",
  pink: "text-pink-600",
};

const configs: Record<AppliedMathLabId, AppliedMathConfig> = {
  "geometry-measurement": {
    title: "Geometry Measurement Lab",
    subtitle:
      "ปรับขนาดรูปทรง วัดระยะ มุม พื้นที่ และเส้นรอบรูปบนกระดาน geometry เพื่อเชื่อมโยงสูตรกับภาพจริง",
    sceneTitle: "Precision measurement board",
    controlsTitle: "แผงควบคุมรูปทรง",
    icon: Ruler,
    accent: "violet",
    localStorageKey: "scisiam_saved_geometry_measurement_experiment",
    defaults: { a: 8, b: 6, c: 37 },
    controls: [
      {
        key: "a",
        label: "base",
        ariaLabel: "Enter triangle base",
        min: 3,
        max: 14,
        step: 0.5,
        unit: "cm",
        tone: "violet",
        icon: Ruler,
        helper: "ความยาวฐานของรูปสามเหลี่ยม",
      },
      {
        key: "b",
        label: "height",
        ariaLabel: "Enter triangle height",
        min: 2,
        max: 10,
        step: 0.5,
        unit: "cm",
        tone: "cyan",
        icon: Sliders,
        helper: "ความสูงตั้งฉากจากฐาน",
      },
      {
        key: "c",
        label: "angle",
        ariaLabel: "Enter measured angle",
        min: 20,
        max: 75,
        step: 1,
        unit: "deg",
        tone: "amber",
        icon: Gauge,
        helper: "มุมที่อ่านจาก protractor",
        integer: true,
      },
    ],
    theory: "พื้นที่สามเหลี่ยมคำนวณจาก A = 1/2bh และเส้นรอบรูปได้จากผลรวมด้านทั้งสาม",
    goals: [
      "เชื่อมโยงการวัดฐานและความสูงกับพื้นที่จริง",
      "อ่านมุมและระยะจากเครื่องมือวัดบน SVG stage",
      "เปรียบเทียบผลของการเปลี่ยน scale ต่อ perimeter และ area",
    ],
    tips: [
      "เพิ่ม height แล้วดูพื้นที่เพิ่มแบบเส้นตรงเมื่อ base คงที่",
      "ใช้ angle เป็นตัวตรวจว่ารูปที่วัดไม่จำเป็นต้องเป็นสามเหลี่ยมมุมฉากเสมอ",
    ],
  },
  "exponential-growth-decay": {
    title: "Exponential Growth & Decay",
    subtitle:
      "สำรวจแบบจำลอง N(t) = N0e^(rt) ว่าค่าเริ่มต้น อัตราเติบโต/สลาย และเวลาทำให้กราฟโค้งเร็วแค่ไหน",
    sceneTitle: "Exponential process chamber",
    controlsTitle: "แผงควบคุม exponential model",
    icon: TrendingUp,
    accent: "emerald",
    localStorageKey: "scisiam_saved_exponential_growth_decay_experiment",
    defaults: { a: 120, b: 0.18, c: 8 },
    controls: [
      {
        key: "a",
        label: "N0",
        ariaLabel: "Enter initial value",
        min: 20,
        max: 500,
        step: 10,
        unit: "units",
        tone: "emerald",
        icon: Activity,
        helper: "ค่าเริ่มต้นก่อนเกิด growth หรือ decay",
      },
      {
        key: "b",
        label: "rate r",
        ariaLabel: "Enter exponential rate",
        min: -0.35,
        max: 0.35,
        step: 0.01,
        unit: "/t",
        tone: "cyan",
        icon: Sliders,
        helper: "ค่าบวกคือ growth ค่าลบคือ decay",
      },
      {
        key: "c",
        label: "time",
        ariaLabel: "Enter elapsed time",
        min: 1,
        max: 18,
        step: 0.5,
        unit: "t",
        tone: "violet",
        icon: Gauge,
        helper: "ช่วงเวลาที่ต้องการพยากรณ์ค่า",
      },
    ],
    theory: "แบบจำลอง exponential ใช้ N(t) = N0e^(rt) โดย r > 0 คือ growth และ r < 0 คือ decay",
    goals: [
      "อ่านผลกระทบของ rate ต่อความชันของกราฟ",
      "เปรียบเทียบ growth และ decay จากเครื่องหมายของ r",
      "ประมาณ doubling time หรือ half-life จากข้อมูลบนกราฟ",
    ],
    tips: [
      "ลองปรับ r เข้าใกล้ 0 เพื่อดูว่ากราฟกลับมาเกือบเป็นเส้นตรง",
      "ใช้ค่า time สูงเพื่อเห็นความต่างระหว่าง growth กับ decay ชัดขึ้น",
    ],
  },
  "data-sampling-error": {
    title: "Sampling & Measurement Error",
    subtitle:
      "จำลองการสุ่มตัวอย่างจากประชากร ดู standard error และช่วงความเชื่อมั่นเมื่อ sample size หรือความแปรปรวนเปลี่ยนไป",
    sceneTitle: "Sampling error analyzer",
    controlsTitle: "แผงควบคุม sampling",
    icon: Activity,
    accent: "cyan",
    localStorageKey: "scisiam_saved_data_sampling_error_experiment",
    defaults: { a: 72, b: 36, c: 12 },
    controls: [
      {
        key: "a",
        label: "mean",
        ariaLabel: "Enter population mean",
        min: 40,
        max: 100,
        step: 1,
        unit: "",
        tone: "cyan",
        icon: Target,
        helper: "ค่าเฉลี่ยประชากรที่ต้องการประมาณ",
      },
      {
        key: "b",
        label: "sample n",
        ariaLabel: "Enter sample size",
        min: 5,
        max: 120,
        step: 1,
        unit: "",
        tone: "violet",
        icon: Sliders,
        helper: "จำนวนตัวอย่างที่สุ่มมาใช้คำนวณ",
        integer: true,
      },
      {
        key: "c",
        label: "sigma",
        ariaLabel: "Enter measurement variability",
        min: 2,
        max: 30,
        step: 0.5,
        unit: "",
        tone: "orange",
        icon: Gauge,
        helper: "ความแปรปรวนจากการวัดหรือประชากร",
      },
    ],
    theory: "Standard error ลดลงตาม SE = sigma / sqrt(n) ดังนั้น sample size ที่มากขึ้นช่วยลดความไม่แน่นอน",
    goals: [
      "เห็นความสัมพันธ์ระหว่าง sample size กับ standard error",
      "อ่านช่วงความเชื่อมั่น 95% จาก error bar",
      "แยกความหมายของ variability กับ measurement error",
    ],
    tips: [
      "เพิ่ม sample n แล้วสังเกต error bar แคบลง",
      "เพิ่ม sigma เพื่อเห็นว่าการวัดที่ผันผวนทำให้ผลประมาณไม่แน่นอนขึ้น",
    ],
  },
  "quadratic-projectiles": {
    title: "Quadratic Functions & Projectiles",
    subtitle:
      "ปรับความเร็ว มุมยิง และแรงโน้มถ่วงเพื่อดูเส้นทางพาราโบลา จุดสูงสุด ระยะทาง และเวลาลอยตัว",
    sceneTitle: "Projectile parabola range",
    controlsTitle: "แผงควบคุม projectile",
    icon: Target,
    accent: "orange",
    localStorageKey: "scisiam_saved_quadratic_projectiles_experiment",
    defaults: { a: 32, b: 42, c: 9.8 },
    controls: [
      {
        key: "a",
        label: "velocity",
        ariaLabel: "Enter launch velocity",
        min: 8,
        max: 60,
        step: 1,
        unit: "m/s",
        tone: "orange",
        icon: Gauge,
        helper: "ความเร็วต้นของวัตถุ",
      },
      {
        key: "b",
        label: "angle",
        ariaLabel: "Enter launch angle",
        min: 10,
        max: 80,
        step: 1,
        unit: "deg",
        tone: "violet",
        icon: Sliders,
        helper: "มุมยิงเทียบกับพื้น",
        integer: true,
      },
      {
        key: "c",
        label: "gravity",
        ariaLabel: "Enter gravity",
        min: 1.6,
        max: 14,
        step: 0.1,
        unit: "m/s^2",
        tone: "cyan",
        icon: Activity,
        helper: "ค่าความเร่งโน้มถ่วงของสภาพแวดล้อม",
      },
    ],
    theory: "การเคลื่อนที่แนวตั้งเป็นฟังก์ชันกำลังสอง y = xtan(theta) - gx^2 / (2v^2cos^2(theta))",
    goals: [
      "อ่านรูปพาราโบลาจากค่าพารามิเตอร์จริง",
      "เปรียบเทียบมุมยิงกับ range และ max height",
      "เชื่อมโยงสมการ quadratic กับ motion graph",
    ],
    tips: [
      "ลองมุมใกล้ 45 องศาเพื่อหา range สูงในแรงโน้มถ่วงโลก",
      "ลด gravity แล้วสังเกตว่า trajectory แบนและไกลขึ้น",
    ],
  },
  "logarithm-scales": {
    title: "Logarithms & Scientific Scales",
    subtitle:
      "สำรวจ exponent, base และ scientific notation เพื่อเข้าใจ log scale ที่ใช้กับค่าใหญ่มากหรือเล็กมาก",
    sceneTitle: "Logarithmic scale instrument",
    controlsTitle: "แผงควบคุม log scale",
    icon: Calculator,
    accent: "rose",
    localStorageKey: "scisiam_saved_logarithm_scales_experiment",
    defaults: { a: 2.5, b: 10, c: 4 },
    controls: [
      {
        key: "a",
        label: "coefficient",
        ariaLabel: "Enter scientific coefficient",
        min: 1,
        max: 9.9,
        step: 0.1,
        unit: "",
        tone: "pink",
        icon: Sliders,
        helper: "ตัวคูณด้านหน้ารูปแบบ a x base^n",
      },
      {
        key: "b",
        label: "base",
        ariaLabel: "Enter logarithm base",
        min: 2,
        max: 12,
        step: 1,
        unit: "",
        tone: "violet",
        icon: Calculator,
        helper: "ฐานของ exponential/logarithm",
        integer: true,
      },
      {
        key: "c",
        label: "exponent",
        ariaLabel: "Enter exponent",
        min: 0,
        max: 8,
        step: 0.5,
        unit: "",
        tone: "orange",
        icon: Gauge,
        helper: "จำนวน order of magnitude",
      },
    ],
    theory: "log_b(x) ตอบว่าต้องยก base b กี่ครั้งจึงได้ x และช่วยบีบอัดค่าที่ต่างกันหลายเท่าตัว",
    goals: [
      "อ่าน scientific notation จาก coefficient และ exponent",
      "เทียบ linear value กับตำแหน่งบน log scale",
      "เข้าใจ order of magnitude ในสเกลวิทยาศาสตร์",
    ],
    tips: [
      "ปรับ exponent ทีละ 1 แล้วสังเกตค่าจริงเพิ่มแบบคูณ ไม่ใช่บวก",
      "เปลี่ยน base เพื่อดูว่าตำแหน่งบน log scale ตีความต่างกันอย่างไร",
    ],
  },
  "unit-conversion": {
    title: "Unit Conversion & Dimensional Analysis",
    subtitle:
      "ฝึกแปลงหน่วยด้วย conversion factor และตรวจมิติของคำตอบก่อนนำไปใช้ในโจทย์วิทยาศาสตร์",
    sceneTitle: "Dimensional analysis pipeline",
    controlsTitle: "แผงควบคุมการแปลงหน่วย",
    icon: ArrowRightLeft,
    accent: "blue",
    localStorageKey: "scisiam_saved_unit_conversion_experiment",
    defaults: { a: 12.5, b: 1, c: 3 },
    controls: [
      {
        key: "a",
        label: "input value",
        ariaLabel: "Enter input value",
        min: 0.1,
        max: 500,
        step: 0.1,
        unit: "",
        tone: "blue",
        icon: Calculator,
        helper: "ค่าตั้งต้นก่อนแปลงหน่วย",
      },
      {
        key: "b",
        label: "conversion",
        ariaLabel: "Choose conversion type",
        min: 0,
        max: 4,
        step: 1,
        unit: "",
        tone: "violet",
        icon: ArrowRightLeft,
        helper: "เลือกชนิด conversion factor",
        integer: true,
      },
      {
        key: "c",
        label: "sig figs",
        ariaLabel: "Enter significant figures",
        min: 2,
        max: 5,
        step: 1,
        unit: "",
        tone: "emerald",
        icon: Gauge,
        helper: "จำนวน significant figures ที่ใช้รายงานผล",
        integer: true,
      },
    ],
    theory: "Dimensional analysis ใช้การคูณด้วยอัตราส่วนที่มีค่าเท่ากับ 1 เพื่อให้หน่วยเดิมตัดกันและเหลือหน่วยเป้าหมาย",
    goals: [
      "ตั้ง conversion factor ให้หน่วยตัดกันถูกต้อง",
      "รายงานคำตอบพร้อมหน่วยและ significant figures",
      "เชื่อมโยงการแปลงหน่วยกับการตรวจมิติของสมการ",
    ],
    tips: [
      "ดูหน่วยบน factor card ว่าหน่วยเดิมอยู่ด้านล่างเสมอ",
      "เปลี่ยน conversion type แล้วสังเกต factor ที่ทำให้ขนาดตัวเลขต่างกันมาก",
    ],
  },
  "matrix-transformations": {
    title: "Matrix Transformations",
    subtitle: "ทดลองหมุน ย่อ-ขยาย และเฉือนรูปบนระนาบพิกัด พร้อมอ่านเมทริกซ์แปลงและ determinant แบบ real-time",
    sceneTitle: "Matrix transformation plane",
    controlsTitle: "แผงควบคุมเมทริกซ์",
    icon: Calculator,
    accent: "blue",
    localStorageKey: "scisiam_saved_matrix_transformations_experiment",
    defaults: { a: 30, b: 1.25, c: 0.35 },
    controls: [
      { key: "a", label: "rotation", ariaLabel: "Enter rotation angle", min: -180, max: 180, step: 5, unit: "deg", tone: "blue", icon: Gauge, helper: "มุมหมุนทวนเข็มนาฬิกา", integer: true },
      { key: "b", label: "scale", ariaLabel: "Enter scale factor", min: 0.5, max: 2, step: 0.05, unit: "x", tone: "violet", icon: Sliders, helper: "ตัวคูณขนาดของรูป" },
      { key: "c", label: "shear", ariaLabel: "Enter horizontal shear", min: -1, max: 1, step: 0.05, unit: "", tone: "cyan", icon: Activity, helper: "ค่าเฉือนตามแกน x" },
    ],
    theory: "พิกัดใหม่หาได้จาก x' = Ax โดย determinant ของ A บอกตัวคูณพื้นที่และทิศทางของการแปลง",
    goals: ["เชื่อมเมทริกซ์กับตำแหน่งจุดบนระนาบ", "อ่านผลของ rotation, scale และ shear", "ใช้ determinant อธิบายการเปลี่ยนพื้นที่"],
    tips: ["ตั้ง shear เป็น 0 เพื่อดูการหมุนและขยายล้วน", "ลอง scale ต่ำกว่า 1 แล้วสังเกตพื้นที่ลดลงเป็นกำลังสอง"],
  },
  "sequences-series": {
    title: "Sequences & Series Lab",
    subtitle: "สร้างลำดับเลขคณิตจากพจน์แรกและผลต่างร่วม แล้วเปรียบเทียบค่าพจน์ที่ n กับผลรวมสะสม",
    sceneTitle: "Sequence term analyzer",
    controlsTitle: "แผงควบคุมลำดับ",
    icon: LineChart,
    accent: "emerald",
    localStorageKey: "scisiam_saved_sequences_series_experiment",
    defaults: { a: 3, b: 2, c: 10 },
    controls: [
      { key: "a", label: "first term", ariaLabel: "Enter first term", min: -10, max: 20, step: 1, unit: "", tone: "emerald", icon: Target, helper: "พจน์เริ่มต้น a1", integer: true },
      { key: "b", label: "difference", ariaLabel: "Enter common difference", min: -6, max: 8, step: 1, unit: "", tone: "cyan", icon: Sliders, helper: "ผลต่างร่วม d", integer: true },
      { key: "c", label: "term n", ariaLabel: "Enter term index", min: 2, max: 20, step: 1, unit: "", tone: "violet", icon: Gauge, helper: "จำนวนพจน์ที่นำมาวิเคราะห์", integer: true },
    ],
    theory: "ลำดับเลขคณิตใช้ a_n = a_1 + (n-1)d และผลรวม S_n = n(a_1+a_n)/2",
    goals: ["อ่าน pattern ของลำดับจากกราฟพจน์", "คำนวณพจน์ที่ n และผลรวม", "เปรียบเทียบผลของ d บวก ลบ และศูนย์"],
    tips: ["ตั้ง d เป็นลบเพื่อดูลำดับลดลง", "เพิ่ม n แล้วสังเกตผลรวมสะสมเทียบกับค่าพจน์ล่าสุด"],
  },
  "inequalities-feasible-regions": {
    title: "Inequalities & Feasible Regions",
    subtitle: "ปรับขอบเขตอสมการเชิงเส้น สำรวจพื้นที่คำตอบ และวัด slack ของจุดทดสอบภายใน feasible region",
    sceneTitle: "Feasible region optimizer",
    controlsTitle: "แผงควบคุมข้อจำกัด",
    icon: Target,
    accent: "orange",
    localStorageKey: "scisiam_saved_inequalities_feasible_regions_experiment",
    defaults: { a: 8, b: 6, c: 3 },
    controls: [
      { key: "a", label: "x limit", ariaLabel: "Enter x intercept", min: 3, max: 12, step: 0.5, unit: "", tone: "orange", icon: Sliders, helper: "จุดตัดแกน x ของเส้นขอบ" },
      { key: "b", label: "y limit", ariaLabel: "Enter y intercept", min: 3, max: 12, step: 0.5, unit: "", tone: "violet", icon: Gauge, helper: "จุดตัดแกน y ของเส้นขอบ" },
      { key: "c", label: "probe x", ariaLabel: "Enter probe x coordinate", min: 0, max: 10, step: 0.5, unit: "", tone: "cyan", icon: Target, helper: "พิกัด x ของจุดทดสอบ" },
    ],
    theory: "พื้นที่คำตอบของ x/a + y/b <= 1 เมื่อ x,y >= 0 เป็นสามเหลี่ยมพื้นที่ ab/2",
    goals: ["แปลอสมการเป็นพื้นที่บนกราฟ", "ตรวจว่าจุดอยู่ใน feasible region หรือไม่", "อ่าน slack และผลของการเปลี่ยนข้อจำกัด"],
    tips: ["ขยาย x limit หรือ y limit เพื่อดูพื้นที่คำตอบเพิ่ม", "เลื่อน probe x ข้ามจุดตัดแกนเพื่อทดสอบจุดนอกขอบเขต"],
  },
  "transformations-symmetry": {
    title: "Transformations & Symmetry",
    subtitle: "เลื่อน หมุน และขยายรูปสมมาตร พร้อมเปรียบเทียบตำแหน่งเดิมกับภาพแปลงบนแกนสมมาตร",
    sceneTitle: "Symmetry transformation studio",
    controlsTitle: "แผงควบคุมการแปลงรูป",
    icon: Ruler,
    accent: "violet",
    localStorageKey: "scisiam_saved_transformations_symmetry_experiment",
    defaults: { a: 2, b: 45, c: 1.2 },
    controls: [
      { key: "a", label: "translate x", ariaLabel: "Enter horizontal translation", min: -5, max: 5, step: 0.5, unit: "", tone: "cyan", icon: ArrowRightLeft, helper: "ระยะเลื่อนตามแกน x" },
      { key: "b", label: "rotation", ariaLabel: "Enter shape rotation", min: -180, max: 180, step: 5, unit: "deg", tone: "violet", icon: Gauge, helper: "มุมหมุนรอบจุดศูนย์กลาง", integer: true },
      { key: "c", label: "scale", ariaLabel: "Enter shape scale", min: 0.5, max: 1.8, step: 0.05, unit: "x", tone: "emerald", icon: Sliders, helper: "อัตราขยายของภาพแปลง" },
    ],
    theory: "Rigid transformations รักษาระยะและมุม ส่วน dilation เปลี่ยนความยาวตาม k และพื้นที่ตาม k^2",
    goals: ["แยก translation, rotation และ dilation", "ระบุแกนสมมาตรของรูป", "เปรียบเทียบขนาดและทิศทางก่อนกับหลังแปลง"],
    tips: ["ตั้ง scale เป็น 1 เพื่อทดสอบ rigid transformation", "หมุนทีละ 90 องศาเพื่อสังเกต rotational symmetry"],
  },
  "angles-circles": {
    title: "Angles & Circles Lab",
    subtitle: "ปรับรัศมีและมุมที่จุดศูนย์กลางเพื่อวัดเส้นรอบวง ความยาวส่วนโค้ง และพื้นที่ภาคของวงกลม",
    sceneTitle: "Circle angle instrument",
    controlsTitle: "แผงควบคุมวงกลม",
    icon: Ruler,
    accent: "rose",
    localStorageKey: "scisiam_saved_angles_circles_experiment",
    defaults: { a: 6, b: 120, c: 20 },
    controls: [
      { key: "a", label: "radius", ariaLabel: "Enter circle radius", min: 2, max: 10, step: 0.5, unit: "cm", tone: "pink", icon: Ruler, helper: "รัศมีของวงกลม" },
      { key: "b", label: "central angle", ariaLabel: "Enter central angle", min: 15, max: 345, step: 5, unit: "deg", tone: "violet", icon: Gauge, helper: "มุมที่จุดศูนย์กลาง", integer: true },
      { key: "c", label: "start angle", ariaLabel: "Enter starting angle", min: 0, max: 345, step: 5, unit: "deg", tone: "cyan", icon: Sliders, helper: "ตำแหน่งเริ่มต้นของส่วนโค้ง", integer: true },
    ],
    theory: "C = 2pi r, ความยาวส่วนโค้ง s = r theta และพื้นที่ภาควงกลม A = theta r^2 / 2 เมื่อ theta เป็นเรเดียน",
    goals: ["เชื่อมมุมองศากับเรเดียน", "วัด arc length และ sector area", "เห็นผลของรัศมีต่อวงกลมและส่วนโค้ง"],
    tips: ["ตั้งมุม 180 องศาเพื่อดูครึ่งวงกลม", "เพิ่มรัศมีเป็นสองเท่าแล้วเปรียบเทียบความยาวกับพื้นที่"],
  },
  "combinatorics-counting": {
    title: "Combinatorics & Counting",
    subtitle: "จัดกลุ่มวัตถุและเปรียบเทียบ permutation กับ combination เมื่อจำนวนตัวเลือกและจำนวนช่องเปลี่ยนไป",
    sceneTitle: "Counting arrangement engine",
    controlsTitle: "แผงควบคุมการนับ",
    icon: Calculator,
    accent: "cyan",
    localStorageKey: "scisiam_saved_combinatorics_counting_experiment",
    defaults: { a: 7, b: 3, c: 0 },
    controls: [
      { key: "a", label: "items n", ariaLabel: "Enter total item count", min: 3, max: 12, step: 1, unit: "", tone: "cyan", icon: Activity, helper: "จำนวนตัวเลือกทั้งหมด", integer: true },
      { key: "b", label: "choose r", ariaLabel: "Enter selected item count", min: 1, max: 8, step: 1, unit: "", tone: "violet", icon: Sliders, helper: "จำนวนตำแหน่งหรือสมาชิกที่เลือก", integer: true },
      { key: "c", label: "order mode", ariaLabel: "Choose order mode", min: 0, max: 1, step: 1, unit: "", tone: "orange", icon: ArrowRightLeft, helper: "0 = combination, 1 = permutation", integer: true },
    ],
    theory: "Combination ใช้ nCr = n!/(r!(n-r)!) ส่วน permutation ใช้ nPr = n!/(n-r)! เมื่อสนใจลำดับ",
    goals: ["แยกโจทย์ที่สนใจและไม่สนใจลำดับ", "คำนวณ nCr และ nPr", "มองเห็น sample space จากการจัดช่อง"],
    tips: ["สลับ order mode เพื่อเปรียบเทียบผลต่างทันที", "ลอง r ใกล้ n/2 เพื่อหาค่า combination ที่มีจำนวนมาก"],
  },
};

const unitConversions = [
  { from: "m", to: "cm", factor: 100, factorText: "100 cm / 1 m", dimension: "length" },
  { from: "km/h", to: "m/s", factor: 5 / 18, factorText: "1000 m / 3600 s", dimension: "speed" },
  { from: "g", to: "kg", factor: 0.001, factorText: "1 kg / 1000 g", dimension: "mass" },
  { from: "L", to: "cm^3", factor: 1000, factorText: "1000 cm^3 / 1 L", dimension: "volume" },
  { from: "m^2", to: "cm^2", factor: 10000, factorText: "10000 cm^2 / 1 m^2", dimension: "area" },
] as const;

function factorial(value: number) {
  let result = 1;
  for (let current = 2; current <= value; current += 1) result *= current;
  return result;
}

function formatNumber(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "0";
  const absolute = Math.abs(value);
  if ((absolute >= 100000 || (absolute > 0 && absolute < 0.01)) && digits <= 3) {
    return value.toExponential(digits);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: absolute > 0 && absolute < 10 ? Math.min(1, digits) : 0,
  }).format(value);
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function svgValue(value: number, digits = 3) {
  if (!Number.isFinite(value)) return "0";
  return value.toFixed(digits).replace(/\.?0+$/, "");
}

function roundToStep(value: number, spec: ControlSpec) {
  const next = spec.integer ? Math.round(value) : value;
  return clamp(next, spec.min, spec.max);
}

function deriveResult(labId: AppliedMathLabId, vars: AppliedVars): DerivedResult {
  switch (labId) {
    case "geometry-measurement": {
      const base = vars.a;
      const height = vars.b;
      const angle = vars.c;
      const slanted = Math.sqrt(base ** 2 + height ** 2);
      const area = 0.5 * base * height;
      const perimeter = base + height + slanted;
      const graphPoints = Array.from({ length: 8 }, (_, index) => {
        const x = (base / 7) * index;
        return { x, y: (height / base) * x, label: `${formatNumber(x, 1)} cm` };
      });

      return {
        mainLabel: "Area",
        mainValue: area,
        mainUnit: "cm^2",
        secondaryLabel: "Perimeter",
        secondaryValue: perimeter,
        secondaryUnit: "cm",
        tertiaryLabel: "Diagonal",
        tertiaryValue: slanted,
        tertiaryUnit: "cm",
        progressLabel: "measurement coverage",
        progressValue: `${formatNumber(base)} x ${formatNumber(height)} cm, ${formatNumber(angle, 0)} deg`,
        progressPercent: clamp((area / 70) * 100, 8, 100),
        summary: `triangle area ${formatNumber(area)} cm^2 from base ${formatNumber(base)} cm and height ${formatNumber(height)} cm`,
        prediction: `If height increases by 1 cm, area rises by about ${formatNumber(base / 2)} cm^2.`,
        formula: "A = 1/2bh, P = a + b + c",
        graphTitle: "Height profile",
        xLabel: "base distance (cm)",
        yLabel: "height (cm)",
        graphPoints,
        stageNote: "Ruler and protractor readings update from the controls.",
      };
    }
    case "exponential-growth-decay": {
      const initial = vars.a;
      const rate = vars.b;
      const time = vars.c;
      const amount = initial * Math.exp(rate * time);
      const changePercent = ((amount - initial) / initial) * 100;
      const characteristic = Math.abs(rate) < 0.001 ? Number.POSITIVE_INFINITY : Math.log(rate > 0 ? 2 : 0.5) / rate;
      const graphPoints = Array.from({ length: 18 }, (_, index) => {
        const x = (time / 17) * index;
        return { x, y: initial * Math.exp(rate * x), label: `t=${formatNumber(x, 1)}` };
      });

      return {
        mainLabel: "N(t)",
        mainValue: amount,
        mainUnit: "units",
        secondaryLabel: rate >= 0 ? "Growth" : "Decay",
        secondaryValue: changePercent,
        secondaryUnit: "%",
        tertiaryLabel: rate >= 0 ? "Doubling time" : "Half-life",
        tertiaryValue: Number.isFinite(characteristic) ? characteristic : 0,
        tertiaryUnit: "t",
        progressLabel: rate >= 0 ? "growth horizon" : "decay horizon",
        progressValue: `${rate >= 0 ? "+" : ""}${formatNumber(rate, 2)} per t for ${formatNumber(time, 1)} t`,
        progressPercent: clamp((Math.abs(changePercent) / 260) * 100, 5, 100),
        summary: `${rate >= 0 ? "growth" : "decay"} from ${formatNumber(initial)} to ${formatNumber(amount)} units`,
        prediction:
          Math.abs(rate) < 0.001
            ? "With r near zero, the curve stays almost flat."
            : `${rate >= 0 ? "Doubling time" : "Half-life"} is about ${formatNumber(Math.abs(characteristic), 2)} time units.`,
        formula: "N(t) = N0e^(rt)",
        graphTitle: "Exponential curve",
        xLabel: "time",
        yLabel: "N(t)",
        graphPoints,
        stageNote: rate >= 0 ? "Culture chamber is in growth mode." : "Chamber is in decay mode.",
      };
    }
    case "data-sampling-error": {
      const mean = vars.a;
      const sampleSize = Math.round(vars.b);
      const sigma = vars.c;
      const standardError = sigma / Math.sqrt(sampleSize);
      const margin = 1.96 * standardError;
      const graphPoints = [5, 10, 20, 40, 60, 90, 120].map((n) => ({
        x: n,
        y: sigma / Math.sqrt(n),
        label: `n=${n}`,
      }));

      return {
        mainLabel: "SE",
        mainValue: standardError,
        mainUnit: "",
        secondaryLabel: "95% margin",
        secondaryValue: margin,
        secondaryUnit: "",
        tertiaryLabel: "CI width",
        tertiaryValue: margin * 2,
        tertiaryUnit: "",
        progressLabel: "sampling confidence",
        progressValue: `${formatNumber(mean)} +/- ${formatNumber(margin)} at n=${sampleSize}`,
        progressPercent: clamp((sampleSize / 120) * 100, 4, 100),
        summary: `95% interval is ${formatNumber(mean - margin)} to ${formatNumber(mean + margin)} with SE ${formatNumber(standardError)}`,
        prediction: `Doubling sample size would reduce SE by about ${formatNumber((1 - 1 / Math.sqrt(2)) * 100, 0)}%.`,
        formula: "SE = sigma / sqrt(n), CI = mean +/- 1.96SE",
        graphTitle: "Standard error vs sample size",
        xLabel: "sample size",
        yLabel: "SE",
        graphPoints,
        stageNote: "Highlighted dots represent sampled observations from the population.",
      };
    }
    case "quadratic-projectiles": {
      const velocity = vars.a;
      const angle = vars.b;
      const gravity = vars.c;
      const radians = (angle * Math.PI) / 180;
      const range = (velocity ** 2 * Math.sin(2 * radians)) / gravity;
      const maxHeight = (velocity * Math.sin(radians)) ** 2 / (2 * gravity);
      const flightTime = (2 * velocity * Math.sin(radians)) / gravity;
      const graphPoints = Array.from({ length: 26 }, (_, index) => {
        const t = (flightTime / 25) * index;
        const x = velocity * Math.cos(radians) * t;
        const y = Math.max(0, velocity * Math.sin(radians) * t - 0.5 * gravity * t ** 2);
        return { x, y, label: `t=${formatNumber(t, 1)} s` };
      });

      return {
        mainLabel: "Range",
        mainValue: range,
        mainUnit: "m",
        secondaryLabel: "Max height",
        secondaryValue: maxHeight,
        secondaryUnit: "m",
        tertiaryLabel: "Flight time",
        tertiaryValue: flightTime,
        tertiaryUnit: "s",
        progressLabel: "projectile mission",
        progressValue: `${formatNumber(range)} m range at ${formatNumber(angle, 0)} deg`,
        progressPercent: clamp((range / 260) * 100, 6, 100),
        summary: `projectile travels ${formatNumber(range)} m and reaches ${formatNumber(maxHeight)} m high`,
        prediction: `The path follows a downward-opening quadratic curve under gravity ${formatNumber(gravity, 1)} m/s^2.`,
        formula: "y = xtan(theta) - gx^2 / (2v^2cos^2(theta))",
        graphTitle: "Projectile parabola",
        xLabel: "horizontal distance (m)",
        yLabel: "height (m)",
        graphPoints,
        stageNote: "Arc, apex, and target range update from launch parameters.",
      };
    }
    case "logarithm-scales": {
      const coefficient = vars.a;
      const base = Math.max(2, Math.round(vars.b));
      const exponent = vars.c;
      const value = coefficient * base ** exponent;
      const log10 = Math.log10(value);
      const graphPoints = Array.from({ length: 17 }, (_, index) => {
        const x = (exponent / 16) * index;
        return { x, y: coefficient * base ** x, label: `n=${formatNumber(x, 1)}` };
      });

      return {
        mainLabel: "Value",
        mainValue: value,
        mainUnit: "",
        secondaryLabel: "log10(value)",
        secondaryValue: log10,
        secondaryUnit: "",
        tertiaryLabel: "Magnitude",
        tertiaryValue: Math.floor(log10),
        tertiaryUnit: "order",
        progressLabel: "orders of magnitude",
        progressValue: `${formatNumber(coefficient, 1)} x ${base}^${formatNumber(exponent, 1)}`,
        progressPercent: clamp((log10 / 8) * 100, 4, 100),
        summary: `${formatNumber(coefficient, 1)} x ${base}^${formatNumber(exponent, 1)} = ${formatNumber(value, 3)}`,
        prediction: `Adding 1 to the exponent multiplies the value by ${base}.`,
        formula: "log_b(x) = n means b^n = x",
        graphTitle: "Log scale response",
        xLabel: "exponent",
        yLabel: "value",
        graphPoints,
        stageNote: "The marker moves by order of magnitude instead of raw distance.",
      };
    }
    case "unit-conversion": {
      const value = vars.a;
      const conversionIndex = clamp(Math.round(vars.b), 0, unitConversions.length - 1);
      const sigFigs = clamp(Math.round(vars.c), 2, 5);
      const conversion = unitConversions[conversionIndex];
      const converted = value * conversion.factor;
      const graphPoints = unitConversions.map((item, index) => ({
        x: index,
        y: Math.abs(item.factor),
        label: `${item.from} to ${item.to}`,
      }));

      return {
        mainLabel: "Converted",
        mainValue: converted,
        mainUnit: conversion.to,
        secondaryLabel: "Factor",
        secondaryValue: conversion.factor,
        secondaryUnit: "",
        tertiaryLabel: "Sig figs",
        tertiaryValue: sigFigs,
        tertiaryUnit: "",
        progressLabel: "dimension check",
        progressValue: `${conversion.from} -> ${conversion.to} (${conversion.dimension})`,
        progressPercent: clamp((conversionIndex + 1) * 20, 20, 100),
        summary: `${formatNumber(value, sigFigs)} ${conversion.from} = ${formatNumber(converted, sigFigs)} ${conversion.to}`,
        prediction: `Units cancel with factor ${conversion.factorText}, leaving ${conversion.to}.`,
        formula: `value x (${conversion.factorText})`,
        graphTitle: "Conversion factor scale",
        xLabel: "conversion type",
        yLabel: "factor",
        graphPoints,
        stageNote: "Follow the pipeline from source unit to target unit.",
      };
    }
    case "matrix-transformations": {
      const angle = (vars.a * Math.PI) / 180;
      const scale = vars.b;
      const shear = vars.c;
      const determinant = scale ** 2;
      const rawX = scale * 2 + shear;
      const rawY = scale;
      const transformedX = rawX * Math.cos(angle) - rawY * Math.sin(angle);
      const transformedY = rawX * Math.sin(angle) + rawY * Math.cos(angle);
      const vectorLength = Math.hypot(transformedX, transformedY);
      const graphPoints = Array.from({ length: 13 }, (_, index) => {
        const degrees = index * 30;
        const radians = (degrees * Math.PI) / 180;
        const x = scale * Math.cos(radians) + shear * Math.sin(radians);
        const y = scale * Math.sin(radians);
        return { x: degrees, y: Math.hypot(x, y), label: `${degrees} deg` };
      });

      return {
        mainLabel: "det(A)", mainValue: determinant, mainUnit: "area x",
        secondaryLabel: "Vector length", secondaryValue: vectorLength, secondaryUnit: "units",
        tertiaryLabel: "Rotation", tertiaryValue: vars.a, tertiaryUnit: "deg",
        progressLabel: "transformation matrix",
        progressValue: `rotate ${formatNumber(vars.a, 0)} deg, scale ${formatNumber(scale, 2)}, shear ${formatNumber(shear, 2)}`,
        progressPercent: clamp((Math.abs(vars.a) / 180) * 50 + (scale / 2) * 50, 8, 100),
        summary: `det(A) = ${formatNumber(determinant, 3)} and transformed vector = (${formatNumber(transformedX, 2)}, ${formatNumber(transformedY, 2)})`,
        prediction: determinant < 1 ? "The transformed polygon contracts in area." : determinant > 1 ? "The transformed polygon expands in area." : "The transformation preserves area.",
        formula: "x' = R(theta) [[s, h], [0, s]] x",
        graphTitle: "Directional scale factor", xLabel: "input angle (deg)", yLabel: "output length",
        graphPoints,
        stageNote: "Original and transformed basis vectors share the same coordinate plane.",
      };
    }
    case "sequences-series": {
      const first = Math.round(vars.a);
      const difference = Math.round(vars.b);
      const termCount = Math.round(vars.c);
      const nthTerm = first + (termCount - 1) * difference;
      const sum = (termCount * (first + nthTerm)) / 2;
      const graphPoints = Array.from({ length: termCount }, (_, index) => ({
        x: index + 1,
        y: first + index * difference,
        label: `a${index + 1}`,
      }));

      return {
        mainLabel: `a${termCount}`, mainValue: nthTerm, mainUnit: "",
        secondaryLabel: `S${termCount}`, secondaryValue: sum, secondaryUnit: "",
        tertiaryLabel: "Mean term", tertiaryValue: sum / termCount, tertiaryUnit: "",
        progressLabel: "sequence horizon", progressValue: `${termCount} terms with d = ${difference}`,
        progressPercent: clamp((termCount / 20) * 100, 10, 100),
        summary: `a${termCount} = ${formatNumber(nthTerm, 0)} and S${termCount} = ${formatNumber(sum, 0)}`,
        prediction: difference > 0 ? "Terms rise by a constant difference." : difference < 0 ? "Terms fall by a constant difference." : "Every term remains constant.",
        formula: "a_n = a_1 + (n-1)d, S_n = n(a_1+a_n)/2",
        graphTitle: "Arithmetic sequence", xLabel: "term n", yLabel: "a_n",
        graphPoints,
        stageNote: "Each column is one term; the ribbon tracks cumulative sum.",
      };
    }
    case "inequalities-feasible-regions": {
      const xLimit = vars.a;
      const yLimit = vars.b;
      const probeX = vars.c;
      const probeY = yLimit * 0.3;
      const boundaryY = yLimit * (1 - probeX / xLimit);
      const slack = boundaryY - probeY;
      const feasibleArea = (xLimit * yLimit) / 2;
      const graphPoints = Array.from({ length: 13 }, (_, index) => {
        const x = (xLimit / 12) * index;
        return { x, y: yLimit * (1 - x / xLimit), label: `x=${formatNumber(x, 1)}` };
      });

      return {
        mainLabel: "Feasible area", mainValue: feasibleArea, mainUnit: "units^2",
        secondaryLabel: "Probe slack", secondaryValue: slack, secondaryUnit: "y units",
        tertiaryLabel: "Boundary y", tertiaryValue: Math.max(0, boundaryY), tertiaryUnit: "",
        progressLabel: "constraint check",
        progressValue: slack >= 0 ? "probe point is feasible" : "probe point violates the boundary",
        progressPercent: clamp((feasibleArea / 72) * 100, 8, 100),
        summary: `region area ${formatNumber(feasibleArea, 2)}; probe (${formatNumber(probeX, 1)}, ${formatNumber(probeY, 1)}) has slack ${formatNumber(slack, 2)}`,
        prediction: slack >= 0 ? "The test point satisfies every displayed constraint." : "Reduce probe x or y to return to the feasible region.",
        formula: "x/a + y/b <= 1, x >= 0, y >= 0",
        graphTitle: "Constraint boundary", xLabel: "x", yLabel: "maximum y",
        graphPoints,
        stageNote: "The shaded polygon contains all points satisfying the inequalities.",
      };
    }
    case "transformations-symmetry": {
      const translation = vars.a;
      const rotation = vars.b;
      const scale = vars.c;
      const areaFactor = scale ** 2;
      const graphPoints = Array.from({ length: 8 }, (_, index) => {
        const angle = (index * Math.PI) / 4 + (rotation * Math.PI) / 180;
        const x = translation + Math.cos(angle) * scale * (index % 2 === 0 ? 2 : 1);
        const y = Math.sin(angle) * scale * (index % 2 === 0 ? 2 : 1);
        return { x: index + 1, y: Math.hypot(x, y), label: `vertex ${index + 1}` };
      });

      return {
        mainLabel: "Area factor", mainValue: areaFactor, mainUnit: "x",
        secondaryLabel: "Translation", secondaryValue: translation, secondaryUnit: "x units",
        tertiaryLabel: "Rotation", tertiaryValue: rotation, tertiaryUnit: "deg",
        progressLabel: "symmetry transform", progressValue: `T(${formatNumber(translation, 1)}, 0), R(${formatNumber(rotation, 0)} deg), D(${formatNumber(scale, 2)})`,
        progressPercent: clamp((scale / 1.8) * 70 + (Math.abs(rotation) / 180) * 30, 8, 100),
        summary: `shape translated ${formatNumber(translation, 1)}, rotated ${formatNumber(rotation, 0)} deg, and scaled ${formatNumber(scale, 2)}x`,
        prediction: Math.abs(scale - 1) < 0.01 ? "Lengths and areas are preserved by this rigid transformation." : `Lengths change ${formatNumber(scale, 2)}x and areas change ${formatNumber(areaFactor, 2)}x.`,
        formula: "p' = kR(theta)p + t",
        graphTitle: "Transformed vertex radius", xLabel: "vertex", yLabel: "distance from origin",
        graphPoints,
        stageNote: "Dashed axes reveal reflection and rotational symmetry.",
      };
    }
    case "angles-circles": {
      const radius = vars.a;
      const angleDegrees = vars.b;
      const angleRadians = (angleDegrees * Math.PI) / 180;
      const circumference = 2 * Math.PI * radius;
      const arcLength = radius * angleRadians;
      const sectorArea = 0.5 * radius ** 2 * angleRadians;
      const graphPoints = Array.from({ length: 13 }, (_, index) => {
        const degrees = index * 30;
        return { x: degrees, y: radius * ((degrees * Math.PI) / 180), label: `${degrees} deg` };
      });

      return {
        mainLabel: "Arc length", mainValue: arcLength, mainUnit: "cm",
        secondaryLabel: "Sector area", secondaryValue: sectorArea, secondaryUnit: "cm^2",
        tertiaryLabel: "Circumference", tertiaryValue: circumference, tertiaryUnit: "cm",
        progressLabel: "central angle", progressValue: `${formatNumber(angleDegrees, 0)} deg = ${formatNumber(angleRadians, 3)} rad`,
        progressPercent: clamp((angleDegrees / 360) * 100, 4, 100),
        summary: `${formatNumber(angleDegrees, 0)} deg arc is ${formatNumber(arcLength, 2)} cm on radius ${formatNumber(radius, 1)} cm`,
        prediction: `Doubling radius doubles arc length but makes sector area four times larger.`,
        formula: "s = r theta, A_sector = 1/2 r^2 theta",
        graphTitle: "Arc length by angle", xLabel: "central angle (deg)", yLabel: "arc length (cm)",
        graphPoints,
        stageNote: "The highlighted sector rotates without changing its measured angle.",
      };
    }
    case "combinatorics-counting": {
      const total = Math.round(vars.a);
      const selected = Math.min(total, Math.round(vars.b));
      const ordered = Math.round(vars.c) === 1;
      const combinations = factorial(total) / (factorial(selected) * factorial(total - selected));
      const permutations = factorial(total) / factorial(total - selected);
      const arrangements = ordered ? permutations : combinations;
      const graphPoints = Array.from({ length: total + 1 }, (_, index) => ({
        x: index,
        y: ordered
          ? factorial(total) / factorial(total - index)
          : factorial(total) / (factorial(index) * factorial(total - index)),
        label: `r=${index}`,
      }));

      return {
        mainLabel: ordered ? "nPr" : "nCr", mainValue: arrangements, mainUnit: "ways",
        secondaryLabel: "Combinations", secondaryValue: combinations, secondaryUnit: "ways",
        tertiaryLabel: "Permutations", tertiaryValue: permutations, tertiaryUnit: "ways",
        progressLabel: "counting mode", progressValue: `${total} choose ${selected}, ${ordered ? "order matters" : "order ignored"}`,
        progressPercent: clamp((selected / total) * 100, 8, 100),
        summary: `${total}${ordered ? "P" : "C"}${selected} = ${formatNumber(arrangements, 0)} possible arrangements`,
        prediction: ordered ? "Changing the order creates a different outcome." : "Selections with the same members count only once.",
        formula: ordered ? "nPr = n!/(n-r)!" : "nCr = n!/(r!(n-r)!)",
        graphTitle: ordered ? "Permutations by r" : "Combinations by r", xLabel: "selected r", yLabel: "number of ways",
        graphPoints,
        stageNote: "Tokens feed into selection slots; mode controls whether order matters.",
      };
    }
  }
}

function createRun(index: number, derived: DerivedResult): MathRun {
  return {
    index,
    main: `${formatNumber(derived.mainValue, 3)} ${derived.mainUnit}`.trim(),
    secondary: `${formatNumber(derived.secondaryValue, 3)} ${derived.secondaryUnit}`.trim(),
    tertiary: `${formatNumber(derived.tertiaryValue, 3)} ${derived.tertiaryUnit}`.trim(),
    summary: derived.summary,
  };
}

function buildCsvRows(runs: MathRun[]) {
  const rows = [
    ["run", "primary", "secondary", "tertiary", "summary"],
    ...runs.map((run) => [run.index, run.main, run.secondary, run.tertiary, run.summary]),
  ];

  return rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

function AppliedControl({
  spec,
  value,
  displayValue,
  onChange,
}: {
  spec: ControlSpec;
  value: number;
  displayValue?: string;
  onChange: (value: number) => void;
}) {
  const Icon = spec.icon;

  return (
    <label className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="min-w-0 text-xs font-black text-slate-600">
          <span className="flex items-center gap-1.5">
            <Icon className={`h-4 w-4 ${toneTextClass[spec.tone]}`} />
            <span className="truncate">{spec.label}</span>
          </span>
          <span className="mt-1 block text-[10px] font-bold leading-relaxed text-slate-400">{spec.helper}</span>
        </span>
        <span className={`shrink-0 rounded-lg border border-slate-100 bg-white px-2.5 py-1 font-mono text-xs font-black ${toneTextClass[spec.tone]}`}>
          {displayValue ?? `${formatNumber(value, 2)} ${spec.unit}`.trim()}
        </span>
      </div>
      <input
        type="range"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={value}
        onChange={(event) => onChange(roundToStep(Number(event.target.value), spec))}
        className={`h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 ${toneAccentClass[spec.tone]}`}
      />
    </label>
  );
}

function TheoryPanel({ derived, config }: { derived: DerivedResult; config: AppliedMathConfig }) {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
      <h2 className="mb-2 flex items-center gap-2 text-base font-black text-slate-900">
        <Calculator className="h-5 w-5 text-violet-600" />
        ทฤษฎีและสมการ
      </h2>
      <p className="text-sm font-semibold leading-relaxed text-slate-500">{config.theory}</p>
      <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/70 px-3 py-2 font-mono text-xs font-black text-violet-700">
        {derived.formula}
      </div>
      <p className="mt-3 text-xs font-bold leading-relaxed text-slate-500">{derived.prediction}</p>
    </section>
  );
}

function MiniAppliedGraph({ derived, accent }: { derived: DerivedResult; accent: AccentTone }) {
  const plot = useMemo(() => {
    const points = derived.graphPoints;
    const xValues = points.map((point) => point.x);
    const yValues = points.map((point) => point.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const xSpan = maxX - minX || 1;
    const ySpan = maxY - minY || 1;
    const toX = (x: number) => 54 + ((x - minX) / xSpan) * 282;
    const toY = (y: number) => 216 - ((y - minY) / ySpan) * 164;
    const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${toX(point.x).toFixed(1)} ${toY(point.y).toFixed(1)}`).join(" ");

    return { path, points: points.map((point) => ({ ...point, sx: toX(point.x), sy: toY(point.y) })), minY, maxY };
  }, [derived.graphPoints]);

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
          <LineChart className="h-5 w-5 text-violet-600" />
          {derived.graphTitle}
        </h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-500">{derived.yLabel}</span>
      </div>
      <svg viewBox="0 0 380 250" className="h-64 w-full rounded-2xl bg-slate-950">
        <defs>
          <linearGradient id={`applied-graph-${accent}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="55%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <rect x="22" y="22" width="334" height="206" rx="22" fill="#0f172a" />
        {[0, 1, 2, 3].map((line) => (
          <line key={line} x1="54" x2="336" y1={58 + line * 43} y2={58 + line * 43} stroke="#1e293b" strokeWidth="1" />
        ))}
        <line x1="54" y1="216" x2="336" y2="216" stroke="#475569" strokeWidth="1.5" />
        <line x1="54" y1="52" x2="54" y2="216" stroke="#475569" strokeWidth="1.5" />
        <path d={plot.path} fill="none" stroke={`url(#applied-graph-${accent})`} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {plot.points.map((point, index) => (
          <circle key={`${point.label}-${index}`} cx={point.sx} cy={point.sy} r={index === plot.points.length - 1 ? 5.5 : 3.5} fill={index === plot.points.length - 1 ? "#fbbf24" : "#67e8f9"} />
        ))}
        <text x="54" y="36" fill="#cbd5e1" fontSize="11" fontWeight="800">
          {formatNumber(plot.maxY, 2)}
        </text>
        <text x="54" y="238" fill="#94a3b8" fontSize="10" fontWeight="800">
          {derived.xLabel}
        </text>
        <text x="286" y="238" fill="#94a3b8" fontSize="10" fontWeight="800">
          {formatNumber(plot.minY, 2)}
        </text>
      </svg>
    </section>
  );
}

function AppliedResultsTable({
  runs,
  derived,
  onCopyData,
  onExportCsv,
}: {
  runs: MathRun[];
  derived: DerivedResult;
  onCopyData: () => void;
  onExportCsv: () => void;
}) {
  const rows = runs.length > 0 ? runs : [createRun(1, derived)];

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
          <ClipboardList className="h-5 w-5 text-violet-600" />
          ตารางผลการทดลอง
        </h2>
        <div className="flex gap-2">
          <button type="button" onClick={onCopyData} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">
            <Clipboard className="h-4 w-4" />
            Copy
          </button>
          <button type="button" onClick={onExportCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Run</th>
              <th className="px-3 py-2">{derived.mainLabel}</th>
              <th className="px-3 py-2">{derived.secondaryLabel}</th>
              <th className="px-3 py-2">{derived.tertiaryLabel}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
            {rows.slice(-8).map((run) => (
              <tr key={`${run.index}-${run.summary}`}>
                <td className="px-3 py-2 font-black text-slate-900">#{run.index}</td>
                <td className="px-3 py-2">{run.main}</td>
                <td className="px-3 py-2">{run.secondary}</td>
                <td className="px-3 py-2">{run.tertiary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-500">{rows[rows.length - 1]?.summary}</p>
    </section>
  );
}

function AppliedMathStage({
  labId,
  vars,
  derived,
  runs,
}: {
  labId: AppliedMathLabId;
  vars: AppliedVars;
  derived: DerivedResult;
  runs: MathRun[];
}) {
  const gradientId = `${labId}-stage-bg`;
  const glowId = `${labId}-stage-glow`;
  const pathId = `${labId}-path`;

  return (
    <div className="h-full w-full overflow-hidden rounded-[18px] bg-[#f8fafc] bg-[linear-gradient(rgba(191,219,254,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(191,219,254,0.34)_1px,transparent_1px)] bg-[length:36px_36px]">
      <svg viewBox="0 0 640 420" className="h-full w-full" role="img" aria-label={`${configs[labId].title} simulation illustration`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="45%" stopColor="#eef6ff" />
            <stop offset="100%" stopColor="#f5f3ff" />
          </linearGradient>
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#0f172a" floodOpacity="0.16" />
          </filter>
          <linearGradient id={`${pathId}-warm`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="55%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <rect width="640" height="420" fill={`url(#${gradientId})`} />
        <g opacity="0.5">
          {Array.from({ length: 17 }, (_, index) => (
            <line key={`v-${index}`} x1={32 + index * 36} x2={32 + index * 36} y1="28" y2="392" stroke="#dbeafe" strokeWidth="1" />
          ))}
          {Array.from({ length: 10 }, (_, index) => (
            <line key={`h-${index}`} x1="28" x2="612" y1={40 + index * 36} y2={40 + index * 36} stroke="#dbeafe" strokeWidth="1" />
          ))}
        </g>
        {labId === "geometry-measurement" && <GeometryStage vars={vars} derived={derived} glowId={glowId} />}
        {labId === "exponential-growth-decay" && <ExponentialStage vars={vars} derived={derived} pathId={pathId} glowId={glowId} />}
        {labId === "data-sampling-error" && <SamplingStage vars={vars} derived={derived} glowId={glowId} />}
        {labId === "quadratic-projectiles" && <ProjectileStage vars={vars} derived={derived} pathId={pathId} glowId={glowId} />}
        {labId === "logarithm-scales" && <LogarithmStage vars={vars} derived={derived} glowId={glowId} />}
        {labId === "unit-conversion" && <UnitConversionStage vars={vars} derived={derived} glowId={glowId} />}
        {labId === "matrix-transformations" && <MatrixStage vars={vars} derived={derived} glowId={glowId} />}
        {labId === "sequences-series" && <SequencesStage vars={vars} glowId={glowId} />}
        {labId === "inequalities-feasible-regions" && <InequalitiesStage vars={vars} glowId={glowId} />}
        {labId === "transformations-symmetry" && <SymmetryStage vars={vars} glowId={glowId} />}
        {labId === "angles-circles" && <CirclesStage vars={vars} derived={derived} glowId={glowId} />}
        {labId === "combinatorics-counting" && <CombinatoricsStage vars={vars} derived={derived} glowId={glowId} />}
        <g transform="translate(36 350)" filter={`url(#${glowId})`}>
          <rect width="282" height="46" rx="16" fill="#ffffff" opacity="0.92" />
          <text x="18" y="19" fill="#64748b" fontSize="11" fontWeight="800">
            {derived.formula}
          </text>
          <text x="18" y="34" fill="#0f172a" fontSize="12" fontWeight="900">
            {derived.stageNote}
          </text>
        </g>
        <g transform="translate(448 34)" filter={`url(#${glowId})`}>
          <rect width="156" height="82" rx="18" fill="#ffffff" opacity="0.94" />
          <text x="18" y="24" fill="#64748b" fontSize="10" fontWeight="900">
            LIVE RESULT
          </text>
          <text x="18" y="48" fill="#0f172a" fontSize="20" fontWeight="900">
            {formatNumber(derived.mainValue, 3)}
          </text>
          <text x="18" y="66" fill="#2563eb" fontSize="12" fontWeight="900">
            {derived.mainLabel} {derived.mainUnit}
          </text>
        </g>
        {runs.length > 0 && (
          <g transform="translate(460 332)" opacity="0.9">
            <rect width="136" height="38" rx="14" fill="#ecfdf5" />
            <text x="16" y="16" fill="#047857" fontSize="10" fontWeight="900">
              SAVED RUNS
            </text>
            <text x="16" y="30" fill="#065f46" fontSize="13" fontWeight="900">
              {runs.length} recorded
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function GeometryStage({ vars, glowId }: { vars: AppliedVars; derived: DerivedResult; glowId: string }) {
  const scale = Math.min(280 / vars.a, 190 / vars.b);
  const x0 = 150;
  const y0 = 294;
  const x1 = x0 + vars.a * scale;
  const y2 = y0 - vars.b * scale;
  const angleArc = `M ${svgValue(x0 + 54)} ${svgValue(y0)} A 54 54 0 0 0 ${svgValue(x0 + 54 * Math.cos((-vars.c * Math.PI) / 180))} ${svgValue(y0 - 54 * Math.sin((vars.c * Math.PI) / 180))}`;

  return (
    <g>
      <g transform="translate(76 56)" filter={`url(#${glowId})`}>
        <rect width="360" height="260" rx="28" fill="#ffffff" opacity="0.88" />
        <g opacity="0.55">
          {Array.from({ length: 9 }, (_, index) => (
            <line key={`geo-v-${index}`} x1={34 + index * 36} x2={34 + index * 36} y1="28" y2="232" stroke="#c4b5fd" strokeWidth={index % 2 === 0 ? 1.4 : 0.8} />
          ))}
          {Array.from({ length: 6 }, (_, index) => (
            <line key={`geo-h-${index}`} x1="32" x2="330" y1={42 + index * 36} y2={42 + index * 36} stroke="#bfdbfe" strokeWidth="1" />
          ))}
        </g>
      </g>
      <polygon points={`${x0},${y0} ${x1},${y0} ${x0},${y2}`} fill="#ddd6fe" stroke="#7c3aed" strokeWidth="5" strokeLinejoin="round" filter={`url(#${glowId})`} />
      <polygon points={`${x0},${y0} ${x1},${y0} ${x0},${y2}`} fill="url(#geometry-measurement-path-warm)" opacity="0.24" />
      <line x1={x0} y1={y0 + 24} x2={x1} y2={y0 + 24} stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
      <line x1={x0 - 24} y1={y0} x2={x0 - 24} y2={y2} stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
      <g stroke="#f8fafc" strokeWidth="2" opacity="0.85">
        {Array.from({ length: 11 }, (_, index) => (
          <line key={`ruler-${index}`} x1={x0 + index * ((x1 - x0) / 10)} x2={x0 + index * ((x1 - x0) / 10)} y1={y0 + 16} y2={y0 + (index % 2 === 0 ? 34 : 28)} />
        ))}
        {Array.from({ length: 8 }, (_, index) => (
          <line key={`height-ruler-${index}`} x1={x0 - 34} x2={x0 - (index % 2 === 0 ? 16 : 22)} y1={y0 - index * ((y0 - y2) / 7)} y2={y0 - index * ((y0 - y2) / 7)} />
        ))}
      </g>
      <path d={angleArc} fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
      <text x={(x0 + x1) / 2 - 34} y={y0 + 54} fill="#0f172a" fontSize="14" fontWeight="900">
        base {formatNumber(vars.a, 1)} cm
      </text>
      <text x={x0 - 96} y={(y0 + y2) / 2} fill="#0f172a" fontSize="14" fontWeight="900" transform={`rotate(-90 ${x0 - 96} ${(y0 + y2) / 2})`}>
        height {formatNumber(vars.b, 1)} cm
      </text>
      <text x={x0 + 62} y={y0 - 26} fill="#b45309" fontSize="15" fontWeight="900">
        {formatNumber(vars.c, 0)} deg
      </text>
      <g transform="translate(428 188)" filter={`url(#${glowId})`}>
        <path d="M 0 92 A 92 92 0 0 1 184 92" fill="#fef3c7" stroke="#f59e0b" strokeWidth="4" />
        {Array.from({ length: 7 }, (_, index) => {
          const angle = Math.PI - (Math.PI * index) / 6;
          return (
            <line
              key={`protractor-${index}`}
              x1={svgValue(92 + Math.cos(angle) * 72)}
              y1={svgValue(92 - Math.sin(angle) * 72)}
              x2={svgValue(92 + Math.cos(angle) * 92)}
              y2={svgValue(92 - Math.sin(angle) * 92)}
              stroke="#92400e"
              strokeWidth="2"
            />
          );
        })}
        <text x="56" y="112" fill="#92400e" fontSize="13" fontWeight="900">
          protractor
        </text>
      </g>
    </g>
  );
}

function ExponentialStage({ vars, derived, pathId, glowId }: { vars: AppliedVars; derived: DerivedResult; pathId: string; glowId: string }) {
  const points = derived.graphPoints;
  const maxY = Math.max(...points.map((point) => point.y), vars.a);
  const minY = Math.min(...points.map((point) => point.y), vars.a);
  const ySpan = maxY - minY || 1;
  const path = points
    .map((point, index) => {
      const x = 48 + (point.x / vars.c) * 304;
      const y = 236 - ((point.y - minY) / ySpan) * 194;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const decayMode = vars.b < 0;

  return (
    <g>
      <g transform="translate(78 58)" filter={`url(#${glowId})`}>
        <rect width="398" height="278" rx="30" fill="#0f172a" />
        <line x1="48" y1="236" x2="352" y2="236" stroke="#475569" strokeWidth="2" />
        <line x1="48" y1="42" x2="48" y2="236" stroke="#475569" strokeWidth="2" />
        {[0, 1, 2, 3].map((line) => (
          <line key={`exp-grid-${line}`} x1="48" x2="352" y1={64 + line * 48} y2={64 + line * 48} stroke="#1e293b" />
        ))}
        <path d={path} fill="none" stroke={`url(#${pathId}-warm)`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="48" cy="236" r="5" fill="#67e8f9" />
        <circle cx="352" cy={236 - ((derived.mainValue - minY) / ySpan) * 194} r="7" fill="#fbbf24" />
        <text x="58" y="36" fill="#e2e8f0" fontSize="12" fontWeight="900">
          N(t)
        </text>
        <text x="284" y="256" fill="#94a3b8" fontSize="11" fontWeight="900">
          time
        </text>
      </g>
      <g transform="translate(468 158)" filter={`url(#${glowId})`}>
        <ellipse cx="62" cy="82" rx="72" ry="48" fill={decayMode ? "#ecfeff" : "#dcfce7"} stroke={decayMode ? "#06b6d4" : "#22c55e"} strokeWidth="4" />
        {Array.from({ length: 18 }, (_, index) => {
          const angle = index * 2.28;
          const radius = 10 + (index % 5) * 9;
          return (
            <circle
              key={`cell-${index}`}
              cx={svgValue(62 + Math.cos(angle) * radius)}
              cy={svgValue(82 + Math.sin(angle) * radius * 0.58)}
              r={decayMode ? 3 + (index % 2) : 4 + (index % 3)}
              fill={decayMode ? "#0891b2" : "#16a34a"}
              opacity={decayMode ? 0.46 : 0.78}
            />
          );
        })}
        <text x="19" y="154" fill={decayMode ? "#0e7490" : "#15803d"} fontSize="13" fontWeight="900">
          {decayMode ? "decay mode" : "growth mode"}
        </text>
      </g>
    </g>
  );
}

function SamplingStage({ vars, derived, glowId }: { vars: AppliedVars; derived: DerivedResult; glowId: string }) {
  const sampleStep = Math.max(2, Math.round(28 - vars.b / 5));
  const margin = derived.secondaryValue;
  const barHalf = clamp(margin * 4, 18, 134);

  return (
    <g>
      <g transform="translate(56 52)" filter={`url(#${glowId})`}>
        <rect width="338" height="266" rx="30" fill="#ffffff" opacity="0.9" />
        <text x="26" y="34" fill="#0f172a" fontSize="14" fontWeight="900">
          Population field
        </text>
        {Array.from({ length: 84 }, (_, index) => {
          const col = index % 12;
          const row = Math.floor(index / 12);
          const x = 34 + col * 24 + ((index * 7) % 6);
          const y = 58 + row * 27 + ((index * 11) % 7);
          const sampled = index % sampleStep === 0;
          return <circle key={`sample-dot-${index}`} cx={x} cy={y} r={sampled ? 5.5 : 3.3} fill={sampled ? "#7c3aed" : "#94a3b8"} opacity={sampled ? 0.95 : 0.45} />;
        })}
        <rect x="116" y="74" width="142" height="116" rx="18" fill="none" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 8" />
        <text x="132" y="214" fill="#0e7490" fontSize="12" fontWeight="900">
          n = {formatNumber(vars.b, 0)} sample dots
        </text>
      </g>
      <g transform="translate(420 92)" filter={`url(#${glowId})`}>
        <rect width="164" height="204" rx="26" fill="#0f172a" />
        <line x1="24" x2="140" y1="112" y2="112" stroke="#475569" strokeWidth="2" />
        <line x1={82 - barHalf / 2} x2={82 + barHalf / 2} y1="112" y2="112" stroke="#67e8f9" strokeWidth="8" strokeLinecap="round" />
        <line x1={82 - barHalf / 2} x2={82 - barHalf / 2} y1="88" y2="136" stroke="#67e8f9" strokeWidth="4" />
        <line x1={82 + barHalf / 2} x2={82 + barHalf / 2} y1="88" y2="136" stroke="#67e8f9" strokeWidth="4" />
        <circle cx="82" cy="112" r="12" fill="#fbbf24" />
        <path d="M 28 158 C 54 116, 110 116, 136 158" fill="none" stroke="#a78bfa" strokeWidth="4" />
        <text x="28" y="34" fill="#e2e8f0" fontSize="12" fontWeight="900">
          95% interval
        </text>
        <text x="30" y="184" fill="#cbd5e1" fontSize="11" fontWeight="900">
          +/- {formatNumber(margin, 2)}
        </text>
      </g>
    </g>
  );
}

function ProjectileStage({ vars, derived, pathId, glowId }: { vars: AppliedVars; derived: DerivedResult; pathId: string; glowId: string }) {
  const points = derived.graphPoints;
  const range = Math.max(...points.map((point) => point.x), 1);
  const maxHeight = Math.max(...points.map((point) => point.y), 1);
  const toX = (x: number) => 82 + (x / range) * 440;
  const toY = (y: number) => 316 - (y / maxHeight) * 210;
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${toX(point.x).toFixed(1)} ${toY(point.y).toFixed(1)}`).join(" ");
  const ballPoint = points[Math.min(points.length - 1, Math.round(points.length * 0.58))];
  const launchRadians = (vars.b * Math.PI) / 180;

  return (
    <g>
      <rect x="58" y="64" width="520" height="276" rx="32" fill="#dbeafe" opacity="0.8" filter={`url(#${glowId})`} />
      <path d="M 58 316 C 168 300, 248 336, 352 318 C 438 304, 508 324, 578 312 L 578 340 L 58 340 Z" fill="#bbf7d0" />
      <g opacity="0.45" stroke="#93c5fd">
        {[0, 1, 2, 3, 4].map((line) => (
          <line key={`proj-h-${line}`} x1="82" x2="540" y1={104 + line * 42} y2={104 + line * 42} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((line) => (
          <line key={`proj-v-${line}`} x1={82 + line * 88} x2={82 + line * 88} y1="84" y2="316" />
        ))}
      </g>
      <path d={path} fill="none" stroke={`url(#${pathId}-warm)`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={toX(ballPoint.x)} cy={toY(ballPoint.y)} r="13" fill="#f97316" stroke="#fff7ed" strokeWidth="5" filter={`url(#${glowId})`} />
      <line x1="82" y1="316" x2={svgValue(82 + Math.cos(launchRadians) * 82)} y2={svgValue(316 - Math.sin(launchRadians) * 82)} stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
      <polygon points={`${toX(range)},316 ${toX(range) - 22},336 ${toX(range) + 22},336`} fill="#ef4444" />
      <line x1="82" y1="330" x2={toX(range)} y2="330" stroke="#475569" strokeWidth="3" strokeDasharray="8 6" />
      <text x={(82 + toX(range)) / 2 - 38} y="358" fill="#0f172a" fontSize="13" fontWeight="900">
        range {formatNumber(derived.mainValue, 1)} m
      </text>
      <text x={toX(ballPoint.x) + 18} y={toY(ballPoint.y) - 10} fill="#9a3412" fontSize="12" fontWeight="900">
        y = ax^2 + bx + c
      </text>
    </g>
  );
}

function LogarithmStage({ vars, derived, glowId }: { vars: AppliedVars; derived: DerivedResult; glowId: string }) {
  const exponent = clamp(vars.c, 0, 8);
  const markerX = 84 + (exponent / 8) * 452;
  const base = Math.round(vars.b);

  return (
    <g>
      <g transform="translate(62 74)" filter={`url(#${glowId})`}>
        <rect width="516" height="214" rx="30" fill="#0f172a" />
        <text x="28" y="38" fill="#e2e8f0" fontSize="14" fontWeight="900">
          Logarithmic ruler
        </text>
        <line x1="44" y1="118" x2="472" y2="118" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
        {Array.from({ length: 9 }, (_, index) => {
          const x = 44 + index * 53.5;
          const selected = Math.abs(index - exponent) < 0.55;
          return (
            <g key={`log-tick-${index}`}>
              <line x1={x} x2={x} y1="78" y2="148" stroke={selected ? "#fbbf24" : "#94a3b8"} strokeWidth={selected ? 5 : 3} />
              <text x={x - 13} y="172" fill={selected ? "#fef3c7" : "#cbd5e1"} fontSize="11" fontWeight="900">
                {base}^{index}
              </text>
            </g>
          );
        })}
        <circle cx={markerX - 40} cy="118" r="15" fill="#fb7185" stroke="#ffe4e6" strokeWidth="5" />
        <path d={`M ${markerX - 40} 86 L ${markerX - 28} 60 L ${markerX - 16} 86 Z`} fill="#fbbf24" />
      </g>
      <g transform="translate(110 304)" filter={`url(#${glowId})`}>
        <rect width="420" height="58" rx="20" fill="#fff1f2" />
        <text x="24" y="24" fill="#be123c" fontSize="13" fontWeight="900">
          scientific notation
        </text>
        <text x="24" y="44" fill="#0f172a" fontSize="20" fontWeight="900">
          {formatNumber(vars.a, 1)} x {base}^{formatNumber(vars.c, 1)} = {formatNumber(derived.mainValue, 3)}
        </text>
      </g>
      <g transform="translate(432 126)">
        {[0, 1, 2, 3].map((index) => (
          <rect key={`mag-${index}`} x={index * 26} y={78 - index * 16} width="20" height={42 + index * 16} rx="8" fill={["#fecdd3", "#fda4af", "#fb7185", "#e11d48"][index]} opacity="0.88" />
        ))}
      </g>
    </g>
  );
}

function UnitConversionStage({ vars, derived, glowId }: { vars: AppliedVars; derived: DerivedResult; glowId: string }) {
  const conversionIndex = clamp(Math.round(vars.b), 0, unitConversions.length - 1);
  const conversion = unitConversions[conversionIndex];

  return (
    <g>
      <g transform="translate(54 94)" filter={`url(#${glowId})`}>
        <rect width="148" height="122" rx="26" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="3" />
        <text x="22" y="32" fill="#1d4ed8" fontSize="12" fontWeight="900">
          GIVEN
        </text>
        <text x="22" y="66" fill="#0f172a" fontSize="24" fontWeight="900">
          {formatNumber(vars.a, Math.round(vars.c))}
        </text>
        <text x="22" y="92" fill="#2563eb" fontSize="18" fontWeight="900">
          {conversion.from}
        </text>
      </g>
      <g transform="translate(244 94)" filter={`url(#${glowId})`}>
        <rect width="154" height="122" rx="26" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="3" />
        <text x="22" y="32" fill="#6d28d9" fontSize="12" fontWeight="900">
          FACTOR
        </text>
        <text x="22" y="66" fill="#0f172a" fontSize="16" fontWeight="900">
          {conversion.factorText}
        </text>
        <line x1="28" x2="126" y1="78" y2="78" stroke="#7c3aed" strokeWidth="3" />
        <text x="22" y="102" fill="#6d28d9" fontSize="12" fontWeight="900">
          unit cancellation
        </text>
      </g>
      <g transform="translate(440 94)" filter={`url(#${glowId})`}>
        <rect width="148" height="122" rx="26" fill="#ecfdf5" stroke="#bbf7d0" strokeWidth="3" />
        <text x="22" y="32" fill="#047857" fontSize="12" fontWeight="900">
          RESULT
        </text>
        <text x="22" y="66" fill="#0f172a" fontSize="24" fontWeight="900">
          {formatNumber(derived.mainValue, Math.round(vars.c))}
        </text>
        <text x="22" y="92" fill="#059669" fontSize="18" fontWeight="900">
          {conversion.to}
        </text>
      </g>
      <path d="M 206 154 L 236 154" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
      <path d="M 402 154 L 432 154" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
      <g transform="translate(78 250)">
        {unitConversions.map((item, index) => (
          <g key={item.from} transform={`translate(${index * 94} 0)`}>
            <rect width="78" height="58" rx="16" fill={index === conversionIndex ? "#dbeafe" : "#ffffff"} stroke={index === conversionIndex ? "#2563eb" : "#e2e8f0"} strokeWidth={index === conversionIndex ? 3 : 1.5} />
            <text x="12" y="24" fill="#0f172a" fontSize="11" fontWeight="900">
              {item.from}
            </text>
            <text x="12" y="42" fill="#2563eb" fontSize="10" fontWeight="900">
              to {item.to}
            </text>
          </g>
        ))}
      </g>
      <g transform="translate(216 330)" filter={`url(#${glowId})`}>
        <rect width="210" height="38" rx="15" fill="#ffffff" />
        <text x="20" y="24" fill="#0f172a" fontSize="13" fontWeight="900">
          dimension: {conversion.dimension} checked
        </text>
      </g>
    </g>
  );
}

function MatrixStage({ vars, derived, glowId }: { vars: AppliedVars; derived: DerivedResult; glowId: string }) {
  const radians = (vars.a * Math.PI) / 180;
  const transform = (x: number, y: number) => {
    const shearedX = vars.b * x + vars.c * y;
    const scaledY = vars.b * y;
    return {
      x: shearedX * Math.cos(radians) - scaledY * Math.sin(radians),
      y: shearedX * Math.sin(radians) + scaledY * Math.cos(radians),
    };
  };
  const toPoint = ({ x, y }: { x: number; y: number }) => `${svgValue(270 + x * 72)},${svgValue(220 - y * 72)}`;
  const original = [{ x: -1.2, y: -0.8 }, { x: 1.2, y: -0.8 }, { x: 1.2, y: 0.8 }, { x: -1.2, y: 0.8 }];
  const transformed = original.map((point) => transform(point.x, point.y));
  const basisX = transform(1, 0);
  const basisY = transform(0, 1);

  return (
    <g>
      <defs>
        <linearGradient id="matrix-plane-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.86" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.62" />
        </linearGradient>
      </defs>
      <g filter={`url(#${glowId})`}>
        <rect x="42" y="44" width="452" height="292" rx="28" fill="#ffffff" opacity="0.9" />
        <g stroke="#dbeafe" strokeWidth="1">
          {Array.from({ length: 13 }, (_, index) => <line key={`matrix-v-${index}`} x1={54 + index * 36} x2={54 + index * 36} y1="58" y2="320" />)}
          {Array.from({ length: 8 }, (_, index) => <line key={`matrix-h-${index}`} x1="54" x2="480" y1={68 + index * 36} y2={68 + index * 36} />)}
        </g>
        <line x1="54" x2="480" y1="220" y2="220" stroke="#64748b" strokeWidth="2" />
        <line x1="270" x2="270" y1="58" y2="320" stroke="#64748b" strokeWidth="2" />
        <polygon points={original.map(toPoint).join(" ")} fill="#e2e8f0" fillOpacity="0.38" stroke="#64748b" strokeWidth="3" strokeDasharray="8 7" />
        <polygon points={transformed.map(toPoint).join(" ")} fill="url(#matrix-plane-fill)" stroke="#1d4ed8" strokeWidth="4" />
        <line x1="270" y1="220" x2={svgValue(270 + basisX.x * 92)} y2={svgValue(220 - basisX.y * 92)} stroke="#f97316" strokeWidth="6" strokeLinecap="round" />
        <line x1="270" y1="220" x2={svgValue(270 + basisY.x * 92)} y2={svgValue(220 - basisY.y * 92)} stroke="#06b6d4" strokeWidth="6" strokeLinecap="round" />
        <circle cx="270" cy="220" r="7" fill="#0f172a" />
      </g>
      <g transform="translate(514 142)" filter={`url(#${glowId})`}>
        <rect width="100" height="150" rx="22" fill="#0f172a" />
        <text x="18" y="28" fill="#93c5fd" fontSize="11" fontWeight="900">MATRIX A</text>
        <path d="M 18 48 L 12 48 L 12 112 L 18 112 M 82 48 L 88 48 L 88 112 L 82 112" fill="none" stroke="#c4b5fd" strokeWidth="3" />
        <text x="22" y="72" fill="#ffffff" fontSize="13" fontWeight="900">{formatNumber(vars.b, 2)}</text>
        <text x="58" y="72" fill="#67e8f9" fontSize="13" fontWeight="900">{formatNumber(vars.c, 2)}</text>
        <text x="22" y="102" fill="#ffffff" fontSize="13" fontWeight="900">0</text>
        <text x="58" y="102" fill="#ffffff" fontSize="13" fontWeight="900">{formatNumber(vars.b, 2)}</text>
        <text x="18" y="134" fill="#fbbf24" fontSize="11" fontWeight="900">det {formatNumber(derived.mainValue, 2)}</text>
      </g>
    </g>
  );
}

function SequencesStage({ vars, glowId }: { vars: AppliedVars; glowId: string }) {
  const count = Math.round(vars.c);
  const terms = Array.from({ length: count }, (_, index) => Math.round(vars.a) + index * Math.round(vars.b));
  const maxAbs = Math.max(1, ...terms.map((value) => Math.abs(value)));
  const width = 458 / count;
  const baseline = 190;

  return (
    <g>
      <g filter={`url(#${glowId})`}>
        <rect x="42" y="52" width="518" height="280" rx="30" fill="#ffffff" opacity="0.92" />
        <line x1="70" x2="532" y1={baseline} y2={baseline} stroke="#64748b" strokeWidth="2" />
        {terms.map((term, index) => {
          const height = (Math.abs(term) / maxAbs) * 110;
          const x = 72 + index * width;
          const y = term >= 0 ? baseline - height : baseline;
          const selected = index === terms.length - 1;
          return (
            <g key={`term-${index}`}>
              <rect x={x} y={y} width={Math.max(5, width - 5)} height={height} rx="5" fill={selected ? "#7c3aed" : term >= 0 ? "#10b981" : "#f97316"} opacity={selected ? 1 : 0.75} />
              {(count <= 12 || selected) && <text x={x + 2} y={term >= 0 ? y - 7 : y + height + 15} fill="#334155" fontSize="9" fontWeight="900">{term}</text>}
            </g>
          );
        })}
        <text x="70" y="82" fill="#0f172a" fontSize="15" fontWeight="900">Arithmetic sequence terms</text>
        <text x="70" y="306" fill="#64748b" fontSize="11" fontWeight="800">n = 1</text>
        <text x="476" y="306" fill="#7c3aed" fontSize="11" fontWeight="900">n = {count}</text>
      </g>
    </g>
  );
}

function InequalitiesStage({ vars, glowId }: { vars: AppliedVars; glowId: string }) {
  const x0 = 94;
  const y0 = 316;
  const xScale = 35;
  const yScale = 20;
  const xEnd = x0 + vars.a * xScale;
  const yEnd = y0 - vars.b * yScale;
  const probeX = x0 + vars.c * xScale;
  const probeYValue = vars.b * 0.3;
  const probeY = y0 - probeYValue * yScale;
  const feasible = vars.c / vars.a + 0.3 <= 1;

  return (
    <g>
      <defs>
        <linearGradient id="feasible-fill" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.26" />
        </linearGradient>
      </defs>
      <g filter={`url(#${glowId})`}>
        <rect x="42" y="48" width="520" height="294" rx="30" fill="#ffffff" opacity="0.92" />
        <g stroke="#e2e8f0">
          {Array.from({ length: 12 }, (_, index) => <line key={`ineq-v-${index}`} x1={x0 + index * xScale} x2={x0 + index * xScale} y1="72" y2={y0} />)}
          {Array.from({ length: 12 }, (_, index) => <line key={`ineq-h-${index}`} x1={x0} x2="518" y1={y0 - index * yScale} y2={y0 - index * yScale} />)}
        </g>
        <line x1={x0} x2="526" y1={y0} y2={y0} stroke="#334155" strokeWidth="3" />
        <line x1={x0} x2={x0} y1="70" y2={y0} stroke="#334155" strokeWidth="3" />
        <polygon points={`${x0},${y0} ${svgValue(xEnd)},${y0} ${x0},${svgValue(yEnd)}`} fill="url(#feasible-fill)" stroke="#0891b2" strokeWidth="3" />
        <line x1={xEnd} y1={y0} x2={x0} y2={yEnd} stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" />
        <circle cx={probeX} cy={probeY} r="12" fill={feasible ? "#10b981" : "#ef4444"} stroke="#ffffff" strokeWidth="5" />
        <line x1={probeX} x2={probeX} y1={probeY} y2={y0} stroke={feasible ? "#10b981" : "#ef4444"} strokeWidth="2" strokeDasharray="5 5" />
        <text x="112" y="92" fill="#0e7490" fontSize="13" fontWeight="900">FEASIBLE REGION</text>
        <text x={Math.min(500, probeX + 16)} y={probeY - 12} fill={feasible ? "#047857" : "#b91c1c"} fontSize="11" fontWeight="900">{feasible ? "satisfies" : "violates"}</text>
      </g>
    </g>
  );
}

function SymmetryStage({ vars, glowId }: { vars: AppliedVars; glowId: string }) {
  const star = "0,-70 17,-23 67,-22 27,9 42,58 0,29 -42,58 -27,9 -67,-22 -17,-23";
  const translatedX = 382 + vars.a * 18;

  return (
    <g>
      <defs>
        <linearGradient id="symmetry-star" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <g filter={`url(#${glowId})`}>
        <rect x="44" y="50" width="516" height="282" rx="30" fill="#ffffff" opacity="0.92" />
        <line x1="304" x2="304" y1="68" y2="318" stroke="#a78bfa" strokeWidth="3" strokeDasharray="8 7" />
        <line x1="70" x2="538" y1="194" y2="194" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 7" />
        <g transform="translate(190 194)">
          <polygon points={star} fill="#e2e8f0" fillOpacity="0.5" stroke="#64748b" strokeWidth="3" strokeDasharray="7 6" />
          <text x="-46" y="96" fill="#64748b" fontSize="11" fontWeight="900">ORIGINAL</text>
        </g>
        <g transform={`translate(${svgValue(translatedX)} 194) rotate(${vars.b}) scale(${vars.c})`}>
          <polygon points={star} fill="url(#symmetry-star)" fillOpacity="0.82" stroke="#6d28d9" strokeWidth={3 / vars.c} />
          <circle cx="0" cy="0" r={6 / vars.c} fill="#fbbf24" />
        </g>
        <path d={`M 260 294 Q 314 328 ${svgValue(translatedX)} 292`} fill="none" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 7" />
        <text x="269" y="88" fill="#7c3aed" fontSize="11" fontWeight="900">SYMMETRY AXIS</text>
      </g>
    </g>
  );
}

function CirclesStage({ vars, derived, glowId }: { vars: AppliedVars; derived: DerivedResult; glowId: string }) {
  const cx = 260;
  const cy = 202;
  const radius = vars.a * 14;
  const start = (vars.c * Math.PI) / 180;
  const end = ((vars.c + vars.b) * Math.PI) / 180;
  const startPoint = { x: cx + Math.cos(start) * radius, y: cy + Math.sin(start) * radius };
  const endPoint = { x: cx + Math.cos(end) * radius, y: cy + Math.sin(end) * radius };
  const sectorPath = `M ${cx} ${cy} L ${svgValue(startPoint.x)} ${svgValue(startPoint.y)} A ${svgValue(radius)} ${svgValue(radius)} 0 ${vars.b > 180 ? 1 : 0} 1 ${svgValue(endPoint.x)} ${svgValue(endPoint.y)} Z`;
  const innerRadius = Math.min(54, radius * 0.45);
  const innerStart = { x: cx + Math.cos(start) * innerRadius, y: cy + Math.sin(start) * innerRadius };
  const innerEnd = { x: cx + Math.cos(end) * innerRadius, y: cy + Math.sin(end) * innerRadius };

  return (
    <g>
      <defs>
        <linearGradient id="circle-sector" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb7185" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <g filter={`url(#${glowId})`}>
        <rect x="42" y="46" width="516" height="288" rx="30" fill="#ffffff" opacity="0.92" />
        <circle cx={cx} cy={cy} r={radius} fill="#fff1f2" stroke="#fda4af" strokeWidth="4" />
        <path d={sectorPath} fill="url(#circle-sector)" stroke="#e11d48" strokeWidth="4" />
        <line x1={cx} y1={cy} x2={startPoint.x} y2={startPoint.y} stroke="#7c3aed" strokeWidth="4" />
        <line x1={cx} y1={cy} x2={endPoint.x} y2={endPoint.y} stroke="#7c3aed" strokeWidth="4" />
        <path d={`M ${svgValue(innerStart.x)} ${svgValue(innerStart.y)} A ${svgValue(innerRadius)} ${svgValue(innerRadius)} 0 ${vars.b > 180 ? 1 : 0} 1 ${svgValue(innerEnd.x)} ${svgValue(innerEnd.y)}`} fill="none" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="8" fill="#0f172a" />
        <text x={cx - 20} y={cy - 68} fill="#9f1239" fontSize="14" fontWeight="900">{formatNumber(vars.b, 0)} deg</text>
        <text x={cx + 20} y={cy + 18} fill="#6d28d9" fontSize="11" fontWeight="900">r = {formatNumber(vars.a, 1)} cm</text>
      </g>
      <g transform="translate(440 148)" filter={`url(#${glowId})`}>
        <rect width="94" height="130" rx="20" fill="#0f172a" />
        <text x="14" y="25" fill="#fda4af" fontSize="10" fontWeight="900">ARC LENGTH</text>
        <text x="14" y="50" fill="#ffffff" fontSize="19" fontWeight="900">{formatNumber(derived.mainValue, 2)}</text>
        <line x1="14" x2="80" y1="66" y2="66" stroke="#475569" />
        <text x="14" y="87" fill="#c4b5fd" fontSize="10" fontWeight="900">SECTOR AREA</text>
        <text x="14" y="111" fill="#ffffff" fontSize="17" fontWeight="900">{formatNumber(derived.secondaryValue, 2)}</text>
      </g>
    </g>
  );
}

function CombinatoricsStage({ vars, derived, glowId }: { vars: AppliedVars; derived: DerivedResult; glowId: string }) {
  const total = Math.round(vars.a);
  const selected = Math.min(total, Math.round(vars.b));
  const ordered = Math.round(vars.c) === 1;
  const colors = ["#2563eb", "#7c3aed", "#06b6d4", "#10b981", "#f97316", "#e11d48"];

  return (
    <g>
      <g filter={`url(#${glowId})`}>
        <rect x="42" y="48" width="516" height="282" rx="30" fill="#ffffff" opacity="0.92" />
        <text x="70" y="82" fill="#0f172a" fontSize="14" fontWeight="900">ITEM POOL</text>
        <g transform="translate(70 98)">
          {Array.from({ length: total }, (_, index) => {
            const row = Math.floor(index / 6);
            const col = index % 6;
            return (
              <g key={`item-${index}`} transform={`translate(${col * 46} ${row * 48})`}>
                <circle cx="17" cy="17" r="16" fill={colors[index % colors.length]} opacity="0.9" />
                <text x="12" y="22" fill="#ffffff" fontSize="12" fontWeight="900">{String.fromCharCode(65 + index)}</text>
              </g>
            );
          })}
        </g>
        <path d="M 90 212 C 184 250, 252 246, 338 220" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="8 7" />
        <text x="70" y="270" fill="#64748b" fontSize="11" fontWeight="900">SELECTION SLOTS</text>
        <g transform="translate(70 282)">
          {Array.from({ length: selected }, (_, index) => (
            <g key={`slot-${index}`} transform={`translate(${index * Math.min(52, 430 / Math.max(selected, 1))} 0)`}>
              <rect width="42" height="34" rx="10" fill={ordered ? "#fff7ed" : "#ecfeff"} stroke={ordered ? "#fb923c" : "#22d3ee"} strokeWidth="2" />
              <text x="15" y="22" fill={ordered ? "#c2410c" : "#0e7490"} fontSize="11" fontWeight="900">{ordered ? index + 1 : "*"}</text>
            </g>
          ))}
        </g>
      </g>
      <g transform="translate(390 132)" filter={`url(#${glowId})`}>
        <rect width="144" height="148" rx="24" fill="#0f172a" />
        <text x="18" y="28" fill={ordered ? "#fdba74" : "#67e8f9"} fontSize="10" fontWeight="900">{ordered ? "PERMUTATION" : "COMBINATION"}</text>
        <text x="18" y="66" fill="#ffffff" fontSize="27" fontWeight="900">{formatNumber(derived.mainValue, 0)}</text>
        <text x="18" y="88" fill="#cbd5e1" fontSize="11" fontWeight="800">possible ways</text>
        <line x1="18" x2="126" y1="104" y2="104" stroke="#475569" />
        <text x="18" y="127" fill="#fbbf24" fontSize="12" fontWeight="900">{total}{ordered ? "P" : "C"}{selected}</text>
      </g>
    </g>
  );
}

export default function AppliedMathSimulation({ labId }: { labId: AppliedMathLabId }) {
  const config = configs[labId];
  const [vars, setVars] = useState<AppliedVars>(config.defaults);
  const [runs, setRuns] = useState<MathRun[]>([]);
  const derived = useMemo(() => deriveResult(labId, vars), [labId, vars]);
  const unitConversion = labId === "unit-conversion" ? unitConversions[clamp(Math.round(vars.b), 0, unitConversions.length - 1)] : null;

  const updateVar = (spec: ControlSpec, value: number) => {
    setVars((current) => ({ ...current, [spec.key]: roundToStep(value, spec) }));
  };

  const handleReset = () => {
    setVars(config.defaults);
    setRuns([]);
  };

  const handleRecordRun = () => {
    setRuns((current) => {
      const nextIndex = current.length > 0 ? current[current.length - 1].index + 1 : 1;
      return [...current.slice(-10), createRun(nextIndex, derived)];
    });
  };

  const handleCopyData = async () => {
    const rows = runs.length > 0 ? runs : [createRun(1, derived)];
    await navigator.clipboard.writeText(buildCsvRows(rows));
  };

  const handleExportCsv = () => {
    const rows = runs.length > 0 ? runs : [createRun(1, derived)];
    const blob = new Blob([buildCsvRows(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${labId}-runs.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveResults = async () => {
    const rows = runs.length > 0 ? runs : [createRun(1, derived)];

    await saveExperimentAndSync({
      localStorageKey: config.localStorageKey,
      localPayload: {
        labId,
        title: config.title,
        variables: vars,
        derived,
        runs: rows,
        savedAt: new Date().toISOString(),
      },
      labId,
      title: config.title,
      variables: vars,
      liveValues: {
        [derived.mainLabel]: derived.mainValue,
        [derived.secondaryLabel]: derived.secondaryValue,
        [derived.tertiaryLabel]: derived.tertiaryValue,
      },
      graphPoints: derived.graphPoints,
      tableRows: rows,
      prediction: derived.prediction,
      summary: {
        formula: derived.formula,
        result: derived.summary,
      },
      score: Math.min(100, 45 + rows.length * 10),
      durationSeconds: null,
    });

    alert(`บันทึกผลแล็บ ${config.title} สำเร็จ`);
  };

  const controls = (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-3">
        {config.controls.map((spec) => (
          <AppliedControl
            key={spec.key}
              spec={spec}
              value={vars[spec.key]}
              displayValue={
                labId === "unit-conversion" && spec.key === "b" && unitConversion
                  ? `${unitConversion.from} -> ${unitConversion.to}`
                  : labId === "combinatorics-counting" && spec.key === "c"
                    ? Math.round(vars.c) === 1 ? "Permutation" : "Combination"
                    : undefined
              }
            onChange={(value) => updateVar(spec, value)}
          />
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
            <button type="button" onClick={handleRecordRun} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-pink-200 px-3 py-2.5 text-xs font-black text-pink-900 shadow-sm hover:bg-pink-300 sm:col-span-2">
          <Save className="h-4 w-4" />
          บันทึก run
        </button>
        <button type="button" onClick={handleSaveResults} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs font-black text-emerald-700 hover:bg-emerald-100">
          <ClipboardList className="h-4 w-4" />
          ส่งผลทดลอง
        </button>
        <button type="button" onClick={handleReset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-50">
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  );

  const compactControls = (
    <div className="grid gap-3 sm:grid-cols-3">
      {config.controls.slice(0, 3).map((spec) => (
        <label key={spec.key} className="text-xs font-black text-slate-600">
          {spec.label}:{" "}
          {labId === "unit-conversion" && spec.key === "b" && unitConversion
            ? `${unitConversion.from}->${unitConversion.to}`
            : labId === "combinatorics-counting" && spec.key === "c"
              ? Math.round(vars.c) === 1 ? "Permutation" : "Combination"
              : formatNumber(vars[spec.key], spec.integer ? 0 : 2)}
          <input
            type="range"
            min={spec.min}
            max={spec.max}
            step={spec.step}
            value={vars[spec.key]}
            onChange={(event) => updateVar(spec, Number(event.target.value))}
            className={`mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 ${toneAccentClass[spec.tone]}`}
          />
        </label>
      ))}
    </div>
  );

  const drawerSummary = (
    <div className="space-y-3">
      <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3">
        <p className="text-[10px] font-black uppercase text-violet-600">manual values</p>
        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">{derived.prediction}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {config.controls.map((spec) => (
          <ManualNumberInput
            key={spec.key}
            label={spec.label}
            ariaLabel={spec.ariaLabel}
            value={vars[spec.key]}
            min={spec.min}
            max={spec.max}
            step={spec.step}
            tone={spec.tone}
            onChange={(value) => updateVar(spec, value)}
          />
        ))}
        <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700">
          {derived.mainLabel}
          <br />
          <span className="font-mono text-base">{formatNumber(derived.mainValue, 3)}</span>
        </span>
      </div>
    </div>
  );

  const metrics: SimulationMetric[] = [
    { label: derived.mainLabel, value: `${formatNumber(derived.mainValue, 3)} ${derived.mainUnit}`.trim(), tone: config.accent },
    { label: derived.secondaryLabel, value: `${formatNumber(derived.secondaryValue, 3)} ${derived.secondaryUnit}`.trim(), tone: "cyan" },
    { label: derived.tertiaryLabel, value: `${formatNumber(derived.tertiaryValue, 3)} ${derived.tertiaryUnit}`.trim(), tone: "orange" },
    { label: "runs", value: `${runs.length} saved`, tone: "emerald" },
  ];

  return (
    <SharedSimulationShell
      accent={config.accent}
      labId={labId}
      category="Mathematics"
      title={config.title}
      subtitle={config.subtitle}
      statusLabel="Interactive simulation ready"
      icon={config.icon}
      sceneTitle={config.sceneTitle}
      scene={<AppliedMathStage labId={labId} vars={vars} derived={derived} runs={runs} />}
      controlsTitle={config.controlsTitle}
      controls={controls}
      compactControls={compactControls}
      onRun={handleRecordRun}
      runLabel="ทดลอง"
      onReset={handleReset}
      drawerSummary={drawerSummary}
      metrics={metrics}
      graph={<MiniAppliedGraph derived={derived} accent={config.accent} />}
      table={<AppliedResultsTable runs={runs} derived={derived} onCopyData={handleCopyData} onExportCsv={handleExportCsv} />}
      theory={<TheoryPanel derived={derived} config={config} />}
      steps={[
        { label: "ตั้งค่าพารามิเตอร์หลัก", icon: Sliders },
        { label: "อ่านผลจาก SVG stage", icon: Gauge },
        { label: "เทียบค่ากับกราฟ", icon: LineChart },
        { label: "บันทึก run ลงตาราง", icon: Save },
        { label: "สรุปด้วยสมการ", icon: Calculator },
      ]}
      learningGoals={config.goals}
      progressLabel={derived.progressLabel}
      progressValue={derived.progressValue}
      progressPercent={derived.progressPercent}
      tips={config.tips}
      onSave={handleSaveResults}
    />
  );
}
