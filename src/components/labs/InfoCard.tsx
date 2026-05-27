"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  title: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  bullets: string[];
}

export default function InfoCard({
  title,
  icon: Icon,
  iconBg,
  iconColor,
  bullets,
}: InfoCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/40 p-6.5 shadow-xl shadow-slate-100/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
      {/* Header Container */}
      <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`} aria-hidden="true">
          <Icon className="w-5.5 h-5.5" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-800">
          {title}
        </h2>
      </div>

      {/* Bullet Items */}
      <ul className="space-y-3">
        {bullets.map((bullet, idx) => (
          <li key={idx} className="flex items-start gap-3 group/item">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 shrink-0 mt-2.5 transition-all group-hover/item:scale-125" aria-hidden="true" />
            <span className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              {bullet}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
