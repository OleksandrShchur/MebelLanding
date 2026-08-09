import { useCallback, useEffect, useState } from 'react';
import {
  loadGalleryFromNetwork,
  type GalleryLoaderData,
} from '~/lib/gallery';

/** Client-side gallery fetch with retry (used when loader data is unavailable). */
export const useGallery = () => {
  const [state, setState] = useState<GalleryLoaderData>({
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
        const next = await loadGalleryFromNetwork(controller.signal);
        setState(next);
      } catch {
        if (controller.signal.aborted) return;
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
