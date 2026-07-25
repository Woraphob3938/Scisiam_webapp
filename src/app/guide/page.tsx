"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bot,
  BookOpenCheck,
  ClipboardCheck,
  FlaskConical,
  School,
  Settings2,
  UserRoundCog,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";

type GuideSection = {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  steps: string[];
  action: { label: string; href: string };
};

const guideSections: GuideSection[] = [
  {
    id: "start",
    label: "เริ่มต้น",
    title: "รู้จักพื้นที่หลักของ Scisiam",
    description: "แถบเมนูพาไปยังห้องแล็บ ชั้นเรียน และโปรไฟล์ ส่วนปุ่มรูปกระดิ่งใช้ดูข่าวสารจากชั้นเรียนค่ะ",
    icon: BookOpenCheck,
    accent: "bg-blue-600 text-white",
    steps: [
      "เปิดเมนูห้องแล็บเมื่อต้องการค้นหาการทดลองด้วยชื่อ หมวดวิชา หรือระดับชั้น",
      "เปิดชั้นเรียนเพื่อดูห้องที่เข้าร่วม งานที่ได้รับ และแล็บที่คุณครูเลือกไว้",
      "เปิดโปรไฟล์เพื่อดูข้อมูลบัญชี ประวัติการทดลอง และแก้ไขข้อมูลส่วนตัว",
    ],
    action: { label: "เริ่มจากห้องแล็บ", href: "/labs" },
  },
  {
    id: "labs",
    label: "ห้องแล็บ",
    title: "ค้นหา ทดลอง และบันทึกผล",
    description: "แต่ละแล็บมีตัวแปรและภาพจำลองต่างกัน แต่ลำดับการใช้งานหลักเหมือนกันค่ะ",
    icon: FlaskConical,
    accent: "bg-sky-100 text-sky-700",
    steps: [
      "ค้นหาชื่อแล็บแล้วกดทดลอง เพื่อเปิดหน้าการทดลองโดยตรง",
      "ปรับค่าที่แผงควบคุม แล้วกดเริ่มทดลองเพื่อดูค่าจริงและภาพจำลองเปลี่ยนไปพร้อมกัน",
      "กดบันทึกเมื่อได้ผลที่ต้องการ ระบบจะเก็บรอบการทดลองไว้สำหรับดูย้อนหลังหรือใช้ส่งงาน",
      "ใช้ปุ่มรีเซ็ตเมื่อต้องการกลับไปเริ่มเงื่อนไขการทดลองใหม่",
    ],
    action: { label: "ดูห้องแล็บทั้งหมด", href: "/labs" },
  },
  {
    id: "student",
    label: "สำหรับนักเรียน",
    title: "เข้าร่วมชั้นเรียนและส่งงาน",
    description: "นักเรียนใช้รหัสเชิญจากคุณครูเพื่อเข้าห้อง ดูแล็บประจำชั้น และส่งผลที่บันทึกไว้ค่ะ",
    icon: School,
    accent: "bg-emerald-100 text-emerald-700",
    steps: [
      "กดปุ่มบวกด้านบน เลือกเข้าร่วมชั้นเรียน แล้วกรอกรหัสที่ได้รับจากคุณครู",
      "ในหน้าชั้นเรียน ใช้แท็บภาพรวม งานของชั้นเรียน ห้องแล็บ และสมาชิกเพื่อดูข้อมูลแต่ละส่วน",
      "เมื่อได้รับงานแล็บ ให้ทดลองและบันทึกผลก่อน จากนั้นกดส่งงานในหน้าการทดลอง",
      "เลือกผลที่บันทึก เขียนสรุปสิ่งที่สังเกตได้ แล้วตรวจข้อมูลให้ครบก่อนกดส่งงาน",
    ],
    action: { label: "เปิดชั้นเรียน", href: "/classrooms" },
  },
  {
    id: "teacher",
    label: "สำหรับคุณครู",
    title: "สร้างห้อง มอบหมายงาน และตรวจคะแนน",
    description: "เครื่องมือของคุณครูรวมอยู่ในแดชบอร์ดและชั้นเรียน โดยสิทธิ์จัดการจะเป็นของผู้สร้างห้องค่ะ",
    icon: ClipboardCheck,
    accent: "bg-amber-100 text-amber-800",
    steps: [
      "สร้างชั้นเรียนจากปุ่มบวก ระบุชื่อ ระดับชั้น และรายละเอียด แล้วส่งรหัสเชิญให้นักเรียน",
      "เพิ่มแล็บจากแท็บห้องแล็บ โดยค้นหาชื่อแล้วเลือกเฉพาะหัวข้อที่ใช้กับชั้นเรียน",
      "สร้างงาน กำหนดคะแนนเต็ม วันส่ง และเลือกแล็บที่มอบหมายได้ตามต้องการ",
      "ดูงานที่ส่งแล้วจากชั้นเรียนหรือแดชบอร์ด เปิดภาพผลการทดลอง อ่านสรุป และให้คะแนนภายในคะแนนเต็มที่กำหนด",
    ],
    action: { label: "จัดการชั้นเรียน", href: "/classrooms" },
  },
  {
    id: "profile",
    label: "บัญชี",
    title: "ดูประวัติและจัดการโปรไฟล์",
    description: "โปรไฟล์ช่วยให้ตรวจสอบข้อมูลบัญชีและผลการทดลองที่บันทึกด้วยบัญชีปัจจุบันได้ค่ะ",
    icon: UserRoundCog,
    accent: "bg-rose-100 text-rose-700",
    steps: [
      "ตรวจชื่อ รูปโปรไฟล์ บทบาท และโรงเรียนให้ถูกต้องก่อนเริ่มใช้งานในชั้นเรียน",
      "เปิดประวัติการเรียนรู้เพื่อย้อนดูแล็บและผลการทดลองที่เคยบันทึก",
      "หากต้องการตั้งรหัสผ่านใหม่ ให้เปิดตั้งค่าบัญชีแล้วกดเปลี่ยนรหัสผ่าน จากนั้นตรวจอีเมลของคุณ",
    ],
    action: { label: "เปิดโปรไฟล์", href: "/profile" },
  },
  {
    id: "tools",
    label: "เครื่องมือช่วย",
    title: "AI ไออุ่นและการตั้งค่าการแสดงผล",
    description: "ใช้ไออุ่นช่วยอธิบายแนวคิดหรือถามคำถามเกี่ยวกับแล็บ และปรับหน้าจอให้อ่านสบายขึ้นได้ทุกเมื่อค่ะ",
    icon: Bot,
    accent: "bg-cyan-100 text-cyan-800",
    steps: [
      "กดรูปน้องไออุ่นที่มุมจอ แล้วพิมพ์คำถามเกี่ยวกับการเรียน ขั้นตอน หรือผลที่สังเกตได้",
      "ในหน้าตั้งค่า เลือกรูปแบบคำตอบของไออุ่นและระดับความละเอียดให้เหมาะกับวิธีเรียนของคุณ",
      "ปรับขนาดตัวอักษร ลดแอนิเมชัน หรือเปิดโหมดช่วยสำหรับผู้ตาบอดสีได้จากหน้าตั้งค่าเดียวกัน",
    ],
    action: { label: "กลับไปยังโปรไฟล์", href: "/profile" },
  },
];

export default function GuidePage() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#f5f7fb] font-sans text-slate-950">
      <Navbar />
      <div className="hidden lg:block">
        <Sidebar activeMenu="คู่มือการใช้งาน" />
      </div>

      <main
        className={`min-w-0 pb-28 transition-[padding-left] duration-300 lg:pb-14 ${
          isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"
        }`}
      >
        <header className="border-b border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-extrabold text-blue-700">คู่มือ Scisiam</p>
              <h1 className="mt-3 text-3xl font-extrabold leading-[1.3] tracking-normal sm:text-4xl">
                เริ่มทดลองและเรียนร่วมกันได้อย่างมั่นใจ
              </h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-slate-600 sm:text-lg">
                เลือกหัวข้อที่ต้องการ แล้วทำตามขั้นตอนสั้น ๆ ได้เลย คู่มือนี้รวมทั้งวิธีใช้สำหรับนักเรียนและคุณครูไว้ในหน้าเดียวค่ะ
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[430px]:flex-row">
              <Link
                href="/labs"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              >
                เปิดห้องแล็บ
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/classrooms"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-extrabold text-slate-800 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              >
                ไปชั้นเรียน
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-10 lg:py-10">
          <nav
            aria-label="สารบัญคู่มือการใช้งาน"
            className="flex flex-wrap gap-2 self-start lg:sticky lg:top-24 lg:grid"
          >
            <p className="hidden px-3 pb-1 text-xs font-extrabold text-slate-500 lg:block">เลือกหัวข้อ</p>
            {guideSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="min-w-0 space-y-5">
            {guideSections.map((section, index) => (
              <GuideBlock key={section.id} section={section} number={index + 1} />
            ))}

            <section className="rounded-2xl bg-slate-900 px-5 py-6 text-white sm:px-7 sm:py-7">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10">
                  <Settings2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold leading-[1.45]">หากหน้าจอแสดงผลไม่เหมาะกับคุณ</h2>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">
                    เปิดเมนูบัญชีด้านขวาบนแล้วเลือก “ตั้งค่าบัญชี” เพื่อปรับขนาดตัวอักษร ลดการเคลื่อนไหว หรือเปิดโหมดช่วยสำหรับผู้ตาบอดสีได้ค่ะ
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function GuideBlock({ section, number }: { section: GuideSection; number: number }) {
  const Icon = section.icon;

  return (
    <section id={section.id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <div className="flex items-start gap-4">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${section.accent}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-slate-500">{number.toLocaleString("th-TH", { minimumIntegerDigits: 2 })} · {section.label}</p>
          <h2 className="mt-1 break-words text-xl font-extrabold leading-[1.45] sm:text-2xl">{section.title}</h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600 sm:text-base">{section.description}</p>
        </div>
      </div>

      <ol className="mt-6 border-t border-slate-200">
        {section.steps.map((step, index) => (
          <li key={step} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 border-b border-slate-100 py-4 last:border-b-0">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-700" aria-hidden="true">
              {index + 1}
            </span>
            <span className="break-words text-sm font-semibold leading-relaxed text-slate-700 sm:text-base">{step}</span>
          </li>
        ))}
      </ol>

      <Link
        href={section.action.href}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-extrabold text-blue-700 underline decoration-blue-200 decoration-2 underline-offset-4 hover:text-blue-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
      >
        {section.action.label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
