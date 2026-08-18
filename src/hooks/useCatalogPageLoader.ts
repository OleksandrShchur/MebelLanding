import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { catalogImageUrl } from '../utils/assets';
import { isImageCached, preloadImage } from '../utils/imageCache';

const HIGH_PRIORITY_RADIUS = 2;
const LOW_PRIORITY_RADIUS = 6;

function getLoadIndices(currentPage: number, totalPages: number): { high: number[]; low: number[] } {
  if (totalPages === 0) {
    return { high: [], low: [] };
  }

  const high = new Set<number>();
  const low = new Set<number>();

  for (let offset = -HIGH_PRIORITY_RADIUS; offset <= HIGH_PRIORITY_RADIUS; offset += 1) {
    const index = currentPage + offset;
    if (index >= 0 && index < totalPages) {
      high.add(index);
    }
  }

  for (let offset = -LOW_PRIORITY_RADIUS; offset <= LOW_PRIORITY_RADIUS; offset += 1) {
    const index = currentPage + offset;
    if (index >= 0 && index < totalPages && !high.has(index)) {
      low.add(index);
    }
  }

  return {
    high: [...high].sort((a, b) => a - b),
    low: [...low].sort((a, b) => a - b),
  };
}

interface UseCatalogPageLoaderOptions {
  images: string[];
  currentPage: number;
  enabled: boolean;
}

export function useCatalogPageLoader({ images, currentPage, enabled }: UseCatalogPageLoaderOptions) {
  const [loadedPages, setLoadedPages] = useState<ReadonlySet<number>>(() => new Set());
  const loadingRef = useRef(new Set<number>());
  const pageCount = images.length;
  const imageListKey = images.join('\0');

  const imageUrls = useMemo(
    () => images.map((image) => catalogImageUrl(image)),
    // imageListKey captures contents so a new array with the same pages does not reset loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by image contents
    [imageListKey]
  );

  const shouldLoadPage = useCallback(
    (index: number) => {
      if (!enabled) return false;
      const { high, low } = getLoadIndices(currentPage, pageCount);
      return high.includes(index) || low.includes(index);
    },
    [currentPage, enabled, pageCount]
  );

  const isHighPriorityPage = useCallback(
    (index: number) => {
      if (!enabled) return false;
      return getLoadIndices(currentPage, pageCount).high.includes(index);
    },
    [currentPage, enabled, pageCount]
  );

  const markPageLoaded = useCallback((index: number) => {
    setLoadedPages((current) => {
      if (current.has(index)) return current;
      const next = new Set(current);
      next.add(index);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled || imageUrls.length === 0) return;

    setLoadedPages(() => {
      const seeded = new Set<number>();
      imageUrls.forEach((url, index) => {
        if (isImageCached(url)) {
          seeded.add(index);
        }
      });
      return seeded;
    });
    loadingRef.current.clear();
  }, [enabled, imageUrls]);

  useEffect(() => {
    if (!enabled || imageUrls.length === 0) return;

    const { high, low } = getLoadIndices(currentPage, imageUrls.length);
    let cancelled = false;

    const queue = async () => {
      for (const index of high) {
        if (cancelled || loadingRef.current.has(index)) continue;
        loadingRef.current.add(index);
        try {
          await preloadImage(imageUrls[index], 'high');
        } catch {
          /* page component shows fallback */
        } finally {
          if (!cancelled) markPageLoaded(index);
          loadingRef.current.delete(index);
        }
      }

      for (const index of low) {
        if (cancelled || loadingRef.current.has(index)) continue;
        loadingRef.current.add(index);
        void preloadImage(imageUrls[index], 'low')
          .catch(() => undefined)
          .finally(() => {
            if (!cancelled) markPageLoaded(index);
            loadingRef.current.delete(index);
          });
      }
    };

    void queue();

    return () => {
      cancelled = true;
    };
  }, [currentPage, enabled, imageUrls, markPageLoaded]);

  const windowPagesReady = useMemo(() => {
    if (!enabled || imageUrls.length === 0) return false;
    const { high } = getLoadIndices(currentPage, imageUrls.length);
    return high.every((index) => loadedPages.has(index));
  }, [currentPage, enabled, imageUrls.length, loadedPages]);

  const [viewerReady, setViewerReady] = useState(false);

  useEffect(() => {
    setViewerReady(false);
  }, [imageListKey]);

  useEffect(() => {
    if (windowPagesReady) {
      setViewerReady(true);
    }
  }, [windowPagesReady]);

  return {
    imageUrls,
    shouldLoadPage,
    isHighPriorityPage,
    markPageLoaded,
    loadedPages,
    viewerReady,
  };
}

export function prefetchMagazinePages(images: string[], count = 3): void {
  images.slice(0, count).forEach((image, index) => {
    void preloadImage(catalogImageUrl(image), index === 0 ? 'high' : 'low');
  });
}

export function prefetchMagazinePagesAround(images: string[], centerPage: number): void {
  if (images.length === 0) return;

  const { high, low } = getLoadIndices(centerPage, images.length);
  high.forEach((index) => {
    void preloadImage(catalogImageUrl(images[index]), 'high');
  });
  low.forEach((index) => {
    void preloadImage(catalogImageUrl(images[index]), 'low');
  });
}
