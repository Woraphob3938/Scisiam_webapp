"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import * as THREE from "three";
import { saveExperimentAndSync } from "@/lib/supabase/experiment-sync";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Flame,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sliders,
  Target,
  Thermometer,
  Zap,
} from "lucide-react";

interface GasPoint {
  volume: number;
  temperature: number;
  moles: number;
  pressure: number;
}

const R_CONSTANT = 8.314; // Gas constant

const calculatePressure = (moles: number, tempK: number, volumeL: number) => {
  return (moles * R_CONSTANT * tempK) / volumeL;
};

function MoleculeViewport({
  temperature,
  moles,
  pistonY,
  isRunning,
}: {
  temperature: number;
  moles: number;
  pistonY: number;
  isRunning: boolean;
}) {
  const particleCount = Math.min(25, Math.ceil(moles * 10));
  const [particles, setParticles] = useState<Array<{ x: number; y: number; vx: number; vy: number }>>([]);

  // Initialize particles with random positions & velocities when particle count changes
  useEffect(() => {
    const arr: Array<{ x: number; y: number; vx: number; vy: number }> = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 2.0; // base speed
      arr.push({
        x: 195 + Math.random() * 170,
        y: pistonY + 15 + Math.random() * (250 - pistonY - 20),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    }
    const timer = setTimeout(() => {
      setParticles(arr);
    }, 0);
    return () => clearTimeout(timer);
  }, [particleCount, pistonY]);

  // Particle collision and physics tick loop
  useEffect(() => {
    if (!isRunning) return;

    let frameId: number;

    const updateParticles = () => {
      // Speed scales with temperature (Kinetic theory: speed ~ sqrt(T))
      const speedScale = Math.sqrt(temperature / 300);

      setParticles((prev) =>
        prev.map((p) => {
          let nextX = p.x + p.vx * speedScale;
          let nextY = p.y + p.vy * speedScale;
          let nextVx = p.vx;
          let nextVy = p.vy;

          // Left and right cylinder wall boundaries (glass internal: 183 to 377)
          if (nextX < 188) {
            nextX = 188;
            nextVx = Math.abs(p.vx);
          } else if (nextX > 372) {
            nextX = 372;
            nextVx = -Math.abs(p.vx);
          }

          // Piston bottom limit and cylinder bottom limit boundaries
          const topLimit = pistonY + 12; // bottom of piston head is pistonY + 8
          const bottomLimit = 255;      // bottom cylinder wall is 260
          
          if (nextY < topLimit) {
            nextY = topLimit;
            nextVy = Math.abs(p.vy);
          } else if (nextY > bottomLimit) {
            nextY = bottomLimit;
            nextVy = -Math.abs(p.vy);
          }

          return { x: nextX, y: nextY, vx: nextVx, vy: nextVy };
        })
      );

      frameId = requestAnimationFrame(updateParticles);
    };

    frameId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, temperature, pistonY]);

  return (
    <g>
      {particles.map((p, index) => (
        <circle
          key={index}
          cx={p.x}
          cy={p.y}
          r="4.5"
          fill={temperature > 350 ? "#ef4444" : temperature < 200 ? "#3b82f6" : "#10b981"}
          stroke={temperature > 350 ? "#fecdd3" : temperature < 200 ? "#dbeafe" : "#d1fae5"}
          strokeWidth="0.75"
          opacity="0.85"
          className="transition-colors duration-300"
        />
      ))}
    </g>
  );
}

export function GasChamber3DScene({
  volume,
  temperature,
  moles,
  pressure,
  isRunning,
}: {
  volume: number;
  temperature: number;
  moles: number;
  pressure: number;
  isRunning: boolean;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef({ volume, temperature, pressure, isRunning });
  const rotationRef = useRef({ x: -0.08, y: -0.45 });
  const distanceRef = useRef(11.2);
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 });
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    propsRef.current = { volume, temperature, pressure, isRunning };
  }, [volume, temperature, pressure, isRunning]);

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      const fallbackTimer = window.setTimeout(() => setWebglFailed(true), 0);
      return () => window.clearTimeout(fallbackTimer);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const clock = new THREE.Clock();
    const root = new THREE.Group();
    const bottom = -1.8;
    const particleCount = Math.min(64, Math.max(16, Math.round(moles * 26)));
    const particleColor = new THREE.Color();
    let frameId = 0;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.maxWidth = "100%";
    renderer.domElement.style.display = "block";

    scene.background = new THREE.Color(0xf8fafc);
    scene.add(root);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdbeafe, 2.4));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5, 6, 4);
    scene.add(keyLight);

    camera.position.set(0, 2.4, distanceRef.current);
    camera.lookAt(0, 0.45, 0);

    const chamberMaterial = new THREE.MeshStandardMaterial({
      color: 0xdff7ff,
      transparent: true,
      opacity: 0.34,
      roughness: 0.2,
      metalness: 0.05,
    });
    const chamber = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 2.8), chamberMaterial);
    root.add(chamber);

    const edgeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(4, 1, 2.8));
    const edges = new THREE.LineSegments(
      edgeGeometry,
      new THREE.LineBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.75 })
    );
    root.add(edges);

    const piston = new THREE.Mesh(
      new THREE.BoxGeometry(4.35, 0.16, 3.05),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.42, metalness: 0.22 })
    );
    root.add(piston);

    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 1.9, 24),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.28, metalness: 0.5 })
    );
    root.add(rod);

    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 1.9, 0.08, 64),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.55 })
    );
    floor.position.y = bottom - 0.08;
    floor.scale.z = 0.72;
    root.add(floor);

    const particles: Array<{ mesh: THREE.Mesh; velocity: THREE.Vector3 }> = [];
    const particleGeometry = new THREE.SphereGeometry(0.085, 20, 20);
    const particleMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.22,
      metalness: 0.05,
    });

    for (let i = 0; i < particleCount; i += 1) {
      const mesh = new THREE.Mesh(particleGeometry, particleMaterial);
      mesh.position.set(
        (Math.random() - 0.5) * 3.2,
        bottom + 0.3 + Math.random() * 2.2,
        (Math.random() - 0.5) * 2.1
      );
      particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 1.4,
          (Math.random() - 0.5) * 1.4,
          (Math.random() - 0.5) * 1.4
        ),
      });
      root.add(mesh);
    }

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const onPointerDown = (event: PointerEvent) => {
      dragRef.current = { active: true, x: event.clientX, y: event.clientY };
      host.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current.active) return;
      const dx = event.clientX - dragRef.current.x;
      const dy = event.clientY - dragRef.current.y;
      dragRef.current = { active: true, x: event.clientX, y: event.clientY };
      rotationRef.current.y += dx * 0.008;
      rotationRef.current.x = THREE.MathUtils.clamp(rotationRef.current.x + dy * 0.006, -0.55, 0.35);
    };
    const onPointerUp = (event: PointerEvent) => {
      dragRef.current.active = false;
      if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      distanceRef.current = THREE.MathUtils.clamp(distanceRef.current + event.deltaY * 0.006, 8, 14.5);
    };

    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerup", onPointerUp);
    host.addEventListener("pointercancel", onPointerUp);
    host.addEventListener("wheel", onWheel, { passive: false });

    const animate = () => {
      const delta = Math.min(0.032, clock.getDelta());
      const current = propsRef.current;
      const volumeRatio = current.volume <= 8
        ? (current.volume - 1) / 7
        : (current.volume - 10) / 40;
      const height = 1.35 + THREE.MathUtils.clamp(volumeRatio, 0, 1) * 2.85;
      const top = bottom + height;
      const speed = (current.isRunning ? 1.2 : 0.24) * Math.sqrt(current.temperature / 300);

      chamber.scale.y = height;
      chamber.position.y = bottom + height / 2;
      edges.scale.y = height;
      edges.position.y = bottom + height / 2;
      piston.position.y = top + 0.1;
      rod.position.y = top + 1.05;
      if (!dragRef.current.active) rotationRef.current.y += delta * (current.isRunning ? 0.16 : 0.025);
      root.rotation.x = rotationRef.current.x;
      root.rotation.y = rotationRef.current.y;
      camera.position.set(0, 2.4, distanceRef.current);
      camera.lookAt(0, 0.45, 0);

      particleColor.set(current.temperature > 360 ? 0xef4444 : current.temperature < 220 ? 0x3b82f6 : 0x10b981);
      particleMaterial.color.copy(particleColor);

      particles.forEach((particle) => {
        particle.mesh.position.addScaledVector(particle.velocity, delta * speed);

        if (particle.mesh.position.x < -1.85 || particle.mesh.position.x > 1.85) {
          particle.velocity.x *= -1;
          particle.mesh.position.x = THREE.MathUtils.clamp(particle.mesh.position.x, -1.85, 1.85);
        }
        if (particle.mesh.position.z < -1.25 || particle.mesh.position.z > 1.25) {
          particle.velocity.z *= -1;
          particle.mesh.position.z = THREE.MathUtils.clamp(particle.mesh.position.z, -1.25, 1.25);
        }
        if (particle.mesh.position.y < bottom + 0.14 || particle.mesh.position.y > top - 0.14) {
          particle.velocity.y *= -1;
          particle.mesh.position.y = THREE.MathUtils.clamp(particle.mesh.position.y, bottom + 0.14, top - 0.14);
        }
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("pointercancel", onPointerUp);
      host.removeEventListener("wheel", onWheel);
      renderer.dispose();
      chamber.geometry.dispose();
      chamberMaterial.dispose();
      edgeGeometry.dispose();
      (edges.material as THREE.Material).dispose();
      piston.geometry.dispose();
      (piston.material as THREE.Material).dispose();
      rod.geometry.dispose();
      (rod.material as THREE.Material).dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.domElement.remove();
    };
  }, [moles]);

  if (webglFailed) {
    return (
      <GasChamberScene
        volume={volume}
        temperature={temperature}
        moles={moles}
        pressure={pressure}
        isRunning={isRunning}
      />
    );
  }

  return (
    <div className="relative h-full min-h-[340px] overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#f8fafc_0%,#ecfeff_48%,#f0fdf4_100%)]">
      <div
        ref={mountRef}
        className="h-full min-h-[340px] w-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        aria-label="3D ideal gas molecule chamber"
      />
      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/80 bg-white/85 px-3 py-2 text-left shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-emerald-600">3D gas chamber</p>
        <p className="mt-0.5 text-xs font-bold text-slate-600">ลากเพื่อหมุน ใช้ล้อเมาส์เพื่อซูม</p>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 text-center text-[10px] font-black text-slate-600">
        <span className="rounded-xl bg-white/85 px-2 py-2 shadow-sm">V {volume.toFixed(1)} L</span>
        <span className="rounded-xl bg-white/85 px-2 py-2 shadow-sm">T {temperature.toFixed(0)} K</span>
        <span className="rounded-xl bg-white/85 px-2 py-2 shadow-sm">P {pressure.toFixed(1)} kPa</span>
      </div>
    </div>
  );
}

function GasChamberScene({
  volume,
  temperature,
  moles,
  pressure,
  isRunning,
}: {
  volume: number;
  temperature: number;
  moles: number;
  pressure: number;
  isRunning: boolean;
}) {
  // Piston goes up and down based on volume (volume 10L to 50L)
  const targetPistonY = 240 - ((volume - 10) / 40) * 120;
  const [animatedPistonY, setAnimatedPistonY] = useState(targetPistonY);

  // Smooth LERP animation for the piston movement (Method 2)
  useEffect(() => {
    let frameId: number;
    const lerpPiston = () => {
      setAnimatedPistonY((prev) => {
        const diff = targetPistonY - prev;
        if (Math.abs(diff) < 0.1) return targetPistonY;
        return prev + diff * 0.15; // Smooth slide speed
      });
      frameId = requestAnimationFrame(lerpPiston);
    };
    frameId = requestAnimationFrame(lerpPiston);
    return () => cancelAnimationFrame(frameId);
  }, [targetPistonY]);

  return (
    <div className="relative flex h-full min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#fdfbf7_0%,#f0fdf4_48%,#f8fafc_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] opacity-35" />
      
      <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-left shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase text-emerald-600">thermodynamic system</p>
        <p className="mt-0.5 text-xs font-bold text-slate-600">PV = nRT relationship</p>
      </div>

      <svg className="relative z-10 h-full max-h-[360px] w-full max-w-[560px]" viewBox="0 0 560 360" fill="none" aria-hidden="true">
        <defs>
          {/* Metallic / steel gradients */}
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="30%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="pistonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="standGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          
          {/* Gas chamber glow gradient */}
          <linearGradient id="gasGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dcfce7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#bbf7d0" stopOpacity="0.8" />
          </linearGradient>

          {/* Ice / Frost gradient */}
          <linearGradient id="iceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Fire burner gradient */}
          <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          {/* Professional shadow */}
          <filter id="dropShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="1.5" dy="3.5" stdDeviation="2.5" floodColor="#064e3b" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Table/Stand base */}
        <rect x="140" y="270" width="280" height="24" rx="4" fill="url(#standGrad)" stroke="#475569" strokeWidth="1.5" />
        
        {/* Fire / Ice burner with rich gradient */}
        {temperature > 320 ? (
          <g transform="translate(255, 275)" className="animate-bounce">
            <path d="M 0,0 C 5,-18 15,-28 25,-44 C 35,-28 45,-18 50,0 Z" fill="url(#fireGrad)" />
            <path d="M 10,0 C 13,-9 18,-16 25,-24 C 32,-16 37,-9 40,0 Z" fill="#fde047" />
          </g>
        ) : temperature < 200 ? (
          <g transform="translate(265, 252)">
            <rect x="0" y="0" width="30" height="18" rx="4" fill="url(#iceGrad)" stroke="#0284c7" strokeWidth="1" filter="url(#dropShadow)" />
            <line x1="8" y1="9" x2="22" y2="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </g>
        ) : null}

        {/* Cylinder outline (top is open, sides and bottom closed) */}
        <path d="M180,80 L180,260 L380,260 L380,80" stroke="#475569" strokeWidth="6" strokeLinecap="round" fill="none" />
        
        {/* Cylinder Glass interior */}
        <rect x="183" y="80" width="194" height="177" fill="#f8fafc" opacity="0.3" />
        
        {/* Gas area (from bottom (257px) up to pistonY + 8) */}
        <rect x="183" y={animatedPistonY + 8} width="194" height={257 - (animatedPistonY + 8)} fill="url(#gasGlow)" />

        {/* Piston head */}
        <rect x="181" y={animatedPistonY - 8} width="198" height="16" rx="4" fill="url(#pistonGrad)" stroke="#334155" strokeWidth="2" filter="url(#dropShadow)" />
        {/* Piston shaft */}
        <rect x="272" y="20" width="16" height={animatedPistonY - 20} fill="url(#metalGrad)" stroke="#475569" strokeWidth="2" />
        {/* Weight handle */}
        <rect x="240" y="15" width="80" height="10" rx="3" fill="#334155" />

        {/* Dynamic bouncing gas molecules (Method 2) */}
        <MoleculeViewport
          temperature={temperature}
          moles={moles}
          pistonY={animatedPistonY}
          isRunning={isRunning}
        />

        {/* Pressure gauge on left */}
        <g transform="translate(50, 80)" filter="url(#dropShadow)">
          <circle cx="45" cy="45" r="40" fill="#ffffff" stroke="url(#metalGrad)" strokeWidth="4" />
          <path d="M20 60C25 35 40 25 70 25" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
          {/* Pressure indicator needle */}
          <g transform={`rotate(${-45 + Math.min(1.0, pressure / 1000) * 180} 45 45)`}>
            <line x1="45" y1="45" x2="70" y2="45" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
          </g>
          <circle cx="45" cy="45" r="5" fill="#ef4444" />
          <text x="45" y="70" fill="#059669" fontSize="10" fontWeight="900" textAnchor="middle">kPa</text>
        </g>
        
        {/* Thermometer on right */}
        <g transform="translate(425, 80)" filter="url(#dropShadow)">
          <rect x="25" y="10" width="10" height="60" rx="5" fill="#ffffff" stroke="url(#metalGrad)" strokeWidth="3" />
          <circle cx="30" cy="70" r="10" fill="url(#metalGrad)" stroke="#cbd5e1" strokeWidth="2.5" />
          {/* Red mercury indicator */}
          <rect x="28" y={70 - ((temperature - 100) / 400) * 50} width="4" height={((temperature - 100) / 400) * 50} rx="1" fill="url(#fireGrad)" />
          <circle cx="30" cy="70" r="7" fill="#f43f5e" />
          <text x="30" y="93" fill="#e11d48" fontSize="10" fontWeight="900" textAnchor="middle">{temperature.toFixed(0)} K</text>
        </g>
      </svg>
    </div>
  );
}

function GasGraph({ points }: { points: GasPoint[] }) {
  // X: Temp (100 to 500 K) -> 32 to 284 px
  // Y: Pressure (0 to 1000 kPa) -> 138 to 26 px
  const x = React.useCallback((t: number) => 32 + ((t - 100) / 400) * 252, []);
  const y = React.useCallback((p: number) => 138 - (p / 1000) * 112, []);

  const path = useMemo(() => {
    if (points.length === 0) return "";
    const sorted = [...points].sort((a, b) => a.temperature - b.temperature);
    return sorted.map((p, idx) => `${idx === 0 ? "M" : "L"}${x(p.temperature)},${y(p.pressure)}`).join(" ");
  }, [points, x, y]);

  return (
    <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <BarChart3 className="h-4.5 w-4.5 text-emerald-600" />
          กราฟความสัมพันธ์ P - T
        </h3>
        <span className="text-[10px] font-bold text-emerald-600">P-T Line</span>
      </div>
      <div className="flex-1 rounded-xl bg-slate-50/70 p-2">
        <svg className="h-full min-h-[174px] w-full" viewBox="0 0 320 170" fill="none" aria-hidden="true">
          <line x1="32" y1="138" x2="284" y2="138" stroke="#cbd5e1" strokeWidth="1.4" />
          <line x1="32" y1="110" x2="284" y2="110" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="82" x2="284" y2="82" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="54" x2="284" y2="54" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="26" x2="284" y2="26" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="32" y1="22" x2="32" y2="138" stroke="#cbd5e1" strokeWidth="1.4" />

          <text x="26" y="29" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">1000</text>
          <text x="26" y="85" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">500</text>
          <text x="26" y="141" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">0</text>

          {path && <path d={path} stroke="#10b981" strokeWidth="2.6" strokeLinecap="round" fill="none" />}

          {points.map((point, index) => (
            <circle
              key={`${point.temperature}-${index}`}
              cx={x(point.temperature)}
              cy={y(point.pressure)}
              r="4.5"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}

          <text x="32" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">100K</text>
          <text x="158" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">300K</text>
          <text x="284" y="156" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle">500K</text>
          <text x="284" y="130" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="end">Temp (K)</text>
          <text x="35" y="20" fill="#94a3b8" fontSize="7" fontWeight="800">Pressure (kPa)</text>
        </svg>
      </div>
    </section>
  );
}

export default function IdealGasLawSimulation() {
  const [volume, setVolume] = useState(25.0); // 10 to 50 L
  const [temperature, setTemperature] = useState(300); // 100 to 500 K
  const [moles, setMoles] = useState(1.0); // 0.2 to 2.5 mol
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dataPoints, setDataPoints] = useState<GasPoint[]>([]);
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const volumeRef = useRef(volume);
  const temperatureRef = useRef(temperature);
  const molesRef = useRef(moles);
  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { temperatureRef.current = temperature; }, [temperature]);
  useEffect(() => { molesRef.current = moles; }, [moles]);
  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  const pressure = useMemo(() => calculatePressure(moles, temperature, volume), [moles, temperature, volume]);
  const pvVal = useMemo(() => pressure * volume, [pressure, volume]);
  const nrtVal = useMemo(() => moles * R_CONSTANT * temperature, [moles, temperature]);

  // Main tick loop for heat scanner / automatic log / quest tracker
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      const deltaSeconds = 0.1;
      const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
      setElapsedSeconds(nextSeconds);
      elapsedSecondsRef.current = nextSeconds;

      // Quest: Maintain pressure between 300 kPa and 400 kPa for 10 seconds
      const currentP = calculatePressure(molesRef.current, temperatureRef.current, volumeRef.current);
      if (currentP >= 300 && currentP <= 400) {
        const nextQuestProg = Math.min(10, questProgressRef.current + deltaSeconds);
        setQuestProgress(nextQuestProg);
        questProgressRef.current = nextQuestProg;

        if (nextQuestProg >= 10 && !questSuccessRef.current) {
          setQuestSuccess(true);
          questSuccessRef.current = true;
        }
      } else {
        setQuestProgress(0);
        questProgressRef.current = 0;
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleLogPoint = () => {
    const point = {
      volume,
      temperature,
      moles,
      pressure,
    };
    if (dataPoints.some((p) => p.volume === volume && p.temperature === temperature && p.moles === moles)) return;
    setDataPoints((prev) => [...prev, point]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setVolume(25.0);
    setTemperature(300);
    setMoles(1.0);
    setDataPoints([]);
    setQuestProgress(0);
  };

  const handleSave = async () => {
    if (dataPoints.length === 0) {
      alert("ยังไม่มีข้อมูลการทดลองกฎของแก๊สอุดมคติสำหรับบันทึก กรุณากดบันทึกจุดวัดก่อน");
      return;
    }

    const experimentData = {
      labId: "ideal-gas-law",
      timestamp: new Date().toLocaleString("th-TH"),
      gasMoles: moles,
      temperature,
      pressure,
      dataPoints: dataPoints.map((p) => ({
        volume: p.volume,
        pressure: p.pressure,
        kelvin: p.temperature,
        moles: p.moles,
      })),
    };

    await saveExperimentAndSync({
      localStorageKey: "scisiam_saved_ideal_gas_experiment",
      localPayload: experimentData,
      labId: "ideal-gas-law",
      title: "Ideal Gas Law Simulation",
      graphPoints: experimentData.dataPoints,
      tableRows: experimentData.dataPoints,
      summary: { dataPointCount: experimentData.dataPoints.length },
      score: Math.min(100, experimentData.dataPoints.length * 20),
    });
  };

  const visibleRows = dataPoints.slice(-7);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#f8fafc] pb-12">
      <Navbar />

      <main className="mx-auto min-w-0 w-full max-w-[1440px] px-4 py-6 sm:px-12 md:px-20">
        <div className="flex flex-col gap-5">
          {/* Banner */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <section className="space-y-5 lg:col-span-9">
              <div className="relative flex min-h-[164px] items-center overflow-hidden rounded-2xl border border-emerald-100 bg-white px-5 py-6 shadow-sm shadow-slate-200/50 sm:px-7">
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <Gauge className="h-4.5 w-4.5" />
                    </div>
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">Chemistry / Physics</span>
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">พร้อมทดลองอุณหพลศาสตร์</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-normal text-slate-900">Ideal Gas Law Simulator (PV = nRT)</h1>
                  <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
                    ศึกษาความสัมพันธ์ระหว่างความดัน ปริมาตร อุณหภูมิ และปริมาณแก๊ส ในลูกสูบแบบปิด ทดลองระบบที่สภาวะแก๊สสมบูรณ์
                  </p>
                </div>
              </div>

              {/* Simulation Scene */}
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-7">
                  <div className="min-h-[460px] rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm shadow-slate-200/50">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-sm font-black text-slate-800">
                        <Gauge className="h-4.5 w-4.5 text-emerald-600" />
                        กระบอกทดลองอุณหพลศาสตร์
                      </h2>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                        P = {pressure.toFixed(1)} kPa
                      </span>
                    </div>
                    <GasChamber3DScene
                      volume={volume}
                      temperature={temperature}
                      moles={moles}
                      pressure={pressure}
                      isRunning={isRunning}
                    />
                  </div>
                </div>

                {/* Control Panel */}
                <div className="xl:col-span-5">
                  <section className="flex min-h-[460px] flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-200/50">
                    <h2 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
                      <Sliders className="h-4.5 w-4.5 text-emerald-600" />
                      แผงควบคุมอุณหพลศาสตร์
                    </h2>
                    <div className="flex-1 space-y-4">
                      {/* Volume Slider */}
                      <label className="block">
                        <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1">ปริมาตรกระบอกสูบ (V)</span>
                          <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">
                            {volume.toFixed(1)} L
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10.0"
                          max="50.0"
                          step="1.0"
                          value={volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="h-1.5 w-full rounded-full bg-slate-100 accent-blue-500"
                        />
                      </label>

                      {/* Temperature Slider */}
                      <label className="block">
                        <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1">อุณหภูมิของระบบ (T)</span>
                          <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">
                            {temperature.toFixed(0)} K
                          </span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="500"
                          step="10"
                          value={temperature}
                          onChange={(e) => setTemperature(Number(e.target.value))}
                          className="h-1.5 w-full rounded-full bg-slate-100 accent-rose-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                          <span>เย็นจัด (100K)</span>
                          <span>อุณหภูมิห้อง (~298K)</span>
                          <span>ร้อนจัด (500K)</span>
                        </div>
                      </label>

                      {/* Moles Slider */}
                      <label className="block">
                        <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1">ปริมาณโมลแก๊ส (n)</span>
                          <span className="rounded-md bg-slate-50 px-2 py-0.5 font-black text-slate-800">
                            {moles.toFixed(2)} mol
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.20"
                          max="2.50"
                          step="0.05"
                          value={moles}
                          onChange={(e) => setMoles(Number(e.target.value))}
                          className="h-1.5 w-full rounded-full bg-slate-100 accent-emerald-500"
                        />
                      </label>

                      {/* PV and nRT comparisons */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5">
                          <span>PV Value (J)</span>
                          <strong className="block text-xs font-black text-slate-800">{pvVal.toFixed(2)} J</strong>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5">
                          <span>nRT Value (J)</span>
                          <strong className="block text-xs font-black text-slate-800 text-emerald-600">{nrtVal.toFixed(2)} J</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      <button onClick={handleStartStop} className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm ${isRunning ? "bg-slate-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                        {isRunning ? <Pause className="h-4 w-4 fill-white stroke-none" /> : <Play className="h-4 w-4 fill-white stroke-none" />}
                        {isRunning ? "หยุดจับเวลา" : "เริ่มตรวจสอบเควส"}
                      </button>
                      <button onClick={handleLogPoint} className="inline-flex items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-xs font-black text-emerald-700 hover:bg-emerald-100">บันทึกจุด</button>
                      <button onClick={handleReset} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="รีเซ็ต">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button onClick={handleSave} className="col-span-4 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-xs font-black text-white hover:bg-green-700">
                        <Save className="h-4 w-4" />
                        บันทึกผลแก๊สอุดมคติ
                      </button>
                    </div>
                  </section>
                </div>
              </div>

              {/* Table, Graph & Theory */}
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <GasGraph points={dataPoints} />
                </div>

                <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 xl:col-span-4">
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                      <ClipboardList className="h-4.5 w-4.5 text-emerald-600" />
                      ตารางบันทึกอุณหพลศาสตร์
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">{dataPoints.length} จุด</span>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-emerald-50/60 text-[11px] font-black text-emerald-800">
                        <tr>
                          <th className="px-3 py-2">T (K)</th>
                          <th className="px-3 py-2">V (L)</th>
                          <th className="px-3 py-2">P (kPa)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                        {visibleRows.map((point, index) => (
                          <tr key={`${point.temperature}-${index}`}>
                            <td className="px-3 py-2 font-mono">{point.temperature.toFixed(0)} K</td>
                            <td className="px-3 py-2 font-mono text-blue-700">{point.volume.toFixed(1)} L</td>
                            <td className="px-3 py-2 font-mono text-emerald-700">{point.pressure.toFixed(1)} kPa</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 xl:col-span-4">
                  <h3 className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-800">
                    <Thermometer className="h-4.5 w-4.5 text-emerald-600" />
                    ทฤษฎีและสมการอ้างอิง
                  </h3>
                  <div className="flex flex-1 flex-col justify-between gap-3">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-center font-mono text-2xl font-black text-slate-800">
                      PV = nRT
                    </div>
                    <p className="text-xs font-semibold leading-relaxed text-slate-500 leading-relaxed leading-[1.6]">
                      กฎแก๊สอุดมคติแสดงให้เห็นว่า ผลคูณของความดันและปริมาตรจะแปรผันตรงกับจำนวนโมลและอุณหภูมิสัมบูรณ์ โดยมี R = 8.314 J/(mol·K) เป็นค่าคงที่ของแก๊ส
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">n: <b className="text-emerald-700">{moles.toFixed(2)} mol</b></span>
                      <span className="rounded-lg bg-slate-50 px-2 py-1.5">R: <b className="text-slate-700">8.314</b></span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Steps */}
              <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["กำหนดจำนวนโมล n", Sliders],
                  ["ควบคุมปริมาตร V", Sliders],
                  ["ปรับเปลี่ยนอุณหภูมิ T", Flame],
                  ["อ่านค่าความดัน P", Gauge],
                  ["ตรวจสอบอัตราส่วน PV/nRT", Target],
                ].map(([label, Icon], index) => {
                  const StepIcon = Icon as typeof Sliders;
                  return (
                    <div key={label as string} className="flex items-center gap-3 rounded-xl bg-slate-50/70 px-3 py-2">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <StepIcon className="h-5 w-5" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">{index + 1}</span>
                      </div>
                      <span className="text-xs font-black leading-relaxed text-slate-700">{label as string}</span>
                    </div>
                  );
                })}
              </section>
            </section>

            {/* Sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-3">
              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <Target className="h-4.5 w-4.5 text-blue-600" />
                  เป้าหมายการเรียนรู้
                </h2>
                <ul className="space-y-2.5 text-xs font-semibold leading-relaxed text-slate-500 leading-[1.6]">
                  {["ทำความเข้าใจและตรวจสอบความสอดคล้องของสมการ PV = nRT", "วิเคราะห์พฤติกรรมเชิงอุณหพลศาสตร์ของแก๊สอุดมคติ", "คำนวณหาความต่างศักย์และอุณหภูมิสัมบูรณ์เคลวิน", "ฝึกตีความกราฟความสัมพันธ์ P-T และ P-V"].map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Quest section */}
              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                  <Zap className="h-4.5 w-4.5 text-orange-500" />
                  ภารกิจควบคุมอุณหพลศาสตร์
                </h2>
                <p className="text-xs font-semibold text-slate-500 leading-[1.6]">
                  รักษาสดับความดันสะสมของแก๊ส (Pressure) ให้อยู่ในช่วง 300 kPa - 400 kPa โดยการปรับอุณหภูมิ T และ ปริมาตร V สลับอย่างสมดุลต่อเนื่องกันเป็นเวลา 10 วินาที
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-300`}
                      style={{ width: `${(questProgress / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-500">{((questProgress / 10) * 100).toFixed(0)}%</span>
                </div>
                {questSuccess && (
                  <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-100 p-2 text-center text-xs font-bold text-emerald-700">
                    สำเร็จภารกิจควบคุมความดันแล้ว
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  คำแนะนำในการทดลอง
                </h2>
                <ul className="space-y-2 text-xs font-semibold leading-relaxed text-slate-500 leading-[1.6]">
                  {["เมื่ออุณหภูมิคงที่ อัตราส่วน P-V จะเป็นตามกฎของบอยล์", "เมื่อความดันคงที่ อัตราส่วน V-T จะเป็นตามกฎของชาร์ล", "กดบันทึกข้อมูลในหลายสภาวะเพื่อตรวจสอบความสัมพันธ์เชิงเส้น"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

