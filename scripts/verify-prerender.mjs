import { readFileSync, readdirSync } from 'node:fs';

const html = readFileSync('build/client/index.html', 'utf8');
const title = html.match(/<title>[^<]+<\/title>/);
console.log('title', title?.[0] ?? 'MISSING');
console.log('hero-title', html.includes('hero-title'));
console.log('kitchens id', html.includes('id="kitchens"'));
console.log('loaderData', html.includes('loaderData'));
console.log('terms title present', readFileSync('build/client/terms/index.html', 'utf8').includes('Умови використання'));
const files = readdirSync('build/client', { recursive: true });
console.log('build files', files.length);
console.log('under 20k limit', files.length < 20000);
