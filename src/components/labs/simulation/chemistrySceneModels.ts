export type GalvanicSceneModel = Readonly<{
  flowStrength: number;
  electronCount: number;
  electronDurationMs: number;
  zincIonCount: number;
  copperIonCount: number;
  anodeWear: number;
  cathodeDeposit: number;
}>;

export type ReactionRateSceneModel = Readonly<{
  particleCount: number;
  speed: number;
  productShare: number;
  reactionDurationMs: number;
}>;

export type SolubilitySceneState = "unsaturated" | "near-saturation" | "precipitating";

export type SolubilitySceneModel = Readonly<{
  saturationIndex: number;
  state: SolubilitySceneState;
  dissolvedIonCount: number;
  commonIonCount: number;
  precipitateCount: number;
  mixingStrength: number;
}>;

export type ExperimentPlaybackState = Readonly<{
  isRunning: boolean;
  runToken: number;
}>;

export function createReadyExperimentPlayback(): ExperimentPlaybackState {
  return Object.freeze({ isRunning: false, runToken: 0 });
}

export function toggleExperimentPlayback(
  state: ExperimentPlaybackState,
): ExperimentPlaybackState {
  return Object.freeze({
    isRunning: !state.isRunning,
    runToken: state.runToken === 0 ? 1 : state.runToken,
  });
}

export function resetExperimentPlayback(): ExperimentPlaybackState {
  return createReadyExperimentPlayback();
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function normalize(value: number, min: number, max: number) {
  return (clamp(value, min, max) - min) / (max - min);
}

export function buildGalvanicSceneModel(
  qRatio: number,
  bridgeEfficiency: number,
): GalvanicSceneModel {
  const qStrength = normalize(qRatio, 0.2, 3);
  const bridgeStrength = normalize(bridgeEfficiency, 40, 100);
  const flowStrength = clamp(0.28 + bridgeStrength * 0.66 - qStrength * 0.1, 0, 1);

  return Object.freeze({
    flowStrength,
    electronCount: Math.round(3 + flowStrength * 4),
    electronDurationMs: Math.round(2200 - flowStrength * 1350),
    zincIonCount: Math.round(3 + qStrength * 6),
    copperIonCount: Math.round(9 - qStrength * 6),
    anodeWear: clamp(0.16 + flowStrength * 0.36, 0, 1),
    cathodeDeposit: clamp(0.12 + flowStrength * 0.42, 0, 1),
  });
}

export function buildReactionRateSceneModel(
  concentration: number,
  temperature: number,
): ReactionRateSceneModel {
  const boundedConcentration = clamp(concentration, 0.1, 2);
  const boundedTemperature = clamp(temperature, 15, 70);
  const concentrationStrength = normalize(boundedConcentration, 0.1, 2);
  const temperatureStrength = normalize(boundedTemperature, 15, 70);
  const reactionRate = Math.min(
    100,
    18 * Math.pow(boundedConcentration, 1.2) * Math.exp(0.045 * (boundedTemperature - 25)),
  );
  const rateStrength = clamp(reactionRate / 100, 0, 1);

  return Object.freeze({
    particleCount: Math.round(12 + concentrationStrength * 30),
    speed: 24 + temperatureStrength * 60,
    productShare: 0.08 + rateStrength * 0.64,
    reactionDurationMs: Math.round(5200 - rateStrength * 2600),
  });
}

export function buildSolubilitySceneModel(
  ionConcentration: number,
  commonIon: number,
): SolubilitySceneModel {
  const boundedConcentration = clamp(ionConcentration, 0.2, 2);
  const boundedCommonIon = clamp(commonIon, 0, 1);
  const concentrationStrength = normalize(boundedConcentration, 0.2, 2);
  const commonIonStrength = normalize(boundedCommonIon, 0, 1);
  const saturationIndex = boundedConcentration * boundedConcentration * (1 + boundedCommonIon * 0.65);
  const state: SolubilitySceneState = saturationIndex > 1
    ? "precipitating"
    : saturationIndex >= 0.85
      ? "near-saturation"
      : "unsaturated";
  const precipitateStrength = clamp((saturationIndex - 1) / 5.6, 0, 1);

  return Object.freeze({
    saturationIndex,
    state,
    dissolvedIonCount: Math.round(4 + concentrationStrength * 5),
    commonIonCount: Math.round(2 + commonIonStrength * 5),
    precipitateCount: state === "precipitating" ? Math.max(1, Math.round(precipitateStrength * 8)) : 0,
    mixingStrength: clamp(0.3 + concentrationStrength * 0.4 + commonIonStrength * 0.3, 0, 1),
  });
}
