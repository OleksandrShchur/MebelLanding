export interface Magazine {
  id: number;
  name: string;
  orientation: 'portrait' | 'landscape';
  page: PageDimensions;
  images: string[];
}

export type Category =
  | 'kitchens'
  | 'tablesAndChairs'
  | 'wardrobes'
  | 'beds'
  | 'mattresses'
  | 'kidsFurniture'
  | 'dressersAndSideboards'
  | 'livingRoom'
  | 'office'
  | 'sofas'
  | 'bathroom';

export type GalleryData = Record<Category, Magazine[]>;

export interface PageDimensions {
  width: number;
  height: number;
  spread: 'single' | 'double';
}

export interface CategoryData {
  id: Category;
  name: string;
  imageId: string;
}
