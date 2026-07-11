---
title: Lab Catalog Guide
status: active
---

# Lab Catalog Guide

## Canonical Source

รายการแล็บ, ชื่อ, หมวด, ระดับชั้น, รายละเอียดสั้น และ asset reference อยู่ใน src/data/labs.ts ไฟล์เดียว ห้ามทำตารางรายชื่อหรือ readiness ซ้ำแบบ manual ใน Markdown

SciSiam มี 103 registered labs ใน 5 หมวด:

- Physics
- Chemistry
- Biology
- Mathematics
- Foundation

ทุก registered lab มี simulation route ที่ตรงกับหัวข้อ โดย implementation ใช้ direct simulation หรือ shared concept simulation ตาม registry

## Files That Must Stay In Sync

เมื่อเพิ่มหรือเปลี่ยนแล็บ ให้ตรวจทั้งชุดนี้:

1. src/data/labs.ts สำหรับ metadata และ lab id
2. src/data/labDetails.ts สำหรับ objective, theory, equipment และ steps
3. src/data/labSimulationRegistry.ts สำหรับ readiness และ engine ที่ใช้
4. src/data/labSavedExperiments.ts สำหรับ key ของการบันทึกผล
5. src/app/labs/[id]/page.tsx และ src/app/labs/[id]/simulation/page.tsx สำหรับ route behavior
6. SVG/illustration, LabCard และ AI context เพื่อไม่ให้ภาพหรือคำอธิบายผิดหัวข้อ

## Readiness Rule

registered lab หมายถึง detail และ simulation ต้องสอดคล้องกัน หากเพิ่ม lab ในอนาคตแต่ยังไม่พร้อม ให้แสดง placeholder ที่ระบุหัวข้ออย่างซื่อสัตย์และห้าม fallback ไปยัง Newton cooling หรือ simulation อื่น

## Verification

- เปิด /labs/[id] และ /labs/[id]/simulation ของแล็บที่แก้
- รัน npm test เพื่อให้ regression suite ตรวจ registry และ save key
- ตรวจ desktop และ mobile 390px ว่าการ์ด, SVG และปุ่มไม่ overflow
- ตรวจว่าชื่อ SciSiam ใช้ตัวสะกดเดียวกันใน card, detail, simulation และ email context

ใช้ [Lab Template](_Lab_Template.md) เมื่อต้องสร้างแล็บใหม่หรือเขียน brief ให้ designer/agent
