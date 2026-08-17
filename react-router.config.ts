import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Config } from '@react-router/dev/config';
import { categories } from './app/data/categories';

async function getCatalogPrerenderPaths(): Promise<string[]> {
  const manifestPath = path.join(process.cwd(), 'public', 'gallery-manifest.json');
  const raw = JSON.parse(await readFile(manifestPath, 'utf-8')) as Record<
    string,
    Array<{ id: number }>
  >;

  const paths: string[] = [];
  for (const category of categories) {
    const magazines = raw[category.id];
    if (!Array.isArray(magazines)) continue;
    for (const magazine of magazines) {
      if (typeof magazine?.id === 'number') {
        paths.push(`/catalog/${category.id}/${magazine.id}`);
      }
    }
  }
  return paths;
}

export default {
  ssr: false,
  async prerender({ getStaticPaths }) {
    const catalogPaths = await getCatalogPrerenderPaths();
    return [...getStaticPaths(), ...catalogPaths];
  },
} satisfies Config;
