import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { Plugin, ResolvedConfig } from 'vite';

const CATALOG_SUFFIX = '.catalog.webp';
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const SKIP_DIRS = new Set(['categories', 'top']);

export interface CatalogImagesPluginOptions {
  /** Max width for display-resolution catalog pages (2× ~600px viewer). */
  maxWidth?: number;
  webpQuality?: number;
  /** Relative to project root. Defaults to `public/images`. */
  sourceDir?: string;
}

async function collectSourceImages(rootDir: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentDir: string, relativeParts: string[]) {
    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const relativePath = [...relativeParts, entry.name];
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (relativeParts.length === 0 && SKIP_DIRS.has(entry.name)) continue;
        await walk(fullPath, relativePath);
        continue;
      }

      if (!entry.isFile()) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (!SOURCE_EXTENSIONS.has(ext)) continue;

      results.push(fullPath);
    }
  }

  await walk(rootDir, []);
  return results;
}

function catalogOutputPath(sourcePath: string): string {
  const parsed = path.parse(sourcePath);
  return path.join(parsed.dir, `${parsed.name}${CATALOG_SUFFIX}`);
}

async function optimizeCatalogImage(
  sourcePath: string,
  outputPath: string,
  maxWidth: number,
  webpQuality: number
): Promise<'created' | 'skipped' | 'unchanged'> {
  const sourceStat = await fs.stat(sourcePath);

  try {
    const outputStat = await fs.stat(outputPath);
    if (outputStat.mtimeMs >= sourceStat.mtimeMs) {
      return 'unchanged';
    }
  } catch {
    /* output missing — generate */
  }

  await sharp(sourcePath)
    .rotate()
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
    })
    .webp({ quality: webpQuality })
    .toFile(outputPath);

  return 'created';
}

async function optimizeCatalogImages(
  rootDir: string,
  maxWidth: number,
  webpQuality: number
): Promise<{ created: number; unchanged: number }> {
  const sources = await collectSourceImages(rootDir);
  let created = 0;
  let unchanged = 0;

  await Promise.all(
    sources.map(async (sourcePath) => {
      const outputPath = catalogOutputPath(sourcePath);
      const result = await optimizeCatalogImage(sourcePath, outputPath, maxWidth, webpQuality);
      if (result === 'created') created += 1;
      if (result === 'unchanged') unchanged += 1;
    })
  );

  return { created, unchanged };
}

export function catalogImagesPlugin(options: CatalogImagesPluginOptions = {}): Plugin {
  const maxWidth = options.maxWidth ?? 1200;
  const webpQuality = options.webpQuality ?? 82;
  const sourceDir = options.sourceDir ?? 'public/images';

  let resolvedRoot = process.cwd();
  let imagesDir = path.resolve(resolvedRoot, sourceDir);
  let runPromise: Promise<{ created: number; unchanged: number }> | null = null;

  const run = () => {
    if (!runPromise) {
      runPromise = optimizeCatalogImages(imagesDir, maxWidth, webpQuality).finally(() => {
        runPromise = null;
      });
    }
    return runPromise;
  };

  return {
    name: 'catalog-images',
    configResolved(config: ResolvedConfig) {
      resolvedRoot = config.root;
      imagesDir = path.resolve(resolvedRoot, sourceDir);
    },
    async buildStart() {
      const { created, unchanged } = await run();
      if (created > 0) {
        this.info(`catalog-images: generated ${created} WebP catalog page(s)`);
      } else {
        this.info(`catalog-images: ${unchanged} catalog page(s) up to date`);
      }
    },
    configureServer(server) {
      void run().then(({ created, unchanged }) => {
        if (created > 0) {
          server.config.logger.info(`catalog-images: generated ${created} WebP catalog page(s)`);
        } else {
          server.config.logger.info(`catalog-images: ${unchanged} catalog page(s) up to date`);
        }
      });

      server.watcher.add(imagesDir);
      server.watcher.on('add', (file) => {
        if (!file.startsWith(imagesDir)) return;
        const ext = path.extname(file).toLowerCase();
        if (!SOURCE_EXTENSIONS.has(ext)) return;
        void optimizeCatalogImage(file, catalogOutputPath(file), maxWidth, webpQuality);
      });
      server.watcher.on('change', (file) => {
        if (!file.startsWith(imagesDir)) return;
        const ext = path.extname(file).toLowerCase();
        if (!SOURCE_EXTENSIONS.has(ext)) return;
        void optimizeCatalogImage(file, catalogOutputPath(file), maxWidth, webpQuality);
      });
    },
  };
}
