const READY_LAB_IDS = new Set([
  "newtons-cooling",
  "ohms-law",
  "hookes-law",
  "acid-base-titration",
  "boyles-law",
  "charles-law",
  "photosynthesis-rate",
  "mendels-inheritance",
  "mitosis-division",
  "snells-law",
  "ideal-gas-law",
  "newtons-second-law",
  "momentum-conservation",
  "faradays-law",
  "bernoullis-principle",
  "photoelectric-effect",
  "keplers-laws",
  "stefan-boltzmann",
  "le-chateliers-principle",
  "beer-lambert-law",
  "hesss-law",
  "galvanic-cell",
  "chemical-kinetics",
  "solubility-product",
  "avogadros-law",
  "electrolysis-lab",
  "colligative-properties",
]);

export const readyLabCount = READY_LAB_IDS.size;

export function isLabReady(labId: string) {
  return READY_LAB_IDS.has(labId);
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
