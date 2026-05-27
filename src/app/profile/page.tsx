"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/labs/Breadcrumb";
import DecorativeBackground from "@/components/labs/DecorativeBackground";
import Sidebar from "@/components/Sidebar";
import { 
  Home,
  FlaskConical,
  ClipboardCheck,
  Award,
  History,
  User,
  Star,
  CheckCircle,
  Lock,
  ArrowRight,
  Pencil,
  Camera,
  Activity,
  Flame,
  ChevronRight,
  BookOpen
} from "lucide-react";

export default function ProfilePage() {
  const [username, setUsername] = useState("นักเรียน");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("นักเรียน");

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUsername(tempName);
      setIsEditingName(false);
    }
  };

  // Mock data matching the screenshot
  const stats = [
    {
      title: "ห้องแล็บที่ทำแล้ว",
      subtitle: "จาก 28 ห้อง",
      value: "12",
      icon: FlaskConical,
      color: "text-blue-500",
      bg: "bg-blue-50/70 border border-blue-100/50",
      glow: "hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200"
    },
    {
      title: "ภารกิจที่ทำเสร็จ",
      subtitle: "จาก 15 ภารกิจ",
      value: "8",
      icon: ClipboardCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-50/70 border border-emerald-100/50",
      glow: "hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-200"
    },
    {
      title: "คะแนนรวม",
      subtitle: "คะแนน",
      value: "1,250",
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-50/70 border border-amber-200/50",
      glow: "hover:shadow-lg hover:shadow-amber-500/5 hover:border-amber-200"
    },
    {
      title: "อันดับ",
      subtitle: "จากนักเรียนทั้งหมด",
      value: "128",
      icon: Award,
      color: "text-purple-500",
      bg: "bg-purple-50/70 border border-purple-100/50",
      glow: "hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-200"
    }
  ];

  const activities = [
    {
      id: 1,
      title: "ทำห้องแล็บ Newton's law of cooling สำเร็จ",
      subtitle: "ได้รับ 25 คะแนน",
      points: "+25",
      time: "2 ชั่วโมงที่แล้ว",
      icon: FlaskConical,
      iconColor: "text-blue-500 bg-blue-50/80 border border-blue-100/50"
    },
    {
      id: 2,
      title: "ทำภารกิจ ประจำวัน สำเร็จ",
      subtitle: "ได้รับ 15 คะแนน",
      points: "+15",
      time: "1 วันที่แล้ว",
      icon: Award,
      iconColor: "text-amber-500 bg-amber-50/80 border border-amber-100/50"
    },
    {
      id: 3,
      title: "เข้าเรียนรู้ห้องแล็บ การเคลื่อนที่แบบโปรเจกไตล์",
      subtitle: "ได้รับ 10 คะแนน",
      points: "+10",
      time: "2 วันที่แล้ว",
      icon: BookOpen,
      iconColor: "text-blue-500 bg-blue-50/80 border border-blue-100/50"
    },
    {
      id: 4,
      title: "ทำภารกิจ นักวิทย์ตัวน้อย สำเร็จ",
      subtitle: "ได้รับ 20 คะแนน",
      points: "+20",
      time: "3 วันที่แล้ว",
      icon: CheckCircle,
      iconColor: "text-emerald-500 bg-emerald-50/80 border border-emerald-100/50"
    }
  ];

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

      {/* 2. Breadcrumb Navigation */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 pt-6 pb-2 select-none z-10">
        <Breadcrumb category="Dashboard" title="โปรไฟล์ผู้ใช้ / Profile" />
      </div>

      {/* 3. Main Split Container */}
      <main className="w-full px-0 py-2 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: SIDEBAR MENU (col-span-3, hidden on mobile) */}
          <div className="hidden lg:flex lg:col-span-3 pl-0">
            <Sidebar activeMenu="โปรไฟล์" flushLeft={true} />
          </div>

          {/* RIGHT COLUMN: MAIN PROFILE CONTENTS (col-span-9) */}
          <div className="lg:col-span-9 col-span-12 px-4 lg:pl-0 lg:pr-8 space-y-8">
            
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
                    <img src="/student_avatar_3d.png" alt="Mascot Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-y-[-100%] group-hover/avatar:translate-y-[100%] transition-transform duration-1000 ease-in-out" />
                  </div>
                  <button 
                    onClick={() => alert("ระบบเปลี่ยนภาพโปรไฟล์จะสามารถตั้งค่ารูปนักเรียนแบบ 3D เร็วๆ นี้! 📸")}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-700 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
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
                          className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                        >
                          บันทึก
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center sm:justify-start gap-2 group/name">
                        <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-normal">
                          {username}
                        </h1>
                        <button
                          onClick={() => {
                            setTempName(username);
                            setIsEditingName(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white/80 transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
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
                      <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100/50">เลเวล 4</span>
                      <span className="text-slate-400">760 / 1,000 XP</span>
                    </div>
                    <div className="w-full bg-slate-100/80 h-3 rounded-full overflow-hidden relative border border-slate-200/20">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 relative"
                        style={{ width: "76%" }}
                        role="progressbar"
                        aria-valuenow={76}
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
                      "เรียนรู้ทุกวัน เก่งขึ้นทุกวัน! 🚀"
                    </div>
                  </div>

                </div>

              </div>

              {/* Igloo Winter Landscape (Right Side decoration) */}
              <div className="hidden md:block select-none pointer-events-none pr-4">
                <svg className="w-56 h-32" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Snowy Mountains Background */}
                  <path d="M-10,120 L25,75 L65,120 Z" fill="#cbd5e1" opacity="0.25" />
                  <path d="M30,120 L90,55 L150,120 Z" fill="#94a3b8" opacity="0.15" />
                  <path d="M100,120 L155,60 L210,120 Z" fill="#cbd5e1" opacity="0.3" />
                  
                  {/* Igloo Body */}
                  <path d="M85,110 C85,72 155,72 155,110 Z" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="2" />
                  
                  {/* Igloo Bricks Grid */}
                  <path d="M95,95 C115,92 125,92 145,95" stroke="#bae6fd" strokeWidth="1" />
                  <path d="M88,103 C115,100 125,100 152,103" stroke="#bae6fd" strokeWidth="1" />
                  <line x1="120" y1="78" x2="120" y2="110" stroke="#bae6fd" strokeWidth="1" />
                  <line x1="102" y1="85" x2="98" y2="110" stroke="#bae6fd" strokeWidth="1" />
                  <line x1="138" y1="85" x2="142" y2="110" stroke="#bae6fd" strokeWidth="1" />
                  
                  {/* Tunnel Entrance */}
                  <path d="M102,110 C102,93 126,93 126,110 Z" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="1.5" />
                  <path d="M108,110 C108,98 120,98 120,110 Z" fill="#0284c7" />
                  
                  {/* Flag Pole and Flag on top */}
                  <line x1="120" y1="78" x2="120" y2="52" stroke="#64748b" strokeWidth="1.5" />
                  <path d="M120,52 L140,57 L120,62 Z" fill="#0284c7" />
                  
                  {/* Ground Snow Line */}
                  <path d="M-10,110 Q50,105 110,110 T230,110" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

            </section>

            {/* STATS GRID SECTION */}
            <section aria-label="ข้อมูลตัวชี้วัดความคืบหน้า">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, idx) => {
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

            {/* ACTIVITIES AND ACTIVE MISSIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: RECENT ACTIVITIES (7/12 Columns) */}
              <section className="lg:col-span-7 bg-white/95 border border-slate-200/50 rounded-[32px] p-6 shadow-md shadow-slate-100/50" aria-label="ประวัติกิจกรรมล่าสุด">
                <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3 select-none">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 leading-normal">
                    <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
                    กิจกรรมล่าสุด
                  </h3>
                  <button 
                    onClick={() => alert("ระบบบันทึกประวัติการทำแล็บทั้งหมดกำลังเตรียมการเชื่อมต่อ Supabase! 📝")}
                    className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-0.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded px-1.5 py-0.5 cursor-pointer"
                    aria-label="ดูประวัติการทำแล็บทั้งหมด"
                  >
                    <span>ดูทั้งหมด</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  {activities.map((act) => {
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
                  })}
                </div>
              </section>

              {/* RIGHT COLUMN: ACTIVE MISSIONS (5/12 Columns) */}
              <section className="lg:col-span-5 bg-white/95 border border-slate-200/50 rounded-[32px] p-6 shadow-md shadow-slate-100/50" aria-label="ภารกิจของนักวิทยาศาสตร์">
                <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3 select-none">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 leading-normal">
                    <Award className="w-5 h-5 text-indigo-500 animate-pulse" />
                    ภารกิจที่กำลังดำเนินการ
                  </h3>
                  <button 
                    onClick={() => alert("ระบบดูภารกิจสะสมแต้มทั้งหมดเร็วๆ นี้! 🌟")}
                    className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-0.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded px-1.5 py-0.5 cursor-pointer"
                    aria-label="ดูภารกิจนักวิทยาศาสตร์ทั้งหมด"
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

            </div>

            {/* BOTTOM PROFILE CUSTOM CALLOUT BANNER */}
            <section className="w-full max-w-4xl mx-auto px-2 py-6 select-none relative z-10" aria-label="ความพร้อมในการเรียนรู้">
              <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 p-[1.2px] shadow-lg shadow-indigo-500/10 group hover:shadow-xl hover:shadow-indigo-500/15 transition-all duration-300">
                {/* Content Container */}
                <div className="bg-white/95 rounded-[23px] px-6 py-4.5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left relative overflow-hidden min-h-[96px]">
                  
                  {/* Peeking Mascot Penguin */}
                  <div className="absolute -left-2 -bottom-5 w-24 h-24 select-none pointer-events-none z-10 overflow-hidden">
                    <img src="/penguin_expressions.png" alt="Penguin mascot" className="absolute w-[300%] max-w-none left-0 top-[-5%] object-contain" />
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
                  
                  {/* Paper Plane SVG Flight Trail decoration */}
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

        </div>
      </main>

    </div>
  );
}
