---
title: SciSiam Product Roadmap
status: active
---

# SciSiam Product Roadmap

เอกสารนี้เป็น roadmap ระดับผลิตภัณฑ์ ไม่ใช่ task tracker รายวัน รายการเชิงวิศวกรรมที่มีลำดับความสำคัญล่าสุดอยู่ใน AGENTS.md

## Now: Reliability And Classroom Trust

- ทำให้ profile, teacher dashboard, classroom และ notification แสดงเฉพาะข้อมูล Supabase ที่ผู้ใช้มีสิทธิ์เห็น
- ปิด flow ที่ยังพา session กลับ login หรือแสดง error แบบไม่ช่วยผู้ใช้แก้ปัญหา
- ตรวจ permission ของ assignment, submission และ file storage ด้วย migration, RLS/RPC และ browser QA
- รักษา 103 แล็บให้ metadata, detail, route, simulation และ save key สอดคล้องกัน

## Next: Learning Quality And Accessibility

- ยกระดับ simulation ที่ใช้ shared engine ให้ภาพ, ตัวแปร, ทฤษฎี และผลลัพธ์เฉพาะหัวข้อชัดเจน
- ตรวจ mobile 390px, keyboard navigation, contrast, reduced motion และ screen-reader labels ใน flow หลัก
- เพิ่ม regression/browser QA สำหรับ auth, classroom, notification, save flow และ wrong-lab routing

## Later: Production Operations And Packaging

- เปิด leaked-password protection และตรวจ SMTP/redirect URL สำหรับ production auth
- เปลี่ยน rate-limit fallback ที่อยู่ใน memory เป็น durable store สำหรับ deployment หลาย instance
- ตัดสินใจ packaging ระหว่าง Electron/Tauri สำหรับ PC และ PWA/Capacitor สำหรับ mobile
- วาง observability, backup, incident response และ deployment checklist ก่อนเปิดใช้จริง

## Decision Rules

- ความถูกต้องและสิทธิ์ของข้อมูลมาก่อน UI ที่หวือหวา
- ไม่เพิ่ม dependency ใหญ่ถ้า shared component หรือ data model เดิมแก้ปัญหาได้
- ทุก feature ที่กระทบข้อมูลผู้ใช้ต้องมี migration, RLS/RPC review และ regression coverage
