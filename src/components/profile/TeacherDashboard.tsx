"use client";

import Image from "next/image";
import {
  BarChart3,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  GraduationCap,
  Pencil,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

export type TeacherTab = "classrooms" | "submissions" | "stats" | "reviews";

export interface TeacherClassroom {
  id: number;
  name: string;
  students: number;
  files: number;
  deadline: string;
  status: string;
}

export interface TeacherSubmission {
  id: number;
  name: string;
  room: string;
  lab: string;
  status: string;
  time: string;
  deadline?: string;
}

export interface TeacherReview {
  id: number;
  name: string;
  room: string;
  lab: string;
  time: string;
  data: Record<string, string>;
}

export interface TeacherActivity {
  id: number;
  time: string;
  title: string;
  type: string;
}

interface TeacherDashboardProps {
  teacherName: string;
  tempTeacherName: string;
  isEditingTeacherName: boolean;
  activeTab: TeacherTab;
  classrooms: TeacherClassroom[];
  submissions: TeacherSubmission[];
  pendingReviews: TeacherReview[];
  teacherActivities: TeacherActivity[];
  onTempTeacherNameChange: (value: string) => void;
  onStartEditingName: () => void;
  onSaveTeacherName: () => void;
  onChangeAvatar: () => void;
  onTabChange: (tab: TeacherTab) => void;
  onCreateClassroom: () => void;
  onAssignExperiment: (room?: string) => void;
  onReviewReport: (review: TeacherReview) => void;
  onSendFeedback: (review: TeacherReview) => void;
  onDownload: (format: "PDF") => void;
}

type ClassroomStatus = "live" | "due" | "idle";

const classroomMetadata: Record<
  number,
  { code: string; latestLab: string; subject: string; rate: number }
> = {
  1: {
    code: "SCI-M401",
    latestLab: "Hooke's Law of Elasticity",
    subject: "ฟิสิกส์",
    rate: 86,
  },
  2: {
    code: "SCI-M402",
    latestLab: "Ohm's Law & DC Circuits",
    subject: "ฟิสิกส์",
    rate: 71,
  },
  3: {
    code: "SCI-M501",
    latestLab: "Newton's Law of Cooling",
    subject: "ฟิสิกส์",
    rate: 93,
  },
  4: {
    code: "SCI-M502",
    latestLab: "Photosynthesis Rate Chamber",
    subject: "ชีววิทยา",
    rate: 79,
  },
};

function classroomStatus(room: TeacherClassroom): ClassroomStatus {
  if (room.files === 0) return "idle";
  if (room.deadline.includes("2") || room.deadline.includes("วันนี้")) return "due";
  return "live";
}

function statusLabel(status: ClassroomStatus) {
  if (status === "due") return "ใกล้ครบกำหนด";
  if (status === "idle") return "ยังไม่มีงาน";
  return "กำลังเรียน";
}

function statusClasses(status: ClassroomStatus) {
  if (status === "due") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "idle") return "bg-slate-100 text-slate-500 border-slate-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function submissionStatusClasses(status: string) {
  if (status === "ส่งแล้ว") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "กำลังทำ") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

export default function TeacherDashboard({
  teacherName,
  tempTeacherName,
  isEditingTeacherName,
  activeTab,
  classrooms,
  submissions,
  pendingReviews,
  teacherActivities,
  onTempTeacherNameChange,
  onStartEditingName,
  onSaveTeacherName,
  onChangeAvatar,
  onTabChange,
  onCreateClassroom,
  onAssignExperiment,
  onReviewReport,
  onSendFeedback,
  onDownload,
}: TeacherDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ClassroomStatus>("all");

  const classroomRows = useMemo(
    () =>
      classrooms.map((room) => {
        const metadata = classroomMetadata[room.id] ?? {
          code: `SCI-NEW${String(room.id).padStart(2, "0")}`,
          latestLab: room.files > 0 ? "การทดลองล่าสุด" : "ยังไม่มีงาน",
          subject: "วิทยาศาสตร์",
          rate: room.files > 0 ? 65 : 0,
        };
        return {
          ...room,
          ...metadata,
          statusKey: classroomStatus(room),
        };
      }),
    [classrooms],
  );

  const filteredClassrooms = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("th");
    return classroomRows.filter((room) => {
      const matchesStatus = statusFilter === "all" || room.statusKey === statusFilter;
      const haystack = `${room.name} ${room.code} ${room.latestLab} ${room.subject}`.toLocaleLowerCase("th");
      return matchesStatus && (!query || haystack.includes(query));
    });
  }, [classroomRows, searchTerm, statusFilter]);

  const totalStudents = useMemo(
    () => classrooms.reduce((total, room) => total + room.students, 0),
    [classrooms],
  );
  const totalAssignments = useMemo(
    () => classrooms.reduce((total, room) => total + room.files, 0),
    [classrooms],
  );
  const averageSubmissionRate = useMemo(() => {
    const activeRooms = classroomRows.filter((room) => room.files > 0);
    if (activeRooms.length === 0) return 0;
    return Math.round(activeRooms.reduce((total, room) => total + room.rate, 0) / activeRooms.length);
  }, [classroomRows]);

  const recentAssignments = classroomRows.filter((room) => room.files > 0).slice(0, 4);

  const tabs: Array<{ id: TeacherTab; label: string; icon: typeof Users; badge?: number }> = [
    { id: "classrooms", label: "ภาพรวม", icon: BarChart3 },
    { id: "submissions", label: "การส่งงาน", icon: ClipboardCheck },
    { id: "stats", label: "ผลการเรียน", icon: GraduationCap },
    { id: "reviews", label: "งานรอตรวจ", icon: FileText, badge: pendingReviews.length },
  ];

  return (
    <div className="min-w-0 space-y-7 pb-8">
      <section className="flex flex-col gap-5 border-b border-slate-200 pb-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="relative hidden shrink-0 sm:block">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-blue-50">
              <Image
                src="/student_avatar_3d.png"
                alt="รูปโปรไฟล์คุณครู"
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={onChangeAvatar}
              className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="เปลี่ยนรูปโปรไฟล์คุณครู"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {isEditingTeacherName ? (
                <>
                  <input
                    type="text"
                    value={tempTeacherName}
                    onChange={(event) => onTempTeacherNameChange(event.target.value)}
                    maxLength={20}
                    className="min-h-10 w-full max-w-xs rounded-xl border border-slate-300 bg-white px-3 text-lg font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    aria-label="พิมพ์ชื่อคุณครูใหม่"
                  />
                  <button
                    type="button"
                    onClick={onSaveTeacherName}
                    className="min-h-10 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    บันทึก
                  </button>
                </>
              ) : (
                <>
                  <h1 className="break-words text-2xl font-extrabold leading-[1.35] text-slate-950 sm:text-3xl">
                    สวัสดีค่ะ {teacherName}
                  </h1>
                  <button
                    type="button"
                    onClick={onStartEditingName}
                    className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="แก้ไขชื่อคุณครู"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
              ภาพรวมสถานะห้องเรียน งานทดลอง และรายการที่ต้องติดตามวันนี้
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold leading-relaxed text-amber-700">
              <GraduationCap className="h-4 w-4 shrink-0" />
              <span>โหมดสาธิตสำหรับแข่งขัน ข้อมูลห้องเรียนยังเป็นตัวอย่างก่อนเชื่อมระบบจริง</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onDownload("PDF")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4" />
            ส่งออกรายงาน
          </button>
          <button
            type="button"
            onClick={onCreateClassroom}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            สร้างห้องเรียน
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="ตัวชี้วัดสำคัญของคุณครู">
        {[
          {
            label: "ห้องเรียนที่ดูแล",
            value: classrooms.length.toLocaleString("th-TH"),
            meta: `${classroomRows.filter((room) => room.files > 0).length} ห้องมีงานที่กำลังดำเนินอยู่`,
          },
          {
            label: "นักเรียนทั้งหมด",
            value: totalStudents.toLocaleString("th-TH"),
            meta: "รวมจากห้องเรียนที่ดูแล",
          },
          {
            label: "งานที่มอบหมายอยู่",
            value: totalAssignments.toLocaleString("th-TH"),
            meta: `${pendingReviews.length} รายงานรอตรวจ`,
          },
          {
            label: "อัตราการส่งงาน",
            value: `${averageSubmissionRate}%`,
            meta: "เฉลี่ยจากงานที่เปิดรับส่ง",
          },
        ].map((metric) => (
          <article
            key={metric.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <p className="text-xs font-semibold leading-relaxed text-slate-500 sm:text-sm">{metric.label}</p>
            <p className="mt-2 text-2xl font-extrabold leading-none text-slate-950 sm:text-3xl">{metric.value}</p>
            <p className="mt-2 text-[11px] font-medium leading-relaxed text-slate-500 sm:text-xs">{metric.meta}</p>
          </article>
        ))}
      </section>

      <nav
        className="grid grid-cols-4 border-b border-slate-200 sm:flex sm:gap-1 sm:overflow-x-auto"
        aria-label="มุมมองแดชบอร์ดคุณครู"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative inline-flex min-h-11 min-w-0 items-center justify-center gap-1 border-b-2 px-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset sm:shrink-0 sm:gap-2 sm:px-3 sm:text-sm ${
                isActive
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="hidden h-4 w-4 sm:block" />
              {tab.label}
              {tab.badge ? (
                <span className="rounded-full bg-rose-50 px-1 py-0.5 text-[9px] font-extrabold text-rose-600 sm:px-1.5 sm:text-[10px]">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {activeTab === "classrooms" ? (
        <OverviewTab
          classroomRows={classroomRows}
          filteredClassrooms={filteredClassrooms}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          recentAssignments={recentAssignments}
          pendingReviews={pendingReviews}
          teacherActivities={teacherActivities}
          onSearchTermChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onResetFilters={() => {
            setSearchTerm("");
            setStatusFilter("all");
          }}
          onAssignExperiment={onAssignExperiment}
          onReviewReport={onReviewReport}
          onSendFeedback={onSendFeedback}
          onShowAllReviews={() => onTabChange("reviews")}
        />
      ) : null}

      {activeTab === "submissions" ? <SubmissionsTab submissions={submissions} /> : null}

      {activeTab === "stats" ? (
        <StatsTab classroomRows={classroomRows} onDownload={onDownload} />
      ) : null}

      {activeTab === "reviews" ? (
        <ReviewsTab
          pendingReviews={pendingReviews}
          onReviewReport={onReviewReport}
          onSendFeedback={onSendFeedback}
        />
      ) : null}
    </div>
  );
}

interface ClassroomRow extends TeacherClassroom {
  code: string;
  latestLab: string;
  subject: string;
  rate: number;
  statusKey: ClassroomStatus;
}

interface OverviewTabProps {
  classroomRows: ClassroomRow[];
  filteredClassrooms: ClassroomRow[];
  searchTerm: string;
  statusFilter: "all" | ClassroomStatus;
  recentAssignments: ClassroomRow[];
  pendingReviews: TeacherReview[];
  teacherActivities: TeacherActivity[];
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: "all" | ClassroomStatus) => void;
  onResetFilters: () => void;
  onAssignExperiment: (room?: string) => void;
  onReviewReport: (review: TeacherReview) => void;
  onSendFeedback: (review: TeacherReview) => void;
  onShowAllReviews: () => void;
}

function OverviewTab({
  classroomRows,
  filteredClassrooms,
  searchTerm,
  statusFilter,
  recentAssignments,
  pendingReviews,
  teacherActivities,
  onSearchTermChange,
  onStatusFilterChange,
  onResetFilters,
  onAssignExperiment,
  onReviewReport,
  onSendFeedback,
  onShowAllReviews,
}: OverviewTabProps) {
  return (
    <div className="grid min-w-0 gap-7 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-8">
        <section aria-labelledby="teacher-classrooms-title">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 id="teacher-classrooms-title" className="text-xl font-extrabold leading-[1.4] text-slate-900">
                ห้องเรียนของฉัน
              </h2>
              <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
                {filteredClassrooms.length === classroomRows.length
                  ? `แสดง ${classroomRows.length} ห้องเรียน`
                  : `พบ ${filteredClassrooms.length} ห้องเรียนจากทั้งหมด ${classroomRows.length}`}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <label className="relative min-w-0 flex-1 lg:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => onSearchTermChange(event.target.value)}
                  placeholder="ค้นหาห้องเรียน วิชา หรือแล็บ"
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  aria-label="ค้นหาห้องเรียน"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => onStatusFilterChange(event.target.value as "all" | ClassroomStatus)}
                className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                aria-label="กรองห้องเรียนตามสถานะ"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="live">กำลังเรียน</option>
                <option value="due">ใกล้ครบกำหนด</option>
                <option value="idle">ยังไม่มีงาน</option>
              </select>
            </div>
          </div>

          {filteredClassrooms.length > 0 ? (
            <>
              <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">ห้องเรียน</th>
                      <th className="px-4 py-3">นักเรียน</th>
                      <th className="px-4 py-3">งานล่าสุด</th>
                      <th className="px-4 py-3">ส่งแล้ว</th>
                      <th className="px-4 py-3">สถานะ</th>
                      <th className="w-20 px-4 py-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClassrooms.map((room) => (
                      <tr key={room.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70">
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-800">{room.name} วิทยาศาสตร์</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">รหัสห้อง {room.code}</p>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-700">{room.students}</td>
                        <td className="max-w-[220px] px-4 py-3.5">
                          <p className="truncate font-semibold text-slate-700">{room.latestLab}</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">{room.subject}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          {room.files > 0 ? (
                            <div className="flex min-w-[110px] items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full bg-blue-600" style={{ width: `${room.rate}%` }} />
                              </div>
                              <span className="w-9 text-right text-xs font-bold text-slate-600">{room.rate}%</span>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses(room.statusKey)}`}>
                            {statusLabel(room.statusKey)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => onAssignExperiment(room.name)}
                            className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            สั่งงาน
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {filteredClassrooms.map((room) => (
                  <article key={room.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold leading-relaxed text-slate-800">{room.name} วิทยาศาสตร์</h3>
                        <p className="text-xs font-medium text-slate-500">รหัสห้อง {room.code}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold ${statusClasses(room.statusKey)}`}>
                        {statusLabel(room.statusKey)}
                      </span>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
                      <div>
                        <dt className="font-semibold text-slate-500">นักเรียน</dt>
                        <dd className="mt-1 font-bold text-slate-800">{room.students} คน</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-500">ส่งงานแล้ว</dt>
                        <dd className="mt-1 font-bold text-slate-800">{room.files > 0 ? `${room.rate}%` : "-"}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="font-semibold text-slate-500">งานล่าสุด</dt>
                        <dd className="mt-1 break-words font-bold leading-relaxed text-slate-800">{room.latestLab}</dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      onClick={() => onAssignExperiment(room.name)}
                      className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-xl border border-blue-200 bg-blue-50 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      มอบหมายงานเพิ่ม
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
              <Users className="mx-auto h-6 w-6 text-slate-400" />
              <h3 className="mt-3 text-sm font-bold text-slate-800">ไม่พบห้องเรียนที่ตรงกับตัวกรอง</h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">ลองเปลี่ยนคำค้นหา หรือเลือกดูทุกสถานะ</p>
              <button
                type="button"
                onClick={onResetFilters}
                className="mt-4 min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ล้างตัวกรอง
              </button>
            </div>
          )}
        </section>

        <section aria-labelledby="recent-assignments-title">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="recent-assignments-title" className="text-xl font-extrabold leading-[1.4] text-slate-900">
                งานทดลองที่มอบหมายล่าสุด
              </h2>
              <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
                ติดตามงานที่ยังเปิดรับส่งและกำหนดส่งใกล้ที่สุด
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAssignExperiment()}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ClipboardCheck className="h-4 w-4" />
              มอบหมายแล็บ
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
              {recentAssignments.map((room) => (
                <div
                  key={room.id}
                  className="grid gap-3 px-4 py-4 transition-colors hover:bg-slate-50/70 sm:grid-cols-[minmax(0,1fr)_160px_120px]"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold leading-relaxed text-slate-800">{room.latestLab}</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">{room.subject} · แบบบันทึกผลการทดลอง</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">ห้องเรียน</p>
                    <p className="mt-1 text-sm font-bold text-slate-700">{room.name}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs font-semibold text-slate-500">ส่งแล้ว</p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {Math.round((room.students * room.rate) / 100)} / {room.students}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-7" aria-label="ข้อมูลที่ต้องติดตาม">
          <section aria-labelledby="review-queue-title">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 id="review-queue-title" className="text-lg font-extrabold leading-[1.4] text-slate-900">
                รอตรวจและส่งคำแนะนำ
              </h2>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">เรียงจากงานที่ส่งล่าสุด</p>
            </div>
            <button
              type="button"
              onClick={onShowAllReviews}
              className="text-xs font-bold text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ดูทั้งหมด
            </button>
          </div>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {pendingReviews.slice(0, 3).map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">{review.lab}</p>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                      {review.room} · {review.name}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-xs font-extrabold text-amber-700">
                    รอตรวจ
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onReviewReport(review)}
                    className="min-h-9 flex-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    ดูรายงาน
                  </button>
                  <button
                    type="button"
                    onClick={() => onSendFeedback(review)}
                    className="min-h-9 flex-1 rounded-lg bg-blue-600 text-xs font-bold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    ส่งคำแนะนำ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="teacher-activity-title">
          <div className="mb-3">
            <h2 id="teacher-activity-title" className="text-lg font-extrabold leading-[1.4] text-slate-900">
              กิจกรรมล่าสุด
            </h2>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">การเปลี่ยนแปลงในพื้นที่ทำงานของคุณ</p>
          </div>
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            {teacherActivities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <div className="min-w-0">
                  <p className="break-words text-xs font-semibold leading-relaxed text-slate-700">{activity.title}</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function SubmissionsTab({ submissions }: { submissions: TeacherSubmission[] }) {
  return (
    <section aria-labelledby="submission-tracking-title">
      <div className="mb-4">
        <h2 id="submission-tracking-title" className="text-xl font-extrabold leading-[1.4] text-slate-900">
          ติดตามการส่งงาน
        </h2>
        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
          ดูสถานะการทำแล็บของนักเรียนและงานที่ต้องติดตามเพิ่มเติม
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-100">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="grid gap-3 px-4 py-4 transition-colors hover:bg-slate-50/70 md:grid-cols-[minmax(0,1fr)_minmax(180px,260px)_120px]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{submission.name}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{submission.room} · {submission.time}</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">การทดลอง</p>
                <p className="mt-1 truncate text-sm font-bold text-slate-700">{submission.lab}</p>
              </div>
              <div className="md:text-right">
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${submissionStatusClasses(submission.status)}`}>
                  {submission.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsTab({
  classroomRows,
  onDownload,
}: {
  classroomRows: ClassroomRow[];
  onDownload: (format: "PDF") => void;
}) {
  return (
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section aria-labelledby="class-performance-title">
        <div className="mb-4">
          <h2 id="class-performance-title" className="text-xl font-extrabold leading-[1.4] text-slate-900">
            ภาพรวมผลการเรียน
          </h2>
          <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
            เปรียบเทียบอัตราการส่งงานและความก้าวหน้าของแต่ละห้องเรียน
          </p>
        </div>
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
          {classroomRows.map((room) => (
            <div key={room.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">{room.name} วิทยาศาสตร์</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{room.latestLab}</p>
                </div>
                <span className="shrink-0 text-sm font-extrabold text-slate-700">{room.rate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${room.rate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside aria-labelledby="export-report-title">
        <div className="mb-4">
          <h2 id="export-report-title" className="text-lg font-extrabold leading-[1.4] text-slate-900">
            ดาวน์โหลดรายงาน
          </h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">ส่งออกข้อมูลสำหรับสรุปผลและนำเสนอ</p>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => onDownload("PDF")}
            className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FileText className="h-5 w-5 shrink-0 text-rose-500" />
            <span>
              <span className="block text-sm font-bold text-slate-800">รายงานภาพรวม PDF</span>
              <span className="mt-0.5 block text-xs font-medium text-slate-500">สำหรับสรุปผลรายสัปดาห์</span>
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
}

function ReviewsTab({
  pendingReviews,
  onReviewReport,
  onSendFeedback,
}: {
  pendingReviews: TeacherReview[];
  onReviewReport: (review: TeacherReview) => void;
  onSendFeedback: (review: TeacherReview) => void;
}) {
  return (
    <section aria-labelledby="pending-reviews-title">
      <div className="mb-4">
        <h2 id="pending-reviews-title" className="text-xl font-extrabold leading-[1.4] text-slate-900">
          รายงานรอการตรวจ
        </h2>
        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
          ตรวจผลการทดลองและส่งคำแนะนำกลับไปยังนักเรียน
        </p>
      </div>

      {pendingReviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" />
          <h3 className="mt-3 text-sm font-bold text-slate-800">ตรวจรายงานครบหมดแล้ว</h3>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">เมื่อมีรายงานใหม่ ระบบจะแสดงรายการที่นี่</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {pendingReviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-sm font-bold leading-relaxed text-slate-800">{review.lab}</p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    {review.name} · {review.room} · {review.time}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-xs font-extrabold text-amber-700">
                  รอตรวจ
                </span>
              </div>
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => onReviewReport(review)}
                  className="min-h-10 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  ดูรายงาน
                </button>
                <button
                  type="button"
                  onClick={() => onSendFeedback(review)}
                  className="min-h-10 flex-1 rounded-xl bg-blue-600 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  ส่งคำแนะนำ
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
