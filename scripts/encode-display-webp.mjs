import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const DEFAULT_INPUT = path.join(rootDir, 'public', 'images', 'catalogs');
const MAX_LONG_EDGE = 1600;
const QUALITY = 85;

async function listWebpsRecursive(dir) {
  const results = [];
  let entries = [];

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return results;
    }
    throw error;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listWebpsRecursive(fullPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.webp')) {
      results.push(fullPath);
    }
  }

  return results;
}

function parseArgs(argv) {
  const options = {
    input: DEFAULT_INPUT,
    output: DEFAULT_INPUT,
    maxEdge: MAX_LONG_EDGE,
    quality: QUALITY,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--input' && next) {
      options.input = path.resolve(next);
      i += 1;
    } else if (arg === '--output' && next) {
      options.output = path.resolve(next);
      i += 1;
    } else if (arg === '--max-edge' && next) {
      options.maxEdge = Number.parseInt(next, 10);
      i += 1;
    } else if (arg === '--quality' && next) {
      options.quality = Number.parseInt(next, 10);
      i += 1;
    }
  }

  return options;
}

async function encodeFile(src, dst, { maxEdge, quality }) {
  const image = sharp(src, { failOn: 'none' });
  const metadata = await image.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const longest = Math.max(width, height);

  let pipeline = image.rotate();
  if (longest > maxEdge) {
    pipeline = pipeline.resize({
      width: maxEdge,
      height: maxEdge,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const buffer = await pipeline.webp({ quality, effort: 6 }).toBuffer();
  await fs.mkdir(path.dirname(dst), { recursive: true });
  await fs.writeFile(dst, buffer);

  const encoded = await sharp(dst).metadata();
  const stats = await fs.stat(dst);

  return {
    width: encoded.width ?? 0,
    height: encoded.height ?? 0,
    bytes: stats.size,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!Number.isFinite(options.maxEdge) || options.maxEdge <= 0) {
    throw new Error('--max-edge must be a positive number');
  }
  if (!Number.isFinite(options.quality) || options.quality < 0 || options.quality > 100) {
    throw new Error('--quality must be between 0 and 100');
  }

  const files = await listWebpsRecursive(options.input);
  if (files.length === 0) {
    console.log(`No .webp files found in ${options.input}`);
    console.log('Copy catalogs into public/images/catalogs, or pass --input and --output.');
    return;
  }

  console.log(`Input : ${options.input}`);
  console.log(`Output: ${options.output}`);
  if (options.input === options.output) {
    console.log('Writing in place. Keep a backup of the original WebPs (e.g. D:\\mebel_optimized_2).');
  }
  console.log(`Max edge: ${options.maxEdge}px`);
  console.log(`Quality : ${options.quality}`);
  console.log(`Files   : ${files.length}`);

  const pad = String(files.length).length;

  for (let i = 0; i < files.length; i += 1) {
    const src = files[i];
    const relative = path.relative(options.input, src);
    const dst = path.join(options.output, relative);
    const result = await encodeFile(src, dst, options);
    console.log(
      `  OK  ${String(i + 1).padStart(pad)}/${files.length}  ${relative}  ` +
        `(${result.width}x${result.height}px, ${Math.floor(result.bytes / 1024)} KB)`
    );
  }

  console.log(`\nDone - ${files.length} image(s) encoded.`);
}

await main();
