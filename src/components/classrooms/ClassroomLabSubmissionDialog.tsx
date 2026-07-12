"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { ClipboardCheck, FlaskConical, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { labsById } from "@/data/labs";
import {
  listMyExperimentRunsForLab,
  type ClassroomAssignment,
  type ClassroomAssignmentSubmission,
  type ClassroomExperimentRun,
  type SubmitClassroomAssignmentInput,
} from "@/lib/supabase/classrooms";

type ClassroomLabSubmissionDialogProps = {
  assignment: ClassroomAssignment;
  existingSubmission: ClassroomAssignmentSubmission | null;
  isSubmitting: boolean;
  onSubmit: (input: SubmitClassroomAssignmentInput) => Promise<boolean>;
  variant?: "panel" | "dock" | "inline";
  simulationHref?: string;
};

export default function ClassroomLabSubmissionDialog({
  assignment,
  existingSubmission,
  isSubmitting,
  onSubmit,
  variant = "panel",
  simulationHref,
}: ClassroomLabSubmissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [runs, setRuns] = useState<ClassroomExperimentRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState(existingSubmission?.experimentRunId ?? "");
  const [conclusion, setConclusion] = useState(existingSubmission?.note ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const selectedRun = runs.find((run) => run.id === selectedRunId) ?? null;
  const isGraded = Boolean(existingSubmission?.gradedAt);
  const resolvedSimulationHref = simulationHref ?? (assignment.labId
    ? `/labs/${assignment.labId}/simulation?classroom=${encodeURIComponent(assignment.classroomId)}&assignment=${encodeURIComponent(assignment.id)}`
    : undefined);

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
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
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

  const statusText = isGraded
    ? `ตรวจแล้ว ${existingSubmission?.score}/${assignment.maxScore} คะแนน`
    : existingSubmission
      ? "ส่งแล้ว และแก้ไขได้ก่อนคุณครูตรวจ"
      : "เลือกผลที่บันทึกไว้และเขียนสรุปก่อนส่ง";

  return (
    <div
      className={
        variant === "inline"
          ? "shrink-0"
          : variant === "dock"
            ? "fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-white/95 p-3 shadow-xl backdrop-blur md:bottom-5"
            : "mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4"
      }
      aria-label="ส่งงานห้องแล็บ"
    >
      {variant !== "inline" ? <div className="flex min-w-0 items-center gap-3">
        {variant === "dock" ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ClipboardCheck className="size-5" aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-blue-950">
            {variant === "dock" ? assignment.title : "ผลการทดลองของคุณ"}
          </p>
          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-relaxed text-blue-700">{statusText}</p>
        </div>
      </div> : null}
      <button
        type="button"
        onClick={() => {
          setIsLoading(true);
          setOpen(true);
        }}
        disabled={isGraded}
        aria-label={`${isGraded ? "ตรวจงานแล้ว" : existingSubmission ? "แก้ไขงาน" : "ส่งงาน"} ${assignment.title}`}
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
      >
        <Upload className="size-4" aria-hidden="true" />
        {isGraded ? "ตรวจแล้ว" : existingSubmission ? "แก้ไขงาน" : "ส่งงาน"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-6xl overflow-y-auto p-0">
          <DialogHeader className="border-b border-slate-100 px-5 py-4 pr-12 sm:px-6">
            <DialogTitle>ส่งผลการทดลอง</DialogTitle>
            <DialogDescription>{assignment.title} · คะแนนเต็ม {assignment.maxScore}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-5 px-5 pb-5 sm:px-6 sm:pb-6">
            <fieldset className="grid gap-3">
              <legend className="text-sm font-extrabold text-slate-900">ผลการทดลองที่บันทึกไว้</legend>
              {isLoading ? (
                <p role="status" className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                  กำลังโหลดผลการทดลอง...
                </p>
              ) : null}
              {!isLoading && runs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center">
                  <p className="text-sm font-bold text-slate-800">ยังไม่มีผลการทดลองที่บันทึกไว้</p>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
                    กดบันทึกผลในห้องทดลองก่อน แล้วกลับมาเลือกผลเพื่อส่งงาน
                  </p>
                  {resolvedSimulationHref ? (
                    <Link href={resolvedSimulationHref} className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white">
                      ไปทดลองและบันทึกผล
                    </Link>
                  ) : null}
                </div>
              ) : null}
              {runs.map((experimentRun) => (
                <label
                  key={experimentRun.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${selectedRunId === experimentRun.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}
                >
                  <input
                    type="radio"
                    name={`run-${assignment.id}`}
                    value={experimentRun.id}
                    checked={selectedRunId === experimentRun.id}
                    onChange={() => setSelectedRunId(experimentRun.id)}
                    className="mt-1 size-4 accent-blue-600"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold text-slate-900">
                      {experimentRun.title || labsById[experimentRun.lab_id]?.title || "ผลการทดลอง"}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">
                      บันทึกเมื่อ {formatExperimentDate(experimentRun.created_at)}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
            {selectedRun ? <ExperimentRunPreview run={selectedRun} simulationHref={resolvedSimulationHref} /> : null}
            <label className="grid gap-2 text-sm font-extrabold text-slate-900">
              สรุปผลการทดลอง <span className="text-xs font-semibold text-slate-500">5-1,000 ตัวอักษร</span>
              <textarea
                value={conclusion}
                onChange={(event) => setConclusion(event.target.value)}
                minLength={5}
                maxLength={1000}
                rows={5}
                required
                className="resize-y rounded-xl border border-slate-300 px-3 py-2 font-medium leading-relaxed outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                placeholder="อธิบายสิ่งที่สังเกตได้ ผลที่เกิดขึ้น และข้อสรุปจากการทดลอง"
              />
            </label>
            <DialogFooter>
              <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-lg border border-slate-300 px-4 font-extrabold text-slate-700">
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedRunId || conclusion.trim().length < 5}
                className="min-h-11 rounded-lg bg-blue-600 px-5 font-extrabold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "กำลังส่ง..." : "ส่งงาน"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ExperimentRunPreview({
  run,
  simulationHref,
}: {
  run: ClassroomExperimentRun;
  simulationHref?: string;
}) {
  const sections = [
    ["ตัวแปรที่ตั้งค่า", run.variables],
    ["ค่าที่วัดได้", run.live_values],
    ["สรุปข้อมูล", run.summary],
  ] as const;
  const labTitle = labsById[run.lab_id]?.thaiTitle || labsById[run.lab_id]?.title || run.title || "ห้องแล็บ";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="size-5 text-blue-600" aria-hidden="true" />
        <h3 className="text-sm font-extrabold text-slate-950">{labTitle}</h3>
      </div>
      <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {run.snapshotUrl ? (
            <Image
              src={run.snapshotUrl}
              alt={`ภาพหน้าการทดลอง ${labTitle}`}
              width={1280}
              height={720}
              unoptimized
              className="h-auto max-h-[56dvh] w-full object-contain"
            />
          ) : (
            <div className="grid min-h-52 place-items-center gap-3 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-slate-500">ไม่มีภาพหน้าการทดลองสำหรับรายการนี้</p>
              {simulationHref ? (
                <Link href={simulationHref} className="inline-flex min-h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white">
                  บันทึกผลใหม่เพื่อสร้างภาพ
                </Link>
              ) : null}
            </div>
          )}
        </div>
        <div className="grid content-start gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {sections.map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-lg bg-white p-3">
              <p className="text-xs font-bold text-slate-500">{label}</p>
              <ExperimentJsonValue value={value} />
            </div>
          ))}
        </div>
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
          <dd className="min-w-0 break-words text-right font-bold text-slate-800">
            {typeof item === "object" ? JSON.stringify(item) : String(item)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function formatExperimentDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
