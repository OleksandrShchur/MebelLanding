export interface Magazine {
  id: number;
  name: string;
  description: string;
  orientation: 'portrait' | 'landscape';
  images: string[];
}

export interface GalleryData {
  wardrobes: Magazine[];
  sofas: Magazine[];
  kitchens: Magazine[];
}

export type Category = 'wardrobes' | 'sofas' | 'kitchens';
