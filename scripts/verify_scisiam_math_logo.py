from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(r"D:\Scisiam_app")
OLD = ROOT / "output" / "poster" / "poster-scisiam-simulation-lab.png"
OLD_4X = ROOT / "output" / "poster" / "poster-scisiam-simulation-lab-4x.png"
NEW = ROOT / "output" / "poster" / "poster-scisiam-simulation-lab-math.png"
NEW_4X = ROOT / "output" / "poster" / "poster-scisiam-simulation-lab-math-4x.png"
LOGO = ROOT / "output" / "poster" / "assets" / "scisiam-current-logo.png"


def report(condition: bool, message: str, failures: list[str]) -> None:
    status = "PASS" if condition else "FAIL"
    print(f"{status}: {message}")
    if not condition:
        failures.append(message)


def diff_bounds(old: Image.Image, new: Image.Image) -> tuple[int, int, int, int] | None:
    old_pixels = np.asarray(old.convert("RGBA"))
    new_pixels = np.asarray(new.convert("RGBA"))
    changed = np.any(old_pixels != new_pixels, axis=2)
    if not changed.any():
        return None
    ys, xs = np.where(changed)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def has_palette_color(rgb: np.ndarray, alpha: np.ndarray, target: tuple[int, int, int], tolerance: int = 65) -> bool:
    opaque = alpha > 128
    difference = rgb.astype(np.int32) - np.asarray(target, dtype=np.int32)
    distance = np.sqrt(np.sum(difference * difference, axis=2))
    return bool(np.any((distance < tolerance) & opaque))


def main() -> None:
    failures: list[str] = []
    for path, label in (
        (OLD, "original source-size poster exists"),
        (OLD_4X, "original 4x poster exists"),
        (LOGO, "transparent logo exists"),
        (NEW, "new source-size poster exists"),
        (NEW_4X, "new 4x poster exists"),
    ):
        report(path.exists(), label, failures)
    if failures:
        print(f"Verification summary: {len(failures)} failure(s)")
        sys.exit(1)

    logo = Image.open(LOGO).convert("RGBA")
    report(logo.width >= 1024 and logo.height >= 1024, "logo resolution is at least 1024x1024", failures)
    alpha = np.asarray(logo.getchannel("A"))
    rgb = np.asarray(logo)[:, :, :3]
    coverage = np.count_nonzero(alpha > 0) / alpha.size
    report(alpha[0, 0] == 0 and alpha[0, -1] == 0 and alpha[-1, 0] == 0 and alpha[-1, -1] == 0, "logo corners are transparent", failures)
    report(0.10 < coverage < 0.80, "logo transparent-area coverage is plausible", failures)
    opaque_magenta = (rgb[:, :, 0] > 235) & (rgb[:, :, 1] < 45) & (rgb[:, :, 2] > 235) & (alpha > 128)
    report(not opaque_magenta.any(), "no opaque chroma-key magenta remains", failures)
    report(has_palette_color(rgb, alpha, (37, 99, 235)), "logo contains the SciSiam blue", failures)
    report(has_palette_color(rgb, alpha, (124, 58, 237)), "logo contains the chemistry violet", failures)
    report(has_palette_color(rgb, alpha, (34, 197, 94)), "logo contains the biology green", failures)
    report(has_palette_color(rgb, alpha, (245, 158, 11)), "logo contains the mathematics orange", failures)

    old = Image.open(OLD).convert("RGBA")
    new = Image.open(NEW).convert("RGBA")
    old_4x = Image.open(OLD_4X).convert("RGBA")
    new_4x = Image.open(NEW_4X).convert("RGBA")
    report(new.size == (477, 671), "new source-size poster is 477x671", failures)
    report(new_4x.size == (1908, 2684), "new 4x poster is 1908x2684", failures)

    bounds = diff_bounds(old, new)
    report(bounds is not None, "the logo area changed", failures)
    if bounds is not None:
        x1, y1, x2, y2 = bounds
        report(x1 >= 38 and x2 <= 83 and y1 >= 100 and y2 <= 145, f"changed pixels stay inside the logo box: {bounds}", failures)

    bounds_4x = diff_bounds(old_4x, new_4x)
    report(bounds_4x is not None, "the 4x logo area changed", failures)
    if bounds_4x is not None:
        x1, y1, x2, y2 = bounds_4x
        report(
            x1 >= 38 * 4 and x2 <= 83 * 4 and y1 >= 100 * 4 and y2 <= 145 * 4,
            f"4x changed pixels stay inside the logo box: {bounds_4x}",
            failures,
        )

    print(f"Verification summary: {len(failures)} failure(s)")
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
