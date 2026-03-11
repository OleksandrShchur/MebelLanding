export interface Magazine {
  id: number;
  name: string;
  description: string;
  orientation: 'portrait' | 'landscape';
  page: PageDimensions;
  images: string[];
}

export interface GalleryData {
  wardrobes: Magazine[];
  sofas: Magazine[];
  kitchens: Magazine[];
}

export interface PageDimensions {
  width: number;
  height: number;
  spread: 'single' | 'double';
}

export type Category = 'wardrobes' | 'sofas' | 'kitchens';
