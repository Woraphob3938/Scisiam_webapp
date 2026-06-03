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
      ? "เปิด simulation ได้ทันที"
      : "กำลังจัดเนื้อหาและ simulation ให้ตรงหัวข้อ",
  };
}
