"use client";

import React from "react";
import { LayoutGrid, Atom, Beaker, Leaf } from "lucide-react";

export type Category = "All" | "Physics" | "Chemistry" | "Biology";

interface CategoryFilterProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const categoriesList = [
    { id: "All" as Category, name: "ทั้งหมด", icon: LayoutGrid, color: "blue" },
    { id: "Physics" as Category, name: "ฟิสิกส์", icon: Atom, color: "indigo" },
    { id: "Chemistry" as Category, name: "เคมี", icon: Beaker, color: "purple" },
    { id: "Biology" as Category, name: "ชีววิทยา", icon: Leaf, color: "green" },
  ];

  const activeColorClasses: Record<string, string> = {
    blue: "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/15",
    indigo: "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/15",
    purple: "border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-500/15",
    green: "border-green-600 bg-green-600 text-white shadow-md shadow-green-500/15",
  };

  return (
    <div className="flex w-full justify-center px-4 pb-5 pt-4 md:pb-6">
      <div className="w-full max-w-2xl rounded-full border border-slate-200/80 bg-white p-1.5 shadow-sm">
        <div className="grid grid-cols-4 w-full gap-1.5">
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
              <Icon
                className={`hidden h-4 w-4 sm:block ${
                  isActive ? "text-white" : "text-slate-400"
                }`}
              />
              <span className="truncate">{category.name}</span>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
