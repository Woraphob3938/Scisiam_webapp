"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import ClassroomLabSubmissionDialog from "@/components/classrooms/ClassroomLabSubmissionDialog";
import {
  getClassroom,
  getClassroomAssignments,
  getClassroomAssignmentSubmissions,
  submitClassroomAssignment,
  type ClassroomAssignment,
  type ClassroomAssignmentSubmission,
  type SubmitClassroomAssignmentInput,
} from "@/lib/supabase/classrooms";

export default function SimulationClassroomSubmission({ labId }: { labId: string }) {
  const searchParams = useSearchParams();
  const classroomId = searchParams.get("classroom");
  const assignmentId = searchParams.get("assignment");
  const [assignment, setAssignment] = useState<ClassroomAssignment | null>(null);
  const [submission, setSubmission] = useState<ClassroomAssignmentSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSlot, setSubmissionSlot] = useState<HTMLElement | null | undefined>(undefined);

  useEffect(() => {
    if (!classroomId || !assignmentId) return;

    let active = true;
    void Promise.all([
      getClassroom(classroomId),
      getClassroomAssignments(classroomId),
      getClassroomAssignmentSubmissions(classroomId),
    ])
      .then(([room, assignments, submissions]) => {
        if (!active || room.isCreator) return;
        const matchingAssignment = assignments.find(
          (item) => item.id === assignmentId && item.labId === labId,
        );
        if (!matchingAssignment) return;
        setAssignment(matchingAssignment);
        setSubmission(
          submissions.find((item) => item.assignmentId === matchingAssignment.id) ?? null,
        );
      })
      .catch((error) => {
        if (!active) return;
        toast.error(error instanceof Error ? error.message : "โหลดงานห้องแล็บไม่สำเร็จ");
      });

    return () => {
      active = false;
    };
  }, [assignmentId, classroomId, labId]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSubmissionSlot(document.querySelector<HTMLElement>("[data-testid='simulation-classroom-submission-slot']"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (
    !assignment
    || !classroomId
    || !assignmentId
    || assignment.id !== assignmentId
    || assignment.classroomId !== classroomId
  ) return null;
  const activeClassroomId = classroomId;
  const activeAssignmentId = assignmentId;

  async function handleSubmit(input: SubmitClassroomAssignmentInput) {
    setIsSubmitting(true);
    try {
      await submitClassroomAssignment(input);
      const submissions = await getClassroomAssignmentSubmissions(activeClassroomId);
      setSubmission(submissions.find((item) => item.assignmentId === activeAssignmentId) ?? null);
      toast.success("ส่งผลการทดลองให้คุณครูแล้ว");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ส่งงานไม่สำเร็จ");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  const submissionDialog = (
    <ClassroomLabSubmissionDialog
      assignment={assignment}
      existingSubmission={submission}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      variant={submissionSlot ? "inline" : "dock"}
    />
  );

  if (submissionSlot) {
    return createPortal(submissionDialog, submissionSlot);
  }

  return submissionSlot === undefined ? null : submissionDialog;
}
