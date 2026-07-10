"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

const AIChatButton = dynamic(() => import("@/components/AIChatButton"), { ssr: false });
const MobileTabBar = dynamic(() => import("@/components/MobileTabBar"), { ssr: false });

function isAuthRoute(pathname: string) {
  return pathname === "/login" || pathname === "/register" || pathname === "/reset-password" || pathname.startsWith("/auth/");
}

export default function GlobalClientOverlays() {
  const pathname = usePathname();
  const { isAuthReady, isLoggedIn } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const shouldLoadInteractiveUi = isAuthReady && isLoggedIn && !isAuthRoute(pathname);

  if (!shouldLoadInteractiveUi) {
    return null;
  }

  return (
    <>
      <AIChatButton />
      {isMobile ? <MobileTabBar /> : null}
    </>
  );
}
