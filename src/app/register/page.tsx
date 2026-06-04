import AuthForm from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.12),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(139,92,246,0.10),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)] py-3 sm:py-4">
      <AuthForm initialMode="register" />
    </main>
  );
}
