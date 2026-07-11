---
title: Competition Readiness
status: active
---

# Competition Readiness

ใช้ checklist นี้ก่อน demo, deploy หรือให้กรรมการทดลองใช้

## Product Flow

- สมัครบัญชี, ยืนยันอีเมล, login และ password recovery ทำงานตาม redirect URL ที่ตั้งไว้
- Login อ่าน role จาก profile; register เท่านั้นที่ให้เลือก student หรือ teacher
- เปิด lab detail และ simulation ที่ตรงกับ lab id โดยไม่มี wrong-lab fallback
- บันทึก experiment run แล้วเห็นเฉพาะใน history ของบัญชีเดียวกัน
- คุณครูสร้าง classroom และ assignment ได้; นักเรียนได้รับ notification, เปิดปลายทาง และส่งงานได้

## Demo Flow

1. Login ด้วยบัญชีที่ยืนยันแล้ว
2. ค้นหาและเปิด lab detail
3. ปรับค่าใน simulation และบันทึกผล
4. ถาม AI ไออุ่นเกี่ยวกับตัวแปรหรือกราฟ
5. เปิด classroom, สร้างหรือดู assignment, และตรวจ notification
6. เปิด profile หรือ teacher dashboard เพื่อยืนยันข้อมูลจริงของบัญชี

## Technical Checks

```powershell
npm test
npm run lint
npm run build
npm audit --omit=dev
rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\s*="
```

## UI Checks

- Desktop 1440px, tablet 768px และ mobile 390px
- ไม่มี console error, hydration warning หรือ horizontal scroll
- Thai text ไม่ทับกันหรือถูกตัด และปุ่มมี loading, disabled และ focus state เมื่อจำเป็น
- keyboard focus เข้าออก dialog, dropdown, notification และ AI Tutor ได้ถูกต้อง
- floating AI และ mobile navigation ไม่ทับ action หลัก

## Security Checks

- ไม่มี API key ใน browser bundle, public assets หรือ package
- Supabase ใช้ publishable key ฝั่ง client เท่านั้น
- ผู้ใช้เปิดไฟล์ assignment หรือ submission ได้เฉพาะตามสิทธิ์ของ classroom
- OAuth และ auth redirect รับเฉพาะ relative path ที่ปลอดภัย
