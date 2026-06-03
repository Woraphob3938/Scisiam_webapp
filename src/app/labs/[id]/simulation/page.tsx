"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, Clock, AlertTriangle } from "lucide-react";

import { labsById } from "@/data/labs";
import { isLabReady } from "@/data/labReadiness";
import {
  isChemistryConceptSimulationLabId,
  isDirectSimulationLabId,
  type DirectSimulationLabId,
} from "@/data/labSimulationRegistry";

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
import ChemistryConceptSimulation from "@/components/labs/simulation/ChemistryConceptSimulation";
import OsmosisPlasmolysisSimulation from "@/components/labs/simulation/OsmosisPlasmolysisSimulation";
import EnzymeKineticsSimulation from "@/components/labs/simulation/EnzymeKineticsSimulation";
import DnaExtractionSimulation from "@/components/labs/simulation/DnaExtractionSimulation";
import CellularRespirationSimulation from "@/components/labs/simulation/CellularRespirationSimulation";
import PlantTranspirationSimulation from "@/components/labs/simulation/PlantTranspirationSimulation";
import NaturalSelectionSimulation from "@/components/labs/simulation/NaturalSelectionSimulation";
import BloodTypingAgglutinationSimulation from "@/components/labs/simulation/BloodTypingAgglutinationSimulation";
import FoodChainEcologySimulation from "@/components/labs/simulation/FoodChainEcologySimulation";
import CardiovascularSystemSimulation from "@/components/labs/simulation/CardiovascularSystemSimulation";

const simulationComponents: Record<DirectSimulationLabId, React.ComponentType> = {
  "newtons-cooling": NewtonsCoolingSimulation,
  "ohms-law": OhmsLawSimulation,
  "hookes-law": HookesLawSimulation,
  "acid-base-titration": AcidBaseTitrationSimulation,
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
  }[category as "Physics" | "Chemistry" | "Biology"] || {
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
              : "border-green-100 bg-green-50 text-green-700"
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
            : "ห้องทดลองและระบบ Simulation นี้อยู่ระหว่างการพัฒนาเนื้อหาเพื่อให้สอดคล้องกับวัตถุประสงค์การเรียนรู้ตามหลักสูตรอย่างถูกต้องสมบูรณ์แบบ"}
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

  return <SimulationPlaceholder labId={labId} />;
}
