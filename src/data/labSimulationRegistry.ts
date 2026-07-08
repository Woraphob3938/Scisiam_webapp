export const directSimulationLabIds = [
  "newtons-cooling",
  "ohms-law",
  "hookes-law",
  "acid-base-titration",
  "periodic-table",
  "atmosphere-layers",
  "lab-equipment-overview",
  "animal-cell",
  "leaf-cell",
  "human-blood-cells",
  "experiment-chemicals",
  "external-muscle-anatomy",
  "internal-muscle-anatomy",
  "good-bad-minerals",
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
  "pcr-gel-electrophoresis",
  "crispr-gene-editing",
  "recombinant-dna-transformation",
  "flow-cytometry-cycle",
  "western-blotting",
  "metabolic-pathway-flux",
  "push-pull-forces",
  "light-and-shadows",
  "sound-vibrations",
  "simple-circuits",
  "floating-and-sinking",
  "magnet-exploration",
  "quantum-tunneling",
  "michelson-interferometer",
  "zeeman-effect",
  "superconductivity-meissner",
  "bragg-diffraction",
  "relativistic-kinematics",
  "states-of-matter",
  "mixing-and-separating",
  "dissolving-solutions",
  "acids-bases-around-us",
  "heating-cooling-materials",
  "physical-chemical-changes",
  "nmr-spectroscopy",
  "xps-spectroscopy",
  "hplc-chromatography",
  "transition-metal-complexes",
  "eis-electrochemistry",
  "quantum-chemistry-orbitals",
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
  "probability-simulation",
  "trigonometry-waves",
  "systems-of-equations",
  "geometry-measurement",
  "exponential-growth-decay",
  "data-sampling-error",
  "quadratic-projectiles",
  "logarithm-scales",
  "unit-conversion",
  "matrix-transformations",
  "sequences-series",
  "inequalities-feasible-regions",
  "transformations-symmetry",
  "angles-circles",
  "combinatorics-counting",
  "normal-distribution",
  "rates-of-change",
  "optimization-constraints",
  "advanced-calculus-optimization",
  "linear-algebra-eigenvectors",
  "differential-equations-lab",
  "numerical-methods-lab",
  "multivariable-calculus",
  "statistical-inference",
  "bayesian-reasoning-lab",
  "fourier-analysis-signals",
  "complex-numbers-phasors",
  "vector-fields-gradients",
  "discrete-graph-theory",
  "mathematical-modeling-lab",
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
