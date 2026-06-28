import { isReadySimulationLabId, readySimulationLabIds } from "@/data/labSimulationRegistry";

export const readyLabCount = readySimulationLabIds.length;

export function isLabReady(labId: string) {
  return isReadySimulationLabId(labId);
}

export function getLabReadiness(labId: string) {
  const isReady = isLabReady(labId);

  return {
    isReady,
    label: isReady ? "พร้อมทดลอง" : "กำลังเตรียม",
    description: isReady
      ? "เปิดห้องทดลองจำลองได้ทันที"
      : "แล็บนี้ยังสร้างไม่เสร็จ: อ่านรายละเอียดได้ แต่ห้องทดลองจำลองยังอยู่ระหว่างจัดทำ",
  };
}
