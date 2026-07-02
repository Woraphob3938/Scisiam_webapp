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
  cacheSciSiamAuth,
  clearSciSiamAuthCache,
  SCISIAM_AUTH_EVENT,
} from "@/lib/supabase/auth-cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type AuthState = {
  isAuthReady: boolean;
  isLoggedIn: boolean;
  userName: string;
  avatarPath: string | null;
  avatarVersion: number;
  localNotificationMode: boolean;
};

const defaultAuthState: AuthState = {
  isAuthReady: false,
  isLoggedIn: false,
  userName: "นักเรียน",
  avatarPath: null,
  avatarVersion: 0,
  localNotificationMode: false,
};

const AuthContext = createContext<AuthState>(defaultAuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(defaultAuthState);

  useEffect(() => {
    const loadAuthStateFromCache = () => {
      setAuthState({
        isAuthReady: true,
        isLoggedIn: localStorage.getItem("scisiam_logged_in") === "true",
        userName: localStorage.getItem("scisiam_user_name") || "นักเรียน",
        avatarPath: localStorage.getItem("scisiam_user_avatar"),
        avatarVersion: Date.now(),
        localNotificationMode: true,
      });
    };

    const loadAuthState = async () => {
      const isDemo = localStorage.getItem("scisiam_demo_mode") === "true";
      if (isDemo || !isSupabaseConfigured()) {
        loadAuthStateFromCache();
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        clearSciSiamAuthCache({ emit: false });
        setAuthState({ ...defaultAuthState, isAuthReady: true });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, role, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      const userName = profile?.display_name || user.email?.split("@")[0] || "นักเรียน";
      setAuthState({
        isAuthReady: true,
        isLoggedIn: true,
        userName,
        avatarPath: profile?.avatar_url ?? null,
        avatarVersion: Date.now(),
        localNotificationMode: false,
      });
      cacheSciSiamAuth(
        {
          email: user.email,
          role: profile?.role || "student",
          displayName: userName,
          avatarUrl: profile?.avatar_url ?? null,
        },
        { emit: false },
      );
    };

    void loadAuthState();

    const supabase = isSupabaseConfigured() ? createClient() : null;
    const authSubscription = supabase?.auth.onAuthStateChange(() => {
      void loadAuthState();
    }).data.subscription;
    const handleAuthUpdated = () => void loadAuthState();

    window.addEventListener(SCISIAM_AUTH_EVENT, handleAuthUpdated);
    window.addEventListener("storage", handleAuthUpdated);

    return () => {
      window.removeEventListener(SCISIAM_AUTH_EVENT, handleAuthUpdated);
      window.removeEventListener("storage", handleAuthUpdated);
      authSubscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(() => authState, [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
