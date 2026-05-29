"use client";

import React from "react";
import { BookOpen } from "lucide-react";

interface TheoryCardProps {
  labId?: string;
}

export default function TheoryCard({ labId = "newtons-cooling" }: TheoryCardProps) {
  const isOhmsLaw = labId === "ohms-law";
  const isHookesLaw = labId === "hookes-law";
  const isAcidBase = labId === "acid-base-titration";
  const isBoylesLaw = labId === "boyles-law";
  const isCharlesLaw = labId === "charles-law";
  const isPhotosynthesis = labId === "photosynthesis-rate";
  const isMendelian = labId === "mendels-inheritance";
  const isMitosis = labId === "mitosis-division";

  const theoryDescription = isMitosis
    ? "ไมโทซิสเป็นกระบวนการแบ่งนิวเคลียสของเซลล์ร่างกาย ทำให้เซลล์ลูกสองเซลล์มีชุดโครโมโซมเหมือนเซลล์แม่ ระยะสำคัญได้แก่ Prophase, Metaphase, Anaphase และ Telophase ตามด้วย Cytokinesis"
    : isMendelian
    ? "กฎของเมนเดลอธิบายการถ่ายทอดลักษณะทางพันธุกรรมผ่านแอลลีลจากพ่อแม่สู่รุ่นลูก ตาราง Punnett ช่วยคาดการณ์สัดส่วน genotype และ phenotype ของรุ่นลูกจากการผสมแบบยีนเดียว"
    : isPhotosynthesis
    ? "การสังเคราะห์แสงเป็นกระบวนการที่พืชใช้พลังงานแสงเปลี่ยนคาร์บอนไดออกไซด์และน้ำให้เป็นน้ำตาลกลูโคส พร้อมปล่อยออกซิเจน อัตราการเกิดปฏิกิริยาขึ้นกับปัจจัยจำกัด เช่น ความเข้มแสง CO₂ อุณหภูมิ และน้ำ"
    : isCharlesLaw
    ? "กฎของชาร์ล (Charles's Law) อธิบายว่า สำหรับแก๊สปริมาณคงที่ภายใต้ความดันคงที่ ปริมาตรของแก๊สจะแปรผันตรงกับอุณหภูมิสัมบูรณ์ เมื่ออุณหภูมิเพิ่มขึ้น โมเลกุลแก๊สเคลื่อนที่เร็วขึ้นและดันลูกสูบให้ปริมาตรเพิ่มขึ้น"
    : isBoylesLaw
    ? "กฎของบอยล์ (Boyle's Law) อธิบายว่า สำหรับแก๊สปริมาณคงที่ที่อุณหภูมิคงที่ ความดันของแก๊สจะแปรผกผันกับปริมาตร เมื่อปริมาตรลดลง โมเลกุลแก๊สชนผนังภาชนะถี่ขึ้น ความดันจึงเพิ่มขึ้น"
    : isAcidBase
    ? "การไทเทรตกรด-เบสใช้สารละลายมาตรฐานที่ทราบความเข้มข้นทำปฏิกิริยากับสารตัวอย่างจนถึงจุดสมมูล โดยจำนวนโมลของกรดและเบสสัมพันธ์กันตามสัดส่วนของสมการเคมี ค่า pH จะเปลี่ยนเร็วมากบริเวณจุดสมมูล"
    : isHookesLaw
    ? "กฎของฮุค (Hooke's Law) อธิบายว่า แรงที่ใช้ในการยืดหรือกดสปริงจะแปรผันตรงกับระยะที่สปริงยืดหรือหดจากตำแหน่งสมดุล ตราบใดที่ยังไม่เกินขีดจำกัดสภาพยืดหยุ่น (Elastic Limit)"
    : isOhmsLaw
    ? "กฎของโอห์ม (Ohm's Law) อธิบายความสัมพันธ์ของไฟฟ้ากระแสตรง โดยกระแสไฟฟ้า (I) ที่ไหลผ่านตัวนำจะเป็นสัดส่วนโดยตรงกับความต่างศักย์ไฟฟ้า (V) และเป็นสัดส่วนผกผันกับความต้านทานไฟฟ้า (R)"
    : "กฎการเย็นตัวของนิวตัน (Newton's law of cooling) กล่าวว่า อัตราการเปลี่ยนแปลงของอุณหภูมิของวัตถุจะแปรผันตรงกับความแตกต่างของอุณหภูมิระหว่างตัววัตถุกับสภาพแวดล้อมโดยรอบ";

  const graphLabel = isMitosis
    ? "แผนภาพลำดับระยะ IPMAT"
    : isMendelian
    ? "กราฟสัดส่วน phenotype"
    : isPhotosynthesis
    ? "กราฟอัตรา O₂ ตามเวลา"
    : isCharlesLaw
    ? "กราฟความสัมพันธ์ V-T"
    : isBoylesLaw
    ? "กราฟความสัมพันธ์ P-V"
    : isAcidBase
    ? "กราฟไทเทรชัน pH-volume"
    : isHookesLaw
    ? "กราฟความสัมพันธ์ F-x"
    : isOhmsLaw
    ? "กราฟความสัมพันธ์ V-I"
    : "กราฟตัวอย่างการลดอุณหภูมิ";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6">
      <h2 className="text-base font-bold text-slate-900 mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-500" />
        ทฤษฎีที่เกี่ยวข้อง
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-4 text-left">
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed leading-1.6">
            {theoryDescription}
          </p>

          <div className="bg-slate-50 rounded-2xl border border-slate-200/70 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                สมการความสัมพันธ์
              </span>
              {isMitosis ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>Interphase → PMAT → Cytokinesis</span>
                </div>
              ) : isMendelian ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>Yy × Yy → 1:2:1</span>
                </div>
              ) : isPhotosynthesis ? (
                <div className="text-lg sm:text-xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂</span>
                </div>
              ) : isCharlesLaw ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>V<sub>1</sub>/T<sub>1</sub> = V<sub>2</sub>/T<sub>2</sub></span>
                </div>
              ) : isBoylesLaw ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>P<sub>1</sub>V<sub>1</sub> = P<sub>2</sub>V<sub>2</sub></span>
                </div>
              ) : isAcidBase ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>M<sub>a</sub>V<sub>a</sub> = M<sub>b</sub>V<sub>b</sub></span>
                </div>
              ) : isHookesLaw ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>F = -kx</span>
                </div>
              ) : isOhmsLaw ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>V = I &times; R</span>
                </div>
              ) : (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <div className="flex flex-col items-center leading-none text-base sm:text-lg">
                    <span>dT</span>
                    <span className="border-t border-slate-800 w-full my-0.5" />
                    <span>dt</span>
                  </div>
                  <span>= -k(T - T<sub>s</sub>)</span>
                </div>
              )}
            </div>

            <div className="text-[11px] sm:text-xs text-slate-500 font-semibold space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto">
              {isMitosis ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-cyan-600">PMAT</span>
                    <span>= ระยะหลักของการแบ่งนิวเคลียส</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-violet-600">DNA</span>
                    <span>= ถูกจำลองก่อนเริ่มไมโทซิส</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">Result</span>
                    <span>= เซลล์ลูกเหมือนเซลล์แม่ 2 เซลล์</span>
                  </div>
                </>
              ) : isMendelian ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-violet-600">Genotype</span>
                    <span>= ชุดแอลลีล เช่น YY, Yy, yy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">Phenotype</span>
                    <span>= ลักษณะที่แสดงออก</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-orange-600">Ratio</span>
                    <span>= สัดส่วนคาดการณ์ของรุ่นลูก</span>
                  </div>
                </>
              ) : isPhotosynthesis ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">Light</span>
                    <span>= แหล่งพลังงานหลักของปฏิกิริยา</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-cyan-600">CO₂</span>
                    <span>= สารตั้งต้นที่ใช้สร้างกลูโคส</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-blue-600">O₂</span>
                    <span>= ผลผลิตที่ใช้ประเมินอัตราการสังเคราะห์แสง</span>
                  </div>
                </>
              ) : isCharlesLaw ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-orange-600">V</span>
                    <span>= ปริมาตรของแก๊ส (L หรือ ml)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">T</span>
                    <span>= อุณหภูมิสัมบูรณ์ (K)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">V/T</span>
                    <span>= ค่าคงที่เมื่อความดันคงที่</span>
                  </div>
                </>
              ) : isBoylesLaw ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-cyan-600">P</span>
                    <span>= ความดันของแก๊ส (kPa)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-blue-600">V</span>
                    <span>= ปริมาตรของแก๊ส (L หรือ ml)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">PV</span>
                    <span>= ค่าคงที่เมื่ออุณหภูมิคงที่</span>
                  </div>
                </>
              ) : isAcidBase ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-cyan-600">M</span>
                    <span>= ความเข้มข้นโมลาร์ (mol/L)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">V</span>
                    <span>= ปริมาตรสารละลายที่ใช้ (L)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">pH</span>
                    <span>= ค่าความเป็นกรด-เบสของสารละลาย</span>
                  </div>
                </>
              ) : isHookesLaw ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">F</span>
                    <span>= แรงดึงกลับของสปริง (N)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">k</span>
                    <span>= ค่าคงที่สปริง (N/m)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">x</span>
                    <span>= ระยะยืดจากตำแหน่งสมดุล (m)</span>
                  </div>
                </>
              ) : isOhmsLaw ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">V</span>
                    <span>= ความต่างศักย์ไฟฟ้า (Volt, V)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">I</span>
                    <span>= กระแสไฟฟ้า (Ampere, A)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">R</span>
                    <span>= ความต้านทานไฟฟ้า (Ohm, &Omega;)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">T</span>
                    <span>= อุณหภูมิของวัตถุ (°C)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">T<sub>s</sub></span>
                    <span>= อุณหภูมิสิ่งแวดล้อม (°C)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">k</span>
                    <span>= ค่าคงที่การเย็นตัว (s<sup>-1</sup>)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase mb-2 self-start lg:self-center">
            {graphLabel}
          </span>

          <div className="w-full bg-slate-50 rounded-2xl border border-slate-200/70 p-3 select-none flex items-center justify-center">
            {isMitosis ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                {["I", "P", "M", "A", "T", "C"].map((label, index) => (
                  <g key={label} transform={`translate(${28 + index * 29}, 55)`}>
                    <circle r="15" fill={index === 0 ? "#cffafe" : index < 4 ? "#ede9fe" : "#dcfce7"} stroke={index === 0 ? "#06b6d4" : index < 4 ? "#8b5cf6" : "#22c55e"} strokeWidth="2.5" />
                    <text y="5" fill="#0f172a" fontSize="11" fontWeight="900" textAnchor="middle">{label}</text>
                    {index < 5 && <path d="M17 0H26" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />}
                  </g>
                ))}
                <text x="100" y="100" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">Interphase → Prophase → Metaphase → Anaphase → Telophase</text>
              </svg>
            ) : isMendelian ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="40" y="18" width="120" height="74" rx="16" fill="#faf5ff" stroke="#ddd6fe" strokeWidth="3" />
                <path d="M100 18V92M40 55H160" stroke="#ddd6fe" strokeWidth="3" />
                {["YY", "Yy", "Yy", "yy"].map((label, index) => (
                  <text key={`${label}-${index}`} x={index % 2 ? 130 : 70} y={index > 1 ? 78 : 42} fill={label === "yy" ? "#475569" : "#16a34a"} fontSize="14" fontWeight="900" textAnchor="middle">{label}</text>
                ))}
                <text x="100" y="112" fill="#7c3aed" fontSize="9" fontWeight="900" textAnchor="middle">Genotype 1:2:1 / Phenotype 3:1</text>
              </svg>
            ) : isPhotosynthesis ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="24" y1="96" x2="190" y2="96" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="24" y1="72" x2="190" y2="72" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="24" y1="48" x2="190" y2="48" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="24" y1="24" x2="190" y2="24" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="24" y1="12" x2="24" y2="104" stroke="#cbd5e1" strokeWidth="1" />
                <text x="19" y="25" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">100</text>
                <text x="19" y="50" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">75</text>
                <text x="19" y="74" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">50</text>
                <text x="19" y="99" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">25</text>
                <path d="M28,92 C48,73 64,56 87,43 C107,31 132,27 180,27" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M28,93 C54,92 70,92 92,91" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x="95" y="95" fill="#ef4444" fontSize="7" fontWeight="bold">ปัจจัยจำกัด</text>
                <line x1="24" y1="108" x2="190" y2="108" stroke="#cbd5e1" strokeWidth="1" />
                <text x="24" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
                <text x="84" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">แสง</text>
                <text x="170" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">สูง</text>
              </svg>
            ) : isCharlesLaw ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="24" y1="96" x2="190" y2="96" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="24" y1="72" x2="190" y2="72" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="24" y1="48" x2="190" y2="48" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="24" y1="24" x2="190" y2="24" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="24" y1="12" x2="24" y2="104" stroke="#cbd5e1" strokeWidth="1" />
                <text x="19" y="25" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">650</text>
                <text x="19" y="50" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">575</text>
                <text x="19" y="74" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">500</text>
                <text x="19" y="99" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">425</text>
                <path d="M32,96 L178,24" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <circle cx="32" cy="96" r="3" fill="#06b6d4" />
                <circle cx="178" cy="24" r="3" fill="#06b6d4" />
                <line x1="24" y1="108" x2="190" y2="108" stroke="#cbd5e1" strokeWidth="1" />
                <text x="24" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">273K</text>
                <text x="92" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">318K</text>
                <text x="170" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">363K</text>
              </svg>
            ) : isBoylesLaw ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="24" y1="96" x2="190" y2="96" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="24" y1="72" x2="190" y2="72" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="24" y1="48" x2="190" y2="48" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="24" y1="24" x2="190" y2="24" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="24" y1="12" x2="24" y2="104" stroke="#cbd5e1" strokeWidth="1" />
                <text x="19" y="25" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">200</text>
                <text x="19" y="50" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">150</text>
                <text x="19" y="74" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">100</text>
                <text x="19" y="99" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">50</text>
                <path d="M35,22 C48,30 58,45 70,60 C85,78 110,90 178,98" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M36,23 L178,98" stroke="#bfdbfe" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
                <line x1="24" y1="108" x2="190" y2="108" stroke="#cbd5e1" strokeWidth="1" />
                <text x="24" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.2</text>
                <text x="75" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.4</text>
                <text x="126" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.6</text>
                <text x="177" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.8 L</text>
              </svg>
            ) : isAcidBase ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="24" y1="96" x2="190" y2="96" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="24" y1="72" x2="190" y2="72" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="24" y1="48" x2="190" y2="48" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="24" y1="24" x2="190" y2="24" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="24" y1="12" x2="24" y2="104" stroke="#cbd5e1" strokeWidth="1" />
                <text x="19" y="25" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">14</text>
                <text x="19" y="50" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">10</text>
                <text x="19" y="74" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">7</text>
                <text x="19" y="99" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">2</text>
                <path d="M24,94 C58,93 82,90 98,80 C109,73 113,61 116,50 C120,34 133,24 180,22" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <line x1="114" y1="18" x2="114" y2="101" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x="119" y="17" fill="#f43f5e" fontSize="7" fontWeight="bold">จุดสมมูล</text>
                <line x1="24" y1="108" x2="190" y2="108" stroke="#cbd5e1" strokeWidth="1" />
                <text x="24" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
                <text x="75" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">10</text>
                <text x="126" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">20</text>
                <text x="177" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">30</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">ml</text>
              </svg>
            ) : isHookesLaw ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">10N</text>
                <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">7.5N</text>
                <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">5N</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">2.5N</text>
                <line x1="20" y1="110" x2="175" y2="20" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
                <text x="60" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.05</text>
                <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.10</text>
                <text x="140" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.15</text>
                <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.20</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">ระยะยืด (m)</text>
              </svg>
            ) : isOhmsLaw ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">24V</text>
                <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">18V</text>
                <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">12V</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">6V</text>
                <line x1="20" y1="110" x2="175" y2="20" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
                <text x="60" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.1</text>
                <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.2</text>
                <text x="140" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.3</text>
                <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.4</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">กระแส (A)</text>
              </svg>
            ) : (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">100</text>
                <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">75</text>
                <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">50</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">25</text>
                <line x1="20" y1="95" x2="180" y2="95" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="185" y="97" fill="#10b981" fontSize="8" fontWeight="bold">Ts</text>
                <path d="M20,20 C50,60 90,90 180,95" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
                <text x="60" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">10</text>
                <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">20</text>
                <text x="140" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">30</text>
                <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">40</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">เวลา (นาที)</text>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
