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
  const isLeChateliers = labId === "le-chateliers-principle";
  const isBeerLambert = labId === "beer-lambert-law";
  const isHesssLaw = labId === "hesss-law";
  const isGalvanicCell = labId === "galvanic-cell";
  const isChemicalKinetics = labId === "chemical-kinetics";
  const isSolubilityProduct = labId === "solubility-product";
  const isAvogadrosLaw = labId === "avogadros-law";
  const isElectrolysis = labId === "electrolysis-lab";
  const isColligative = labId === "colligative-properties";
  const isSnellsLaw = labId === "snells-law";
  const isIdealGas = labId === "ideal-gas-law";
  const isNewtonsSecond = labId === "newtons-second-law";
  const isMomentum = labId === "momentum-conservation";
  const isFaradaysLaw = labId === "faradays-law";
  const isBernoulli = labId === "bernoullis-principle";
  const isPhotoelectric = labId === "photoelectric-effect";
  const isKepler = labId === "keplers-laws";
  const isStefanBoltzmann = labId === "stefan-boltzmann";

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
    : isSnellsLaw
    ? "กฎของสเนลล์ (Snell's Law) อธิบายการหักเหของแสงเมื่อเดินทางผ่านตัวกลางสองชนิดที่มีดัชนีหักเหต่างกัน โดยมุมตกกระทบและมุมหักเหมีความสัมพันธ์กันตามดัชนีหักเหของตัวกลางนั้น และเกิดการสะท้อนกลับหมดได้เมื่อแสงเดินทางจากตัวกลางที่มีดัชนีหักเหสูงไปยังต่ำด้วยมุมที่โตกว่ามุมวิกฤต"
    : isIdealGas
    ? "กฎของแก๊สอุดมคติ (Ideal Gas Law) อธิบายความสัมพันธ์ของแก๊สสมบูรณ์แบบโดยรวมกฎของบอยล์ ชาร์ล และเกย์-ลูสแซก เข้าด้วยกันในสมการ PV = nRT เพื่อแสดงว่าผลคูณของความดันและปริมาตรแปรผันตรงกับจำนวนโมลและอุณหภูมิสัมบูรณ์ของแก๊ส"
    : isNewtonsSecond
    ? "กฎข้อที่สองของนิวตัน (Newton's Second Law) กล่าวว่า เมื่อมีแรงลัพธ์ที่ไม่เป็นศูนย์มากระทำต่อวัตถุ จะทำให้วัตถุเคลื่อนที่ด้วยความเร่ง โดยความเร่งจะแปรผันตรงกับแรงลัพธ์ที่กระทำ และแปรผกผันกับมวลของวัตถุนั้น (F = ma)"
    : isMomentum
    ? "กฎการอนุรักษ์โมเมนตัมเชิงเส้น (Conservation of Linear Momentum) กล่าวว่า เมื่อไม่มีแรงภายนอกมากระทำต่อระบบ ผลรวมโมเมนตัมของระบบก่อนชนจะเท่ากับผลรวมโมเมนตัมของระบบหลังชนเสมอ โดยใช้ศึกษาระบบชนแบบยืดหยุ่นและไร้ยืดหยุ่น"
    : isFaradaysLaw
    ? "กฎการเหนี่ยวนำของฟาราเดย์ (Faraday's Law of Induction) อธิบายว่า แรงเคลื่อนไฟฟ้าเหนี่ยวนำที่เกิดขึ้นในขดลวดแปรผันตรงกับอัตราการเปลี่ยนแปลงฟลักซ์แม่เหล็กที่ผ่านขดลวดนั้นเทียบกับเวลา โดยมีทิศทางต้านการเปลี่ยนแปลงตาม Lenz's Law"
    : isBernoulli
    ? "หลักการของแบร์นูลลี (Bernoulli's Principle) ระบุว่า สำหรับการไหลของของไหลในแนวเส้นกระแสที่ไม่มีแรงเสียดทาน จุดที่มีความเร็วของของไหลสูงจะมีความดันต่ำ และจุดที่มีความเร็วของของไหลต่ำจะมีความดันสูง"
    : isPhotoelectric
    ? "ปรากฏการณ์โฟโตอิเล็กทริก (Photoelectric Effect) ค้นพบโดยไอน์สไตน์ อธิบายการหลุดออกของอิเล็กตรอนจากผิวโลหะเมื่อได้รับพลังงานแสงที่มีความถี่สูงกว่าความถี่ขีดเริ่ม พลังงานจลน์สูงสุดแปรผันตรงตามความถี่แสงลบค่าฟังก์ชันงาน"
    : isKepler
    ? "กฎข้อที่สามของเคปเลอร์ (Kepler's Third Law) ระบุว่า กำลังสองของคาบการโคจรดาวเคราะห์รอบดวงอาทิตย์แปรผันตรงกับกำลังสามของระยะครึ่งแกนเอกวงโคจรรี (T² / a³ = ค่าคงที่) นำมาสู่ทฤษฎีแรงโน้มถ่วงพิภพ"
    : isStefanBoltzmann
    ? "กฎของสเตฟาน-โบลตซ์มันน์ (Stefan-Boltzmann Law) ระบุว่า กำลังงานการแผ่รังสีต่อหน่วยพื้นที่ผิวของวัตถุดำแปรผันตรงกับอุณหภูมิสัมบูรณ์เคลวินยกกำลังสี่ (I = σT⁴) สะท้อนการคายพลังงานรังสีความร้อนของวัตถุและดาวฤกษ์"
    : isLeChateliers
    ? "หลักการของเลอชาเตอลิเย (Le Chatelier's Principle) กล่าวว่า เมื่อระบบที่อยู่ในสภาวะสมดุลถูกรบกวนโดยการเปลี่ยนแปลงปัจจัย เช่น ความเข้มข้น อุณหภูมิ หรือความดัน ระบบจะเกิดปฏิกิริยาย้อนกลับหรือไปข้างหน้าในทิศทางที่จะลดผลของการรบกวนนั้น เพื่อเข้าสู่สมดุลใหม่อีกครั้ง"
    : isBeerLambert
    ? "กฎของเบียร์-ลัมเบิร์ต (Beer-Lambert Law) อธิบายว่า ความดูดกลืนแสง (Absorbance, A) ของสารละลายจะเป็นสัดส่วนโดยตรงกับความเข้มข้นของสารดูดกลืนแสง (c) และความกว้างของคิวเวตต์ที่แสงเดินทางผ่าน (b) โดยสัมพันธ์ในรูปสมการเชิงเส้น A = ε·c·b"
    : isHesssLaw
    ? "กฎของเฮสส์ (Hess's Law) กล่าวว่า ค่าการเปลี่ยนแปลงเอนทัลปี (ΔH) ของปฏิกิริยาเคมีใด ๆ จะมีค่าคงที่เสมอไม่ว่าจะเกิดขึ้นในขั้นตอนเดียวหรือหลายขั้นตอน เนื่องจากเอนทัลปีเป็นฟังก์ชันสภาวะ (State Function) โดยผลรวมของเอนทัลปีย่อยในทางอ้อมย่อมเท่ากับเอนทัลปีของเส้นทางตรง (ΔH₁ = ΔH₂ + ΔH₃)"
    : isGalvanicCell
    ? "เซลล์กัลวานิกเปลี่ยนพลังงานเคมีจากปฏิกิริยารีดอกซ์ที่เกิดขึ้นเองให้เป็นพลังงานไฟฟ้า อิเล็กตรอนไหลจากแอโนดไปแคโทดผ่านวงจรภายนอก ส่วนสะพานเกลือช่วยรักษาสมดุลประจุ แรงดันเซลล์ขึ้นกับศักย์รีดักชันและความเข้มข้นของไอออน"
    : isChemicalKinetics
    ? "จลนพลศาสตร์เคมีศึกษาอัตราการเกิดปฏิกิริยาและปัจจัยที่ทำให้เร็วหรือช้าลง เช่น ความเข้มข้น อุณหภูมิ พื้นที่ผิว และตัวเร่งปฏิกิริยา กฎอัตราแสดงความสัมพันธ์ระหว่างอัตราปฏิกิริยากับความเข้มข้นของสารตั้งต้น"
    : isSolubilityProduct
    ? "ค่าคงที่ผลคูณการละลาย (Ksp) ใช้อธิบายสมดุลการละลายของเกลือที่ละลายน้ำได้น้อย เมื่อผลคูณไอออน Qsp ต่ำกว่า Ksp สารยังละลายได้ แต่ถ้า Qsp มากกว่า Ksp ระบบจะเกิดตะกอนเพื่อลดความเข้มข้นไอออน"
    : isAvogadrosLaw
    ? "ปริมาตรโมลาร์ของแก๊สคือปริมาตรของแก๊ส 1 โมลภายใต้สภาวะที่กำหนด แนวคิดนี้เชื่อมกับกฎแก๊สอุดมคติ PV = nRT และที่ STP แบบคลาสสิกแก๊ส 1 โมลมีปริมาตรประมาณ 22.4 ลิตร"
    : isElectrolysis
    ? "อิเล็กโทรลิซิสใช้พลังงานไฟฟ้าบังคับปฏิกิริยารีดอกซ์ที่ไม่เกิดเอง ไอออนโลหะรับอิเล็กตรอนที่แคโทดและเคลือบผิวชิ้นงาน ปริมาณโลหะที่ชุบสัมพันธ์กับประจุไฟฟ้ารวมตามกฎของฟาราเดย์"
    : isColligative
    ? "สมบัติคอลลิเกทีฟขึ้นกับจำนวนอนุภาคตัวละลายในสารละลาย ไม่ได้ขึ้นกับชนิดทางเคมีโดยตรง ตัวละลายไม่ระเหยทำให้จุดเยือกแข็งลดลงและจุดเดือดสูงขึ้น โดยผลจะมากขึ้นเมื่อ molality หรือ van't Hoff factor เพิ่มขึ้น"
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
    : isLeChateliers
    ? "กราฟความเข้มข้นสารประกอบเชิงซ้อนตามเวลา"
    : isBeerLambert
    ? "กราฟมาตรฐานการดูดกลืนแสงความเข้มข้น (A - c)"
    : isHesssLaw
    ? "แผนภาพระดับพลังงาน (Enthalpy Diagram)"
    : isGalvanicCell
    ? "กราฟแรงดันเซลล์เทียบอัตราส่วนไอออน"
    : isChemicalKinetics
    ? "กราฟอัตราปฏิกิริยาเทียบความเข้มข้น"
    : isSolubilityProduct
    ? "กราฟ Qsp เทียบ Ksp"
    : isAvogadrosLaw
    ? "กราฟปริมาตรแก๊สเทียบจำนวนโมล"
    : isElectrolysis
    ? "กราฟมวลโลหะที่ชุบเทียบประจุไฟฟ้า"
    : isColligative
    ? "กราฟ ΔT เทียบ molality"
    : isHookesLaw
    ? "กราฟความสัมพันธ์ F-x"
    : isOhmsLaw
    ? "กราฟความสัมพันธ์ V-I"
    : isSnellsLaw
    ? "กราฟความสัมพันธ์ sin(θ₁) - sin(θ₂)"
    : isIdealGas
    ? "กราฟความสัมพันธ์ P - T"
    : isNewtonsSecond
    ? "กราฟความสัมพันธ์ a - F"
    : isMomentum
    ? "กราฟเปรียบเทียบโมเมนตัมก่อนและหลังชน"
    : isFaradaysLaw
    ? "กราฟแรงดันเหนี่ยวนำกระแส V - t"
    : isBernoulli
    ? "กราฟการแจกแจงความดัน P ตามแนวท่อ"
    : isPhotoelectric
    ? "กราฟพลังงานจลน์สูงสุด Ek - ความถี่แสง f"
    : isKepler
    ? "กราฟความสัมพันธ์ T² - a³"
    : isStefanBoltzmann
    ? "กราฟกำลังความเข้มการแผ่รังสี I - T⁴"
    : "กราฟตัวอย่างการลดอุณหภูมิ";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6">
      <h2 className="text-base font-bold text-slate-900 mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-500" />
        ทฤษฎีที่เกี่ยวข้อง
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-4 text-left">
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-[1.65]">
            {theoryDescription}
          </p>

          <div className="bg-slate-50 rounded-2xl border border-slate-200/70 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
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
              ) : isSnellsLaw ? (
                <div className="text-lg sm:text-xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>n<sub>1</sub> sin(θ<sub>1</sub>) = n<sub>2</sub> sin(θ<sub>2</sub>)</span>
                </div>
              ) : isIdealGas ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>P V = n R T</span>
                </div>
              ) : isNewtonsSecond ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>F = m a</span>
                </div>
              ) : isMomentum ? (
                <div className="text-lg sm:text-xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>p₁ + p₂ = p₁&apos; + p₂&apos;</span>
                </div>
              ) : isFaradaysLaw ? (
                <div className="text-lg sm:text-xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>ℰ = -N &Delta;&Phi;<sub>B</sub>/&Delta;t</span>
                </div>
              ) : isBernoulli ? (
                <div className="text-lg sm:text-xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>P + &frac12;&rho;v² + &rho;gh = Const</span>
                </div>
              ) : isPhotoelectric ? (
                <div className="text-lg sm:text-xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>E<sub>k</sub> = h f - W<sub>0</sub></span>
                </div>
              ) : isKepler ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>T² / a³ = K</span>
                </div>
              ) : isStefanBoltzmann ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>I = &sigma; T⁴</span>
                </div>
              ) : isLeChateliers ? (
                <div className="text-lg sm:text-xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>K<sub>c</sub> = [[Fe(SCN)]<sup>2+</sup>] / ([Fe<sup>3+</sup>][SCN<sup>-</sup>])</span>
                </div>
              ) : isBeerLambert ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>A = &epsilon; &times; c &times; b</span>
                </div>
              ) : isHesssLaw ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>&Delta;H<sub>1</sub> = &Delta;H<sub>2</sub> + &Delta;H<sub>3</sub></span>
                </div>
              ) : isGalvanicCell ? (
                <div className="text-lg sm:text-xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>E<sub>cell</sub> = E<sub>cathode</sub> - E<sub>anode</sub></span>
                </div>
              ) : isChemicalKinetics ? (
                <div className="text-lg sm:text-xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>rate = k[A]<sup>m</sup>[B]<sup>n</sup></span>
                </div>
              ) : isSolubilityProduct ? (
                <div className="text-lg sm:text-xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>K<sub>sp</sub> = [M<sup>n+</sup>]<sup>a</sup>[X<sup>m-</sup>]<sup>b</sup></span>
                </div>
              ) : isAvogadrosLaw ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>V<sub>m</sub> = V / n</span>
                </div>
              ) : isElectrolysis ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>m = ItM / nF</span>
                </div>
              ) : isColligative ? (
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <span>&Delta;T = iKm</span>
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
              ) : isSnellsLaw ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">n₁, n₂</span>
                    <span>= ดัชนีหักเหของตัวกลาง 1 และ 2</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">θ₁</span>
                    <span>= มุมตกกระทบ (องศา)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">θ₂</span>
                    <span>= มุมหักเห (องศา)</span>
                  </div>
                </>
              ) : isIdealGas ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-cyan-600">P</span>
                    <span>= ความดันของแก๊ส (kPa)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-blue-600">V</span>
                    <span>= ปริมาตรของแก๊ส (L)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">T</span>
                    <span>= อุณหภูมิสัมบูรณ์ (Kelvin, K)</span>
                  </div>
                </>
              ) : isNewtonsSecond ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">F</span>
                    <span>= แรงดึงลัพธ์ที่กระทำ (N)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">m</span>
                    <span>= มวลของรถรวมน้ำหนักลาก (kg)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">a</span>
                    <span>= ความเร่งของตัวรถ (m/s²)</span>
                  </div>
                </>
              ) : isMomentum ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">p₁, p₂</span>
                    <span>= โมเมนตัมก่อนชน (kg·m/s)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">m₁, m₂</span>
                    <span>= มวลของรถเข็น 1 และ 2 (kg)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">v₁, v₂</span>
                    <span>= ความเร็วหลังชน (m/s)</span>
                  </div>
                </>
              ) : isFaradaysLaw ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">ℰ</span>
                    <span>= แรงเคลื่อนไฟฟ้าเหนี่ยวนำ (V)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">N</span>
                    <span>= จำนวนรอบขดลวด</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">&Delta;&Phi;<sub>B</sub>/&Delta;t</span>
                    <span>= อัตราการเปลี่ยนฟลักซ์แม่เหล็ก</span>
                  </div>
                </>
              ) : isBernoulli ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-cyan-600">P</span>
                    <span>= ความดันของของไหล (Pa หรือ kPa)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-blue-600">v</span>
                    <span>= ความเร็วการไหลของของไหล (m/s)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">&rho;</span>
                    <span>= ความหนาแน่นของของไหล (kg/m³)</span>
                  </div>
                </>
              ) : isPhotoelectric ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">E<sub>k</sub></span>
                    <span>= พลังงานจลน์สูงสุดของอิเล็กตรอน</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">h f</span>
                    <span>= พลังงานของแสงกระตุ้น (eV)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">W₀</span>
                    <span>= ฟังก์ชันงานของโลหะ (Work function)</span>
                  </div>
                </>
              ) : isKepler ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">T</span>
                    <span>= คาบวงโคจรของดาวเคราะห์ (ปี)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">a</span>
                    <span>= ระยะกึ่งแกนเอก (AU)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">K</span>
                    <span>= ค่าคงที่สัดส่วน T²/a³ (= 1.0)</span>
                  </div>
                </>
              ) : isStefanBoltzmann ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">I</span>
                    <span>= ความเข้มการแผ่รังสี (W/m²)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">T</span>
                    <span>= อุณหภูมิสัมบูรณ์เคลวิน (K)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">&sigma;</span>
                    <span>= ค่าคงที่ Stefan-Boltzmann</span>
                  </div>
                </>
              ) : isLeChateliers ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">Fe³⁺</span>
                    <span>= ไอออนเหล็ก (สีเหลืองอ่อน)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-amber-600">[Fe(SCN)]²⁺</span>
                    <span>= สารประกอบเชิงซ้อน (สีแดงเลือดนก)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-blue-600">NaF</span>
                    <span>= สารกำจัด Fe³⁺ ทำให้สมดุลเลื่อนซ้าย</span>
                  </div>
                </>
              ) : isBeerLambert ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">A</span>
                    <span>= ค่าการดูดกลืนแสง (Absorbance)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">c</span>
                    <span>= ความเข้มข้นสารละลาย (M)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">b</span>
                    <span>= ความกว้างช่องแสงคิวเวตต์ (cm)</span>
                  </div>
                </>
              ) : isHesssLaw ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">ΔH₁</span>
                    <span>= ปฏิกิริยารวมโดยตรง NaOH(s) + HCl(aq)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-blue-600">ΔH₂</span>
                    <span>= ปฏิกิริยาละลาย NaOH(s) + H₂O</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">ΔH₃</span>
                    <span>= ปฏิกิริยาสะเทิน NaOH(aq) + HCl(aq)</span>
                  </div>
                </>
              ) : isGalvanicCell ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-blue-600">Ecell</span>
                    <span>= แรงดันไฟฟ้ารวมของเซลล์ (V)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">Anode</span>
                    <span>= ขั้วเกิดออกซิเดชันและปล่อยอิเล็กตรอน</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">Cathode</span>
                    <span>= ขั้วเกิดรีดักชันและรับอิเล็กตรอน</span>
                  </div>
                </>
              ) : isChemicalKinetics ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">rate</span>
                    <span>= อัตราการเกิดปฏิกิริยา</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">k</span>
                    <span>= ค่าคงที่อัตราที่ขึ้นกับอุณหภูมิ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">m,n</span>
                    <span>= อันดับของปฏิกิริยาต่อสารตั้งต้น</span>
                  </div>
                </>
              ) : isSolubilityProduct ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">Ksp</span>
                    <span>= ค่าคงที่สมดุลการละลาย</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">Qsp</span>
                    <span>= ผลคูณไอออน ณ ขณะทดลอง</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">Qsp &gt; Ksp</span>
                    <span>= เริ่มเกิดตะกอน</span>
                  </div>
                </>
              ) : isAvogadrosLaw ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-blue-600">Vm</span>
                    <span>= ปริมาตรโมลาร์ของแก๊ส (L/mol)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">V</span>
                    <span>= ปริมาตรแก๊สที่เก็บได้</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">n</span>
                    <span>= จำนวนโมลของแก๊ส</span>
                  </div>
                </>
              ) : isElectrolysis ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">I</span>
                    <span>= กระแสไฟฟ้า (A)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">t</span>
                    <span>= เวลาในการชุบ (s)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">F</span>
                    <span>= ค่าคงที่ฟาราเดย์ 96485 C/mol</span>
                  </div>
                </>
              ) : isColligative ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600">ΔT</span>
                    <span>= การเปลี่ยนจุดเดือดหรือจุดเยือกแข็ง</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600">i</span>
                    <span>= van&apos;t Hoff factor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">m</span>
                    <span>= molality ของสารละลาย</span>
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
          <span className="text-[10px] text-slate-500 font-bold uppercase mb-2 self-start lg:self-center">
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
            ) : isSnellsLaw ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">1.0</text>
                <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">0.75</text>
                <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">0.5</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">0.25</text>
                <line x1="20" y1="110" x2="180" y2="30" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
                <text x="60" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.25</text>
                <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.5</text>
                <text x="140" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.75</text>
                <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">1.0</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">sin(θ₂)</text>
              </svg>
            ) : isIdealGas ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">400</text>
                <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">300</text>
                <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">200</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">100</text>
                <line x1="20" y1="110" x2="180" y2="25" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
                <text x="60" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">100</text>
                <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">200</text>
                <text x="140" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">300</text>
                <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">400</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">อุณหภูมิ (K)</text>
              </svg>
            ) : isNewtonsSecond ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">4.0</text>
                <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">3.0</text>
                <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">2.0</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">1.0</text>
                <line x1="20" y1="110" x2="180" y2="35" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
                <text x="60" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.1</text>
                <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.2</text>
                <text x="140" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.3</text>
                <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.4</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">แรง F (N)</text>
              </svg>
            ) : isNewtonsSecond ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">4.0</text>
                <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">3.0</text>
                <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">2.0</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">1.0</text>
                <line x1="20" y1="110" x2="180" y2="35" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
                <text x="60" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.1</text>
                <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.2</text>
                <text x="140" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.3</text>
                <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0.4</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">แรง F (N)</text>
              </svg>
            ) : isMomentum ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">10</text>
                <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">7.5</text>
                <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">5.0</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">2.5</text>
                <line x1="20" y1="110" x2="180" y2="30" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
                <text x="60" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">2.5</text>
                <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">5.0</text>
                <text x="140" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">7.5</text>
                <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">10.0</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">p ก่อนชน</text>
              </svg>
            ) : isFaradaysLaw ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">10V</text>
                <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">5V</text>
                <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">0V</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">-5V</text>
                <path d="M20,73 C40,43 60,103 100,73 C140,43 160,103 180,73" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
                <text x="60" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">2</text>
                <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">4</text>
                <text x="140" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">6</text>
                <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">8s</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">เวลา</text>
              </svg>
            ) : isBernoulli ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">300</text>
                <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">200</text>
                <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">100</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">50</text>
                <path d="M20,30 L80,30 L100,75 L120,75 L140,30 L180,30" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">ท่อเข้า</text>
                <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">คอคอด</text>
                <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">ท่อออก</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">P(kPa)</text>
              </svg>
            ) : isPhotoelectric ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">3.0eV</text>
                <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">2.0</text>
                <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">1.0</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">0.0</text>
                <line x1="60" y1="110" x2="180" y2="20" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">f₀</text>
                <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">6.0</text>
                <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">10.0</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">f(10¹⁴Hz)</text>
              </svg>
            ) : isKepler ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">120</text>
                <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">80</text>
                <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">40</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">10</text>
                <line x1="20" y1="110" x2="180" y2="20" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
                <text x="60" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">40</text>
                <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">80</text>
                <text x="140" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">120</text>
                <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">160</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">a³(AU³)</text>
              </svg>
            ) : isStefanBoltzmann ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="70" x2="190" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">1.2e8</text>
                <text x="18" y="48" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">8.0e7</text>
                <text x="18" y="73" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">4.0e7</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">1.0e7</text>
                <line x1="20" y1="110" x2="180" y2="20" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="110" x2="190" y2="110" stroke="#cbd5e1" strokeWidth="1" />
                <text x="20" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">0</text>
                <text x="60" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">5.0e14</text>
                <text x="100" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">1.0e15</text>
                <text x="140" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">1.5e15</text>
                <text x="180" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">2.0e15</text>
                <text x="195" y="118" fill="#94a3b8" fontSize="7" fontWeight="bold">T⁴(K⁴)</text>
              </svg>
            ) : isLeChateliers ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="20" x2="20" y2="104" stroke="#cbd5e1" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">ความเข้มข้น</text>
                <path d="M20,60 H80 L80,90 Q120,70 180,70" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <line x1="80" y1="20" x2="80" y2="95" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" />
                <text x="84" y="25" fill="#3b82f6" fontSize="7" fontWeight="bold">รบกวนระบบ</text>
                <text x="190" y="108" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">เวลา (s)</text>
              </svg>
            ) : isBeerLambert ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="20" x2="20" y2="104" stroke="#cbd5e1" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">ดูดกลืนแสง A</text>
                <line x1="20" y1="95" x2="180" y2="25" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="60" cy="77" r="3.5" fill="#3b82f6" />
                <circle cx="100" cy="60" r="3.5" fill="#3b82f6" />
                <circle cx="140" cy="42" r="3.5" fill="#3b82f6" />
                <text x="190" y="108" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">ความเข้มข้น c</text>
              </svg>
            ) : isHesssLaw ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="10" x2="20" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                <text x="18" y="15" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">พลังงาน H</text>
                <line x1="30" y1="25" x2="100" y2="25" stroke="#475569" strokeWidth="3" />
                <text x="35" y="20" fill="#475569" fontSize="8" fontWeight="bold">NaOH(s) + HCl(aq)</text>
                <path d="M60 25 V85" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                <path d="M57 78 L60 85 L63 78" stroke="#ef4444" strokeWidth="2" fill="none" />
                <text x="64" y="55" fill="#ef4444" fontSize="8" fontWeight="bold">ΔH1 (โดยตรง)</text>
                <line x1="110" y1="45" x2="185" y2="45" stroke="#475569" strokeWidth="3" />
                <text x="115" y="40" fill="#475569" fontSize="8" fontWeight="800">NaOH(aq) + HCl(aq)</text>
                <path d="M98 25 H140 V45" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M137 38 L140 45 L143 38" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
                <text x="144" y="32" fill="#3b82f6" fontSize="7" fontWeight="bold">ΔH2 (ละลาย)</text>
                <path d="M150 45 V85" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M147 78 L150 85 L153 78" stroke="#10b981" strokeWidth="1.5" fill="none" />
                <text x="154" y="65" fill="#10b981" fontSize="7" fontWeight="bold">ΔH3 (สะเทิน)</text>
                <line x1="30" y1="85" x2="185" y2="85" stroke="#475569" strokeWidth="3" />
                <text x="35" y="94" fill="#475569" fontSize="8" fontWeight="bold">NaCl(aq) + H2O(l)</text>
              </svg>
            ) : isGalvanicCell ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="20" x2="20" y2="104" stroke="#cbd5e1" strokeWidth="1" />
                <text x="18" y="24" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">1.10V</text>
                <text x="18" y="58" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">0.90V</text>
                <text x="18" y="98" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">0.70V</text>
                <path d="M28,24 C55,28 76,38 101,52 C129,68 153,80 180,88" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <line x1="28" y1="24" x2="180" y2="24" stroke="#10b981" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
                <text x="184" y="27" fill="#10b981" fontSize="7" fontWeight="bold">E°</text>
                <text x="190" y="108" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">Q</text>
              </svg>
            ) : isChemicalKinetics ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="20" x2="20" y2="104" stroke="#cbd5e1" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">rate</text>
                <path d="M25,90 C55,82 80,68 108,48 C134,30 158,22 182,20" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M25,90 C60,88 88,78 122,60 C148,46 166,40 182,37" stroke="#8b5cf6" strokeWidth="1.8" strokeDasharray="4 3" fill="none" />
                <text x="136" y="25" fill="#f97316" fontSize="7" fontWeight="bold">อุณหภูมิสูง</text>
                <text x="190" y="108" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">[A]</text>
              </svg>
            ) : isSolubilityProduct ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="20" x2="20" y2="104" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="24" y1="56" x2="184" y2="56" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5 4" />
                <text x="188" y="59" fill="#8b5cf6" fontSize="7" fontWeight="bold">Ksp</text>
                <path d="M28,88 C58,82 78,72 100,61 C122,50 148,36 180,25" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <circle cx="111" cy="56" r="4" fill="#f43f5e" />
                <text x="115" y="47" fill="#f43f5e" fontSize="7" fontWeight="bold">เริ่มตกตะกอน</text>
                <text x="190" y="108" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">Qsp</text>
              </svg>
            ) : isAvogadrosLaw ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="20" x2="20" y2="104" stroke="#cbd5e1" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">V(L)</text>
                <line x1="28" y1="90" x2="180" y2="24" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                {[0, 1, 2, 3].map((index) => (
                  <circle key={index} cx={38 + index * 43} cy={86 - index * 19} r="3.5" fill="#06b6d4" />
                ))}
                <text x="104" y="44" fill="#2563eb" fontSize="7" fontWeight="bold">Vm ≈ 22.4 L/mol</text>
                <text x="190" y="108" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">n(mol)</text>
              </svg>
            ) : isElectrolysis ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="20" x2="20" y2="104" stroke="#cbd5e1" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">m(g)</text>
                <line x1="28" y1="92" x2="180" y2="26" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M58,78 L58,95M108,56 L108,95M158,36 L158,95" stroke="#c4b5fd" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="118" y="30" fill="#7c3aed" fontSize="7" fontWeight="bold">m ∝ It</text>
                <text x="190" y="108" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">Q(C)</text>
              </svg>
            ) : isColligative ? (
              <svg className="w-full max-w-[240px] h-36" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="20" y1="95" x2="190" y2="95" stroke="#cbd5e1" strokeWidth="1" />
                <line x1="20" y1="20" x2="20" y2="104" stroke="#cbd5e1" strokeWidth="1" />
                <text x="18" y="23" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">ΔT</text>
                <line x1="28" y1="92" x2="180" y2="28" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="28" y1="92" x2="180" y2="48" stroke="#f97316" strokeWidth="1.8" strokeDasharray="4 3" strokeLinecap="round" />
                <text x="142" y="31" fill="#06b6d4" fontSize="7" fontWeight="bold">i สูง</text>
                <text x="190" y="108" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="end">molality</text>
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
