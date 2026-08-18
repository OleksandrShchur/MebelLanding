import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const catalogsDir = path.join(rootDir, 'public', 'images', 'catalogs');
const manifestPath = path.join(rootDir, 'public', 'gallery-manifest.json');

const EMPTY_PAGE = {
  orientation: 'portrait',
  page: { width: 2528, height: 2528, spread: 'double' },
};

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

async function listEntries(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function isCatalogLeaf(dir) {
  const entries = await listEntries(dir);
  const subdirs = entries.filter((e) => e.isDirectory());
  const webps = entries.filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.webp'));

  if (webps.length > 0) return true;
  if (subdirs.length === 0) return true;
  return false;
}

async function discoverCatalogLeaves(dir, relativeParts = []) {
  const results = [];
  const entries = await listEntries(dir);

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

    const relativePath = [...relativeParts, entry.name];
    const fullPath = path.join(dir, entry.name);

    if (await isCatalogLeaf(fullPath)) {
      results.push({ relativePath: relativePath.join('/'), fullPath });
      continue;
    }

    results.push(...(await discoverCatalogLeaves(fullPath, relativePath)));
  }

  return results;
}

async function derivePageMetadata(firstImagePath) {
  if (!firstImagePath) return EMPTY_PAGE;

  const { width, height } = await sharp(firstImagePath).metadata();
  if (!width || !height) return EMPTY_PAGE;

  const isDoubleSpreadScan = width / height >= 1.5;
  const pageWidth = isDoubleSpreadScan ? Math.round(width / 2) : width;
  const pageHeight = height;

  return {
    orientation: pageHeight >= pageWidth ? 'portrait' : 'landscape',
    page: {
      width: pageWidth,
      height: pageHeight,
      spread: 'double',
    },
  };
}

async function loadExistingPriceBySrc() {
  try {
    const raw = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const priceBySrc = new Map();

    for (const magazines of Object.values(raw)) {
      if (!Array.isArray(magazines)) continue;

      for (const magazine of magazines) {
        const pages = Array.isArray(magazine.pages) ? magazine.pages : [];
        for (const page of pages) {
          if (
            page &&
            typeof page.src === 'string' &&
            typeof page.priceFrom === 'number' &&
            Number.isInteger(page.priceFrom) &&
            page.priceFrom > 0
          ) {
            priceBySrc.set(page.src, page.priceFrom);
          }
        }
      }
    }

    return priceBySrc;
  } catch {
    return new Map();
  }
}

function buildPages(srcs, priceBySrc) {
  return srcs.map((src) => {
    const priceFrom = priceBySrc.get(src);
    return priceFrom != null ? { src, priceFrom } : { src };
  });
}

async function buildMagazine(catalog, id, priceBySrc) {
  const entries = await listEntries(catalog.fullPath);
  const webps = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.webp'))
    .map((e) => e.name)
    .sort(naturalSort);

  const srcs = webps.map((name) => `/images/catalogs/${catalog.relativePath}/${name}`);
  const leafName = path.basename(catalog.relativePath);
  const firstImage = webps[0] ? path.join(catalog.fullPath, webps[0]) : null;
  const { orientation, page } = await derivePageMetadata(firstImage);

  return {
    id,
    name: leafName,
    orientation,
    page,
    pages: buildPages(srcs, priceBySrc),
  };
}

async function main() {
  const catalogs = await discoverCatalogLeaves(catalogsDir);
  catalogs.sort((a, b) => a.relativePath.localeCompare(b.relativePath, undefined, { sensitivity: 'base' }));
  const priceBySrc = await loadExistingPriceBySrc();

  const kitchens = [];
  for (let i = 0; i < catalogs.length; i += 1) {
    kitchens.push(await buildMagazine(catalogs[i], i + 1, priceBySrc));
  }

  const manifest = {
    wardrobes: [],
    sofas: [],
    kitchens,
    tablesAndChairs: [],
    beds: [],
    mattresses: [],
    kidsFurniture: [],
    dressersAndSideboards: [],
    livingRoom: [],
    office: [],
    bathroom: [],
  };

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${kitchens.length} catalog(s) to ${manifestPath}`);
}

await main();
