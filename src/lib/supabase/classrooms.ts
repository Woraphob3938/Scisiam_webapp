import type { GradeLevel } from "@/components/LabCard";
import { labsById } from "@/data/labs";

import { createClient } from "./client";
import type { Database, Json, ScisiamUserRole } from "./database.types";

type SupabaseClient = ReturnType<typeof createClient>;
type ClassroomRow = Database["public"]["Tables"]["classrooms"]["Row"];
type ClassroomMemberRow = Database["public"]["Tables"]["classroom_members"]["Row"];
type ClassroomLabRow = Database["public"]["Tables"]["classroom_labs"]["Row"];
type ClassroomMemberRpcRow = Database["public"]["Functions"]["get_classroom_members"]["Returns"][number];

type VisibleClassroomRow = Pick<
  ClassroomRow,
  "id" | "creator_id" | "name" | "description" | "grade_level" | "is_active" | "created_at"
>;
type VisibleClassroomMemberRow = Pick<ClassroomMemberRow, "classroom_id" | "user_id">;
type VisibleClassroomLabRow = Pick<ClassroomLabRow, "classroom_id" | "lab_id" | "position">;

const CLASSROOM_ACCESS_ERROR = "ไม่พบห้องเรียนหรือคุณไม่มีสิทธิ์เข้าถึง";
const GRADE_LEVELS: readonly GradeLevel[] = [
  "ประถม",
  "มัธยมต้น",
  "มัธยมปลาย",
  "อุดมศึกษา",
];

export type ClassroomSummary = {
  id: string;
  creatorId: string;
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
  avatarUrl: string | null;
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

export async function listMyClassrooms(): Promise<ClassroomSummary[]> {
  const supabase = createClient();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("classrooms")
    .select("id, creator_id, name, description, grade_level, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const classrooms = (data ?? []) as VisibleClassroomRow[];
  if (classrooms.length === 0) {
    return [];
  }

  const classroomIds = classrooms.map((classroom) => classroom.id);
  const [labRows, memberRows] = await Promise.all([
    selectClassroomLabs(supabase, classroomIds),
    selectClassroomMembers(supabase, classroomIds),
  ]);

  return classrooms.map((classroom) =>
    buildClassroomSummary({
      classroom,
      currentUserId: userId,
      labRows,
      memberRows,
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
      throw new Error("พบรหัสห้องทดลองที่ไม่อยู่ในรายการ SciSiam");
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

async function loadClassroomDetailById(
  supabase: SupabaseClient,
  currentUserId: string,
  classroomId: string,
): Promise<ClassroomDetail> {
  const { data, error } = await supabase
    .from("classrooms")
    .select("id, creator_id, name, description, grade_level, is_active, created_at")
    .eq("id", classroomId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(CLASSROOM_ACCESS_ERROR);
  }

  const [labRows, memberRows] = await Promise.all([
    selectClassroomLabs(supabase, [classroomId]),
    selectClassroomMembers(supabase, [classroomId]),
  ]);

  return buildClassroomSummary({
    classroom: data as VisibleClassroomRow,
    currentUserId,
    labRows,
    memberRows,
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

async function getCurrentUserId(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return user?.id ?? null;
}

async function requireCurrentUserId(supabase: SupabaseClient): Promise<string> {
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    throw new Error("กรุณาเข้าสู่ระบบเพื่อใช้งานห้องเรียน");
  }

  return userId;
}

function buildClassroomSummary(input: {
  classroom: VisibleClassroomRow;
  currentUserId: string;
  labRows: VisibleClassroomLabRow[];
  memberRows: VisibleClassroomMemberRow[];
}): ClassroomSummary {
  const { classroom, currentUserId, labRows, memberRows } = input;

  return {
    id: classroom.id,
    creatorId: classroom.creator_id,
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
    avatarUrl: member.avatar_url,
    role: member.role,
    isCreator: member.is_creator,
    joinedAt: member.joined_at,
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
