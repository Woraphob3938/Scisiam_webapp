"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  GraduationCap, 
  Check, 
  Sparkles,
  ShieldAlert,
  Compass
} from "lucide-react";
import { cacheSciSiamAuth } from "@/lib/supabase/auth-cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ScisiamUserRole } from "@/lib/supabase/database.types";

interface AuthFormProps {
  initialMode: "login" | "register";
}

export default function AuthForm({ initialMode }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  
  // Form fields states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Live password validation checks
  const isMinLength = password.length >= 8;
  const hasUpperOrNum = /[A-Z]/.test(password) || /[0-9]/.test(password);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic Validations
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
              role,
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

        await ensureProfile({
          userId: data.user.id,
          email: normalizedEmail,
          displayName: fullName.trim(),
          role,
        });

        cacheSciSiamAuth({
          email: normalizedEmail,
          role,
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
          email: normalizedEmail,
          displayName:
            typeof data.user.user_metadata?.display_name === "string"
              ? data.user.user_metadata.display_name
              : role === "teacher"
                ? "คุณครูผู้จัดการ"
                : "นักเรียน",
          role:
            data.user.user_metadata?.role === "teacher" ||
            data.user.user_metadata?.role === "student"
              ? data.user.user_metadata.role
              : role,
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

  const toggleMode = () => {
    setError("");
    setMode(mode === "login" ? "register" : "login");
  };

  return (
    <div className="flex w-full max-w-5xl flex-col lg:flex-row items-stretch justify-center gap-8 px-4 py-8 lg:py-12 select-none">
      
      {/* LEFT COLUMN: Features Card */}
      <div className="flex-1 rounded-[32px] border border-blue-100/50 bg-gradient-to-br from-blue-50/80 via-white/80 to-indigo-50/40 backdrop-blur-xl p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
        
        {/* Animated Orbits Backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] border border-dashed border-indigo-400 rounded-full -translate-x-1/2 -translate-y-1/2 animate-spin-slow" />
          <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] border border-dashed border-blue-400 rounded-full -translate-x-1/2 -translate-y-1/2 animate-spin-slow duration-[35s] reverse" />
          {/* Floating Dots */}
          <span className="absolute top-10 left-[20%] w-2.5 h-2.5 bg-blue-500 rounded-full animate-float-slow" />
          <span className="absolute top-[30%] right-[15%] w-3.5 h-3.5 bg-indigo-500 rounded-full animate-float-medium" />
          <span className="absolute bottom-[20%] left-[10%] w-2 h-2 bg-violet-400 rounded-full animate-float-fast" />
        </div>

        {/* Top Text Content */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-extrabold tracking-wider uppercase">SciSiam</span>
          </div>

          <h2 className="text-3xl font-extrabold leading-[1.3] text-slate-800 tracking-tight">
            เริ่มต้นกับ <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">SciSiam</span>
          </h2>
          
          <p className="text-sm font-medium text-slate-500 leading-[1.55] max-w-md">
            สมัครสมาชิกเพื่อเข้าสู่โลกแห่งการทดลอง วิทยาศาสตร์เสมือนจริง เรียนรู้ สนุก และเข้าใจง่ายในที่เดียว
          </p>

          {/* Highlight Badge */}
          <div className="inline-flex items-center gap-3.5 rounded-2xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 px-4.5 py-3 shadow-xs max-w-sm transition-all duration-300">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-500/10">
              <Compass className="w-4.5 h-4.5 animate-spin-slow" />
            </div>
            <p className="text-[11px] font-semibold text-purple-950 leading-[1.5] flex-1">
              แพลตฟอร์มที่เป็นมิตร สนุก เข้าใจง่าย และเหมาะสำหรับนักเรียนทุกระดับชั้น
            </p>
          </div>
        </div>

        {/* User-provided Science Illustration Banner */}
        <div className="relative z-10 w-full flex justify-center items-center mt-6 lg:mt-0 select-none">
          <div className="relative w-[340px] h-[220px] sm:w-[400px] sm:h-[260px] transform hover:scale-[1.03] transition-transform duration-500 ease-out drop-shadow-2xl animate-float-medium">
            <Image 
              src="/ChatGPT_Image_31_พ.ค._2569_13_08_41-removebg-preview.png" 
              alt="SciSiam Science Banner" 
              fill
              sizes="(max-w-768px) 340px, 400px"
              priority
              className="object-contain"
            />
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Form Card */}
      <div className="flex-1 flex justify-center items-center">
        <form 
          onSubmit={handleSubmit}
          className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100/80 flex flex-col justify-between min-h-[500px] w-full max-w-md relative z-10"
        >
          {/* Header section of the Form */}
          <div className="flex flex-col items-center text-center space-y-4">
            
            {/* Top Avatar Shield with science orbits */}
            <div className="relative flex items-center justify-center w-18 h-18 bg-blue-50/70 border border-blue-100/50 rounded-full shadow-inner shadow-blue-50">
              {/* Spinning decorative orbit */}
              <div className="absolute inset-[-6px] border border-dashed border-blue-400/40 rounded-full animate-spin-slow pointer-events-none" />
              <div className="absolute inset-[-12px] border border-dashed border-indigo-400/20 rounded-full animate-spin-slow duration-[30s] pointer-events-none" />
              
              <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <User className="w-6.5 h-6.5" />
              </div>
            </div>

            {/* Form Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-[1.3] font-sans">
                {mode === "register" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
              </h1>
              <p className="text-xs font-semibold text-slate-400 leading-normal max-w-[260px] mx-auto">
                {mode === "register" 
                  ? "สร้างบัญชีเพื่อเริ่มเรียนรู้และทดลองกับ SciSiam" 
                  : "ลงชื่อเข้าใช้งานเพื่อเริ่มเรียนรู้และทดลองกับ SciSiam"
                }
              </p>
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="my-6 space-y-3.5">
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-600 animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Fullname input (Register Only) */}
            {mode === "register" && (
              <div className="relative w-full group">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-100 px-4 py-3 transition-all duration-200">
                  <User className="w-5 h-5 text-slate-400 shrink-0 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="ชื่อ-นามสกุล"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 leading-normal"
                  />
                </div>
              </div>
            )}

            {/* Email input */}
            <div className="relative w-full group">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-100 px-4 py-3 transition-all duration-200">
                <Mail className="w-5 h-5 text-slate-400 shrink-0 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder={mode === "register" 
                    ? (role === "student" ? "อีเมลนักเรียน" : "อีเมลคุณครู")
                    : "อีเมล"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 leading-normal"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="relative w-full group">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-100 px-4 py-3 transition-all duration-200">
                <Lock className="w-5 h-5 text-slate-400 shrink-0 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 leading-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password input (Register Only) */}
            {mode === "register" && (
              <div className="relative w-full group">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-100 px-4 py-3 transition-all duration-200">
                  <Lock className="w-5 h-5 text-slate-400 shrink-0 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="ยืนยันรหัสผ่าน"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 leading-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Password Validation checklist (Register Only) */}
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-2 px-1 select-none">
                {/* Min 8 char */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    isMinLength 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600" 
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}>
                    {isMinLength && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className={`text-[10px] font-bold transition-colors ${
                    isMinLength ? "text-emerald-600" : "text-slate-400"
                  }`}>
                    อย่างน้อย 8 ตัวอักษร
                  </span>
                </div>
                {/* Uppercase/Num check */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    hasUpperOrNum 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600" 
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}>
                    {hasUpperOrNum && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className={`text-[10px] font-bold transition-colors ${
                    hasUpperOrNum ? "text-emerald-600" : "text-slate-400"
                  }`}>
                    มีตัวพิมพ์ใหญ่/ตัวเลข
                  </span>
                </div>
              </div>
            )}

            {/* Role selection dropdown */}
            <div className="relative w-full">
              <div className="flex items-center justify-between w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 px-4 py-3 text-slate-700 text-sm font-semibold transition-all focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-100">
                <div className="flex items-center gap-2.5 text-slate-500">
                  <GraduationCap className="w-5 h-5 text-slate-400 shrink-0" />
                  <span className="text-slate-500 text-xs font-bold leading-normal">ระดับชั้น / บทบาท</span>
                </div>
                
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "student" | "teacher")}
                  className="bg-transparent border-none outline-none font-semibold text-slate-700 cursor-pointer pr-1 text-xs text-right"
                >
                  <option value="student">นักเรียน</option>
                  <option value="teacher">คุณครู</option>
                </select>
              </div>
            </div>

            {/* Terms and conditions Checkbox (Register Only) */}
            {mode === "register" && (
              <label className="flex items-start gap-2.5 px-1 py-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[10px] font-bold leading-[1.4] text-slate-400 group-hover:text-slate-500 transition-colors select-none">
                  ฉันยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว
                </span>
              </label>
            )}

          </div>

          {/* Action button & Toggle */}
          <div className="space-y-4">
            
            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98 transition-all select-none cursor-pointer text-sm"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === "register" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}</span>
                  <ArrowRight className="w-4.5 h-4.5 animate-pulse" />
                </>
              )}
            </button>

            {/* Mode Toggle Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-xs font-bold text-slate-450 hover:text-blue-600 transition-colors select-none focus:outline-none"
              >
                {mode === "register" ? (
                  <>มีบัญชีอยู่แล้ว? <span className="text-blue-600 underline">เข้าสู่ระบบ</span></>
                ) : (
                  <>ยังไม่มีบัญชี? <span className="text-blue-600 underline">สมัครสมาชิก</span></>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2 select-none">
              <div className="h-px bg-slate-100 flex-1" />
              <span className="text-[10px] font-bold text-slate-400">หรือสำหรับทดลองใช้งาน</span>
              <div className="h-px bg-slate-100 flex-1" />
            </div>

            {/* Quick Demo Access */}
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("scisiam_demo_mode", "true");
                cacheSciSiamAuth({
                  role: "teacher",
                  displayName: "ครูอรทัย",
                  email: "teacher.demo@scisiam.com",
                  totalPoints: 0
                });
                router.push("/profile");
                router.refresh();
              }}
              className="w-full py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer leading-normal"
            >
              <span>เข้าใช้งานในบทบาทคุณครู (Demo Mode)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            
          </div>
        </form>
      </div>

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
  email: string;
  displayName: string;
  role: "student" | "teacher";
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
    role: input.role as ScisiamUserRole,
    total_points: 0,
  };

  await supabase.from("profiles").upsert({
    id: input.userId,
    email: input.email,
    display_name: input.displayName,
    role: input.role,
  });

  return fallbackProfile;
}
