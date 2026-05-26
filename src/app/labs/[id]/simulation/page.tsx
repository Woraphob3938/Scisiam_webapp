"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/labs/Breadcrumb";
import SimulationHero from "@/components/labs/simulation/SimulationHero";
import ExperimentViewport from "@/components/labs/simulation/ExperimentViewport";
import ControlPanel from "@/components/labs/simulation/ControlPanel";
import LiveGraph, { DataPoint } from "@/components/labs/simulation/LiveGraph";
import DataTable from "@/components/labs/simulation/DataTable";
import FormulaCard from "@/components/labs/simulation/FormulaCard";
import ExperimentSteps from "@/components/labs/simulation/ExperimentSteps";
import LearningSidebar from "@/components/labs/simulation/LearningSidebar";
import BottomCallout from "@/components/BottomCallout";
import DecorativeBackground from "@/components/labs/DecorativeBackground";

import { Sparkles, ArrowRight } from "lucide-react";

export default function SimulationRoomPage() {
  const params = useParams();
  const router = useRouter();
  const labId = (params?.id as string) || "newtons-cooling";

  // Simulator configurations
  const [initialTemp, setInitialTemp] = useState(90); // T0
  const [ambientTemp, setAmbientTemp] = useState(25); // Ts
  const [coolingConstant, setCoolingConstant] = useState(0.12); // k

  const [logInterval, setLogInterval] = useState(30); // auto log interval (10s, 30s, 60s)
  const [simulationSpeed, setSimulationSpeed] = useState(1); // sim speed (0.5x, 1x, 2x, 5x)

  // Simulation running loop states
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTemp, setCurrentTemp] = useState(90);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [lastLoggedTime, setLastLoggedTime] = useState(0);

  // References for keeping track of fast state changes inside the interval
  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const currentTempRef = useRef(currentTemp);
  const lastLoggedTimeRef = useRef(lastLoggedTime);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { currentTempRef.current = currentTemp; }, [currentTemp]);
  useEffect(() => { lastLoggedTimeRef.current = lastLoggedTime; }, [lastLoggedTime]);

  // Handle setting active currentTemp base on initialTemp before start
  useEffect(() => {
    if (!isRunning && elapsedSeconds === 0) {
      setCurrentTemp(initialTemp);
    }
  }, [initialTemp, isRunning, elapsedSeconds]);

  // Main Ticking Loop effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning) {
      // Tick every 100ms for smoothness
      timer = setInterval(() => {
        // Increment elapsed seconds based on speed multiplier
        const deltaSeconds = 0.1 * simulationSpeed;
        const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
        setElapsedSeconds(nextSeconds);

        // Calculate Temperature based on decay equation
        // T(t) = Ts + (T0 - Ts) * e^(-kt)
        // Convert seconds to minutes for the 'k' rate constant (which is per-minute)
        const mins = nextSeconds / 60;
        const nextTemp = ambientTemp + (initialTemp - ambientTemp) * Math.exp(-coolingConstant * mins);
        setCurrentTemp(nextTemp);

        // Check if log interval threshold is crossed to auto log a data point
        if (nextSeconds - lastLoggedTimeRef.current >= logInterval) {
          setDataPoints((prev) => [
            ...prev,
            { time: mins, temp: nextTemp, ambient: ambientTemp },
          ]);
          setLastLoggedTime(nextSeconds);
        }
      }, 100);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, simulationSpeed, initialTemp, ambientTemp, coolingConstant, logInterval]);

  // Start / Pause toggle
  const handleStartStop = () => {
    setIsRunning(!isRunning);

    // If starting from absolute zero, add initial log point
    if (!isRunning && elapsedSeconds === 0) {
      setDataPoints([
        { time: 0, temp: initialTemp, ambient: ambientTemp }
      ]);
      setLastLoggedTime(0);
    }
  };

  // Reset simulator
  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setCurrentTemp(initialTemp);
    setDataPoints([]);
    setLastLoggedTime(0);
  };

  // Add Manual log point
  const handleAddPoint = () => {
    const mins = elapsedSeconds / 60;
    // Prevent duplicate entries for the exact same timestamp
    if (dataPoints.some(p => p.time === mins)) return;

    setDataPoints((prev) => [
      ...prev,
      { time: mins, temp: currentTemp, ambient: ambientTemp },
    ]);
  };

  // Export data as simulated CSV
  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการส่งออก!");
      return;
    }
    const headers = "เวลา (นาที),อุณหภูมิของวัตถุ (C),อุณหภูมิสิ่งแวดล้อม (C)\n";
    const rows = dataPoints.map(p => `${p.time.toFixed(2)},${p.temp.toFixed(2)},${p.ambient.toFixed(2)}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scisiam_cooling_log_${labId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Data to clipboard
  const handleCopyData = () => {
    if (dataPoints.length === 0) {
      alert("ไม่มีข้อมูลบันทึกสำหรับการคัดลอก!");
      return;
    }
    const content = dataPoints
      .map(p => `เวลา: ${p.time.toFixed(1)} นาที | อุณหภูมิ: ${p.temp.toFixed(1)}°C | อุณหภูมิแวดล้อม: ${p.ambient.toFixed(1)}°C`)
      .join("\n");
    navigator.clipboard.writeText(content);
    alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!");
  };

  // Save results and redirect
  const handleSaveResults = () => {
    alert("บันทึกความคืบหน้าและประวัติผลการทดลองในโปรไฟล์ผู้ใช้สำเร็จ! 🎉");
    router.push(`/labs/${labId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-16 overflow-hidden">
      
      {/* Absolute Decorative Floating Elements */}
      <DecorativeBackground />

      {/* 1. Navbar */}
      <Navbar />

      {/* 2. Breadcrumb Navigation */}
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 md:px-20 pt-6 pb-2 select-none">
        <Breadcrumb category="Physics" title="Newton's law of cooling / ห้องทดลองจำลอง" />
      </div>

      {/* 3. Hero Section Title card */}
      <SimulationHero labId={labId} />

      {/* 4. Main Dashboard Grid Layout */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-12 md:px-20 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Areas (75% / 9 columns) */}
          <div className="lg:col-span-9 space-y-7.5">
            
            {/* Simulation Viewport & Controls Side-by-side grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <div className="h-full">
                <ExperimentViewport
                  currentTemp={currentTemp}
                  initialTemp={initialTemp}
                  ambientTemp={ambientTemp}
                  elapsedSeconds={elapsedSeconds}
                  coolingConstant={coolingConstant}
                />
              </div>
              <div className="h-full">
                <ControlPanel
                  initialTemp={initialTemp}
                  setInitialTemp={setInitialTemp}
                  ambientTemp={ambientTemp}
                  setAmbientTemp={setAmbientTemp}
                  coolingConstant={coolingConstant}
                  setCoolingConstant={setCoolingConstant}
                  logInterval={logInterval}
                  setLogInterval={setLogInterval}
                  simulationSpeed={simulationSpeed}
                  setSimulationSpeed={setSimulationSpeed}
                  isRunning={isRunning}
                  onStartStop={handleStartStop}
                  onReset={handleReset}
                  onSave={handleSaveResults}
                />
              </div>
            </div>

            {/* Row 2: Live Graph & Log Data Table & Formula */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6.5">
              <div className="lg:col-span-5 md:col-span-6 col-span-1 h-full">
                <LiveGraph dataPoints={dataPoints} />
              </div>
              <div className="lg:col-span-4 md:col-span-6 col-span-1 h-full">
                <DataTable
                  dataPoints={dataPoints}
                  onAddPoint={handleAddPoint}
                  onExportCSV={handleExportCSV}
                  onCopyData={handleCopyData}
                />
              </div>
              <div className="lg:col-span-3 md:col-span-12 col-span-1 h-full">
                <FormulaCard />
              </div>
            </div>

            {/* Row 3: Timelines Guide */}
            <ExperimentSteps />

          </div>

          {/* Right Column Sidebar (25% / 3 columns) */}
          <div className="lg:col-span-3">
            <LearningSidebar />
          </div>

        </div>
      </main>

      {/* 5. Custom Bottom Callout Banner */}
      <div className="w-full max-w-4xl mx-auto px-6 py-6 select-none relative z-10">
        <div className="relative overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-indigo-500/10 group hover:shadow-xl hover:shadow-indigo-500/15 transition-all duration-300">
          <div className="bg-white/95 rounded-full px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300 animate-pulse shrink-0" />
              <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent leading-relaxed tracking-wide">
                ทดลองเสร็จแล้วหรือยัง? วิเคราะห์ผลและบันทึกการเรียนรู้ของคุณได้ทันที! 🚀
              </p>
            </div>
            
            <button
              onClick={handleSaveResults}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1 cursor-pointer active:scale-95 shadow-md shadow-indigo-500/10"
            >
              <span>ไปยังหน้าบันทึกผล</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
