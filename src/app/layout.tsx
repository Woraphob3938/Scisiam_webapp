import type { Metadata } from "next";
import { Suspense } from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import AIChatButton from "@/components/AIChatButton";
import MobileTabBar from "@/components/MobileTabBar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
        <TooltipProvider>
          <SidebarProvider>
            {children}
            <AIChatButton />
            <Suspense fallback={null}>
              <MobileTabBar />
            </Suspense>
          </SidebarProvider>
          <Toaster theme="light" position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}
