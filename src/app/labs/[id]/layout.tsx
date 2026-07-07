import type { Metadata } from "next";
import type { ReactNode } from "react";

import { labsById } from "@/data/labs";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://scisiam-app.vercel.app";

type LabRouteLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: Omit<LabRouteLayoutProps, "children">): Promise<Metadata> {
  const { id } = await params;
  const lab = labsById[id];

  if (!lab) {
    return {
      title: "ไม่พบห้องแล็บ | Scisiam",
      description: "ไม่พบห้องแล็บที่ระบุในระบบ Scisiam",
      metadataBase: new URL(siteUrl),
      openGraph: {
        title: "ไม่พบห้องแล็บ | Scisiam",
        description: "ไม่พบห้องแล็บที่ระบุในระบบ Scisiam",
        images: ["/ai-oon-logo.png"],
      },
      twitter: {
        card: "summary",
        title: "ไม่พบห้องแล็บ | Scisiam",
        description: "ไม่พบห้องแล็บที่ระบุในระบบ Scisiam",
        images: ["/ai-oon-logo.png"],
      },
    };
  }

  return {
    title: `${lab.title} | Scisiam`,
    description: lab.description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: `${lab.title} | Scisiam`,
      description: lab.description,
      images: ["/ai-oon-logo.png"],
    },
    twitter: {
      card: "summary",
      title: `${lab.title} | Scisiam`,
      description: lab.description,
      images: ["/ai-oon-logo.png"],
    },
  };
}

export default function LabRouteLayout({ children }: LabRouteLayoutProps) {
  return children;
}
