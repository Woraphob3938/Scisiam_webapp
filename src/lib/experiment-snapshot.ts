import type { createClient } from "./supabase/client";

type SupabaseClient = ReturnType<typeof createClient>;

export const MAX_SNAPSHOT_WIDTH = 1920;
export const MAX_SNAPSHOT_BYTES = 3 * 1024 * 1024;
const SNAPSHOT_QUALITY = 0.85;
const SNAPSHOT_BUCKET = "experiment-snapshots";

function canvasToWebp(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/webp", SNAPSHOT_QUALITY);
  });
}

export async function captureExperimentSnapshot(): Promise<Blob | null> {
  if (typeof document === "undefined") return null;

  const target =
    document.querySelector<HTMLElement>('[data-testid="simulation-stage-scene"]') ??
    document.querySelector<SVGElement>("main svg")?.parentElement ??
    null;
  if (!target) return null;

  // Wait for the current control values to reach the visible experiment before capture.
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const sourceWidth = Math.max(1, target.scrollWidth, target.getBoundingClientRect().width);
  const sourceHeight = Math.max(1, target.scrollHeight, target.getBoundingClientRect().height);
  const scale = Math.min(1, MAX_SNAPSHOT_WIDTH / sourceWidth);
  const { toCanvas } = await import("html-to-image");
  const canvas = await toCanvas(target, {
    backgroundColor: "#f8fafc",
    cacheBust: true,
    canvasWidth: Math.round(sourceWidth * scale),
    canvasHeight: Math.round(sourceHeight * scale),
    pixelRatio: 1,
    // Remote font stylesheets can be unreadable to html-to-image in production.
    skipFonts: true,
  });
  const blob = await canvasToWebp(canvas);

  return blob && blob.size <= MAX_SNAPSHOT_BYTES ? blob : null;
}

export async function uploadExperimentSnapshot(
  supabase: SupabaseClient,
  userId: string,
  runId: string,
  blob: Blob,
): Promise<string | null> {
  const path = `${userId}/${runId}.webp`;
  const { error } = await supabase.storage.from(SNAPSHOT_BUCKET).upload(path, blob, {
    cacheControl: "3600",
    contentType: "image/webp",
    upsert: false,
  });

  return error ? null : path;
}
