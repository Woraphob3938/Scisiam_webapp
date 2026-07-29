# Mobile Labs, Classroom, and Simulation Polish

## Goal

แก้ประสบการณ์ใช้งาน SciSiam ให้สม่ำเสมอบนมือถือ แท็บเล็ต และเดสก์ท็อป โดยแก้จากส่วนกลางก่อน ไม่ทำแพตช์เฉพาะหน้า และไม่ลดทอนการตรวจสิทธิ์ของ Supabase

## Confirmed Scope

1. บนมือถือซ่อนตัวกรองหมวดวิชาและระดับชั้นในหน้ารวมแล็บ เหลือช่องค้นหาและรายการแล็บ โดยการค้นหายังค้นได้ครบทุกวิชาและทุกระดับ
2. ปุ่ม AI ไออุ่นใช้ภาพการ์ตูนโปร่งใสโดยตรง ไม่วางในกรอบวงกลม แต่ยังมีพื้นที่กดที่เพียงพอและสถานะโฟกัสที่มองเห็นได้
3. สมาชิกที่ไม่ใช่เจ้าของห้องสามารถออกจากชั้นเรียนได้ผ่านปุ่มยืนยัน การออกจากห้องต้องตรวจสิทธิ์และลบสมาชิกด้วย RPC ฝั่งฐานข้อมูล เจ้าของห้องออกจากห้องตัวเองไม่ได้
4. ปุ่มขยายหน้าจอของแล็บใช้ Fullscreen API เมื่อเบราว์เซอร์รองรับ และใช้ CSS fullscreen fallback บน iOS/iPadOS พร้อมล็อกการเลื่อนพื้นหลัง คืนสถานะเมื่อออกจากเต็มจอ และรองรับการกด Escape หรือปุ่มเดิม
5. ข้อความหลังบันทึกผลทดลองเปลี่ยนจาก native alert เป็น toast สีฟ้าอ่อนด้านบน ข้อความ “บันทึกสำเร็จ ให้ดูที่ผลการทดลอง” แสดงประมาณ 2 วินาทีแล้วค่อย ๆ หายไป
6. ช่องกรอกตัวเลขต้องลบจนว่าง พิมพ์ค่าติดลบ ทศนิยม และแก้ค่าระหว่างพิมพ์ได้ทุกแพลตฟอร์ม โดยค่อยตรวจช่วงค่าตอน commit/blur ไม่บังคับเปลี่ยนค่าเป็นศูนย์ระหว่างพิมพ์
7. ซ่อน Navbar บนทุกเส้นทางการจำลอง `/labs/[id]/simulation` เพื่อให้พื้นที่ทดลองเป็นจุดเด่นและไม่ซ้ำกับปุ่มออกจากแล็บ
8. หลังเปลี่ยนรูปโปรไฟล์ รูปในหน้าโปรไฟล์และ Navbar ต้องเปลี่ยนพร้อมกันทันที พร้อม cache-busting และยังซิงก์ข้ามแท็บผ่าน cache event

## Architecture

### Shared UI First

- ซ่อนตัวกรองมือถือที่หน้ารวมแล็บ ไม่แก้ข้อมูลตัวกรองหรือผลค้นหา
- ปรับ `AIChatButton` ให้ใช้ asset โปร่งใสและคง hit target อย่างน้อย 44x44 px
- ปรับ `SharedSimulationShell` ให้เป็นเจ้าของ state ของ fullscreen ทั้ง native และ fallback
- สร้าง helper แจ้งบันทึกสำเร็จส่วนกลาง แล้วเปลี่ยนเฉพาะ save-success alerts ไม่ดักหรือ monkey-patch `window.alert`
- ใช้ numeric input ส่วนกลางที่เก็บค่า draft เป็น string และส่ง number เมื่อค่าใช้งานได้
- เอา Navbar ออกจาก shared และ legacy simulation roots แทนการซ่อนด้วย CSS ทั่วทั้งเว็บ

### Classroom Authorization

- เพิ่ม forward migration ใหม่สำหรับ `leave_classroom(p_classroom_id uuid)`
- RPC ต้องใช้ผู้ใช้จาก `auth.uid()` เท่านั้น ตรวจว่าสมาชิกมีอยู่จริง ห้องยังใช้งานอยู่ และผู้ใช้ไม่ใช่ `creator_id`
- UI แสดงปุ่มออกจากชั้นเรียนเฉพาะสมาชิกทั่วไป พร้อม confirm dialog และ redirect ไป `/classrooms` เมื่อสำเร็จ
- อัปเดต TypeScript database types และ regression tests ให้ตรงกับ migration

### Avatar Synchronization

- การบันทึกโปรไฟล์เขียน Supabase และ auth display cache ในจุดเดียว
- Auth context รองรับ optimistic cache refresh จาก `SCISIAM_AUTH_EVENT` โดยไม่ต้องรอ network round-trip เพื่อเปลี่ยนรูป Navbar
- การโหลดโปรไฟล์จาก server ยังคงเป็น canonical reconciliation หลังจากนั้น

## Error and Edge Cases

- ถ้าออกจากชั้นเรียนไม่สำเร็จ สมาชิกยังคงอยู่หน้าเดิมและเห็นข้อความผิดพลาดแบบปลอดภัย
- ถ้า native fullscreen ล้มเหลว ให้ fallback ทันทีโดยไม่ทำให้หน้าค้าง
- ถ้า numeric draft ไม่สมบูรณ์เมื่อ blur ให้คืนค่าล่าสุดที่ถูกต้อง
- Toast ไม่บังปุ่มหลัก มี `aria-live` และเคารพ reduced motion
- ถ้าการอัปโหลดรูปสำเร็จแต่ profile update ไม่สำเร็จ ต้องไม่แสดงว่าบันทึกโปรไฟล์สำเร็จ

## Verification

- Regression tests สำหรับ classroom leave RPC และสิทธิ์เจ้าของห้อง
- Unit/regression coverage สำหรับ mobile filter visibility, Navbar absence on simulations, shared toast text, and numeric draft behavior
- ตรวจ `/labs` ที่ 390 px และเดสก์ท็อป
- ตรวจ simulation บนเดสก์ท็อป, iOS/iPad viewport fallback, การกรอกค่าติดลบ และการลบค่า
- ตรวจ creator/member classroom flows และ avatar sync
- รัน `npm test`, `npm run lint`, `npm run build`, secret scan และ `graphify update .`

## Out of Scope

- ไม่ redesign หน้ารวมแล็บหรือ simulation ทั้งระบบ
- ไม่เปลี่ยน metadata หรือสูตรคำนวณของแล็บ
- ไม่อนุญาตให้เจ้าของออกจากห้องแทนการยุบห้อง
- ไม่ commit หรือ push จนกว่าผู้ใช้ร้องขอ
