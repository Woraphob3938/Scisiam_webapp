"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function BottomCallout() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <div className="relative overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-indigo-500/10 group hover:shadow-xl hover:shadow-indigo-500/15 transition-all duration-300">
        
        {/* Glow behind container on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />

        {/* Content Container */}
        <div className="bg-white/95 rounded-full px-8 py-3.5 flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-left">
          <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300 animate-pulse shrink-0" />
          
          <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent leading-relaxed tracking-wide">
            พร้อมทดลองแล้วหรือยัง? เลือกห้องแล็บที่คุณสนใจ แล้วเริ่มการผจญภัยทางวิทยาศาสตร์ได้เลย! 🚀
          </p>

          <Sparkles className="hidden md:inline w-4.5 h-4.5 text-indigo-400 fill-indigo-100 animate-bounce shrink-0" />
        </div>

      </div>
    </div>
  );
}
