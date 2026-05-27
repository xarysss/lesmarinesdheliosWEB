"""Convert all JPG/PNG images under image/ and assets/img/ to WebP.

- JPEGs use lossy WebP at quality 82 (visually lossless, ~70% smaller).
- PNGs use lossless WebP if alpha channel is present, else lossy at q=85.
- Originals are preserved; .webp siblings are created next to them.
- Skips files where a fresher .webp already exists.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).parent
TARGETS = [ROOT / "image", ROOT / "assets" / "img"]
EXTS = {".jpg", ".jpeg", ".png"}


def convert(path: Path) -> tuple[int, int] | None:
    out = path.with_suffix(".webp")
    if out.exists() and out.stat().st_mtime >= path.stat().st_mtime:
        return None  # up to date
    try:
        with Image.open(path) as im:
            im = ImageOps.exif_transpose(im)  # honor EXIF orientation
            has_alpha = im.mode in ("RGBA", "LA") or (
                im.mode == "P" and "transparency" in im.info
            )
            if has_alpha:
                im = im.convert("RGBA")
                im.save(out, "WEBP", lossless=True, method=6)
            else:
                im = im.convert("RGB")
                q = 85 if path.suffix.lower() == ".png" else 82
                im.save(out, "WEBP", quality=q, method=6)
    except Exception as e:  # noqa: BLE001
        print(f"  ! failed {path.name}: {e}", file=sys.stderr)
        return None
    return path.stat().st_size, out.stat().st_size


def main() -> None:
    total_in = total_out = converted = skipped = 0
    for base in TARGETS:
        if not base.exists():
            continue
        for p in base.rglob("*"):
            if p.suffix.lower() not in EXTS:
                continue
            res = convert(p)
            if res is None:
                skipped += 1
                continue
            converted += 1
            total_in += res[0]
            total_out += res[1]
            print(f"  ok {p.relative_to(ROOT)}  {res[0]/1024:.0f}KB -> {res[1]/1024:.0f}KB")
    print()
    print(f"Converted: {converted}    Skipped: {skipped}")
    if total_in:
        saved = total_in - total_out
        print(f"Size: {total_in/1024/1024:.1f}MB -> {total_out/1024/1024:.1f}MB  "
              f"(saved {saved/1024/1024:.1f}MB, {saved*100/total_in:.0f}%)")


if __name__ == "__main__":
    main()
