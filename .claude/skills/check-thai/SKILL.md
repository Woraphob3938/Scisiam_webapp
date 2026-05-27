---
name: check-thai
description: Audit the codebase to ensure compliance with the Thai Typography Guidelines in AGENTS.md. Triggered by typing /check-thai.
---
# Check Thai - Thai Typography Auditor (ทักษะตรวจสอบการจัดรูปแบบอักษรไทย)

เมื่อทักษะนี้เปิดใช้งาน (พิมพ์ `/check-thai`):

1. **สแกนโค้ดหาเนื้อหาภาษาไทย**: สแกนโค้ดในไฟล์ `.tsx`, `.ts`, และไฟล์ `.css` ภายใต้โฟลเดอร์ `src/` เพื่อค้นหาคำภาษาไทย (เช่น ข้อความบนการ์ด, คำบรรยาย, หัวข้อ, หรือข้อความต้อนรับ)
2. **ตรวจสอบเกณฑ์ตามระเบียบ `AGENTS.md`**:
   - **Line Height**: ตรวจสอบว่าคลาส Tailwind มีการกำหนดระยะบรรทัดที่พอเหมาะกับภาษาไทย เช่น `leading-relaxed`, `leading-loose`, `leading-[1.5]`, `leading-[1.6]` หรือ `leading-[1.7]` หรือไม่ หากเป็นค่าเริ่มต้นที่สั้นเกินไป ให้แจ้งข้อเสนอแนะ
   - **Word Break & Overflow**: ตรวจดูว่าพารากราฟคำอธิบายยาวๆ มีการใส่ `break-words` (`overflow-wrap: break-word`) หรือ `break-keep` ป้องกันการแหว่งพยัญชนะไทยหรือไม่
   - **Letter Spacing**: ค้นหาว่ามีการเผลอใช้งานคลาสบีบช่องไฟ เช่น `tracking-tight` หรือ `tracking-tighter` บนแท็กแสดงผลภาษาไทยหรือไม่ (ห้ามใช้ระยะชิดกับอักษรไทยเด็ดขาด)
   - **Font Family**: ยืนยันว่าหน้าจอหลักใช้ฟอนต์ Prompt ไร้หัวเป็นหลัก (`font-sans`)
3. **รายงานผลการตรวจสอบ**:
   * แสดงรายชื่อไฟล์และเลขบรรทัดที่ไม่ผ่านเกณฑ์
   * แนะนำวิธีแก้ไขและตัวอย่างโค้ดที่ถูกต้อง เพื่อให้แอปพลิเคชันมีสุนทรียภาพทางศิลปะภาษาไทยที่สมบูรณ์แบบ
