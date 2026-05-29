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
import DecorativeBackground from "@/components/labs/DecorativeBackground";

import OhmsLawSimulation from "@/components/labs/simulation/OhmsLawSimulation";
import HookesLawSimulation from "@/components/labs/simulation/HookesLawSimulation";
import AcidBaseTitrationSimulation from "@/components/labs/simulation/AcidBaseTitrationSimulation";
import BoylesLawSimulation from "@/components/labs/simulation/BoylesLawSimulation";
import CharlesLawSimulation from "@/components/labs/simulation/CharlesLawSimulation";
import PhotosynthesisRateSimulation from "@/components/labs/simulation/PhotosynthesisRateSimulation";
import MendelianGeneticsSimulation from "@/components/labs/simulation/MendelianGeneticsSimulation";
import MitosisCellCycleSimulation from "@/components/labs/simulation/MitosisCellCycleSimulation";

export default function SimulationRoomPage() {
  const params = useParams();
  const labId = (params?.id as string) || "newtons-cooling";

  // Route to Ohm's Law simulation if labId matches
  if (labId === "ohms-law") {
    return <OhmsLawSimulation />;
  }

  // Route to Hooke's Law simulation if labId matches
  if (labId === "hookes-law") {
    return <HookesLawSimulation />;
  }

  if (labId === "acid-base-titration") {
    return <AcidBaseTitrationSimulation />;
  }

  if (labId === "boyles-law") {
    return <BoylesLawSimulation />;
  }

  if (labId === "charles-law") {
    return <CharlesLawSimulation />;
  }

  if (labId === "photosynthesis-rate") {
    return <PhotosynthesisRateSimulation />;
  }

  if (labId === "mendels-inheritance") {
    return <MendelianGeneticsSimulation />;
  }

  if (labId === "mitosis-division") {
    return <MitosisCellCycleSimulation />;
  }

  return <NewtonCoolingSimulation labId={labId} />;
}

function NewtonCoolingSimulation({ labId }: { labId: string }) {
  const router = useRouter();

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

  // Heater & Quest States
  const [isHeaterOn, setIsHeaterOn] = useState(false);
  const [questProgress, setQuestProgress] = useState(0);
  const [questSuccess, setQuestSuccess] = useState(false);

  // References for keeping track of fast state changes inside the interval
  const isRunningRef = useRef(isRunning);
  const elapsedSecondsRef = useRef(elapsedSeconds);
  const currentTempRef = useRef(currentTemp);
  const lastLoggedTimeRef = useRef(lastLoggedTime);

  const initialTempRef = useRef(initialTemp);
  const ambientTempRef = useRef(ambientTemp);
  const coolingConstantRef = useRef(coolingConstant);
  const logIntervalRef = useRef(logInterval);
  const simulationSpeedRef = useRef(simulationSpeed);

  const isHeaterOnRef = useRef(isHeaterOn);
  const questProgressRef = useRef(questProgress);
  const questSuccessRef = useRef(questSuccess);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { currentTempRef.current = currentTemp; }, [currentTemp]);
  useEffect(() => { lastLoggedTimeRef.current = lastLoggedTime; }, [lastLoggedTime]);

  useEffect(() => { initialTempRef.current = initialTemp; }, [initialTemp]);
  useEffect(() => { ambientTempRef.current = ambientTemp; }, [ambientTemp]);
  useEffect(() => { coolingConstantRef.current = coolingConstant; }, [coolingConstant]);
  useEffect(() => { logIntervalRef.current = logInterval; }, [logInterval]);
  useEffect(() => { simulationSpeedRef.current = simulationSpeed; }, [simulationSpeed]);

  useEffect(() => { isHeaterOnRef.current = isHeaterOn; }, [isHeaterOn]);
  useEffect(() => { questProgressRef.current = questProgress; }, [questProgress]);
  useEffect(() => { questSuccessRef.current = questSuccess; }, [questSuccess]);

  // Handle setting active currentTemp base on initialTemp before start
  useEffect(() => {
    if (!isRunning && elapsedSeconds === 0) {
      // Keep the preview thermometer synced with the slider before the simulation starts.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        const deltaSeconds = 0.1 * simulationSpeedRef.current;
        const nextSeconds = elapsedSecondsRef.current + deltaSeconds;
        setElapsedSeconds(nextSeconds);
        elapsedSecondsRef.current = nextSeconds;

        // Calculate Temperature based on decay or heating equation (differential step method)
        let nextTemp = currentTempRef.current;
        if (isHeaterOnRef.current) {
          // Heat up rate: 18°C per minute, which is 0.3°C per second
          const heatingRate = 18;
          nextTemp = Math.min(100, currentTempRef.current + (heatingRate * deltaSeconds) / 60);
        } else {
          // Cool down rate based on Newton's Law of Cooling: dT = -k(T - Ts)*dt
          // k is per minute, so we multiply by deltaSeconds / 60
          const coolingAmount = coolingConstantRef.current * (currentTempRef.current - ambientTempRef.current) * (deltaSeconds / 60);
          nextTemp = Math.max(ambientTempRef.current, currentTempRef.current - coolingAmount);
        }
        
        setCurrentTemp(nextTemp);
        currentTempRef.current = nextTemp;

        // Quest tracking: Maintain 50-60°C for 20 seconds continuously
        if (nextTemp >= 50 && nextTemp <= 60) {
          const nextQuestProg = Math.min(20, questProgressRef.current + deltaSeconds);
          setQuestProgress(nextQuestProg);
          questProgressRef.current = nextQuestProg;
          
          if (nextQuestProg >= 20 && !questSuccessRef.current) {
            setQuestSuccess(true);
            questSuccessRef.current = true;
            
            // Reward 25 points!
            const currentPoints = Number(localStorage.getItem("scisiam_points") || "120");
            const newPoints = currentPoints + 25;
            localStorage.setItem("scisiam_points", String(newPoints));
            window.dispatchEvent(new Event("points-updated"));
            alert("🎉 ยินดีด้วย! คุณผ่านภารกิจควบคุมอุณหภูมิน้ำให้อยู่ในช่วง 50°C - 60°C ต่อเนื่องเป็นเวลา 20 วินาทีสำเร็จ! รับ +25 แต้ม 💎");
          }
        } else {
          setQuestProgress(0);
          questProgressRef.current = 0;
        }

        // Check if log interval threshold is crossed to auto log a data point
        const mins = nextSeconds / 60;
        if (nextSeconds - lastLoggedTimeRef.current >= logIntervalRef.current) {
          setDataPoints((prev) => [
            ...prev,
            { time: mins, temp: nextTemp, ambient: ambientTempRef.current },
          ]);
          setLastLoggedTime(nextSeconds);
          lastLoggedTimeRef.current = nextSeconds;
        }
      }, 100);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  // Start / Pause toggle
  const handleStartStop = () => {
    const nextIsRunning = !isRunning;
    setIsRunning(nextIsRunning);
    isRunningRef.current = nextIsRunning;

    // If starting from absolute zero, add initial log point
    if (nextIsRunning && elapsedSeconds === 0) {
      setDataPoints([
        { time: 0, temp: initialTemp, ambient: ambientTemp }
      ]);
      setLastLoggedTime(0);
      lastLoggedTimeRef.current = 0;
    }
  };

  // Toggle Heater power
  const handleToggleHeater = () => {
    if (!isRunning) return;
    const nextHeater = !isHeaterOn;
    setIsHeaterOn(nextHeater);
    isHeaterOnRef.current = nextHeater;
  };

  // Reset simulator
  const handleReset = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    
    setIsHeaterOn(false);
    isHeaterOnRef.current = false;
    
    setQuestProgress(0);
    questProgressRef.current = 0;
    
    setElapsedSeconds(0);
    elapsedSecondsRef.current = 0;
    
    setCurrentTemp(initialTemp);
    currentTempRef.current = initialTemp;
    
    setDataPoints([]);
    
    setLastLoggedTime(0);
    lastLoggedTimeRef.current = 0;
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
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content)
          .then(() => alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!"))
          .catch(() => {
            fallbackCopy(content);
          });
      } else {
        fallbackCopy(content);
      }
    } catch (err) {
      fallbackCopy(content);
    }
  };

  // Fallback Copy method for legacy browsers / non-secure contexts
  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // Prevent scrolling to bottom in legacy browsers
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      alert("คัดลอกตารางข้อมูลลงคลิปบอร์ดแล้ว!");
    } catch (err) {
      alert("ไม่สามารถคัดลอกข้อมูลโดยอัตโนมัติได้ กรุณาคัดลอกด้วยตนเอง");
    }
    document.body.removeChild(textArea);
  };

  // Save results and redirect
  const handleSaveResults = () => {
    if (dataPoints.length === 0) {
      alert("ไม่พบข้อมูลการทดลองสำหรับบันทึกผล! กรุณากดเริ่มทดลองและเก็บบันทึกข้อมูลก่อน");
      return;
    }
    
    const experimentData = {
      labId,
      timestamp: new Date().toLocaleString("th-TH"),
      initialTemp,
      ambientTemp,
      coolingConstant,
      dataPoints,
    };
    
    localStorage.setItem("scisiam_saved_cooling_experiment", JSON.stringify(experimentData));
    
    // Add points for completing the lab (+25 points)
    const currentPoints = Number(localStorage.getItem("scisiam_points") || "120");
    localStorage.setItem("scisiam_points", String(currentPoints + 25));
    window.dispatchEvent(new Event("points-updated"));

    alert("บันทึกข้อมูลการทดลอง (กราฟอุณหภูมิและตารางบันทึกผล) สำเร็จ! 🎉");
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
                  isHeaterOn={isHeaterOn}
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
                  onAddPoint={handleAddPoint}
                  isHeaterOn={isHeaterOn}
                  onToggleHeater={handleToggleHeater}
                />
              </div>
            </div>

            {/* Row 2: Log Data Table & Live Graph & Formula (Stacked horizontally/full-width) */}
            <div className="flex flex-col gap-6.5">
              <div className="w-full">
                <DataTable
                  dataPoints={dataPoints}
                  onExportCSV={handleExportCSV}
                  onCopyData={handleCopyData}
                />
              </div>
              <div className="w-full">
                <LiveGraph dataPoints={dataPoints} />
              </div>
              <div className="w-full">
                <FormulaCard />
              </div>
            </div>

            {/* Row 3: Timelines Guide */}
            <ExperimentSteps />

          </div>

          {/* Right Column Sidebar (25% / 3 columns) */}
          <div className="lg:col-span-3">
            <LearningSidebar questProgress={questProgress} questSuccess={questSuccess} />
          </div>

        </div>
      </main>

    </div>
  );
}
