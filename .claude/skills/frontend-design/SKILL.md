---
name: frontend-design
description: Execute UI design workflow to create premium, non-generic frontend layouts. Enforces aesthetic style planning, responsive checks, typography standards, and micro-interactions before coding. Triggered by typing /frontend-design.
---
# Frontend Design - Premium UI/UX Architect (สกิลสถาปัตยกรรมดีไซน์ส่วนหน้าพรีเมียม)

เมื่อทักษะนี้เปิดใช้งาน (พิมพ์ `/frontend-design` หรือเมื่อทำงานปรับปรุง UI/UX):

1. **ขั้นตอนการวางแผนดีไซน์ (Design Planning Loop - ห้ามเขียนโค้ดทันที)**:
   - รวบรวมข้อมูลธีมหลักและภาพรวมหน้าจอก่อนลงมือ โดยวิเคราะห์ร่วมกับเอกสารคุมดีไซน์ `DESIGN.md`
   - กำหนดทิศทางภาพลักษณ์ (Aesthetic Theme) ให้ชัดเจน: *เช่น Glassmorphic (กระจกฝ้าสะท้อนแสง), Editorial Minimal (เน้นตัวหนังสือพรีเมียมแบบนิตยสาร), หรือ Cyberpunk Sci-Fi*
   - ห้ามใช้สีคู่ตรงข้ามพื้นฐาน (เช่น แดงสด น้ำเงินสด เขียวสด) ให้ใช้สีโทนหรูหราผ่าน HSL/HEX ที่กำหนดในธีมหลักของ SciSiam

2. **การวางโครงสร้างและมิติเชิงซ้อน (Layout & Spatial Composition)**:
   - **มิติระดับความลึก (Depth & Elevation)**: ผสมผสานเงา (`box-shadow`), การ์ดแก้วกึ่งโปร่งแสง (`backdrop-filter: blur()`), และกล่องแสงเรืองสีมุก (Glow spot) ในพื้นหลังเพื่อสร้างความหรูหราลอยตัว
   - **ความยืดหยุ่นของสัดส่วนหน้าจอ (Responsive Grid & Flex)**: 
     - ออกแบบการ์ดและเลย์เอาต์ให้รองรับขนาดหน้าจอแบบยืดหยุ่น ทั้ง Mobile และ Desktop (ใช้ `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` เป็นต้น)
     - ระมัดระวังข้อความล้นกรอบเมื่อขนาดหน้าจอเปลี่ยน

3. **กฎฟอนต์และช่องไฟภาษาไทย (Typography & Spatial Rules)**:
   - สำหรับภาษาไทย ต้องตั้งค่าระยะบรรทัด `leading-relaxed` (lineHeight 1.5-1.7) เสมอเพื่อไม่ให้สระและวรรณยุกต์ซ้อนชนกัน
   - ปิดคลาสจัดช่องไฟที่หนาแน่นเกินไปสำหรับอักษรไทย (เช่น `tracking-tight` หรือ `tracking-tighter` ให้ใช้เฉพาะภาษาอังกฤษ)
   - ใช้คลาสตัดคำ `break-words` และ `break-keep` ร่วมกันบนกล่องพารากราฟ

4. **การโต้ตอบที่ลื่นไหล (Micro-Interactions & Transitions)**:
   - ปรับแต่งปุ่มและไอคอนให้ตอบสนองทันทีเมื่อชี้เมาส์ (Hover) ด้วยเอฟเฟกต์นุ่มนวล:
     * เช่น `transition-all duration-200 ease-in-out`
     * เปลี่ยนแปลงระดับสเกลเล็กน้อยตอนชี้เมาส์: `hover:scale-[1.02] active:scale-[0.98]`
     * เพิ่มความเรืองแสง: `hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]`
