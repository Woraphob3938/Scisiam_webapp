import AuthForm from "@/components/auth/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    confirmed?: string;
    email?: string;
    oauth?: string;
    registered?: string;
    reset?: string;
  }>;
}) {
  const { confirmed, email, oauth, registered, reset } = await searchParams;
  const registeredEmail = typeof email === "string" && email.includes("@") ? email : "";
  const initialNotice =
    reset === "success"
      ? "เปลี่ยนรหัสผ่านสำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่"
      : confirmed === "success"
        ? "ยืนยันอีเมลสำเร็จแล้ว กรุณาเข้าสู่ระบบ"
        : registered === "success"
          ? `สมัครสมาชิกสำเร็จแล้ว กรุณาตรวจสอบอีเมล${registeredEmail ? ` ${registeredEmail}` : ""} เพื่อกดยืนยันบัญชีก่อนเข้าสู่ระบบ หากไม่พบให้ดูในสแปมหรือจดหมายขยะ`
          : "";
  const initialError =
    oauth === "error"
      ? "เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
      : "";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#eef5ff_0%,#f8fafc_42%,#ffffff_100%)] py-3 font-sans sm:py-4">
      <AuthForm
        initialMode="login"
        initialNotice={initialNotice}
        initialError={initialError}
      />
    </main>
  );
}
