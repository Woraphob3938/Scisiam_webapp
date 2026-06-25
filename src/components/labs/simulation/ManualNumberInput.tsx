"use client";

export type ManualNumberInputTone =
  | "violet"
  | "cyan"
  | "amber"
  | "orange"
  | "blue"
  | "emerald"
  | "pink";

interface ManualNumberInputProps {
  label: string;
  ariaLabel: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  tone: ManualNumberInputTone;
  onChange: (value: number) => void;
}

const toneClasses: Record<ManualNumberInputTone, string> = {
  violet: "border-violet-100 bg-violet-50 text-violet-700 focus:border-violet-300 focus:ring-violet-200",
  cyan: "border-cyan-100 bg-cyan-50 text-cyan-700 focus:border-cyan-300 focus:ring-cyan-200",
  amber: "border-amber-100 bg-amber-50 text-amber-700 focus:border-amber-300 focus:ring-amber-200",
  orange: "border-orange-100 bg-orange-50 text-orange-700 focus:border-orange-300 focus:ring-orange-200",
  blue: "border-blue-100 bg-blue-50 text-blue-700 focus:border-blue-300 focus:ring-blue-200",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700 focus:border-emerald-300 focus:ring-emerald-200",
  pink: "border-pink-100 bg-pink-50 text-pink-700 focus:border-pink-300 focus:ring-pink-200",
};

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export default function ManualNumberInput({
  label,
  ariaLabel,
  value,
  min,
  max,
  step = 1,
  tone,
  onChange,
}: ManualNumberInputProps) {
  return (
    <label className="block rounded-2xl border border-slate-100 bg-white p-2.5 text-[11px] font-black text-slate-500 shadow-sm">
      <span className="mb-1 block">{label}</span>
      <input
        aria-label={ariaLabel}
        type="number"
        inputMode={step % 1 === 0 ? "numeric" : "decimal"}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(clampNumber(Number(event.target.value), min, max))}
        className={`h-10 w-full rounded-xl border px-3 text-center font-mono text-base font-black outline-none transition focus:ring-2 ${toneClasses[tone]}`}
      />
    </label>
  );
}
