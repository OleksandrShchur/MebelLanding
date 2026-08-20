import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { catalogImageUrl } from '../utils/assets';
import { isImageCached, preloadImage } from '../utils/imageCache';

const NEIGHBOR_RADIUS = 4;

export function getVisiblePageIndices(
  currentPage: number,
  totalPages: number,
  singlePage: boolean
): number[] {
  if (totalPages === 0) return [];

  const clamped = Math.max(0, Math.min(currentPage, totalPages - 1));

  if (singlePage || totalPages === 1) {
    return [clamped];
  }

  const left = clamped % 2 === 0 ? clamped : clamped - 1;
  const visible = [left];
  if (left + 1 < totalPages) {
    visible.push(left + 1);
  }
  return visible;
}

function getNeighborPageIndices(
  visible: readonly number[],
  totalPages: number,
  radius = NEIGHBOR_RADIUS
): number[] {
  if (visible.length === 0 || totalPages === 0) return [];

  const visibleSet = new Set(visible);
  const from = Math.max(0, visible[0] - radius);
  const to = Math.min(totalPages - 1, visible[visible.length - 1] + radius);
  const neighbors: number[] = [];

  for (let index = from; index <= to; index += 1) {
    if (!visibleSet.has(index)) {
      neighbors.push(index);
    }
  }

  return neighbors;
}

interface UseCatalogPageLoaderOptions {
  images: string[];
  currentPage: number;
  enabled: boolean;
  singlePage: boolean;
}

export function useCatalogPageLoader({
  images,
  currentPage,
  enabled,
  singlePage,
}: UseCatalogPageLoaderOptions) {
  const [loadedPages, setLoadedPages] = useState<ReadonlySet<number>>(() => new Set());

  const imagesKey = useMemo(() => images.join('\0'), [images]);
  const imageUrls = useMemo(
    () => (imagesKey === '' ? [] : imagesKey.split('\0').map((image) => catalogImageUrl(image))),
    [imagesKey]
  );
  const totalPages = imageUrls.length;
  const imageUrlsRef = useRef(imageUrls);
  imageUrlsRef.current = imageUrls;

  const visibleIndices = useMemo(
    () => getVisiblePageIndices(currentPage, totalPages, singlePage),
    [currentPage, singlePage, totalPages]
  );
  const neighborIndices = useMemo(
    () => getNeighborPageIndices(visibleIndices, totalPages),
    [visibleIndices, totalPages]
  );

  const visibleReady = useMemo(() => {
    if (!enabled || visibleIndices.length === 0) return false;
    return visibleIndices.every((index) => loadedPages.has(index));
  }, [enabled, loadedPages, visibleIndices]);

  const shouldLoadPage = useCallback(
    (index: number) => {
      if (!enabled) return false;
      if (visibleIndices.includes(index)) return true;
      return visibleReady && neighborIndices.includes(index);
    },
    [enabled, neighborIndices, visibleIndices, visibleReady]
  );

  const isHighPriorityPage = useCallback(
    (index: number) => enabled && visibleIndices.includes(index),
    [enabled, visibleIndices]
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
    if (!enabled || totalPages === 0) return;

    const urls = imageUrlsRef.current;
    setLoadedPages(() => {
      const seeded = new Set<number>();
      urls.forEach((url, index) => {
        if (isImageCached(url)) {
          seeded.add(index);
        }
      });
      return seeded;
    });
  }, [enabled, imagesKey, totalPages]);

  useEffect(() => {
    if (!enabled || totalPages === 0) return;

    const urls = imageUrlsRef.current;
    let cancelled = false;

    const loadPage = async (index: number, priority: 'high' | 'low') => {
      try {
        await preloadImage(urls[index], priority);
      } catch {
        /* page component shows fallback */
      } finally {
        if (!cancelled) markPageLoaded(index);
      }
    };

    const queue = async () => {
      await Promise.all(visibleIndices.map((index) => loadPage(index, 'high')));
      if (cancelled) return;

      neighborIndices.forEach((index) => {
        void loadPage(index, 'low');
      });
    };

    void queue();

    return () => {
      cancelled = true;
    };
  }, [enabled, imagesKey, markPageLoaded, neighborIndices, totalPages, visibleIndices]);

  const [viewerReady, setViewerReady] = useState(false);

  useEffect(() => {
    setViewerReady(false);
  }, [imagesKey]);

  useEffect(() => {
    if (visibleReady) {
      setViewerReady(true);
    }
  }, [visibleReady]);

  return {
    imageUrls,
    imagesKey,
    shouldLoadPage,
    isHighPriorityPage,
    markPageLoaded,
    loadedPages,
    viewerReady,
  };
}

export function prefetchMagazinePages(images: string[], count = 2): void {
  images.slice(0, count).forEach((image, index) => {
    void preloadImage(catalogImageUrl(image), index === 0 ? 'high' : 'low');
  });
}

export function prefetchMagazinePagesAround(
  images: string[],
  centerPage: number,
  singlePage = true
): void {
  if (images.length === 0) return;

  getVisiblePageIndices(centerPage, images.length, singlePage).forEach((index) => {
    void preloadImage(catalogImageUrl(images[index]), 'high');
  });
}
