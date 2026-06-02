---
title: AI Tutor Policy
tags:
  - scisiam
  - ai
  - security
---

# AI Tutor Policy

SciSiam AI Tutor ช่วยตอบคำถามวิทยาศาสตร์และอธิบายบริบท lab แต่ต้องไม่ทำให้โปรเจกต์เสี่ยงเรื่อง API key, quota, หรือความถูกต้องทางการศึกษา

## Security Rules

- ห้ามฝัง API key ใน client code
- ห้ามฝัง API key ใน PC/mobile package
- ใช้ `.env.local` เฉพาะ dev
- Production ต้องใช้ Environment Variables บน server/hosting
- Client เรียก backend route เท่านั้น

## Current API Route

- Route: `src/app/api/ai-tutor/route.ts`
- Env: `GEMINI_API_KEY`
- Optional env: `GEMINI_MODEL`
- Default model: `gemini-2.5-flash`

## Required Guards

- Input validation
- Message length limit
- Max history
- Timeout
- Rate limit
- Safe error messages
- No key in query string

## Tutor Behavior

AI Tutor should:

- ตอบภาษาไทย
- อธิบายเป็นขั้นตอน
- ผูกคำตอบกับ lab ปัจจุบันเมื่อมี `labId`
- แสดงสูตร ตัวแปร หน่วย เมื่อถามคำนวณ
- ไม่อ้างว่ามีข้อมูลจริงที่ระบบไม่ได้ให้
- เตือนว่า AI อาจผิดพลาด

## PC/Mobile Rule

PC/mobile app ต้องเรียก production backend เช่น:

```text
App -> https://scisiam.example.com/api/ai-tutor -> Gemini/OpenAI
```

ตัว app ต้องไม่มี provider key

## Related Notes

- [[04_Deploy_PC_Mobile]]
- [[01_Competition_Readiness]]
- [[AGENTS]]
