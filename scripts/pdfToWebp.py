#!/usr/bin/env python3
"""
PDF → WebP Converter (batch, auto-output)
Converts every page of one or more PDFs to lossless WebP images.

Output path is derived automatically:
  INPUT:   D:\mebel\Вісент\Каталог Вісент 2025.pdf
  OUTPUT:  D:\mebel_converted\Вісент\Каталог Вісент 2025\

Usage:
  Just edit BASE_OUTPUT_DIR and JOBS below, then run:
    python pdf_to_webp.py
  Or pass files via CLI:
    python pdf_to_webp.py input.pdf --dpi 300 --base D:\mebel_converted
"""

import argparse
import sys
from pathlib import Path

try:
    from pdf2image import convert_from_path
    from PIL import Image
except ImportError:
    sys.exit("Missing deps. Run:  pip install pdf2image Pillow")


# ══════════════════════════════════════════════════════════════════════════════
#  CONFIGURE HERE
# ══════════════════════════════════════════════════════════════════════════════

BASE_OUTPUT_DIR = r"D:\mebel_converted"

#  List of input PDF paths — output is derived automatically from each path.
#  Leave empty strings as placeholders; they are skipped automatically.
JOBS: list[str] = [
    # r"D:\mebel\Вісент\Каталог Вісент 2025.pdf",
    # r"D:\mebel\Гарант\Каталог Корпусні меблі 2024.pdf",
    # r"D:\mebel\Гарант\Каталог_Шафи_2024_.pdf",
    # r"D:\mebel\Гарант\Кухні_2025.pdf",
    # r"D:\mebel\Гербор\2026№1.pdf",
    # r"D:\mebel\Городок\Gorodok_2026_2027_.pdf",
    # r"D:\mebel\Елізіум\Katalog_ELYSIUM 2024.pdf",
    # r"D:\mebel\КММ\Good_night_40.pdf",
    # r"D:\mebel\Компаніт\Компаніт-2025.pdf",
    # r"D:\mebel\Комфорт\Katalog_Kuhni_Komfortmebli_2025_26 (1).pdf",
    # r"D:\mebel\Лопатнюк\Лопатнюк Барвінок.pdf",
    # r"D:\mebel\Мебігранд\Мебігранд 2026-2027.pdf",
    # r"D:\mebel\Меблі Ромакс\Каталог столів MebliRoMax 2025.pdf",
    # r"D:\mebel\Меблі Сервіс\catalogue_ms_korpus_2026_web_ver_.pdf",
    r"D:\mebel\Меблі Сервіс\katalog_holder_mm_082025_web.pdf",
    r"D:\mebel\Меблі Стар\Кухні 2024.pdf",
    r"D:\mebel\Меблі Стар\МБС Лілу-Нео.pdf",
    r"D:\mebel\Меблі Стар\МБС новинки 2022.pdf",
    r"D:\mebel\Меблі Стар\МБС Оскар.pdf",
    r"D:\mebel\Меблі Стар\мбс шк 2018.pdf",
    r"D:\mebel\Меблісто\Каталог  Меблісто (1).pdf",
    r"D:\mebel\Меблісто\Каталог Меблісто  (2 ) 2024.pdf",
    r"D:\mebel\Міро Марк\каталог 2025.pdf",
    r"D:\mebel\Модуль Люкс\Модуль люкс 2023.pdf",
    r"D:\mebel\Морелі\Каталог Морелі.pdf",
    r"D:\mebel\Новий стиль\2024_kns.pdf",
    r"D:\mebel\Новий стиль\ns_catalogue_chairs.pdf",
    r"D:\mebel\Пехотин\Katalog-Catalog-Pehotin-2026-v1.0.pdf",
    r"D:\mebel\Сокме\Сокме 2021.pdf",
    r"D:\mebel\Сокме\Сокме вітальні 2024.pdf",
    r"D:\mebel\Сокме\Сокме передпокої 2024.pdf",
    r"D:\mebel\Стемма\СТЕММА каталог 2024_ст.pdf",
    r"D:\mebel\Стемма\СТЕММА каталог 2025.pdf",
    r"D:\mebel\Твін Санн\Twinsann_catalog.pdf",
    r"D:\mebel\УМа\Каталог_дивани_Uma2025_1.pdf",
    r"D:\mebel\Шарм\каталог.pdf",
]

POPPLER_PATH = r"C:\poppler\Library\bin"
DEFAULT_DPI  = 300

# ══════════════════════════════════════════════════════════════════════════════


def build_output_dir(pdf_path: Path, base: Path) -> Path:
    """
    Derives the output directory from the input PDF path:
      <base> / <parent folder name> / <pdf stem>

    Example:
      pdf_path : D:\mebel\Вісент\Каталог Вісент 2025.pdf
      base     : D:\mebel_converted
      result   : D:\mebel_converted\Вісент\Каталог Вісент 2025
    """
    return base / pdf_path.parent.name / pdf_path.stem


def convert_pdf(pdf_path: Path, out_dir: Path, dpi: int) -> list[Path]:
    """Convert a single PDF to per-page lossless WebPs. Returns list of saved paths."""
    print(f"\n📄  {pdf_path.name}")
    print(f"    → {out_dir}")

    images = convert_from_path(
        str(pdf_path),
        dpi=dpi,
        fmt="ppm",        # raw PPM — no intermediate lossy step
        thread_count=4,
        use_cropbox=True,
        poppler_path=POPPLER_PATH if POPPLER_PATH else None,
    )

    out_dir.mkdir(parents=True, exist_ok=True)
    stem  = pdf_path.stem
    saved: list[Path] = []
    total = len(images)
    pad   = len(str(total))

    for i, img in enumerate(images, start=1):
        if img.mode != "RGB":
            img = img.convert("RGB")

        out_name = f"{stem}_page{str(i).zfill(pad)}.webp"
        out_path = out_dir / out_name

        img.save(
            str(out_path),
            format="WEBP",
            lossless=True,  # pixel-perfect, no quality trade-off
            method=6,       # best compression ratio (0–6); drop to 4 for speed
            exact=True,     # preserve exact RGB values
        )

        w, h    = img.size
        size_kb = out_path.stat().st_size // 1024
        print(f"  ✓  page {i:>{pad}}/{total}  →  {out_name}  ({w}×{h}px, {size_kb} KB)")
        saved.append(out_path)

    return saved


def resolve_jobs(cli_pdfs: list[str], base: Path) -> list[tuple[Path, Path]]:
    """
    Returns (pdf_path, out_dir) pairs.
    CLI args take priority over the JOBS list.
    Empty strings in JOBS are skipped silently.
    """
    sources = cli_pdfs if cli_pdfs else [j for j in JOBS if j.strip()]

    if not sources:
        return []

    return [
        (Path(p), build_output_dir(Path(p), base))
        for p in sources
    ]


def main():
    parser = argparse.ArgumentParser(
        description="Convert PDF pages to lossless WebP images (batch, auto-output).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("pdfs", nargs="*", metavar="PDF",
                        help="PDF file(s) — optional if JOBS is configured above")
    parser.add_argument("--dpi", type=int, default=DEFAULT_DPI,
                        help=f"Render resolution in DPI (default: {DEFAULT_DPI})")
    parser.add_argument("--base", metavar="DIR", default=BASE_OUTPUT_DIR,
                        help=f"Base output directory (default: {BASE_OUTPUT_DIR})")
    args = parser.parse_args()

    base = Path(args.base)
    jobs = resolve_jobs(args.pdfs, base)

    if not jobs:
        parser.error("No input given. Add paths to JOBS above or pass a PDF as an argument.")

    # Preview the plan before starting
    print(f"🗂️   Base output : {base}")
    print(f"📋  Jobs queued : {len(jobs)}")
    for pdf_path, out_dir in jobs:
        print(f"     • {pdf_path.name}  →  {out_dir}")

    total_pages = 0
    errors: list[str] = []

    for pdf_path, out_dir in jobs:
        if not pdf_path.exists():
            errors.append(f"Not found: {pdf_path}")
            continue
        if pdf_path.suffix.lower() != ".pdf":
            errors.append(f"Not a PDF: {pdf_path}")
            continue

        try:
            saved = convert_pdf(pdf_path, out_dir, args.dpi)
            total_pages += len(saved)
        except Exception as exc:
            errors.append(f"{pdf_path.name}: {exc}")

    print(f"\n✅  Done — {total_pages} page(s) converted across {len(jobs)} job(s).")

    if errors:
        print("\n⚠️  Errors:")
        for e in errors:
            print(f"   • {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
