---
title: AI Tutor Policy
status: active
---

# AI Tutor Policy

AI ไออุ่นช่วยผู้เรียนอธิบายวิทยาศาสตร์ในบริบทของแล็บ ไม่ใช่ผู้ตัดสินคำตอบหรือแหล่งข้อมูลที่ถูกต้องเสมอ

## Architecture

- Client เรียก src/app/api/ai-tutor/route.ts เท่านั้น
- GEMINI_API_KEY และ GEMINI_MODEL อยู่บน server environment เท่านั้น
- Route ตรวจ Supabase session, จำกัด input/history, ใช้ timeout และ rate limit ตาม verified user id
- labId ต้องผ่านการตรวจสอบกับ labsById ก่อนนำไปสร้าง context

## Guardrails ปัจจุบัน

- ไม่ส่ง provider key ไป client, URL query, log หรือ package PC/mobile
- จำกัด 10 messages, 900 characters ต่อ message และ request body 16 KB
- ยกเลิก provider request หลัง 15 วินาที
- จำกัด 12 requests ต่อ 60 วินาทีผ่าน check_ai_rate_limit RPC โดยมี fallback เพื่อความพร้อมใช้งาน
- telemetry เก็บเฉพาะ latency, จำนวนตัวอักษร, success และ error code ไม่เก็บ prompt, token, header หรือ provider payload

## พฤติกรรมของผู้ช่วย

- ตอบภาษาไทยที่ชัดเจนและเป็นขั้นตอน
- อธิบายสูตร, หน่วย, ตัวแปร และข้อจำกัดของแบบจำลองเมื่อเกี่ยวข้อง
- ยึดตาม lab ปัจจุบันเมื่อระบบส่ง context มาให้
- ไม่แต่งผลทดลองหรืออ้างว่าตรวจสอบข้อมูลภายนอกแล้ว
- บอกผู้เรียนให้ตรวจสอบกับครูหรือแหล่งที่เชื่อถือได้เมื่อคำตอบอาจมีผลต่อความปลอดภัยหรือการตัดสินใจสำคัญ

## Production Checklist

- ตั้ง GEMINI_API_KEY และ optional GEMINI_MODEL ใน hosting environment
- ยืนยันว่า CSP และ image policy ไม่เปิด provider origin เกินจำเป็น
- ตรวจ AI usage events และ rate-limit RPC หลัง deploy
- rotate key ทุกครั้งที่สงสัยว่าอาจรั่ว และอย่าเก็บ key ใน git history ใหม่
