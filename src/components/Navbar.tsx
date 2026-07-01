"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, Award, Menu, User } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import SettingsModal from "@/components/SettingsModal";
import { ClassroomActions } from "@/components/classrooms/ClassroomActions";
import {
  cacheSciSiamAuth,
  clearSciSiamAuthCache,
  SCISIAM_AUTH_EVENT,
} from "@/lib/supabase/auth-cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getProfileAvatarSrc } from "@/lib/supabase/profile-avatar";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Auth state variables
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("นักเรียน");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; type: string }>>([]);

  useEffect(() => {
    const loadAuthStateFromCache = () => {
      const loggedIn = localStorage.getItem("scisiam_logged_in") === "true";
      setIsLoggedIn(loggedIn);
      setUserName(localStorage.getItem("scisiam_user_name") || "นักเรียน");
      setAvatarPath(localStorage.getItem("scisiam_user_avatar"));
      setAvatarVersion(Date.now());
    };

    const loadAuthState = async () => {
      const isDemo = localStorage.getItem("scisiam_demo_mode") === "true";
      if (isDemo || !isSupabaseConfigured()) {
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
        setUserName("นักเรียน");
        setAvatarPath(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, role, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      const nextRole = profile?.role || "student";
      const nextName = profile?.display_name || user.email?.split("@")[0] || "นักเรียน";
      setIsLoggedIn(true);
      setUserName(nextName);
      setAvatarPath(profile?.avatar_url ?? null);
      setAvatarVersion(Date.now());
      cacheSciSiamAuth({
        email: user.email,
        role: nextRole,
        displayName: nextName,
        avatarUrl: profile?.avatar_url ?? null,
      }, { emit: false });
    };

    void loadAuthState();

    const supabase = isSupabaseConfigured() ? createClient() : null;
    const authSubscription = supabase?.auth.onAuthStateChange(() => {
      void loadAuthState();
    }).data.subscription;
    const handleAuthUpdated = () => void loadAuthState();

    window.addEventListener(SCISIAM_AUTH_EVENT, handleAuthUpdated);
    window.addEventListener("storage", handleAuthUpdated);
    
    return () => {
      window.removeEventListener(SCISIAM_AUTH_EVENT, handleAuthUpdated);
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
              message: "คุณปลดล็อกรางวัลจากภารกิจสำเร็จแล้ว",
              type: "mission",
            });
          }
        }
      }
      setNotifications(items);
    };

    checkNotifications();
    window.addEventListener("storage", checkNotifications);
    return () => {
      window.removeEventListener("storage", checkNotifications);
    };
  }, []);

  const handleSignOut = async () => {
    setShowProfileMenu(false);

    if (isSupabaseConfigured()) {
      await createClient().auth.signOut();
    }

    clearSciSiamAuthCache();
    setIsLoggedIn(false);
    setUserName("นักเรียน");
    setAvatarPath(null);
    window.location.href = "/";
  };

  const displayedNotifications = isLoggedIn ? notifications : [];
  const profileAvatarSrc = getProfileAvatarSrc(avatarPath, avatarVersion);

  return (
    <>
    <nav className="sticky top-0 z-50 flex min-h-[64px] w-full items-center justify-between border-b border-slate-100 bg-white/85 px-3 py-2 shadow-xs backdrop-blur-md transition-all duration-300 sm:px-8 sm:py-3.5">
      {/* Logo Section */}
      <div className="flex min-w-0 items-center gap-2 select-none sm:gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 hidden lg:block cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="เปิด/ปิด เมนูด้านข้าง"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/labs" className="group flex min-w-0 cursor-pointer items-center gap-2 select-none sm:gap-2.5">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white shadow-md shadow-blue-500/20 transition-all duration-300 group-hover:scale-105">
            <Image src="/ai-oon-logo.png" alt="โลโก้ SciSiam น้องไออุ่น" fill sizes="40px" className="object-contain p-0.5" priority />
          </div>
          <span className="truncate whitespace-nowrap bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-lg font-bold tracking-tight text-transparent select-none sm:text-xl">
            SciSiam
          </span>
        </Link>
      </div>

      {/* Right Navigation Controls */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-5">
        <div className="hidden lg:block">
          <ClassroomActions placement="desktop" />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="relative flex size-10 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
            aria-label="การแจ้งเตือน"
          >
            <Bell className="w-5 h-5" />
            {displayedNotifications.length > 0 && (
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
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-semibold">ใหม่ {displayedNotifications.length}</span>
              </div>
              <div className="max-h-60 overflow-y-auto px-2 py-1.5 space-y-1">
                {displayedNotifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 font-semibold text-xs">
                    ไม่มีการแจ้งเตือนในขณะนี้
                  </div>
                ) : (
                  displayedNotifications.map((n) => (
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
        <span className="hidden h-6 w-px bg-slate-200 sm:block" />

        {/* User Profile Avatar / Login Button */}
        <div className="relative">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 pr-2.5 rounded-xl transition-all duration-200 select-none cursor-pointer"
              >
                <div className="relative w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden ring-2 ring-indigo-50/50 border border-white shrink-0">
                  <Image src={profileAvatarSrc} alt={`รูปโปรไฟล์ของ ${userName}`} fill sizes="36px" className="object-cover" unoptimized={profileAvatarSrc.startsWith("data:")} />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs text-slate-400 font-medium">ยินดีต้อนรับ</span>
                  <span className="text-sm font-semibold text-slate-700 -mt-0.5 flex items-center gap-1 leading-normal">
                    สวัสดี, {userName}
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
                  <button
                    type="button"
                    aria-label="Open SciSiam settings"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowSettingsModal(true);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors font-medium leading-normal"
                  >
                    ตั้งค่าบัญชี
                  </button>
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
              className="flex min-h-10 shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold leading-none text-slate-700 shadow-xs transition-all duration-200 hover:scale-102 hover:border-slate-300 hover:bg-slate-50 active:scale-98 sm:gap-2 sm:px-4 sm:text-sm sm:font-semibold"
            >
              <User className="hidden h-4 w-4 text-slate-500 min-[430px]:block" />
              <span className="whitespace-nowrap">เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
    <SettingsModal
      isOpen={showSettingsModal}
      onClose={() => setShowSettingsModal(false)}
    />
    </>
  );
}
