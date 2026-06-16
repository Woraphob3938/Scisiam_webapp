"use client";

import React, { useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface HeroSectionProps {
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export default function HeroSection({
  searchQuery = "",
  onSearchQueryChange = () => {},
}: HeroSectionProps = {}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
                onBlur={() => setIsFocused(false)}
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
          </div>
        </div>
      </div>
    </section>
  );
}
