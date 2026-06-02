"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Atom, Beaker, CheckCircle2, Leaf, Search, X } from "lucide-react";
import { labsData } from "@/data/labs";
import { getLabReadiness, readyLabCount } from "@/data/labReadiness";

const categoryMeta = {
  Physics: {
    icon: Atom,
    badge: "border-blue-100 bg-blue-50 text-blue-700",
    iconColor: "text-blue-600",
  },
  Chemistry: {
    icon: Beaker,
    badge: "border-purple-100 bg-purple-50 text-purple-700",
    iconColor: "text-purple-600",
  },
  Biology: {
    icon: Leaf,
    badge: "border-green-100 bg-green-50 text-green-700",
    iconColor: "text-green-600",
  },
} as const;

const LabBenchIllustration = () => (
  <svg
    className="h-full w-full"
    viewBox="0 0 320 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="28" y="154" width="264" height="18" rx="9" fill="#e2e8f0" />
    <rect x="52" y="172" width="216" height="9" rx="4.5" fill="#cbd5e1" />

    <g transform="translate(55 62)">
      <path d="M24 0h28v55l21 35a13 13 0 0 1-11 20H14A13 13 0 0 1 3 90l21-35V0Z" fill="#fff" stroke="#94a3b8" strokeWidth="4" />
      <path d="M17 82h44l10 18a9 9 0 0 1-8 14H15a9 9 0 0 1-8-14l10-18Z" fill="#a855f7" opacity=".78" />
      <path d="M26 21h24" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      <circle cx="31" cy="96" r="4" fill="#f8fafc" opacity=".85" />
      <circle cx="49" cy="92" r="3" fill="#f8fafc" opacity=".7" />
    </g>

    <g transform="translate(165 38)">
      <rect x="26" y="5" width="14" height="102" rx="7" fill="#fff" stroke="#cbd5e1" strokeWidth="4" />
      <circle cx="33" cy="107" r="19" fill="#ef4444" stroke="#cbd5e1" strokeWidth="4" />
      <rect x="30" y="64" width="6" height="41" fill="#ef4444" />
      <path d="M42 25h10M42 45h8M42 65h10" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <path d="M45 20h8" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
    </g>

    <g transform="translate(132 82)">
      <path d="M28 44 4 31V58l24 14 24-14V31L28 44Z" fill="#60a5fa" />
      <path d="M28 44 4 31l24-14 24 14-24 13Z" fill="#bfdbfe" />
      <path d="M28 44v28" stroke="#93c5fd" strokeWidth="3" />
    </g>

    <g transform="translate(198 122)">
      <rect x="0" y="22" width="68" height="12" rx="3" fill="#2563eb" />
      <rect x="10" y="10" width="68" height="12" rx="3" fill="#9333ea" />
      <rect x="20" y="-2" width="68" height="12" rx="3" fill="#22c55e" />
      <path d="M18 4h72" stroke="#fff" strokeOpacity=".45" strokeWidth="2" />
    </g>

    <path d="M75 45c16-18 45-18 61 0M210 24c24 8 40 30 40 56" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 8" />
    <circle cx="250" cy="52" r="5" fill="#38bdf8" />
    <circle cx="96" cy="42" r="6" fill="#22c55e" />
    <circle cx="142" cy="30" r="5" fill="#ef4444" />
  </svg>
);

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return labsData
      .filter(
        (lab) =>
          lab.title.toLowerCase().includes(q) ||
          lab.description.toLowerCase().includes(q) ||
          lab.category.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = isFocused && searchQuery.trim().length > 0;

  return (
    <section className="relative w-full overflow-visible border-b border-slate-200/70 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_62%,#f8fafc_100%)] px-4 py-5 sm:px-8 lg:px-10 lg:py-7">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-3 py-1 text-[11px] font-bold leading-[1.45] text-blue-700 shadow-sm shadow-blue-100/60">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{readyLabCount} ห้องพร้อมทดลองจาก {labsData.length} ห้อง</span>
          </div>

          <h1 className="text-3xl font-extrabold leading-[1.25] tracking-normal text-slate-900 sm:text-4xl lg:text-5xl">
            รายชื่อห้องแล็บ
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500 sm:text-base">
            ค้นหา เลือกหมวด แล้วเริ่มจากห้องที่พร้อมทดลองได้ทันที
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
            {["Physics", "Chemistry", "Biology"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-extrabold leading-[1.45] text-slate-500"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="relative mt-5 w-full max-w-2xl">
          <div
            className={`flex items-center rounded-2xl border bg-white px-4 py-3 shadow-sm transition-all duration-200 ${
              isFocused
                ? "border-blue-300 shadow-lg shadow-blue-500/10 ring-4 ring-blue-100/70"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <Search
              className={`h-5 w-5 shrink-0 transition-colors ${
                isFocused ? "text-blue-600" : "text-slate-400"
              }`}
            />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="ค้นหาห้องแล็บ เช่น Newton, Osmosis, Titration..."
              className="ml-3 min-w-0 flex-1 bg-transparent text-sm font-semibold leading-[1.5] text-slate-700 outline-none placeholder:text-slate-400"
              aria-label="ค้นหาห้องแล็บวิทยาศาสตร์"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  inputRef.current?.focus();
                }}
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="ล้างการค้นหา"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xl shadow-slate-200/60"
            >
              {searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto py-2">
                  {searchResults.map((lab) => {
                    const meta = categoryMeta[lab.category];
                    const Icon = meta.icon;
                    const readiness = getLabReadiness(lab.id);

                    return (
                      <button
                        key={lab.id}
                        type="button"
                        disabled={!readiness.isReady}
                        onClick={() => {
                          if (!readiness.isReady) return;
                          router.push(`/labs/${lab.id}`);
                          setSearchQuery("");
                          setIsFocused(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-75"
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${meta.badge}`}>
                          <Icon className={`h-4 w-4 ${meta.iconColor}`} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold leading-[1.5] text-slate-800">
                            {lab.title}
                          </span>
                          <span className="block truncate text-[11px] font-semibold leading-relaxed text-slate-400">
                            {lab.description}
                          </span>
                        </span>
                        <span
                          className={`hidden shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold leading-[1.4] sm:inline-flex ${
                            readiness.isReady
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : "border-amber-100 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {readiness.label}
                        </span>
                        {readiness.isReady && (
                          <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <Search className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-bold leading-[1.5] text-slate-500">
                    ไม่พบห้องแล็บที่ตรงกับคำค้นหา
                  </p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">
                    ลองค้นหาด้วยคำอื่น เช่น &quot;Ohm&quot;, &quot;DNA&quot;, &quot;กรด&quot;
                  </p>
                </div>
              )}
            </div>
          )}
          </div>
        </div>

        <div className="hidden h-[210px] overflow-hidden rounded-[24px] border border-blue-100 bg-white/80 p-4 shadow-sm shadow-blue-100/60 lg:block">
          <LabBenchIllustration />
        </div>
      </div>
    </section>
  );
}
