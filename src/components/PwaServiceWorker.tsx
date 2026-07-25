"use client";

import { RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export default function PwaServiceWorker() {
  const [updateReady, setUpdateReady] = useState(false);
  const [updating, setUpdating] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);
  const deferredRef = useRef(false);
  const reloadRequestedRef = useRef(false);
  const reloadingRef = useRef(false);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    let disposed = false;
    let updateInterval: ReturnType<typeof setInterval> | undefined;
    let removeRegistrationListeners: (() => void) | undefined;

    const offerUpdate = (registration: ServiceWorkerRegistration) => {
      if (
        disposed ||
        deferredRef.current ||
        !navigator.serviceWorker.controller ||
        !registration.waiting
      ) {
        return;
      }

      waitingWorkerRef.current = registration.waiting;
      setUpdateReady(true);
    };

    const watchRegistration = (registration: ServiceWorkerRegistration) => {
      registrationRef.current = registration;
      offerUpdate(registration);

      const handleUpdateFound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        const handleStateChange = () => {
          if (installingWorker.state === "installed") {
            offerUpdate(registration);
          }
        };

        installingWorker.addEventListener("statechange", handleStateChange);
      };

      registration.addEventListener("updatefound", handleUpdateFound);
      removeRegistrationListeners = () => {
        registration.removeEventListener("updatefound", handleUpdateFound);
      };
    };

    const checkForUpdate = () => {
      if (document.visibilityState === "visible") {
        void registrationRef.current?.update().catch(() => {
          // The current app keeps working when an update check is unavailable.
        });
      }
    };

    const handleControllerChange = () => {
      if (!reloadRequestedRef.current || reloadingRef.current) return;
      reloadingRef.current = true;
      window.location.reload();
    };

    const registerWorker = () => {
      void navigator.serviceWorker.register("/sw.js")
        .then((registration) => {
          if (disposed) return;
          watchRegistration(registration);
          updateInterval = setInterval(
            checkForUpdate,
            UPDATE_CHECK_INTERVAL_MS,
          );
        })
        .catch(() => {
          // Installation remains available through the manifest if registration fails.
        });
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );
    window.addEventListener("focus", checkForUpdate);
    document.addEventListener("visibilitychange", checkForUpdate);

    if (document.readyState === "complete") {
      registerWorker();
    } else {
      window.addEventListener("load", registerWorker, { once: true });
    }

    return () => {
      disposed = true;
      if (updateInterval) clearInterval(updateInterval);
      removeRegistrationListeners?.();
      window.removeEventListener("load", registerWorker);
      window.removeEventListener("focus", checkForUpdate);
      document.removeEventListener("visibilitychange", checkForUpdate);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  const updateNow = () => {
    const waitingWorker =
      waitingWorkerRef.current ?? registrationRef.current?.waiting;
    if (!waitingWorker) return;

    reloadRequestedRef.current = true;
    setUpdating(true);
    waitingWorker.postMessage({ type: "SCISIAM_SKIP_WAITING" });
  };

  const updateLater = () => {
    deferredRef.current = true;
    setUpdateReady(false);
  };

  if (!updateReady) return null;

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="scisiam-update-title"
      className="fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-[1200] mx-auto w-auto max-w-md rounded-2xl border border-blue-200 bg-white p-4 shadow-2xl shadow-blue-950/20 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:w-[390px]"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white">
          <RefreshCw
            className={`h-5 w-5 ${updating ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="scisiam-update-title"
            className="text-base font-extrabold leading-[1.45] text-slate-950"
          >
            Scisiam เวอร์ชันใหม่พร้อมใช้งาน
          </h2>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">
            อัปเดตเพื่อรับการปรับปรุงล่าสุด โดยข้อมูลบัญชีและผลการทดลองที่บันทึกไว้จะยังอยู่ครบ
          </p>
        </div>
        <button
          type="button"
          onClick={updateLater}
          disabled={updating}
          aria-label="ไว้ทีหลัง"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={updateLater}
          disabled={updating}
          className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ไว้ทีหลัง
        </button>
        <button
          type="button"
          onClick={updateNow}
          disabled={updating}
          className="min-h-11 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200 disabled:cursor-wait disabled:opacity-70"
        >
          {updating ? "กำลังอัปเดต..." : "อัปเดตตอนนี้"}
        </button>
      </div>
    </section>
  );
}
