export const directSimulationLabIds = [
  "newtons-cooling",
  "ohms-law",
  "hookes-law",
  "acid-base-titration",
  "periodic-table",
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
  "cell-osmosis",
  "enzyme-kinetics",
  "dna-extraction",
  "cellular-respiration",
  "plant-transpiration",
  "natural-selection",
  "blood-typing",
  "food-chain",
  "heart-rate",
] as const;

export const chemistryConceptSimulationLabIds = [
  "galvanic-cell",
  "chemical-kinetics",
  "solubility-product",
  "avogadros-law",
  "electrolysis-lab",
  "colligative-properties",
] as const;

export const mathConceptSimulationLabIds = [
  "graphing-lines",
  "ratio-and-proportion",
  "vector-addition",
  "center-and-variability",
  "curve-fitting",
  "function-builder",
] as const;

export type DirectSimulationLabId = (typeof directSimulationLabIds)[number];
export type ChemistryConceptSimulationLabId = (typeof chemistryConceptSimulationLabIds)[number];
export type MathConceptSimulationLabId = (typeof mathConceptSimulationLabIds)[number];
export type ReadySimulationLabId =
  | DirectSimulationLabId
  | ChemistryConceptSimulationLabId
  | MathConceptSimulationLabId;

const directSimulationLabIdSet = new Set<string>(directSimulationLabIds);
const chemistryConceptSimulationLabIdSet = new Set<string>(chemistryConceptSimulationLabIds);
const mathConceptSimulationLabIdSet = new Set<string>(mathConceptSimulationLabIds);

export const readySimulationLabIds = [
  ...directSimulationLabIds,
  ...chemistryConceptSimulationLabIds,
  ...mathConceptSimulationLabIds,
] as const;

export const readySimulationLabIdSet = new Set<string>(readySimulationLabIds);

export function isDirectSimulationLabId(labId: string): labId is DirectSimulationLabId {
  return directSimulationLabIdSet.has(labId);
}

export function isChemistryConceptSimulationLabId(
  labId: string
): labId is ChemistryConceptSimulationLabId {
  return chemistryConceptSimulationLabIdSet.has(labId);
}

export function isMathConceptSimulationLabId(
  labId: string
): labId is MathConceptSimulationLabId {
  return mathConceptSimulationLabIdSet.has(labId);
}

export function isReadySimulationLabId(labId: string): labId is ReadySimulationLabId {
  return readySimulationLabIdSet.has(labId);
}
