"use client";

import React from "react";
import Link from "next/link";
import { Atom, ArrowLeft } from "lucide-react";

export default function SimulationHero() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-12 md:px-20 py-4 select-none">
      <div className="relative overflow-hidden bg-white border border-slate-100 rounded-[32px] shadow-xl shadow-slate-200/40 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Soft Decorative Accent Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/5 via-indigo-400/5 to-transparent rounded-bl-full pointer-events-none" />

        {/* Left Content */}
        <div className="flex-1 flex flex-col items-start text-left z-10 w-full">
          {/* Tag row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Atom className="w-5.5 h-5.5 animate-spin-slow" />
            </div>

            <span className="px-3.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold rounded-full">
              Physics
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
            Newton&apos;s law of cooling Simulation
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-xl mb-5">
            จำลองการลดลงของอุณหภูมิวัตถุเมื่อเวลาผ่านไป พร้อมสังเกตกราฟและตารางบันทึกข้อมูลแบบเรียลไทม์
          </p>

          {/* Back link */}
          <Link
            href="/labs"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ย้อนกลับ</span>
          </Link>
        </div>

        {/* Right SVG Illustration */}
        <div className="relative shrink-0 w-48 h-48 sm:w-56 sm:h-56 select-none animate-float-medium flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="50" fill="#e0f2fe" opacity="0.4" filter="blur(20px)" />
            
            {/* Beaker representation */}
            <path d="M70,70 L70,140 A10,10 0 0,0 80,150 L120,150 A10,10 0 0,0 130,140 L130,70" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="75" y="90" width="50" height="55" rx="4" fill="#3b82f6" opacity="0.15" />
            <line x1="70" y1="67" x2="130" y2="67" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />

            {/* Ice cube isometric */}
            <g transform="translate(30, 95)">
              <path d="M20,10 L5,18 L20,26 L35,18 Z" fill="#93c5fd" opacity="0.6" />
              <path d="M5,18 L20,26 L20,42 L5,34 Z" fill="#60a5fa" opacity="0.75" />
              <path d="M20,26 L35,18 L35,34 L20,42 Z" fill="#2563eb" opacity="0.85" />
            </g>

            {/* Thermometer sticking out of beaker */}
            <g transform="translate(100, 30)">
              <rect x="6" y="5" width="8" height="85" rx="4" fill="rgba(255, 255, 255, 0.8)" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="10" cy="95" r="9" fill="#ef4444" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="10" cy="95" r="7" fill="#ef4444" />
              <rect x="9" y="45" width="2" height="45" fill="#ef4444" />
            </g>

            {/* Molecules connected */}
            <circle cx="45" cy="50" r="6" fill="#f43f5e" />
            <circle cx="55" cy="35" r="4" fill="#fbbf24" />
            <line x1="45" y1="50" x2="55" y2="35" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Sparkles */}
            <circle cx="155" cy="80" r="2.5" fill="#38bdf8" className="animate-pulse" />
            <circle cx="140" cy="130" r="1.5" fill="#60a5fa" />
          </svg>
        </div>

      </div>
    </div>
  );
}
