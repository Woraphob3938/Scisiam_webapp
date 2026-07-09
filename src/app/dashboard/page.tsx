"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { ArrowRight, LayoutDashboard, UserCircle } from "lucide-react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TeacherDashboardSection from "@/components/profile/TeacherDashboardSection";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

export default function DashboardPage() {
  const { isCollapsed } = useSidebar();
  const { isAuthReady, isLoggedIn, role } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900 lg:pb-10">
      <Navbar />
      <div className="hidden lg:block">
        <Sidebar activeMenu="แดชบอร์ด" />
      </div>

      <main
        className={`min-w-0 transition-[padding-left] duration-300 ${
          isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"
        }`}
      >
        {!isAuthReady ? (
          <div className="mx-auto grid min-h-[60vh] max-w-6xl place-items-center px-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" aria-label="กำลังโหลดแดชบอร์ด" />
          </div>
        ) : !isLoggedIn ? (
          <DashboardMessage
            icon={UserCircle}
            title="เข้าสู่ระบบเพื่อเปิดแดชบอร์ด"
            description="แดชบอร์ดคุณครูต้องใช้บัญชี Scisiam ที่เข้าสู่ระบบแล้ว"
            href="/login?next=/dashboard"
            action="เข้าสู่ระบบ"
          />
        ) : role !== "teacher" ? (
          <DashboardMessage
            icon={LayoutDashboard}
            title="แดชบอร์ดนี้สำหรับคุณครู"
            description="บัญชีนักเรียนยังใช้หน้าโปรไฟล์และห้องแล็บได้ตามปกติ"
            href="/profile"
            action="กลับไปโปรไฟล์"
          />
        ) : (
          <TeacherDashboardSection />
        )}
      </main>
    </div>
  );
}

function DashboardMessage({
  icon: Icon,
  title,
  description,
  href,
  action,
}: {
  icon: ElementType;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-3xl font-extrabold leading-[1.35] text-slate-950">{title}</h1>
      <p className="mt-3 max-w-xl text-sm font-semibold leading-relaxed text-slate-500">{description}</p>
      <Link href={href} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-blue-500/15 hover:bg-blue-700">
        {action}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
