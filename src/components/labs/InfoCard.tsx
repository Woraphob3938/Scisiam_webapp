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
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 flex flex-col gap-4">
      {/* Header Container */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`} aria-hidden="true">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>
      </div>

      {/* Bullet Items */}
      <ul className="space-y-2.5">
        {bullets.map((bullet, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70 shrink-0 mt-2.5" aria-hidden="true" />
            <span className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              {bullet}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
