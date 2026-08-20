type CacheEntry = {
  promise: Promise<void>;
  status: 'pending' | 'loaded' | 'error';
};

const cache = new Map<string, CacheEntry>();

function createEntry(src: string, priority: 'high' | 'low'): CacheEntry {
  const entry: CacheEntry = {
    promise: Promise.resolve(),
    status: 'pending',
  };

  entry.promise = new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.fetchPriority = priority;

    const finish = () => {
      entry.status = 'loaded';
      resolve();
    };

    const fail = () => {
      entry.status = 'error';
      reject(new Error(`Failed to load image: ${src}`));
    };

    img.onload = finish;
    img.onerror = fail;
    img.src = src;

    if (img.complete && img.naturalWidth > 0) {
      finish();
    }
  }).catch(() => {
    /* allow retries via evictImage */
  });

  return entry;
}

export function preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
  const existing = cache.get(src);
  if (existing?.status === 'loaded') {
    return Promise.resolve();
  }

  const entry = existing ?? createEntry(src, priority);
  cache.set(src, entry);
  return entry.promise;
}

export function isImageCached(src: string): boolean {
  return cache.get(src)?.status === 'loaded';
}

export function evictImage(src: string): void {
  cache.delete(src);
}

export function clearImageCache(): void {
  cache.clear();
}
