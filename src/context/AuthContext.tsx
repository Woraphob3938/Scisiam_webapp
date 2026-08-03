"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  cacheScisiamAuth,
  clearScisiamAuthCache,
  SCISIAM_AUTH_AVATAR_VERSION_KEY,
  SCISIAM_AUTH_EVENT,
} from "@/lib/supabase/auth-cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ScisiamUserRole } from "@/lib/supabase/database.types";

const isDemoModeEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true";

type AuthState = {
  isAuthReady: boolean;
  isLoggedIn: boolean;
  role: ScisiamUserRole;
  userName: string;
  avatarPath: string | null;
  avatarVersion: string | number;
  localNotificationMode: boolean;
};

const defaultAuthState: AuthState = {
  isAuthReady: false,
  isLoggedIn: false,
  role: "student",
  userName: "นักเรียน",
  avatarPath: null,
  avatarVersion: 0,
  localNotificationMode: false,
};

const AuthContext = createContext<AuthState>(defaultAuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(defaultAuthState);

  useEffect(() => {
    const loadAuthStateFromCache = (localNotificationMode = true) => {
      setAuthState({
        isAuthReady: true,
        isLoggedIn: localStorage.getItem("scisiam_logged_in") === "true",
        role: (localStorage.getItem("scisiam_user_role") as ScisiamUserRole | null) || "student",
        userName: localStorage.getItem("scisiam_user_name") || "นักเรียน",
        avatarPath: localStorage.getItem("scisiam_user_avatar"),
        avatarVersion: localStorage.getItem(SCISIAM_AUTH_AVATAR_VERSION_KEY) || Date.now(),
        localNotificationMode,
      });
    };

    const loadAuthState = async () => {
      const isDemo = isDemoModeEnabled && localStorage.getItem("scisiam_demo_mode") === "true";
      if (isDemo || !isSupabaseConfigured()) {
        loadAuthStateFromCache();
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          clearScisiamAuthCache({ emit: false });
          setAuthState({ ...defaultAuthState, isAuthReady: true });
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, role, avatar_url, updated_at")
          .eq("id", user.id)
          .maybeSingle();

        const userName = profile?.display_name || user.email?.split("@")[0] || "นักเรียน";
        setAuthState({
          isAuthReady: true,
          isLoggedIn: true,
          role: profile?.role || "student",
          userName,
          avatarPath: profile?.avatar_url ?? null,
          avatarVersion: profile?.updated_at || Date.now(),
          localNotificationMode: false,
        });
        cacheScisiamAuth(
          {
            role: profile?.role || "student",
            displayName: userName,
            avatarUrl: profile?.avatar_url ?? null,
            avatarVersion: profile?.updated_at ?? null,
          },
          { emit: false },
        );
      } catch {
        // The cache is display-only; middleware and Supabase still guard private data.
        loadAuthStateFromCache(false);
      }
    };

    void loadAuthState();

    const supabase = isSupabaseConfigured() ? createClient() : null;
    const authSubscription = supabase?.auth.onAuthStateChange(() => {
      void loadAuthState();
    }).data.subscription;
    const handleAuthUpdated = () => {
      // Update shared chrome immediately, then reconcile against Supabase.
      loadAuthStateFromCache(false);
      void loadAuthState();
    };
    const handleAppResume = () => handleAuthUpdated();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") handleAuthUpdated();
    };

    window.addEventListener(SCISIAM_AUTH_EVENT, handleAuthUpdated);
    window.addEventListener("storage", handleAuthUpdated);
    window.addEventListener("online", handleAuthUpdated);
    window.addEventListener("pageshow", handleAppResume);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener(SCISIAM_AUTH_EVENT, handleAuthUpdated);
      window.removeEventListener("storage", handleAuthUpdated);
      window.removeEventListener("online", handleAuthUpdated);
      window.removeEventListener("pageshow", handleAppResume);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      authSubscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(() => authState, [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
