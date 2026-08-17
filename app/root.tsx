import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import type { Route } from './+types/root';
import { isShopPath } from '~/lib/shopMeta';
import './index.css';

export const links: Route.LinksFunction = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Onest:wght@300;400;500;600&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration
          getKey={(location) => {
            // Keep scroll position when opening/closing the catalog modal.
            if (isShopPath(location.pathname)) return 'shop';
            return location.key;
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Помилка';
  let details = 'Сталася неочікувана помилка.';

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Помилка';
    details =
      error.status === 404
        ? 'Сторінку не знайдено.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16 font-sans text-mebel-text-strong">
      <h1 className="font-display text-4xl font-semibold">{message}</h1>
      <p className="mt-4 text-mebel-text">{details}</p>
    </main>
  );
}
