import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";

import Navbar from "@/components/Navbar";
import LabDetailLayout from "@/components/labs/LabDetailLayout";
import { labsById } from "@/data/labs";
import { getLabDetails } from "@/data/labDetails";

type LabDetailPageProps = {
  params: Promise<{ id?: string }>;
};

export default async function LabDetailPage({ params }: LabDetailPageProps) {
  const { id } = await params;
  const labId = id ?? "";
  const lab = labsById[labId];
  const details = getLabDetails(labId);

  if (!lab || !details) {
    return <InvalidLabDetail labId={labId} />;
  }

  return <LabDetailLayout labId={labId} lab={lab} details={details} />;
}

function InvalidLabDetail({ labId }: { labId: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <p className="mb-2 text-xs font-bold uppercase text-slate-400">
            Lab not found
          </p>
          <h1 className="text-2xl font-black leading-relaxed text-slate-900">
            ไม่พบห้องแล็บนี้ใน Scisiam
          </h1>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500">
            รหัสแล็บ <span className="font-mono text-slate-700">{labId || "-"}</span> ไม่มีอยู่ในรายการห้องแล็บของโปรเจกต์ จึงไม่แสดงเนื้อหาของห้องอื่นแทนเพื่อป้องกันข้อมูลผิดหัวข้อ
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/labs"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Home className="h-4 w-4" />
              กลับหน้ารายชื่อห้องแล็บ
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
