"use client";

import React from "react";
import { Eye, ArrowRight } from "lucide-react";

export interface LabData {
  id: string;
  title: string;
  category: "Physics" | "Chemistry" | "Biology";
  status: "ว่าง" | string;
  description: string;
}

interface LabCardProps {
  lab: LabData;
  onViewDetails?: (id: string) => void;
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
    <circle cx="100" cy="60" r="45" fill="#d1fae5" opacity="0.4" />

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
      <rect x="6" y="25" width="4" height="40" fill="#34d399" opacity="0.7" />
      
      {/* Stopcock valve */}
      <circle cx="8" cy="72" r="3" fill="#ef4444" />
      
      {/* Drop falling */}
      <circle cx="8" cy="85" r="2" fill="#34d399" className="animate-bounce" />
    </g>

    {/* Laboratory Flask */}
    <g transform="translate(68, 52)">
      {/* Flask Body */}
      <path d="M26,8 L26,20 L12,42 A8,8 0 0,0 18,54 L44,54 A8,8 0 0,0 50,42 L36,20 L36,8 Z" fill="rgba(255, 255, 255, 0.9)" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" />
      {/* Liquid inside flask */}
      <path d="M16,40 L46,40 A8,8 0 0,1 50,42 L44,54 L18,54 A8,8 0 0,1 12,42 Z" fill="#10b981" opacity="0.75" />
      {/* Bubbles in flask */}
      <circle cx="25" cy="46" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="36" cy="48" r="2" fill="#ffffff" opacity="0.7" />
    </g>

    {/* Chemical Sparkles */}
    <circle cx="60" cy="40" r="2" fill="#10b981" className="animate-pulse" />
    <circle cx="148" cy="50" r="1.5" fill="#34d399" />
  </svg>
);

// 3. SVG Illustration for Biology (Photosynthesis Rate Chamber)
// Plant in glass dome under the sun
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

export default function LabCard({
  lab,
  onViewDetails,
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
      border: "border-emerald-100 hover:border-emerald-300",
      accentBg: "bg-emerald-50/50",
      accentText: "text-emerald-600",
      glow: "soft-glow-chemistry",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
      btnPrimary: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/10",
      btnOutline: "border-emerald-200 text-emerald-600 hover:bg-emerald-50/50",
      iconColor: "text-emerald-500",
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

  // Render proper SVG
  const renderIllustration = () => {
    switch (lab.category) {
      case "Physics":
        return <NewtonCooldownSVG />;
      case "Chemistry":
        return <TitrationSVG />;
      case "Biology":
        return <PhotosynthesisSVG />;
      default:
        return (
          <div className="w-full h-32 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
            No Image
          </div>
        );
    }
  };

  return (
    <div
      className={`
        bg-white rounded-3xl border-2 ${themeColors.border} ${themeColors.glow} p-6.5
        transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl
        flex flex-col justify-between group h-full relative overflow-hidden
      `}
    >
      {/* Top Background Glow Effect */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-10 filter blur-xl ${lab.category === "Physics" ? "bg-blue-600" : lab.category === "Chemistry" ? "bg-emerald-600" : "bg-green-600"}`} />

      <div>
        {/* SVG Illustration Container */}
        <div className={`w-full py-4 rounded-2xl ${themeColors.accentBg} flex items-center justify-center mb-5 border border-slate-50`}>
          {renderIllustration()}
        </div>

        {/* Lab Header details */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {/* Department Tag */}
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${themeColors.badgeColor}`}>
            {lab.category}
          </span>

          {/* Availability Status Badge */}
          {lab.status === "ว่าง" && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {lab.status}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 line-clamp-1 mb-2 tracking-tight transition-colors">
          {lab.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed mb-6">
          {lab.description}
        </p>
      </div>

      {/* Card Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button
          onClick={() => onViewDetails?.(lab.id)}
          className={`
            flex items-center justify-center gap-1.5 py-2.5 px-3.5 border rounded-2xl text-xs font-bold
            transition-all duration-300 transform select-none cursor-pointer active:scale-95
            ${themeColors.btnOutline}
          `}
        >
          <Eye className="w-4 h-4" />
          <span>รายละเอียด</span>
        </button>

        <button
          onClick={() => onEnterRoom?.(lab.id)}
          className={`
            flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-2xl text-xs font-bold
            transition-all duration-300 transform select-none cursor-pointer active:scale-95
            ${themeColors.btnPrimary}
          `}
        >
          <span>เข้าห้อง</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
