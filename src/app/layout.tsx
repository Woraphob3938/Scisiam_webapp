import type { Metadata } from "next";
import { Kanit, Noto_Sans_Thai } from "next/font/google";
import { Suspense } from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import { AuthProvider } from "@/context/AuthContext";
import GlobalClientOverlays from "@/components/GlobalClientOverlays";
import PwaServiceWorker from "@/components/PwaServiceWorker";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: "800",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://scisiam-app.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Scisiam - รายชื่อห้องแล็บวิทยาศาสตร์จำลองออนไลน์",
  description: "แพลตฟอร์มจำลองการทดลองวิทยาศาสตร์ออนไลน์ เรียนรู้สนุกสนานและเป็นส่วนตัวสำหรับทุกคน",
  icons: {
    icon: "/icons/scisiam-192.png",
    shortcut: "/ai-oon-logo.png",
    apple: "/icons/scisiam-192.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Scisiam",
  },
  openGraph: {
    title: "Scisiam - รายชื่อห้องแล็บวิทยาศาสตร์จำลองออนไลน์",
    description: "แพลตฟอร์มจำลองการทดลองวิทยาศาสตร์ออนไลน์ เรียนรู้สนุกสนานและเป็นส่วนตัวสำหรับทุกคน",
    url: "/",
    siteName: "Scisiam",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/ai-oon-logo.png",
        width: 500,
        height: 500,
        alt: "โลโก้ Scisiam น้องไออุ่น",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Scisiam - รายชื่อห้องแล็บวิทยาศาสตร์จำลองออนไลน์",
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
    <html lang="th" className={`${notoSansThai.variable} ${kanit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <TooltipProvider>
          <AuthProvider>
            <SidebarProvider>
              {children}
              <Suspense fallback={null}>
                <GlobalClientOverlays />
              </Suspense>
              <PwaServiceWorker />
            </SidebarProvider>
          </AuthProvider>
          <Toaster theme="light" position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}
