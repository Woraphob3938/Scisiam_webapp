<!-- BEGIN:nextjs-agent-rules -->
# SciSiam Web Application - Guidelines & Coding Standards

คู่มือระเบียบและทักษะการเขียนโค้ดสำหรับโปรเจ็กต์เว็บแอปพลิเคชัน **SciSiam** (Next.js 16.2.6 & React 19)

---

## 1. Technology Stack & API Versions
* **Framework**: Next.js 16.2.6 (App Router) ด้วย React 19
  > [!WARNING]
  > Next.js 16 และ React 19 อาจมี APIs หรือพฤติกรรมบางประการที่ต่างจากเวอร์ชันเก่า (เช่น สถาปัตยกรรม Server vs Client Components, API metadata) โปรดศึกษาไกด์ไลน์จาก `node_modules/next/dist/docs/` และสังเกต Deprecation warning ก่อนเขียนโค้ด
* **Styling**: Tailwind CSS v4 พร้อม `@tailwindcss/postcss` 
  * ใน Tailwind v4 ไม่มีการใช้ `tailwind.config.js` อีกต่อไป การตั้งค่าธีม คีย์เฟรม อนิเมชั่น และฟอนต์ จะทำผ่าน `@theme` และ CSS Variables ใน [globals.css](file:///d:/Scisiam_app/src/app/globals.css) โดยตรง
* **Icons**: `lucide-react`
* **Charts & Vector**: HTML5 Canvas และ SVG ในตัวบราวเซอร์ (ใช้ standard browser SVG tags เท่านั้น ห้ามเผลอนำเข้า components ของ React Native SVG เข้ามาปะปน)

---

## 2. Core Coding & Simulation Optimization Standards

### A. Telemetry Simulation Updates
* **Rule**: เพื่อลดอาการหน่วง (Input Lag) และป้องกันไม่ให้หน้าจอ Re-render ถี่เกินไป (เช่น 60 ครั้งต่อวินาที) ห้ามนำตัวแปรกายภาพจำลองที่มีการเปลี่ยนแปลงแบบต่อเนื่อง (`waterTemp`, `pHValue`, `carbonDioxide`) ไปผูกเป็น State ที่อัปเดตแบบดิบๆ โดยตรงในลูปคำนวณ
* **วิธีที่ถูกต้อง**:
  * ใช้ React `useRef` ในการเก็บสถานะฟิสิกส์ (Physics variables) และ Interval Timer เสมอ
  * อัปเดตค่าความร้อน อุณหภูมิ และเวลาจำลองภายใน `useRef` แบบ Synchronous ใน Interval จากนั้นจึงส่งค่าอัปเดตที่กรองแล้ว (Flat State) ไปยัง React State เป็นรอบๆ
  * ล้างค่า Interval (`clearInterval`) ทุกครั้งใน Cleanup function ของ `useEffect` เพื่อป้องกันปัญหาหน่วยความจำรั่วไหล (Memory Leak)

### B. High-Performance Web Graphics (60fps)
* **Rule**: หลีกเลี่ยงการคำนวณพิกัดการพล็อตกราฟ (LiveGraph coordinates) หรือเส้น SVG หนักๆ ทุกครั้งที่คอมโพเนนต์หลักทำงาน (เช่น ตอนผู้ใช้กรอกตัวเลขตั้งค่า)
* **วิธีปฏิบัติ**:
  * ครอบคำนวณพิกัดเหล่านั้นไว้ใน `useMemo` เสมอ โดยผูก Dependency ไว้เฉพาะกับอาร์เรย์ประวัติข้อมูลจำลอง (`history` array) เพื่อคงความเสถียรของหน้าจอ 60fps ขณะที่ผู้ใช้พิมพ์ตอบโต้ในฟิลด์อินพุต

### C. Hydration Mismatch Prevention
* **Rule**: หน้าเพจใช้ระบบ Next.js App Router ซึ่งอาจมีการ Render ฝั่ง Server ก่อนส่งมายัง Client 
* **วิธีปฏิบัติ**: หลีกเลี่ยงการเรียกใช้งาน `window`, `document`, หรือการจัดหาค่าสุ่ม/เวลาเรียลไทม์ขณะ Render แรกเริ่ม หากจำเป็นต้องใช้งาน ให้ป้องกัน Hydration mismatch ด้วยหนึ่งในวิธีต่อไปนี้:
  1. ใช้ `useState` และรันโค้ดเรียก `window` / `localStorage` ภายใน `useEffect` หลังคอมโพเนนต์ Mount แล้วเท่านั้น
  2. โหลดคอมโพเนนต์ที่มีผลกระทบแบบ Client-Only แบบ Dynamic:
     ```typescript
     import dynamic from 'next/dynamic';
     const LiveSimulation = dynamic(() => import('./SimulationComponent'), { ssr: false });
     ```

---

## 3. Thai Typography Optimization Skills on Web (เทคนิคอักษรไทยบนเว็บไซต์)

เนื่องจากภาษาไทยมีสระและวรรณยุกต์ลอยตัวอยู่ด้านบนและด้านล่างบรรทัดหลัก การจัดข้อความที่บีบอัดมากเกินไปบนเบราว์เซอร์จะทำให้ตัวอักษรไทยชนกัน หรือแหว่งหายไป ให้ใช้เทคนิคการจัดการอักษรไทยบนเว็บดังต่อไปนี้:

### 1. Comfortable Line Height (สระ/วรรณยุกต์ไม่ชนกัน)
* **Problem**: หากความสูงบรรทัดชิดกันเกินไป สระและโทนเสียงด้านบน (เช่น ิ, ี, ่, ้) จะซ้อนและชนกับหางของอักษรด้านล่าง (เช่น ป, ฝ, ฟ)
* **Skill**: กำหนด `line-height` สำหรับพารากราฟและเนื้อหาข้อความภาษาไทยอยู่ระหว่าง **`1.5` ถึง `1.7`** เสมอ
  * ใน Tailwind CSS v4: ให้เลือกใช้คลาส `leading-relaxed` (1.625) หรือกำหนดคลาสเฉพาะอย่าง `leading-[1.6]` เป็นมาตรฐาน
  ```html
  <p className="text-slate-600 leading-relaxed">...</p>
  ```

### 2. Word Break & Overflow Prevention (การตัดคำและตัดบรรทัดป้องกันคำตกหล่น)
* **Problem**: บราวเซอร์บางรุ่นจะพยายามตัดคำไทยผิดประเภท ส่งผลให้วรรณยุกต์หลุดเดี่ยวไปอยู่อีกบรรทัด หรือข้อความยาวล้นทะลุกล่องเนื้อหา
* **Skill**: 
  * ใช้ `break-words` (`overflow-wrap: break-word`) เป็นฐานบนกล่องพารากราฟเสมอ เพื่อไม่ให้คำภาษาไทยยาวล้นขอบจอ
  * ใช้การตัดคำสไตล์ `[word-break:keep-all]` หรือ `break-keep` ร่วมด้วยเมื่อต้องการเกาะกลุ่มคำภาษาไทยไม่ให้ตัวอักษรบางตัวตกบรรทัดอย่างน่าเกลียด
  * **หลีกเลี่ยง**: การใช้ `text-justify` (จัดพอดีขอบซ้าย-ขวา) บนกล่องข้อความภาษาไทยที่มีความยาวน้อย เพราะเบราว์เซอร์จะฉีกตัวอักษรภาษาไทยออกจากกันจนอ่านไม่รู้เรื่อง (เนื่องจากภาษาไทยเขียนติดกันไม่มีเว้นวรรคช่องไฟแบบภาษาอังกฤษ)

### 3. Balanced Letter Spacing (ห้ามใช้ระยะชิด)
* **Problem**: การบีบตัวอักษรให้ชิดเพื่อความแน่นประหยัดพื้นที่แบบตัวอักษรละติน จะทำให้รูปคำภาษาไทยที่มีโครงสร้างหนาซ้อนกันจนไม่สามารถอ่านได้
* **Skill**: 
  * ห้ามใช้คลาสบีบตัวอักษร เช่น `tracking-tight` หรือ `tracking-tighter` กับข้อความภาษาไทย
  * ให้คงค่าปกติ `tracking-normal` หรือใช้ `tracking-wide` (กว้างขึ้นเล็กน้อย) สำหรับการเน้นข้อความหัวข้อขนาดใหญ่ (Header)

### 4. Modern Sans-Serif Font Family (ฟอนต์ดีไซน์โมเดิร์นสะอาดตา)
* **Problem**: ฟอนต์ระบบเริ่มต้น (System Font) ภาษาไทยในคอมพิวเตอร์มักจะมีหัวกลม (Serif) แบบดั้งเดิม ซึ่งดูเก่าและขัดกับสไตล์แดชบอร์ดวิทยาศาสตร์เชิงทดลอง
* **Skill**: ใช้ฟอนต์ **'Prompt'** (Google Fonts) ควบคู่กับ **'Inter'** เป็นหลัก ผ่านการตั้งค่า `font-sans` ใน `@theme`
  * ออกแบบ UI ให้ใช้ฟอนต์ Prompt ไร้หัวดีไซน์พรีเมียม เพื่อให้สอดรับกับตัวเลขสถิติและหน่วยวัดภาษาอังกฤษบนแผงควบคุม Dashboard

<!-- END:nextjs-agent-rules -->
