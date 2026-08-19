import { categories } from '../data/categories';
import type { Category, GalleryData, Magazine, MagazinePage } from '../types';

const priceFormatter = new Intl.NumberFormat('uk-UA');

export const EMPTY_MAGAZINE_SRCS: string[] = [];

function isMagazinePage(value: unknown): value is MagazinePage {
  return !!value && typeof value === 'object' && typeof (value as MagazinePage).src === 'string';
}

function normalizeMagazine(value: unknown): Magazine | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Partial<Magazine>;
  if (!Array.isArray(raw.pages)) return null;

  const pages = raw.pages.filter(isMagazinePage);

  return {
    ...(raw as Magazine),
    pages,
    srcs: pages.map((page) => page.src),
  };
}

export function normalizeGalleryData(payload: unknown): GalleryData {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Некоректний формат каталогу.');
  }

  const manifest = payload as Partial<Record<Category, unknown>>;

  return categories.reduce((accumulator, category) => {
    const magazines = manifest[category.id];
    accumulator[category.id] = Array.isArray(magazines)
      ? magazines.flatMap((item) => {
          const magazine = normalizeMagazine(item);
          return magazine ? [magazine] : [];
        })
      : [];
    return accumulator;
  }, {} as GalleryData);
}

export function formatPriceFrom(uah: number): string {
  return `від ${priceFormatter.format(uah)} ₴`;
}
