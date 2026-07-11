export type TeacherSubmissionMetrics = {
  submissionCount: number;
  expectedSubmissionCount: number;
  pendingSubmissionCount: number;
  submissionRate: number;
};

export function calculateTeacherSubmissionMetrics({
  studentCount,
  assignmentCount,
  submissionCount,
}: {
  studentCount: number;
  assignmentCount: number;
  submissionCount: number;
}): TeacherSubmissionMetrics {
  const safeStudents = Math.max(0, studentCount);
  const safeAssignments = Math.max(0, assignmentCount);
  const safeSubmissions = Math.max(0, submissionCount);
  const expectedSubmissionCount = safeStudents * safeAssignments;

  return {
    submissionCount: safeSubmissions,
    expectedSubmissionCount,
    pendingSubmissionCount: Math.max(0, expectedSubmissionCount - safeSubmissions),
    submissionRate:
      expectedSubmissionCount === 0
        ? 0
        : Math.min(100, Math.round((safeSubmissions / expectedSubmissionCount) * 100)),
  };
}
