"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Copy,
  DoorOpen,
  FlaskConical,
  GraduationCap,
  LockKeyhole,
  Megaphone,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  Share2,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  UserMinus,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "@/context/SidebarContext";
import { getLabReadiness } from "@/data/labReadiness";
import { labsById } from "@/data/labs";
import { getClassroomPresentation } from "@/lib/classroom-presentation";
import {
  createClassroomAssignment,
  deleteClassroomAssignment,
  disbandClassroom,
  getClassroom,
  getClassroomAssignments,
  getClassroomAssignmentSubmissions,
  getClassroomSubmissionExperimentRun,
  getClassroomJoinCode,
  getClassroomMembers,
  getClassroomNotifications,
  markClassroomNotificationsRead,
  gradeClassroomAssignmentSubmission,
  listMyExperimentRunsForLab,
  removeClassroomMember,
  renameClassroom,
  submitClassroomAssignment,
  type ClassroomAssignment,
  type ClassroomAssignmentSubmission,
  type ClassroomDetail,
  type ClassroomExperimentRun,
  type ClassroomMember,
  type ClassroomNotification,
  type CreateClassroomAssignmentInput,
  type SubmitClassroomAssignmentInput,
} from "@/lib/supabase/classrooms";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getProfileAvatarSrc } from "@/lib/supabase/profile-avatar";

const AUTH_CHECK_TIMEOUT_MS = 6_000;
const CLASSROOM_ACCESS_ERROR = "ไม่พบห้องเรียนหรือคุณไม่มีสิทธิ์เข้าถึง";

type WorkspaceStatus = "loading" | "ready" | "error" | "unavailable";
type ClassroomTab = "overview" | "labs" | "classwork" | "people";

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
  const searchParams = useSearchParams();
  const { isCollapsed } = useSidebar();
  const requestedTab = searchParams.get("tab");
  const requestedSubmissionId = searchParams.get("submission");
  const mountedRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [activeTab, setActiveTab] = useState<ClassroomTab>(
    requestedTab === "classwork" || requestedTab === "labs" || requestedTab === "people"
      ? requestedTab
      : "overview",
  );
  const [status, setStatus] = useState<WorkspaceStatus>("loading");
  const [room, setRoom] = useState<ClassroomDetail | null>(null);
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [assignments, setAssignments] = useState<ClassroomAssignment[]>([]);
  const [submissions, setSubmissions] = useState<ClassroomAssignmentSubmission[]>([]);
  const [notifications, setNotifications] = useState<ClassroomNotification[]>([]);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState("");
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState("");
  const [disbandOpen, setDisbandOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ClassroomMember | null>(null);
  const [pendingAction, setPendingAction] = useState<"rename" | "disband" | "remove" | "assignment" | null>(null);

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

  const classroomPresentation = useMemo(
    () => (room ? getClassroomPresentation(room.labIds) : null),
    [room],
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
      const [loadedRoom, loadedMembers, loadedAssignments, loadedSubmissions, loadedNotifications] = await Promise.all([
        getClassroom(id),
        getClassroomMembers(id),
        getClassroomAssignments(id),
        getClassroomAssignmentSubmissions(id),
        getClassroomNotifications(id),
      ]);
      const code = loadedRoom.isCreator ? await getClassroomJoinCode(id) : null;

      if (!mountedRef.current) {
        return;
      }

      setRoom(loadedRoom);
      setMembers(loadedMembers);
      setAssignments(loadedAssignments);
      setSubmissions(loadedSubmissions);
      setNotifications(loadedNotifications);
      setJoinCode(code);
      setStatus("ready");
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      const message = error instanceof Error ? error.message : "";
      setRoom(null);
      setMembers([]);
      setAssignments([]);
      setSubmissions([]);
      setNotifications([]);
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
    const text = `เข้าร่วมห้อง ${room.name} บน Scisiam ด้วยรหัส ${joinCode}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: `Scisiam - ${room.name}`, text });
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

  function openRenameDialog() {
    if (!room) return;
    setRenameName(room.name);
    setRenameOpen(true);
  }

  async function handleRename() {
    if (!room) return;
    setPendingAction("rename");
    try {
      const name = await renameClassroom(room.id, renameName);
      setRoom((current) => current ? { ...current, name } : current);
      setRenameOpen(false);
      toast.success("เปลี่ยนชื่อห้องแล้ว");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เปลี่ยนชื่อห้องไม่สำเร็จ");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDisband() {
    if (!room) return;
    setPendingAction("disband");
    try {
      await disbandClassroom(room.id);
      toast.success("ยุบห้องเรียนแล้ว");
      router.replace("/classrooms");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ยุบห้องเรียนไม่สำเร็จ");
      setPendingAction(null);
    }
  }

  async function handleRemoveMember() {
    if (!room || !memberToRemove) return;
    setPendingAction("remove");
    try {
      await removeClassroomMember(room.id, memberToRemove.userId);
      setMembers((current) => current.filter((member) => member.userId !== memberToRemove.userId));
      setRoom((current) => current ? { ...current, memberCount: Math.max(1, current.memberCount - 1) } : current);
      setMemberToRemove(null);
      toast.success(`นำ ${memberToRemove.displayName} ออกจากห้องแล้ว`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "นำสมาชิกออกไม่สำเร็จ");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleCreateAssignment(input: CreateClassroomAssignmentInput) {
    if (!room) return false;
    setPendingAction("assignment");
    try {
      await createClassroomAssignment(room.id, input);
      const [nextAssignments, nextNotifications] = await Promise.all([
        getClassroomAssignments(room.id),
        getClassroomNotifications(room.id),
      ]);
      setAssignments(nextAssignments);
      setNotifications(nextNotifications);
      toast.success("เพิ่มงานของชั้นเรียนแล้ว");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เพิ่มงานไม่สำเร็จ");
      return false;
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSubmitAssignment(input: SubmitClassroomAssignmentInput) {
    if (!room) return false;
    setPendingAction("assignment");
    try {
      await submitClassroomAssignment(input);
      const [nextSubmissions, nextNotifications] = await Promise.all([
        getClassroomAssignmentSubmissions(room.id),
        getClassroomNotifications(room.id),
      ]);
      setSubmissions(nextSubmissions);
      setNotifications(nextNotifications);
      toast.success("ส่งงานให้คุณครูแล้ว");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ส่งงานไม่สำเร็จ");
      return false;
    } finally {
      setPendingAction(null);
    }
  }

  async function handleGradeSubmission(submissionId: string, score: number) {
    if (!room) return false;
    setPendingAction("assignment");
    try {
      await gradeClassroomAssignmentSubmission(submissionId, score);
      setSubmissions(await getClassroomAssignmentSubmissions(room.id));
      toast.success("บันทึกคะแนนแล้ว");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "บันทึกคะแนนไม่สำเร็จ");
      return false;
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDeleteAssignment(assignment: ClassroomAssignment) {
    if (!room || !window.confirm(`ลบงาน "${assignment.title}" ออกจากชั้นเรียนใช่ไหม?`)) return;
    setPendingAction("assignment");
    try {
      await deleteClassroomAssignment(assignment.id);
      const [nextAssignments, nextNotifications] = await Promise.all([
        getClassroomAssignments(room.id),
        getClassroomNotifications(room.id),
      ]);
      setAssignments(nextAssignments);
      setNotifications(nextNotifications);
      toast.success("ลบงานออกจากชั้นเรียนแล้ว");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ลบงานไม่สำเร็จ");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleMarkNotificationsRead() {
    if (!room) return;
    setPendingAction("assignment");
    try {
      await markClassroomNotificationsRead(room.id);
      setNotifications(await getClassroomNotifications(room.id));
      toast.success("อ่านการแจ้งเตือนแล้ว");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "อัปเดตการแจ้งเตือนไม่สำเร็จ");
    } finally {
      setPendingAction(null);
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
            <section className="border-b border-slate-200 bg-white" aria-labelledby="classroom-overview-heading">
              <div className="mx-auto max-w-7xl px-4 py-5 sm:px-8 lg:px-10 lg:py-7">
                <Link
                  href="/classrooms"
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  ชั้นเรียนของฉัน
                </Link>

                {classroomPresentation ? (
                  <div className={`relative mt-3 overflow-hidden rounded-3xl bg-gradient-to-br px-5 py-6 text-white shadow-sm sm:px-8 sm:py-8 ${classroomPresentation.coverClassName}`}>
                    <span aria-hidden="true" className="absolute -right-12 -top-20 size-64 rounded-full bg-white/10" />
                    <span aria-hidden="true" className={`absolute -bottom-24 right-28 size-52 rounded-full ${classroomPresentation.glowClassName}`} />
                    <span aria-hidden="true" className="absolute bottom-8 right-8 hidden size-28 rotate-12 rounded-[28px] border-[18px] border-white/10 sm:block" />

                    <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2 text-xs font-bold">
                          <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">{classroomPresentation.label}</span>
                          <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">{room.gradeLevel}</span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                            {room.isCreator ? <ShieldCheck className="size-3.5" aria-hidden="true" /> : <UsersRound className="size-3.5" aria-hidden="true" />}
                            {room.isCreator ? "ผู้สร้างห้อง" : "สมาชิก"}
                          </span>
                        </div>
                        <h1
                          id="classroom-overview-heading"
                          ref={headingRef}
                          tabIndex={-1}
                          className="mt-4 max-w-3xl break-words text-3xl font-bold leading-tight text-white outline-none sm:text-4xl"
                        >
                          {room.name}
                        </h1>
                        <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-white/85 sm:text-base">
                          {room.description || "พื้นที่เรียนรู้ร่วมกันสำหรับทดลอง สังเกต และทบทวนผลจากห้องแล็บ"}
                        </p>
                        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white/80">
                          <UserRound className="size-4" aria-hidden="true" />
                          {room.creatorName}
                        </p>
                      </div>

                      <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
                        <div>
                          <dt className="text-xs font-medium text-white/70">ห้องแล็บ</dt>
                          <dd className="mt-1 text-2xl font-bold text-white">{roomLabs.length}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-white/70">สมาชิก</dt>
                          <dd className="mt-1 text-2xl font-bold text-white">{room.memberCount}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                ) : null}

                {room.isCreator ? (
                  <div className="mt-3 flex flex-wrap items-start gap-2">
                    <button
                      type="button"
                      onClick={openRenameDialog}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      เปลี่ยนชื่อห้อง
                    </button>
                    {joinCode ? (
                      <details className="group rounded-lg border border-slate-200 bg-white">
                        <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 px-3 text-sm font-bold text-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 [&::-webkit-details-marker]:hidden">
                          <UsersRound className="size-4" aria-hidden="true" />
                          เชิญสมาชิก
                        </summary>
                        <div className="w-[min(92vw,340px)] border-t border-slate-100 p-2">
                          <JoinCodePanel
                            joinCode={joinCode}
                            shareStatus={shareStatus}
                            onCopy={() => void copyJoinCode()}
                            onShare={() => void shareJoinCode()}
                          />
                        </div>
                      </details>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setDisbandOpen(true)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-100"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      ยุบห้องเรียน
                    </button>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-10">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ClassroomTab)} className="gap-0">
                <TabsList variant="line" className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:grid-cols-4" aria-label="เนื้อหาในชั้นเรียน">
                  <TabsTrigger value="overview" className="min-h-12 rounded-lg px-2 text-sm font-bold after:bottom-0 after:inset-x-3 after:bg-blue-600 data-active:text-blue-700">ภาพรวม</TabsTrigger>
                  <TabsTrigger value="classwork" className="min-h-12 rounded-lg px-2 text-sm font-bold after:bottom-0 after:inset-x-3 after:bg-blue-600 data-active:text-blue-700">งานของชั้นเรียน</TabsTrigger>
                  <TabsTrigger value="labs" className="min-h-12 rounded-lg px-2 text-sm font-bold after:bottom-0 after:inset-x-3 after:bg-blue-600 data-active:text-blue-700">ห้องแล็บ</TabsTrigger>
                  <TabsTrigger value="people" className="min-h-12 rounded-lg px-2 text-sm font-bold after:bottom-0 after:inset-x-3 after:bg-blue-600 data-active:text-blue-700">สมาชิก</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="pt-6">
                  <OverviewPanel
                    assignments={assignments}
                    submissions={submissions}
                    notifications={notifications}
                    isCreator={room.isCreator}
                    isSubmitting={pendingAction === "assignment"}
                    onOpenClasswork={() => setActiveTab("classwork")}
                    onMarkNotificationsRead={handleMarkNotificationsRead}
                  />
                </TabsContent>
                <TabsContent value="classwork" className="pt-6">
                  <ClassworkPanel
                    assignments={assignments}
                    submissions={submissions}
                    members={members}
                    labs={roomLabs}
                    isCreator={room.isCreator}
                    isSubmitting={pendingAction === "assignment"}
                    onCreate={handleCreateAssignment}
                    onDelete={handleDeleteAssignment}
                    onSubmit={handleSubmitAssignment}
                    onGrade={handleGradeSubmission}
                    requestedSubmissionId={requestedSubmissionId}
                  />
                </TabsContent>
                <TabsContent value="labs" className="pt-6">
                  <LabsPanel labs={roomLabs} />
                </TabsContent>
                <TabsContent value="people" className="pt-6">
                  <PeoplePanel
                    members={orderedMembers}
                    isCreator={room.isCreator}
                    onRemove={setMemberToRemove}
                  />
                </TabsContent>
              </Tabs>
            </section>

            <RenameClassroomDialog
              open={renameOpen}
              name={renameName}
              isSubmitting={pendingAction === "rename"}
              onOpenChange={setRenameOpen}
              onNameChange={setRenameName}
              onSubmit={() => void handleRename()}
            />
            <ConfirmActionDialog
              open={disbandOpen}
              title="ยุบห้องเรียน"
              description="สมาชิกจะไม่สามารถเปิดหรือเข้าร่วมห้องนี้ได้อีก ข้อมูลเดิมจะยังถูกเก็บไว้ในระบบ"
              confirmLabel="ยุบห้องเรียน"
              isSubmitting={pendingAction === "disband"}
              onOpenChange={setDisbandOpen}
              onConfirm={() => void handleDisband()}
            />
            <ConfirmActionDialog
              open={Boolean(memberToRemove)}
              title="นำสมาชิกออกจากห้อง"
              description={memberToRemove ? `ยืนยันการนำ ${memberToRemove.displayName} ออกจากห้องเรียน` : ""}
              confirmLabel="นำออก"
              isSubmitting={pendingAction === "remove"}
              onOpenChange={(open) => { if (!open) setMemberToRemove(null); }}
              onConfirm={() => void handleRemoveMember()}
            />
          </>
        ) : null}
      </main>
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

function OverviewPanel({
  assignments,
  submissions,
  notifications,
  isCreator,
  isSubmitting,
  onOpenClasswork,
  onMarkNotificationsRead,
}: {
  assignments: ClassroomAssignment[];
  submissions: ClassroomAssignmentSubmission[];
  notifications: ClassroomNotification[];
  isCreator: boolean;
  isSubmitting: boolean;
  onOpenClasswork: () => void;
  onMarkNotificationsRead: () => void;
}) {
  const submittedAssignmentIds = new Set(submissions.map((submission) => submission.assignmentId));
  const latestAssignments = [...assignments]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 4);
  const pendingAssignments = assignments.filter((assignment) => !submittedAssignmentIds.has(assignment.id));
  const unreadNotifications = notifications.filter((notification) => !notification.readAt);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <section className="min-w-0" aria-labelledby="classroom-latest-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-blue-600">STREAM</p>
            <h2 id="classroom-latest-heading" className="mt-1 text-xl font-bold leading-relaxed text-slate-950">อัปเดตล่าสุด</h2>
          </div>
          {assignments.length > 0 ? (
            <button
              type="button"
              onClick={onOpenClasswork}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-blue-700 hover:bg-blue-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
            >
              ดูงานทั้งหมด
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {latestAssignments.length > 0 ? (
          <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {latestAssignments.map((assignment) => {
              const isSubmitted = submittedAssignmentIds.has(assignment.id);
              return (
                <li key={assignment.id} className="border-b border-slate-100 last:border-b-0">
                  <button
                    type="button"
                    onClick={onOpenClasswork}
                    className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-blue-100 sm:px-5"
                  >
                    <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                      <ClipboardList className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-sm font-bold leading-relaxed text-slate-900">{assignment.title}</span>
                      <span className="mt-1 block text-xs font-medium text-slate-600">
                        {assignment.dueAt ? `กำหนดส่ง ${formatClassroomDate(assignment.dueAt)}` : `เพิ่มเมื่อ ${formatClassroomDate(assignment.createdAt)}`}
                      </span>
                    </span>
                    {!isCreator ? (
                      <span className={`mt-1 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${isSubmitted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
                        {isSubmitted ? "ส่งแล้ว" : "ยังไม่ส่ง"}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Megaphone className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-base font-bold text-slate-950">ยังไม่มีอัปเดตในชั้นเรียน</h3>
            <p className="mt-1 max-w-md text-sm font-medium leading-relaxed text-slate-600">
              {isCreator ? "เพิ่มงานแรกเพื่อเริ่มกิจกรรมร่วมกับสมาชิก" : "งานใหม่จากคุณครูจะแสดงที่นี่"}
            </p>
          </div>
        )}
      </section>

      <aside className="grid gap-4" aria-label="สรุปชั้นเรียน">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="my-classwork-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="my-classwork-heading" className="text-lg font-bold text-slate-950">{isCreator ? "งานที่ต้องติดตาม" : "งานของฉัน"}</h2>
            <ClipboardList className="size-5 text-blue-600" aria-hidden="true" />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-blue-50 p-3">
              <dt className="text-xs font-medium text-blue-700">{isCreator ? "งานทั้งหมด" : "ยังไม่ส่ง"}</dt>
              <dd className="mt-1 text-2xl font-bold text-blue-950">{isCreator ? assignments.length : pendingAssignments.length}</dd>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <dt className="text-xs font-medium text-emerald-700">{isCreator ? "การส่งงาน" : "ส่งแล้ว"}</dt>
              <dd className="mt-1 text-2xl font-bold text-emerald-950">{isCreator ? submissions.length : submittedAssignmentIds.size}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={onOpenClasswork}
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 hover:bg-blue-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
          >
            เปิดงานของชั้นเรียน
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </section>

        {notifications.length > 0 ? (
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadNotifications.length}
            isSubmitting={isSubmitting}
            onMarkRead={onMarkNotificationsRead}
          />
        ) : null}
      </aside>
    </div>
  );
}

function ClassworkPanel({
  assignments,
  submissions,
  members,
  labs,
  isCreator,
  isSubmitting,
  onCreate,
  onDelete,
  onSubmit,
  onGrade,
  requestedSubmissionId,
}: {
  assignments: ClassroomAssignment[];
  submissions: ClassroomAssignmentSubmission[];
  members: ClassroomMember[];
  labs: Array<NonNullable<(typeof labsById)[string]>>;
  isCreator: boolean;
  isSubmitting: boolean;
  onCreate: (input: CreateClassroomAssignmentInput) => Promise<boolean>;
  onDelete: (assignment: ClassroomAssignment) => void;
  onSubmit: (input: SubmitClassroomAssignmentInput) => Promise<boolean>;
  onGrade: (submissionId: string, score: number) => Promise<boolean>;
  requestedSubmissionId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [linkUrls, setLinkUrls] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);
  const [isLabAssignment, setIsLabAssignment] = useState(false);
  const [labId, setLabId] = useState("");
  const [maxScore, setMaxScore] = useState("10");
  const memberNameById = useMemo(
    () => new Map(members.map((member) => [member.userId, member.displayName])),
    [members],
  );

  async function submitAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onCreate({
      title,
      description,
      dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      labId: isLabAssignment ? labId : null,
      maxScore: isLabAssignment ? Number(maxScore) : null,
      linkUrls,
      attachmentFiles,
    });
    if (!saved) return;
    setTitle("");
    setDescription("");
    setDueAt("");
    setLinkUrls("");
    setAttachmentFiles([]);
    setIsLabAssignment(false);
    setLabId("");
    setMaxScore("10");
    setAttachmentInputKey((key) => key + 1);
    setOpen(false);
  }

  return (
    <section aria-labelledby="classwork-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-blue-600">CLASSWORK</p>
          <h2 id="classwork-heading" className="mt-1 text-xl font-extrabold leading-relaxed text-slate-950">งานของชั้นเรียน</h2>
        </div>
        {isCreator ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
          >
            <Plus className="size-4" aria-hidden="true" />
            เพิ่มงาน
          </button>
        ) : null}
      </div>
      {assignments.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Megaphone className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-extrabold leading-relaxed text-slate-950">ยังไม่มีงานของชั้นเรียน</h3>
            <p className="mt-1 max-w-lg text-sm font-semibold leading-relaxed text-slate-500">
              {isCreator
                ? "เพิ่มงานหรือกิจกรรมแรกเพื่อให้สมาชิกเริ่มเรียนรู้ร่วมกัน"
                : "งานใหม่จากผู้สร้างห้องจะแสดงที่นี่เมื่อมีการมอบหมาย"}
            </p>
          </div>
        </div>
      ) : (
        <ul className="grid gap-3">
          {assignments.map((assignment) => {
            const assignmentSubmissions = submissions.filter((submission) => submission.assignmentId === assignment.id);
            const existingSubmission = assignmentSubmissions[0] ?? null;

            return (
              <li key={assignment.id}>
                <details className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm open:border-blue-200">
                  <summary className="flex min-h-20 cursor-pointer list-none items-center gap-3 px-4 py-3 focus:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-blue-100 [&::-webkit-details-marker]:hidden sm:px-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                      <ClipboardList className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-sm font-bold leading-relaxed text-slate-950 sm:text-base">{assignment.title}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-600">
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        {assignment.dueAt ? `กำหนดส่ง ${formatClassroomDate(assignment.dueAt)}` : "ไม่กำหนดวันส่ง"}
                      </span>
                    </span>
                    <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline-flex ${isCreator || existingSubmission ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
                      {isCreator ? `ส่งแล้ว ${assignmentSubmissions.length}` : existingSubmission ? "ส่งแล้ว" : "ยังไม่ส่ง"}
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-slate-500 transition-transform group-open:rotate-90" aria-hidden="true" />
                  </summary>

                  <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
                    {assignment.description ? (
                      <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-600">{assignment.description}</p>
                    ) : (
                      <p className="text-sm font-medium text-slate-500">ไม่มีรายละเอียดเพิ่มเติม</p>
                    )}
                    <AttachmentLinks linkUrls={assignment.linkUrls} attachments={assignment.attachments} />
                    {isCreator ? (
                      <button
                        type="button"
                        onClick={() => onDelete(assignment)}
                        disabled={isSubmitting}
                        className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-100"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        ลบงาน
                      </button>
                    ) : null}
                    {isCreator ? (
                      <SubmissionList
                        assignment={assignment}
                        submissions={assignmentSubmissions}
                        memberNameById={memberNameById}
                        isSubmitting={isSubmitting}
                        requestedSubmissionId={requestedSubmissionId}
                        onGrade={onGrade}
                      />
                    ) : (
                      <AssignmentSubmissionForm
                        assignment={assignment}
                        existingSubmission={existingSubmission}
                        isSubmitting={isSubmitting}
                        onSubmit={onSubmit}
                      />
                    )}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-hidden p-0 sm:max-w-xl md:max-h-[calc(100dvh-2rem)] md:max-w-3xl">
          <form onSubmit={submitAssignment} className="flex max-h-[calc(100dvh-2rem)] flex-col">
            <DialogHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 pr-12 sm:px-6">
              <DialogTitle className="text-lg font-extrabold leading-relaxed text-slate-950">เพิ่มงานของชั้นเรียน</DialogTitle>
              <DialogDescription className="font-semibold leading-relaxed">จัดรายละเอียดงาน แนบไฟล์ และกำหนดส่งให้สมาชิกในห้อง</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 overflow-y-auto overflow-x-hidden px-5 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] sm:px-6">
              <div className="grid min-w-0 gap-4">
                <label className="grid gap-2 text-sm font-extrabold text-slate-800">
                  ชื่องาน <span className="text-rose-600">*</span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={120}
                    required
                    autoFocus
                    className="min-h-11 rounded-lg border border-slate-300 px-3 font-semibold outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                    placeholder="เช่น สรุปผลการทดลองเรื่องแรง"
                  />
                </label>
                <label className="grid gap-2 text-sm font-extrabold text-slate-800">
                  รายละเอียดเพิ่มเติม
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={1000}
                    rows={7}
                    className="min-h-40 resize-y rounded-lg border border-slate-300 px-3 py-2 font-semibold leading-relaxed outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                    placeholder="คำแนะนำ สิ่งที่ต้องส่ง หรือเกณฑ์สั้น ๆ"
                  />
                </label>
              </div>
              <div className="grid min-w-0 content-start gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <fieldset className="grid gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                  <legend className="px-1 text-sm font-extrabold text-slate-800">ประเภทงาน</legend>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg bg-white px-3 text-sm font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isLabAssignment}
                      onChange={(event) => {
                        setIsLabAssignment(event.target.checked);
                        if (event.target.checked && !labId) setLabId(labs[0]?.id ?? "");
                      }}
                      className="size-4 accent-blue-600"
                    />
                    มอบหมายห้องแล็บ
                  </label>
                  {isLabAssignment ? (
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_112px]">
                      <label className="grid gap-1.5 text-xs font-extrabold text-slate-700">
                        ห้องแล็บที่มอบหมาย
                        <select
                          value={labId}
                          onChange={(event) => setLabId(event.target.value)}
                          required
                          className="min-h-11 min-w-0 rounded-lg border border-slate-300 bg-white px-3 font-semibold outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                        >
                          {labs.map((lab) => <option key={lab.id} value={lab.id}>{lab.title}</option>)}
                        </select>
                      </label>
                      <label className="grid gap-1.5 text-xs font-extrabold text-slate-700">
                        คะแนนเต็ม
                        <input
                          type="number"
                          value={maxScore}
                          onChange={(event) => setMaxScore(event.target.value)}
                          min={1}
                          max={100}
                          step={1}
                          required
                          className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 font-semibold outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                        />
                      </label>
                    </div>
                  ) : null}
                </fieldset>
                <label className="grid min-w-0 gap-2 text-sm font-extrabold text-slate-800">
                  ลิงก์ประกอบงาน
                  <textarea
                    value={linkUrls}
                    onChange={(event) => setLinkUrls(event.target.value)}
                    maxLength={5000}
                    rows={3}
                    className="min-w-0 resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold leading-relaxed outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                    placeholder="วางลิงก์ได้หลายอัน แยกบรรทัดละ 1 ลิงก์"
                  />
                </label>
                <FilePickerField
                  inputKey={attachmentInputKey}
                  label="ไฟล์ประกอบงาน"
                  files={attachmentFiles}
                  helpText="รองรับไฟล์ทั่วไป รวมถึง PNG/JPG ไม่เกิน 10 MB ต่อไฟล์ สูงสุด 10 ไฟล์"
                  onSelect={(files) => setAttachmentFiles((current) => mergeSelectedFiles(current, files))}
                />
                <SelectedFilesList
                  files={attachmentFiles}
                  onRemove={(index) => {
                    setAttachmentFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
                    setAttachmentInputKey((key) => key + 1);
                  }}
                  onClear={() => {
                    setAttachmentFiles([]);
                    setAttachmentInputKey((key) => key + 1);
                  }}
                />
                <label className="grid min-w-0 gap-2 text-sm font-extrabold text-slate-800">
                  กำหนดส่ง
                  <input
                    type="datetime-local"
                    value={dueAt}
                    onChange={(event) => setDueAt(event.target.value)}
                    className="min-h-11 min-w-0 rounded-lg border border-slate-300 bg-white px-3 font-semibold outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  />
                </label>
              </div>
            </div>
            <DialogFooter className="!mx-0 !mb-0 mt-0 rounded-none border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
              <button type="button" onClick={() => setOpen(false)} disabled={isSubmitting} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50">ยกเลิก</button>
              <button type="submit" disabled={isSubmitting || !title.trim() || (isLabAssignment && (!labId || !maxScore))} className="min-h-11 rounded-lg bg-blue-600 px-4 font-extrabold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? "กำลังเพิ่ม..." : "เพิ่มงาน"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function NotificationPanel({
  notifications,
  unreadCount,
  isSubmitting,
  onMarkRead,
}: {
  notifications: ClassroomNotification[];
  unreadCount: number;
  isSubmitting: boolean;
  onMarkRead: () => void;
}) {
  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4" aria-labelledby="classroom-notifications-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="classroom-notifications-heading" className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-900">
          <Bell className="size-4" aria-hidden="true" />
          การแจ้งเตือน {unreadCount > 0 ? `(${unreadCount} ใหม่)` : ""}
        </h3>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={onMarkRead}
            disabled={isSubmitting}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-extrabold text-blue-700 hover:bg-blue-100 disabled:opacity-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
          >
            <CheckCheck className="size-3.5" aria-hidden="true" />
            อ่านแล้ว
          </button>
        ) : null}
      </div>
      <ul className="mt-2 grid gap-1.5">
        {notifications.slice(0, 5).map((notification) => (
          <li
            key={notification.id}
            className={`rounded-md px-3 py-2 text-xs font-bold leading-relaxed ${notification.readAt ? "bg-white/60 text-slate-600" : "bg-white text-blue-800"}`}
            role={notification.readAt ? undefined : "status"}
          >
            <span className="block font-extrabold">{notification.title}</span>
            {notification.message}
          </li>
        ))}
      </ul>
    </section>
  );
}

function FilePickerField({
  inputKey,
  label,
  files,
  helpText,
  onSelect,
}: {
  inputKey: number;
  label: string;
  files: File[];
  helpText: string;
  onSelect: (files: File[]) => void;
}) {
  return (
    <div className="grid min-w-0 gap-2 text-sm font-extrabold text-slate-800">
      <span>{label}</span>
      <label className="flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-blue-200 bg-white px-3 py-2 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-50 focus-within:ring-3 focus-within:ring-blue-100">
        <Upload className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate">{files.length > 0 ? `เลือกแล้ว ${files.length} ไฟล์` : "เลือกไฟล์"}</span>
        <input
          key={inputKey}
          type="file"
          multiple
          onChange={(event) => onSelect(Array.from(event.target.files ?? []))}
          className="sr-only"
        />
      </label>
      <span className="text-xs font-semibold leading-relaxed text-slate-500">{helpText}</span>
    </div>
  );
}

function SelectedFilesList({
  files,
  onRemove,
  onClear,
}: {
  files: File[];
  onRemove: (index: number) => void;
  onClear: () => void;
}) {
  if (files.length === 0) return null;
  return (
    <div className="min-w-0 rounded-lg border border-blue-100 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-extrabold text-slate-700">ไฟล์ที่เลือก {files.length} ไฟล์</p>
        <button type="button" onClick={onClear} className="text-xs font-extrabold text-rose-600 hover:text-rose-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-100">
          ล้างไฟล์
        </button>
      </div>
      <ul className="mt-2 grid gap-1.5">
        {files.map((file, index) => (
          <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex min-w-0 items-center gap-2 rounded-md bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-600">
            <span className="min-w-0 flex-1 break-all">{file.name}</span>
            <span className="shrink-0 text-slate-500">{formatFileSize(file.size)}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="grid size-7 shrink-0 place-items-center rounded-md text-slate-600 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-100"
              aria-label={`เอาไฟล์ ${file.name} ออก`}
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubmissionList({
  assignment,
  submissions,
  memberNameById,
  isSubmitting,
  requestedSubmissionId,
  onGrade,
}: {
  assignment: ClassroomAssignment;
  submissions: ClassroomAssignmentSubmission[];
  memberNameById: Map<string, string>;
  isSubmitting: boolean;
  requestedSubmissionId: string | null;
  onGrade: (submissionId: string, score: number) => Promise<boolean>;
}) {
  const [reviewing, setReviewing] = useState<ClassroomAssignmentSubmission | null>(
    () => assignment.labId ? submissions.find((submission) => submission.id === requestedSubmissionId) ?? null : null,
  );
  const [run, setRun] = useState<ClassroomExperimentRun | null>(null);
  const [score, setScore] = useState("");
  const isLoadingRun = Boolean(reviewing?.experimentRunId && !run);

  const openReview = useCallback((submission: ClassroomAssignmentSubmission) => {
    setReviewing(submission);
    setScore(submission.score?.toString() ?? "");
    setRun(null);
  }, []);

  useEffect(() => {
    if (!reviewing?.experimentRunId) return;
    let active = true;
    void getClassroomSubmissionExperimentRun(reviewing.id)
      .then((nextRun) => active && setRun(nextRun))
      .catch((error) => toast.error(error instanceof Error ? error.message : "โหลดผลการทดลองไม่สำเร็จ"));
    return () => { active = false; };
  }, [reviewing]);

  async function submitGrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewing) return;
    const saved = await onGrade(reviewing.id, Number(score));
    if (saved) setReviewing(null);
  }

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-extrabold text-slate-700">งานที่นักเรียนส่ง ({submissions.length})</p>
      {submissions.length === 0 ? (
        <p className="mt-2 text-xs font-semibold text-slate-500">ยังไม่มีนักเรียนส่งงานนี้</p>
      ) : (
        <ul className="mt-2 grid gap-2">
          {submissions.map((submission) => (
            <li key={submission.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-extrabold text-slate-900">{memberNameById.get(submission.studentId) ?? "นักเรียน"}</p>
                <p className="text-xs font-bold text-slate-500">{formatClassroomDate(submission.submittedAt)}</p>
              </div>
              {submission.note ? <p className="mt-2 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-slate-600">{submission.note}</p> : null}
              <AttachmentLinks linkUrls={submission.linkUrls} attachments={submission.attachments} />
              {assignment.labId ? (
                <button
                  type="button"
                  onClick={() => openReview(submission)}
                  className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-extrabold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                >
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  {submission.gradedAt ? `ตรวจแล้ว ${submission.score}/${assignment.maxScore}` : "ตรวจและให้คะแนน"}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <Dialog open={Boolean(reviewing)} onOpenChange={(nextOpen) => !nextOpen && setReviewing(null)}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-1rem)] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ตรวจผลการทดลอง</DialogTitle>
            <DialogDescription>
              {reviewing ? `${memberNameById.get(reviewing.studentId) ?? "นักเรียน"} · ${assignment.title}` : assignment.title}
            </DialogDescription>
          </DialogHeader>
          {isLoadingRun ? <p role="status" className="py-8 text-center text-sm font-semibold text-slate-600">กำลังโหลดผลการทดลอง...</p> : null}
          {run ? <ExperimentRunPreview run={run} /> : null}
          {reviewing?.note ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-extrabold text-slate-900">สรุปผลการทดลอง</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700">{reviewing.note}</p>
            </div>
          ) : null}
          {reviewing?.gradedAt ? (
            <p className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">ตรวจแล้ว {reviewing.score} / {assignment.maxScore} คะแนน</p>
          ) : (
            <form onSubmit={submitGrade} className="grid gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <label className="grid gap-2 text-sm font-extrabold text-slate-800">
                คะแนนที่ได้ (เต็ม {assignment.maxScore})
                <input
                  type="number"
                  min={0}
                  max={assignment.maxScore ?? 100}
                  step="0.5"
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                  required
                  autoFocus
                  className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 font-semibold outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </label>
              <button type="submit" disabled={isSubmitting || score === ""} className="min-h-11 rounded-lg bg-blue-600 px-4 font-extrabold text-white hover:bg-blue-700 disabled:opacity-50">
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกคะแนน"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssignmentSubmissionForm({
  assignment,
  existingSubmission,
  isSubmitting,
  onSubmit,
}: {
  assignment: ClassroomAssignment;
  existingSubmission: ClassroomAssignmentSubmission | null;
  isSubmitting: boolean;
  onSubmit: (input: SubmitClassroomAssignmentInput) => Promise<boolean>;
}) {
  if (assignment.labId) {
    return (
      <LabAssignmentSubmissionDialog
        assignment={assignment}
        existingSubmission={existingSubmission}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <GeneralAssignmentSubmissionForm
      assignment={assignment}
      existingSubmission={existingSubmission}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    />
  );
}

function GeneralAssignmentSubmissionForm({
  assignment,
  existingSubmission,
  isSubmitting,
  onSubmit,
}: {
  assignment: ClassroomAssignment;
  existingSubmission: ClassroomAssignmentSubmission | null;
  isSubmitting: boolean;
  onSubmit: (input: SubmitClassroomAssignmentInput) => Promise<boolean>;
}) {

  const [note, setNote] = useState(existingSubmission?.note ?? "");
  const [linkUrls, setLinkUrls] = useState(existingSubmission?.linkUrls.join("\n") ?? "");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSubmit({
      assignmentId: assignment.id,
      classroomId: assignment.classroomId,
      experimentRunId: null,
      note,
      linkUrls,
      attachmentFiles,
    });
    if (saved) {
      setAttachmentFiles([]);
      setAttachmentInputKey((key) => key + 1);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-extrabold text-blue-900">{existingSubmission ? "ส่งแล้ว แก้ไขได้" : "ส่งงานของคุณ"}</p>
        {existingSubmission ? <span className="text-xs font-bold text-blue-700">ส่งล่าสุด {formatClassroomDate(existingSubmission.submittedAt)}</span> : null}
      </div>
      <label className="grid gap-1.5 text-xs font-extrabold text-slate-700">
        หมายเหตุ
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={1000}
          rows={2}
          className="resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold leading-relaxed outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          placeholder="บอกคุณครูสั้น ๆ เกี่ยวกับงานที่ส่ง"
        />
      </label>
      <label className="grid gap-1.5 text-xs font-extrabold text-slate-700">
        ลิงก์ส่งงาน
        <textarea
          value={linkUrls}
          onChange={(event) => setLinkUrls(event.target.value)}
          maxLength={5000}
          rows={2}
          className="resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold leading-relaxed outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          placeholder="วางลิงก์ได้หลายอัน แยกบรรทัดละ 1 ลิงก์"
        />
      </label>
      <FilePickerField
        inputKey={attachmentInputKey}
        label="ไฟล์ส่งงาน"
        files={attachmentFiles}
        helpText="เลือกได้หลายไฟล์ รวมถึง PNG/JPG ไม่เกิน 10 MB ต่อไฟล์"
        onSelect={(files) => setAttachmentFiles((current) => mergeSelectedFiles(current, files))}
      />
      <SelectedFilesList
        files={attachmentFiles}
        onRemove={(index) => {
          setAttachmentFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
          setAttachmentInputKey((key) => key + 1);
        }}
        onClear={() => {
          setAttachmentFiles([]);
          setAttachmentInputKey((key) => key + 1);
        }}
      />
      {existingSubmission ? <AttachmentLinks linkUrls={existingSubmission.linkUrls} attachments={existingSubmission.attachments} /> : null}
      <button
        type="submit"
        disabled={isSubmitting || (!note.trim() && !linkUrls.trim() && attachmentFiles.length === 0)}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
      >
        <Upload className="size-4" aria-hidden="true" />
        {isSubmitting ? "กำลังส่ง..." : "ส่งงาน"}
      </button>
    </form>
  );
}

function LabAssignmentSubmissionDialog({
  assignment,
  existingSubmission,
  isSubmitting,
  onSubmit,
}: {
  assignment: ClassroomAssignment;
  existingSubmission: ClassroomAssignmentSubmission | null;
  isSubmitting: boolean;
  onSubmit: (input: SubmitClassroomAssignmentInput) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [runs, setRuns] = useState<ClassroomExperimentRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState(existingSubmission?.experimentRunId ?? "");
  const [conclusion, setConclusion] = useState(existingSubmission?.note ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const selectedRun = runs.find((run) => run.id === selectedRunId) ?? null;
  const isGraded = Boolean(existingSubmission?.gradedAt);

  useEffect(() => {
    if (!open || !assignment.labId) return;
    let active = true;
    void listMyExperimentRunsForLab(assignment.labId)
      .then((nextRuns) => {
        if (!active) return;
        setRuns(nextRuns);
        setSelectedRunId((current) => current || nextRuns[0]?.id || "");
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "โหลดผลการทดลองไม่สำเร็จ"))
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, [assignment.labId, open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSubmit({
      assignmentId: assignment.id,
      classroomId: assignment.classroomId,
      experimentRunId: selectedRunId,
      note: conclusion,
      linkUrls: "",
      attachmentFiles: [],
    });
    if (saved) setOpen(false);
  }

  return (
    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-blue-950">ผลการทดลองของคุณ</p>
          <p className="mt-1 text-xs font-semibold text-blue-700">
            {isGraded ? `ตรวจแล้ว ${existingSubmission?.score}/${assignment.maxScore} คะแนน` : existingSubmission ? "ส่งแล้ว และแก้ไขได้ก่อนคุณครูตรวจ" : "เลือกผลที่บันทึกไว้และเขียนสรุปก่อนส่ง"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setOpen(true);
          }}
          disabled={isGraded}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
        >
          <Upload className="size-4" aria-hidden="true" />
          {isGraded ? "ตรวจแล้ว" : existingSubmission ? "แก้ไขงาน" : "ส่งงาน"}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-3xl overflow-y-auto p-0">
          <DialogHeader className="border-b border-slate-100 px-5 py-4 pr-12 sm:px-6">
            <DialogTitle>ส่งผลการทดลอง</DialogTitle>
            <DialogDescription>{assignment.title} · คะแนนเต็ม {assignment.maxScore}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-5 px-5 pb-5 sm:px-6 sm:pb-6">
            <fieldset className="grid gap-3">
              <legend className="text-sm font-extrabold text-slate-900">ผลการทดลองที่บันทึกไว้</legend>
              {isLoading ? <p role="status" className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">กำลังโหลดผลการทดลอง...</p> : null}
              {!isLoading && runs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center">
                  <p className="text-sm font-bold text-slate-800">ยังไม่มีผลการทดลองที่บันทึกไว้</p>
                  <Link href={`/labs/${assignment.labId}/simulation`} className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white">ไปทดลองและบันทึกผล</Link>
                </div>
              ) : null}
              {runs.map((experimentRun) => (
                <label key={experimentRun.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${selectedRunId === experimentRun.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}>
                  <input type="radio" name={`run-${assignment.id}`} value={experimentRun.id} checked={selectedRunId === experimentRun.id} onChange={() => setSelectedRunId(experimentRun.id)} className="mt-1 size-4 accent-blue-600" />
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold text-slate-900">{experimentRun.title || labsById[experimentRun.lab_id]?.title || "ผลการทดลอง"}</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">บันทึกเมื่อ {formatClassroomDate(experimentRun.created_at)}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            {selectedRun ? <ExperimentRunPreview run={selectedRun} /> : null}
            <label className="grid gap-2 text-sm font-extrabold text-slate-900">
              สรุปผลการทดลอง <span className="text-xs font-semibold text-slate-500">20-1,000 ตัวอักษร</span>
              <textarea
                value={conclusion}
                onChange={(event) => setConclusion(event.target.value)}
                minLength={20}
                maxLength={1000}
                rows={5}
                required
                className="resize-y rounded-xl border border-slate-300 px-3 py-2 font-medium leading-relaxed outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                placeholder="อธิบายสิ่งที่สังเกตได้ ผลที่เกิดขึ้น และข้อสรุปจากการทดลอง"
              />
            </label>
            <DialogFooter>
              <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-lg border border-slate-300 px-4 font-extrabold text-slate-700">ยกเลิก</button>
              <button type="submit" disabled={isSubmitting || !selectedRunId || conclusion.trim().length < 20} className="min-h-11 rounded-lg bg-blue-600 px-5 font-extrabold text-white hover:bg-blue-700 disabled:opacity-50">
                {isSubmitting ? "กำลังส่ง..." : "ส่งงาน"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExperimentRunPreview({ run }: { run: ClassroomExperimentRun }) {
  const sections = [
    ["ตัวแปรที่ตั้งค่า", run.variables],
    ["ค่าที่วัดได้", run.live_values],
    ["สรุปข้อมูล", run.summary],
  ] as const;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="size-5 text-blue-600" aria-hidden="true" />
        <h3 className="text-sm font-extrabold text-slate-950">{labsById[run.lab_id]?.title || run.title || "ผลการทดลอง"}</h3>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {sections.map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-lg bg-white p-3">
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <ExperimentJsonValue value={value} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperimentJsonValue({ value }: { value: ClassroomExperimentRun["variables"] }) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return <p className="mt-1 break-words text-xs font-semibold text-slate-700">{String(value ?? "ไม่มีข้อมูล")}</p>;
  }
  const entries = Object.entries(value).slice(0, 12);
  if (entries.length === 0) return <p className="mt-1 text-xs font-semibold text-slate-500">ไม่มีข้อมูล</p>;
  return (
    <dl className="mt-2 grid gap-1.5">
      {entries.map(([key, item]) => (
        <div key={key} className="flex min-w-0 justify-between gap-2 text-xs">
          <dt className="min-w-0 break-words font-semibold text-slate-500">{key}</dt>
          <dd className="min-w-0 break-words text-right font-bold text-slate-800">{typeof item === "object" ? JSON.stringify(item) : String(item)}</dd>
        </div>
      ))}
    </dl>
  );
}

function AttachmentLinks({
  linkUrls,
  attachments,
}: {
  linkUrls: string[];
  attachments: ClassroomAssignment["attachments"];
}) {
  if (linkUrls.length === 0 && attachments.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {linkUrls.map((linkUrl, index) => (
        <a key={linkUrl} href={linkUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-extrabold text-blue-700 hover:bg-blue-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100">
          <Share2 className="size-3.5" aria-hidden="true" />
          เปิดลิงก์ {linkUrls.length > 1 ? index + 1 : ""}
        </a>
      ))}
      {attachments.map((attachment) => attachment.signedUrl ? (
        <a key={attachment.path} href={attachment.signedUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100">
          <Paperclip className="size-3.5" aria-hidden="true" />
          {attachment.name}
        </a>
      ) : null)}
    </div>
  );
}

function PeoplePanel({
  members,
  isCreator,
  onRemove,
}: {
  members: ClassroomMember[];
  isCreator: boolean;
  onRemove: (member: ClassroomMember) => void;
}) {
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
        <PeopleGroup title="คุณครูและผู้ดูแล" members={teacherMembers} emptyText="ยังไม่มีคุณครูในห้องนี้" isCreator={isCreator} onRemove={onRemove} />
        <PeopleGroup title="นักเรียน" members={studentMembers} emptyText="ยังไม่มีนักเรียนเข้าร่วมห้อง" isCreator={isCreator} onRemove={onRemove} />
      </div>
    </section>
  );
}

function PeopleGroup({
  title,
  members,
  emptyText,
  isCreator,
  onRemove,
}: {
  title: string;
  members: ClassroomMember[];
  emptyText: string;
  isCreator: boolean;
  onRemove: (member: ClassroomMember) => void;
}) {
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
              ) : isCreator ? (
                <button
                  type="button"
                  onClick={() => onRemove(member)}
                  className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 text-xs font-extrabold text-rose-700 transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-rose-100"
                >
                  <UserMinus className="size-3.5" aria-hidden="true" />
                  นำออก
                </button>
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

function RenameClassroomDialog({
  open,
  name,
  isSubmitting,
  onOpenChange,
  onNameChange,
  onSubmit,
}: {
  open: boolean;
  name: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">เปลี่ยนชื่อห้อง</DialogTitle>
            <DialogDescription>ชื่อใหม่จะแสดงให้สมาชิกทุกคนเห็น</DialogDescription>
          </DialogHeader>
          <label className="mt-5 grid gap-2 text-sm font-extrabold text-slate-800">
            ชื่อห้อง
            <input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              maxLength={80}
              required
              autoFocus
              className="min-h-11 rounded-lg border border-slate-300 px-3 font-semibold outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            />
          </label>
          <DialogFooter className="mt-5">
            <button type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting || !name.trim()} className="min-h-11 rounded-lg bg-blue-600 px-4 font-extrabold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? "กำลังบันทึก..." : "ยืนยัน"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-rose-700">{title}</DialogTitle>
          <DialogDescription className="leading-relaxed">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50">ยกเลิก</button>
          <button type="button" onClick={onConfirm} disabled={isSubmitting} className="min-h-11 rounded-lg bg-rose-600 px-4 font-extrabold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? "กำลังดำเนินการ..." : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatClassroomDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${size} B`;
}

function mergeSelectedFiles(currentFiles: File[], nextFiles: File[]) {
  const knownFiles = new Set(currentFiles.map(getFileIdentity));
  const merged = [...currentFiles];
  for (const file of nextFiles) {
    const identity = getFileIdentity(file);
    if (knownFiles.has(identity)) continue;
    knownFiles.add(identity);
    merged.push(file);
  }
  return merged.slice(0, 10);
}

function getFileIdentity(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function WorkspaceLoadingState() {
  return (
    <div role="status">
      <span className="sr-only">กำลังโหลดชั้นเรียน</span>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-8 lg:px-10 lg:py-7">
          <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-3 h-56 animate-pulse rounded-3xl bg-blue-100" />
          <div className="mt-3 h-10 w-72 max-w-full animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-10">
        <div className="h-12 animate-pulse border-b border-slate-200 bg-slate-100/60" />
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-60 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white" />
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
