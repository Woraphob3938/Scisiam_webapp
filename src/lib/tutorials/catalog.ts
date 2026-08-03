import type { ScisiamUserRole } from "@/lib/supabase/database.types";

export const TUTORIAL_IDS = {
  studentGeneral: "general-student-v2",
  teacherGeneral: "general-teacher-v2",
  newtonsCooling: "newtons-cooling-v1",
} as const;

export type TutorialId = (typeof TUTORIAL_IDS)[keyof typeof TUTORIAL_IDS];

export type TutorialActionId =
  | "newton.initial-temperature.changed"
  | "newton.ambient-temperature.changed"
  | "simulation.started"
  | "simulation.paused"
  | "simulation.results-opened";

type TutorialStepBase = {
  id: string;
  selector: string;
  title: string;
  description: string;
  tip?: string;
};

export type TutorialStep =
  | (TutorialStepBase & { kind: "info" })
  | (TutorialStepBase & {
      kind: "action";
      actionId: TutorialActionId;
      labId?: string;
    });

export type TutorialDefinition = {
  id: TutorialId;
  label: string;
  contextLabel: string;
  introTitle: string;
  introDescription: string;
  startPath: string;
  audience: readonly ScisiamUserRole[];
  legacyOnboarding: boolean;
  steps: readonly TutorialStep[];
};

const studentSteps: readonly TutorialStep[] = [
  {
    id: "student-search",
    kind: "info",
    selector: '[data-tour="lab-search"]',
    title: "ค้นหาแล็บ",
    description: "พิมพ์ชื่อหรือคำสำคัญเพื่อหาแล็บที่อยากทดลอง",
  },
  {
    id: "student-filter",
    kind: "info",
    selector: '[data-tour="lab-filters"]',
    title: "เลือกวิชาและระดับชั้น",
    description: "ใช้ตัวกรองเพื่อลดรายการให้ตรงกับบทเรียนของคุณ",
  },
  {
    id: "student-enter-lab",
    kind: "info",
    selector: '[data-tour="lab-enter"]',
    title: "เข้าสู่ห้องแล็บ",
    description: "ปุ่มทดลองจะพาไปดูอุปกรณ์ ขั้นตอน และการจำลอง",
  },
  {
    id: "student-classrooms",
    kind: "info",
    selector: '[data-tour="classrooms-nav"]',
    title: "ดูชั้นเรียน",
    description: "เข้าห้องด้วยรหัสเชิญ แล้วดูแล็บและงานที่คุณครูมอบหมาย",
  },
  {
    id: "student-notifications",
    kind: "info",
    selector: '[data-tour="notifications"]',
    title: "ติดตามงานใหม่",
    description: "การแจ้งเตือนจะบอกเมื่อมีงานหรือความเคลื่อนไหวในชั้นเรียน",
  },
  {
    id: "student-profile",
    kind: "info",
    selector: '[data-tour="profile-menu"]',
    title: "โปรไฟล์และการตั้งค่า",
    description: "แก้ข้อมูล ปรับการแสดงผล และเปิดคู่มือนี้ซ้ำได้จากเมนูนี้",
  },
];

const teacherSteps: readonly TutorialStep[] = [
  {
    id: "teacher-overview",
    kind: "info",
    selector: '[data-tour="teacher-dashboard"]',
    title: "ดูภาพรวมการสอน",
    description: "แดชบอร์ดช่วยดูชั้นเรียน งานที่มอบหมาย และการส่งงาน",
  },
  {
    id: "teacher-manage-classrooms",
    kind: "info",
    selector: '[data-tour="teacher-classrooms"]',
    title: "จัดการชั้นเรียน",
    description: "เริ่มสร้างห้อง เลือกแล็บ และรับรหัสเชิญจากจุดนี้",
  },
  {
    id: "teacher-classroom-work",
    kind: "info",
    selector: '[data-tour="classrooms-nav"]',
    title: "มอบหมายและตรวจงาน",
    description: "ภายในชั้นเรียนคุณครูสามารถเพิ่มงาน ดูผลทดลอง และให้คะแนน",
  },
  {
    id: "teacher-labs",
    kind: "info",
    selector: '[data-tour="labs-nav"]',
    title: "สำรวจคลังแล็บ",
    description: "ทดลองแล็บก่อนเลือกไปใช้กับนักเรียนได้จากเมนูนี้",
  },
  {
    id: "teacher-notifications",
    kind: "info",
    selector: '[data-tour="notifications"]',
    title: "ติดตามงานที่ส่ง",
    description: "การแจ้งเตือนช่วยพาไปยังชั้นเรียนและงานที่ต้องตรวจ",
  },
  {
    id: "teacher-profile",
    kind: "info",
    selector: '[data-tour="profile-menu"]',
    title: "โปรไฟล์และการตั้งค่า",
    description: "แก้ข้อมูลบัญชี ปรับหน้าจอ และเปิดคู่มืออีกครั้งได้ที่นี่",
  },
];

const newtonSteps: readonly TutorialStep[] = [
  {
    id: "newton-goal",
    kind: "info",
    selector:
      '[data-tutorial-lab="newtons-cooling"] [data-testid="simulation-stage-scene"]',
    title: "ดูวัตถุเย็นลง",
    description:
      "สังเกตว่าอุณหภูมิของวัตถุค่อย ๆ เข้าใกล้อุณหภูมิสิ่งแวดล้อม",
  },
  {
    id: "newton-initial-temperature",
    kind: "action",
    selector: '[data-tutorial="newtons-cooling-initial-temperature"]',
    title: "ตั้งอุณหภูมิเริ่มต้น",
    description: "ลองเลื่อนแถบหรือกรอกค่าอุณหภูมิของตัวอย่าง",
    actionId: "newton.initial-temperature.changed",
    labId: "newtons-cooling",
  },
  {
    id: "newton-ambient-temperature",
    kind: "action",
    selector: '[data-tutorial="newtons-cooling-ambient-temperature"]',
    title: "ตั้งอุณหภูมิสิ่งแวดล้อม",
    description: "ลองเปลี่ยนอุณหภูมิรอบตัวอย่างเพื่อเปรียบเทียบการเย็นตัว",
    actionId: "newton.ambient-temperature.changed",
    labId: "newtons-cooling",
  },
  {
    id: "newton-start",
    kind: "action",
    selector: '[data-tutorial="newtons-cooling-run"]',
    title: "เริ่มทดลอง",
    description: "กดเริ่มทดลอง แล้วดูอุณหภูมิเปลี่ยนแบบทันที",
    actionId: "simulation.started",
    labId: "newtons-cooling",
  },
  {
    id: "newton-pause",
    kind: "action",
    selector: '[data-tutorial="newtons-cooling-run"]',
    title: "หยุดชั่วคราว",
    description: "กดหยุดชั่วคราวเพื่อพักการทดลองไว้ที่ค่าปัจจุบัน",
    actionId: "simulation.paused",
    labId: "newtons-cooling",
  },
  {
    id: "newton-results",
    kind: "action",
    selector: '[data-tutorial="newtons-cooling-results"]',
    title: "เปิดผลการทดลอง",
    description: "เปิดผลเพื่อดูค่าปัจจุบัน กราฟ และตารางที่เกิดขึ้นจริง",
    actionId: "simulation.results-opened",
    labId: "newtons-cooling",
  },
  {
    id: "newton-save",
    kind: "info",
    selector: '[data-tutorial="newtons-cooling-results-save"]',
    title: "บันทึกเมื่อพร้อม",
    description:
      "ปุ่มนี้ใช้เก็บผลไว้ภายหลัง คู่มือนี้จบได้โดยไม่ต้องกดบันทึก",
  },
];

export const tutorialDefinitions: Record<TutorialId, TutorialDefinition> = {
  [TUTORIAL_IDS.studentGeneral]: {
    id: TUTORIAL_IDS.studentGeneral,
    label: "คู่มือเริ่มต้นสำหรับนักเรียน",
    contextLabel: "คู่มือสำหรับนักเรียน",
    introTitle: "เริ่มใช้ SciSiam",
    introDescription: "พาดูจุดสำคัญ 6 ขั้น ใช้เวลาประมาณ 1 นาที",
    startPath: "/labs",
    audience: ["student"],
    legacyOnboarding: true,
    steps: studentSteps,
  },
  [TUTORIAL_IDS.teacherGeneral]: {
    id: TUTORIAL_IDS.teacherGeneral,
    label: "คู่มือเริ่มต้นสำหรับคุณครู",
    contextLabel: "คู่มือสำหรับคุณครู",
    introTitle: "เริ่มจัดการชั้นเรียน",
    introDescription: "พาดูจุดสำคัญสำหรับสอนและตรวจงาน 6 ขั้น",
    startPath: "/dashboard",
    audience: ["teacher"],
    legacyOnboarding: true,
    steps: teacherSteps,
  },
  [TUTORIAL_IDS.newtonsCooling]: {
    id: TUTORIAL_IDS.newtonsCooling,
    label: "คู่มือแล็บ Newton",
    contextLabel: "คู่มือแล็บ Newton",
    introTitle: "ทดลองกฎการเย็นตัวไปพร้อมกัน",
    introDescription: "ปรับค่าจริง เริ่ม หยุด และเปิดผลการทดลองใน 7 ขั้น",
    startPath: "/labs/newtons-cooling/simulation",
    audience: ["student", "teacher"],
    legacyOnboarding: false,
    steps: newtonSteps,
  },
};

export function isTutorialId(value: string): value is TutorialId {
  return Object.prototype.hasOwnProperty.call(tutorialDefinitions, value);
}

export function getTutorialDefinition(tutorialId: TutorialId) {
  return tutorialDefinitions[tutorialId];
}

export function getGeneralTutorialId(role: ScisiamUserRole): TutorialId | null {
  if (role === "student") return TUTORIAL_IDS.studentGeneral;
  if (role === "teacher") return TUTORIAL_IDS.teacherGeneral;
  return null;
}

export function getAutoTutorialId(
  pathname: string,
  role: ScisiamUserRole,
): TutorialId | null {
  const generalId = getGeneralTutorialId(role);
  if (generalId && tutorialDefinitions[generalId].startPath === pathname) {
    return generalId;
  }

  const newton = tutorialDefinitions[TUTORIAL_IDS.newtonsCooling];
  if (newton.startPath === pathname && newton.audience.includes(role)) {
    return newton.id;
  }

  return null;
}
