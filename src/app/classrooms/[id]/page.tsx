"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Copy,
  DoorOpen,
  FlaskConical,
  GraduationCap,
  LockKeyhole,
  Megaphone,
  RefreshCw,
  School,
  Share2,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "@/context/SidebarContext";
import { getLabReadiness } from "@/data/labReadiness";
import { labsById } from "@/data/labs";
import {
  getClassroom,
  getClassroomJoinCode,
  getClassroomMembers,
  type ClassroomDetail,
  type ClassroomMember,
} from "@/lib/supabase/classrooms";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getProfileAvatarSrc } from "@/lib/supabase/profile-avatar";

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
            <section
              className="border-b border-slate-200 bg-white"
              aria-labelledby="classroom-overview-heading"
            >
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
                <Link
                  href="/classrooms"
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  กลับไปชั้นเรียน
                </Link>
                <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-stretch">
                  <div className="flex min-w-0 gap-4 sm:gap-5">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm sm:size-14">
                      <School className="size-6 sm:size-7" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2 text-xs font-extrabold">
                        <span className="inline-flex min-h-7 items-center rounded-full border border-blue-100 bg-blue-50 px-3 text-blue-700">
                          {room.gradeLevel}
                        </span>
                        <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600">
                          {room.isCreator ? <ShieldCheck className="size-3.5" aria-hidden="true" /> : <UsersRound className="size-3.5" aria-hidden="true" />}
                          {room.isCreator ? "ผู้สร้างห้อง" : "สมาชิก"}
                        </span>
                      </div>
                      <h1
                        id="classroom-overview-heading"
                        ref={headingRef}
                        tabIndex={-1}
                        className="mt-3 break-words text-2xl font-extrabold leading-[1.45] text-slate-950 outline-none sm:text-3xl"
                      >
                        {room.name}
                      </h1>
                      <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500 sm:text-base">
                        {room.description || "พื้นที่เรียนรู้ร่วมกันสำหรับทดลอง สังเกต และทบทวนผลจากห้องแล็บ"}
                      </p>
                      <dl className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-100 pt-4">
                        <HeaderStat icon={FlaskConical} label="ห้องแล็บ" value={`${roomLabs.length} แล็บ`} />
                        <HeaderStat icon={UsersRound} label="สมาชิก" value={`${room.memberCount} คน`} />
                      </dl>
                    </div>
                  </div>
                  {room.isCreator && joinCode ? (
                    <JoinCodePanel
                      joinCode={joinCode}
                      shareStatus={shareStatus}
                      onCopy={() => void copyJoinCode()}
                      onShare={() => void shareJoinCode()}
                    />
                  ) : null}
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-10">
              <Tabs defaultValue="labs" className="gap-0">
                <TabsList variant="line" className="grid h-auto w-full grid-cols-3 border-b border-slate-200" aria-label="เนื้อหาในชั้นเรียน">
                  <TabsTrigger value="labs" className="min-h-12 min-w-0 rounded-none px-1 text-xs font-extrabold data-active:text-blue-700 sm:px-4 sm:text-sm">
                    <FlaskConical data-icon="inline-start" className="hidden sm:block" aria-hidden="true" />
                    ห้องแล็บ {roomLabs.length}
                  </TabsTrigger>
                  <TabsTrigger value="classwork" className="min-h-12 min-w-0 rounded-none px-1 text-xs font-extrabold data-active:text-blue-700 sm:px-4 sm:text-sm">
                    <ClipboardList data-icon="inline-start" className="hidden sm:block" aria-hidden="true" />
                    งานของชั้นเรียน
                  </TabsTrigger>
                  <TabsTrigger value="people" className="min-h-12 min-w-0 rounded-none px-1 text-xs font-extrabold data-active:text-blue-700 sm:px-4 sm:text-sm">
                    <UsersRound data-icon="inline-start" className="hidden sm:block" aria-hidden="true" />
                    บุคคล {orderedMembers.length}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="labs" className="pt-6">
                  <LabsPanel labs={roomLabs} />
                </TabsContent>
                <TabsContent value="classwork" className="pt-6">
                  <ClassworkPanel isCreator={room.isCreator} />
                </TabsContent>
                <TabsContent value="people" className="pt-6">
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
    <div className="flex min-w-32 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-blue-600">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <dt className="text-[11px] font-bold text-slate-400">{label}</dt>
        <dd className="mt-0.5 text-sm font-extrabold text-slate-800">{value}</dd>
      </div>
    </div>
  );
}

function JoinCodePanel({
  joinCode,
  shareStatus,
  onCopy,
  onShare,
}: {
  joinCode: string;
  shareStatus: string;
  onCopy: () => void;
  onShare: () => void;
}) {
  return (
    <aside className="flex h-full flex-col justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-5" aria-label="รหัสเข้าร่วมห้อง">
      <div>
        <div className="flex items-center gap-2 text-blue-700">
          <LockKeyhole className="size-4" aria-hidden="true" />
          <p className="text-xs font-extrabold">รหัสเข้าร่วมห้อง</p>
        </div>
        <output
          className="mt-2 block select-all font-mono text-2xl font-extrabold text-slate-950"
          aria-label={`รหัสห้อง ${joinCode}`}
        >
          {joinCode}
        </output>
        <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
          แสดงเฉพาะผู้สร้างห้อง ส่งรหัสนี้ให้สมาชิกที่ต้องการเชิญ
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 text-sm font-extrabold text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
        >
          <Copy className="size-4" aria-hidden="true" />
          คัดลอก
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-extrabold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
        >
          <Share2 className="size-4" aria-hidden="true" />
          แชร์
        </button>
      </div>
      <p className="mt-2 min-h-5 text-xs font-semibold leading-relaxed text-blue-700" aria-live="polite">
        {shareStatus}
      </p>
    </aside>
  );
}

const CATEGORY_STYLES = {
  Physics: { label: "ฟิสิกส์", accent: "bg-blue-500", icon: "bg-blue-50 text-blue-700", badge: "border-blue-100 bg-blue-50 text-blue-700" },
  Chemistry: { label: "เคมี", accent: "bg-violet-500", icon: "bg-violet-50 text-violet-700", badge: "border-violet-100 bg-violet-50 text-violet-700" },
  Biology: { label: "ชีววิทยา", accent: "bg-emerald-500", icon: "bg-emerald-50 text-emerald-700", badge: "border-emerald-100 bg-emerald-50 text-emerald-700" },
  Mathematics: { label: "คณิตศาสตร์", accent: "bg-pink-400", icon: "bg-pink-50 text-pink-700", badge: "border-pink-100 bg-pink-50 text-pink-700" },
  Foundation: { label: "ความรู้พื้นฐาน", accent: "bg-amber-400", icon: "bg-amber-50 text-amber-700", badge: "border-amber-100 bg-amber-50 text-amber-700" },
} as const;

function LabsPanel({ labs }: { labs: Array<(typeof labsById)[string]> }) {
  if (labs.length === 0) {
    return (
      <section className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center" aria-labelledby="empty-labs-heading">
        <span className="flex size-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
          <FlaskConical className="size-6" aria-hidden="true" />
        </span>
        <h2 id="empty-labs-heading" className="text-lg font-extrabold text-slate-950">ยังไม่มีห้องแล็บในชั้นเรียนนี้</h2>
        <p className="max-w-md text-sm font-semibold leading-relaxed text-slate-500">เมื่อผู้สร้างเพิ่มแล็บ รายการสำหรับเรียนและทดลองจะแสดงที่นี่</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="labs-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold text-blue-600">LAB COLLECTION</p>
          <h2 id="labs-heading" className="mt-1 text-xl font-extrabold leading-relaxed text-slate-950">แล็บที่ใช้ในชั้นเรียน</h2>
        </div>
        <p className="text-sm font-bold text-slate-500">ทั้งหมด {labs.length} แล็บ</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {labs.map((lab) => {
          const readiness = getLabReadiness(lab.id);
          const theme = CATEGORY_STYLES[lab.category];

          return (
            <article key={lab.id} className="relative flex min-h-72 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-md">
              <span className={`h-1 w-full ${theme.accent}`} aria-hidden="true" />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${theme.icon}`}>
                    <FlaskConical className="size-5" aria-hidden="true" />
                  </span>
                  <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-extrabold ${readiness.isReady ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-amber-100 bg-amber-50 text-amber-700"}`}>
                    {readiness.isReady ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : <Clock3 className="size-3.5" aria-hidden="true" />}
                    {readiness.label}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold">
                  <span className={`rounded-full border px-2.5 py-1 ${theme.badge}`}>{theme.label}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">{lab.gradeLevel}</span>
                </div>
                <h3 className="mt-3 break-words text-lg font-extrabold leading-relaxed text-slate-950">{lab.thaiTitle}</h3>
                <p className="text-xs font-bold leading-relaxed text-slate-400">{lab.title}</p>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-relaxed text-slate-500">{lab.description}</p>
                <Link
                  href={`/labs/${lab.id}`}
                  className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                >
                  <DoorOpen className="size-4" aria-hidden="true" />
                  เข้าห้อง
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ClassworkPanel({ isCreator }: { isCreator: boolean }) {
  return (
    <section aria-labelledby="classwork-heading">
      <div className="mb-4">
        <p className="text-xs font-extrabold text-blue-600">CLASSWORK</p>
        <h2 id="classwork-heading" className="mt-1 text-xl font-extrabold leading-relaxed text-slate-950">งานของชั้นเรียน</h2>
      </div>
      <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Megaphone className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-lg font-extrabold leading-relaxed text-slate-950">ยังไม่มีงานของชั้นเรียน</h3>
          <p className="mt-1 max-w-lg text-sm font-semibold leading-relaxed text-slate-500">
            {isCreator
              ? "งาน ประกาศ และกิจกรรมที่คุณมอบหมายให้สมาชิกจะแสดงเรียงตามลำดับเวลา"
              : "งานหรือประกาศใหม่จากผู้สร้างห้องจะแสดงที่นี่เมื่อมีการมอบหมาย"}
          </p>
        </div>
      </div>
    </section>
  );
}

function PeoplePanel({ members }: { members: ClassroomMember[] }) {
  const teacherMembers = members.filter((member) => member.role === "teacher" || member.isCreator);
  const studentMembers = members.filter((member) => member.role !== "teacher" && !member.isCreator);

  return (
    <section aria-labelledby="people-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold text-blue-600">PEOPLE</p>
          <h2 id="people-heading" className="mt-1 text-xl font-extrabold leading-relaxed text-slate-950">บุคคลในชั้นเรียน</h2>
        </div>
        <p className="text-sm font-bold text-slate-500">สมาชิกทั้งหมด {members.length} คน</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <PeopleGroup title="คุณครูและผู้ดูแล" members={teacherMembers} emptyText="ยังไม่มีคุณครูในห้องนี้" />
        <PeopleGroup title="นักเรียน" members={studentMembers} emptyText="ยังไม่มีนักเรียนเข้าร่วมห้อง" />
      </div>
    </section>
  );
}

function PeopleGroup({ title, members, emptyText }: { title: string; members: ClassroomMember[]; emptyText: string }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white" aria-label={title}>
      <div className="flex min-h-14 items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
        <h3 className="font-extrabold text-slate-900">{title}</h3>
        <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-slate-100 px-2 py-1 text-xs font-extrabold text-slate-600">{members.length}</span>
      </div>
      {members.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {members.map((member) => (
            <li key={member.userId} className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-5">
              <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-extrabold text-blue-700">
                {member.avatarUrl ? (
                  <Image
                    src={getProfileAvatarSrc(member.avatarUrl, member.avatarUpdatedAt)}
                    alt={`รูปโปรไฟล์ของ ${member.displayName}`}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <span aria-hidden="true">{member.displayName.trim().slice(0, 1) || <UserRound className="size-4" />}</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-slate-900">{member.displayName}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{member.email || "ไม่ได้ระบุอีเมล"}</p>
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
      ) : (
        <p className="px-5 py-8 text-center text-sm font-semibold leading-relaxed text-slate-500">{emptyText}</p>
      )}
    </section>
  );
}

function WorkspaceLoadingState() {
  return (
    <div role="status">
      <span className="sr-only">กำลังโหลดชั้นเรียน</span>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-10">
          <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex gap-4">
              <div className="size-14 shrink-0 animate-pulse rounded-lg bg-blue-100" />
              <div className="w-full max-w-2xl">
                <div className="h-7 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-5 h-12 w-72 max-w-full animate-pulse rounded bg-slate-100" />
              </div>
            </div>
            <div className="h-44 animate-pulse rounded-lg bg-blue-50" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-10">
        <div className="h-12 animate-pulse border-b border-slate-200 bg-slate-100/60" />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-lg border border-slate-200 bg-white" />)}
        </div>
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
