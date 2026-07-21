from __future__ import annotations

import sys
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
    if not candidate[start]:
        raise ValueError("The center pixel is not part of the white poster area")

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


def report(condition: bool, message: str, failures: list[str]) -> None:
    status = "PASS" if condition else "FAIL"
    print(f"{status}: {message}")
    if not condition:
        failures.append(message)


def main() -> None:
    failures: list[str] = []
    report(SOURCE.exists(), "source poster exists", failures)
    report(OUTPUT.exists(), "main poster output exists", failures)
    report(OUTPUT_4X.exists(), "4x poster output exists", failures)
    if failures:
        print(f"Verification summary: {len(failures)} failure(s)")
        sys.exit(1)

    source_image = Image.open(SOURCE).convert("RGBA")
    result_image = Image.open(OUTPUT).convert("RGBA")
    result_4x = Image.open(OUTPUT_4X).convert("RGBA")

    report(source_image.size == (477, 671), "source poster is 477x671", failures)
    report(result_image.size == source_image.size, "source-size output is 477x671", failures)
    report(result_4x.size == (1908, 2684), "4x output is 1908x2684", failures)

    mask_image = white_component_mask(source_image)
    mask = np.asarray(mask_image) > 0
    source = np.asarray(source_image)
    result = np.asarray(result_image)

    report(np.array_equal(result[~mask], source[~mask]), "every exterior pixel matches the source", failures)
    report(np.any(result[mask] != source[mask]), "interior pixels changed", failures)
    report(int(mask.sum()) > 150_000, "editable white-region mask has plausible area", failures)

    print(f"Verification summary: {len(failures)} failure(s)")
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
