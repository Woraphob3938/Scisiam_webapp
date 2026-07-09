"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  ClipboardCheck,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  UsersRound,
} from "lucide-react";

export type TeacherDashboardStatus = "loading" | "ready" | "error";
export type TeacherTab = "classrooms" | "submissions";

export interface TeacherClassroom {
  id: string;
  name: string;
  gradeLevel: string;
  students: number;
  assignmentCount: number;
  labCount: number;
  submissionRate: number;
  latestActivity: string;
  href: string;
}

export interface TeacherSubmission {
  id: string;
  studentName: string;
  room: string;
  assignmentTitle: string;
  submittedAt: string;
  href: string;
}

interface TeacherDashboardProps {
  teacherName: string;
  status: TeacherDashboardStatus;
  errorMessage: string;
  classrooms: TeacherClassroom[];
  submissions: TeacherSubmission[];
  onRetry: () => void;
}

export default function TeacherDashboard({
  teacherName,
  status,
  errorMessage,
  classrooms,
  submissions,
  onRetry,
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<TeacherTab>("classrooms");
  const metrics = useMemo(() => {
    const totalStudents = classrooms.reduce((total, room) => total + room.students, 0);
    const totalAssignments = classrooms.reduce((total, room) => total + room.assignmentCount, 0);
    const averageSubmissionRate =
      classrooms.length === 0
        ? 0
        : Math.round(classrooms.reduce((total, room) => total + room.submissionRate, 0) / classrooms.length);

    return [
      { label: "ห้องเรียนที่ดูแล", value: classrooms.length.toLocaleString("th-TH"), icon: UsersRound },
      { label: "นักเรียนทั้งหมด", value: totalStudents.toLocaleString("th-TH"), icon: BookOpenCheck },
      { label: "งานที่มอบหมาย", value: totalAssignments.toLocaleString("th-TH"), icon: ClipboardCheck },
      { label: "อัตราการส่งเฉลี่ย", value: `${averageSubmissionRate}%`, icon: LayoutDashboard },
    ];
  }, [classrooms]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8 lg:px-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-blue-600">TEACHER DASHBOARD</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-[1.35] text-slate-950">
              แดชบอร์ดคุณครู
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
              สวัสดีค่ะ {teacherName} ติดตามห้องเรียน งานที่มอบหมาย และการส่งงานล่าสุดจากข้อมูลจริงในระบบ
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/classrooms"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
            >
              <UsersRound className="h-4 w-4" aria-hidden="true" />
              ไปหน้าชั้นเรียน
            </Link>
            <Link
              href="/classrooms"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white shadow-md shadow-blue-500/15 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
            >
              จัดการห้องเรียน
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {status === "loading" ? <DashboardLoading /> : null}
      {status === "error" ? <DashboardError message={errorMessage} onRetry={onRetry} /> : null}

      {status === "ready" ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="ตัวชี้วัดแดชบอร์ดคุณครู">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-slate-500">{metric.label}</p>
                      <p className="mt-1 text-2xl font-extrabold text-slate-950">{metric.value}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <nav className="flex gap-2 overflow-x-auto" aria-label="มุมมองแดชบอร์ดคุณครู">
            {[
              { id: "classrooms", label: "ห้องเรียน", count: classrooms.length },
              { id: "submissions", label: "งานที่ส่งล่าสุด", count: submissions.length },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TeacherTab)}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-extrabold transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${
                    active ? "bg-blue-600 text-white shadow-md shadow-blue-500/15" : "bg-white text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>

          {activeTab === "classrooms" ? <ClassroomPanel classrooms={classrooms} /> : null}
          {activeTab === "submissions" ? <SubmissionPanel submissions={submissions} /> : null}
        </>
      ) : null}
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="status">
      <span className="sr-only">กำลังโหลดแดชบอร์ดคุณครู</span>
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
          <div className="h-4 w-24 rounded bg-slate-100" />
          <div className="mt-4 h-8 w-16 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="rounded-2xl border border-rose-200 bg-white p-6 text-center" role="alert">
      <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-extrabold text-slate-950">โหลดแดชบอร์ดไม่สำเร็จ</h2>
      <p className="mx-auto mt-2 max-w-xl break-words text-sm font-semibold leading-relaxed text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        ลองใหม่
      </button>
    </section>
  );
}

function ClassroomPanel({ classrooms }: { classrooms: TeacherClassroom[] }) {
  if (classrooms.length === 0) {
    return (
      <EmptyPanel
        title="ยังไม่มีห้องเรียนที่คุณสร้าง"
        description="ไปที่หน้าชั้นเรียนเพื่อสร้างห้องใหม่ เลือกแล็บ และเชิญนักเรียนเข้าร่วม"
        actionLabel="สร้างห้องเรียน"
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-extrabold text-slate-500 md:grid">
        <span>ห้องเรียน</span>
        <span>นักเรียน</span>
        <span>งาน</span>
        <span>ส่งงาน</span>
        <span className="text-right">จัดการ</span>
      </div>
      <div className="divide-y divide-slate-100">
        {classrooms.map((room) => (
          <article key={room.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1fr] md:items-center">
            <div className="min-w-0">
              <h3 className="truncate text-base font-extrabold text-slate-950">{room.name}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">{room.gradeLevel} · {room.labCount} แล็บ · {room.latestActivity}</p>
            </div>
            <MetricText label="นักเรียน" value={room.students.toLocaleString("th-TH")} />
            <MetricText label="งาน" value={room.assignmentCount.toLocaleString("th-TH")} />
            <MetricText label="ส่งงาน" value={`${room.submissionRate}%`} />
            <div className="flex justify-start md:justify-end">
              <Link
                href={room.href}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 text-sm font-extrabold text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
              >
                เปิดชั้นเรียน
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SubmissionPanel({ submissions }: { submissions: TeacherSubmission[] }) {
  if (submissions.length === 0) {
    return (
      <EmptyPanel
        title="ยังไม่มีงานที่นักเรียนส่ง"
        description="เมื่อนักเรียนส่งไฟล์หรือลิงก์ในงานชั้นเรียน รายการล่าสุดจะแสดงที่นี่"
        actionLabel="ไปหน้าชั้นเรียน"
      />
    );
  }

  return (
    <section className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
      {submissions.slice(0, 12).map((submission) => (
        <Link
          key={submission.id}
          href={submission.href}
          className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <h3 className="truncate text-base font-extrabold text-slate-950">{submission.assignmentTitle}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {submission.studentName} · {submission.room}
            </p>
          </div>
          <span className="text-sm font-bold text-slate-400">{submission.submittedAt}</span>
        </Link>
      ))}
    </section>
  );
}

function MetricText({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-400 md:hidden">{label}</p>
      <p className="text-sm font-extrabold text-slate-800">{value}</p>
    </div>
  );
}

function EmptyPanel({
  title,
  description,
  actionLabel,
}: {
  title: string;
  description: string;
  actionLabel: string;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <Loader2 className="mx-auto h-9 w-9 text-slate-300" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-extrabold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-relaxed text-slate-500">{description}</p>
      <Link
        href="/classrooms"
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
