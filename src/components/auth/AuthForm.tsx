"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Atom,
  Beaker,
  Check,
  Compass,
  Eye,
  EyeOff,
  FlaskConical,
  Leaf,
  Lock,
  Mail,
  ShieldAlert,
  User,
} from "lucide-react";
import { cacheSciSiamAuth } from "@/lib/supabase/auth-cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthFormProps {
  initialMode: "login" | "register";
}

type AuthMode = "login" | "register";
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

const subjectBooks = [
  {
    title: "ฟิสิกส์",
    label: "วิชา 01",
    tone: "border-t-blue-500 bg-blue-50/70 text-blue-700",
    icon: Atom,
  },
  {
    title: "เคมี",
    label: "วิชา 02",
    tone: "border-t-purple-500 bg-purple-50/70 text-purple-700",
    icon: Beaker,
  },
  {
    title: "ชีววิทยา",
    label: "วิชา 03",
    tone: "border-t-emerald-500 bg-emerald-50/70 text-emerald-700",
    icon: Leaf,
  },
];

export default function AuthForm({ initialMode }: AuthFormProps) {
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";
  const isMinLength = password.length >= 8;
  const hasUpperOrNum = /[A-Z]/.test(password) || /[0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
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

        if (!data.session) {
          setError("สมัครสำเร็จแล้ว กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
          setLoading(false);
          return;
        }

        const profile = await ensureProfile({
          userId: data.user.id,
          displayName: fullName.trim(),
        });

        cacheSciSiamAuth({
          email: normalizedEmail,
          role: profile.role,
          displayName: fullName.trim(),
          totalPoints: 0,
        });
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
          totalPoints: profile.total_points,
        });
      }

      setLoading(false);
      router.push("/");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  const setAuthMode = (nextMode: AuthMode) => {
    setError("");
    setMode(nextMode);
  };

  const handleDemoTeacherLogin = () => {
    if (!isDemoModeEnabled) return;

    localStorage.setItem("scisiam_demo_mode", "true");
    cacheSciSiamAuth({
      role: "teacher",
      displayName: "ครูอรทัย",
      email: "teacher.demo@scisiam.com",
      totalPoints: 0,
    });
    router.push("/profile");
    router.refresh();
  };

  return (
    <section
      className="mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-5 px-4 py-5 sm:px-6 lg:min-h-[660px] lg:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)] lg:items-stretch lg:gap-10 lg:px-8 lg:py-4"
      aria-label={isRegister ? "หน้าสมัครสมาชิก SciSiam" : "หน้าเข้าสู่ระบบ SciSiam"}
    >
      <ScienceIntro mode={mode} />

      <div className="flex min-w-0 items-center justify-center">
        <div className="grid w-full max-w-[500px] gap-4">
          <MobileIntro mode={mode} />

          <form
            onSubmit={handleSubmit}
            className="w-full rounded-[24px] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 sm:p-6 lg:p-7"
          >
            <div className={`grid ${isRegister ? "gap-4" : "gap-5"}`}>
            <div className="grid grid-cols-2 gap-1 rounded-[14px] border border-slate-200 bg-slate-50 p-1">
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
            </div>

            <div className="grid gap-2">
              <h1 className="text-2xl font-extrabold leading-[1.3] tracking-normal text-slate-950 sm:text-3xl">
                {isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
              </h1>
              <p className="text-sm font-semibold leading-relaxed text-slate-500">
                {isRegister
                  ? "สร้างบัญชีเพื่อเรียน ทดลอง และติดตามความคืบหน้าใน SciSiam"
                  : "ใช้บัญชี SciSiam เพื่อเข้าเรียนหรือจัดการห้องเรียนวิทยาศาสตร์ของคุณ"}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-3 text-xs font-bold leading-relaxed text-rose-700">
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

              <AuthField
                id="auth-password"
                label="รหัสผ่าน"
                helper=""
                icon={Lock}
                action={
                  !isRegister ? (
                    <button
                      type="button"
                      onClick={() => setError("ระบบกู้คืนรหัสผ่านจะเปิดให้ใช้งานในเวอร์ชันถัดไป")}
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
              </AuthField>

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

              <div className="grid gap-2">
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
              </div>

              {!isRegister && (
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
                disabled={loading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-extrabold leading-[1.45] text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              >
                {loading ? (
                  <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>{isRegister ? "สร้างบัญชี SciSiam" : "เข้าสู่ระบบ SciSiam"}</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </>
                )}
              </button>

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

              {isDemoModeEnabled ? (
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

function ScienceIntro({ mode }: { mode: AuthMode }) {
  const isRegister = mode === "register";

  return (
    <aside className="hidden min-w-0 content-start gap-5 rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-sm shadow-slate-200/50 sm:p-7 lg:grid lg:content-between lg:p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <Compass className="h-5.5 w-5.5" />
        </span>
        <span className="grid gap-0.5">
          <strong className="text-lg font-extrabold leading-[1.1] text-blue-600">
            SciSiam
          </strong>
        </span>
      </div>

      <div className="grid gap-4">
        <p className="text-xs font-bold leading-[1.45] tracking-normal text-slate-400">
          {isRegister ? "สร้างบัญชีสำหรับชั้นเรียนวิทย์" : "SciSiam สำหรับการทดลองวิทยาศาสตร์"}
        </p>
        <h2 className="max-w-2xl text-3xl font-extrabold leading-[1.25] tracking-normal text-slate-950 sm:text-4xl lg:text-[42px]">
          {isRegister
            ? "สร้างบัญชี SciSiam เพื่อเรียนและจัดการห้องแล็บ"
            : "เข้าสู่ SciSiam แล้วเริ่มทดลองได้ทันที"}
        </h2>
        <p className="max-w-xl text-sm font-semibold leading-[1.75] text-slate-500 sm:text-base">
          {isRegister
            ? "เลือกบทบาทนักเรียนหรือคุณครู เพื่อใช้แล็บ บันทึกความคืบหน้า และดูภาพรวมการเรียนรู้ให้ตรงกับการใช้งานของคุณ"
            : "ค้นหาแล็บ ทดลอง บันทึกผล และให้ AI ไออุ่นช่วยอธิบายแนวคิดวิทยาศาสตร์ในที่เดียว"}
        </p>
      </div>

      <div className="grid gap-5 rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_44%,#f5f3ff_100%)] p-4 sm:p-5">
        <div className="grid grid-cols-3 items-end gap-3">
          {subjectBooks.map((subject, index) => {
            const Icon = subject.icon;
            return (
              <div
                key={subject.title}
                className={`grid min-h-[124px] content-between rounded-2xl border border-slate-200 border-t-4 p-3 shadow-lg shadow-slate-200/50 sm:min-h-[148px] ${
                  index === 1 ? "sm:min-h-[168px]" : ""
                } ${subject.tone}`}
              >
                <span className="text-[10px] font-extrabold uppercase leading-[1.3] text-slate-400">
                  {subject.label}
                </span>
                <Icon className="h-5 w-5" />
                <span className="break-words text-sm font-extrabold leading-[1.2] sm:text-lg">
                  {subject.title}
                </span>
                <span className="h-1.5 rounded-full bg-white/80" />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-[38px_1fr] gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500">
            <FlaskConical className="h-4.5 w-4.5" />
          </span>
          <p className="text-xs font-semibold leading-relaxed text-slate-500 sm:text-sm">
            แบ่งแล็บตามรายวิชาและสถานะการเรียนรู้ ช่วยให้เลือกบททดลองต่อไปได้เร็วขึ้น
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <TrustItem title="36 แล็บ" text="ครบฟิสิกส์ เคมี ชีวะ" />
        <TrustItem title="AI ไออุ่น" text="ช่วยทบทวนแนวคิด" />
        <TrustItem title="ครู/นักเรียน" text="บทบาทพร้อมใช้งาน" />
      </div>
    </aside>
  );
}

function MobileIntro({ mode }: { mode: AuthMode }) {
  const isRegister = mode === "register";

  return (
    <div className="grid gap-3 rounded-[22px] border border-slate-200 bg-white/85 p-3 shadow-sm shadow-slate-200/50 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Compass className="h-4.5 w-4.5" />
          </span>
          <span className="grid min-w-0 gap-0.5">
            <strong className="text-lg font-extrabold leading-[1.1] text-blue-600">
              SciSiam
            </strong>
          </span>
        </div>
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-extrabold leading-[1.45] text-blue-600">
          {isRegister ? "Register" : "Login"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {subjectBooks.map((subject) => {
          const Icon = subject.icon;
          return (
            <div
              key={subject.title}
              className={`grid min-h-14 content-between rounded-xl border border-slate-200 border-t-4 p-2 ${subject.tone}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="break-words text-[10px] font-extrabold leading-[1.15]">
                {subject.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

function TrustItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="grid gap-1 border-t border-slate-200 pt-3">
      <strong className="text-xs font-extrabold leading-[1.45] text-slate-900 sm:text-sm">
        {title}
      </strong>
      <span className="text-[11px] font-semibold leading-relaxed text-slate-400">
        {text}
      </span>
    </div>
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
    .select("display_name, role, total_points")
    .eq("id", input.userId)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const fallbackProfile = {
    display_name: input.displayName,
    role: "student" as const,
    total_points: 0,
  };

  return fallbackProfile;
}
