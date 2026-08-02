"use client";

import { useEffect, useRef } from "react";

import type { ReactionRateSceneModel } from "@/components/labs/simulation/chemistrySceneModels";

type ReactantKind = "A" | "B";

type ReactantParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: ReactantKind;
  active: boolean;
};

type ProductParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type ReactionRateParticleCanvasProps = {
  model: ReactionRateSceneModel;
  runToken: number;
  isRunning: boolean;
};

const WIDTH = 620;
const HEIGHT = 340;
const VESSEL = { left: 174, right: 446, top: 83, bottom: 275 };
const PARTICLE_RADIUS = 7;

function createRandom(seed: number) {
  let state = Math.max(1, seed | 0);
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createReactants(model: ReactionRateSceneModel, runToken: number) {
  const random = createRandom(1307 + runToken * 7919 + model.particleCount * 97);
  return Array.from({ length: model.particleCount }, (_, index): ReactantParticle => {
    const angle = random() * Math.PI * 2;
    const speed = model.speed * (0.72 + random() * 0.45);
    return {
      x: VESSEL.left + 22 + random() * (VESSEL.right - VESSEL.left - 44),
      y: VESSEL.top + 24 + random() * (VESSEL.bottom - VESSEL.top - 42),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      kind: index % 2 === 0 ? "A" : "B",
      active: true,
    };
  });
}

function bounceParticle(particle: { x: number; y: number; vx: number; vy: number }, dt: number) {
  particle.x += particle.vx * dt;
  particle.y += particle.vy * dt;

  if (particle.x <= VESSEL.left + PARTICLE_RADIUS || particle.x >= VESSEL.right - PARTICLE_RADIUS) {
    particle.vx *= -1;
    particle.x = Math.min(VESSEL.right - PARTICLE_RADIUS, Math.max(VESSEL.left + PARTICLE_RADIUS, particle.x));
  }
  if (particle.y <= VESSEL.top + PARTICLE_RADIUS || particle.y >= VESSEL.bottom - PARTICLE_RADIUS) {
    particle.vy *= -1;
    particle.y = Math.min(VESSEL.bottom - PARTICLE_RADIUS, Math.max(VESSEL.top + PARTICLE_RADIUS, particle.y));
  }
}

function drawScene(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  reactants: ReactantParticle[],
  products: ProductParticle[],
  flash: ProductParticle | null,
) {
  const scaleX = canvas.width / WIDTH;
  const scaleY = canvas.height / HEIGHT;
  context.setTransform(scaleX, 0, 0, scaleY, 0, 0);
  context.clearRect(0, 0, WIDTH, HEIGHT);

  const background = context.createLinearGradient(0, 0, 0, HEIGHT);
  background.addColorStop(0, "#fffaf5");
  background.addColorStop(1, "#f8fafc");
  context.fillStyle = background;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.fillStyle = "rgba(255, 247, 237, 0.88)";
  context.strokeStyle = "#c2410c";
  context.lineWidth = 6;
  context.beginPath();
  context.roundRect(VESSEL.left, VESSEL.top, VESSEL.right - VESSEL.left, VESSEL.bottom - VESSEL.top, 28);
  context.fill();
  context.stroke();

  context.fillStyle = "rgba(251, 146, 60, 0.12)";
  context.beginPath();
  context.roundRect(VESSEL.left + 8, VESSEL.top + 82, VESSEL.right - VESSEL.left - 16, VESSEL.bottom - VESSEL.top - 90, 20);
  context.fill();

  for (const particle of reactants) {
    if (!particle.active) continue;
    context.fillStyle = particle.kind === "A" ? "#16a34a" : "#7c3aed";
    context.beginPath();
    context.arc(particle.x, particle.y, PARTICLE_RADIUS, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgba(255, 255, 255, 0.85)";
    context.lineWidth = 1.5;
    context.stroke();
  }

  for (const product of products) {
    context.strokeStyle = "#9a3412";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(product.x - 5, product.y);
    context.lineTo(product.x + 5, product.y);
    context.stroke();
    context.fillStyle = "#16a34a";
    context.beginPath();
    context.arc(product.x - 8, product.y, PARTICLE_RADIUS, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#7c3aed";
    context.beginPath();
    context.arc(product.x + 8, product.y, PARTICLE_RADIUS, 0, Math.PI * 2);
    context.fill();
  }

  if (flash) {
    const glow = context.createRadialGradient(flash.x, flash.y, 2, flash.x, flash.y, 30);
    glow.addColorStop(0, "rgba(251, 191, 36, 0.72)");
    glow.addColorStop(1, "rgba(251, 146, 60, 0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(flash.x, flash.y, 30, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = "#9a3412";
  context.font = "800 14px Prompt, sans-serif";
  context.textAlign = "center";
  context.fillText("อนุภาคต้องชนกันจึงเกิดผลิตภัณฑ์", WIDTH / 2, 312);
}

export default function ReactionRateParticleCanvas({
  model,
  runToken,
  isRunning,
}: ReactionRateParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIdRef = useRef(0);
  const tickRef = useRef<((timestamp: number) => void) | null>(null);
  const isRunningRef = useRef(isRunning);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let lastTimestamp = 0;
    let elapsedMs = 0;
    let flashUntil = 0;
    let latestFlash: ProductParticle | null = null;
    const reactants = createReactants(model, runToken);
    const products: ProductParticle[] = [];
    const maximumProducts = Math.max(1, Math.floor((model.particleCount / 2) * model.productShare));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedMotionRef.current = reducedMotion;

    const resize = () => {
      const width = Math.max(1, canvas.getBoundingClientRect().width);
      const pixelRatio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(width * (HEIGHT / WIDTH) * pixelRatio);
      drawScene(context, canvas, reactants, products, null);
    };

    const createNextProduct = () => {
      const activeA = reactants.filter((particle) => particle.active && particle.kind === "A");
      const activeB = reactants.filter((particle) => particle.active && particle.kind === "B");
      let closest: [ReactantParticle, ReactantParticle] | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const a of activeA) {
        for (const b of activeB) {
          const distance = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
          if (distance < closestDistance) {
            closestDistance = distance;
            closest = [a, b];
          }
        }
      }
      if (!closest) return;

      const [a, b] = closest;
      a.active = false;
      b.active = false;
      const product = {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        vx: (a.vx + b.vx) / 2,
        vy: (a.vy + b.vy) / 2,
      };
      products.push(product);
      latestFlash = product;
      flashUntil = elapsedMs + 180;
    };

    const finishImmediately = () => {
      while (products.length < maximumProducts) createNextProduct();
      drawScene(context, canvas, reactants, products, null);
    };

    const tick = (timestamp: number) => {
      if (!isRunningRef.current) return;
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaMs = Math.min(32, timestamp - lastTimestamp);
      lastTimestamp = timestamp;
      elapsedMs += deltaMs;
      const dt = deltaMs / 1000;

      reactants.forEach((particle) => {
        if (particle.active) bounceParticle(particle, dt);
      });
      products.forEach((product) => bounceParticle(product, dt * 0.72));

      const progress = Math.min(1, elapsedMs / model.reactionDurationMs);
      const desiredProducts = Math.floor(maximumProducts * progress);
      while (products.length < desiredProducts) createNextProduct();

      drawScene(context, canvas, reactants, products, elapsedMs < flashUntil ? latestFlash : null);
      if (isRunningRef.current) frameIdRef.current = requestAnimationFrame(tick);
    };
    tickRef.current = tick;

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    if (runToken > 0) {
      if (reducedMotion) finishImmediately();
    }

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      tickRef.current = null;
      resizeObserver.disconnect();
    };
  }, [model, runToken]);

  useEffect(() => {
    isRunningRef.current = isRunning;
    cancelAnimationFrame(frameIdRef.current);

    const tick = tickRef.current;
    if (isRunning && runToken > 0 && tick && !reducedMotionRef.current) {
      frameIdRef.current = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(frameIdRef.current);
  }, [isRunning, model, runToken]);

  return (
    <div className="relative flex min-h-[320px] w-full max-w-[680px] flex-col items-center justify-center overflow-hidden rounded-xl bg-orange-50/50 sm:h-full sm:min-h-0">
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-2 text-xs font-extrabold text-slate-700" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 shadow-sm"><span className="size-2.5 rounded-full bg-green-600" />สาร A</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 shadow-sm"><span className="size-2.5 rounded-full bg-violet-600" />สาร B</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 shadow-sm"><span className="h-2.5 w-5 rounded-full bg-gradient-to-r from-green-600 to-violet-600" />ผลิตภัณฑ์</span>
      </div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="ภาชนะปฏิกิริยาที่จำนวนอนุภาคเปลี่ยนตามความเข้มข้น ความเร็วเปลี่ยนตามอุณหภูมิ และเกิดผลิตภัณฑ์เมื่ออนุภาคต่างชนิดชนกัน"
        className="h-full w-full object-contain"
      >
        อนุภาคสารตั้งต้นเคลื่อนที่ ชนกัน และจับคู่เป็นผลิตภัณฑ์
      </canvas>
    </div>
  );
}
