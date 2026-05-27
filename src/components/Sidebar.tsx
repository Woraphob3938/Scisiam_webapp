"use client";

import React from "react";
import Link from "next/link";
import { 
  Home, 
  FlaskConical, 
  ClipboardCheck, 
  Award, 
  History, 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

interface SidebarProps {
  activeMenu: "หน้าหลัก" | "ห้องแล็บของฉัน" | "ภารกิจนักวิทย์" | "คะแนนและรางวัล" | "ประวัติการเรียนรู้" | "โปรไฟล์" | string;
  flushLeft?: boolean;
}

export default function Sidebar({ activeMenu }: SidebarProps) {
  const { isCollapsed, toggleSidebar, isDarkMode, toggleDarkMode } = useSidebar();

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
      className={`flex flex-col bg-white border-r border-slate-200/60 justify-between sticky top-[73px] h-[calc(100vh-73px)] select-none transition-all duration-300 z-30 ${
        isCollapsed ? "w-[76px] p-3.5" : "w-[260px] p-6"
      }`}
    >
      {/* Floating Toggle Button on Right Edge */}
      <button
        onClick={toggleSidebar}
        className="absolute top-7 -right-3 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={isCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className="space-y-6">
        {/* Sidebar Header Brand (styled like the reference image logo) */}
        <div className={`flex items-center gap-3 pb-5 border-b border-slate-100 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0 select-none">
            {/* Custom 4-diamonds SVG logo */}
            <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
              <path d="M12 3.5 L15.5 7 L12 10.5 L8.5 7 Z" />
              <path d="M12 13.5 L15.5 17 L12 20.5 L8.5 17 Z" />
              <path d="M6.5 8.5 L10 12 L6.5 15.5 L3 12 Z" />
              <path d="M17.5 8.5 L21 12 L17.5 15.5 L14 12 Z" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left animate-in fade-in duration-200">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight leading-none">SciSiam</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Virtual Lab</span>
            </div>
          )}
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
                className={`flex items-center rounded-xl text-sm font-bold transition-all duration-300 transform active:scale-98 focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none ${
                  isCollapsed ? "justify-center p-3" : "gap-3.5 px-4.5 py-3"
                } ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                {!isCollapsed && <span className="animate-in fade-in duration-200 leading-none">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions (matching reference image) */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        {/* Dark Mode Toggle Switch */}
        <div className={`flex items-center justify-between ${isCollapsed ? "justify-center" : "px-1.5"}`}>
          <button
            onClick={toggleDarkMode}
            className={`flex items-center gap-3 text-slate-500 hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg ${
              isCollapsed ? "p-2.5 hover:bg-slate-50" : ""
            }`}
            title={isCollapsed ? "สลับโหมดมืด/สว่าง" : undefined}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            {!isCollapsed && (
              <span className="text-sm font-bold text-slate-600 animate-in fade-in duration-200">
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </button>
          
          {!isCollapsed && (
            <button
              onClick={toggleDarkMode}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? "bg-blue-600" : "bg-slate-200"
              }`}
              aria-label="สลับโหมดมืด"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  isDarkMode ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => alert("ระบบกำลังออกจากระบบ... 🔒")}
          className={`flex items-center justify-center font-bold text-white transition-all duration-300 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
            isCollapsed 
              ? "p-3 bg-slate-600 hover:bg-slate-700 rounded-xl" 
              : "gap-2.5 px-4.5 py-3 bg-slate-600 hover:bg-slate-700 rounded-xl text-sm"
          }`}
          title={isCollapsed ? "ออกจากระบบ" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="animate-in fade-in duration-200 leading-none">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
