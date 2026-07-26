"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import {
  applyDisplayPreferences,
  isDisplayPreferenceKey,
} from "@/lib/display-preferences";

const AIChatButton = dynamic(() => import("@/components/AIChatButton"), { ssr: false });
const FirstLoginTour = dynamic(() => import("@/components/FirstLoginTour"), { ssr: false });
const MobileChromeController = dynamic(() => import("@/components/MobileChromeController"), { ssr: false });
const MobileTabBar = dynamic(() => import("@/components/MobileTabBar"), { ssr: false });

function isAuthRoute(pathname: string) {
  return pathname === "/login" || pathname === "/register" || pathname === "/reset-password" || pathname.startsWith("/auth/");
}

export default function GlobalClientOverlays() {
  const pathname = usePathname();
  const { isAuthReady, isLoggedIn } = useAuth();
  const { role } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    applyDisplayPreferences();

    const syncDisplayPreferences = (event: StorageEvent) => {
      if (isDisplayPreferenceKey(event.key)) {
        applyDisplayPreferences();
      }
    };

    window.addEventListener("storage", syncDisplayPreferences);
    return () => window.removeEventListener("storage", syncDisplayPreferences);
  }, []);

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
      <FirstLoginTour role={role} />
      {isMobile ? (
        <>
          <MobileChromeController />
          <MobileTabBar />
        </>
      ) : null}
    </>
  );
}
