---
title: Project Overview
tags:
  - scisiam
  - overview
---

# Project Overview

SciSiam Virtual Lab เป็นแอปทดลองวิทยาศาสตร์สำหรับนักเรียนไทย มีเป้าหมายให้ผู้ใช้เลือกห้องแล็บ ปรับตัวแปรในการทดลอง ดูผลลัพธ์ กราฟ ตาราง ทฤษฎี และถาม SciSiam AI Tutor ได้

## Product Goal

สร้างแอป virtual science lab ที่ดูน่าเชื่อถือ ใช้งานง่าย และพร้อมเป็นงานส่งแข่งขัน โดยต่อยอดได้ 3 target:

- Web demo
- PC app
- Mobile app

## Core User Flow

1. ผู้ใช้เข้า `หน้าแรก`
2. ค้นหา/กรอง lab ตามหมวด
3. เปิด `หน้า detail`
4. อ่าน objective, equipment, theory, steps
5. เข้าห้อง simulation
6. ปรับตัวแปร ทดลอง ดูกราฟ/ตาราง
7. บันทึกผลหรือถาม AI Tutor
8. กลับมาดู progress/profile

## Main Features

- 36 labs แบ่งเป็น Physics, Chemistry, Biology
- Lab detail pages
- Lab simulation pages
- AI Tutor
- Score/progress/profile
- Responsive UI สำหรับ web/mobile

## Important Source Files

- `src/data/labs.ts`: รายชื่อ lab ทั้ง 36 ห้อง
- `src/app/page.tsx`: หน้าแรก
- `src/app/labs/[id]/page.tsx`: detail route
- `src/app/labs/[id]/simulation/page.tsx`: simulation route
- `src/app/api/ai-tutor/route.ts`: AI Tutor backend route
- `src/components/labs/`: detail components
- `src/components/labs/simulation/`: simulation components

## Related Notes

- [[PRD]]
- [[01_Competition_Readiness]]
- [[02_Design_System]]
- [[03_AI_Tutor_Policy]]
- [[04_Deploy_PC_Mobile]]
- [[labs/00_Lab_Catalog]]

