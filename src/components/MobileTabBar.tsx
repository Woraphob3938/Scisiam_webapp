"use client";

import { useEffect, useState, type ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, LayoutDashboard, User, UsersRound } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

type MobileNavItem = {
  name: string;
  href: string;
  icon: ElementType;
};

const leftNavItems: MobileNavItem[] = [
  { name: "ห้องแล็บ", href: "/labs", icon: FlaskConical },
];

const teacherLeftNavItems: MobileNavItem[] = [
  { name: "ห้องแล็บ", href: "/labs", icon: FlaskConical },
  { name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
];

function getActiveItem(pathname: string) {
  if (pathname.startsWith("/labs")) return "ห้องแล็บ";
  if (pathname === "/dashboard") return "แดชบอร์ด";
  if (pathname.startsWith("/classrooms")) return "ชั้นเรียน";
  if (pathname === "/profile") return "โปรไฟล์";
  return "ห้องแล็บ";
}

function MobileNavLink({ item, activeItem }: { item: MobileNavItem; activeItem: string }) {
  const Icon = item.icon;
  const isActive = activeItem === item.name;
  const tourTarget =
    item.href === "/classrooms"
      ? "classrooms-nav"
      : item.href === "/labs"
        ? "labs-nav"
        : item.href === "/profile"
          ? "profile-menu"
          : undefined;

  return (
    <Link
      href={item.href}
      data-tour={tourTarget}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-xs font-extrabold leading-[1.35] transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${
        isActive
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon className="size-[18px]" aria-hidden="true" />
      <span className="max-w-full truncate">{item.name}</span>
    </Link>
  );
}

export default function MobileTabBar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted) return null;
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const activeItem = getActiveItem(pathname);
  const navItems = role === "teacher" ? teacherLeftNavItems : leftNavItems;

  return (
    <>
      <div
        className="h-[calc(5rem+env(safe-area-inset-bottom))] shrink-0 lg:hidden"
        aria-hidden="true"
      />
      <nav
        className="mobile-chrome-bottom fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-2 pt-2 pb-[calc(0.4rem+env(safe-area-inset-bottom))] shadow-[0_-14px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden"
        aria-label="เมนูหลักบนมือถือ"
      >
        <div className={`mx-auto grid max-w-md items-center gap-1 ${role === "teacher" ? "grid-cols-4" : "grid-cols-3"}`}>
          {navItems.map((item) => (
            <MobileNavLink key={item.name} item={item} activeItem={activeItem} />
          ))}

          <MobileNavLink
            item={{ name: "ชั้นเรียน", href: "/classrooms", icon: UsersRound }}
            activeItem={activeItem}
          />
          <MobileNavLink
            item={{ name: "โปรไฟล์", href: "/profile", icon: User }}
            activeItem={activeItem}
          />
        </div>
      </nav>
    </>
  );
}
