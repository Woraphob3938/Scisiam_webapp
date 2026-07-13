import type { LabData } from "@/components/LabCard";

const CATEGORY_SEARCH_LABELS: Record<LabData["category"], string> = {
  Foundation: "ความรู้พื้นฐาน",
  Physics: "ฟิสิกส์",
  Chemistry: "เคมี",
  Biology: "ชีววิทยา",
  Mathematics: "คณิตศาสตร์",
};

export function normalizeLabSearchText(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("th")
    .replace(/[\p{P}\p{S}\s\u200B-\u200D\uFEFF]+/gu, "");
}

export function matchesLabSearch(lab: LabData, search: string) {
  const query = normalizeLabSearchText(search);
  if (!query) return true;

  return normalizeLabSearchText([
    lab.thaiTitle,
    lab.title,
    lab.description,
    lab.category,
    CATEGORY_SEARCH_LABELS[lab.category],
    lab.gradeLevel,
    lab.id,
  ].join(" ")).includes(query);
}
