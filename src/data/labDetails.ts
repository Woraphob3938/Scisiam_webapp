import { foundationExplorerLabList, type FoundationExplorerLab } from "./foundationExplorerLabs";

export interface EquipmentItemData {
  id: string;
  name: string;
  role: string;
  note: string;
  unit: string;
  tone: "rose" | "blue" | "amber" | "cyan" | "orange" | "violet" | "emerald";
  visualKey: string;
}

export interface StepItemData {
  num: number;
  title: string;
  desc: string;
  iconKey: string;
  color: string;
  bg: string;
}

export interface EquationLabelData {
  label: string;
  desc: string;
  color?: string;
}

export interface GraphPointData {
  x: number;
  y: number;
}

export interface GraphConfigData {
  title: string;
  subtitle: string;
  xTitle: string;
  yTitle: string;
  yLabels: string[];
  xLabels: string[];
  graphType: "line" | "curve" | "scatter" | "enthalpy" | "faraday" | "bernoulli" | "le-chatelier" | "solubility" | "avogadro" | "electrolysis" | "colligative" | "cooling" | "custom" | "mitosis" | "mendelian";
  pathColor?: string;
  customPath?: string;
  points?: GraphPointData[];
  dashedLineX?: number;
  solidLineCoords?: { x1: number; y1: number; x2: number; y2: number };
  dashedLineCoords?: { x1: number; y1: number; x2: number; y2: number };
  annotation?: { x: number; y: number; text: string; color?: string };
}

export interface LabDetailData {
  overviewBullets: string[];
  learningObjectives: string[];
  equipments: EquipmentItemData[];
  steps: StepItemData[];
  theoryDescription: string;
  equationHtml: string;
  equationLabels: EquationLabelData[];
  graph: GraphConfigData;
}

// 1. Newton's Cooling
const coolingDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาการลดลงของอุณหภูมิของวัตถุร้อนในสภาพแวดล้อมควบคุมความเย็น",
    "เก็บข้อมูลอุณหภูมิของวัตถุตามช่วงเวลาเพื่อสังเกตแนวโน้ม",
    "วิเคราะห์และเปรียบเทียบผลลัพธ์กับสมการของกฎการเย็นตัวของนิวตัน"
  ],
  learningObjectives: [
    "อธิบายหลักทฤษฎีกฎการเย็นตัวของนิวตันได้อย่างถูกต้อง",
    "รู้วิธีเก็บและบันทึกข้อมูลอุณหภูมิในระบบแล็บฟิสิกส์ได้อย่างแม่นยำ",
    "สามารถวิเคราะห์เส้นโค้งกราฟและตีความค่าคงที่อัตราการเย็นตัวได้"
  ],
  equipments: [
    { id: "thermometer", name: "เทอร์โมมิเตอร์", role: "วัดอุณหภูมิของวัตถุร้อนทุกช่วงเวลา", note: "อ่านค่าที่ระดับสายตาและรอให้ค่าคงที่ก่อนบันทึก", unit: "°C", tone: "rose", visualKey: "ThermometerVisual" },
    { id: "beaker", name: "บีกเกอร์", role: "ภาชนะสำหรับใส่น้ำร้อนระหว่างการเย็นตัว", note: "เลือกขนาดคงที่เพื่อให้พื้นที่สัมผัสอากาศไม่เปลี่ยน", unit: "250 ml", tone: "blue", visualKey: "BeakerVisual" },
    { id: "stopwatch", name: "นาฬิกาจับเวลา", role: "จับเวลาการทดลองและกำหนดช่วงบันทึกข้อมูล", note: "เริ่มจับเวลาพร้อมกับวางบีกเกอร์ในสภาพแวดล้อมควบคุม", unit: "s", tone: "amber", visualKey: "StopwatchVisual" },
    { id: "hot-water", name: "น้ำร้อน", role: "ตัวอย่างวัตถุร้อนที่ใช้สังเกตกฎการเย็นตัว", note: "ตั้งอุณหภูมิเริ่มต้นให้สูงกว่าสภาพแวดล้อมอย่างชัดเจน", unit: "T0", tone: "orange", visualKey: "HotWaterVisual" },
    { id: "ice", name: "น้ำแข็ง", role: "ช่วยสร้างสภาพแวดล้อมเย็นหรือจุดเปรียบเทียบอุณหภูมิ", note: "ใช้เมื่อต้องการลดอุณหภูมิแวดล้อมและเห็นกราฟชันขึ้น", unit: "Ts", tone: "cyan", visualKey: "IceVisual" }
  ],
  steps: [
    { num: 1, title: "เตรียมน้ำร้อน", desc: "เตรียมน้ำร้อนในบีกเกอร์ และวัดอุณหภูมิเริ่มต้น (T₀)", iconKey: "Thermometer", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "วางในสิ่งแวดล้อมควบคุม", desc: "วางบีกเกอร์ในสภาพแวดล้อมที่อุณหภูมิคงที่ และเริ่มจับเวลา", iconKey: "Timer", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "บันทึกอุณหภูมิสม่ำเสมอ", desc: "บันทึกค่าอุณหภูมิทุกช่วงเวลาอย่างสม่ำเสมอ", iconKey: "ClipboardList", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "วิเคราะห์สมการนิวตัน", desc: "สร้างกราฟและวิเคราะห์ข้อมูลเปรียบเทียบกับสมการ", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎการเย็นตัวของนิวตัน (Newton's law of cooling) กล่าวว่า อัตราการเปลี่ยนแปลงของอุณหภูมิของวัตถุจะแปรผันตรงกับความแตกต่างของอุณหภูมิระหว่างตัววัตถุกับสภาพแวดล้อมโดยรอบ",
  equationHtml: "dT / dt = -k(T - T<sub>s</sub>)",
  equationLabels: [
    { label: "dT/dt", desc: "อัตราการเปลี่ยนแปลงอุณหภูมิเทียบกับเวลา", color: "text-rose-500" },
    { label: "k", desc: "ค่าคงที่อัตราการเย็นตัวของระบบ", color: "text-amber-500" },
    { label: "T - Ts", desc: "ความต่างอุณหภูมิของวัตถุ T กับสิ่งแวดล้อม Ts", color: "text-blue-500" }
  ],
  graph: {
    title: "กราฟการเย็นตัวจำลอง",
    subtitle: "Exponential Decay Curve",
    xTitle: "เวลา (นาที)",
    yTitle: "อุณหภูมิ (°C)",
    yLabels: ["100", "75", "50", "25"],
    xLabels: ["0", "10", "20", "30", "40"],
    graphType: "cooling",
    customPath: "M20,20 C50,60 90,90 180,95",
    pathColor: "#3b82f6"
  }
};

// 2. Ohm's Law
const ohmsLawDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาความสัมพันธ์ของกระแสไฟฟ้า แรงดันไฟฟ้า และความต้านทานไฟฟ้า",
    "รู้วิธีต่อและใช้งานเครื่องจ่ายแรงดัน แอมมิเตอร์ และโวลต์มิเตอร์ในวงจรปิด",
    "สามารถคำนวณและวิเคราะห์ความต้านทานจากความชัน (Slope) ของกราฟได้"
  ],
  learningObjectives: [
    "อธิบายความสัมพันธ์ตามกฎของโอห์ม V = I x R ได้อย่างถูกต้อง",
    "รู้วิธีต่อและประเมินแอมแปร์ โวลต์ และโอห์มในระบบวงจรปิดจำลอง",
    "วิเคราะห์แนวโน้มกราฟความต่างศักย์และกระแสไฟฟ้าเป็นเส้นตรงได้"
  ],
  equipments: [
    { id: "power-supply", name: "แหล่งจ่ายไฟกระแสตรง (DC Power Supply)", role: "ป้อนแรงดันไฟฟ้าให้กับวงจร สามารถปรับค่าแรงดันได้", note: "ตรวจสอบขั้วบวกขั้วลบก่อนเปิดใช้งานทุกครั้ง", unit: "V", tone: "blue", visualKey: "PowerSupplyVisual" },
    { id: "ammeter", name: "แอมมิเตอร์ (Ammeter)", role: "วัดค่ากระแสไฟฟ้าที่ไหลผ่านวงจรแบบอนุกรม", note: "ต่อแบบอนุกรมกับวงจรเสมอ ห้ามต่อคร่อมแหล่งจ่ายโดยตรง", unit: "A", tone: "amber", visualKey: "AmmeterVisual" },
    { id: "resistor", name: "ตัวต้านทาน (Resistor)", role: "สร้างความต้านทานและควบคุมปริมาณการไหลของกระแส", note: "เลือกค่าความต้านทานที่เหมาะสมและระมัดระวังความร้อนสะสม", unit: "Ω", tone: "orange", visualKey: "ResistorVisual" },
    { id: "voltmeter", name: "โวลต์มิเตอร์ (Voltmeter)", role: "วัดค่าความต่างศักย์ไฟฟ้าตกคร่อมตัวต้านทาน", note: "ต่อขนานคร่อมจุดที่ต้องการวัดแรงดันเสมอ", unit: "V", tone: "rose", visualKey: "VoltmeterVisual" },
    { id: "jumper-wires", name: "สายเชื่อมต่อวงจร (Jumper Wires)", role: "เชื่อมต่ออุปกรณ์ทุกชิ้นเข้าด้วยกันเป็นวงจรปิด", note: "ตรวจเช็คหน้าสัมผัสของสายไฟว่าแน่นหนาและไม่มีจุดชำรุด", unit: "pcs", tone: "cyan", visualKey: "WiresVisual" }
  ],
  steps: [
    { num: 1, title: "ต่อวงจรไฟฟ้ากระแสตรง", desc: "ต่อเครื่องจ่ายไฟ ตัวต้านทาน และแอมมิเตอร์แบบอนุกรมให้ครบวงจร", iconKey: "Zap", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "ตั้งค่าความต้านทาน", desc: "กำหนดขนาดความต้านทานไฟฟ้า (R) คงที่ค่าหนึ่งสำหรับใช้ในการวัด", iconKey: "Sliders", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "ปรับแรงดันไฟฟ้า", desc: "ค่อย ๆ ปรับแรงดันไฟฟ้า (V) จากแหล่งจ่ายขึ้นทีละระดับอย่างช้า ๆ", iconKey: "Timer", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "บันทึกผลการทดลอง", desc: "อ่านค่ากระแสไฟฟ้า (I) ที่ผ่านตัวต้านทานและแอมมิเตอร์เพื่อนำไปพล็อตกราฟ", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎของโอห์ม (Ohm's Law) อธิบายความสัมพันธ์ของไฟฟ้ากระแสตรง โดยกระแสไฟฟ้า (I) ที่ไหลผ่านตัวนำจะเป็นสัดส่วนโดยตรงกับความต่างศักย์ไฟฟ้า (V) และเป็นสัดส่วนผกผันกับความต้านทานไฟฟ้า (R)",
  equationHtml: "V = I &times; R",
  equationLabels: [
    { label: "V", desc: "ความต่างศักย์ตกคร่อมตัวต้านทาน (Volt)", color: "text-indigo-500" },
    { label: "I", desc: "กระแสไฟฟ้าที่ไหลผ่านวงจร (Ampere)", color: "text-rose-500" },
    { label: "R", desc: "ค่าความต้านทานของวัสดุ (Ohm)", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟความสัมพันธ์ V-I",
    subtitle: "Ohmic Linear Relationship",
    xTitle: "กระแส (A)",
    yTitle: "แรงดัน (V)",
    yLabels: ["24V", "18V", "12V", "6V"],
    xLabels: ["0", "0.1", "0.2", "0.3", "0.4"],
    graphType: "line",
    solidLineCoords: { x1: 20, y1: 110, x2: 175, y2: 20 },
    pathColor: "#3b82f6"
  }
};

// 3. Hooke's Law
const hookesLawDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาความยืดหยุ่นของสปริงและแรงดึงกลับตามระยะยืด วิเคราะห์ค่าคงตัวของสปริงตามกฎของฮุค",
    "เพิ่มตุ้มน้ำหนักทีละขั้นและวัดระยะยืดของสปริงจากตำแหน่งสมดุล",
    "สร้างกราฟ F-x เพื่อหาค่าคงที่สปริง (k) จากความชันของเส้นกราฟ"
  ],
  learningObjectives: [
    "อธิบายหลักการของกฎของฮุค F = -kx ได้อย่างถูกต้อง",
    "ติดตั้งสปริง ตุ้มน้ำหนัก และอ่านค่าวัดพิกัดระยะยืดได้อย่างมั่นใจ",
    "สามารถคำนวณและประเมินค่าคงที่ความยืดหยุ่นสปริงจากความชันกราฟได้"
  ],
  equipments: [
    { id: "spring", name: "สปริงทดลอง (Helical Spring)", role: "อุปกรณ์หลักสำหรับศึกษาความสัมพันธ์ระหว่างแรงกับระยะยืด", note: "เลือกสปริงที่ไม่เกิดการบิดงอและยืดได้สม่ำเสมอตลอดช่วงทดลอง", unit: "N/m", tone: "rose", visualKey: "SpringVisual" },
    { id: "mass-set", name: "ชุดตุ้มน้ำหนักมาตรฐาน (Mass Set)", role: "สร้างแรงดึงให้สปริงยืดออกในปริมาณที่ควบคุมได้", note: "ค่อย ๆ เพิ่มตุ้มน้ำหนักทีละขั้นอย่างช้า ๆ เพื่อให้ระบบอยู่ในสมดุล", unit: "g", tone: "amber", visualKey: "MassSetVisual" },
    { id: "ruler", name: "ไม้บรรทัดวัดระยะ (Ruler)", role: "วัดระยะยืดของสปริงจากตำแหน่งสมดุลเดิม", note: "วางไม้บรรทัดให้ขนานกับสปริงและอ่านค่าที่ระดับสายตาเสมอ", unit: "cm", tone: "blue", visualKey: "RulerVisual" },
    { id: "retort-stand", name: "ขาตั้งพร้อมที่จับ (Retort Stand)", role: "ยึดสปริงให้แขวนในแนวดิ่งอย่างมั่นคงระหว่างการทดลอง", note: "ตรวจสอบให้ขาตั้งวางบนพื้นราบเรียบและขันน็อตให้แน่น", unit: "pcs", tone: "orange", visualKey: "RetortStandVisual" },
    { id: "stopwatch-hooke", name: "นาฬิกาจับเวลา (Stopwatch)", role: "จับเวลาหากต้องการศึกษาการสั่นของสปริงเพิ่มเติม", note: "ใช้เมื่อต้องการวัดคาบการสั่น (Period) ของระบบสปริง-มวล", unit: "s", tone: "cyan", visualKey: "StopwatchVisual" }
  ],
  steps: [
    { num: 1, title: "แขวนสปริงบนขาตั้ง", desc: "ตั้งขาตั้งให้มั่นคงและแขวนสปริงในแนวดิ่ง บันทึกตำแหน่งสมดุลเริ่มต้น", iconKey: "Ruler", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "เพิ่มตุ้มน้ำหนักทีละขั้น", desc: "ค่อย ๆ แขวนตุ้มน้ำหนักเพิ่มทีละก้อนอย่างช้า ๆ รอให้ระบบอยู่ในสมดุล", iconKey: "Sliders", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "วัดระยะยืดของสปริง", desc: "อ่านค่าระยะยืดจากไม้บรรทัดที่ระดับสายตาอย่างแม่นยำ", iconKey: "ClipboardList", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "พล็อตกราฟ F-x", desc: "นำข้อมูลแรงและระยะยืดมาพล็อตกราฟเพื่อหาค่าคงที่สปริง (k)", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎของฮุค (Hooke's Law) อธิบายว่า แรงที่ใช้ในการยืดหรือกดสปริงจะแปรผันตรงกับระยะที่สปริงยืดหรือหดจากตำแหน่งสมดุล ตราบใดที่ยังไม่เกินขีดจำกัดสภาพยืดหยุ่น (Elastic Limit)",
  equationHtml: "F = -kx",
  equationLabels: [
    { label: "F", desc: "แรงดึงกลับหรือแรงกระทำต่อสปริง (Newton)", color: "text-indigo-500" },
    { label: "k", desc: "ค่าคงตัวความแข็งหรือค่านิจสปริง (N/m)", color: "text-rose-500" },
    { label: "x", desc: "ระยะยืดที่เบี่ยงเบนจากจุดสมดุลเดิม (meter)", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟความสัมพันธ์ F-x",
    subtitle: "Spring Elastic Linear Limit",
    xTitle: "ระยะยืด (m)",
    yTitle: "แรง (N)",
    yLabels: ["10N", "7.5N", "5N", "2.5N"],
    xLabels: ["0", "0.05", "0.10", "0.15", "0.20"],
    graphType: "line",
    solidLineCoords: { x1: 20, y1: 110, x2: 175, y2: 20 },
    pathColor: "#8b5cf6"
  }
};

// 4. Snell's Law
const snellsLawDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาทฤษฎีการหักเหของแสงตามกฎของสเนลล์และดัชนีหักเหของตัวกลาง",
    "วัดมุมตกกระทบและมุมหักเหเมื่อแสงเดินทางผ่านตัวกลางต่างชนิดกัน",
    "คำนวณหาอัตราความสัมพันธ์ sin(θ₁) / sin(θ₂) เพื่อคำนวณดัชนีหักเหรวม"
  ],
  learningObjectives: [
    "อธิบายกฎของสเนลล์ n₁ sin(θ₁) = n₂ sin(θ₂) ได้อย่างถูกต้อง",
    "วัดและอ่านค่าพิกัดมุมของแสงบนจานวัดองศาได้อย่างเป็นระบบ",
    "ประเมินและวิเคราะห์เหตุการณ์สะท้อนกลับหมดเมื่อมุมตกกระทบเกินมุมวิกฤตได้"
  ],
  equipments: [
    { id: "laser-source", name: "แหล่งกำเนิดแสงเลเซอร์", role: "ฉายลำแสงเส้นตรงข้ามตัวกลางสำหรับสังเกตมุมตกกระทบ", note: "ห้ามฉายแสงเลเซอร์เข้าตาผู้ร่วมการทดลองโดยเด็ดขาด", unit: "nm", tone: "rose", visualKey: "LaserSourceVisual" },
    { id: "acrylic-block", name: "แท่งอะคริลิกครึ่งวงกลม (Semicircular Block)", role: "เป็นตัวกลางหักเหแสงที่มีดัชนีหักเหคงที่ค่าหนึ่ง", note: "จัดให้จุดศูนย์กลางตรงกึ่งกลางจานวัดมุมพอดีเพื่อความเที่ยงตรง", unit: "n2", tone: "blue", visualKey: "AcrylicBlockVisual" },
    { id: "protractor-disk", name: "จานวัดพิกัดมุมตกกระทบและหักเห", role: "บอกพิกัดเป็นองศารอบจุดหมุนตั้งแต่ 0 ถึง 90 องศา", note: "อ่านค่าวัดมุมทั้งสองฝั่งโดยเทียบจากเส้นแนวฉาก (Normal Line)", unit: "deg", tone: "amber", visualKey: "ProtractorVisual" }
  ],
  steps: [
    { num: 1, title: "ตั้งค่าดัชนีหักเหตัวกลาง", desc: "กำหนดดัชนีหักเหตัวกลางที่ 1 (n₁) และ 2 (n₂)", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "หมุนมุมตกกระทบ", desc: "ปรับตั้งค่ามุมตกกระทบ θ₁ ของเลเซอร์ตามระยะสายตา", iconKey: "Sliders", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "วัดและอ่านมุมหักเห", desc: "อ่านค่ามุมหักเห θ₂ บนจานวัดองศา หรือสังเกตการสะท้อนกลับหมด (TIR)", iconKey: "Ruler", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "วิเคราะห์ความชันเส้นไซน์", desc: "บันทึกจุดทดลองเพื่อวิเคราะห์ดัชนีหักเหเฉลี่ยผ่านกราฟไซน์", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎของสเนลล์ (Snell's Law) อธิบายการหักเหของแสงเมื่อเดินทางผ่านตัวกลางสองชนิดที่มีดัชนีหักเหต่างกัน โดยมุมตกกระทบและมุมหักเหมีความสัมพันธ์กันตามดัชนีหักเหของตัวกลางนั้น และเกิดการสะท้อนกลับหมดได้เมื่อแสงเดินทางจากตัวกลางที่มีดัชนีหักเหสูงไปยังต่ำด้วยมุมที่โตกว่ามุมวิกฤต",
  equationHtml: "n<sub>1</sub> sin(&theta;<sub>1</sub>) = n<sub>2</sub> sin(&theta;<sub>2</sub>)",
  equationLabels: [
    { label: "n1, n2", desc: "ดัชนีหักเหแสงของตัวกลางที่ 1 และ 2 ตามลำดับ", color: "text-indigo-500" },
    { label: "θ1", desc: "มุมตกกระทบเทียบกับเส้นแนวฉาก (องศา)", color: "text-rose-500" },
    { label: "θ2", desc: "มุมหักเหแสงในตัวกลางที่สอง (องศา)", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟความสัมพันธ์ sin(θ₁) - sin(θ₂)",
    subtitle: "Refractive Sine Index Slope",
    xTitle: "sin(θ₂)",
    yTitle: "sin(θ₁)",
    yLabels: ["1.0", "0.75", "0.5", "0.25"],
    xLabels: ["0", "0.25", "0.5", "0.75", "1.0"],
    graphType: "line",
    solidLineCoords: { x1: 20, y1: 110, x2: 180, y2: 30 },
    pathColor: "#8b5cf6"
  }
};

// 5. Ideal Gas Law
const idealGasLawDetails: LabDetailData = {
  overviewBullets: [
    "วิเคราะห์การเปลี่ยนแปลงสถานะของแก๊สอุดมคติผ่านความดัน ปริมาตร และอุณหภูมิ",
    "ปรับปริมาณจำนวนโมลและระดับพลังงานจลน์เฉลี่ยของโมเลกุลในระบบปิด",
    "สร้างแบบจำลองแก๊สเพื่อยืนยันสมการสากล PV = nRT"
  ],
  learningObjectives: [
    "อธิบายและประยุกต์ใช้กฎของแก๊สอุดมคติในการคำนวณปริมาณแก๊สได้",
    "วิเคราะห์กราฟความสัมพันธ์ระหว่าง P, V, T เมื่อกำหนดตัวแปรคงที่ได้",
    "คำนวณหามวลโมลาร์หรือจำนวนโมลในระบบแก๊สจำลองได้ถูกต้อง"
  ],
  equipments: [
    { id: "gas-chamber", name: "กล่องระบบปิดเก็บแก๊ส", role: "บรรจุโมเลกุลแก๊สในขอบเขตปริมาตรที่กำหนดได้", note: "ควบคุมอุณหภูมิเพื่อเห็นอัตราการชนผนังสะท้อนค่าความดัน", unit: "L", tone: "blue", visualKey: "PistonVisual" },
    { id: "temp-controller", name: "ระบบควบคุมระดับความร้อน (Heater/Cooler)", role: "ปรับอุณหภูมิแก๊ส (T) ขึ้นลงเพื่อเปลี่ยนพลังงานจลน์โมเลกุล", note: "มีเซนเซอร์วัดค่าเป็นเคลวินและองศาเซลเซียสคู่กัน", unit: "K", tone: "rose", visualKey: "HeaterCoolerVisual" },
    { id: "piston-handle", name: "ลูกสูบกระบอกสูบปรับขอบเขตปริมาตร", role: "เลื่อนเข้าออกเพื่อควบคุมปริมาตร (V) ของแก๊สปิด", note: "ขยับช้าๆ เพื่อป้องกันไม่ให้อุณหภูมิผันผวนรวดเร็วเกินไป", unit: "V", tone: "amber", visualKey: "GasSyringeVisual" }
  ],
  steps: [
    { num: 1, title: "ตั้งค่าปริมาณโมลแก๊ส n", desc: "กำหนดระดับจำนวนโมลโมเลกุลแก๊สที่จะใช้ในการวัดอุณหพลศาสตร์", iconKey: "Sliders", color: "text-cyan-500", bg: "bg-cyan-50" },
    { num: 2, title: "ปรับปริมาตรกระบอกสูบ V", desc: "ปรับระดับลูกสูบเพื่อเปลี่ยนปริมาตรความจุภายในปิด", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 3, title: "ควบคุมระดับความร้อน T", desc: "เพิ่มหรือลดอุณหภูมิสัมบูรณ์ (T) และสังเกตการเคลื่อนของโมเลกุล", iconKey: "Flame", color: "text-orange-500", bg: "bg-orange-50" },
    { num: 4, title: "ตรวจสอบความดัน P", desc: "อ่านค่าเกจวัดความดัน (P) และพล็อตกราฟเพื่อพิสูจน์ PV = nRT", iconKey: "Gauge", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎของแก๊สอุดมคติ (Ideal Gas Law) อธิบายความสัมพันธ์ของแก๊สสมบูรณ์แบบโดยรวมกฎของบอยล์ ชาร์ล และเกย์-ลูสแซก เข้าด้วยกันในสมการ PV = nRT เพื่อแสดงว่าผลคูณของความดันและปริมาตรแปรผันตรงกับจำนวนโมลและอุณหภูมิสัมบูรณ์ของแก๊ส",
  equationHtml: "P V = n R T",
  equationLabels: [
    { label: "P", desc: "ความดันสัมบูรณ์ของแก๊ส (kPa)", color: "text-indigo-500" },
    { label: "V", desc: "ปริมาตรภาชนะปิดบรรจุแก๊ส (Liter)", color: "text-rose-500" },
    { label: "n", desc: "จำนวนโมลสารเคมีของแก๊ส", color: "text-emerald-500" },
    { label: "T", desc: "อุณหภูมิในหน่วยสัมบูรณ์ (Kelvin)", color: "text-orange-500" }
  ],
  graph: {
    title: "กราฟความสัมพันธ์ P - T",
    subtitle: "Pressure-Temperature Line",
    xTitle: "อุณหภูมิ (K)",
    yTitle: "ความดัน (kPa)",
    yLabels: ["400", "300", "200", "100"],
    xLabels: ["0", "100", "200", "300", "400"],
    graphType: "line",
    solidLineCoords: { x1: 20, y1: 110, x2: 180, y2: 25 },
    pathColor: "#ef4444"
  }
};

// 6. Newton's Second Law
const newtonsSecondLawDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาผลของแรงลัพธ์และมวลที่มีต่อความเร่งของวัตถุจำลองตามกฎการเคลื่อนที่ข้อที่สองของนิวตัน",
    "แขวนตุ้มน้ำหนักลากคงที่เพื่อสร้างแรงลัพธ์ดึงลากรถทดลองจำลอง",
    "ประเมินค่าความเร่งผ่านเวลาตกกระทบเซนเซอร์คู่พิกัดระยะทาง"
  ],
  learningObjectives: [
    "อธิบายความสัมพันธ์ตามกฎการเคลื่อนที่ F = ma ได้ถูกต้อง",
    "ติดตั้งรถทดลอง รางวิ่งแนวระดับ และวัดระยะห่างได้อย่างเป็นระเบียบ",
    "วิเคราะห์กราฟเปรียบเทียบอัตราส่วนความชันสะท้อนค่ามวลลัพธ์ระบบได้"
  ],
  equipments: [
    { id: "wooden-track", name: "รางระดับราบติดตั้งสเกล (Wooden Track)", role: "ทางวิ่งแนวระดับราบที่มีสเกลวัดความยาวละเอียด", note: "ปรับรางให้ขนานกับแนวระนาบพื้นห้องมากที่สุด", unit: "cm", tone: "orange", visualKey: "WoodenTrackVisual" },
    { id: "dynamics-cart", name: "รถทดลองพลศาสตร์ (Dynamics Cart)", role: "ตัวรถเข็นที่มีมวล (m) และสามารถรับน้ำหนักเพิ่มได้", note: "ตรวจสอบล้อว่าหมุนอิสระและมีแรงเสียดทานน้อย", unit: "kg", tone: "rose", visualKey: "DynamicsCartVisual" },
    { id: "pulley-system", name: "รอกเดี่ยวไร้ความฝืด (Pulley System)", role: "เปลี่ยนทิศทางแรงดึงจากน้ำหนักแขวนลากรถทดลอง", note: "จัดให้แนวเส้นเชือกขนานกับรางไม้ทดลองพอดี", unit: "pcs", tone: "blue", visualKey: "PulleySystemVisual" },
    { id: "photogate-timers", name: "เครื่องจับเวลาเซนเซอร์คู่ (Photogate Sensors)", role: "ตรวจจับเวลาและประเมินความเร็วเฉลี่ย/ความเร่งของรถ", note: "ตั้งแผงวัดตัดผ่านลำแสงเลเซอร์ของเซนเซอร์ Gate A และ B", unit: "s", tone: "cyan", visualKey: "PhotogateVisual" },
    { id: "mass-set-newton", name: "ชุดตุ้มน้ำหนักลากจูง (Mass Set)", role: "ใช้แขวนที่ปลายเชือกเพื่อสร้างแรงลากจูงคงที่ (F)", note: "น้ำหนักที่แขวนรวมกับมวลรถเป็นมวลรวมของระบบ", unit: "N", tone: "amber", visualKey: "MassSetVisual" }
  ],
  steps: [
    { num: 1, title: "ตั้งรถเข็นบนรางทดลอง", desc: "จัดเตรียมรถเข็นมวล m ให้อยู่ที่ตำแหน่งเริ่มต้นและตรวจสอบรางราบ", iconKey: "Ruler", color: "text-orange-500", bg: "bg-orange-50" },
    { num: 2, title: "ปรับค่ามวลและแรงดึง", desc: "กำหนดมวลรถ (m) และแขวนตุ้มน้ำหนักลากคงที่เพื่อสร้างแรงลัพธ์ (F)", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 3, title: "ปล่อยรถวิ่งจับเวลา", desc: "ปล่อยรถเข็นวิ่งและบันทึกเวลาผ่านเซนเซอร์คู่ Photogate A และ B", iconKey: "Activity", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "สรุปอัตราความชัน", desc: "พล็อตกราฟความชันระหว่างความเร่งและแรงเพื่อพิสูจน์กฎข้อสอง", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎข้อที่สองของนิวตัน (Newton's Second Law) กล่าวว่า เมื่อมีแรงลัพธ์ที่ไม่เป็นศูนย์มากระทำต่อวัตถุ จะทำให้วัตถุเคลื่อนที่ด้วยความเร่ง โดยความเร่งจะแปรผันตรงกับแรงลัพธ์ที่กระทำ และแปรผกผันกับมวลของวัตถุนั้น (F = ma)",
  equationHtml: "F = m a",
  equationLabels: [
    { label: "F", desc: "แรงดึงลัพธ์ภายนอกที่กระทำต่อระบบ (Newton)", color: "text-indigo-500" },
    { label: "m", desc: "มวลรวมของระบบรวมรถและตุ้มน้ำหนัก (kg)", color: "text-rose-500" },
    { label: "a", desc: "ความเร่งเชิงเส้นเฉลี่ยของวัตถุ (m/s²)", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟความสัมพันธ์ a - F",
    subtitle: "Acceleration-Force Linear Curve",
    xTitle: "แรง F (N)",
    yTitle: "ความเร่ง (m/s²)",
    yLabels: ["4.0", "3.0", "2.0", "1.0"],
    xLabels: ["0", "0.1", "0.2", "0.3", "0.4"],
    graphType: "line",
    solidLineCoords: { x1: 20, y1: 110, x2: 180, y2: 35 },
    pathColor: "#3b82f6"
  }
};

// 7. Conservation of Momentum
const momentumDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาการอนุรักษ์โมเมนตัมเชิงเส้นในการชนของวัตถุจำลองบนแนวเส้นตรง",
    "ชนวัตถุจำลองแบบยืดหยุ่นและไร้ยืดหยุ่นเพื่อสังเกตความต่างพลังงานจลน์",
    "ประเมินค่าความเร็วต้นและปลายเพื่อเปรียบเทียบผลรวมก่อนชนและหลังชน"
  ],
  learningObjectives: [
    "อธิบายและใช้กฎการอนุรักษ์โมเมนตัมในการชนเชิงทฤษฎีได้",
    "วัดความเร็วเฉลี่ยก่อนชนและหลังชนของวัตถุสองก้อนได้",
    "คำนวณและประเมินค่าการสูญเสียพลังงานในการชนแต่ละรูปแบบได้"
  ],
  equipments: [
    { id: "momentum-track", name: "รางระดับราบแรงเสียดทานต่ำ", role: "เป็นเส้นทางแนวระนาบราบสำหรับรถพลศาสตร์วิ่งเข้าชนกัน", note: "ตั้งขาตั้งให้รางได้สมดุลแนวนอนเพื่อไม่ให้แรงโน้มถ่วงเพิ่มความเร่ง", unit: "cm", tone: "blue", visualKey: "WoodenTrackVisual" },
    { id: "dynamics-carts-dual", name: "ชุดรถทดลองพลศาสตร์ 2 คัน", role: "รถเข็นที่มีพิกัดมวลชัดเจนและสามารถวางแผ่นถ่วงมวลเพิ่มได้", note: "มีคลิปแม่เหล็ก / สปริงที่ส่วนหัวสำหรับเลือกชนแบบยืดหยุ่นหรือติดกันไป", unit: "kg", tone: "rose", visualKey: "DynamicsCartVisual" },
    { id: "gate-timers", name: "เซนเซอร์วัดความเร็วจุดชน (Photogates)", role: "อ่านค่าความเร็วต้นและความเร็วหลังชนผ่านแผงจับเวลาความเที่ยงสูง", note: "ตั้งจุดชนให้อยู่ระหว่างตําแหน่งของเครื่องส่งเลเซอร์พอดี", unit: "s", tone: "cyan", visualKey: "PhotogateVisual" }
  ],
  steps: [
    { num: 1, title: "เตรียมรถเข็นชนแนวตรง", desc: "จัดรถเข็น 1 และ 2 บนรางไม้ ตรวจสอบระดับให้ราบเรียบเสมอกัน", iconKey: "Ruler", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "ปรับมวลและความเร็วต้น", desc: "กำหนดมวลรถเข็น (m1, m2) และค่าความเร็วเริ่มต้น (u1, u2) ในระบบ", iconKey: "Sliders", color: "text-orange-500", bg: "bg-orange-50" },
    { num: 3, title: "ชนและดักจับความเร็ว", desc: "สั่งให้รถทดลองชนกัน สังเกตการเปลี่ยนความเร็วหลังชนยืดหยุ่น/ไร้ยืดหยุ่น", iconKey: "Activity", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "ตรวจสอบผลโมเมนตัมรวม", desc: "วิเคราะห์กราฟเปรียบเทียบผลรวมโมเมนตัมก่อนและหลังชนเพื่อยืนยันกฎ", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎการอนุรักษ์โมเมนตัมเชิงเส้น (Conservation of Linear Momentum) กล่าวว่า เมื่อไม่มีแรงภายนอกมากระทำต่อระบบ ผลรวมโมเมนตัมของระบบก่อนชนจะเท่ากับผลรวมโมเมนตัมของระบบหลังชนเสมอ โดยใช้ศึกษาระบบชนแบบยืดหยุ่นและไร้ยืดหยุ่น",
  equationHtml: "p<sub>1</sub> + p<sub>2</sub> = p<sub>1</sub>&apos; + p<sub>2</sub>&apos;",
  equationLabels: [
    { label: "p1, p2", desc: "โมเมนตัมของรถเข็น 1 และ 2 ก่อนการเข้าชน (kg·m/s)", color: "text-indigo-500" },
    { label: "p1', p2'", desc: "โมเมนตัมของรถเข็น 1 และ 2 หลังการชนเสร็จสิ้น", color: "text-rose-500" }
  ],
  graph: {
    title: "กราฟเปรียบเทียบโมเมนตัมก่อนและหลังชน",
    subtitle: "Momentum Conservation Linear Curve",
    xTitle: "p ก่อนชน",
    yTitle: "p หลังชน",
    yLabels: ["10", "7.5", "5.0", "2.5"],
    xLabels: ["0", "2.5", "5.0", "7.5", "10.0"],
    graphType: "line",
    solidLineCoords: { x1: 20, y1: 110, x2: 180, y2: 30 },
    pathColor: "#8b5cf6"
  }
};

// 8. Faraday's Law
const faradaysLawDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาการเกิดกระแสไฟฟ้าเหนี่ยวนำจากแม่เหล็กผ่านขดลวด",
    "วิเคราะห์ความสัมพันธ์ระหว่างจำนวนรอบขดลวดเหนี่ยวนำและความต่างศักย์ที่สร้างได้",
    "บันทึกค่าแรงเคลื่อนไฟฟ้าบนโวลต์มิเตอร์เมื่อแท่งแม่เหล็กขยับเข้า-ออก"
  ],
  learningObjectives: [
    "อธิบายกลไกกฎการเหนี่ยวนำของฟาราเดย์ได้อย่างเข้าใจ",
    "ประเมินค่าฟลักซ์แม่เหล็กผ่านการเปลี่ยนความเข้มขดลวดเหนี่ยวนำได้",
    "ระบุและอธิบายทิศทางของกระแสไฟฟ้าตามกฎของเลนซ์ได้ถูกต้อง"
  ],
  equipments: [
    { id: "magnet-bar", name: "แท่งแม่เหล็กถาวร (Magnet Bar)", role: "เป็นแหล่งกำเนิดฟลักซ์แม่เหล็กมีขั้วเหนือ (N) และขั้วใต้ (S)", note: "ควบคุมความเร็วในการเลื่อนผ่านเพื่อดูอัตรารวมการเปลี่ยนแปลง", unit: "T", tone: "rose", visualKey: "PowerSupplyVisual" },
    { id: "induction-coils", name: "ชุดขดลวดเหนี่ยวนำหลายรอบ (Induction Coils)", role: "ขดลวดตัวนำที่ต่อกับมิเตอร์วัดแรงดันกระแสจำลอง", note: "เลือกจุดต่อวงจรที่มีรอบขดลวดต่างกัน (เช่น 1 รอบ, 2 รอบ หรือ 3 รอบ)", unit: "turns", tone: "blue", visualKey: "WiresVisual" },
    { id: "galvanometer", name: "เครื่องวัดแรงดันเหนี่ยวนำ (Galvanometer)", role: "ตรวจจับกระแสขนาดเล็กและทิศทางขั้วบวกขั้วลบตกคร่อมวงจร", note: "หน้าจอมีขีดวัดบอกประจุรวมและพิกัดความต่างศักย์ไฟฟ้า", unit: "V", tone: "amber", visualKey: "VoltmeterVisual" }
  ],
  steps: [
    { num: 1, title: "จัดขดลวดเหนี่ยวนำ", desc: "เลือกจำนวนรอบของขดลวดเหนี่ยวนำนำกระแส (1-3 รอบขด)", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "เตรียมแท่งแม่เหล็ก", desc: "ตั้งค่าระดับความเข้มสนามแม่เหล็กและความพร้อมเชื่อมโยงโวลต์มิเตอร์", iconKey: "Zap", color: "text-orange-500", bg: "bg-orange-50" },
    { num: 3, title: "สไลด์แม่เหล็กเข้า-ออก", desc: "เคลื่อนแท่งแม่เหล็กผ่านขดลวดเพื่อเหนี่ยวนำกระแสไฟฟ้าและวัดผลไฟฟ้า", iconKey: "Activity", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "วิเคราะห์ทิศทางแรงดัน", desc: "ตรวจดูความถี่ของทิศทางเข็มโวลต์มิเตอร์และการเปลี่ยนระดับแสงเหนี่ยวนำ", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎการเหนี่ยวนำของฟาราเดย์ (Faraday's Law of Induction) อธิบายว่า แรงเคลื่อนไฟฟ้าเหนี่ยวนำที่เกิดขึ้นในขดลวดแปรผันตรงกับอัตราการเปลี่ยนแปลงฟลักซ์แม่เหล็กที่ผ่านขดลวดนั้นเทียบกับเวลา โดยมีทิศทางต้านการเปลี่ยนแปลงตาม Lenz's Law",
  equationHtml: "&Epsilon; = -N &Delta;&Phi;<sub>B</sub> / &Delta;t",
  equationLabels: [
    { label: "ℰ", desc: "แรงเคลื่อนไฟฟ้าเหนี่ยวนำที่เกิดขึ้น (Volt)", color: "text-indigo-500" },
    { label: "N", desc: "จำนวนรอบทั้งหมดของขีดวงรอบขดลวดเหนี่ยวนำ", color: "text-rose-500" },
    { label: "ΔΦB/Δt", desc: "อัตราการเปลี่ยนแปลงฟลักซ์แม่เหล็กผ่านพื้นที่ผิวขดลวด", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟแรงดันเหนี่ยวนำกระแส V - t",
    subtitle: "Electromagnetic Induction Sine Wave",
    xTitle: "เวลา",
    yTitle: "แรงดัน (V)",
    yLabels: ["10V", "5V", "0V", "-5V"],
    xLabels: ["0", "2", "4", "6", "8s"],
    graphType: "faraday",
    pathColor: "#f59e0b"
  }
};

// 9. Bernoulli's Principle
const bernoullisPrincipleDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาการไหลของของไหลในท่อคอคอดเวนทูรีผ่านความสัมพันธ์ความดันและความเร็ว",
    "ปรับอัตราการส่งน้ำจำลองและขนาดพื้นที่หน้าตัดท่อแต่ละช่วง",
    "ประเมินและอ่านค่าแรงดันในท่อแก้วแนวดิ่งตามหลักการแบร์นูลลี"
  ],
  learningObjectives: [
    "อธิบายทฤษฎีกลศาสตร์ของไหลของแบร์นูลลีได้อย่างถูกต้อง",
    "เปรียบเทียบระดับความเร็วเฉลี่ยและการสะสมแรงดันแต่ละหน้าตัดท่อได้",
    "คำนวณอัตราความต้านทานแรงดันและเปรียบเทียบกับค่าความลึกน้ำได้ถูกต้อง"
  ],
  equipments: [
    { id: "venturi-tube", name: "ท่อทดลองเวนทูรี (Venturi Tube)", role: "ท่อไหลจำลองที่มีพื้นที่หน้าตัดกว้างและหดแคบลงตรงกลางคอคอด", note: "มีจุดเจาะช่องต่อท่อแก้วใสสำหรับให้ระดับของเหลวสูงขึ้นตามแรงดัน", unit: "cm", tone: "blue", visualKey: "GasSyringeVisual" },
    { id: "water-pump", name: "เครื่องปั๊มน้ำคุมอัตราไหล (Water Pump)", role: "ส่งของเหลวผ่านท่อในอัตราปริมาตร Q ควบคุมได้ละเอียด", note: "ปรับตั้งระดับการไหลสูงสุดเพื่อสังเกตความแตกต่างอุณหภูมิและความดัน", unit: "L/s", tone: "cyan", visualKey: "PowerSupplyVisual" },
    { id: "manometers", name: "ชุดเกจแกนหลอดแก้วใสวัดความดัน (Manometers)", role: "แสดงผลระดับความสูงของน้ำสะท้อนแรงดันแต่ละจุดหน้าตัดท่อ", note: "อ่านระดับความสูงของของเหลวเปรียบเทียบกับสเกลมิลลิเมตร", unit: "mm", tone: "amber", visualKey: "PHMeterVisual" }
  ],
  steps: [
    { num: 1, title: "เปิดระบบน้ำและปรับอัตราไหล", desc: "เริ่มจ่ายกระแสน้ำเข้าท่อเวนทูรี ปรับเปลี่ยนอัตราการไหล Q ลิตร/วินาที", iconKey: "Droplets", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "บีบหน้าตัดคอคอด", desc: "ปรับขนาดเส้นผ่านศูนย์กลางจุดบีบแคบของท่อเพื่อเปลี่ยนอัตราความเร็ว", iconKey: "Sliders", color: "text-orange-500", bg: "bg-orange-50" },
    { num: 3, title: "ตรวจเกจวัดความดัน", desc: "อ่านค่าระดับความเร็วและความดันจุดแคบ-กว้างผ่านท่อแก้วเกจมาโนมิเตอร์", iconKey: "Gauge", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "ประเมินสมดุล Bernoulli", desc: "วิเคราะห์สมการพลังงานไหลเพื่อพิสูจน์จุดที่มีความเร็วสูงจะมีแรงดันลดลง", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "หลักการของแบร์นูลลี (Bernoulli's Principle) ระบุว่า สำหรับการไหลของของไหลในแนวเส้นกระแสที่ไม่มีแรงเสียดทาน จุดที่มีความเร็วของของไหลสูงจะมีความดันต่ำ และจุดที่มีความเร็วของของไหลต่ำจะมีความดันสูง",
  equationHtml: "P + &frac12;&rho;v&sup2; + &rho;gh = Const",
  equationLabels: [
    { label: "P", desc: "ความดันสถิตของของไหล ณ จุดวัด (Pa)", color: "text-indigo-500" },
    { label: "ρ", desc: "ความหนาแน่นมวลของของไหล (kg/m³)", color: "text-rose-500" },
    { label: "v", desc: "ความเร็วเฉลี่ยในการไหล ณ จุดหน้าตัดนั้น (m/s)", color: "text-emerald-500" },
    { label: "gh", desc: "ผลต่างระดับความสูงเทียบแนวอ้างอิง", color: "text-orange-500" }
  ],
  graph: {
    title: "กราฟการแจกแจงความดัน P ตามแนวท่อ",
    subtitle: "Venturi Tube Pressure Drop Graph",
    xTitle: "ท่อออก",
    yTitle: "P(kPa)",
    yLabels: ["300", "200", "100", "50"],
    xLabels: ["ท่อเข้า", "คอคอด", "ท่อออก"],
    graphType: "bernoulli",
    customPath: "M20,30 L80,30 L100,75 L120,75 L140,30 L180,30",
    pathColor: "#3b82f6"
  }
};

// 10. Photoelectric Effect
const photoelectricEffectDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาทฤษฎีควอนตัมของแสงและการหลุดออกของอิเล็กตรอนจากผิวโลหะจำลอง",
    "ปรับประเภทโลหะตัวรับ แอมพลิจูดความเข้ม และความถี่ความยาวคลื่นของแสง",
    "คำนวณความต่างศักย์ต้านการวิ่งย้อนกลับ (Stopping Voltage) เพื่อหาความชันสากล"
  ],
  learningObjectives: [
    "อธิบายทฤษฎีปรากฏการณ์โฟโตอิเล็กทริกของไอน์สไตน์ได้อย่างถูกต้อง",
    "คำนวณและวัดระดับพลังงานฟังก์ชันงาน (Work Function) ของโลหะตัวรับได้",
    "สรุปความสัมพันธ์ของความต่างศักย์หยุดยั้งกับค่าความถี่ของแสงตกกระทบได้"
  ],
  equipments: [
    { id: "photo-cell", name: "ชุดหลอดสุญญากาศทดลอง (Photoelectric Tube)", role: "มีขั้วโลหะแคโทด (ตัวแผ่) และแอโนด (ตัวรับ) ในขวดแก้วสุญญากาศ", note: "สลับชนิดแผ่นโลหะเพื่อประเมินค่าฟังก์ชันงานเริ่มต้นต่างกัน", unit: "metal", tone: "blue", visualKey: "PhotoCellVisual" },
    { id: "monochromator-light", name: "แหล่งฉายแสงความกว้างคลื่นเดี่ยว", role: "ฉายโฟตอนที่มีความถี่ระดับพลังงานควบคุมตกกระทบแผ่นโลหะ", note: "ปรับอัตราระดับความยาวคลื่นนาโนเมตรเพื่อปรับพลังงานโฟตอน", unit: "nm", tone: "rose", visualKey: "GrowLightVisual" },
    { id: "stopping-battery", name: "แหล่งจ่ายความต่างศักย์ต้านการวิ่ง (Stopping Voltage Source)", role: "ป้อนประจุย้อนขั้วเพื่อหน่วงและสกัดแรงวิ่งของอิเล็กตรอน", note: "ปรับตั้งศักย์ไฟฟ้าหน่วงจนกระแสวัดแอมมิเตอร์ลดฮวบลงเป็นศูนย์พอดี", unit: "V", tone: "amber", visualKey: "PowerSupplyVisual" }
  ],
  steps: [
    { num: 1, title: "เลือกเป้าหมายผิวโลหะ", desc: "เลือกชนิดโลหะ Cathode (เช่น โซเดียม, ซิงก์, ทองแดง) เพื่อรับแสง", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "ฉายโฟตอนคลื่นเดี่ยว", desc: "ปรับความยาวคลื่นแสงและความเข้มแสงเพื่อฉายรังสีให้มีพลังงานสูงกว่าฟังก์ชันงาน", iconKey: "Sun", color: "text-orange-500", bg: "bg-orange-50" },
    { num: 3, title: "วัดกระแสแอมมิเตอร์", desc: "วัดกระแสโฟโตอิเล็กตรอนที่เกิดขึ้น และปรับแรงดันต้านย้อนกลับ", iconKey: "Zap", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "หา Stopping Voltage", desc: "บันทึกและพล็อตกราฟพลังงานจลน์สูงสุดตามความถี่แสงเพื่อตรวจสอบค่าคงที่พลังค์", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "ปรากฏการณ์โฟโตอิเล็กทริก (Photoelectric Effect) ค้นพบโดยไอน์สไตน์ อธิบายการหลุดออกของอิเล็กตรอนจากผิวโลหะเมื่อได้รับพลังงานแสงที่มีความถี่สูงกว่าความถี่ขีดเริ่ม พลังงานจลน์สูงสุดแปรผันตรงตามความถี่แสงลบค่าฟังก์ชันงาน",
  equationHtml: "E<sub>k</sub> = h f - W<sub>0</sub>",
  equationLabels: [
    { label: "Ek", desc: "พลังงานจลน์สูงสุดของโฟโตอิเล็กตรอนที่หลุดออก (eV)", color: "text-indigo-500" },
    { label: "h f", desc: "ระดับพลังงานของแสงโฟตอนตกกระทบ (Planck * frequency)", color: "text-rose-500" },
    { label: "W0", desc: "ฟังก์ชันงานหรือพลังงานยึดเหนี่ยวขั้นต่ำสุดของโลหะ", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟพลังงานจลน์สูงสุด Ek - ความถี่แสง f",
    subtitle: "Photoelectric Work Function Threshold",
    xTitle: "f(10¹⁴Hz)",
    yTitle: "Ek(eV)",
    yLabels: ["3.0eV", "2.0", "1.0", "0.0"],
    xLabels: ["f₀", "6.0", "10.0"],
    graphType: "line",
    solidLineCoords: { x1: 60, y1: 110, x2: 180, y2: 20 },
    pathColor: "#a855f7"
  }
};

// 11. Kepler's Laws
const keplersLawsDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาคาบการโคจรดาวเคราะห์จำลองรอบดวงอาทิตย์ตามกฎของเคปเลอร์",
    "ปรับแต่งระยะครึ่งแกนเอกและความรีของวงโคจรรีแบบจำลอง",
    "จับเวลาโคจรเพื่อวิเคราะห์ความคงตัวของอัตราส่วน Kepler"
  ],
  learningObjectives: [
    "อธิบายกฎข้อที่สามของเคปเลอร์ T² ∝ a³ ได้อย่างถูกต้อง",
    "ประเมินและสรุปการเปลี่ยนแปลงความเร็วโคจรใกล้-ไกลจุดโฟกัสได้",
    "คำนวณคาบปีการโคจรสะสมและระยะแกนเอกเฉลี่ยได้ถูกต้อง"
  ],
  equipments: [
    { id: "star-sun", name: "ดวงอาทิตย์แหล่งมวลศูนย์กลาง (Sun focus)", role: "ดึงดาวเคราะห์ให้โคจรรอบด้วยแรงโน้มถ่วงซึ่งอยู่ที่ตำแหน่งจุดโฟกัสของวงรี", note: "เปรียบเทียบคาบความกว้างตามกฎ $T^2 \\propto a^3$ สอดคล้องกับค่าคงที่ของระบบ", unit: "M☉", tone: "orange", visualKey: "PlanetaryOrbitVisual" },
    { id: "planetary-tracker", name: "เครื่องวัดคาบและพิกัดดาวเคราะห์", role: "บันทึกเวลาโคจรครบรอบวงเพื่อประเมินคาบปีการโคจรเฉลี่ย", note: "ปรับขนาดกึ่งแกนเอกเพื่อทดสอบความคงตัวของอัตราส่วน Kepler", unit: "Years", tone: "amber", visualKey: "PlanetaryOrbitVisual" }
  ],
  steps: [
    { num: 1, title: "กำหนดวงโคจรรีดวงดาว", desc: "ตั้งค่าขนาดกึ่งแกนเอก (a) และความรีวงโคจรดาวเคราะห์ (e) รอบดวงอาทิตย์", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "สังเกตความเร็วการโคจร", desc: "ดูอัตราความเร็วขณะเคลื่อนผ่านใกล้ Perihelion และไกล Aphelion", iconKey: "Activity", color: "text-orange-500", bg: "bg-orange-50" },
    { num: 3, title: "วัดคาบโคจรครบรอบ", desc: "จับเวลาที่ใช้ในการเคลื่อนที่ครบรอบปีการโคจรของดาวเคราะห์จำลอง", iconKey: "Timer", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "พิสูจน์กฎ Kepler ข้อที่ 3", desc: "เปรียบเทียบสัดส่วนกำลังสองของคาบต่อกำลังสามของระยะว่าคงที่ตามทฤษฎีหรือไม่", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎข้อที่สามของเคปเลอร์ (Kepler's Third Law) ระบุว่า กำลังสองของคาบการโคจรดาวเคราะห์รอบดวงอาทิตย์แปรผันตรงกับกำลังสามของระยะครึ่งแกนเอกวงโคจรรี (T² / a³ = ค่าคงที่) นำมาสู่ทฤษฎีแรงโน้มถ่วงพิภพ",
  equationHtml: "T&sup2; / a&sup3; = K",
  equationLabels: [
    { label: "T", desc: "คาบเวลาในการโคจรครบรอบสมบูรณ์ของดาวเคราะห์ (ปีโลก)", color: "text-indigo-500" },
    { label: "a", desc: "ขนาดความยาวกึ่งแกนเอกของวงรีวงโคจร (AU)", color: "text-rose-500" },
    { label: "K", desc: "ค่าคงที่เฉพาะของระบบ (มีค่าเท่ากับ 1.0 สำหรับระบบดวงอาทิตย์)", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟความสัมพันธ์ T² - a³",
    subtitle: "Keplerian Harmonic Orbit Ratio",
    xTitle: "a³(AU³)",
    yTitle: "T²(Yr²)",
    yLabels: ["120", "80", "40", "10"],
    xLabels: ["0", "40", "80", "120", "160"],
    graphType: "line",
    solidLineCoords: { x1: 20, y1: 110, x2: 180, y2: 20 },
    pathColor: "#3b82f6"
  }
};

// 12. Stefan-Boltzmann Law
const stefanBoltzmannDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาความสัมพันธ์ของระดับความร้อนอุณหภูมิและการแผ่รังสีของวัตถุดำ",
    "ปรับตั้งค่ารัศมีพื้นที่แผ่และระดับอุณหภูมิเคลวินของเตาความร้อนจำลอง",
    "คำนวณกำลังงานเหนี่ยวนำรวมเทียบกฎกำลังสี่สะท้อนสูตรสากล"
  ],
  learningObjectives: [
    "อธิบายและพิสูจน์กฎของสเตฟาน-โบลตซ์มันน์ได้อย่างถูกต้อง",
    "ประเมินระดับความเข้มกำลังงานการแผ่เทียบระดับความร้อนได้ละเอียด",
    "อธิบายแนวคิด Wien's displacement หาสเปกตรัมแสงสูงสุดได้"
  ],
  equipments: [
    { id: "blackbody-furnace", name: "เครื่องกำเนิดรังสีวัตถุดำ (Blackbody Cavity)", role: "จำลองการแผ่รังสีแม่เหล็กไฟฟ้าสมบูรณ์แบบที่อุณหภูมิควบคุม", note: "ปรับระดับอุณหภูมิ (K) สังเกตการเปลี่ยนสีดวงดาวสะท้อนความเข้มคลื่นแผ่", unit: "K", tone: "rose", visualKey: "WienSpectrumVisual" },
    { id: "radiation-pyrometer", name: "เครื่องวัดพลังงานความเข้มการแผ่รังสี (Pyrometer)", role: "ดักจับความร้อนรังสีเพื่อนำมาประมวลผลความหนาแน่นกำลังการแผ่รังสี", note: "กำลังรวมการแผ่จะแปรผันตามอุณหภูมิสัมบูรณ์เคลวินยกกำลังสี่ ($T^4$)", unit: "W/m²", tone: "orange", visualKey: "WienSpectrumVisual" },
    { id: "spectrophotometer", name: "เครื่องสเปกโตรมิเตอร์คัดความกว้างช่วงคลื่น", role: "วัดความหนาแน่นสเปกตรัมการแผ่พลังงานในความถี่คลื่นต่างๆ", note: "วิเคราะห์ความสัมพันธ์ Wien's Displacement สำหรับความยาวคลื่นยอดความเข้มสูงสุด", unit: "nm", tone: "blue", visualKey: "WienSpectrumVisual" }
  ],
  steps: [
    { num: 1, title: "ปรับอุณหภูมิผิวสัมบูรณ์", desc: "ตั้งค่าอุณหภูมิเคลวินของเตาอบวัตถุดำหรือดวงดาวจำลองแผ่ความร้อน", iconKey: "Flame", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "ปรับพื้นที่ผิวแผ่รังสี", desc: "ปรับขนาดรัศมีผิวของดาวเคราะห์เพื่อวิเคราะห์ผลกระทบต่ออัตราแผ่พลังงานรวม", iconKey: "Sliders", color: "text-orange-500", bg: "bg-orange-50" },
    { num: 3, title: "วัดความเข้มและกำลังแผ่", desc: "วัดค่าความหนาแน่นกำลังการแผ่รังสีเทียบตามเวลาจริงผ่านตัววัดพลังงานความร้อน", iconKey: "Zap", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "วิเคราะห์กราฟกำลังสี่", desc: "ตรวจสอบกราฟสเปกตรัมแสงและคำนวณอัตราความชันพิสูจน์ความสัมพันธ์ T^4", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎของสเตฟาน-โบลตซ์มันน์ (Stefan-Boltzmann Law) ระบุว่า กำลังงานการแผ่รังสีต่อหน่วยพื้นที่ผิวของวัตถุดำแปรผันตรงกับอุณหภูมิสัมบูรณ์เคลวินยกกำลังสี่ (I = σT⁴) สะท้อนการคายพลังงานรังสีความร้อนของวัตถุและดาวฤกษ์",
  equationHtml: "I = &sigma; T<sup>4</sup>",
  equationLabels: [
    { label: "I", desc: "พลังงานรวมหรือความเข้มกำลังงานการแผ่รังสีความร้อน (W/m²)", color: "text-indigo-500" },
    { label: "σ", desc: "ค่าคงตัวของสเตฟาน-โบลตซ์มันน์ (5.670 x 10⁻⁸ W/m²·K⁴)", color: "text-rose-500" },
    { label: "T", desc: "อุณหภูมิพื้นผิวของวัตถุในหน่วยสัมบูรณ์ (Kelvin)", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟกำลังความเข้มการแผ่รังสี I - T⁴",
    subtitle: "Stefan-Boltzmann T⁴ Power Curve",
    xTitle: "T⁴(K⁴)",
    yTitle: "กำลังงาน I",
    yLabels: ["1.2e8", "8.0e7", "4.0e7", "1.0e7"],
    xLabels: ["0", "5.0e14", "1.0e15", "1.5e15", "2.0e15"],
    graphType: "line",
    solidLineCoords: { x1: 20, y1: 110, x2: 180, y2: 20 },
    pathColor: "#ef4444"
  }
};

// 13. Acid-Base Titration
const acidBaseDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษากระบวนการไทเทรตกรด-เบสด้วยบิวเรต ขวดรูปชมพู่ และอินดิเคเตอร์",
    "ติดตามค่า pH และการเปลี่ยนสีของสารละลายเมื่อหยดสารมาตรฐานลงทีละช่วง",
    "วิเคราะห์จุดสมมูลจากกราฟ pH-volume เพื่อหาความเข้มข้นของสารตัวอย่าง"
  ],
  learningObjectives: [
    "อธิบายหลักสโตอิชิโอเมทรีของปฏิกิริยากรด-เบสที่จุดสมมูลได้",
    "อ่านค่า pH และปริมาตรสารมาตรฐานจากบิวเรตเพื่อคำนวณความเข้มข้นได้",
    "ตีความรูปทรงกราฟไทเทรชันและช่วงเปลี่ยนสีของอินดิเคเตอร์ได้อย่างถูกต้อง"
  ],
  equipments: [
    { id: "burette", name: "บิวเรต (Burette)", role: "หยดสารละลายมาตรฐานลงในสารตัวอย่างอย่างละเอียด", note: "อ่านระดับปริมาตรที่ก้นเมนิสคัสและตรวจว่าไม่มีฟองอากาศในปลายบิวเรต", unit: "ml", tone: "cyan", visualKey: "BuretteVisual" },
    { id: "erlenmeyer-flask", name: "ขวดรูปชมพู่ (Erlenmeyer Flask)", role: "บรรจุสารตัวอย่างและอินดิเคเตอร์ระหว่างการไทเทรต", note: "แกว่งขวดเบา ๆ หลังหยดสารเพื่อให้สารผสมกันสม่ำเสมอ", unit: "250 ml", tone: "rose", visualKey: "ErlenmeyerVisual" },
    { id: "pipette", name: "ปิเปต (Pipette)", role: "ตวงปริมาตรสารตัวอย่างให้แม่นยำก่อนเริ่มทดลอง", note: "ใช้ลูกยางดูดสารและล้างปิเปตด้วยสารตัวอย่างก่อนตวงจริง", unit: "25 ml", tone: "blue", visualKey: "PipetteVisual" },
    { id: "indicator", name: "อินดิเคเตอร์", role: "แสดงจุดยุติจากการเปลี่ยนสีของสารละลาย", note: "ใช้เพียง 2-3 หยดเพื่อไม่ให้รบกวนสมดุลของปฏิกิริยา", unit: "drops", tone: "orange", visualKey: "IndicatorVisual" },
    { id: "ph-meter", name: "เครื่องวัด pH", role: "ติดตามค่า pH ของสารละลายแบบต่อเนื่องขณะไทเทรต", note: "ล้างหัววัดด้วยน้ำกลั่นและซับให้แห้งก่อนวัดทุกครั้ง", unit: "pH", tone: "amber", visualKey: "PHMeterVisual" }
  ],
  steps: [
    { num: 1, title: "เตรียมสารตัวอย่าง", desc: "ใช้ปิเปตตวงสารกรดหรือเบสลงขวดรูปชมพู่และหยดอินดิเคเตอร์", iconKey: "FlaskConical", color: "text-cyan-500", bg: "bg-cyan-50" },
    { num: 2, title: "เติมสารมาตรฐานในบิวเรต", desc: "ล้างบิวเรต ไล่ฟองอากาศ และตั้งค่าปริมาตรเริ่มต้นให้พร้อม", iconKey: "Droplets", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 3, title: "หยดและติดตาม pH", desc: "หยดสารทีละช่วงพร้อมแกว่งขวดและอ่านค่า pH อย่างต่อเนื่อง", iconKey: "ClipboardList", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "หาจุดสมมูล", desc: "พล็อตกราฟ pH-volume เพื่อระบุจุดสมมูลและคำนวณความเข้มข้น", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "การไทเทรตกรด-เบสใช้สารละลายมาตรฐานที่ทราบความเข้มข้นทำปฏิกิริยากับสารตัวอย่างจนถึงจุดสมมูล โดยจำนวนโมลของกรดและเบสสัมพันธ์กันตามสัดส่วนของสมการเคมี ค่า pH จะเปลี่ยนเร็วมากบริเวณจุดสมมูล",
  equationHtml: "M<sub>a</sub>V<sub>a</sub> = M<sub>b</sub>V<sub>b</sub>",
  equationLabels: [
    { label: "Ma, Mb", desc: "ความเข้มข้นโมลาร์ของกรดและเบสตามลำดับ (mol/L)", color: "text-cyan-500" },
    { label: "Va, Vb", desc: "ปริมาตรที่ใช้ปฏิกิริยาของกรดและเบส (L)", color: "text-rose-500" },
    { label: "pH", desc: "ระดับความเป็นกรดเบสสะสมในระบบ", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟไทเทรชัน pH-volume",
    subtitle: "Titration Equivalence Curve",
    xTitle: "ปริมาตร (ml)",
    yTitle: "pH",
    yLabels: ["14", "10", "7", "4", "0"],
    xLabels: ["0", "10", "20", "30", "40"],
    graphType: "curve",
    customPath: "M20,95 Q80,95 100,55 T180,15",
    pathColor: "#a855f7"
  }
};

// 14. Boyle's Law
const boylesLawDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาความสัมพันธ์ผกผันระหว่างความดัน (P) และปริมาตร (V) ของแก๊สที่อุณหภูมิคงที่",
    "ปรับลูกสูบในกระบอกแก๊สเพื่อเปลี่ยนปริมาตรและสังเกตค่าความดันจากเกจ",
    "สร้างกราฟ P-V และตรวจสอบว่าผลคูณ PV มีค่าใกล้คงที่ตามกฎของบอยล์"
  ],
  learningObjectives: [
    "อธิบายกฎของบอยล์ P₁V₁ = P₂V₂ ได้เมื่ออุณหภูมิและจำนวนโมลคงที่",
    "อ่านค่าปริมาตรกระบอกแก๊สและความดันจากเกจเพื่อบันทึกข้อมูลได้",
    "วิเคราะห์กราฟความสัมพันธ์ผกผันและตรวจสอบค่า PV จากข้อมูลทดลองได้"
  ],
  equipments: [
    { id: "gas-syringe", name: "กระบอกแก๊สพร้อมสเกล", role: "ปรับและอ่านค่าปริมาตรแก๊สในระบบปิด", note: "ตรวจให้ลูกสูบเลื่อนได้ลื่นและไม่มีรอยรั่วก่อนเริ่มทดลอง", unit: "ml", tone: "blue", visualKey: "GasSyringeVisual" },
    { id: "pressure-gauge", name: "เกจวัดความดัน", role: "วัดความดันของแก๊สเมื่อปริมาตรเปลี่ยนไป", note: "รอให้เข็มนิ่งก่อนอ่านค่าและบันทึกข้อมูลทุกครั้ง", unit: "kPa", tone: "cyan", visualKey: "PressureGaugeVisual" },
    { id: "piston", name: "ลูกสูบปรับปริมาตร", role: "อัดหรือขยายแก๊สเพื่อเปลี่ยนปริมาตรอย่างควบคุมได้", note: "ปรับทีละช่วงเล็ก ๆ เพื่อหลีกเลี่ยงการเปลี่ยนแปลงรวดเร็วเกินไป", unit: "V", tone: "orange", visualKey: "PistonVisual" },
    { id: "thermometer-boyle", name: "เทอร์โมมิเตอร์", role: "ตรวจสอบให้อุณหภูมิของระบบคงที่ระหว่างทดลอง", note: "กฎของบอยล์ใช้ได้เมื่ออุณหภูมิและจำนวนโมลของแก๊สคงที่", unit: "°C", tone: "rose", visualKey: "ThermometerVisual" },
    { id: "gas-sample", name: "ตัวอย่างแก๊สในระบบปิด", role: "แก๊สปริมาณคงที่สำหรับศึกษาความสัมพันธ์ P-V", note: "ระบบต้องปิดสนิทเพื่อให้จำนวนโมลของแก๊สไม่เปลี่ยนระหว่างทดลอง", unit: "n", tone: "amber", visualKey: "GasMoleculesVisual" }
  ],
  steps: [
    { num: 1, title: "ตั้งระบบแก๊สปิด", desc: "เตรียมกระบอกแก๊สและตรวจให้ลูกสูบกับข้อต่อไม่มีการรั่ว", iconKey: "FlaskConical", color: "text-cyan-500", bg: "bg-cyan-50" },
    { num: 2, title: "กำหนดปริมาตรเริ่มต้น", desc: "ตั้งปริมาตรแก๊สเริ่มต้นและคงอุณหภูมิของระบบให้เสถียร", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 3, title: "อ่านค่าความดัน", desc: "ปรับลูกสูบทีละช่วงและบันทึกความดันจากเกจเมื่อค่าเริ่มนิ่ง", iconKey: "Gauge", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "พล็อตกราฟ P-V", desc: "นำข้อมูลความดันและปริมาตรมาวิเคราะห์ความสัมพันธ์แบบผกผัน", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎของบอยล์ (Boyle's Law) อธิบายว่า สำหรับแก๊สปริมาณคงที่ที่อุณหภูมิคงที่ ความดันของแก๊สจะแปรผกผันกับปริมาตร เมื่อปริมาตรลดลง โมเลกุลแก๊สชนผนังภาชนะถี่ขึ้น ความดันจึงเพิ่มขึ้น",
  equationHtml: "P<sub>1</sub>V<sub>1</sub> = P<sub>2</sub>V<sub>2</sub>",
  equationLabels: [
    { label: "P", desc: "ความดันของโมเลกุลแก๊สในสภาวะควบคุม (kPa)", color: "text-cyan-500" },
    { label: "V", desc: "ปริมาตรกระบอกหรือภาชนะปิดแก๊ส (L/ml)", color: "text-blue-500" },
    { label: "PV", desc: "ผลคูณความต่างแปรคงที่ตามกฎของแก๊ส", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟความสัมพันธ์ P-V",
    subtitle: "Boyle's Inverse Curve (Constant T)",
    xTitle: "ปริมาตร (ml)",
    yTitle: "ความดัน (kPa)",
    yLabels: ["200", "150", "100", "50"],
    xLabels: ["250", "400", "550", "700", "800"],
    graphType: "curve",
    customPath: "M20,20 Q60,80 180,95",
    pathColor: "#3b82f6"
  }
};

// 15. Charles's Law
const charlesLawDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาความสัมพันธ์เชิงเส้นระหว่างอุณหภูมิสัมบูรณ์ (T) และปริมาตร (V) ของแก๊สที่ความดันคงที่",
    "ปรับอุณหภูมิของอ่างน้ำควบคุมและสังเกตการขยายตัวของแก๊สในกระบอกลูกสูบ",
    "สร้างกราฟ V-T และตรวจสอบว่าอัตราส่วน V/T มีค่าใกล้คงที่ตามกฎของชาร์ล"
  ],
  learningObjectives: [
    "อธิบายกฎของชาร์ล V₁/T₁ = V₂/T₂ ได้เมื่อความดันและจำนวนโมลคงที่",
    "อ่านค่าอุณหภูมิ ปริมาตร และแปลงอุณหภูมิเป็นหน่วยเคลวินได้ถูกต้อง",
    "วิเคราะห์กราฟเส้นตรง V-T และตรวจสอบค่า V/T จากข้อมูลทดลองได้"
  ],
  equipments: [
    { id: "gas-cylinder", name: "กระบอกแก๊สพร้อมลูกสูบ", role: "บรรจุแก๊สในระบบปิดและปล่อยให้ปริมาตรเปลี่ยนตามอุณหภูมิ", note: "ลูกสูบต้องขยับได้อิสระเพื่อรักษาความดันให้ใกล้คงที่", unit: "ml", tone: "orange", visualKey: "PistonVisual" },
    { id: "water-bath", name: "อ่างน้ำควบคุมอุณหภูมิ", role: "ปรับอุณหภูมิของแก๊สอย่างสม่ำเสมอทั้งระบบ", note: "ค่อย ๆ เพิ่มหรือลดอุณหภูมิเพื่อให้แก๊สมีเวลาปรับสมดุล", unit: "°C", tone: "cyan", visualKey: "HotWaterVisual" },
    { id: "thermometer-charles", name: "เทอร์โมมิเตอร์", role: "วัดอุณหภูมิของอ่างน้ำและแก๊สก่อนบันทึกปริมาตร", note: "แปลงค่าอุณหภูมิเป็นเคลวินเมื่อตรวจสอบอัตราส่วน V/T", unit: "K", tone: "rose", visualKey: "ThermometerVisual" },
    { id: "pressure-check", name: "เกจตรวจความดัน", role: "ช่วยตรวจว่าความดันระหว่างทดลองยังคงที่", note: "หากความดันเปลี่ยนมากเกินไปให้รอให้ลูกสูบกลับสู่สมดุลก่อน", unit: "kPa", tone: "blue", visualKey: "PressureGaugeVisual" },
    { id: "gas-sample-charles", name: "ตัวอย่างแก๊สปริมาณคงที่", role: "แก๊สที่ใช้ศึกษาความสัมพันธ์ระหว่างปริมาตรกับอุณหภูมิ", note: "ระบบต้องไม่รั่วเพื่อให้จำนวนโมลคงที่ตลอดการทดลอง", unit: "n", tone: "amber", visualKey: "GasMoleculesVisual" }
  ],
  steps: [
    { num: 1, title: "ตั้งระบบความดันคงที่", desc: "เตรียมกระบอกแก๊สพร้อมลูกสูบให้ขยับได้อิสระและระบบไม่รั่ว", iconKey: "Gauge", color: "text-cyan-500", bg: "bg-cyan-50" },
    { num: 2, title: "กำหนดอุณหภูมิเริ่มต้น", desc: "วัดอุณหภูมิแก๊สเริ่มต้นและแปลงเป็นหน่วยเคลวินก่อนคำนวณ", iconKey: "Thermometer", color: "text-orange-500", bg: "bg-orange-50" },
    { num: 3, title: "ปรับอ่างน้ำควบคุม", desc: "เพิ่มหรือลดอุณหภูมิทีละช่วง แล้วรอให้ปริมาตรนิ่งก่อนอ่านค่า", iconKey: "Flame", color: "text-rose-500", bg: "bg-rose-50" },
    { num: 4, title: "พล็อตกราฟ V-T", desc: "นำข้อมูลปริมาตรและอุณหภูมิสัมบูรณ์มาวิเคราะห์ความสัมพันธ์แบบเส้นตรง", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎของชาร์ล (Charles's Law) อธิบายว่า สำหรับแก๊สปริมาณคงที่ภายใต้ความดันคงที่ ปริมาตรของแก๊สจะแปรผันตรงกับอุณหภูมิสัมบูรณ์ เมื่ออุณหภูมิเพิ่มขึ้น โมเลกุลแก๊สเคลื่อนที่เร็วขึ้นและดันลูกสูบให้ปริมาตรเพิ่มขึ้น",
  equationHtml: "V<sub>1</sub> / T<sub>1</sub> = V<sub>2</sub> / T<sub>2</sub>",
  equationLabels: [
    { label: "V", desc: "ปริมาตรของแก๊ส (Liter)", color: "text-orange-500" },
    { label: "T", desc: "อุณหภูมิสัมบูรณ์ในหน่วยเคลวิน (K)", color: "text-rose-500" },
    { label: "V/T", desc: "ค่าคงตัวของอัตราส่วนเมื่อความดันคงที่", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟความสัมพันธ์ V-T",
    subtitle: "Charles's Linear Curve (Constant P)",
    xTitle: "อุณหภูมิ (°C)",
    yTitle: "ปริมาตร (ml)",
    yLabels: ["660", "600", "540", "480"],
    xLabels: ["0", "20", "40", "60", "80"],
    graphType: "line",
    solidLineCoords: { x1: 20, y1: 95, x2: 180, y2: 20 },
    pathColor: "#f97316"
  }
};

// 16. Photosynthesis Rate
const photosynthesisDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาปัจจัยที่มีผลต่ออัตราการสังเคราะห์แสง ได้แก่ ความเข้มแสง CO₂ อุณหภูมิ และน้ำ",
    "ติดตามการเกิดออกซิเจนใน chamber พืชแบบปิดเพื่อประเมินอัตราปฏิกิริยา",
    "เปรียบเทียบกราฟ rate-time เพื่อระบุปัจจัยจำกัดของกระบวนการสังเคราะห์แสง"
  ],
  learningObjectives: [
    "อธิบายสมการสังเคราะห์แสงและบทบาทของแสง CO₂ และน้ำได้",
    "อ่านค่าอัตราการเกิดออกซิเจนและตีความสภาวะที่เหมาะสมของพืชได้",
    "วิเคราะห์แนวคิดปัจจัยจำกัดเมื่อปรับตัวแปรแวดล้อมทีละตัวได้"
  ],
  equipments: [
    { id: "plant-chamber", name: "ห้องเพาะเลี้ยงพืชแบบปิด", role: "บรรจุต้นพืชและควบคุมสภาพแวดล้อมระหว่างการสังเคราะห์แสง", note: "ปิดฝาห้องให้สนิทเพื่อให้การวัด CO₂ และ O₂ มีความสม่ำเสมอ", unit: "chamber", tone: "cyan", visualKey: "PlantChamberVisual" },
    { id: "grow-light", name: "โคมไฟปรับความเข้มแสง", role: "จำลองระดับแสงที่พืชได้รับเพื่อศึกษาปัจจัยจำกัด", note: "ปรับความเข้มแสงทีละช่วงและสังเกตอัตราการผลิตออกซิเจน", unit: "%", tone: "amber", visualKey: "GrowLightVisual" },
    { id: "co2-tank", name: "แหล่งจ่ายคาร์บอนไดออกไซด์", role: "ควบคุมระดับ CO₂ ภายในห้องทดลองพืช", note: "เพิ่ม CO₂ อย่างค่อยเป็นค่อยไปเพื่อดูจุดที่แสงหรืออุณหภูมิกลายเป็นปัจจัยจำกัด", unit: "ppm", tone: "blue", visualKey: "CO2TankVisual" },
    { id: "oxygen-sensor", name: "เซนเซอร์วัดออกซิเจน", role: "ติดตาม O₂ ที่เกิดจากกระบวนการสังเคราะห์แสงแบบต่อเนื่อง", note: "รอให้ค่าเซนเซอร์นิ่งก่อนใช้ข้อมูลจุดนั้นสรุปผล", unit: "O₂", tone: "orange", visualKey: "OxygenSensorVisual" },
    { id: "water-reservoir", name: "ถังน้ำและระบบให้ความชื้น", role: "ควบคุมปริมาณน้ำที่พืชใช้ในกระบวนการสังเคราะห์แสง", note: "น้ำต่ำเกินไปจะลดอัตรารวมแม้แสงและ CO₂ เพียงพอ", unit: "H₂O", tone: "rose", visualKey: "WaterReservoirVisual" }
  ],
  steps: [
    { num: 1, title: "เตรียมห้องพืชปิด", desc: "วางต้นพืชใน chamber และตรวจให้ระบบวัดแก๊สพร้อมทำงาน", iconKey: "Leaf", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 2, title: "ปรับความเข้มแสง", desc: "ตั้งระดับแสงจากโคมไฟและรอให้ระบบเข้าสู่สมดุล", iconKey: "Sun", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "ควบคุม CO₂ และน้ำ", desc: "ปรับระดับคาร์บอนไดออกไซด์และน้ำเพื่อศึกษาปัจจัยจำกัด", iconKey: "Wind", color: "text-cyan-500", bg: "bg-cyan-50" },
    { num: 4, title: "วิเคราะห์กราฟอัตรา", desc: "ติดตาม O₂ และอัตราสังเคราะห์แสงเพื่อสรุปสภาพที่เหมาะสม", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "การสังเคราะห์แสงเป็นกระบวนการที่พืชใช้พลังงานแสงเปลี่ยนคาร์บอนไดออกไซด์และน้ำให้เป็นน้ำตาลกลูโคส พร้อมปล่อยออกซิเจน อัตราการเกิดปฏิกิริยาขึ้นกับปัจจัยจำกัด เช่น ความเข้มแสง CO₂ อุณหภูมิ และน้ำ",
  equationHtml: "6CO<sub>2</sub> + 6H<sub>2</sub>O → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub>",
  equationLabels: [
    { label: "Light", desc: "แสงเหนี่ยวนำปฏิกิริยาและให้คลื่นพลังงานกระตุ้น", color: "text-emerald-500" },
    { label: "CO2", desc: "คาร์บอนไดออกไซด์สารตั้งต้นคาร์บอนหลักของน้ำตาล", color: "text-cyan-500" },
    { label: "O2", desc: "แก๊สออกซิเจนที่ปลดปล่อยออกมาเป็นผลผลิตปฏิกิริยา", color: "text-blue-500" }
  ],
  graph: {
    title: "กราฟอัตรา O₂ ตามเวลา",
    subtitle: "Photosynthetic Rate Dynamics",
    xTitle: "เวลา",
    yTitle: "อัตรา O₂",
    yLabels: ["100", "75", "50", "25", "0"],
    xLabels: ["0", "2", "4", "6", "8", "10"],
    graphType: "line",
    solidLineCoords: { x1: 20, y1: 100, x2: 180, y2: 25 },
    pathColor: "#22c55e"
  }
};

// 17. Mendelian Genetics
const mendelianDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาการถ่ายทอดลักษณะทางพันธุกรรมแบบยีนเดียวตามกฎของเมนเดล",
    "ใช้ตาราง Punnett คาดการณ์จีโนไทป์และฟีโนไทป์ของรุ่นลูก",
    "เปรียบเทียบสัดส่วนที่สุ่มได้กับสัดส่วนทางทฤษฎี เช่น 3:1 หรือ 1:2:1"
  ],
  learningObjectives: [
    "อธิบายความแตกต่างของ genotype และ phenotype ได้อย่างถูกต้อง",
    "คำนวณและตีความผลจากตาราง Punnett สำหรับการผสมแบบ monohybrid ได้",
    "วิเคราะห์ความคลาดเคลื่อนระหว่างผลสุ่มกับค่าทฤษฎีเมื่อจำนวนตัวอย่างเปลี่ยนได้"
  ],
  equipments: [
    { id: "pea-plants", name: "ต้นถั่วลันเตาจำลอง", role: "ใช้แทนพ่อแม่ที่มีลักษณะทางพันธุกรรมต่างกัน", note: "เลือก genotype ของพ่อแม่ให้ชัดก่อนสร้างตาราง Punnett", unit: "P", tone: "cyan", visualKey: "PeaPlantVisual" },
    { id: "punnett-square", name: "ตาราง Punnett", role: "แสดงความเป็นไปได้ของ genotype รุ่นลูกจากแอลลีลพ่อแม่", note: "ใช้เปรียบเทียบสัดส่วนทฤษฎีกับผลสุ่มในแบบจำลอง", unit: "table", tone: "emerald", visualKey: "WiresVisual" },
    { id: "seed-counter", name: "เครื่องนับและคัดแยกเมล็ดถั่ว", role: "ช่วยแจงสัดส่วนลักษณะสี/ผิวเมล็ดสะสมทีละรุ่น", note: "เพิ่มปริมาณตัวอย่าง (N) สูงขึ้นเพื่อเห็นอัตราเข้าใกล้ 3:1", unit: "pcs", tone: "amber", visualKey: "StopwatchVisual" }
  ],
  steps: [
    { num: 1, title: "เลือกพ่อแม่", desc: "กำหนด genotype ของพ่อแม่ทั้งสองสำหรับลักษณะที่ต้องการศึกษา", iconKey: "Dna", color: "text-violet-500", bg: "bg-violet-50" },
    { num: 2, title: "สร้างตาราง Punnett", desc: "จับคู่แอลลีลจาก gamete ของพ่อแม่เพื่อดูความเป็นไปได้ของรุ่นลูก", iconKey: "ClipboardList", color: "text-cyan-500", bg: "bg-cyan-50" },
    { num: 3, title: "สุ่มรุ่นลูก", desc: "จำลองลูกหลานหลายตัวอย่างเพื่อดูสัดส่วนสะสม", iconKey: "Shuffle", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "เปรียบเทียบอัตราส่วน", desc: "นับ genotype และ phenotype แล้วเทียบกับค่าทฤษฎี", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎของเมนเดลอธิบายการถ่ายทอดลักษณะทางพันธุกรรมผ่านแอลลีลจากพ่อแม่สู่รุ่นลูก ตาราง Punnett ช่วยคาดการณ์สัดส่วน genotype และ phenotype ของรุ่นลูกจากการผสมแบบยีนเดียว",
  equationHtml: "Yy &times; Yy &rarr; 1:2:1",
  equationLabels: [
    { label: "Genotype", desc: "สัดส่วนคู่แอลลีลเด่นและด้อย (1 YY : 2 Yy : 1 yy)", color: "text-violet-500" },
    { label: "Phenotype", desc: "สัดส่วนลักษณะแสดงออกเด่นและด้อย (3 เด่น : 1 ด้อย)", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟสัดส่วน phenotype",
    subtitle: "Mendelian Ratio Convergence",
    xTitle: "จีโนไทป์",
    yTitle: "สัดส่วน",
    yLabels: ["100", "75", "50", "25", "0"],
    xLabels: ["YY", "Yy", "yy"],
    graphType: "mendelian",
    pathColor: "#22c55e"
  }
};

// 18. Mitosis & Cell Cycle
const mitosisDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาลำดับระยะของวัฏจักรเซลล์และการแบ่งนิวเคลียสแบบไมโทซิส",
    "สังเกตการขดตัว การเรียงตัว และการแยกของโครโมโซมในแต่ละระยะ",
    "วิเคราะห์บทบาทของ checkpoint ที่ช่วยลดข้อผิดพลาดระหว่างการแบ่งเซลล์"
  ],
  learningObjectives: [
    "จำแนกระยะ Interphase, Prophase, Metaphase, Anaphase, Telophase และ Cytokinesis ได้",
    "อธิบายการแยกโครมาทิดและการเกิดเซลล์ลูกที่มีชุดโครโมโซมเหมือนเดิมได้",
    "เชื่อมโยง checkpoint กับความถูกต้องของการแบ่งเซลล์ได้"
  ],
  equipments: [
    { id: "onion-slide", name: "สไลด์เซลล์ปลายรากหอม", role: "ตัวอย่างเนื้อเยื่อพืชที่มักมีอัตราแบ่งตัวในสภาวะวัฏจักรเซลล์สูง", note: "โฟกัสในหลายจุดเพื่อประเมินจํานวนสัดส่วนระยะเฉลี่ยในภาพรวม", unit: "slide", tone: "blue", visualKey: "CuvetteVisual" },
    { id: "virtual-microscope", name: "กล้องจุลทรรศน์เสมือน (Virtual Microscope)", role: "กำลังขยายสูง 40x และ 100x สำหรับดูรายละเอียดโครงสร้างโครโมโซม", note: "ปรับตั้งความชัดเลนส์และสไลด์พิกัดตําแหน่งดูเซลล์เดี่ยว", unit: "mag", tone: "cyan", visualKey: "SpectrophotometerVisual" },
    { id: "stage-marker", name: "เครื่องวิเคราะห์สถิติระยะแบ่งเซลล์", role: "จดบันทึกจํานวนเซลล์สะสมในระยะ IPMAT ต่างๆ", note: "คำนวณสัดส่วนเวลาเฉลี่ยที่ใช้ในแต่ละระยะสัมบูรณ์", unit: "cells", tone: "emerald", visualKey: "StopwatchVisual" }
  ],
  steps: [
    { num: 1, title: "เตรียมเซลล์", desc: "เริ่มจาก Interphase ที่ DNA ถูกจำลองก่อนแบ่งเซลล์", iconKey: "Microscope", color: "text-cyan-500", bg: "bg-cyan-50" },
    { num: 2, title: "โครโมโซมขดแน่น", desc: "เข้าสู่ Prophase และเตรียมโครงสร้าง spindle", iconKey: "Dna", color: "text-violet-500", bg: "bg-violet-50" },
    { num: 3, title: "เรียงและแยก", desc: "Metaphase เรียงกลางเซลล์ ก่อน Anaphase แยกโครมาทิด", iconKey: "Activity", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 4, title: "เกิดเซลล์ลูก", desc: "Telophase และ Cytokinesis ทำให้ได้เซลล์ลูกสองเซลล์", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" }
  ],
  theoryDescription: "ไมโทซิสเป็นกระบวนการแบ่งนิวเคลียสของเซลล์ร่างกาย ทำให้เซลล์ลูกสองเซลล์มีชุดโครโมโซมเหมือนเซลล์แม่ ระยะสำคัญได้แก่ Prophase, Metaphase, Anaphase และ Telophase ตามด้วย Cytokinesis",
  equationHtml: "Interphase &rarr; PMAT &rarr; Cytokinesis",
  equationLabels: [
    { label: "PMAT", desc: "ระยะหลักในการเรียงตัว ขจัดเยื่อหุ้ม และแยกโครมาทิดออกจากกัน", color: "text-cyan-500" },
    { label: "DNA", desc: "สารพันธุกรรมถูกคัดลอกเพิ่มเป็น 2 เท่าในระยะ S ของ Interphase", color: "text-violet-500" },
    { label: "Result", desc: "เซลล์ลูก 2 เซลล์ที่มีสารพันธุกรรมและโครโมโซมเหมือนแม่ 100%", color: "text-emerald-500" }
  ],
  graph: {
    title: "แผนภาพลำดับระยะ IPMAT",
    subtitle: "Cell Division Stage Timeline",
    xTitle: "ลำดับเวลา",
    yTitle: "ปริมาณดีเอ็นเอ",
    yLabels: ["4C", "3C", "2C", "1C", "0"],
    xLabels: ["Inter", "Pro", "Meta", "Ana", "Telo"],
    graphType: "mitosis",
    pathColor: "#10b981"
  }
};

// 19. Chemical Equilibrium Shift (Le Chatelier)
const leChateliersDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาการเปลี่ยนแปลงสมดุลเคมีเมื่อรบกวนระบบด้วยความดัน อุณหภูมิ และความเข้มข้นสารตามหลักของเลอชาเตอลิเย",
    "ผสมสารตั้งต้นและสังเกตการเปลี่ยนสีของสารละลายสมดุลเคมี",
    "ประเมินและทบทวนทิศทางการปรับตัวของปฏิกิริยากลับเข้าสู่สมดุลใหม่"
  ],
  learningObjectives: [
    "อธิบายหลักของเลอชาเตอลิเยเมื่อระบบได้รับปัจจัยรบกวนภายนอกได้",
    "ระบุทิศทางการเปลี่ยนสมดุล (เลื่อนซ้าย/ขวา) จากการเปลี่ยนสีสารละลายได้",
    "คำนวณและอธิบายผลของอุณหภูมิต่อค่าคงที่สมดุล (Kc) ได้ถูกต้อง"
  ],
  equipments: [
    { id: "equilibrium-tubes", name: "ชุดหลอดทดลองสมดุลเคมี", role: "ใช้เปรียบเทียบสีของสารละลายที่สภาวะสมดุลควบคุมและสภาวะที่ถูกรบกวน", note: "ประกอบด้วยหลอดควบคุม และหลอดทดลองการเปลี่ยนอุณหภูมิ/ความเข้มข้น", unit: "ชุด", tone: "rose", visualKey: "EquilibriumTubesVisual" },
    { id: "fe-scn-solutions", name: "สารละลาย FeCl₃ และ KSCN", role: "สารตั้งต้นสำหรับเกิดปฏิกิริสารประกอบเชิงซ้อนสีแดงของ [Fe(SCN)]²⁺", note: "ความเข้มข้นต่ำมากเพื่อให้อ่านค่าสีและการเปลี่ยนแปลงได้ชัดเจน", unit: "M", tone: "amber", visualKey: "BeakerVisual" },
    { id: "naf-solution", name: "สารละลาย Sodium Fluoride (NaF)", role: "สารรรบกวนระบบโดยทำปฏิกิริยากับ Fe³⁺ เกิดเป็นสารประกอบเชิงซ้อนไม่มีสี [FeF₆]³⁻", note: "ช่วยให้สังเกตการเลื่อนของสมดุลกลับมาทางซ้ายได้ชัดเจน", unit: "M", tone: "blue", visualKey: "PipetteVisual" },
    { id: "temp-water-bath", name: "อ่างน้ำร้อน-อ่างน้ำเย็น", role: "ใช้ปรับเปลี่ยนอุณหภูมิของระบบเพื่อรบกวนสมดุลเคมี (ตามผลของปฏิกิริยาดูด/คายความร้อน)", note: "น้ำร้อน 70-80°C และน้ำแข็งน้ำเย็นใกล้ 0°C", unit: "°C", tone: "orange", visualKey: "HeaterCoolerVisual" }
  ],
  steps: [
    { num: 1, title: "เตรียมสารตั้งต้น Fe³⁺ และ SCN⁻", desc: "ผสม FeCl₃ และ KSCN เจือจางในบีกเกอร์ เพื่อให้สารละลายเกิดสีแดงจาง ๆ ของสมดุลควบคุม", iconKey: "FlaskConical", color: "text-rose-500", bg: "bg-rose-50" },
    { num: 2, title: "รบกวนโดยเพิ่มความเข้มข้น", desc: "หยด FeCl₃ หรือ KSCN เพิ่มเติม สังเกตการเลื่อนตัวของสมดุลและสีแดงที่เข้มขึ้น", iconKey: "Droplets", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "รบกวนโดยลดสาร (เติม NaF)", desc: "หยด NaF เพื่อทำลาย Fe³⁺ ในระบบ สังเกตสีแดงที่เจือจางลงเนื่องจากสมดุลเลื่อนกลับทางซ้าย", iconKey: "Zap", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 4, title: "ปรับอุณหภูมิควบคุม", desc: "แช่หลอดทดลองในอ่างน้ำร้อน/เย็น สังเกตการเปลี่ยนแปลงเพื่อระบุว่าปฏิกิริยาเป็นดูดหรือคายความร้อน", iconKey: "Thermometer", color: "text-orange-500", bg: "bg-orange-50" }
  ],
  theoryDescription: "หลักการของเลอชาเตอลิเย (Le Chatelier's Principle) กล่าวว่า เมื่อระบบที่อยู่ในสภาวะสมดุลถูกรบกวนโดยการเปลี่ยนแปลงปัจจัย เช่น ความเข้มข้น อุณหภูมิ หรือความดัน ระบบจะเกิดปฏิกิริยาย้อนกลับหรือไปข้างหน้าในทิศทางที่จะลดผลของการรบกวนนั้น เพื่อเข้าสู่สมดุลใหม่อีกครั้ง",
  equationHtml: "K<sub>c</sub> = [[Fe(SCN)]<sup>2+</sup>] / ([Fe<sup>3+</sup>][SCN<sup>-</sup>])",
  equationLabels: [
    { label: "Fe³⁺", desc: "ไอออนของเหล็ก มีสีส้ม/เหลืองจางๆ ในสารละลาย", color: "text-rose-500" },
    { label: "[Fe(SCN)]²⁺", desc: "สารประกอบเชิงซ้อนสมดุล มีสีแดงเลือดนก/แดงเข้ม", color: "text-amber-500" },
    { label: "NaF", desc: "สารละลายนําเข้าเพื่อรบกวนระบบและขจัดเหล็กไอออน", color: "text-blue-500" }
  ],
  graph: {
    title: "กราฟความเข้มข้นสารประกอบเชิงซ้อนตามเวลา",
    subtitle: "Le Chatelier Concentration Shifts",
    xTitle: "เวลา (s)",
    yTitle: "ความเข้มข้น",
    yLabels: ["สูง", "กลาง", "ต่ำ"],
    xLabels: ["0", "20", "40", "60", "80"],
    graphType: "le-chatelier",
    pathColor: "#ef4444",
    dashedLineX: 80
  }
};

// 20. Beer-Lambert Law
const beerLambertDetails: LabDetailData = {
  overviewBullets: [
    "วัดการดูดกลืนแสงของสารละลายที่มีความเข้มข้นต่างกันเพื่อสร้างกราฟมาตรฐานตามกฎของเบียร์-ลัมแบร์ต",
    "ปรับเปลี่ยนความยาวคลื่นดูดกลืนแสงเดี่ยว และความกว้างคิวเวตต์ช่องแสงผ่าน",
    "สร้างสเกลพล็อตกราฟมาตรฐานเพื่อหาความเข้มข้นสารละลายตัวอย่างไม่ทราบค่า"
  ],
  learningObjectives: [
    "อธิบายสมการเชิงเส้น A = ε·c·b ตามกฎเบียร์-ลัมแบร์ตได้ถูกต้อง",
    "ใช้เครื่องสเปกโทรโฟโตมิเตอร์วัดปริมาณดูดกลืนแสง Blank และตัวอย่างได้เป็นระบบ",
    "ประเมินและคํานวณหาความเข้มข้นของสารละลายปริศนาจากเส้นกราฟคาลิเบรชันได้"
  ],
  equipments: [
    { id: "spectrophotometer-device", name: "เครื่องสเปกโทรโฟโตมิเตอร์", role: "แหล่งกำเนิดแสงช่วงคลื่นเดี่ยวและตรวจวัดความเข้มแสงที่ผ่านสารละลาย", note: "ตรวจสอบการคาลิเบรตเครื่องด้วยน้ำกลั่น (Blank) ก่อนเริ่มวัดค่าจริง", unit: "ชุด", tone: "blue", visualKey: "SpectrophotometerVisual" },
    { id: "optical-cuvette", name: "คิวเวตต์แก้วมาตรฐาน (Cuvette)", role: "หลอดใสสี่เหลี่ยมสำหรับใส่สารละลายตัวอย่าง มีขนาดความกว้างแสงผ่าน 1 cm และ 2 cm", note: "ห้ามสัมผัสด้านใสที่แสงผ่านเพื่อหลีกเลี่ยงการหักเหแสงจากรอยนิ้วมือ", unit: "cm", tone: "cyan", visualKey: "CuvetteVisual" },
    { id: "solute-concentrates", name: "สารละลายเกลือโลหะสีเข้มข้น", role: "สารละลายทองแดงซัลเฟต (CuSO₄) หรือโคบอลต์คลอไรด์ (CoCl₂) ที่มีความเข้มข้นต่าง ๆ", note: "เตรียมสารเจือจางความเข้มข้นอย่างเป็นระบบเพื่อใช้สร้างกราฟมาตรฐาน", unit: "M", tone: "amber", visualKey: "BeakerVisual" },
    { id: "deionized-water", name: "น้ำกลั่นบริสุทธิ์ (DI Water)", role: "ใช้สำหรับเตรียมสารละลายเจือจางและใช้เป็น Blank สำหรับหักลบค่าการดูดกลืนแสงเริ่มต้น", note: "ล้างคิวเวตต์ด้วยน้ำกลั่นและเช็ดให้แห้งสนิททุกครั้งก่อนเปลี่ยนความเข้มข้น", unit: "ml", tone: "cyan", visualKey: "PipetteVisual" }
  ],
  steps: [
    { num: 1, title: "เลือกสารละลายและ Blank", desc: "เลือกชนิดสารละลายเกลือโลหะ ปรับความยาวคลื่นดูดกลืนแสงสูงสุด และคาลิเบรตด้วยน้ำกลั่น", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "วัดสารมาตรฐานความเข้มข้นสูง", desc: "ใส่คิวเวตต์สารละลายความเข้มข้นสูงสุด บันทึกค่าความดูดกลืนแสง (A)", iconKey: "FlaskConical", color: "text-cyan-500", bg: "bg-cyan-50" },
    { num: 3, title: "สร้างกราฟมาตรฐาน (Calibration)", desc: "เจือจางความเข้มข้นทีละระดับ วัดและสร้างกราฟความสัมพันธ์เชิงเส้นระหว่าง A และ C", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "หาความเข้มข้นตัวอย่าง", desc: "วัดสารละลายตัวอย่างไม่ทราบความเข้มข้น นำมาคำนวณผ่านกฎเบียร์-ลัมเบิร์ตหาความเข้มข้นจริง", iconKey: "ClipboardList", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎของเบียร์-ลัมเบิร์ต (Beer-Lambert Law) อธิบายว่า ความดูดกลืนแสง (Absorbance, A) ของสารละลายจะเป็นสัดส่วนโดยตรงกับความเข้มข้นของสารดูดกลืนแสง (c) และความกว้างของคิวเวตต์ที่แสงเดินทางผ่าน (b) โดยสัมพันธ์ในรูปสมการเชิงเส้น A = ε·c·b",
  equationHtml: "A = &epsilon; &times; c &times; b",
  equationLabels: [
    { label: "A", desc: "ความต่างดูดกลืนแสงของสารละลาย (Absorbance)", color: "text-indigo-500" },
    { label: "c", desc: "ความเข้มข้นเนื้อสารละลายเคมี (mol/L)", color: "text-rose-500" },
    { label: "b", desc: "ความกว้างแสงผ่านตัวกลางกระบอกแก้ว (Cuvette width)", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟมาตรฐานการดูดกลืนแสงความเข้มข้น (A - c)",
    subtitle: "Beer-Lambert Absorbance Calibration Curve",
    xTitle: "ความเข้มข้น c",
    yTitle: "ดูดกลืนแสง A",
    yLabels: ["สูง", "กลาง", "ต่ำ"],
    xLabels: ["0", "0.1", "0.2", "0.3", "0.4"],
    graphType: "line",
    solidLineCoords: { x1: 20, y1: 95, x2: 180, y2: 25 },
    pathColor: "#06b6d4"
  }
};

// 21. Hess's Law
const hesssLawDetails: LabDetailData = {
  overviewBullets: [
    "ทดลองวัดความร้อนของปฏิกิริยาเคมีหลายขั้นตอนเพื่อพิสูจน์ความไม่ขึ้นกับเส้นทางของเอนทัลปีรวมตามกฎของเฮสส์",
    "ประยุกต์ใช้แคลอริมิเตอร์ถ้วยโฟมและบันทึกอุณหภูมิสูงสุดแต่ละช่วง",
    "สรุปแนวคิดเอนทัลปีรวม (State Function) จากการรวมค่าผลต่างความร้อนย่อย"
  ],
  learningObjectives: [
    "อธิบายกฎของเฮสส์และระบุความสัมพันธ์สมการเอนทัลปีสะสมได้",
    "วัดอุณหภูมิ คํานวณมวลสาร และหาปริมาณความร้อนจำลองได้เที่ยงตรง",
    "เปรียบเทียบผลรวมขั้นตอนทางอ้อมและผลทางตรงยืนยันการอนุรักษ์พลังงานได้"
  ],
  equipments: [
    { id: "foam-calorimeter", name: "แคลอริมิเตอร์ถ้วยโฟม (Calorimeter)", role: "ระบบเกือบปิดจำลองสภาวะอะเดียแบติก (ความดันคงที่และจำกัดการถ่ายเทความร้อนภายนอก)", note: "ประกอบด้วยถ้วยโฟมซ้อนกันสองชั้นเพื่อลดการสูญเสียความร้อนไปยังสิ่งแวดล้อม", unit: "ชุด", tone: "cyan", visualKey: "CalorimeterVisual" },
    { id: "chemical-reactants-hess", name: "สารเคมี NaOH (โซเดียมไฮดรอกไซด์) และ HCl (กรดไฮโดรคลอริก)", role: "สารเคมีหลักสำหรับทำปฏิกิริยา 3 ขั้นตอนเพื่อยืนยันกฎของเฮสส์", note: "ระมัดระวังการสัมผัสโซดาไฟเม็ด และไอระเหยเข้มข้นของกรดไฮโดรคลอริก", unit: "g / M", tone: "rose", visualKey: "BeakerVisual" },
    { id: "temp-probe-calorimetry", name: "หัววัดอุณหภูมิแบบดิจิทัล / เทอร์โมมิเตอร์", role: "ตรวจวัดอุณหภูมิที่เปลี่ยนไปของน้ำ/สารละลายเพื่อคำนวณปริมาณความร้อน (q = mcΔT)", note: "มีความละเอียดสูงถึง 0.1°C เพื่อความแม่นยำในการหาอุณหภูมิสูงสุด", unit: "°C", tone: "orange", visualKey: "ThermometerVisual" },
    { id: "stirring-bar", name: "แท่งแก้วคนสารละลาย", role: "ช่วยเร่งการละลายและการผสมของสารให้เกิดปฏิกิริยาอย่างทั่วถึงและรวดเร็ว", note: "คนอย่างสม่ำเสมอและระวังอย่าให้แท่งแก้วกระทบกระแทกหัววัดเทอร์โมมิเตอร์", unit: "อัน", tone: "blue", visualKey: "PipetteVisual" }
  ],
  steps: [
    { num: 1, title: "ทดลองขั้นที่ 1 (ปฏิกิริยาโดยตรง)", desc: "ทำปฏิกิริยาระหว่าง NaOH(s) และ HCl(aq) ในถ้วยโฟม บันทึกอุณหภูมิที่เพิ่มขึ้น หาค่า ΔH₁", iconKey: "Thermometer", color: "text-rose-500", bg: "bg-rose-50" },
    { num: 2, title: "ทดลองขั้นที่ 2 (การละลาย)", desc: "ละลาย NaOH(s) ในน้ำกลั่น บันทึกอุณหภูมิที่เปลี่ยนแปลง คำนวณความร้อนละลายหาค่า ΔH₂", iconKey: "Droplets", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 3, title: "ทดลองขั้นที่ 3 (สะเทินกรด-เบส)", desc: "ทำปฏิกิริยาระหว่างสารละลาย NaOH(aq) ที่ได้กับสารละลาย HCl(aq) บันทึก ΔH₃", iconKey: "Flame", color: "text-orange-500", bg: "bg-orange-50" },
    { num: 4, title: "ตรวจสอบกฎของเฮสส์", desc: "ตรวจสอบความสัมพันธ์ ΔH₁ ≈ ΔH₂ + ΔH₃ เพื่อพิสูจน์การอนุรักษ์พลังงานในวัฏจักรปฏิกิริยา", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "กฎของเฮสส์ (Hess's Law) กล่าวว่า ค่าการเปลี่ยนแปลงเอนทัลปี (ΔH) ของปฏิกิริยาเคมีใด ๆ จะมีค่าคงที่เสมอไม่ว่าจะเกิดขึ้นในขั้นตอนเดียวหรือหลายขั้นตอน เนื่องจากเอนทัลปีเป็นฟังก์ชันสภาวะ (State Function) โดยผลรวมของเอนทัลปีย่อยในทางอ้อมย่อมเท่ากับเอนทัลปีของเส้นทางตรง (ΔH₁ = ΔH₂ + ΔH₃)",
  equationHtml: "&Delta;H<sub>1</sub> = &Delta;H<sub>2</sub> + &Delta;H<sub>3</sub>",
  equationLabels: [
    { label: "ΔH1 (โดยตรง)", desc: "การคายความร้อนของปฏิกิริยารวมโดยตรง NaOH(s) + HCl(aq)", color: "text-indigo-500" },
    { label: "ΔH2 (ละลาย)", desc: "การละลาย NaOH(s) ในน้ำกลั่นเกิดเป็นสารละลาย", color: "text-blue-500" },
    { label: "ΔH3 (สะเทิน)", desc: "ปฏิกิริยาสะเทินระหว่างกรดแก่และเบสแก่ละลายน้ำ", color: "text-emerald-500" }
  ],
  graph: {
    title: "แผนภาพระดับพลังงาน (Enthalpy Diagram)",
    subtitle: "Hess Cycle State Function Chart",
    xTitle: "ปฏิกิริยา",
    yTitle: "พลังงาน H",
    yLabels: ["สูง", "กลาง", "ต่ำ"],
    xLabels: ["เริ่มต้น", "ทางอ้อม", "สุดท้าย"],
    graphType: "enthalpy"
  }
};

// 22. Galvanic Cell
const galvanicCellDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาการสร้างแรงดันไฟฟ้าจากปฏิกิริยารีดอกซ์ในเซลล์กัลวานิกจำลอง",
    "ปรับสัดส่วนความเข้มข้นของไอออน Q และคุณภาพของสะพานเกลือ",
    "บันทึกค่าแรงดันโวลต์มิเตอร์และทบทวนทิศทางการไหลของอิเล็กตรอน"
  ],
  learningObjectives: [
    "อธิบายบทบาทของแอโนด แคโทด สะพานเกลือ และโวลต์มิเตอร์ในเซลล์กัลวานิกได้",
    "คำนวณแรงดันเซลล์มาตรฐานและประเมินผลของความเข้มข้นด้วยสมการเนิร์นสต์ได้",
    "เชื่อมโยงความต่างศักย์ตกคร่อมกับอัตราการเกิดปฏิกิริยารีดอกซ์ได้ถูกต้อง"
  ],
  equipments: [
    { id: "galvanic-half-cells", name: "บีกเกอร์ครึ่งเซลล์โลหะ", role: "ภาชนะสำหรับใส่สารละลาย ZnSO₄ และ CuSO₄ พร้อมแผ่นโลหะที่ทำหน้าที่เป็นขั้วไฟฟ้า", note: "แยกครึ่งเซลล์ออกจากกันเพื่อให้สังเกตการเกิดออกซิเดชันและรีดักชันได้ชัดเจน", unit: "M", tone: "cyan", visualKey: "BeakerVisual" },
    { id: "galvanic-salt-bridge", name: "สะพานเกลือ (Salt Bridge)", role: "รักษาสมดุลประจุระหว่างครึ่งเซลล์และทำให้วงจรไอออนปิดครบ", note: "ใช้สารละลาย KNO₃ หรือ NaNO₃ ในวุ้นเพื่อหลีกเลี่ยงไอออนรบกวน", unit: "KNO₃", tone: "blue", visualKey: "PipetteVisual" },
    { id: "galvanic-voltmeter", name: "โวลต์มิเตอร์ดิจิทัล", role: "วัดแรงดันไฟฟ้าระหว่างขั้วแอโนดและแคโทดของเซลล์กัลวานิก", note: "ต่อขั้วบวกกับแคโทดและขั้วลบกับแอโนดเพื่ออ่านค่า Ecell ได้ถูกต้อง", unit: "V", tone: "rose", visualKey: "VoltmeterVisual" },
    { id: "galvanic-wires", name: "สายไฟและคลิปปากจระเข้", role: "เชื่อมต่ออิเล็กโทรดกับโวลต์มิเตอร์เพื่อให้เกิดการไหลของอิเล็กตรอนในวงจรภายนอก", note: "ตรวจสอบผิวโลหะและจุดสัมผัสให้สะอาดก่อนเริ่มบันทึกค่า", unit: "Ω", tone: "amber", visualKey: "WiresVisual" }
  ],
  steps: [
    { num: 1, title: "ประกอบครึ่งเซลล์", desc: "เตรียมแผ่น Zn/Cu ในสารละลายไอออนของโลหะและแยกเป็นสองครึ่งเซลล์", iconKey: "FlaskConical", color: "text-cyan-500", bg: "bg-cyan-50" },
    { num: 2, title: "ต่อสะพานเกลือ", desc: "เชื่อมครึ่งเซลล์ด้วยสะพานเกลือเพื่อรักษาสมดุลประจุของสารละลาย", iconKey: "Droplets", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 3, title: "วัดแรงดันไฟฟ้า", desc: "ต่อโวลต์มิเตอร์กับขั้วไฟฟ้าและบันทึกค่า Ecell ที่เกิดจากปฏิกิริยารีดอกซ์", iconKey: "Zap", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 4, title: "วิเคราะห์สมการเนิร์นสต์", desc: "เปรียบเทียบค่าแรงดันเมื่อเปลี่ยนความเข้มข้นไอออนและคำนวณผลของ Q", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "เซลล์กัลวานิกเปลี่ยนพลังงานเคมีจากปฏิกิริยารีดอกซ์ที่เกิดขึ้นเองให้เป็นพลังงานไฟฟ้า อิเล็กตรอนไหลจากแอโนดไปแคโทดผ่านวงจรภายนอก ส่วนสะพานเกลือช่วยรักษาสมดุลประจุ แรงดันเซลล์ขึ้นกับศักย์รีดักชันและความเข้มข้นของไอออน",
  equationHtml: "E<sub>cell</sub> = E<sub>cathode</sub> - E<sub>anode</sub>",
  equationLabels: [
    { label: "Ecell", desc: "ศักย์ไฟฟ้าตกคร่อมสะสมจริงของเซลล์กัลวานิก (Volt)", color: "text-blue-500" },
    { label: "Anode", desc: "ขั้วลบที่เกิดปฏิกิริยาออกซิเดชันเสียอิเล็กตรอน (Zn)", color: "text-rose-500" },
    { label: "Cathode", desc: "ขั้วบวกที่เกิดปฏิกิริยารีดักชันรับอิเล็กตรอน (Cu)", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟแรงดันเซลล์เทียบอัตราส่วนไอออน",
    subtitle: "Nernst Equation Slope",
    xTitle: "Q",
    yTitle: "Ecell",
    yLabels: ["1.10V", "0.90V", "0.70V"],
    xLabels: ["0.2", "1.0", "2.0", "3.0"],
    graphType: "curve",
    customPath: "M28,24 C55,28 76,38 101,52 C129,68 153,80 180,88",
    pathColor: "#2563eb"
  }
};

// 23. Chemical Kinetics
const chemicalKineticsDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาปัจจัยที่มีผลต่ออัตราการเกิดปฏิกิริยาเคมี เช่น ความเข้มข้น และอุณหภูมิ",
    "ผสมสารและจับเวลาที่จุดสังเกตเพื่อประเมินความเร็วเฉลี่ย",
    "สร้างกราฟและทบทวนความชันกฎอัตราสะท้อนทฤษฎีการชน"
  ],
  learningObjectives: [
    "อธิบายกฎอัตราและแปลความหมายของอันดับปฏิกิริยาเคมีได้",
    "วิเคราะห์อิทธิพลของพลังงานจลน์และการชนต่ออัตราปฏิกิริยาได้",
    "คำนวณหาค่าคงที่จลนศาสตร์เคมีเฉลี่ยจากเวลาทดลองได้ถูกต้อง"
  ],
  equipments: [
    { id: "kinetics-reactant-beakers", name: "บีกเกอร์สารตั้งต้น", role: "เตรียมสารตั้งต้นหลายความเข้มข้นเพื่อเปรียบเทียบผลต่ออัตราการเกิดปฏิกิริยา", note: "ปรับความเข้มข้นทีละตัวแปรเพื่อไม่ให้ผลการทดลองปะปนกัน", unit: "M", tone: "cyan", visualKey: "BeakerVisual" },
    { id: "kinetics-stopwatch", name: "นาฬิกาจับเวลา", role: "จับเวลาตั้งแต่เริ่มผสมสารจนถึงจุดสังเกต เช่น สีเปลี่ยนหรือความขุ่นถึงระดับกำหนด", note: "เริ่มจับเวลาทันทีเมื่อสารสัมผัสกันเพื่อให้ข้อมูลอัตราแม่นยำ", unit: "s", tone: "amber", visualKey: "StopwatchVisual" },
    { id: "kinetics-water-bath", name: "อ่างควบคุมอุณหภูมิ", role: "ปรับอุณหภูมิของระบบเพื่อทดสอบผลของพลังงานจลน์ต่อความถี่การชน", note: "รอให้สารตั้งต้นมีอุณหภูมิคงที่ก่อนเริ่มผสม", unit: "°C", tone: "orange", visualKey: "HeaterCoolerVisual" },
    { id: "kinetics-catalyst", name: "สารตัวเร่งปฏิกิริยา", role: "ลดพลังงานก่อกัมมันต์และเพิ่มอัตราการเกิดปฏิกิริยาโดยไม่ถูกใช้หมด", note: "เปรียบเทียบผลก่อนและหลังเติมตัวเร่งในเงื่อนไขเดียวกัน", unit: "%", tone: "rose", visualKey: "PipetteVisual" }
  ],
  steps: [
    { num: 1, title: "กำหนดตัวแปรควบคุม", desc: "เลือกความเข้มข้น อุณหภูมิ และตัวเร่งปฏิกิริยาที่ต้องการทดสอบทีละปัจจัย", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "เริ่มปฏิกิริยาและจับเวลา", desc: "ผสมสารตั้งต้นแล้วจับเวลาจนถึงจุดสังเกต เช่น สีหรือความขุ่นถึงระดับกำหนด", iconKey: "Timer", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "บันทึกข้อมูลอัตรา", desc: "คำนวณอัตราโดยประมาณจากการเปลี่ยนแปลงความเข้มข้นหรือสัญญาณต่อเวลา", iconKey: "ClipboardList", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "หาแนวโน้มและอันดับปฏิกิริยา", desc: "พล็อตกราฟ rate กับความเข้มข้นเพื่อสรุปผลตามทฤษฎีการชน", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "จลนพลศาสตร์เคมีศึกษาอัตราการเกิดปฏิกิริยาและปัจจัยที่ทำให้เร็วหรือช้าลง เช่น ความเข้มข้น อุณหภูมิ พื้นที่ผิว และตัวเร่งปฏิกิริยา กฎอัตราแสดงความสัมพันธ์ระหว่างอัตราปฏิกิริยากับความเข้มข้นของสารตั้งต้น",
  equationHtml: "rate = k[A]<sup>m</sup>[B]<sup>n</sup>",
  equationLabels: [
    { label: "rate", desc: "ความเร็วเฉลี่ยในการผลิตเกิดสารหรือสลายปฏิกิริยา (mol/L·s)", color: "text-orange-500" },
    { label: "k", desc: "ค่าคงตัวของอัตราแปรผันตามประเภทปฏิกิริยาและอุณหภูมิ", color: "text-rose-500" },
    { label: "[A], [B]", desc: "ความเข้มข้นสะสมของสารตั้งต้นในระดับโมลาร์", color: "text-blue-500" }
  ],
  graph: {
    title: "กราฟอัตราปฏิกิริยาเทียบความเข้มข้น",
    subtitle: "Reaction Rate Law Trend",
    xTitle: "[A]",
    yTitle: "rate",
    yLabels: ["สูง", "กลาง", "ต่ำ"],
    xLabels: ["0.2", "0.8", "1.4", "2.0"],
    graphType: "line",
    solidLineCoords: { x1: 25, y1: 90, x2: 182, y2: 20 },
    pathColor: "#f97316"
  }
};

// 24. Solubility Product
const solubilityProductDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาสมดุลการละลายของเกลือที่ละลายน้ำได้น้อยผ่านค่าคงที่ผลคูณการละลาย Ksp",
    "ผสมสารละลายและสังเกตขอบเขตจุดเริ่มเกิดตะกอนเมื่อ Qsp เกิน Ksp",
    "วิเคราะห์และคำนวณผลของการนำตัวร่วมไอออน (Common Ion) เข้ามาในระบบ"
  ],
  learningObjectives: [
    "คำนวณและตีความผลคูณความเข้มข้นไอออนสะสม Qsp เทียบ Ksp ได้",
    "บอกสภาวะสมดุลการละลาย (อิ่มตัว/ไม่อิ่มตัว) จากปฏิกิริยาได้ถูกต้อง",
    "อธิบายและพิสูจน์การเลื่อนตัวสมดุลเคมีเมื่ออุณหภูมิเปลี่ยนได้"
  ],
  equipments: [
    { id: "ksp-precipitation-tubes", name: "ชุดหลอดทดลองตกตะกอน", role: "ใช้ผสมไอออนบวกและไอออนลบเพื่อสังเกตการเกิดตะกอนของเกลือละลายยาก", note: "เทียบความขุ่นของสารละลายเพื่อประเมินจุดเริ่มอิ่มตัว", unit: "ชุด", tone: "cyan", visualKey: "EquilibriumTubesVisual" },
    { id: "ksp-ion-solutions", name: "สารละลายไอออนมาตรฐาน", role: "สารละลาย Ag⁺, Cl⁻, Ca²⁺ หรือ OH⁻ ที่ทราบความเข้มข้นสำหรับคำนวณ Qsp", note: "ใช้ปิเปตตวงปริมาตรให้เท่ากันทุกครั้งเพื่อลดความคลาดเคลื่อน", unit: "M", tone: "blue", visualKey: "PipetteVisual" },
    { id: "ksp-conductivity-meter", name: "เครื่องวัดการนำไฟฟ้า", role: "ติดตามปริมาณไอออนอิสระในสารละลายก่อนและหลังเกิดตะกอน", note: "ค่าการนำไฟฟ้าลดลงเมื่อไอออนถูกดึงออกจากสารละลายเป็นของแข็ง", unit: "mS/cm", tone: "amber", visualKey: "PHMeterVisual" },
    { id: "ksp-filter-paper", name: "กระดาษกรองและกรวยกรอง", role: "แยกตะกอนออกจากสารละลายเพื่อสังเกตปริมาณและสีของผลิตภัณฑ์", note: "ล้างตะกอนด้วยน้ำกลั่นปริมาณน้อยเพื่อไม่ให้สูญเสียตัวอย่าง", unit: "g", tone: "rose", visualKey: "CuvetteVisual" }
  ],
  steps: [
    { num: 1, title: "เตรียมสารละลายไอออน", desc: "เตรียมสารละลายไอออนบวกและไอออนลบที่ทราบความเข้มข้นสำหรับสร้างตะกอน", iconKey: "Droplets", color: "text-cyan-500", bg: "bg-cyan-50" },
    { num: 2, title: "ผสมและสังเกตตะกอน", desc: "ผสมสารทีละอัตราส่วน สังเกตความขุ่นหรือการเกิดตะกอนเมื่อ Qsp เกิน Ksp", iconKey: "FlaskConical", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "คำนวณ Qsp", desc: "คำนวณผลคูณความเข้มข้นไอออนยกกำลังสัมประสิทธิ์ตามสมการการละลาย", iconKey: "ClipboardList", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "เปรียบเทียบกับ Ksp", desc: "สรุปว่าสารละลายไม่อิ่มตัว อิ่มตัว หรือเกิดตะกอนจากความสัมพันธ์ Qsp/Ksp", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "ค่าคงที่ผลคูณการละลาย (Ksp) ใช้อธิบายสมดุลการละลายของเกลือที่ละลายน้ำได้น้อย เมื่อผลคูณไอออน Qsp ต่ำกว่า Ksp สารยังละลายได้ แต่ถ้า Qsp มากกว่า Ksp ระบบจะเกิดตะกอนเพื่อลดความเข้มข้นไอออน",
  equationHtml: "K<sub>sp</sub> = [M<sup>n+</sup>]<sup>a</sup>[X<sup>m-</sup>]<sup>b</sup>",
  equationLabels: [
    { label: "Ksp", desc: "ค่าคงตัวผลคูณสมดุลการละลาย ณ อุณหภูมิคงที่", color: "text-purple-500" },
    { label: "Qsp", desc: "ผลคูณความเข้มข้นไอออนขณะใด ๆ ของสารละลาย", color: "text-cyan-500" }
  ],
  graph: {
    title: "กราฟ Qsp เทียบ Ksp",
    subtitle: "Precipitation Threshold Plot",
    xTitle: "Qsp",
    yTitle: "Qsp/Ksp",
    yLabels: ["1.2", "0.9", "0.6", "0.3"],
    xLabels: ["ต่ำ", "Ksp", "สูง"],
    graphType: "solubility",
    customPath: "M28,88 C58,82 78,72 100,61 C122,50 148,36 180,25",
    pathColor: "#06b6d4"
  }
};

// 25. Avogadro's Law
const avogadrosLawDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาปริมาตรโมลาร์ของแก๊สจากปริมาตรที่เก็บได้และจำนวนโมลของสารตั้งต้น",
    "ปรับปริมาณความเข้มข้นและควบคุมสภาวะแรงดันจำลองในกระบอกสูบ",
    "ประเมินและเปรียบเทียบปริมาตรต่อโมลสะสม ณ สภาวะมาตรฐาน STP"
  ],
  learningObjectives: [
    "คำนวณและประยุกต์ใช้กฎของอาโวกาโดร V ∝ n ได้อย่างถูกต้อง",
    "ใช้กฎของแก๊สเพื่อปรับเทียบและอ่านปริมาตรสุทธิ ณ อุณหภูมิคงที่ได้",
    "ประเมินระดับความชันเพื่อหาปริมาตรโมลาร์ 22.4 L/mol ได้ถูกต้อง"
  ],
  equipments: [
    { id: "avogadro-gas-syringe", name: "กระบอกเก็บแก๊ส", role: "วัดปริมาตรแก๊สที่เกิดขึ้นจากปฏิกิริยาและเทียบเป็นปริมาตรต่อโมล", note: "อ่านปริมาตรเมื่ออุณหภูมิและความดันของแก๊สคงที่", unit: "L", tone: "blue", visualKey: "GasSyringeVisual" },
    { id: "avogadro-reactor-flask", name: "ขวดปฏิกิริยา", role: "ให้โลหะหรือคาร์บอเนตทำปฏิกิริยากับกรดเพื่อผลิตแก๊สปริมาณที่คำนวณได้", note: "ระบบต้องปิดสนิทเพื่อไม่ให้แก๊สรั่วก่อนเข้าสู่กระบอกเก็บ", unit: "mol", tone: "cyan", visualKey: "ErlenmeyerVisual" },
    { id: "avogadro-thermometer", name: "เทอร์โมมิเตอร์และบารอมิเตอร์", role: "วัดอุณหภูมิและความดันเพื่อปรับปริมาตรแก๊สกลับสู่สภาวะมาตรฐาน", note: "ใช้ Kelvin และ kPa ในการคำนวณกฎแก๊ส", unit: "K/kPa", tone: "orange", visualKey: "ThermometerVisual" },
    { id: "avogadro-balance", name: "เครื่องชั่งสารตั้งต้น", role: "วัดมวลสารที่ใช้เพื่อคำนวณจำนวนโมลของแก๊สที่ควรเกิดขึ้น", note: "บันทึกมวลก่อนปฏิกิริยาและใช้มวลโมลาร์ในการแปลงหน่วย", unit: "g", tone: "amber", visualKey: "MassSetVisual" }
  ],
  steps: [
    { num: 1, title: "ชั่งสารตั้งต้น", desc: "ชั่งสารที่ใช้ผลิตแก๊สและคำนวณจำนวนโมลจากมวลโมลาร์", iconKey: "Ruler", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "เก็บแก๊สที่เกิดขึ้น", desc: "ปล่อยให้ปฏิกิริยาเกิดในระบบปิดและเก็บแก๊สเข้าสู่กระบอกวัดปริมาตร", iconKey: "Gauge", color: "text-cyan-500", bg: "bg-cyan-50" },
    { num: 3, title: "ปรับเทียบสภาวะ STP", desc: "ใช้ค่าอุณหภูมิและความดันเพื่อแปลงปริมาตรกลับสู่สภาวะมาตรฐาน", iconKey: "Thermometer", color: "text-orange-500", bg: "bg-orange-50" },
    { num: 4, title: "หาปริมาตรต่อโมล", desc: "คำนวณปริมาตรแก๊สต่อ 1 โมลและเปรียบเทียบกับค่า 22.4 L/mol ที่ STP", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "ปริมาตรโมลาร์ของแก๊สคือปริมาตรของแก๊ส 1 โมลภายใต้สภาวะที่กำหนด แนวคิดนี้เชื่อมกับกฎแก๊สอุดมคติ PV = nRT และที่ STP แบบคลาสสิกแก๊ส 1 โมลมีปริมาตรประมาณ 22.4 ลิตร",
  equationHtml: "V<sub>m</sub> = V / n",
  equationLabels: [
    { label: "Vm", desc: "ปริมาตรโมลาร์ของแก๊สจำลอง (L/mol)", color: "text-blue-500" },
    { label: "V", desc: "ปริมาตรรวมสุทธิของแก๊สจำลองที่เกิดขึ้น (L)", color: "text-cyan-500" },
    { label: "n", desc: "จำนวนโมลสะสมเนื้อสารแก๊สรวม", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟปริมาตรแก๊สเทียบจำนวนโมล",
    subtitle: "Avogadro's Linear V-n Plot",
    xTitle: "n(mol)",
    yTitle: "V(L)",
    yLabels: ["25L", "18L", "12L", "6L"],
    xLabels: ["0.2", "0.5", "0.8", "1.0"],
    graphType: "avogadro",
    solidLineCoords: { x1: 28, y1: 90, x2: 180, y2: 24 },
    pathColor: "#2563eb"
  }
};

// 26. Electrolysis Lab
const electrolysisDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาการแยกสลายสารเคมีด้วยไฟฟ้าและการชุบโลหะด้วยกระแสไฟฟ้าตรง (DC)",
    "ปรับค่าแอมแปร์สะสมของแหล่งจ่ายไฟและระยะเวลาในการชุบจำลอง",
    "คำนวณน้ำหนักมวลโลหะที่เกาะแคโทดตามกฎของฟาราเดย์"
  ],
  learningObjectives: [
    "อธิบายกลไกการแยกสลายและการชุบผิวโลหะจำลองได้ถูกต้อง",
    "คํานวณประจุสะสม Q = It และเปรียบเทียบผลมวลกับเวลาได้",
    "วิเคราะห์ปัจจัยของความเข้มข้นอิเล็กโทรไลต์ต่อสัมประสิทธิ์การชุบได้"
  ],
  equipments: [
    { id: "electrolysis-power-supply", name: "แหล่งจ่ายไฟกระแสตรง", role: "จ่ายกระแสไฟฟ้าคงที่ให้เซลล์อิเล็กโทรไลซิสเพื่อบังคับปฏิกิริยารีดอกซ์", note: "ตั้งค่ากระแสและเวลาให้แน่นอนเพื่อใช้กฎของฟาราเดย์คำนวณมวลที่ชุบ", unit: "A", tone: "blue", visualKey: "PowerSupplyVisual" },
    { id: "electrolysis-electrolyte", name: "สารละลายอิเล็กโทรไลต์โลหะ", role: "ให้ไอออนโลหะ เช่น Cu²⁺ หรือ Ni²⁺ สำหรับเคลื่อนที่ไปเกาะที่แคโทด", note: "ความเข้มข้นสูงและสะอาดช่วยให้ผิวชุบเรียบสม่ำเสมอ", unit: "M", tone: "cyan", visualKey: "BeakerVisual" },
    { id: "electrolysis-electrodes", name: "แผ่นโลหะแอโนดและแคโทด", role: "แอโนดละลายให้ไอออนโลหะ ส่วนแคโทดเป็นชิ้นงานที่รับโลหะเคลือบผิว", note: "ขัดผิวชิ้นงานและชั่งมวลก่อนเริ่มทดลอง", unit: "g", tone: "rose", visualKey: "PhotoCellVisual" },
    { id: "electrolysis-wires", name: "สายไฟและคลิปหนีบ", role: "เชื่อมต่อขั้วไฟฟ้ากับแหล่งจ่ายไฟให้ทิศทางกระแสถูกต้อง", note: "ตรวจ polarity ก่อนเปิดไฟเพื่อไม่ให้โลหะไปเกาะผิดขั้ว", unit: "±", tone: "amber", visualKey: "WiresVisual" }
  ],
  steps: [
    { num: 1, title: "เตรียมเซลล์อิเล็กโทรไลซิส", desc: "ใส่สารละลายอิเล็กโทรไลต์และจัดตำแหน่งแอโนด-แคโทดให้ถูกต้อง", iconKey: "FlaskConical", color: "text-cyan-500", bg: "bg-cyan-50" },
    { num: 2, title: "ตั้งกระแสและเวลา", desc: "กำหนดกระแสไฟฟ้าและระยะเวลาการชุบเพื่อควบคุมประจุรวม Q = It", iconKey: "Zap", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 3, title: "สังเกตการเคลือบโลหะ", desc: "ดูการเกิดชั้นโลหะที่แคโทดและการเปลี่ยนแปลงของแอโนดระหว่างทดลอง", iconKey: "Activity", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 4, title: "คำนวณมวลที่ชุบ", desc: "ใช้กฎของฟาราเดย์ m = ItM/nF เพื่อเปรียบเทียบมวลทฤษฎีกับผลทดลอง", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "อิเล็กโทรลิซิสใช้พลังงานไฟฟ้าบังคับปฏิกิริยารีดอกซ์ที่ไม่เกิดเอง ไอออนโลหะรับอิเล็กตรอนที่แคโทดและเคลือบผิวชิ้นงาน ปริมาณโลหะที่ชุบสัมพันธ์กับประจุไฟฟ้ารวมตามกฎของฟาราเดย์",
  equationHtml: "m = I t M / n F",
  equationLabels: [
    { label: "m", desc: "มวลของโลหะที่แยกชุบสะสมบนแคโทด (g)", color: "text-purple-500" },
    { label: "It", desc: "ประจุสะสม Q (กระแสไฟตกคร่อมคูณเวลาในวินาที)", color: "text-blue-500" },
    { label: "M/nF", desc: "ค่าอัตราส่วนมวลโมลาร์ต่อจำนวนอิเล็กตรอนฟาราเดย์", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟมวลโลหะที่ชุบเทียบประจุไฟฟ้า",
    subtitle: "Electrochemical Deposition Faraday Law",
    xTitle: "Q(C)",
    yTitle: "m(g)",
    yLabels: ["3g", "2.2g", "1.5g", "0.8g"],
    xLabels: ["1500", "4500", "7500", "9000"],
    graphType: "electrolysis",
    solidLineCoords: { x1: 28, y1: 92, x2: 180, y2: 26 },
    pathColor: "#7c3aed"
  }
};

// 27. Colligative Properties
const colligativeDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาการเปลี่ยนแปลงทางอุณหภูมิเปลี่ยนเฟสของตัวทำละลายตามจำนวนอนุภาคตัวละลาย",
    "ปรับปริมาณ molality และค่า van't Hoff factor แตกตัวของสารละลาย",
    "คำนวณและประเมินผลต่างอุณหภูมิของจุดเดือดที่เพิ่มขึ้นและจุดเยือกแข็งที่ลดลง"
  ],
  learningObjectives: [
    "อธิบายสมบัติคอลลิเกทีฟของสารละลายที่ไม่ขึ้นกับชนิดเคมีได้",
    "คำนวณการเปลี่ยนแปลงจุดเดือดและจุดเยือกแข็งตามสมการได้ถูกต้อง",
    "วิเคราะห์ความแตกต่างของสารประเภทอิเล็กโทรไลต์และนอนอิเล็กโทรไลต์ได้"
  ],
  equipments: [
    { id: "colligative-thermometer", name: "เทอร์โมมิเตอร์ความละเอียดสูง", role: "วัดจุดเยือกแข็งและจุดเดือดของตัวทำละลายก่อนและหลังเติมตัวละลาย", note: "ใช้ความละเอียด 0.1°C เพื่อเห็นการเปลี่ยนแปลงที่มักมีค่าน้อย", unit: "°C", tone: "orange", visualKey: "ThermometerVisual" },
    { id: "colligative-solvent", name: "ตัวทำละลายบริสุทธิ์", role: "ใช้เป็นค่าอ้างอิงก่อนเติมตัวละลาย เช่น น้ำหรือสารอินทรีย์ที่ปลอดภัย", note: "ต้องทราบค่า Kf และ Kb ของตัวทำละลายเพื่อคำนวณผลเชิงปริมาณ", unit: "Kf/Kb", tone: "cyan", visualKey: "BeakerVisual" },
    { id: "colligative-solute", name: "ตัวละลายไม่ระเหย", role: "ทำให้ความดันไอลดลง ส่งผลให้จุดเยือกแข็งลดและจุดเดือดเพิ่ม", note: "เลือกชนิดไม่แตกตัวหรือแตกตัวเพื่อเปรียบเทียบผลของ van't Hoff factor", unit: "mol/kg", tone: "rose", visualKey: "MassSetVisual" },
    { id: "colligative-bath", name: "อ่างน้ำแข็งและอ่างน้ำร้อน", role: "ควบคุมการเย็นตัวและการเดือดของสารละลายระหว่างการวัดอุณหภูมิ", note: "คนสารอย่างสม่ำเสมอเพื่อให้อุณหภูมิในสารละลายสม่ำเสมอ", unit: "°C", tone: "blue", visualKey: "HeaterCoolerVisual" }
  ],
  steps: [
    { num: 1, title: "วัดตัวทำละลายบริสุทธิ์", desc: "บันทึกจุดเยือกแข็งหรือจุดเดือดของตัวทำละลายก่อนเติมตัวละลาย", iconKey: "Thermometer", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "เตรียมสารละลายโมลาล", desc: "ชั่งตัวละลายและคำนวณโมลาลิตีจากโมลตัวละลายต่อกิโลกรัมตัวทำละลาย", iconKey: "ClipboardList", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 3, title: "วัดการเปลี่ยนจุดเดือด/เยือกแข็ง", desc: "ควบคุมอุณหภูมิและบันทึกค่า ΔTf หรือ ΔTb ของสารละลาย", iconKey: "Flame", color: "text-orange-500", bg: "bg-orange-50" },
    { num: 4, title: "วิเคราะห์ van't Hoff factor", desc: "เปรียบเทียบผลของตัวละลายแตกตัวและไม่แตกตัวผ่านค่า i ในสมการสมบัติคอลลิเกทีฟ", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "สมบัติคอลลิเกทีฟขึ้นกับจำนวนอนุภาคตัวละลายในสารละลาย ไม่ได้ขึ้นกับชนิดทางเคมีโดยตรง ตัวละลายไม่ระเหยทำให้จุดเยือกแข็งลดลงและจุดเดือดสูงขึ้น โดยผลจะมากขึ้นเมื่อ molality หรือ van't Hoff factor เพิ่มขึ้น",
  equationHtml: "&Delta;T = i K m",
  equationLabels: [
    { label: "ΔT", desc: "ผลต่างความลึกจุดเยือกแข็งหรือจุดเดือดที่เบี่ยงเบนไป (°C)", color: "text-indigo-500" },
    { label: "i", desc: "ค่าสัมประสิทธิ์ van't Hoff สะท้อนจำนวนชิ้นที่แตกตัว", color: "text-rose-500" },
    { label: "K", desc: "ค่าคงตัวของตัวทำละลาย (Kf หรือ Kb สำหรับน้ำ)", color: "text-cyan-500" },
    { label: "m", desc: "ความเข้มข้นในหน่วยโมลาลิตี (mol/kg)", color: "text-orange-500" }
  ],
  graph: {
    title: "กราฟ ΔT เทียบ molality",
    subtitle: "Colligative Linear Trend",
    xTitle: "molality",
    yTitle: "ΔT",
    yLabels: ["8", "6", "4", "2", "0"],
    xLabels: ["0.5", "1.0", "1.5", "2.0", "3.0"],
    graphType: "colligative",
    solidLineCoords: { x1: 28, y1: 92, x2: 180, y2: 28 },
    dashedLineCoords: { x1: 28, y1: 92, x2: 180, y2: 48 },
    pathColor: "#06b6d4"
  }
};

// 28. Osmosis & Plasmolysis (cell-osmosis)
const cellOsmosisDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาการแพร่และการออสโมซิสของน้ำผ่านเยื่อเลือกผ่านในสภาวะความเข้มข้นที่ต่างกัน",
    "ติดตามและวัดผลการเปลี่ยนแปลงปริมาตรของน้ำผ่านเซลล์กั้นจำลอง",
    "ประเมินความดันออสโมติกและผลของการเลื่อนไหลของน้ำเข้า-ออกจากสารละลาย"
  ],
  learningObjectives: [
    "อธิบายความต่างของสภาวะ Hypertonic, Isotonic และ Hypotonic ได้",
    "คำนวณอัตราการเคลื่อนที่เฉลี่ยของน้ำตามปริมาณความต่างระดับได้",
    "สรุปแนวคิดการเกิดพลาสมอไลซิส (Plasmolysis) ในเซลล์ได้ถูกต้อง"
  ],
  equipments: [
    { id: "dialysis-tubing", name: "เซลลูโลสถุงเซลโลเฟน (Dialysis Tubing)", role: "ทำหน้าที่เป็นเยื่อเลือกผ่านที่มีขนาดยอมให้เฉพาะน้ำและสารโมเลกุลเล็กแพร่ผ่านได้", note: "ล้างและแช่น้ำให้นิ่มก่อนมัดปลายด้วยเชือกให้แน่นหนา", unit: "ชุด", tone: "blue", visualKey: "CuvetteVisual" },
    { id: "sugar-solutions", name: "สารละลายซูโครสความเข้มข้นต่าง ๆ", role: "ใช้สร้างระดับสารละลายภายในและภายนอกถุงเพื่อศึกษาแรงดึงออสโมซิส", note: "ตวงในสัดส่วนความเข้มข้น 10%, 20% และ 30% ตามลำดับ", unit: "M", tone: "rose", visualKey: "BeakerVisual" },
    { id: "capillary-tube", name: "หลอดแก้วคะปิลลารีวัดความสูง", role: "ใช้วัดการเคลื่อนขึ้นของระดับของเหลวจากการออสโมซิสของน้ำเข้าถุง", note: "ติดตั้งสเกลวัดเป็นมิลลิเมตรเพื่อจับเวลาบันทึกผลได้เที่ยงตรง", unit: "mm", tone: "amber", visualKey: "RulerVisual" }
  ],
  steps: [
    { num: 1, title: "ติดตั้งเยื่อเลือกผ่าน", desc: "จัดเตรียมและติดตั้งถุงเซลโลเฟนเยื่อเลือกผ่านกับกระเปาะหลอดแก้ว", iconKey: "FlaskConical", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "บรรจุสารละลายต่างขั้ว", desc: "เติมสารละลายซูโครสในถุงและตั้งไว้ในบีกเกอร์น้ำกลั่นภายนอก", iconKey: "Droplets", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "บันทึกระดับความสูง", desc: "บันทึกความสูงของระดับน้ำในหลอดแก้วทุกๆ 2 นาที อย่างต่อเนื่อง", iconKey: "ClipboardList", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "คำนวณและสรุปผล", desc: "นำผลต่างความสูงมาพล็อตกราฟอัตราออสโมซิสและเปรียบเทียบสภาวะสาร", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "ออสโมซิส (Osmosis) เป็นกระบวนการที่โมเลกุลของน้ำเคลื่อนที่สุทธิผ่านเยื่อเลือกผ่าน จากบริเวณที่มีความเข้มข้นของสารละลายต่ำ (น้ำมาก) ไปยังบริเวณที่มีความเข้มข้นของสารละลายสูง (น้ำน้อย) โดยความดันที่ทำให้กระบวนการหยุดนิ่งเรียกว่าความดันออสโมติก",
  equationHtml: "&Pi; = i M R T",
  equationLabels: [
    { label: "Π", desc: "ความดันออสโมติกจำลองของสารละลาย (atm)", color: "text-indigo-500" },
    { label: "M", desc: "ความเข้มข้นเนื้อสารละลายในหน่วยโมลาร์", color: "text-cyan-500" },
    { label: "i", desc: "ค่าแปรผันการแตกตัวของอนุภาคสะสม", color: "text-rose-500" }
  ],
  graph: {
    title: "กราฟความสูงระดับออสโมซิส",
    subtitle: "Osmotic Pressure Height Curve",
    xTitle: "เวลา (นาที)",
    yTitle: "ความสูง (mm)",
    yLabels: ["40", "30", "20", "10", "0"],
    xLabels: ["0", "2", "4", "6", "8", "10"],
    graphType: "curve",
    customPath: "M20,110 C60,60 120,40 180,30",
    pathColor: "#22c55e"
  }
};

// 29. Enzyme Kinetics
const enzymeKineticsDetails: LabDetailData = {
  overviewBullets: [
    "วิเคราะห์อัตราการทำงานของเอนไซม์ตามการเปลี่ยนแปลงความเข้มข้นของสารตั้งต้น",
    "ปรับแต่งระดับอุณหภูมิควบคุมและความเป็นกรดเบส pH ของห้องทดลอง",
    "คำนวณและประมาณค่าคงที่ Km และความเร็วสูงสุด Vmax ตามสมการจลนศาสตร์"
  ],
  learningObjectives: [
    "อธิบายสมการจลนศาสตร์เอนไซม์ Michaelis-Menten ได้อย่างเข้าใจ",
    "ระบุค่าความชันและจุดอิ่มตัวจลนศาสตร์จลนพลศาสตร์ได้ถูกต้อง",
    "วิเคราะห์ผลของตัวยับยั้งเอนไซม์ต่ออัตราปฏิกิริยาได้เสถียร"
  ],
  equipments: [
    { id: "enzyme-catalyst", name: "เอนไซม์คะตาเลส (Catalase Extract)", role: "สกัดจากมันฝรั่งหรือตับหมูเพื่อทำหน้าที่เร่งปฏิกิริยาความเร็วสูง", note: "เก็บในภาชนะเย็นแช่น้ำแข็งเพื่อถนอมสภาพการใช้งานไม่ให้เสื่อมเสีย", unit: "%", tone: "cyan", visualKey: "PipetteVisual" },
    { id: "substrate-h2o2", name: "สารตั้งต้นไฮโดรเจนเปอร์ออกไซด์ (H₂O₂)", role: "เป็นแหล่งปฏิกิริยาหลักสำหรับทดสอบอัตราการสลายตัวได้แก๊สออกซิเจน", note: "ระวังการสลายตัวตามธรรมชาติและสัมผัสผิวหนังโดยตรง", unit: "M", tone: "blue", visualKey: "BeakerVisual" },
    { id: "gas-delivery-set", name: "ชุดกระบอกแก้วดักเก็บฟองออกซิเจน", role: "ติดตามปริมาตรแก๊สออกซิเจนสะสมเพื่อระบุอัตราการทํางานเอนไซม์", note: "ติดตั้งขวดปฏิกิริยาให้ปิดมิดชิดไม่มีรูรั่วไหลออก", unit: "ml", tone: "amber", visualKey: "GasSyringeVisual" }
  ],
  steps: [
    { num: 1, title: "เตรียมระดับเอนไซม์และ pH", desc: "ตั้งค่าตัวแปรอุณหภูมิควบคุมและปริมาณเอนไซม์ให้เสถียร", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "เติมความเข้มข้นสารตั้งต้น", desc: "ใส่ปริมาณ H₂O₂ ที่ระดับโมลาร์เจือจางต่างกันในขวดทดลอง", iconKey: "Droplets", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "วัดฟองแก๊สออกซิเจน", desc: "จับเวลา 1 นาทีแรกและบันทึกปริมาตรแก๊สเพื่อหาความเร็วต้น (v0)", iconKey: "Timer", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "สรุปจลนศาสตร์ Michaelis-Menten", desc: "พล็อตกราฟหาค่า Km และ Vmax เพื่อประเมินประสิทธิภาพเอนไซม์", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "จลนพลศาสตร์ของเอนไซม์อธิบายอัตราการเร่งปฏิกิริยาทางเคมีชีวภาพ โดยสมการ Michaelis-Menten อธิบายความสัมพันธ์ของความเร็วต้น (v) และความเข้มข้นสารตั้งต้น [S] ที่จุดอิ่มตัวความเข้มข้น",
  equationHtml: "v = V<sub>max</sub>[S] / (K<sub>m</sub> + [S])",
  equationLabels: [
    { label: "v", desc: "ความเร็วต้นการทำงานเฉลี่ยเอนไซม์ในปฏิกิริยา", color: "text-indigo-500" },
    { label: "Vmax", desc: "ความเร็วสูงสุดที่เอนไซม์เร่งได้เมื่ออิ่มตัวสารตั้งต้น", color: "text-rose-500" },
    { label: "Km", desc: "ค่าคงตัวของไมเคลิสสะท้อนความเข้มข้นเมื่อกระตุ้นครึ่งหนึ่ง", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟอัตรา v - [S]",
    subtitle: "Michaelis-Menten Saturation Curve",
    xTitle: "[S](mM)",
    yTitle: "v(μM/s)",
    yLabels: ["Vmax", "½Vmax", "ต่ำ"],
    xLabels: ["0", "Km", "10", "20", "30"],
    graphType: "curve",
    customPath: "M20,110 C50,60 110,35 180,25",
    pathColor: "#22c55e"
  }
};

// 30. DNA Extraction
const dnaExtractionDetails: LabDetailData = {
  overviewBullets: [
    "เรียนรู้ขั้นตอนการสกัดสายใยดีเอ็นเอออกจากตัวอย่างพืชพรรณและผลไม้จำลอง",
    "ปรับปริมาณความเข้มข้นสารซักฟอกและระดับเกลือไอออนในสารละลาย",
    "บันทึกและตรวจสอบปริมาณและคุณภาพความสุทธิของสายใยดีเอ็นเอสะสม"
  ],
  learningObjectives: [
    "อธิบายบทบาทของสารลดแรงตึงผิวและเอทานอลในขบวนการแยกสกัดได้",
    "ลำดับขั้นตอนทำลายผนังเซลล์ ตกตะกอน และม้วนเก็บสายใยได้ถูกต้อง",
    "ระบุระดับความบริสุทธิ์ของผลิตภัณฑ์ดีเอ็นเอจำลองได้สมบูรณ์"
  ],
  equipments: [
    { id: "extraction-lysis", name: "บัฟเฟอร์ทำลายเยื่อหุ้มเซลล์ (Lysis Buffer)", role: "สารลดแรงตึงผิวและเกลือเพื่อช่วยละลายผนังและเยื่อหุ้มเซลล์ของเนื้อเยื่อ", note: "ระวังการสําผัสเยื่อบุตาและล้างด้วยนํ้าสะอาดทันทีหากหกเลอะเทอะ", unit: "ml", tone: "blue", visualKey: "PipetteVisual" },
    { id: "ethanol-cold", name: "เอทานอลเย็นจัดความเข้มข้นสูง (95% Ethanol)", role: "ใช้เทตกตะกอนสายใยดีเอ็นเอออกจากชั้นของเหลวเนื่องจากดีเอ็นเอไม่ละลายในเอทานอลเย็น", note: "แช่เย็นไว้ตลอดเวลาจนกว่าจะถึงขั้นตอนเทประทับบนผิวสารละลาย", unit: "%", tone: "rose", visualKey: "CuvetteVisual" },
    { id: "extract-spooler", name: "แท่งแก้วม้วนเก็บสายใยดีเอ็นเอ", role: "ใช้จุ่มม้วนเก็บดีเอ็นเอที่แยกชั้นลอยตัวขึ้นมาในแนวสัมผัสเอทานอล", note: "ม้วนเบาๆ เพื่อลดการขาดหักและรักษาความสมบูรณ์ดีเอ็นเอสูงสุด", unit: "อัน", tone: "cyan", visualKey: "RetortStandVisual" }
  ],
  steps: [
    { num: 1, title: "บดเนื้อเยื่อและผสมน้ำเกลือ", desc: "บดตัวอย่างพืชพรรณให้แหลกและเติมนํ้าเกลือเพื่อช่วยจับกลุ่มดีเอ็นเอ", iconKey: "Ruler", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "ละลายเยื่อหุ้มเซลล์ (Lysis)", desc: "ผสมบัฟเฟอร์ทำลายผนังเซลล์และแช่อ่างควบคุมความร้อนอุ่นเบาๆ", iconKey: "Flame", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "กรองและตกตะกอนดีเอ็นเอ", desc: "กรองสิ่งเจือปนและค่อยๆ เทเอทานอลเย็นจัดทับชั้นของเหลวด้านบน", iconKey: "Droplets", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "ม้วนและตรวจสอบผลิตภัณฑ์", desc: "ใช้แท่งแก้วม้วนเก็บตะกอนสายใยสีขาวขุ่นของดีเอ็นเอเพื่อประเมินความสุทธิ", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "ขบวนการสกัดดีเอ็นเอประกอบด้วยการทำลายผนังและเยื่อหุ้มเซลล์ทางเคมีฟิสิกส์ การขจัดโปรตีนหุ้มด้วยเกลือและเอนไซม์ และเทตกตะกอนในชั้นสัมผัสเอทานอลเย็นจัดเพื่อม้วนเก็บตัวอย่างสารพันธุกรรม",
  equationHtml: "Cell Lysis &rarr; Precipitation &rarr; DNA spooling",
  equationLabels: [
    { label: "Lysis", desc: "ทำลายเยื่อหุ้มและละลายฟอสโฟลิปิดด้วยสารซักฟอก", color: "text-cyan-500" },
    { label: "Precipitate", desc: "การดักจับประจุลบของดีเอ็นเอด้วย Na⁺ และตกตะกอนในแอลกอฮอล์เย็น", color: "text-violet-500" }
  ],
  graph: {
    title: "กราฟสัดส่วนความสุทธิ DNA",
    subtitle: "DNA Yield & Purity Convergence",
    xTitle: "รอบสกัด",
    yTitle: "ปริมาณ (μg)",
    yLabels: ["สูง", "กลาง", "ต่ำ"],
    xLabels: ["1", "2", "3", "4"],
    graphType: "curve",
    customPath: "M20,110 Q100,50 180,30",
    pathColor: "#10b981"
  }
};

// 31. Cellular Respiration
const cellularRespirationDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาจังหวะปฏิกิริยาการสลายกลูโคสและผลิตพลังงานเคมีระดับเซลล์",
    "ปรับปริมาณความดันและความพร้อมใช้งานออกซิเจนในระบบปิดจำลอง",
    "ประเมินค่าอัตราการใช้ออกซิเจนและประเมินผลผลิตพลังงานในรูป ATP"
  ],
  learningObjectives: [
    "อธิบายและจำแนกขั้นตอนการหายใจแบบใช้ออกซิเจนและไม่ใช้ได้ถูกต้อง",
    "วัดจังหวะการหดตัวของระดับแก๊สเพื่อคํานวณหาอัตราการหายใจจำลองได้",
    "สรุปแนวคิดบทบาท Glycolysis, Krebs cycle ในระบบพลังงานชีวภาพได้"
  ],
  equipments: [
    { id: "respirometer", name: "ขวดวัดอัตราการหายใจ (Respirometer)", role: "ระบบขวดปิดติดตั้งเกจวัดท่อสเกลคะปิลลารีสําหรับวัดการไหลของอากาศ", note: "ใส่เม็ดดักจับแก๊สคาร์บอนไดออกไซด์ CO₂ เสมอเพื่อให้อากาศหดตัวตามปริมาณการใช้ O₂", unit: "ชุด", tone: "blue", visualKey: "ErlenmeyerVisual" },
    { id: "co2-absorber", name: "สารเคมีดักจับคาร์บอนไดออกไซด์ (KOH)", role: "เม็ด Potassium Hydroxide เพื่อดักจับ CO₂ ที่เกิดจากปฏิกิริยาการหายใจทันที", note: "ระวังการสําผัสผิวหนังโดยตรงเนื่องจากเป็นเบสแก่อันตรายร้ายแรง", unit: "g", tone: "rose", visualKey: "BeakerVisual" },
    { id: "germinating-seeds", name: "เมล็ดพืชงอก / ยีสต์จำลองตัวอย่าง", role: "เซลล์สิ่งมีชีวิตจำลองที่มีอัตราการแผ่พลังงานและหายใจระดับสูง", note: "ใช้ปริมาณควบคุมคงที่เปรียบเทียบในหลายสภาวะอุณหภูมิแวดล้อม", unit: "g", tone: "emerald", visualKey: "PeaPlantVisual" }
  ],
  steps: [
    { num: 1, title: "ติดตั้งขวดปิด Respirometer", desc: "จัดวางตัวอย่างและ KOH เม็ดลงขวด ปิดระบบให้สนิทและต่อเกจท่อสเกล", iconKey: "FlaskConical", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "ตั้งระดับอุณหภูมิแวดล้อม", desc: "นำขวดแช่อ่างควบคุมความร้อนเพื่อศึกษาอิทธิพลของความชื้น", iconKey: "Thermometer", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "ติดตามการหดตัวของสีน้ำ", desc: "วัดการเลื่อนของหยดสีนํ้าในเกจท่อสเกลทุกนาทีเปรียบเทียบค่าใช้ O₂", iconKey: "Timer", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "คำนวณอัตราการใช้ออกซิเจน", desc: "พล็อตกราฟปริมาตร O₂ ตามเวลา และประเมินอัตราพลังงาน ATP ที่ผลิตได้", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "การหายใจระดับเซลล์เปลี่ยนพลังงานในพันธะของกลูโคสและส่งต่อไปยังพันธะเคมีของ ATP ขบวนการใช้ออกซิเจนดึงแก๊ส O₂ เข้าไปรับอิเล็กตรอนในขั้นตอนสุดท้ายและคายน้ำพร้อมคาร์บอนไดออกไซด์",
  equationHtml: "C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub> → 6CO<sub>2</sub> + 6H<sub>2</sub>O + 38ATP",
  equationLabels: [
    { label: "Glucose", desc: "สารตั้งต้นพลังงานหลักถูกเปลี่ยนรูปเป็น Pyruvate", color: "text-green-600" },
    { label: "O2", desc: "ตัวรับอิเล็กตรอนตัวสุดท้ายที่ห่วงโซ่ขนส่งเชิงลึก", color: "text-blue-600" },
    { label: "ATP", desc: "พลังงานเคมีผลผลิตสูงสุดที่ได้จากการสลายสารอาหาร", color: "text-yellow-600" }
  ],
  graph: {
    title: "กราฟอัตรา O₂ ตามอุณหภูมิ",
    subtitle: "Cellular Respiration Kinetics",
    xTitle: "Temp (°C)",
    yTitle: "อัตรา O₂",
    yLabels: ["สูง", "กลาง", "ต่ำ"],
    xLabels: ["10", "20", "30", "40", "50"],
    graphType: "curve",
    customPath: "M20,110 Q100,20 180,95",
    pathColor: "#ef4444"
  }
};

// 32. Plant Transpiration
const plantTranspirationDetails: LabDetailData = {
  overviewBullets: [
    "วัดอัตราการคายน้ำของยอดพืชด้วยเครื่องมือโพโทมิเตอร์ (Potometer)",
    "ปรับสภาวะแวดล้อมควบคุมภายนอก เช่น ความชื้น อุณหภูมิ ลม และความเข้มแสง",
    "บันทึกและสังเกตการเคลื่อนที่ของฟองอากาศเพื่อคำนวณปริมาตรการใช้น้ำสะสม"
  ],
  learningObjectives: [
    "อธิบายกลไกทฤษฎีแรงดึงระเหยน้ำและการเปิด-ปิดของปากใบได้ถูกต้อง",
    "ประเมินค่าความชื้นและอิทธิพลของลมต่อสัมประสิทธิ์การคายน้ำได้เสถียร",
    "สรุปแนวคิดอัตราการใช้น้ำและรักษาเสถียรภาพภายในของพืชได้ถูกต้อง"
  ],
  equipments: [
    { id: "potometer-setup", name: "ชุดเครื่องมือโพโทมิเตอร์ (Potometer)", role: "ท่อแก้วใสสำหรับเสียบยอดพืชและมีท่อคะปิลลารีด้านข้างสำหรับใส่น้ำ", note: "ตรวจสอบรอยต่อทุกจุดและทาขี้ผึ้งเพื่อป้องกันอากาศรั่วเข้าไปในท่อ", unit: "ชุด", tone: "blue", visualKey: "GasSyringeVisual" },
    { id: "plant-shoot", name: "ยอดพืชทดลองมีใบสมบูรณ์ (Plant Shoot)", role: "ยอดไม้งอกหรือกิ่งไม้สดสำหรับทําหน้าที่คายน้ำผ่านผิวใบ", note: "ตัดยอดพืชในน้ำเสมอเพื่อป้องกันฟองอากาศอุดตันในท่อลำเลียงไซเลม", unit: "leaves", tone: "emerald", visualKey: "PeaPlantVisual" },
    { id: "fan-wind", name: "พัดลมปรับความเร็วลม (Fan)", role: "จำลองสภาวะแรงลมพัดเพื่อศึกษาผลกระทบของการเคลื่อนย้ายอากาศรอบใบ", note: "ปรับตั้งสเกลแรงลมระดับเบา ปานกลาง และแรงสุด", unit: "m/s", tone: "cyan", visualKey: "PowerSupplyVisual" }
  ],
  steps: [
    { num: 1, title: "ตัดและติดตั้งยอดพืช", desc: "ตัดก้านพืชใต้นํ้า เสียบเข้าช่องปลายโพโทมิเตอร์ให้แน่นมิดชิด", iconKey: "Ruler", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "สร้างฟองอากาศอ้างอิง", desc: "จุ่มปลายท่อคะปิลลารีให้อากาศเข้าเล็กน้อยเพื่อสร้างฟองอากาศอ้างอิง", iconKey: "Droplets", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "ควบคุมปัจจัยสิ่งแวดล้อม", desc: "ปรับค่าพัดลม โคมไฟ หรือปรับความชื้นรอบยอดพืชจำลอง", iconKey: "Sliders", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "วัดและคำนวณปริมาตรคายน้ำ", desc: "จับเวลาและบันทึกระยะทางที่ฟองอากาศเลื่อนไปตามช่วงเวลา", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "การคายน้ำ (Transpiration) เป็นการสูญเสียน้ำในรูปของไอน้ำผ่านทางปากใบของพืช ช่วยดึงกระแสน้ำและเกลือแร่จากดินผ่านรากสู่ยอดตามแรงดึงระเหยน้ำ (Transpiration pull)",
  equationHtml: "Rate = V<sub>water</sub> / t",
  equationLabels: [
    { label: "Rate", desc: "อัตราคายน้ำเฉลี่ยของใบพืชในระบบจำลอง", color: "text-green-500" },
    { label: "Vwater", desc: "ปริมาตรของน้ำที่เลื่อนไปในท่อ (mm³ หรือ ml)", color: "text-blue-500" },
    { label: "t", desc: "ระยะเวลาที่ใช้ติดตามความดันสะสม", color: "text-cyan-500" }
  ],
  graph: {
    title: "กราฟคายน้ำตามความเข้มแสง",
    subtitle: "Transpiration Rate vs Light Intensity",
    xTitle: "Light (%)",
    yTitle: "Rate",
    yLabels: ["สูง", "กลาง", "ต่ำ"],
    xLabels: ["0", "25", "50", "75", "100"],
    graphType: "curve",
    customPath: "M20,110 C50,90 100,50 180,40",
    pathColor: "#22c55e"
  }
};

// 33. Natural Selection
const naturalSelectionDetails: LabDetailData = {
  overviewBullets: [
    "ศึกษาทฤษฎีวิวัฒนาการและการคัดเลือกโดยธรรมชาติผ่านการพรางตัวของประชากร",
    "ปรับสัดส่วนลักษณะสีสันภูมิหลังสภาพแวดล้อมและประสิทธิภาพตัวล่าจำลอง",
    "บันทึกความถี่แอลลีลความถี่ฟีโนไทป์สะสมเพื่อดูแนวโน้มการปรับตัวรุ่นต่อรุ่น"
  ],
  learningObjectives: [
    "อธิบายสมดุลและการคัดเลือกปรับตัวของประชากรสิ่งมีชีวิตได้",
    "วิเคราะห์ความแตกต่างของสิทธิรอดชีวิตตามสีพรางตัวได้ถูกต้อง",
    "สรุปแนวคิดความผันแปรทางพันธุกรรมสะสมและทฤษฎีของดาร์วินได้สมบูรณ์"
  ],
  equipments: [
    { id: "habitat-screen", name: "ฉากจำลองระบบนิเวศ (Habitat Background)", role: "ใช้ปรับเปลี่ยนภาพสีภูมิหลังสภาพแวดล้อม (เช่น ป่าทึบสีเขียว หรือโขดหินสีเทาเข้ม)", note: "การพรางตัวของเหยื่อจะขึ้นตรงกับผลต่างสีสันเทียบกับฉากหลัง", unit: "bg", tone: "blue", visualKey: "CuvetteVisual" },
    { id: "prey-variants", name: "ประชากรเหยื่อจำลอง (Prey Population)", role: "สิ่งมีชีวิตจำลองที่มีลักษณะสีฟีโนไทป์ต่างกัน (เช่น สีเด่นพรางตัวยาก และสีด้อยกลมกลืน)", note: "เริ่มต้นด้วยจํานวนแอลลีลสะสมสม่ำเสมอเพื่อเปรียบเทียบ", unit: "n", tone: "rose", visualKey: "PeaPlantVisual" },
    { id: "predator-sensor", name: "แบบจำลองอัตราจู่โจมของตัวล่า (Predator)", role: "จำลองบทบาทผู้ล่าในการไล่ดักจับเหยื่อตัวที่มีการพรางตัวต่ำ", note: "อัตราการพรางตัวที่ตํ่าจะเพิ่มโอกาสถูกจู่โจมคูณสองเท่า", unit: "kills", tone: "amber", visualKey: "StopwatchVisual" }
  ],
  steps: [
    { num: 1, title: "กำหนดสีภูมิหลังและแอลลีลตั้งต้น", desc: "เลือกประเภทฉากป่าและระดับมวลสัดส่วนประชากรเหยื่อเริ่มต้น", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "เริ่มปฏิกิริยาล่าประชากร", desc: "จำลองพฤติกรรมการล่าสะสมผ่านตัวเลขความไวสายตาตัวล่า", iconKey: "Activity", color: "text-orange-500", bg: "bg-orange-50" },
    { num: 3, title: "บันทึกข้อมูลรุ่นลูกหลาน", desc: "ปล่อยให้ประชากรรุ่นรอดชีวิตสืบพันธุ์ และประเมินลักษณะในรุ่นใหม่", iconKey: "Timer", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "วิเคราะห์ความถี่ปรับตัว", desc: "พล็อตกราฟสัดส่วนลักษณะเด่น-ด้อย และสรุปความคงตัวประชากร", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "การคัดเลือกโดยธรรมชาติเป็นกลไกหลักของวิวัฒนาการ โดยสิ่งมีชีวิตที่มีฟีโนไทป์เหมาะสมกับสภาพแวดล้อมปัจจุบันจะมีอัตรารอดชีวิตและสืบพันธุ์สูง ส่งผ่านแอลลีลเด่นไปในรุ่นถัดไปส่งผลให้ลักษณะเฉลี่ยเปลี่ยนไป",
  equationHtml: "Survival = f(Adaptability, Background)",
  equationLabels: [
    { label: "Adaptability", desc: "ระดับความพรางตัวกลมกลืนของสีสิ่งมีชีวิต", color: "text-emerald-500" },
    { label: "Background", desc: "ลักษณะเด่นของสิ่งแวดล้อมจำลองรอบตัวพืชพรรณ", color: "text-blue-500" }
  ],
  graph: {
    title: "กราฟความถี่แอลลีลสะสม",
    subtitle: "Allele Frequency Convergence",
    xTitle: "รุ่น (Generations)",
    yTitle: "ความถี่แอลลีล",
    yLabels: ["1.0", "0.75", "0.50", "0.25", "0"],
    xLabels: ["0", "2", "4", "6", "8", "10"],
    graphType: "curve",
    customPath: "M20,60 C60,40 120,25 180,20",
    pathColor: "#22c55e"
  }
};

// 34. Blood Typing & Agglutination
const bloodTypingDetails: LabDetailData = {
  overviewBullets: [
    "ทดลองหาหมู่เลือดระบบ ABO และ Rh ผ่านปฏิกิริยาการตกตะกอน",
    "ตรวจสอบแอนติเจนบนผิวเม็ดเลือดแดงจำลองคู่กับน้ำยาแอนติบอดี",
    "วิเคราะห์หลักการให้และรับเลือดอย่างปลอดภัยในทฤษฎีทางการแพทย์"
  ],
  learningObjectives: [
    "ระบุแอนติเจนและแอนติบอดีในหมู่เลือด A, B, AB, O และ Rh ได้ถูกต้อง",
    "อ่านและแปลผลการตกตะกอนของเลือดเมื่อหยดซีรัมทดสอบได้แม่นยำ",
    "อธิบายเงื่อนไขความเข้ากันได้ของการถ่ายเลือดแก่คนไข้ได้ปลอดภัย"
  ],
  equipments: [
    { id: "blood-tray", name: "แผ่นหลุมทดสอบหมู่เลือด (Blood Plate)", role: "แผ่นพลาสติกที่มีช่องหลุมรับตัวอย่างเลือดและน้ำยาเพื่อตรวจสอบผลตกตะกอน", note: "ทำความสะอาดช่องหลุมและเช็ดให้แห้งก่อนทำการหยดน้ำยาตัวอย่าง", unit: "หลุม", tone: "cyan", visualKey: "BloodTypingSVG" },
    { id: "antisera", name: "น้ำยาทดสอบ แอนติ-A, แอนติ-B และ แอนติ-D", role: "ซีรัมบรรจุแอนติบอดีจำลองสำหรับทดสอบปฏิกิริยากับแอนติเจนบนเม็ดเลือด", note: "ระวังหยดสลับหลอดทดสอบเพื่อป้องกันไม่ให้อ่านค่าผลลัพธ์คลาดเคลื่อน", unit: "ขวด", tone: "rose", visualKey: "PipetteVisual" },
    { id: "blood-sample", name: "ตัวอย่างเลือดจำลองคนไข้", role: "ตัวอย่างเม็ดเลือดแดงในของเหลวสำหรับหยดทดสอบหาชนิดกรุ๊ปเลือด", note: "ระมัดระวังความสะอาดและเลียนแบบการจับกลุ่มตกตะกอนในโลกจริง", unit: "ml", tone: "blue", visualKey: "BeakerVisual" }
  ],
  steps: [
    { num: 1, title: "หยดตัวอย่างเลือดในหลุม", desc: "หยดตัวอย่างเลือดลงในช่องหลุมทดสอบทั้ง 3 ช่อง (A, B, Rh) ให้ครบถ้วน", iconKey: "FlaskConical", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "หยดน้ำยาทดสอบ (Antisera)", desc: "หยดน้ำยา แอนติ-A, แอนติ-B และ แอนติ-D ลงในช่องหลุมจำลองตามลำดับ", iconKey: "Droplets", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "ผสมและรอตกตะกอน", desc: "ใช้ไม้คนผสมสารละลายทีละหลุมอย่างระมัดระวัง รอสังเกตเกล็ดตกตะกอน", iconKey: "Timer", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "สรุปผลและหาหมู่เลือด", desc: "นับหลุมที่ตกตะกอนร่วมเพื่อหาชนิดหมู่เลือดระบบ ABO และ Rh ในสเกลจริง", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "การจำแนกหมู่เลือดอาศัยกลไกตกตะกอน (Agglutination) ของเม็ดเลือดแดงเมื่อแอนติเจนบนผิวสัมผัสจับกับแอนติบอดีจำลองที่จำเพาะเจาะจงในน้ำยาทดสอบ โดยช่วยหลีกเลี่ยงภาวะช็อกรุนแรงจากการให้เลือดผิดกรุ๊ป",
  equationHtml: "Antigen (RBC) + Antibody (Serum) &rarr; Agglutination",
  equationLabels: [
    { label: "Antigen", desc: "โปรตีนแอนติเจน A, B หรือ Rh บนผิวเม็ดเลือดแดง", color: "text-rose-500" },
    { label: "Antibody", desc: "โปรตีนแอนติบอดีในพลาสม่าที่พร้อมทำปฏิกิริยาตกตะกอน", color: "text-cyan-500" }
  ],
  graph: {
    title: "แผนภาพตกตะกอนจำลอง",
    subtitle: "Blood Type Reaction Matrix",
    xTitle: "น้ำยา",
    yTitle: "ปฏิกิริยา",
    yLabels: ["ตกตะกอน", "ไม่ตกตะกอน"],
    xLabels: ["แอนติ-A", "แอนติ-B", "แอนติ-D"],
    graphType: "custom",
    customPath: "M20,60 H80 M100,20 V90",
    pathColor: "#ef4444"
  }
};

// 35. Food Chain & Ecology
const foodChainDetails: LabDetailData = {
  overviewBullets: [
    "วิเคราะห์การถ่ายทอดพลังงานและสารอาหารในพีระมิดพลังงานระบบนิเวศ",
    "ปรับสัดส่วนปริมาณผู้ผลิต ผู้บริโภค และผู้ย่อยสลายเพื่อจำลองสมดุล",
    "คำนวณประสิทธิภาพการส่งถ่ายตามกฎสิบเปอร์เซ็นต์ (Ten Percent Law)"
  ],
  learningObjectives: [
    "อธิบายความสัมพันธ์ของการถ่ายทอดในห่วงโซ่และสายใยอาหารได้",
    "คำนวณและประเมินค่าพลังงานสูญเสียในแต่ละระดับชั้นบริโภคได้",
    "ระบุและอธิบายผลกระทบของสารพิษสะสมชีวภาพ (Biomagnification) ได้ถูกต้อง"
  ],
  equipments: [
    { id: "eco-pyramid", name: "แบบจำลองพีระมิดพลังงาน (Energy Pyramid)", role: "ช่วยแจงระดับปริมาณและระดับชั้นบริโภค (Trophic Levels) ของระบบนิเวศ", note: "เปรียบเทียบสัดส่วนพลังงานกิโลแคลอรีสะสมในแต่ละชั้น Trophic", unit: "kcal", tone: "blue", visualKey: "FoodChainSVG" },
    { id: "organism-counters", name: "แผงพิกัดผู้ผลิตและผู้บริโภคจำลอง", role: "สิ่งมีชีวิตจำลองในห่วงโซ่ (เช่น หญ้า ตั๊กแตน นก อินทรี) สำหรับเปรียบเทียบมวล", note: "ปรับตั้งตัวแปรเริ่มต้นสัดส่วนให้สมดุลเพื่อป้องกันการสูญพันธุ์รวดเร็ว", unit: "n", tone: "emerald", visualKey: "PeaPlantVisual" }
  ],
  steps: [
    { num: 1, title: "ติดตั้งระดับชั้นบริโภค", desc: "กำหนดสัดส่วนปริมาณประชากรผู้ผลิต (พืชพรรณ) ที่ระดับฐานล่างสุด", iconKey: "ListOrdered", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "ป้อนลำดับผู้บริโภคย่อย", desc: "เติมประชากรผู้บริโภคอันดับที่ 1, 2 และผู้ล่าสูงสุดตามลำดับชั้น", iconKey: "Sliders", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "สังเกตอัตราไหลพลังงาน", desc: "วิเคราะห์พลังงานสะสมกิโลแคลอรีที่ส่งผ่านไปตามลำดับโซ่อาหาร", iconKey: "Activity", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "สรุปประสิทธิภาพส่งถ่าย", desc: "คํานวณประสิทธิภาพร้อยละการไหลพลังงานเปรียบเทียบกับกฎ 10%", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "พีระมิดนิเวศวิทยาแสดงการส่งผ่านพลังงานในรูปของอาหารไปตามลําดับขั้น Trophic โดยพลังงานประมาณร้อยละ 90 จะสูญเสียไปในรูปของความร้อนและกิจกรรมการหายใจ ส่วนที่ส่งต่อได้สำเร็จมีเพียงร้อยละ 10",
  equationHtml: "Energy<sub>Trophic</sub> = Energy<sub>Input</sub> &times; 10%",
  equationLabels: [
    { label: "10% Law", desc: "กฎการส่งผ่านพลังงานสำเร็จไปยังชั้นบริโภคถัดไป", color: "text-emerald-500" },
    { label: "Losses", desc: "พลังงานร้อยละ 90 สูญเสียในกระบวนการหายใจและความร้อน", color: "text-rose-500" }
  ],
  graph: {
    title: "พีระมิดระดับ Trophic",
    subtitle: "Ten Percent Law Pyramid Flow",
    xTitle: "Trophic",
    yTitle: "พลังงาน",
    yLabels: ["10000", "1000", "100", "10"],
    xLabels: ["ผู้ผลิต", "เหยื่อ1", "เหยื่อ2", "ผู้ล่า"],
    graphType: "custom",
    customPath: "M100,10 L160,110 H40 Z",
    pathColor: "#22c55e"
  }
};

// 36. Cardiovascular System (Heart Rate)
const heartRateDetails: LabDetailData = {
  overviewBullets: [
    "วิเคราะห์การเปลี่ยนแปลงอัตราชีพจรเต้นของหัวใจและความดันเลือดต่อระดับกิจกรรม",
    "ปรับตัวแปรอัตราระดับการทำกิจกรรมและปริมาณสารจำลอง (เช่น คาเฟอีน)",
    "ติดตามและสังเกตสัญญาณชีพ ECG บนเครื่องจอมอนิเตอร์จำลอง"
  ],
  learningObjectives: [
    "อธิบายกลไกควบคุมการเต้นหัวใจของระบบประสาทอัตโนวัติได้ถูกต้อง",
    "ประเมินและตีความพิกัดความดันเลือด (Systolic/Diastolic) ในสภาวะแวดล้อมได้",
    "สรุปแนวคิดการปรับอัตราไหลเวียนโลหิตรักษาโฮมีโอสเตซิสของพืชพรรณพืชและสัตว์ได้"
  ],
  equipments: [
    { id: "ecg-monitor", name: "เครื่องมอนิเตอร์สัญญาณชีพ ECG (ECG Monitor)", role: "แสดงพิกัดคลื่นไฟฟ้าหัวใจและการเต้นเฉลี่ยต่อนาทีแบบเรียลไทม์", note: "สังเกตความถี่คลื่นความกว้างเพื่อตรวจหาสัญญาณผิดจังหวะเบื้องต้น", unit: "bpm", tone: "blue", visualKey: "HeartRateSVG" },
    { id: "bp-cuff", name: "เครื่องวัดความดันโลหิตระบบดิจิทัล (Sphygmomanometer)", role: "วัดความดันบีบตัวตัวบน (SYS) และความดันคลายตัวตัวล่าง (DIA) ของระบบปิด", note: "รอให้ปั๊มปล่อยลมรัดแขนเสร็จสิ้นก่อนเริ่มอ่านค่าพิกัดความดัน", unit: "mmHg", tone: "cyan", visualKey: "PHMeterVisual" },
    { id: "stimulants", name: "สารเคมีกระตุ้นจำลอง (เช่น คาเฟอีน, อะดรีนาลีน)", role: "สารควบคุมระดับการกระตุ้นประสาทเพื่อประเมินจังหวะตอบสนองหัวใจ", note: "หยดระดับความเข้มข้นจำลองในสเกลไมโครกรัมควบคุม", unit: "μg", tone: "rose", visualKey: "PipetteVisual" }
  ],
  steps: [
    { num: 1, title: "ติดสายวัดขั้ว ECG และพันปลอกแขน BP", desc: "ต่อขั้วสายวัดไฟฟ้าเข้าจุดจำลองร่างกายและตั้งระดับBPให้เข้าที่", iconKey: "FlaskConical", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "วัดค่าความต่างชีพจรขณะพัก", desc: "บันทึกสัญญาณคลื่นไฟฟ้าและการเต้นต่อนาทีขณะร่างกายอยู่ในจุดพักนิ่ง", iconKey: "Timer", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 3, title: "เพิ่มระดับกิจกรรมหรือป้อนสาร", desc: "ตั้งสเกลจำลองกิจกรรมการออกกำลังกาย หรือฉีดสารกระตุ้นในขอบเขต", iconKey: "Sliders", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "วิเคราะห์แนวโน้ม BP และ ECG", desc: "พล็อตกราฟอัตราความถี่หัวใจตามความเหนื่อยสะสม และสรุปการคุมอัตโนวัติ", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" }
  ],
  theoryDescription: "ระบบหมุนเวียนโลหิตตอบสนองความต้องการ O₂ ของเนื้อเยื่อ โดยศูนย์ควบคุมที่สมองส่วนท้ายสั่งการผ่านประสาทซิมพาเทติกเพื่อเร่งชีพจร และพาราซิมพาเทติกเพื่อลดความต่างจังหวะกลับคืนสู่สมดุล",
  equationHtml: "Cardiac Output = Heart Rate &times; Stroke Volume",
  equationLabels: [
    { label: "Output", desc: "ปริมาณเลือดที่ออกจากหัวใจสูบฉีดต่อนาที (L/min)", color: "text-indigo-500" },
    { label: "Rate", desc: "อัตราความถี่เต้นหัวใจจังหวะเฉลี่ยต่อนาที (bpm)", color: "text-rose-500" },
    { label: "Volume", desc: "ปริมาตรเลือดที่บีบแต่ละครั้งในห้องล่างซ้าย (ml)", color: "text-emerald-500" }
  ],
  graph: {
    title: "กราฟชีพจรเต้นเทียบความเหนื่อย",
    subtitle: "Heart Rate vs Physical Load Trend",
    xTitle: "Load",
    yTitle: "HR",
    yLabels: ["180", "140", "100", "60"],
    xLabels: ["พักนิ่ง", "เดินเบา", "วิ่งเหยาะ", "วิ่งเร็ว"],
    graphType: "line",
    solidLineCoords: { x1: 20, y1: 98, x2: 180, y2: 25 },
    pathColor: "#16a34a"
  }
};

const periodicTableDetails: LabDetailData = {
  overviewBullets: [
    "สำรวจตารางธาตุผ่านแบบจำลอง 3D-style เพื่ออ่านเลขอะตอม สัญลักษณ์ มวลอะตอม คาบ และหมู่",
    "เปรียบเทียบสมบัติของธาตุในหมวดหลัก 7 หมู่และดูแนวโน้มที่เปลี่ยนไปตามตำแหน่ง",
    "เชื่อมโยงโครงสร้างอะตอมกับสมบัติของธาตุก่อนต่อยอดสู่แล็บสารละลาย ปฏิกิริยา และแก๊ส"
  ],
  learningObjectives: [
    "ระบุข้อมูลสำคัญบนช่องธาตุ เช่น เลขอะตอม สัญลักษณ์ ชื่อธาตุ และมวลอะตอมได้",
    "อธิบายความหมายของคาบ หมู่ และหมวดธาตุหลัก 7 หมู่ได้อย่างถูกต้อง",
    "เปรียบเทียบแนวโน้มสมบัติพื้นฐาน เช่น ความเป็นโลหะและการเกิดไอออนตามตำแหน่งบนตารางธาตุได้"
  ],
  equipments: [
    { id: "periodic-board", name: "ตารางธาตุ 3D", role: "แสดงตำแหน่งธาตุ เลขอะตอม สัญลักษณ์ คาบ และหมู่แบบเลือกดูได้", note: "เลือกธาตุหนึ่งช่องเพื่อดูรายละเอียดและเปรียบเทียบกับธาตุใกล้เคียง", unit: "118", tone: "violet", visualKey: "PeriodicTableVisual" },
    { id: "element-card", name: "การ์ดรายละเอียดธาตุ", role: "แสดงชื่อธาตุ หมวดธาตุ มวลอะตอม และตำแหน่งคาบ/หมู่", note: "ใช้ดูสมบัติเด่นและตัวอย่างการใช้งานของธาตุที่เลือก", unit: "info", tone: "blue", visualKey: "ClipboardVisual" },
    { id: "category-filter", name: "ตัวกรองหมวดธาตุ 7 หมู่", role: "แยกสีธาตุตามหมวด เช่น โลหะแอลคาไล อโลหะ กึ่งโลหะ และแก๊สมีตระกูล", note: "สังเกตว่าแต่ละหมวดกระจายตัวอยู่บริเวณใดของตาราง", unit: "7", tone: "emerald", visualKey: "PHMeterVisual" },
    { id: "trend-panel", name: "แผงแนวโน้มสมบัติ", role: "ช่วยอ่านแนวโน้มรัศมีอะตอม ความเป็นโลหะ และพลังงานไอออไนเซชันโดยภาพรวม", note: "ใช้เป็นแนวทางเบื้องต้น ไม่แทนค่าตารางอ้างอิงเชิงลึก", unit: "trend", tone: "amber", visualKey: "GraphVisual" }
  ],
  steps: [
    { num: 1, title: "เลือกหมวดธาตุ", desc: "เริ่มจากเลือกหมวดธาตุหนึ่งจาก 7 หมู่เพื่อเน้นสีและดูตัวอย่างธาตุในกลุ่มนั้น", iconKey: "Sliders", color: "text-violet-500", bg: "bg-violet-50" },
    { num: 2, title: "เลือกธาตุบนตาราง", desc: "คลิกช่องธาตุเพื่ออ่านเลขอะตอม สัญลักษณ์ ชื่อธาตุ มวลอะตอม คาบ และหมู่", iconKey: "Atom", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 3, title: "เปรียบเทียบตำแหน่ง", desc: "ดูว่าธาตุอยู่คาบเดียวกันหรือหมู่เดียวกันกับธาตุอื่น และเปรียบเทียบสมบัติที่คล้ายกัน", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "สรุปแนวโน้ม", desc: "สรุปความสัมพันธ์ระหว่างตำแหน่งในตารางกับสมบัติของธาตุก่อนนำไปใช้ในแล็บเคมี", iconKey: "ClipboardList", color: "text-amber-500", bg: "bg-amber-50" }
  ],
  theoryDescription: "ตารางธาตุจัดเรียงธาตุตามเลขอะตอมจากน้อยไปมาก โดยคาบบอกจำนวนระดับพลังงานหลักของอิเล็กตรอน ส่วนหมู่ช่วยบอกจำนวนอิเล็กตรอนเวเลนซ์โดยประมาณในธาตุกลุ่มหลัก ธาตุที่อยู่หมู่เดียวกันจึงมักมีสมบัติคล้ายกัน และสามารถแยกหมวดพื้นฐานได้เป็น 7 หมู่เพื่อช่วยอ่านแนวโน้มทางเคมี",
  equationHtml: "Z = p<sup>+</sup> = จำนวนโปรตอน",
  equationLabels: [
    { label: "Z", desc: "เลขอะตอม ใช้จัดลำดับธาตุในตารางธาตุ", color: "text-violet-500" },
    { label: "Period", desc: "คาบหรือแถวแนวนอน บอกระดับพลังงานหลัก", color: "text-blue-500" },
    { label: "Group", desc: "หมู่หรือคอลัมน์แนวตั้ง บอกสมบัติคล้ายกันของธาตุ", color: "text-emerald-500" }
  ],
  graph: {
    title: "แนวโน้มสมบัติบนตารางธาตุ",
    subtitle: "Periodic Trend Overview",
    xTitle: "ตำแหน่งบนตาราง",
    yTitle: "แนวโน้มสมบัติ",
    yLabels: ["สูง", "กลาง", "ต่ำ", "เริ่มต้น"],
    xLabels: ["ซ้ายล่าง", "กลาง", "ขวาบน", "แก๊สมีตระกูล"],
    graphType: "custom",
    customPath: "M22,102 C62,86 86,62 116,52 C142,43 158,30 182,20",
    pathColor: "#7c3aed",
    annotation: { x: 132, y: 42, text: "Ionization ↑", color: "#7c3aed" }
  }
};

const atmosphereLayersDetails: LabDetailData = {
  overviewBullets: [
    "สำรวจชั้นบรรยากาศหลักจากพื้นโลกขึ้นไป และดูว่าชั้นใดเกี่ยวข้องกับสภาพอากาศมากที่สุด",
    "คลิกก้อนเมฆแต่ละชนิดเพื่ออ่านลักษณะเด่น ช่วงความสูง และสภาพอากาศที่มักพบ",
    "บันทึกการสังเกตเมฆหลายชนิดเพื่อเปรียบเทียบเมฆต่ำ เมฆระดับกลาง เมฆสูง และเมฆฝนฟ้าคะนอง"
  ],
  learningObjectives: [
    "บอกชื่อและช่วงความสูงโดยประมาณของชั้นบรรยากาศหลักได้",
    "จำแนกเมฆพื้นฐานจากรูปร่างและช่วงความสูงที่พบได้",
    "อธิบายความสัมพันธ์ระหว่างเมฆในโทรโพสเฟียร์กับสภาพอากาศประจำวันได้"
  ],
  equipments: [
    { id: "atmosphere-map", name: "แผนภาพชั้นบรรยากาศ", role: "แสดงระดับความสูงของโทรโพสเฟียร์ สตราโตสเฟียร์ มีโซสเฟียร์ และเทอร์โมสเฟียร์", note: "ใช้ดูภาพรวมก่อนเลือกก้อนเมฆ", unit: "km", tone: "blue", visualKey: "GraphVisual" },
    { id: "cloud-buttons", name: "ก้อนเมฆแบบคลิกได้", role: "เลือกชนิดเมฆเพื่ออ่านรายละเอียดและช่วงความสูง", note: "เปรียบเทียบเมฆต่ำ เมฆกลาง เมฆสูง และเมฆแนวตั้ง", unit: "5 แบบ", tone: "cyan", visualKey: "ClipboardVisual" },
    { id: "altitude-ruler", name: "สเกลระดับความสูง", role: "ช่วยอ่านช่วงความสูงของเมฆและชั้นบรรยากาศ", note: "ค่าความสูงเป็นช่วงโดยประมาณเพื่อการเรียนรู้", unit: "กม.", tone: "emerald", visualKey: "ThermometerVisual" }
  ],
  steps: [
    { num: 1, title: "อ่านชั้นบรรยากาศ", desc: "เริ่มจากดูแถบชั้นบรรยากาศและสังเกตว่าเมฆส่วนใหญ่อยู่ในโทรโพสเฟียร์", iconKey: "Layers", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "คลิกก้อนเมฆ", desc: "เลือกก้อนเมฆบนฉากเพื่อดูชื่อ ช่วงความสูง ลักษณะ และสภาพอากาศที่เกี่ยวข้อง", iconKey: "Cloud", color: "text-cyan-500", bg: "bg-cyan-50" },
    { num: 3, title: "บันทึกการสังเกต", desc: "บันทึกเมฆที่เลือกลงตารางเพื่อเปรียบเทียบความสูงและชนิดของเมฆ", iconKey: "ClipboardList", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "สรุปผล", desc: "อธิบายว่าเมฆแต่ละชนิดบอกข้อมูลเกี่ยวกับอากาศบริเวณนั้นอย่างไร", iconKey: "CheckCircle2", color: "text-amber-500", bg: "bg-amber-50" }
  ],
  theoryDescription: "ชั้นบรรยากาศแบ่งตามการเปลี่ยนแปลงของอุณหภูมิและความสูง ชั้นที่ใกล้พื้นโลกที่สุดคือโทรโพสเฟียร์ มีความสูงประมาณ 0-12 กิโลเมตรและเป็นบริเวณที่เกิดเมฆ ฝน ลม และสภาพอากาศส่วนใหญ่ เมฆแต่ละชนิดมีรูปร่างและช่วงความสูงต่างกัน จึงช่วยบอกสภาพอากาศได้ในระดับพื้นฐาน",
  equationHtml: "เมฆส่วนใหญ่เกิดใน Troposphere ≈ 0-12 km",
  equationLabels: [
    { label: "Troposphere", desc: "ชั้นล่างสุดที่เกิดสภาพอากาศและเมฆส่วนใหญ่", color: "text-blue-500" },
    { label: "Altitude", desc: "ระดับความสูงจากพื้นโลก ใช้จำแนกเมฆต่ำ กลาง สูง", color: "text-emerald-500" },
    { label: "Cloud type", desc: "รูปร่างของเมฆช่วยบอกสภาพอากาศโดยประมาณ", color: "text-cyan-500" }
  ],
  graph: {
    title: "ช่วงความสูงของเมฆ",
    subtitle: "Cloud Altitude Bands",
    xTitle: "ชนิดเมฆ",
    yTitle: "ระดับความสูง (km)",
    yLabels: ["16", "12", "8", "4", "0"],
    xLabels: ["Stratus", "Cumulus", "Altocumulus", "Cirrus", "Cumulonimbus"],
    graphType: "custom",
    customPath: "M18,102 L54,92 L92,66 L132,42 L178,18",
    pathColor: "#0284c7",
    annotation: { x: 118, y: 34, text: "High clouds", color: "#0284c7" }
  }
};

const foundationVisualKeys: Record<FoundationExplorerLab["visualKind"], string> = {
  equipment: "BeakerVisual",
  "animal-cell": "MicroscopeSlideVisual",
  "leaf-cell": "PlantChamberVisual",
  blood: "BloodTypingSVG",
  chemicals: "BuretteVisual",
  "external-muscle": "HeartRateSVG",
  "internal-muscle": "HeartRateSVG",
  minerals: "ClipboardListVisual",
};

const foundationStepIcons: Record<FoundationExplorerLab["visualKind"], string> = {
  equipment: "FlaskConical",
  "animal-cell": "Microscope",
  "leaf-cell": "Leaf",
  blood: "Activity",
  chemicals: "FlaskConical",
  "external-muscle": "Activity",
  "internal-muscle": "Activity",
  minerals: "ClipboardList",
};

function createFoundationExplorerDetails(lab: FoundationExplorerLab): LabDetailData {
  const tones: EquipmentItemData["tone"][] = ["blue", "emerald", "violet", "amber", "cyan"];
  const visualKey = foundationVisualKeys[lab.visualKind];
  const iconKey = foundationStepIcons[lab.visualKind];

  return {
    overviewBullets: lab.overviewBullets,
    learningObjectives: lab.learningObjectives,
    equipments: lab.items.slice(0, 5).map((item, index) => ({
      id: item.id,
      name: item.name,
      role: item.subtitle,
      note: item.detail,
      unit: item.tag,
      tone: tones[index % tones.length],
      visualKey,
    })),
    steps: [
      { num: 1, title: "อ่านภาพรวม", desc: `ดูภาพรวมของ ${lab.thaiTitle} และคำสำคัญก่อนเริ่มสำรวจ`, iconKey: "BookOpen", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "เลือกหัวข้อ", desc: "คลิกการ์ดหรือรายการบนภาพเพื่อดูรายละเอียดของหัวข้อนั้น", iconKey, color: "text-emerald-500", bg: "bg-emerald-50" },
      { num: 3, title: "เปรียบเทียบข้อมูล", desc: "เปรียบเทียบหน้าที่ ตำแหน่ง ประโยชน์ หรือข้อควรระวังของแต่ละรายการ", iconKey: "Shuffle", color: "text-violet-500", bg: "bg-violet-50" },
      { num: 4, title: "สรุปข้อควรจำ", desc: "ทบทวนข้อควรจำและนำไปใช้ก่อนเข้าสู่แล็บทดลองจริง", iconKey: "ClipboardList", color: "text-amber-500", bg: "bg-amber-50" },
    ],
    theoryDescription: lab.theory,
    equationHtml: lab.keyLine,
    equationLabels: lab.items.slice(0, 3).map((item, index) => ({
      label: item.name,
      desc: item.subtitle,
      color: ["text-blue-500", "text-emerald-500", "text-violet-500"][index],
    })),
    graph: {
      title: `${lab.thaiTitle} แบบสำรวจ`,
      subtitle: "Foundation Knowledge Map",
      xTitle: "หัวข้อ",
      yTitle: "ความเชื่อมโยง",
      yLabels: ["มาก", "กลาง", "พื้นฐาน", "เริ่มต้น"],
      xLabels: lab.items.slice(0, 4).map((item) => item.tag),
      graphType: "custom",
      customPath: "M18,96 C48,70 72,78 98,48 C124,18 148,42 182,22",
      pathColor: "#0891b2",
      annotation: { x: 116, y: 34, text: "สำรวจ", color: "#0891b2" },
    },
  };
}

const foundationExplorerDetails = Object.fromEntries(
  foundationExplorerLabList.map((lab) => [lab.id, createFoundationExplorerDetails(lab)])
) as Record<string, LabDetailData>;

function createMathConceptDetails(input: {
  title: string;
  focus: string;
  equation: string;
  xTitle: string;
  yTitle: string;
  graphType?: GraphConfigData["graphType"];
  pathColor?: string;
  overviewBullets?: string[];
  learningObjectives?: string[];
  equipments?: EquipmentItemData[];
  steps?: StepItemData[];
  theoryDescription?: string;
  equationLabels?: EquationLabelData[];
  graph?: GraphConfigData;
}): LabDetailData {
  return {
    overviewBullets: input.overviewBullets ?? [
      `สำรวจแนวคิด ${input.focus} ผ่านการปรับค่าและอ่านผลลัพธ์จากภาพ กราฟ และตาราง`,
      "เชื่อมโยงภาษาคณิตศาสตร์กับข้อมูลจากห้องทดลองวิทยาศาสตร์ เพื่อช่วยอธิบายแนวโน้มและความสัมพันธ์ของตัวแปร",
      "ฝึกตั้งคำถามจากข้อมูล สังเกตรูปแบบ และสรุปผลด้วยเหตุผลเชิงปริมาณอย่างเป็นขั้นตอน",
    ],
    learningObjectives: input.learningObjectives ?? [
      `อธิบายความหมายของ ${input.focus} ได้ด้วยคำพูด กราฟ และสัญลักษณ์ทางคณิตศาสตร์`,
      "อ่านค่าจากกราฟหรือตาราง และระบุว่าตัวแปรใดเป็น input, output หรือค่าที่ต้องควบคุม",
      "นำแนวคิดคณิตศาสตร์ไปช่วยวิเคราะห์ผลการทดลองในแล็บวิทยาศาสตร์ของ Scisiam ได้",
    ],
    equipments: input.equipments ?? [
      {
        id: "coordinate-grid",
        name: "กริดพิกัด",
        role: "พื้นที่สำหรับวางจุด อ่านแกน และติดตามความสัมพันธ์ของตัวแปร",
        note: "สังเกตชื่อแกน หน่วย และช่วงค่าก่อนตีความกราฟทุกครั้ง",
        unit: "x-y",
        tone: "violet",
        visualKey: "GraphVisual",
      },
      {
        id: "data-table",
        name: "ตารางข้อมูล",
        role: "เก็บค่า input-output หรือผลการวัดหลายครั้งเพื่อเปรียบเทียบ",
        note: "ตรวจว่าข้อมูลอยู่ในหน่วยเดียวกันก่อนนำไปคำนวณ",
        unit: "data",
        tone: "blue",
        visualKey: "ClipboardVisual",
      },
      {
        id: "math-rule",
        name: "กฎหรือสมการ",
        role: "อธิบายรูปแบบที่เชื่อมค่าตัวแปรต้นกับตัวแปรตาม",
        note: "ใช้สมการเป็นแบบจำลอง ไม่ใช่คำตอบสุดท้ายโดยไม่ตรวจข้อมูล",
        unit: "rule",
        tone: "emerald",
        visualKey: "PHMeterVisual",
      },
      {
        id: "trend-marker",
        name: "ตัวอ่านแนวโน้ม",
        role: "ช่วยดูทิศทาง ความชัน ความแปรปรวน หรือค่าคลาดเคลื่อนจากข้อมูล",
        note: "เปรียบเทียบแนวโน้มกับจุดข้อมูลจริงเสมอ",
        unit: "trend",
        tone: "amber",
        visualKey: "GraphVisual",
      },
    ],
    steps: input.steps ?? [
      {
        num: 1,
        title: "ตั้งคำถามจากสถานการณ์",
        desc: `ระบุว่าต้องการศึกษา ${input.focus} ในบริบทใด และตัวแปรใดควรเปลี่ยนทีละตัว`,
        iconKey: "Target",
        color: "text-violet-500",
        bg: "bg-violet-50",
      },
      {
        num: 2,
        title: "สร้างหรือเลือกข้อมูล",
        desc: "ปรับค่า input หรือใช้ข้อมูลตัวอย่าง แล้วบันทึกผลในตารางอย่างเป็นลำดับ",
        iconKey: "ClipboardList",
        color: "text-blue-500",
        bg: "bg-blue-50",
      },
      {
        num: 3,
        title: "อ่านกราฟและรูปแบบ",
        desc: "ดูทิศทาง จุดสำคัญ ความชัน หรือการกระจายของข้อมูลก่อนสรุปผล",
        iconKey: "LineChart",
        color: "text-emerald-500",
        bg: "bg-emerald-50",
      },
      {
        num: 4,
        title: "เชื่อมกับแล็บวิทยาศาสตร์",
        desc: "อธิบายว่าคณิตศาสตร์ช่วยทำให้ผลทดลองอ่านง่ายขึ้นหรือแม่นยำขึ้นอย่างไร",
        iconKey: "BookOpen",
        color: "text-amber-500",
        bg: "bg-amber-50",
      },
    ],
    theoryDescription: input.theoryDescription ?? `${input.title} เป็นแล็บคณิตศาสตร์พื้นฐานสำหรับช่วยอ่านความสัมพันธ์ของข้อมูลใน Scisiam ผู้เรียนจะใช้ภาพ ตาราง กราฟ และสมการเพื่อแปลความหมายของตัวแปรและแนวโน้มอย่างเป็นระบบ`,
    equationHtml: input.equation,
    equationLabels: input.equationLabels ?? [
      { label: "input", desc: "ค่าที่ผู้เรียนปรับหรือกำหนดก่อนสังเกตผลลัพธ์", color: "text-violet-500" },
      { label: "output", desc: "ค่าที่เปลี่ยนตามกฎ แบบจำลอง หรือข้อมูลที่เก็บได้", color: "text-blue-500" },
      { label: "model", desc: "รูปแบบคณิตศาสตร์ที่ช่วยอธิบายข้อมูลจริง", color: "text-emerald-500" },
    ],
    graph: input.graph ?? {
      title: `${input.title} Overview`,
      subtitle: "Math relationship preview",
      xTitle: input.xTitle,
      yTitle: input.yTitle,
      yLabels: ["สูง", "กลาง", "ต่ำ", "เริ่มต้น"],
      xLabels: ["0", "1", "2", "3", "4"],
      graphType: input.graphType ?? "line",
      customPath: "M20,92 C58,72 82,58 112,50 C140,42 158,28 182,22",
      pathColor: input.pathColor ?? "#7c3aed",
      points: [
        { x: 24, y: 92 },
        { x: 62, y: 72 },
        { x: 104, y: 54 },
        { x: 146, y: 38 },
        { x: 182, y: 22 },
      ],
    },
  };
}

function createDraftElementaryScienceDetails(input: {
  title: string;
  focus: string;
  equation: string;
  xTitle: string;
  yTitle: string;
  theoryDescription: string;
  equationLabels: EquationLabelData[];
  graphType?: GraphConfigData["graphType"];
  pathColor?: string;
}): LabDetailData {
  return createMathConceptDetails({
    ...input,
    overviewBullets: [
      `สำรวจแนวคิด ${input.focus} ผ่านสถานการณ์ใกล้ตัวที่เหมาะกับผู้เรียนระดับประถม`,
      "ฝึกสังเกต เปรียบเทียบ และบันทึกผลอย่างเป็นขั้นตอนก่อนสรุปด้วยคำพูดของตนเอง",
      "เชื่อมคำอธิบายวิทยาศาสตร์กับสิ่งที่พบในชีวิตประจำวัน เพื่อให้ผู้เรียนเห็นประโยชน์ของการทดลอง",
    ],
    learningObjectives: [
      `อธิบาย ${input.focus} ด้วยภาษาง่าย ๆ และตัวอย่างใกล้ตัวได้`,
      "แยกสิ่งที่เปลี่ยน สิ่งที่สังเกต และหลักฐานที่ใช้สรุปผลได้",
      "บันทึกผลในตารางหรือภาพอย่างเป็นระเบียบ และเปรียบเทียบก่อน-หลังการเปลี่ยนตัวแปรได้",
    ],
    equipments: [
      { id: "observation-tray", name: "ถาดสังเกต", role: "จัดวางตัวอย่างหรือวัตถุจำลองให้เด็กสังเกตอย่างปลอดภัย", note: "ใช้ตัวอย่างขนาดเล็กและหลีกเลี่ยงวัสดุอันตราย", unit: "set", tone: "blue", visualKey: "BeakerVisual" },
      { id: "variable-cards", name: "การ์ดตัวแปร", role: "ช่วยเลือกสิ่งที่จะเปลี่ยนทีละอย่าง เช่น ระยะทาง วัสดุ หรือปริมาณ", note: "เปลี่ยนทีละตัวแปรเพื่อให้เปรียบเทียบผลได้ชัด", unit: "cards", tone: "violet", visualKey: "ClipboardVisual" },
      { id: "measure-tool", name: "เครื่องมือวัดพื้นฐาน", role: "ใช้วัดระยะ เวลา ปริมาณ หรือระดับการเปลี่ยนแปลงแบบง่าย", note: "อ่านค่าให้ตรงหน่วยและบันทึกทุกครั้ง", unit: "measure", tone: "amber", visualKey: "RulerVisual" },
      { id: "record-table", name: "ตารางบันทึกผล", role: "บันทึกสิ่งที่สังเกตเห็นเพื่อเปรียบเทียบก่อนสรุป", note: "เขียนหลักฐานก่อนเขียนคำตอบเสมอ", unit: "data", tone: "emerald", visualKey: "ClipboardListVisual" },
    ],
    steps: [
      { num: 1, title: "ตั้งคำถามง่าย ๆ", desc: `ชวนผู้เรียนถามว่า ${input.focus} จะเปลี่ยนอย่างไรเมื่อปรับตัวแปรหนึ่งอย่าง`, iconKey: "Target", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "ทดลองทีละตัวแปร", desc: "เลือกตัวแปรหนึ่งอย่าง ปรับค่าอย่างปลอดภัย แล้วสังเกตผลที่เกิดขึ้น", iconKey: "Sliders", color: "text-violet-500", bg: "bg-violet-50" },
      { num: 3, title: "บันทึกหลักฐาน", desc: "บันทึกผลด้วยคำสั้น ๆ ภาพ ตาราง หรือค่าที่วัดได้ เพื่อใช้เปรียบเทียบ", iconKey: "ClipboardList", color: "text-emerald-500", bg: "bg-emerald-50" },
      { num: 4, title: "สรุปด้วยคำของตนเอง", desc: "ให้ผู้เรียนอธิบายว่าหลักฐานที่เห็นสนับสนุนคำตอบอย่างไร", iconKey: "BookOpen", color: "text-amber-500", bg: "bg-amber-50" },
    ],
    graph: {
      title: `${input.title} Preview`,
      subtitle: "Elementary science observation",
      xTitle: input.xTitle,
      yTitle: input.yTitle,
      yLabels: ["มาก", "กลาง", "น้อย", "เริ่มต้น"],
      xLabels: ["ครั้งที่ 1", "ครั้งที่ 2", "ครั้งที่ 3", "ครั้งที่ 4"],
      graphType: input.graphType ?? "line",
      customPath: "M22,92 C62,76 88,66 116,54 C144,42 164,34 184,24",
      pathColor: input.pathColor ?? "#2563eb",
      points: [
        { x: 24, y: 92 },
        { x: 66, y: 74 },
        { x: 108, y: 56 },
        { x: 150, y: 40 },
        { x: 184, y: 24 },
      ],
    },
  });
}

const graphingLinesDetails = createMathConceptDetails({
  title: "Graphing Lines & Slope",
  focus: "สมการเส้นตรง ความชัน และจุดตัดแกน",
  equation: "y = mx + b",
  xTitle: "x",
  yTitle: "y",
  overviewBullets: [
    "สำรวจเส้นตรงบนระนาบพิกัดโดยปรับความชัน (m) และจุดตัดแกน y (b) แล้วเห็นกราฟเปลี่ยนทันที",
    "อ่านค่าจากจุดสองจุด ตารางค่า และสมการ เพื่อดูว่าทั้งสามรูปแบบอธิบายเส้นเดียวกันได้อย่างไร",
    "เชื่อมโยงความชันกับอัตราการเปลี่ยนแปลง เช่น อุณหภูมิต่อเวลา ระยะทางต่อเวลา หรือแรงต่อระยะยืดในแล็บวิทยาศาสตร์",
  ],
  learningObjectives: [
    "คำนวณความชันจากจุดสองจุดและอธิบายความหมายของความชันบวก ลบ ศูนย์ และไม่กำหนดได้",
    "ระบุจุดตัดแกน y จากกราฟ ตาราง หรือสมการเส้นตรงได้ถูกต้อง",
    "แปลงข้อมูลทดลองอย่างง่ายให้เป็นสมการ y = mx + b และตีความ m กับ b ในบริบทจริงได้",
  ],
  equipments: [
    { id: "coordinate-plane", name: "ระนาบพิกัด x-y", role: "แสดงตำแหน่งจุดและเส้นตรงเพื่ออ่านค่าพิกัดอย่างเป็นระบบ", note: "ตรวจทิศแกนและสเกลก่อนอ่านความชันทุกครั้ง", unit: "x-y", tone: "violet", visualKey: "RulerVisual" },
    { id: "slope-triangle", name: "สามเหลี่ยมความชัน", role: "ช่วยเทียบ rise/run ระหว่างสองจุดบนเส้นตรง", note: "ใช้จุดที่อยู่บนเส้นเดียวกันและอ่านสเกลให้ตรงกัน", unit: "Δy/Δx", tone: "emerald", visualKey: "ProtractorVisual" },
    { id: "intercept-marker", name: "ตัวชี้จุดตัดแกน", role: "ทำเครื่องหมายจุดที่เส้นตัดแกน y เพื่อระบุค่า b", note: "จุดตัดแกน y คือค่าของ y เมื่อ x = 0", unit: "b", tone: "amber", visualKey: "PHMeterVisual" },
    { id: "linear-data-table", name: "ตารางค่า x-y", role: "บันทึกคู่ลำดับที่สร้างจากสมการหรืออ่านจากกราฟ", note: "ตรวจว่าค่า y เปลี่ยนด้วยอัตราคงที่เมื่อ x เพิ่มเท่ากัน", unit: "pairs", tone: "blue", visualKey: "ClipboardListVisual" },
  ],
  steps: [
    { num: 1, title: "วางจุดสองจุด", desc: "เลือกจุดเริ่มต้นและจุดปลายบนระนาบพิกัดเพื่อกำหนดแนวเส้นตรง", iconKey: "Target", color: "text-violet-500", bg: "bg-violet-50" },
    { num: 2, title: "คำนวณความชัน", desc: "ใช้ m = Δy/Δx จากสองจุด แล้วสังเกตว่าเส้นเอียงขึ้นหรือลง", iconKey: "Ruler", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 3, title: "หาจุดตัดแกน y", desc: "อ่านค่า b เมื่อเส้นตัดแกน y และใส่ลงในสมการ y = mx + b", iconKey: "LineChart", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 4, title: "ตรวจด้วยตารางค่า", desc: "แทนค่า x หลายค่าเพื่อดูว่าแต่ละคู่ลำดับวางอยู่บนเส้นตรงเดียวกัน", iconKey: "ClipboardList", color: "text-blue-500", bg: "bg-blue-50" },
  ],
  theoryDescription: "สมการเส้นตรง y = mx + b อธิบายความสัมพันธ์ที่มีอัตราการเปลี่ยนแปลงคงที่ โดย m คือความชันหรือการเปลี่ยนของ y ต่อการเปลี่ยนของ x ส่วน b คือค่าเริ่มต้นเมื่อ x = 0 แนวคิดนี้ช่วยอ่านกราฟจากแล็บวิทยาศาสตร์ได้ เช่น กราฟแรง-ระยะยืด หรือกราฟแรงดัน-กระแส",
  equationLabels: [
    { label: "m", desc: "ความชันหรืออัตราการเปลี่ยนแปลงของ y ต่อ x", color: "text-violet-500" },
    { label: "b", desc: "จุดตัดแกน y หรือค่าเริ่มต้นเมื่อ x = 0", color: "text-amber-500" },
    { label: "(x, y)", desc: "คู่ลำดับที่ต้องอยู่บนเส้นตรงเมื่อแทนค่าในสมการ", color: "text-blue-500" },
  ],
  graph: {
    title: "กราฟเส้นตรงและความชัน",
    subtitle: "Slope-Intercept Form",
    xTitle: "x",
    yTitle: "y",
    yLabels: ["12", "8", "4", "0"],
    xLabels: ["0", "2", "4", "6", "8"],
    graphType: "line",
    customPath: "M24,94 L180,24",
    pathColor: "#7c3aed",
  },
});

const ratioAndProportionDetails = createMathConceptDetails({
  title: "Ratio & Proportion Lab",
  focus: "อัตราส่วน สัดส่วน และอัตราต่อหน่วย",
  equation: "a / b = c / d",
  xTitle: "ปริมาณตั้งต้น",
  yTitle: "ปริมาณที่เทียบสัดส่วน",
  pathColor: "#0891b2",
  overviewBullets: [
    "ทดลองเปลี่ยนปริมาณสองอย่างที่ต้องรักษาอัตราส่วนเดิม เช่น สารละลาย สีผสม หรือขนาดแบบจำลอง",
    "เปรียบเทียบตารางอัตราส่วน เส้นจำนวนคู่ และสเกลแฟกเตอร์ เพื่อดูว่าสัดส่วนใดเทียบเท่ากัน",
    "ใช้แนวคิดอัตราต่อหน่วยช่วยแปลข้อมูลวิทยาศาสตร์ เช่น ความเร็ว ความเข้มข้น หรืออัตราการเกิดปฏิกิริยา",
  ],
  learningObjectives: [
    "ระบุอัตราส่วนที่เทียบเท่ากันจากตารางหรือภาพจำลองได้",
    "ใช้การคูณไขว้และสเกลแฟกเตอร์เพื่อหาค่าที่หายไปในสัดส่วนได้",
    "อธิบายความหมายของอัตราต่อหน่วยและนำไปใช้กับสถานการณ์แล็บได้อย่างเหมาะสม",
  ],
  equipments: [
    { id: "ratio-table", name: "ตารางอัตราส่วน", role: "บันทึกคู่ค่าที่ต้องเพิ่มหรือลดพร้อมกันเพื่อรักษาสัดส่วน", note: "แต่ละแถวควรมีตัวคูณเดียวกันทั้งสองคอลัมน์", unit: "a:b", tone: "blue", visualKey: "ClipboardListVisual" },
    { id: "double-number-line", name: "เส้นจำนวนคู่", role: "แสดงสองปริมาณบนสเกลคู่ขนานเพื่อเปรียบเทียบการเพิ่มทีละช่วง", note: "ตำแหน่งที่ตรงกันคือคู่ค่าที่สัมพันธ์กัน", unit: "scale", tone: "violet", visualKey: "RulerVisual" },
    { id: "scale-factor-control", name: "ตัวปรับสเกลแฟกเตอร์", role: "คูณอัตราส่วนตั้งต้นให้ใหญ่ขึ้นหรือเล็กลงโดยรักษารูปแบบเดิม", note: "สเกลแฟกเตอร์ต้องคูณทั้งสองจำนวน ไม่ใช่คูณเพียงด้านเดียว", unit: "k", tone: "emerald", visualKey: "MassSetVisual" },
    { id: "unit-rate-card", name: "การ์ดอัตราต่อหน่วย", role: "แปลงอัตราส่วนให้เป็นค่าต่อ 1 หน่วยเพื่อเปรียบเทียบง่ายขึ้น", note: "เหมาะกับโจทย์ความเร็ว ราคา ความเข้มข้น หรืออัตราการไหล", unit: "per 1", tone: "amber", visualKey: "PHMeterVisual" },
  ],
  steps: [
    { num: 1, title: "ตั้งอัตราส่วนเริ่มต้น", desc: "กำหนดปริมาณสองอย่าง เช่น สาร A : สาร B หรือ ระยะทาง : เวลา", iconKey: "Sliders", color: "text-violet-500", bg: "bg-violet-50" },
    { num: 2, title: "ขยายหรือลดสเกล", desc: "คูณทั้งสองปริมาณด้วยตัวคูณเดียวกันแล้วดูว่าสัดส่วนยังเท่าเดิมหรือไม่", iconKey: "Activity", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 3, title: "หาค่าที่หายไป", desc: "ใช้การคูณไขว้หรือสเกลแฟกเตอร์เพื่อเติมค่าที่ไม่ทราบในสัดส่วน", iconKey: "Target", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 4, title: "แปลเป็นอัตราต่อหน่วย", desc: "ลดรูปให้เหลือต่อ 1 หน่วย แล้วอธิบายว่าค่านั้นหมายถึงอะไรในสถานการณ์แล็บ", iconKey: "BookOpen", color: "text-blue-500", bg: "bg-blue-50" },
  ],
  theoryDescription: "สัดส่วนคือความเท่ากันของอัตราส่วนสองชุด ถ้าคูณหรือหารทั้งสองจำนวนในอัตราส่วนด้วยตัวเดียวกัน ความสัมพันธ์จะยังคงเดิม แนวคิดนี้สำคัญต่อการอ่านความเข้มข้น การเจือจางสาร การขยายแบบจำลอง และอัตราการเปลี่ยนแปลงในข้อมูลทดลอง",
  equationLabels: [
    { label: "a:b", desc: "อัตราส่วนตั้งต้นของสองปริมาณ", color: "text-violet-500" },
    { label: "c:d", desc: "อัตราส่วนใหม่ที่ควรเทียบเท่ากับชุดตั้งต้น", color: "text-blue-500" },
    { label: "unit rate", desc: "ค่าต่อ 1 หน่วยที่ช่วยให้เปรียบเทียบสถานการณ์ต่างกันได้", color: "text-emerald-500" },
  ],
  graph: {
    title: "ตารางสัดส่วนเทียบเท่า",
    subtitle: "Equivalent Ratio Scaling",
    xTitle: "ตัวคูณ",
    yTitle: "ปริมาณ",
    yLabels: ["40", "30", "20", "10"],
    xLabels: ["1x", "2x", "3x", "4x"],
    graphType: "line",
    customPath: "M26,94 L72,72 L118,50 L164,28",
    pathColor: "#0891b2",
  },
});

const vectorAdditionDetails = createMathConceptDetails({
  title: "Vector Addition Lab",
  focus: "การรวมเวกเตอร์และองค์ประกอบแกน x-y",
  equation: "R = A + B",
  xTitle: "แกน x",
  yTitle: "แกน y",
  graphType: "custom",
  pathColor: "#2563eb",
  overviewBullets: [
    "ทดลองลากเวกเตอร์หลายตัวบนระนาบแล้วดูผลรวมสุทธิจากวิธีหัวต่อหางและวิธีองค์ประกอบ",
    "แยกเวกเตอร์เป็นแกน x และ y เพื่อเห็นว่าการรวมเวกเตอร์ไม่ใช่การบวกขนาดอย่างเดียว",
    "เชื่อมโยงกับแรง การกระจัด ความเร็ว และสนามไฟฟ้าที่ต้องมีทั้งขนาดและทิศทาง",
  ],
  learningObjectives: [
    "อธิบายความแตกต่างระหว่างปริมาณสเกลาร์และเวกเตอร์ได้",
    "คำนวณองค์ประกอบ Ax, Ay และรวมองค์ประกอบเพื่อหาผลลัพธ์ Rx, Ry ได้",
    "ตีความขนาดและทิศทางของเวกเตอร์ลัพธ์จากภาพลูกศรหรือข้อมูลเชิงตัวเลขได้",
  ],
  equipments: [
    { id: "vector-arrows", name: "ลูกศรเวกเตอร์ A และ B", role: "แสดงขนาดและทิศทางของเวกเตอร์แต่ละตัวบนระนาบ", note: "ความยาวแทนขนาด ส่วนหัวลูกศรแทนทิศทาง", unit: "N / m", tone: "blue", visualKey: "DynamicsCartVisual" },
    { id: "component-grid", name: "กริดองค์ประกอบ", role: "ช่วยแยกเวกเตอร์เป็นส่วนตามแกน x และแกน y", note: "เวกเตอร์หนึ่งตัวสามารถแทนด้วยคู่ค่า (x, y)", unit: "x,y", tone: "violet", visualKey: "RulerVisual" },
    { id: "angle-protractor", name: "ตัววัดมุม", role: "อ่านมุมของเวกเตอร์เทียบกับแกนอ้างอิง", note: "กำหนดทิศบวกของแกน x ให้ชัดก่อนวัดมุม", unit: "deg", tone: "amber", visualKey: "ProtractorVisual" },
    { id: "resultant-meter", name: "ตัวอ่านเวกเตอร์ลัพธ์", role: "สรุปขนาดและทิศทางของ R หลังรวมเวกเตอร์", note: "ตรวจทั้ง Rx, Ry และขนาด R ก่อนสรุปผล", unit: "R", tone: "emerald", visualKey: "VoltmeterVisual" },
  ],
  steps: [
    { num: 1, title: "กำหนดเวกเตอร์ A", desc: "เลือกขนาดและมุมของเวกเตอร์แรกบนระนาบพิกัด", iconKey: "Target", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "เพิ่มเวกเตอร์ B", desc: "วางเวกเตอร์ที่สองแบบหัวต่อหางหรือวางที่จุดกำเนิดเพื่อเปรียบเทียบ", iconKey: "Sliders", color: "text-violet-500", bg: "bg-violet-50" },
    { num: 3, title: "แยกองค์ประกอบ", desc: "อ่านหรือคำนวณ Ax, Ay, Bx และ By แล้วนำแกนเดียวกันมาบวกกัน", iconKey: "Ruler", color: "text-amber-500", bg: "bg-amber-50" },
    { num: 4, title: "สรุปเวกเตอร์ลัพธ์", desc: "ลาก R จากจุดเริ่มต้นถึงจุดปลายสุดและอธิบายขนาดกับทิศทางของผลลัพธ์", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" },
  ],
  theoryDescription: "เวกเตอร์เป็นปริมาณที่มีทั้งขนาดและทิศทาง การรวมเวกเตอร์ทำได้โดยต่อหัวกับหางหรือแยกเป็นองค์ประกอบตามแกน x-y แล้วบวกองค์ประกอบแกนเดียวกัน เวกเตอร์ลัพธ์ R จึงบอกผลสุทธิของแรง การเคลื่อนที่ หรือการกระจัดในระบบเดียวกัน",
  equationLabels: [
    { label: "A, B", desc: "เวกเตอร์ตั้งต้นที่มีขนาดและทิศทาง", color: "text-blue-500" },
    { label: "Rx, Ry", desc: "ผลรวมองค์ประกอบตามแกน x และแกน y", color: "text-violet-500" },
    { label: "|R|", desc: "ขนาดของเวกเตอร์ลัพธ์ที่คำนวณจากองค์ประกอบ", color: "text-emerald-500" },
  ],
  graph: {
    title: "การรวมเวกเตอร์บนระนาบ",
    subtitle: "Component and Resultant View",
    xTitle: "แกน x",
    yTitle: "แกน y",
    yLabels: ["+y", "", "0", "-y"],
    xLabels: ["-x", "0", "+x"],
    graphType: "custom",
    solidLineCoords: { x1: 35, y1: 88, x2: 105, y2: 45 },
    dashedLineCoords: { x1: 105, y1: 45, x2: 165, y2: 70 },
    customPath: "M35,88 L165,70",
    pathColor: "#2563eb",
  },
});

const centerAndVariabilityDetails = createMathConceptDetails({
  title: "Center & Variability",
  focus: "ค่าเฉลี่ย มัธยฐาน พิสัย และการกระจายของข้อมูล",
  equation: "mean = Σx / n",
  xTitle: "ชุดข้อมูล",
  yTitle: "ค่าที่วัดได้",
  graphType: "scatter",
  pathColor: "#10b981",
  overviewBullets: [
    "สำรวจชุดข้อมูลจากการวัดซ้ำ เช่น เวลา อุณหภูมิ ความยาว หรือคะแนน แล้วดูว่าค่ากลางเล่าเรื่องอะไร",
    "เปรียบเทียบค่าเฉลี่ย มัธยฐาน พิสัย และความแปรปรวนอย่างง่ายเพื่อไม่สรุปผลจากตัวเลขเดียว",
    "ใช้ dot plot และเครื่องหมายค่ากลางช่วยดู outlier และความสม่ำเสมอของข้อมูลทดลอง",
  ],
  learningObjectives: [
    "คำนวณและเปรียบเทียบค่าเฉลี่ยกับมัธยฐานของข้อมูลชุดเดียวกันได้",
    "อธิบายความหมายของพิสัยและการกระจายว่าเกี่ยวกับความน่าเชื่อถือของผลทดลองอย่างไร",
    "ระบุ outlier และตัดสินใจได้ว่าควรตรวจสอบข้อมูลซ้ำก่อนนำไปสรุปผลหรือไม่",
  ],
  equipments: [
    { id: "measurement-cards", name: "การ์ดข้อมูลการวัด", role: "เก็บค่าจากการทดลองซ้ำหลายครั้งเพื่อใช้คำนวณสถิติ", note: "อย่าลบค่าผิดปกติก่อนตรวจเหตุผลว่าผิดจริงหรือเป็นผลสำคัญ", unit: "data", tone: "blue", visualKey: "ClipboardListVisual" },
    { id: "dot-plot-board", name: "แผง dot plot", role: "วางจุดข้อมูลแต่ละค่าให้เห็นการกระจุกและการกระจาย", note: "จุดที่อยู่โดดเดี่ยวมากควรถูกตรวจสอบเป็นพิเศษ", unit: "plot", tone: "emerald", visualKey: "RulerVisual" },
    { id: "center-markers", name: "ตัวชี้ค่ากลาง", role: "ทำเครื่องหมายตำแหน่ง mean และ median บนข้อมูล", note: "ค่าเฉลี่ยไวต่อ outlier มากกว่ามัธยฐาน", unit: "mean/median", tone: "violet", visualKey: "PHMeterVisual" },
    { id: "spread-ruler", name: "ไม้บรรทัดพิสัย", role: "วัดระยะจากค่าน้อยสุดถึงค่ามากสุดของชุดข้อมูล", note: "พิสัยกว้างหมายถึงผลทดลองแกว่งมากขึ้น", unit: "range", tone: "amber", visualKey: "RulerVisual" },
  ],
  steps: [
    { num: 1, title: "รวบรวมข้อมูลซ้ำ", desc: "บันทึกค่าจากการวัดหลายรอบโดยใช้หน่วยเดียวกันทุกครั้ง", iconKey: "ClipboardList", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "จัดเรียงและวาด dot plot", desc: "เรียงข้อมูลจากน้อยไปมากแล้ววางจุดเพื่อดูรูปแบบการกระจาย", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 3, title: "หาค่ากลาง", desc: "คำนวณ mean และหา median จากข้อมูลที่เรียงแล้ว", iconKey: "Target", color: "text-violet-500", bg: "bg-violet-50" },
    { num: 4, title: "วิเคราะห์ความแปรปรวน", desc: "ดูพิสัยและ outlier เพื่อสรุปว่าข้อมูลน่าเชื่อถือหรือควรวัดซ้ำ", iconKey: "Activity", color: "text-amber-500", bg: "bg-amber-50" },
  ],
  theoryDescription: "ค่ากลางช่วยอธิบายตัวแทนของข้อมูล แต่ไม่เพียงพอถ้าไม่ดูการกระจาย ค่าเฉลี่ยรวมผลของทุกข้อมูลจึงไวต่อ outlier ส่วนมัธยฐานบอกค่ากลางหลังเรียงข้อมูล พิสัยและรูปแบบบน dot plot ช่วยบอกว่าผลทดลองสม่ำเสมอหรือผันผวนมากเพียงใด",
  equationLabels: [
    { label: "Σx", desc: "ผลรวมค่าข้อมูลทั้งหมดในชุด", color: "text-blue-500" },
    { label: "n", desc: "จำนวนข้อมูลหรือจำนวนครั้งที่วัด", color: "text-violet-500" },
    { label: "range", desc: "ค่าสูงสุดลบค่าต่ำสุด ใช้ดูความกว้างของข้อมูล", color: "text-amber-500" },
  ],
  graph: {
    title: "dot plot และค่ากลาง",
    subtitle: "Center and Spread of Repeated Measurements",
    xTitle: "รอบการวัด",
    yTitle: "ค่าที่วัดได้",
    yLabels: ["สูง", "กลาง", "ต่ำ", "เริ่ม"],
    xLabels: ["1", "2", "3", "4", "5"],
    graphType: "scatter",
    customPath: "M30,70 C62,54 88,62 112,48 C140,38 156,55 178,32",
    pathColor: "#10b981",
    points: [
      { x: 30, y: 70 },
      { x: 62, y: 54 },
      { x: 88, y: 62 },
      { x: 112, y: 48 },
      { x: 178, y: 32 },
    ],
  },
});

const curveFittingDetails = createMathConceptDetails({
  title: "Curve Fitting & Trend Lines",
  focus: "เส้นแนวโน้ม แบบจำลอง และค่าคลาดเคลื่อน",
  equation: "error = observed - predicted",
  xTitle: "ตัวแปรต้น",
  yTitle: "ผลการวัด",
  graphType: "curve",
  pathColor: "#db2777",
  overviewBullets: [
    "วางจุดข้อมูลทดลองบน scatter plot แล้วเลือกเส้นแนวโน้มที่อธิบายรูปแบบโดยรวมได้ดีที่สุด",
    "เปรียบเทียบแบบจำลองเส้นตรง เส้นโค้ง หรือแนวโน้มอิ่มตัว เพื่อดูว่าโมเดลใดเข้ากับข้อมูลมากกว่า",
    "ใช้ residual หรือค่าคลาดเคลื่อนเพื่อไม่ให้เลือกเส้นเพียงเพราะดูสวย แต่ต้องสอดคล้องกับข้อมูลจริง",
  ],
  learningObjectives: [
    "อธิบายความแตกต่างระหว่างจุดข้อมูลจริง เส้นแนวโน้ม และค่าที่โมเดลทำนายได้",
    "ประเมิน residual เพื่อดูว่าแบบจำลองมากหรือน้อยเกินจริงในช่วงใด",
    "ใช้เส้นแนวโน้มทำนายอย่างระมัดระวังและบอกข้อจำกัดเมื่อต้อง extrapolate นอกช่วงข้อมูล",
  ],
  equipments: [
    { id: "scatter-plot", name: "กราฟจุดข้อมูล", role: "แสดงข้อมูลจริงทีละจุดเพื่อเห็นรูปแบบก่อนเลือกโมเดล", note: "จุดข้อมูลจริงสำคัญกว่าเส้นที่ลากผ่านอย่างสวยงาม", unit: "points", tone: "blue", visualKey: "RulerVisual" },
    { id: "trend-line-tool", name: "เครื่องมือเส้นแนวโน้ม", role: "ลองวางเส้นตรงหรือเส้นโค้งเพื่ออธิบายแนวโน้มรวม", note: "อย่าบังคับข้อมูลโค้งให้เป็นเส้นตรงถ้า residual มีรูปแบบชัดเจน", unit: "model", tone: "violet", visualKey: "RulerVisual" },
    { id: "residual-meter", name: "ตัววัด residual", role: "แสดงส่วนต่างระหว่างค่าจริงกับค่าที่โมเดลทำนาย", note: "residual ควรกระจายรอบศูนย์ ไม่เอนด้านเดียวตลอด", unit: "error", tone: "rose", visualKey: "VoltmeterVisual" },
    { id: "prediction-card", name: "การ์ดทำนายค่า", role: "ใช้โมเดลอ่านค่าที่คาดการณ์สำหรับ input ใหม่", note: "ทำนายในช่วงข้อมูลปลอดภัยกว่าทำนายนอกช่วงข้อมูล", unit: "predict", tone: "amber", visualKey: "ClipboardListVisual" },
  ],
  steps: [
    { num: 1, title: "วางจุดข้อมูลจริง", desc: "บันทึกตัวแปรต้นและผลการวัดลงบน scatter plot โดยไม่ลากเส้นก่อน", iconKey: "ClipboardList", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 2, title: "เลือกแบบจำลอง", desc: "ลองเส้นตรงหรือเส้นโค้ง แล้วดูว่าเส้นสะท้อนแนวโน้มโดยรวมเพียงใด", iconKey: "LineChart", color: "text-violet-500", bg: "bg-violet-50" },
    { num: 3, title: "ตรวจ residual", desc: "คำนวณ observed - predicted เพื่อดูจุดที่โมเดลคลาดเคลื่อนมาก", iconKey: "Activity", color: "text-rose-500", bg: "bg-rose-50" },
    { num: 4, title: "ใช้ทำนายและบอกข้อจำกัด", desc: "อ่านค่าจากเส้นแนวโน้ม พร้อมระบุว่าการทำนายอยู่ในช่วงข้อมูลหรือเกินช่วงข้อมูล", iconKey: "BookOpen", color: "text-amber-500", bg: "bg-amber-50" },
  ],
  theoryDescription: "การ fit เส้นแนวโน้มคือการเลือกแบบจำลองคณิตศาสตร์ที่อธิบายข้อมูลจริงได้เหมาะสม ไม่จำเป็นต้องผ่านทุกจุด แต่ควรทำให้ residual ไม่มีรูปแบบผิดปกติ ถ้า residual เป็นบวกหรือลบต่อเนื่อง แสดงว่าโมเดลอาจไม่เหมาะกับความสัมพันธ์ของตัวแปร",
  equationLabels: [
    { label: "observed", desc: "ค่าจริงที่วัดได้จากข้อมูลทดลอง", color: "text-blue-500" },
    { label: "predicted", desc: "ค่าที่แบบจำลองหรือเส้นแนวโน้มคาดการณ์", color: "text-violet-500" },
    { label: "error", desc: "ส่วนต่างที่ใช้ตรวจคุณภาพของโมเดล", color: "text-rose-500" },
  ],
  graph: {
    title: "จุดข้อมูลและเส้นแนวโน้ม",
    subtitle: "Scatter, Fit, and Residual Thinking",
    xTitle: "input",
    yTitle: "observed",
    yLabels: ["สูง", "กลาง", "ต่ำ", "เริ่ม"],
    xLabels: ["0", "1", "2", "3", "4"],
    graphType: "curve",
    customPath: "M24,92 C56,76 72,46 104,42 C132,39 150,24 182,22",
    pathColor: "#db2777",
    points: [
      { x: 24, y: 92 },
      { x: 56, y: 74 },
      { x: 85, y: 52 },
      { x: 120, y: 47 },
      { x: 160, y: 28 },
    ],
  },
});

const functionBuilderDetails = createMathConceptDetails({
  title: "Function Builder",
  focus: "ความสัมพันธ์ input-output และกฎของฟังก์ชัน",
  equation: "f(x) = output",
  xTitle: "input",
  yTitle: "output",
  pathColor: "#9333ea",
  overviewBullets: [
    "สร้างฟังก์ชันจากการ์ดกฎ เช่น บวก คูณ ยกกำลัง หรือประกอบหลายกฎ แล้วสังเกต output ที่เปลี่ยนตาม input",
    "เปรียบเทียบฟังก์ชันผ่านสามมุมมอง: เครื่องฟังก์ชัน ตารางค่า และกราฟ",
    "ฝึกย้อนคิดจาก output เพื่อเดากฎของฟังก์ชัน และเชื่อมกับแบบจำลองข้อมูลในวิทยาศาสตร์",
  ],
  learningObjectives: [
    "อธิบายได้ว่า input, rule และ output ทำงานร่วมกันอย่างไรในฟังก์ชันหนึ่งตัว",
    "สร้างตารางค่าและกราฟจากกฎฟังก์ชันที่กำหนดให้ได้",
    "วิเคราะห์ผลของการประกอบฟังก์ชัน เช่น ทำกฎแรกแล้วส่งผลต่อกฎถัดไปได้",
  ],
  equipments: [
    { id: "input-machine", name: "เครื่องฟังก์ชัน", role: "รับค่า input แล้วส่งผ่านกฎเพื่อสร้าง output", note: "input เดียวกันในฟังก์ชันเดียวกันควรให้ output เดิมเสมอ", unit: "f(x)", tone: "violet", visualKey: "PowerSupplyVisual" },
    { id: "rule-cards", name: "การ์ดกฎ", role: "แทนการดำเนินการ เช่น +3, ×2, x² หรือหารด้วยจำนวนคงที่", note: "ลำดับของกฎสำคัญมากเมื่อประกอบฟังก์ชัน", unit: "rule", tone: "amber", visualKey: "ClipboardListVisual" },
    { id: "function-table", name: "ตาราง input-output", role: "บันทึกค่า x และ f(x) เพื่อหารูปแบบของฟังก์ชัน", note: "ลอง input หลายค่าเพื่อดูรูปแบบให้ชัด ไม่พึ่งค่าเดียว", unit: "table", tone: "blue", visualKey: "RulerVisual" },
    { id: "output-checker", name: "ตัวตรวจ output", role: "ตรวจว่าค่าที่ได้สอดคล้องกับกฎที่เลือกหรือไม่", note: "ถ้า output ไม่ตรง ให้ตรวจลำดับการใช้กฎก่อน", unit: "output", tone: "emerald", visualKey: "PHMeterVisual" },
  ],
  steps: [
    { num: 1, title: "เลือกกฎฟังก์ชัน", desc: "เริ่มจากกฎเดียว เช่น f(x)=2x+1 หรือเลือกการ์ดกฎหลายใบเพื่อประกอบกัน", iconKey: "Sliders", color: "text-violet-500", bg: "bg-violet-50" },
    { num: 2, title: "ป้อนค่า input", desc: "ทดลองค่า x หลายค่า ทั้งลบ ศูนย์ และบวก เพื่อดู output ที่เกิดขึ้น", iconKey: "Target", color: "text-blue-500", bg: "bg-blue-50" },
    { num: 3, title: "สร้างตารางและกราฟ", desc: "บันทึกคู่ค่า input-output แล้ววาดกราฟเพื่อดูรูปแบบของฟังก์ชัน", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" },
    { num: 4, title: "เดากฎจากผลลัพธ์", desc: "ซ่อนกฎบางส่วน แล้วใช้ตารางและ output เพื่ออธิบายว่ากฎน่าจะเป็นอะไร", iconKey: "BookOpen", color: "text-amber-500", bg: "bg-amber-50" },
  ],
  theoryDescription: "ฟังก์ชันคือความสัมพันธ์ที่ input แต่ละค่าให้ output เพียงค่าเดียวภายใต้กฎเดียวกัน การมองฟังก์ชันผ่านเครื่องฟังก์ชัน ตาราง และกราฟช่วยให้เห็นรูปแบบของกฎได้ชัดขึ้น เมื่อประกอบฟังก์ชัน ลำดับการใช้กฎมีผลต่อ output จึงต้องอ่านจากด้านในออกด้านนอกหรือทำตามลำดับเครื่องมือ",
  equationLabels: [
    { label: "x", desc: "ค่า input ที่ใส่เข้าสู่ฟังก์ชัน", color: "text-blue-500" },
    { label: "f", desc: "กฎหรือกระบวนการที่แปลง input", color: "text-violet-500" },
    { label: "output", desc: "ผลลัพธ์หลังผ่านกฎของฟังก์ชัน", color: "text-emerald-500" },
  ],
  graph: {
    title: "ตารางและกราฟของฟังก์ชัน",
    subtitle: "Input-Rule-Output Mapping",
    xTitle: "input",
    yTitle: "output",
    yLabels: ["12", "8", "4", "0"],
    xLabels: ["-2", "0", "2", "4"],
    graphType: "line",
    customPath: "M28,92 L78,70 L128,48 L178,26",
    pathColor: "#9333ea",
  },
});

const draftMathLabDetails: Record<string, LabDetailData> = {
  "probability-simulation": createMathConceptDetails({
    title: "Probability & Random Trials",
    focus: "ความน่าจะเป็น การทดลองสุ่ม และความถี่สัมพัทธ์",
    equation: "P(E) = favorable outcomes / total outcomes",
    xTitle: "จำนวนครั้งทดลอง",
    yTitle: "ความถี่สัมพัทธ์",
    graphType: "scatter",
    pathColor: "#8b5cf6",
    theoryDescription: "ความน่าจะเป็นช่วยคาดการณ์โอกาสเกิดเหตุการณ์ก่อนทดลอง ส่วนความถี่สัมพัทธ์คือผลที่เห็นจากการทดลองซ้ำจริง เมื่อจำนวนครั้งทดลองมากขึ้น ความถี่สัมพัทธ์มักเข้าใกล้ค่าทฤษฎี แต่ยังมีความผันผวนจากการสุ่มอยู่เสมอ",
    equationLabels: [
      { label: "P(E)", desc: "โอกาสเกิดเหตุการณ์ E", color: "text-violet-500" },
      { label: "favorable", desc: "จำนวนผลลัพธ์ที่ตรงกับเหตุการณ์ที่สนใจ", color: "text-blue-500" },
      { label: "total", desc: "จำนวนผลลัพธ์ทั้งหมดใน sample space", color: "text-emerald-500" },
    ],
  }),
  "trigonometry-waves": createMathConceptDetails({
    title: "Trigonometry & Waves",
    focus: "ฟังก์ชันไซน์ โคไซน์ แอมพลิจูด คาบ และเฟส",
    equation: "y = A sin(Bx + C)",
    xTitle: "เวลา / มุม",
    yTitle: "การกระจัด",
    graphType: "curve",
    pathColor: "#0ea5e9",
    theoryDescription: "คลื่นและการสั่นหลายชนิดอธิบายได้ด้วยฟังก์ชันตรีโกณมิติ แอมพลิจูดบอกความสูงของคลื่น คาบบอกเวลาที่รูปแบบซ้ำ และเฟสบอกการเลื่อนตำแหน่งของคลื่น แนวคิดนี้ใช้กับเสียง แสง สปริง และวงจรไฟฟ้ากระแสสลับได้",
    equationLabels: [
      { label: "A", desc: "แอมพลิจูดหรือขนาดสูงสุดของคลื่น", color: "text-sky-500" },
      { label: "B", desc: "ตัวกำหนดความถี่หรือคาบของคลื่น", color: "text-violet-500" },
      { label: "C", desc: "เฟสหรือการเลื่อนแนวนอนของกราฟ", color: "text-amber-500" },
    ],
  }),
  "systems-of-equations": createMathConceptDetails({
    title: "Systems of Equations",
    focus: "ระบบสมการ จุดตัดกราฟ และคำตอบร่วม",
    equation: "y1 = y2",
    xTitle: "ตัวแปร x",
    yTitle: "ค่าของสมการ",
    graphType: "line",
    pathColor: "#2563eb",
    theoryDescription: "ระบบสมการคือการหาเงื่อนไขที่สมการหลายเส้นเป็นจริงพร้อมกัน บนกราฟสองมิติ คำตอบมักเป็นจุดตัดของเส้นหรือโค้ง จุดนั้นแทนสถานการณ์ที่ตัวแปรสองแบบให้ผลเท่ากัน เช่น จุดคุ้มทุน จุดสมดุล หรือจุดที่ข้อมูลสองชุดพบกัน",
    equationLabels: [
      { label: "y1", desc: "สมการหรือแบบจำลองชุดแรก", color: "text-blue-500" },
      { label: "y2", desc: "สมการหรือแบบจำลองชุดที่สอง", color: "text-rose-500" },
      { label: "solution", desc: "ค่าที่ทำให้ทั้งสองสมการจริงพร้อมกัน", color: "text-emerald-500" },
    ],
  }),
  "geometry-measurement": createMathConceptDetails({
    title: "Geometry Measurement Lab",
    focus: "การวัดรูปทรง พื้นที่ ปริมาตร มุม และความคลาดเคลื่อน",
    equation: "measurement = value ± error",
    xTitle: "รอบการวัด",
    yTitle: "ค่าที่วัดได้",
    graphType: "scatter",
    pathColor: "#10b981",
    theoryDescription: "การวัดทางเรขาคณิตต้องสนใจหน่วย เครื่องมือ และความละเอียดของการอ่านค่า พื้นที่ ปริมาตร และมุมที่คำนวณได้จะน่าเชื่อถือเมื่อผู้เรียนรู้ว่าค่าคลาดเคลื่อนจากการวัดส่งผลต่อคำตอบสุดท้ายอย่างไร",
    equationLabels: [
      { label: "value", desc: "ค่าที่อ่านหรือคำนวณได้จากรูปทรง", color: "text-emerald-500" },
      { label: "error", desc: "ช่วงคลาดเคลื่อนจากเครื่องมือหรือการอ่านค่า", color: "text-amber-500" },
      { label: "unit", desc: "หน่วยที่ต้องคงไว้ทุกขั้นตอน", color: "text-blue-500" },
    ],
  }),
  "exponential-growth-decay": createMathConceptDetails({
    title: "Exponential Growth & Decay",
    focus: "การเพิ่มและลดแบบทวีคูณ ครึ่งชีวิต และค่าคงตัวอัตรา",
    equation: "N(t) = N0 e^(kt)",
    xTitle: "เวลา",
    yTitle: "ปริมาณ",
    graphType: "curve",
    pathColor: "#f97316",
    theoryDescription: "แบบจำลองเอ็กซ์โปเนนเชียลใช้กับปริมาณที่เปลี่ยนตามสัดส่วนของค่าปัจจุบัน เช่น การเย็นตัว การเพิ่มประชากร การสลายตัว และการลดความเข้มของสัญญาณ เครื่องหมายของ k บอกว่าเป็นการเติบโตหรือการลดลง",
    equationLabels: [
      { label: "N0", desc: "ปริมาณเริ่มต้น", color: "text-orange-500" },
      { label: "k", desc: "ค่าคงตัวอัตราการเพิ่มหรือลด", color: "text-violet-500" },
      { label: "t", desc: "เวลาในการเปลี่ยนแปลง", color: "text-blue-500" },
    ],
  }),
  "data-sampling-error": createMathConceptDetails({
    title: "Sampling & Measurement Error",
    focus: "การสุ่มตัวอย่าง ขนาดตัวอย่าง และความคลาดเคลื่อนของข้อมูล",
    equation: "error = measured - true",
    xTitle: "ขนาดตัวอย่าง",
    yTitle: "ค่าคลาดเคลื่อน",
    graphType: "scatter",
    pathColor: "#e11d48",
    theoryDescription: "ข้อมูลทดลองมักมีความคลาดเคลื่อนจากเครื่องมือ วิธีวัด และการสุ่มตัวอย่าง การเพิ่มจำนวนตัวอย่างช่วยลดความผันผวนของค่าเฉลี่ย แต่ไม่ได้ลบ bias จากวิธีวัดที่ผิด ผู้เรียนจึงต้องแยก random error และ systematic error ให้ได้",
    equationLabels: [
      { label: "measured", desc: "ค่าที่วัดได้จริงจากการทดลอง", color: "text-blue-500" },
      { label: "true", desc: "ค่าจริงหรือค่ามาตรฐานที่ใช้อ้างอิง", color: "text-emerald-500" },
      { label: "error", desc: "ส่วนต่างที่ต้องนำไปตีความความน่าเชื่อถือ", color: "text-rose-500" },
    ],
  }),
  "quadratic-projectiles": createMathConceptDetails({
    title: "Quadratic Functions & Projectiles",
    focus: "พาราโบลา จุดยอด ราก และการเคลื่อนที่แบบโพรเจกไทล์",
    equation: "y = ax^2 + bx + c",
    xTitle: "ตำแหน่งแนวนอน",
    yTitle: "ความสูง",
    graphType: "curve",
    pathColor: "#7c3aed",
    theoryDescription: "ฟังก์ชันกำลังสองสร้างกราฟพาราโบลาที่มีจุดสูงสุดหรือต่ำสุด จุดยอดช่วยบอกค่าสูงสุดของเส้นทาง ส่วนรากของสมการช่วยอ่านตำแหน่งที่กราฟตัดแกน แนวคิดนี้โยงกับการเคลื่อนที่ วัตถุถูกโยน และข้อมูลที่มีแนวโน้มโค้ง",
    equationLabels: [
      { label: "a", desc: "กำหนดทิศเปิดและความกว้างของพาราโบลา", color: "text-violet-500" },
      { label: "vertex", desc: "จุดสูงสุดหรือต่ำสุดของกราฟ", color: "text-amber-500" },
      { label: "roots", desc: "ตำแหน่งที่กราฟตัดแกน x", color: "text-blue-500" },
    ],
  }),
  "logarithm-scales": createMathConceptDetails({
    title: "Logarithms & Scientific Scales",
    focus: "ลอการิทึมและสเกลที่เปลี่ยนหลายลำดับขั้น",
    equation: "log_b(x) = y",
    xTitle: "ปริมาณจริง",
    yTitle: "ค่าสเกล log",
    graphType: "curve",
    pathColor: "#db2777",
    theoryDescription: "ลอการิทึมช่วยย่อข้อมูลที่กว้างหลายลำดับขั้นให้เปรียบเทียบง่ายขึ้น สเกล pH เดซิเบล และความสว่างใช้แนวคิด log เพื่อเปลี่ยนการคูณหรือหารจำนวนมากให้เป็นการเพิ่มลดบนสเกลที่อ่านง่าย",
    equationLabels: [
      { label: "b", desc: "ฐานของลอการิทึม", color: "text-violet-500" },
      { label: "x", desc: "ปริมาณจริงที่ต้องเป็นบวก", color: "text-blue-500" },
      { label: "y", desc: "เลขชี้กำลังที่ทำให้ b^y = x", color: "text-rose-500" },
    ],
  }),
  "unit-conversion": createMathConceptDetails({
    title: "Unit Conversion & Dimensional Analysis",
    focus: "การแปลงหน่วย การตรวจมิติ และ factor-label method",
    equation: "value × conversion factor",
    xTitle: "หน่วยเดิม",
    yTitle: "หน่วยใหม่",
    pathColor: "#0891b2",
    theoryDescription: "การแปลงหน่วยที่ดีไม่ใช่การจำสูตร แต่คือการคูณด้วยอัตราส่วนที่มีค่าเท่ากับ 1 เพื่อให้หน่วยที่ไม่ต้องการตัดกันออก การตรวจมิติช่วยจับข้อผิดพลาดก่อนแทนค่าในสมการวิทยาศาสตร์",
    equationLabels: [
      { label: "value", desc: "ตัวเลขตั้งต้นพร้อมหน่วยเดิม", color: "text-blue-500" },
      { label: "factor", desc: "อัตราส่วนแปลงหน่วยที่มีค่าเท่ากับ 1", color: "text-cyan-500" },
      { label: "dimension", desc: "ชนิดของปริมาณ เช่น ความยาว เวลา มวล หรือพลังงาน", color: "text-emerald-500" },
    ],
  }),
  "matrix-transformations": createMathConceptDetails({
    title: "Matrix Transformations",
    focus: "เมทริกซ์ การแปลงพิกัด การหมุน และการยืด",
    equation: "x' = Ax",
    xTitle: "พิกัดเดิม",
    yTitle: "พิกัดใหม่",
    graphType: "custom",
    pathColor: "#4f46e5",
    theoryDescription: "เมทริกซ์สามารถแทนการแปลงรูปบนระนาบ เช่น หมุน ยืด บีบ หรือสะท้อน เมื่อคูณเมทริกซ์กับเวกเตอร์พิกัด จะได้ตำแหน่งใหม่ของจุด แนวคิดนี้ใช้ในกราฟิก เวกเตอร์ และแบบจำลองที่ต้องแปลงแกนอ้างอิง",
    equationLabels: [
      { label: "A", desc: "เมทริกซ์ที่แทนกฎการแปลง", color: "text-indigo-500" },
      { label: "x", desc: "เวกเตอร์พิกัดเดิม", color: "text-blue-500" },
      { label: "x'", desc: "เวกเตอร์พิกัดหลังแปลง", color: "text-emerald-500" },
    ],
  }),
  "sequences-series": createMathConceptDetails({
    title: "Sequences & Series Lab",
    focus: "ลำดับเลขคณิต ลำดับเรขาคณิต และผลรวมอนุกรม",
    equation: "a_n = a_1 + (n - 1)d",
    xTitle: "ลำดับที่ n",
    yTitle: "ค่าพจน์",
    pathColor: "#16a34a",
    theoryDescription: "ลำดับช่วยอธิบายรูปแบบที่เปลี่ยนทีละขั้น ลำดับเลขคณิตเพิ่มด้วยผลต่างคงที่ ส่วนลำดับเรขาคณิตคูณด้วยอัตราส่วนคงที่ อนุกรมคือผลรวมของพจน์ที่ใช้ดูปริมาณสะสม เช่น ระยะทาง พลังงาน หรือจำนวนตัวอย่าง",
    equationLabels: [
      { label: "a_n", desc: "ค่าพจน์ลำดับที่ n", color: "text-emerald-500" },
      { label: "d", desc: "ผลต่างร่วมของลำดับเลขคณิต", color: "text-blue-500" },
      { label: "r", desc: "อัตราส่วนร่วมของลำดับเรขาคณิต", color: "text-violet-500" },
    ],
  }),
  "inequalities-feasible-regions": createMathConceptDetails({
    title: "Inequalities & Feasible Regions",
    focus: "อสมการ พื้นที่คำตอบ และข้อจำกัดหลายเงื่อนไข",
    equation: "ax + by <= c",
    xTitle: "ตัวแปร x",
    yTitle: "ตัวแปร y",
    graphType: "custom",
    pathColor: "#f59e0b",
    theoryDescription: "อสมการบนกราฟไม่ได้ให้คำตอบเป็นจุดเดียว แต่ให้พื้นที่ที่ค่าทั้งหมดเป็นไปได้ เมื่อมีหลายข้อจำกัด พื้นที่ทับซ้อนคือ feasible region ใช้ตัดสินใจภายใต้ข้อจำกัด เช่น เวลา วัสดุ งบประมาณ หรือช่วงค่าที่ปลอดภัย",
    equationLabels: [
      { label: "boundary", desc: "เส้นขอบที่ได้จากการเปลี่ยนอสมการเป็นสมการ", color: "text-amber-500" },
      { label: "<= / >=", desc: "เครื่องหมายที่กำหนดด้านของพื้นที่คำตอบ", color: "text-blue-500" },
      { label: "region", desc: "พื้นที่ที่ทุกเงื่อนไขเป็นจริงพร้อมกัน", color: "text-emerald-500" },
    ],
  }),
  "transformations-symmetry": createMathConceptDetails({
    title: "Transformations & Symmetry",
    focus: "การเลื่อน หมุน สะท้อน ขยาย และสมมาตรของรูป",
    equation: "shape -> transformed shape",
    xTitle: "ตำแหน่งเดิม",
    yTitle: "ตำแหน่งใหม่",
    graphType: "custom",
    pathColor: "#a855f7",
    theoryDescription: "การแปลงเรขาคณิตช่วยดูว่ารูปเปลี่ยนตำแหน่ง ขนาด หรือทิศทางอย่างไรโดยยังรักษาคุณสมบัติบางอย่างไว้ สมมาตรช่วยอธิบายรูปแบบซ้ำในธรรมชาติ โมเลกุล ลวดลาย และข้อมูลภาพ",
    equationLabels: [
      { label: "translate", desc: "เลื่อนรูปโดยไม่เปลี่ยนขนาดหรือทิศ", color: "text-blue-500" },
      { label: "rotate", desc: "หมุนรูปตามมุมรอบจุดศูนย์กลาง", color: "text-violet-500" },
      { label: "reflect", desc: "สะท้อนรูปข้ามเส้นสมมาตร", color: "text-emerald-500" },
    ],
  }),
  "angles-circles": createMathConceptDetails({
    title: "Angles & Circles Lab",
    focus: "มุม รัศมี เส้นรอบวง ส่วนโค้ง และการหมุน",
    equation: "C = 2πr",
    xTitle: "รัศมี / มุม",
    yTitle: "ความยาวส่วนโค้ง",
    graphType: "curve",
    pathColor: "#0f766e",
    theoryDescription: "วงกลมเชื่อมรัศมี เส้นผ่านศูนย์กลาง เส้นรอบวง พื้นที่ และมุมไว้ด้วยกัน การอ่านองศาหรือเรเดียนช่วยอธิบายการหมุน ทิศทาง คลื่น และการเคลื่อนที่เป็นวงกลมในแล็บฟิสิกส์",
    equationLabels: [
      { label: "r", desc: "รัศมีของวงกลม", color: "text-teal-500" },
      { label: "θ", desc: "มุมที่วัดเป็นองศาหรือเรเดียน", color: "text-violet-500" },
      { label: "arc", desc: "ความยาวส่วนโค้งที่สัมพันธ์กับมุม", color: "text-blue-500" },
    ],
  }),
  "combinatorics-counting": createMathConceptDetails({
    title: "Combinatorics & Counting",
    focus: "การนับ permutation, combination และ sample space",
    equation: "nCr = n! / (r!(n-r)!)",
    xTitle: "จำนวนตัวเลือก",
    yTitle: "จำนวนวิธี",
    graphType: "line",
    pathColor: "#c026d3",
    theoryDescription: "คอมบินาทอริกส์ช่วยนับจำนวนผลลัพธ์โดยไม่ต้องไล่รายการทีละแบบ permutation สนใจลำดับ ส่วน combination ไม่สนใจลำดับ แนวคิดนี้ใช้สร้าง sample space สำหรับความน่าจะเป็นและออกแบบชุดทดลองที่มีตัวเลือกหลายตัว",
    equationLabels: [
      { label: "n", desc: "จำนวนสิ่งทั้งหมดที่เลือกได้", color: "text-fuchsia-500" },
      { label: "r", desc: "จำนวนสิ่งที่เลือกในแต่ละครั้ง", color: "text-blue-500" },
      { label: "nCr", desc: "จำนวนวิธีเลือกโดยไม่สนใจลำดับ", color: "text-emerald-500" },
    ],
  }),
  "normal-distribution": createMathConceptDetails({
    title: "Normal Distribution Lab",
    focus: "โค้งปกติ ค่าเฉลี่ย ส่วนเบี่ยงเบนมาตรฐาน และ z-score",
    equation: "z = (x - μ) / σ",
    xTitle: "ค่าข้อมูล",
    yTitle: "ความถี่",
    graphType: "curve",
    pathColor: "#2563eb",
    theoryDescription: "การวัดจำนวนมากมักกระจุกใกล้ค่าเฉลี่ยและลดลงเมื่อห่างออกไป โค้งปกติช่วยประเมินว่าค่าหนึ่งอยู่ไกลจากค่าเฉลี่ยกี่ส่วนเบี่ยงเบนมาตรฐาน z-score จึงช่วยเปรียบเทียบข้อมูลต่างหน่วยหรือคนละชุดได้",
    equationLabels: [
      { label: "x", desc: "ค่าข้อมูลที่ต้องการแปลง", color: "text-blue-500" },
      { label: "μ", desc: "ค่าเฉลี่ยของข้อมูล", color: "text-violet-500" },
      { label: "σ", desc: "ส่วนเบี่ยงเบนมาตรฐาน", color: "text-emerald-500" },
    ],
  }),
  "rates-of-change": createMathConceptDetails({
    title: "Rates of Change Lab",
    focus: "อัตราการเปลี่ยนแปลงเฉลี่ย ความชันสัมผัส และแนวคิดอนุพันธ์",
    equation: "rate = Δy / Δx",
    xTitle: "ตัวแปรต้น",
    yTitle: "ตัวแปรตาม",
    graphType: "curve",
    pathColor: "#ea580c",
    theoryDescription: "อัตราการเปลี่ยนแปลงเฉลี่ยบอกความชันระหว่างสองจุด ส่วนอัตราเฉพาะจุดดูแนวโน้ม ณ จุดหนึ่งบนกราฟ แนวคิดนี้ช่วยอ่านความเร็ว อัตราการเกิดปฏิกิริยา การเย็นตัว และการเพิ่มลดของข้อมูลตามเวลา",
    equationLabels: [
      { label: "Δy", desc: "การเปลี่ยนแปลงของผลลัพธ์", color: "text-orange-500" },
      { label: "Δx", desc: "การเปลี่ยนแปลงของ input หรือเวลา", color: "text-blue-500" },
      { label: "slope", desc: "ความชันที่แทนอัตราการเปลี่ยนแปลง", color: "text-violet-500" },
    ],
  }),
  "optimization-constraints": createMathConceptDetails({
    title: "Optimization & Constraints",
    focus: "ค่าสูงสุด ต่ำสุด เป้าหมาย และข้อจำกัด",
    equation: "maximize f(x) subject to constraints",
    xTitle: "ตัวเลือก",
    yTitle: "ค่าคะแนนเป้าหมาย",
    graphType: "custom",
    pathColor: "#dc2626",
    theoryDescription: "การ optimization คือการเลือกค่าที่ดีที่สุดภายใต้ข้อจำกัด เช่น ใช้วัสดุน้อยแต่ได้ปริมาตรมาก หรือเลือกช่วงทดลองที่ให้ผลชัดโดยไม่เกินขีดจำกัดความปลอดภัย ผู้เรียนต้องแยก objective function และ constraints ให้ชัดก่อนคำนวณ",
    equationLabels: [
      { label: "f(x)", desc: "ฟังก์ชันเป้าหมายที่ต้องการมากสุดหรือน้อยสุด", color: "text-rose-500" },
      { label: "constraint", desc: "เงื่อนไขที่จำกัดคำตอบที่เลือกได้", color: "text-amber-500" },
      { label: "optimum", desc: "คำตอบที่ดีที่สุดภายใต้ข้อจำกัดทั้งหมด", color: "text-emerald-500" },
    ],
  }),
  "advanced-calculus-optimization": createMathConceptDetails({
    title: "Advanced Calculus & Optimization",
    focus: "ลิมิต อนุพันธ์ อินทิกรัล และการหาค่าเหมาะที่สุด",
    equation: "f'(x) = 0",
    xTitle: "ตัวแปรตัดสินใจ",
    yTitle: "ค่าฟังก์ชัน",
    graphType: "curve",
    pathColor: "#7c3aed",
    theoryDescription: "แคลคูลัสขั้นสูงช่วยอธิบายการเปลี่ยนแปลงและพื้นที่สะสมของฟังก์ชัน การหา optimization มักเริ่มจากจุดที่อนุพันธ์เป็นศูนย์ แล้วตรวจเงื่อนไขขอบเขตและข้อจำกัดเพื่อเลือกคำตอบที่ดีที่สุดในบริบทจริง",
    equationLabels: [
      { label: "f'(x)", desc: "อัตราการเปลี่ยนแปลงเฉพาะจุดของฟังก์ชัน", color: "text-violet-500" },
      { label: "critical point", desc: "จุดที่อาจเป็นค่าสูงสุด ต่ำสุด หรือจุดเปลี่ยน", color: "text-amber-500" },
      { label: "constraint", desc: "เงื่อนไขที่จำกัดช่วงคำตอบที่เลือกได้", color: "text-emerald-500" },
    ],
  }),
  "linear-algebra-eigenvectors": createMathConceptDetails({
    title: "Linear Algebra & Eigenvectors",
    focus: "เวกเตอร์ เมทริกซ์ การแปลงเชิงเส้น และ eigenvectors",
    equation: "Av = λv",
    xTitle: "ทิศทางเวกเตอร์",
    yTitle: "สเกลหลังแปลง",
    graphType: "custom",
    pathColor: "#4f46e5",
    theoryDescription: "พีชคณิตเชิงเส้นมองข้อมูลและระบบเป็นเวกเตอร์กับเมทริกซ์ eigenvector คือทิศทางพิเศษที่เมื่อผ่านการแปลงแล้วไม่เปลี่ยนทิศ เพียงถูกยืดหรือหดด้วยค่า eigenvalue แนวคิดนี้ใช้ในฟิสิกส์ ข้อมูล และการลดมิติ",
    equationLabels: [
      { label: "A", desc: "เมทริกซ์ที่แทนการแปลงเชิงเส้น", color: "text-indigo-500" },
      { label: "v", desc: "eigenvector หรือทิศทางที่คงเดิมหลังแปลง", color: "text-blue-500" },
      { label: "λ", desc: "eigenvalue ที่บอกอัตราการยืดหรือหด", color: "text-emerald-500" },
    ],
  }),
  "differential-equations-lab": createMathConceptDetails({
    title: "Differential Equations Lab",
    focus: "สมการเชิงอนุพันธ์ อัตราการเปลี่ยนแปลง และระบบพลวัต",
    equation: "dy/dt = f(t, y)",
    xTitle: "เวลา",
    yTitle: "สถานะของระบบ",
    graphType: "curve",
    pathColor: "#0891b2",
    theoryDescription: "สมการเชิงอนุพันธ์อธิบายว่าค่าหนึ่งเปลี่ยนไปตามอัตราที่ขึ้นกับเวลาและสถานะปัจจุบันอย่างไร ใช้กับการเติบโต การเย็นตัว การสั่น ปฏิกิริยาเคมี และระบบที่ต้องติดตามการเปลี่ยนแปลงต่อเนื่อง",
    equationLabels: [
      { label: "dy/dt", desc: "อัตราการเปลี่ยนแปลงของสถานะ", color: "text-cyan-500" },
      { label: "y", desc: "ค่าหรือสถานะของระบบที่กำลังศึกษา", color: "text-blue-500" },
      { label: "f(t, y)", desc: "กฎที่กำหนดการเปลี่ยนแปลงตามเวลาและสถานะ", color: "text-emerald-500" },
    ],
  }),
  "numerical-methods-lab": createMathConceptDetails({
    title: "Numerical Methods Lab",
    focus: "วิธีคำนวณเชิงตัวเลข การประมาณค่า และค่าคลาดเคลื่อน",
    equation: "x_(n+1) = x_n - f(x_n)/f'(x_n)",
    xTitle: "รอบคำนวณ",
    yTitle: "ค่าประมาณ",
    graphType: "line",
    pathColor: "#ea580c",
    theoryDescription: "วิธีเชิงตัวเลขใช้การประมาณซ้ำเพื่อแก้ปัญหาที่หาคำตอบปิดรูปได้ยาก เช่น หารากสมการ อินทิกรัล หรือคำตอบของสมการเชิงอนุพันธ์ จุดสำคัญคือการติดตาม error และรู้ว่าเงื่อนไขใดทำให้วิธีลู่เข้าหรือหลุดออก",
    equationLabels: [
      { label: "x_n", desc: "ค่าประมาณในรอบปัจจุบัน", color: "text-orange-500" },
      { label: "f(x_n)", desc: "ค่าความคลาดจากสมการที่ต้องการแก้", color: "text-blue-500" },
      { label: "error", desc: "ส่วนต่างที่ใช้ตัดสินว่าคำตอบพอแม่นยำหรือยัง", color: "text-rose-500" },
    ],
  }),
  "multivariable-calculus": createMathConceptDetails({
    title: "Multivariable Calculus",
    focus: "ฟังก์ชันหลายตัวแปร partial derivatives และ contour maps",
    equation: "∇f = <∂f/∂x, ∂f/∂y>",
    xTitle: "ตัวแปร x",
    yTitle: "ตัวแปร y / ระดับค่า",
    graphType: "custom",
    pathColor: "#16a34a",
    theoryDescription: "แคลคูลัสหลายตัวแปรใช้วิเคราะห์ระบบที่ผลลัพธ์ขึ้นกับหลายปัจจัยพร้อมกัน partial derivative บอกผลของการเปลี่ยนตัวแปรหนึ่งเมื่อคุมตัวอื่นไว้ ส่วน gradient ชี้ทิศทางที่ฟังก์ชันเพิ่มเร็วที่สุดบนพื้นผิวหรือแผนที่ contour",
    equationLabels: [
      { label: "∂f/∂x", desc: "อัตราการเปลี่ยนของ f เมื่อเปลี่ยน x", color: "text-emerald-500" },
      { label: "∂f/∂y", desc: "อัตราการเปลี่ยนของ f เมื่อเปลี่ยน y", color: "text-blue-500" },
      { label: "∇f", desc: "เวกเตอร์ gradient ที่บอกทิศเพิ่มเร็วที่สุด", color: "text-violet-500" },
    ],
  }),
  "statistical-inference": createMathConceptDetails({
    title: "Statistical Inference",
    focus: "การประมาณค่า ช่วงความเชื่อมั่น และการทดสอบสมมติฐาน",
    equation: "estimate ± margin of error",
    xTitle: "ค่าสถิติจากตัวอย่าง",
    yTitle: "ความไม่แน่นอน",
    graphType: "scatter",
    pathColor: "#2563eb",
    theoryDescription: "สถิติอนุมานใช้ข้อมูลตัวอย่างเพื่อสรุปสิ่งที่น่าจะเป็นจริงในประชากรทั้งหมด ช่วงความเชื่อมั่นแสดงความไม่แน่นอนของค่าประมาณ ส่วนการทดสอบสมมติฐานช่วยตัดสินว่าหลักฐานเพียงพอจะปฏิเสธข้อสมมติเริ่มต้นหรือไม่",
    equationLabels: [
      { label: "estimate", desc: "ค่าประมาณจากข้อมูลตัวอย่าง", color: "text-blue-500" },
      { label: "margin", desc: "ช่วงเผื่อความไม่แน่นอนของการสุ่ม", color: "text-amber-500" },
      { label: "p-value", desc: "ความน่าจะเป็นของหลักฐานภายใต้สมมติฐานเริ่มต้น", color: "text-rose-500" },
    ],
  }),
  "bayesian-reasoning-lab": createMathConceptDetails({
    title: "Bayesian Reasoning Lab",
    focus: "Bayes' theorem, prior, likelihood และ posterior",
    equation: "P(H|E) = P(E|H)P(H) / P(E)",
    xTitle: "หลักฐานใหม่",
    yTitle: "ความเชื่อหลังอัปเดต",
    graphType: "line",
    pathColor: "#db2777",
    theoryDescription: "การคิดแบบเบย์คือการอัปเดตความเชื่อเมื่อมีหลักฐานใหม่ prior คือความเชื่อก่อนเห็นข้อมูล likelihood คือความเข้ากันได้ของข้อมูลกับสมมติฐาน และ posterior คือความเชื่อหลังรวมหลักฐาน เหมาะกับสถานการณ์ที่ข้อมูลไม่แน่นอน",
    equationLabels: [
      { label: "P(H)", desc: "prior หรือความเชื่อก่อนเห็นหลักฐาน", color: "text-violet-500" },
      { label: "P(E|H)", desc: "likelihood ของหลักฐานเมื่อสมมติฐานเป็นจริง", color: "text-blue-500" },
      { label: "P(H|E)", desc: "posterior หลังอัปเดตด้วยหลักฐาน", color: "text-rose-500" },
    ],
  }),
  "fourier-analysis-signals": createMathConceptDetails({
    title: "Fourier Analysis & Signals",
    focus: "การแยกสัญญาณเป็นองค์ประกอบความถี่",
    equation: "f(t) = Σ a_n sin(nωt) + b_n cos(nωt)",
    xTitle: "เวลา / ความถี่",
    yTitle: "แอมพลิจูด",
    graphType: "curve",
    pathColor: "#0ea5e9",
    theoryDescription: "Fourier analysis มองสัญญาณซับซ้อนเป็นผลรวมของคลื่นง่ายหลายความถี่ แนวคิดนี้ทำให้วิเคราะห์เสียง คลื่น ภาพ และข้อมูลเซนเซอร์ได้โดยดูว่าองค์ประกอบความถี่ใดเด่นหรือถูกกรองออก",
    equationLabels: [
      { label: "a_n, b_n", desc: "ค่าสัมประสิทธิ์ขององค์ประกอบความถี่", color: "text-sky-500" },
      { label: "nω", desc: "ความถี่ฮาร์มอนิกของสัญญาณ", color: "text-violet-500" },
      { label: "Σ", desc: "ผลรวมของคลื่นย่อยที่ประกอบเป็นสัญญาณ", color: "text-emerald-500" },
    ],
  }),
  "complex-numbers-phasors": createMathConceptDetails({
    title: "Complex Numbers & Phasors",
    focus: "จำนวนเชิงซ้อน polar form และ phasors",
    equation: "z = r(cos θ + i sin θ)",
    xTitle: "แกนจริง",
    yTitle: "แกนจินตภาพ",
    graphType: "custom",
    pathColor: "#9333ea",
    theoryDescription: "จำนวนเชิงซ้อนแทนทั้งขนาดและมุมบนระนาบเดียวกัน จึงใช้กับการหมุน คลื่น และสัญญาณสลับได้ดี phasor ช่วยย่อการสั่นหรือไฟฟ้ากระแสสลับให้เป็นเวกเตอร์หมุนที่อ่านเฟสและแอมพลิจูดได้ง่าย",
    equationLabels: [
      { label: "r", desc: "ขนาดหรือระยะจากจุดกำเนิด", color: "text-violet-500" },
      { label: "θ", desc: "มุมหรือเฟสของจำนวนเชิงซ้อน", color: "text-amber-500" },
      { label: "i", desc: "หน่วยจินตภาพที่ทำให้เกิดแกนตั้งฉาก", color: "text-blue-500" },
    ],
  }),
  "vector-fields-gradients": createMathConceptDetails({
    title: "Vector Fields & Gradients",
    focus: "สนามเวกเตอร์ gradient, divergence และ curl",
    equation: "F(x, y) = <P(x, y), Q(x, y)>",
    xTitle: "ตำแหน่ง x-y",
    yTitle: "ทิศทางและขนาดเวกเตอร์",
    graphType: "custom",
    pathColor: "#059669",
    theoryDescription: "สนามเวกเตอร์กำหนดลูกศรให้แต่ละตำแหน่งในพื้นที่ ใช้อธิบายการไหล สนามแรง และแนวโน้มการเคลื่อนที่ gradient บอกทิศชันขึ้นที่สุด divergence บอกการแผ่ออกหรือรวมเข้า และ curl บอกแนวโน้มการหมุนของสนาม",
    equationLabels: [
      { label: "F", desc: "เวกเตอร์ที่กำหนดให้แต่ละตำแหน่ง", color: "text-emerald-500" },
      { label: "div", desc: "การแผ่ออกหรือรวมเข้าของสนาม", color: "text-blue-500" },
      { label: "curl", desc: "แนวโน้มการหมุนของสนามเวกเตอร์", color: "text-violet-500" },
    ],
  }),
  "discrete-graph-theory": createMathConceptDetails({
    title: "Discrete Mathematics & Graph Theory",
    focus: "กราฟ โหนด เส้นเชื่อม เส้นทาง และเครือข่าย",
    equation: "G = (V, E)",
    xTitle: "โหนด",
    yTitle: "เส้นเชื่อม / เส้นทาง",
    graphType: "custom",
    pathColor: "#c026d3",
    theoryDescription: "คณิตศาสตร์ไม่ต่อเนื่องใช้วิเคราะห์สิ่งที่แยกเป็นหน่วยชัดเจน เช่น โหนด เส้นเชื่อม ลำดับตรรกะ และเครือข่าย graph theory ช่วยศึกษาการเชื่อมต่อ เส้นทางสั้นสุด ความหนาแน่น และโครงสร้างของระบบซับซ้อน",
    equationLabels: [
      { label: "V", desc: "เซตของโหนดหรือจุดยอด", color: "text-fuchsia-500" },
      { label: "E", desc: "เซตของเส้นเชื่อมระหว่างโหนด", color: "text-blue-500" },
      { label: "path", desc: "ลำดับของโหนดและเส้นเชื่อมที่เดินผ่านได้", color: "text-emerald-500" },
    ],
  }),
  "mathematical-modeling-lab": createMathConceptDetails({
    title: "Mathematical Modeling Lab",
    focus: "การตั้งสมมติฐาน ตัวแปร พารามิเตอร์ และการตรวจแบบจำลอง",
    equation: "model = assumptions + variables + data",
    xTitle: "พารามิเตอร์",
    yTitle: "ผลลัพธ์ของแบบจำลอง",
    graphType: "line",
    pathColor: "#dc2626",
    theoryDescription: "การสร้างแบบจำลองคณิตศาสตร์เริ่มจากปัญหาจริงแล้วเลือกตัวแปร สมมติฐาน และกฎที่จำเป็น แบบจำลองที่ดีไม่ใช่แค่คำนวณได้ แต่ต้องอธิบายข้อจำกัด ตรวจเทียบกับข้อมูล และปรับเมื่อสมมติฐานไม่ตรงกับโลกจริง",
    equationLabels: [
      { label: "assumptions", desc: "ข้อตกลงที่ทำให้ปัญหาจริงคำนวณได้", color: "text-amber-500" },
      { label: "variables", desc: "ปริมาณสำคัญที่แบบจำลองติดตาม", color: "text-blue-500" },
      { label: "data", desc: "หลักฐานที่ใช้ตรวจหรือปรับแบบจำลอง", color: "text-emerald-500" },
    ],
  }),
};

function createDraftUniversityDetails(input: {
  title: string;
  category: "Physics" | "Chemistry" | "Biology";
  focus: string;
  equation: string;
  xTitle: string;
  yTitle: string;
  theoryDescription: string;
  equationLabels: EquationLabelData[];
  overviewBullets: string[];
  learningObjectives: string[];
  equipments: EquipmentItemData[];
  steps: StepItemData[];
  graphType?: GraphConfigData["graphType"];
  pathColor?: string;
}): LabDetailData {
  return {
    overviewBullets: input.overviewBullets,
    learningObjectives: input.learningObjectives,
    equipments: input.equipments,
    steps: input.steps,
    theoryDescription: input.theoryDescription,
    equationHtml: input.equation,
    equationLabels: input.equationLabels,
    graph: {
      title: `${input.title} Preview`,
      subtitle: `${input.category} University Model`,
      xTitle: input.xTitle,
      yTitle: input.yTitle,
      yLabels: ["สูง", "ปานกลาง", "ต่ำ", "0"],
      xLabels: ["สภาวะ 1", "สภาวะ 2", "สภาวะ 3", "สภาวะ 4"],
      graphType: input.graphType ?? "line",
      customPath: "M22,92 C62,76 88,66 116,54 C144,42 164,34 184,24",
      pathColor: input.pathColor ?? "#3b82f6",
      points: [
        { x: 24, y: 92 },
        { x: 66, y: 74 },
        { x: 116, y: 54 },
        { x: 176, y: 26 },
      ],
    },
  };
}

const draftUniversityLabDetails: Record<string, LabDetailData> = {
  "quantum-tunneling": createDraftUniversityDetails({
    title: "Quantum Tunneling",
    category: "Physics",
    focus: "การทะลุผ่านด่านควอนตัม (Quantum Tunneling)",
    equation: "T &approx; e<sup>-2&gamma;L</sup>",
    xTitle: "ความกว้างของด่านศักย์ (L)",
    yTitle: "สัมประสิทธิ์การทะลุผ่าน (T)",
    pathColor: "#8b5cf6",
    theoryDescription: "การทะลุผ่านด่านควอนตัม (Quantum Tunneling) เป็นปรากฏการณ์ทางกลศาสตร์ควอนตัมที่อนุภาคสามารถทะลุผ่านสิ่งกีดขวางศักย์ที่มีพลังงานสูงกว่าพลังงานรวมของอนุภาคได้ ซึ่งตามฟิสิกส์คลาสสิกถือว่าเป็นไปไม่ได้ อธิบายด้วยฟังก์ชันคลื่นที่ไม่เป็นศูนย์ภายในด่านและเกิดการสลายตัวแบบเอกซ์โพเนนเชียล",
    equationLabels: [
      { label: "T", desc: "สัมประสิทธิ์การทะลุผ่านสิ่งกีดขวาง", color: "text-purple-500" },
      { label: "e^-2γL", desc: "อัตราการลดลงแบบเอกซ์โพเนนเชียลตามความกว้างและมวล", color: "text-rose-500" },
      { label: "L", desc: "ความกว้างของด่านสิ่งกีดขวางศักย์", color: "text-blue-500" },
    ],
    overviewBullets: [
      "ศึกษาพฤติกรรมฟังก์ชันคลื่นของอนุภาคเมื่อวิ่งเข้าชนสิ่งกีดขวางศักย์ความสูง V₀",
      "วิเคราะห์ความน่าจะเป็นในการทะลุผ่าน (Transmission Coefficient) เทียบกับพลังงานอนุภาค",
      "สังเกตการลดลงแบบเอกซ์โพเนนเชียลของความเข้มข้นฟังก์ชันคลื่นภายในด่านศักย์",
    ],
    learningObjectives: [
      "อธิบายกลไกการทะลุผ่านด่านควอนตัมและเปรียบเทียบข้อแตกต่างกับฟิสิกส์คลาสสิกได้",
      "วิเคราะห์ความสัมพันธ์ของความกว้างและพลังงานด่านศักย์ที่มีต่อโอกาสการทะลุผ่านได้",
      "คำนวณสัมประสิทธิ์การทะลุผ่านแบบง่ายโดยใช้แบบจำลองหนึ่งมิติได้",
    ],
    equipments: [
      { id: "wave-source", name: "เครื่องกำเนิดแพ็กเกจคลื่นควอนตัม", role: "ส่งแพ็กเกจคลื่นควอนตัมที่มีพลังงาน E เข้าหาด่านศักย์", note: "ปรับความถี่และพลังงานเพื่อเปรียบเทียบผล", unit: "eV", tone: "blue", visualKey: "GeneratorVisual" },
      { id: "barrier-controller", name: "ตัวควบคุมสิ่งกีดขวางศักย์", role: "ควบคุมความกว้าง L และความสูงของพลังงานด่านศักย์ V₀", note: "ใช้ศึกษาผลกระทบของการเปลี่ยนแปลงขอบเขตด่าน", unit: "nm", tone: "rose", visualKey: "SlidersVisual" },
      { id: "wave-detector", name: "ตัวตรวจวัดฟังก์ชันคลื่น", role: "จับแอมพลิจูดคลื่นภายนอกด่านเพื่อคำนวณอัตราผ่าน", note: "รอให้สัญญาณคงที่ก่อนทำสถิติ", unit: "ratio", tone: "violet", visualKey: "OscilloscopeVisual" },
    ],
    steps: [
      { num: 1, title: "ปรับระดับพลังงาน", desc: "ปรับพลังงานเริ่มต้นของอนุภาคให้อยู่ในช่วงต่ำกว่าระดับสิ่งกีดขวาง (E < V₀)", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "กำหนดขนาดสิ่งกีดขวาง", desc: "กำหนดความกว้างของสิ่งกีดขวางศักย์ (L) และความสูง (V₀)", iconKey: "Target", color: "text-rose-500", bg: "bg-rose-50" },
      { num: 3, title: "รันจำลองคลื่น", desc: "รันจำลองเพื่อสังเกตการสะท้อนและการทะลุผ่านของฟังก์ชันคลื่น", iconKey: "Play", color: "text-violet-500", bg: "bg-violet-50" },
      { num: 4, title: "พล็อตกราฟ", desc: "บันทึกและพล็อตกราฟความสัมพันธ์ระหว่างความกว้างของด่านศักย์และค่าสัมประสิทธิ์ (T)", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "michelson-interferometer": createDraftUniversityDetails({
    title: "Michelson Interferometer",
    category: "Physics",
    focus: "การแทรกสอดและเฟสของคลื่นแสง",
    equation: "d = m&lambda; / 2",
    xTitle: "ระยะเลื่อนของกระจกเงา M1 (nm)",
    yTitle: "ความเข้มแสงบนฉากรับ (Intensity)",
    pathColor: "#ef4444",
    theoryDescription: "อินเตอร์เฟอโรมิเตอร์ของไมเคิลสัน (Michelson Interferometer) ใช้หลอดเลเซอร์หรือแหล่งกำเนิดแสงที่เชื่อมโยงกันในการแยกบีมแสงออกเป็นสองเส้นทาง เดินทางไปยังกระจกเงาสองบานที่ตั้งฉากกัน แล้วสะท้อนกลับมาแทรกสอดกันบนฉากรับ การเปลี่ยนแปลงระยะทางเพียงครึ่งหนึ่งของความยาวคลื่นจะเปลี่ยนรูปแบบริ้วรอยแทรกสอดระหว่างริ้วสว่างและริ้วมืด",
    equationLabels: [
      { label: "d", desc: "ระยะทางการเลื่อนของกระจกเงา M1", color: "text-rose-500" },
      { label: "m", desc: "ลำดับของริ้วการแทรกสอด (จำนวนริ้วสว่างที่เคลื่อนผ่าน)", color: "text-amber-500" },
      { label: "λ", desc: "ความยาวคลื่นของแสงเลเซอร์ที่ใช้ในการทดลอง", color: "text-blue-500" },
    ],
    overviewBullets: [
      "ศึกษาโครงสร้างและการทำงานของระบบอินเตอร์เฟอโรมิเตอร์ในการแยกและรวมลำแสง",
      "สังเกตการเกิดริ้วการแทรกสอด (Interference Fringes) บนฉากรับแบบเรียลไทม์",
      "วัดความยาวคลื่นของแสงด้วยความแม่นยำสูงระดับนาโนเมตรจากการเลื่อนระยะกระจก",
    ],
    learningObjectives: [
      "อธิบายความสัมพันธ์ของการเปลี่ยนเฟสคลื่นแสงกับการแทรกสอดแบบเสริมและทำลายได้",
      "คำนวณความยาวคลื่นแสงเลเซอร์จากการนับจำนวนริ้วการแทรกสอดที่เปลี่ยนไปได้",
      "วิเคราะห์ผลกระทบของตัวกลางดัชนีหักเหแสงที่นำมาขวางในทิศทางเดินแสงได้",
    ],
    equipments: [
      { id: "laser-source", name: "เครื่องกำเนิดแสงเลเซอร์", role: "แหล่งแสงเลเซอร์ความเข้มสูงและความยาวคลื่นเดี่ยวคงที่", note: "ปรับความยาวคลื่นเพื่อศึกษาลักษณะริ้วสว่าง", unit: "nm", tone: "rose", visualKey: "LaserVisual" },
      { id: "beam-splitter", name: "บีมสปลิตเตอร์", role: "แยกและรวมลำแสงเลเซอร์ออกเป็นสองแกนในอัตรา 50/50", note: "ห้ามขยับพิกัดระหว่างสแกนข้อมูล", unit: "optics", tone: "blue", visualKey: "PrismVisual" },
      { id: "mirror-micrometer", name: "กระจกเงาปรับละเอียด", role: "กระจกเงาเลื่อนระยะบนแกนตรงโดยควบคุมความละเอียดระดับไมโครเมตร", note: "บันทึกระยะเลื่อนเพื่อใช้คำนวณ", unit: "nm", tone: "violet", visualKey: "SlidersVisual" },
      { id: "fringe-screen", name: "ฉากรับริ้วการแทรกสอด", role: "แสดงรูปแบบริ้วแทรกสอดริ้วสว่างสลับมืด", note: "นับจำนวนริ้วสว่างที่เคลื่อนตัวผ่านเส้นอ้างอิง", unit: "lines", tone: "amber", visualKey: "ScreenVisual" },
    ],
    steps: [
      { num: 1, title: "ปรับระบบแสง", desc: "ปรับความถี่และความยาวคลื่นแสงเลเซอร์เริ่มต้นเป็นสีแดง (632.8 nm)", iconKey: "Settings", color: "text-rose-500", bg: "bg-rose-50" },
      { num: 2, title: "เลื่อนตำแหน่งกระจก M1", desc: "ค่อย ๆ ปรับระยะกระจกเงาเคลื่อนที่ M1 และสังเกตการสลับริ้วสว่าง", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 3, title: "บันทึกผลการเลื่อน", desc: "บันทึกระยะทางที่เลื่อน (d) และจำนวนริ้วที่เคลื่อนผ่าน (m)", iconKey: "ClipboardList", color: "text-violet-500", bg: "bg-violet-50" },
      { num: 4, title: "คำนวณแลมบ์ดา", desc: "ใช้สูตรในการคำนวณหาความยาวคลื่นแสงเพื่อเปรียบเทียบกับค่าควบคุม", iconKey: "Sparkles", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "zeeman-effect": createDraftUniversityDetails({
    title: "Zeeman Effect",
    category: "Physics",
    focus: "การแยกของระดับพลังงานอะตอมในสนามแม่เหล็ก",
    equation: "&Delta;E = g&mu;<sub>B</sub>B",
    xTitle: "ความเข้มสนามแม่เหล็กภายนอก (Tesla)",
    yTitle: "ระยะแยกของเส้นสเปกตรัม (&Delta;&lambda;)",
    pathColor: "#3b82f6",
    theoryDescription: "ปรากฏการณ์ซีแมน (Zeeman Effect) เป็นการสปลิตสเปกตรัมพลังงานของอะตอมเมื่ออยู่ภายใต้สนามแม่เหล็กภายนอก เนื่องจากอันตรกิริยาระหว่างโมเมนต์แม่เหล็กของวงโคจรและสปินของอิเล็กตรอนกับสนามแม่เหล็ก ส่งผลให้ระดับพลังงานเดิมที่เคยเสื่อม (Degenerate) แยกออกเป็นหลายระดับย่อยตามควอนตัมสปิน",
    equationLabels: [
      { label: "ΔE", desc: "ค่าพลังงานที่แยกออกจากกันระหว่างระดับย่อย", color: "text-blue-500" },
      { label: "g", desc: "Landé g-factor ของระดับพลังงานย่อยนั้น ๆ", color: "text-purple-500" },
      { label: "μ_B", desc: "โบร์แมกเนตอน (Bohr Magneton)", color: "text-rose-500" },
      { label: "B", desc: "ความเข้มของสนามแม่เหล็กภายนอกที่ป้อนให้ระบบ", color: "text-emerald-500" },
    ],
    overviewBullets: [
      "ศึกษาการสปลิตของเส้นสเปกตรัมแสงจากหลอดปล่อยประจุธาตุไอโลหะ",
      "วิเคราะห์ระดับพลังงานย่อยที่เกิดขึ้นภายใต้สนามแม่เหล็กไฟฟ้ากำลังสูง",
      "เปรียบเทียบผลระหว่าง Normal Zeeman Effect และ Anomalous Zeeman Effect",
    ],
    learningObjectives: [
      "อธิบายกลไกอันตรกิริยาระหว่างโมเมนต์แม่เหล็กของสปินและสนามภายนอกได้",
      "คำนวณค่า Landé g-factor และโมเมนต์แม่เหล็กระดับอะตอมได้จากผลการแยกสเปกตรัม",
      "ระบุความแตกต่างของกฎการเลือก (Selection Rules) ที่ยอมให้เกิดการเปลี่ยนระดับพลังงานได้",
    ],
    equipments: [
      { id: "discharge-tube", name: "หลอดปล่อยประจุไอโลหะ", role: "แหล่งกำเนิดแสงสเปกตรัมเดี่ยวจากธาตุตัวอย่างแคดเมียม", note: "รอให้หลอดร้อนได้ที่ก่อนเริ่มสแกนค่าสเปกตรัม", unit: "source", tone: "blue", visualKey: "BulbVisual" },
      { id: "electromagnet", name: "แม่เหล็กไฟฟ้ากำลังสูง", role: "ควบคุมกระแสป้อนเข้าขดลวดเพื่อเปลี่ยนความเข้มสนามแม่เหล็ก B", note: "ห้ามปล่อยกระแสเกินขีดจำกัดความร้อนขดลวด", unit: "Tesla", tone: "rose", visualKey: "CoilVisual" },
      { id: "spectrometer", name: "กล้องสเปกโตรมิเตอร์", role: "วัดภาพสเปกตรัมและประเมินระยะห่างของแถบแสงที่แยกออก", note: "ใส่แผ่นกรองแสงเพื่อแยกส่องเฉพาะขั้วแสงโพลาไรซ์", unit: "nm", tone: "violet", visualKey: "OscilloscopeVisual" },
    ],
    steps: [
      { num: 1, title: "เปิดหลอดไฟตัวอย่าง", desc: "เปิดหลอดปล่อยประจุเพื่อให้สเปกตรัมแสงทำงานและเสถียร", iconKey: "Bulb", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "เพิ่มพลังแม่เหล็ก", desc: "ค่อย ๆ เพิ่มกระแสไฟฟ้าให้กับแม่เหล็กเพื่อเพิ่มความเข้มสนามแม่เหล็ก (B)", iconKey: "Sliders", color: "text-rose-500", bg: "bg-rose-50" },
      { num: 3, title: "สังเกตการแยกเส้นสเปกตรัม", desc: "สังเกตการแยกออกของเส้นสเปกตรัมเดี่ยวเป็น 3 เส้นผ่านโพลาไรเซอร์", iconKey: "Eye", color: "text-violet-500", bg: "bg-violet-50" },
      { num: 4, title: "วัดและคำนวณค่า", desc: "วัดและบันทึกระยะห่างสเปกตรัมที่แยกออก (Δλ) กับความเข้มแม่เหล็ก", iconKey: "ClipboardList", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "superconductivity-meissner": createDraftUniversityDetails({
    title: "Superconductivity & Meissner Effect",
    category: "Physics",
    focus: "ตัวนำยิ่งยวดและการผลักสนามแม่เหล็ก (Meissner Effect)",
    equation: "B = 0 inside superconductor",
    xTitle: "อุณหภูมิของวัสดุ (T ในหน่วย Kelvin)",
    yTitle: "ความต้านทานไฟฟ้า (Ω) / แรงยกตัว (N)",
    pathColor: "#06b6d4",
    theoryDescription: "เมื่อวัสดุตัวนำยิ่งยวด (Superconductor) ถูกทำให้เย็นลงจนต่ำกว่าอุณหภูมิวิกฤต (Critical Temperature, Tc) วัสดุจะสูญเสียความต้านทานไฟฟ้าทั้งหมดไปอย่างสมบูรณ์ และจะขับสนามแม่เหล็กภายนอกออกจากเนื้อวัสดุทั้งหมด (Meissner Effect) ทำให้เกิดแรงผลักกับแม่เหล็กภายนอกจนทำให้แม่เหล็กเกิดการลอยตัวอย่างเสถียร",
    equationLabels: [
      { label: "B = 0", desc: "สนามแม่เหล็กภายในวัสดุตัวนำยิ่งยวดเป็นศูนย์ (Perfect Diamagnetism)", color: "text-cyan-500" },
      { label: "Tc", desc: "อุณหภูมิวิกฤตที่เกิดการเปลี่ยนสถานะเป็นตัวนำยิ่งยวด", color: "text-rose-500" },
    ],
    overviewBullets: [
      "ศึกษาการเปลี่ยนแปลงสภาพต้านทานไฟฟ้าของวัสดุ YBCO เมื่ออุณหภูมิลดลง",
      "สังเกตพฤติกรรมการขับสนามแม่เหล็กและความเข้มข้นฟลักซ์ภายนอกตัวนำยิ่งยวด",
      "สังเกตแรงยกตัว (Levitation Force) และฟลักซ์พินนิ่ง (Flux Pinning) ในระบบจำลอง",
    ],
    learningObjectives: [
      "อธิบายทฤษฎีพื้นฐานของตัวนำยิ่งยวดและการเปรียบเทียบกับตัวนำไฟฟ้าสมบูรณ์แบบได้",
      "วิเคราะห์ปรากฏการณ์ Meissner Effect และการเกิด Levitation ที่เสถียรได้",
      "หาค่าอุณหภูมิวิกฤต (Tc) ของสารตัวอย่างได้จากกราฟความต้านทาน-อุณหภูมิ",
    ],
    equipments: [
      { id: "cryostat", name: "ถังควบคุมระบบเย็นยิ่งยวด", role: "ถังบรรจุไนโตรเจนเหลวสำหรับลดอุณหภูมิแกนตัวอย่าง", note: "สวมถุงมือป้องกันความเย็นจัดระหว่างปฏิบัติงาน", unit: "K", tone: "blue", visualKey: "FlaskVisual" },
      { id: "ybco-sample", name: "เม็ดสารตัวนำ YBCO", role: "สารนำยิ่งยวดอุณหภูมิสูงชนิดเซรามิกเชิงซ้อน", note: "หลีกเลี่ยงการทำให้เปียกชื้นเพื่อรักษาสภาพผิว", unit: "sample", tone: "cyan", visualKey: "PelletVisual" },
      { id: "neodymium-magnet", name: "แม่เหล็กแรงสูงนีโอดิเมียม", role: "แม่เหล็กเหนี่ยวนำสำหรับทดสอบความต้านทานแรงผลักสนามลอยตัว", note: "วางเบา ๆ เหนือเม็ด YBCO เพื่อตรวจสอบผลลอยตัว", unit: "Force", tone: "rose", visualKey: "MagnetVisual" },
      { id: "resistance-meter", name: "เครื่องวัดไฟระบบ 4-Probe", role: "วัดสภาพความต้านทานไฟฟ้าต่ำมากของ YBCO ในสายนำพิเศษ", note: "รอการสแกนแบบออโต้เพื่อลดความคลาดเคลื่อน", unit: "Ω", tone: "violet", visualKey: "MultiMeterVisual" },
    ],
    steps: [
      { num: 1, title: "เริ่มปล่อยไฟฟ้า", desc: "เริ่มการวัดด้วยการปล่อยกระแสไฟฟ้าเข้าสู่ YBCO ที่อุณหภูมิห้อง", iconKey: "Zap", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "เติมไนโตรเจนเหลว", desc: "ปล่อยไนโตรเจนเหลวเพื่อลดอุณหภูมิลงไปสู่ระดับวิกฤต (ต่ำกว่า 93 K)", iconKey: "Thermometer", color: "text-cyan-500", bg: "bg-cyan-50" },
      { num: 3, title: "สังเกตความต้านทาน", desc: "บันทึกความต้านทานไฟฟ้า สังเกตการตกฮวบเหลือศูนย์สัมบูรณ์", iconKey: "TrendingDown", color: "text-violet-500", bg: "bg-violet-50" },
      { num: 4, title: "ทดสอบการลอยตัว", desc: "นำแม่เหล็กมาลอยเหนือ YBCO บันทึกระยะยกตัวเทียบกับอุณหภูมิ", iconKey: "Sparkles", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "bragg-diffraction": createDraftUniversityDetails({
    title: "Bragg Diffraction",
    category: "Physics",
    focus: "การเลี้ยวเบนของรังสีเอกซ์บนโครงผลึก",
    equation: "2d sin&theta; = n&lambda;",
    xTitle: "มุมตกกระทบของรังสีเอกซ์ (&theta; ในหน่วยองศา)",
    yTitle: "ความเข้มข้นของรังสีเลี้ยวเบน (Intensity)",
    pathColor: "#10b981",
    theoryDescription: "การเลี้ยวเบนของแบร็กก์ (Bragg Diffraction) อธิบายความสัมพันธ์ของการสะท้อนรังสีเอกซ์หรือคลื่นที่มีความยาวคลื่นใกล้เคียงกับระยะห่างของอะตอมในผลึก เมื่อรังสีสะท้อนออกจากระนาบผลึกขนานที่อยู่ซ้อนกัน คลื่นจะมาแทรกสอดแบบเสริมกันก็ต่อเมื่อระยะทางเดินของคลื่นที่แตกต่างกัน (Path Difference) เป็นจำนวนเต็มเท่าของความยาวคลื่น",
    equationLabels: [
      { label: "2d sinθ", desc: "ผลต่างเส้นทางเดินคลื่นแสงสะท้อนจากระนาบผลึกขนานกัน", color: "text-emerald-500" },
      { label: "n", desc: "ลำดับการแทรกสอดเชิงโครงสร้าง (1, 2, 3, ...)", color: "text-amber-500" },
      { label: "λ", desc: "ความยาวคลื่นหลักของรังสีเอกซ์ตกกระทบ", color: "text-blue-500" },
      { label: "d", desc: "ระยะห่างระหว่างระนาบโครงผลึกภายในเนื้อผลึก", color: "text-purple-500" },
    ],
    overviewBullets: [
      "จำลองการตกกระทบของรังสีเอกซ์บนผลึกโซเดียมคลอไรด์ (NaCl) หรือโลหะ",
      "สังเกตตำแหน่งยอดเข้ม (Diffraction Peaks) จากการหมุนมุมเลี้ยวเบนของรังสี",
      "วิเคราะห์หาโครงสร้างผลึกแลตทิซและระยะห่างระหว่างชั้นอะตอม d",
    ],
    learningObjectives: [
      "อธิบายหลักการเลี้ยวเบนเชิงโครงผลึกและคำนวณหามิติของเซลล์หน่วยย่อยได้",
      "วิเคราะห์กราฟสเปกตรัมเลี้ยวเบนเพื่อระบุระนาบผลึก (Miller Indices) ได้",
      "ใช้กฎของแบร็กก์ในการระบุหาความกว้างช่องว่างแลตทิซได้อย่างถูกต้อง",
    ],
    equipments: [
      { id: "xray-tube", name: "หลอดกำเนิดรังสีเอกซ์", role: "ยิงรังสีเอกซ์ความยาวคลื่นคงที่ตกกระทบลงบนหน้าสัมผัสผลึก", note: "จำลองสภาวะป้องกันรังสีอย่างเข้มงวด", unit: "λ", tone: "rose", visualKey: "GeneratorVisual" },
      { id: "goniometer", name: "โกนิโอมิเตอร์สแกนมุม", role: "ควบคุมการหมุนแกนมุมผลึกและเครื่องรับรังสีระบบมุม 2-Theta", note: "บันทึกความละเอียดระดับ 0.01 องศาเพื่อความแม่นยำ", unit: "deg", tone: "blue", visualKey: "GoniometerVisual" },
      { id: "crystal-holder", name: "แท่นวางโครงผลึก", role: "จัดระนาบอะตอมผลึก NaCl ให้ตรงกับศูนย์กลางรังสี", note: "เปลี่ยนชนิดตัวอย่างเป็นอะลูมิเนียมเพื่อเปรียบเทียบผล", unit: "holder", tone: "violet", visualKey: "HolderVisual" },
    ],
    steps: [
      { num: 1, title: "กำหนดค่ารังสี", desc: "กำหนดค่าเริ่มต้นของความยาวคลื่นรังสีเอกซ์ตัวเหนี่ยวนำ (เช่น Cu K-alpha)", iconKey: "Settings", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "เริ่มหมุนแกนมุม", desc: "เริ่มสแกนมุมตกกระทบตั้งแต่ 10 ถึง 90 องศาอย่างช้า ๆ", iconKey: "RotateRight", color: "text-rose-500", bg: "bg-rose-50" },
      { num: 3, title: "บันทึกระดับสัญญาณ", desc: "บันทึกระดับความเข้มแสงสะท้อนที่ตกกระทบไปยังเครื่องรับสัญญาณ", iconKey: "ClipboardList", color: "text-violet-500", bg: "bg-violet-50" },
      { num: 4, title: "ตรวจหายอดคลื่น", desc: "ตรวจหาตำแหน่งมุมเลี้ยวเบนที่มีความเข้มสูงสุดเพื่อนำมาคำนวณค่า d", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "relativistic-kinematics": createDraftUniversityDetails({
    title: "Relativistic Kinematics",
    category: "Physics",
    focus: "การแปลงพิกัดแบบลอเรนทซ์และการหดเกร็งของระยะทาง",
    equation: "&Delta;t = &Delta;t<sub>0</sub> / &radic;(1 - v<sup>2</sup>/c<sup>2</sup>)",
    xTitle: "ความเร็วสัมพัทธ์ของวัตถุเทียบกับแสง (v/c)",
    yTitle: "สัดส่วนการหดตัว (L/L0) / อัตรายืดเวลา (&gamma;)",
    pathColor: "#f97316",
    theoryDescription: "ในทฤษฎีสัมพัทธภาพพิเศษของไอน์สไตน์ เมื่อสังเกตวัตถุที่เคลื่อนที่ด้วยความเร็วสัมพัทธ์สูงเข้าใกล้ความเร็วแสง (c) ปริมาณเชิงฟิสิกส์ที่เคยมองว่าคงที่จะเปลี่ยนไป ผู้สังเกตเฉื่อยภายนอกจะพบว่าเวลาในระบบเคลื่อนที่ไหลช้าลง (Time Dilation) และความยาววัตถุในแกนที่เคลื่อนที่จะสั้นลง (Length Contraction) ตามสัดส่วนแฟกเตอร์ลอเรนท์",
    equationLabels: [
      { label: "Δt", desc: "ช่วงเวลาที่วัดได้จากผู้สังเกตหยุดนิ่งสัมพัทธ์ภายนอก", color: "text-orange-500" },
      { label: "Δt0", desc: "ช่วงเวลาเฉพาะตัว (Proper Time) ที่วัดได้ในกรอบของระบบเคลื่อนที่", color: "text-amber-500" },
      { label: "v^2/c^2", desc: "กำลังสองของสัดส่วนความเร็วของกรอบเคลื่อนที่ต่อความเร็วแสง", color: "text-blue-500" },
    ],
    overviewBullets: [
      "จำลองจลนศาสตร์การเดินทางของยานอวกาศความเร็วสูงในกรอบสัมพัทธภาพ",
      "เปรียบเทียบช่วงเวลาและระยะทางสัมพัทธ์ระหว่างผู้สังเกตบนโลกและบนยาน",
      "วิเคราะห์พลังงานจลน์สัมพัทธภาพและโมเมนตัมเมื่อความเร็วเข้าใกล้แสง",
    ],
    learningObjectives: [
      "อธิบายทฤษฎีสมมติฐานพื้นฐานของสัมพัทธภาพพิเศษและผลของการแปลงพิกัดได้",
      "คำนวณเวลาที่เปลี่ยนไปและระยะทางที่หดตัวจากความเร็วของกรอบอ้างอิงได้",
      "อธิบายเหตุผลว่าทำไมมวลรวมของระบบจึงแปรผันตามความเร่งสัมพัทธภาพได้",
    ],
    equipments: [
      { id: "relativistic-engine", name: "ห้องเร่งพลังความเร็วสัมพัทธ์", role: "จำลองการขับเคลื่อนระดับมัธยมความเร็วตั้งแต่ 0.1c ถึง 0.999c", note: "สังเกตพลังงานสะสมที่ต้องการเร่งระหว่างจำลอง", unit: "c", tone: "orange", visualKey: "EngineVisual" },
      { id: "proper-clock", name: "นาฬิกาสัมพัทธภาพประจำยาน", role: "นาฬิกาวัดเวลาภายในยานอ้างอิงความถี่ย่อยเฉพาะตัว", note: "เปรียบเทียบกับนาฬิกาเวลาภายนอกโลกอย่างต่อเนื่อง", unit: "s", tone: "violet", visualKey: "ClockVisual" },
      { id: "coordinate-grid", name: "กริดวัดมิติลอเรนทซ์", role: "ตรวจจับและแสดงภาพมิติคู่ขนานสัมพัทธ์พร้อมอัตราหดตัวยาน", note: "วัดความหนาแน่นมวลและระยะตามความเร่ง", unit: "L/L0", tone: "blue", visualKey: "GridVisual" },
    ],
    steps: [
      { num: 1, title: "กำหนดขนาดสัมพัทธ์", desc: "ตั้งค่าความยาวและขนาดเริ่มต้นของยานอวกาศ (L0) และพิกัดเวลาอ้างอิง", iconKey: "Settings", color: "text-orange-500", bg: "bg-orange-50" },
      { num: 2, title: "เพิ่มความเร็วสัมพัทธ์", desc: "เร่งความเร็วยานสัมพัทธ์ทีละขั้นขึ้นไปสู่ขีดจำกัดความเร็วแสง", iconKey: "Sliders", color: "text-amber-500", bg: "bg-amber-50" },
      { num: 3, title: "บันทึกผลการหดตัว", desc: "สังเกตและบันทึกสัญญลักษณ์การหดตัวของมิติยานบนแกนความเร็ว", iconKey: "TrendingDown", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 4, title: "พล็อตกราฟลอเรนท์", desc: "พล็อตกราฟเปรียบเทียบสัดส่วนการหดเกร็งและเวลาหน่วงสัมพัทธ์เทียบกับ v/c", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "nmr-spectroscopy": createDraftUniversityDetails({
    title: "NMR Spectroscopy",
    category: "Chemistry",
    focus: "นิวเคลียร์แมกเนติกเรโซแนนซ์และเคมีคัลชิฟต์",
    equation: "&nu; = &gamma;B<sub>0</sub>(1 - &sigma;) / 2&pi;",
    xTitle: "เคมีคัลชิฟต์ (&delta; ในหน่วย ppm)",
    yTitle: "ความสูงของพีคสัญญาณ (Intensity)",
    pathColor: "#7c3aed",
    theoryDescription: "นิวเคลียร์แมกเนติกเรโซแนนซ์ (NMR) สเปกโทรสโกปีวิเคราะห์โครงสร้างสารเคมีโดยการให้สปินของนิวเคลียสอะตอม (เช่น 1H หรือ 13C) อยู่ภายใต้สนามแม่เหล็กแรงสูง นิวเคลียสจะสปินพรีเซสชั่นด้วยความถี่ลาร์มอร์ การปล่อยคลื่นวิทยุไปเหนี่ยวนำทำให้เกิดเรโซแนนซ์ โดยที่ความหนาแน่นอิเล็กตรอนรอบข้างจะบังสนามแม่เหล็ก (Shielding) ทำให้ความถี่เรโซแนนซ์เลื่อนไปเล็กน้อยเป็นค่าเคมีคัลชิฟต์",
    equationLabels: [
      { label: "ν", desc: "ความถี่การสั่นพรีเซสชั่นเรโซแนนซ์ของนิวเคลียสอะตอม", color: "text-purple-500" },
      { label: "B0", desc: "ความเข้มข้นของสนามแม่เหล็กภายนอกหลักที่สร้างจากขดลวด", color: "text-violet-500" },
      { label: "σ", desc: "ค่าคงที่บดบังแม่เหล็กของเมฆอิเล็กตรอนรอบตัวนิวเคลียส", color: "text-rose-500" },
      { label: "δ", desc: "ค่าชิฟต์สเปกตรัมแสดงหน่วยต่อล้านเปรียบเทียบความถี่อ้างอิง", color: "text-blue-500" },
    ],
    overviewBullets: [
      "ศึกษาการดูดกลืนพลังงานคลื่นวิทยุของนิวเคลียสโปรตอน (1H-NMR)",
      "สังเกตความแตกต่างของจำนวนสัญญาณสั่นตามจำนวนสิ่งแวดล้อมโปรตอนที่ต่างกัน",
      "วิเคราะห์โครงสร้างโมเลกุลสารอินทรีย์และพีคการแยก (Coupling Splitting)",
    ],
    learningObjectives: [
      "อธิบายทฤษฎีกลไกสปินนิวเคลียสกับการดูดกลืนสนามแม่เหล็กและสเปกโทรสโกปีได้",
      "ตีความตำแหน่งพีคสารละลายเคมีคัลชิฟต์เพื่อระบุหมู่ฟังก์ชันโครงสร้างโมเลกุลได้",
      "วิเคราะห์การแยกแบบสปิน-สปิน (Spin-Spin Splitting) ตามกฎ n+1 ได้ถูกต้อง",
    ],
    equipments: [
      { id: "nmr-magnet", name: "แม่เหล็กความเข้มสูง NMR", role: "ขดลวดแม่เหล็กซูเปอร์คอนดักติ้งป้อนค่า B0 ระดับเทสลาคงตัว", note: "ระวังระบบระบายความร้อนฮีเลียมเหลวของห้องแม่เหล็ก", unit: "Tesla", tone: "violet", visualKey: "MagnetVisual" },
      { id: "sample-tube", name: "หลอดแก้วตรวจวัด NMR", role: "หลอดแก้วบางบรรจุสารละลายตัวอย่างเจือสารดิวทีเรียม", note: "เช็ดทำความสะอาดผิวนอกหลอดให้ไร้ฝุ่นไขมันก่อนวัด", unit: "tube", tone: "blue", visualKey: "TubeVisual" },
      { id: "rf-coil", name: "คอยล์ตรวจรับสัญญาณวิทยุ", role: "คอยล์ส่งคลื่น RF เหนี่ยวนำสปินและรับสัญญาณเหนี่ยวนำ FID กลับมา", note: "บันทึกเวลาเหนี่ยวนำพัลส์แบบละเอียด", unit: "MHz", tone: "violet", visualKey: "CoilVisual" },
    ],
    steps: [
      { num: 1, title: "เตรียมหลอดตัวอย่าง", desc: "ละลายสารตัวอย่างในตัวทำละลายดิวทีเรียมและหย่อนลงแกนแม่เหล็ก", iconKey: "FileText", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "ปรับแต่งเทียบศูนย์", desc: "ปรับเทียบความเข้มข้นแม่เหล็กและจุดศูนย์อ้างอิงของสาร TMS (0 ppm)", iconKey: "Settings", color: "text-purple-500", bg: "bg-purple-50" },
      { num: 3, title: "ส่งสัญญาณ RF Pulse", desc: "ยิงคลื่นพัลส์ความถี่วิทยุจำลอง และตรวจจับสัญญาณความสั่น FID ตอบสนอง", iconKey: "Zap", color: "text-violet-500", bg: "bg-violet-50" },
      { num: 4, title: "ทำฟูเรียร์ทรานส์ฟอร์ม", desc: "ทำโปรแกรมแปลงสัญญาณจากเวลาเป็นพิกัดความถี่ เกิดยอดพีคระบุโครงสร้างโมเลกุล", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "xps-spectroscopy": createDraftUniversityDetails({
    title: "XPS Spectroscopy",
    category: "Chemistry",
    focus: "พลังงานยึดเหนี่ยวของอิเล็กตรอนในเปลือกชั้นใน",
    equation: "B.E. = h&nu; - K.E. - &Phi;",
    xTitle: "พลังงานยึดเหนี่ยว (Binding Energy ในหน่วย eV)",
    yTitle: "อัตราการนับโฟโตอิเล็กตรอน (Photoelectron Count)",
    pathColor: "#ec4899",
    theoryDescription: "เอ็กซ์เรย์โฟโตอิเล็กตรอนสเปกโทรสโกปี (XPS) อาศัยปรากฏการณ์โฟโตอิเล็กทริกในการปล่อยรังสีเอกซ์พลังงานเดี่ยวตกกระทบผิวสาร ทำให้อิเล็กตรอนชั้นในหลุดออก การวัดพลังงานจลน์ (K.E.) ของอิเล็กตรอนที่หลุดออกมาช่วยให้คำนวณพลังงานยึดเหนี่ยว (Binding Energy) ซึ่งเป็นค่าเฉพาะเจาะจงของแต่ละระดับพลังงานและบอกสถานะทางเคมีของอะตอมได้",
    equationLabels: [
      { label: "B.E.", desc: "พลังงานยึดเหนี่ยวของอิเล็กตรอนชั้นในกับนิวเคลียส", color: "text-rose-500" },
      { label: "hν", desc: "พลังงานรวมของรังสีเอกซ์พลังงานเดี่ยวตกกระทบ", color: "text-purple-500" },
      { label: "K.E.", desc: "พลังงานจลน์ของอิเล็กตรอนหลุดลอยที่วิเคราะห์ได้", color: "text-amber-500" },
      { label: "Φ", desc: "ฟังก์ชันงานสูญเสียบนหน้าเครื่องตรวจวัดกระแสไฟฟ้า", color: "text-blue-500" },
    ],
    overviewBullets: [
      "ศึกษาทฤษฎีกลไกการปล่อยโฟโตอิเล็กตรอนจากชั้นระดับพลังงานชั้นใน",
      "วิเคราะห์ชนิดธาตุและสถานะเคมีบนพื้นผิววัตถุตัวอย่างในระดับนาโนเมตร",
      "สังเกตค่า Chemical Shift ของ B.E. ตามสถานะการเหนี่ยวนำประจุออกซิเดชัน",
    ],
    learningObjectives: [
      "อธิบายกลไกทางเคมีฟิสิกส์ของการเกิดโฟโตอิเล็กตรอนและทฤษฎีอนุรักษ์พลังงานได้",
      "วิเคราะห์และจำแนกชนิดธาตุจากพลังงานยึดเหนี่ยวจำเพาะของ XPS Peak ได้",
      "ประเมินอิทธิพลของสิ่งแวดล้อมทางเคมี (Chemical Shift) บนระดับชั้นพลังงานอิเล็กตรอนได้",
    ],
    equipments: [
      { id: "xray-source", name: "หลอดกำเนิดรังสีเอกซ์คู่", role: "ฉายรังสีเอกซ์ความยาวคลื่นเดี่ยวคงตัวเข้าปะทะหน้าตัวอย่าง", note: "จำลองสภาวะพลังงานตกกระทบ Al K-alpha", unit: "eV", tone: "violet", visualKey: "GeneratorVisual" },
      { id: "ultra-vacuum", name: "ห้องสุญญากาศยวดยิ่ง UHV", role: "ป้องกันการชนของอิเล็กตรอนหลุดลอยกับโมเลกุลอากาศภายนอก", note: "รักษาสุญญากาศระดับความดันต่ำยวดยิ่งเสมอ", unit: "Torr", tone: "blue", visualKey: "VacuumVisual" },
      { id: "energy-analyzer", name: "เครื่องวิเคราะห์ระดับพลังงานจลน์", role: "คัดกรองและนับอิเล็กตรอนตามระดับพลังงานผ่านสนามไฟฟ้ากึ่งทรงกลม", note: "ปรับประจุจานวิเคราะห์แบบอัตโนมัติ", unit: "counts", tone: "rose", visualKey: "DetectorVisual" },
    ],
    steps: [
      { num: 1, title: "ติดตั้งสารในห้อง UHV", desc: "ติดตั้งสารตัวอย่างเข้าแกนวัดและทำสุญญากาศระดับยวดยิ่ง UHV", iconKey: "Settings", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "ฉายรังสีพลังงานเดี่ยว", desc: "ปล่อยรังสีเอกซ์พลังงานคงที่ตกกระทบลงบนหน้าสัมผัสเป้าหมาย", iconKey: "Zap", color: "text-purple-500", bg: "bg-purple-50" },
      { num: 3, title: "สแกนนับโฟโตอิเล็กตรอน", desc: "เริ่มการสแกนนับจำนวนอิเล็กตรอนสะสมตามช่วงพลังงานจลน์ทีละขั้น", iconKey: "Eye", color: "text-rose-500", bg: "bg-rose-50" },
      { num: 4, title: "ประเมินกราฟ B.E.", desc: "แปลงค่าพลังงานเป็นพลังงานยึดเหนี่ยว B.E. และค้นหาตำแหน่งยอดพีคเปรียบเทียบ", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "hplc-chromatography": createDraftUniversityDetails({
    title: "HPLC Chromatography",
    category: "Chemistry",
    focus: "การกระจายตัวของของผสมในเฟสเคลื่อนที่และเฟสคงที่",
    equation: "R<sub>s</sub> = 2(t<sub>R2</sub> - t<sub>R1</sub>) / (w<sub>1</sub> + w<sub>2</sub>)",
    xTitle: "เวลาเก็บกักสาร (Retention Time, tR ในหน่วยนาที)",
    yTitle: "สัญญาณเครื่องตรวจวัด (Absorbance)",
    pathColor: "#f59e0b",
    theoryDescription: "โครมาโทกราฟีของเหลวสมรรถนะสูง (HPLC) ใช้ของเหลวภายใต้แรงดันสูงส่งสารผสมผ่านคอลัมน์ที่บรรจุเฟสคงที่ การทำอันตรกิริยาระหว่างสารแต่ละชนิดกับเฟสทั้งสองต่างกัน (ขั้ว ความเป็นกรด หรือขนาด) ทำให้ความเร็วในการเคลื่อนที่แตกต่างกัน เกิดการแยกวงสารออกจากกันและตรวจวัดเชิงวิเคราะห์ทีละชนิดที่ปลายทาง",
    equationLabels: [
      { label: "Rs", desc: "ระดับความละเอียดในการแยกสารสองพีคคู่กัน (Resolution)", color: "text-amber-500" },
      { label: "tR", desc: "เวลาเฉลี่ยที่ส่วนประกอบสารใช้เดินทางผ่านคอลัมน์ถึงตรวจวัด", color: "text-orange-500" },
      { label: "w", desc: "ความกว้างที่ระดับฐานล่างสุดของพีคสัญญาณสาร", color: "text-blue-500" },
    ],
    overviewBullets: [
      "ศึกษาทฤษฎีการทำงานของระบบขับส่งของเหลวความดันสูงระดับร้อยบาร์",
      "เปรียบเทียบการแยกของสารระหว่างคอลัมน์เฟสปรกติและเฟสย้อนกลับ C18",
      "วิเคราะห์ความเข้มข้นสารอย่างแม่นยำจากผลพื้นที่ใต้กราฟโครมาโทแกรม",
    ],
    learningObjectives: [
      "อธิบายกลไกสัมพัทธ์ทางขั้วเคมีระหว่างสาร เฟสคงที่ และเฟสเคลื่อนที่ได้",
      "คำนวณระดับประสิทธิภาพความละเอียดการแยก (Resolution, Rs) ของสองพีคสารคู่ได้",
      "ปรับแต่งสัดส่วนชนิดตัวทำละลายเพื่อเพิ่มความรวดเร็วและความคงตัวของการแยกได้",
    ],
    equipments: [
      { id: "high-pressure-pump", name: "เครื่องสูบของเหลวแรงดันสูง", role: "ส่งของเหลวเฟสเคลื่อนที่ผ่านระบบท่อเล็กด้วยอัตราไหลและแรงดันคงที่", note: "ตรวจสอบท่อทางเดินของเหลวไม่ให้มีฟองอากาศขัดขวาง", unit: "bar", tone: "amber", visualKey: "PumpVisual" },
      { id: "silica-column", name: "คอลัมน์แยก C18", role: "แกนบรรจุเม็ดทรายซิลิกาแต่งปลายสายไฮโดรคาร์บอนขั้วต่ำมาก", note: "รักษาอุณหภูมิคอลัมน์ให้เสถียรเพื่อผลการแยกคงที่", unit: "column", tone: "blue", visualKey: "ColumnVisual" },
      { id: "uv-detector", name: "เครื่องตรวจจับดูดกลืนแสง UV", role: "วัดระดับการดูดกลืนคลื่นแสงจำเพาะของสารเมื่อไหลแยกผ่านพ้นคอลัมน์", note: "ปรับแต่งความยาวคลื่นแสงที่ดูดกลืนสูงสุดของหมู่ฟังก์ชัน", unit: "Abs", tone: "violet", visualKey: "SpectrometerVisual" },
    ],
    steps: [
      { num: 1, title: "ปรับผสมสายของเหลว", desc: "กำหนดอัตราสัดส่วนผสมน้ำยาเฟสเคลื่อนที่และอัตราไหลจำลองคงตัว", iconKey: "Settings", color: "text-amber-500", bg: "bg-amber-50" },
      { num: 2, title: "ฉีดขวดตัวอย่างผสม", desc: "ฉีดสารตัวอย่างเข้าสู่หัวฉีดจำลอง สังเกตแรงดันระบบปรับขึ้น", iconKey: "Zap", color: "text-orange-500", bg: "bg-orange-50" },
      { num: 3, title: "สังเกตแยกขอบเขตสาร", desc: "สังเกตการเคลื่อนของกลุ่มสารที่มีความหนาแน่นขั้วต่างกันแยกกันในคอลัมน์", iconKey: "Eye", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 4, title: "บันทึกกราฟเวลา", desc: "บันทึกเวลา tR และประเมินค่า Resolution จากสเปกตรัมพื้นที่ใต้กราฟที่ได้", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "transition-metal-complexes": createDraftUniversityDetails({
    title: "Transition Metal Complexes",
    category: "Chemistry",
    focus: "สนามพลังงานลิแกนด์และการแบ่งตัวของระดับ d-orbital",
    equation: "&Delta;<sub>oct</sub> = hc / &lambda;<sub>max</sub>",
    xTitle: "ความยาวคลื่นแสงดูดกลืน (&lambda; ในหน่วย nm)",
    yTitle: "สัดส่วนการดูดกลืนแสง (Absorbance)",
    pathColor: "#9333ea",
    theoryDescription: "เมื่อลิแกนด์เข้ามาล้อมรอบไอออนโลหะแทรนซิชัน จะเกิดสนามไฟฟ้าที่ผลักกับอิเล็กตรอนใน d-orbital ส่งผลให้ระดับพลังงาน d-orbital ที่เคยมีความเสื่อมแยกออกเป็นระดับย่อย eg และ t2g ค่าพลังงานช่องว่างการสปลิต (Crystal Field Splitting, Δ) สอดคล้องกับพลังงานโฟตอนของแสงที่สารดูดกลืนเพื่อใช้อิเล็กตรอนโปรโมตขึ้นไป ทำให้เกิดสีสันของสารประกอบเชิงซ้อนที่แตกต่างกัน",
    equationLabels: [
      { label: "Δoct", desc: "พลังงานช่องว่างในการแบ่ง d-orbital โครงสร้างแบบทรงแปดหน้า", color: "text-purple-500" },
      { label: "h", desc: "ค่าคงที่สากลของพลังค์ (Planck's constant)", color: "text-pink-500" },
      { label: "c", desc: "ความเร็วในการเคลื่อนที่ของแสงในสุญญากาศ", color: "text-blue-500" },
      { label: "λmax", desc: "ความยาวคลื่นสอดคล้องกับจุดดูดกลืนแสงพลังงานสูงสุด", color: "text-rose-500" },
    ],
    overviewBullets: [
      "สังเกตการเปลี่ยนสีของสารละลายโลหะเมื่อทำปฏิกิริยากับลิแกนด์จำเพาะ",
      "จัดกลุ่มระดับความแรงเหนี่ยวนำของสารตามแนวคิด Spectrochemical Series",
      "วิเคราะห์คุณสมบัติโมเมนต์แม่เหล็กแบบ High Spin และ Low Spin",
    ],
    learningObjectives: [
      "อธิบายสาเหตุการแยกของ d-orbital ภายใต้แรงผลักประจุของลิแกนด์ได้",
      "เชื่อมโยงความสัมพันธ์ของสีของสารละลายเชิงซ้อนกับแสงที่ถูกสกัดดูดกลืนได้",
      "คำนวณพลังงาน Crystal Field Splitting (Δ) จากจุดความยาวคลื่นสูงสุดได้",
    ],
    equipments: [
      { id: "spectrophotometer", name: "สเปกโทรโฟโตมิเตอร์ชนิดขวดแก้ว", role: "วัดสัดส่วนการดูดกลืนรังสีแสงจำเพาะตั้งแต่ 380 ถึง 750 nm", note: "คาริเบรตเครื่องด้วยน้ำบริสุทธิ์เพื่อหักค่า Blank ก่อนสแกนทุกครั้ง", unit: "Abs", tone: "violet", visualKey: "SpectrometerVisual" },
      { id: "ligand-set", name: "เซตสารละลายลิแกนด์", role: "ชุดขวดป้อนสารประเภท H2O, NH3, ethylenediamine สำหรับสร้างปฏิกิริยา", note: "ระวังกลิ่นฉุนและความเป็นกรดด่างระหว่างเตรียมสารละลาย", unit: "set", tone: "violet", visualKey: "ReagentSetVisual" },
    ],
    steps: [
      { num: 1, title: "เตรียมโลหะตั้งต้น", desc: "เตรียมสารละลายทองแดง Copper(II) hydrate ตั้งต้นสังเกตสีฟ้าใส", iconKey: "FileText", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "ทำปฏิกิริยาเติมลิแกนด์", desc: "ค่อย ๆ เติมแอมโมเนียเพื่อแทนที่โมเลกุลน้ำ สังเกตสีเปลี่ยนเป็นน้ำเงินเข้มสะสม", iconKey: "Sliders", color: "text-purple-500", bg: "bg-purple-50" },
      { num: 3, title: "สแกนดูดกลืนสเปกตรัม", desc: "ใส่สารใน Cuvette และนำไปสแกนระดับการดูดรังสีแสงจำเพาะช่วงภาพ", iconKey: "Eye", color: "text-pink-500", bg: "bg-pink-50" },
      { num: 4, title: "วิเคราะห์ระดับพลังงาน", desc: "บันทึกความเข้มสูงสุด λmax เพื่อหาพลังงาน Δoct ไปดุลความแรงลิแกนด์", iconKey: "Calculator", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "eis-electrochemistry": createDraftUniversityDetails({
    title: "Electrochemical Impedance Spectroscopy",
    category: "Chemistry",
    focus: "อิมพีแดนซ์ไฟฟ้าเคมีและความสัมพันธ์กระแสเหนี่ยวนำ",
    equation: "Z(&omega;) = Z' - jZ''",
    xTitle: "ความต้านทานไฟฟ้าจริง (Real Impedance, Z' ในหน่วย &Omega;)",
    yTitle: "ความต้านทานจินตภาพ (-Impedance, -Z'' ในหน่วย &Omega;)",
    pathColor: "#059669",
    theoryDescription: "อิเล็กโทรเคมิคอลอิมพีแดนซ์สเปกโทรสโกปี (EIS) ใช้ในการวิเคราะห์พฤติกรรมการถ่ายโอนมวลและประจุของระบบไฟฟ้าเคมี โดยการปล่อยแรงดันไฟฟ้ากระแสสลับขนาดเล็กแกว่งความถี่กว้างตกกระทบขั้วไฟฟ้า ค่าอิมพีแดนซ์ที่เปลี่ยนตามความถี่ช่วยให้อธิบายการทำงานเสมือนวงจรไฟฟ้าเทียบเท่า เช่น ความต้านทานสารละลาย ความจุไฟฟ้าของชั้นคู่คู่ขนาน และแรงต้านทานการขนส่งมวลสาร",
    equationLabels: [
      { label: "Z(ω)", desc: "อิมพีแดนซ์รวมของระบบที่เปลี่ยนตามความถี่เชิงมุมกระแสสลับ", color: "text-emerald-500" },
      { label: "Z'", desc: "อิมพีแดนซ์ส่วนจริง แสดงแรงต้านความร้อนแบบโอห์มมิกในเซลล์", color: "text-blue-500" },
      { label: "-Z''", desc: "อิมพีแดนซ์จินตภาพ แสดงค่าความจุประจุที่สะสมบนผิวขั้วไฟฟ้า", color: "text-rose-500" },
      { label: "j", desc: "ตัวเลขจินตภาพหลักทางวิศวกรรมคณิตศาสตร์ (√-1)", color: "text-purple-500" },
    ],
    overviewBullets: [
      "ศึกษาพฤติกรรมการถ่ายประจุไฟฟ้าที่จุดต่อระหว่างขั้วไฟฟ้าและสารเคมี",
      "สร้างความสัมพันธ์พารามิเตอร์วงจรเสมือนผ่าน Nyquist Plot และ Bode Plot",
      "ประเมินค่าสัมประสิทธิ์การแพร่และพฤติกรรมความต้านทาน Rct และความจุ Cdl",
    ],
    learningObjectives: [
      "อธิบายความหมายของอิมพีแดนซ์และเฟสสั่นเหลื่อมในขั้วไฟฟ้าเคมีได้",
      "ตีความรูปทรงโค้งครึ่งวงกลมของ Nyquist Plot เพื่อหาค่าความต้านทาน Rct ได้",
      "จำลองและปรับประกอบโมเดลวงจรเทียบเท่า (Equivalent Circuit Fitting) ได้",
    ],
    equipments: [
      { id: "potentiostat", name: "โพเทนชิโอสแตตความละเอียดสูง", role: "ปล่อยแรงดันแกว่งกระแสสลับความถี่กว้าง (μHz ถึง MHz) พร้อมวัดกระแสตอบรับ", note: "ตรวจสอบความสะอาดของปลั๊กเชื่อมต่อขั้วเพื่อลด Noise", unit: "V/I", tone: "emerald", visualKey: "PotentiostatVisual" },
      { id: "three-electrode-cell", name: "เซลล์ทดลอง 3 ขั้ว", role: "แก้วเซลล์ยึดขั้ว Working, Counter และ Reference ในน้ำยาควบคุม", note: "ตั้งค่าอุณหภูมิคงตัวเพื่อลดความคลาดเคลื่อนทางจลนศาสตร์", unit: "cell", tone: "blue", visualKey: "CellVisual" },
      { id: "fitting-software", name: "โปรแกรมฟิตติ้งเทียบเคียงวงจร", role: "วิเคราะห์พล็อตกราฟเทียบวงจร Randles Cell เพื่อหา Cdl และ Rct", note: "คำนวณเปอร์เซ็นต์ความคลาดเคลื่อนเบี่ยงเบนสะสม", unit: "errors", tone: "violet", visualKey: "SoftwareVisual" },
    ],
    steps: [
      { num: 1, title: "เซตระบบเซลล์ 3 ขั้ว", desc: "จัดขั้วทำงาน ขั้วอ้างอิง และขั้วช่วยลงในเซลล์สารละลายเคมีจำลอง", iconKey: "Settings", color: "text-emerald-500", bg: "bg-emerald-50" },
      { num: 2, title: "ป้อนย่านความถี่", desc: "กำหนดช่วงสแกนความถี่ป้อนกระแสสลับตั้งแต่ความถี่สูงลงไปย่านต่ำมาก", iconKey: "Sliders", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 3, title: "บันทึกผลตอบสนอง", desc: "เก็บสัญญาณกระแสและมุมเฟสที่ตอบรับมาพล็อตลงระบบจุดพารามิเตอร์", iconKey: "ClipboardList", color: "text-rose-500", bg: "bg-rose-50" },
      { num: 4, title: "เปรียบเทียบ Nyquist", desc: "วิเคราะห์ยอดโค้ง Nyquist Plot และใช้ซอฟต์แวร์ฟิตโมเดลหาค่า Rs, Rct และ Cdl", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" },
    ],
  }),
  "quantum-chemistry-orbitals": createDraftUniversityDetails({
    title: "Quantum Chemistry Orbitals",
    category: "Chemistry",
    focus: "ออร์บิทัลโมเลกุลและการรวมกันเชิงเส้นของออร์บิทัลอะตอม",
    equation: "&Psi;<sub>MO</sub> = c<sub>A</sub>&phi;<sub>A</sub> &plusmn; c<sub>B</sub>&phi;<sub>B</sub>",
    xTitle: "ระยะห่างระหว่างนิวเคลียส (Interatomic Distance)",
    yTitle: "ระดับพลังงานของออร์บิทัล (Energy)",
    pathColor: "#3b82f6",
    theoryDescription: "ตามแบบจำลองเคมีควอนตัม ออร์บิทัลโมเลกุล (Molecular Orbital, MO) เกิดจากการรวมตัวกันทางคณิตศาสตร์เชิงเส้นของออร์บิทัลอะตอม (LCAO) เมื่อฟังก์ชันคลื่นอิเล็กตรอนเสริมกันจะเกิดออร์บิทัลสร้างพันธะ (Bonding Orbital) ที่มีระดับพลังงานต่ำลง หากฟังก์ชันคลื่นตรงข้ามกันจะเกิดออร์บิทัลต้านพันธะ (Antibonding Orbital) ที่มีโหนดฟังก์ชันเป็นศูนย์และมีพลังงานสูงขึ้น",
    equationLabels: [
      { label: "ΨMO", desc: "ฟังก์ชันคลื่นผลลัพธ์ของอิเล็กตรอนในออร์บิทัลโมเลกุล", color: "text-blue-500" },
      { label: "φA/B", desc: "ฟังก์ชันออร์บิทัลอะตอมของแต่ละอะตอมเดี่ยวที่ใช้ผสมกัน", color: "text-purple-500" },
      { label: "c", desc: "น้ำหนักสัมประสิทธิ์ตัวคูณของโครงสร้างอะตอมที่สมมาตร", color: "text-rose-500" },
    ],
    overviewBullets: [
      "ศึกษาการก่อสร้างพันธะซิกมาและไพจากการซ้อนเหลื่อมของ s และ p orbital",
      "สังเกตความหนาแน่นความน่าจะเป็นที่จะพบอิเล็กตรอนรอบนิวเคลียสสองตัว",
      "วิเคราะห์ความแตกต่างของระดับพลังงานระหว่าง HOMO และ LUMO",
    ],
    learningObjectives: [
      "อธิบายเงื่อนไขของแบบจำลอง LCAO-MO และการเกาะกลุ่มสร้างโหนดได้",
      "วิเคราะห์ระดับชั้นพลังงานของโมเลกุลโฮโมไดอะตอมมิกพร้อมบรรจุอิเล็กตรอนได้",
      "คำนวณหาอันดับพันธะ (Bond Order) เพื่อประเมินความแข็งแกร่งของพันธะได้",
    ],
    equipments: [
      { id: "quantum-solver", name: "โปรแกรมวิเคราะห์เคมีควอนตัม", role: "คำนวณสมการชโรดิงเจอร์ระดับออร์บิทัลโมเลกุลด้วยวิธี SCF-MO", note: "กำหนดฟังก์ชันชุดฐานเบสิสที่ความเที่ยงตรงสมดุล", unit: "Hartree", tone: "blue", visualKey: "ServerVisual" },
      { id: "orbital-plotter", name: "เครื่องพล็อตรูปทรงออร์บิทัล 3D", role: "วาดขอบเขตรูปร่างพื้นผิวความหนาแน่นประจุอิเล็กตรอนและทิศทางโหนด", note: "หมุนและวิเคราะห์มุมออร์บิทัลเพื่อดูความสมมาตร", unit: "plots", tone: "violet", visualKey: "3DVisual" },
    ],
    steps: [
      { num: 1, title: "ระบุโมเลกุลทดสอบ", desc: "เลือกชนิดอะตอมต้นแบบคู่พันธะ (เช่น แก๊สไนโตรเจน N₂)", iconKey: "FileText", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "คำนวณสมดุลระยะห่าง", desc: "สั่งรันการหาพลังงานต่ำสุดเทียบกับระยะห่างเพื่อกำหนดความยาวพันธะสมบูรณ์", iconKey: "Sliders", color: "text-purple-500", bg: "bg-purple-50" },
      { num: 3, title: "สร้างระดับไดอะแกรม", desc: "บันทึกและตรวจสอบตำแหน่งพลังงานและลักษณะรูปทรงออร์บิทัลย่อยเสริมต้าน", iconKey: "Grid", color: "text-rose-500", bg: "bg-rose-50" },
      { num: 4, title: "วิเคราะห์ HOMO-LUMO", desc: "ระบุช่องว่างพลังงานการเปลี่ยนอิเล็กตรอนของคู่ยอดบนสุดและล่างสุด", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "pcr-gel-electrophoresis": createDraftUniversityDetails({
    title: "PCR & Gel Electrophoresis",
    category: "Biology",
    focus: "การเพิ่มจำนวนดีเอ็นเอและการแยกขนาดบนเจลกระแสไฟฟ้า",
    equation: "N = N<sub>0</sub> * 2<sup>n</sup>",
    xTitle: "เวลาการรันไฟฟ้า (นาที) / ขนาดดีเอ็นเอ (bp)",
    yTitle: "ระยะทางเคลื่อนที่บนเจล (mm) / จำนวนโมเลกุล (N)",
    pathColor: "#10b981",
    theoryDescription: "กระบวนการจำลอง PCR เพิ่มสำเนาดีเอ็นเอเป้าหมายผ่านการวนรอบอุณหภูมิ 3 ขั้นตอน: แยกสาย (Denaturation), เกาะสาย (Annealing), และต่อสาย (Extension) นำผลิตภัณฑ์มาแยกขนาดด้วย Gel Electrophoresis โดยให้ดีเอ็นเอที่มีประจุลบตามโครงสร้างฟอสเฟตเคลื่อนเข้าหาขั้วบวก ดีเอ็นเอขนาดเล็กจะเคลื่อนผ่านตาข่ายเจลอะกาโรสได้เร็วกว่าดีเอ็นเอขนาดใหญ่",
    equationLabels: [
      { label: "N", desc: "จำนวนชิ้นส่วนสายดีเอ็นเอเป้าหมายสะสมเมื่อเสร็จสิ้นกระบวนการ", color: "text-emerald-500" },
      { label: "N0", desc: "จำนวนดีเอ็นเอเป้าหมายเริ่มต้นในสารละลายผสม", color: "text-blue-500" },
      { label: "n", desc: "จำนวนรอบรอบวงจรเปลี่ยนอุณหภูมิที่สะสมในเครื่องปฏิกิริยา", color: "text-purple-500" },
    ],
    overviewBullets: [
      "ศึกษาขั้นตอนการควบคุมอุณหภูมิในระดับ Denaturing, Annealing และ Extension",
      "จำลองการต่อยอดสายดีเอ็นเอด้วยเอนไซม์ Taq Polymerase และชุดไพรเมอร์จำเพาะ",
      "สังเกตการแยกตัวของแท่งแบนด์ดีเอ็นเอตามความเร่งกระแสไฟฟ้าในเจล",
    ],
    learningObjectives: [
      "อธิบายบทบาทและกลไกของแต่ละอุณหภูมิในการแยกและสร้างสายดีเอ็นเอใหม่ได้",
      "คำนวณปริมาณดีเอ็นเอผลผลิตที่เพิ่มขึ้นในแต่รอบวงจรทฤษฎีได้ถูกต้อง",
      "วิเคราะห์แถบดีเอ็นเอที่แยกบนเจลเพื่อหาขนาดน้ำหนักสารตัวอย่างจริงได้",
    ],
    equipments: [
      { id: "thermocycler", name: "เครื่องคุมรอบอุณหภูมิ PCR", role: "ปรับขึ้นลงอุณหภูมิอย่างแม่นยำรวดเร็วตามโปรแกรม 3 ขั้นหลัก", note: "ตรวจสอบความเหมาะสมของอุณหภูมิเกาะสาย Annealing เสมอ", unit: "cycles", tone: "blue", visualKey: "CyclerVisual" },
      { id: "agarose-gel-tank", name: "อ่างแยกเจลไฟฟ้า", role: "อ่างสำหรับใส่เจลอะกาโรสภายใต้สนามแม่เหล็กกระแสตรงกระตุ้นดีเอ็นเอเคลื่อนที่", note: "ระมัดระวังอันตรายจากไฟฟ้าและตรวจเช็คขั้วบวกบวกให้ถูกต้อง", unit: "V", tone: "emerald", visualKey: "TankVisual" },
      { id: "uv-transilluminator", name: "เครื่องถ่ายสแกนผลแบนด์ดีเอ็นเอ", role: "ฉายแสงยูวีหรือแสงสีฟ้าเร่งความเรืองแสงของสารย้อมแทรกเพื่อหาแบนด์", note: "สวมแผงป้องกันดวงตาและผิวหนังจากรังสีแสงจำลองเสมอ", unit: "counts", tone: "violet", visualKey: "ImagerVisual" },
    ],
    steps: [
      { num: 1, title: "ป้อนส่วนผสมในหลอด", desc: "ผสมแม่แบบดีเอ็นเอ ไพรเมอร์ นิวคลีโอไทด์ และเอนไซม์ Taq ทนความร้อน", iconKey: "FileText", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "ตั้งวงจรอุณหภูมิพีซีอาร์", desc: "ตั้งโปรแกรมรอบความร้อนสะสม สังเกตปริมาณดีเอ็นเอขึ้นแบบทวีคูณ", iconKey: "Sliders", color: "text-purple-500", bg: "bg-purple-50" },
      { num: 3, title: "หยอดเจลและรันไฟฟ้า", desc: "ดูดชิ้นงานหยอดลงถังวุ้นอะกาโรสแล้วเปิดกระแสไฟฟ้าเหนี่ยวนำ", iconKey: "Zap", color: "text-emerald-500", bg: "bg-emerald-50" },
      { num: 4, title: "อ่านผลและเทียบสายมาตรฐาน", desc: "ถ่ายภาพอ่านแท่งริ้วดีเอ็นเอเทียบกับ DNA Ladder เพื่อประเมินขนาดคู่เบส bp", iconKey: "Eye", color: "text-amber-500", bg: "bg-amber-50" },
    ],
  }),
  "crispr-gene-editing": createDraftUniversityDetails({
    title: "CRISPR-Cas9 Gene Editing",
    category: "Biology",
    focus: "การตัดแต่งจีโนมด้วย guide RNA และเอนไซม์ Cas9",
    equation: "P<sub>cut</sub> = f(gRNA complementarity, PAM presence)",
    xTitle: "ระดับความเข้ากันได้ของเบส gRNA (%)",
    yTitle: "ประสิทธิภาพการชี้เป้าตัดดีเอ็นเอ (Editing Efficiency)",
    pathColor: "#059669",
    theoryDescription: "ระบบ CRISPR-Cas9 ใช้ในการดัดแปลงพันธุกรรมขั้นสูงโดยอาศัย guide RNA (gRNA) ที่มีลำดับเบสจำเพาะในการนำทางเอนไซม์ตัดสายดีเอ็นเอ Cas9 ไปยังตำแหน่งเป้าหมายบนสายจีโนม โดยต้องมีลำดับเบส PAM (Protospacer Adjacent Motif) ถัดจากเป้าหมายเพื่อเหนี่ยวนำให้ Cas9 เปิดสายคู่และทำการตัดสายคู่ดีเอ็นเอ",
    equationLabels: [
      { label: "Pcut", desc: "ความน่าจะเป็นในการเข้าคู่และตัดสายโมเลกุลสำเร็จ", color: "text-emerald-500" },
      { label: "gRNA", desc: "สายอาร์เอ็นเอนำทางชี้เป้าความยาว 20 เบสเบื้องต้น", color: "text-rose-500" },
      { label: "PAM", desc: "ลำดับเบสสั้นสามตัวจำเพาะ 5'-NGG-3' ที่เหนี่ยวนำ Cas9", color: "text-blue-500" },
    ],
    overviewBullets: [
      "ศึกษาการสร้างสายนำทาง gRNA ที่จำเพาะเจาะจงกับยีนเป้าหมายการดัดแปลง",
      "วิเคราะห์บทบาทของลำดับเบส PAM ต่อความเร่งในการตรวจค้นและเข้าตัดของ Cas9",
      "สังเกตทางเลือกการตอบสนองซ่อมแซมของเซลล์หลังโดนตัดสายคู่อะตอม",
    ],
    learningObjectives: [
      "อธิบายกลไกอันตรกิริยาระหว่างโปรตีน Cas9 ลำดับนำทาง gRNA และ DNA ได้",
      "ประเมินโอกาสการเกิดการตัดผิดตำแหน่ง (Off-target) และวิธีการเลือกลำดับเบสที่ดีได้",
      "เปรียบเทียบความแตกต่างระหว่างการซ่อมแซมแบบ NHEJ และ HDR เพื่อตัดแต่งยีนได้",
    ],
    equipments: [
      { id: "sequence-designer", name: "โปรแกรมวิเคราะห์ลำดับยีน", role: "ใช้ตรวจหาและเปรียบเทียบชิ้นส่วนยีนเพื่อเลือกลำดับเบสของไพรเมอร์นำทาง", note: "ประเมินความเสี่ยงเกิดจุดตัดผิดเป้าหมายให้ต่ำที่สุด", unit: "bp", tone: "emerald", visualKey: "SoftwareVisual" },
      { id: "cas9-complex", name: "ชุดเครื่องมือ Cas9-gRNA", role: "ชุดสารละลายโปรตีน Cas9 รวมกับสาย gRNA ที่เตรียมสำเร็จ", note: "เก็บบ่มอุณหภูมิต่ำเพื่อรักษาสภาพความเสถียรของโปรตีน", unit: "μg", tone: "blue", visualKey: "ReagentVisual" },
      { id: "cell-sequencer", name: "เครื่องวิเคราะห์ลำดับเบส", role: "อ่านผลลำดับนิวคลีโอไทด์หลังตัดแต่งเพื่อตรวจเช็คผลการเปลี่ยนสาย", note: "ระบุตำแหน่งการสอดแทรกหรือขาดหายของยีน", unit: "sequencing", tone: "violet", visualKey: "SequencerVisual" },
    ],
    steps: [
      { num: 1, title: "เลือกลำดับชี้เป้า", desc: "วิเคราะห์แผนที่ยีนของโฮสต์เซลล์และเลือกลำดับเป้าหมายพร้อมตรวจสอบสัญลักษณ์ PAM", iconKey: "FileText", color: "text-emerald-500", bg: "bg-emerald-50" },
      { num: 2, title: "สังเคราะห์สายกึ่งผสม", desc: "ออกแบบ gRNA ชนิดเข้าคู่สูง สังเคราะห์ประกอบร่างกับเอนไซม์ Cas9", iconKey: "Settings", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 3, title: "นำส่งเข้าเซลล์เจ้าบ้าน", desc: "ฉีด CRISPR Complex เข้าสู่เซลล์ สังเกตการเข้าจับคู่ตัดสายคู่ดีเอ็นเอ", iconKey: "Zap", color: "text-rose-500", bg: "bg-rose-50" },
      { num: 4, title: "สแกนผลสัมฤทธิ์", desc: "เพาะเลี้ยงและสแกนอ่านการซ่อมแซมของเซลล์ ตรวจระดับการหยุดทำงานของยีน", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" },
    ],
  }),
  "recombinant-dna-transformation": createDraftUniversityDetails({
    title: "Recombinant DNA & Transformation",
    category: "Biology",
    focus: "การสอดแทรกยีนเข้าพลาสมิดและการช็อกความร้อนแบคทีเรีย",
    equation: "Efficiency = colonies count / DNA amount (&mu;g)",
    xTitle: "ระยะเวลาช็อกความร้อนที่ 42°C (วินาที)",
    yTitle: "จำนวนโคโลนีแบคทีเรียที่รอดชีวิตบนจานเพาะเชื้อ",
    pathColor: "#34d399",
    theoryDescription: "เทคโนโลยีดีเอ็นเอสายผสมเริ่มจากการตัดยีนเป้าหมายและพลาสมิดพาหะ (Vector) ด้วยเอนไซม์ตัดจำเพาะที่มีมุมตัดเข้าคู่กัน แล้วเชื่อมด้วยเอนไซม์ดีเอ็นเอไลเกส จากนั้นทำให้แบคทีเรียเจ้าบ้านกลายเป็นเซลล์ที่พร้อมรับดีเอ็นเอ (Competent Cells) ด้วยสารเคมีแคลเซียมคลอไรด์และช็อกความร้อนเพื่อเพิ่มพรูความกว้างรูบนผนังเซลล์เหนี่ยวนำพลาสมิดเข้าเซลล์สำเร็จ",
    equationLabels: [
      { label: "Efficiency", desc: "อัตราส่วนประสิทธิภาพรวมในการแปลงพันธุ์แบคทีเรียเข้าสู่เซลล์สำเร็จ", color: "text-emerald-500" },
      { label: "colonies", desc: "จำนวนกลุ่มของแบคทีเรียที่รอดชีวิตเติบโตบนวุ้นเพาะยาปฏิชีวนะ", color: "text-blue-500" },
      { label: "DNA amount", desc: "น้ำหนักรวมปริมาณดีเอ็นเอพลาสมิดที่นำมาผสมทำปฏิกิริยา", color: "text-purple-500" },
    ],
    overviewBullets: [
      "จำลองการสอดแทรกยีนสีเขียวเรืองแสง GFP เข้าสู่เวกเตอร์พลาสมิด pGLO",
      "ศึกษาขั้นตอนเพิ่มการรับดีเอ็นเอของเซลล์ E. coli ผ่านระบบช็อกความร้อน Heat Shock",
      "คัดเลือกโคโลนีแบคทีเรียที่ได้รับพลาสมิดสำเร็จบนวุ้นเลี้ยงเชื้อยาต้านแอมพิซิลลิน",
    ],
    learningObjectives: [
      "อธิบายกลไกทางฟิสิกส์เคมีของการทำเซลล์ให้พร้อมรับและการช็อกความร้อนได้",
      "วิเคราะห์และคำนวณค่าประสิทธิภาพการแปลงพันธุ์แบคทีเรียต่อปริมาณดีเอ็นเอได้",
      "ระบุความสำคัญของการใช้ Marker เช่น ยีนต้านยาปฏิชีวนะในการคัดเลือกแบคทีเรียได้",
    ],
    equipments: [
      { id: "enzymes-kit", name: "ชุดเอนไซม์คัดตัดต่อยีน", role: "ประกอบด้วยเอนไซม์ EcoRI และ DNA Ligase สำหรับตัดและเชื่อมต่อสายดีเอ็นเอ", note: "รักษาอุณหภูมิบ่มปฏิกิริยาที่ 37 องศาเพื่อประสิทธิภาพสูงสุด", unit: "units", tone: "violet", visualKey: "ReagentVisual" },
      { id: "heatshock-bath", name: "อ่างน้ำร้อนปรับควบคุมอุณหภูมิ", role: "ควบคุมอุณหภูมิน้ำร้อนคงที่ 42 องศาเซลเซียส สำหรับรันขั้นตอนการช็อกความร้อน", note: "จับเวลาอย่างเข้มงวดความเบี่ยงเบนเสี้ยววินาทีมีผลต่ออัตราผ่าน", unit: "s", tone: "rose", visualKey: "WaterBathVisual" },
      { id: "agar-dishes", name: "จานเพาะเชื้อวุ้นผสมตัวคัดกรอง", role: "จานอาหารเพาะ LB วุ้นคละยาปฏิชีวนะ Ampicillin และน้ำตาลอาหรับ", note: "ปิดฝาให้มิดชิดและบ่มอุณหภูมิ 37 องศาในตู้อบ", unit: "plates", tone: "emerald", visualKey: "DishVisual" },
    ],
    steps: [
      { num: 1, title: "ตัดต่อยีนเป้าหมาย", desc: "ใช้เอนไซม์ตัดจำเพาะและ Ligase เพื่อประกบเชื่อมยีน GFP เข้ากับพลาสมิดพาหะ", iconKey: "Scissors", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "บ่ม Competent Cell", desc: "นำแบคทีเรียเจ้าบ้าน E. coli บ่มร่วมกับสารเคมี CaCl₂ และพลาสมิดบนน้ำแข็ง", iconKey: "Snowflake", color: "text-cyan-500", bg: "bg-cyan-50" },
      { num: 3, title: "ทำปฏิกิริยาช็อกความร้อน", desc: "นำหลอดแบคทีเรียแช่ในอ่างน้ำร้อน 42 องศาเป็นเวลา 45 วินาทีแล้วย้ายกลับน้ำแข็งทันที", iconKey: "Thermometer", color: "text-rose-500", bg: "bg-rose-50" },
      { num: 4, title: "ทาวุ้นเพาะเชื้อนับยอด", desc: "ทาสารเพาะเลี้ยงลงจานวุ้นคัดกรอง บ่มข้ามคืน แล้วนับโคโลนีเรืองแสงใต้ไฟ UV", iconKey: "Eye", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "flow-cytometry-cycle": createDraftUniversityDetails({
    title: "Flow Cytometry Cell Analysis",
    category: "Biology",
    focus: "การวิเคราะห์แสงกระเจิง แสงเรืองแสง และประชากรเซลล์",
    equation: "Fluorescence intensity &prop; DNA content",
    xTitle: "ระดับความเข้มแสงเรืองแสงดีเอ็นเอ (DNA Content)",
    yTitle: "จำนวนนับเหตุการณ์เซลล์เดี่ยว (Cell Count)",
    pathColor: "#0284c7",
    theoryDescription: "เครื่องโฟลว์ไซโตเมทรี (Flow Cytometry) ลำเลียงเซลล์เดี่ยวในของเหลวผ่านลำแสงเลเซอร์ แสงกระเจิงมุมต่ำ (FSC) บ่งบอกขนาดเซลล์ แสงกระเจิงมุมฉาก (SSC) บ่งบอกความซับซ้อนภายในเซลล์ ส่วนการย้อมสีเรืองแสงดีเอ็นเอช่วยวิเคราะห์ปริมาณสารพันธุกรรมภายในเซลล์เพื่อบ่งชี้ว่าเซลล์อยู่ระยะใดของวัฏจักรเซลล์ (G1 vs S vs G2/M)",
    equationLabels: [
      { label: "FSC", desc: "ความกว้างแสงกระเจิงมุมข้างหน้าแสดงลักษณะและขนาดผิวของเซลล์", color: "text-blue-500" },
      { label: "SSC", desc: "ความเข้มแสงกระเจิงมุมข้างฉากแสดงระดับความหนาแน่นสารภายในเซลล์", color: "text-purple-500" },
    ],
    overviewBullets: [
      "ศึกษาทฤษฎีระบบของไหลรวมศูนย์แบบ Hydrodynamic Focusing ในการจัดเรียงแถวเซลล์เดี่ยว",
      "วิเคราะห์สัดส่วนเซลล์มะเร็งย้อมสีเรืองแสงในระยะต่าง ๆ ของวัฏจักรเซลล์",
      "จำแนกเซลล์เม็ดเลือดขาวหลายชนิดบนแผนภูมิ Scatter Plot สองพิกัดร่วมกัน",
    ],
    learningObjectives: [
      "อธิบายบทบาทของสัญญาณแสงกระเจิง FSC/SSC และแสงเรืองแสงฟลูออเรสเซนส์ได้",
      "ตีความสเปกตรัมฮิสโตแกรมวิเคราะห์สัดส่วนยีนเพื่อแบ่งแยกเฟส G1, S และ G2/M ได้",
      "สร้างและแยกขอบเขตประชากรเซลล์จำเพาะ (Gating) บนกราฟวิเคราะห์ข้อมูลได้ถูกต้อง",
    ],
    equipments: [
      { id: "flow-cytometer", name: "เครื่องโฟลว์ไซโตมิเตอร์", role: "ปั๊มส่งของเหลวเซลล์เดี่ยวเรียงเส้นฉายเลเซอร์วัดสัญญาณแสง", note: "ต้องรักษาอัตราปั๊มให้สม่ำเสมอเพื่อไม่ให้เกิดการกระจุกของเซลล์", unit: "fluidics", tone: "blue", visualKey: "InstrumentVisual" },
      { id: "staining-dye", name: "สีย้อมดีเอ็นเอเรืองแสง", role: "สารเรืองแสงจำเพาะเกาะรอยแยกโมเลกุลดีเอ็นเอ เช่น Propidium Iodide", note: "ระวังสารเคมีก่อมะเร็งสวมถุงมือป้องกันทุกครั้งที่บ่มย้อม", unit: "μL", tone: "rose", visualKey: "ReagentVisual" },
      { id: "data-gate-program", name: "ซอฟต์แวร์ประมวลผลข้อมูล", role: "พล็อตข้อมูลเซลล์เมตริกซ์จำลอง ขอบเขตและรายงานสถิติแยกแยะประชากร", note: "ลบเม็ดฝุ่นสัญญาณขยะออกก่อนการจัดกลุ่มประชากร", unit: "plots", tone: "violet", visualKey: "SoftwareVisual" },
    ],
    steps: [
      { num: 1, title: "บ่มย้อมสีเรืองแสง", desc: "เก็บเซลล์ตัวอย่างมะเร็ง แปลงสภาพ และย้อมด้วยสี Propidium Iodide", iconKey: "FileText", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "ป้อนไหลสแกนเลเซอร์", desc: "นำตัวอย่างผ่านท่อของเหลวให้เรียงเดี่ยว ยิงลำแสงเลเซอร์ขวางทิศทางไหล", iconKey: "Zap", color: "text-cyan-500", bg: "bg-cyan-50" },
      { num: 3, title: "ตรวจจับกระเจิงแสง", desc: "บันทึกระดับกระเจิงแสง FSC, SSC และความสว่างการเรืองแสงในเครื่องรับสัญญาณ", iconKey: "Eye", color: "text-violet-500", bg: "bg-violet-50" },
      { num: 4, title: "สร้างประชากรขอบเขต", desc: "สร้างหน้าต่างกั้นขอบเขตประชากรเซลล์ วัดสัดส่วนยอดนับ G1 (2n) และ G2 (4n)", iconKey: "LineChart", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "western-blotting": createDraftUniversityDetails({
    title: "Western Blotting Protein Detection",
    category: "Biology",
    focus: "การแยกโปรตีนตามขนาดและการตรวจจับด้วยแอนติบอดีจำเพาะ",
    equation: "Log(MW) &prop; -Migration distance",
    xTitle: "ระยะทางการเคลื่อนที่แยกตัวบนเมมเบรน (mm)",
    yTitle: "ความเข้มแสงสัญญาณแถบโปรตีน (Band Intensity)",
    pathColor: "#3b82f6",
    theoryDescription: "เวสเทิร์นบลอตติง (Western Blotting) หรืออิมมูโนบลอตติง เป็นวิธีแยกแยะโปรตีนจำเพาะจากของเหลวสกัดเซลล์ โดยเริ่มจากการนำโปรตีนมาแปลงสภาพและแยกตามน้ำหนักโมเลกุลด้วย SDS-PAGE จากนั้นทำการโอนย้ายไปยังแผ่นเมมเบรนและใช้แอนติบอดีปฐมภูมิเข้าไปจับโปรตีนเป้าหมาย ก่อนนำแอนติบอดีทุติยภูมิที่ติดเอนไซม์เรืองแสงเข้ามาทำปฏิกิริยาเคมีส่องสว่างบอกตำแหน่ง",
    equationLabels: [
      { label: "MW", desc: "น้ำหนักโมเลกุลน้ำหนักเชิงมวลโปรตีนเป้าหมาย (Molecular Weight)", color: "text-blue-500" },
      { label: "Log(MW)", desc: "ความสัมพันธ์ล็อกระยะเลื่อนแยกของขนาดโปรตีนบนเจลโพลีอะคริลาไมด์", color: "text-purple-500" },
    ],
    overviewBullets: [
      "ศึกษาการแปลงรูปสภาพธรรมชาติของโปรตีนด้วยสารซักฟอกประจุลบ SDS",
      "จำลองการถ่ายโอนแถบโปรตีนจากแผ่นเจลอ่อนไปยังแผ่นเมมเบรน PVDF แน่นอน",
      "สังเกตปฏิกิริยาการจับกลุ่มแอนติบอดีปฐมภูมิและทุติยภูมิพร้อมตัวตรวจวัดแสง",
    ],
    learningObjectives: [
      "อธิบายกระบวนการและทฤษฎีกลไกการแยกโอนย้ายและกระตุ้นเรืองแสงโปรตีนได้",
      "ประเมินและหาน้ำหนักโมเลกุลของโปรตีนเป้าหมายเมื่อเทียบกับวงมาตรฐานได้",
      "อธิบายความสำคัญของการทำ Blocking เมมเบรนและเปรียบเทียบผลเพื่อลดสัญญาณรบกวนได้",
    ],
    equipments: [
      { id: "sdspage-vertical-tank", name: "ชุดเครื่องรันเจลแนวดิ่ง", role: "เดินกระแสไฟฟ้าผ่านเจลโพลีอะคริลาไมด์แยกโปรตีนตามขนาดน้ำหนัก", note: "เช็คการประกอบขอบกระจกไม่ให้เจลแห้งหรือรั่วซึมระหว่างรัน", unit: "gel", tone: "blue", visualKey: "TankVisual" },
      { id: "electrotransfer-cell", name: "เครื่องถ่ายโอนไฟฟ้ากระแสตรง", role: "ถ่ายโปรตีนออกจากเจลแนบสนิทเข้าแผ่นกระดาษเมมเบรน PVDF พิเศษ", note: "จัดชั้นแซนด์วิชเมมเบรนหลีกเลี่ยงการเกิดฟองอากาศด้านใน", unit: "blot", tone: "violet", visualKey: "TransferVisual" },
      { id: "chemiluminescent-imager", name: "กล่องเครื่องถ่ายบันทึกแสงเคมี", role: "บันทึกแสงสว่างเรืองแสงเคมีของเอนไซม์ตัวจับบอกแบนด์เป้าหมาย", note: "ปรับแต่งระยะความคงอยู่ของแสงเพื่อไม่ให้เกิดสัญญาณโอเวอร์ฟลู", unit: "intensity", tone: "rose", visualKey: "ImagerVisual" },
    ],
    steps: [
      { num: 1, title: "รันเจลแยกขนาดโปรตีน", desc: "นำตัวอย่างโปรตีนสารสกัดผสมเบฟเฟอร์แปลงสภาพรันบน SDS-PAGE แนวดิ่ง", iconKey: "TrendingUp", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "ประกอบเซลล์โอนย้าย", desc: "ประกบเจลกับแผ่น PVDF ในตลับรับไฟฟ้า ถ่ายโปรตีนข้ามเจลเข้าจับเมมเบรน", iconKey: "Sliders", color: "text-purple-500", bg: "bg-purple-50" },
      { num: 3, title: "บ่มแอนติบอดีคัดกรอง", desc: "บล็อกเมมเบรนด้วยนมแห้งจำลอง บ่มแอนติบอดีขั้นหนึ่งและขั้นสองเฉพาะ", iconKey: "Hourglass", color: "text-rose-500", bg: "bg-rose-50" },
      { num: 4, title: "ถ่ายแสงเคมีนับแบนด์", desc: "เทน้ำยาเร่งปฏิกิริยาเรืองแสง ถ่ายภาพความเข้มแบนด์เทียบกับวงควบคุมน้ำหนัก", iconKey: "Eye", color: "text-emerald-500", bg: "bg-emerald-50" },
    ],
  }),
  "metabolic-pathway-flux": createDraftUniversityDetails({
    title: "Metabolic Pathway Flux Analysis",
    category: "Biology",
    focus: "วิถีเมแทบอลิซึมและการเคลื่อนไหวอัตราฟลักซ์ทางชีวภาพ",
    equation: "d[C]/dt = &Sigma;v<sub>in</sub> - &Sigma;v<sub>out</sub> = 0 at steady state",
    xTitle: "สภาวะการป้อนสารอาหาร (Glucose vs Fatty Acids)",
    yTitle: "อัตราฟลักซ์ความเร็วในวิถีเมแทบอลิซึม (Flux Rate ในหน่วย mmol/g/h)",
    pathColor: "#10b981",
    theoryDescription: "การวิเคราะห์ฟลักซ์ในวิถีเมแทบอลิซึม (Metabolic Pathway Flux) ศึกษาความเร็วและทิศทางการเปลี่ยนรูปของสารอาหารในกระบวนการหายใจระดับเซลล์และการเติบโต โดยภายใต้สถานะคงตัว (Steady State) อัตราการสร้างสารเคมีขั้นกลาง (Intermediate) ใด ๆ จะเท่ากับอัตราการใช้ไปพอดี ช่วยให้เราจำลองพฤติกรรมการสลับสับเปลี่ยนเส้นทางเมแทบอลิซึมของเซลล์เมื่อตัวกระตุ้นเปลี่ยน",
    equationLabels: [
      { label: "d[C]/dt", desc: "อัตราการเปลี่ยนแปลงปริมาณความเข้มข้นสารขั้นกลางเทียบเวลา", color: "text-emerald-500" },
      { label: "Σvin", desc: "ผลรวมความเร็วปฏิกิริยาทุกขั้นทางเคมีที่สร้างสารเคมีนี้เข้ามา", color: "text-blue-500" },
      { label: "Σvout", desc: "ผลรวมความเร็วปฏิกิริยาทุกขั้นทางเคมีชีวภาพที่สลายตัวสารนี้ไปต่อ", color: "text-rose-500" },
    ],
    overviewBullets: [
      "ศึกษาพฤติกรรมโครงข่ายวิถีไกลโคไลซิส ควบคู่ไปกับวัฏจักร TCA คอขวดสลายตัว",
      "สังเกตทิศทางและปริมาณฟลักซ์ปฏิกิริยาเมื่อมีสภาวะความต่างความเข้มออกซิเจน",
      "ศึกษาการน็อคเอาต์ยีนเอนไซม์ต่อการสับเปลี่ยนวิถีพลังงานทดแทนของเซลล์",
    ],
    learningObjectives: [
      "อธิบายหลักสมดุลมวลสารและสมมติฐานสภาวะคงตัว (Steady State) ในชีวเคมีได้",
      "วิเคราะห์และระบุปฏิกิริยาที่เป็นตัวควบคุมควบคุมอัตราเร็วหลักในโครงข่ายได้",
      "วิเคราะห์แนวทางการตัดต่อยีนเมแทบอลิซึมเพื่อผลผลิตเชิงอุตสาหกรรมชีวภาพได้",
    ],
    equipments: [
      { id: "metabolic-simulator", name: "โปรแกรมจำลองวิถีพลวัต", role: "โปรแกรมจำลองปฏิกิริยาฟลักซ์ดุลสมดุลตามเงื่อนไข Constraint-Based", note: "กำหนดข้อจำกัดอัตราป้อนขาเข้าให้สอดคล้องข้อมูลทดลองจริง", unit: "model", tone: "emerald", visualKey: "SoftwareVisual" },
      { id: "flux-visualizer", name: "เครื่องแสดงผลแผนภาพอัตราเร็ว", role: "พล็อตแสดงเส้นทางความหนาแน่นและทิศทางการเคลื่อนของสารในโมเดลเซลล์", note: "ปรับแต่งความหนาของเส้นลูกศรตามระดับปริมาณกระแสฟลักซ์", unit: "flux", tone: "blue", visualKey: "NetworkVisual" },
    ],
    steps: [
      { num: 1, title: "ป้อนชนิดสารอาหาร", desc: "กำหนดปริมาณการป้อนกลูโคสหรือสารอาหารคาร์บอนขาเข้าระบบจำลอง", iconKey: "FileText", color: "text-blue-500", bg: "bg-blue-50" },
      { num: 2, title: "ปรับสภาวะออกซิเจน", desc: "ปรับอัตราระบายแก๊สและออกซิเจนเพื่อจำลองการสลายพลังงานแบบใช้อากาศหรือไม่ใช้", iconKey: "Sliders", color: "text-emerald-500", bg: "bg-emerald-50" },
      { num: 3, title: "รันจำลอง Flux", desc: "รันประมวลผลคำนวณและติดตามตัวแปรอัตราเร็ว v ในเส้นทางย่อยแบบเรียลไทม์", iconKey: "Zap", color: "text-rose-500", bg: "bg-rose-50" },
      { num: 4, title: "วิเคราะห์อัตราการไหล", desc: "บันทึกและวิเคราะห์การกระจายตัวของฟลักซ์คาร์บอน เพื่อสังเกตจุดเปลี่ยนพลังงานหลัก", iconKey: "LineChart", color: "text-purple-500", bg: "bg-purple-50" },
    ],
  }),
};

const draftElementaryScienceLabDetails: Record<string, LabDetailData> = {
  "push-pull-forces": createDraftElementaryScienceDetails({
    title: "Push & Pull Forces",
    focus: "แรงผลัก แรงดึง ทิศทางของแรง และการเคลื่อนที่",
    equation: "push / pull -> change in motion",
    xTitle: "แรงที่ใช้",
    yTitle: "การเคลื่อนที่",
    pathColor: "#2563eb",
    theoryDescription: "แรงคือการผลักหรือดึงที่ทำให้วัตถุเริ่มเคลื่อนที่ หยุด เปลี่ยนทิศ หรือเปลี่ยนความเร็ว เด็กประถมควรเริ่มจากการสังเกตทิศทางของแรงและผลที่เกิดขึ้นกับวัตถุในสถานการณ์ใกล้ตัว เช่น กล่อง ลูกบอล หรือรถของเล่น",
    equationLabels: [
      { label: "push", desc: "แรงที่ดันวัตถุออกจากผู้กระทำ", color: "text-blue-500" },
      { label: "pull", desc: "แรงที่ดึงวัตถุเข้าหาผู้กระทำ", color: "text-violet-500" },
      { label: "motion", desc: "การเปลี่ยนตำแหน่ง ความเร็ว หรือทิศทาง", color: "text-emerald-500" },
    ],
  }),
  "light-and-shadows": createDraftElementaryScienceDetails({
    title: "Light and Shadows",
    focus: "แสง การเดินทางเป็นเส้นตรง และการเกิดเงา",
    equation: "light + object -> shadow",
    xTitle: "ระยะจากแหล่งกำเนิดแสง",
    yTitle: "ขนาดเงา",
    pathColor: "#f59e0b",
    theoryDescription: "แสงเดินทางเป็นเส้นตรง เมื่อวัตถุทึบแสงขวางทางแสงจะเกิดเงาด้านหลัง ขนาดและความคมของเงาเปลี่ยนได้ตามตำแหน่งของแหล่งกำเนิดแสง วัตถุ และฉากรับเงา",
    equationLabels: [
      { label: "light", desc: "แหล่งกำเนิดแสงหรือทิศทางของแสง", color: "text-amber-500" },
      { label: "object", desc: "วัตถุที่ขวางทางแสง", color: "text-slate-500" },
      { label: "shadow", desc: "บริเวณที่แสงไปไม่ถึงหรือไปถึงน้อย", color: "text-blue-500" },
    ],
  }),
  "sound-vibrations": createDraftElementaryScienceDetails({
    title: "Sound Vibrations",
    focus: "การสั่น ความดัง ความสูงต่ำ และการเกิดเสียง",
    equation: "vibration -> sound",
    xTitle: "ความเร็วการสั่น",
    yTitle: "เสียงที่ได้ยิน",
    graphType: "curve",
    pathColor: "#0ea5e9",
    theoryDescription: "เสียงเกิดจากการสั่นของวัตถุและต้องอาศัยตัวกลางในการเดินทาง การสั่นแรงมักทำให้เสียงดังขึ้น ส่วนการสั่นถี่ขึ้นมักทำให้เสียงสูงขึ้น แล็บนี้ช่วยให้เด็กเห็นเสียงเป็นหลักฐานจากการสั่น ไม่ใช่สิ่งล่องลอยที่จับต้องไม่ได้",
    equationLabels: [
      { label: "vibration", desc: "การสั่นของแหล่งกำเนิดเสียง", color: "text-sky-500" },
      { label: "loudness", desc: "ระดับความดังที่สัมพันธ์กับความแรงของการสั่น", color: "text-amber-500" },
      { label: "pitch", desc: "เสียงสูงหรือต่ำที่สัมพันธ์กับความถี่", color: "text-violet-500" },
    ],
  }),
  "simple-circuits": createDraftElementaryScienceDetails({
    title: "Simple Circuits",
    focus: "วงจรปิด แหล่งพลังงาน สวิตช์ และหลอดไฟ",
    equation: "closed circuit -> current flows",
    xTitle: "สถานะวงจร",
    yTitle: "ความสว่าง",
    pathColor: "#eab308",
    theoryDescription: "วงจรไฟฟ้าอย่างง่ายต้องมีเส้นทางปิดให้กระแสไฟฟ้าไหลจากแหล่งพลังงาน ผ่านอุปกรณ์ แล้วกลับครบวงจร ถ้าวงจรขาดหรือสวิตช์เปิด หลอดไฟจะไม่ติด แนวคิดนี้ช่วยปูพื้นฐานเรื่องไฟฟ้าอย่างปลอดภัย",
    equationLabels: [
      { label: "battery", desc: "แหล่งพลังงานของวงจร", color: "text-amber-500" },
      { label: "closed circuit", desc: "เส้นทางไฟฟ้าที่ต่อครบ", color: "text-emerald-500" },
      { label: "bulb", desc: "อุปกรณ์ที่แสดงผลด้วยแสง", color: "text-blue-500" },
    ],
  }),
  "floating-and-sinking": createDraftElementaryScienceDetails({
    title: "Floating and Sinking",
    focus: "การลอย การจม รูปร่าง วัสดุ และความหนาแน่นเบื้องต้น",
    equation: "float or sink depends on material and shape",
    xTitle: "ชนิดวัตถุ",
    yTitle: "ระดับการลอย",
    graphType: "scatter",
    pathColor: "#14b8a6",
    theoryDescription: "วัตถุลอยหรือจมไม่ได้ขึ้นกับน้ำหนักอย่างเดียว แต่ขึ้นกับวัสดุ รูปร่าง และปริมาตรที่แทนที่น้ำ เด็กประถมควรได้เปรียบเทียบวัตถุหลายชนิดและสังเกตว่าการเปลี่ยนรูปร่างอาจทำให้ผลการลอยตัวเปลี่ยนได้",
    equationLabels: [
      { label: "material", desc: "ชนิดของวัตถุที่มีผลต่อการลอยหรือจม", color: "text-teal-500" },
      { label: "shape", desc: "รูปร่างที่มีผลต่อปริมาตรและการแทนที่น้ำ", color: "text-blue-500" },
      { label: "water", desc: "ตัวกลางที่ใช้เปรียบเทียบการลอยตัว", color: "text-cyan-500" },
    ],
  }),
  "magnet-exploration": createDraftElementaryScienceDetails({
    title: "Magnet Exploration",
    focus: "แรงแม่เหล็ก ขั้วเหนือ-ใต้ และวัสดุที่แม่เหล็กดูดได้",
    equation: "opposite poles attract, same poles repel",
    xTitle: "ระยะห่าง",
    yTitle: "แรงแม่เหล็ก",
    pathColor: "#dc2626",
    theoryDescription: "แม่เหล็กมีแรงที่ออกฤทธิ์ได้แม้ไม่สัมผัสวัตถุโดยตรง ขั้วต่างกันดึงดูดกัน ขั้วเหมือนกันผลักกัน และแม่เหล็กดึงดูดวัสดุบางชนิด เช่น เหล็ก ได้ดีกว่าวัสดุอื่น แล็บนี้ช่วยให้เด็กแยกการทำนายกับหลักฐานจากการทดลอง",
    equationLabels: [
      { label: "N/S", desc: "ขั้วเหนือและขั้วใต้ของแม่เหล็ก", color: "text-rose-500" },
      { label: "attract", desc: "แรงดึงดูดระหว่างขั้วต่างกันหรือวัสดุแม่เหล็ก", color: "text-blue-500" },
      { label: "repel", desc: "แรงผลักระหว่างขั้วเหมือนกัน", color: "text-violet-500" },
    ],
  }),
  "states-of-matter": createDraftElementaryScienceDetails({
    title: "States of Matter",
    focus: "ของแข็ง ของเหลว แก๊ส และการเปลี่ยนสถานะ",
    equation: "solid <-> liquid <-> gas",
    xTitle: "อุณหภูมิ",
    yTitle: "สถานะของสาร",
    graphType: "custom",
    pathColor: "#9333ea",
    theoryDescription: "สสารมีสถานะพื้นฐาน เช่น ของแข็ง ของเหลว และแก๊ส ของแข็งมีรูปร่างค่อนข้างคงที่ ของเหลวไหลและเปลี่ยนรูปร่างตามภาชนะ ส่วนแก๊สกระจายเต็มพื้นที่ การเพิ่มหรือลดความร้อนอาจทำให้สารเปลี่ยนสถานะได้",
    equationLabels: [
      { label: "solid", desc: "ของแข็งที่มีรูปร่างชัดเจน", color: "text-violet-500" },
      { label: "liquid", desc: "ของเหลวที่ไหลและเปลี่ยนรูปร่างตามภาชนะ", color: "text-blue-500" },
      { label: "gas", desc: "แก๊สที่กระจายตัวในพื้นที่", color: "text-emerald-500" },
    ],
  }),
  "mixing-and-separating": createDraftElementaryScienceDetails({
    title: "Mixing and Separating",
    focus: "สารผสมและวิธีแยกสารอย่างง่าย",
    equation: "mixture -> separation method",
    xTitle: "ชนิดสารผสม",
    yTitle: "วิธีแยกที่เหมาะสม",
    graphType: "custom",
    pathColor: "#64748b",
    theoryDescription: "สารผสมเกิดจากวัสดุหลายอย่างรวมกันโดยไม่จำเป็นต้องกลายเป็นสารใหม่ วิธีแยกสารขึ้นกับสมบัติของส่วนประกอบ เช่น ขนาดเม็ด ความสามารถในการละลาย หรือการถูกแม่เหล็กดูด",
    equationLabels: [
      { label: "mixture", desc: "ของหลายชนิดที่รวมอยู่ด้วยกัน", color: "text-slate-500" },
      { label: "property", desc: "สมบัติที่ใช้เลือกวิธีแยก เช่น ขนาดหรือแม่เหล็ก", color: "text-blue-500" },
      { label: "separate", desc: "การแยกส่วนประกอบออกจากกัน", color: "text-emerald-500" },
    ],
  }),
  "dissolving-solutions": createDraftElementaryScienceDetails({
    title: "Dissolving and Solutions",
    focus: "การละลาย ตัวละลาย ตัวทำละลาย และสารละลาย",
    equation: "solute + solvent -> solution",
    xTitle: "ปริมาณตัวละลาย",
    yTitle: "ระดับการละลาย",
    graphType: "curve",
    pathColor: "#0891b2",
    theoryDescription: "การละลายเกิดเมื่อสารหนึ่งกระจายตัวในตัวทำละลายจนดูเป็นเนื้อเดียวกัน น้ำมักเป็นตัวทำละลายที่พบได้บ่อย อุณหภูมิ การคน และปริมาณสารมีผลต่อความเร็วและปริมาณที่ละลายได้",
    equationLabels: [
      { label: "solute", desc: "สารที่ถูกละลาย เช่น เกลือหรือน้ำตาล", color: "text-cyan-500" },
      { label: "solvent", desc: "สารที่ใช้ละลาย เช่น น้ำ", color: "text-blue-500" },
      { label: "solution", desc: "สารละลายที่ผสมเป็นเนื้อเดียวกัน", color: "text-emerald-500" },
    ],
  }),
  "acids-bases-around-us": createDraftElementaryScienceDetails({
    title: "Acids and Bases Around Us",
    focus: "กรด เบส และอินดิเคเตอร์สีจากของใกล้ตัว",
    equation: "indicator color -> acid/base",
    xTitle: "ชนิดตัวอย่าง",
    yTitle: "สีอินดิเคเตอร์",
    graphType: "scatter",
    pathColor: "#db2777",
    theoryDescription: "กรดและเบสพบได้ในของใช้หรืออาหารบางชนิด แต่การเรียนระดับประถมควรเน้นความปลอดภัยและใช้ตัวอย่างอ่อน ๆ อินดิเคเตอร์สี เช่น น้ำกะหล่ำม่วง ช่วยบอกความแตกต่างของสารโดยสังเกตการเปลี่ยนสี",
    equationLabels: [
      { label: "acid", desc: "สารที่ทำให้อินดิเคเตอร์เปลี่ยนไปทางสีกรด", color: "text-rose-500" },
      { label: "base", desc: "สารที่ทำให้อินดิเคเตอร์เปลี่ยนไปทางสีเบส", color: "text-blue-500" },
      { label: "indicator", desc: "สารที่เปลี่ยนสีเพื่อช่วยสังเกต", color: "text-violet-500" },
    ],
  }),
  "heating-cooling-materials": createDraftElementaryScienceDetails({
    title: "Heating and Cooling Materials",
    focus: "ความร้อน ความเย็น และการเปลี่ยนแปลงของวัสดุ",
    equation: "temperature change -> material change",
    xTitle: "อุณหภูมิ",
    yTitle: "การเปลี่ยนแปลง",
    graphType: "line",
    pathColor: "#f97316",
    theoryDescription: "ความร้อนและความเย็นทำให้วัสดุบางชนิดเปลี่ยนรูปร่าง ขนาด หรือสถานะได้ เช่น น้ำแข็งละลาย น้ำแข็งตัว หรือวัสดุขยายตัวเล็กน้อยเมื่อร้อน แล็บนี้เน้นการสังเกตการเปลี่ยนแปลงที่ปลอดภัยและเปรียบเทียบก่อน-หลัง",
    equationLabels: [
      { label: "heat", desc: "การเพิ่มพลังงานความร้อนให้วัสดุ", color: "text-orange-500" },
      { label: "cool", desc: "การลดพลังงานความร้อนหรือทำให้เย็นลง", color: "text-cyan-500" },
      { label: "change", desc: "ผลที่สังเกตได้ เช่น ละลาย แข็งตัว หรือขยาย", color: "text-emerald-500" },
    ],
  }),
  "physical-chemical-changes": createDraftElementaryScienceDetails({
    title: "Physical vs Chemical Changes",
    focus: "การเปลี่ยนแปลงทางกายภาพและทางเคมีจากหลักฐานง่าย ๆ",
    equation: "new substance evidence -> chemical change",
    xTitle: "ชนิดการเปลี่ยนแปลง",
    yTitle: "หลักฐานที่พบ",
    graphType: "custom",
    pathColor: "#16a34a",
    theoryDescription: "การเปลี่ยนแปลงทางกายภาพมักเปลี่ยนรูปร่าง ขนาด หรือสถานะโดยยังเป็นสารเดิม ส่วนการเปลี่ยนแปลงทางเคมีมีหลักฐานว่าเกิดสารใหม่ เช่น สีเปลี่ยนถาวร ฟอง กลิ่น แสง หรือความร้อน แล็บนี้ช่วยให้เด็กใช้หลักฐานมากกว่าการเดา",
    equationLabels: [
      { label: "physical", desc: "เปลี่ยนรูปร่าง ขนาด หรือสถานะแต่ยังเป็นสารเดิม", color: "text-blue-500" },
      { label: "chemical", desc: "เกิดสารใหม่หรือสมบัติใหม่ที่สังเกตได้", color: "text-emerald-500" },
      { label: "evidence", desc: "หลักฐานที่ใช้แยกชนิดการเปลี่ยนแปลง", color: "text-amber-500" },
    ],
  }),
};

// Main Export Mapping of all lab details
export const labDetails: Record<string, LabDetailData> = {
  "newtons-cooling": coolingDetails,
  "ohms-law": ohmsLawDetails,
  "hookes-law": hookesLawDetails,
  "snells-law": snellsLawDetails,
  "ideal-gas-law": idealGasLawDetails,
  "newtons-second-law": newtonsSecondLawDetails,
  "momentum-conservation": momentumDetails,
  "faradays-law": faradaysLawDetails,
  "bernoullis-principle": bernoullisPrincipleDetails,
  "photoelectric-effect": photoelectricEffectDetails,
  "keplers-laws": keplersLawsDetails,
  "stefan-boltzmann": stefanBoltzmannDetails,
  "acid-base-titration": acidBaseDetails,
  "periodic-table": periodicTableDetails,
  "atmosphere-layers": atmosphereLayersDetails,
  ...foundationExplorerDetails,
  "boyles-law": boylesLawDetails,
  "charles-law": charlesLawDetails,
  "photosynthesis-rate": photosynthesisDetails,
  "mendels-inheritance": mendelianDetails,
  "mitosis-division": mitosisDetails,
  "le-chateliers-principle": leChateliersDetails,
  "beer-lambert-law": beerLambertDetails,
  "hesss-law": hesssLawDetails,
  "galvanic-cell": galvanicCellDetails,
  "chemical-kinetics": chemicalKineticsDetails,
  "solubility-product": solubilityProductDetails,
  "avogadros-law": avogadrosLawDetails,
  "electrolysis-lab": electrolysisDetails,
  "colligative-properties": colligativeDetails,
  "cell-osmosis": cellOsmosisDetails,
  "enzyme-kinetics": enzymeKineticsDetails,
  "dna-extraction": dnaExtractionDetails,
  "cellular-respiration": cellularRespirationDetails,
  "plant-transpiration": plantTranspirationDetails,
  "natural-selection": naturalSelectionDetails,
  "blood-typing": bloodTypingDetails,
  "food-chain": foodChainDetails,
  "heart-rate": heartRateDetails,
  "graphing-lines": graphingLinesDetails,
  "ratio-and-proportion": ratioAndProportionDetails,
  "vector-addition": vectorAdditionDetails,
  "center-and-variability": centerAndVariabilityDetails,
  "curve-fitting": curveFittingDetails,
  "function-builder": functionBuilderDetails,
  ...draftMathLabDetails,
  ...draftElementaryScienceLabDetails,
  ...draftUniversityLabDetails,
};

export const labDetailIds = Object.keys(labDetails);
export const labDetailCount = labDetailIds.length;

const labDetailIdSet = new Set(labDetailIds);

export function hasLabDetails(labId: string) {
  return labDetailIdSet.has(labId);
}

export function getLabDetails(labId: string): LabDetailData | null {
  return labDetails[labId] ?? null;
}
