"use client";

import React from "react";
import { GraduationCap, Award, Pin, Beaker, Send, HelpCircle } from "lucide-react";

export function LeftDecorations() {
  return (
    <div className="w-full flex flex-col gap-6 items-center lg:items-start select-none">
      {/* Sticky Note: Learning Quote */}
      <div className="relative transform -rotate-3 hover:rotate-0 transition-transform duration-300 w-52 sm:w-56 p-5 sticky-note-yellow rounded-xl shadow-md border-b-4 border-yellow-400 flex flex-col gap-2.5">
        {/* Pin Sticker */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-rose-500 opacity-90 drop-shadow-xs">
          <Pin className="w-6 h-6 fill-rose-400 rotate-45" />
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <GraduationCap className="w-7 h-7 text-yellow-800" />
          <span className="text-[10px] uppercase font-bold text-yellow-800 tracking-wider bg-yellow-300/40 px-2 py-0.5 rounded-full">
            💡 TIP
          </span>
        </div>
        
        <p className="text-xs sm:text-sm font-semibold text-yellow-900 leading-relaxed font-sans mt-1">
          &quot;เรียนรู้วันนี้ เพื่ออนาคตที่ดีกว่า&quot; 🎓✨
        </p>
      </div>

      {/* Floating Paper Plane Icon */}
      <div className="flex items-center gap-2 text-indigo-500 animate-float-slow py-2">
        <Send className="w-8 h-8 rotate-12 drop-shadow-md fill-indigo-100" />
        <span className="text-[10px] font-bold text-indigo-400/80 tracking-widest uppercase">Explore</span>
      </div>

      {/* Quest / Scientific Missions Card */}
      <div className="w-56 p-4.5 bg-white border border-slate-100 rounded-3xl shadow-lg shadow-slate-100/50 flex flex-col gap-3 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-indigo-500/10 rounded-bl-full" />
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">ภารกิจนักวิทย์</h4>
            <p className="text-[10px] text-slate-400 font-semibold">แคมเปญประจำเดือน</p>
          </div>
        </div>

        {/* Progress details */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
            <span>เก็บครบ 5 ห้องแล็บ</span>
            <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md">3 / 5 ห้อง</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 group-hover:scale-x-105 origin-left"
              style={{ width: "60%" }}
            />
          </div>
        </div>

        {/* Quest Rewards */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-2.5">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Beaker className="w-3 h-3 text-indigo-500" />
            Reward
          </span>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
            ปลดล็อกเมื่อสำเร็จ
          </span>
        </div>
      </div>
    </div>
  );
}

export function RightDecorations() {
  return (
    <div className="w-full flex flex-col gap-6 items-center lg:items-end select-none">
      {/* Sticky Note: Fun quote */}
      <div className="relative transform rotate-3 hover:rotate-0 transition-transform duration-300 w-52 sm:w-56 p-5 sticky-note-purple rounded-xl shadow-md border-b-4 border-purple-400 flex flex-col gap-2.5">
        {/* Tape Effect */}
        <div className="absolute -top-3 left-1/3 w-12 h-6 bg-white/40 border border-white/50 backdrop-blur-xs -rotate-12" />

        <div className="flex justify-between items-center mt-1">
          <HelpCircle className="w-6 h-6 text-purple-800" />
          <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider bg-purple-300/40 px-2 py-0.5 rounded-full">
            💡 Info
          </span>
        </div>

        <p className="text-xs sm:text-sm font-semibold text-purple-900 leading-relaxed font-sans">
          สนุกกับการทดลอง ค้นพบสิ่งใหม่ไปด้วยกัน! ✨🧪
        </p>
      </div>

      {/* Floating Molecule SVG model */}
      <div className="animate-float-slow py-4">
        <svg className="w-36 h-36" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Connection Lines */}
          <line x1="40" y1="40" x2="80" y2="40" stroke="#cbd5e1" strokeWidth="2.5" />
          <line x1="40" y1="40" x2="30" y2="80" stroke="#cbd5e1" strokeWidth="2.5" />
          <line x1="80" y1="40" x2="90" y2="80" stroke="#cbd5e1" strokeWidth="2.5" />
          <line x1="30" y1="80" x2="60" y2="100" stroke="#cbd5e1" strokeWidth="2.5" />
          <line x1="90" y1="80" x2="60" y2="100" stroke="#cbd5e1" strokeWidth="2.5" />

          {/* Connected Atoms */}
          {/* Core blue atom */}
          <circle cx="40" cy="40" r="14" fill="url(#atom-blue)" />
          <circle cx="40" cy="40" r="6" fill="#ffffff" opacity="0.4" />

          {/* Secondary pink atom */}
          <circle cx="80" cy="40" r="11" fill="url(#atom-pink)" />
          
          {/* Emerald atom */}
          <circle cx="30" cy="80" r="9" fill="url(#atom-emerald)" />

          {/* Yellow atom */}
          <circle cx="90" cy="80" r="10" fill="url(#atom-yellow)" />

          {/* Bottom small purple atom */}
          <circle cx="60" cy="100" r="7" fill="url(#atom-purple)" />

          <defs>
            <linearGradient id="atom-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="atom-pink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
            <linearGradient id="atom-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="atom-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="atom-purple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
