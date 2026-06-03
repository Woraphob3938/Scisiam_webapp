# SciSiam Virtual Lab

SciSiam Virtual Lab เป็นเว็บแอปจำลองการทดลองวิทยาศาสตร์สำหรับนักเรียนไทยและครูไทย สร้างด้วย Next.js App Router เพื่อใช้เป็น competition-ready demo และต่อยอดเป็น web, PC และ mobile learning app ได้ในอนาคต

## ภาพรวม

ผู้ใช้สามารถเลือกห้องแล็บ อ่านวัตถุประสงค์ อุปกรณ์ ทฤษฎี ขั้นตอนการทดลอง เข้าหน้า simulation เพื่อปรับตัวแปร ดูกราฟ/ตาราง บันทึกผล และถาม SciSiam AI Tutor ได้

ฟีเจอร์หลัก:

- รายชื่อ virtual labs แบ่งเป็น Physics, Chemistry และ Biology
- หน้า lab detail สำหรับ objective, equipment, theory และ experiment steps
- หน้า simulation แยกตาม `labId` พร้อม placeholder สำหรับ lab ที่ยังไม่พร้อม
- SciSiam AI Tutor ผ่าน server route `/api/ai-tutor`
- Profile, missions, points และ progress flow ที่เริ่มเชื่อมกับ Supabase
- Responsive UI สำหรับ desktop/tablet/mobile

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- lucide-react
- Supabase SSR / Supabase JS
- Gemini API สำหรับ AI Tutor

## โครงสร้างสำคัญ

```text
src/app/page.tsx                         # หน้าแรกและรายการห้องแล็บ
src/app/labs/[id]/page.tsx               # หน้า detail ของ lab
src/app/labs/[id]/simulation/page.tsx    # route เลือก simulation ตาม labId
src/app/api/ai-tutor/route.ts            # backend route สำหรับ SciSiam AI Tutor
src/components/                          # shared UI components
src/components/labs/                     # lab detail components
src/components/labs/simulation/          # simulation components
src/data/labs.ts                         # source of truth รายชื่อ lab
src/data/labDetails.ts                   # detail content ของ lab
src/data/labReadiness.ts                 # readiness labels/helpers
src/data/labSimulationRegistry.ts        # registry ของ simulation ที่พร้อมใช้งาน
src/lib/supabase/                        # Supabase clients, auth/progress helpers, types
supabase/migrations/                     # database migrations/RPCs
supabase/seed.sql                        # mission seed data
tests/scisiam-regressions.test.mjs       # regression tests
```

เอกสาร product เพิ่มเติมอยู่ใน `docs/`, `PRODUCT.md`, `DESIGN.md` และ `AGENTS.md`

## การติดตั้ง

```bash
npm install
```

สร้างไฟล์ `.env.local` จาก `.env.example` แล้วตั้งค่าตาม environment จริง:

```bash
cp .env.example .env.local
```

ค่าที่ใช้:

```env
GEMINI_API_KEY=replace_with_your_server_side_gemini_key
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_SUPABASE_URL=replace_with_your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=replace_with_your_supabase_publishable_key
```

> ห้ามใส่ secret/API key ใน client component, public assets หรือไฟล์ที่จะ commit ขึ้น repo

## การรันในเครื่อง

```bash
npm run dev
```

เปิดเว็บที่:

```text
http://localhost:3000
```

## คำสั่งตรวจคุณภาพ

```bash
npm test
npm run lint
npm run build
```

ถ้าต้องการให้ lint fail เมื่อมี warning:

```bash
npm run lint -- --max-warnings=0
```

## Routes ที่ควรตรวจตอน QA

- `/`
- `/labs/newtons-cooling`
- `/labs/newtons-cooling/simulation`
- `/missions`
- `/profile`
- `/login`
- `/register`

ควรตรวจ responsive อย่างน้อยที่ mobile width ประมาณ 390px และดู browser console ว่าไม่มี hydration/layout errors

## Supabase

โปรเจกต์มี migration สำหรับ missions, profile progress และ AI rate limit ใน `supabase/migrations/` รวมถึง seed data สำหรับ mission definitions ใน `supabase/seed.sql`

ก่อนใช้ Supabase จริงให้ตรวจว่า environment variables ถูกต้องและ database migration ถูก apply แล้ว

## AI Tutor Security Notes

- `GEMINI_API_KEY` ใช้เฉพาะ server-side route `/api/ai-tutor`
- client เรียกผ่าน API route กลางเท่านั้น
- route มี input validation, message length limit, timeout และ rate limit
- ถ้า deploy แบบ multi-instance ควรใช้ durable rate limit ผ่าน database/Redis แทน in-memory fallback

## Git Hygiene

ไม่ควร commit local/generated artifacts เช่น:

- `.next/`
- `dist/`
- `node_modules/`
- `.playwright-cli/`
- `qa-screenshots/`
- `File/`
- `.agents/`
- `.impeccable/`
- `.env.local`

ก่อนส่งงานควรรัน `npm test`, `npm run lint -- --max-warnings=0` และ `npm run build` ให้ผ่านทั้งหมด
