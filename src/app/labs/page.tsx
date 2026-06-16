"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import LabCard from "@/components/LabCard";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { labsData } from "@/data/labs";
import { isLabReady } from "@/data/labReadiness";

const INITIAL_VISIBLE_LABS = 12;
const VALID_CATEGORIES: Category[] = ["All", "Physics", "Chemistry", "Biology"];
const CATEGORY_LABELS: Record<Category, string> = {
  All: "ทั้งหมด",
  Physics: "ฟิสิกส์",
  Chemistry: "เคมี",
  Biology: "ชีววิทยา",
};

function getInitialCategory(searchParams: URLSearchParams): Category {
  const param = searchParams.get("category");
  if (param && VALID_CATEGORIES.includes(param as Category)) {
    return param as Category;
  }
  return "All";
}

function LabsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isCollapsed } = useSidebar();

  const [selectedCategory, setSelectedCategory] = useState<Category>(
    () => getInitialCategory(searchParams)
  );
  const [showAllLabs, setShowAllLabs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categoryLabs = useMemo(
    () =>
      selectedCategory === "All"
        ? labsData
        : labsData.filter((lab) => lab.category === selectedCategory),
    [selectedCategory]
  );

  const readyLabCount = useMemo(
    () => categoryLabs.filter((lab) => isLabReady(lab.id)).length,
    [categoryLabs]
  );

  const filteredLabs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categoryLabs.filter((lab) => {
      const matchesSearch =
        !query ||
        lab.title.toLowerCase().includes(query) ||
        lab.description.toLowerCase().includes(query) ||
        lab.category.toLowerCase().includes(query) ||
        CATEGORY_LABELS[lab.category].toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [categoryLabs, searchQuery]);

  const visibleLabs = showAllLabs
    ? filteredLabs
    : filteredLabs.slice(0, INITIAL_VISIBLE_LABS);
  const hiddenLabCount = filteredLabs.length - visibleLabs.length;
  const availabilityHeading = "พร้อมทดลองทันที";

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

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    setShowAllLabs(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />

      <div className="hidden lg:block">
        <Sidebar activeMenu="ห้องแล็บ" />
      </div>

      <main
        className={`relative z-10 min-w-0 pb-28 transition-[padding-left] duration-300 lg:pb-12 ${
          isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"
        }`}
      >
        <HeroSection
          searchQuery={searchQuery}
          onSearchQueryChange={handleSearchQueryChange}
        />

        <CategoryFilter
          activeCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <section className="w-full px-4 pb-8 pt-1 lg:px-8">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3.5 shadow-sm shadow-slate-200/40 lg:flex-row lg:items-center lg:justify-between lg:px-5">
            <div className="min-w-0">
              <p className="text-xs font-bold leading-[1.45] text-blue-600">
                ห้องแล็บสำหรับเริ่มใช้งาน
              </p>
              <h2 className="mt-1 text-lg font-extrabold leading-[1.45] tracking-normal text-slate-900">
                {availabilityHeading}
              </h2>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                แสดง {filteredLabs.length} ห้อง
                {selectedCategory !== "All" ? ` ในหมวด ${CATEGORY_LABELS[selectedCategory]}` : ""} จากทั้งหมด {categoryLabs.length} ห้อง
                {searchQuery.trim() ? ` จากคำค้นหา "${searchQuery.trim()}"` : ""}
              </p>
            </div>

            <div className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-xs font-extrabold leading-[1.45] text-emerald-700">
              <CheckCircle className="h-4 w-4" />
              พร้อมทดลอง {readyLabCount} ห้อง
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

export default function LabsPage() {
  return (
    <Suspense>
      <LabsContent />
    </Suspense>
  );
}
