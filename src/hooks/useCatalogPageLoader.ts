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

  const imageUrls = useMemo(() => images.map((image) => catalogImageUrl(image)), [images]);

  const shouldLoadPage = useCallback(
    (index: number) => {
      if (!enabled) return false;
      const { high, low } = getLoadIndices(currentPage, images.length);
      return high.includes(index) || low.includes(index);
    },
    [currentPage, enabled, images.length]
  );

  const isHighPriorityPage = useCallback(
    (index: number) => {
      if (!enabled) return false;
      return getLoadIndices(currentPage, images.length).high.includes(index);
    },
    [currentPage, enabled, images.length]
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
    if (!enabled || images.length === 0) return;

    setLoadedPages(() => {
      const seeded = new Set<number>();
      images.forEach((_, index) => {
        if (isImageCached(imageUrls[index])) {
          seeded.add(index);
        }
      });
      return seeded;
    });
    loadingRef.current.clear();
  }, [enabled, imageUrls, images]);

  useEffect(() => {
    if (!enabled || images.length === 0) return;

    const { high, low } = getLoadIndices(currentPage, images.length);
    let cancelled = false;

    const queue = async () => {
      for (const index of high) {
        if (cancelled || loadingRef.current.has(index)) continue;
        loadingRef.current.add(index);
        try {
          await preloadImage(imageUrls[index], 'high');
          if (!cancelled) markPageLoaded(index);
        } catch {
          /* page component shows fallback */
        } finally {
          loadingRef.current.delete(index);
        }
      }

      for (const index of low) {
        if (cancelled || loadingRef.current.has(index)) continue;
        loadingRef.current.add(index);
        void preloadImage(imageUrls[index], 'low')
          .then(() => {
            if (!cancelled) markPageLoaded(index);
          })
          .catch(() => undefined)
          .finally(() => {
            loadingRef.current.delete(index);
          });
      }
    };

    void queue();

    return () => {
      cancelled = true;
    };
  }, [currentPage, enabled, imageUrls, images.length, markPageLoaded]);

  const windowPagesReady = useMemo(() => {
    if (!enabled || images.length === 0) return false;
    const { high } = getLoadIndices(currentPage, images.length);
    return high.every((index) => loadedPages.has(index));
  }, [currentPage, enabled, images.length, loadedPages]);

  const [viewerReady, setViewerReady] = useState(false);

  useEffect(() => {
    setViewerReady(false);
  }, [images]);

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
