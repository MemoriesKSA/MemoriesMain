"""Downloads a Pexels photograph and installs it at a site image path.

Every city card is 1400x933 WebP at roughly 190 KB, and matching that by hand
is how a set drifts. This does the fetch, the centre crop, the resize and the
quality search in one step, so a replacement is one command and looks like its
neighbours.

    python scripts/install-stock-image.py 28558770 public/images/cities/saudi-arabia/jeddah.webp
    python scripts/install-stock-image.py 28558770 public/images/countries/x.webp --portrait

It deliberately does NOT record the licence for you. That goes in
docs/destination-image-sources-2026-09.md by hand, with the photographer and
the source page, because a credit nobody typed is a credit nobody checked.
"""

import io
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

CITY = (1400, 933)      # 3:2, the city card
COUNTRY = (1122, 1402)  # 4:5, the country cover
TARGET_KB = 200


def fetch(photo_id: str, width: int) -> Image.Image:
    """Fetched with curl, not urllib: urllib cannot reach the host from here."""
    url = f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&w={width}"
    with tempfile.NamedTemporaryFile(suffix=".jpeg", delete=False) as handle:
        temp = Path(handle.name)
    result = subprocess.run(
        ["curl", "-sS", "--max-time", "60", "-A", "Mozilla/5.0", url, "-o", str(temp)],
        capture_output=True, text=True,
    )
    if result.returncode != 0 or temp.stat().st_size < 10_000:
        raise SystemExit(f"could not fetch photo {photo_id}: {result.stderr.strip() or 'empty response'}")
    with Image.open(temp) as image:
        return image.convert("RGB")

def crop_to(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    scale = max(target_w / image.width, target_h / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.LANCZOS)
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def save_under(image: Image.Image, out: Path, target_kb: int) -> int:
    """Highest quality that still fits the budget, so one file is not twice its neighbours."""
    out.parent.mkdir(parents=True, exist_ok=True)
    for quality in (86, 82, 78, 74, 70, 66, 62, 58, 54, 50):
        buffer = io.BytesIO()
        image.save(buffer, "WEBP", quality=quality, method=6)
        if buffer.tell() <= target_kb * 1024 or quality == 50:
            out.write_bytes(buffer.getvalue())
            return buffer.tell() // 1024
    return 0


if __name__ == "__main__":
    photo_id, destination = sys.argv[1], Path(sys.argv[2])
    size = COUNTRY if "--portrait" in sys.argv else CITY
    source = fetch(photo_id, 2400)
    result = crop_to(source, size)
    written = save_under(result, destination, TARGET_KB)
    print(f"pexels {photo_id} -> {destination}  {size[0]}x{size[1]}  {written} KB")
    print(f"  source page: https://www.pexels.com/photo/{photo_id}/")
    print("  record the photographer and licence in docs/destination-image-sources-2026-09.md")
