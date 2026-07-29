"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import LabCard, { type GradeLevel } from "@/components/LabCard";
import LabLoadingAtom from "@/components/labs/LabLoadingAtom";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { labsData } from "@/data/labs";
import { isLabReady } from "@/data/labReadiness";
import { matchesLabSearch } from "@/lib/lab-search";

const INITIAL_VISIBLE_LABS = 12;
const LABS_RETURN_STATE_KEY = "scisiam_labs_return_state";
const VALID_CATEGORIES: Category[] = ["All", "Foundation", "Physics", "Chemistry", "Biology", "Mathematics"];
type GradeFilter = "All" | GradeLevel;
const GRADE_FILTERS: Array<{ id: GradeFilter; label: string }> = [
  { id: "All", label: "ทุกระดับ" },
  { id: "ประถม", label: "ประถม" },
  { id: "มัธยมต้น", label: "มัธยมต้น" },
  { id: "มัธยมปลาย", label: "มัธยมปลาย" },
  { id: "อุดมศึกษา", label: "อุดมศึกษา" },
];
type LabsReturnState = {
  scrollY: number;
  selectedCategory: Category;
  selectedGradeLevel: GradeFilter;
  showAllLabs: boolean;
  searchQuery: string;
};

function useMobileDiscovery() {
  const [isMobileDiscovery, setIsMobileDiscovery] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobileDiscovery(event.matches);
    };

    setIsMobileDiscovery(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isMobileDiscovery;
}

function readLabsReturnState(): LabsReturnState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(LABS_RETURN_STATE_KEY);
    if (!raw) return null;

    const state = JSON.parse(raw) as Partial<LabsReturnState>;
    const selectedCategory = state.selectedCategory && VALID_CATEGORIES.includes(state.selectedCategory)
      ? state.selectedCategory
      : null;
    const selectedGradeLevel = state.selectedGradeLevel && GRADE_FILTERS.some((grade) => grade.id === state.selectedGradeLevel)
      ? state.selectedGradeLevel
      : null;
    const scrollY = Number(state.scrollY);

    if (!selectedCategory || !selectedGradeLevel || !Number.isFinite(scrollY)) {
      sessionStorage.removeItem(LABS_RETURN_STATE_KEY);
      return null;
    }

    return {
      scrollY,
      selectedCategory,
      selectedGradeLevel,
      showAllLabs: Boolean(state.showAllLabs),
      searchQuery: typeof state.searchQuery === "string" ? state.searchQuery : "",
    };
  } catch {
    sessionStorage.removeItem(LABS_RETURN_STATE_KEY);
    return null;
  }
}

function LabsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isCollapsed } = useSidebar();
  const restoredState = useMemo(() => readLabsReturnState(), []);
  const requestedCategory = getRequestedCategory(searchParams);
  const isMobileDiscovery = useMobileDiscovery();

  const [selectedCategory, setSelectedCategory] = useState<Category>(
    () => requestedCategory ?? restoredState?.selectedCategory ?? "All"
  );
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<GradeFilter>(
    () => requestedCategory ? "All" : restoredState?.selectedGradeLevel ?? "All"
  );
  const [showAllLabs, setShowAllLabs] = useState(
    () => requestedCategory ? false : restoredState?.showAllLabs ?? false
  );
  const [searchQuery, setSearchQuery] = useState(
    () => requestedCategory ? "" : restoredState?.searchQuery ?? ""
  );
  const [isEnteringLab, setIsEnteringLab] = useState(false);
  const effectiveCategory = isMobileDiscovery ? "All" : selectedCategory;
  const effectiveGradeLevel = isMobileDiscovery ? "All" : selectedGradeLevel;

  const categoryLabs = useMemo(
    () =>
      effectiveCategory === "All"
        ? labsData
        : labsData.filter((lab) => lab.category === effectiveCategory),
    [effectiveCategory]
  );

  const filteredLabs = useMemo(() => {
    const searchLabs = searchQuery.trim() ? labsData : categoryLabs;

    return searchLabs.filter((lab) => {
      const matchesGrade =
        effectiveGradeLevel === "All" || lab.gradeLevel === effectiveGradeLevel;
      const matchesSearch = matchesLabSearch(lab, searchQuery);

      return matchesGrade && matchesSearch;
    });
  }, [categoryLabs, effectiveGradeLevel, searchQuery]);

  const visibleLabs = showAllLabs ? filteredLabs : filteredLabs.slice(0, INITIAL_VISIBLE_LABS);
  const hiddenLabCount = filteredLabs.length - visibleLabs.length;
  const hasNoResults = filteredLabs.length === 0;

  useEffect(() => {
    if (requestedCategory) {
      sessionStorage.removeItem(LABS_RETURN_STATE_KEY);
      return;
    }

    if (!restoredState) return;

    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, restoredState.scrollY)));
    sessionStorage.removeItem(LABS_RETURN_STATE_KEY);
  }, [requestedCategory, restoredState]);

  const saveReturnState = useCallback(() => {
    const state: LabsReturnState = {
      scrollY: window.scrollY,
      selectedCategory,
      selectedGradeLevel,
      showAllLabs,
      searchQuery,
    };
    sessionStorage.setItem(LABS_RETURN_STATE_KEY, JSON.stringify(state));
  }, [searchQuery, selectedCategory, selectedGradeLevel, showAllLabs]);

  const handleEnterRoom = (id: string) => {
    if (!isLabReady(id) || isEnteringLab) return;
    setIsEnteringLab(true);
    saveReturnState();
    router.push(`/labs/${id}/simulation`);
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    if (category === "Foundation") {
      setSelectedGradeLevel("All");
    }
    setShowAllLabs(false);
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    if (!isMobileDiscovery) {
      if (query.trim()) {
        setSelectedCategory("All");
        setSelectedGradeLevel("All");
      }
    }
    setShowAllLabs(false);
  };

  const handleGradeLevelChange = (gradeLevel: GradeFilter) => {
    setSelectedGradeLevel(gradeLevel);
    setShowAllLabs(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />

      <div className="hidden lg:block">
        <Sidebar activeMenu="ห้องแล็บ" />
      </div>

      <main
        aria-busy={isEnteringLab}
        className={`relative z-10 min-w-0 pb-28 transition-[padding-left] duration-300 lg:pb-12 ${
          isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"
        }`}
      >
        <HeroSection
          searchQuery={searchQuery}
          onSearchQueryChange={handleSearchQueryChange}
        />

        <div className="hidden sm:block">
          <CategoryFilter
            activeCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        <section className="w-full px-4 pb-8 pt-1 lg:px-8">
          <div className="mb-4 hidden flex-wrap justify-center gap-2 sm:flex">
            {GRADE_FILTERS.map((grade) => {
              const isActive = selectedGradeLevel === grade.id;
              return (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => handleGradeLevelChange(grade.id)}
                  className={`min-h-11 rounded-xl border px-3 py-2 text-xs font-extrabold leading-[1.45] transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {grade.label}
                </button>
              );
            })}
          </div>

          {filteredLabs.length > 0 && (
            <section className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-4 md:px-5">
              <p className="text-sm font-extrabold leading-[1.45] text-slate-950">
                แล็บในมุมมองนี้ {filteredLabs.length} แล็บ
              </p>
            </section>
          )}

          {hasNoResults ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
              <HelpCircle className="h-10 w-10 text-slate-300" />
              <h2 className="text-lg font-bold leading-[1.5] text-slate-700">
                ไม่พบห้องแล็บในหมวดหรือระดับนี้
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
                className="mt-2 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
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

      {isEnteringLab && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/35 px-4"
          role="status"
          aria-label="กำลังโหลดแล็บทดลอง"
          aria-live="polite"
        >
          <LabLoadingAtom />
        </div>
      )}
    </div>
  );
}

function getRequestedCategory(searchParams: Pick<URLSearchParams, "get">): Category | null {
  const param = searchParams.get("category");
  if (param && VALID_CATEGORIES.includes(param as Category)) {
    return param as Category;
  }
  return null;
}

export default function LabsPage() {
  return (
    <Suspense>
      <LabsContent />
    </Suspense>
  );
}
