---
title: Project Overview
status: active
---

# Project Overview

SciSiam Virtual Lab เป็นแพลตฟอร์มทดลองวิทยาศาสตร์เสมือนจริงแบบ Thai-first สำหรับนักเรียนและคุณครู ระบบมีแล็บที่ลงทะเบียนแล้ว 103 แล็บใน Physics, Chemistry, Biology, Mathematics และ Foundation

## เป้าหมาย

ผู้เรียนควรเข้าใจแนวคิดจากการทดลองจริงในระบบ: อ่านเป้าหมายและทฤษฎี ปรับตัวแปร สังเกตผลลัพธ์ ดูกราฟหรือตาราง บันทึกผล และขอคำแนะนำจาก AI ไออุ่นได้อย่างปลอดภัย

## เส้นทางผู้ใช้หลัก

1. ผู้ใช้ใหม่สมัครเป็นนักเรียนหรือคุณครูและยืนยันอีเมล
2. ผู้ใช้เข้าสู่ระบบ แล้วระบบอ่านบทบาทจาก profile ที่บันทึกไว้
3. ผู้ใช้ค้นหาแล็บ เปิดรายละเอียด และเข้า simulation ที่ตรงหัวข้อ
4. ผู้ใช้บันทึกผลการทดลองเพื่อดูใน learning history ของบัญชีตนเอง
5. ใน classroom คุณครูสร้างงานและนักเรียนได้รับการแจ้งเตือน ส่งไฟล์หรือลิงก์ และติดตามงานในห้องเดียวกัน

## โครงสร้างข้อมูล

- src/data/labs.ts เป็นแหล่งข้อมูล metadata ของแล็บทั้งหมด
- src/data/labDetails.ts เก็บเนื้อหา detail page
- src/data/labSimulationRegistry.ts กำหนด simulation ที่รองรับ
- src/data/labSavedExperiments.ts กำหนด save key ของแล็บที่พร้อมใช้
- Supabase เป็น canonical store สำหรับ session, profile, experiment run, classroom, assignment และ notification

## ขอบเขตที่ตั้งใจไม่ทำ

- คะแนน, XP, level และการให้คะแนนโดยคุณครูไม่มีการใช้งานเชิงผลิตภัณฑ์
- localStorage ไม่ใช่สิทธิ์การเข้าถึงหรือข้อมูลบัญชีหลัก
- แล็บในอนาคตที่ยังไม่ลงทะเบียนต้องไม่ fallback ไปยัง simulation ของหัวข้ออื่น

## จุดเริ่มต้น

อ่าน [PRD](PRD.md) เพื่อดู requirements, [README](../README.md) เพื่อเริ่มรันระบบ และ [AGENTS](../AGENTS.md) ก่อนแก้โค้ดหรือ Supabase
