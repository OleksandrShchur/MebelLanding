import type { Magazine } from '../types';

const priceFormatter = new Intl.NumberFormat('uk-UA');

export function getMagazineSrcs(magazine: Magazine): string[] {
  return magazine.pages.map((page) => page.src);
}

export function formatPriceFrom(uah: number): string {
  return `від ${priceFormatter.format(uah)} ₴`;
}
