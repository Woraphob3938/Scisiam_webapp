"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Lock, ShieldAlert } from "lucide-react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ResetPasswordForm({
  invalidLink = false,
}: {
  invalidLink?: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const canCheckSession = !invalidLink && isSupabaseConfigured();
  const [checkingSession, setCheckingSession] = useState(canCheckSession);
  const [isValidSession, setIsValidSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);

  const isMinLength = password.length >= 8;
  const hasUpperOrNum = /[A-Z]/.test(password) || /[0-9]/.test(password);

  useEffect(() => {
    if (!canCheckSession) return;

    let active = true;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data, error: userError }) => {
      if (!active) return;
      setIsValidSession(Boolean(data.user) && !userError);
      setCheckingSession(false);
    });

    return () => {
      active = false;
    };
  }, [canCheckSession]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!isMinLength || !hasUpperOrNum) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีตัวพิมพ์ใหญ่หรือตัวเลข");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError("เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาขอลิงก์รีเซ็ตใหม่");
        setLoading(false);
        return;
      }

      await supabase.auth.signOut({ scope: "local" });
      router.replace("/login?reset=success");
      router.refresh();
    } catch {
      setError("เชื่อมต่อระบบบัญชีไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-[460px] rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.13)] ring-1 ring-slate-200/70 backdrop-blur sm:p-7">
      <header className="mb-6 flex items-center gap-3">
        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[14px] bg-white shadow-md shadow-blue-500/15 ring-1 ring-slate-200">
          <Image src="/ai-oon-logo.png" alt="โลโก้ Scisiam น้องไออุ่น" fill sizes="44px" className="object-contain p-0.5" priority />
        </span>
        <div>
          <p className="scisiam-wordmark text-xl text-blue-600">Scisiam</p>
          <p className="text-xs font-semibold leading-relaxed text-slate-500">ระบบบัญชีที่ปลอดภัย</p>
        </div>
      </header>

      {checkingSession ? (
        <div className="grid min-h-52 place-items-center gap-4 text-center" role="status">
          <span className="h-9 w-9 rounded-full border-3 border-blue-100 border-t-blue-600 animate-spin" />
          <div>
            <h1 className="text-xl font-extrabold leading-[1.4] text-slate-950">กำลังตรวจสอบลิงก์</h1>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">กำลังตรวจสอบลิงก์รีเซ็ตรหัสผ่าน</p>
          </div>
        </div>
      ) : !isValidSession ? (
        <div className="grid gap-5 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold leading-[1.35] text-slate-950">ลิงก์ไม่ถูกต้องหรือหมดอายุ</h1>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">กลับไปหน้าเข้าสู่ระบบเพื่อขอลิงก์รีเซ็ตรหัสผ่านฉบับใหม่</p>
          </div>
          <Link href="/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
            กลับไปหน้าเข้าสู่ระบบ
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div>
            <h1 className="text-2xl font-extrabold leading-[1.35] text-slate-950">ตั้งรหัสผ่านใหม่</h1>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">ตั้งรหัสผ่านที่คาดเดายากและไม่ซ้ำกับบัญชีอื่น</p>
          </div>

          {error && (
            <div
              id="reset-password-error"
              ref={errorRef}
              role="alert"
              tabIndex={-1}
              className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-3 text-xs font-bold leading-relaxed text-rose-700 outline-none"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <PasswordField
            id="new-password"
            label="รหัสผ่านใหม่"
            value={password}
            visible={showPassword}
            hasError={Boolean(error)}
            onChange={setPassword}
            onToggle={() => setShowPassword((current) => !current)}
          />
          <PasswordField
            id="confirm-new-password"
            label="ยืนยันรหัสผ่านใหม่"
            value={confirmPassword}
            visible={showConfirmPassword}
            hasError={Boolean(error)}
            onChange={setConfirmPassword}
            onToggle={() => setShowConfirmPassword((current) => !current)}
          />

          <div id="reset-password-requirements" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <PasswordRule valid={isMinLength} label="อย่างน้อย 8 ตัวอักษร" />
            <PasswordRule valid={hasUpperOrNum} label="มีตัวพิมพ์ใหญ่/ตัวเลข" />
          </div>

          <button type="submit" disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
            {loading ? <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><span>บันทึกรหัสผ่านใหม่</span><ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      )}
    </section>
  );
}

function PasswordField({
  id,
  label,
  value,
  visible,
  hasError,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  hasError: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <label htmlFor={id} className="grid gap-1.5 text-sm font-extrabold leading-[1.45] text-slate-900">
      <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4 text-slate-400" />{label}</span>
      <span className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          autoComplete="new-password"
          aria-invalid={hasError}
          aria-describedby={hasError ? "reset-password-requirements reset-password-error" : "reset-password-requirements"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-14 text-sm font-semibold text-slate-800 outline-none transition-all hover:border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
        <button type="button" onClick={onToggle} aria-label={`${visible ? "ซ่อน" : "แสดง"}${label}`} aria-pressed={visible} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100">
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}

function PasswordRule({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${valid ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-200 bg-white text-transparent"}`}>
        <Check className="h-3 w-3 stroke-[3]" />
      </span>
      <span className={`text-xs font-bold leading-[1.45] ${valid ? "text-emerald-700" : "text-slate-400"}`}>{label}</span>
    </div>
  );
}
