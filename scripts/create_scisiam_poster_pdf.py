from __future__ import annotations

from pathlib import Path

from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(r"D:\Scisiam_app")
SOURCE = ROOT / "output" / "poster" / "poster-scisiam-simulation-lab-math-4x.png"
OUTPUT = ROOT / "output" / "pdf" / "SciSiam-Simulation-Lab-Poster-HD.pdf"


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)

    with Image.open(SOURCE) as image:
        image.verify()
    with Image.open(SOURCE) as image:
        pixel_width, pixel_height = image.size

    page_width, page_height = A4
    image_ratio = pixel_width / pixel_height
    page_ratio = page_width / page_height

    if image_ratio >= page_ratio:
        draw_width = page_width
        draw_height = page_width / image_ratio
    else:
        draw_height = page_height
        draw_width = page_height * image_ratio

    x = (page_width - draw_width) / 2
    y = (page_height - draw_height) / 2

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(
        str(OUTPUT),
        pagesize=A4,
        pageCompression=1,
        pdfVersion=(1, 7),
    )
    pdf.setTitle("SciSiam Simulation Lab Poster")
    pdf.setAuthor("SciSiam")
    pdf.setSubject("SciSiam Simulation Lab academic poster")
    pdf.setFillColorRGB(1, 1, 1)
    pdf.rect(0, 0, page_width, page_height, fill=1, stroke=0)
    pdf.drawImage(
        ImageReader(str(SOURCE)),
        x,
        y,
        width=draw_width,
        height=draw_height,
        preserveAspectRatio=True,
        anchor="c",
        mask="auto",
    )
    pdf.showPage()
    pdf.save()

    printable_width_inches = draw_width / 72
    printable_height_inches = draw_height / 72
    print(OUTPUT)
    print(f"A4 points: {page_width:.2f} x {page_height:.2f}")
    print(f"Placed image: {draw_width:.2f} x {draw_height:.2f} points")
    print(
        "Effective resolution: "
        f"{pixel_width / printable_width_inches:.1f} x "
        f"{pixel_height / printable_height_inches:.1f} DPI"
    )


if __name__ == "__main__":
    main()
