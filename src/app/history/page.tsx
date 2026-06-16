import type { Metadata } from "next";
import LearningHistoryPage from "@/components/history/LearningHistoryPage";

export const metadata: Metadata = {
  title: "ประวัติการเรียนรู้ | SciSiam",
  description: "ติดตามประวัติการทดลอง คะแนน และความคืบหน้าการเรียนรู้วิทยาศาสตร์ของคุณบน SciSiam",
};

export default function HistoryPage() {
  return <LearningHistoryPage />;
}
