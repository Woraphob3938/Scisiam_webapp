from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(r"D:\Scisiam_app")
SOURCE = Path(r"C:\Users\HP\Downloads\742997668_1053122053958579_4858700568160189945_n.png")
OUTPUT_DIR = ROOT / "output" / "poster"
OUTPUT = OUTPUT_DIR / "poster-scisiam-simulation-lab.png"
OUTPUT_4X = OUTPUT_DIR / "poster-scisiam-simulation-lab-4x.png"

BACKGROUND = OUTPUT_DIR / "assets" / "scisiam-science-background.png"
LOGO = ROOT / "public" / "scisiam-logo.png"
AI_OON = ROOT / "public" / "ai-oon-logo.png"
SIMULATION = ROOT / "output" / "doc" / "assets" / "simulation-preview.png"
QR = ROOT / "output" / "doc" / "assets" / "scisiam-login-qr.png"

FONT_REGULAR = Path(r"C:\Users\HP\AppData\Local\Microsoft\Windows\Fonts\THSarabunNew.ttf")
FONT_BOLD = Path(r"C:\Users\HP\AppData\Local\Microsoft\Windows\Fonts\THSarabunNew Bold.ttf")

SCALE = 4
NAVY = "#0F172A"
BLUE = "#2563EB"
BLUE_DARK = "#1D4ED8"
PALE_BLUE = "#DBEAFE"
VERY_PALE = "#F8FBFF"
SLATE = "#475569"
MUTED = "#64748B"
LINE = "#BFDBFE"
VIOLET = "#7C3AED"
WHITE = "#FFFFFF"


def s(value: float) -> int:
    return round(value * SCALE)


def sb(box: tuple[float, float, float, float]) -> tuple[int, int, int, int]:
    return tuple(s(value) for value in box)  # type: ignore[return-value]


def font(size: float, *, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_BOLD if bold else FONT_REGULAR
    return ImageFont.truetype(str(path), s(size))


def white_component_mask(image: Image.Image) -> Image.Image:
    rgb = np.asarray(image.convert("RGB"))
    candidate = np.all(rgb >= 248, axis=2)
    height, width = candidate.shape
    start = (height // 2, width // 2)
    if not candidate[start]:
        raise ValueError("The source center is not part of the white poster area")

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


def rounded_panel(
    draw: ImageDraw.ImageDraw,
    box: tuple[float, float, float, float],
    *,
    fill: str = WHITE,
    outline: str = LINE,
    radius: float = 6,
    width: float = 0.8,
) -> None:
    draw.rounded_rectangle(
        sb(box),
        radius=s(radius),
        fill=fill,
        outline=outline,
        width=max(1, s(width)),
    )


def draw_centered(
    draw: ImageDraw.ImageDraw,
    box: tuple[float, float, float, float],
    text: str,
    text_font: ImageFont.FreeTypeFont,
    *,
    fill: str = NAVY,
) -> None:
    x1, y1, x2, y2 = sb(box)
    bounds = draw.textbbox((0, 0), text, font=text_font)
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    draw.text(
        ((x1 + x2 - width) / 2, (y1 + y2 - height) / 2 - bounds[1]),
        text,
        font=text_font,
        fill=fill,
    )


def draw_heading(
    draw: ImageDraw.ImageDraw,
    x: float,
    y: float,
    text: str,
    *,
    size: float = 12,
    color: str = BLUE_DARK,
) -> None:
    draw.rounded_rectangle(sb((x, y + 1.5, x + 3.5, y + 11.5)), radius=s(1.5), fill=BLUE)
    draw.text((s(x + 6), s(y)), text, font=font(size, bold=True), fill=color)


def draw_body(
    draw: ImageDraw.ImageDraw,
    x: float,
    y: float,
    text: str,
    *,
    size: float = 8.6,
    fill: str = SLATE,
    spacing: float = 1.4,
) -> None:
    draw.multiline_text(
        (s(x), s(y)),
        text,
        font=font(size),
        fill=fill,
        spacing=s(spacing),
    )


def draw_bullets(
    draw: ImageDraw.ImageDraw,
    x: float,
    y: float,
    lines: list[str],
    *,
    size: float = 8.6,
    line_height: float = 18.5,
    color: str = NAVY,
) -> None:
    bullet_radius = s(1.7)
    text_font = font(size)
    for index, line in enumerate(lines):
        top = y + index * line_height
        center = (s(x + 2), s(top + 5.5))
        draw.ellipse(
            (
                center[0] - bullet_radius,
                center[1] - bullet_radius,
                center[0] + bullet_radius,
                center[1] + bullet_radius,
            ),
            fill=BLUE,
        )
        draw.multiline_text(
            (s(x + 6), s(top)),
            line,
            font=text_font,
            fill=color,
            spacing=s(0.6),
        )


def paste_contained(
    canvas: Image.Image,
    image_path: Path,
    box: tuple[float, float, float, float],
    *,
    padding: float = 0,
) -> None:
    x1, y1, x2, y2 = sb(box)
    x1 += s(padding)
    y1 += s(padding)
    x2 -= s(padding)
    y2 -= s(padding)
    with Image.open(image_path).convert("RGBA") as source:
        image = ImageOps.contain(source, (x2 - x1, y2 - y1), Image.Resampling.LANCZOS)
    destination = (x1 + (x2 - x1 - image.width) // 2, y1 + (y2 - y1 - image.height) // 2)
    canvas.alpha_composite(image, destination)


def paste_rounded_cover(
    canvas: Image.Image,
    image_path: Path,
    box: tuple[float, float, float, float],
    *,
    radius: float = 5,
) -> None:
    x1, y1, x2, y2 = sb(box)
    width, height = x2 - x1, y2 - y1
    with Image.open(image_path).convert("RGBA") as source:
        image = ImageOps.fit(source, (width, height), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    mask = Image.new("L", (width, height), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, width, height), radius=s(radius), fill=255)
    image.putalpha(mask)
    canvas.alpha_composite(image, (x1, y1))


def build_content(
    source_size: tuple[int, int],
    mask_bbox: tuple[int, int, int, int],
    logo_path: Path,
) -> Image.Image:
    width, height = source_size
    canvas = Image.new("RGBA", (width * SCALE, height * SCALE), WHITE)
    draw = ImageDraw.Draw(canvas)

    bx1, by1, bx2, by2 = mask_bbox
    target_box = sb((bx1, by1, bx2, by2))
    with Image.open(BACKGROUND).convert("RGBA") as background:
        fitted = ImageOps.fit(
            background,
            (target_box[2] - target_box[0], target_box[3] - target_box[1]),
            method=Image.Resampling.LANCZOS,
        )
        white_layer = Image.new("RGBA", fitted.size, (255, 255, 255, 110))
        fitted = Image.alpha_composite(fitted, white_layer)
    canvas.alpha_composite(fitted, (target_box[0], target_box[1]))

    # Header
    rounded_panel(draw, (34, 97, 448, 151), fill="#F8FBFF", outline="#93C5FD", radius=8)
    paste_contained(canvas, logo_path, (38, 100, 83, 145), padding=1)
    draw.text((s(91), s(99)), "SciSiam Simulation Lab", font=font(21.5, bold=True), fill=NAVY)
    draw.text(
        (s(92), s(123)),
        "ห้องปฏิบัติการวิทยาศาสตร์เสมือนจริงเพื่อการเรียนรู้",
        font=font(10.4, bold=True),
        fill=BLUE_DARK,
    )
    draw.text(
        (s(92), s(137)),
        "เรียนรู้  ทดลอง  และวิเคราะห์ได้ทุกที่ ทุกเวลา",
        font=font(8.5),
        fill=SLATE,
    )
    paste_contained(canvas, AI_OON, (411, 105, 443, 137), padding=0)
    draw_centered(draw, (404, 136, 448, 148), "AI ไออุ่น", font(7.3, bold=True), fill=VIOLET)

    # Metrics
    metric_boxes = ((34, 157, 165, 188), (170, 157, 301, 188), (306, 157, 448, 188))
    metric_data = (("103", "ห้องทดลอง"), ("5", "กลุ่มวิชา"), ("AI + CLASS", "ผู้ช่วยและชั้นเรียน"))
    metric_colors = ("#EFF6FF", "#EEF2FF", "#F5F3FF")
    for box, (value, label), color in zip(metric_boxes, metric_data, metric_colors):
        rounded_panel(draw, box, fill=color, outline="#C7D2FE", radius=5)
        draw_centered(draw, (box[0], box[1] + 1, box[2], box[1] + 18), value, font(13, bold=True), fill=BLUE_DARK)
        draw_centered(draw, (box[0], box[1] + 17, box[2], box[3] - 1), label, font(7.6), fill=SLATE)

    # Left column: problem and objectives
    rounded_panel(draw, (34, 194, 199, 284), fill="#FFFFFFEE", outline=LINE, radius=6)
    draw_heading(draw, 42, 201, "ปัญหาและที่มา", size=12)
    draw_body(
        draw,
        42,
        220,
        "ข้อจำกัดด้านอุปกรณ์ ค่าใช้จ่าย เวลา\nและความปลอดภัย ทำให้ผู้เรียนบางส่วน\nขาดโอกาสทดลองซ้ำ และเชื่อมโยง\nทฤษฎีกับผลที่สังเกตได้จริง",
        size=8.5,
        spacing=1.2,
    )

    rounded_panel(draw, (34, 290, 199, 412), fill="#FFFFFFEE", outline=LINE, radius=6)
    draw_heading(draw, 42, 297, "วัตถุประสงค์", size=12)
    draw_bullets(
        draw,
        42,
        319,
        [
            "เพิ่มโอกาสเข้าถึงการทดลอง\nอย่างเท่าเทียม",
            "เรียนรู้ผ่านการลงมือทำ\nและการปรับตัวแปร",
            "สนับสนุนคุณครูในการจัดกิจกรรม\nมอบหมายงาน และติดตามผล",
        ],
        size=8.3,
        line_height=28,
    )

    # Right column: real simulation and innovations
    rounded_panel(draw, (205, 194, 448, 326), fill="#FFFFFFEE", outline=LINE, radius=6)
    draw_heading(draw, 213, 199, "ตัวอย่างการทดลองเสมือนจริง", size=10.7)
    paste_rounded_cover(canvas, SIMULATION, (213, 218, 440, 317), radius=4)

    rounded_panel(draw, (205, 332, 448, 412), fill="#FFFFFFEE", outline=LINE, radius=6)
    draw_heading(draw, 213, 337, "จุดเด่นและนวัตกรรม", size=11.3)
    draw_bullets(
        draw,
        213,
        357,
        [
            "Simulation และค่าที่วัดได้ตอบสนองแบบทันที",
            "กราฟ ตาราง และบันทึกผลการทดลอง",
            "AI ไออุ่นช่วยอธิบายแนวคิดระหว่างเรียนรู้",
            "ระบบชั้นเรียน มอบหมายงาน และประเมินผล",
        ],
        size=7.8,
        line_height=12.4,
    )

    # Learning process
    rounded_panel(draw, (34, 418, 448, 462), fill="#EFF6FF", outline="#93C5FD", radius=6)
    draw.text((s(42), s(423)), "กระบวนการเรียนรู้", font=font(10.5, bold=True), fill=BLUE_DARK)
    steps = ("เลือกห้องทดลอง", "ปรับตัวแปร", "สังเกตและวิเคราะห์", "บันทึกผล")
    step_boxes = ((42, 440, 128, 456), (139, 440, 215, 456), (226, 440, 343, 456), (354, 440, 440, 456))
    for index, (label, box) in enumerate(zip(steps, step_boxes)):
        draw.rounded_rectangle(sb(box), radius=s(4), fill=BLUE if index % 2 == 0 else BLUE_DARK)
        draw_centered(draw, box, label, font(7.2, bold=True), fill=WHITE)
        if index < len(step_boxes) - 1:
            x = s(box[2] + 4)
            y = s((box[1] + box[3]) / 2)
            draw.line((x, y, x + s(5), y), fill=VIOLET, width=s(1))
            draw.polygon(((x + s(5), y), (x + s(2), y - s(2)), (x + s(2), y + s(2))), fill=VIOLET)

    # Benefits and technology
    rounded_panel(draw, (34, 468, 300, 545), fill="#FFFFFFEE", outline=LINE, radius=6)
    draw_heading(draw, 42, 473, "ประโยชน์ต่อการเรียนรู้", size=11.3)
    draw_bullets(
        draw,
        42,
        494,
        [
            "นักเรียน: ทดลองซ้ำได้อย่างปลอดภัย",
            "คุณครู: จัดการชั้นเรียนได้ในระบบเดียว",
            "สถานศึกษา: ลดข้อจำกัดด้านอุปกรณ์",
        ],
        size=8.0,
        line_height=13.8,
    )

    rounded_panel(draw, (34, 551, 300, 592), fill="#F8FAFC", outline=LINE, radius=6)
    draw.text((s(42), s(555)), "เทคโนโลยี", font=font(9.2, bold=True), fill=BLUE_DARK)
    tech = ("Next.js", "React", "TypeScript", "Supabase", "AI Tutor")
    x = 42.0
    for label in tech:
        label_font = font(6.9, bold=True)
        text_width = draw.textlength(label, font=label_font) / SCALE
        chip_width = text_width + 10
        if x + chip_width > 292:
            x = 42
            chip_y = 576
        else:
            chip_y = 568
        draw.rounded_rectangle(sb((x, chip_y, x + chip_width, chip_y + 14)), radius=s(3), fill="#E0E7FF")
        draw_centered(draw, (x, chip_y, x + chip_width, chip_y + 14), label, label_font, fill=BLUE_DARK)
        x += chip_width + 4

    # QR call-to-action
    rounded_panel(draw, (306, 468, 448, 592), fill="#FFFFFFEE", outline="#A5B4FC", radius=7)
    draw_centered(draw, (312, 472, 442, 489), "ทดลองใช้งาน SciSiam", font(9.3, bold=True), fill=BLUE_DARK)
    paste_contained(canvas, QR, (326, 490, 403, 565), padding=1)
    paste_contained(canvas, AI_OON, (407, 500, 438, 531), padding=0)
    draw_centered(draw, (405, 533, 442, 547), "สแกนเพื่อเริ่ม", font(7.0, bold=True), fill=VIOLET)
    draw_centered(draw, (310, 567, 444, 579), "scisiam-app.vercel.app/login", font(6.4), fill=SLATE)
    draw_centered(draw, (310, 579, 444, 590), "Web App  •  Windows", font(6.3, bold=True), fill=BLUE)

    return canvas


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build the SciSiam NSC poster")
    parser.add_argument("--logo", type=Path, default=LOGO)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--output-4x", type=Path, default=OUTPUT_4X)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    required = (SOURCE, BACKGROUND, args.logo, AI_OON, SIMULATION, QR, FONT_REGULAR, FONT_BOLD)
    missing = [path for path in required if not path.exists()]
    if missing:
        raise FileNotFoundError("Missing required files: " + ", ".join(map(str, missing)))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output_4x.parent.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGBA")
    mask = white_component_mask(source)
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("No editable white region was detected")

    content_4x = build_content(source.size, bbox, args.logo)
    content_source = content_4x.resize(source.size, Image.Resampling.LANCZOS)
    result = Image.composite(content_source, source, mask)
    result.save(args.output, optimize=True)

    source_4x = source.resize((source.width * SCALE, source.height * SCALE), Image.Resampling.LANCZOS)
    mask_4x = mask.resize(source_4x.size, Image.Resampling.NEAREST)
    result_4x = Image.composite(content_4x, source_4x, mask_4x)
    result_4x.save(args.output_4x, optimize=True)

    print(args.output)
    print(args.output_4x)
    print(f"Editable mask bounds: {bbox}")


if __name__ == "__main__":
    main()
