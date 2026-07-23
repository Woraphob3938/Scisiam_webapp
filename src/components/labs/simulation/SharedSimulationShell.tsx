"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import EquipmentList from "@/components/labs/EquipmentList";
import DetailExperimentSteps from "@/components/labs/ExperimentSteps";
import TheoryCard from "@/components/labs/TheoryCard";
import { getLabDetails } from "@/data/labDetails";
import {
  ArrowLeft,
  BarChart3,
  Beaker,
  BookOpen,
  CheckCircle2,
  ChevronsDown,
  ChevronsUp,
  Info,
  ListChecks,
  LucideIcon,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Save,
  Target,
  X,
} from "lucide-react";

export interface SimulationMetric {
  label: string;
  value: string;
  tone?: "blue" | "cyan" | "emerald" | "orange" | "pink" | "rose" | "violet";
}

export interface SimulationStep {
  label: string;
  icon: LucideIcon;
}

interface SharedSimulationShellProps {
  accent: "blue" | "cyan" | "emerald" | "orange" | "pink" | "rose" | "violet";
  labId: string;
  category: string;
  title: string;
  subtitle: string;
  statusLabel: string;
  icon: LucideIcon;
  sceneTitle: string;
  scene: React.ReactNode;
  controlsTitle: string;
  controls: React.ReactNode;
  compactControls?: React.ReactNode;
  persistentControls?: boolean;
  drawerSummary?: React.ReactNode;
  metrics: SimulationMetric[];
  graph: React.ReactNode;
  table: React.ReactNode;
  theory: React.ReactNode;
  steps: SimulationStep[];
  learningGoals: string[];
  progressLabel: string;
  progressValue: string;
  progressPercent: number;
  tips: string[];
  showLiveMetrics?: boolean;
  showInfoTabs?: boolean;
  showSaveButton?: boolean;
  onSave?: () => void;
  onRun?: () => void;
  runLabel?: string;
  runActive?: boolean;
  runDisabled?: boolean;
  onReset?: () => void;
}

const accentClasses = {
  blue: {
    icon: "bg-blue-600 text-white",
    border: "border-blue-100",
    soft: "bg-blue-50 text-blue-700 border-blue-100",
    text: "text-blue-600",
    button: "bg-blue-600 text-white hover:bg-blue-700",
  },
  cyan: {
    icon: "bg-cyan-600 text-white",
    border: "border-cyan-100",
    soft: "bg-cyan-50 text-cyan-700 border-cyan-100",
    text: "text-cyan-600",
    button: "bg-cyan-600 text-white hover:bg-cyan-700",
  },
  emerald: {
    icon: "bg-emerald-600 text-white",
    border: "border-emerald-100",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-100",
    text: "text-emerald-600",
    button: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  orange: {
    icon: "bg-orange-500 text-white",
    border: "border-orange-100",
    soft: "bg-orange-50 text-orange-700 border-orange-100",
    text: "text-orange-600",
    button: "bg-orange-500 text-white hover:bg-orange-600",
  },
  rose: {
    icon: "bg-rose-600 text-white",
    border: "border-rose-100",
    soft: "bg-rose-50 text-rose-700 border-rose-100",
    text: "text-rose-600",
    button: "bg-rose-600 text-white hover:bg-rose-700",
  },
  pink: {
    icon: "bg-pink-200 text-pink-900",
    border: "border-pink-200",
    soft: "bg-pink-50 text-pink-900 border-pink-200",
    text: "text-pink-800",
    button: "bg-pink-200 text-pink-900 hover:bg-pink-300",
  },
  violet: {
    icon: "bg-violet-600 text-white",
    border: "border-violet-100",
    soft: "bg-violet-50 text-violet-700 border-violet-100",
    text: "text-violet-600",
    button: "bg-violet-600 text-white hover:bg-violet-700",
  },
};

const categoryAccents: Record<string, keyof typeof accentClasses> = {
  Physics: "blue",
  Chemistry: "violet",
  Biology: "emerald",
  Mathematics: "pink",
};

const metricToneClasses: Record<NonNullable<SimulationMetric["tone"]>, string> = {
  blue: "bg-blue-50 text-blue-700",
  cyan: "bg-cyan-50 text-cyan-700",
  emerald: "bg-emerald-50 text-emerald-700",
  orange: "bg-orange-50 text-orange-700",
  pink: "bg-pink-50 text-pink-900",
  rose: "bg-rose-50 text-rose-700",
  violet: "bg-violet-50 text-violet-700",
};

type InfoTab = "about" | "steps" | "theory" | "equipment" | "goals" | "tips";

type ControlElementProps = {
  children?: React.ReactNode;
  onClick?: unknown;
};

function getControlLabel(node: React.ReactNode): string {
  return React.Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      if (React.isValidElement<ControlElementProps>(child)) {
        return getControlLabel(child.props.children);
      }
      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isDuplicateActionLabel(
  label: string,
  actions: Pick<SharedSimulationShellProps, "onRun" | "onSave" | "onReset">,
) {
  if (actions.onReset && /^(รีเซ็ต|เริ่มใหม่|ตั้งใหม่)(?:\s*\(reset\))?$|^reset$/.test(label)) {
    return true;
  }

  if (
    actions.onRun &&
    /^(ทดลอง|เริ่มทดลอง|เริ่มจำลอง|หยุดทดลอง|หยุดชั่วคราว|เริ่มกราฟ|พักกราฟ|เปิดวงจร|ปิดวงจร|เริ่มชนรถ|หยุดเคลื่อนที่|ปล่อยตัวรันวิ่ง(?:\s*\(start\))?)$/.test(
      label,
    )
  ) {
    return true;
  }

  return Boolean(actions.onSave && /^(บันทึก|บันทึกผล|บันทึกการทดลอง|save)$/.test(label));
}

function stripDuplicatePrimaryActions(
  node: React.ReactNode,
  actions: Pick<SharedSimulationShellProps, "onRun" | "onSave" | "onReset">,
): React.ReactNode {
  const actionHandlers = new Set<unknown>(
    [actions.onRun, actions.onSave, actions.onReset].filter(Boolean),
  );

  return React.Children.map(node, (child) => {
    if (!React.isValidElement<ControlElementProps>(child)) {
      return child;
    }

    const isButton = child.type === "button";
    const label = isButton ? getControlLabel(child.props.children) : "";
    if (
      isButton &&
      (actionHandlers.has(child.props.onClick) || isDuplicateActionLabel(label, actions))
    ) {
      return null;
    }

    if (child.props.children === undefined) {
      return child;
    }

    const sanitizedChildren = stripDuplicatePrimaryActions(child.props.children, actions);
    const hadChildren = React.Children.toArray(child.props.children).length > 0;
    if (hadChildren && React.Children.toArray(sanitizedChildren).length === 0) {
      return null;
    }

    return React.cloneElement(child, undefined, sanitizedChildren);
  });
}

export default function SharedSimulationShell({
  accent,
  labId,
  category,
  title,
  subtitle,
  icon: Icon,
  sceneTitle,
  scene,
  controlsTitle,
  controls,
  compactControls,
  persistentControls = false,
  drawerSummary,
  metrics,
  graph,
  table,
  theory,
  steps,
  learningGoals,
  tips,
  showLiveMetrics = true,
  showInfoTabs = true,
  showSaveButton = true,
  onSave,
  onRun,
  runLabel = "ทดลอง",
  runActive = false,
  runDisabled = false,
  onReset,
}: SharedSimulationShellProps) {
  const resolvedAccent = categoryAccents[category] ?? accent;
  const tone = accentClasses[resolvedAccent];
  const searchParams = useSearchParams();
  const stageShellRef = useRef<HTMLElement | null>(null);
  const advancedPanelRef = useRef<HTMLElement | null>(null);
  const advancedCloseRef = useRef<HTMLButtonElement | null>(null);
  const advancedTriggerRef = useRef<HTMLButtonElement | null>(null);
  const resultsPanelRef = useRef<HTMLElement | null>(null);
  const resultsCloseRef = useRef<HTMLButtonElement | null>(null);
  const resultsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<InfoTab>("about");
  const classroomId = searchParams.get("classroom");
  const exitHref = classroomId
    ? `/classrooms/${encodeURIComponent(classroomId)}?tab=classwork`
    : "/labs";
  const hasDrawerSummary = Boolean(drawerSummary) || showLiveMetrics;
  const labDetails = getLabDetails(labId);
  const hasCompactControls =
    compactControls !== null && compactControls !== undefined && compactControls !== false;
  const hasPrimaryActions = Boolean(onRun || (showSaveButton && onSave) || onReset);
  const actionHandlers = { onRun, onSave: showSaveButton ? onSave : undefined, onReset };
  const sanitizedControls = stripDuplicatePrimaryActions(controls, actionHandlers);
  const sanitizedCompactControls = stripDuplicatePrimaryActions(compactControls, actionHandlers);
  const collapsedControls = sanitizedCompactControls ?? sanitizedControls;
  const hasCollapsedControls =
    collapsedControls !== null && collapsedControls !== undefined && collapsedControls !== false;
  const hasAdvancedControls = hasCompactControls && controls !== compactControls;
  const usesPersistentControlDock = persistentControls || hasCollapsedControls || hasPrimaryActions;
  const usesRegularControlDock = usesPersistentControlDock && hasCollapsedControls && !hasCompactControls;
  const stageBottomClass = !usesPersistentControlDock
    ? controlsOpen
      ? "sm:bottom-[calc(32vh+48px)]"
      : hasCollapsedControls
        ? "sm:bottom-[220px]"
        : "sm:bottom-[104px]"
    : usesRegularControlDock
      ? "sm:bottom-[272px]"
      : "sm:bottom-[220px]";

  useEffect(() => {
    const syncFullscreen = () => setIsExpanded(document.fullscreenElement === stageShellRef.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    if (!controlsOpen || !usesPersistentControlDock) return;
    advancedCloseRef.current?.focus();
  }, [controlsOpen, usesPersistentControlDock]);

  useEffect(() => {
    if (!resultsOpen) return;
    resultsCloseRef.current?.focus();
  }, [resultsOpen]);

  const closeAdvancedControls = () => {
    setControlsOpen(false);
    requestAnimationFrame(() => advancedTriggerRef.current?.focus());
  };

  const handleAdvancedPanelKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAdvancedControls();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = advancedPanelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const closeResults = () => {
    setResultsOpen(false);
    requestAnimationFrame(() => resultsTriggerRef.current?.focus());
  };

  const handleResultsPanelKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeResults();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = resultsPanelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const toggleFullscreen = async () => {
    if (isExpanded && !document.fullscreenElement) {
      setIsExpanded(false);
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsExpanded(false);
      return;
    }

    const stage = stageShellRef.current;
    setIsExpanded(true);

    try {
      await stage?.requestFullscreen?.();
    } catch {
      // Keep the fixed-position CSS fallback when browser fullscreen is blocked.
    }
  };

  const tabs: Array<{ key: InfoTab; label: string; icon: LucideIcon }> = [
    { key: "about", label: "ภาพรวม", icon: Info },
    { key: "steps", label: "ขั้นตอน", icon: ListChecks },
    { key: "theory", label: "ทฤษฎี", icon: BookOpen },
    { key: "equipment", label: "อุปกรณ์", icon: Beaker },
    { key: "goals", label: "เป้าหมาย", icon: Target },
    { key: "tips", label: "คำแนะนำ", icon: CheckCircle2 },
  ];

  const liveMetricsCard = (
    <section className="w-full rounded-2xl border border-white/70 bg-white/92 p-3 shadow-lg shadow-slate-900/10 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xs font-black text-slate-900">
          <BarChart3 className={`h-4 w-4 ${tone.text}`} />
          ค่าทดลอง Real-time
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {metrics.slice(0, 4).map((metric) => (
          <div key={metric.label} className={`rounded-xl px-2.5 py-2 text-xs font-black ${metricToneClasses[metric.tone ?? resolvedAccent]}`}>
            <p className="truncate text-xs opacity-75">{metric.label}</p>
            <p className="truncate text-sm">{metric.value}</p>
          </div>
        ))}
      </div>
    </section>
  );

  const resultsTrigger = (
    <button
      ref={resultsTriggerRef}
      type="button"
      data-testid="simulation-results-trigger"
      onClick={(event) => {
        resultsTriggerRef.current = event.currentTarget;
        setControlsOpen(false);
        setResultsOpen(true);
      }}
      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-expanded={resultsOpen}
      aria-controls="simulation-results-drawer"
    >
      <BarChart3 className={`h-4 w-4 ${tone.text}`} aria-hidden="true" />
      <span className="hidden sm:inline">ผลการทดลอง</span>
    </button>
  );

  const primaryActions = hasPrimaryActions ? (
    <div
      data-testid="simulation-primary-actions"
      className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 sm:flex sm:justify-end"
      role="group"
      aria-label="คำสั่งหลักของการทดลอง"
    >
      {onRun && (
        <button
          type="button"
          onClick={onRun}
          disabled={runDisabled}
          aria-pressed={runActive}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-32 ${tone.button}`}
        >
          {runActive ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          <span>{runLabel}</span>
        </button>
      )}
      {showSaveButton && onSave && (
        <button
          type="button"
          onClick={onSave}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs font-black text-blue-700 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:min-w-28"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          <span>บันทึกผล</span>
        </button>
      )}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:min-w-28"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>รีเซ็ต</span>
        </button>
      )}
    </div>
  ) : null;

  const controlsDrawer = (
    <section className="rounded-2xl border border-white/70 bg-white/95 shadow-xl shadow-slate-900/10 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <span className="flex min-w-0 items-center gap-2 text-base font-black text-slate-900">
          <Target className={`h-5 w-5 shrink-0 ${tone.text}`} />
          <span className="truncate">{controlsTitle}</span>
        </span>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <div data-testid="simulation-classroom-submission-slot" />
          {resultsTrigger}
          <button
            type="button"
            onClick={() => setControlsOpen((value) => !value)}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-black sm:text-sm ${tone.soft}`}
            aria-expanded={controlsOpen}
          >
            {controlsOpen ? "ย่อแผง" : "เปิดแผง"}
            {controlsOpen ? <ChevronsDown className="h-4 w-4" /> : <ChevronsUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {controlsOpen && (
        <div className={`grid max-h-[32vh] gap-4 overflow-y-auto border-t border-slate-100 p-4 ${hasDrawerSummary ? "lg:grid-cols-[minmax(0,1fr)_320px]" : ""}`}>
          <div>{controls}</div>
          {hasDrawerSummary && (
            <div className="flex flex-col gap-3">
              {drawerSummary ?? (showLiveMetrics && liveMetricsCard)}
            </div>
          )}
        </div>
      )}

      {!controlsOpen && hasCollapsedControls && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-1">
          <div className={compactControls ? "" : "max-h-[170px] overflow-y-auto pr-1"}>
            {collapsedControls}
          </div>
        </div>
      )}

      {primaryActions && <div className="px-4 pb-4">{primaryActions}</div>}
    </section>
  );

  const persistentControlDock = (
    <section
      data-testid="persistent-control-dock"
      className="rounded-2xl border border-white/70 bg-white/95 p-3 shadow-xl shadow-slate-900/10 backdrop-blur-md"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="flex min-w-0 items-center gap-2 text-sm font-black text-slate-900 sm:text-base">
          <Target className={`h-5 w-5 shrink-0 ${tone.text}`} />
          <span className="truncate">{controlsTitle}</span>
        </h2>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <div data-testid="simulation-classroom-submission-slot" />
          {resultsTrigger}
          {hasAdvancedControls && (
            <button
              type="button"
              ref={advancedTriggerRef}
              onClick={(event) => {
                advancedTriggerRef.current = event.currentTarget;
                if (controlsOpen) closeAdvancedControls();
                else setControlsOpen(true);
              }}
              className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black transition hover:brightness-95 ${tone.soft}`}
              aria-expanded={controlsOpen}
              aria-controls="simulation-advanced-controls"
            >
              {controlsOpen ? "ปิดค่าขั้นสูง" : "ตั้งค่าขั้นสูง"}
              {controlsOpen ? <ChevronsUp className="h-4 w-4" /> : <ChevronsDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
      <div className={hasCompactControls ? "min-w-0" : "max-h-[170px] min-w-0 overflow-y-auto pr-1"}>
        {collapsedControls}
      </div>
      {primaryActions && <div className="mt-3">{primaryActions}</div>}
    </section>
  );

  const persistentAdvancedPanel = usesPersistentControlDock && hasAdvancedControls && controlsOpen && (
    <section
      ref={advancedPanelRef}
      id="simulation-advanced-controls"
      data-testid="simulation-advanced-controls"
      role="dialog"
      aria-modal="true"
      aria-label="การตั้งค่าขั้นสูง"
      onKeyDown={handleAdvancedPanelKeyDown}
      className={`absolute inset-4 z-40 overflow-y-auto rounded-2xl border bg-white p-4 shadow-xl shadow-slate-900/15 sm:inset-x-5 sm:bottom-[210px] sm:top-[122px] md:left-auto md:w-[min(720px,calc(100%-2.5rem))] ${tone.border}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="text-sm font-black text-slate-900">การตั้งค่าขั้นสูง</h2>
        <button
          ref={advancedCloseRef}
          type="button"
          onClick={closeAdvancedControls}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="ปิดการตั้งค่าขั้นสูง"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {sanitizedControls}
    </section>
  );

  const resultsDrawer = resultsOpen && (
    <section
      ref={resultsPanelRef}
      id="simulation-results-drawer"
      data-testid="simulation-results-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="ผลการทดลอง"
      onKeyDown={handleResultsPanelKeyDown}
      className={`absolute inset-4 z-50 overflow-y-auto rounded-2xl border bg-white p-4 shadow-2xl shadow-slate-900/20 sm:inset-y-5 sm:left-auto sm:right-5 sm:w-[min(560px,calc(100%-2.5rem))] ${tone.border}`}
    >
      <div className="sticky top-0 z-10 mb-4 flex items-center justify-between gap-3 border-b border-slate-100 bg-white pb-3">
        <div>
          <p className={`text-xs font-black uppercase ${tone.text}`}>Experiment results</p>
          <h2 className="text-lg font-black text-slate-950">ผลการทดลอง</h2>
          <p className="text-xs font-semibold leading-relaxed text-slate-500">
            ค่าปัจจุบัน กราฟ และตารางจากการทดลองนี้
          </p>
        </div>
        <button
          ref={resultsCloseRef}
          type="button"
          onClick={closeResults}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="ปิดผลการทดลอง"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`min-w-0 rounded-xl px-3 py-2 text-xs font-black ${metricToneClasses[metric.tone ?? resolvedAccent]}`}
          >
            <p className="break-words opacity-75">{metric.label}</p>
            <p className="break-words text-sm">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid min-w-0 gap-4">
        <div className="min-w-0 overflow-x-auto">{graph}</div>
        <div className="min-w-0 overflow-x-auto">{table}</div>
      </div>
    </section>
  );

  const simulationStage = (
    <section
      ref={stageShellRef}
      className={`relative overflow-hidden border border-slate-200 bg-slate-900 shadow-2xl shadow-slate-300/60 ${
        isExpanded
          ? "fixed inset-0 z-[100] h-screen min-h-screen w-screen rounded-none border-0 shadow-none"
          : "min-h-[760px] rounded-[24px] sm:h-[72vh] sm:min-h-[620px] sm:max-h-[840px]"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.14),transparent_28%)]" />
      <div className={`absolute inset-px bg-slate-100 ${isExpanded ? "" : "rounded-[22px]"}`} />

      <div className="relative z-20 px-4 pt-4 sm:pointer-events-none sm:absolute sm:left-5 sm:right-5 sm:top-5 sm:p-0">
          <div className="pointer-events-auto block min-w-0 rounded-2xl border border-white/70 bg-white/92 px-4 py-3 shadow-lg shadow-slate-900/10 backdrop-blur-md sm:inline-block sm:max-w-[calc(100%-64px)] xl:max-w-[calc(100%-340px)]">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Link
              href={exitHref}
              data-testid="simulation-exit-link"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              ออกจากแล็บ
            </Link>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${tone.soft}`}>{category}</span>
          </div>
          <h1 className="max-w-[720px] text-lg font-black leading-relaxed text-slate-950 sm:text-2xl">{title}</h1>
        </div>

      </div>

      {showLiveMetrics && (
        <div data-testid="simulation-stage-metrics" className="absolute right-5 top-5 z-20 hidden w-[320px] xl:block">
          {liveMetricsCard}
        </div>
      )}

      {showLiveMetrics && <div data-testid="simulation-mobile-metric" className="relative z-20 mx-4 mt-3 sm:hidden">
        <div className="flex min-h-11 w-full items-center gap-2 rounded-2xl border border-white/70 bg-white/92 px-3 py-2 text-xs font-black text-slate-900 shadow-lg shadow-slate-900/10 backdrop-blur-md">
          <BarChart3 className={`h-3.5 w-3.5 ${tone.text}`} />
          <span className="truncate">{metrics[0]?.label}: {metrics[0]?.value}</span>
        </div>
      </div>}

      <div className={`relative z-10 mx-4 mt-3 min-h-[320px] transition-all duration-300 sm:absolute sm:inset-x-5 sm:top-[122px] sm:mx-0 sm:mt-0 sm:min-h-0 ${stageBottomClass}`}>
        <div
          data-testid="simulation-stage-content"
          className="relative min-h-[320px] overflow-hidden rounded-[22px] sm:h-full sm:min-h-0"
        >
          <div data-testid="simulation-stage-scene" className="min-h-[320px] overflow-hidden sm:h-full sm:min-h-0">
            {scene}
          </div>
          <button
            type="button"
            data-testid="simulation-fullscreen-toggle"
            onClick={toggleFullscreen}
            className="absolute bottom-4 right-3 z-50 grid h-11 w-11 place-items-center rounded-2xl border border-white/70 bg-white/92 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md transition hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:bottom-14"
            aria-label={isExpanded ? "ออกจากโหมดเต็มจอ" : "ขยายห้องทดลอง"}
          >
            {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {persistentAdvancedPanel}
      {resultsDrawer}

      <div className="relative z-30 mx-4 mb-4 mt-3 sm:absolute sm:bottom-5 sm:left-5 sm:right-5 sm:m-0">
        {usesPersistentControlDock ? persistentControlDock : controlsDrawer}
      </div>
    </section>
  );

  const activeTabContent = {
    about: (
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
        <h2 className="mb-2 flex items-center gap-2 text-base font-black text-slate-900">
          <Icon className={`h-5 w-5 ${tone.text}`} />
          {sceneTitle}
        </h2>
        <p className="max-w-4xl text-sm font-semibold leading-relaxed text-slate-500">{subtitle}</p>
      </section>
    ),
    goals: (
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
        <h2 className="mb-3 flex items-center gap-2 text-base font-black text-slate-900">
          <Target className={`h-5 w-5 ${tone.text}`} />
          เป้าหมายการเรียนรู้
        </h2>
        <ul className="grid gap-2 text-sm font-semibold leading-relaxed text-slate-500 md:grid-cols-2">
          {learningGoals.map((item) => (
            <li key={item} className="flex gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone.icon}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    ),
    theory: labDetails ? <TheoryCard details={labDetails} /> : theory,
    equipment: labDetails ? (
      <EquipmentList labTitle={title} details={labDetails} />
    ) : (
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 text-sm font-semibold leading-relaxed text-slate-500 shadow-sm shadow-slate-200/40">
        ยังไม่มีข้อมูลอุปกรณ์สำหรับแล็บนี้
      </section>
    ),
    steps: labDetails ? (
      <DetailExperimentSteps steps={labDetails.steps} />
    ) : (
      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 sm:grid-cols-2 xl:grid-cols-5">
        {steps.map((step, index) => {
          const StepIcon = step.icon;

          return (
            <div key={step.label} className="flex items-center gap-3 rounded-xl bg-slate-50/70 px-3 py-2">
              <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.soft}`}>
                <StepIcon className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">{index + 1}</span>
              </div>
              <span className="text-xs font-black leading-relaxed text-slate-700">{step.label}</span>
            </div>
          );
        })}
      </section>
    ),
    tips: (
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/40">
        <h2 className="mb-3 flex items-center gap-2 text-base font-black text-slate-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          คำแนะนำในการทดลอง
        </h2>
        <ul className="grid gap-2 text-sm font-semibold leading-relaxed text-slate-500 md:grid-cols-2">
          {tips.map((item) => (
            <li key={item} className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    ),
  } satisfies Record<InfoTab, React.ReactNode>;

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8fafc] pb-12">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-12 md:px-20">
        <div className="flex flex-col gap-6">
              {simulationStage}

              {showInfoTabs && <section className="space-y-4">
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-200/40 sm:flex sm:overflow-x-auto">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const selected = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-black transition sm:w-auto sm:shrink-0 sm:gap-2 sm:px-4 sm:text-sm ${
                      selected ? `${tone.soft} ring-1 ring-inset ${tone.border}` : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTabContent[activeTab]}
          </section>}
        </div>
      </main>
    </div>
  );
}
