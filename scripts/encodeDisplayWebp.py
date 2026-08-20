#!/usr/bin/env python3
r"""
WebP -> display-sized WebP (batch)
Resizes catalog pages for on-screen flipbook viewing. Originals are left
untouched unless --output-base points at the same folder as --input-base.

Default target: longest edge 1600px, lossy WebP quality 85.

  BASE_INPUT_DIR : D:\mebel_optimized_2
  BASE_OUTPUT_DIR: D:\mebel_display
  INPUT          : D:\mebel_optimized_2\Меблі Стар\Кухні 2024
  OUTPUT         : D:\mebel_display\Меблі Стар\Кухні 2024

Usage:
  Edit BASE_INPUT_DIR, BASE_OUTPUT_DIR, and JOBS below, then run:
    python encodeDisplayWebp.py
  Or pass directories via CLI:
    python encodeDisplayWebp.py "D:\mebel_optimized_2\Меблі Стар\Кухні 2024"
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

BASE_INPUT_DIR = r"D:\mebel_optimized_2"
BASE_OUTPUT_DIR = r"D:\mebel_display"

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

MAX_LONG_EDGE = 1600
QUALITY = 85

# ══════════════════════════════════════════════════════════════════════════════


def resolve_input_dir(job: str, input_base: Path) -> Path:
    path = Path(job)
    if path.is_absolute():
        return path
    return input_base / path


def build_output_dir(input_dir: Path, input_base: Path, output_base: Path) -> Path:
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


def fit_long_edge(width: int, height: int, max_edge: int) -> tuple[int, int]:
    longest = max(width, height)
    if longest <= max_edge:
        return width, height
    scale = max_edge / longest
    return max(1, round(width * scale)), max(1, round(height * scale))


def encode_display_webp(
    src: Path,
    dst: Path,
    *,
    max_edge: int,
    quality: int,
) -> tuple[int, int, int]:
    with Image.open(src) as img:
        if img.mode != "RGB":
            img = img.convert("RGB")

        new_w, new_h = fit_long_edge(img.width, img.height, max_edge)
        if (new_w, new_h) != (img.width, img.height):
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        dst.parent.mkdir(parents=True, exist_ok=True)
        write_path = dst
        if src.resolve() == dst.resolve():
            write_path = dst.with_name(f"{dst.stem}.tmp.webp")

        img.save(
            str(write_path),
            format="WEBP",
            quality=quality,
            method=6,
        )
        w, h = img.size

    if write_path != dst:
        write_path.replace(dst)

    return w, h, dst.stat().st_size


def process_catalog(
    input_dir: Path,
    out_dir: Path,
    *,
    max_edge: int,
    quality: int,
) -> list[Path]:
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
        w, h, size_bytes = encode_display_webp(
            src, dst, max_edge=max_edge, quality=quality
        )
        size_kb = size_bytes // 1024
        src_kb = src.stat().st_size // 1024
        print(
            f"  OK  {i:>{pad}}/{total}  {src.name}  "
            f"({w}x{h}px, {size_kb} KB, was {src_kb} KB)"
        )
        saved.append(dst)

    return saved


def discover_catalog_leaves(root: Path) -> list[Path]:
    """Find directories that contain .webp files (nested catalogs)."""
    leaves: list[Path] = []
    if not root.exists():
        return leaves

    for dirpath, dirnames, filenames in root.walk() if hasattr(root, "walk") else _walk(root):
        if any(name.lower().endswith(".webp") for name in filenames):
            leaves.append(dirpath)
            dirnames.clear()

    return sorted(leaves, key=lambda p: str(p).lower())


def _walk(root: Path):
    for dirpath, dirnames, filenames in __import__("os").walk(root):
        yield Path(dirpath), dirnames, filenames


def resolve_jobs(
    cli_dirs: list[str],
    input_base: Path,
    output_base: Path,
    *,
    all_catalogs: bool,
) -> list[tuple[Path, Path]]:
    if all_catalogs:
        return [
            (leaf, build_output_dir(leaf, input_base, output_base))
            for leaf in discover_catalog_leaves(input_base)
        ]

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
        description="Encode catalog WebP images for on-screen display (max long edge, quality 85).",
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
        "--max-edge",
        type=int,
        default=MAX_LONG_EDGE,
        help=f"Longest edge in pixels (default: {MAX_LONG_EDGE})",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=QUALITY,
        help=f"WebP quality 0-100 (default: {QUALITY})",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Process every nested folder that contains .webp files under --input-base",
    )
    args = parser.parse_args()

    if not 0 <= args.quality <= 100:
        parser.error("--quality must be between 0 and 100")
    if args.max_edge <= 0:
        parser.error("--max-edge must be positive")

    input_base = Path(args.input_base)
    output_base = Path(args.output_base)
    jobs = resolve_jobs(args.dirs, input_base, output_base, all_catalogs=args.all)

    if not jobs:
        parser.error("No input given. Add paths to JOBS, pass a directory, or use --all.")

    print(f"    Input base  : {input_base}")
    print(f"    Output base : {output_base}")
    print(f"    Max edge    : {args.max_edge}px")
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
                max_edge=args.max_edge,
                quality=args.quality,
            )
            total_images += len(saved)
        except Exception as exc:
            errors.append(f"{input_dir.name}: {exc}")

    print(f"\nDone - {total_images} image(s) encoded across {len(jobs)} job(s).")

    if errors:
        print("\nErrors:")
        for e in errors:
            print(f"   - {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
