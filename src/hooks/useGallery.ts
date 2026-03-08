import { useState, useEffect } from 'react';
import type { GalleryData } from '../types';

export const useGallery = () => {
  const [data, setData] = useState<GalleryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}gallery-manifest.json`);
        if (!response.ok) {
          throw new Error('Failed to fetch gallery data');
        }
        const jsonData: GalleryData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
