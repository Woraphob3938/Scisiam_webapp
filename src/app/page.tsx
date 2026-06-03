"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Clock, HelpCircle, LayoutGrid } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import LabCard from "@/components/LabCard";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { labsData } from "@/data/labs";
import { isLabReady } from "@/data/labReadiness";

type AvailabilityFilter = "ready" | "all" | "inDevelopment";

const INITIAL_VISIBLE_LABS = 12;
const VALID_CATEGORIES: Category[] = ["All", "Physics", "Chemistry", "Biology"];

function getInitialCategory(searchParams: URLSearchParams): Category {
  const param = searchParams.get("category");
  if (param && VALID_CATEGORIES.includes(param as Category)) {
    return param as Category;
  }
  return "All";
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isCollapsed } = useSidebar();
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    () => getInitialCategory(searchParams)
  );
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("ready");
  const [showAllLabs, setShowAllLabs] = useState(false);

  const filteredLabs = useMemo(() => {
    return labsData.filter((lab) => {
      const matchesCategory =
        selectedCategory === "All" || lab.category === selectedCategory;
      const ready = isLabReady(lab.id);
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "ready" && ready) ||
        (availabilityFilter === "inDevelopment" && !ready);

      return matchesCategory && matchesAvailability;
    });
  }, [availabilityFilter, selectedCategory]);

  const availabilityCounts = useMemo(() => {
    const categoryLabs =
      selectedCategory === "All"
        ? labsData
        : labsData.filter((lab) => lab.category === selectedCategory);

    const ready = categoryLabs.filter((lab) => isLabReady(lab.id)).length;

    return {
      all: categoryLabs.length,
      ready,
      inDevelopment: categoryLabs.length - ready,
    };
  }, [selectedCategory]);

  const visibleLabs = showAllLabs
    ? filteredLabs
    : filteredLabs.slice(0, INITIAL_VISIBLE_LABS);
  const hiddenLabCount = filteredLabs.length - visibleLabs.length;
  const availabilityHeading =
    availabilityFilter === "ready"
      ? "พร้อมทดลองทันที"
      : availabilityFilter === "inDevelopment"
        ? "กำลังจัดทำ"
        : "ห้องแล็บทั้งหมด";

  const handleViewDetails = (id: string) => {
    if (!isLabReady(id)) return;
    router.push(`/labs/${id}`);
  };

  const handleEnterRoom = (id: string) => {
    if (!isLabReady(id)) return;
    router.push(`/labs/${id}/simulation`);
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setShowAllLabs(false);
  };

  const handleAvailabilityChange = (filter: AvailabilityFilter) => {
    setAvailabilityFilter(filter);
    setShowAllLabs(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />

      <div className="hidden lg:block">
        <Sidebar activeMenu="หน้าหลัก" />
      </div>

      <main
        className={`relative z-10 min-w-0 pb-12 transition-[padding-left] duration-300 ${
          isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"
        }`}
      >
        <HeroSection />

        <CategoryFilter
          activeCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <section className="w-full px-4 pb-8 pt-1 lg:px-8">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-4 shadow-sm shadow-slate-200/40 lg:flex-row lg:items-center lg:justify-between lg:px-5">
            <div className="min-w-0">
              <p className="text-xs font-bold leading-[1.45] text-blue-600">
                ห้องแล็บสำหรับเริ่มใช้งาน
              </p>
              <h2 className="mt-1 text-lg font-extrabold leading-[1.45] tracking-normal text-slate-900">
                {availabilityHeading}
              </h2>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                แสดง {filteredLabs.length} ห้อง
                {selectedCategory !== "All" ? ` ในหมวด ${selectedCategory}` : ""} จากทั้งหมด {labsData.length} ห้อง
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:flex lg:overflow-x-auto lg:pb-1 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
              {[
                {
                  id: "ready" as AvailabilityFilter,
                  label: "พร้อมทดลอง",
                  shortLabel: "พร้อม",
                  count: availabilityCounts.ready,
                  icon: CheckCircle,
                  active: "border-emerald-200 bg-emerald-600 text-white shadow-md shadow-emerald-500/15",
                },
                {
                  id: "all" as AvailabilityFilter,
                  label: "ทั้งหมด",
                  shortLabel: "ทั้งหมด",
                  count: availabilityCounts.all,
                  icon: LayoutGrid,
                  active: "border-blue-200 bg-blue-600 text-white shadow-md shadow-blue-500/15",
                },
                {
                  id: "inDevelopment" as AvailabilityFilter,
                  label: "กำลังจัดทำ",
                  shortLabel: "จัดทำ",
                  count: availabilityCounts.inDevelopment,
                  icon: Clock,
                  active: "border-amber-200 bg-amber-500 text-white shadow-md shadow-amber-500/15",
                },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = availabilityFilter === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleAvailabilityChange(option.id)}
                    className={`inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold leading-[1.45] transition-all duration-200 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 lg:w-auto lg:px-3.5 ${
                      isActive
                        ? option.active
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                    }`}
                    aria-pressed={isActive}
                  >
                    <Icon className="hidden h-4 w-4 sm:block" />
                    <span className="sm:hidden">{option.shortLabel}</span>
                    <span className="hidden sm:inline">{option.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        isActive ? "bg-white/20 text-white" : "bg-white text-slate-500"
                      }`}
                    >
                      {option.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredLabs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
              <HelpCircle className="h-10 w-10 text-slate-300" />
              <h2 className="text-lg font-bold leading-[1.5] text-slate-700">
                ไม่พบห้องแล็บในหมวดหมู่นี้
              </h2>
              <p className="text-sm font-medium leading-relaxed text-slate-400">
                ลองเปลี่ยนหมวดหรือเลือกดูห้องแล็บทั้งหมด
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setAvailabilityFilter("all");
                  setShowAllLabs(false);
                }}
                className="mt-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
              >
                ดูห้องแล็บทั้งหมด
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleLabs.map((lab) => (
                  <LabCard
                    key={lab.id}
                    lab={lab}
                    onViewDetails={handleViewDetails}
                    onEnterRoom={handleEnterRoom}
                  />
                ))}
              </div>

              {hiddenLabCount > 0 && (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAllLabs(true)}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200 bg-white px-5 py-2.5 text-sm font-extrabold leading-[1.45] text-blue-700 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
                  >
                    ดูเพิ่มเติมอีก {hiddenLabCount} ห้อง
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
