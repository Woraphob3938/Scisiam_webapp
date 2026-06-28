"use client";

import React from "react";
import { LayoutGrid, Atom, Beaker, Leaf, BookOpen, Calculator } from "lucide-react";
import Image from "next/image";

export type Category = "All" | "Foundation" | "Physics" | "Chemistry" | "Biology" | "Mathematics";

const categoriesList = [
  { id: "All" as Category, name: "ทั้งหมด", icon: LayoutGrid, color: "blue", imagePath: null },
  { id: "Foundation" as Category, name: "ความรู้พื้นฐาน", icon: BookOpen, color: "sky", imagePath: null },
  { id: "Physics" as Category, name: "ฟิสิกส์", icon: Atom, color: "indigo", imagePath: "/images/categories/physics.png" },
  { id: "Chemistry" as Category, name: "เคมี", icon: Beaker, color: "purple", imagePath: "/images/categories/chemistry.png" },
  { id: "Biology" as Category, name: "ชีววิทยา", icon: Leaf, color: "green", imagePath: "/images/categories/biology.png" },
  { id: "Mathematics" as Category, name: "คณิตศาสตร์", icon: Calculator, color: "pink", imagePath: null },
];

const activeColorClasses: Record<string, string> = {
  blue: "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/15",
  sky: "border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-500/15",
  indigo: "border-blue-200 bg-blue-50/80 text-blue-700 shadow-sm shadow-blue-500/5",
  purple: "border-purple-200 bg-purple-50/80 text-purple-700 shadow-sm shadow-purple-500/5",
  green: "border-green-200 bg-green-50/80 text-green-700 shadow-sm shadow-green-500/5",
  violet: "border-violet-200 bg-violet-50/80 text-violet-700 shadow-sm shadow-violet-500/5",
  pink: "border-pink-200 bg-pink-50/80 text-pink-900 shadow-sm shadow-pink-200/40",
};

interface CategoryFilterProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex w-full justify-center px-4 pb-5 pt-4 md:pb-6">
      <div className="w-full max-w-4xl rounded-full border border-slate-200/80 bg-white p-1.5 shadow-sm">
        <div className="grid grid-cols-3 w-full gap-1.5 sm:grid-cols-6">
        {categoriesList.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={`
                flex min-h-10 cursor-pointer select-none items-center justify-center gap-1.5 rounded-full border px-2 py-2 text-xs font-bold leading-[1.45] tracking-normal sm:gap-2 sm:px-4 sm:text-sm
                transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100
                ${
                  isActive
                    ? activeColorClasses[category.color] || activeColorClasses.blue
                    : "border-transparent bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
              aria-pressed={isActive}
            >
              {category.imagePath ? (
                <div className="hidden sm:flex shrink-0 w-8 h-8 items-center justify-center relative overflow-hidden rounded-full">
                  <Image
                    src={category.imagePath}
                    alt=""
                    width={48}
                    height={48}
                    className={`object-contain transition-all duration-200 scale-[2.2] ${
                      isActive ? "opacity-100" : "opacity-75 group-hover:opacity-100"
                    }`}
                  />
                </div>
              ) : (
                <Icon
                  className={`hidden h-4 w-4 sm:block ${
                    isActive
                      ? category.id === "Mathematics"
                        ? "text-pink-700"
                        : "text-white"
                      : "text-slate-400"
                  }`}
                />
              )}
              <span className="truncate">{category.name}</span>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
