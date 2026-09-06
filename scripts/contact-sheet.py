"""Builds one labelled grid from a folder of images, for eyeballing them at once.

A missing image is findable by script. A WRONG image is not: jeddah.webp was a
photograph of Hegra in AlUla, correctly named, correctly sized, correctly
referenced, and wrong. Nothing but a human eye catches that, and opening 47
files one at a time to look is how it goes unchecked for months.

    python scripts/contact-sheet.py public/images/cities/saudi-arabia out.png
    python scripts/contact-sheet.py public/images/cities out.png --recursive
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw

CELL_W, CELL_H, LABEL_H, COLS, PAD = 380, 253, 26, 4, 6


def collect(folder: Path, recursive: bool):
    pattern = "**/*" if recursive else "*"
    files = [p for p in sorted(folder.glob(pattern)) if p.suffix.lower() in {".webp", ".png", ".jpg", ".jpeg"}]
    return files


def build(files, out: Path, root: Path):
    if not files:
        print("no images found")
        return
    rows = (len(files) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * (CELL_W + PAD) + PAD, rows * (CELL_H + LABEL_H + PAD) + PAD), (18, 24, 22))
    draw = ImageDraw.Draw(sheet)

    for i, path in enumerate(files):
        col, row = i % COLS, i // COLS
        x = PAD + col * (CELL_W + PAD)
        y = PAD + row * (CELL_H + LABEL_H + PAD)
        try:
            with Image.open(path) as im:
                im = im.convert("RGB")
                im.thumbnail((CELL_W, CELL_H))
                sheet.paste(im, (x + (CELL_W - im.width) // 2, y + (CELL_H - im.height) // 2))
        except Exception as exc:  # a file that will not open is itself the finding
            draw.rectangle([x, y, x + CELL_W, y + CELL_H], fill=(80, 20, 20))
            draw.text((x + 8, y + 8), f"UNREADABLE\n{exc}"[:60], fill=(255, 220, 220))
        label = str(path.relative_to(root)).replace("\\", "/")
        draw.text((x + 4, y + CELL_H + 6), label, fill=(230, 220, 200))

    sheet.save(out)
    print(f"{len(files)} images -> {out}  ({sheet.width}x{sheet.height})")


if __name__ == "__main__":
    folder = Path(sys.argv[1])
    out = Path(sys.argv[2])
    build(collect(folder, "--recursive" in sys.argv), out, folder)
