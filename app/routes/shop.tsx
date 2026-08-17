import { Outlet, type ShouldRevalidateFunctionArgs } from 'react-router';
import type { Route } from './+types/shop';
import HomePage from '~/components/Home';
import { loadGalleryFromNetwork } from '~/lib/gallery';
import { loadGalleryFromDisk } from '~/lib/gallery.server';
import { getShopMeta, isShopPath } from '~/lib/shopMeta';

function catalogParamsFromPath(pathname: string): {
  category?: string;
  magazineId?: string;
} {
  const match = pathname.match(/^\/catalog\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return {};
  return { category: match[1], magazineId: match[2] };
}

export function meta({ loaderData, location }: Route.MetaArgs) {
  return getShopMeta(catalogParamsFromPath(location.pathname), loaderData);
}

export async function loader() {
  return loadGalleryFromDisk();
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  try {
    return await serverLoader();
  } catch {
    return loadGalleryFromNetwork();
  }
}
clientLoader.hydrate = true as const;

/** Keep gallery data stable across page flips and modal open/close. */
export function shouldRevalidate({
  currentUrl,
  nextUrl,
  formMethod,
}: ShouldRevalidateFunctionArgs) {
  if (formMethod && formMethod !== 'GET') {
    return true;
  }

  if (isShopPath(currentUrl.pathname) && isShopPath(nextUrl.pathname)) {
    return false;
  }

  return currentUrl.pathname !== nextUrl.pathname;
}

export default function ShopRoute({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <HomePage initialGallery={loaderData} />
      <Outlet />
    </>
  );
}
