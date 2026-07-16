"use client";

import React, { useRef } from "react";
import { FileText, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SOFTWARE_DISCLAIMER } from "@/data/softwareDisclaimer";

export type SoftwareDisclaimerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss?: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
};

export default function SoftwareDisclaimerDialog({
  open,
  onOpenChange,
  onDismiss,
  returnFocusRef,
}: SoftwareDisclaimerDialogProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onDismiss?.();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="flex max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-h-[min(820px,calc(100svh-3rem))] sm:w-[calc(100%-3rem)] sm:max-w-5xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          titleRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          if (!returnFocusRef?.current) return;
          event.preventDefault();
          returnFocusRef.current.focus();
        }}
      >
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-5 pr-14 sm:px-7">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-extrabold text-blue-800">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            NSC 2026
          </span>
          <DialogTitle
            ref={titleRef}
            tabIndex={-1}
            className="text-xl font-extrabold leading-[1.4] text-slate-950 outline-none sm:text-2xl"
          >
            ข้อตกลงในการใช้ซอฟต์แวร์
          </DialogTitle>
        </DialogHeader>

        <div
          tabIndex={0}
          className="grid min-h-0 gap-5 overflow-y-auto bg-slate-50/70 px-5 py-5 text-base leading-[1.7] text-slate-900 outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-600 sm:px-7"
        >
          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <FileText
                className="mt-1 h-5 w-5 shrink-0 text-blue-700"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-950">
                  {SOFTWARE_DISCLAIMER.productName}
                </h3>
                <p className="mt-1 text-sm leading-[1.7] text-slate-700">
                  {SOFTWARE_DISCLAIMER.workTitle}
                </p>
              </div>
            </div>
            <dl className="grid gap-3 text-sm leading-[1.7] sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="font-extrabold text-slate-950">คณะผู้พัฒนา</dt>
                <dd className="mt-1 text-slate-700">
                  <ul className="grid gap-x-5 gap-y-1 lg:grid-cols-3">
                    {SOFTWARE_DISCLAIMER.developers.map((developer) => (
                      <li key={developer} className="whitespace-nowrap">
                        {developer}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="font-extrabold text-slate-950">อาจารย์ที่ปรึกษา</dt>
                <dd className="text-slate-700">{SOFTWARE_DISCLAIMER.advisor}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-extrabold text-slate-950">สถาบัน</dt>
                <dd className="text-slate-700">{SOFTWARE_DISCLAIMER.institution}</dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <h3 className="font-extrabold text-slate-950">
              ข้อความข้อตกลงฉบับเต็ม
            </h3>
            <p className="text-base leading-[1.7] text-slate-900">
              {SOFTWARE_DISCLAIMER.body}
            </p>
          </section>
        </div>

        <DialogFooter className="mx-0 mb-0 rounded-none border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
          <DialogClose asChild>
            <button
              type="button"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto"
            >
              รับทราบและดำเนินการต่อ
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
