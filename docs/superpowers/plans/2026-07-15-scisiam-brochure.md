# SciSiam Brochure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างแผ่นพับ SciSiam แบบ A4 แนวนอน 3 พับ 2 หน้าในรูปแบบ Word ที่แก้ไขได้ พร้อม PDF และภาพน้องไออุ่นสำหรับยื่นคณะกรรมการ

**Architecture:** ใช้ไฟล์ภาพแบรนด์และภาพน้องไออุ่นเป็นทรัพยากรแยก แล้วสร้างเอกสารด้วย `python-docx` โดยใช้ตาราง 1 แถว 3 คอลัมน์เป็นโครงหลักของแต่ละหน้าเพื่อรักษาตำแหน่งเมื่อเปิดบนเครื่องอื่น จากนั้นใช้ Microsoft Word อัปเดตการจัดหน้าและส่งออก PDF ก่อนเรนเดอร์ทุกหน้าเป็น PNG เพื่อตรวจภาพจริง

**Tech Stack:** Python 3, python-docx, Pillow, qrcode, Microsoft Word COM, Poppler, image generation

## Global Constraints

- ใช้ข้อกำหนดจาก `docs/superpowers/specs/2026-07-15-scisiam-brochure-design.md`
- กระดาษ A4 แนวนอน 297 x 210 มิลลิเมตร จำนวน 2 หน้า
- ลำดับช่องด้านนอก 5-6-1 และด้านใน 2-3-4
- พื้นที่ใช้งานกว้าง 285 มิลลิเมตร แบ่งเป็น 93, 96 และ 96 มิลลิเมตร
- ใช้ TH Sarabun New ทั้งเอกสาร
- ใช้แนวทาง Science Calm และสีหลัก `#2563EB`, `#0F172A`, `#DBEAFE`, `#F8FBFF`, `#475569`, `#FFFFFF`
- QR Code ต้องนำไปยัง `https://scisiam-app.vercel.app/login`
- ไม่เพิ่ม dependency ของแอป SciSiam และไม่แก้ source code ผลิตภัณฑ์
- ไฟล์ชั่วคราวอยู่ใต้ `tmp/docs/brochure/`; ไฟล์ส่งมอบอยู่ใต้ `output/doc/`
- ไม่ commit หรือ push จนกว่าผู้ใช้จะสั่ง

---

### Task 1: เตรียมทรัพยากรภาพและ QR Code

**Files:**
- Read: `public/scisiam-logo.png`
- Read: `public/ai-oon-logo.png`
- Read: `public/ai-oon-avatar.png`
- Create: `output/doc/assets/ai-oon-brochure.png`
- Create: `output/doc/assets/scisiam-login-qr.png`
- Create: `tmp/docs/brochure/asset_manifest.json`

**Interfaces:**
- Consumes: ภาพแบรนด์เดิมและ URL หน้าเข้าสู่ระบบ
- Produces: ภาพ PNG โปร่งใสของน้องไออุ่นอย่างน้อย 1600 x 1600 พิกเซล และ QR Code PNG อย่างน้อย 1000 x 1000 พิกเซล

- [ ] **Step 1: สร้างภาพน้องไออุ่นสำหรับปก**

ใช้เครื่องมือสร้างภาพโดยอ้างอิง `public/ai-oon-logo.png` และ `public/ai-oon-avatar.png` ด้วยคำอธิบายต่อไปนี้:

```text
Create a polished full-body 3D mascot illustration matching the supplied SciSiam AI Oon character: a round sky-blue baby penguin with a white face and belly, very large glossy navy-blue eyes, soft pink cheeks, a small bright orange beak and orange feet, and three rounded feather tufts on top. Friendly welcoming pose, one flipper raised in a gentle wave and the other holding a small transparent laboratory flask with pale blue liquid. Clean educational technology brand style, soft studio lighting, subtle blue rim light, high-end rounded 3D render, centered full body, transparent background, no text, no logo, no border, no extra characters, no cropped body parts.
```

- [ ] **Step 2: ตรวจภาพน้องไออุ่น**

Run:

```powershell
rtk powershell -NoProfile -Command "Add-Type -AssemblyName System.Drawing; $i=[System.Drawing.Image]::FromFile('D:\Scisiam_app\output\doc\assets\ai-oon-brochure.png'); Write-Output ($i.Width.ToString()+'x'+$i.Height.ToString()); $i.Dispose()"
```

Expected: ความกว้างและความสูงอย่างน้อย 1600 พิกเซล และภาพไม่ถูกตัดส่วนศีรษะ ปีก หรือเท้า

- [ ] **Step 3: สร้าง QR Code**

สร้าง `tmp/docs/brochure/create_qr.py` ด้วยโค้ด:

```python
from pathlib import Path
import qrcode

url = "https://scisiam-app.vercel.app/login"
output = Path(r"D:\Scisiam_app\output\doc\assets\scisiam-login-qr.png")
output.parent.mkdir(parents=True, exist_ok=True)
qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=20, border=4)
qr.add_data(url)
qr.make(fit=True)
qr.make_image(fill_color="#0F172A", back_color="white").save(output)
print(output)
```

Run:

```powershell
rtk "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" tmp/docs/brochure/create_qr.py
```

Expected: `output/doc/assets/scisiam-login-qr.png` exists and is square

- [ ] **Step 4: บันทึก manifest ของทรัพยากร**

`asset_manifest.json` ต้องระบุ path, dimensions, source และ intended panel ของภาพทุกไฟล์ เพื่อให้สคริปต์สร้างเอกสารตรวจไฟล์หายได้ก่อนเริ่มงาน

---

### Task 2: สร้างเอกสาร Word แบบ 6 ช่อง

**Files:**
- Create: `tmp/docs/brochure/build_brochure.py`
- Create: `output/doc/แผ่นพับ_SciSiam_สำหรับกรรมการ.docx`
- Test: `tmp/docs/brochure/verify_brochure.py`

**Interfaces:**
- Consumes: `asset_manifest.json`, โลโก้ SciSiam, ภาพน้องไออุ่น และ QR Code
- Produces: `build_brochure(output_path: Path) -> Path`

- [ ] **Step 1: เขียนการตรวจโครงสร้างก่อนสร้างเอกสาร**

`verify_brochure.py` ต้องเปิด DOCX และตรวจ:

```python
assert len(doc.sections) == 1
assert doc.sections[0].orientation == WD_ORIENT.LANDSCAPE
assert len(doc.tables) == 2
assert all(len(table.columns) == 3 for table in doc.tables)
assert "ทดลองวิทยาศาสตร์ได้ทุกที่ ทุกเวลา" in text
assert "103 ห้องทดลอง" in text
assert "AI ไออุ่น" in text
assert "scisiam-app.vercel.app" in text
```

- [ ] **Step 2: รันตัวตรวจเพื่อยืนยันว่าไฟล์ยังไม่มี**

Run:

```powershell
rtk "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" tmp/docs/brochure/verify_brochure.py
```

Expected: FAIL เพราะยังไม่มี `output/doc/แผ่นพับ_SciSiam_สำหรับกรรมการ.docx`

- [ ] **Step 3: สร้างโครงเอกสาร**

`build_brochure.py` ต้องกำหนด:

```python
section.page_width = Mm(297)
section.page_height = Mm(210)
section.orientation = WD_ORIENT.LANDSCAPE
section.top_margin = Mm(6)
section.bottom_margin = Mm(6)
section.left_margin = Mm(6)
section.right_margin = Mm(6)
```

สร้างตารางหน้าแรกด้วยคอลัมน์ 93, 96, 96 มิลลิเมตรสำหรับช่อง 5-6-1 เพิ่ม page break แล้วสร้างตารางหน้าที่สองด้วยคอลัมน์เดียวกันสำหรับช่อง 2-3-4

- [ ] **Step 4: เติมเนื้อหาด้านนอก**

เติมข้อความตามข้อกำหนด:

```python
outside_panels = [
    ("พร้อมทดลองใน 3 ขั้นตอน", ["เปิดเว็บไซต์หรือดาวน์โหลดแอป Windows", "สมัครสมาชิกและเลือกบทบาท", "เลือกห้องทดลองและบันทึกผล"]),
    ("เรียนรู้วิทยาศาสตร์ผ่านการลงมือทำ", ["103 ห้องทดลอง", "5 กลุ่มสาระ", "เว็บไซต์และแอป Windows"]),
    ("ทดลองวิทยาศาสตร์ได้ทุกที่ ทุกเวลา", ["ห้องปฏิบัติการเสมือนจริง", "สำหรับนักเรียนและคุณครู"]),
]
```

ฝัง QR Code ในช่อง 5, สถิติในช่อง 6 และภาพน้องไออุ่นพร้อมโลโก้ในช่อง 1

- [ ] **Step 5: เติมเนื้อหาด้านใน**

เติมช่อง 2-3-4 ตามหัวข้อ:

```python
inside_titles = [
    "SciSiam คืออะไร",
    "ทดลองจริง เห็นผลจริง",
    "เรียนรู้พร้อม AI ไออุ่นและชั้นเรียนออนไลน์",
]
```

ใช้รายการสั้น ไม่เกิน 5 รายการต่อช่อง และเว้นพื้นที่หายใจระหว่างหัวข้อ ภาพ และข้อความ

- [ ] **Step 6: ใช้แบบอักษรและสี Science Calm**

ตั้งค่า font ของ style และ run ทุกตัวเป็น TH Sarabun New ใช้หัวข้อ `#0F172A`, ข้อความรอง `#475569`, น้ำเงินหลัก `#2563EB` และพื้นหลัง `#F8FBFF`/`#DBEAFE`

- [ ] **Step 7: รันตัวตรวจโครงสร้าง**

Run:

```powershell
rtk "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" tmp/docs/brochure/verify_brochure.py
```

Expected: PASS สำหรับ orientation, page size, tables, panel order, text และ embedded images

---

### Task 3: ส่งออก PDF และตรวจภาพจริง

**Files:**
- Create: `tmp/docs/brochure/render_brochure.ps1`
- Create: `output/doc/แผ่นพับ_SciSiam_สำหรับกรรมการ.pdf`
- Create: `tmp/docs/brochure/rendered/page-1.png`
- Create: `tmp/docs/brochure/rendered/page-2.png`

**Interfaces:**
- Consumes: DOCX จาก Task 2
- Produces: PDF 2 หน้าและ PNG สำหรับตรวจภาพ

- [ ] **Step 1: ส่งออก PDF ด้วย Microsoft Word**

`render_brochure.ps1` ต้องเปิด Word แบบซ่อน อัปเดตฟิลด์ บันทึก แล้วใช้ `ExportAsFixedFormat` สร้าง PDF

- [ ] **Step 2: ตรวจจำนวนหน้า**

Run:

```powershell
rtk powershell -NoProfile -ExecutionPolicy Bypass -File tmp/docs/brochure/render_brochure.ps1
```

Expected: `PAGES=2`

- [ ] **Step 3: เรนเดอร์ PDF เป็น PNG**

Run:

```powershell
rtk "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe" -png -r 180 "output\doc\แผ่นพับ_SciSiam_สำหรับกรรมการ.pdf" "tmp\docs\brochure\rendered\page"
```

Expected: มี PNG 2 ไฟล์ ขนาดเท่ากันและอัตราส่วน A4 แนวนอน

- [ ] **Step 4: ตรวจภาพทีละหน้า**

ตรวจที่ 100% ว่า:

- ช่องทั้งสามมีความกว้างตามข้อกำหนด
- ไม่มีข้อความหรือรูปภาพชนขอบและแนวพับ
- ปกหน้าอยู่ขวาสุดของด้านนอก
- QR Code ไม่เบลอและมี quiet zone ครบ
- ตัวอักษรไทยไม่แตกหรือเปลี่ยนแบบอักษร
- ภาพน้องไออุ่นไม่ถูกครอบส่วนสำคัญ

- [ ] **Step 5: แก้และเรนเดอร์ซ้ำหากพบข้อบกพร่อง**

แก้เฉพาะสคริปต์สร้างเอกสาร แล้วสร้าง DOCX/PDF/PNG ใหม่ทั้งหมดเพื่อไม่ให้ไฟล์ส่งมอบกับสคริปต์ต้นทางไม่ตรงกัน

---

### Task 4: ตรวจรับไฟล์ส่งมอบ

**Files:**
- Modify: `tmp/docs/brochure/verify_brochure.py`
- Verify: `output/doc/แผ่นพับ_SciSiam_สำหรับกรรมการ.docx`
- Verify: `output/doc/แผ่นพับ_SciSiam_สำหรับกรรมการ.pdf`
- Verify: `output/doc/assets/ai-oon-brochure.png`
- Verify: `output/doc/assets/scisiam-login-qr.png`

**Interfaces:**
- Consumes: ผลลัพธ์ Task 1-3
- Produces: รายงาน PASS/FAIL ที่ครอบคลุมข้อกำหนดทั้งหมด

- [ ] **Step 1: เพิ่มการตรวจขั้นสุดท้าย**

ตัวตรวจต้องยืนยัน:

```python
assert pdf_page_count == 2
assert page_size_is_a4_landscape
assert docx_has_two_three_column_tables
assert all_required_text_present
assert all_required_images_embedded
assert all_text_runs_use_th_sarabun_new
assert qr_target == "https://scisiam-app.vercel.app/login"
```

- [ ] **Step 2: รันการตรวจขั้นสุดท้าย**

Run:

```powershell
rtk "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" tmp/docs/brochure/verify_brochure.py
```

Expected: ทุกหัวข้อแสดง `PASS` และ exit code 0

- [ ] **Step 3: ตรวจรายชื่อและขนาดไฟล์**

Run:

```powershell
rtk cmd /c dir "D:\Scisiam_app\output\doc\แผ่นพับ_SciSiam_สำหรับกรรมการ.*"
rtk cmd /c dir "D:\Scisiam_app\output\doc\assets"
```

Expected: DOCX, PDF, mascot PNG และ QR PNG มีขนาดมากกว่า 0 ไบต์

- [ ] **Step 4: ส่งมอบโดยไม่ commit**

ส่งลิงก์ไฟล์ Word, PDF และภาพน้องไออุ่นให้ผู้ใช้ พร้อมสรุปผลการตรวจจำนวนหน้า การจัดวาง และ QR Code โดยไม่สร้าง commit หรือ push
