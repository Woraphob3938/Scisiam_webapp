import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#eef5ff_0%,#f8fafc_44%,#ffffff_100%)] px-4 py-8 font-sans">
      <ResetPasswordForm invalidLink={error === "invalid_link"} />
    </main>
  );
}
