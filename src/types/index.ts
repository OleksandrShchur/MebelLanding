export interface MagazinePage {
  src: string;
  /** Starting price in UAH. Omit on navigation, cover, and TOC pages. */
  priceFrom?: number;
}

export interface Magazine {
  id: number;
  name: string;
  orientation: 'portrait' | 'landscape';
  page: PageDimensions;
  pages: MagazinePage[];
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

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface CategoryItem {
  id: Category;
  name: string;
  imageSrc: string;
  imageAlt?: string;
  disabled?: boolean;
}

export interface CategorySectionViewModel {
  category: Category;
  title: string;
  magazines: Magazine[];
  isEmpty: boolean;
  missing: boolean;
}
