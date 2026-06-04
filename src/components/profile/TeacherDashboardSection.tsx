"use client";

import React, { useState, useSyncExternalStore } from "react";
import TeacherDashboard, {
  type TeacherActivity,
  type TeacherClassroom,
  type TeacherReview,
  type TeacherSubmission,
  type TeacherTab,
} from "./TeacherDashboard";
import { 
  Users, 
  ClipboardCheck, 
  GraduationCap, 
  FileText
} from "lucide-react";

const DEFAULT_TEACHER_NAME = "ครูอรทัย";

function getTeacherNameSnapshot() {
  if (typeof window === "undefined") return DEFAULT_TEACHER_NAME;
  return localStorage.getItem("scisiam_user_name") || DEFAULT_TEACHER_NAME;
}

function subscribeTeacherName(onStoreChange: () => void) {
  window.addEventListener("scisiam-auth-update", onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("scisiam-auth-update", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export default function TeacherDashboardSection() {
  const [activeTeacherTab, setActiveTeacherTab] = useState<TeacherTab>("classrooms");
  const teacherName = useSyncExternalStore(
    subscribeTeacherName,
    getTeacherNameSnapshot,
    () => DEFAULT_TEACHER_NAME
  );
  const [isEditingTeacherName, setIsEditingTeacherName] = useState(false);
  const [tempTeacherName, setTempTeacherName] = useState(DEFAULT_TEACHER_NAME);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Demo classrooms for competition presentation mode.
  const [classrooms, setClassrooms] = useState<TeacherClassroom[]>([
    { id: 1, name: "ม.4/1", students: 36, files: 4, deadline: "อีก 2 วัน", status: "กำลังเรียน" },
    { id: 2, name: "ม.4/2", students: 34, files: 3, deadline: "อีก 4 วัน", status: "กำลังเรียน" },
    { id: 3, name: "ม.5/1", students: 40, files: 5, deadline: "อีก 5 วัน", status: "กำลังเรียน" },
    { id: 4, name: "ม.5/2", students: 38, files: 4, deadline: "อีก 7 วัน", status: "กำลังเรียน" },
  ]);

  // Demo student submissions for teacher presentation mode.
  const [submissions, setSubmissions] = useState<TeacherSubmission[]>([
    { id: 1, name: "ด.ช. ณัฐพล มณีเนตร", room: "ม.4/1", lab: "Newton's Law of Cooling", status: "ส่งแล้ว", score: "10/10", time: "10 นาทีที่แล้ว" },
    { id: 2, name: "ด.ญ. อริศรา บุญส่ง", room: "ม.4/1", lab: "Hooke's Law of Elasticity", status: "กำลังทำ", time: "25 นาทีที่แล้ว" },
    { id: 3, name: "ด.ช. เกียรติศักดิ์ อุดม", room: "ม.4/2", lab: "Ohm's Law & DC Circuits", status: "ค้างส่ง", deadline: "วันนี้!", time: "1 วันที่แล้ว" },
    { id: 4, name: "ด.ญ. กัญญารัตน์ สีขาว", room: "ม.5/1", lab: "Newton's Law of Cooling", status: "ส่งแล้ว", score: "9.5/10", time: "2 ชั่วโมงที่แล้ว" },
    { id: 5, name: "ด.ช. พีรพงษ์ แก้วมณี", room: "ม.5/2", lab: "Hooke's Law of Elasticity", status: "กำลังทำ", time: "3 ชั่วโมงที่แล้ว" },
  ]);

  // Demo pending reviews for teacher presentation mode.
  const [pendingReviews, setPendingReviews] = useState<TeacherReview[]>([
    { id: 101, name: "ด.ช. ศักดิ์สิทธิ์ มีชัย", room: "ม.4/1", lab: "Hooke's Law of Elasticity", time: "31 พ.ค. 13:10", data: { mass: "150g", elongation: "4.5cm", k: "32.6 N/m", conclusion: "ความยืดหยุ่นของสปริงเป็นไปตามกฎของฮุกอย่างชัดเจน ค่าคงตัวสปริงที่คำนวณได้มีความถูกต้อง" } },
    { id: 102, name: "ด.ญ. รุ่งนภา สมบูรณ์", room: "ม.4/2", lab: "Ohm's Law & DC Circuits", time: "31 พ.ค. 12:45", data: { voltage: "6.0V", current: "0.2A", resistance: "30.0Ω", conclusion: "กระแสไฟฟ้าที่ไหลผ่านตัวต้านทานแปรผันตรงกับความต่างศักย์ไฟฟ้าที่ป้อนเข้ามาตามทฤษฎี" } },
    { id: 103, name: "ด.ช. ธีรภัทร รักดี", room: "ม.5/1", lab: "Newton's Law of Cooling", time: "31 พ.ค. 11:20", data: { initial: "85°C", ambient: "28°C", duration: "1200s", conclusion: "อัตราการลดอุณหภูมิของน้ำร้อนลดลงอย่างรวดเร็วในช่วงแรกและช้าลงเมื่อเข้าใกล้อุณหภูมิห้อง" } },
    { id: 104, name: "ด.ญ. วาสนา รุ่งเรือง", room: "ม.5/2", lab: "Ohm's Law & DC Circuits", time: "30 พ.ค. 16:30", data: { voltage: "12.0V", current: "0.4A", resistance: "30.0Ω", conclusion: "ความชันของกราฟความสัมพันธ์ระหว่าง V และ I คือค่าความต้านทานไฟฟ้าของวงจร" } },
  ]);

  // Demo teacher activities timeline for teacher presentation mode.
  const [teacherActivities, setTeacherActivities] = useState<TeacherActivity[]>([
    { id: 1, time: "13:00 น.", title: 'มอบหมายงาน "Hooke\'s Law of Elasticity" ให้ห้อง ม.4/1 และ ม.4/2', type: "assign" },
    { id: 2, time: "11:15 น.", title: 'ตรวจรายงานจำลองการทดลอง "Newton\'s Law of Cooling" ของ ม.5/1 (15 รายงาน)', type: "grade" },
    { id: 3, time: "09:30 น.", title: 'ดาวน์โหลดสรุปรายงานผลคะแนนของห้อง ม.5/2 เป็นไฟล์ Excel', type: "download" },
    { id: 4, time: "วานนี้", title: 'สร้างห้องเรียนใหม่ "ห้องเรียนวิชาฟิสิกส์เพิ่มเติม ม.5/2"', type: "classroom" },
    { id: 5, time: "2 วันที่แล้ว", title: 'อัปโหลดคู่มือแล็บ "Ohm\'s Law & DC Circuits"', type: "upload" },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassStudents, setNewClassStudents] = useState("35");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignLab, setAssignLab] = useState("Hooke's Law of Elasticity");
  const [assignRoom, setAssignRoom] = useState("ม.4/1");

  const [activeReview, setActiveReview] = useState<TeacherReview | null>(null);
  const [gradeScore, setGradeScore] = useState("9");
  const [gradeFeedback, setGradeFeedback] = useState("ทำการทดลองได้เรียบร้อยและบันทึกผลได้แม่นยำดีมาก");
  const [viewingReport, setViewingReport] = useState<TeacherReview | null>(null);

  const handleSaveTeacherName = () => {
    if (tempTeacherName.trim()) {
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

  return (
    <>
      <TeacherDashboard
        teacherName={teacherName}
        tempTeacherName={tempTeacherName}
        isEditingTeacherName={isEditingTeacherName}
        activeTab={activeTeacherTab}
        classrooms={classrooms}
        submissions={submissions}
        pendingReviews={pendingReviews}
        teacherActivities={teacherActivities}
        onTempTeacherNameChange={setTempTeacherName}
        onStartEditingName={() => {
          setTempTeacherName(teacherName);
          setIsEditingTeacherName(true);
        }}
        onSaveTeacherName={handleSaveTeacherName}
        onChangeAvatar={() => alert("ระบบเปลี่ยนภาพโปรไฟล์จะสามารถตั้งค่ารูปคุณครูแบบ 3D เร็วๆ นี้!")}
        onTabChange={setActiveTeacherTab}
        onCreateClassroom={() => setIsCreateModalOpen(true)}
        onAssignExperiment={(room) => {
          if (room) setAssignRoom(room);
          setIsAssignModalOpen(true);
        }}
        onReviewReport={setViewingReport}
        onGradeReport={(review) => {
          setGradeScore("9");
          setGradeFeedback("บันทึกข้อมูลได้ดี มีความเข้าใจในการทดลอง");
          setActiveReview(review);
        }}
        onDownload={handleDownload}
      />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-350 select-none">
          <div className={`px-5 py-3 rounded-2xl border shadow-xl flex items-center gap-3 font-bold text-sm ${
            toast.type === "success" 
              ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
              : toast.type === "error" 
                ? "bg-rose-50 border-rose-100 text-rose-700" 
                : "bg-blue-50 border-blue-100 text-blue-700"
          }`}>
            <span className="leading-none">{toast.message}</span>
          </div>
        </div>
      )}

      {/* MODALS */}
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
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div><span className="font-extrabold text-slate-400 select-none">ผู้ส่ง:</span> <span className="font-bold text-slate-700">{viewingReport.name}</span></div>
                <div><span className="font-extrabold text-slate-400 select-none">ห้องเรียน:</span> <span className="font-bold text-slate-700">{viewingReport.room}</span></div>
                <div><span className="font-extrabold text-slate-400 select-none">การทดลอง:</span> <span className="font-bold text-slate-700">{viewingReport.lab}</span></div>
                <div><span className="font-extrabold text-slate-400 select-none">เวลาส่งรายงาน:</span> <span className="font-bold text-slate-700">{viewingReport.time}</span></div>
              </div>

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

              <div>
                <h4 className="text-xs font-extrabold text-slate-500 mb-1.5 select-none">บทวิเคราะห์และสรุปผล</h4>
                <p className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3.5 leading-relaxed" style={{ lineHeight: '1.5' }}>
                  {viewingReport.data.conclusion}
                </p>
              </div>

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
    </>
  );
}
