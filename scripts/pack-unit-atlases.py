#!/usr/bin/env python3
"""Pack deterministic Blender frames into Phaser-compatible WebP atlases."""

from __future__ import annotations

import json
import math
import re
import sys
from pathlib import Path

from PIL import Image


FRAME_PATTERN = re.compile(r"(?P<family>.+)__(?P<state>.+)__d(?P<direction>\d+)__f(?P<frame>\d+)\.png$")


def pack_family(family: str, files: list[Path], output_dir: Path) -> None:
    files.sort(key=lambda path: path.name)
    first = Image.open(files[0]).convert("RGBA")
    frame_width, frame_height = first.size
    columns = min(16, len(files))
    rows = math.ceil(len(files) / columns)
    atlas = Image.new("RGBA", (columns * frame_width, rows * frame_height), (0, 0, 0, 0))
    frames: dict[str, object] = {}

    for index, path in enumerate(files):
        image = Image.open(path).convert("RGBA")
        if image.size != (frame_width, frame_height):
            raise ValueError(f"Frame size mismatch: {path}")
        x = (index % columns) * frame_width
        y = (index // columns) * frame_height
        atlas.alpha_composite(image, (x, y))
        match = FRAME_PATTERN.match(path.name)
        if not match:
            raise ValueError(f"Unexpected frame name: {path.name}")
        key = f"{match.group('state')}/d{match.group('direction')}/f{match.group('frame')}"
        frames[key] = {
            "frame": {"x": x, "y": y, "w": frame_width, "h": frame_height},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": frame_width, "h": frame_height},
            "sourceSize": {"w": frame_width, "h": frame_height},
        }

    output_dir.mkdir(parents=True, exist_ok=True)
    image_path = output_dir / f"{family}.webp"
    json_path = output_dir / f"{family}.json"
    atlas.save(image_path, "WEBP", lossless=True, method=6)
    json_path.write_text(json.dumps({
        "frames": frames,
        "meta": {
            "app": "Titans Forge deterministic atlas packer",
            "version": "1.0",
            "image": image_path.name,
            "format": "RGBA8888",
            "size": {"w": atlas.width, "h": atlas.height},
            "scale": "1"
        }
    }, indent=2) + "\n", encoding="utf-8")
    print(f"Packed {len(files)} frames -> {image_path}")


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: pack-unit-atlases.py FRAME_DIR OUTPUT_DIR")
    frame_dir = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    grouped: dict[str, list[Path]] = {}
    for path in frame_dir.glob("*.png"):
        match = FRAME_PATTERN.match(path.name)
        if match:
            grouped.setdefault(match.group("family"), []).append(path)
    if not grouped:
        raise SystemExit(f"No render frames found in {frame_dir}")
    for family, files in grouped.items():
        pack_family(family, files, output_dir)


if __name__ == "__main__":
    main()
