import { useCallback, useEffect, useState } from 'react';
import type { AsyncStatus, GalleryData } from '../types';
import { normalizeGalleryData } from '../lib/gallery';

interface GalleryState {
  data: GalleryData | null;
  status: AsyncStatus;
  error: string | null;
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
