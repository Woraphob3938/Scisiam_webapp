# SciSiam NSC Poster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เติมข้อมูลโครงการ SciSiam Simulation Lab เฉพาะภายในกรอบสีขาวของโปสเตอร์ NSC โดยรักษาพื้นที่ขอบ โลโก้ และข้อความเดิมทุกพิกเซล

**Architecture:** ใช้ภาพต้นฉบับเป็นชั้นฐาน สร้างมาสก์จากพื้นที่สีขาวที่เชื่อมต่อกับจุดกึ่งกลาง แล้วกัดขอบมาสก์เข้าเล็กน้อยเพื่อไม่ให้แตะกรอบสีฟ้า สร้างงานภายในที่ความละเอียด 4 เท่าด้วย Pillow โดยใช้พื้นหลังลายวิทยาศาสตร์จาก built-in image generation เป็นองค์ประกอบรอง จากนั้นย่อเฉพาะงานภายในกลับสู่ขนาดต้นฉบับและประกอบผ่านมาสก์

**Tech Stack:** Python 3, Pillow, NumPy, built-in image generation, PNG

## Global Constraints

- แก้ไขเฉพาะพื้นที่สีขาวตรงกลาง รวมถึงไม่ล้ำมุมเฉียงซ้ายบนและขวาล่าง
- พื้นที่นอกมาสก์ในไฟล์ 477 × 671 ต้องเหมือนต้นฉบับทุกพิกเซล
- ห้ามแก้โลโก้ NSC ข้อความส่วนหัว ภาพมุมล่างซ้าย แถบสีฟ้า และกลุ่มโลโก้ด้านล่าง
- ข้อความทั้งหมดวางแบบกำหนดตำแหน่งด้วย TH Sarabun New ห้ามให้โมเดลภาพสร้างข้อความ
- เก็บต้นฉบับเดิมไว้และสร้างไฟล์ใหม่ใน `output/poster/`
- ไม่ commit หรือ push เนื่องจากผู้ใช้ไม่ได้ขอ

---

## File Map

- Create: `scripts/build_scisiam_nsc_poster.py` — ตรวจจับกรอบสีขาว วาดเนื้อหา และประกอบผลลัพธ์
- Create: `scripts/verify_scisiam_nsc_poster.py` — ตรวจขนาดไฟล์และความเหมือนของพิกเซลภายนอกมาสก์
- Create: `output/poster/assets/scisiam-science-background.png` — พื้นหลังวิทยาศาสตร์อ่อน ไม่มีข้อความ
- Create: `output/poster/poster-scisiam-simulation-lab.png` — ผลลัพธ์ขนาดต้นฉบับ
- Create: `output/poster/poster-scisiam-simulation-lab-4x.png` — ผลลัพธ์ขนาด 4 เท่า

### Task 1: Create the Pixel-Preservation Verification Gate

**Files:**
- Create: `scripts/verify_scisiam_nsc_poster.py`

**Interfaces:**
- Consumes: input poster path, output poster path, 4× output path
- Produces: process exit code `0` only when dimensions and exterior pixels pass

- [ ] **Step 1: Write the verification script before the output exists**

```python
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

SOURCE = Path(r"C:\Users\HP\Downloads\742997668_1053122053958579_4858700568160189945_n.png")
OUTPUT = Path(r"D:\Scisiam_app\output\poster\poster-scisiam-simulation-lab.png")
OUTPUT_4X = Path(r"D:\Scisiam_app\output\poster\poster-scisiam-simulation-lab-4x.png")

def white_component_mask(image: Image.Image) -> Image.Image:
    rgb = np.asarray(image.convert("RGB"))
    candidate = np.all(rgb >= 248, axis=2)
    height, width = candidate.shape
    start = (height // 2, width // 2)
    stack = [start]
    visited = np.zeros_like(candidate, dtype=bool)
    while stack:
        y, x = stack.pop()
        if y < 0 or y >= height or x < 0 or x >= width:
            continue
        if visited[y, x] or not candidate[y, x]:
            continue
        visited[y, x] = True
        stack.extend(((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)))
    mask = Image.fromarray((visited * 255).astype("uint8"), "L")
    return mask.filter(ImageFilter.MinFilter(5))

def main() -> None:
    assert OUTPUT.exists(), "main poster output is missing"
    assert OUTPUT_4X.exists(), "4x poster output is missing"
    source = np.asarray(Image.open(SOURCE).convert("RGBA"))
    result = np.asarray(Image.open(OUTPUT).convert("RGBA"))
    mask = np.asarray(white_component_mask(Image.open(SOURCE))) > 0
    assert result.shape == source.shape
    assert np.array_equal(result[~mask], source[~mask])
    assert np.any(result[mask] != source[mask])
    assert Image.open(OUTPUT_4X).size == (1908, 2684)
```

- [ ] **Step 2: Run the gate and confirm the expected failure**

Run:

```powershell
rtk proxy "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" "D:\Scisiam_app\scripts\verify_scisiam_nsc_poster.py"
```

Expected: exit code `1` with `main poster output is missing`.

### Task 2: Generate the Interior Background Asset

**Files:**
- Create: `output/poster/assets/scisiam-science-background.png`

**Interfaces:**
- Consumes: SciSiam palette and the approved poster direction
- Produces: a portrait, text-free, low-contrast scientific background used only inside the mask

- [ ] **Step 1: Generate one supporting background with built-in image generation**

Prompt:

```text
Use case: scientific-educational
Asset type: supporting background for the white interior of a portrait academic competition poster
Primary request: create a clean, restrained abstract science and technology background for SciSiam Simulation Lab
Scene/backdrop: white to very pale sky-blue field with extremely subtle molecular nodes, thin scientific grid lines, soft blue and violet gradient arcs only near the corners
Style/medium: polished academic infographic background, modern Thai educational technology brand
Composition/framing: portrait, generous central negative space, low visual density
Color palette: white, #F8FBFF, #DBEAFE, #2563EB, restrained violet accents
Text: none
Constraints: no logos, no words, no letters, no numbers, no people, no mascots, no strong border, no watermark
```

- [ ] **Step 2: Copy the generated image into the project**

Copy the selected built-in output to:

```text
D:\Scisiam_app\output\poster\assets\scisiam-science-background.png
```

### Task 3: Build the Poster Interior and Composite Through the Mask

**Files:**
- Create: `scripts/build_scisiam_nsc_poster.py`
- Create: `output/poster/poster-scisiam-simulation-lab.png`
- Create: `output/poster/poster-scisiam-simulation-lab-4x.png`

**Interfaces:**
- Consumes: source poster, background asset, `public/scisiam-logo.png`, `public/ai-oon-logo.png`, `output/doc/assets/simulation-preview.png`, `output/doc/assets/scisiam-login-qr.png`
- Produces: the two final poster PNG files

- [ ] **Step 1: Implement the same central-component mask used by verification**

```python
def white_component_mask(image: Image.Image) -> Image.Image:
    rgb = np.asarray(image.convert("RGB"))
    candidate = np.all(rgb >= 248, axis=2)
    height, width = candidate.shape
    start = (height // 2, width // 2)
    stack = [start]
    visited = np.zeros_like(candidate, dtype=bool)
    while stack:
        y, x = stack.pop()
        if y < 0 or y >= height or x < 0 or x >= width:
            continue
        if visited[y, x] or not candidate[y, x]:
            continue
        visited[y, x] = True
        stack.extend(((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)))
    mask = Image.fromarray((visited * 255).astype("uint8"), "L")
    return mask.filter(ImageFilter.MinFilter(5))
```

- [ ] **Step 2: Build a 4× content canvas inside the mask bounds**

Use these layout regions relative to the detected white-area bounding box:

```python
HEADER = (0.03, 0.02, 0.97, 0.15)
METRICS = (0.03, 0.16, 0.97, 0.23)
LEFT_COLUMN = (0.03, 0.25, 0.43, 0.67)
RIGHT_COLUMN = (0.45, 0.25, 0.97, 0.67)
PROCESS = (0.03, 0.69, 0.97, 0.78)
BOTTOM_LEFT = (0.03, 0.80, 0.72, 0.97)
BOTTOM_RIGHT = (0.74, 0.80, 0.97, 0.97)
```

Draw exact text with these fonts:

```python
FONT_REGULAR = Path(r"C:\Users\HP\AppData\Local\Microsoft\Windows\Fonts\THSarabunNew.ttf")
FONT_BOLD = Path(r"C:\Users\HP\AppData\Local\Microsoft\Windows\Fonts\THSarabunNew Bold.ttf")
```

The visible sections must be:

```text
SciSiam Simulation Lab
ห้องปฏิบัติการวิทยาศาสตร์เสมือนจริงเพื่อการเรียนรู้
ปัญหาและที่มา
วัตถุประสงค์
จุดเด่นและนวัตกรรม
เลือกห้องทดลอง → ปรับตัวแปร → สังเกตและวิเคราะห์ → บันทึกผล
ประโยชน์ต่อการเรียนรู้
ทดลองใช้งาน SciSiam
```

- [ ] **Step 3: Composite without changing exterior pixels**

```python
source = Image.open(SOURCE).convert("RGBA")
mask = white_component_mask(source)
result = Image.composite(content_at_source_size, source, mask)
result.save(OUTPUT)

source_4x = source.resize((source.width * 4, source.height * 4), Image.Resampling.LANCZOS)
mask_4x = mask.resize(source_4x.size, Image.Resampling.NEAREST)
result_4x = Image.composite(content_4x, source_4x, mask_4x)
result_4x.save(OUTPUT_4X)
```

- [ ] **Step 4: Run the builder**

Run:

```powershell
rtk proxy "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" "D:\Scisiam_app\scripts\build_scisiam_nsc_poster.py"
```

Expected: both output paths printed with exit code `0`.

### Task 4: Verify and Inspect the Final Poster

**Files:**
- Test: `scripts/verify_scisiam_nsc_poster.py`
- Inspect: `output/poster/poster-scisiam-simulation-lab.png`
- Inspect: `output/poster/poster-scisiam-simulation-lab-4x.png`

**Interfaces:**
- Consumes: completed poster files
- Produces: verification evidence and visual approval

- [ ] **Step 1: Run the full verification gate**

Run:

```powershell
rtk proxy "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" "D:\Scisiam_app\scripts\verify_scisiam_nsc_poster.py"
```

Expected:

```text
PASS: source-size output is 477x671
PASS: 4x output is 1908x2684
PASS: every exterior pixel matches the source
PASS: interior pixels changed
Verification summary: 0 failure(s)
```

- [ ] **Step 2: Inspect both rendered files visually**

Confirm:

- The top and bottom NSC branding remain unchanged.
- No new pixel crosses into the blue border.
- Thai text is readable and not clipped.
- Screenshots and QR Code remain undistorted.
- The academic reading order is clear from top to bottom.

- [ ] **Step 3: Deliver the files without committing**

Provide clickable links to the two PNG files and show the source-size result inline.
