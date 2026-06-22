import AuthForm from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#eef5ff_0%,#f8fafc_42%,#ffffff_100%)] py-3 font-sans sm:py-4">
      <AuthForm initialMode="register" />
    </main>
  );
}
