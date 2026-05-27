import type { Metadata } from "next";
import { SidebarProvider } from "@/context/SidebarContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "SciSiam - รายชื่อห้องแล็บวิทยาศาสตร์จำลองออนไลน์",
  description: "แพลตฟอร์มจำลองการทดลองวิทยาศาสตร์ออนไลน์ เรียนรู้สนุกสนานและเป็นส่วนตัวสำหรับทุกคน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
