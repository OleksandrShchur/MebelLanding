import { useCallback, useEffect, useState } from 'react';
import type { AsyncStatus, Category, GalleryData, Magazine } from '../types';
import { categories } from '../data/categories';

interface GalleryState {
  data: GalleryData | null;
  status: AsyncStatus;
  error: string | null;
}

function isMagazineArray(value: unknown): value is Magazine[] {
  return Array.isArray(value);
}

function normalizeGalleryData(payload: unknown): GalleryData {
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

export const useGallery = () => {
  const [state, setState] = useState<GalleryState>({
    data: null,
    status: 'loading',
    error: null,
  });
  const [requestKey, setRequestKey] = useState(0);

  const retry = useCallback(() => {
    setRequestKey((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setState((current) => ({
        data: current.data,
        status: 'loading',
        error: null,
      }));

      try {
        const response = await fetch(`${import.meta.env.BASE_URL}gallery-manifest.json`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Не вдалося завантажити каталог. Перевірте зʼєднання та спробуйте ще раз.');
        }

        const jsonData = normalizeGalleryData(await response.json());

        setState({
          data: jsonData,
          status: 'success',
          error: null,
        });
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          data: null,
          status: 'error',
          error: err instanceof Error ? err.message : 'Сталася невідома помилка під час завантаження каталогу.',
        });
      }
    };

    void fetchData();

    return () => controller.abort();
  }, [requestKey]);

  return {
    data: state.data,
    error: state.error,
    status: state.status,
    loading: state.status === 'loading',
    retry,
  };
};
