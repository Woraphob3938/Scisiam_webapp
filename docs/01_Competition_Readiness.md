---
title: Competition Readiness
tags:
  - scisiam
  - competition
  - readiness
---

# Competition Readiness

ใช้ note นี้เป็น checklist ก่อนส่งงานหรือก่อนให้กรรมการทดลองใช้

## Must Fix Before Judging

- Lab ที่ยังไม่ implement ต้องไม่ fallback เป็น Newton cooling แบบผิดหัวข้อ
- AI key ต้องไม่อยู่ใน client, package app, public assets, หรือ git history ใหม่
- หน้า Profile ต้องไม่แสดง mock data เป็นข้อมูลจริง
- Simulation หลักต้องบันทึกผล/รีเซ็ต/เริ่มหยุดได้ครบ
- Mobile UI ต้องไม่มีปุ่ม AI ทับ action หลัก

## Demo Flow To Prepare

1. เปิดหน้าแรกและค้นหา lab
2. เปิด Newton cooling detail
3. เข้า simulation และปรับค่า
4. เปิด AI Tutor ถามเรื่องกราฟ/สูตร
5. เปิด Chemistry lab อย่าง Acid-Base Titration
6. เปิด Biology lab อย่าง Mendelian Genetics หรือ Mitosis
7. เปิด Profile เพื่อโชว์ความคืบหน้า

## Technical Checks

```powershell
npm run lint
npm run build
npm audit --omit=dev
rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\\s*="
```

## UI Checks

- Desktop 1440px
- Tablet 768px
- Mobile 390px
- Console has no errors
- No horizontal scroll
- Thai text does not overlap or clip
- Buttons have visible loading/disabled/focus states

## Related Notes

- [[05_Backlog]]
- [[03_AI_Tutor_Policy]]
- [[04_Deploy_PC_Mobile]]
- [[labs/00_Lab_Catalog]]

