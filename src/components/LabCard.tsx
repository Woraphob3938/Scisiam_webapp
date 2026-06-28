"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { getLabReadiness } from "@/data/labReadiness";
import {
  PushPullForcesSVG,
  LightShadowsSVG,
  SoundVibrationsSVG,
  SimpleCircuitsSVG,
  FloatingSinkingSVG,
  MagnetExplorationSVG,
  StatesOfMatterSVG,
  MixingSeparatingSVG,
  DissolvingSolutionsSVG,
  AcidsBasesSVG,
  HeatingCoolingSVG,
  PhysicalChemicalSVG,
  ProbabilitySVG,
  TrigoWavesSVG,
  SystemsEquationsSVG,
  GeometryMeasurementSVG,
  ExponentialGrowthDecaySVG,
  DataSamplingErrorSVG,
  QuadraticProjectilesSVG,
  LogarithmScalesSVG,
  UnitConversionSVG,
  MatrixTransformationsSVG,
  SequencesSeriesSVG,
  InequalitiesFeasibleSVG,
  TransformationsSymmetrySVG,
  AnglesCirclesSVG,
  CombinatoricsCountingSVG,
  NormalDistributionSVG,
  RatesOfChangeSVG,
  OptimizationConstraintsSVG,
  AdvancedCalculusSVG,
  LinearAlgebraSVG,
  DifferentialEquationsSVG,
  NumericalMethodsSVG,
  MultivariableCalculusSVG,
  StatisticalInferenceSVG,
  BayesianReasoningSVG,
  FourierAnalysisSVG,
  ComplexNumbersPhasorsSVG,
  VectorFieldsGradientsSVG,
  DiscreteGraphTheorySVG,
  MathematicalModelingSVG,
  QuantumTunnelingSVG,
  MichelsonInterferometerSVG,
  ZeemanEffectSVG,
  SuperconductivityMeissnerSVG,
  BraggDiffractionSVG,
  RelativisticKinematicsSVG,
  NmrSpectroscopySVG,
  XpsSpectroscopySVG,
  HplcChromatographySVG,
  TransitionMetalComplexesSVG,
  EisElectrochemistrySVG,
  QuantumChemistryOrbitalsSVG,
  PcrGelElectrophoresisSVG,
  CrisprGeneEditingSVG,
  RecombinantDnaTransformationSVG,
  FlowCytometrySVG,
  WesternBlottingSVG,
  MetabolicPathwayFluxSVG
} from "@/components/labs/UnfinishedLabSVGs";

export type GradeLevel = "ประถม" | "มัธยมต้น" | "มัธยมปลาย" | "อุดมศึกษา";

export interface LabData {
  id: string;
  title: string;
  thaiTitle: string;
  category: "Physics" | "Chemistry" | "Biology" | "Mathematics" | "Foundation";
  gradeLevel: GradeLevel;
  status: "ว่าง" | string;
  description: string;
}

interface LabCardProps {
  lab: LabData;
  onEnterRoom?: (id: string) => void;
}

// 1. SVG Illustration for Physics (Newton's law of cooling)
// Ice cube with thermometer showing cold
const NewtonCooldownSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />

    {/* Ice Cube Isometric Shape */}
    <g transform="translate(45, 30)">
      {/* Front Left Face */}
      <path d="M35,42 L12,30 L12,54 L35,66 Z" fill="#93c5fd" opacity="0.8" />
      {/* Front Right Face */}
      <path d="M35,42 L58,30 L58,54 L35,66 Z" fill="#60a5fa" opacity="0.9" />
      {/* Top Face */}
      <path d="M35,42 L12,30 L35,18 L58,30 Z" fill="#bfdbfe" />
      {/* Sparkles / Highlights on Ice */}
      <path d="M35,44 L15,34" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M35,44 L55,34" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </g>

    {/* Thermometer */}
    <g transform="translate(108, 15)">
      {/* Glass Body */}
      <rect x="14" y="5" width="10" height="70" rx="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      {/* Bulb at the bottom */}
      <circle cx="19" cy="72" r="12" fill="#ef4444" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx="19" cy="72" r="10" fill="#ef4444" />

      {/* Red liquid column (low temperature for cooling) */}
      <rect x="17" y="45" width="4" height="25" fill="#ef4444" />

      {/* Measurement notches */}
      <line x1="24" y1="15" x2="27" y2="15" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="24" y1="25" x2="27" y2="25" stroke="#ef4444" strokeWidth="1.5" />
      <line x1="24" y1="35" x2="27" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="24" y1="45" x2="27" y2="45" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Temperature glare line */}
      <path d="M17,10 L17,68" stroke="#ffffff" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
    </g>

    {/* Cold Sparkles */}
    <circle cx="45" cy="40" r="1.5" fill="#60a5fa" />
    <circle cx="145" cy="75" r="2" fill="#3b82f6" className="animate-pulse" />
    <path d="M140,30 L145,35 M145,30 L140,35" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 2. SVG Illustration for Chemistry (Acid-Base Titration Lab)
// Flask and burette
const TitrationSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />

    {/* Burette Stand & Tube */}
    <g transform="translate(100, 10)">
      {/* Base & Stand shaft */}
      <rect x="18" y="90" width="30" height="4" fill="#64748b" />
      <line x1="20" y1="20" x2="20" y2="90" stroke="#94a3b8" strokeWidth="3" />

      {/* Clamp */}
      <path d="M8,45 L20,45" stroke="#475569" strokeWidth="4" />

      {/* Burette Glass Column */}
      <rect x="4" y="5" width="8" height="65" rx="1.5" fill="rgba(255, 255, 255, 0.8)" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Active liquid inside burette */}
      <rect x="6" y="25" width="4" height="40" fill="#c084fc" opacity="0.7" />

      {/* Stopcock valve */}
      <circle cx="8" cy="72" r="3" fill="#a855f7" />

      {/* Drop falling */}
      <circle cx="8" cy="85" r="2" fill="#c084fc" className="animate-bounce" />
    </g>

    {/* Laboratory Flask */}
    <g transform="translate(68, 52)">
      {/* Flask Body */}
      <path d="M26,8 L26,20 L12,42 A8,8 0 0,0 18,54 L44,54 A8,8 0 0,0 50,42 L36,20 L36,8 Z" fill="rgba(255, 255, 255, 0.9)" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" />
      {/* Liquid inside flask */}
      <path d="M16,40 L46,40 A8,8 0 0,1 50,42 L44,54 L18,54 A8,8 0 0,1 12,42 Z" fill="#a855f7" opacity="0.75" />
      {/* Bubbles in flask */}
      <circle cx="25" cy="46" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="36" cy="48" r="2" fill="#ffffff" opacity="0.7" />
    </g>

    {/* Chemical Sparkles */}
    <circle cx="60" cy="40" r="2" fill="#a855f7" className="animate-pulse" />
    <circle cx="148" cy="50" r="1.5" fill="#c084fc" />
  </svg>
);

const PeriodicTableSVG = () => (
  <svg className="h-32 w-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="pt-h-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
      <linearGradient id="pt-he-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#5b21b6" />
      </linearGradient>
      <linearGradient id="pt-li-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="pt-bg-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#f3e8ff" stopOpacity="0.4" />
      </linearGradient>
      <filter id="pt-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.15" />
      </filter>
    </defs>

    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    <rect x="25" y="15" width="150" height="90" rx="16" fill="url(#pt-bg-grad)" stroke="#cbd5e1" strokeWidth="1.5" />

    {/* Orbit lines (Bohr Atom) */}
    <g transform="translate(62, 60)" opacity="0.85">
      <circle cx="0" cy="0" r="30" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3 3" />
      <ellipse cx="0" cy="0" rx="20" ry="12" stroke="#60a5fa" strokeWidth="1.2" transform="rotate(30)" />
      <ellipse cx="0" cy="0" rx="20" ry="12" stroke="#34d399" strokeWidth="1.2" transform="rotate(-30)" />

      {/* Glowing Nucleus */}
      <circle cx="0" cy="0" r="6" fill="#7c3aed" />
      <circle cx="-3" cy="2" r="4.5" fill="#f59e0b" opacity="0.9" />
      <circle cx="2" cy="-2" r="4.5" fill="#3b82f6" opacity="0.9" />

      {/* Orbiting Electrons */}
      <circle cx="15" cy="-25" r="3" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
      <circle cx="-16" cy="12" r="3" fill="#34d399" stroke="#ffffff" strokeWidth="1" />
      <circle cx="17" cy="10" r="3" fill="#f43f5e" stroke="#ffffff" strokeWidth="1" />
    </g>

    {/* Stylized Chemistry Element tiles (stacked) */}
    <g transform="translate(120, 22)">
      {/* Li Tile */}
      <g transform="translate(24, 28)" filter="url(#pt-shadow)">
        <rect width="26" height="26" rx="6" fill="url(#pt-li-grad)" stroke="#bfdbfe" strokeWidth="1" />
        <text x="4" y="9" fill="#93c5fd" fontSize="6" fontWeight="bold">3</text>
        <text x="13" y="19" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">Li</text>
      </g>
      {/* He Tile */}
      <g transform="translate(12, 12)" filter="url(#pt-shadow)">
        <rect width="26" height="26" rx="6" fill="url(#pt-he-grad)" stroke="#ddd6fe" strokeWidth="1" />
        <text x="4" y="9" fill="#c084fc" fontSize="6" fontWeight="bold">2</text>
        <text x="13" y="19" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">He</text>
      </g>
      {/* H Tile */}
      <g transform="translate(0, -4)" filter="url(#pt-shadow)">
        <rect width="26" height="26" rx="6" fill="url(#pt-h-grad)" stroke="#fecaca" strokeWidth="1" />
        <text x="4" y="9" fill="#fca5a5" fontSize="6" fontWeight="bold">1</text>
        <text x="13" y="19" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">H</text>
      </g>
    </g>
  </svg>
);

const MathConceptSVG = () => (
  <svg className="h-32 w-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.5" />
    <rect x="35" y="24" width="130" height="72" rx="14" fill="#ffffff" stroke="#c4b5fd" strokeWidth="2" />
    <path d="M52 78H150" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
    <path d="M60 86V38" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
    <path d="M60 76 C82 70 92 56 108 58 C124 60 132 42 150 36" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" fill="none" />
    <circle cx="60" cy="76" r="4" fill="#7c3aed" />
    <circle cx="108" cy="58" r="4" fill="#2563eb" />
    <circle cx="150" cy="36" r="4" fill="#10b981" />
    <g transform="translate(43 31)">
      <rect width="42" height="20" rx="10" fill="#f5f3ff" stroke="#ddd6fe" />
      <text x="21" y="14" textAnchor="middle" fontSize="9" fontWeight="900" fill="#6d28d9">y = mx+b</text>
    </g>
    <g transform="translate(116 68)">
      <rect width="38" height="18" rx="9" fill="#eef2ff" stroke="#c7d2fe" />
      <text x="19" y="12" textAnchor="middle" fontSize="8" fontWeight="900" fill="#4338ca">data</text>
    </g>
  </svg>
);

const GraphingLinesCardSVG = () => (
  <svg data-testid="graphing-lines-card-svg" className="h-32 w-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="gl-line-grad" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#4f46e5" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
      <linearGradient id="gl-bg-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#ede9fe" stopOpacity="0.4" />
      </linearGradient>
      <filter id="gl-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#0f172a" floodOpacity="0.1" />
      </filter>
    </defs>

    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.4" />
    <rect x="25" y="15" width="150" height="90" rx="16" fill="url(#gl-bg-grad)" stroke="#cbd5e1" strokeWidth="1.5" />

    {/* Grid Lines */}
    <g stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="2 2">
      <line x1="45" y1="15" x2="45" y2="105" />
      <line x1="65" y1="15" x2="65" y2="105" />
      <line x1="85" y1="15" x2="85" y2="105" />
      <line x1="105" y1="15" x2="105" y2="105" />
      <line x1="125" y1="15" x2="125" y2="105" />
      <line x1="145" y1="15" x2="145" y2="105" />
      <line x1="165" y1="15" x2="165" y2="105" />

      <line x1="25" y1="30" x2="175" y2="30" />
      <line x1="25" y1="45" x2="175" y2="45" />
      <line x1="25" y1="60" x2="175" y2="60" />
      <line x1="25" y1="75" x2="175" y2="75" />
      <line x1="25" y1="90" x2="175" y2="90" />
    </g>

    {/* Axes */}
    <line x1="45" y1="100" x2="165" y2="100" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="55" y1="20" x2="55" y2="102" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

    {/* Slope Triangle */}
    <path d="M95,68H135V38" stroke="#f97316" strokeWidth="2" strokeDasharray="3 2" strokeLinecap="round" strokeLinejoin="round" />

    {/* Function Line */}
    <line x1="45" y1="83" x2="155" y2="29" stroke="url(#gl-line-grad)" strokeWidth="4" strokeLinecap="round" />

    {/* Intercepts and Points */}
    <circle cx="55" cy="78" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="95" cy="68" r="4" fill="#a78bfa" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="135" cy="38" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />

    <text x="61" y="75" fill="#1e3a8a" fontSize="7" fontWeight="bold">b</text>

    {/* Labels */}
    <g transform="translate(100, 78)">
      <rect x="0" y="0" width="46" height="15" rx="6.5" fill="#fff7ed" stroke="#fed7aa" strokeWidth="1" />
      <text x="23" y="10.5" fill="#ea580c" fontSize="7" fontWeight="black" textAnchor="middle">rise/run</text>
    </g>

    {/* Formula Card */}
    <g transform="translate(112, 90)" filter="url(#gl-shadow)">
      <rect width="52" height="18" rx="7" fill="#ffffff" stroke="#c4b5fd" strokeWidth="1" />
      <text x="26" y="12" fill="#4f46e5" fontSize="8" fontWeight="bold" textAnchor="middle">y = mx + b</text>
    </g>
  </svg>
);

const RatioProportionCardSVG = () => (
  <svg data-testid="ratio-and-proportion-card-svg" className="h-32 w-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="rp-mix-1" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="rp-mix-2" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
      <linearGradient id="rp-bg-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#ede9fe" stopOpacity="0.4" />
      </linearGradient>
      <filter id="rp-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.1" />
      </filter>
    </defs>

    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.4" />
    <rect x="25" y="15" width="150" height="90" rx="16" fill="url(#rp-bg-grad)" stroke="#cbd5e1" strokeWidth="1.5" />

    {/* Left Cylinder (Small) */}
    <g transform="translate(42, 28)">
      <rect x="0" y="0" width="22" height="60" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Graduated markings */}
      <line x1="3" y1="12" x2="8" y2="12" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="3" y1="24" x2="12" y2="24" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="3" y1="36" x2="8" y2="36" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="3" y1="48" x2="12" y2="48" stroke="#cbd5e1" strokeWidth="1" />

      {/* Liquid filling */}
      <rect x="2" y="24" width="18" height="34" rx="2" fill="url(#rp-mix-1)" opacity="0.85" />
      <rect x="2" y="40" width="18" height="18" rx="2" fill="url(#rp-mix-2)" opacity="0.9" />
      <text x="11" y="72" fill="#475569" fontSize="8" fontWeight="bold" textAnchor="middle">2 : 3</text>
    </g>

    {/* Right Cylinder (Large) */}
    <g transform="translate(136, 28)">
      <rect x="0" y="0" width="22" height="60" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Graduated markings */}
      <line x1="3" y1="12" x2="8" y2="12" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="3" y1="24" x2="12" y2="24" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="3" y1="36" x2="8" y2="36" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="3" y1="48" x2="12" y2="48" stroke="#cbd5e1" strokeWidth="1" />

      {/* Proportional filling */}
      <rect x="2" y="24" width="18" height="34" rx="2" fill="url(#rp-mix-1)" opacity="0.85" />
      <rect x="2" y="40" width="18" height="18" rx="2" fill="url(#rp-mix-2)" opacity="0.9" />
      <text x="11" y="72" fill="#475569" fontSize="8" fontWeight="bold" textAnchor="middle">8 : 12</text>
    </g>

    {/* Connecting Scaling Path */}
    <path d="M72,52 Q100,32 128,52" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" fill="none" />
    <path d="M128,52 L121,48 M128,52 L124,58" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Scale Factor Chip */}
    <g transform="translate(85, 23)" filter="url(#rp-shadow)">
      <rect width="30" height="15" rx="7.5" fill="#ecfeff" stroke="#bae6fd" strokeWidth="1" />
      <text x="15" y="10.5" fill="#0891b2" fontSize="8" fontWeight="black" textAnchor="middle">x4</text>
    </g>

    {/* Ratio Equivalence Card */}
    <g transform="translate(74, 60)" filter="url(#rp-shadow)">
      <rect width="52" height="20" rx="8" fill="#ffffff" stroke="#ddd6fe" strokeWidth="1.5" />
      <text x="26" y="13.5" fill="#0f172a" fontSize="10" fontWeight="black" textAnchor="middle">2:3 = 8:12</text>
    </g>
  </svg>
);

const VectorAdditionCardSVG = () => (
  <svg data-testid="vector-addition-card-svg" className="h-32 w-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="va-a-grad" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#a78bfa" />
      </linearGradient>
      <linearGradient id="va-b-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
      <linearGradient id="va-r-grad" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
      <linearGradient id="va-bg-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#ede9fe" stopOpacity="0.4" />
      </linearGradient>
      <filter id="va-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.15" />
      </filter>
    </defs>

    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.4" />
    <rect x="25" y="15" width="150" height="90" rx="16" fill="url(#va-bg-grad)" stroke="#cbd5e1" strokeWidth="1.5" />

    {/* Grid Line background */}
    <g stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="2 2">
      <line x1="45" y1="15" x2="45" y2="105" />
      <line x1="75" y1="15" x2="75" y2="105" />
      <line x1="105" y1="15" x2="105" y2="105" />
      <line x1="135" y1="15" x2="135" y2="105" />
      <line x1="155" y1="15" x2="155" y2="105" />

      <line x1="25" y1="35" x2="175" y2="35" />
      <line x1="25" y1="55" x2="175" y2="55" />
      <line x1="25" y1="75" x2="175" y2="75" />
      <line x1="25" y1="95" x2="175" y2="95" />
    </g>

    {/* Center Origin Axis lines */}
    <line x1="35" y1="95" x2="165" y2="95" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="45" y1="20" x2="45" y2="105" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

    {/* Vector A */}
    <path d="M45,95 L105,55" stroke="url(#va-a-grad)" strokeWidth="4" strokeLinecap="round" filter="url(#va-shadow)" />
    <path d="M105,55 L96,54 M105,55 L101,64" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

    {/* Vector B */}
    <path d="M105,55 L145,85" stroke="url(#va-b-grad)" strokeWidth="4" strokeLinecap="round" filter="url(#va-shadow)" />
    <path d="M145,85 L136,83 M145,85 L142,76" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

    {/* Resultant Vector R */}
    <path d="M45,95 L145,85" stroke="url(#va-r-grad)" strokeWidth="3" strokeDasharray="4 3" strokeLinecap="round" filter="url(#va-shadow)" />
    <path d="M145,85 L137,88 M145,85 L139,78" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

    {/* Labels */}
    <text x="68" y="70" fill="#6d28d9" fontSize="9" fontWeight="bold">A</text>
    <text x="130" y="65" fill="#0891b2" fontSize="9" fontWeight="bold">B</text>

    <g transform="translate(85, 98)">
      <rect width="32" height="15" rx="6" fill="#fff5f5" stroke="#feb2b2" strokeWidth="1" />
      <text x="16" y="10.5" fill="#e53e3e" fontSize="8" fontWeight="black" textAnchor="middle">R</text>
    </g>
  </svg>
);

const CenterVariabilityCardSVG = () => (
  <svg data-testid="center-and-variability-card-svg" className="h-32 w-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="cv-box-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.45" />
      </linearGradient>
      <linearGradient id="cv-bg-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#ede9fe" stopOpacity="0.4" />
      </linearGradient>
      <filter id="cv-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="1" dy="2" stdDeviation="1.2" floodColor="#0f172a" floodOpacity="0.12" />
      </filter>
    </defs>

    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.4" />
    <rect x="25" y="15" width="150" height="90" rx="16" fill="url(#cv-bg-grad)" stroke="#cbd5e1" strokeWidth="1.5" />

    {/* Axis scale */}
    <line x1="35" y1="78" x2="165" y2="78" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

    {/* Tick marks */}
    {[40, 60, 80, 100, 120, 140, 160].map((x) => (
      <line key={x} x1={x} y1="78" x2={x} y2="83" stroke="#94a3b8" strokeWidth="1.5" />
    ))}

    {/* Statistical Dot Plot */}
    {[
      [40, 72], [60, 72], [80, 72], [100, 72], [120, 72], [140, 72], [160, 72],
      [80, 64], [100, 64], [120, 64], [100, 56]
    ].map(([x, y], idx) => (
      <circle key={`${x}-${idx}`} cx={x} cy={y} r="3.8" fill="#06b6d4" stroke="#ffffff" strokeWidth="1" />
    ))}

    {/* Whisker lines */}
    <line x1="50" y1="36" x2="150" y2="36" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="50" y1="30" x2="50" y2="42" stroke="#4f46e5" strokeWidth="1.5" />
    <line x1="150" y1="30" x2="150" y2="42" stroke="#4f46e5" strokeWidth="1.5" />

    {/* Box Plot Body */}
    <g filter="url(#cv-shadow)">
      <rect x="75" y="24" width="50" height="24" rx="3" fill="url(#cv-box-grad)" stroke="#7c3aed" strokeWidth="2" />
      {/* Median line */}
      <line x1="100" y1="24" x2="100" y2="48" stroke="#7c3aed" strokeWidth="2.5" />
    </g>

    {/* Brackets & text labels */}
    <path d="M75,20 H125" stroke="#7c3aed" strokeWidth="1" strokeLinecap="round" />
    <path d="M75,18 V22 M125,18 V22" stroke="#7c3aed" strokeWidth="1" />

    <text x="100" y="14" fill="#6d28d9" fontSize="7" fontWeight="black" textAnchor="middle">IQR</text>
    <text x="145" y="93" fill="#64748b" fontSize="6.5" fontWeight="bold">Center</text>
    <text x="100" y="93" fill="#0891b2" fontSize="7" fontWeight="bold" textAnchor="middle">Median</text>
  </svg>
);

const CurveFittingCardSVG = () => (
  <svg data-testid="curve-fitting-card-svg" className="h-32 w-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="cf-line-grad" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#4f46e5" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
      <linearGradient id="cf-bg-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#ede9fe" stopOpacity="0.4" />
      </linearGradient>
      <filter id="cf-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.12" />
      </filter>
    </defs>

    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.4" />
    <rect x="25" y="15" width="150" height="90" rx="16" fill="url(#cf-bg-grad)" stroke="#cbd5e1" strokeWidth="1.5" />

    {/* Grid Background */}
    <g stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="2 2">
      <line x1="45" y1="15" x2="45" y2="105" />
      <line x1="75" y1="15" x2="75" y2="105" />
      <line x1="105" y1="15" x2="105" y2="105" />
      <line x1="135" y1="15" x2="135" y2="105" />

      <line x1="25" y1="35" x2="175" y2="35" />
      <line x1="25" y1="55" x2="175" y2="55" />
      <line x1="25" y1="75" x2="175" y2="75" />
    </g>

    {/* Axes */}
    <line x1="35" y1="95" x2="165" y2="95" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="45" y1="20" x2="45" y2="102" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

    {/* Residual error lines (dashed vertical offsets) */}
    {[
      [55, 85, 78],
      [75, 60, 68],
      [95, 62, 58],
      [115, 45, 48],
      [135, 34, 38],
      [155, 26, 28]
    ].map(([x, y1, y2], idx) => (
      <line key={idx} x1={x} y1={y1} x2={x} y2={y2} stroke="#f97316" strokeWidth="1.5" strokeDasharray="2 2" />
    ))}

    {/* Shaded Regression line */}
    <path d="M45,85 C75,75 105,60 135,40 C145,33 155,27 165,22" stroke="url(#cf-line-grad)" strokeWidth="4" strokeLinecap="round" fill="none" />

    {/* Data points */}
    {[
      [55, 85], [75, 60], [95, 62], [115, 45], [135, 34], [155, 26]
    ].map(([x, y], idx) => (
      <circle key={idx} cx={x} cy={y} r="4" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
    ))}

    {/* R2 statistics card */}
    <g transform="translate(106, 68)" filter="url(#cf-shadow)">
      <rect width="48" height="18" rx="8" fill="#ffffff" stroke="#bae6fd" strokeWidth="1.2" />
      <text x="24" y="12" fill="#0891b2" fontSize="8" fontWeight="black" textAnchor="middle">R² = 0.98</text>
    </g>
  </svg>
);

const FunctionBuilderCardSVG = () => (
  <svg data-testid="function-builder-card-svg" className="h-32 w-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="fb-in-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <linearGradient id="fb-out-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
      <linearGradient id="fb-box-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
      <linearGradient id="fb-bg-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#ede9fe" stopOpacity="0.4" />
      </linearGradient>
      <filter id="fb-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.15" />
      </filter>
    </defs>

    <circle cx="100" cy="60" r="45" fill="#ede9fe" opacity="0.4" />
    <rect x="25" y="15" width="150" height="90" rx="16" fill="url(#fb-bg-grad)" stroke="#cbd5e1" strokeWidth="1.5" />

    {/* Input x card */}
    <g transform="translate(36, 42)" filter="url(#fb-shadow)">
      <rect width="26" height="26" rx="8" fill="#ffffff" stroke="#06b6d4" strokeWidth="1.5" />
      <text x="13" y="18" fill="#0891b2" fontSize="12" fontWeight="black" textAnchor="middle">x</text>
    </g>

    {/* Input flow arrow */}
    <path d="M68,55 L82,55" stroke="url(#fb-in-grad)" strokeWidth="3" strokeLinecap="round" />
    <path d="M82,55 L77,51 M82,55 L77,59" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

    {/* Function Machine */}
    <g transform="translate(86, 32)" filter="url(#fb-shadow)">
      <rect width="36" height="46" rx="10" fill="url(#fb-box-grad)" stroke="#c4b5fd" strokeWidth="1.5" />
      {/* Screen area */}
      <rect x="5" y="6" width="26" height="14" rx="4" fill="#1e1b4b" />
      <text x="18" y="16" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">f(x)</text>

      {/* Settings wheels/dots */}
      <circle cx="11" cy="30" r="2.5" fill="#34d399" />
      <circle cx="18" cy="30" r="2.5" fill="#fbbf24" />
      <circle cx="25" cy="30" r="2.5" fill="#f87171" />
      <line x1="8" y1="38" x2="28" y2="38" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
    </g>

    {/* Output flow arrow */}
    <path d="M128,55 L142,55" stroke="url(#fb-out-grad)" strokeWidth="3" strokeLinecap="round" />
    <path d="M142,55 L137,51 M142,55 L137,59" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

    {/* Output y card */}
    <g transform="translate(148, 42)" filter="url(#fb-shadow)">
      <rect width="26" height="26" rx="8" fill="#ffffff" stroke="#f97316" strokeWidth="1.5" />
      <text x="13" y="18" fill="#ea580c" fontSize="12" fontWeight="black" textAnchor="middle">y</text>
    </g>

    {/* Formula indicator underneath */}
    <rect x="55" y="86" width="90" height="12" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
    <text x="100" y="95" fill="#4b5563" fontSize="7" fontWeight="bold" textAnchor="middle">Equation: y = 2x + 1</text>
  </svg>
);

// 4. Boyle's Law SVG
const BoylesLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    <rect x="50" y="45" width="80" height="30" rx="2" fill="rgba(255,255,255,0.8)" stroke="#94a3b8" strokeWidth="2" />
    <rect x="110" y="46" width="6" height="28" fill="#a855f7" />
    <rect x="116" y="57" width="40" height="6" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
    <rect x="156" y="50" width="4" height="20" fill="#475569" />

    <circle cx="60" cy="55" r="2.5" fill="#a855f7" />
    <circle cx="70" cy="50" r="2.5" fill="#a855f7" className="animate-pulse" />
    <circle cx="65" cy="65" r="2.5" fill="#a855f7" />
    <circle cx="78" cy="60" r="2.5" fill="#a855f7" />
    <circle cx="85" cy="52" r="2.5" fill="#a855f7" />
    <circle cx="95" cy="58" r="2.5" fill="#a855f7" className="animate-pulse" />
    <circle cx="90" cy="68" r="2.5" fill="#a855f7" />
    <circle cx="75" cy="70" r="2.5" fill="#a855f7" />

    <g transform="translate(15, 45)">
      <circle cx="15" cy="15" r="12" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M15,15 L23,20" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
      <text x="15" y="24" fill="#94a3b8" fontSize="6" textAnchor="middle" fontWeight="bold">P</text>
    </g>
  </svg>
);

// 5. Charles's Law SVG
const CharlessLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    <path d="M90,105 L110,105 L104,85 L96,85 Z" fill="#64748b" stroke="#475569" strokeWidth="1.5" />
    <path d="M100,85 L100,80" stroke="#94a3b8" strokeWidth="2" />
    <path d="M100,70 Q95,78 100,83 Q105,78 100,70" fill="#f59e0b" className="animate-bounce" />
    <path d="M100,74 Q97,79 100,82 Q103,79 100,74" fill="#a855f7" />

    <rect x="70" y="20" width="60" height="50" rx="3" fill="rgba(255,255,255,0.85)" stroke="#94a3b8" strokeWidth="2" />
    <rect x="72" y="25" width="56" height="6" fill="#a855f7" />

    <circle cx="85" cy="40" r="2.5" fill="#a855f7" />
    <circle cx="115" cy="38" r="2.5" fill="#a855f7" className="animate-pulse" />
    <circle cx="100" cy="45" r="2.5" fill="#a855f7" />
    <circle cx="90" cy="55" r="2.5" fill="#a855f7" />
    <circle cx="110" cy="58" r="2.5" fill="#a855f7" className="animate-pulse" />
    <circle cx="120" cy="48" r="2.5" fill="#a855f7" />
  </svg>
);

// 6. Le Chatelier's Principle SVG
const LeChateliersPrincipleSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    <line x1="100" y1="30" x2="100" y2="90" stroke="#475569" strokeWidth="3" />
    <rect x="80" y="90" width="40" height="5" fill="#475569" rx="1" />

    <line x1="50" y1="40" x2="150" y2="40" stroke="#475569" strokeWidth="2" />
    <circle cx="100" cy="40" r="3" fill="#94a3b8" />

    <path d="M40,40 L45,65 H75 L80,40" stroke="#475569" strokeWidth="1.5" fill="none" />
    <path d="M46,63 H74 L78,45 H42 Z" fill="#a855f7" opacity="0.75" />

    <path d="M120,40 L125,65 H155 L160,40" stroke="#475569" strokeWidth="1.5" fill="none" />
    <path d="M126,63 H154 L158,45 H122 Z" fill="#c084fc" opacity="0.4" />

    <path d="M92,20 L108,20 M104,17 L108,20 L104,23" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M108,26 L92,26 M96,23 L92,26 L96,29" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 7. Beer-Lambert Law SVG
const BeerLambertLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    <rect x="85" y="25" width="30" height="70" rx="1" fill="rgba(255,255,255,0.7)" stroke="#94a3b8" strokeWidth="2" />
    <rect x="87" y="35" width="26" height="58" fill="#a855f7" opacity="0.75" />

    <path d="M20,60 L85,60" stroke="#f59e0b" strokeWidth="6" opacity="0.9" strokeLinecap="round" />
    <path d="M115,60 L180,60" stroke="#f59e0b" strokeWidth="2.5" opacity="0.5" strokeLinecap="round" />

    <text x="50" y="50" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">Light I₀</text>
    <text x="150" y="50" fill="#d97706" fontSize="8" fontWeight="bold" textAnchor="middle">Light I</text>
  </svg>
);

// 8. Hess's Law SVG
const HesssLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    <path d="M75,35 L80,85 A8,8 0 0,0 88,93 H112 A8,8 0 0,0 120,85 L125,35 Z" fill="rgba(255,255,255,0.9)" stroke="#94a3b8" strokeWidth="2" />
    <line x1="72" y1="35" x2="128" y2="35" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

    <path d="M81,80 A6,6 0 0,0 87,86 H113 A6,6 0 0,0 119,80 L122,50 H78 Z" fill="#a855f7" opacity="0.5" />

    <rect x="98" y="15" width="4" height="60" rx="1.5" fill="#ffffff" stroke="#475569" strokeWidth="1" />
    <circle cx="100" cy="74" r="5" fill="#a855f7" stroke="#475569" strokeWidth="1" />
    <rect x="99.5" y="45" width="1" height="30" fill="#a855f7" />

    <path d="M68,50 Q64,55 68,60" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" />
    <path d="M132,50 Q136,55 132,60" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" />
  </svg>
);

// 9. Galvanic Cell SVG
const GalvanicCellSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    <path d="M35,50 L38,85 A5,5 0 0,0 43,90 H67 A5,5 0 0,0 72,85 L75,50" stroke="#64748b" strokeWidth="1.5" fill="none" />
    <path d="M38,82 H72 L74,60 H36 Z" fill="#f3e8ff" />
    <rect x="42" y="40" width="8" height="42" fill="#a855f7" stroke="#7e22ce" strokeWidth="1" />

    <path d="M125,50 L128,85 A5,5 0 0,0 133,90 H157 A5,5 0 0,0 162,85 L165,50" stroke="#64748b" strokeWidth="1.5" fill="none" />
    <path d="M128,82 H162 L164,60 H126 Z" fill="#93c5fd" opacity="0.4" />
    <rect x="150" y="40" width="8" height="42" fill="#94a3b8" stroke="#475569" strokeWidth="1" />

    <path d="M60,65 L60,45 A10,10 0 0,1 80,35 H120 A10,10 0 0,1 140,45 L140,65" stroke="#e2e8f0" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M60,65 L60,45 A10,10 0 0,1 80,35 H120 A10,10 0 0,1 140,45 L140,65" stroke="#cbd5e1" strokeWidth="3" fill="none" strokeLinecap="round" />

    <path d="M46,40 L46,25 L90,25" stroke="#475569" strokeWidth="1.5" fill="none" />
    <path d="M154,40 L154,25 L110,25" stroke="#475569" strokeWidth="1.5" fill="none" />
    <circle cx="100" cy="25" r="9" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
    <text x="100" y="29" fill="#a855f7" fontSize="7" fontWeight="bold" textAnchor="middle" className="animate-pulse">V</text>
  </svg>
);

// 10. Chemical Kinetics SVG
const ChemicalKineticsSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />

    <g transform="translate(60, 45)">
      <circle cx="0" cy="0" r="8" fill="#a855f7" />
      <circle cx="14" cy="0" r="6" fill="#c084fc" />
      <path d="M7,-10 L7,10 M-3,0 L17,0" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" className="animate-ping" />
    </g>

    <g transform="translate(130, 70)">
      <circle cx="0" cy="0" r="7" fill="#a855f7" />
      <circle cx="12" cy="0" r="7" fill="#94a3b8" />
      <path d="M6,-8 L6,8 M-2,0 L14,0" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
    </g>

    <path d="M30,95 Q70,95 90,40 T150,95" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.6" />
    <text x="90" y="32" fill="#a855f7" fontSize="7" fontWeight="bold" textAnchor="middle">Ea</text>
  </svg>
);

// 11. Solubility Product SVG
const SolubilityProductSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    <path d="M65,30 L68,90 A6,6 0 0,0 74,96 H126 A6,6 0 0,0 132,90 L135,30" stroke="#64748b" strokeWidth="2" fill="none" />
    <path d="M68,88 H132 L133,48 H67 Z" fill="#f3e8ff" opacity="0.5" />

    <g className="animate-pulse">
      <circle cx="80" cy="60" r="3" fill="#a855f7" />
      <text x="80" y="62" fill="#ffffff" fontSize="5" textAnchor="middle">+</text>

      <circle cx="115" cy="55" r="3" fill="#c084fc" />
      <text x="115" y="57" fill="#ffffff" fontSize="5" textAnchor="middle">-</text>

      <circle cx="95" cy="72" r="3" fill="#a855f7" />
      <text x="95" y="74" fill="#ffffff" fontSize="5" textAnchor="middle">+</text>

      <circle cx="110" cy="78" r="3" fill="#c084fc" />
      <text x="110" y="80" fill="#ffffff" fontSize="5" textAnchor="middle">-</text>
    </g>

    <path d="M80,95 Q100,85 120,95 Z" fill="#a855f7" stroke="#7e22ce" strokeWidth="1.5" />
    <circle cx="90" cy="91" r="2.5" fill="#7e22ce" />
    <circle cx="105" cy="90" r="2" fill="#a855f7" />
    <circle cx="98" cy="92" r="2.5" fill="#c084fc" />
  </svg>
);

// 12. Avogadro's Law SVG
const AvogadrosLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    <rect x="35" y="35" width="50" height="50" rx="4" fill="rgba(255,255,255,0.8)" stroke="#94a3b8" strokeWidth="2" />
    <circle cx="45" cy="45" r="3" fill="#a855f7" />
    <circle cx="75" cy="48" r="3" fill="#a855f7" className="animate-pulse" />
    <circle cx="60" cy="60" r="3" fill="#a855f7" />
    <circle cx="48" cy="72" r="3" fill="#a855f7" />
    <circle cx="70" cy="70" r="3" fill="#a855f7" className="animate-pulse" />
    <text x="60" y="100" fill="#a855f7" fontSize="8" fontWeight="bold" textAnchor="middle">1 Mole O₂</text>

    <rect x="115" y="35" width="50" height="50" rx="4" fill="rgba(255,255,255,0.8)" stroke="#94a3b8" strokeWidth="2" />
    <g className="animate-pulse">
      <circle cx="125" cy="45" r="2.5" fill="#c084fc" /><circle cx="130" cy="45" r="2" fill="#a855f7" />
      <circle cx="150" cy="50" r="2.5" fill="#c084fc" /><circle cx="155" cy="50" r="2" fill="#a855f7" />
      <circle cx="135" cy="65" r="2.5" fill="#c084fc" /><circle cx="140" cy="65" r="2" fill="#a855f7" />
      <circle cx="128" cy="75" r="2.5" fill="#c084fc" /><circle cx="133" cy="75" r="2" fill="#a855f7" />
      <circle cx="152" cy="72" r="2.5" fill="#c084fc" /><circle cx="157" cy="72" r="2" fill="#a855f7" />
    </g>
    <text x="140" y="100" fill="#a855f7" fontSize="8" fontWeight="bold" textAnchor="middle">1 Mole CO₂</text>
  </svg>
);

// 13. Electrolysis SVG
const ElectrolysisSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    <path d="M60,40 L63,90 A5,5 0 0,0 68,95 H132 A5,5 0 0,0 137,90 L140,40" stroke="#64748b" strokeWidth="2" fill="none" />
    <path d="M63,88 H137 L139,52 H61 Z" fill="#f3e8ff" opacity="0.5" />

    <rect x="75" y="30" width="8" height="50" fill="#475569" />
    <rect x="117" y="30" width="8" height="50" fill="#a855f7" />

    <circle cx="80" cy="45" r="1.5" fill="#ffffff" opacity="0.8" className="animate-bounce" />
    <circle cx="78" cy="60" r="2" fill="#ffffff" opacity="0.8" />
    <circle cx="81" cy="70" r="1.5" fill="#ffffff" opacity="0.8" className="animate-bounce" />

    <circle cx="119" cy="50" r="2" fill="#ffffff" opacity="0.8" className="animate-bounce" />
    <circle cx="122" cy="62" r="1.5" fill="#ffffff" opacity="0.8" />
    <circle cx="120" cy="72" r="2" fill="#ffffff" opacity="0.8" className="animate-bounce" />

    <rect x="93" y="10" width="14" height="18" fill="#475569" rx="1" />
    <path d="M79,30 L79,18 L93,18" stroke="#475569" strokeWidth="1.5" fill="none" />
    <path d="M121,30 L121,18 L107,18" stroke="#475569" strokeWidth="1.5" fill="none" />
  </svg>
);

// 14. Colligative Properties SVG
const ColligativePropertiesSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#f3e8ff" opacity="0.4" />
    <path d="M60,35 L63,85 A5,5 0 0,0 68,90 H132 A5,5 0 0,0 137,85 L140,35" stroke="#64748b" strokeWidth="2" fill="none" />
    <path d="M63,83 H137 L138,50 H62 Z" fill="#f3e8ff" opacity="0.6" />

    <circle cx="75" cy="65" r="3" fill="#a855f7" />
    <circle cx="95" cy="72" r="3" fill="#a855f7" className="animate-pulse" />
    <circle cx="115" cy="60" r="3" fill="#a855f7" />
    <circle cx="125" cy="75" r="3" fill="#a855f7" className="animate-pulse" />
    <circle cx="85" cy="78" r="3" fill="#a855f7" />
    <circle cx="105" cy="80" r="3" fill="#a855f7" />

    <circle cx="80" cy="55" r="1.5" fill="#a855f7" opacity="0.6" />
    <circle cx="110" cy="54" r="2" fill="#a855f7" opacity="0.6" />

    <path d="M85,25 Q82,18 85,12" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" className="animate-bounce" />
    <path d="M100,28 Q97,21 100,15" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M115,25 Q112,18 115,12" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" className="animate-bounce" />
  </svg>
);

// 15. Photosynthesis Rate Chamber SVG
const PhotosynthesisSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dcfce7" opacity="0.4" />

    {/* Sun in the top-right corner */}
    <g transform="translate(138, 12)">
      <circle cx="12" cy="12" r="8" fill="#f59e0b" className="animate-pulse" />
      <path d="M12,2 L12,0 M12,22 L12,24 M2,12 L0,12 M22,12 L24,12 M5,5 L3,3 M19,19 L21,21 M5,19 L3,21 M19,5 L21,3" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    {/* Chamber Dome (Semi-transparent) */}
    <g transform="translate(68, 30)">
      {/* Base */}
      <rect x="5" y="56" width="54" height="6" rx="2" fill="#475569" />

      {/* Plant inside pot */}
      <g transform="translate(18, 22)">
        {/* Pot */}
        <path d="M6,24 L22,24 L19,34 L9,34 Z" fill="#b45309" />
        {/* Stem */}
        <path d="M14,14 Q14,24 14,24" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
        {/* Leaves */}
        <path d="M14,15 Q8,10 9,6 Q16,8 14,15" fill="#22c55e" />
        <path d="M14,18 Q20,15 19,11 Q14,13 14,18" fill="#4ade80" />
        <path d="M14,22 Q7,21 8,16 Q13,18 14,22" fill="#15803d" />
      </g>

      {/* Glass Dome */}
      <path d="M10,56 C10,18 54,18 54,56 Z" fill="rgba(186, 230, 253, 0.25)" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="60 0" />
      {/* Reflection shine on dome */}
      <path d="M22,24 C28,21 44,22 46,30" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </g>

    {/* Sparkles / Oxygen bubbles */}
    <circle cx="58" cy="70" r="2.5" fill="#22c55e" className="animate-bounce" />
    <circle cx="140" cy="78" r="1.5" fill="#4ade80" />
  </svg>
);

// 16. Mendelian Genetics Lab SVG
const MendelsInheritanceSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dcfce7" opacity="0.4" />

    {/* Punnett Square Grid */}
    <g transform="translate(65, 25)">
      {/* Outer borders and lines */}
      <rect x="15" y="15" width="60" height="60" rx="4" fill="rgba(255, 255, 255, 0.85)" stroke="#16a34a" strokeWidth="2" />
      <line x1="45" y1="15" x2="45" y2="75" stroke="#16a34a" strokeWidth="1.5" />
      <line x1="15" y1="45" x2="75" y2="45" stroke="#16a34a" strokeWidth="1.5" />

      {/* Gametes labels */}
      <text x="30" y="8" fill="#15803d" fontSize="9.5" fontWeight="bold" textAnchor="middle">Y</text>
      <text x="60" y="8" fill="#15803d" fontSize="9.5" fontWeight="bold" textAnchor="middle">y</text>
      <text x="6" y="33" fill="#15803d" fontSize="9.5" fontWeight="bold" textAnchor="middle">Y</text>
      <text x="6" y="63" fill="#15803d" fontSize="9.5" fontWeight="bold" textAnchor="middle">y</text>

      {/* Genotypes inside grid */}
      <text x="30" y="34" fill="#16a34a" fontSize="8" fontWeight="bold" textAnchor="middle">YY</text>
      <circle cx="30" cy="40" r="3" fill="#22c55e" />

      <text x="60" y="34" fill="#16a34a" fontSize="8" fontWeight="bold" textAnchor="middle">Yy</text>
      <circle cx="60" cy="40" r="3" fill="#22c55e" />

      <text x="30" y="64" fill="#16a34a" fontSize="8" fontWeight="bold" textAnchor="middle">Yy</text>
      <circle cx="30" cy="70" r="3" fill="#22c55e" />

      <text x="60" y="64" fill="#ca8a04" fontSize="8" fontWeight="bold" textAnchor="middle">yy</text>
      <circle cx="60" cy="70" r="3" fill="#eab308" />
    </g>
  </svg>
);

// 17. Mitosis & Cell Cycle SVG
const MitosisDivisionSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dcfce7" opacity="0.4" />

    <path d="M60,60 C60,40 80,35 100,45 C120,35 140,40 140,60 C140,80 120,85 100,75 C80,85 60,80 60,60 Z" fill="rgba(255, 255, 255, 0.85)" stroke="#16a34a" strokeWidth="2" />

    <circle cx="68" cy="60" r="2.5" fill="#15803d" />
    <circle cx="132" cy="60" r="2.5" fill="#15803d" />

    <path d="M68,60 L92,48 M68,60 L95,54 M68,60 L95,66 M68,60 L92,72" stroke="#4ade80" strokeWidth="1" opacity="0.75" />
    <path d="M132,60 L108,48 M132,60 L105,54 M132,60 L105,66 M132,60 L108,72" stroke="#4ade80" strokeWidth="1" opacity="0.75" />

    <path d="M92,46 L86,48 L92,50" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M95,52 L89,54 L95,56" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M95,64 L89,66 L95,68" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M92,70 L86,72 L92,74" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

    <path d="M108,46 L114,48 L108,50" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M105,52 L111,54 L105,56" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M105,64 L111,66 L105,68" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M108,70 L114,72 L108,74" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 18. Osmosis & Plasmolysis SVG
const CellOsmosisSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dcfce7" opacity="0.4" />

    <path d="M60,35 L64,90 A6,6 0 0,0 70,96 H130 A6,6 0 0,0 136,90 L140,35" stroke="#64748b" strokeWidth="2" fill="none" />
    <path d="M64,88 H136 L138,55 H62 Z" fill="#dbeafe" opacity="0.5" />

    <line x1="100" y1="55" x2="100" y2="95" stroke="#16a34a" strokeWidth="2.2" strokeDasharray="3 3.5" />

    <circle cx="70" cy="65" r="2.2" fill="#3b82f6" />
    <circle cx="75" cy="78" r="2.2" fill="#3b82f6" />
    <circle cx="85" cy="60" r="2.2" fill="#3b82f6" />
    <circle cx="90" cy="85" r="2.2" fill="#3b82f6" />
    <circle cx="68" cy="88" r="2.2" fill="#3b82f6" />

    <circle cx="125" cy="88" r="2.2" fill="#3b82f6" />
    <circle cx="110" cy="60" r="2.2" fill="#3b82f6" />

    <circle cx="112" cy="74" r="5" fill="#15803d" />
    <circle cx="128" cy="66" r="5" fill="#15803d" />
    <circle cx="124" cy="80" r="5" fill="#15803d" />

    <path d="M86,72 L110,72 M104,69 L110,72 L104,75" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
  </svg>
);

// 19. Enzyme Catalysis Lab SVG
const EnzymeKineticsSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dcfce7" opacity="0.4" />

    <path d="M50,75 C50,45 75,45 85,55 C90,60 95,60 100,55 C110,45 135,45 135,75 C135,95 110,95 100,90 C90,95 50,95 50,75 Z" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
    <text x="92.5" y="80" fill="#ffffff" fontSize="7" fontWeight="bold">ENZYME</text>

    <path d="M84,32 C84,32 90,44 92.5,47.5 C95,51 100,51 102.5,47.5 C105,44 111,32 111,32 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
    <text x="97.5" y="27" fill="#ea580c" fontSize="7" fontWeight="bold" textAnchor="middle">SUBSTRATE</text>

    <path d="M97.5,33 L97.5,44 M94.5,41 L97.5,44 L100.5,41" stroke="#ea580c" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// 20. DNA Extraction Chamber SVG
const DnaExtractionSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dcfce7" opacity="0.4" />

    <g transform="translate(68, 20) rotate(15)">
      <rect x="12" y="10" width="26" height="70" rx="13" fill="rgba(255, 255, 255, 0.9)" stroke="#64748b" strokeWidth="2" />
      <path d="M13,50 L37,50 A12.5,12.5 0 0,1 25,79 A12.5,12.5 0 0,1 13,76 Z" fill="#14532d" opacity="0.85" />
      <rect x="13" y="30" width="24" height="20" fill="#a7f3d0" opacity="0.6" />

      <path d="M25,20 Q21,27 25,34 T25,48 T25,62" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M21,20 Q25,27 21,34 T21,48 T21,62" stroke="#4ade80" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      <line x1="21" y1="24" x2="25" y2="24" stroke="#ffffff" strokeWidth="1" />
      <line x1="21" y1="31" x2="25" y2="31" stroke="#ffffff" strokeWidth="1" />
      <line x1="21" y1="38" x2="25" y2="38" stroke="#ffffff" strokeWidth="1" />
      <line x1="21" y1="45" x2="25" y2="45" stroke="#ffffff" strokeWidth="1" />
      <line x1="21" y1="52" x2="25" y2="52" stroke="#ffffff" strokeWidth="1" />

      <rect x="23" y="-5" width="4" height="45" rx="2" fill="rgba(255,255,255,0.7)" stroke="#94a3b8" strokeWidth="1" />
    </g>
  </svg>
);

// 21. Cellular Respiration Lab SVG
const CellularRespirationSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dcfce7" opacity="0.4" />

    <ellipse cx="100" cy="60" rx="42" ry="24" fill="rgba(255, 255, 255, 0.85)" stroke="#15803d" strokeWidth="2.2" />
    <path d="M64,60 C64,52 68,46 72,46 C76,46 78,54 82,54 C86,54 88,44 92,44 C96,44 98,56 102,56 C106,56 108,46 112,46 C116,46 118,54 122,54 C126,54 128,48 132,48 C136,48 136,54 136,60 C136,66 132,72 128,72 C124,72 122,66 118,66 C114,66 112,74 108,74 C104,74 102,64 98,64 C94,64 92,72 88,72 C84,72 82,64 78,64 C74,64 72,70 68,70 C64,70 64,66 64,60 Z" stroke="#22c55e" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />

    <text x="35" y="44" fill="#15803d" fontSize="7" fontWeight="bold">Glucose</text>
    <path d="M40,48 L56,54" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round" />

    <text x="38" y="78" fill="#2563eb" fontSize="7" fontWeight="bold">O₂</text>
    <path d="M42,72 L58,66" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />

    <g transform="translate(142, 44)" className="animate-pulse">
      <path d="M12,0 L14,8 L22,8 L16,13 L18,21 L12,16 L6,21 L8,13 L2,8 L10,8 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
      <text x="12" y="13" fill="#854d0e" fontSize="6.5" fontWeight="bold" textAnchor="middle">ATP</text>
    </g>

    <text x="146" y="80" fill="#475569" fontSize="6.5" fontWeight="bold">CO₂ + H₂O</text>
  </svg>
);

// 22. Plant Transpiration Potometer SVG
const PlantTranspirationSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dcfce7" opacity="0.4" />

    <g transform="translate(50, 20)">
      <path d="M15,15 Q15,40 15,55" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15,20 Q5,14 8,8 Q17,11 15,20" fill="#22c55e" />
      <path d="M15,28 Q26,22 23,16 Q16,19 15,28" fill="#4ade80" />
      <path d="M15,38 Q4,35 6,28 Q14,31 15,38" fill="#15803d" />

      <path d="M3,6 Q6,2 9,6" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" className="animate-bounce" />
      <path d="M26,12 Q29,8 32,12" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
    </g>

    <g transform="translate(62, 70)">
      <rect x="0" y="0" width="10" height="15" fill="#dbeafe" stroke="#64748b" strokeWidth="1.5" />
      <path d="M5,10 L70,10 L70,-10 L85,-10" fill="none" stroke="#64748b" strokeWidth="2.5" />
      <path d="M5,10 L70,10 L70,-10 L85,-10" fill="none" stroke="#dbeafe" strokeWidth="1.2" />

      <circle cx="45" cy="10" r="1.5" fill="#22d3ee" className="animate-pulse" />
      <line x1="20" y1="13" x2="20" y2="7" stroke="#64748b" strokeWidth="1" />
      <line x1="30" y1="13" x2="30" y2="7" stroke="#64748b" strokeWidth="1" />
      <line x1="40" y1="13" x2="40" y2="7" stroke="#64748b" strokeWidth="1" />
      <line x1="50" y1="13" x2="50" y2="7" stroke="#64748b" strokeWidth="1" />
      <line x1="60" y1="13" x2="60" y2="7" stroke="#64748b" strokeWidth="1" />
    </g>
  </svg>
);

// 23. Natural Selection Simulator SVG
const NaturalSelectionSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dcfce7" opacity="0.4" />

    <path d="M35,90 Q70,70 140,85 C140,85 155,50 115,35 Q60,40 35,90 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" opacity="0.85" />
    <path d="M35,90 Q75,65 125,50" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

    <g transform="translate(68, 62) rotate(-15)">
      <ellipse cx="6" cy="10" rx="4.5" ry="6" fill="#15803d" />
      <circle cx="6" cy="3" r="2.5" fill="#14532d" />
      <line x1="6" y1="10" x2="6" y2="17" stroke="#14532d" strokeWidth="1" />
      <circle cx="4" cy="8" r="0.8" fill="#4ade80" />
      <circle cx="8" cy="11" r="0.8" fill="#4ade80" />
    </g>

    <g transform="translate(105, 52) rotate(15)">
      <ellipse cx="6" cy="10" rx="4.5" ry="6" fill="#b45309" />
      <circle cx="6" cy="3" r="2.5" fill="#78350f" />
      <line x1="6" y1="10" x2="6" y2="17" stroke="#78350f" strokeWidth="1" />
      <circle cx="4" cy="8" r="0.8" fill="#f97316" />
      <circle cx="8" cy="11" r="0.8" fill="#f97316" />
    </g>

    <g transform="translate(130, 20)">
      <path d="M0,35 L40,10 L30,48 Z" fill="#64748b" stroke="#475569" strokeWidth="1.5" />
      <line x1="16" y1="25" x2="35" y2="30" stroke="#475569" strokeWidth="1.5" />
      <circle cx="34" cy="18" r="2" fill="#000000" />
    </g>
  </svg>
);

// 24. Blood Typing & Agglutination SVG
const BloodTypingSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dcfce7" opacity="0.4" />

    <rect x="42" y="32" width="116" height="56" rx="8" fill="rgba(255, 255, 255, 0.9)" stroke="#94a3b8" strokeWidth="2" />

    <g transform="translate(62, 60)">
      <circle cx="0" cy="0" r="13" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="9.5" fill="#f43f5e" opacity="0.8" />
      <text x="0" y="3" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">A</text>
    </g>

    <g transform="translate(100, 60)">
      <circle cx="0" cy="0" r="13" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="-5" cy="-4" r="2.5" fill="#be123c" />
      <circle cx="4" cy="-5" r="2" fill="#be123c" />
      <circle cx="-3" cy="4" r="3" fill="#be123c" />
      <circle cx="5" cy="3" r="2.5" fill="#be123c" />
      <circle cx="0" cy="0" r="2" fill="#be123c" />
      <text x="0" y="3" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">B</text>
    </g>

    <g transform="translate(138, 60)">
      <circle cx="0" cy="0" r="13" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="-4" cy="-4" r="2" fill="#be123c" />
      <circle cx="5" cy="-3" r="2.5" fill="#be123c" />
      <circle cx="-4" cy="4" r="2.5" fill="#be123c" />
      <circle cx="4" cy="4" r="3" fill="#be123c" />
      <circle cx="0" cy="-1" r="2" fill="#be123c" />
      <text x="0" y="3" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">Rh</text>
    </g>
  </svg>
);

// 25. Food Chain & Ecology SVG
const FoodChainSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dcfce7" opacity="0.4" />

    <g transform="translate(60, 20)">
      <path d="M0,80 L80,80 L70,60 L10,60 Z" fill="#15803d" stroke="#14532d" strokeWidth="1.5" />
      <text x="40" y="73" fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">PRODUCERS</text>

      <path d="M10,60 L70,60 L60,40 L20,40 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
      <text x="40" y="52" fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">HERBIVORES</text>

      <path d="M20,40 L60,40 L50,20 L30,20 Z" fill="#4ade80" stroke="#22c55e" strokeWidth="1.5" />
      <text x="40" y="32" fill="#14532d" fontSize="6" fontWeight="bold" textAnchor="middle">CARNIVORES</text>

      <path d="M30,20 L50,20 L40,0 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
      <text x="40" y="14" fill="#854d0e" fontSize="5.5" fontWeight="bold" textAnchor="middle">APEX</text>

      <path d="M-12,75 L-12,15 M-16,25 L-12,15 L-8,25" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
      <text x="-20" y="48" fill="#ea580c" fontSize="6.5" fontWeight="bold" transform="rotate(-90 -20 48)" textAnchor="middle">ENERGY FLOW</text>
    </g>
  </svg>
);

// 26. Cardiovascular System Lab SVG
const HeartRateSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dcfce7" opacity="0.4" />

    <g transform="translate(68, 25)" className="animate-pulse">
      <path d="M16,28 C16,28 0,16 0,8 C0,1 6,-5 16,3 C26,-5 32,1 32,8 C32,16 16,28 16,28 Z" fill="#10b981" opacity="0.75" />
      <path d="M16,25 C16,25 3,14 3,7 C3,2.5 7.5,-2 16,5 C24.5,-2 29,2.5 29,7 C29,14 16,25 16,25 Z" fill="#34d399" opacity="0.9" />
    </g>

    <path d="M25,60 L75,60 L80,52 L85,68 L92,30 L98,90 L104,60 L108,54 L112,60 L120,60 L125,54 L130,60 L175,60" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M25,60 L75,60 L80,52 L85,68 L92,30 L98,90 L104,60 L108,54 L112,60 L120,60 L125,54 L130,60 L175,60" stroke="#4ade80" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
  </svg>
);

// 4. Ohm's Law SVG
const OhmsLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    {/* Battery */}
    <rect x="35" y="45" width="24" height="30" rx="3" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" />
    <rect x="43" y="40" width="8" height="5" fill="#2563eb" />
    <path d="M47,53 L47,67 M40,60 L54,60" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

    {/* Resistor */}
    <rect x="125" y="50" width="40" height="20" rx="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
    <rect x="133" y="50" width="4" height="20" fill="#ef4444" />
    <rect x="143" y="50" width="4" height="20" fill="#a855f7" />
    <rect x="153" y="50" width="4" height="20" fill="#f97316" />

    {/* Connecting Wires */}
    <path d="M59,60 L125,60 M165,60 L180,60 L180,95 L20,95 L20,60 L35,60" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round" />

    {/* Electrons */}
    <circle cx="80" cy="60" r="2.5" fill="#3b82f6" className="animate-pulse" />
    <circle cx="105" cy="60" r="2.5" fill="#3b82f6" />
    <circle cx="150" cy="95" r="2.5" fill="#3b82f6" className="animate-pulse" />
    <circle cx="90" cy="95" r="2.5" fill="#3b82f6" />

    <path d="M92,42 L100,50 M108,42 L100,50 M100,50 L100,40" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="100" cy="48" r="1.5" fill="#f59e0b" />
  </svg>
);

// 5. Hooke's Law SVG
const HookesLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <line x1="70" y1="20" x2="130" y2="20" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
    <line x1="75" y1="20" x2="70" y2="25" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="85" y1="20" x2="80" y2="25" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="95" y1="20" x2="90" y2="25" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="105" y1="20" x2="100" y2="25" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="115" y1="20" x2="110" y2="25" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="125" y1="20" x2="120" y2="25" stroke="#94a3b8" strokeWidth="1.5" />

    <path d="M100,20 L100,30 L90,34 L110,40 L90,46 L110,52 L90,58 L110,64 L90,70 L100,74 L100,80" stroke="#64748b" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

    <rect x="85" y="80" width="30" height="22" rx="3" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" />
    <text x="100" y="94" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">500g</text>

    <path d="M130,55 L130,85" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    <path d="M127,80 L130,85 L133,80" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="138" y="74" fill="#ef4444" fontSize="9" fontWeight="bold">F</text>
  </svg>
);

// 6. Snell's Law SVG
const SnellsLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <path d="M20,60 L180,60 L180,105 L20,105 Z" fill="#93c5fd" opacity="0.3" stroke="#60a5fa" strokeWidth="1.5" />
    <text x="25" y="48" fill="#64748b" fontSize="8" fontWeight="bold">Air (n₁)</text>
    <text x="25" y="78" fill="#2563eb" fontSize="8" fontWeight="bold">Glass (n₂)</text>

    <line x1="100" y1="20" x2="100" y2="100" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />

    <path d="M45,25 L100,60" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M100,60 L125,95" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

    <path d="M70,41 L73,43 L71,45" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    <path d="M112,77 L114,79 L112,81" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

    <path d="M100,45 A15,15 0 0,0 87,51" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
    <path d="M100,75 A15,15 0 0,1 109,73" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
    <text x="90" y="42" fill="#3b82f6" fontSize="7" fontWeight="bold">θ₁</text>
    <text x="108" y="85" fill="#3b82f6" fontSize="7" fontWeight="bold">θ₂</text>
  </svg>
);

// 7. Ideal Gas Law SVG
const IdealGasLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <path d="M60,25 L60,95 L140,95 L140,25" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

    <rect x="62" y="40" width="76" height="10" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
    <rect x="95" y="15" width="10" height="25" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
    <path d="M100,5 L100,20 M97,15 L100,20 L103,15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

    <circle cx="75" cy="60" r="3" fill="#3b82f6" />
    <path d="M79,60 L83,60" stroke="#3b82f6" strokeWidth="1" />

    <circle cx="120" cy="55" r="3" fill="#3b82f6" />
    <path d="M124,53 L128,51" stroke="#3b82f6" strokeWidth="1" />

    <circle cx="95" cy="70" r="3" fill="#3b82f6" />
    <path d="M91,72 L87,74" stroke="#3b82f6" strokeWidth="1" />

    <circle cx="70" cy="85" r="3" fill="#3b82f6" />
    <path d="M70,81 L70,77" stroke="#3b82f6" strokeWidth="1" />

    <circle cx="115" cy="80" r="3" fill="#3b82f6" />
    <path d="M119,82 L123,84" stroke="#3b82f6" strokeWidth="1" />

    <circle cx="130" cy="70" r="3" fill="#3b82f6" />
    <path d="M130,74 L130,78" stroke="#3b82f6" strokeWidth="1" />

    <circle cx="85" cy="50" r="3" fill="#3b82f6" />
    <path d="M82,47 L79,44" stroke="#3b82f6" strokeWidth="1" />

    <g transform="translate(145, 45)">
      <circle cx="15" cy="15" r="12" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
      <path d="M15,15 L22,7" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
      <text x="15" y="23" fill="#475569" fontSize="5" textAnchor="middle">P</text>
    </g>
  </svg>
);

// 8. Newton's Second Law SVG
const NewtonsSecondLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <line x1="20" y1="85" x2="180" y2="85" stroke="#475569" strokeWidth="2.5" />
    <line x1="40" y1="85" x2="35" y2="90" stroke="#94a3b8" strokeWidth="1" />
    <line x1="60" y1="85" x2="55" y2="90" stroke="#94a3b8" strokeWidth="1" />
    <line x1="80" y1="85" x2="75" y2="90" stroke="#94a3b8" strokeWidth="1" />
    <line x1="100" y1="85" x2="95" y2="90" stroke="#94a3b8" strokeWidth="1" />
    <line x1="120" y1="85" x2="115" y2="90" stroke="#94a3b8" strokeWidth="1" />
    <line x1="140" y1="85" x2="135" y2="90" stroke="#94a3b8" strokeWidth="1" />
    <line x1="160" y1="85" x2="155" y2="90" stroke="#94a3b8" strokeWidth="1" />

    <rect x="55" y="45" width="45" height="40" rx="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
    <text x="77" y="69" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">m</text>

    <path d="M100,65 L150,65" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
    <path d="M143,60 L150,65 L143,70" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <text x="125" y="55" fill="#10b981" fontSize="10" fontWeight="bold">F = ma</text>

    <path d="M65,33 L95,33" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 1" />
    <path d="M90,30 L95,33 L90,36" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="80" y="27" fill="#ef4444" fontSize="8" fontWeight="bold">a</text>
  </svg>
);

// 9. Conservation of Momentum SVG
const MomentumConservationSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <line x1="20" y1="80" x2="180" y2="80" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2" />

    <circle cx="60" cy="65" r="15" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
    <text x="60" y="69" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">m₁</text>
    <path d="M78,65 L100,65" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    <path d="M94,62 L100,65 L94,68" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="88" y="56" fill="#ef4444" fontSize="8" fontWeight="bold">v₁</text>

    <circle cx="145" cy="65" r="11" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
    <text x="145" y="68" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">m₂</text>
    <path d="M131,65 L115,65" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
    <path d="M121,62 L115,65 L121,68" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="120" y="56" fill="#3b82f6" fontSize="8" fontWeight="bold">v₂</text>

    <path d="M107,60 L108,55 M107,70 L108,75 M112,65 L117,65" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" className="animate-ping" />
  </svg>
);

// 10. Faraday's Law SVG
const FaradaysLawSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />

    <g transform="translate(30, 45) rotate(15)">
      <rect x="0" y="0" width="25" height="16" fill="#ef4444" rx="2" />
      <text x="12" y="12" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">N</text>
      <rect x="25" y="0" width="25" height="16" fill="#3b82f6" rx="2" />
      <text x="37" y="12" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">S</text>
      <path d="M55,8 L65,8 M61,5 L65,8 L61,11" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
    </g>

    <g transform="translate(110, 40)">
      <rect x="0" y="8" width="55" height="16" fill="#e2e8f0" rx="3" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M5,5 Q10,25 15,25 Q20,25 20,5 Q25,25 30,25 Q35,25 35,5 Q40,25 45,25 Q50,25 50,5" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      <path d="M0,16 L-10,16 L-10,60 L20,60 L20,40" stroke="#475569" strokeWidth="1.5" fill="none" />
      <path d="M55,16 L65,16 L65,60 L40,60 L40,40" stroke="#475569" strokeWidth="1.5" fill="none" />
    </g>

    <g transform="translate(130, 80)">
      <circle cx="10" cy="10" r="12" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
      <path d="M10,10 L16,4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" className="animate-bounce" />
      <text x="10" y="18" fill="#475569" fontSize="6" fontWeight="bold" textAnchor="middle">V</text>
    </g>
  </svg>
);

// 11. Bernoulli's Principle SVG
const BernoullisPrincipleSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />
    <path d="M20,35 Q60,35 80,48 L120,48 Q140,35 180,35" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M20,85 Q60,85 80,72 L120,72 Q140,85 180,85" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />

    <path d="M20,50 Q60,50 82,56 L118,56 Q140,50 180,50" stroke="#3b82f6" strokeWidth="1" opacity="0.8" />
    <path d="M20,60 H180" stroke="#60a5fa" strokeWidth="1.5" />
    <path d="M20,70 Q60,70 82,64 L118,64 Q140,70 180,70" stroke="#3b82f6" strokeWidth="1" opacity="0.8" />

    <circle cx="45" cy="60" r="2" fill="#1d4ed8" />
    <circle cx="100" cy="60" r="1.5" fill="#1d4ed8" className="animate-pulse" />
    <circle cx="155" cy="60" r="2" fill="#1d4ed8" />

    <rect x="45" y="15" width="8" height="20" fill="rgba(147, 197, 253, 0.4)" stroke="#64748b" strokeWidth="1.2" />
    <line x1="45" y1="23" x2="53" y2="23" stroke="#2563eb" strokeWidth="2.5" />

    <rect x="96" y="15" width="8" height="33" fill="rgba(147, 197, 253, 0.4)" stroke="#64748b" strokeWidth="1.2" />
    <line x1="96" y1="42" x2="104" y2="42" stroke="#2563eb" strokeWidth="2.5" />

    <text x="50" y="12" fill="#64748b" fontSize="7" textAnchor="middle">P₁</text>
    <text x="100" y="12" fill="#64748b" fontSize="7" textAnchor="middle">P₂</text>
  </svg>
);

// 12. Photoelectric Effect SVG
const PhotoelectricEffectSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />

    <path d="M20,15 Q30,5 40,15 T60,15 T80,15 L90,25" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
    <path d="M30,35 Q40,25 50,35 T70,35 T90,35 L100,45" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M85,25 L90,25 L88,20" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />

    <rect x="90" y="70" width="80" height="12" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
    <text x="130" y="93" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle">Metal Cathode</text>

    <g transform="translate(100, 30)">
      <circle cx="15" cy="30" r="3" fill="#10b981" />
      <text x="15" y="32.5" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">-</text>
      <path d="M12,33 L5,38" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />

      <circle cx="35" cy="20" r="3" fill="#10b981" />
      <text x="35" y="22.5" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">-</text>
      <path d="M32,23 L25,29" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />

      <circle cx="55" cy="32" r="3" fill="#10b981" />
      <text x="55" y="34.5" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">-</text>
      <path d="M52,35 L45,41" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </svg>
);

// 13. Kepler's Laws SVG
const KeplersLawsSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />

    <ellipse cx="100" cy="60" rx="70" ry="35" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />

    <path d="M80,60 L120,29 A70,35 0 0,1 155,42 Z" fill="#60a5fa" opacity="0.3" />

    <circle cx="80" cy="60" r="10" fill="#f59e0b" className="animate-pulse" stroke="#d97706" strokeWidth="1.5" />
    <circle cx="80" cy="60" r="8" fill="#f59e0b" />

    <circle cx="120" cy="29" r="4.5" fill="#3b82f6" stroke="#2563eb" strokeWidth="1" />
    <path d="M124,28 L138,24" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M133,23 L138,24 L135,28" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

    <circle cx="120" cy="60" r="1.5" fill="#64748b" opacity="0.5" />
  </svg>
);

// 14. Stefan-Boltzmann Law SVG
const StefanBoltzmannSVG = () => (
  <svg className="w-full h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="60" r="45" fill="#dbeafe" opacity="0.4" />

    <circle cx="100" cy="60" r="40" stroke="#f87171" strokeWidth="1.5" opacity="0.25" className="animate-ping" style={{ animationDuration: '3s' }} />
    <circle cx="100" cy="60" r="30" stroke="#f97316" strokeWidth="1.5" opacity="0.4" className="animate-ping" style={{ animationDuration: '2s' }} />
    <circle cx="100" cy="60" r="20" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />

    <circle cx="100" cy="60" r="12" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
    <circle cx="100" cy="60" r="9" fill="url(#stefanGlow)" opacity="0.9" />

    <defs>
      <radialGradient id="stefanGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ef4444" />
      </radialGradient>
    </defs>

    <text x="100" y="98" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">P = σAT⁴</text>
  </svg>
);

export default function LabCard({
  lab,
  onEnterRoom,
}: LabCardProps) {
  // Setup color styling depending on category
  const themeColors = {
    Physics: {
      border: "border-blue-100 hover:border-blue-300",
      accentBg: "bg-blue-50/50",
      accentText: "text-blue-600",
      glow: "soft-glow-physics",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-100",
      btnPrimary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/10",
      btnOutline: "border-blue-200 text-blue-600 hover:bg-blue-50/50",
      iconColor: "text-blue-500",
    },
    Chemistry: {
      border: "border-purple-100 hover:border-purple-300",
      accentBg: "bg-purple-50/50",
      accentText: "text-purple-600",
      glow: "soft-glow-chemistry",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-100",
      btnPrimary: "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/10",
      btnOutline: "border-purple-200 text-purple-700 hover:bg-purple-50/50",
      iconColor: "text-purple-500",
    },
    Biology: {
      border: "border-green-100 hover:border-green-300",
      accentBg: "bg-green-50/50",
      accentText: "text-green-600",
      glow: "soft-glow-biology",
      badgeColor: "bg-green-50 text-green-700 border-green-100",
      btnPrimary: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md shadow-green-500/10",
      btnOutline: "border-green-200 text-green-600 hover:bg-green-50/50",
      iconColor: "text-green-500",
    },
    Mathematics: {
      border: "border-pink-200 hover:border-pink-300",
      accentBg: "bg-pink-50/80",
      accentText: "text-pink-900",
      glow: "soft-glow-math",
      badgeColor: "bg-pink-50 text-pink-900 border-pink-200",
      btnPrimary: "bg-pink-200 hover:bg-pink-300 text-pink-900 shadow-sm shadow-pink-200/40",
      btnOutline: "border-pink-200 text-pink-900 hover:bg-pink-50/80",
      iconColor: "text-pink-700",
    },
    Foundation: {
      border: "border-sky-100 hover:border-sky-300",
      accentBg: "bg-sky-50/50",
      accentText: "text-sky-600",
      glow: "soft-glow-physics",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-100",
      btnPrimary: "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-md shadow-sky-500/10",
      btnOutline: "border-sky-200 text-sky-600 hover:bg-sky-50/50",
      iconColor: "text-sky-500",
    },
  }[lab.category] || {
    border: "border-slate-100 hover:border-slate-300",
    accentBg: "bg-slate-50",
    accentText: "text-slate-600",
    glow: "shadow-lg",
    badgeColor: "bg-slate-50 text-slate-700 border-slate-100",
    btnPrimary: "bg-slate-800 hover:bg-slate-900 text-white",
    btnOutline: "border-slate-200 text-slate-600 hover:bg-slate-50",
    iconColor: "text-slate-500",
  };
  const readiness = getLabReadiness(lab.id);

  // Render proper SVG
  const renderIllustration = () => {
    switch (lab.id) {
      case "newtons-cooling":
        return <NewtonCooldownSVG />;
      case "ohms-law":
        return <OhmsLawSVG />;
      case "hookes-law":
        return <HookesLawSVG />;
      case "snells-law":
        return <SnellsLawSVG />;
      case "ideal-gas-law":
        return <IdealGasLawSVG />;
      case "newtons-second-law":
        return <NewtonsSecondLawSVG />;
      case "momentum-conservation":
        return <MomentumConservationSVG />;
      case "faradays-law":
        return <FaradaysLawSVG />;
      case "bernoullis-principle":
        return <BernoullisPrincipleSVG />;
      case "photoelectric-effect":
        return <PhotoelectricEffectSVG />;
      case "keplers-laws":
        return <KeplersLawsSVG />;
      case "stefan-boltzmann":
        return <StefanBoltzmannSVG />;
      case "acid-base-titration":
        return <TitrationSVG />;
      case "periodic-table":
        return <PeriodicTableSVG />;
      case "boyles-law":
        return <BoylesLawSVG />;
      case "charles-law":
        return <CharlessLawSVG />;
      case "le-chateliers-principle":
        return <LeChateliersPrincipleSVG />;
      case "beer-lambert-law":
        return <BeerLambertLawSVG />;
      case "hesss-law":
        return <HesssLawSVG />;
      case "galvanic-cell":
        return <GalvanicCellSVG />;
      case "chemical-kinetics":
        return <ChemicalKineticsSVG />;
      case "solubility-product":
        return <SolubilityProductSVG />;
      case "avogadros-law":
        return <AvogadrosLawSVG />;
      case "electrolysis-lab":
        return <ElectrolysisSVG />;
      case "colligative-properties":
        return <ColligativePropertiesSVG />;
      case "photosynthesis-rate":
        return <PhotosynthesisSVG />;
      case "mendels-inheritance":
        return <MendelsInheritanceSVG />;
      case "mitosis-division":
        return <MitosisDivisionSVG />;
      case "cell-osmosis":
        return <CellOsmosisSVG />;
      case "enzyme-kinetics":
        return <EnzymeKineticsSVG />;
      case "dna-extraction":
        return <DnaExtractionSVG />;
      case "cellular-respiration":
        return <CellularRespirationSVG />;
      case "plant-transpiration":
        return <PlantTranspirationSVG />;
      case "natural-selection":
        return <NaturalSelectionSVG />;
      case "blood-typing":
        return <BloodTypingSVG />;
      case "food-chain":
        return <FoodChainSVG />;
      case "heart-rate":
        return <HeartRateSVG />;
      case "graphing-lines":
        return <GraphingLinesCardSVG />;
      case "ratio-and-proportion":
        return <RatioProportionCardSVG />;
      case "vector-addition":
        return <VectorAdditionCardSVG />;
      case "center-and-variability":
        return <CenterVariabilityCardSVG />;
      case "curve-fitting":
        return <CurveFittingCardSVG />;
      case "function-builder":
        return <FunctionBuilderCardSVG />;
      case "push-pull-forces":
        return <PushPullForcesSVG />;
      case "light-and-shadows":
        return <LightShadowsSVG />;
      case "sound-vibrations":
        return <SoundVibrationsSVG />;
      case "simple-circuits":
        return <SimpleCircuitsSVG />;
      case "floating-and-sinking":
        return <FloatingSinkingSVG />;
      case "magnet-exploration":
        return <MagnetExplorationSVG />;
      case "states-of-matter":
        return <StatesOfMatterSVG />;
      case "mixing-and-separating":
        return <MixingSeparatingSVG />;
      case "dissolving-solutions":
        return <DissolvingSolutionsSVG />;
      case "acids-bases-around-us":
        return <AcidsBasesSVG />;
      case "heating-cooling-materials":
        return <HeatingCoolingSVG />;
      case "physical-chemical-changes":
        return <PhysicalChemicalSVG />;
      case "probability-simulation":
        return <ProbabilitySVG />;
      case "trigonometry-waves":
        return <TrigoWavesSVG />;
      case "systems-of-equations":
        return <SystemsEquationsSVG />;
      case "geometry-measurement":
        return <GeometryMeasurementSVG />;
      case "exponential-growth-decay":
        return <ExponentialGrowthDecaySVG />;
      case "data-sampling-error":
        return <DataSamplingErrorSVG />;
      case "quadratic-projectiles":
        return <QuadraticProjectilesSVG />;
      case "logarithm-scales":
        return <LogarithmScalesSVG />;
      case "unit-conversion":
        return <UnitConversionSVG />;
      case "matrix-transformations":
        return <MatrixTransformationsSVG />;
      case "sequences-series":
        return <SequencesSeriesSVG />;
      case "inequalities-feasible-regions":
        return <InequalitiesFeasibleSVG />;
      case "transformations-symmetry":
        return <TransformationsSymmetrySVG />;
      case "angles-circles":
        return <AnglesCirclesSVG />;
      case "combinatorics-counting":
        return <CombinatoricsCountingSVG />;
      case "normal-distribution":
        return <NormalDistributionSVG />;
      case "rates-of-change":
        return <RatesOfChangeSVG />;
      case "optimization-constraints":
        return <OptimizationConstraintsSVG />;
      case "advanced-calculus-optimization":
        return <AdvancedCalculusSVG />;
      case "linear-algebra-eigenvectors":
        return <LinearAlgebraSVG />;
      case "differential-equations-lab":
        return <DifferentialEquationsSVG />;
      case "numerical-methods-lab":
        return <NumericalMethodsSVG />;
      case "multivariable-calculus":
        return <MultivariableCalculusSVG />;
      case "statistical-inference":
        return <StatisticalInferenceSVG />;
      case "bayesian-reasoning-lab":
        return <BayesianReasoningSVG />;
      case "fourier-analysis-signals":
        return <FourierAnalysisSVG />;
      case "complex-numbers-phasors":
        return <ComplexNumbersPhasorsSVG />;
      case "vector-fields-gradients":
        return <VectorFieldsGradientsSVG />;
      case "discrete-graph-theory":
        return <DiscreteGraphTheorySVG />;
      case "mathematical-modeling-lab":
        return <MathematicalModelingSVG />;
      case "quantum-tunneling":
        return <QuantumTunnelingSVG />;
      case "michelson-interferometer":
        return <MichelsonInterferometerSVG />;
      case "zeeman-effect":
        return <ZeemanEffectSVG />;
      case "superconductivity-meissner":
        return <SuperconductivityMeissnerSVG />;
      case "bragg-diffraction":
        return <BraggDiffractionSVG />;
      case "relativistic-kinematics":
        return <RelativisticKinematicsSVG />;
      case "nmr-spectroscopy":
        return <NmrSpectroscopySVG />;
      case "xps-spectroscopy":
        return <XpsSpectroscopySVG />;
      case "hplc-chromatography":
        return <HplcChromatographySVG />;
      case "transition-metal-complexes":
        return <TransitionMetalComplexesSVG />;
      case "eis-electrochemistry":
        return <EisElectrochemistrySVG />;
      case "quantum-chemistry-orbitals":
        return <QuantumChemistryOrbitalsSVG />;
      case "pcr-gel-electrophoresis":
        return <PcrGelElectrophoresisSVG />;
      case "crispr-gene-editing":
        return <CrisprGeneEditingSVG />;
      case "recombinant-dna-transformation":
        return <RecombinantDnaTransformationSVG />;
      case "flow-cytometry-cycle":
        return <FlowCytometrySVG />;
      case "western-blotting":
        return <WesternBlottingSVG />;
      case "metabolic-pathway-flux":
        return <MetabolicPathwayFluxSVG />;
      default:
        switch (lab.category) {
          case "Physics":
            return <NewtonCooldownSVG />;
          case "Chemistry":
            return <TitrationSVG />;
          case "Biology":
            return <PhotosynthesisSVG />;
          case "Mathematics":
            return <MathConceptSVG />;
          default:
            return (
              <div className="w-full h-32 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                No Image
              </div>
            );
        }
    }
  };

  return (
    <div
      className={`
        group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] border bg-white p-4
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70 focus-within:ring-3 focus-within:ring-blue-100 sm:p-5
        ${themeColors.border}
      `}
    >
      <div>
        {/* SVG Illustration Container */}
        <div className={`mb-4 flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-100 ${themeColors.accentBg} ${readiness.isReady ? "" : "opacity-75"} [&>svg]:h-[88px] sm:h-32 sm:[&>svg]:h-24 xl:h-[136px] xl:[&>svg]:h-28`}>
          {renderIllustration()}
        </div>

        {/* Lab Header details */}
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          {/* Department Tag */}
          <span className={`rounded-full border px-3 py-1 text-xs font-bold leading-[1.45] ${themeColors.badgeColor}`}>
            {lab.category}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-extrabold leading-[1.4] text-slate-600">
            {lab.gradeLevel}
          </span>
          <span
            className={`ml-auto rounded-full border px-2.5 py-1 text-[10px] font-extrabold leading-[1.4] ${
              readiness.isReady
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-amber-100 bg-amber-50 text-amber-700"
            }`}
          >
            {readiness.label}
          </span>
        </div>

        {/* Titles */}
        <h3 className="line-clamp-1 text-lg font-extrabold leading-[1.45] tracking-normal text-slate-900">
          {lab.thaiTitle}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs font-bold leading-relaxed text-slate-400">
          {lab.title}
        </p>

        {/* Description */}
        <p className="mb-5 mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-slate-500 sm:text-sm">
          {lab.description}
        </p>
      </div>

      {/* Card action */}
      <div className="mt-auto w-full">
        <button
          type="button"
          disabled={!readiness.isReady}
          onClick={() => onEnterRoom?.(lab.id)}
          title={readiness.description}
          aria-label={
            readiness.isReady
              ? `เข้าห้องทดลอง ${lab.title}`
              : `ห้องทดลอง ${lab.title} ยังไม่พร้อมใช้งาน`
          }
          className={`
            flex min-h-11 w-full select-none items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold
            transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100
            ${
              readiness.isReady
                ? `${themeColors.btnPrimary} cursor-pointer`
                : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
            }
          `}
        >
          <span>{readiness.isReady ? "เข้าห้อง" : "เร็ว ๆ นี้"}</span>
          {readiness.isReady && (
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </button>
      </div>
    </div>
  );
}
