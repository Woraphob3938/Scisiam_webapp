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
  const isLeChateliers = labId === "le-chateliers-principle";
  const isBeerLambert = labId === "beer-lambert-law";
  const isHesssLaw = labId === "hesss-law";
  const isGalvanicCell = labId === "galvanic-cell";
  const isChemicalKinetics = labId === "chemical-kinetics";
  const isSolubilityProduct = labId === "solubility-product";
  const isAvogadrosLaw = labId === "avogadros-law";
  const isElectrolysis = labId === "electrolysis-lab";
  const isColligative = labId === "colligative-properties";
  const isSnellsLaw = labId === "snells-law";
  const isIdealGas = labId === "ideal-gas-law";
  const isNewtonsSecond = labId === "newtons-second-law";

  const coolingSteps = [
    {
      num: 1,
      title: "เตรียมน้ำร้อน",
      desc: "เตรียมน้ำร้อนในบีกเกอร์ และวัดอุณหภูมิเริ่มต้น (T₀)",
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

  const snellsLawSteps = [
    {
      num: 1,
      title: "ตั้งค่าดัชนีหักเหตัวกลาง",
      desc: "กำหนดดัชนีหักเหตัวกลางที่ 1 (n₁) และ 2 (n₂)",
      icon: Sliders,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "หมุนมุมตกกระทบ",
      desc: "ปรับตั้งค่ามุมตกกระทบ θ₁ ของเลเซอร์ตามระยะสายตา",
      icon: Sliders,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      num: 3,
      title: "วัดและอ่านมุมหักเห",
      desc: "อ่านค่ามุมหักเห θ₂ บนจานวัดองศา หรือสังเกตการสะท้อนกลับหมด (TIR)",
      icon: Ruler,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "วิเคราะห์ความชันเส้นไซน์",
      desc: "บันทึกจุดทดลองเพื่อวิเคราะห์ดัชนีหักเหเฉลี่ยผ่านกราฟไซน์",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const idealGasSteps = [
    {
      num: 1,
      title: "ตั้งค่าปริมาณโมลแก๊ส n",
      desc: "กำหนดระดับจำนวนโมลโมเลกุลแก๊สที่จะใช้ในการวัดอุณหพลศาสตร์",
      icon: Sliders,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      num: 2,
      title: "ปรับปริมาตรกระบอกสูบ V",
      desc: "ปรับระดับลูกสูบเพื่อเปลี่ยนปริมาตรความจุภายในปิด",
      icon: Sliders,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 3,
      title: "ควบคุมระดับความร้อน T",
      desc: "เพิ่มหรือลดอุณหภูมิสัมบูรณ์ (T) และสังเกตการเคลื่อนของโมเลกุล",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      num: 4,
      title: "ตรวจสอบความดัน P",
      desc: "อ่านค่าเกจวัดความดัน (P) และพล็อตกราฟเพื่อพิสูจน์ PV = nRT",
      icon: Gauge,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const momentumSteps = [
    {
      num: 1,
      title: "เตรียมรถเข็นชนแนวตรง",
      desc: "จัดรถเข็น 1 และ 2 บนรางไม้ ตรวจสอบระดับให้ราบเรียบเสมอกัน",
      icon: Ruler,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "ปรับมวลและความเร็วต้น",
      desc: "กำหนดมวลรถเข็น (m1, m2) และค่าความเร็วเริ่มต้น (u1, u2) ในระบบ",
      icon: Sliders,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      num: 3,
      title: "ชนและดักจับความเร็ว",
      desc: "สั่งให้รถทดลองชนกัน สังเกตการเปลี่ยนความเร็วหลังชนยืดหยุ่น/ไร้ยืดหยุ่น",
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "ตรวจสอบผลโมเมนตัมรวม",
      desc: "วิเคราะห์กราฟเปรียบเทียบผลรวมโมเมนตัมก่อนและหลังชนเพื่อยืนยันกฎ",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const faradaySteps = [
    {
      num: 1,
      title: "จัดขดลวดเหนี่ยวนำ",
      desc: "เลือกจำนวนรอบของขดลวดเหนี่ยวนำนำกระแส (1-3 รอบขด)",
      icon: Sliders,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "เตรียมแท่งแม่เหล็ก",
      desc: "ตั้งค่าระดับความเข้มสนามแม่เหล็กและความพร้อมเชื่อมโยงโวลต์มิเตอร์",
      icon: Zap,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      num: 3,
      title: "สไลด์แม่เหล็กเข้า-ออก",
      desc: "เคลื่อนแท่งแม่เหล็กผ่านขดลวดเพื่อเหนี่ยวนำกระแสไฟฟ้าและวัดผลไฟฟ้า",
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "วิเคราะห์ทิศทางแรงดัน",
      desc: "ตรวจดูความถี่ของทิศทางเข็มโวลต์มิเตอร์และการเปลี่ยนระดับแสงเหนี่ยวนำ",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const bernoulliSteps = [
    {
      num: 1,
      title: "เปิดระบบน้ำและปรับอัตราไหล",
      desc: "เริ่มจ่ายกระแสน้ำเข้าท่อเวนทูรี ปรับเปลี่ยนอัตราการไหล Q ลิตร/วินาที",
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "บีบหน้าตัดคอคอด",
      desc: "ปรับขนาดเส้นผ่านศูนย์กลางจุดบีบแคบของท่อเพื่อเปลี่ยนอัตราความเร็ว",
      icon: Sliders,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      num: 3,
      title: "ตรวจเกจวัดความดัน",
      desc: "อ่านค่าระดับความเร็วและความดันจุดแคบ-กว้างผ่านท่อแก้วเกจมาโนมิเตอร์",
      icon: Gauge,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "ประเมินสมดุล Bernoulli",
      desc: "วิเคราะห์สมการพลังงานไหลเพื่อพิสูจน์จุดที่มีความเร็วสูงจะมีแรงดันลดลง",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const photoelectricSteps = [
    {
      num: 1,
      title: "เลือกเป้าหมายผิวโลหะ",
      desc: "เลือกชนิดโลหะ Cathode (เช่น โซเดียม, ซิงก์, ทองแดง) เพื่อรับแสง",
      icon: Sliders,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "ฉายโฟตอนคลื่นเดี่ยว",
      desc: "ปรับความยาวคลื่นแสงและความเข้มแสงเพื่อฉายรังสีให้มีพลังงานสูงกว่าฟังก์ชันงาน",
      icon: Sun,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      num: 3,
      title: "วัดกระแสแอมมิเตอร์",
      desc: "วัดกระแสโฟโตอิเล็กตรอนที่เกิดขึ้น และปรับแรงดันต้านย้อนกลับ",
      icon: Zap,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "หา Stopping Voltage",
      desc: "บันทึกและพล็อตกราฟพลังงานจลน์สูงสุดตามความถี่แสงเพื่อตรวจสอบค่าคงที่พลังค์",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const keplerSteps = [
    {
      num: 1,
      title: "กำหนดวงโคจรรีดวงดาว",
      desc: "ตั้งค่าขนาดกึ่งแกนเอก (a) และความรีวงโคจรดาวเคราะห์ (e) รอบดวงอาทิตย์",
      icon: Sliders,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "สังเกตความเร็วการโคจร",
      desc: "ดูอัตราความเร็วขณะเคลื่อนผ่านใกล้ Perihelion และไกล Aphelion",
      icon: Activity,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      num: 3,
      title: "วัดคาบโคจรครบรอบ",
      desc: "จับเวลาที่ใช้ในการเคลื่อนที่ครบรอบปีการโคจรของดาวเคราะห์จำลอง",
      icon: Timer,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "พิสูจน์กฎ Kepler ข้อที่ 3",
      desc: "เปรียบเทียบสัดส่วนกำลังสองของคาบต่อกำลังสามของระยะว่าคงที่ตามทฤษฎีหรือไม่",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const stefanBoltzmannSteps = [
    {
      num: 1,
      title: "ปรับอุณหภูมิผิวสัมบูรณ์",
      desc: "ตั้งค่าอุณหภูมิเคลวินของเตาอบวัตถุดำหรือดวงดาวจำลองแผ่ความร้อน",
      icon: Flame,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "ปรับพื้นที่ผิวแผ่รังสี",
      desc: "ปรับขนาดรัศมีผิวของดาวเคราะห์เพื่อวิเคราะห์ผลกระทบต่ออัตราแผ่พลังงานรวม",
      icon: Sliders,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      num: 3,
      title: "วัดความเข้มและกำลังแผ่",
      desc: "วัดค่าความหนาแน่นกำลังการแผ่รังสีเทียบตามเวลาจริงผ่านตัววัดพลังงานความร้อน",
      icon: Zap,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "วิเคราะห์กราฟกำลังสี่",
      desc: "ตรวจสอบกราฟสเปกตรัมแสงและคำนวณอัตราความชันพิสูจน์ความสัมพันธ์ T^4",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const newtonsSecondSteps = [
    {
      num: 1,
      title: "ตั้งรถเข็นบนรางทดลอง",
      desc: "จัดเตรียมรถเข็นมวล m ให้อยู่ที่ตำแหน่งเริ่มต้นและตรวจสอบรางราบ",
      icon: Ruler,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      num: 2,
      title: "ปรับค่ามวลและแรงดึง",
      desc: "กำหนดมวลรถ (m) และแขวนตุ้มน้ำหนักลากคงที่เพื่อสร้างแรงลัพธ์ (F)",
      icon: Sliders,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 3,
      title: "ปล่อยรถวิ่งจับเวลา",
      desc: "ปล่อยรถเข็นวิ่งและบันทึกเวลาผ่านเซนเซอร์คู่ Photogate A และ B",
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "สรุปอัตราความชัน",
      desc: "พล็อตกราฟความชันระหว่างความเร่งและแรงเพื่อพิสูจน์กฎข้อสอง",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const leChateliersSteps = [
    {
      num: 1,
      title: "เตรียมสารตั้งต้น Fe³⁺ และ SCN⁻",
      desc: "ผสม FeCl₃ และ KSCN เจือจางในบีกเกอร์ เพื่อให้สารละลายเกิดสีแดงจาง ๆ ของสมดุลควบคุม",
      icon: FlaskConical,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      num: 2,
      title: "รบกวนโดยเพิ่มความเข้มข้น",
      desc: "หยด FeCl₃ หรือ KSCN เพิ่มเติม สังเกตการเลื่อนตัวของสมดุลและสีแดงที่เข้มขึ้น",
      icon: Droplets,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      num: 3,
      title: "รบกวนโดยลดสาร (เติม NaF)",
      desc: "หยด NaF เพื่อทำลาย Fe³⁺ ในระบบ สังเกตสีแดงที่เจือจางลงเนื่องจากสมดุลเลื่อนกลับทางซ้าย",
      icon: Zap,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 4,
      title: "ปรับอุณหภูมิควบคุม",
      desc: "แช่หลอดทดลองในอ่างน้ำร้อน/เย็น สังเกตการเปลี่ยนแปลงเพื่อระบุว่าปฏิกิริยาเป็นดูดหรือคายความร้อน",
      icon: Thermometer,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  const beerLambertSteps = [
    {
      num: 1,
      title: "เลือกสารละลายและ Blank",
      desc: "เลือกชนิดสารละลายเกลือโลหะ ปรับความยาวคลื่นดูดกลืนแสงสูงสุด และคาลิเบรตด้วยน้ำกลั่น",
      icon: Sliders,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "วัดสารมาตรฐานความเข้มข้นสูง",
      desc: "ใส่คิวเวตต์สารละลายความเข้มข้นสูงสุด บันทึกค่าความดูดกลืนแสง (A)",
      icon: FlaskConical,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      num: 3,
      title: "สร้างกราฟมาตรฐาน (Calibration)",
      desc: "เจือจางความเข้มข้นทีละระดับ วัดและสร้างกราฟความสัมพันธ์เชิงเส้นระหว่าง A และ C",
      icon: LineChart,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "หาความเข้มข้นตัวอย่าง",
      desc: "วัดสารละลายตัวอย่างไม่ทราบความเข้มข้น นำมาคำนวณผ่านกฎเบียร์-ลัมเบิร์ตหาความเข้มข้นจริง",
      icon: ClipboardList,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const hesssLawSteps = [
    {
      num: 1,
      title: "ทดลองขั้นที่ 1 (ปฏิกิริยาโดยตรง)",
      desc: "ทำปฏิกิริยาระหว่าง NaOH(s) และ HCl(aq) ในถ้วยโฟม บันทึกอุณหภูมิที่เพิ่มขึ้น หาค่า ΔH₁",
      icon: Thermometer,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      num: 2,
      title: "ทดลองขั้นที่ 2 (การละลาย)",
      desc: "ละลาย NaOH(s) ในน้ำกลั่น บันทึกอุณหภูมิที่เปลี่ยนแปลง คำนวณความร้อนละลายหาค่า ΔH₂",
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 3,
      title: "ทดลองขั้นที่ 3 (สะเทินกรด-เบส)",
      desc: "ทำปฏิกิริยาระหว่างสารละลาย NaOH(aq) ที่ได้กับสารละลาย HCl(aq) บันทึก ΔH₃",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      num: 4,
      title: "ตรวจสอบกฎของเฮสส์",
      desc: "ตรวจสอบความสัมพันธ์ ΔH₁ ≈ ΔH₂ + ΔH₃ เพื่อพิสูจน์การอนุรักษ์พลังงานในวัฏจักรปฏิกิริยา",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const galvanicCellSteps = [
    {
      num: 1,
      title: "ประกอบครึ่งเซลล์",
      desc: "เตรียมแผ่น Zn/Cu ในสารละลายไอออนของโลหะและแยกเป็นสองครึ่งเซลล์",
      icon: FlaskConical,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      num: 2,
      title: "ต่อสะพานเกลือ",
      desc: "เชื่อมครึ่งเซลล์ด้วยสะพานเกลือเพื่อรักษาสมดุลประจุของสารละลาย",
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 3,
      title: "วัดแรงดันไฟฟ้า",
      desc: "ต่อโวลต์มิเตอร์กับขั้วไฟฟ้าและบันทึกค่า Ecell ที่เกิดจากปฏิกิริยารีดอกซ์",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      num: 4,
      title: "วิเคราะห์สมการเนิร์นสต์",
      desc: "เปรียบเทียบค่าแรงดันเมื่อเปลี่ยนความเข้มข้นไอออนและคำนวณผลของ Q",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const chemicalKineticsSteps = [
    {
      num: 1,
      title: "กำหนดตัวแปรควบคุม",
      desc: "เลือกความเข้มข้น อุณหภูมิ และตัวเร่งปฏิกิริยาที่ต้องการทดสอบทีละปัจจัย",
      icon: Sliders,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "เริ่มปฏิกิริยาและจับเวลา",
      desc: "ผสมสารตั้งต้นแล้วจับเวลาจนถึงจุดสังเกต เช่น สีหรือความขุ่นถึงระดับกำหนด",
      icon: Timer,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      num: 3,
      title: "บันทึกข้อมูลอัตรา",
      desc: "คำนวณอัตราโดยประมาณจากการเปลี่ยนแปลงความเข้มข้นหรือสัญญาณต่อเวลา",
      icon: ClipboardList,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "หาแนวโน้มและอันดับปฏิกิริยา",
      desc: "พล็อตกราฟ rate กับความเข้มข้นเพื่อสรุปผลตามทฤษฎีการชน",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const solubilityProductSteps = [
    {
      num: 1,
      title: "เตรียมสารละลายไอออน",
      desc: "เตรียมสารละลายไอออนบวกและไอออนลบที่ทราบความเข้มข้นสำหรับสร้างตะกอน",
      icon: Droplets,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      num: 2,
      title: "ผสมและสังเกตตะกอน",
      desc: "ผสมสารทีละอัตราส่วน สังเกตความขุ่นหรือการเกิดตะกอนเมื่อ Qsp เกิน Ksp",
      icon: FlaskConical,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      num: 3,
      title: "คำนวณ Qsp",
      desc: "คำนวณผลคูณความเข้มข้นไอออนยกกำลังสัมประสิทธิ์ตามสมการการละลาย",
      icon: ClipboardList,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 4,
      title: "เปรียบเทียบกับ Ksp",
      desc: "สรุปว่าสารละลายไม่อิ่มตัว อิ่มตัว หรือเกิดตะกอนจากความสัมพันธ์ Qsp/Ksp",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const avogadrosLawSteps = [
    {
      num: 1,
      title: "ชั่งสารตั้งต้น",
      desc: "ชั่งสารที่ใช้ผลิตแก๊สและคำนวณจำนวนโมลจากมวลโมลาร์",
      icon: Ruler,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "เก็บแก๊สที่เกิดขึ้น",
      desc: "ปล่อยให้ปฏิกิริยาเกิดในระบบปิดและเก็บแก๊สเข้าสู่กระบอกวัดปริมาตร",
      icon: Gauge,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      num: 3,
      title: "ปรับเทียบสภาวะ STP",
      desc: "ใช้ค่าอุณหภูมิและความดันเพื่อแปลงปริมาตรกลับสู่สภาวะมาตรฐาน",
      icon: Thermometer,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      num: 4,
      title: "หาปริมาตรต่อโมล",
      desc: "คำนวณปริมาตรแก๊สต่อ 1 โมลและเปรียบเทียบกับค่า 22.4 L/mol ที่ STP",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const electrolysisSteps = [
    {
      num: 1,
      title: "เตรียมเซลล์อิเล็กโทรไลซิส",
      desc: "ใส่สารละลายอิเล็กโทรไลต์และจัดตำแหน่งแอโนด-แคโทดให้ถูกต้อง",
      icon: FlaskConical,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      num: 2,
      title: "ตั้งกระแสและเวลา",
      desc: "กำหนดกระแสไฟฟ้าและระยะเวลาการชุบเพื่อควบคุมประจุรวม Q = It",
      icon: Zap,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 3,
      title: "สังเกตการเคลือบโลหะ",
      desc: "ดูการเกิดชั้นโลหะที่แคโทดและการเปลี่ยนแปลงของแอโนดระหว่างทดลอง",
      icon: Activity,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      num: 4,
      title: "คำนวณมวลที่ชุบ",
      desc: "ใช้กฎของฟาราเดย์ m = ItM/nF เพื่อเปรียบเทียบมวลทฤษฎีกับผลทดลอง",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const colligativeSteps = [
    {
      num: 1,
      title: "วัดตัวทำละลายบริสุทธิ์",
      desc: "บันทึกจุดเยือกแข็งหรือจุดเดือดของตัวทำละลายก่อนเติมตัวละลาย",
      icon: Thermometer,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      num: 2,
      title: "เตรียมสารละลายโมลาล",
      desc: "ชั่งตัวละลายและคำนวณโมลาลิตีจากโมลตัวละลายต่อกิโลกรัมตัวทำละลาย",
      icon: ClipboardList,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      num: 3,
      title: "วัดการเปลี่ยนจุดเดือด/เยือกแข็ง",
      desc: "ควบคุมอุณหภูมิและบันทึกค่า ΔTf หรือ ΔTb ของสารละลาย",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      num: 4,
      title: "วิเคราะห์ van't Hoff factor",
      desc: "เปรียบเทียบผลของตัวละลายแตกตัวและไม่แตกตัวผ่านค่า i ในสมการสมบัติคอลลิเกทีฟ",
      icon: LineChart,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const isHookesLaw = labId === "hookes-law";
  const isMomentum = labId === "momentum-conservation";
  const isFaradaysLaw = labId === "faradays-law";
  const isBernoulli = labId === "bernoullis-principle";
  const isPhotoelectric = labId === "photoelectric-effect";
  const isKepler = labId === "keplers-laws";
  const isStefanBoltzmann = labId === "stefan-boltzmann";
  const steps = isMitosis
    ? mitosisSteps
    : isMendelian
    ? mendelianSteps
    : isPhotosynthesis
    ? photosynthesisSteps
    : isCharlesLaw
    ? charlesLawSteps
    : isBoylesLaw
    ? boylesLawSteps
    : isAcidBase
    ? acidBaseSteps
    : isLeChateliers
    ? leChateliersSteps
    : isBeerLambert
    ? beerLambertSteps
    : isHesssLaw
    ? hesssLawSteps
    : isGalvanicCell
    ? galvanicCellSteps
    : isChemicalKinetics
    ? chemicalKineticsSteps
    : isSolubilityProduct
    ? solubilityProductSteps
    : isAvogadrosLaw
    ? avogadrosLawSteps
    : isElectrolysis
    ? electrolysisSteps
    : isColligative
    ? colligativeSteps
    : isHookesLaw
    ? hookesLawSteps
    : isOhmsLaw
    ? ohmsLawSteps
    : isSnellsLaw
    ? snellsLawSteps
    : isIdealGas
    ? idealGasSteps
    : isNewtonsSecond
    ? newtonsSecondSteps
    : isMomentum
    ? momentumSteps
    : isFaradaysLaw
    ? faradaySteps
    : isBernoulli
    ? bernoulliSteps
    : isPhotoelectric
    ? photoelectricSteps
    : isKepler
    ? keplerSteps
    : isStefanBoltzmann
    ? stefanBoltzmannSteps
    : coolingSteps;

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
                <p className="text-[11px] text-slate-600 font-semibold max-w-[150px] leading-[1.55]">
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
                <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-[1.55] mt-0.5">
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
