"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Atom,
  BarChart3,
  Beaker,
  BookOpenCheck,
  FlaskConical,
  Gauge,
  HelpCircle,
  Leaf,
  Microscope,
  Ruler,
  ShieldCheck,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import LabCard, { type GradeLevel } from "@/components/LabCard";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { labsData } from "@/data/labs";
import { isLabReady } from "@/data/labReadiness";

const INITIAL_VISIBLE_LABS = 12;
const LABS_RETURN_STATE_KEY = "scisiam_labs_return_state";
const VALID_CATEGORIES: Category[] = ["All", "Foundation", "Physics", "Chemistry", "Biology"];
type GradeFilter = "All" | GradeLevel;
const GRADE_FILTERS: Array<{ id: GradeFilter; label: string }> = [
  { id: "All", label: "ทุกระดับ" },
  { id: "ประถม", label: "ประถม" },
  { id: "มัธยมต้น", label: "มัธยมต้น" },
  { id: "มัธยมปลาย", label: "มัธยมปลาย" },
];
const CATEGORY_LABELS: Record<Category, string> = {
  All: "ทั้งหมด",
  Foundation: "ความรู้พื้นฐาน",
  Physics: "ฟิสิกส์",
  Chemistry: "เคมี",
  Biology: "ชีววิทยา",
};

type LabsReturnState = {
  scrollY: number;
  selectedCategory: Category;
  selectedGradeLevel: GradeFilter;
  showAllLabs: boolean;
  searchQuery: string;
};

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

type LabCategory = Exclude<Category, "All" | "Foundation">;
type FoundationTrack = "Science" | LabCategory;

interface FoundationTopic {
  id: string;
  title: string;
  description: string;
  track: FoundationTrack;
  nextCategories: LabCategory[];
  icon: LucideIcon;
}

const FOUNDATION_ENTRY_LAB_IDS: Record<string, string> = {
  "periodic-table": "periodic-table",
  "lab-safety": "acid-base-titration",
  "measurement-units": "newtons-cooling",
  "variables-hypothesis": "newtons-cooling",
  "data-graphs": "newtons-cooling",
  "models-evidence": "ideal-gas-law",
  "math-for-science": "ohms-law",
  "matter-particles": "periodic-table",
  "energy-transfer": "newtons-cooling",
  "forces-motion": "newtons-second-law",
  "waves-light-sound": "snells-law",
  "electricity-magnetism": "ohms-law",
  "solutions-acid-base": "acid-base-titration",
  "reactions-equilibrium": "chemical-kinetics",
  "gases-pressure-volume": "ideal-gas-law",
  "cells-transport": "cell-osmosis",
  "genetics-cell-cycle": "mendels-inheritance",
  "ecosystems-energy-flow": "food-chain",
};

const FOUNDATION_TRACK_LABELS: Record<FoundationTrack, string> = {
  Science: "พื้นฐานร่วม",
  Physics: "ต่อยอดฟิสิกส์",
  Chemistry: "ต่อยอดเคมี",
  Biology: "ต่อยอดชีววิทยา",
};

const FOUNDATION_TRACK_STYLES: Record<
  FoundationTrack,
  { card: string; icon: string; badge: string; button: string }
> = {
  Science: {
    card: "border-sky-100 bg-sky-50/25",
    icon: "bg-sky-50 text-sky-600 ring-sky-100",
    badge: "border-sky-100 bg-sky-50 text-sky-700",
    button: "border-sky-100 bg-white text-sky-700 hover:bg-sky-50",
  },
  Physics: {
    card: "border-blue-100 bg-blue-50/25",
    icon: "bg-blue-50 text-blue-600 ring-blue-100",
    badge: "border-blue-100 bg-blue-50 text-blue-700",
    button: "border-blue-100 bg-white text-blue-700 hover:bg-blue-50",
  },
  Chemistry: {
    card: "border-purple-100 bg-purple-50/25",
    icon: "bg-purple-50 text-purple-600 ring-purple-100",
    badge: "border-purple-100 bg-purple-50 text-purple-700",
    button: "border-purple-100 bg-white text-purple-700 hover:bg-purple-50",
  },
  Biology: {
    card: "border-emerald-100 bg-emerald-50/25",
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
    button: "border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50",
  },
};

const foundationTopics: FoundationTopic[] = [
  {
    id: "periodic-table",
    title: "ตารางธาตุ",
    description: "สำรวจเลขอะตอม สัญลักษณ์ มวลอะตอม คาบ หมู่ และหมวดธาตุหลัก 7 หมู่ก่อนต่อยอดสู่แล็บเคมี",
    track: "Chemistry",
    nextCategories: ["Chemistry"],
    icon: Atom,
  },
  {
    id: "lab-safety",
    title: "ความปลอดภัยในห้องทดลอง",
    description: "รู้จักสัญลักษณ์อันตราย การใช้อุปกรณ์พื้นฐาน การป้องกันตัว และการจัดการเหตุฉุกเฉิน",
    track: "Science",
    nextCategories: ["Physics", "Chemistry", "Biology"],
    icon: ShieldCheck,
  },
  {
    id: "measurement-units",
    title: "การวัด หน่วย และเครื่องมือ",
    description: "อ่านสเกล ใช้หน่วย SI แปลงหน่วย และเลือกเครื่องมือวัดให้เหมาะกับข้อมูลที่ต้องการ",
    track: "Science",
    nextCategories: ["Physics", "Chemistry", "Biology"],
    icon: Ruler,
  },
  {
    id: "variables-hypothesis",
    title: "ตัวแปร สมมติฐาน และการควบคุมการทดลอง",
    description: "แยกตัวแปรต้น ตัวแปรตาม ตัวแปรควบคุม และออกแบบการทดลองให้เปรียบเทียบได้ยุติธรรม",
    track: "Science",
    nextCategories: ["Physics", "Chemistry", "Biology"],
    icon: FlaskConical,
  },
  {
    id: "data-graphs",
    title: "การบันทึกข้อมูล กราฟ และการแปลผล",
    description: "จัดตารางข้อมูล เลือกกราฟที่เหมาะสม อ่านแนวโน้ม และเชื่อมข้อมูลกับคำอธิบายทางวิทยาศาสตร์",
    track: "Science",
    nextCategories: ["Physics", "Chemistry", "Biology"],
    icon: BarChart3,
  },
  {
    id: "models-evidence",
    title: "แบบจำลอง หลักฐาน และข้อจำกัด",
    description: "เข้าใจว่าแบบจำลองช่วยอธิบายปรากฏการณ์ได้ แต่ต้องตรวจสอบด้วยหลักฐานและเงื่อนไขของระบบ",
    track: "Science",
    nextCategories: ["Physics", "Chemistry", "Biology"],
    icon: BookOpenCheck,
  },
  {
    id: "math-for-science",
    title: "คณิตศาสตร์สำหรับวิทยาศาสตร์",
    description: "ใช้สัดส่วน อัตรา ร้อยละ ค่าเฉลี่ย สมการง่าย ๆ และการอ่านหน่วยเพื่อช่วยวิเคราะห์การทดลอง",
    track: "Science",
    nextCategories: ["Physics", "Chemistry"],
    icon: Sparkles,
  },
  {
    id: "matter-particles",
    title: "สสาร อนุภาค และสมบัติของสาร",
    description: "รู้จักสถานะของสาร อะตอม โมเลกุล ไอออน ความหนาแน่น และสมบัติทางกายภาพ/เคมี",
    track: "Chemistry",
    nextCategories: ["Chemistry", "Physics"],
    icon: Atom,
  },
  {
    id: "energy-transfer",
    title: "พลังงาน งาน และการถ่ายโอนพลังงาน",
    description: "เข้าใจรูปแบบพลังงาน การอนุรักษ์พลังงาน ความร้อน แสง ไฟฟ้า และพลังงานในสิ่งมีชีวิต",
    track: "Physics",
    nextCategories: ["Physics", "Chemistry", "Biology"],
    icon: Gauge,
  },
  {
    id: "forces-motion",
    title: "แรง การเคลื่อนที่ และสมดุล",
    description: "ปูพื้นฐานแรง มวล ความเร็ว ความเร่ง แรงเสียดทาน และการวิเคราะห์การเคลื่อนที่ของวัตถุ",
    track: "Physics",
    nextCategories: ["Physics"],
    icon: Target,
  },
  {
    id: "waves-light-sound",
    title: "คลื่น แสง และเสียง",
    description: "เข้าใจแอมพลิจูด ความถี่ ความยาวคลื่น การสะท้อน การหักเห และการเกิดภาพหรือเสียง",
    track: "Physics",
    nextCategories: ["Physics"],
    icon: Sparkles,
  },
  {
    id: "electricity-magnetism",
    title: "ไฟฟ้า แม่เหล็ก และวงจร",
    description: "รู้จักประจุไฟฟ้า กระแส ความต่างศักย์ ความต้านทาน สนามแม่เหล็ก และการต่อวงจรพื้นฐาน",
    track: "Physics",
    nextCategories: ["Physics", "Chemistry"],
    icon: Gauge,
  },
  {
    id: "solutions-acid-base",
    title: "สารละลาย กรด-เบส และความเข้มข้น",
    description: "เข้าใจตัวทำละลาย ตัวละลาย โมลาริตี การเจือจาง pH อินดิเคเตอร์ และการไทเทรต",
    track: "Chemistry",
    nextCategories: ["Chemistry"],
    icon: Beaker,
  },
  {
    id: "reactions-equilibrium",
    title: "ปฏิกิริยาเคมี อัตรา และสมดุล",
    description: "เชื่อมสารตั้งต้น ผลิตภัณฑ์ พลังงาน อัตราการเกิดปฏิกิริยา ตัวเร่ง และสมดุลเคมี",
    track: "Chemistry",
    nextCategories: ["Chemistry"],
    icon: FlaskConical,
  },
  {
    id: "gases-pressure-volume",
    title: "แก๊ส ความดัน ปริมาตร และอุณหภูมิ",
    description: "เข้าใจความสัมพันธ์ของอนุภาคแก๊ส ความดัน ปริมาตร อุณหภูมิ และจำนวนโมล",
    track: "Chemistry",
    nextCategories: ["Chemistry", "Physics"],
    icon: Gauge,
  },
  {
    id: "cells-transport",
    title: "เซลล์ โครงสร้าง และการลำเลียงสาร",
    description: "รู้จักเซลล์ เยื่อหุ้มเซลล์ ออร์แกเนลล์ การแพร่ ออสโมซิส และการรักษาสมดุลของเซลล์",
    track: "Biology",
    nextCategories: ["Biology"],
    icon: Microscope,
  },
  {
    id: "genetics-cell-cycle",
    title: "DNA พันธุกรรม และวัฏจักรเซลล์",
    description: "ปูพื้นฐานยีน โครโมโซม การถ่ายทอดลักษณะ การแบ่งเซลล์ และความแปรผันของสิ่งมีชีวิต",
    track: "Biology",
    nextCategories: ["Biology"],
    icon: Leaf,
  },
  {
    id: "ecosystems-energy-flow",
    title: "ระบบนิเวศ ห่วงโซ่อาหาร และการไหลของพลังงาน",
    description: "เข้าใจผู้ผลิต ผู้บริโภค ผู้ย่อยสลาย ความสัมพันธ์ของสิ่งมีชีวิต และผลของสิ่งแวดล้อม",
    track: "Biology",
    nextCategories: ["Biology"],
    icon: Leaf,
  },
];

function getInitialCategory(searchParams: URLSearchParams): Category {
  const param = searchParams.get("category");
  if (param && VALID_CATEGORIES.includes(param as Category)) {
    return param as Category;
  }
  return "All";
}

function FoundationCard({
  topic,
  onEnterLab,
}: {
  topic: FoundationTopic;
  onEnterLab: (labId: string) => void;
}) {
  const Icon = topic.icon;
  const styles = FOUNDATION_TRACK_STYLES[topic.track];
  const entryLabId = FOUNDATION_ENTRY_LAB_IDS[topic.id] ?? "periodic-table";

  return (
    <article
      className={`flex min-h-[260px] flex-col rounded-2xl border bg-white p-5 shadow-sm shadow-slate-200/40 transition-colors hover:border-blue-200 ${styles.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-extrabold leading-[1.45] ${styles.badge}`}
        >
          {FOUNDATION_TRACK_LABELS[topic.track]}
        </span>
      </div>

      <div className="mt-5 min-w-0 flex-1">
        <h3 className="text-xl font-extrabold leading-[1.45] tracking-normal text-slate-950">
          {topic.title}
        </h3>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
          {topic.description}
        </p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onEnterLab(entryLabId)}
          className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-extrabold leading-[1.45] transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${styles.button}`}
        >
          เข้าห้องทดลอง
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function LabsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isCollapsed } = useSidebar();
  const restoredState = useMemo(() => readLabsReturnState(), []);

  const [selectedCategory, setSelectedCategory] = useState<Category>(
    () => restoredState?.selectedCategory ?? getInitialCategory(searchParams)
  );
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<GradeFilter>(
    () => restoredState?.selectedGradeLevel ?? "All"
  );
  const [showAllLabs, setShowAllLabs] = useState(() => restoredState?.showAllLabs ?? false);
  const [searchQuery, setSearchQuery] = useState(() => restoredState?.searchQuery ?? "");
  const isFoundationCategory = selectedCategory === "Foundation";

  const categoryLabs = useMemo(
    () =>
      selectedCategory === "All"
        ? labsData
        : selectedCategory === "Foundation"
        ? []
        : labsData.filter((lab) => lab.category === selectedCategory),
    [selectedCategory]
  );

  const filteredFoundationTopics = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return foundationTopics;

    return foundationTopics.filter((topic) => {
      const searchableText = [
        topic.title,
        topic.description,
        FOUNDATION_TRACK_LABELS[topic.track],
        ...topic.nextCategories.map((category) => CATEGORY_LABELS[category]),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchQuery]);

  const filteredLabs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categoryLabs.filter((lab) => {
      const matchesGrade =
        selectedGradeLevel === "All" || lab.gradeLevel === selectedGradeLevel;
      const matchesSearch =
        !query ||
        lab.title.toLowerCase().includes(query) ||
        lab.description.toLowerCase().includes(query) ||
        lab.category.toLowerCase().includes(query) ||
        lab.gradeLevel.toLowerCase().includes(query) ||
        CATEGORY_LABELS[lab.category].toLowerCase().includes(query);

      return matchesGrade && matchesSearch;
    });
  }, [categoryLabs, searchQuery, selectedGradeLevel]);

  const visibleLabs = showAllLabs ? filteredLabs : filteredLabs.slice(0, INITIAL_VISIBLE_LABS);
  const hiddenLabCount = filteredLabs.length - visibleLabs.length;
  const hasNoResults = isFoundationCategory
    ? filteredFoundationTopics.length === 0
    : filteredLabs.length === 0;

  useEffect(() => {
    if (!restoredState) return;

    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, restoredState.scrollY)));
    sessionStorage.removeItem(LABS_RETURN_STATE_KEY);
  }, [restoredState]);

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

  const handleViewDetails = (id: string) => {
    if (!isLabReady(id)) return;
    saveReturnState();
    router.push(`/labs/${id}`);
  };

  const handleEnterRoom = (id: string) => {
    if (!isLabReady(id)) return;
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
    setShowAllLabs(false);
  };

  const handleGradeLevelChange = (gradeLevel: GradeFilter) => {
    setSelectedGradeLevel(gradeLevel);
    setShowAllLabs(false);
  };

  const handleFoundationEnterLab = (labId: string) => {
    saveReturnState();
    if (!isLabReady(labId)) {
      router.push(`/labs/${labId}`);
      return;
    }

    router.push(`/labs/${labId}/simulation`);
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
          {!isFoundationCategory && (
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              {GRADE_FILTERS.map((grade) => {
                const isActive = selectedGradeLevel === grade.id;
                return (
                  <button
                    key={grade.id}
                    type="button"
                    onClick={() => handleGradeLevelChange(grade.id)}
                    className={`min-h-9 rounded-xl border px-3 py-1.5 text-xs font-extrabold leading-[1.45] transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100 ${
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
          )}

          {hasNoResults ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
              <HelpCircle className="h-10 w-10 text-slate-300" />
              <h2 className="text-lg font-bold leading-[1.5] text-slate-700">
                {isFoundationCategory
                  ? "ไม่พบหัวข้อความรู้พื้นฐาน"
                  : "ไม่พบห้องแล็บในหมวดหรือระดับนี้"}
              </h2>
              <p className="text-sm font-medium leading-relaxed text-slate-400">
                {isFoundationCategory
                  ? "ลองลบคำค้นหา หรือกลับมาดูหัวข้อพื้นฐานทั้งหมด"
                  : "ลองเปลี่ยนหมวดหรือเลือกดูห้องแล็บทั้งหมด"}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (isFoundationCategory) {
                    setSearchQuery("");
                  } else {
                    setSelectedCategory("All");
                  }
                  setShowAllLabs(false);
                }}
                className="mt-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
              >
                {isFoundationCategory ? "ดูหัวข้อพื้นฐานทั้งหมด" : "ดูห้องแล็บทั้งหมด"}
              </button>
            </div>
          ) : isFoundationCategory ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredFoundationTopics.map((topic) => (
                <FoundationCard
                  key={topic.id}
                  topic={topic}
                  onEnterLab={handleFoundationEnterLab}
                />
              ))}
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
