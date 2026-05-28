"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Sparkles, ChevronDown, Compass, Award, Menu } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [points, setPoints] = useState(120);

  useEffect(() => {
    const loadPoints = () => {
      const stored = localStorage.getItem("scisiam_points");
      if (stored) {
        setPoints(Number(stored));
      } else {
        localStorage.setItem("scisiam_points", "120");
      }
    };
    loadPoints();

    window.addEventListener("points-updated", loadPoints);
    window.addEventListener("storage", loadPoints);
    return () => {
      window.removeEventListener("points-updated", loadPoints);
      window.removeEventListener("storage", loadPoints);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all duration-300">
      {/* Logo Section */}
      <div className="flex items-center gap-3 select-none">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 hidden lg:block cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="เปิด/ปิด เมนูด้านข้าง"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all duration-300">
            <Compass className="w-5.5 h-5.5 animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
              SciSiam
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider -mt-1 uppercase">
              Virtual Lab
            </span>
          </div>
        </Link>
      </div>

      {/* Right Navigation Controls */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Points/Stars Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/50 text-amber-700 rounded-full shadow-xs cursor-pointer select-none transition-all duration-300 hover:scale-105 active:scale-95">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold">{points} แต้ม</span>
        </div>


        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-all duration-200"
            aria-label="การแจ้งเตือน"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Simple Dropdown for notifications */}
          {showNotification && (
            <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 text-left z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-1.5 border-b border-slate-50 flex justify-between items-center">
                <span className="font-semibold text-slate-800 text-sm">การแจ้งเตือน</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-semibold">ใหม่ 1</span>
              </div>
              <div className="max-h-60 overflow-y-auto px-2 py-1.5 space-y-1">
                <div className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-all duration-200 flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">ภารกิจสำเร็จ!</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">คุณได้รับ +20 แต้มจากห้องแล็บ Newton&apos;s cooling</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <span className="h-6 w-px bg-slate-200" />

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:bg-slate-50 p-1.5 pr-2.5 rounded-xl transition-all duration-200 select-none cursor-pointer"
          >
            <div className="relative w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden ring-2 ring-indigo-50/50 border border-white shrink-0">
              <Image src="/student_avatar_3d.png" alt="รูปโปรไฟล์" fill sizes="36px" className="object-cover" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs text-slate-400 font-medium">ยินดีต้อนรับ</span>
              <span className="text-sm font-semibold text-slate-700 -mt-0.5 flex items-center gap-1">
                สวัสดี, นักเรียน
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
              </span>
            </div>
          </button>

          {/* Simple Dropdown for profile menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 text-left z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <Link
                href="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                โปรไฟล์ของฉัน
              </Link>
              <a
                href="#settings"
                onClick={() => setShowProfileMenu(false)}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                ตั้งค่าบัญชี
              </a>
              <hr className="my-1 border-slate-50" />
              <a
                href="#logout"
                onClick={() => setShowProfileMenu(false)}
                className="block px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              >
                ออกจากระบบ
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
