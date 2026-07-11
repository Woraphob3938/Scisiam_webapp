import { labsById } from "@/data/labs";

const classroomPresentations = {
  Physics: {
    label: "ฟิสิกส์",
    coverClassName: "from-sky-500 via-blue-600 to-indigo-700",
    accentClassName: "bg-sky-100 text-sky-800",
    glowClassName: "bg-sky-300/30",
  },
  Chemistry: {
    label: "เคมี",
    coverClassName: "from-violet-500 via-purple-600 to-fuchsia-700",
    accentClassName: "bg-violet-100 text-violet-800",
    glowClassName: "bg-fuchsia-300/30",
  },
  Biology: {
    label: "ชีววิทยา",
    coverClassName: "from-emerald-500 via-green-600 to-teal-700",
    accentClassName: "bg-emerald-100 text-emerald-800",
    glowClassName: "bg-emerald-300/30",
  },
  Mathematics: {
    label: "คณิตศาสตร์",
    coverClassName: "from-rose-400 via-pink-500 to-fuchsia-600",
    accentClassName: "bg-rose-100 text-rose-800",
    glowClassName: "bg-pink-300/30",
  },
  Foundation: {
    label: "ความรู้พื้นฐาน",
    coverClassName: "from-cyan-500 via-sky-600 to-blue-700",
    accentClassName: "bg-cyan-100 text-cyan-800",
    glowClassName: "bg-cyan-300/30",
  },
} as const;

const fallbackPresentation = {
  label: "ห้องเรียนวิทยาศาสตร์",
  coverClassName: "from-slate-600 via-slate-700 to-slate-900",
  accentClassName: "bg-slate-100 text-slate-800",
  glowClassName: "bg-slate-300/30",
};

export function getClassroomPresentation(labIds: readonly string[]) {
  const category = labIds
    .map((labId) => labsById[labId]?.category)
    .find((value): value is keyof typeof classroomPresentations => Boolean(value));

  return category ? classroomPresentations[category] : fallbackPresentation;
}
