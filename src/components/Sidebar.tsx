"use client";

import React from "react";
import Link from "next/link";
import { Home, FlaskConical, ClipboardCheck, Award, History, User } from "lucide-react";

interface SidebarProps {
  activeMenu: "หน้าหลัก" | "ห้องแล็บของฉัน" | "ภารกิจนักวิทย์" | "คะแนนและรางวัล" | "ประวัติการเรียนรู้" | "โปรไฟล์" | string;
}

export default function Sidebar({ activeMenu }: SidebarProps) {
  const sidebarMenu = [
    { name: "หน้าหลัก", icon: Home, href: "/" },
    { name: "ห้องแล็บของฉัน", icon: FlaskConical, href: "#" },
    { name: "ภารกิจนักวิทย์", icon: ClipboardCheck, href: "#" },
    { name: "คะแนนและรางวัล", icon: Award, href: "#" },
    { name: "ประวัติการเรียนรู้", icon: History, href: "#" },
    { name: "โปรไฟล์", icon: User, href: "/profile" },
  ];

  return (
    <aside className="w-full flex flex-col bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-[32px] p-6 shadow-sm min-h-[580px] justify-between lg:sticky lg:top-24 self-start select-none">
      <div className="space-y-6">
        {/* Sidebar Header Brand (styled like the logo) */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-50/80 border border-blue-100/30 flex items-center justify-center overflow-hidden relative" aria-hidden="true">
            <img src="/penguin_expressions.png" alt="SciSiam Logo" className="absolute w-[300%] max-w-none left-0 top-[-5%] object-contain" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base font-extrabold text-slate-800 leading-none">ไออุ่น</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">SciSiam Mascot</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5" aria-label="เมนูหลักการนำทาง">
          {sidebarMenu.map((item, idx) => {
            const Icon = item.icon;
            const isActive = item.name === activeMenu;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform active:scale-98 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:outline-none ${
                  isActive
                    ? "bg-blue-50/80 text-blue-600 border-l-4 border-blue-500 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mascot Callout Card */}
      <div className="mt-8 border-t border-slate-50 pt-5 flex flex-col items-center">
        {/* Speech bubble */}
        <div className="relative w-full bg-blue-50/70 border border-blue-100/50 rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 text-center mb-1 leading-relaxed">
          เรียนรู้ไปด้วยกัน
          <br />
          เก่งขึ้นทุกวันเลย! 🐧✨
          {/* Bubble tail */}
          <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-blue-50/70 border-r border-b border-blue-100/50 rotate-45" aria-hidden="true" />
        </div>

        {/* Penguin image */}
        <div className="w-28 h-28 mt-2 relative overflow-hidden" aria-hidden="true">
          <img src="/penguin_expressions.png" alt="Mascot Penguin" className="absolute w-[300%] max-w-none left-0 top-[-5%] object-contain" />
        </div>
      </div>
    </aside>
  );
}
