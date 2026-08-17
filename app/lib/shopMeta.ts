import { categories } from '~/data/categories';
import {
  findMagazineByCategoryAndId,
  isValidCategory,
  isValidId,
  type GalleryLoaderData,
} from '~/lib/gallery';

const homeMeta = [
  { title: 'Магазин Mebel — бюджетні меблі в Івано-Франківську' },
  {
    name: 'description',
    content:
      'Магазин Mebel. Каталоги шаф, диванів, кухонь онлайн. Безкоштовна консультація, доставка та збірка.',
  },
  { name: 'robots', content: 'index, follow' },
  { property: 'og:type', content: 'website' },
  { property: 'og:locale', content: 'uk_UA' },
  { property: 'og:title', content: 'Магазин Mebel' },
  {
    property: 'og:description',
    content:
      'Переглядайте каталоги меблів онлайн. Безкоштовна консультація щодо цін та доставки.',
  },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'Магазин Mebel' },
  {
    name: 'twitter:description',
    content: 'Каталоги шаф, диванів, кухонь онлайн. Безкоштовна консультація.',
  },
];

export function getShopMeta(
  params: { category?: string; magazineId?: string },
  loaderData?: GalleryLoaderData
) {
  const categoryParam = params.category;
  const magazineIdParam = params.magazineId;

  if (!categoryParam && !magazineIdParam) {
    return homeMeta;
  }

  const categoryName =
    categoryParam && isValidCategory(categoryParam)
      ? categories.find((cat) => cat.id === categoryParam)?.name
      : undefined;

  let magazineName: string | undefined;
  if (
    loaderData?.data &&
    categoryParam &&
    magazineIdParam &&
    isValidCategory(categoryParam) &&
    isValidId(magazineIdParam)
  ) {
    magazineName =
      findMagazineByCategoryAndId(
        loaderData.data,
        categoryParam,
        Number.parseInt(magazineIdParam, 10)
      )?.name ?? undefined;
  }

  const title = magazineName
    ? `${magazineName}${categoryName ? ` — ${categoryName}` : ''} | Магазин Mebel`
    : 'Каталог | Магазин Mebel';

  return [
    { title },
    {
      name: 'description',
      content:
        'Переглядайте каталог меблів онлайн. Безкоштовна консультація щодо цін та доставки.',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: title },
  ];
}

export function isShopPath(pathname: string): boolean {
  return pathname === '/' || pathname.startsWith('/catalog/');
}
