"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Clock, Home } from "lucide-react";

import { labsById } from "@/data/labs";
import { isLabReady } from "@/data/labReadiness";
import {
  isChemistryConceptSimulationLabId,
  isDirectSimulationLabId,
  isMathConceptSimulationLabId,
  type DirectSimulationLabId,
} from "@/data/labSimulationRegistry";

const NewtonsCoolingSimulation = dynamic(() =>
  import("@/components/labs/simulation/NewtonsCoolingSimulation"));
const OhmsLawSimulation = dynamic(() =>
  import("@/components/labs/simulation/OhmsLawSimulation"));
const HookesLawSimulation = dynamic(() =>
  import("@/components/labs/simulation/HookesLawSimulation"));
const UnifiedLegacySimulation = dynamic(() =>
  import("@/components/labs/simulation/UnifiedLegacySimulation"));
function AcidBaseTitrationSimulation() {
  return <UnifiedLegacySimulation labId="acid-base-titration" />;
}
function BoylesLawSimulation() {
  return <UnifiedLegacySimulation labId="boyles-law" />;
}
function CharlesLawSimulation() {
  return <UnifiedLegacySimulation labId="charles-law" />;
}
const PhotosynthesisRateSimulation = dynamic(() =>
  import("@/components/labs/simulation/PhotosynthesisRateSimulation"));
const MendelianGeneticsSimulation = dynamic(() =>
  import("@/components/labs/simulation/MendelianGeneticsSimulation"));
const MitosisCellCycleSimulation = dynamic(() =>
  import("@/components/labs/simulation/MitosisCellCycleSimulation"));
function SnellsLawSimulation() {
  return <UnifiedLegacySimulation labId="snells-law" />;
}
function IdealGasLawSimulation() {
  return <UnifiedLegacySimulation labId="ideal-gas-law" />;
}
function NewtonsSecondLawSimulation() {
  return <UnifiedLegacySimulation labId="newtons-second-law" />;
}
const PhotoelectricEffectSimulation = dynamic(() =>
  import("@/components/labs/simulation/PhotoelectricEffectSimulation"));
const KeplersLawsSimulation = dynamic(() =>
  import("@/components/labs/simulation/KeplersLawsSimulation"));
const StefanBoltzmannSimulation = dynamic(() =>
  import("@/components/labs/simulation/StefanBoltzmannSimulation"));
const MomentumConservationSimulation = dynamic(() =>
  import("@/components/labs/simulation/MomentumConservationSimulation"));
const FaradaysLawSimulation = dynamic(() =>
  import("@/components/labs/simulation/FaradaysLawSimulation"));
const BernoullisPrincipleSimulation = dynamic(() =>
  import("@/components/labs/simulation/BernoullisPrincipleSimulation"));
const LeChateliersPrincipleSimulation = dynamic(() =>
  import("@/components/labs/simulation/LeChateliersPrincipleSimulation"));
const BeerLambertLawSimulation = dynamic(() =>
  import("@/components/labs/simulation/BeerLambertLawSimulation"));
const HesssLawSimulation = dynamic(() =>
  import("@/components/labs/simulation/HesssLawSimulation"));
const ChemistryConceptSimulation = dynamic(() =>
  import("@/components/labs/simulation/ChemistryConceptSimulation"));
const PeriodicTableSimulation = dynamic(() =>
  import("@/components/labs/simulation/PeriodicTableSimulation"));
const OsmosisPlasmolysisSimulation = dynamic(() =>
  import("@/components/labs/simulation/OsmosisPlasmolysisSimulation"));
const EnzymeKineticsSimulation = dynamic(() =>
  import("@/components/labs/simulation/EnzymeKineticsSimulation"));
const DnaExtractionSimulation = dynamic(() =>
  import("@/components/labs/simulation/DnaExtractionSimulation"));
const CellularRespirationSimulation = dynamic(() =>
  import("@/components/labs/simulation/CellularRespirationSimulation"));
const PlantTranspirationSimulation = dynamic(() =>
  import("@/components/labs/simulation/PlantTranspirationSimulation"));
const NaturalSelectionSimulation = dynamic(() =>
  import("@/components/labs/simulation/NaturalSelectionSimulation"));
const BloodTypingAgglutinationSimulation = dynamic(() =>
  import("@/components/labs/simulation/BloodTypingAgglutinationSimulation"));
const FoodChainEcologySimulation = dynamic(() =>
  import("@/components/labs/simulation/FoodChainEcologySimulation"));
const CardiovascularSystemSimulation = dynamic(() =>
  import("@/components/labs/simulation/CardiovascularSystemSimulation"));
const GraphingLinesSimulation = dynamic(() =>
  import("@/components/labs/simulation/GraphingLinesSimulation"));
const RatioProportionSimulation = dynamic(() =>
  import("@/components/labs/simulation/RatioProportionSimulation"));
const VectorAdditionSimulation = dynamic(() =>
  import("@/components/labs/simulation/VectorAdditionSimulation"));
const CenterVariabilitySimulation = dynamic(() =>
  import("@/components/labs/simulation/CenterVariabilitySimulation"));
const CurveFittingSimulation = dynamic(() =>
  import("@/components/labs/simulation/CurveFittingSimulation"));
const FunctionBuilderSimulation = dynamic(() =>
  import("@/components/labs/simulation/FunctionBuilderSimulation"));
const ProbabilitySimulation = dynamic(() =>
  import("@/components/labs/simulation/ProbabilitySimulation"));
const TrigonometryWavesSimulation = dynamic(() =>
  import("@/components/labs/simulation/TrigonometryWavesSimulation"));
const SystemsEquationsSimulation = dynamic(() =>
  import("@/components/labs/simulation/SystemsEquationsSimulation"));
const NormalDistributionSimulation = dynamic(() =>
  import("@/components/labs/simulation/NormalDistributionSimulation"));
const RatesOfChangeSimulation = dynamic(() =>
  import("@/components/labs/simulation/RatesOfChangeSimulation"));
const OptimizationConstraintsSimulation = dynamic(() =>
  import("@/components/labs/simulation/OptimizationConstraintsSimulation"));
const AdvancedCalculusOptimizationSimulation = dynamic(() =>
  import("@/components/labs/simulation/AdvancedCalculusOptimizationSimulation"));
const LinearAlgebraEigenvectorsSimulation = dynamic(() =>
  import("@/components/labs/simulation/LinearAlgebraEigenvectorsSimulation"));
const DifferentialEquationsSimulation = dynamic(() =>
  import("@/components/labs/simulation/DifferentialEquationsSimulation"));
const NumericalMethodsSimulation = dynamic(() =>
  import("@/components/labs/simulation/NumericalMethodsSimulation"));
const MultivariableCalculusSimulation = dynamic(() =>
  import("@/components/labs/simulation/MultivariableCalculusSimulation"));
const StatisticalInferenceSimulation = dynamic(() =>
  import("@/components/labs/simulation/StatisticalInferenceSimulation"));
const BayesianReasoningSimulation = dynamic(() =>
  import("@/components/labs/simulation/BayesianReasoningSimulation"));
const FourierAnalysisSimulation = dynamic(() =>
  import("@/components/labs/simulation/FourierAnalysisSimulation"));
const ComplexPhasorsSimulation = dynamic(() =>
  import("@/components/labs/simulation/ComplexPhasorsSimulation"));
const AppliedMathSimulation = dynamic(() =>
  import("@/components/labs/simulation/AppliedMathSimulation"));
const VectorFieldsGradientsSimulation = dynamic(() =>
  import("@/components/labs/simulation/VectorFieldsGradientsSimulation"));
const DiscreteGraphTheorySimulation = dynamic(() =>
  import("@/components/labs/simulation/DiscreteGraphTheorySimulation"));
const MathematicalModelingSimulation = dynamic(() =>
  import("@/components/labs/simulation/MathematicalModelingSimulation"));
const PcrGelElectrophoresisSimulation = dynamic(() =>
  import("@/components/labs/simulation/PcrGelElectrophoresisSimulation"));
const CrisprGeneEditingSimulation = dynamic(() =>
  import("@/components/labs/simulation/CrisprGeneEditingSimulation"));
const RecombinantDnaTransformationSimulation = dynamic(() =>
  import("@/components/labs/simulation/RecombinantDnaTransformationSimulation"));
const FlowCytometrySimulation = dynamic(() =>
  import("@/components/labs/simulation/FlowCytometrySimulation"));
const WesternBlottingSimulation = dynamic(() =>
  import("@/components/labs/simulation/WesternBlottingSimulation"));
const MetabolicPathwayFluxSimulation = dynamic(() =>
  import("@/components/labs/simulation/MetabolicPathwayFluxSimulation"));
const PushPullForcesSimulation = dynamic(() =>
  import("@/components/labs/simulation/PushPullForcesSimulation"));
const LightShadowsSimulation = dynamic(() =>
  import("@/components/labs/simulation/LightShadowsSimulation"));
const SoundVibrationsSimulation = dynamic(() =>
  import("@/components/labs/simulation/SoundVibrationsSimulation"));
const SimpleCircuitsSimulation = dynamic(() =>
  import("@/components/labs/simulation/SimpleCircuitsSimulation"));
const FloatingSinkingSimulation = dynamic(() =>
  import("@/components/labs/simulation/FloatingSinkingSimulation"));
const MagnetExplorationSimulation = dynamic(() =>
  import("@/components/labs/simulation/MagnetExplorationSimulation"));
const QuantumTunnelingSimulation = dynamic(() =>
  import("@/components/labs/simulation/QuantumTunnelingSimulation"));
const MichelsonInterferometerSimulation = dynamic(() =>
  import("@/components/labs/simulation/MichelsonInterferometerSimulation"));
const ZeemanEffectSimulation = dynamic(() =>
  import("@/components/labs/simulation/ZeemanEffectSimulation"));
const SuperconductivityMeissnerSimulation = dynamic(() =>
  import("@/components/labs/simulation/SuperconductivityMeissnerSimulation"));
const BraggDiffractionSimulation = dynamic(() =>
  import("@/components/labs/simulation/BraggDiffractionSimulation"));
const RelativisticKinematicsSimulation = dynamic(() =>
  import("@/components/labs/simulation/RelativisticKinematicsSimulation"));
const StatesOfMatterSimulation = dynamic(() =>
  import("@/components/labs/simulation/StatesOfMatterSimulation"));
const MixingAndSeparatingSimulation = dynamic(() =>
  import("@/components/labs/simulation/MixingAndSeparatingSimulation"));
const DissolvingSolutionsSimulation = dynamic(() =>
  import("@/components/labs/simulation/DissolvingSolutionsSimulation"));

const simulationComponents: Record<DirectSimulationLabId, React.ComponentType> = {
  "newtons-cooling": NewtonsCoolingSimulation,
  "ohms-law": OhmsLawSimulation,
  "hookes-law": HookesLawSimulation,
  "acid-base-titration": AcidBaseTitrationSimulation,
  "periodic-table": PeriodicTableSimulation,
  "boyles-law": BoylesLawSimulation,
  "charles-law": CharlesLawSimulation,
  "photosynthesis-rate": PhotosynthesisRateSimulation,
  "mendels-inheritance": MendelianGeneticsSimulation,
  "mitosis-division": MitosisCellCycleSimulation,
  "snells-law": SnellsLawSimulation,
  "ideal-gas-law": IdealGasLawSimulation,
  "newtons-second-law": NewtonsSecondLawSimulation,
  "photoelectric-effect": PhotoelectricEffectSimulation,
  "keplers-laws": KeplersLawsSimulation,
  "stefan-boltzmann": StefanBoltzmannSimulation,
  "momentum-conservation": MomentumConservationSimulation,
  "faradays-law": FaradaysLawSimulation,
  "bernoullis-principle": BernoullisPrincipleSimulation,
  "le-chateliers-principle": LeChateliersPrincipleSimulation,
  "beer-lambert-law": BeerLambertLawSimulation,
  "hesss-law": HesssLawSimulation,
  "cell-osmosis": OsmosisPlasmolysisSimulation,
  "enzyme-kinetics": EnzymeKineticsSimulation,
  "dna-extraction": DnaExtractionSimulation,
  "cellular-respiration": CellularRespirationSimulation,
  "plant-transpiration": PlantTranspirationSimulation,
  "natural-selection": NaturalSelectionSimulation,
  "blood-typing": BloodTypingAgglutinationSimulation,
  "food-chain": FoodChainEcologySimulation,
  "heart-rate": CardiovascularSystemSimulation,
  "pcr-gel-electrophoresis": PcrGelElectrophoresisSimulation,
  "crispr-gene-editing": CrisprGeneEditingSimulation,
  "recombinant-dna-transformation": RecombinantDnaTransformationSimulation,
  "flow-cytometry-cycle": FlowCytometrySimulation,
  "western-blotting": WesternBlottingSimulation,
  "metabolic-pathway-flux": MetabolicPathwayFluxSimulation,
  "push-pull-forces": PushPullForcesSimulation,
  "light-and-shadows": LightShadowsSimulation,
  "sound-vibrations": SoundVibrationsSimulation,
  "simple-circuits": SimpleCircuitsSimulation,
  "floating-and-sinking": FloatingSinkingSimulation,
  "magnet-exploration": MagnetExplorationSimulation,
  "quantum-tunneling": QuantumTunnelingSimulation,
  "michelson-interferometer": MichelsonInterferometerSimulation,
  "zeeman-effect": ZeemanEffectSimulation,
  "superconductivity-meissner": SuperconductivityMeissnerSimulation,
  "bragg-diffraction": BraggDiffractionSimulation,
  "relativistic-kinematics": RelativisticKinematicsSimulation,
  "states-of-matter": StatesOfMatterSimulation,
  "mixing-and-separating": MixingAndSeparatingSimulation,
  "dissolving-solutions": DissolvingSolutionsSimulation,
};

function SimulationPlaceholder({ labId }: { labId: string }) {
  const lab = labsById[labId];
  const isInvalid = !lab;

  const title = lab ? lab.title : "ไม่พบข้อมูลห้องแล็บ";
  const category = lab ? lab.category : "";

  const themeColors = {
    Physics: {
      accent: "text-blue-600",
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      gradient: "from-blue-600 to-indigo-600 shadow-blue-500/10",
    },
    Chemistry: {
      accent: "text-purple-600",
      bg: "bg-purple-50/50",
      border: "border-purple-100",
      gradient: "from-purple-600 to-pink-600 shadow-purple-500/10",
    },
    Biology: {
      accent: "text-green-600",
      bg: "bg-green-50/50",
      border: "border-green-100",
      gradient: "from-green-600 to-emerald-600 shadow-green-500/10",
    },
    Mathematics: {
      accent: "text-rose-600",
      bg: "bg-rose-50/50",
      border: "border-rose-100",
      gradient: "from-rose-600 to-red-600 shadow-rose-500/10",
    },
  }[category as "Physics" | "Chemistry" | "Biology" | "Mathematics"] || {
    accent: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-100",
    gradient: "from-slate-600 to-slate-800",
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 font-sans text-slate-850 selection:bg-blue-600 selection:text-white">
      {/* Premium Glassmorphic Container */}
      <div className="w-full max-w-md rounded-[32px] border border-slate-200/80 bg-white p-6 text-center shadow-2xl shadow-slate-200/40 sm:p-8">
        {/* Animated Icon Circle */}
        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[20px] border ${themeColors.border} ${themeColors.bg}`}>
          {isInvalid ? (
            <AlertTriangle className="h-10 w-10 text-red-500 animate-bounce" />
          ) : (
            <Clock className={`h-10 w-10 ${themeColors.accent} animate-pulse`} />
          )}
        </div>

        {/* Category Badge */}
        {!isInvalid && (
          <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold leading-[1.45] mb-3 ${
            category === "Physics"
              ? "border-blue-100 bg-blue-50 text-blue-700"
              : category === "Chemistry"
              ? "border-purple-100 bg-purple-50 text-purple-700"
              : category === "Biology"
              ? "border-green-100 bg-green-50 text-green-700"
              : "border-violet-100 bg-violet-50 text-violet-700"
          }`}>
            {category}
          </span>
        )}

        {/* Lab Title */}
        <h1 className="mb-2 text-xl font-extrabold leading-relaxed text-slate-900 sm:text-2xl">
          {title}
        </h1>

        {/* Status Message */}
        <p className="mb-8 text-sm font-semibold leading-relaxed text-slate-500">
          {isInvalid
            ? "ขออภัย ไม่พบห้องแล็บวิทยาศาสตร์ที่คุณกำลังเรียกดูในระบบ SciSiam กรุณาตรวจสอบเส้นทางหรือรหัสแล็บใหม่อีกครั้ง"
            : "แล็บนี้ยังสร้างไม่เสร็จ: ห้องทดลองจำลองอยู่ระหว่างการพัฒนาให้ตรงกับวัตถุประสงค์การเรียนรู้และหัวข้อแล็บนี้"}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {!isInvalid && (
            <Link
              href={`/labs/${labId}`}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98] bg-gradient-to-r ${themeColors.gradient} shadow-md`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>กลับหน้ารายละเอียดแล็บ</span>
            </Link>
          )}

          <Link
            href="/"
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            <span>กลับหน้าหลัก SciSiam</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SimulationRoomPage() {
  const params = useParams();
  const labId = (params?.id as string) || "newtons-cooling";

  // Check if the lab ID is valid and ready
  if (!isLabReady(labId)) {
    return <SimulationPlaceholder labId={labId} />;
  }

  const SimulationComponent = isDirectSimulationLabId(labId) ? simulationComponents[labId] : null;
  if (SimulationComponent) {
    return <SimulationComponent />;
  }

  if (isChemistryConceptSimulationLabId(labId)) {
    return <ChemistryConceptSimulation labId={labId} />;
  }

  if (labId === "graphing-lines") {
    return <GraphingLinesSimulation />;
  }

  if (labId === "ratio-and-proportion") {
    return <RatioProportionSimulation />;
  }

  if (labId === "vector-addition") {
    return <VectorAdditionSimulation />;
  }

  if (labId === "center-and-variability") {
    return <CenterVariabilitySimulation />;
  }

  if (labId === "curve-fitting") {
    return <CurveFittingSimulation />;
  }

  if (labId === "function-builder") {
    return <FunctionBuilderSimulation />;
  }

  if (labId === "probability-simulation") {
    return <ProbabilitySimulation />;
  }

  if (labId === "trigonometry-waves") {
    return <TrigonometryWavesSimulation />;
  }

  if (labId === "systems-of-equations") {
    return <SystemsEquationsSimulation />;
  }

  if (labId === "normal-distribution") {
    return <NormalDistributionSimulation />;
  }

  if (labId === "rates-of-change") {
    return <RatesOfChangeSimulation />;
  }

  if (labId === "optimization-constraints") {
    return <OptimizationConstraintsSimulation />;
  }

  if (labId === "advanced-calculus-optimization") {
    return <AdvancedCalculusOptimizationSimulation />;
  }

  if (labId === "linear-algebra-eigenvectors") {
    return <LinearAlgebraEigenvectorsSimulation />;
  }

  if (labId === "differential-equations-lab") {
    return <DifferentialEquationsSimulation />;
  }

  if (labId === "numerical-methods-lab") {
    return <NumericalMethodsSimulation />;
  }

  if (labId === "multivariable-calculus") {
    return <MultivariableCalculusSimulation />;
  }

  if (labId === "statistical-inference") {
    return <StatisticalInferenceSimulation />;
  }

  if (labId === "bayesian-reasoning-lab") {
    return <BayesianReasoningSimulation />;
  }

  if (labId === "fourier-analysis-signals") {
    return <FourierAnalysisSimulation />;
  }

  if (labId === "complex-numbers-phasors") {
    return <ComplexPhasorsSimulation />;
  }

  if (labId === "vector-fields-gradients") {
    return <VectorFieldsGradientsSimulation />;
  }

  if (labId === "discrete-graph-theory") {
    return <DiscreteGraphTheorySimulation />;
  }

  if (labId === "mathematical-modeling-lab") {
    return <MathematicalModelingSimulation />;
  }

  if (labId === "geometry-measurement") {
    return <AppliedMathSimulation labId={labId} />;
  }

  if (labId === "exponential-growth-decay") {
    return <AppliedMathSimulation labId={labId} />;
  }

  if (labId === "data-sampling-error") {
    return <AppliedMathSimulation labId={labId} />;
  }

  if (labId === "quadratic-projectiles") {
    return <AppliedMathSimulation labId={labId} />;
  }

  if (labId === "logarithm-scales") {
    return <AppliedMathSimulation labId={labId} />;
  }

  if (labId === "unit-conversion") {
    return <AppliedMathSimulation labId={labId} />;
  }

  if (labId === "matrix-transformations") {
    return <AppliedMathSimulation labId={labId} />;
  }

  if (labId === "sequences-series") {
    return <AppliedMathSimulation labId={labId} />;
  }

  if (labId === "inequalities-feasible-regions") {
    return <AppliedMathSimulation labId={labId} />;
  }

  if (labId === "transformations-symmetry") {
    return <AppliedMathSimulation labId={labId} />;
  }

  if (labId === "angles-circles") {
    return <AppliedMathSimulation labId={labId} />;
  }

  if (labId === "combinatorics-counting") {
    return <AppliedMathSimulation labId={labId} />;
  }

  if (isMathConceptSimulationLabId(labId)) {
    return <SimulationPlaceholder labId={labId} />;
  }

  return <SimulationPlaceholder labId={labId} />;
}
