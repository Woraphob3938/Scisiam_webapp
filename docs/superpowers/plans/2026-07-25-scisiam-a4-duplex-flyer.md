# SciSiam A4 Duplex Flyer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างใบปลิว SciSiam ขนาด A4 แนวตั้งจำนวน 2 หน้า พร้อม QR Code 3 รายการ ในรูปแบบ Word, PDF และ PNG สำหรับพิมพ์หน้าและหลัง

**Architecture:** ใช้สคริปต์ Python ชั่วคราวเป็นแหล่งข้อมูลกลางของข้อความ สี ขนาด และ QR payload จากนั้นสร้าง DOCX ที่ข้อความแก้ไขได้ด้วย `python-docx` ใช้ Microsoft Word ส่งออก PDF และใช้ Poppler เรนเดอร์ PNG สำหรับตรวจภาพทุกหน้า ฟอนต์ Noto Sans Thai และ Inter จะดาวน์โหลดจาก Google Fonts เฉพาะในพื้นที่ชั่วคราวและฝังในเอกสารเพื่อรักษารูปลักษณ์โดยไม่ติดตั้งฟอนต์ลงใน Windows

**Tech Stack:** Python 3, python-docx, Pillow, qrcode, fontTools, zxing-cpp, Microsoft Word COM, pypdf, Poppler

## Global Constraints

- กระดาษ A4 แนวตั้ง 210 x 297 มิลลิเมตร จำนวน 2 หน้า
- เนื้อหาสำคัญต้องห่างขอบกระดาษอย่างน้อย 10 มิลลิเมตร
- ใช้ Noto Sans Thai สำหรับภาษาไทยและ Inter สำหรับภาษาอังกฤษ
- ใช้สีหลัก `#0F172A`, `#475569`, `#2563EB`, `#38BDF8`, `#4F46E5`, `#F8FAFC`, `#F1F5F9`, `#E2E8F0` และ `#FFFFFF`
- QR Code ใช้โมดูลสีดำบนพื้นขาว ขนาดไม่น้อยกว่า 42 x 42 มิลลิเมตร และไม่มีโลโก้ทับ
- ใช้ข้อความและ QR payload ตามสเปก `docs/superpowers/specs/2026-07-25-scisiam-a4-duplex-flyer-design.md` เท่านั้น
- ใช้ภาพหน้าจอจริงจากคู่มือ ไม่สร้างกรอบเบราว์เซอร์หรือข้อมูลสมมติ
- ไม่แก้ไขแอป คู่มือ รายงาน หรือไฟล์ต้นฉบับ
- ไฟล์ชั่วคราวอยู่ใต้ `tmp/docs/scisiam_flyer/` และลบเมื่อการตรวจรับเสร็จ
- ไฟล์ส่งมอบอยู่ใต้ `output/doc/`

---

## File Structure

### Files to create temporarily

- `tmp/docs/scisiam_flyer/create_scisiam_flyer.py`: สร้าง QR Code, DOCX และฝังฟอนต์
- `tmp/docs/scisiam_flyer/verify_scisiam_flyer.py`: ตรวจขนาดหน้า จำนวนหน้า ข้อความ และ QR payload
- `tmp/docs/scisiam_flyer/export_docx.ps1`: เปิด DOCX ด้วย Microsoft Word และส่งออก PDF
- `tmp/docs/scisiam_flyer/fonts/NotoSansThai-Regular.ttf`: ฟอนต์ไทยน้ำหนัก 400
- `tmp/docs/scisiam_flyer/fonts/NotoSansThai-Bold.ttf`: ฟอนต์ไทยน้ำหนัก 700
- `tmp/docs/scisiam_flyer/fonts/Inter-Regular.ttf`: ฟอนต์อังกฤษน้ำหนัก 400
- `tmp/docs/scisiam_flyer/fonts/Inter-Bold.ttf`: ฟอนต์อังกฤษน้ำหนัก 700
- `tmp/docs/scisiam_flyer/assets/labs.png`: ภาพหน้ารวมห้องแล็บจาก `word/media/image8.png`
- `tmp/docs/scisiam_flyer/assets/simulation.png`: ภาพจำลองการทดลองจาก `word/media/image9.png`
- `tmp/docs/scisiam_flyer/assets/qr-install.png`: QR คู่มือการติดตั้ง
- `tmp/docs/scisiam_flyer/assets/qr-guide.png`: QR คู่มือการใช้งาน
- `tmp/docs/scisiam_flyer/assets/qr-web.png`: QR เว็บไซต์ SciSiam
- `tmp/docs/scisiam_flyer/rendered/page-1.png`: ภาพตรวจด้านหน้า
- `tmp/docs/scisiam_flyer/rendered/page-2.png`: ภาพตรวจด้านหลัง

### Final files to create

- `output/doc/ใบปลิว_SciSiam_A4_หน้าหลัง.docx`: Word ที่ข้อความแก้ไขได้
- `output/doc/ใบปลิว_SciSiam_A4_หน้าหลัง.pdf`: PDF สำหรับพิมพ์
- `output/doc/ใบปลิว_SciSiam_ด้านหน้า.png`: ภาพตัวอย่างด้านหน้า 300 dpi
- `output/doc/ใบปลิว_SciSiam_ด้านหลัง.png`: ภาพตัวอย่างด้านหลัง 300 dpi

### Existing files consumed without modification

- `public/scisiam-logo.png`
- `public/ai-oon-logo.png`
- `output/doc/คู่มือการใช้งาน_SciSiam_ฉบับทางการ.docx`
- `docs/superpowers/specs/2026-07-25-scisiam-a4-duplex-flyer-design.md`

---

### Task 1: Prepare isolated dependencies, fonts, screenshots, and QR assets

**Files:**
- Create: `tmp/docs/scisiam_flyer/fonts/*.ttf`
- Create: `tmp/docs/scisiam_flyer/assets/*.png`
- Consume: `output/doc/คู่มือการใช้งาน_SciSiam_ฉบับทางการ.docx`

**Interfaces:**
- Consumes: approved QR payloads and source DOCX media
- Produces: six raster assets and four static font files used by Task 2

- [ ] **Step 1: Create the temporary directories and install isolated helper packages**

Run:

```powershell
rtk powershell -NoProfile -Command "New-Item -ItemType Directory -Force -Path 'D:\Scisiam_app\tmp\docs\scisiam_flyer\assets','D:\Scisiam_app\tmp\docs\scisiam_flyer\fonts','D:\Scisiam_app\tmp\docs\scisiam_flyer\rendered','D:\Scisiam_app\tmp\docs\scisiam_flyer\pydeps' | Out-Null"
rtk C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m pip install --disable-pip-version-check --target D:\Scisiam_app\tmp\docs\scisiam_flyer\pydeps "qrcode[pil]" fonttools zxing-cpp
```

Expected: directories exist and imports `qrcode`, `fontTools`, and `zxingcpp` succeed from the isolated target directory.

- [ ] **Step 2: Extract the two approved screenshots from the manual**

Run:

```powershell
rtk C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -c "import zipfile,pathlib; src=pathlib.Path(r'D:\Scisiam_app\output\doc\คู่มือการใช้งาน_SciSiam_ฉบับทางการ.docx'); out=pathlib.Path(r'D:\Scisiam_app\tmp\docs\scisiam_flyer\assets'); z=zipfile.ZipFile(src); (out/'labs.png').write_bytes(z.read('word/media/image8.png')); (out/'simulation.png').write_bytes(z.read('word/media/image9.png'))"
```

Expected: `labs.png` is 1380 x 776 pixels and `simulation.png` is 1380 x 654 pixels.

- [ ] **Step 3: Download the official variable fonts and create static weights**

Use these sources:

```python
FONT_SOURCES = {
    "noto": "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansthai/NotoSansThai%5Bwdth,wght%5D.ttf",
    "inter": "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf",
}
STATIC_FONTS = (
    ("noto", 400, "NotoSansThai-Regular.ttf"),
    ("noto", 700, "NotoSansThai-Bold.ttf"),
    ("inter", 400, "Inter-Regular.ttf"),
    ("inter", 700, "Inter-Bold.ttf"),
)
```

Create each static file with:

```python
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

font = TTFont(variable_font_path)
static_font = instantiateVariableFont(font, {"wght": weight}, inplace=False)
static_font.save(output_path)
```

Expected: the four final TTF files open with `TTFont` and report the requested family and weight.

- [ ] **Step 4: Generate the three QR Code files**

Use exactly:

```python
QR_PAYLOADS = {
    "qr-install.png": (
        'ติดตั้ง SciSiam บน Windows\n'
        '1) เปิด https://scisiam-app.vercel.app/login\n'
        '2) กด "ติดตั้งแอป Windows"\n'
        '3) เปิดไฟล์ .exe ที่ดาวน์โหลด\n'
        '4) ทำตามขั้นตอนบนหน้าจอ'
    ),
    "qr-guide.png": "https://scisiam-app.vercel.app/guide",
    "qr-web.png": "https://scisiam-app.vercel.app/login",
}
```

Generate each image with:

```python
import qrcode

qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_M,
    box_size=16,
    border=4,
)
qr.add_data(payload)
qr.make(fit=True)
qr.make_image(fill_color="#000000", back_color="#FFFFFF").save(output_path)
```

Expected: all three QR images are square, black on white, and preserve a four-module quiet zone.

- [ ] **Step 5: Decode the source QR images before layout**

Run `zxingcpp.read_barcode()` on each QR image and compare the decoded text with `QR_PAYLOADS`.

Expected: three exact matches.

---

### Task 2: Build the editable two-page Word flyer

**Files:**
- Create: `tmp/docs/scisiam_flyer/create_scisiam_flyer.py`
- Create: `output/doc/ใบปลิว_SciSiam_A4_หน้าหลัง.docx`

**Interfaces:**
- Consumes: logo, mascot, screenshots, QR images, static fonts, approved copy
- Produces: a two-page DOCX with editable text and embedded bitmap assets

- [ ] **Step 1: Define shared design tokens and copy in the generator**

The generator must use:

```python
COLORS = {
    "ink": "0F172A",
    "muted": "475569",
    "primary": "2563EB",
    "sky": "38BDF8",
    "indigo": "4F46E5",
    "paper": "F8FAFC",
    "panel": "F1F5F9",
    "line": "E2E8F0",
    "white": "FFFFFF",
}

FRONT_COPY = {
    "title": "ทดลองให้เห็น เรียนรู้ให้เข้าใจ",
    "body": (
        "SciSiam คือห้องปฏิบัติการเสมือนสำหรับวิทยาศาสตร์และคณิตศาสตร์ "
        "ผู้เรียนปรับตัวแปร ดูผลลัพธ์ และบันทึกการทดลองได้ในที่เดียว "
        "ครูสามารถสร้างชั้นเรียน มอบหมายงาน และติดตามการส่งงานได้"
    ),
    "features": [
        "ห้องทดลองโต้ตอบที่ผู้เรียนลงมือปรับตัวแปรได้",
        "ดูค่าที่เปลี่ยนแปลง กราฟ และผลการทดลอง",
        "AI ไออุ่นช่วยอธิบายเนื้อหาและแนวคิดที่เกี่ยวข้อง",
        "ห้องเรียนและงานสำหรับครูและนักเรียน",
    ],
    "footer": "พลิกด้านหลังเพื่อดูวิธีติดตั้ง คู่มือการใช้งาน และเว็บไซต์ SciSiam",
}

BACK_COPY = {
    "title": "เริ่มใช้งาน SciSiam",
    "instruction": "เลือก QR ที่ต้องการ แล้วสแกนด้วยกล้องโทรศัพท์",
    "cards": [
        ("ติดตั้งแอปบน Windows", "อ่านขั้นตอนติดตั้งและเปิดเว็บไซต์ทางการ"),
        ("คู่มือการใช้งาน", "ดูวิธีใช้งานสำหรับนักเรียนและครู"),
        ("เปิดเว็บ SciSiam", "เข้าสู่ระบบและเริ่มทดลอง"),
    ],
    "install": (
        'เปิดเว็บไซต์ SciSiam แล้วกด "ติดตั้งแอป Windows" จากนั้นเปิดไฟล์ .exe '
        "ที่ดาวน์โหลดและทำตามขั้นตอนบนหน้าจอ "
        "ควรดาวน์โหลดไฟล์จากเว็บไซต์ทางการเท่านั้น"
    ),
    "note": "คำตอบจาก AI อาจคลาดเคลื่อน ควรตรวจสอบร่วมกับบทเรียนหรือผู้สอน",
}
```

- [ ] **Step 2: Implement reusable Word layout helpers**

Create and use these exact interfaces:

- `set_cell_shading(cell, fill: str) -> None`
- `set_cell_border(cell, color: str, size: int = 8) -> None`
- `set_cell_margins(cell, top: int, start: int, bottom: int, end: int) -> None`
- `set_row_height(row, millimeters: float) -> None`
- `style_paragraph(paragraph, *, align, before_pt: float = 0, after_pt: float = 0, line_spacing: float = 1.15) -> None`
- `add_text(paragraph, text: str, *, size_pt: float, color: str, bold: bool = False, font: str = "Noto Sans Thai") -> None`
- `add_image(paragraph, path, *, width_mm: float) -> None`
- `keep_table_rows_together(table) -> None`
- `embed_fonts(docx_path, font_files: dict[str, tuple[str, str]]) -> None`

The helpers must write the required WordprocessingML directly through `OxmlElement`, and `embed_fonts` must add obfuscated `.odttf` files plus `fontTable.xml` relationships for regular and bold faces.

- [ ] **Step 3: Configure A4 page geometry**

Use:

```python
section.page_width = Mm(210)
section.page_height = Mm(297)
section.top_margin = Mm(10)
section.bottom_margin = Mm(10)
section.left_margin = Mm(10)
section.right_margin = Mm(10)
section.header_distance = Mm(0)
section.footer_distance = Mm(0)
```

Set all default paragraph spacing to zero and set Normal style to Noto Sans Thai 10.5 pt.

- [ ] **Step 4: Compose the front page**

Build the page in this order:

1. A 2-column brand row with `scisiam-logo.png` on the left and `Simulation Lab` on the right.
2. A blue eyebrow line reading `ห้องปฏิบัติการเสมือน`.
3. The 30 pt title and 12 pt body copy.
4. A 2-row screenshot table. The labs screenshot is 178 mm wide in the first row. The simulation screenshot is 126 mm wide in the second row, paired with the AI ไออุ่น logo and a short label `ปรับตัวแปรและดูผลแบบโต้ตอบ`.
5. A 2 x 2 feature table. Each cell has a white background, a 1 pt `#E2E8F0` border, a 3 mm blue marker, and 11 pt text.
6. A pale-blue footer strip containing the approved footer copy.

The sum of fixed heights and spacing must fit within the 277 mm content height without shrinking the approved type sizes.

- [ ] **Step 5: Insert a hard page break and compose the back page**

Build the back page in this order:

1. A compact brand row.
2. The 26 pt title and 11 pt instruction.
3. A 3-column QR card table. Each card is at least 58 mm wide, uses a 42 mm QR image, contains the approved title and description, and has a visible white quiet zone.
4. A numbered installation block with four concise steps.
5. A note block with a sky-blue left border and the approved AI note.
6. A centered footer containing `SciSiam Simulation Lab` and `scisiam-app.vercel.app`.

- [ ] **Step 6: Save and embed fonts**

Save to a temporary DOCX, embed Noto Sans Thai and Inter regular and bold faces, and move the finished package to:

```text
D:\Scisiam_app\output\doc\ใบปลิว_SciSiam_A4_หน้าหลัง.docx
```

Expected: Word opens the file without repair warnings and all visible text remains editable.

---

### Task 3: Export PDF and render both pages for visual review

**Files:**
- Create: `output/doc/ใบปลิว_SciSiam_A4_หน้าหลัง.pdf`
- Create: `tmp/docs/scisiam_flyer/rendered/page-1.png`
- Create: `tmp/docs/scisiam_flyer/rendered/page-2.png`

**Interfaces:**
- Consumes: final DOCX
- Produces: print PDF and 300 dpi page renders

- [ ] **Step 1: Export the DOCX with Microsoft Word**

Create `tmp/docs/scisiam_flyer/export_docx.ps1` with:

```powershell
param(
    [string]$DocxPath = 'D:\Scisiam_app\output\doc\ใบปลิว_SciSiam_A4_หน้าหลัง.docx',
    [string]$PdfPath = 'D:\Scisiam_app\output\doc\ใบปลิว_SciSiam_A4_หน้าหลัง.pdf'
)

$ErrorActionPreference = 'Stop'
$word = $null
$doc = $null

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($DocxPath)
    $doc.EmbedTrueTypeFonts = $true
    $doc.SaveSubsetFonts = $true
    $doc.DoNotEmbedSystemFonts = $false
    $doc.Save()
    $doc.ExportAsFixedFormat($PdfPath, 17)
}
finally {
    if ($null -ne $doc) {
        $doc.Close($false)
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc)
    }
    if ($null -ne $word) {
        $word.Quit()
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word)
    }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
```

Run:

```powershell
rtk powershell -NoProfile -ExecutionPolicy Bypass -File D:\Scisiam_app\tmp\docs\scisiam_flyer\export_docx.ps1
```

Expected: Word exits cleanly and the PDF exists with two pages.

- [ ] **Step 2: Render the PDF at 300 dpi**

Run:

```powershell
rtk pdftoppm -r 300 -png "D:\Scisiam_app\output\doc\ใบปลิว_SciSiam_A4_หน้าหลัง.pdf" "D:\Scisiam_app\tmp\docs\scisiam_flyer\rendered\page"
```

Expected: `page-1.png` and `page-2.png` are approximately 2480 x 3508 pixels.

- [ ] **Step 3: Inspect both rendered pages at full resolution**

Check:

- no clipped or overlapping text
- no unexpected third page
- screenshots remain sharp and proportional
- logo and mascot are not distorted
- body text is readable at 100 percent zoom
- all three QR codes preserve their white quiet zones
- front and back use the same typography, colors, margins, and visual rhythm
- there are no fake interface frames, decorative blobs, placeholder strings, or invented metrics

If any defect appears, change only `create_scisiam_flyer.py`, rebuild the DOCX, re-export the PDF, and re-render both pages before continuing.

---

### Task 4: Validate content, QR scanning, and print outputs

**Files:**
- Create: `tmp/docs/scisiam_flyer/verify_scisiam_flyer.py`
- Copy: `tmp/docs/scisiam_flyer/rendered/page-1.png` to `output/doc/ใบปลิว_SciSiam_ด้านหน้า.png`
- Copy: `tmp/docs/scisiam_flyer/rendered/page-2.png` to `output/doc/ใบปลิว_SciSiam_ด้านหลัง.png`

**Interfaces:**
- Consumes: DOCX, PDF, final page PNGs
- Produces: pass or fail verification report and final preview images

- [ ] **Step 1: Verify the DOCX package and text**

The verifier must:

```python
from docx import Document

doc = Document(DOCX_PATH)
assert len(doc.sections) == 1
assert round(doc.sections[0].page_width.mm) == 210
assert round(doc.sections[0].page_height.mm) == 297
text = "\n".join(p.text for p in doc.paragraphs)
text += "\n" + "\n".join(cell.text for table in doc.tables for row in table.rows for cell in row.cells)
for required in REQUIRED_COPY:
    assert required in text
```

It must also open the DOCX as ZIP and assert that embedded font parts and font relationships exist.

- [ ] **Step 2: Verify PDF page count and size**

Use:

```python
from pypdf import PdfReader

reader = PdfReader(PDF_PATH)
assert len(reader.pages) == 2
for page in reader.pages:
    width_mm = float(page.mediabox.width) * 25.4 / 72
    height_mm = float(page.mediabox.height) * 25.4 / 72
    assert abs(width_mm - 210) < 0.5
    assert abs(height_mm - 297) < 0.5
```

- [ ] **Step 3: Decode QR codes from the rendered back page**

Use `zxingcpp.read_barcodes()` on `page-2.png`, collect all decoded texts, and compare them with the three exact values from `QR_PAYLOADS`.

Expected: exactly three unique matching payloads.

- [ ] **Step 4: Copy approved renders to their final names**

Run:

```powershell
rtk powershell -NoProfile -Command "Copy-Item -LiteralPath 'D:\Scisiam_app\tmp\docs\scisiam_flyer\rendered\page-1.png' -Destination 'D:\Scisiam_app\output\doc\ใบปลิว_SciSiam_ด้านหน้า.png' -Force; Copy-Item -LiteralPath 'D:\Scisiam_app\tmp\docs\scisiam_flyer\rendered\page-2.png' -Destination 'D:\Scisiam_app\output\doc\ใบปลิว_SciSiam_ด้านหลัง.png' -Force"
```

- [ ] **Step 5: Perform final artifact checks**

Run:

```powershell
rtk powershell -NoProfile -Command "Get-Item -LiteralPath 'D:\Scisiam_app\output\doc\ใบปลิว_SciSiam_A4_หน้าหลัง.docx','D:\Scisiam_app\output\doc\ใบปลิว_SciSiam_A4_หน้าหลัง.pdf','D:\Scisiam_app\output\doc\ใบปลิว_SciSiam_ด้านหน้า.png','D:\Scisiam_app\output\doc\ใบปลิว_SciSiam_ด้านหลัง.png' | Select-Object Name,Length"
```

Expected:

- all four files exist and have non-zero size
- DOCX opens without repair
- PDF has exactly two A4 portrait pages
- front and back PNGs match the latest inspected PDF
- all QR codes scan from the rendered back page
- original app and document files remain unchanged

- [ ] **Step 6: Remove temporary helper code and dependency folders**

Delete only the verified temporary directory:

```text
D:\Scisiam_app\tmp\docs\scisiam_flyer
```

Keep the four final files under `output/doc/`.
