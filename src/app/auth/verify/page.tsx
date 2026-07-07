import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";

export default async function VerifyEmailLinkPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string;
    error?: string;
    token_hash?: string;
    type?: string;
  }>;
}) {
  const { email, error, token_hash: tokenHash, type } = await searchParams;
  const isSupportedType = type === "email" || type === "recovery";
  const isValidRequest = Boolean(tokenHash) && isSupportedType && !error;
  const isRecovery = type === "recovery";
  const showRecoveryOtpForm = isRecovery && !tokenHash;

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#eef5ff_0%,#f8fafc_44%,#ffffff_100%)] px-4 py-8 font-sans">
      <section className="w-full max-w-[460px] rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.13)] ring-1 ring-slate-200/70 backdrop-blur sm:p-7">
        <header className="mb-6 flex items-center gap-3">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[14px] bg-white shadow-md shadow-blue-500/15 ring-1 ring-slate-200">
            <Image
              src="/ai-oon-logo.png"
              alt="โลโก้ Scisiam น้องไออุ่น"
              fill
              sizes="44px"
              className="object-contain p-0.5"
              priority
            />
          </span>
          <div>
            <p className="text-lg font-extrabold leading-[1.2] text-blue-600">Scisiam</p>
            <p className="text-xs font-semibold leading-relaxed text-slate-500">ระบบบัญชีที่ปลอดภัย</p>
          </div>
        </header>

        {showRecoveryOtpForm ? (
          <form action="/auth/confirm" method="post" className="grid gap-5">
            <input type="hidden" name="type" value="recovery" />
            <div className="text-center">
              <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h1 className="text-2xl font-extrabold leading-[1.35] text-slate-950">ยืนยัน OTP</h1>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">กรอกรหัสจากอีเมล Scisiam ก่อนตั้งรหัสผ่านใหม่</p>
              {error ? (
                <p className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold leading-relaxed text-rose-700" role="alert">
                  OTP ไม่ถูกต้อง หมดอายุ หรือกรอกรหัสไม่ครบตามอีเมล กรุณาตรวจสอบอีเมลอีกครั้ง
                </p>
              ) : null}
            </div>
            <label htmlFor="recovery-email" className="grid gap-1.5 text-sm font-extrabold leading-[1.45] text-slate-900">
              อีเมลบัญชี
              <input
                id="recovery-email"
                name="email"
                type="email"
                required
                defaultValue={email ?? ""}
                autoComplete="email"
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all hover:border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <label htmlFor="recovery-token" className="grid gap-1.5 text-sm font-extrabold leading-[1.45] text-slate-900">
              รหัส OTP
              <input
                id="recovery-token"
                name="token"
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9]{6,8}"
                maxLength={8}
                autoComplete="one-time-code"
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-center text-2xl font-extrabold tracking-[0.35em] text-slate-800 outline-none transition-all hover:border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            >
              ยืนยัน OTP
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : isValidRequest ? (
          <form action="/auth/confirm" method="post" className="grid gap-5 text-center">
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type} />
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold leading-[1.35] text-slate-950">
                {isRecovery ? "ยืนยันการตั้งรหัสผ่านใหม่" : "ยืนยันอีเมลของคุณ"}
              </h1>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                {isRecovery
                  ? "กดยืนยันเพื่อเข้าสู่หน้าตั้งรหัสผ่านใหม่อย่างปลอดภัย"
                  : "กดยืนยันเพื่อเปิดใช้งานบัญชี Scisiam"}
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            >
              ยืนยันและดำเนินการต่อ
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="grid gap-5 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600">
              <ShieldAlert className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold leading-[1.35] text-slate-950">ลิงก์ไม่ถูกต้องหรือหมดอายุ</h1>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">ลิงก์อาจหมดอายุ ถูกเปิดไปแล้ว หรือมาจากอีเมลฉบับเก่า กรุณากลับไปสมัคร/เข้าสู่ระบบเพื่อขออีเมลฉบับใหม่</p>
            </div>
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            >
              กลับไปหน้าเข้าสู่ระบบ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
