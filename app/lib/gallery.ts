import type { AsyncStatus, Category, GalleryData, Magazine, MagazinePage } from '~/types';
import { categories } from '~/data/categories';

export interface GalleryLoaderData {
  data: GalleryData | null;
  error: string | null;
  status: AsyncStatus;
}

const priceFormatter = new Intl.NumberFormat('uk-UA');

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function normalizeMagazinePage(value: unknown): MagazinePage | null {
  if (typeof value === 'string' && value.length > 0) {
    return { src: value };
  }

  if (!value || typeof value !== 'object') return null;

  const raw = value as { src?: unknown; priceFrom?: unknown };
  if (typeof raw.src !== 'string' || raw.src.length === 0) return null;

  const page: MagazinePage = { src: raw.src };
  if (isPositiveInteger(raw.priceFrom)) {
    page.priceFrom = raw.priceFrom;
  }

  return page;
}

function normalizeMagazine(value: unknown): Magazine | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Magazine & { images?: unknown; pages?: unknown };
  const source = Array.isArray(raw.pages)
    ? raw.pages
    : Array.isArray(raw.images)
      ? raw.images
      : [];

  const rest = { ...raw };
  delete rest.images;

  return {
    ...rest,
    pages: source
      .map(normalizeMagazinePage)
      .filter((page): page is MagazinePage => page !== null),
  };
}

function normalizeMagazineList(value: unknown): Magazine[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeMagazine)
    .filter((magazine): magazine is Magazine => magazine !== null);
}

export function getMagazineSrcs(magazine: Magazine): string[] {
  return magazine.pages.map((page) => page.src);
}

export function formatPriceFrom(uah: number): string {
  return `від ${priceFormatter.format(uah)} ₴`;
}

export function normalizeGalleryData(payload: unknown): GalleryData {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Некоректний формат каталогу.');
  }

  const manifest = payload as Partial<Record<Category, unknown>>;

  return categories.reduce((accumulator, category) => {
    accumulator[category.id] = normalizeMagazineList(manifest[category.id]);
    return accumulator;
  }, {} as GalleryData);
}

export async function loadGalleryFromNetwork(
  signal?: AbortSignal
): Promise<GalleryLoaderData> {
  try {
    const base = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${base}gallery-manifest.json`, { signal });

    if (!response.ok) {
      throw new Error(
        'Не вдалося завантажити каталог. Перевірте зʼєднання та спробуйте ще раз.'
      );
    }

    return {
      data: normalizeGalleryData(await response.json()),
      error: null,
      status: 'success',
    };
  } catch (err) {
    if (typeof DOMException !== 'undefined' && err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : 'Сталася невідома помилка під час завантаження каталогу.',
      status: 'error',
    };
  }
}

export function isValidCategory(category: string): category is Category {
  return categories.some((cat) => cat.id === category);
}

export function isValidId(id: string): boolean {
  const parsed = Number.parseInt(id, 10);
  return !Number.isNaN(parsed) && parsed > 0;
}

export function findMagazineByCategoryAndId(
  data: GalleryData,
  category: Category,
  id: number
): Magazine | null {
  return data[category].find((magazine) => magazine.id === id) || null;
}
