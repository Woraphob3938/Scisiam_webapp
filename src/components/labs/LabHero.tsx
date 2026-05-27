"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Atom, Play, Bookmark, ArrowLeft, Snowflake, Check } from "lucide-react";

interface LabHeroProps {
  title: string;
  category: string;
  status: string;
  description: string;
  onStartExperiment?: () => void;
}

export default function LabHero({
  title,
  category,
  status,
  description,
  onStartExperiment,
}: LabHeroProps) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-12 md:px-20 py-4 select-none">
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-md border border-white/60 rounded-[32px] shadow-2xl shadow-slate-200/30 p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
        {/* Soft Decorative Accent Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/10 via-indigo-400/5 to-transparent rounded-bl-full pointer-events-none" />

        {/* Left Side: Content & Actions */}
        <div className="flex-1 flex flex-col items-start text-left z-10 w-full">
          {/* Header row with Atom indicator box and Subject Tags */}
          <div className="flex flex-wrap items-center gap-3.5 mb-5">
            {/* Physics Logo Icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Atom className="w-6 h-6 animate-spin-slow" />
            </div>

            {/* Department Category badge */}
            <span className="px-3.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs sm:text-sm font-bold rounded-full">
              {category}
            </span>

            {/* Status badge */}
            {status === "ว่าง" && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs sm:text-sm font-semibold rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                ว่าง
              </span>
            )}
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed max-w-xl mb-8">
            {description}
          </p>

          {/* Buttons Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
            {/* Start Lab Button */}
            <button
              onClick={onStartExperiment}
              aria-label={`เริ่มทำการทดลองห้องแล็บ ${title}`}
              className="flex items-center justify-center gap-2 py-3 px-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus:outline-none cursor-pointer shadow-md shadow-indigo-600/10"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>เริ่มทดลอง</span>
            </button>

            {/* Save for later button */}
            <button
              onClick={() => setIsSaved(!isSaved)}
              aria-label={isSaved ? `ยกเลิกการบันทึกห้องแล็บ ${title}` : `บันทึกห้องแล็บ ${title} ไว้ศึกษาภายหลัง`}
              className={`
                flex items-center justify-center gap-2 py-3 px-6 border-2 rounded-2xl text-sm font-bold
                transition-all duration-300 transform hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus:outline-none cursor-pointer
                ${
                  isSaved
                    ? "bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100/50"
                    : "border-blue-100 text-blue-600 hover:bg-blue-50/50"
                }
              `}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? "บันทึกแล้ว" : "บันทึกไว้ภายหลัง"}</span>
            </button>

            {/* Back Button */}
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 py-3.5 px-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl focus:outline-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับไปหน้ารายชื่อห้องแล็บ</span>
            </Link>
          </div>
        </div>

        {/* Right Side: High-Fidelity SVG Cooling Experiment Illustration */}
        <div className="relative shrink-0 w-60 h-60 sm:w-72 sm:h-72 select-none animate-float-medium flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Glowing aura */}
            <circle cx="120" cy="120" r="70" fill="#bfdbfe" opacity="0.3" filter="blur(30px)" />
            <circle cx="120" cy="120" r="45" fill="#e0f2fe" opacity="0.5" />

            {/* Physics orbital path */}
            <ellipse cx="120" cy="120" rx="90" ry="30" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" transform="rotate(-15 120 120)" />

            {/* Large Ice Cube */}
            <g transform="translate(45, 60)">
              {/* Isometric Top */}
              <path d="M40,20 L10,35 L40,50 L70,35 Z" fill="#bae6fd" />
              {/* Isometric Left */}
              <path d="M10,35 L40,50 L40,90 L10,75 Z" fill="#93c5fd" opacity="0.8" />
              {/* Isometric Right */}
              <path d="M40,50 L70,35 L70,75 L40,90 Z" fill="#60a5fa" opacity="0.9" />
              
              {/* Glare and highlights on ice cube */}
              <path d="M40,52 L14,39 M40,52 L66,39" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              <path d="M40,24 L20,34" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              
              {/* Water puddle/droplet at the bottom */}
              <path d="M2,82 Q30,95 72,88 Q88,86 78,80 Q55,72 6,78 Z" fill="#e0f2fe" opacity="0.6" />
            </g>

            {/* Thermometer sticking inside the ice cube */}
            <g transform="translate(130, 20)">
              {/* Glass Tube Shaft */}
              <rect x="18" y="10" width="14" height="135" rx="7" fill="rgba(255, 255, 255, 0.7)" stroke="#cbd5e1" strokeWidth="3" />
              {/* Thermometer bulb at base */}
              <circle cx="25" cy="148" r="18" fill="#ef4444" stroke="#cbd5e1" strokeWidth="3" />
              <circle cx="25" cy="148" r="15" fill="#ef4444" />
              
              {/* Active low temperature liquid column */}
              <rect x="23" y="100" width="4" height="45" fill="#ef4444" />
              
              {/* Glare line */}
              <path d="M22,18 L22,130" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
              
              {/* Calibration notches */}
              <line x1="32" y1="30" x2="37" y2="30" stroke="#94a3b8" strokeWidth="2" />
              <line x1="32" y1="45" x2="37" y2="45" stroke="#ef4444" strokeWidth="2" />
              <line x1="32" y1="60" x2="37" y2="60" stroke="#94a3b8" strokeWidth="2" />
              <line x1="32" y1="75" x2="37" y2="75" stroke="#94a3b8" strokeWidth="2" />
              <line x1="32" y1="90" x2="37" y2="90" stroke="#94a3b8" strokeWidth="2" />
              <line x1="32" y1="105" x2="37" y2="105" stroke="#94a3b8" strokeWidth="2" />
            </g>

            {/* Floating Snowflakes & Sparkles */}
            <g className="animate-pulse">
              <Snowflake className="w-5 h-5 text-blue-400 absolute" style={{ top: "35px", left: "155px" }} />
              <Snowflake className="w-4 h-4 text-blue-300 absolute" style={{ top: "145px", left: "30px" }} />
              <circle cx="35" cy="80" r="3" fill="#60a5fa" />
              <circle cx="195" cy="90" r="2" fill="#3b82f6" />
              <circle cx="180" cy="150" r="4" fill="#93c5fd" />
            </g>
          </svg>
        </div>

      </div>
    </div>
  );
}
