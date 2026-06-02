"use client";

import React from "react";
import { useParams } from "next/navigation";

import OhmsLawSimulation from "@/components/labs/simulation/OhmsLawSimulation";
import HookesLawSimulation from "@/components/labs/simulation/HookesLawSimulation";
import AcidBaseTitrationSimulation from "@/components/labs/simulation/AcidBaseTitrationSimulation";
import BoylesLawSimulation from "@/components/labs/simulation/BoylesLawSimulation";
import CharlesLawSimulation from "@/components/labs/simulation/CharlesLawSimulation";
import PhotosynthesisRateSimulation from "@/components/labs/simulation/PhotosynthesisRateSimulation";
import MendelianGeneticsSimulation from "@/components/labs/simulation/MendelianGeneticsSimulation";
import MitosisCellCycleSimulation from "@/components/labs/simulation/MitosisCellCycleSimulation";
import SnellsLawSimulation from "@/components/labs/simulation/SnellsLawSimulation";
import IdealGasLawSimulation from "@/components/labs/simulation/IdealGasLawSimulation";
import NewtonsSecondLawSimulation from "@/components/labs/simulation/NewtonsSecondLawSimulation";
import PhotoelectricEffectSimulation from "@/components/labs/simulation/PhotoelectricEffectSimulation";
import KeplersLawsSimulation from "@/components/labs/simulation/KeplersLawsSimulation";
import StefanBoltzmannSimulation from "@/components/labs/simulation/StefanBoltzmannSimulation";
import MomentumConservationSimulation from "@/components/labs/simulation/MomentumConservationSimulation";
import FaradaysLawSimulation from "@/components/labs/simulation/FaradaysLawSimulation";
import BernoullisPrincipleSimulation from "@/components/labs/simulation/BernoullisPrincipleSimulation";
import NewtonsCoolingSimulation from "@/components/labs/simulation/NewtonsCoolingSimulation";
import LeChateliersPrincipleSimulation from "@/components/labs/simulation/LeChateliersPrincipleSimulation";
import BeerLambertLawSimulation from "@/components/labs/simulation/BeerLambertLawSimulation";
import HesssLawSimulation from "@/components/labs/simulation/HesssLawSimulation";
import ChemistryConceptSimulation, { ChemistryConceptLabId } from "@/components/labs/simulation/ChemistryConceptSimulation";

const chemistryConceptLabIds = new Set<string>([
  "galvanic-cell",
  "chemical-kinetics",
  "solubility-product",
  "avogadros-law",
  "electrolysis-lab",
  "colligative-properties",
]);

export default function SimulationRoomPage() {
  const params = useParams();
  const labId = (params?.id as string) || "newtons-cooling";

  if (labId === "ohms-law") {
    return <OhmsLawSimulation />;
  }

  if (labId === "hookes-law") {
    return <HookesLawSimulation />;
  }

  if (labId === "acid-base-titration") {
    return <AcidBaseTitrationSimulation />;
  }

  if (labId === "boyles-law") {
    return <BoylesLawSimulation />;
  }

  if (labId === "charles-law") {
    return <CharlesLawSimulation />;
  }

  if (labId === "photosynthesis-rate") {
    return <PhotosynthesisRateSimulation />;
  }

  if (labId === "mendels-inheritance") {
    return <MendelianGeneticsSimulation />;
  }

  if (labId === "mitosis-division") {
    return <MitosisCellCycleSimulation />;
  }

  if (labId === "snells-law") {
    return <SnellsLawSimulation />;
  }

  if (labId === "ideal-gas-law") {
    return <IdealGasLawSimulation />;
  }

  if (labId === "newtons-second-law") {
    return <NewtonsSecondLawSimulation />;
  }

  if (labId === "photoelectric-effect") {
    return <PhotoelectricEffectSimulation />;
  }

  if (labId === "keplers-laws") {
    return <KeplersLawsSimulation />;
  }

  if (labId === "stefan-boltzmann") {
    return <StefanBoltzmannSimulation />;
  }

  if (labId === "momentum-conservation") {
    return <MomentumConservationSimulation />;
  }

  if (labId === "faradays-law") {
    return <FaradaysLawSimulation />;
  }

  if (labId === "bernoullis-principle") {
    return <BernoullisPrincipleSimulation />;
  }

  if (labId === "le-chateliers-principle") {
    return <LeChateliersPrincipleSimulation />;
  }

  if (labId === "beer-lambert-law") {
    return <BeerLambertLawSimulation />;
  }

  if (labId === "hesss-law") {
    return <HesssLawSimulation />;
  }

  if (chemistryConceptLabIds.has(labId)) {
    return <ChemistryConceptSimulation labId={labId as ChemistryConceptLabId} />;
  }

  return <NewtonsCoolingSimulation />;
}
