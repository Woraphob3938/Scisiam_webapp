"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Atom, Beaker, Leaf, Search, X } from "lucide-react";
import { labsData } from "@/data/labs";
import { getLabReadiness } from "@/data/labReadiness";

interface HeroSectionProps {
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

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

export default function HeroSection({
  searchQuery = "",
  onSearchQueryChange = () => {},
}: HeroSectionProps = {}) {
  const router = useRouter();
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
    <section className="relative w-full overflow-visible border-b border-slate-200/70 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_62%,#f8fafc_100%)] px-4 py-4 sm:px-8 lg:px-10 lg:py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <div className="flex min-w-0 w-full flex-col items-center text-center">
          <h1 className="text-2xl font-extrabold leading-[1.25] tracking-normal text-slate-900 sm:text-4xl lg:text-5xl">
            รายชื่อห้องแล็บ
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500 sm:text-base">
            ค้นหา เลือกหมวด แล้วเริ่มจากห้องที่พร้อมทดลองได้ทันที
          </p>

          <div className="relative mt-4 w-full sm:mt-5">
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
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="ค้นหาห้องแล็บ เช่น Newton, Osmosis, Titration..."
                className="ml-3 min-w-0 flex-1 bg-transparent text-sm font-semibold leading-[1.5] text-slate-700 outline-none placeholder:text-slate-400"
                aria-label="ค้นหาห้องแล็บวิทยาศาสตร์"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchQueryChange("");
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
                            onSearchQueryChange("");
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
      </div>
    </section>
  );
}
