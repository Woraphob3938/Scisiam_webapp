"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Award,
  ClipboardCheck,
  FlaskConical,
  Home,
  User,
} from "lucide-react";

const navItems = [
  { name: "หน้าหลัก", href: "/", icon: Home },
  { name: "ห้องแล็บ", href: "/?view=labs", icon: FlaskConical },
  { name: "ภารกิจ", href: "/missions", icon: ClipboardCheck },
  { name: "รางวัล", href: "/profile?tab=rewards", icon: Award },
  { name: "โปรไฟล์", href: "/profile", icon: User },
];

function getActiveItem(pathname: string, searchParams: URLSearchParams) {
  if (pathname.startsWith("/labs")) return "ห้องแล็บ";
  if (pathname === "/missions") return "ภารกิจ";
  if (pathname === "/profile" && searchParams.get("tab") === "rewards") {
    return "รางวัล";
  }
  if (pathname === "/profile") return "โปรไฟล์";
  if (pathname === "/" && searchParams.get("view") === "labs") {
    return "ห้องแล็บ";
  }
  return "หน้าหลัก";
}

export default function MobileTabBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const activeItem = getActiveItem(pathname, searchParams);

  return (
    <>
      <div
        className="h-[calc(5.5rem+env(safe-area-inset-bottom))] shrink-0 lg:hidden"
        aria-hidden="true"
      />
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-14px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden"
        aria-label="เมนูหลักบนมือถือ"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-1.5 text-[11px] font-extrabold leading-[1.35] transition-all duration-200 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-500"}`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
