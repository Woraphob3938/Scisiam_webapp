import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(
  path.join(process.cwd(), "src", "lib", "teacher-dashboard-metrics.ts"),
);
const { calculateTeacherSubmissionMetrics } = await import(moduleUrl.href);

test("teacher dashboard calculates expected, submitted, pending, and rate", () => {
  assert.deepEqual(
    calculateTeacherSubmissionMetrics({
      studentCount: 10,
      assignmentCount: 3,
      submissionCount: 18,
    }),
    {
      submissionCount: 18,
      expectedSubmissionCount: 30,
      pendingSubmissionCount: 12,
      submissionRate: 60,
    },
  );
});

test("teacher dashboard metrics stay bounded for empty and excessive submission data", () => {
  assert.deepEqual(
    calculateTeacherSubmissionMetrics({
      studentCount: 0,
      assignmentCount: 4,
      submissionCount: 0,
    }),
    {
      submissionCount: 0,
      expectedSubmissionCount: 0,
      pendingSubmissionCount: 0,
      submissionRate: 0,
    },
  );

  assert.deepEqual(
    calculateTeacherSubmissionMetrics({
      studentCount: 2,
      assignmentCount: 2,
      submissionCount: 8,
    }),
    {
      submissionCount: 8,
      expectedSubmissionCount: 4,
      pendingSubmissionCount: 0,
      submissionRate: 100,
    },
  );
});
