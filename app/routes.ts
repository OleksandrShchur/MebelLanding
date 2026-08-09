import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  route('', 'routes/layout.tsx', [
    route('', 'routes/shop.tsx', [
      index('routes/shop.index.tsx'),
      route('catalog/:category/:magazineId', 'routes/shop.catalog.tsx'),
    ]),
    route('terms', 'routes/terms.tsx'),
  ]),
] satisfies RouteConfig;
