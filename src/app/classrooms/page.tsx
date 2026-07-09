"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  FlaskConical,
  RefreshCw,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import { ClassroomActions } from "@/components/classrooms/ClassroomActions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { clearScisiamAuthCache } from "@/lib/supabase/auth-cache";
import {
  listMyClassrooms,
  type ClassroomSummary,
} from "@/lib/supabase/classrooms";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const AUTH_CHECK_TIMEOUT_MS = 6_000;

async function hasAuthenticatedUser() {
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

export default function ClassroomsPage() {
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mountedRef = useRef(false);
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const loadClassrooms = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");

    if (!isSupabaseConfigured()) {
      router.replace("/login?next=/classrooms");
      return;
    }

    const authenticated = await hasAuthenticatedUser();
    if (!mountedRef.current) {
      return;
    }

    if (!authenticated) {
      clearScisiamAuthCache();
      router.replace("/login?next=/classrooms");
      return;
    }

    try {
      const data = await listMyClassrooms();
      if (!mountedRef.current) {
        return;
      }
      setClassrooms(data);
      setStatus("ready");
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : "โหลดรายชื่อห้องไม่สำเร็จ");
      setStatus("error");
    }
  }, [router]);

  useEffect(() => {
    mountedRef.current = true;
    const timer = window.setTimeout(() => void loadClassrooms(), 0);
    return () => {
      mountedRef.current = false;
      window.clearTimeout(timer);
    };
  }, [loadClassrooms]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => headingRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900 lg:pb-10">
      <Navbar />
      <div className="hidden lg:block">
        <Sidebar activeMenu="ชั้นเรียน" />
      </div>

      <main
        id="main-content"
        className={`min-w-0 transition-[padding-left] duration-300 ${
          isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"
        }`}
      >
        <header className="border-b border-slate-200 bg-white px-4 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-blue-600">CLASSROOMS</p>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="mt-2 text-3xl font-extrabold leading-[1.35] text-slate-950 outline-none"
              >
                ชั้นเรียนของฉัน
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">
                จัดกลุ่มแล็บสำหรับการเรียนร่วมกันและเข้าถึงห้องที่คุณเป็นสมาชิก
              </p>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-10">
          {status === "loading" ? <ClassroomLoadingState /> : null}
          {status === "error" ? (
            <ClassroomErrorState message={errorMessage} onRetry={() => void loadClassrooms()} />
          ) : null}
          {status === "ready" && classrooms.length === 0 ? <ClassroomEmptyState /> : null}
          {status === "ready" && classrooms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {classrooms.map((classroom) => (
                <ClassroomCard key={classroom.id} classroom={classroom} />
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function ClassroomLoadingState() {
  return (
    <div role="status" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <span className="sr-only">กำลังโหลดรายชื่อชั้นเรียน</span>
      {[0, 1, 2].map((item) => (
        <div key={item} className="min-h-52 animate-pulse rounded-lg border border-slate-200 bg-white p-5">
          <div className="h-5 w-2/3 rounded bg-slate-100" />
          <div className="mt-4 h-3 w-1/3 rounded bg-slate-100" />
          <div className="mt-8 h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function ClassroomErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border border-rose-200 bg-white p-6 text-center" role="alert">
      <RefreshCw className="size-9 text-rose-500" aria-hidden="true" />
      <div>
        <h2 className="text-lg font-extrabold leading-relaxed text-slate-950">โหลดชั้นเรียนไม่สำเร็จ</h2>
        <p className="mt-1 max-w-lg break-words text-sm font-semibold leading-relaxed text-slate-500">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        ลองใหม่
      </button>
    </div>
  );
}

function ClassroomEmptyState() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white p-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <UsersRound aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-xl font-extrabold leading-relaxed text-slate-950">ยังไม่มีชั้นเรียน</h2>
        <p className="mt-1 max-w-lg text-sm font-semibold leading-relaxed text-slate-500">
          กดปุ่มบวกเพื่อสร้างห้องใหม่ หรือใช้รหัสจากผู้สร้างเพื่อเข้าร่วมห้อง
        </p>
      </div>
      <div className="hidden lg:block">
        <ClassroomActions placement="desktop" />
      </div>
      <div className="lg:hidden">
        <ClassroomActions placement="mobile" />
      </div>
    </div>
  );
}

function ClassroomCard({ classroom }: { classroom: ClassroomSummary }) {
  return (
    <article className="flex min-h-60 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex min-h-7 items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 text-xs font-extrabold text-blue-700">
          {classroom.gradeLevel}
        </span>
        <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 text-xs font-extrabold text-slate-600">
          {classroom.isCreator ? <ShieldCheck className="size-3.5" aria-hidden="true" /> : <UsersRound className="size-3.5" aria-hidden="true" />}
          {classroom.isCreator ? "ผู้สร้าง" : "สมาชิก"}
        </span>
      </div>

      <h2 className="mt-4 break-words text-lg font-extrabold leading-relaxed text-slate-950">{classroom.name}</h2>
      <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
        <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
        สร้างโดย {classroom.creatorName}
      </p>
      {classroom.description ? (
        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-relaxed text-slate-500">{classroom.description}</p>
      ) : (
        <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-400">ไม่มีรายละเอียดเพิ่มเติม</p>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="size-4 text-blue-600" aria-hidden="true" />
          <div>
            <dt className="text-[11px] font-bold text-slate-400">ห้องแล็บ</dt>
            <dd className="text-sm font-extrabold text-slate-800">{classroom.labIds.length} แล็บ</dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UsersRound className="size-4 text-emerald-600" aria-hidden="true" />
          <div>
            <dt className="text-[11px] font-bold text-slate-400">สมาชิก</dt>
            <dd className="text-sm font-extrabold text-slate-800">{classroom.memberCount} คน</dd>
          </div>
        </div>
      </dl>

      <Link
        href={`/classrooms/${classroom.id}`}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
      >
        <BookOpenCheck className="size-4" aria-hidden="true" />
        เปิดห้อง
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
