"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Download, MoreVertical, Share2, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppInstallButtonProps {
  desktopRuntime: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

type InstallPlatform = "android" | "ios" | "desktop" | "installed";

const windowsDownloadUrl =
  process.env.NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL?.trim() ||
  "https://github.com/Woraphob3938/Scisiam_webapp/releases";

export default function AppInstallButton({
  desktopRuntime,
}: AppInstallButtonProps) {
  const [platform, setPlatform] = useState<InstallPlatform | null>(null);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  useEffect(() => {
    const navigatorWithStandalone = navigator as Navigator & {
      standalone?: boolean;
    };
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      navigatorWithStandalone.standalone === true;
    const isIos = /iPad|iPhone|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    const platformTimer = window.setTimeout(() => {
      setPlatform(
        isStandalone
          ? "installed"
          : isIos
            ? "ios"
            : isAndroid
              ? "android"
              : "desktop",
      );
    }, 0);

    const handleInstallPrompt = (event: Event) => {
      if (!isAndroid) return;

      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setPlatform("android");
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setPlatform("installed");
      setInstructionsOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.clearTimeout(platformTimer);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (desktopRuntime || platform === null || platform === "installed") {
    return null;
  }

  if (platform === "desktop") {
    return (
      <a
        href={windowsDownloadUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="ดาวน์โหลดและติดตั้งแอป Scisiam สำหรับ Windows"
        className={installControlClassName}
      >
        <Download aria-hidden="true" className="h-4 w-4" />
        <span>ติดตั้งแอป Windows</span>
      </a>
    );
  }

  const handleMobileInstall = async () => {
    if (!installPrompt) {
      setInstructionsOpen(true);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleMobileInstall}
        aria-haspopup={installPrompt ? undefined : "dialog"}
        className={installControlClassName}
      >
        <Download aria-hidden="true" className="h-5 w-5" />
        <span>ติดตั้งแอป</span>
      </button>

      <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] gap-5 rounded-2xl p-5 sm:max-w-md sm:p-6">
          <DialogHeader className="pr-8">
            <div className="mb-1 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Smartphone aria-hidden="true" className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-extrabold leading-[1.45] text-slate-950">
              ติดตั้ง Scisiam บนโทรศัพท์
            </DialogTitle>
            <DialogDescription className="font-semibold leading-relaxed text-slate-600">
              เพิ่ม Scisiam ไปยังหน้าจอโฮม แล้วเปิดใช้งานแบบเต็มจอได้เหมือนแอป
            </DialogDescription>
          </DialogHeader>

          {platform === "ios" ? (
            <ol className="grid gap-3 text-sm font-semibold leading-relaxed text-slate-700">
              <InstallStep
                icon={Share2}
                number={1}
                text="แตะปุ่มแชร์ของเบราว์เซอร์"
              />
              <InstallStep
                icon={Smartphone}
                number={2}
                text="เลือก “เพิ่มไปยังหน้าจอโฮม”"
              />
              <InstallStep
                icon={Download}
                number={3}
                text="แตะ “เพิ่ม” เพื่อสร้างไอคอน Scisiam"
              />
            </ol>
          ) : (
            <ol className="grid gap-3 text-sm font-semibold leading-relaxed text-slate-700">
              <InstallStep
                icon={MoreVertical}
                number={1}
                text="แตะเมนูจุดสามจุดของ Chrome"
              />
              <InstallStep
                icon={Download}
                number={2}
                text="เลือก “ติดตั้งแอป” หรือ “เพิ่มไปยังหน้าจอหลัก”"
              />
            </ol>
          )}

          <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold leading-relaxed text-slate-500">
            หากติดตั้งไว้แล้ว ให้เปิด Scisiam จากไอคอนบนหน้าจอโฮมได้ทันที
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InstallStep({
  icon: Icon,
  number,
  text,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  number: number;
  text: string;
}) {
  return (
    <li className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
        <Icon aria-hidden={true} className="h-4 w-4" />
      </span>
      <span>
        <span className="mr-1 text-blue-600">{number}.</span>
        {text}
      </span>
    </li>
  );
}

const installControlClassName =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-2.5 text-xs font-extrabold leading-[1.45] text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-100/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:text-sm";
