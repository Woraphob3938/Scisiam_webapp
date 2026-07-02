export type MatterPhaseId = "solid" | "liquid" | "gas";
export type MixtureType =
  | "iron-sand"
  | "sand-water"
  | "salt-water"
  | "gravel-sand";
export type SeparationMethod =
  | "magnet"
  | "filtration"
  | "evaporation"
  | "sieving";

export type MatterPhase = {
  id: MatterPhaseId;
  thaiLabel: string;
  spacing: string;
  motionLevel: number;
};

const phases: Record<MatterPhaseId, MatterPhase> = {
  solid: {
    id: "solid",
    thaiLabel: "ของแข็ง",
    spacing: "ชิดและเป็นระเบียบ",
    motionLevel: 0.2,
  },
  liquid: {
    id: "liquid",
    thaiLabel: "ของเหลว",
    spacing: "ชิดแต่เลื่อนไหล",
    motionLevel: 0.55,
  },
  gas: {
    id: "gas",
    thaiLabel: "แก๊ส",
    spacing: "ห่างและกระจาย",
    motionLevel: 1,
  },
};

export function getMatterPhase(temperatureC: number): MatterPhase {
  if (temperatureC < 0) return phases.solid;
  if (temperatureC < 100) return phases.liquid;
  return phases.gas;
}

const preferredMethods: Record<MixtureType, SeparationMethod> = {
  "iron-sand": "magnet",
  "sand-water": "filtration",
  "salt-water": "evaporation",
  "gravel-sand": "sieving",
};

const preferredResults: Record<
  MixtureType,
  { recoveryPercent: number; purityPercent: number }
> = {
  "iron-sand": { recoveryPercent: 96, purityPercent: 95 },
  "sand-water": { recoveryPercent: 92, purityPercent: 94 },
  "salt-water": { recoveryPercent: 88, purityPercent: 90 },
  "gravel-sand": { recoveryPercent: 90, purityPercent: 92 },
};

export function getSeparationOutcome(
  mixture: MixtureType,
  method: SeparationMethod,
) {
  const isPreferred = preferredMethods[mixture] === method;

  return {
    isPreferred,
    recoveryPercent: isPreferred
      ? preferredResults[mixture].recoveryPercent
      : 24,
    purityPercent: isPreferred ? preferredResults[mixture].purityPercent : 35,
  };
}

export function calculateDissolutionRate(
  temperatureC: number,
  isStirring: boolean,
  soluteGrams: number,
) {
  const temperatureFactor = 0.12 + Math.max(0, temperatureC) * 0.004;
  const stirringFactor = isStirring ? 1.75 : 1;
  const amountFactor = 1 / Math.max(1, soluteGrams / 5);

  return temperatureFactor * stirringFactor * amountFactor;
}

export function advanceDissolution(
  dissolvedGrams: number,
  rateGramsPerSecond: number,
  deltaSeconds: number,
  totalGrams = Number.POSITIVE_INFINITY,
) {
  return Math.min(
    totalGrams,
    Math.max(0, dissolvedGrams + rateGramsPerSecond * deltaSeconds),
  );
}
