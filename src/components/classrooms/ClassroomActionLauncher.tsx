"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const ClassroomActions = dynamic(() => import("@/components/classrooms/ClassroomActions").then((module) => module.ClassroomActions), {
  ssr: false,
});

type ClassroomActionLauncherProps = {
  placement: "desktop" | "mobile";
};

export function ClassroomActionLauncher({ placement }: ClassroomActionLauncherProps) {
  const router = useRouter();
  const { isAuthReady, isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    if (!isAuthReady) {
      return;
    }

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        size="icon"
        className={cn(
          "shadow-sm",
          placement === "mobile" ? "size-14 rounded-full" : "size-10",
        )}
        aria-label="เปิดเมนูห้องเรียน"
        aria-haspopup="dialog"
        disabled={!isAuthReady}
        onClick={handleOpen}
      >
        <Plus aria-hidden="true" />
      </Button>
      {open && <ClassroomActions placement={placement} initiallyOpen hideTrigger onClose={() => setOpen(false)} />}
    </>
  );
}
