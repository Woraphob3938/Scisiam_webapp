"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  UsersRound,
} from "lucide-react";

export type TeacherDashboardStatus = "loading" | "ready" | "error";

export interface TeacherClassroom {
  id: string;
  name: string;
  gradeLevel: string;
  students: number;
  assignmentCount: number;
  labCount: number;
  submissionCount: number;
  expectedSubmissionCount: number;
  pendingSubmissionCount: number;
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
  lastUpdatedAt: string;
  onRetry: () => void;
}

export default function TeacherDashboard({
  teacherName,
  status,
  errorMessage,
  classrooms,
  submissions,
  lastUpdatedAt,
  onRetry,
}: TeacherDashboardProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold leading-[1.35] text-slate-950">ภาพรวมการส่งงาน</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">
            สวัสดีค่ะ {teacherName} เปรียบเทียบการส่งงานจากห้องเรียนที่คุณดูแล
          </p>
          {lastUpdatedAt ? (
            <p className="mt-1 text-xs font-medium text-slate-500">อัปเดตล่าสุด {lastUpdatedAt}</p>
          ) : null}
        </div>
        <Link
          href="/classrooms"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
        >
          จัดการชั้นเรียน
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </header>

      {status === "loading" ? <DashboardLoading /> : null}
      {status === "error" ? <DashboardError message={errorMessage} onRetry={onRetry} /> : null}
      {status === "ready" && classrooms.length === 0 ? (
        <EmptyPanel
          title="ยังไม่มีห้องเรียนที่คุณสร้าง"
          description="สร้างชั้นเรียน เลือกห้องแล็บ และเชิญนักเรียนเพื่อเริ่มติดตามการส่งงาน"
          actionLabel="สร้างชั้นเรียน"
        />
      ) : null}
      {status === "ready" && classrooms.length > 0 ? (
        <div className="mt-6 space-y-6">
          <DashboardSummary classrooms={classrooms} />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <ClassroomComparison classrooms={classrooms} />
            <aside className="grid gap-5" aria-label="ข้อมูลสำหรับติดตาม">
              <FollowUpPanel classrooms={classrooms} />
              <RecentSubmissionPanel submissions={submissions} />
            </aside>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DashboardSummary({ classrooms }: { classrooms: TeacherClassroom[] }) {
  const totals = useMemo(
    () =>
      classrooms.reduce(
        (summary, room) => ({
          classrooms: summary.classrooms + 1,
          students: summary.students + room.students,
          submitted: summary.submitted + room.submissionCount,
          expected: summary.expected + room.expectedSubmissionCount,
        }),
        { classrooms: 0, students: 0, submitted: 0, expected: 0 },
      ),
    [classrooms],
  );
  const rate =
    totals.expected === 0
      ? 0
      : Math.min(100, Math.round((totals.submitted / totals.expected) * 100));

  return (
    <section
      className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-5"
      aria-label="สรุปการส่งงานทั้งหมด"
    >
      <SummaryValue label="ห้องเรียน" value={totals.classrooms.toLocaleString("th-TH")} />
      <SummaryValue label="นักเรียน" value={totals.students.toLocaleString("th-TH")} />
      <SummaryValue label="ส่งแล้ว" value={totals.submitted.toLocaleString("th-TH")} />
      <SummaryValue label="ควรส่ง" value={totals.expected.toLocaleString("th-TH")} />
      <SummaryValue label="อัตราการส่งรวม" value={`${rate}%`} emphasis />
    </section>
  );
}

function SummaryValue({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className={`bg-white px-5 py-4 ${emphasis ? "sm:col-span-2 xl:col-span-1" : ""}`}>
      <p className="text-xs font-medium text-slate-600">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${emphasis ? "text-blue-700" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}

function ClassroomComparison({ classrooms }: { classrooms: TeacherClassroom[] }) {
  return (
    <section aria-labelledby="classroom-comparison-heading">
      <div className="mb-4">
        <h2 id="classroom-comparison-heading" className="text-xl font-bold text-slate-950">
          เปรียบเทียบแต่ละห้องเรียน
        </h2>
        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
          ดูจำนวนที่ส่งแล้ว เทียบกับจำนวนที่ควรส่งในแต่ละห้อง
        </p>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
        <table className="w-full border-collapse">
          <caption className="sr-only">เปรียบเทียบผลการส่งงานของแต่ละห้องเรียน</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold text-slate-600">
              <th scope="col" className="px-5 py-3">ห้องเรียน</th>
              <th scope="col" className="px-3 py-3">นักเรียน</th>
              <th scope="col" className="px-3 py-3">งาน</th>
              <th scope="col" className="px-3 py-3">ส่งแล้ว / ควรส่ง</th>
              <th scope="col" className="px-3 py-3">ค้างส่ง</th>
              <th scope="col" className="px-3 py-3">อัตราการส่ง</th>
              <th scope="col" className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classrooms.map((room) => (
              <tr key={room.id} className="align-middle transition-colors hover:bg-slate-50/70">
                <th scope="row" className="max-w-60 px-5 py-4 text-left">
                  <span className="block truncate text-sm font-bold text-slate-950">{room.name}</span>
                  <span className="mt-1 block truncate text-xs font-medium text-slate-500">
                    {room.gradeLevel} · {room.labCount} แล็บ · {room.latestActivity}
                  </span>
                </th>
                <td className="px-3 py-4 text-sm font-bold text-slate-800">{room.students.toLocaleString("th-TH")}</td>
                <td className="px-3 py-4 text-sm font-bold text-slate-800">{room.assignmentCount.toLocaleString("th-TH")}</td>
                <td className="px-3 py-4 text-sm font-bold text-slate-800">
                  {room.submissionCount.toLocaleString("th-TH")} / {room.expectedSubmissionCount.toLocaleString("th-TH")}
                </td>
                <td className="px-3 py-4 text-sm font-bold text-slate-800">{room.pendingSubmissionCount.toLocaleString("th-TH")}</td>
                <td className="px-3 py-4"><SubmissionProgress room={room} /></td>
                <td className="px-5 py-4 text-right">
                  <ClassroomLink room={room} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:hidden">
        {classrooms.map((room) => (
          <li key={room.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="break-words text-base font-bold leading-relaxed text-slate-950">{room.name}</h3>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
              {room.gradeLevel} · {room.labCount} แล็บ · {room.latestActivity}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-100 py-4">
              <MobileMetric label="นักเรียน" value={room.students.toLocaleString("th-TH")} />
              <MobileMetric label="งาน" value={room.assignmentCount.toLocaleString("th-TH")} />
              <MobileMetric label="ส่งแล้ว / ควรส่ง" value={`${room.submissionCount.toLocaleString("th-TH")} / ${room.expectedSubmissionCount.toLocaleString("th-TH")}`} />
              <MobileMetric label="ค้างส่ง" value={room.pendingSubmissionCount.toLocaleString("th-TH")} />
            </dl>
            <div className="mt-4">
              <SubmissionProgress room={room} />
            </div>
            <div className="mt-4">
              <ClassroomLink room={room} fullWidth />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MobileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-bold text-slate-900">{value}</dd>
    </div>
  );
}

function SubmissionProgress({ room }: { room: TeacherClassroom }) {
  return (
    <div className="min-w-28">
      <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-700">
        <span>{room.submissionRate}%</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={`อัตราการส่งงานของ ${room.name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={room.submissionRate}
      >
        <span
          className="block h-full rounded-full bg-blue-600"
          style={{ width: `${room.submissionRate}%` }}
        />
      </div>
    </div>
  );
}

function ClassroomLink({ room, fullWidth = false }: { room: TeacherClassroom; fullWidth?: boolean }) {
  return (
    <Link
      href={room.href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${fullWidth ? "w-full border border-blue-100" : ""}`}
      aria-label={`เปิดชั้นเรียน ${room.name}`}
    >
      เปิดชั้นเรียน
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

function FollowUpPanel({ classrooms }: { classrooms: TeacherClassroom[] }) {
  const roomsToFollow = useMemo(
    () =>
      [...classrooms]
        .filter((room) => room.pendingSubmissionCount > 0)
        .sort(
          (left, right) =>
            right.pendingSubmissionCount - left.pendingSubmissionCount ||
            left.submissionRate - right.submissionRate,
        )
        .slice(0, 3),
    [classrooms],
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-labelledby="follow-up-heading">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 id="follow-up-heading" className="text-lg font-bold text-slate-950">ควรติดตาม</h2>
        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">เรียงจากจำนวนงานค้างมากที่สุด</p>
      </div>
      {roomsToFollow.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {roomsToFollow.map((room) => (
            <li key={room.id}>
              <Link href={room.href} className="block px-5 py-4 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-blue-100">
                <span className="block break-words text-sm font-bold text-slate-900">{room.name}</span>
                <span className="mt-1 block text-xs font-medium leading-relaxed text-slate-600">
                  ค้าง {room.pendingSubmissionCount.toLocaleString("th-TH")} รายการ · ส่งแล้ว {room.submissionRate}%
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-start gap-3 px-5 py-5 text-sm text-slate-600">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="font-medium leading-relaxed">ขณะนี้ไม่มีรายการค้างส่งที่ต้องติดตาม</p>
        </div>
      )}
    </section>
  );
}

function RecentSubmissionPanel({ submissions }: { submissions: TeacherSubmission[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-labelledby="recent-submissions-heading">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 id="recent-submissions-heading" className="text-lg font-bold text-slate-950">งานส่งล่าสุด</h2>
        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">เรียงจากเวลาที่ส่งล่าสุด</p>
      </div>
      {submissions.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {submissions.slice(0, 5).map((submission) => (
            <li key={submission.id}>
              <Link href={submission.href} className="block px-5 py-4 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-blue-100">
                <span className="block break-words text-sm font-bold leading-relaxed text-slate-900">{submission.assignmentTitle}</span>
                <span className="mt-1 block text-xs font-medium leading-relaxed text-slate-600">{submission.studentName} · {submission.room}</span>
                <span className="mt-1 block text-xs font-medium text-slate-500">{submission.submittedAt}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-5 text-sm font-medium leading-relaxed text-slate-600">ยังไม่มีงานที่นักเรียนส่งเข้ามา</p>
      )}
    </section>
  );
}

function DashboardLoading() {
  return (
    <div className="mt-6 space-y-6" role="status">
      <span className="sr-only">กำลังโหลดแดชบอร์ดคุณครู</span>
      <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="mt-6 rounded-2xl border border-rose-200 bg-white p-6 text-center" role="alert">
      <AlertTriangle className="mx-auto size-10 text-rose-500" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-bold text-slate-950">โหลดแดชบอร์ดไม่สำเร็จ</h2>
      <p className="mx-auto mt-2 max-w-xl break-words text-sm font-medium leading-relaxed text-slate-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        ลองใหม่
      </button>
    </section>
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
    <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <UsersRound className="mx-auto size-10 text-slate-400" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-bold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-600">{description}</p>
      <Link
        href="/classrooms"
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
      >
        {actionLabel}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
