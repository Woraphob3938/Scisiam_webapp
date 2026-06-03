"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/labs/Breadcrumb";
import DecorativeBackground from "@/components/labs/DecorativeBackground";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import {
  loadSupabaseLearningSnapshot,
  readLocalLearningSnapshot,
  type LearningRunSnapshot,
} from "@/lib/supabase/learning-snapshot";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { SCISIAM_AUTH_EVENT } from "@/lib/supabase/auth-cache";
import { 
  FlaskConical,
  ClipboardCheck,
  Award,
  Star,
  Lock,
  ArrowRight,
  Pencil,
  Camera,
  Activity,
  Flame,
  ChevronRight,
  BookOpen,
  Users,
  FileText,
  Download,
  Plus,
  TrendingUp,
  GraduationCap,
  Zap
} from "lucide-react";

interface SavedCoolingExperiment {
  timestamp?: string;
  initialTemp?: number;
  ambientTemp?: number;
  coolingConstant?: number;
}

export default function ProfilePage() {
  const { isCollapsed } = useSidebar();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [username, setUsername] = useState("นักเรียน");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("นักเรียน");
  const [role, setRole] = useState("student");
  const [activeTeacherTab, setActiveTeacherTab] = useState<"classrooms" | "submissions" | "stats" | "reviews">("classrooms");

  // State to hold saved experiment from simulation (for student)
  const [savedExperiment, setSavedExperiment] = useState<SavedCoolingExperiment | null>(null);

  const [points, setPoints] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [recentRuns, setRecentRuns] = useState<LearningRunSnapshot[]>([]);
  const [activeStudentTab, setActiveStudentTab] = useState<"overview" | "rewards">("overview");

  // Teacher dashboard uses demo data until classroom management is connected to Supabase.
  const [teacherName, setTeacherName] = useState("ครูอรทัย");
  const [isEditingTeacherName, setIsEditingTeacherName] = useState(false);
  const [tempTeacherName, setTempTeacherName] = useState("ครูอรทัย");

  // Demo classrooms for competition presentation mode.
  const [classrooms, setClassrooms] = useState([
    { id: 1, name: "ม.4/1", students: 36, files: 4, deadline: "อีก 2 วัน", status: "กำลังเรียน" },
    { id: 2, name: "ม.4/2", students: 34, files: 3, deadline: "อีก 4 วัน", status: "กำลังเรียน" },
    { id: 3, name: "ม.5/1", students: 40, files: 5, deadline: "อีก 5 วัน", status: "กำลังเรียน" },
    { id: 4, name: "ม.5/2", students: 38, files: 4, deadline: "อีก 7 วัน", status: "กำลังเรียน" },
  ]);

  // Demo student submissions for teacher presentation mode.
  const [submissions, setSubmissions] = useState([
    { id: 1, name: "ด.ช. ณัฐพล มณีเนตร", room: "ม.4/1", lab: "Newton's Law of Cooling", status: "ส่งแล้ว", score: "10/10", time: "10 นาทีที่แล้ว" },
    { id: 2, name: "ด.ญ. อริศรา บุญส่ง", room: "ม.4/1", lab: "Hooke's Law of Elasticity", status: "กำลังทำ", time: "25 นาทีที่แล้ว" },
    { id: 3, name: "ด.ช. เกียรติศักดิ์ อุดม", room: "ม.4/2", lab: "Ohm's Law & DC Circuits", status: "ค้างส่ง", deadline: "วันนี้!", time: "1 วันที่แล้ว" },
    { id: 4, name: "ด.ญ. กัญญารัตน์ สีขาว", room: "ม.5/1", lab: "Newton's Law of Cooling", status: "ส่งแล้ว", score: "9.5/10", time: "2 ชั่วโมงที่แล้ว" },
    { id: 5, name: "ด.ช. พีรพงษ์ แก้วมณี", room: "ม.5/2", lab: "Hooke's Law of Elasticity", status: "กำลังทำ", time: "3 ชั่วโมงที่แล้ว" },
  ]);

  // Demo pending reviews for teacher presentation mode.
  const [pendingReviews, setPendingReviews] = useState([
    { id: 101, name: "ด.ช. ศักดิ์สิทธิ์ มีชัย", room: "ม.4/1", lab: "Hooke's Law of Elasticity", time: "31 พ.ค. 13:10", data: { mass: "150g", elongation: "4.5cm", k: "32.6 N/m", conclusion: "ความยืดหยุ่นของสปริงเป็นไปตามกฎของฮุกอย่างชัดเจน ค่าคงตัวสปริงที่คำนวณได้มีความถูกต้อง" } },
    { id: 102, name: "ด.ญ. รุ่งนภา สมบูรณ์", room: "ม.4/2", lab: "Ohm's Law & DC Circuits", time: "31 พ.ค. 12:45", data: { voltage: "6.0V", current: "0.2A", resistance: "30.0Ω", conclusion: "กระแสไฟฟ้าที่ไหลผ่านตัวต้านทานแปรผันตรงกับความต่างศักย์ไฟฟ้าที่ป้อนเข้ามาตามทฤษฎี" } },
    { id: 103, name: "ด.ช. ธีรภัทร รักดี", room: "ม.5/1", lab: "Newton's Law of Cooling", time: "31 พ.ค. 11:20", data: { initial: "85°C", ambient: "28°C", duration: "1200s", conclusion: "อัตราการลดอุณหภูมิของน้ำร้อนลดลงอย่างรวดเร็วในช่วงแรกและช้าลงเมื่อเข้าใกล้อุณหภูมิห้อง" } },
    { id: 104, name: "ด.ญ. วาสนา รุ่งเรือง", room: "ม.5/2", lab: "Ohm's Law & DC Circuits", time: "30 พ.ค. 16:30", data: { voltage: "12.0V", current: "0.4A", resistance: "30.0Ω", conclusion: "ความชันของกราฟความสัมพันธ์ระหว่าง V และ I คือค่าความต้านทานไฟฟ้าของวงจร" } },
  ]);

  // Demo teacher activities timeline for teacher presentation mode.
  const [teacherActivities, setTeacherActivities] = useState([
    { id: 1, time: "13:00 น.", title: 'มอบหมายงาน "Hooke\'s Law of Elasticity" ให้ห้อง ม.4/1 และ ม.4/2', type: "assign" },
    { id: 2, time: "11:15 น.", title: 'ตรวจรายงานจำลองการทดลอง "Newton\'s Law of Cooling" ของ ม.5/1 (15 รายงาน)', type: "grade" },
    { id: 3, time: "09:30 น.", title: 'ดาวน์โหลดสรุปรายงานผลคะแนนของห้อง ม.5/2 เป็นไฟล์ Excel', type: "download" },
    { id: 4, time: "วานนี้", title: 'สร้างห้องเรียนใหม่ "ห้องเรียนวิชาฟิสิกส์เพิ่มเติม ม.5/2"', type: "classroom" },
    { id: 5, time: "2 วันที่แล้ว", title: 'อัปโหลดคู่มือแล็บ "Ohm\'s Law & DC Circuits"', type: "upload" },
  ]);

  // Modals / Toast Interaction
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassStudents, setNewClassStudents] = useState("35");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignLab, setAssignLab] = useState("Hooke's Law of Elasticity");
  const [assignRoom, setAssignRoom] = useState("ม.4/1");

  const [activeReview, setActiveReview] = useState<typeof pendingReviews[0] | null>(null);
  const [gradeScore, setGradeScore] = useState("9");
  const [gradeFeedback, setGradeFeedback] = useState("ทำการทดลองได้เรียบร้อยและบันทึกผลได้แม่นยำดีมาก");
  const [viewingReport, setViewingReport] = useState<typeof pendingReviews[0] | null>(null);

  useEffect(() => {
    const applyLearningSnapshot = (snapshot: ReturnType<typeof readLocalLearningSnapshot>) => {
      setPoints(snapshot.points);
      setCompletedCount(snapshot.completedCount);
      setRecentRuns(snapshot.recentRuns);
    };

    const loadProfileData = async () => {
      const storedName = localStorage.getItem("scisiam_user_name");
      const storedRole = localStorage.getItem("scisiam_user_role");

      if (storedRole) {
        setRole(storedRole);
      }
      
      if (storedName) {
        setUsername(storedName);
        setTempName(storedName);
        setTeacherName(storedName);
        setTempTeacherName(storedName);
      } else {
        // Default fallback names based on role
        const defaultName = storedRole === "teacher" ? "ครูอรทัย" : "นักเรียน";
        setUsername(defaultName);
        setTempName(defaultName);
        setTeacherName(defaultName);
        setTempTeacherName(defaultName);
      }

      applyLearningSnapshot(readLocalLearningSnapshot());

      const raw = localStorage.getItem("scisiam_saved_cooling_experiment");
      if (raw) {
        try {
          setSavedExperiment(JSON.parse(raw) as SavedCoolingExperiment);
        } catch (e) {
          console.error("Failed to parse saved experiment", e);
        }
      }

      try {
        const snapshot = await loadSupabaseLearningSnapshot();
        if (snapshot) {
          applyLearningSnapshot(snapshot);
          if (snapshot.profile) {
            const displayName = snapshot.profile.displayName;
            setRole(snapshot.profile.role);
            setUsername(displayName);
            setTempName(displayName);
            setTeacherName(displayName);
            setTempTeacherName(displayName);
          }
        }
      } catch (error) {
        console.error("Failed to load Supabase profile progress", error);
      }
    };

    const checkAuthStatus = async () => {
      let loggedIn = false;
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        loggedIn = !!user;
      } else {
        loggedIn = localStorage.getItem("scisiam_logged_in") === "true";
      }

      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        await loadProfileData();
      } else {
        // Clear all state values if not logged in
        setPoints(0);
        setCompletedCount(0);
        setRecentRuns([]);
        setSavedExperiment(null);
      }
      setCheckingAuth(false);
    };

    // Dynamic tab selection via URL search parameters
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam === "rewards") {
      setTimeout(() => setActiveStudentTab("rewards"), 0);
    } else if (tabParam === "overview") {
      setTimeout(() => setActiveStudentTab("overview"), 0);
    }

    void checkAuthStatus();

    window.addEventListener(SCISIAM_AUTH_EVENT, checkAuthStatus);
    window.addEventListener("storage", checkAuthStatus);

    return () => {
      window.removeEventListener(SCISIAM_AUTH_EVENT, checkAuthStatus);
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUsername(tempName);
      localStorage.setItem("scisiam_user_name", tempName);
      window.dispatchEvent(new Event("scisiam-auth-update"));
      setIsEditingName(false);
    }
  };

  const handleSaveTeacherName = () => {
    if (tempTeacherName.trim()) {
      setTeacherName(tempTeacherName);
      setUsername(tempTeacherName);
      localStorage.setItem("scisiam_user_name", tempTeacherName);
      window.dispatchEvent(new Event("scisiam-auth-update"));
      setIsEditingTeacherName(false);
      showToast("แก้ไขชื่อสำเร็จแล้ว! ✏️", "success");
    }
  };

  const handleCreateClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const newClassObj = {
      id: classrooms.length + 1,
      name: newClassName.trim(),
      students: parseInt(newClassStudents) || 30,
      files: 0,
      deadline: "ยังไม่ได้ระบุ",
      status: "กำลังเรียน"
    };
    setClassrooms([...classrooms, newClassObj]);
    setTeacherActivities([
      { id: Date.now(), time: "เมื่อสักครู่", title: `สร้างห้องเรียนใหม่ "${newClassName.trim()}"`, type: "classroom" },
      ...teacherActivities
    ]);
    setIsCreateModalOpen(false);
    setNewClassName("");
    showToast(`สร้างห้องเรียน ${newClassObj.name} สำเร็จ! 🏫`, "success");
  };

  const handleAssignExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherActivities([
      { id: Date.now(), time: "เมื่อสักครู่", title: `มอบหมายงาน "${assignLab}" ให้ห้อง ${assignRoom}`, type: "assign" },
      ...teacherActivities
    ]);
    setClassrooms(classrooms.map(c => {
      if (c.name === assignRoom) {
        return { ...c, files: c.files + 1, deadline: "อีก 7 วัน" };
      }
      return c;
    }));
    setIsAssignModalOpen(false);
    showToast(`มอบหมายการทดลอง "${assignLab}" เรียบร้อย! 🧪`, "success");
  };

  const handleGradeStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview) return;
    const newSub = {
      id: Date.now(),
      name: activeReview.name,
      room: activeReview.room,
      lab: activeReview.lab,
      status: "ส่งแล้ว",
      score: `${gradeScore}/10`,
      time: "เมื่อสักครู่"
    };
    setSubmissions([newSub, ...submissions]);
    setPendingReviews(pendingReviews.filter(p => p.id !== activeReview.id));
    setTeacherActivities([
      { id: Date.now(), time: "เมื่อสักครู่", title: `ประเมินผลรายงานของ ${activeReview.name} (${activeReview.room}): ได้คะแนน ${gradeScore}/10`, type: "grade" },
      ...teacherActivities
    ]);
    setActiveReview(null);
    showToast(`บันทึกคะแนน ด.ช./ด.ญ. สำเร็จ! 🎓`, "success");
  };

  const handleDownload = (format: "PDF" | "Excel") => {
    showToast(`กำลังสร้างรายงานสรุปในรูปแบบ ${format}... 📄`, "info");
    setTimeout(() => {
      showToast(`ดาวน์โหลดรายงาน (${format}) สำเร็จ! 💾`, "success");
    }, 1500);
  };

  // Student dashboard derives real progress from Supabase first, then local prototype cache.
  const studentStats = useMemo(() => {
    return [
      {
        title: "ห้องแล็บที่ทำแล้ว",
        subtitle: "จาก 36 ห้อง",
        value: String(completedCount),
        icon: FlaskConical,
        color: "text-blue-500",
        bg: "bg-blue-50/70 border border-blue-100/50",
        glow: "hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200"
      },
      {
        title: "ภารกิจที่ทำเสร็จ",
        subtitle: "จาก 15 ภารกิจ",
        value: String(Math.min(15, Math.floor(completedCount * 1.2))),
        icon: ClipboardCheck,
        color: "text-emerald-500",
        bg: "bg-emerald-50/70 border border-emerald-100/50",
        glow: "hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-200"
      },
      {
        title: "คะแนนรวม",
        subtitle: "คะแนน",
        value: points.toLocaleString("th-TH"),
        icon: Star,
        color: "text-amber-500",
        bg: "bg-amber-50/70 border border-amber-200/50",
        glow: "hover:shadow-lg hover:shadow-amber-500/5 hover:border-amber-200"
      },
      {
        title: "อันดับ",
        subtitle: "จากนักเรียนทั้งหมด",
        value: String(Math.max(1, 520 - Math.floor(points * 1.5))),
        icon: Award,
        color: "text-purple-500",
        bg: "bg-purple-50/70 border border-purple-100/50",
        glow: "hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-200"
      }
    ];
  }, [completedCount, points]);

  const studentActivities = useMemo(() => {
    const list = recentRuns.map((run) => ({
      id: run.id,
      title: `ทำห้องแล็บ ${run.title} สำเร็จ`,
      subtitle: run.score === null ? "บันทึกผลการทดลองเรียบร้อยแล้ว" : `บันทึกผลการทดลองแล้ว ได้ ${run.score}/100`,
      points: run.pointsAwarded > 0 ? `+${run.pointsAwarded}` : "+0",
      time: run.createdAt.includes("T") ? new Date(run.createdAt).toLocaleString("th-TH") : run.createdAt,
      icon: FlaskConical,
      iconColor: "text-blue-500 bg-blue-50/80 border border-blue-100/50"
    }));

    return list;
  }, [recentRuns]);

  const activeMissions = [
    {
      id: 1,
      title: "นักทดลองเริ่มต้น",
      progress: 3,
      total: 5,
      color: "bg-emerald-500",
      icon: FlaskConical,
      iconColor: "text-emerald-500 bg-emerald-50 border border-emerald-100/30"
    },
    {
      id: 2,
      title: "นักวิทย์ตัวน้อย",
      progress: 2,
      total: 5,
      color: "bg-blue-500",
      icon: Star,
      iconColor: "text-blue-500 bg-blue-50 border border-blue-100/30"
    },
    {
      id: 3,
      title: "ทำการติดต่อเนื่อง 7 วัน",
      progress: 4,
      total: 7,
      color: "bg-purple-500",
      icon: Flame,
      iconColor: "text-purple-500 bg-purple-50 border border-purple-100/30"
    },
    {
      id: 4,
      title: "ผู้เชี่ยวชาญ",
      progress: 0,
      total: 1,
      color: "bg-slate-300",
      isLocked: true,
      icon: Lock,
      iconColor: "text-slate-400 bg-slate-100 border border-slate-200/30"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-16 overflow-hidden">
      {/* Absolute Decorative Floating Elements */}
      <DecorativeBackground />

      {/* 1. Header/Navbar */}
      <Navbar />

      {/* 2. Persistent desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeMenu="โปรไฟล์" />
      </div>

      <div className={`relative z-10 min-w-0 transition-[padding-left] duration-300 ${isCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"}`}>
        {/* 3. Breadcrumb Navigation */}
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 pt-6 pb-2 select-none">
          {role === "teacher" ? (
            <Breadcrumb category="Dashboard" title="คุณครู" />
          ) : (
            <Breadcrumb category="Dashboard" title="โปรไฟล์ผู้ใช้ / Profile" />
          )}
        </div>

        {/* 4. Main Content Area */}
        <main className="w-full px-4 py-2 lg:px-8">
          {checkingAuth ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] select-none">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
              <p className="text-xs font-bold text-slate-500 mt-4 leading-normal">กำลังตรวจสอบสิทธิ์...</p>
            </div>
          ) : !isLoggedIn ? (
            <div className="max-w-md mx-auto my-12 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[32px] p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 select-none">
              <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-6 shadow-sm animate-[pulse_2s_infinite]">
                <Lock className="w-10 h-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-normal mb-3" style={{ lineHeight: '1.4' }}>
                โปรดเข้าสู่ระบบเพื่อเข้าใช้งานหน้าโปรไฟล์
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-400 leading-relaxed mb-8">
                บันทึกประวัติการทดลองจำลองแล็บ สะสมคะแนน XP และระดับเหรียญตราเกียรติยศ รวมถึงพูดคุยวิเคราะห์บทเรียนร่วมกับ SciSiam AI Tutor ได้เมื่อสร้างบัญชีผู้ใช้
              </p>
              <button
                onClick={() => window.location.href = "/login"}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>เข้าสู่ระบบตอนนี้</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : role === "teacher" ? (
            // ==========================================
            // TEACHER DASHBOARD (Teacher Control Panel)
            // ==========================================
            <div className="min-w-0 space-y-8">
              
              {/* HERO HEADER CARD (Teacher Badge) */}
              <section className="bg-white border border-slate-200/60 rounded-2xl p-6 sm:p-8 flex flex-col xl:flex-row justify-between items-center gap-6 relative shadow-sm transition-shadow duration-200 overflow-hidden">
                {/* Online Status */}
                <div className="absolute top-4 sm:top-6 right-4 sm:right-8 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100/60 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold text-emerald-600 select-none">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>โหมดอาจารย์</span>
                </div>

                {/* Profile Block */}
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
                  {/* Avatar with camera */}
                  <div className="relative group/avatar cursor-pointer shrink-0">
                    <div 
                      className="w-24 h-24 rounded-full bg-blue-100 border-4 border-white shadow-md flex items-center justify-center relative overflow-hidden select-none"
                      aria-label="รูปโปรไฟล์คุณครู"
                    >
                      <Image src="/student_avatar_3d.png" alt="Teacher Avatar" fill sizes="96px" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-y-[-100%] group-hover/avatar:translate-y-[100%] transition-transform duration-1000 ease-in-out" />
                    </div>
                    <button 
                      onClick={() => alert("ระบบเปลี่ยนภาพโปรไฟล์จะสามารถตั้งค่ารูปคุณครูแบบ 3D เร็วๆ นี้! 📸")}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-700 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      aria-label="เปลี่ยนรูปโปรไฟล์"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Name and Level details */}
                  <div className="flex flex-col text-center sm:text-left min-w-0">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      {isEditingTeacherName ? (
                        <div className="flex items-center gap-2 w-full max-w-xs justify-center sm:justify-start">
                          <input
                            type="text"
                            value={tempTeacherName}
                            onChange={(e) => setTempTeacherName(e.target.value)}
                            className="px-3 py-1.5 text-base font-bold text-slate-700 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            maxLength={20}
                          />
                          <button
                            onClick={handleSaveTeacherName}
                            className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                          >
                            บันทึก
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center sm:justify-start gap-2 group/name">
                          <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-normal" style={{ lineHeight: '1.5' }}>
                            {teacherName}
                          </h1>
                          <button
                            onClick={() => {
                              setTempTeacherName(teacherName);
                              setIsEditingTeacherName(true);
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white/80 transition-all focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            aria-label="แก้ไขชื่อคุณครู"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-bold mt-1 select-none">
                      ไอดีผู้ใช้: <span className="text-slate-500">teacher_demo_scisiam</span>
                    </p>
                    <div className="mt-3 inline-flex max-w-full items-start gap-2 rounded-2xl border border-amber-200/70 bg-amber-50/80 px-3.5 py-2 text-left text-[11px] font-bold leading-relaxed text-amber-700 shadow-xs">
                      <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        โหมดสาธิตสำหรับแข่งขัน: ข้อมูลห้องเรียน การส่งงาน และงานรอตรวจเป็นตัวอย่าง UI ก่อนเชื่อมระบบห้องเรียนจริง
                      </span>
                    </div>

                    {/* Overall metrics pills block */}
                    <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-600 border border-blue-100/50 shadow-xs select-none">
                        🏫 6 ห้องเรียน
                      </span>
                      <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-xs select-none">
                        👨‍🎓 148 นักเรียนทั้งหมด
                      </span>
                      <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-600 border border-purple-100/50 shadow-xs select-none">
                        📚 18 บทเรียนทั้งหมด
                      </span>
                      <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-600 border border-amber-100/50 shadow-xs select-none">
                        📈 92% อัตราการส่งงาน
                      </span>
                    </div>
                  </div>
                </div>


              </section>

              {/* QUICK CONTROL ACTIONS */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" aria-label="แถบควบคุมด่วน / Quick Controls">
                {/* 1. สร้างห้องเรียน */}
                <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[160px] group">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform select-none">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xs font-bold text-slate-500 select-none">เพิ่มคลาสกลุ่มใหม่</h3>
                    <button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="w-full mt-2.5 py-2.5 bg-blue-50 hover:bg-blue-100/80 text-blue-600 font-extrabold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ สร้างห้องเรียน</span>
                    </button>
                  </div>
                </div>

                {/* 2. มอบหมายการทดลอง */}
                <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[160px] group">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform select-none">
                      <ClipboardCheck className="w-6 h-6" />
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xs font-bold text-slate-500 select-none">จ่ายภารกิจจำลองแล็บ</h3>
                    <button 
                      onClick={() => setIsAssignModalOpen(true)}
                      className="w-full mt-2.5 py-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-600 font-extrabold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <span>มอบหมายงาน v</span>
                    </button>
                  </div>
                </div>

                {/* 3. ตรวจรายงานผล */}
                <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[160px] group">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform select-none">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xs font-bold text-slate-500 select-none">งานรอนุมัติ/ประเมินผล</h3>
                    <button 
                      onClick={() => {
                        setActiveTeacherTab("reviews");
                        setTimeout(() => {
                          const el = document.getElementById("pending-review-section");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }, 50);
                      }}
                      className="w-full mt-2.5 py-2.5 bg-orange-50 hover:bg-orange-100/80 text-orange-600 font-extrabold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    >
                      <span>ตรวจสอบงาน &rarr;</span>
                    </button>
                  </div>
                </div>

                {/* 4. ดาวน์โหลดผลลัพธ์ */}
                <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[160px] group">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform select-none">
                      <Download className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xs font-bold text-slate-500 select-none mb-2">ดาวน์โหลดข้อมูลนักเรียน</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleDownload("PDF")}
                        className="py-2.5 bg-red-50 hover:bg-red-100/80 text-red-600 font-extrabold rounded-2xl text-xs transition-colors focus:ring-2 focus:ring-red-500 cursor-pointer text-center"
                      >
                        PDF
                      </button>
                      <button 
                        onClick={() => handleDownload("Excel")}
                        className="py-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-600 font-extrabold rounded-2xl text-xs transition-colors focus:ring-2 focus:ring-emerald-500 cursor-pointer text-center"
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* SUB-NAVIGATION TABS FOR MOBILE/TABLET */}
              <div className="xl:hidden flex flex-wrap items-center justify-between bg-white border border-slate-200/60 p-1.5 rounded-2xl gap-1 shadow-sm my-2">
                {[
                  { id: "classrooms", label: "ห้องเรียน", icon: Users },
                  { id: "submissions", label: "การส่งงาน", icon: ClipboardCheck },
                  { id: "stats", label: "ผลการเรียน", icon: GraduationCap },
                  { id: "reviews", label: "งานรอตรวจ", icon: FileText, badge: pendingReviews.length },
                ].map((tabItem) => {
                  const TabIcon = tabItem.icon;
                  const isActive = activeTeacherTab === tabItem.id;
                  return (
                    <button
                      key={tabItem.id}
                      onClick={() => setActiveTeacherTab(tabItem.id as typeof activeTeacherTab)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <div className="relative flex items-center">
                        <TabIcon className="w-4 h-4" />
                        {tabItem.badge && tabItem.badge > 0 ? (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white" />
                        ) : null}
                      </div>
                      <span className="whitespace-nowrap">{tabItem.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* THREE-COLUMN MAIN GRID */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                
                {/* COLUMN 1: จัดการห้องเรียน */}
                <section className={`${activeTeacherTab === "classrooms" ? "flex" : "hidden"} xl:flex bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex-col gap-5 w-full`}>
                  <div className="flex items-center gap-2 select-none border-b border-slate-50 pb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-800 leading-normal" style={{ lineHeight: '1.45' }}>จัดการห้องเรียน</h2>
                      <p className="text-[11px] font-bold text-slate-500">ภาพรวมกลุ่มเรียนที่ดูแล</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {classrooms.map((room) => (
                      <div 
                        key={room.id} 
                        className="p-4 bg-slate-50/40 border border-slate-100 rounded-2xl hover:bg-slate-50/80 hover:shadow-xs transition-all flex flex-col justify-between gap-3.5 group relative"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-base font-extrabold text-slate-800 leading-normal">{room.name}</h4>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 select-none font-bold">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {room.students} คน
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                {room.files} แฟ้มงาน
                              </span>
                            </div>
                          </div>
                          <span className="px-2.5 py-1.5 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100/50 rounded-full flex items-center gap-1 select-none">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            {room.status}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100/70 select-none">
                          <span className="text-[11px] font-bold text-slate-500">
                            เดดไลน์: <span className={room.deadline.includes("2") ? "text-red-500 font-extrabold" : "text-slate-500"}>{room.deadline}</span>
                          </span>
                          <button 
                            onClick={() => {
                              setAssignRoom(room.name);
                              setIsAssignModalOpen(true);
                            }}
                            className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                          >
                            สั่งงานเพิ่ม &rarr;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* COLUMN 2: ติดตามการส่งงาน */}
                <section className={`${activeTeacherTab === "submissions" ? "flex" : "hidden"} xl:flex bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex-col gap-5 w-full`}>
                  <div className="flex items-center gap-2 select-none border-b border-slate-50 pb-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-800 leading-normal" style={{ lineHeight: '1.45' }}>ติดตามการส่งงาน</h2>
                      <p className="text-[11px] font-bold text-slate-500">อัปเดตสถานะคลาสเรียนจำลอง</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {submissions.map((sub) => (
                      <div 
                        key={sub.id} 
                        className="flex items-center justify-between gap-3.5 p-3.5 bg-slate-50/20 border border-slate-100/50 rounded-2xl hover:bg-slate-50/80 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-black select-none ${
                            sub.status === "ส่งแล้ว" ? "bg-emerald-50 text-emerald-600 border border-emerald-100/40" :
                            sub.status === "กำลังทำ" ? "bg-blue-50 text-blue-600 border border-blue-100/40" :
                            "bg-red-50 text-red-600 border border-red-100/40"
                          }`}>
                            {sub.name.slice(4, 6)}
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-slate-700 leading-normal truncate group-hover:text-slate-950">
                              {sub.name} <span className="text-slate-500">({sub.room})</span>
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate leading-none">{sub.lab}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end gap-1.5 select-none">
                          {sub.status === "ส่งแล้ว" ? (
                            <>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100/50">ส่งแล้ว</span>
                              <span className="text-xs font-black text-emerald-600 mt-0.5 tracking-wide">{sub.score}</span>
                            </>
                          ) : sub.status === "กำลังทำ" ? (
                            <>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100/50">กำลังทำ</span>
                              <span className="text-[10px] font-medium text-slate-500 mt-0.5">{sub.time}</span>
                            </>
                          ) : (
                            <>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-600 border border-red-100/50">ค้างส่ง</span>
                              <span className="text-[10px] font-extrabold text-red-500 mt-0.5">{sub.deadline}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* COLUMN 3: ภาพรวมผลการเรียน */}
                <section className={`${activeTeacherTab === "stats" ? "flex" : "hidden"} xl:flex bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex-col gap-5 w-full`}>
                  <div className="flex items-center gap-2 select-none border-b border-slate-50 pb-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-800 leading-normal" style={{ lineHeight: '1.45' }}>ภาพรวมผลการเรียน</h2>
                      <p className="text-[11px] font-bold text-slate-500">สถิติความก้าวหน้าและระดับคะแนน</p>
                    </div>
                  </div>

                  {/* Average Grade Score Card */}
                  <div className="flex justify-between items-center p-4 bg-slate-50/80 border border-slate-200/50 rounded-2xl select-none">
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-500">คะแนนเฉลี่ยการทดลอง</span>
                      <span className="text-3xl font-black text-slate-800 mt-1">84.6</span>
                      <span className="text-[10px] font-bold text-emerald-600 mt-1 select-none">จากเกณฑ์เต็ม 100 คะแนน</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 border border-slate-200/50 shadow-xs">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Circular progress bar (76% success) */}
                  <div className="flex items-center justify-between p-4.5 bg-slate-50/60 border border-slate-100/50 rounded-2xl">
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-500">ส่งงานตรงตามกำหนด</span>
                      <span className="text-2xl font-black text-slate-800 mt-1 select-none">76%</span>
                      <span className="text-[11px] font-bold text-blue-600 mt-1.5 flex items-center gap-0.5 select-none">
                        <TrendingUp className="w-3.5 h-3.5" /> +2.4% สัปดาห์นี้
                      </span>
                    </div>
                    
                    <div className="relative w-18 h-18 shrink-0 select-none">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                        <circle 
                          cx="18" 
                          cy="18" 
                          r="15.9155" 
                          fill="none" 
                          stroke="url(#progressRingGrad)" 
                          strokeWidth="3.5" 
                          strokeDasharray="100" 
                          strokeDashoffset={100 - 76} 
                          strokeLinecap="round" 
                          className="transition-all duration-1000 ease-out" 
                        />
                      </svg>
                      {/* Ring Gradient definitions */}
                      <svg className="absolute w-0 h-0">
                        <defs>
                          <linearGradient id="progressRingGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#2563eb" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700">76%</div>
                    </div>
                  </div>

                  {/* Horizontal/Vertical Bar Chart comparison */}
                  <div className="p-4 bg-slate-50/60 border border-slate-100/50 rounded-2xl">
                    <div className="flex justify-between items-center mb-3 select-none">
                      <span className="text-xs font-extrabold text-slate-700">คะแนนเฉลี่ยเปรียบเทียบรายห้อง</span>
                      <span className="text-[10px] font-bold text-slate-500">เต็ม 100</span>
                    </div>
                    
                    <div className="h-32 flex items-end justify-between gap-4 pt-4 px-2">
                      {[
                        { name: "ม.4/1", score: 85.5, color: "from-blue-400 to-blue-500 shadow-blue-500/10" },
                        { name: "ม.4/2", score: 78.2, color: "from-teal-400 to-teal-500 shadow-teal-500/10" },
                        { name: "ม.5/1", score: 89.1, color: "from-sky-400 to-sky-500 shadow-sky-500/10" },
                        { name: "ม.5/2", score: 84.6, color: "from-emerald-400 to-emerald-500 shadow-emerald-500/10" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                          {/* Tooltip */}
                          <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity -translate-y-8 bg-slate-800 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-md pointer-events-none z-10 select-none">
                            {item.score}
                          </div>
                          {/* Bar */}
                          <div className="w-full bg-slate-200/50 rounded-t-lg h-full flex items-end relative overflow-hidden">
                            <div 
                              className={`w-full bg-gradient-to-t ${item.color} rounded-t-lg transition-all duration-1000 ease-out`}
                              style={{ height: `${item.score}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-500 mt-2 select-none">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

              </div>

              {/* THREE-COLUMN BOTTOM GRID */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                
                {/* COLUMN 1: รายงานการทดลองรอการตรวจ (Pending Reviews List) */}
                <section id="pending-review-section" className={`${activeTeacherTab === "reviews" ? "flex" : "hidden"} xl:flex bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex-col gap-5 w-full`}>
                  <div className="flex items-center gap-2 select-none border-b border-slate-50 pb-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-800 leading-normal" style={{ lineHeight: '1.45' }}>รายงานรอการตรวจ</h2>
                      <p className="text-[11px] font-bold text-slate-500">ตารางรายงานแล็บจำลองของนักเรียน</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {pendingReviews.length === 0 ? (
                      <div className="text-center py-8 text-xs font-bold text-slate-500 select-none">
                        ตรวจรายงานครบหมดแล้ว! 🎉
                      </div>
                    ) : (
                      pendingReviews.map((review) => (
                        <div 
                          key={review.id} 
                          className="p-4 bg-slate-50/40 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all flex flex-col gap-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-black text-slate-800 leading-normal">{review.name}</h4>
                              <p className="text-[10px] font-extrabold text-slate-500 mt-0.5">{review.room} &bull; {review.time}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-orange-50 text-orange-600 border border-orange-100/50 select-none">รอตรวจ</span>
                          </div>
                          
                          <p className="text-[11px] font-bold text-slate-500 leading-relaxed truncate select-none">
                            แล็บ: {review.lab}
                          </p>

                          <div className="flex gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => setViewingReport(review)}
                              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-xl text-[10px] transition-colors cursor-pointer select-none"
                            >
                              ดูรายงาน
                            </button>
                            <button
                              onClick={() => {
                                setGradeScore("9");
                                setGradeFeedback("บันทึกข้อมูลได้ดี มีความเข้าใจในการทดลอง");
                                setActiveReview(review);
                              }}
                              className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl text-[10px] transition-colors cursor-pointer shadow-md shadow-orange-600/10 select-none"
                            >
                              ตรวจ
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* COLUMN 2: ดาวน์โหลดรายงาน (Quick Export Cards) */}
                <section className={`${activeTeacherTab === "stats" ? "flex" : "hidden"} xl:flex bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex-col gap-5 w-full`}>
                  <div className="flex items-center gap-2 select-none border-b border-slate-50 pb-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-800 leading-normal" style={{ lineHeight: '1.45' }}>ดาวน์โหลดรายงาน</h2>
                      <p className="text-[11px] font-bold text-slate-500">ส่งออกข้อมูลรวมรายสัปดาห์</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* PDF Export Banner Card */}
                    <button
                      onClick={() => handleDownload("PDF")}
                      className="p-5.5 rounded-2xl bg-gradient-to-br from-red-50/80 to-red-100/30 border border-red-100/50 text-left hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-center select-none">
                        <span className="text-[11px] font-black text-red-600 uppercase tracking-wider bg-red-100/60 px-2.5 py-1 rounded-lg">Export PDF</span>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm group-hover:scale-115 transition-transform">
                          <FileText className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <h4 className="text-xs font-black text-slate-800 mt-4 leading-normal">รายงานผลการเรียนรายสัปดาห์</h4>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 leading-normal">ประกอบด้วยแผนภูมิวิเคราะห์ห้องเรียน ความก้าวหน้าและระดับคะแนนผลการทดลองเฉลี่ย</p>
                    </button>

                    {/* Excel Export Banner Card */}
                    <button
                      onClick={() => handleDownload("Excel")}
                      className="p-5.5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 border border-emerald-100/50 text-left hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-center select-none">
                        <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-100/60 px-2.5 py-1 rounded-lg">Export Excel</span>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-115 transition-transform">
                          <ClipboardCheck className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <h4 className="text-xs font-black text-slate-800 mt-4 leading-normal">สรุปคะแนนประเมินรายงานแล็บ</h4>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 leading-normal">ส่งออกคะแนนดิบ รายงานฟิสิกส์ สถิติบทเรียน เปรียบเทียบผลการประเมินแยกรายบุคคล</p>
                    </button>
                  </div>
                </section>

                {/* COLUMN 3: กิจกรรมล่าสุด (Teacher Timeline Event Log) */}
                <section className={`${activeTeacherTab === "reviews" ? "flex" : "hidden"} xl:flex bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex-col gap-5 w-full`}>
                  <div className="flex items-center gap-2 select-none border-b border-slate-50 pb-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-800 leading-normal" style={{ lineHeight: '1.45' }}>กิจกรรมล่าสุด</h2>
                      <p className="text-[11px] font-bold text-slate-500">ประวัติปฏิบัติงานของคุณครู</p>
                    </div>
                  </div>

                  <div className="relative pl-6 space-y-5 border-l-2 border-slate-100 ml-3 py-1">
                    {teacherActivities.map((act) => (
                      <div key={act.id} className="relative group">
                        {/* Timeline Bullet Indicator */}
                        <span className={`absolute left-[-31px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-xs ${
                          act.type === "assign" ? "bg-emerald-500" :
                          act.type === "grade" ? "bg-orange-500" :
                          act.type === "classroom" ? "bg-blue-500" :
                          act.type === "download" ? "bg-indigo-500" :
                          "bg-purple-500"
                        }`} />
                        
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-extrabold text-slate-500 select-none leading-none">{act.time}</span>
                          <span className="text-xs font-bold text-slate-700 mt-1 group-hover:text-slate-900 transition-colors leading-relaxed">
                            {act.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </div>

            </div>
          ) : (
            // ==========================================
            // STUDENT PROFILE CONTENT (Existing)
            // ==========================================
            <div className="min-w-0 space-y-8">
              
              {/* PROFILE HEADER CARD */}
              <section className="bg-gradient-to-br from-[#f0f7ff]/95 via-[#f8fbff]/90 to-[#e0f2fe]/40 backdrop-blur-xl border border-blue-100/40 rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                
                {/* Online Status Badge */}
                <div className="absolute top-4 sm:top-6 right-4 sm:right-8 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100/60 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold text-emerald-600 select-none">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ออนไลน์</span>
                </div>

                {/* Profile Info block */}
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                  
                  {/* Avatar section */}
                  <div className="relative group/avatar cursor-pointer shrink-0">
                    <div 
                      className="w-24 h-24 rounded-full bg-blue-50/50 border-4 border-white shadow-md flex items-center justify-center relative overflow-hidden select-none"
                      aria-label="รูปโปรไฟล์นักเรียน"
                    >
                      <Image src="/student_avatar_3d.png" alt="Mascot Avatar" fill sizes="96px" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-y-[-100%] group-hover/avatar:translate-y-[100%] transition-transform duration-1000 ease-in-out" />
                    </div>
                    <button 
                      onClick={() => alert("ระบบเปลี่ยนภาพโปรไฟล์จะสามารถตั้งค่ารูปนักเรียนแบบ 3D เร็วๆ นี้! 📸")}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-700 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      aria-label="เปลี่ยนรูปโปรไฟล์"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Name and Level Details */}
                  <div className="flex flex-col text-center sm:text-left min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      {isEditingName ? (
                        <div className="flex items-center gap-2 w-full max-w-xs justify-center sm:justify-start">
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="px-3 py-1.5 text-base font-bold text-slate-700 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            maxLength={20}
                            aria-label="พิมพ์ชื่อโปรไฟล์ใหม่"
                          />
                          <button
                            onClick={handleSaveName}
                            className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                          >
                            บันทึก
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center sm:justify-start gap-2 group/name">
                          <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-normal" style={{ lineHeight: '1.5' }}>
                            {username}
                          </h1>
                          <button
                            onClick={() => {
                              setTempName(username);
                              setIsEditingName(true);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white/80 transition-all focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            aria-label="แก้ไขชื่อเล่นของคุณ"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 font-bold mt-1 select-none">
                      ไอดีผู้ใช้: <span className="text-slate-500">student001</span>
                    </p>

                    {/* Level and XP Bar */}
                    <div className="mt-3.5 w-full sm:w-64">
                      <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold mb-1.5 select-none">
                        <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100/50">
                          เลเวล {Math.floor(points / 200) + 1}
                        </span>
                        <span className="text-slate-400">
                          {points % 200} / 200 XP
                        </span>
                      </div>
                      <div className="w-full bg-slate-100/80 h-3 rounded-full overflow-hidden relative border border-slate-200/20">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 relative"
                          style={{ width: `${((points % 200) / 200) * 100}%` }}
                          role="progressbar"
                          aria-valuenow={((points % 200) / 200) * 100}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="แถบระดับพลังงานการเรียนรู้"
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] -translate-x-full animate-[pulse_2s_infinite]" />
                        </div>
                      </div>
                    </div>

                    {/* Status Quote */}
                    <div className="mt-4 flex justify-center sm:justify-start">
                      <div className="bg-white/80 border border-blue-100/30 rounded-xl px-4 py-1.5 inline-flex items-center text-xs font-bold text-slate-600 italic select-none leading-normal">
                        &quot;เรียนรู้ทุกวัน เก่งขึ้นทุกวัน! 🚀&quot;
                      </div>
                    </div>

                  </div>

                </div>

                {/* Igloo Winter Landscape Decoration */}
                <div className="hidden md:block select-none pointer-events-none pr-4">
                  <svg className="w-56 h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-10,120 L25,75 L65,120 Z" fill="#cbd5e1" opacity="0.25" />
                    <path d="M30,120 L90,55 L150,120 Z" fill="#94a3b8" opacity="0.15" />
                    <path d="M100,120 L155,60 L210,120 Z" fill="#cbd5e1" opacity="0.3" />
                    <path d="M85,110 C85,72 155,72 155,110 Z" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="2" />
                    <path d="M95,95 C115,92 125,92 145,95" stroke="#bae6fd" strokeWidth="1" />
                    <path d="M88,103 C115,100 125,100 152,103" stroke="#bae6fd" strokeWidth="1" />
                    <line x1="120" y1="78" x2="120" y2="110" stroke="#bae6fd" strokeWidth="1" />
                    <line x1="102" y1="85" x2="98" y2="110" stroke="#bae6fd" strokeWidth="1" />
                    <line x1="138" y1="85" x2="142" y2="110" stroke="#bae6fd" strokeWidth="1" />
                    <path d="M102,110 C102,93 126,93 126,110 Z" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="1.5" />
                    <path d="M108,110 C108,98 120,98 120,110 Z" fill="#0284c7" />
                    <line x1="120" y1="78" x2="120" y2="52" stroke="#64748b" strokeWidth="1.5" />
                    <path d="M120,52 L140,57 L120,62 Z" fill="#0284c7" />
                    <path d="M-10,110 Q50,105 110,110 T230,110" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>

              </section>

              {/* STATS GRID SECTION */}
              <section aria-label="ข้อมูลตัวชี้วัดความคืบหน้า">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {studentStats.map((stat, idx) => {
                    const IconComponent = stat.icon;
                    return (
                      <div 
                        key={idx}
                        className={`bg-white border border-slate-100 rounded-3xl p-5.5 flex items-center gap-4.5 shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${stat.glow}`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                          <IconComponent className="w-7 h-7" />
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-xs font-bold text-slate-400 leading-normal">{stat.title}</span>
                          <span className="text-2xl sm:text-3xl font-black text-slate-800 leading-none mt-1">
                            {stat.value}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 leading-none mt-1.5">{stat.subtitle}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* STUDENT SUB-NAVIGATION TABS */}
              <div className="flex bg-white border border-slate-200/60 p-1.5 rounded-2xl gap-2 shadow-sm my-1 max-w-[420px] select-none">
                <button
                  onClick={() => setActiveStudentTab("overview")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeStudentTab === "overview"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>ภาพรวมความก้าวหน้า</span>
                </button>
                <button
                  onClick={() => setActiveStudentTab("rewards")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeStudentTab === "rewards"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>คะแนนและเกียรติยศ</span>
                </button>
              </div>

              {activeStudentTab === "overview" ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT COLUMN: RECENT ACTIVITIES */}
                  <section className="lg:col-span-7 bg-white/95 border border-slate-200/50 rounded-[32px] p-6 shadow-md shadow-slate-100/50" aria-label="ประวัติกิจกรรมล่าสุด">
                    <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3 select-none">
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 leading-normal">
                        <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
                        กิจกรรมล่าสุด
                      </h3>
                      <button 
                        onClick={() => alert("ระบบบันทึกประวัติการทำแล็บทั้งหมดกำลังเตรียมการเชื่อมต่อ Supabase! 📝")}
                        className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-0.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded px-1.5 py-0.5 cursor-pointer"
                      >
                        <span>ดูทั้งหมด</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {studentActivities.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-8 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-500">
                            <Activity className="h-5 w-5" />
                          </div>
                          <h4 className="mt-3 text-sm font-black text-slate-700">ยังไม่มีกิจกรรมล่าสุด</h4>
                          <p className="mx-auto mt-1 max-w-sm text-xs font-bold leading-relaxed text-slate-500">
                            เมื่อเริ่มทดลองและบันทึกผล ระบบจะแสดงประวัติกิจกรรมจริงของคุณที่นี่
                          </p>
                        </div>
                      ) : (
                        studentActivities.map((act) => {
                        const Icon = act.icon;
                        return (
                          <div 
                            key={act.id} 
                            className="flex items-center justify-between gap-3.5 p-3.5 bg-slate-50/30 border border-slate-100/50 rounded-2xl hover:bg-slate-50/80 transition-all duration-200 group/item cursor-pointer"
                          >
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-xs ${act.iconColor}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col text-left min-w-0">
                                <span className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed truncate group-hover/item:text-slate-950">
                                  {act.title}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400 mt-0.5 leading-normal select-none">
                                  {act.subtitle}
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                              <span className="text-[11px] font-semibold text-slate-400 select-none">
                                {act.time}
                              </span>
                              <span className="text-sm font-black text-blue-600 tracking-wide select-none">
                                {act.points}
                              </span>
                            </div>
                          </div>
                        );
                        })
                      )}
                    </div>
                  </section>

                  {/* RIGHT COLUMN: ACTIVE MISSIONS & SAVED EXPERIMENT */}
                  <div className="lg:col-span-5 flex flex-col gap-8">
                    <section className="bg-white/95 border border-slate-200/50 rounded-[32px] p-6 shadow-md shadow-slate-100/50" aria-label="ภารกิจของนักวิทยาศาสตร์">
                      <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3 select-none">
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 leading-normal">
                          <Award className="w-5 h-5 text-indigo-500 animate-pulse" />
                          ภารกิจที่กำลังดำเนินการ
                        </h3>
                        <button 
                          onClick={() => alert("ระบบดูภารกิจสะสมแต้มทั้งหมดเร็วๆ นี้! 🌟")}
                          className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-0.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded px-1.5 py-0.5 cursor-pointer"
                        >
                          <span>ดูทั้งหมด</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {activeMissions.map((mis) => {
                          const Icon = mis.icon;
                          const percent = (mis.progress / mis.total) * 100;
                          return (
                            <div 
                              key={mis.id}
                              className={`p-3.5 border rounded-3xl flex items-center gap-3.5 transition-all duration-200 ${
                                mis.isLocked 
                                  ? "bg-slate-50/40 border-slate-100/60 opacity-75 cursor-not-allowed" 
                                  : "bg-white border-slate-100/80 hover:border-slate-200/60 hover:shadow-xs cursor-pointer group/mission"
                              }`}
                            >
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${mis.iconColor} shadow-xs`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              
                              <div className="flex-1 min-w-0 flex flex-col text-left">
                                <span className="text-xs sm:text-sm font-bold text-slate-700 leading-normal group-hover/mission:text-slate-900">
                                  {mis.title}
                                </span>
                                
                                <div className="flex items-center gap-3 mt-1.5 w-full">
                                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden relative">
                                    <div 
                                      className={`h-full ${mis.color} rounded-full transition-all duration-500`}
                                      style={{ width: `${percent}%` }}
                                      role="progressbar"
                                      aria-valuenow={percent}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                      aria-label={`ความคืบหน้าภารกิจ ${mis.title}`}
                                    />
                                  </div>
                                  <span className="text-[11px] font-extrabold text-slate-500 shrink-0 w-8 text-right select-none">
                                    {mis.progress} / {mis.total}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {savedExperiment && (
                      <section className="bg-white/95 border border-slate-200/50 rounded-[32px] p-6 shadow-md shadow-slate-100/50" aria-label="ผลการทดลองที่บันทึกล่าสุด">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3 select-none">
                          <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 leading-normal">
                            <FlaskConical className="w-5 h-5 text-indigo-500" />
                            ผลแล็บนิวตันที่บันทึกล่าสุด
                          </h3>
                        </div>
                        <div className="space-y-3.5 text-left">
                          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                            <div>
                              <span className="font-extrabold text-slate-400 select-none">อุณหภูมิเริ่มต้น:</span>
                              <p className="font-bold text-slate-700 mt-0.5">{savedExperiment.initialTemp}°C</p>
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-400 select-none">อุณหภูมิแวดล้อม:</span>
                              <p className="font-bold text-slate-700 mt-0.5">{savedExperiment.ambientTemp}°C</p>
                            </div>
                            <div className="col-span-2">
                              <span className="font-extrabold text-slate-400 select-none">ค่าคงตัวการเย็นตัว (k):</span>
                              <p className="font-bold text-slate-700 mt-0.5">{savedExperiment.coolingConstant} / วินาที</p>
                            </div>
                          </div>
                          {savedExperiment.timestamp && (
                            <p className="text-[10px] text-slate-400 font-bold text-right select-none">
                              บันทึกเมื่อ: {savedExperiment.timestamp}
                            </p>
                          )}
                        </div>
                      </section>
                    )}
                  </div>

                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Summary Gauge & XP info */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* XP Progress Card */}
                    <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-[32px] p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-indigo-500" />
                          ระดับพลังงานและความก้าวหน้าเลเวล
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-1">XP Progression & Level Breakdown</p>
                      </div>
                      
                      <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">เลเวลปัจจุบัน</span>
                          <h4 className="text-3xl font-black text-indigo-600 mt-1 select-none">Lv. {Math.floor(points / 200) + 1}</h4>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">คะแนนสะสม</span>
                          <h4 className="text-3xl font-black text-emerald-600 mt-1 select-none">{points}</h4>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">แล็บทำเสร็จ</span>
                          <h4 className="text-3xl font-black text-blue-600 mt-1 select-none">{completedCount} / 36</h4>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-black text-slate-600">
                          <span>ระดับ XP ปัจจุบัน ({points % 200} / 200 XP)</span>
                          <span>ขาดอีก {200 - (points % 200)} XP เพื่ออัปเลเวลถัดไป</span>
                        </div>
                        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative border border-slate-200/20">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-500 relative"
                            style={{ width: `${((points % 200) / 200) * 100}%` }}
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-full animate-[pulse_2.5s_infinite]" />
                          </div>
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 italic mt-1 leading-normal">
                          * คุณจะได้รับคะแนนสะสม +25 คะแนน ทุกครั้งที่ทำจำลองการทดลอง (Simulation) สำเร็จและบันทึกผลการเรียนรู้ลงฐานข้อมูล
                        </p>
                      </div>
                    </div>

                    {/* Fun Stats card */}
                    <div className="lg:col-span-4 bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border border-blue-100/50 rounded-[32px] p-6 shadow-sm flex flex-col justify-between text-left">
                      <div>
                        <h4 className="text-sm font-black text-indigo-700 bg-indigo-100/60 px-2.5 py-1 rounded-lg inline-block">สถานะเกียรติยศ</h4>
                        <h3 className="text-lg font-black text-slate-800 mt-3 leading-snug">
                          {points >= 300 ? "นักวิจัยระดับเหรียญทอง 🥇" : points >= 150 ? "นักทดลองรุ่นใหม่ไฟแรง 🥈" : "ผู้ศึกษาเริ่มต้น 🥉"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          คุณเก็บสะสมเหรียญตราเกียรติยศสำหรับนักเรียนได้แล้ว <b className="text-indigo-600 font-extrabold">{
                            [
                              completedCount >= 1,
                              typeof window !== 'undefined' && localStorage.getItem("scisiam_saved_ohms_experiment"),
                              typeof window !== 'undefined' && localStorage.getItem("scisiam_saved_cooling_experiment"),
                              typeof window !== 'undefined' && localStorage.getItem("scisiam_saved_le_chateliers_experiment"),
                              typeof window !== 'undefined' && localStorage.getItem("scisiam_saved_hesss_experiment"),
                              points >= 300,
                              completedCount >= 5
                            ].filter(Boolean).length
                          } ใบ</b> จากทั้งหมด 7 ใบ
                        </p>
                      </div>
                      <div className="border-t border-indigo-100/60 pt-4 mt-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-indigo-200 text-indigo-500 shadow-sm shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-[11px] font-bold text-slate-500">อันดับเซิร์ฟเวอร์จำลอง</p>
                          <p className="text-sm font-black text-slate-700">Top {((Math.max(1, 520 - Math.floor(points * 1.5)) / 1500) * 100).toFixed(1)}% ของระบบ</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges Grid Showcase */}
                  <div className="bg-white border border-slate-200/60 rounded-[32px] p-6 shadow-sm">
                    <div className="border-b border-slate-100 pb-3 mb-6 select-none">
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-500" />
                        ตู้โชว์เหรียญตราเกียรติยศ (Trophy Cabinets)
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5">รางวัลความก้าวหน้าและการจำลองแล็บเสมือนจริง</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[
                        {
                          id: "beg-sci",
                          title: "นักทดลองฝึกหัด",
                          desc: "ทำเสร็จอย่างน้อย 1 การทดลอง",
                          icon: FlaskConical,
                          color: "text-blue-500",
                          bg: "bg-blue-50/80 border border-blue-100",
                          unlocked: completedCount >= 1,
                        },
                        {
                          id: "ohms-master",
                          title: "นักวิทย์พลังแกร่ง",
                          desc: "ทำแล็บวงจรกระแสตรง Ohm's Law สำเร็จ",
                          icon: Zap,
                          color: "text-amber-500",
                          bg: "bg-amber-50/80 border border-amber-100",
                          unlocked: typeof window !== 'undefined' && !!localStorage.getItem("scisiam_saved_ohms_experiment"),
                        },
                        {
                          id: "cooling-exp",
                          title: "ผู้เชี่ยวชาญการเย็นตัว",
                          desc: "ทำแล็บกฎการเย็นตัวนิวตันสำเร็จ",
                          icon: Flame,
                          color: "text-cyan-500",
                          bg: "bg-cyan-50/80 border border-cyan-100",
                          unlocked: typeof window !== 'undefined' && !!localStorage.getItem("scisiam_saved_cooling_experiment"),
                        },
                        {
                          id: "eq-sage",
                          title: "ผู้ควบคุมสมดุลเคมี",
                          desc: "ทำแล็บรบกวนสมดุลเคมีสำเร็จ",
                          icon: Star,
                          color: "text-rose-500",
                          bg: "bg-rose-50/80 border border-rose-100",
                          unlocked: typeof window !== 'undefined' && !!localStorage.getItem("scisiam_saved_le_chateliers_experiment"),
                        },
                        {
                          id: "hesss-hero",
                          title: "สุดยอดนักคำนวณความร้อน",
                          desc: "ทำแล็บ Hess's Law & Calorimetry สำเร็จ",
                          icon: Activity,
                          color: "text-orange-500",
                          bg: "bg-orange-50/80 border border-orange-100",
                          unlocked: typeof window !== 'undefined' && !!localStorage.getItem("scisiam_saved_hesss_experiment"),
                        },
                        {
                          id: "pts-coll",
                          title: "นักสะสมแต้มไร้เทียมทาน",
                          desc: "มีคะแนนสะสมรวมอย่างน้อย 300 คะแนน",
                          icon: Award,
                          color: "text-violet-500",
                          bg: "bg-violet-50/80 border border-violet-100",
                          unlocked: points >= 300,
                        },
                        {
                          id: "vlab-master",
                          title: "ปรมาจารย์จำลองคลาส",
                          desc: "ทำสำเร็จอย่างน้อย 5 การทดลอง",
                          icon: GraduationCap,
                          color: "text-purple-500",
                          bg: "bg-purple-50/80 border border-purple-100",
                          unlocked: completedCount >= 5,
                        },
                      ].map((badge) => {
                        const BadgeIcon = badge.icon;
                        return (
                          <div
                            key={badge.id}
                            className={`p-5 rounded-3xl border flex flex-col items-center text-center transition-all duration-300 relative select-none overflow-hidden ${
                              badge.unlocked
                                ? "bg-white border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-slate-300"
                                : "bg-slate-50/50 border-slate-100 opacity-60"
                            }`}
                          >
                            {/* Visual glowing ring for unlocked */}
                            {badge.unlocked && (
                              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.02),transparent_70%)] pointer-events-none" />
                            )}
                            
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 mb-4 shadow-sm relative ${
                              badge.unlocked ? `${badge.bg} ${badge.color}` : "bg-slate-200 border border-slate-300 text-slate-400"
                            }`}>
                              <BadgeIcon className="w-8 h-8" />
                              
                              {/* Lock indicator */}
                              {!badge.unlocked && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-400 text-white border border-white flex items-center justify-center">
                                  <Lock className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </div>

                            <h4 className={`text-sm font-extrabold ${badge.unlocked ? "text-slate-800" : "text-slate-500"}`}>{badge.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 leading-normal">{badge.desc}</p>

                            <div className="mt-4.5">
                              {badge.unlocked ? (
                                <span className="px-2.5 py-1 text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-full">ปลดล็อกแล้ว ✓</span>
                              ) : (
                                <span className="px-2.5 py-1 text-[9px] font-extrabold bg-slate-100 text-slate-400 border border-slate-200/50 rounded-full">ยังไม่ปลดล็อก</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* BOTTOM PROFILE CUSTOM CALLOUT BANNER */}
              <section className="w-full max-w-4xl mx-auto px-2 py-6 select-none relative z-10 animate-in fade-in duration-700" aria-label="ความพร้อมในการเรียนรู้">
                <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 p-[1.2px] shadow-lg shadow-indigo-500/10 group hover:shadow-xl hover:shadow-indigo-500/15 transition-all duration-300">
                  <div className="bg-white/95 rounded-[23px] px-6 py-4.5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left relative overflow-hidden min-h-[96px]">
                    <div className="absolute -left-2 -bottom-5 w-24 h-24 select-none pointer-events-none z-10 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/penguin_expressions.png"
                        alt="Penguin mascot"
                        className="absolute left-0 top-[-5%] h-auto w-[300%] max-w-none object-contain"
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 pl-20">
                      <div className="flex flex-col text-left">
                        <h4 className="text-sm font-bold text-slate-800 leading-normal">
                          เก่งขึ้นทุกวัน เก็บเกี่ยวความรู้ไปด้วยกัน!
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          อย่าหยุดเรียนรู้ เพราะทุกก้าวของคุณสำคัญเสมอ ✨
                        </p>
                      </div>
                    </div>
                    
                    <svg className="absolute right-6 bottom-2 w-32 h-16 pointer-events-none opacity-80" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 50 Q 50 30 70 35 T 100 15" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" />
                      <g transform="translate(95, 5) rotate(-15)">
                        <path d="M0 10 L15 0 L8 15 L5 11 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" strokeLinejoin="round" />
                        <path d="M5 11 L15 0 L8 8 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" strokeLinejoin="round" />
                      </g>
                    </svg>
                    
                    <button
                      onClick={() => window.location.href = "/"}
                      className="flex items-center gap-1.5 text-xs font-black text-indigo-500 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer shrink-0 z-20"
                      aria-label="ไปที่หน้าหลักเพื่อทดลองแล็บ"
                    >
                      <span>ไปหน้าแล็บทดลอง</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>

            </div>
          )}
        </main>
      </div>

      {/* ==========================================
          INTERACTIVE CONTROL MODALS
         ========================================== */}
      
      {/* 1. CREATE CLASS MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              สร้างห้องเรียนใหม่
            </h3>
            <form onSubmit={handleCreateClassroom} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 select-none">ชื่อห้องเรียน (เช่น ม.4/3)</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="ม.4/3"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 select-none">จำนวนนักเรียนในห้อง</label>
                <input
                  type="number"
                  required
                  value={newClassStudents}
                  onChange={(e) => setNewClassStudents(e.target.value)}
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs transition-colors cursor-pointer shadow-md shadow-blue-600/20"
                >
                  สร้างห้องเรียน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ASSIGN LAB WORK MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-500" />
              มอบหมายการทดลอง
            </h3>
            <form onSubmit={handleAssignExperiment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 select-none">เลือกชุดจำลองการทดลอง</label>
                <select
                  value={assignLab}
                  onChange={(e) => setAssignLab(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-bold text-slate-700 cursor-pointer"
                >
                  <option value="Hooke's Law of Elasticity">{"Hooke's Law of Elasticity (กฎของฮุก)"}</option>
                  <option value="Ohm's Law & DC Circuits">{"Ohm's Law & DC Circuits (วงจรไฟฟ้ากระแสตรง)"}</option>
                  <option value="Newton's Law of Cooling">{"Newton's Law of Cooling (กฎการเย็นตัวของนิวตัน)"}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 select-none">เลือกห้องเรียนเป้าหมาย</label>
                <select
                  value={assignRoom}
                  onChange={(e) => setAssignRoom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-bold text-slate-700 cursor-pointer"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  มอบหมายงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. GRADING EVALUATION MODAL */}
      {activeReview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-orange-500" />
              ประเมินผลรายงานการทดลอง
            </h3>
            <div className="mt-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1 select-none">
                <span>นักเรียน: {activeReview.name}</span>
                <span>ห้อง: {activeReview.room}</span>
              </div>
              <p className="text-xs font-bold text-slate-500">บทเรียน: {activeReview.lab}</p>
            </div>
            
            <form onSubmit={handleGradeStudent} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 select-none">คะแนนการประเมิน (เต็ม 10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50/50 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 select-none">ความคิดเห็นและคำชี้แนะเพิ่มเติม</label>
                <textarea
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50/50 leading-relaxed font-bold"
                  placeholder="เขียนความคิดเห็นของคุณครู..."
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveReview(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-2xl text-xs transition-colors cursor-pointer shadow-md shadow-orange-600/20"
                >
                  บันทึกคะแนน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. VIEW REPORT MODAL */}
      {viewingReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                รายงานผลการทำแล็บจำลอง
              </h3>
              <button
                onClick={() => setViewingReport(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-5">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div><span className="font-extrabold text-slate-400 select-none">ผู้ส่ง:</span> <span className="font-bold text-slate-700">{viewingReport.name}</span></div>
                <div><span className="font-extrabold text-slate-400 select-none">ห้องเรียน:</span> <span className="font-bold text-slate-700">{viewingReport.room}</span></div>
                <div><span className="font-extrabold text-slate-400 select-none">การทดลอง:</span> <span className="font-bold text-slate-700">{viewingReport.lab}</span></div>
                <div><span className="font-extrabold text-slate-400 select-none">เวลาส่งรายงาน:</span> <span className="font-bold text-slate-700">{viewingReport.time}</span></div>
              </div>

              {/* Parameters */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-500 mb-2 select-none">ผลการวัดและบันทึกข้อมูลฟิสิกส์</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  {Object.entries(viewingReport.data).filter(([k]) => k !== "conclusion").map(([key, val]) => (
                    <div key={key} className="p-2.5 bg-blue-50/40 border border-blue-100/50 rounded-xl">
                      <div className="text-[10px] font-extrabold text-blue-500 uppercase">{key}</div>
                      <div className="text-xs font-black text-blue-700 mt-1">{val as string}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conclusion */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-500 mb-1.5 select-none">บทวิเคราะห์และสรุปผล</h4>
                <p className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3.5 leading-relaxed" style={{ lineHeight: '1.5' }}>
                  {viewingReport.data.conclusion}
                </p>
              </div>

              {/* Plot Graph Preview */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center flex flex-col items-center select-none">
                <span className="text-[10px] font-bold text-slate-400 mb-2 select-none">แผนภาพความชันของแรงตึงสปริงตามความยาวกระจัด</span>
                <svg className="w-full max-w-[280px] h-20 bg-white rounded-lg border border-slate-200/60 p-1" viewBox="0 0 100 40">
                  <path d="M 10 30 Q 40 15 90 5" fill="none" stroke="#3b82f6" strokeWidth="2" />
                  <circle cx="10" cy="30" r="1.5" fill="#ef4444" />
                  <circle cx="50" cy="18" r="1.5" fill="#ef4444" />
                  <circle cx="90" cy="5" r="1.5" fill="#ef4444" />
                  <line x1="10" y1="30" x2="90" y2="30" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setViewingReport(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl text-xs transition-colors cursor-pointer select-none"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={() => {
                  setViewingReport(null);
                  setGradeScore("9.5");
                  setGradeFeedback("สรุปรายงานผลการทดลองและประเมินผลตัวแปรฟิสิกส์ได้อย่างแม่นยำดีเลิศ");
                  setActiveReview(viewingReport);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs transition-colors cursor-pointer shadow-md shadow-blue-600/20 select-none"
              >
                ให้คะแนน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOAT TOAST FEEDBACK NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 text-white text-xs font-bold shadow-2xl animate-in slide-in-from-bottom-6 duration-300 select-none">
          <div className={`w-2 h-2 rounded-full ${
            toast.type === "success" ? "bg-emerald-400" :
            toast.type === "info" ? "bg-blue-400" :
            "bg-red-400"
          } animate-pulse`} />
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
