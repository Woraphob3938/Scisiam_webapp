"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { clearScisiamAuthCache, SCISIAM_AUTH_EVENT } from "@/lib/supabase/auth-cache";
import {
  getClassroomAssignments,
  getClassroomAssignmentSubmissions,
  getClassroomMembers,
  listMyClassrooms,
  type ClassroomAssignment,
  type ClassroomAssignmentSubmission,
  type ClassroomMember,
  type ClassroomSummary,
} from "@/lib/supabase/classrooms";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

import TeacherDashboard, {
  type TeacherClassroom,
  type TeacherDashboardStatus,
  type TeacherSubmission,
} from "./TeacherDashboard";

const DEFAULT_TEACHER_NAME = "คุณครู";

function getTeacherNameSnapshot() {
  if (typeof window === "undefined") return DEFAULT_TEACHER_NAME;
  return localStorage.getItem("scisiam_user_name") || DEFAULT_TEACHER_NAME;
}

function subscribeTeacherName(onStoreChange: () => void) {
  window.addEventListener(SCISIAM_AUTH_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(SCISIAM_AUTH_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

type ClassroomBundle = {
  classroom: ClassroomSummary;
  assignments: ClassroomAssignment[];
  submissions: ClassroomAssignmentSubmission[];
  members: ClassroomMember[];
};

export default function TeacherDashboardSection() {
  const mountedRef = useRef(false);
  const teacherName = useSyncExternalStore(
    subscribeTeacherName,
    getTeacherNameSnapshot,
    () => DEFAULT_TEACHER_NAME,
  );
  const [status, setStatus] = useState<TeacherDashboardStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [classrooms, setClassrooms] = useState<TeacherClassroom[]>([]);
  const [submissions, setSubmissions] = useState<TeacherSubmission[]>([]);

  const loadDashboard = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");

    if (!isSupabaseConfigured()) {
      setClassrooms([]);
      setSubmissions([]);
      setStatus("ready");
      return;
    }

    try {
      const {
        data: { user },
      } = await createClient().auth.getUser();

      if (!user) {
        clearScisiamAuthCache({ emit: false });
        if (!mountedRef.current) return;
        setClassrooms([]);
        setSubmissions([]);
        setErrorMessage("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่เพื่อโหลดแดชบอร์ดคุณครู");
        setStatus("error");
        return;
      }

      const ownedClassrooms = (await listMyClassrooms()).filter((classroom) => classroom.isCreator);
      const bundles = await Promise.all(
        ownedClassrooms.map(async (classroom) => {
          const [assignments, classroomSubmissions, members] = await Promise.all([
            getClassroomAssignments(classroom.id),
            getClassroomAssignmentSubmissions(classroom.id),
            getClassroomMembers(classroom.id),
          ]);

          return {
            classroom,
            assignments,
            submissions: classroomSubmissions,
            members,
          };
        }),
      );

      if (!mountedRef.current) return;
      setClassrooms(bundles.map(toTeacherClassroom));
      setSubmissions(toTeacherSubmissions(bundles));
      setStatus("ready");
    } catch (error) {
      if (!mountedRef.current) return;
      setErrorMessage(error instanceof Error ? error.message : "โหลดข้อมูลแดชบอร์ดไม่สำเร็จ");
      setClassrooms([]);
      setSubmissions([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const timer = window.setTimeout(() => void loadDashboard(), 0);
    window.addEventListener(SCISIAM_AUTH_EVENT, loadDashboard);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(timer);
      window.removeEventListener(SCISIAM_AUTH_EVENT, loadDashboard);
    };
  }, [loadDashboard]);

  return (
    <TeacherDashboard
      teacherName={teacherName}
      status={status}
      errorMessage={errorMessage}
      classrooms={classrooms}
      submissions={submissions}
      onRetry={() => void loadDashboard()}
    />
  );
}

function toTeacherClassroom(bundle: ClassroomBundle): TeacherClassroom {
  const { classroom, assignments, submissions, members } = bundle;
  const studentCount = countStudents(classroom, members);
  const possibleSubmissions = assignments.length * Math.max(studentCount, 1);
  const submissionRate = possibleSubmissions === 0 ? 0 : Math.min(100, Math.round((submissions.length / possibleSubmissions) * 100));

  return {
    id: classroom.id,
    name: classroom.name,
    gradeLevel: classroom.gradeLevel,
    students: studentCount,
    assignmentCount: assignments.length,
    labCount: classroom.labIds.length,
    submissionRate,
    latestActivity: assignments[0]?.title ?? (classroom.labIds.length > 0 ? `${classroom.labIds.length} แล็บที่เลือกไว้` : "ยังไม่มีงาน"),
    href: `/classrooms/${classroom.id}?tab=classwork`,
  };
}

function toTeacherSubmissions(bundles: ClassroomBundle[]): TeacherSubmission[] {
  return bundles
    .flatMap((bundle) => {
      const assignmentById = new Map(bundle.assignments.map((assignment) => [assignment.id, assignment]));
      const memberById = new Map(bundle.members.map((member) => [member.userId, member]));

      return bundle.submissions.map((submission) => ({
        id: submission.id,
        studentName: memberById.get(submission.studentId)?.displayName ?? "นักเรียน",
        room: bundle.classroom.name,
        assignmentTitle: assignmentById.get(submission.assignmentId)?.title ?? "งานชั้นเรียน",
        submittedAt: formatThaiDateTime(submission.submittedAt),
        href: `/classrooms/${bundle.classroom.id}?tab=classwork`,
        sortAt: submission.submittedAt,
      }));
    })
    .sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime())
    .map((submission) => ({
      id: submission.id,
      studentName: submission.studentName,
      room: submission.room,
      assignmentTitle: submission.assignmentTitle,
      submittedAt: submission.submittedAt,
      href: submission.href,
    }));
}

function countStudents(classroom: ClassroomSummary, members: ClassroomMember[]) {
  const studentCount = members.filter((member) => member.role === "student").length;
  return studentCount > 0 ? studentCount : Math.max(0, classroom.memberCount - 1);
}

function formatThaiDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
