"use client";

import { useEffect, useState } from "react";

import styles from "./ScisiamSplash.module.css";

const BRAND_LETTERS = [..."Scisiam"];
const WELCOME_SEEN_KEY = "scisiam_welcome_splash_seen";
const FADE_DELAY_MS = 2500;
const REMOVE_DELAY_MS = 3000;

type SplashPhase = "checking" | "visible" | "leaving" | "hidden";

type ScisiamSplashProps = {
  active: boolean;
  hidden?: boolean;
};

export default function ScisiamSplash({
  active,
  hidden = false,
}: ScisiamSplashProps) {
  const [phase, setPhase] = useState<SplashPhase>("checking");

  useEffect(() => {
    if (!active) return;

    try {
      if (window.sessionStorage.getItem(WELCOME_SEEN_KEY)) {
        return;
      }
      window.sessionStorage.setItem(WELCOME_SEEN_KEY, "true");
    } catch {
      // Storage can be unavailable in private webviews; the welcome still works.
    }

    const revealTimer = window.setTimeout(() => setPhase("visible"), 0);

    const fadeTimer = window.setTimeout(
      () => setPhase("leaving"),
      FADE_DELAY_MS,
    );
    const removeTimer = window.setTimeout(
      () => setPhase("hidden"),
      REMOVE_DELAY_MS,
    );

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [active]);

  if (!active || hidden || phase === "checking" || phase === "hidden") {
    return null;
  }

  return (
    <div
      className={`${styles.screen} ${phase === "leaving" ? styles.leaving : ""}`}
      role="status"
      aria-live="polite"
      aria-label="ยินดีต้อนรับเข้าสู่ Scisiam"
    >
      <div className={styles.content}>
        <svg
          className={styles.atom}
          viewBox="0 0 220 220"
          role="img"
          aria-label="อะตอมสามมิติ"
        >
          <defs>
            <radialGradient id="scisiam-nucleus" cx="34%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#bfdbfe" />
              <stop offset="48%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </radialGradient>
            <radialGradient id="scisiam-red-electron" cx="30%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#fecaca" />
              <stop offset="55%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </radialGradient>
            <radialGradient id="scisiam-green-electron" cx="30%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#dcfce7" />
              <stop offset="55%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#166534" />
            </radialGradient>
            <radialGradient id="scisiam-yellow-electron" cx="30%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="55%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </radialGradient>
          </defs>

          <ellipse className={styles.orbit} cx="110" cy="110" rx="96" ry="39" />
          <ellipse
            className={styles.orbit}
            cx="110"
            cy="110"
            rx="96"
            ry="39"
            transform="rotate(60 110 110)"
          />
          <ellipse
            className={styles.orbit}
            cx="110"
            cy="110"
            rx="96"
            ry="39"
            transform="rotate(120 110 110)"
          />

          <circle cx="110" cy="110" r="39" fill="url(#scisiam-nucleus)" />
          <circle cx="99" cy="98" r="9" fill="#ffffff" opacity="0.55" />

          <g className={styles.electron}>
            <circle cx="32" cy="75" r="13" fill="url(#scisiam-red-electron)" />
            <circle cx="28" cy="70" r="3.5" fill="#ffffff" opacity="0.75" />
          </g>
          <g className={styles.electron}>
            <circle cx="178" cy="56" r="12" fill="url(#scisiam-green-electron)" />
            <circle cx="174" cy="52" r="3" fill="#ffffff" opacity="0.75" />
          </g>
          <g className={styles.electron}>
            <circle cx="151" cy="188" r="13" fill="url(#scisiam-yellow-electron)" />
            <circle cx="147" cy="183" r="3.5" fill="#ffffff" opacity="0.75" />
          </g>
        </svg>

        <div className={styles.wordmark} aria-label="Scisiam">
          {BRAND_LETTERS.map((letter, index) => (
            <span
              // The index is stable because this wordmark never reorders.
              key={`${letter}-${index}`}
              className={styles.letter}
              style={{ animationDelay: `${260 + index * 70}ms` }}
              aria-hidden="true"
            >
              {letter}
            </span>
          ))}
        </div>
        <p className={styles.caption}>ยินดีต้อนรับสู่ห้องทดลองวิทยาศาสตร์เสมือน</p>
      </div>
    </div>
  );
}
