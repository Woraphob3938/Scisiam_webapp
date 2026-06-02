"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Sparkles, ChevronDown, Compass, Award, Menu, User } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import {
  cacheSciSiamAuth,
  clearSciSiamAuthCache,
  SCISIAM_AUTH_EVENT,
  SCISIAM_POINTS_EVENT,
} from "@/lib/supabase/auth-cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [points, setPoints] = useState(0);
  
  // Auth state variables
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("student");
  const [userName, setUserName] = useState("นักเรียน");
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; type: string }>>([]);

  useEffect(() => {
    const loadPoints = () => {
      const stored = localStorage.getItem("scisiam_points");
      if (stored) {
        setPoints(Number(stored));
      } else {
        localStorage.setItem("scisiam_points", "0");
      }
    };

    const loadAuthStateFromCache = () => {
      const loggedIn = localStorage.getItem("scisiam_logged_in") === "true";
      setIsLoggedIn(loggedIn);
      setRole(localStorage.getItem("scisiam_user_role") || "student");
      setUserName(localStorage.getItem("scisiam_user_name") || "นักเรียน");
    };

    const loadAuthState = async () => {
      if (!isSupabaseConfigured()) {
        loadAuthStateFromCache();
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        clearSciSiamAuthCache({ emit: false });
        setIsLoggedIn(false);
        setRole("student");
        setUserName("นักเรียน");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, role, total_points")
        .eq("id", user.id)
        .maybeSingle();

      const nextRole = profile?.role || "student";
      const nextName = profile?.display_name || user.email?.split("@")[0] || "นักเรียน";
      const nextPoints = profile?.total_points ?? Number(localStorage.getItem("scisiam_points") || "0");

      setIsLoggedIn(true);
      setRole(nextRole);
      setUserName(nextName);
      setPoints(nextPoints);
      cacheSciSiamAuth({
        email: user.email,
        role: nextRole,
        displayName: nextName,
        totalPoints: nextPoints,
      }, { emit: false });
    };

    loadPoints();
    void loadAuthState();

    const supabase = isSupabaseConfigured() ? createClient() : null;
    const authSubscription = supabase?.auth.onAuthStateChange(() => {
      void loadAuthState();
    }).data.subscription;
    const handleAuthUpdated = () => void loadAuthState();

    window.addEventListener(SCISIAM_POINTS_EVENT, loadPoints);
    window.addEventListener(SCISIAM_AUTH_EVENT, handleAuthUpdated);
    window.addEventListener("storage", loadPoints);
    window.addEventListener("storage", handleAuthUpdated);
    
    return () => {
      window.removeEventListener(SCISIAM_POINTS_EVENT, loadPoints);
      window.removeEventListener(SCISIAM_AUTH_EVENT, handleAuthUpdated);
      window.removeEventListener("storage", loadPoints);
      window.removeEventListener("storage", handleAuthUpdated);
      authSubscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkNotifications = () => {
      const items: Array<{ id: string; title: string; message: string; type: string }> = [];
      
      if (typeof window !== "undefined") {
        const labs = [
          { key: "scisiam_saved_hookes_experiment", name: "Hooke's Law" },
          { key: "scisiam_saved_ideal_gas_experiment", name: "Ideal Gas Law" },
          { key: "scisiam_saved_ohms_experiment", name: "Ohm's Law" },
          { key: "scisiam_saved_cooling_experiment", name: "Newton's Cooling" },
          { key: "scisiam_saved_titration_experiment", name: "Acid-Base Titration" },
          { key: "scisiam_saved_photosynthesis_experiment", name: "Photosynthesis Rate" },
          { key: "scisiam_saved_mendelian_experiment", name: "Mendelian Genetics" },
          { key: "scisiam_saved_mitosis_experiment", name: "Mitosis Cell Cycle" },
          { key: "scisiam_saved_hess_experiment", name: "Hess's Law" },
        ];

        labs.forEach((lab) => {
          if (localStorage.getItem(lab.key)) {
            items.push({
              id: lab.key,
              title: "บันทึกแล็บสำเร็จ! 🧪",
              message: `คุณได้ทำการจำลองและบันทึกผลแล็บ ${lab.name} เรียบร้อยแล้ว`,
              type: "lab",
            });
          }
        });

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("scisiam_claimed_mission_")) {
            items.push({
              id: key,
              title: "รับรางวัลภารกิจ! 💎",
              message: `คุณได้เคลมแต้มรางวัลจากภารกิจสำเร็จแล้ว`,
              type: "mission",
            });
          }
        }
      }
      setNotifications(items);
    };

    checkNotifications();
    window.addEventListener("storage", checkNotifications);
    window.addEventListener(SCISIAM_POINTS_EVENT, checkNotifications);
    return () => {
      window.removeEventListener("storage", checkNotifications);
      window.removeEventListener(SCISIAM_POINTS_EVENT, checkNotifications);
    };
  }, []);

  const handleSignOut = async () => {
    setShowProfileMenu(false);

    if (isSupabaseConfigured()) {
      await createClient().auth.signOut();
    }

    clearSciSiamAuthCache();
    setIsLoggedIn(false);
    setRole("student");
    setUserName("นักเรียน");
    setPoints(0);
    window.location.href = "/";
  };

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
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight select-none">
            SciSiam
          </span>
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
            {notifications.length > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              </>
            )}
          </button>

          {/* Simple Dropdown for notifications */}
          {showNotification && (
            <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 text-left z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-1.5 border-b border-slate-50 flex justify-between items-center">
                <span className="font-semibold text-slate-800 text-sm">การแจ้งเตือน</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-semibold">ใหม่ {notifications.length}</span>
              </div>
              <div className="max-h-60 overflow-y-auto px-2 py-1.5 space-y-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 font-semibold text-xs">
                    ไม่มีการแจ้งเตือนในขณะนี้
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-all duration-200 flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 break-words">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <span className="h-6 w-px bg-slate-200" />

        {/* User Profile Avatar / Login Button */}
        <div className="relative">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 pr-2.5 rounded-xl transition-all duration-200 select-none cursor-pointer"
              >
                <div className="relative w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden ring-2 ring-indigo-50/50 border border-white shrink-0">
                  <Image src="/student_avatar_3d.png" alt="รูปโปรไฟล์" fill sizes="36px" className="object-cover" />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs text-slate-400 font-medium">ยินดีต้อนรับ</span>
                  <span className="text-sm font-semibold text-slate-700 -mt-0.5 flex items-center gap-1 leading-normal">
                    สวัสดี, {role === "teacher" ? "คุณครู" : userName}
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
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors font-medium leading-normal"
                  >
                    โปรไฟล์ของฉัน
                  </Link>
                  <a
                    href="#settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors font-medium leading-normal"
                  >
                    ตั้งค่าบัญชี
                  </a>
                  <hr className="my-1 border-slate-50" />
                  <button
                    onClick={() => void handleSignOut()}
                    className="w-full text-left block px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium leading-normal cursor-pointer"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/login"
              className="border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs hover:scale-102 active:scale-98 select-none leading-normal"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
