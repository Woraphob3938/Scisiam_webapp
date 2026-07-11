---
title: SciSiam Product Requirements
status: active
---

# SciSiam Product Requirements

## Product Outcome

SciSiam ทำให้ผู้เรียนไทยสามารถทดลองและทำความเข้าใจวิทยาศาสตร์ได้แม้ไม่มีอุปกรณ์จริง โดยยังคงความถูกต้องของหัวข้อ, ตัวแปร, หน่วย, กราฟ และผลลัพธ์ พร้อม workflow ที่คุณครูใช้ในห้องเรียนได้จริง

## ผู้ใช้และสิทธิ์

| ผู้ใช้ | ความต้องการหลัก | ผลลัพธ์ที่ระบบต้องให้ |
| --- | --- | --- |
| นักเรียน | เรียนรู้และทดลองอย่างเป็นขั้นตอน | ค้นหาแล็บ, รัน simulation, บันทึกผลของตนเอง, รับงานและส่งงานใน classroom |
| คุณครู | จัดการกิจกรรมในชั้นเรียน | สร้างหรือเข้าร่วม classroom, เลือกแล็บ, สร้างงาน, ดูการส่งงาน และใช้ dashboard ที่อิงข้อมูลจริง |

บทบาทถูกเลือกตอนสมัครสมาชิกเท่านั้น หน้า login ไม่ควรให้ผู้ใช้เลือกบทบาทใหม่ เพราะระบบต้องใช้ role ที่เก็บใน profile หลังยืนยันตัวตน

## ความต้องการหลัก

### Authentication และ Profile

- รองรับ email/password พร้อมการยืนยันอีเมลและ recovery ผ่าน token-hash flow
- รองรับ Google OAuth เมื่อผู้ให้บริการถูกตั้งค่าแล้ว
- แสดง profile และ teacher dashboard จากข้อมูลบัญชีจริง ไม่ใช้ mock data เป็นความจริง
- เก็บ session และข้อมูลธุรกิจใน Supabase; browser storage ใช้ได้เฉพาะ UI cache หรือ offline convenience

### Labs และ Simulations

- แสดงแล็บ 103 รายการจาก src/data/labs.ts พร้อมค้นหาและกรองตามหมวดหรือระดับชั้น
- ทุก registered lab ต้องเปิด detail และ simulation ที่ตรงหัวข้อ
- simulation ต้องมี experiment stage, controls, live feedback และ graph/table เมื่อหัวข้อนั้นมีค่าที่วัดได้
- การบันทึกผลต้องเชื่อมกับบัญชีผู้ใช้และไม่รั่วข้ามบัญชี
- detail, equipment, formula, steps, SVG/illustration และ AI context ต้องตรงกับ lab id เดียวกัน

### Classrooms

- นักเรียนและคุณครูสร้างหรือเข้าร่วม classroom ได้
- เฉพาะ creator ของห้องเท่านั้นที่เปลี่ยนชื่อห้อง, ดู invite code, ลบสมาชิก, ยุบห้อง หรือสร้างงาน
- งานรองรับรายละเอียด, หลายลิงก์, หลายไฟล์ตามชนิดและขนาดที่ระบบอนุญาต, วันกำหนดส่ง และการแจ้งเตือนสมาชิก
- นักเรียนส่งไฟล์และลิงก์ได้; คุณครูเห็น submission เฉพาะในห้องที่มีสิทธิ์
- notification ต้องเปิดไปยังปลายทางที่เกี่ยวข้อง, อ่านแล้วหายจาก unread badge และลบได้โดยผู้รับ

### AI ไออุ่น

- เรียกได้ผ่าน server route ที่ยืนยัน session และไม่เปิดเผย provider key
- จำกัดขนาด input, history, timeout และอัตราการใช้งาน
- ตอบภาษาไทย, ผูกคำตอบกับ lab context เมื่อมี, และเตือนว่าคำตอบอาจคลาดเคลื่อน
- ไม่เก็บ prompt, secret หรือ provider payload ลง telemetry

## ข้อกำหนดคุณภาพ

- Thai text อ่านง่ายบน desktop, tablet และ mobile 390px
- ปุ่ม, modal, filter, form และ notification ใช้คีย์บอร์ดได้และมี focus state
- ไม่มี wrong-lab fallback, horizontal overflow, console error หรือ hydration warning ใน flow หลัก
- ก่อนส่งงานต้องผ่าน npm test, npm run lint, npm run build และ secret scan

## ข้อห้ามเชิงผลิตภัณฑ์

- ห้ามเปิด API key ใน client, public asset, package PC/mobile หรือ repository
- ห้ามใช้ localStorage เป็น authorization
- ห้ามเปิดคะแนน, XP, level หรือ teacher grading กลับมาโดยไม่มี product decision ใหม่
- ห้ามแสดงข้อมูล mock เป็นข้อมูลผลการเรียน, dashboard หรือ classroom จริง
