export const directSimulationLabIds = [
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

export type DirectSimulationLabId = (typeof directSimulationLabIds)[number];
export type ChemistryConceptSimulationLabId = (typeof chemistryConceptSimulationLabIds)[number];
export type ReadySimulationLabId = DirectSimulationLabId | ChemistryConceptSimulationLabId;

const directSimulationLabIdSet = new Set<string>(directSimulationLabIds);
const chemistryConceptSimulationLabIdSet = new Set<string>(chemistryConceptSimulationLabIds);

export const readySimulationLabIds = [
  ...directSimulationLabIds,
  ...chemistryConceptSimulationLabIds,
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

export function isReadySimulationLabId(labId: string): labId is ReadySimulationLabId {
  return readySimulationLabIdSet.has(labId);
}
