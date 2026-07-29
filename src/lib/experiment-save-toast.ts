"use client";

import { toast } from "sonner";

export const EXPERIMENT_SAVE_MESSAGE = "บันทึกสำเร็จ ให้ดูที่ผลการทดลอง";

export function showExperimentSaveToast() {
  toast.success(EXPERIMENT_SAVE_MESSAGE, {
    duration: 2000,
    position: "top-center",
    style: {
      background: "#eff8ff",
      border: "1px solid #bae6fd",
      color: "#075985",
      boxShadow: "0 12px 32px rgba(14, 116, 144, 0.14)",
    },
  });
}
