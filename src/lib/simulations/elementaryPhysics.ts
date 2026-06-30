export type MagneticPole = "N" | "S";
export type TestMaterial = "iron" | "aluminum" | "wood" | "plastic";

export function calculateSimpleCircuit(
  cellCount: 1 | 2,
  wireConnected: boolean,
  switchClosed: boolean,
  resistanceOhm = 6,
) {
  const voltageVolt = cellCount * 1.5;
  const isClosed = wireConnected && switchClosed;
  const currentAmp = isClosed ? voltageVolt / resistanceOhm : 0;
  const powerWatt = voltageVolt * currentAmp;

  return {
    voltageVolt,
    currentAmp,
    powerWatt,
    brightness: Math.min(1, powerWatt / 1.5),
    isClosed,
  };
}

export function calculateBuoyancy(
  massKg: number,
  displacedVolumeM3: number,
  waterDensityKgM3 = 1000,
) {
  const gravity = 9.81;
  const weightNewton = massKg * gravity;
  const buoyantForceNewton = waterDensityKgM3 * displacedVolumeM3 * gravity;
  const averageDensityKgM3 = massKg / displacedVolumeM3;

  return {
    weightNewton,
    buoyantForceNewton,
    averageDensityKgM3,
    outcome:
      buoyantForceNewton >= weightNewton
        ? ("float" as const)
        : ("sink" as const),
  };
}

export function calculateMagneticInteraction(
  leftPole: MagneticPole,
  rightPole: MagneticPole,
  distanceCm: number,
) {
  const safeDistance = Math.max(2, distanceCm);

  return {
    relation:
      leftPole === rightPole ? ("repel" as const) : ("attract" as const),
    strength: Math.round(100 / (1 + (safeDistance / 6) ** 2)),
  };
}

export function isMagneticallyAttracted(material: TestMaterial) {
  return material === "iron";
}
