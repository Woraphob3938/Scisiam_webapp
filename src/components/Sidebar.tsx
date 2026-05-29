"use client";

import React from "react";
import Link from "next/link";
import { 
  Home, 
  FlaskConical, 
  ClipboardCheck, 
  Award, 
  History, 
  User 
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

interface SidebarProps {
  activeMenu: "หน้าหลัก" | "ห้องแล็บของฉัน" | "ภารกิจนักวิทย์" | "คะแนนและรางวัล" | "ประวัติการเรียนรู้" | "โปรไฟล์" | string;
  flushLeft?: boolean;
  forceCollapsed?: boolean;
}

export default function Sidebar({ activeMenu, forceCollapsed = false }: SidebarProps) {
  const { isCollapsed } = useSidebar();
  const collapsed = forceCollapsed || isCollapsed;

  const sidebarMenu = [
    { name: "หน้าหลัก", icon: Home, href: "/" },
    { name: "ห้องแล็บของฉัน", icon: FlaskConical, href: "#" },
    { name: "ภารกิจนักวิทย์", icon: ClipboardCheck, href: "#" },
    { name: "คะแนนและรางวัล", icon: Award, href: "#" },
    { name: "ประวัติการเรียนรู้", icon: History, href: "#" },
    { name: "โปรไฟล์", icon: User, href: "/profile" },
  ];

  return (
    <aside 
      className={`fixed left-0 top-[73px] bottom-0 flex h-[calc(100vh-73px)] flex-col justify-between overflow-y-auto bg-white border-r border-slate-200/60 select-none transition-all duration-300 z-40 ${
        collapsed ? "w-[76px] p-3.5" : "w-[260px] p-6"
      }`}
    >
      <div className="space-y-6">
        {/* Navigation Menu */}
        <nav className="space-y-1.5" aria-label="เมนูหลักการนำทาง">
          {sidebarMenu.map((item, idx) => {
            const Icon = item.icon;
            const isActive = item.name === activeMenu;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center rounded-xl text-sm font-bold transition-all duration-300 transform active:scale-98 focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none ${
                  collapsed ? "justify-center p-3" : "gap-3.5 px-4.5 py-3"
                } ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                {!collapsed && <span className="animate-in fade-in duration-200 leading-none">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>


    </aside>
  );
}
