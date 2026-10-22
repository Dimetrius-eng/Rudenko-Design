"""Create brighter, lightly sharpened WebP copies while leaving source photos untouched."""

from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Images"
OUTPUT = SOURCE / "Enhanced"


def enhance(source: Path, destination: Path) -> None:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        image = ImageEnhance.Brightness(image).enhance(1.08)
        image = ImageEnhance.Contrast(image).enhance(1.04)
        image = ImageEnhance.Color(image).enhance(1.05)
        image = ImageEnhance.Sharpness(image).enhance(1.12)
        destination.parent.mkdir(parents=True, exist_ok=True)
        save_options = {"format": "WEBP", "quality": 93, "method": 4}
        profile = opened.info.get("icc_profile")
        if profile:
            save_options["icc_profile"] = profile
        image.save(destination, **save_options)


def main() -> None:
    photos = [path for path in SOURCE.rglob("*") if path.suffix.lower() in {".jpg", ".jpeg"} and OUTPUT not in path.parents]
    for source in photos:
        relative = source.relative_to(SOURCE).with_suffix(".webp")
        destination = OUTPUT / relative
        if destination.is_file() and destination.stat().st_size > 0:
            continue
        enhance(source, destination)
    print(f"Created {len(photos)} enhanced WebP images in {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
