"use client";

import {
  BoundedNumberInput,
  type ManualNumberInputTone,
} from "./ManualNumberInput";

interface CompactRangeControlProps {
  label: string;
  symbol: string;
  value: number;
  min: number;
  max: number;
  step: number;
  precision?: number;
  unit?: string;
  tone: ManualNumberInputTone;
  onChange: (value: number) => void;
}

const toneClasses: Record<
  ManualNumberInputTone,
  { accent: string; symbol: string }
> = {
  violet: { accent: "accent-violet-500", symbol: "text-violet-600" },
  cyan: { accent: "accent-cyan-500", symbol: "text-cyan-600" },
  amber: { accent: "accent-amber-500", symbol: "text-amber-600" },
  orange: { accent: "accent-orange-500", symbol: "text-orange-600" },
  blue: { accent: "accent-blue-500", symbol: "text-blue-600" },
  emerald: { accent: "accent-emerald-500", symbol: "text-emerald-600" },
  pink: { accent: "accent-pink-500", symbol: "text-pink-600" },
};

export default function CompactRangeControl({
  label,
  symbol,
  value,
  min,
  max,
  step,
  precision,
  unit = "",
  tone,
  onChange,
}: CompactRangeControlProps) {
  const colors = toneClasses[tone];

  return (
    <label className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
      <span className="mb-2 flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0">
          <span className={`mr-1.5 font-mono text-sm font-black ${colors.symbol}`}>
            {symbol}
          </span>
          <span className="break-words text-xs font-bold text-slate-600">{label}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <BoundedNumberInput
            ariaLabel={label}
            value={value}
            min={min}
            max={max}
            step={step}
            precision={precision}
            onChange={onChange}
            className="h-8 w-[4.5rem] rounded-lg border border-slate-200 bg-white px-2 text-center font-mono text-xs font-black text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
          {unit ? (
            <span className="text-[11px] font-bold text-slate-400">{unit}</span>
          ) : null}
        </span>
      </span>
      <input
        aria-label={`${label} แบบแถบเลื่อน`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={`h-1.5 w-full cursor-pointer ${colors.accent}`}
      />
    </label>
  );
}
