import type { GradeLevel } from "@/components/LabCard";
import { labsById } from "@/data/labs";

import { createClient } from "./client";
import type { Database, Json, ScisiamUserRole } from "./database.types";

type SupabaseClient = ReturnType<typeof createClient>;
type ClassroomRow = Database["public"]["Tables"]["classrooms"]["Row"];
type ClassroomMemberRow = Database["public"]["Tables"]["classroom_members"]["Row"];
type ClassroomLabRow = Database["public"]["Tables"]["classroom_labs"]["Row"];
type ClassroomAssignmentRow = Database["public"]["Tables"]["classroom_assignments"]["Row"];
type ClassroomSubmissionRow = Database["public"]["Tables"]["classroom_assignment_submissions"]["Row"];
type ExperimentRunRow = Database["public"]["Tables"]["experiment_runs"]["Row"];
type ClassroomNotificationRow = Database["public"]["Tables"]["classroom_notifications"]["Row"];
type ClassroomMemberRpcRow = Database["public"]["Functions"]["get_classroom_members"]["Returns"][number];
type ClassroomCreatorRpcRow = Database["public"]["Functions"]["get_classroom_creator_names"]["Returns"][number];

type VisibleClassroomRow = Pick<
  ClassroomRow,
  "id" | "creator_id" | "name" | "description" | "grade_level" | "is_active" | "created_at"
>;
type VisibleClassroomMemberRow = Pick<ClassroomMemberRow, "classroom_id" | "user_id">;
type VisibleClassroomLabRow = Pick<ClassroomLabRow, "classroom_id" | "lab_id" | "position">;

const CLASSROOM_ACCESS_ERROR = "ไม่พบห้องเรียนหรือคุณไม่มีสิทธิ์เข้าถึง";
const CLASSROOM_FILES_BUCKET = "classroom-files";
const CLASSROOM_FILE_SIZE_LIMIT = 10 * 1024 * 1024;
const CLASSROOM_FILE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);
const GRADE_LEVELS: readonly GradeLevel[] = [
  "ประถม",
  "มัธยมต้น",
  "มัธยมปลาย",
  "อุดมศึกษา",
];

export type ClassroomSummary = {
  id: string;
  creatorId: string;
  creatorName: string;
  name: string;
  description: string | null;
  gradeLevel: GradeLevel;
  isActive: boolean;
  createdAt: string;
  labIds: string[];
  memberCount: number;
  isCreator: boolean;
};

export type ClassroomDetail = ClassroomSummary;

export type ClassroomMember = {
  userId: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  avatarUpdatedAt: string;
  role: ScisiamUserRole;
  isCreator: boolean;
  joinedAt: string;
};

export type CreateClassroomInput = {
  name: string;
  gradeLevel: GradeLevel;
  description: string;
  labIds: string[];
};

export type ClassroomAssignment = {
  id: string;
  classroomId: string;
  createdBy: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  labId: string | null;
  maxScore: number | null;
  linkUrls: string[];
  attachments: ClassroomFileAttachment[];
  createdAt: string;
};

export type ClassroomFileAttachment = {
  path: string;
  name: string;
  mimeType: string | null;
  size: number | null;
  signedUrl: string | null;
};

export type CreateClassroomAssignmentInput = {
  title: string;
  description: string;
  dueAt: string | null;
  labId: string | null;
  maxScore: number | null;
  linkUrls: string;
  attachmentFiles: File[];
};

export type ClassroomAssignmentSubmission = {
  id: string;
  assignmentId: string;
  classroomId: string;
  studentId: string;
  experimentRunId: string | null;
  note: string | null;
  linkUrls: string[];
  attachments: ClassroomFileAttachment[];
  score: number | null;
  gradedBy: string | null;
  gradedAt: string | null;
  submittedAt: string;
  updatedAt: string;
};

export type SubmitClassroomAssignmentInput = {
  assignmentId: string;
  classroomId: string;
  experimentRunId: string | null;
  note: string;
  linkUrls: string;
  attachmentFiles: File[];
};

export type ClassroomExperimentRun = Pick<
  ExperimentRunRow,
  "id" | "lab_id" | "title" | "variables" | "live_values" | "graph_points" | "table_rows" | "summary" | "created_at"
>;

export type ClassroomNotification = {
  id: string;
  classroomId: string;
  assignmentId: string | null;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

export async function listMyClassrooms(): Promise<ClassroomSummary[]> {
  const supabase = createClient();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("classrooms")
    .select("id, creator_id, name, description, grade_level, is_active, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const classrooms = (data ?? []) as VisibleClassroomRow[];
  if (classrooms.length === 0) {
    return [];
  }

  const classroomIds = classrooms.map((classroom) => classroom.id);
  const [labRows, memberRows, creatorRows] = await Promise.all([
    selectClassroomLabs(supabase, classroomIds),
    selectClassroomMembers(supabase, classroomIds),
    selectClassroomCreatorNames(supabase, classroomIds),
  ]);

  return classrooms.map((classroom) =>
    buildClassroomSummary({
      classroom,
      currentUserId: userId,
      labRows,
      memberRows,
      creatorRows,
    }),
  );
}

export async function getClassroom(id: string): Promise<ClassroomDetail> {
  const supabase = createClient();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    throw new Error(CLASSROOM_ACCESS_ERROR);
  }

  return loadClassroomDetailById(supabase, userId, validateClassroomId(id));
}

export async function createClassroom(input: CreateClassroomInput): Promise<ClassroomDetail> {
  const normalizedName = input.name.trim();
  const normalizedDescription = input.description.trim();
  const normalizedLabIds = input.labIds.map((labId) => labId.trim());

  if (normalizedName.length < 1 || normalizedName.length > 80) {
    throw new Error("ชื่อห้องเรียนต้องมีความยาว 1-80 ตัวอักษร");
  }

  if (!isGradeLevel(input.gradeLevel)) {
    throw new Error("ระดับชั้นไม่ถูกต้อง");
  }

  if (normalizedLabIds.length < 1 || normalizedLabIds.length > 24) {
    throw new Error("กรุณาเลือกห้องทดลอง 1-24 รายการ");
  }

  const uniqueLabIds = new Set<string>();
  for (const labId of normalizedLabIds) {
    if (!labId || !labsById[labId]) {
      throw new Error("พบรหัสห้องทดลองที่ไม่อยู่ในรายการ Scisiam");
    }

    if (uniqueLabIds.has(labId)) {
      throw new Error("เลือกห้องทดลองซ้ำไม่ได้");
    }

    uniqueLabIds.add(labId);
  }

  const supabase = createClient();
  const userId = await requireCurrentUserId(supabase);
  const { data, error } = await supabase.rpc("create_classroom", {
    p_name: normalizedName,
    p_grade_level: input.gradeLevel,
    p_description: normalizedDescription || null,
    p_lab_ids: normalizedLabIds,
  });

  if (error) {
    throw new Error(error.message);
  }

  const classroomId = readRpcClassroomId(data);
  if (!classroomId) {
    throw new Error("ไม่สามารถสร้างห้องเรียนได้ในขณะนี้");
  }

  return loadClassroomDetailById(supabase, userId, classroomId);
}

export async function joinClassroom(code: string): Promise<ClassroomDetail> {
  const supabase = createClient();
  const userId = await requireCurrentUserId(supabase);
  const { data, error } = await supabase.rpc("join_classroom", {
    p_code: normalizeClassroomCode(code),
  });

  if (error) {
    throw new Error(error.message);
  }

  const classroomId = readRpcClassroomId(data);
  if (!classroomId) {
    throw new Error(CLASSROOM_ACCESS_ERROR);
  }

  return loadClassroomDetailById(supabase, userId, classroomId);
}

export async function getClassroomJoinCode(id: string): Promise<string | null> {
  const supabase = createClient();
  await requireCurrentUserId(supabase);
  const classroomId = validateClassroomId(id);

  const { data, error } = await supabase.rpc("get_classroom_join_code", {
    p_classroom_id: classroomId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getClassroomMembers(id: string): Promise<ClassroomMember[]> {
  const supabase = createClient();
  await requireCurrentUserId(supabase);
  const classroomId = validateClassroomId(id);

  const { data, error } = await supabase.rpc("get_classroom_members", {
    p_classroom_id: classroomId,
  });

  if (error) {
    if (error.code === "42501" || error.code === "P0002") {
      throw new Error(CLASSROOM_ACCESS_ERROR);
    }
    throw new Error(error.message);
  }

  return (data ?? []).map((member) => mapClassroomMember(member));
}

export async function renameClassroom(id: string, name: string): Promise<string> {
  const normalizedName = name.trim();
  if (normalizedName.length < 1 || normalizedName.length > 80) {
    throw new Error("ชื่อห้องเรียนต้องมีความยาว 1-80 ตัวอักษร");
  }

  const supabase = createClient();
  await requireCurrentUserId(supabase);
  const { data, error } = await supabase.rpc("rename_classroom", {
    p_classroom_id: validateClassroomId(id),
    p_name: normalizedName,
  });

  if (error) throwClassroomActionError(error.code, error.message);
  return data ?? normalizedName;
}

export async function disbandClassroom(id: string): Promise<void> {
  const supabase = createClient();
  await requireCurrentUserId(supabase);
  const { error } = await supabase.rpc("disband_classroom", {
    p_classroom_id: validateClassroomId(id),
  });

  if (error) throwClassroomActionError(error.code, error.message);
}

export async function removeClassroomMember(id: string, userId: string): Promise<void> {
  const supabase = createClient();
  await requireCurrentUserId(supabase);
  const { data, error } = await supabase.rpc("remove_classroom_member", {
    p_classroom_id: validateClassroomId(id),
    target_user_id: validateUserId(userId),
  });

  if (error) throwClassroomActionError(error.code, error.message);
  if (!data) throw new Error("ไม่พบสมาชิกที่ต้องการนำออก");
}

export async function getClassroomAssignments(id: string): Promise<ClassroomAssignment[]> {
  const supabase = createClient();
  await requireCurrentUserId(supabase);
  const classroomId = validateClassroomId(id);
  const { data, error } = await supabase
    .from("classroom_assignments")
    .select("id, classroom_id, created_by, title, description, due_at, lab_id, max_score, link_url, attachment_path, attachment_name, attachment_mime_type, attachment_size, link_urls, attachments, created_at")
    .eq("classroom_id", classroomId)
    .order("created_at", { ascending: false });

  if (error) throwClassroomActionError(error.code, error.message);
  return Promise.all(((data ?? []) as ClassroomAssignmentRow[]).map((assignment) => mapClassroomAssignment(supabase, assignment)));
}

export async function createClassroomAssignment(
  id: string,
  input: CreateClassroomAssignmentInput,
): Promise<string> {
  const title = input.title.trim();
  const description = input.description.trim();
  if (title.length < 1 || title.length > 120) {
    throw new Error("ชื่องานต้องมีความยาว 1-120 ตัวอักษร");
  }
  if (description.length > 1000) {
    throw new Error("รายละเอียดงานต้องไม่เกิน 1,000 ตัวอักษร");
  }
  if ((input.labId === null) !== (input.maxScore === null)) {
    throw new Error("งานห้องแล็บต้องระบุห้องแล็บและคะแนนเต็มให้ครบ");
  }
  if (input.labId && !labsById[input.labId]) {
    throw new Error("ไม่พบห้องแล็บที่เลือก");
  }
  if (input.maxScore !== null && (!Number.isInteger(input.maxScore) || input.maxScore < 1 || input.maxScore > 100)) {
    throw new Error("คะแนนเต็มต้องเป็นจำนวนเต็ม 1-100 คะแนน");
  }

  const supabase = createClient();
  const userId = await requireCurrentUserId(supabase);
  const classroomId = validateClassroomId(id);
  const linkUrls = normalizeOptionalUrls(input.linkUrls, "ลิงก์งาน");
  const uploaded = await uploadClassroomFiles(supabase, classroomId, userId, input.attachmentFiles);

  const { data, error } = await supabase.rpc("create_classroom_assignment", {
    p_classroom_id: classroomId,
    p_title: title,
    p_description: description || null,
    p_due_at: input.dueAt,
    p_lab_id: input.labId,
    p_max_score: input.maxScore,
    p_link_urls: linkUrls,
    p_attachments: uploaded.map(toAttachmentJson),
  });

  if (error) {
    await removeClassroomFiles(supabase, uploaded.map((file) => file.path));
    throwClassroomActionError(error.code, error.message);
  }
  if (!data) throw new Error("ไม่สามารถเพิ่มงานได้ในขณะนี้");
  return data;
}

export async function deleteClassroomAssignment(assignmentId: string): Promise<void> {
  const supabase = createClient();
  await requireCurrentUserId(supabase);
  const safeAssignmentId = validateUuid(assignmentId, "ไม่พบงานที่ต้องการลบ");
  const { data: assignment, error: assignmentError } = await supabase
    .from("classroom_assignments")
    .select("attachments, attachment_path, attachment_name, attachment_mime_type, attachment_size")
    .eq("id", safeAssignmentId)
    .maybeSingle();

  if (assignmentError) throwClassroomActionError(assignmentError.code, assignmentError.message);
  const { data, error } = await supabase.rpc("delete_classroom_assignment", {
    p_assignment_id: safeAssignmentId,
  });

  if (error) throwClassroomActionError(error.code, error.message);
  if (!data) throw new Error("ลบงานไม่สำเร็จ");

  if (assignment) {
    await removeClassroomFiles(supabase, attachmentPaths(assignment.attachments, assignment));
  }
}

export async function getClassroomAssignmentSubmissions(id: string): Promise<ClassroomAssignmentSubmission[]> {
  const supabase = createClient();
  await requireCurrentUserId(supabase);
  const classroomId = validateClassroomId(id);
  const { data, error } = await supabase
    .from("classroom_assignment_submissions")
    .select("id, assignment_id, classroom_id, student_id, experiment_run_id, note, link_url, attachment_path, attachment_name, attachment_mime_type, attachment_size, link_urls, attachments, score, graded_by, graded_at, submitted_at, updated_at")
    .eq("classroom_id", classroomId)
    .order("submitted_at", { ascending: false });

  if (error) throwClassroomActionError(error.code, error.message);
  return Promise.all(((data ?? []) as ClassroomSubmissionRow[]).map((submission) => mapClassroomSubmission(supabase, submission)));
}

export async function submitClassroomAssignment(input: SubmitClassroomAssignmentInput): Promise<string> {
  const supabase = createClient();
  const userId = await requireCurrentUserId(supabase);
  const classroomId = validateClassroomId(input.classroomId);
  const assignmentId = validateUuid(input.assignmentId, "ไม่พบงานที่ต้องการส่ง");
  const note = input.note.trim();
  const linkUrls = normalizeOptionalUrls(input.linkUrls, "ลิงก์ส่งงาน");
  const { data: existingSubmission, error: existingSubmissionError } = await supabase
    .from("classroom_assignment_submissions")
    .select("attachments, attachment_path, attachment_name, attachment_mime_type, attachment_size")
    .eq("assignment_id", assignmentId)
    .eq("student_id", userId)
    .maybeSingle();

  if (existingSubmissionError) {
    throwClassroomActionError(existingSubmissionError.code, existingSubmissionError.message);
  }
  const uploaded = await uploadClassroomFiles(supabase, classroomId, userId, input.attachmentFiles);

  if (!note && linkUrls.length === 0 && uploaded.length === 0) {
    throw new Error("กรุณาแนบไฟล์ วางลิงก์ หรือเขียนหมายเหตุอย่างน้อยหนึ่งอย่าง");
  }

  const { data, error } = await supabase.rpc("submit_classroom_assignment", {
    p_assignment_id: assignmentId,
    p_experiment_run_id: input.experimentRunId,
    p_note: note || null,
    p_link_urls: linkUrls,
    p_attachments: uploaded.map(toAttachmentJson),
  });

  if (error) {
    await removeClassroomFiles(supabase, uploaded.map((file) => file.path));
    throwClassroomActionError(error.code, error.message);
  }
  if (!data) throw new Error("ส่งงานไม่สำเร็จ");

  if (existingSubmission) {
    await removeClassroomFiles(
      supabase,
      attachmentPaths(existingSubmission.attachments, existingSubmission),
    );
  }
  return data;
}

export async function listMyExperimentRunsForLab(labIdValue: string): Promise<ClassroomExperimentRun[]> {
  const labId = labIdValue.trim();
  if (!labsById[labId]) throw new Error("ไม่พบห้องแล็บที่เลือก");

  const supabase = createClient();
  const userId = await requireCurrentUserId(supabase);
  const { data, error } = await supabase
    .from("experiment_runs")
    .select("id, lab_id, title, variables, live_values, graph_points, table_rows, summary, created_at")
    .eq("lab_id", labId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throwClassroomActionError(error.code, error.message);
  return (data ?? []) as ClassroomExperimentRun[];
}

export async function gradeClassroomAssignmentSubmission(
  submissionId: string,
  score: number,
): Promise<string> {
  if (!Number.isFinite(score) || score < 0) throw new Error("คะแนนต้องเป็นศูนย์หรือมากกว่า");

  const supabase = createClient();
  await requireCurrentUserId(supabase);
  const { data, error } = await supabase.rpc("grade_classroom_assignment_submission", {
    p_submission_id: validateUuid(submissionId, "ไม่พบงานที่ต้องการตรวจ"),
    p_score: score,
  });

  if (error) throwClassroomActionError(error.code, error.message);
  if (!data) throw new Error("บันทึกคะแนนไม่สำเร็จ");
  return data;
}

export async function getClassroomSubmissionExperimentRun(
  submissionId: string,
): Promise<ClassroomExperimentRun> {
  const supabase = createClient();
  await requireCurrentUserId(supabase);
  const { data, error } = await supabase.rpc("get_classroom_submission_experiment_run", {
    p_submission_id: validateUuid(submissionId, "ไม่พบผลการทดลองที่ส่ง"),
  });

  if (error) throwClassroomActionError(error.code, error.message);
  if (!isJsonObject(data) || typeof data.id !== "string" || typeof data.lab_id !== "string") {
    throw new Error("ไม่พบผลการทดลองที่ส่ง");
  }
  return data as ClassroomExperimentRun;
}

export async function getClassroomNotifications(id: string): Promise<ClassroomNotification[]> {
  const supabase = createClient();
  await requireCurrentUserId(supabase);
  const classroomId = validateClassroomId(id);
  const { data, error } = await supabase
    .from("classroom_notifications")
    .select("id, classroom_id, assignment_id, title, message, read_at, created_at")
    .eq("classroom_id", classroomId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throwClassroomActionError(error.code, error.message);
  return ((data ?? []) as ClassroomNotificationRow[]).map(mapClassroomNotification);
}

export async function listMyClassroomNotifications(limit = 10): Promise<ClassroomNotification[]> {
  const supabase = createClient();
  const safeLimit = Math.max(1, Math.min(limit, 20));
  const { data, error } = await supabase
    .from("classroom_notifications")
    .select("id, classroom_id, assignment_id, title, message, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) throwClassroomActionError(error.code, error.message);
  return ((data ?? []) as ClassroomNotificationRow[]).map(mapClassroomNotification);
}

export async function markClassroomNotificationsRead(id: string): Promise<void> {
  const supabase = createClient();
  await requireCurrentUserId(supabase);
  const { error } = await supabase.rpc("mark_classroom_notifications_read", {
    p_classroom_id: validateClassroomId(id),
  });

  if (error) throwClassroomActionError(error.code, error.message);
}

async function loadClassroomDetailById(
  supabase: SupabaseClient,
  currentUserId: string,
  classroomId: string,
): Promise<ClassroomDetail> {
  const { data, error } = await supabase
    .from("classrooms")
    .select("id, creator_id, name, description, grade_level, is_active, created_at")
    .eq("id", classroomId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(CLASSROOM_ACCESS_ERROR);
  }

  const [labRows, memberRows, creatorRows] = await Promise.all([
    selectClassroomLabs(supabase, [classroomId]),
    selectClassroomMembers(supabase, [classroomId]),
    selectClassroomCreatorNames(supabase, [classroomId]),
  ]);

  return buildClassroomSummary({
    classroom: data as VisibleClassroomRow,
    currentUserId,
    labRows,
    memberRows,
    creatorRows,
  });
}

async function selectClassroomLabs(
  supabase: SupabaseClient,
  classroomIds: string[],
): Promise<VisibleClassroomLabRow[]> {
  if (classroomIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("classroom_labs")
    .select("classroom_id, lab_id, position")
    .in("classroom_id", classroomIds)
    .order("position", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as VisibleClassroomLabRow[];
}

async function selectClassroomMembers(
  supabase: SupabaseClient,
  classroomIds: string[],
): Promise<VisibleClassroomMemberRow[]> {
  if (classroomIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("classroom_members")
    .select("classroom_id, user_id")
    .in("classroom_id", classroomIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as VisibleClassroomMemberRow[];
}

async function selectClassroomCreatorNames(
  supabase: SupabaseClient,
  classroomIds: string[],
): Promise<ClassroomCreatorRpcRow[]> {
  if (classroomIds.length === 0) return [];

  const { data, error } = await supabase.rpc("get_classroom_creator_names", {
    p_classroom_ids: classroomIds,
  });

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function getCurrentUserId(supabase: SupabaseClient): Promise<string | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return user?.id ?? null;
  } catch (error) {
    if (isSupabaseNetworkError(error)) {
      return null;
    }

    throw error;
  }
}

async function requireCurrentUserId(supabase: SupabaseClient): Promise<string> {
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    throw new Error("กรุณาเข้าสู่ระบบเพื่อใช้งานห้องเรียน");
  }

  return userId;
}

function isSupabaseNetworkError(error: unknown): boolean {
  return error instanceof TypeError || (error instanceof Error && /failed to fetch/i.test(error.message));
}

function buildClassroomSummary(input: {
  classroom: VisibleClassroomRow;
  currentUserId: string;
  labRows: VisibleClassroomLabRow[];
  memberRows: VisibleClassroomMemberRow[];
  creatorRows: ClassroomCreatorRpcRow[];
}): ClassroomSummary {
  const { classroom, currentUserId, labRows, memberRows, creatorRows } = input;

  return {
    id: classroom.id,
    creatorId: classroom.creator_id,
    creatorName: creatorRows.find((row) => row.classroom_id === classroom.id)?.display_name ?? "ผู้สร้างห้อง",
    name: classroom.name,
    description: classroom.description,
    gradeLevel: normalizeGradeLevel(classroom.grade_level),
    isActive: classroom.is_active,
    createdAt: classroom.created_at,
    labIds: labRows
      .filter((row) => row.classroom_id === classroom.id)
      .map((row) => row.lab_id),
    memberCount: memberRows.filter((row) => row.classroom_id === classroom.id).length,
    isCreator: classroom.creator_id === currentUserId,
  };
}

function normalizeGradeLevel(value: string | null): GradeLevel {
  if (isGradeLevel(value)) {
    return value;
  }

  // Legacy rows may still carry a nullable grade level until data cleanup finishes.
  return "มัธยมต้น";
}

function mapClassroomMember(member: ClassroomMemberRpcRow): ClassroomMember {
  return {
    userId: member.user_id,
    displayName: member.display_name,
    email: member.email,
    avatarUrl: member.avatar_url,
    avatarUpdatedAt: member.avatar_updated_at,
    role: member.role,
    isCreator: member.is_creator,
    joinedAt: member.joined_at,
  };
}

async function mapClassroomAssignment(supabase: SupabaseClient, assignment: ClassroomAssignmentRow): Promise<ClassroomAssignment> {
  return {
    id: assignment.id,
    classroomId: assignment.classroom_id,
    createdBy: assignment.created_by,
    title: assignment.title,
    description: assignment.description,
    dueAt: assignment.due_at,
    labId: assignment.lab_id,
    maxScore: assignment.max_score,
    linkUrls: normalizeStoredLinks(assignment.link_urls, assignment.link_url),
    attachments: await buildAttachments(supabase, assignment.attachments, {
      path: assignment.attachment_path,
      name: assignment.attachment_name,
      mimeType: assignment.attachment_mime_type,
      size: assignment.attachment_size,
    }),
    createdAt: assignment.created_at,
  };
}

async function mapClassroomSubmission(
  supabase: SupabaseClient,
  submission: ClassroomSubmissionRow,
): Promise<ClassroomAssignmentSubmission> {
  return {
    id: submission.id,
    assignmentId: submission.assignment_id,
    classroomId: submission.classroom_id,
    studentId: submission.student_id,
    experimentRunId: submission.experiment_run_id,
    note: submission.note,
    linkUrls: normalizeStoredLinks(submission.link_urls, submission.link_url),
    attachments: await buildAttachments(supabase, submission.attachments, {
      path: submission.attachment_path,
      name: submission.attachment_name,
      mimeType: submission.attachment_mime_type,
      size: submission.attachment_size,
    }),
    score: submission.score,
    gradedBy: submission.graded_by,
    gradedAt: submission.graded_at,
    submittedAt: submission.submitted_at,
    updatedAt: submission.updated_at,
  };
}

function mapClassroomNotification(notification: ClassroomNotificationRow): ClassroomNotification {
  return {
    id: notification.id,
    classroomId: notification.classroom_id,
    assignmentId: notification.assignment_id,
    title: notification.title,
    message: notification.message,
    readAt: notification.read_at,
    createdAt: notification.created_at,
  };
}

async function buildAttachments(
  supabase: SupabaseClient,
  storedValue: Json | undefined,
  legacy: { path: string | null; name: string | null; mimeType: string | null; size: number | null },
): Promise<ClassroomFileAttachment[]> {
  const attachments = normalizeStoredAttachments(storedValue);
  if (attachments.length === 0 && legacy.path && legacy.name) {
    attachments.push({ path: legacy.path, name: legacy.name, mimeType: legacy.mimeType, size: legacy.size });
  }

  return Promise.all(
    attachments.map(async (attachment) => ({
      ...attachment,
      signedUrl: await createClassroomFileUrl(supabase, attachment.path),
    })),
  );
}

async function uploadClassroomFiles(
  supabase: SupabaseClient,
  classroomId: string,
  userId: string,
  files: File[],
): Promise<Omit<ClassroomFileAttachment, "signedUrl">[]> {
  if (files.length > 10) {
    throw new Error("อัปโหลดไฟล์ได้ไม่เกิน 10 ไฟล์ต่อครั้ง");
  }

  for (const file of files) {
    validateClassroomFile(file);
  }

  const uploaded: Omit<ClassroomFileAttachment, "signedUrl">[] = [];
  try {
    for (const file of files) {
      uploaded.push(await uploadClassroomFile(supabase, classroomId, userId, file));
    }
  } catch (error) {
    await removeClassroomFiles(supabase, uploaded.map((file) => file.path));
    throw error;
  }

  return uploaded;
}

async function uploadClassroomFile(
  supabase: SupabaseClient,
  classroomId: string,
  userId: string,
  file: File,
): Promise<Omit<ClassroomFileAttachment, "signedUrl">> {
  const path = `classrooms/${classroomId}/${userId}/${crypto.randomUUID()}${getSafeFileExtension(file.name)}`;
  const { error } = await supabase.storage.from(CLASSROOM_FILES_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) throw new Error(error.message);
  return {
    path,
    name: file.name,
    mimeType: file.type || null,
    size: file.size,
  };
}

function validateClassroomFile(file: File) {
  if (file.size <= 0) {
    throw new Error(`ไฟล์ ${file.name || "ที่เลือก"} ไม่มีข้อมูล`);
  }
  if (file.size > CLASSROOM_FILE_SIZE_LIMIT) {
    throw new Error(`ไฟล์ ${file.name || "ที่เลือก"} ต้องมีขนาดไม่เกิน 10 MB`);
  }
  if (!CLASSROOM_FILE_MIME_TYPES.has(file.type)) {
    throw new Error(`ไฟล์ ${file.name || "ที่เลือก"} ไม่ใช่ชนิดไฟล์ที่รองรับ`);
  }
}

function getSafeFileExtension(fileName: string) {
  const extension = fileName.match(/\.([a-z0-9]{1,12})$/i)?.[0]?.toLowerCase();
  return extension ? extension.replace(/[^a-z0-9.]/g, "") : "";
}

async function removeClassroomFiles(supabase: SupabaseClient, paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(CLASSROOM_FILES_BUCKET).remove(paths);
  if (error) throw new Error("ลบไฟล์ที่ไม่ถูกใช้งานไม่สำเร็จ");
}

function attachmentPaths(
  storedValue: Json | undefined,
  legacy: { path?: string | null; attachment_path?: string | null; name?: string | null; attachment_name?: string | null },
) {
  const paths = normalizeStoredAttachments(storedValue).map((attachment) => attachment.path);
  const legacyPath = legacy.path ?? legacy.attachment_path;
  const legacyName = legacy.name ?? legacy.attachment_name;
  if (paths.length === 0 && legacyPath && legacyName) paths.push(legacyPath);
  return paths;
}

async function createClassroomFileUrl(supabase: SupabaseClient, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(CLASSROOM_FILES_BUCKET).createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

function normalizeOptionalUrls(value: string, label: string) {
  const rawUrls = value
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
  const urls = [...new Set(rawUrls)];
  if (urls.length > 10) throw new Error(`${label}ใส่ได้ไม่เกิน 10 ลิงก์`);

  return urls.map((urlValue) => {
    try {
      const url = new URL(urlValue);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Invalid protocol");
      if (url.href.length > 500) throw new Error("Too long");
      return url.href;
    } catch {
      throw new Error(`${label}ต้องขึ้นต้นด้วย http:// หรือ https://`);
    }
  });
}

function normalizeStoredLinks(value: Json | undefined, legacyUrl: string | null) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  }
  return legacyUrl ? [legacyUrl] : [];
}

function normalizeStoredAttachments(value: Json | undefined): Omit<ClassroomFileAttachment, "signedUrl">[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isJsonObject(item)) return [];
    const path = item.path;
    const name = item.name;
    if (typeof path !== "string" || typeof name !== "string") return [];
    const mimeType = typeof item.mimeType === "string" ? item.mimeType : null;
    const size = typeof item.size === "number" ? item.size : null;
    return [{ path, name, mimeType, size }];
  });
}

function toAttachmentJson(attachment: Omit<ClassroomFileAttachment, "signedUrl">): Json {
  return {
    path: attachment.path,
    name: attachment.name,
    mimeType: attachment.mimeType,
    size: attachment.size,
  };
}

function isGradeLevel(value: string | null | undefined): value is GradeLevel {
  return typeof value === "string" && GRADE_LEVELS.includes(value as GradeLevel);
}

function normalizeClassroomCode(code: string) {
  return code.replace(/[^A-Z0-9]+/gi, "").toUpperCase();
}

function validateClassroomId(id: string) {
  const normalizedId = id.trim();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalizedId)) {
    throw new Error(CLASSROOM_ACCESS_ERROR);
  }

  return normalizedId;
}

function validateUserId(id: string) {
  return validateUuid(id, "ไม่พบสมาชิกที่ต้องการนำออก");
}

function validateUuid(id: string, message: string) {
  const normalizedId = id.trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalizedId)) {
    throw new Error(message);
  }
  return normalizedId;
}

function throwClassroomActionError(code: string | undefined, message: string): never {
  if (code === "42501" || code === "P0002") throw new Error(CLASSROOM_ACCESS_ERROR);
  throw new Error(message);
}

function readRpcClassroomId(value: Json | null): string | null {
  if (!isJsonObject(value)) {
    return null;
  }

  const classroomId = value.classroom_id;
  return typeof classroomId === "string" ? classroomId : null;
}

function isJsonObject(value: Json | null): value is Record<string, Json | undefined> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
