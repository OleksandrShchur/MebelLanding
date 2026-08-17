import type { AsyncStatus, Category, GalleryData, Magazine } from '~/types';
import { categories } from '~/data/categories';

export interface GalleryLoaderData {
  data: GalleryData | null;
  error: string | null;
  status: AsyncStatus;
}

function isMagazineArray(value: unknown): value is Magazine[] {
  return Array.isArray(value);
}

export function normalizeGalleryData(payload: unknown): GalleryData {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Некоректний формат каталогу.');
  }

  const manifest = payload as Partial<Record<Category, unknown>>;

  return categories.reduce((accumulator, category) => {
    const magazines = manifest[category.id];
    accumulator[category.id] = isMagazineArray(magazines) ? magazines : [];
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
