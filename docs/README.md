---
title: SciSiam Documentation
status: active
---

# SciSiam Documentation

เอกสารชุดนี้อธิบายผลิตภัณฑ์และการปฏิบัติงานของ SciSiam ในสถานะปัจจุบัน เอกสารที่มีวันที่และอยู่ในส่วน Historical ใช้เพื่อดูที่มาเท่านั้น ไม่ใช่แหล่งอ้างอิงในการพัฒนารอบใหม่

## แหล่งอ้างอิงหลัก

| เรื่อง | แหล่งอ้างอิง |
| --- | --- |
| การเริ่มต้นใช้งาน, environment, route และคำสั่งตรวจสอบ | [README](../README.md) |
| วิสัยทัศน์, ผู้ใช้, ขอบเขตผลิตภัณฑ์ | [PRODUCT](../PRODUCT.md) |
| รูปแบบ UI และภาษาไทย | [DESIGN](../DESIGN.md) |
| กติกาเทคนิค, Supabase, ความปลอดภัย และการตรวจสอบ | [AGENTS](../AGENTS.md) |
| รายชื่อและ metadata ของแล็บ | [src/data/labs.ts](../src/data/labs.ts) |

## เอกสารปัจจุบัน

- [ภาพรวมโครงการ](00_Project_Overview.md)
- [PRD](PRD.md)
- [Checklist ก่อน demo หรือแข่งขัน](01_Competition_Readiness.md)
- [ทางลัดไปยัง Design System](02_Design_System.md)
- [นโยบาย AI ไออุ่น](03_AI_Tutor_Policy.md)
- [แนวทาง deploy, PC และ mobile](04_Deploy_PC_Mobile.md)
- [Roadmap ผลิตภัณฑ์](05_Backlog.md)

## เอกสารแล็บ

- [คู่มือ catalog และแหล่งข้อมูลแล็บ](labs/00_Lab_Catalog.md)
- [Template สำหรับสร้างแล็บใหม่](labs/_Lab_Template.md)

รายการแล็บไม่ถูกคัดลอกลง Markdown เพราะ src/data/labs.ts เป็นแหล่งข้อมูลเดียวที่เชื่อถือได้ และ regression suite ตรวจความสอดคล้องของ registry และ save key อยู่แล้ว

## เอกสารประวัติ

- [Archive guide](archive/README.md) รวม PRD, project overview, backlog, catalog และ QA รุ่นก่อน
- เอกสารใน docs/superpowers/specs และ docs/superpowers/plans เป็น design/implementation record ตามวันที่ ไม่ใช่คู่มือปฏิบัติงานปัจจุบัน

## กติกาการดูแลเอกสาร

1. เปลี่ยนข้อเท็จจริงของผลิตภัณฑ์ให้แก้ code source และเอกสารหลักในงานเดียวกัน
2. อย่าคัดลอก catalog, readiness หรือ status ของแล็บแบบ manual จาก code ลงหลายไฟล์
3. แผนที่ทำเสร็จแล้วให้ระบุสถานะ Implemented หรือ Archived แทนการปล่อย checklist ว่าง
4. ผล QA ต้องมีวันที่, route, viewport และขอบเขตหลักฐานเสมอ
