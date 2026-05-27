"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CloudLightning, Cpu, Rocket, Search, X, Atom, Beaker, Leaf, ArrowRight } from "lucide-react";
import { labsData } from "@/data/labs";

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter labs based on search query (title or description)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return labsData.filter(
      (lab) =>
        lab.title.toLowerCase().includes(q) ||
        lab.description.toLowerCase().includes(q)
    ).slice(0, 8); // limit to 8 results
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categoryIcon = (category: string) => {
    switch (category) {
      case "Physics":
        return <Atom className="w-4 h-4 text-blue-500" />;
      case "Chemistry":
        return <Beaker className="w-4 h-4 text-purple-500" />;
      case "Biology":
        return <Leaf className="w-4 h-4 text-green-500" />;
      default:
        return <Atom className="w-4 h-4 text-slate-400" />;
    }
  };

  const categoryBadge = (category: string) => {
    switch (category) {
      case "Physics":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Chemistry":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "Biology":
        return "bg-green-50 text-green-600 border-green-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const showDropdown = isFocused && searchQuery.trim().length > 0;

  return (
    <section className="relative w-full py-10 md:py-16 px-6 sm:px-12 md:px-20 overflow-hidden bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-transparent flex flex-col items-center text-center">
      {/* Decorative Wave Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <svg className="w-full h-full" viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,192L80,197.3C160,203,320,213,480,202.7C640,192,800,160,960,149.3C1120,139,1280,149,1360,154.7L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z" fill="url(#wave-grad)"></path>
          <defs>
            <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Sparkles & Dots */}
      <div className="absolute top-1/4 left-1/10 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping opacity-75" />
      <div className="absolute top-1/3 right-1/10 w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />

      {/* Grid Container for Layout */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Atom Orbits SVG (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-3 justify-center items-center animate-float-slow select-none">
          <svg className="w-56 h-56" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background glowing aura */}
            <circle cx="100" cy="100" r="50" fill="#a5b4fc" opacity="0.2" filter="blur(25px)" />
            {/* Center Nucleus */}
            <circle cx="100" cy="100" r="16" fill="url(#nucleus-grad)" className="shadow-lg" />
            <circle cx="100" cy="100" r="8" fill="#ffffff" opacity="0.6" />
            
            {/* Orbit 1 */}
            <ellipse cx="100" cy="100" rx="75" ry="25" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 3" transform="rotate(30 100 100)" />
            <circle cx="45" cy="68" r="6" fill="#3b82f6" className="animate-pulse" />
            
            {/* Orbit 2 */}
            <ellipse cx="100" cy="100" rx="75" ry="25" stroke="#ec4899" strokeWidth="1.5" transform="rotate(-40 100 100)" />
            <circle cx="140" cy="65" r="5" fill="#f43f5e" />

            {/* Orbit 3 */}
            <ellipse cx="100" cy="100" rx="75" ry="25" stroke="#10b981" strokeWidth="1.5" transform="rotate(110 100 100)" />
            <circle cx="110" cy="172" r="7" fill="#10b981" />

            <defs>
              <linearGradient id="nucleus-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Center: Main Content */}
        <div className="lg:col-span-6 flex flex-col items-center">
          {/* Main Title with Rocket */}
          <div className="inline-flex items-center gap-3 mb-2 animate-float-medium">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              รายชื่อห้องแล็บ
              <span className="inline-block hover:scale-125 transition-transform duration-300">
                <Rocket className="w-8 h-8 md:w-10 md:h-10 text-indigo-500 fill-indigo-200 inline" />
              </span>
            </h1>
          </div>

          <p className="text-sm sm:text-base md:text-lg text-slate-500 font-medium max-w-md mb-6 leading-relaxed">
            เลือกห้องแล็บที่ต้องการใช้งาน แล้วเริ่มต้นการผจญภัยทางวิทยาศาสตร์ได้เลย!
          </p>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 shadow-sm transition-all duration-300 hover:bg-emerald-100/50 hover:shadow-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Simulation Engine Active
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 shadow-sm transition-all duration-300 hover:bg-blue-100/50 hover:shadow-md">
              <CloudLightning className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide">
                ระบบจำลองออนไลน์
              </span>
            </div>
          </div>

          {/* ===== SEARCH INPUT BAR ===== */}
          <div className="relative w-full max-w-lg">
            <div className={`flex items-center bg-white border rounded-2xl shadow-sm px-4 py-3 transition-all duration-300 ${
              isFocused 
                ? "border-blue-400 shadow-lg shadow-blue-500/10 ring-2 ring-blue-100" 
                : "border-slate-200 hover:border-slate-300 hover:shadow-md"
            }`}>
              <Search className={`w-5 h-5 shrink-0 transition-colors duration-200 ${isFocused ? "text-blue-500" : "text-slate-400"}`} />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="ค้นหาห้องแล็บ เช่น Newton, Osmosis, Titration..."
                className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 ml-3 leading-normal"
                aria-label="ค้นหาห้องแล็บวิทยาศาสตร์"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); inputRef.current?.focus(); }}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label="ล้างการค้นหา"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* ===== AUTOCOMPLETE DROPDOWN ===== */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                {searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto py-2">
                    {searchResults.map((lab) => (
                      <button
                        key={lab.id}
                        onClick={() => {
                          router.push(`/labs/${lab.id}`);
                          setSearchQuery("");
                          setIsFocused(false);
                        }}
                        className="flex items-center gap-3.5 w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-150 cursor-pointer group"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${categoryBadge(lab.category)}`}>
                          {categoryIcon(lab.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors leading-normal">
                            {lab.title}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5 leading-normal">
                            {lab.description}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-500 leading-normal">ไม่พบห้องแล็บที่ตรงกับคำค้นหา</p>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">ลองค้นหาด้วยคำอื่น เช่น "Ohm", "DNA", "กรด"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Microscope & Book Stack SVG Illustration (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-3 justify-center items-center animate-float-medium select-none">
          <svg className="w-64 h-64" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="120" cy="120" r="70" fill="#bae6fd" opacity="0.15" filter="blur(30px)" />
            
            {/* Textbook stack */}
            {/* Biology (Green) - Bottom */}
            <g transform="translate(110, 160)">
              <rect x="0" y="24" width="90" height="12" rx="2" fill="#10b981" />
              <rect x="90" y="24" width="8" height="12" rx="1" fill="#e2e8f0" />
              <rect x="8" y="27" width="60" height="6" fill="#047857" opacity="0.2" />
              <text x="12" y="32" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">BIOLOGY</text>
            </g>

            {/* Chemistry (Orange) - Middle */}
            <g transform="translate(112, 149)">
              <rect x="0" y="24" width="86" height="12" rx="2" fill="#f97316" />
              <rect x="86" y="24" width="8" height="12" rx="1" fill="#e2e8f0" />
              <rect x="8" y="27" width="56" height="6" fill="#c2410c" opacity="0.2" />
              <text x="12" y="32" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">CHEMISTRY</text>
            </g>

            {/* Physics (Blue) - Top */}
            <g transform="translate(115, 138)">
              <rect x="0" y="24" width="80" height="12" rx="2" fill="#3b82f6" />
              <rect x="80" y="24" width="8" height="12" rx="1" fill="#e2e8f0" />
              <rect x="8" y="27" width="50" height="6" fill="#1d4ed8" opacity="0.2" />
              <text x="12" y="32" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">PHYSICS</text>
            </g>

            {/* Plant in a small pot on textbooks */}
            <g transform="translate(150, 118)">
              {/* Pot */}
              <path d="M12,24 L22,24 L19,34 L15,34 Z" fill="#b45309" />
              {/* Stem */}
              <path d="M17,14 Q17,24 17,24" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
              {/* Leaves */}
              <path d="M17,17 Q12,13 13,8 Q20,11 17,17" fill="#10b981" />
              <path d="M17,21 Q23,19 22,14 Q16,16 17,21" fill="#34d399" />
              <path d="M17,15 Q10,18 10,23 Q16,21 17,15" fill="#059669" />
            </g>

            {/* Flask with bubbling liquid */}
            <g transform="translate(75, 110)">
              {/* Flask body outline */}
              <path d="M22,15 L22,28 L8,55 A15,15 0 0,0 21,70 L49,70 A15,15 0 0,0 62,55 L48,28 L48,15 Z" fill="rgba(255, 255, 255, 0.6)" stroke="#cbd5e1" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Liquid inside */}
              <path d="M14,48 L56,48 A15,15 0 0,1 62,55 L49,70 A15,15 0 0,1 21,70 L8,55 A15,15 0 0,1 14,48 Z" fill="#67e8f9" opacity="0.8" />
              {/* Bubbles */}
              <circle cx="28" cy="58" r="3" fill="#ffffff" opacity="0.7" />
              <circle cx="42" cy="62" r="2.5" fill="#ffffff" opacity="0.8" />
              <circle cx="36" cy="40" r="3" fill="#67e8f9" opacity="0.6" className="animate-bounce" />
              <circle cx="24" cy="30" r="2" fill="#67e8f9" opacity="0.5" />
            </g>

            {/* Microscope */}
            <g transform="translate(10, 45)">
              {/* Base */}
              <rect x="25" y="115" width="55" height="10" rx="3" fill="#334155" />
              {/* Arm/Stand */}
              <path d="M68,115 L68,85 Q68,45 42,50 Q32,52 35,62 Q38,68 45,62" fill="none" stroke="#475569" strokeWidth="9" strokeLinecap="round" />
              {/* Stage */}
              <rect x="20" y="88" width="42" height="6" rx="1.5" fill="#1e293b" />
              {/* Adjustment knobs */}
              <circle cx="68" cy="85" r="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
              <circle cx="68" cy="85" r="2" fill="#64748b" />
              {/* Objective Lens body */}
              <rect x="28" y="70" width="12" height="18" rx="2" fill="#64748b" transform="rotate(-15 34 79)" />
              {/* Eyepiece / Tube */}
              <rect x="23" y="38" width="9" height="30" rx="1.5" fill="#334155" transform="rotate(-25 27 53)" />
              <rect x="20" y="32" width="13" height="6" rx="1" fill="#475569" transform="rotate(-25 26.5 35)" />
              {/* Light source */}
              <ellipse cx="38" cy="105" rx="7" ry="4" fill="#cbd5e1" />
              {/* Specimen Slide */}
              <rect x="28" y="86" width="15" height="2" fill="#67e8f9" opacity="0.8" />
            </g>
          </svg>
        </div>

      </div>
    </section>
  );
}
