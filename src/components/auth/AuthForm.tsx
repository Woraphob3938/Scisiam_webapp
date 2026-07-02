"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldAlert,
  User,
} from "lucide-react";
import {
  cacheRememberedLogin,
  cacheSciSiamAuth,
  getRememberedLogin,
} from "@/lib/supabase/auth-cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthFormProps {
  initialMode: "login" | "register";
  initialNotice?: string;
  initialError?: string;
}

type AuthMode = "login" | "register" | "forgot-password";
type AuthRole = "student" | "teacher";

const isDemoModeEnabled =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true";

const roleOptions: Array<{
  id: AuthRole;
  title: string;
  description: string;
}> = [
  { id: "student", title: "นักเรียน", description: "เริ่มบททดลอง" },
  { id: "teacher", title: "คุณครู", description: "จัดการชั้นเรียน" },
];

export default function AuthForm({
  initialMode,
  initialNotice = "",
  initialError = "",
}: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<AuthRole>("student");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState(initialNotice);
  const [recoverySent, setRecoverySent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const isRegister = mode === "register";
  const isForgotPassword = mode === "forgot-password";
  const isMinLength = password.length >= 8;
  const hasUpperOrNum = /[A-Z]/.test(password) || /[0-9]/.test(password);

  useEffect(() => {
    const resetOAuthLoading = () => setOauthLoading(false);
    window.addEventListener("pageshow", resetOAuthLoading);

    return () => window.removeEventListener("pageshow", resetOAuthLoading);
  }, []);

  useEffect(() => {
    if (initialMode !== "login") return;

    const timer = window.setTimeout(() => {
      const remembered = getRememberedLogin();
      setRememberMe(remembered.rememberMe);
      if (remembered.email) {
        setEmail(remembered.email);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    if (mode === "forgot-password") {
      if (!email.trim()) {
        setError("กรุณากรอกอีเมลที่ใช้สมัครสมาชิก");
        setLoading(false);
        return;
      }

      if (!isSupabaseConfigured()) {
        setError("ยังไม่ได้ตั้งค่า Supabase URL หรือ Publishable Key ใน .env.local");
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const normalizedEmail = email.trim().toLowerCase();
        const redirectTo = `${window.location.origin}/auth/verify`;
        const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          { redirectTo },
        );

        if (recoveryError) {
          setError("ส่งอีเมลรีเซ็ตรหัสผ่านไม่สำเร็จ กรุณารอสักครู่แล้วลองใหม่");
        } else {
          setRecoverySent(true);
        }
      } catch {
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase กรุณาลองใหม่อีกครั้ง");
      }

      setLoading(false);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
      setLoading(false);
      return;
    }

    if (mode === "register") {
      if (!fullName.trim()) {
        setError("กรุณากรอกชื่อ-นามสกุล");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
        setLoading(false);
        return;
      }
      if (!isMinLength || !hasUpperOrNum) {
        setError("รหัสผ่านไม่ตรงตามความปลอดภัยที่กำหนด");
        setLoading(false);
        return;
      }
      if (!acceptTerms) {
        setError("กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว");
        setLoading(false);
        return;
      }
    }

    if (!isSupabaseConfigured()) {
      setError("ยังไม่ได้ตั้งค่า Supabase URL หรือ Publishable Key ใน .env.local");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === "register") {
        const emailRedirectTo = `${window.location.origin}/auth/verify`;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo,
            data: {
              display_name: fullName.trim(),
              requested_role: role,
            },
          },
        });

        if (signUpError) {
          setError(toThaiAuthError(signUpError.message));
          setLoading(false);
          return;
        }

        if (!data.user) {
          setError("สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
          setLoading(false);
          return;
        }

        if (data.session) {
          await ensureProfile({
            userId: data.user.id,
            displayName: fullName.trim(),
          });
          await supabase.auth.signOut();
        }

        setLoading(false);
        router.replace("/login?registered=success");
        router.refresh();
        return;
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (signInError || !data.user) {
          setError(toThaiAuthError(signInError?.message || "Invalid login credentials"));
          setLoading(false);
          return;
        }

        const profile = await ensureProfile({
          userId: data.user.id,
          displayName:
            typeof data.user.user_metadata?.display_name === "string"
              ? data.user.user_metadata.display_name
              : "นักเรียน",
        });

        cacheSciSiamAuth({
          email: normalizedEmail,
          role: profile.role,
          displayName: profile.display_name,
        });
        cacheRememberedLogin(normalizedEmail, rememberMe);
      }

      setLoading(false);
      router.replace("/labs");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  const setAuthMode = (nextMode: AuthMode) => {
    setError("");
    setNotice("");
    setRecoverySent(false);
    setMode(nextMode);
  };

  const handleGoogleAuth = async () => {
    setError("");
    setNotice("");

    if (!isSupabaseConfigured()) {
      setError("ยังไม่ได้ตั้งค่า Supabase URL หรือ Publishable Key ใน .env.local");
      return;
    }

    setOauthLoading(true);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/oauth-callback?next=/profile`,
          queryParams: { prompt: "select_account" },
        },
      });

      if (oauthError) {
        setError("เชื่อมต่อบัญชี Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        setOauthLoading(false);
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ Google กรุณาลองใหม่อีกครั้ง");
      setOauthLoading(false);
    }
  };

  const handleDemoTeacherLogin = () => {
    if (!isDemoModeEnabled) return;

    localStorage.setItem("scisiam_demo_mode", "true");
    cacheSciSiamAuth({
      role: "teacher",
      displayName: "ครูอรทัย",
      email: "teacher.demo@scisiam.com",
    });
    router.push("/profile");
    router.refresh();
  };

  return (
    <section
      className="flex min-h-[calc(100svh-24px)] w-full items-center justify-center px-4 py-5 sm:px-6 lg:min-h-[calc(100svh-32px)] lg:px-10 lg:py-8"
      aria-label={
        isForgotPassword
          ? "หน้ากู้คืนรหัสผ่าน SciSiam"
          : isRegister
            ? "หน้าสมัครสมาชิก SciSiam"
            : "หน้าเข้าสู่ระบบ SciSiam"
      }
    >
      <div className="flex w-full min-w-0 items-center justify-center">
        <div className="grid w-full max-w-[560px] gap-4">
          <form
            onSubmit={handleSubmit}
            className="w-full rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 backdrop-blur sm:p-6 lg:p-7"
          >
            <div className={`grid ${isRegister ? "gap-4" : "gap-5"}`}>
            {!isForgotPassword && <div className="grid grid-cols-2 gap-1 rounded-[14px] border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                aria-pressed={!isRegister}
                className={`min-h-11 rounded-[10px] text-sm font-extrabold leading-[1.45] transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${
                  !isRegister
                    ? "bg-white text-slate-950 shadow-md shadow-slate-200/70"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                aria-pressed={isRegister}
                className={`min-h-11 rounded-[10px] text-sm font-extrabold leading-[1.45] transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${
                  isRegister
                    ? "bg-white text-slate-950 shadow-md shadow-slate-200/70"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                สมัครสมาชิก
              </button>
            </div>}

            <div className="grid gap-2">
              <h1 className="text-2xl font-extrabold leading-[1.3] tracking-normal text-slate-950 sm:text-3xl">
                {isForgotPassword ? "ลืมรหัสผ่าน" : isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
              </h1>
              <p className="text-sm font-semibold leading-relaxed text-slate-500">
                {isForgotPassword
                  ? "กรอกอีเมลที่ใช้สมัครสมาชิก แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่"
                  : isRegister
                  ? "สร้างบัญชีเพื่อเรียน ทดลอง และติดตามความคืบหน้าใน SciSiam"
                  : "ใช้บัญชี SciSiam เพื่อเข้าเรียนหรือจัดการห้องเรียนวิทยาศาสตร์ของคุณ"}
              </p>
            </div>

            {notice && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-xs font-bold leading-relaxed text-emerald-700" role="status">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            {recoverySent && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-xs font-bold leading-relaxed text-emerald-700" role="status">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <span>หากอีเมลนี้มีบัญชี เราได้ส่งลิงก์รีเซ็ตรหัสผ่านให้แล้ว กรุณาตรวจสอบกล่องจดหมายและโฟลเดอร์สแปม</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-3 text-xs font-bold leading-relaxed text-rose-700" role="alert">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className={`grid ${isRegister ? "gap-3" : "gap-3.5"}`}>
              {isRegister && (
                <AuthField
                  id="auth-full-name"
                  label="ชื่อ-นามสกุล"
                  helper=""
                  icon={User}
                >
                  <input
                    id="auth-full-name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="เช่น พิมพ์ชนก ใจดี"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClassName}
                  />
                </AuthField>
              )}

              <AuthField
                id="auth-email"
                label="อีเมล"
                helper=""
                icon={Mail}
              >
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@school.ac.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName}
                />
              </AuthField>

              {!isForgotPassword && <AuthField
                id="auth-password"
                label="รหัสผ่าน"
                helper=""
                icon={Lock}
                action={
                  !isRegister ? (
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot-password")}
                      className="min-h-8 text-xs font-extrabold leading-[1.45] text-slate-500 transition-colors hover:text-blue-600 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  ) : null
                }
              >
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    placeholder={isRegister ? "ตั้งรหัสผ่าน" : "กรอกรหัสผ่าน"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClassName} pr-14`}
                  />
                  <PasswordToggle
                    isVisible={showPassword}
                    onToggle={() => setShowPassword((current) => !current)}
                    label="รหัสผ่าน"
                  />
                </div>
              </AuthField>}

              {isRegister && (
                <>
                  <AuthField
                    id="auth-confirm-password"
                    label="ยืนยันรหัสผ่าน"
                    helper=""
                    icon={Lock}
                  >
                    <div className="relative">
                      <input
                        id="auth-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="กรอกรหัสผ่านอีกครั้ง"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClassName} pr-14`}
                      />
                      <PasswordToggle
                        isVisible={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword((current) => !current)}
                        label="ยืนยันรหัสผ่าน"
                      />
                    </div>
                  </AuthField>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <ValidationItem valid={isMinLength} label="อย่างน้อย 8 ตัวอักษร" />
                    <ValidationItem valid={hasUpperOrNum} label="มีตัวพิมพ์ใหญ่/ตัวเลข" />
                  </div>
                </>
              )}

              {!isForgotPassword && <div className="grid gap-2">
                <span className="text-sm font-extrabold leading-[1.45] text-slate-900">
                  บทบาท
                </span>
                <div className="grid grid-cols-2 gap-3" role="group" aria-label="เลือกบทบาท">
                  {roleOptions.map((option) => {
                    const isSelected = role === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setRole(option.id)}
                        aria-pressed={isSelected}
                      className={`min-h-11 rounded-[14px] border px-3 py-2.5 text-left transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 sm:min-h-12 ${
                          isSelected
                            ? "border-slate-900 bg-slate-50 text-slate-950 shadow-[0_0_0_3px_rgba(15,23,42,0.06)]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40"
                        }`}
                      >
                        <span className="block text-sm font-extrabold leading-[1.45]">
                          {option.title}
                        </span>
                        <span className="hidden text-xs font-semibold leading-relaxed text-slate-500 sm:block">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>}

              {!isRegister && !isForgotPassword && (
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold leading-[1.45] text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  จำฉันไว้
                </label>
              )}

              {isRegister && (
                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-xs font-semibold leading-relaxed text-slate-500">
                  <input
                    type="checkbox"
                    required
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>ฉันยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว</span>
                </label>
              )}
            </div>

            <div className="grid gap-3">
              <button
                type="submit"
                disabled={loading || oauthLoading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-extrabold leading-[1.45] text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              >
                {loading ? (
                  <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>
                      {isForgotPassword
                        ? recoverySent
                          ? "ส่งอีเมลอีกครั้ง"
                          : "ส่งลิงก์รีเซ็ตรหัสผ่าน"
                        : isRegister
                          ? "สร้างบัญชี SciSiam"
                          : "เข้าสู่ระบบ SciSiam"}
                    </span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </>
                )}
              </button>

              {!isForgotPassword && (
                <>
                  <div className="flex items-center gap-3" aria-hidden="true">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-bold text-slate-400">หรือ</span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading || oauthLoading}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold leading-[1.45] text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                  >
                    {oauthLoading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                    ) : (
                      <GoogleLogo />
                    )}
                    <span>
                      {isRegister ? "สมัครด้วย Google" : "เข้าสู่ระบบด้วย Google"}
                    </span>
                  </button>
                </>
              )}

              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="mx-auto min-h-10 px-3 text-sm font-extrabold text-blue-600 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                >
                  กลับไปเข้าสู่ระบบ
                </button>
              ) : (
                <p className="text-center text-sm font-semibold leading-relaxed text-slate-500">
                  {isRegister ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode(isRegister ? "login" : "register")}
                    className="font-extrabold text-blue-600 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                  >
                    {isRegister ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                  </button>
                </p>
              )}

              {isDemoModeEnabled && !isForgotPassword ? (
                isRegister ? (
                  <button
                    type="button"
                    onClick={handleDemoTeacherLogin}
                    className="mx-auto inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-extrabold leading-[1.45] text-slate-500 transition-colors hover:text-blue-600 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                  >
                    <span>ทดลองในบทบาทคุณครู</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="h-px flex-1 bg-slate-100" />
                      <span className="text-[11px] font-bold leading-[1.45] text-slate-400">
                        สำหรับทดลองใช้งาน
                      </span>
                      <span className="h-px flex-1 bg-slate-100" />
                    </div>

                    <button
                      type="button"
                      onClick={handleDemoTeacherLogin}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-extrabold leading-[1.45] text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                    >
                      <span>เข้าใช้งานในบทบาทคุณครู</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  </>
                )
              ) : null}
            </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

const inputClassName =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold leading-[1.45] text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function AuthField({
  id,
  label,
  helper,
  icon: Icon,
  action,
  children,
}: {
  id: string;
  label: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="inline-flex items-center gap-2 text-sm font-extrabold leading-[1.45] text-slate-900">
          <Icon className="h-4 w-4 text-slate-400" />
          {label}
        </label>
        {action}
      </div>
      {children}
      {helper && (
        <p className="text-xs font-semibold leading-relaxed text-slate-400">
          {helper}
        </p>
      )}
    </div>
  );
}

function PasswordToggle({
  isVisible,
  onToggle,
  label,
}: {
  isVisible: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
      aria-label={`${isVisible ? "ซ่อน" : "แสดง"}${label}`}
      aria-pressed={isVisible}
    >
      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

function ValidationItem({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
          valid
            ? "border-emerald-500 bg-emerald-50 text-emerald-600"
            : "border-slate-200 bg-white text-transparent"
        }`}
      >
        <Check className="h-3 w-3 stroke-[3]" />
      </span>
      <span
        className={`text-xs font-bold leading-[1.45] ${
          valid ? "text-emerald-700" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
    >
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.12-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
    </svg>
  );
}

function toThaiAuthError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }

  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "อีเมลนี้ถูกสมัครไว้แล้ว กรุณาเข้าสู่ระบบแทน";
  }

  if (lower.includes("email not confirmed")) {
    return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
  }

  if (lower.includes("password")) {
    return "รหัสผ่านไม่ผ่านเงื่อนไขของระบบ กรุณาตรวจสอบอีกครั้ง";
  }

  return "เชื่อมต่อระบบบัญชีไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
}

async function ensureProfile(input: {
  userId: string;
  displayName: string;
}) {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", input.userId)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const fallbackProfile = {
    display_name: input.displayName,
    role: "student" as const,
  };

  return fallbackProfile;
}
