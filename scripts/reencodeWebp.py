#!/usr/bin/env python3
r"""
WebP -> WebP Re-encoder (batch, auto-output)
Resizes and re-encodes existing catalog WebP images. Originals are left untouched.

Each JOBS entry is a catalog directory that contains .webp files.
Output mirrors the same subdirectory layout under BASE_OUTPUT_DIR:

  BASE_INPUT_DIR : D:\mebel_converted
  BASE_OUTPUT_DIR: D:\mebel_optimized_2
  INPUT          : D:\mebel_converted\Меблі Стар\Кухні 2024
  OUTPUT         : D:\mebel_optimized_2\Меблі Стар\Кухні 2024

Usage:
  Edit BASE_INPUT_DIR, BASE_OUTPUT_DIR, and JOBS below, then run:
    python reencodeWebp.py
  Or pass directories via CLI:
    python reencodeWebp.py "D:\mebel_converted\Меблі Стар\Кухні 2024"
"""

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Missing deps. Run:  pip install Pillow")


# ══════════════════════════════════════════════════════════════════════════════
#  CONFIGURE HERE
# ══════════════════════════════════════════════════════════════════════════════

BASE_INPUT_DIR = r"D:\mebel_converted"
BASE_OUTPUT_DIR = r"D:\mebel_optimized_2"

#  Catalog directories to process — paths relative to BASE_INPUT_DIR, or absolute.
#  Each directory must contain .webp files directly (not in nested subfolders).
JOBS: list[str] = [
    r"Агат-М",
    r"Віко Меблі\ВікоМеблі",
    r"Вісент\Вісент 1",
    r"Вісент\Каталог Вісент 2025",
    r"Гарант\Каталог Корпусні меблі 2024",
    r"Гарант\Каталог_Шафи_2024_",
    r"Гарант\Кухні_2025",
    r"Гербор\2026№1",
    r"Городок\Gorodok_2026_2027_",
    r"Елізіум\Katalog_ELYSIUM 2024",
    r"КММ\Good_night_40",
    r"Компаніт\Компаніт-2025",
    r"Комфорт\Katalog_Kuhni_Komfortmebli_2025_26 (1)",
    r"Лопатнюк\Лопатнюк Барвінок",
    r"Мебігранд\Мебігранд 2026-2027",
    r"Меблі Ромакс\Каталог столів MebliRoMax 2025",
    r"Меблі Сервіс\catalogue_ms_korpus_2026_web_ver_",
    r"Меблі Сервіс\katalog_holder_mm_082025_web",
    r"Меблі Стар\Кухні 2024",
    r"Меблі Стар\МБС Лілу-Нео",
    r"Меблі Стар\МБС новинки 2022",
    r"Меблі Стар\МБС Оскар",
    r"Меблі Стар\мбс шк 2018",
    r"Меблісто\Каталог  Меблісто (1)",
    r"Меблісто\Каталог Меблісто  (2 ) 2024",
    r"Міро Марк\каталог 2025",
    r"Модуль Люкс\Модуль люкс 2023",
    r"Морелі\Каталог Морелі",
    r"Новий стиль\2024_kns",
    r"Новий стиль\ns_catalogue_chairs",
    r"Пехотин\Katalog-Catalog-Pehotin-2026-v1.0",
    r"Сокме\Сокме 2021",
    r"Сокме\Сокме вітальні 2024",
    r"Сокме\Сокме передпокої 2024",
    r"Стемма\СТЕММА каталог 2024_ст",
    r"Стемма\СТЕММА каталог 2025",
    r"Твін Санн\Twinsann_catalog",
    r"УМа\Каталог_дивани_Uma2025_1",
    r"Шарм\каталог",
]

SOURCE_DPI = 300   # assumed DPI of the existing WebPs (pdfToWebp.py default)
TARGET_DPI = 200   # output resolution
QUALITY    = 95    # lossy WebP quality (0–100)

# ══════════════════════════════════════════════════════════════════════════════


def resolve_input_dir(job: str, input_base: Path) -> Path:
    """Resolve a JOBS entry to an absolute input directory."""
    path = Path(job)
    if path.is_absolute():
        return path
    return input_base / path


def build_output_dir(input_dir: Path, input_base: Path, output_base: Path) -> Path:
    r"""
    Mirror the input directory under output_base, preserving subdirectory layout.

    Example:
      input_base : D:\mebel_converted
      input_dir  : D:\mebel_converted\Меблі Стар\Кухні 2024
      output_base: D:\mebel_optimized_2
      result     : D:\mebel_optimized_2\Меблі Стар\Кухні 2024
    """
    try:
        relative = input_dir.resolve().relative_to(input_base.resolve())
    except ValueError:
        relative = Path(input_dir.parent.name) / input_dir.name
    return output_base / relative


def list_webps(catalog_dir: Path) -> list[Path]:
    return sorted(
        (p for p in catalog_dir.iterdir() if p.is_file() and p.suffix.lower() == ".webp"),
        key=lambda p: p.name,
    )


def reencode_webp(
    src: Path,
    dst: Path,
    *,
    scale: float,
    quality: int,
) -> tuple[int, int, int]:
    """Resize (if needed) and save as lossy WebP. Returns (width, height, size_bytes)."""
    with Image.open(src) as img:
        if img.mode != "RGB":
            img = img.convert("RGB")

        if scale != 1.0:
            new_w = max(1, round(img.width * scale))
            new_h = max(1, round(img.height * scale))
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        dst.parent.mkdir(parents=True, exist_ok=True)
        img.save(
            str(dst),
            format="WEBP",
            quality=quality,
            method=6,
        )

        w, h = img.size
        return w, h, dst.stat().st_size


def process_catalog(
    input_dir: Path,
    out_dir: Path,
    *,
    scale: float,
    quality: int,
) -> list[Path]:
    """Re-encode every .webp in a catalog directory. Returns list of saved paths."""
    webps = list_webps(input_dir)
    if not webps:
        print("    (no .webp files found - skipped)")
        return []

    print(f"\n[DIR] {input_dir.name}")
    print(f"    from: {input_dir}")
    print(f"    to:   {out_dir}")

    saved: list[Path] = []
    total = len(webps)
    pad = len(str(total))

    for i, src in enumerate(webps, start=1):
        dst = out_dir / src.name
        w, h, size_bytes = reencode_webp(src, dst, scale=scale, quality=quality)
        size_kb = size_bytes // 1024
        src_kb = src.stat().st_size // 1024
        print(
            f"  OK  {i:>{pad}}/{total}  {src.name}  "
            f"({w}x{h}px, {size_kb} KB, was {src_kb} KB)"
        )
        saved.append(dst)

    return saved


def resolve_jobs(
    cli_dirs: list[str],
    input_base: Path,
    output_base: Path,
) -> list[tuple[Path, Path]]:
    """
    Returns (input_dir, out_dir) pairs.
    CLI args take priority over the JOBS list.
    Empty strings in JOBS are skipped silently.
    """
    sources = cli_dirs if cli_dirs else [j for j in JOBS if j.strip()]

    if not sources:
        return []

    jobs: list[tuple[Path, Path]] = []
    for job in sources:
        input_dir = resolve_input_dir(job, input_base)
        out_dir = build_output_dir(input_dir, input_base, output_base)
        jobs.append((input_dir, out_dir))
    return jobs


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(
        description="Re-encode catalog WebP images at lower DPI and high quality (batch, auto-output).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "dirs",
        nargs="*",
        metavar="DIR",
        help="Catalog directory(ies) — optional if JOBS is configured above",
    )
    parser.add_argument(
        "--input-base",
        metavar="DIR",
        default=BASE_INPUT_DIR,
        help=f"Base input directory (default: {BASE_INPUT_DIR})",
    )
    parser.add_argument(
        "--output-base",
        metavar="DIR",
        default=BASE_OUTPUT_DIR,
        help=f"Base output directory (default: {BASE_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--base",
        metavar="DIR",
        dest="output_base",
        help="Alias for --output-base",
    )
    parser.add_argument(
        "--source-dpi",
        type=int,
        default=SOURCE_DPI,
        help=f"Assumed DPI of input WebPs (default: {SOURCE_DPI})",
    )
    parser.add_argument(
        "--target-dpi",
        type=int,
        default=TARGET_DPI,
        help=f"Output DPI (default: {TARGET_DPI})",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=QUALITY,
        help=f"WebP quality 0–100 (default: {QUALITY})",
    )
    args = parser.parse_args()

    if not 0 <= args.quality <= 100:
        parser.error("--quality must be between 0 and 100")
    if args.source_dpi <= 0 or args.target_dpi <= 0:
        parser.error("--source-dpi and --target-dpi must be positive")

    scale = args.target_dpi / args.source_dpi
    input_base = Path(args.input_base)
    output_base = Path(args.output_base)
    jobs = resolve_jobs(args.dirs, input_base, output_base)

    if not jobs:
        parser.error("No input given. Add paths to JOBS above or pass a directory as an argument.")

    print(f"    Input base  : {input_base}")
    print(f"    Output base : {output_base}")
    print(f"    Scale       : {args.source_dpi} -> {args.target_dpi} DPI  (x{scale:.4f})")
    print(f"    Quality     : {args.quality}")
    print(f"    Jobs queued : {len(jobs)}")
    for input_dir, out_dir in jobs:
        print(f"     - {input_dir.name}  ->  {out_dir}")

    total_images = 0
    errors: list[str] = []

    for input_dir, out_dir in jobs:
        if not input_dir.exists():
            errors.append(f"Not found: {input_dir}")
            continue
        if not input_dir.is_dir():
            errors.append(f"Not a directory: {input_dir}")
            continue

        try:
            saved = process_catalog(
                input_dir,
                out_dir,
                scale=scale,
                quality=args.quality,
            )
            total_images += len(saved)
        except Exception as exc:
            errors.append(f"{input_dir.name}: {exc}")

    print(f"\nDone - {total_images} image(s) re-encoded across {len(jobs)} job(s).")

    if errors:
        print("\nErrors:")
        for e in errors:
            print(f"   - {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
