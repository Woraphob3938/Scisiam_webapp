"use client";

import { useEffect, useRef, useState } from "react";

const SPLASH_SEEN_KEY = "scisiam-mobile-splash-seen-v1";
const SPLASH_FALLBACK_MS = 4_000;

export default function MobileAppSplash() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (
      !isMobile ||
      prefersReducedMotion ||
      sessionStorage.getItem(SPLASH_SEEN_KEY) === "true"
    ) {
      return;
    }

    sessionStorage.setItem(SPLASH_SEEN_KEY, "true");
    const showFrame = window.requestAnimationFrame(() => setVisible(true));
    closeTimerRef.current = setTimeout(() => setVisible(false), SPLASH_FALLBACK_MS);

    return () => {
      window.cancelAnimationFrame(showFrame);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const closeSplash = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 180);
  };

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-200 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        autoPlay
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-contain"
        onEnded={closeSplash}
        onError={closeSplash}
      >
        <source src="/media/scisiam-mobile-splash.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
