import type { Metadata } from "next";
import { Suspense } from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import AIChatButton from "@/components/AIChatButton";
import MobileTabBar from "@/components/MobileTabBar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://scisiam-app.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "SciSiam - รายชื่อห้องแล็บวิทยาศาสตร์จำลองออนไลน์",
  description: "แพลตฟอร์มจำลองการทดลองวิทยาศาสตร์ออนไลน์ เรียนรู้สนุกสนานและเป็นส่วนตัวสำหรับทุกคน",
  icons: {
    icon: "/ai-oon-logo.png",
    shortcut: "/ai-oon-logo.png",
    apple: "/ai-oon-logo.png",
  },
  openGraph: {
    title: "SciSiam - รายชื่อห้องแล็บวิทยาศาสตร์จำลองออนไลน์",
    description: "แพลตฟอร์มจำลองการทดลองวิทยาศาสตร์ออนไลน์ เรียนรู้สนุกสนานและเป็นส่วนตัวสำหรับทุกคน",
    url: "/",
    siteName: "SciSiam",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/ai-oon-logo.png",
        width: 500,
        height: 500,
        alt: "โลโก้ SciSiam น้องไออุ่น",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SciSiam - รายชื่อห้องแล็บวิทยาศาสตร์จำลองออนไลน์",
    description: "แพลตฟอร์มจำลองการทดลองวิทยาศาสตร์ออนไลน์ เรียนรู้สนุกสนานและเป็นส่วนตัวสำหรับทุกคน",
    images: ["/ai-oon-logo.png"],
  },
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
