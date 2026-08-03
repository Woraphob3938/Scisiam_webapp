"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Camera,
  CalendarDays,
  CheckCircle2,
  FlaskConical,
  History,
  LayoutDashboard,
  Loader2,
  Pencil,
  Save,
  School,
  Trash2,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import LearningHistoryPage from "@/components/history/LearningHistoryPage";
import { useSidebar } from "@/context/SidebarContext";
import {
  loadSupabaseLearningSnapshot,
  readLocalLearningSnapshot,
  type LearningRunSnapshot,
} from "@/lib/supabase/learning-snapshot";
import {
  cacheScisiamAuth,
  SCISIAM_AUTH_AVATAR_VERSION_KEY,
  SCISIAM_AUTH_EVENT,
} from "@/lib/supabase/auth-cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { createProfileAvatarPath, getProfileAvatarSrc } from "@/lib/supabase/profile-avatar";
import { readyLabCount } from "@/data/labReadiness";
import { labsById } from "@/data/labs";

type ProfileTab = "overview" | "history";

const AUTH_CHECK_TIMEOUT_MS = 6_000;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const isDemoModeEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true";

const categoryLabels = {
  Physics: "ฟิสิกส์",
  Chemistry: "เคมี",
  Biology: "ชีววิทยา",
  Mathematics: "คณิตศาสตร์",
  Foundation: "ความรู้พื้นฐาน",
} as const;

function formatActivityDate(value?: string) {
  if (!value) return "ยังไม่มีกิจกรรม";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("อ่านไฟล์รูปไม่สำเร็จ"));
    reader.readAsDataURL(file);
  });
}

async function hasAuthenticatedSupabaseUser() {
  const supabase = createClient();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<false>((resolve) => {
    timeoutId = setTimeout(() => resolve(false), AUTH_CHECK_TIMEOUT_MS);
  });
  const authCheck = Promise.resolve(supabase.auth.getUser())
    .then(({ data }) => Boolean(data.user))
    .catch(() => false);

  try {
    return await Promise.race([authCheck, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export default function ProfilePage() {
  const { isCollapsed } = useSidebar();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("นักเรียน");
  const [draftName, setDraftName] = useState("นักเรียน");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState<string | number>(0);
  const [draftAvatarFile, setDraftAvatarFile] = useState<File | null>(null);
  const [draftAvatarPreview, setDraftAvatarPreview] = useState<string | null>(null);
  const [draftAvatarRemoved, setDraftAvatarRemoved] = useState(false);
  const [profileBusy, setProfileBusy] = useState<"profile" | null>(null);
  const [profileNotice, setProfileNotice] = useState<{ text: string; error: boolean } | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [activeStudentTab, setActiveStudentTab] = useState<ProfileTab>(() => {
    if (typeof window === "undefined") return "overview";
    const queryTab = new URLSearchParams(window.location.search).get("tab");
    return queryTab === "history" ? queryTab : "overview";
  });
  const [completedCount, setCompletedCount] = useState(0);
  const [recentRuns, setRecentRuns] = useState<LearningRunSnapshot[]>([]);

  useEffect(() => {
    let cancelled = false;

    const applySnapshot = (snapshot: ReturnType<typeof readLocalLearningSnapshot>) => {
      if (cancelled) return;
      setCompletedCount(snapshot.completedCount);
      setRecentRuns(snapshot.recentRuns);
      if (snapshot.profile) {
        setRole(snapshot.profile.role);
        setUsername(snapshot.profile.displayName);
        setDraftName(snapshot.profile.displayName);
        setAvatarPath(snapshot.profile.avatarUrl);
        setAvatarVersion(snapshot.profile.updatedAt ?? Date.now());
      }
    };

    const loadProfile = async () => {
      const isDemo = isDemoModeEnabled && localStorage.getItem("scisiam_demo_mode") === "true";
      const trustLocalIdentity = isDemo || !isSupabaseConfigured();
      const storedRole = localStorage.getItem("scisiam_user_role") || "student";
      const storedName = localStorage.getItem("scisiam_user_name") || "นักเรียน";
      const storedAvatar = localStorage.getItem("scisiam_user_avatar");
      let loggedIn = false;

      if (isDemo) {
        loggedIn = true;
      } else if (isSupabaseConfigured()) {
        loggedIn = await hasAuthenticatedSupabaseUser();
      } else {
        loggedIn = localStorage.getItem("scisiam_logged_in") === "true";
      }

      if (cancelled) return;
      setIsLoggedIn(loggedIn);

      if (!loggedIn) {
        setCompletedCount(0);
        setRecentRuns([]);
        setCheckingAuth(false);
        return;
      }

      if (trustLocalIdentity) {
        setRole(storedRole);
        setUsername(storedName);
        setDraftName(storedName);
        setAvatarPath(storedAvatar);
        setAvatarVersion(localStorage.getItem(SCISIAM_AUTH_AVATAR_VERSION_KEY) || Date.now());
        if (storedRole !== "teacher") {
          applySnapshot(readLocalLearningSnapshot());
        }
      }

      if (!isDemo) {
        try {
          const cloudSnapshot = await loadSupabaseLearningSnapshot();
          if (cloudSnapshot) applySnapshot(cloudSnapshot);
        } catch (error) {
          console.error("Failed to load Supabase profile progress", error);
        }
      }

      if (!cancelled) setCheckingAuth(false);
    };

    void loadProfile();
    window.addEventListener(SCISIAM_AUTH_EVENT, loadProfile);
    window.addEventListener("storage", loadProfile);

    return () => {
      cancelled = true;
      window.removeEventListener(SCISIAM_AUTH_EVENT, loadProfile);
      window.removeEventListener("storage", loadProfile);
    };
  }, []);

  const selectTab = (tab: ProfileTab) => {
    setActiveStudentTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url);
  };

  const usesLocalProfile = () =>
    !isSupabaseConfigured() ||
    (isDemoModeEnabled && localStorage.getItem("scisiam_demo_mode") === "true");

  const handleStartEditProfile = () => {
    setDraftName(username);
    setDraftAvatarFile(null);
    setDraftAvatarPreview(null);
    setDraftAvatarRemoved(false);
    setProfileNotice(null);
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setDraftName(username);
    setDraftAvatarFile(null);
    setDraftAvatarPreview(null);
    setDraftAvatarRemoved(false);
    setProfileNotice(null);
    setIsEditingProfile(false);
  };

  const selectAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!AVATAR_TYPES.has(file.type) || file.size > MAX_AVATAR_BYTES) {
      setProfileNotice({ text: "รองรับ JPG, PNG หรือ WebP ขนาดไม่เกิน 2 MB", error: true });
      return;
    }

    try {
      setDraftAvatarFile(file);
      setDraftAvatarPreview(await readFileAsDataUrl(file));
      setDraftAvatarRemoved(false);
      setProfileNotice(null);
    } catch (error) {
      console.error("Failed to preview profile avatar", error);
      setProfileNotice({ text: "อ่านไฟล์รูปไม่สำเร็จ กรุณาลองอีกครั้ง", error: true });
    }
  };

  const removeDraftAvatar = () => {
    setDraftAvatarFile(null);
    setDraftAvatarPreview(null);
    setDraftAvatarRemoved(true);
    setProfileNotice(null);
  };

  const saveProfile = async () => {
    const nextName = draftName.trim();
    if (!nextName || nextName.length > 80) {
      setProfileNotice({ text: "ชื่อต้องมีความยาว 1-80 ตัวอักษร", error: true });
      return;
    }

    setProfileBusy("profile");
    setProfileNotice(null);
    try {
      let nextAvatarPath = draftAvatarRemoved ? null : avatarPath;
      const nextAvatarVersion = Date.now();

      if (!usesLocalProfile()) {
        const supabase = createClient();
        if (draftAvatarFile) {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError || !user) throw userError || new Error("Authentication required");

          nextAvatarPath = createProfileAvatarPath(user.id, draftAvatarFile.type);
          const { error: uploadError } = await supabase.storage.from("profile-avatars").upload(nextAvatarPath, draftAvatarFile, {
            contentType: draftAvatarFile.type,
            cacheControl: "31536000",
          });
          if (uploadError) throw uploadError;
        }

        const { error } = await supabase.rpc("update_own_profile", {
          p_display_name: nextName,
          p_avatar_url: draftAvatarFile ? nextAvatarPath : null,
        });
        if (error) throw error;

        if (
          draftAvatarFile &&
          avatarPath &&
          nextAvatarPath !== avatarPath &&
          !avatarPath.startsWith("data:") &&
          !avatarPath.startsWith("http")
        ) {
          const { error: removePreviousFileError } = await supabase.storage.from("profile-avatars").remove([avatarPath]);
          if (removePreviousFileError) {
            console.error("Failed to remove previous profile avatar file", removePreviousFileError);
          }
        }

        if (draftAvatarRemoved) {
          const { error: removeProfileError } = await supabase.rpc("remove_own_profile_avatar");
          if (removeProfileError) throw removeProfileError;

          if (avatarPath && !avatarPath.startsWith("data:") && !avatarPath.startsWith("http")) {
            const { error: removeFileError } = await supabase.storage.from("profile-avatars").remove([avatarPath]);
            if (removeFileError) {
              console.error("Failed to remove old profile avatar file", removeFileError);
            }
          }
        }
      } else {
        nextAvatarPath = draftAvatarRemoved ? null : draftAvatarPreview ?? avatarPath;
      }

      setUsername(nextName);
      setDraftName(nextName);
      setAvatarPath(nextAvatarPath);
      setAvatarVersion(nextAvatarVersion);
      setDraftAvatarFile(null);
      setDraftAvatarPreview(null);
      setDraftAvatarRemoved(false);
      setIsEditingProfile(false);
      cacheScisiamAuth({
        role: role === "teacher" ? "teacher" : "student",
        displayName: nextName,
        avatarUrl: nextAvatarPath,
        avatarVersion: nextAvatarVersion,
      });
      setProfileNotice({ text: draftAvatarRemoved ? "นำรูปโปรไฟล์ออกแล้ว" : "บันทึกโปรไฟล์แล้ว", error: false });
    } catch (error) {
      console.error("Failed to update profile", error);
      setProfileNotice({ text: "บันทึกโปรไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง", error: true });
    } finally {
      setProfileBusy(null);
    }
  };

  const avatarSrc = useMemo(() => getProfileAvatarSrc(avatarPath, avatarVersion), [avatarPath, avatarVersion]);
  const visibleAvatarSrc = draftAvatarRemoved ? null : draftAvatarPreview ?? (avatarPath ? avatarSrc : null);
  const canRemoveAvatar = !draftAvatarRemoved && Boolean(draftAvatarPreview || avatarPath);
  const latestRun = recentRuns[0];
  const progressPercent = Math.min(
    100,
    Math.round((completedCount / Math.max(readyLabCount, 1)) * 100),
  );
  const mostExploredCategory = useMemo(() => {
    const categoryCounts = new Map<string, number>();

    recentRuns.forEach((run) => {
      const category = labsById[run.labId]?.category;
      if (!category) return;
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    });

    const mostFrequent = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return mostFrequent && mostFrequent in categoryLabels
      ? categoryLabels[mostFrequent as keyof typeof categoryLabels]
      : "ยังไม่มีข้อมูล";
  }, [recentRuns]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans lg:pb-10">
      <Navbar />
      <div className="hidden lg:block">
        <Sidebar activeMenu="โปรไฟล์" />
      </div>

      <main
        className={`min-w-0 transition-[padding-left] duration-300 ${
          isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"
        }`}
      >
        {checkingAuth ? (
          <div className="mx-auto grid min-h-[60vh] max-w-6xl place-items-center px-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" aria-label="กำลังโหลดโปรไฟล์" />
          </div>
        ) : !isLoggedIn ? (
          <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
              <UserCircle className="h-8 w-8" />
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-[1.35] text-slate-950">เข้าสู่ระบบเพื่อดูโปรไฟล์การเรียนรู้</h1>
            <p className="mt-3 max-w-xl text-sm font-semibold leading-relaxed text-slate-500">
              ประวัติการทดลองของคุณจะถูกรวมไว้ในพื้นที่เดียว
            </p>
            <Link href="/login" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-blue-500/15 hover:bg-blue-700">
              เข้าสู่ระบบ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        ) : (
          <>
            <section className="px-4 pb-3 pt-5 sm:px-8 sm:pt-7 lg:px-10">
              <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-blue-100 bg-[radial-gradient(circle_at_top_right,_rgba(191,219,254,0.8),_transparent_34%),linear-gradient(135deg,#ffffff_0%,#eff6ff_100%)] shadow-sm shadow-slate-200/50">
                <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4 sm:items-center sm:gap-5">
                    <div className="grid shrink-0 justify-items-center gap-2">
                      <div className="relative h-[84px] w-[84px] sm:h-24 sm:w-24">
                        <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-2xl border-4 border-white bg-blue-50 text-blue-400 shadow-lg shadow-blue-200/50">
                          {visibleAvatarSrc ? (
                            <Image
                              src={visibleAvatarSrc}
                              alt={`รูปโปรไฟล์ของ ${username}`}
                              fill
                              sizes="96px"
                              className="object-cover"
                              priority
                              unoptimized
                            />
                          ) : (
                            <UserCircle className="h-11 w-11" aria-hidden="true" />
                          )}
                          {!visibleAvatarSrc ? <span className="sr-only">ยังไม่มีรูปโปรไฟล์</span> : null}
                        </div>
                        {isEditingProfile ? (
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={profileBusy !== null}
                            className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-xl border-2 border-white bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                            aria-label="เปลี่ยนรูปโปรไฟล์"
                          >
                            <Camera className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                      {isEditingProfile && canRemoveAvatar ? (
                        <button
                          type="button"
                          onClick={removeDraftAvatar}
                          disabled={profileBusy !== null}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-rose-300 focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-100"
                          aria-label="ลบรูปโปรไฟล์"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          ลบรูป
                        </button>
                      ) : null}
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={selectAvatar}
                        className="sr-only"
                        aria-label="เลือกรูปโปรไฟล์"
                      />
                    </div>

                    <div className="min-w-0">
                      <span className="inline-flex min-h-7 items-center rounded-full border border-blue-100 bg-white/80 px-2.5 text-xs font-bold text-blue-700">
                        {role === "teacher" ? "บัญชีคุณครู" : "บัญชีนักเรียน"}
                      </span>
                      {isEditingProfile ? (
                        <div className="mt-2 grid gap-2 sm:flex sm:flex-wrap sm:items-center">
                          <input
                            value={draftName}
                            onChange={(event) => setDraftName(event.target.value)}
                            maxLength={80}
                            className="min-h-11 min-w-0 rounded-xl border border-blue-200 bg-white px-3 text-lg font-extrabold text-slate-900 outline-none focus:ring-3 focus:ring-blue-100"
                            aria-label="ชื่อที่แสดง"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => void saveProfile()}
                              disabled={profileBusy !== null}
                              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-sm font-extrabold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                              {profileBusy === "profile" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              ยืนยัน
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditProfile}
                              disabled={profileBusy !== null}
                              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <X className="h-4 w-4" />
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                          <h1 className="break-words text-2xl font-extrabold leading-[1.35] text-slate-950 sm:text-3xl">{username}</h1>
                          <button
                            type="button"
                            onClick={handleStartEditProfile}
                            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-blue-100 bg-white/80 px-3 text-xs font-extrabold text-blue-700 transition-colors hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                            แก้ไขโปรไฟล์
                          </button>
                        </div>
                      )}
                      <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-slate-500">
                        {role === "teacher"
                          ? "ข้อมูลบัญชีส่วนตัว พร้อมทางลัดสำหรับจัดการห้องเรียนและติดตามงานของนักเรียน"
                          : "ดูภาพรวมการทดลองล่าสุดและกลับมาเรียนรู้ต่อจากจุดเดิมได้ง่ายขึ้น"}
                      </p>
                      {profileNotice ? (
                        <p className={`mt-2 text-xs font-bold ${profileNotice.error ? "text-rose-600" : "text-emerald-600"}`} role="status">
                          {profileNotice.text}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:flex lg:shrink-0">
                    {role === "teacher" ? (
                      <Link
                        href="/dashboard"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-md shadow-blue-500/15 transition-colors hover:bg-blue-700"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        แดชบอร์ดครู
                      </Link>
                    ) : (
                      <Link
                        href="/labs"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-md shadow-blue-500/15 transition-colors hover:bg-blue-700"
                      >
                        <FlaskConical className="h-4 w-4" />
                        เลือกห้องแล็บ
                      </Link>
                    )}
                    <Link
                      href={role === "teacher" ? "/classrooms" : "/labs"}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                    >
                      {role === "teacher" ? <Users className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                      {role === "teacher" ? "ชั้นเรียน" : "ห้องแล็บ"}
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <div className="px-4 py-3 sm:px-8 lg:px-10">
              <div className="mx-auto grid max-w-7xl grid-cols-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm" role="tablist" aria-label="ส่วนต่าง ๆ ของโปรไฟล์">
                {([
                  { id: "overview", label: role === "teacher" ? "ภาพรวมของฉัน" : "ภาพรวมความก้าวหน้า", icon: BarChart3 },
                  { id: "history", label: "ประวัติการเรียนรู้", icon: History },
                ] as const).map((tab) => {
                  const Icon = tab.icon;
                  const active = activeStudentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => selectTab(tab.id)}
                      className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2 text-sm font-extrabold transition-all duration-200 sm:px-4 ${
                        active
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeStudentTab === "overview" ? (
              <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-8 pt-2 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10">
                <div className="grid gap-5 self-start">
                  {role === "teacher" ? (
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 sm:p-6">
                      <div className="flex items-start gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                          <School className="h-5 w-5" />
                        </span>
                        <div>
                          <h2 className="text-lg font-extrabold leading-[1.4] text-slate-950">พื้นที่ทำงานของคุณครู</h2>
                          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                            จัดการชั้นเรียน ตรวจงาน และดูภาพรวมการส่งงานได้จากแดชบอร์ดครู
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <ProfileShortcut
                          href="/dashboard"
                          icon={LayoutDashboard}
                          title="เปิดแดชบอร์ดครู"
                          detail="ติดตามห้องเรียนและงานที่รอตรวจ"
                        />
                        <ProfileShortcut
                          href="/classrooms"
                          icon={Users}
                          title="จัดการชั้นเรียน"
                          detail="สร้างห้อง เชิญสมาชิก และมอบหมายแล็บ"
                        />
                      </div>
                    </section>
                  ) : null}

                  <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                      <h2 className="text-lg font-extrabold leading-[1.4] text-slate-950">
                        {role === "teacher" ? "กิจกรรมการทดลองส่วนตัว" : "ภาพรวมการเรียนของคุณ"}
                      </h2>
                      <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                        ใช้ข้อมูลจากผลการทดลองที่บันทึกไว้ในบัญชีนี้
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-3">
                      <ProfileMetric
                        icon={FlaskConical}
                        label="แล็บที่บันทึกแล้ว"
                        value={`${completedCount}`}
                        detail={`จาก ${readyLabCount} แล็บ`}
                        tone="blue"
                      />
                      <ProfileMetric
                        icon={CalendarDays}
                        label="ทำกิจกรรมล่าสุด"
                        value={latestRun ? formatActivityDate(latestRun.createdAt) : "ยังไม่มี"}
                        detail={latestRun?.title ?? "เริ่มจากแล็บที่สนใจ"}
                        tone="emerald"
                      />
                      <ProfileMetric
                        icon={BookOpen}
                        label="หมวดที่ทดลองบ่อย"
                        value={mostExploredCategory}
                        detail={recentRuns.length > 0 ? `อ้างอิงจาก ${recentRuns.length} กิจกรรมล่าสุด` : "ยังไม่มีข้อมูลเพียงพอ"}
                        tone="amber"
                      />
                    </div>
                    <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-extrabold text-slate-700">ความคืบหน้าจากแล็บพร้อมทดลอง</span>
                        <span className="font-extrabold text-blue-600">{progressPercent}%</span>
                      </div>
                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-[width] duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </section>
                </div>

                <section className="self-start rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-blue-600">กิจกรรมล่าสุด</p>
                      <h2 className="mt-1 text-lg font-extrabold leading-[1.4] text-slate-950">กลับไปทดลองต่อ</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectTab("history")}
                      className="inline-flex min-h-10 shrink-0 items-center rounded-xl bg-blue-600 px-4 text-xs font-extrabold text-white transition-colors hover:bg-blue-700"
                    >ดูทั้งหมด</button>
                  </div>

                  <div className="mt-4 divide-y divide-slate-100">
                    {recentRuns.length === 0 ? (
                      <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
                        <FlaskConical className="mx-auto h-6 w-6 text-slate-400" />
                        <p className="mt-3 text-sm font-extrabold text-slate-700">ยังไม่มีผลการทดลองที่บันทึก</p>
                        <Link href="/labs" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-extrabold text-white hover:bg-blue-700">
                          เลือกห้องแล็บ
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    ) : recentRuns.slice(0, 4).map((run) => (
                      <Link
                        key={run.id}
                        href={`/labs/${run.labId}/simulation`}
                        className="group flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                          <FlaskConical className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-extrabold text-slate-800 group-hover:text-blue-700">{run.title}</p>
                          <p className="mt-1 truncate text-xs font-semibold text-slate-400">{formatActivityDate(run.createdAt)}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                      </Link>
                    ))}
                  </div>
                </section>
              </section>
            ) : (
              <LearningHistoryPage embedded />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function ProfileMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "emerald" | "amber";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  }[tone];

  return (
    <div className="border-b border-slate-100 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:p-6">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-xs font-extrabold text-slate-400">{label}</p>
      <p className="mt-1 line-clamp-2 text-lg font-extrabold leading-[1.35] text-slate-950">{value}</p>
      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-relaxed text-slate-500">{detail}</p>
    </div>
  );
}

function ProfileShortcut({
  href,
  icon: Icon,
  title,
  detail,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-24 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold leading-[1.4] text-slate-800 group-hover:text-blue-700">{title}</span>
        <span className="mt-1 block text-xs font-semibold leading-relaxed text-slate-500">{detail}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-600" />
    </Link>
  );
}
