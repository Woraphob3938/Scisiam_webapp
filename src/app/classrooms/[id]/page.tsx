"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  ClipboardList,
  Copy,
  FlaskConical,
  GraduationCap,
  RefreshCw,
  Share2,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/context/SidebarContext";
import { labsById } from "@/data/labs";
import {
  getClassroom,
  getClassroomJoinCode,
  getClassroomMembers,
  type ClassroomDetail,
  type ClassroomMember,
} from "@/lib/supabase/classrooms";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const AUTH_CHECK_TIMEOUT_MS = 6_000;
const CLASSROOM_ACCESS_ERROR = "ไม่พบห้องเรียนหรือคุณไม่มีสิทธิ์เข้าถึง";

type WorkspaceStatus = "loading" | "ready" | "error" | "unavailable";

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

export default function ClassroomWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const mountedRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState<WorkspaceStatus>("loading");
  const [room, setRoom] = useState<ClassroomDetail | null>(null);
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState("");

  const roomLabs = useMemo(() => {
    if (!room) {
      return [];
    }

    return room.labIds
      .map((id) => labsById[id])
      .filter((lab): lab is NonNullable<typeof lab> => Boolean(lab));
  }, [room]);

  const orderedMembers = useMemo(
    () => [...members].sort((left, right) => Number(right.isCreator) - Number(left.isCreator)),
    [members],
  );

  const loadWorkspace = useCallback(async () => {
    setStatus("loading");
    setShareStatus("");

    if (!isSupabaseConfigured()) {
      router.replace(`/login?next=/classrooms/${id}`);
      return;
    }

    const authenticated = await hasAuthenticatedUser();
    if (!mountedRef.current) {
      return;
    }
    if (!authenticated) {
      router.replace(`/login?next=/classrooms/${id}`);
      return;
    }

    try {
      const [loadedRoom, loadedMembers] = await Promise.all([
        getClassroom(id),
        getClassroomMembers(id),
      ]);
      const code = loadedRoom.isCreator ? await getClassroomJoinCode(id) : null;

      if (!mountedRef.current) {
        return;
      }

      setRoom(loadedRoom);
      setMembers(loadedMembers);
      setJoinCode(code);
      setStatus("ready");
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      const message = error instanceof Error ? error.message : "";
      setRoom(null);
      setMembers([]);
      setJoinCode(null);
      setStatus(message === CLASSROOM_ACCESS_ERROR ? "unavailable" : "error");
    }
  }, [id, router]);

  useEffect(() => {
    mountedRef.current = true;
    const timer = window.setTimeout(() => void loadWorkspace(), 0);
    return () => {
      mountedRef.current = false;
      window.clearTimeout(timer);
    };
  }, [loadWorkspace]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    const frame = window.requestAnimationFrame(() => headingRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [status]);

  async function copyJoinCode() {
    if (!joinCode) {
      return;
    }
    try {
      await navigator.clipboard.writeText(joinCode);
      setShareStatus("คัดลอกรหัสแล้ว");
    } catch {
      setShareStatus("คัดลอกไม่สำเร็จ กรุณาเลือกรหัสแล้วคัดลอกด้วยตนเอง");
    }
  }

  async function shareJoinCode() {
    if (!joinCode || !room) {
      return;
    }
    const text = `เข้าร่วมห้อง ${room.name} บน SciSiam ด้วยรหัส ${joinCode}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: `SciSiam - ${room.name}`, text });
        setShareStatus("เปิดเมนูแชร์แล้ว");
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareStatus("อุปกรณ์นี้ไม่รองรับเมนูแชร์ จึงคัดลอกข้อความให้แล้ว");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setShareStatus("ไม่สามารถแชร์รหัสได้ในขณะนี้");
    }
  }

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
        {status === "loading" ? <WorkspaceLoadingState /> : null}
        {status === "error" ? <WorkspaceErrorState headingRef={headingRef} onRetry={() => void loadWorkspace()} /> : null}
        {status === "unavailable" ? <WorkspaceUnavailableState headingRef={headingRef} /> : null}
        {status === "ready" && room ? (
          <>
            <header className="bg-blue-600 px-4 py-7 text-white sm:px-8 lg:px-10">
              <div className="mx-auto max-w-7xl">
                <Link
                  href="/classrooms"
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-extrabold text-blue-50 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-3 focus-visible:ring-white/50"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  กลับไปชั้นเรียน
                </Link>
                <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 text-xs font-extrabold">
                      <span className="inline-flex min-h-7 items-center rounded-full bg-white/15 px-3">{room.gradeLevel}</span>
                      <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-white/15 px-3">
                        {room.isCreator ? <ShieldCheck className="size-3.5" aria-hidden="true" /> : <UsersRound className="size-3.5" aria-hidden="true" />}
                        {room.isCreator ? "ผู้สร้างห้อง" : "สมาชิก"}
                      </span>
                    </div>
                    <h1
                      ref={headingRef}
                      tabIndex={-1}
                      className="mt-3 break-words text-3xl font-extrabold leading-[1.35] outline-none sm:text-4xl"
                    >
                      {room.name}
                    </h1>
                    {room.description ? (
                      <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-blue-50 sm:text-base">{room.description}</p>
                    ) : null}
                  </div>
                  <dl className="grid shrink-0 grid-cols-2 gap-3">
                    <HeaderStat icon={FlaskConical} label="ห้องแล็บ" value={`${roomLabs.length} แล็บ`} />
                    <HeaderStat icon={UsersRound} label="สมาชิก" value={`${room.memberCount} คน`} />
                  </dl>
                </div>
              </div>
            </header>

            {room.isCreator && joinCode ? (
              <section className="border-b border-blue-100 bg-blue-50 px-4 py-3 sm:px-8 lg:px-10" aria-label="รหัสเข้าร่วมห้อง">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <ShieldCheck className="size-5 shrink-0 text-blue-600" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-700">รหัสสำหรับผู้สร้างห้องเท่านั้น</p>
                      <output className="select-all font-mono text-xl font-extrabold text-slate-950" aria-label={`รหัสห้อง ${joinCode}`}>{joinCode}</output>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={copyJoinCode}
                          className="flex size-10 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
                          aria-label="คัดลอกรหัสห้อง"
                        >
                          <Copy className="size-4" aria-hidden="true" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>คัดลอกรหัส</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={shareJoinCode}
                          className="flex size-10 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
                          aria-label="แชร์รหัสห้อง"
                        >
                          <Share2 className="size-4" aria-hidden="true" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>แชร์รหัส</TooltipContent>
                    </Tooltip>
                    <span className="sr-only" aria-live="polite">{shareStatus}</span>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-10">
              <Tabs defaultValue="labs" className="gap-5">
                <TabsList className="grid h-auto w-full grid-cols-3 p-1 sm:w-fit sm:min-w-[480px]" aria-label="เนื้อหาในชั้นเรียน">
                  <TabsTrigger value="labs" className="min-h-10 min-w-0 px-1 text-xs sm:px-3 sm:text-sm">
                    <FlaskConical data-icon="inline-start" className="hidden sm:block" aria-hidden="true" />
                    ห้องแล็บ
                  </TabsTrigger>
                  <TabsTrigger value="classwork" className="min-h-10 min-w-0 px-1 text-xs sm:px-3 sm:text-sm">
                    <ClipboardList data-icon="inline-start" className="hidden sm:block" aria-hidden="true" />
                    งานของชั้นเรียน
                  </TabsTrigger>
                  <TabsTrigger value="people" className="min-h-10 min-w-0 px-1 text-xs sm:px-3 sm:text-sm">
                    <UsersRound data-icon="inline-start" className="hidden sm:block" aria-hidden="true" />
                    บุคคล
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="labs">
                  <LabsPanel labs={roomLabs} />
                </TabsContent>
                <TabsContent value="classwork">
                  <ClassworkPanel />
                </TabsContent>
                <TabsContent value="people">
                  <PeoplePanel members={orderedMembers} />
                </TabsContent>
              </Tabs>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

function HeaderStat({ icon: Icon, label, value }: { icon: typeof FlaskConical; label: string; value: string }) {
  return (
    <div className="min-w-32 rounded-lg bg-white/12 p-3 backdrop-blur-sm">
      <Icon className="size-4" aria-hidden="true" />
      <dt className="mt-2 text-[11px] font-bold text-blue-100">{label}</dt>
      <dd className="mt-0.5 text-lg font-extrabold">{value}</dd>
    </div>
  );
}

function LabsPanel({ labs }: { labs: Array<(typeof labsById)[string]> }) {
  if (labs.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-6 text-center">
        <FlaskConical className="size-10 text-slate-300" aria-hidden="true" />
        <h2 className="text-lg font-extrabold text-slate-950">ยังไม่มีห้องแล็บในชั้นเรียนนี้</h2>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {labs.map((lab) => (
        <article key={lab.id} className="flex min-h-56 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2 text-xs font-extrabold">
            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-blue-700">{lab.category}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">{lab.gradeLevel}</span>
          </div>
          <h2 className="mt-4 break-words text-lg font-extrabold leading-relaxed text-slate-950">{lab.thaiTitle}</h2>
          <p className="text-sm font-semibold leading-relaxed text-slate-500">{lab.title}</p>
          <Link
            href={`/labs/${lab.id}`}
            className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
          >
            <BookOpenCheck className="size-4" aria-hidden="true" />
            เข้าห้อง
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}

function ClassworkPanel() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-6 text-center">
      <ClipboardList className="size-10 text-slate-300" aria-hidden="true" />
      <h2 className="text-lg font-extrabold leading-relaxed text-slate-950">ยังไม่มีงานของชั้นเรียน</h2>
      <p className="max-w-lg text-sm font-semibold leading-relaxed text-slate-500">งานหรือประกาศจากผู้สร้างห้องจะแสดงที่นี่</p>
    </div>
  );
}

function PeoplePanel({ members }: { members: ClassroomMember[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white" aria-labelledby="people-heading">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 id="people-heading" className="text-lg font-extrabold text-slate-950">บุคคลในชั้นเรียน</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">สมาชิกทั้งหมด {members.length} คน</p>
      </div>
      <ul className="divide-y divide-slate-100">
        {members.map((member) => (
          <li key={member.userId} className="flex min-h-16 items-center gap-3 px-5 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-extrabold text-slate-600" aria-hidden="true">
              {member.displayName.trim().slice(0, 1) || <UserRound className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-slate-900">{member.displayName}</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">{member.role === "teacher" ? "คุณครู" : "นักเรียน"}</p>
            </div>
            {member.isCreator ? (
              <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 text-xs font-extrabold text-blue-700">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                ผู้สร้าง
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function WorkspaceLoadingState() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-10" role="status">
      <span className="sr-only">กำลังโหลดชั้นเรียน</span>
      <div className="h-44 animate-pulse rounded-lg bg-blue-100" />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-56 animate-pulse rounded-lg border border-slate-200 bg-white" />)}
      </div>
    </div>
  );
}

function WorkspaceErrorState({
  headingRef,
  onRetry,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center" role="alert">
      <RefreshCw className="size-10 text-rose-500" aria-hidden="true" />
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold leading-relaxed text-slate-950 outline-none">เชื่อมต่อชั้นเรียนไม่สำเร็จ</h1>
      <p className="text-sm font-semibold leading-relaxed text-slate-500">กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        ลองใหม่
      </button>
    </div>
  );
}

function WorkspaceUnavailableState({ headingRef }: { headingRef: RefObject<HTMLHeadingElement | null> }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <GraduationCap className="size-12 text-slate-300" aria-hidden="true" />
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold leading-relaxed text-slate-950 outline-none">ไม่พบห้องหรือคุณไม่มีสิทธิ์เข้าถึง</h1>
      <p className="text-sm font-semibold leading-relaxed text-slate-500">ตรวจสอบรหัสห้องหรือกลับไปดูชั้นเรียนที่คุณเป็นสมาชิก</p>
      <Link
        href="/classrooms"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        กลับไปชั้นเรียน
      </Link>
    </div>
  );
}
