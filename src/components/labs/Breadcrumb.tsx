"use client";

import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  category: string;
  title: string;
}

export default function Breadcrumb({ category, title }: BreadcrumbProps) {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 md:px-20 pt-6 pb-2">
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold select-none">
        {/* Home Link */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-colors duration-200"
        >
          <Home className="w-4.5 h-4.5" />
          <span>หน้าแรก</span>
        </Link>

        <ChevronRight className="w-4 h-4 text-slate-300" />

        {/* Category Filter Link */}
        <Link
          href={`/?category=${category}`}
          className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
        >
          {category}
        </Link>

        <ChevronRight className="w-4 h-4 text-slate-300" />

        {/* Active Node */}
        <span className="text-slate-600 font-bold truncate max-w-[180px] sm:max-w-none">
          {title}
        </span>
      </nav>
    </div>
  );
}
