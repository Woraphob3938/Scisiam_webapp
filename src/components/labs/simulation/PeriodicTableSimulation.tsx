"use client";

import React, { memo, useMemo, useState } from "react";
import {
  Atom,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  RotateCcw,
  Search,
  Target,
} from "lucide-react";

import SharedSimulationShell from "@/components/labs/simulation/SharedSimulationShell";

type ElementCategory =
  | "alkali"
  | "alkaline"
  | "transition"
  | "postTransition"
  | "metalloid"
  | "nonmetal"
  | "noble";

type ElementData = {
  atomicNumber: number;
  symbol: string;
  name: string;
  mass: string;
  group: number;
  period: number;
  column?: number;
  row?: number;
  series?: "lanthanide" | "actinide";
  category: ElementCategory;
  state: "ของแข็ง" | "ของเหลว" | "แก๊ส";
  use: string;
};

const categoryInfo: Record<
  ElementCategory,
  { label: string; short: string; color: string; soft: string; hex: string; description: string }
> = {
  alkali: {
    label: "โลหะแอลคาไล",
    short: "Alkali",
    color: "bg-rose-500 text-white border-rose-300",
    soft: "bg-rose-50 text-rose-700 border-rose-100",
    hex: "#f43f5e",
    description: "โลหะหมู่ 1 ว่องไวต่อปฏิกิริยา ให้ไอออน +1 ได้ง่าย เช่น Li, Na, K",
  },
  alkaline: {
    label: "โลหะแอลคาไลน์เอิร์ท",
    short: "Alkaline",
    color: "bg-orange-500 text-white border-orange-300",
    soft: "bg-orange-50 text-orange-700 border-orange-100",
    hex: "#f97316",
    description: "โลหะหมู่ 2 แข็งกว่าแอลคาไลและมักเกิดไอออน +2 เช่น Mg, Ca",
  },
  transition: {
    label: "โลหะทรานซิชัน/ชั้นใน",
    short: "Transition",
    color: "bg-sky-500 text-white border-sky-300",
    soft: "bg-sky-50 text-sky-700 border-sky-100",
    hex: "#0ea5e9",
    description: "โลหะบริเวณกลางตาราง นำไฟฟ้าดี มีหลายเลขออกซิเดชัน เช่น Fe, Cu, Zn",
  },
  postTransition: {
    label: "โลหะหลังทรานซิชัน",
    short: "Post-metal",
    color: "bg-indigo-500 text-white border-indigo-300",
    soft: "bg-indigo-50 text-indigo-700 border-indigo-100",
    hex: "#6366f1",
    description: "โลหะที่นิ่มกว่าและมีสมบัติผสมระหว่างโลหะกับกึ่งโลหะ เช่น Al, Ga",
  },
  metalloid: {
    label: "กึ่งโลหะ",
    short: "Metalloid",
    color: "bg-amber-500 text-white border-amber-300",
    soft: "bg-amber-50 text-amber-700 border-amber-100",
    hex: "#f59e0b",
    description: "ธาตุที่มีสมบัติก้ำกึ่งระหว่างโลหะและอโลหะ หลายชนิดเป็นสารกึ่งตัวนำ เช่น Si, Ge",
  },
  nonmetal: {
    label: "อโลหะ",
    short: "Nonmetal",
    color: "bg-emerald-500 text-white border-emerald-300",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-100",
    hex: "#10b981",
    description: "ไม่นำไฟฟ้าดีเท่าโลหะ หลายชนิดพบเป็นแก๊สหรือโมเลกุล เช่น H, C, O, Cl",
  },
  noble: {
    label: "แก๊สมีตระกูล",
    short: "Noble gas",
    color: "bg-violet-500 text-white border-violet-300",
    soft: "bg-violet-50 text-violet-700 border-violet-100",
    hex: "#8b5cf6",
    description: "ธาตุหมู่ 18 เสถียรและทำปฏิกิริยายาก เพราะชั้นเวเลนซ์เต็ม เช่น He, Ne, Ar",
  },
};

type ElementRecord = readonly [
  atomicNumber: number,
  symbol: string,
  name: string,
  mass: string,
  group: number,
  period: number,
  column?: number,
  row?: number,
  series?: "lanthanide" | "actinide",
];

const elementRecords: ElementRecord[] = [
  [1, "H", "ไฮโดรเจน", "1.008", 1, 1], [2, "He", "ฮีเลียม", "4.003", 18, 1],
  [3, "Li", "ลิเทียม", "6.94", 1, 2], [4, "Be", "เบริลเลียม", "9.012", 2, 2], [5, "B", "โบรอน", "10.81", 13, 2], [6, "C", "คาร์บอน", "12.01", 14, 2], [7, "N", "ไนโตรเจน", "14.01", 15, 2], [8, "O", "ออกซิเจน", "16.00", 16, 2], [9, "F", "ฟลูออรีน", "19.00", 17, 2], [10, "Ne", "นีออน", "20.18", 18, 2],
  [11, "Na", "โซเดียม", "22.99", 1, 3], [12, "Mg", "แมกนีเซียม", "24.31", 2, 3], [13, "Al", "อะลูมิเนียม", "26.98", 13, 3], [14, "Si", "ซิลิคอน", "28.09", 14, 3], [15, "P", "ฟอสฟอรัส", "30.97", 15, 3], [16, "S", "กำมะถัน", "32.06", 16, 3], [17, "Cl", "คลอรีน", "35.45", 17, 3], [18, "Ar", "อาร์กอน", "39.95", 18, 3],
  [19, "K", "โพแทสเซียม", "39.10", 1, 4], [20, "Ca", "แคลเซียม", "40.08", 2, 4], [21, "Sc", "สแกนเดียม", "44.96", 3, 4], [22, "Ti", "ไทเทเนียม", "47.87", 4, 4], [23, "V", "วาเนเดียม", "50.94", 5, 4], [24, "Cr", "โครเมียม", "52.00", 6, 4], [25, "Mn", "แมงกานีส", "54.94", 7, 4], [26, "Fe", "เหล็ก", "55.85", 8, 4], [27, "Co", "โคบอลต์", "58.93", 9, 4], [28, "Ni", "นิกเกิล", "58.69", 10, 4], [29, "Cu", "ทองแดง", "63.55", 11, 4], [30, "Zn", "สังกะสี", "65.38", 12, 4], [31, "Ga", "แกลเลียม", "69.72", 13, 4], [32, "Ge", "เจอร์เมเนียม", "72.63", 14, 4], [33, "As", "สารหนู", "74.92", 15, 4], [34, "Se", "ซีลีเนียม", "78.97", 16, 4], [35, "Br", "โบรมีน", "79.90", 17, 4], [36, "Kr", "คริปทอน", "83.80", 18, 4],
  [37, "Rb", "รูบิเดียม", "85.47", 1, 5], [38, "Sr", "สตรอนเชียม", "87.62", 2, 5], [39, "Y", "อิตเทรียม", "88.91", 3, 5], [40, "Zr", "เซอร์โคเนียม", "91.22", 4, 5], [41, "Nb", "ไนโอเบียม", "92.91", 5, 5], [42, "Mo", "โมลิบดีนัม", "95.95", 6, 5], [43, "Tc", "เทคนีเชียม", "[98]", 7, 5], [44, "Ru", "รูทีเนียม", "101.07", 8, 5], [45, "Rh", "โรเดียม", "102.91", 9, 5], [46, "Pd", "แพลเลเดียม", "106.42", 10, 5], [47, "Ag", "เงิน", "107.87", 11, 5], [48, "Cd", "แคดเมียม", "112.41", 12, 5], [49, "In", "อินเดียม", "114.82", 13, 5], [50, "Sn", "ดีบุก", "118.71", 14, 5], [51, "Sb", "พลวง", "121.76", 15, 5], [52, "Te", "เทลลูเรียม", "127.60", 16, 5], [53, "I", "ไอโอดีน", "126.90", 17, 5], [54, "Xe", "ซีนอน", "131.29", 18, 5],
  [55, "Cs", "ซีเซียม", "132.91", 1, 6], [56, "Ba", "แบเรียม", "137.33", 2, 6], [57, "La", "แลนทานัม", "138.91", 3, 6], [58, "Ce", "ซีเรียม", "140.12", 3, 6, 4, 8, "lanthanide"], [59, "Pr", "เพรซีโอดิเมียม", "140.91", 3, 6, 5, 8, "lanthanide"], [60, "Nd", "นีโอดิเมียม", "144.24", 3, 6, 6, 8, "lanthanide"], [61, "Pm", "โพรมีเทียม", "[145]", 3, 6, 7, 8, "lanthanide"], [62, "Sm", "ซาแมเรียม", "150.36", 3, 6, 8, 8, "lanthanide"], [63, "Eu", "ยูโรเพียม", "151.96", 3, 6, 9, 8, "lanthanide"], [64, "Gd", "แกโดลิเนียม", "157.25", 3, 6, 10, 8, "lanthanide"], [65, "Tb", "เทอร์เบียม", "158.93", 3, 6, 11, 8, "lanthanide"], [66, "Dy", "ดิสโพรเซียม", "162.50", 3, 6, 12, 8, "lanthanide"], [67, "Ho", "โฮลเมียม", "164.93", 3, 6, 13, 8, "lanthanide"], [68, "Er", "เออร์เบียม", "167.26", 3, 6, 14, 8, "lanthanide"], [69, "Tm", "ทูเลียม", "168.93", 3, 6, 15, 8, "lanthanide"], [70, "Yb", "อิตเทอร์เบียม", "173.05", 3, 6, 16, 8, "lanthanide"], [71, "Lu", "ลูทีเชียม", "174.97", 3, 6, 17, 8, "lanthanide"],
  [72, "Hf", "แฮฟเนียม", "178.49", 4, 6], [73, "Ta", "แทนทาลัม", "180.95", 5, 6], [74, "W", "ทังสเตน", "183.84", 6, 6], [75, "Re", "รีเนียม", "186.21", 7, 6], [76, "Os", "ออสเมียม", "190.23", 8, 6], [77, "Ir", "อิริเดียม", "192.22", 9, 6], [78, "Pt", "แพลทินัม", "195.08", 10, 6], [79, "Au", "ทองคำ", "196.97", 11, 6], [80, "Hg", "ปรอท", "200.59", 12, 6], [81, "Tl", "แทลเลียม", "204.38", 13, 6], [82, "Pb", "ตะกั่ว", "207.2", 14, 6], [83, "Bi", "บิสมัท", "208.98", 15, 6], [84, "Po", "โพโลเนียม", "[209]", 16, 6], [85, "At", "แอสทาทีน", "[210]", 17, 6], [86, "Rn", "เรดอน", "[222]", 18, 6],
  [87, "Fr", "แฟรนเซียม", "[223]", 1, 7], [88, "Ra", "เรเดียม", "[226]", 2, 7], [89, "Ac", "แอกทิเนียม", "[227]", 3, 7], [90, "Th", "ทอเรียม", "232.04", 3, 7, 4, 9, "actinide"], [91, "Pa", "โพรแทกทิเนียม", "231.04", 3, 7, 5, 9, "actinide"], [92, "U", "ยูเรเนียม", "238.03", 3, 7, 6, 9, "actinide"], [93, "Np", "เนปทูเนียม", "[237]", 3, 7, 7, 9, "actinide"], [94, "Pu", "พลูโตเนียม", "[244]", 3, 7, 8, 9, "actinide"], [95, "Am", "อะเมริเซียม", "[243]", 3, 7, 9, 9, "actinide"], [96, "Cm", "คูเรียม", "[247]", 3, 7, 10, 9, "actinide"], [97, "Bk", "เบอร์คีเลียม", "[247]", 3, 7, 11, 9, "actinide"], [98, "Cf", "แคลิฟอร์เนียม", "[251]", 3, 7, 12, 9, "actinide"], [99, "Es", "ไอน์สไตเนียม", "[252]", 3, 7, 13, 9, "actinide"], [100, "Fm", "เฟอร์เมียม", "[257]", 3, 7, 14, 9, "actinide"], [101, "Md", "เมนเดลีเวียม", "[258]", 3, 7, 15, 9, "actinide"], [102, "No", "โนเบเลียม", "[259]", 3, 7, 16, 9, "actinide"], [103, "Lr", "ลอว์เรนเซียม", "[266]", 3, 7, 17, 9, "actinide"],
  [104, "Rf", "รัทเทอร์ฟอร์เดียม", "[267]", 4, 7], [105, "Db", "ดับเนียม", "[268]", 5, 7], [106, "Sg", "ซีบอร์เกียม", "[269]", 6, 7], [107, "Bh", "โบห์เรียม", "[270]", 7, 7], [108, "Hs", "ฮัสเซียม", "[277]", 8, 7], [109, "Mt", "ไมต์เนเรียม", "[278]", 9, 7], [110, "Ds", "ดาร์มสตัดเทียม", "[281]", 10, 7], [111, "Rg", "เรินต์เกเนียม", "[282]", 11, 7], [112, "Cn", "โคเปอร์นิเซียม", "[285]", 12, 7], [113, "Nh", "นิโฮเนียม", "[286]", 13, 7], [114, "Fl", "ฟลีโรเวียม", "[289]", 14, 7], [115, "Mc", "มอสโกเวียม", "[290]", 15, 7], [116, "Lv", "ลิเวอร์มอเรียม", "[293]", 16, 7], [117, "Ts", "เทนเนสซีน", "[294]", 17, 7], [118, "Og", "โอกาเนสซอน", "[294]", 18, 7],
];

const symbolSet = (...symbols: string[]) => new Set(symbols);
const alkaliSymbols = symbolSet("Li", "Na", "K", "Rb", "Cs", "Fr");
const alkalineSymbols = symbolSet("Be", "Mg", "Ca", "Sr", "Ba", "Ra");
const nobleSymbols = symbolSet("He", "Ne", "Ar", "Kr", "Xe", "Rn", "Og");
const metalloidSymbols = symbolSet("B", "Si", "Ge", "As", "Sb", "Te", "Po");
const postTransitionSymbols = symbolSet("Al", "Ga", "In", "Sn", "Tl", "Pb", "Bi", "Nh", "Fl", "Mc", "Lv");
const nonmetalSymbols = symbolSet("H", "C", "N", "O", "F", "P", "S", "Se", "Cl", "Br", "I", "At", "Ts");
const liquidSymbols = symbolSet("Br", "Hg");
const gasSymbols = symbolSet("H", "He", "N", "O", "F", "Ne", "Cl", "Ar", "Kr", "Xe", "Rn", "Og");

const categoryUse: Record<ElementCategory, string> = {
  alkali: "ศึกษาความว่องไวของโลหะหมู่ 1 และการเกิดไอออนบวก",
  alkaline: "เปรียบเทียบสมบัติของโลหะหมู่ 2 ในสารประกอบและแร่ธาตุ",
  transition: "ใช้เรียนแนวโน้มโลหะนำไฟฟ้า สีของสารประกอบ และเลขออกซิเดชัน",
  postTransition: "ใช้เรียนโลหะหลังทรานซิชันในวัสดุ โลหะผสม และอุตสาหกรรม",
  metalloid: "ใช้เชื่อมโยงสมบัติกึ่งโลหะกับสารกึ่งตัวนำและวัสดุอิเล็กทรอนิกส์",
  nonmetal: "ใช้เรียนโครงสร้างโมเลกุล สารประกอบ และบทบาทในสิ่งมีชีวิต",
  noble: "ใช้เรียนความเสถียรของชั้นเวเลนซ์และแก๊สเฉื่อย",
};

const elementUse: Record<string, string> = {
  H: "เชื้อเพลิงสะอาดและสารตั้งต้นในอุตสาหกรรม",
  He: "บอลลูน งานเย็นจัด และเครื่องมือวิทยาศาสตร์",
  Li: "แบตเตอรี่ลิเทียมไอออน",
  C: "โครงสร้างหลักของสารอินทรีย์และสิ่งมีชีวิต",
  N: "บรรยากาศ ปุ๋ย และไนโตรเจนเหลว",
  O: "การหายใจ การเผาไหม้ และการแพทย์",
  Na: "เกลือแกง สารประกอบโซเดียม และงานถ่ายเทความร้อน",
  Mg: "โลหะเบา พลุแสงขาว และแร่ธาตุในร่างกาย",
  Al: "กระป๋อง เครื่องบิน และโครงสร้างน้ำหนักเบา",
  Si: "ชิปคอมพิวเตอร์ เซลล์สุริยะ และแก้ว",
  Cl: "ฆ่าเชื้อในน้ำและผลิตสารประกอบคลอไรด์",
  Fe: "โครงสร้าง เหล็กกล้า และฮีโมโกลบิน",
  Cu: "สายไฟ ท่อ และโลหะผสม",
  Ag: "เครื่องประดับ หน้าสัมผัสไฟฟ้า และสารต้านจุลชีพบางชนิด",
  Au: "เครื่องประดับ อิเล็กทรอนิกส์ และวัสดุนำไฟฟ้าทนกัดกร่อน",
  Hg: "เทอร์โมมิเตอร์แบบเก่าและอุปกรณ์เฉพาะทาง ใช้ด้วยความระมัดระวัง",
  Pb: "แบตเตอรี่ตะกั่วกรดและโล่กันรังสี ใช้ด้วยมาตรการความปลอดภัย",
  U: "เชื้อเพลิงนิวเคลียร์และการศึกษากัมมันตรังสี",
};

function getElementCategory(symbol: string): ElementCategory {
  if (alkaliSymbols.has(symbol)) return "alkali";
  if (alkalineSymbols.has(symbol)) return "alkaline";
  if (nobleSymbols.has(symbol)) return "noble";
  if (metalloidSymbols.has(symbol)) return "metalloid";
  if (postTransitionSymbols.has(symbol)) return "postTransition";
  if (nonmetalSymbols.has(symbol)) return "nonmetal";
  return "transition";
}

function getElementState(symbol: string): ElementData["state"] {
  if (liquidSymbols.has(symbol)) return "ของเหลว";
  if (gasSymbols.has(symbol)) return "แก๊ส";
  return "ของแข็ง";
}

const elements: ElementData[] = elementRecords.map(
  ([atomicNumber, symbol, name, mass, group, period, column, row, series]) => {
    const category = getElementCategory(symbol);

    return {
      atomicNumber,
      symbol,
      name,
      mass,
      group,
      period,
      column,
      row,
      series,
      category,
      state: getElementState(symbol),
      use: elementUse[symbol] ?? categoryUse[category],
    };
  }
);

const categoryKeys = Object.keys(categoryInfo) as ElementCategory[];

function formatCategoryLabel(category: ElementCategory) {
  return categoryInfo[category].label;
}

function formatPosition(element: ElementData) {
  if (element.series === "lanthanide") return `คาบ ${element.period} · กลุ่มแลนทาไนด์`;
  if (element.series === "actinide") return `คาบ ${element.period} · กลุ่มแอกทิไนด์`;
  return `คาบ ${element.period} · หมู่ ${element.group}`;
}

type AppearanceKind = "metal" | "darkMetal" | "gold" | "copper" | "crystal" | "powder" | "liquid" | "gas" | "radioactive";

type ElementAppearance = {
  kind: AppearanceKind;
  label: string;
  gradient: string;
  note: string;
};

const appearanceOverrides: Record<string, Partial<ElementAppearance>> = {
  Li: { kind: "darkMetal", label: "โลหะอ่อนสีเงิน หมองเป็นเทาเข้ม", gradient: "linear-gradient(135deg,#1f2937,#6b7280 48%,#f8fafc)" },
  C: { kind: "darkMetal", label: "คาร์บอนรูปกราไฟต์สีดำ", gradient: "linear-gradient(135deg,#020617,#1f2937,#64748b)" },
  S: { kind: "crystal", label: "ผลึกสีเหลือง", gradient: "linear-gradient(135deg,#fde047,#f59e0b)" },
  Si: { kind: "crystal", label: "ผลึกกึ่งโลหะสีเทา", gradient: "linear-gradient(135deg,#94a3b8,#334155)" },
  Cu: { kind: "copper", label: "โลหะสีส้มแดง", gradient: "linear-gradient(135deg,#fed7aa,#f97316,#9a3412)" },
  Ag: { kind: "metal", label: "โลหะเงินเงา", gradient: "linear-gradient(135deg,#f8fafc,#cbd5e1,#64748b)" },
  Au: { kind: "gold", label: "โลหะทองคำสีเหลือง", gradient: "linear-gradient(135deg,#fef08a,#f59e0b,#92400e)" },
  Hg: { kind: "liquid", label: "โลหะเหลวสีเงิน", gradient: "linear-gradient(135deg,#f8fafc,#94a3b8,#475569)" },
  Br: { kind: "liquid", label: "ของเหลวสีน้ำตาลแดง", gradient: "linear-gradient(135deg,#fb923c,#7c2d12)" },
  I: { kind: "crystal", label: "ผลึกสีม่วงเข้ม", gradient: "linear-gradient(135deg,#c084fc,#581c87,#1e1b4b)" },
  Cl: { kind: "gas", label: "แก๊สสีเขียวอมเหลือง", gradient: "radial-gradient(circle,#bef264,#65a30d 65%,transparent 66%)" },
  O: { kind: "gas", label: "แก๊สใส มีโทนฟ้าในแบบจำลอง", gradient: "radial-gradient(circle,#bae6fd,#2563eb 65%,transparent 66%)" },
  U: { kind: "radioactive", label: "โลหะหนักกัมมันตรังสี", gradient: "linear-gradient(135deg,#4d7c0f,#1f2937)" },
};

function getElementAppearance(element: ElementData): ElementAppearance {
  const fallback: ElementAppearance = {
    kind: element.state === "แก๊ส" ? "gas" : element.state === "ของเหลว" ? "liquid" : element.category === "metalloid" ? "crystal" : element.category === "nonmetal" ? "powder" : "metal",
    label: element.state === "แก๊ส" ? "แก๊สในภาชนะจำลอง" : element.state === "ของเหลว" ? "ของเหลวในหลอดทดลอง" : element.category === "metalloid" ? "ผลึกกึ่งโลหะ" : element.category === "nonmetal" ? "ผงหรือผลึกอโลหะ" : "ชิ้นตัวอย่างโลหะ",
    gradient: element.state === "แก๊ส"
      ? `radial-gradient(circle,${categoryInfo[element.category].hex},transparent 66%)`
      : `linear-gradient(135deg,#ffffff,${categoryInfo[element.category].hex})`,
    note: `${formatCategoryLabel(element.category)} · ${formatPosition(element)}`,
  };

  return { ...fallback, ...appearanceOverrides[element.symbol] };
}

function ElementMaterialPreview({ element }: { element: ElementData }) {
  const category = categoryInfo[element.category];
  const appearance = getElementAppearance(element);

  return (
    <div className="rounded-2xl border border-white/80 bg-white/92 p-3 shadow-lg shadow-slate-900/10 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-50" aria-label={`ภาพจำลองรูปลักษณ์ของ ${element.name}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#ffffff,transparent_35%)]" />
          {(appearance.kind === "metal" || appearance.kind === "darkMetal" || appearance.kind === "gold" || appearance.kind === "copper" || appearance.kind === "radioactive") && (
            <div className="relative h-12 w-16 -rotate-6 rounded-[45%_55%_48%_52%] shadow-xl shadow-slate-900/20 ring-1 ring-white/70" style={{ background: appearance.gradient }} />
          )}
          {appearance.kind === "crystal" && (
            <div className="relative h-16 w-16 rotate-12 shadow-xl shadow-slate-900/20 ring-1 ring-white/70 [clip-path:polygon(50%_0%,88%_25%,78%_82%,22%_82%,12%_25%)]" style={{ background: appearance.gradient }} />
          )}
          {appearance.kind === "powder" && (
            <div className="relative flex h-16 w-20 items-end justify-center gap-1">
              {[0, 1, 2, 3, 4].map((item) => (
                <span key={item} className="block rounded-full shadow-sm" style={{ width: 12 + item * 2, height: 12 + item * 2, background: appearance.gradient }} />
              ))}
            </div>
          )}
          {appearance.kind === "liquid" && (
            <div className="relative h-16 w-14 rounded-b-3xl rounded-t-lg border-2 border-slate-300 bg-white/60">
              <div className="absolute bottom-1 left-1 right-1 h-9 rounded-b-2xl rounded-t-[45%]" style={{ background: appearance.gradient }} />
            </div>
          )}
          {appearance.kind === "gas" && (
            <div className="relative h-20 w-20">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <span
                  key={item}
                  className="absolute block rounded-full blur-[1px]"
                  style={{
                    left: `${10 + (item * 13) % 58}%`,
                    top: `${12 + (item * 17) % 54}%`,
                    width: 18 + (item % 3) * 6,
                    height: 18 + (item % 3) * 6,
                    background: appearance.gradient,
                    opacity: 0.72,
                  }}
                />
              ))}
            </div>
          )}
          <span className="absolute bottom-2 right-2 rounded-full bg-white/85 px-2 py-1 text-xs font-black" style={{ color: category.hex }}>{element.symbol}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase text-slate-400">Element sample</p>
          <p className="truncate text-xl font-black text-slate-950">{element.symbol} · {element.name}</p>
          <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
            เลขอะตอม {element.atomicNumber} · มวล {element.mass} · {element.state}
          </p>
          <p className="mt-1 text-xs font-black leading-relaxed" style={{ color: category.hex }}>{appearance.label}</p>
          <p className="text-[11px] font-bold leading-relaxed text-slate-400">{appearance.note}</p>
        </div>
      </div>
    </div>
  );
}

const ElementTile = memo(function ElementTile({
  element,
  isSelected,
  isDimmed,
  onSelectElement,
}: {
  element: ElementData;
  isSelected: boolean;
  isDimmed: boolean;
  onSelectElement: (element: ElementData) => void;
}) {
  const category = categoryInfo[element.category];

  return (
    <button
      type="button"
      onClick={() => onSelectElement(element)}
      className={`min-h-0 rounded-md border p-0.5 text-left transition-colors hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-100 sm:p-1 ${category.color} ${
        isSelected ? "ring-3 ring-violet-300" : ""
      } ${isDimmed ? "opacity-20 grayscale" : ""}`}
      style={{ gridColumn: element.column ?? element.group, gridRow: element.row ?? element.period }}
      aria-label={`เลือกธาตุ ${element.name}`}
      title={`${element.atomicNumber}. ${element.symbol} ${element.name}`}
    >
      <span className="block text-[8px] font-black leading-none opacity-80">{element.atomicNumber}</span>
      <span className="block text-xs font-black leading-tight sm:text-sm">{element.symbol}</span>
    </button>
  );
});

function PeriodicScene({
  selectedElement,
  selectedCategory,
  onSelectElement,
}: {
  selectedElement: ElementData;
  selectedCategory: ElementCategory | "all";
  onSelectElement: (element: ElementData) => void;
}) {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_10%,#ffffff_0%,#eef6ff_46%,#e0f2fe_100%)] p-3 sm:p-4">
      <div className="absolute inset-0 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="absolute left-3 top-3 z-10 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-lg shadow-slate-900/10 backdrop-blur sm:left-4 sm:top-4 sm:px-4 sm:py-3">
        <p className="text-[10px] font-black uppercase tracking-normal text-violet-600">3D Periodic Board</p>
        <p className="text-sm font-black text-slate-800">ตารางธาตุครบ 118 ธาตุ</p>
      </div>
      <div className="absolute right-4 top-4 z-10 hidden w-[340px] xl:block">
        <ElementMaterialPreview element={selectedElement} />
      </div>

      <div className="relative z-0 flex h-full min-h-0 items-stretch justify-center pt-20 xl:pr-[356px]">
        <div className="flex h-full w-full max-w-7xl min-w-0 items-center">
          <div
            className="grid h-full max-h-[430px] w-full grid-cols-[repeat(18,minmax(0,1fr))] grid-rows-[repeat(9,minmax(0,1fr))] gap-0.5 rounded-2xl border border-white/80 bg-white/70 p-1.5 shadow-xl shadow-blue-200/50 backdrop-blur sm:gap-1 sm:p-2"
          >
            {elements.map((element) => {
              const isSelected = selectedElement.symbol === element.symbol;
              const isDimmed = selectedCategory !== "all" && selectedCategory !== element.category;

              return (
                <ElementTile
                  key={element.symbol}
                  element={element}
                  isSelected={isSelected}
                  isDimmed={isDimmed}
                  onSelectElement={onSelectElement}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 right-3 z-10 xl:hidden">
        <ElementMaterialPreview element={selectedElement} />
      </div>
    </div>
  );
}

function CategoryDistribution() {
  const maxCount = Math.max(
    ...categoryKeys.map((key) => elements.filter((element) => element.category === key).length)
  );

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
        <BarChart3 className="h-4.5 w-4.5 text-violet-600" />
        จำนวนตัวอย่างธาตุในแต่ละหมวด
      </h3>
      <div className="grid gap-2">
        {categoryKeys.map((key) => {
          const count = elements.filter((element) => element.category === key).length;
          return (
            <div key={key} className="grid grid-cols-[128px_minmax(0,1fr)_34px] items-center gap-3 text-xs font-bold">
              <span className="truncate text-slate-600">{categoryInfo[key].label}</span>
              <div className="h-3 rounded-full bg-slate-100">
                <div className={`h-3 rounded-full ${categoryInfo[key].color.split(" ")[0]}`} style={{ width: `${(count / maxCount) * 100}%` }} />
              </div>
              <span className="text-right font-black text-slate-900">{count}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ElementDetailTable({ selectedElement }: { selectedElement: ElementData }) {
  const rows = [
    ["เลขอะตอม", selectedElement.atomicNumber.toString()],
    ["สัญลักษณ์", selectedElement.symbol],
    ["ชื่อธาตุ", selectedElement.name],
    ["มวลอะตอม", selectedElement.mass],
    ["คาบ / หมู่", formatPosition(selectedElement)],
    ["สถานะที่อุณหภูมิห้อง", selectedElement.state],
    ["หมวดธาตุ", formatCategoryLabel(selectedElement.category)],
    ["ตัวอย่างการใช้งาน", selectedElement.use],
  ];

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
        <ClipboardList className="h-4.5 w-4.5 text-violet-600" />
        รายละเอียดธาตุที่เลือก
      </h3>
      <div className="grid gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-900">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PeriodicTableSimulation() {
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | "all">("all");
  const [selectedElement, setSelectedElement] = useState<ElementData>(elements[0]);

  const visibleCount = useMemo(
    () => selectedCategory === "all"
      ? elements.length
      : elements.filter((element) => element.category === selectedCategory).length,
    [selectedCategory]
  );

  const controls = (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-black text-slate-500">เลือกหมวดธาตุ 7 หมู่</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-black transition ${
              selectedCategory === "all"
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            ทั้งหมด
          </button>
          {categoryKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(key)}
              className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-black transition ${
                selectedCategory === key ? categoryInfo[key].color : categoryInfo[key].soft
              }`}
            >
              {categoryInfo[key].label}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xs font-black text-slate-500">
          <Search className="h-3.5 w-3.5" />
          เลือกธาตุสำคัญ
        </span>
        <select
          value={selectedElement.symbol}
          onChange={(event) => {
            const next = elements.find((element) => element.symbol === event.target.value);
            if (next) setSelectedElement(next);
          }}
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 focus:border-violet-300 focus:outline-none focus:ring-3 focus:ring-violet-100"
        >
          {elements.map((element) => (
            <option key={element.symbol} value={element.symbol}>
              {element.atomicNumber}. {element.symbol} - {element.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => {
          setSelectedCategory("all");
          setSelectedElement(elements[0]);
        }}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
      >
        <RotateCcw className="h-4 w-4" />
        รีเซ็ตตาราง
      </button>
    </div>
  );

  return (
    <SharedSimulationShell
      accent="violet"
      labId="periodic-table"
      category="Chemistry"
      title="Periodic Table Lab"
      subtitle="สำรวจตารางธาตุแบบ 3D-style อ่านข้อมูลธาตุ เปรียบเทียบหมวดธาตุ 7 หมู่ และเชื่อมโยงตำแหน่งกับสมบัติทางเคมี"
      statusLabel="พร้อมทดลอง"
      showLiveMetrics={false}
      showInfoTabs={false}
      showSaveButton={false}
      icon={Atom}
      sceneTitle="ห้องทดลองตารางธาตุ 3D"
      scene={
        <PeriodicScene
          selectedElement={selectedElement}
          selectedCategory={selectedCategory}
          onSelectElement={setSelectedElement}
        />
      }
      controlsTitle="แผงสำรวจตารางธาตุ"
      controls={controls}
      metrics={[
        { label: "ธาตุที่เลือก", value: selectedElement.symbol, tone: "violet" },
        { label: "เลขอะตอม", value: selectedElement.atomicNumber.toString(), tone: "blue" },
        { label: "หมวดที่เห็น", value: `${visibleCount} ธาตุ`, tone: "cyan" },
        { label: "คาบ/หมู่", value: `${selectedElement.period}/${selectedElement.group}`, tone: "emerald" },
      ]}
      graph={<CategoryDistribution />}
      table={<ElementDetailTable selectedElement={selectedElement} />}
      theory={
        <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
          <h2 className="mb-3 flex items-center gap-2 text-base font-black text-slate-900">
            <BookOpen className="h-5 w-5 text-violet-600" />
            หลักการอ่านตารางธาตุ
          </h2>
          <p className="text-sm font-semibold leading-relaxed text-slate-600">
            ตารางธาตุเรียงตามเลขอะตอมจากน้อยไปมาก ช่องของธาตุบอกเลขอะตอม สัญลักษณ์ ชื่อ และมวลอะตอมโดยประมาณ
            แถวแนวนอนเรียกว่า “คาบ” ส่วนคอลัมน์แนวตั้งเรียกว่า “หมู่” ธาตุที่อยู่หมู่เดียวกันมักมีสมบัติคล้ายกัน
            เพราะมีจำนวนอิเล็กตรอนเวเลนซ์ใกล้เคียงกัน
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {categoryKeys.map((key) => (
              <div key={key} className={`rounded-xl border px-3 py-2 text-xs font-semibold leading-relaxed ${categoryInfo[key].soft}`}>
                <b>{categoryInfo[key].label}:</b> {categoryInfo[key].description}
              </div>
            ))}
          </div>
        </section>
      }
      steps={[
        { label: "เลือกหมวดธาตุที่ต้องการศึกษา", icon: Target },
        { label: "คลิกธาตุบนตาราง 3D", icon: Atom },
        { label: "อ่านเลขอะตอม มวลอะตอม คาบ และหมู่", icon: ClipboardList },
        { label: "เปรียบเทียบสมบัติของธาตุในหมวดเดียวกัน", icon: BarChart3 },
        { label: "สรุปแนวโน้มก่อนต่อยอดไปแล็บเคมี", icon: CheckCircle2 },
      ]}
      learningGoals={[
        "อ่านข้อมูลหลักบนช่องธาตุได้อย่างถูกต้อง",
        "แยกหมวดธาตุหลัก 7 หมู่และอธิบายจุดเด่นของแต่ละหมวดได้",
        "เชื่อมโยงคาบและหมู่กับสมบัติทางเคมีพื้นฐานได้",
        "เลือกใช้ข้อมูลธาตุเพื่อเตรียมความพร้อมก่อนทำแล็บเคมีอื่น ๆ ได้",
      ]}
      progressLabel="จำนวนธาตุที่กำลังแสดง"
      progressValue={`${visibleCount} / ${elements.length} ธาตุ`}
      progressPercent={(visibleCount / elements.length) * 100}
      tips={[
        "เริ่มจากดูโลหะ อโลหะ และแก๊สมีตระกูลเพื่อเห็นความต่างชัดที่สุด",
        "เปรียบเทียบธาตุในหมู่เดียวกัน เช่น Li, Na, K เพื่อดูสมบัติคล้ายกัน",
        "อย่าจำแค่สัญลักษณ์ ให้ดูเลขอะตอม คาบ และหมู่ควบคู่กัน",
        "ใช้ตารางนี้เป็นพื้นฐานก่อนเรียนสารละลาย ปฏิกิริยาเคมี และแก๊ส",
      ]}
    />
  );
}
