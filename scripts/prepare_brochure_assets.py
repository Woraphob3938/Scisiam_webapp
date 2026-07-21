from __future__ import annotations

import math
import shutil
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
import qrcode


ROOT = Path(r"D:\Scisiam_app")
OUTPUT = ROOT / "output" / "doc" / "assets"
TEMP = ROOT / "tmp" / "brochure-media"
MANUAL = ROOT / "output" / "doc" / "คู่มือการใช้งาน_SciSiam_ฉบับทางการ.docx"
LOGIN_URL = "https://scisiam-app.vercel.app/login"


def make_qr() -> None:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=14,
        border=4,
    )
    qr.add_data(LOGIN_URL)
    qr.make(fit=True)
    image = qr.make_image(fill_color="#0F172A", back_color="white").convert("RGB")
    image.save(OUTPUT / "scisiam-login-qr.png", quality=100)


def extract_manual_media() -> list[Path]:
    if TEMP.exists():
        shutil.rmtree(TEMP)
    TEMP.mkdir(parents=True, exist_ok=True)
    extracted: list[Path] = []
    with zipfile.ZipFile(MANUAL) as archive:
        for name in sorted(archive.namelist()):
            if not name.startswith("word/media/") or name.endswith("/"):
                continue
            target = TEMP / Path(name).name
            target.write_bytes(archive.read(name))
            try:
                with Image.open(target) as image:
                    image.verify()
                extracted.append(target)
            except Exception:
                target.unlink(missing_ok=True)
    return extracted


def make_contact_sheet(files: list[Path]) -> None:
    thumb_w, thumb_h = 360, 220
    label_h, gap = 34, 18
    cols = 3
    rows = max(1, math.ceil(len(files) / cols))
    sheet = Image.new(
        "RGB",
        (
            cols * thumb_w + (cols + 1) * gap,
            rows * (thumb_h + label_h) + (rows + 1) * gap,
        ),
        "#EAF4FF",
    )
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for index, path in enumerate(files):
        row, col = divmod(index, cols)
        x = gap + col * (thumb_w + gap)
        y = gap + row * (thumb_h + label_h + gap)
        with Image.open(path).convert("RGB") as image:
            image.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            canvas = Image.new("RGB", (thumb_w, thumb_h), "white")
            px = (thumb_w - image.width) // 2
            py = (thumb_h - image.height) // 2
            canvas.paste(image, (px, py))
        sheet.paste(canvas, (x, y))
        draw.text((x, y + thumb_h + 8), path.name, fill="#0F172A", font=font)
    sheet.save(TEMP / "contact-sheet.png", quality=94)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    make_qr()
    files = extract_manual_media()
    make_contact_sheet(files)
    print(f"Prepared QR and {len(files)} manual media files")
    print(TEMP / "contact-sheet.png")


if __name__ == "__main__":
    main()
