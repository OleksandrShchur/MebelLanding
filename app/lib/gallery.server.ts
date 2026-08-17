import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { normalizeGalleryData, type GalleryLoaderData } from './gallery';

export async function loadGalleryFromDisk(): Promise<GalleryLoaderData> {
  try {
    const manifestPath = path.join(process.cwd(), 'public', 'gallery-manifest.json');
    const raw = JSON.parse(await readFile(manifestPath, 'utf-8'));
    return {
      data: normalizeGalleryData(raw),
      error: null,
      status: 'success',
    };
  } catch (err) {
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
