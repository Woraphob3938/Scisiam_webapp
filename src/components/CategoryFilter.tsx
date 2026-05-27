"use client";

import React from "react";
import { LayoutGrid, Atom, Beaker, Leaf } from "lucide-react";

export type Category = "All" | "Physics" | "Chemistry" | "Biology";

interface CategoryFilterProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  layout?: "horizontal" | "vertical";
}

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
  layout = "horizontal",
}: CategoryFilterProps) {
  const categoriesList = [
    { id: "All" as Category, name: "ทั้งหมด", icon: LayoutGrid, color: "blue" },
    { id: "Physics" as Category, name: "Physics", icon: Atom, color: "indigo" },
    { id: "Chemistry" as Category, name: "Chemistry", icon: Beaker, color: "purple" },
    { id: "Biology" as Category, name: "Biology", icon: Leaf, color: "green" },
  ];

  if (layout === "vertical") {
    return (
      <div className="w-full flex flex-col gap-3 select-none">
        <h3 className="hidden lg:block text-xs font-extrabold text-slate-400 uppercase tracking-widest px-4 mb-1">
          สาขาวิชาปฏิบัติการ
        </h3>
        <div className="w-full flex flex-row lg:flex-col flex-wrap lg:flex-nowrap gap-2.5 bg-white/80 backdrop-blur-md p-2.5 rounded-3xl border border-white/50 shadow-xl shadow-slate-100/30">
          {categoriesList.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            const activeColorClasses: Record<string, string> = {
              blue: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20",
              indigo: "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20",
              purple: "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/20",
              green: "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md shadow-green-500/20",
            };

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 lg:py-3.5 rounded-2xl text-xs sm:text-sm font-bold lg:w-full flex-1 lg:flex-initial justify-center lg:justify-start
                  transition-all duration-300 transform select-none cursor-pointer
                  hover:scale-[1.02] active:scale-95 text-left
                  ${
                    isActive
                      ? activeColorClasses[category.color] || activeColorClasses.blue
                      : "bg-white lg:bg-transparent text-slate-600 hover:text-slate-900 border lg:border-none border-slate-200/60 shadow-xs lg:shadow-none hover:bg-slate-50/50"
                  }
                `}
              >
                <Icon
                  className={`w-4.5 h-4.5 ${
                    isActive ? "text-white animate-pulse" : "text-slate-400"
                  }`}
                />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-6 px-4">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-2xl bg-white/60 p-2 rounded-2xl sm:rounded-full border border-slate-100/80 shadow-xs backdrop-blur-xs">
        {categoriesList.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          const activeColorClasses: Record<string, string> = {
            blue: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]",
            indigo: "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]",
            purple: "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/20 scale-[1.02]",
            green: "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md shadow-green-500/20 scale-[1.02]",
          };

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide
                transition-all duration-300 transform select-none cursor-pointer
                hover:scale-[1.03] active:scale-95
                ${
                  isActive
                    ? activeColorClasses[category.color] || activeColorClasses.blue
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60 shadow-xs hover:bg-slate-50"
                }
              `}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? "text-white animate-pulse" : "text-slate-400"
                }`}
              />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
