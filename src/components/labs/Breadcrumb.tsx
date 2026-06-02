"use client";

import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  category: string;
  title: string;
}

export default function Breadcrumb({ category, title }: BreadcrumbProps) {
  const categoryHref = ["Physics", "Chemistry", "Biology"].includes(category)
    ? `/?category=${encodeURIComponent(category)}`
    : "/";

  return (
      <nav className="flex min-w-0 items-center gap-1.5 text-xs sm:text-sm font-semibold select-none">
        {/* Home Link */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors duration-200"
        >
          <Home className="w-4.5 h-4.5" />
          <span>หน้าแรก</span>
        </Link>

        <ChevronRight className="w-4 h-4 text-slate-300" />

        {/* Category Filter Link */}
        <Link
          href={categoryHref}
          className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
        >
          {category}
        </Link>

        <ChevronRight className="w-4 h-4 text-slate-300" />

        {/* Active Node */}
        <span className="truncate text-slate-700 font-bold max-w-[180px] sm:max-w-none" aria-current="page">
          {title}
        </span>
      </nav>
  );
}
