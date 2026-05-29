"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
  toggleDarkMode: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  toggleSidebar: () => {},
  isDarkMode: false,
  setIsDarkMode: () => {},
  toggleDarkMode: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const storedCollapsed = localStorage.getItem("scisiam_sidebar_collapsed");
    const storedDark = localStorage.getItem("scisiam_dark_mode");
    const nextCollapsed = storedCollapsed === "true";
    const nextDark = storedDark === "true";

    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const frame = window.requestAnimationFrame(() => {
      setIsCollapsed(nextCollapsed);
      setIsDarkMode(nextDark);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("scisiam_sidebar_collapsed", String(next));
      return next;
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("scisiam_dark_mode", String(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    isCollapsed,
    setIsCollapsed,
    toggleSidebar,
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode,
  }), [isCollapsed, toggleSidebar, isDarkMode, toggleDarkMode]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
