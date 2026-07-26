"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const HIDE_AFTER_PX = 18;
const SHOW_AFTER_PX = 6;
const ALWAYS_VISIBLE_BELOW_PX = 48;

export default function MobileChromeController() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    let lastScrollY = window.scrollY;
    let downwardDistance = 0;
    let upwardDistance = 0;
    let animationFrame = 0;

    const setChromeVisibility = (visibility: "visible" | "hidden") => {
      root.dataset.mobileChrome = visibility;
    };

    const updateFromScroll = () => {
      animationFrame = 0;
      const currentScrollY = Math.max(0, window.scrollY);
      const delta = currentScrollY - lastScrollY;

      if (root.dataset.scisiamTourOpen === "true" || currentScrollY <= ALWAYS_VISIBLE_BELOW_PX) {
        downwardDistance = 0;
        upwardDistance = 0;
        setChromeVisibility("visible");
        lastScrollY = currentScrollY;
        return;
      }

      if (delta > 0) {
        downwardDistance += delta;
        upwardDistance = 0;
        if (downwardDistance >= HIDE_AFTER_PX) {
          setChromeVisibility("hidden");
          downwardDistance = 0;
        }
      } else if (delta < 0) {
        upwardDistance += Math.abs(delta);
        downwardDistance = 0;
        if (upwardDistance >= SHOW_AFTER_PX) {
          setChromeVisibility("visible");
          upwardDistance = 0;
        }
      }

      lastScrollY = currentScrollY;
    };

    const handleScroll = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateFromScroll);
    };

    setChromeVisibility("visible");
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      delete root.dataset.mobileChrome;
    };
  }, [pathname]);

  return (
    <style jsx global>{`
      @media (max-width: 1023px) {
        .mobile-chrome-top,
        .mobile-chrome-bottom {
          will-change: transform, opacity;
          transition:
            transform 170ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 130ms ease-out;
        }

        html[data-mobile-chrome="hidden"]:not([data-scisiam-tour-open="true"])
          .mobile-chrome-top {
          pointer-events: none;
          opacity: 0;
          transform: translate3d(0, calc(-100% - env(safe-area-inset-top)), 0);
        }

        html[data-mobile-chrome="hidden"]:not([data-scisiam-tour-open="true"])
          .mobile-chrome-bottom {
          pointer-events: none;
          opacity: 0;
          transform: translate3d(0, calc(100% + env(safe-area-inset-bottom)), 0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .mobile-chrome-top,
        .mobile-chrome-bottom {
          transition-duration: 0.01ms;
        }
      }
    `}</style>
  );
}
