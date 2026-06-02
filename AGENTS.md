<!-- BEGIN:scisiam-agent-rules -->
# SciSiam Agent Guidelines

คู่มือการทำงานสำหรับ agent ที่เข้ามาแก้ไขโปรเจกต์ **SciSiam Virtual Lab** ให้สอดคล้องกับเป้าหมายของโปรเจกต์: เว็บและแอปทดลองวิทยาศาสตร์สำหรับส่งแข่งขัน พร้อมต่อยอดเป็น PC/mobile app ที่ผู้ใช้ดาวน์โหลดไปใช้งานได้จริง

---

## 1. Project Identity

SciSiam เป็น virtual science lab สำหรับนักเรียนไทย มีจุดขายหลักคือ:

- รายชื่อห้องแล็บ 36 ห้อง แบ่งเป็น Physics, Chemistry, Biology
- หน้า detail ของแต่ละ lab ที่อธิบายวัตถุประสงค์ อุปกรณ์ ทฤษฎี และขั้นตอน
- หน้า simulation ที่ผู้ใช้ปรับตัวแปร ทดลอง ดูผล กราฟ ตาราง และสรุปผล
- SciSiam AI Tutor สำหรับถามตอบเรื่องวิทยาศาสตร์และบริบทของ lab
- ระบบคะแนน ความคืบหน้า และโปรไฟล์เพื่อเพิ่มแรงจูงใจ
- เป้าหมายระยะถัดไปคือ deploy web demo และ package เป็น PC/mobile app

เมื่อแก้โค้ด ให้คิดเสมอว่าโปรเจกต์นี้เป็น **competition-ready educational product** ไม่ใช่หน้า demo แบบชั่วคราว

---

## 2. Technology Stack

- **Framework**: Next.js 16.2.6 App Router
- **React**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 ผ่าน `src/app/globals.css` และ CSS variables
- **Icons**: `lucide-react`
- **AI API**: server route `src/app/api/ai-tutor/route.ts`
- **Data source**: `src/data/labs.ts` เป็น source of truth ของรายการ lab
- **State persistence**: localStorage ใช้ได้เฉพาะข้อมูล local/prototype เช่น saved experiment, UI state, temporary progress

ห้ามเพิ่ม framework หรือ dependency ใหญ่โดยไม่จำเป็น ถ้าต้องเพิ่มให้มีเหตุผลชัดเจนว่าช่วยลดความซับซ้อนหรือจำเป็นกับ target PC/mobile/deploy จริง

---

## 3. Repository Map

- `src/app/page.tsx`: หน้าแรก รายชื่อห้องแล็บ ค้นหา filter และ entry point
- `src/app/labs/[id]/page.tsx`: หน้า detail ของ lab
- `src/app/labs/[id]/simulation/page.tsx`: route เลือก simulation ตาม `labId`
- `src/components/labs/*`: components สำหรับ detail page
- `src/components/labs/simulation/*`: simulation components และ shared simulation UI
- `src/components/AIChatButton.tsx`: floating AI tutor UI
- `src/app/api/ai-tutor/route.ts`: backend route สำหรับเรียก AI provider
- `src/data/labs.ts`: ข้อมูล metadata ของ lab ทั้งหมด
- `src/context/SidebarContext.tsx`: layout/sidebar state

ก่อนแก้ feature ให้หา component/shared data เดิมก่อนเสมอ หลีกเลี่ยงการ copy/paste lab ใหม่แบบกระจัดกระจาย

---

## 4. Lab Content Rules

โปรเจกต์มี 36 labs ใน `labsData` ดังนั้นห้ามปล่อยให้ lab ที่ผู้ใช้กดเข้าไปแสดงเนื้อหาผิดหัวข้อ

- ห้าม fallback lab อื่นเป็น Newton cooling โดยไม่มีการบอกผู้ใช้
- ถ้า simulation ยังไม่สมบูรณ์ ให้ใช้ placeholder ที่ตรงกับชื่อ lab นั้น หรือปิดปุ่มเข้าห้องพร้อมสถานะชัดเจน
- หน้า detail, equipment, theory, steps, hero image และ simulation ต้องใช้ชื่อ วัตถุประสงค์ อุปกรณ์ และภาพที่สอดคล้องกับ lab
- ควรใช้ shared template/data-driven structure สำหรับ lab จำนวนมาก แทนการเขียน `if/else` ยาวขึ้นเรื่อย ๆ
- เมื่อเพิ่ม lab ใหม่ ให้ตรวจทั้ง 2 route:
  - `/labs/[id]`
  - `/labs/[id]/simulation`

ถ้าแก้ route selector ใน `src/app/labs/[id]/simulation/page.tsx` ต้องตรวจว่า unsupported lab ไม่ถูกส่งไป simulation ผิดประเภท

---

## 5. Simulation Logic Standards

Simulation ต้องตอบสนองดี ไม่กระตุก และไม่ re-render ถี่เกินไป

- เก็บตัวแปรฟิสิกส์/เคมี/ชีวะที่เปลี่ยนต่อเนื่องใน `useRef` เช่น temperature, pH, pressure, volume, CO2, elapsed time
- ใช้ React state เฉพาะค่าที่ต้องแสดงบน UI และ throttle/update เป็นรอบที่เหมาะสม
- ล้าง `setInterval`, `requestAnimationFrame`, timeout และ listener ใน cleanup ของ `useEffect` เสมอ
- ใช้ `useMemo` สำหรับคำนวณกราฟ, table rows, derived metrics, SVG path หรือ canvas coordinates
- จำกัด history array ไม่ให้โตไม่สิ้นสุด
- Controls ควรมี reset, start/pause, save/log data และ feedback ที่ชัดเจน
- ทุก simulation ควรมีอย่างน้อย: objective, apparatus/viewport, controls, live values, graph/table, theory/formula, steps/progress

สำหรับ shared simulation shell ให้แก้กลางก่อนเพิ่ม UI ซ้ำในแต่ละ lab

---

## 6. AI Tutor And API Security

AI Tutor เป็น feature สำคัญ แต่ต้องปลอดภัยสำหรับ web, PC และ mobile

- ห้ามฝัง API key ใน client component, Electron/Tauri/Capacitor app, `main.js`, public assets หรือไฟล์ใด ๆ ที่จะถูกส่งให้ผู้ใช้
- ใช้ `GEMINI_API_KEY` เฉพาะฝั่ง server runtime เท่านั้น เช่น `.env.local` ในเครื่อง dev หรือ Environment Variables บน hosting
- `.env.local` ห้าม commit ขึ้น GitHub
- `.env.example` ใส่ได้เฉพาะ placeholder ไม่มี key จริง
- ฝั่ง client ให้เรียก API กลาง เช่น `/api/ai-tutor` หรือ production URL ของ SciSiam backend
- API route ต้องมี input validation, message length limit, max history, timeout, error handling และ rate limit
- หลีกเลี่ยงส่ง key ผ่าน query string ให้ใช้ header หรือ server SDK ที่เหมาะสม
- ข้อความของ AI ต้องบอกได้ว่าอาจผิดพลาด และควรผูกกับบริบท lab ปัจจุบันเมื่อมี `labId`

ถ้าทำ PC/mobile app ให้ถือว่าตัว app ถูกแกะไฟล์ได้เสมอ ดังนั้น app ต้องไม่มี secret ใด ๆ

---

## 7. localStorage And Progress Data

localStorage ใช้ได้กับ prototype หรือ offline convenience แต่ไม่ควรใช้เป็นแหล่งความจริงสำหรับคะแนนจริง

- อ่าน `window`, `document`, `localStorage` เฉพาะหลัง mount ผ่าน `useEffect`
- ป้องกัน hydration mismatch ใน Next.js App Router
- อย่าให้ผู้ใช้เพิ่มคะแนนซ้ำได้ง่ายจากการกด save เดิมหลายรอบ
- ถ้าข้อมูลสำคัญ เช่น score, completed labs, profile, classroom progress ต้องเตรียมทางย้ายไป backend/database
- หน้า Profile ต้องไม่ใช้ mock data ถ้าแสดงเป็นข้อมูลจริงของผู้ใช้

ถ้ายังเป็น mock ต้องตั้งชื่อ/คอมเมนต์ให้ชัดว่าเป็น placeholder และไม่ควรส่งเป็น production state

---

## 8. UI, UX, And Thai Typography

SciSiam ควรรู้สึกเหมือน lab learning dashboard ที่สะอาด ใช้งานง่าย และเหมาะกับนักเรียนไทย

- หน้าแรกต้องเน้นค้นหา lab, category filter และ lab cards ที่สแกนง่าย
- หน้า detail ต้องให้ข้อมูลครบแต่ไม่รก แยก hierarchy ชัดเจน
- หน้า simulation ต้องให้พื้นที่ทดลองเป็นพระเอก controls และ sidebar ต้องไม่บัง flow
- หลีกเลี่ยง card ซ้อน card และ decoration ที่ไม่มีหน้าที่
- ใช้ icon จาก `lucide-react` เมื่อมี icon ที่เหมาะสม
- ปุ่มต้องมีสถานะ hover, disabled, loading เมื่อเกี่ยวข้อง
- Floating UI เช่น AI Tutor ต้องไม่ทับปุ่มสำคัญบนมือถือ
- ทดสอบ responsive อย่างน้อย mobile 390px, tablet และ desktop

ภาษาไทย:

- ใช้ `leading-relaxed` หรือ `leading-[1.6]` สำหรับข้อความไทย
- หลีกเลี่ยง `tracking-tight` และ `tracking-tighter` กับข้อความไทย
- ใช้ `break-words` หรือ `[word-break:keep-all]` ในกล่องข้อความที่อาจยาว
- หลีกเลี่ยง `text-justify` ในย่อหน้าภาษาไทยสั้น ๆ
- ฟอนต์หลักควรสอดคล้องกับ `Prompt` และ `Inter` ตามธีมใน `globals.css`

---

## 9. Performance And React/Next.js Rules

- ใช้ Server Components เป็นค่า default เมื่อไม่ต้องใช้ interaction
- ใส่ `"use client"` เฉพาะ component ที่ต้องใช้ state, effect, event handler หรือ browser API
- หลีกเลี่ยง prop drilling ยาว ถ้ามี shared layout state ให้ใช้ context เฉพาะจุด
- อย่าสร้าง object/array/function ใหม่ใน render แล้วส่งลง component หนักโดยไม่จำเป็น
- ใช้ `next/image` เมื่อแสดงรูป bitmap ใน app และกำหนด alt text ที่สื่อความหมาย
- Dynamic route ต้อง handle missing lab id อย่างปลอดภัย
- อย่าทำงานหนักใน render path ของ simulation
- หลีกเลี่ยงการ import library ขนาดใหญ่เพื่อแก้ปัญหาเล็ก ๆ

เมื่อแก้ performance ให้ยืนยันด้วย lint/build และ browser QA ไม่ใช่แค่ดูโค้ด

---

## 10. Deployment And Packaging Readiness

เป้าหมายคือให้ใช้งานได้หลาย target:

- **Web demo**: deploy ขึ้น hosting เช่น Vercel หรือ server ที่รองรับ Next.js route handlers
- **PC app**: Electron หรือ Tauri โดย app ต้องไม่มี API key ฝังอยู่
- **Mobile app**: Capacitor/PWA หรือทางเลือก native ภายหลัง โดยเรียก AI ผ่าน backend กลาง

ข้อควรระวัง:

- ถ้าใช้ static export จะใช้ API route ในตัวไม่ได้ ต้องแยก backend
- ไฟล์ build artifacts เช่น `.next`, `dist`, screenshot QA และ local package output ไม่ควร commit
- ก่อน deploy ให้ตรวจ `npm run lint`, `npm run build`, secret scan และ dependency audit
- Production AI rate limit แบบ in-memory ไม่พอสำหรับ multi-instance ควรใช้ Redis/Upstash/database เมื่อ deploy จริง

---

## 11. Security Checklist

ก่อน commit หรือ push:

- สแกน secret pattern เช่น `AIza`, `sk-`, `sk-proj`, `GEMINI_API_KEY =`, private tokens
- ห้าม commit `.env.local`, `.env`, private keys, build output หรือ screenshots ที่มีข้อมูลลับ
- API route ต้อง validate input และ handle invalid JSON
- อย่า log API key, request headers ที่มี secret หรือ provider response ที่มีข้อมูล sensitive
- ถ้า key เคยหลุด ให้ถือว่าต้อง revoke/rotate key แล้วเท่านั้น
- AI endpoint ต้องมี rate limit และ max output/token budget ที่เหมาะสม

คำสั่งแนะนำ:

```powershell
rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\\s*="
```

---

## 12. Verification Checklist

หลังแก้โค้ดทุกครั้ง ให้รันตามความเหมาะสม:

```powershell
npm run lint
npm run build
```

สำหรับ UI ให้เปิด browser ตรวจหน้าอย่างน้อย:

- `/`
- `/labs/newtons-cooling`
- `/labs/newtons-cooling/simulation`
- lab ที่เพิ่งแก้ detail route
- lab ที่เพิ่งแก้ simulation route
- `/profile` ถ้าแตะคะแนน/progress/localStorage

ให้ตรวจ console error, hydration warning, layout overflow, mobile width 390px และ interaction หลัก เช่น search, filter, enter lab, save result, AI tutor

---

## 13. Git Hygiene

- อย่า revert งานของผู้ใช้โดยไม่ขออนุญาต
- ถ้า working tree dirty ให้แยกให้ออกว่าไฟล์ใดเป็นของงานนี้และไฟล์ใดมีอยู่ก่อน
- อย่า commit build output หรือไฟล์ local
- ถ้าแก้ `package-lock.json` ต้องแน่ใจว่าเกิดจาก dependency change ที่ตั้งใจ
- ก่อนส่งงานให้สรุปไฟล์ที่แก้ คำสั่งที่รัน และ warning ที่ยังเหลือ

---

## 14. Current Priority Backlog

ถ้าไม่มีคำสั่งเฉพาะ ให้จัดลำดับงานสำคัญของ SciSiam ตามนี้:

1. แก้ lab fallback ผิดหัวข้อและทำให้ทั้ง 36 labs มี detail/simulation state ที่ตรงชื่อ
2. ทำ shared lab detail/simulation data model เพื่อลด copy/paste
3. ทำ AI Tutor ให้พร้อม deploy ผ่าน backend กลางและ rate limit ที่เหมาะกับ production
4. ทำ Profile/คะแนน/ความคืบหน้าให้สัมพันธ์กับข้อมูลจริง ไม่ใช่ mock
5. แก้ save flow ของแต่ละ simulation ให้ครบ
6. ปรับ responsive/mobile QA โดยเฉพาะ floating AI และ navigation
7. เตรียม packaging strategy สำหรับ web, PC และ mobile

<!-- END:scisiam-agent-rules -->
