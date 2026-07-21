# SciSiam Mathematics Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างสัญลักษณ์ SciSiam รุ่นใหม่ที่เพิ่มคณิตศาสตร์ และเปลี่ยนเฉพาะช่องโลโก้เดิมในโปสเตอร์

**Architecture:** ใช้ built-in image generation สร้างไอคอนบนพื้นหลังโครมาคีย์ แล้วแปลงเป็น PNG โปร่งใสด้วยตัวช่วยของ imagegen skill ปรับสคริปต์สร้างโปสเตอร์ให้รับพาธโลโก้และพาธผลลัพธ์ผ่านอาร์กิวเมนต์ เพื่อสร้างไฟล์รุ่นใหม่โดยไม่เขียนทับเดิม จากนั้นเปรียบเทียบพิกเซลโปสเตอร์เดิมกับรุ่นใหม่เพื่อยืนยันว่าความแตกต่างอยู่ในช่องโลโก้เท่านั้น

**Tech Stack:** built-in image generation, Python 3, Pillow, NumPy

## Global Constraints

- ใช้แนวทาง A: ขวดทดลองตรงกลาง ล้อมด้วยอะตอม โมเลกุล ใบไม้ และวงกลมสีส้มพร้อม `π`
- พื้นหลังโลโก้ต้องโปร่งใส
- เปลี่ยนเฉพาะช่องโลโก้เดิมประมาณ `x=38–83, y=100–145`
- ข้อความ ส่วนหัว เนื้อหา และขอบ NSC ห้ามเปลี่ยน
- สร้างไฟล์ผลลัพธ์ใหม่และไม่เขียนทับโปสเตอร์เดิม
- ไม่ commit หรือ push เนื่องจากผู้ใช้ไม่ได้ขอ

---

### Task 1: Create the Failing Verification Gate

**Files:**
- Create: `scripts/verify_scisiam_math_logo.py`

**Interfaces:**
- Consumes: old poster, new logo, new poster, new 4× poster
- Produces: exit code `0` only when transparency and pixel-difference bounds pass

- [ ] **Step 1: Write the verifier**

```python
from pathlib import Path
import numpy as np
from PIL import Image

OLD = Path(r"D:\Scisiam_app\output\poster\poster-scisiam-simulation-lab.png")
NEW = Path(r"D:\Scisiam_app\output\poster\poster-scisiam-simulation-lab-math.png")
NEW_4X = Path(r"D:\Scisiam_app\output\poster\poster-scisiam-simulation-lab-math-4x.png")
LOGO = Path(r"D:\Scisiam_app\output\poster\assets\scisiam-current-logo.png")

def main() -> None:
    assert LOGO.exists(), "new logo is missing"
    assert NEW.exists(), "new source-size poster is missing"
    assert NEW_4X.exists(), "new 4x poster is missing"
    logo = Image.open(LOGO).convert("RGBA")
    assert logo.width >= 1024 and logo.height >= 1024
    alpha = np.asarray(logo.getchannel("A"))
    assert alpha[0, 0] == 0 and alpha[-1, -1] == 0
    assert 0.10 < np.count_nonzero(alpha) / alpha.size < 0.80
    old = np.asarray(Image.open(OLD).convert("RGBA"))
    new = np.asarray(Image.open(NEW).convert("RGBA"))
    changed = np.any(old != new, axis=2)
    ys, xs = np.where(changed)
    assert xs.min() >= 38 and xs.max() < 83
    assert ys.min() >= 100 and ys.max() < 145
    assert Image.open(NEW_4X).size == (1908, 2684)
```

- [ ] **Step 2: Run the verifier and confirm failure**

Run:

```powershell
rtk proxy "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" "D:\Scisiam_app\scripts\verify_scisiam_math_logo.py"
```

Expected: exit code `1` with `new logo is missing`.

### Task 2: Generate and Extract the Updated Logo

**Files:**
- Create: `output/poster/assets/scisiam-current-logo-chroma.png`
- Create: `output/poster/assets/scisiam-current-logo.png`

**Interfaces:**
- Consumes: `public/scisiam-logo.png` as a style reference
- Produces: a square transparent PNG logo

- [ ] **Step 1: Generate the logo with built-in image generation**

Use the existing logo as a reference image and this prompt:

```text
Use case: logo-brand
Asset type: compact SciSiam subject emblem for a small academic poster header
Primary request: redesign the supplied SciSiam emblem while preserving its clean rounded vector-like language and central blue laboratory flask; add mathematics as a clearly visible fourth subject node
Input image: the supplied SciSiam logo is the style and composition reference
Composition: central blue flask, four evenly balanced circular subject nodes around it, connected by a smooth segmented orbit ring
Subject nodes: blue atom for physics, violet molecule for chemistry, green leaf for biology, orange circle containing exactly one white Greek lowercase pi symbol “π” for mathematics
Palette: #2563EB, #7C3AED, #22C55E, #F59E0B, white
Background: perfectly flat solid #FF00FF chroma key
Constraints: square, centered, generous padding, crisp thick shapes readable at 45 pixels, no words, no brand name, no extra symbols, no shadows, no gradients in the background, no watermark, do not use #FF00FF in the emblem
```

- [ ] **Step 2: Copy the generated file into the project as the chroma source**

Destination:

```text
D:\Scisiam_app\output\poster\assets\scisiam-current-logo-chroma.png
```

- [ ] **Step 3: Remove the chroma background**

Run:

```powershell
rtk proxy "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" "C:\Users\HP\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py" --input "D:\Scisiam_app\output\poster\assets\scisiam-current-logo-chroma.png" --out "D:\Scisiam_app\output\poster\assets\scisiam-current-logo.png" --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill
```

Expected: RGBA PNG with transparent corners and no visible magenta fringe.

### Task 3: Parameterize the Poster Builder and Create the Math Version

**Files:**
- Modify: `scripts/build_scisiam_nsc_poster.py`
- Create: `output/poster/poster-scisiam-simulation-lab-math.png`
- Create: `output/poster/poster-scisiam-simulation-lab-math-4x.png`

**Interfaces:**
- Consumes: `--logo`, `--output`, and `--output-4x` command-line arguments
- Produces: new poster files without changing the prior outputs

- [ ] **Step 1: Add explicit command-line arguments**

```python
import argparse

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--logo", type=Path, default=LOGO)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--output-4x", type=Path, default=OUTPUT_4X)
    return parser.parse_args()
```

- [ ] **Step 2: Pass the selected logo into the content builder**

```python
def build_content(
    source_size: tuple[int, int],
    mask_bbox: tuple[int, int, int, int],
    logo_path: Path,
) -> Image.Image:
    paste_contained(canvas, logo_path, (38, 100, 83, 145), padding=1)
```

Replace the existing header call exactly:

```python
paste_contained(canvas, LOGO, (38, 100, 83, 145), padding=1)
```

with:

```python
paste_contained(canvas, logo_path, (38, 100, 83, 145), padding=1)
```

- [ ] **Step 3: Build the new poster files**

Run:

```powershell
rtk proxy "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" "D:\Scisiam_app\scripts\build_scisiam_nsc_poster.py" --logo "D:\Scisiam_app\output\poster\assets\scisiam-current-logo.png" --output "D:\Scisiam_app\output\poster\poster-scisiam-simulation-lab-math.png" --output-4x "D:\Scisiam_app\output\poster\poster-scisiam-simulation-lab-math-4x.png"
```

Expected: both new output paths print with exit code `0`.

### Task 4: Verify and Inspect

**Files:**
- Test: `scripts/verify_scisiam_math_logo.py`
- Inspect: `output/poster/assets/scisiam-current-logo.png`
- Inspect: `output/poster/poster-scisiam-simulation-lab-math-4x.png`

**Interfaces:**
- Consumes: completed logo and poster files
- Produces: pixel-bound evidence and visual approval

- [ ] **Step 1: Run the full verifier**

Run:

```powershell
rtk proxy "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" "D:\Scisiam_app\scripts\verify_scisiam_math_logo.py"
```

Expected:

```text
PASS: transparent logo exists
PASS: source-size poster exists
PASS: 4x poster exists
PASS: changed pixels are limited to the original logo box
Verification summary: 0 failure(s)
```

- [ ] **Step 2: Inspect the transparent logo and poster visually**

Confirm that the orange `π` node is readable, the emblem is balanced, no magenta fringe remains, and all other poster content is unchanged.

- [ ] **Step 3: Deliver without committing**

Provide links to the transparent logo and the two new poster files, and show the new poster inline.
