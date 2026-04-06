export interface Magazine {
  id: number;
  name: string;
  orientation: 'portrait' | 'landscape';
  page: PageDimensions;
  images: string[];
}

export interface GalleryData {
  kitchens: Magazine[];
  tablesAndChairs: Magazine[];
  wardrobes: Magazine[];
  beds: Magazine[];
  mattresses: Magazine[];
  kidsFurniture: Magazine[];
  dressersAndSideboards: Magazine[];
  livingRoom: Magazine[];
  office: Magazine[];
  sofas: Magazine[];
  bathroom: Magazine[];
}

export interface PageDimensions {
  width: number;
  height: number;
  spread: 'single' | 'double';
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

export interface CategoryData {
  id: Category;
  name: string;
  imageId: string;
}
