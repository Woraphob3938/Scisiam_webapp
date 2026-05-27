"use client";

import React from "react";
import { Send, Pin, HelpCircle, Sparkles } from "lucide-react";

export default function DecorativeBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 select-none" aria-hidden="true">
      
      {/* 1. Left Side: Floating Paper Plane (Middle Left) */}
      <div className="hidden xl:block absolute top-[180px] left-[2%] animate-float-slow text-indigo-500/80">
        <Send className="w-10 h-10 rotate-12 fill-indigo-50/50" />
      </div>

      {/* 2. Left Side: Flask Decoration (Bottom Left) */}
      <div className="hidden xl:block absolute bottom-[80px] left-[1%] animate-float-medium opacity-80">
        <svg className="w-28 h-28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Flask Body */}
          <path d="M45,20 L45,35 L20,75 A10,10 0 0,0 28,90 L72,90 A10,10 0 0,0 80,75 L55,35 L55,20 Z" fill="rgba(255, 255, 255, 0.4)" stroke="#e2e8f0" strokeWidth="2.5" />
          {/* Liquid */}
          <path d="M26,78 L74,78 A10,10 0 0,1 80,80 L72,90 L28,90 A10,10 0 0,1 20,80 Z" fill="#34d399" opacity="0.4" />
          {/* Bubbles */}
          <circle cx="42" cy="65" r="3.5" fill="#34d399" opacity="0.3" className="animate-bounce" />
          <circle cx="58" cy="72" r="2.5" fill="#34d399" opacity="0.4" />
          <circle cx="48" cy="82" r="3" fill="#ffffff" opacity="0.6" />
        </svg>
      </div>

      {/* 3. Right Side: Sticky Note quote (Top Right, next to Hero) */}
      <div className="hidden xl:block absolute top-[120px] right-[2%] transform rotate-6 hover:rotate-0 transition-transform duration-300 pointer-events-auto">
        <div className="relative w-52 p-5 sticky-note-yellow rounded-xl shadow-md border-b-4 border-yellow-400 flex flex-col gap-2">
          {/* Pin Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-rose-500 opacity-90 drop-shadow-xs">
            <Pin className="w-5.5 h-5.5 fill-rose-400 rotate-45" />
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <HelpCircle className="w-5 h-5 text-yellow-800" />
            <span className="text-[9px] uppercase font-bold text-yellow-800 tracking-wider bg-yellow-300/40 px-1.5 py-0.5 rounded-full">
              Quote
            </span>
          </div>
          
          <p className="text-xs font-bold text-yellow-900 leading-relaxed font-sans text-left mt-0.5">
            "ทุกการทดลอง คือก้าวเล็ก ๆ ของนักวิทย์ตัวจริง!" 🚀🌟
          </p>
        </div>
      </div>

      {/* 4. Right Side: Molecule Model (Bottom Right) */}
      <div className="hidden xl:block absolute bottom-[40px] right-[1%] animate-float-slow opacity-85">
        <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Lines */}
          <line x1="30" y1="35" x2="70" y2="35" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="30" y1="35" x2="20" y2="70" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="70" y1="35" x2="80" y2="70" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="20" y1="70" x2="50" y2="85" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="80" y1="70" x2="50" y2="85" stroke="#e2e8f0" strokeWidth="2" />

          {/* Spheres */}
          <circle cx="30" cy="35" r="10" fill="url(#decor-blue)" />
          <circle cx="70" cy="35" r="8" fill="url(#decor-pink)" />
          <circle cx="20" cy="70" r="7" fill="url(#decor-emerald)" />
          <circle cx="80" cy="70" r="8.5" fill="url(#decor-yellow)" />
          <circle cx="50" cy="85" r="6" fill="url(#decor-purple)" />

          <defs>
            <linearGradient id="decor-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="decor-pink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbcfe8" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="decor-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="decor-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            <linearGradient id="decor-purple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e9d5ff" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 5. Sparkles around the hero area */}
      <div className="absolute top-[280px] right-[20%] text-amber-400 opacity-60">
        <Sparkles className="w-5 h-5 animate-pulse" />
      </div>
      <div className="absolute top-[480px] left-[15%] text-blue-300 opacity-60">
        <Sparkles className="w-4 h-4 animate-pulse" />
      </div>

    </div>
  );
}
