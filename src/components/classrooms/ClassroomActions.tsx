"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  DoorOpen,
  FlaskConical,
  LoaderCircle,
  Plus,
  Search,
  Share2,
  Users,
} from "lucide-react";

import type { GradeLevel } from "@/components/LabCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { labsData } from "@/data/labs";
import {
  createClassroom,
  getClassroomJoinCode,
  joinClassroom,
} from "@/lib/supabase/classrooms";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ClassroomActionMode = "menu" | "create" | "join" | "created";

type ClassroomActionsProps = {
  placement: "desktop" | "mobile";
};

type ClassroomCategory = "All" | (typeof labsData)[number]["category"];

type CreateFormErrors = {
  name?: string;
  gradeLevel?: string;
  labIds?: string;
  description?: string;
  form?: string;
};

type CreatedClassroom = {
  id: string;
  name: string;
  code: string;
};

const GRADE_LEVELS: readonly GradeLevel[] = [
  "ประถม",
  "มัธยมต้น",
  "มัธยมปลาย",
  "อุดมศึกษา",
];

const CATEGORIES: readonly ClassroomCategory[] = [
  "All",
  "Physics",
  "Chemistry",
  "Biology",
  "Mathematics",
  "Foundation",
];

const CATEGORY_LABELS: Record<ClassroomCategory, string> = {
  All: "ทั้งหมด",
  Physics: "ฟิสิกส์",
  Chemistry: "เคมี",
  Biology: "ชีววิทยา",
  Mathematics: "คณิตศาสตร์",
  Foundation: "พื้นฐาน",
};

const inputClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

const textareaClassName =
  "min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

function normalizeJoinCode(value: string) {
  return value.replace(/[^A-Z0-9]+/gi, "").toUpperCase().slice(0, 8);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}

export function ClassroomActions({ placement }: ClassroomActionsProps) {
  const router = useRouter();
  const resetTimerRef = useRef<number | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ClassroomActionMode>("menu");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | "">("");
  const [description, setDescription] = useState("");
  const [selectedLabIds, setSelectedLabIds] = useState<string[]>([]);
  const [labSearch, setLabSearch] = useState("");
  const [category, setCategory] = useState<ClassroomCategory>("All");
  const [createErrors, setCreateErrors] = useState<CreateFormErrors>({});
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [createdClassroom, setCreatedClassroom] = useState<CreatedClassroom | null>(null);
  const [shareStatus, setShareStatus] = useState("");

  const filteredLabs = useMemo(() => {
    const query = labSearch.trim().toLocaleLowerCase("th");

    return labsData.filter((lab) => {
      if (category !== "All" && lab.category !== category) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [lab.thaiTitle, lab.title, lab.description, lab.category]
        .join(" ")
        .toLocaleLowerCase("th")
        .includes(query);
    });
  }, [category, labSearch]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => titleRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [mode, open]);

  function resetDialog() {
    setMode("menu");
    setBusy(false);
    setName("");
    setGradeLevel("");
    setDescription("");
    setSelectedLabIds([]);
    setLabSearch("");
    setCategory("All");
    setCreateErrors({});
    setJoinCode("");
    setJoinError("");
    setCreatedClassroom(null);
    setShareStatus("");
  }

  async function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setOpen(false);
      resetTimerRef.current = window.setTimeout(resetDialog, 150);
      return;
    }

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    if (!isSupabaseConfigured()) {
      router.push("/login");
      return;
    }

    const {
      data: { user },
    } = await createClient().auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setOpen(true);
  }

  function validateCreateForm() {
    const errors: CreateFormErrors = {};
    const normalizedName = name.trim();

    if (normalizedName.length < 1 || normalizedName.length > 80) {
      errors.name = "กรุณากรอกชื่อห้อง 1-80 ตัวอักษร";
    }

    if (!gradeLevel || !GRADE_LEVELS.includes(gradeLevel)) {
      errors.gradeLevel = "กรุณาเลือกชั้นปี";
    }

    if (selectedLabIds.length < 1 || selectedLabIds.length > 24) {
      errors.labIds = "กรุณาเลือกแล็บ 1-24 รายการ";
    }

    if (description.length > 500) {
      errors.description = "รายละเอียดต้องไม่เกิน 500 ตัวอักษร";
    }

    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateCreateForm() || !gradeLevel) {
      return;
    }

    setBusy(true);
    setCreateErrors({});

    try {
      const classroom = await createClassroom({
        name,
        gradeLevel,
        description,
        labIds: selectedLabIds,
      });
      const code = await getClassroomJoinCode(classroom.id);

      if (!code) {
        throw new Error("สร้างห้องสำเร็จ แต่ยังไม่สามารถแสดงรหัสเข้าร่วมได้");
      }

      setCreatedClassroom({ id: classroom.id, name: classroom.name, code });
      setMode("created");
    } catch (error) {
      const message = getErrorMessage(error);
      if (message.includes("เข้าสู่ระบบ")) {
        router.push("/login");
        return;
      }
      setCreateErrors({ form: message });
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = normalizeJoinCode(joinCode);

    if (normalizedCode.length < 5 || normalizedCode.length > 8) {
      setJoinError("กรุณากรอกรหัสห้อง 5-8 ตัวอักษร");
      return;
    }

    setBusy(true);
    setJoinError("");

    try {
      const classroom = await joinClassroom(normalizedCode);
      await handleOpenChange(false);
      router.push(`/classrooms/${classroom.id}`);
    } catch (error) {
      const message = getErrorMessage(error);
      if (message.includes("เข้าสู่ระบบ")) {
        router.push("/login");
        return;
      }
      setJoinError(message);
    } finally {
      setBusy(false);
    }
  }

  function toggleLab(labId: string) {
    setSelectedLabIds((current) => {
      if (current.includes(labId)) {
        setCreateErrors((errors) => ({ ...errors, labIds: undefined }));
        return current.filter((id) => id !== labId);
      }

      if (current.length >= 24) {
        setCreateErrors((errors) => ({
          ...errors,
          labIds: "เลือกแล็บได้สูงสุด 24 รายการ",
        }));
        return current;
      }

      setCreateErrors((errors) => ({ ...errors, labIds: undefined }));
      return [...current, labId];
    });
  }

  async function copyCode() {
    if (!createdClassroom) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdClassroom.code);
      setShareStatus("คัดลอกรหัสแล้ว");
    } catch {
      setShareStatus("คัดลอกไม่สำเร็จ กรุณาเลือกรหัสแล้วคัดลอกด้วยตนเอง");
    }
  }

  async function shareCode() {
    if (!createdClassroom) {
      return;
    }

    const text = `เข้าร่วมห้อง ${createdClassroom.name} บน SciSiam ด้วยรหัส ${createdClassroom.code}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: `SciSiam - ${createdClassroom.name}`, text });
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

  const title =
    mode === "create"
      ? "สร้างห้องใหม่"
      : mode === "join"
        ? "เข้าร่วมห้อง"
        : mode === "created"
          ? "สร้างห้องสำเร็จ"
          : "ห้องเรียน SciSiam";

  const descriptionText =
    mode === "create"
      ? "ตั้งค่าห้องและเลือกแล็บที่ต้องการใช้กับผู้เรียน"
      : mode === "join"
        ? "กรอกรหัสที่ได้รับจากผู้สร้างห้อง"
        : mode === "created"
          ? "แชร์รหัสนี้ให้สมาชิกที่ต้องการเข้าร่วมห้อง"
          : "เลือกเข้าร่วมหรือสร้างห้องเรียน";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon"
          className={cn(
            "shadow-sm",
            placement === "mobile" ? "size-14 rounded-full" : "size-10",
          )}
          aria-label="เปิดเมนูห้องเรียน"
          aria-haspopup="dialog"
        >
          <Plus aria-hidden="true" />
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-5 pt-5 pb-4 pr-14">
          <div className="flex items-start gap-3">
            {mode !== "menu" && mode !== "created" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setMode("menu")}
                aria-label="กลับไปเมนูห้องเรียน"
              >
                <ArrowLeft aria-hidden="true" />
              </Button>
            ) : null}
            <div className="flex min-w-0 flex-col gap-1">
              <DialogTitle ref={titleRef} tabIndex={-1} className="text-lg leading-relaxed font-semibold outline-none">{title}</DialogTitle>
              <DialogDescription className={cn("leading-relaxed", mode === "menu" && "sr-only")}>
                {descriptionText}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {mode === "menu" ? (
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <button
              type="button"
              className="flex min-h-28 items-center gap-4 rounded-lg border border-border bg-background p-4 text-left outline-none transition-colors hover:border-primary/40 hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              onClick={() => setMode("join")}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <DoorOpen aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <strong className="text-base">เข้าร่วมห้อง</strong>
                <span className="text-sm leading-relaxed text-muted-foreground">ใช้รหัสจากผู้สร้างห้อง</span>
              </span>
            </button>
            <button
              type="button"
              className="flex min-h-28 items-center gap-4 rounded-lg border border-border bg-background p-4 text-left outline-none transition-colors hover:border-primary/40 hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              onClick={() => setMode("create")}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Users aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <strong className="text-base">สร้างห้อง</strong>
                <span className="text-sm leading-relaxed text-muted-foreground">กำหนดชั้นปีและเลือกแล็บ</span>
              </span>
            </button>
          </div>
        ) : null}

        {mode === "create" ? (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleCreate} noValidate>
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 py-4">
              <p className="text-xs text-muted-foreground">ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก</p>
              {createErrors.form ? (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm leading-relaxed text-destructive" role="alert">
                  {createErrors.form}
                </p>
              ) : null}

              <div className="flex flex-col gap-2">
                <label htmlFor="classroom-name" className="font-medium">
                  ชื่อห้อง <span aria-hidden="true">*</span>
                </label>
                <input
                  id="classroom-name"
                  className={inputClassName}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setCreateErrors((errors) => ({ ...errors, name: undefined }));
                  }}
                  maxLength={80}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(createErrors.name)}
                  aria-describedby={createErrors.name ? "classroom-name-error" : "classroom-name-help"}
                  placeholder="เช่น วิทยาศาสตร์ ม.2/1"
                />
                <p id="classroom-name-help" className="text-xs text-muted-foreground">สูงสุด 80 ตัวอักษร</p>
                {createErrors.name ? (
                  <p id="classroom-name-error" className="text-sm text-destructive" role="alert">
                    {createErrors.name}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="classroom-grade" className="font-medium">
                  ชั้นปี <span aria-hidden="true">*</span>
                </label>
                <Select
                  value={gradeLevel}
                  onValueChange={(value) => {
                    setGradeLevel(value as GradeLevel);
                    setCreateErrors((errors) => ({ ...errors, gradeLevel: undefined }));
                  }}
                >
                  <SelectTrigger
                    id="classroom-grade"
                    className="h-10 w-full"
                    aria-invalid={Boolean(createErrors.gradeLevel)}
                    aria-describedby={createErrors.gradeLevel ? "classroom-grade-error" : undefined}
                  >
                    <SelectValue placeholder="เลือกชั้นปี" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {GRADE_LEVELS.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {createErrors.gradeLevel ? (
                  <p id="classroom-grade-error" className="text-sm text-destructive" role="alert">
                    {createErrors.gradeLevel}
                  </p>
                ) : null}
              </div>

              <fieldset className="flex min-w-0 flex-col gap-3">
                <legend className="font-medium">
                  เลือกแล็บ <span aria-hidden="true">*</span>
                </legend>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground" id="classroom-labs-help">
                    เลือกแล้ว {selectedLabIds.length}/24 แล็บ
                  </p>
                  {createErrors.labIds ? (
                    <p id="classroom-labs-error" className="text-sm text-destructive" role="alert">
                      {createErrors.labIds}
                    </p>
                  ) : null}
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <label htmlFor="classroom-lab-search" className="sr-only">ค้นหาแล็บ</label>
                  <input
                    id="classroom-lab-search"
                    type="search"
                    className={cn(inputClassName, "pl-9")}
                    value={labSearch}
                    onChange={(event) => setLabSearch(event.target.value)}
                    placeholder="ค้นหาชื่อแล็บหรือหมวดหมู่"
                    autoComplete="off"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1" aria-label="กรองหมวดหมู่แล็บ">
                  {CATEGORIES.map((item) => (
                    <Button
                      key={item}
                      type="button"
                      size="sm"
                      variant={category === item ? "default" : "outline"}
                      aria-pressed={category === item}
                      onClick={() => setCategory(item)}
                    >
                      {CATEGORY_LABELS[item]}
                    </Button>
                  ))}
                </div>

                <div
                  className="grid max-h-64 gap-2 overflow-y-auto overscroll-contain rounded-lg border border-border p-2 sm:grid-cols-2"
                  aria-invalid={Boolean(createErrors.labIds)}
                  aria-describedby={createErrors.labIds ? "classroom-labs-error" : "classroom-labs-help"}
                >
                  {filteredLabs.length > 0 ? (
                    filteredLabs.map((lab) => {
                      const checked = selectedLabIds.includes(lab.id);
                      const disabled = !checked && selectedLabIds.length >= 24;
                      return (
                        <label
                          key={lab.id}
                          className={cn(
                            "flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                            checked ? "border-primary/40 bg-primary/5" : "border-transparent hover:bg-muted",
                            disabled && "cursor-not-allowed opacity-50",
                          )}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 size-4 accent-primary"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleLab(lab.id)}
                          />
                          <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="break-words text-sm font-medium leading-relaxed">{lab.thaiTitle}</span>
                            <span className="truncate text-xs text-muted-foreground">{lab.title}</span>
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="col-span-full px-3 py-8 text-center text-sm text-muted-foreground">ไม่พบแล็บที่ค้นหา</p>
                  )}
                </div>
              </fieldset>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="classroom-description" className="font-medium">รายละเอียดเพิ่มเติม</label>
                  <span className="text-xs text-muted-foreground">{description.length}/500</span>
                </div>
                <textarea
                  id="classroom-description"
                  className={textareaClassName}
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setCreateErrors((errors) => ({ ...errors, description: undefined }));
                  }}
                  maxLength={500}
                  aria-invalid={Boolean(createErrors.description)}
                  aria-describedby={createErrors.description ? "classroom-description-error" : undefined}
                  placeholder="คำแนะนำหรือข้อมูลที่สมาชิกควรรู้"
                />
                {createErrors.description ? (
                  <p id="classroom-description-error" className="text-sm text-destructive" role="alert">
                    {createErrors.description}
                  </p>
                ) : null}
              </div>
            </div>

            <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t bg-background px-5 py-4">
              <Button type="button" variant="outline" disabled={busy} onClick={() => setMode("menu")}>ยกเลิก</Button>
              <Button type="submit" disabled={busy}>
                {busy ? <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : <Plus data-icon="inline-start" aria-hidden="true" />}
                {busy ? "กำลังสร้าง..." : "สร้างห้อง"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {mode === "join" ? (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleJoin} noValidate>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-5 py-5">
              <label htmlFor="classroom-code" className="font-medium">
                รหัสห้อง <span aria-hidden="true">*</span>
              </label>
              <input
                id="classroom-code"
                className={cn(inputClassName, "h-14 text-center font-mono text-xl uppercase")}
                value={joinCode}
                onChange={(event) => {
                  setJoinCode(normalizeJoinCode(event.target.value));
                  setJoinError("");
                }}
                minLength={5}
                maxLength={8}
                required
                aria-required="true"
                aria-invalid={Boolean(joinError)}
                aria-describedby={joinError ? "classroom-code-error" : "classroom-code-help"}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                inputMode="text"
                placeholder="เช่น ABC123"
              />
              <p id="classroom-code-help" className="text-sm leading-relaxed text-muted-foreground">
                รหัสประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข 5-8 ตัว
              </p>
              {joinError ? (
                <p id="classroom-code-error" className="text-sm leading-relaxed text-destructive" role="alert">
                  {joinError}
                </p>
              ) : null}
            </div>
            <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t bg-background px-5 py-4">
              <Button type="button" variant="outline" disabled={busy} onClick={() => setMode("menu")}>ยกเลิก</Button>
              <Button type="submit" disabled={busy || joinCode.length < 5}>
                {busy ? <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : <DoorOpen data-icon="inline-start" aria-hidden="true" />}
                {busy ? "กำลังเข้าร่วม..." : "เข้าร่วมห้อง"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {mode === "created" && createdClassroom ? (
          <div className="flex flex-col gap-5 px-5 py-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <strong className="text-lg leading-relaxed">{createdClassroom.name}</strong>
                <span className="text-sm text-muted-foreground">รหัสสำหรับผู้สร้างห้องเท่านั้น</span>
              </div>
            </div>

            <div className="flex items-center justify-center rounded-lg border border-border bg-muted/50 px-4 py-5">
              <output className="select-all font-mono text-3xl font-semibold" aria-label={`รหัสห้อง ${createdClassroom.code}`}>
                {createdClassroom.code}
              </output>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="outline" onClick={copyCode}>
                <Copy data-icon="inline-start" aria-hidden="true" />
                คัดลอกรหัส
              </Button>
              <Button type="button" variant="outline" onClick={shareCode}>
                <Share2 data-icon="inline-start" aria-hidden="true" />
                แชร์รหัส
              </Button>
            </div>

            <p className="min-h-5 text-center text-sm text-muted-foreground" aria-live="polite">{shareStatus}</p>

            <Button
              type="button"
              size="lg"
              onClick={async () => {
                await handleOpenChange(false);
                router.push(`/classrooms/${createdClassroom.id}`);
              }}
            >
              <FlaskConical data-icon="inline-start" aria-hidden="true" />
              ไปที่ห้องเรียน
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
