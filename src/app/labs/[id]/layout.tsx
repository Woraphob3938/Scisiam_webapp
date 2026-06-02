import type { Metadata } from "next";
import type { ReactNode } from "react";

import { labsById } from "@/data/labs";

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
      title: "ไม่พบห้องแล็บ | SciSiam Virtual Lab",
      description: "ไม่พบห้องแล็บที่ระบุในระบบ SciSiam Virtual Lab",
    };
  }

  return {
    title: `${lab.title} | SciSiam Virtual Lab`,
    description: lab.description,
  };
}

export default function LabRouteLayout({ children }: LabRouteLayoutProps) {
  return children;
}
