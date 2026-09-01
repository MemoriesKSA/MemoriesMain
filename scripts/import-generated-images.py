"""Prepare the approved MEMORIES image library for the Next.js site.

The source PNGs live beside the repository in ``generated-heroes``.  This
script turns only the production artwork into compact WebP files and places
each one at the stable public URL used by the destination catalogue.
"""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "generated-heroes"
PUBLIC = ROOT / "public" / "images"

SAUDI_CITY_FILES = {
    "abha": "abha-hero-v2.png",
    "al-ahsa": "al-ahsa-hero-v2.png",
    "al-jouf": "al-jouf-hero-v2.png",
    "alula": "alula-hero-v2.png",
    "aseer": "aseer-hero-v2.png",
    "dammam": "dammam-khobar-hero-v2.png",
    "jazan": "jazan-hero-v2.png",
    "jeddah": "jeddah-hero-v2.png",
    "madinah": "madinah-hero-v2.png",
    "makkah": "makkah-hero-v2.png",
    "red-sea": "saudi-red-sea-hero-v2.png",
    "riyadh": "riyadh-hero-v2.png",
    "tabuk": "tabuk-hero-v2.png",
    "taif": "taif-hero-v2.png",
    "yanbu": "yanbu-hero-v2.png",
}


def save_webp(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image.convert("RGB").save(target, "WEBP", quality=84, method=6)


def slug_from(source: Path, suffix: str) -> str:
    if not source.name.endswith(suffix):
        raise ValueError(f"Unexpected image name: {source.name}")
    return source.name[: -len(suffix)]


def main() -> None:
    written: list[Path] = []

    for source in sorted((SOURCE / "international-countries").glob("*-country-hero-v2.png")):
        target = PUBLIC / "countries" / f"{slug_from(source, '-country-hero-v2.png')}.webp"
        save_webp(source, target)
        written.append(target)

    saudi_country = PUBLIC / "countries" / "saudi-arabia.webp"
    save_webp(SOURCE / "saudi-arabia-hero-v2.png", saudi_country)
    written.append(saudi_country)

    for country_dir in sorted((SOURCE / "international-cities").iterdir()):
        if not country_dir.is_dir():
            continue
        for source in sorted(country_dir.glob("*-hero-v2.png")):
            city = slug_from(source, "-hero-v2.png")
            target = PUBLIC / "cities" / country_dir.name / f"{city}.webp"
            save_webp(source, target)
            written.append(target)

    for city, filename in SAUDI_CITY_FILES.items():
        target = PUBLIC / "cities" / "saudi-arabia" / f"{city}.webp"
        save_webp(SOURCE / filename, target)
        written.append(target)

    attractions_root = SOURCE / "supporting" / "city-attractions"
    for country_dir in sorted(attractions_root.iterdir()):
        if not country_dir.is_dir():
            continue
        for source in sorted(country_dir.glob("*-attraction-v2.png")):
            city = slug_from(source, "-attraction-v2.png")
            target = PUBLIC / "supporting" / "attractions" / country_dir.name / f"{city}.webp"
            save_webp(source, target)
            written.append(target)

    for country_dir in sorted((SOURCE / "supporting").iterdir()):
        if not country_dir.is_dir() or country_dir.name == "city-attractions":
            continue
        for kind in ("cuisine", "experience"):
            source = country_dir / f"{kind}-v2.png"
            if not source.exists():
                continue
            target = PUBLIC / "supporting" / country_dir.name / f"{kind}.webp"
            save_webp(source, target)
            written.append(target)

    total_bytes = sum(path.stat().st_size for path in written)
    print(f"Prepared {len(written)} images ({total_bytes / 1024 / 1024:.1f} MB).")


if __name__ == "__main__":
    main()
